import React, { useState } from "react";
import { motion } from "framer-motion";
import Footer from "../components/footer/Footer";
import { logo } from "../images/svg/index";
import SillaPilates from "../images/sedes/SedeBarrioNorte2.jpeg";
import BalanzaIA from "../images/sedes/SedeBarrioNorte1.jpeg";
import FormPostulante from "../components/Forms/FormPostulante";
import FormTestClass_v2 from "../components/Forms/FormTestClass_v2";
import "../styles/clients/newsede.css";
import ModalContactoSede from "../components/ModalContactoSede";

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
  FaWeight, // Icono para la balanza
  FaChair,  // Icono para las sillas de masaje
} from "react-icons/fa";

const SedeBarrioNorte = () => {
  const [modalPostulante, setModalPostulante] = useState(false);
  const [modalContacto, setModalContacto] = useState(false);
  const [modalTestClass, setModalTestClass] = useState(false);

  const abrirModalPostulante = () => setModalPostulante(true);
  const cerrarModalPostulante = () => setModalPostulante(false);
  const abrirModalContacto = () => setModalContacto(true);
  const cerrarModalContacto = () => setModalContacto(false);
  const abrirModalTestClass = () => setModalTestClass(true);
  const cerrarModalTestClass = () => setModalTestClass(false);

  // --- Datos para las instalaciones del Primer Piso (incluye Planta Baja) ---
  const floorOneFeatures = [
    {
      icon: FaWeight,
      title: "Balanza con IA",
      description: "¡Única en la provincia! Tecnología avanzada para un seguimiento preciso de tu progreso y composición corporal.",
      image: BalanzaIA,
      isFullWidth: true, // Propiedad para que ocupe el ancho completo
    },
    {
      icon: FaDumbbell,
      title: "Sala de Musculación",
      description: "+70 equipos de última generación y pesos libres para desafiar tus límites.",
    },
    {
      icon: FaHeartbeat,
      title: "Sector Cardio",
      description: "+10 cintas inteligentes, bicis elípticas y otros equipos para tu entrenamiento cardiovascular.",
    },
    {
      icon: FaSpa,
      title: "Sala de Pilates",
      description: "+8 camas y diferentes elementos para entrenar en la sala climatizada de pilates más grande de Tucumán.",
    },
    {
      icon: FaShower,
      title: "Baños y Vestuarios",
      description: "Duchas y vestuarios con lockers individuales para tu comodidad después de cada entrenamiento.",
    },
  ];

  // --- Datos para las instalaciones del Segundo Piso ---
  const floorTwoFeatures = [
    {
      icon: FaChair,
      title: "Sillas de Masajes",
      description: "Relaja tus músculos después de cada entrenamiento con nuestras modernas sillas de masaje, ¡un verdadero lujo!",
      image: SillaPilates,
      isFullWidth: true, // Propiedad para que ocupe el ancho completo
    },
    {
      icon: FaUsers,
      title: "Sala de Clases Grupales",
      description: "Funcional, HIIT, Fullbody y otras clases para que elijas la que mejor se adapte a tu objetivo y ritmo.",
    },
    {
      icon: FaSun,
      title: "Sala de Relax y Solarium",
      description: "Sillones masajeadores, sala de estar y cabina de bronceado para relajarte y descontracturarte con tus amig@s.",
    },
    {
      icon: FaLeaf,
      title: "Terraza",
      description: "Espacio al aire libre para complementar tus entrenamientos, estirar o simplemente descansar con tus amig@s.",
    },
  ];

  return (
    <>
      {/* Banner Superior con nuevo texto */}
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
              <p className="text-7xl font-bignoodle leading-none">2</p>
              <p className="text-2xl font-bignoodle uppercase">Pisos</p>
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
          
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#fc4b08] mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">1</span>
              <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">Primer Piso - Fuerza y Potencia</h3>
            </div>
            <div className="flex flex-wrap -mx-2"> 
              {floorOneFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`px-2 mb-4 ${feature.isFullWidth ? 'w-full' : 'w-full md:w-1/2 lg:w-1/4'}`}
                >
                  <div className="p-4 border border-gray-200 rounded-lg h-full flex flex-col justify-between">
                    <div>
                      <feature.icon className="text-4xl mb-3 text-[#fc4b08]" />
                      <h4 className="font-bignoodle uppercase text-lg mb-1 text-[#fc4b08] ">{feature.title}</h4>
                      <p className="text-gray-600 text-sm font-semibold ">{feature.description}</p>
                    </div>
                    {feature.image && (
                      <div className="mt-4 flex justify-center">
                        <img src={feature.image} alt={feature.title} className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md " />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-[#fc4b08]">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-white rounded-full h-8 w-8 flex items-center justify-center font-bold bg-[#fc4b08]">2</span>
              <h3 className="text-2xl font-bignoodle uppercase text-[#fc4b08]">Segundo Piso - Clases Grupales y Relax</h3>
            </div>
            <div className="flex flex-wrap -mx-2">
              {floorTwoFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`px-2 mb-4 ${feature.isFullWidth ? 'w-full' : 'w-full md:w-1/2 lg:w-1/3'}`}
                >
                  <div className="p-4 border border-gray-200 rounded-lg h-full flex flex-col justify-between">
                    <div>
                      <feature.icon className="text-4xl mb-3 text-[#fc4b08]" />
                      <h4 className="font-bignoodle uppercase text-lg mb-1 text-[#fc4b08]">{feature.title}</h4>
                      <p className="text-gray-600 text-sm font-semibold ">{feature.description}</p>
                    </div>
                    {feature.image && (
                      <div className="mt-4 flex justify-center">
                        <img src={feature.image} alt={feature.title} className="w-full h-auto max-h-96 object-contain rounded-lg shadow-md" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 text-center text-white bg-gradient-to-r from-[#fc4b08] to-[#ff8c00]">
        <h2 className="text-6xl font-bignoodle uppercase tracking-wider">¡Asegura tu lugar!</h2>
        <button
          onClick={abrirModalContacto}
          className="inline-block mt-6 bg-white border-2 border-white rounded-lg px-8 py-4 transition-transform transform hover:scale-105"
        >
          <span className="text-3xl font-bignoodle uppercase text-[#fc4b08]">Contáctanos</span>
          <FaWhatsapp className="inline-block text-4xl ml-3 text-[#fc4b08]" />
        </button>
      </section>

      <div className="mt-1">
        <div
          className="flex flex-col items-center justify-center p-6 shadow-lg text-white text-center bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] "
        >
          <h2 className="mb-5 text-4xl md:text-4xl font-bold text-white font-bignoodle text-center">
            ¡Quiero aprovechar la preventa!
          </h2>
          <p className="text-sm">
            Inscríbete para nuestras clases de prueba y asegura tu lugar en Barrio Norte.
          </p>
          <button
            onClick={abrirModalTestClass}
            className="uppercase mt-4 px-6 py-2 bg-gray-400 text-orange-300 font-semibold rounded-lg shadow hover:bg-gray-500"
            disabled={true} //QUITAR CUANDO ESTÉ DISPONIBLE
          >
            Inscribirme
          </button>
        </div>

        <ModalContactoSede showModal={modalContacto} closeModal={cerrarModalContacto} />
        <FormPostulante isOpen={modalPostulante} onClose={cerrarModalPostulante} />
        <FormTestClass_v2 isOpen={modalTestClass} onClose={cerrarModalTestClass} />
      </div>
      <h2 className="my-1 text-4xl md:text-6xl font-bold text-white font-bignoodle text-center bg-gradient-to-r from-[#fc4b08] to-[#ff8c00] ">
        CONOCE NUESTRA UBICACIÓN
      </h2>

      <div
        className="flex flex-col md:flex-row lg:flex-row justify-center items-center mx-auto w-full transition-opacity duration-500"
        id="ubicacion"
      >
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

      <Footer />
    </>
  );
};

export default SedeBarrioNorte;