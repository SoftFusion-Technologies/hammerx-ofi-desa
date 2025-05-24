/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 24 / 05 / 2025
 * Versión: 1.0
 * Última modificacion: -
 * Descripción: Componente que muestra un modal de ayuda con un formulario de contacto
 *
 *
 *  Tema: Portal de Atención - Modal de Ayuda
 *  Capa: Frontend
 */

import AyudasForms from "./AyudasForms";

const ModalAyuda = ({closeModalHelp, showModalHelp}) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={closeModalHelp}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <AyudasForms isModal={showModalHelp} closeModal={closeModalHelp} />
      </div>
    </div>
  );
};

export default ModalAyuda;
