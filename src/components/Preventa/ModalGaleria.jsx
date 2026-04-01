import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ModalGaleria = ({ isOpen, onClose, images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estados para el control táctil (Swipe)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Reiniciar al abrir
  useEffect(() => {
    if (isOpen) setCurrentIndex(0);
  }, [isOpen]);

  // Teclado
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

  // --- LÓGICA DE GESTOS (SWIPE) ---
  const handleTouchStart = (e) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; 
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) next();
    if (isRightSwipe) prev();
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          // FONDO OSCURO: Solo se cierra si se hace clic explícitamente en el fondo (lejos de las imágenes)
          className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-none md:backdrop-blur-md overflow-hidden flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          {/* Cabecera */}
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

          <div 
            className="relative flex-grow w-full h-full flex items-center justify-center max-w-[100vw]"
            style={{ perspective: "1000px" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()} 
          >
            {images.map((img, index) => {
              const len = images.length;
              let relativeIndex = index - currentIndex;

              // Lógica circular para que sea infinito
              if (relativeIndex > Math.floor(len / 2)) {
                relativeIndex -= len;
              } else if (relativeIndex < -Math.floor(len / 2)) {
                relativeIndex += len;
              }

              const absIndex = Math.abs(relativeIndex);
              
              if (absIndex > 2) return null;

              const isCenter = relativeIndex === 0;
              
              // CÁLCULOS VISUALES: Sin translateZ negativo para evitar el bug táctil de móviles
              const translateX = relativeIndex * 65; 
              const translateY = absIndex * 15; 
              const rotateY = relativeIndex * -12; 
              const rotateZ = relativeIndex * 5; 
              const scale = 1 - (absIndex * 0.15); 

              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isCenter) {
                      setCurrentIndex(index);
                    }
                  }}
                  className={`
                    absolute top-1/2 left-1/2 
                    w-[240px] h-[340px] sm:w-[320px] sm:h-[450px] lg:w-[450px] lg:h-[600px] 
                    rounded-[2.5rem] md:rounded-[4rem] 
                    overflow-hidden cursor-pointer group
                    transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)]
                    ${isCenter 
                      ? "border-[3px] border-[#fc4b08] shadow-none md:shadow-[0_15px_40px_rgba(252,75,8,0.4)]" 
                      : "border-[1px] border-white/20 shadow-none"}
                  `}
                  style={{

                    transform: `translate(calc(-50% + ${translateX}%), calc(-50% + ${translateY}px)) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
                    zIndex: 50 - absIndex,
                    opacity: isCenter ? 1 : 1 - (absIndex * 0.4),
                    // Aseguramos que solo las visibles atrapen clics
                    pointerEvents: absIndex <= 2 ? "auto" : "none",
                  }}
                >
                  <img
                    src={img.src}
                    alt={img.alt || `Galería ${index + 1}`}
                    loading={isCenter ? "eager" : "lazy"}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Capa oscura para las que no están en el centro */}
                  <div 
                    className="absolute inset-0 bg-black transition-opacity duration-500 pointer-events-none"
                    style={{ opacity: isCenter ? 0 : 0.6 }}
                  />
                </div>
              );
            })}
          </div>

          {/* Flechas de Navegación (Solo para PC/Tablets grandes) */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="hidden sm:block absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white hover:text-[#fc4b08] p-4 md:p-6 rounded-full border border-white/20 hover:border-[#fc4b08] hover:bg-black/80 transition-colors cursor-pointer active:scale-90"
          >
            <FaChevronLeft className="text-xl md:text-3xl" />
          </button>
          
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="hidden sm:block absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-50 bg-black/40 text-white hover:text-[#fc4b08] p-4 md:p-6 rounded-full border border-white/20 hover:border-[#fc4b08] hover:bg-black/80 transition-colors cursor-pointer active:scale-90"
          >
            <FaChevronRight className="text-xl md:text-3xl" />
          </button>

          {/* Paginación abajo */}
          <div 
            className="absolute bottom-6 md:bottom-8 w-full flex justify-center items-center gap-2 md:gap-3 z-50"
            onClick={(e) => e.stopPropagation()} 
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
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