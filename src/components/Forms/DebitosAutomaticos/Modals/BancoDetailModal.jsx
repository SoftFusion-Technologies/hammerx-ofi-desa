import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Landmark,
  Hash,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  Percent,
  Sparkles,
  CircleDollarSign,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    transition: { duration: 0.18 }
  }
};

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatPct = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const isActivo = (value) => value === 1 || value === '1' || value === true;

const getDescripcionResumen = (banco) => {
  const off = Number(banco?.descuento_off_pct || 0);
  const reintegro = Number(banco?.reintegro_pct || 0);
  const desdeMes = banco?.reintegro_desde_mes;
  const duracion = banco?.reintegro_duracion_meses;
  const permanente =
    banco?.beneficio_permanente === 1 ||
    banco?.beneficio_permanente === '1' ||
    banco?.beneficio_permanente === true;

  if (banco?.descripcion_publica?.trim()) {
    return banco.descripcion_publica.trim();
  }

  if (off > 0 && reintegro <= 0 && permanente) {
    return `${formatPct(off)}% off (permanente)`;
  }

  if (off > 0 && reintegro > 0 && desdeMes && duracion) {
    return `${formatPct(off)}% off + ${formatPct(
      reintegro
    )}% de reintegro desde el mes ${desdeMes} durante ${duracion} meses.`;
  }

  if (off > 0 && reintegro > 0) {
    return `${formatPct(off)}% off + ${formatPct(reintegro)}% de reintegro.`;
  }

  if (off > 0) {
    return `${formatPct(off)}% off`;
  }

  if (reintegro > 0) {
    return `${formatPct(reintegro)}% de reintegro`;
  }

  return 'Beneficio bancario disponible.';
};

const InfoBox = ({ icon: Icon, label, value, tone = 'slate' }) => {
  const tones = {
    slate: {
      wrap: 'border-slate-200 bg-slate-50',
      icon: 'text-slate-600',
      label: 'text-slate-500',
      value: 'text-slate-800'
    },
    orange: {
      wrap: 'border-orange-200 bg-orange-50',
      icon: 'text-orange-600',
      label: 'text-orange-600',
      value: 'text-slate-900'
    },
    emerald: {
      wrap: 'border-emerald-200 bg-emerald-50',
      icon: 'text-emerald-600',
      label: 'text-emerald-600',
      value: 'text-slate-900'
    },
    sky: {
      wrap: 'border-sky-200 bg-sky-50',
      icon: 'text-sky-600',
      label: 'text-sky-600',
      value: 'text-slate-900'
    }
  };

  const current = tones[tone] || tones.slate;

  return (
    <div className={`rounded-2xl border p-4 ${current.wrap}`}>
      <div className="mb-2 flex items-center gap-2">
        {Icon && <Icon className={`h-4 w-4 ${current.icon}`} />}
        <p
          className={`text-[11px] font-bold uppercase tracking-widest ${current.label}`}
        >
          {label}
        </p>
      </div>
      <p className={`text-sm font-semibold leading-relaxed ${current.value}`}>
        {value || '-'}
      </p>
    </div>
  );
};

export default function BancoDetailModal({ open, onClose, banco }) {
  const activo = isActivo(banco?.activo);
  const resumen = getDescripcionResumen(banco);

  return (
    <AnimatePresence>
      {open && banco && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)',
              backgroundSize: '34px 34px'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 -left-20 size-[24rem] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(14,165,233,0.18) 0%, rgba(56,189,248,0.12) 35%, transparent 72%)'
            }}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[96vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-5 sm:p-6 md:p-7">
              <div className="mb-6 rounded-[26px] border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-orange-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 ring-1 ring-sky-200">
                      <Landmark className="h-7 w-7" />
                    </div>

                    <div>
                      <h3 className="text-3xl font-bignoodle font-bold text-slate-900">
                        {banco?.nombre || 'Banco'}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                            activo
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border border-rose-200 bg-rose-50 text-rose-700'
                          }`}
                        >
                          {activo ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {activo ? 'Activo' : 'Inactivo'}
                        </span>

                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-700">
                          <Hash className="h-3.5 w-3.5" />
                          {banco?.codigo || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-right backdrop-blur-sm">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      ID interno
                    </p>
                    <p className="text-lg font-bold text-slate-900">
                      #{banco?.id ?? '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoBox
                  icon={Percent}
                  label="Descuento off"
                  value={`${formatPct(banco?.descuento_off_pct)}%`}
                  tone="orange"
                />
                <InfoBox
                  icon={CircleDollarSign}
                  label="Reintegro"
                  value={`${formatPct(banco?.reintegro_pct)}%`}
                  tone="emerald"
                />
                <InfoBox
                  icon={CalendarDays}
                  label="Desde mes"
                  value={banco?.reintegro_desde_mes ?? '-'}
                  tone="sky"
                />
                <InfoBox
                  icon={CalendarDays}
                  label="Duración"
                  value={
                    banco?.reintegro_duracion_meses
                      ? `${banco.reintegro_duracion_meses} meses`
                      : '-'
                  }
                />
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <InfoBox
                  icon={Sparkles}
                  label="Beneficio permanente"
                  value={
                    banco?.beneficio_permanente === 1 ||
                    banco?.beneficio_permanente === true ||
                    banco?.beneficio_permanente === '1'
                      ? 'Sí'
                      : 'No'
                  }
                  tone="orange"
                />

                <InfoBox
                  icon={FileText}
                  label="Descripción pública"
                  value={banco?.descripcion_publica || '-'}
                  tone="sky"
                />
              </div>

              <div className="mb-6 rounded-[26px] border border-orange-100 bg-orange-50/70 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-orange-600" />
                  <h4 className="text-base font-bold text-slate-900">
                    Explicación del beneficio
                  </h4>
                </div>

                <p className="text-sm leading-relaxed text-slate-700">
                  {resumen}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <InfoBox
                  icon={CalendarDays}
                  label="Fecha de creación"
                  value={formatDate(banco?.created_at)}
                />
                <InfoBox
                  icon={ShieldCheck}
                  label="Fecha de actualización"
                  value={formatDate(banco?.updated_at)}
                />
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
