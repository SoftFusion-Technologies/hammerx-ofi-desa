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

  // Estado para almacenar la lista de Sedess
  const [Sedes, setSedes] = useState([]);

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

  // Función para obtener todos los Agrupadors desde la API
  const obtenerSedess = async () => {
    try {
      const response = await axios.get(URL);
      setSedes(response.data);
    } catch (error) {
      console.log('Error al obtener los Agrupadors:', error);
    }
  };

  const handleEliminarSedes = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arraySedes = Sedes.filter((Sedes) => Sedes.id !== id);

        setSedes(arraySedes);
      } catch (error) {
        console.log(error);
      }
    }
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
                          {Sedes.created_at}
                        </td>
                        {/* ACCIONES */}
                        {(userLevel === 'admin' ||
                          userLevel === 'administrador') && (
                          <td className="">
                            <button
                              onClick={() => handleEliminarSedes(Sedes.id)}
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
          />
        </div>
      </div>
      {/* {selectedSedes && (
        <SedesDetails
          Sedes={selectedSedes}
          setSelectedSedes={setSelectedSedes}
          isOpen={modalSedesDetails}
          onClose={() => setModalSedesDetails(false)}
        />
      )} */}

      <Footer />
    </>
  );
};

export default SedesGet;
