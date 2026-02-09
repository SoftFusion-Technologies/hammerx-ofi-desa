/* Autor: Sergio Manrique
Fecha de creación: 23-12-2025
*/
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = "http://localhost:8080";

// --- PETICIONES API ---
export const cargarHistorial = async (
  idAlumno,
  setLoadingHistorial,
  setHistorialSeleccionado
) => {
  setLoadingHistorial(true);
  try {
    // GET /pilates/historial-contactos/:id
    const response = await axios.get(
      `${API_BASE_URL}/pilates/historial-contactos/${idAlumno}`
    );
    setHistorialSeleccionado(response.data);
  } catch (err) {
    console.error("Error cargando historial:", err);
    alert("Error al cargar el historial del alumno.");
  } finally {
    setLoadingHistorial(false);
  }
};

// Editar observación
export const handleEditarHistorial = async (
  item,
  alumnoSeleccionado,
  setLoadingHistorial,
  setHistorialSeleccionado
) => {
  const { value: nuevaObservacionEditada } = await Swal.fire({
    title: "Editar observación",
    input: "textarea",
    inputLabel: "Modifica la observación",
    inputValue: item.observacion,
    showCancelButton: true,
    confirmButtonText: "Guardar cambios",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#d33",
    inputValidator: (value) => {
      if (!value) {
        return "¡Debes escribir algo!";
      }
    },
  });

  if (nuevaObservacionEditada) {
    try {
      await axios.patch(
        `${API_BASE_URL}/pilates/historial-contactos/${item.id}`,
        {
          observacion: nuevaObservacionEditada.toUpperCase(),
        }
      );

      await Swal.fire({
        icon: "success",
        title: "¡Actualizado!",
        text: "La observación ha sido modificada.",
        timer: 2000,
        showConfirmButton: false,
      });

      await cargarHistorial(
        alumnoSeleccionado.id,
        setLoadingHistorial,
        setHistorialSeleccionado
      );
    } catch (err) {
      console.error("Error editando:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la observación.",
      });
    }
  }
};

// Eliminar observación
export const handleEliminarHistorial = async (
  id,
  alumnoSeleccionado,
  setLoadingHistorial,
  setHistorialSeleccionado,
  refetchAusentesData
) => {
  const result = await Swal.fire({
    title: "¿Estás seguro?",
    text: "No podrás revertir esta acción.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`${API_BASE_URL}/pilates/historial-contactos/${id}`);

      await Swal.fire({
        icon: "success",
        title: "¡Eliminado!",
        text: "El registro ha sido eliminado.",
        timer: 2000,
        showConfirmButton: false,
      });
      await cargarHistorial(
        alumnoSeleccionado.id,
        setLoadingHistorial,
        setHistorialSeleccionado
      );
      refetchAusentesData();
    } catch (err) {
      console.error("Error eliminando:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el registro.",
      });
    }
  }
};

