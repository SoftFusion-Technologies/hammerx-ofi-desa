import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { formatearFecha } from '../../../Helpers';
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaNovedad from '../../../components/Forms/FormAltaNovedad';
import { useAuth } from '../../../AuthContext';
import ModalNovedad from '../MetodsGet/ModalNovedad';
import FechasNovedad from './Novedad/FechasNovedad'; //R7- nuevo componente para agregar mas fechas 22/09/2024 - Benjamin Orellana
const NovedadGet = () => {
  const [modalNewNovedad, setModalNewNovedad] = useState(false);
  const [modalData, setModalData] = useState({ isOpen: false, mensaje: '' });
  const { userLevel, userName } = useAuth(); // Se obtiene el userName del contexto
  const [search, setSearch] = useState('');
  const [novedad, setNovedad] = useState([]);
  const [archivos, setArchivos] = useState([]);

  const [novedadId, setNovedadId] = useState(null); // R7 -Estado para almacenar el ID de la novedad
  const [modalFechas, setModalFechas] = useState(false); // R7  Estado para el modal de fechas
  const [vencimientos, setVencimientos] = useState([]); // R7  Estado para el modal de fechas

  const [selectednovedad, setSelectedNovedad] = useState(null); // Estado para el usuario seleccionado
  const [userId, setUserId] = useState(null); // Añadimos estado para userId

  const URL = 'http://localhost:8080/novedades/';
  const URL_ARCH = 'http://localhost:8080/novedadesarch/';
  const USERS_URL = 'http://localhost:8080/users/';
  const URLVEC = 'http://localhost:8080/novedades-vencimientos/';

  useEffect(() => {
    // Se obtiene el userId usando el userName (email)
    const obtenerUserId = async () => {
      try {
        const response = await axios.get(USERS_URL);
        const user = response.data.find((user) => user.email === userName);
        if (user) {
          setUserId(user.id);
        }
      } catch (error) {
        console.log('Error al obtener el userId:', error);
      }
    };

    obtenerUserId();
  }, [userName]);

  useEffect(() => {
    if (userId !== null) {
      obtenerNovedades();
      obtenerFechasVec();
    }
  }, [userId]);

  // R5-SUBIR ARCHIVOS A NOVEDADES - 16-09-2024 - Benjamin Orellana - INICIO
  useEffect(() => {
    if (novedad.length > 0) {
      fetchArchivos();
    }
  }, [novedad]);

  const fetchArchivos = async () => {
    try {
      const response = await axios.get(URL_ARCH);
      setArchivos(response.data);
    } catch (err) {
      console.error('Error al obtener archivos:', err);
    }
  };

  const obtenerArchivosPorNovedad = async (novedadId) => {
    try {
      const response = await axios.get(`${URL_ARCH}${novedadId}`);
      setArchivosNovedad(response.data);
    } catch (error) {
      console.error('Error al obtener archivos de la novedad:', error);
    }
  };
  // R5-SUBIR ARCHIVOS A NOVEDADES - 16-09-2024 - Benjamin Orellana - FINAL

  const abrirModal = () => {
    setModalNewNovedad(true);
  };

  // R7 - Agregar varias fechas a las novedades
  const abrirModalFechas = (id) => {
    setSelectedNovedad(id); // Almacena el ID de la novedad seleccionada
    setModalNewNovedad(false); // Cierra el modal de alta novedad si está abierto
    setModalData({ isOpen: false, mensaje: '' }); // Cierra el modal de detalle si está abierto
    setModalFechas(true); // Abre el modal de fechas
    loadVencimientos(id); // Carga vencimientos al abrir el modal
    setNovedadId(id);
  };
  const cerrarModal = () => {
    setModalNewNovedad(false);
    obtenerNovedades();
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  const obtenerNovedades = async () => {
    try {
      const response = await axios.get(URL);
      const novedadesOrdenadas = response.data.sort((a, b) => b.id - a.id);
      setNovedad(novedadesOrdenadas);
    } catch (error) {
      console.log('Error al obtener las novedades:', error);
    }
  };

  const obtenerFechasVec = async () => {
    try {
      const response = await axios.get(URLVEC);
      const vencimientosOrdenados = response.data.sort((a, b) => b.id - a.id);
      setVencimientos(vencimientosOrdenados);
    } catch (error) {
      console.log('Error al obtener las fechas de vencimiento:', error);
    }
  };

  const handleEliminarNovedad = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        await fetch(url, { method: 'DELETE' });
        const arraynovedad = novedad.filter((novedad) => novedad.id !== id);
        setNovedad(arraynovedad);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleOpenModal = (mensaje) => {
    setModalData({ isOpen: true, mensaje });
  };

  const handleCloseModal = () => {
    setModalData({ isOpen: false, mensaje: '' });
  };

  // Filtrar novedades basadas en el usuario autenticado y nivel de usuario
  const filtrarNovedades = (novedades) => {
    return novedades.filter((novedad) => {
      const userAssigned =
        novedad.novedadUsers &&
        novedad.novedadUsers.some((user) => user.user.id === parseInt(userId));
      const userAdminOrGerente =
        userLevel === 'admin' || userLevel === 'gerente';
      return userAssigned || userAdminOrGerente;
    });
  };

  const results = !search
    ? filtrarNovedades(novedad)
    : filtrarNovedades(novedad).filter((dato) => {
        return dato.sede.toLowerCase().includes(search.toLowerCase());
      });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = results.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(results.length / itemsPerPage);
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

  // Normalizar las fechas de hoy y mañana para comparar correctamente
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza la fecha a las 00:00:00

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1); // Ajustar para el día siguiente

  // 1. Crear un array combinado de novedades con sus fechas adicionales de republicación
  const novedadesConFechas = records.map((novedad) => {
    // Buscar las fechas de vencimiento adicionales de `novedades-vencimientos` que coincidan con esta novedad
   
    const fechasAdicionales = vencimientos
      .filter((v) => v.novedad_id === novedad.id)
      .map((v) => new Date(v.vencimiento));

    return {
      ...novedad,
      fechasVencimiento: [new Date(novedad.vencimiento), ...fechasAdicionales] // Incluye la fecha principal y las adicionales
    };
  });

  // 2. Filtrar `novedades programadas` y `últimas novedades` con las fechas de vencimiento correspondientes
  const novedadesProgramadas = records.filter(
    (novedad) => new Date(novedad.vencimiento) > new Date()
  );

  const ultimasNovedades = novedadesConFechas.filter((novedad) =>
    novedad.fechasVencimiento.some((fecha) => fecha <= today)
  );

  // 3. Combinar y ordenar las novedades según las fechas de vencimiento más recientes
  const novedadesOrdenadas = [...ultimasNovedades].sort((a, b) => {
    const fechaA = Math.max(...a.fechasVencimiento.map((f) => f.getTime()));
    const fechaB = Math.max(...b.fechasVencimiento.map((f) => f.getTime()));
    return fechaB - fechaA;
  });

  const handleEditarNovedad = async (novedad) => {
    setSelectedNovedad(novedad);
    setModalNewNovedad(true);
    await obtenerArchivosPorNovedad(novedad.id); // Obtener archivos de la novedad seleccionada
  };

  const handleFileUpload = async (event, novedadId) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `http://localhost:8080/upload/novedad/${novedadId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Archivo subido y guardado correctamente.');
    } catch (error) {
      console.error('Error al subir el archivo:', error);
      alert('Error al subir el archivo.');
    }
  };

  const handleDeleteArchivo = async (archivoId) => {
    const confirmacion = window.confirm(
      '¿Seguro que desea eliminar este archivo?'
    );
    if (confirmacion) {
      try {
        await axios.delete(`${URL_ARCH}${archivoId}`);
        // Actualiza el estado local para eliminar el archivo de la lista
        setArchivos(archivos.filter((archivo) => archivo.id !== archivoId));
      } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        alert('Error al eliminar el archivo.');
      }
    }
  };

  // R7 - Agregar varias fechas a las novedades
  const loadVencimientos = async (id) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/novedades-vencimientos/${id}`
      );

      if (response.data && response.data.length > 0) {
        setVencimientos(response.data); // Si hay datos, actualiza el estado
      } else {
        console.log('No hay vencimientos registrados para esta novedad.');
        alert('No hay vencimientos registrados para esta novedad.');
      }
    } catch (error) {
      // console.error('Error al cargar vencimientos:', error);
      // alert('Error al cargar vencimientos.');
    }
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
          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar novedades"
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
                  Nueva Novedad
                </button>
              </Link>
            </div>
          )}

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              La novedad NO Existe ||{' '}
              <span className="text-span"> Novedad: {results.length}</span>
            </p>
          ) : (
            <>
              {(userLevel === 'admin' || userLevel === 'administrador') && (
                <div className="mb-4">
                  <h2 className="text-xl font-semibold ml-4">
                    NOVEDADES PROGRAMADAS
                  </h2>
                  <div className="block space-y-4">
                    {novedadesProgramadas.map((novedad) => (
                      <div
                        key={novedad.id}
                        className="border m-5 border-gray-300 p-5 rounded-lg cursor-pointer mb-4"
                        // onClick={() => handleOpenModal(novedad.mensaje)} se elimina de este div, ya que al presionar en cualquier parte o en eliminar y editar se abre el modal
                      >
                        <h2
                          className="text-xl text-gray-300 font-semibold mb-4"
                          onClick={() => handleOpenModal(novedad.mensaje)}
                        >
                          Sucursal: {novedad.sede}
                        </h2>
                        <b>
                          <p
                            className="text-orange-500 mb-4"
                            onClick={() => handleOpenModal(novedad.mensaje)}
                          >
                            {novedad.titulo}
                          </p>
                        </b>
                        <p>Usuarios asignados a la novedad:</p>
                        <b>
                          <div onClick={() => handleOpenModal(novedad.mensaje)}>
                            <p className="text-gray-600 mb-4">
                              {novedad.novedadUsers &&
                              novedad.novedadUsers.length > 0
                                ? novedad.novedadUsers
                                    .map((novedadUser) => novedadUser.user.name)
                                    .join(', ')
                                : 'No users assigned'}
                            </p>

                            {novedad.novedadUsers &&
                            novedad.novedadUsers.length > 0 ? (
                              novedad.novedadUsers.map((novedadUser, index) => (
                                <p
                                  onClick={() =>
                                    handleOpenModal(novedad.mensaje)
                                  }
                                  key={index}
                                  className={
                                    novedad.estado === 0
                                      ? 'text-green-500 mb-4'
                                      : 'text-red-500 mb-4'
                                  }
                                >
                                  {novedadUser.user.name}:{' '}
                                  {novedad.estado === 0 ? 'Leido' : 'No Leido'}
                                </p>
                              ))
                            ) : (
                              <p
                                className="text-red-500 mb-4"
                                onClick={() => handleOpenModal(novedad.mensaje)}
                              >
                                Sin Usuarios asignados
                              </p>
                            )}
                          </div>
                        </b>
                        {archivos.filter(
                          (archivo) => archivo.novedad_id === novedad.id
                        ).length > 0 && (
                          <>
                            <p>
                              Archivos subidos:{' '}
                              {
                                archivos.filter(
                                  (archivo) => archivo.novedad_id === novedad.id
                                ).length
                              }
                            </p>
                            <ul>
                              {archivos
                                .filter(
                                  (archivo) => archivo.novedad_id === novedad.id
                                )
                                .map((archivo) => (
                                  <li key={archivo.id}>
                                    {archivo.nombre_archivo} -{' '}
                                    <a
                                      href={`http://localhost:8080/download/novedad/${archivo.id}`}
                                      className="text-blue-500 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Descargar
                                    </a>
                                    {(userLevel === 'admin' ||
                                      userLevel === 'administrador') && (
                                      <button
                                        onClick={() =>
                                          handleDeleteArchivo(archivo.id)
                                        }
                                        className="ml-2 text-red-500 underline"
                                      >
                                        Eliminar
                                      </button>
                                    )}
                                  </li>
                                ))}
                            </ul>
                          </>
                        )}
                        <p>Fecha de publicacion:</p>
                        <b>
                          <p
                            className="text-gray-600"
                            onClick={() => handleOpenModal(novedad.mensaje)}
                          >
                            {novedad.vencimiento}
                          </p>
                        </b>

                        <div className="flex justify-end space-x-4">
                          {(userLevel === 'admin' ||
                            userLevel === 'administrador') && (
                            <div>
                              <button
                                onClick={() =>
                                  handleEliminarNovedad(novedad.id)
                                }
                                className="py-2 px-4 mr-3 bg-red-500 text-white rounded-md hover:bg-red-600"
                              >
                                Eliminar
                              </button>
                              <button
                                onClick={() => handleEditarNovedad(novedad)}
                                className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                              >
                                Editar
                              </button>
                              {/* Nuevo botón para subir archivos R5-Subir archivos a novedades */}
                              <label
                                htmlFor={`file-upload-${novedad.id}`}
                                className="py-2 px-4 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                              >
                                Subir Archivo
                              </label>
                              <input
                                id={`file-upload-${novedad.id}`}
                                type="file"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileUpload(e, novedad.id)
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold ml-4">
                  ÚLTIMAS NOVEDADES
                </h2>
                <div className="block space-y-4">
                  {novedadesOrdenadas.map((novedad) => (
                    <div
                      key={novedad.id}
                      className="border m-5 border-gray-300 p-4 rounded-lg cursor-pointer mb-4"
                      // onClick={() => handleOpenModal(novedad.mensaje)}
                    >
                      <h2
                        className="text-xl text-gray-300 font-semibold mb-4"
                        onClick={() => handleOpenModal(novedad.mensaje)}
                      >
                        Sucursal: {novedad.sede}
                      </h2>
                      <b>
                        <p
                          className="text-orange-500 mb-4"
                          onClick={() => handleOpenModal(novedad.mensaje)}
                        >
                          {novedad.titulo}
                        </p>
                      </b>
                      <p>Usuarios asignados a la novedad:</p>
                      <b>
                        <div onClick={() => handleOpenModal(novedad.mensaje)}>
                          <p className="text-gray-600 mb-4">
                            {novedad.novedadUsers &&
                            novedad.novedadUsers.length > 0
                              ? novedad.novedadUsers
                                  .map((novedadUser) => novedadUser.user.name)
                                  .join(', ')
                              : 'No users assigned'}
                          </p>

                          {novedad.novedadUsers &&
                          novedad.novedadUsers.length > 0 ? (
                            novedad.novedadUsers.map((novedadUser, index) => (
                              <p
                                onClick={() => handleOpenModal(novedad.mensaje)}
                                key={index}
                                className={
                                  novedad.estado === 0
                                    ? 'text-green-500 mb-4'
                                    : 'text-red-500 mb-4'
                                }
                              >
                                {novedadUser.user.name}:{' '}
                                {novedad.estado === 0 ? 'Leido' : 'No Leido'}
                              </p>
                            ))
                          ) : (
                            <p className="text-red-500 mb-4">
                              Sin Usuarios asignados
                            </p>
                          )}
                        </div>
                      </b>

                      <p>Fecha de publicacion:</p>
                      <b>
                        <p
                          className="text-gray-600"
                          onClick={() => handleOpenModal(novedad.mensaje)}
                        >
                          {novedad.vencimiento}
                        </p>
                      </b>

                      {archivos.filter(
                        (archivo) => archivo.novedad_id === novedad.id
                      ).length > 0 && (
                        <>
                          <p>
                            Archivos subidos:{' '}
                            {
                              archivos.filter(
                                (archivo) => archivo.novedad_id === novedad.id
                              ).length
                            }
                          </p>
                          <ul>
                            {archivos
                              .filter(
                                (archivo) => archivo.novedad_id === novedad.id
                              )
                              .map((archivo) => (
                                <li key={archivo.id}>
                                  {archivo.nombre_archivo} -{' '}
                                  <a
                                    href={`http://localhost:8080/download/novedad/${archivo.id}`}
                                    className="text-blue-500 underline"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Descargar
                                  </a>
                                </li>
                              ))}
                          </ul>
                        </>
                      )}

                      <div className="flex justify-end space-x-4">
                        {(userLevel === 'admin' ||
                          userLevel === 'administrador') && (
                          <div>
                            <button
                              onClick={() => handleEliminarNovedad(novedad.id)}
                              className="py-2 px-4 mr-3 bg-red-500 text-white rounded-md hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                            <button
                              onClick={() => handleEditarNovedad(novedad)}
                              className="py-2 px-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                            >
                              Editar
                            </button>
                            {/* Nuevo botón para subir archivos R5-Subir archivos a novedades */}
                            <label
                              htmlFor={`file-upload-${novedad.id}`}
                              className="py-2 px-4 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600"
                            >
                              Subir Archivo
                            </label>
                            <input
                              id={`file-upload-${novedad.id}`}
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileUpload(e, novedad.id)}
                            />
                            <button
                              onClick={() => abrirModalFechas(novedad.id)}
                              className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-yellow-600"
                            >
                              Ver Fechas
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-center">
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
          </div>
        </div>
      </div>
      <Footer />

      <FormAltaNovedad
        isOpen={modalNewNovedad}
        onClose={() => setModalNewNovedad(false)}
        novedad={selectednovedad}
        setSelectedNovedad={setSelectedNovedad}
      />
      <ModalNovedad
        isOpen={modalData.isOpen}
        mensaje={modalData.mensaje}
        onClose={handleCloseModal}
        obtenerNovedades={obtenerNovedades}
      />
      <FechasNovedad
        novedad={novedad.find((nov) => nov.id === novedadId)} // Seleccionas la novedad basada en novedadId
        isOpen={modalFechas}
        onClose={() => {
          setModalFechas(false);
          setVencimientos([]); // Limpia los vencimientos al cerrar
        }}
        novedadId={novedadId}
        vencimientos={vencimientos} // Pasa los vencimientos al modal
      />
    </>
  );
};

export default NovedadGet;
