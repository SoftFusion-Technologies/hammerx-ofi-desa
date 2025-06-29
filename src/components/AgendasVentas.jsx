import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Bell, X, Eye } from 'lucide-react'; // Usá íconos propios si querés

const URL = 'http://localhost:8080/';

export default function AgendasVentas({ userId }) {
  const [agendas, setAgendas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [agendaSeleccionada, setAgendaSeleccionada] = useState(null);
  const [nota, setNota] = useState('');
  // Estados para ver nota completa
  const [showVerNota, setShowVerNota] = useState(false);
  const [notaActual, setNotaActual] = useState('');

  // Cada vez que el componente monta, setea el timer para abrir el modal
  useEffect(() => {
    const timer = setTimeout(() => setShowModal(true), 2000);

    // Siempre consulta con el filtro por usuario_id
    axios
      .get(`${URL}agendas-ventas`, {
        params: { usuario_id: userId }
      })
      .then((res) => setAgendas(res.data))
      .catch(() => setAgendas([]));

    return () => clearTimeout(timer);
  }, [userId]); // << Se actualiza si cambia userId

  // Si no debe mostrarse, no renderiza nada del modal
  if (!showModal) return null;

  function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  // Abre el modal y selecciona la agenda
  const handleAbrirNota = (agenda) => {
    setAgendaSeleccionada(agenda);
    setNota('');
    setShowNotaModal(true);
  };

  // Envía el PUT al backend
  const handleEnviarNota = async () => {
    if (!agendaSeleccionada || !nota.trim()) return;

    try {
      await axios.put(`${URL}agendas-ventas/${agendaSeleccionada.id}`, {
        nota_envio: nota
      });

      // Actualiza la agenda a "enviada" en frontend
      setAgendas((prev) =>
        prev.map((a) =>
          a.id === agendaSeleccionada.id
            ? {
                ...a,
                enviada: 1,
                nota_envio: nota,
                fecha_envio: new Date().toISOString()
              }
            : a
        )
      );

      setShowNotaModal(false);
      setAgendaSeleccionada(null);
      setNota('');
    } catch (err) {
      alert('Error al marcar como enviada');
    }
  };

  const handleEliminarAgenda = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta agenda?')) return;
    try {
      await axios.delete(`http://localhost:8080/agendas-ventas/${id}`);
      setAgendas((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      alert('Error al eliminar agenda');
    }
  };

  // Función para truncar texto
  const getResumenNota = (nota, max = 80) => {
    if (!nota) return '';
    return nota.length > max ? nota.slice(0, max) + '...' : nota;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/70 via-black/50 to-[#fc4b08]/40 backdrop-blur-xl"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative bg-white dark:bg-zinc-900/95 rounded-3xl shadow-2xl max-w-2xl w-[97vw] md:w-full px-4 md:px-10 py-8 animate-fade-in border border-orange-100 dark:border-zinc-700">
        {/* Botón cerrar */}
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label="Cerrar"
        >
          <X size={34} />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-7">
          <div className="flex items-center gap-4">
            <Bell className="text-[#fc4b08] drop-shadow" size={38} />
            <h2 className="text-4xl font-extrabold text-[#fc4b08] tracking-wide font-bignoodle relative after:content-[''] after:block after:h-1 after:bg-orange-200 after:w-1/2 after:mx-auto after:rounded-full after:mt-1">
              Próximas Agendas y Recordatorios
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-300 text-center">
            Aquí verás tus próximas gestiones, contactos y recordatorios
            importantes.
          </p>
        </div>

        {/* Listado de agendas */}
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-orange-200">
          {agendas.length === 0 ? (
            <div className="text-gray-400 text-xl text-center py-10 font-medium">
              No hay agendas programadas.
            </div>
          ) : (
            agendas.map((a) => (
              <div
                key={a.id}
                className={`
              flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow
              ${
                a.tipo === 'seguimiento'
                  ? 'bg-orange-50/80 border-l-8 border-[#fc4b08]'
                  : 'bg-green-50/80 border-l-8 border-green-400'
              }
            `}
                style={{
                  backdropFilter: 'blur(2px)',
                  marginBottom: '8px'
                }}
              >
                {/* Fecha */}
                <div className="flex items-center gap-3 min-w-[130px]">
                  <Calendar className="text-gray-400" size={28} />
                  <span className="font-extrabold text-lg tracking-wide text-gray-900 dark:text-white">
                    {a.fecha_agenda ? formatearFecha(a.fecha_agenda) : ''}
                  </span>
                </div>
                {/* Info prospecto y detalle */}
                <div className="flex-1 flex flex-col md:flex-row md:items-center md:gap-6">
                  <div>
                    <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                      {a.prospecto_nombre}
                    </span>
                    <span className="block text-gray-500 text-sm mt-1">
                      Sede: <span className="font-bold">{a.sede}</span>
                      &nbsp;|&nbsp; Colaborador:{' '}
                      <span className="text-orange-700 dark:text-orange-400 font-bold">
                        {a.asesor_nombre}
                      </span>
                    </span>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span
                      className={`
                    inline-block rounded-full px-3 py-1 text-sm font-bold shadow-sm mr-2
                    ${
                      a.tipo === 'seguimiento'
                        ? 'bg-orange-200/80 text-orange-900'
                        : 'bg-green-200/80 text-green-900'
                    }
                  `}
                    >
                      {a.tipo === 'seguimiento'
                        ? '2do contacto'
                        : 'Clase de prueba'}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 text-base">
                      {a.descripcion}
                    </span>
                  </div>
                  {a.motivo_no_envio && (
                    <span className="text-xs text-red-600 font-medium ml-2 mt-2 md:mt-0">
                      Motivo: {a.motivo_no_envio}
                    </span>
                  )}
                </div>
                {/* Estado agenda */}
                <div className="text-sm text-gray-500 font-semibold mt-3 md:mt-0 md:ml-auto min-w-[135px]">
                  {a.enviada ? (
                    <div className="flex flex-col items-start gap-2 w-full">
                      <div className="flex items-center gap-2">
                        <span className="bg-green-100 text-green-700 rounded px-3 py-1">
                          Enviada
                        </span>
                        <button
                          className="ml-2 text-red-500 hover:text-red-700 p-1 rounded-full transition"
                          onClick={() => handleEliminarAgenda(a.id)}
                          title="Eliminar agenda"
                        >
                          <X size={22} />
                        </button>
                      </div>
                      {a.nota_envio && (
                        <div className="mt-2 bg-green-50 border-l-4 border-green-400 px-4 py-2 rounded-xl text-green-800 text-sm font-medium shadow-sm w-full flex flex-wrap items-center gap-1">
                          <span className="font-bold mr-2">📝 Nota:</span>
                          <span className="truncate max-w-[130px] md:max-w-[250px] inline-block align-middle">
                            {getResumenNota(a.nota_envio, 10)}
                          </span>
                          {a.nota_envio.length > 10 && (
                            <button
                              className="ml-2 text-blue-600 hover:underline text-xs font-bold"
                              onClick={() => {
                                setNotaActual(a.nota_envio);
                                setShowVerNota(true);
                              }}
                            >
                              Ver más
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span
                      className="bg-yellow-200/70 text-yellow-800 rounded px-3 py-1 cursor-pointer hover:bg-yellow-300 transition"
                      onClick={() => handleAbrirNota(a)}
                      title="Marcar como enviada y agregar nota"
                    >
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Botón cerrar extra abajo para mobile */}
        <button
          className="mt-10 w-full py-3 rounded-2xl bg-[#fc4b08] hover:bg-orange-600 text-white text-xl font-bold transition shadow-md block md:hidden"
          onClick={() => setShowModal(false)}
        >
          Cerrar
        </button>
      </div>

      {/* Modales secundarios van aquí */}
      {showNotaModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-lg relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              onClick={() => setShowNotaModal(false)}
            >
              <X size={28} />
            </button>
            <h3 className=" font-bold mb-6 text-[#fc4b08] font-bignoodle text-center text-4xl">
              Agregar nota y marcar como enviada
            </h3>
            <textarea
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-[#fc4b08] focus:outline-none mb-4"
              rows={4}
              placeholder="Dejá tu anotación o mensaje de seguimiento..."
              autoFocus
            />
            <button
              onClick={handleEnviarNota}
              disabled={!nota.trim()}
              className="w-full bg-[#fc4b08] hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-lg shadow transition disabled:opacity-50"
            >
              Guardar y marcar como enviada
            </button>
          </div>
        </div>
      )}
      {showVerNota && (
        <div className="fixed inset-0 z-[10001] bg-black/50 flex items-center justify-center">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-2xl w-full max-w-md relative max-h-[80vh] overflow-y-auto animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              onClick={() => setShowVerNota(false)}
            >
              <X size={28} />
            </button>
            <h3 className="text-2xl font-bold mb-4 text-green-600 flex items-center gap-2">
              <Eye /> Nota completa
            </h3>
            <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap text-base max-h-[60vh] overflow-y-auto">
              {notaActual}
            </div>
          </div>
        </div>
      )}

      {/* Animación y scrollbars */}
      <style>{`
    @keyframes fade-in {
      0% { opacity: 0; transform: translateY(32px);}
      100% { opacity: 1; transform: translateY(0);}
    }
    .animate-fade-in {
      animation: fade-in 0.5s cubic-bezier(.5,1.4,.7,1) both;
    }
    ::-webkit-scrollbar {
      height: 8px;
      width: 8px;
      background: transparent;
    }
    .scrollbar-thumb-orange-200::-webkit-scrollbar-thumb {
      background: #fde4cf;
      border-radius: 8px;
    }
    .truncate {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `}</style>
    </div>
  );
}