// Guardar nueva observación
// MODIFICADO: Si esperandoRespuesta es true, NO valida texto vacío.
export const handleGuardarObservacion = async (
  nuevaObservacion,
  alumnoSeleccionado,
  userId,
  setNuevaObservacion,
  refetchAusentesData,
  setLoadingHistorial,
  setHistorialSeleccionado,
  esperandoRespuesta
) => {
  
  // Validamos SOLO si no es una espera automática
  if (!esperandoRespuesta && !nuevaObservacion.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Campo vacío",
      text: "Por favor, escribe una observación antes de guardar.",
      confirmButtonColor: "#3085d6",
    });
  }

  // Textos dinámicos según el caso
  const tituloSwal = esperandoRespuesta ? "Iniciar espera" : "¿Estás seguro?";
  const textoSwal = esperandoRespuesta 
    ? "Se marcará al alumno en AMARILLO (Esperando Respuesta) y se creará un registro automático." 
    : "Se agregará esta observación al historial de contacto del alumno.";

  // 1. Pregunta de confirmación
  const result = await Swal.fire({
    title: tituloSwal,
    text: textoSwal,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#3b82f6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Sí, guardar",
    cancelButtonText: "Cancelar",
  });

  // Si el usuario confirma, procedemos con el POST
  if (result.isConfirmed) {
    try {
      await axios.post(`${API_BASE_URL}/pilates/historial-contactos`, {
        id_cliente: Number(alumnoSeleccionado.id),
        id_usuario: Number(userId),
        // Si es espera y está vacío, mandamos string vacío y el backend se encarga de rellenar
        observacion: nuevaObservacion.trim().toUpperCase(), 
        contacto_realizado: String(alumnoSeleccionado.racha_actual),
        esperando_respuesta: esperandoRespuesta
      });

      // 2. Mensaje de éxito
      await Swal.fire({
        icon: "success",
        title: "¡Guardado!",
        text: "La gestión se ha registrado exitosamente.",
        timer: 2000,
        showConfirmButton: false,
      });

      setNuevaObservacion("");
      await cargarHistorial(
        alumnoSeleccionado.id,
        setLoadingHistorial,
        setHistorialSeleccionado
      );
      refetchAusentesData();
    } catch (err) {
      console.error("Error guardando:", err);

      // 3. Mensaje de error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar. Inténtalo de nuevo.",
      });
    }
  }
};

// --- UTILIDADES DE VISTA ---
// Calcula días desde el último contacto usando una fecha en el alumno
export const calcularDiasDesdeUltimoContacto = (alumno) => {
  const totalContactos = Number(alumno?.total_contactos || 0);
  if (!alumno || totalContactos <= 0) return null;

  const fechaReferencia =
    alumno?.fecha_ultimo_contacto ||
    alumno?.ultima_fecha_contacto ||
    alumno?.ultimo_contacto;
  if (!fechaReferencia) return null;

  const fechaUltimoContacto = new Date(fechaReferencia);
  const hoy = new Date();
  const diferenciaMilisegundos = hoy - fechaUltimoContacto;
  const diasTranscurridos = Math.floor(
    diferenciaMilisegundos / (1000 * 60 * 60 * 24)
  );
  return diasTranscurridos;
};

