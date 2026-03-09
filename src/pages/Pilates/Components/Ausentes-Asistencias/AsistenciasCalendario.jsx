import React, { useState, useEffect } from "react";
import { format, addMonths, subMonths, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";
import axios from "axios"; // Asegurate de importar tu instancia de axios

const AsistenciasCalendario = ({ isOpen, onClose, idSede }) => {
  const [fechaActual, setFechaActual] = useState(new Date());
  const [datosCalendario, setDatosCalendario] = useState({});
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (isOpen) {
      cargarDatosMensuales();
    }
  }, [fechaActual, isOpen, idSede]);

  const cargarDatosMensuales = async () => {
    try {
      setCargando(true);
      const anio = fechaActual.getFullYear();
      const mes = fechaActual.getMonth() + 1;
      
      // Ajustá la URL según tu configuración de rutas
      const url = `http://localhost:8080/asistencias-pilates/calendario-mensual?anio=${anio}&mes=${mes}&&id_sede=${idSede}`;
      
      const respuesta = await axios.get(url);
      setDatosCalendario(respuesta.data);
    } catch (error) {
      console.error("Error al cargar datos del calendario:", error);
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  const horarios = [
    "07:00", "08:00", "09:00", "10:00", "11:00",
    "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00","22:00"
  ];

  const cantidadDias = getDaysInMonth(fechaActual);
  const diasMes = Array.from({ length: cantidadDias }, (_, i) => i + 1);

  const irMesAnterior = () => setFechaActual(subMonths(fechaActual, 1));
  const irMesSiguiente = () => setFechaActual(addMonths(fechaActual, 1));

  const obtenerDatosCelda = (dia, horario) => {
    const anio = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, "0");
    const diaStr = String(dia).padStart(2, "0");
    const fechaCompleta = `${anio}-${mes}-${diaStr}`;

    if (datosCalendario[fechaCompleta] && datosCalendario[fechaCompleta][horario]) {
      return datosCalendario[fechaCompleta][horario];
    }
    return "-"; // Si no hay clases ese día u horario
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity">
      <div className="bg-white w-full h-[98vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-bignoodle">
              CALENDARIO DE ASISTENCIAS
            </h2>
            <p className="text-sm text-gray-500">
              Vista general de asistencias e inscritos por turno
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col p-4 bg-gray-50 overflow-hidden relative">
          
          <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 shrink-0">
            <button onClick={irMesAnterior} className="px-4 py-2 border border-gray-300 text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
              ← Mes Anterior
            </button>
            <h3 className="text-xl font-bold text-orange-600 uppercase tracking-wide">
              {format(fechaActual, "MMMM yyyy", { locale: es })}
            </h3>
            <button onClick={irMesSiguiente} className="px-4 py-2 border border-gray-300 text-sm font-bold rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">
              Mes Siguiente →
            </button>
          </div>

          <div className="flex-1 overflow-auto bg-white rounded-lg shadow border border-gray-200 relative">
            {cargando && (
              <div className="absolute inset-0 bg-white bg-opacity-70 z-30 flex items-center justify-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
              </div>
            )}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-100 border-r border-gray-200 z-20">
                    Horarios
                  </th>
                  {diasMes.map((dia) => (
                    <th key={dia} className="px-2 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[80px]">
                      Día {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {horarios.map((horario) => (
                  <tr key={horario} className="hover:bg-orange-50 transition duration-150">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white border-r border-gray-200">
                      {horario}
                    </td>
                    {diasMes.map((dia) => {
                      const valor = obtenerDatosCelda(dia, horario);
                      const tieneDatos = valor !== "-";
                      return (
                        <td key={`${dia}-${horario}`} className="px-2 py-2 whitespace-nowrap text-center">
                          {tieneDatos ? (
                            <span className="inline-flex items-center justify-center px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                              {valor}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        <div className="bg-gray-50 px-6 py-3 border-t flex justify-end items-center shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-red-50 shadow-sm transition">
            CERRAR CALENDARIO
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default AsistenciasCalendario;