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
import PlantaB_Sala_Pesos_Libres from "../images/sedes/Barrio Norte/PlantaB_Sala_Pesos_Libres.webp";
import Musculacion from "../images/sedes/Barrio Norte/Musculacion.webp";
import Balanza_IA from "../images/sedes/Barrio Norte/BalanzaIA.webp";
import Sala_Pilates from "../images/sedes/Barrio Norte/Sala_pilates.webp";
import Silla_Masajes from "../images/sedes/Barrio Norte/Silla_Masajes.webp";
import BalanzaIA from "../images/sedes/SedeBarrioNorte1.png";
import Terraza from "../images/sedes/Barrio Norte/Terraza.webp";
import "../styles/clients/newsede.css";
import ModalContactoSede from "../components/ModalContactoSede";
import FormTestClass from "../components/Forms/FormTestClass";

// --- Iconos para las secciones ---
import {
  FaMapMarkerAlt,
  FaRegBuilding,
  FaDumbbell,
  FaHeartbeat,
  FaShower,
  FaUsers,
  FaWhatsapp,
  FaWeight,
  FaChair,
  FaHammer,
  FaWeightHanging,
} from "react-icons/fa";

import { FiSun, FiWind } from "react-icons/fi";
import { MdSelfImprovement } from "react-icons/md";

