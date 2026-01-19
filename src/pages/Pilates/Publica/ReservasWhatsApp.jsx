import React, { useState, useEffect } from "react";
import FooterV2 from "../../../components/footer/FooterV2";
import { NavLink } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { sedes } from "../../../components/ModalContactoSede";
import {
  MapPin,
  Calendar,
  Clock,
  Info,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";
import { FaWhatsapp, FaHandPointer } from "react-icons/fa";
import { logo } from "../../../images/svg/index";
import fondoPilates from "../img/reservas-pilates-fondo.jpeg";

// --- VARIANTS DE ANIMACIÓN (Configuración de movimientos) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }, // Efecto cascada
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50 } },
};

const ReservasWhatsApp = () => {
  const reduceMotion = useReducedMotion();
  const motionInitialVariant = reduceMotion ? false : "hidden";

  // --- 1. ESTADOS ---
  const [paso, setPaso] = useState(1); // 1: Selección Sede, 2: Selección Horario
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null); // Objeto completo de la sede
  const [listaHorarios, setListaHorarios] = useState([]);

  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // Flag unificado para mostrar overlay de carga cuando hay fetch en curso.
  const isLoading = cargandoSedes || cargandoHorarios;

  const [filtroGrupo, setFiltroGrupo] = useState(null);

  // --- 2. EFECTOS ---

  // Cargar Sedes al iniciar
  useEffect(() => {
    const cargarSedes = async () => {
      try {
        const respuesta = await axios.get(`http://localhost:8080/sedes/ciudad`);

        const sedesConPilates = respuesta.data
          .filter((sede) => sede.nombre.toLowerCase() !== "multisede")
          .map((sede) => ({
            ...sede,
            telefono:
              sede.telefono ||
              sedes.find(
                (s) =>
                  s.nombre.toUpperCase().trim() ===
                  sede.nombre.toUpperCase().trim()
              )?.numero ||
              "",
          }));
        setSedesDisponibles(sedesConPilates);
      } catch (error) {
        console.error("Error cargando sedes:", error);
      } finally {
        setCargandoSedes(false);
      }
    };
    cargarSedes();
  }, []);

  // Cargar Horarios cuando se elige una sede (Paso 2)
  useEffect(() => {
    if (sedeSeleccionada && paso === 2) {
      const cargarHorarios = async () => {
        setCargandoHorarios(true);
        try {
          const url = `http://localhost:8080/clientes-pilates/horarios-disponibles/ventas?sedeId=${sedeSeleccionada.id}`;
          const respuesta = await axios.get(url);
          setListaHorarios(respuesta.data);
        } catch (error) {
          console.error("Error cargando horarios:", error);
        } finally {
          setCargandoHorarios(false);
        }
      };
      cargarHorarios();
    }
  }, [sedeSeleccionada, paso]);

  // --- 3. FUNCIONES DE LÓGICA ---

  const seleccionarSede = (sede) => {
    setSedeSeleccionada(sede);
    setPaso(2); // Avanzamos al paso 2
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const volverAlInicio = () => {
    setPaso(1);
    setSedeSeleccionada(null);
    setListaHorarios([]); // Limpiamos para que no se vea lo anterior al volver
    setFiltroGrupo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const horariosFiltrados = listaHorarios.filter(
    (item) => item.grp === filtroGrupo && item.tipo_bloqueo === false
  );

  const calcularDisponibilidad = (cupoTotal, inscriptos) => {
    const libres = cupoTotal - inscriptos;
    return libres < 0 ? 0 : libres;
  };

  const formatearHoraAmPm = (hhmm) => {
    if (!hhmm || typeof hhmm !== "string") return "";
    const match = hhmm.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return hhmm;

    const horas24 = Number(match[1]);
    const minutos = match[2];
    if (Number.isNaN(horas24)) return hhmm;

    const sufijo = horas24 >= 12 ? "pm" : "am";
    // Mostrar SIEMPRE en formato 24hs pero con am/pm
    return `${String(horas24).padStart(2, "0")}:${minutos} ${sufijo}`;
  };

  const reservarTurno = (horario) => {
    const numeroLimpio = `${sedeSeleccionada?.telefono || ""}`.replace(
      /\D/g,
      ""
    );
    if (!numeroLimpio) {
      console.error("No hay un teléfono válido para la sede seleccionada.");
      return;
    }

    const numeroWhatsapp = numeroLimpio.startsWith("549")
      ? numeroLimpio
      : `549${numeroLimpio}`;

    const horaFormateada = formatearHoraAmPm(horario?.hhmm);
    const mensaje = [
      "Hola Hammerx! 💪",
      "Me gustaría reservar una clase de PILATES.",
      `📍 Sede: ${sedeSeleccionada.nombre}`,
      `📅 Días: ${
        horario.grupo_label === "Lunes-Miercoles-Viernes"
          ? "Lunes-Miércoles-Viernes"
          : "Martes-Jueves"
      }`,
      `⏰ Horario: ${horaFormateada}`,
      "Quedo atento a la confirmación. Muchas gracias!",
    ].join("\n");

    const link = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(link, "_blank");
  };

  // --- 4. RENDERIZADO ---

  return (
    <div className="bg-gray-100 text-gray-900 font-sans selection:bg-orange-200 flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3 border border-gray-200">
            <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-semibold text-gray-700">
              Cargando datos...
            </div>
          </div>
        </div>
      )}

      {/* HEADER FIJO SUPERIOR (Identidad de marca) */}
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Hammerx" className="h-10 object-contain" />
          <h1 className="text-2xl font-bignoodle text-orange-600 tracking-wide hidden sm:block">
            RESERVAS ONLINE
          </h1>
        </NavLink>

        {/* Si estamos en el paso 2, mostramos en qué sede estamos */}
        {paso === 2 && sedeSeleccionada && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full"
          >
            <MapPin size={16} className="text-orange-600" />
            <span className="text-gray-700 uppercase">
              {sedeSeleccionada.nombre}
            </span>
          </motion.div>
        )}
      </header>

      {/* Stepper / Progreso */}
      <div className="bg-white/70 sm:bg-white/80 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* --- PASO 1 --- */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                  paso === 1
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-orange-600 border-orange-200"
                }`}
              >
                1
              </div>
              <div className="leading-tight">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Paso 1
                </div>
                {/* Texto principal siempre visible*/}
                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                  Elegí tu sede
                </div>
              </div>
            </div>

            {/* --- BARRA PROGRESIVA (Ahora visible en mobile) --- */}
            <div className="flex-1 mx-2 sm:mx-4 min-w-[1rem]">
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full bg-orange-600"
                  initial={false}
                  animate={{ width: paso === 1 ? "0%" : "100%" }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: "easeOut" }
                  }
                />
              </div>
            </div>

            {/* --- PASO 2 --- */}
            <div
              className={`flex items-center gap-2 sm:gap-3 ${
                paso === 1 ? "opacity-50" : "opacity-100"
              }`}
            >
              {/* Texto del Paso 2*/}
              <div className="leading-tight text-right block">
                {/* Ocultamos "Paso 2" en mobile */}
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Paso 2
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                  Días y horario
                </div>
              </div>

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                  paso === 2
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-gray-400 border-gray-200"
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <main
        className={`flex-1 w-full transition-all duration-300 ${
          paso === 1 ? "p-0 max-w-full" : "lg:max-w-[97%] mx-auto p-4 md:p-8"
        }`}
      >
        <AnimatePresence mode="wait">
          {/* ==================================================
                PASO 1: SELECCIÓN DE SEDE 
               ================================================== */}
          {paso === 1 && (
            <motion.div
              key="paso1"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full flex flex-col items-center justify-center min-h-[calc(100vh-130px)] overflow-hidden"
            >
              {/* --- FONDO --- */}
              <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={fondoPilates}
                  alt="Fondo Pilates"
                  className="w-full h-full object-cover filter blur-[2px] sm:blur-[5px] scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/20" />
              </motion.div>

              {/* --- CONTENIDO  --- */}
              <div className="relative z-10 w-full flex flex-col items-center px-4 py-10">
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-8 md:mb-10"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                    Reservas Pilates
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bignoodle font-bold text-gray-900 mb-2">
                    ¡Elegí tu sede más cercana!
                  </h2>
                  <p className="text-orange-600 max-w-xl font-bold">
                    Elegí sede, días y horario.
                  </p>
                </motion.div>

                {cargandoSedes ? (
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial={motionInitialVariant}
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full max-w-4xl md:max-w-5xl"
                  >
                    {sedesDisponibles.map((sede) => (
                      <motion.button
                        key={sede.id}
                        variants={itemVariants}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                scale: 1.03,
                                y: -5,
                                boxShadow: "0px 10px 20px rgba(0,0,0,0.1)",
                              }
                        }
                        whileTap={{ scale: 0.98 }}
                        onClick={() => seleccionarSede(sede)}
                        disabled={isLoading}
                        className={`group bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 hover:border-orange-500 transition-colors duration-300 text-left relative overflow-hidden shadow-sm ${
                          isLoading ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-50 via-white to-white" />
                        <div className="absolute -top-2 -right-2 md:top-0 md:right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <MapPin
                            size={60}
                            className="text-orange-600 rotate-12 md:hidden"
                          />
                          <MapPin
                            size={100}
                            className="text-orange-600 rotate-12 hidden md:block"
                          />
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-2xl md:text-3xl font-bignoodle text-gray-900 group-hover:text-orange-600 transition-colors leading-none">
                            {sede.nombre.toUpperCase()}
                          </h3>
                          <p className="text-gray-500 mt-1 md:mt-2 text-xs md:text-sm flex items-center gap-1 md:gap-2">
                            <span className="md:hidden">Ver horarios</span>
                            <span className="hidden md:inline">
                              Ver horarios disponibles
                            </span>
                            <ArrowRight size={14} className="md:hidden" />
                            <ArrowRight
                              size={16}
                              className="hidden md:inline"
                            />
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================================================
                PASO 2: FORMULARIO DE RESERVA
               ================================================== */}
          {paso === 2 && (
            <motion.div
              key="paso2"
              initial={
                reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="w-full"
            >
              {/* Botón volver */}
              <motion.button
                whileHover={reduceMotion ? undefined : { x: -5 }}
                onClick={volverAlInicio}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 mb-6 font-medium transition-colors border-2 border-gray-100 bg-white px-3 py-2 rounded-2xl shadow-sm hover:border-orange-500"
              >
                <ChevronLeft size={20} />
                Volver atrás
              </motion.button>

              <div className="flex flex-col lg:flex-row gap-8 w-full">
                {/* PANEL IZQUIERDO: FILTROS */}
                <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                  <motion.div
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24"
                    initial={false}
                    animate={
                      reduceMotion
                        ? { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
                        : !filtroGrupo
                        ? { boxShadow: "0 0 0 4px rgba(249,115,22,0.12)" }
                        : { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0 }
                        : { duration: 0.35, ease: "easeOut" }
                    }
                  >
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
                      Seleccioná tu plan
                    </label>
                    <div className="space-y-3">
                      {/* --- BOTÓN LUNES / MIÉRCOLES / VIERNES --- */}
                      <motion.button
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        onClick={() => setFiltroGrupo("LMV")}
                        className={`w-full p-2 rounded-xl text-left transition-all duration-200 border-2 relative overflow-hidden ${
                          filtroGrupo === "LMV"
                            ? "bg-orange-600 border-orange-600 text-white shadow-lg"
                            : "bg-gray-50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="font-bold text-xl relative z-10">
                          Lunes / Miércoles / Viernes
                        </div>
                        <div
                          className={`text-xs relative z-10 ${
                            filtroGrupo === "LMV"
                              ? "text-orange-100"
                              : "text-gray-400"
                          }`}
                        >
                          Con este plan entrenas 3 veces por semana.
                        </div>

                        {/* --- MANITO ANIMADA (REACT ICONS) --- */}
                        <motion.div
                          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 ${
                            filtroGrupo === "LMV"
                              ? "text-orange-100"
                              : "text-orange-500"
                          }`}
                          animate={{
                            scale: [1, 0.8, 1],
                            rotate: [0, -10, 0], // Le agregué una rotación sutil para que parezca más natural
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          {/* Le doy un rotate-90 o 45 si queres que apunte desde otro lado, 
                              pero por defecto apunta bien hacia el texto si esta a la derecha */}
                          <FaHandPointer
                            size={24}
                            className="transform -rotate-45"
                          />
                        </motion.div>
                      </motion.button>

                      {/* --- BOTÓN MARTES / JUEVES --- */}
                      <motion.button
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        onClick={() => setFiltroGrupo("MJ")}
                        className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 relative overflow-hidden pr-12 ${
                          filtroGrupo === "MJ"
                            ? "bg-orange-600 border-orange-600 text-white shadow-lg"
                            : "bg-gray-50 border-transparent text-gray-600 hover:bg-white hover:border-gray-200"
                        }`}
                      >
                        <div className="font-bold text-xl relative z-10">
                          Martes / Jueves
                        </div>
                        <div
                          className={`text-xs relative z-10 ${
                            filtroGrupo === "MJ"
                              ? "text-orange-100"
                              : "text-gray-400"
                          }`}
                        >
                          Con este plan entrenas 2 veces por semana.
                        </div>

                        {/* --- MANITO ANIMADA (REACT ICONS) --- */}
                        <motion.div
                          className={`absolute right-4 top-1/2 -translate-y-1/2 z-20 ${
                            filtroGrupo === "MJ"
                              ? "text-orange-100"
                              : "text-orange-500"
                          }`}
                          animate={{
                            scale: [1, 0.8, 1],
                            rotate: [0, -10, 0],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <FaHandPointer
                            size={24}
                            className="transform -rotate-45"
                          />
                        </motion.div>
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

                {/* PANEL DERECHO: GRILLA */}
                <div className="w-full lg:flex-1 lg:min-w-0">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="text-orange-600" size={24} />
                      <span className="font-bignoodle text-3xl tracking-wide">
                        HORARIOS
                      </span>
                    </h2>
                  </div>

                  {cargandoHorarios ? (
                    <div className="py-10">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400">
                          Buscando cupos en {sedeSeleccionada.nombre}...
                        </p>
                      </div>
                      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse"
                          >
                            <div className="flex items-start justify-between mb-6">
                              <div className="h-9 w-9 rounded-lg bg-gray-100" />
                              <div className="h-5 w-24 rounded-full bg-gray-100" />
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full mb-4" />
                            <div className="h-10 w-24 bg-gray-100 rounded mx-auto" />
                            <div className="h-3 w-32 bg-gray-100 rounded mx-auto mt-3" />
                            <div className="h-10 w-full bg-gray-100 rounded-xl mt-6" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 w-full"
                      variants={containerVariants}
                      initial={motionInitialVariant}
                      animate="visible"
                      layout
                    >
                      {!filtroGrupo ? (
                        <motion.div
                          variants={itemVariants}
                          className="col-span-full py-12 text-center border-2 border-dashed border-orange-200 rounded-2xl bg-orange-50"
                        >
                          <Calendar className="w-12 h-12 text-orange-400 mx-auto mb-3" />
                          <p className="text-orange-800 font-bold text-lg">
                            ¡Primero selecciona tus días!
                          </p>
                        </motion.div>
                      ) : horariosFiltrados.length === 0 ? (
                        <motion.div
                          variants={itemVariants}
                          className="col-span-full py-12 text-center border-2 border-dashed border-gray-300 rounded-2xl bg-white"
                        >
                          <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">
                            No hay clases disponibles en este grupo.
                          </p>
                        </motion.div>
                      ) : (
                        horariosFiltrados.map((item, index) => {
                          const cuposLibres = calcularDisponibilidad(
                            item.cupo_por_clase,
                            item.total_inscriptos
                          );
                          const lleno = cuposLibres === 0;
                          return (
                            <motion.div
                              key={index}
                              variants={itemVariants}
                              whileHover={
                                !lleno && !reduceMotion
                                  ? {
                                      y: -5,
                                      boxShadow:
                                        "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                                    }
                                  : {}
                              }
                              layout
                              className={`relative bg-white rounded-2xl p-2 min-[380px]:p-3 sm:p-5 border transition-colors flex flex-col gap-2 sm:gap-0 ${
                                lleno
                                  ? "border-gray-100 opacity-60 grayscale bg-gray-50"
                                  : "border-gray-200 hover:border-orange-400"
                              }`}
                            >
                              {/* Layout ultra compacto para mobile: todo en una línea */}
                              <div className="sm:hidden flex items-center gap-2 justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <div
                                    className={`p-2 rounded-lg flex-shrink-0 ${
                                      lleno
                                        ? "bg-gray-200"
                                        : "bg-orange-50 text-orange-600"
                                    }`}
                                  >
                                    <Clock size={16} />
                                  </div>
                                  <div className="flex-1 min-w-0 leading-tight">
                                    <div className="text-lg font-bignoodle text-gray-900 tracking-wide leading-none truncate">
                                      {formatearHoraAmPm(item.hhmm)}
                                    </div>
                                    {/* <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest truncate">
                                      {item.grupo_label ===
                                      "Lunes-Miercoles-Viernes"
                                        ? "Lunes-Miércoles-Viernes"
                                        : "Martes-Jueves"}
                                    </div> */}
                                    <div className="text-[11px] text-gray-500">
                                      {lleno
                                        ? "Sin cupos"
                                        : `${cuposLibres} cupos disponibles`}
                                    </div>
                                  </div>
                                </div>
                                <motion.button
                                  whileTap={
                                    reduceMotion || lleno
                                      ? undefined
                                      : { scale: 0.95 }
                                  }
                                  onClick={() => reservarTurno(item)}
                                  disabled={lleno || isLoading}
                                  className={`flex-shrink-0 h-10 px-3 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-colors ${
                                    lleno || isLoading
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20"
                                  }`}
                                >
                                  {lleno ? "Agotado" : "¡Quiero reservar!"}
                                </motion.button>
                              </div>

                              {/* Encabezado Card (desktop/tablet) */}
                              <div className="hidden sm:flex justify-between items-start mb-4">
                                <div
                                  className={`p-2 rounded-lg ${
                                    lleno
                                      ? "bg-gray-200"
                                      : "bg-orange-50 text-orange-600"
                                  }`}
                                >
                                  <Clock size={20} />
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                                    lleno
                                      ? "bg-gray-100 text-gray-500 border-gray-200"
                                      : "bg-orange-50 text-orange-700 border-orange-200"
                                  }`}
                                >
                                  {lleno
                                    ? "SIN CUPO"
                                    : `${cuposLibres} DISPONIBLES`}
                                </span>
                              </div>

                              {/* Cuerpo Card */}
                              <div className="hidden sm:block text-center sm:mb-6">
                                <div className="text-3xl min-[380px]:text-4xl sm:text-5xl font-bignoodle text-gray-900 tracking-wider">
                                  {formatearHoraAmPm(item.hhmm)}
                                </div>
                                <div className="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-widest mt-1">
                                  {item.grupo_label ===
                                  "Lunes-Miercoles-Viernes"
                                    ? "Lunes-Miércoles-Viernes"
                                    : "Martes-Jueves"}
                                </div>
                              </div>

                              {/* Footer / Botón */}
                              <div className="hidden sm:block">
                                <motion.button
                                  whileTap={
                                    reduceMotion || lleno
                                      ? undefined
                                      : { scale: 0.95 }
                                  }
                                  onClick={() => reservarTurno(item)}
                                  disabled={lleno || isLoading}
                                  className={`w-full py-2 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors ${
                                    lleno || isLoading
                                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                      : "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20"
                                  }`}
                                >
                                  {lleno ? (
                                    "Agotado"
                                  ) : (
                                    <>
                                      ¡Quiero reservar! <FaWhatsapp size={16} />
                                    </>
                                  )}
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER SOFT FUSION */}
      <FooterV2></FooterV2>
    </div>
  );
};

export default ReservasWhatsApp;
