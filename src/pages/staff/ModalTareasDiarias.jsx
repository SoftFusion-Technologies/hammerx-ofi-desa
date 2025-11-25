import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaRegTimesCircle,
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaSitemap
} from 'react-icons/fa';
import { useAuth } from '../../AuthContext';

// Helper para mostrar el nombre "lindo"
// - Si es email: toma antes del @, saca números y capitaliza.
// - Si no, devuelve como viene.
const formatUserDisplayName = (rawName) => {
  if (!rawName) return '';

  if (rawName.includes('@')) {
    const beforeAt = rawName.split('@')[0] || '';
    const withoutDigits = beforeAt.replace(/\d+/g, '');
    if (!withoutDigits) return '';
    const lower = withoutDigits.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  return rawName;
};

const ModalTareasDiarias = ({ onClose, userId, userName }) => {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const { userLevel } = useAuth();
  const nivel = String(userLevel || '').toLowerCase();
  const isAdmin = nivel === 'admin';

  const displayUserName = formatUserDisplayName(userName);

  useEffect(() => {
    if (!userId) return;
    fetchTareas();
    // eslint-disable-next-line
  }, [userId]);

  const fetchTareas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/user-daily-tasks/user/${userId}`
      );
      setTareas(res.data || []);
    } catch (error) {
      console.error('Error al obtener tareas del usuario:', error);
      setTareas([]);
    } finally {
      setLoading(false);
    }
  };

  function stripHtmlTags(html) {
    return html ? html.replace(/<[^>]*>?/gm, '') : '';
  }

  // 👉 Si es admin, NO mostrar la modal
  if (isAdmin) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay + blur */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/75 to-slate-950/85 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* CONTENEDOR PRINCIPAL */}
        <motion.div
          className="relative w-full max-w-3xl"
          initial={{ y: 40, opacity: 0, scale: 0.94 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* CARD GLASS */}
          <div className="relative overflow-hidden rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-2xl text-white">
            {/* Halos decorativos */}
            <div
              className="pointer-events-none absolute -top-28 -left-16 h-56 w-56 rounded-full bg-[#fc4b08]/40 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-28 -right-10 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl"
              aria-hidden="true"
            />

            {/* HEADER */}
            <header className="relative px-6 pt-5 pb-3 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange-200/80 mb-1">
                  Tareas diarias
                </p>
                <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">
                  {displayUserName
                    ? `¡Bienvenido, ${displayUserName}!`
                    : '¡Bienvenido!'}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-zinc-200/85">
                  Estas son las tareas asignadas para hoy. Mantené tu flujo al
                  día. ⚡
                </p>
              </div>

              {/* BOTÓN CERRAR */}
              <button
                aria-label="Cerrar"
                onClick={onClose}
                className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/30 text-xl text-zinc-100 hover:bg-black/60 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#fc4b08]"
              >
                <FaRegTimesCircle />
              </button>
            </header>

            {/* CONTENIDO */}
            <section className="relative px-6 pb-4 pt-1">
              {loading ? (
                <div className="flex items-center justify-center py-10 text-zinc-200 text-sm sm:text-base animate-pulse">
                  Cargando tus tareas del día...
                </div>
              ) : tareas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-200 text-sm sm:text-base">
                  <span className="text-3xl mb-2">🎉</span>
                  <p>
                    Hoy no tenés tareas asignadas. ¡Aprovechá para adelantar
                    otras cosas!
                  </p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
                  <ul className="flex flex-col gap-3">
                    {tareas.map((item, index) => (
                      <li
                        key={item.daily_task_id}
                        className="relative rounded-2xl border border-white/15 bg-black/30 px-4 py-3 sm:px-5 sm:py-4 shadow-sm hover:shadow-orange-500/20 transition group overflow-hidden"
                      >
                        {/* Borde lateral */}
                        <div className="absolute inset-y-2 left-1 w-1 rounded-full bg-gradient-to-b from-orange-400 via-amber-300 to-orange-500 opacity-90" />

                        <div className="ml-4 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200/90">
                              Tarea #{index + 1}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-zinc-100/90">
                              Hoy
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                            {item.daily_task?.titulo}
                          </h3>

                          <p className="text-xs sm:text-sm text-zinc-100/90 mt-1 leading-relaxed">
                            {stripHtmlTags(item.daily_task?.descripcion)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* FOOTER */}
            <footer className="relative border-t border-white/10 px-6 pt-3 pb-2 flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[11px] text-zinc-200/85 text-center sm:text-left">
                  Organizá tu día, completá tus tareas y mantené al equipo
                  alineado ✨
                </span>

                <div className="flex items-center gap-2">
                  {/* SoftFusion pill */}
                  <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1">
                    <span className="text-[11px] text-orange-300/90">⚡</span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-200/90">
                      SoftFusion
                    </span>
                    <span className="text-[10px] text-zinc-200/85">
                      Task Suite
                    </span>
                  </div>

                  <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.04 }}
                    className="px-5 py-2 bg-gradient-to-tr from-orange-500 to-orange-700 text-white rounded-full font-semibold shadow-md shadow-orange-500/40 hover:shadow-lg transition-all duration-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-orange-500"
                  >
                    Cerrar
                  </motion.button>
                </div>
              </div>

              {/* REDES SOFTFUSION · ICONOS INFERIORES */}
              <motion.div
                className="mt-2 pt-2 border-t border-white/10 flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                {/* Llamador sutil */}
                <div className="flex items-center gap-2 text-[10px] text-zinc-200/80">
                  <motion.span
                    className="h-2 w-2 rounded-full bg-[#fc4b08] shadow-[0_0_10px_rgba(252,75,8,0.7)]"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  />
                  <span className="uppercase tracking-[0.16em]">
                    Seguinos en redes SoftFusion
                  </span>
                </div>

                {/* Íconos */}
                <div className="flex items-center justify-center gap-3">
                  <motion.a
                    href="https://www.instagram.com/softfusiontechnologies/"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 transition"
                    title="Instagram SoftFusion"
                    whileHover={{ scale: 1.15, rotate: 4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaInstagram />
                    </span>
                  </motion.a>

                  <motion.a
                    href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=1LO5jCqT44zNgskQ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 transition"
                    title="Facebook SoftFusion"
                    whileHover={{ scale: 1.15, rotate: -4 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaFacebook />
                    </span>
                  </motion.a>

                  <motion.a
                    href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 transition"
                    title="WhatsApp SoftFusion"
                    whileHover={{ scale: 1.15, rotate: 3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaWhatsapp />
                    </span>
                  </motion.a>

                  <motion.a
                    href="https://softfusion.com.ar/"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 transition"
                    title="Web SoftFusion"
                    whileHover={{ scale: 1.15, rotate: -3 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaSitemap />
                    </span>
                  </motion.a>
                </div>
              </motion.div>
            </footer>
          </div>
        </motion.div>

        {/* SCROLLBAR personalizada (si querés movelo a un CSS global) */}
        <style>
          {`
            .custom-scroll::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scroll::-webkit-scrollbar-thumb {
              background: #f97316;
              border-radius: 999px;
            }
            .custom-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
          `}
        </style>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalTareasDiarias;
