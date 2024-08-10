/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Parte principal de la página web. Es lo primero que se ve cuando el usuario ingresa a la página.
 *
 *
 *  Tema: Hero Section
 *  Capa: Frontend
 */

import Aos from "aos";
import FixedNavbar from "./FixedNavbar";
import { Link } from "react-router-dom";
import { guionesnar } from "../../images";
import { useEffect, useState } from "react";
import { flecha1, flecha2, logo, hero2 } from "../../images/svg/index";
import { video } from "../../Video";

const Hero = () => {
  useEffect(() => {
    Aos.init({ duration: 1500, delay: "200" });
  }, []);

  const [mostrarBotonesSedes, setMostrarBotonesSedes] = useState(false);
  const [videoVisible, setVideoVisible] = useState(true);

  const toggleSedes = () => {
    //mostrar botones de sedes
    setMostrarBotonesSedes(!mostrarBotonesSedes);
  };

  const handleCloseVideo = () => {
    setVideoVisible(false);
  };

  return (
    <div className="relative w-full md:h-screen flex overflow-hidden">
      <div
        data-aos="fade-right"
        className="hidden md:flex lg:w-1/2 md:w-2/3 max-md:w-full px-10 flex-col justify-center items-center max-sm:px-6 dark:bg-gradient-to-r from-gray-600 to-gray-700"
        id="div1"
      >
        <img src={logo} alt="logo" className="" />

        <div className="w-5/6 h-auto pb-5 border-4 border-orange-600 rounded-xl mx-auto mt-5 max-sm:mt-16">
          <div>
            <p className="max-md:text-sm text-center px-6 pt-6 font-messina dark:text-white">
              ¡Bienvenidos a nuestro sitio oficial!{" "}
            </p>
            <p className="max-md:text-sm text-center px-6 font-messina dark:text-white">
              Todo lo que necesitas saber para entrenar con nosotros en un solo
              lugar.
            </p>
          </div>

          <nav className="w-full lg:mt-10 md:mt-8 sm:mt-4 max-sm:mt-8">
            <ul
              className="flex flex-col list-none font-semibold justify-between items-center text-[#fc4b08]
            font-roboto text-sm"
            >
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <a href="#activities">TUS ACTIVIDADES</a>
              </li>
              <hr className="text-black w-5/6" />
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <p className="cursor-pointer" onClick={toggleSedes}>
                  NUESTRAS SEDES
                </p>
              </li>
              {mostrarBotonesSedes && (
                <div className="flex mx-auto mb-2 max-sm:flex-col">
                  <Link to={"/Sedes/Concepcion"} className="max-sm:mx-auto">
                    <button className="bg-[#fc4b08] transition hover:bg-[#fc6e08] text-white  py-2 px-4 rounded sm:mr-4">
                      CONCEPCIÓN
                    </button>
                  </Link>
                  <Link to={"/Sedes/Monteros"} className="max-sm:mx-auto">
                    <button className="bg-[#fc4b08] transition hover:bg-[#fc6e08] text-white  py-2 px-4 rounded max-sm:mt-2">
                      MONTEROS
                    </button>
                  </Link>
                </div>
              )}
              <hr className="text-black w-5/6" />
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <a href="#about">CONOCÉ TODA NUESTRA INFO</a>
              </li>

              {/*
              <hr className="text-black w-5/6" />
              
               <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <a href="#">QUIERO TRABAJAR CON USTEDES</a>
              </li>
                Cambios, pre ultima version, 12-04-24, benjamin orellana
              */}
            </ul>
          </nav>
        </div>
      </div>

      {/* Div de la derecha, imagenes de VIVI SENSACIONES POSITIVAS SIEMPRE*/}
      <div
        data-aos="fade-left"
        className="lg:w-1/2 md:w-1/2 max-md:hidden relative dark:bg-gradient-to-r from-gray-700 to-gray-900"
        id="div2"
      >
        {videoVisible ? (
          <div className="relative w-full h-full">
            <video
              src={video}
              autoPlay
              loop
              muted
              className="w-full h-full object-cover"
            />
            <button
              className="absolute top-16 right-2 bg-transparent text-white p-2  z-50"
              onClick={handleCloseVideo}
            >
              x
            </button>
          </div>
        ) : (
          <>
            <img
              src={hero2}
              alt="Señoras"
              className="hidden lg:block absolute bottom-0 h-full object-cover object-left"
            />
            <img
              src={flecha2}
              alt="Señoras"
              className="lg:hidden max-md:hidden absolute bottom-0 h-full object-cover object-left"
            />
          </>
        )}
      </div>

      {/* Mobile content */}
      <div className="md:hidden w-full px-10 max-sm:px-6 mt-5 flex flex-col py-10">

        <img src={logo} alt="logo" className="max-sm:mt-5" />

        <div
          data-aos="fade-left"
          className="relative dark:bg-gradient-to-r from-gray-700 to-gray-900"
        >
          {/* <video
            src={video}
            autoPlay
            loop
            controls
            muted
            className="w-full h-[300px] object-cover pt-10"
          /> */}
          <iframe
            src="https://www.youtube.com/embed/SQ_Lv07MOSg?autoplay=1&controls=1&showinfo=0&modestbranding=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-[300px] object-cover pt-10"
          ></iframe>
        </div>

        <img
          className="w-8 h-80 absolute bottom-10 left-0 sm:hidden max-sm:-ml-4"
          src={guionesnar}
          alt="Guiones"
        />
        <img
          className="w-8 h-80 absolute bottom-10 right-0 sm:hidden max-sm:-mr-4"
          src={guionesnar}
          alt="Guiones"
        />

        <div className="w-5/6 h-auto pb-5 border-4 border-orange-600 rounded-xl mx-auto mt-5 max-sm:mt-16">
          <div>
            <p className="max-md:text-sm text-center px-6 pt-6 font-messina dark:text-white">
              ¡Bienvenidos a nuestro sitio oficial!{" "}
            </p>
            <p className="max-md:text-sm text-center px-6 font-messina dark:text-white">
              Todo lo que necesitas saber para entrenar con nosotros en un solo
              lugar.
            </p>
          </div>

          <nav className="w-full lg:mt-10 md:mt-8 sm:mt-4 max-sm:mt-8">
            <ul
              className="flex flex-col list-none font-semibold justify-between items-center text-[#fc4b08]
            font-roboto text-sm"
            >
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <a href="#activities">TUS ACTIVIDADES</a>
              </li>
              <hr className="text-black w-5/6" />
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <p className="cursor-pointer" onClick={toggleSedes}>
                  NUESTRAS SEDES
                </p>
              </li>
              {mostrarBotonesSedes && (
                <div className="flex mx-auto mb-2 max-sm:flex-col">
                  <Link to={"/Sedes/Concepcion"} className="max-sm:mx-auto">
                    <button className="bg-[#fc4b08] transition hover:bg-[#fc6e08] text-white  py-2 px-4 rounded sm:mr-4">
                      CONCEPCIÓN
                    </button>
                  </Link>
                  <Link to={"/Sedes/Monteros"} className="max-sm:mx-auto">
                    <button className="bg-[#fc4b08] transition hover:bg-[#fc6e08] text-white  py-2 px-4 rounded max-sm:mt-2">
                      MONTEROS
                    </button>
                  </Link>
                </div>
              )}
              <hr className="text-black w-5/6" />
              <li className="py-2 hover:text-orange-500 transition duration-200 ease-in-out">
                <a href="#about">CONOCÉ TODA NUESTRA INFO</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <FixedNavbar />
    </div>
  );
};

export default Hero;
