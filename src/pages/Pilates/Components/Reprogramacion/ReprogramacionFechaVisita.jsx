/* Hecho por: Sergio Gustavo Manrique
Fecha: 11/02/2026
Descripción: Componente para reprogramar SOLAMENTE la fecha prometida de pago
*/

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

const ReprogramacionFechaVisita = ({
  studentData, // Datos del alumno (id, name, currentHour, scheduledDetails, etc.)
  onConfirm, // Callback al confirmar: (newDate)
  onCancel, // Callback al cancelar
  fechaHoy, // Fecha actual desde el componente padre
}) => {
  const [nuevaFechaPrometida, setNuevaFechaPrometida] = useState(null);

  // Función para convertir fecha YYYY-MM-DD a Date
  const aFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    const [anio, mes, dia] = fechaStr.split("-");
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  };

  // Formateo simple para la UI
  const formatearFechaSimple = (fechaStr) => {
    if (!fechaStr) return "No asignada";
    const [anio, mes, dia] = fechaStr.split("-");
    return `${dia}/${mes}/${anio}`;
  };

  // Inicializar con la fecha que ya tiene el alumno
  useEffect(() => {
    if (studentData?.scheduledDetails?.promisedDate) {
      setNuevaFechaPrometida(aFechaLocal(studentData.scheduledDetails.promisedDate));
    }
  }, [studentData]);

  const manejarConfirmacion = () => {
    if (!nuevaFechaPrometida) {
      alert("Por favor, selecciona una nueva fecha.");
      return;
    }
    // Convertir a YYYY-MM-DD para devolver al padre
    const anio = nuevaFechaPrometida.getFullYear();
    const mes = String(nuevaFechaPrometida.getMonth() + 1).padStart(2, "0");
    const dia = String(nuevaFechaPrometida.getDate()).padStart(2, "0");
    const fechaFormateada = `${anio}-${mes}-${dia}`;
    
    onConfirm(fechaFormateada);
  };

  return (
    <div className="space-y-6">
      {/* Grid Responsivo: 1 col en móvil, 2 en escritorio para llenar el modal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* LADO IZQUIERDO: Información del Alumno */}
        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-r-lg mb-4">
              <p className="font-bold text-sm mb-1 uppercase tracking-wide">Alumno:</p>
              <p className="text-xl font-bold uppercase">{studentData?.name}</p>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-900 p-4 rounded-r-lg">
              <p className="font-bold text-sm mb-1 uppercase tracking-wide">Fecha Prometida Actual:</p>
              <p className="text-lg font-bold">
                {formatearFechaSimple(studentData?.scheduledDetails?.promisedDate)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 italic leading-relaxed text-center">
              * Nota: Al modificar esta fecha, solo se actualiza el compromiso de pago. 
              El lugar de las <strong>{studentData?.currentHour}</strong> se mantiene reservado.
            </p>
          </div>
        </div>

        {/* LADO DERECHO: Selector de Fecha (Calendario) */}
        <div className="flex flex-col">
          <label className="block text-orange-600 font-messina text-sm font-bold mb-2 uppercase tracking-wide">
            Nueva Fecha Prometida *
          </label>
          <div className="border rounded-lg p-3 bg-white shadow-inner flex justify-center">
            <DatePicker
              selected={nuevaFechaPrometida}
              onChange={(fecha) => setNuevaFechaPrometida(fecha)}
              dateFormat="dd/MM/yyyy"
              placeholderText="Seleccioná una fecha"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
              locale={es}
              minDate={fechaHoy ? aFechaLocal(fechaHoy) : new Date()}
              inline // Mantenemos el calendario abierto para que llene el espacio
            />
          </div>
        </div>
      </div>

      {/* Resumen de cambio (aparece abajo si cambió la fecha) */}
      {nuevaFechaPrometida && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-900 p-3 rounded-r-lg">
          <p className="text-sm font-medium text-center">
            Se reprogramará el pago para el: <strong>
              {nuevaFechaPrometida.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </strong>
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          onClick={onCancel}
          className="font-bold text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={manejarConfirmacion}
          disabled={!nuevaFechaPrometida}
          className="bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-8 rounded-lg shadow-md transition-all active:scale-95 uppercase text-xs tracking-widest"
        >
          Confirmar Nueva Fecha
        </button>
      </div>
    </div>
  );
};

export default ReprogramacionFechaVisita;