/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 / 03 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Modal reutilizable para observar solicitudes de débito automático.
 * Muestra las observaciones internas existentes en modo lectura y permite
 * agregar una nueva observación sin duplicar el historial previo.
 *
 * Tema: Observación de solicitudes
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Loader2, MessageSquareText, X } from 'lucide-react';

export default function SolicitudObservarModal({
  open,
  onClose,
  solicitudId,
  solicitud,
  onSuccess,
  apiBaseUrl = ''
}) {
  const [observaciones, setObservaciones] = useState('');
  const [observacionesExistentes, setObservacionesExistentes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endpoint = useMemo(() => {
    if (!solicitudId) return null;

    const base = String(apiBaseUrl || '')
      .trim()
      .replace(/\/+$/, '');

    return base
      ? `${base}/debitos-automaticos-solicitudes/${solicitudId}/observar`
      : `/debitos-automaticos-solicitudes/${solicitudId}/observar`;
  }, [apiBaseUrl, solicitudId]);

  useEffect(() => {
    if (!open) {
      setObservaciones('');
      setObservacionesExistentes('');
      setError('');
      setIsSubmitting(false);
      return;
    }

    setObservaciones('');
    setError('');
    setObservacionesExistentes(
      String(solicitud?.observaciones_internas || '').trim()
    );

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSubmitting) {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, solicitud, isSubmitting, onClose]);

  const handleBackdropClick = () => {
    if (isSubmitting) return;
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const texto = String(observaciones || '').trim();

    if (!solicitudId) {
      setError('No se encontró el ID de la solicitud.');
      return;
    }

    if (!texto) {
      setError('Debes ingresar una nueva observación interna.');
      return;
    }

    if (!endpoint) {
      setError('No se pudo construir la URL para observar la solicitud.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await axios.put(endpoint, {
        observaciones_internas: texto
      });

      const registroActualizado = response?.data?.registroActualizado || null;

      if (onSuccess) {
        onSuccess(registroActualizado, response?.data);
      }

      setObservaciones('');
      onClose?.();
    } catch (err) {
      const backendMessage =
        err?.response?.data?.mensajeError ||
        err?.response?.data?.message ||
        err?.message ||
        'No se pudo observar la solicitud.';

      setError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={handleBackdropClick}
          />

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-[201] w-full max-w-xl rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_70px_-26px_rgba(15,23,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <MessageSquareText className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="font-bignoodle text-2xl font-bold tracking-tight text-slate-900">
                    Observar solicitud
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Agrega una nueva observación interna para dejar la solicitud
                    en estado observada.
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {!!solicitud?.id && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                        ID #{solicitud.id}
                      </span>
                    )}

                    {!!solicitud?.titular_nombre && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-700">
                        {solicitud.titular_nombre}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && onClose?.()}
                disabled={isSubmitting}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-5 sm:px-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Observaciones existentes
                  </label>

                  <div className="max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                    {observacionesExistentes ? (
                      <div className="whitespace-pre-wrap break-words">
                        {observacionesExistentes}
                      </div>
                    ) : (
                      <span className="text-slate-400">
                        Esta solicitud todavía no tiene observaciones internas.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-800">
                    Nueva observación
                  </label>

                  <textarea
                    value={observaciones}
                    onChange={(e) => {
                      setObservaciones(e.target.value);
                      if (error) setError('');
                    }}
                    rows={5}
                    maxLength={1500}
                    placeholder="Escribe aquí la nueva observación..."
                    className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    disabled={isSubmitting}
                  />

                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">
                      Se agregará al historial existente.
                    </span>

                    <span className="font-medium text-slate-400">
                      {String(observaciones || '').length}/1500
                    </span>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => !isSubmitting && onClose?.()}
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <MessageSquareText className="h-4 w-4" />
                      Guardar observación
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
