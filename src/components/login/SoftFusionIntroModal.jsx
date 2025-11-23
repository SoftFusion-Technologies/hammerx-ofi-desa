// SoftFusionIntroModal.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import IntroModal from './IntroModal.jsx';

// 👇 Este componente se usa DESPUÉS del login
// <SoftFusionIntroModal onFinish={() => navigate('/dashboard')} />
export default function SoftFusionIntroModal({ onFinish }) {
  // El modal arranca abierto siempre que llegamos acá
  const [open, setOpen] = useState(true);

  // Cuando el modal se cierra (solo o por click), llamamos onFinish
  useEffect(() => {
    if (!open) return;
    // NO ponemos timer acá, eso ya lo maneja IntroModal con su barra
    // Solo miramos el cambio open -> false
  }, [open]);

  // En cuanto open pase a false, llamamos onFinish una sola vez
  useEffect(() => {
    if (!open) {
      onFinish?.(); // esto hará navigate(postLoginRoute) en LoginForm
    }
  }, [open, onFinish]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Fondo animado */}
      <ParticlesBackgroundCanvas />

      {/* Halo/Glow decorativo */}
      <div className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(50%_50%_at_50%_50%,#0000,black)]">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, rgba(139,92,246,.35), rgba(14,165,233,.35), rgba(10, 78, 121, 0.35), rgba(92, 236, 246, 0.35))'
          }}
        />
      </div>

      {/* Contenido centrado: sólo mostramos TU IntroModal */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <IntroModal
          open={open}
          onClose={() => {
            // cuando IntroModal se autocierra o se cierra por click,
            // ponemos open=false → dispara el useEffect de arriba
            setOpen(false);
          }}
        />
      </div>
    </div>
  );
}

/**
 * Canvas de partículas minimalista (el mismo que ya tenías)
 */
function ParticlesBackgroundCanvas() {
  const canvasRef = useRef(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const cfg = useMemo(
    () => ({
      count: 130,
      maxSpeed: 0.45,
      linkDist: 120,
      hueBase: 500
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0,
      h = 0,
      raf;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onResize = () => resize();
    resize();
    window.addEventListener('resize', onResize);

    // Partículas
    const P = [];
    for (let i = 0; i < cfg.count; i++) {
      P.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.maxSpeed,
        vy: (Math.random() - 0.5) * cfg.maxSpeed,
        r: Math.random() * 1.2 + 0.3
      });
    }

    const loop = () => {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);

      // Fondo sutil con gradiente radial
      const grd = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7
      );
      grd.addColorStop(0, 'rgba(10,10,14,0.8)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Actualizar & dibujar
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }

      // Líneas
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const dx = P[i].x - P[j].x;
          const dy = P[i].y - P[j].y;
          const d = Math.hypot(dx, dy);
          if (d < cfg.linkDist) {
            const a = 1 - d / cfg.linkDist;
            ctx.strokeStyle = `hsla(${
              cfg.hueBase + (dx + dy) * 0.02
            }, 85%, 65%, ${a * 0.35})`;
            ctx.lineWidth = a * 1.2;
            ctx.beginPath();
            ctx.moveTo(P[i].x, P[i].y);
            ctx.lineTo(P[j].x, P[j].y);
            ctx.stroke();
          }
        }
      }

      // Puntos
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        ctx.fillStyle = `hsla(${
          cfg.hueBase + (p.x + p.y) * 0.02
        }, 85%, 68%, 0.9)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [cfg, dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full bg-black/100"
      aria-hidden
    />
  );
}