// Aplica filtros y ordenamiento sobre la lista de ausentes
export const obtenerAlumnosFiltrados = (
  ausentesData = [],
  {
    busqueda = "",
    filtroEstado = "TODOS",
    filtroAvanzado = "TODOS",
    ordenamiento = "DEFECTO",
  }
) => {
  const alumnosNormalizados = ausentesData.map((alumno) => {
    const totalContactos = Number(alumno?.total_contactos || 0);
    const rachaActual = Number(alumno?.racha_actual || 0);
    const faltasDesdeUltimoPresente = Number(alumno?.faltas_desde_ultimo_presente || 0);
    const diasUltimoContacto = calcularDiasDesdeUltimoContacto(alumno);
    
    // *** IMPORTANTE: Respetamos el estado_visual que ya viene calculado del backend ***
    // El backend ya implementa la lógica completa del semáforo:
    // - Tolerancia de 2 faltas
    // - ROJO si >= 3 faltas sin contacto o si después de contactar vuelve a faltar 3+ veces
    // - VERDE si está dentro de tolerancia o después de contacto/asistencia
    // - AMARILLO si está esperando respuesta (prioridad sobre ROJO)
    const estadoVisual = alumno.estado_visual || "VERDE";
    
    const colorAlerta = estadoVisual;

    const alertaRojaPorDias = diasUltimoContacto !== null && diasUltimoContacto > 15;

    return {
      ...alumno,
      estado_visual: estadoVisual, 
      color_alerta: colorAlerta, 
      dias_calculados: diasUltimoContacto,
      total_contactos_normalizado: totalContactos,
      racha_actual: rachaActual, // Preservamos racha_actual para el ordenamiento
      faltas_desde_ultimo_presente: faltasDesdeUltimoPresente,
    };
  });

  let alumnosFiltrados = alumnosNormalizados.filter((alumno) => {
    const totalContactos = alumno.total_contactos_normalizado;
    const dias = alumno.dias_calculados;

    // Ocultar alumnos presentes
    const faltas = alumno.faltas_desde_ultimo_presente || 0;
    if (faltas >= 0 && faltas <= 2) {
      return false;
    }

    const texto = (busqueda || "").toLowerCase();
    const coincideTexto =
      alumno?.nombre?.toLowerCase().includes(texto) ||
      alumno?.telefono?.toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === "TODOS" || alumno?.estado_visual === filtroEstado;

    let coincideFiltroAvanzado = true;

    switch (filtroAvanzado) {
      case "SIN_CONTACTO":
        if (filtroEstado === "VERDE") {
          coincideFiltroAvanzado = false;
        } else {
          coincideFiltroAvanzado = totalContactos === 0;
        }
        break;
      case "CON_CONTACTO":
        coincideFiltroAvanzado = totalContactos >= 1;
        break;
      case "CONTACTO_MAS_15_DIAS": {
        coincideFiltroAvanzado = dias !== null && dias > 15;
        break;
      }
      case "CONTACTO_MENOS_15_DIAS": {
        coincideFiltroAvanzado = dias !== null && dias <= 15;
        break;
      }
      case "ESPERANDO_RESPUESTA": {
        coincideFiltroAvanzado = alumno.esperando_respuesta === true;
        break;
      }
      case "TODOS":
      default:
        coincideFiltroAvanzado = true;
        break;
    }

    return coincideTexto && coincideEstado && coincideFiltroAvanzado;
  });

  // Función auxiliar para obtener el estado del alumno
  const obtenerEstadoAlumno = (alumno) => {
    const faltas = alumno.faltas_desde_ultimo_presente || 0;
    if (faltas >= 0 && faltas <= 2) {
      return 'ALUMNO_PRESENTE';
    } else if (faltas > 2) {
      return 'GESTIONADO';
    }
    return 'OTRO';
  };

  // Función auxiliar para obtener prioridad del color
  const obtenerPrioridadColor = (color) => {
    switch (color) {
      case 'ROJO':
        return 3;
      case 'AMARILLO':
        return 2;
      case 'VERDE':
        return 1;
      default:
        return 0;
    }
  };

  if (ordenamiento === "MAS_FALTAS") {
    alumnosFiltrados = [...alumnosFiltrados].sort(
      (a, b) => (b?.faltas_desde_ultimo_presente || 0) - (a?.faltas_desde_ultimo_presente || 0)
    );
  } else if (ordenamiento === "MENOS_FALTAS") {
    alumnosFiltrados = [...alumnosFiltrados].sort(
      (a, b) => (a?.faltas_desde_ultimo_presente || 0) - (b?.faltas_desde_ultimo_presente || 0)
    );
  } else {
    // DEFECTO: Ordenar por prioridad de color, y dentro de VERDE, "Gestionado" antes que "Alumno presente"
    alumnosFiltrados = [...alumnosFiltrados].sort((a, b) => {
      const prioridadA = obtenerPrioridadColor(a.color_alerta);
      const prioridadB = obtenerPrioridadColor(b.color_alerta);

      if (prioridadA !== prioridadB) {
        return prioridadB - prioridadA; // Mayor prioridad primero (ROJO > AMARILLO > VERDE)
      }

      // Si tienen el mismo color, ordenar por estado
      const estadoA = obtenerEstadoAlumno(a);
      const estadoB = obtenerEstadoAlumno(b);

      // "GESTIONADO" (prioridad 1) antes que "ALUMNO_PRESENTE" (prioridad 0)
      const prioridadEstadoA = estadoA === 'GESTIONADO' ? 1 : 0;
      const prioridadEstadoB = estadoB === 'GESTIONADO' ? 1 : 0;

      return prioridadEstadoB - prioridadEstadoA;
    });
  }

  return alumnosFiltrados;
};