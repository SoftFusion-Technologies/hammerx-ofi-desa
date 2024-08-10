/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Subpágina que contiene los valores de Hammer.
 *
 *
 *  Tema: Nuestros Valores
 *  Capa: Frontend
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/header/Navbar";
import "../../styles/ourValues/background.css";
import "../../styles/ourValues/cards.css";
import Footer from "../../components/footer/Footer";

const OurValues = () => {
  useEffect(() => {
    document.title = "Nuestros Valores";
  }, []);

  return (
    <>
      <Navbar />
      <div className="w-full bgnv flex flex-col">
        <div className="pt-16">
          <div className="pt-2 pl-5 max-sm:pl-2">
            <Link to="/nosotros">
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
        </div>

        <div className="w-11/12 mx-auto flex justify-evenly">
          <div className="letters h-contain flex flex-col items-center max-sm:hidden justify-center">
            <div className="letter py-5 px-10 bg-gradient-to-b from-orange-500 to-[#fc4b08] transition text-white hover:from-white hover:to-slate-50 hover:transition hover:duration-200 hover:ease-in-out rounded-lg hover:text-[#fc4b08] ">
              <p>
                <span>H</span>
              </p>
              <p>
                <span>A</span>
              </p>
              <p>
                <span>M</span>
              </p>
              <p>
                <span>M</span>
              </p>
              <p>
                <span>E</span>
              </p>
              <p>
                <span>R</span>
              </p>
            </div>
          </div>

          <div className="vcards w-2/3 max-sm:text-center">
            <div className="vcard">
              <div className="vcard1 md:w-1/2 select-none">
                <h3>HONESTIDAD</h3>
                <p className="small select-none">Transparencia al 100%</p>
              </div>
            </div>

            <div className="vcard flex md:justify-end">
              <div className="vcard1 right-bg md:w-1/2 select-none">
                <h3>ACTITUD</h3>
                <p className="small select-none">
                  Actitud alegre creando un ambiente que desborde de energías
                  positivas.
                </p>
              </div>
            </div>

            <div className="vcard">
              <div className="vcard1 md:w-1/2 select-none">
                <h3>MOTIVACIÓN</h3>
                <p className="small select-none">
                  Para un aprendizaje y mejora continua de nuestros servicios.
                </p>
              </div>
            </div>

            <div className="vcard flex md:justify-end">
              <div className="vcard1 right-bg md:w-1/2 select-none">
                <h3>MORAL</h3>
                <p className="small select-none">
                  Actuar siempre con buenas intenciones.
                </p>
              </div>
            </div>

            <div className="vcard">
              <div className="vcard1 md:w-1/2 select-none">
                <h3>EMPATIA</h3>
                <p className="small select-none">
                  Para conectar con nuestros socios y entender las diferentes
                  situaciones particulares que vive cada uno.
                </p>
              </div>
            </div>

            <div className="vcard flex md:justify-end">
              <div className="vcard1 right-bg md:w-1/2 select-none">
                <h3>RESPETO</h3>
                <p className="small select-none">
                  Responsabilidad y respeto a todos por igual, sin distinciones,
                  creando un ambiente inclusivo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OurValues;
