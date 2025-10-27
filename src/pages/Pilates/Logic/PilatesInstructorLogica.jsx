import { useState, useEffect, useCallback } from "react";
import { useInstructorAuth } from "../../../AuthInstructorContext";
import useConsultaDB from "../ConsultaDb/Consulta";
import useModify from "../ConsultaDb/Modificar";
import ObtenerFechaInternet from "../utils/ObtenerFechaInternet";
import { format, set } from "date-fns";

const PilatesInstructorLogica = () => {
  const [isModalAsistencia, setIsModalAsistencia] = useState(false); // Estado que abre el modal que marca la asistencia
  const [currentCell, setCurrentCell] = useState(null); // Celda actual seleccionada (día, hora, alumno, estado de asistencia)
  const [searchTerm, setSearchTerm] = useState(""); // Término de búsqueda para filtrar alumnos en la tabla
  const [cupoMaximoPilates, setCupoMaximoPilates] = useState(0); // Cupo máximo de alumnos en Pilates (capacidad de la sede)
  const [schedule, setSchedule] = useState([]); // Horarios y alumnos asignados a cada horario
  const [hoy, setHoy] = useState(""); // Día actual en formato de texto (LUNES, MARTES, etc.)
  const [fechaHoy, setFechaHoy] = useState(null); // Fecha actual obtenida de la API de internet
  const [asistenciasHoy, setAsistenciasHoy] = useState({}); // Asistencias registradas para la fecha actual
  const { sedeId } = useInstructorAuth(); // Obtener el ID de la sede del contexto de autenticación del instructor
  const { fecha } = ObtenerFechaInternet(); // Obtener la fecha actual de una API de internet

  // Consulta para obtener los horarios y alumnos asignados a la sede
  const { data: horariosData, refetch: refetchHorarios } = useConsultaDB(
    sedeId ? `/clientes-pilates/horarios?sedeId=${sedeId}` : null
  );

  // Función para modificar la asistencia de un alumno
  const { update } = useModify("/asistencias-pilates/marcar");

  // Consulta para obtener el cupo máximo de la sede
  const { data: sedesData } = useConsultaDB(`/sedes/ciudad`);

  // Filtrar y establecer el cupo máximo de Pilates cuando se obtienen los datos de las sedes
  useEffect(() => {
    if (sedesData && Array.isArray(sedesData) && sedesData.length > 0) {
      const resultado = sedesData.filter((sede) => String(sede.id) === sedeId);
      if (resultado.length > 0) {
        setCupoMaximoPilates(resultado[0].cupo_maximo_pilates);
      }
    }
  }, [sedesData, sedeId]);

  // Usar fechaHoy (obtenida por la API de internet) o la fecha local del equipo
  const fechaParaConsulta = fechaHoy || format(new Date(), "yyyy-MM-dd");
  const { data: asistenciasData, refetch: refetchAsistencias,  loading: loadingAsistencias} = useConsultaDB(
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
    setHoy(obtenerDiaActual());
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
    if (!student) return { content: null, style: "bg-white hover:bg-gray-100" };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let content = <span className="font-semibold">{student.name}</span>;
    let style = "bg-gray-100";
    let isExpired = false;
    switch (student.status) {
      case "plan":
        const startDate = new Date(student.planDetails.startDate + "T00:00:00");
        const expiryDate = new Date(
          startDate.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        isExpired = expiryDate < today;
        style =
          student.planDetails?.type === "L-M-V" ? "bg-gray-100" : "bg-gray-300";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              {isExpired ? "Venció" : "Vence"} el{" "}
              {expiryDate.toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      case "prueba":
        const trialDate = new Date(student.trialDetails.date + "T00:00:00");
        isExpired = trialDate < today;
        style = "bg-cyan-200";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              Clase de prueba{" "}
              {new Date(
                student.trialDetails.date + "T00:00:00"
              ).toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      case "programado":
        const scheduledDate = new Date(
          student.scheduledDetails.date + "T00:00:00"
        );
        isExpired = scheduledDate < today;
        style = "bg-yellow-200";
        content = (
          <span>
            {student.name}
            <br />
            <span className="text-xs italic">
              Renueva el{" "}
              {new Date(
                student.scheduledDetails.date + "T00:00:00"
              ).toLocaleDateString("es-ES")}
            </span>
          </span>
        );
        break;
      default:
        break;
    }
    if (isExpired) style = "bg-red-500 text-white";
    return { content, style };
  }, []);


  // Función para cambiar la asistencia de un alumno
  const cambiarAsistencia = async (studentId, newEstado) => {
    const datos = {
      id_cliente: studentId,
      fecha: fechaParaConsulta,
      presente: newEstado,
    };
    await update(null, datos);
    await refetchAsistencias();
    setIsModalAsistencia(false);
  };

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
    },
    setStates: {
      setIsModalAsistencia,
      setCurrentCell,
      setSearchTerm,
      setSchedule,
    },
    functions: {
      handleCellAsistencia,
      getCellContentAndStyle,
      refetchHorarios,
      refetchAsistencias,
      cambiarAsistencia,
    },
  };
};

export default PilatesInstructorLogica;
