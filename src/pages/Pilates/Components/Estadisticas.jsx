/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Renderiza la vista de estadísticas de Pilates y coordina sus secciones.
 */

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Target, Award, Users } from "lucide-react";
import axios from "axios";

// Componentes
import SeccionResumen from "./Estadisticas/Detalle de la sede/SeccionResumen";
import SeccionMetricas from "./Estadisticas/Detalle de la sede/SeccionMetricas";
import SeccionInstructores from "./Estadisticas/Detalle de la sede/SeccionInstructores";
import SeccionPlanes from "./Estadisticas/Detalle de la sede/SeccionPlanes";
import SeccionMesConMes from "./Estadisticas/Mes con mes/SeccionMesConMes";

const obtenerAnioMesActual = () => {
  const ahora = new Date();
  const ahoraArg = new Date(
    ahora.toLocaleString("en-US", {
      timeZone: "America/Argentina/Buenos_Aires",
    }),
  );
  return {
    anio: ahoraArg.getFullYear(),
    mes: ahoraArg.getMonth() + 1,
  };
};

const Estadisticas = ({ sedeActual, sedes }) => {
  // Sección activa (pestañas)
  const [seccionActiva, setSeccionActiva] = useState("resumen");
  const [vistaActiva, setVistaActiva] = useState("detalle");

  // Paneles visibles del mostrador
  const [panelesVisibles, setPanelesVisibles] = useState({
    turnosLibres: true,
    planesVencidos: true,
    listaEspera: true,
    ausentes: false,
    bajas: false,
    altas: false,
  });

  // Detalle de bajas
  const [mostrarDetalleBajas, setMostrarDetalleBajas] = useState(false);
  // Periodo seleccionado (histórico)
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  // Datos del backend
  const [datosEstadisticas, setDatosEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [actualizacionManual, setActualizacionManual] = useState(false);
  const [cargandoActualizacion, setCargandoActualizacion] = useState(false);
  const [errorActualizacion, setErrorActualizacion] = useState(null);

  const [datosMesConMes, setDatosMesConMes] = useState({
    evolucionMensual: [],
  });
  const [cargandoMesConMes, setCargandoMesConMes] = useState(false);

  const normalizarNumero = (valor) => {
    if (valor === null || valor === undefined || valor === "") return 0;
    const numero = Number(valor);
    return Number.isNaN(numero) ? 0 : numero;
  };

  const adaptarRespuesta = (data) => {
    if (!data) return null;

    const evolucionMensual = (data.evolucionMensual || []).map((item) => ({
      ...item,
      cantidad_inicio_mes: normalizarNumero(item.cantidad_inicio_mes),
      cantidad_fin_mes: normalizarNumero(item.cantidad_fin_mes),
      variacion_porcentual: normalizarNumero(item.variacion_porcentual),
      alumnos_dia_uno_que_siguen: normalizarNumero(
        item.alumnos_dia_uno_que_siguen,
      ),
      porcentaje_retencion_global: normalizarNumero(
        item.porcentaje_retencion_global,
      ),
      porcentaje_ocupacion_total: normalizarNumero(
        item.porcentaje_ocupacion_total,
      ),
      asistencias_totales_mes: normalizarNumero(item.asistencias_totales_mes),
      asistencias_presentes_mes: normalizarNumero(
        item.asistencias_presentes_mes,
      ),
      asistencias_ausentes_mes: normalizarNumero(item.asistencias_ausentes_mes),
      porcentaje_asistencia_total: normalizarNumero(
        item.porcentaje_asistencia_total,
      ),
      porcentaje_ausentismo_total: normalizarNumero(
        item.porcentaje_ausentismo_total,
      ),
    }));

    const retencion = data.retencion
      ? {
          ...data.retencion,
          clientesIniciales: normalizarNumero(data.retencion.clientesIniciales),
          bajasMes: normalizarNumero(data.retencion.bajasMes),
          porcentajeRetencion: normalizarNumero(
            data.retencion.porcentajeRetencion,
          ),
        }
      : { clientesIniciales: 0, bajasMes: 0, porcentajeRetencion: 0 };

    const ocupacion = data.ocupacion
      ? {
          ...data.ocupacion,
          alumnosInscritos: normalizarNumero(data.ocupacion.alumnosInscritos),
          turnosHabilitados: normalizarNumero(data.ocupacion.turnosHabilitados),
          porcentajeOcupacion: normalizarNumero(
            data.ocupacion.porcentajeOcupacion,
          ),
        }
      : { alumnosInscritos: 0, turnosHabilitados: 0, porcentajeOcupacion: 0 };

    const retencionPorInstructor = (data.retencionPorInstructor || []).map(
      (item) => ({
        ...item,
        porcentaje_retencion_profe: normalizarNumero(
          item.porcentaje_retencion_profe,
        ),
        porcentaje_asistencia_clases: normalizarNumero(
          item.porcentaje_asistencia_clases,
        ),
        alumnos_iniciales: normalizarNumero(item.alumnos_iniciales),
        alumnos_actuales: normalizarNumero(item.alumnos_actuales),
        alumnos_perdidos: normalizarNumero(item.alumnos_perdidos),
        alumnos_nuevos: normalizarNumero(item.alumnos_nuevos),
        asistencias_totales: normalizarNumero(item.asistencias_totales),
        asistencias_presentes: normalizarNumero(item.asistencias_presentes),
        asistencias_ausentes: normalizarNumero(item.asistencias_ausentes),
      }),
    );

    const conversionPrueba = (data.conversionPrueba || []).map((item) => ({
      ...item,
      pruebas_asignadas: normalizarNumero(item.pruebas_asignadas),
      pruebas_convertidas: normalizarNumero(item.pruebas_convertidas),
      porcentaje_conversion: normalizarNumero(item.porcentaje_conversion),
    }));

    const alumnosPorPlan = (data.alumnosPorPlan || []).map((registro) => ({
      ...registro,
      planes: (registro.planes || []).map((plan) => ({
        ...plan,
        cantidad_inicial: normalizarNumero(plan.cantidad_inicial),
        cantidad_final: normalizarNumero(plan.cantidad_final),
        variacion_porcentual: normalizarNumero(plan.variacion_porcentual),
      })),
    }));

    const mostrador = data.mostrador
      ? {
          ...data.mostrador,
          turnos_libres: normalizarNumero(data.mostrador.turnos_libres),
          planes_vencidos: normalizarNumero(data.mostrador.planes_vencidos),
          lista_espera: normalizarNumero(data.mostrador.lista_espera),
          ausentes: normalizarNumero(data.mostrador.ausentes),
          altas_dia: normalizarNumero(data.mostrador.altas_dia),
          bajas_dia: normalizarNumero(data.mostrador.bajas_dia),
          ausentes_mes_hasta_fecha: normalizarNumero(
            data.mostrador.ausentes_mes_hasta_fecha,
          ),
          ausentes_posibles_mes_hasta_fecha: normalizarNumero(
            data.mostrador.ausentes_posibles_mes_hasta_fecha,
          ),
          porcentaje_ausentismo_mes: normalizarNumero(
            data.mostrador.porcentaje_ausentismo_mes,
          ),
          porcentaje_asistencia_mes: normalizarNumero(
            data.mostrador.porcentaje_asistencia_mes,
          ),
          cupos_teoricos: normalizarNumero(data.mostrador.cupos_teoricos),
          cupos_habilitados: normalizarNumero(data.mostrador.cupos_habilitados),
          cupos_deshabilitados: normalizarNumero(
            data.mostrador.cupos_deshabilitados,
          ),
        }
      : {
          turnos_libres: 0,
          planes_vencidos: 0,
          lista_espera: 0,
          ausentes: 0,
          altas_dia: 0,
          bajas_dia: 0,
          ausentes_mes_hasta_fecha: 0,
          ausentes_posibles_mes_hasta_fecha: 0,
          porcentaje_ausentismo_mes: 0,
          porcentaje_asistencia_mes: 0,
          cupos_teoricos: 0,
          cupos_habilitados: 0,
          cupos_deshabilitados: 0,
          mostrar_superior: true,
          mostrar_inferior: false,
          fechaActualizacion: "-",
        };

    return {
      ...data,
      evolucionMensual,
      retencion,
      ocupacion,
      retencionPorInstructor,
      conversionPrueba,
      alumnosPorPlan,
      mostrador,
      vidaMedia: data.vidaMedia || {
        promedioMeses: 0,
        totalSociosEstudiados: 0,
      },
      asistenciaPromedio: normalizarNumero(data.asistenciaPromedio),
      altasMes: normalizarNumero(data.altasMes),
      bajasMes: normalizarNumero(data.bajasMes),
      detalleBajas: data.detalleBajas || [],
    };
  };

  const obtenerDatos = async () => {
    setCargando(true);
    try {
      const { anio, mes } = obtenerAnioMesActual();
      const { data } = await axios.get(
        "http://localhost:8080/pilates/estadisticas/completo",
        {
          params: { id_sede: sedeActual, anio, mes },
        },
      );
      const adaptado = adaptarRespuesta(data);
      setDatosEstadisticas(adaptado);
      if (adaptado?.evolucionMensual?.length) {
        const ultimo = [...adaptado.evolucionMensual].sort(
          (a, b) => b.anio * 100 + b.mes - (a.anio * 100 + a.mes),
        )[0];
        setPeriodoSeleccionado({ anio: ultimo.anio, mes: ultimo.mes });
      }
    } catch (error) {
      console.error("Error al obtener estadísticas de Pilates", error);
    } finally {
      setCargando(false);
    }
  };

  const obtenerDatosMesConMes = async () => {
    setCargandoActualizacion(true);
    try {
      const { data } = await axios.get(
        "http://localhost:8080/pilates/estadisticas/completo/mes-con-mes",
        {
          params: { id_sede: sedeActual },
        },
      );

      setDatosMesConMes(data);
    } catch (error) {
      console.error("Error al obtener estadísticas mes con mes", error);
      return { evolucionMensual: [] };
    } finally {
      setCargandoActualizacion(false);
    }
  };
  useEffect(() => {
    obtenerDatos();
    obtenerDatosMesConMes();
  }, [sedeActual]);

  useEffect(() => {
    const actualizarManulamente = async () => {
      if (actualizacionManual) {
        setCargandoActualizacion(true);
        setErrorActualizacion(null);
        try {
          const { anio, mes } = obtenerAnioMesActual();
          const sedesFiltradas = sedes.filter(
            (sede) => sede.nombre.toLowerCase() !== "multisede",
          );
          await Promise.all(
            sedesFiltradas.map((sede) =>
              axios.post(
                "http://localhost:8080/pilates/estadisticas/sincronizar",
                {
                  id_sede: sede.id,
                  anio,
                  mes,
                },
              ),
            ),
          );
          await obtenerDatos();
          await obtenerDatosMesConMes();
          setActualizacionManual(false);
        } catch (error) {
          console.error("Error al actualizar estadísticas de Pilates", error);
          setErrorActualizacion(
            "Error al actualizar estadísticas. Intente nuevamente.",
          );
        } finally {
          setCargandoActualizacion(false);
        }
      }
    };
    actualizarManulamente();
  }, [actualizacionManual]);

  useEffect(() => {
    if (errorActualizacion) {
      const timer = setTimeout(() => {
        setErrorActualizacion(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorActualizacion]);

  const datos = datosEstadisticas || {
    evolucionMensual: [],
    vidaMedia: { promedioMeses: 0, totalSociosEstudiados: 0 },
    retencion: { clientesIniciales: 0, bajasMes: 0, porcentajeRetencion: 0 },
    ocupacion: {
      alumnosInscritos: 0,
      turnosHabilitados: 0,
      porcentajeOcupacion: 0,
    },
    asistenciaPromedio: 0,
    retencionPorInstructor: [],
    conversionPrueba: [],
    alumnosPorPlan: [],
    mostrador: {
      turnos_libres: 0,
      planes_vencidos: 0,
      lista_espera: 0,
      ausentes: 0,
      altas_dia: 0,
      bajas_dia: 0,
      mostrar_superior: true,
      mostrar_inferior: false,
      fechaActualizacion: "-",
    },
    altasMes: 0,
    bajasMes: 0,
    detalleBajas: [],
  };

  // Alterna paneles del mostrador
  const alternarPanel = (panel) => {
    setPanelesVisibles((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  // Periodos ordenados (más reciente primero)
  const periodosDisponibles = useMemo(() => {
    if (!datos.evolucionMensual.length) return [];
    return [...datos.evolucionMensual].sort((a, b) => {
      const aKey = a.anio * 100 + a.mes;
      const bKey = b.anio * 100 + b.mes;
      return bKey - aKey;
    });
  }, [datos.evolucionMensual]);

  // Periodo activo
  const periodoActivo = periodoSeleccionado || periodosDisponibles[0] || null;

  // Filtro por periodo
  const coincidePeriodo = (item) =>
    item.anio === periodoActivo?.anio && item.mes === periodoActivo?.mes;

  // Datos del mes para retención/ocupación
  const resumenMensual = periodosDisponibles.length
    ? datos.evolucionMensual.find(coincidePeriodo) || periodosDisponibles[0]
    : null;

  // Retención: usamos los valores del backend
  // Tomar alumnos_dia_uno_que_siguen del periodo activo
  let cantidadSiguenDiaUno = null;
  if (
    periodoActivo &&
    datos.evolucionMensual &&
    Array.isArray(datos.evolucionMensual)
  ) {
    const periodo = datos.evolucionMensual.find(
      (item) =>
        item.anio === periodoActivo.anio && item.mes === periodoActivo.mes,
    );
    if (periodo && typeof periodo.alumnos_dia_uno_que_siguen !== "undefined") {
      cantidadSiguenDiaUno = periodo.alumnos_dia_uno_que_siguen;
    }
  }

  // Inyectar en retencionMes
  const retencionMes = { ...datos.retencion, cantidadSiguenDiaUno };

  const ocupacionMes = resumenMensual
    ? {
        alumnosInscritos: datos.ocupacion.alumnosInscritos,
        turnosHabilitados: datos.ocupacion.turnosHabilitados,
        porcentajeOcupacion: datos.ocupacion.porcentajeOcupacion,
      }
    : datos.ocupacion;

  // Filtrado por periodo
  const retencionPorInstructorMes =
    datos.retencionPorInstructor.filter(coincidePeriodo);
  // conversionPrueba no viene con anio/mes desde backend, se muestra completa
  const conversionPruebaMes = datos.conversionPrueba;
  const alumnosPorPlanMes = datos.alumnosPorPlan.filter(coincidePeriodo);
  const detalleBajasMes = datos.detalleBajas.filter((baja) => {
    if (!baja.fecha_baja) return true;
    const fecha = new Date(baja.fecha_baja);
    return (
      fecha.getFullYear() === periodoActivo?.anio &&
      fecha.getMonth() + 1 === periodoActivo?.mes
    );
  });

  // Objeto final pasado a hijos (ya filtrado por periodo)
  const datosFiltrados = {
    ...datos,
    evolucionMensual: periodosDisponibles, // mantenemos histórico ordenado
    retencion: retencionMes,
    ocupacion: ocupacionMes,
    retencionPorInstructor: retencionPorInstructorMes,
    conversionPrueba: conversionPruebaMes,
    alumnosPorPlan: alumnosPorPlanMes,
    detalleBajas: detalleBajasMes,
  };

  const formatPeriodo = (periodo) => {
    if (!periodo) return "";
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return `${meses[periodo.mes - 1]} ${periodo.anio}`;
  };

  // Configuración de las secciones (pestañas)
  const secciones = [
    {
      id: "resumen",
      nombre: "Resumen General",
      icono: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "metricas",
      nombre: "Métricas Clave",
      icono: <Target className="w-5 h-5" />,
    },
    {
      id: "instructores",
      nombre: "Instructores",
      icono: <Award className="w-5 h-5" />,
    },
    { id: "planes", nombre: "Planes", icono: <Users className="w-5 h-5" /> },
  ];

  const valorPeriodoSelect = periodoActivo
    ? `${periodoActivo.anio}-${periodoActivo.mes}`
    : "";

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="mx-auto space-y-6 pb-8 w-full px-2 sm:px-4">
        {/* ============================================ */}
        {/* HEADER CON SELECTOR DE SECCIONES */}
        {/* ============================================ */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-2 sm:p-4 md:p-6 mb-6 w-full"
        >
          <div className="flex flex-col gap-4 w-full">
            <div className="text-center sm:text-left w-full">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 break-words">
                📊 Estadísticas de Pilates
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-x-3 w-full">
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Datos actualizados al {datos.mostrador.fechaActualizacion}
                </p>
                <button
                  className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-xs sm:text-sm"
                  onClick={() => setActualizacionManual(true)}
                >
                  {errorActualizacion
                    ? "Se produjo un error al actualizar"
                    : cargandoActualizacion
                      ? "Actualizando..."
                      : "Actualizar Datos"}
                </button>
                <div className="flex items-center gap-1 sm:gap-2 rounded-lg bg-slate-100 p-1 w-full sm:w-auto">
                  <button
                    className={`px-2 sm:px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      vistaActiva === "detalle"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setVistaActiva("detalle")}
                  >
                    Detalle sede
                  </button>
                  <button
                    className={`px-2 sm:px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                      vistaActiva === "mesConMes"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                    onClick={() => setVistaActiva("mesConMes")}
                  >
                    Mes con mes
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de periodo (mes/año) */}
            {vistaActiva === "detalle" && (
              <div className="flex flex-wrap items-center gap-2 w-full">
                <span className="text-sm text-gray-600 font-semibold">
                  Periodo:
                </span>
                <select
                  value={valorPeriodoSelect}
                  onChange={(e) => {
                    const [anio, mes] = e.target.value.split("-").map(Number);
                    setPeriodoSeleccionado({ anio, mes });
                  }}
                  className="border rounded-lg px-2 sm:px-3 py-2 text-xs sm:text-sm text-gray-700 shadow-sm bg-white"
                >
                  {periodosDisponibles.length === 0 && (
                    <option value="">Sin datos</option>
                  )}
                  {periodosDisponibles.map((p) => (
                    <option
                      key={`${p.anio}-${p.mes}`}
                      value={`${p.anio}-${p.mes}`}
                    >
                      {formatPeriodo(p)}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">
                  Mostrando datos filtrados por mes
                </span>
                {cargando && (
                  <span className="text-xs text-orange-600 font-semibold">
                    Cargando...
                  </span>
                )}
              </div>
            )}

            {/* SELECTOR DE SECCIONES (PESTAÑAS) */}
            {vistaActiva === "detalle" && (
              <div className="flex flex-wrap gap-1 sm:gap-2 bg-slate-100 p-1.5 rounded-xl w-full">
                {secciones.map((seccion) => (
                  <button
                    key={seccion.id}
                    onClick={() => setSeccionActiva(seccion.id)}
                    className={`
                      flex-1 min-w-[90px] sm:min-w-[120px] md:min-w-[140px] flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all duration-200
                      ${
                        seccionActiva === seccion.id
                          ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                      }
                    `}
                  >
                    {seccion.icono}
                    <span className="hidden sm:inline">{seccion.nombre}</span>
                    <span className="sm:hidden">
                      {seccion.nombre.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* ============================================ */}
        {/* CONTENIDO DINÁMICO SEGÚN SECCIÓN ACTIVA */}
        {/* ============================================ */}
        <AnimatePresence mode="wait">
          {vistaActiva === "detalle" && seccionActiva === "resumen" && (
            <SeccionResumen
              datosEstadisticas={datosFiltrados}
              panelesVisibles={panelesVisibles}
              alternarPanel={alternarPanel}
              mostrarDetalleBajas={mostrarDetalleBajas}
              setMostrarDetalleBajas={setMostrarDetalleBajas}
            />
          )}

          {vistaActiva === "detalle" && seccionActiva === "metricas" && (
            <SeccionMetricas datosEstadisticas={datosFiltrados} />
          )}

          {vistaActiva === "detalle" && seccionActiva === "instructores" && (
            <SeccionInstructores datosEstadisticas={datosFiltrados} />
          )}

          {vistaActiva === "detalle" && seccionActiva === "planes" && (
            <SeccionPlanes datosEstadisticas={datosFiltrados} />
          )}

          {vistaActiva === "mesConMes" && (
            <div className="w-full overflow-x-auto">
              <SeccionMesConMes
                datosMesConMes={datosMesConMes}
                cargando={cargandoMesConMes}
              />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Estadisticas;
