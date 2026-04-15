import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiCalendar,
  FiCreditCard,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";
import FormPreventa from "../Forms/FormPreventa";

const precioMensualPlanBase = 85000;
const precioMensualPilatesX2 = 57000;
const precioMensualPilatesX3 = 85000;
const precioMensualPaseFull = 127500;

const calcularPrecioConDescuento = (precioMensual, meses, descuento) => {
  const precioBase = precioMensual * meses;
  return precioBase - precioBase * (descuento / 100);
};

const plans = [
  {
    id: "base",
    title: "Plan Base",
    subtitle: "Entrenamiento completo",
    description: `Incluye musculacion, clases grupales de funcional, HIIT, fullbody y calistenia. 
      Asesoramiento por instructores calificados.`,
    highlight: false,
    precios: {
      semestral: calcularPrecioConDescuento(precioMensualPlanBase, 6, 40),
      anual: calcularPrecioConDescuento(precioMensualPlanBase, 12, 50),
    },
  },
  {
    id: "pilates-mj",
    title: "Plan Pilates X2",
    subtitle: "Martes y Jueves",
    description:
      "Incluye acceso a nuestras clases de pilates reformer los dias martes y jueves.",
    highlight: false,
    precios: {
      semestral: calcularPrecioConDescuento(precioMensualPilatesX2, 6, 40),
      anual: calcularPrecioConDescuento(precioMensualPilatesX2, 12, 50),
    },
  },
  {
    id: "pilates-lmv",
    title: "Plan Pilates X3",
    subtitle: "Lunes, Miercoles y Viernes",
    description:
      "Incluye acceso a nuestras clases de pilates reformer los dias lunes, miercoles y viernes.",
    highlight: false,
    precios: {
      semestral: calcularPrecioConDescuento(precioMensualPilatesX3, 6, 40),
      anual: calcularPrecioConDescuento(precioMensualPilatesX3, 12, 50),
    },
  },
  {
    id: "full",
    title: "Pase Full",
    subtitle: "Todas las actividades",
    description:
      "Combina todas las actividades. Podes realizar pilates dos o tres veces por semana segun tu preferencia.",
    highlight: true,
    precios: {
      semestral: calcularPrecioConDescuento(precioMensualPaseFull, 6, 40),
      anual: calcularPrecioConDescuento(precioMensualPaseFull, 12, 50),
    },
  },
];

const PLANES_ACTIVACION_APERTURA = new Set([
  "pilates-mj",
  "pilates-lmv",
  "full",
]);

const seActivaEnApertura = (plan) => PLANES_ACTIVACION_APERTURA.has(plan?.id);

const PlanesPromocionalesCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [instanciaSwiper, setInstanciaSwiper] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalSeleccion, setMostrarModalSeleccion] = useState(false);
  const [metodoInscripcion, setMetodoInscripcion] = useState(null);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState(null);
  const modalSeleccionScrollRef = useRef(null);
  const opcionesInscripcionRef = useRef(null);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (instanciaSwiper) {
      if (mostrarModalSeleccion || mostrarModal) {
        instanciaSwiper.autoplay.stop();
      } else {
        instanciaSwiper.autoplay.start();
      }
    }
  }, [mostrarModalSeleccion, mostrarModal, instanciaSwiper]);

  useEffect(() => {
    if (!mostrarModalSeleccion) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        cerrarModalSeleccion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mostrarModalSeleccion]);

  useEffect(() => {
    if (!mostrarModalSeleccion || !modalidadSeleccionada) return;

    const scrollDelay = window.setTimeout(() => {
      if (opcionesInscripcionRef.current) {
        opcionesInscripcionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        return;
      }

      if (modalSeleccionScrollRef.current) {
        modalSeleccionScrollRef.current.scrollTo({
          top: modalSeleccionScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 450);

    return () => window.clearTimeout(scrollDelay);
  }, [modalidadSeleccionada, mostrarModalSeleccion]);

  const handleInscribirse = (plan) => {
    setPlanSeleccionado(plan);
    setModalidadSeleccionada(null);
    setMetodoInscripcion(null);
    setMostrarModalSeleccion(true);
  };

  const cerrarModalSeleccion = () => {
    setMostrarModalSeleccion(false);
    setPlanSeleccionado(null);
    setModalidadSeleccionada(null);
    setMetodoInscripcion(null);
  };

  const seleccionarModalidad = (modalidad) => {
    setModalidadSeleccionada(modalidad);
  };

  const abrirModalInscripcion = (metodo) => {
    setMetodoInscripcion(metodo);
    setMostrarModalSeleccion(false);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMetodoInscripcion(null);
    setPlanSeleccionado(null);
    setModalidadSeleccionada(null);
  };

  const volverAModalidadPlan = () => {
    setMostrarModal(false);
    setMetodoInscripcion(null);
    setModalidadSeleccionada(null);
    setMostrarModalSeleccion(true);
  };

  return (
    <>
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-clip rounded-2xl border border-gray-200 mb-6 md:mb-2 bg-gray-50 shadow-2xl font-messina"
      >
        <div className="pointer-events-none absolute -top-20 -left-16 h-52 w-52 rounded-full bg-orange-100 blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-orange-200 blur-3xl opacity-40" />

        <div className="relative px-4 py-5 md:px-6 md:py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-3 py-1"
          >
            <span className="font-bignoodle text-[15px] md:text-lg font-bold uppercase tracking-[0.18em] text-orange-600">
              PLANES
            </span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-lg md:text-4xl font-bignoodle uppercase tracking-wide text-gray-900 leading-none"
          >
            <span className="text-orange-600">¡100 CUPOS </span>
            DISPONIBLES
          </motion.h3>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative px-0 md:px-6 pb-6 md:pb-8"
        >
          <Swiper
            onSwiper={setInstanciaSwiper}
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            loop={false}
            rewind
            autoplay={{ delay: 2800, disableOnInteraction: false }}
            centeredSlides={isMobile} // Activo en móvil para mostrar los recortes de los costados
            grabCursor={true}
            pagination={{ clickable: true }}
            breakpoints={{
              0: { slidesPerView: 1.25, spaceBetween: 16 }, // Muestra la central y pedacitos a los lados
              520: { slidesPerView: 1.5, spaceBetween: 16 },
              768: {
                slidesPerView: 2.2,
                spaceBetween: 20,
                centeredSlides: false,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
                centeredSlides: false,
              },
            }}
            className="!pb-8 [&_.swiper-pagination-bullet]:!bg-gray-300 [&_.swiper-pagination-bullet-active]:!bg-orange-500"
          >
            {plans.map((plan) => (
              <SwiperSlide key={plan.id} className="h-auto">
                <article
                  className={` relative h-full min-h-[315px] md:min-h-[345px] rounded-2xl border p-5 md:p-6 mt-3 flex flex-col transition-all duration-300 md:hover:-translate-y-1 ${
                    plan.highlight
                      ? "bg-orange-100 border-orange-400 shadow-[0_8px_30px_rgba(234,88,12,0.15)] ring-1 ring-orange-200"
                      : "bg-white border-gray-200 shadow-sm hover:shadow-md"
                  }`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 right-4 rounded-full bg-orange-600 text-white px-3 py-1 text-[12px] md:text-sm font-bignoodle font-extrabold uppercase tracking-widest shadow-sm">
                      Recomendado
                    </span>
                  )}

                  <div className="mb-4">
                    <p className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500 mb-2">
                      {plan.label}
                    </p>

                    <h4 className=" font-extrabold leading-tight text-2xl md:text-3xl text-gray-900">
                      {plan.title.toUpperCase()}
                    </h4>
                    <p className=" font-semibold text-sm md:text-base text-gray-600 mt-1">
                      {plan.subtitle}
                    </p>
                  </div>

                  <p className=" text-[13px] md:text-[14px] leading-relaxed text-gray-500 flex-grow">
                    {plan.description}
                  </p>

                  {seActivaEnApertura(plan) && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 px-2 py-2">
                      <p className="flex items-center gap-2 text-[11px] lg:text-sm font-semibold text-orange-700 leading-relaxed">
                        <FiCalendar className="mt-0.5 shrink-0 text-sm" />
                        Se activa desde la fecha de apertura
                      </p>
                    </div>
                  )}

                  {plan.id === "base" && (
                    <div className="rounded-xl border border-orange-200 bg-orange-50 px-2 py-2">
                      <p className="flex items-center gap-2 text-[11px] lg:text-sm font-semibold text-orange-700 leading-relaxed">
                        <FiCalendar className="mt-0.5 shrink-0 text-sm" />
                        Se activa con tu primera asistencia. Máx. 90 días desde la apertura
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleInscribirse(plan)}
                    className={`mt-6 w-full rounded-xl py-3 font-bignoodle font-extrabold !text-xl md:text-2xl transition-all duration-200 tracking-wider ${
                      plan.highlight
                        ? "bg-orange-600 text-white hover:bg-orange-700 shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    Seleccionar Plan
                  </button>
                </article>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="flex items-center justify-center gap-2 mt-2 text-orange-500 text-sm font-semibold animate-pulse"
                >
                  <span>&larr;</span>
                  <span>Desliza para ver más opciones</span>
                  <span>&rarr;</span>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </motion.section>

      <AnimatePresence>
        {mostrarModalSeleccion && planSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[95] flex items-center justify-center p-2 bg-gray-900/60 backdrop-blur-sm"
            onClick={cerrarModalSeleccion}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gray-200 w-full max-w-lg md:max-w-4xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden max-h-[96vh] flex flex-col relative"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-300 rounded-full md:hidden z-20" />

              <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-gray-300 bg-white z-20 shrink-0 shadow-sm">
                <div className="flex flex-col">
                  <h3 className="text-gray-900 font-bignoodle text-xl md:text-2xl uppercase leading-none tracking-wider mt-1">
                    {planSeleccionado.title}
                  </h3>
                  {seActivaEnApertura(planSeleccionado) && (
                    <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700">
                      <FiCalendar className="text-[11px]" />
                      Se activa desde la fecha de apertura
                    </p>
                  )}
                  {
                    planSeleccionado.id === "base" && (
                      <p className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700">
                        <FiCalendar className="text-[11px]" />
                        Se activa con tu primera asistencia. Máx. 90 días desde la apertura
                      </p>
                    )
                  }
                </div>
                <button
                  type="button"
                  onClick={cerrarModalSeleccion}
                  className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all self-start md:self-center -mt-2 md:mt-0"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div
                ref={modalSeleccionScrollRef}
                className="overflow-y-auto flex-1 p-4 md:p-6 pb-10 custom-scrollbar"
              >
                <div className="mx-auto max-w-2xl text-center mb-6 md:mb-8 px-2">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                    Paso 1
                  </p>
                  <h4 className="text-center text-2xl md:text-3xl font-bignoodle uppercase text-gray-900 leading-none">
                    Elegí tu modalidad para{" "}
                    <span className="text-orange-600">
                      {planSeleccionado.title}
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className={`bg-white border-2 rounded-2xl p-6 text-center flex flex-col justify-center cursor-pointer transition-all ${
                      modalidadSeleccionada === "semestral"
                        ? "border-orange-500 shadow-[0_4px_20px_rgba(234,88,12,0.15)] ring-2 ring-orange-500/20"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 shadow-sm"
                    }`}
                    onClick={() => seleccionarModalidad("semestral")}
                  >
                    <h5 className="font-bignoodle text-2xl md:text-3xl uppercase tracking-wider mb-1 text-gray-900">
                      Plan Semestral
                    </h5>
                    <p className="text-orange-600 font-bold mb-4 text-sm">
                      40% de descuento
                    </p>
                    <p className="text-4xl md:text-5xl font-extrabold mt-auto text-gray-900 tracking-tight">
                      $
                      {planSeleccionado.precios.semestral.toLocaleString(
                        "es-AR"
                      )}
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={`bg-white border-2 rounded-2xl p-6 text-center flex flex-col justify-center relative cursor-pointer transition-all ${
                      modalidadSeleccionada === "anual"
                        ? "border-orange-500 shadow-[0_4px_20px_rgba(234,88,12,0.15)] ring-2 ring-orange-500/20"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 shadow-sm"
                    }`}
                    onClick={() => seleccionarModalidad("anual")}
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-600 text-white px-4 py-1 text-[10px] md:text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">
                      Mejor Opción
                    </span>
                    <h5 className="font-bignoodle text-2xl md:text-3xl uppercase tracking-wider mb-1 text-gray-900">
                      Plan Anual
                    </h5>
                    <p className="text-orange-600 font-bold mb-4 text-sm">
                      50% de descuento
                    </p>
                    <p className="text-4xl md:text-5xl font-extrabold mt-auto text-gray-900 tracking-tight">
                      $
                      {planSeleccionado.precios.anual.toLocaleString("es-AR")}
                    </p>
                  </motion.button>
                </div>

                <AnimatePresence>
                  {modalidadSeleccionada && (
                    <motion.div
                      ref={opcionesInscripcionRef}
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 28 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.35 }}
                      className="overflow-hidden"
                    >
                      <div className="text-center mb-4 md:mb-6 px-2">
                        <p className="text-[10px] sm:text-xs font-bold text-orange-500 uppercase tracking-[0.24em] mb-1">
                          Paso 2
                        </p>
                        <h4 className="text-2xl sm:text-2xl md:text-3xl font-bignoodle uppercase text-gray-800 leading-tight">
                          ¿Cómo querés inscribirte?
                        </h4>
                        <p className="mt-1.5 text-xs sm:text-sm md:text-base text-gray-500">
                          Elegí una opción para continuar
                        </p>
                      </div>

                      <div className="flex flex-col gap-3.5 max-w-2xl mx-auto px-0.5">
                        <button
                          type="button"
                          onClick={() => abrirModalInscripcion("transferencia")}
                          className="group w-full rounded-[1.35rem] border border-orange-500/70 bg-gradient-to-r from-[#f2550f] via-[#ff6a19] to-[#ff7f1f] px-3 py-3 sm:px-4 sm:py-4 text-white shadow-[0_10px_26px_rgba(252,75,8,0.34)] transition-all duration-200 hover:brightness-105 hover:shadow-[0_14px_30px_rgba(252,75,8,0.42)]"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/15 border border-white/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] shrink-0">
                              <FiCreditCard className="text-base sm:text-xl" />
                            </span>

                            <div className="min-w-0 text-left leading-tight flex-1">
                              <p className="text-base sm:text-2xl font-semibold tracking-tight">
                                Transferencia bancaria
                              </p>
                              <p className="text-[11px] sm:text-sm text-white/90 mt-0.5">
                                Inscribite ahora y asegurá tu cupo
                              </p>
                            </div>

                            <FiArrowRight className="text-lg sm:text-xl shrink-0 opacity-90 transition-transform duration-200 group-hover:translate-x-1" />
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => abrirModalInscripcion("mostrador")}
                          className="group w-full rounded-[1.35rem] border border-gray-200 bg-[#f7f7f9] px-3 py-3 sm:px-4 sm:py-4 text-gray-700 shadow-[0_10px_22px_rgba(15,23,42,0.09)] transition-all duration-200 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.13)]"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="inline-flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#ececf1] border border-gray-300 text-gray-500 shrink-0">
                              <FiMapPin className="text-base sm:text-xl" />
                            </span>

                            <div className="min-w-0 text-left leading-tight flex-1">
                              <p className="text-base sm:text-2xl font-semibold tracking-tight text-gray-700">
                                En mostrador
                              </p>
                              <p className="text-[11px] sm:text-sm text-gray-500 mt-0.5">
                                Próximamente disponible, completa tus datos y te
                                notificamos
                              </p>
                            </div>

                            <FiArrowRight className="text-lg sm:text-xl shrink-0 text-gray-400 transition-transform duration-200 group-hover:translate-x-1" />
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FormPreventa
        estaAbierto={mostrarModal}
        alCerrar={cerrarModal}
        alVolver={volverAModalidadPlan}
        planSeleccionado={planSeleccionado}
        modalidadPago={modalidadSeleccionada}
        metodoInscripcion={metodoInscripcion}
      />
    </>
  );
};

export default PlanesPromocionalesCarousel;
