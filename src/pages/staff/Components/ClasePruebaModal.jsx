import React, { useState, useEffect } from 'react';

const ClasePruebaModal = ({
  isOpen,
  onClose,
  onSave,
  numeroClase,
  prospecto,
  tipoSeleccionado
}) => {
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');

  useEffect(() => {
    if (prospecto && numeroClase) {
      const fechaKey = `clase_prueba_${numeroClase}_fecha`;
      const obsKey = `clase_prueba_${numeroClase}_obs`;
      const tipoKey = `clase_prueba_${numeroClase}_tipo`;

      setFecha(prospecto[fechaKey]?.slice(0, 10) || '');
      setObservacion(prospecto[obsKey] || '');
    }
  }, [prospecto, numeroClase]);

  const handleSubmit = () => {
    const fechaKey = `clase_prueba_${numeroClase}_fecha`;
    const obsKey = `clase_prueba_${numeroClase}_obs`;
    const tipoKey = `clase_prueba_${numeroClase}_tipo`;

    onSave(prospecto.id, {
      [fechaKey]: fecha,
      [obsKey]: observacion,
      [tipoKey]: tipoSeleccionado || prospecto?.[tipoKey] || null
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-orange-600">
          Clase #{numeroClase}
        </h2>

        {tipoSeleccionado && (
          <div className="mb-3">
            <span className="text-xs text-gray-600">Tipo seleccionado: </span>
            <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-800 text-xs font-semibold">
              {tipoSeleccionado}
            </span>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-700">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-700">Observación:</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClasePruebaModal;
