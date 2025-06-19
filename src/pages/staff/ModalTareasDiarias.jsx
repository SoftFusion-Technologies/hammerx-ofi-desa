import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRegTimesCircle } from 'react-icons/fa';

const ModalTareasDiarias = ({ onClose, userId, userName }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayUserName, setDisplayUserName] = useState('');

  useEffect(() => {
    fetchTareas();
    // eslint-disable-next-line
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

  useEffect(() => {
    if (userName && userName.includes('@')) {
      setDisplayUserName(userName.split('@')[0]);
    } else {
      setDisplayUserName(userName || '');
    }
  }, [userName]);

  function stripHtmlTags(html) {
    return html ? html.replace(/<[^>]*>?/gm, '') : '';
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        {/* MODAL ANIMADO */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 60 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ duration: 0.36, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-xl mx-4 p-0 sm:p-0"
        >
          <div className="bg-white dark:bg-zinc-900/85 rounded-3xl shadow-xl border border-orange-100 dark:border-zinc-800 backdrop-blur-xl px-8 py-8 sm:py-10 sm:px-12 flex flex-col gap-2 ring-1 ring-orange-100">
            {/* BOTÓN CERRAR */}
            <button
              aria-label="Cerrar"
              onClick={onClose}
              className="absolute top-4 right-4 text-orange-500 hover:text-orange-700 transition-colors duration-200 text-3xl focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <FaRegTimesCircle />
            </button>
            {/* HEADER */}
            <h2 className="font-bignoodle font-extrabold text-3xl md:text-5xl mb-1 text-center text-orange-600 tracking-wider select-none">
              ¡Bienvenido {displayUserName}!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-300 text-center mb-5 text-lg font-medium tracking-tight">
              Estas son tus tareas asignadas para hoy
            </p>
            {/* LISTADO */}
            <div className="mt-2">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-zinc-400 text-lg animate-pulse">
                  Cargando tareas...
                </div>
              ) : tareas.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-zinc-400 text-lg">
                  No hay tareas asignadas.
                </div>
              ) : (
                <ul className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                  {tareas.map((item) => (
                    <li
                      key={item.daily_task_id}
                      className="bg-orange-50 dark:bg-zinc-800/70 rounded-xl px-4 py-3 flex flex-col shadow-sm border border-orange-100 dark:border-zinc-700 transition group"
                    >
                      <span className="text-orange-700 dark:text-orange-400 font-semibold text-base md:text-lg">
                        {item.daily_task?.titulo}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 text-sm md:text-base font-normal mt-1">
                        {stripHtmlTags(item.daily_task?.descripcion)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* BOTÓN CERRAR */}
            <div className="mt-10 flex justify-center">
              <motion.button
                onClick={onClose}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.04 }}
                className="px-8 py-3 bg-gradient-to-tr from-orange-500 to-orange-700 text-white rounded-full font-bold shadow-md hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg"
              >
                Cerrar
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
      {/* SCROLLBAR PERSONALIZADA (puedes mover a tu CSS global) */}
      <style>
        {`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f97316;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        `}
      </style>
    </AnimatePresence>
  );
};

export default ModalTareasDiarias;
