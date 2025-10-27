// Archivo: /Modal/ModalConfirmarListaEspera.jsx

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

const ModalConfirmarListaEspera = ({
  isOpen,
  onClose,
  onSave,
  personData,
  freeSlots,
  onConfirmationComplete,
}) => {
  // --- Estados del formulario ---
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState("plan");
  const [planStartDate, setPlanStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [planDuration, setPlanDuration] = useState("30");
  const [observation, setObservation] = useState("");
  const [planEndDate, setPlanEndDate] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("L-M-V");
  const [selectedHour, setSelectedHour] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [planStartDateObj, setPlanStartDateObj] = useState(new Date());

  // --- Efecto para cargar datos y preferencias de la persona ---
  useEffect(() => {
    if (personData) {
      setName(personData.name || "");
      setContact(personData.contact || "");
      setObservation(personData.obs || "");
      if (personData.plan === "M-J") {
        setSelectedPlan("M-J");
      } else {
        setSelectedPlan("L-M-V");
      }
    }
  }, [personData]);

  // --- Efecto para actualizar los horarios disponibles cuando cambia el plan ---
  useEffect(() => {
    if (!freeSlots) return;

    let newAvailableHours = [];
    if (selectedPlan === "L-M-V" && freeSlots.lmv) {
      newAvailableHours = freeSlots.lmv.map((slot) => slot.hour);
    } else if (selectedPlan === "M-J" && freeSlots.mj) {
      newAvailableHours = freeSlots.mj.map((slot) => slot.hour);
    }

    setAvailableHours(newAvailableHours);
    setSelectedHour(newAvailableHours[0] || "");
  }, [selectedPlan, freeSlots]);

  // --- Efecto para recalcular la fecha de fin ---
  useEffect(() => {
    if (planStartDate && planDuration) {
      const parts = planStartDate.split("-");
      const startDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );
      startDate.setDate(startDate.getDate() + Number(planDuration));
      setPlanEndDate(startDate.toISOString().slice(0, 10));
    }
  }, [planStartDate, planDuration]);

  if (!isOpen) return null;

  // --- Función que se ejecuta al guardar ---
  const handleConfirmAndSave = async () => {
    if (!name || !contact || !selectedHour) {
      alert(
        "Por favor, complete todos los campos obligatorios, incluyendo la hora."
      );
      return;
    }

    const day = selectedPlan === "L-M-V" ? "LUNES" : "MARTES";
    const key = `${day}-${selectedHour}`;

    const studentData = {
      name,
      contact,
      status,
      observation,
      planDetails: {
        type: selectedPlan,
        startDate: planStartDate,
        duration: Number(planDuration),
        endDate: planEndDate,
      },
    };

    try {
      // Esperamos a que la función principal de guardado termine.
      await onSave(key, studentData, "agregar", null);

      // Si tuvo éxito, llamamos a la función para el paso final.
      if (onConfirmationComplete && personData.id) {
        await onConfirmationComplete(personData.id);
      }

      onClose(); // Cerramos el modal solo si todo fue exitoso.
    } catch (error) {
      // Si 'onSave' falla (por ejemplo, por un duplicado), el error ya se muestra
      // y no cerramos el modal para que el usuario pueda corregir los datos.
      console.error("No se pudo inscribir al alumno:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Confirmar e Inscribir Alumno
        </h2>
        <p className="text-gray-600 mb-6">
          Estás a punto de inscribir a <span className="font-bold">{name}</span>
          . Por favor, completa los detalles del plan.
        </p>

        {/* Recordatorio de Preferencias del Cliente */}
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 p-4 rounded-r-lg mb-6">
          <p className="font-bold text-sm">Preferencias del cliente:</p>
          <p className="text-sm">
            Plan de interés: <strong>{personData.plan}</strong>
          </p>
          <p className="text-sm">
            Horarios deseados: <strong>{personData.hours.join(", ")}</strong>
          </p>
        </div>

        {/* --- Selectores de Plan y Hora --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Grupo de Horarios *
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="shadow border rounded w-full py-2 px-3"
            >
              <option value="L-M-V">Lunes-Miércoles-Viernes</option>
              <option value="M-J">Martes-Jueves</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Hora de la Clase (Disponibles) *
            </label>
            {/* --- INICIO DE LA MODIFICACIÓN: GRILLA DE HORARIOS --- */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border rounded p-3 h-48 overflow-y-auto bg-gray-50">
              {availableHours.length > 0 ? (
                availableHours.map((hour) => (
                  <button
                    key={hour}
                    onClick={() => setSelectedHour(hour)}
                    className={`p-2 rounded-md cursor-pointer transition-colors text-sm font-semibold ${
                      selectedHour === hour
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {hour}
                  </button>
                ))
              ) : (
                <div className="col-span-full flex items-center justify-center text-sm text-gray-500 italic">
                  No hay cupos en este grupo
                </div>
              )}
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
          </div>
        </div>

        {/* --- Formulario del Plan --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fecha de Contratación *
            </label>
            <DatePicker
              selected={planStartDateObj}
              onChange={(date) => {
                setPlanStartDateObj(date);
                setPlanStartDate(date.toISOString().slice(0, 10));
              }}
              dateFormat="dd/MM/yyyy"
              className="shadow appearance-none border rounded w-full py-2 px-3"
              locale={es}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Duración del Plan *
            </label>
            <select
              value={planDuration}
              onChange={(e) => setPlanDuration(e.target.value)}
              className="shadow border rounded w-full py-2 px-3"
            >
              <option value="30">Mensual</option>
              <option value="90">Trimestral</option>
              <option value="180">Semestral</option>
              <option value="360">Anual</option>
            </select>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-right mb-4">
          Vence el:{" "}
          {planEndDate &&
            new Date(planEndDate + "T00:00:00").toLocaleDateString("es-ES")}
        </p>

        {/* --- Botones de Acción --- */}
        <div className="flex items-center justify-end mt-8 gap-4 border-t pt-6">
          <button
            onClick={onClose}
            className="font-bold text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmAndSave}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md"
          >
            Confirmar e Inscribir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmarListaEspera;
