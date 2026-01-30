/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Muestra un botón de ayuda con popover informativo.
 */

import { useEffect, useRef, useState } from "react";
const AyudaInfo = ({ texto, className = "", align = "right" }) => {
  const [abierto, setAbierto] = useState(false);
  const [offsetX, setOffsetX] = useState(0);
  const rootRef = useRef(null);
  const popoverRef = useRef(null);

  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };

    const onPointerDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setAbierto(false);
    };

    // Ajustar posición si se sale de la pantalla
    const adjustPopover = () => {
      if (!popoverRef.current) return;
      const rect = popoverRef.current.getBoundingClientRect();
      let newOffset = 0;
      if (rect.left < 8) {
        newOffset = 8 - rect.left;
      } else if (rect.right > window.innerWidth - 8) {
        newOffset = window.innerWidth - 8 - rect.right;
      }
      setOffsetX(newOffset);
    };

    setOffsetX(0);

    const raf = requestAnimationFrame(() => {
      adjustPopover();
    });

    let tries = 0;
    const interval = setInterval(() => {
      adjustPopover();
      tries++;
      if (tries > 8) clearInterval(interval); // ~240ms
    }, 30);

    let ro;
    if (typeof ResizeObserver !== "undefined" && popoverRef.current) {
      ro = new ResizeObserver(() => {
        adjustPopover();
      });
      ro.observe(popoverRef.current);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", adjustPopover);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      if (ro) ro.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", adjustPopover);
    };
  }, [abierto]);

  if (!texto) return null;

  // Centrar el popover debajo del icono "?"
  const popoverAlignClass = "left-1/2 -translate-x-1/2 origin-top";

  return (
    <span ref={rootRef} className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Ayuda"
        title="Ver ayuda"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-orange-400 bg-white text-sm font-black text-orange-700 shadow-lg ring-2 ring-orange-200/70 transition-transform hover:scale-105 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        ?
      </button>

      {abierto && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="Información"
          style={{ transform: `translateX(-50%) translateX(${offsetX}px)` }}
          className={`absolute top-9 ${popoverAlignClass} z-50 w-[320px] md:w-[500px] xl:w-[600px] rounded-xl border border-black/10 bg-white p-3 text-sm text-gray-700 shadow-xl transition-transform`}
        >
          <div className="flex items-start justify-between gap-2">
            {typeof texto === "string" ? (
              /<\w|<br\s*\/?|<span\b|<div\b|<p\b|<strong\b|<em\b|<ul\b|<ol\b|<li\b|<h[1-6]\b/i.test(
                texto,
              ) ? (
                <div
                  className="leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: texto }}
                />
              ) : (
                <div className="leading-relaxed">{texto}</div>
              )
            ) : (
              <div className="leading-relaxed">{texto}</div>
            )}
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="ml-2 rounded-md px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </span>
  );
};

export default AyudaInfo;
