// IntroModal.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa';

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
    const t = setTimeout(() => onClose?.(), 2800); // 2.8s visible
    return () => clearTimeout(t);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
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
          >
            <div
              className="relative w-full max-w-md rounded-3xl p-[1px] ring-1 ring-white/10
                         bg-gradient-to-br from-white/10 via-white/0 to-white/10"
            >
              {/* halo de color (violeta/ámbar) */}
              <div
                className="pointer-events-none absolute -inset-1 -z-10 rounded-[28px] opacity-60 blur-2xl
                           bg-[conic-gradient(from_140deg,rgba(168,85,247,0.45),rgba(251,191,36,0.45),transparent_60%)]"
              />
              <div className="rounded-3xl bg-zinc-900/80 p-6 backdrop-blur-xl ring-1 ring-white/10">
                {/* badge */}
                <motion.div
                  variants={itemUp}
                  className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full
                             border border-white/10 bg-zinc-800/50 px-3 py-1 text-[11px] font-medium text-zinc-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                  Soft Fusion
                </motion.div>

                {/* título */}
                <motion.h3
                  variants={itemUp}
                  className="uppercase text-center text-xl font-semibold text-white md:text-2xl"
                >
                  Tecnología innovadora
                </motion.h3>

                {/* subtítulo */}
                <motion.p
                  variants={itemUp}
                  className="mt-2 text-center text-sm text-zinc-300"
                >
                  Diseñado y desarrollado por{' '}
                  <span className="font-medium text-pink-600">Soft Fusion</span>
                  .
                </motion.p>

                {/* rayito decorativo */}
                <motion.div variants={itemUp} className="mt-5">
                  <div className="h-[1px] w-full bg-gradient-to-r from-pink-500/40 via-amber-400/50 to-pink-500/40" />
                </motion.div>

                {/* barra de progreso (autocierre) */}
                <motion.div
                  variants={itemUp}
                  className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-400 to-amber-300"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2.2, ease: 'linear' }}
                  />
                </motion.div>

                {/* 🔹 Redes sociales Soft Fusion */}
                <motion.div
                  variants={itemUp}
                  className="mt-4 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-zinc-400">
                    Seguinos en nuestras redes:
                  </span>
                  <div className="flex items-center gap-3">
                    <a
                      href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-900/60 text-zinc-100 transition-all hover:border-sky-400 hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      <FaFacebookF className="text-xs" />
                    </a>
                    <a
                      href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-900/60 text-zinc-100 transition-all hover:border-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                    >
                      <FaWhatsapp className="text-sm" />
                    </a>
                    <a
                      href="https://www.instagram.com/softfusiontechnologies/"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-900/60 text-zinc-100 transition-all hover:border-fuchsia-400 hover:bg-fuchsia-500/20 hover:text-fuchsia-300"
                    >
                      <FaInstagram className="text-sm" />
                    </a>
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-zinc-900/60 text-zinc-100 transition-all hover:border-sky-400 hover:bg-sky-500/20 hover:text-sky-300"
                    >
                      <FaLinkedinIn className="text-xs" />
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
