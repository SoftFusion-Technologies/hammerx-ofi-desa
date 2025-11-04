import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/footer/Footer";
import { logo } from "../images/svg/index";
import SillaPilates from "../images/sedes/SedeBarrioNorte2.png";
// --- Imágenes de la galería (Comentadas para futura implementación) ---
// import Box from "../images/sedes/Barrio Norte/Box.webp";
// import Cardio from "../images/sedes/Barrio Norte/Cardio.webp";
import Cardio_1 from "../images/sedes/Barrio Norte/Cardio1.webp";
// import Fachada from "../images/sedes/Barrio Norte/Fachada.webp";
// import Sala_Principal from "../images/sedes/Barrio Norte/Sala principal.webp";
// import Sala_Principal_1 from "../images/sedes/Barrio Norte/Sala principal 2.webp";
import Clase_grupales from "../images/sedes/Barrio Norte/Clase_grupales.webp";
// import PlantaB_Sala_Pesos_Libres from "../images/sedes/Barrio Norte/PlantaB_Sala_Pesos_Libres.webp";
import Musculacion from "../images/sedes/Barrio Norte/Musculacion.webp";
import BalanzaIA from "../images/sedes/SedeBarrioNorte1.png";
import FormTestClass_v2 from "../components/Forms/FormTestClass_v2";
import "../styles/clients/newsede.css";
import ModalContactoSede from "../components/ModalContactoSede";
import FormTestClass from "../components/Forms/FormTestClass";

// --- Iconos para las secciones ---
import {
  FaMapMarkerAlt,
  FaRegBuilding,
  FaDumbbell,
  FaSpa,
  FaHeartbeat,
  FaShower,
  FaUsers,
  FaSun,
  FaLeaf,
  FaWhatsapp,
  FaWeight,
  FaChair,
  FaHammer, // Icono de martillo
} from "react-icons/fa";

