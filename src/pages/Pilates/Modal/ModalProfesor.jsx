import React, { useState, useEffect } from "react";

const ModalProfesor = ({ isOpen, onClose, horarioData, onSave, instructores = [] }) => {
  // horarioData: { instructorId, instructorName, day, hour }
  const [selectedId, setSelectedId] = useState(null);
  const [originalId, setOriginalId] = useState(null);

  useEffect(() => {
    if (isOpen && horarioData) {
      setSelectedId(horarioData.instructorId || "");
      setOriginalId(horarioData.instructorId || "");
    }
  }, [isOpen, horarioData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setSelectedId(Number(e.target.value));
  };

  const handleSave = () => {
    const selectedInstructor = instructores.find((i) => i.id === selectedId);
    onSave &&
      onSave({
        ...horarioData,
        instructorId: selectedId,
        instructorName: selectedInstructor ? selectedInstructor.nombre_completo : null,
      });
    onClose();
  };

  const currentInstructor = instructores.find((i) => i.id === originalId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Asignar Instructor</h2>
          <p className="text-blue-100 mt-1 text-lg font-semibold">
            {horarioData?.day} - {horarioData?.hour}
          </p>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 font-semibold mb-2">
              Instructor actual:
            </p>
            <div className="bg-gray-100 rounded p-3 text-gray-800">
              {currentInstructor ? (
                currentInstructor.nombre_completo
              ) : (
                <span className="italic text-gray-500">No asignado</span>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2">
              Cambiar instructor
            </label>
            <select
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedId}
              onChange={handleChange}
            >
              <option value="">-- Seleccionar instructor --</option>
              {instructores.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre_completo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            {selectedId !== originalId && selectedId !== "" && (
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200"
              >
                Modificar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProfesor;