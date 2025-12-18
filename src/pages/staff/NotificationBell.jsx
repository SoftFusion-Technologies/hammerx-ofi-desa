import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  // 1) Obtener userId por email
  useEffect(() => {
    const getUserIdByEmail = async () => {
      if (!userName) return;

      try {
        setLoading(true);
        setError(null);

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
        setError(err.message || 'Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    getUserIdByEmail();
  }, [userName]);

  // 2) Obtener notificaciones
  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setError(null);

      // Notificaciones manuales
      const response = await fetch(`${URL}notifications/${userId}`);
      const data = await response.json();

      // Notificaciones automáticas de clase de prueba (HOY)
      const resClases = await fetch(
        `${URL}notifications/clases-prueba/${userId}`
      );
      const clasesPrueba = await resClases.json();

      const clasesPruebaNotis = clasesPrueba.map((p) => ({
        id: `clase-prueba-${p.prospecto_id}`,
        title: 'Clase de prueba agendada HOY',
        message: `Clase para ${p.nombre} (${p.contacto})`,
        created_at:
          p.clase_prueba_1_fecha ||
          p.clase_prueba_2_fecha ||
          p.clase_prueba_3_fecha,
        leido: 0,
        reference_id: p.prospecto_id,
        type: 'clase_prueba'
      }));

      // Filtro de notificaciones manuales
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

      const allNotis = [...clasesPruebaNotis, ...filteredData];

      const unreadNotifications = allNotis.filter((n) => n.leido === 0);

      setNotifications(allNotis);
      setNewNotificationCount(unreadNotifications.length);
      setHideNotificationCounter(false);
    } catch (error) {
      console.error('Error al obtener las notificaciones:', error);
      setError('No se pudieron cargar las notificaciones');
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // 3) Marcar como leída + cerrar
  const handleNotificationClick = async (notification) => {
    // Cerrar panel
    setIsOpen(false);

    // Si había nuevas, limpiamos contador
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

  // 4) Redirección según tipo/título
  const handleRedirect = (notification) => {
    if (notification.title === 'Nueva queja registrada') {
      navigate(`/dashboard/quejas/${notification.reference_id}`);
    } else if (notification.title === 'Nueva novedad registrada') {
      navigate(`/dashboard/novedades/${notification.reference_id}`);
    } else if (
      notification.title === 'Nueva clase de prueba registrada' ||
      notification.type === 'clase_prueba' ||
      notification.title === 'Clase de prueba agendada HOY'
    ) {
      navigate('/dashboard/ventas', {
        state: { prospectoId: notification.reference_id }
      });
    } else if (notification.title === 'Nueva pregunta frecuente registrada') {
      navigate(`/dashboard/ask/${notification.reference_id}`);
    }
  };

  // 5) Render

  const hasBadge = newNotificationCount > 0 && !hideNotificationCounter;
  const badgeValue =
    newNotificationCount > 9 ? '9+' : newNotificationCount.toString();

  return (
    <div className="relative">
      {/* Botón campana */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        whileTap={{ scale: 0.92 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-zinc-900/80 border border-white/10 shadow-lg shadow-black/40 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
      >
        <Bell className="w-7 h-7 text-zinc-100" />
        {hasBadge && (
          <>
            {/* Glow */}
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500/60 blur-[3px] animate-pulse" />
            {/* Contador */}
            <span className="absolute -top-0.5 -right-0.5 min-w-[28px] px-2 h-7 flex items-center justify-center rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 text-[10px] font-semibold text-white shadow-md">
              {badgeValue}
            </span>
          </>
        )}
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="notifications-panel"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-[20rem] sm:w-[36rem] z-50"
          >
            <div className="rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl shadow-[0_18px_45px_rgba(0,0,0,0.65)] overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    Notificaciones
                  </span>
                  <span className="text-xs text-zinc-300">
                    {notifications.length > 0
                      ? `${notifications.length} registradas`
                      : 'Sin notificaciones nuevas'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => fetchNotifications()}
                  className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-300 hover:border-orange-400 hover:text-orange-200 transition"
                >
                  Actualizar
                </button>
              </div>

              {/* Contenido */}
              <div className="max-h-[34rem] overflow-y-auto">
                {loading && (
                  <div className="px-6 py-6 space-y-4">
                    <div className="h-4 w-40 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-4 w-56 bg-zinc-800 rounded-full animate-pulse" />
                    <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                )}

                {!loading && error && (
                  <div className="px-4 py-4 text-xs text-red-400 bg-red-950/40">
                    {error}
                  </div>
                )}

                {!loading && !error && notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-xs text-zinc-400">
                    <div className="mb-2 text-xl">🕊️</div>
                    No tenés notificaciones por ahora.
                  </div>
                )}

                {!loading &&
                  !error &&
                  notifications.length > 0 &&
                  notifications.map((n) => {
                    const isUnread = n.leido === 0;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          handleRedirect(n);
                          handleNotificationClick(n);
                        }}
                        className={`w-full text-left p-6 sm:p-7 border-b border-white/5 last:border-0 group transition-colors ${
                          isUnread
                            ? 'bg-gradient-to-r from-orange-500/14 via-red-500/10 to-amber-400/8 hover:from-orange-500/20 hover:via-red-500/16 hover:to-amber-400/12'
                            : 'bg-zinc-950/80 hover:bg-zinc-900/90'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Indicador lateral */}
                          <div
                            className={`mt-1 w-1 rounded-full ${
                              isUnread
                                ? 'h-12 bg-gradient-to-b from-orange-400 via-red-400 to-amber-300 shadow-[0_0_14px_rgba(249,115,22,0.85)]'
                                : 'h-8 bg-zinc-600'
                            }`}
                          />
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-zinc-100">
                              {n.title}
                            </p>
                            {n.message && (
                              <p className="mt-1 text-[11px] text-zinc-300 leading-snug">
                                {n.message}
                              </p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-zinc-500">
                                {n.created_at &&
                                  format(
                                    new Date(n.created_at),
                                    'dd/MM/yyyy HH:mm'
                                  )}
                              </span>
                              {isUnread && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/40">
                                  Nueva
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
