import React, { useState, useEffect } from 'react';

const HorariosDisponiblesModal = ({
  onClose,
  confirmar,
  horariosDisponiblesPilates = [],
  horarioInicial = null
}) => {
  const [selected, setSelected] = useState(horarioInicial);

  // Sincronizar selected si cambia horarioInicial
  useEffect(() => {
    setSelected(horarioInicial);
  }, [horarioInicial]);

  // Filtrar solo los horarios habilitados (tipo_bloqueo === false)
  const horariosHabilitados = horariosDisponiblesPilates.filter(
    (h) => h.tipo_bloqueo === false
  );

  // Agrupar por grupo
  const grupos = horariosHabilitados.reduce((acc, h) => {
    if (!acc[h.grp]) acc[h.grp] = [];
    acc[h.grp].push(h);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-2 backdrop-blur-[2px] sm:p-4">
      <div
        className="mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-orange-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,247,237,0.96)_100%)] shadow-[0_30px_90px_rgba(15,23,42,0.22)]"
        style={{
          maxHeight: 'calc(100vh - 32px)',
          margin: '16px',
          boxSizing: 'border-box'
        }}
      >
        <div className="flex-1 overflow-y-auto p-3 sm:p-6">
          {horariosDisponiblesPilates ? (
            <>
              <h2 className="mb-4 text-center font-bignoodle text-2xl font-semibold tracking-wide text-orange-600 sm:text-3xl">
                Seleccioná un horario disponible
              </h2>

              {Object.entries(grupos).map(([grupo, horarios]) => (
                <div
                  key={grupo}
                  className="mb-4 rounded-[22px] border border-orange-100/80 bg-white/90 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.05)] sm:p-4"
                >
                  <div className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-orange-500 sm:text-sm">
                    {horarios[0].grupo_label}
                  </div>

                  <div className="grid grid-cols-2 gap-2 xs:grid-cols-3 md:grid-cols-4">
                    {horarios.map((h) => {
                      const cupoDisponible =
                        h.cupo_por_clase - h.total_inscriptos;
                      const disabled = cupoDisponible <= 0;
                      const isSelected = selected === h.hhmm + ' ' + h.grp;

                      return (
                        <button
                          key={h.hhmm + h.grp}
                          disabled={disabled}
                          onClick={() => setSelected(h.hhmm + ' ' + h.grp)}
                          className={`flex flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-xs transition-all duration-200 sm:px-3 sm:py-3 sm:text-sm ${
                            isSelected
                              ? 'border-orange-500 bg-[linear-gradient(135deg,#ff8a1f_0%,#ff6a00_55%,#f25500_100%)] text-white shadow-[0_14px_30px_rgba(249,115,22,0.35)] ring-2 ring-orange-200'
                              : 'border-slate-200 bg-white text-slate-800 shadow-[0_6px_18px_rgba(15,23,42,0.05)] hover:-translate-y-[1px] hover:border-orange-300 hover:bg-orange-50 hover:shadow-[0_10px_24px_rgba(249,115,22,0.12)]'
                          } ${
                            disabled
                              ? 'cursor-not-allowed opacity-45 grayscale-[0.15] shadow-none hover:translate-y-0 hover:border-slate-200 hover:bg-white'
                              : ''
                          }`}
                        >
                          <span className="font-mono text-base font-semibold sm:text-lg">
                            {h.hhmm}
                          </span>

                          <span
                            className={`mt-1 text-[10px] sm:text-xs ${
                              isSelected ? 'text-white/90' : 'text-slate-500'
                            }`}
                          >
                            Quedan: {cupoDisponible > 0 ? cupoDisponible : 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="sticky bottom-0 z-20 mt-5 flex justify-end gap-3 border-t border-orange-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.72)_0%,rgba(255,247,237,0.98)_100%)] px-2 pb-2 pt-4 backdrop-blur-md">
                <button
                  onClick={onClose}
                  className="rounded-2xl border border-orange-200 bg-white px-5 py-2.5 text-xs font-semibold text-orange-700 shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-[1px] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-800 hover:shadow-[0_12px_28px_rgba(249,115,22,0.14)] active:translate-y-0 sm:text-sm"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => selected && confirmar(selected)}
                  disabled={!selected}
                  className="rounded-2xl border border-orange-500 bg-[linear-gradient(135deg,#ff8a1f_0%,#ff6a00_50%,#f25500_100%)] px-5 py-2.5 text-xs font-bold text-white shadow-[0_16px_34px_rgba(249,115,22,0.45)] ring-2 ring-orange-200 transition-all duration-200 hover:-translate-y-[1px] hover:brightness-110 hover:shadow-[0_20px_40px_rgba(249,115,22,0.58)] active:translate-y-0 disabled:cursor-not-allowed disabled:border-orange-200 disabled:bg-orange-200 disabled:text-white/80 disabled:shadow-none disabled:ring-0 sm:text-sm"
                >
                  Confirmar
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No hay horarios disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HorariosDisponiblesModal;
