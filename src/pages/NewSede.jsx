import React from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { motion } from 'framer-motion';
import Mapa from '../components/footer/Mapa';
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
            <h1 className="text-6xl font-bold text-gray-800 font-bignoodle">
              ¡Conoce Nuestra Nueva Sede!
            </h1>
            <p className="text-xl text-orange-500 mt-4 font-messina">
              Estamos emocionados de presentarte nuestro nuevo espacio diseñado
              especialmente para ti.
            </p>
          </motion.section>

          {/* Highlights Section */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Equipos Modernos',
                description:
                  'La última tecnología en equipos de entrenamiento para potenciar tus resultados.'
              },
              {
                title: 'Clases Especializadas',
                description:
                  'Una amplia variedad de clases grupales adaptadas a todos los niveles.'
              },
              {
                title: 'Espacios Amplios',
                description:
                  'Diseñados para ofrecer comodidad y seguridad en cada entrenamiento.'
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
          <section className="mb-12">
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
          </section>

          {/* Testimonials Section */}
          <section className="text-center my-12">
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
          </section>

          {/* Special Offer Section */}
          <section className="text-center bg-orange-100 p-6 rounded-lg shadow-md mt-12">
            <h2 className="text-4xl font-bold text-gray-800">
              Promoción de Apertura
            </h2>
            <p className="text-gray-600 mt-2">
              ¡Inscríbete ahora y obtén 50% de descuento en tu primer mes!
            </p>
            <button className="mt-4 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-500 transition duration-300">
              Aprovechar Promoción
            </button>
          </section>

          {/* Contact Form */}
          <section className="text-center bg-white p-6 rounded-lg shadow-md mt-12">
            <h2 className="text-3xl font-bold text-gray-800">
              ¿Interesado en Conocernos?
            </h2>
            <p className="text-gray-600 mt-2">
              Déjanos tus datos y nos pondremos en contacto contigo.
            </p>
            <form className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nombre"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
              <input
                type="email"
                placeholder="Correo Electrónico"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
              />
              <textarea
                placeholder="Tu mensaje"
                className="border border-gray-300 rounded-lg px-4 py-2 w-full col-span-2"
              ></textarea>
              <button
                type="submit"
                className="col-span-2 bg-orange-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-orange-500 transition duration-300"
              >
                Enviar
              </button>
            </form>
          </section>
        </div>
      </div>
      <Mapa></Mapa>
      <Footer />
    </>
  );
};

export default NewSede;
