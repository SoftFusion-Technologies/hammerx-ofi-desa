import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, Bell, X } from 'lucide-react';

const URL = 'http://localhost:8080/';

export default function AgendasVentas({ userId, open, onClose }) {
  const [notis, setNotis] = useState([]);
  // Cargá los datos cuando se abre el modal y hay userId
  useEffect(() => {
    if (open && userId) {
      axios
        .get(`${URL}notifications/clases-prueba/${userId}`)
        .then((res) => setNotis(res.data))
        .catch(() => setNotis([]));
    }
  }, [userId, open]);

  if (!open) return null; // Mostralo solo si el prop open es true

  function formatearFecha(fechaISO) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}-${mes}-${anio}`;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/70 via-black/50 to-[#fc4b08]/40 backdrop-blur-xl"
      aria-modal="true"
      role="dialog"
    >
      <div className="relative bg-white dark:bg-zinc-900/95 rounded-3xl shadow-2xl max-w-2xl w-[97vw] md:w-full px-4 md:px-10 py-8 animate-fade-in border border-orange-100 dark:border-zinc-700">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
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
              Clases de prueba agendadas HOY
            </h2>
          </div>
          <p className="text-lg text-gray-500 dark:text-gray-300 text-center">
            Estos prospectos tienen una clase de prueba pendiente hoy.
          </p>
          <div className="mt-2 mb-4 text-base text-orange-800 dark:text-orange-300 bg-orange-50 border-l-4 border-orange-300 rounded px-4 py-2 font-semibold shadow-sm text-center max-w-md mx-auto">
            <span className="font-bold">Recordá notificar:</span>
            <ul className="list-disc list-inside mt-1 text-[1rem] font-normal text-left inline-block mx-auto">
              <li>Al instructor encargado de turno</li>
              <li>Al recepcionista encargado de turno</li>
              <li>Recordatorio al cliente</li>
            </ul>
          </div>
        </div>

        {/* Listado de notificaciones */}
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-orange-200">
          {notis.length === 0 ? (
            <div className="text-gray-400 text-xl text-center py-10 font-medium">
              No hay clases de prueba agendadas para hoy.
            </div>
          ) : (
            notis.map((n) => (
              <div
                key={n.prospecto_id}
                className="flex flex-col md:flex-row md:items-center gap-4 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow bg-yellow-50/90 border-l-8 border-yellow-400"
                style={{ backdropFilter: 'blur(2px)', marginBottom: '8px' }}
              >
                {/* Fecha */}
                <div className="flex items-center gap-3 min-w-[130px]">
                  <Calendar className="text-yellow-500" size={28} />
                  <span className="font-extrabold text-lg tracking-wide text-gray-900 dark:text-white">
                    {formatearFecha(
                      n.clase_prueba_1_fecha ||
                        n.clase_prueba_2_fecha ||
                        n.clase_prueba_3_fecha
                    )}
                  </span>
                </div>
                {/* Info prospecto */}
                <div className="flex-1">
                  <div>
                    <span className="font-semibold text-lg text-yellow-900 dark:text-yellow-100">
                      {n.nombre}
                    </span>
                  </div>
                  <div className="text-gray-600 dark:text-gray-300 text-sm">
                    <span>
                      Colaborador:{' '}
                      <span className="text-orange-700 dark:text-orange-400 font-bold">
                        {n.asesor_nombre}
                      </span>
                    </span>
                    <span className="block mt-1">
                      Contacto: <span className="font-bold">{n.contacto}</span>
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 mt-1">
                  <span className="inline-block rounded-full px-4 py-2 bg-yellow-200/80 text-yellow-900 font-bold">
                    Pendiente
                  </span>
                  <a
                    href={`https://wa.me/${n.contacto.replace(
                      /\D/g,
                      ''
                    )}?text=${encodeURIComponent(
                      `Hola, soy ${n.asesor_nombre} de HammerX y te quería recordar tu clase de prueba agendada para hoy.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex justify-center"
                  >
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg font-semibold shadow flex items-center gap-1 text-sm"
                      style={{
                        minWidth: 0,
                        fontSize: '0.96rem',
                        height: '32px'
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="inline-block"
                        style={{ marginRight: '2px' }}
                      >
                        <path d="M20.52 3.48a12.1 12.1 0 0 0-17.09 0c-4.01 4-4.17 10.44-.36 14.62l-1.06 3.84a1.003 1.003 0 0 0 1.27 1.27l3.84-1.06c4.18 3.81 10.62 3.65 14.62-.36 4.01-4.01 4.01-10.52 0-14.55zm-1.41 13.13c-3.34 3.33-8.77 3.48-12.28.35l-.2-.18-2.34.65.65-2.34-.18-.2c-3.13-3.5-2.98-8.94.35-12.28a9.09 9.09 0 0 1 12.82 12zm-6.43-8.51c-2.46 0-4.46 2-4.46 4.46s2 4.46 4.46 4.46 4.46-2 4.46-4.46-2-4.46-4.46-4.46zm0 7.46c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"></path>
                      </svg>
                      Contactar
                    </button>
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón cerrar extra abajo para mobile */}
        <button
          className="mt-10 w-full py-3 rounded-2xl bg-[#fc4b08] hover:bg-orange-600 text-white text-xl font-bold transition shadow-md block md:hidden"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
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
      `}</style>
    </div>
  );
}
