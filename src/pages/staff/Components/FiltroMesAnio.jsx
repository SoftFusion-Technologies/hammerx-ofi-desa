import React, { useState, useEffect } from 'react';

const FiltroMesAnio = ({ mes, setMes, anio, setAnio }) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // Mes 1-12
  const currentYear = currentDate.getFullYear();

  // Al montar, si mes o anio no están definidos, se asigna el actual
  useEffect(() => {
    if (!mes) setMes(currentMonth);
    if (!anio) setAnio(currentYear);
  }, []);

  const handleReset = () => {
    setMes(currentMonth);
    setAnio(currentYear);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-4">
      <select
        value={mes}
        onChange={(e) => setMes(Number(e.target.value))}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-transparent transition"
      >
        {[...Array(12).keys()].map((m) => (
          <option key={m + 1} value={m + 1}>
            {new Date(0, m).toLocaleString('es-AR', { month: 'long' })}
          </option>
        ))}
      </select>

      <select
        value={anio}
        onChange={(e) => setAnio(Number(e.target.value))}
        className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-transparent transition"
      >
        {Array(5)
          .fill(0)
          .map((_, i) => {
            const year = currentYear - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
      </select>

      <button
        onClick={handleReset}
        className="ml-2 px-4 py-2 bg-[#fc4b08] text-white rounded-md hover:bg-orange-600 transition"
        title="Volver al mes y año actual"
      >
        Hoy
      </button>
    </div>
  );
};

export default FiltroMesAnio;
