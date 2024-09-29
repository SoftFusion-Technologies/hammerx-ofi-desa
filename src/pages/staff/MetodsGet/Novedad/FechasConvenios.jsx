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

import React, { useState, useEffect } from 'react';
import './Styles/FechasConvenios.css';

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

const FechasConvenios = ({ onMonthChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  useEffect(() => {
    const checkDate = () => {
      const today = new Date();
      if (today.getDate() === 1) {
        setCurrentMonth(today.getMonth());
        onMonthChange(today.getMonth()); // Notificar el mes actual al componente padre
      }
    };

    const intervalId = setInterval(checkDate, 24 * 60 * 60 * 1000); // Verificar cada 24 horas
    return () => clearInterval(intervalId);
  }, [onMonthChange]);

  const handlePreviousMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    setCurrentMonth(newMonth);
    onMonthChange(newMonth); // Notificar el cambio al mes anterior
  };

  const handleNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    setCurrentMonth(newMonth);
    onMonthChange(newMonth); // Notificar el cambio al mes siguiente
  };

  return (
    <div className="month-container">
      <button className="month-button" onClick={handlePreviousMonth}>
        {'<'}
      </button>
      <span className="month-display fixed-width">
        {monthNames[currentMonth]}
      </span>
      <button className="month-button" onClick={handleNextMonth}>
        {'>'}
      </button>
    </div>
  );
};

export default FechasConvenios;