const SedeBarrioNorte = () => {
  const [modalContacto, setModalContacto] = useState(false);
  const [modalTestClass, setModalTestClass] = useState(false);

  const abrirModalContacto = () => setModalContacto(true);
  const cerrarModalContacto = () => setModalContacto(false);
  const abrirModalTestClass = () => setModalTestClass(true);
  const cerrarModalTestClass = () => setModalTestClass(false);

  // Scroll suave hacia la sección "Instalaciones por Piso" con offset responsive
  const scrollToInstalaciones = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const id = "instalaciones-por-piso";
    const el = document.getElementById(id);
    if (!el) return;
    const headerOffset = window.innerWidth < 768 ? 72 : 120;
    const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  };

  // --- Datos para las instalaciones de la Planta Baja ---
  const classNameImg = "rounded-2xl";

  const groundFloorFeatures = [
    {
      id: 1,
      icon: FaDumbbell,
      title: "Sala de Musculación",
      description: "+70 equipos importados de última generación.",
      image: Musculacion,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      id: 2,
      icon: FaWeightHanging,
      title: "Sala de pesos libres",
      description: "Para que entrenes sin espera.",
      image: PlantaB_Sala_Pesos_Libres,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      id: 3,
      icon: FaWeight,
      title: "Balanza con IA",
      description:
        "¡Única en la provincia! Tecnología avanzada para un seguimiento preciso de tu progreso, composición corporal, postura, entre muchos otros datos.",
      image: Balanza_IA,
      isFullWidth: true,
    },
  ];

  // --- Datos para las instalaciones del Primer Piso ---
  const firstFloorFeatures = [
    {
      id: 1,
      icon: FaHeartbeat,
      title: "Sector Cardio",
      description:
        "+10 cintas inteligentes, bicis elípticas y otros equipos para tu entrenamiento cardiovascular.",
      image: Cardio_1,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      id: 2,
      icon: MdSelfImprovement,
      title: "Sala de Pilates",
      description: "La sala de pilates climatizada más grande de Tucumán.",
      image: Sala_Pilates,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      id: 3,
      icon: FaShower,
      title: "Baños y vestuarios",
      description:
        "Duchas y vestuarios con lockers individuales para tu comodidad después de cada entrenamiento.",
    },
  ];

  // --- NUEVO: Datos para las instalaciones del Segundo Piso ---
  const secondFloorFeatures = [
    {
      icon: FaUsers,
      title: "Sala de Clases Grupales",
      description:
        "Funcional, HIIT, Fullbody y otras clases para que elijas la que mejor se adapte a tu objetivo y ritmo, todas incluidas en tu mismo plan.",
      image: Clase_grupales,
      isFullWidth: true,
      className: classNameImg,
    },
    {
      icon: FiSun,
      title: "Solarium",
      description: "Cabina de bronceado para adelantarse al verano.",
    },
    {
      icon: FaChair,
      title: "Sector de relax con sillas para masajes",
      description:
        "Relaja tus músculos después de cada entrenamiento con nuestras modernas sillas de masaje, ¡un verdadero lujo!",
      image: Silla_Masajes,
      isFullWidth: true,
    },
    {
      icon: FiWind,
      title: "Terraza al aire libre",
      description:
        "Espacio al aire libre para complementar tus entrenamientos, estirar o simplemente descansar.",
      image: Terraza,
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
      <div className="relative text-center overflow-hidden bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] pb-0 md:pb-12">
        <div className="absolute inset-0 flex items-center justify-center gap-x-24 lg:gap-x-[32rem] mr-0 lg:mr-36 z-0 pointer-events-none">
          <span className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none opacity-70 text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap">
            ¡NUEVA
          </span>
          <span className="font-bignoodle text-8xl md:text-9xl lg:text-[18rem] leading-none opacity-70 text-transparent [-webkit-text-stroke:2px_white] lg:[-webkit-text-stroke:3px_white] whitespace-nowrap">
            SEDE!
          </span>
        </div>
        <div className="relative z-10 flex items-center justify-center py-0 md:py-16">
          <motion.div
            className="w-full md:w-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-b from-[#ff8c00] via-[#5f1212] to-black rounded-sm md:rounded-xl shadow-2xl px-6 py-5 md:px-10 md:py-5 text-center w-full">
              <button
                onClick={scrollToInstalaciones}
                className="inline-block bg-[#ff7b00] border-[1px] border-[#cecece] text-white font-montserrat px-6 py-2 rounded-md mb-0 md:mb-8 text-lg transition-transform hover:scale-105"
              >
                Conocé mas
              </button>
              <p className="font-montserrat text-3xl md:text-6xl text-gray-200 mb-2">
                Conocé nuestra nueva sede
              </p>
              <img
                src={logo}
                alt="logo"
                className="my-0 md:my-5 max-w-xs lg:max-w-md mx-auto"
              />
              <p className="font-bignoodle uppercase text-3xl md:text-6xl text-gray-200">
                Barrio Norte
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Sección de introducción y detalles de la sede */}
      <section className="py-2 md:py-12 bg-gray-100">
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
                                que van a cambiar tu forma de entrenar para
                siempre
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
            <h2
              id="instalaciones-por-piso"
              className="text-4xl font-bignoodle text-center uppercase tracking-widest z-10 text-[#fc4b08]"
            >
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
            <div className="flex overflow-x-auto gap-4 pb-4 px-6 ">
              {groundFloorFeatures.map((feature, index) => (
                <div key={index} className="shrink-0 w-64 md:w-80 ">
                  <div
                    className={`group p-4 border border-gray-200 rounded-lg h-full flex flex-col bg-gradient-to-b from-gray-700 to-orange-400`}
                  >
                    <div>
                      <feature.icon className="text-4xl md:text-5xl mb-3 text-[#fc4b08] animate-float" />
                      <h4 className="font-bignoodle uppercase text-lg md:text-xl mb-1 text-[#fc4b08] ">
                        {feature.title}
                      </h4>
                      <p className="text-white text-sm md:text-base">
                        {feature.description}
                        {feature.id === 2 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
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
                          <feature.icon className="text-9xl md:text-[10rem] text-[#fc4b08]" />
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
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-[#fc4b08] mb-12">
            <div className="p-6">
              {" "}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">
                  1
                </span>
                <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">
                  Primer Piso - Resistencia y Control
                </h3>
              </div>
            </div>
            {/* Contenedor del carrusel*/}
            <div className="flex overflow-x-auto gap-4 pb-4 px-6">
              {" "}
              {firstFloorFeatures.map((feature, index) => (
                <div key={index} className="shrink-0 w-64 md:w-80">
                  <div
                    className={`group p-4 border border-gray-200 rounded-lg h-full min-h-[500px] md:min-h-[580px] flex flex-col ${
                      feature.title === "Sala de Pilates"
                        ? "bg-gradient-to-b from-gray-100 to-orange-300"
                        : "bg-gradient-to-b from-gray-500 via-gray-700 to-orange-500"
                    }`}
                  >
                    <div>
                      <feature.icon className="text-4xl md:text-5xl mb-3 text-[#fc4b08] animate-float" />
                      <h4 className="font-bignoodle uppercase text-lg md:text-xl mb-1 text-[#fc4b08]">
                        {feature.title}
                      </h4>
                      <p
                        className={`text-sm md:text-base ${
                          feature.title === "Sala de Pilates"
                            ? "text-gray-600 "
                            : "text-white"
                        }`}
                      >
                        {feature.description}
                        {feature.id === 2 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
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
          {/* --- BLOQUE SEGUNDO PISO --- */}
          <div className="bg-white rounded-lg shadow-lg border-t-4 border-[#fc4b08] mb-12">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">
                  2
                </span>
                <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">
                  Segundo Piso - Movimiento, energía y bienestar
                </h3>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-4 px-6">
              {secondFloorFeatures.map((feature, index) => (
                <div key={index} className="shrink-0 w-64 md:w-80">
                  <div className="group p-4 border border-gray-200 rounded-lg h-full flex flex-col bg-gradient-to-b from-gray-700  via-orange-300 to-orange-500 ">
                    <div>
                      <feature.icon className="text-4xl md:text-5xl mb-3 text-[#fc4b08] animate-float" />
                      <h4 className="font-bignoodle uppercase text-lg md:text-xl mb-1 text-[#fc4b08]">
                        {feature.title}
                      </h4>
                      <p className="text-white text-sm md:text-base ">
                        {feature.description}
                        {index >= 2 && (
                          <>
                            <br />
                            <br />
                          </>
                        )}
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
        <button
          onClick={abrirModalContacto}
          rel="noopener noreferrer"
          className="inline-block mt-6 bg-white border-2 border-white rounded-lg px-8 py-4 transition-transform transform hover:scale-105"
        >
          <span className="text-2xl sm:text-3xl font-bignoodle uppercase text-[#fc4b08]">
            ¡Quiero conocer sobre la preventa!
          </span>
          <FaWhatsapp className="inline-block text-4xl ml-3 text-[#fc4b08]" />
        </button>
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
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4223.568095001174!2d-65.20257459999999!3d-26.8210825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225c22aac40d25%3A0xd5e93c92c00674bc!2s25%20de%20Mayo%20720%2C%20T4000%20San%20Miguel%20de%20Tucum%C3%A1n%2C%20Tucum%C3%A1n!5e1!3m2!1ses!2sar!4v1761148495178!5m2!1ses!2sar"
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
          sede="Barrio norte"
        />
        <FormTestClass isOpen={modalTestClass} onClose={cerrarModalTestClass} />
      </div>
      <Footer />
    </>
  );
};

export default SedeBarrioNorte;
