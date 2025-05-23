import React, { useState, useEffect } from 'react';
import Navbar from '../../components/header/Navbar';
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom'; // Importar Link
import './Styles/Productos.css';

// IMAGENES PRODUCTOS INICIO
import ImgBuzoNaranjaGuille from './Img/1.jpg';
import ImgBuzoNegroGuille from './Img/2.jpg';
import ImgBuzoNegroGime from './Img/3.jpg';
import ImgBuzoNaranjaGime from './Img/4.jpg';
import ImgBuzoBlackWhite from './Img/BuzoBlackwHITE.png';
import top1 from './Img/top1.png';
import top2 from './Img/top2.png';
import shor1 from './Img/short1.jpg';
import shor2 from './Img/short2.jpg';
import shor3 from './Img/short3.jpg';
import remera1 from './Img/remera1.png';
import remera_retro1 from './Img/remera-reto.jpg';
import remera_retro2 from './Img/remera-retro(espalda).jpg';
import remera_gray1 from './Img/remera-gris-clara.jpg';
import remera_gray2 from './Img/remera-gris-oscura.jpg';
import calza1 from './Img/calza1.png';
import calza2 from './Img/calza2.png';
import calzacorta1 from './Img/calza1_corta.png';
import calzacorta2 from './Img/calza2_corta.png';
import calza1biker from './Img/calza1_biker.png';
import calza2biker from './Img/calza2_biker.png';
// IMAGENES PRODUCTOS FIN

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Íconos de flechas

