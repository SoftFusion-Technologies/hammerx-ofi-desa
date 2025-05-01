/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (QuejasInternasGet.jsx) es el componente el cual renderiza los datos de los que envian para clase gratis
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
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import { useAuth } from '../../../AuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import FormAltaQueja from '../../../components/Forms/FormAltaQueja';
import QuejasDetails from './QuejasInternasGetId';

const QuejasInternasGet = () => {
  const { userLevel, userName } = useAuth();

  // Estado para almacenar la lista de personas
  const [quejas, setQuejas] = useState([]);
  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');

  const [modalNewQueja, setModalNewQueja] = useState(false);

  const [selectedQueja, setSelectedQueja] = useState(null);
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/quejas/';

  useEffect(() => {
    obtenerQuejas();
  }, []);

  const obtenerQuejas = async () => {
    try {
      const response = await axios.get(URL);
      setQuejas(response.data);
    } catch (error) {
      console.log('Error al obtener las quejas:', error);
    }
  };

  const obtenerQueja = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedQueja(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el usuario:', error);
    }
  };
  const handleEliminarQueja = async (id) => {
    const confirmacion = window.confirm(
      '¿Seguro que desea eliminar esta queja?'
    );
    if (confirmacion) {
      try {
        await axios.delete(`${URL}${id}`);
        setQuejas(quejas.filter((q) => q.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleEditarQueja = (queja) => {
    // Se actualiza el estado con los detalles de la queja seleccionada
    setSelectedQueja(queja);

    // Se abre el modal para editar la queja
    setModalNewQueja(true);
  };

  const handleResolverQueja = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/quejas/${id}/resolver`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ resuelto_por: userName })
        }
      );

      if (!response.ok) {
        const errorData = await response.json(); // si hay error, asumimos que viene con mensaje
        alert(errorData.mensajeError || 'Error al marcar como resuelta');
        return;
      }

      // Solo intentar parsear JSON si hay contenido
      const contentLength = response.headers.get('Content-Length');
      if (contentLength && parseInt(contentLength) > 0) {
        const data = await response.json();
        alert(data.message || 'Queja marcada como resuelta');
      } else {
        alert('Queja marcada como resuelta');
      }

      // Actualizar estado
      obtenerQuejas(); // tu función para recargar datos
    } catch (error) {
      alert('Error en la petición: ' + error.message);
    }
  };

  const handleNoResueltoQueja = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:8080/quejas/${id}/no-resuelto`,
        {
          method: 'PUT'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.mensajeError || 'Error al marcar como no resuelta');
        return;
      }

      alert('Queja marcada como no resuelta');
      obtenerQuejas();
    } catch (error) {
      alert('Error en la petición: ' + error.message);
    }
  };
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];
  if (!search) {
    // Si no hay término de búsqueda, usamos los resultados completos
    results = quejas; // Reemplazamos personClass por quejas
  } else if (search) {
    // Si hay un término de búsqueda, filtramos los resultados
    results = quejas.filter((dato) => {
      const nombreMatch = dato.nombre
        .toLowerCase()
        .includes(search.toLowerCase());
      const tipoUsuarioMatch = dato.tipo_usuario
        .toLowerCase()
        .includes(search.toLowerCase());
      const contactoMatch = dato.contacto && dato.contacto.includes(search);
      const motivoMatch = dato.motivo
        .toLowerCase()
        .includes(search.toLowerCase());
      const sedeMatch = dato.sede.toLowerCase().includes(search.toLowerCase());

      return (
        nombreMatch ||
        tipoUsuarioMatch ||
        contactoMatch ||
        motivoMatch ||
        sedeMatch
      );
    });
  }

  // Función para ordenar las quejas de forma decreciente basado en el id
  const ordenarQuejasDecreciente = (quejas) => {
    return [...quejas].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener las quejas ordenadas de forma decreciente
  const sortedQuejas = ordenarQuejasDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedQuejas.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedQuejas.length / itemsPerPage);
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

  const abrirModal = () => {
    setModalNewQueja(true);
  };

  const cerarModal = () => {
    setModalNewQueja(false);
    obtenerQuejas();
    setSelectedQueja(null); // Limpiar la queja seleccionada al cerrar
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
              Listado de Quejas :{' '}
              <span className="text-center">
                Cantidad de registros : {results.length}
              </span>
            </h1>
          </div>

          {/* formulario de busqueda */}
          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar mediante el NOMBRE"
              className="border rounded-sm"
            />
          </form>

          {(userLevel === 'admin' || userLevel === 'administrador') && (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Agregar Queja
                </button>
              </Link>
            </div>
          )}

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              La Queja NO Existe ||{' '}
              <span className="text-span"> Queja: {results.length}</span>
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full mx-auto">
                  <thead className="bg-[#fc4b08] text-white">
                    <tr key={quejas.id}>
                      <th className="thid">ID</th>
                      <th>Fecha Solicitud</th>
                      <th>Cargado por</th>
                      <th>Nombre</th>
                      <th>Tipo Usuario</th>
                      <th>Contacto</th>
                      <th>Motivo</th>
                      <th>Sede</th>
                      <th>Estado</th>
                      <th> Resuelto por</th>

                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((queja) => (
                      <tr key={queja.id}>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.id}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {new Date(queja.fecha).toLocaleString('es-AR', {
                            timeZone: 'America/Argentina/Buenos_Aires'
                          })}
                        </td>

                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.cargado_por}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.nombre}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.tipo_usuario}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.contacto}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          <span>
                            {queja.motivo.length > 4
                              ? `${queja.motivo.slice(0, 4)}...`
                              : queja.motivo}
                          </span>
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          {queja.sede}
                        </td>
                        <td onClick={() => obtenerQueja(queja.id)}>
                          <span
                            className={`${
                              queja.resuelto === 1
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {queja.resuelto === 1 ? 'Resuelto' : 'No Resuelto'}
                          </span>
                        </td>

                        <td className="text-sm">
                          {Number(queja.resuelto) === 1 &&
                          queja.resuelto_por &&
                          queja.fecha_resuelto ? (
                            <>
                              <p className="text-green-700 font-bold">
                                RESUELTO
                              </p>
                              <p>
                                <span className="font-semibold">Por:</span>{' '}
                                {queja.resuelto_por}
                              </p>
                              <p>
                                <span className="font-semibold">Fecha:</span>{' '}
                                {new Date(
                                  queja.fecha_resuelto
                                ).toLocaleString()}
                              </p>
                            </>
                          ) : (
                            <span className="text-red-600 font-bold">
                              Aún no se resolvío
                            </span>
                          )}
                        </td>

                        {/* ACCIONES */}
                        <td className="flex space-x-3 px-2">
                          {/* Botón para Eliminar - Solo visible para admin */}
                          {(userLevel === 'admin' ||
                            userLevel === 'administrador') && (
                            <button
                              onClick={() => handleEliminarQueja(queja.id)}
                              type="button"
                              className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          )}

                          {/* Botón para Editar - Siempre visible */}
                          <button
                            onClick={() => handleEditarQueja(queja)}
                            type="button"
                            className="py-2 px-4 my-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                          >
                            Editar
                          </button>

                          {/* Resolver o Marcar como no resuelto - Siempre visible */}
                          {!queja.resuelto ? (
                            <button
                              onClick={() => handleResolverQueja(queja.id)}
                              type="button"
                              className="py-2 px-4 my-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                            >
                              Resolver
                            </button>
                          ) : (
                            <button
                              onClick={() => handleNoResueltoQueja(queja.id)}
                              type="button"
                              className="py-2 px-4 my-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                              Marcar como no resuelto
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
        </div>
      </div>
      <Footer />

      <FormAltaQueja
        isOpen={modalNewQueja}
        onClose={cerarModal}
        queja={selectedQueja}
        setSelectedQueja={setSelectedQueja}
        obtenerQuejas={obtenerQuejas}
      />

      {selectedQueja && (
        <QuejasDetails
          queja={selectedQueja}
          setSelectedQueja={setSelectedQueja}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
        />
      )}
    </>
  );
};

export default QuejasInternasGet;
