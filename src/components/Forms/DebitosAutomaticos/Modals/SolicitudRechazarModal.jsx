import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeX,
  CalendarDays,
  CreditCard,
  Landmark,
  Loader2,
  MessageSquareText,
  ShieldAlert,
  User2,
  X
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 03 / 2026
 * Versión: 3.0
 *
 * Descripción:
 * Rediseño minimalista y responsive del modal para rechazar solicitudes
 * de débito automático. Se prioriza una UX limpia, menos cargada y con
 * foco en lo esencial: contexto breve + motivo + observación opcional.
 *
 * Tema: Rechazo de solicitudes - Débitos Automáticos
 * Capa: Frontend
 */

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: 14,
    scale: 0.985,
    transition: { duration: 0.16, ease: 'easeInOut' }
  }
};

const emptyForm = {
  motivo_rechazo: '',
  observaciones_internas: ''
};

const formatDateAR = (value) => {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const buildPlanLabel = (solicitud) => {
  if (!solicitud) return '—';
  if (solicitud?.plan_titular?.nombre) return solicitud.plan_titular.nombre;
  if (solicitud?.adicional?.plan?.nombre)
    return solicitud.adicional.plan.nombre;
  return '—';
};

const buildTarjetaLabel = (solicitud) => {
  const marca = solicitud?.marca_tarjeta || '—';
  const mascara =
    solicitud?.tarjeta_numero_completo ||
    solicitud?.tarjeta_mascara ||
    solicitud?.tarjeta_ultimos4 ||
    '—';

  return `${marca} · ${mascara}`;
};

export default function SolicitudRechazarModal({
  open,
  solicitud,
  onClose,
  onRejected,
  apiBaseUrl = 'http://localhost:8080'
}) {
  const [form, setForm] = useState(emptyForm);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open || !solicitud) return;
    setForm(emptyForm);
    setErrorMsg('');
  }, [open, solicitud]);

  const canSubmit = useMemo(() => {
    return Boolean(form.motivo_rechazo?.trim()) && !loadingSubmit;
  }, [form.motivo_rechazo, loadingSubmit]);

  const summaryItems = useMemo(() => {
    if (!solicitud) return [];

    return [
      {
        icon: User2,
        label: 'Titular',
        value: solicitud?.titular_nombre || '—'
      },
      {
        icon: BadgeX,
        label: 'DNI',
        value: solicitud?.titular_dni || '—'
      },
      {
        icon: CreditCard,
        label: 'Plan',
        value: buildPlanLabel(solicitud)
      },
      {
        icon: Landmark,
        label: 'Banco',
        value: solicitud?.banco?.nombre || '—'
      },
      {
        icon: CreditCard,
        label: 'Tarjeta',
        value: buildTarjetaLabel(solicitud)
      },
      {
        icon: CalendarDays,
        label: 'Alta',
        value: formatDateAR(solicitud?.created_at)
      }
    ];
  }, [solicitud]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errorMsg) setErrorMsg('');
  };

  const handleClose = () => {
    if (loadingSubmit) return;
    setErrorMsg('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!solicitud?.id) {
      setErrorMsg('No se encontró la solicitud a rechazar.');
      return;
    }

    const motivo = form.motivo_rechazo?.trim();

    if (!motivo) {
      setErrorMsg('El motivo de rechazo es obligatorio.');
      return;
    }

    try {
      setLoadingSubmit(true);
      setErrorMsg('');

      const payload = {
        motivo_rechazo: motivo,
        observaciones_internas: form.observaciones_internas?.trim() || undefined
      };

      const response = await axios.put(
        `${apiBaseUrl}/debitos-automaticos-solicitudes/${solicitud.id}/rechazar`,
        payload
      );

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud rechazada',
        text: 'La solicitud fue rechazada correctamente.',
        confirmButtonColor: '#ea580c'
      });

      onRejected?.(response.data);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.mensajeError ||
        'No se pudo rechazar la solicitud.';

      setErrorMsg(message);

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo rechazar',
        text: message,
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!open || !solicitud) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          type="button"
          aria-label="Cerrar modal"
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
          onClick={handleClose}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-[121] flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/15 bg-white shadow-[0_28px_80px_-28px_rgba(15,23,42,0.45)] sm:rounded-[30px]"
        >
          <div className="relative border-b border-rose-100 bg-gradient-to-r from-rose-50 via-white to-orange-50 px-4 py-4 sm:px-6 sm:py-5">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-rose-200/30 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Rechazar solicitud
                </div>

                <h3 className="font-bignoodle text-lg font-extrabold tracking-[-0.02em] text-slate-900 sm:text-3xl">
                  Confirmar rechazo
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loadingSubmit}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  Solicitud seleccionada
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {summaryItems.map((item) => (
                    <SummaryInline
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>

                {solicitud?.adicional && (
                  <div className="mt-3 rounded-2xl border border-rose-100 bg-white px-3 py-3 text-sm text-slate-700">
                    <span className="font-bold text-rose-700">Adicional:</span>{' '}
                    {solicitud.adicional.nombre || '—'} · DNI{' '}
                    {solicitud.adicional.dni || '—'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FieldBlock
                  label="Motivo de rechazo"
                  icon={AlertCircle}
                  required
                >
                  <textarea
                    rows={5}
                    value={form.motivo_rechazo}
                    onChange={(e) =>
                      handleChange('motivo_rechazo', e.target.value)
                    }
                    disabled={loadingSubmit}
                    placeholder="Ej: documentación incompleta, datos inconsistentes, solicitud inválida..."
                    className="w-full resize-y rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </FieldBlock>

                <FieldBlock
                  label="Observaciones internas"
                  icon={MessageSquareText}
                >
                  <textarea
                    rows={4}
                    value={form.observaciones_internas}
                    onChange={(e) =>
                      handleChange('observaciones_internas', e.target.value)
                    }
                    disabled={loadingSubmit}
                    placeholder="Opcional. Dejá contexto interno para seguimiento."
                    className="w-full resize-y rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </FieldBlock>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-3 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loadingSubmit}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-rose-600 bg-rose-600 px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:border-rose-300 disabled:bg-rose-300"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Rechazando...
                    </>
                  ) : (
                    <>
                      <BadgeX className="h-4 w-4" />
                      Confirmar rechazo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FieldBlock({ label, icon: Icon, required = false, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <label className="text-sm font-bold text-slate-800">{label}</label>

        {required ? (
          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-rose-700">
            Obligatorio
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function SummaryInline({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </div>
          <div className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}
