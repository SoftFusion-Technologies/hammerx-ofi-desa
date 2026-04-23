import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaPlaneDeparture,
  FaPencilAlt,
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
import useModificarDatosPut from "../../hooks/modificarDatosPut";

const ModalAsignarVacaciones = ({ cerrarModal, fetch, empleado }) => {
  const { userId } = useAuth();
  const { agregar, cargando: cargandoAgregar } = useAgregarDatos();
  const { eliminar, cargando: cargandoEliminar } = useEliminarDatos();
  const { modificarPut, cargando: cargandoModificar } = useModificarDatosPut();

  const [rangos, setRangos] = useState([{ fecha_desde: "", fecha_hasta: "" }]);
  const [vacacionesActuales, setVacacionesActuales] = useState(
    empleado?.vacaciones || [],
  );
  const [edicionVacaciones, setEdicionVacaciones] = useState({});
  const [guardandoEdicionId, setGuardandoEdicionId] = useState(null);

  useEffect(() => {
    setVacacionesActuales(empleado?.vacaciones || []);
    setEdicionVacaciones({});
    setRangos([{ fecha_desde: "", fecha_hasta: "" }]);
  }, [empleado]);

  const procesando = cargandoAgregar || cargandoEliminar || cargandoModificar;

  // Devuelve el día siguiente para usarlo como mínimo en el campo de fin.
  const obtenerFechaSiguiente = (fecha) => {
    if (!fecha) return "";
    return dayjs(fecha).add(1, "day").format("YYYY-MM-DD");
  };

  // Valida que el rango tenga inicio, fin y que fin sea posterior al inicio.
  const esRangoValido = (fechaDesde, fechaHasta) => {
    if (!fechaDesde || !fechaHasta) return false;
    return dayjs(fechaHasta).isAfter(dayjs(fechaDesde), "day");
  };

  const rangosCompletosValidos = rangos.filter(
    (rango) =>
      rango.fecha_desde &&
      rango.fecha_hasta &&
      esRangoValido(rango.fecha_desde, rango.fecha_hasta),
  );

  const puedeGuardarVacaciones = rangosCompletosValidos.length > 0;

  // Agrega un nuevo bloque de rango vacío para cargar más vacaciones.
  const agregarRango = () => {
    setRangos([...rangos, { fecha_desde: "", fecha_hasta: "" }]);
  };

  // Actualiza un campo del rango nuevo y limpia el fin si deja de ser válido.
  const actualizarRango = (index, campo, valor) => {
    const nuevos = [...rangos];
    nuevos[index][campo] = valor;

    if (
      campo === "fecha_desde" &&
      nuevos[index].fecha_hasta &&
      !esRangoValido(nuevos[index].fecha_desde, nuevos[index].fecha_hasta)
    ) {
      nuevos[index].fecha_hasta = "";
    }

    setRangos(nuevos);
  };

  // Elimina un rango nuevo del formulario antes de guardarlo.
  const eliminarRangoLocal = (index) => {
    const nuevos = rangos.filter((_, i) => i !== index);
    setRangos(nuevos);
  };

  // Guarda los rangos nuevos en backend mediante POST.
  const manejarGuardar = async () => {
    try {
      const rangosCompletos = rangos.filter(
        (rango) => rango.fecha_desde && rango.fecha_hasta,
      );

      if (rangosCompletos.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Fechas incompletas",
          text: "Ingresa al menos un rango con fecha inicio y fin.",
        });
        return;
      }

      const existeRangoInvalido = rangosCompletos.some(
        (rango) => !esRangoValido(rango.fecha_desde, rango.fecha_hasta),
      );

      if (existeRangoInvalido) {
        await Swal.fire({
          icon: "warning",
          title: "Rango invalido",
          text: "La fecha fin debe ser mayor a la fecha inicio.",
        });
        return;
      }

      for (const rango of rangosCompletos) {
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
      const mensajeError =
        err.response?.data?.mensajeError ||
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        "No se pudo guardar";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: mensajeError,
      });
    }
  };

  // Inicia la edición en línea de una vacación existente.
  const iniciarEdicionExistente = (vacacion) => {
    setEdicionVacaciones((prev) => ({
      ...prev,
      [vacacion.id]: {
        fecha_desde: dayjs(vacacion.fecha_desde).format("YYYY-MM-DD"),
        fecha_hasta: dayjs(vacacion.fecha_hasta).format("YYYY-MM-DD"),
      },
    }));
  };

  // Cancela la edición de una vacación existente y limpia su estado local.
  const cancelarEdicionExistente = (id) => {
    setEdicionVacaciones((prev) => {
      const nuevoEstado = { ...prev };
      delete nuevoEstado[id];
      return nuevoEstado;
    });
  };

  // Actualiza un campo de la edición de una vacación existente.
  const actualizarEdicionExistente = (id, campo, valor) => {
    setEdicionVacaciones((prev) => {
      const editado = {
        ...(prev[id] || { fecha_desde: "", fecha_hasta: "" }),
        [campo]: valor,
      };

      if (
        campo === "fecha_desde" &&
        editado.fecha_hasta &&
        !esRangoValido(editado.fecha_desde, editado.fecha_hasta)
      ) {
        editado.fecha_hasta = "";
      }

      return {
        ...prev,
        [id]: editado,
      };
    });
  };

  // Guarda los cambios de una vacación existente mediante PUT.
  const guardarEdicionExistente = async (vacacionId) => {
    const edicion = edicionVacaciones[vacacionId];

    if (!edicion?.fecha_desde || !edicion?.fecha_hasta) {
      await Swal.fire({
        icon: "warning",
        title: "Fechas incompletas",
        text: "Completa ambas fechas para editar las vacaciones.",
      });
      return;
    }

    if (!esRangoValido(edicion.fecha_desde, edicion.fecha_hasta)) {
      await Swal.fire({
        icon: "warning",
        title: "Rango invalido",
        text: "La fecha fin debe ser mayor a la fecha inicio.",
      });
      return;
    }

    try {
      setGuardandoEdicionId(vacacionId);

      await modificarPut(`/rrhh/vacaciones-programadas/${vacacionId}`, {
        usuario_emp_id: empleado.usuario_id,
        usuario_adm_id: userId,
        sede_id: empleado.sede_id,
        fecha_desde: edicion.fecha_desde,
        fecha_hasta: edicion.fecha_hasta,
      });

      await Swal.fire({
        icon: "success",
        title: "Vacaciones actualizadas",
        timer: 1600,
        showConfirmButton: false,
      });

      cancelarEdicionExistente(vacacionId);
      if (fetch) await fetch();
      cerrarModal();
    } catch (err) {
      const mensajeError =
        err.response?.data?.mensajeError ||
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        "No se pudo actualizar";

      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: mensajeError,
      });
    } finally {
      setGuardandoEdicionId(null);
    }
  };

  // Elimina una vacación existente del backend y actualiza la vista local.
  const eliminarExistente = async (id) => {
    const confirm = await Swal.fire({
      title: "Eliminar vacaciones?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Eliminar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await eliminar(`/rrhh/vacaciones-programadas/${id}`);
      setVacacionesActuales((prev) =>
        prev.filter((vacacion) => vacacion.id !== id),
      );
      cancelarEdicionExistente(id);

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

  // Calcula la cantidad de días entre dos fechas incluyéndolas a ambas.
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

              {vacacionesActuales?.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No tiene vacaciones cargadas
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {vacacionesActuales.map((v) => (
                    <div
                      key={v.id}
                      className="bg-gray-100 px-3 py-2 rounded-xl"
                    >
                      {edicionVacaciones[v.id] ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                              type="date"
                              value={edicionVacaciones[v.id].fecha_desde}
                              onChange={(e) =>
                                actualizarEdicionExistente(
                                  v.id,
                                  "fecha_desde",
                                  e.target.value,
                                )
                              }
                              className="text-xs border rounded px-2 py-1 bg-white"
                            />

                            <span className="text-xs text-center">→</span>

                            <input
                              type="date"
                              value={edicionVacaciones[v.id].fecha_hasta}
                              min={obtenerFechaSiguiente(
                                edicionVacaciones[v.id].fecha_desde,
                              )}
                              onChange={(e) =>
                                actualizarEdicionExistente(
                                  v.id,
                                  "fecha_hasta",
                                  e.target.value,
                                )
                              }
                              className="text-xs border rounded px-2 py-1 bg-white"
                            />
                          </div>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => guardarEdicionExistente(v.id)}
                              disabled={guardandoEdicionId === v.id}
                              className="text-xs px-3 py-1 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                            >
                              {guardandoEdicionId === v.id
                                ? "Guardando..."
                                : "Guardar"}
                            </button>

                            <button
                              onClick={() => cancelarEdicionExistente(v.id)}
                              className="text-xs px-3 py-1 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                            >
                              Cancelar
                            </button>

                            <button
                              onClick={() => eliminarExistente(v.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-xs font-bold">
                            {dayjs(v.fecha_desde).format("DD/MM")} -{" "}
                            {dayjs(v.fecha_hasta).format("DD/MM")} (
                            {calcularDias(v.fecha_desde, v.fecha_hasta)} dias)
                          </span>

                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => iniciarEdicionExistente(v)}
                              className="text-orange-500 hover:text-orange-700"
                              title="Editar"
                            >
                              <FaPencilAlt />
                            </button>

                            <button
                              onClick={() => eliminarExistente(v.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Eliminar"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      )}
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
                    className="flex flex-col gap-2 items-stretch bg-orange-50 p-3 rounded-xl sm:flex-row sm:items-center"
                  >
                    <input
                      type="date"
                      value={r.fecha_desde}
                      onChange={(e) =>
                        actualizarRango(i, "fecha_desde", e.target.value)
                      }
                      className="text-xs border rounded px-2 py-1"
                    />

                    <span className="text-xs text-center">→</span>

                    <input
                      type="date"
                      value={r.fecha_hasta}
                      min={obtenerFechaSiguiente(r.fecha_desde)}
                      onChange={(e) =>
                        actualizarRango(i, "fecha_hasta", e.target.value)
                      }
                      className="text-xs border rounded px-2 py-1"
                    />

                    <button
                      onClick={() => eliminarRangoLocal(i)}
                      className="text-red-400 self-end sm:self-auto"
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
              disabled={procesando || !puedeGuardarVacaciones}
              className="px-6 py-2 rounded-xl text-xs font-bold transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-orange-500 text-white hover:bg-orange-600"
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
