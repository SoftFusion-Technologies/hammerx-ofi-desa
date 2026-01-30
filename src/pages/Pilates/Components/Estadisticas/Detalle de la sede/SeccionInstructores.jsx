/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Sección de estadísticas de instructores.
 */

import { motion } from 'framer-motion';
import { Award, Target } from 'lucide-react';
import AyudaInfo from './AyudaInfo';
const SeccionInstructores = ({ datosEstadisticas }) => {
  return (
    <motion.div
      key="instructores"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* RETENCIÓN POR INSTRUCTOR */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-3 sm:p-4"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Retención por Instructor
          <AyudaInfo texto={<>Muestra, por profe, alumnos/retención y asistencia del período.</>} />
        </h2>

        <div className="mb-2 text-xs text-gray-500 flex items-center gap-2">
          <span>¿Qué significan los campos?</span>
          <AyudaInfo
            align="left"
            texto={
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-blue-700 bg-blue-100 rounded px-1">
                    Iniciales
                  </span>
                  : alumnos al inicio del mes.
                </div>
                <div>
                  <span className="font-semibold text-red-700 bg-red-100 rounded px-1">
                    Perdidos
                  </span>
                  : alumnos que iniciaron el mes pero se dieron de baja.
                </div>
                <div>
                  <span className="font-semibold text-green-700 bg-green-100 rounded px-1">
                    Agregados
                  </span>
                  : alumnos nuevos que se sumaron durante el mes.
                </div>
                <div>
                  <span className="font-semibold text-yellow-700 bg-yellow-100 rounded px-1">
                    % Retención
                  </span>
                  : variación del padrón del profe en el mes.
                </div>
                <div className="border-t border-slate-200 pt-2">
                  <span className="font-semibold text-emerald-700 bg-emerald-100 rounded px-1">
                    Asistencias (T/P/A)
                  </span>
                  : totales/presentes/ausentes de sus clases.
                </div>
                <div>
                  <span className="font-semibold text-emerald-700 bg-emerald-100 rounded px-1">
                    % Asistencia
                  </span>
                  : presentes ÷ totales (según backend).
                </div>
              </div>
            }
          />
        </div>

        <div className="space-y-2">
          {datosEstadisticas.retencionPorInstructor.length === 0 ? (
            <div className="text-center py-6 text-gray-400 font-semibold">
              No hay datos disponibles por el momento
            </div>
          ) : (
            datosEstadisticas.retencionPorInstructor.map((instructor, idx) => (
              <motion.div
                key={instructor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-xl border border-orange-600 bg-orange-50/30 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-bold text-gray-800 text-sm">
                    {instructor.nombre}
                  </span>
                  <span className="text-xs text-gray-700 font-bold">
                    Actuales: {instructor.alumnos_actuales}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-md px-2 py-1 text-center">
                    <span className="font-semibold text-blue-700 bg-blue-100 rounded px-1">Iniciales:</span> <span className="font-bold text-blue-900">{instructor.alumnos_iniciales}</span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-2 py-1 text-center">
                    <span className="font-semibold text-red-700 bg-red-100 rounded px-1">Perdidos:</span> <span className="font-bold text-red-900">{instructor.alumnos_perdidos}</span>
                  </div>
                  <div className="bg-gray-50 rounded-md px-2 py-1 text-center">
                    <span className="font-semibold text-green-700 bg-green-100 rounded px-1">Agregados:</span>{" "}
                    <span className="font-bold text-green-900">
                      {instructor.alumnos_nuevos}
                    </span>
                  </div>
                </div>

                {/* RETENCIÓN + ASISTENCIA (compacto) */}
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Retención
                      </span>
                      <span className="text-xs font-black text-slate-700">
                        {Math.max(
                          0,
                          Math.min(100, Number(instructor.porcentaje_retencion_profe || 0)),
                        ).toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(
                            0,
                            Math.min(100, Number(instructor.porcentaje_retencion_profe || 0)),
                          )}%`,
                        }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full ${
                          Number(instructor.porcentaje_retencion_profe || 0) >= 90
                            ? 'bg-gradient-to-r from-green-500 to-green-600'
                            : Number(instructor.porcentaje_retencion_profe || 0) >= 80
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                        Asistencia
                      </span>
                      <span className="text-xs font-black text-slate-700">
                        {Math.max(
                          0,
                          Math.min(100, Number(instructor.porcentaje_asistencia_clases || 0)),
                        ).toFixed(2)}%
                      </span>
                    </div>

                    <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(
                            0,
                            Math.min(100, Number(instructor.porcentaje_asistencia_clases || 0)),
                          )}%`,
                        }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                      />
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-md bg-white px-2 py-1 text-center border border-slate-100">
                        <div className="font-semibold text-slate-500">Totales</div>
                        <div className="font-black text-slate-800">
                          {Number(instructor.asistencias_totales || 0)}
                        </div>
                      </div>
                      <div className="rounded-md bg-white px-2 py-1 text-center border border-slate-100">
                        <div className="font-semibold text-emerald-700">Presentes</div>
                        <div className="font-black text-emerald-800">
                          {Number(instructor.asistencias_presentes || 0)}
                        </div>
                      </div>
                      <div className="rounded-md bg-white px-2 py-1 text-center border border-slate-100">
                        <div className="font-semibold text-rose-700">Ausentes</div>
                        <div className="font-black text-rose-800">
                          {Number(instructor.asistencias_ausentes || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* CONVERSIÓN DE CLASES DE PRUEBA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-3 sm:p-4"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Target className="w-6 h-6 text-pink-500" />
          Conversión de Clases de Prueba
          <AyudaInfo texto="Se calcula cuántas clases se convirtieron en clientes de prueba plan a contratado y su porcentaje de éxito." />
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-700">Instructor</th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-center">
                  Conversiones
                </th>
                <th className="px-3 py-2 font-semibold text-gray-700 text-center">
                  % Éxito
                </th>
              </tr>
            </thead>
            <tbody>
              {datosEstadisticas.conversionPrueba.length === 0 ||
              datosEstadisticas.conversionPrueba.every(
                (i) => (!i.pruebas_asignadas || i.pruebas_asignadas === 0)
              ) ? (
                <tr>
                  <td colSpan={3} className="text-center py-5 text-gray-400 font-semibold">
                    No hay datos disponibles por el momento
                  </td>
                </tr>
              ) : (
                datosEstadisticas.conversionPrueba.map((instructor, idx) => (
                  <motion.tr
                    key={instructor.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="border-b !hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2">{instructor.nombre}</td>
                    <td className="px-3 py-2 text-center">
                      {instructor.pruebas_convertidas}/{instructor.pruebas_asignadas}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`font-bold ${
                          instructor.porcentaje_conversion >= 80
                            ? 'text-green-600'
                            : instructor.porcentaje_conversion >= 70
                            ? 'text-blue-600 !hover:text-gray-50'
                            : 'text-orange-600'
                        }`}
                      >
                        {instructor.porcentaje_conversion.toFixed(1)}%
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SeccionInstructores;
