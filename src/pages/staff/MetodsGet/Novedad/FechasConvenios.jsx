/*
 * Programador: Benjamin Orellana
 * Fecha de Creación: 29 / 09 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (FechasConvenios.jsx) es el componente encargado de gestionar y mostrar
 * las fechas relacionadas con los convenios existentes. Permite a los usuarios ver y
 * seleccionar fechas para la creación, actualización y visualización de convenios.
 *
 * El componente se comunica con `IntegranteConveGet` y `FormAltaConve` para sincronizar
 * la selección de fechas y actualizar los datos de los convenios según las fechas elegidas.
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useMemo } from 'react';

// Array con los nombres de los meses
const monthNames = [
  'ENERO',
  'FEBRERO',
  'MARZO',
  'ABRIL',
  'MAYO',
  'JUNIO',
  'JULIO',
  'AGOSTO',
  'SEPTIEMBRE',
  'OCTUBRE',
  'NOVIEMBRE',
  'DICIEMBRE'
];

/**
 * Props:
 * - onMonthChange(monthIndex: number)  (compatibilidad, 0-11)
 * - onDateChange(date: Date)           (NUEVO: fecha con año+mes)
 * - initialDate?: Date                 (NUEVO: inicializa mes/año desde el padre)
 */
const FechasConvenios = ({ onMonthChange, onDateChange, initialDate }) => {
  // Antes: solo mes. Ahora: fecha completa (año + mes), siempre al día 1.
  const initial = useMemo(() => {
    const base = initialDate instanceof Date ? initialDate : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  }, [initialDate]);

  const [currentDate, setCurrentDate] = useState(initial);

  // Mantener sincronía si el padre cambia initialDate
  useEffect(() => {
    setCurrentDate(initial);
  }, [initial]);

  // Notificar cambios al padre (compat + nuevo)
  const notifyParent = (d) => {
    const month = d.getMonth();
    if (typeof onMonthChange === 'function') onMonthChange(month);
    if (typeof onDateChange === 'function') onDateChange(d);
  };

  useEffect(() => {
    const checkDate = () => {
      const today = new Date();

      // Si es día 1, actualizar al mes actual (y año actual)
      if (today.getDate() === 1) {
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        setCurrentDate(d);
        notifyParent(d);
      }
    };

    const intervalId = setInterval(checkDate, 24 * 60 * 60 * 1000); // Verificar cada 24 horas
    return () => clearInterval(intervalId);
  }, [onMonthChange, onDateChange]);

  const handlePreviousMonth = () => {
    // Al restar 1 mes, Date ajusta automáticamente el año si corresponde.
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    setCurrentDate(d);
    notifyParent(d);
  };

  const handleNextMonth = () => {
    const d = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      1
    );
    setCurrentDate(d);
    notifyParent(d);
  };

  return (
    <div className="my-5 flex items-center justify-center">
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 backdrop-blur-xl shadow-[0_10px_30px_-18px_rgba(0,0,0,0.65)] transition hover:bg-white/[0.08]">
        <button
          type="button"
          onClick={handlePreviousMonth}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#ff4d00] text-white shadow-md transition hover:brightness-95 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Mes anterior"
        >
          <span className="text-xl leading-none">{'‹'}</span>
        </button>

        {/* Mes + Año */}
        <span className="w-[200px] select-none text-center text-2xl font-bold tracking-[2px] text-white/90">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="grid h-10 w-10 place-items-center rounded-full bg-[#ff4d00] text-white shadow-md transition hover:brightness-95 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/20"
          aria-label="Mes siguiente"
        >
          <span className="text-xl leading-none">{'›'}</span>
        </button>
      </div>
    </div>
  );
};

export default FechasConvenios;
