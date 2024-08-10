/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Subpágina que se abre luego de hacer click en el botón principal "Quiero Conocerlos".
 * Contiene dos botones que llevan a otras subpáginas correspondientemente.
 *
 *
 *  Tema: Sobre Nosotros
 *  Capa: Frontend
 */

import FormTestClass from "../../components/Forms/FormTestClass";
import Navbar from "../../components/header/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/aboutUs/volver.css";
import "../../styles/aboutUs/botones.css";
import "../../styles/aboutUs/background.css";
import Footer from "../../components/footer/Footer";

const AboutUs = () => {
  useEffect(() => {
    document.title = "Quiero Conocerlos";
  }, []);

  const [modalClaseFree, setModalClaseFree] = useState(false);

  //metodos para abrir y cerrar modal de clase gratis
  const abrirModal = () => {
    setModalClaseFree(true)
  };
  const cerarModal = () => {
    setModalClaseFree(false)
  };

  return (
    <>
      <Navbar/>
      <div className="w-full pt-16 bg-gradient-to-b from-orange-500 to-[#fc4b08]">
        <div className="h-contain bgl">
          <header className="w-full">
            <div className="pl-10 pt-5 max-sm:pl-2">
              <Link to="/">
                <button className="button">
                  <div className="button-box">
                    <span className="button-elem">
                      <svg
                        viewBox="0 0 46 40"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"></path>
                      </svg>
                    </span>
                    <span className="button-elem">
                      <svg viewBox="0 0 46 40">
                        <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"></path>
                      </svg>
                    </span>
                  </div>
                </button>
              </Link>
            </div>

            <h1 className="text-white max-md:text-[40px] text-[50px] text-center font-bignoodle ">
              Quiero Conocerlos
            </h1>
          </header>

          <div className="">
            <div className="pt-10 max-md:pt-16 flex justify-center md:gap-10 max-md:flex-col">
              <Link
                to="/nosotros/quienessomos"
                className="max-md:mb-5 max-md:mx-auto"
              >
                <button className="btns font-messina font-semibold">
                  ¿Quienes Somos?
                </button>
              </Link>

              <Link
                to="/nosotros/nuestrosvalores"
                className="max-md:mb-5 max-md:mx-auto"
              >
                <button className="btns font-messina font-semibold">
                  Nuestros Valores
                </button>
              </Link>
            </div>

            { /* Dos botones nuevos agregados - Cambios realizado por Lucas Albornoz 12-04-24*/}
            <div className="pb-20 md:pt-8 flex justify-center md:gap-10  max-md:flex-col">
              <Link
                to="#"
                className="max-md:mb-5 max-md:mx-auto"
                onClick={abrirModal} 
              >
                <button className="btns font-messina font-semibold">
                  Probar una clase GRATIS
                </button>
              </Link>

              {/* Modal para abrir formulario de clase gratis */}
              <FormTestClass isOpen={modalClaseFree} onClose={cerarModal} />
              {/* Modal para abrir formulario de quiero trabajar con ustedes */}
              <a
                href="https://api.whatsapp.com/send?phone=543863564651"
                target="_blank"
                className="max-md:mb-5 max-md:mx-auto"
              >
                <button className="btns font-messina font-semibold">
                  Envianos un WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AboutUs;
