// Archivo: /Modal/ModalCambioTurno.jsx
/**
 * ModalCambioTurno: Modal para cambiar turno de un alumno ya inscrito
 * 
 * Características:
 * - Muestra todos los horarios disponibles agrupados por grupo/día
 * - Los horarios sin cupo disponible aparecen en gris pero son seleccionables
 * - Al seleccionar un horario con cupo: agendar cambio directo
 * - Al seleccionar un horario sin cupo: agendar en lista de espera en situación de "cambio"
 * - Los datos del alumno (nombre y contacto) vienen precargados
 * - El usuario puede agregar observaciones adicionales
 */

import React, { useState, useEffect } from "react";
import useHistorialAlumnos from "../Logic/PilatesGestion/HistorialAlumnos"

const ModalCambioTurno = ({
  isOpen,
  onClose,
  studentData, // Datos del alumno: { id, name, contact, currentDay, currentHour, status, observation }
  allSchedules, // Todos los horarios disponibles con info de cupos
  onSaveDirect, // Callback para agendar cambio directo: (key, studentData, action, extras)
  onSaveWaitingList, // Callback para agendar en lista de espera: (personData, observation)
  maxCapacity, // Cupo máximo por clase´
  horariosDeshabilitados, // Horarios deshabilitados (no seleccionables)
}) => {
  // --- Estados del formulario ---
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [observation, setObservation] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("L-M-V");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedSlotStatus, setSelectedSlotStatus] = useState("available"); // 'available' o 'full'
  const [allHoursForPlan, setAllHoursForPlan] = useState([]); // Todos los horarios del plan (con y sin cupo)
  const [isProcessing, setIsProcessing] = useState(false);
  const { crearHistorialAlumno } = useHistorialAlumnos({idAlumno: studentData?.id});
  // --- Efecto para cargar datos del alumno ---
  useEffect(() => {
    if (studentData) {
      setName(studentData.name || "");
      setContact(studentData.contact || "");
      setObservation(studentData.observation || "");
      // Intentar establecer el plan del alumno actual
      if (
        studentData.currentDay &&
        ["LUNES", "MIÉRCOLES", "VIERNES"].includes(studentData.currentDay)
      ) {
        setSelectedPlan("L-M-V");
      } else if (
        studentData.currentDay &&
        ["MARTES", "JUEVES"].includes(studentData.currentDay)
      ) {
        setSelectedPlan("M-J");
      }
    }
  }, [studentData]);

  // --- Efecto para actualizar horarios cuando cambia el plan ---
  useEffect(() => {
    if (!allSchedules) return;

    let hoursForPlan = [];

    if (selectedPlan === "L-M-V") {
      const days = ["LUNES", "MIÉRCOLES", "VIERNES"];
      days.forEach((day) => {
        if (allSchedules[day]) {
          allSchedules[day].forEach((schedule) => {
            if (!hoursForPlan.some((h) => h.hour === schedule.hour)) {
              hoursForPlan.push({
                hour: schedule.hour,
                day: day,
                count: schedule.count || 0,
                /* disbled:  */
              });
            }
          });
        }
      });
    } else if (selectedPlan === "M-J") {
      const days = ["MARTES", "JUEVES"];
      days.forEach((day) => {
        if (allSchedules[day]) {
          allSchedules[day].forEach((schedule) => {
            if (!hoursForPlan.some((h) => h.hour === schedule.hour)) {
              hoursForPlan.push({
                hour: schedule.hour,
                day: day,
                count: schedule.count || 0,
                /* disbled:  */
              });
            }
          });
        }
      });
    }

    // Ordenar por hora
    hoursForPlan.sort(
      (a, b) =>
        parseInt(a.hour.split(":")[0]) - parseInt(b.hour.split(":")[0])
    );

    // Filtrar horarios deshabilitados
    const horariosDisponibles = hoursForPlan.filter((hour) => {
      const estaDeshabilitado = horariosDeshabilitados?.some(
        (deshabilitado) => {
          const mismaHora = deshabilitado.hora_label === hour.hour;
          
          // Si es plan L-M-V, bloquear si tipo_bloqueo es "lmv" o "todos"
          if (selectedPlan === "L-M-V") {
            return mismaHora && (deshabilitado.tipo_bloqueo === "lmv" || deshabilitado.tipo_bloqueo === "todos");
          }
          
          // Si es plan M-J, bloquear si tipo_bloqueo es "mj" o "todos"
          if (selectedPlan === "M-J") {
            return mismaHora && (deshabilitado.tipo_bloqueo === "mj" || deshabilitado.tipo_bloqueo === "todos");
          }
          
          return false;
        }
      );
      
      return !estaDeshabilitado;
    });

    setAllHoursForPlan(horariosDisponibles);
    setSelectedHour("");
    setSelectedSlotStatus("available");
  }, [selectedPlan, allSchedules, horariosDeshabilitados]);

  if (!isOpen) return null;

  /**
   * Calcula si un horario tiene cupo disponible
   * Verifica que en TODOS los días del grupo no haya alcanzado maxCapacity
   */
  const isSlotAvailable = (hour) => {
    if (selectedPlan === "L-M-V") {
      const days = ["LUNES", "MIÉRCOLES", "VIERNES"];
      return days.every(
        (day) =>
          !allSchedules[day] ||
          !allSchedules[day].some(
            (s) => s.hour === hour && (s.count || 0) >= maxCapacity
          )
      );
    } else {
      const days = ["MARTES", "JUEVES"];
      return days.every(
        (day) =>
          !allSchedules[day] ||
          !allSchedules[day].some(
            (s) => s.hour === hour && (s.count || 0) >= maxCapacity
          )
      );
    }
  };

  /**
   * Obtiene el conteo máximo de estudiantes en un horario
   * Obtiene el máximo conteo de cualquier día para ese horario
   * Esto indica si el horario está realmente lleno o tiene disponibilidad
   */
  const getTotalCountForHour = (hour) => {
    let maxCount = 0;
    let daysToCheck = [];

    if (selectedPlan === "L-M-V") {
      daysToCheck = ["LUNES", "MIÉRCOLES", "VIERNES"];
    } else {
      daysToCheck = ["MARTES", "JUEVES"];
    }

    daysToCheck.forEach((day) => {
      if (allSchedules[day]) {
        const schedule = allSchedules[day].find((s) => s.hour === hour);
        if (schedule) {
          maxCount = Math.max(maxCount, schedule.count || 0);
        }
      }
    });

    return maxCount;
  };

  /**
   * Maneja la selección de un horario
   * Detecta automáticamente si está disponible o no
   */
  const handleSelectHour = (hour) => {
    setSelectedHour(hour);
    const available = isSlotAvailable(hour);
    setSelectedSlotStatus(available ? "available" : "full");
  };

  /**
   * Guarda el cambio directo (horario con cupo disponible)
   */
  const handleSaveDirect = async () => {
    if (!selectedHour) {
      alert("Por favor, selecciona un horario.");
      return;
    }

    if (!isSlotAvailable(selectedHour)) {
      alert(
        "Este horario está lleno. Por favor, selecciona uno disponible o agrega a lista de espera."
      );
      return;
    }

    setIsProcessing(true);
    try {
      // Determinamos el primer día del grupo seleccionado
      let day = "";
      if (selectedPlan === "L-M-V") {
        day = "LUNES";
      } else {
        day = "MARTES";
      }

      const key = `${day}-${selectedHour}`;

      const studentDataToSave = {
        id: studentData.id,
        name: name.toUpperCase(),
        contact: contact.toUpperCase(),
        status: "plan",
        observation: observation || null,
        planDetails: {
          type: selectedPlan,
          startDate: studentData.planDetails?.startDate || null,
          duration: studentData.planDetails?.duration || null,
          endDate: studentData.planDetails?.endDate || null,
        },
      };
      await onSaveDirect(key, studentDataToSave, "cambiar_turno", {
        oldDay: studentData.currentDay,
        oldHour: studentData.currentHour,
        newDay: day,
        newHour: selectedHour,
      });
      crearHistorialAlumno({day: studentData.currentDay, hour: studentData.currentHour}, {day: selectedPlan, hour: selectedHour, id: studentData.id}, "CAMBIO_TURNO")
      
      onClose();
    } catch (error) {
      console.error("Error al cambiar turno:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Guarda el cambio en lista de espera (horario sin cupo)
   */
  const handleSaveWaitingList = async () => {
    if (!selectedHour) {
      alert("Por favor, selecciona un horario.");
      return;
    }

    setIsProcessing(true);
    try {
      const personDataForWaitingList = {
        id: studentData.id,
        name,
        contact,
        type: "cambio", // Tipo: cambio
        plan: selectedPlan,
        hours: [selectedHour],
        obs: observation,
      };

      await onSaveWaitingList(personDataForWaitingList);

      alert(
        "Se ha agregado el cambio de turno a la lista de espera exitosamente."
      );
      onClose();
    } catch (error) {
      console.error("Error al agregar a lista de espera:", error);
      alert("Error al agregar a lista de espera. Intenta nuevamente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-2xl">
        {/* Encabezado */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Cambiar Turno de Clase
        </h2>
        <p className="text-gray-600 mb-6">
          Selecciona el nuevo horario para{" "}
          <span className="font-bold">{name}</span>. Si el horario está lleno,
          se agregará a la lista de espera.
        </p>

        {/* Información del alumno actual */}
        <div className="bg-purple-50 border-l-4 border-purple-500 text-purple-900 p-4 rounded-r-lg mb-6">
          <p className="font-bold text-sm">Información del alumno:</p>
          <p className="text-sm">
            Turno actual: <strong>{studentData.currentDay}</strong> a las{" "}
            <strong>{studentData.currentHour}</strong>
          </p>
          <p className="text-sm">
            Estado: <strong>{studentData.status?.toUpperCase()}</strong>
          </p>
        </div>

        {/* Selectores de Plan y Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Grupo de Horarios *
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="L-M-V">Lunes-Miércoles-Viernes</option>
              <option value="M-J">Martes-Jueves</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Selecciona el Nuevo Horario *
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Verde: disponible | Gris: lleno (lista de espera)
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border rounded p-3 h-48 overflow-y-auto bg-gray-50">
              {allHoursForPlan.length > 0 ? (
                allHoursForPlan.map((slot) => {
                  const isAvailable = isSlotAvailable(slot.hour);
                  const totalCount = getTotalCountForHour(slot.hour);
                  const isSelected = selectedHour === slot.hour;

                  return (
                    <button
                      key={`${slot.day}-${slot.hour}`}
                      onClick={() => handleSelectHour(slot.hour)}
                      disabled={isProcessing}
                      className={`p-2 rounded-md cursor-pointer transition-all text-xs font-semibold flex flex-col items-center justify-center ${
                        isSelected
                          ? isAvailable
                            ? "bg-green-500 text-white shadow-lg ring-2 ring-green-600"
                            : "bg-red-500 text-white shadow-lg ring-2 ring-red-600"
                          : isAvailable
                          ? "bg-green-200 hover:bg-green-300 text-gray-800"
                          : "bg-gray-300 hover:bg-gray-400 text-gray-600"
                      }`}
                      title={`${slot.hour} - ${totalCount}/${maxCapacity} alumnos`}
                    >
                      <span>{slot.hour}</span>
                      <span className="text-xs mt-1">
                        {totalCount}/{maxCapacity}
                      </span>
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
        </div>

        {/* Información del horario seleccionado */}
        {selectedHour && (
          <div
            className={`p-4 rounded-lg border-l-4 mb-6 ${
              selectedSlotStatus === "available"
                ? "bg-green-50 border-green-500 text-green-900"
                : "bg-yellow-50 border-yellow-500 text-yellow-900"
            }`}
          >
            <p className="font-bold text-sm">
              {selectedSlotStatus === "available"
                ? "✓ Horario disponible"
                : "⚠ Horario lleno - Se agregará a lista de espera"}
            </p>
            <p className="text-sm mt-1">
              Cambio a: <strong>{selectedHour}</strong> ({selectedPlan})
            </p>
          </div>
        )}

        {/* Campo de observaciones */}
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Observaciones adicionales (Opcional)
          </label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows="3"
            maxLength={255}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Notas sobre el cambio de turno..."
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-4 border-t pt-6">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="font-bold text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancelar
          </button>

          {selectedSlotStatus === "available" ? (
            <button
              onClick={handleSaveDirect}
              disabled={!selectedHour || isProcessing}
              className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
              {isProcessing ? "Procesando..." : "Cambiar Turno Ahora"}
            </button>
          ) : (
            <button
              onClick={handleSaveWaitingList}
              disabled={!selectedHour || isProcessing}
              className="bg-yellow-500 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
            >
              {isProcessing ? "Procesando..." : "Agregar a Lista de Espera"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalCambioTurno;
