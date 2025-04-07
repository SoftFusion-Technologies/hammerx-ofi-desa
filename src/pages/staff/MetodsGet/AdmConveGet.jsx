/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AdmConveGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
 * Estos datos llegan cuando se completa el formulario de FormAltaConve
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { formatearFecha } from '../../../Helpers';
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaConve from '../../../components/Forms/FormAltaConve';
import IntegranteConveGet from './IntegranteConveGet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../AuthContext';

const AdmConveGet = () => {
  // Estado para almacenar la lista de personas
  const [conve, setConve] = useState([]);
  const [modalNewConve, setmodalNewConve] = useState(false);
  const [integrantes, setIntegrantes] = useState([]);

  const [selectedConve, setSelectedConve] = useState(null);
  const [selectedConve2, setSelectedConve2] = useState(null);
  // estado para obtener el nombre y el email del instructor
  const [nombreInstructor, setNombreInstructor] = useState('');
  const [sede, setSede] = useState('');

  const navigate = useNavigate(); // Hook para navegación

  const { userName, userLevel } = useAuth();

  const [conveArchivados, setConveArchivados] = useState([]); // nuevo estado para convenios archivados

  useEffect(() => {
    const getUserIdByEmail = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/`);

        if (!response.ok) {
          throw new Error(
            `Error al obtener los usuarios: ${response.statusText}`
          );
        }

        const users = await response.json();

        // Buscar el usuario por email
        const user = users.find((u) => u.email === userName);
        // console.log(user.sede);

        if (user) {
          // setUserId(user.id);
          setNombreInstructor(user.name);
          setSede(user.sede); // Guardar la sede en el estado
          console.log(`ID del usuario ${userName}:`, user.id);
          console.log(`Sede del usuario ${userName}:`, user.sede);
          obtenerConves(user.sede, false);
        } else {
          console.log(`Usuario con email ${userName} no encontrado`);
        }
      } catch (err) {
        console.log(`Error al obtener el usuario: ${err.message}`);
      }
    };

    getUserIdByEmail();
  }, [userName, userLevel]); // Se ejecuta cuando cambian userName o userLevel

  const normalizeSede = (sede) => {
    if (sede === 'monteros') return 'Monteros';
    if (sede === 'concepción') return 'Concepción';
    if (sede === 'smt') return 'SMT';
    return sede; // Si ya está bien escrito, lo dejamos igual
  };

  const abrirModal = () => {
    setmodalNewConve(true);
    setSelectedConve2(null);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
    obtenerConves('');
  };
  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');
  const [filterSede, setFilterSede] = useState(''); // Estado para el filtro de sede

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/admconvenios/';

  const handleVerIntegrantes = (id) => {
    setSelectedConve(id);
    navigate(`/dashboard/integrantes?id_conv=${id}`);
  };
  const obtenerConves = async (sede, mantenerFiltro = false) => {
    try {
      const response = await axios.get(URL);
      const convenios = response.data;

      // 🔥 Filtrar solo los convenios activos (archivado === 1)
      const conveniosActivos = convenios.filter((c) => c.archivado === 1);

      if (!mantenerFiltro) {
        if (userLevel === 'admin' || userLevel === 'administrador') {
          setFilterSede('');
          console.log('entraaa por admin');
        } else {
          const normalizedValue = normalizeSede(sede);
          setFilterSede(normalizedValue);
          console.log('entraaa por otro user');
        }
      }

      const conveniosFiltrados =
        userLevel === 'admin'
          ? conveniosActivos
          : filterSede === '' || filterSede === 'Multisede'
          ? conveniosActivos
          : conveniosActivos.filter((c) => c.sede === filterSede);

      setConve(conveniosFiltrados);
    } catch (error) {
      console.log('Error al obtener los convenios:', error);
    }
  };

  const obtenerConvesArchivados = async () => {
    try {
      const response = await axios.get(URL);
      const convenios = response.data;

      // Filtrar los convenios archivados (archivado = 0)
      const conveniosArchivados = convenios.filter(
        (c) => Number(c.archivado) === 0
      );

      console.log('Convenios archivados:', conveniosArchivados);
      setConveArchivados(conveniosArchivados);
    } catch (error) {
      console.log('Error al obtener los convenios archivados:', error);
    }
  };

  const handleEliminarConve = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayConve = conve.filter((conve) => conve.id !== id);

        setConve(arrayConve);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = conve;
  } else if (search) {
    results = conve.filter((dato) => {
      const nameMatch = dato.nameConve
        .toLowerCase()
        .includes(search.toLowerCase());

      return nameMatch;
    });
  }

  // Función para ordenar los conve de forma decreciente basado en el id
  const ordenarConveDecreciente = (conve) => {
    return [...conve].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los conves ordenados de forma decreciente
  const sortedConve = ordenarConveDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedConve.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedConve.length / itemsPerPage);
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

  const handleEditarConve = (conve) => {
    // (NUEVO)
    // setSelectedConve(conve);
    setSelectedConve2(conve);
    setmodalNewConve(true);
  };

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (e) => {
    const newValue = e.target.value;
    const sedeNormalizada = normalizeSede(newValue); // Aplicamos la normalización
    setFilterSede(sedeNormalizada);
    console.log('Filtro cambiado a:', sedeNormalizada); // Debugging
  };

  useEffect(() => {
    if (filterSede === 'Archivados') {
      obtenerConvesArchivados(); // Carga solo si el filtro es 'archivados'
    }
  }, [filterSede]);

  const filteredResults = useMemo(() => {
    if (!filterSede || filterSede === 'Todas las sedes') {
      return results;
    }

    // Si el filtro es 'Multisede', filtrar solo los convenios que sean de 'Multisede'
    if (filterSede === 'Multisede') {
      return results.filter((conve) => conve.sede === 'Multisede');
    }

    // Si se selecciona cualquier otra sede, filtrar por esa sede
    return results.filter((conve) => {
      const sedeNormalizada = normalizeSede(
        conve.sede?.trim().toLowerCase() || ''
      );
      return sedeNormalizada === filterSede;
    });
  }, [results, filterSede]); // Se recalcula solo cuando cambian estos valores

  const filteredArchivados = useMemo(() => {
    return conveArchivados.filter((conve) =>
      conve.nameConve.toLowerCase().includes(search.toLowerCase())
    );
  }, [conveArchivados, search]);

  const mostrarResultados =
    filterSede === 'Archivados' ? filteredArchivados : filteredResults;

  // Se recalcula solo cuando cambian estos valores

  const getFilteredSedes = () => {
    const normalizedSede = sede?.toLowerCase(); // Normaliza la sede a minúsculas

    // Si el usuario es admin, mostrar todas las sedes
    if (userLevel === 'admin' || userLevel === 'administrador') {
      return ['Todas las sedes', 'Multisede', 'Monteros', 'Concepción', 'SMT']; // Todas las sedes
    }

    // Si el usuario tiene una sede específica, mostrar solo su sede y "Multisede"
    if (normalizedSede === 'monteros') {
      return ['Monteros', 'Multisede'];
    } else if (normalizedSede === 'concepción') {
      return ['Concepción', 'Multisede'];
    } else if (normalizedSede === 'smt') {
      return ['SMT', 'Multisede'];
    }

    // Si no se encuentra una sede específica, devolver solo "Multisede"
    return ['Multisede'];
  };

  const filteredSedes = getFilteredSedes(); // Obtener las sedes filtradas según el rol del usuario

  const handleArchivarConve = async (id) => {
    try {
      await axios.put(`${URL}${id}`, { archivado: 0 }); // Cambia a 0 = archivado
      alert('Convenio archivado correctamente');
      // recargá los convenios
      obtenerConves(null, true); // ✅ No resetea el filtro actual
    } catch (error) {
      console.error('Error al archivar el convenio:', error);
      alert('Hubo un error al archivar el convenio');
    }
  };

  const handleDesarchivarConve = async (id) => {
    try {
      await axios.put(`${URL}${id}`, { archivado: 1 }); // Cambia a 1 = activo
      alert('Convenio desarchivado correctamente');
      obtenerConvesArchivados(); // Recarga los archivados
      obtenerConves(null, true); // ✅ No resetea el filtro actual
    } catch (error) {
      console.error('Error al desarchivar el convenio:', error);
      alert('Hubo un error al desarchivar el convenio');
    }
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className=" rounded-lg w-12/12 mx-auto pb-2">
          <div className="bg-white mb-5">
            <div className="pl-5 pt-5">
              <Link to="/dashboard">
                <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                  Volver
                </button>
              </Link>
            </div>
            <div className="flex justify-center">
              <h1 className="pb-5">
                Listado de Convenios: &nbsp;
                <p className="mb-2">
                  Cantidad de registros:{' '}
                  {filterSede === 'Archivados'
                    ? conveArchivados.length
                    : filteredResults.length}
                </p>
              </h1>
            </div>

            {/* formulario de busqueda */}
            <form className="flex justify-center pb-5">
              <input
                value={search}
                onChange={searcher}
                type="text"
                placeholder="Buscar convenio"
                className="border rounded-sm"
              />
              <select
                value={filterSede}
                onChange={handleFilterSedeChange}
                className="border rounded-sm ml-3"
              >
                {filteredSedes.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion}
                  </option>
                ))}
                <option value="Archivados">Archivados</option>{' '}
                {/* <- Esta es nueva */}
              </select>
            </form>
            {/* formulario de busqueda */}

            {
              /* userLevel === 'gerente' || */
              /* userLevel === 'vendedor' || */
              /* userLevel === 'convenio' || Se elimina la visualizacion para que  la persona que entre con este rol no pueda crear un convenio*/
              /* Unicos roles que pueden dar Alta un nuevo convenio */
              (userLevel === 'admin' || userLevel === 'administrador') && (
                <div className="flex justify-center pb-10">
                  <Link to="#">
                    <button
                      onClick={abrirModal}
                      className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                    >
                      Nuevo Convenio
                    </button>
                  </Link>
                </div>
              )
            }
          </div>
          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Convenio NO Existe ||{' '}
              <span className="text-span"> Convenio: {results.length}</span>
            </p>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-8 mx-auto pb-10 lg:grid-cols-5 max-sm:grid-cols-2 md:grid-cols-3">
                {mostrarResultados.map((conve) => (
                  <div
                    key={conve.id}
                    className="bg-white p-4 rounded-md max-w-xs mx-auto"
                  >
                    <h2 className="btnstaff">
                      {/* CONVENIO:{' '} */}
                      <span className="bg-white font-bignoodle w-[200px] h-[80px] text-[16px] lg:w-[250px] lg:h-[100px] lg:text-[22px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl">
                        {conve.nameConve}
                      </span>
                    </h2>

                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <p className="btnstaff mt-1 text-sm">
                        SEDE:{' '}
                        <span className="font-semibold uppercase">
                          {conve.sede}
                        </span>
                      </p>
                    )}

                    <Link
                      to={`/dashboard/admconvenios/${conve.id}/integrantes/`}
                    >
                      <button
                        style={{ ...styles.button, backgroundColor: '#fc4b08' }}
                        className="py-1 px-3 text-sm"
                      >
                        Ver Integrantes
                      </button>
                    </Link>

                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <div className="mt-2 flex space-x-2">
                        {/* Mostrar Eliminar y Editar solo si NO está archivado */}
                        {conve.archivado === 1 && (
                          <>
                            <button
                              onClick={() => handleEliminarConve(conve.id)}
                              style={{
                                ...styles.button,
                                backgroundColor: 'red'
                              }}
                              className="py-1 px-3 text-sm"
                            >
                              Eliminar
                            </button>

                            <button
                              onClick={() => handleEditarConve(conve)}
                              className="py-1 px-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                            >
                              Editar
                            </button>
                          </>
                        )}

                        {/* Mostrar botón de Archivar o Desarchivar según el filtro actual */}
                        {filterSede === 'Archivados' ? (
                          <button
                            onClick={() => handleDesarchivarConve(conve.id)}
                            className="py-1 px-3 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                          >
                            Desarchivar
                          </button>
                        ) : (
                          <button
                            onClick={() => handleArchivarConve(conve.id)}
                            className="py-1 px-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                          >
                            Archivar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {selectedConve && (
                  <IntegranteConveGet integrantes={integrantes} />
                )}
              </div>
            </div>
          )}
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaConve
            isOpen={modalNewConve}
            onClose={cerarModal}
            conve2={selectedConve2}
            setConve2={setConve}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '10px'
  },
  conveBox: {
    border: '1px solid #ccc',
    padding: '16px',
    borderRadius: '8px',
    boxSizing: 'border-box',
    flex: '1 1 calc(33% - 20px)', // Ajusta el ancho para permitir más espacio entre cuadros
    margin: '10px',
    minWidth: '250px' // Ajusta el tamaño mínimo para que los cuadros no sean demasiado pequeños
  },
  button: {
    margin: '10px 10px 0px 0px',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    fontSize: '14px'
  },
  // Media queries
  '@media (max-width: 1200px)': {
    conveBox: {
      flex: '1 1 calc(50% - 20px)' // Dos columnas para pantallas medianas
    }
  },
  '@media (max-width: 768px)': {
    conveBox: {
      flex: '1 1 calc(100% - 20px)' // Una columna para pantallas pequeñas
    }
  }
};

export default AdmConveGet;
