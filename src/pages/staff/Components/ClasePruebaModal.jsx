import React, { useState, useEffect } from "react";
import HorariosDisponiblesModal from "./HorariosDisponiblesModal";
import { set } from "date-fns";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import axios from "axios";

const OPCIONES_TIPO = ["Agenda", "Visita programada", "Clase de prueba"];


const inicialValuesHorariosSeleccionados = {
    hhmm: '',
    grp: ''
  }

const ClasePruebaModal = ({
  isOpen,
  onClose,
  onSave,
  numeroClase,
  prospecto, // objeto completo
  tipoSeleccionado, // string desde el padre (puede venir vacío)
  horariosDisponiblesPilates
}) => {
   if (!isOpen) return null;
  const [fecha, setFecha] = useState("");
  // fechaDate es el Date object usado por react-datepicker
  const [fechaDate, setFechaDate] = useState(null);
  const [observacion, setObservacion] = useState("");
  const [tipo, setTipo] = useState(""); // 👈 ahora editable
  const [abrirHorariosDisponibles, setAbrirHorariosDisponibles] =
    useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(inicialValuesHorariosSeleccionados);
  const [horarioSeleccionadoAux, setHorarioSeleccionadoAux] = useState(inicialValuesHorariosSeleccionados);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [esModificacion, setEsModificacion] = useState(false);
  const [noEsPilates, setNoEsPilates] = useState(false); // para bloquear horarios si no es Pilates porque se ha cambiado la actividad a otro como por ejemplo "Agenda, Musculacion, etc." cuando originalmente era Pilates


  const letraADiaDefault = { L: 1, M: 2, X: 3, J: 4, V: 5 };

  const mapGroupToWeekdays = (grp) => {
    if (!grp) return null;
    const g = String(grp).toUpperCase().replace(/\s+/g, '');
    if (g === 'LMV') return [1, 3, 5];
    if (g === 'MJ') return [2, 4];
    return g.split("").map(l => letraADiaDefault[l]).filter(Boolean);
  };

    useEffect(() => {
    if (prospecto?.id && numeroClase) {
      axios
        .get(`http://localhost:8080/ventas-prospectos-horarios/${prospecto.id}`)
        .then((res) => {
          const horarios = res.data;
          // Buscar el horario guardado para la clase actual
          const horarioGuardado = horarios.find(h => h.clase_num === numeroClase);
          setEsModificacion(!!horarioGuardado);
          if (horarioGuardado) {
            setHorarioSeleccionado({
              hhmm: horarioGuardado.hhmm,
              grp: horarioGuardado.grp
            });
            setHorarioSeleccionadoAux({
              hhmm: horarioGuardado.hhmm,
              grp: horarioGuardado.grp
            });
          } else {
            setHorarioSeleccionado(inicialValuesHorariosSeleccionados);
            setHorarioSeleccionadoAux(inicialValuesHorariosSeleccionados);
          }
        })
        .catch(() => {
          setHorarioSeleccionado(inicialValuesHorariosSeleccionados);
          setHorarioSeleccionadoAux(inicialValuesHorariosSeleccionados);
        });
    }
  }, [prospecto?.id, numeroClase]);

  // Devuelve true si la fecha (Date) está permitida según el grupo.
  // Si no hay grupo seleccionado, retorna true (permitir todo) según lo pedido.
  const isDateAllowed = (date) => {
    if (!date) return true;
    const grp = horarioSeleccionado?.grp;
    if (!grp) return true;
    const allowed = mapGroupToWeekdays(grp) || [];
    const day = date.getDay(); // 0=domingo ... 6=sábado
    // bloquear sábados y domingos cuando hay grupo
    if (day === 0 || day === 6) return false;
    return allowed.includes(day);
  };

  // Sincronizar string ISO <-> Date object
  useEffect(() => {
    if (fecha) setFechaDate(new Date(fecha + 'T00:00:00'));
    else setFechaDate(null);
  }, [fecha]);


  useEffect(() => {
    if (prospecto && prospecto.actividad === "Pilates" && tipoSeleccionado === "Clase de prueba" || tipoSeleccionado === "Visita programada") {
      setAbrirHorariosDisponibles(true);
      setNoEsPilates(false);
    }else if(prospecto && prospecto.actividad != "Pilates" && tipoSeleccionado === "Clase de prueba" || tipoSeleccionado === "Visita programada"){
      setNoEsPilates(true);
    }
  }, [tipoSeleccionado, prospecto]);

  useEffect(() => {
    if (prospecto && numeroClase) {
      const fechaKey = `clase_prueba_${numeroClase}_fecha`;
      const obsKey = `clase_prueba_${numeroClase}_obs`;
      const tipoKey = `clase_prueba_${numeroClase}_tipo`;

      setFecha(prospecto[fechaKey]?.slice(0, 10) || "");
      setObservacion(prospecto[obsKey] || "");
      // prioridad: lo que el padre haya seleccionado (picker) > lo guardado
      setTipo(tipoSeleccionado || prospecto[tipoKey] || "");
    }
  }, [prospecto, numeroClase, tipoSeleccionado]);

  const handleSubmit = () => {
    const fechaKey = `clase_prueba_${numeroClase}_fecha`;
    const obsKey = `clase_prueba_${numeroClase}_obs`;
    const tipoKey = `clase_prueba_${numeroClase}_tipo`;
    const nombre = prospecto?.nombre;
    const contacto = prospecto?.contacto;
    const idProspecto = prospecto?.id;
    if(!fecha) {
      alert("Seleccione una fecha por favor.");
      return;
    }
    onSave(prospecto.id, {
      [fechaKey]: fecha || null,
      [obsKey]: observacion || "",
      [tipoKey]: tipo || null,
      fecha,
      numeroClase,
      tipo,
      nombre,
      contacto,
      horarioSeleccionado,
      diaSeleccionado,
      idProspecto,
      esModificacion
    });

    onClose();
  };

  if (!isOpen) return null;


  const handlePasarSiguienteFase = (seleccion) => {
    if (seleccion) {
      const horarioNormalizado = seleccion.split(" ");
      setAbrirHorariosDisponibles(false);
      setHorarioSeleccionado({
        hhmm: horarioNormalizado[0],
        grp: horarioNormalizado[1],
      });
      setHorarioSeleccionadoAux({
        hhmm: horarioNormalizado[0],
        grp: horarioNormalizado[1],
      });
    }
  };
  const hayHorarioSeleccionado =
    horarioSeleccionado.hhmm !== "" && horarioSeleccionado.grp !== "";

  useEffect(() => {
    if (tipo !== "Clase de prueba") {
      setHorarioSeleccionado(inicialValuesHorariosSeleccionados);
    }else{
      setHorarioSeleccionado(horarioSeleccionadoAux);
    }
  }, [tipo]);


  return (
    <>
      {abrirHorariosDisponibles ? (
        <HorariosDisponiblesModal
          onClose={onClose}
          confirmar={handlePasarSiguienteFase}
          horariosDisponiblesPilates={horariosDisponiblesPilates}
            horarioInicial={
    horarioSeleccionado.hhmm && horarioSeleccionado.grp
      ? `${horarioSeleccionado.hhmm} ${horarioSeleccionado.grp}`
      : null
  }
        ></HorariosDisponiblesModal>
      ) : (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-600">
              Clase #{numeroClase} — {prospecto?.nombre || "Prospecto"}
            </h2>
            {/* Tipo (editable) */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1">Tipo:</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="" disabled>
                  Seleccioná una opción
                </option>
                {OPCIONES_TIPO.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Grupo de horario seleccionado */}
            {hayHorarioSeleccionado > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <label className="block text-sm text-gray-700">
                    Grupo de horario seleccionado:
                  </label>
                  <button
                    onClick={!noEsPilates ? () => setAbrirHorariosDisponibles(true) : undefined}
                    className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded ${noEsPilates ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    Editar
                  </button>
                </div>
                <div className="font-mono text-base sm:text-lg">
                  {" "}
                  Días: {horarioSeleccionado.grp || "No seleccionado"}
                </div>
                <div className="font-mono text-base sm:text-lg">
                  {(() => {
                    if (!horarioSeleccionado.hhmm)
                      return "Hora: No seleccionado";

                    const [hh] = horarioSeleccionado.hhmm.split(":");
                    const hora = Number(hh);

                    const periodo = hora >= 12 ? "PM" : "AM";

                    return `Hora: ${hora}:00${periodo}`;
                  })()}
                </div>
              </div>
            )}
            {/* Fecha */}
            <div className="mb-4">
              <label className="block text-sm text-gray-700">Fecha:</label>
              <DatePicker
                selected={fechaDate}
                onChange={(date) => {
                  if (!date) {
                    setFecha("");
                    setFechaDate(null);
                    setDiaSeleccionado(null);
                    return;
                  }
                  if (!isDateAllowed(date)) return;
                  const iso = date.toISOString().slice(0, 10);
                  setFecha(iso);
                  setFechaDate(date);

                  // Guardar el día en español, sin acentos y en mayúsculas
                  const dias = [
                    "DOMINGO",
                    "LUNES",
                    "MARTES",
                    "MIERCOLES",
                    "JUEVES",
                    "VIERNES",
                    "SABADO",
                  ];
                  const diaSemana = dias[date.getDay()];
                  setDiaSeleccionado(diaSemana);
                }}
                filterDate={isDateAllowed}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccioná una fecha"
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                locale={es}
              />
            </div>
            {/* Observación */}
            <div className="mb-1">
              <label className="block text-sm text-gray-700">
                Observación:
              </label>
              <textarea
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-60"
                disabled={!tipo} // obligamos a elegir tipo
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClasePruebaModal;
