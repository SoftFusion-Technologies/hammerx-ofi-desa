import React from "react";
import useConsultaDB from "../../ConsultaDb/Consulta";
import useInsertar from "../../ConsultaDb/Insertar";
import { useAuth } from "../../../../AuthContext";

// ==============================================================================
// FUNCIÓN 1: Comparación de Datos Básicos
// ==============================================================================
// Esta función recibe el alumno anterior y el nuevo para detectar cambios
// en campos simples (Nombre, Contacto, Observación y Estado).
const obtenerCambiosBasicos = (alumnoAnterior, datosNuevos) => {
  const cambios = [];

  /* console.log(alumnoAnterior,
    datosNuevos
  ) */

  // 1. Verificar si cambió el Nombre
  if (alumnoAnterior.name !== datosNuevos.name) {
    cambios.push({
      campo: "Nombre",
      valor_anterior: alumnoAnterior.name,
      valor_nuevo: datosNuevos.name,
    });
  }

  // 2. Verificar si cambió el Contacto (teléfono/email)
  if (alumnoAnterior.contact !== datosNuevos.contact) {
    cambios.push({
      campo: "Contacto",
      valor_anterior: alumnoAnterior.contact,
      valor_nuevo: datosNuevos.contact,
    });
  }

  // 3. Verificar si cambió la Observación
  if (alumnoAnterior.observation !== datosNuevos.observation) {
    cambios.push({
      campo: "Observación",
      valor_anterior: alumnoAnterior.observation,
      valor_nuevo: datosNuevos.observation,
    });
  }

  // 4. Verificar el Estado (traduce los códigos internos a texto legible)
  if (alumnoAnterior.status !== datosNuevos.status) {
    cambios.push({
      campo: "Estado",
      valor_anterior:
        alumnoAnterior.status === "plan"
          ? "PLAN CONTRATADO"
          : alumnoAnterior.status === "programado"
          ? "RENOVACION PROGRAMADA"
          : alumnoAnterior.status === "prueba"
          ? "CLASE DE PRUEBA"
          : alumnoAnterior.status,
      valor_nuevo:
        datosNuevos.status === "plan"
          ? "PLAN CONTRATADO"
          : datosNuevos.status === "programado"
          ? "RENOVACION PROGRAMADA"
          : datosNuevos.status === "prueba"
          ? "CLASE DE PRUEBA"
          : datosNuevos.status,
    });
  }

  return cambios;
};

