import React, { useState } from 'react';
import '../../styles/clients/botones.css';
import flecha from '../../images/flecha.png';

function ModalAccesorios({ anterior, siguiente }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <>
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
            <img
              onClick={anterior}
              className="h-10 cursor-pointer transition hover:invert"
              src={flecha}
              alt="Flecha"
            />
            <div className="relative p-4 w-[80%] sm:w-full max-w-2xl max-h-full">
              {/* Modal content */}
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                {/* Modal header */}
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-xl text-gray-900 dark:text-white font-bignoodle tracking-wide">
                    Accesorios e indumentaria
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
                    Se está construyendo...
                  </p>
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

                  <button
                    onClick={closeModal}
                    type="button"
                    className="w-full md:w-auto py-2.5 px-5 text-sm font-medium text-gray-600 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-[#fc4b08] focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
            <img
              onClick={siguiente}
              className="h-10 transform rotate-180 cursor-pointer transition hover:invert"
              src={flecha}
              alt="Flecha"
            />
          </div>
        </>
      )}
    </>
  );
}

export default ModalAccesorios;
