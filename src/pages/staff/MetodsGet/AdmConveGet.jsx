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
import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatearFecha } from "../../../Helpers";
import { Link } from "react-router-dom";
import NavbarStaff from "../NavbarStaff";
import "../../../styles/MetodsGet/Tabla.css";
import "../../../styles/staff/background.css";
import Footer from "../../../components/footer/Footer";
import FormAltaConve from "../../../components/Forms/FormAltaConve";
import IntegranteConveGet from "./IntegranteConveGet";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../../AuthContext';

const AdmConveGet = () => {
  // Estado para almacenar la lista de personas
  const [conve, setConve] = useState([]);
  const [modalNewConve, setmodalNewConve] = useState(false);
  const [integrantes, setIntegrantes] = useState([]);

  const [selectedConve, setSelectedConve] = useState(null);
  const [selectedConve2, setSelectedConve2] = useState(null);
  
  const navigate = useNavigate(); // Hook para navegación

  const { userLevel } = useAuth();

  const abrirModal = () => {
    setmodalNewConve(true);
    setSelectedConve2(null);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
    obtenerConves();
  };
  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState("");

  //URL estatica, luego cambiar por variable de entorno
  const URL = "http://localhost:8080/admconvenios/";

  const handleVerIntegrantes = (id) => {
    setSelectedConve(id);
    navigate(`/dashboard/integrantes?id_conv=${id}`);
  };
  useEffect(() => {
    // utilizamos get para obtenerPersonas los datos contenidos en la url
    axios.get(URL).then((res) => {
      setConve(res.data);
      obtenerConves();
    });
  }, []);

  // Función para obtener todos los personClass desde la API
  const obtenerConves = async () => {
    try {
      const response = await axios.get(URL);
      setConve(response.data);
    } catch (error) {
      console.log("Error al obtener las personas :", error);
    }
  };

  const handleEliminarConve = async (id) => {
    const confirmacion = window.confirm("¿Seguro que desea eliminar?");
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: "DELETE",
        });
        await respuesta.json();
        const arrayConve = conve.filter((conve) => conve.id !== id);

        setConve(arrayConve);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerConve = async (id) => {
    try {
      const url = `${URL}${id}`;

      console.log(url);

      const respuesta = await fetch(url);

      const resultado = await respuesta.json();

      setConve(resultado);
    } catch (error) {
      console.log(error);
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
  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className=" rounded-lg w-11/12 mx-auto pb-2">
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
                placeholder="Buscar convenio"
                className="border rounded-sm"
              />
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
              <div className="grid grid-cols-3 gap-10 mx-auto pb-10 lg:grid-cols-3 max-sm:grid-cols-1 md:grid-cols-2">
                {results.map((conve) => (
                  <div key={conve.id} className="bg-white p-6 rounded-md">
                    <h2>
                      CONVENIO:{' '}
                      <span className="font-semibold">{conve.nameConve}</span>
                    </h2>
                    <p>
                      DESCRIPCIÓN:{' '}
                      <span className="font-semibold">{conve.descConve}</span>
                    </p>
                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <p>
                        PRECIO:{' '}
                        <span className="font-semibold">
                          {conve.precio
                            ? Number(conve.precio).toLocaleString('es-AR', {
                                style: 'currency',
                                currency: 'ARS'
                              })
                            : 'Sin precio'}
                        </span>
                      </p>
                    )}
                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <p>
                        DESCUENTO:{' '}
                        <span className="font-semibold">
                          {conve.descuento
                            ? `%${conve.descuento}`
                            : 'Sin descuento'}
                        </span>
                      </p>
                    )}
                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <p>
                        PRECIO FINAL:{' '}
                        <span className="font-semibold">
                          {conve.preciofinal
                            ? Number(conve.preciofinal).toLocaleString(
                                'es-AR',
                                {
                                  style: 'currency',
                                  currency: 'ARS'
                                }
                              )
                            : 'Sin precio final'}
                        </span>
                      </p>
                    )}
                    <p>
                      <span className="font-semibold">
                        {/* {console.log('permiteFam:', conve.permiteFam)} */}
                        {Number(conve.permiteFam) === 1
                          ? `Permite familiar: ${conve.cantFamiliares}`
                          : 'No permite familiar'}
                      </span>
                    </p>
                    <Link
                      to={`/dashboard/admconvenios/${conve.id}/integrantes/`}
                    >
                      <button
                        style={{ ...styles.button, backgroundColor: '#fc4b08' }}
                      >
                        Ver Integrantes
                      </button>
                    </Link>

                    {
                      /*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */
                      (userLevel === 'admin' ||
                        userLevel === 'administrador') && (
                        <div>
                          <button
                            onClick={() => handleEliminarConve(conve.id)}
                            style={{ ...styles.button, backgroundColor: 'red' }}
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleEditarConve(conve)}
                            className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                          >
                            Editar
                          </button>
                        </div>
                      )
                    }
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
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "10px",
  },
  conveBox: {
    border: "1px solid #ccc",
    padding: "16px",
    borderRadius: "8px",
    boxSizing: "border-box",
    flex: "1 1 calc(33% - 20px)", // Ajusta el ancho para permitir más espacio entre cuadros
    margin: "10px",
    minWidth: "250px", // Ajusta el tamaño mínimo para que los cuadros no sean demasiado pequeños
  },
  button: {
    margin: "10px 10px 0px 0px",
    padding: "10px 20px",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: "#007BFF",
    color: "white",
    border: "none",
    fontSize: "14px",
  },
  // Media queries
  "@media (max-width: 1200px)": {
    conveBox: {
      flex: "1 1 calc(50% - 20px)", // Dos columnas para pantallas medianas
    },
  },
  "@media (max-width: 768px)": {
    conveBox: {
      flex: "1 1 calc(100% - 20px)", // Una columna para pantallas pequeñas
    },
  },
};

export default AdmConveGet;
