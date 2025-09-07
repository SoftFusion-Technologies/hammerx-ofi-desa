import {
  BarChart3,
  UserPlus2,
  Users2,
  TrendingUp,
  CheckCircle2,
  Star,
  CalendarCheck2,
  X,
  BadgeDollarSign,
  Percent
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';

// Hook animador de números
function useCountUp(value, duration = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    let startTime;
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setDisplay(Math.round(progress * value));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    }
    requestAnimationFrame(animate);
    // Limpia si el valor cambia
    return () => setDisplay(value);
  }, [value, duration]);
  return display;
}

const pct = (v) => {
  if (v == null || isNaN(v)) return '0%';
  return `${(Number(v) * 100).toFixed(1)}%`;
};

const safeArr = (arr) => (Array.isArray(arr) ? arr : []);

export default function StatsVentasModal({
  open,
  onClose,
  sede,
  normalizeSede2,
  mes,
  anio
}) {
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detecta mobile para botón cerrar abajo
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  console.log(sede);

  // Ejemplo de uso correcto:
  useEffect(() => {
    if (open) {
      setStats(null); // Spinner de carga mientras llega la data

      const sedeParam = sede === 'smt' ? 'barriosur' : sede;

      const params = {};

      if (sedeParam) params.sede = normalizeSede2(sedeParam);
      if (mes) params.mes = mes;
      if (anio) params.anio = anio;

      axios
        .get('http://localhost:8080/stats-ventas', { params })
        .then((res) => {
          setStats(res.data);
        })
        .catch((err) => {
          console.error('Error al obtener estadísticas:', err);
        });
    }
  }, [open, sede, mes, anio, normalizeSede2]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="mt-28 fixed inset-0 bg-black/40 z-40 flex justify-end items-stretch sm:items-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white dark:bg-zinc-900 w-full sm:w-[480px] max-w-full
             h-full sm:max-h-[85vh] sm:h-auto sm:rounded-l-3xl p-6
             shadow-2xl flex flex-col gap-5 z-50 overflow-y-auto relative`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', bounce: 0.16, duration: 0.34 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Botón cerrar arriba */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-gray-400 hover:text-[#fc4b08] text-2xl font-bold sm:block hidden"
            aria-label="Cerrar"
          >
            <X />
          </button>
          {/* Título */}
          <div className="flex items-center justify-between mb-2 pr-7 font-bignoodle text-4xl text-center">
            <h2 className="text-xl font-bold text-[#fc4b08]">
              Estadísticas de Ventas{' '}
              <span className="text-green-500 uppercase">({sede})</span>
              <span className="text-gray-500 normal-case font-semibold text-base ml-2">
                •{' '}
                {new Date(anio, mes - 1)
                  .toLocaleString('es-AR', { month: 'long' })
                  .toUpperCase()}{' '}
                {anio}
              </span>
            </h2>
            {/* Botón cerrar arriba para mobile (sm:hidden) */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#fc4b08] text-2xl font-bold sm:hidden"
              aria-label="Cerrar"
            >
              <X />
            </button>
          </div>
          {!stats ? (
            <div className="flex justify-center items-center h-40">
              <span className="animate-spin border-4 border-orange-400 border-t-transparent rounded-full w-10 h-10"></span>
            </div>
          ) : (
            <div className="flex flex-col gap-4 pb-16">
              <StatCard
                icon={<BarChart3 />}
                label="Total Registros"
                value={stats.total_ventas}
                color="#fc4b08"
              />
              <StatGroup
                title="Prospectos"
                items={stats.prospectos.map((p) => ({
                  icon: <UserPlus2 />,
                  label: p.tipo,
                  value: p.cantidad
                }))}
              />
              <StatGroup
                title="Canales"
                items={stats.canales.map((c) => ({
                  icon: <TrendingUp />,
                  label: c.canal,
                  value: c.cantidad
                }))}
              />
              {stats.campaniasPorOrigen &&
                stats.campaniasPorOrigen.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 mt-2">
                      Campañas por Origen
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {stats.campaniasPorOrigen.map((cpo, idx) => {
                        // Buscamos la conversión para este origen (puede ser 0 si no hay)
                        const conv = stats.campaniasConvertidasPorOrigen?.find(
                          (cc) => cc.origen === cpo.origen
                        );
                        return (
                          <div
                            key={cpo.origen + idx}
                            className="flex items-center gap-2 bg-orange-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-sm font-semibold"
                          >
                            <span className="text-[#fc4b08]">
                              {/* Podés poner un ícono acá */}
                            </span>
                            {cpo.origen || (
                              <span className="italic text-gray-400">
                                Sin especificar
                              </span>
                            )}
                            :{' '}
                            <span className="text-gray-900 dark:text-white">
                              {cpo.cantidad}
                            </span>
                            <span className="ml-2 px-2 py-0.5 rounded bg-green-100 dark:bg-green-700/40 text-green-700 dark:text-green-200 text-xs">
                              {conv
                                ? `${conv.cantidad_convertidos} convertidos`
                                : '0 convertidos'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <StatGroup
                title="Actividades"
                items={stats.actividades.map((a) => ({
                  icon: <Star />,
                  label: a.actividad,
                  value: a.cantidad
                }))}
              />
              <StatGroup
                title="Contactos"
                items={[
                  {
                    icon: <Users2 />,
                    label: '1° Contacto',
                    value: stats.contactos.total_contacto_1
                  },
                  {
                    icon: <Users2 />,
                    label: '2° Contacto',
                    value: stats.contactos.total_contacto_2
                  },
                  {
                    icon: <Users2 />,
                    label: '3° Contacto',
                    value: stats.contactos.total_contacto_3
                  }
                ]}
              />
              <StatCard
                icon={<CalendarCheck2 />}
                label="Clases de Prueba"
                value={stats.total_clases_prueba}
                color="#0085e6"
              />
              <StatCard
                icon={<CheckCircle2 />}
                label="Convertidos"
                value={stats.total_convertidos}
                color="#58b35e"
              />
              {/* --- COMISIONES --- */}
              <StatCard
                icon={<BadgeDollarSign />}
                label="Comisiones"
                value={stats.total_comisiones || 0}
                color="#0ea5e9" // sky-500
              />
              <StatCard
                icon={<Percent />}
                label="Tasa Comisión / Convertidos"
                value={Math.round(
                  (stats.tasa_comision_sobre_convertidos || 0) * 100
                )} // animado con CountUp
                color="#0ea5e9"
              />
              <div className="text-xs text-gray-500 -mt-3">
                {pct(stats.tasa_comision_sobre_convertidos)} del total de
                convertidos
              </div>

              <StatGroup
                title="Comisiones por Asesor"
                items={safeArr(stats.comisionesPorAsesor).map((a) => ({
                  icon: <BadgeDollarSign />,
                  label: a.asesor_nombre || 'Sin asesor',
                  value: a.cantidad
                }))}
              />

              <StatGroup
                title="Comisiones por Canal"
                items={safeArr(stats.comisionesPorCanal).map((c) => ({
                  icon: <TrendingUp />,
                  label: c.canal || 'Sin canal',
                  value: c.cantidad
                }))}
              />

              <StatGroup
                title="Comisiones por Actividad"
                items={safeArr(stats.comisionesPorActividad).map((a) => ({
                  icon: <Star />,
                  label: a.actividad || 'Sin actividad',
                  value: a.cantidad
                }))}
              />

              {stats.comisionesPorOrigenCampania &&
                stats.comisionesPorOrigenCampania.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 mt-2">
                      Comisiones por Origen (Campañas)
                    </div>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                      {stats.comisionesPorOrigenCampania.map((cpo, idx) => (
                        <div
                          key={(cpo.origen || 'sin') + idx}
                          className="flex items-center gap-2 bg-sky-100 dark:bg-zinc-800 px-2 py-1 rounded-lg text-sm font-semibold shrink-0"
                        >
                          <span className="text-sky-600">
                            <BadgeDollarSign size={16} />
                          </span>
                          {cpo.origen || (
                            <span className="italic text-gray-400">
                              Sin origen
                            </span>
                          )}
                          :{' '}
                          <span className="text-gray-900 dark:text-white">
                            {cpo.cantidad}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {stats.comisionesPorDia && stats.comisionesPorDia.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1 mt-2">
                    Comisiones por día
                  </div>
                  {/* En vez de grafico, pill timeline simple con scroll horizontal */}
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    {stats.comisionesPorDia.map((d, idx) => (
                      <div
                        key={String(d.dia) + idx}
                        className="flex items-center gap-2 bg-sky-50 dark:bg-zinc-800 px-2 py-1 rounded-lg text-xs font-semibold shrink-0"
                        title={new Date(d.dia).toLocaleDateString('es-AR')}
                      >
                        <span className="text-sky-600">
                          <CalendarCheck2 size={14} />
                        </span>
                        {new Date(d.dia).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit'
                        })}
                        :{' '}
                        <span className="text-gray-900 dark:text-white">
                          {d.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botón cerrar abajo SOLO en mobile */}
          {isMobile && (
            <button
              onClick={onClose}
              className="fixed left-0 right-0 bottom-0 mx-auto mb-3 bg-[#fc4b08] text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg active:scale-95 transition z-50 w-[90vw] max-w-xs"
              aria-label="Cerrar"
              style={{ pointerEvents: 'auto' }}
            >
              Cerrar Estadísticas
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Card con número animado
function StatCard({ icon, label, value, color = '#fc4b08' }) {
  const display = useCountUp(Number(value));
  return (
    <div className="flex items-center gap-4 bg-orange-50 dark:bg-zinc-800/80 p-3 rounded-xl shadow-sm">
      <span
        className="rounded-xl bg-white dark:bg-zinc-900 p-2"
        style={{ color }}
      >
        {icon}
      </span>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {display}
        </div>
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">
          {label}
        </div>
      </div>
    </div>
  );
}

// Grupo de stats horizontales
function StatGroup({ title, items }) {
  const data = safeArr(items);
  return (
    <div>
      <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-1">
        {title}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {data.map((item, idx) => (
          <div
            key={item.label + idx}
            className="flex items-center gap-2 bg-orange-100 dark:bg-zinc-800
                       px-2 py-1 rounded-lg text-sm font-semibold shrink-0"
          >
            <span className="text-[#fc4b08]">{item.icon}</span>
            {item.label}:{' '}
            <span className="text-gray-900 dark:text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCardPercent({ icon, label, ratio, color = '#0ea5e9' }) {
  const value = Math.round((ratio || 0) * 100);
  const display = useCountUp(value);
  return (
    <div className="flex items-center gap-4 bg-sky-50 dark:bg-zinc-800/80 p-3 rounded-xl shadow-sm">
      <span
        className="rounded-xl bg-white dark:bg-zinc-900 p-2"
        style={{ color }}
      >
        {icon}
      </span>
      <div>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          {display}%
        </div>
        <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-300">
          {label}
        </div>
      </div>
    </div>
  );
}

