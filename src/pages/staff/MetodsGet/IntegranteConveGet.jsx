/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (IntegranteConveGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
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
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaIntegranteConve from '../../../components/Forms/FormAltaIntegranteConve';
import IntegranteDetails from './IntegranteConveGetId';
import Copy from '../../../images/copy.png'
import subirArch from '../../../images/subirArch.png'

import { useAuth } from '../../../AuthContext';
import ImagesUpload from './ImagesUpload.jsx';
import InvoicesUpload from './InvoicesUpload.jsx';
import FileUpload from './FileUpload.jsx';

const IntegranteConveGet = ({ integrantes }) => {
  // Estado para almacenar la lista de personas
  const { id_conv, id_adm } = useParams();
  const [integrante, setIntegrantes] = useState([]);
  const [modalNewIntegrante, setModalNewIntegrant] = useState(false);
  const [totalPrecioFinal, setTotalPrecioFinal] = useState(0);
  const { userLevel, userName} = useAuth();

  // Estado para tomar los nombres de los convenios
  const [convenioNombre, setConvenioNombre] = useState('');
  const [convenioDescripcion, setConvenioDescripcion] = useState('');
  const [convenioDescripcionUsu, setConvenioDescripcionUsu] = useState('');

  // Estado para tomar los valores de permiteFam de los convenios
  const [permiteFam, setpermiteFam] = useState(0);
  const [cantFam, setcantFam] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  const abrirModal = () => {
    setModalNewIntegrant(true);
    setSelectedUser(null)
  };
  const cerarModal = () => {
    setModalNewIntegrant(false);
    obtenerIntegrantes2();
  };
  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/integrantes/';
  const URL2 = `http://localhost:8080/admconvenios/${id_conv}/integrantes/`;
  // para recuperar los valores de precio INI
  const URL3 = 'http://localhost:8080/admconvenios/';
  const URL4 = 'http://localhost:8080/admconvenios/';

  const [precio, setPrecio] = useState('');
  const [descuento, setDescuento] = useState('');
  const [preciofinal, setPrecioFinal] = useState('');

  useEffect(() => {
    obtenerDatosAdmConvenio(id_conv);
  }, [id_conv]);

  const obtenerDatosAdmConvenio = async (id) => {
    try {
      // const response = await axios.get(URL3);
      const response = await axios.get(`${URL4}${id}/`);

      // console.log(`${URL4}${id_conv}/`);
      const data = response.data;

      // console.log('Datos del convenio:', data);

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
        setConvenioDescripcion(response.data.descConve);
        setConvenioDescripcionUsu(response.data.desc_usu);
        setpermiteFam(response.data.permiteFam);
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
          `http://localhost:8080/admconvenios/${id_conv}/integrantes/`
        );
        // Actualizar datos del convenio después de agregar el integrante
        await obtenerDatosAdmConvenio(id_conv);

        setIntegrantes(response.data);
      } catch (error) {
        console.error('Error al obtener los integrantes:', error);
      }
    };

    obtenerIntegrantes();
  }, [id_conv, id_adm]);

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

  if (Array.isArray(integrante)) {
    const safeSearch = search ? search.toLowerCase() : "";

    results = integrante.filter((dato) => {
      const nombre = dato.nombre ? dato.nombre.toLowerCase() : "";
      return nombre.includes(safeSearch);
    });
  }

  const ordenarIntegranteAlfabeticamente = (integrante) => {
    return [...integrante].sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  const sortedintegrante = ordenarIntegranteAlfabeticamente(results);

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

  const handleCopyClick = () => {
    const cbu = "0110372230037217312133";
    navigator.clipboard.writeText(cbu).then(() => {
      alert("CBU copiado al portapapeles");
    }).catch(err => {
      console.error("Error al copiar el CBU: ", err);
    });
  };

    const [fileName, setFileName] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setFileName(file ? file.name : null);
  };

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const horas = String(fechaObj.getHours()).padStart(2, '0');
    const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
    const segundos = String(fechaObj.getSeconds()).padStart(2, '0');
    
    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
  };
  
  const obtenerNombreUsuario = (email) => {
    return email.split('@')[0];
};

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to="/dashboard/admconvenios">
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
          {/* Descripcion convenio */}

          {(userLevel === 'admin' ||
            userLevel === '' ||
            userLevel === 'administrador') && (
            <div className="flex justify-center">
              <h1 className="pb-5">Descripción: {convenioDescripcion}</h1>
            </div>
          )}

          {/* Descripcion Usuario */}

          {(userLevel === 'admin' ||
            userLevel === 'gerente' ||
            userLevel === 'administrador') && (
            <div className="flex justify-center">
              <h1 className="pb-5">
                Descripción Usuario: {convenioDescripcionUsu}
              </h1>
            </div>
          )}

            <div className="flex justify-center">
              <h1 className="pb-5">
                Listado de Integrantes: &nbsp;
                <span className="text-center">
                  Cantidad de registros: {results.length}
                </span>
              </h1>
            </div>
            {/* formulario de busqueda */}
          <form className="flex justify-center pb-5">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Buscar Integrante"
            className="border rounded-sm"
          />
        </form>

          {/* formulario de busqueda */}
          {(userLevel === 'gerente' ||
            userLevel === 'admin' ||
            userLevel === '' ||
            userLevel === 'administrador') && (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nuevo Integrante
                </button>
              </Link>
            </div>
            )}
          
                {/* formulario de busqueda */}
          {(userLevel === 'admin' ||
            userLevel === '' ||
            userLevel === 'administrador') && (
              <FileUpload convenioId={id_conv} />
            )}

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Integrante NO Existe ||{' '}
              <span className="text-span"> Integrantes: {results.length}</span>
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
                    {/* <th>Sede</th> */}
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Precio Final</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
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
                        {integrante.notas ? (
                          <>
                            <span className="text-xl">📝</span>{' '}
                            {integrante.nombre}
                          </>
                        ) : (
                          integrante.nombre
                        )}
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

                      {/* <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.sede}
                      </td> */}

                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.precio !== '0'
                          ? formatearMoneda(integrante.precio)
                          : 'Sin Precio'}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.descuento !== '0'
                          ? `${integrante.descuento}%`
                          : 'Sin descuento'}
                      </td>
                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                        {integrante.preciofinal !== '0'
                          ? formatearMoneda(integrante.preciofinal)
                          : 'Sin Precio Final'}
                      </td>

                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                          {obtenerNombreUsuario(integrante.userName)}
                      </td>

                      <td onClick={() => obtenerIntegrante(integrante.id)}>
                         {formatearFecha(integrante.fechaCreacion)}
                      </td>
                      {/* <td onClick={() => obtenerIntegrante(i.id)}>
                        {formatearFecha(i.vencimiento)}
                      </td> */}

                      {/* ACCIONES */}
                      {
                        /*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */
                        (userLevel === 'admin' ||
                          userLevel === 'gerente' ||
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
               <div className='text-center mt-10'>
                <div className="cbu-container font-bignoodle">
                  <span className="cbutext text-gray-600"> REALIZÁ TUS TRANSFERENCIAS AL SIGUIENTE CBU: 0110372230037217312133</span>
                  <img
                    className="copy-icon"
                    src={Copy}
                    alt="Copy Icon"
                    onClick={handleCopyClick}
                  />
                  </div>
                <p className='font-bignoodle text-gray-600 text-2xl'>
                 Titular: Marcelo Javier Garcia
                </p>
                <p className='font-bignoodle text-gray-600 text-2xl'>
                 CUIT: 20- 34.764.843 -5
                  </p>
                    <div colSpan="7" className="font-bold text-[#fc4b08] text-2xl">
                  TOTAL
                </div>
                <div className="text-2xl">{formatearMoneda(totalPrecioFinal)}</div>
                <div className="flex gap-4 flex-wrap">
                    <div className="flex-1 min-w-[300px]">
                    {(userLevel === '' ||
                      userLevel === 'admin') && (
                        <ImagesUpload convenioId={id_conv} />
                    )}
                    </div>
                    <div className="flex-1 min-w-[300px]">
                      {(userLevel === '' ||
                      userLevel === 'admin') && (
                        <InvoicesUpload  convenioId={id_conv} /> 
                    )}
                    </div>

                  </div>

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
                        currentPage === number ? "active" : ""
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
          <FormAltaIntegranteConve
            isOpen={modalNewIntegrante}
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
        <IntegranteDetails
          user={selectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
          obtenerIntegrantes2={obtenerIntegrantes2}
          permiteFam={permiteFam}
          id_conv={id_conv}
          cantFam={cantFam}
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

export default IntegranteConveGet;
