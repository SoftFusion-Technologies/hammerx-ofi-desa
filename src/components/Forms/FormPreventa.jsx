import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowLeft,
  FiCheck,
  FiUploadCloud,
  FiFileText,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";

// ==========================================
// Sub-componente: Stepper de Progreso
// ==========================================
const StepperProgreso = ({ pasoActivo, requiereTurno }) => {
  const pasos = requiereTurno
    ? [
        { id: "paso-1", num: 1, label: "Turno" },
        { id: "paso-2", num: 2, label: "Transferencia" },
        { id: "paso-3", num: 3, label: "Datos" },
      ]
    : [
        { id: "paso-1", num: 1, label: "Transferencia" },
        { id: "paso-2", num: 2, label: "Datos" },
      ];

  return (
    <div className="sticky top-0 z-10 bg-white pt-4 pb-2 px-4 md:px-6 border-b border-gray-300 flex items-start md:items-center justify-center w-full shadow-sm">
      <div className="flex items-center justify-between w-full max-w-[300px] relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>

        {pasos.map((paso) => {
          const isActive = pasoActivo === paso.id;
          const isPast = parseInt(pasoActivo.split("-")[1]) > paso.num;

          return (
            <div
              key={paso.id}
              className="flex flex-col items-center gap-1 bg-white px-2"
            >
              <div
                className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? "bg-orange-600 text-white ring-2 ring-orange-600/30 ring-offset-2 ring-offset-white"
                    : isPast
                      ? "bg-orange-100 text-orange-600 border border-orange-300"
                      : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {paso.num}
              </div>
              <span
                className={`text-[9px] md:text-[10px] uppercase font-bold tracking-wider transition-colors duration-300 ${
                  isActive
                    ? "text-orange-600"
                    : isPast
                      ? "text-orange-500"
                      : "text-gray-400"
                }`}
              >
                {paso.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// Sub-componente: Selector de Turnos
// ==========================================
const SelectorTurnos = ({
  horarios = [],
  turnoSeleccionado,
  planSeleccionado,
  alSeleccionarTurno,
}) => {
  const tituloPlan = planSeleccionado?.title?.toLowerCase?.() || "";
  const planId = planSeleccionado?.id?.toLowerCase?.() || "";

  const esPaseFull = tituloPlan.includes("full");

  const esPilatesLMV = planId.includes("pilates") && planId.includes("lmv");

  const esPilatesMJ = planId.includes("pilates") && planId.includes("mj");

  const [grupoFullSeleccionado, setGrupoFullSeleccionado] = useState("LMV");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const horariosFiltrados = horarios.filter((horario) => {
    const grupoHorario = horario?.grp?.toUpperCase?.() || "";

    if (esPaseFull) {
      return grupoHorario === grupoFullSeleccionado;
    }

    if (esPilatesLMV) {
      return grupoHorario === "LMV";
    }

    if (esPilatesMJ) {
      return grupoHorario === "MJ";
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      {esPaseFull && (
        <div className="flex flex-col gap-2">
          <p
            className={`text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1 ${
              grupoFullSeleccionado
                ? "text-orange-600 font-semibold"
                : "text-gray-500 font-bold"
            }`}
          >
            <FiCheck className="text-sm shrink-0" />
            Elegí tus días
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setGrupoFullSeleccionado("LMV");
                setMenuAbierto(true);
              }}
              className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                grupoFullSeleccionado === "LMV"
                  ? "border-orange-600 bg-orange-600 text-white shadow-[0_4px_10px_rgba(234,88,12,0.2)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:bg-orange-50/50"
              }`}
            >
              Lun - Mié - Vie
            </button>

            <button
              type="button"
              onClick={() => {
                setGrupoFullSeleccionado("MJ");
                setMenuAbierto(true);
              }}
              className={`p-2.5 rounded-lg border text-sm font-semibold transition-all ${
                grupoFullSeleccionado === "MJ"
                  ? "border-orange-600 bg-orange-600 text-white shadow-[0_4px_10px_rgba(234,88,12,0.2)]"
                  : "border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:bg-orange-50/50"
              }`}
            >
              Martes - Jueves
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <p
          className={`text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1 ${
            turnoSeleccionado
              ? "text-orange-600 font-semibold"
              : "text-gray-500 font-bold"
          }`}
        >
          {turnoSeleccionado ? (
            <FiCheck className="text-sm shrink-0" />
          ) : esPaseFull ? (
            <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold leading-[1] text-gray-600">
              2
            </span>
          ) : (
            <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold leading-[1] text-gray-600">
              1
            </span>
          )}
          Seleccioná tu horario
        </p>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className={`w-full px-4 py-3.5 rounded-xl border flex items-center justify-between transition-all ${
              turnoSeleccionado
                ? "border-orange-500 bg-orange-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-orange-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col items-start">
              <span
                className={`text-sm font-semibold ${
                  turnoSeleccionado ? "text-gray-900" : "text-gray-600"
                }`}
              >
                {turnoSeleccionado
                  ? "Horario seleccionado:"
                  : "Selecciona tu horario..."}
              </span>

              {turnoSeleccionado && (
                <span className="text-xs text-orange-600 font-bold mt-0.5 tracking-wide">
                  {turnoSeleccionado.hhmm} hs | {turnoSeleccionado.grupo_label}
                </span>
              )}
            </div>

            <FiChevronDown
              className={`text-gray-400 text-xl transition-transform duration-300 ${
                menuAbierto ? "rotate-180 text-orange-500" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {menuAbierto && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden relative w-full z-20 mt-2 shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white rounded-xl border border-gray-200 min-h-[120px]"
              >
                <div className="flex flex-col gap-1 p-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
                  {horariosFiltrados.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      No hay horarios disponibles para este grupo.
                    </div>
                  ) : (
                    horariosFiltrados.map((horario) => {
                      const cuposDisponibles =
                        horario.cupo_por_clase - horario.total_inscriptos;

                      const hayCupo = cuposDisponibles > 0;

                      const esElegido =
                        turnoSeleccionado?.hhmm === horario.hhmm &&
                        turnoSeleccionado?.grp === horario.grp;

                      const quedanPocos =
                        hayCupo && Number(cuposDisponibles) <= 4;

                      const quedanUltimos =
                        hayCupo && Number(cuposDisponibles) <= 2;

                      return (
                        <button
                          key={`${horario.hhmm}-${horario.grp}`}
                          type="button"
                          disabled={!hayCupo}
                          onClick={() => {
                            alSeleccionarTurno(horario);
                            setMenuAbierto(false);
                          }}
                          className={`px-3 py-2.5 rounded-lg border-b border-transparent last:border-b-0 text-left transition-all flex items-center justify-between gap-3 ${
                            !hayCupo
                              ? "opacity-50 cursor-not-allowed bg-gray-50"
                              : esElegido
                                ? "bg-orange-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-orange-50 hover:border-orange-100"
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-bold ${
                                  esElegido ? "text-white" : "text-gray-900"
                                }`}
                              >
                                {horario.hhmm} hs
                              </span>

                              {!esPaseFull && (
                                <span
                                  className={`text-xs ${
                                    esElegido
                                      ? "text-orange-100 font-medium"
                                      : "text-gray-500"
                                  }`}
                                >
                                  | {horario.grupo_label}
                                </span>
                              )}

                              <span
                                className={`${
                                  esPaseFull ? "block" : "hidden"
                                } text-[10px] uppercase font-extrabold tracking-wide ${
                                  !hayCupo
                                    ? "text-gray-400"
                                    : esElegido
                                      ? "text-white"
                                      : quedanUltimos
                                        ? "text-red-600"
                                        : quedanPocos
                                          ? "text-blue-500"
                                          : "text-green-600"
                                }`}
                              >
                                {!hayCupo
                                  ? "Lleno"
                                  : Number(cuposDisponibles) === 1
                                    ? "Último cupo"
                                    : Number(cuposDisponibles) === 2
                                      ? "Últimos 2 cupos"
                                      : Number(cuposDisponibles) <= 4
                                        ? `Quedan ${cuposDisponibles} lugares`
                                        : "Disponible"}
                              </span>
                            </div>

                            <span
                              className={`${
                                !esPaseFull ? "block" : "hidden"
                              } text-[10px] uppercase font-extrabold tracking-wide ${
                                !hayCupo
                                  ? "text-gray-400"
                                  : esElegido
                                    ? "text-white"
                                    : quedanUltimos
                                      ? "text-red-600"
                                      : quedanPocos
                                        ? "text-blue-500"
                                        : "text-green-600"
                              }`}
                            >
                              {!hayCupo
                                ? "Lleno"
                                : Number(cuposDisponibles) === 1
                                  ? "Último cupo"
                                  : Number(cuposDisponibles) === 2
                                    ? "Últimos 2 cupos"
                                    : Number(cuposDisponibles) <= 4
                                      ? `Quedan ${cuposDisponibles} lugares`
                                      : "Disponible"}
                            </span>
                          </div>

                          {esElegido && (
                            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white/20 text-white">
                              <FiCheck className="text-sm font-bold" />
                            </div>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Sub-componente: Datos Bancarios
// ==========================================
const DatosBancarios = ({
  monto,
  stepLabel,
  requiereComprobante,
  manejarArchivo,
  completado,
}) => {
  const [copiado, setCopiado] = useState("");
  const [nombreArchivo, setNombreArchivo] = useState("");

  const copiarAlPortapapeles = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(""), 2000);
  };

  const onArchivoChange = (e) => {
    const archivo = e.target.files?.[0];
    setNombreArchivo(archivo ? archivo.name : "");
    manejarArchivo(e);
  };

  const textoLimpio = stepLabel?.replace(/^\d+\.\s*/, "");
  const numero = stepLabel?.match(/^\d+/)?.[0] || "";

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p
        className={`text-[10px] md:text-xs uppercase tracking-wider mb-1 flex items-center gap-1 ${completado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
      >
        {completado ? (
          <FiCheck className="text-sm shrink-0" />
        ) : numero ? (
          <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold leading-[1] text-gray-600">
            {numero}
          </span>
        ) : null}
        {textoLimpio || "Descargá el comprobante para adjuntarlo aquí abajo"}
      </p>

      <div className="flex items-center justify-between text-left gap-3 mb-2">
        <div className="flex flex-row items-center gap-x-2">
          <p className="text-gray-500 text-xs">Monto a transferir:</p>
          <p className="text-3xl font-bignoodle text-orange-600 tracking-widest leading-none">
            $
            {monto.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold leading-none">
              CVU
            </p>
            <p className="text-sm text-gray-900 font-mono tracking-tighter">
              0000003100082404577290
            </p>
          </div>
          <button
            type="button"
            onClick={() => copiarAlPortapapeles("0000003100082404577290", "cbu")}
            className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-3.5 py-1.5 rounded-lg transition-all border border-orange-200"
          >
            {copiado === "cbu" ? "Listo!" : "Copiar"}
          </button>
        </div>

        <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold leading-none">
              Alias
            </p>
            <p className="text-sm text-gray-900 font-mono">hammerxsas</p>
          </div>
          <button
            type="button"
            onClick={() => copiarAlPortapapeles("hammerxsas", "alias")}
            className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-3.5 py-1.5 rounded-lg transition-all border border-orange-200"
          >
            {copiado === "alias" ? "Listo!" : "Copiar"}
          </button>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-left">
          <p className="text-[9px] text-gray-500 uppercase font-bold leading-none">
            Titular
          </p>
          <p className="text-sm text-gray-900 font-semibold">HAMMERX S. A. S.</p>
        </div>
      </div>

      {requiereComprobante && (
        <div className="mt-3 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-3">
          <label
            htmlFor="comprobante"
            className="group flex items-center justify-between gap-2 rounded-lg border border-orange-200 bg-white px-3 py-2.5 cursor-pointer transition-all hover:border-orange-400 hover:shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-xl transition-transform group-hover:scale-105">
                <FiUploadCloud />
              </div>

              <div className="flex flex-col min-w-0 text-left leading-tight">
                <span className="text-xs font-semibold text-gray-800 truncate group-hover:text-orange-700 transition-colors">
                  Subí tu comprobante
                </span>
                <span className="text-[10px] text-gray-500 truncate">
                  Imagen o PDF
                </span>
              </div>
            </div>

            <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-600">
              <FiFileText className="text-[10px]" />
              Seleccionar
            </div>
          </label>

          <input
            id="comprobante"
            type="file"
            accept="image/*,.pdf"
            onChange={onArchivoChange}
            className="hidden"
          />

          {nombreArchivo && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2.5 py-2">
              <FiCheck className="text-green-600 shrink-0" />
              <p className="text-[11px] text-green-800 truncate">
                Cargado: <span className="font-semibold">{nombreArchivo}</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// Sub-componente: Formulario de Datos Personales
// ==========================================
const FormularioDatos = ({
  datos,
  manejarCambio,
  stepLabel,
  completado,
  textoObservacion,
  manejarCambioObservacion,
  errorObservacion,
  observacionesRef,
}) => {
  const textoLimpio = stepLabel?.replace(/^\d+\.\s*/, "");
  const numero = stepLabel?.match(/^\d+/)?.[0] || "";

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p
        className={`text-[10px] md:text-xs uppercase tracking-wider mb-1 flex items-center gap-1 ${completado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
      >
        {completado ? (
          <FiCheck className="text-sm shrink-0" />
        ) : numero ? (
          <span className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full border border-gray-300 bg-gray-100 text-[10px] font-bold leading-[1] text-gray-600">
            {numero}
          </span>
        ) : null}
        {textoLimpio || "Carga tus datos personales"}
      </p>

      <div className="flex flex-col gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
            Nombre y apellido
          </label>
          <input
            type="text"
            name="nombreApellido"
            value={datos.nombreApellido}
            onChange={manejarCambio}
            placeholder="Ej: Juan Perez"
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
              DNI
            </label>
            <input
              type="number"
              name="dni"
              value={datos.dni}
              onChange={manejarCambio}
              placeholder="Sin puntos"
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
              Nacimiento
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={datos.fechaNacimiento}
              onChange={manejarCambio}
              required
              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
            Correo electrónico
          </label>
          <input
            type="email"
            name="correo"
            value={datos.correo}
            onChange={manejarCambio}
            placeholder="nombre@correo.com"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
            Domicilio completo
          </label>
          <input
            type="text"
            name="domicilio"
            value={datos.domicilio}
            onChange={manejarCambio}
            placeholder="Calle y altura"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
            Celular (WhatsApp)
          </label>
          <input
            type="tel"
            name="celular"
            value={datos.celular}
            onChange={manejarCambio}
            placeholder="3811234567"
            required
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all placeholder-gray-400"
          />
        </div>

        <div>
          <label
            className={`block text-[10px] font-bold uppercase mb-1 ml-0.5 ${
              errorObservacion ? "text-red-600" : "text-gray-600"
            }`}
          >
            Observaciones
          </label>
          <textarea
            ref={observacionesRef}
            value={textoObservacion}
            onChange={manejarCambioObservacion}
            className={`w-full h-24 bg-gray-50 border rounded-xl p-3 text-sm text-gray-900 resize-none outline-none transition-all placeholder-gray-400 ${
              errorObservacion
                ? "border-red-400 ring-1 ring-red-400 bg-red-50/50"
                : "border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            }`}
          />
          {errorObservacion && (
            <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1 block">
              * Completa observaciones para continuar sin comprobante.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// Componente Principal
// ==========================================
const FormPreventa = ({
  estaAbierto,
  alCerrar,
  alVolver,
  planSeleccionado,
  modalidadPago,
  metodoInscripcion,
}) => {
  const [datosFormulario, setDatosFormulario] = useState({
    nombreApellido: "",
    dni: "",
    fechaNacimiento: "",
    correo: "",
    domicilio: "",
    celular: "",
  });

  const [archivoComprobante, setArchivoComprobante] = useState(null);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [estadoEnvio, setEstadoEnvio] = useState("inactivo");
  const [nombreCliente, setNombreCliente] = useState("");
  const [datosHorarios, setDatosHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

  const [pasoActivo, setPasoActivo] = useState("paso-1");

  const [mostrarAlertaComprobante, setMostrarAlertaComprobante] =
    useState(false);
  const [mostrarAlertaPasoTurno, setMostrarAlertaPasoTurno] = useState(false);
  const [
    mostrarAlertaAvanceSinComprobante,
    setMostrarAlertaAvanceSinComprobante,
  ] = useState(false);

  const [textoObservacion, setTextoObservacion] = useState("");
  const [errorObservacion, setErrorObservacion] = useState(false);
  const [observacionRequerida, setObservacionRequerida] = useState(false);

  const scrollContainerRef = useRef(null);
  const botonFinalizarRef = useRef(null);
  const observacionesRef = useRef(null);
  const cierreExitoTimeoutRef = useRef(null);

  const esMostrador = metodoInscripcion === "mostrador";
  const requiereTurno =
    planSeleccionado?.title.toLowerCase().includes("pilates") ||
    planSeleccionado?.title.toLowerCase().includes("full");

  const monto =
    modalidadPago && planSeleccionado
      ? planSeleccionado.precios[modalidadPago]
      : "";

  const datosCompletos = !!(
    datosFormulario.nombreApellido &&
    datosFormulario.dni &&
    datosFormulario.fechaNacimiento &&
    datosFormulario.correo &&
    datosFormulario.domicilio &&
    datosFormulario.celular
  );

  useEffect(() => {
    if (estaAbierto && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 10);
    }
  }, [estaAbierto, planSeleccionado, pasoActivo]);

  useEffect(() => {
    if (estaAbierto && !esMostrador && requiereTurno) {
      obtenerHorariosSede();
    }
  }, [estaAbierto, planSeleccionado, metodoInscripcion]);

  useEffect(() => {
    return () => {
      if (cierreExitoTimeoutRef.current) {
        clearTimeout(cierreExitoTimeoutRef.current);
      }
    };
  }, []);

  const resetearFormulario = () => {
    if (cierreExitoTimeoutRef.current) {
      clearTimeout(cierreExitoTimeoutRef.current);
      cierreExitoTimeoutRef.current = null;
    }

    setEstadoEnvio("inactivo");
    setNombreCliente("");
    setDatosFormulario({
      nombreApellido: "",
      dni: "",
      fechaNacimiento: "",
      correo: "",
      domicilio: "",
      celular: "",
    });
    setTurnoSeleccionado(null);
    setArchivoComprobante(null);
    setPasoActivo("paso-1");
    setMostrarAlertaComprobante(false);
    setMostrarAlertaPasoTurno(false);
    setMostrarAlertaAvanceSinComprobante(false);
    setErrorObservacion(false);
    setObservacionRequerida(false);
    setTextoObservacion("");
  };

  const manejarCerrarFormulario = () => {
    resetearFormulario();
    alCerrar();
  };

  const manejarVolverFormulario = () => {
    resetearFormulario();
    if (alVolver) {
      alVolver();
      return;
    }
    alCerrar();
  };

  const obtenerHorariosSede = async () => {
    try {
      setCargandoHorarios(true);
      const esPilates =
        planSeleccionado?.title.toLowerCase().includes("pilates") ||
        planSeleccionado?.title.toLowerCase().includes("full");

      if (!esPilates) {
        setDatosHorarios([]);
        return;
      }

      const respuesta = await axios.get(
        "http://localhost:8080/clientes-pilates/horarios-disponibles/ventas?sedeId=16",
      );
      setDatosHorarios(respuesta.data);
    } catch (error) {
      console.error("Error al traer horarios", error);
    } finally {
      setCargandoHorarios(false);
    }
  };

  if (!estaAbierto || !planSeleccionado) return null;

  const manejarCambioInput = (e) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const manejarArchivo = (e) => {
    if (e.target.files && e.target.files[0]) {
      setArchivoComprobante(e.target.files[0]);
      setErrorObservacion(false);
      setObservacionRequerida(false);
      setMostrarAlertaAvanceSinComprobante(false);

      setTimeout(() => {
        botonFinalizarRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 150);
    }
  };

  const llevarAObservaciones = () => {
    setTimeout(() => {
      observacionesRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      observacionesRef.current?.focus();
    }, 120);
  };

  const manejarCambioObservacion = (e) => {
    setTextoObservacion(e.target.value);
    if (e.target.value.trim() !== "") {
      setErrorObservacion(false);
    }
  };

  const irAlPaso = (paso) => {
    setPasoActivo(paso);
    setTimeout(() => {
      scrollContainerRef.current?.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 50);
  };

  const avanzarDesdePaso1 = () => {
    if (requiereTurno && !turnoSeleccionado) {
      setMostrarAlertaPasoTurno(true);
      return;
    }

    irAlPaso("paso-2");
  };

  const avanzarDesdePaso2 = () => {
    if (!archivoComprobante) {
      setMostrarAlertaAvanceSinComprobante(true);
      return;
    }

    irAlPaso(requiereTurno ? "paso-3" : "paso-2");
  };

  const avanzarDesdeTransferenciaSinComprobante = () => {
    setMostrarAlertaAvanceSinComprobante(false);
    irAlPaso(requiereTurno ? "paso-3" : "paso-2");
  };

  const intentarEnviar = (e) => {
    e.preventDefault();

    if (!esMostrador && !archivoComprobante) {
      if (observacionRequerida && textoObservacion.trim() !== "") {
        setErrorObservacion(false);
        procesarEnvioBackend(textoObservacion.trim());
        return;
      }

      setMostrarAlertaComprobante(true);
      return;
    }

    procesarEnvioBackend(textoObservacion.trim());
  };

  const confirmarContinuarSinComprobante = () => {
    setObservacionRequerida(true);

    if (textoObservacion.trim() === "") {
      setMostrarAlertaComprobante(false);
      setErrorObservacion(true);
      llevarAObservaciones();
      return;
    }

    setErrorObservacion(false);
    setMostrarAlertaComprobante(false);
    procesarEnvioBackend(textoObservacion);
  };

  const procesarEnvioBackend = async (observacionExtra = "") => {
    setMostrarAlertaComprobante(false);
    setEstadoEnvio("enviando");

    try {
      const turnoSeleccionadoPilates = turnoSeleccionado
        ? `${turnoSeleccionado.grp} - ${turnoSeleccionado.hhmm}`
        : null;

      const turnoCompletoPilates = turnoSeleccionado || null;

      const formData = new FormData();

      formData.append("nombre_apellido", datosFormulario.nombreApellido);
      formData.append("dni", datosFormulario.dni);
      formData.append("fecha_nacimiento", datosFormulario.fechaNacimiento);
      formData.append("correo", datosFormulario.correo);
      formData.append("domicilio", datosFormulario.domicilio);
      formData.append("celular", datosFormulario.celular);
      formData.append("monto_pactado", monto);
      formData.append("id_sede", 16);
      formData.append(
        "plan_seleccionado",
        planSeleccionado.title.toUpperCase(),
      );
      formData.append("duracion_plan", modalidadPago.toUpperCase());
      formData.append(
        "modalidad_pago",
        esMostrador ? "MOSTRADOR" : "TRANSFERENCIA",
      );
      formData.append("metodo_inscripcion", "WEB");
      formData.append("estado_contacto", "PENDIENTE");

      if (observacionExtra) {
        formData.append("observaciones", observacionExtra);
      }

      if (turnoSeleccionadoPilates) {
        formData.append("turno_seleccionado", turnoSeleccionadoPilates);
      }

      if (archivoComprobante) {
        formData.append("comprobante", archivoComprobante);
      }

      if (turnoCompletoPilates) {
        formData.append(
          "horario_id",
          JSON.stringify(turnoCompletoPilates.horario_id),
        );
      }

      const respuestaEnviarFormulario = await axios.post(
        "http://localhost:8080/preventas",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (respuestaEnviarFormulario.status === 201) {
        setEstadoEnvio("exito");
        setNombreCliente(datosFormulario.nombreApellido.toUpperCase());

        setDatosFormulario({
          nombreApellido: "",
          dni: "",
          fechaNacimiento: "",
          correo: "",
          domicilio: "",
          celular: "",
        });
        setTurnoSeleccionado(null);
        setArchivoComprobante(null);
        setTextoObservacion("");
        setErrorObservacion(false);
        setObservacionRequerida(false);
        setPasoActivo("paso-1");

        cierreExitoTimeoutRef.current = setTimeout(() => {
          manejarCerrarFormulario();
        }, 5000);
      }
    } catch (error) {
      console.error("Error al enviar formulario", error);
      setEstadoEnvio("error");
    }
  };

  const renderBotonesPaso = () => {
    if (esMostrador) {
      return (
        <button
          ref={botonFinalizarRef}
          type="submit"
          disabled={
            estadoEnvio === "enviando" ||
            (observacionRequerida && textoObservacion.trim() === "")
          }
          className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-xl md:text-2xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shrink-0"
        >
          {estadoEnvio === "enviando" ? (
            <>
              <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            "FINALIZAR INSCRIPCIÓN"
          )}
        </button>
      );
    }

    if (requiereTurno) {
      if (pasoActivo === "paso-1") {
        return (
          <button
            type="button"
            onClick={avanzarDesdePaso1}
            className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-xl md:text-2xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] transition-all flex items-center justify-center gap-3 shrink-0"
          >
            IR AL PASO 2
          </button>
        );
      }

      if (pasoActivo === "paso-2") {
        return (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              type="button"
              onClick={() => irAlPaso("paso-1")}
              className="w-full bg-white border border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-700 font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              VOLVER AL PASO 1
            </button>

            <button
              type="button"
              onClick={avanzarDesdePaso2}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] transition-all flex items-center justify-center gap-2"
            >
              IR AL PASO 3
            </button>
          </div>
        );
      }

      return (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            type="button"
            onClick={() => irAlPaso("paso-2")}
            className="w-full bg-white border border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-700 font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            VOLVER AL PASO 2
          </button>

          <button
            ref={botonFinalizarRef}
            type="submit"
            disabled={
              estadoEnvio === "enviando" ||
              (observacionRequerida && textoObservacion.trim() === "")
            }
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shrink-0"
          >
            {estadoEnvio === "enviando" ? (
              <>
                <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              "FINALIZAR INSCRIPCIÓN"
            )}
          </button>
        </div>
      );
    }

    if (pasoActivo === "paso-1") {
      return (
        <button
          type="button"
          onClick={avanzarDesdePaso2}
          className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-xl md:text-2xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] transition-all flex items-center justify-center gap-3 shrink-0"
        >
          IR AL PASO 2
        </button>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          type="button"
          onClick={() => irAlPaso("paso-1")}
          className="w-full bg-white border border-orange-200 hover:border-orange-300 hover:bg-orange-50 text-orange-700 font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2"
        >
          VOLVER AL PASO 1
        </button>

        <button
          ref={botonFinalizarRef}
          type="submit"
          disabled={
            estadoEnvio === "enviando" ||
            (observacionRequerida && textoObservacion.trim() === "")
          }
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bignoodle text-lg md:text-xl py-3.5 rounded-xl uppercase tracking-wider shadow-[0_5px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_5px_15px_rgba(234,88,12,0.5)] disabled:opacity-50 disabled:shadow-none disabled:hover:bg-orange-600 transition-all flex items-center justify-center gap-3 shrink-0"
        >
          {estadoEnvio === "enviando" ? (
            <>
              <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            "FINALIZAR INSCRIPCIÓN"
          )}
        </button>
      </div>
    );
  };

  const renderizarPasoActual = () => {
    if (esMostrador) {
      return (
        <FormularioDatos
          datos={datosFormulario}
          manejarCambio={manejarCambioInput}
          stepLabel="Completa tus datos personales"
          completado={datosCompletos}
          textoObservacion={textoObservacion}
          manejarCambioObservacion={manejarCambioObservacion}
          errorObservacion={errorObservacion}
          observacionesRef={observacionesRef}
        />
      );
    }

    if (requiereTurno) {
      if (pasoActivo === "paso-1") {
        return cargandoHorarios ? (
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-gray-200 shadow-sm gap-3">
            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">
              Actualizando cupos...
            </p>
          </div>
        ) : (
          <SelectorTurnos
            horarios={datosHorarios}
            turnoSeleccionado={turnoSeleccionado}
            planSeleccionado={planSeleccionado}
            alSeleccionarTurno={setTurnoSeleccionado}
          />
        );
      }

      if (pasoActivo === "paso-2") {
        return (
          <DatosBancarios
            monto={monto}
            stepLabel="2. Realiza la transferencia y descarga el comprobante para adjuntarlo aquí abajo"
            requiereComprobante={true}
            manejarArchivo={manejarArchivo}
            completado={!!archivoComprobante}
          />
        );
      }

      return (
        <FormularioDatos
          datos={datosFormulario}
          manejarCambio={manejarCambioInput}
          stepLabel="3. Completa tus datos"
          completado={datosCompletos}
          textoObservacion={textoObservacion}
          manejarCambioObservacion={manejarCambioObservacion}
          errorObservacion={errorObservacion}
          observacionesRef={observacionesRef}
        />
      );
    }

    if (pasoActivo === "paso-1") {
      return (
        <DatosBancarios
          monto={monto}
          stepLabel="1. Realiza la transferencia y descarga el comprobante para adjuntarlo aquí abajo"
          requiereComprobante={true}
          manejarArchivo={manejarArchivo}
          completado={!!archivoComprobante}
        />
      );
    }

    return (
      <FormularioDatos
        datos={datosFormulario}
        manejarCambio={manejarCambioInput}
        stepLabel="2. Completa tus datos"
        completado={datosCompletos}
        textoObservacion={textoObservacion}
        manejarCambioObservacion={manejarCambioObservacion}
        errorObservacion={errorObservacion}
        observacionesRef={observacionesRef}
      />
    );
  };

  return (
    <AnimatePresence>
      {estaAbierto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-gray-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-gray-200 w-full max-w-lg md:max-w-5xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden max-h-[98vh] flex flex-col relative"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full md:hidden z-20" />

            <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-gray-300 bg-white z-20 shrink-0 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.1em] mb-0.5 max-w-[280px] md:max-w-full leading-tight">
                  Preventa Exclusiva
                </span>
                <h3 className="text-gray-900 font-bignoodle text-xl md:text-2xl uppercase leading-none tracking-wider mt-1">
                  {planSeleccionado.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 self-start md:self-center -mt-2 md:mt-0">
                {alVolver && (
                  <button
                    type="button"
                    onClick={manejarVolverFormulario}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-orange-700 transition-colors hover:bg-orange-100 hover:border-orange-300"
                  >
                    <FiArrowLeft className="text-sm" />
                    Planes
                  </button>
                )}

                <button
                  type="button"
                  onClick={manejarCerrarFormulario}
                  className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
            </div>

            <form
              onSubmit={intentarEnviar}
              noValidate
              className="overflow-hidden flex flex-col flex-1 relative min-h-0"
            >
              {!esMostrador && estadoEnvio !== "exito" && (
                <StepperProgreso
                  pasoActivo={pasoActivo}
                  requiereTurno={requiereTurno}
                />
              )}

              <div
                ref={scrollContainerRef}
                className="overflow-y-auto flex-1 p-4 md:p-6 pb-10 custom-scrollbar relative"
              >
                {estadoEnvio === "exito" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 h-full flex flex-col items-center justify-center bg-white rounded-xl shadow-sm"
                  >
                    <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                      <span className="text-4xl text-green-500">✓</span>
                    </div>
                    <h4 className="text-2xl font-bignoodle uppercase text-gray-900 mb-2 tracking-wide">
                      ¡Pre-inscripción completada!
                    </h4>
                    <p className="text-gray-600 text-sm px-4">
                      {esMostrador
                        ? "Pronto nos pondremos en contacto contigo."
                        : `${nombreCliente}, tu pre-inscripción ha sido recibida correctamente. Si tienes alguna consulta, no dudes en contactarnos. ¡Gracias por elegirnos!`}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="pt-2">{renderizarPasoActual()}</div>
                    {renderBotonesPaso()}
                  </>
                )}
              </div>

              <AnimatePresence>
                {mostrarAlertaComprobante && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, y: 20, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md flex flex-col"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                          <FiAlertCircle className="text-3xl" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bignoodle uppercase text-gray-900 tracking-wide mb-2">
                          Falta el comprobante
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                          No has cargado el comprobante de transferencia. Si
                          continúas sin archivo, debes completar el campo
                          observaciones para finalizar.
                          <br />
                          <br />
                          ¿Quieres continuar?
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <button
                            type="button"
                            onClick={() => setMostrarAlertaComprobante(false)}
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                          >
                            Volver y cargar
                          </button>
                          <button
                            type="button"
                            onClick={confirmarContinuarSinComprobante}
                            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_4px_12px_rgba(234,88,12,0.3)]"
                          >
                            Sí, continuar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mostrarAlertaPasoTurno && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, y: 20, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md flex flex-col"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                          <FiAlertCircle className="text-3xl" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bignoodle uppercase text-gray-900 tracking-wide mb-2">
                          Falta un paso
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                          por favor selecciona tu horario
                        </p>

                        <button
                          type="button"
                          onClick={() => setMostrarAlertaPasoTurno(false)}
                          className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_4px_12px_rgba(234,88,12,0.3)]"
                        >
                          Entendido
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {mostrarAlertaAvanceSinComprobante && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.9, y: 20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.9, y: 20, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md flex flex-col"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4 border border-orange-100">
                          <FiAlertCircle className="text-3xl" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bignoodle uppercase text-gray-900 tracking-wide mb-2">
                          Aviso
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                          Para poder realizar la inscripcion, debes adjuntar tu
                          comprobante de pago o transferencia
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                          <button
                            type="button"
                            onClick={() =>
                              setMostrarAlertaAvanceSinComprobante(false)
                            }
                            className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                          >
                            Subir comprobante
                          </button>
                          <button
                            type="button"
                            onClick={avanzarDesdeTransferenciaSinComprobante}
                            className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_4px_12px_rgba(234,88,12,0.3)]"
                          >
                            Avanzar igual
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FormPreventa;
