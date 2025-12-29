// DescripcionModal.jsx
import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function DescripcionModal({ open, onClose, title, html }) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Overlay */}
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Cerrar modal"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 12, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-4xl rounded-3xl border border-white/10
                       bg-white/[0.06] backdrop-blur-2xl
                       shadow-[0_30px_120px_rgba(0,0,0,0.55)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                  {title}
                </div>
                <div className="mt-1 text-sm text-white/80">Vista completa</div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-3 py-1 text-xs font-semibold
                           bg-white/10 text-white/80 ring-1 ring-white/10
                           hover:bg-white/15 hover:text-white transition"
              >
                Cerrar
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[70vh] overflow-auto">
              <div className="prose prose-invert max-w-none text-white/85 text-sm">
                <span dangerouslySetInnerHTML={{ __html: html || '' }} />
              </div>
            </div>

            {/* Footer SoftFusion */}
            <div className="flex items-center justify-center gap-2 px-5 py-3 border-t border-white/10">
              <div className="text-xs text-white/55">
                Sistema desarrollado por{' '}
                <span className="text-white/75 font-semibold">SoftFusion</span>{' '}
                · <span className="text-white/70">www.softfusion.com.ar</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
