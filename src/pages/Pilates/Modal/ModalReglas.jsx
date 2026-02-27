import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { ShieldAlert } from 'lucide-react';

const ModalReglas = ({ estaAbierto, alCerrar, isOpen, onClose }) => {
  const abierto = typeof estaAbierto === 'boolean' ? estaAbierto : isOpen;
  const cerrar = alCerrar || onClose;

  const variantesFondo = {
    oculto: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const variantesModal = {
    oculto: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 28 },
    },
    salida: { opacity: 0, scale: 0.95, y: 20 },
  };

  if (!abierto) return null;

  const reglas = [
    'No se congelan planes, salvo 1 semana durante los meses de enero, febrero y julio por vacaciones.',
    'No se dan diferentes horarios o turnos: siempre se respeta el plan y el mismo horario.',
    'No se recuperan clases faltadas.',
    'No se recuperan feriados.',
    'El plan da inicio el día de su contratación y reserva. En caso contrario, puede dejar pagado y no comenzar, pero debe reservar el turno una vez que desee comenzar (sujeto a disponibilidad).',
  ];

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm"
          initial="oculto"
          animate="visible"
          exit="oculto"
          variants={variantesFondo}
          onClick={cerrar}
        >
          <motion.div
            className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-orange-100"
            variants={variantesModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-orange-500 via-orange-500 to-orange-600 text-white px-5 sm:px-7 py-5 flex items-center justify-between overflow-hidden">
              <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
              <div className="absolute -left-8 -bottom-10 w-28 h-28 rounded-full bg-white/10" />

              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-bignoodle tracking-wide leading-none">
                    Reglas de Pilates
                  </h2>
                  <p className="text-orange-100 text-xs sm:text-sm mt-1">
                    Condiciones importantes para alumnos y reservas
                  </p>
                </div>
              </div>
              <button
                onClick={cerrar}
                className="relative z-10 p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Cerrar"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="p-5 sm:p-6 md:p-7 overflow-y-auto bg-gradient-to-b from-orange-50/40 to-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Lectura obligatoria
              </div>

              <div className="space-y-3">
                {reglas.map((regla, index) => (
                  <div
                    key={index}
                    className="bg-white border border-orange-100 hover:border-orange-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </div>
                      <p className="text-sm sm:text-[15px] text-gray-800 leading-relaxed">
                        {regla}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 sm:px-7 py-4 bg-white border-t border-gray-100 flex justify-end">
              <button
                onClick={cerrar}
                className="bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-900 hover:to-gray-800 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Entendido
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalReglas;