const SedeBarrioNorte = () => {
  const [modalContacto, setModalContacto] = useState(false);
  const [modalTestClass, setModalTestClass] = useState(false);

  const abrirModalContacto = () => setModalContacto(true);
  const cerrarModalContacto = () => setModalContacto(false);
  const abrirModalTestClass = () => setModalTestClass(true);
  const cerrarModalTestClass = () => setModalTestClass(false);

  // --- Datos para las instalaciones de la Planta Baja ---
  const classNameImg = "rounded-2xl";

  const groundFloorFeatures = [
    {
      icon: FaDumbbell,
      title: "Sala de Musculación",
      description:
        "+70 equipos de última generación para que entrenes sin esperas.",
      image: Musculacion,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      icon: FaShower,
      title: "Baños y Vestuarios",
      description:
        "Duchas y vestuarios con lockers individuales para tu comodidad después de cada entrenamiento.",
    },
    {
      icon: FaHeartbeat,
      title: "Sector Cardio",
      description:
        "+10 cintas inteligentes, bicis elípticas y otros equipos para tu entrenamiento cardiovascular.",
      image: Cardio_1,
      isFullWidth: true,
      className: classNameImg,
    },

    {
      icon: FaWeight,
      title: "Balanza con IA",
      description:
        "¡Única en la provincia! Tecnología avanzada para un seguimiento preciso de tu progreso y composición corporal.",
      image: BalanzaIA,
      isFullWidth: true,
    },
  ];

  // --- Datos para las instalaciones del Primer Piso ---
  const firstFloorFeatures = [
    {
      icon: FaSpa,
      title: "Sala de Pilates",
      description:
        "+8 camas y diferentes elementos para entrenar en la sala climatizada de pilates más grande de Tucumán.",
    },
    {
      icon: FaUsers,
      title: "Sala de Clases Grupales",
      description:
        "Funcional, HIIT, Fullbody y otras clases para que elijas la que mejor se adapte a tu objetivo y ritmo.",
      image: Clase_grupales,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      icon: FaSun,
      title: "Sala de Relax y Solarium",
      description:
        "Sillones, sala de estar y cabina de bronceado para relajarte y descontracturarte con tus amig@s.",
    },
    {
      icon: FaLeaf,
      title: "Terraza",
      description:
        "Espacio al aire libre para complementar tus entrenamientos, estirar o simplemente descansar.",
    },
    {
      icon: FaChair,
      title: "Sillas de Masajes",
      description:
        "Relaja tus músculos después de cada entrenamiento con nuestras modernas sillas de masaje, ¡un verdadero lujo!",
      image: SillaPilates,
      isFullWidth: true,
    },
  ];

  // --- Imágenes para la mini-galería (Comentadas para futura implementación) ---
  /*
  const galleryImages = [
    { src: Fachada, alt: "Fachada Sede Barrio Norte" },
    { src: Sala_Principal, alt: "Sala Principal" },
    { src: Sala_Principal_1, alt: "Sala Principal 2" },
    { src: PlantaB_Sala_Pesos_Libres, alt: "Sala Pesos Libres" },
    { src: Box, alt: "Sector Box" },
    { src: Cardio, alt: "Sector Cardio" },
  ];
  */

  // Array de nombres de imágenes a EXCLUIR del efecto de opacidad/martillo
  const excludeHammerEffect = [BalanzaIA, SillaPilates];

  return (
    <>
      <div className="relative text-center overflow-hidden bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] pb-12">
        <div className="absolute inset-0 flex items-center justify-center gap-x-24 lg:gap-x-[32rem] mr-0 lg:mr-36 z-0 pointer-events-none">
          <span className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none opacity-70 text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap">
            ¡NUEVA
          </span>
          <span className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none opacity-70 text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap">
            SEDE!
          </span>
        </div>
        <div className="relative z-10 flex items-center justify-center py-12 md:py-16">
          <motion.div
            className="shrink-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-white rounded-xl shadow-2xl px-6 py-3 md:px-10 md:py-5 text-center">
              <p className="font-bignoodle uppercase text-3xl md:text-6xl text-gray-800 mb-2">
                ¡Conocé nuestra nueva sede!
              </p>
              <img
                src={logo}
                alt="logo"
                className="my-5 max-w-xs lg:max-w-md mx-auto"
              />
              <p className="font-bignoodle uppercase text-3xl md:text-6xl text-[#fc4b08]">
                Barrio Norte
              </p>
              <p className="font-bignoodle uppercase text-xl md:text-4xl text-[#fc4b08] mt-1">
                PARA VIVIR ¡SENSACIONES POSITIVAS!
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sección de introducción y detalles de la sede */}
      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border">
            <div className="flex-1 space-y-4 text-left">
              <h2 className="text-3xl font-bignoodle uppercase text-[#fc4b08]">
                ¡Tu Nuevo Destino Fitness!
              </h2>
              <div className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-4xl text-[#fc4b08]" />
                <div>
                  <h3 className="font-bignoodle uppercase text-lg text-[#fc4b08] ">
                    Ubicación
                  </h3>
                  <p className="text-gray-700 font-semibold ">
                    25 de Mayo 720, San Miguel de Tucumán
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FaRegBuilding className="text-4xl text-[#fc4b08]" />
                <div>
                  <h3 className="font-bignoodle uppercase text-lg text-[#fc4b08]">
                    Superficie Total
                  </h3>
                  <p className="text-gray-700 font-semibold ">
                    1100 M2 de instalaciones de última generación
                  </p>
                </div>
              </div>
            </div>
            <div className="text-white p-6 rounded-lg text-center w-full md:w-96 bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] ">
              <p className="text-7xl font-bignoodle leading-none">3</p>
              <p className="text-2xl font-bignoodle uppercase">Plantas</p>
              <p className="uppercase text-sm font-messina mt-1">
                De puro fitness y bienestar
              </p>
            </div>
          </div>

          <div className="flex justify-center items-center relative py-8 overflow-hidden">
            <p className="absolute left-0 w-1/3 text-4xl font-bignoodle uppercase text-gray-300 opacity-60 text-right pr-4 hidden lg:block">
              Instalaciones por Piso
            </p>
            <p className="absolute right-0 w-1/3 text-4xl font-bignoodle uppercase text-gray-300 opacity-60 text-left pl-4 hidden lg:block">
              Instalaciones por Piso
            </p>
            <h2 className="text-4xl font-bignoodle text-center uppercase tracking-widest z-10 text-[#fc4b08]">
              Instalaciones por Piso
            </h2>
          </div>

          {/* --- BLOQUE PLANTA BAJA --- */}
          {/* VISTA CARRUSEL (Ahora visible en PC y Mobile) */}
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-[#fc4b08] mb-12">
            <div className="p-6">
              {" "}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">
                  PB
                </span>
                <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">
                  Planta Baja - Fuerza y Tecnología
                </h3>
              </div>
            </div>
            {/* Contenedor del carrusel*/}
            <div className="flex overflow-x-auto gap-4 pb-4 px-6">
              {groundFloorFeatures.map((feature, index) => (
                <div key={index} className="shrink-0 w-64 md:w-80">
                  <div
                    className={`p-4 border border-gray-200 rounded-lg h-full flex flex-col bg-gradient-to-b from-orange-50 to-orange-400`}
                  >
                    <div>
                      <feature.icon className="text-4xl md:text-5xl mb-3 text-[#fc4b08]" />
                      <h4 className="font-bignoodle uppercase text-lg md:text-xl mb-1 text-[#fc4b08] font-semibold">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm md:text-base font-semibold">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-4 flex-grow flex items-center justify-center relative overflow-hidden rounded-lg">
                      {feature.image ? (
                        <>
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className={`${
                              feature.className ? feature.className : ""
                            } w-full h-full object-cover min-h-[200px] md:min-h-[250px]`}
                            // Aplicar opacidad si no está en la lista de exclusión
                            style={
                              excludeHammerEffect.includes(feature.image)
                                ? {}
                                : { filter: "brightness(60%)" }
                            }
                          />
                          {!excludeHammerEffect.includes(feature.image) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FaHammer className="text-6xl text-white opacity-80" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full min-h-[200px] md:min-h-[250px] flex items-center justify-center overflow-hidden">
                          <feature.icon className="text-9xl md:text-[10rem] text-[#fc4b08] opacity-80" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- BLOQUE PRIMER PISO --- */}
          {/* VISTA CARRUSEL (Ahora visible en PC y Mobile) */}
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-[#fc4b08]">
            <div className="p-6">
              {" "}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">
                  1
                </span>
                <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">
                  Primer Piso - Clases grupales y Relax
                </h3>
              </div>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-4 px-6">
              {" "}
              {firstFloorFeatures.map((feature, index) => (
                <div key={index} className="shrink-0 w-64 md:w-80">
                  <div className="p-4 border border-gray-200 rounded-lg h-full flex flex-col bg-gradient-to-b from-orange-50 to-orange-400">
                    <div>
                      <feature.icon className="text-4xl md:text-5xl mb-3 text-[#fc4b08]" />
                      <h4 className="font-bignoodle uppercase text-lg md:text-xl mb-1 text-[#fc4b08] font-semibold">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm md:text-base font-semibold">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-4 flex-grow flex items-center justify-center relative overflow-hidden rounded-lg">
                      {feature.image ? (
                        <>
                          <img
                            src={feature.image}
                            alt={feature.title}
                            className={`${
                              feature.className ? feature.className : ""
                            } w-full h-full object-cover min-h-[200px] md:min-h-[250px]`}
                            // Aplicar opacidad si no está en la lista de exclusión
                            style={
                              excludeHammerEffect.includes(feature.image)
                                ? {}
                                : { filter: "brightness(60%)" }
                            }
                          />
                          {!excludeHammerEffect.includes(feature.image) && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <FaHammer className="text-6xl text-white opacity-80" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full min-h-[200px] md:min-h-[250px] flex items-center justify-center overflow-hidden">
                          <feature.icon className="text-9xl md:text-[10rem] text-[#fc4b08] opacity-80" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- NUEVO: BLOQUE GALERÍA ADICIONAL (Comentado para futura implementación) --- */}
          {/*
          <div className="mt-12">
            <h2 className="text-3xl font-bignoodle text-center uppercase tracking-widest z-10 text-[#fc4b08] mb-6">
              Galería de la Sede
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4 px-6">
              {galleryImages.map((image, index) => (
                <div
                  key={index}
                  className="shrink-0 w-64 md:w-80 relative overflow-hidden rounded-lg shadow-lg"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover min-h-[200px] md:min-h-[250px]"
                    style={{ filter: "brightness(60%)" }} // Aplicar opacidad
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaHammer className="text-6xl text-white opacity-80" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          */}
        </div>{" "}
        {/* Cierre del <div className="container mx-auto px-4 max-w-7xl"> */}
      </section>

      {/* Banner de llamado a la acción "Asegura tu lugar" */}
      <section className="py-12 text-center text-white bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] px-10">
        <h2 className="text-6xl font-bignoodle uppercase tracking-wider">
          ¡Asegura tu lugar!
        </h2>
        {/* --- MODIFICADO: Ahora es un enlace a WhatsApp --- */}
        <a
          href="https://wa.me/5493815584172?text=%C2%A1Quiero%20conocer%20sobre%20la%20preventa%21"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-6 bg-white border-2 border-white rounded-lg px-8 py-4 transition-transform transform hover:scale-105"
        >
          <span className="text-2xl sm:text-3xl font-bignoodle uppercase text-[#fc4b08]">
            ¡Quiero conocer sobre la preventa!
          </span>
          <FaWhatsapp className="inline-block text-4xl ml-3 text-[#fc4b08]" />
        </a>
      </section>

      {/* Título de la sección del mapa */}

      <h2
        style={{ background: "#fc4b08" }}
        className="mb-5 text-4xl md:text-6xl font-bold text-white font-bignoodle text-center"
      >
        CONOCE NUESTRA UBICACIÓN
      </h2>

      {/* Mapa de Google */}

      <div id="ubicacion" className="w-full">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4223.568095001174!2d-65.20257459999999!3d-26.8210825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225c22aac40d25%3A0xd5e93c92c00674bc!2s25%20de%20Mayo%20720%2C%20T4000%20San%20Miguel%20de%20Tucum%C3%A1n%2C%20Tucum%C3%A1n!5e1!3m2!1ses!2sar!4v1761148495178!5m2!1ses!2sar" // Tu URL del mapa
          width="100%"
          height="450"
          style={{ border: "0" }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>

      {/* Sección "¡Quiero aprovechar la preventa!" */}
      <div className="p-4">
        <div
          style={{ background: "#fc4b08" }}
          className="flex flex-col items-center justify-center p-6 rounded-lg shadow-lg text-white text-center"
        >
          <h2 className="mb-5 text-4xl md:text-4xl font-bold text-white font-bignoodle text-center">
            ¡Quiero aprovechar la preventa!
          </h2>
          <p className="text-sm">
            Inscríbete para nuestras clases de prueba y asegura tu lugar en
            Barrio Norte.
          </p>
          <button
            onClick={abrirModalTestClass}
            className="uppercase mt-4 px-6 py-2 bg-white text-orange-500 font-semibold rounded-lg shadow hover:bg-gray-100"
          >
            Inscribirme
          </button>
        </div>

        {/* Renderizado de los modales */}
        <ModalContactoSede
          showModal={modalContacto}
          closeModal={cerrarModalContacto}
        />
        <FormTestClass isOpen={modalTestClass} onClose={cerrarModalTestClass} />
      </div>
      <Footer />
    </>
  );
};

export default SedeBarrioNorte;
