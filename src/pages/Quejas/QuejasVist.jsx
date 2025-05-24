/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: Componente principal de la página de quejas y comentarios que contiene el header, formulario de quejas y modal de ayuda
 *
 *
 *  Tema: Portal de Atención - Quejas y Comentarios
 *  Capa: Frontend
 */

import AyudasForms from "./AyudasForms";
import QuejasForms from "./QuejasForms";
import ModalContactoSede from "../../components/ModalContactoSede";
import { useEffect, useState } from "react";
import Aos from "aos";
import QuejasHeaders from "./QuejasHeaders";
import { FaInfoCircle } from "react-icons/fa";
import ModalAyuda from "./ModalAyuda";

const QuejasVist = () => {
  const [showModal, setShowModal] = useState(false);
  const [showModalHelp, setShowModalHelp] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const closeModalHelp = () => {
    setShowModalHelp(false);
  };

  const openModalHelp = () => {
    setShowModalHelp(true);
  };

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowModalHelp(true);
    }
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024 && showModalHelp) {
        setShowModalHelp(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [showModalHelp, hasInitialized]);

  useEffect(() => {
    Aos.init({
      duration: 800,
      once: true,
    });
  }, []);

  return (
    <>
      {/* Estructura básica */}
      <div className="min-h-screen bg-red-50">
        <div className="grid grid-cols-1 font-bignoodle gap-y-10">
          <QuejasHeaders
            openModal={openModal}
            closeModal={closeModalHelp}
          ></QuejasHeaders>
          <div
            className="col-span-1 mx-auto text-gray-500 font-roboto mb-10"
            data-aos="fade-up"
          >
            <div className="grid grid-cols-2 gap-10 mx-2 sm:mx-10">
              <div className="hidden lg:block col-span-1 border-1 px-10 bg-white rounded-md ">
                <AyudasForms isModal={showModalHelp}></AyudasForms>
              </div>
              <div className="col-span-2 lg:col-span-1 border-1 bg-white rounded-md">
                <QuejasForms></QuejasForms>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contacto */}
      <ModalContactoSede showModal={showModal} closeModal={closeModal} />

      {/* Modal de ayuda móbile*/}
      {showModalHelp && (
        <ModalAyuda
          closeModalHelp={closeModalHelp}
          showModalHelp={showModalHelp}
        ></ModalAyuda>
      )}

      {/* Botón flotante para ayuda en móviles */}
      <div
        className="lg:hidden fixed bottom-24 right-6 z-49"
        onClick={openModalHelp}
      >
        <FaInfoCircle className="text-white bg-blue-500 hover:bg-blue-600 h-14 w-14 cursor-pointer hover:scale-110 transition-all duration-300 rounded-full p-3 shadow-lg" />
      </div>
    </>
  );
};

export default QuejasVist;
