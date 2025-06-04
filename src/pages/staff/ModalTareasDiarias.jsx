import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ModalTareasDiarias = ({ onClose, userId, userName }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTareas();
  }, [userId]);

  const fetchTareas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/user-daily-tasks/user/${userId}`
      );
      setTareas(res.data);
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const [displayUserName, setDisplayUserName] = useState('');

  useEffect(() => {
    if (userName && userName.includes('@')) {
      const atIndex = userName.indexOf('@');
      const usernameWithoutDomain = userName.substring(0, atIndex);
      setDisplayUserName(usernameWithoutDomain);
    } else {
      setDisplayUserName(userName);
    }
  }, [userName]);

  function stripHtmlTags(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4">
        <h2 className="font-bignoodle text-center text-4xl font-extrabold mb-6 text-orange-600 tracking-wide">
          Bienvenido {displayUserName}
        </h2>
        <h2 className="uppercase  text-xl font-extrabold mb-6 ">
          Estas son tus tareas asignadas
        </h2>

        {loading ? (
          <p className="text-gray-400 text-lg">Cargando tareas...</p>
        ) : tareas.length === 0 ? (
          <p className="text-gray-400 text-lg">No hay tareas asignadas.</p>
        ) : (
          <ul className="list-disc pl-7 space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-gray-100">
            {tareas.map((item) => (
              <li
                key={item.daily_task_id}
                className="text-gray-700 text-lg leading-relaxed"
              >
                <span className="font-semibold text-orange-600">
                  {item.daily_task?.titulo}
                </span>{' '}
                — {stripHtmlTags(item.daily_task?.descripcion)}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-colors duration-300 shadow-md"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalTareasDiarias;
