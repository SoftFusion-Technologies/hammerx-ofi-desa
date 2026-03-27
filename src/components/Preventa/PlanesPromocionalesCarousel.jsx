import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";
import FormPreventa from "../Forms/FormPreventa";

const plans = [
  {
    id: "base",
    title: "Plan Base",
    subtitle: "Entrenamiento completo",
    label: "Entrena + progresa",
    description: `Incluye musculacion, clases grupales de funcional, HIIT, fullbody y calistenia. 
      Asesoramiento por instructores calificados.`,
    highlight: false,
    precios: {
      semestral: "270.000",
      anual: "450.000",
    },
  },
  {
    id: "pilates-mj",
    title: "Plan Pilates",
    subtitle: "Martes y Jueves",
    label: "Mas elegido",
    description:
      "Incluye acceso a nuestras clases de pilates reformer los dias martes y jueves.",
    highlight: false,
    precios: {
      semestral: "189.000",
      anual: "315.000",
    },
  },
  {
    id: "pilates-lmv",
    title: "Plan Pilates",
    subtitle: "Lunes, Miercoles y Viernes",
    label: "Frecuencia alta",
    description:
      "Incluye acceso a nuestras clases de pilates reformer los dias lunes, miercoles y viernes.",
    highlight: false,
    precios: {
      semestral: "270.000",
      anual: "450.000",
    },
  },
  {
    id: "full",
    title: "Pase Full",
    subtitle: "Todas las actividades",
    label: "Experiencia completa",
    description:
      "Combina todas las actividades. Podes realizar pilates dos o tres veces por semana segun tu preferencia.",
    highlight: true,
    precios: {
      semestral: "405.000",
      anual: "675.000",
    },
  },
];

const PlanesPromocionalesCarousel = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [instanciaSwiper, setInstanciaSwiper] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [metodoInscripcion, setMetodoInscripcion] = useState(null);
  const [modalidadSeleccionada, setModalidadSeleccionada] = useState(null);
  const [mostrarOpcionesInscripcion, setMostrarOpcionesInscripcion] =
    useState(false);
  const seccionPagoRef = useRef(null);
  const botonesInscripcionRef = useRef(null);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (instanciaSwiper) {
      if (planSeleccionado) {
        instanciaSwiper.autoplay.stop();
      } else {
        instanciaSwiper.autoplay.start();
      }
    }
  }, [planSeleccionado, instanciaSwiper]);

  const handleInscribirse = (plan) => {
    setPlanSeleccionado(plan);
    setModalidadSeleccionada(null); // Resetear modalidad
    setMostrarOpcionesInscripcion(false); // Ocultar botones
    setTimeout(() => {
      if (seccionPagoRef.current) {
        const posicionY =
          seccionPagoRef.current.getBoundingClientRect().top +
          window.scrollY -
          100;
        window.scrollTo({ top: posicionY, behavior: "smooth" });
      }
    }, 150);
  };

  const manejarCerrarOpciones = () => {
    setPlanSeleccionado(null);
    setModalidadSeleccionada(null);
    setMostrarOpcionesInscripcion(false);
  };

  const seleccionarModalidad = (modalidad) => {
    setModalidadSeleccionada(modalidad);
    setMostrarOpcionesInscripcion(true);
    setTimeout(() => {
      if (botonesInscripcionRef.current) {
        // Hacemos un scroll ligero apuntando a los botones, pero restando unos pixeles para no tapar los planes
        const posicionY =
          botonesInscripcionRef.current.getBoundingClientRect().top +
          window.scrollY -
          200;
        window.scrollTo({ top: posicionY, behavior: "smooth" });
      }
    }, 150);
  };

  const abrirModalInscripcion = (metodo) => {
    setMetodoInscripcion(metodo);
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setMetodoInscripcion(null);
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
              PLANES DE PREVENTA
            </span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-2xl md:text-4xl font-bignoodle uppercase tracking-wide text-gray-900 leading-none"
          >
            ¡QUIERO APROVECHAR LOS PRIMEROS
            <span className="ml-2 text-orange-600">100 CUPOS</span>
            !
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-2 text-xs md:text-sm text-gray-600 max-w-2xl"
          >
            Deslizá y contratá tus planes aquí.
          </motion.p>
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

        <AnimatePresence>
          {planSeleccionado && (
            <motion.div
              ref={seccionPagoRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative px-4 md:px-6 overflow-hidden bg-white border-t border-gray-200"
            >
              <div className="pb-8 md:pb-10 pt-8 relative">
                <button
                  onClick={manejarCerrarOpciones}
                  className="absolute top-2 right-4 md:top-6 md:right-6 text-gray-400 hover:text-gray-700 font-bold text-sm transition-colors bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 z-20 flex items-center gap-1 shadow-sm"
                >
                  ✕ <span className="hidden md:inline">Cerrar</span>
                </button>

                <div className="text-center mb-8 pr-12 pl-2">
                  <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                    Paso 1
                  </p>
                  <h4 className="text-2xl md:text-3xl font-bignoodle uppercase text-gray-900 leading-none">
                    Elegí tu modalidad para{" "}
                    <span className="text-orange-600">
                      {planSeleccionado.title}
                    </span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
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
                      ${planSeleccionado.precios.semestral}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
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
                      ${planSeleccionado.precios.anual}
                    </p>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {mostrarOpcionesInscripcion && (
                    <motion.div
                      ref={botonesInscripcionRef}
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 32 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex flex-col gap-4 max-w-xl mx-auto overflow-hidden"
                    >
                      <div className="text-center mb-2">
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">
                          Paso 2
                        </p>
                        <h4 className="text-xl font-bignoodle uppercase text-gray-800 leading-none">
                          ¿Cómo querés inscribirte?
                        </h4>
                      </div>

                      <button
                        type="button"
                        onClick={() => abrirModalInscripcion("transferencia")}
                        className="w-full bg-orange-600 text-white hover:bg-orange-700 rounded-xl py-3.5 md:py-4 font-bignoodle font-extrabold text-xl md:text-2xl transition-all duration-200 uppercase tracking-widest shadow-md hover:shadow-lg"
                      >
                        Inscribirme ahora por transferencia
                      </button>
                      <button
                        type="button"
                        onClick={() => abrirModalInscripcion("mostrador")}
                        className="w-full bg-white border-2 border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50 rounded-xl py-3 md:py-3.5 font-bignoodle font-bold text-lg md:text-xl transition-all duration-200 uppercase tracking-widest"
                      >
                        Inscribirme en mostrador (próximamente)
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      <FormPreventa
        estaAbierto={mostrarModal}
        alCerrar={cerrarModal}
        planSeleccionado={planSeleccionado}
        modalidadPago={modalidadSeleccionada}
        metodoInscripcion={metodoInscripcion}
      />
    </>
  );
};

export default PlanesPromocionalesCarousel;
