/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: Componente que muestra el encabezado del formulario de quejas, incluyendo un botón de regreso y un botón de WhatsApp
 *
 *
 *  Tema: Portal de Atención - Encabezado de Quejas
 *  Capa: Frontend
 */

import { FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import { IoReturnUpBack } from "react-icons/io5";

const QuejasHeaders = ({ openModal }) => {
  const quejasHeader = {
    header_left_main: "PORTAL DE ATENCIÓN",
    header_left_sub: "TU OPINIÓN ES MUY IMPORTANTE PARA NOSOTROS",
    icon: FaWhatsapp,
  };
  return (
    <>
      <div className="col-span-1 min-h-36 bg-orange-600 text-white relative">
        <div className="grid grid-cols-3 items-center min-h-36 py-4">
          {/* Botón de regreso - columna izquierda */}
          <div
            className="col-span-1 lg:col-span-2 flex justify-start items-center ml-4 sm:ml-6 lg:ml-10 gap-16"
            data-aos="fade-right"
          >
            <Link to="/">
              <div className="bg-white hover:bg-gray-100 rounded-full p-3 shadow-lg cursor-pointer transition-all duration-300 hover:scale-110">
                <IoReturnUpBack className="text-orange-600 text-xl sm:text-2xl" />
              </div>
            </Link>
            <div className="col-span-1 text-left hidden lg:block">
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
                {quejasHeader.header_left_main}
              </h1>
              <h1 className="text-sm sm:text-lg xl:text-2xl mt-1 leading-tight">
                {quejasHeader.header_left_sub}
              </h1>
            </div>
          </div>

          {/* Contenido central - títulos */}
          <div
            className="col-span-1 text-nowrap text-center block lg:hidden "
            data-aos="fade-up"
          >
            <h1 className="text-3xl lg:text-5xl font-bold leading-tight">
              {quejasHeader.header_left_main}
            </h1>
            <h1 className="text-sm sm:text-lg xl:text-2xl mt-1 leading-tight">
              {quejasHeader.header_left_sub}
            </h1>
          </div>

          {/* Botón WhatsApp - columna derecha */}
          <div
            className="col-span-1 hidden lg:flex justify-end items-center mr-10"
            onClick={openModal}
            data-aos="fade-left"
          >
            {quejasHeader.icon && (
              <quejasHeader.icon className="text-orange-600 h-12 lg:h-16 cursor-pointer hover:scale-110 transition-transform bg-slate-50 w-16 lg:w-20 rounded-md p-2" />
            )}
          </div>
        </div>
      </div>

      {/* Botón flotante para WhatsApp en móviles */}
      <div
        className="lg:hidden fixed bottom-6 right-6 z-50"
        onClick={openModal}
      >
        {quejasHeader.icon && (
          <quejasHeader.icon className="text-white bg-green-500 hover:bg-green-600 h-14 w-14 cursor-pointer hover:scale-110 transition-all duration-300 rounded-full p-3 shadow-lg" />
        )}
      </div>
    </>
  );
};

export default QuejasHeaders;
