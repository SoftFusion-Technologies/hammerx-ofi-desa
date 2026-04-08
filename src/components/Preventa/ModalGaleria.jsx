import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ModalGaleria = ({ isOpen, onClose, images }) => {
  const [indiceActual, setIndiceActual] = useState(0);
  
  // estados para swipe
  const [inicioToque, setInicioToque] = useState(0);
  const [finToque, setFinToque] = useState(0);

  // registro de proporciones de las imagenes
  const [esImagenHorizontal, setEsImagenHorizontal] = useState({});

  // reiniciar
  useEffect(() => {
    if (isOpen) setIndiceActual(0);
  }, [isOpen]);

  // controles teclado
  useEffect(() => {
    const manejarTeclado = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") siguiente();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", manejarTeclado);
    return () => window.removeEventListener("keydown", manejarTeclado);
  }, [isOpen, indiceActual]);

  if (!images || images.length === 0) return null;

  const siguiente = () => setIndiceActual((prev) => (prev + 1) % images.length);
  const anterior = () =>
    setIndiceActual((prev) => (prev - 1 + images.length) % images.length);

  // logica swipe
  const manejarInicioToque = (e) => setInicioToque(e.targetTouches[0].clientX);
  const manejarMovimientoToque = (e) => setFinToque(e.targetTouches[0].clientX);
  const manejarFinToque = () => {
    if (!inicioToque || !finToque) return;
    const distancia = inicioToque - finToque;
    const deslizoIzquierda = distancia > 50; 
    const deslizoDerecha = distancia < -50;
    
    if (deslizoIzquierda) siguiente();
    if (deslizoDerecha) anterior();
    
    setInicioToque(0);
    setFinToque(0);
  };

  // detectar si la imagen es horizontal al cargarla
  const manejarCargaImagen = (evento, indice) => {
    const ancho = evento.target.naturalWidth;
    const alto = evento.target.naturalHeight;
    setEsImagenHorizontal((prev) => ({
      ...prev,
      [indice]: ancho > alto,
    }));
  };

  // ver si la imagen del centro es horizontal para acomodar el resto
  const centroEsHorizontal = esImagenHorizontal[indiceActual];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // fondo oscuro
          className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-none md:backdrop-blur-md overflow-hidden flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* cabecera */}
          <div className="absolute top-0 w-full flex items-center justify-between p-6 md:p-10 z-50 pointer-events-none">
            <h3 className="text-3xl md:text-5xl font-bignoodle uppercase text-white tracking-widest drop-shadow-md">
              Galería <span className="text-[#fc4b08]">de Instalaciones</span>
            </h3>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="pointer-events-auto text-white hover:text-[#fc4b08] transition-colors p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <FaTimes className="text-2xl md:text-3xl" />
            </button>
          </div>

          {/* contenedor de imagenes */}
          <div 
            className="relative flex-grow w-full h-full flex items-center justify-center max-w-[100vw]"
            style={{ perspective: "1000px" }}
            onTouchStart={manejarInicioToque}
            onTouchMove={manejarMovimientoToque}
            onTouchEnd={manejarFinToque}
            onClick={(e) => e.stopPropagation()} 
          >
            {images.map((img, indice) => {
              const cantidad = images.length;
              let indiceRelativo = indice - indiceActual;

              // logica circular
              if (indiceRelativo > Math.floor(cantidad / 2)) {
                indiceRelativo -= cantidad;
              } else if (indiceRelativo < -Math.floor(cantidad / 2)) {
                indiceRelativo += cantidad;
              }

              const indiceAbsoluto = Math.abs(indiceRelativo);
              if (indiceAbsoluto > 2) return null;

              const esCentro = indiceRelativo === 0;
              const esHorizontal = esImagenHorizontal[indice];

              // empujar las imagenes laterales si la del centro se expande
              const separacionExtra = centroEsHorizontal ? 35 : 0;
              
              const translateX = indiceRelativo * (65 + separacionExtra); 
              const translateY = indiceAbsoluto * 15; 
              const rotateY = indiceRelativo * -12; 
              const rotateZ = indiceRelativo * 5; 
              const scale = 1 - (indiceAbsoluto * 0.15); 

              // tamaños dinamicos
              let clasesTamano = "w-[240px] h-[340px] sm:w-[320px] sm:h-[450px] lg:w-[450px] lg:h-[600px]"; // formato vertical normal
              
              if (esCentro && esHorizontal) {
                clasesTamano = "w-[340px] h-[240px] sm:w-[600px] sm:h-[400px] lg:w-[900px] lg:h-[600px]"; // formato horizontal expandido
              }

              return (
                <div
                  key={indice}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!esCentro) {
                      setIndiceActual(indice);
                    }
                  }}
                  className={`
                    absolute top-1/2 left-1/2 
                    ${clasesTamano}
                    rounded-[2.5rem] md:rounded-[4rem] 
                    overflow-hidden cursor-pointer group
                    transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                    ${esCentro 
                      ? "border-[3px] border-[#fc4b08] shadow-none md:shadow-[0_15px_40px_rgba(252,75,8,0.4)]" 
                      : "border-[1px] border-white/20 shadow-none"}
                  `}
                  style={{
                    transform: `translate(calc(-50% + ${translateX}%), calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    zIndex: 50 - indiceAbsoluto,
                    opacity: esCentro ? 1 : 1 - (indiceAbsoluto * 0.4),
                    pointerEvents: indiceAbsoluto <= 2 ? "auto" : "none",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Galería ${indice + 1}`}
                    loading={esCentro ? "eager" : "lazy"}
                    onLoad={(e) => manejarCargaImagen(e, indice)}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* capa oscura para los costados */}
                  <div 
                    className="absolute inset-0 bg-black transition-opacity duration-500 pointer-events-none"
                    style={{ opacity: esCentro ? 0 : 0.6 }}
                  />
                </div>
              );
            })}
          </div>

          {/* flechas pc/tablet */}
          <button
            onClick={(e) => { e.stopPropagation(); anterior(); }}
            className="hidden sm:block absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white hover:text-[#fc4b08] p-4 md:p-6 rounded-full border border-white/20 hover:border-[#fc4b08] hover:bg-black/80 transition-colors cursor-pointer active:scale-90"
          >
            <FaChevronLeft className="text-xl md:text-3xl" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); siguiente(); }}
            className="hidden sm:block absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white hover:text-[#fc4b08] p-4 md:p-6 rounded-full border border-white/20 hover:border-[#fc4b08] hover:bg-black/80 transition-colors cursor-pointer active:scale-90"
          >
            <FaChevronRight className="text-xl md:text-3xl" />
          </button>

          {/* paginacion inferior */}
          <div 
            className="absolute bottom-6 md:bottom-8 w-full flex justify-center items-center gap-2 md:gap-3 z-50"
            onClick={(e) => e.stopPropagation()} 
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceActual(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === indiceActual
                    ? "w-6 h-2 md:w-8 md:h-3 bg-[#fc4b08]"
                    : "w-2 h-2 md:w-3 md:h-3 bg-white/40"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalGaleria;