import { useEffect, useState } from 'react';

function BadgeAgendaVentas({ userId, userLevel, size = 'lg', className = '' }) {
  const [count, setCount] = useState(0);

  const load = async () => {
    const qs = new URLSearchParams();
    if (userLevel === 'admin') qs.set('level', 'admin');
    else {
      qs.set('level', 'user');
      qs.set('usuario_id', String(userId));
    }

    const r = await fetch(
      `http://localhost:8080/ventas/agenda/hoy/count?${qs.toString()}`
    );
    const d = await r.json();
    setCount(d?.count ?? 0);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [userId, userLevel]);
  if (!count) return null;

  const sizes = {
    lg: 'text-[20px] lg:text-[28px] px-3.5 py-2 lg:px-4 lg:py-2.5',
    xl: 'text-[24px] lg:text-[32px] px-4 py-2.5 lg:px-5 lg:py-3'
  };

  return (
    <span
      className={[
        // posición “en el borde” (mitad adentro/afuera del cuadro)
        'absolute top-0 right-0 translate-x-1/3 -translate-y-1/3',
        // estilo
        'bg-red-500 text-white rounded-full font-extrabold tabular-nums',
        'shadow-2xl ring-4 ring-white select-none pointer-events-none',
        sizes[size] ?? sizes.lg,
        className
      ].join(' ')}
      aria-label={`Agenda de ventas: ${count} pendientes`}
    >
      {count}
    </span>
  );
}

export default BadgeAgendaVentas;
