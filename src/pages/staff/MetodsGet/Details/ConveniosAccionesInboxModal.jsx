import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, X, Search, FileText, Check } from 'lucide-react';

const fmtARDateTime = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const safeJson = (s) => {
  try {
    if (!s) return null;
    if (typeof s === 'object') return s; // por si ya viene parseado
    return JSON.parse(String(s));
  } catch {
    return null;
  }
};

const badgeBase =
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold';

export default function ConveniosAccionesInboxModal({
  isOpen,
  onClose,
  items = [],
  loading = false,
  onMarkRead,
  onMarkAllRead,
  onGoConvenios,
  userId,
  nomyape
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = String(q || '')
      .trim()
      .toLowerCase();
    if (!s) return items;

    return items.filter((it) => {
      const meta = safeJson(it?.metadata_json);
      const blob = [
        it?.descripcion,
        it?.accion_tipo,
        it?.month_start,
        meta?.mes_label,
        meta?.convenio_nombre,
        String(it?.convenio_id ?? ''),
        String(it?.id ?? '')
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return blob.includes(s);
    });
  }, [items, q]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
              {/* Header */}
              <div className="relative px-6 py-5 border-b border-white/10">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-orange-500/10 via-pink-500/6 to-emerald-500/8" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-orange-500/15 text-orange-300 flex items-center justify-center border border-orange-400/20">
                      <FileText className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                        Reportes y cierre
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <h3 className="text-white font-bignoodle text-2xl tracking-widest">
                          Pendientes de convenios
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-white/10 border border-white/15 px-2 py-0.5 text-[12px] text-white/80 font-semibold tabular-nums">
                          {items.length}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/55 max-w-2xl">
                        Revisá los cierres mensuales (“Finalicé listado”), marcá
                        como leído y llevá control de lo que ya fue comunicado.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={onMarkAllRead}
                      disabled={loading || items.length === 0}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                                 bg-white/10 hover:bg-white/15 text-white border border-white/15
                                 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      title="Marcar todo como leído"
                    >
                      <Check className="h-4 w-4" />
                      Marcar todo
                    </button>

                    <button
                      type="button"
                      onClick={onGoConvenios}
                      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                                 bg-gradient-to-r from-orange-500 to-orange-600 text-white
                                 border border-orange-400/20 shadow-lg shadow-orange-500/15
                                 hover:shadow-orange-500/25 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Ir a Convenios
                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center justify-center rounded-xl p-2
                                 bg-white/10 hover:bg-white/15 text-white border border-white/15 transition"
                      aria-label="Cerrar"
                      title="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mt-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2">
                    <Search className="h-4 w-4 text-white/50" />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por convenio, mes, descripción..."
                      className="w-full bg-transparent outline-none text-sm text-white/80 placeholder:text-white/35"
                    />
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                {loading ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/70 text-sm">
                    Cargando pendientes...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/70 text-sm">
                    No hay pendientes para mostrar.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {filtered.map((it) => {
                      const meta = safeJson(it?.metadata_json);
                      const convenioNombre =
                        meta?.convenio_nombre ||
                        `Convenio #${it?.convenio_id ?? '—'}`;
                      const mesLabel =
                        meta?.mes_label || it?.month_start || '—';
                      const confirmadoEn =
                        meta?.confirmado_en || it?.created_at || it?.updated_at;

                      return (
                        <div
                          key={it?.id}
                          className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4"
                        >
                          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/8 via-transparent to-emerald-500/8" />

                          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`${badgeBase} bg-orange-500/15 border-orange-400/20 text-orange-200`}
                                >
                                  {String(
                                    it?.accion_tipo || 'ACCION'
                                  ).replaceAll('_', ' ')}
                                </span>
                                <span
                                  className={`${badgeBase} bg-white/10 border-white/15 text-white/70`}
                                >
                                  {convenioNombre}
                                </span>
                                <span
                                  className={`${badgeBase} bg-white/10 border-white/15 text-white/70`}
                                >
                                  {mesLabel}
                                </span>
                                <span
                                  className={`${badgeBase} bg-black/20 border-white/10 text-white/50`}
                                >
                                  {fmtARDateTime(confirmadoEn)}
                                </span>
                              </div>

                              <div className="mt-2 text-sm text-white/85 leading-relaxed">
                                {it?.descripcion || '—'}
                              </div>

                              <div className="mt-2 text-xs text-white/45">
                                ID #{it?.id} · Convenio #{it?.convenio_id} · Mes{' '}
                                {it?.month_start || '—'}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onMarkRead?.(it)}
                                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                                           bg-emerald-500/15 hover:bg-emerald-500/20 text-emerald-200
                                           border border-emerald-400/20 transition"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Marcar leído
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-white/40">
                  SoftFusion · Centro de notificaciones de convenios
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold text-white/75 hover:text-white transition"
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
