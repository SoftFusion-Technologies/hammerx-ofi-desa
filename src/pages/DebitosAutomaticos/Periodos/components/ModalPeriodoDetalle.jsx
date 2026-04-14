import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  CalendarDays,
  User,
  Landmark,
  CreditCard,
  BadgeDollarSign,
  FileText,
  History,
  ShieldCheck,
  CircleDollarSign,
  ArrowRightCircle,
  Send
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 01 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal de detalle para períodos del módulo Débitos Automáticos.
 * Muestra la foto completa del período mensual, el cliente asociado,
 * estados, montos, motivo, observaciones y trazabilidad básica.
 *
 * Tema: Detalle de período - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 01/04/2026 - Modal de detalle reutilizable para consultar la información completa del período antes de operar aprobar, baja, cambio de tarjeta, pago manual o reintento */
const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    transition: { duration: 0.18 }
  }
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

const formatMonthLabel = (year, month) => {
  if (!year || !month) return '-';
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(d);
};

const formatCurrency = (value, currency = 'ARS') => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    maximumFractionDigits: 0
  }).format(n);
};

const getVariantClasses = (value, type = 'neutral') => {
  const normalized = String(value || '').toUpperCase();

  if (type === 'cobro') {
    if (normalized === 'COBRADO')
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (normalized === 'RECHAZADO' || normalized === 'BAJA')
      return 'bg-red-50 text-red-700 border border-red-200';
    if (normalized === 'PAGO_MANUAL')
      return 'bg-orange-50 text-orange-700 border border-orange-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }

  if (type === 'envio') {
    if (normalized === 'ENVIADO')
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    if (normalized === 'NO_ENVIADO')
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }

  if (type === 'accion') {
    if (normalized === 'CAMBIO_TARJETA')
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    if (normalized === 'COBRO_MANUAL')
      return 'bg-orange-50 text-orange-700 border border-orange-200';
    if (normalized === 'BAJA')
      return 'bg-red-50 text-red-700 border border-red-200';
    if (normalized === 'REINTENTO')
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  }

  return 'bg-slate-100 text-slate-700 border border-slate-200';
};

const Badge = ({ children, value, type }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getVariantClasses(
      value,
      type
    )}`}
  >
    {children}
  </span>
);

const DataCard = ({ icon: Icon, title, children, className = '' }) => (
  <div
    className={`rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] ${className}`}
  >
    <div className="mb-3 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-orange-500" />}
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

const DataItem = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
      {label}
    </p>
    <p className="mt-1 text-sm font-semibold text-slate-800 break-words">
      {value || '-'}
    </p>
  </div>
);

const resolveCliente = (periodo) => periodo?.cliente || null;

const resolveTitularNombre = (periodo) => {
  const cliente = resolveCliente(periodo);
  return (
    periodo?.titular_nombre || cliente?.titular_nombre || cliente?.nombre || '-'
  );
};

const resolveTitularDni = (periodo) => {
  const cliente = resolveCliente(periodo);
  return periodo?.titular_dni || cliente?.titular_dni || '-';
};

const resolvePlanNombre = (periodo) => {
  const cliente = resolveCliente(periodo);
  return (
    periodo?.plan_titular?.nombre ||
    cliente?.plan_titular?.nombre ||
    cliente?.titular_plan?.nombre ||
    periodo?.plan?.nombre ||
    cliente?.plan?.nombre ||
    cliente?.titular_plan_nombre ||
    periodo?.plan_nombre ||
    (cliente?.modalidad_adhesion === 'SOLO_ADICIONAL'
      ? 'Solo adicional'
      : '-') ||
    '-'
  );
};

const resolveBancoNombre = (periodo) => {
  const cliente = resolveCliente(periodo);
  return periodo?.banco?.nombre || cliente?.banco?.nombre || '-';
};

const resolveTarjeta = (periodo) => {
  const cliente = resolveCliente(periodo);
  const marca = periodo?.marca_tarjeta || cliente?.marca_tarjeta || '';
  const mascara =
    periodo?.tarjeta_mascara ||
    cliente?.tarjeta_mascara ||
    (cliente?.tarjeta_ultimos4 ? `**** ${cliente.tarjeta_ultimos4}` : '');

  if (!marca && !mascara) return '-';
  if (!marca) return mascara;
  if (!mascara) return marca;
  return `${marca} · ${mascara}`;
};

const resolveMoneda = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.moneda || 'ARS';
};

const resolveMontoBruto = (periodo) => {
  const cliente = resolveCliente(periodo);
  return periodo?.monto_bruto ?? cliente?.monto_base_vigente ?? null;
};

const resolveAlta = (periodo) => {
  const cliente = resolveCliente(periodo);
  return (
    cliente?.solicitud?.created_at ||
    cliente?.solicitud_created_at ||
    cliente?.created_at ||
    null
  );
};

const resolveInicio = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.fecha_inicio_cobro || null;
};

const resolvePagos = (periodo) => {
  const cliente = resolveCliente(periodo);
  return cliente?.pagos_cobrados ?? cliente?.pagos_count ?? cliente?.pagos ?? 0;
};

const resolveMotivo = (periodo) => {
  const parts = [];
  if (periodo?.motivo_codigo) parts.push(periodo.motivo_codigo);
  if (periodo?.motivo_detalle) parts.push(periodo.motivo_detalle);
  return parts.join(' · ') || '-';
};

const resolveObservaciones = (periodo) => {
  return periodo?.observaciones || '-';
};

const ModalPeriodoDetalle = ({ open, onClose, periodo, onGoToCliente }) => {
  if (!open) return null;

  const row = periodo || {};
  const cliente = resolveCliente(row);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1490] flex items-center justify-center p-3 sm:p-5"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          onClick={onClose}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 max-h-[94vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Detalle del período
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {resolveTitularNombre(row)}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge value={row?.estado_cobro} type="cobro">
                    {String(row?.estado_cobro || '-').replaceAll('_', ' ')}
                  </Badge>

                  <Badge value={row?.estado_envio} type="envio">
                    {String(row?.estado_envio || '-').replaceAll('_', ' ')}
                  </Badge>

                  <Badge value={row?.accion_requerida} type="accion">
                    {String(row?.accion_requerida || '-').replaceAll('_', ' ')}
                  </Badge>

                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    DNI {resolveTitularDni(row)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {typeof onGoToCliente === 'function' && (
                  <button
                    type="button"
                    onClick={() => onGoToCliente(row)}
                    className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    <ArrowRightCircle className="h-4 w-4" />
                    Ver cliente
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-[calc(94vh-90px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <DataCard
                icon={CalendarDays}
                title="Período mensual"
                className="xl:col-span-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem
                    label="Período"
                    value={formatMonthLabel(
                      Number(row?.periodo_anio),
                      Number(row?.periodo_mes)
                    )}
                  />
                  <DataItem label="ID período" value={String(row?.id || '-')} />
                  <DataItem
                    label="Fecha envío"
                    value={formatDate(row?.fecha_envio)}
                  />
                  <DataItem
                    label="Fecha resultado"
                    value={formatDate(row?.fecha_resultado)}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={User}
                title="Cliente asociado"
                className="xl:col-span-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem label="Titular" value={resolveTitularNombre(row)} />
                  <DataItem label="DNI" value={resolveTitularDni(row)} />
                  <DataItem label="Plan" value={resolvePlanNombre(row)} />
                  <DataItem
                    label="Pagos cobrados"
                    value={String(resolvePagos(row))}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={Landmark}
                title="Banco y tarjeta"
                className="xl:col-span-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem label="Banco" value={resolveBancoNombre(row)} />
                  <DataItem label="Tarjeta" value={resolveTarjeta(row)} />
                  <DataItem
                    label="Alta padrón"
                    value={formatDate(resolveAlta(row))}
                  />
                  <DataItem
                    label="Inicio cobro"
                    value={formatDate(resolveInicio(row))}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={CircleDollarSign}
                title="Montos del período"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DataItem
                    label="Monto bruto"
                    value={formatCurrency(
                      resolveMontoBruto(row),
                      resolveMoneda(row)
                    )}
                  />
                  <DataItem
                    label="Descuento off"
                    value={`${row?.descuento_off_pct_aplicado || 0}%`}
                  />
                  <DataItem
                    label="Reintegro"
                    value={`${row?.reintegro_pct_aplicado || 0}%`}
                  />
                  <DataItem
                    label="Monto neto estimado"
                    value={formatCurrency(
                      row?.monto_neto_estimado,
                      resolveMoneda(row)
                    )}
                  />
                  <DataItem label="Moneda" value={resolveMoneda(row)} />
                  <DataItem
                    label="Archivo banco ID"
                    value={row?.archivo_banco_id || '-'}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={Send}
                title="Estados operativos"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Estado envío
                    </p>
                    <div className="mt-2">
                      <Badge value={row?.estado_envio} type="envio">
                        {String(row?.estado_envio || '-').replaceAll('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Estado cobro
                    </p>
                    <div className="mt-2">
                      <Badge value={row?.estado_cobro} type="cobro">
                        {String(row?.estado_cobro || '-').replaceAll('_', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Acción requerida
                    </p>
                    <div className="mt-2">
                      <Badge value={row?.accion_requerida} type="accion">
                        {String(row?.accion_requerida || '-').replaceAll(
                          '_',
                          ' '
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DataCard>

              <DataCard
                icon={FileText}
                title="Motivo y observaciones"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Motivo
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-800 whitespace-pre-wrap">
                      {resolveMotivo(row)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Observaciones
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-800 whitespace-pre-wrap">
                      {resolveObservaciones(row)}
                    </p>
                  </div>
                </div>
              </DataCard>

              <DataCard
                icon={History}
                title="Trazabilidad"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem label="Creado por" value={row?.creado_por || '-'} />
                  <DataItem
                    label="Actualizado por"
                    value={row?.updated_by || '-'}
                  />
                  <DataItem
                    label="Creado el"
                    value={formatDateTime(row?.created_at)}
                  />
                  <DataItem
                    label="Actualizado el"
                    value={formatDateTime(row?.updated_at)}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={ShieldCheck}
                title="Resumen rápido"
                className="xl:col-span-12"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <DataItem label="Titular" value={resolveTitularNombre(row)} />
                  <DataItem label="Banco" value={resolveBancoNombre(row)} />
                  <DataItem label="Plan" value={resolvePlanNombre(row)} />
                  <DataItem
                    label="Bruto"
                    value={formatCurrency(
                      resolveMontoBruto(row),
                      resolveMoneda(row)
                    )}
                  />
                  <DataItem
                    label="Neto estimado"
                    value={formatCurrency(
                      row?.monto_neto_estimado,
                      resolveMoneda(row)
                    )}
                  />
                  <DataItem
                    label="Acción requerida"
                    value={String(row?.accion_requerida || '-').replaceAll(
                      '_',
                      ' '
                    )}
                  />
                </div>
              </DataCard>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
              >
                Cerrar
              </button>

              {typeof onGoToCliente === 'function' && (
                <button
                  type="button"
                  onClick={() => onGoToCliente(row)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Ir al cliente
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalPeriodoDetalle;
