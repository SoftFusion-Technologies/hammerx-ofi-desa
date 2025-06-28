import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavbarStaff from './staff/NavbarStaff';
import { UserCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer/Footer';

const Loader = () => (
  <div className="flex justify-center items-center h-24">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#fc4b08] border-b-2"></div>
  </div>
);

export default function LogsAuditoria() {
  const [logs, setLogs] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [userId, setUserId] = useState('');
  const [alumno, setAlumno] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputTouched, setInputTouched] = useState(false);

  const URL = 'http://localhost:8080/';

  useEffect(() => {
    axios
      .get(`${URL}instructores`)
      .then((res) => setInstructores(res.data))
      .catch(() => setInstructores([]));
  }, []);

  const handleBuscar = (e) => {
    e.preventDefault();
    setInputTouched(true);
    if (!userId && (alumno.trim() !== '' || desde || hasta)) {
      setError(
        'Debés seleccionar un instructor para buscar por alumno o fecha.'
      );
      return;
    }
    setError('');
    buscar();
  };

  const limpiarFiltros = () => {
    setUserId('');
    setAlumno('');
    setDesde('');
    setHasta('');
    setLogs([]);
    setError('');
    setInputTouched(false);
  };

  const buscar = async () => {
    setLoading(true);
    const params = {};
    if (userId) params.user_id = userId;
    if (alumno) params.alumno = alumno;
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;

    try {
      const { data } = await axios.get(`${URL}logs`, { params });
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async (log) => {
    if (!userId) {
      alert('Seleccioná un instructor antes de recuperar.');
      return;
    }
    if (!window.confirm('¿Seguro que querés recuperar este alumno?')) return;
    setLoading(true);
    try {
      const instructor = instructores.find(
        (i) => String(i.id) === String(userId)
      );
      const res = await axios.post(`${URL}logs/${log.id}/recuperar`, {
        user_id: Number(userId),
        email: instructor?.email || ''
      });
      alert('Alumno recuperado correctamente');
      buscar(); // Refresca la tabla de logs
    } catch (e) {
      alert('Error al recuperar alumno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="pl-5 mb-10">
          <Link to="/dashboard/">
            <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
              Volver
            </button>
          </Link>
        </div>
        <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl mt-8">
          <h2 className="text-4xl font-bold mb-4 text-[#fc4b08] font-bignoodle text-center">
            Auditoría de acciones en Alumnos
          </h2>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-gray-500 dark:text-gray-300">
              {logs && logs.length > 0 && (
                <>
                  Registros encontrados: <b>{logs.length}</b>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded hover:bg-orange-50 dark:hover:bg-zinc-700 ml-2 transition"
            >
              Limpiar filtros
            </button>
          </div>
          {/* Filtros */}
          <form
            className="flex flex-wrap gap-4 mb-6 items-end bg-white dark:bg-zinc-900 rounded-2xl px-4 py-4 shadow transition"
            onSubmit={handleBuscar}
            autoComplete="off"
          >
            {/* Desplegable de instructores */}
            <div className="min-w-[220px] flex-1">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 pl-1">
                Instructor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserCircle
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none"
                  size={22}
                />
                <select
                  className={`pl-10 pr-4 py-2 w-full rounded-xl border 
                  ${
                    error && !userId && inputTouched
                      ? 'border-red-400 animate-shake'
                      : 'border-gray-300 dark:border-zinc-700'
                  } bg-white dark:bg-zinc-900 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#fc4b08] transition shadow-sm`}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                >
                  <option value="">Seleccionar Instructor</option>
                  {instructores.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.sede})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Otros filtros */}
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 pl-1">
                Nombre Alumno
              </label>
              <input
                type="text"
                placeholder="Nombre Alumno"
                className="input-filtro w-full"
                value={alumno}
                onChange={(e) => setAlumno(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 pl-1">
                Desde
              </label>
              <input
                type="date"
                className="input-filtro w-full"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1 pl-1">
                Hasta
              </label>
              <input
                type="date"
                className="input-filtro w-full"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-[#fc4b08] hover:bg-orange-500 text-white rounded-xl px-5 py-2 font-semibold shadow transition-all min-w-[120px]"
            >
              Buscar
            </button>
            {error && (
              <div className="w-full pt-2 text-red-600 font-semibold text-sm flex items-center pl-1 gap-1 animate-fade-in">
                <AlertCircle size={18} /> {error}
              </div>
            )}
            {/* Animación shake y fade-in para errores */}
            <style>{`
              @keyframes shake { 10%, 90% { transform: translateX(-2px); } 20%, 80% { transform: translateX(4px); } 30%, 50%, 70% { transform: translateX(-8px); } 40%, 60% { transform: translateX(8px); } }
              .animate-shake { animation: shake 0.4s; }
              @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
              .animate-fade-in { animation: fade-in 0.2s; }
              .input-filtro {
                @apply border border-gray-300 dark:border-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] transition-all shadow-sm bg-white dark:bg-zinc-900 text-gray-800 dark:text-white;
              }
            `}</style>
          </form>

          {/* Loader */}
          {loading && <Loader />}

          {/* Tabla de logs */}
          {!loading &&
            (logs.length === 0 ? (
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-8 opacity-80">
                <svg
                  width="60"
                  height="60"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="mb-2"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="#fc4b08"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path stroke="#fc4b08" strokeWidth="2" d="M9 12l2 2 4-4" />
                </svg>
                <span>No se encontraron registros.</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl shadow-inner">
                <table className="min-w-full bg-white dark:bg-zinc-900 rounded-xl">
                  <thead>
                    <tr className="text-[#fc4b08] bg-orange-50 dark:bg-zinc-800">
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3">Alumno</th>
                      <th className="px-4 py-3">Instructor</th>
                      <th className="px-4 py-3">Evento</th>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, idx) => (
                      <tr
                        key={log.id}
                        className={`border-b last:border-none transition-colors group ${
                          idx % 2 === 0 ? 'bg-gray-50 dark:bg-zinc-800/40' : ''
                        } hover:bg-orange-600 dark:hover:bg-zinc-700/60`}
                      >
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-200">
                          {log.id}
                        </td>
                        <td
                          className="px-4 py-3 truncate max-w-[180px]"
                          title={
                            log.nombre_alumno ||
                            (log.datos_antes && log.datos_antes.nombre) ||
                            log.alumno_id
                          }
                        >
                          {log.nombre_alumno ||
                            (log.datos_antes && log.datos_antes.nombre) ||
                            log.alumno_id}
                        </td>
                        <td
                          className="px-4 py-3 truncate max-w-[180px]"
                          title={log.nombre_usuario || log.user_id}
                        >
                          {log.nombre_usuario || log.user_id}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded px-2 py-1 text-xs font-bold bg-orange-100 text-[#fc4b08]">
                            {log.evento}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                          {log.fecha_evento?.slice(0, 19).replace('T', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          {log.evento === 'ELIMINAR' && !log.nombre_alumno && (
                            <button
                              onClick={() => handleRecuperar(log)}
                              className="text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded shadow transition-all"
                            >
                              Recuperar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}
