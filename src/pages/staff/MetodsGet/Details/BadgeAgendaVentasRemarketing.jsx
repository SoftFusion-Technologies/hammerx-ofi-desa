// src/Pages/Staff/MetodsGet/Details/BadgeAgendaVentas.jsx
import { useEffect, useState } from 'react';

function BadgeAgendaVentasRemarketing({ userId, userLevel, size = 'lg', className = '' }) {
  const [count, setCount] = useState(0);

  const load = async () => {
    try {
      const qs = new URLSearchParams();
      const nivel = String(userLevel || '').toLowerCase();

      if (
        nivel === 'admin' ||
        nivel === 'administrador' ||
        nivel === 'gerente'
      ) {
        qs.set('level', 'admin'); // ve todo
      } else {
        qs.set('level', 'vendedor'); // backend deduce sede por usuario
        qs.set('usuario_id', String(userId));
      }

      const base = 'http://localhost:8080';

      // 🔹 Ventas: contador directo del backend
      const ventasCountRes = await fetch(
        `${base}/ventas-remarketing/agenda/hoy/count?${qs.toString()}`,
        { cache: 'no-store' }
      );
      const ventasCountJson = ventasCountRes.ok
        ? await ventasCountRes.json()
        : { count: 0 };
      const ventasPendientes = Number(ventasCountJson?.count ?? 0);

      // 🔹 Clases prueba: solo pendientes (n_contacto_2 = 0)
      const clasesRes = await fetch(
        `${base}/notifications/clases-prueba-remarketing/${userId}`,
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

  // ⚠️ Ocultamos el badge si no hay pendientes
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  const sizeClasses =
    size === 'xl'
      ? 'min-w-[2.2rem] h-8 text-[14px]'
      : 'min-w-[2rem] h-7 text-[12px]';

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
      aria-label={`Agendas pendientes de hoy: ${count}`}
      title={`Agendas pendientes de hoy: ${count}`}
    >
      {count}
    </span>
  );
}

export default BadgeAgendaVentasRemarketing;
