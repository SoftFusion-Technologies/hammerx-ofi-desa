// IntroModal.jsx (white / luminous)
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

const ease = [0.16, 1, 0.3, 1];

const dropVariants = {
  hidden: { opacity: 0, y: -60, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease,
      when: 'beforeChildren',
      staggerChildren: 0.12
    }
  },
  exit: {
    opacity: 0,
    y: -70,
    scale: 0.98,
    transition: { duration: 0.45, ease }
  }
};

const itemUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } }
};

export default function IntroModal({ open, onClose }) {
  // autocerrar a los N ms
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 2800);
    return () => clearTimeout(t);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop claro (sin negro) */}
          <motion.div
            className="fixed inset-0 z-[90] bg-white backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          />

          {/* Dialog */}
          <motion.div
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
            variants={dropVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-labelledby="intro-title"
          >
            <div
              className="relative w-full max-w-md rounded-3xl p-[1px]
                         ring-1 ring-black/10
                         bg-gradient-to-br from-black/5 via-transparent to-black/5"
            >
              {/* halo de color (suave para blanco) */}
              <div
                className="pointer-events-none absolute -inset-1 -z-10 rounded-[28px] opacity-70 blur-2xl
                           [background:conic-gradient(from_140deg,rgba(236,72,153,0.22),rgba(251,191,36,0.22),transparent_60%)]"
              />

              {/* Card blanca luminosa */}
              <div className="rounded-3xl bg-white/40 p-6 backdrop-blur-xl ring-1 ring-black/10 shadow-[0_15px_60px_-20px_rgba(0,0,0,.25)]">
                {/* badge */}
                <motion.div
                  variants={itemUp}
                  className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full
                             border border-black/10 bg-black/5 px-3 py-1 text-[11px] font-medium text-zinc-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                  Soft Fusion
                </motion.div>

                {/* título */}
                <motion.h3
                  id="intro-title"
                  variants={itemUp}
                  className="uppercase text-center text-xl font-semibold text-zinc-900 md:text-2xl"
                >
                  Tecnología innovadora
                </motion.h3>

                {/* subtítulo */}
                <motion.p
                  variants={itemUp}
                  className="mt-2 text-center text-sm text-zinc-700"
                >
                  Diseñado y desarrollado por{' '}
                  <span className="font-semibold text-pink-600">
                    Soft Fusion
                  </span>
                  .
                </motion.p>

                {/* rayito decorativo */}
                <motion.div variants={itemUp} className="mt-5">
                  <div className="h-[1px] w-full bg-gradient-to-r from-pink-500/35 via-amber-400/45 to-pink-500/35" />
                </motion.div>

                {/* barra de progreso (autocierre) */}
                <motion.div
                  variants={itemUp}
                  className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-200"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-amber-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.2, ease: 'linear' }}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
