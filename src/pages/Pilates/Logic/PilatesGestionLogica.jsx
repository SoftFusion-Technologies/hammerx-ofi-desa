import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import useConsultaDB from '../ConsultaDb/Consulta';
import useInsertClientePilates from '../ConsultaDb/Insertar_ModificarCliente';
import useDeleteClientePilates from '../ConsultaDb/Eliminar';
import useInsertDataListaEspera from '../ConsultaDb/InsertarListaEspera';
import useUpdateDataListaEspera from '../ConsultaDb/ModificarListaEspera';
import useDeleteListaEspera from '../ConsultaDb/EliminarListaEspera';
import useInsertar from '../ConsultaDb/Insertar';
import sweetalert2 from 'sweetalert2';
import useModify from '../ConsultaDb/Modificar';
import ObtenerFechaInternet from '../utils/ObtenerFechaInternet';
import { useAuth } from '../../../AuthContext';
import { format, set } from 'date-fns';
import { FaPencilAlt } from 'react-icons/fa';

import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
const PilatesGestionLogica = () => {
  // --- Estados de Datos Principales ---
  const [schedule, setSchedule] = useState([]); // Almacena el horario completo de la grilla con sus alumnos.
  const [waitingList, setWaitingList] = useState([]); // Guarda la lista de espera normalizada para la vista.
  const [ausentesAlumnos, setAusentesAlumnos] = useState([]); // Contiene la lista formateada de alumnos con muchas inasistencias.
  const [asistenciaPruebasMap, setAsistenciaPruebasMap] = useState({}); // Objeto para consulta rápida (`{ id: true/false }`) del estado de asistencia de las clases de prueba.

  // --- Estados de Configuración y Filtros ---
  const [section, setSection] = useState('GESTION'); // Controla la vista actual ('GESTION' o 'LISTA_ESPERA').
  const [sedeActualFiltro, setSedeActualFiltro] = useState(); // Guarda el ID de la sede seleccionada para filtrar los datos.
  const [cupoMaximoPilates, setCupoMaximoPilates] = useState(0); // Almacena el cupo máximo de la sede actual.
  const [searchTerm, setSearchTerm] = useState(''); // Guarda el texto del campo de búsqueda para filtrar alumnos en la grilla.
  const [fechaHoy, setFechaHoy] = useState(null); // Almacena la fecha actual obtenida de una API externa.

  // --- Estados para Controlar la Interfaz (Modales, Paneles) ---
  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal principal para agregar/editar alumnos.
  const [isModalProfesorOpen, setIsModalProfesorOpen] = useState(false); // Controla la visibilidad del modal para asignar profesores.
  const [isModalDetalleAusentes, setIsModalDetalleAusentes] = useState(false); // Controla la visibilidad del modal que muestra los alumnos ausentes.
  const [isModalAyuda, setIsModalAyuda] = useState(false); // Controla la visibilidad del modal de ayuda.
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Controla la visibilidad del modal para confirmar e inscribir desde la lista de espera.
  const [contactarAlumno, setcontactarAlumno] = useState(false); // Estado interno del modal de ausentes para mostrar opciones de contacto.
  const [visiblePanels, setVisiblePanels] = useState({
    // Controla qué paneles de resumen rápido son visibles.
    freeSlots: true,
    expiredStudents: true,
    absentStudents: true,
    waitingListMatches: true
  });

  // --- Estados para Datos Temporales de Interacción ---
  const [currentCell, setCurrentCell] = useState(null); // Guarda la información de la celda de la grilla que fue clickeada.
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null); // Almacena los datos del horario seleccionado para editar su profesor.
  const [personToConfirm, setPersonToConfirm] = useState(null); // Guarda los datos de la persona de la lista de espera que se va a inscribir.
  const [tipoInscripcionListaEspera, setTipoInscripcionListaEspera] = useState(null); // Guarda el tipo de inscripción (cambio o espera).

  // --- Refs ---
  const refSedeUsuario = useRef(null); // Referencia para un elemento del DOM, probablemente un input.

  // --- Hooks Externos y de Contexto ---
  const { fecha } = ObtenerFechaInternet(); // Hook que trae la fecha actual desde una API para evitar desajustes de hora locales.
  const { userId, sedeName, userLevel } = useAuth(); // Hook que obtiene el ID y nombre de la sede del usuario logueado.

  // --- Constantes y Variables Derivadas ---
  const rol = 'GESTION'; // Define el rol del usuario para lógicas condicionales en la vista.
  const fechaParaConsulta = fechaHoy || format(new Date(), 'yyyy-MM-dd'); // Determina la fecha a usar en las consultas, priorizando la de la API externa.

  // ----------------------------------------------------------------
  // --- HOOKS DE PETICIONES A LA API ---
  // ----------------------------------------------------------------

  // --- Hooks de Consulta de Datos (GET) ---
  const { data: horariosData, refetch } = useConsultaDB(
    // Trae los horarios y alumnos para construir la grilla principal. Se activa cuando 'sedeActualFiltro' cambia.
    sedeActualFiltro
      ? `/clientes-pilates/horarios?sedeId=${sedeActualFiltro}`
      : null
  );
  const { data: listaEsperaData, refetch: refetchListaEspera } = useConsultaDB(
    // Trae los datos de la lista de espera para la sede seleccionada.
    sedeActualFiltro ? `/lista-espera-pilates?sedeId=${sedeActualFiltro}` : null
  );
  const { data: ausentesData, refetch: refetchAusentes } = useConsultaDB(
    // Trae el reporte de alumnos con inasistencias en el mes actual.
    sedeActualFiltro && fechaParaConsulta
      ? `/asistencias-pilates/ausencias-mensuales?id_sede=${sedeActualFiltro}&fecha=${fechaParaConsulta}`
      : null
  );
  const { data: reporteAsistenciaData, refetch: refetchReporteAsistencia } =
    useConsultaDB(
      // Trae el reporte de asistencia de las clases de prueba.
      '/asistencias-pilates/reportes/asistencia-clases-prueba'
    );
  const { data: instructoresData } = useConsultaDB(`/usuarios-pilates/nombres`); // Trae la lista de todos los instructores disponibles.
  const { data: sedesData } = useConsultaDB(`/sedes/ciudad`); // Trae la lista de todas las sedes que tienen Pilates.

  // --- Hooks de Inserción (POST) ---
  const { insertCliente } = useInsertClientePilates(); // Hook para crear un nuevo cliente y su inscripción asociada.
  const { insert: insertarContactoListaEspera } = useInsertDataListaEspera(
    // Hook para registrar un nuevo contacto en la lista de espera.
    '/contactos-lista-espera'
  );
  const { insert: insertarListaEspera } = useInsertDataListaEspera(
    // Hook para agregar una nueva persona a la tabla de lista de espera.
    '/lista-espera-pilates'
  );
  const { insert: insertarHorario } = useInsertar(
    // Hook para asignar o cambiar el instructor de un horario específico.
    '/horarios-pilates/cambiar-instructor'
  );

  // --- Hooks de Actualización (PUT / PATCH) ---
  const { update: planAContratadoPeticion } = useModify(
    // Hook para manejar las transiciones de estado de un plan (ej: de programado a contratado).
    '/clientes-pilates/plan-renovacion'
  );
  const { update: modificarAlumnoContactado } = useModify(
    // Hook para marcar a un alumno como contactado por inasistencias.
    '/clientes-pilates/contactar'
  );
  const { update: modificarContactoListaEspera } = useModify(
    // Hook para actualizar el estado de un contacto en la lista de espera (pendiente, confirmado, etc.).
    '/contactos-lista-espera'
  );
  const { update } = useUpdateDataListaEspera('/lista-espera-pilates'); // Hook para modificar los datos de una persona en la lista de espera.
  const { update: guardarAuditoria } = useModify(
    // Hook para crear o actualizar el registro de auditoría cuando se modifica una fecha de fin manualmente.
    '/auditoria-pilates/cliente'
  );
  const { update: guardarCambioDeTurno } = useModify(
    // Hook para actualizar cuando un alumno cambia de turno desde la lista de espera.
    '/inscripciones-pilates/cambiar-turno', true
  );

  // --- Hooks de Eliminación (DELETE) ---
  const { deleteCliente } = useDeleteClientePilates(); // Hook para eliminar un cliente y todos sus datos asociados.
  const { remove } = useDeleteListaEspera('/lista-espera-pilates'); // Hook para eliminar a una persona de la lista de espera.

  /**
   * EFFECT: Normaliza los datos de horarios de la API
   * Convierte las claves de horarios (ej: "MIERCOLES" -> "MIÉRCOLES")
   * y estructura los datos en formato normalizado para la grilla de horarios.
   */
  useEffect(() => {
    if (horariosData && Object.keys(horariosData).length > 0) {
      const normalizedData = {};
      Object.keys(horariosData).forEach((key) => {
        const normalizedKey = key.replace('MIERCOLES', 'MIÉRCOLES');
        normalizedData[normalizedKey] = {
          coach: horariosData[key].coach || '',
          horarioId: horariosData[key].horarioId || null,
          coachId: horariosData[key].coachId || null,
          alumnos: Array.isArray(horariosData[key].alumnos)
            ? horariosData[key].alumnos
            : []
        };
        console.log(normalizedData)
        setSchedule(normalizedData);
      });
    }
  }, [horariosData, sedeActualFiltro]);

  /**
   * EFFECT: Normaliza los datos de lista de espera de la API
   * Transforma los datos raw en un formato estructurado con campos normalizados.
   * Incluye información de contacto y estado de cada persona en la lista.
   * Se ejecuta cuando cambian los datos de lista de espera o la sede seleccionada.
   */
  useEffect(() => {
    if (
      listaEsperaData &&
      Array.isArray(listaEsperaData) &&
      listaEsperaData.length > 0
    ) {
      const listaEsperaNormalizada = listaEsperaData.map((item) => ({
        id: item.id,
        name: item.nombre,
        type: item.tipo.toLowerCase().includes('cambio') ? 'cambio' : 'espera',
        contact: item.contacto,
        nombre_usuario_cargado: item.nombre_usuario_cargado,
        plan: item.plan_interes,
        hours: item.horarios_preferidos
          ? item.horarios_preferidos.split(',').map((h) => h.trim())
          : [],
        obs: item.observaciones,
        date: item.fecha_carga ? item.fecha_carga.split('T')[0] : '',
        hour: item.fecha_carga
          ? item.fecha_carga.split('T')[1].split('.')[0]
          : '',

        // CORRECCIÓN: Se añade la comprobación '&& item.contacto_cliente.length > 0'
        contacto_cliente:
          item.contacto_cliente && item.contacto_cliente.length > 0
            ? {
                id_contacto: item.contacto_cliente[0].id,
                id_lista_espera: item.contacto_cliente[0].id_lista_espera,
                id_usuario_contacto:
                  item.contacto_cliente[0].id_usuario_contacto,
                fecha_contacto: item.contacto_cliente[0].fecha_contacto,
                estado_contacto: item.contacto_cliente[0].estado_contacto,
                notas: item.contacto_cliente[0].notas,
                usuario_contacto_nombre:
                  item.contacto_cliente[0].nombre_usuario_contacto
              }
            : null // Si el array está vacío o no existe, asignamos null
      }));
      setWaitingList(listaEsperaNormalizada);
    } else {
      setWaitingList([]);
    }
  }, [listaEsperaData, sedeActualFiltro]);

  /**
   * EFFECT: Inicializa la sede actual al cargar las sedes disponibles
   * Se ejecuta una sola vez cuando los datos de sedes se cargan desde la API.
   * Asigna automáticamente la primera sede como sede activa.
   */
  useEffect(() => {
    if (sedesData && Array.isArray(sedesData) && sedesData.length > 0) {
      if (sedesData[0].id) {
        setSedeActualFiltro(String(sedesData[0].id));
      }
    }
  }, [sedesData]);

  /**
   * EFFECT: Actualiza el cupo máximo de Pilates cuando cambia la sede seleccionada
   * Filtra la información de la sede actual y extrae su cupo máximo permitido.
   * Se ejecuta cada vez que el usuario cambia de sede.
   */
  useEffect(() => {
    if (sedesData && Array.isArray(sedesData) && sedesData.length > 0) {
      const resultado = sedesData.filter(
        (sede) => String(sede.id) === sedeActualFiltro
      );
      setCupoMaximoPilates(resultado[0].cupo_maximo_pilates);
    }
  }, [sedeActualFiltro]);

  /**
   * EFFECT: Normaliza los datos de asistencia de clases de prueba
   * Convierte el array de asistencias en un mapa (diccionario) para búsqueda O(1).
   * Permite verificar rápidamente si un alumno asistió a su clase de prueba.
   */
  useEffect(() => {
    if (reporteAsistenciaData && Array.isArray(reporteAsistenciaData)) {
      const newMap = reporteAsistenciaData.reduce((map, alumno) => {
        map[alumno.id_cliente] = alumno.asistio;
        return map;
      }, {});
      setAsistenciaPruebasMap(newMap);
    }
  }, [reporteAsistenciaData]);

  /**
   * EFFECT: Normaliza los datos de alumnos ausentes del mes actual
   * Filtra solo a alumnos con 7 o más inasistencias y los formatea para la vista.
   * Incluye información de contacto y si ya fueron contactados.
   */
  useEffect(() => {
    if (ausentesData && ausentesData.length > 0) {
      // Formatear los datos para el estado ausentesAlumnos
      const formatear = ausentesData
        .filter((alumno) => alumno.cantidad_ausentes >= 7)
        .map((alumno) => ({
          id: alumno.id,
          name: alumno.nombre,
          cantidad: alumno.cantidad_ausentes,
          contacto: alumno.telefono,
          contactado: alumno.contactado ? 'SI' : 'NO',
          fecha_ultimo_contacto: alumno.fecha_contacto || 'N/A',
          contacto_nombre: alumno.contacto_usuario_nombre || 'N/A'
        }));
      setAusentesAlumnos(formatear);
    }
  }, [ausentesData]);

  /**
   * EFFECT: Sincroniza el estado del modal de contacto con el modal de ausentes
   * Cuando se cierra el modal de detalle de ausentes, también cierra el formulario de contacto.
   * Evita que el modal de contacto quede abierto con datos null/undefined.
   */
  useEffect(() => {
    if (!isModalDetalleAusentes) {
      setcontactarAlumno(false);
    }
  }, [isModalDetalleAusentes]);

  /**
   * EFFECT: Sincroniza la fecha obtenida de la API externa con el estado local
   * Recibe la fecha desde un servicio externo para evitar desajustes de zona horaria.
   * Se ejecuta cada vez que la fecha externa cambia (generalmente una sola vez al cargar).
   */
  useEffect(() => {
    if (fecha) {
      setFechaHoy(fecha);
    }
  }, [fecha]);

  /**
   * EFFECT: Sincroniza el nombre de la sede actual con el contexto autenticado
   * Cuando cambia el nombre de la sede en el contexto, actualiza el filtro de sede actual.
   */
  useEffect(() => {
    if (!sedesData || !Array.isArray(sedesData) || sedesData.length === 0)
      return;

    // Normalizamos el nombre de la sede del usuario para comparaciones
    const sedeUser = String(sedeName || '')
      .trim()
      .toLowerCase();

    // Si el usuario es 'multisede', seleccionamos por defecto la primera sede disponible
    if (sedeUser === 'multisede') {
      if (sedesData[0] && (sedesData[0].id || sedesData[0].id === 0)) {
        setSedeActualFiltro(String(sedesData[0].id));
      }
      return;
    }

    if (sedeName) {
      const sedeEncontrada = sedesData.find(
        (sede) =>
          String(sede.nombre || '')
            .trim()
            .toLowerCase() === sedeUser
      );

      if (sedeEncontrada && (sedeEncontrada.id || sedeEncontrada.id === 0)) {
        setSedeActualFiltro(String(sedeEncontrada.id));
      } else {
        // No se encontró match: dejamos la sede por defecto (primera) y logueamos para depuración
        if (sedesData[0] && (sedesData[0].id || sedesData[0].id === 0)) {
          setSedeActualFiltro(String(sedesData[0].id));
        }
        console.warn(
          `No se encontró sede para sedeName='${sedeName}'. Se seleccionó la primera sede por defecto.`
        );
      }
    }
  }, [sedeName, sedesData]);

  /**
   * UTILITY FUNCTION: Normaliza texto removiendo acentos y caracteres especiales
   * Convierte a minúsculas, elimina espacios extras y normaliza caracteres diacríticos.
   * Útil para comparaciones case-insensitive y sin acentos (ej: búsquedas).
   */
  const normalizarTexto = (valor) =>
    (valor ?? '')
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();

  /**
   * COMPUTED VALUE (useMemo): Verifica si el usuario puede editar la sede actual
   * Compara el nombre de la sede seleccionada con la sede del usuario autenticado.
   * Retorna true solo si coinciden (permitiendo edición), false si no hay permisos.
   */
  const puedeEditarSede = useMemo(() => {
    // Permitir edición global si el usuario es 'admin' o si su sedeName es 'multisede'
    const nivel = String(userLevel || '').toLowerCase();
    const sedeLower = String(sedeName || '').toLowerCase();
    if (nivel === 'admin' || sedeLower === 'multisede') return true;

    if (!sedeActualFiltro || !Array.isArray(sedesData) || !sedeName)
      return false;
    const sedeSeleccionada = sedesData.find(
      (sede) => String(sede.id) === String(sedeActualFiltro)
    );
    if (!sedeSeleccionada) return false;
    const nombreSedeSeleccionada =
      sedeSeleccionada.nombre ||
      sedeSeleccionada.ciudad ||
      sedeSeleccionada.sede ||
      '';
    return (
      normalizarTexto(nombreSedeSeleccionada) === normalizarTexto(sedeName)
    );
  }, [sedeActualFiltro, sedesData, sedeName, userLevel]);

  /**
   * UTILITY FUNCTION: Muestra un alert de error cuando faltan permisos de edición
   * Notifica al usuario que no tiene permisos para realizar la acción en esa sede.
   */
  const mostrarErrorPermisos = () =>
    sweetalert2.fire({
      icon: 'error',
      title: 'Acceso denegado',
      text: 'No tenés permisos para editar esta sede.',
      timer: 2000,
      showConfirmButton: false
    });

  /**
   * FUNCTION: Completa el proceso de inscripción de un alumno desde la lista de espera
   * Actualiza el estado del contacto en la lista de espera a "Confirmado".
   * Se ejecuta después de que el alumno es inscrito exitosamente en un horario.
   * @param {number} listaEsperaId - ID del registro en la lista de espera
   */
  const handleConfirmationComplete = async (listaEsperaId) => {
    try {
      const datosParaEnviar = {
        estado_contacto: 'Confirmado',
        id_usuario_contacto: userId,
        notas: 'Contacto confirmado'
      };
      // Llama al hook que actualiza el estado del contacto
      await modificarContactoListaEspera(listaEsperaId, datosParaEnviar);
    } catch (error) {
      console.error("Error al actualizar el estado a 'Confirmado':", error);
      await sweetalert2.fire({
        icon: 'error',
        title: 'Paso final fallido',
        text: 'El alumno fue inscrito, pero no se pudo actualizar su estado en la lista de espera.'
      });
    } finally {
      // Refresca la lista de espera para que el cambio se vea reflejado.
      refetchListaEspera();
    }
  };

  /**
   * FUNCTION: Cambia el estado de contacto de un alumno en la lista de espera
   * Permite marcar como: pendiente, confirmado o rechazado/sin respuesta.
   * Incluye confirmación del usuario y actualización en la base de datos.
   * @param {number} id - ID del registro en la lista de espera
   * @param {string} tipo - Tipo de estado: "pendiente", "confirmado", "rechazado"
   */
  const marcarEstadosAlumnoListaEspera = async (id, tipo) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }
    try {
      if (tipo === 'pendiente') {
        const confirm = await sweetalert2.fire({
          title: '¿Está seguro que quiere marcar como pendiente?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, marcar como pendiente',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });
        if (!confirm.isConfirmed) return;
        const datosParaEnviar = {
          id_lista_espera: id,
          estado_contacto: 'Pendiente',
          notas: 'Pendiente de contacto',
          id_usuario_contacto: userId
        };
        try {
          await insertarContactoListaEspera(datosParaEnviar);
          await sweetalert2.fire({
            icon: 'success',
            title: 'Marcado como pendiente',
            text: 'El estado se marcó correctamente.',
            timer: 1800,
            showConfirmButton: false
          });
        } catch (error) {
          await sweetalert2.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha producido un error.',
            timer: 1800,
            showConfirmButton: false
          });
          console.error(error);
        } finally {
          refetchListaEspera();
        }
      } else if (tipo === 'confirmado') {
        const persona = waitingList.find((p) => p.id === id);
        if (persona) {
          setPersonToConfirm(persona); // Guarda los datos de la persona a confirmar.
          setTipoInscripcionListaEspera(persona.type); // Guarda el tipo de inscripción (cambio o espera).
          setIsConfirmModalOpen(true); // Abre el modal de inscripción.
        } else {
          await sweetalert2.fire(
            'Error',
            'No se pudo encontrar a la persona seleccionada.',
            'error'
          );
        }
      } else if (tipo === 'rechazado') {
        const confirm = await sweetalert2.fire({
          title: '¿Está seguro que quiere marcar como rechazado/sin respuesta?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, marcar como rechazado/sin respuesta',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });
        if (!confirm.isConfirmed) return;
        try {
          const datosParaEnviar = {
            estado_contacto: 'Rechazado/Sin Respuesta',
            id_usuario_contacto: userId,
            notas: 'Contacto rechazado o sin respuesta'
          };
          await modificarContactoListaEspera(id, datosParaEnviar);
          await sweetalert2.fire({
            icon: 'success',
            title: 'Marcado como rechazado/sin respuesta',
            text: 'El estado se marcó correctamente.',
            timer: 1800,
            showConfirmButton: false
          });
        } catch (error) {
          await sweetalert2.fire({
            icon: 'error',
            title: 'Error',
            text: 'Se ha producido un error.',
            timer: 1800,
            showConfirmButton: false
          });
          console.error(error);
        } finally {
          refetchListaEspera();
        }
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error',
        text: 'Se ha producido un error.',
        timer: 1800,
        showConfirmButton: false
      });
      console.error(error);
    }
  };

  /**
   * FUNCTION: Cambia la sección/pestaña visible en la interfaz
   * Permite alternar entre vistas: "GESTION" o "LISTA_ESPERA".
   * @param {string} newSection - Nombre de la nueva sección a mostrar
   */
  const handleSectionChange = (newSection) => {
    setSection(newSection);
  };

  /**
   * FUNCTION: Alterna la visibilidad de los paneles de resumen rápido
   * Permite mostrar/ocultar: cupos libres, alumnos vencidos, ausentes, coincidencias de espera.
   * @param {string} panelName - Nombre del panel a alternar
   */
  const handlePanelToggle = (panelName) => {
    setVisiblePanels((prevPanels) => ({
      ...prevPanels,
      [panelName]: !prevPanels[panelName]
    }));
  };

  /**
   * FUNCTION: Cuenta cuántas clases de prueba hay en otros días del mismo grupo horario
   * Agrupa los días en: L-M-V (lunes, miércoles, viernes) y M-J (martes, jueves).
   * Usado para calcular cupos disponibles evitando sobrecargar un grupo horario.
   * @param {string} day - Día de la semana (ej: "LUNES")
   * @param {string} hour - Hora del horario (ej: "09:00")
   * @returns {number} Cantidad de clases de prueba en otros días del grupo
   */
  const countTrialsInOtherDaysOfGroup = (day, hour) => {
    const lmv = ['LUNES', 'MIÉRCOLES', 'VIERNES'];
    const mj = ['MARTES', 'JUEVES'];
    let group = [];
    if (lmv.includes(day)) group = lmv;
    if (mj.includes(day)) group = mj;
    if (group.length === 0) return 0;

    // Contar clases de prueba en otros días del grupo (no en el día actual)
    let totalTrials = 0;
    group.forEach((d) => {
      if (d !== day) {
        // Solo contar otros días, no el día actual
        const students = schedule[`${d}-${hour}`]?.alumnos || [];
        const trialsInDay = students.filter(
          (s) => s.status === 'prueba'
        ).length;
        totalTrials += trialsInDay;
      }
    });

    return totalTrials;
  };

  /**
   * FUNCTION: Abre el modal para asignar o cambiar el instructor de un horario
   * Obtiene los datos del instructor actual (si existe) y prepara el modal de edición.
   * Verifica permisos antes de permitir la acción.
   * @param {string} day - Día de la semana
   * @param {string} hour - Hora del horario
   */
  const handleOpenModalProfesor = (day, hour) => {
    if (!puedeEditarSede) {
      mostrarErrorPermisos();
      return;
    }
    const key = `${day}-${hour}`;
    const cellData = schedule[key] || {};
    const coachName = cellData.coach || '';
    const instructorObj = instructoresData?.find(
      (i) => i.nombre_completo === coachName
    );
    setHorarioSeleccionado({
      day,
      hour,
      instructorId: instructorObj ? instructorObj.id : '',
      instructorName: coachName
    });
    setIsModalProfesorOpen(true);
  };

  /**
   * FUNCTION: Abre el modal que muestra el detalle de alumnos ausentes
   * Simplemente activa el estado del modal para mostrar la lista de ausentes.
   */
  const handleOpenModalDetalleAusentes = () => {
    setIsModalDetalleAusentes(true);
  };

  /**
   * FUNCTION: Guarda el instructor asignado a un horario específico
   * Envía los datos del instructor al backend y actualiza la grilla.
   * Incluye confirmación del usuario y manejo de errores.
   * @param {object} nuevoHorario - Datos del nuevo horario con instructor
   */
  const handleSaveInstructor = async (nuevoHorario) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }
    const datosParaGuardar = {
      dia_semana: nuevoHorario.day,
      hora_inicio: nuevoHorario.hour,
      id_instructor: nuevoHorario.instructorId,
      id_sede: Number(sedeActualFiltro)
    };

    try {
      await insertarHorario(datosParaGuardar);
      await sweetalert2.fire({
        icon: 'success',
        title: 'Instructor asignado',
        text: `El instructor fue asignado correctamente al horario ${nuevoHorario.day} ${nuevoHorario.hour}.`,
        timer: 1800,
        showConfirmButton: false
      });
      setIsModalProfesorOpen(false);
      refetch();
    } catch (error) {
      console.error('Error al guardar el instructor:', error);
    }
  };

  /**
   * FUNCTION: Agregar, modificar o eliminar una persona en la lista de espera
   * Maneja las tres operaciones CRUD (Create, Read, Update, Delete) para la lista de espera.
   * Incluye confirmación del usuario y validación de datos.
   * @param {number} id - ID del registro (null si es agregar)
   * @param {object} personData - Datos de la persona (null si es eliminar)
   */
  const handleUpdateWaitingList = async (id, personData) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }
    try {
      if (personData === null) {
        const confirm = await sweetalert2.fire({
          title: '¿Seguro que deseas eliminar a esta persona?',
          text: 'Se eliminará toda la información asociada a esta persona de la lista de espera.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });
        if (!confirm.isConfirmed) return;

        await remove(id);
        await sweetalert2.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La persona fue eliminada correctamente de la lista de espera.',
          timer: 1800,
          showConfirmButton: false
        });
      } else {
        const objetoParaBackend = {
          nombre: personData.name,
          contacto: personData.contact,
          tipo: personData.type === 'cambio' ? 'Cambio de turno' : 'Espera',
          plan_interes: personData.plan,
          horarios_preferidos: personData.hours.join(','),
          observaciones: personData.obs,
          id_sede: sedeActualFiltro,
          id_usuario_cargado: userId
        };

        if (id) {
          const confirm = await sweetalert2.fire({
            title: `¿Modificar datos de ${personData.name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, modificar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
          });
          if (!confirm.isConfirmed) return;
          await update(id, objetoParaBackend);
          await sweetalert2.fire({
            icon: 'success',
            title: 'Modificado',
            text: 'La persona fue modificada correctamente en la lista de espera.',
            timer: 1800,
            showConfirmButton: false
          });
        } else {
          await insertarListaEspera(objetoParaBackend);
          await sweetalert2.fire({
            icon: 'success',
            title: 'Agregado',
            text: 'La persona fue agregada correctamente a la lista de espera.',
            timer: 1800,
            showConfirmButton: false
          });
        }
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al actualizar la lista de espera.'
      });
      console.error('Error en handleUpdateWaitingList:', error);
    } finally {
      refetchListaEspera();
    }
  };

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 * No necesitas entender cómo funciona por dentro, solo saber que
 * devuelve un número que representa qué tan diferentes son.
 */
function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
        matrix[0][i] = i;
    }
    for (let j = 0; j <= b.length; j++) {
        matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,      // Deletion
                matrix[j - 1][i] + 1,      // Insertion
                matrix[j - 1][i - 1] + cost // Substitution
            );
        }
    }

    return matrix[b.length][a.length];
}

// FUNCTION: Encuentra un alumno y sus horarios viejo y nuevo por nombre aproximado
const encontrarAlumnoYHorario = useCallback((nombreBuscado, keyHorarioNuevo) => {
    // 1. Validaciones iniciales de los parámetros.
    if (!nombreBuscado || !keyHorarioNuevo) return null;
    
    // Define cuántos errores de tipeo se permiten en la búsqueda.
    const UMBRAL_DE_SIMILITUD = 3;

    // 2. Busca el ID del horario NUEVO usando la key que pasaste.
    const horarioNuevoInfo = schedule[keyHorarioNuevo];
    const horarioIdNuevo = horarioNuevoInfo ? horarioNuevoInfo.horarioId : null;

    // Si la key del nuevo horario no existe en la grilla, no podemos continuar.
    if (horarioIdNuevo === null) {
        console.error(`La clave del horario nuevo "${keyHorarioNuevo}" no fue encontrada en el objeto 'schedule'.`);
        return null;
    }

    // 3. Recorre todos los horarios para encontrar al alumno y su horario VIEJO.
    const listaDeHorarios = Object.values(schedule);
    for (const horario of listaDeHorarios) {
        
        // 4. Busca al alumno por su nombre con una coincidencia aproximada.
        const alumnoEncontrado = horario.alumnos.find(alumno => {
            const distancia = levenshteinDistance(
                alumno.name.toLowerCase(), 
                nombreBuscado.toLowerCase()
            );
            // Si la diferencia de letras es pequeña, lo consideramos una coincidencia.
            return distancia <= UMBRAL_DE_SIMILITUD;
        });

        // 5. Si encontramos al alumno, armamos y devolvemos el objeto con los tres IDs.
        if (alumnoEncontrado) {
            return {
                idEstudiante: alumnoEncontrado.id,     // ID del alumno
                idHorarioAnterior: horario.horarioId,   // ID del horario donde estaba (viejo)
                idHorarioNuevo: horarioIdNuevo       // ID del horario al que se va a mover (nuevo)
            };
        }
    }

    // 6. Si el bucle termina, significa que el alumno no fue encontrado en ningún horario.
    return null;

}, [schedule]); // La única dependencia de esta función es el estado 'schedule'.

  /**
   * FUNCTION: Abre el modal para agregar o editar un alumno en un horario específico
   * Valida que haya cupos disponibles antes de permitir agregar nuevos alumnos.
   * Prepara los datos de la celda clickeada para pasarlos al modal.
   * @param {string} day - Día de la semana
   * @param {string} time - Hora del horario
   * @param {object} studentToEdit - Alumno a editar (null si es agregar nuevo)
   */
  const handleCellClick = (day, time, studentToEdit = null) => {
    if (!puedeEditarSede) {
      mostrarErrorPermisos();
      return;
    }
    const key = `${day}-${time}`;
    const studentsInSlot = schedule[key]?.alumnos || [];
    if (!studentToEdit && studentsInSlot.length >= 10) {
      alert(`Este turno ya está completo (10/10).`);
      return;
    }

    setCurrentCell({ key, day, time, student: studentToEdit });
    setIsModalOpen(true);
  };

  /**
   * FUNCTION: Valida si el nombre de un alumno ya existe en otro horario
   * Evita duplicados en la grilla de horarios (comparación sin acentos).
   * Muestra alerta al usuario si detecta duplicados.
   * @param {object} studentData - Datos del alumno a validar
   * @param {string} accion - Acción a realizar: "agregar" o "modificar"
   * @returns {boolean} true si hay duplicado, false si es válido
   */
  const validateNameDuplicates = async (studentData, accion) => {
    const removeAccents = (str) =>
      (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toUpperCase();

    const allStudents = Object.values(schedule)
      .map((cell) => cell.alumnos || [])
      .flat();
    const nombreIngresado = removeAccents(studentData.name);
    const yaExiste = allStudents.some(
      (s) =>
        removeAccents(s.name) === nombreIngresado &&
        (accion === 'agregar' ||
          (accion === 'modificar' && s.id !== studentData.id))
    );

    if (yaExiste) {
      await sweetalert2.fire({
        icon: 'warning',
        title: 'Nombre duplicado',
        text:
          accion === 'agregar'
            ? `¡Alerta! El alumno ${studentData.name} ya existe en otro horario. No se puede crear un duplicado.`
            : `¡Alerta! Ya existe otro alumno con el nombre ${studentData.name}. No se puede modificar a un nombre duplicado.`,
        confirmButtonText: 'Aceptar'
      });
      return true;
    }
    return false;
  };

  /**
   * FUNCTION: Agregar, modificar o eliminar un alumno en la grilla y base de datos
   * Maneja la lógica completa de guardado de alumnos incluyendo validaciones,
   * auditoría, cambios de estado de planes y actualización de datos.
   * @param {string} key - Clave del horario en formato "DIA-HORA"
   * @param {object} studentData - Datos del alumno a guardar
   * @param {string} accion - Acción: "agregar", "modificar", "eliminar"
   * @param {string} planAContratado - Tipo de cambio de plan (ej: "De plan a programado")
   */
  const handleSaveStudent = async (
    key,
    studentData,
    accion,
    planAContratado
  ) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }

    // Validar duplicados solo si no es un cambio desde lista de espera
    if (tipoInscripcionListaEspera != 'cambio') {
      const tieneDuplicado = await validateNameDuplicates(studentData, accion);
      if (tieneDuplicado) throw new Error('Nombre duplicado detectado.');
    }
    try {
      if (accion === 'eliminar') {
        const confirm = await sweetalert2.fire({
          title: `¿Seguro que deseas eliminar a ${studentData.student.name}?`,
          text: 'Se eliminará toda la información asociada a este cliente.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });

        if (!confirm.isConfirmed) return;

        await deleteCliente(studentData.student.id);

        await sweetalert2.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El alumno fue eliminado correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
        refetch();
        return;
      }

      const swal = Swal.mixin({
        buttonsStyling: false, // 👈 clave
        customClass: {
          confirmButton:
            'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
            'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400',
          cancelButton:
            'swal2-cancel inline-flex items-center px-4 py-2 rounded-md font-medium ml-3 ' +
            'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400',
          popup: 'rounded-xl'
        }
      });
      if (accion === 'modificar') {
        const confirm = await swal.fire({
          title: `¿Modificar datos de ${studentData.name}?`,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Sí, modificar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });
        if (!confirm.isConfirmed) return;
      }
      if (
        studentData.auditDetails &&
        studentData.auditDetails.trim() !== '' &&
        studentData.id
      ) {
        try {
          const auditoriaPayload = {
            motivo: studentData.auditDetails,
            usuario_id: userId
          };

          await guardarAuditoria(studentData.id, auditoriaPayload);
        } catch (auditError) {
          await sweetalert2.fire({
            icon: 'error',
            title: 'Error de Auditoría',
            text: 'No se pudo guardar el motivo del cambio. La operación ha sido cancelada.'
          });

          return;
        }
      }

      let fechaInicioStr =
        studentData.planDetails?.startDate ||
        studentData.trialDetails?.date ||
        studentData.scheduledDetails?.date ||
        '';

      let fechaFinStr = '';
      let planStartDateAux = studentData.scheduledDetails?.startDateAux || null;
      let planEndDateAux = studentData.scheduledDetails?.endDateAux || null;

      if (fechaInicioStr) {
        const [año, mes, dia] = fechaInicioStr.split('-').map(Number);

        const fechaInicio = new Date(año, mes - 1, dia);

        if (!isNaN(fechaInicio.getTime())) {
          if (studentData.planDetails?.endDate) {
            // Si hay endDate, se usa esa fecha
            fechaFinStr = studentData.planDetails.endDate;
          } else {
            // Si no hay endDate, la fecha fin es la fecha inicio + 1 día
            const fechaFin = new Date(fechaInicio);
            fechaFin.setDate(fechaFin.getDate() + 1);
            const añoFin = fechaFin.getFullYear();
            const mesFin = String(fechaFin.getMonth() + 1).padStart(2, '0');
            const diaFin = String(fechaFin.getDate()).padStart(2, '0');
            fechaFinStr = `${añoFin}-${mesFin}-${diaFin}`;
          }
        }
      }

      const inscripcionData = {
        dia: key.split('-')[0],
        horario: key.split('-')[1],
        fecha_inscripcion: new Date().toISOString().split('T')[0],
        id_sede: sedeActualFiltro
      };

      const formDataForDB = {
        id: studentData.id || null,
        nombre: studentData.name || "",
        telefono: studentData.contact || "",
        observaciones: studentData.observation || "SIN OBSERVACIONES",
        estado:
          studentData.status === "plan"
            ? "Plan"
            : studentData.status === "prueba"
            ? "Clase de prueba"
            : studentData.status === "programado"
            ? "Renovacion programada"
            : "Renovacion reprogramada",
        fecha_inicio:
          planAContratado === "De plan a programado"
            ? planStartDateAux
            : fechaInicioStr,

        fecha_fin:
          planAContratado === "De plan a programado"
            ? planEndDateAux
            : fechaFinStr,
        fecha_prometido_pago:
          planAContratado === "De plan a programado" ? fechaInicioStr : null,
      };
      // Lógica específica para cambios desde la lista de espera
      if (accion === "agregar" && tipoInscripcionListaEspera === "cambio") {
        const alumno = encontrarAlumnoYHorario(studentData.name, key);
        if (!alumno) {
          throw new Error("Alumno no encontrado para cambio de turno.");
        }
        const alumnoCambio = {
          id_estudiante: alumno.idEstudiante,
          id_horario_anterior: alumno.idHorarioAnterior,
          id_horario_nuevo: alumno.idHorarioNuevo,
        };
        const resultadoCambio = await guardarCambioDeTurno(null, alumnoCambio);
        if (!resultadoCambio) {
          throw new Error("No se pudo cambiar el turno del alumno.");
        }
        await sweetalert2.fire({
          icon: "success",
          title: "Agregado",
          text: "El alumno fue cambiado de turno correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
        
      } 
      // Logica para agregar un nuevo alumno
      else if (accion === "agregar") {
        await insertCliente(formDataForDB, inscripcionData);
        await sweetalert2.fire({
          icon: "success",
          title: "Agregado",
          text: "El alumno fue agregado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else if (
        // Modificaciones cuando hay cambio de plan entre programado y contratado
        accion === "modificar" &&
        (planAContratado === "De plan a programado" ||
          planAContratado === "De programado a contratado")
      ) {
        const datosParaEnviar = {
          fecha_prometido_pago:
            planAContratado === "De plan a programado" ? fechaInicioStr : null,
          fecha_fin:
            planAContratado === "De plan a programado"
              ? planEndDateAux
              : fechaFinStr,
          fecha_inicio:
            planAContratado === "De plan a programado"
              ? planStartDateAux
              : fechaInicioStr,
          estado:
            planAContratado === "De plan a programado"
              ? "Renovacion programada"
              : "Plan",
        };

        await planAContratadoPeticion(studentData.id, datosParaEnviar);
        await sweetalert2.fire({
          icon: "success",
          title: "Modificado",
          text: "El alumno fue modificado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else if (
        // Modificaciones cuando solo se actualiza la fecha prometida
        accion === "modificar" &&
        studentData?.scheduledDetails?.promisedDate
      ) {
        const datosParaEnviar = {
          fecha_prometido_pago: fechaInicioStr,
          estado: "Reprogramado",
        };
        await planAContratadoPeticion(studentData.id, datosParaEnviar);
        await sweetalert2.fire({
          icon: "success",
          title: "Modificado",
          text: "La fecha prometida fue actualizada correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      } 
      // Modificaciones generales sin cambio de plan
      else if (accion === "modificar") {
        await insertCliente(formDataForDB, inscripcionData, true);
        await sweetalert2.fire({
          icon: "success",
          title: "Modificado",
          text: "El alumno fue modificado correctamente.",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error('Error al guardar el alumno:', error);
      
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error al guardar el cliente en la base de datos.'
      });
      throw error; // Re-lanza el error para que el modal lo capture
    }finally{
      refetch();
      refetchReporteAsistencia();
      setTipoInscripcionListaEspera(null);
    }
  };

  /**
   * FUNCTION: Genera contenido HTML y estilos CSS para una celda de alumno
   * Renderiza información diferente según el estado (plan, prueba, programado).
   * Aplica estilos visuales para indicar si el plan está vencido, vigente, etc.
   * @param {object} student - Datos del alumno
   * @returns {object} { content: JSX, style: string } - Contenido y clases CSS
   */
  const getCellContentAndStyle = useCallback(
    (student) => {
      if (!student)
        return { content: null, style: 'bg-white hover:bg-gray-100' };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let content = <span className="font-semibold">{student.name}</span>;
      let style = 'bg-gray-100';
      let isExpired = false;

      switch (student.status) {
        case 'plan':
          const endDate = new Date(student.planDetails.endDate + 'T00:00:00');

          isExpired = endDate < today;

          style =
            student.planDetails?.type === 'L-M-V'
              ? 'bg-gray-300'
              : 'bg-gray-200';

          const duracion = Number(
            calcularDiasEntreFechas(
              student.planDetails.startDate,
              student.planDetails.endDate
            )
          );
          content = (
            <span>
              {student.name}
              <br />
              {/* Contenedor para la segunda línea con Flexbox */}
              <div className="flex items-center justify-between mt-1 text-xs italic">
                <span>
                  {isExpired ? 'Venció' : 'Vence'} el{' '}
                  {endDate.toLocaleDateString('es-ES')}
                </span>

                {/* Badge "Modificado" (solo si la duración no es estándar) */}
                {duracion && ![30, 90, 180, 360].includes(Number(duracion)) && (
                  <span className="not-italic font-bold bg-orange-200 text-orange-800 text-[10px] p-2 rounded-full">
                    <FaPencilAlt />
                  </span>
                )}
              </div>
            </span>
          );
          break;

        case 'prueba':
          const trialDate = new Date(student.trialDetails.date + 'T00:00:00');
          isExpired = trialDate < today;
          style = 'bg-cyan-200';

          const asistio = asistenciaPruebasMap[student.id];

          content = (
            <span>
              {student.name}
              <br />
              <span className="text-xs italic">
                Clase de prueba{' '}
                {new Date(
                  student.trialDetails.date + 'T00:00:00'
                ).toLocaleDateString('es-ES')}
              </span>

              {isExpired && asistio !== undefined && (
                <div className="mt-1">
                  {asistio ? (
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                      ✔️ Asistió
                    </span>
                  ) : (
                    <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      ❌ No Asistió
                    </span>
                  )}
                </div>
              )}
            </span>
          );
          break;

        case 'programado':
          const fechaRelevante =
            student.scheduledDetails?.promisedDate ||
            student.scheduledDetails.date;
          const scheduledDate = new Date(fechaRelevante + 'T00:00:00');
          isExpired = scheduledDate < today;
          style = 'bg-yellow-200';
          content = (
            <span>
              {student.name}
              <br />
              <span className="text-xs italic">
                Renueva el{' '}
                {new Date(fechaRelevante + 'T00:00:00').toLocaleDateString(
                  'es-ES'
                )}
              </span>
            </span>
          );
          break;

        default:
          break;
      }

      if (isExpired) {
        style = 'bg-red-500 text-white';
      }

      return { content, style };
    },
    [asistenciaPruebasMap]
  );

  /**
   * COMPUTED VALUE (useMemo): Calcula cupos libres, alumnos vencidos y coincidencias de lista de espera
   * Realiza tres análisis complejos simultáneamente:
   * 1. Identifica cupos disponibles por grupo horario (LMV y MJ)
   * 2. Filtra alumnos con planes vencidos o clases de prueba caducadas
   * 3. Encuentra personas de la lista de espera que coinciden con cupos libres
   * @returns {object} { freeSlots, expiredStudents, waitingListMatches }
   */
  const { freeSlots, expiredStudents, waitingListMatches } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // --- 1. Cálculo de Cupos Libres ---
    // Itera sobre las horas y días para encontrar los cupos disponibles en cada grupo.
    const lmvSlots = [];
    const mjSlots = [];
    for (const hour of [
      '07:00',
      '08:00',
      '09:00',
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
      '18:00',
      '19:00',
      '20:00',
      '21:00',
      '22:00'
    ]) {
      const lunesLibres =
        cupoMaximoPilates -
        (schedule[`LUNES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('LUNES', hour);
      const miercolesLibres =
        cupoMaximoPilates -
        (schedule[`MIÉRCOLES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('MIÉRCOLES', hour);
      const viernesLibres =
        cupoMaximoPilates -
        (schedule[`VIERNES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('VIERNES', hour);
      const martesLibres =
        cupoMaximoPilates -
        (schedule[`MARTES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('MARTES', hour);
      const juevesLibres =
        cupoMaximoPilates -
        (schedule[`JUEVES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('JUEVES', hour);

      const lmvCount = Math.max(
        0,
        Math.min(lunesLibres, miercolesLibres, viernesLibres)
      );
      if (lmvCount > 0) {
        lmvSlots.push({ hour, count: lmvCount });
      }

      const mjCount = Math.max(0, Math.min(martesLibres, juevesLibres));
      if (mjCount > 0) {
        mjSlots.push({ hour, count: mjCount });
      }
    }
    const calculatedFreeSlots = { lmv: lmvSlots, mj: mjSlots };

    // --- 2. Cálculo de Alumnos Vencidos ---
    // Recorre todos los alumnos en la grilla y filtra aquellos cuya fecha de fin ya pasó.
    const allStudents = Object.values(schedule)
      .map((cell) => cell.alumnos || [])
      .flat();
    const processedIds = new Set();
    const calculatedExpiredStudents = [];
    allStudents.forEach((student) => {
      if (!student || processedIds.has(student.id)) return;
      let expiryDate;
      let type = '';
      switch (student.status) {
        case 'plan':
          expiryDate = new Date(student.planDetails.endDate + 'T00:00:00');
          type = 'Plan vencido';
          break;
        case 'prueba':
          expiryDate = new Date(student.trialDetails.date + 'T00:00:00');
          type = 'Clase de prueba caducada';
          break;
        case 'programado':
          expiryDate = new Date(student.scheduledDetails.date + 'T00:00:00');
          type = 'Renovación pendiente';
          break;
        default:
          return;
      }
      if (expiryDate < today) {
        calculatedExpiredStudents.push({
          name: student.name,
          type: type,
          date: expiryDate.toLocaleDateString('es-ES')
        });
        processedIds.add(student.id);
      }
    });

    // Filtra y ordena la lista de espera para luego buscar coincidencias con los cupos libres.
    const actionableWaitingList = waitingList
      // Filtra para excluir a las personas que ya fueron contactadas y rechazaron o confirmaron.
      .filter(
        (person) =>
          person.contacto_cliente?.estado_contacto !==
            'Rechazado/Sin Respuesta' &&
          person.contacto_cliente?.estado_contacto !== 'Confirmado'
      )
      // Ordena para dar prioridad a los que buscan "cambio" sobre los que están en "espera".
      .sort((a, b) => {
        if (a.type === 'cambio' && b.type !== 'cambio') return -1;
        if (a.type !== 'cambio' && b.type === 'cambio') return 1;
        return 0;
      });

    const calculatedMatches = [];
    const processedMatches = new Set();

    actionableWaitingList.forEach((person) => {
      if (processedMatches.has(person.id)) return;
      let hasMatch = false;
      if (person.plan === 'L-M-V')
        hasMatch = person.hours.some((hour) =>
          calculatedFreeSlots.lmv.some((slot) => slot.hour === hour)
        );
      else if (person.plan === 'M-J')
        hasMatch = person.hours.some((hour) =>
          calculatedFreeSlots.mj.some((slot) => slot.hour === hour)
        );
      else if (person.plan === 'Cualquier día')
        hasMatch = person.hours.some(
          (hour) =>
            calculatedFreeSlots.lmv.some((slot) => slot.hour === hour) ||
            calculatedFreeSlots.mj.some((slot) => slot.hour === hour)
        );

      if (hasMatch) {
        calculatedMatches.push(person);
        processedMatches.add(person.id);
      }
    });

    // Devuelve los tres conjuntos de datos calculados.
    return {
      freeSlots: calculatedFreeSlots,
      expiredStudents: calculatedExpiredStudents,
      waitingListMatches: calculatedMatches
    };
  }, [schedule, waitingList, cupoMaximoPilates, countTrialsInOtherDaysOfGroup]);

  /**
   * FUNCTION: Cambia la sede actual seleccionada para filtrar todos los datos
   * Actualiza el filtro global de sede, lo que activa todos los effects que dependen de sedeActualFiltro.
   * @param {number|string} nuevaSede - ID de la nueva sede a seleccionar
   */
  const cambiarSede = (nuevaSede) => {
    setSedeActualFiltro(String(nuevaSede));
  };

  /**
   * FUNCTION: Registra el contacto realizado con un alumno ausente
   * Actualiza en la base de datos que se realizó un contacto con ese alumno.
   * Incluye fecha, hora y usuario que realizó el contacto.
   * @param {number} id - ID del cliente
   * @param {string} name - Nombre del alumno
   * @param {string} contacto - Número de contacto (teléfono)
   */
  const handleContactAlumno = async (id, name, contacto) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }
    const now = new Date();
    now.setHours(now.getHours() - 3); // Restar 3 horas a la hora actual porque sino hay desfase
    const fecha_contacto = now.toISOString().slice(0, 19).replace('T', ' ');

    const datosParaEnviar = {
      id: id,
      nombre: name,
      contacto: contacto,
      fecha_contacto: fecha_contacto,
      id_usuario_contacto: userId
    };
    try {
      const res = await modificarAlumnoContactado(id, datosParaEnviar);
      if (res) {
        await sweetalert2.fire({
          icon: 'success',
          title: 'Alumno contactado',
          text: `Se registró el contacto con ${name} exitosamente.`,
          timer: 1800,
          showConfirmButton: false
        });
        refetchAusentes();
        setcontactarAlumno(false);
      } else {
        throw new Error('No se pudo modificar el alumno');
      }
    } catch (error) {
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error',
        text: `Ocurrió un error al registrar el contacto con ${name}.`
      });
    }
  };

  /**
   * UTILITY FUNCTION: Calcula la diferencia en días entre dos fechas
   * Convierte fechas en formato "YYYY-MM-DD" a objetos Date en UTC.
   * Calcula la diferencia en milisegundos y la convierte a días enteros.
   * @param {string} fechaInicioStr - Fecha de inicio en formato "YYYY-MM-DD"
   * @param {string} fechaFinStr - Fecha de fin en formato "YYYY-MM-DD"
   * @returns {number} Diferencia en días (redondeada)
   */
  const calcularDiasEntreFechas = (fechaInicioStr, fechaFinStr) => {
    // Función interna para convertir "YYYY-MM-DD" a un objeto Date en UTC
    const parsearFechaYMD = (str) => {
      const [anio, mes, dia] = str.split('-');
      // Usamos Date.UTC para ignorar la zona horaria local y evitar errores
      return new Date(Date.UTC(anio, mes - 1, dia));
    };

    const fechaInicio = parsearFechaYMD(fechaInicioStr);
    const fechaFin = parsearFechaYMD(fechaFinStr);

    // Milisegundos en un día (1000ms * 60s * 60min * 24h)
    const msPorDia = 1000 * 60 * 60 * 24;

    // Restamos las fechas para obtener la diferencia en milisegundos
    const diferenciaEnMs = fechaFin - fechaInicio;

    // Convertimos los milisegundos a días y redondeamos
    const diferenciaEnDias = Math.round(diferenciaEnMs / msPorDia);

    return diferenciaEnDias;
  };

  return {
    states: {
      puedeEditarSede,
      section,
      sedeActualFiltro,
      schedule,
      waitingList,
      isModalProfesorOpen,
      horarioSeleccionado,
      currentCell,
      searchTerm,
      isModalOpen,
      visiblePanels,
      instructoresData,
      sedesData,
      rol,
      expiredStudents,
      waitingListMatches,
      cupoMaximoPilates,
      fechaHoy,
      ausentesAlumnos,
      isModalDetalleAusentes,
      contactarAlumno,
      isModalAyuda,
      isConfirmModalOpen,
      personToConfirm,
      freeSlots
    },
    setters: {
      setSection,
      setSedeActualFiltro,
      setIsModalProfesorOpen,
      setSearchTerm,
      setIsModalOpen,
      setIsModalDetalleAusentes,
      setcontactarAlumno,
      setIsModalAyuda,
      setIsConfirmModalOpen
    },
    functions: {
      handleSectionChange,
      handlePanelToggle,
      countTrialsInOtherDaysOfGroup,
      handleOpenModalProfesor,
      handleSaveInstructor,
      handleUpdateWaitingList,
      handleCellClick,
      handleSaveStudent,
      getCellContentAndStyle,
      cambiarSede,
      handleOpenModalDetalleAusentes,
      handleContactAlumno,
      marcarEstadosAlumnoListaEspera,
      handleConfirmationComplete
    }
  };
};

export default PilatesGestionLogica;
