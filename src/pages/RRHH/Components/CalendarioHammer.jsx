/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de calendario interactivo que sincroniza y visualiza los feriados nacionales de Argentina mediante una API externa. Permite la navegación mensual, destaca los días no laborables con indicadores visuales y ofrece un desglose detallado (nombre y tipo de feriado) al seleccionar una fecha específica, facilitando la planificación operativa del sistema.
*/

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaInfoCircle,
} from "react-icons/fa";

const CalendarioHammer = ({ alVolver = null }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  const [feriados, setFeriados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerFeriados = async () => {
      setCargando(true);
      setError("");

      try {
        const respuesta = await axios.get(
          "https://api.argentinadatos.com/v1/feriados/2026",
        );
        setFeriados(Array.isArray(respuesta.data) ? respuesta.data : []);
      } catch (err) {
        setError("No se pudieron cargar los feriados. Intentá nuevamente.");
      } finally {
        setCargando(false);
      }
    };

    obtenerFeriados();
  }, []);

  const feriadosMap = useMemo(() => {
    const mapa = new Map();
    feriados.forEach((feriado) => {
      mapa.set(feriado.fecha, feriado);
    });
    return mapa;
  }, [feriados]);

  const totalFeriadosMes = useMemo(() => {
    return feriados.filter((feriado) => {
      const fechaFeriado = parseISO(feriado.fecha);
      return isSameMonth(fechaFeriado, fechaActual);
    }).length;
  }, [feriados, fechaActual]);

  const feriadoSeleccionado = useMemo(() => {
    const clave = format(diaSeleccionado, "yyyy-MM-dd");
    return feriadosMap.get(clave) || null;
  }, [diaSeleccionado, feriadosMap]);

  const mesAnterior = () => setFechaActual((prev) => subMonths(prev, 1));
  const mesSiguiente = () => setFechaActual((prev) => addMonths(prev, 1));

  const renderDiasSemana = () => {
    const inicioSemana = startOfWeek(fechaActual, { weekStartsOn: 1 });
    const nombres = [];

    for (let indice = 0; indice < 7; indice++) {
      nombres.push(
        <div
          key={indice}
          className="col-span-1 text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider"
        >
          {format(addDays(inicioSemana, indice), "EEE", { locale: es })}
        </div>,
      );
    }

    return <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">{nombres}</div>;
  };

  const renderCeldas = () => {
    const inicioMes = startOfMonth(fechaActual);
    const finMes = endOfMonth(inicioMes);
    const inicioCalendario = startOfWeek(inicioMes, { weekStartsOn: 1 });
    const finCalendario = endOfWeek(finMes, { weekStartsOn: 1 });

    const filas = [];
    let dias = [];
    let dia = inicioCalendario;

    while (dia <= finCalendario) {
      for (let indice = 0; indice < 7; indice++) {
        const diaActual = dia;
        const fechaIso = format(diaActual, "yyyy-MM-dd");
        const feriado = feriadosMap.get(fechaIso);
        const esMismoMes = isSameMonth(diaActual, inicioMes);
        const esSeleccionado = isSameDay(diaActual, diaSeleccionado);

        dias.push(
          <button
            type="button"
            key={fechaIso}
            onClick={() => setDiaSeleccionado(diaActual)}
            className={`relative h-16 md:h-24 border border-gray-100 px-1 md:px-2 py-1 text-left transition-all
              ${!esMismoMes ? "bg-gray-50 text-gray-300" : "bg-white text-gray-700"}
              ${esSeleccionado ? "ring-2 ring-inset ring-orange-500 bg-orange-50" : "hover:bg-gray-50"}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-bold">{format(diaActual, "d")}</span>
              {feriado && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </div>

            {feriado && (
              <div className="mt-1 md:mt-2">
                <span className="hidden md:block text-[10px] bg-red-50 text-red-600 border border-red-100 rounded px-1 py-0.5 truncate">
                  {feriado.nombre}
                </span>
              </div>
            )}
          </button>,
        );

        dia = addDays(dia, 1);
      }

      filas.push(
        <div className="grid grid-cols-7" key={format(addDays(dia, -1), "yyyy-MM-dd") + "-row"}>
          {dias}
        </div>,
      );
      dias = [];
    }

    return <div className="bg-white rounded-b-lg shadow-sm">{filas}</div>;
  };

  return (
    <div className="w-full font-messina animate-fade-in-up">
      {alVolver && (
        <div className="mb-4">
          <button
            onClick={alVolver}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <div className="bg-orange-100 p-3 rounded-2xl text-orange-600">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bignoodle text-gray-800 leading-none">
              CALENDARIO DE FERIADOS 2026
            </h2>
            <p className="text-sm text-gray-500">Argentina - feriados nacionales</p>
          </div>
        </div>

        <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1">
          <button
            onClick={mesAnterior}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <FaChevronLeft />
          </button>
          <h3 className="px-4 md:px-6 font-bignoodle text-xl md:text-2xl text-gray-800 min-w-[170px] text-center pt-1">
            {format(fechaActual, "MMMM yyyy", { locale: es }).toUpperCase()}
          </h3>
          <button
            onClick={mesSiguiente}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className="bg-orange-600 text-white px-5 py-2 rounded-2xl shadow-md w-full md:w-auto text-center">
          <span className="text-xs text-orange-200 font-medium">FERIADOS DEL MES</span>
          <div className="text-2xl font-bignoodle leading-none mt-1">{totalFeriadosMes}</div>
        </div>
      </div>

      {cargando ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
          Cargando feriados...
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
          {error}
        </div>
      ) : (
        <>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {renderDiasSemana()}
            {renderCeldas()}
          </div>

          <div className="mt-6 bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-500 animate-fade-in-up">
            <h4 className="font-bignoodle text-xl text-gray-800 flex items-center gap-2">
              <FaInfoCircle className="text-orange-500" />
              DETALLE DEL {format(diaSeleccionado, "dd 'de' MMMM", { locale: es }).toUpperCase()}
            </h4>

            {!feriadoSeleccionado ? (
              <p className="text-sm text-gray-400 mt-2 italic">No hay feriado para este día.</p>
            ) : (
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1">
                <p className="text-sm text-gray-800 font-semibold">{feriadoSeleccionado.nombre}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Tipo: {feriadoSeleccionado.tipo}
                </p>
                <p className="text-xs text-gray-500">
                  Fecha: {format(parseISO(feriadoSeleccionado.fecha), "dd/MM/yyyy")}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CalendarioHammer;