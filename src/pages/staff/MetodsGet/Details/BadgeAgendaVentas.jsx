import { useEffect, useState } from 'react';

function BadgeAgendaVentas({ userId, userLevel, size = 'lg', className = '' }) {
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const qs = new URLSearchParams();
      if (userLevel === 'admin') {
        qs.set('level', 'admin'); // admin: todas las sedes
      } else {
        qs.set('level', 'vendedor'); // vendedor: backend deduce sede por usuario
        qs.set('usuario_id', String(userId));
      }

      const base = 'http://localhost:8080';

      // Traemos VENTAS de hoy (todas: pendientes + realizadas)
      const ventasRes = await fetch(
        `${base}/ventas/agenda/hoy?${qs.toString()}`,
        { cache: 'no-store' }
      );
      const ventasArr = ventasRes.ok ? await ventasRes.json() : [];

      // Traemos CLASES de prueba de hoy
      const clasesRes = await fetch(
        `${base}/notifications/clases-prueba/${userId}`,
        { cache: 'no-store' }
      );
      const clasesArr = clasesRes.ok ? await clasesRes.json() : [];

      // 👇 Opción A: coincidir con el modal (todas las ventas, aunque estén done)
      const ventasCount = Array.isArray(ventasArr) ? ventasArr.length : 0;

      // 👉 Si preferís que descuente “Enviado”, usá esta línea en vez de la anterior:
      // const ventasCount = Array.isArray(ventasArr) ? ventasArr.filter(v => !v.done).length : 0;

      const clasesCount = Array.isArray(clasesArr) ? clasesArr.length : 0;

      setCount(ventasCount + clasesCount);
    } catch (err) {
      console.error('Badge count error:', err);
      setCount(0);
    }
  };

  useEffect(() => {
    load();
    // refresco periódico
    const id = setInterval(load, 60_000);
    // refresco instantáneo cuando otra parte del UI emita el evento
    const onExternalUpdate = () => load();
    window.addEventListener('ventas-agenda-updated', onExternalUpdate);

    return () => {
      clearInterval(id);
      window.removeEventListener('ventas-agenda-updated', onExternalUpdate);
    };
  }, [userId, userLevel]);

  const sizes = {
    lg: 'text-[20px] lg:text-[28px] px-3.5 py-2 lg:px-4 lg:py-2.5',
    xl: 'text-[24px] lg:text-[32px] px-4 py-2.5 lg:px-5 lg:py-3'
  };

  return (
    <span
      className={[
        'absolute top-0 right-0 translate-x-1/3 -translate-y-1/3',
        'bg-red-500 text-white rounded-full font-extrabold tabular-nums',
        'shadow-2xl ring-4 ring-white select-none pointer-events-none',
        sizes[size] ?? sizes.lg,
        className
      ].join(' ')}
      aria-label={`Agenda de ventas: ${count} pendientes`}
      title={`Agenda de ventas: ${count} pendientes`}
    >
      {count}
    </span>
  );
}

export default BadgeAgendaVentas;
