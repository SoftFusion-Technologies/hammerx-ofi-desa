/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Vista de historial de asistencia en formato calendario. Este componente permite visualizar los fichajes mensuales, calcular automáticamente las horas trabajadas (netas y brutas) y gestionar cada marca. Los administradores pueden usarlo para editar horarios, aprobar o rechazar horas extra y corregir estados de asistencia de los empleados.
*/
import React, { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  set,
} from "date-fns";
import { es, tr } from "date-fns/locale";
import {
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaCalendarDay,
  FaArrowLeft,
  FaCheckCircle,
} from "react-icons/fa";
import { quitarSegundos } from "../../../Utils/formatTime";
import { IoMdAdd, IoIosWarning } from "react-icons/io";
import useObtenerDatos from "../../../hooks/obtenerDatos";
import { useAuth } from "../../../../../AuthContext";
import { MdDelete, MdOutlineEdit } from "react-icons/md";
import ModalEditarHorarioEmpleado from "../../../Modals/RRHH/ModalEditarHorarioEmpleado";
import { useSedeUsers } from "../../../Context/SedeUsersContext";
import useEliminarDatos from "../../../hooks/eliminarDatos";
import Swal from "sweetalert2";
import ModalCambiarEstadoAprobacion from "../../../Modals/RRHH/ModalCambiarEstadoAprobacion";
import ModalCambiarEstadoAsistencia from "../../../Modals/RRHH/ModalCambiarEstadoAsistencia";
import ModalAgregarMarcacion from "../../../Modals/RRHH/ModalAgregarMarcacion";
import { esAdminRRHH } from "../../../Utils/AdminAutorizadosRRHH";
import { formatearDuracion } from "../../../Utils/convertirMinutosAHoras";
import {
  calcularMinutosNetoTurno,
  obtenerMinutosPositivos,
} from "../../../Utils/calculosMarcaciones";
import { obtenerEtiquetaMobileDia } from "../../../Utils/etiquetaCalendarioMobile";
import ModalNovedad from "../../../Modals/Empleado/ModalNovedad";
import { FiMessageSquare } from "react-icons/fi";
import ObtenerFechaInternet from './../../../../Pilates/utils/ObtenerFechaInternet';

const EMPTY_ARRAY = [];

