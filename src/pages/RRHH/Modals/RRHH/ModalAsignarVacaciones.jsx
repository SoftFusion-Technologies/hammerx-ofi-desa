import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaPlaneDeparture,
  FaCalendarAlt,
  FaTrashAlt,
  FaPlus,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { useAuth } from "../../../../AuthContext";
import useAgregarDatos from "../../hooks/agregarDatos";
import useEliminarDatos from "../../hooks/eliminarDatos";

const ModalAsignarVacaciones = ({
  cerrarModal,
  fetch,
  empleado,
}) => {
  const { userId } = useAuth();
  const { agregar, cargando: cargandoAgregar } = useAgregarDatos();
  const { eliminar, cargando: cargandoEliminar } = useEliminarDatos();

  const [rangos, setRangos] = useState([
    { fecha_desde: "", fecha_hasta: "" },
  ]);

  const procesando = cargandoAgregar || cargandoEliminar;

  // ===============================
  // AGREGAR NUEVO RANGO
  // ===============================
  const agregarRango = () => {
    setRangos([...rangos, { fecha_desde: "", fecha_hasta: "" }]);
  };

  // ===============================
  // CAMBIAR VALORES
  // ===============================
  const actualizarRango = (index, campo, valor) => {
    const nuevos = [...rangos];
    nuevos[index][campo] = valor;
    setRangos(nuevos);
  };

  // ===============================
  // ELIMINAR RANGO LOCAL
  // ===============================
  const eliminarRangoLocal = (index) => {
    const nuevos = rangos.filter((_, i) => i !== index);
    setRangos(nuevos);
  };

  // ===============================
  // GUARDAR (CREA VARIOS)
  // ===============================
  const manejarGuardar = async () => {
    try {
      for (const rango of rangos) {
        if (!rango.fecha_desde || !rango.fecha_hasta) continue;

        await agregar("/rrhh/vacaciones-programadas", {
          usuario_emp_id: empleado.usuario_id,
          usuario_adm_id: userId,
          sede_id: empleado.sede_id,
          fecha_desde: rango.fecha_desde,
          fecha_hasta: rango.fecha_hasta,
        });
      }

      await Swal.fire({
        icon: "success",
        title: "Vacaciones asignadas",
        timer: 1800,
        showConfirmButton: false,
      });

      if (fetch) await fetch();
      cerrarModal();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar",
      });
    }
  };

  // ===============================
  // ELIMINAR EXISTENTE (BACKEND)
  // ===============================
  const eliminarExistente = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar vacaciones?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await eliminar(`/rrhh/vacaciones-programadas/${id}`);

      await Swal.fire({
        icon: "success",
        title: "Eliminado",
        timer: 1200,
        showConfirmButton: false,
      });

      if (fetch) await fetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
      });
    }
  };

  // ===============================
  // CALCULAR DÍAS
  // ===============================
  const calcularDias = (desde, hasta) =>
    dayjs(hasta).diff(dayjs(desde), "day") + 1;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={cerrarModal}
      >
        <motion.div
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="px-6 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaPlaneDeparture />
              Gestionar Vacaciones
            </h2>
            <p className="text-sm opacity-80 flex items-center gap-2">
              <FaUser /> {empleado.usuario?.name}
            </p>
          </div>

          {/* CONTENIDO */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

            {/* VACACIONES EXISTENTES */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">
                VACACIONES ACTUALES
              </h3>

              {empleado.vacaciones?.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No tiene vacaciones cargadas
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {empleado.vacaciones.map((v) => (
                    <div
                      key={v.id}
                      className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-xl"
                    >
                      <span className="text-xs font-bold">
                        {dayjs(v.fecha_desde).format("DD/MM")} -{" "}
                        {dayjs(v.fecha_hasta).format("DD/MM")} (
                        {calcularDias(v.fecha_desde, v.fecha_hasta)} días)
                      </span>

                      <button
                        onClick={() => eliminarExistente(v.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* NUEVOS RANGOS */}
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-2">
                AGREGAR VACACIONES
              </h3>

              <div className="flex flex-col gap-3">
                {rangos.map((r, i) => (
                  <div
                    key={i}
                    className="flex gap-2 items-center bg-orange-50 p-3 rounded-xl"
                  >
                    <input
                      type="date"
                      value={r.fecha_desde}
                      onChange={(e) =>
                        actualizarRango(i, "fecha_desde", e.target.value)
                      }
                      className="text-xs border rounded px-2 py-1"
                    />

                    <span className="text-xs">→</span>

                    <input
                      type="date"
                      value={r.fecha_hasta}
                      onChange={(e) =>
                        actualizarRango(i, "fecha_hasta", e.target.value)
                      }
                      className="text-xs border rounded px-2 py-1"
                    />

                    <button
                      onClick={() => eliminarRangoLocal(i)}
                      className="text-red-400"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={agregarRango}
                className="mt-3 text-xs flex items-center gap-2 text-orange-600 font-bold"
              >
                <FaPlus /> Agregar rango
              </button>
            </div>
          </div>

          {/* FOOTER */}
          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
            <button onClick={cerrarModal} className="text-xs text-gray-400">
              Cancelar
            </button>

            <button
              onClick={manejarGuardar}
              disabled={procesando}
              className="px-6 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600"
            >
              {procesando ? "Guardando..." : "Guardar Vacaciones"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAsignarVacaciones;