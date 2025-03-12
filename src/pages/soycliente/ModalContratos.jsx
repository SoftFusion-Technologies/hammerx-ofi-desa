import React, { useState, useEffect } from 'react';
import '../../styles/clients/botones.css';
import '../../styles/clients/cards.css';
import flecha from '../../images/flecha.png';
import { FaWhatsapp } from 'react-icons/fa'; // Importamos el ícono de WhatsApp
import { useNavigate } from 'react-router-dom'; // Importa el hook de navegación

function ModalContratos({ anterior, siguiente, bandera }) {
  //recibo las funciones que contienen la posición del modal siguiente y anterior
  const [isOpen, setIsOpen] = useState(true);

  const navigate = useNavigate(); // Hook para redirigir

  const [mensajeMonteros, setMensajeMonteros] = useState(
    'Hola! Vengo de la página web, quiero consultar por Congelamiento de Contratos Monteros.'
  );

  const [showModal, setShowModal] = useState('contratos');

  const [mensajeConcepcion, setMensajeConcepcion] = useState(
    'Hola! Vengo de la página web, quiero consultar por Congelamiento de Contratos Concepción.'
  );

  const closeModal = () => {
    setIsOpen(false);
  };

  const encodeMessage = (message) => {
    return encodeURIComponent(message);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    navigate('/clientes'); // Redirige cuando se cierra el modal
  };

  const wspLinkMonteros = `https://wa.me/5493863564651?text=${encodeMessage(
    mensajeMonteros
  )}`; // Número de WhatsApp para Monteros
  const wspLinkConcepcion = `https://wa.me/5493865855100?text=${encodeMessage(
    mensajeConcepcion
  )}`; // Número de WhatsApp para Concepción

  const [mensajeMonterosT, setMensajeMonterosT] = useState(
    'Hola! Vengo de la página web, quiero consultar por Transferencias de Planes Monteros'
  );

  const [mensajeConcepcionT, setMensajeConcepcionT] = useState(
    'Hola! Vengo de la página web, quiero consultar por Transferencias de Planes Concepción'
  );

  const wspLinkMonterosT = `https://wa.me/5493863564651?text=${encodeMessage(
    mensajeMonterosT
  )}`; // Número de WhatsApp para Monteros
  const wspLinkConcepcionT = `https://wa.me/5493865855100?text=${encodeMessage(
    mensajeConcepcionT
  )}`; // Número de WhatsApp para Concepción

  const handleCambiarContratos = () => {
    setShowModal('contratos');
  };
  const handleCambiarTransferencia = () => {
    setShowModal('transferencia');
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
            {bandera > 0 && (
              <img
                onClick={anterior}
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt="Flecha"
              />
            )}
            <div className="relative p-4 w-[80%] lg:w-full max-w-5xl max-h-full mt-10">
              {' '}
              {/* Se modificó en ancho del modal de full a 80% para que se visualicen las flechas en mobile, cambiado por Rafael Peralta */}
              {/* Modal content */}
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  {/* Botón de Congelamiento */}
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                    <button
                      className={`px-4 py-2 rounded-lg text-base sm:text-lg md:text-xl w-full sm:w-auto tracking-wide transition-all
    ${
      showModal === 'contratos'
        ? 'bg-orange-500 text-white'
        : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
    }`}
                      onClick={handleCambiarContratos}
                    >
                      Congelamiento de Contratos
                    </button>

                    <button
                      className={`px-4 py-2 rounded-lg text-base sm:text-lg md:text-xl w-full sm:w-auto tracking-wide transition-all
    ${
      showModal === 'transferencia'
        ? 'bg-orange-500 text-white'
        : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white'
    }`}
                      onClick={handleCambiarTransferencia}
                    >
                      Transferencia de Planes
                    </button>
                  </div>

                  {/* Botón de Cierre */}
                  <button
                    onClick={handleCloseModal}
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
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
                {showModal == 'contratos' && (
                  <div>
                    <div className="p-4 md:p-5 space-y-4 overflow-y-auto max-h-96 overflow-hidden">
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                        El gimnasio se compromete a brindar su servicio por el
                        periodo de tiempo contratado, el congelamiento de
                        contrato es un beneficio con el que cuenta el cliente y
                        solo podrá solicitarlo en situaciones particulares
                        respetando las siguientes condiciones:
                      </p>
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                        1_ El congelamiento se puede solicitar POR UNICA VEZ por
                        contrato.
                      </p>
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                        2_ Casos de solicitud: Lesiones o enfermedades que
                        imposibiliten al mismo asistir al gimnasio con
                        certificado medico que lo avale Viajes en temporada o
                        vacaciones con comprobante de reserva (pasaje,
                        hospedaje, etc).
                      </p>
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                        3_ No se realizan devoluciones o recuperaciones de días
                        perdidos, el congelamiento siempre se debe solicitar
                        previo a la inasistencia.
                      </p>
                      <div className="flex max-md:flex-col">
                        <div className="cardcontratos max-md:mx-auto">
                          <div className="content">
                            <p className="heading">
                              Plan Mensual y Trimestral: 7 (mínimo) a 30
                              (máximo) días
                            </p>
                            {/* <p className="para">
                          Se podrá realizar dentro de toda la duración del
                          contrato y por única vez, con una extensión mínima de
                          14 días y máxima de 30 días, solicitados por los
                          siguientes motivos: Enfermedades (solo con
                          certificación medica), Lesiones ocurridas dentro de
                          nuestras instalaciones (no serán incluidas lesiones
                          ocurridas fuera del gimnasio) y en el cual HAMMER
                          asuma responsabilidad de la misma, Viajes laborales o
                          vacaciones en temporada (con factura de reserva).
                        </p> */}
                          </div>
                        </div>
                        <div className="cardcontratos  max-md:mx-auto">
                          <div className="content">
                            <p className="heading">
                              Plan Semestral: 7 (mínimo) a 30 (máximo) días
                            </p>
                            {/* <p className="para">
                          Se podrá congelar dentro de toda la duración del mismo
                          y por única vez, con una extensión mínima de 14 días y
                          máxima de 60 días y solicitados por los siguientes
                          motivos. Enfermedades (solo con certificación medica),
                          Lesiones ocurridas dentro de nuestras instalaciones
                          (no serán incluidas lesiones ocurridas fuera del
                          gimnasio) y en el cual HAMMER asuma responsabilidad de
                          la misma, Viajes laborales o vacaciones en temporada
                          (con factura de reserva).
                        </p> */}
                          </div>
                        </div>
                        <div className="cardcontratos  max-md:mx-auto">
                          <div className="content">
                            <p className="heading">
                              Plan Anual: 7 (mínimo) a 60 (máximo) días.
                            </p>
                            {/* <p className="para">
                          Se podrá congelar dentro de toda la duración del
                          mismo, con una extensión mínima de 14 días y máxima de
                          45 días y solicitados por los siguientes motivos.
                          Enfermedades (solo con certificación medica), Lesiones
                          ocurridas dentro de nuestras instalaciones (no serán
                          incluidas lesiones ocurridas fuera del gimnasio) y en
                          el cual HAMMER asuma responsabilidad de la misma,
                          Viajes laborales o vacaciones en temporada (con
                          factura de reserva).
                        </p> */}
                          </div>
                        </div>
                      </div>
                      {/* <p className="text-gray-500">
                    Todos los congelamientos deben ser solicitados y aceptados
                    antes de la inasistencia, quedando imposibilitada la opcion
                    de recuperar los días luego de ya haber sido perdidos. NOTA:
                    Todos los planes pueden ser abonados y dar inicio en la
                    fecha acordada.
                  </p> */}
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 space-y-4 md:space-y-0 md:space-x-4">
                      <button
                        onClick={handleCloseModal}
                        type="button"
                        className="w-full md:w-auto text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                      >
                        Aceptar
                      </button>

                      {/* Iconos de WhatsApp */}
                      <div className="flex w-full md:w-auto justify-between space-x-4">
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
                      </div>

                      <button
                        onClick={closeModal}
                        type="button"
                        className="w-full md:w-auto py-2.5 px-5 text-sm font-medium text-gray-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#fc4b08] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {showModal == 'transferencia' && (
                  <div>
                    <div className="p-4 md:p-5 space-y-4 overflow-y-auto max-h-96 overflow-hidden">
                      <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400 font-messina">
                        Este beneficio es aplicable en caso de imposibilitarse
                        la continuidad del plan por algún motivo o
                        disconformidad con el servicio (Garantía). Se podrá
                        realizar la transferencia del contrato solo a nuevos
                        clientes, que no hayan asistido al gimnasio nunca, o que
                        no estén asistiendo hace al menos 4 meses (120 días) o
                        más.
                      </p>
                      <div className="flex max-md:flex-col">
                        <div className="cardcontratos max-md:mx-auto">
                          <div className="content">
                            <p className="heading">1.</p>
                            <p className="para">
                              En caso de planes mensuales se podrá realizar
                              hasta 10 días de la fecha de pago del contrato.
                            </p>
                          </div>
                        </div>
                        <div className="cardcontratos  max-md:mx-auto">
                          <div className="content">
                            <p className="heading">2.</p>
                            <p className="para">
                              En caso de planes semestrales se podrá realizar
                              hasta 21 días de la fecha de pago del contrato.
                            </p>
                          </div>
                        </div>
                        <div className="cardcontratos  max-md:mx-auto">
                          <div className="content">
                            <p className="heading">3.</p>
                            <p className="para">
                              En caso de planes anuales se podrá realizar hasta
                              30 días de la fecha de pago del contrato.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Modal footer */}
                    <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 space-y-4 md:space-y-0 md:space-x-4">
                      <button
                        onClick={closeModal}
                        type="button"
                        className="w-full md:w-auto text-white bg-orange-500 hover:bg-[#fc4b08] focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-orange-600 dark:hover:bg-[#fc4b08] dark:focus:ring-orange-700"
                      >
                        Aceptar
                      </button>

                      {/* Iconos de WhatsApp */}
                      <div className="flex w-full md:w-auto justify-between space-x-4">
                        <a
                          href={wspLinkMonterosT}
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
                          href={wspLinkConcepcionT}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2"
                        >
                          <FaWhatsapp className="text-green-500 text-3xl hover:text-green-400" />
                          <span className="text-sm text-gray-900 dark:text-white">
                            Concepción
                          </span>
                        </a>
                      </div>

                      <button
                        onClick={closeModal}
                        type="button"
                        className="w-full md:w-auto py-2.5 px-5 text-sm font-medium text-gray-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#fc4b08] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
                {/* Modal footer */}
              </div>
            </div>
            {/* En la flecha anterior el evento click muestra el modal de la posición recibida por parametro */}
            {bandera > 0 && (
              <img
                onClick={siguiente}
                className="h-10 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt="Flecha"
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

export default ModalContratos;
