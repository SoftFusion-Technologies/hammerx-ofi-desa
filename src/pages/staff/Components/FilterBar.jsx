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
 * - nPrevKinds?: Set<'prospecto_c'|'nuevo'>  (opcional controlado)
 * - setNPrevKinds?: (nextSet:Set) => void     (opcional controlado)
 */
export default function FilterBar({
  statusFilter,
  setStatusFilter,
  onClear = () => {},
  sourceRows = [],
  nuevosMesAnteriorIds,
  hideZeroBadges = true,
  storageKey = 'filterBar.status',
  // 👇 OPCIONALES (controlado)
  nPrevKinds,
  setNPrevKinds
}) {
  const ALL_KINDS = new Set(['prospecto_c', 'nuevo', 'legacy']);

  // Estado local (si el padre no lo controla). Usar función para no compartir la misma instancia.
  const [localKinds, setLocalKinds] = useState(
    () => new Set(['prospecto_c', 'nuevo'])
  );
  const kinds = nPrevKinds ?? localKinds;
  const setKinds = setNPrevKinds ?? setLocalKinds;

  // -------- opciones (1 lugar, sin duplicar strings)
  const OPTIONS = useMemo(
    () => [
      { key: 'all', label: 'Todos', icon: FaUsers, tint: 'blue' },
      {
        key: 'P',
        label: 'Prospectos No Convertidos',
        icon: FaUserPlus,
        tint: 'amber'
      },
      { key: 'N', label: 'Nuevos (N)', icon: FaUserCheck, tint: 'emerald' },
      { key: 'S', label: 'Socios (S)', icon: FaUserFriends, tint: 'indigo' },
      {
        key: 'N_PREV',
        label: 'Nuevos (mes anterior)',
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

  // -------- conteos (incluye subtotales de N_PREV por origen)
  const counts = useMemo(() => {
    if (!sourceRows) return null;
    const valid = sourceRows.filter((r) => r?.id);

    const obj = {
      all: valid.length,
      P: 0,
      N: 0,
      S: 0,
      N_PREV: 0,
      N_PREV_PC: 0,
      N_PREV_N: 0,
      N_PREV_LEGACY: 0
    };

    for (const al of valid) {
      const label = LABELS[al?.prospecto] || '';
      if (label === 'P') obj.P++;
      if (label === 'N') obj.N++;
      if (label === 'S') obj.S++;

      // Amarillos del mes vigente (ids presentes en alumnos_nuevos)
      const esAmarillo = nuevosMesAnteriorIds?.has(al.id);
      if (esAmarillo) {
        obj.N_PREV++;
        if (al.socio_origen === 'prospecto_c') obj.N_PREV_PC++;
        if (al.socio_origen === 'nuevo') obj.N_PREV_N++;
        if (!al.socio_origen) obj.N_PREV_LEGACY++;
      }
    }
    return obj;
  }, [sourceRows, nuevosMesAnteriorIds, LABELS]);

  // -------- sticky con sombra al scrollear
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setScrolled(y > 2);
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
      // 1..9 -> saltar directo por índice (si no estás escribiendo en un input)
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

  // -------- persistencia (URL + localStorage) para status
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('filter', statusFilter);
      window.history.replaceState({}, '', url);
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

  // -------- persistencia (local) para el subfiltro si NO es controlado por el padre
  useEffect(() => {
    if (!setNPrevKinds) {
      try {
        localStorage.setItem(
          `${storageKey}.nprev`,
          Array.from(kinds).join(',')
        );
      } catch {}
    }
  }, [kinds, setNPrevKinds, storageKey]);

  useEffect(() => {
    if (!nPrevKinds) {
      try {
        const raw = localStorage.getItem(`${storageKey}.nprev`);
        if (raw) {
          const parsed = raw.split(',').filter(Boolean);
          if (parsed.length) setKinds(new Set(parsed));
        }
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------- helpers
  const activeByTint = (t) =>
    ({
      blue: 'text-blue-600',
      amber: 'text-amber-600',
      emerald: 'text-emerald-600',
      indigo: 'text-indigo-600',
      orange: 'text-orange-500'
    }[t] || 'text-gray-800');

  const toggleKind = (k) => {
    const next = new Set(kinds);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    // si se apagan ambas, reactivamos ambas (UX más amable)
    if (next.size === 0) {
      next.add('prospecto_c');
      next.add('nuevo');
      next.add('legacy');
    }
    setKinds(next);
  };

  const resetKinds = () => setKinds(new Set(['prospecto_c', 'nuevo']));

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
            resetKinds();
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
                : true;

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
              resetKinds();
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

      {/* Subfiltro: solo para N_PREV */}
      {statusFilter === 'N_PREV' && (
        <div className="mt-2 px-1 hidden">
          <div className="inline-flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Origen:</span>

            {/* PC → S */}
            <button
              type="button"
              onClick={() => toggleKind('prospecto_c')}
              className={[
                'px-2.5 h-8 rounded-full text-xs font-medium border transition',
                kinds.has('prospecto_c')
                  ? 'bg-orange-100 border-orange-200 text-orange-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Prospecto con P C → Socio"
            >
              P&nbsp;C → S
              {counts && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[11px] bg-black/10 text-current">
                  {counts.N_PREV_PC ?? 0}
                </span>
              )}
            </button>

            {/* N → S */}
            <button
              type="button"
              onClick={() => toggleKind('nuevo')}
              className={[
                'px-2.5 h-8 rounded-full text-xs font-medium border transition',
                kinds.has('nuevo')
                  ? 'bg-violet-100 border-violet-200 text-violet-700'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              ].join(' ')}
              title="Nuevo → Socio"
            >
              N → S
              {counts && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[11px] bg-black/10 text-current">
                  {counts.N_PREV_N ?? 0}
                </span>
              )}
            </button>

            {/* Sin origen (legacy) */}
            <button
              type="button"
              onClick={() => toggleKind('legacy')}
              className={[
                'px-2.5 h-8 rounded-full text-xs font-medium border transition',
                kinds.has('legacy')
                  ? 'bg-green-100 border-green-200 text-green-700'
                  : 'bg-white border-green-200 text-green-700 hover:bg-green-50'
              ].join(' ')}
              title="Amarillos sin socio_origen (legacy)"
            >
              Sin origen
              {counts && (
                <span className="ml-2 inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 rounded-full text-[11px] bg-black/10 text-current">
                  {counts.N_PREV_LEGACY ?? 0}
                </span>
              )}
            </button>

            {/* resumen */}
            <span className="text-[11px] text-gray-500">
              (mostrando{' '}
              {['prospecto_c', 'nuevo', 'legacy'].every((k) => kinds.has(k))
                ? 'todos'
                : [
                    kinds.has('prospecto_c') ? 'P C → S' : null,
                    kinds.has('nuevo') ? 'N → S' : null,
                    kinds.has('legacy') ? 'Sin origen' : null
                  ]
                    .filter(Boolean)
                    .join(' + ')}
              )
            </span>
          </div>
        </div>
      )}

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
