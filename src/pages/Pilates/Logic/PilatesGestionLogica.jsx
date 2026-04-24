import { useState, useEffect, useCallback, useMemo } from 'react';
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
import useHorariosDeshabilitados from './PilatesGestion/HorariosDeshabilitados';
import useHistorialAlumnos from './PilatesGestion/HistorialAlumnos';
import useGrillaMinimizada from './PilatesGestion/HorariosOcultos';
import { IoAlertCircle } from 'react-icons/io5';
import { differenceInDays, parseISO, differenceInCalendarDays } from 'date-fns';
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
  const [isModalCambioTurno, setIsModalCambioTurno] = useState(false); // Controla la visibilidad del modal para cambiar turno.
  const [isModalProfesorOpen, setIsModalProfesorOpen] = useState(false); // Controla la visibilidad del modal para asignar profesores.
  const [isModalDetalleAusentes, setIsModalDetalleAusentes] = useState(false); // Controla la visibilidad del modal que muestra los alumnos ausentes.
  const [isModalAyuda, setIsModalAyuda] = useState(false); // Controla la visibilidad del modal de ayuda.
  const [isModalReglas, setIsModalReglas] = useState(false); // Controla la visibilidad del modal de reglas.
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Controla la visibilidad del modal para confirmar e inscribir desde la lista de espera.
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
  const [tipoInscripcionListaEspera, setTipoInscripcionListaEspera] =
    useState(null); // Guarda el tipo de inscripción (cambio o espera).
  const [alumnoCambioTurno, setAlumnoCambioTurno] = useState(null); // Guarda los datos del alumno para cambiar turno.
  const [horariosCambioTurno, setHorariosCambioTurno] = useState({}); // Almacena todos los horarios con información de cupos para el modal de cambio de turno.

  // --- Hooks Externos y de Contexto ---
  const { fecha } = ObtenerFechaInternet(); // Hook que trae la fecha actual desde una API para evitar desajustes de hora locales.
  const { userId, sedeName, userLevel, name: nombreAsesor } = useAuth(); // Hook que obtiene el ID y nombre de la sede del usuario logueado.

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
  const {
    data: ausentesData,
    refetch: refetchAusentes,
    error: errorAusentesData,
    isLoading: isLoadingAusentesData
  } = useConsultaDB(
    // Trae el reporte de alumnos con inasistencias en el mes actual.
    sedeActualFiltro
      ? `/pilates/ausentes-dashboard?id_sede=${sedeActualFiltro}`
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

  const {
    insert: insertarVentasProspectosCompleto,
    error: errorInsertarVentasProspectosCompleto
  } = useInsertar(
    // Hook para asignar o cambiar el instructor de un horario específico.
    '/ventas-prospectos/sincronizar-completo',
    true
  );

  // --- Hooks de Actualización (PUT / PATCH) ---
  const { update: planAContratadoPeticion } = useModify(
    // Hook para manejar las transiciones de estado de un plan (ej: de programado a contratado).
    '/clientes-pilates/plan-renovacion'
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
    '/inscripciones-pilates/cambiar-turno',
    true
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
          porcentaje_asistencia_clases: horariosData[key].porcentaje_asistencia_clases || 0,
          cupo_maximo: horariosData[key].cupo_maximo || 0,
          horarioId: horariosData[key].horarioId || null,
          coachId: horariosData[key].coachId || null,
          cupos_descuento: horariosData[key].cupos_descuento || 0,
          porcentaje_descuento: horariosData[key].porcentaje_descuento || 0,
          fecha_vencimiento_descuento: horariosData[key].fecha_vencimiento_descuento || null,
          alumnos: Array.isArray(horariosData[key].alumnos)
            ? horariosData[key].alumnos
            : []
        };
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
        nombre_usuario_cargado: item.nombre_usuario_cargado.toUpperCase() || 'REGISTRO WEB',
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
   * EFFECT: Procesa los alumnos ausentes para la vista.
   * Calcula los días desde el último contacto
   */
  useEffect(() => {
    if (ausentesData && ausentesData.length > 0) {
      const fecha_actual = new Date();
      // Filtrar alumnos presentes (faltas entre 0 y 2)
      const ausentesFiltrados = ausentesData.filter((alumno) => {
        const faltas = Number(alumno?.faltas_desde_ultimo_presente || 0);
        return !(faltas >= 0 && faltas <= 2);
      });

      const lista_formateada = ausentesFiltrados.map((alumno) => {
        let dias_pasados = null;

        if (alumno.ultimo_contacto) {
          const fecha_contacto = parseISO(alumno.ultimo_contacto);
          dias_pasados = differenceInDays(fecha_actual, fecha_contacto);
        }

        const faltas_desde_ultimo_presente = Number(alumno?.faltas_desde_ultimo_presente || 0);
        const total_contactos = Number(alumno?.total_contactos || 0);
        
        const colorAlerta = alumno.estado_visual || 'VERDE';

        return {
          id: alumno.id,
          name: alumno.nombre,
          cantidad: alumno.racha_actual,
          faltas_desde_ultimo_presente: faltas_desde_ultimo_presente,
          total_contactos: total_contactos,
          contacto: alumno.telefono,
          dias_desde_ultimo_contacto: dias_pasados,
          color_alerta: colorAlerta,
          estado_visual: colorAlerta 
        };
      });

      // Ordenar por prioridad: ROJO y AMARILLO primero, VERDE al final
      const lista_ordenada = lista_formateada.sort((a, b) => {
        const prioridad = { ROJO: 3, AMARILLO: 2, VERDE: 1 };
        return (prioridad[b.color_alerta] || 0) - (prioridad[a.color_alerta] || 0);
      });

      setAusentesAlumnos(lista_ordenada);
    }
  }, [ausentesData]);

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
    let sedeUser = String(sedeName || '')
      .trim()
      .toLowerCase();

    // Si el usuario tiene "smt" o "sanmiguelbn", lo forzamos a buscar "barrio sur" o "barrio norte" en la lista de sedes.
    if (sedeUser === 'smt') {
      sedeUser = 'barrio sur';
    } else if (sedeUser === 'sanmiguelbn') {
      sedeUser = 'barrio norte';
    }

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
    let sedeLower = String(sedeName || '').toLowerCase();

    // Si el usuario es 'smt', lo convertimos manualmente a 'barrio sur'
    if (sedeLower === 'smt') {
      sedeLower = 'barrio sur';
    } else if (sedeLower === 'sanmiguelbn') {
      sedeLower = 'barrio norte';
    }

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
      normalizarTexto(nombreSedeSeleccionada) === normalizarTexto(sedeLower)
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
   * FUNCTION: Obtiene información de clases de prueba en otros días del mismo grupo horario
   * Agrupa los días en: L-M-V (lunes, miércoles, viernes) y M-J (martes, jueves).
   * Usado para calcular cupos disponibles y mostrar tarjetas informativas.
   * @param {string} day - Día de la semana (ej: "LUNES")
   * @param {string} hour - Hora del horario (ej: "09:00")
   * @returns {object} { count: number, alumnos: array } - Cantidad y datos de alumnos de prueba
   */
  const countTrialsInOtherDaysOfGroup = (day, hour) => {
    const lmv = ['LUNES', 'MIÉRCOLES', 'VIERNES'];
    const mj = ['MARTES', 'JUEVES'];
    let group = [];
    if (lmv.includes(day)) group = lmv;
    if (mj.includes(day)) group = mj;
    if (group.length === 0) return { count: 0, alumnos: [] };

    // Recopilar clases de prueba en otros días del grupo (no en el día actual)
    let totalTrials = 0;
    let alumnosPrueba = [];
    group.forEach((d) => {
      if (d !== day) {
        // Solo contar otros días, no el día actual
        const students = schedule[`${d}-${hour}`]?.alumnos || [];
        const trialsInDay = students.filter((s) => s.status === 'prueba');
        totalTrials += trialsInDay.length;
        // Agregar información del alumno y su día de inscripción
        trialsInDay.forEach((alumno) => {
          alumnosPrueba.push({
            ...alumno,
            diaInscrito: d
          });
        });
      }
    });

    return { count: totalTrials, alumnos: alumnosPrueba };
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
   * FUNCTION: Genera estructura de todos los horarios CON Y SIN cupos
   * Similar a generarHorariosConCupos pero más robusto y reutilizable
   * Estructura: { LUNES: [ {hour, count, maxCapacity, isFull} ], MARTES: [...], ... }
   * @param {object} scheduleData - Datos del schedule completo
   * @param {number} maxCapacity - Cupo máximo por clase
   * @returns {object} Estructura de horarios agrupados por día con información de ocupación
   */
  const generarTodosLosHorariosConCupos = (scheduleData, maxCapacity) => {
    const resultado = {};
    const DAYS = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES'];
    const HORAS = [
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
    ];

    // Inicializar
    DAYS.forEach((day) => {
      resultado[day] = [];
    });

    // Para cada día y hora, contar alumnos
    DAYS.forEach((day) => {
      HORAS.forEach((hour) => {
        const key = `${day}-${hour}`;
        const cellData = scheduleData[key];
        const alumnosCount = cellData?.alumnos ? cellData.alumnos.length : 0;

        resultado[day].push({
          hour,
          count: alumnosCount,
          maxCapacity,
          isFull: alumnosCount >= maxCapacity
        });
      });
    });

    return resultado;
  };

  /**
   * FUNCTION: Genera estructura de todos los horarios con información de cupos
   * Se usa para el modal de cambio de turno, mostrando todos los horarios disponibles
   * con información sobre cuántos alumnos tienen en cada clase.
   * @param {object} scheduleData - Datos del schedule completo
   * @param {number} maxCapacity - Cupo máximo por clase
   * @returns {object} Estructura de horarios agrupados por día
   */
  const generarHorariosConCupos = (scheduleData, maxCapacity) => {
    // Reutilizar la función más robusta
    return generarTodosLosHorariosConCupos(scheduleData, maxCapacity);
  };

  /**
   * FUNCTION: Guarda el cambio directo de turno de un alumno
   * Se ejecuta cuando el usuario selecciona un horario con cupo disponible
   * Usa la API de cambio de turno (guardarCambioDeTurno) para mover al alumno
   * @param {string} key - Clave del horario en formato "DIA-HORA"
   * @param {object} studentData - Datos del alumno para obtener nombre e ID
   * @param {string} accion - Acción a realizar (ignorado, siempre es cambio directo)
   * @param {object} extras - Información adicional (oldDay, oldHour, newDay, newHour)
   */
  const handleSaveCambioTurno = async (key, studentData, accion, extras) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }

    try {
      // ✅ USAR LA FUNCIÓN encontrarAlumnoYHorario QUE YA EXISTE
      // Esta función busca al alumno en TODOS los horarios, sin importar el día
      // y devuelve todos los IDs que necesitamos
      const alumnoYHorarios = encontrarAlumnoYHorario(
        studentData.name,
        studentData.id,
        key
      );

      if (!alumnoYHorarios) {
        throw new Error(
          `No se encontró al alumno "${studentData.name}" en la base de datos. ` +
            `Verifica que el nombre sea correcto.`
        );
      }

      // Preparar datos para el cambio de turno
      const alumnoCambio = {
        id_estudiante: alumnoYHorarios.idEstudiante,
        id_horario_anterior: alumnoYHorarios.idHorarioAnterior,
        id_horario_nuevo: alumnoYHorarios.idHorarioNuevo,
        fecha_nueva_fin: studentData.fecha_nueva || null
      };
      // Realizar el cambio de turno a través de la API
      // Con reintentos en caso de problemas intermitentes
      const resultadoCambio = await guardarCambioDeTurno(null, alumnoCambio, 2); // 2 reintentos = 3 intentos totales

      await sweetalert2.fire({
        icon: 'success',
        title: 'Cambio de turno realizado',
        text: `${studentData.name} ha sido trasladado exitosamente al nuevo horario.`,
        timer: 2000,
        showConfirmButton: false
      });

      setIsModalCambioTurno(false);
      refetch(); // Recargar la grilla para reflejar el cambio
    } catch (error) {
      console.error('❌ Error al cambiar turno:', {
        mensaje: error.message,
        stack: error.stack,
        studentData,
        extras,
        errorCompleto: error
      });
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error al cambiar turno',
        text:
          error.message ||
          'No se pudo realizar el cambio de turno. Intenta nuevamente.',
        timer: 3000,
        showConfirmButton: false
      });
      throw error;
    }
  };

  /**
   * FUNCTION: Guarda un cambio de turno en la lista de espera
   * Se ejecuta cuando el usuario selecciona un horario sin cupo disponible
   * Agrega automáticamente al alumno a la lista de espera en situación de "cambio"
   * @param {object} personData - Datos de la persona para lista de espera
   */
  const handleSaveWaitingListCambio = async (personData) => {
    if (!puedeEditarSede) {
      await mostrarErrorPermisos();
      return;
    }

    try {
      const objetoParaBackend = {
        nombre: personData.name,
        contacto: personData.contact,
        tipo: 'Cambio de turno',
        plan_interes: personData.plan,
        horarios_preferidos: personData.hours.join(','),
        observaciones: personData.obs ?? '', // enviar vacío si corresponde
        id_sede: sedeActualFiltro,
        id_usuario_cargado: userId
      };

      // Inserta en la lista de espera (solo eso - sin crear contacto inicial)
      const resultadoInsert = await insertarListaEspera(objetoParaBackend);

      // Normalizar id retornado (puede venir como { id }, { insertId } o número)
      const nuevaListaId =
        (resultadoInsert && (resultadoInsert.id || resultadoInsert.insertId)) ||
        (typeof resultadoInsert === 'number' ? resultadoInsert : null);

      await sweetalert2.fire({
        icon: 'success',
        title: 'Agregado a lista de espera',
        text: `${personData.name} ha sido agregado a la lista de espera para cambio de turno.`,
        timer: 1800,
        showConfirmButton: false
      });
      setIsModalCambioTurno(false);
    } catch (error) {
      console.error('Error al agregar a lista de espera:', error);
      await sweetalert2.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo agregar a la lista de espera. Intenta nuevamente.',
        timer: 2000,
        showConfirmButton: false
      });
      throw error;
    } finally {
      refetchListaEspera();
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

  // FUNCTION: Encuentra un alumno y sus horarios viejo y nuevo por ID (prioridad) o nombre
  const encontrarAlumnoYHorario = useCallback(
    (nombreBuscado, idBuscado, keyHorarioNuevo) => {
      if (!keyHorarioNuevo) return null;

      const puedeBuscarPorId =
        idBuscado !== undefined && idBuscado !== null && idBuscado !== '';
      const puedeBuscarPorNombre =
        typeof nombreBuscado === 'string' && nombreBuscado.trim() !== '';

      if (!puedeBuscarPorId && !puedeBuscarPorNombre) return null;

      const horarioNuevoInfo = schedule[keyHorarioNuevo];
      const horarioIdNuevo = horarioNuevoInfo
        ? horarioNuevoInfo.horarioId
        : null;

      if (horarioIdNuevo === null) {
        console.error(`No se encontró el ID del nuevo horario para la clave'`);
        return null;
      }

      const normalizarNombre = (valor) =>
        typeof valor === 'string' ? valor.trim().toLowerCase() : '';
      const nombreNormalizado = normalizarNombre(nombreBuscado);

      const listaDeHorarios = Object.values(schedule);
      for (const horario of listaDeHorarios) {
        const alumnoEncontrado = horario.alumnos.find((alumno) => {
          if (
            puedeBuscarPorId &&
            alumno.id !== undefined &&
            alumno.id !== null
          ) {
            if (String(alumno.id) === String(idBuscado)) return true;
          }
          if (puedeBuscarPorNombre && alumno.name) {
            return normalizarNombre(alumno.name) === nombreNormalizado;
          }
          return false;
        });

        if (alumnoEncontrado) {
          return {
            idEstudiante: alumnoEncontrado.id,
            idHorarioAnterior: horario.horarioId,
            idHorarioNuevo: horarioIdNuevo
          };
        }
      }
      return null;
    },
    [schedule]
  );

  /**
   * FUNCTION: Abre el modal para agregar o editar un alumno en un horario específico
   * Valida que haya cupos disponibles antes de permitir agregar nuevos alumnos.
   * Prepara los datos de la celda clickeada para pasarlos al modal.
   * @param {string} day - Día de la semana
   * @param {string} time - Hora del horario
   * @param {object} studentToEdit - Alumno a editar (null si es agregar nuevo)
   * @param {string} tipo - Tipo de inscripción (normal o cupo_adicional)
   */
  const handleCellClick = (
    day,
    time,
    studentToEdit = null,
    tipo = 'normal'
  ) => {
    if (!puedeEditarSede) {
      mostrarErrorPermisos();
      return;
    }
    const key = `${day}-${time}`;
    const abrirModal = (tipoFinal) => {
      setCurrentCell({
        key,
        day,
        time,
        student: studentToEdit,
        tipoInscripcion: tipoFinal
      });
      setIsModalOpen(true);
    };

    if (tipo === 'cupo_adicional' && studentToEdit === null) {
      // Si es sobrecupo y nuevo alumno, mostramos alerta
      Swal.fire({
        title: '<strong>Inscripción de Sobrecupo</strong>',
        icon: 'warning',
        html: `
            <div class="text-left">
              <p class="mb-2">El límite de alumnos para este horario ha sido alcanzado o no hay cupos habilitados.</p>
              <p class="font-semibold text-orange-600">¿Desea autorizar una inscripción excepcional de sobrecupo para este estudiante?</p>
            </div>
          `,
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, autorizar sobrecupo',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          abrirModal('cupo_adicional');
        }
      });
    } else if (tipo === 'cupo_adicional') {
      // Si es sobrecupo y ya hay un alumno (edición), abrimos directo
      abrirModal('cupo_adicional');
    } else {
      // Si es normal, abrimos directo
      abrirModal('normal');
    }
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
          input: 'text', 
          inputPlaceholder: 'Motivo de la eliminación (opcional)', 
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          reverseButtons: true
        });

        if (!confirm.isConfirmed) return;

        const motivoCausa = confirm.value; 
        await deleteCliente(studentData.student.id, { motivoCausa, idUsuarioGestion: userId}); 
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
        nombre: studentData.name || '',
        telefono: studentData.contact || '',
        observaciones: studentData.observation || 'SIN OBSERVACIONES',
        estado:
          studentData.status === 'plan'
            ? 'Plan'
            : studentData.status === 'prueba'
            ? 'Clase de prueba'
            : studentData.status === 'programado'
            ? 'Renovacion programada'
            : 'Renovacion reprogramada',
        fecha_inicio:
          planAContratado === 'De plan a programado'
            ? planStartDateAux
            : fechaInicioStr,

        fecha_fin:
          planAContratado === 'De plan a programado'
            ? planEndDateAux
            : fechaFinStr,
        fecha_prometido_pago:
          planAContratado === 'De plan a programado' ? fechaInicioStr : null
      };
      // Lógica específica para cambios desde la lista de espera
      if (accion === 'agregar' && tipoInscripcionListaEspera === 'cambio') {
        const alumno = encontrarAlumnoYHorario(studentData.name, null, key);
        if (alumno === null) {
          throw new Error('Alumno no encontrado para cambio de turno.');
        }
        const alumnoCambio = {
          id_estudiante: alumno.idEstudiante,
          id_horario_anterior: alumno.idHorarioAnterior,
          id_horario_nuevo: alumno.idHorarioNuevo
        };
        const resultadoCambio = await guardarCambioDeTurno(null, alumnoCambio);
        if (!resultadoCambio) {
          throw new Error('No se pudo cambiar el turno del alumno.');
        }
        await sweetalert2.fire({
          icon: 'success',
          title: 'Agregado',
          text: 'El alumno fue cambiado de turno correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      }
      // Logica para agregar un nuevo alumno
      else if (accion === 'agregar') {
        await sincronizarConVentas(studentData, inscripcionData); // Sincronizar con Ventas si aplica
        const datosHistorialAlumno = altaHistorialAlumno(studentData); // Crear historial del alumno
        const altaAlumno = { ...formDataForDB, ...datosHistorialAlumno }; // Combinar datos del alumno con historial
        await insertCliente(altaAlumno, inscripcionData); // Insertar nuevo cliente
        await sweetalert2.fire({
          icon: 'success',
          title: 'Agregado',
          text: 'El alumno fue agregado correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      } else if (
        // Modificaciones cuando hay cambio de plan entre programado y contratado
        accion === 'modificar' &&
        (planAContratado === 'De plan a programado' ||
          planAContratado === 'De programado a contratado')
      ) {
        const datosParaEnviar = {
          fecha_prometido_pago:
            planAContratado === 'De plan a programado' ? fechaInicioStr : null,
          fecha_fin:
            planAContratado === 'De plan a programado'
              ? planEndDateAux
              : fechaFinStr,
          fecha_inicio:
            planAContratado === 'De plan a programado'
              ? planStartDateAux
              : fechaInicioStr,
          estado:
            planAContratado === 'De plan a programado'
              ? 'Renovacion programada'
              : 'Plan'
        };

        await planAContratadoPeticion(studentData.id, datosParaEnviar); // Actualizar plan del alumno
        await crearHistorialAlumno(horariosData, studentData, 'CAMBIO_PLAN'); // Crear historial del alumno
        await sweetalert2.fire({
          icon: 'success',
          title: 'Modificado',
          text: 'El alumno fue modificado correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      } else if (
        // Modificaciones cuando solo se actualiza la fecha prometida
        accion === 'modificar' &&
        studentData?.scheduledDetails?.promisedDate
      ) {
        const datosParaEnviar = {
          fecha_prometido_pago: fechaInicioStr,
          estado: 'Reprogramado',
          nombre: studentData.name,
          observaciones: studentData.observation || 'SIN OBSERVACIONES',
          telefono: studentData.contact || ''
        };
        await planAContratadoPeticion(studentData.id, datosParaEnviar);
        await crearHistorialAlumno(horariosData, studentData);
        await sweetalert2.fire({
          icon: 'success',
          title: 'Modificado',
          text: 'La fecha prometida fue actualizada correctamente.',
          timer: 1800,
          showConfirmButton: false
        });
      }
      // Modificaciones generales sin cambio de plan
      else if (accion === 'modificar') {
        await insertCliente(formDataForDB, inscripcionData, true);
        await crearHistorialAlumno(horariosData, studentData, 'MODIFICACION');
        await sweetalert2.fire({
          icon: 'success',
          title: 'Modificado',
          text: 'El alumno fue modificado correctamente.',
          timer: 1800,
          showConfirmButton: false
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
    } finally {
      refetch();
      refetchReporteAsistencia();
      setTipoInscripcionListaEspera(null);
    }
  };

  //Esta función sincroniza los datos del alumno con "Ventas" siempre y cuando el alumno esté en estado "prueba" o "programado".
  const sincronizarConVentas = async (datosAlumno, datosInscripcion) => {
    // 1. Sincronizar solo si el alumno está en prueba o programado
    if (datosAlumno.status !== 'prueba' && datosAlumno.status !== 'programado')
      return;

    // 2. Obtener tipo de grupo y normalizar
    let grp =
      datosAlumno.trialDetails?.type || datosAlumno.scheduledDetails?.type;
    let grpNormalizado = grp ? grp.replace(/-/g, '') : '';

    // A. Buscamos el objeto de la sede actual usando el ID del filtro
    const sedeSeleccionadaObj = sedesData?.find(
      (s) => String(s.id) === String(sedeActualFiltro)
    );

    // B. Obtenemos el nombre (asegurando que no sea null)
    let nombreSedeRaw = sedeSeleccionadaObj
      ? sedeSeleccionadaObj.nombre || sedeSeleccionadaObj.ciudad || ''
      : '';

    // C. Normalizamos a minúsculas y sin espacios extras
    let sedeParaVentas = String(nombreSedeRaw).trim().toLowerCase();

    if (sedeParaVentas === 'concepción' || sedeParaVentas === 'concepcion') {
      sedeParaVentas = 'concepcion';
    }

    try {
      // Definir la fecha según el estado del alumno
      const fechaClase =
        datosAlumno.status === 'prueba'
          ? datosAlumno.trialDetails?.date
          : datosAlumno.scheduledDetails?.date;

      // Armar payload para enviar a Ventas
      const datos = {
        nombre: datosAlumno.name,
        dni: 'Sin DNI',
        tipo_prospecto: 'Nuevo',
        contacto: datosAlumno.contact,
        canal_contacto: 'Desde pilates',
        actividad: 'Pilates',
        observacion: datosAlumno.observation,
        sede: sedeParaVentas,
        usuario_id: userId,
        clase_prueba_1_fecha: fechaClase,
        clase_prueba_1_tipo:
          datosAlumno.status === 'prueba'
            ? 'Clase de prueba'
            : 'Visita programada',
        asesor_nombre: nombreAsesor,
        grp: grpNormalizado,
        hhmm: datosInscripcion.horario,
        clase_num: 1
      };
      await insertarVentasProspectosCompleto(datos);
    } catch (e) {
      console.error('Error no bloqueante sync ventas:', e);
    }
  };

  /**
   * FUNCTION: Genera contenido HTML y estilos CSS para una celda de alumno
   * Renderiza información diferente según el estado (plan, prueba, programado).
   * Aplica estilos visuales para indicar si el plan está vencido, vigente, etc.
   */
const getCellContentAndStyle = useCallback(
    (student) => {
      if (!student)
        return { content: null, style: 'bg-white hover:bg-gray-100' };

      const hoy_fecha = new Date();
      hoy_fecha.setHours(0, 0, 0, 0);

      let content = (
        <span className="font-semibold">
          {student.es_cupo_extra && <IoAlertCircle />}
          {student.name}
        </span>
      );
      let style = 'bg-gray-100';
      let isExpired = false;

      const parsearFechaUltima = (fechaStr) => {
      if (!fechaStr) return null;
      const partes = fechaStr.split("/");
      if (partes.length !== 3) return null;
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const anio = parseInt(partes[2], 10);
      if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;
      return new Date(anio, mes - 1, dia);
    };

      const fechaUltima = parsearFechaUltima(student.ultimo_dia_asistencia);
      let componente_badge_asistencia = null;

      if (fechaUltima) {
        const dias_transcurridos = differenceInCalendarDays(hoy_fecha, fechaUltima);
        let color_badge = "";
        if (dias_transcurridos < 7) color_badge = "bg-green-100 text-green-800 border-green-200";
        else if (dias_transcurridos < 15) color_badge = "bg-yellow-100 text-yellow-800 border-yellow-200";
        else color_badge = "bg-red-100 text-red-800 border-red-200";

        componente_badge_asistencia = (
          <span className={`px-[1px] rounded text-[10px] font-bold border shadow-sm ${color_badge}`} title="Última asistencia">
            últ. {student.ultimo_dia_asistencia?.split('/').slice(0,2).join('/')}
          </span>
        );
      }

      switch (student.status) {
        case 'plan':
          const endDate = new Date(student.planDetails.endDate + 'T00:00:00');

          isExpired = endDate < hoy_fecha;

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
              <div className="flex items-center justify-between min-w-0">
                <div className="flex truncate">
                  {student.es_cupo_extra && (
                    <span className="text-yellow-600 text-xl">
                      <IoAlertCircle />
                    </span>
                  )}{' '}
                  {student.name}
                </div>
                {/*Inserción del badge de asistencia al lado del nombre */}
                {componente_badge_asistencia}
              </div>
              {/* Contenedor para la segunda línea con Flexbox */}
              <div className="flex items-center justify-between mt-1 text-xs italic">
                <span>
                  {isExpired ? 'Venció' : 'Vence'} el{' '}
                  {endDate.toLocaleDateString('es-ES')}
                </span>

                {/* Badge "Modificado" (solo si la duración no es estándar) */}
                {duracion && ![29, 89, 179, 359].includes(Number(duracion)) && (
                  <span className="not-italic font-bold bg-orange-200 text-orange-800 text-[10px] p-2 rounded-full ">
                    <FaPencilAlt />
                  </span>
                )}
              </div>
            </span>
          );
          break;

        case 'prueba':
          const trialDate = new Date(student.trialDetails.date + 'T00:00:00');
          isExpired = trialDate < hoy_fecha;
          style = 'bg-cyan-200';

          const asistio = asistenciaPruebasMap[student.id];

          content = (
            <span>
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center truncate">
                  {student.es_cupo_extra && (
                    <span className="text-yellow-600 text-xl">
                      <IoAlertCircle />
                    </span>
                  )}
                  {student.name}
                </div>
                {componente_badge_asistencia}
              </div>
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
          const esVisita = student.scheduledDetails?.date && !student.scheduledDetails?.promisedDate;// Si no hay fecha programada pero sí hay fecha prometida, es una renovación reprogramada
          const fechaRelevante =
            student.scheduledDetails?.promisedDate ||
            student.scheduledDetails.date;
          const scheduledDate = new Date(fechaRelevante + 'T00:00:00');
          isExpired = scheduledDate < hoy_fecha;
          style = esVisita ? 'bg-cyan-200' : "bg-yellow-200";
          content = (
            <span>
              <div className="flex items-center justify-between min-w-0">
                <div className="flex items-center truncate">
                  {student.es_cupo_extra && (
                    <span className="text-yellow-600 text-xl">
                      <IoAlertCircle />
                    </span>
                  )}
                  {student.name}
                </div>
                {componente_badge_asistencia}
              </div>
              <span className="text-xs italic">
                {esVisita ? 'Visita' : 'Renueva'} el{' '}
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
        countTrialsInOtherDaysOfGroup('LUNES', hour).count;
      const miercolesLibres =
        cupoMaximoPilates -
        (schedule[`MIÉRCOLES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('MIÉRCOLES', hour).count;
      const viernesLibres =
        cupoMaximoPilates -
        (schedule[`VIERNES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('VIERNES', hour).count;
      const martesLibres =
        cupoMaximoPilates -
        (schedule[`MARTES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('MARTES', hour).count;
      const juevesLibres =
        cupoMaximoPilates -
        (schedule[`JUEVES-${hour}`]?.alumnos || []).length -
        countTrialsInOtherDaysOfGroup('JUEVES', hour).count;

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
          expiryDate = new Date((student.scheduledDetails.promisedDate || student.scheduledDetails.date) + 'T00:00:00');
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
      else if (person.plan === 'Cualquier dia')
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

  const handleAbrirCambioTurno = (alumno) => {
    setAlumnoCambioTurno(alumno);
    setHorariosCambioTurno(
      generarHorariosConCupos(schedule, cupoMaximoPilates)
    );
    setIsModalCambioTurno(true);
  };

  const manejarReprogramarTurno = () => {
    setHorariosCambioTurno(
      generarHorariosConCupos(schedule, cupoMaximoPilates)
    );
  }

  const {
    horariosDeshabilitados, // Almacena los horarios que han sido ocultados
    detalleHorariosDeshabilitados, // Detalles adicionales sobre los horarios ocultos
    manejarDeshabilitarHorario, // Función para ocultar un horario específico
    manejarHabilitarHorario, // Función para mostrar un horario previamente ocultado
    puedeDeshabilitarHorario // Función que verifica si el usuario tiene permisos para ocultar horarios
  } = useHorariosDeshabilitados({
    sedeActualFiltro,
    schedule, // Necesario para validar si hay alumnos
    rol, // Necesario para permisos
    userId, // Necesario para saber quién oculta
    puedeEditarSede, // Necesario para validación de permisos
    userLevel // Necesario para validación de permisos
  });

  const {
    altaHistorialAlumno, // Función para crear el historial de un alumno (Se usa solo cuando se da de alta un alumno por primera vez)
    crearHistorialAlumno // Función para registrar cambios en el historial de un alumno cuando se hacen modificaciones
  } = useHistorialAlumnos();

  const {
    horariosMinimizados, // Almacena los horarios que han sido minimizados
    alternarMinimizacionHorario, // Función para minimizar o maximizar un horario específico
    manejarMinimizacionGlobal // Función para minimizar o maximizar todos los horarios
  } = useGrillaMinimizada(); // Lógica para manejar la minimización de la grilla de horarios

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
      isModalAyuda,
      isModalCambioTurno,
      isConfirmModalOpen,
      personToConfirm,
      freeSlots,
      alumnoCambioTurno,
      horariosCambioTurno,
      horariosDeshabilitados,
      detalleHorariosDeshabilitados,
      horariosMinimizados,
      ausentesData,
      errorAusentesData,
      isLoadingAusentesData,
      isModalReglas
    },
    setters: {
      setSection,
      setSedeActualFiltro,
      setIsModalProfesorOpen,
      setSearchTerm,
      setIsModalOpen,
      setIsModalCambioTurno,
      setIsModalDetalleAusentes,
      setIsModalAyuda,
      setIsConfirmModalOpen,
      setIsModalReglas
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
      marcarEstadosAlumnoListaEspera,
      handleConfirmationComplete,
      handleAbrirCambioTurno,
      manejarReprogramarTurno,
      generarHorariosConCupos,
      handleSaveCambioTurno,
      handleSaveWaitingListCambio,
      manejarDeshabilitarHorario,
      manejarHabilitarHorario,
      puedeDeshabilitarHorario,
      alternarMinimizacionHorario,
      manejarMinimizacionGlobal,
      refetchAusentes,
      refrescarHorarios: refetch,
    }
  };
};

export default PilatesGestionLogica;
