import { useState, useEffect, useCallback } from "react";
import { useInstructorAuth } from "../../../AuthInstructorContext";
import useConsultaDB from "../ConsultaDb/Consulta";
import useModify from "../ConsultaDb/Modificar";
import ObtenerFechaInternet from "../utils/ObtenerFechaInternet";
import { format, set } from "date-fns";
import Swal from "sweetalert2";
import useInsertar from "../ConsultaDb/Insertar";
import useHistorialAlumnos from "./PilatesGestion/HistorialAlumnos";
import useGrillaMinimizada from "./PilatesGestion/HorariosOcultos";
import {  differenceInCalendarDays } from 'date-fns';

const PilatesInstructorLogica = () => {
  const [isModalAsistencia, setIsModalAsistencia] = useState(false); // Estado que abre el modal que marca la asistencia
  const [abrirModalQuejaInstructor, setAbrirModalQuejaInstructor] = useState(false); // Estado que abre el modal para cargar quejas desde el instructor
  const [nombreSede, setNombreSede] = useState(""); // Nombre de la sede obtenida del contexto de autenticación del instructor
  const [currentCell, setCurrentCell] = useState(null); // Celda actual seleccionada (día, hora, alumno, estado de asistencia)
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda para filtrar alumnos en la tabla
  const [cupoMaximoPilates, setCupoMaximoPilates] = useState(0); // Cupo máximo de alumnos en Pilates (capacidad de la sede)
  const [schedule, setSchedule] = useState([]); // Horarios y alumnos asignados a cada horario
  const [hoy, setHoy] = useState(""); // Día actual en formato de texto (LUNES, MARTES, etc.)
  const [fechaHoy, setFechaHoy] = useState(null); // Fecha actual obtenida de la API de internet
  const [asistenciasHoy, setAsistenciasHoy] = useState({}); // Asistencias registradas para la fecha actual
  const { sedeId, instructorName, nombre, telefono, apellido, instructorId} = useInstructorAuth(); // Obtener el ID de la sede del contexto de autenticación del instructor
  const { fecha } = ObtenerFechaInternet(); // Obtener la fecha actual de una API de internet

  const {
    horariosMinimizados, // Horarios colapsados
    alternarMinimizacionHorario, // Minimiza/expande un turno
    manejarMinimizacionGlobal, // Minimiza/expande todos los turnos
  } = useGrillaMinimizada();

  // Consulta para obtener los horarios y alumnos asignados a la sede
  const { data: horariosData, refetch: refetchHorarios } = useConsultaDB(
    sedeId ? `/clientes-pilates/horarios?sedeId=${sedeId}` : null
  );

  const { insert } = useInsertar("/quejas-pilates", true);

  // Función para modificar la asistencia de un alumno
  const { update } = useModify("/asistencias-pilates/marcar");

  // Función para modificar la observacion de un alumno
  const { update: updateObservacion, error: errorObs } = useModify(
    "/clientesPilates",
    true
  );

  // Consulta para obtener el cupo máximo de la sede
  const { data: sedesData } = useConsultaDB(`/sedes/ciudad`);

  // Filtrar y establecer el cupo máximo de Pilates cuando se obtienen los datos de las sedes
  useEffect(() => {
    if (sedesData && Array.isArray(sedesData) && sedesData.length > 0) {
      const resultado = sedesData.filter((sede) => String(sede.id) === sedeId);
      if (resultado.length > 0) {
        setCupoMaximoPilates(resultado[0].cupo_maximo_pilates);
        setNombreSede(resultado[0].nombre);
      }
    }
  }, [sedesData, sedeId]);

  // Usar fechaHoy (obtenida por la API de internet) o la fecha local del equipo
  const fechaParaConsulta = fechaHoy || format(new Date(), "yyyy-MM-dd");
  const {
    data: asistenciasData,
    refetch: refetchAsistencias,
    loading: loadingAsistencias,
  } = useConsultaDB(
    sedeId && fechaParaConsulta
      ? `/asistencias-pilates/formato?fecha=${fechaParaConsulta}`
      : null
  );

  // Función para obtener el día actual en formato de texto y asi determinar que dia es que se muestra en la tabla habilitado (sábado y domingo no funcionan)
  const obtenerDiaActual = () => {
    const dias = {
      0: "DOMINGO",
      1: "LUNES",
      2: "MARTES",
      3: "MIÉRCOLES",
      4: "JUEVES",
      5: "VIERNES",
      6: "SÁBADO",
    };
    const hoy = new Date();
    return dias[hoy.getDay()];
  };

  useEffect(() => {
    setHoy(obtenerDiaActual);
  }, []);

  useEffect(() => {
    if (fecha) {
      setFechaHoy(fecha);
    }
  }, [fecha]);

  useEffect(() => {
    if (asistenciasData) {
      setAsistenciasHoy(asistenciasData);
    }
  }, [asistenciasData]);

  const handleCellAsistencia = (
    day,
    time,
    studentToEdit = null,
    estadoAsistencia
  ) => {
    if (day !== hoy) {
      return;
    }
    const key = `${day}-${time}`;
    setCurrentCell({
      key,
      day,
      time,
      student: studentToEdit,
      estadoAsistencia,
    });
    setIsModalAsistencia(true);
  };

  // Normalizar los datos de horarios
  useEffect(() => {
    if (horariosData && Object.keys(horariosData).length > 0) {
      const normalizedData = {};
      Object.keys(horariosData).forEach((key) => {
        const normalizedKey = key.replace("MIERCOLES", "MIÉRCOLES");
        normalizedData[normalizedKey] = {
          coach: horariosData[key].coach || "",
          coachId: horariosData[key].coachId || null,
          porcentaje_asistencia_clases: horariosData[key].porcentaje_asistencia_clases || 0,
          alumnos: Array.isArray(horariosData[key].alumnos)
            ? horariosData[key].alumnos
            : [],
        };
      });
      setSchedule(normalizedData);
    } else if (horariosData) {
      setSchedule({});
    }
  }, [horariosData]);

  // Función para obtener el contenido y estilo de una celda según el estado del alumno
  const getCellContentAndStyle = useCallback((student) => {
  // Si no hay estudiante, devolver celda vacía
  if (!student) return { content: null, style: "bg-white hover:bg-gray-100" };

  // Fecha de hoy sin horas
  const hoy_fecha = new Date();
  hoy_fecha.setHours(0, 0, 0, 0);

  let style = "bg-gray-100";
  let isExpired = false;

  // Estado de asistencia del alumno hoy
  const estadoAsistencia = asistenciasHoy[student.id];

  // Fecha de inicio (plan o prueba)
  const planTipo = student.trialDetails?.date || student.planDetails?.startDate;

  // Convierte fecha tipo "DD/MM" a objeto Date
  const parsearFechaUltima = (fechaStr) => {
    if (!fechaStr) return null;
    const partes = fechaStr.split("/");
    if (partes.length !== 3) return null;
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const anio = parseInt(partes[2], 10);
    if (isNaN(dia) || isNaN(mes) || isNaN(anio)) return null;
    return new Date(anio, mes - 1, dia);
  };

  // Fecha de última asistencia
  const fechaUltima = parsearFechaUltima(student.ultimo_dia_asistencia);

  let badgeUltima = null;

  // Badge que indica hace cuánto asistió por última vez
  if (fechaUltima) {
    const dias_transcurridos = differenceInCalendarDays(hoy_fecha, fechaUltima);

    let clasesColor = "";

    if (dias_transcurridos < 7)
      clasesColor = "bg-green-100 text-green-800 border-green-200";
    else if (dias_transcurridos < 15)
      clasesColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
    else
      clasesColor = "bg-red-100 text-red-800 border-red-200";

    badgeUltima = (
      <span
        className={`px-[2px] py-[0.5px] rounded text-[10px] font-bold border shadow-sm whitespace-nowrap ${clasesColor}`}
        title="Última asistencia"
      >
        últ. {student.ultimo_dia_asistencia?.split('/').slice(0,2).join('/')}
      </span>
    );
  }

  let estadoBadge = null;

  // Badge de asistencia del día
  if (estadoAsistencia === "presente") {
    estadoBadge = (
      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2">
        <span className="text-white font-bold text-xs">P</span>
      </div>
    );
  } else if (estadoAsistencia === "ausente") {
    estadoBadge = (
      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2">
        <span className="text-white font-bold text-xs">A</span>
      </div>
    );
  } else {
    // Badge con fecha de inicio si aún no tiene asistencia
    estadoBadge = (
      <div className="bg-orange-100 border border-orange-500 px-1.5 py-0.5 rounded">
        <span className="text-orange-700 font-bold text-[10px] whitespace-nowrap">
          I: {planTipo.split("-").reverse().join("/")}
        </span>
      </div>
    );
  }

  // Contenido visual de la celda
  const content = (
    <div className="flex items-center justify-between w-full gap-2">
      <span className="truncate font-medium">{student.name}</span>

      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        {estadoBadge}
        {badgeUltima}
      </div>
    </div>
  );

  // Lógica según tipo de alumno
  switch (student.status) {
    case "plan":
      const endDate = new Date(student.planDetails.endDate + "T00:00:00");
      isExpired = endDate < hoy_fecha;

      // Diferenciar tipo de plan
      style =
        student.planDetails?.type === "L-M-V"
          ? "bg-gray-100"
          : "bg-gray-300";
      break;

    case "prueba":
      const trialDate = new Date(student.trialDetails.date + "T00:00:00");
      isExpired = trialDate < hoy_fecha;
      style = "bg-cyan-200";
      break;

    case "programado":
      const fechaRelevante =
        student.scheduledDetails?.promisedDate ||
        student.scheduledDetails.date;

      const scheduledDate = new Date(fechaRelevante + "T00:00:00");

      isExpired = scheduledDate < hoy_fecha;
      style = "bg-yellow-200";
      break;

    default:
      break;
  }

  // Si está vencido, pintar en rojo
  if (isExpired) style = "bg-red-500 text-white";

  return { content, style };

}, [asistenciasHoy]);

  // Función para cambiar la asistencia de un alumno
  const cambiarAsistencia = async (studentId, newEstado) => {
    const datos = {
      id_cliente: studentId,
      fecha: fechaParaConsulta,
      presente: newEstado,
    };
    await update(null, datos);
    await refetchAsistencias();
    await refetchHorarios();
    setIsModalAsistencia(false);
  };

  const cambiarObservaciones = async (
    studentId,
    newObservaciones,
    observacionAnterior
  ) => {
    if (!studentId) {
      Swal.fire("Error", "ID de estudiante no proporcionado.", "error");
      return;
    }
    const datos = {
      observaciones: newObservaciones.toUpperCase().trim(),
    };
    const subRoute = `${studentId}/observaciones`;
    const success = await updateObservacion(subRoute, datos); // Actualizar observaciones del alumno
    await crearHistorialDesdeInstructor(observacionAnterior, newObservaciones, studentId, instructorName) // Crear historial de cambios en las observaciones
    if (success) {
      await refetchHorarios();
      setIsModalAsistencia(false);
      Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: "Observaciones actualizadas correctamente.",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      const errorMessage = errorObs
        ? errorObs
        : "Ocurrió un error al intentar guardar.";
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: errorMessage,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const agregarQuejaInstructor = async (motivo) => {
      if (motivo.trim() !== "") {
        const datos = {
          cargado_por: instructorName,
          nombre: nombre + " " + apellido,
          motivo: motivo.toUpperCase().trim(),
          sede: sedeId,
          contacto: telefono,
          tipo_usuario: "instructor",
          resuelto: 0,
        };

        const respuesta = await insert(datos);
        if (respuesta) {
          await refetchHorarios();
          setIsModalAsistencia(false);
          Swal.fire({
            icon: "success",
            title: "¡Guardado!",
            text: "Las quejas se han guardado correctamente.",
            showConfirmButton: false,
            timer: 1500,
          });
          }else{
            Swal.fire({
              icon: "error",
              title: "¡Por favor complete todos los campos!",
              text: "",
              showConfirmButton: false,
              timer: 1500,
            });
          }
  }
}

  const agregarQuejas = async (student, newQuejas) => {
    if (newQuejas === "" || newQuejas === null) {
      Swal.fire({
        icon: "error",
        title: "¡Por favor complete todos los campos!",
        text: "",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    const datos = {
      cargado_por: instructorName,
      nombre: student.name,
      motivo: newQuejas,
      sede: sedeId,
      contacto: student.contact || null,
      cliente_pilates_id: student.id,
      tipo_usuario: "cliente",
      resuelto: 0,
    };
    const respuesta = await insert(datos);
    if (respuesta) {
      await refetchHorarios();
      setIsModalAsistencia(false);
      Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: "Las quejas se han guardado correctamente.",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      const errorMessage = errorObs
        ? errorObs
        : "Ocurrió un error al intentar enviar la queja";
      Swal.fire({
        icon: "error",
        title: "Error al enviar la queja",
        text: errorMessage,
        confirmButtonText: "Aceptar",
      });
    }
  };

  const {
    crearHistorialDesdeInstructor, // función para crear historial de alumnos desde el instructor
  } = useHistorialAlumnos();


  return {
    states: {
      isModalAsistencia,
      currentCell,
      searchTerm,
      schedule,
      hoy,
      asistenciasHoy,
      cupoMaximoPilates,
      loadingAsistencias,
      horariosMinimizados,
      abrirModalQuejaInstructor,
      nombreSede,
    },
    setStates: {
      setIsModalAsistencia,
      setCurrentCell,
      setSearchTerm,
      setSchedule,
      setAbrirModalQuejaInstructor,
    },
    functions: {
      handleCellAsistencia,
      getCellContentAndStyle,
      refetchHorarios,
      refetchAsistencias,
      cambiarAsistencia,
      cambiarObservaciones,
      agregarQuejas,
      alternarMinimizacionHorario,
      manejarMinimizacionGlobal,
      agregarQuejaInstructor
    },
  };
};

export default PilatesInstructorLogica;
