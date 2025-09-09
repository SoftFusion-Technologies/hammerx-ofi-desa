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

      // 🔴 Ventas: usar contador del backend (solo pendientes)
      const ventasCountRes = await fetch(
        `${base}/ventas/agenda/hoy/count?${qs.toString()}`,
        { cache: 'no-store' }
      );
      const ventasCountJson = ventasCountRes.ok
        ? await ventasCountRes.json()
        : { count: 0 };
      const ventasPendientes = Number(ventasCountJson?.count ?? 0);

      // 🟡 Clases: traemos el listado de hoy y contamos solo las pendientes (n_contacto_2 = 0)
      const clasesRes = await fetch(
        `${base}/notifications/clases-prueba/${userId}`,
        { cache: 'no-store' }
      );
      const clasesArr = clasesRes.ok ? await clasesRes.json() : [];
      const clasesPendientes = Array.isArray(clasesArr)
        ? clasesArr.filter((n) => Number(n?.n_contacto_2) === 0).length
        : 0;

      setCount(ventasPendientes + clasesPendientes);
    } catch (err) {
      console.error('Badge count error:', err);
      setCount(0);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);

    // Permite refrescar el badge cuando se marcan realizados en otros componentes
    const onVentasUpdate = () => load();
    const onClasesUpdate = () => load();
    window.addEventListener('ventas-agenda-updated', onVentasUpdate);
    window.addEventListener('clases-prueba-updated', onClasesUpdate);

    return () => {
      clearInterval(id);
      window.removeEventListener('ventas-agenda-updated', onVentasUpdate);
      window.removeEventListener('clases-prueba-updated', onClasesUpdate);
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
      aria-label={`Agendas pendientes de hoy: ${count}`}
      title={`Agendas pendientes de hoy: ${count}`}
    >
      {count}
    </span>
  );
}

export default BadgeAgendaVentas;
