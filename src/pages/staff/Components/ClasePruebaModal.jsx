import React, { useState, useEffect } from 'react';

const OPCIONES_TIPO = ['Agenda', 'Visita programada', 'Clase de prueba'];

const ClasePruebaModal = ({
  isOpen,
  onClose,
  onSave,
  numeroClase,
  prospecto, // objeto completo
  tipoSeleccionado // string desde el padre (puede venir vacío)
}) => {
  const [fecha, setFecha] = useState('');
  const [observacion, setObservacion] = useState('');
  const [tipo, setTipo] = useState(''); // 👈 ahora editable

  useEffect(() => {
    if (prospecto && numeroClase) {
      const fechaKey = `clase_prueba_${numeroClase}_fecha`;
      const obsKey = `clase_prueba_${numeroClase}_obs`;
      const tipoKey = `clase_prueba_${numeroClase}_tipo`;

      setFecha(prospecto[fechaKey]?.slice(0, 10) || '');
      setObservacion(prospecto[obsKey] || '');
      setTipo(tipoSeleccionado || prospecto[tipoKey] || '');
    }
  }, [prospecto, numeroClase, tipoSeleccionado]);

  const handleSubmit = () => {

    onSave({
      fecha: fecha || null,
      tipo: tipo || null,
      observacion: observacion || ''
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl w-full max-w-md">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-600">
          Clase #{numeroClase} — {prospecto?.nombre || 'Prospecto'}
        </h2>

        {/* Tipo (editable) */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-1">Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="" disabled>
              Seleccioná una opción
            </option>
            {OPCIONES_TIPO.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div className="mb-4">
          <label className="block text-sm text-gray-700">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        {/* Observación */}
        <div className="mb-1">
          <label className="block text-sm text-gray-700">Observación:</label>
          <textarea
            value={observacion}
            onChange={(e) => setObservacion(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60"
            disabled={!tipo}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClasePruebaModal;
