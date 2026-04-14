import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  RotateCcw,
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
 * Modal para marcar un período en reintento dentro del módulo
 * de Débitos Automáticos. El período vuelve a pendiente y queda
 * identificado con acción requerida REINTENTO.
 *
 * Tema: Reintento de período - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 01/04/2026 - Modal específico para reencauzar un período a reintento dejando fecha y observación operativa */
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

/* Benjamin Orellana - 2026/04/10 - Resuelve la marca actual de la tarjeta desde el cliente relacionado al período. */
const resolveMarcaTarjeta = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.marca_tarjeta || 'VISA';
};

/* Benjamin Orellana - 2026/04/10 - Resuelve la máscara actual de la tarjeta desde el cliente relacionado al período. */
const resolveTarjetaMascara = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.tarjeta_mascara || '-';
};

const ModalPeriodoReintentar = ({ open, onClose, periodo, onSaved }) => {
  const [fechaResultado, setFechaResultado] = useState(todayInputValue());
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  /* Benjamin Orellana - 2026/04/10 - Estados para permitir actualización opcional de tarjeta durante el reintento. */
  const [actualizarTarjeta, setActualizarTarjeta] = useState(false);
  const [marcaTarjeta, setMarcaTarjeta] = useState('VISA');
  const [tarjetaNumero, setTarjetaNumero] = useState('');

  const row = periodo || {};

  useEffect(() => {
    if (!open) return;
    setFechaResultado(
      row?.fecha_resultado
        ? String(row.fecha_resultado).slice(0, 10)
        : todayInputValue()
    );
    setObservaciones(row?.observaciones || '');
    setSubmitting(false);
    setError('');
    setSuccessMsg('');

    /* Benjamin Orellana - 2026/04/10 - Inicializa la sección de cambio de tarjeta al abrir el modal de reintento. */
    setActualizarTarjeta(false);
    setMarcaTarjeta(resolveMarcaTarjeta(row));
    setTarjetaNumero('');
  }, [open, row?.fecha_resultado, row?.observaciones]);

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

    if (!observaciones.trim()) {
      setError('Debes ingresar una observación para el reintento.');
      return;
    }

    /* Benjamin Orellana - 2026/04/10 - Valida la nueva tarjeta cuando el usuario decide actualizarla en el reintento. */
    if (actualizarTarjeta) {
      const digits = String(tarjetaNumero || '').replace(/\D/g, '');

      if (!marcaTarjeta) {
        setError('Debes seleccionar la marca de la tarjeta.');
        return;
      }

      if (!digits) {
        setError('Debes ingresar el número de tarjeta.');
        return;
      }

      if (digits.length < 13 || digits.length > 19) {
        setError('El número de tarjeta no es válido.');
        return;
      }
    }
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      /* Benjamin Orellana - 2026/04/10 - Payload operativo para reintento con posibilidad de actualizar la tarjeta del cliente asociado. */
      const payload = {
        fecha_resultado: fechaResultado,
        observaciones: observaciones.trim(),
        actualizar_tarjeta: actualizarTarjeta
      };

      if (actualizarTarjeta) {
        payload.marca_tarjeta = marcaTarjeta;
        payload.tarjeta_numero = String(tarjetaNumero || '').replace(/\D/g, '');
      }

      const response = await api.put(
        `/debitos-automaticos-periodos/${row.id}/reintentar`,
        payload
      );

      const updatedRow = normalizeSingle(response.data) || {
        ...row,
        estado_cobro: 'PENDIENTE',
        accion_requerida: 'REINTENTO',
        fecha_resultado: fechaResultado,
        observaciones: observaciones.trim()
      };

      setSuccessMsg('Período enviado correctamente a reintento.');

      if (typeof onSaved === 'function') {
        onSaved(updatedRow);
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError ||
          'No se pudo marcar el período en reintento.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1540] flex items-center justify-center p-3 sm:p-5"
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-sky-500">
                  Enviar a reintento
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {resolveTitularNombre(row)}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    DNI {resolveTitularDni(row)}
                  </span>
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700">
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
                  <ShieldAlert className="h-4 w-4 text-sky-500" />
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

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-sky-600">
                      Contexto
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-sky-700">
                      El período volverá a pendiente y quedará identificado con
                      acción requerida de reintento.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-7">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-sky-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirmación de reintento
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                        rows={6}
                        placeholder="Ej.: se recibió nueva tarjeta, se reenviará en nuevo archivo, se validó con el cliente, etc."
                        className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                      />
                    </div>
                  </div>

                  {/* Benjamin Orellana - 2026/04/10 - Bloque opcional para actualizar la tarjeta del débito al enviar el período a reintento. */}
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                          Tarjeta del débito
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          Actual: {resolveTarjetaMascara(row)}
                        </p>
                      </div>

                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700">
                        <input
                          type="checkbox"
                          checked={actualizarTarjeta}
                          onChange={(e) =>
                            setActualizarTarjeta(e.target.checked)
                          }
                          disabled={submitting}
                          className="h-4 w-4 rounded border-slate-300 text-sky-500 focus:ring-sky-400"
                        />
                        Actualizar tarjeta
                      </label>
                    </div>

                    {actualizarTarjeta && (
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Marca
                          </label>
                          <select
                            value={marcaTarjeta}
                            onChange={(e) => setMarcaTarjeta(e.target.value)}
                            disabled={submitting}
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                          >
                            <option value="VISA">VISA</option>
                            <option value="MASTER">MASTER</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Número de tarjeta
                          </label>
                          <input
                            type="text"
                            value={tarjetaNumero}
                            onChange={(e) =>
                              setTarjetaNumero(
                                e.target.value.replace(/[^\d\s-]/g, '')
                              )
                            }
                            disabled={submitting}
                            placeholder="Ej.: 4509123412341955"
                            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    Esta acción dejará el período nuevamente en pendiente y lo
                    marcará como reintento para el siguiente paso operativo.
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Confirmar reintento
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

export default ModalPeriodoReintentar;
