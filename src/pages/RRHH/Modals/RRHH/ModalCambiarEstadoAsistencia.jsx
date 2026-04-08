/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Modal administrativo para modificar el estado cualitativo de una marcación (Normal o Justificado). Permite a los responsables de RRHH actualizar el cumplimiento de un empleado en un registro específico, almacenando la referencia del administrador que realiza la validación y disparando la actualización del historial.
*/
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useModificarDatosPatch from "../../hooks/modificarDatosPatch";
import { useAuth } from "../../../../AuthContext";
import { FaTimes } from "react-icons/fa";

const ESTADOS_ASISTENCIA = [
  "normal",
  "justificado",
];

const ModalCambiarEstadoAsistencia = ({ horarios, cerrarModal, fetch }) => {
  const { userId } = useAuth();
  const [abierto, setAbierto] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(horarios?.estado || "pendiente");

  const { modificarPatch: modificarMarcacion } = useModificarDatosPatch();

  useEffect(() => {
    setAbierto(true);
  }, [horarios]);

  const manejarGuardar = async () => {
    setMensaje("");

    const payload = {
      id: horarios?.id,
      estado: estadoSeleccionado,
      aprobado_por: userId, 
    };

    try {
      setGuardando(true);
      await modificarMarcacion(`/rrhh/marcaciones/${horarios.id}`, payload);
      await fetch();
      cerrarModal();
    } catch (error) {
      setMensaje("No se pudo actualizar el estado de asistencia.");
    } finally {
      setGuardando(false);
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
            aria-label="Cerrar modal"
          >
            <FaTimes />
          </button>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4">
            <h2 className="font-bignoodle text-2xl tracking-wide">
              Estado de la marcación
            </h2>
            <p className="text-orange-100 text-xs">
              Modificar el cumplimiento del empleado
            </p>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-700">Tipo de estado</span>
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
              >
                {ESTADOS_ASISTENCIA.map((opcion) => (
                  <option key={opcion} value={opcion}>
                    {opcion.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            {mensaje && (
              <div className="p-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-lg">
                {mensaje}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2">
            <button
              onClick={manejarGuardar}
              disabled={guardando}
              className="px-4 py-2 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {guardando ? "Guardando..." : "Actualizar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalCambiarEstadoAsistencia;