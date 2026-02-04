/*
Autor: Sergio Manrique
Descripción: 
Este componente renderiza los 4 paneles informativos superiores del dashboard:
1. Turnos Libres (filtrando horarios deshabilitados).
2. Planes Vencidos.
3. Alumnos Ausentes.
4. Coincidencias de Lista de Espera (filtrando si los horarios buscados están deshabilitados).
Permite expandir/contraer la vista y activar/desactivar paneles individualmente.
*/

import {
  FaExpandAlt,
  FaCompressAlt,
  FaClock,
  FaUserTimes,
  FaUserClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
const PanelesSuperiores = ({
  freeSlots,
  expiredStudents,
  waitingListMatches,
  visiblePanels,
  onToggle,
  alumnosAusentes = [],
  onOpenModalDetalleAusentes,
  horariosDeshabilitados = [],
  sedeActualFiltro,
  sedesDatos
}) => {
  // Estado para controlar si los paneles se muestran con altura completa o reducida
  const [allExpanded, setAllExpanded] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Función simple para alternar el estado de expansión visual
  const handleExpandAllToggle = () => {
    setAllExpanded(!allExpanded);
  };


  // 1. Filtra los TURNOS LIBRES
  // Objetivo: Eliminar de la visualización los cupos libres que corresponden a horarios que el admin ocultó.
  const freeSlotsFiltrados = useMemo(() => {
    const filtrarHorarios = (slots, grupo) => {
      if (!horariosDeshabilitados || horariosDeshabilitados.length === 0) {
        return slots;
      }
      // Determina los tipos de bloqueo que afectan a este grupo
      let tiposPermitidos = [];
      if (grupo === 'lmv') {
        tiposPermitidos = ['lmv', 'todos'];
      } else if (grupo === 'mj') {
        tiposPermitidos = ['mj', 'todos'];
      }
      // Obtiene las horas bloqueadas para este grupo
      const horasBloqueadas = horariosDeshabilitados
        .filter((bloqueo) => tiposPermitidos.includes(bloqueo.tipo_bloqueo))
        .map((bloqueo) => bloqueo.hora_label);
      // Filtra los slots que NO están bloqueados para este grupo
      return slots.filter((slot) => !horasBloqueadas.includes(slot.hour));
    };

    // Aplicamos el filtro a ambos grupos (Lunes-Miércoles-Viernes y Martes-Jueves)
    return {
      lmv: filtrarHorarios(freeSlots.lmv || [], 'lmv'),
      mj: filtrarHorarios(freeSlots.mj || [], 'mj')
    };
  }, [freeSlots, horariosDeshabilitados]);

  // 2. Filtra las COINCIDENCIAS de Lista de Espera
  // MODIFICADO: Ahora devolvemos la lista completa.
  // La validación visual de "habilitado/deshabilitado" se hace directamente en el renderizado (JSX).
  const waitingListMatchesFiltrados = useMemo(() => {
    if (!waitingListMatches) return [];
    return waitingListMatches;
  }, [waitingListMatches]);

  // Cuenta cuántos paneles están activos (true) para calcular el ancho de las columnas
  const activePanelsCount = Object.values(visiblePanels).filter(Boolean).length;

  // Mapa para asignar clases de grid de Tailwind según la cantidad de paneles activos
  const gridColsClass = {
    1: 'xl:grid-cols-1',
    2: 'xl:grid-cols-2',
    3: 'xl:grid-cols-3',
    4: 'xl:grid-cols-4'
  };

  // String final de clases para el contenedor grid
  const gridClasses = `grid grid-cols-1 md:grid-cols-2 ${
    gridColsClass[activePanelsCount] || 'xl:grid-cols-4'
  } gap-6 mb-8`;

  // Objeto de configuración estática para colores, iconos y títulos (evita repetir código en el JSX)
  const panelStyles = {
    freeSlots: { color: 'blue', icon: <FaClock />, title: 'Turnos Libres' },
    expiredStudents: {
      color: 'rose',
      icon: <FaUserTimes />,
      title: 'Planes Vencidos'
    },
    absentStudents: {
      color: 'amber',
      icon: <FaUserClock />,
      title: 'Ausentes'
    },
    waitingListMatches: {
      color: 'emerald',
      icon: <FaCheckCircle />,
      title: '¡Turnos libres! para:'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full"
    >
      {/* --- SECCIÓN: BARRA DE CONTROL Y FILTROS --- */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="flex flex-col xl:flex-row items-center justify-between gap-4 mb-6 w-full bg-zinc-900 bg-opacity-40 p-4 rounded-2xl shadow-sm border border-gray-400"
      >
        {/* GRUPO DE BOTONES FILTROS */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start p-1.5 rounded-xl gap-2 w-full xl:w-auto">
          {[
            { name: 'Libres', key: 'freeSlots', textClass: 'text-blue-600' },
            {
              name: 'Vencidos',
              key: 'expiredStudents',
              textClass: 'text-rose-600'
            },
            {
              name: 'Ausentes',
              key: 'absentStudents',
              textClass: 'text-amber-600'
            },
            {
              name: 'Coincidencias',
              key: 'waitingListMatches',
              textClass: 'text-emerald-600'
            }
          ].map((btn) => {
            const visibleCount =
              Object.values(visiblePanels).filter(Boolean).length;
            const isActive = visiblePanels[btn.key];
            const isDisabled = isActive && visibleCount <= 1;

            return (
              <motion.button
                key={btn.key}
                onClick={() => !isDisabled && onToggle(btn.key)}
                disabled={isDisabled}
                whileHover={!isDisabled ? { scale: 1.05 } : {}}
                whileTap={!isDisabled ? { scale: 0.95 } : {}}
                className={`
                  flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200
                  ${
                    isActive
                      ? `bg-white shadow-sm ring-1 ring-black/5 ${btn.textClass} scale-[1.02]`
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }
                  ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed'
                      : 'cursor-pointer'
                  }
                `}
              >
                {btn.name}
              </motion.button>
            );
          })}
        </div>

        {/* BOTÓN PARA EXPANDIR/CONTRAER PANELES */}
        <motion.button
          onClick={handleExpandAllToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="
            group w-full xl:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
            bg-white border-2 border-slate-100 text-slate-500 font-bold
            hover:border-slate-300 hover:text-slate-700 hover:shadow-sm
            transition-all duration-200
          "
        >
          {allExpanded ? (
            <FaCompressAlt className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          ) : (
            <FaExpandAlt className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          )}
          <span>{allExpanded ? 'Contraer vista' : 'Expandir vista'}</span>
        </motion.button>
      </motion.div>

      {/* --- SECCIÓN: GRILLA CONTENEDORA DE PANELES --- */}
      <div className={gridClasses}>
        {/* --- PANEL 1: TURNOS LIBRES --- */}
        {visiblePanels.freeSlots && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-blue-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
          >
            {/* Header Turnos Libres */}
            <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                {panelStyles.freeSlots.icon}
                <h3 className="font-bold">{panelStyles.freeSlots.title}</h3>
                <motion.button
                  className={`p-1 rounded-full flex items-center gap-1 text-xs font-semibold
                    ${copiado ? 'bg-green-500 text-white' : 'text-blue-700 bg-blue-100 hover:bg-blue-200'}
                  `}
                  whileTap={{ scale: 0.95 }}
                  animate={copiado ? { scale: 1.05, boxShadow: '0 0 5px #22c55e' } : { scale: 1, boxShadow: '0 0 0px transparent' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={() => {
                    // Formatear los turnos libres para WhatsApp
                    const formatSlots = (label, slots) => {
                      if (!slots.length) return '';
                      // Convierte hora 24hs a string con AM/PM
                      const formatHour = (hourStr) => {
                        if (/am|pm/i.test(hourStr)) return hourStr;
                        const [h, m] = hourStr.split(':');
                        const hour = parseInt(h, 10);
                        const suffix = hour < 12 ? 'AM' : 'PM';
                        return `${hourStr} ${suffix}`;
                      };
                      return `*${label}:*\n` +
                        slots.map(slot => `- ${formatHour(slot.hour)} (${slot.count} cupos disponibles)`).join('\n') + '\n';
                    };
                    let sede;
                    if (sedesDatos && sedeActualFiltro) {
                      const sedeSeleccionada = sedesDatos.find(
                        (sede) => String(sede.id) === String(sedeActualFiltro)
                      );
                      const nombreSedeSeleccionada =
                        (sedeSeleccionada && (sedeSeleccionada.nombre || sedeSeleccionada.ciudad || sedeSeleccionada.sede)) || '';
                      sede = nombreSedeSeleccionada;
                    }
                    const lmvText = formatSlots('Lunes-Miércoles-Viernes', freeSlotsFiltrados.lmv);
                    const mjText = formatSlots('Martes-Jueves', freeSlotsFiltrados.mj);
                    const finalText = `${sede ? `Sede: ${sede}\n` : ''}${lmvText}${mjText}`.trim() || 'Sin turnos disponibles';
                    navigator.clipboard.writeText(finalText);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 1200);
                  }}
                  title="Copiar turnos libres para WhatsApp"
                >
                  <Copy size={16} className="inline-block" />
                  {copiado ? 'Copiado' : 'Copiar'}
                </motion.button>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {freeSlotsFiltrados.lmv.length + freeSlotsFiltrados.mj.length}
              </span>
            </div>

            {/* Content Turnos Libres */}
            <div
              className={`${allExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4`}
            >
              {freeSlotsFiltrados.lmv.length > 0 ||
              freeSlotsFiltrados.mj.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Columna Lunes-Miércoles-Viernes */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Lun - Mié - Vie
                    </p>
                    <ul className="space-y-1">
                      {freeSlotsFiltrados.lmv.map((slot, idx) => (
                        <motion.li
                          key={`lmv-${slot.hour}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.2 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="flex flex-wrap gap-1 justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group"
                        >
                          <span className="text-gray-700 font-mono font-medium">
                            {slot.hour}
                          </span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md group-hover:bg-blue-200 transition-colors">
                            {slot.count} cupos
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                    {freeSlotsFiltrados.lmv.length === 0 && (
                      <div className="text-gray-400 text-sm italic p-2">
                        Sin turnos disponibles
                      </div>
                    )}
                  </div>

                  {/* Columna Martes-Jueves */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Mar - Jue
                    </p>
                    <ul className="space-y-1">
                      {freeSlotsFiltrados.mj.map((slot, idx) => (
                        <motion.li
                          key={`mj-${slot.hour}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03, duration: 0.2 }}
                          whileHover={{ scale: 1.02, x: 4 }}
                          className="flex flex-wrap gap-1 justify-between items-center p-2 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors group"
                        >
                          <span className="text-gray-700 font-mono font-medium">
                            {slot.hour}
                          </span>
                          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md group-hover:bg-blue-200 transition-colors">
                            {slot.count} cupos
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                    {freeSlotsFiltrados.mj.length === 0 && (
                      <div className="text-gray-400 text-sm italic p-2">
                        Sin turnos disponibles
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <FaClock size={24} className="mb-2" />
                  <p className="text-sm italic">Sin turnos libres</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- PANEL 2: ALUMNOS VENCIDOS --- */}
        {visiblePanels.expiredStudents && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-rose-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
          >
            <div className="bg-rose-50/50 p-4 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700">
                {panelStyles.expiredStudents.icon}
                <h3 className="font-bold">
                  {panelStyles.expiredStudents.title}
                </h3>
              </div>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {expiredStudents.length}
              </span>
            </div>

            <div
              className={`${allExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4`}
            >
              {expiredStudents.length > 0 ? (
                <ul className="space-y-2">
                  {expiredStudents.map((student, idx) => (
                    <motion.li
                      key={`${student.name}-${idx}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                      whileHover={{ scale: 1.02, x: 4 }}
                      className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-gray-800 text-sm truncate">
                          {student.name}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded bg-white">
                          Vencido
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{student.type}</span>
                        <span className="font-mono">{student.date}</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <FaCheckCircle size={24} className="mb-2 text-green-400" />
                  <p className="text-sm italic">Todos al día</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- PANEL 3: ALUMNOS AUSENTES --- */}
        {visiblePanels.absentStudents && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-amber-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
          >
            <div className="bg-amber-50/50 p-4 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                {panelStyles.absentStudents.icon}
                <h3 className="font-bold">
                  {panelStyles.absentStudents.title}
                </h3>
              </div>
              <button
                onClick={onOpenModalDetalleAusentes}
                className="text-xs font-bold text-amber-700 hover:text-amber-900 underline decoration-amber-300 underline-offset-2 transition-colors"
              >
                Ver detalle
              </button>
            </div>

            <div
              className={`${allExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4`}
            >
              {alumnosAusentes.length > 0 ? (
                <ul className="space-y-1.5">
                  {alumnosAusentes.map((alumno, idx) => {
                    const colorAlerta = alumno.color_alerta || 'VERDE';
                    const esAmarillo = colorAlerta === 'AMARILLO';
                    const esRojo = colorAlerta === 'ROJO';
                    const esVerde = colorAlerta === 'VERDE';

                    return (
                      <motion.li
                        key={alumno.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.2 }}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                          esAmarillo
                            ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50"
                            : esRojo
                            ? "bg-red-100 text-red-800 border-red-200 hover:bg-red-50"
                            : "bg-green-100 text-green-800 border-green-200 hover:bg-green-50"
                        }`}
                        title={
                          esAmarillo
                            ? "Esperando respuesta del alumno"
                            : esRojo
                            ? "Requiere contacto urgente: 3+ faltas sin gestión"
                            : "Contactado recientemente o dentro de tolerancia"
                        }
                      >
                        <span className="text-sm font-medium truncate pr-2">
                          {alumno.name}
                        </span>
                        <span
                          className={`flex-shrink-0 text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                            esAmarillo
                              ? "bg-yellow-200 text-yellow-900"
                              : esRojo
                              ? "bg-red-200 text-red-900"
                              : "bg-green-200 text-green-900"
                          }`}
                        >
                          {alumno.faltas_desde_ultimo_presente}
                        </span>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <FaExclamationTriangle size={24} className="mb-2" />
                  <p className="text-sm italic">Sin ausencias registradas</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* --- PANEL 4: COINCIDENCIAS LISTA ESPERA --- */}
        {visiblePanels.waitingListMatches && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-emerald-100 overflow-hidden flex flex-col transition-all duration-300 hover:shadow-xl"
          >
            <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-700">
                {panelStyles.waitingListMatches.icon}
                <h3 className="font-bold">
                  {panelStyles.waitingListMatches.title}
                </h3>
              </div>
              {/* Usa la longitud filtrada por horarios deshabilitados */}
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {waitingListMatchesFiltrados.length}
              </span>
            </div>

            <div
              className={`${allExpanded ? 'h-96' : 'h-64'} overflow-y-auto p-4`}
            >
              {/* Usa el array filtrado para no mostrar coincidencias en horarios ocultos */}
              {waitingListMatchesFiltrados.length > 0 ? (
                <ul className="space-y-3">
                  {waitingListMatchesFiltrados.map((person, idx) => {
                    // Lógica para detectar si TODOS los horarios que quiere el alumno están deshabilitados
                    const todosDeshabilitados =
                      horariosDeshabilitados &&
                      horariosDeshabilitados.length > 0 &&
                      person.hours.every((hour) =>
                        horariosDeshabilitados.includes(hour)
                      );
                    // Lógica para contacto pendiente
                    const contactoPendiente =
                      person.contacto_cliente &&
                      person.contacto_cliente.estado_contacto === 'Pendiente';
                    return (
                      <motion.li
                        key={person.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className={`p-3 rounded-xl border transition-all hover:shadow-sm
                          ${
                            contactoPendiente
                              ? 'bg-yellow-100 border-yellow-300'
                              : todosDeshabilitados
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-emerald-50 border-emerald-100'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-800 text-sm">
                            {person.name}
                          </span>
                          <div
                            className={`h-2 w-2 rounded-full animate-pulse ${
                              contactoPendiente
                                ? 'bg-yellow-400'
                                : 'bg-emerald-500'
                            }`}
                          ></div>
                        </div>

                        <div className="text-xs text-gray-600 bg-white/60 p-2 rounded-lg">
                          {/* Mensaje de alerta solo si todo está deshabilitado */}
                          {todosDeshabilitados && (
                            <p className="flex items-center gap-2 text-emerald-600 font-bold mb-2 border-b border-emerald-100 pb-1">
                              <FaExclamationTriangle className="text-amber-600" />{' '}
                              Su turno está deshabilitado
                            </p>
                          )}
                          {/* Mensaje de alerta si contacto pendiente */}
                          {contactoPendiente && (
                            <p className="flex items-center gap-2 text-yellow-700 font-bold mb-2 border-b border-yellow-200 pb-1">
                              <FaExclamationTriangle className="text-yellow-500" />{' '}
                              Contacto pendiente
                            </p>
                          )}

                          <p className="mb-1">
                            <span className={`font-semibold text-emerald-700`}>
                              Plan:
                            </span>{' '}
                            {person.plan}
                          </p>
                          <p>
                            <span className={`font-semibold text-emerald-700`}>
                              Horario:
                            </span>{' '}
                            {person.hours.join(', ')}
                          </p>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <p className="text-sm italic">No hay coincidencias</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PanelesSuperiores;
