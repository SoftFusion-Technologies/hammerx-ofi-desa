import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from './NavbarStaff';
import Footer from '../../components/footer/Footer';
import { useAuth } from '../../AuthContext';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import FormAltaAlumno from '../../components/Forms/FormAltaAlumno';
import AlumnoDetails from './MetodsGet/Details/AlumnoGetId';

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
  const [userId, setUserId] = useState(null);

  const [error, setError] = useState(null);
  const { userName, userLevel } = useAuth();

  // estado para obtener el nombre y el email del instructor
  const [nombreInstructor, setNombreInstructor] = useState('');
  const [emailInstructor, setEmailInstructor] = useState('');

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); // Obtener el email de los parámetros de consulta

  const [modalNewAlumn, setModalNewAlumn] = useState(false);
  const [selectedAlumn, setSelectedAlumn] = useState(null); // Estado para el usuario seleccionado

  const [modalAlumnoDetails, setModalAlumnoDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

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
            setUserId(user.id); // Guardar el ID del usuario en el estado
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
    const obtenerEmailInstructor = async () => {
      try {
        const response = await axios.get(`${URL}users/${user_id}`);
        setNombreInstructor(response.data.name);
        setEmailInstructor(response.data.email);
      } catch (error) {
        console.error('Error al obtener el instructor:', error);
      }
    };

    obtenerEmailInstructor();
  }, [user_id]);

  // Cargar los registros de alumnos al iniciar el componente
  const fetchAlumnos = async () => {
    try {
      const responseAlumnos = await axios.get(`${URL}alumnos`);
      const responseAsistencias = await axios.get(`${URL}asistencias`);
      const responseAgendas = await axios.get(`${URL}agendas`);

      // Filtrar alumnos por user_id
      const alumnosFiltrados =
        userLevel === 'instructor'
          ? responseAlumnos.data.filter((alumno) => alumno.user_id === userId)
          : responseAlumnos.data.filter((alumno) => alumno.email === email);

      // Inicializar asistencias y agendas para cada alumno filtrado
      const alumnosConAsistencias = alumnosFiltrados
        .map((alumno) => {
          const asistenciasDelAlumno = Array(31).fill(''); // Inicializar asistencias
          const agendasDelAlumno = responseAgendas.data
            .filter((agenda) => agenda.alumno_id === alumno.id)
            .map((agenda) => agenda.contenido || '');

          // Llenar asistencias basadas en las asistencias existentes
          responseAsistencias.data.forEach((asistencia) => {
            if (asistencia.alumno_id === alumno.id) {
              const diaIndex = asistencia.dia - 1; // Convertir día a índice (0-30)
              if (diaIndex >= 0 && diaIndex < 31) {
                asistenciasDelAlumno[diaIndex] = asistencia.estado;
              }
            }
          });

          // Lógica para agendas completa
          const agendasCompleta =
            agendasDelAlumno.length < 5
              ? [
                  ...agendasDelAlumno,
                  ...Array(5 - agendasDelAlumno.length).fill('')
                ]
              : agendasDelAlumno;

          // Filtrar asistencias para el alumno y calcular total
          const asistenciasDelAlumno2 = responseAsistencias.data.filter(
            (asistencia) => asistencia.alumno_id === alumno.id
          );

          const totalAsistencias = asistenciasDelAlumno2.reduce(
            (total, asistencia) => total + (asistencia.estado === 'P' ? 1 : 0),
            0
          );

          return {
            ...alumno,
            asistencias: asistenciasDelAlumno,
            agendas: agendasCompleta, // Agregar las agendas
            punto_d: alumno.punto_d || '',
            totalAsistencias
          };
        })
        .sort((a, b) => a.nombre.localeCompare(b.nombre));

      // Llenar las filas restantes hasta 100 \\ aumentar ese numero en caso de que se necesiten mas filas
      const filasRestantes = 10 - alumnosConAsistencias.length;
      const filasVacias = Array.from({ length: filasRestantes }, () => ({
        id: null,
        nombre: '',
        punto_d: '',
        motivo: '',
        asistencias: Array(31).fill(''),
        agendas: Array(5).fill(''),
        totalAsistencias: 0
      }));

      // De esta forma mostramos en la planilla los datos
      const allRows = [...alumnosConAsistencias, ...filasVacias];
      setRows(allRows);
      setFilteredAlumnos(allRows);
    } catch (error) {
      console.error('Error fetching alumnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumnos();
  }, [URL, userId]);
  // Filtrar alumnos cuando cambia el valor de búsqueda
  useEffect(() => {
    if (search.trim() === '') {
      setFilteredAlumnos(rows); // Si no hay búsqueda, muestra todos los alumnos
    } else {
      const filtered = rows.filter((alumno) =>
        alumno.nombre?.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredAlumnos(filtered);
    }
  }, [search, rows]);

  // Manejar cambios en las celdas
  const handleInputChange = (rowIndex, field, value) => {
    setRows((prevRows) => {
      const newRows = [...prevRows];
      const updatedRow = { ...newRows[rowIndex] }; // Clonar la fila específica

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
        console.log(updatedRow.c);
      } else {
        updatedRow[field] = value;
      }

      newRows[rowIndex] = updatedRow; // Actualizar la fila específica
      return newRows; // Retornar el nuevo estado
    });
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
        const alumnoId = rows[rowIndex].id;
        console.log(alumnoId);
        console.log(rowIndex);
        console.log(idAlumno);

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
      } catch (error) {
        console.error('Error al eliminar el registro:', error);
        alert('Error al eliminar el registro. Intenta nuevamente.');
      }
    }
  };

  const handleSaveAsistencias = async (rowIndex, asistencias) => {
    const alumnoId = rows[rowIndex].id; // Obtener el ID del alumno correspondiente

    try {
      // Iterar sobre las asistencias y enviar solo aquellas que cambian de 'P' a 'A' o de 'A' a 'P'
      for (let index = 0; index < asistencias.length; index++) {
        const nuevoEstado = asistencias[index]; // Obtener el nuevo estado para el día actual
        const dia = index + 1; // Días empezando desde 1

        // Solo enviar si el nuevo estado está definido (es decir, no vacío y no 'N')

        if (nuevoEstado && nuevoEstado !== 'N') {
          // Verifica si ya existe un registro de asistencia
          const checkResponse = await fetch(
            `${URL}asistencias/${alumnoId}/${dia}`
          );
          const checkData = await checkResponse.json();

          if (checkData.existe) {
            // Obtener el ID de la asistencia
            const existingRecordId = checkData.id; // Asumimos que tienes acceso a esto

            // Obtener el estado actual del registro existente
            const existingRecordResponse = await fetch(
              `${URL}asistencias/${alumnoId}/${dia}`
            );

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
                  `Error al actualizar la asistencia del día ${dia}`
                );
              }

              const data = await response.json();
              console.log(
                `Asistencia para el día ${dia} actualizada:`,
                data.message
              );
            } else {
              console.log(`No hay cambios necesarios para el día ${dia}.`);
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
                dia: dia,
                estado: nuevoEstado
              })
            });

            if (!response.ok) {
              throw new Error(`Error al guardar la asistencia del día ${dia}`);
            }

            const data = await response.json();
            console.log(
              `Asistencia para el día ${dia} guardada:`,
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
    fetchAlumnos();
  };

  // Obtenemos el id del alumno que se filtro - Baltazar Almiron - 11/11/2024
  const obtenerIdAlumnoPorSearch = () => {
    // Buscar el alumno que coincide con el valor de 'search'
    const alumnoEncontrado = filteredAlumnos.find(
      (alumno) => alumno.nombre.toLowerCase() === search.toLowerCase()
    );
    // Retornar el id si se encuentra el alumno, o null si no existe coincidencia
    return alumnoEncontrado ? alumnoEncontrado.id : null;
  };

  const idAlumno_recf = obtenerIdAlumnoPorSearch();
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
          `${URL}asistencias/${alumnoId}/${dia}`
        );
        const checkData = await checkResponse.json();

        if (checkData.existe) {
          continue; // Si existe hacemos que continue con el ciclo for
        } else {
          // Si no existe, crear un nuevo registro
          const response = await fetch(`${URL}asistencias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              alumno_id: alumnoId,
              dia: dia,
              estado: 'P'
            })
          });

          fetchAlumnos();
          if (!response.ok) {
            throw new Error(`Error al guardar la asistencia del día ${dia}`);
          }

          const data = await response.json();
          console.log(`Asistencia para el día ${dia} guardada:`, data.message);
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

        fetchAlumnos();
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = filteredAlumnos.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(filteredAlumnos.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

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

  // Función para determinar el color del alumno usando JavaScript nativo
  const determinarColorAlumno = (fechaCreacion) => {
    const fechaCreacionDate = new Date(fechaCreacion);
    const mesActual = new Date().getMonth();
    const mesCreacion = fechaCreacionDate.getMonth();

    // Retorna el color en función de si el alumno es "nuevo" o no
    return mesCreacion === mesActual ? 'green' : 'black';
  };

  return (
    <>
      <NavBar />
      <div className="overflow-x-auto mt-20">
        {(userLevel === 'admin' ||
          userLevel === 'gerente' ||
          userLevel === 'administrador') && (
          <div className="pl-5 pt-5">
            <Link to="/dashboard/instructores">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                Volver
              </button>
            </Link>
          </div>
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
          <div className="flex justify-center pb-10">
            <button
              onClick={abrirModal}
              className="bg-[#58b35e] hover:bg-[#4e8a52] text-white pb-3 py-2 px-4 rounded transition-colors duration-100 z-10"
            >
              Nuevo Alumno
            </button>
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
          </div>
        )}

        <table className="min-w-full border-collapse table-auto border border-gray-400">
          <thead>
            <tr className="tr-planilla">
              <th className="border border-gray-400 px-2">#</th>
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
                  <td className="border border-gray-400">
                    <input
                      type="text"
                      className={`w-40 px-2 py-3 ${
                        determinarColorAlumno(row.fecha_creacion) === 'green'
                          ? 'text-green-400'
                          : 'text-black'
                      }`}
                      value={row.nombre}
                      onChange={(e) =>
                        handleInputChange(rowIndex, 'nombre', e.target.value)
                      }
                    />
                  </td>

                  <td className="border border-gray-400 px-2">
                    {prospectoLabels[row.prospecto] || ''}
                  </td>

                  <td className="border border-gray-400">
                    <input
                      type="text"
                      className="w-10 px-2 py-3 uppercase"
                      value={row.c || ''}
                      disabled={row.prospecto !== 'prospecto'} // Desactiva si no es "prospecto"
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
                      className="w-full px-2 py-3"
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

                  {row.agendas.map((agenda, agendaIndex) => (
                    <td key={agendaIndex} className="border border-gray-400">
                      <input
                        type="text"
                        disabled
                        className="w-full px-2 py-1"
                        value={agenda || ''} // Asegura que el campo sea editable aunque esté vacío
                        onChange={(e) => {
                          // Crea una copia del array de agendas actual
                          const updatedAgendas = [...row.agendas];
                          // Actualiza solo la agenda específica
                          updatedAgendas[agendaIndex] = e.target.value;

                          // Actualiza la fila en el estado `rows`
                          handleInputChange(
                            rowIndex,
                            'agendas',
                            updatedAgendas
                          );

                          // Llamar a la función para guardar solo esta agenda en la base de datos
                          handleSaveAgenda(
                            rowIndex,
                            agendaIndex,
                            e.target.value
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
                      &#10060; {/* Símbolo de cruz */}
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
          </tbody>
        </table>

        <div className="flex justify-center">
          <nav className="flex justify-center items-center my-10">
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
      </div>
      {selectedAlumn && (
        <AlumnoDetails
          alumno={selectedAlumn}
          setSelectedAlumn={setSelectedAlumn}
          isOpen={modalAlumnoDetails}
          onClose={() => setModalAlumnoDetails(false)}
        />
      )}
      <Footer />
    </>
  );
};

export default PlanillaEntrenador;