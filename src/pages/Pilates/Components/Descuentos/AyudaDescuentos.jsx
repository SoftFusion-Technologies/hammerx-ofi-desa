/* Autor: Sergio Manrique
Fecha de creación: 23-12-2025
*/
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaInfoCircle,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";

const AyudaDescuentos = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo oscuro del modal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          ></motion.div>

          {/* Contenedor principal del modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden font-messina z-10"
          >
            {/* Encabezado del modal */}
            <div className="bg-orange-600 p-4 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold font-bignoodle tracking-wide flex items-center gap-2">
                <FaInfoCircle /> ¿CÓMO FUNCIONA EL SISTEMA DE CUPOS?
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-orange-700 rounded transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Contenido principal con scroll */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                
                {/* Introducción */}
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                  <h3 className="font-bold text-orange-800 flex items-center gap-2 mb-2">
                    <FaLightbulb /> Objetivo
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Esta herramienta permite crear ofertas especiales limitadas para llenar horarios específicos. 
                    Los alumnos verán estos descuentos al inscribirse, pero solo si hay cupos disponibles en esa regla.
                  </p>
                </div>

                {/* Estados posibles de una regla */}
                <div>
                  <h3 className="font-bold text-gray-700 mb-3 border-b pb-1">
                    ESTADOS DE UNA REGLA
                  </h3>
                  <div className="grid gap-3">
                    
                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="mt-1 text-green-500 bg-green-50 p-2 rounded-full">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase">
                          Vigente
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          La regla está activa hoy. Los alumnos pueden verla y usarla si la fecha actual está dentro del rango de vigencia.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="mt-1 text-blue-500 bg-blue-50 p-2 rounded-full">
                        <FaClock />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase">
                          Programado
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          La fecha de inicio es futura. La regla está guardada pero aún no es visible para los alumnos hasta que llegue la fecha de inicio.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                      <div className="mt-1 text-red-500 bg-red-50 p-2 rounded-full">
                        <FaExclamationTriangle />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase">
                          Vencido
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          La fecha de fin ya pasó. Esta regla ya no tiene efecto, pero se guarda en el historial hasta que decidas eliminarla.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Nota sobre permisos */}
                <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded border border-dashed border-gray-300">
                  <strong>Nota sobre permisos:</strong> Solo los usuarios con permisos de edición en la sede actual pueden crear, modificar o eliminar reglas. Si los botones aparecen en gris, es porque solo tienes permiso de lectura.
                </div>

              </div>
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={onClose}
                className="bg-gray-800 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors shadow-lg"
              >
                ENTENDIDO
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AyudaDescuentos;