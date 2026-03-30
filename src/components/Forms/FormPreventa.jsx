import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCheck,
  FiUploadCloud,
  FiFileText,
  FiChevronDown,
  FiAlertCircle,
} from "react-icons/fi";
import axios from "axios";
import { set } from "date-fns";

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
      <div className="flex items-center justify-between w-full max-w-[300px]  relative">
        {/* Línea de fondo */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 rounded-full"></div>

        {pasos.map((paso, index) => {
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
  horarios,
  turnoSeleccionado,
  planSeleccionado,
  alSeleccionarTurno,
}) => {
  const esPaseFull = planSeleccionado?.title?.toLowerCase().includes("full");
  const planId = planSeleccionado?.id?.toLowerCase();

  const [grupoFullSeleccionado, setGrupoFullSeleccionado] = useState("LMV");
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {esPaseFull && (
        <div className="flex flex-col gap-2">
          {/* Aquí aplicamos la lógica de completado para el título 1 (Siempre completado si hay un grupo por defecto) */}
          <p
            className={`text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1 ${grupoFullSeleccionado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
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
        {/* Lógica de color y tilde para el paso de horario */}
        <p
          className={`text-[10px] md:text-xs uppercase tracking-wider mb-0.5 flex items-center gap-1 ${turnoSeleccionado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
        >
          {turnoSeleccionado ? (
            <FiCheck className="text-sm shrink-0" />
          ) : esPaseFull ? (
            "2. "
          ) : (
            "1. "
          )}
          Seleccioná tu horario
        </p>

        {/* Botón del desplegable */}
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

          {/* Lista de horarios animada */}
          <AnimatePresence>
            {menuAbierto && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: "auto", opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden absolute w-full z-20 mt-1 shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white rounded-xl border border-gray-200"
              >
                <div className="flex flex-col gap-1 p-2 max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {/* ... (horariosFiltrados se usaría aquí. Omitido el map para no alargar innecesariamente, tu map es idéntico) */}
                  {horarios.map((horario) => {
                    const cuposDisponibles =
                      horario.cupo_por_clase - horario.total_inscriptos - 2;
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
                        key={horario.hhmm + horario.grp}
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
                              className={`${esPaseFull ? "block" : "hidden"} text-[10px] uppercase font-extrabold tracking-wide ${
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
                            className={`${!esPaseFull ? "block" : "hidden"} text-[10px] uppercase font-extrabold tracking-wide ${
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
                  })}
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

  // Separo el número y el texto real del título
  const textoLimpio = stepLabel?.replace(/^\d+\.\s*/, "");
  const numero = stepLabel?.match(/^\d+\.\s*/)?.[0] || "";

  return (
    <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p
        className={`text-[10px] md:text-xs uppercase tracking-wider mb-1 flex items-center gap-1 ${completado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
      >
        {completado ? <FiCheck className="text-sm shrink-0" /> : numero}
        {textoLimpio || "Descargá el comprobante para adjuntarlo aquí abajo"}
      </p>

      <div className="flex items-center justify-between text-left gap-3 mb-2">
        <div className="flex flex-row items-center gap-x-2">
          <p className="text-gray-500 text-xs">Monto a transferir:</p>
          <p className="text-3xl font-bignoodle text-orange-600 tracking-widest leading-none">
            ${monto}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-lg border border-gray-200">
          <div>
            <p className="text-[9px] text-gray-500 uppercase font-bold leading-none">
              CBU
            </p>
            <p className="text-sm text-gray-900 font-mono tracking-tighter">
              123123123213
            </p>
          </div>
          <button
            type="button"
            onClick={() => copiarAlPortapapeles("123123123213", "cbu")}
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
            <p className="text-sm text-gray-900 font-mono">apsdapsd</p>
          </div>
          <button
            type="button"
            onClick={() => copiarAlPortapapeles("apsdapsd", "alias")}
            className="text-[10px] bg-orange-100 hover:bg-orange-200 text-orange-700 font-semibold px-3.5 py-1.5 rounded-lg transition-all border border-orange-200"
          >
            {copiado === "alias" ? "Listo!" : "Copiar"}
          </button>
        </div>

        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-left">
          <p className="text-[9px] text-gray-500 uppercase font-bold leading-none">
            Titular
          </p>
          <p className="text-sm text-gray-900 font-semibold">Hammerx SAS</p>
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
const FormularioDatos = ({ datos, manejarCambio, stepLabel, completado }) => {
  const textoLimpio = stepLabel?.replace(/^\d+\.\s*/, "");
  const numero = stepLabel?.match(/^\d+\.\s*/)?.[0] || "";

  return (
    <div className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p
        className={`text-[10px] md:text-xs uppercase tracking-wider mb-1 flex items-center gap-1 ${completado ? "text-orange-600 font-semibold" : "text-gray-500 font-bold"}`}
      >
        {completado ? <FiCheck className="text-sm shrink-0" /> : numero}
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
            required
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
  const [datosHorarios, setDatosHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(true);

  // Estados para el Stepper y validaciones
  const [pasoActivo, setPasoActivo] = useState("paso-1");

  // ESTADOS PARA ALERTA DE COMPROBANTE
  const [mostrarAlertaComprobante, setMostrarAlertaComprobante] =
    useState(false);
  const [faseObservacion, setFaseObservacion] = useState(false);
  const [textoObservacion, setTextoObservacion] = useState("");
  const [errorObservacion, setErrorObservacion] = useState(false);

  // Referencias
  const paso1Ref = useRef(null);
  const paso2Ref = useRef(null);
  const paso3Ref = useRef(null);
  const scrollContainerRef = useRef(null);
  const botonFinalizarRef = useRef(null);

  const esMostrador = metodoInscripcion === "mostrador";
  const requiereTurno =
    planSeleccionado?.title.toLowerCase().includes("pilates") ||
    planSeleccionado?.title.toLowerCase().includes("full");
  const monto =
    modalidadPago && planSeleccionado
      ? planSeleccionado.precios[modalidadPago]
      : "";

  // Auxiliar para saber si los datos están completos (para el color verde y el scroll)
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
  }, [estaAbierto, planSeleccionado]);

  useEffect(() => {
    if (estaAbierto && !esMostrador && requiereTurno) {
      obtenerHorariosSede();
    }
  }, [estaAbierto, planSeleccionado, metodoInscripcion]);

  const manejarScroll = () => {
    if (!estaAbierto || esMostrador || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollTop = container.scrollTop;

    if (scrollTop < 50) {
      setPasoActivo("paso-1");
      return;
    }

    const estaEnElFondo =
      Math.abs(
        container.scrollHeight - container.scrollTop - container.clientHeight,
      ) < 15;
    if (estaEnElFondo) {
      setPasoActivo(requiereTurno ? "paso-3" : "paso-2");
      return;
    }

    const getPosicion = (ref) => {
      if (!ref.current) return Infinity;
      return (
        ref.current.getBoundingClientRect().top -
        container.getBoundingClientRect().top
      );
    };

    const top2 = getPosicion(paso2Ref);
    const top3 = requiereTurno ? getPosicion(paso3Ref) : Infinity;

    const margenActivo = 180;

    if (requiereTurno) {
      if (top3 <= margenActivo) {
        setPasoActivo("paso-3");
      } else if (top2 <= margenActivo) {
        setPasoActivo("paso-2");
      } else {
        setPasoActivo("paso-1");
      }
    } else {
      if (top2 <= margenActivo) {
        setPasoActivo("paso-2");
      } else {
        setPasoActivo("paso-1");
      }
    }
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
        "http://localhost:8080/clientes-pilates/horarios-disponibles/ventas?sedeId=13",
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

      // Scroll hacia el elemento que falta completar o hacia el botón de finalizar
      setTimeout(() => {
        if (requiereTurno) {
          if (!turnoSeleccionado && !esMostrador) {
            paso1Ref.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else if (!datosCompletos) {
            paso3Ref.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            botonFinalizarRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        } else {
          // Si son 2 pasos (sin turno)
          if (!datosCompletos) {
            paso2Ref.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          } else {
            botonFinalizarRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }, 150);
    }
  };

  // Función intermedia para interceptar el envío si falta el comprobante
  const intentarEnviar = (e) => {
    e.preventDefault();

    if (!esMostrador && !archivoComprobante) {
      setMostrarAlertaComprobante(true);
      return;
    }

    // Si todo está bien, se envía normalmente (sin observación obligatoria)
    return;
    procesarEnvioBackend("");
  };

  //  Función para confirmar envío con observación desde el modal
  const confirmarEnvioConObservacion = () => {
    if (textoObservacion.trim() === "") {
      setErrorObservacion(true);
      return;
    }
    setErrorObservacion(false);

    return;
    procesarEnvioBackend(textoObservacion);
  };

  // Lógica real de envío a la API (refactorizada)
  const procesarEnvioBackend = async (observacionExtra = "") => {
    setMostrarAlertaComprobante(false);
    setFaseObservacion(false);
    setEstadoEnvio("enviando");

    try {
      const turnoSeleccionadoPilates = turnoSeleccionado
        ? `${turnoSeleccionado.grp} - ${turnoSeleccionado.hhmm}`
        : null;

      const formData = new FormData();

      formData.append("nombre_apellido", datosFormulario.nombreApellido);
      formData.append("dni", datosFormulario.dni);
      formData.append("fecha_nacimiento", datosFormulario.fechaNacimiento);
      formData.append("correo", datosFormulario.correo);
      formData.append("domicilio", datosFormulario.domicilio);
      formData.append("celular", datosFormulario.celular);
      formData.append("monto_pactado", monto);
      formData.append("id_sede", 54);
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

      // Agregamos la observación generada en el Custom Modal
      if (observacionExtra) {
        formData.append("observaciones", observacionExtra);
      }

      if (turnoSeleccionadoPilates) {
        formData.append("turno_seleccionado", turnoSeleccionadoPilates);
      }

      if (archivoComprobante) {
        formData.append("comprobante", archivoComprobante);
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
        setPasoActivo("paso-1");

        setTimeout(() => {
          alCerrar();
        }, 2000);
      }
    } catch (error) {
      console.error("Error al enviar formulario", error);
      setEstadoEnvio("error");
    }
  };

  const renderizarPasosApilados = () => {
    if (esMostrador) {
      return (
        <FormularioDatos
          datos={datosFormulario}
          manejarCambio={manejarCambioInput}
          stepLabel="Completa tus datos personales"
          completado={datosCompletos}
        />
      );
    }

    return (
      <div className="flex flex-col gap-2 pt-2">
        {/* Paso 1: Turno (si requiere) o Transferencia (si no requiere turno) */}
        <div id="paso-1" ref={paso1Ref} className="scroll-mt-[120px]">
          {requiereTurno ? (
            cargandoHorarios ? (
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
            )
          ) : (
            <DatosBancarios
              monto={monto}
              stepLabel="1. Descargá el comprobante para adjuntarlo aquí abajo"
              requiereComprobante={true}
              manejarArchivo={manejarArchivo}
              completado={!!archivoComprobante}
            />
          )}
        </div>

        {/* Paso 2: Transferencia (si requiere turno) o Datos (si no requiere turno) */}
        <div id="paso-2" ref={paso2Ref} className="scroll-mt-[120px]">
          {requiereTurno ? (
            <DatosBancarios
              monto={monto}
              stepLabel="2. Descargá el comprobante para adjuntarlo aquí abajo"
              requiereComprobante={true}
              manejarArchivo={manejarArchivo}
              completado={!!archivoComprobante}
            />
          ) : (
            <FormularioDatos
              datos={datosFormulario}
              manejarCambio={manejarCambioInput}
              stepLabel="2. Completa tus datos"
              completado={datosCompletos}
            />
          )}
        </div>

        {/* Paso 3: Datos (Solo si requiere turno) */}
        {requiereTurno && (
          <div id="paso-3" ref={paso3Ref} className="scroll-mt-[120px]">
            <FormularioDatos
              datos={datosFormulario}
              manejarCambio={manejarCambioInput}
              stepLabel="3. Completa tus datos"
              completado={datosCompletos}
            />
          </div>
        )}
      </div>
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

            {/* Header */}
            <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-gray-300 bg-white  z-20 shrink-0 shadow-sm">
              <div className="flex flex-col">
                <span className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.1em] mb-0.5 max-w-[280px] md:max-w-full leading-tight">
                  {esMostrador
                    ? "Deja tus datos y sé el primero en enterarte cuando esté disponible"
                    : "Preventa Exclusiva"}
                </span>
                <h3 className="text-gray-900 font-bignoodle text-xl md:text-2xl uppercase leading-none tracking-wider mt-1">
                  {planSeleccionado.title}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEstadoEnvio("inactivo");
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
                  setTextoObservacion("");
                  alCerrar();
                }}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all self-start md:self-center -mt-2 md:mt-0"
              >
                <span className="text-lg">✕</span>
              </button>
            </div>

            <form
              onSubmit={intentarEnviar} // NUEVO: Llamamos a la validación en lugar de enviar directo
              className="overflow-hidden flex flex-col flex-1 relative min-h-0"
            >
              {/* Stepper */}
              {!esMostrador && estadoEnvio !== "exito" && (
                <StepperProgreso
                  pasoActivo={pasoActivo}
                  requiereTurno={requiereTurno}
                />
              )}

              {/* Contenedor scrolleable principal */}
              <div
                ref={scrollContainerRef}
                onScroll={manejarScroll}
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
                        : "Se abrirá WhatsApp para finalizar el proceso."}
                    </p>
                  </motion.div>
                ) : (
                  <>
                    {renderizarPasosApilados()}

                    {/* Botón de envío final */}
                    <button
                      ref={botonFinalizarRef}
                      type="submit"
                      disabled={
                        estadoEnvio === "enviando" ||
                        (requiereTurno && !esMostrador && !turnoSeleccionado)
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
                  </>
                )}
              </div>

              {/* ======================================================== */}
              {/* ALERTA INTERNA CUSTOMIZADA (SIN WINDOW.CONFIRM) */}
              {/* ======================================================== */}
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
                      {!faseObservacion ? (
                        // FASE 1: Advertencia de falta de comprobante
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                            <FiAlertCircle className="text-3xl" />
                          </div>
                          <h3 className="text-xl md:text-2xl font-bignoodle uppercase text-gray-900 tracking-wide mb-2">
                            Falta el comprobante
                          </h3>
                          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                            No has cargado el comprobante de transferencia. Para
                            agilizar tu inscripción, te recomendamos adjuntarlo.{" "}
                            <br />
                            <br /> ¿Quieres enviar tu inscripción de todas
                            formas?
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
                              onClick={() => setFaseObservacion(true)}
                              className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_4px_12px_rgba(234,88,12,0.3)]"
                            >
                              Sí, continuar sin archivo
                            </button>
                          </div>
                        </div>
                      ) : (
                        // FASE 2: Input de observación obligatoria
                        <div className="flex flex-col text-left">
                          <h3 className="text-xl md:text-2xl font-bignoodle uppercase text-gray-900 tracking-wide mb-2 flex items-center gap-2">
                            <FiFileText className="text-orange-600" /> Añadir
                            Observación
                          </h3>
                          <p className="text-gray-600 text-xs mb-4">
                            Por favor, indícanos por qué envías la inscripción
                            sin el comprobante (Ej: "Abono en efectivo en
                            recepción", "Transferencia demorada", etc.).
                          </p>

                          <textarea
                            value={textoObservacion}
                            onChange={(e) => {
                              setTextoObservacion(e.target.value);
                              if (e.target.value.trim() !== "")
                                setErrorObservacion(false);
                            }}
                            placeholder="Escribe tu observación aquí..."
                            className={`w-full h-24 bg-gray-50 border rounded-xl p-3 text-sm text-gray-900 resize-none outline-none transition-all placeholder-gray-400 ${
                              errorObservacion
                                ? "border-red-400 ring-1 ring-red-400 bg-red-50/50"
                                : "border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            }`}
                          />
                          {errorObservacion && (
                            <span className="text-red-500 text-[10px] font-bold uppercase mt-1 ml-1">
                              * Este campo es obligatorio para continuar.
                            </span>
                          )}

                          <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                            <button
                              type="button"
                              onClick={() => {
                                setMostrarAlertaComprobante(false);
                                setFaseObservacion(false);
                                setTextoObservacion("");
                                setErrorObservacion(false);
                              }}
                              className="flex-1 py-3 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl text-sm transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={confirmarEnvioConObservacion}
                              className="flex-1 py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-[0_4px_12px_rgba(234,88,12,0.3)]"
                            >
                              Enviar inscripción
                            </button>
                          </div>
                        </div>
                      )}
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
