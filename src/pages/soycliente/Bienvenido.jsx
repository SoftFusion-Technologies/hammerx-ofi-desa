/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 14 / 05 / 2025
 * Versión: 1.1.0
 * Última modificacion: 16 / 05 / 2025
 * Descripción: Componente de que se muestra en Clients.jsx para la sección de "Bienvenida a HammerX"
 *
 *
 *  Tema: Bienvenida a HammerX
 *  Capa: Frontend
 */

import fondo_flechas_img from "../../images/svg/lineasarriba.svg";
import chicos_img from "./Images/bienvenido2.png";
import { useEffect } from "react";

const bienvenidoData = {
  fondo: fondo_flechas_img,
  imagen: chicos_img,
  titulo: "¡BIENVENID@ A HAMMERX!",
  parrafos: [
    "Si estás leyendo esto queremos felicitarte por tomar la decisión que",
    "cambiará tu vida, la decisión de cuidarte y trabajar en vos.",
    "Gracias por elegirnos para ser parte de este proceso.",
    "Estamos muy ansiosos de ayudarte a lograr tus objetivos, pero sobre todo, acompañarte para que disfrutemos el camino juntos.",
    "¡Bienvenid@ al team HAMMERX!",
  ],
};

const Bienvenido = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#fc4b08]">
      {/* Líneas diagonales como fondo */}
      <img
        src={bienvenidoData.fondo}
        alt="Decoración"
        className="absolute left-0 top-0 w-full h-full object-cover rotate-90 z-0"
        style={{ pointerEvents: "none" }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center w-full px-2">
        <div className="relative bg-white border border-white/40 shadow-2xl shadow-gray-900 rounded-3xl px-4 mt-10 sm:mt-0 py-3 md:py-10 max-w-xl xl:max-w-4xl 2xl:max-w-7xl w-full mx-auto animate-fade-in">
          {/* Imagen superpuesta con estilo */}
          <img
            src={bienvenidoData.imagen}
            alt="Bienvenida"
            className="hidden md:block absolute bottom-0 -right-32 2xl:-right-36 w-[180px] sm:w-[240px] md:w-[300px] rounded-bl-3xl translate-x-1/4 translate-y-1/4 z-20 drop-shadow-[0_0_0.5rem_white]"
            style={{ objectFit: "contain" }}
          />

          {/* Título y texto */}
          <h1 className="text-[#fc4b08] text-3xl xs:text-4xl sm:text-5xl font-bold mb-6 text-center font-bignoodle drop-shadow-lg tracking-wide">
            {bienvenidoData.titulo}
          </h1>
          <p className="text-[#fc4b08] text-base xs:text-lg sm:text-xl text-center font-messina leading-relaxed drop-shadow-sm">
            {bienvenidoData.parrafos.map((texto, idx) => (
              <span key={idx}>
                {idx === 2 ? (
                  <span className="font-bold text-[#fd6112]">{texto}</span>
                ) : idx === 4 ? (
                  <span className="block mt-4 text-2xl font-bignoodle text-[#fd6112]">
                    {texto}
                  </span>
                ) : (
                  <>
                    {texto}
                    <br className="hidden xs:inline" />
                  </>
                )}
              </span>
            ))}
          </p>
          {/* Imagen centrada solo en mobile */}
          <div className="md:hidden w-full flex justify-center">
            <img
              src={bienvenidoData.imagen}
              alt="Bienvenida"
              className="w-44 xs:w-48 sm:w-56 drop-shadow-[0_0_0.3rem_#fc4b08]"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(40px);}
            to { opacity: 1; transform: translateY(0);}
          }
          .animate-fade-in {
            animation: fade-in 1.2s cubic-bezier(.23,1.02,.32,1) both;
          }
          @media (max-width: 400px) {
            .font-bignoodle { font-size: 2rem !important; }
          }
        `}
      </style>
    </div>
  );
};

export default Bienvenido;
