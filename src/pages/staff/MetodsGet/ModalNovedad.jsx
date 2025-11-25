import React, { useEffect } from 'react';
import { useAuth } from '../../../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaInstagram, FaFacebook, FaWhatsapp, FaSitemap } from 'react-icons/fa';

// Helper: formatea el nombre del usuario para mostrarlo lindo
// - Si es email: toma la parte antes de @, saca números y capitaliza.
// - Si no es email: devuelve el texto tal cual.
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

const ModalNovedad = ({ isOpen, onClose, mensaje, obtenerNovedades }) => {
  const { userName } = useAuth();
  const displayName = formatUserDisplayName(userName);
  const greetingText = displayName ? `Hola, ${displayName}.` : 'Hola.';

  useEffect(() => {
    if (isOpen && typeof obtenerNovedades === 'function') {
      obtenerNovedades();
    }
  }, [isOpen, obtenerNovedades]);

  return (
    <AnimatePresence>
      {isOpen && (
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

          {/* Contenedor principal */}
          <motion.div
            className="relative w-full max-w-3xl"
            initial={{ y: 40, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Card glass */}
            <div className="relative overflow-hidden rounded-2xl bg-white/10 border border-white/15 shadow-2xl backdrop-blur-2xl text-white">
              {/* Halos decorativos */}
              <div
                className="pointer-events-none absolute -top-24 -left-16 h-52 w-52 rounded-full bg-[#fc4b08]/35 blur-3xl"
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-24 -right-10 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl"
                aria-hidden="true"
              />

              {/* HEADER */}
              <header className="relative flex items-start justify-between px-6 pt-5 pb-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-orange-200/70 mb-1">
                    Novedad del staff
                  </p>
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                    Detalle de la novedad
                  </h2>
                  <p className="mt-1 text-xs text-zinc-200/80">
                    {greetingText} Revisá la información importante para hoy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="ml-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/30 text-sm text-zinc-100 hover:bg-black/60 hover:scale-105 transition-transform"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </header>

              {/* CONTENIDO */}
              <section className="relative px-6 pb-4 pt-1">
                <div className="max-h-[60vh] overflow-y-auto pr-1 custom-scroll">
                  <div
                    className="text-sm leading-relaxed text-zinc-50/95 space-y-2"
                    dangerouslySetInnerHTML={{ __html: mensaje || '' }}
                  />
                </div>
              </section>

              {/* FOOTER */}
              <footer className="relative border-t border-white/10 px-6 pt-3 pb-2 flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-300/80 text-center sm:text-left">
                    Recordá revisar tus novedades diariamente para estar al día
                    ✨
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Pill SoftFusion (promo sutil) */}
                    <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-2.5 py-1">
                      <span className="text-[11px] text-orange-300/90">⚡</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-200/90">
                        SoftFusion
                      </span>
                    </div>

                    {/* Botón cerrar */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-xl bg-[#fc4b08] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-orange-500/40 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[#fc4b08] transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* TIRA DE ICONOS EN EL BORDE INFERIOR */}
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-3">
                  <a
                    href="https://www.instagram.com/softfusiontechnologies/"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 hover:scale-105 transition"
                    title="Instagram SoftFusion"
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaInstagram />
                    </span>
                  </a>

                  <a
                    href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=1LO5jCqT44zNgskQ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 hover:scale-105 transition"
                    title="Facebook SoftFusion"
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaFacebook />
                    </span>
                  </a>

                  <a
                    href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 hover:scale-105 transition"
                    title="WhatsApp SoftFusion"
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaWhatsapp />
                    </span>
                  </a>

                  <a
                    href="https://softfusion.com.ar/"
                    target="_blank"
                    rel="noreferrer"
                    className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/20 hover:bg-white/15 hover:scale-105 transition"
                    title="Web SoftFusion"
                  >
                    <span className="text-lg" aria-hidden="true">
                      <FaSitemap />
                    </span>
                  </a>
                </div>
              </footer>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalNovedad;
