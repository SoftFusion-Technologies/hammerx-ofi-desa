/*
 * Programador: Benjamin orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 2.0
 *
 * Descripción: Subpágina que se abre luego de hacer click en el botón principal "Soy Cliente".
 * Contiene diferente información sobre los servicios del gimnasio.
 *
 *
 *  Tema: Soy Cliente
 *  Capa: Frontend
 */

import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../../components/header/Navbar";

import ModalEntrenador from "./ModalEntrenador";
import ModalPromociones from "./ModalPromociones";
import ModalContratos from "./ModalContratos";
import ModalConvenios from "./ModalConvenios";
import ModalTransferencia from "./ModalTransferencia";

import ModalAccesorios from "./ModalAccesorios";
import ModalAprovecha from "./ModalAprovecha";
import ModalCabina from "./ModalCabina";
import ModalMaraton from "./ModalMaraton";

import "../../styles/clients/volver.css";
import "../../styles/clients/botones.css";
import "../../styles/clients/background.css";
import Footer from "../../components/footer/Footer";
import NuevaVista from "./NuevaVista";
import Promociones from "./Promociones";
import WelcomeModal from "./WelcomeModal"; // Asegúrate de tener el componente de modal importado
import Promos from "./Promos";
import Planes from "./Planes";
import Aos from "aos";
import "aos/dist/aos.css";
import AppPromo from "./Images/app2.jpg";
import Convernios from "./Images/convenios.jpg";
import Separador from "../../components/Separador";
import Bienvenido from "./Bienvenido";
import Entrenador from "./Entrenador";
import fondo_img from "./Images/chicos3.jpg";

const Clients = () => {
  // useEffect(() => {
  //   document.title = 'Soy Cliente';
  // }, []);

  //estados que se utilizarán para el renderizado de los modals
  const [showModal, setShowModal] = useState("");
  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
  }, []);

  //array con los modals
  const modals = [
    "entrenador",
    "promociones",
    "contratos",
    "convivencia",
    "app",
    // 'convenios',
    // 'transferencia',
    // 'accesorios',
    // 'aprovecha',
    // 'cabina',
    // 'maraton'
  ];

  const handleAnterior = () => {
    // Obtiene el índice del modal actual
    const currentIndex = modals.indexOf(showModal);
    // Calcula el índice anterior (circular)
    const previousIndex = (currentIndex - 1 + modals.length) % modals.length;
    // Cambia al modal anterior solo si no es 'undefined'
    setShowModal(modals[previousIndex]);
  };

  const handleSiguiente = () => {
    // Obtiene el índice del modal actual
    const currentIndex = modals.indexOf(showModal);
    // Calcula el índice siguiente (circular)
    const nextIndex = (currentIndex + 1) % modals.length;
    // Cambia al modal siguiente solo si no es 'undefined'
    setShowModal(modals[nextIndex]);
  };

  const scrollToPromociones = () => {
    const element = document.getElementById("promociones");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const refPromos = useRef(null);
  const refPlanes = useRef(null);
  const refEntrenador = useRef(null);
  const refApp = useRef(null);

  return (
    <>
      <Navbar />
      <Bienvenido></Bienvenido>
      <Separador></Separador>
      <div className="w-full bg-gradient-to-b from-orange-500 to-[#fc4b08]">
        <div className="bglcli pb-5">
          <header className="w-full" id="promociones">
            <div className="pl-10 max-sm:pl-2">
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
            <h1
              className="text-white max-md:text-[40px] text-[50px] text-center font-bignoodle "
              data-aos="fade-down"
            >
              Soy Cliente
            </h1>
          </header>

          <div className="h-contain w-5/6 mx-auto">
            <div className="py-5 flex justify-center gap-4 flex-wrap space-x-0  lg:space-x-5">
              {/* Primer grupo de 2 botones */}
              {/* Se pasaron el jsx y los estilos de los botones a este archivo para poder controlar desde aquí el evento click para renderizar cada uno de los modals */}
              <div className="flex justify-center gap-4 max-sm:flex-col md:space-x-5">
                {/* <button
                  onClick={() => setShowModal('accesorios')} // Aquí se establece el modal a 'accesorios'
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Nuestros accesorios e Indumentaria
                </button>
                {showModal === 'accesorios' && (
                  <ModalAccesorios
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                {/* <button
                  onClick={() => setShowModal('descuentos')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  ¡Aprovecha Todos Estos Descuentos!
                </button>

                {showModal === 'descuentos' && (
                  <ModalAprovecha
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                <button
                  onClick={() => scrollToRef(refEntrenador)}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                  data-aos="fade-up"
                >
                  Contás con tu entrenador
                </button>
                <button
                  onClick={() => scrollToRef(refPromos)}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                  data-aos="fade-up"
                >
                  Promociones y Convenios
                </button>
                {
                  //verificación del estado para renderizar los componentes
                  showModal === "entrenador" && (
                    //reciben las funciones que contienen la posición del modal que se mostrará en anterior y siguiente
                    <ModalEntrenador
                      anterior={handleAnterior}
                      siguiente={handleSiguiente}
                    />
                  )
                }
              </div>
              {/* Segundo grupo de 3 botones */}
              <div className="flex justify-center gap-4 mt-4 2xl:mt-0 max-sm:mt-0 sm:flex-wrap max-sm:flex-col md:space-x-6">
                <button
                  onClick={() => scrollToRef(refPlanes)}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                  data-aos="fade-up"
                >
                  Congelar y Transferir Planes
                </button>
                {/* <button
                  onClick={() => setShowModal('convenios')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Convenios
                </button>
                {showModal === 'convenios' && (
                  <ModalConvenios
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                {/* <button
                  onClick={() => setShowModal('transferencia')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Transferencia de planes
                </button>
                {showModal === 'transferencia' && (
                  <ModalTransferencia
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                {/* <button
                  onClick={() => setShowModal('cabina')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Cabina Solar
                </button>
                {showModal === 'cabina' && (
                  <ModalCabina
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                {/* <button
                  onClick={() => setShowModal('maraton')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Maratón de Entrenamiento
                </button>
                {showModal === 'maraton' && (
                  <ModalMaraton
                    anterior={handleAnterior}
                    siguiente={handleSiguiente}
                  />
                )} */}
                <button
                  onClick={() => setShowModal("convivencia")}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                  data-aos="fade-up"
                >
                  Normas de Convivencia
                </button>
                {showModal === "convivencia" && <WelcomeModal imageId={4} />}

                <button
                  onClick={() => scrollToRef(refApp)}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                  data-aos="fade-up"
                >
                  Descarga tu App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Separador />
      <Promos ref={refPromos} />
      <Separador />
      <Planes ref={refPlanes} />
      <Separador />
      <Entrenador ref={refEntrenador} />
      <Separador />
      <div data-aos="fade-up" ref={refApp}>
        <img src={AppPromo} alt="descarga nuestra app" />
      </div>
      <Separador />
      <Footer />
      <button
        className="btn btn-primary btn-floating"
        onClick={scrollToPromociones}
        aria-label="Scroll to promociones"
      >
        <i className="bi bi-arrow-down"></i>
      </button>
    </>
  );
};

export default Clients;
