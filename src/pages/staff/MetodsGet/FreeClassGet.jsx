/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (FreeClassGet.jsx) es el componente el cual renderiza los datos de los que envian para clase gratis
 * Estos datos llegan cuando se completa el formulario de Quiero probar una clase
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { formatearFecha } from '../../../Helpers';
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/TablaModerna.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import { useAuth } from '../../../AuthContext';
import { FaWhatsapp } from 'react-icons/fa';
const FreeClassGet = () => {
  const { userLevel } = useAuth();

  // Estado para almacenar la lista de personas
  const [personClass, setPersonClass] = useState([]);
  const [contactedTestClass, setContactedTestClass] = useState({});

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/testclass/';

  useEffect(() => {
    // utilizamos get para obtenerPersonas los datos contenidos en la url
    axios.get(URL).then((res) => {
      setPersonClass(res.data);
      obtenerPersonsClass();
    });
  }, []);

  // Función para obtener todos los personClass desde la API
  const obtenerPersonsClass = async () => {
    try {
      const response = await axios.get(URL);
      const testclassData = response.data;
      setPersonClass(testclassData);

      // Obtener el estado de contacto de cada testclass y actualizar el estado
      const contactedData = {};
      testclassData.forEach((test) => {
        contactedData[test.id] = test.state === '1'; // Convertir a booleano
      });
      setContactedTestClass(contactedData);
    } catch (error) {
      console.log('Error al obtener las testclass:', error);
    }
  };

  const handleEliminarPersonClass = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayPersonClass = personClass.filter(
          (personClass) => personClass.id !== id
        );

        setPersonClass(arrayPersonClass);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerPersonClass = async (id) => {
    try {
      const url = `${URL}${id}`;

      console.log(url);

      const respuesta = await fetch(url);

      const resultado = await respuesta.json();

      setPersonClass(resultado);
    } catch (error) {
      console.log(error);
    }
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = personClass;
  } else if (search) {
    results = personClass.filter((dato) => {
      const nameMatch = dato.name.toLowerCase().includes(search.toLowerCase());
      const lastNameMatch = dato.last_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const dniMatch = dato.dni.includes(search);
      const celularMatch = dato.celular.includes(search);
      const sedeMatch = dato.sede.toLowerCase().includes(search.toLowerCase());
      const objetivoMatch = dato.objetivo
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        nameMatch ||
        lastNameMatch ||
        dniMatch ||
        celularMatch ||
        sedeMatch ||
        objetivoMatch
      );
    });
  }

  // Función para ordenar los personClass de forma decreciente basado en el id
  const ordenarPersonasDecreciente = (personClass) => {
    return [...personClass].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los personClasss ordenados de forma decreciente
  const sortedpersonClass = ordenarPersonasDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedpersonClass.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedpersonClass.length / itemsPerPage);
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

  // Función para actualizar el estado de contacto en la base de datos
  const updateContactState = async (id, state) => {
    try {
      await axios.put(`${URL}${id}`, { state: state ? '1' : '0' }); // Cambiado a PUT con el estado correcto
      setContactedTestClass((prevState) => ({
        ...prevState,
        [id]: state
      }));
    } catch (error) {
      console.log('Error al actualizar el estado de contacto:', error);
    }
  };

  const contactarTestClass = (celular, id) => {
    // const link = `https://api.whatsapp.com/send/?phone=%2B549${celular}&text&type=phone_number&app_absent=0`;
    // const newWindow = window.open(link, "_blank");

    // if (newWindow) {
    //   const interval = setInterval(async () => {
    //     if (newWindow.closed) {
    //       clearInterval(interval);
    //       await updateContactState(id, true);
    //     }
    //   }, 1000); // Verificar cada segundo si la ventana se cerró
    // }
    updateContactState(id, true);
  };

  const handleContact = (celular, id) => {
    // Aquí actualiza el estado de contactedTestClass para reflejar que la persona ha sido contactada
    setContactedTestClass((prevState) => ({
      ...prevState,
      [id]: true
    }));

    // Si necesitas hacer algo más cuando se contacta, agrégalo aquí
  };

  const handleWhatsAppRedirect = (celular) => {
    // Redirecciona al chat de WhatsApp usando el número de celular
    window.open(
      `https://api.whatsapp.com/send/?phone=%2B549${celular}&text&type=phone_number&app_absent=0`,
      '_blank'
    );
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-2xl shadow-md w-11/12 mx-auto mt-6 py-6 px-4 sm:px-8">
          {/* Botón Volver */}
          <div className="mb-4">
            <Link to="/dashboard">
              <button className="inline-flex items-center gap-2 px-5 py-2 bg-[#fc4b08] hover:bg-orange-500 text-white text-sm font-semibold rounded-full shadow transition duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Volver
              </button>
            </Link>
          </div>

          {/* Título y cantidad */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-zinc-800">
              Listado de Personas
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Cantidad de registros:{' '}
              <span className="font-bold">{results.length}</span>
            </p>
          </div>

          {/* Input de búsqueda */}
          <form className="flex justify-center mb-4">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar por nombre..."
              className="w-full max-w-sm px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition duration-200"
            />
          </form>

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              La Persona NO Existe ||{' '}
              <span className="text-span"> Persona: {results.length}</span>
            </p>
          ) : (
            <>
              <div className="table-container w-full px-4">
                <table className="table-modern w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Solicitud</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>DNI</th>
                      <th>Cel</th>
                      <th>Sede</th>
                      <th>Objetivo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((personClass) => (
                      <tr
                        key={personClass.id}
                        className="transition-all duration-200"
                      >
                        <td className="py-3 px-4 font-medium text-sm text-gray-800">
                          {personClass.id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatearFecha(personClass.created_at)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.last_name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.dni}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.celular}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.sede}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {personClass.objetivo}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap justify-center items-center gap-2">
                            {(userLevel === 'admin' ||
                              userLevel === 'administrador') && (
                              <button
                                onClick={() =>
                                  handleEliminarPersonClass(personClass.id)
                                }
                                className="table-action-btn btn-eliminar"
                              >
                                Eliminar
                              </button>
                            )}

                            <button
                              onClick={() =>
                                contactarTestClass(
                                  personClass.celular,
                                  personClass.id
                                )
                              }
                              className={`table-action-btn ${
                                contactedTestClass[personClass.id]
                                  ? 'btn-contactado'
                                  : 'btn-contactar'
                              }`}
                            >
                              {contactedTestClass[personClass.id]
                                ? 'Contactado'
                                : 'Contactar'}
                            </button>

                            <button
                              onClick={() =>
                                handleWhatsAppRedirect(personClass.celular)
                              }
                              className="table-action-btn btn-wsp"
                            >
                              <FaWhatsapp className="text-white" /> WhatsApp
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <nav className="flex justify-center mt-10">
                <ul className="flex flex-wrap items-center gap-2">
                  <li>
                    <button
                      onClick={prevPage}
                      className="px-4 py-2 text-sm font-semibold text-zinc-600 bg-white border border-gray-300 rounded-full hover:bg-[#fc4b08] hover:text-white transition"
                    >
                      Prev
                    </button>
                  </li>

                  {numbers.map((number, index) => (
                    <li key={index}>
                      <button
                        onClick={() => changeCPage(number)}
                        className={`px-4 py-2 text-sm font-semibold border rounded-full transition ${
                          currentPage === number
                            ? 'bg-[#fc4b08] text-white border-[#fc4b08]'
                            : 'bg-white text-zinc-700 border-gray-300 hover:bg-[#fc4b08] hover:text-white hover:border-[#fc4b08]'
                        }`}
                      >
                        {number}
                      </button>
                    </li>
                  ))}

                  <li>
                    <button
                      onClick={nextPage}
                      className="px-4 py-2 text-sm font-semibold text-zinc-600 bg-white border border-gray-300 rounded-full hover:bg-[#fc4b08] hover:text-white transition"
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FreeClassGet;
