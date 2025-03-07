/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (PostulanteGet.jsx) es el componente el cual renderiza los datos de los postulantes
 * Estos datos llegan cuando se completa el formulario de Quiero trabajar con ustedes
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
import PostulanteDetails from './PostulanteGetId';
import { useAuth } from '../../../AuthContext';
import { FaWhatsapp } from 'react-icons/fa';
// Componente funcional que maneja la lógica relacionada con los postulantes
const PostulanteGetV2 = () => {
  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const [contactedTestClass, setContactedTestClass] = useState({});

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/postulantes_v2';

  const { userLevel } = useAuth();

  // Estado para almacenar la lista de postulantes
  const [postulantes, setPostulantes] = useState([]);
  const [contactados, setContactados] = useState({});

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');
  const [sexoFilter, setSexoFilter] = useState(null);
  const [edadFilter, setEdadFilter] = useState(null);
  const [valoracionFilter, setValoracionFilter] = useState('');
  // Estado para filtrar por sede
  const [filterSede, setFilterSede] = useState('');

  // Manejar cambios en el filtro de sede
  const handleFilterSedeChange = (e) => {
    setFilterSede(e.target.value);
  };

  // Restablecer filtro de sede
  const handleResetSedeFilter = () => {
    setFilterSede('');
  };

  const [filterPuesto, setFilterPuesto] = useState('');

  const handleFilterPuestoChange = (e) => {
    setFilterPuesto(e.target.value);
  };

  const handleResetPuestoFilter = () => {
    setFilterPuesto('');
  };

  const handleEdadChange = (e) => {
    setEdadFilter(e.target.value);
  };

  const handleResetEdadFilter = () => {
    setEdadFilter(null);
  };

  const handleSexoChange = (e) => {
    const selectedSexo = e.target.value;

    // Si el radio button seleccionado ya estaba seleccionado anteriormente,
    // establece sexoFilter a null para desmarcarlo
    if (sexoFilter === selectedSexo) {
      setSexoFilter(null);
    } else {
      setSexoFilter(selectedSexo);
    }
  };
  const handleResetSexoFilter = () => {
    setSexoFilter(null);
  };

  const handleValoracionChange = (event) => {
    setValoracionFilter(event.target.value);
  };

  const handleResetValoracionFilter = () => {
    setValoracionFilter('');
  };

  const calcularRangoEdad = (edad) => {
    if (edad >= 18 && edad <= 21) return '18-21';
    if (edad >= 21 && edad <= 23) return '21-23';
    if (edad >= 23 && edad <= 25) return '23-25';
    if (edad > 25) return '>25';
  };

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];
  results = postulantes.filter((dato) => {
    const nameMatch = search
      ? dato.name.toLowerCase().includes(search.toLowerCase())
      : true;
    const emailMatch = search
      ? dato.email.toLowerCase().includes(search.toLowerCase())
      : true;
    const puestoMatch = search
      ? dato.puesto.toLowerCase().includes(search.toLowerCase())
      : true;

    const sedeMatch =
      filterSede && filterSede !== ''
        ? dato.sede.toLowerCase() === filterSede.toLowerCase()
        : true;

    const sexoMatch = sexoFilter ? dato.sexo === sexoFilter : true;
    const edadMatch = edadFilter
      ? calcularRangoEdad(dato.edad) === edadFilter
      : true;
    const valoracionMatch = valoracionFilter
      ? dato.valoracion === parseInt(valoracionFilter)
      : true;

    const puestoFilterMatch =
      filterPuesto && filterPuesto !== ''
        ? dato.puesto.toLowerCase() === filterPuesto.toLowerCase()
        : true;

    return (
      nameMatch &&
      emailMatch &&
      puestoMatch &&
      sedeMatch &&
      sexoMatch &&
      edadMatch &&
      valoracionMatch &&
      puestoFilterMatch
    );
  });

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerPostulante los datos contenidos en la url
    axios.get(URL).then((res) => {
      setPostulantes(res.data);
      obtenerPostulantes();
    });
  }, []);

  // Función para obtener todos los postulantes desde la API
  const obtenerPostulantes = async () => {
    try {
      const response = await axios.get(URL);
      const postulantesData = response.data;
      setPostulantes(postulantesData);

      // Obtener el estado de contacto de cada postulante y actualizar el estado
      const contactadosData = {};
      postulantesData.forEach((postulante) => {
        contactadosData[postulante.id] = postulante.state;
      });
      setContactados(contactadosData);
    } catch (error) {
      console.log('Error al obtener los postulantes:', error);
    }
  };

  const handleEliminarPostulante = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayPostulantes = postulantes.filter(
          (postulante) => postulante.id !== id
        );

        setPostulantes(arrayPostulantes);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerPostulante = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el usuario:', error);
    }
  };

  // Función para actualizar el estado de contacto en la base de datos
  const updateContactState = async (id, state) => {
    try {
      await axios.put(`${URL}${id}`, { state }); // Cambiado a PUT en la URL correcta
    } catch (error) {
      console.log('Error al actualizar el estado de contacto:', error);
    }
  };

  const contactarPostulante = (celular, id) => {
    const isContactado = contactados[id]; // Verifica si ya ha sido contactado

    const interval = setInterval(async () => {
      clearInterval(interval);

      // Cambiar el estado al contrario del actual
      await updateContactState(id, !isContactado);

      setContactados((prevState) => ({
        ...prevState,
        [id]: !isContactado // Cambiar el estado visualmente
      }));
    }, 150);
  };

  // Función para ordenar los postulantes de forma decreciente basado en el id
  const ordenarPostulantesDecreciente = (postulantes) => {
    return [...postulantes].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los postulantes ordenados de forma decreciente
  const sortedPostulantes = ordenarPostulantesDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedPostulantes.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedPostulantes.length / itemsPerPage);
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

  // Función para descargar el CV
  const downloadCV = (id) => {
    const url = `${URL}${id}/cv`; // Cambia la URL por la correcta
    window.open(url, '_blank'); // Abrir el archivo en una nueva ventana
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
              Listado de Postulantes: &nbsp;
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
              placeholder="BUSCAR: NOMBRE - ROL - SEDE"
              className="border rounded-sm"
            />
          </form>
          {/* formulario de busqueda */}

          {/* filtros*/}
          <div className="flex flex-wrap justify-center gap-4 mt-4 mb-8 w-full max-w-3xl mx-auto border rounded-lg p-4">
            {/* Filtro por sexo */}
            <div className="flex-1 min-w-[250px] py-4 px-5">
              <h1 className="mb-2 font-medium">Filtrar por sexo</h1>
              {['masculino', 'femenino', ''].map((sexo) => (
                <div key={sexo}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={sexo}
                      checked={sexoFilter === sexo}
                      onChange={sexo ? handleSexoChange : handleResetSexoFilter}
                    />
                    {sexo
                      ? sexo.charAt(0).toUpperCase() + sexo.slice(1)
                      : 'Limpiar sexo'}
                  </label>
                </div>
              ))}
            </div>

            {/* Filtro de edad */}
            <div className="flex-1 min-w-[250px] py-4 px-5">
              <h1 className="mb-2 font-medium">Filtrar por edad</h1>
              {['18-21', '21-23', '23-25', '>25', ''].map((edad) => (
                <div key={edad}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={edad}
                      checked={edadFilter === edad}
                      onChange={edad ? handleEdadChange : handleResetEdadFilter}
                    />
                    {edad
                      ? edad === '>25'
                        ? 'Mayores a 25'
                        : `${edad.replace('-', ' a ')}`
                      : 'Limpiar edad'}
                  </label>
                </div>
              ))}
            </div>

            {/* Filtro por valoración */}
            <div className="flex-1 min-w-[250px] py-4 px-5">
              <h1 className="mb-2 font-medium">Filtrar por valoración</h1>
              {['1', '2', '3', '4', '5', ''].map((valor) => (
                <div key={valor}>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value={valor}
                      checked={valoracionFilter === valor}
                      onChange={
                        valor
                          ? handleValoracionChange
                          : handleResetValoracionFilter
                      }
                    />
                    {valor
                      ? ['Muy Mala', 'Mala', 'Normal', 'Buena', 'Muy Buena'][
                          valor - 1
                        ]
                      : 'Limpiar valoración'}
                  </label>
                </div>
              ))}
              {/* Filtro por sede */}
              <div className="flex gap-4 items-center">
                {/* Filtro de Sede */}
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-gray-700">Sede:</label>
                  <select
                    value={filterSede || ''}
                    onChange={handleFilterSedeChange}
                    className="border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Todas</option>
                    <option value="SanMiguel">SMT</option>
                    <option value="Monteros">Monteros</option>
                    <option value="Concepción">Concepción</option>
                  </select>
                </div>

                {/* Filtro de Puesto */}
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-gray-700">Puesto:</label>
                  <select
                    value={filterPuesto}
                    onChange={handleFilterPuestoChange}
                    className="border border-gray-300 rounded-md p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Todos los puestos</option>
                    <option value="recepcionista">Recepcionista</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="instructormusculacion">
                      Instructor de musculación
                    </option>
                    <option value="coachclasesgrupales">
                      Coach de clases grupales
                    </option>
                    <option value="limpieza">Limpieza</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="marketing">Marketing</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              El Postulante NO Existe ||{' '}
              <span className="text-span"> Postulante: {results.length}</span>
            </p>
          ) : (
            <>
              <div className="w-full overflow-x-auto">
                <table className="w-11/12 mx-auto">
                  <thead className=" bg-[#fc4b08]  text-white">
                    <tr key={postulantes.id}>
                      <th>ID</th>
                      <th>NOMBRE</th>
                      <th>EDAD</th>
                      <th>SEXO</th>
                      <th>ROL</th>
                      <th>INSTA</th>
                      <th>WHATSAPP</th>
                      <th>SEDE</th>
                      <th>ESTUDIOS</th>

                      <th>VALORACIÓN</th>
                      <th>FEC. POSTULACIÓN</th>
                      <th>ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((postulante) => (
                      <tr key={postulante.id}>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.id}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.name}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.edad}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.sexo
                            ? postulante.sexo
                            : 'No especificado'}
                        </td>

                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.puesto}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.redes}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.celular}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.sede}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.estudios}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {postulante.valoracion === 0 ||
                          postulante.valoracion === null
                            ? 'No tiene Valoración'
                            : postulante.valoracion}
                        </td>
                        <td onClick={() => obtenerPostulante(postulante.id)}>
                          {formatearFecha(postulante.created_at)}
                        </td>
                        {/* ACCIONES */}

                        {(userLevel === 'admin' ||
                          userLevel === 'administrador') && (
                          <td className="flex space-x-3 px-2">
                            <button
                              onClick={() =>
                                handleEliminarPostulante(postulante.id)
                              }
                              type="button"
                              className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </td>
                        )}

                        <td className="flex items-center">
                          <button
                            onClick={() =>
                              contactarPostulante(
                                postulante.celular,
                                postulante.id
                              )
                            }
                            type="button"
                            className={`py-2 px-4 my-1 rounded-md text-white ${
                              contactados[postulante.id]
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {contactados[postulante.id]
                              ? 'Contactado'
                              : 'Contactar'}
                          </button>

                          <div className="w-1/2">
                            {' '}
                            {/* Segunda columna */}
                            <button
                              onClick={() => downloadCV(postulante.id)}
                              className="py-2 px-4 my-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                              Descargar PDF
                            </button>
                          </div>

                          {/* Botón de WhatsApp */}
                          <button
                            onClick={() =>
                              handleWhatsAppRedirect(postulante.celular)
                            }
                            type="button"
                            className="ml-2 py-2 px-4 my-1 rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center"
                          >
                            <FaWhatsapp className="mr-2" />{' '}
                            {/* Icono de WhatsApp */}
                            WhatsApp
                          </button>
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
      {selectedUser && (
        <PostulanteDetails
          user={selectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
          obtenerPostulantes={obtenerPostulantes}
        />
      )}
      <Footer />
    </>
  );
};

export default PostulanteGetV2;
