/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de pautas hammer.
 *
 *
 *  Tema: Pautas
 *  Capa: Frontend
 */

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/header/Navbar";
import whats from "../../src/images/redes/whatsapp.png";
import insta from "../../src/images/redes/instagram.png";
import facebook from "../../src/images/redes/facebook.png";
import "../styles/aboutUs/volver.css";
import Footer from "../components/footer/Footer";

const Contacto = () => {
  useEffect(() => {
    document.title = "Contacto";
  }, []);

  return (
    <>
      <Navbar />
      <div className="h-full bg-[#fc4b08] py-16">
        <header className="w-full">
          <div className="pl-10 pt-5 max-sm:pl-2">
            <Link to="/">
              <button className="button">
                <div className="button-box">
                  <span className="button-elem">
                    <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
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

        <div>
          <h2 className="pt-10 text-white max-md:text-[40px] text-[34px] text-center font-bignoodle ">
            WhatsApp
          </h2>
          <div className="flex flex-col justify-center items-center gap-5">
            <a
              className="h-10 w-[40%] bg-white rounded-xl"
              href="https://api.whatsapp.com/send?phone=543863564651"
              target="_blank"
            >
              <div>
                <div className="flex justify-center items-center gap-1 pt-1">
                  <img src={whats} alt="WhatsApp" />
                  <p className="text-xl font-bignoodle text-[#fc4b08]">
                    Concepción
                  </p>
                </div>
              </div>
            </a>
            <a
              className="h-10 w-[40%] bg-white rounded-xl"
              href="https://api.whatsapp.com/send?phone=543863564651"
              target="_blank"
            >
              <div>
                <div className="flex justify-center items-center gap-1 pt-1">
                  <img src={whats} alt="WhatsApp" />
                  <p className="text-xl font-bignoodle text-[#fc4b08]">
                    Monteros
                  </p>
                </div>
              </div>
            </a>
          </div>

          <div>
            <h2 className="pt-10 text-white max-md:text-[40px] text-[34px] text-center font-bignoodle ">
              Instagram
            </h2>
            <div className="flex justify-center items-center">
              <a
                className="h-10 w-[40%] bg-white rounded-xl"
                href="https://instagram.com/hammer.ok"
                target="_blank"
              >
                <div>
                  <div className="flex justify-center items-center gap-1 pt-1">
                    <img src={insta} alt="WhatsApp" />
                    <p className="text-xl font-bignoodle text-[#fc4b08]">
                      HAMMER.OK
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h2 className="pt-10 text-white max-md:text-[40px] text-[34px] text-center font-bignoodle ">
              Facebook
            </h2>
            <div className="flex justify-center items-center">
              <a
                className="h-10 w-[40%] bg-white rounded-xl"
                href="https://facebook.com/hammer.okey"
                target="_blank"
              >
                <div>
                  <div className="flex justify-center items-center gap-1 pt-1">
                    <img className="h-5" src={facebook} alt="WhatsApp" />
                    <p className="text-xl font-bignoodle text-[#fc4b08]">
                      HAMMER.OK
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <div>
            <h2 className="pt-10 text-white max-md:text-[40px] text-[34px] text-center font-bignoodle ">
              Mail
            </h2>
            <div className="flex justify-center items-center">
              <a className="h-10 w-[40%] bg-white rounded-xl" href="#">
                <div>
                  <div className="flex justify-center items-center gap-1 pt-1">
                    <p className="text-xl font-bignoodle text-[#fc4b08]">
                      Contacto@Hammer.ar
                    </p>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contacto;
