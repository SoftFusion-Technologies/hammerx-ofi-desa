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
import { IoMdAdd } from "react-icons/io";
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

  // Renderizado de celdas del calendario
  const renderCeldas = () => {
    const mesInicio = startOfMonth(fechaActual);
    const mesFin = endOfMonth(mesInicio);
    const fechaInicio = startOfWeek(mesInicio, { weekStartsOn: 1 });
    const fechaFin = endOfWeek(mesFin, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = fechaInicio;
    let formattedDate = "";

    while (day <= fechaFin) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;

        // Buscar si hay registro para este día
        const registroDia = asistenciasFiltradas.find((r) =>
          isSameDay(parseISO(r.fecha), day),
        );

        const esMismoMes = isSameMonth(day, mesInicio);
        const esSeleccionado = isSameDay(day, diaSeleccionado);
        const tieneAsistencia = !!registroDia;

        const etiquetaMobileDia = obtenerEtiquetaMobileDia(registroDia);

        const estiloMobile = etiquetaMobileDia && (
          <span
            className={`text-xs font-black leading-none ${etiquetaMobileDia.colorClase}`}
          >
            {etiquetaMobileDia.texto}
          </span>
        );

        days.push(
          <div
            className={`relative flex flex-col justify-start items-center h-16 md:h-28 border border-gray-100 transition-all cursor-pointer
              ${!esMismoMes ? "bg-gray-50 text-gray-300" : "bg-white text-gray-700"}
              ${esSeleccionado ? "ring-2 ring-inset ring-orange-500 bg-orange-50" : "hover:bg-gray-50"}
            `}
            key={day}
            onClick={() => onDateClick(cloneDay)}
          >
            {/* Número del día */}
            <span
              className={`text-xs md:text-sm font-bold p-1 ${!esMismoMes ? "text-gray-300" : ""}`}
            >
              {formattedDate}
            </span>

            {/* CONTENIDO DE LA CELDA */}
            {tieneAsistencia && (
              <>
                {/* MOBILE */}
                <div className="md:hidden mt-2 flex min-h-[18px] items-center justify-center">
                  {estiloMobile}
                </div>

                {/* PC - TURNOS */}
                <div className="hidden md:flex flex-col w-full px-1 gap-1 overflow-y-auto flex-1">
                  {registroDia.turnos.map((turno, idx) => (
                    <div
                      key={idx}
                      className={`text-[10px] rounded px-1 text-center whitespace-nowrap 
                        ${colorHorario(turno.estado_aprobacion)} 
                        ${colorEstadoCumplimiento(
                          Number(turno.minutos_tarde) > 0
                            ? "tarde"
                            : turno.estado,
                          true,
                        )}
                      `}
                    >
                      {quitarSegundos(turno.entrada) || "—"} -{" "}
                      {!turno.salida || turno.salida.includes("23:59")
                        ? "S/R"
                        : quitarSegundos(turno.salida)}
                    </div>
                  ))}
                </div>

                {/* FOOTER PC */}
                <div className="hidden md:flex w-full justify-center pb-1">
                  {estiloMobile}
                </div>
              </>
            )}
          </div>,
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div className="bg-white rounded-b-lg shadow-sm">{rows}</div>;
  };

  // Renderizado de los días de la semana (L M M J V S D)
  const renderDiasSemana = () => {
    const days = [];
    let startDate = startOfWeek(fechaActual, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div
          className="col-span-1 text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-wider"
          key={i}
        >
          {format(addDays(startDate, i), "EEE", { locale: es })}
        </div>,
      );
    }
    return (
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {days}
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
      <div className="mt-6 bg-white p-4 rounded-2xl shadow-lg border-l-4 border-orange-500 animate-fade-in-up">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bignoodle text-xl text-gray-800 flex items-center gap-2">
            <FaCalendarDay className="text-orange-500" />
            DETALLE DEL{" "}
            {format(diaSeleccionado, "dd 'de' MMMM", {
              locale: es,
            }).toUpperCase()}
          </h3>

          {esAdminAutorizadoRRHHH && (
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-emerald-600 hover:to-green-700 hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-300/70"
              onClick={() => {
                setAbrirModalAgregarMarcacion(true);
                setHorarioSeleccionado({ diaSeleccionado, usuario });
              }}
            >
              <IoMdAdd size={15} className="mr-1" /> Agregar marca
            </button>
          )}
        </div>

        {!registro ? (
          <p className="text-sm text-gray-400 mt-2 italic">
            No hay registros de asistencia para este día.
          </p>
        ) : (
          <div className="space-y-2.5">
            
            {registro.turnos.map((turno, i) => {
              const mensajeRelacionado = obtenerUltimoMensajeAclaracion(turno);
              const claveMensajeTurno = `${registro.fecha}-${turno.id}`;
              const estaAbierto = turnoMensajeAbierto === claveMensajeTurno;
              const minutosExtras = Number(turno.minutos_extra_pendientes) > 0;
              const minutosAutorizados =
                Number(turno.minutos_extra_autorizados) > 0;
              const minutosDescuento = obtenerMinutosPositivos(
                turno.minutos_descuento,
              );

              return (
                <div
                  key={i}
                  className={`relative rounded-xl border px-3 py-2.5 shadow-sm transition-all ${
                    turno.estado_aprobacion === "aprobada"
                      ? "bg-white border-gray-200"
                      : turno.estado_aprobacion === "pendiente"
                        ? "bg-orange-50/60 border-orange-200"
                        : "bg-red-50/60 border-red-200"
                  }`}
                >
                  {/* Numeración discreta */}
                  <span className="absolute top-2 right-2 text-[10px] font-bold text-gray-400 bg-gray-100 border border-gray-200 rounded-full px-1.5 py-0.5 leading-none">
                    #{i + 1}
                  </span>

                  <div className="flex flex-col gap-2">
                    {/* FILA PRINCIPAL */}
                    <div className="pr-10">
                      <div className="flex flex-wrap items-center gap-1.5 text-[13px] sm:text-sm font-bold text-gray-700">
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-2 py-1">
                          Entrada: {quitarSegundos(turno.entrada) || "—"}
                        </span>

                        <span className="text-gray-300">—</span>
                        <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-100 rounded-md px-2 py-1">
                          {!turno.salida || turno.salida.includes("23:59")
                            ? "Sin registro"
                            : "Salida: " + quitarSegundos(turno.salida)}
                        </span>
                      </div>

                      {turno.horario_hora_entrada &&
                        turno.horario_hora_salida && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500">
                            <span className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5">
                              <FaClock className="text-[10px]" />
                              Habitual
                            </span>

                            <span className="text-gray-600">
                              {quitarSegundos(turno.horario_hora_entrada) ||
                                "—"}{" "}
                              —{" "}
                              {quitarSegundos(turno.horario_hora_salida) || "—"}
                            </span>
                          </div>
                        )}
                    </div>

                    {/* BADGES */}

                    <div className="flex flex-wrap gap-1.5">
                      {((esAdminAutorizadoRRHHH && turno.estado === "normal") ||
                        turno.estado === "justificado") && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">
                          <FaClock className="text-[9px]" />
                          {formatearHorario(turno.horas_turno)}
                        </span>
                      )}

                      {minutosExtras && (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            minutosAutorizados
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }`}
                        >
                          <FaCheckCircle className="text-[9px]" />
                          {formatearDuracion(
                            turno.minutos_extra_pendientes,
                          )}{" "}
                          {minutosAutorizados ? "realizadas" : "pendientes"}
                        </span>
                      )}

                      {minutosAutorizados && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          <FaCheckCircle className="text-[9px]" />
                          {formatearDuracion(
                            turno.minutos_extra_autorizados,
                          )}{" "}
                          autorizadas
                        </span>
                      )}

                      {minutosDescuento > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">
                          Descuento: {formatearDuracion(minutosDescuento)}
                        </span>
                      )}

                      {obtenerMinutosPositivos(turno.minutos_tarde) > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                          {formatearDuracion(turno.minutos_tarde)} tarde
                        </span>
                      )}

                      {obtenerMinutosPositivos(
                        turno.minutos_salida_anticipada,
                      ) > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-[10px] font-semibold border border-red-200">
                          {formatearDuracion(turno.minutos_salida_anticipada)}{" "}
                          antes
                        </span>
                      )}
                    </div>

                    {/* MENSAJE RELACIONADO */}
                    {mensajeRelacionado && (
                    <div className="mt-1">
                      <button
                        onClick={() =>
                          setTurnoMensajeAbierto((prev) =>
                            prev === claveMensajeTurno ? null : claveMensajeTurno
                          )
                        }
                        className="flex items-center gap-1 text-[10px] text-orange-600 hover:text-orange-700"
                      >
                        <FiMessageSquare size={12} />
                        Ver aclaración
                      </button>
                    </div>
                  )}

                  {/*  */}
                  {mensajeRelacionado && estaAbierto && (
                    <div className="mt-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[10px]">
                      <div className="font-semibold text-orange-700">
                        {formatearTipoMensaje(mensajeRelacionado.tipo_mensaje)}
                      </div>
                      <div className="text-gray-700">
                        {mensajeRelacionado.mensaje}
                      </div>
                    </div>
                  )}

                    {/*  NOTAS / ORIGEN */}
                    <div className="flex flex-col gap-1.5 text-[10px]">
                      {turno.comentarios && esAdminAutorizadoRRHHH && (
                        <p className="text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-md px-2 py-1 leading-snug">
                          "{turno.comentarios}"
                        </p>
                      )}

                      {esAdminAutorizadoRRHHH && turno.origen && (
                        <span className="text-gray-400 font-semibold uppercase tracking-tight">
                          Vía {turno.origen}
                        </span>
                      )}
                    </div>

                    {/* ACCIONES */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${colorHorario(
                            turno.estado_aprobacion,
                          )}`}
                          onClick={() => {
                            const fechaFormateada = new Date(
                              diaSeleccionado,
                            ).toLocaleDateString("en-US");
                            setHorarioSeleccionado({
                              ...turno,
                              fecha_registro: fechaFormateada,
                            });
                            if (esAdminAutorizadoRRHHH) {
                              setAbrirModalAprobacion(true);
                            }
                          }}
                        >
                          {turno.estado_aprobacion.toUpperCase()}
                        </button>

                        <button
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${colorEstadoCumplimiento(
                            turno.estado,
                          )}`}
                          onClick={() => {
                            if (!esAdminAutorizadoRRHHH) return;
                            if (turno.estado.toLowerCase() === "extra") return;

                            const fechaFormateada = new Date(
                              diaSeleccionado,
                            ).toLocaleDateString("en-US");
                            setHorarioSeleccionado({
                              ...turno,
                              fecha_registro: fechaFormateada,
                            });
                            setAbrirModalEstadoAsistencia(true);
                          }}
                        >
                          {turno.estado.toUpperCase()}
                        </button>

                        {turno.estado_aprobacion.toLowerCase() === "pendiente" && !esAdminAutorizadoRRHHH && (
                        <button
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all bg-gray-300 text-gray-800`}
                          onClick={() => {
                            const fechaFormateada = new Date(
                              diaSeleccionado,
                            ).toLocaleDateString("en-US");
                            setHorarioSeleccionado({
                              ...turno,
                              fecha_registro: fechaFormateada,
                            });
                            setAbrirSoloObservacion(true);
                          }}
                        >
                          CREAR CONSULTA
                        </button>
                        )}
                      </div>

                      {esAdminAutorizadoRRHHH && (
                        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200 shrink-0">
                          <button
                            className="p-1.5 text-blue-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            onClick={() => {
                              const fechaFormateada = new Date(
                                diaSeleccionado,
                              ).toLocaleDateString("en-US");
                              setHorarioSeleccionado({
                                ...turno,
                                fecha_registro: fechaFormateada,
                              });
                              setAbrirModalEditar(true);
                            }}
                          >
                            <MdOutlineEdit size={15} />
                          </button>

                          <button
                            className="p-1.5 text-red-500 hover:bg-white hover:shadow-sm rounded-md transition-all"
                            onClick={async () => {
                              const resultado = await Swal.fire({
                                title: "¿Eliminar marcación?",
                                icon: "warning",
                                showCancelButton: true,
                                confirmButtonColor: "#d33",
                                confirmButtonText: "Sí, eliminar",
                                cancelButtonText: "Cancelar",
                              });

                              if (resultado.isConfirmed) {
                                try {
                                  await eliminar(
                                    `/rrhh/marcaciones/${turno.id}`,
                                  );
                                  realizarPeticion();
                                  Swal.fire(
                                    "Eliminado",
                                    "La marcación fue eliminada.",
                                    "success",
                                  );
                                } catch (e) {
                                  Swal.fire(
                                    "Error",
                                    "No se pudo eliminar.",
                                    "error",
                                  );
                                }
                              }
                            }}
                          >
                            <MdDelete size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* TOTAL DEL DÍA */}
            <div className="mt-3 pt-2 border-t border-gray-200 flex justify-end items-center gap-2">
              {/* <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Total:
              </span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
                {formatearHorario(registro.horasTotales)}
              </span> */}
              <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Horas válidas:
              </span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-lg font-bold text-sm shadow-sm">
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
