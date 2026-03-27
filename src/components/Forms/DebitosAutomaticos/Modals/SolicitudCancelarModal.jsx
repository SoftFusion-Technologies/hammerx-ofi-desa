import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Ban,
  CalendarDays,
  CreditCard,
  Landmark,
  Loader2,
  MessageSquareText,
  ShieldX,
  X
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal para cancelar solicitudes de débito automático.
 * Permite dejar observaciones internas opcionales y
 * cambia el estado de la solicitud a CANCELADA.
 *
 * Tema: Cancelación de solicitudes - Débitos Automáticos
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
    transition: { duration: 0.22, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    transition: { duration: 0.18, ease: 'easeInOut' }
  }
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

const emptyForm = {
  observaciones_internas: ''
};

export default function SolicitudCancelarModal({
  open,
  solicitud,
  onClose,
  onCancelled,
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
      setErrorMsg('No se encontró la solicitud a cancelar.');
      return;
    }

    try {
      setLoadingSubmit(true);
      setErrorMsg('');

      const payload = {
        observaciones_internas: form.observaciones_internas?.trim() || undefined
      };

      const response = await axios.put(
        `${apiBaseUrl}/debitos-automaticos-solicitudes/${solicitud.id}/cancelar`,
        payload
      );

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud cancelada',
        text: 'La solicitud fue cancelada correctamente.',
        confirmButtonColor: '#ea580c'
      });

      onCancelled?.(response.data);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.mensajeError ||
        'No se pudo cancelar la solicitud.';

      setErrorMsg(message);

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo cancelar',
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
        className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5"
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
          className="relative z-[121] w-full max-w-3xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-[0_30px_90px_-32px_rgba(15,23,42,0.45)]"
        >
          <div className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-5 py-5 sm:px-6">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-orange-200/25 blur-2xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 shadow-sm">
                  <ShieldX className="h-3.5 w-3.5" />
                  Cancelar solicitud
                </div>

                <h3 className="text-xl font-black tracking-[-0.03em] text-slate-900 sm:text-2xl">
                  Confirmar cancelación de adhesión
                </h3>

                <p className="mt-1 max-w-2xl text-sm text-slate-600">
                  Esta acción corta la solicitud sin aprobarla ni rechazarla
                  formalmente.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loadingSubmit}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-amber-200 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="max-h-[85vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
              <div className="space-y-4">
                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Ban className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-700">
                      Resumen de la solicitud
                    </h4>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoChip
                      icon={Ban}
                      label="Titular"
                      value={solicitud?.titular_nombre || '—'}
                    />
                    <InfoChip
                      icon={Ban}
                      label="DNI"
                      value={solicitud?.titular_dni || '—'}
                    />
                    <InfoChip
                      icon={CreditCard}
                      label="Plan"
                      value={buildPlanLabel(solicitud)}
                    />
                    <InfoChip
                      icon={Landmark}
                      label="Banco"
                      value={solicitud?.banco?.nombre || '—'}
                    />
                    <InfoChip
                      icon={CreditCard}
                      label="Tarjeta"
                      value={buildTarjetaLabel(solicitud)}
                    />
                    <InfoChip
                      icon={CalendarDays}
                      label="Alta original"
                      value={formatDateAR(solicitud?.created_at)}
                    />
                  </div>

                  {solicitud?.adicional && (
                    <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/70 p-3">
                      <div className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
                        Adicional detectado
                      </div>
                      <div className="text-sm font-semibold text-slate-800">
                        {solicitud.adicional.nombre} · DNI{' '}
                        {solicitud.adicional.dni}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        Plan:{' '}
                        {solicitud?.adicional?.plan?.nombre ||
                          solicitud?.adicional?.plan_id ||
                          '—'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[26px] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    <div className="text-sm font-extrabold uppercase tracking-[0.14em]">
                      Impacto de la acción
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-700">
                    <div className="rounded-2xl border border-white bg-white/90 px-3 py-2">
                      La solicitud no pasará a clientes adheridos.
                    </div>
                    <div className="rounded-2xl border border-white bg-white/90 px-3 py-2">
                      No se generarán períodos mensuales ni adicional operativo.
                    </div>
                    <div className="rounded-2xl border border-white bg-white/90 px-3 py-2">
                      La cancelación quedará registrada para auditoría interna.
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquareText className="h-4 w-4 text-amber-600" />
                    <h4 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-700">
                      Datos de cancelación
                    </h4>
                  </div>

                  <FieldGroup
                    label="Observaciones internas"
                    helper="Opcional. Se anexarán al historial interno de la solicitud."
                    icon={MessageSquareText}
                  >
                    <textarea
                      rows={6}
                      value={form.observaciones_internas}
                      onChange={(e) =>
                        handleChange('observaciones_internas', e.target.value)
                      }
                      disabled={loadingSubmit}
                      placeholder="Ej: el cliente desistió, se pospone la adhesión, se cargó por error..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldGroup>
                </div>

                <div className="rounded-[26px] border border-slate-200 bg-slate-50/70 p-4 shadow-sm">
                  <div className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-600">
                    Confirmación
                  </div>

                  <PreviewBox
                    label="Observación"
                    value={
                      form.observaciones_internas?.trim() ||
                      'Sin observación interna'
                    }
                  />

                  {errorMsg && (
                    <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loadingSubmit}
                    className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Volver
                  </button>

                  <button
                    type="submit"
                    disabled={loadingSubmit}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-amber-500 bg-amber-500 px-5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-amber-600 disabled:cursor-not-allowed disabled:border-amber-300 disabled:bg-amber-300"
                  >
                    {loadingSubmit ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cancelando...
                      </>
                    ) : (
                      <>
                        <Ban className="h-4 w-4" />
                        Confirmar cancelación
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FieldGroup({ label, helper, icon: Icon, children }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <label className="text-sm font-bold text-slate-800">{label}</label>
      </div>
      {children}
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        {label}
      </div>
      <div className="text-sm font-semibold text-slate-800">{value || '—'}</div>
    </div>
  );
}

function PreviewBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white bg-white px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value || '—'}
      </div>
    </div>
  );
}
