import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AgendaDeHoyModal({ open, onClose, userId, level }) {
  const [items, setItems] = useState(null); // null = loading
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    setItems(null);
    try {
      const qs = new URLSearchParams({
        level: level === 'admin' ? 'admin' : 'vendedor',
        ...(level !== 'admin' ? { usuario_id: String(userId) } : {}),
        with_prospect: '1'
      });
      const r = await fetch(
        `http://localhost:8080/ventas/agenda/hoy?${qs.toString()}`
      );
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } catch (e) {
      setError('No se pudo cargar la agenda.');
      setItems([]);
    }
  }, [userId, level]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const marcarDone = async (id) => {
    const prev = items;
    setItems((arr) => arr.filter((i) => i.id !== id));
    try {
      await fetch(`http://localhost:8080/ventas/agenda/${id}/done`, {
        method: 'PATCH'
      });
    } catch {
      setItems(prev);
      alert('No se pudo marcar como realizado');
    }
  };

  const onlyDigits = (s = '') => s.replace(/\D/g, '');
  const waURL = (telefono, nombre) => {
    const msg = `Hola ${
      nombre || ''
    } ¿Cómo te fue ayer en la clase de prueba?`;
    return `https://wa.me/${onlyDigits(telefono)}?text=${encodeURIComponent(
      msg
    )}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop con blur y gradiente */}
          <motion.div
            className="fixed inset-0 z-[90] bg-gradient-to-b from-black/70 to-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            className="fixed z-[91] inset-0 flex items-start md:items-center justify-center p-4"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header sticky */}
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
                <div className="flex items-center justify-between px-5 py-4">
                  <h3 className="font-bignoodle text-2xl md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 tracking-tight">
                    Agenda de hoy — Ventas
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-sm md:text-base font-extrabold px-3 py-1 shadow">
                      ¡{Array.isArray(items) ? items.length : 0}!
                    </span>
                    <button
                      onClick={onClose}
                      className="rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 active:scale-95 transition"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="max-h-[70vh] overflow-y-auto p-4">
                {/* Skeletons */}
                {items === null && !error && (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-xl border border-orange-100 bg-orange-50/40 p-4"
                      >
                        <div className="h-4 w-1/3 rounded bg-orange-200/70 mb-2" />
                        <div className="h-3 w-1/2 rounded bg-orange-200/50 mb-3" />
                        <div className="h-10 w-full rounded bg-orange-100/60" />
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl">
                    {error}
                  </div>
                )}

                {Array.isArray(items) && items.length === 0 && !error && (
                  <div className="p-6 text-center text-sm text-gray-600">
                    <div className="text-2xl mb-1">✅</div>
                    No hay seguimientos pendientes hoy.
                  </div>
                )}

                {/* Lista */}
                {Array.isArray(items) && items.length > 0 && (
                  <motion.div layout className="space-y-3">
                    {items.map((it) => (
                      <motion.div
                        key={it.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        className="group rounded-xl border border-orange-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-orange-500 mt-1" />
                              <div className="text-sm md:text-base font-semibold text-gray-800 truncate">
                                {it.prospecto?.nombre ??
                                  `Prospecto #${it.prospecto_id}`}
                              </div>
                            </div>

                            <div className="mt-1 text-xs text-gray-600">
                              Clase #{it.clase_num} •{' '}
                              {it.prospecto?.actividad || '—'} •{' '}
                              {it.prospecto?.sede || '—'}
                            </div>

                            <div className="mt-2 text-sm text-gray-800">
                              {it.mensaje}
                            </div>

                            {/* Acciones rápidas */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              {it.prospecto?.contacto && (
                                <>
                                  <a
                                    href={waURL(
                                      it.prospecto.contacto,
                                      it.prospecto?.nombre
                                    )}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-500/90 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 transition"
                                    title="Abrir WhatsApp"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.66 0 .5 5.16.5 11.56c0 2.04.54 4.02 1.57 5.78L0 24l6.85-1.98a11.5 11.5 0 0 0 5.21 1.3h.01c6.4 0 11.56-5.16 11.56-11.56 0-3.09-1.2-5.99-3.61-8.28ZM12.06 21.3h-.01a9.7 9.7 0 0 1-4.94-1.35l-.35-.2-4.06 1.18 1.16-3.96-.23-.37a9.74 9.74 0 0 1-1.5-5.04C2.13 6.2 6.76 1.57 12.06 1.57c2.6 0 5.04 1.01 6.87 2.85 1.82 1.82 2.83 4.26 2.83 6.86 0 5.3-4.63 9.99-9.7 9.99Zm5.63-7.28c-.31-.16-1.86-.91-2.15-1.02-.29-.11-.5-.16-.72.16-.22.31-.83 1.02-1.02 1.24-.19.22-.38.24-.7.08-.31-.16-1.34-.49-2.55-1.55-.94-.84-1.58-1.88-1.77-2.2-.19-.31-.02-.48.14-.64.15-.15.31-.38.47-.57.16-.19.21-.32.31-.53.1-.22.05-.41-.03-.57-.08-.16-.72-1.73-.98-2.36-.26-.62-.53-.54-.72-.55h-.62c-.19 0-.5.07-.76.35-.26.27-1 1-.97 2.43.03 1.43 1.02 2.81 1.17 3.01.16.19 2 3.05 4.85 4.28.68.29 1.2.46 1.61.59.68.22 1.29.19 1.78.12.54-.08 1.86-.76 2.12-1.49.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z" />
                                    </svg>
                                    WhatsApp
                                  </a>
                                  <button
                                    onClick={() =>
                                      navigator.clipboard?.writeText(
                                        onlyDigits(it.prospecto.contacto)
                                      )
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 transition"
                                    title="Copiar teléfono"
                                  >
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="currentColor"
                                    >
                                      <path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                    </svg>
                                    Copiar
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex-shrink-0">
                            <button
                              onClick={() => marcarDone(it.id)}
                              className="rounded-xl bg-[#fc4b08] px-4 py-2 text-sm md:text-[15px] font-bold text-white shadow hover:shadow-md hover:bg-[#e0480b] active:scale-95 transition"
                            >
                              Marcar realizado
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Footer sticky */}
              <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t px-5 py-3 flex justify-end gap-2">
                <button
                  onClick={load}
                  className="rounded-lg bg-orange-100 hover:bg-orange-200 px-3 py-1.5 text-sm font-semibold text-orange-700 active:scale-95 transition"
                >
                  Refrescar
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 active:scale-95 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
