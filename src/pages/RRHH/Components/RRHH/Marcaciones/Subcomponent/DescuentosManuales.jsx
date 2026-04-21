import React from "react";
import { FaMinusCircle } from "react-icons/fa";
import {
  calcularMinutosGestion,
  desglosarMinutosGestion,
} from "../../../../Utils/tiempoManualHelper.js";

const DescuentosManuales = ({
  mostrarDescuentos,
  setMostrarDescuentos,
  horasDescuento,
  setHorasDescuento,
  minutosDescuento,
  setMinutosDescuento,
  minutosDescuentoIniciales = 0,
  mostrarBadgeTotal = true,
  helperText = "",
}) => {
  const mTotal = calcularMinutosGestion(
    horasDescuento,
    minutosDescuento === 30,
  );

  const manejarToggle = (checked) => {
    setMostrarDescuentos(checked);
    if (checked) {
      const d = desglosarMinutosGestion(minutosDescuentoIniciales);
      setHorasDescuento(d.horas);
      setMinutosDescuento(d.tieneMediaHora ? 30 : 0);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-red-50 to-white p-2 shadow-[0_6px_20px_-14px_rgba(190,24,93,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(225,29,72,0.12),transparent_45%)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-1.5 pb-1">
        <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-rose-900 sm:text-[11px]">
          <input
            type="checkbox"
            checked={mostrarDescuentos}
            onChange={(e) => manejarToggle(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-rose-300 text-rose-600 focus:ring-1 focus:ring-rose-500"
          />
          <span className="flex items-center gap-1">
            <FaMinusCircle size={10} className="text-rose-500" />
            Descuento manuales
          </span>
        </label>
        {mostrarBadgeTotal && (
          <span className="rounded-full border border-rose-200 bg-white/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-rose-700 sm:text-[10px]">
            TOTAL: {Math.floor(mTotal / 60)}
            {mTotal % 60 >= 30 ? ".5" : ""} hs
          </span>
        )}
      </div>

      {mostrarDescuentos && (
        <div className="relative mt-1.5 border-t border-rose-200/80 pt-1.5">
          <div className="rounded-lg border border-rose-200/90 bg-white/85 p-1.5 backdrop-blur-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-rose-500">
                    Horas
                  </span>
                  <div className="rounded-md border border-rose-300 bg-rose-50/70">
                    <input
                      type="number"
                      step="1"
                      value={horasDescuento}
                      onChange={(e) =>
                        setHorasDescuento(
                          Math.max(0, Math.floor(e.target.value)),
                        )
                      }
                      className="w-14 rounded-md border-0 bg-transparent px-1 py-1 text-center text-sm font-black text-rose-900 outline-none focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none rounded-md border border-rose-200 bg-rose-50/70 px-1.5 py-1 transition-colors hover:bg-rose-100">
                  <input
                    type="checkbox"
                    checked={minutosDescuento === 30}
                    onChange={(e) =>
                      setMinutosDescuento(e.target.checked ? 30 : 0)
                    }
                    className="h-3.5 w-3.5 rounded border-rose-400 text-rose-600"
                  />
                  <span className="text-[10px] font-extrabold text-rose-800">
                    + .5
                  </span>
                </label>
              </div>
            </div>
          </div>

          {helperText && (
            <p className="mt-1.5 rounded-md border border-rose-200/80 bg-rose-50/70 px-1.5 py-1 text-[9px] font-semibold italic text-rose-600">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DescuentosManuales;
