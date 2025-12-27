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

  // Agrupar por grupo
  const grupos = horariosDisponiblesPilates.reduce((acc, h) => {
    if (!acc[h.grp]) acc[h.grp] = [];
    acc[h.grp].push(h);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-2 sm:p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl mx-auto flex flex-col"
        style={{
          maxHeight: 'calc(100vh - 32px)',
          margin: '16px',
          overflowY: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="p-3 sm:p-6 flex-1 flex flex-col">
          {horariosDisponiblesPilates ? (
            <>
              <h2 className="text-base sm:text-xl font-semibold mb-4 text-orange-600 text-center">
                Seleccioná un horario disponible
              </h2>
              {Object.entries(grupos).map(([grupo, horarios]) => (
                <div key={grupo} className="mb-4">
                  <div className="font-bold text-gray-700 mb-2 text-xs sm:text-sm">
                    {horarios[0].grupo_label}
                  </div>
                  <div className="grid grid-cols-2 xs:grid-cols-3 md:grid-cols-4 gap-2">
                    {horarios.map((h) => {
                      const cupoDisponible =
                        h.cupo_por_clase - h.total_inscriptos;
                      const disabled = cupoDisponible <= 0;
                      return (
                        <button
                          key={h.hhmm + h.grp}
                          className={`border rounded px-2 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm flex flex-col items-center justify-center transition
                        ${
                          selected === h.hhmm + ' ' + h.grp
                            ? '!bg-orange-600 text-black font-semibold border-orange-600'
                            : 'bg-white text-gray-800 border-gray-300'
                        }
                        ${
                          disabled
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-orange-50 hover:border-orange-400'
                        }
                      `}
                          disabled={disabled}
                          onClick={() => setSelected(h.hhmm + ' ' + h.grp)}
                        >
                          <span className="font-mono text-base sm:text-lg">
                            {h.hhmm}
                          </span>
                          <span className="text-[10px] sm:text-xs mt-1">
                            Quedan: {cupoDisponible > 0 ? cupoDisponible : 0}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex justify-end gap-3 mt-5 sticky bottom-0 bg-white pt-3 pb-1 z-10">
                <button
                  onClick={onClose}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded text-xs sm:text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => selected && confirmar(selected)}
                  className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60 text-xs sm:text-sm"
                  disabled={!selected}
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
