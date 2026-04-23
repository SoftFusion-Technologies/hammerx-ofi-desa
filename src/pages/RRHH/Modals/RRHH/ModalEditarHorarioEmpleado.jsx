import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useModificarDatosPatch from "../../hooks/modificarDatosPatch";
import { format, parse } from "date-fns";
import { useAuth } from "../../../../AuthContext";
import { FaTimes } from "react-icons/fa";
import HorasExtrasManuales from "../../Components/RRHH/Marcaciones/Subcomponent/HorasExtrasManuales";
import DescuentosManuales from "../../Components/RRHH/Marcaciones/Subcomponent/DescuentosManuales";

const ESTADOS = ["injustificado", "justificado"];

/* const ESTADOS_APROBACION = ["pendiente", "aprobada", "rechazada"]; */

const ESTADOS_APROBACION = [{
  value: "pendiente",
  accion_realizar: "pendiente",
  label: "Pendiente",
},
{
  value: "aprobada",
  accion_realizar: "no_modificar_horas",
  label: "No modificar horas",
}
,{
  value: "aprobada",
  accion_realizar: "modificar_horas",
  label: "Modificar horas",
}]

const formatearFechaHora = (valor) => {
  if (!valor) return "-";
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-AR");
};

const extraerHora = (horarios, campoCorto, campoFechaHora) => {
  if (horarios?.[campoCorto]) return horarios[campoCorto].slice(0, 5);
  if (!horarios?.[campoFechaHora]) return "";
  const fecha = new Date(horarios[campoFechaHora]);
  if (Number.isNaN(fecha.getTime())) return "";
  return `${String(fecha.getHours()).padStart(2, "0")}:${String(
    fecha.getMinutes(),
  ).padStart(2, "0")}`;
};

