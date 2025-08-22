import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaTag,
  FaTimes,
  FaUserFriends,
  FaHistory
} from 'react-icons/fa';

/**
 * FilterBar++
 * Props:
 * - statusFilter, setStatusFilter (string: 'all' | 'P' | 'N' | 'S' | 'N_PREV')
 * - onClear? () => void
 * - sourceRows?: any[] (para conteos)
 * - nuevosMesAnteriorIds?: Set<number>
 * - hideZeroBadges?: boolean (default true)
 * - storageKey?: string (default 'filterBar.status')
 */
export default function FilterBar({
  statusFilter,
  setStatusFilter,
  onClear = () => {},
  sourceRows = [],
  nuevosMesAnteriorIds,
  hideZeroBadges = true,
  storageKey = 'filterBar.status'
}) {
  // -------- opciones (1 lugar, sin duplicar strings)
  const OPTIONS = useMemo(
    () => [
      { key: 'all', label: 'Todos', icon: FaUsers, tint: 'blue' },
      { key: 'P', label: 'Prospectos (P)', icon: FaUserPlus, tint: 'amber' },
      { key: 'N', label: 'Nuevos (N)', icon: FaUserCheck, tint: 'emerald' },
      { key: 'S', label: 'Socios (S)', icon: FaUserFriends, tint: 'indigo' },
      {
        key: 'N_PREV',
        label: 'Nuevos (mes ant.)',
        icon: FaHistory,
        tint: 'orange'
      }
    ],
    []
  );

  const LABELS = useMemo(
    () => ({
      nuevo: 'N',
      prospecto: 'P',
      socio: 'S'
    }),
    []
  );

  // -------- conteos
  const counts = useMemo(() => {
    if (!sourceRows) return null;
    const valid = sourceRows.filter((r) => r?.id);
    const obj = { all: valid.length, P: 0, N: 0, S: 0, N_PREV: 0 };
    for (const al of valid) {
      const label = LABELS[al?.prospecto] || '';
      if (label === 'P') obj.P++;
      if (label === 'N') obj.N++;
      if (label === 'S') obj.S++;
      if (nuevosMesAnteriorIds?.has(al.id)) obj.N_PREV++;
    }
    return obj;
  }, [sourceRows, nuevosMesAnteriorIds, LABELS]);

  // -------- sticky con sombra al scrollear
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let last = 0;
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 2 !== last) {
        last = y > 2;
        setScrolled(last);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // -------- thumb animado + reduced motion
  const wrapRef = useRef(null);
  const btnRefs = useRef({});
  const [thumb, setThumb] = useState({ left: 0, width: 0, ready: false });
  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
      : false;

  const updateThumb = () => {
    const wrap = wrapRef.current;
    const btn = btnRefs.current[statusFilter];
    if (!wrap || !btn) return;
    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setThumb({
      left: Math.max(0, bRect.left - wRect.left),
      width: bRect.width,
      ready: true
    });
  };

  useEffect(() => {
    updateThumb();
    const ro = new ResizeObserver(updateThumb);
    if (wrapRef.current) ro.observe(wrapRef.current);
    window.addEventListener('resize', updateThumb);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateThumb);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // -------- accesibilidad: live region + atajos
  const [live, setLive] = useState('');
  useEffect(() => {
    const o = OPTIONS.find((o) => o.key === statusFilter);
    setLive(`Filtro aplicado: ${o?.label || 'Todos'}`);
  }, [statusFilter, OPTIONS]);

  useEffect(() => {
    const onKey = (e) => {
      // 1..9 -> saltar directo por índice
      if (e.target.closest('input,textarea,[contenteditable=true]')) return;
      const i = Number(e.key);
      if (i >= 1 && i <= OPTIONS.length) {
        e.preventDefault();
        setStatusFilter(OPTIONS[i - 1].key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [OPTIONS, setStatusFilter]);

  const onKeyNav = (e) => {
    const idx = OPTIONS.findIndex((o) => o.key === statusFilter);
    if (idx < 0) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setStatusFilter(OPTIONS[(idx + 1) % OPTIONS.length].key);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setStatusFilter(OPTIONS[(idx - 1 + OPTIONS.length) % OPTIONS.length].key);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setStatusFilter(OPTIONS[0].key);
    } else if (e.key === 'End') {
      e.preventDefault();
      setStatusFilter(OPTIONS[OPTIONS.length - 1].key);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      updateThumb();
    }
  };

  // -------- persistencia (URL + localStorage)
  useEffect(() => {
    try {
      // url
      const url = new URL(window.location.href);
      url.searchParams.set('filter', statusFilter);
      window.history.replaceState({}, '', url);
      // storage
      localStorage.setItem(storageKey, statusFilter);
    } catch {}
  }, [statusFilter, storageKey]);

  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = url.searchParams.get('filter');
      const fromStorage = localStorage.getItem(storageKey);
      const preferred = fromUrl || fromStorage;
      if (preferred && OPTIONS.some((o) => o.key === preferred)) {
        setStatusFilter(preferred);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- estilos utilitarios
  const activeByTint = (t) =>
    ({
      blue: 'text-blue-600',
      amber: 'text-amber-600',
      emerald: 'text-emerald-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-500'
    }[t] || 'text-gray-800');

  const containerClasses = [
    'sticky top-0 z-40 -mx-4 px-4 py-3 bg-white/70 backdrop-blur-md supports-[backdrop-filter]:bg-white/50',
    'border-b transition-shadow',
    scrolled ? 'shadow-md' : 'shadow-none'
  ].join(' ');

  return (
    <div ref={rootRef} className={containerClasses}>
      {/* header */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <h3 className="ml-2 font-bignoodle text-2xl sm:text-4xl font-semibold tracking-wide text-gray-700 uppercase">
          Filtros
        </h3>
        <button
          onClick={() => {
            setStatusFilter('all');
            onClear();
          }}
          className="hidden md:inline-flex items-center gap-2 text-xs sm:text-sm px-3 py-1.5 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          title="Limpiar filtros"
        >
          <FaTimes /> Limpiar
        </button>
      </div>

      {/* segmented */}
      <div
        ref={wrapRef}
        role="tablist"
        aria-label="Filtros de alumnos"
        onKeyDown={onKeyNav}
        className="relative w-full overflow-x-auto no-scrollbar"
      >
        <div className="inline-flex min-w-full md:w-auto items-center gap-1 md:gap-2 p-1 rounded-2xl border bg-white/60 shadow-sm ring-1 ring-black/5">
          {/* thumb */}
          <div
            className="absolute h-[38px] md:h-10 rounded-2xl bg-gray-900/5 pointer-events-none"
            style={{
              transform: `translateX(${thumb.left}px)`,
              width: thumb.width,
              opacity: thumb.ready ? 1 : 0,
              transition: prefersReducedMotion
                ? 'none'
                : 'transform 300ms, width 300ms, opacity 150ms'
            }}
          />
          {OPTIONS.map(({ key, label, icon: Icon, tint }, i) => {
            const active = statusFilter === key;
            const count = counts
              ? key === 'all'
                ? counts.all
                : counts[key]
              : null;
            const showBadge =
              typeof count === 'number'
                ? !hideZeroBadges || active || count > 0
                : true; // si aún no hay counts -> “…”

            return (
              <button
                key={key}
                ref={(el) => (btnRefs.current[key] = el)}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${key}`}
                tabIndex={active ? 0 : -1}
                data-active={active}
                onClick={() => setStatusFilter(key)}
                className={[
                  'relative z-10 shrink-0 px-3 sm:px-4 h-[38px] md:h-10 rounded-2xl border border-transparent',
                  'text-sm md:text-[15px] font-medium transition-colors',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-300',
                  active ? activeByTint(tint) : 'text-gray-700'
                ].join(' ')}
                title={`${label} (atajo: ${i + 1})`}
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="text-base" />
                  <span className="whitespace-nowrap">{label}</span>
                  {showBadge && (
                    <span
                      className={[
                        'ml-1 inline-flex items-center justify-center px-2 h-6 min-w-[1.5rem] rounded-full text-xs font-semibold',
                        active
                          ? 'bg-black/10 text-current'
                          : 'bg-gray-100 text-gray-700'
                      ].join(' ')}
                    >
                      {typeof count === 'number' ? count : '…'}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
          {/* limpiar mobile */}
          <button
            onClick={() => {
              setStatusFilter('all');
              onClear();
            }}
            className="md:hidden relative z-10 shrink-0 px-3 sm:px-4 h-[38px] md:h-10 rounded-2xl text-sm font-medium text-gray-700 hover:text-gray-900"
            title="Limpiar filtros"
          >
            <span className="inline-flex items-center gap-2">
              <FaTimes className="text-base" />
              <span>Limpiar</span>
            </span>
          </button>
        </div>
      </div>

      {/* live region: anuncia cambios a lectores de pantalla */}
      <span className="sr-only" role="status" aria-live="polite">
        {live}
      </span>

      {/* util: ocultar scrollbar en mobile */}
      <style>
        {`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}
      </style>
    </div>
  );
}
