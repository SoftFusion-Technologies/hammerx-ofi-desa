// SimpleModal.jsx
import { motion, AnimatePresence } from 'framer-motion';

export default function SimpleModal({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[99] flex items-center justify-center bg-gradient-to-br from-[#07031aee] to-[#180933dd] backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative rounded-3xl p-0 shadow-2xl"
            initial={{ scale: 0.82, opacity: 0.7, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 170, damping: 16 }}
          >
            <div
              className="relative bg-white border-[1.5px] border-white/40 shadow-xl rounded-3xl p-7 min-w-[320px] max-w-[90vw] flex flex-col items-center
                before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-[#6a29ff15] before:to-[#e03cff24] before:blur-[4px] before:z-[-1]
                after:absolute after:inset-0 after:rounded-3xl after:ring-2 after:ring-[#c87cff80] after:blur-[4px] after:z-[-2]
              "
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-10 text-white/70 hover:text-white text-2xl transition-all"
                aria-label="Cerrar modal"
              >
                ×
              </button>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