const ModalEditarHorarioEmpleado = ({
  horarios,
  cerrarModal,
  fetch,
  soloObservacion,
}) => {
  const { userId } = useAuth();
  const [abierto, setAbierto] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [mostrarDescuentos, setMostrarDescuentos] = useState(false);

  // Estados para horas extra manuales
  const [horasPendientesManual, setHorasPendientesManual] = useState(0);
  const [minutosPendientesManual, setMinutosPendientesManual] = useState(0);
  const [horasAutorizadasManual, setHorasAutorizadasManual] = useState(0);
  const [minutosAutorizadosManual, setMinutosAutorizadosManual] = useState(0);
  const [horasDescuentoManual, setHorasDescuentoManual] = useState(0);
  const [minutosDescuentoManual, setMinutosDescuentoManual] = useState(0);
  const minutosPendientesIniciales = Number(
    horarios?.minutos_extra_pendientes || 0,
  );
  const minutosAutorizadosIniciales = Number(
    horarios?.minutos_extra_autorizados || 0,
  );
  const minutosDescuentoIniciales = Number(horarios?.minutos_descuento || 0);

  const { modificarPatch: modificarMarcacion } = useModificarDatosPatch();

  const valoresIniciales = useMemo(
    () => ({
      entrada: extraerHora(horarios, "entrada", "hora_entrada"),
      salida: extraerHora(horarios, "salida", "hora_salida"),
      estado: horarios?.estado || "normal",
      estado_justificacion: horarios?.estado_justificacion || "injustificado",
      estado_aprobacion: horarios?.estado_aprobacion || "pendiente",
      accion_realizar: ESTADOS_APROBACION.find(op => op.value === horarios?.estado_aprobacion)?.accion_realizar,
    }),
    [horarios],
  );
  const [formulario, setFormulario] = useState(valoresIniciales);

  useEffect(() => {
    setFormulario(valoresIniciales);
    setAbierto(true);
    setMensaje("");
    setJustificacion(horarios?.comentarios || "");
    setMostrarExtras(
      minutosAutorizadosIniciales > 0,
    );
    setMostrarDescuentos(minutosDescuentoIniciales > 0);

    // Inicializar inputs de extras si ya existen
    const pendientesHM = extraerMinutosAHM(minutosPendientesIniciales);
    const autorizadasHM = extraerMinutosAHM(minutosAutorizadosIniciales);
    const descuentoHM = extraerMinutosAHM(minutosDescuentoIniciales);
    setHorasPendientesManual(pendientesHM.horas);
    setMinutosPendientesManual(pendientesHM.minutos);
    setHorasAutorizadasManual(autorizadasHM.horas);
    setMinutosAutorizadosManual(autorizadasHM.minutos);
    setHorasDescuentoManual(descuentoHM.horas);
    setMinutosDescuentoManual(descuentoHM.minutos);
  }, [
    valoresIniciales,
    horarios,
    minutosPendientesIniciales,
    minutosAutorizadosIniciales,
    minutosDescuentoIniciales,
  ]);

  const extraerMinutosAHM = (totalMinutos) => {
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    return { horas, minutos };
  };

  const manejarCambio = (campo, valor) => {
    setFormulario((prev) => ({ ...prev, [campo]: valor }));
  };

  const minutosPendientesEditados =
    Number(horasPendientesManual) * 60 + Number(minutosPendientesManual);
  const minutosAutorizadosEditados =
    Number(horasAutorizadasManual) * 60 + Number(minutosAutorizadosManual);
  const minutosDescuentoEditados =
    Number(horasDescuentoManual) * 60 + Number(minutosDescuentoManual);
  const puedeGestionarExtras =
    Boolean(horarios?.horario_id) || formulario.estado === "extra";
  const debeForzarExtras = formulario.estado === "extra";

  useEffect(() => {
    if (debeForzarExtras && !mostrarExtras) {
      setMostrarExtras(true);
    }
  }, [debeForzarExtras, mostrarExtras]);

  const hayCambios =
    formulario.entrada !== valoresIniciales.entrada ||
    formulario.salida !== valoresIniciales.salida ||
    formulario.estado_justificacion !== valoresIniciales.estado_justificacion ||
    formulario.estado_aprobacion !== valoresIniciales.estado_aprobacion || formulario.accion_realizar !== valoresIniciales.accion_realizar ||
    justificacion.trim() !== (horarios?.comentarios || "").trim() ||
    (puedeGestionarExtras &&
      mostrarExtras &&
      (minutosPendientesEditados !== minutosPendientesIniciales ||
        minutosAutorizadosEditados !== minutosAutorizadosIniciales)) ||
    (puedeGestionarExtras &&
      (mostrarDescuentos !== minutosDescuentoIniciales > 0 ||
        minutosDescuentoEditados !== minutosDescuentoIniciales)) ||
    mostrarExtras !==
      (minutosPendientesIniciales > 0 || minutosAutorizadosIniciales > 0);

  const manejarGuardar = async () => {
    setMensaje("");

    if (!formulario.entrada || !formulario.salida) {
      setMensaje("La entrada y salida son obligatorias.");
      return;
    }

    if (!hayCambios) {
      setMensaje("No hay cambios para guardar.");
      return;
    }

    const fechaObjeto = parse(horarios.fecha_registro, "M/d/yyyy", new Date());
    const fechaLimpia = format(fechaObjeto, "yyyy-MM-dd");

    const payload = {
      usuario_id: Number(horarios.usuario_id),
      sede_id: Number(horarios.sede_id),
      id: horarios?.id,
      fecha: fechaLimpia,
      estado: formulario.estado,
      estado_justificacion: formulario.estado_justificacion,
      origen: horarios?.origen || "manual",
      estado_aprobacion: formulario.estado_aprobacion,
      aprobado_por: userId,
      hora_entrada: `${fechaLimpia} ${formulario.entrada}:00`,
      hora_salida: `${fechaLimpia} ${formulario.salida}:00`,
      fecha_aprobacion: new Date().toISOString(),
      comentarios: justificacion.trim() || null,
    };

    // Si corresponde gestionar extras, enviamos valores editados o en cero (anulación)
    if (puedeGestionarExtras) {
      const minutosPendientesFinales = minutosPendientesEditados;
      const minutosAutorizadosFinales = mostrarExtras
        ? minutosAutorizadosEditados
        : 0;
      const minutosDescuentoFinales = mostrarDescuentos
        ? minutosDescuentoEditados
        : 0;

      payload.minutos_extra_pendientes = minutosPendientesFinales;
      payload.minutos_extra_autorizados = minutosAutorizadosFinales;
      payload.minutos_extra_no_autorizados = Math.max(
        0,
        minutosPendientesFinales - minutosAutorizadosFinales,
      );
      payload.minutos_descuento = minutosDescuentoFinales;
    }

    try {
      setGuardando(true);
      await modificarMarcacion(`/rrhh/marcaciones/${horarios.id}`, payload);
      await fetch();
      if (cerrarModal) cerrarModal();
    } catch (error) {
      setMensaje("No se pudieron guardar los cambios.");
    } finally {
      setGuardando(false);
    }
  };

  if (!horarios || !abierto) return null;

  return (
    <AnimatePresence>
      {abierto && (
        <motion.div
          className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-2xl bg-white  shadow-2xl border border-gray-100 font-messina max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
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

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 border-b border-orange-400">
              <h2 className="font-bignoodle text-3xl tracking-wide">
                {soloObservacion ? "Observación" : "Editar Marcación"}
              </h2>
              {!soloObservacion && (

              <p className="text-orange-100 text-sm">
                Ajustá los tiempos y estados del turno
              </p>
              )}
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
              {/* Solo observación se activa cuando un usuario empleado quiere modificar los comentarios mientras todavía la marcación está pendiente de aprobación */}
              {!soloObservacion && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        Hora de entrada
                      </span>
                      <input
                        type="time"
                        value={formulario.entrada}
                        onChange={(e) =>
                          manejarCambio("entrada", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        Hora de salida
                      </span>
                      <input
                        type="time"
                        value={formulario.salida}
                        onChange={(e) =>
                          manejarCambio("salida", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        Estado Cumplimiento
                      </span>
                      <select
                        value={formulario.estado_justificacion}
                        onChange={(e) =>
                          manejarCambio("estado_justificacion", e.target.value)
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                      >
                         { ESTADOS.map((opcion) => (
                            <option key={opcion} value={opcion}>
                              {opcion.toUpperCase()}
                            </option>
                          ))
                        }
                      </select>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] font-bold text-gray-500 uppercase">
                        Estado Aprobación
                      </span>
                      <select
                        value={formulario.accion_realizar}
                        onChange={(e) =>
                        {
                          manejarCambio("accion_realizar", e.target.value)
                          manejarCambio("estado_aprobacion", ESTADOS_APROBACION.find(op => op.accion_realizar === e.target.value)?.value || "pendiente")
                        }
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                      >
                        {ESTADOS_APROBACION.map((opcion) => (
                          <option key={opcion.accion_realizar} value={opcion.accion_realizar}>
                            {opcion.label.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                                    {/* SECCIÓN HORAS EXTRA MANUALES */}
                  {puedeGestionarExtras && formulario.accion_realizar === "modificar_horas" && (
                    <HorasExtrasManuales
                      mostrarExtras={mostrarExtras}
                      setMostrarExtras={setMostrarExtras}
                      horasPendientes={horasPendientesManual}
                      setHorasPendientes={setHorasPendientesManual}
                      minutosPendientes={minutosPendientesManual}
                      setMinutosPendientes={setMinutosPendientesManual}
                      horasAutorizadas={horasAutorizadasManual}
                      setHorasAutorizadas={setHorasAutorizadasManual}
                      minutosAutorizadas={minutosAutorizadosManual}
                      setMinutosAutorizadas={setMinutosAutorizadosManual}
                      minutosPendientesIniciales={minutosPendientesIniciales}
                      minutosAutorizadosIniciales={minutosAutorizadosIniciales}
                      bloquearToggleExtras={debeForzarExtras}
                      bloquearPendientes={debeForzarExtras}
                    />
                  )}

                  {puedeGestionarExtras && formulario.accion_realizar === "modificar_horas" && (
                    <DescuentosManuales
                      mostrarDescuentos={mostrarDescuentos}
                      setMostrarDescuentos={setMostrarDescuentos}
                      horasDescuento={horasDescuentoManual}
                      setHorasDescuento={setHorasDescuentoManual}
                      minutosDescuento={minutosDescuentoManual}
                      setMinutosDescuento={setMinutosDescuentoManual}
                      minutosDescuentoIniciales={minutosDescuentoIniciales}
                    />
                  )}

                </>
              )}

              {/* COMENTARIOS */}
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-gray-500 uppercase">
                  Comentarios / Justificación
                </span>
                <textarea
                  value={justificacion}
                  onChange={(e) =>
                    setJustificacion(e.target.value.slice(0, 255))
                  }
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none resize-none"
                />
                <span className="text-[10px] text-gray-400 text-right">
                  {justificacion.length}/255
                </span>
              </label>

              {mensaje && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2 text-xs font-bold text-orange-700 text-center">
                  {mensaje}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={manejarGuardar}
                disabled={guardando}
                className="px-8 py-2 rounded-xl bg-orange-600 text-white font-bold text-xs uppercase shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all disabled:opacity-50"
              >
                {guardando ? "Guardando..." : "Confirmar Cambios"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalEditarHorarioEmpleado;
