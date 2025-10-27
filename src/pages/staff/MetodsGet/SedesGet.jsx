/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (SedesGet.jsx) es el componente el cual renderiza los datos de los Agrupadors
 * Estos datos llegan cuando se da de alta un nuevo Agrupador
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import NavbarStaff from '../NavbarStaff';
import { Link } from 'react-router-dom';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import Swal from 'sweetalert2';
import FormAltaSedes from '../../../components/Forms/FormAltaSedes';
import SedesDetails from './SedesGetId';
import { useAuth } from '../../../AuthContext';

// Componente funcional que maneja la lógica relacionada con los Sedess
const SedesGet = () => {
  // useState que controla el modal de nuevo Agrupador
  const [modalNewSedes, setModalNewSedes] = useState(false);
  const [selectedSedes, setSelectedSedes] = useState(null); // Estado para el Agrupador seleccionado
  const [modalSedesDetails, setModalSedesDetails] = useState(false); // Estado para controlar el modal de detalles del Agrupador
  const [filterSede, setFilterSede] = useState(''); // Estado para el filtro de sede
  const [filterLevel, setFilterLevel] = useState(''); // Estado para el filtro de level (ROL)
  const { userLevel } = useAuth();

  const abrirModal = () => {
    setModalNewSedes(true);
  };
  const cerarModal = () => {
    setModalNewSedes(false);
    obtenerSedes();
  };

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/Sedes/';
  const URLmaxInscriptoCiudad = 'http://localhost:8080/sedes/alumnos/por/sede';

  // Estado para almacenar la lista de Sedess
  const [Sedes, setSedes] = useState([]);
  const [SedesMaxInscriptoCiudad, setSedesMaxInscriptoCiudad] = useState([]);

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = Sedes;
  } else {
    results = Sedes.filter((dato) => {
      const nameMatch = dato.nombre.toLowerCase().includes(search);
      return nameMatch;
    });
  }

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerAgrupadors los datos contenidos en la url
    axios.get(URL).then((res) => {
      setSedes(res.data);
      obtenerSedess();
    });
  }, []);

  useEffect(() => {
    // utilizamos get para obtenerAgrupadors los datos contenidos en la url 
    axios.get(URLmaxInscriptoCiudad).then((res) => {
      setSedesMaxInscriptoCiudad(res.data);
      obtenerSedesMaxInscriptoCiudad();
    });
  }, []);

  // Función para obtener todos los Agrupadors desde la API
  const obtenerSedess = async () => {
    try {
      const response = await axios.get(URL);
      setSedes(response.data);
    } catch (error) {
      console.log('Error al obtener los Agrupadors:', error);
    }
  };

  // Función para obtener la cantidad máxima de inscriptos en sedes que sean de ciudad
  const obtenerSedesMaxInscriptoCiudad = async () => {
    try {
      const response = await axios.get(URLmaxInscriptoCiudad);
      setSedesMaxInscriptoCiudad(response.data);
    } catch (error) {
      console.log('Error al obtener la cantidad máxima de inscriptos en sedes que sean de ciudad:', error);
    }
  };

  const handleEliminarSedes = async (id, esCiudad) => {
    const countdownStart = 10;
    let countdownInterval;

    const esCiudadBool = Boolean(esCiudad);

    const htmlCiudad =
      '<div style="text-align:left">' +
      'Esta acción eliminará de forma permanente la sede seleccionada y todos los datos vinculados a ella.<br><br>' +
      '<b>Al confirmar la eliminación, se borrarán:</b><br>' +
      '- Todos los horarios de pilates asociados a la sede.<br>' +
      '- Todas las inscripciones de clientes en esos horarios.<br>' +
      '- Todas las asistencias registradas para esas inscripciones.<br>' +
      '- Toda la lista de espera vinculada a la sede.<br>' +
      '- La sede en sí.<br><br>' +
      '<span style="color:#d9534f;font-weight:bold">⚠️ Advertencia:</span><br>' +
      'Esta acción es irreversible. Todos los datos mencionados se perderán definitivamente y no podrán recuperarse.<br>' +
      'Asegúrate de que realmente deseas eliminar la sede y toda su información asociada antes de continuar.' +
      '</div>' +
      '<div style="margin-top:16px;text-align:center;font-size:14px;">' +
      '<span style="display:block;margin-bottom:6px;">Podrás confirmar en:</span>' +
      `<span id="countdown-timer" style="font-size:18px;font-weight:bold;color:#d9534f;">${countdownStart}</span> segundos` +
      '</div>';

    const htmlNoCiudad =
      '<div style="text-align:left">' +
      'Esta acción eliminará de forma permanente la sede seleccionada.<br><br>' +
      '<span style="color:#d9534f;font-weight:bold">⚠️ Advertencia:</span><br>' +
      'Esta acción es irreversible y no podrá deshacerse.' +
      '</div>';

    Swal.fire({
      title: '¿Estás seguro que deseas eliminar la sede?',
      html: esCiudadBool ? htmlCiudad : htmlNoCiudad,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        if (!esCiudadBool) return;

        const confirmBtn = Swal.getConfirmButton();
        const countdownNode = Swal.getHtmlContainer()?.querySelector('#countdown-timer');
        if (!confirmBtn || !countdownNode) return;

        const originalText = confirmBtn.textContent;
        let remaining = countdownStart;

        const updateCountdown = () => {
          if (!countdownNode) return;
          countdownNode.textContent = String(remaining);
          confirmBtn.textContent = `Eliminar (habilitado en ${remaining}s)`;
        };

        confirmBtn.disabled = true;
        updateCountdown();

        countdownInterval = setInterval(() => {
          remaining -= 1;
          if (remaining <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = undefined;
            confirmBtn.disabled = false;
            confirmBtn.textContent = originalText;
            if (countdownNode) countdownNode.textContent = '0';
            return;
          }
          updateCountdown();
        }, 1000);
      },
      willClose: () => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = undefined;
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const url = `${URL}${id}`;
          const respuesta = await fetch(url, {
            method: 'DELETE'
          });
          await respuesta.json();
          const arraySedes = Sedes.filter((Sedes) => Sedes.id !== id);
          setSedes(arraySedes);
          Swal.fire({
            title: 'Eliminado',
            text: 'La sede y todos sus datos asociados han sido eliminados.',
            icon: 'success',
            timer: 2500,
            showConfirmButton: false
          });
        } catch (error) {
          console.log(error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al eliminar la sede.',
            icon: 'error',
            timer: 2500,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const obtenerSedes = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedSedes(resultado);
      setModalSedesDetails(true); // Abre el modal de detalles del Agrupador
    } catch (error) {
      console.log('Error al obtener el Agrupador:', error);
    }
  };

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (event) => {
    setFilterSede(event.target.value);
  };

  const applySedeFilter = (Sedes) => {
    if (!filterSede) {
      return true; // Si no hay filtro de sede seleccionado, mostrar todos los Agrupadors
    }
    const sede = Sedes.sede || ''; // Asignar una cadena vacía si `Sedes.sede` es `null` o `undefined`
    return sede.toLowerCase().includes(filterSede.toLowerCase());
  };

  // Función para manejar el cambio en el filtro de level (ROL)
  const handleFilterLevelChange = (event) => {
    setFilterLevel(event.target.value);
  };

  // Función para aplicar el filtro por level (ROL)
  const applyLevelFilter = (Sedes) => {
    if (!filterLevel) {
      return true; // Si no hay filtro de level (ROL) seleccionado, mostrar todos los Agrupadors
    }
    return Sedes.level.toLowerCase().includes(filterLevel.toLowerCase());
  };

  // Función para ordenar los integrantes de forma alfabética basado en el nombre
  const ordenarIntegranteAlfabeticamente = (Sedes) => {
    return [...Sedes].sort((a, b) => {
      const sedeA = a.sede || ''; // Reemplaza null o undefined por una cadena vacía
      const sedeB = b.sede || '';
      return sedeA.localeCompare(sedeB);
    });
  };

  // Llamada a la función para obtener los Agrupadors ordenados de forma creciente
  const sortedSedess = ordenarIntegranteAlfabeticamente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedSedess.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedSedess.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  function prevPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleEditarSedes = (Sedes) => {
    // (NUEVO)
    setSelectedSedes(Sedes);
    setModalNewSedes(true);
  };
  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                Volver
              </button>
            </Link>
          </div>
          <div className="flex justify-center">
            <h1 className="pb-5">
              Listado de Agrupadores: &nbsp;
              <span className="text-center">
                Cantidad de registros: {results.length}
              </span>
            </h1>
          </div>

          {/* formulario de busqueda */}
          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar Agrupador"
              className="border rounded-sm"
            />
          </form>
          {/* formulario de busqueda */}

          <div className="flex justify-center pb-10">
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nuevo Agrupador
              </button>
            </Link>
          </div>

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Agrupador NO Existe ||{' '}
              <span className="text-span"> Agrupador: {results.length}</span>
            </p>
          ) : (
            <>
              <table className="w-11/12 mx-auto">
                <thead className="text-white bg-[#fc4b08] ">
                  <tr key={Sedes.id}>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>¿Tiene pilates?</th>
                    <th>Capacidad</th>
                    <th>Creado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records
                    .filter(applySedeFilter)
                    .filter(applyLevelFilter)
                    .map((Sedes) => (
                      <tr key={Sedes.id}>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.id}
                        </td>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.nombre}
                        </td>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.estado}
                        </td>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.es_ciudad ? 'SI' : 'NO'}
                        </td>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.cupo_maximo_pilates ? Sedes.cupo_maximo_pilates : 'N/A'}
                        </td>
                        <td onClick={() => obtenerSedes(Sedes.id)}>
                          {Sedes.created_at}
                        </td>
                        {/* ACCIONES */}
                        {(userLevel === 'admin' ||
                          userLevel === 'administrador') && (
                          <td className="">
                            <button
                              onClick={() => handleEliminarSedes(Sedes.id, Sedes.es_ciudad)}
                              type="button"
                              className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => handleEditarSedes(Sedes)} // (NUEVO)
                              type="button"
                              className="py-2 px-4 my-1 ml-5 bg-yellow-500 text-black rounded-md hover:bg-red-600"
                            >
                              Editar
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
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
            </>
          )}
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaSedes
            isOpen={modalNewSedes}
            onClose={cerarModal}
            Sedes={selectedSedes}
            setSelectedSedes={setSelectedSedes}
            obtenerSedess={obtenerSedess}
            SedesMaxInscriptoCiudad={SedesMaxInscriptoCiudad}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SedesGet;
