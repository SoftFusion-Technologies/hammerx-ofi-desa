/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Tarjeta de métrica para el mostrador.
 */

import { motion } from 'framer-motion';
import AyudaInfo from './AyudaInfo';
const CardMostrador = ({
  titulo,
  valor,
  icono,
  color,
  visible,
  onToggle,
  onClick,
  ayuda,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`${color} rounded-xl shadow-md text-white p-6 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {/* Fondo decorativo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>

      {!!ayuda && (
        <div className="absolute right-3 top-3 z-10">
          <AyudaInfo texto={ayuda} />
        </div>
      )}


      <div className="flex items-center justify-between relative z-10">
        <div>
          <p className="text-sm font-medium opacity-90 mb-1">{titulo}</p>
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="text-5xl font-bold"
          >
            {valor}
          </motion.p>
        </div>
        <div className="opacity-40">{icono}</div>
      </div>

      {/* Indicador de click si aplica */}
      {onClick && (
        <p className="text-xs mt-3 opacity-75 relative z-10">Click para ver detalles</p>
      )}
    </motion.div>
  );
};

export default CardMostrador;
