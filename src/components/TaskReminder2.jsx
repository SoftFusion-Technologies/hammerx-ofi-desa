import React, { useEffect, useState } from 'react';

const TaskReminder2 = ({ tasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const hour = `${hours}:${minutes}:00`; // Formato de hora hh:mm:ss
    const day = now.toLocaleDateString('es-ES', { weekday: 'long' });
    return { hour, day };
  };

  const checkTasks = () => {
    const { hour, day } = getCurrentTime();
    console.log(`Hora actual: ${hour}, Día actual: ${day}`);

    for (const task of tasks) {
      console.log(
        `Comparando con tarea - Hora: ${task.hora}, Días: ${task.dias}`
      );
      const taskDays = task.dias.split(',').map((d) => d.trim().toLowerCase());
      if (task.hora === hour && taskDays.includes(day.toLowerCase())) {
        console.log(`Mostrando modal para tarea: ${task.titulo}`);
        setCurrentTask(task);
        setIsModalOpen(true);
        break; // Solo mostrar un modal a la vez
      }
    }
  };

  useEffect(() => {
    console.log('Verificando tareas al montar el componente...');
    checkTasks(); // Verifica las tareas al montar el componente
    const interval = setInterval(checkTasks, 60000); // Verifica cada minuto
    return () => clearInterval(interval);
  }, [tasks]);

  useEffect(() => {
    console.log('Montando componente TaskReminder...');
    const { hour, day } = getCurrentTime();
    const taskMatches = tasks.some((task) => {
      const taskDays = task.dias.split(',').map((d) => d.trim().toLowerCase());
      return task.hora === hour && taskDays.includes(day.toLowerCase());
    });
    if (!taskMatches) {
      setIsModalOpen(false); // Cierra el modal si no hay coincidencias al montar el componente
    }
  }, [tasks]);

  return (
    <>
      {isModalOpen && (
        <div className="h-screen w-full fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex justify-center items-center z-[100]">
          <div className="w-[400px] max-sm:w-[300px] flex flex-col bg-white p-4 rounded-xl">
            <button
              className="self-end text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              X
            </button>
            <div className="mt-4">
              <h2 className="text-center font-bold text-xl mb-4">
                Recordatorio de Tarea
              </h2>
              <h5 className="text-center font-semibold mb-2">
                Titulo: {currentTask?.titulo}
              </h5>
              <p className="text-center mb-2">
                Descripción: {currentTask?.descripcion}
              </p>
              <p className="text-center mb-2">
                <strong>Día:</strong> {currentTask?.dias}
              </p>
              <p className="text-center mb-2">
                <strong>Hora:</strong> {currentTask?.hora}
              </p>
            </div>
            <button
              className="mt-4 bg-gray-300 text-gray-700 py-2 px-4 rounded transition-colors duration-100 hover:bg-gray-400"
              onClick={() => setIsModalOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskReminder2;
