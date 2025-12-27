import { useEffect, useState } from 'react';

function BadgeAgendaConvenios({
  userId,
  userLevel,
  size = 'sm',
  className = ''
}) {
  const [count, setCount] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const load = async () => {
    try {
      const nivel = String(userLevel || '').toLowerCase();
      const canSeeAll =
        nivel === 'admin' ||
        nivel === 'administrador' ||
        nivel === 'gerente' ||
        nivel === 'vendedor'; 

      if (!canSeeAll) {
        setCount(0);
        return;
      }

      // Traemos una lista pequeña de "no leídos" y contamos
      // Si querés contar TODO aunque haya más, aumentá limit o hacé paginado.
      // Para badge suele ser suficiente un top N (ej. 9999) si no crece demasiado.
      const qs = new URLSearchParams();
      qs.set('leido', '0');
      qs.set('limit', '5000');
      qs.set('offset', '0');

      const res = await fetch(
        `${API_URL}/convenios-mes-acciones?${qs.toString()}`,
        {
          cache: 'no-store'
        }
      );

      const json = res.ok ? await res.json() : null;
      const total = Number(json?.meta?.total ?? 0);

      setCount(Number.isFinite(total) ? total : 0);
    } catch (err) {
      console.error('BadgeAgendaConvenios count error:', err);
      setCount(0);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);

    // eventos opcionales para refrescar (cuando se finaliza)
    const onConveniosUpdate = () => load();
    window.addEventListener(
      'convenios-mes-acciones-updated',
      onConveniosUpdate
    );

    return () => {
      clearInterval(id);
      window.removeEventListener(
        'convenios-mes-acciones-updated',
        onConveniosUpdate
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, userLevel]);

  if (!Number.isFinite(count) || count <= 0) return null;

  const sizeClasses =
    size === 'xl'
      ? 'min-w-[2.2rem] h-8 text-[14px]'
      : size === 'lg'
      ? 'min-w-[2rem] h-7 text-[12px]'
      : 'min-w-[1.85rem] h-6 text-[11px]';

  return (
    <span
      className={[
        'absolute top-2 right-3',
        'flex items-center justify-center',
        'rounded-full bg-[#fc4b08] text-white font-bold tabular-nums',
        'shadow-lg border border-white/80',
        'px-2',
        sizeClasses,
        className
      ].join(' ')}
      aria-label={`Pendientes Convenios: ${count}`}
      title={`Pendientes Convenios: ${count}`}
    >
      {count}
    </span>
  );
}

export default BadgeAgendaConvenios;
