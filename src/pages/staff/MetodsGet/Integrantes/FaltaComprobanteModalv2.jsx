// Benjamin Orellana - 31/12/2025
// Modal: Falta comprobante (se guía por backend showModal=true)

import { useEffect, useMemo, useRef, useState } from 'react';
import { FaBell, FaCalendarCheck, FaSyncAlt, FaTimes } from 'react-icons/fa';

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaGlobe
} from 'react-icons/fa';

function toMonthStartParam(value) {
  if (!value) return null;

  // Date nativo
  if (value instanceof Date && !isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01 00:00:00`;
  }

  // dayjs/moment: toDate()
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return toMonthStartParam(value.toDate());
  }

  // dayjs: $d
  if (typeof value === 'object' && value.$d instanceof Date) {
    return toMonthStartParam(value.$d);
  }

  // dayjs/moment: format()
  if (typeof value === 'object' && typeof value.format === 'function') {
    return value.format('YYYY-MM-01 00:00:00');
  }

  // objetos comunes
  if (typeof value === 'object') {
    if (value.monthStart) return toMonthStartParam(value.monthStart);
    if (value.value) return toMonthStartParam(value.value);
    if (value.selectedMonth) return toMonthStartParam(value.selectedMonth);
  }

  // string
  const s = String(value).trim();

  // ISO / mysql: 2025-12...
  let m = s.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-01 00:00:00`;

  // "12/2025"
  m = s.match(/^(\d{2})\/(\d{4})$/);
  if (m) return `${m[2]}-${m[1]}-01 00:00:00`;

  // "31/12/2025"
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2]}-01 00:00:00`;

  return null;
}

function formatMonthLabel(monthStart) {
  if (!monthStart) return '';
  const m = String(monthStart).match(/^(\d{4})-(\d{2})/);
  if (!m) return '';
  return `${m[2]}/${m[1]}`;
}

// UI helpers (solo presentación)
const cx = (...classes) => classes.filter(Boolean).join(' ');
const getFocusable = (root) => {
  if (!root) return [];
  const nodes = root.querySelectorAll(
    [
      'a[href]',
      'area[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(',')
  );
  return Array.from(nodes).filter(
    (el) =>
      el &&
      !el.hasAttribute('disabled') &&
      el.getAttribute('aria-hidden') !== 'true' &&
      (el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        el.getClientRects().length > 0)
  );
};

export default function FaltaComprobanteModal({
  convenioId,
  monthStart,
  apiBaseUrl,
  authToken,
  userLevel,
  convenioNombre,
  dueDay = 10,
  refreshIntervalMs = 25000,
  onOpenChange,
  devLog = false // <- SOLO debug
}) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState(null);

  const lastOpenRef = useRef(false);

  const baseUrl = useMemo(() => {
    if (!apiBaseUrl) return '';
    return String(apiBaseUrl).replace(/\/+$/, '');
  }, [apiBaseUrl]);

  const monthStartParam = useMemo(
    () => toMonthStartParam(monthStart),
    [monthStart]
  );
  const monthLabel = useMemo(
    () => formatMonthLabel(monthStartParam),
    [monthStartParam]
  );

  // Convenio si userLevel es vacío/null/undefined/" "
  const isConvenio = useMemo(() => {
    const ul = userLevel == null ? '' : String(userLevel);
    return ul.trim() === '';
  }, [userLevel]);

  const emitOpenChange = (next) => {
    if (lastOpenRef.current !== next) {
      lastOpenRef.current = next;
      onOpenChange?.(next);
    }
  };

  // UI-only: salida suave
  const LEAVE_MS = 190;
  const [leaving, setLeaving] = useState(false);
  const leaveTimerRef = useRef(null);

  const closeModal = () => {
    setDismissed(true);
    emitOpenChange(false);

    if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    setLeaving(true);
    leaveTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setLeaving(false);
      leaveTimerRef.current = null;
    }, LEAVE_MS);
  };

  const fetchEstado = async () => {
    const convId = Number(convenioId || 0);

    // Solo convenio
    if (!isConvenio) {
      if (open || dismissed) {
        setOpen(false);
        setDismissed(false);
        emitOpenChange(false);
      }
      return;
    }

    if (!convId || !monthStartParam || !baseUrl) {
      if (devLog) {
        console.log('[FaltaComprobanteModal] Skip fetch', {
          convId,
          monthStartParam,
          baseUrl,
          isConvenio,
          userLevel
        });
      }
      return;
    }

    setLoading(true);

    try {
      const qs = new URLSearchParams({ monthStart: monthStartParam });
      const url = `${baseUrl}/convenios/${convId}/falta-comprobante?${qs.toString()}`;

      if (devLog) console.log('[FaltaComprobanteModal] GET', url);

      const resp = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        }
      });

      let data = null;
      try {
        data = await resp.json();
      } catch {
        data = null;
      }

      if (devLog)
        console.log('[FaltaComprobanteModal] RESP', resp.status, data);

      setPayload(data);

      const shouldOpen = Boolean(data?.ok && data?.showModal === true);

      if (shouldOpen) {
        if (!dismissed) {
          setOpen(true);
          emitOpenChange(true);
        } else {
          setOpen(false);
          emitOpenChange(false);
        }
      } else {
        if (dismissed) setDismissed(false);
        setOpen(false);
        emitOpenChange(false);
      }
    } catch (e) {
      if (devLog) console.error('[FaltaComprobanteModal] ERROR', e);
      setOpen(false);
      emitOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Inicial y al cambiar dependencias
  useEffect(() => {
    fetchEstado();
  }, [isConvenio, convenioId, monthStartParam, baseUrl]);

  // Auto-refresh: para apagarse cuando sube comprobante
  useEffect(() => {
    const convId = Number(convenioId || 0);
    if (!isConvenio || !convId || !monthStartParam || !baseUrl) return;

    const t = setInterval(() => {
      fetchEstado();
    }, refreshIntervalMs);

    return () => clearInterval(t);
  }, [isConvenio, convenioId, monthStartParam, baseUrl, refreshIntervalMs]);

  // ESC para cerrar
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  const titleIdRef = useRef(
    `falta-comp-title-${Math.random().toString(36).slice(2, 10)}`
  );
  const descIdRef = useRef(
    `falta-comp-desc-${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const t = window.setTimeout(() => {
      if (closeBtnRef.current) closeBtnRef.current.focus();
      else {
        const focusables = getFocusable(panelRef.current);
        if (focusables[0]) focusables[0].focus();
      }
    }, 0);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      const prev = previouslyFocusedRef.current;
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, [open]);

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) window.clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const onPanelKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(panelRef.current);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !panelRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!open) return null;

  const mensaje =
    payload?.mensaje ||
    'Aún no subiste el comprobante de pago. Recordá que vence el día 10. Por favor, subilo para evitar inconvenientes.';

  // ===== THEME QUICK EDIT (UI-only) =====
  const ACCENT = 'rgba(251,146,60'; // orange-400 aprox
  const ACCENT_SOFT = 'rgba(251,146,60,0.16)';
  const ACCENT_HAIRLINE = 'rgba(251,146,60,0.30)';

  return (
    <div
      className="fixed inset-0 z-[9999] motion-reduce:transition-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleIdRef.current}
      aria-describedby={descIdRef.current}
      data-state={leaving ? 'closing' : 'open'}
    >
      <style>{`
    @keyframes fcmOverlayIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes fcmOverlayOut { from { opacity: 1 } to { opacity: 0 } }

    @keyframes fcmPanelIn {
      from { opacity: 0; transform: translateY(18px) scale(0.985); filter: blur(8px) }
      to   { opacity: 1; transform: translateY(0)    scale(1);     filter: blur(0) }
    }
    @keyframes fcmPanelOut {
      from { opacity: 1; transform: translateY(0)    scale(1);     filter: blur(0) }
      to   { opacity: 0; transform: translateY(14px) scale(0.985); filter: blur(7px) }
    }

    @keyframes fcmBorderSpin {
      0%   { transform: rotate(0deg) }
      100% { transform: rotate(360deg) }
    }

    @keyframes fcmFloat {
      0%   { transform: translate3d(0,0,0) }
      50%  { transform: translate3d(10px,-10px,0) }
      100% { transform: translate3d(0,0,0) }
    }

    @keyframes fcmNoiseShift {
      0%   { transform: translate3d(0,0,0) }
      25%  { transform: translate3d(-2%, 1%, 0) }
      50%  { transform: translate3d(1%, -2%, 0) }
      75%  { transform: translate3d(-1%, -1%, 0) }
      100% { transform: translate3d(0,0,0) }
    }

    @keyframes fcmSheen {
      0% { transform: translateX(-55%) rotate(12deg); opacity: 0 }
      18% { opacity: .35 }
      45% { opacity: .16 }
      100% { transform: translateX(155%) rotate(12deg); opacity: 0 }
    }

    @keyframes fcmPulseDot {
      0%, 100% { transform: scale(1); opacity: .75 }
      50%      { transform: scale(1.35); opacity: 1 }
    }
  `}</style>

      {/* Backdrop */}
      <div
        className={cx(
          'absolute inset-0',
          'bg-black/80',
          'backdrop-blur-[12px]',
          leaving
            ? 'animate-[fcmOverlayOut_190ms_ease-in_forwards]'
            : 'animate-[fcmOverlayIn_190ms_ease-out]',
          'motion-reduce:animate-none'
        )}
        onClick={closeModal}
      />

      {/* Cinematic vignette + noise */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.50)_55%,rgba(0,0,0,0.88)_100%)]" />
        {/* Noise layer (sin assets) */}
        <div
          className={cx(
            'absolute inset-0 opacity-[0.09] mix-blend-overlay',
            'motion-reduce:hidden'
          )}
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 3px)',
            animation: 'fcmNoiseShift 6s linear infinite'
          }}
        />
      </div>

      {/* Container */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div className="relative w-full max-w-[920px]">
          {/* Animated conic border (más “ultra actual”) */}
          <div className="pointer-events-none absolute -inset-[1px] rounded-[34px] opacity-90">
            <div
              className={cx(
                'absolute inset-0 rounded-[34px] blur-[10px]',
                'motion-reduce:hidden'
              )}
              style={{
                background:
                  'conic-gradient(from 180deg, rgba(251,146,60,0.42), rgba(255,255,255,0.10), rgba(251,191,36,0.22), rgba(255,255,255,0.08), rgba(251,146,60,0.42))',
                animation: 'fcmBorderSpin 9s linear infinite'
              }}
            />
          </div>

          {/* Frame */}
          <div
            className={cx(
              'relative rounded-[34px] p-[1px]',
              'shadow-[0_80px_240px_rgba(0,0,0,0.78)]'
            )}
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(251,146,60,0.14) 35%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0.12) 100%)'
            }}
          >
            {/* Panel */}
            <div
              ref={panelRef}
              onKeyDown={onPanelKeyDown}
              onClick={(e) => e.stopPropagation()}
              className={cx(
                'relative overflow-hidden rounded-[33px]',
                'flex flex-col',
                'border border-white/10',
                'bg-zinc-950/80 text-white',
                'backdrop-blur-2xl',
                leaving
                  ? 'animate-[fcmPanelOut_190ms_ease-in_forwards]'
                  : 'animate-[fcmPanelIn_240ms_cubic-bezier(0.16,1,0.3,1)]',
                'motion-reduce:animate-none',
                'max-h-[92vh]'
              )}
              style={{ scrollbarGutter: 'stable' }}
            >
              {/* Ambient (más “producto” y menos “decoración”) */}
              <div className="pointer-events-none absolute inset-0">
                <div
                  className={cx(
                    'absolute -top-48 -left-48 h-[560px] w-[560px] rounded-full blur-3xl',
                    'motion-reduce:hidden'
                  )}
                  style={{
                    background: `radial-gradient(circle, ${ACCENT} 0%, rgba(0,0,0,0) 62%)`,
                    animation: 'fcmFloat 12s ease-in-out infinite'
                  }}
                />
                <div
                  className={cx(
                    'absolute -bottom-56 -right-56 h-[640px] w-[640px] rounded-full blur-3xl',
                    'motion-reduce:hidden'
                  )}
                  style={{
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 60%)',
                    animation: 'fcmFloat 14s ease-in-out infinite',
                    animationDelay: '1.2s'
                  }}
                />

                {/* Micro-grid premium */}
                <div
                  className="absolute inset-0 opacity-[0.10]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.32) 1px, transparent 0)',
                    backgroundSize: '28px 28px'
                  }}
                />

                {/* Inner vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_10%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_56%,rgba(0,0,0,0.52)_100%)]" />

                {/* Top accent rail */}
                <div
                  className="absolute left-0 top-0 h-[2px] w-full"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(251,146,60,0.90) 0%, rgba(251,191,36,0.32) 30%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0) 100%)'
                  }}
                />
              </div>

              {/* Sheen */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                  className={cx(
                    'absolute -top-28 left-0 h-[340px] w-[68%] rotate-[12deg]',
                    'bg-gradient-to-r from-transparent via-white/12 to-transparent',
                    'blur-md',
                    'motion-reduce:hidden'
                  )}
                  style={{ animation: 'fcmSheen 9.5s ease-in-out infinite' }}
                />
              </div>

              {/* Sticky header (command-bar style) */}
              <div className="relative z-20">
                <div className="sticky top-0 border-b border-white/10 bg-zinc-950/45 backdrop-blur-2xl">
                  <div className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Left cluster */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cx(
                              'inline-flex items-center gap-2 rounded-full px-3 py-1',
                              'border border-white/10 bg-white/[0.05]',
                              'text-[11px] font-extrabold uppercase tracking-wider text-white/80'
                            )}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{
                                background: `rgba(251,146,60,0.9)`,
                                animation:
                                  'fcmPulseDot 1.6s ease-in-out infinite'
                              }}
                            />
                            <FaCalendarCheck className="text-[12px] text-white/70" />
                            Aviso de vencimiento
                          </span>

                          <span className="hidden sm:inline-flex items-center gap-2 text-xs text-white/55">
                            <span className="text-white/35">Mes</span>
                            <span className="font-semibold text-white/80">
                              {monthLabel || '—'}
                            </span>
                            <span className="text-white/25">•</span>
                            <span className="text-white/35">Convenio</span>
                            <span className="font-semibold text-white/80 truncate max-w-[320px]">
                              {convenioNombre || '—'}
                            </span>
                          </span>
                        </div>

                        <h3
                          id={titleIdRef.current}
                          className={cx(
                            'mt-2 text-[18px] leading-tight sm:text-[22px] md:text-[24px]',
                            'font-extrabold tracking-[-0.02em] text-white font-bignoodle'
                          )}
                        >
                          Falta subir el comprobante de pago
                        </h3>
                      </div>

                      {/* Close */}
                      <button
                        ref={closeBtnRef}
                        onClick={closeModal}
                        className={cx(
                          'group inline-flex h-10 w-10 items-center justify-center rounded-2xl',
                          'border border-white/10 bg-white/[0.05] text-white/80',
                          'shadow-[0_18px_60px_rgba(0,0,0,0.30)]',
                          'ring-1 ring-white/5',
                          'transition-all duration-200',
                          'hover:bg-white/[0.10] hover:text-white hover:-translate-y-[1px]',
                          'active:translate-y-0 active:scale-[0.99]',
                          'focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40'
                        )}
                        title="Cerrar"
                        aria-label="Cerrar"
                      >
                        <FaTimes className="text-[16px] opacity-90 transition-transform duration-200 group-hover:rotate-[6deg]" />
                      </button>
                    </div>

                    {/* Mobile meta line */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/60 sm:hidden">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-white/35">Convenio</span>
                        <span className="font-semibold text-white/80">
                          {convenioNombre || '—'}
                        </span>
                      </span>
                      <span className="text-white/25">•</span>
                      <span className="inline-flex items-center gap-2">
                        <span className="text-white/35">Mes</span>
                        <span className="font-semibold text-white/80">
                          {monthLabel || '—'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
                <div className="px-4 pb-5 pt-5 sm:px-6 sm:pb-7 sm:pt-6">
                  {/* Layout: rail + main (ultra moderno) */}
                  <div className="grid gap-4 md:grid-cols-[280px_1fr]">
                    {/* LEFT RAIL (context / status) */}
                    <aside
                      className={cx(
                        'rounded-3xl p-4 sm:p-5',
                        'border border-white/10 bg-white/[0.04]',
                        'ring-1 ring-white/5',
                        'shadow-[0_24px_90px_rgba(0,0,0,0.35)]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-wider text-white/50 font-extrabold">
                            Estado
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ background: `rgba(251,146,60,0.9)` }}
                            />
                            <span className="text-sm font-semibold text-white/85">
                              Pendiente de comprobante
                            </span>
                          </div>
                        </div>

                        {/* Compact icon */}
                        <div className="relative shrink-0">
                          <div
                            className="absolute inset-0 rounded-2xl blur-xl"
                            style={{ background: `rgba(251,146,60,0.16)` }}
                          />
                          <div
                            className={cx(
                              'relative flex h-11 w-11 items-center justify-center rounded-2xl',
                              'border border-white/10 bg-white/[0.06]',
                              'shadow-[0_18px_60px_rgba(0,0,0,0.45)]',
                              'ring-1 ring-white/5'
                            )}
                            aria-hidden="true"
                          >
                            <FaBell className="text-[18px] text-white/90" />
                          </div>
                        </div>
                      </div>

                      {/* Big due chip */}
                      <div className="mt-4 rounded-3xl border border-white/10 bg-black/30 p-4 ring-1 ring-white/5">
                        <div className="text-[11px] uppercase tracking-wider text-white/50 font-extrabold">
                          Vencimiento
                        </div>
                        <div className="mt-2 flex items-end justify-between">
                          <div className="text-[44px] leading-none font-extrabold tracking-[-0.02em] text-white font-bignoodle">
                            {dueDay}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/55">
                              día del mes
                            </div>
                            <div className="text-[11px] text-white/45">
                              Se oculta al subir el comprobante
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Context blocks */}
                      <div className="mt-4 space-y-3">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="text-[11px] uppercase tracking-wider text-white/50 font-extrabold">
                            Convenio
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white/85 break-words">
                            {convenioNombre || '—'}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                          <div className="text-[11px] uppercase tracking-wider text-white/50 font-extrabold">
                            Mes
                          </div>
                          <div className="mt-1 text-sm font-semibold text-white/85">
                            {monthLabel || '—'}
                          </div>
                        </div>
                      </div>
                    </aside>

                    {/* MAIN (message / explanation) */}
                    <section
                      className={cx(
                        'rounded-3xl',
                        'border border-white/10 bg-white/[0.04]',
                        'ring-1 ring-white/5',
                        'shadow-[0_24px_90px_rgba(0,0,0,0.35)]',
                        'overflow-hidden'
                      )}
                    >
                      {/* Sub-header inside main */}
                      <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3 sm:px-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[11px] uppercase tracking-wider text-white/55 font-extrabold">
                              Detalle
                            </div>
                            <div className="mt-1 text-sm text-white/75">
                              Revisá el mensaje y subí el comprobante para
                              continuar.
                            </div>
                          </div>

                          <div
                            className={cx(
                              'shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1',
                              'border border-white/10 bg-white/[0.05]',
                              'text-xs font-semibold text-white/75'
                            )}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: `rgba(251,146,60,0.85)` }}
                            />
                            Prioridad alta
                          </div>
                        </div>
                      </div>

                      {/* Message content */}
                      <div className="px-4 py-4 sm:px-5 sm:py-5">
                        <p
                          id={descIdRef.current}
                          className="text-sm leading-relaxed text-white/82 font-messina"
                        >
                          {mensaje}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <span
                            className={cx(
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold',
                              'border bg-white/[0.06] text-white/85',
                              'ring-1 ring-white/5'
                            )}
                            style={{ borderColor: ACCENT_HAIRLINE }}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ background: `rgba(251,146,60,0.85)` }}
                            />
                            Vence el día {dueDay}
                          </span>

                          <span
                            className={cx(
                              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
                              'border border-white/10 bg-white/[0.04] text-white/70',
                              'ring-1 ring-white/5'
                            )}
                          >
                            Se oculta automáticamente al subir el comprobante
                          </span>
                        </div>

                        {/* Micro helper row (más “producto”) */}
                        <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-3 ring-1 ring-white/5">
                          <div className="text-xs text-white/70">
                            Sugerencia: subí el comprobante antes del
                            vencimiento para evitar bloqueos administrativos.
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* bottom fade */}
                <div className="pointer-events-none sticky bottom-0 left-0 h-12 w-full bg-gradient-to-t from-black/45 to-transparent" />
              </div>

              {/* Footer (dark) */}
              <footer className="relative shrink-0 border-t border-white/10 bg-zinc-950/70 backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 opacity-90 bg-[radial-gradient(120%_120%_at_18%_0%,rgba(251,146,60,0.14)_0%,rgba(0,0,0,0)_58%),radial-gradient(120%_120%_at_82%_120%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_62%)]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/30" />
                </div>

                <div className="relative px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-2 text-center sm:text-left sm:items-start items-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white/80">
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: `rgba(251,146,60,0.85)` }}
                        />
                        Soft Fusion Technologies
                      </div>

                      <div className="leading-tight">
                        <h3 className="text-white/90 font-semibold text-[15px]">
                          Tecnología Innovadora
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          Diseñado y desarrollado por{' '}
                          <a
                            href="https://softfusion.com.ar/"
                            className="font-extrabold text-white hover:text-white transition underline decoration-white/20 hover:decoration-white/50"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Soft Fusion
                          </a>
                          .
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-center sm:items-end">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-white/50">
                        Seguinos en redes
                      </span>

                      <div className="flex items-center gap-2.5">
                        <a
                          href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                          aria-label="Facebook Soft Fusion"
                          title="Facebook"
                        >
                          <FaFacebookF className="text-sm opacity-90 group-hover:opacity-100" />
                        </a>

                        <a
                          href="https://softfusion.com.ar/"
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                          aria-label="Web Soft Fusion"
                          title="Web"
                        >
                          <FaGlobe className="text-lg opacity-90 group-hover:opacity-100" />
                        </a>

                        <a
                          href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                          aria-label="WhatsApp Soft Fusion"
                          title="WhatsApp"
                        >
                          <FaWhatsapp className="text-lg opacity-90 group-hover:opacity-100" />
                        </a>

                        <a
                          href="https://www.instagram.com/softfusiontechnologies/"
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                          aria-label="Instagram Soft Fusion"
                          title="Instagram"
                        >
                          <FaInstagram className="text-lg opacity-90 group-hover:opacity-100" />
                        </a>

                        <a
                          href="https://www.linkedin.com/in/soft-fusionsa/"
                          target="_blank"
                          rel="noreferrer"
                          className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/80 transition-all hover:bg-white/[0.08] hover:-translate-y-[1px] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/40"
                          aria-label="LinkedIn Soft Fusion"
                          title="LinkedIn"
                        >
                          <FaLinkedinIn className="text-lg opacity-90 group-hover:opacity-100" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
