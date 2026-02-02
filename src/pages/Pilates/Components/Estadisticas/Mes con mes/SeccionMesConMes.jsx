/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Tabla comparativa mes con mes de métricas.
 */

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, BarChart3, AlertCircle } from "lucide-react";

const formateadorNumero = new Intl.NumberFormat("es-AR", {
  maximumFractionDigits: 0,
});
const formateadorPorcentaje = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const formateadorDecimal = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const esNumeroValido = (valor) =>
  typeof valor === "number" && Number.isFinite(valor);

const formatearPeriodo = (periodo) => {
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

const formatearValor = (valor, formato) => {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "-";
  if (formato === "percent") {
    return `${formateadorPorcentaje.format(valor)}%`;
  }
  if (formato === "decimal") {
    return formateadorDecimal.format(valor);
  }
  return formateadorNumero.format(valor);
};

const calcularDeltaMesAnterior = ({ valorActual, valorAnterior, formato }) => {
  if (!esNumeroValido(valorActual) || !esNumeroValido(valorAnterior))
    return null;

  // Para métricas que ya están en %, mostramos diferencia en puntos porcentuales (pp)
  if (formato === "percent") {
    const deltaPp = valorActual - valorAnterior;
    if (!Number.isFinite(deltaPp) || deltaPp === 0) return null;
    const signo = deltaPp > 0 ? "+" : "";
    return {
      delta: deltaPp,
      texto: `${signo}${formateadorDecimal.format(deltaPp)} pp`,
    };
  }

  // Para números/decimales: % de cambio vs mes anterior
  if (valorAnterior === 0) return null;
  const deltaPct = ((valorActual - valorAnterior) / valorAnterior) * 100;
  if (!Number.isFinite(deltaPct) || deltaPct === 0) return null;
  const signo = deltaPct > 0 ? "+" : "";
  return {
    delta: deltaPct,
    texto: `${signo}${formateadorPorcentaje.format(deltaPct)}%`,
  };
};

const configuracionSecciones = [
  {
    titulo: "📊 RETENCIÓN Y CRECIMIENTO",
    claseColor: "bg-blue-50/80 text-blue-900",
    rows: [
      {
        key: "cantidad_inicio_mes",
        label: "Alumnos inicio mes",
        format: "number",
      },
      { key: "cantidad_fin_mes", label: "Alumnos fin mes", format: "number" },
      { key: "altas_mes", label: "Altas del mes", format: "number" },
      { key: "bajas_mes", label: "Bajas del mes", format: "number" },
      {
        key: "porcentaje_retencion_global",
        label: "% Retención global",
        format: "percent",
      },
      {
        key: "alumnos_dia_uno_que_siguen",
        label: "Alumnos día 1 que siguen",
        format: "number",
      },
    ],
  },
  {
    titulo: "🏢 OCUPACIÓN",
    claseColor: "bg-emerald-50/80 text-emerald-900",
    rows: [
      {
        key: "cupos_habilitados",
        label: "Cupos habilitados",
        format: "number",
      },
      { key: "cantidad_fin_mes", label: "Alumnos inscritos", format: "number" },
      {
        key: "porcentaje_ocupacion_total",
        label: "% Ocupación",
        format: "percent",
      },
      { key: "turnos_libres", label: "Turnos libres", format: "number" },
    ],
  },
  {
    titulo: "👥 ASISTENCIA",
    claseColor: "bg-violet-50/80 text-violet-900",
    rows: [
      {
        key: "asistencias_totales_mes",
        label: "Asistencias totales",
        format: "number",
      },
      {
        key: "asistencias_presentes_mes",
        label: "Presentes",
        format: "number",
      },
      { key: "asistencias_ausentes_mes", label: "Ausentes", format: "number" },
      {
        key: "porcentaje_asistencia_total",
        label: "% Asistencia",
        format: "percent",
      },
      {
        key: "porcentaje_ausentismo_total",
        label: "% Ausentismo",
        format: "percent",
      },
    ],
  },
  {
    titulo: "🎓 INSTRUCTORES (Promedio)",
    claseColor: "bg-orange-50/80 text-orange-900",
    rows: [
      {
        key: "instructores.total_activos",
        label: "Total instructores activos",
        format: "number",
      },
      {
        key: "instructores.promedio_retencion",
        label: "Promedio retención",
        format: "percent",
      },
/*       {
        key: "instructores.promedio_asistencia",
        label: "Promedio asistencia clases",
        format: "percent",
      }, */
      {
        key: "instructores.pruebas_asignadas_total",
        label: "Pruebas asignadas",
        format: "number",
      },
      {
        key: "instructores.pruebas_convertidas_total",
        label: "Pruebas convertidas",
        format: "number",
      },
      {
        key: "instructores.porcentaje_conversion_promedio",
        label: "% Conversión (promedio)",
        format: "percent",
      },
    ],
  },
  {
    titulo: "📋 PLANES (Distribución)",
    claseColor: "bg-rose-50/80 text-rose-900",
    rows: [
      { key: "planes.mensual", label: "Plan Mensual", format: "number" },
      { key: "planes.trimestral", label: "Plan Trimestral", format: "number" },
      { key: "planes.semestral", label: "Plan Semestral", format: "number" },
      { key: "planes.anual", label: "Plan Anual", format: "number" },
      {
        key: "planes.personalizado",
        label: "Plan Personalizado",
        format: "number",
      },
    ],
  },
  {
    titulo: "⏱️ VIDA MEDIA",
    claseColor: "bg-amber-50/80 text-amber-900",
    rows: [
      {
        key: "vida_media_meses",
        label: "Promedio meses LTV",
        format: "decimal",
      },
    ],
  },
];

const obtenerValorAnidado = (obj, ruta) => {
  return ruta.split(".").reduce((actual, clave) => actual?.[clave], obj);
};

// Animaciones de la tabla
const variantesContenedor = {
  oculto: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const variantesItem = {
  oculto: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const SeccionMesConMes = ({ datosMesConMes, cargando }) => {
  const evolucionMensual = useMemo(() => {
    const base = Array.isArray(datosMesConMes?.evolucionMensual)
      ? datosMesConMes.evolucionMensual
      : [];
    return [...base].sort(
      (a, b) => a.anio * 100 + a.mes - (b.anio * 100 + b.mes),
    );
  }, [datosMesConMes?.evolucionMensual]);

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full max-w-full">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </motion.div>
        <p className="mt-4 text-gray-500 font-medium animate-pulse text-center">
          Cargando análisis...
        </p>
      </div>
    );
  }

  if (!evolucionMensual.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px] border border-gray-100 w-full max-w-full">
        <div className="bg-gray-50 p-4 rounded-full mb-4">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          Sin datos disponibles
        </h3>
        <p className="text-sm text-gray-500 mt-2 text-center max-w-xs">
          No hay información histórica para mostrar en este momento.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-full"
    >
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">
              Comparativa Mes con Mes
            </h2>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-0.5">
              Análisis completo de evolución por periodo
            </p>
          </div>
        </div>
      </div>

      {/* Scroll horizontal */}
      <div className="overflow-x-auto custom-scrollbar w-full max-w-full">
        <motion.table
          variants={variantesContenedor}
          initial="oculto"
          animate="visible"
          className="w-full border-separate border-spacing-0 min-w-[600px] sm:min-w-[900px] md:min-w-[1000px] text-xs sm:text-sm"
        >
          <thead>
            <tr>
              <th className="sticky left-0 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-r border-gray-200 px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-40 sm:w-72 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
                Métrica
              </th>
              {evolucionMensual.map((periodo) => (
                <th
                  key={`${periodo.anio}-${periodo.mes}`}
                  className="bg-gray-50/95 border-b border-gray-200 px-2 sm:px-4 py-3 sm:py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider min-w-[90px] sm:min-w-[130px]"
                >
                  {formatearPeriodo(periodo)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {configuracionSecciones.map((seccion) => (
              <React.Fragment key={seccion.titulo}>
                <motion.tr variants={variantesItem}>
                  <td
                    colSpan={evolucionMensual.length + 1}
                    className={`sticky left-0 z-20 px-3 sm:px-6 py-2 sm:py-3 text-xs font-black uppercase tracking-widest border-t border-b border-gray-200 shadow-sm ${seccion.claseColor}`}
                  >
                    {seccion.titulo}
                  </td>
                </motion.tr>
                {seccion.rows.map((fila) => (
                  <motion.tr
                    key={fila.key}
                    variants={variantesItem}
                    className="group hover:bg-gray-50/80 transition-colors duration-200"
                  >
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 transition-colors duration-200 border-b border-r border-gray-100 px-3 sm:px-6 py-2.5 sm:py-3.5 text-xs sm:text-sm font-medium text-gray-700 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                      {fila.label}
                    </td>
                    {evolucionMensual.map((periodo, idxPeriodo) => {
                      const valor = obtenerValorAnidado(periodo, fila.key);
                      const esVariacion = fila.destacar && valor !== 0;

                      const periodoAnterior =
                        idxPeriodo > 0
                          ? evolucionMensual[idxPeriodo - 1]
                          : null;
                      const valorAnterior = periodoAnterior
                        ? obtenerValorAnidado(periodoAnterior, fila.key)
                        : null;

                      const tipoComparacion = fila.comparar ?? "auto";
                      const mostrarDelta =
                        idxPeriodo > 0 && tipoComparacion !== "none";
                      const deltaInfo = mostrarDelta
                        ? calcularDeltaMesAnterior({
                            valorActual: valor,
                            valorAnterior,
                            formato: fila.format,
                          })
                        : null;

                      let claseColorTexto = "text-gray-600";
                      let estiloBadge = "";
                      if (esVariacion) {
                        if (valor > 0) {
                          claseColorTexto = "text-emerald-600 font-bold";
                          estiloBadge =
                            "bg-emerald-50 rounded-md px-1.5 sm:px-2 py-0.5";
                        } else if (valor < 0) {
                          claseColorTexto = "text-rose-600 font-bold";
                          estiloBadge =
                            "bg-rose-50 rounded-md px-1.5 sm:px-2 py-0.5";
                        }
                      }

                      const claseDelta = !deltaInfo
                        ? ""
                        : deltaInfo.delta > 0
                          ? "text-emerald-600 bg-emerald-50"
                          : "text-rose-600 bg-rose-50";

                      return (
                        <td
                          key={`${periodo.anio}-${periodo.mes}-${fila.key}`}
                          className="border-b border-gray-100 px-2 sm:px-4 py-2.5 sm:py-3.5 text-center text-xs sm:text-sm"
                        >
                          <div className="flex flex-col items-center gap-0.5 leading-tight">
                            <span
                              className={`${claseColorTexto} ${estiloBadge}`}
                            >
                              {esVariacion && valor > 0 && "+"}
                              {formatearValor(valor, fila.format)}
                            </span>

                            {deltaInfo && (
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ${claseDelta}`}
                                title={`Comparado contra ${periodoAnterior ? formatearPeriodo(periodoAnterior) : ""}`}
                              >
                                {deltaInfo.texto}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </motion.table>
      </div>
      {/* Ajustes en mobile */}
      <style>{`
        @media (max-width: 640px) {
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #a5b4fc #f3f4f6;
          }
          .custom-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #a5b4fc;
            border-radius: 4px;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default SeccionMesConMes;
