import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCalendarPlus,
  FaTimes,
  FaCalendarDay,
  FaGlobeAmericas,
  FaUserEdit,
  FaTrashAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useAuth } from "../../../../AuthContext";
import useAgregarDatos from "../../hooks/agregarDatos";
import useEliminarDatos from "../../hooks/eliminarDatos"; // Asegúrate de tener este hook
import { convertirFechaArUs } from "../../Utils/convertirFechaArUs";

const ModalAgregarFeriado = ({ cerrarModal, fetch, datosIniciales }) => {
  const { userId } = useAuth();
  const { cargando: cargandoAgregar, agregar } = useAgregarDatos();
  const { cargando: cargandoEliminar, eliminar } = useEliminarDatos();

  const feriadoAPI = datosIniciales?.feriadoAPI;
  const feriadoExistente = datosIniciales?.feriadoExistente;
  const fechaSeleccionada = datosIniciales?.fecha || "";

  const manejarGuardar = async () => {
    if (!fechaSeleccionada) return;

    const payload = {
      fecha: fechaSeleccionada,
      usuario_id: userId,
    };

    try {
      await agregar("/rrhh/feriados-programados", payload);
      await Swal.fire({
        icon: "success",
        title: "¡Feriado Global!",
        text: "El feriado se ha aplicado a todas las sedes.",
        confirmButtonColor: "#f97316",
        timer: 2000,
      });
      if (fetch) await fetch();
      cerrarModal();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo programar.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const manejarEliminar = async () => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar feriado?",
      text: "Esta acción quitará el feriado de todas las sedes.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        await eliminar(`/rrhh/feriados-programados/${feriadoExistente.id}`);
        await Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El feriado ha sido quitado.",
          timer: 1500,
        });
        if (fetch) await fetch();
        cerrarModal();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar.",
        });
      }
    }
  };

  const procesando = cargandoAgregar || cargandoEliminar;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={cerrarModal}
      >
        <motion.div
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden font-messina"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div
            className={`px-6 py-5 text-white bg-gradient-to-r ${feriadoExistente ? "from-red-500 to-red-600" : "from-orange-500 to-orange-600"}`}
          >
            <h2 className="font-bignoodle text-3xl flex items-center gap-2">
              {feriadoExistente ? <FaTrashAlt /> : <FaCalendarPlus />}
              {feriadoExistente ? "Gestionar Feriado" : "Programar Feriado"}
            </h2>
          </div>

          <div className="p-6 space-y-4">
            {/* FECHA */}
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
              <span className="text-[11px] font-black text-orange-600 uppercase flex items-center gap-2 mb-2">
                <FaCalendarDay /> Fecha del Feriado
              </span>
              <p className="text-xl font-bold text-gray-700">
                {convertirFechaArUs(fechaSeleccionada)}
              </p>
            </div>

            {/* QUIEN LO PROGRAMÓ */}
            {feriadoExistente && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                <span className="text-[11px] font-black text-gray-400 uppercase flex items-center gap-2 mb-1">
                  <FaUserEdit /> Programado por
                </span>
                <p className="text-sm font-bold text-gray-700">
                  {feriadoExistente.usuario?.name?.toUpperCase() || "SISTEMA"}
                </p>
              </div>
            )}

            {feriadoAPI && !feriadoExistente && (
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-sm font-bold text-blue-700">
                  Feriado nacional: {feriadoAPI.localName}
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="px-6 py-5 bg-gray-50 flex justify-end gap-3">
            <button onClick={cerrarModal} className="text-xs text-gray-400">
              Cerrar
            </button>

            {feriadoExistente ? (
              <button
                onClick={manejarEliminar}
                disabled={procesando}
                className="flex items-center gap-2 px-8 py-3 text-xs font-bold bg-red-500 text-white rounded-2xl hover:bg-red-600 disabled:opacity-50"
              >
                <FaTrashAlt />{" "}
                {procesando ? "Eliminando..." : "Eliminar Feriado"}
              </button>
            ) : (
              <button
                onClick={manejarGuardar}
                disabled={procesando}
                className="px-8 py-3 text-xs font-bold bg-orange-500 text-white rounded-2xl hover:bg-orange-600 disabled:opacity-50"
              >
                {procesando ? "Cargando..." : "Confirmar Feriado"}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAgregarFeriado;
