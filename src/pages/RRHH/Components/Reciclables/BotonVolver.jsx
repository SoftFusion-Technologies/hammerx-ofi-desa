import React from "react";

const BotonVolver = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
    >
      <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
      Volver atrás
    </button>
  );
};

export default BotonVolver;
