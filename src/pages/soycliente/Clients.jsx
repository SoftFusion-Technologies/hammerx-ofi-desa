/*
 * Programador: Lucas Albornoz
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
import { useEffect, useState } from "react";
import Navbar from "../../components/header/Navbar";

import ModalEntrenador from "./ModalEntrenador";
import ModalPromociones from "./ModalPromociones";
import ModalContratos from "./ModalContratos";
import ModalConvenios from "./ModalConvenios";
import ModalTransferencia from "./ModalTransferencia";

import "../../styles/clients/volver.css";
import "../../styles/clients/botones.css";
import "../../styles/clients/background.css";
import Footer from "../../components/footer/Footer";
import NuevaVista from "./NuevaVista";
import Promociones from "./Promociones";

const Clients = () => {
  useEffect(() => {
    document.title = 'Soy Cliente';
  }, []);

  //estados que se utilizarán para el renderizado de los modals
  const [showModal, setShowModal] = useState('');

  //array con los modals
  const modals = [
    'entrenador',
    'promociones',
    'contratos',
    'convenios',
    'transferencia'
  ];

  const isOpen = (type) => showModal === type;

  const toggleModal = (type) => {
    setShowModal((prev) => (prev === type ? '' : type));
  };

  //Estas funciones cambian el estado que renderiza el modal, usando el índice del array que corresponda
  const entrenador = () => {
    setShowModal(modals[0]);
    setShowModal('');
  };
  const promociones = () => {
    setShowModal(modals[1]);
  };
  const contratos = () => {
    setShowModal(modals[2]);
  };
  const convenios = () => {
    setShowModal(modals[3]);
  };
  const transferencia = () => {
    setShowModal(modals[4]);
  };

  {
    /* Cada modal recibe la funcion para mover al modal anterior y siguiente con la posición correspondiente */
  }
  const entrenadorAnt = () => {
    {
      /* Estando parado en el modalEntrenador que el índice es 0 el anterior será el índice 4 (el último) */
    }
    setShowModal(modals[4]);
  };
  const entrenadorSig = () => {
    {
      /* Estando parado en el modalEntrenador que el índice es 0 el siguiente será el índice 1 (el 2do). Lo mismo con cada función */
    }
    setShowModal(modals[1]);
  };
  const promocionesAnt = () => {
    setShowModal(modals[0]);
  };
  const promocionesSig = () => {
    setShowModal(modals[2]);
    console.log(setShowModal);
  };
  const contratosAnt = () => {
    setShowModal(modals[1]);
  };
  const contratosSig = () => {
    setShowModal(modals[3]);
    console.log(setShowModal);
  };
  const conveniosAnt = () => {
    setShowModal(modals[2]);
  };
  const conveniosSig = () => {
    setShowModal(modals[4]);
    console.log(setShowModal);
  };
  const transfeAnt = () => {
    setShowModal(modals[3]);
  };
  const transfeSig = () => {
    setShowModal(modals[0]);
    console.log(setShowModal);
  };

  const scrollToPromociones = () => {
    const element = document.getElementById('promociones');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <>
      <Navbar />
      <NuevaVista></NuevaVista>
      <div className="w-full bg-gradient-to-b from-orange-500 to-[#fc4b08]">
        <div className="bglcli pb-5">
          <header className="w-full" id="promociones">
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
              Soy Cliente
            </h1>
          </header>

          <div className="h-contain w-5/6 mx-auto">
            <div className="pt-20 max-sm:pt-16 flex justify-center gap-4 flex-wrap">
              {/* Primer grupo de 2 botones */}
              {/* Se pasaron el jsx y los estilos de los botones a este archivo para poder controlar desde aquí el evento click para renderizar cada uno de los modals */}
              <div className="flex justify-center gap-4 max-sm:flex-col md:space-x-5">
                <button
                  onClick={() => toggleModal('entrenador')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Contás con tu entrenador
                </button>
                <button
                  onClick={() => toggleModal('promociones')} //este evento llama a la función para cambiar el estado que renderiza los modals y así mostrarlo y así con los demás botones
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Promociones
                </button>
                {
                  //verificación del estado para renderizar los componentes
                  showModal === 'entrenador' && (
                    //reciben las funciones que contienen la posición del modal que se mostrará en anterior y siguiente
                    <ModalEntrenador
                      anterior={entrenadorAnt}
                      siguiente={entrenadorSig}
                    />
                  )
                }
                {showModal === 'promociones' && (
                  <ModalPromociones
                    anterior={promocionesAnt}
                    siguiente={promocionesSig}
                  />
                )}
              </div>
              {/* Segundo grupo de 3 botones */}
              <div className="flex justify-center gap-4 mt-4 max-sm:mt-0 sm:flex-wrap max-sm:flex-col md:space-x-5">
                <button
                  onClick={() => toggleModal('contratos')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Congelamiento de Contratos
                </button>
                {showModal === 'contratos' && (
                  <ModalContratos
                    anterior={contratosAnt}
                    siguiente={contratosSig}
                  />
                )}
                <button
                  onClick={() => toggleModal('convenios')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Convenios
                </button>
                {showModal === 'convenios' && (
                  <ModalConvenios
                    anterior={conveniosAnt}
                    siguiente={conveniosSig}
                  />
                )}
                <button
                  onClick={() => toggleModal('transferencia')}
                  className="btnscli font-messina font-semibold max-sm:mb-5"
                  type="button"
                >
                  Transferencia de planes
                </button>
                {showModal === 'transferencia' && (
                  <ModalTransferencia
                    anterior={transfeAnt}
                    siguiente={transfeSig}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Promociones />
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
