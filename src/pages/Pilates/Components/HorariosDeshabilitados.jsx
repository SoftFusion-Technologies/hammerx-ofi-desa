import React from "react";
import {
  FaEye,
  FaRegClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

const HorariosDeshabilitados = ({ states, functions }) => {
  // Validación de seguridad para no mostrar nada si no tiene permisos
  if (states.rol !== "GESTION") {
    return null;
  }

  // CAMBIO: Usamos 'horariosDeshabilitados' en lugar de 'hiddenHours'
  const hayHorariosDeshabilitados =
    states.horariosDeshabilitados && states.horariosDeshabilitados.length > 0;
  const detalles = states.detalleHorariosDeshabilitados || [];

  const construirTooltip = (hour) => {
    const detalle = detalles.find((item) => item.hora_label === hour);
    if (!detalle) return "Restaurar turno";

    const fecha = detalle.creado_en
      ? new Date(detalle.creado_en).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Fecha no disponible";

    const autor = detalle.usuario?.name || "Usuario desconocido";
    return `Ocultado por ${autor} el ${fecha}`;
  };

  return (
    <div className="w-full max-w-auto mx-auto mb-8 animate-fade-in-down">
      {/* Contenedor Principal Estilo Tarjeta */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* --- HEADER DE LA SECCIÓN --- */}
        <div className="bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90 backdrop-blur-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-xl shadow-lg transform rotate-3">
              <FaRegClock className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Horarios Deshabilitados
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Administrá los turnos que no están visibles en la grilla
                principal.
              </p>
            </div>
          </div>

          {/* Contador Estadístico */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <div className="text-right">
              <span className="block text-3xl font-black text-orange-400 leading-none">
                {/* CAMBIO: length de horariosDeshabilitados */}
                {states.horariosDeshabilitados.length}
              </span>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                Turnos
              </span>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-left">
              <span className="block text-sm font-bold text-white">Estado</span>
              <span
                className={`text-xs font-semibold ${
                  hayHorariosDeshabilitados
                    ? "text-orange-300"
                    : "text-green-400"
                }`}
              >
                {hayHorariosDeshabilitados
                  ? "Hay deshabilitados"
                  : "Todo visible"}
              </span>
            </div>
          </div>
        </div>

        {/* --- CUERPO --- */}
        <div className="p-6 sm:p-8 bg-slate-50 min-h-[300px]">
          {!hayHorariosDeshabilitados ? (
            /* ESTADO VACÍO (TODO VISIBLE) */
            <div className="h-full flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-white p-6 rounded-full shadow-sm mb-6 border border-gray-100">
                <FaCheckCircle className="text-green-500 text-6xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Grilla completa!
              </h3>
              <p className="text-gray-500 max-w-md mx-auto text-lg">
                No tenés horarios deshabilitados en esta sede. Todos los turnos
                configurados están disponibles para el público.
              </p>
            </div>
          ) : (
            /* LISTA DE HORARIOS DESHABILITADOS */
            <div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <FaExclamationCircle className="text-orange-500" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Seleccioná un turno para restaurarlo
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
                {/* CAMBIO: Mapeo de horariosDeshabilitados */}
                {states.horariosDeshabilitados.map((hour) => {
                  const detalle = detalles.find(
                    (item) => item.hora_label === hour
                  );
                  return (
                    <button
                      key={`hidden-${hour}`}
                      type="button"
                      title={construirTooltip(hour)}
                      // CAMBIO: Llamada a la función en español 'manejarMostrarHorario'
                      onClick={() => functions.manejarHabilitarHorario(hour)}
                      className="
                      group relative 
                      bg-white hover:bg-orange-50 
                      border-2 border-gray-200 hover:border-orange-400 
                      rounded-2xl p-5 
                      flex flex-col items-center justify-center gap-3 
                      transition-all duration-300 ease-in-out 
                      shadow-sm hover:shadow-xl hover:-translate-y-1
                    "
                    >
                      {/* Hora Grande */}
                      <span className="text-3xl font-black text-gray-700 group-hover:text-orange-600 transition-colors">
                        {hour}
                      </span>

                      {detalle?.usuario?.name && (
                        <span className="text-[11px] font-semibold text-gray-400 -mt-1">
                          Ocultó: {detalle.usuario.name}
                        </span>
                      )}

                      {detalle?.creado_en && (
                        <span className="text-[10px] text-gray-400">
                          {new Date(detalle.creado_en).toLocaleDateString(
                            "es-AR"
                          )}
                        </span>
                      )}

                      {/* Botón Acción */}
                      <div className="flex items-center gap-2 bg-slate-100 group-hover:bg-orange-500 px-3 py-1.5 rounded-full transition-colors duration-300">
                        <FaEye className="text-slate-500 group-hover:text-white text-xs" />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-white">
                          MOSTRAR
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex items-start gap-3">
                <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Tip:</strong> Al restaurar un horario, este volverá a
                  aparecer inmediatamente en la grilla de gestión y estará
                  disponible para inscribir alumnos nuevamente.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorariosDeshabilitados;