// ==============================================================================
// FUNCIÓN 2: Lógica de Planes y Transiciones
// ==============================================================================
// Esta función maneja la parte compleja: compara fechas, tipos de plan y
// genera un resumen automático basado en si cambiaron datos básicos o del plan.
const analizarCambiosDePlan = (
  alumnoAnterior,
  datosNuevos,
  cambiosBasicosPrevios
) => {
  let cambiosPlan = [];
  let resumen = null;
  // Iniciamos tipoEvento como null; se cambiará solo si hay cambios críticos en el plan
  let nuevoTipoEvento = null;

  let planAnterior = {};
  let planActual = {};

  // ---------------------------------------------------------
  // CASO 1: El alumno tenía PLAN y sigue teniendo PLAN
  // ---------------------------------------------------------
  if (alumnoAnterior.status === "plan" && datosNuevos.status === "plan") {
    planAnterior = alumnoAnterior.planDetails || {};
    planActual = datosNuevos.planDetails || {};

    // Verificamos cambios en Tipo, Fecha Inicio y Fecha Fin
    if (planAnterior.type !== planActual.type) {
      cambiosPlan.push({
        campo: "Tipo de Plan",
        valor_anterior: planAnterior.type,
        valor_nuevo: planActual.type,
      });
    }
    if (planAnterior.startDate !== planActual.startDate) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: planAnterior.startDate,
        valor_nuevo: planActual.startDate,
      });
    }
    if (planAnterior.endDate !== planActual.endDate) {
      cambiosPlan.push({
        campo: "Fecha Fin",
        valor_anterior: planAnterior.endDate,
        valor_nuevo: planActual.endDate,
      });
    }

    // Lógica para generar el texto del Resumen y el Tipo de Evento
    const cambios_basicos = cambiosBasicosPrevios.some((cambio) =>
      ["Nombre", "Contacto", "Observación", "Estado"].includes(cambio.campo)
    );

    const cambios_fechas_o_plan = cambiosPlan.some((cambio) =>
      ["Fecha Inicio", "Fecha Fin", "Tipo de Plan"].includes(cambio.campo)
    );

    if (cambios_basicos && cambios_fechas_o_plan) {
      resumen = "Cambios en datos generales y fechas del plan";
      nuevoTipoEvento = "CAMBIO_PLAN";
    } else if (cambios_basicos && !cambios_fechas_o_plan) {
      resumen = "Cambios en datos generales (Nombre, Contacto, etc.)";
    } else if (!cambios_basicos && cambios_fechas_o_plan) {
      resumen = "Modificación de fechas del plan";
      nuevoTipoEvento = "CAMBIO_PLAN";
    } else {
      resumen = "Sin cambios en plan activo";
    }

    // ---------------------------------------------------------
    // CASO 2: De PLAN a PROGRAMADO (Renovación pendiente)
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "plan" &&
    datosNuevos.status === "programado"
  ) {
    planAnterior = alumnoAnterior.planDetails || {};
    planActual = datosNuevos.scheduledDetails || {};
    resumen = "De plan contratado a renovacion programada";

    if (planAnterior.type !== planActual.type) {
      cambiosPlan.push({
        campo: "Tipo de Plan",
        valor_anterior: planAnterior.type,
        valor_nuevo: planActual.type,
      });
    }
    cambiosPlan.push({
      campo: "Fecha prometida de pago",
      valor_anterior: "N/D",
      valor_nuevo: planActual.date,
    });

    // ---------------------------------------------------------
    // CASO 3: De PROGRAMADO a PLAN (Confirmó renovación)
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "programado" &&
    datosNuevos.status === "plan"
  ) {
    planAnterior = alumnoAnterior.planDetails || {};
    planActual = datosNuevos.planDetails || {};
    resumen = "De renovacion programada a plan contratado";

    if (planAnterior.startDate !== planActual.startDate) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: planAnterior.startDate,
        valor_nuevo: planActual.startDate,
      });
    }
    if (planAnterior.endDate !== planActual.endDate) {
      cambiosPlan.push({
        campo: "Fecha Fin",
        valor_anterior: planAnterior.endDate,
        valor_nuevo: planActual.endDate,
      });
    }

    // ---------------------------------------------------------
    // CASO 4: De PRUEBA a PRUEBA (Cambio de fecha de prueba)
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "prueba" &&
    datosNuevos.status === "prueba"
  ) {
    planAnterior = alumnoAnterior.trialDetails || {};
    planActual = datosNuevos.trialDetails || {};

    if (planAnterior.date !== planActual.date) {
      cambiosPlan.push({
        campo: "Fecha de prueba",
        valor_anterior: planAnterior.date,
        valor_nuevo: planActual.date,
      });
    }

    // Lógica de Resumen para pruebas
    const cambios_basicos = cambiosBasicosPrevios.some((cambio) =>
      ["Nombre", "Contacto", "Observación", "Estado"].includes(cambio.campo)
    );
    const cambios_fecha_prueba = cambiosPlan.some(
      (cambio) => cambio.campo === "Fecha de prueba"
    );

    if (cambios_basicos && cambios_fecha_prueba) {
      resumen = "Cambios en datos generales y fecha de prueba";
      nuevoTipoEvento = "CAMBIO_PLAN";
    } else if (cambios_basicos && !cambios_fecha_prueba) {
      resumen = "Cambios en datos generales (Nombre, Contacto, etc.)";
    } else if (!cambios_basicos && cambios_fecha_prueba) {
      resumen = "Modificación de la fecha de prueba";
      nuevoTipoEvento = "CAMBIO_PLAN";
    } else {
      resumen = "Sin cambios en plan de prueba";
    }

    // ---------------------------------------------------------
    // CASO 5: De PRUEBA a PLAN (Se inscribió tras la prueba)
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "prueba" &&
    datosNuevos.status === "plan"
  ) {
    planAnterior = alumnoAnterior.trialDetails || {};
    planActual = datosNuevos.planDetails || {};
    resumen = "De clase de prueba a plan contratado";
    nuevoTipoEvento = "CAMBIO_PLAN";

    if (planAnterior.date !== planActual.startDate) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: planAnterior.date,
        valor_nuevo: planActual.startDate,
      });
    }
    if (planAnterior.endDate !== planActual.endDate) {
      cambiosPlan.push({
        campo: "Fecha Fin",
        valor_anterior: "N/A",
        valor_nuevo: planActual.endDate,
      });
    }

    // ---------------------------------------------------------
    // CASO 6: De PRUEBA a PROGRAMADO
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "prueba" &&
    datosNuevos.status === "programado"
  ) {
    planAnterior = alumnoAnterior.trialDetails || {};
    planActual = datosNuevos.scheduledDetails || {};
    resumen = "De clase de prueba a renovacion programada";
    nuevoTipoEvento = "CAMBIO_PLAN";

    if (planAnterior.date !== planActual.date) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: planAnterior.date,
        valor_nuevo: planActual.date,
      });
    }

    // ---------------------------------------------------------
    // CASO 7: De PROGRAMADO a PRUEBA
    // ---------------------------------------------------------
  } else if (
    alumnoAnterior.status === "programado" &&
    datosNuevos.status === "prueba"
  ) {
    planAnterior = alumnoAnterior.scheduledDetails || {};
    planActual = datosNuevos.trialDetails || {};
    resumen = "De clase renovación programada a prueba";
    nuevoTipoEvento = "CAMBIO_PLAN";

    if (planAnterior.date !== planActual.date) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: planAnterior.date,
        valor_nuevo: planActual.date,
      });
    }
  } else if (
    alumnoAnterior.status === "programado" &&
    datosNuevos.status === "programado"
  ) {
    planAnterior = alumnoAnterior.scheduledDetails  || {};
    planActual = datosNuevos.scheduledDetails || {};
    resumen = "Modificación en renovación programada";

    //fechaATomar: Esto se hace porque puede venir como promisedDate o date dependiendo si ya era un cliente con renovación programada que fue antes un cliente contratado, o si es un cliente nuevo que nunca tuvo plan contratado.
    let fechaATomar = planAnterior.promisedDate ? planAnterior.promisedDate : planAnterior.date;
    if (fechaATomar !== planActual.date) {
      cambiosPlan.push({
        campo: "Fecha Inicio",
        valor_anterior: fechaATomar,
        valor_nuevo: planActual.date,
      });
      nuevoTipoEvento = "CAMBIO_PLAN";
    }
  }

  return { cambiosPlan, resumen, nuevoTipoEvento };
};

