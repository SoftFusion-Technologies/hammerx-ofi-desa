import React, { useState, useEffect } from 'react';
import axios from 'axios';

const NotificationsAgendas = ({ user1, user2 }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const URL = 'http://localhost:8080';

  const agendaTitles = {
    1: 'Nuevo 1ra Semana',
    2: 'Nuevo 3ra Semana',
    3: 'Clase/Semana de Prueba',
    4: 'Inactivo',
    5: 'Devolución Final',
    6: 'Otros Agendamientos'
  };

  const user_id = user1 || user2;

  useEffect(() => {
    fetchNotificaciones();
  }, [user_id]);

  const fetchNotificaciones = async () => {
    try {
      // Usamos user1 si está disponible, sino usamos user2

      console.log('id del usuario', user_id);

      if (!user_id) {
        // Si ninguno de los dos valores está presente, puedes manejar el error o mostrar un mensaje
        console.error('No se ha proporcionado un id de instructor');
        return;
      }

      const response = await axios.get(
        `${URL}/notificaciones?user_id=${user_id}`
      );
      setNotificaciones(response.data);
      if (response.data.length > 0) {
        setModalOpen(true); // Abrir modal si hay notificaciones
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="uppercase text-xl font-bold text-gray-800 mb-4 text-center">
              Agendas Pendientes
            </h2>
            {loading ? (
              <p className="text-gray-500">Cargando...</p>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                <ul className="space-y-3">
                  {notificaciones.map((notificacion, index) => (
                    <li
                      key={index}
                      className="p-4 bg-gray-100 rounded-md shadow-sm text-gray-700"
                    >
                      {index + 1} - El alumno{' '}
                      <span className="font-medium text-orange-600">
                        {notificacion.alumno_nombre}
                      </span>{' '}
                      tiene la agenda{' '}
                      <strong className="text-orange-600 uppercase">
                        {agendaTitles[notificacion.agenda_num] ||
                          'Agenda Desconocida'}
                      </strong>{' '}
                      en estado
                      <span className="text-red-600 font-bold"> PENDIENTE.</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              onClick={() => setModalOpen(false)}
              className="mt-6 w-full bg-orange-600 text-white py-2 rounded-md shadow-md hover:bg-orange-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationsAgendas;
