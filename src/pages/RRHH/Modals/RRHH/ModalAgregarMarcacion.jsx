/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Modal administrativo para la creación manual de marcaciones de asistencia. Permite registrar entradas y salidas fuera del flujo biométrico normal, ofreciendo la posibilidad de vincular la marca a un horario pactado del empleado o tratarla automáticamente como hora extra si no existe vínculo, gestionando además los estados de aprobación y comentarios justificativos.
*/

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../../AuthContext";
import useAgregarDatos from "../../hooks/agregarDatos";
import useObtenerDatos from "../../hooks/obtenerDatos"; // Usamos tu hook para traer los horarios
import dayjs from "dayjs";
import { FaClock, FaLink, FaExternalLinkAlt } from "react-icons/fa";
const ESTADOS = ["normal", "justificado"];
const ESTADOS_APROBACION = ["pendiente", "aprobada", "rechazada"];

const ModalAgregarMarcacion = ({ cerrarModal, fetch, horarioSeleccionado }) => {
  const { userId } = useAuth();
  const { cargando, agregar } = useAgregarDatos();
  const [mensaje, setMensaje] = useState("");
  const [vinculadoHorarioID, setVinculadoHorarioID] = useState(true);


  const [formulario, setFormulario] = useState({
    fecha: dayjs(horarioSeleccionado?.diaSeleccionado).format("YYYY-MM-DD"),
    entrada: "",
    salida: "",
    estado: "extra", // Por defecto extra según pedido
    estado_aprobacion: "aprobada",
    comentarios: "",
    horario_id: null,
  });

  // 1. Buscamos los horarios del empleado para el día de la semana seleccionado
  const diaSemana = dayjs(horarioSeleccionado?.diaSeleccionado).day(); // 0 (Dom) a 6 (Sab)
  // Nota: Si tu backend usa 1 para Lunes y 7 para Domingo, ajustamos el valor:
  const diaBackend = diaSemana === 0 ? 7 : diaSemana;

  const { datos: horariosEmpleado } = useObtenerDatos(
    `/rrhh/horarios?usuario_id=${horarioSeleccionado?.usuario?.usuario_id}&dia_semana=${diaBackend}`,
  );

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    if (name === "rechazo" && value.length > 255) return;
    if (name === "comentarios" && value.length > 255) return;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Lógica para cuando el usuario selecciona un horario para vincular
  const vincularHorario = (hId) => {
    if (!hId) {
      setFormulario((prev) => ({
        ...prev,
        horario_id: null,
        estado: "extra",
        entrada: "",
        salida: "",
      }));
      setVinculadoHorarioID(true);
      return;
    }

    const hEncontrado = horariosEmpleado.find((h) => h.id === Number(hId));
    if (hEncontrado) {
      // Limpiamos los segundos si vienen de la base de datos (07:00:00 -> 07:00)
      const entradaLimpia = hEncontrado.hora_entrada.substring(0, 5);
      const salidaLimpia = hEncontrado.hora_salida.substring(0, 5);
      setFormulario((prev) => ({
        ...prev,
        horario_id: hId,
        estado: "normal",
        entrada: entradaLimpia,
        salida: salidaLimpia,
      }));
      setVinculadoHorarioID(false);
    }
  };

  const manejarRegistrar = async () => {
    setMensaje("");

    if (!formulario.entrada || !formulario.salida) {
      setMensaje("Debes completar entrada y salida.");
      return;
    }

    const dia_seleccionado = dayjs(horarioSeleccionado?.diaSeleccionado).format(
      "YYYY-MM-DD",
    );

    const payload = {
      usuario_id: Number(horarioSeleccionado?.usuario?.usuario_id),
      sede_id: Number(horarioSeleccionado?.usuario?.sede_id),
      horario_id: formulario.horario_id ? Number(formulario.horario_id) : null,
      fecha: dia_seleccionado,
      hora_entrada: `${dia_seleccionado} ${formulario.entrada}:00`,
      hora_salida: `${dia_seleccionado} ${formulario.salida}:00`,
      estado: formulario.estado,
      estado_aprobacion: formulario.estado_aprobacion,
      origen: "manual",
      comentarios: formulario.comentarios.trim() || null,
      aprobado_por: formulario.estado_aprobacion === "aprobada" ? userId : null,
      fecha_aprobacion:
        formulario.estado_aprobacion === "aprobada"
          ? new Date().toISOString()
          : null,
    };

    try {
      await agregar("/rrhh/marcaciones", payload);
      if (fetch) await fetch();
      cerrarModal();
    } catch (err) {
      setMensaje("Error al registrar la marcación.");
    }
  };

  const fechaVisualizacion = dayjs(horarioSeleccionado?.diaSeleccionado).format(
    "DD-MM-YYYY",
  );

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
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden font-messina"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-5">
            <h2 className="font-bignoodle text-3xl tracking-wide">
              Nueva Marcación
            </h2>
            <p className="text-emerald-100 text-sm">
              Registrar turno para el empleado
            </p>
          </div>

          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* VINCULACIÓN DE HORARIO */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <FaLink className="text-emerald-500" /> Vincular con horario del
                día
              </span>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                value={formulario.horario_id || ""}
                onChange={(e) => vincularHorario(e.target.value)}
              >
                <option value="">Sin vincular (Tratar como HORA EXTRA)</option>
                {horariosEmpleado?.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hora_entrada.substring(0, 5)} a{" "}
                    {h.hora_salida.substring(0, 5)} —{" "}
                    {h.comentarios || "Horario pactado"}
                  </option>
                ))}
              </select>
              {!formulario.horario_id && (
                <p className="text-[10px] text-orange-600 font-bold italic">
                  * Se registrará como hora extra automática al no haber
                  vínculo.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider">
                Fecha:{" "}
                <span className="text-emerald-600 font-bold">
                  {fechaVisualizacion}
                </span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-700 uppercase">
                  Hora Entrada
                </span>
                <input
                  type="time"
                  name="entrada"
                  value={formulario.entrada}
                  onChange={manejarCambio}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-700 uppercase">
                  Hora Salida
                </span>
                <input
                  type="time"
                  name="salida"
                  value={formulario.salida}
                  onChange={manejarCambio}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-700 uppercase">
                  Estado
                </span>
                <select
                 disabled ={vinculadoHorarioID} // Solo se puede cambiar si no hay vínculo con horario
                  name="estado"
                  value={formulario.estado}
                  onChange={manejarCambio}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                >
                  {vinculadoHorarioID && (
                    <option key="extra" value="extra">EXTRA</option>
                  )}
                  {ESTADOS.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-semibold text-gray-700 uppercase">
                  Aprobación
                </span>
                <select
                  name="estado_aprobacion"
                  value={formulario.estado_aprobacion}
                  onChange={manejarCambio}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none transition-all"
                >
                  {ESTADOS_APROBACION.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-gray-700 uppercase">
                Comentarios
              </span>
              <textarea
                name="comentarios"
                value={formulario.comentarios}
                onChange={manejarCambio}
                placeholder="Ej: Se crea por olvido de marcar, turno especial, etc."
                rows={2}
                maxLength={255}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400 outline-none resize-none"
              />
            </div>

            {mensaje && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs text-center">
                {mensaje}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 font-messina">
            <button
              onClick={cerrarModal}
              disabled={cargando}
              className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              onClick={manejarRegistrar}
              disabled={cargando}
              className="px-8 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 shadow-lg transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {cargando ? "Registrando..." : "Registrar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalAgregarMarcacion;
