import React, { useState, useMemo } from "react";
import { MdArrowBack } from "react-icons/md";
import { IoClose } from "react-icons/io5";

const CongelarPlanAlumno = ({
  fechaVencimientoActual,
  volver,
  cerrar,
  nombreCliente,
  confirmarCongelamiento,
}) => {
  const [dias, setDias] = useState(7);
  const [loading, setLoading] = useState(false);

  // Calcula la nueva fecha de vencimiento sumando los días seleccionados
  const nuevaFecha = useMemo(() => {
    if (!fechaVencimientoActual) return "";
    const fecha = new Date(fechaVencimientoActual);
    fecha.setDate(fecha.getDate() + dias);
    return fecha.toISOString().slice(0, 10);
  }, [fechaVencimientoActual, dias]);

  // Formatea fecha a DD/MM/YYYY
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "";
    const [y, m, d] = fechaStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const handleCongelar = async () => {
    try {
      setLoading(true);
      await confirmarCongelamiento(nuevaFecha);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-3xl border border-orange-100 mx-auto mt-8">
      <div className="flex justify-between items-center mb-2">
        <button
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
          onClick={volver}
        >
          <MdArrowBack className="text-lg" />
          <span>Volver</span>
        </button>
                  <button
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
                    onClick={cerrar}
                  >
                    <IoClose className="text-lg" />
                    <span>Cerrar</span>
                  </button>
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
          Congelar plan
        </div>
        <h2 className="text-2xl md:text-3xl font-bignoodle text-gray-900 font-semibold mb-2">
          Congelar el plan de {nombreCliente || "el alumno"}
        </h2>
        <p className="text-gray-600 font-bold max-w-xl mx-auto">
          Se puede congelar el plan de el alumno por vacaciones o motivos
          personales. El vencimiento se extenderá según el tiempo seleccionado.
        </p>
      </div>

      {/* Selector interactivo de días (7-14) */}
      <div className="mb-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">Días:</span>
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-bold">
              {dias} días
            </span>
          </div>
          <input
            type="range"
            min={7}
            max={14}
            step={1}
            value={dias}
            onChange={(e) => setDias(Number(e.target.value))}
            disabled={loading}
            className="w-full max-w-md accent-orange-600"
          />
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 w-full max-w-md mt-2">
            {[7, 8, 9, 10, 11, 12, 13, 14].map((op) => (
              <button
                key={op}
                onClick={() => setDias(op)}
                disabled={loading}
                className={`px-3 py-1 rounded-lg text-sm font-bold border transition-colors duration-200 ${
                  dias === op
                    ? "bg-orange-600 border-orange-600 text-white shadow"
                    : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
                }`}
              >
                {op}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fechas antes y después */}
      <div className="bg-orange-50 rounded-xl p-4 mb-6 flex flex-col items-center">
        <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
          <div className="text-center">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">
              Vencimiento actual
            </div>
            <div className="text-lg font-bignoodle text-gray-900">
              {formatearFecha(fechaVencimientoActual)}
            </div>
          </div>
          <span className="text-orange-600 font-bold text-2xl">→</span>
          <div className="text-center">
            <div className="text-xs text-gray-500 font-bold uppercase mb-1">
              Vencimiento con congelamiento
            </div>
            <div className="text-lg font-bignoodle text-orange-600">
              {formatearFecha(nuevaFecha)}
            </div>
          </div>
        </div>
        <div className="mt-3 text-xs font-semibold text-orange-700 text-center">
          Checkea vencimiento con socio plus
        </div>
      </div>

      {/* Nota */}
      <div className="text-xs text-gray-500 mb-6 text-center">
        <span className="font-bold text-orange-600">Nota:</span> Este proceso se registra como una modificación personalizada en la duración del plan del alumno.
      </div>

      {/* Botón congelar */}
      <button
        onClick={handleCongelar}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
          loading
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-600/20"
        }`}
      >
        {loading ? "Procesando..." : `Congelar por ${dias} días`}
      </button>
    </div>
  );
};

export default CongelarPlanAlumno;