// ==============================================================================
// FUNCIÓN AUXILIAR: Búsqueda de Alumno
// ==============================================================================
// Recorre los turnos (que vienen agrupados) para encontrar al alumno por su ID.
const encontrarAlumnoEnDatosAnteriores = (datos, idBuscado) => {
  // Obtenemos solo los valores del objeto (ignoramos las claves "LUNES-07:00", etc.)
  const listaDeTurnos = Object.values(datos);

  // Recorremos cada turno (horario)
  for (const turno of listaDeTurnos) {
    // Buscamos dentro del array de alumnos de ese turno
    const alumnoEncontrado = turno.alumnos.find(
      (alumno) => alumno.id === idBuscado
    );

    // Si existe, lo devolvemos y cortamos la búsqueda
    if (alumnoEncontrado) {
      return alumnoEncontrado;
    }
  }

  return null; // Retorna null si no encontró a nadie
};

// ==============================================================================
// HOOK PRINCIPAL: useHistorialAlumnos
// ==============================================================================
const useHistorialAlumnos = () => {
  const { userId } = useAuth();
  const [idAlumno, setIdAlumno] = React.useState(null);

  // Insertar historial general
  const { insert: insertarHistorialAlumno } = useInsertar(
    `/clientes-pilates/historial`,
    true
  );

  // Consultar historial existente
  const {
    data: alumnosHistorialDB,
    loading: loadingAlumnosHistorial,
    error: errorAlumnosHistorial,
    refetch: refetchAlumnosHistorial,
  } = useConsultaDB(
    idAlumno ? `/clientes-pilates/${idAlumno}/historial` : null
  );

  // Insertar historial específico de observaciones (para instructores)
  const { insert: insertarHistorialAlumnoObservaciones } = useInsertar(
    "/clientes-pilates/historial",
    true
  );

  const obtenerDatosHistorialAlumnos = (idAlumno) => {
    try {
      if (!idAlumno) return;
      setIdAlumno(idAlumno);
    } catch (error) {
      console.error("Error al obtener datos de alumnos:", error);
    }
  };

  // --------------------------------------------------------------------------
  // ALTA DE HISTORIAL: Para alumnos nuevos
  // --------------------------------------------------------------------------
  // Genera el primer registro cuando se crea un alumno.
  const altaHistorialAlumno = (alumno) => {
    try {
      // Datos generales del historial
      // Corrección aplicada: datosGenerales (plural)
      const datosGenerales = {
        tipo_evento: "ALTA",
        usuario_id: Number(userId),
        resumen: `Se dió de alta el alumno por primera vez`,
      };

      const tipoPlan = alumno.status;
      // Datos específicos del historial según el tipo de plan inicial
      const cambiosEspecificos = [
        {
          campo:
            tipoPlan === "plan"
              ? "Plan Contratado"
              : tipoPlan === "prueba"
              ? "Clase de prueba"
              : "Renovacion programada",
          valor_anterior: null,
        },
      ];

      // Combinamos los datos
      const datosHistorial = {
        ...datosGenerales,
        cambios_especificos: cambiosEspecificos,
      };

      return datosHistorial;
    } catch (error) {
      console.error("Error al crear historial:", error);
    }
  };

  // --------------------------------------------------------------------------
  // CREAR HISTORIAL: Función Maestra para modificaciones
  // --------------------------------------------------------------------------
  // Detecta si es un cambio de turno o una edición de datos/plan y guarda el registro.
  const crearHistorialAlumno = async (
    datosAnteriores,
    datosNuevos,
    tipo_evento = "MODIFICACION"
  ) => {
    try {
      const idParaBuscar = datosNuevos.id;
      let day = "";
      if (datosAnteriores.day === "LUNES") {
        day = "L-M-V";
      } else {
        day = "M-J";
      }

      // RAMA 1: Es un Cambio de Turno
      if (tipo_evento === "CAMBIO_TURNO") {
        const datosGenerales = {
          cliente_id: Number(datosNuevos.id),
          tipo_evento: tipo_evento,
          usuario_id: Number(userId),
          resumen: `Se realizó un cambio de turno`,
          cambios_especificos: [
            {
              campo: "Cambio de turno",
              valor_anterior: `GRUPO: ${day} y HORA: ${datosAnteriores.hour}`,
              valor_nuevo: `GRUPO: ${datosNuevos.day} y HORA: ${datosNuevos.hour}`,
            },
          ],
        };
        const resultado = await insertarHistorialAlumno(datosGenerales);
      
      // RAMA 2: Es una Modificación de Datos o Plan
      } else {
        // Buscamos al alumno tal como estaba antes en la DB
        const alumnoAnterior = encontrarAlumnoEnDatosAnteriores(
          datosAnteriores,
          idParaBuscar
        );

        // Si no encontramos al alumno anterior, cortamos para evitar errores
        if (!alumnoAnterior) {
          // Corrección aplicada: Mensaje de consola consistente
          console.error("No se encontró el alumno anterior para comparar.");
          return;
        }

        // 1. Obtener cambios básicos (Strings simples)
        const cambiosBasicos = obtenerCambiosBasicos(alumnoAnterior, datosNuevos);

        // 2. Analizar lógica de planes (Fechas, tipos, transiciones)
        const { cambiosPlan, resumen, nuevoTipoEvento } = analizarCambiosDePlan(
          alumnoAnterior,
          datosNuevos,
          cambiosBasicos
        );

        // Unificamos todos los cambios encontrados
        const todosLosCambios = [...cambiosBasicos, ...cambiosPlan];

        // Determinar el tipo de evento final (si hubo cambio de plan importante, se prioriza)
        const tipoEventoFinal = nuevoTipoEvento || tipo_evento;

        const datosGenerales = {
          cliente_id: Number(datosNuevos.id),
          tipo_evento: tipoEventoFinal,
          usuario_id: Number(userId),
          resumen: resumen || "N/A",
          cambios_especificos: todosLosCambios,
        };

        // Guardamos en la base de datos
        const resultado = await insertarHistorialAlumno(datosGenerales);
      }
    } catch (error) {
      console.error("Error al crear historial del alumno:", error);
    }
  };

  // --------------------------------------------------------------------------
  // HISTORIAL INSTRUCTOR: Modificación rápida de observaciones
  // --------------------------------------------------------------------------
  const crearHistorialDesdeInstructor = async (
    observacionAnterior,
    observacionNueva,
    idAlumno,
    nombreInstructor
  ) => {
    try {
      const datosGenerales = {
        cliente_id: Number(idAlumno),
        tipo_evento: "MODIFICACION",
        es_instructor: 1,
        usuario_id: null,
        resumen: `MODIFICACIÓN EN LAS OBSERVACIONES POR EL INSTRUCTOR ${nombreInstructor}`,
        cambios_especificos: [
          {
            campo: "Observaciones",
            valor_anterior: observacionAnterior,
            valor_nuevo: observacionNueva,
          },
        ],
      };
      await insertarHistorialAlumnoObservaciones(datosGenerales);
    } catch (error) {
      console.error("Error al crear historial desde instructor:", error);
    }
  };

  return {
    alumnosHistorialDB: alumnosHistorialDB || [],
    loadingAlumnosHistorial,
    errorAlumnosHistorial,
    refetchAlumnosHistorial,
    altaHistorialAlumno,
    crearHistorialAlumno,
    obtenerDatosHistorialAlumnos,
    crearHistorialDesdeInstructor,
  };
};

export default useHistorialAlumnos;