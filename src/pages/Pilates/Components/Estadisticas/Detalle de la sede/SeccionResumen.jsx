/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Resumen general con mostrador y métricas rápidas.
 */

import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Clock,
  Users,
  UserMinus,
  UserPlus,
  TrendingUp,
} from 'lucide-react';
import CardMostrador from './CardMostrador';
import AyudaInfo from './AyudaInfo';

const formatearPorcentaje = (valor) => `${Number(valor || 0).toFixed(1)}%`;

// Resumen general con el mostrador y métricas rápidas.
const SeccionResumen = ({
  datosEstadisticas,
  panelesVisibles,
  alternarPanel,
}) => {
  return (
    <motion.div
      key="resumen"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* El mostrador */}
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-orange-500" />
          El Mostrador resumen rápido
          <AyudaInfo
            texto="Indicadores rápidos para entender cómo viene el mes: disponibilidad de turnos, vencimientos, lista de espera, ausencias, altas y bajas."
          />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <CardMostrador
            titulo="Turnos Libres"
            valor={datosEstadisticas.mostrador.turnos_libres}
            icono={<Calendar className="w-8 h-8" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            visible={panelesVisibles.turnosLibres}
            onToggle={() => alternarPanel('turnosLibres')}
          />

          <CardMostrador
            titulo="Planes Contratados Vencidos"
            valor={datosEstadisticas.mostrador.planes_vencidos}
            icono={<Clock className="w-8 h-8" />}
            color="bg-gradient-to-br from-red-500 to-red-600"
            visible={panelesVisibles.planesVencidos}
            onToggle={() => alternarPanel('planesVencidos')}
          />

          <CardMostrador
            titulo="Lista de Espera"
            valor={datosEstadisticas.mostrador.lista_espera}
            icono={<Users className="w-8 h-8" />}
            color="bg-gradient-to-br from-yellow-500 to-yellow-600"
            visible={panelesVisibles.listaEspera}
            onToggle={() => alternarPanel('listaEspera')}
          />

          <CardMostrador
            titulo="Cantidad de ausentes"
            valor={datosEstadisticas.mostrador.resumen_ausentes_mes}
            icono={<UserMinus className="w-8 h-8" />}
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            visible={panelesVisibles.ausentes}
            onToggle={() => alternarPanel('ausentes')}
          />

          <CardMostrador
            titulo="Bajas del Mes"
            valor={datosEstadisticas.bajasMes}
            icono={<UserMinus className="w-8 h-8" />}
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            visible={panelesVisibles.bajas}
            onToggle={() => alternarPanel('bajas')}
          />

          <CardMostrador
            titulo="Altas del Mes"
            valor={datosEstadisticas.altasMes}
            icono={<UserPlus className="w-8 h-8" />}
            color="bg-gradient-to-br from-green-500 to-green-600"
            visible={panelesVisibles.altas}
            onToggle={() => alternarPanel('altas')}
          />

          
        </div>

        {/* Tarjetas extra */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardMostrador
              titulo="Total de Cupos Habilitados"
              valor={datosEstadisticas.mostrador.cupos_habilitados}
              icono={<Users className="w-8 h-8" />}
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              visible
            />
            <CardMostrador
              titulo="Cupos Deshabilitados"
              valor={datosEstadisticas.mostrador.cupos_deshabilitados}
              icono={<Users className="w-8 h-8" />}
              color="bg-gradient-to-br from-slate-600 to-slate-700"
              visible
            />
            <CardMostrador
              titulo="Retención del Mes"
              valor={formatearPorcentaje(
                datosEstadisticas.retencion?.porcentajeRetencion,
              )}
              icono={<TrendingUp className="w-8 h-8" />}
              color="bg-gradient-to-br from-amber-500 to-amber-600"
              visible
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SeccionResumen;
