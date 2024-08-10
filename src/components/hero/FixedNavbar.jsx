/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: NavBar fixed que contiene el texto "Quiero probar una clase gratis".
 *  
 *
 *  Tema: Fixed Navbar
 *  Capa: Frontend
 */

import { useEffect, useState } from "react";
import "../../styles/hero/fixedNavbar.css"
import FormTestClass from "../Forms/FormTestClass";
import FormPostulante from "../Forms/FormPostulante";

const FixedNavbar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [modal, setModal] = useState(false); //estado para manejar el modal

  //funcion para abrir modal de clase gratis
  const verModal = () => {
    setModal(true);
  }
  const cerrarModal = () => {
    setModal(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 0) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`cursor-pointer max-md:hidden w-full absolute bottom-0 z-40 bg-gray-200 transition-opacity duration-200 ${isVisible ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'fixed' }}>
        <div onClick={verModal} className="border-2 bg-white py-4 w-full box">
          <ul className="list-none">
            <li className="">
              <p className="text-center font-bignoodle text-[20px] tracking-wider">¡QUIERO PROBAR UNA CLASE GRATIS!</p>
            </li>
          </ul>
        </div>
      </nav>

      {/* Modal de clase gratis */}
      <FormTestClass isOpen={modal} onClose={cerrarModal} />

      {/* Navbar flotantepara celu*/}
      <nav className={`hidden max-md:flex w-full absolute bottom-0 z-40 bg-gray-200 transition-opacity duration-200 `} style={{ position: 'fixed' }}>
        <div onClick={verModal} className="border-2 bg-white py-4 w-full box">
          <ul className="list-none">
            <li className="">
              <p className="text-center font-bignoodle text-[20px] tracking-wider">¡QUIERO PROBAR UNA CLASE GRATIS!</p>
            </li>
          </ul>
        </div>
      </nav>

      {/* Modal de clase gratis */}
      <FormTestClass isOpen={modal} onClose={cerrarModal} />
    </>
  );
};

export default FixedNavbar;
