/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (FamIntegranteGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
 * Estos datos llegan cuando se completa el formulario de FormAltaConve
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { formatearFecha } from '../../../Helpers';
import { Link, useLocation } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaFamiliarI from '../../../components/Forms/FormAltaFamiliarI';
import FamIntegranteGetId from './FamIntegranteGetId'
import { useAuth } from '../../../AuthContext';

const FamIntegranteGet = ({ integrantes }) => {
  // variable global, para determinar los accesos a la parte del sistema
  const { userLevel } = useAuth();

  // variables para obtener los parametros
  const { id_conv, id_integrante, id_adm } = useParams();

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/integrantesfam/';
  const URL2 = `http://localhost:8080/admconvenios/${id_conv}/integrantes/${id_integrante}/integrantesfam/`;

  // para recuperar los valores de precio FIN
  const URL4 = 'http://localhost:8080/admconvenios/';

  const location = useLocation();
  const currentPath = location.pathname; // Obtiene la ruta actual

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');

  const [precio, setPrecio] = useState('');
  const [descuento, setDescuento] = useState('');
  const [preciofinal, setPrecioFinal] = useState('');

  // Estado para almacenar la lista de Integrantes
  const [integrante, setIntegrantes] = useState([]);

  // Estado para manejar los modales
  const [modalNewIntegrant, setModalNewIntegrant] = useState(false);

  // Estado para almacenar el precio final
  const [totalPrecioFinal, setTotalPrecioFinal] = useState(0);

  // Extraer el primer segmento de la ruta actual (dashboard/admconvenios/23/integrantes)
  const basePath = currentPath.split('/').slice(0, -3).join('/');

  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  // Estado para tomar los nombres de los convenios
  const [convenioNombre, setConvenioNombre] = useState('');

  const [cantFam, setcantFam] = useState(0);

  const abrirModal = () => {
    setModalNewIntegrant(true);
    setSelectedUser(null)
  };
  const cerarModal = () => {
    setModalNewIntegrant(false);
    obtenerIntegrantes2();
  };

  useEffect(() => {
    obtenerDatosAdmConvenio(id_conv);
  }, [id_conv]);

  const obtenerDatosAdmConvenio = async (id) => {
    try {
      // const response = await axios.get(URL3);
      const response = await axios.get(`${URL4}${id}/`);

      // console.log(`${URL4}${id_conv}/`);
      const data = response.data;

      console.log('Datos del convenio:', data);

      if (data && data.precio && data.descuento && data.preciofinal) {
        setPrecio(data.precio);
        setDescuento(data.descuento);
        setPrecioFinal(data.preciofinal);
      } else {
        console.log('Datos del convenio incompletos o incorrectos:', data);
      }
    } catch (error) {
      console.error('Error al obtener datos del convenio:', error);
    }
  };

  // para recuperar los valores de precio FIN
  useEffect(() => {
    axios.get(URL2).then((res) => {
      setIntegrantes(res.data);
      obtenerIntegrantes2();
    });

    const obtenerConvenio = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admconvenios/${id_conv}`
        );
        setConvenioNombre(response.data.nameConve);
        setcantFam(response.data.cantFamiliares);
      } catch (error) {
        console.error('Error al obtener el convenio:', error);
      }
    };

    obtenerConvenio();
  }, [id_conv]);

  // Función para obtener todos los personClass desde la API
  const obtenerIntegrantes2 = async () => {
    try {
      const response = await axios.get(URL2);
      setIntegrantes(response.data);
    } catch (error) {
      console.log('Error al obtener las personas :', error);
    }
  };

  // Función para obtener todos los personClass desde la API
  useEffect(() => {
    const obtenerIntegrantes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admconvenios/${id_conv}/integrantes/${id_integrante}/integrantesfam/`
        );
        setIntegrantes(response.data);
      } catch (error) {
        console.error('Error al obtener los integrantes:', error);
      }
    };

    obtenerIntegrantes();
  }, [id_integrante, id_adm]);

  const handleEliminarIntegrante = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayIntegrante = integrante.filter(
          (integrante) => integrante.id !== id
        );

        setIntegrantes(arrayIntegrante);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerIntegrante = async (id) => {
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
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = integrante;
  } else if (search) {
    results = integrante.filter((dato) => {
      const nameMatch = dato.nameConve
        .toLowerCase()
        .includes(search.toLowerCase());

      return nameMatch;
    });
  }

  // Función para ordenar los integrante de forma decreciente basado en el id
  const ordenarintegranteDecreciente = (integrante) => {
    return [...integrante].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los integrantes ordenados de forma decreciente
  const sortedintegrante = ordenarintegranteDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedintegrante.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedintegrante.length / itemsPerPage);
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

  useEffect(() => {
    // Calcular el total de preciofinal, convirtiendo cada valor a número
    const total = records.reduce(
      (acc, integrante) => acc + Number(integrante.preciofinal),
      0
    );
    setTotalPrecioFinal(total);
  }, [records]);
  const formatearMoneda = (valor) => {
    return `$${Number(valor).toLocaleString('es-ES', {
      minimumFractionDigits: 0
    })}`;
  };


  const handleEditarIntegrante = (integrante) => {
    // (NUEVO)
    setSelectedUser(integrante);
    setModalNewIntegrant(true);
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to={basePath}>
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                Volver
              </button>
            </Link>
          </div>
          <div className="flex justify-center">
            <h2 className="pb-5 font-bignoodle text-[#fc4b08] text-5xl">
              {convenioNombre}
            </h2>
          </div>
          <div className="flex justify-center">
            <h1 className="pb-5">
              Listado de Familiares: &nbsp;
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
              placeholder="Buscar Integrante"
              className="border rounded-sm"
            />
          </form>
          {/* formulario de busqueda */}

          {/* Botón Nuevo Familiar condicional */}
          {results.length < cantFam && (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nuevo Familiar
                </button>
              </Link>
            </div>
          )}

          {results.length == cantFam ? (
            <h1 className="flex justify-center pb-10">
              No se permite agregar mas familiares
            </h1>
          ) : (
            <h1 className="flex justify-center pb-10 text-lg">
              Puede agregar hasta:{' '}
              <span className="font-bold ml-2 mr-2 "> {cantFam} </span>
              Familiares, le queda{' '}
              <span className="font-bold ml-2 mr-2 ">
                {cantFam - results.length}{' '}
              </span>
              más para agregar
            </h1>
          )}
          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Integrante NO Tiene familiar ||{' '}
              <span className="text-span"> Familiares: {results.length}</span>
            </p>
          ) : (
            <>
              <table className="w-11/12 mx-auto">
                <thead className=" bg-[#fc4b08]  text-white">
                  <tr key={integrante.id}>
                    {/* <th className='thid'>ID</th> */}
                    <th>Nombre y Apellido</th>
                    <th>DNI</th>
                    <th>Telefono</th>
                    <th>Email</th>
                    <th>Sede</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Precio Final</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((integrante) => (
                    <tr key={integrante.id}>
                      {/* <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {i.id}
                      </td> */}
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.nombre}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.dni}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.telefono}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.email}
                      </td>

                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.sede}
                      </td>

                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {formatearMoneda(integrante.precio)}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.descuento !== '0'
                          ? `%${integrante.descuento}`
                          : 'Sin descuento'}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {formatearMoneda(integrante.preciofinal)}
                      </td>

                      {/* <td onClick={() => obtenerIntegrante(i.id)}>
                        {formatearFecha(i.vencimiento)}
                      </td> */}

                      {/* ACCIONES */}
                      {/* ACCIONES */}
                      {
                        /*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */
                        (userLevel === 'admin' ||
                          userLevel === '' ||
                          userLevel === 'vendedor' ||
                          userLevel === 'gerente' ||
                          userLevel === 'convenio' ||
                          userLevel === 'administrador') && (
                          <td className="">
                            <button
                              onClick={() =>
                                handleEliminarIntegrante(integrante.id)
                              }
                              type="button"
                              className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => handleEditarIntegrante(integrante)} // (NUEVO)
                              type="button"
                              className="py-2 px-4 my-1 ml-5 bg-yellow-500 text-black rounded-md hover:bg-red-600"
                            >
                              Editar
                            </button>
                          </td>
                        )
                      }
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="style-prec">
                <div colSpan="7" className="font-bold text-[#fc4b08]">
                  TOTAL
                </div>
                <div className="">{formatearMoneda(totalPrecioFinal)}</div>
              </div>
              <nav className="flex justify-center items-center my-10">
                <ul className="pagination space-x-2">
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={prevPage}>
                      Prev
                    </a>
                  </li>

                  <li className="page-item">
                    <a href="#" className="page-link" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}
          <FormAltaFamiliarI
            isOpen={modalNewIntegrant}
            onClose={cerarModal}
            precio={precio}
            descuento={descuento}
            preciofinal={preciofinal}
            integrante={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </div>
      </div>
      {selectedUser && (
        <FamIntegranteGetId
          user={selectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
          obtenerIntegrantes2={obtenerIntegrantes2}
        />
      )}
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
    margin: '5px',
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

export default FamIntegranteGet;