const HistorialMarcas = ({ usuario = null, volverAtras = null }) => {
  const { userId, userLevel, userLevelAdmin } = useAuth();
  const esAdminAutorizadoRRHHH = esAdminRRHH(userLevel, userLevelAdmin);
  const { sedeSeleccionada: sedeContext } = useSedeUsers();
  const {
    datos,
    cargando: cargandoMarcaciones,
    error: errorMarcaciones,
    realizarPeticion,
  } = usuario
    ? useObtenerDatos(
        `/rrhh/marcaciones?usuario_id=${usuario.usuario_id}&&sede_id=${usuario.sede_id}`,
      )
    : useObtenerDatos(
        `/rrhh/marcaciones?usuario_id=${userId}&&sede_id=${sedeContext?.id}`,
      );
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
  const [fechaActual, setFechaActual] = useState(new Date());
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  const [datosDelMes, setDatosDelMes] = useState([]);
  const [horasMensualesTexto, setHorasMensualesTexto] = useState("0h 00m");
  const [horasPendientesTexto, setHorasPendientesTexto] = useState("0h 00m");
  const [horasRechazadasTexto, setHorasRechazadasTexto] = useState("0h 00m");
  const [abrirModalEditar, setAbrirModalEditar] = useState(false);
  const [abrirModalAprobacion, setAbrirModalAprobacion] = useState(false);
  const [abrirModalEstadoAsistencia, setAbrirModalEstadoAsistencia] =
    useState(false);
  const [abrirModalAgregarMarcacion, setAbrirModalAgregarMarcacion] =
    useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [abrirSoloObservacion, setAbrirSoloObservacion] = useState(false);
  const {
    respuesta: respuestaEliminacion,
    cargando: carganodoEliminacion,
    error: errorEliminacion,
    eliminar,
  } = useEliminarDatos();
  const [turnoMensajeAbierto, setTurnoMensajeAbierto] = useState(null);

  const historial_marcaciones = Array.isArray(datos) ? datos : EMPTY_ARRAY;

  const sedesDisponibles = useMemo(
    () => [...new Set(historial_marcaciones.map((registro) => registro.sede))],
    [historial_marcaciones],
  );

  useEffect(() => {
    if (!sedesDisponibles.length) {
      setSedeSeleccionada("");
      return;
    }

    if (!sedesDisponibles.includes(sedeSeleccionada)) {
      setSedeSeleccionada(sedesDisponibles[0]);
    }
  }, [sedesDisponibles, sedeSeleccionada]);

  const empleadosDisponibles = useMemo(
    () =>
      historial_marcaciones
        .filter((registro) => registro.sede === sedeSeleccionada)
        .map((registro) => registro.empleado),
    [historial_marcaciones, sedeSeleccionada],
  );

  useEffect(() => {
    if (!empleadosDisponibles.length) {
      setEmpleadoSeleccionado("");
      return;
    }

    if (!empleadosDisponibles.includes(empleadoSeleccionado)) {
      setEmpleadoSeleccionado(empleadosDisponibles[0]);
    }
  }, [sedeSeleccionada, empleadosDisponibles, empleadoSeleccionado]);

  const registroSeleccionado = historial_marcaciones.find(
    (registro) =>
      registro.sede === sedeSeleccionada &&
      registro.empleado === empleadoSeleccionado,
  );

  const asistenciasFiltradas = registroSeleccionado?.asistencias ?? EMPTY_ARRAY;

  // Efecto para filtrar datos y sumar horas cuando cambia el mes
  useEffect(() => {
    const datosMes = asistenciasFiltradas.filter((d) =>
      isSameMonth(parseISO(d.fecha), fechaActual),
    );

    setDatosDelMes(datosMes);

    // 3. CAMBIO AQUI: Cálculo exacto sumando turno por turno
    let acumuladorMinutosMensuales = 0;

    datosMes.forEach((dia) => {
      if (dia.turnos) {
        dia.turnos.forEach((turno) => {
          acumuladorMinutosMensuales += calcularMinutosNetoTurno(turno);
        });
      }
    });

    setHorasMensualesTexto(formatearDuracion(acumuladorMinutosMensuales));
  }, [fechaActual, asistenciasFiltradas]);


  // ---  LÓGICA DE LÍMITE DE MESES ---
  const mesActualSistema = startOfMonth(new Date());
  const limiteRetroceso = subMonths(mesActualSistema, 1);
  
  // Validaciones de límite
  const estaEnElLimiteRetroceso = startOfMonth(fechaActual) <= limiteRetroceso;
  const estaEnElLimiteFuturo = startOfMonth(fechaActual) >= mesActualSistema;
  
  // Deshabilitar botones si NO es admin y alcanzó los límites
  const deshabilitarBotonAtras = !esAdminAutorizadoRRHHH && estaEnElLimiteRetroceso;
  const deshabilitarBotonAdelante = !esAdminAutorizadoRRHHH && estaEnElLimiteFuturo;

  // Funciones de navegación
  const mesAnterior = () => {
    if (deshabilitarBotonAtras) return; 
    setFechaActual(subMonths(fechaActual, 1));
  };
  
  const mesSiguiente = () => {
    if (deshabilitarBotonAdelante) return; // Bloqueo de seguridad hacia el futuro
    setFechaActual(addMonths(fechaActual, 1));
  };

  const onDateClick = (day) => {
    setDiaSeleccionado(day);
  };

  const colorHorario = (estado) => {
    switch (estado) {
      case "pendiente":
        return "bg-orange-50 border text-orange-800";
      case "aprobada":
        return "bg-green-50 border text-green-800";
      case "rechazada":
        return "bg-red-50 border text-red-800";
      default:
        return "bg-gray-50 border  text-gray-800";
    }
  };

  const colorEstadoCumplimiento = (estado, calendario = false) => {
    switch (estado) {
      case "normal":
        return `${
          calendario
            ? "text-green-800 border border-green-200"
            : "bg-green-50 text-green-800 border border-green-200"
        }`;

      case "justificado":
        return `${
          calendario
            ? "text-yellow-800 border border-yellow-200"
            : "bg-yellow-50 text-yellow-800 border border-yellow-200"
        }`;

      case "tarde":
        return `${
          calendario
            ? "text-red-800 border border-red-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`;
      default:
        return `${
          calendario
            ? "text-gray-800 border border-gray-200"
            : "bg-gray-50 text-gray-800 border border-gray-200"
        }`;
    }
  };

const renderDiasSemana = () => {
  const days = [];
  let startDate = startOfWeek(fechaActual, { weekStartsOn: 1 });

  for (let i = 0; i < 7; i++) {
    days.push(
      <div
        className="col-span-1 text-center py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#F9FAFB]"
        key={i}
      >
        {format(addDays(startDate, i), "EEE", { locale: es })}
      </div>
    );
  }

  return <div className="grid grid-cols-7 border-b border-gray-100">{days}</div>;
};

const renderCeldas = () => {
  const mesInicio = startOfMonth(fechaActual);
  const mesFin = endOfMonth(mesInicio);
  const fechaInicio = startOfWeek(mesInicio, { weekStartsOn: 1 });
  const fechaFin = endOfWeek(mesFin, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = fechaInicio;

  while (day <= fechaFin) {
    for (let i = 0; i < 7; i++) {
      const formattedDate = format(day, "d");
      const cloneDay = day;

      const registroDia = asistenciasFiltradas.find((r) =>
        isSameDay(parseISO(r.fecha), day)
      );

      const esMismoMes = isSameMonth(day, mesInicio);
      const esSeleccionado = isSameDay(day, diaSeleccionado);
      const tieneAsistencia = !!registroDia;

      // ---------------- COLORES GENERALES ----------------
      let cellBg = "bg-white";
      let hourColor = "text-gray-700";
      let labelColor = "text-gray-400";

      let alMenosUnPendiente = false;

      if (tieneAsistencia && registroDia.turnos.length > 0) {
        alMenosUnPendiente = registroDia.turnos.some(
          (t) => t.estado_aprobacion === "pendiente"
        );

        const estado = alMenosUnPendiente ? "pendiente" : "aprobada";

        if (estado === "aprobada") {
          cellBg = "bg-[#ECF7F0]";
          hourColor = "text-[#1B5E20]";
          labelColor = "text-[#1B5E20]";
        } else {
          cellBg = "bg-[#FFF8E1]";
          hourColor = "text-[#B07D05]";
          labelColor = "text-[#B07D05]";
        }
      }

      const horasTexto =
        tieneAsistencia && registroDia.horasTotalesPendientes
          ? `+${registroDia.horasTotalesPendientes.split(":")[0]}h`
          : "";

      days.push(
        <div
          className={`relative flex flex-col items-center justify-start h-16 lg:h-36 border-[0.5px] border-gray-100 transition-all cursor-pointer
            ${!esMismoMes ? "bg-gray-50 text-gray-300" : cellBg}
            ${
              esSeleccionado
                ? "ring-2 ring-inset ring-orange-500 z-10"
                : "hover:bg-opacity-80"
            }
          `}
          key={day}
          onClick={() => onDateClick(cloneDay)}
        >
          {/* DIA */}
          <span
            className={`text-[10px] lg:text-[11px] font-bold mt-1 ${
              !esMismoMes ? "text-gray-200" : "text-gray-500"
            }`}
          >
            {formattedDate}
          </span>

          {tieneAsistencia && esMismoMes && (
            <>
              {/* MOBILE */}
              <div
                className={`lg:hidden flex-1 flex items-center justify-center font-black text-xs ${hourColor}`}
              >
                {horasTexto}
              </div>

              {/* DESKTOP */}
              <div className="hidden lg:flex w-[90%] h-[75%] bg-white rounded-xl border border-gray-100 shadow-sm mt-1 p-2 flex-col items-center justify-between">
                <div
                  className={`text-3xl font-black tracking-tighter ${hourColor}`}
                >
                  {horasTexto}
                </div>

                <div className="flex flex-col items-center w-full px-1">
                  <div className="w-full h-[1px] bg-gray-100 mb-1"></div>

                  {registroDia.turnos.map((turno, idx) => {
                    // ---------------- VARIABLES ----------------
                    const tieneHorario = !!turno.horario_id;

                    const salidaExtra =
                      tieneHorario &&
                      turno.minutos_extra_pendientes > 0;

                    const horarioExtra = !tieneHorario;

                    const origenAutomatico =
                      turno.origen === "automatico";

                    const salidaSinRegistro =
                      !turno.salida ||
                      turno.salida.includes("23:59");

                    const esPendiente =
                      turno.estado_aprobacion === "pendiente";

                    const entrada = quitarSegundos(turno.entrada);
                    const salida = salidaSinRegistro
                      ? "Sin registro"
                      : quitarSegundos(turno.salida);

                    // ---------------- COLORES ----------------
                    const baseColor = esPendiente
                      ? "text-yellow-500"
                      : "text-gray-500";

                    // ---------------- CASOS ----------------
                    // 1. AUTOMATICO → siempre mismo texto
                    if (origenAutomatico) {
                      return (
                        <div
                          key={idx}
                          className={`text-[10px] font-bold ${baseColor} flex items-center gap-1 truncate w-full justify-center`}
                        >
                          {turno.estado === "tarde" && (
                            <FaClock className="text-red-400 shrink-0" size={8} />
                          )}
                          <span className="truncate">
                            Sin registro - Sin registro
                          </span>
                        </div>
                      );
                    }

                    // 2. HORARIO EXTRA → todo amarillo si pendiente
                    if (horarioExtra) {
                      return (
                        <div
                          key={idx}
                          className={`text-[10px] font-bold ${baseColor} flex items-center gap-1 truncate w-full justify-center`}
                        >
                          {turno.estado === "tarde" && (
                            <FaClock className="text-red-400 shrink-0" size={8} />
                          )}
                          <span className="truncate">
                            {entrada} - {salida}
                          </span>
                        </div>
                      );
                    }

                    // 3. SALIDA EXTRA → SOLO salida amarilla
                    if (salidaExtra) {
                      return (
                        <div
                          key={idx}
                          className="text-[10px] font-bold flex items-center gap-1 truncate w-full justify-center"
                        >
                          {turno.estado === "tarde" && (
                            <FaClock className="text-red-400 shrink-0" size={8} />
                          )}

                          <span className="truncate text-gray-500">
                            {entrada} -
                          </span>

                          <span
                            className={`truncate ${
                              esPendiente ? "text-yellow-500" : "text-gray-500"
                            }`}
                          >
                            {salida}
                          </span>
                        </div>
                      );
                    }

                    // 4. SALIDA SIN REGISTRO → SOLO "Sin registro" amarillo
                    if (salidaSinRegistro) {
                      return (
                        <div
                          key={idx}
                          className="text-[10px] font-bold flex items-center gap-1 truncate w-full justify-center"
                        >
                          {turno.estado === "tarde" && (
                            <FaClock className="text-red-400 shrink-0" size={8} />
                          )}

                          <span className="truncate text-gray-500">
                            {entrada} -
                          </span>

                          <span
                            className={`truncate ${
                              esPendiente ? "text-yellow-500" : "text-gray-500"
                            }`}
                          >
                            Sin registro
                          </span>
                        </div>
                      );
                    }

                    // 5. NORMAL
                    return (
                      <div
                        key={idx}
                        className={`text-[10px] font-bold ${
                          esPendiente ? "text-yellow-500" : "text-gray-500"
                        } flex items-center gap-1 truncate w-full justify-center`}
                      >
                        {turno.estado === "tarde" && (
                          <FaClock className="text-red-400 shrink-0" size={8} />
                        )}
                        <span className="truncate">
                          {entrada} - {salida}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* LABEL */}
                <div
                  className={`text-[9px] font-black uppercase tracking-widest ${labelColor}`}
                >
                  {alMenosUnPendiente ? "Pendiente" : "Aprobada"}
                </div>
              </div>
            </>
          )}
        </div>
      );

      day = addDays(day, 1);
    }

    rows.push(
      <div className="grid grid-cols-7" key={day}>
        {days}
      </div>
    );

    days = [];
  }

  return (
    <div className="bg-white rounded-b-2xl shadow-xl overflow-hidden">
      {rows}
    </div>
  );
};
  // Renderizado del detalle al pie (Para Móvil principalmente)
  const renderDetalleDiaSeleccionado = () => {
    const registro = asistenciasFiltradas.find((r) =>
      isSameDay(parseISO(r.fecha), diaSeleccionado),
    );

    useEffect(() => {
      const datosMes = asistenciasFiltradas.filter((d) =>
        isSameMonth(parseISO(d.fecha), fechaActual),
      );

      setDatosDelMes(datosMes);

      let minutosAprobadas = 0;
      let minutosPendientes = 0;
      let minutosRechazadas = 0;

      datosMes.forEach((dia) => {
        if (dia.turnos) {
          dia.turnos.forEach((turno) => {
            const minutos = calcularMinutosNetoTurno(turno);
            if (turno.estado_aprobacion === "aprobada") {
              minutosAprobadas += minutos;
            } else if (turno.estado_aprobacion === "pendiente") {
              minutosPendientes += minutos;
            } else if (turno.estado_aprobacion === "rechazada") {
              minutosRechazadas += minutos;
            }
          });
        }
      });
      setHorasMensualesTexto(formatearDuracion(minutosAprobadas));
      setHorasPendientesTexto(formatearDuracion(minutosPendientes));
      setHorasRechazadasTexto(formatearDuracion(minutosRechazadas));
    }, [fechaActual, asistenciasFiltradas]);

    const formatearHorario = (valor) => {
      try {
        if (!valor) return "";
        const partes = valor.split(":");
        const horas = partes[0];
        const minutos = partes[1];
        return `${horas}h ${minutos}m`;
      } catch (e) {
        console.error("Error formateando horario:", e);
        return valor;
      }
    };

return (
  <div className="mt-6 space-y-4 animate-fade-in-up">
    {/* Cabecera */}
    <div className="flex justify-between items-center mb-6 px-2">
      <h3 className="font-bignoodle text-2xl text-gray-800 flex items-center gap-2 tracking-wide">
        <FaCalendarDay className="text-orange-500" />
        DETALLE DEL{" "}
        {format(diaSeleccionado, "dd 'de' MMMM", {
          locale: es,
        }).toUpperCase()}
      </h3>

      {esAdminAutorizadoRRHHH && (
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
          onClick={() => {
            setAbrirModalAgregarMarcacion(true);
            setHorarioSeleccionado({ diaSeleccionado, usuario });
          }}
        >
          <IoMdAdd size={18} className="mr-1" /> Agregar marca
        </button>
      )}
    </div>

    {!registro ? (
      <p className="text-center py-10 text-gray-400 italic bg-white rounded-2xl border border-dashed border-gray-300">
        No hay registros de asistencia para este día.
      </p>
    ) : (
      <div className="space-y-5">
        {registro.turnos.map((turno, i) => {
          const mensajeRelacionado = obtenerUltimoMensajeAclaracion(turno);
          const minutosExtras = Number(turno.minutos_extra_pendientes) > 0;
          const minutosAutorizados = Number(turno.minutos_extra_autorizados) > 0;
          const minutosDescuento = obtenerMinutosPositivos(turno.minutos_descuento);
          const minutosTarde = obtenerMinutosPositivos(turno.minutos_tarde) > 0;
          const fechaFormateada = new Date(diaSeleccionado).toLocaleDateString("en-US");

          return (
            <div key={i} className="bg-[#FBFBFB] rounded-[24px] border border-gray-100 shadow-sm overflow-hidden">
              {/* CUERPO PRINCIPAL (3 Columnas en PC) */}
              <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                
                {/* COLUMNA 1: Horarios e Info Base */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-gray-800 font-bold text-lg md:text-xl">Turno {i + 1}</h4>
                    {/* Badge de Horas del Turno (Recuperado) */}
{/*                     {((esAdminAutorizadoRRHHH && turno.estado === "normal") || turno.estado === "justificado") && (
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold border border-gray-200 uppercase">
                        {formatearHorario(turno.horas_turno)}
                      </span>
                    )} */}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
                      <p className="text-gray-700 text-sm md:text-base">
                        Entrada: <span className="font-bold">{turno.origen === "automatico" ? "S/R" : (quitarSegundos(turno.entrada) || "—")}</span>
                        {" — "}
                        Salida: <span className="font-bold">
                          {turno.origen === "automatico" || !turno.salida || turno.salida.includes("23:59") ? "S/R" : quitarSegundos(turno.salida)}
                        </span>
                      </p>
                    </div>

                    {turno.horario_hora_entrada && (
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></span>
                        <p className="text-gray-500 text-sm md:text-base">
                          Habitual: <span className="font-medium text-gray-600">
                            {quitarSegundos(turno.horario_hora_entrada)} a {quitarSegundos(turno.horario_hora_salida) || "—"}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hidden md:block w-px bg-gray-200 self-stretch my-2"></div>

                {/* COLUMNA 2: Aclaración y Metadatos */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-gray-400 text-xs block mb-1 font-semibold uppercase tracking-wider">Aclaración:</span>
                    <p className="text-gray-700 italic text-sm md:text-base">
                      {mensajeRelacionado ? mensajeRelacionado.mensaje : "Sin aclaraciones"}
                    </p>
                  </div>
                  {/* Vía Origen (Recuperado) */}
                  {esAdminAutorizadoRRHHH && turno.origen && (
                    <span className="text-[10px] text-gray-400 font-bold uppercase mt-2">{turno.origen}</span>
                  )}
                </div>

                {/* COLUMNA 3: Estados y Botón Consulta */}
                <div className="flex flex-col gap-2 min-w-[160px]">
                  <button
                    onClick={() => {
                      setHorarioSeleccionado({
                        ...turno,
                        fecha_registro: fechaFormateada,
                      });
                      if (esAdminAutorizadoRRHHH) setAbrirModalAprobacion(true);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all ${colorHorario(
                      turno.estado_aprobacion
                    )}`}
                  >
                    {turno.estado_aprobacion.toUpperCase() === "PENDIENTE" ? (
                      <>
                        <IoIosWarning size={15} className="opacity-70" />
                        {turno.estado_aprobacion.toUpperCase()}
                      </>
                    ) : (
                      turno.estado_aprobacion.toUpperCase()
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (!esAdminAutorizadoRRHHH || turno.estado.toLowerCase() === "extra") return;
                      setHorarioSeleccionado({ ...turno, fecha_registro: fechaFormateada });
                      setAbrirModalEstadoAsistencia(true);
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all ${colorEstadoCumplimiento(turno.estado)}`}
                  >
                    {turno.estado.toUpperCase()}
                  </button>

                  {/* Botón Crear Consulta (Recuperado) */}
                  {turno.estado_aprobacion.toLowerCase() === "pendiente" && !esAdminAutorizadoRRHHH && (
                    <button
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs border transition-all bg-gray-200"
                      onClick={() => {
                        setHorarioSeleccionado({ ...turno, fecha_registro: fechaFormateada });
                        setAbrirSoloObservacion(true);
                      }}
                    >
                      CREAR CONSULTA
                    </button>
                  )}
                </div>
              </div>

              {/* FOOTER: Indicadores de tiempo y Acciones (Recuperado todo) */}
              <div className="px-5 md:px-6 py-3 bg-white border-t border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-4">
                  {(minutosExtras && !minutosAutorizados && turno.estado_aprobacion != "aprobada") && (
                    <p className="text-orange-600 font-bold text-xs">
                      Pendiente: <span className="font-black">+{formatearDuracion(turno.minutos_extra_pendientes)}</span>
                    </p>
                  )}
                  {minutosAutorizados && (
                    <p className="text-emerald-600 font-bold text-xs flex items-center gap-1">
                      <FaCheckCircle size={10} /> Autorizadas: {formatearDuracion(turno.minutos_extra_autorizados)}
                    </p>
                  )}
                  {minutosDescuento > 0 && (
                    <p className="text-red-600 font-bold text-xs">
                      Descuento: {formatearDuracion(minutosDescuento)}
                    </p>
                  )}
                  {minutosTarde && (
                    <p className="text-rose-500 font-bold text-xs">
                      Tarde: {formatearDuracion(turno.minutos_tarde)}
                    </p>
                  )}
                </div>

                {/* Acciones Admin (Recuperado Editar y Eliminar) */}
                {esAdminAutorizadoRRHHH && (
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                    <button
                      className="p-1.5 text-blue-500 hover:bg-white rounded-md transition-all"
                      onClick={() => {
                        setHorarioSeleccionado({ ...turno, fecha_registro: fechaFormateada });
                        setAbrirModalEditar(true);
                      }}
                    >
                      <MdOutlineEdit size={16} />
                    </button>
                    <button
                      className="p-1.5 text-red-500 hover:bg-white rounded-md transition-all"
                      onClick={async () => {
                        const resultado = await Swal.fire({
                          title: "¿Eliminar marcación?",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          confirmButtonText: "Sí, eliminar",
                        });
                        if (resultado.isConfirmed) {
                          try {
                            await eliminar(`/rrhh/marcaciones/${turno.id}`);
                            realizarPeticion();
                            Swal.fire("Eliminado", "La marcación fue eliminada.", "success");
                          } catch (e) {
                            Swal.fire("Error", "No se pudo eliminar.", "error");
                          }
                        }
                      }}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Total del día */}
        <div className="mt-6 pt-4 flex justify-end items-center gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Horas válidas del día:</span>
          <span className="bg-orange-600 text-white px-5 py-2 rounded-2xl font-black text-lg shadow-lg">
            {formatearHorario(registro.horasTotalesSinPendientes)}
          </span>
        </div>
      </div>
    )}
  </div>
);
  };

  const obtenerUltimoMensajeAclaracion = (turno) => {
    if (!turno?.mensajes_aclaracion?.length) return null;

    return [...turno.mensajes_aclaracion].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )[0];
  };

  const formatearTipoMensaje = (tipo) => {
    if (!tipo) return "Aclaración";

    return tipo.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <>
      <div className="w-full font-messina animate-fade-in-up">
        {/* Botón volver */}
        {volverAtras && (
          <div className="mb-4">
            <button
              onClick={volverAtras}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
              Volver atrás
            </button>
          </div>
        )}

        {/* HEADER CALENDARIO */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Navegación Mes */}
          <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1">
            <button
              onClick={mesAnterior}
              disabled={deshabilitarBotonAtras}
              className={`p-2 rounded-full transition-colors ${
                deshabilitarBotonAtras
                  ? "text-gray-300 cursor-not-allowed" // Estilo bloqueado
                  : "hover:bg-gray-100 text-gray-600"  // Estilo normal
              }`}
            >
              <FaChevronLeft />
            </button>
            <h2 className="px-6 font-bignoodle text-2xl text-gray-800 min-w-[180px] text-center pt-1">
              {format(fechaActual, "MMMM yyyy", { locale: es }).toUpperCase()}
            </h2>
            <button
              onClick={mesSiguiente}
              disabled={deshabilitarBotonAdelante}
              className={`p-2 rounded-full transition-colors ${
                deshabilitarBotonAdelante
                  ? "text-gray-300 cursor-not-allowed" // Estilo bloqueado
                  : "hover:bg-gray-100 text-gray-600"  // Estilo normal
              }`}
            >
              <FaChevronRight />
            </button>
          </div>

          {/* Totalizadores de Horas - Mejor organización y responsividad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"></div>
        </div>

        <div className="mx-2 my-2 flex flex-wrap justify-center gap-2 sm:mx-3 md:mx-5 md:justify-end">
          {/* Horas aprobadas */}
          {/*           <div className="flex min-w-0 flex-1 basis-[104px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-2 py-2 text-white shadow-sm max-[360px]:basis-[96px] max-[360px]:px-1.5 max-[360px]:py-1.5 sm:basis-[120px] sm:gap-2.5 sm:px-2.5 sm:py-2 md:flex-none md:px-4 md:py-3 md:rounded-2xl md:shadow-md">
            <div className="shrink-0 rounded-full bg-white/20 p-1.5 max-[360px]:p-1 sm:p-1.5 md:p-2">
              <FaClock className="text-[12px] sm:text-sm md:text-base" />
            </div>

            <div className="min-w-0 flex flex-col items-start leading-[0.95]">
              <span className="truncate text-[9px] font-medium text-orange-100 max-[360px]:text-[8px] sm:text-[10px] md:text-xs">
                Aprobadas
              </span>
              <span className="truncate font-bignoodle text-[18px] font-bold tracking-wide max-[360px]:text-[16px] sm:text-[20px] md:text-2xl">
                {horasMensualesTexto}
              </span>
            </div>
          </div> */}

          {/* Horas pendientes */}
          {/*           <div className="flex min-w-0 flex-1 basis-[104px] items-center justify-center gap-2 rounded-xl bg-yellow-500 px-2 py-2 text-white shadow-sm max-[360px]:basis-[96px] max-[360px]:px-1.5 max-[360px]:py-1.5 sm:basis-[120px] sm:gap-2.5 sm:px-2.5 sm:py-2 md:flex-none md:px-4 md:py-3 md:rounded-2xl md:shadow-md">
            <div className="shrink-0 rounded-full bg-white/20 p-1.5 max-[360px]:p-1 sm:p-1.5 md:p-2">
              <FaClock className="text-[12px] sm:text-sm md:text-base" />
            </div>

            <div className="min-w-0 flex flex-col items-start leading-[0.95]">
              <span className="truncate text-[9px] font-medium text-yellow-100 max-[360px]:text-[8px] sm:text-[10px] md:text-xs">
                Pendientes
              </span>
              <span className="truncate font-bignoodle text-[18px] font-bold tracking-wide max-[360px]:text-[16px] sm:text-[20px] md:text-2xl">
                {horasPendientesTexto}
              </span>
            </div>
          </div> */}
        </div>

        {/* CALENDARIO GRID */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {renderDiasSemana()}
          {renderCeldas()}
        </div>

        {/* DETALLE (Visible siempre, cambia según clic) */}
        {renderDetalleDiaSeleccionado()}
      </div>

      {abrirModalEditar && horarioSeleccionado && (
        <ModalEditarHorarioEmpleado
          horarios={horarioSeleccionado}
          fetch={realizarPeticion}
          cerrarModal={() => {
            setAbrirModalEditar(false);
            setHorarioSeleccionado(null);
          }}
        />
      )}

      {abrirSoloObservacion && horarioSeleccionado && (
        <ModalNovedad
          diaSeleccionado={format(diaSeleccionado, "yyyy-MM-dd")}
          cerrarModal={() => setAbrirSoloObservacion(false)}
          horarioSeleccionado={horarioSeleccionado}
        />
      )}

      {abrirModalAprobacion && horarioSeleccionado && (
        <ModalCambiarEstadoAprobacion
          horarios={horarioSeleccionado}
          fetch={realizarPeticion}
          cerrarModal={() => {
            setAbrirModalAprobacion(false);
            setHorarioSeleccionado(null);
          }}
        />
      )}
      {abrirModalEstadoAsistencia && horarioSeleccionado && (
        <ModalCambiarEstadoAsistencia
          horarios={horarioSeleccionado}
          fetch={realizarPeticion}
          cerrarModal={() => {
            setAbrirModalEstadoAsistencia(false);
            setHorarioSeleccionado(null);
          }}
        />
      )}

      {abrirModalAgregarMarcacion && horarioSeleccionado && (
        <ModalAgregarMarcacion
          horarioSeleccionado={horarioSeleccionado}
          fetch={realizarPeticion}
          cerrarModal={() => {
            setAbrirModalAgregarMarcacion(false);
            setHorarioSeleccionado(null);
          }}
        ></ModalAgregarMarcacion>
      )}
    </>
  );
};

export default HistorialMarcas;
