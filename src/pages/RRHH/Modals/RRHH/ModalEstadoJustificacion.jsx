/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Modal administrativo para gestionar la justificación de una marcación. 
Utiliza los estados 'cargando' y 'error' directamente del hook personalizado.
*/
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useModificarDatosPatch from "../../hooks/modificarDatosPatch";
import { useAuth } from "../../../../AuthContext";
import { FaTimes, FaBalanceScale } from "react-icons/fa";
import { TbUserStar } from "react-icons/tb";


const OPCIONES_JUSTIFICACION = ["injustificado", "justificado"];

const ModalEstadoJustificacion = ({ horarios, cerrarModal, fetch }) => {
  const { userId } = useAuth();
  const [abierto, setAbierto] = useState(true);

  // Traemos los estados directamente del hook
  const {
    modificarPatch: modificarMarcacion,
    cargando,
    error,
  } = useModificarDatosPatch();

  // Estado local solo para el valor del select
  const [justificacionSeleccionada, setJustificacionSeleccionada] = useState(
    horarios?.estado_justificacion || "injustificado",
  );

  useEffect(() => {
    if (horarios) {
      setJustificacionSeleccionada(
        horarios.estado_justificacion || "injustificado",
      );
      setAbierto(true);
    }
  }, [horarios]);

  const manejarGuardar = async () => {
    const payload = {
      id: horarios?.id,
      estado_justificacion: justificacionSeleccionada,
      aprobado_por: userId,
    };

    try {
      await modificarMarcacion(`/rrhh/marcaciones/${horarios.id}`, payload);

      await fetch();
      cerrarModal();
    } catch (err) {
      console.error("Error en la actualización:", err);
    }
  };

  if (!horarios || !abierto) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={cerrarModal}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
          >
            <FaTimes />
          </button>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <div className="flex items-center gap-2">
              <TbUserStar className="text-xl" />
              <h2 className="font-bignoodle text-2xl tracking-wide uppercase">
                Justificación
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">
                Estado de justificación
              </span>
              <select
                value={justificacionSeleccionada}
                onChange={(e) => setJustificacionSeleccionada(e.target.value)}
                disabled={cargando}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none bg-white transition-all disabled:bg-gray-100"
              >
                {OPCIONES_JUSTIFICACION.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            {/* Mostramos el error que viene directamente del Hook */}
            {error && (
              <div className="p-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg animate-pulse">
                {error}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
            <button
              type="button"
              onClick={cerrarModal}
              disabled={cargando}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={manejarGuardar}
              disabled={cargando}
              className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-md min-w-[100px]"
            >
              {cargando ? "Cargando..." : "Actualizar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalEstadoJustificacion;
