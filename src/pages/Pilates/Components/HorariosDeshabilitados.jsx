/*
  Componente: HorariosDeshabilitados
  Descripción: Muestra los horarios ocultos y permite cambiar su tipo de bloqueo o restaurarlos.
  Validación: No permite seleccionar tipos de bloqueo que ocultarían alumnos existentes.
*/
import {
  FaEye,
  FaRegClock,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";

const HorariosDeshabilitados = ({ states, functions }) => {
  // Validación de seguridad para no mostrar nada si no tiene permisos
  if (states.rol !== "GESTION") {
    return null;
  }

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

  // 1. CAMBIO AQUI: Función para verificar si hay alumnos en un grupo de días para una hora
  const verificarOcupacion = (hora, diasGrupo) => {
    // diasGrupo debe ser array ej: ['LUNES', 'MIÉRCOLES', 'VIERNES']
    // Nota: Usamos los nombres tal cual vienen en las llaves de tu objeto schedule (con acentos y mayúsculas)
    return diasGrupo.some(dia => {
        const key = `${dia}-${hora}`; // Ej: "LUNES-08:00"
        const celda = states.schedule?.[key];
        return celda && celda.alumnos && celda.alumnos.length > 0;
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-auto mx-auto mb-8"
    >
      {/* Contenedor Principal Estilo Tarjeta */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-messina">
        {/* --- HEADER DE LA SECCIÓN --- */}
        <div className="bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90 backdrop-blur-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-orange-500 rounded-xl shadow-lg transform rotate-3">
              <FaRegClock className="text-3xl text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold font-bignoodle tracking-tight">
                Horarios Deshabilitados
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Administrá los turnos que no están visibles en la grilla principal.
              </p>
            </div>
          </div>

          {/* Contador Estadístico */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <div className="text-right">
              <span className="block text-3xl font-black text-orange-400 leading-none">
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
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-full flex flex-col items-center justify-center py-12 text-center"
            >
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
            </motion.div>
          ) : (
            /* LISTA DE HORARIOS DESHABILITADOS */
            <div>
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
                <FaExclamationCircle className="text-orange-500" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Seleccioná un turno para restaurarlo o cambiá su configuración
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {states.horariosDeshabilitados.map((hour, index) => {
                  const detalle = detalles.find(
                    (item) => item.hora_label === hour
                  );
                  
                  // 2. CAMBIO AQUI: Analizamos la ocupación para este horario específico
                  const ocupadoLMV = verificarOcupacion(hour, ['LUNES', 'MIÉRCOLES', 'VIERNES']);
                  const ocupadoMJ = verificarOcupacion(hour, ['MARTES', 'JUEVES']);

                  // Definimos las opciones y si deben estar deshabilitadas
                  const opciones = [
                    { 
                        id: 'todos', 
                        label: 'TODOS', 
                        // Deshabilitado si hay alumnos en CUALQUIER día
                        disabled: ocupadoLMV || ocupadoMJ 
                    },
                    { 
                        id: 'lmv', 
                        label: 'L-M-V', 
                        // Deshabilitado si hay alumnos en L, M o V
                        disabled: ocupadoLMV 
                    },
                    { 
                        id: 'mj', 
                        label: 'M-J', 
                        // Deshabilitado si hay alumnos en M o J
                        disabled: ocupadoMJ 
                    }
                  ];

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={`hidden-${hour}`}
                      className="
                        group relative 
                        bg-white 
                        border-2 border-gray-200 hover:border-orange-300 
                        rounded-2xl p-5 
                        flex flex-col items-center justify-between gap-3 
                        transition-all duration-300 ease-in-out 
                        shadow-sm hover:shadow-lg
                      "
                    >
                      {/* Hora Grande */}
                      <div className="text-center">
                          <span className="text-3xl font-black text-gray-700 group-hover:text-orange-600 transition-colors">
                            {hour}
                          </span>
                          {detalle?.usuario?.name && (
                            <div className="text-[11px] font-semibold text-gray-400 mt-1">
                              Por: {detalle.usuario.name}
                            </div>
                          )}
                      </div>

                      {/* 3. CAMBIO AQUI: Renderizado limpio de los botones de selección */}
                      <div className="flex gap-2 justify-center w-full mt-2">
                        {opciones.map((opcion) => {
                            const esActivo = detalle?.tipo_bloqueo === opcion.id;
                            
                            return (
                                <button
                                    key={opcion.id}
                                    type="button"
                                    disabled={opcion.disabled && !esActivo} // Si está activo, no lo deshabilitamos (ya está seleccionado)
                                    onClick={() => {
                                        // Si ya es el activo, no hacemos nada. Si no, llamamos a la función
                                        if (!esActivo) {
                                            functions.manejarHabilitarHorario(hour, opcion.label);
                                        }
                                    }}
                                    title={opcion.disabled ? "No disponible: Hay alumnos inscriptos en este grupo" : `Cambiar bloqueo a ${opcion.label}`}
                                    className={`
                                        px-2 py-1 rounded-full text-[10px] font-bold shadow-sm border transition-all duration-200 
                                        ${esActivo 
                                            ? 'bg-orange-500 text-white border-orange-400 cursor-default scale-105' 
                                            : opcion.disabled
                                                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                : 'bg-white text-gray-500 border-gray-300 hover:border-orange-400 hover:text-orange-500 cursor-pointer'
                                        }
                                    `}
                                >
                                    {opcion.label}
                                </button>
                            );
                        })}
                      </div>

                      {/* Botón Restaurar (MOSTRAR) */}
                      <button 
                        className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-green-500 text-slate-600 hover:text-white px-4 py-2 rounded-xl transition-all duration-300 w-full mt-2 shadow-sm group-hover:shadow-md" 
                        onClick={() => functions.manejarHabilitarHorario(hour)} // Llamada sin segundo argumento = Restaurar/Borrar
                        title="Habilitar este horario completamente"
                      >
                        <FaEye className="text-xs" />
                        <span className="text-xs font-bold tracking-wider">
                          RESTAURAR
                        </span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 bg-orange-50 text-orange-800 text-sm p-4 rounded-lg flex items-start gap-3 border border-orange-100">
                <FaExclamationCircle className="mt-0.5 flex-shrink-0" />
                <div>
                    <p className="font-bold mb-1">¿Cómo funciona?</p>
                    <ul className="list-disc pl-4 space-y-1 text-orange-700/80">
                        <li>Las opciones grisadas tienen alumnos inscriptos y no pueden bloquearse.</li>
                        <li>Al seleccionar <strong>RESTAURAR</strong>, el horario volverá a aparecer en la grilla principal.</li>
                        <li>Podés cambiar entre <strong>L-M-V</strong> y <strong>M-J</strong> directamente si no hay alumnos.</li>
                    </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HorariosDeshabilitados;