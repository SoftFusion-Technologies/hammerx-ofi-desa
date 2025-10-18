// SuccessModal.jsx (light + orange)
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function SuccessModal({ open, onClose, name = '' }) {
  const closeBtnRef = useRef(null);

  // auto-focus y ESC para cerrar
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: neutro para no “lavar” el blanco */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Dialog */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Guardado correctamente"
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative w-full max-w-md rounded-3xl p-[1px]
                         ring-1 ring-zinc-200
                         bg-gradient-to-br from-white via-white to-white"
            >
              {/* Halo cálido sutil */}
              <div
                className="absolute -inset-1 -z-10 rounded-[28px] opacity-50 blur-2xl
                           [background:radial-gradient(60%_60%_at_50%_0%,rgba(251,146,60,0.28),transparent)]"
              />

              <div className="rounded-3xl bg-white p-6 backdrop-blur-xl ring-1 ring-zinc-200 shadow-[0_15px_60px_-20px_rgba(0,0,0,.25)]">
                {/* Icono check con halo */}
                <div className="mx-auto mb-4 grid place-items-center">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-orange-400/35 blur-2xl opacity-60" />
                    <svg
                      className="relative h-14 w-14 text-orange-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <circle cx="12" cy="12" r="9" className="opacity-70" />
                      <path
                        d="M8 12.5l2.2 2.2L16 9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                {/* Texto */}
                <h3 className="text-center text-xl font-semibold text-zinc-900">
                  ¡Listo{name ? `, ${name}` : ''}!
                </h3>
                <p className="mt-1 text-center text-sm text-zinc-600">
                  Guardamos tu información correctamente.
                </p>

                {/* CTA */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    ref={closeBtnRef}
                    onClick={onClose}
                    className="group relative inline-flex items-center justify-center rounded-2xl
                               bg-orange-600 px-5 py-2.5 text-sm font-medium text-white
                               shadow-[0_8px_30px_-10px_rgba(251,146,60,0.55)]
                               transition-all hover:bg-orange-500 hover:shadow-[0_12px_45px_-10px_rgba(251,146,60,0.75)]
                               focus:outline-none focus:ring-2 focus:ring-orange-500/60"
                  >
                    Continuar
                    <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
