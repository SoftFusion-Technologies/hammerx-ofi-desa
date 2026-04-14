import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavbarStaff from '../staff/NavbarStaff';
import { useAuth } from '../../AuthContext';

import {
  Building2,
  Layers3,
  FileText,
  ClipboardList,
  Users,
  CalendarDays
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/6 via-pink-500/6 to-emerald-400/6 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-10 flex h-full flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 transition-colors duration-300 group-hover:bg-orange-500 group-hover:text-white">
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
              <p className="text-xs leading-snug text-slate-500">
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
        'Gestión de planes disponibles para adhesiones y formulario publico.',
      to: '/dashboard/debitos-automaticos/planes',
      icon: Layers3
    },
    {
      title: 'Términos',
      description:
        'Versionado, activación e historial de términos y condiciones.',
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
      description: 'Clientes ya aprobados y activos dentro de débitos.',
      to: '/dashboard/debitos-automaticos/clientes',
      icon: Users
    }
  ],

  operacion: [
    {
      title: 'Períodos',
      description:
        'Control mensual de cobros, rechazos, pagos manuales y bajas.',
      to: '/dashboard/debitos-automaticos/periodos',
      icon: CalendarDays
    }
  ]
};

/* Benjamin Orellana - 2026/04/10 - Usuarios con acceso completo al home del módulo Débitos Automáticos. */
const DEBITOS_FULL_ACCESS_USER_IDS = new Set([1, 15, 19]);

/* Benjamin Orellana - 2026/04/10 - Correos privilegiados normalizados para tolerar diferencias de mayúsculas/minúsculas. */
const DEBITOS_FULL_ACCESS_EMAILS = new Set([
  'carlosg@hammer.ar',
  'marcelog@hammer.ar',
  'benja@gmail.com',
  'azultaborda@icloud.com'
]);

/* Benjamin Orellana - 2026/04/10 - Normaliza strings para comparaciones seguras de identidad. */
const normalizeIdentityValue = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

/* Benjamin Orellana - 2026/04/10 - Define si el usuario puede ver todo el dashboard o debe comportarse como vendedor. */
const canAccessFullDebitosDashboard = ({ userLevel, userId, userName }) => {
  const normalizedLevel = normalizeIdentityValue(userLevel);
  const normalizedUserName = normalizeIdentityValue(userName);
  const numericUserId = Number(userId);

  const isPrivilegedById = Number.isFinite(numericUserId)
    ? DEBITOS_FULL_ACCESS_USER_IDS.has(numericUserId)
    : false;

  const isPrivilegedByEmail =
    !!normalizedUserName && DEBITOS_FULL_ACCESS_EMAILS.has(normalizedUserName);

  if (isPrivilegedById || isPrivilegedByEmail) return true;

  if (normalizedLevel === 'vendedor') return false;
  if (normalizedLevel === 'admin') return false;

  return false;
};

const AdminPageDebitosAutomaticos = () => {
  const { userLevel, userId, userName } = useAuth();

  /* Benjamin Orellana - 2026/04/10 - Vendedores y admins no privilegiados ingresan directamente a Solicitudes. */
  const hasFullAccess = canAccessFullDebitosDashboard({
    userLevel,
    userId,
    userName
  });

  if (!hasFullAccess) {
    return <Navigate to="/dashboard/debitos-automaticos/solicitudes" replace />;
  }

  return (
    <>
      <NavbarStaff />

      <section className="relative min-h-[calc(100vh-80px)] w-full">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-bignoodle text-2xl uppercase tracking-[.18em] text-white sm:text-3xl lg:text-4xl"
                >
                  Débitos Automáticos
                </motion.h1>
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

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
              <div className="flex w-full flex-col gap-5">
                <div className="mb-2 border-b border-orange-500/30 pb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    CONFIGURACIÓN
                  </h2>
                  <p className="text-xs font-semibold text-slate-300">
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

              <div className="flex w-full flex-col gap-5">
                <div className="mb-2 border-b border-orange-500/30 pb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    ADHESIONES
                  </h2>
                  <p className="text-xs font-semibold text-slate-300">
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

              <div className="flex w-full flex-col gap-5">
                <div className="mb-2 border-b border-orange-500/30 pb-2">
                  <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                    OPERACIÓN
                  </h2>
                  <p className="text-xs font-semibold text-slate-300">
                    Seguimiento mensual, archivos y banco
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
