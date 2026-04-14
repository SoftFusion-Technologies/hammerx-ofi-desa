import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  PauseCircle,
  CheckCircle2,
  Lock,
  Clock3,
  Loader2
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal para actualizar el estado general operativo de un cliente adherido
 * dentro del módulo de Débitos Automáticos.
 *
 * Tema: Estado de cliente - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 31/03/2026 - Modal de cambio de estado general separado de la baja para mantener una UX clara y consistente con los endpoints del módulo */
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

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const getEstadoClasses = (estado) => {
  const map = {
    PENDIENTE_INICIO: 'bg-amber-50 text-amber-700 border border-amber-200',
    ACTIVO: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    PAUSADO: 'bg-slate-100 text-slate-700 border border-slate-200',
    BLOQUEADO: 'bg-rose-50 text-rose-700 border border-rose-200'
  };

  return (
    map[String(estado || '').toUpperCase()] ||
    'bg-slate-100 text-slate-700 border border-slate-200'
  );
};

const EstadoBadge = ({ estado }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getEstadoClasses(
      estado
    )}`}
  >
    {String(estado || '-').replaceAll('_', ' ')}
  </span>
);

const estadoOptions = [
  {
    value: 'PENDIENTE_INICIO',
    label: 'Pendiente inicio',
    description:
      'Aprobado pero todavía no arrancó formalmente el circuito de cobro.',
    icon: Clock3
  },
  {
    value: 'ACTIVO',
    label: 'Activo',
    description:
      'Cliente operativo y listo para trabajar normalmente en el padrón.',
    icon: CheckCircle2
  },
  {
    value: 'PAUSADO',
    label: 'Pausado',
    description: 'Se suspende temporalmente la operatoria sin darlo de baja.',
    icon: PauseCircle
  },
  {
    value: 'BLOQUEADO',
    label: 'Bloqueado',
    description: 'Se bloquea por incidencia administrativa o decisión interna.',
    icon: Lock
  }
];

const ModalClienteEstado = ({ open, onClose, cliente, onSaved }) => {
  const [estadoGeneral, setEstadoGeneral] = useState('');
  const [observacionesInternas, setObservacionesInternas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const row = cliente || {};

  useEffect(() => {
    if (!open) return;
    setEstadoGeneral(row?.estado_general || 'PENDIENTE_INICIO');
    setObservacionesInternas(row?.observaciones_internas || '');
    setError('');
    setSuccessMsg('');
    setSubmitting(false);
  }, [open, row?.estado_general, row?.observaciones_internas]);

  const currentEstado = row?.estado_general || 'PENDIENTE_INICIO';

  const selectedOption = useMemo(
    () => estadoOptions.find((item) => item.value === estadoGeneral),
    [estadoGeneral]
  );

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!row?.id) return;

    if (!estadoGeneral) {
      setError('Debes seleccionar un estado.');
      return;
    }

    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const payload = {
        estado_general: estadoGeneral,
        observaciones_internas: observacionesInternas
      };

      const response = await api.put(
        `/debitos-automaticos-clientes/${row.id}/estado`,
        payload
      );

      const updatedRow = normalizeSingle(response.data) || {
        ...row,
        estado_general: estadoGeneral,
        observaciones_internas: observacionesInternas
      };

      setSuccessMsg('Estado actualizado correctamente.');

      if (typeof onSaved === 'function') {
        onSaved(updatedRow);
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError ||
          'No se pudo actualizar el estado del cliente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1450] flex items-center justify-center p-3 sm:p-5"
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Cambio de estado
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {row?.titular_nombre || 'Cliente'}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <EstadoBadge estado={currentEstado} />
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    DNI {row?.titular_dni || '-'}
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
              <div className="xl:col-span-5 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Resumen actual
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Cliente
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {row?.titular_nombre || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Estado actual
                    </p>
                    <div className="mt-2">
                      <EstadoBadge estado={currentEstado} />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Inicio cobro
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDate(row?.fecha_inicio_cobro)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Estado sugerido
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {selectedOption?.label || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-7 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)]">
                <div className="mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Nuevo estado operativo
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Estado
                    </label>
                    <select
                      value={estadoGeneral}
                      onChange={(e) => setEstadoGeneral(e.target.value)}
                      disabled={submitting}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    >
                      {estadoOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedOption && (
                    <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <selectedOption.icon className="mt-0.5 h-5 w-5 text-orange-500" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {selectedOption.label}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {selectedOption.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Observaciones internas
                    </label>
                    <textarea
                      value={observacionesInternas}
                      onChange={(e) => setObservacionesInternas(e.target.value)}
                      disabled={submitting}
                      rows={5}
                      placeholder="Escribí una observación interna para dejar contexto del cambio..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    Guardar estado
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

export default ModalClienteEstado;
    