import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavbarStaff from '../NavbarStaff';
import Footer from '../../../components/footer/Footer';
import { formatearFecha } from '../../../Helpers';
import { useAuth } from '../../../AuthContext';
import { Link } from 'react-router-dom';
import FiltroMesAnio from '../Components/FiltroMesAnio';
import FormAltaRecaptacion from '../../../components/Forms/FormAltaRecaptacion';
import FileUploadRecaptacion from '../Components/FileUploadRecaptacion';
import DetalleContactoCell from '../Components/DetalleContactoCell';
import ModalDetalleContacto from '../Components/ModalDetalleContacto';
import ParticlesBackground from '../../../components/ParticlesBackground';
import ModalBorradoMasivo from '../Components/ModalBorradoMasivo';
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUpload,
  FiCheck,
  FiX,
  FiUser,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

const RecaptacionGet = () => {
  const [recaptaciones, setRecaptaciones] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [usuarioFiltro, setUsuarioFiltro] = useState('');
  const [modalDetalle, setModalDetalle] = useState({
    open: false,
    detalle: ''
  });
  const { userLevel, userId } = useAuth();

  const [modalNewRec, setModalNewRecaptacion] = useState(false);
  const [selectedRec, setSelectedRecaptacion] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const [openBorradoMasivo, setOpenBorradoMasivo] = useState(false);

  const URL = 'http://localhost:8080/recaptacion/';

  useEffect(() => {
    getRecaptacion();
    fetchColaboradores();
  }, [mes, anio]);

  const getRecaptacion = async () => {
    try {
      const params = { level: userLevel };
      if (userLevel !== 'admin' && userLevel !== 'coordinador')
        params.usuario_id = userId;
      if (mes) params.mes = mes;
      if (anio) params.anio = anio;

      const res = await axios.get(URL, { params });
      const resUsers = await axios.get('http://localhost:8080/users');

      setRecaptaciones(res.data);
      setUsuarios(resUsers.data);
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
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const coincideUsuario = usuarioFiltro
      ? recap.usuario_id === usuarioFiltro
      : true;
    return coincideNombre && coincideUsuario;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.enviado !== b.enviado) return a.enviado ? 1 : -1;
    return b.id - a.id;
  });

  const itemsPerPage = 12;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const currentItems = sorted.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const toggleCampo = async (id, campo, valorActual) => {
    try {
      const nuevoValor = !valorActual;
      await axios.put(`${URL}${id}`, { [campo]: nuevoValor });
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
    setSelectedRecaptacion(rec);
    setModalNewRecaptacion(true);
  };

  const fetchColaboradores = async () => {
    const res = await axios.get('http://localhost:8080/usuarios-con-registros');
    setColaboradores(res.data);
  };

  // --- Badges Modernos ---
  const EstadoBadge = ({ estado, texto }) => (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border
        ${
          estado
            ? 'bg-green-200 text-green-800 border-green-400'
            : 'bg-red-200 text-red-700 border-red-400'
        }
        shadow-sm transition-all duration-200`}
    >
      {estado ? <FiCheck className="inline" /> : <FiX className="inline" />}{' '}
      {texto}
    </span>
  );

  const borrarPorMesAnio = async (mes, anio) => {
    return await axios.delete('http://localhost:8080/recaptacion-masivo', {
      params: { mes, anio }
    });
  };

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground></ParticlesBackground>
      <div
        className="
  min-h-screen 
  bg-gradient-to-br 
  from-[#181818] to-[#292929]
  pt-6 pb-14
  transition-colors duration-500
"
      >
        {' '}
        <div className="max-w-[97vw] md:max-w-[92vw] mx-auto rounded-3xl shadow-2xl bg-white/95 border border-orange-100 px-4 md:px-10 pt-6 pb-4 transition-all duration-200">
          {/* Encabezado Sticky */}
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg px-4 py-2 rounded-2xl flex flex-col md:flex-row items-center justify-between shadow-lg border-b border-orange-100 transition-all duration-200">
            <Link to="/dashboard">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-[#fc4b08] shadow hover:bg-orange-500 transition">
                <FiChevronLeft /> Volver
              </button>
            </Link>
            <h1 className="font-bignoodle font-black text-2xl md:text-3xl text-[#fc4b08] tracking-tight uppercase my-2 text-center drop-shadow">
              Registros de Recaptación
              <span className="ml-3 text-lg text-gray-400 font-medium drop-shadow">
                {filtered.length} encontrados
              </span>
            </h1>
            {(userLevel === 'admin' || userLevel === 'administrador') && (
              <div className="flex gap-2">
                <button
                  onClick={abrirModal}
                  className="bg-gradient-to-tr from-[#fc4b08] to-[#d35400] shadow-lg rounded-xl px-5 py-2 text-white font-bold flex items-center gap-2 hover:scale-105 active:scale-95 hover:brightness-110 transition"
                >
                  <FiPlus /> Nuevo
                </button>
                <button
                  onClick={() => setShowUpload(true)}
                  className="bg-white/95 border-2 border-[#fc4b08] text-[#fc4b08] font-bold px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-orange-50 shadow transition"
                >
                  <FiUpload /> Importar
                </button>
              </div>
            )}
          </div>

          {/* Filtros */}
          <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center my-6 px-2">
            <FiltroMesAnio
              mes={mes}
              setMes={setMes}
              anio={anio}
              setAnio={setAnio}
            />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Buscar por nombre"
              className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fc4b08] bg-white shadow"
            />
            {userLevel === 'admin' && (
              <select
                value={usuarioFiltro}
                onChange={(e) => setUsuarioFiltro(Number(e.target.value))}
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#fc4b08] bg-white shadow"
              >
                <option value="">Todos los colaboradores</option>
                {colaboradores.map((colab) => (
                  <option key={colab.id} value={colab.id}>
                    {colab.name}
                  </option>
                ))}
              </select>
            )}
          </section>
          {(userLevel === 'admin' || userLevel === 'administrador') && (
            <div className="flex gap-2">
              <button
                onClick={() => setOpenBorradoMasivo(true)}
                className="bg-gradient-to-tr from-[#2d0700] to-[#fc4b08] shadow-lg rounded-xl px-5 py-2 text-white font-bold flex items-center gap-2 hover:scale-105 hover:bg-[#d35400] transition"
                title="Borrado masivo por mes"
              >
                <FiTrash2 /> Borrar mes
              </button>
            </div>
          )}
          {/* Tabla ultra moderna */}
          <div className="overflow-x-auto rounded-3xl border border-orange-100 mt-4 shadow-2xl">
            <table className="min-w-full text-base md:text-lg text-gray-700 rounded-3xl">
              <thead>
                <tr className="bg-[#fc4b08] text-white font-bold text-lg sticky top-0 z-10 shadow">
                  <th className="py-4 px-2">ID</th>
                  <th className="py-4 px-2">Fecha</th>
                  <th className="py-4 px-2">Usuario</th>
                  <th className="py-4 px-2">Nombre</th>
                  <th className="py-4 px-2">Tipo Contacto</th>
                  <th className="py-4 px-2">Detalle Contacto</th>
                  <th className="py-4 px-2">Enviado</th>
                  <th className="py-4 px-2">Respondido</th>
                  <th className="py-4 px-2">Agendado</th>
                  <th className="py-4 px-2">Convertido</th>
                  {userLevel === 'admin' && (
                    <th className="py-4 px-2">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={userLevel === 'admin' ? 11 : 10}
                      className="py-10 text-center text-gray-400 italic"
                    >
                      Sin registros para mostrar.
                    </td>
                  </tr>
                )}
                {currentItems.map((recap, i) => (
                  <tr
                    key={recap.id}
                    className={`transition-all duration-200 
                    ${i % 2 === 0 ? 'bg-white' : 'bg-orange-50'} 
                    hover:bg-[#d35400] hover:text-white hover:shadow-2xl hover:scale-[1.01] rounded-xl`}
                    style={{
                      animation: `fadeIn .3s cubic-bezier(.55,.08,.53,1.09) both`
                    }}
                  >
                    <td className="py-3 px-2 font-black text-[#fc4b08] text-lg">
                      {recap.id}
                    </td>
                    <td className="py-3 px-2">{formatearFecha(recap.fecha)}</td>
                    <td className="py-3 px-2 flex items-center gap-2">
                      <FiUser className="text-orange-400" />
                      <span className="font-semibold">
                        {obtenerNombreUsuario(recap.usuario_id)}
                      </span>
                    </td>
                    <td className="py-3 px-2">{recap.nombre}</td>
                    <td className="py-3 px-2">
                      {recap.tipo_contacto ? (
                        <span className="bg-orange-200 text-[#d35400] rounded-full px-3 py-1 font-black text-xs">
                          {recap.tipo_contacto}
                        </span>
                      ) : (
                        <span className="text-gray-300">sin tipo</span>
                      )}
                    </td>

                    <td className="py-3 px-2 text-center min-w-[110px] max-w-[180px]">
                      <DetalleContactoCell
                        detalle={recap.detalle_contacto}
                        onShowDetalle={(detalle) =>
                          setModalDetalle({ open: true, detalle })
                        }
                      />
                    </td>
                    <td
                      className="py-3 px-2 text-center cursor-pointer"
                      onClick={() =>
                        toggleCampo(recap.id, 'enviado', recap.enviado)
                      }
                    >
                      <EstadoBadge estado={recap.enviado} texto="Enviado" />
                    </td>
                    <td
                      className="py-3 px-2 text-center cursor-pointer"
                      onClick={() =>
                        toggleCampo(recap.id, 'respondido', recap.respondido)
                      }
                    >
                      <EstadoBadge
                        estado={recap.respondido}
                        texto="Respondido"
                      />
                    </td>
                    <td
                      className="py-3 px-2 text-center cursor-pointer"
                      onClick={() =>
                        toggleCampo(recap.id, 'agendado', recap.agendado)
                      }
                    >
                      <EstadoBadge estado={recap.agendado} texto="Agendado" />
                    </td>
                    <td
                      className="py-3 px-2 text-center cursor-pointer"
                      onClick={() =>
                        toggleCampo(recap.id, 'convertido', recap.convertido)
                      }
                    >
                      <EstadoBadge
                        estado={recap.convertido}
                        texto="Convertido"
                      />
                    </td>
                    {userLevel === 'admin' && (
                      <td className="py-3 px-2 flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditarRec(recap)}
                          className="bg-yellow-400 text-black hover:bg-yellow-500 rounded-full p-2 shadow-md transition"
                          title="Editar"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleEliminarRec(recap.id)}
                          className="bg-red-500 text-white hover:bg-red-600 rounded-full p-2 shadow-md transition"
                          title="Eliminar"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación premium */}
          <nav className="flex justify-center items-center my-10 gap-2">
            <button
              className="px-4 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08] hover:text-white transition flex items-center gap-2 shadow"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Prev
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setCurrentPage(n)}
                className={`px-4 py-2 rounded-full font-bold ${
                  currentPage === n
                    ? 'bg-[#d35400] text-white shadow-lg'
                    : 'bg-orange-50 hover:bg-orange-200'
                } transition`}
              >
                {n}
              </button>
            ))}
            <button
              className="px-4 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08] hover:text-white transition flex items-center gap-2 shadow"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next <FiChevronRight />
            </button>
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
          }}
        />
      )}
      {/* FAB Nuevo en mobile */}
      {(userLevel === 'admin' || userLevel === 'administrador') && (
        <button
          onClick={abrirModal}
          className="fixed bottom-8 right-8 md:hidden bg-gradient-to-tr from-[#fc4b08] to-[#d35400] shadow-2xl rounded-full p-5 text-white text-3xl z-50 animate-bounce hover:scale-110 transition"
          style={{ boxShadow: '0 8px 32px 0 rgba(252,75,8,0.15)' }}
        >
          <FiPlus />
        </button>
      )}
      <style>
        {`
        @keyframes fadeIn {
          from {opacity: 0; transform: translateY(16px);}
          to {opacity: 1; transform: none;}
        }
        `}
      </style>
      <ModalBorradoMasivo
        open={openBorradoMasivo}
        onClose={() => setOpenBorradoMasivo(false)}
        onConfirm={borrarPorMesAnio}
        getRecaptacion={getRecaptacion}
      />
      <ModalDetalleContacto
        open={modalDetalle.open}
        detalle={modalDetalle.detalle}
        onClose={() => setModalDetalle({ open: false, detalle: '' })}
      />
    </>
  );
};

export default RecaptacionGet;
