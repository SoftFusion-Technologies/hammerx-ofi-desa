/*
 * Programadores: Benjamin Orellana (back) | Emir Segovia (fron)
 * Fecha Cración: 23 / 05 / 2024
 * Fecha Modificacion: 05/06/2024
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (FrequentAsksGet.jsx) es el componente el cual renderiza los datos de los
 * Estos datos llegan cuando se completa el formulario de Quiero trabajar con ustedes
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 * Contacto: emirvalles90@gmail.com || 3865761910
 * 
 * ----------------------------------------------------------------
 * 
 * Modificación : Se modifico la renderizacion de descripcion, ahora la misma es con dangerouslySetInnerHTML 
 * 
 */

import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarStaff from "../NavbarStaff";
import "../../../styles/MetodsGet/Tabla.css";
import "../../../styles/staff/background.css";
import Footer from "../../../components/footer/Footer";
import FormAltaFrecAsk from "../../../components/Forms/FormAltaFrecAsk";
import { useAuth } from '../../../AuthContext';
import FrequentDetails from "./FrequentAsksGetId";

const PreguntasFrecuentesGet = () => {
  const [modalNewFrecAsk, setModalNewAsk] = useState(false);
  const [selectedAsk, setSelectedAsk] = useState(null); // Estado para la pregunta seleccionada (NUEVO)

  const { userLevel } = useAuth();

  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  const abrirModal = () => {
    setModalNewAsk(true);
  };
  const cerarModal = () => {
    setModalNewAsk(false);
    setSelectedAsk(null); // Resetear la pregunta seleccionada al cerrar el modal (NUEVO)
    obtenerAsk(); // Llama a la función para obtener los datos actualizados
  };

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/ask/';
  // Estado para almacenar la lista de Novedad
  const [frecAsk, setFreAsk] = useState([]);

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState("");

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = frecAsk;
  } else {
    results = frecAsk.filter((dato) => {
      const tituloMatch = dato.titulo
        .toLowerCase()
        .includes(search.toLowerCase());

      return tituloMatch;
    });
  }

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerAsk los datos contenidos en la url
    axios.get(URL).then((res) => {
      setFreAsk(res.data);
      obtenerAsk();
    });
  }, []);

  // Función para obtener todos las preguntas frecuentes desde la API
  const obtenerAsk = async () => {
    try {
      const response = await axios.get(URL);
      setFreAsk(response.data);
    } catch (error) {
      console.log("Error al obtener las preguntas:", error);
    }
  };

  const handleEliminarAsk = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: "DELETE",
        });
        await respuesta.json();
        const arrayAsk = frecAsk.filter((frecAsk) => frecAsk.id !== id);

        setFreAsk(arrayAsk);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerFrecAsk = async (id) => {
    try {
      const url = `${URL}${id}`;

      console.log(url);

      const respuesta = await fetch(url);

      const resultado = await respuesta.json();

      setFreAsk(resultado);
    } catch (error) {
      console.log(error);
    }
  };
  const ordernarFrecAsk = (frecAsk) => {
    return [...frecAsk].sort  ((a, b) => a.orden - b.orden);
  };

  // Llamada a la función para obtener los postulantes ordenados de forma decreciente
  const sortedFrecAsk = ordernarFrecAsk(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedFrecAsk.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedFrecAsk.length / itemsPerPage);
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


  const obtenerPregunta = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el integrante:', error);
    }
  };

  const handleEditarAsk = (ask) => { // (NUEVO)
    setSelectedAsk(ask);
    setModalNewAsk(true);
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
              Listado de Novedades: &nbsp;
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
              placeholder="Buscar Preguntas"
              className="border rounded-sm"
            />
          </form>
          {/* formulario de busqueda */}

          {(userLevel === 'admin' || userLevel === 'administrador') && (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nueva Pregunta
                </button>
              </Link>
            </div>
          )}

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              La Pregunta NO Existe ||{' '}
              <span className="text-span">
                {' '}
                Pregunta Frecuentes: {results.length}
              </span>
            </p>
          ) : (
            <>
              <table className="w-11/12 mx-auto">
                <thead className=" bg-[#fc4b08]  text-white">
                  <tr key={frecAsk.id}>
                    <th className="thid">ID</th>
                    <th>Prioridad</th>
                    <th>Pregunta</th>
                    <th>Estado</th>
                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && <th>Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.map((frecAsk) => (
                    <tr key={frecAsk.id}>
                      <td onClick={() => obtenerPregunta(frecAsk.id)}>
                        {frecAsk.id}
                      </td>
                      <td onClick={() => obtenerPregunta(frecAsk.id)}>
                        {frecAsk.orden}
                      </td>
                      <td onClick={() => obtenerPregunta(frecAsk.id)}>
                        {frecAsk.titulo}
                      </td>
                      <td
                        className={`uppercase max-w-[100px] p-2 overflow-y-auto max-h-[100px] ${
                          frecAsk.estado === 1
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {frecAsk.estado === 1 ? 'Activa' : 'Inactiva'}
                      </td>
                      {/* ACCIONES */}

                      {(userLevel === 'admin' ||
                        userLevel === 'administrador') && (
                        <td className="">
                          <button
                            onClick={() => handleEliminarAsk(frecAsk.id)}
                            type="button"
                            className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleEditarAsk(frecAsk)} // (NUEVO)
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
          {/* Modal para abrir formulario de clase gratis (NUEVO) */}
          <FormAltaFrecAsk
            isOpen={modalNewFrecAsk}
            onClose={cerarModal}
            ask={selectedAsk}
          />
        </div>
      </div>
      {selectedUser && (
        <FrequentDetails
          user={selectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
        />
      )}
      <Footer />
    </>
  );
};

export default PreguntasFrecuentesGet;
