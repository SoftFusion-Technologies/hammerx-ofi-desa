import React, { useState, useEffect } from 'react';
import HorariosDisponiblesModal from './HorariosDisponiblesModal';
import { set } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { es } from 'date-fns/locale';
import axios from 'axios';

const OPCIONES_TIPO = ['Agenda', 'Visita programada', 'Clase de prueba'];

const inicialValuesHorariosSeleccionados = {
  hhmm: '',
  grp: ''
};

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

  const [fecha, setFecha] = useState('');
  const [fechaDate, setFechaDate] = useState(null);
  const [observacion, setObservacion] = useState('');
  const [tipo, setTipo] = useState('');
  const [abrirHorariosDisponibles, setAbrirHorariosDisponibles] =
    useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(
    inicialValuesHorariosSeleccionados
  );
  const [horarioSeleccionadoAux, setHorarioSeleccionadoAux] = useState(
    inicialValuesHorariosSeleccionados
  );
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);
  const [esModificacion, setEsModificacion] = useState(false);
  const [noEsPilates, setNoEsPilates] = useState(false);

  // Benjamin Orellana - 2026/04/27 - Nuevo estado para la hora manual del flujo no-Pilates y para decidir si debe impactar planilla/agendas.
  const [horaClase, setHoraClase] = useState('');
  const [necesitaProfe, setNecesitaProfe] = useState(false);

  const letraADiaDefault = { L: 1, M: 2, X: 3, J: 4, V: 5 };

  // Benjamin Orellana - 2026/04/27 - Normaliza el flag necesita_profe para soportar boolean, entero o string persistido desde backend.
  const resolverNecesitaProfe = (valor) =>
    valor === true || valor === 1 || String(valor || '').trim() === '1';

  const mapGroupToWeekdays = (grp) => {
    if (!grp) return null;
    const g = String(grp).toUpperCase().replace(/\s+/g, '');
    if (g === 'LMV') return [1, 3, 5];
    if (g === 'MJ') return [2, 4];
    return g
      .split('')
      .map((l) => letraADiaDefault[l])
      .filter(Boolean);
  };

  // Benjamin Orellana - 2026/04/27 - Determina si el tipo actual es relevante para pedir profesor o mostrar selector de horarios.
  const esTipoConPlanilla = (valorTipo) =>
    valorTipo === 'Clase de prueba' || valorTipo === 'Visita programada';

  // Benjamin Orellana - 2026/04/27 - Convierte correctamente fechas ISO del backend a hora local para no correr 3 horas en el modal interno.
  const formatearHoraInput = (valor) => {
    if (!valor) return '';

    const texto = String(valor).trim();

    if (texto.includes('T')) {
      const fecha = new Date(texto);

      if (Number.isNaN(fecha.getTime())) return '';

      const hh = String(fecha.getHours()).padStart(2, '0');
      const mm = String(fecha.getMinutes()).padStart(2, '0');

      return `${hh}:${mm}`;
    }

    return texto.length >= 5 ? texto.slice(0, 5) : '';
  };

  // Benjamin Orellana - 2026/04/27 - Normaliza la hora operativa del gym para que horarios de madrugada se interpreten como tarde y se limite el rango 06:00-23:00.
  const normalizarHoraOperativaGym = (valor) => {
    if (!valor) return '';

    const texto = String(valor).trim();
    const match = texto.match(/^(\d{2}):(\d{2})$/);

    if (!match) return '';

    let horas = Number(match[1]);
    const minutos = Number(match[2]);

    if (Number.isNaN(horas) || Number.isNaN(minutos)) return '';

    // Si cargan 00:00 a 05:59, se interpreta como horario PM.
    if (horas >= 0 && horas < 6) {
      horas += 12;
    }

    // Límite operativo del gimnasio: 06:00 a 23:00
    if (horas < 6) horas = 6;
    if (horas > 23) horas = 23;

    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };

  useEffect(() => {
    if (prospecto?.id && numeroClase) {
      axios
        .get(`http://localhost:8080/ventas-prospectos-horarios/${prospecto.id}`)
        .then((res) => {
          const horarios = res.data;
          const horarioGuardado = horarios.find(
            (h) => h.clase_num === numeroClase
          );
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

  const isDateAllowed = (date) => {
    if (!date) return true;
    const grp = horarioSeleccionado?.grp;
    if (!grp) return true;
    const allowed = mapGroupToWeekdays(grp) || [];
    const day = date.getDay();
    if (day === 0 || day === 6) return false;
    return allowed.includes(day);
  };

  useEffect(() => {
    if (fecha) setFechaDate(new Date(fecha + 'T00:00:00'));
    else setFechaDate(null);
  }, [fecha]);

  useEffect(() => {
    const actividad = prospecto?.actividad;
    const isTipoRelevant = esTipoConPlanilla(tipo);

    if (prospecto && actividad === 'Pilates' && isTipoRelevant) {
      setAbrirHorariosDisponibles(true);
      setNoEsPilates(false);
    } else if (prospecto && actividad !== 'Pilates' && isTipoRelevant) {
      setAbrirHorariosDisponibles(false);
      setNoEsPilates(true);
    } else {
      setAbrirHorariosDisponibles(false);
      setNoEsPilates(false);
    }
  }, [tipo, prospecto]);

  useEffect(() => {
    if (prospecto && numeroClase) {
      const fechaKey = `clase_prueba_${numeroClase}_fecha`;
      const obsKey = `clase_prueba_${numeroClase}_obs`;
      const tipoKey = `clase_prueba_${numeroClase}_tipo`;

      const fechaValor = prospecto[fechaKey] || '';
      const fechaISO = fechaValor ? String(fechaValor).slice(0, 10) : '';
      const horaISO = fechaValor ? formatearHoraInput(fechaValor) : '';

      console.log(prospecto?.necesita_profe);
      setFecha(fechaISO);
      setObservacion(prospecto[obsKey] || '');
      setTipo(tipoSeleccionado || prospecto[tipoKey] || '');
      setHoraClase(normalizarHoraOperativaGym(horaISO));
      setNecesitaProfe(resolverNecesitaProfe(prospecto?.necesita_profe));
    }
  }, [prospecto, numeroClase, tipoSeleccionado]);

  const handleSubmit = () => {
    const fechaKey = `clase_prueba_${numeroClase}_fecha`;
    const obsKey = `clase_prueba_${numeroClase}_obs`;
    const tipoKey = `clase_prueba_${numeroClase}_tipo`;
    const nombre = prospecto?.nombre;
    const contacto = prospecto?.contacto;
    const idProspecto = prospecto?.id;
    const esPilates = prospecto?.actividad === 'Pilates';
    const horaFinal = esPilates
      ? horarioSeleccionado.hhmm
      : normalizarHoraOperativaGym(horaClase);
    if (!fecha) {
      alert('Seleccione una fecha por favor.');
      return;
    }

    if (!horaFinal) {
      alert('Seleccione una hora por favor.');
      return;
    }

    if (!tipo) {
      alert('Seleccione un tipo por favor.');
      return;
    }

    if (esPilates && esTipoConPlanilla(tipo) && !horarioSeleccionado.hhmm) {
      alert('Seleccione un horario de Pilates por favor.');
      return;
    }

    onSave(prospecto.id, {
      [fechaKey]: fecha || null,
      [obsKey]: observacion || '',
      [tipoKey]: tipo || null,
      fecha,
      hora_clase: horaFinal,
      numeroClase,
      tipo,
      nombre,
      contacto,
      horarioSeleccionado,
      diaSeleccionado,
      idProspecto,
      esModificacion,
      necesita_profe: esPilates ? false : necesitaProfe,
      hhmm: esPilates ? horarioSeleccionado.hhmm : '',
      grp: esPilates ? horarioSeleccionado.grp : '',
      sede_id: prospecto?.sede_id || null
    });

    onClose();
  };

  const handlePasarSiguienteFase = (seleccion) => {
    if (seleccion) {
      const horarioNormalizado = seleccion.split(' ');
      setAbrirHorariosDisponibles(false);
      setHorarioSeleccionado({
        hhmm: horarioNormalizado[0],
        grp: horarioNormalizado[1]
      });
      setHorarioSeleccionadoAux({
        hhmm: horarioNormalizado[0],
        grp: horarioNormalizado[1]
      });
    }
  };

  const hayHorarioSeleccionado =
    horarioSeleccionado.hhmm !== '' && horarioSeleccionado.grp !== '';
  // Benjamin Orellana - 2026/04/27 - Evita resetear horarios al montar el modal con tipo vacío; solo reacciona cuando ya existe un tipo definido.
  useEffect(() => {
    if (!tipo) return;

    if (!esTipoConPlanilla(tipo)) {
      setHorarioSeleccionado(inicialValuesHorariosSeleccionados);
    } else {
      setHorarioSeleccionado(horarioSeleccionadoAux);
    }
  }, [tipo, horarioSeleccionadoAux]);
  // Benjamin Orellana - 2026/04/27 - Solo limpia necesitaProfe cuando el usuario ya tiene un tipo definido y ese tipo no requiere planilla/agendas.
  useEffect(() => {
    if (!tipo) return;

    if (!esTipoConPlanilla(tipo)) {
      setNecesitaProfe(false);
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
        />
      ) : (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-3">
          <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xl w-full max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-orange-600">
              Clase #{numeroClase} — {prospecto?.nombre || 'Prospecto'}
            </h2>

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

            {hayHorarioSeleccionado > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <label className="block text-sm text-gray-700">
                    Grupo de horario seleccionado:
                  </label>
                  <button
                    onClick={
                      !noEsPilates
                        ? () => setAbrirHorariosDisponibles(true)
                        : undefined
                    }
                    className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded ${
                      noEsPilates ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    Editar
                  </button>
                </div>
                <div className="font-mono text-base sm:text-lg">
                  Días: {horarioSeleccionado.grp || 'No seleccionado'}
                </div>
                <div className="font-mono text-base sm:text-lg">
                  {(() => {
                    if (!horarioSeleccionado.hhmm)
                      return 'Hora: No seleccionado';

                    const [hh] = horarioSeleccionado.hhmm.split(':');
                    const hora = Number(hh);
                    const periodo = hora >= 12 ? 'PM' : 'AM';

                    return `Hora: ${hora}:00${periodo}`;
                  })()}
                </div>
              </div>
            )}

            {prospecto?.actividad !== 'Pilates' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-700">Hora:</label>
                <input
                  type="time"
                  value={horaClase}
                  min="06:00"
                  max="23:00"
                  step="60"
                  onChange={(e) =>
                    setHoraClase(normalizarHoraOperativaGym(e.target.value))
                  }
                  onBlur={(e) =>
                    setHoraClase(normalizarHoraOperativaGym(e.target.value))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                />
              </div>
            )}

            {prospecto?.actividad !== 'Pilates' && esTipoConPlanilla(tipo) && (
              <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={necesitaProfe}
                    onChange={(e) => setNecesitaProfe(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-semibold text-gray-800">
                      Necesita profesor
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Si activás esta opción, ventas internas intentará asignar
                      un instructor según sede, día, hora y agenda.
                    </div>
                  </div>
                </label>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-700">Fecha:</label>
              <DatePicker
                selected={fechaDate}
                onChange={(date) => {
                  if (!date) {
                    setFecha('');
                    setFechaDate(null);
                    setDiaSeleccionado(null);
                    return;
                  }
                  if (!isDateAllowed(date)) return;
                  const iso = date.toISOString().slice(0, 10);
                  setFecha(iso);
                  setFechaDate(date);

                  const dias = [
                    'DOMINGO',
                    'LUNES',
                    'MARTES',
                    'MIERCOLES',
                    'JUEVES',
                    'VIERNES',
                    'SABADO'
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
                disabled={!tipo}
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
