/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 14 / 04 / 2024
 * Versión: 1.0
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
      className={`relative w-full font-bignoodle tracking-wider ${color} min-h-fit py-20`}
      ref={ref}
    >
      <div className="relative w-full min-h-fit">
        {false && (
          <img
            src={imgFondo}
            alt="Promoción Galicia"
            className="w-full h-full object-cover absolute inset-0 z-0 opacity-50"
            style={{ minHeight: "100%", height: "100%" }}
          />
        )}
        <div className="relative z-10">
          <div
            className="relative h-48 flex items-center justify-center overflow-hidden"
            data-aos="fade-down"
          >
            <h1
              className="absolute uppercase pointer-events-none select-none whitespace-nowrap"
              style={{
                fontSize: "clamp(6.7rem, 20vw, 20rem)",
                color: "transparent",
                WebkitTextStroke: "3px #fc4b08",
                textStroke: "3px #fc4b08",
              }}
            >
              {infoEntrenador.back_text}
            </h1>
            <div className="relative z-10 col-span-1 mx-auto">
              <h1
                className={`text-2xl md:text-5xl font-bold ${color} p-5 border-4 border-[#fc4b08] text-[#fc4b08] rounded-lg`}
              >
                {infoEntrenador.header}
              </h1>
            </div>
          </div>

          <div
            className="col-span-1 flex justify-center items-center gap-2 p-2"
            data-aos="zoom-in"
          >
            <h1 className="text-lg md:text-3xl xl:text-3xl text-[#fc4b08] text-left max-w-3xl">
              {infoEntrenador.text}
            </h1>
            <img
              className=" w-32 md:w-60 h-52 md:h-80 border-4 border-orange-600 rounded-md"
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
