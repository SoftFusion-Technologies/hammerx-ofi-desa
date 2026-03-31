import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";

function ModalObservacionPreventa({
  isOpen,
  onClose,
  observacion,
  clienteNombre,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-5 py-4">
            <div className="min-w-0">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-800 sm:text-base">
                Observacion del cliente
              </h3>
              <p className="truncate text-xs text-zinc-500">
                {clienteNombre || "Sin cliente"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
              aria-label="Cerrar modal de observacion"
            >
              <FaTimes size={14} />
            </button>
          </div>

          <div className="max-h-[70vh] overflow-auto bg-zinc-50 px-5 py-4">
            <p className="whitespace-pre-wrap break-words rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-700">
              {observacion || "Sin observacion"}
            </p>
          </div>

          <div className="flex justify-end border-t border-zinc-200 px-5 py-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#fc4b08] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#df4308]"
            >
              Cerrar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ModalObservacionPreventa;
