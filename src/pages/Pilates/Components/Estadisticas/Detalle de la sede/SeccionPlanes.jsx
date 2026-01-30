/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Sección de evolución mensual por plan.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import AyudaInfo from './AyudaInfo';

const SeccionPlanes = ({ datosEstadisticas }) => {
  const [mostrarTodo, setMostrarTodo] = useState(false);

  // Mostrar primero el mes más reciente
  const historialInvertido = [...datosEstadisticas.alumnosPorPlan].reverse();
  
  // Arranca con los últimos 2 meses
  const mesesAMostrar = mostrarTodo ? historialInvertido : historialInvertido.slice(0, 2);

  // Nombres de meses para el render
  const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  return (
    <motion.div
      key="planes"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* ALUMNOS POR PLAN */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-teal-500" />
            Alumnos por Plan (Evolución Mensual)
            <AyudaInfo texto="Evolución de alumnos por tipo de plan. i = inicio del mes, f = fin del mes. La variación % muestra si subió o bajó." />
          </h2>

          {/* Mostrar/ocultar historial */}
          {historialInvertido.length > 2 && (
            <button
              onClick={() => setMostrarTodo(!mostrarTodo)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-semibold"
            >
              <Calendar className="w-4 h-4" />
              {mostrarTodo ? "Ver menos" : `Ver meses anteriores (${historialInvertido.length - 2})`}
            </button>
          )}
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {mesesAMostrar.map((mesData, idx) => {
              const nombreMes = nombresMeses[mesData.mes - 1];
              
              return (
                <motion.div
                  key={`${mesData.anio}-${mesData.mes}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  className="border-b pb-4 last:border-b-0"
                >
                  <h3 className="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                    {nombreMes} {mesData.anio}
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {mesData.planes.map((plan) => {
                      // Color según tipo de plan
                      const colorClasses = 
                        plan.nombre_plan === 'Mensual' 
                          ? 'bg-blue-50 border-blue-100 hover:border-blue-300 text-blue-600'
                          : plan.nombre_plan === 'Trimestral'
                          ? 'bg-purple-50 border-purple-100 hover:border-purple-300 text-purple-600'
                          : 'bg-green-50 border-green-100 hover:border-green-300 text-green-600';
                      
                      return (
                        <motion.div
                          key={plan.id}
                          whileHover={{ scale: 1.02 }}
                          className={`${colorClasses} rounded-lg p-4 border-2 transition-all`}
                        >
                          <p className="text-sm font-medium text-gray-600 mb-2">
                            Plan {plan.nombre_plan}
                          </p>
                          <p className="text-2xl font-bold">
                            i: {plan.cantidad_inicial} → f: {plan.cantidad_final}
                          </p>
                          {plan.variacion_porcentual !== null && plan.variacion_porcentual !== 0 && (
                            <p
                              className={`text-sm font-semibold mt-1 flex items-center gap-1 ${
                                plan.variacion_porcentual > 0 ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {plan.variacion_porcentual > 0 ? (
                                <TrendingUp className="w-3 h-3" />
                              ) : (
                                <TrendingDown className="w-3 h-3" />
                              )}
                              {plan.variacion_porcentual > 0 ? '+' : ''}
                              {plan.variacion_porcentual.toFixed(1)}%
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SeccionPlanes;