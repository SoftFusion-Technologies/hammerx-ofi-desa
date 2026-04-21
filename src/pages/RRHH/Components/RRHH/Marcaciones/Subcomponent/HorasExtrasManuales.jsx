import React from "react";
import { FaPlusCircle } from "react-icons/fa";
import {
  calcularMinutosGestion,
  desglosarMinutosGestion,
} from "../../../../Utils/tiempoManualHelper.js";

const HorasExtrasManuales = ({
  mostrarExtras,
  setMostrarExtras,
  horasPendientes,
  minutosPendientes,
  horasAutorizadas,
  setHorasAutorizadas,
  minutosAutorizadas,
  setMinutosAutorizadas,
  minutosPendientesIniciales = 0,
  minutosAutorizadosIniciales = 0,
  mostrarBadgePendientes = true,
  mostrarResumen = true,
  bloquearToggleExtras = false,
  etiquetaHorasAutorizadas = "Horas a Autorizar",
  helperText = "",
}) => {
  const mPendientes = Number(horasPendientes) * 60 + Number(minutosPendientes);
  const mAutorizadas = calcularMinutosGestion(
    horasAutorizadas,
    minutosAutorizadas === 30,
  );
  const mNoAutorizados = Math.max(0, mPendientes - mAutorizadas);

  const manejarToggleExtras = (checked) => {
    if (bloquearToggleExtras && !checked) return;
    setMostrarExtras(checked);
    if (checked) {
      const a = desglosarMinutosGestion(minutosAutorizadosIniciales);
      setHorasAutorizadas(a.horas);
      setMinutosAutorizadas(a.tieneMediaHora ? 30 : 0);
    }
  };

  const fmt = (m) =>
    String(Math.floor(m / 60)) + (m % 60 >= 30 ? ".5" : "") + " hs";

  return (
    <div className="relative overflow-hidden rounded-xl border border-amber-200/80 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-2 shadow-[0_6px_20px_-14px_rgba(180,83,9,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_45%)]" />

      <div className="relative flex flex-wrap items-center justify-between gap-1.5 pb-1">
        <label className="flex cursor-pointer items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-amber-900 sm:text-[11px]">
          <input
            type="checkbox"
            checked={mostrarExtras}
            onChange={(e) => manejarToggleExtras(e.target.checked)}
            disabled={bloquearToggleExtras}
            className="h-3.5 w-3.5 rounded border-amber-300 text-orange-600 focus:ring-1 focus:ring-orange-500"
          />
          <span className="inline-flex items-center gap-1">
            <FaPlusCircle size={10} className="text-orange-500" />
            Añadir horas extras
          </span>
        </label>
        {mostrarBadgePendientes && (
          <span className="rounded-full border border-amber-200 bg-white/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-700 sm:text-[10px]">
            Registradas: {Math.floor(mPendientes / 60)}h {mPendientes % 60}m
          </span>
        )}
      </div>

      {mostrarExtras && (
        <div className="relative mt-1.5 space-y-1.5 border-t border-amber-200/80 pt-1.5">
          <div className="rounded-lg border border-amber-200/90 bg-white/85 p-1.5 backdrop-blur-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-extrabold uppercase tracking-wide text-amber-500">
                    Horas
                  </span>
                  <div className="rounded-md border border-amber-300 bg-amber-50/70">
                    <input
                      type="number"
                      step="1"
                      value={horasAutorizadas}
                      onChange={(e) =>
                        setHorasAutorizadas(
                          Math.max(0, Math.floor(e.target.value)),
                        )
                      }
                      className="w-14 rounded-md border-0 bg-transparent px-1 py-1 text-center text-sm font-black text-amber-900 outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer select-none rounded-md border border-amber-200 bg-amber-50/70 px-1.5 py-1 transition-colors hover:bg-amber-100">
                  <input
                    type="checkbox"
                    checked={minutosAutorizadas === 30}
                    onChange={(e) =>
                      setMinutosAutorizadas(e.target.checked ? 30 : 0)
                    }
                    className="h-3.5 w-3.5 rounded border-amber-400 text-amber-600"
                  />
                  <span className="text-[10px] font-extrabold text-amber-800">
                    + .5
                  </span>
                </label>
              </div>

              <span className="text-[9px] font-black italic uppercase tracking-wide text-amber-700/70 sm:text-[10px]">
                {etiquetaHorasAutorizadas}
              </span>
            </div>
          </div>

          {mostrarResumen && (
            <div className="grid grid-cols-1 gap-1 text-[10px]">
              <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/80 px-1.5 py-1">
                <span className="font-extrabold uppercase tracking-wide text-emerald-700">
                  Pagar
                </span>
                <span className="font-black text-emerald-800">
                  {fmt(mAutorizadas)}
                </span>
              </div>
            </div>
          )}

          {helperText && (
            <p className="rounded-md border border-amber-200/80 bg-amber-50/70 px-1.5 py-1 text-[9px] font-semibold italic text-amber-600">
              {helperText}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default HorasExtrasManuales;
