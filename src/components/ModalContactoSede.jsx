/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: Modal que se abrirá al hacer clic en el botón de WhatsApp, mostrando las sedes disponibles y permitiendo al usuario contactarse directamente a través de WhatsApp.
 *
 *
 *  Tema: Modal de Contacto - Sedes
 *  Capa: Frontend
 */

export const sedes = [
  { nombre: "Monteros", numero: "3863564651" },
  { nombre: "Concepción", numero: "3865855100" },
  { nombre: "Barrio Sur", numero: "3813988383" },
  { nombre: "Barrio norte", numero: "3815584172" },
];

import { FaWhatsapp, FaTimes } from "react-icons/fa";

const ModalContactoSede = ({ showModal, closeModal, sede = "Todas" }) => {
  const handleWhatsAppClick = (numero) => {
    const mensaje = "Hola! Quiero hacer una consulta";
    const url = `https://wa.me/549${numero}?text=${encodeURIComponent(
      mensaje
    )}`;
    window.open(url, "_blank");
    closeModal();
  };

  const formatTelefonoArg = (numero) => {
    return `+54 9 ${numero.substring(0, 3)} ${numero.substring(
      3,
      6
    )}-${numero.substring(6)}`;
  };


  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bignoodle text-3xl text-orange-600 tracking-wide">
            {sede === "Todas" ? "Contactanos por Sede" : `Contacto - ${sede}`}
          </h2>
          <button
            onClick={closeModal}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {sede === "Todas" && (
          <p className="text-gray-600 text-center mb-8 font-messina">
            Elige la sede más cercana para contactarnos directamente por WhatsApp
          </p>
        )}

        <div className="flex flex-col gap-4">
          {sede === "Todas"
            ? sedes.map((sede) => (
                <button
                  key={sede.numero}
                  onClick={() => handleWhatsAppClick(sede.numero)}
                  className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-5 px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-white bg-opacity-20 rounded-full p-2">
                        <FaWhatsapp size={24} />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-xl font-messina">
                          {sede.nombre}
                        </span>
                        <div className="text-green-100 text-sm font-mono tracking-wider">
                          {formatTelefonoArg(sede.numero)}
                        </div>
                      </div>
                    </div>
                    <div className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
                      →
                    </div>
                  </div>
                </button>
              ))
            : sedes
                .filter((s) => s.nombre.toLowerCase() === sede.toLowerCase())
                .map((sede) => (
                  <button
                    key={sede.numero}
                    onClick={() => handleWhatsAppClick(sede.numero)}
                    className="group relative bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-2xl py-5 px-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-white bg-opacity-20 rounded-full p-2">
                          <FaWhatsapp size={24} />
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-xl font-messina">
                            {sede.nombre}
                          </span>
                          <div className="text-green-100 text-sm font-mono tracking-wider">
                            {formatTelefonoArg(sede.numero)}
                          </div>
                        </div>
                      </div>
                      <div className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))}
        </div>

        <button
          onClick={closeModal}
          className="mt-8 w-full py-3 px-6 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all duration-300 font-messina font-medium focus:outline-none focus:ring-4 focus:ring-gray-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ModalContactoSede;
