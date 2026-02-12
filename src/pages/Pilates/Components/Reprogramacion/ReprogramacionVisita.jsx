/* 
Hecho por: Sergio Gustavo Manrique
Fecha: 03/02/2026
Descripción: Componente para reprogramar visitas programadas en Pilates
*/

// Componente para reprogramar visitas programadas
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

const ReprogramacionVisita = ({
  studentData, // Datos del alumno con su turno actual
  allSchedules, // Todos los horarios disponibles
  maxCapacity, // Cupo máximo por clase
  horariosDeshabilitados, // Horarios deshabilitados
  onConfirm, // Callback al confirmar: (newDate, newPlan, newHour)
  onCancel, // Callback al cancelar
  fechaHoy, // Fecha actual desde el componente padre
  tipo = "visita-prueba", // "visita" o "prueba"
}) => {
  const [planSeleccionado, setPlanSeleccionado] = useState("L-M-V");
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horasDisponiblesPlan, setHorasDisponiblesPlan] = useState([]);

  // Función para convertir fecha YYYY-MM-DD a Date
  const aFechaLocal = (fechaStr) => {
    if (!fechaStr) return null;
    const [anio, mes, dia] = fechaStr.split("-");
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  };

  // Valida si un día es permitido para un plan
  const diaValidoParaPlan = (fecha, plan) => {
    const diaSemana = fecha.getDay(); // 0: domingo, 1: lunes, ..., 6: sábado
    if (plan === "L-M-V") {
      return [1, 3, 5].includes(diaSemana); // lunes, miércoles, viernes
    } else if (plan === "M-J") {
      return [2, 4].includes(diaSemana); // martes, jueves
    }
    return true;
  };

  // Busca el próximo día válido a partir de una fecha
  const proximaFechaValida = (fechaInicio, plan) => {
    let proxima = new Date(fechaInicio);
    for (let i = 1; i <= 7; i++) {
      proxima.setDate(fechaInicio.getDate() + i);
      if (diaValidoParaPlan(proxima, plan)) {
        return proxima;
      }
    }
    return null;
  };

  // Inicializar con los datos del alumno
  useEffect(() => {
    if (studentData) {
      // Establecer el plan del alumno actual
      const diaActual = studentData.currentDay?.toUpperCase();
      let plan = "L-M-V"; // por defecto
      
      if (diaActual === "MARTES" || diaActual === "JUEVES") {
        plan = "M-J";
      } else if (diaActual === "LUNES" || diaActual === "MIÉRCOLES" || diaActual === "VIERNES") {
        plan = "L-M-V";
      }
      
      setPlanSeleccionado(plan);

      // Establecer la hora del alumno actual
      if (studentData.currentHour) {
        setHoraSeleccionada(studentData.currentHour);
      }

      // Establecer la fecha actual validando que sea compatible con el plan
      if (fechaHoy) {
        const fechaInicial = aFechaLocal(fechaHoy);
        if (fechaInicial) {
          // Verificar si la fecha es válida para el plan
          if (diaValidoParaPlan(fechaInicial, plan)) {
            setFechaSeleccionada(fechaInicial);
          } else {
            // Si no es válida, buscar el próximo día válido
            const proxima = proximaFechaValida(fechaInicial, plan);
            setFechaSeleccionada(proxima);
          }
        }
      }
    }
  }, [studentData, fechaHoy]);

  // Actualizar horarios cuando cambia el plan
  useEffect(() => {
    if (!allSchedules) return;

    let horasPlan = [];

    if (planSeleccionado === "L-M-V") {
      const dias = ["LUNES", "MIÉRCOLES", "VIERNES"];
      dias.forEach((dia) => {
        if (allSchedules[dia]) {
          allSchedules[dia].forEach((horario) => {
            if (!horasPlan.some((h) => h.hour === horario.hour)) {
              horasPlan.push({
                hour: horario.hour,
                day: dia,
                count: horario.count || 0,
              });
            }
          });
        }
      });
    } else if (planSeleccionado === "M-J") {
      const dias = ["MARTES", "JUEVES"];
      dias.forEach((dia) => {
        if (allSchedules[dia]) {
          allSchedules[dia].forEach((horario) => {
            if (!horasPlan.some((h) => h.hour === horario.hour)) {
              horasPlan.push({
                hour: horario.hour,
                day: dia,
                count: horario.count || 0,
              });
            }
          });
        }
      });
    }

    // Ordenar por hora
    horasPlan.sort(
      (a, b) =>
        parseInt(a.hour.split(":")[0]) - parseInt(b.hour.split(":")[0])
    );

    // Filtrar horarios deshabilitados
    const horariosDisponibles = horasPlan.filter((hora) => {
      const estaDeshabilitado = horariosDeshabilitados?.some(
        (deshabilitado) => {
          const mismaHora = deshabilitado.hora_label === hora.hour;

          if (planSeleccionado === "L-M-V") {
            return (
              mismaHora &&
              (deshabilitado.tipo_bloqueo === "lmv" ||
                deshabilitado.tipo_bloqueo === "todos")
            );
          }

          if (planSeleccionado === "M-J") {
            return (
              mismaHora &&
              (deshabilitado.tipo_bloqueo === "mj" ||
                deshabilitado.tipo_bloqueo === "todos")
            );
          }

          return false;
        }
      );

      return !estaDeshabilitado;
    });

    setHorasDisponiblesPlan(horariosDisponibles);
  }, [planSeleccionado, allSchedules, horariosDeshabilitados]);

  // Verificar si un horario tiene cupo disponible
  const horarioConCupo = (hora) => {
    if (planSeleccionado === "L-M-V") {
      const dias = ["LUNES", "MIÉRCOLES", "VIERNES"];
      return dias.every(
        (dia) =>
          !allSchedules[dia] ||
          !allSchedules[dia].some(
            (s) => s.hour === hora && (s.count || 0) >= maxCapacity
          )
      );
    } else {
      const dias = ["MARTES", "JUEVES"];
      return dias.every(
        (dia) =>
          !allSchedules[dia] ||
          !allSchedules[dia].some(
            (s) => s.hour === hora && (s.count || 0) >= maxCapacity
          )
      );
    }
  };

  // Obtener el conteo máximo de estudiantes en un horario
  const totalAlumnosHorario = (hora) => {
    let maximo = 0;
    let diasARevisar = [];

    if (planSeleccionado === "L-M-V") {
      diasARevisar = ["LUNES", "MIÉRCOLES", "VIERNES"];
    } else {
      diasARevisar = ["MARTES", "JUEVES"];
    }

    diasARevisar.forEach((dia) => {
      if (allSchedules[dia]) {
        const horario = allSchedules[dia].find((s) => s.hour === hora);
        if (horario) {
          maximo = Math.max(maximo, horario.count || 0);
        }
      }
    });

    return maximo;
  };

  const confirmarReprogramacion = () => {
    if (!fechaSeleccionada) {
      alert("Por favor, selecciona una fecha.");
      return;
    }
    if (!horaSeleccionada) {
      alert("Por favor, selecciona un horario.");
      return;
    }

    // Convertir fecha a formato YYYY-MM-DD
    const anio = fechaSeleccionada.getFullYear();
    const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, "0");
    const dia = String(fechaSeleccionada.getDate()).padStart(2, "0");
    const fechaFormateada = `${anio}-${mes}-${dia}`;

    onConfirm(fechaFormateada, horaSeleccionada);
  };

  return (
    <div className="space-y-6">
      {/* Información actual */}
      <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 p-4 rounded-r-lg">
        <p className="font-bold text-sm mb-1">{`Reprogramación de ${studentData?.status === "prueba" ? "la clase de prueba" : "visita programada"}`}:</p>
        <p className="text-sm">
          Día: <strong>{studentData?.currentDay}</strong> | Hora: <strong>{studentData?.currentHour}</strong>
        </p>
      </div>

      {/* Selector de fecha */}
      <div>
        <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
          Nueva Fecha de {studentData?.status === "prueba" ? "clase de prueba" : "Visita"} *
        </label>
        <DatePicker
          selected={fechaSeleccionada}
          onChange={(fecha) => setFechaSeleccionada(fecha)}
          dateFormat="dd/MM/yyyy"
          placeholderText="Seleccioná una fecha"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          locale={es}
          filterDate={(fecha) => {
            // 0: domingo, 1: lunes, ..., 6: sábado
            if (planSeleccionado === "L-M-V") {
              return [1, 3, 5].includes(fecha.getDay()); // lunes, miércoles, viernes
            } else if (planSeleccionado === "M-J") {
              return [2, 4].includes(fecha.getDay()); // martes, jueves
            }
            return true;
          }}
        />
      </div>

      {/* Selector de Plan */}
      <div>
        <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
          Grupo de Horarios *
        </label>
        <select
          value={planSeleccionado}
          onChange={(e) => {
            const nuevoPlan = e.target.value;
            setPlanSeleccionado(nuevoPlan);
            setHoraSeleccionada(""); // Reset hora al cambiar plan

            // Ajustar la fecha si no es válida para el nuevo plan
            if (fechaHoy) {
              const hoyDate = aFechaLocal(fechaHoy);
              if (hoyDate) {
                // Primero intentar usar el día actual (fechaHoy) si es válido para el nuevo plan
                if (diaValidoParaPlan(hoyDate, nuevoPlan)) {
                  setFechaSeleccionada(hoyDate);
                } else {
                  // Si el día actual NO es válido, buscar el próximo día válido
                  const proxima = proximaFechaValida(hoyDate, nuevoPlan);
                  if (proxima) {
                    setFechaSeleccionada(proxima);
                  }
                }
              }
            } else if (fechaSeleccionada) {
              // Si no tenemos fechaHoy, verificar la fecha seleccionada actual
              if (diaValidoParaPlan(fechaSeleccionada, nuevoPlan)) {
                // La fecha es válida, mantenerla
                return;
              }
              
              // Si la fecha actual NO es válida, buscar el próximo día válido
              const proxima = proximaFechaValida(fechaSeleccionada, nuevoPlan);
              if (proxima) {
                setFechaSeleccionada(proxima);
              }
            }
          }}
          className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="L-M-V">Lunes-Miércoles-Viernes</option>
          <option value="M-J">Martes-Jueves</option>
        </select>
      </div>

      {/* Selector de Horarios */}
      <div>
        <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
          Horario *
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Verde: disponible | Naranja: tu horario actual | Gris: lleno
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border rounded p-3 max-h-48 overflow-y-auto bg-gray-50">
          {horasDisponiblesPlan.length > 0 ? (
            horasDisponiblesPlan.map((slot) => {
              const disponible = horarioConCupo(slot.hour);
              const total = totalAlumnosHorario(slot.hour);
              const seleccionado = horaSeleccionada === slot.hour;
              
              // Determinar si este es el horario actual del alumno
              const diaActual = studentData?.currentDay?.toUpperCase();
              let planActual = "";
              if (diaActual === "MARTES" || diaActual === "JUEVES") {
                planActual = "M-J";
              } else if (diaActual === "LUNES" || diaActual === "MIÉRCOLES" || diaActual === "VIERNES") {
                planActual = "L-M-V";
              }
              
              const esHorarioActual =
                slot.hour === studentData?.currentHour &&
                planSeleccionado === planActual;

              return (
                <button
                  key={`${slot.day}-${slot.hour}`}
                  onClick={() => setHoraSeleccionada(slot.hour)}
                  className={`p-2 rounded-md cursor-pointer transition-all text-xs font-semibold flex flex-col items-center justify-center ${
                    seleccionado
                      ? "bg-orange-500 text-white shadow-lg ring-2 ring-orange-600"
                      : esHorarioActual
                      ? "bg-orange-200 hover:bg-orange-300 text-gray-800 ring-1 ring-orange-400"
                      : disponible
                      ? "bg-green-200 hover:bg-green-300 text-gray-800"
                      : "bg-gray-300 text-gray-600"
                  }`}
                  title={`${slot.hour} - ${total}/${maxCapacity} alumnos`}
                >
                  <span>{slot.hour}</span>
                  <span className="text-xs mt-1">
                    {total}/{maxCapacity}
                  </span>
                  {esHorarioActual && !seleccionado && (
                    <span className="text-xs text-orange-600">Actual</span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-full flex items-center justify-center text-sm text-gray-500 italic">
              No hay horarios disponibles
            </div>
          )}
        </div>
      </div>

      {/* Resumen de cambios */}
      {fechaSeleccionada && horaSeleccionada && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-900 p-4 rounded-r-lg">
          <p className="font-bold text-sm mb-1">{`Reprogramación de ${studentData?.status === "prueba" ? "la clase de prueba" : "visita programada"}`}:</p>
          <p className="text-sm">
            Fecha: <strong>
              {fechaSeleccionada.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </strong> | Grupo: <strong>{planSeleccionado}</strong> | Hora: <strong>{horaSeleccionada}</strong>
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <button
          onClick={onCancel}
          className="font-bold text-sm text-gray-600 hover:text-gray-800"
        >
          Cancelar
        </button>
        <button
          onClick={confirmarReprogramacion}
          disabled={!fechaSeleccionada || !horaSeleccionada}
          className="bg-orange-500 hover:bg-orange-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
        >
          Confirmar Reprogramación
        </button>
      </div>
    </div>
  );
};

export default ReprogramacionVisita;
