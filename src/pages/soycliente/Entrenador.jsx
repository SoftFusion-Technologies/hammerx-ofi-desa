/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 14 / 05 / 2025
 * Versión: 1.1.1
 * Última modificacion: 20 / 05 / 2025
 *
 * Descripción: Componente de que se muestra en Clients.jsx para la sección de "Contás con tu entrenador"
 *
 *
 *  Tema: Contás con tu entrenador
 *  Capa: Frontend
 */

import { useEffect, forwardRef } from "react";
import imgFondo from "./Images/entrenador.jpg";
import Aos from "aos";
import "aos/dist/aos.css";

const Entrenador = forwardRef((props, ref) => {
  const color = "bg-white";
  const color_bg = "bg-gradient-to-b from-orange-500 to-[#fc4b08]";

  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
  }, []);

  const infoEntrenador = {
    id: "entrenador",
    back_text: "ENTRENADORES",
    header: "CONTÁS CON TU ENTRENADOR",
    text: `Todas nuestras actividades cuentan con instructores y Coachs
      para poder garantizar un entrenamiento adecuado, minimizando los
      riesgos de lesiones y garantizando un acompañamiento óptimo y de
      esa manera poder realizar los ejercicios de manera correcta y
      lograr los objetivos deseados.
      (HAMMER no se responsabiliza de las actividades y ejercicios que se
      realicen con instructores y coachs particulares que no trabajen
      para nuestro gimnasio.)`,
  };

  return (
    <div
      className={`relative w-full font-bignoodle tracking-wider ${color} min-h-fit`}
      ref={ref}
    >
      <div className="relative w-full min-h-fit p-0 md:py-20">
        {true && (
          <>
            <img
              src={imgFondo}
              alt="Promoción Galicia"
              className="w-full h-full object-cover object-[center_12%]  absolute inset-0 z-0"
            />
            <div className={`absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-orange-600/75 to-orange-500` }/>
          </>
        )}
        <div className="relative z-10">
          <div
            className="relative h-32 md:h-48 flex items-center justify-center overflow-hidden"
            data-aos="fade-down"
          >
            <h1
              className="absolute uppercase pointer-events-none select-none whitespace-nowrap "
              style={{
                fontSize: "clamp(2rem, 22vw, 20rem)",
                color: "transparent",
                WebkitTextStroke: "3px #fff",
                textStroke: "3px #fff",
              }}
            >
              {infoEntrenador.back_text}
            </h1>
            <div className="relative z-10 col-span-1 mx-auto">
              <h1
                className={`text-2xl md:text-5xl font-bold p-5 md:p-6 border-4 border-gray-50 text-white ${color_bg} rounded-lg`}
              >
                {infoEntrenador.header}
              </h1>
            </div>
          </div>

          <div
            className="col-span-1 flex flex-col lg:flex-row justify-center items-center gap-4 px-4 pb-4 md:pb-0 md:p-2"
            data-aos="zoom-in"
          >
            <h1 className="text-lg md:text-3xl xl:text-3xl text-white text-left max-w-3xl">
              {infoEntrenador.text}
            </h1>
            <img
              className="hidden lg:block w-32 md:w-60 h-52 md:h-80 border-4 border-gray-50 rounded-md"
              src={imgFondo}
              alt="entrenador"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default Entrenador;
