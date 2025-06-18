import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarStaff from '../NavbarStaff';
import Footer from '../../../components/footer/Footer';
import { formatearFecha } from '../../../Helpers';
import { useAuth } from '../../../AuthContext';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import FiltroMesAnio from '../Components/FiltroMesAnio';
import FormAltaRecaptacion from '../../../components/Forms/FormAltaRecaptacion';
import FileUploadRecaptacion from '../Components/FileUploadRecaptacion';
const RecaptacionGet = () => {
  const [recaptaciones, setRecaptaciones] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [contactado, setContactado] = useState({});
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [usuarioFiltro, setUsuarioFiltro] = useState('');

  const { userLevel, userId } = useAuth(); // suponiendo que tienes userId también

  const [modalNewRec, setModalNewRecaptacion] = useState(false);
  const [selectedRec, setSelectedRecaptacion] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const URL = 'http://localhost:8080/recaptacion/';

  // Carga datos al inicio y cada vez que cambian filtros
  useEffect(() => {
    getRecaptacion();
    fetchColaboradores();
  }, [mes, anio]);

  const getRecaptacion = async () => {
    try {
      // Armar params con filtros y usuario/level
      const params = {
        level: userLevel // <-- IMPORTANTE, enviar siempre el level
      };

      // Solo envía usuario_id si no es admin ni coordinador
      if (userLevel !== 'admin' && userLevel !== 'coordinador') {
        params.usuario_id = userId;
      }

      if (mes) params.mes = mes;
      if (anio) params.anio = anio;

      const res = await axios.get(URL, { params });
      const resUsers = await axios.get('http://localhost:8080/users'); // o el endpoint que tengas

      setRecaptaciones(res.data);
      setUsuarios(resUsers.data);

      const estado = {};
      res.data.forEach((recap) => {
        estado[recap.id] = recap.enviado;
      });
      setContactado(estado);
    } catch (error) {
      console.log(error);
    }
  };

  const obtenerNombreUsuario = (usuario_id) => {
    const usuario = usuarios.find((u) => u.id === usuario_id);
    return usuario ? usuario.name : 'Sin usuario';
  };

  const handleSearch = (e) => setSearch(e.target.value);

  const filtered = recaptaciones.filter((recap) => {
    const coincideNombre = recap.nombre
      .toLowerCase()
      .includes(search.toLowerCase());
    const coincideUsuario = usuarioFiltro
      ? recap.usuario_id === usuarioFiltro
      : true;
    return coincideNombre && coincideUsuario;
  });

  const sorted = [...filtered].sort((a, b) => {
    // Primero los que NO están enviados
    if (a.enviado !== b.enviado) {
      return a.enviado ? 1 : -1;
    }
    // Si ambos tienen el mismo estado 'enviado', ordenar por ID descendente
    return b.id - a.id;
  });

  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = sorted.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const pageNumbers = [...Array(totalPages + 1).keys()].slice(1);

  const toggleCampo = async (id, campo, valorActual) => {
    try {
      const nuevoValor = !valorActual;

      // Enviar actualización al backend
      await axios.put(`${URL}${id}`, { [campo]: nuevoValor });

      // Actualizar estado local para reflejar cambio inmediato
      setRecaptaciones((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [campo]: nuevoValor } : item
        )
      );
    } catch (error) {
      console.error('Error actualizando campo:', error);
    }
  };

  const abrirModal = () => {
    setModalNewRecaptacion(true);
    setSelectedRecaptacion(null);
  };
  const cerarModal = () => {
    setModalNewRecaptacion(false);
    getRecaptacion('');
    fetchColaboradores();
  };

  const handleEliminarRec = async (id) => {
    const confirmacion = window.confirm(
      '¿Seguro que desea eliminar esta recaptación?'
    );
    if (confirmacion) {
      try {
        await axios.delete(`${URL}${id}`);
        setRecaptaciones(recaptaciones.filter((q) => q.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleEditarRec = (rec) => {
    // Se actualiza el estado con los detalles de la recaptacion seleccionada
    setSelectedRecaptacion(rec);

    // Se abre el modal para editar la recaptacion
    setModalNewRecaptacion(true);
  };

  const fetchColaboradores = async () => {
    const res = await axios.get('http://localhost:8080/usuarios-con-registros');
    setColaboradores(res.data);
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

          <div className="text-center pt-4">
            <h1>Registros de Recaptación - Cantidad: {filtered.length}</h1>
          </div>

          {/* Filtros Mes y Año */}
          <FiltroMesAnio
            mes={mes}
            setMes={setMes}
            anio={anio}
            setAnio={setAnio}
          />

          <form className="flex flex-col md:flex-row items-center justify-center gap-4 py-5 px-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Buscar por nombre"
              className="w-full md:w-72 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
            {userLevel === 'admin' && (
              <select
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(Number(e.target.value))}
                className="w-full md:w-64 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              >
                <option value="">Todos los colaboradores</option>
                {colaboradores.map((colab) => (
                  <option key={colab.id} value={colab.id}>
                    {colab.name}
                  </option>
                ))}
              </select>
            )}
          </form>

          {(userLevel === 'admin' || userLevel === 'administrador') && (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nuevo Registro
                </button>
              </Link>
              <Link to="#">
                <button
                  onClick={() => setShowUpload(true)}
                  className="ml-2 bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Importar Excel Masivo
                </button>
              </Link>
            </div>
          )}

          <table className="w-11/12 mx-auto">
            <thead className="bg-[#fc4b08] text-white">
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Tipo Contacto</th>
                <th>Enviado</th>
                <th>Respondido</th>
                <th>Agendado</th>
                <th>Convertido</th>
                {userLevel === 'admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((recap) => (
                <tr key={recap.id}>
                  <td>{recap.id}</td>
                  <td>{formatearFecha(recap.fecha)}</td>
                  <td>{obtenerNombreUsuario(recap.usuario_id)}</td>
                  <td>{recap.nombre}</td>
                  <td>
                    {recap.tipo_contacto === 'Otro'
                      ? recap.detalle_contacto
                      : recap.tipo_contacto}
                  </td>

                  {/* Enviado */}
                  <td
                    onClick={() =>
                      toggleCampo(recap.id, 'enviado', recap.enviado)
                    }
                    className={`cursor-pointer ${
                      recap.enviado
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }`}
                    title="Click para cambiar estado"
                  >
                    {recap.enviado ? 'MARCADO' : 'A MARCAR'}
                  </td>

                  <td
                    onClick={() =>
                      toggleCampo(recap.id, 'respondido', recap.respondido)
                    }
                    className={`cursor-pointer ${
                      recap.respondido
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }`}
                    title="Click para cambiar estado"
                  >
                    {recap.respondido ? 'MARCADO' : 'A MARCAR'}
                  </td>

                  <td
                    onClick={() =>
                      toggleCampo(recap.id, 'agendado', recap.agendado)
                    }
                    className={`cursor-pointer ${
                      recap.agendado
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }`}
                    title="Click para cambiar estado"
                  >
                    {recap.agendado ? 'MARCADO' : 'A MARCAR'}
                  </td>

                  <td
                    onClick={() =>
                      toggleCampo(recap.id, 'convertido', recap.convertido)
                    }
                    className={`cursor-pointer ${
                      recap.convertido
                        ? 'text-green-600 font-semibold'
                        : 'text-red-600 font-semibold'
                    }`}
                    title="Click para cambiar estado"
                  >
                    {recap.convertido ? 'MARCADO' : 'A MARCAR'}
                  </td>

                  {/* ACCIONES */}

                  {(userLevel === 'admin' || userLevel === 'administrador') && (
                    <td className="">
                      <button
                        onClick={() => handleEliminarRec(recap.id)}
                        type="button"
                        className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => handleEditarRec(recap)} // (NUEVO)
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
            <ul className="pagination flex gap-1">
              <li>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                >
                  Prev
                </button>
              </li>
              {pageNumbers.map((n) => (
                <li key={n}>
                  <button
                    onClick={() => setCurrentPage(n)}
                    className={`page-link ${
                      currentPage === n ? 'bg-gray-300' : ''
                    }`}
                  >
                    {n}
                  </button>
                </li>
              ))}
              <li>
                <button
                  className="page-link"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Footer />

      <FormAltaRecaptacion
        isOpen={modalNewRec}
        onClose={cerarModal}
        Rec={selectedRec}
        setSelectedRecaptacion={setSelectedRecaptacion}
      />
      {showUpload && (
        <FileUploadRecaptacion
          usuarioId={userId}
          onClose={() => setShowUpload(false)}
          getRecaptacion={getRecaptacion}
          onSuccess={() => {
            setShowUpload(false);
            // Opcional: recarga o actualización de lista tras importación exitosa
            // ejemplo: fetchData();
          }}
        />
      )}
    </>
  );
};

export default RecaptacionGet;
