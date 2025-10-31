// imports (si ya los tenés, no dupliques)
import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ---------- Modal “Procesando…” ---------- */
export default function ProcessingModal({
  open,
  title = 'PROCESANDO...',
  subtitle = 'Espere por favor'
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ y: 12, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 12, scale: 0.98, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
            >
              <div className="p-6 text-center">
                {/* Spinner premium */}
                <div className="mx-auto mb-4 grid place-items-center">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-neutral-200" />
                    <div
                      className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
                      style={{
                        borderColor: '#fc4b08 transparent #fc4b08 transparent'
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-xl font-semibold tracking-tight text-[#fc4b08]">
                  {title}
                </h3>
                <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>

                <div className="mt-4 text-[11px] uppercase tracking-widest text-neutral-400">
                  IA en curso
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
