/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Parte principal de la página web. Es lo primero que se ve cuando el usuario ingresa a la página.
 *
 * Tema: Hero Section
 * Capa: Frontend
 */

import { hero2 } from "../../images/svg/index";
import {useEffect} from 'react'
const NuevaVista = () => {
    useEffect(() => {
    // Desplaza la página al top cuando el componente se monta
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  return (
    <div className="-mb-10 relative w-full md:h-screen flex overflow-hidden">
      
       <div
        className="hidden md:flex lg:w-1/2 md:w-2/3 w-full px-10 flex-col justify-center items-center bg-gradient-to-r"
        id="div1"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8 md:mb-0 md:w-3/4 lg:w-2/3">
          <h1 className="text-orange-500 text-4xl md:text-5xl font-bold mb-4 text-center font-bignoodle">
            ¡BIENVENID@ A HAMMERX!
          </h1>
          <p className="text-gray-700 text-base md:text-lg text-center font-messina">
            Si estás leyendo esto queremos felicitarte por tomar la decisión que
            cambiará tu vida, la decisión de ponerte en movimiento y cuidarte.
            Gracias por elegirnos para ser parte de este proceso. Estamos muy
            ansiosos de ayudarte a lograr tus objetivos, pero sobre todo,
            acompañarte para que disfrutemos el camino juntos. ¡Bienvenid@ al team
            HAMMERX!
          </p>
        </div>
      </div>

      {/* Div de la derecha, imagenes de VIVI SENSACIONES POSITIVAS SIEMPRE */}
      <div
        className="mb-10 lg:w-1/2 md:w-1/2 max-md:hidden relative dark:bg-gradient-to-r from-gray-700 to-gray-900"
        id="div2"
      >
        <img
          src={hero2}
          alt="Señoras"
          className="hidden lg:block absolute bottom-0 h-full object-cover object-left"
        />
      </div>

      {/* Mobile content */}
      <div className="md:hidden w-full px-10 max-sm:px-6 mt-5 flex flex-col py-10">
        <div className="relative dark:bg-gradient-to-r from-gray-700 to-gray-900">
          {/* Puedes agregar contenido adicional aquí si es necesario */}
        </div>
        <div className="w-5/6 h-auto pb-5 border-4 border-orange-600 rounded-xl mx-auto mt-5 max-sm:mt-16">
          <div>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8 md:mb-0 md:w-1/2 lg:w-1/3">
              <h1 className="text-orange-500 text-4xl md:text-5xl font-bold mb-4 text-center font-bignoodle">
                ¡BIENVENID@ A HAMMERX!
              </h1>
              <p className="text-gray-700 text-base md:text-lg text-center font-messina">
                Si estás leyendo esto queremos felicitarte por tomar la decisión que
                cambiará tu vida, la decisión de ponerte en movimiento y cuidarte.
                Gracias por elegirnos para ser parte de este proceso. Estamos muy
                ansiosos de ayudarte a lograr tus objetivos, pero sobre todo,
                acompañarte para que disfrutemos el camino juntos. ¡Bienvenid@ al team
                HAMMERX!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaVista;
