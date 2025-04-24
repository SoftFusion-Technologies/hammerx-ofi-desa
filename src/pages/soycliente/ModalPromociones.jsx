import React, { useState } from 'react';
import '../../styles/clients/botones.css';
import flecha from '../../images/flecha.png';
import { FaWhatsapp } from 'react-icons/fa'; // Importamos el ícono de WhatsApp
import PromoBNA from './PromosBancarias/4 (1).jpg';
import PromoMacro from './PromosBancarias/3 (3).jpg';
import PromoSantander from './PromosBancarias/8.jpg';
import NaranjaQR from './PromosBancarias/NaranjaQR.jpeg';
import PromoNxVer from './PromosBancarias/PromoNxVer.jpeg';
import sucredito from './PromosBancarias/5 (1).jpg';
import promogalicia from './PromosBancarias/7.jpg';
import promoPatagonia from './PromosBancarias/6 (1).jpg';
import promoBBVA from './PromosBancarias/9.jpg';
import WelcomeModal from './WelcomeModal'; // Asegúrate de tener el componente de modal importado

function ModalPromociones({ anterior, siguiente }) {
  //recibo las funciones que contienen la posición del modal siguiente y anterior
  const [isOpen, setIsOpen] = useState(true);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false); // Estado para el segundo modal
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false); // Estado para el tercer modal
  const [modalImage, setModalImage] = useState(null); // Para almacenar el identificador de la imagen
  const [isModalOpen, setIsModalOpen] = useState(false); // Para controlar si el modal está abierto

  const openSecondModal = () => {
    setIsSecondModalOpen(true); // Abre el segundo modal
  };

  const closeSecondModal = () => {
    setIsSecondModalOpen(false); // Cierra el segundo modal
  };

  const openThirdModal = () => setIsThirdModalOpen(true); // Abre el tercer modal
  const closeThirdModal = () => setIsThirdModalOpen(false); // Cierra el tercer modal

  const wspLinkMonteros = 'https://wa.me/5493863564651'; // Número de WhatsApp para Monteros
  const wspLinkConcepcion = 'https://wa.me/5493865855100'; // Número de WhatsApp para Concepción
  const wspLinkSanMiguel = 'https://wa.me/5493875678901';

  const promoImages = [
    PromoBNA,
    PromoMacro,
    PromoSantander,
    // NaranjaQR,
    // PromoNxVer,
    sucredito,
    promogalicia,
    promoPatagonia,
    promoBBVA
  ]; // Array dinámico

  const handleButtonClick = (imageId) => {
    if (isModalOpen) {
      setIsModalOpen(false); // Cerrar el modal antes de abrir uno nuevo
      setTimeout(() => {
        setModalImage(imageId); // Establecer la imagen después de cerrar el modal
        setIsModalOpen(true); // Abrir el nuevo modal
      }, 100); // Le damos un tiempo para cerrar el modal antes de abrir uno nuevo
    } else {
      setModalImage(imageId); // Establecer la imagen directamente si el modal no está abierto
      setIsModalOpen(true); // Abrir el modal
    }
  };

  return (
    <>
      {/* Se movió el botón al archivo Clients.js */}
      {/* Main modal */}
      {isOpen && (
        <>
          {/* Fondo oscurecido */}
          <div
            className="fixed top-0 left-0 bottom-0 right-0 md:-left-5 w-full h-full bg-black opacity-50 z-40"
            onClick={closeModal}
          ></div>
          {/* Modal */}
          <div
            id="default-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="flex items-center justify-center fixed top-0 right-0 left-0 bottom-0 z-50"
          >
            {/* En la flecha anterior el evento click muestra el modal de la posición recibida por parametro */}
            <img
              onClick={anterior}
              className="h-10 cursor-pointer transition hover:invert"
              src={flecha}
              alt="Flecha"
            />
            <div className="max-h-[80vh] overflow-y-auto p-5 space-y-3 text-gray-700 dark:text-gray-400">
              {' '}
              {/* Se modificó en ancho del modal de full a 80% para que se visualicen las flechas en mobile, cambiado por Rafael Peralta */}
              {/* Modal content */}
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl text-gray-900 dark:text-white font-bignoodle tracking-wide">
                    ¡NUESTRAS PROMOS!
                  </h3>
                  <button
                    onClick={closeModal}
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="default-modal"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                {/* Modal body */}
                <div className="p-4 md:p-5 space-y-4">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                    Hace click en alguna de ellas y entérate.{' '}
                  </p>

                  <div className="space-y-2 mt-4 md:flex md:space-x-4 md:space-y-0">
                    {/* Mapeamos un array de promociones para crear un botón por cada una */}
                    {[
                      {
                        name: 'PROMOCIONES FAMILIARES',
                        id: 1
                      },
                      {
                        name: 'PROMOCIONES AMIGOS REFERIDOS',
                        id: 2
                      },
                      {
                        name: 'PROMOCIONES PLANES LARGOS',
                        id: 3
                      }
                      // {
                      //   name: 'PROMOCIONES BANCARIAS',
                      //   id: 4,
                      //   action: openThirdModal // Acción específica para este botón
                      // }
                    ].map((promocion, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          promocion.action
                            ? promocion.action()
                            : handleButtonClick(promocion.id)
                        }
                        type="button"
                        className="w-full md:flex-1 text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-bignoodle text-xl font-medium rounded-lg px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span>{promocion.name}</span>
                        </div>
                      </button>
                    ))}

                    {isModalOpen && <WelcomeModal imageId={modalImage} />}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl text-gray-900 dark:text-white font-bignoodle tracking-wide">
                    Convenios
                  </h3>
                  <button
                    onClick={closeModal}
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="default-modal"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                {/* Modal body */}
                <div className="p-4 md:p-5 space-y-4">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                    •GYMPASS: Gestionalo desde tu App GymPass.
                    <br />
                    •SIPROSA: 10% OFF.
                    <br />
                    •GREMIO UEJN (PODER JUDICIAL): SOCIOS DIRECTOS 10% OFF -
                    FAMILIARES 5% OFF.
                    <br />
                    •CENTRO DE FUNCIONARIOS JUDICIALES: 10% OFF.
                    <br />
                    •AFIP: 15% OFF - HASTA 2 FAMILIARES ADICIONALES.
                    <br />
                    •GRUPO ARCOR.
                    <br />
                    •CITROMAX.
                    <br />
                    •GREMIO DOCENTES UDT 10% OFF
                    <br />
                    •CIRCULO MEDICO DEL SUR: 10% OFF
                    <br />
                    •CLUB SAN BERNARDO 10% OFF
                  </p>
                </div>
                {/* Modal footer */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    onClick={openSecondModal}
                    type="button"
                    className="w-full md:w-auto text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                  >
                    Más información
                  </button>{' '}
                  <button
                    onClick={closeModal}
                    type="button"
                    className="w-full md:w-auto text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={closeModal}
                    type="button"
                    className="w-full md:w-auto py-2.5 px-5 ms-3 text-sm font-medium text-gray-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#fc4b08] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
            {/* En la flecha anterior el evento click muestra el modal de la posición recibida por parametro */}
            <img
              onClick={siguiente}
              className="h-10 transform rotate-180 cursor-pointer transition hover:invert"
              src={flecha}
              alt="Flecha"
            />
          </div>
        </>
      )}
      {isSecondModalOpen && (
        <>
          {/* Fondo oscurecido */}
          <div
            className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
            onClick={closeSecondModal}
          ></div>
          {/* Modal */}
          <div
            id="second-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="flex items-center justify-center fixed inset-0 z-50"
          >
            <div className="relative p-4 w-full sm:max-w-xl md:max-w-2xl max-h-full">
              {/* Modal content */}
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl text-gray-900 dark:text-white font-bignoodle tracking-wide">
                    Selecciona la Sede
                  </h3>
                  <button
                    onClick={closeSecondModal}
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="second-modal"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                {/* Modal body */}
                <div className="p-4 md:p-5 space-y-4">
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                    Monteros: <strong>Número : +54 9 3863 56-4651</strong>
                  </p>
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                    Concepción: <strong>Número : +54 9 3865 85-5100</strong>
                  </p>
                  <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                    San Miguel: <strong>Número : +54 9 3813 98-8383</strong>
                  </p>
                </div>
                {/* Modal footer */}
                <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 space-y-4 md:space-y-0 md:space-x-4">
                  <button
                    onClick={closeSecondModal}
                    type="button"
                    className="w-full md:w-auto text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                  >
                    Aceptar
                  </button>
                  <div className="flex flex-col md:flex-row w-full justify-between space-y-4 md:space-y-0 md:space-x-4">
                    <a
                      href={wspLinkMonteros}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <FaWhatsapp className="text-green-500 text-3xl hover:text-green-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Monteros
                      </span>
                    </a>
                    <a
                      href={wspLinkConcepcion}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <FaWhatsapp className="text-green-500 text-3xl hover:text-green-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        Concepción
                      </span>
                    </a>
                    <a
                      href={wspLinkSanMiguel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2"
                    >
                      <FaWhatsapp className="text-green-500 text-3xl hover:text-green-400" />
                      <span className="text-sm text-gray-900 dark:text-white">
                        San Miguel
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isThirdModalOpen && (
        <>
          <div
            className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
            onClick={closeThirdModal}
          ></div>
          <div className="flex items-center justify-center fixed inset-0 z-50">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 p-4 w-[100%] max-w-4xl">
              <h3 className="text-xl font-bignoodle">Promociones Bancarias</h3>
              <div className="p-4 space-y-4">
                <p>
                  ¡Aprovecha nuestras promociones bancarias con descuentos
                  especiales!
                </p>
                <div className="overflow-x-auto">
                  <div className="flex gap-4">
                    {promoImages.map((promo, index) => (
                      <img
                        key={index}
                        src={promo}
                        alt={`Flyer Promoción ${index + 1}`}
                        className="w-2/2 sm:w-1/3 lg:w-1/4 xl:w-2/2 h-auto rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={closeThirdModal}
                className="mt-4 bg-orange-500 text-white rounded-lg px-5 py-2.5"
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ModalPromociones;
