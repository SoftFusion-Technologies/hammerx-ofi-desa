import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  CreditCard,
  Loader2,
  CalendarDays,
  FileText,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 01 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal para marcar un período con acción requerida de cambio de tarjeta
 * dentro del módulo de Débitos Automáticos. El período permanece pendiente
 * y se registra motivo predefinido más observaciones internas.
 *
 * Tema: Cambio de tarjeta - Períodos
 * Capa: Frontend
 */

/* Benjamin Orellana - 01/04/2026 - Modal específico para dejar un período pendiente por cambio de tarjeta con motivo predefinido y recordatorio operativo */
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
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    transition: { duration: 0.18 }
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

const normalizeSingle = (payload) => {
  if (!payload) return null;
  if (payload?.row && !Array.isArray(payload.row)) return payload.row;
  if (payload?.data?.row && !Array.isArray(payload.data.row))
    return payload.data.row;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.item && !Array.isArray(payload.item)) return payload.item;
  return payload;
};

const todayInputValue = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatCurrency = (value, currency = 'ARS') => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    maximumFractionDigits: 0
  }).format(n);
};

const formatMonthLabel = (year, month) => {
  if (!year || !month) return '-';
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(d);
};

const resolveCliente = (periodo) => periodo?.cliente || null;

const resolveTitularNombre = (periodo) => {
  const cliente = resolveCliente(periodo);
  return (
    periodo?.titular_nombre || cliente?.titular_nombre || cliente?.nombre || '-'
  );
};

const resolveTitularDni = (periodo) => {
  const cliente = resolveCliente(periodo);
  return periodo?.titular_dni || cliente?.titular_dni || '-';
};

const resolveMoneda = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.moneda || 'ARS';
};

const resolveMontoBruto = (periodo) => {
  const cliente = resolveCliente(periodo);
  return periodo?.monto_bruto ?? cliente?.monto_base_vigente ?? null;
};

const motivoOptions = [
  {
    value: 'MAL_NUMERO_TARJETA',
    label: 'Mal número de tarjeta'
  },
  {
    value: 'TIPO_TARJETA_ERRONEO',
    label: 'Archivo enviado con tipo de tarjeta erróneo'
  },
  {
    value: 'TARJETA_DEBITO',
    label: 'Tarjeta de débito'
  },
  {
    value: 'SIN_MARGEN',
    label: 'Tarjeta sin margen'
  },
  {
    value: 'INHABILITADA',
    label: 'Tarjeta inhabilitada'
  }
];

const ModalPeriodoCambioTarjeta = ({ open, onClose, periodo, onSaved }) => {
  const [fechaResultado, setFechaResultado] = useState(todayInputValue());
  const [motivoCodigo, setMotivoCodigo] = useState('MAL_NUMERO_TARJETA');
  const [motivoDetalle, setMotivoDetalle] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const row = periodo || {};

  useEffect(() => {
    if (!open) return;
    setFechaResultado(
      row?.fecha_resultado
        ? String(row.fecha_resultado).slice(0, 10)
        : todayInputValue()
    );
    setMotivoCodigo(row?.motivo_codigo || 'MAL_NUMERO_TARJETA');
    setMotivoDetalle(row?.motivo_detalle || '');
    setObservaciones(row?.observaciones || '');
    setSubmitting(false);
    setError('');
    setSuccessMsg('');
  }, [
    open,
    row?.fecha_resultado,
    row?.motivo_codigo,
    row?.motivo_detalle,
    row?.observaciones
  ]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!row?.id) {
      setError('Período inválido.');
      return;
    }

    if (!fechaResultado) {
      setError('Debes ingresar la fecha de resultado.');
      return;
    }

    if (!motivoCodigo) {
      setError('Debes seleccionar un motivo.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      /* Benjamin Orellana - 01/04/2026 - Payload operativo para dejar el período pendiente por cambio de tarjeta con motivo y observaciones */
      const payload = {
        fecha_resultado: fechaResultado,
        motivo_codigo: motivoCodigo,
        motivo_detalle: motivoDetalle.trim() || null,
        observaciones: observaciones.trim() || null
      };

      const response = await api.put(
        `/debitos-automaticos-periodos/${row.id}/intentar-cambio-tarjeta`,
        payload
      );

      const updatedRow = normalizeSingle(response.data) || {
        ...row,
        estado_cobro: 'PENDIENTE',
        accion_requerida: 'CAMBIO_TARJETA',
        fecha_resultado: fechaResultado,
        motivo_codigo: motivoCodigo,
        motivo_detalle: motivoDetalle.trim() || null,
        observaciones: observaciones.trim() || null
      };

      setSuccessMsg('Período marcado correctamente para cambio de tarjeta.');

      if (typeof onSaved === 'function') {
        onSaved(updatedRow);
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError ||
          'No se pudo dejar el período pendiente por cambio de tarjeta.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1520] flex items-center justify-center p-3 sm:p-5"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-500">
                  Esperando cambio de tarjeta
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {resolveTitularNombre(row)}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    DNI {resolveTitularDni(row)}
                  </span>
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
                    {formatMonthLabel(
                      Number(row?.periodo_anio),
                      Number(row?.periodo_mes)
                    )}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-5">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Resumen del período
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Cliente
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {resolveTitularNombre(row)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Período
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatMonthLabel(
                        Number(row?.periodo_anio),
                        Number(row?.periodo_mes)
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Monto bruto
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatCurrency(
                        resolveMontoBruto(row),
                        resolveMoneda(row)
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-amber-600">
                      Recordatorio
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-amber-700">
                      Recordá cambiar la fecha de vencimiento del pendiente en
                      SocioPlus.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-7">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmación de cambio de tarjeta
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Fecha de resultado
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={fechaResultado}
                        onChange={(e) => setFechaResultado(e.target.value)}
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Motivo
                    </label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={motivoCodigo}
                        onChange={(e) => setMotivoCodigo(e.target.value)}
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:bg-slate-50"
                      >
                        {motivoOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Detalle del motivo
                    </label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-slate-400" />
                      <textarea
                        value={motivoDetalle}
                        onChange={(e) => setMotivoDetalle(e.target.value)}
                        disabled={submitting}
                        rows={4}
                        placeholder="Detalle opcional para ampliar el motivo..."
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Observaciones internas
                    </label>
                    <div className="relative">
                      <FileText className="pointer-events-none absolute left-3 top-4 h-4 w-4 text-slate-400" />
                      <textarea
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        disabled={submitting}
                        rows={4}
                        placeholder="Observación adicional interna..."
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    Esta acción dejará el período en pendiente y registrará que
                    la acción requerida es cambio de tarjeta.
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {successMsg && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      {successMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Confirmar cambio de tarjeta
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalPeriodoCambioTarjeta;
