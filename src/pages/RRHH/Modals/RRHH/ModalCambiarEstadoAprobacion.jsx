/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Interfaz avanzada de revisión de asistencia que gestiona el ciclo de aprobación (Aprobada, Pendiente, Rechazada). Incluye submódulos para la edición manual de horas extra (pendientes y autorizadas) y la aplicación de descuentos manuales sobre el turno. Permite además registrar motivos de rechazo y comentarios aclaratorios, integrando una lógica compleja de conversión de minutos a formato hora/minuto.
*/
import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import useModificarDatosPatch from "../../hooks/modificarDatosPatch";
import { useAuth } from "../../../../AuthContext";
import { FaTimes } from "react-icons/fa";
import HorasExtrasManuales from "../../Components/RRHH/Marcaciones/Subcomponent/HorasExtrasManuales";
import DescuentosManuales from "../../Components/RRHH/Marcaciones/Subcomponent/DescuentosManuales";


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

// Funciones auxiliares locales
const convertirMinutosA_HM = (totalMinutos) => {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  return { horas, minutos };
};

const ModalCambiarEstadoAprobacion = ({ horarios, cerrarModal, fetch }) => {
  const { userId } = useAuth();
  const [abierto, setAbierto] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState(horarios?.estado_aprobacion || "pendiente");
  const [accionRealizar, setAccionRealizar] = useState(ESTADOS_APROBACION.find(op => op.value === estadoSeleccionado)?.accion_realizar || "pendiente");
  const [comentarios, setComentarios] = useState(horarios?.comentarios || "");
  const [mostrarExtras, setMostrarExtras] = useState(false);
  const [mostrarDescuentos, setMostrarDescuentos] = useState(false);
  console.log(horarios.estado_aprobacion)


  // Estados para manejo de horas y minutos por separado
  const minutosPendientesTotales = Number(horarios?.minutos_extra_pendientes || 0);
  const minutosAutorizadosTotales = Number(horarios?.minutos_extra_autorizados || 0);
  const minutosDescuentoTotales = Number(horarios?.minutos_descuento || 0);
  const [horasPendientesInput, setHorasPendientesInput] = useState(0);
  const [minutosPendientesInput, setMinutosPendientesInput] = useState(0);
  const [horasAutorizadasInput, setHorasAutorizadasInput] = useState(0);
  const [minutosAutorizadasInput, setMinutosAutorizadasInput] = useState(0);
  const [horasDescuentoInput, setHorasDescuentoInput] = useState(0);
  const [minutosDescuentoInput, setMinutosDescuentoInput] = useState(0);

  const { modificarPatch: modificarMarcacion } = useModificarDatosPatch();

  useEffect(() => {
    setAbierto(true);
    
    const minutosPendientesIniciales = minutosPendientesTotales;
    const minutosAutorizadosIniciales = minutosAutorizadosTotales;
    const minutosDescuentoIniciales = minutosDescuentoTotales;

    setMostrarExtras( minutosAutorizadosIniciales > 0);
    setMostrarDescuentos(minutosDescuentoIniciales > 0);

    const pendientesHM = convertirMinutosA_HM(minutosPendientesIniciales);
    const autorizadasHM = convertirMinutosA_HM(minutosAutorizadosIniciales);
    const descuentoHM = convertirMinutosA_HM(minutosDescuentoIniciales);

    setHorasPendientesInput(pendientesHM.horas);
    setMinutosPendientesInput(pendientesHM.minutos);
    setHorasAutorizadasInput(autorizadasHM.horas);
    setMinutosAutorizadasInput(autorizadasHM.minutos);
    setHorasDescuentoInput(descuentoHM.horas);
    setMinutosDescuentoInput(descuentoHM.minutos);
    setComentarios(horarios?.comentarios || "");

    if (horarios?.estado === "extra") {
      setMostrarExtras(true);
    }
  }, [horarios, minutosPendientesTotales, minutosAutorizadosTotales, minutosDescuentoTotales]);

  const puedeGestionarExtras =
    Boolean(horarios?.horario_id) || horarios?.estado === "extra";
  const debeForzarExtras = horarios?.estado === "extra";

  // Cálculo de minutos actuales basados en los inputs
  const minutosPendientesEditados = (Number(horasPendientesInput) * 60) + Number(minutosPendientesInput);
  const minutosAutorizadosEditados = (Number(horasAutorizadasInput) * 60) + Number(minutosAutorizadasInput);
  const minutosDescuentoEditados = (Number(horasDescuentoInput) * 60) + Number(minutosDescuentoInput);
  const minutosNoAutorizados = Math.max(0, minutosPendientesEditados - minutosAutorizadosEditados);

  const manejarGuardar = async () => {
    setMensaje("");
    if (puedeGestionarExtras && estadoSeleccionado === "aprobada" && accionRealizar === "modificar_horas" && mostrarExtras) {
      if (minutosPendientesEditados < 0 || minutosAutorizadosEditados < 0) {
        setMensaje("La cantidad no puede ser negativa.");
        return;
      }
    }

    const payload = {
      id: horarios?.id,
      estado_aprobacion: estadoSeleccionado,
      aprobado_por: userId,
      fecha_aprobacion: new Date().toISOString(),
      comentarios: comentarios || null,
    };

    if (puedeGestionarExtras && estadoSeleccionado === "aprobada" && accionRealizar === "modificar_horas") {
      const minutosPendientesFinales = minutosPendientesEditados;
      const minutosAutorizadosFinales = mostrarExtras ? minutosAutorizadosEditados : 0;
      const minutosDescuentoFinales = mostrarDescuentos ? minutosDescuentoEditados : 0;

      payload.minutos_extra_autorizados = minutosAutorizadosFinales;
      payload.minutos_extra_pendientes = minutosPendientesFinales;
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
      cerrarModal();
    } catch (error) {
      setMensaje("No se pudo actualizar el estado.");
    } finally {
      setGuardando(false);
    }
  };

  const formatearHM_Texto = (min) => {
    const { horas, minutos } = convertirMinutosA_HM(min);
    return `${horas}hs ${minutos.toString().padStart(2, '0')}min`;
  };

  if (!horarios || !abierto) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden font-messina max-h-[90vh]"
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

          <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-4">
            <h2 className="font-bignoodle text-2xl tracking-wide">
              Estado de Aprobación
            </h2>
            <p className="text-orange-100 text-xs">
              Gestioná el cumplimiento y las horas extra del turno
            </p>
          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[72vh]">
            {/* Selección de Estado */}
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estado del Registro</span>
              <select
                value={accionRealizar}
                onChange={(e) => {
                  setAccionRealizar(e.target.value);
                  setEstadoSeleccionado(ESTADOS_APROBACION.find(op => op.accion_realizar === e.target.value)?.value);
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-orange-400 outline-none transition-all"
              >
                {ESTADOS_APROBACION.map((opcion) => (
                  <option key={opcion.accion_realizar} value={opcion.accion_realizar}>
                    {opcion.label.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>

            {/* Gestión de Horas Extra HM */}
            {estadoSeleccionado === "aprobada" && puedeGestionarExtras && accionRealizar === "modificar_horas" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <HorasExtrasManuales
                  mostrarExtras={mostrarExtras}
                  setMostrarExtras={setMostrarExtras}
                  horasPendientes={horasPendientesInput}
                  setHorasPendientes={setHorasPendientesInput}
                  minutosPendientes={minutosPendientesInput}
                  setMinutosPendientes={setMinutosPendientesInput}
                  horasAutorizadas={horasAutorizadasInput}
                  setHorasAutorizadas={setHorasAutorizadasInput}
                  minutosAutorizadas={minutosAutorizadasInput}
                  setMinutosAutorizadas={setMinutosAutorizadasInput}
                  minutosPendientesIniciales={minutosPendientesTotales}
                  minutosAutorizadosIniciales={minutosAutorizadosTotales}
                  mostrarBadgePendientes={true}
                  mostrarResumen={true}
                  mostrarAdvertencia={true}
                  bloquearToggleExtras={debeForzarExtras}
                  bloquearPendientes={debeForzarExtras}
                />
              </motion.div>
            )}

            {estadoSeleccionado === "aprobada" && puedeGestionarExtras && accionRealizar === "modificar_horas" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <DescuentosManuales
                  mostrarDescuentos={mostrarDescuentos}
                  setMostrarDescuentos={setMostrarDescuentos}
                  horasDescuento={horasDescuentoInput}
                  setHorasDescuento={setHorasDescuentoInput}
                  minutosDescuento={minutosDescuentoInput}
                  setMinutosDescuento={setMinutosDescuentoInput}
                  minutosDescuentoIniciales={minutosDescuentoTotales}
                />
              </motion.div>
            )}

            {(() => {
              const tieneComentarios = Boolean(horarios?.comentarios);
              return (
              <motion.label 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex flex-col gap-1"
              >
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{tieneComentarios ? "¿Quieres añadir más comentarios?" : "¿Quieres añadir un comentario?"}</span>
                <textarea
                  value={comentarios}
                  onChange={(e) => setComentarios(e.target.value.slice(0, 255))}
                  placeholder="Explicá el motivo..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                />
              </motion.label>
            )})()}

            {mensaje && (
              <div className="p-3 text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200 rounded-xl text-center">
                {mensaje}
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
            <button
              onClick={manejarGuardar}
              disabled={guardando}
              className="px-6 py-2 text-sm font-bold bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all uppercase tracking-widest disabled:opacity-50"
            >
              {guardando ? "Procesando..." : "Confirmar"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalCambiarEstadoAprobacion;