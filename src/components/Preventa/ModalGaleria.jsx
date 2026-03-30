import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ModalGaleria = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reiniciar el carrusel a la primera imagen al abrir
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  // Soporte para teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  if (!images || images.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  // --- LÓGICA 3D EXTREMADAMENTE OPTIMIZADA ---
  // Solo calculamos Transforms (x, y, rotate, scale, zIndex, opacity). 
  // La GPU renderiza esto a 60fps sin usar el hilo principal.
  const getCardAnimation = (relativeIndex, absIndex, isCenter) => {
    const isVisible = absIndex <= 3;
    
    return {
      x: `${relativeIndex * 65}%`,
      y: absIndex * 30,
      rotateZ: relativeIndex * 8,
      rotateY: relativeIndex * -15,
      scale: isCenter ? 1 : Math.max(1 - absIndex * 0.15, 0.6),
      zIndex: 50 - absIndex,
      opacity: isVisible ? (isCenter ? 1 : 1 - absIndex * 0.2) : 0,
    };
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl overflow-hidden flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }} // Entrada más veloz
          onClick={onClose}
        >
          {/* Cabecera Flotante */}
          <div className="absolute top-0 w-full flex items-center justify-between p-6 md:p-10 z-50 pointer-events-none">
            <motion.h3 
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", damping: 25 }}
              className="text-3xl md:text-5xl font-bignoodle uppercase text-white tracking-widest drop-shadow-xl"
            >
              Galería <span className="text-[#fc4b08]">de Instalaciones</span>
            </motion.h3>
            <button
              onClick={onClose}
              className="pointer-events-auto text-white hover:text-[#fc4b08] transition-colors p-3 md:p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <FaTimes className="text-2xl md:text-3xl" />
            </button>
          </div>

          {/* Contenedor del Abanico con Perspectiva 3D */}
          <div 
            className="relative flex-grow w-full h-full flex items-center justify-center max-w-[100vw]"
            style={{ perspective: "1500px" }}
          >
            {images.map((img, index) => {
              const len = images.length;
              let relativeIndex = index - currentIndex;

              if (relativeIndex > Math.floor(len / 2)) {
                relativeIndex -= len;
              } else if (relativeIndex < -Math.floor(len / 2)) {
                relativeIndex += len;
              }

              const absIndex = Math.abs(relativeIndex);
              const isCenter = relativeIndex === 0;
              const animationProps = getCardAnimation(relativeIndex, absIndex, isCenter);
              
              return (
                <motion.div
                  key={index}
                  initial={false}
                  animate={animationProps}
                  // Spring más rígido para que la respuesta al clic sea inmediata
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30, 
                    mass: 0.8 
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCenter) setCurrentIndex(index);
                  }}
                  // OPTIMIZACIÓN CSS: Clases estáticas y transiciones nativas manejando el border y shadow, NO Framer Motion.
                  className={`
                    absolute top-1/2 left-1/2 -mt-[150px] -ml-[110px] sm:-mt-[200px] sm:-ml-[150px] lg:-mt-[275px] lg:-ml-[200px]
                    w-[220px] h-[300px] sm:w-[300px] sm:h-[400px] lg:w-[400px] lg:h-[550px] 
                    rounded-[2.5rem] md:rounded-[4rem] 
                    overflow-hidden cursor-pointer group
                    transition-colors duration-300
                    ${isCenter 
                      ? "border-[4px] border-[#fc4b08] shadow-[0_20px_50px_rgba(252,75,8,0.4)]" 
                      : "border-[2px] border-white/10 shadow-2xl"}
                  `}
                  style={{
                    pointerEvents: animationProps.opacity > 0 ? "auto" : "none",
                    willChange: "transform, opacity, z-index" // Aceleración de Hardware forzada
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Galería ${index + 1}`}
                    // Sin loading="lazy" para evitar parpadeos en renderizados iniciales rápidos
                    className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
                      isCenter ? "scale-100" : "scale-105"
                    }`}
                  />
                  
                  {/* OPTIMIZACIÓN VISUAL: Capa de opacidad acelerada por GPU en lugar de CSS Filter */}
                  <div 
                    className="absolute inset-0 bg-black transition-opacity duration-300 pointer-events-none"
                    style={{ opacity: isCenter ? 0 : 0.6 }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Flechas de Navegación Espectaculares */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-50 bg-black/30 text-white hover:text-[#fc4b08] p-5 md:p-6 rounded-full border border-white/10 hover:border-[#fc4b08] hover:bg-black/60 transition-colors cursor-pointer backdrop-blur-sm active:scale-95"
          >
            <FaChevronLeft className="text-xl md:text-3xl" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-50 bg-black/30 text-white hover:text-[#fc4b08] p-5 md:p-6 rounded-full border border-white/10 hover:border-[#fc4b08] hover:bg-black/60 transition-colors cursor-pointer backdrop-blur-sm active:scale-95"
          >
            <FaChevronRight className="text-xl md:text-3xl" />
          </button>

          {/* Paginación minimalista */}
          <div 
            className="absolute bottom-8 w-full flex justify-center items-center gap-3 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? "w-8 h-3 bg-[#fc4b08] shadow-[0_0_15px_#fc4b08]"
                    : "w-3 h-3 bg-white/30 hover:bg-white/70"
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