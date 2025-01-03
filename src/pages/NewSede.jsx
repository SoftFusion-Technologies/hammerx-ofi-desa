import React from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { motion } from 'framer-motion';
import Mapa from '../components/footer/Mapa';
import imgHammerOrange from '../images/logohammerorange.png';
import imgRedInsta from '../images/redes/instagram.png';
import imgRedFace from '../images/redes/facebook.png';
import imgRedWsp from '../images/redes/whatsapp.png';
import '../styles/clients/newsede.css';
const NewSede = () => {
  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen">
        <motion.section
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bgvsps_v2 p-8">
            <h1
              className="text-6xl font-bold  font-bignoodle"
              style={{ color: '#fc4b08' }}
            >
              ¡Conoce Nuestra Nueva Sede!
            </h1>
            <img
              src={imgHammerOrange}
              alt="logo naranja hammer"
              className="w-full h-auto"
            />
          </div>
          <h2
            className="inline-block p-2 text-4xl md:text-6xl font-bold text-white font-bignoodle text-center rounded-lg"
            style={{ backgroundColor: '#fc4b08' }}
          >
            BARRIO SUR
          </h2>
        </motion.section>

        <div
          className="mx-auto px-4 py-8"
          style={{ backgroundColor: '#fc4b08' }}
        >
          {/* Section Title */}

          {/* Highlights Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              {
                title: '800 m² DE SUPERFICIE',
                description: 'Para que nunca te falte espacio'
              },
              {
                title: 'Equipos de última generación',
                description: '+70 Maquinas importadas con la ultima tecnología'
              },
              {
                title: 'Múltiples Actividades Guiadas',
                description:
                  'Musculación, cardio, entrenamiento funcional y pilates'
              },
              {
                title: 'AMBIENTE CLIMATIZADO',
                description:
                  'Todos nuestros salones cuentan con aire acondicionado y calefacción'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-[#fc4b08] shadow-lg p-6 rounded-lg text-center border-2 border-white"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <h3 className="text-2xl text-white font-bignoodle">
                  {item.title}
                </h3>
                <p className="text-white mt-2 font-messina">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </section>

          {/* Special Offer Section */}
          <section
            className="text-center bg-gray-600 p-6 rounded-lg shadow-md mt-12 border-2 border-white"
            style={{ backgroundColor: '#fc4b08' }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white font-bignoodle">
              PREVENTA
            </h2>
            <p className="mb-5 text-white mt-2 uppercase font-bignoodle text-2xl">
              ¡Inscribite ahora y obtené hasta un 50% OFF!
            </p>
            <a
              href="https://wa.me/543863564651?text=Hola!%20Quiero%20info%20de%20HAMMERX%20B%C2%B0%20Sur."
              target="_blank"
              rel="noopener noreferrer"
              className="uppercase px-6 py-3 bg-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition duration-300"
              style={{ color: '#fc4b08' }}
            >
              ¡Quiero reservar mi cupo!
            </a>
          </section>

          <a
            href="https://wa.me/543863564651?text=Hola!%20Quiero%20info%20de%20HAMMERX%20B%C2%B0%20Sur."
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex flex-col items-center bg-white py-4 px-6 rounded-lg shadow-lg cursor-pointer"
          >
            <div
              className="text-xl text-[#fc4b08] font-bignoodle mb-2"
              style={{ color: '#fc4b08' }}
            >
              Contáctanos
            </div>
            <img
              src={imgRedWsp}
              alt="WhatsApp"
              className="w-16 h-16 rounded-full"
            />
          </a>

          <section className="text-center p-6 rounded-lg shadow-md mt-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white font-bignoodle">
              Síguenos en redes sociales
            </h2>
            <div className="flex justify-center gap-8 mt-6">
              <a
                href="https://www.instagram.com/hammerx.ok/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img
                  src={imgRedInsta}
                  alt="Logo Instagram"
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                />
              </a>
              <a
                href="https://www.facebook.com/hammerxgym?locale=es_LA"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img
                  src={imgRedFace}
                  alt="Logo Facebook"
                  className="w-16 h-16 hover:scale-110 transition-transform duration-300"
                />
              </a>
            </div>
          </section>
        </div>
      </div>
      <h2
        style={{ background: '#fc4b08' }}
        className="mb-5 text-4xl md:text-6xl font-bold text-white font-bignoodle text-center"
      >
        CONOCE NUESTRA UBICACIÓN
      </h2>
      <Mapa></Mapa>
      <Footer />
    </>
  );
};

export default NewSede;