const ProductsPrincipal = () => {
  // Desplazar hacia la parte superior cuando el componente se monte
  useEffect(() => {
    window.scrollTo({
      top: 0, // Desplazar hacia arriba de la página
      behavior: 'smooth' // Añadir desplazamiento suave
    });
  }, []);
  // Muestra las remeras over premium
  const productosPremium = [
    {
      id: 1,
      nombre: 'BUZO HAMMER X BLANCO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [ImgBuzoNaranjaGuille, ImgBuzoNaranjaGime]
    },
    {
      id: 2,
      nombre: 'BUZO HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [ImgBuzoNegroGuille, ImgBuzoNegroGime]
    },
    {
      id: 3,
      nombre: 'BUZO HAMMER X BLACK AND WHITE',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [ImgBuzoBlackWhite, ImgBuzoBlackWhite]
    },
    {
      id: 4,
      nombre: 'TOP HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [top1, top2]
    },
    {
      id: 5,
      nombre: 'SHORT HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [shor1, shor2, shor3]
    },
    {
      id: 6,
      nombre: 'REMERA HAMMER X BLANCA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [remera1, remera1]
    },
    {
      id: 7,
      nombre: 'REMERA RETRO HAMMER X PINK',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [remera_retro1, remera_retro2]
    },
    {
      id: 8,
      nombre: 'REMERA HAMMER X GREY',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [remera_gray1, remera_gray2]
    },
    {
      id: 9,
      nombre: 'CALZA HAMMER X NEGRA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calza1, calza2]
    },
    {
      id: 10,
      nombre: 'CALZA CORTA HAMMER X NEGRA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calzacorta1, calzacorta2]
    },
    {
      id: 11,
      nombre: 'CALZA CORTA BIKER HAMMER X NEGRA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calza1biker, calza2biker]
    }
  ];

  // Estado para controlar el modal y el producto seleccionado
  const [modalVisible, setModalVisible] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  // Números de WhatsApp con sus sedes
  const sedes = [
    { nombre: 'Monteros', numero: '3863564651' },
    { nombre: 'Concepción', numero: '3865855100' },
    { nombre: 'Barrio Sur', numero: '3813988383' }
  ];

  // Estado para manejar la imagen actual de cada producto
  const [imagenActual, setImagenActual] = useState(
    productosPremium.map(() => 0)
  );

  const handlePrevImage = (index) => {
    setImagenActual((prev) =>
      prev.map((imgIndex, i) =>
        i === index
          ? imgIndex === 0
            ? productosPremium[index].imagenes.length - 1
            : imgIndex - 1
          : imgIndex
      )
    );
  };

  const handleNextImage = (index) => {
    setImagenActual((prev) =>
      prev.map((imgIndex, i) =>
        i === index
          ? imgIndex === productosPremium[index].imagenes.length - 1
            ? 0
            : imgIndex + 1
          : imgIndex
      )
    );
  };
  // version vieja
  // const handleWhatsAppClick = (nombre, precio) => {
  //   const phoneNumber = '3863564651'; // Número de WhatsApp
  //   const message = `Hola, estoy interesado en el producto: ${nombre}.`;
  //   const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
  //     message
  //   )}`;
  //   window.open(whatsappUrl, '_blank');
  // };

  // Abrir modal al clickear producto
  const handleProductoClick = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
  };

  // Abrir WhatsApp con el número elegido
  const handleWhatsAppClick = (numero) => {
    const message = `Hola, estoy interesado en el producto: ${productoSeleccionado.nombre}.`;
    const whatsappUrl = `https://wa.me/${numero}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
    setModalVisible(false); // cerrar modal luego de abrir
  };

  // Cerrar modal
  const closeModal = () => {
    setModalVisible(false);
    setProductoSeleccionado(null);
  };

  function formatTelefonoArg(numero) {
    const digitos = numero.replace(/\D/g, '');
    if (digitos.length === 10) {
      return `${digitos.slice(0, 4)} ${digitos.slice(4, 6)}-${digitos.slice(
        6
      )}`;
    }
    return numero; // si no tiene 10 dígitos, lo dejamos tal cual
  }

  return (
    <>
      <Navbar />
      <div className="mt-10 bg-gradient-to-b min-h-screen">
        <h1 className="font-bignoodle text-orange-500 text-center text-5xl font-bold py-10">
          productos hammer x
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 px-3 md:px-5">
          {productosPremium.map((producto, index) => (
            <div
              key={producto.id}
              className="producto-card border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer"
              onClick={() => handleProductoClick(producto)}
            >
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                {/* Imagen principal */}
                <img
                  src={producto.imagenes[imagenActual[index]]}
                  alt={producto.nombre}
                  className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                />

                {/* Imagen secundaria en hover */}
                {producto.imagenes.length > 1 && (
                  <img
                    src={producto.imagenes[imagenActual[index] === 0 ? 1 : 0]}
                    alt={producto.nombre}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                )}

                {/* Flecha izquierda */}
                {producto.imagenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // evitar que se active el click del producto
                      e.preventDefault();
                      handlePrevImage(index);
                    }}
                    className="absolute top-1/2 left-1 sm:left-2 transform -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full text-orange-500 hover:bg-black"
                  >
                    <FaChevronLeft size={16} sm:size={20} />
                  </button>
                )}

                {/* Flecha derecha */}
                {producto.imagenes.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleNextImage(index);
                    }}
                    className="absolute top-1/2 right-1 sm:right-2 transform -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full text-orange-500 hover:bg-black"
                  >
                    <FaChevronRight size={16} sm:size={20} />
                  </button>
                )}
              </div>

              <div className="p-2 sm:p-4 text-center bg-transparent">
                <h3 className="text-lg sm:text-xl font-semibold text-orange-500">
                  {producto.nombre}
                </h3>

                <button
                  className="mt-2 sm:mt-4 cursor-pointer font-bignoodle text-xl sm:text-2xl bg-white text-black rounded-full px-4 sm:px-6 py-1 sm:py-2 transition duration-300 hover:bg-gray-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleProductoClick(producto);
                  }}
                >
                  COMPRAR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal para selección de sede */}
      {/* Modal para selección de sede */}
      {modalVisible && productoSeleccionado && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl p-8 w-96 max-w-full shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-bignoodle text-3xl font-extrabold mb-8 text-center text-gray-900 tracking-wide">
              Selecciona una sede
            </h2>

            <div className="flex flex-col gap-5">
              {sedes.map((sede) => (
                <button
                  key={sede.numero}
                  onClick={() => handleWhatsAppClick(sede.numero)}
                  className="flex items-center justify-between bg-green-600 hover:bg-green-700 text-white rounded-xl py-4 px-8 shadow-md transition focus:outline-none focus:ring-4 focus:ring-green-300"
                >
                  <span className="font-semibold text-xl">{sede.nombre}</span>
                  <div className="flex items-center gap-4 font-mono text-lg">
                    {formatTelefonoArg(sede.numero)}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={closeModal}
              className="mt-10 w-full py-3 text-gray-800 border border-gray-300 rounded-xl hover:bg-gray-100 transition focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default ProductsPrincipal;
