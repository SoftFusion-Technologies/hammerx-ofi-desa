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
      {/* Inline keyframes (sin config externa) */}
      <style>{`
        @keyframes fcmOverlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fcmOverlayOut { from { opacity: 1 } to { opacity: 0 } }

        @keyframes fcmPanelIn {
          from { opacity: 0; transform: translateY(14px) scale(0.985); filter: blur(6px) }
          to   { opacity: 1; transform: translateY(0)    scale(1);     filter: blur(0) }
        }
        @keyframes fcmPanelOut {
          from { opacity: 1; transform: translateY(0)    scale(1);     filter: blur(0) }
          to   { opacity: 0; transform: translateY(12px) scale(0.985); filter: blur(5px) }
        }

        @keyframes fcmBreath {
          0%   { transform: translate3d(0,0,0) scale(1); opacity: .65 }
          50%  { transform: translate3d(10px,-10px,0) scale(1.06); opacity: .9 }
          100% { transform: translate3d(0,0,0) scale(1); opacity: .65 }
        }

        @keyframes fcmSheen {
          0% { transform: translateX(-40%) rotate(12deg); opacity: 0 }
          22% { opacity: .40 }
          55% { opacity: .18 }
          100% { transform: translateX(140%) rotate(12deg); opacity: 0 }
        }
      `}</style>

      {/* Backdrop (siempre oscuro, premium) */}
      <div
        className={cx(
          'absolute inset-0',
          'bg-black/75',
          'backdrop-blur-[10px]',
          leaving
            ? 'animate-[fcmOverlayOut_190ms_ease-in_forwards]'
            : 'animate-[fcmOverlayIn_190ms_ease-out]',
          'motion-reduce:animate-none'
        )}
        onClick={closeModal}
      />
      {/* Vignette extra para “cinematic depth” */}
      <div
        className={cx(
          'pointer-events-none absolute inset-0',
          'bg-[radial-gradient(120%_90%_at_50%_0%,rgba(0,0,0,0)_0%,rgba(0,0,0,0.55)_60%,rgba(0,0,0,0.85)_100%)]'
        )}
      />

      {/* Container */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        {/* Frame gradient (hairline premium) */}
        <div
          className={cx(
            'w-full max-w-[760px]',
            'rounded-[26px] p-[1px]',
            'shadow-[0_70px_220px_rgba(0,0,0,0.70)]'
          )}
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, ${ACCENT_SOFT} 30%, rgba(255,255,255,0.10) 70%, rgba(255,255,255,0.14) 100%)`
          }}
        >
          <div
            ref={panelRef}
            onKeyDown={onPanelKeyDown}
            onClick={(e) => e.stopPropagation()}
            className={cx(
              'relative overflow-hidden rounded-[25px]',
              'flex flex-col',
              'border border-white/10',
              'bg-zinc-950/75 text-white',
              'backdrop-blur-2xl',
              leaving
                ? 'animate-[fcmPanelOut_190ms_ease-in_forwards]'
                : 'animate-[fcmPanelIn_230ms_cubic-bezier(0.16,1,0.3,1)]',
              'motion-reduce:animate-none',
              'max-h-[90vh]'
            )}
            style={{ scrollbarGutter: 'stable' }}
          >
            {/* Ambient layers */}
            <div className="pointer-events-none absolute inset-0">
              {/* halos */}
              <div
                className={cx(
                  'absolute -top-44 -left-44 h-[560px] w-[560px] rounded-full blur-3xl',
                  'animate-[fcmBreath_12s_ease-in-out_infinite] motion-reduce:animate-none'
                )}
                style={{
                  background: `radial-gradient(circle, ${ACCENT} ,0.22) 0%, rgba(0,0,0,0) 60%)`
                }}
              />
              <div
                className={cx(
                  'absolute -bottom-52 -right-52 h-[620px] w-[620px] rounded-full blur-3xl',
                  'animate-[fcmBreath_14s_ease-in-out_infinite] motion-reduce:animate-none'
                )}
                style={{
                  animationDelay: '1.6s',
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 58%)'
                }}
              />

              {/* top accent line */}
              <div
                className="absolute left-0 top-0 h-[2px] w-full"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(251,146,60,0.85) 0%, rgba(251,191,36,0.30) 35%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0) 100%)'
                }}
              />

              {/* premium micro-grid */}
              <div
                className="absolute inset-0 opacity-[0.10]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.35) 1px, transparent 0)',
                  backgroundSize: '26px 26px'
                }}
              />

              {/* subtle inner vignette */}
              <div className="absolute inset-0 bg-[radial-gradient(140%_90%_at_50%_10%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_55%,rgba(0,0,0,0.45)_100%)]" />
            </div>

            {/* Sheen */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className={cx(
                  'absolute -top-28 left-0 h-[320px] w-[65%] rotate-[12deg]',
                  'bg-gradient-to-r from-transparent via-white/12 to-transparent',
                  'blur-md',
                  'animate-[fcmSheen_9s_ease-in-out_infinite]',
                  'motion-reduce:hidden'
                )}
              />
            </div>

            {/* Content */}
            <div className="relative flex-1 min-h-0 overflow-y-auto overscroll-contain">
              {/* Header */}
              <div className="px-5 pt-5 sm:px-7 sm:pt-7">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Icon */}
                    <div className="relative shrink-0">
                      <div
                        className="absolute inset-0 rounded-2xl blur-xl"
                        style={{ background: `rgba(251,146,60,0.18)` }}
                      />
                      <div
                        className={cx(
                          'relative flex h-12 w-12 items-center justify-center rounded-2xl',
                          'border border-white/10',
                          'bg-white/[0.06]',
                          'shadow-[0_18px_60px_rgba(0,0,0,0.45)]',
                          'ring-1 ring-white/5'
                        )}
                        aria-hidden="true"
                      >
                        <FaBell className="text-[18px] text-white/90" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      {/* Badge */}
                      <div
                        className={cx(
                          'inline-flex items-center gap-2 rounded-full px-3 py-1',
                          'border border-white/10 bg-white/[0.06]',
                          'text-[11px] font-extrabold uppercase tracking-wider text-white/80'
                        )}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: `rgba(251,146,60,0.85)` }}
                        />
                        <FaCalendarCheck className="text-[12px] text-white/70" />
                        Aviso de vencimiento
                      </div>

                      <h3
                        id={titleIdRef.current}
                        className={cx(
                          'mt-2 text-[20px] leading-tight sm:text-[24px] md:text-[26px]',
                          'font-extrabold tracking-[-0.02em] text-white font-bignoodle'
                        )}
                      >
                        Falta subir el comprobante de pago
                      </h3>

                      {/* Meta line: más “fintech”, menos texto pesado */}
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/65">
                        <span className="inline-flex items-center gap-2">
                          <span className="text-white/40">Convenio</span>
                          <span className="font-semibold text-white/85">
                            {convenioNombre || '—'}
                          </span>
                        </span>
                        <span className="text-white/25">•</span>
                        <span className="inline-flex items-center gap-2">
                          <span className="text-white/40">Mes</span>
                          <span className="font-semibold text-white/85">
                            {monthLabel || '—'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
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
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                        'focus-visible:ring-offset-black/0'
                      )}
                      style={{}}
                      title="Cerrar"
                      aria-label="Cerrar"
                    >
                      <FaTimes className="text-[16px] opacity-90 transition-transform duration-200 group-hover:rotate-[6deg]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider (hairline) */}
              <div className="px-5 sm:px-7">
                <div className="mt-5 h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
              </div>

              {/* Body */}
              <div className="px-5 pb-5 sm:px-7 sm:pb-7">
                {/* Message: no “caja blanca gigante”; card dark-glass sutil */}
                <div
                  className={cx(
                    'mt-5 rounded-3xl p-4 sm:p-5',
                    'border border-white/10 bg-white/[0.05]',
                    'ring-1 ring-white/5',
                    'shadow-[0_24px_90px_rgba(0,0,0,0.35)]',
                    'transition-all duration-200'
                  )}
                >
                  <p
                    id={descIdRef.current}
                    className="text-sm leading-relaxed text-white/80 font-messina"
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
                </div>
              </div>

              <div className="pointer-events-none sticky bottom-0 left-0 h-12 w-full bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <footer className="-mt-10 relative shrink-0 border-t border-white/10 bg-zinc-950/70 backdrop-blur-2xl">
              {/* Ambient */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 opacity-90 bg-[radial-gradient(120%_120%_at_18%_0%,rgba(251,146,60,0.14)_0%,rgba(0,0,0,0)_58%),radial-gradient(120%_120%_at_82%_120%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0)_62%)]" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black/30" />
              </div>

              <div className="relative px-5 py-4 sm:px-7 sm:py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: Branding */}
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

                  {/* Right: Socials */}
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
  );
}
