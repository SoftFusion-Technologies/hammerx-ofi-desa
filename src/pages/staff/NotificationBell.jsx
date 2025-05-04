import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newNotificationCount, setNewNotificationCount] = useState(0);
  const [hideNotificationCounter, setHideNotificationCounter] = useState(false);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { userName, userLevel } = useAuth();
  const URL = 'http://localhost:8080/';

  useEffect(() => {
    const getUserIdByEmail = async () => {
      try {
        const response = await fetch(`${URL}users/`);
        if (!response.ok) {
          throw new Error(
            `Error al obtener los usuarios: ${response.statusText}`
          );
        }
        const users = await response.json();
        const user = users.find((u) => u.email === userName);
        if (user) {
          setUserId(user.id);
        } else {
          console.log(`Usuario con email ${userName} no encontrado`);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getUserIdByEmail();
  }, [userName]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${URL}notifications/${userId}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        const filteredData = data.filter((n) => {
          if (
            n.title === 'Nueva queja registrada' ||
            n.title === 'Nueva pregunta frecuente registrada'
          ) {
            return true;
          }
          if (
            n.title === 'Nueva clase de prueba registrada' ||
            n.title === 'Nueva novedad registrada'
          ) {
            return userLevel !== 'instructor';
          }
          return false;
        });

        const unreadNotifications = filteredData.filter((n) => n.leido === 0);
        setNotifications(filteredData);
        setNewNotificationCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error al obtener las notificaciones:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleNotificationClick = async (notification) => {
    setIsOpen(!isOpen);
    if (newNotificationCount > 0) {
      setNewNotificationCount(0);
      setHideNotificationCounter(true);
    }

    try {
      const response = await fetch(`${URL}notifications/markAsRead`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notification_id: notification.id,
          user_id: userId
        })
      });

      const result = await response.json();
      if (response.ok) {
        const updatedNotifications = notifications.map((n) =>
          n.id === notification.id ? { ...n, leido: 1 } : n
        );
        setNotifications(updatedNotifications);
      } else {
        console.error(result.mensajeError);
      }
    } catch (error) {
      console.error('Error al marcar la notificación como leída:', error);
    }
  };

  const handleRedirect = (notification) => {
    if (notification.title === 'Nueva queja registrada') {
      navigate(`/dashboard/quejas/${notification.reference_id}`);
    } else if (notification.title === 'Nueva novedad registrada') {
      navigate(`/dashboard/novedades/${notification.reference_id}`);
    } else if (notification.title === 'Nueva clase de prueba registrada') {
      navigate(`/dashboard/testclass/`);
    } else if (notification.title === 'Nueva pregunta frecuente registrada') {
      navigate(`/dashboard/ask/${notification.reference_id}`);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell className="w-7 h-7 text-gray-700 hover:text-orange-500 transition duration-200 ease-in-out transform hover:scale-110" />
        {newNotificationCount > 0 && !hideNotificationCounter && (
          <span className="absolute top-[-6px] right-[-6px] bg-red-500 text-white text-xs rounded-full px-2 py-1 transition transform scale-110 animate-pulse">
            {newNotificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-md shadow-lg z-50 transform transition-all duration-200 ease-in-out opacity-100 scale-100">
          <ul className="max-h-64 overflow-auto">
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <li
                  key={n.id}
                  onClick={() => {
                    handleRedirect(n);
                    handleNotificationClick(n);
                  }}
                  className={`p-4 border-b text-sm cursor-pointer transition duration-300 ease-in-out transform ${
                    n.leido
                      ? 'bg-gray-100'
                      : 'bg-red-100 hover:bg-red-200 text-red-700' // Fondo rojo si no leída
                  }`}
                >
                  <div className="flex flex-col">
                    <strong className="text-lg text-gray-900">{n.title}</strong>
                    <div className="mt-1 text-gray-800 text-sm">
                      {n.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {format(new Date(n.created_at), 'dd/MM/yyyy HH:mm')}
                    </div>
                    {n.leido === 0 && (
                      <span className="text-xs text-red-500 mt-1">
                        No leída
                      </span> // Indicador de "No leída"
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="p-2 text-sm text-gray-500">Sin notificaciones</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
