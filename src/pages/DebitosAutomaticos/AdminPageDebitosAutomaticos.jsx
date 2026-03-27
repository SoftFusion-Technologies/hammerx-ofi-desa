import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavbarStaff from '../staff/NavbarStaff';

import {
  Building2,
  Layers3,
  FileText,
  ClipboardList,
  UserPlus,
  Users,
  CalendarDays,
  FileArchive,
  CheckCircle2,
  History
} from 'lucide-react';

const DashboardTile = ({
  title,
  description,
  to,
  icon: Icon,
  delay = 0,
  badgeSlot,
  children
}) => {
  const Wrapper = to ? Link : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      className="relative w-full"
    >
      <Wrapper
        to={to}
        className="group block h-full w-full text-left focus:outline-none"
        type={to ? undefined : 'button'}
      >
        <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-500/6 via-pink-500/6 to-emerald-400/6" />

          <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <h3 className="font-bignoodle text-xl tracking-wide text-slate-900">
                  {title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {badgeSlot ? (
                  <div className="scale-90 md:scale-100">{badgeSlot}</div>
                ) : (
                  <span className="text-[11px] uppercase tracking-widest text-slate-400">
                    Abrir
                  </span>
                )}
              </div>
            </div>

            {description && (
              <p className="text-xs text-slate-500 leading-snug">
                {description}
              </p>
            )}

            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
};

const seccionesDebitos = {
  configuracion: [
    {
      title: 'Bancos',
      description: 'Administración de bancos, beneficios visibles.',
      to: '/dashboard/debitos-automaticos/bancos',
      icon: Building2
    },
    {
      title: 'Planes',
      description:
        'Gestión de planes disponibles para adhesiones y formularios.',
      to: '/dashboard/debitos-automaticos/planes',
      icon: Layers3
    },
    {
      title: 'Términos',
      description:
        'Versionado, activación e historial legal de términos y condiciones.',
      to: '/dashboard/debitos-automaticos/terminos',
      icon: FileText
    }
  ],

  adhesiones: [
    {
      title: 'Solicitudes y adicionales',
      description:
        'Listado general de solicitudes públicas e internas del módulo.',
      to: '/dashboard/debitos-automaticos/solicitudes',
      icon: ClipboardList
    },

    {
      title: 'Clientes y adicionales',
      description:
        'Clientes ya aprobados y activos dentro del sistema de débitos.',
      to: '/dashboard/debitos-automaticos/clientes',
      icon: Users
    },

  ],

  operacion: [
    {
      title: 'Períodos',
      description:
        'Control mensual de cobros, rechazos, pagos manuales y bajas.',
      to: '/dashboard/debitos-automaticos/periodos',
      icon: CalendarDays
    },
    {
      title: 'Archivos banco',
      description: 'Carga y administración de archivos bancarios importados.',
      to: '/dashboard/debitos-automaticos/archivos-banco',
      icon: FileArchive
    },
    {
      title: 'Resultados banco',
      description:
        'Resultados procesados de importaciones y conciliaciones bancarias.',
      to: '/dashboard/debitos-automaticos/resultados-banco',
      icon: CheckCircle2
    },
    {
      title: 'Historial',
      description:
        'Trazabilidad y auditoría completa del módulo de débitos automáticos.',
      to: '/dashboard/debitos-automaticos/historial',
      icon: History
    }
  ]
};

const AdminPageDebitosAutomaticos = () => {
  return (
    <>
      <NavbarStaff />

      <section className="relative w-full min-h-[calc(100vh-80px)]">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bignoodle tracking-[.18em] uppercase text-white"
                >
                  Débitos Automáticos
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-1 text-sm text-slate-200/80 max-w-xl"
                >
                  Panel central del módulo para administrar configuración,
                  solicitudes, clientes, operación bancaria y auditoría.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-wide text-slate-200/70">
                    Módulo
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Débitos Automáticos
                  </p>
                </div>
              </motion.div>
            </div>

            {/* GRID PRINCIPAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* CONFIGURACIÓN */}
              <div className="flex flex-col gap-5 w-full">
                <div className="pb-2 border-b border-orange-500/30 mb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    CONFIGURACIÓN
                  </h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    Parámetros base del módulo
                  </p>
                </div>

                {seccionesDebitos.configuracion.map((item, index) => (
                  <DashboardTile
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    to={item.to}
                    icon={item.icon}
                    delay={0.08 + index * 0.04}
                  />
                ))}
              </div>

              {/* ADHESIONES */}
              <div className="flex flex-col gap-5 w-full">
                <div className="pb-2 border-b border-orange-500/30 mb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    ADHESIONES
                  </h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    Solicitudes, clientes y adicionales
                  </p>
                </div>

                {seccionesDebitos.adhesiones.map((item, index) => (
                  <DashboardTile
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    to={item.to}
                    icon={item.icon}
                    delay={0.18 + index * 0.04}
                  />
                ))}
              </div>

              {/* OPERACIÓN */}
              <div className="flex flex-col gap-5 w-full">
                <div className="pb-2 border-b border-orange-500/30 mb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    OPERACIÓN
                  </h2>
                  <p className="text-xs text-slate-300 font-semibold">
                    Seguimiento mensual, banco y auditoría
                  </p>
                </div>

                {seccionesDebitos.operacion.map((item, index) => (
                  <DashboardTile
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    to={item.to}
                    icon={item.icon}
                    delay={0.28 + index * 0.04}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminPageDebitosAutomaticos;
