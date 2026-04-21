import React from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Calendario = ({
  fechaActual,
  setFechaActual,
  diaSeleccionado,
  onDateClick,
  renderContenidoCelda,
  puedeIrAtras = true,
  puedeIrAdelante = true,
}) => {
  const mesAnterior = () => {
    if (!puedeIrAtras) return;
    setFechaActual(subMonths(fechaActual, 1));
  };

  const mesSiguiente = () => {
    if (!puedeIrAdelante) return;
    setFechaActual(addMonths(fechaActual, 1));
  };

  // 🔹 HEADER estilo Historial
  const renderHeader = () => (
    <div className="flex items-center justify-between bg-white rounded-full shadow-sm border border-gray-200 p-1 mb-3">
      <button
        onClick={mesAnterior}
        disabled={!puedeIrAtras}
        className={`p-2 rounded-full transition ${
          !puedeIrAtras
            ? "text-gray-300 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <FaChevronLeft />
      </button>

      <h2 className="px-6 font-bignoodle text-xl text-gray-800 min-w-[180px] text-center pt-1">
        {format(fechaActual, "MMMM yyyy", { locale: es }).toUpperCase()}
      </h2>

      <button
        onClick={mesSiguiente}
        disabled={!puedeIrAdelante}
        className={`p-2 rounded-full transition ${
          !puedeIrAdelante
            ? "text-gray-300 cursor-not-allowed"
            : "hover:bg-gray-100 text-gray-600"
        }`}
      >
        <FaChevronRight />
      </button>
    </div>
  );

  // 🔹 DIAS SEMANA estilo igual
  const renderDiasSemana = () => {
    const days = [];
    let startDate = startOfWeek(fechaActual, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          key={i}
          className="text-center py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#F9FAFB]"
        >
          {format(addDays(startDate, i), "EEE", { locale: es })}
        </div>
      );
    }

    return <div className="grid grid-cols-7 border-b border-gray-100">{days}</div>;
  };

  // 🔹 CELDAS con estilo moderno
  const renderCeldas = () => {
    const mesInicio = startOfMonth(fechaActual);
    const mesFin = endOfMonth(mesInicio);
    const inicio = startOfWeek(mesInicio, { weekStartsOn: 1 });
    const fin = endOfWeek(mesFin, { weekStartsOn: 1 });

    let day = inicio;
    const rows = [];

    while (day <= fin) {
      const dias = [];

      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const esMismoMes = isSameMonth(day, mesInicio);
        const esSeleccionado = isSameDay(day, diaSeleccionado);

        dias.push(
          <div
            key={day}
            onClick={() => onDateClick(cloneDay)}
            className={`relative flex flex-col items-center justify-start h-16 lg:h-24 border-[0.5px] border-gray-100 transition-all cursor-pointer
              
              ${!esMismoMes ? "bg-gray-50 text-gray-300" : "bg-white"}
              
              ${
                esSeleccionado
                  ? "ring-2 ring-inset ring-orange-500 z-10"
                  : "hover:bg-gray-50"
              }
            `}
          >
            {/* DIA */}
            <span
              className={`text-[10px] lg:text-[11px] font-bold mt-1 ${
                !esMismoMes ? "text-gray-200" : "text-gray-500"
              }`}
            >
              {format(day, "d")}
            </span>

            {/* CONTENIDO */}
            <div className="flex-1 flex items-center justify-center w-full px-1">
              {renderContenidoCelda?.(cloneDay)}
            </div>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {dias}
        </div>
      );
    }

    return (
      <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
        {rows}
      </div>
    );
  };

  return (
    <div className="w-full font-messina animate-fade-in-up">
      {renderHeader()}

      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {renderDiasSemana()}
        {renderCeldas()}
      </div>
    </div>
  );
};

export default Calendario;