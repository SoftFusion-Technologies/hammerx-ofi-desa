// ClaseAccionPicker.jsx
import React from 'react';

export default function ClaseAccionPicker({
  isOpen,
  onClose,
  onPick,
  numeroClase
}) {
  if (!isOpen) return null;
  const options = ['Agenda', 'Visita programada', 'Clase de prueba'];

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-orange-600 mb-3">
          Clase #{numeroClase}: ¿Qué querés agendar?
        </h3>
        <div className="grid gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onPick(opt)}
              className="w-full text-left px-4 py-2 rounded border border-gray-300 hover:bg-orange-50"
            >
              {opt}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
