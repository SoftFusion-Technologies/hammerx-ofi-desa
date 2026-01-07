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
  let fechaVencimientoCongelada = null;

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
    fechaVencimientoCongelada = fechaStr;
    return `${d}/${m}/${y}`;
  };

  const handleCongelar = async () => {
    confirmarCongelamiento(fechaVencimientoCongelada);
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

      {/* Opciones de días */}
      <div className="flex justify-center gap-4 mb-6">
        {[7, 14].map((op) => (
          <button
            key={op}
            onClick={() => setDias(op)}
            className={`px-5 py-2 rounded-xl font-bold border-2 transition-colors duration-200 text-lg focus:outline-none ${
              dias === op
                ? "bg-orange-600 border-orange-600 text-white shadow-lg"
                : "bg-white border-orange-200 text-orange-600 hover:bg-orange-50"
            }`}
            disabled={loading}
          >
            {op} días
          </button>
        ))}
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
