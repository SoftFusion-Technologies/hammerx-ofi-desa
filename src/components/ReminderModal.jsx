import React from 'react';

const ReminderModal = ({ task, show, handleClose }) => {
  if (!show) return null;

  return (
    <div className="h-screen w-full fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]">
      <div className="w-[400px] max-sm:w-[300px] flex flex-col bg-white p-4 rounded-xl">
        <button className="self-end text-gray-600" onClick={handleClose}>
          X
        </button>
        <div className="mt-4">
          <h2 className="text-center font-bold text-xl mb-4">
            Recordatorio de Tarea
          </h2>
          <h5 className="text-center font-semibold mb-2">{task.titulo}</h5>
          <p className="text-center mb-2">{task.descripcion}</p>
          <p className="text-center mb-2">
            <strong>Día:</strong> {task.dias}
          </p>
          <p className="text-center mb-2">
            <strong>Hora:</strong> {task.hora}
          </p>
        </div>
        <button
          className="mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded transition-colors duration-100 hover:bg-gray-400"
          onClick={handleClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ReminderModal;
