import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion"; 
import Footer from "../../components/footer/Footer";
import { logo } from "../../images/svg/index";

// --- Imágenes para la galería modal y fondos ---
import Box from "../../images/sedes/Barrio Norte/Box.webp";
import Cardio from "../../images/sedes/Barrio Norte/Cardio.webp";
import Fachada from "../../images/sedes/Barrio Norte/Fachada.webp";
import Sala_Principal from "../../images/sedes/Barrio Norte/Sala principal.webp";
import Sala_Principal_1 from "../../images/sedes/Barrio Norte/Sala principal 2.webp";

import PlantaB_Sala_Pesos_Libres from "../../images/sedes/Barrio Norte/PlantaB_Sala_Pesos_Libres.jpeg";
import Sala_Pilates from "../../images/sedes/Barrio Norte/Sala_pilates.jpg";
import Silla_Masajes from "../../images/sedes/Barrio Norte/Silla_Masajes.jpeg";
import Terraza from "../../images/sedes/Barrio Norte/Terraza.jpg";
import Musculacion from "../../images/sedes/Barrio Norte/Musculacion.jpeg";
import Cardio_1 from "../../images/sedes/Barrio Norte/Cardio.jpg";

import "../../styles/clients/newsede.css";

import PlanesPromocionalesCarousel from "../../components/Preventa/PlanesPromocionalesCarousel";
import ModalGaleria from "../../components/Preventa/ModalGaleria";

// --- Iconos para las secciones ---
import {
  FaMapMarkerAlt,
  FaDumbbell,
  FaHeartbeat,
  FaShower,
  FaUsers,
  FaChair,
  FaChevronRight,
  FaWeightHanging,
  FaLaptop,
  FaWhatsapp,
  FaLockOpen, 
  FaCar,
} from "react-icons/fa";
import { FaChildren } from "react-icons/fa6";
import { MdSelfImprovement, MdSportsTennis } from "react-icons/md";

// --- Configuraciones de Animación (Framer Motion) ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, type: "spring", stiffness: 100 },
  },
};

const SedeYerbaBuena = () => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const abrirGaleria = () => setGalleryOpen(true);
  const cerrarGaleria = () => setGalleryOpen(false);

  const dynamicGalleryImages = useMemo(
    () => [
      { src: Fachada, alt: "Fachada Sede Barrio Norte" },
      { src: Sala_Principal, alt: "Sala Principal" },
      { src: Sala_Principal_1, alt: "Sala Principal vista alternativa" },
      { src: Musculacion, alt: "Sala de Musculación" },
      { src: PlantaB_Sala_Pesos_Libres, alt: "Sala de Pesos Libres" },
      { src: Box, alt: "Sector Box funcional" },
      { src: Cardio, alt: "Sector Cardio" },
      { src: Sala_Pilates, alt: "Sala de Pilates Climatizada" },
      { src: Terraza, alt: "Terraza al aire libre" },
    ],
    [],
  );

  const scrollToPreventaCarousel = () => {
    const id = "preventa-carousel";
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = window.innerWidth < 768 ? 72 : 120;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  const whatsappUrl =
    "https://wa.me/5493868381?text=Hola%20Hammer%2C%20quiero%20mas%20info%20de%20la%20preventa.";

  // --- DATOS UNIFICADOS ---
  const allFacilities = [
    {
      id: 1,
      icon: FaDumbbell,
      title: "Sala de Musculación",
      description: (
        <>
          <span className="font-bold text-gray-200">
            Ubicada en planta baja
          </span>
          <br />
          +100 equipos importados de última generación
          <br />
          <span className="text-white font-bold drop-shadow-sm">
            Bonus: Glute Zone exclusiva
          </span>
        </>
      ),
    },
    {
      id: 2,
      icon: FaWeightHanging,
      title: "Sala de Pesos Libres",
      description: (
        <>
          <span className="font-bold text-gray-200">
            Ubicada en primer piso
          </span>
          <br />
          Espacio amplio para entrenar sin esperas
        </>
      ),
    },
    {
      id: 3,
      icon: FaUsers,
      title: "Sala de Clases Grupales",
      description: (
        <>
          <span className="font-bold text-gray-200">Ubicada en subsuelo</span>
          <br />
          Clases de funcional, HIIT, full body y más
        </>
      ),
    },
    {
      id: 4,
      icon: MdSelfImprovement,
      title: "Sala de Pilates",
      description: (
        <>
          <span className="font-bold text-gray-200">
            Ubicada en primer piso
          </span>
          <br />
          Clases de pilates reformer con cupos reducidos (hasta 10 personas)
        </>
      ),
    },
    {
      id: 5,
      icon: FaHeartbeat,
      title: "Sala de Cardio",
      description: (
        <>
          <span className="font-bold text-gray-200">
            Ubicada en segundo piso
          </span>
          <br />
          +10 cintas y equipos touch de última tecnología
        </>
      ),
    },
    {
      id: 6,
      icon: FaLaptop,
      title: "Espacio de Coworking",
      description: "Trabajá, estudiá o gestioná tu día sin salir del gym",
    },
    {
      id: 7,
      icon: FaChair,
      title: "Sala de Relax y Recuperación",
      description: (
        <>
          Sillones de masajes
          <br />
          Baños de inmersión
          <br />
          Recuperación post entrenamiento de nivel profesional
        </>
      ),
    },
    {
      id: 8,
      icon: FaShower,
      title: "Duchas y Vestuarios",
      description:
        "Entrená antes o después de tus actividades con total comodidad",
    },
    {
      id: 9,
      icon: MdSportsTennis,
      title: "Cancha de Pádel",
      description: "Entrenamiento y deporte en un mismo lugar",
    },
    {
      id: 10,
      icon: FaChildren,
      title: "Sala de niños",
      description: "Entrená con tranquilidad, también cuando venís con ell@s.",
    },
    {
      id: 11,
      icon: FaCar,
      title: "Estacionamiento exclusivo",
      description: "Un plus de comodidad para que tu experiencia empiece desde que llegás.",
    },
  ];

  // --- LÓGICA DE AUTO-SCROLL ---
  const carouselRef = useRef(null);
  const isPausedRef = useRef(false);
  
  // Si el carrusel entra en pantalla (once: true para que no se reinicie si suben y bajan)
  const isInView = useInView(carouselRef, { once: true, amount: 0.1 });

  useEffect(() => {
    // Si todavía no estamos en esa parte de la página, no hacemos nada
    if (!isInView) return;

    const container = carouselRef.current;
    if (!container) return;

    let animationFrameId;
    let waitTimeoutId;
    let returnTimeoutId;

    const scroll = () => {
      // Solo anima si no está pausado por el usuario
      if (!isPausedRef.current) {
        // Velocidad de la animación
        container.scrollLeft += 1; 

        // Verificamos si llegó al final del scroll
        if (Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth) {
          isPausedRef.current = true; // Pausar momentáneamente la animación automática

          // 1. Espera 2 segundos al llegar al final (2000 ms)
          waitTimeoutId = setTimeout(() => {
            // 2. Vuelve al principio rápidamente pero fluido
            container.scrollTo({ left: 0, behavior: "smooth" });

            // 3. Espera un poco a que termine el viaje de vuelta para reanudar la animación
            returnTimeoutId = setTimeout(() => {
              isPausedRef.current = false;
              animationFrameId = requestAnimationFrame(scroll); // Volver a arrancar
            }, 1000); 

          }, 2000); 
          return; // Detenemos este frame para que no siga sumando
        }
      }
      // Llamar al siguiente frame
      animationFrameId = requestAnimationFrame(scroll);
    };

    // Iniciar la animación
    animationFrameId = requestAnimationFrame(scroll);

    // Limpieza cuando el componente se desmonta o cuando cambia isInView
    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(waitTimeoutId);
      clearTimeout(returnTimeoutId);
    };
  }, [isInView]); 

  return (
    <motion.div initial="hidden" animate="visible" exit={{ opacity: 0 }}>
      {/* HEADER PRINCIPAL */}
      <div className="relative text-center overflow-hidden bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] pb-0 md:pb-12">
        <div className="absolute inset-0 flex items-center justify-center gap-x-24 lg:gap-x-[32rem] mr-0 lg:mr-36 z-0 pointer-events-none">
          <motion.span
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ duration: 1 }}
            className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap"
          >
            ¡NUEVA
          </motion.span>
          <motion.span
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 0.7 }}
            transition={{ duration: 1 }}
            className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap"
          >
            SEDE!
          </motion.span>
        </div>

        <div className="relative z-10 flex items-center justify-center py-0 md:py-16">
          <motion.div className="w-full md:w-auto" variants={scaleUp}>
            <div className="bg-gradient-to-b from-[#ff8c00] via-[#5f1212] to-black rounded-sm md:rounded-xl shadow-2xl px-6 py-5 md:px-10 md:py-5 text-center w-full">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPreventaCarousel}
                className="group relative inline-flex items-center justify-center font-montserrat text-sm sm:text-xl md:text-2xl text-white mb-2 px-2 md:px-3 py-2 md:py-3 font-extrabold uppercase tracking-[0.08em] rounded-xl border border-white/50 bg-gradient-to-r from-[#fc4b08] via-[#ff7a18] to-[#ff9f43] shadow-[0_12px_28px_rgba(0,0,0,0.35)] focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 animate-[bounce_2s_infinite] [animation-duration:2s]"
                style={{ animationName: "bounceSutil" }}
              >
                ¡COMIENZA NUESTRA PREVENTA ONLINE!
              </motion.button>
              <style>{`
                @keyframes bounceSutil {
                  0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }
              `}</style>

              <motion.img
                initial={{ rotate: -10, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                src={logo}
                alt="logo"
                className="my-0 md:my-5 max-w-sm lg:max-w-xl mx-auto"
              />
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-bignoodle uppercase text-2xl md:text-6xl text-gray-200"
              >
                YERBA BUENA - Aconquija
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>

      <section className="py-2 md:py-12 bg-gray-100 overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* UBICACIÓN Y BOTÓN GALERÍA */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="bg-white rounded-lg shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-stretch justify-between gap-6 border border-gray-200"
          >
            <div className="flex-1 space-y-4 text-left flex flex-col justify-center">
              <div className="w-full rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-orange-50 px-4 py-2.5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] md:text-xs font-extrabold uppercase tracking-[0.18em] text-orange-700">
                    APERTURA
                  </span>
                  <span className="inline-flex items-center gap-2 text-orange-700">
                    <FaLockOpen className="text-base md:text-lg" />
                    <span className="font-bignoodle text-2xl md:text-3xl uppercase tracking-wide leading-none text-[#fc4b08]">
                      Mayo
                    </span>
                  </span>
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bignoodle uppercase text-[#fc4b08]">
                UBICACIÓN
              </h2>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaMapMarkerAlt className="text-3xl text-[#fc4b08]" />
                </motion.div>
                <div>
                  <p className="text-gray-700 font-semibold text-sm lg:text-lg">
                    Aconquija 2044, Yerba Buena, Tucumán
                  </p>
                   <p className="text-gray-600 text-sm lg:text-[15px]">Con estacionamiento exclusivo</p>
                </div>
              </div>
            </div>

            {/* BOTÓN GALERÍA PREMIUM */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onClick={abrirGaleria}
              className="relative overflow-hidden rounded-xl text-center w-full md:w-1/2 group cursor-pointer shadow-lg"
              style={{
                backgroundImage: `url(${Sala_Principal})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[3px] transition-all duration-300 group-hover:bg-black/40 group-hover:backdrop-blur-none z-0"></div>

              <div className="relative z-10 flex flex-col items-center justify-center p-8 h-full">
                <p className="text-xl md:text-3xl font-bignoodle uppercase mb-5 tracking-wider text-white drop-shadow-md">
                  3000mt<sup>2</sup> que van a cambiar tu forma de entrenar para
                  siempre
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#fc4b08] border-none text-white font-montserrat px-8 py-3 rounded-md text-sm lg:text-lg font-bold uppercase flex items-center gap-2 shadow-lg hover:bg-[#ff5c1e] transition-colors"
                >
                  Ver galería{" "}
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <FaChevronRight />
                  </motion.span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>

          {/* LÍNEA DIVISORIA FINITA ANIMADA */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="w-full h-[2px] bg-gradient-to-r from-transparent via-[#fc4b08]/50 to-transparent my-10 md:my-16"
          />

          {/* TÍTULO INSTALACIONES */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center items-center relative overflow-hidden mb-8"
          >
            <p className="absolute left-0 w-1/3 text-4xl font-bignoodle uppercase text-gray-300 opacity-60 text-right pr-4 hidden lg:block">
              ¡Conocé nuestras instalaciones!
            </p>
            <p className="absolute right-0 w-1/3 text-4xl font-bignoodle uppercase text-gray-300 opacity-60 text-left pl-4 hidden lg:block">
              ¡Conocé nuestras instalaciones!
            </p>
            <h2
              id="instalaciones-por-piso"
              className="text-4xl md:text-5xl font-bignoodle text-center uppercase tracking-widest z-10 text-[#fc4b08]"
            >
              ¡Conocé nuestras instalaciones!
            </h2>
          </motion.div>

          {/* CARRUSEL INSTALACIONES (Alineación corregida al tope) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
            className="bg-white rounded-lg shadow-lg border-t-4 border-[#fc4b08] mb-12 py-8 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="flex items-center justify-center gap-2 mb-1 text-orange-500 text-sm font-semibold animate-pulse"
            >
              <span>←</span>
              <span>Desliza para ver más</span>
              <span>→</span>
            </motion.div>
            <div 
              ref={carouselRef}
              onMouseEnter={() => { isPausedRef.current = true; }}
              onMouseLeave={() => { isPausedRef.current = false; }}
              onTouchStart={() => { isPausedRef.current = true; }}
              onTouchEnd={() => { isPausedRef.current = false; }}
              className="flex overflow-x-auto gap-5 pb-6 px-6 hide-scrollbar items-stretch"
            >
              {allFacilities.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="shrink-0 w-72 md:w-[350px]"
                >
                  {/* Tarjeta con flex-col */}
                  <motion.div
                    whileHover={{
                      y: -8,
                      boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
                    }}
                    className="group p-6 border-t-[5px] border-t-[#fc4b08] rounded-2xl h-full flex flex-col bg-gradient-to-b from-[#2c2a2b] via-[#573525] to-[#f48a51] shadow-lg transition-all duration-300"
                  >
                    {/* Header de la tarjeta */}
                    <div className="flex items-center gap-4 mb-0 min-h-[4rem]">
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          repeatDelay: Math.random() * 2,
                        }}
                      >
                        <feature.icon className="text-4xl md:text-5xl text-[#fc4b08] drop-shadow-md shrink-0" />
                      </motion.div>
                      <h4 className="font-bignoodle uppercase text-2xl md:text-3xl text-white leading-none m-0 drop-shadow-sm">
                        {feature.title}
                      </h4>
                    </div>

                    <p className="text-white text-sm md:text-base leading-relaxed mt-2 flex-grow">
                      {feature.description}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
          </motion.div>

          <div id="preventa-carousel" className="scroll-mt-28">
            <PlanesPromocionalesCarousel />
          </div>
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <motion.h2
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        style={{ background: "#fc4b08" }}
        className="text-3xl md:text-6xl font-bold text-white font-bignoodle text-center py-4 m-0"
      >
        CONOCE NUESTRA UBICACIÓN
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        id="ubicacion"
        className="w-full"
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.867728529701!2d-65.30011689999999!3d-26.81234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942242d98496ebcb%3A0x4bf0281152701fe4!2sAv.%20Aconquija%202044%2C%20T4107%20CEU%2C%20Tucum%C3%A1n!5e0!3m2!1ses!2sar!4v1774631817691!5m2!1ses!2sar"
          width="100%"
          height="450"
          style={{ border: "0" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </motion.div>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Escribinos por WhatsApp"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[200] group"
      >
        <span className="hidden md:block pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/70 px-3 py-1 text-xs font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Escribinos por WhatsApp
        </span>
        <span className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#25D366]/90 text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-[#25D366] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40">
          <FaWhatsapp className="text-2xl md:text-3xl" />
        </span>
      </a>

      <ModalGaleria
        isOpen={galleryOpen}
        onClose={cerrarGaleria}
        images={dynamicGalleryImages}
      />

      <Footer />
    </motion.div>
  );
};

export default SedeYerbaBuena;