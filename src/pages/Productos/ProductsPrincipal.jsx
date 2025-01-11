import React, { useState, useEffect } from 'react';
import Navbar from '../../components/header/Navbar';
import Footer from '../../components/footer/Footer';
import { Link } from 'react-router-dom'; // Importar Link
import './Styles/Productos.css';
import ImgBuzoNaranjaGuille from './Img/BuzoNaranjaGuille.jpeg';
import ImgBuzoNegroGuille from './Img/BuzoNegroGille.jpeg';
import ImgBuzoNegroGime from './Img/BuzoNegroGime.jpeg';
import ImgBuzoNaranjaGime from './Img/BuzoNaranjaBlancoGime.jpeg';
import ImgGorro from './Img/Gorros.jpeg';
import ImgBotellas from './Img/Botellas.jpeg';
import ImgLlavero from './Img/Llaveros.jpeg';
import ImgRelleno from './Img/Relleno.jpeg';
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
      imagen: ImgBuzoNaranjaGuille
    },
    {
      id: 2,
      nombre: 'BUZO HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgBuzoNegroGuille
    },
    {
      id: 3,
      nombre: 'BUZO HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgBuzoNegroGime
    },
    {
      id: 4,
      nombre: 'BUZO HAMMER X BLANCO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgBuzoNaranjaGime
    },
    {
      id: 5,
      nombre: 'GORRAS HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgGorro
    },
    {
      id: 6,
      nombre: 'BOTELLAS HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgBotellas
    },
    {
      id: 7,
      nombre: 'LLAVEROS HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgLlavero
    },

    {
      id: 8,
      nombre: 'Hola quiero comprar algun producto de HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagen: ImgRelleno
    }
  ];

  const handleWhatsAppClick = (nombre, precio) => {
    const phoneNumber = '3863564651'; // Número de WhatsApp
    const message = `Hola, estoy interesado en el producto: ${nombre}.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <Navbar />
      <div className="mt-10 bg-gradient-to-b from-orange-600 to-orange-300 min-h-screen">
        <h1 className="font-bignoodle text-white text-center text-5xl font-bold py-10">
          productos hammer x
        </h1>
        {/* Grid de productos premium, se adapta a 3 o 4 por fila */}
        <div className="productos-container py-16 px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {productosPremium.map((producto) => (
              <Link
                key={producto.id} // Usamos el id como clave única
                // to={`/product/${producto.id}/${encodeURIComponent(
                //   producto.nombre
                // )}`} // Ruta dinámica con id y nombre del producto
                className="producto-card border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition"
              >
                <img
                  src={producto.imagen}
                  alt={producto.nombre}
                  onClick={() =>
                    handleWhatsAppClick(producto.nombre, producto.precio)
                  }
                  className="w-full h-full object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold text-white">
                    {producto.nombre}
                  </h3>

                  {/* <p className="text-lg text-gray-300">{producto.precio}</p>
                  <p className="uppercase text-xs mt-2 mb-2 text-white">
                    {producto.newPrecio}
                  </p> */}

                  <butonn
                    className="cursor-pointer font-bignoodle text-2xl text-white"
                    onClick={() =>
                      handleWhatsAppClick(producto.nombre, producto.precio)
                    }
                  >
                    COMPRAR
                  </butonn>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductsPrincipal;
