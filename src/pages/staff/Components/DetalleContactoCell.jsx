import React, { useState } from 'react';

export default function DetalleContactoCell({ detalle }) {
  const [open, setOpen] = useState(false);
  const maxWords = 2; // Cambia esto al número de palabras que quieras mostrar antes del "Ver más"

  if (!detalle)
    return <span className="text-gray-400 italic">sin detalle</span>;

  // Limita la cantidad de palabras
  const words = detalle.split(' ');
  const isTruncated = words.length > maxWords;
  const shortDetalle = isTruncated
    ? words.slice(0, maxWords).join(' ') + '...'
    : detalle;

  return (
    <>
      <span
        className={`cursor-pointer ${
          isTruncated ? 'text-blue-600 hover:underline' : ''
        }`}
        onClick={() => isTruncated && setOpen(true)}
        title={isTruncated ? 'Ver todo el detalle' : ''}
        tabIndex={isTruncated ? 0 : -1}
        style={{ outline: 'none' }}
      >
        {shortDetalle}
      </span>
      {/* Modal simple y responsivo */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-5 rounded-2xl shadow-xl max-w-lg w-full mx-2 relative animate-fade-in">
            <button
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-red-600 focus:outline-none"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-2 text-[#fc4b08]">
              Detalle de Contacto
            </h3>
            <div className="text-gray-800 whitespace-pre-line">{detalle}</div>
          </div>
        </div>
      )}
    </>
  );
}
