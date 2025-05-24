/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: "Componente que muestra información de ayuda sobre cómo usar el portal de quejas, incluyendo recomendaciones y detalles de confidencialidad
 *
 *
 *  Tema: Portal de Atención - Información de Ayuda
 *  Capa: Frontend
 */

import { FaInfoCircle, FaTimes } from "react-icons/fa";

const AyudasForms = ({ isModal, closeModal }) => {
  const ayudasCard = {
    header: "¿CÓMO PODEMOS AYUDARTE?",
    subheader: "En este apartado podes cargar tu:",
    items: [
      {
        id: "1",
        label: "Recomendación si crees que podemos mejorar en algún aspecto.",
      },
      {
        id: "2",
        label:
          "Queja o conflicto que hayas tenido en el GYM con el staff, el servicio u otro cliente.",
      },
      {
        id: "3",
        label:
          "Algún equipo que esté avertiado y quieras notificarnos tu opinión o experiencia positiva.",
      },
    ],
    info: [
      {
        icons: FaInfoCircle,
        header: "Información importante",
        text: "Tu información será tratada de manera confidencial y solo será utilizado para resolver tu solicitud.",
      },
    ],
  };
  return (
    <div className="col-span-1 relative" data-aos="zoom-in">
      {isModal && (
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <FaInfoCircle className="text-2xl animate-bounce" />
            <h2 className="text-xl font-bold font-bignoodle">
              Centro de Ayuda
            </h2>
          </div>
          <button
            onClick={closeModal}
            className="text-white hover:text-orange-200 hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
            aria-label="Cerrar modal"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>
      )}

      <h1
        className={`${
          isModal ? "text-3xl px-5" : "text-2xl md:text-5xl"
        } mt-10 !text-orange-600 font-bignoodle `}
      >
        {ayudasCard.header}
      </h1>
      <h1
        className={`${
          isModal ? "text-base sm:text-lg px-5" : "text-lg md:text-xl"
        } mt-5`}
      >
        {ayudasCard.subheader}
      </h1>
      <div className="grid grid-cols-1 mt-2">
        {ayudasCard.items.map((item, index) => (
          <div
            key={item.id}
            className={`${
              isModal ? "text-sm sm:text-base px-5" : "text-base sm:text-lg"
            } mb-2 sm:mb-3 flex items-start gap-2 sm:gap-3`}
          >
            <div
              className={`bg-orange-600 text-white rounded-full ${
                isModal ? "w-6 h-6 text-sm" : "w-8 h-8 text-lg"
              } flex items-center justify-center font-bold flex-shrink-0 mt-1`}
            >
              {index + 1}
            </div>
            <span className="leading-relaxed">{item.label}</span>
          </div>
        ))}
      </div>
      <div
        className={`${isModal ? "mx-2" : ""} bg-orange-100 min-h-16 sm:min-h-20 p-3 sm:p-4 lg:p-5 rounded-lg mt-3 sm:mt-4`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="w-1 min-h-8 sm:min-h-12 bg-orange-600 flex-shrink-0 mt-1"></div>
          {ayudasCard.info.map((infoItem, index) => (
            <div key={index}>
              <h1
                className={`text-orange-800 font-bold flex items-center gap-2 ${
                  isModal ? "text-sm sm:text-base " : "text-base sm:text-lg"
                }`}
              >
                {infoItem.icons && (
                  <infoItem.icons
                    className={isModal ? "text-sm" : "text-base"}
                  />
                )}
                {infoItem.header}
              </h1>
              <p
                className={`text-orange-500 leading-relaxed ${
                  isModal ? "text-xs sm:text-sm" : "text-sm sm:text-base"
                }`}
              >
                {infoItem.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {isModal && (
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-100">
          <div className="flex justify-center  gap-3">
            <button
              onClick={closeModal}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AyudasForms;
