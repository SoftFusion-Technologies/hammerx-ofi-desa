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
import top1Negro from './Img/top1.png';
import top2Negro from './Img/top2.png';
import shor1VerdeMilitar from './Img/short1.jpg';
import shor2Negro from './Img/short2.jpg';
import shor3Azul from './Img/short3.jpg';
import Remera1Blanca from './Img/remera1.png';
import remera_retro1Rosita from './Img/remera-reto.jpg';
import remera_retro2Rosita from './Img/remera-retro(espalda).jpg';
import remera_gray1 from './Img/remera-gris-clara.jpg';
import remera_gray2 from './Img/remera-gris-oscura.jpg';
import calza1Azul from './Img/calza1.png';
import calza2Azul from './Img/calza2.png';
import calzacorta1Negra from './Img/calza1_corta.png';
import calzacorta2Negra from './Img/calza2_corta.png';
import calza1bikerAzul from './Img/calza1_biker.png';
import calza2bikerAzul from './Img/calza2_biker.png';

// new remeras
import newRemeracortaBeige from './Img/newRemeracorta.jpeg';
import newRemeracorta2Beige from './Img/newRemeracorta2.jpeg';
import newMusculosaNegra from './Img/newMusculosa.jpeg';

//new buzos
import newBuzoAzul from './Img/azul.jpg';
import newBuzobeige from './Img/beige.jpg';
import newBuzoGris from './Img/gris.jpg';
import newBuzoRosaBb from './Img/rosabb.jpg';
import newBuzoChocolate from './Img/chocolate.jpg';
// IMAGENES PRODUCTOS FIN

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'; // Íconos de flechas
import Marcas_v2 from '../../components/header/Marcas_v2';

// Componente para el círculo de color doble
const CirculoColorDoble = ({ color1, color2, selected, onClick }) => (
  <button
    className={`w-10 h-10 md:w-8 md:h-8 rounded-full border-2 transition-all flex-shrink-0
      ${selected ? 'border-black shadow-md scale-110' : 'border-gray-300'}`}
    style={{
      background: `linear-gradient(90deg, ${color1} 50%, ${color2} 50%)`
    }}
    onClick={onClick}
    tabIndex={-1}
    aria-label="Seleccionar color"
  />
);


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
      nombre: 'BUZO HAMMER X RAGLAN',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      variantes: [
        {
          nombre: 'Blanco/Naranja',
          colorDisplay: ['#fff', '#ff6600'],
          imagenes: [ImgBuzoNaranjaGuille, ImgBuzoNaranjaGime]
        },
        {
          nombre: 'Blanco/Negro',
          colorDisplay: ['#fff', '#000'],
          imagenes: [ImgBuzoNegroGuille, ImgBuzoNegroGime]
        }
      ],
      colores: [
        { color1: '#fff', color2: '#ff6600' },
        { color1: '#fff', color2: '#000' }
      ]
    },
    {
      id: 2,
      nombre: 'BUZO HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [ImgBuzoNegroGuille, ImgBuzoNegroGime],
      colores: [{ color1: '#000', color2: '#000' }]
    },
    {
      id: 3,
      nombre: 'TOP HAMMER X NEGRO',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [top1Negro, top2Negro],
      colores: [{ color1: '#000', color2: '#000' }]
    },
    {
      id: 4,
      nombre: 'SHORT HAMMER X',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      variantes: [
        {
          nombre: 'Verde Militar',
          colorDisplay: ['#4b5320', '#4b5320'],
          imagenes: [shor1VerdeMilitar]
        },
        {
          nombre: 'Negro',
          colorDisplay: ['#000', '#000'],
          imagenes: [shor2Negro]
        },
        {
          nombre: 'Azul Oscuro',
          colorDisplay: ['#1e3a8a', '#1e3a8a'],
          imagenes: [shor3Azul]
        }
      ]
    },
    {
      id: 5,
      nombre: 'REMERA HAMMER X BLANCA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [Remera1Blanca],
      colores: [{ color1: '#fff', color2: '#fff' }]
    },
    {
      id: 6,
      nombre: 'REMERA RETRO HAMMER X PINK',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [remera_retro1Rosita, remera_retro2Rosita],
      colores: [{ color1: '#F4C2C2', color2: '#F4C2C2' }]
    },
    {
      id: 7,
      nombre: 'REMERA HAMMER X GREY',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [remera_gray1, remera_gray2],
      colores: [{ color1: '#7b8794', color2: '#7b8794' }]
    },
    {
      id: 8,
      nombre: 'CALZA HAMMER X AZUL',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calza1Azul, calza2Azul],
      colores: [{ color1: '#1e3a8a', color2: '#1e3a8a' }] // Negro puro
    },
    {
      id: 9,
      nombre: 'CALZA CORTA HAMMER X NEGRA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calzacorta1Negra, calzacorta2Negra],
      colores: [{ color1: '#000', color2: '#000' }] // Negro puro
    },
    {
      id: 10,
      nombre: 'CALZA CORTA BIKER HAMMER X azul',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [calza1bikerAzul, calza2bikerAzul],
      colores: [{ color1: '#1e3a8a', color2: '#1e3a8a' }] // Negro puro
    },
    {
      id: 11,
      nombre: 'REMERA CORTA HAMMER X ',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newRemeracortaBeige, newRemeracorta2Beige],
      colores: [{ color1: '#f5f5dc', color2: '#f5f5dc' }] // Beige claro (ver imagenes, pero este es un tono neutro clásico)
    },
    {
      id: 12,
      nombre: 'MUSCULOSA HAMMER X NEGRA',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newMusculosaNegra],
      colores: [{ color1: '#000', color2: '#000' }] // Negro puro
    },
    {
      id: 13,
      nombre: 'BUZO HAMMER X AZUL',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newBuzoAzul],
      colores: [{ color1: '#1e3a8a', color2: '#1e3a8a' }] // Negro puro
    },
    {
      id: 14,
      nombre: 'BUZO HAMMER X BEIGE',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newBuzobeige],
      colores: [{ color1: '#f5f5dc', color2: '#f5f5dc' }] // Beige claro (ver imagenes, pero este es un tono neutro clásico)
    },
    {
      id: 15,
      nombre: 'BUZO HAMMER X GRIS',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newBuzoGris],
      colores: [{ color1: '#7b8794', color2: '#7b8794' }]
    },
    {
      id: 16,
      nombre: 'BUZO HAMMER X ROSA BEBÉ',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newBuzoRosaBb],
      colores: [{ color1: '#ffb6c1', color2: '#ffb6c1' }] // Rosa bebé
    },
    {
      id: 17,
      nombre: 'BUZO HAMMER X CHOCOLATE',
      precio: '$14.500,00',
      newPrecio: 'Precio con efectivo o transferencia $13.000,00',
      categoria: 'premium',
      imagenes: [newBuzoChocolate],
      colores: [{ color1: '#7b3f00', color2: '#7b3f00' }] // Chocolate oscuro
    }
  ];

  // --------- COLORES ÚNICOS PARA FILTRO GLOBAL -----------
  const getUniqueColors = (productos) => {
    const colorSet = new Set();
    productos.forEach((p) =>
      p.colores?.forEach((c) => colorSet.add(`${c.color1},${c.color2}`))
    );
    return Array.from(colorSet).map((str) => {
      const [color1, color2] = str.split(',');
      return { color1, color2 };
    });
  };

  const coloresUnicos = getUniqueColors(productosPremium);

  const [colorFiltro, setColorFiltro] = useState(null); // global
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(
    productosPremium.map(() => 0)
  );
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

  // Filtrar productos que tienen la variante o el color seleccionado
  const productosFiltrados = colorFiltro
    ? productosPremium.filter((producto) => {
        if (producto.variantes) {
          // ¿Alguna variante coincide?
          return producto.variantes.some(
            (v) =>
              v.colorDisplay[0] === colorFiltro.color1 &&
              v.colorDisplay[1] === colorFiltro.color2
          );
        }
        // No tiene variantes, comparar color principal
        return producto.colores?.some(
          (c) =>
            c.color1 === colorFiltro.color1 && c.color2 === colorFiltro.color2
        );
      })
    : productosPremium;

  const handlePrevImage = (index, imgs) => {
    setImagenActual((prev) =>
      prev.map((imgIndex, i) =>
        i === index
          ? imgIndex === 0
            ? imgs.length - 1
            : imgIndex - 1
          : imgIndex
      )
    );
  };

  const handleNextImage = (index, imgs) => {
    setImagenActual((prev) =>
      prev.map((imgIndex, i) =>
        i === index
          ? imgIndex === imgs.length - 1
            ? 0
            : imgIndex + 1
          : imgIndex
      )
    );
  };

  const handleProductoClick = (producto) => {
    setProductoSeleccionado(producto);
    setModalVisible(true);
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
          {productosFiltrados.map((producto, index) => {
            // Si tiene variantes Y hay color seleccionado
            let currentVariante = 0;
            if (producto.variantes && colorFiltro) {
              const foundIdx = producto.variantes.findIndex(
                (v) =>
                  v.colorDisplay[0] === colorFiltro.color1 &&
                  v.colorDisplay[1] === colorFiltro.color2
              );
              if (foundIdx !== -1) currentVariante = foundIdx;
            } else {
              currentVariante = varianteSeleccionada[index] || 0;
            }
            const imgs = producto.variantes
              ? producto.variantes[currentVariante].imagenes
              : producto.imagenes;

            return (
              <div
                key={producto.id}
                className="producto-card border border-gray-300 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition group cursor-pointer"
                onClick={() => handleProductoClick(producto)}
              >
                <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] overflow-hidden">
                  {/* Imagen principal */}
                  <img
                    src={imgs[imagenActual[index]]}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />

                  {/* Hover: preview de la siguiente imagen */}
                  {imgs.length > 1 && (
                    <img
                      src={imgs[(imagenActual[index] + 1) % imgs.length]}
                      alt={producto.nombre}
                      className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  )}

                  {/* Flecha izquierda */}
                  {imgs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handlePrevImage(index, imgs);
                      }}
                      className="absolute top-1/2 left-1 sm:left-2 transform -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full text-orange-500 hover:bg-black"
                    >
                      <FaChevronLeft size={16} />
                    </button>
                  )}

                  {/* Flecha derecha */}
                  {imgs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleNextImage(index, imgs);
                      }}
                      className="absolute top-1/2 right-1 sm:right-2 transform -translate-y-1/2 bg-black/50 p-1 sm:p-2 rounded-full text-orange-500 hover:bg-black"
                    >
                      <FaChevronRight size={16} />
                    </button>
                  )}

                  {/* Indicador de imagen actual */}
                  {imgs.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-white/80 rounded-full px-3 py-1 text-xs font-bold text-gray-800 shadow-sm">
                      {imagenActual[index] + 1} / {imgs.length}
                    </div>
                  )}
                </div>

                {/* Selector de variantes de color */}
                {producto.variantes && (
                  <div className="flex justify-center mt-2">
                    {producto.variantes.map((variante, vIdx) => (
                      <CirculoColorDoble
                        key={vIdx}
                        color1={variante.colorDisplay[0]}
                        color2={variante.colorDisplay[1]}
                        selected={varianteSeleccionada[index] === vIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVarianteSeleccionada((prev) =>
                            prev.map((v, i) => (i === index ? vIdx : v))
                          );
                          setImagenActual((prev) =>
                            prev.map((img, i) => (i === index ? 0 : img))
                          );
                        }}
                      />
                    ))}
                  </div>
                )}

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
            );
          })}
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
      {/* Filtro flotante de colores global */}
      <div
        className={`
    fixed z-40
    left-0 w-full bottom-0
    bg-white/95 border-t border-gray-200
    flex items-center px-3 py-2 gap-3
    overflow-x-auto
    shadow-[0_0_16px_0_rgba(0,0,0,0.10)]
    md:left-1/2 md:-translate-x-1/2 md:top-32 md:bottom-auto
    md:w-max md:rounded-2xl md:px-4 md:py-2
    md:shadow-xl md:border md:bg-white/80 md:gap-2
  `}
        style={{ backdropFilter: 'blur(8px)' }}
      >
        <span className="font-bold text-gray-700 text-base shrink-0">
          Color:
        </span>
        <div className="flex gap-3 md:gap-2 overflow-x-auto w-full">
          {coloresUnicos.map((color, i) => (
            <CirculoColorDoble
              key={i}
              color1={color.color1}
              color2={color.color2}
              selected={
                colorFiltro &&
                colorFiltro.color1 === color.color1 &&
                colorFiltro.color2 === color.color2
              }
              onClick={() =>
                setColorFiltro(
                  colorFiltro &&
                    colorFiltro.color1 === color.color1 &&
                    colorFiltro.color2 === color.color2
                    ? null // deseleccionar
                    : color
                )
              }
            />
          ))}
        </div>
        {colorFiltro && (
          <button
            onClick={() => setColorFiltro(null)}
            className="ml-2 px-2 py-1 rounded text-xs bg-gray-200 hover:bg-gray-300 shrink-0"
          >
            Ver todos
          </button>
        )}
      </div>
    </>
  );
};

export default ProductsPrincipal;
