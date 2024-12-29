import React from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { motion } from 'framer-motion';
import Mapa from '../components/footer/Mapa';
import imgHammerOrange from '../images/logohammerorange.png';
const NewSede = () => {
  return (
    <>
      <Navbar />
      <div className="mt-20 bg-gray-100 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Section Title */}
          <motion.section
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src={imgHammerOrange}
              alt="logo naranja hammer"
              className="w-full h-auto"
            />
            <h2 className="mb-5 bg-gray-100 text-4xl md:text-6xl font-bold text-gray-800 font-bignoodle text-center">
              BARRIO SUR
            </h2>
          </motion.section>

          {/* Highlights Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: '800 m² DE SUPERFICIE',
                description: 'Para que nunca te falte espacio.'
              },
              {
                title: 'Equipos de última generación',
                description: '+70 Equipos de última generación'
              },
              {
                title: 'Múltiples Actividades Guiadas',
                description:
                  'Musculación, cardio, entrenamiento funcional y pilates.'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="bg-white shadow-lg p-6 rounded-lg text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <h3 className="text-2xl font-bold text-gray-800 font-bignoodle">
                  {item.title}
                </h3>
                <p className="text-gray-600 mt-2 font-messina">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </section>

          {/* Gallery Section */}
          {/* <section className="mb-12">
            <h2 className="text-5xl font-bold text-gray-800 text-center mb-6 font-bignoodle">
              Galería de Imágenes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {['Nueva sede 1', 'Nueva sede 2', 'Nueva sede 3'].map(
                (altText, index) => (
                  <motion.div
                    key={index}
                    className="h-48 bg-gray-300 rounded-lg overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={`https://via.placeholder.com/400?text=${altText}`}
                      alt={altText}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                )
              )}
            </div>
          </section> */}

          {/* Testimonials Section */}
          {/* <section className="text-center my-12">
            <h2 className="text-5xl font-bold text-gray-800 font-bignoodle">
              Lo que Dicen Nuestros Clientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                {
                  quote:
                    'La nueva sede es espectacular. Los equipos son de primera calidad y los entrenadores son súper profesionales.',
                  name: 'Juan Pérez'
                },
                {
                  quote:
                    'Me encanta el ambiente y las clases grupales. Definitivamente un lugar para motivarse a entrenar.',
                  name: 'María García'
                },
                {
                  quote:
                    'Espacios amplios y modernos. El mejor gimnasio de la ciudad sin duda.',
                  name: 'Luis Fernández'
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="bg-white shadow-lg p-6 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  <h4 className="text-gray-800 font-bold mt-4">
                    - {testimonial.name}
                  </h4>
                </motion.div>
              ))}
            </div>
          </section> */}

          {/* Special Offer Section */}
          <section className="text-center bg-gray-100 p-6 rounded-lg shadow-md mt-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 font-bignoodle">
              PREVENTA
            </h2>
            <p className="text-gray-600 mt-2">
              ¡Inscribite ahora y obtené hasta un 50% de descuento!
            </p>
            <button className="uppercase mt-4 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition duration-300">
              Aprovechar Promoción
            </button>
          </section>

          {/* Contact Form */}
          <section className="text-center bg-white p-6 rounded-lg shadow-md mt-12">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 font-bignoodle">
              Contactanos
            </h2>
            <form className="mt-4 flex flex-col gap-4">
              {/* Campo de Nombre */}
              <div className="w-full">
                <input
                  type="text"
                  placeholder="Nombre"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
              </div>

              {/* Campo de Teléfono */}
              <div className="w-full">
                <input
                  type="tel"
                  placeholder="Teléfono"
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
              </div>

              {/* Botón de WhatsApp */}
              <a
                href="https://wa.me/543863564651?text=Hola!%20Quiero%20info%20de%20HAMMERX%20B%C2%B0%20Sur."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-orange-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition duration-300 text-center block text-lg"
              >
                OBTENER MI DESCUENTO
              </a>
            </form>
          </section>
        </div>
      </div>
      <h2 className="mb-5 bg-gray-100 text-4xl md:text-6xl font-bold text-gray-800 font-bignoodle text-center">
        CONOCE NUESTRA UBICACIÓN
      </h2>
      <Mapa></Mapa>
      <Footer />
    </>
  );
};

export default NewSede;
