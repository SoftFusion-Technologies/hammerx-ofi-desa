import React from 'react';
import { FiX, FiZoomIn } from 'react-icons/fi';

export default function ModalDetalleContacto({ open, onClose, detalle }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white p-7 rounded-3xl shadow-2xl w-[96vw] max-w-lg relative border-2 border-orange-100 animate-fade-in">
        <button
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-[#fc4b08] hover:scale-125 transition"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FiX />
        </button>
        <h3 className="text-lg font-black text-[#fc4b08] mb-3 flex items-center gap-2">
          <FiZoomIn className="text-[#fc4b08]" /> Detalle de Contacto
        </h3>
        <div className="text-gray-800 text-base leading-relaxed whitespace-pre-line break-words">
          {detalle}
        </div>
      </div>
      <style>
        {`
          .animate-fade-in {
            animation: fadeInDetalleModal .23s cubic-bezier(.33,.68,.58,1) both;
          }
          @keyframes fadeInDetalleModal {
            from { opacity: 0; transform: scale(.95);}
            to   { opacity: 1; transform: scale(1);}
          }
        `}
      </style>
    </div>
  );
}
