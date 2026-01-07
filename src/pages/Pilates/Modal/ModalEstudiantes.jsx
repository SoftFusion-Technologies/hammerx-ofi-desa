// --- Componente Modal para Agregar/Editar/Eliminar alumno  ---
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { FaEye } from "react-icons/fa";
import useConsultaDB from "../ConsultaDb/Consulta";
import HistorialAlumno from "../Components/HistorialAlumno";
import {MdHistory} from "react-icons/md";
import { TbReplace } from "react-icons/tb";
import {Snowflake} from "lucide-react"
import CongelarPlanAlumno from "../Components/CongelarPlanAlumno";

const StudentModal = ({ isOpen, onClose, onSave, cellData, fechaHoy, onOpenCambioTurno }) => {
  /**
   * UTILITY FUNCTION: Obtiene la fecha actual en formato YYYY-MM-DD local
   * Si la fecha desde la API (fechaHoy) está disponible, se usa esa.
   * Si no, se obtiene la fecha local del navegador para evitar desfases horarios.
   */
  const getLocalDateString = () => {
    const ahora = new Date();
    const year = ahora.getFullYear();
    const month = String(ahora.getMonth() + 1).padStart(2, "0");
    const day = String(ahora.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const today = fechaHoy || getLocalDateString();
  /**
   * UTILITY FUNCTION: Convierte un string de fecha YYYY-MM-DD a un objeto Date local
   * Evita problemas de zona horaria usando el constructor con año, mes y día separados.
   */
  const toLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  /**
   * UTILITY FUNCTION: Calcula la diferencia en días entre dos fechas en formato YYYY-MM-DD
   * Convierte a UTC para evitar problemas de zona horaria.
   * Retorna la cantidad de días redondeados entre ambas fechas.
   */
  const calcularDiasEntreFechas = (fechaInicioStr, fechaFinStr) => {
    // Función interna para convertir "YYYY-MM-DD" a un objeto Date en UTC
    const parsearFechaYMD = (str) => {
      const [anio, mes, dia] = str.split("-");
      // Usamos Date.UTC para ignorar la zona horaria local y evitar errores
      return new Date(Date.UTC(anio, mes - 1, dia));
    };

    const fechaInicio = parsearFechaYMD(fechaInicioStr);
    const fechaFin = parsearFechaYMD(fechaFinStr);

    // Milisegundos en un día (1000ms * 60s * 60min * 24h)
    const msPorDia = 1000 * 60 * 60 * 24;

    // Restamos las fechas para obtener la diferencia en milisegundos
    const diferenciaEnMs = fechaFin - fechaInicio;

    // Convertimos los milisegundos a días y redondeamos
    const diferenciaEnDias = Math.round(diferenciaEnMs / msPorDia);

    return diferenciaEnDias;
  };

  /**
   * ================================================================
   * SECCIÓN 1: ESTADOS DEL COMPONENTE
   * Estados principales para la información del alumno y configuraciones de fechas
   * ================================================================
   */

  // ============ DATOS BÁSICOS DEL ALUMNO ============
  const [idAlumno, setIdAlumno] = useState(null); // ID único del alumno
  const [name, setName] = useState(""); // Apellido y nombre del alumno
  const [contact, setContact] = useState(""); // Teléfono, email, Instagram, etc.
  const [status, setStatus] = useState("plan"); // Estado actual: plan, prueba o programado
  
  // ============ FECHAS Y DURACIONES DEL PLAN ============
  const [planStartDate, setPlanStartDate] = useState(today); // Fecha de inicio del plan (YYYY-MM-DD)
  const [planStartDateAux, setPlanStartDateAux] = useState(today); // Backup de fecha inicio original
  const [planDuration, setPlanDuration] = useState("29"); // Duración del plan en días
  const [planDurationAux, setPlanDurationAux] = useState("29"); // Backup de duración original
  const [planEndDate, setPlanEndDate] = useState(""); // Fecha fin calculada automáticamente
  const [planEndDateAux, setPlanEndDateAux] = useState(""); // Backup de fecha fin original
  const [habilitarFechaFinPersonalizada, setHabilitarFechaFinPersonalizada] = useState(false); // Permite editar fecha fin manualmente

  // ============ FECHAS PARA PRUEBA Y RENOVACIÓN ============
  const [trialDate, setTrialDate] = useState(today); // Fecha de la clase de prueba
  const [scheduledDate, setScheduledDate] = useState(today); // Fecha de renovación programada
  
  // ============ OBSERVACIONES Y AUDITORÍA ============
  const [observation, setObservation] = useState(""); // Notas adicionales del alumno (alergias, lesiones, etc.)
  const [detailsAuditoria, setDetailsAuditoria] = useState(null); // Motivo de cambios en fechas personalizadas
  
  // ============ FLAGS DE CAMBIOS DE ESTADO ============
  const [statusAux, setStatusAux] = useState(""); // Estado anterior del alumno
  const [esClientePlanParaProgramado, setEsClientePlanParaProgramado] = useState(false); // Cambio de plan a renovación programada
  const [esClienteProgramadoAContratado, setEsClienteProgramadoAContratado] = useState(false); // Cambio de renovación a nuevo plan
  const [habilitarRenovacionProgramanda, setHabilitarRenovacionProgramada] = useState(true); // Permite seleccionar opción "Renovación programada"
  const [debeGuardarPorCongelamiento, setDebeGuardarPorCongelamiento] = useState(false); // Indica si se debe guardar por congelamiento de plan
  const [habilitarClasePrueba, setHabilitarClasePrueba] = useState(true); // Permite seleccionar opción "Clase de prueba"
  const [esClienteParaRenovar, setEsClienteParaRenovar] = useState(false); // Indica si hay plan anterior vencido pendiente de renovación
  const [alumnoNuevo, setAlumnoNuevo] = useState(false); // Diferencia entre agregar nuevo alumno vs editar existente
  const [renovacionDirectaActiva, setRenovacionDirectaActiva] = useState(false); // Toggle para atajo Renovación Directa

  // ============ OBJETOS DATE PARA REACT-DATEPICKER ============
  const [planStartDateObj, setPlanStartDateObj] = useState(null); // Objeto Date para selector de inicio del plan
  const [trialDateObj, setTrialDateObj] = useState(null); // Objeto Date para selector de prueba
  const [scheduledDateObj, setScheduledDateObj] = useState(null); // Objeto Date para selector de renovación
  const [planPersonalizedObj, setPlanPersonalizedObj] = useState(null); // Objeto Date para fecha fin personalizada

  // ============ UI MODAL ============
  const [mostrarDetallesAuditoria, setMostrarDetallesAuditoria] = useState(false); // Alterna entre vista principal y vista de auditoría
  // ============ COMPONENTS ============
  const [seccion, setSeccion] = useState("PRINCIPAL"); // Muestra el componente de Historial de Alumno
  /**
   * ================================================================
   * SECCIÓN 2: EFFECTS - SINCRONIZACIÓN DE FECHAS CON REACT-DATEPICKER
   * Convierten los strings de fecha a objetos Date para el componente DatePicker
   * ================================================================
   */

  useEffect(() => {
    setPlanStartDateObj(planStartDate ? toLocalDate(planStartDate) : null);
  }, [planStartDate]);
  useEffect(() => {
    setTrialDateObj(trialDate ? toLocalDate(trialDate) : null);
  }, [trialDate]);

  useEffect(() => {
    setScheduledDateObj(scheduledDate ? toLocalDate(scheduledDate) : null);
  }, [scheduledDate]);

  useEffect(() => {
    setPlanPersonalizedObj(planEndDate ? toLocalDate(planEndDate) : null);
  }, [planEndDate]);

  /**
   * ================================================================
   * SECCIÓN 3: CONSULTAS A LA API
   * Obtiene datos de auditoría cuando necesario
   * ================================================================
   */

const { data: auditoriaData } = useConsultaDB(
    idAlumno && ![29, 89, 179, 359].includes(Number(planDurationAux))
      ? `/auditoria-pilates/cliente/${idAlumno}`
      : null
  );;

  /**
   * ================================================================
   * SECCIÓN 4: EFFECTS - CARGA DE DATOS DESDE API
   * Cargan información de auditoría y datos iniciales del alumno 
   * ================================================================
   */

  /**
   * EFFECT: Carga los detalles de auditoría si existe una edición previa con fecha personalizada
   * Se ejecuta cuando se recuperan datos de auditoría o cambia el ID del alumno
   */
  useEffect(() => {
    if (auditoriaData && idAlumno) {
      setDetailsAuditoria(auditoriaData?.motivo);
    }
  }, [auditoriaData, idAlumno]);

  /**
   * EFFECT: Guarda el status auxiliar y fechas auxiliares cuando cambian los datos de la celda
   * Establece restricciones según el estado actual (ej: no volver a prueba desde plan)
   */
  useEffect(() => {
    if (cellData && cellData.student) {
      setStatusAux(cellData.student.status);
      if (cellData.student.status === "plan") {
        setPlanStartDateAux(cellData.student.planDetails.startDate);
        setPlanEndDateAux(cellData.student.planDetails.endDate);
        setHabilitarRenovacionProgramada(true);
        setHabilitarClasePrueba(false); // No permitir volver a prueba desde plan
      } else if (cellData.student.status === "prueba") {
        setHabilitarRenovacionProgramada(true);
        setHabilitarClasePrueba(true);
      }
    }
  }, [cellData]);

  /**
   * ================================================================
   * SECCIÓN 5: EFFECTS - LÓGICA DE CÁLCULO DE FECHAS
   * Recalcula fechas y duraciones cuando cambian los valores
   * ================================================================
   */

  /**
   * EFFECT: Restablece la fecha fin al valor original si se deshabilita la edición personalizada
   * Recalcula la duración basado en la fecha fin auxiliar
   */
  useEffect(() => {
    if (!habilitarFechaFinPersonalizada) {
      setPlanEndDate(planEndDateAux);
      const duracion_dias = calcularDiasEntreFechas(
        planStartDate,
        planEndDateAux
      );
      setPlanDuration(duracion_dias ? String(duracion_dias) : "29");
    }
  }, [habilitarFechaFinPersonalizada]);

  /**
   * EFFECT: Actualiza la duración del plan si la fecha fin personalizada cambia
   * Se ejecuta solo cuando está habilitada la edición de fecha fin
   */
  useEffect(() => {
    if (planEndDate && habilitarFechaFinPersonalizada) {
      const duracion_dias = calcularDiasEntreFechas(planStartDate, planEndDate);
      setPlanDuration(duracion_dias ? String(duracion_dias) : "29");
    }
  }, [planEndDate]);

  /**
   * ================================================================
   * SECCIÓN 6: EFFECTS - DETECCIÓN DE CAMBIOS DE ESTADO
   * Detecta transiciones entre estados (plan → programado, programado → plan)
   * ================================================================
   */

  /**
   * EFFECT: Detecta cambios de status entre plan, programado y prueba
   * Maneja dos casos principales:
   * 1. De PLAN a PROGRAMADO (cliente pasa de contratado a renovación programada)
   * 2. De PROGRAMADO a PLAN (cliente regresa a contrato después de programado)
   */
  useEffect(() => {
    // CASO 1: El usuario cambia de un PLAN a PROGRAMADO
    if (status && status === "programado" && statusAux === "plan") {
      setEsClientePlanParaProgramado(true);
      setEsClienteProgramadoAContratado(false);
    }
    // CASO 2: El usuario cambia de PROGRAMADO a PLAN (y es un cliente que venía de un plan)
    else if (
      status === "plan" &&
      statusAux === "programado" &&
      cellData?.student?.scheduledDetails?.promisedDate
    ) {
      setEsClienteProgramadoAContratado(true);
      setEsClientePlanParaProgramado(false);
      // Tomar el último vencimiento y colocar la fecha de inicio AL DÍA SIGUIENTE
      const ultimoVencimiento = cellData?.student?.planDetails?.endDate;
      if (ultimoVencimiento) {
        const [y, m, d] = ultimoVencimiento.split("-").map(Number);
        const fecha = new Date(y, m - 1, d);
        fecha.setDate(fecha.getDate() + 1); // sumar 1 día
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        setPlanStartDate(`${año}-${mes}-${dia}`);
      } else {
        // fallback: siguiente día hábil a hoy
        setPlanStartDate(today);
      }
    } else {
      setEsClientePlanParaProgramado(false);
      setEsClienteProgramadoAContratado(false);
    }
  }, [status, cellData, statusAux]);

  /**
   * ================================================================
   * SECCIÓN 7: EFFECTS - INICIALIZACIÓN Y CARGA DE MODAL
   * Cargan datos del alumno al abrir el modal (editar o agregar nuevo)
   * ================================================================
   */

  /**
   * EFFECT: Carga los datos del alumno a editar o inicializa campos para nuevo alumno
   * Se ejecuta cuando se abre el modal o cambian los datos de la celda seleccionada
   */
  useEffect(() => {
    if (!cellData) return;
    const student = cellData.student;
    if (student) {
      // Lógica para editar
      setAlumnoNuevo(false);
      setIdAlumno(student.id);
      setName(student.name);
      setContact(student.contact || "");
      setStatus(student.status);
      setObservation(student.observation || "");
      if (
        student.status === "programado" &&
        student.scheduledDetails?.promisedDate
      ) {
        setEsClienteParaRenovar(true);
        setHabilitarClasePrueba(false);
      }
      if (student.status === "plan" && student.planDetails) {
        // Calcular duración del plan usando la fecha de inicio y fin
        const duracion_dias = calcularDiasEntreFechas(
          student.planDetails.startDate,
          student.planDetails.endDate
        );
        setPlanStartDate(student.planDetails.startDate);
        setPlanDuration(duracion_dias ? String(duracion_dias) : "29");
        setPlanDurationAux(duracion_dias ? String(duracion_dias) : "29");
        // reset toggle cuando cargamos datos del alumno
        setRenovacionDirectaActiva(false);
      } else if (student.status === "prueba" && student.trialDetails) {
        setTrialDate(student.trialDetails.date);
      } else if (student.status === "programado" && student.scheduledDetails) {
        const fecha =
          student.scheduledDetails?.promisedDate ||
          student.scheduledDetails.date;
        setScheduledDate(fecha);
      }
    } else {
      // Lógica para agregar nuevo alumno
      setAlumnoNuevo(true);
      setIdAlumno(null);
      setName("");
      setContact("");
      setStatus("plan");
      setPlanStartDate(today);
      setPlanDuration("29");
      setTrialDate(today);
      setScheduledDate(today);
      setObservation("");
      setRenovacionDirectaActiva(false);
    }
  }, [isOpen, cellData?.student]);

  /**
   * ================================================================
   * SECCIÓN 8: EFFECTS - CÁLCULO AUTOMÁTICO DE FECHA FIN
   * Calcula la fecha de fin del plan basado en fecha de inicio y duración
   * ================================================================
   */

  /**
   * UTILITY FUNCTION: Convierte un objeto Date a string en formato YYYY-MM-DD
   */
  const formatDateToYMD = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  /**
   * EFFECT: Calcula automáticamente la fecha de fin del plan
   * Suma la duración (en días) a la fecha de inicio y actualiza planEndDate
   * Se ejecuta cuando cambian la fecha de inicio o la duración
   */
  useEffect(() => {
    if (planStartDate && planDuration) {
      const parts = planStartDate.split("-");
      const startDate = new Date(
        parseInt(parts[0]),
        parseInt(parts[1]) - 1,
        parseInt(parts[2])
      );

      startDate.setDate(startDate.getDate() + Number(planDuration));

      const endDateString = formatDateToYMD(startDate);
      setPlanEndDate(endDateString);
    }
  }, [planStartDate, planDuration]);

  // Effect para guardar automáticamente tras el congelamiento
  useEffect(() => {
    if (debeGuardarPorCongelamiento) {
      handleSave();
      setDebeGuardarPorCongelamiento(false);
    }
  }, [planEndDate, detailsAuditoria, debeGuardarPorCongelamiento]);

  /**
   * ================================================================
   * SECCIÓN 9: FUNCIONES DE MANEJO DE EVENTOS (HANDLERS)
   * Funciones que procesan interacciones del usuario
   * ================================================================
   */

  /**
   * FUNCTION: Valida y guarda los datos del alumno
   * Ejecuta validaciones (nombre, contacto, observaciones).
   * Prepara el objeto de datos según el estado seleccionado (plan/prueba/programado).
   * Determina si es una operación de agregar o modificar.
   */
  if (!isOpen) return null;

  const handleSave = () => {
    if (!cellData) {
      alert("Error: No se pudo obtener información de la celda.");
      return;
    }
    if (!name) {
      alert("El nombre y apellido no pueden estar vacíos.");
      return;
    }
    if (name.length < 5) {
      alert("El nombre y apellido deben tener al menos 5 caracteres.");
      return;
    }
    if (!contact) {
      alert("El contacto no puede estar vacío.");
      return;
    }
    if (contact.length < 3) {
      alert("El contacto debe tener al menos 3 caracteres.");
      return;
    }
    // Validar auditoría: si está habilitada la edición de fecha personalizada, es OBLIGATORIO el motivo
    if (habilitarFechaFinPersonalizada) {
      if (!detailsAuditoria || detailsAuditoria.trim().length === 0) {
        alert(
          "El motivo de la auditoría es obligatorio cuando se edita la fecha de vencimiento."
        );
        return;
      }
      if (
        detailsAuditoria.trim().length < 20 ||
        detailsAuditoria.trim().length > 250
      ) {
        alert(
          "El motivo de la auditoría debe tener entre 20 y 250 caracteres."
        );
        return;
      }
    }
    const [day] = cellData.key.split("-");
    const planType = ["LUNES", "MIÉRCOLES", "VIERNES"].includes(day)
      ? "L-M-V"
      : "M-J";

    let studentData = {
      id: cellData.student?.id || null,
      name: name.toUpperCase(),
      contact: contact.toUpperCase(),
      status,
      observation: observation || null,
      auditDetails: detailsAuditoria || null,
    };
    const isModification = !!studentData.id;
    let accion = isModification ? "modificar" : "agregar";

    switch (status) {
      case "plan":
        studentData.planDetails = {
          type: planType,
          startDate: planStartDate,
          startDateAux: planStartDateAux,
          endDate: planEndDate,
          endDateAux: planEndDateAux,
          duration: Number(planDuration),
        };
        if (esClienteProgramadoAContratado) {
          studentData.fecha_prometido_pago = null;
        }
        break;
      case "prueba":
        studentData.trialDetails = { date: trialDate, type: planType };
        break;
      case "programado":
        studentData.scheduledDetails = {
          type: planType,
          date: scheduledDate,
          startDateAux: planStartDateAux,
          endDateAux: planEndDateAux,
          promisedDate:
            cellData.student?.scheduledDetails?.promisedDate || null,
        };
        break;
      default:
        break;
    }
    let mensajeExtra = esClientePlanParaProgramado
      ? "De plan a programado"
      : esClienteProgramadoAContratado
      ? "De programado a contratado"
      : null;
    onSave(cellData.key, studentData, accion, mensajeExtra);
    onClose();
  };

  /**
   * FUNCTION: Elimina el alumno del horario
   * Obtiene la información de la celda, prepara los datos y llama a onSave con acción "eliminar"
   */
  const handleDelete = () => {
    if (!cellData) {
      alert("Error: No se pudo obtener información de la celda.");
      return;
    }
    onSave(null, cellData, "eliminar");
    onClose();
  };

  /**
  * FUNCTION: Maneja el atajo de "Renovación Directa"
  * Toma la fecha de fin del plan actual, le suma 1 día y prepara
  * el formulario para una renovación en estado "plan".
  */
  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "renovacion_directa") {
      // Lógica para ACTIVAR renovación directa
      const ultimoVencimiento = cellData?.student?.planDetails?.endDate;
      if (ultimoVencimiento) {
        const [y, m, d] = ultimoVencimiento.split("-").map(Number);
        const fecha = new Date(y, m - 1, d);
        fecha.setDate(fecha.getDate() + 1); // sumar 1 día
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");
        const newStartDate = `${año}-${mes}-${dia}`;

        setPlanStartDate(newStartDate);
        setStatus("plan"); // Internamente sigue siendo estado "plan"
        setEsClienteProgramadoAContratado(true);
        setEsClientePlanParaProgramado(false);
        setEsClienteParaRenovar(true);
        setRenovacionDirectaActiva(true);
      } else {
        alert(
          "Error: No se encontró un plan anterior para renovar directamente."
        );
      }
    } else {
      // Si el usuario cambia a otra opción, y estaba activa la renovación directa, reseteamos
      if (renovacionDirectaActiva) {
        const originalStart = planStartDateAux || today;
        setPlanStartDate(originalStart);
        setEsClienteProgramadoAContratado(false);
        setEsClientePlanParaProgramado(false);
        setEsClienteParaRenovar(false);
        setRenovacionDirectaActiva(false);
      }
      setStatus(selectedValue);
    }
  };

  /**
   * UTILITY FUNCTION: Convierte fecha en formato YYYY-MM-DD a DD/MM/YYYY
   * Utilizado para mostrar fechas en formato amigable en la interfaz
   */
  const formatearFechaSimple = (fechaStr) => {
    if (!fechaStr || !fechaStr.includes("-")) {
      return "";
    }
    const [año, mes, dia] = fechaStr.split("-");
    return `${dia}/${mes}/${año}`;
  };

  /**
   * ================================================================
   * SECCIÓN 10: RENDERIZADO DEL COMPONENTE (JSX)
   * Estructura del Modal con dos vistas:
   * 1. Vista Principal: Formulario para agregar/editar alumnos
   * 2. Vista de Auditoría: Detalles del último cambio de fecha de vencimiento
   * ================================================================
   */

  // Función simple para determinar qué dice el botón según la selección
  const getTextoBoton = () => {
    // Si no hay alumno (modo agregar nuevo), siempre es Guardar
    if (!cellData?.student) return "Guardar";

    // Obtenemos el estado original del alumno
    const estadoOriginal = cellData.student.status;

    // Caso especial: Renovación Directa (tiene prioridad)
    if (renovacionDirectaActiva) return "Renovar";

    // Si el estado es el MISMO que traía, es solo una actualización de datos
    if (status === estadoOriginal) {
      return "Actualizar";
    }

    // Si el estado CAMBIÓ, mostramos el texto acorde a la nueva selección
    if (status === "plan") return "Contratar";
    if (status === "programado") return "Programar";
    if (status === "prueba") return "Agendar Prueba";
    
    // Default fallback
    return "Actualizar";
  };


  //Función para confirmar el congelamiento del plan
 const confirmarCongelamiento = (fechaVencimientoCongelada) => {
   try {
     if (!fechaVencimientoCongelada) {
       throw new Error("Fecha de vencimiento congelada no proporcionada.");
     }
     setPlanEndDate(fechaVencimientoCongelada);
     setDetailsAuditoria((previo) => {
      const base = previo ? previo.trim() : "";
      const mensaje = "Congelamiento de plan solicitado.";

      if (base.includes(mensaje)) {
        return base;
      }

      return base.length > 0 
        ? `${base}. ${mensaje}` 
        : mensaje;
    });
     setDebeGuardarPorCongelamiento(true);
   } catch (error) {
     console.error("Error al confirmar congelamiento:", error);
   }
 };

  // Ocultar modal si no está abierto
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto p-4">
      {seccion === "PRINCIPAL" ? (
        <>
              {!mostrarDetallesAuditoria ? (
        <div className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-2xl">
          {/* VISTA PRINCIPAL: Formulario para agregar/editar alumno */}

          {/* Encabezado del modal */}
          <h2 className="text-4xl font-bold mb-6 text-orange-600 font-bignoodle text-center">
            {cellData?.student ? "Modificar Alumno" : "Agregar Alumno"}
          </h2>
          {cellData?.student ? (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 ">
              <p className="text-gray-600 text-center">
                {cellData?.day} a las {cellData?.time}
              </p>

              <div className="flex gap-2">
              <button
                onClick={() => {
                  if (onOpenCambioTurno) {
                    const alumnoData = {
                      id: cellData.student.id,
                      name: cellData.student.name,
                      contact: cellData.student.contact,
                      currentDay: cellData.day,
                      currentHour: cellData.time,
                      status: cellData.student.status,
                      observation: cellData.student.observation || "",
                      planDetails: cellData.student.planDetails || null,
                    };
                    onOpenCambioTurno(alumnoData);
                    onClose();
                  }
                }}
                className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
              >
                <TbReplace className="text-lg" />
                <span>Cambiar turno</span>
              </button>
              <button
                className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
                onClick={() => setSeccion("HISTORIAL")}
              >
                <MdHistory className="text-lg" />
                <span>Historial</span>
              </button>
              {cellData.student.status === "plan" && (
              <button
                className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-gradient-to-r hover:from-orange-500 hover:to-orange-600  text-orange-600 hover:text-white border-[1px] border-orange-600 hover:border-orange-600 font-medium transition-all duration-300 shadow hover:shadow-lg"
                onClick={() => setSeccion("CONGELAR")}
              >
                <Snowflake className="text-sm" />
                <span>Congelar</span>
              </button>

              )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-center">
              {cellData?.day} a las {cellData?.time}
            </p>
          )}

          {cellData?.tipoInscripcion === "cupo_adicional" && (
          <div className={`bg-orange-100 border-l-4 border-orange-500 rounded-md p-4 mb-2 ${cellData.student && "mt-1"}`}>
            <h2 className={`text-2xl font-bold text-orange-600 font-bignoodle text-start uppercase tracking-wide`}>
              Cupo Adicional
            </h2>
            <p className="text-orange-700 text-sm font-sans">
              {cellData.student 
                ? "Se está modificando un alumno fuera del límite estándar." 
                : "Se está inscribiendo un alumno fuera del límite estándar."}
            </p>
          </div>
          )}

          {/* SECCIÓN: Datos básicos del alumno (nombre y contacto) */}
          <div className="mb-4">
            <label
              className="block text-orange-600 font-messina text-sm font-bold mb-2"
              htmlFor="name"
            >
              Apellido y Nombre
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                      const cleanValue = e.target.value
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-zA-Z0-9 ]/g, "");

                      setName(cleanValue.toUpperCase());
                    }}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: PÉREZ, JUAN"
              maxLength={100}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-orange-600 font-messina text-sm font-bold mb-2"
              htmlFor="name"
            >
              Contacto
            </label>
            <input
              id="name"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value.toUpperCase())}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Teléfono, Email, Instagram, etc."
              maxLength={50}
            />
          </div>

          {/* SECCIÓN: Selector de estado/tipo de plan */}
          <div className="mb-6">
            <label
              className="block text-orange-600 font-messina text-sm font-bold mb-2"
              htmlFor="status"
            >
              Estado / Plan
            </label>
            <select
              id="status"
              value={renovacionDirectaActiva ? "renovacion_directa" : status}
              onChange={handleStatusChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {cellData?.student && status === "plan" && (
                <option value="renovacion_directa">Renovación Directa</option>
              )}
              <option value="plan">Plan Contratado</option>

              {habilitarRenovacionProgramanda && (
                <option value="programado">
                  Visita o Renovación programada
                </option>
              )}
              {habilitarClasePrueba && (
                <option value="prueba">Clase de Prueba</option>
              )}
            </select>
          </div>

          {/* SECCIÓN: Formulario de PLAN CONTRATADO */}
          {status === "plan" && (
            <>
              <div>
                <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
                  Fecha de Contratación
                </label>
                <DatePicker
                  selected={planStartDateObj}
                  disabled={esClienteProgramadoAContratado}
                  onChange={(date) => {
                    if (!date) {
                      setPlanStartDate("");
                      setPlanStartDateObj(null);
                      return;
                    }
                    const iso = date.toISOString().slice(0, 10);
                    setPlanStartDate(iso);
                    setPlanStartDateObj(date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccioná una fecha"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  locale={es}
                />
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <label
                    className="block text-orange-600 font-messina text-sm font-bold"
                    htmlFor="planDuration"
                  >
                    Duración del Plan
                  </label>
                  {!alumnoNuevo &&
                    !["359", "179", "89", "29"].includes(planDurationAux) && (
                      <button
                        type="button"
                        onClick={() => setMostrarDetallesAuditoria(true)}
                        className="text-orange-600 flex items-center font-semibold cursor-pointer"
                      >
                        <FaEye />
                        <span className="ml-1">Ver</span>{" "}
                      </button>
                    )}
                </div>
                <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 items-center gap-6">
                  <div className="col-span-1">
                    <select
                      id="planDuration"
                      value={planDuration}
                      onChange={(e) => setPlanDuration(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="29">Mensual</option>
                      <option value="89">Trimestral</option>
                      <option value="179">Semestral</option>
                      <option value="359">Anual</option>
                      {!alumnoNuevo &&
                        planDuration !== "359" &&
                        planDuration !== "179" &&
                        planDuration !== "29" && (
                          <option value={planDuration}>Personalizado</option>
                        )}
                    </select>
                  </div>
                  <p className="text-sm text-gray-500 font-bold mt-2">
                    Duración: {planDuration} días
                  </p>

                  {alumnoNuevo ? (
                    <p className="text-sm text-gray-500 font-bold mt-2">
                      Vence:{" "}
                      {planEndDate &&
                        new Date(planEndDate + "T00:00:00").toLocaleDateString(
                          "es-ES"
                        )}
                    </p>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-1 items-start">
                      {habilitarFechaFinPersonalizada ? (
                        <>
                          <p className="text-sm text-gray-500 font-bold mt-2">
                            Vence:{" "}
                          </p>
                          <DatePicker
                            selected={planPersonalizedObj}
                            onChange={(date) => {
                              if (!date) {
                                setPlanEndDate("");
                                setPlanPersonalizedObj(null);
                                return;
                              }
                              const iso = date.toISOString().slice(0, 10);
                              setPlanEndDate(iso);
                              setPlanPersonalizedObj(date);
                            }}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Seleccioná una fecha"
                            className="shadow appearance-none border rounded w-full sm:max-w-[140px] py-2 px-3 text-gray-700"
                            locale={es}
                          />
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 font-bold mt-2">
                          Vence:{" "}
                          {planEndDate &&
                            new Date(
                              planEndDate + "T00:00:00"
                            ).toLocaleDateString("es-ES")}
                        </p>
                      )}
                      <button
                        className="flex items-center space-x-2 px-2 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
                        onClick={() =>
                          setHabilitarFechaFinPersonalizada(
                            !habilitarFechaFinPersonalizada
                          )
                        }
                      >
                        {habilitarFechaFinPersonalizada ? "Cancelar" : "Editar"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {habilitarFechaFinPersonalizada && (
                <div className="mt-4">
                  <label
                    htmlFor="motivoEdicion"
                    className="block text-orange-600 font-messina text-sm font-bold mb-2"
                  >
                    Motivo de la edición de la fecha de vencimiento:
                  </label>
                  <textarea
                    id="motivoEdicion"
                    rows="2"
                    maxLength={250}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Se extiende el plan por una lesión del cliente en el gimnasio..."
                    value={detailsAuditoria}
                    onChange={(e) => setDetailsAuditoria(e.target.value)}
                  />
                </div>
              )}
              {esClienteParaRenovar && (
                <div className="mt-2 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                  <p className="text-sm">
                    <strong>Renovación consecutiva:</strong> El nuevo plan
                    inicia automáticamente el día siguiente al último
                    vencimiento (
                    {formatearFechaSimple(cellData.student.planDetails.endDate)}
                    ), para mantener la continuidad.
                  </p>
                </div>
              )}
            </>
          )}

          {/* SECCIÓN: Formulario de CLASE DE PRUEBA */}
          {status === "prueba" && (
            <div>
              <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
                Fecha de la Clase
              </label>
              <DatePicker
                selected={trialDateObj}
                onChange={(date) => {
                  if (!date) {
                    setTrialDate("");
                    setTrialDateObj(null);
                    return;
                  }
                  const iso = date.toISOString().slice(0, 10);
                  setTrialDate(iso);
                  setTrialDateObj(date);
                }}
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccioná una fecha"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                locale={es}
              />
            </div>
          )}

          {/* SECCIÓN: Formulario de RENOVACIÓN PROGRAMADA */}
          {status === "programado" && (
            <>
              <div>
                <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
                  Fecha de Pago/Inicio
                </label>
                <DatePicker
                  selected={scheduledDateObj}
                  disabled={esClienteProgramadoAContratado}
                  onChange={(date) => {
                    if (!date) {
                      setScheduledDate("");
                      setScheduledDateObj(null);
                      return;
                    }
                    const iso = date.toISOString().slice(0, 10);
                    setScheduledDate(iso);
                    setScheduledDateObj(date);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccioná una fecha"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                  locale={es}
                />
              </div>
              {esClienteParaRenovar && (
                <div className="mt-2 p-3 bg-green-100 border-l-4 border-green-500 text-green-800 rounded-r-lg">
                  <p className="text-sm">
                    Este cliente tiene una renovación pendiente. Su plan
                    anterior finalizó el{" "}
                    <strong>
                      {formatearFechaSimple(
                        cellData.student.planDetails.endDate
                      )}
                    </strong>
                    .
                  </p>
                </div>
              )}

              {!esClienteParaRenovar && esClientePlanParaProgramado && (
                <div className="mt-2">
                  <p>
                    El cliente finaliza o finalizó su plan el día{" "}
                    <strong>
                      {formatearFechaSimple(
                        cellData.student.planDetails.endDate
                      )}
                    </strong>
                    . Al colocarlo en{" "}
                    <strong>“Visita o renovación programada”</strong>, se
                    respetará su última fecha de vencimiento y se conservará su
                    lugar en la clase hasta que confirme el pago.
                  </p>
                </div>
              )}
            </>
          )}

          {/* SECCIÓN: Campo de observaciones generales */}
          <div className="mt-4">
            <label className="block text-orange-600 font-messina text-sm font-bold mb-2">
              Observación (Opcional)
            </label>
            <textarea
              id="observation"
              value={observation}
              onChange={(e) => setObservation(e.target.value.toUpperCase())}
              rows="4"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Añade una observación...EJ: alergias, lesiones, preferencias, etc."
              maxLength={255}
            ></textarea>
          </div>

          {/* SECCIÓN: Botones de acción (Guardar, Dar de baja, Cancelar) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between mt-8 gap-3">
            <div className="w-full sm:w-auto">
              <button
                onClick={handleSave}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {getTextoBoton()}
              </button>
            </div>
            {cellData?.student && (
              <div className="w-full sm:w-auto">
                <button
                  onClick={handleDelete}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Dar de baja
                </button>
              </div>
            )}
            <div className="w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto inline-block text-center font-bold text-sm text-blue-500 hover:text-blue-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : (
        // --- Vista de Detalles de Auditoría ---
        /* VISTA ALTERNATIVA: Modal para mostrar detalles de modificaciones de fechas personalizadas */
        <div className="bg-white rounded-lg p-8 w-full max-w-2xl shadow-2xl">
          {/* Encabezado del modal de auditoría */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <FaEye className="text-orange-500" />
              Detalles de la Modificación
            </h2>
          </div>

          {/* Sección de información del usuario y fecha */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">
              Último cambio realizado por:
            </p>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-orange-500 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold text-xl">
                {/* Reemplazar con la inicial del usuario, ej: cellData.student.auditoria.usuario[0] */}
                L
              </div>
              <div>
                <p className="font-bold text-lg text-gray-900">
                  {/* Reemplazar con: cellData.student.auditoria.usuario */}
                  {auditoriaData?.nombre_usuario || "N/D"}
                </p>
                <p className="text-sm text-gray-600">
                  {/* Reemplazar con: cellData.student.auditoria.fecha */}
                  {auditoriaData?.fecha_modificacion || "N/D"}
                </p>
              </div>
            </div>
          </div>

          {/* Sección que detalla los cambios realizados */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Motivo del cambio:
            </h3>
            <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
              {/* Ejemplo de un cambio en las observaciones */}
              <div>
                <p className="text-sm text-gray-800 mt-1 p-2 border-l-4 border-orange-500 bg-orange-50 rounded-r-lg">
                  {/* Reemplazar con: cellData.student.auditoria.cambios.observaciones.nuevo */}
                  {auditoriaData?.motivo || "N/D"}
                </p>
              </div>
            </div>
          </div>

          {/* Botón para volver al formulario principal */}
          <div className="flex justify-end mt-8 border-t pt-6">
            <button
              className="w-full font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => setMostrarDetallesAuditoria(false)}
            >
              Volver
            </button>
          </div>
        </div>
      )}
        </>
      ) : seccion === "HISTORIAL" ? (
        <HistorialAlumno volver={() => setSeccion("PRINCIPAL")} cerrar={onClose} idCliente={cellData.student.id} nombreCliente={cellData.student.name}></HistorialAlumno>
      ) : seccion === "CONGELAR" ? (
        <CongelarPlanAlumno fechaVencimientoActual={planEndDateAux} idCliente={cellData.student.id} nombreCliente={cellData.student.name} volver={() => setSeccion("PRINCIPAL")} cerrar={onClose} confirmarCongelamiento={confirmarCongelamiento}></CongelarPlanAlumno>
      ) : null}
    </div>
  );
};

export default StudentModal;