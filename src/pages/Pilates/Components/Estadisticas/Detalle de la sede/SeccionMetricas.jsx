/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Sección de métricas clave de la sede.
 */

import { motion } from "framer-motion";
import { Clock, Target, UserCheck } from "lucide-react";
import AyudaInfo from "./AyudaInfo";
const SeccionMetricas = ({ datosEstadisticas }) => {
  return (
    <motion.div
      key="metricas"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* VIDA MEDIA (LTV) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          Vida Media del Socio (LTV)
          <AyudaInfo texto="Tiempo promedio (en meses) que un socio se mantiene activo. Sirve para entender permanencia y fidelidad." />
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-8">
          <div className="flex-1 text-center sm:text-left">
            <motion.p
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl font-bold text-blue-600"
            >
              {datosEstadisticas.vidaMedia.promedioMeses}
            </motion.p>
            <p className="text-gray-600 mt-2">meses promedio</p>
          </div>
          <div className="flex-1 text-center sm:text-right">
            <p className="text-sm text-gray-500">Basado en</p>
            <p className="text-3xl font-bold text-gray-700">
              {datosEstadisticas.vidaMedia.totalSociosEstudiados}
            </p>
            <p className="text-sm text-gray-500">socios estudiados</p>
          </div>
        </div>
      </motion.div>

      {/* RETENCIÓN GLOBAL */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-500" />
          Retención del Mes
          <AyudaInfo texto="Resumen del mes: cuántos arrancaron, cuántos siguen desde el día 1 y el % de retención (mientras más alto, mejor)." />
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center bg-gray-50 rounded-lg p-4"
          >
            <p className="text-sm text-gray-500 mb-1">Clientes Iniciales</p>
            <p className="text-3xl font-bold text-gray-700">
              {datosEstadisticas.retencion.clientesIniciales}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center bg-blue-50 rounded-lg p-4"
          >
            <p className="text-sm text-gray-500 mb-1">Siguen del Día 1</p>
            <p className="text-3xl font-bold text-blue-600">
              {datosEstadisticas.retencion.cantidadSiguenDiaUno !== null &&
              typeof datosEstadisticas.retencion.cantidadSiguenDiaUno !==
                "undefined"
                ? datosEstadisticas.retencion.cantidadSiguenDiaUno
                : "-"}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center bg-orange-50 rounded-lg p-4"
          >
            <p className="text-sm text-gray-500 mb-1">Cantidad Actual de Alumnos</p>
            <p className="text-3xl font-bold text-orange-600">
              {datosEstadisticas.ocupacion.alumnosInscritos}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center bg-green-50 rounded-lg p-4"
          >
            <p className="text-sm text-gray-500 mb-1">% Retención</p>
            <p className="text-5xl font-bold text-green-600">
              {datosEstadisticas.retencion.porcentajeRetencion.toFixed(2)}%
            </p>
          </motion.div>
        </div>
        <div className="mt-4 bg-gray-100 rounded-full h-4 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${datosEstadisticas.retencion.porcentajeRetencion}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-green-500 to-green-600 h-full"
          ></motion.div>
        </div>
      </motion.div>

      {/* OCUPACIÓN Y ASISTENCIA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-indigo-500" />
          Ocupación y Asistencia
          <AyudaInfo texto="Mide qué tan llenas están las clases (ocupación) y cómo viene la asistencia del mes (presentes vs ausentes)." />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ocupación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Ocupación de Turnos
              <AyudaInfo texto="Relación entre alumnos inscriptos y turnos habilitados en el período. Mide qué tan llenas están las clases." />
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {datosEstadisticas.ocupacion.alumnosInscritos} /{" "}
                  {datosEstadisticas.ocupacion.turnosHabilitados} turnos
                </span>
                <span className="font-bold text-indigo-600">
                  {datosEstadisticas.ocupacion.porcentajeOcupacion.toFixed(2)}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${datosEstadisticas.ocupacion.porcentajeOcupacion}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full"
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Asistencia */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              Asistencia Promedio
              <AyudaInfo texto="Porcentaje de asistencia del mes hasta hoy (presentes sobre el total posible)." />
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {datosEstadisticas.mostrador.ausentes_mes_hasta_fecha}{" "}
                  ausentes /{" "}
                  {
                    datosEstadisticas.mostrador
                      .ausentes_posibles_mes_hasta_fecha
                  }{" "}
                  totales
                </span>
                <span className="font-bold text-green-600">
                  {datosEstadisticas.mostrador.porcentaje_asistencia_mes.toFixed(
                    2,
                  )}
                  %
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${datosEstadisticas.mostrador.porcentaje_asistencia_mes}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="bg-gradient-to-r from-green-500 to-green-600 h-full"
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SeccionMetricas;
