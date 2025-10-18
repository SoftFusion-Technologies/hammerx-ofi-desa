import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import NavBar from './NavbarStaff';
import Footer from '../../components/footer/Footer';
import { useAuth } from '../../AuthContext';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import FormAltaAlumno from '../../components/Forms/FormAltaAlumno';
import AlumnoDetails from './MetodsGet/Details/AlumnoGetId';
import UploadImageModal from '../../components/Forms/ModalUploads/UploadImageModal';
import NotificationsAgendas from './NotificationsAgendas';
import * as XLSX from 'xlsx';
import { formatearFecha } from '../../Helpers/index';
import FilterBar from '../../pages/staff/Components/FilterBar';
import Swal from 'sweetalert2';
import ModalCargarQueja from './Components/ModalCargarQueja';

const PlanillaEntrenador = () => {
  const URL = 'http://localhost:8080/';

  const [rows, setRows] = useState([]); // estado que almacena los alumnos
  const [search, setSearch] = useState(''); // estado de busquedas
  const [filteredAlumnos, setFilteredAlumnos] = useState([]);

  const location = useLocation();
  const { user_id } = useParams(); // ID recibido del parametro cuando se logea un usuario que no es instructor

  // estado de carga
  const [loading, setLoading] = useState(true);

  // estado para obtener el id del usuario conectado
  // const [userId, setUserId] = useState(null);

  const [error, setError] = useState(null);
  const { userName, userLevel, userId } = useAuth();

  // estado para obtener el nombre y el email del instructor
  const [nombreInstructor, setNombreInstructor] = useState('');
  const [emailInstructor, setEmailInstructor] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); // Obtener el email de los parámetros de consulta

  const [modalNewAlumn, setModalNewAlumn] = useState(false);
  const [selectedAlumn, setSelectedAlumn] = useState(null); // Estado para el usuario seleccionado

  const [modalAlumnoDetails, setModalAlumnoDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  // para subir imagenes a las agendas inicio
  const [selectedAgendaIndex, setSelectedAgendaIndex] = useState(null);
  const [selectedAlumnoId, setSelectedAlumnoId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [agendas, setAgendas] = useState([]); // Estado para almacenar las agendas
  const [selectedAgendaId, setSelectedAgendaId] = useState(null); // Para almacenar el id de la agenda
  const [selectedAgendaNum, setSelectedAgendaNum] = useState(null); // Para almacenar el id de la agenda
  // para subir imagenes a las agendas fin

  const [day, setDay] = useState(''); // Día actual
  // esto es para obtener las asistencias del día actual y deshabilitar el botón si tiene una asistencia
  const [asistencias, setAsistencias] = useState([]);
  const [botonesDeshabilitados, setBotonesDeshabilitados] = useState({}); // Estado para controlar los botones

  const [dayNumberG, setDayNumber] = useState(null); // Estado para el número del día

  const currentDate = new Date();
  const mesActual = currentDate.getMonth() + 1; // getMonth() devuelve el mes en base a 0, por eso sumamos 1
  const anioActual = currentDate.getFullYear(); // Devuelve el año completo

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [currentYear] = useState(new Date().getFullYear()); // Año actual
  const [selectedYear, setSelectedYear] = useState(currentYear); // Año seleccionado

  const [currentMonth] = useState(new Date().getMonth() + 1); // Mes actual
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // Mes seleccionado
  const [selectedMonthName, setSelectedMonthName] = useState(''); // Nombre del mes seleccionado
  // Estados adicionales
  const [deleteYear, setDeleteYear] = useState('');

  const [alumnosNuevos, setAlumnosNuevos] = useState([]); // Estado para los alumnos nuevos

  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'P' | 'N' | 'NMA'

  const [nPrevKinds, setNPrevKinds] = useState(
    new Set(['prospecto_c', 'nuevo'])
  );

  const [prosKinds, setProsKinds] = useState(new Set(['conv', 'no_conv']));

  useEffect(() => {
    if (statusFilter === 'N_PREV') {
      setNPrevKinds(new Set(['prospecto_c', 'nuevo', 'legacy']));
    }
  }, [statusFilter]);

  const [mesSel, setMesSel] = useState(new Date().getMonth() + 1);
  const [anioSel, setAnioSel] = useState(new Date().getFullYear());
  const [asistenciasMes, setAsistenciasMes] = useState([]);

  const [instructorSede, setInstructorSede] = useState('');
  const [instructorLevel, setInstructorLevel] = useState(userLevel || '');

  const API_BASE = 'http://localhost:8080';

  const [openQuejaModal, setOpenQuejaModal] = useState(false);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  // instructor meta (ya la tenés o similar)
  const instructor = {
    email: userName,
    sede: instructorSede,
    level: userLevel
  };

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data: users } = await axios.get(`${API_BASE}/users`);
        const me = users?.find(
          (u) =>
            (u?.email || '').toLowerCase() === (userName || '').toLowerCase()
        );
        if (me) {
          setInstructorSede(me.sede || '');
          setInstructorLevel(me.level || '');
        }
      } catch (e) {
        console.log('No se pudo obtener la sede del profe', e);
      }
    };
    loadMe();
  }, [userName]);

  useEffect(() => {
    // Trae SOLO el mes/año seleccionados
    (async () => {
      try {
        const res = await fetch(
          `${URL}asistencias?mes=${selectedMonth}&anio=${selectedYear}`
        );
        const data = await res.json();
        setAsistenciasMes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error asistencias mes:', e);
        setAsistenciasMes([]);
      }
    })();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    // Función para convertir el número del mes al nombre del mes
    const getMonthName = (month) => {
      const months = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE'
      ];
      return months[month - 1];
    };

    // Actualizar el nombre del mes seleccionado
    setSelectedMonthName(getMonthName(selectedMonth));

    // Cargar los datos para el mes seleccionado
    fetchAlumnos(selectedMonth, selectedYear);
  }, [selectedMonth]); // Solo se ejecuta cuando `selectedMonth` cambia

  useEffect(() => {
    // Obtener la fecha actual
    const today = new Date();
    // Formatear la fecha para obtener solo los primeros dos dígitos (día)
    const day = String(today.getDate()).padStart(2, '0'); // Asegura que tenga dos dígitos (ej. "01", "23")

    setDay(day);
  }, []);

  useEffect(() => {
    if (!day) return; // Si day no está definido, no hacer la consulta

    // console.log('Realizando consulta a la API para el día:', day); // Log antes del fetch

    fetchAsistencias();
  }, [day]); // Ejecutar cada vez que day cambie

  const fetchAsistencias = async () => {
    try {
      const response = await fetch(`${URL}asistencia/${day}`);
      const data = await response.json();

      console.log('Datos de asistencias:', data);
      console.log('Día actual:', day);

      // Si no hay registros para el día, setear asistencias a un array vacío
      if (data.mensaje && data.mensaje.includes('No hay registros')) {
        setAsistencias([]);
      } else {
        setAsistencias(data);
        const nuevosBotonesDeshabilitados = {};

        data.forEach((asistencia) => {
          if (asistencia.estado === 'P') {
            nuevosBotonesDeshabilitados[asistencia.alumno_id] = true;
          } else {
            nuevosBotonesDeshabilitados[asistencia.alumno_id] = false;
          }
        });

        setBotonesDeshabilitados(nuevosBotonesDeshabilitados);
      }
    } catch (error) {
      console.error('Error al obtener las asistencias:', error);
    }
  };

  useEffect(() => {
    const getUserIdByEmail = async () => {
      try {
        if (userLevel === 'instructor') {
          // Verificamos si el nivel es 'instructor'
          const response = await fetch(`${URL}users/`);

          if (!response.ok) {
            throw new Error(
              `Error al obtener los usuarios: ${response.statusText}`
            );
          }

          const users = await response.json();

          // Buscar el usuario por email, ya que el nivel es 'instructor'
          const user = users.find((u) => u.email === userName);

          if (user) {
            // setUserId(user.id); // Guardar el ID del usuario en el estado
            console.log(`ID del usuario ${userName}:`, user.id);
            setNombreInstructor(user.name);
          } else {
            console.log(`Usuario con email ${userName} no encontrado`);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getUserIdByEmail();
  }, [userName, userLevel]); // Aseguramos que el efecto se ejecute si cambia el userLevel o userName

  useEffect(() => {
    if (!user_id) return; // Evita la petición si no hay user_id

    const obtenerEmailInstructor = async () => {
      try {
        const response = await axios.get(`${URL}users/${user_id}`);

        if (response.data) {
          setNombreInstructor(response.data.name);
          setEmailInstructor(response.data.email);
        } else {
          console.warn('Usuario no encontrado');
        }
      } catch (error) {
        console.error('Error al obtener el instructor:', error);
      }
    };

    obtenerEmailInstructor();
  }, [user_id]);

  // Cargar los registros de alumnos al iniciar el componente
  const fetchAlumnos = async (month, selectedYear) => {
    try {
      setLoading(true);

      // Hacer las tres requests en paralelo
      const [responseAlumnos, responseAsistencias, responseAgendas] =
        await Promise.all([
          axios.get(`${URL}alumnos`, {
            params: { mes: month, anio: selectedYear }
          }),
          axios.get(`${URL}asistencias`, {
            params: { mes: month, anio: selectedYear }
          }),
          axios.get(`${URL}agendas`, {
            params: { mes: month, anio: selectedYear }
          })
        ]);

      // Filtrar alumnos por email (usuario actual)
      const alumnosFiltrados = responseAlumnos.data.filter(
        (alumno) => alumno.email === email
      );

      // Armar diccionarios para acceso rápido
      const asistenciasPorAlumno = {};
      responseAsistencias.data.forEach((asistencia) => {
        if (!asistenciasPorAlumno[asistencia.alumno_id])
          asistenciasPorAlumno[asistencia.alumno_id] = [];
        asistenciasPorAlumno[asistencia.alumno_id].push(asistencia);
      });

      const agendasPorAlumno = {};
      responseAgendas.data.forEach((agenda) => {
        if (!agendasPorAlumno[agenda.alumno_id])
          agendasPorAlumno[agenda.alumno_id] = [];
        agendasPorAlumno[agenda.alumno_id].push(agenda);
      });

      // Procesar cada alumno
      const alumnosConAsistencias = alumnosFiltrados
        .map((alumno) => {
          // Inicializar asistencias (31 días)
          const asistencias = Array(31).fill('');
          (asistenciasPorAlumno[alumno.id] || []).forEach((asistencia) => {
            const diaIndex = asistencia.dia - 1;
            if (diaIndex >= 0 && diaIndex < 31) {
              asistencias[diaIndex] = asistencia.estado;
            }
          });

          // Inicializar agendas (6)
          let agendasCompleta = Array(6).fill({
            id: null,
            agenda_num: null,
            contenido: ''
          });
          (agendasPorAlumno[alumno.id] || []).forEach((agenda) => {
            agendasCompleta[agenda.agenda_num - 1] = agenda;
          });

          // Calcular total de asistencias 'P'
          const totalAsistencias = (
            asistenciasPorAlumno[alumno.id] || []
          ).reduce(
            (total, asistencia) => total + (asistencia.estado === 'P' ? 1 : 0),
            0
          );

          return {
            ...alumno,
            asistencias,
            agendas: agendasCompleta,
            punto_d: alumno.punto_d || '',
            totalAsistencias
          };
        })
        .sort((a, b) => {
          if (b.totalAsistencias !== a.totalAsistencias) {
            return b.totalAsistencias - a.totalAsistencias;
          }
          return a.nombre.localeCompare(b.nombre);
        });

      // Llenar las filas restantes hasta 20 (o el número que quieras)
      const filasRestantes = 20 - alumnosConAsistencias.length;
      const filasVacias = Array.from(
        { length: Math.max(filasRestantes, 0) },
        () => ({
          id: null,
          nombre: '',
          punto_d: '',
          motivo: '',
          asistencias: Array(31).fill(''),
          agendas: Array(6).fill(''),
          totalAsistencias: 0
        })
      );

      // Juntar y setear rows
      const allRows = [...alumnosConAsistencias, ...filasVacias];
      setRows(allRows);
      // setFilteredAlumnos(allRows);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos(currentMonth, selectedYear);
  }, [URL, userId, currentMonth, currentYear]);

  // Filtrar alumnos cuando cambia el valor de búsqueda
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredAlumnos(rows); // Si no hay búsqueda, muestra todos los alumnos
    } else {
      const filtered = rows.filter((alumno) =>
        alumno.nombre?.toLowerCase().includes(search.toLowerCase())
      );

      setFilteredAlumnos(filtered);

      // Validar que la página actual no exceda el número de páginas disponibles
      const maxPage = Math.ceil(filtered.length / itemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(maxPage > 0 ? maxPage : 1);
      }
    }
  }, [search, rows, currentPage, itemsPerPage]);

  // Manejar cambios en las celdas
  const handleInputChange = (rowIndex, field, value) => {
    setRows((prevRows) => {
      // Calcular el índice absoluto basado en la página actual
      const absoluteIndex = firstIndex + rowIndex;

      const newRows = [...prevRows];
      const updatedRow = { ...newRows[absoluteIndex] }; // Clonar la fila específica

      if (field === 'asistencias') {
        updatedRow.asistencias = value;
        updatedRow.totalAsistencias = value.filter(
          (a) => a.toUpperCase() === 'P'
        ).length; // Contar tanto 'P' como 'p'
      } else if (field === 'agendas') {
        updatedRow.agendas = value; // Actualizar el array completo de agendas
      } else if (field === 'celular') {
        updatedRow.celular = value; // Actualizar el número de celular
      } else if (field === 'c' && updatedRow.prospecto === 'prospecto') {
        // Solo permitir actualizar "c" si "prospecto" es "prospecto"
        updatedRow.c = value;
      } else {
        updatedRow[field] = value;
      }

      newRows[absoluteIndex] = updatedRow; // Actualizar la fila específica
      return newRows; // Retornar el nuevo estado
    });

    // Mantener la página actual
    setCurrentPage(currentPage);
  };

  // Función para editar un alumno desde los campos de la planilla
  const handleEdit = async (rowIndex) => {
    const alumno = rows[rowIndex]; // Obtener el ID del alumno correspondiente

    if (alumno && alumno.id) {
      // Si existe, realizar la actualización
      const confirmEdit = window.confirm(
        '¿Estás seguro de que deseas editar este alumno?'
      );
      if (confirmEdit) {
        try {
          const response = await fetch(`${URL}alumnos/${alumno.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(alumno) // Enviar los datos del alumno
          });

          if (!response.ok) {
            throw new Error('Error al actualizar el registro');
          } else {
            alert('Registro actualizado correctamente');
          }

          const data = await response.json();
          console.log(data.message); // Mensaje de éxito
          // Actualiza el estado si es necesario
        } catch (error) {
          console.error('Error al editar el alumno:', error);
        }
      }
    } else {
      // Si no existe, crear un nuevo registro
      const confirmCreate = window.confirm('¿Deseas crear un nuevo alumno?');
      if (confirmCreate) {
        try {
          const newAlumno = {
            nombre: alumno.nombre, // Valor del input de nombre
            prospecto: '',
            c: '',
            email: email || userName, //userName es el email del usuario
            celular: alumno.celular || '', // Valor del input de celular
            punto_d: alumno.punto_d || '', // Valor del input de punto_d
            motivo: alumno.motivo || '', // Valor del input de punto_d
            user_id: userId || user_id // Valor levantado del id del usuario
          };

          // console.log('datos del alumno', newAlumno);

          const response = await fetch(`${URL}alumnos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newAlumno)
          });

          if (!response.ok) {
            throw new Error('Error al crear el registro');
          } else {
            alert('Registro creado correctamente');
          }

          const data = await response.json();
          console.log(data.message);
        } catch (error) {
          console.error('Error al crear el alumno:', error);
        }
      }
    }
  };

  // Funcion para eliminar un alumno desde la cruz de la planilla
  const handleDelete = async (rowIndex) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar este alumno?'
    );

    if (confirmDelete) {
      try {
        // Obtenmos el ID del alumno que deseamos eliminar

        const globalIndex = firstIndex + rowIndex; // Índice global basado en la página
        const alumnoId = filteredAlumnos[globalIndex].id; // Obtener el ID correcto del alumno

        // Realiza la petición DELETE a la API
        const response = await fetch(`${URL}alumnos/${alumnoId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el registro');
        }

        // Actualiza el estado eliminando el alumno de la lista
        const updatedRows = rows.filter((_, index) => index !== rowIndex);
        setRows(updatedRows);

        alert('Registro eliminado correctamente');
        fetchAlumnos(currentMonth, currentYear);
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        alert('Error al eliminar el registro. Intenta nuevamente.');
      }
    }
  };

  const handleSaveAsistencias = async (rowIndex, asistencias) => {
    // const alumnoId = rows[rowIndex].id; // Obtener el ID del alumno correspondiente

    const globalIndex = firstIndex + rowIndex; // Índice global basado en la página
    const alumnoId = filteredAlumnos[globalIndex].id; // Obtener el ID correcto del alumno

    console.log('id alumno', alumnoId);

    // if (dayNumberG !== null) {
    //   if (dayNumberG < day - 1) {
    //     alert('ACCIÓN NO PERMITIDA!!!');
    //     return;
    //   }
    //   if (dayNumberG > day) {
    //     alert('ACCIÓN NO PERMITIDA!!!');
    //     return;
    //   }
    // }
    try {
      // Iterar sobre las asistencias y enviar solo aquellas que cambian de 'P' a 'A' o de 'A' a 'P'
      for (let index = 0; index < asistencias.length; index++) {
        const nuevoEstado = asistencias[index]; // Obtener el nuevo estado para el día actual
        const dayy = index + 1; // Días empezando desde 1

        // Solo enviar si el nuevo estado está definido (es decir, no vacío y no 'N')

        if (nuevoEstado && nuevoEstado !== 'N') {
          // Verifica si ya existe un registro de asistencia
          const checkResponse = await fetch(
            `${URL}asistencias/${alumnoId}/${dayy}/${mesActual}/${anioActual}`
          );
          const checkData = await checkResponse.json();

          if (checkData.existe) {
            // Obtener el ID de la asistencia
            const existingRecordId = checkData.id; // Asumimos que tienes acceso a esto

            // Obtener el estado actual del registro existente
            const existingRecordResponse = await fetch(
              `${URL}asistencias/${alumnoId}/${dayy}/${mesActual}/${anioActual}`
            );
            console.log(alumnoId);

            console.log(existingRecordId);
            const existingRecordData = await existingRecordResponse.json();

            // console.log(existingRecordData.estado);
            // Solo actualizar si hay un cambio de 'P' a 'A' o de 'A' a 'P'
            if (
              (existingRecordData.estado === 'P' && nuevoEstado === 'A') ||
              (existingRecordData.estado === 'A' && nuevoEstado === 'P')
            ) {
              const response = await fetch(
                `${URL}asistencias/${existingRecordId}`,
                {
                  method: 'PUT', // Suponiendo que tienes un endpoint para actualizar
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    estado: nuevoEstado
                  })
                }
              );

              if (!response.ok) {
                throw new Error(
                  `Error al actualizar la asistencia del día ${day}`
                );
              }

              const data = await response.json();
              console.log(
                `Asistencia para el día ${day} actualizada:`,
                data.message
              );
            } else {
              console.log(`No hay cambios necesarios para el día ${day}.`);
            }
          } else {
            // Si no existe, crear un nuevo registro
            const response = await fetch(`${URL}asistencias`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                alumno_id: alumnoId,
                dia: dayy,
                estado: nuevoEstado,
                mes: mesActual,
                anio: anioActual
              })
            });

            if (!response.ok) {
              throw new Error(`Error al guardar la asistencia del día ${dayy}`);
            }

            const data = await response.json();
            console.log(
              `Asistencia para el día ${dayy} guardada:`,
              data.message
            );
          }
        }
      }

      // Actualiza el estado local después de guardar todas las asistencias
      handleInputChange(rowIndex, 'asistencias', asistencias);
    } catch (error) {
      console.error('Error al guardar las asistencias:', error);
    }
  };

  const handleSaveAgenda = async (rowIndex, agendaIndex, contenido) => {
    const alumnoId = rows[rowIndex].id; // Obtener el ID del alumno correspondiente
    const agendaNum = agendaIndex + 1; // Número de la agenda (1 a 5)

    try {
      // Verificar si ya existe la agenda para este alumno y agenda_num
      const checkResponse = await fetch(
        `${URL}agendas/${alumnoId}/${agendaNum}`
      );
      const checkData = await checkResponse.json();

      if (checkData.existe) {
        // Actualizar la agenda si ya existe
        await fetch(`${URL}agendas/${checkData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contenido })
        });
        console.log(
          `Agenda ${agendaNum} actualizada para el alumno ${alumnoId}`
        );

        setRows((prevRows) => {
          const newRows = [...prevRows];
          newRows[rowIndex].agendas[agendaIndex] = contenido; // Actualiza la agenda en el estado
          return newRows;
        });
      } else {
        // Crear una nueva agenda si no existe
        await fetch(`${URL}agendas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            alumno_id: alumnoId,
            agenda_num: agendaNum,
            contenido
          })
        });
        console.log(`Agenda ${agendaNum} creada para el alumno ${alumnoId}`);

        // También actualiza el estado local aquí
        setRows((prevRows) => {
          const newRows = [...prevRows];
          newRows[rowIndex].agendas[agendaIndex] = contenido; // Actualiza la agenda en el estado
          return newRows;
        });
      }
    } catch (error) {
      console.error('Error al guardar la agenda:', error);
    }
  };

  // Función para limpiar el número
  const cleanPhoneNumber = (number) => {
    return number.replace(/\D/g, ''); // Elimina cualquier carácter que no sea un dígito
  };

  const abrirModal = () => {
    setModalNewAlumn(true);
  };

  const cerarModal = () => {
    setModalNewAlumn(false);
    fetchAlumnos(currentMonth, currentYear);
  };

  // Obtenemos el id del alumno que se filtro - Baltazar Almiron - 11/11/2024
  const obtenerIdAlumnoPorSearch = () => {
    // Buscar el alumno que contiene el valor de 'search' en su nombre
    const alumnoEncontrado = filteredAlumnos.find((alumno) =>
      alumno.nombre.toLowerCase().includes(search.toLowerCase())
    );
    // Retornar el id si se encuentra el alumno, o null si no existe coincidencia
    return alumnoEncontrado ? alumnoEncontrado.id : null;
  };

  const idAlumno_recf = obtenerIdAlumnoPorSearch();
  // console.log(idAlumno_recf);
  // console.log(rows); // Muestra el id del alumno o null si no se encontró

  //boton de PRESENTE para un alumno en particular - Baltazar Almiron - 11/11/2024
  const handleBotonAsistencia = async (idAlumno) => {
    const alumnoId = idAlumno; // Obtener el ID del alumno correspondiente

    try {
      // Iterar sobre las asistencias y enviar solo aquellas que cambian de 'P' a 'A' o de 'A' a 'P'
      for (let index = 0; index < 31; index++) {
        const dia = index + 1; // Días empezando desde 1

        // Verifica si ya existe un registro de asistencia
        const checkResponse = await fetch(
          `${URL}asistencias/${alumnoId}/${day}/${mesActual}/${anioActual}`
        );

        const checkData = await checkResponse.json();

        if (checkData.existe) {
          if (checkData.estado === 'A') {
            // Si el estado existente es 'A', realizar un update
            const updateResponse = await fetch(
              `${URL}asistencias/${checkData.id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  estado: 'P' // Cambiar el estado a 'P'
                })
              }
            );

            if (!updateResponse.ok) {
              throw new Error(
                `Error al actualizar la asistencia del día ${day}`
              );
            } else {
              const updateData = await updateResponse.json();
              console.log(
                `Asistencia actualizada para el día ${day}:`,
                updateData.message
              );
              alert(`Asistencia actualizada para el día ${day}`);
              fetchAsistencias();
              fetchAlumnos(currentMonth, currentYear);
            }
          }

          continue; // Si ya existe pero no es necesario actualizar, continúa con el siguiente día
        } else {
          // Si no existe, crear un nuevo registro
          const response = await fetch(`${URL}asistencias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              alumno_id: alumnoId,
              dia: day,
              estado: 'P',
              mes: mesActual,
              anio: anioActual
            })
          });

          fetchAsistencias();
          fetchAlumnos(currentMonth, currentYear);

          if (!response.ok) {
            throw new Error(`Error al guardar la asistencia del día ${day}`);
          } else {
            alert(`Alumno marcado como Presente | Dia: ${day}`);
          }

          const data = await response.json();
          console.log(`Asistencia para el día ${day} guardada:`, data.message);
          break;
        }
      }
    } catch (error) {
      console.error('Error al guardar las asistencias:', error);
    }
  };

  //boton de ELIMINAR para un alumno en particular - Baltazar Almiron - 11/11/2024
  const handleBotonDelete = async (idAlumno) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        // Realiza la petición DELETE a la API
        const response = await fetch(`${URL}alumnos/${idAlumno}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al eliminar el registro');
        }

        fetchAlumnos(currentMonth, currentYear);
        setSearch('');

        alert('Registro eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        alert('Error al eliminar el registro. Intenta nuevamente.');
      }
    }
  };

  // Definimos las etiquetas de prospecto Benjamin Orellana - 10-11-2024
  const prospectoLabels = {
    nuevo: 'N',
    prospecto: 'P',
    socio: 'S'
  };

  //funcion para obtener un alumno a editar por su id y cargar el estado - Benjamin Orellana  - 12/11/2024
  const obtenerAlumn = async (id) => {
    try {
      const url = `${URL}alumnos/${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedAlumn(resultado);
      setModalAlumnoDetails(true);
    } catch (error) {
      console.log('Error al obtener el alumno:', error);
    }
  };
  //funcion para abrir el modal con un alumno a editar por su id - Benjamin Orellana  - 12/11/2024
  const handleEditarAlumno = async (alumno) => {
    await obtenerAlumn(alumno);
    setModalNewAlumn(true);
    // si presionamos editar, no mostramos los detalles del alumno
    setModalAlumnoDetails(false);
  };

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = filteredAlumnos.slice(firstIndex, lastIndex);
  // const nPage = Math.ceil(filteredAlumnos.length / itemsPerPage);

  const openModal = async (rowIndex, agendaIndex, agendaIdRec) => {
    try {
      const alumnoId = rows[rowIndex].id; // obtenemos el id
      const alumnoNombre = rows[rowIndex].nombre || 'desconocido'; // obtenemos el nombre de rows

      // Hacemos un fetch a la API para obtener las agendas del alumno
      const response = await axios.get(`${URL}agendas?alumno_id=${alumnoId}`);
      const agendas = response.data; // Suponemos que la respuesta contiene un arreglo de agendas

      // Buscar la agenda correspondiente a esta celda
      let selectedAgenda = agendas.find((agenda) => agenda.id === agendaIdRec);

      console.log('Agenda seleccionada:', selectedAgenda);

      // Si no se encuentra una agenda y estamos en las agendas 5 o 6 debemos crear una para que se abra el modal
      if (!selectedAgenda && (agendaIndex === 4 || agendaIndex === 5)) {
        const agendaNum = agendaIndex === 4 ? 5 : 6; // Determinar el número de la agenda

        // Confirmación del usuario con nombre del alumno
        const confirmCreate = window.confirm(
          `No se encontró una agenda ${agendaNum} para el alumno ${alumnoNombre} (ID: ${alumnoId}). ¿Desea crearla?`
        );

        if (!confirmCreate) {
          console.log('El usuario canceló la creación de la agenda.');
          return; // Salir de la función si el usuario cancela
        }

        console.log(
          `Creando agenda ${agendaNum} para el alumno ${alumnoNombre}...`
        );

        // Crear la nueva agenda
        const createResponse = await axios.post(`${URL}agendas`, {
          alumno_id: alumnoId,
          agenda_num: agendaNum,
          contenido: '+' // Contenido predeterminado o inicial
        });

        // Obtener la agenda recién creada
        selectedAgenda = createResponse.data.agenda;
        console.log('Agenda creada:', selectedAgenda);
      }

      // Si se encuentra o se acaba de crear una agenda válida
      if (selectedAgenda) {
        const agendaId = selectedAgenda.id; // Obtener el ID de la agenda
        const agendaNum = selectedAgenda.agenda_num; // Obtener el número de la agenda

        // Establecer los estados para abrir el modal
        setSelectedAgendaIndex(agendaIndex);
        setSelectedAlumnoId(alumnoId);
        setSelectedAgendaId(agendaId); // Guardamos el ID de la agenda
        setSelectedAgendaNum(agendaNum); // Guardamos el número de la agenda
        setAgendas(agendas);

        // Abrir el modal
        setModalOpen(true);
      } else {
        console.error('No se pudo crear ni obtener la agenda.');
      }
    } catch (error) {
      console.error('Error al manejar las agendas:', error);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAgendaIndex(null);
    setSelectedAlumnoId(null);
  };

  // Función para exportar los datos a Excel
  const exportToExcel = () => {
    const today = new Date();

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new();

    // Definir las cabeceras de la hoja
    // Primero agregamos una fila con la información del instructor y la fecha
    // Definir las cabeceras de la hoja
    const header = [
      [`Instructor: ${nombreInstructor}`, `Fecha: ${formatearFecha(today)}`], // Fila con el nombre del instructor y la fecha
      [], // Fila vacía para separar de la cabecera
      [
        '#',
        'P',
        'APELLIDO Y NOMBRE',
        'N/A/P',
        'C',
        'CELULAR',
        'PUNTO D',
        ...Array.from({ length: 31 }, (_, i) => `Día ${i + 1}`),
        'T',
        'Nuevo Primera Semana',
        'Nuevo 3ra semana',
        'Clase/semana de prueba',
        'Inactivo',
        'Devolución final',
        'Otros agendamientos',
        'OBSERVACIONES'
      ]
    ];

    // Crear la matriz de datos completa
    const wsData = [
      ...header, // Esto concatena las filas del header
      ...rows.map((alumno, rowIndex) => [
        rowIndex + 1,
        'P',
        alumno.nombre,
        alumno.prospecto,
        alumno.c,
        alumno.celular,
        alumno.punto_d,
        ...alumno.asistencias.map((asistencia) =>
          asistencia ? asistencia : ''
        ), // Verifica si asistencia es null/undefined
        alumno.totalAsistencias,
        ...alumno.agendas.map((agenda) => (agenda ? agenda.contenido : '')), // Verifica si agenda es null/undefined
        alumno.motivo
      ])
    ];

    // Crear la hoja de trabajo
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Estilos para las cabeceras
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '1F4E79' } }, // Azul oscuro para la cabecera
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Estilos para las filas de datos
    const dataStyle = {
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };

    // Estilo para resaltar filas alternadas
    const stripedStyle = {
      fill: { fgColor: { rgb: 'D9E1F2' } } // Color gris claro
    };

    // Aplicar estilos a las cabeceras
    for (let col = 0; col < header.length; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) {
        cell.s = headerStyle;
      }
    }

    // Aplicar estilos a las filas de datos (excepto la cabecera)
    for (let row = 1; row < wsData.length; row++) {
      for (let col = 0; col < header.length; col++) {
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) {
          // Estilo alternado para filas
          if (row % 2 === 0) {
            cell.s = { ...dataStyle, ...stripedStyle }; // Filas pares con color alterno
          } else {
            cell.s = dataStyle; // Filas impares sin color alterno
          }
        }
      }
    }

    // Establecer estilos especiales para las columnas de Asistencias y Agendas
    const asistenciaStyle = {
      fill: { fgColor: { rgb: 'B6D7A8' } }, // Verde claro para asistencias
      font: { color: { rgb: '1D4418' } }, // Texto verde oscuro
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const agendaStyle = {
      fill: { fgColor: { rgb: 'FFEB9C' } }, // Amarillo claro para agendas
      font: { color: { rgb: '9C6500' } }, // Texto amarillo oscuro
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Aplicar estilos a las celdas de asistencias (de columna 7 a 37)
    for (let row = 1; row < wsData.length; row++) {
      for (let col = 7; col < 7 + 31; col++) {
        // Asistencias (Día 1 a Día 31)
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) {
          cell.s = asistenciaStyle;
        }
      }
      // Aplicar estilos a las celdas de agendas (últimas columnas)
      for (let col = header.length - 6; col < header.length; col++) {
        // Agendas
        const cell = ws[XLSX.utils.encode_cell({ r: row, c: col })];
        if (cell) {
          cell.s = agendaStyle;
        }
      }
    }

    // Ajustar el ancho de las columnas
    const colWidths = header.map((col, index) => ({
      wpx: index === 0 ? 50 : 100 // Ancho específico para la columna de índices
    }));
    ws['!cols'] = colWidths;

    // Agregar la hoja al libro de trabajo
    XLSX.utils.book_append_sheet(wb, ws, 'Alumnos');

    // Exportar el archivo Excel con el nombre adecuado
    XLSX.writeFile(
      wb,
      `Planilla_Instructor_${nombreInstructor}_${formatearFecha(today)}.xlsx`
    );
  };

  // Función para determinar si el alumno debe ser pintado de verde
  function shouldHighlightGreen(fecha_creacion, prospecto) {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Mes actual (0-11)
    const currentYear = currentDate.getFullYear(); // Año actual

    // Obtener el mes y año de la fecha de creación del alumno
    const creationDate = new Date(fecha_creacion);
    const creationMonth = creationDate.getMonth();
    const creationYear = creationDate.getFullYear();

    // Verificar si el prospecto es 'nuevo' y si el mes de creación es el mes anterior
    return (
      prospecto === 'nuevo' &&
      (currentMonth === creationMonth + 1 ||
        (currentMonth === 0 && creationMonth === 11)) &&
      currentYear === creationYear
    );
  }

  // Crear un arreglo de colores
  const colores = records.map((row) =>
    shouldHighlightGreen(row.fecha_creacion, row.prospecto) ? 'green' : 'black'
  );

  // Función para retroceder al mes anterior
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prevYear) => prevYear - 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prevYear) => prevYear + 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth + 1);
    }
  };

  const handleMassDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas borrar todos los registros de asistencias y agendas del mes ${selectedMonth} del año ${deleteYear}?`
    );

    if (!confirmDelete) return;

    try {
      // Borrar asistencias
      await axios.delete(`${URL}asistencias_masivo`, {
        params: { mes: selectedMonth, anio: deleteYear }
      });

      // Borrar agendas
      await axios.delete(`${URL}agendas_masivo`, {
        params: { mes: selectedMonth, anio: deleteYear }
      });

      alert(
        `Registros del mes ${selectedMonth} del año ${deleteYear} borrados exitosamente.`
      );

      fetchAlumnos(currentMonth, currentYear);
    } catch (error) {
      console.error(error);
      alert('Ocurrió un error al intentar borrar los registros.');
    }
  };

  const handleBotonAsistencia_v2 = async (idAlumno) => {
    const currentDate = new Date();
    const dia = currentDate.getDate();
    const mes = currentDate.getMonth() + 1; // Mes actual (base 0, sumar 1)
    const anio = currentDate.getFullYear();

    try {
      // Verificar si ya existe un registro para el día actual
      const checkResponse = await fetch(
        `${URL}asistencias/${idAlumno}/${dia}/${mes}/${anio}`
      );
      const checkData = await checkResponse.json();

      if (checkData.existe) {
        // Si existe el registro, actualiza el estado
        if (checkData.estado === 'A') {
          const updateResponse = await fetch(
            `${URL}asistencias/${checkData.id}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ estado: 'P' }) // Cambiar a presente
            }
          );

          if (updateResponse.ok) {
            const updateData = await updateResponse.json();
            alert(`Asistencia actualizada: ${updateData.message}`);
            // Actualizar UI sin recargar toda la página
            fetchAlumnos(currentMonth, currentYear);
            fetchAsistencias();
          } else {
            alert.error(`Error al actualizar la asistencia.`);
          }
        } else {
          alert(`El estado ya es 'P'.`);
        }
      } else {
        // Si no existe, crea un nuevo registro
        const createResponse = await fetch(`${URL}asistencias`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            alumno_id: idAlumno,
            dia,
            estado: 'P',
            mes,
            anio
          })
        });

        if (createResponse.ok) {
          const createData = await createResponse.json();
          alert(`Asistencia creada: ${createData.message}`);
          fetchAlumnos(currentMonth, currentYear);
          fetchAsistencias();
        } else {
          alert.error(`Error al crear la asistencia.`);
        }
      }
    } catch (error) {
      alert.error('Error al manejar la asistencia:', error);
    }
  };

  useEffect(() => {
    const obtenerAlumnosNuevos = async () => {
      try {
        const response = await fetch('http://localhost:8080/alumnos_nuevos');
        const data = await response.json();
        setAlumnosNuevos(data);
      } catch (error) {
        console.error('Error al obtener alumnos nuevos:', error);
      }
    };
    obtenerAlumnosNuevos();
  }, []);

  // Función para verificar si el alumno está en alumnos_nuevos y tiene marca = 1
  const obtenerColorFondo = (idAlumno) => {
    const alumnoEncontrado = alumnosNuevos.find(
      (alumno) => alumno.idAlumno === idAlumno && alumno.marca === 1
    );
    return alumnoEncontrado ? 'yellow' : '';
  };

  // NUEVO: set con ids marcados (mes anterior)
  const nuevosMesAnteriorIds = useMemo(() => {
    return new Set(
      (alumnosNuevos || [])
        .filter((a) => a?.marca === 1 && a?.idAlumno != null)
        .map((a) => a.idAlumno)
    );
  }, [alumnosNuevos]);

  const handleActualizarMes = async (alumnoId) => {
    try {
      const response = await axios.post(`${URL}actualizar-mes`, {
        id: alumnoId,
        mesBusqueda: selectedMonth
      });

      if (response.data.msg) {
        alert(response.data.msg);
        fetchAlumnos(selectedMonth, selectedYear); // Actualizás la tabla
        setSelectedYear(anioActual);
        setSelectedMonth(mesActual);
      }
    } catch (error) {
      console.error('Error al actualizar mes:', error);
      alert('Error al actualizar mes. Reintente.');
    }
  };

  // ...dentro de tu componente principal
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNotification(true);
    }, 3000); // 3 segundos

    // Limpia el timeout si el componente se desmonta antes
    return () => clearTimeout(timer);
  }, []);

  // --- IDs con ≥6 asistencias "P" en el mes/año seleccionados
  const sociosMesIds = useMemo(() => {
    const counts = new Map(); // alumno_id -> cantidad de P
    for (const a of asistenciasMes) {
      const esP = a?.estado === 'P';
      const mismoMes = Number(a?.mes) === Number(selectedMonth);
      const mismoAnio = Number(a?.anio) === Number(selectedYear);
      if (esP && mismoMes && mismoAnio) {
        const id = Number(a.alumno_id);
        counts.set(id, (counts.get(id) || 0) + 1);
      }
    }
    const ok = new Set();
    for (const [alumnoId, cant] of counts) if (cant >= 6) ok.add(alumnoId);
    return ok;
  }, [asistenciasMes, selectedMonth, selectedYear]);

  const applyFilters = (
    rows,
    status,
    { nuevosMesAnteriorIds, nPrevKinds, sociosMesIds, prosKinds }
  ) => {
    // Mapeo rápido para etiquetas visibles (compatibilidad)
    const prospectoLabels = { nuevo: 'N', prospecto: 'P', socio: 'S' };

    // 🔧 Normalizador robusto: admite 'P/N/S' y 'prospecto/nuevo/socio'
    const getLabel = (v) => {
      const raw = (v ?? '').toString().trim().toLowerCase();
      if (raw === 'p' || raw === 'prospecto') return 'P';
      if (raw === 'n' || raw === 'nuevo') return 'N';
      if (raw === 's' || raw === 'socio') return 'S';
      return ''; // desconocido
    };

    let base = rows;
    if (status !== 'all') base = base.filter((al) => al?.id);

    return base.filter((al) => {
      if (status === 'all') return true;

      if (status === 'N_PREV') {
        // Debe estar pintado amarillo este mes
        if (!nuevosMesAnteriorIds?.has(al.id)) return false;

        // Mapear null/undefined a 'legacy' para registros anteriores al upgrade
        const origen = al?.socio_origen ?? 'legacy'; // 'prospecto_c' | 'nuevo' | 'legacy'

        // Si no hay selección, mostrar TODOS (PC→S, N→S y legacy)
        const selected =
          nPrevKinds && nPrevKinds.size > 0
            ? nPrevKinds
            : new Set(['prospecto_c', 'nuevo', 'legacy']);

        return selected.has(origen);
      }

      if (status === 'S_MES') {
        // 🔥 Alumnos del mes (≥6 asistencias)
        // Mostrar TODOS los alumnos (S, P, N) que tengan >=6 asistencias este mes
        return sociosMesIds?.has(Number(al.id));
      }

      if (status === 'P') {
        // 🔥 Prospectos con subfiltros
        const label = getLabel(al?.prospecto); // 'S' | 'P' | 'N'
        const cFlag = (al?.c ?? '').toString().trim().toLowerCase(); // '' | 'c'

        // Convertidos: N C o P C
        const isConvertido = cFlag === 'c' && (label === 'P' || label === 'N');

        // No convertidos: P sin 'c'
        const isNoConvertido = label === 'P' && !cFlag;

        // Si no hay selección, mostrar ambos por defecto
        const selected = prosKinds?.size
          ? prosKinds
          : new Set(['conv', 'no_conv']);

        const pasaConv = selected.has('conv') && isConvertido;
        const pasaNoConv = selected.has('no_conv') && isNoConvertido;

        return pasaConv || pasaNoConv;
      }

      // Filtros tradicionales por etiqueta
      const simple = getLabel(al?.prospecto); // usa el normalizador para P/N/S
      if (status === 'N') return simple === 'N';
      if (status === 'S') return simple === 'S';

      return true;
    });
  };

  useEffect(() => {
    setFilteredAlumnos(
      applyFilters(rows, statusFilter, {
        nuevosMesAnteriorIds,
        nPrevKinds,
        sociosMesIds,
        prosKinds
      })
    );
  }, [
    rows,
    statusFilter,
    nuevosMesAnteriorIds,
    nPrevKinds,
    sociosMesIds,
    prosKinds
  ]);

  // 1) Fuente única: aplicar filtros de estado/subfiltros/mes
  const filteredByStatus = useMemo(() => {
    return applyFilters(rows, statusFilter, {
      nuevosMesAnteriorIds,
      nPrevKinds,
      sociosMesIds, // depende de selectedMonth/Year: ya lo tenés
      prosKinds
    });
  }, [
    rows,
    statusFilter,
    nuevosMesAnteriorIds,
    nPrevKinds,
    sociosMesIds,
    prosKinds
  ]);

  // 2) Búsqueda (NO pisar con rows cuando search == '')
  const filteredBySearch = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return filteredByStatus;
    return filteredByStatus.filter((al) =>
      (al?.nombre ?? '').toLowerCase().includes(q)
    );
  }, [filteredByStatus, search]);

  // 3) Paginación
  const nPage = Math.max(1, Math.ceil(filteredBySearch.length / itemsPerPage));
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  const currentPageSafe = Math.min(currentPage, nPage);
  const paged = useMemo(() => {
    const start = (currentPageSafe - 1) * itemsPerPage;
    return filteredBySearch.slice(start, start + itemsPerPage);
  }, [filteredBySearch, currentPageSafe, itemsPerPage]);

  // 4) Mantener currentPage consistente cuando cambian los datos filtrados
  useEffect(() => {
    if (currentPage > nPage) setCurrentPage(nPage); // si quedó fuera de rango
    if (currentPage < 1) setCurrentPage(1);
  }, [nPage]); // se recalcula cada vez que cambian filtros/búsqueda/mes y por ende cambia nPage

  // 5) Resetear a la primera página cuando cambian filtros “grandes”
  useEffect(() => {
    setCurrentPage(1);
  }, [
    statusFilter,
    prosKinds,
    nPrevKinds,
    selectedMonth,
    selectedYear,
    search
  ]);

  function prevPage() {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage < nPage) {
      setCurrentPage(currentPage + 1);
    }
  }

  return (
    <>
      <NavBar />
      <div className="overflow-x-auto mt-20">
        {(userLevel === 'admin' ||
          userLevel === 'gerente' ||
          userLevel === 'instructor' ||
          userLevel === 'administrador') && (
          <div className="pl-5 mb-10">
            <Link to="/dashboard/instructores">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                Volver
              </button>
            </Link>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center">
            <span className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#fc4b08]"></span>
            <span className="ml-3 text-[#fc4b08] font-semibold">
              Cargando alumnos...
            </span>
          </div>
        )}

        <div className="pl-5 mb-10">
          <button
            onClick={() => fetchAlumnos(currentMonth, currentYear)}
            className={`py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors ${
              loading ? 'opacity-60 cursor-wait' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Cargar Alumnos'}
          </button>
        </div>

        {showNotification && (
          <NotificationsAgendas user1={user_id} user2={userId} />
        )}

        <div className="flex justify-center">
          <h2 className="pb-5 font-bignoodle text-[#fc4b08] text-5xl">
            {nombreInstructor}
          </h2>
        </div>
        {/* Formulario de búsqueda */}
        <form className="flex justify-center items-center pb-5 space-x-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar alumno por Nombre"
            className="w-80 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm transition duration-200 ease-in-out"
          />
        </form>
        {/* Formulario de búsqueda fin */}
        {search === '' ? (
          <div>
            <div className="flex justify-center ">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white pb-3 py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nuevo Alumno
              </button>

              {userLevel !== 'instructor' && (
                <button
                  className="ml-2 bg-[#58b35e] hover:bg-[#4e8a52] text-white pb-3 py-2 px-4 rounded transition-colors duration-100 z-10"
                  onClick={exportToExcel}
                >
                  Exportar a Excel
                </button>
              )}
            </div>

            <div className="flex justify-center">
              <nav className="flex justify-center items-center my-5">
                <ul className="pagination">
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={prevPage}>
                      Prev
                    </a>
                  </li>
                  {numbers.map((number, index) => (
                    <li
                      className={`page-item ${
                        currentPage === number ? 'active' : ''
                      }`}
                      key={index}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={() => changeCPage(number)}
                      >
                        {number}
                      </a>
                    </li>
                  ))}
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold text-orange-600">
                {selectedMonthName} {selectedYear}
              </h1>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300"
                  onClick={handlePreviousMonth}
                >
                  Mes Anterior
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    selectedMonth === selectedMonth
                      ? 'bg-orange-500 text-white hover:bg-orange-600 '
                      : 'bg-orange-500 text-white hover:bg-orange-600 transition duration-300'
                  }`}
                  onClick={handleNextMonth}
                >
                  Mes Siguiente
                </button>
              </div>
              {userLevel !== 'instructor' && selectedMonth < currentMonth && (
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-gray-700 font-medium">
                    Ingrese el año a borrar (se BORRAN todas las asistencias y
                    agendas del mes de{' '}
                    <span className="text-red-600">{selectedMonthName}</span> y
                    el año que ingrese en el campo)
                  </label>
                  <input
                    type="number"
                    value={deleteYear}
                    onChange={(e) => setDeleteYear(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded w-32 text-center"
                    placeholder="Año"
                  />
                  <button
                    className={`px-4 py-2 rounded ${
                      deleteYear
                        ? 'bg-red-500 text-white hover:bg-red-600 transition duration-300'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleMassDelete}
                    disabled={!deleteYear}
                  >
                    Borrado Masivo
                  </button>
                </div>
              )}
            </div>
            <h1 className="ml-2 uppercase font-bold text-xl">
              Cantidad de páginas: {nPage}
            </h1>
            <h1 className="ml-2 mt-2 uppercase font-bold text-xl">
              Pagina Actual: {currentPage}
            </h1>
          </div>
        ) : (
          <div className="flex flex-col items-center pb-10">
            <div className="flex justify-center space-x-2">
              {/* botón para poner presente */}
              <button
                onClick={() => handleBotonAsistencia(idAlumno_recf)}
                className={`pb-3 py-2 px-4 rounded transition-colors duration-100 z-10 ${
                  idAlumno_recf === null
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-[#58b35e] hover:bg-[#4e8a52] text-white'
                }`}
                disabled={idAlumno_recf === null}
              >
                Presente
              </button>

              {/* botón para editar */}
              <button
                onClick={() => handleEditarAlumno(idAlumno_recf)}
                className={`pb-3 py-2 px-4 rounded transition-colors duration-100 z-10 ${
                  idAlumno_recf === null
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
                disabled={idAlumno_recf === null}
              >
                Editar
              </button>

              {/* botón para eliminar */}
              <button
                onClick={() => handleBotonDelete(idAlumno_recf)}
                className={`pb-3 py-2 px-4 rounded transition-colors duration-100 z-10 ${
                  idAlumno_recf === null
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
                disabled={idAlumno_recf === null}
              >
                Eliminar
              </button>
              {/* NUEVO: Cargar queja */}
              <button
                onClick={() => {
                  const alumno = filteredAlumnos.find(
                    (a) => a.id === idAlumno_recf
                  );
                  if (!alumno) {
                    Swal.fire(
                      'Atención',
                      'No hay alumno seleccionado.',
                      'info'
                    );
                    return;
                  }
                  setAlumnoSeleccionado(alumno);
                  setOpenQuejaModal(true);
                }}
                className={`pb-3 py-2 px-4 rounded transition-colors duration-100 z-10 ${
                  idAlumno_recf === null
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                disabled={idAlumno_recf === null}
              >
                Cargar queja
              </button>
            </div>

            {/* botón para ver detalles */}
            <div className="pt-3">
              <button
                onClick={() => obtenerAlumn(idAlumno_recf)}
                className={`pb-3 py-2 px-4 rounded transition-colors duration-100 z-10 ${
                  idAlumno_recf === null
                    ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                }`}
                disabled={idAlumno_recf === null}
              >
                Ver Detalles
              </button>
            </div>
            <div className="flex flex-col items-center space-y-4">
              <h1 className="text-3xl font-bold text-orange-600">
                {selectedMonthName} {selectedYear}
              </h1>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition duration-300"
                  onClick={handlePreviousMonth}
                >
                  Mes Anterior
                </button>
                <button
                  className={`px-4 py-2 rounded ${
                    selectedMonth === selectedMonth
                      ? 'bg-orange-500 text-white hover:bg-orange-600 '
                      : 'bg-orange-500 text-white hover:bg-orange-600 transition duration-300'
                  }`}
                  onClick={handleNextMonth}
                >
                  Mes Siguiente
                </button>
              </div>
              {userLevel !== 'instructor' && selectedMonth < currentMonth && (
                <div className="flex flex-col items-center space-y-2">
                  <label className="text-gray-700 font-medium">
                    Ingrese el año a borrar (se BORRAN todas las asistencias y
                    agendas del mes de{' '}
                    <span className="text-red-600">{selectedMonthName}</span> y
                    el año que ingrese en el campo)
                  </label>
                  <input
                    type="number"
                    value={deleteYear}
                    onChange={(e) => setDeleteYear(e.target.value)}
                    className="border border-gray-300 px-3 py-2 rounded w-32 text-center"
                    placeholder="Año"
                  />
                  <button
                    className={`px-4 py-2 rounded ${
                      deleteYear
                        ? 'bg-red-500 text-white hover:bg-red-600 transition duration-300'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleMassDelete}
                    disabled={!deleteYear}
                  >
                    Borrado Masivo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onClear={() => setStatusFilter('all')}
          sourceRows={rows}
          nuevosMesAnteriorIds={nuevosMesAnteriorIds}
          nPrevKinds={nPrevKinds}
          setNPrevKinds={setNPrevKinds}
          sociosMesIds={sociosMesIds}
          prosKinds={prosKinds}
          setProsKinds={setProsKinds}
        />

        <table className="min-w-full border-collapse table-auto border border-gray-400">
          <thead>
            <tr className="tr-planilla">
              <th className="border border-gray-400 px-2">#</th>
              <th className="border border-gray-400 px-2">P</th>
              <th className="border border-gray-400 px-2">APELLIDO Y NOMBRE</th>
              {/* Nueva columna para Prospecto */}
              <th className="border border-gray-400 px-2">N/A/P</th>{' '}
              {/* Nueva columna para C */}
              <th className="border border-gray-400 px-2">C</th>{' '}
              <th className="border border-gray-400 px-2">CELULAR</th>{' '}
              <th className="border border-gray-400 px-2">PUNTO D</th>
              {Array.from({ length: 31 }, (_, i) => (
                <th key={i} className="border border-gray-400 px-2">
                  Día {i + 1}
                </th>
              ))}
              <th className="border border-gray-400 px-2">T</th>
              {/* {Array.from({ length: 5 }, (_, i) => (
                <th key={i} className="border border-gray-400 px-2">
                  Agenda {i + 1}
                </th>
              ))} */}
              {/* Nueva forma de mostrar Agendas INICIO / Benjamin Orellana / 8/11/24 */}
              <th className="border border-gray-400 px-2 uppercase">
                Nuevo Primera Semana
              </th>
              <th className="border border-gray-400 px-2 uppercase">
                Nuevo 3ra semana
              </th>
              <th className="border border-gray-400 px-2 uppercase">
                Clase/semana de prueba{' '}
              </th>
              <th className="border border-gray-400 px-2 uppercase">
                Inactivo{' '}
              </th>
              <th className="border border-gray-400 px-2 uppercase">
                Devolución final
              </th>
              <th className="border border-gray-400 px-2 uppercase">
                Otros agendamientos
              </th>
              {/* Nueva forma de mostrar Agendas FINAL / Benjamin Orellana / 8/11/24 */}
              <th className="border border-gray-400 px-2 uppercase">
                OBSERVACIONES
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? ( // Mostrar mensaje de carga mientras se obtienen los datos
              <tr>
                <td colSpan={37} className="text-center py-4">
                  Cargando...
                </td>
              </tr>
            ) : (
              records.map((row, rowIndex) => (
                <tr key={rowIndex} className="tr-planilla">
                  <td className="border border-gray-400 text-center">
                    {rowIndex + 1}
                  </td>

                  <td className="border mt-3 text-center flex justify-center items-center gap-2">
                    {/* Botón P: mantiene el diseño y validación */}
                    <button
                      className={`px-4 py-2 font-bold rounded focus:outline-none ${
                        botonesDeshabilitados[row.id]
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      onClick={() =>
                        !botonesDeshabilitados[row.id] &&
                        handleBotonAsistencia_v2(row.id)
                      }
                      disabled={botonesDeshabilitados[row.id]}
                    >
                      P
                    </button>
                    {(selectedYear < anioActual ||
                      (selectedYear === anioActual &&
                        selectedMonth < mesActual)) && (
                      <button
                        className="px-4 py-2 font-bold rounded bg-orange-600 text-white"
                        type="button"
                        onClick={() => handleActualizarMes(row.id)}
                      >
                        N
                      </button>
                    )}
                  </td>

                  <td className="border border-gray-400 relative">
                    <input
                      type="text"
                      className={`w-40 px-2 py-3 uppercase`}
                      value={row.nombre}
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'nombre', e.target.value)
                      }
                      style={{
                        backgroundColor: obtenerColorFondo(row.id)
                      }}
                    />

                    {(() => {
                      const agendaPendiente = (row.agendas || []).find(
                        (a) => a.agenda_num === 4 && a.contenido === 'PENDIENTE'
                      );

                      // console.log(
                      //   'AGENDAS DEL ALUMNO',
                      //   row.nombre,
                      //   row.agendas
                      // );

                      if (!agendaPendiente) return null;

                      // console.log(
                      //   'Fecha de creación:',
                      //   agendaPendiente.fecha_creacion
                      // );

                      const fechaCreacion = new Date(
                        agendaPendiente.fecha_creacion
                      );
                      const hoy = new Date();

                      const fechaCreacionUTC = new Date(
                        fechaCreacion.getFullYear(),
                        fechaCreacion.getMonth(),
                        fechaCreacion.getDate()
                      );
                      const hoyUTC = new Date(
                        hoy.getFullYear(),
                        hoy.getMonth(),
                        hoy.getDate()
                      );

                      const diffDias = Math.floor(
                        (hoyUTC - fechaCreacionUTC) / (1000 * 60 * 60 * 24)
                      );

                      // console.log('Días de diferencia:', diffDias);

                      let bgColor = '';
                      if (diffDias >= 10) bgColor = '#dc2626';
                      else if (diffDias >= 5) bgColor = '#abad18';
                      else return null;

                      return (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            backgroundColor: bgColor,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            pointerEvents: 'none',
                            userSelect: 'none',
                            zIndex: 10
                          }}
                        >
                          ALERTA
                        </div>
                      );
                    })()}
                  </td>

                  <td className="border border-gray-400 px-2">
                    {prospectoLabels[row.prospecto] || ''}
                  </td>

                  <td className="border border-gray-400">
                    <input
                      type="text"
                      className="w-10 px-2 py-3 uppercase text-center"
                      value={row.c || ''}
                      disabled
                      // ={row.prospecto !== 'prospecto'} // Desactiva si no es "prospecto"
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'c', e.target.value)
                      }
                    />
                  </td>

                  <td
                    className="border border-gray-400 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => {
                      if (row.celular) {
                        const userConfirmed = window.confirm(
                          `¿Desea ir a WhatsApp del alumno? ${row.nombre}`
                        );
                        if (userConfirmed) {
                          window.open(
                            `https://wa.me/${cleanPhoneNumber(row.celular)}`,
                            '_blank'
                          );
                        }
                      }
                    }}
                  >
                    <input
                      type="text"
                      className="w-40 px-2 py-3 text-center text-blue-600 cursor-pointer"
                      value={row.celular || ''}
                      onChange={(e) => {
                        const valorNumerico = e.target.value.replace(/\D/g, ''); // Remueve cualquier carácter no numérico
                        handleInputChange(rowIndex, 'celular', valorNumerico);
                      }}
                    />
                  </td>

                  <td className="border border-gray-400">
                    <input
                      type="text"
                      className="w-32 px-2 py-3"
                      value={row.punto_d}
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'punto_d', e.target.value)
                      }
                    />
                  </td>

                  {row.asistencias.map((asistencia, asistenciaIndex) => (
                    <td
                      key={asistenciaIndex}
                      className={`border border-gray-400 text-center font-bold ${
                        asistencia === 'P'
                          ? 'text-green-500' // Color verde para presente
                          : asistencia === 'A'
                          ? 'text-red-500' // Color rojo para ausente
                          : 'text-orange-500' // Otro color para cualquier otro valor
                      }`}
                    >
                      <input
                        type="text"
                        className="w-full px-2 py-1 text-center"
                        maxLength={1}
                        value={asistencia}
                        onChange={(e) => {
                          const dayNumber = asistenciaIndex + 1;
                          setDayNumber(dayNumber);
                          const updatedAsistencias = [...row.asistencias];
                          updatedAsistencias[asistenciaIndex] =
                            e.target.value.toUpperCase();

                          // Actualiza el estado local
                          handleInputChange(
                            rowIndex,
                            'asistencias',
                            updatedAsistencias
                          );

                          // Llama a la función para guardar las asistencias
                          handleSaveAsistencias(rowIndex, updatedAsistencias);
                        }}
                      />
                    </td>
                  ))}

                  <td className="border border-gray-400 text-center">
                    {row.totalAsistencias}
                  </td>

                  {(row.agendas || []).map((agenda, agendaIndex) => (
                    <td key={agendaIndex} className="border border-gray-400">
                      <input
                        type="text"
                        className={`w-24 px-2 py-1 text-center rounded-full ${
                          agenda?.contenido === 'REVISIÓN'
                            ? 'bg-yellow-600 text-white'
                            : agenda?.contenido === 'PENDIENTE' &&
                              agendaIndex !== 3
                            ? 'bg-red-600 text-white'
                            : agenda?.contenido === 'ENVIADO'
                            ? 'bg-green-600 text-white'
                            : ''
                        }`}
                        value={
                          agendaIndex === 3 && agenda?.contenido === 'PENDIENTE'
                            ? ''
                            : agenda?.contenido || ''
                        }
                        onClick={() =>
                          openModal(rowIndex, agendaIndex, agenda?.id)
                        }
                        onChange={(e) => {
                          const updatedAgendas = [...row.agendas];
                          updatedAgendas[agendaIndex] = e.target.value;
                          handleInputChange(
                            rowIndex,
                            'agendas',
                            updatedAgendas
                          );
                        }}
                      />
                    </td>
                  ))}

                  <td className="border border-gray-400">
                    <input
                      type="text"
                      className="w-full px-2 py-1"
                      value={row.motivo}
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'motivo', e.target.value)
                      }
                    />
                  </td>

                  <td className="border border-gray-400 text-center">
                    {/* Icono de Editar */}
                    <button
                      onClick={() => handleEdit(rowIndex)}
                      className="text-green-500 px-2 py-3"
                      title="Editar"
                    >
                      &#10003; {/* Símbolo de tilde */}
                    </button>

                    {/* Icono de Eliminar */}
                    <button
                      onClick={() => handleDelete(rowIndex)}
                      className="text-red-500 px-2"
                      title="Eliminar"
                    >
                      &#10060;
                    </button>
                  </td>
                </tr>
              ))
            )}
            {/* Modal para abrir formulario de alumno */}
            <FormAltaAlumno
              isOpen={modalNewAlumn}
              onClose={cerarModal}
              email1={userName}
              email2={email}
              user1={userId}
              user2={user_id}
              alumno={selectedAlumn}
              setSelectedAlumn={setSelectedAlumn}
            />

            {/* Modal para subir imágenes */}
            <UploadImageModal
              isOpen={modalOpen}
              onClose={closeModal}
              alumnoId={selectedAlumnoId}
              agendaId={selectedAgendaId} // Pasamos el id de la agenda
              agendaNum={selectedAgendaNum} // Pasamos el número de la agenda
              fetchAlumnos={fetchAlumnos}
              mes={mesActual}
              anio={anioActual}
            />
          </tbody>
        </table>
      </div>
      {selectedAlumn && (
        <AlumnoDetails
          alumno={selectedAlumn}
          setSelectedAlumn={setSelectedAlumn}
          isOpen={modalAlumnoDetails}
          onClose={() => setModalAlumnoDetails(false)}
        />
      )}
      <ModalCargarQueja
        isOpen={openQuejaModal}
        onClose={() => setOpenQuejaModal(false)}
        alumno={alumnoSeleccionado}
        instructor={instructor}
        apiBase="http://localhost:8080"
        onSuccess={() => {
          // opcional: refrescar listados globales o badge del alumno
          // e.g. reloadQuejasCountForAlumno(alumnoSeleccionado.id)
        }}
      />

      <Footer />
    </>
  );
};

export default PlanillaEntrenador;
