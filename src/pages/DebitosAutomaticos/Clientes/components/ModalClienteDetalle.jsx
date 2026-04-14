import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  User,
  CreditCard,
  Landmark,
  BadgeDollarSign,
  CalendarDays,
  FileText,
  Phone,
  Mail,
  ShieldCheck,
  Users,
  CircleDollarSign,
  History,
  ArrowRightCircle
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal de detalle para clientes adheridos del módulo Débitos Automáticos.
 * Muestra la información completa del titular, solicitud, banco, tarjeta,
 * plan, beneficio, adicional asociado y último período disponible.
 *
 * Tema: Detalle de cliente - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 31/03/2026 - Modal visual de detalle reutilizable para consumir el OBR de clientes y mostrar toda la foto operativa del adherido */
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

const formatMonthYear = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(d);
};

const formatCurrency = (value, moneda = 'ARS') => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda || 'ARS',
    maximumFractionDigits: 0
  }).format(n);
};

// Benjamin Orellana - 2026/04/13 - Prioriza la tarjeta completa si vino desde backend; si no, usa máscara o últimos 4.
const formatCardDisplay = (cliente) => {
  const raw = String(cliente?.tarjeta_numero_completo || '').replace(/\D/g, '');

  if (raw) {
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  if (cliente?.tarjeta_mascara) return cliente.tarjeta_mascara;

  if (cliente?.tarjeta_ultimos4) {
    return `**** **** **** ${cliente.tarjeta_ultimos4}`;
  }

  return '-';
};

const getEstadoClass = (estado) => {
  const map = {
    ACTIVO: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    PENDIENTE_INICIO: 'bg-amber-50 text-amber-700 border border-amber-200',
    PAUSADO: 'bg-slate-100 text-slate-700 border border-slate-200',
    BAJA: 'bg-red-50 text-red-700 border border-red-200',
    BLOQUEADO: 'bg-rose-50 text-rose-700 border border-rose-200',
    COBRADO: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    RECHAZADO: 'bg-red-50 text-red-700 border border-red-200',
    PAGO_MANUAL: 'bg-amber-50 text-amber-700 border border-amber-200',
    PENDIENTE: 'bg-amber-50 text-amber-700 border border-amber-200',
    ENVIADO: 'bg-sky-50 text-sky-700 border border-sky-200',
    NO_ENVIADO: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    map[String(estado || '').toUpperCase()] ||
    'bg-slate-100 text-slate-700 border border-slate-200'
  );
};

const Badge = ({ children, state }) => (
  <span
    className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${getEstadoClass(
      state
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

const ModalClienteDetalle = ({ open, onClose, cliente, onGoToPeriodos }) => {
  if (!open) return null;

  const row = cliente || {};
  const solicitud = row?.solicitud || {};
  const banco = row?.banco || {};
  const planTitular = row?.plan_titular || row?.titular_plan || {};
  const adicional = row?.adicional || null;
  const ultimoPeriodo = Array.isArray(row?.ultimos_periodos)
    ? row.ultimos_periodos[0] || null
    : null;

  const beneficioTexto =
    row?.beneficio_descripcion_snapshot ||
    [
      Number(row?.beneficio_descuento_off_pct_snapshot || 0) > 0
        ? `${row?.beneficio_descuento_off_pct_snapshot}% off`
        : null,
      Number(row?.beneficio_reintegro_pct_snapshot || 0) > 0
        ? `Reintegro ${row?.beneficio_reintegro_pct_snapshot}%`
        : null
    ]
      .filter(Boolean)
      .join(' · ') ||
    '-';

  // Benjamin Orellana - 2026/04/13 - En el detalle del cliente se muestra tarjeta completa si backend la habilitó; si no, máscara.
  const tarjetaTexto = [row?.marca_tarjeta || '-', formatCardDisplay(row)].join(
    ' · '
  );

  const modalidadTexto =
    row?.modalidad_adhesion === 'TITULAR_SOLO'
      ? 'Titular solo'
      : row?.modalidad_adhesion === 'AMBOS'
        ? 'Titular + adicional'
        : row?.modalidad_adhesion === 'SOLO_ADICIONAL'
          ? 'Solo adicional'
          : '-';

  const observaciones =
    row?.observaciones_internas ||
    solicitud?.observaciones_internas ||
    solicitud?.observaciones_cliente ||
    '-';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1400] flex items-center justify-center p-3 sm:p-5"
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
          className="relative z-10 max-h-[99vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Detalle del cliente
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {row?.titular_nombre || '-'}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge state={row?.estado_general}>
                    {String(row?.estado_general || '-').replaceAll('_', ' ')}
                  </Badge>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    DNI {row?.titular_dni || '-'}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {modalidadTexto}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {typeof onGoToPeriodos === 'function' && (
                  <button
                    type="button"
                    onClick={() => onGoToPeriodos(row)}
                    className="hidden sm:inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-600 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                  >
                    <ArrowRightCircle className="h-4 w-4" />
                    Ver períodos
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
              <DataCard icon={User} title="Titular" className="xl:col-span-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem label="Nombre" value={row?.titular_nombre} />
                  <DataItem label="DNI" value={row?.titular_dni} />
                  <DataItem
                    label="Email"
                    value={solicitud?.titular_email || '-'}
                  />
                  <DataItem
                    label="Teléfono"
                    value={solicitud?.titular_telefono || '-'}
                  />
                </div>
              </DataCard>

              <DataCard icon={Landmark} title="Banco" className="xl:col-span-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem label="Banco" value={banco?.nombre || '-'} />
                  <DataItem label="Código banco" value={banco?.codigo || '-'} />
                  <DataItem label="Tarjeta" value={tarjetaTexto} />
                  <DataItem
                    label="Confirmó crédito"
                    value={
                      Number(row?.confirmo_tarjeta_credito) === 1 ? 'Sí' : 'No'
                    }
                  />
                </div>
              </DataCard>

              <DataCard
                icon={BadgeDollarSign}
                title="Plan y beneficio"
                className="xl:col-span-4"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem
                    label="Plan titular"
                    value={planTitular?.nombre || '-'}
                  />
                  <DataItem
                    label="Monto base vigente"
                    value={formatCurrency(row?.monto_base_vigente, row?.moneda)}
                  />
                  <DataItem label="Moneda" value={row?.moneda || 'ARS'} />
                  <DataItem
                    label="Pagos cobrados"
                    value={String(row?.pagos_cobrados ?? 0)}
                  />
                </div>

                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Beneficio
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                    {beneficioTexto}
                  </p>
                </div>
              </DataCard>

              <DataCard
                icon={CalendarDays}
                title="Fechas clave"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DataItem
                    label="Fecha de alta"
                    value={formatDateTime(
                      solicitud?.created_at || row?.created_at
                    )}
                  />
                  <DataItem
                    label="Fecha aprobación"
                    value={formatDateTime(row?.fecha_aprobacion)}
                  />
                  <DataItem
                    label="Inicio cobro"
                    value={formatDate(row?.fecha_inicio_cobro)}
                  />
                  <DataItem
                    label="Mes inicio"
                    value={formatMonthYear(row?.fecha_inicio_cobro)}
                  />
                  <DataItem
                    label="Fecha baja"
                    value={formatDate(row?.fecha_baja)}
                  />
                  <DataItem
                    label="Última actualización"
                    value={formatDateTime(row?.updated_at)}
                  />
                </div>
              </DataCard>

              <DataCard
                icon={FileText}
                title="Observaciones y origen"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DataItem
                    label="Canal origen"
                    value={solicitud?.canal_origen || '-'}
                  />
                  <DataItem
                    label="Rol carga origen"
                    value={solicitud?.rol_carga_origen || '-'}
                  />
                </div>

                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    Observaciones internas
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-800 whitespace-pre-wrap">
                    {observaciones}
                  </p>
                </div>
              </DataCard>

              <DataCard
                icon={Users}
                title="Persona adicional"
                className="xl:col-span-6"
              >
                {adicional ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <DataItem label="Nombre" value={adicional?.nombre} />
                    <DataItem label="DNI" value={adicional?.dni} />
                    <DataItem
                      label="Plan"
                      value={
                        adicional?.plan?.nombre ||
                        adicional?.plan_nombre ||
                        adicional?.plan_id ||
                        '-'
                      }
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    Este cliente no tiene persona adicional asociada.
                  </div>
                )}
              </DataCard>

              <DataCard
                icon={History}
                title="Último período"
                className="xl:col-span-6"
              >
                {ultimoPeriodo ? (
                  <>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Badge state={ultimoPeriodo?.estado_cobro}>
                        {String(ultimoPeriodo?.estado_cobro || '-').replaceAll(
                          '_',
                          ' '
                        )}
                      </Badge>
                      <Badge state={ultimoPeriodo?.estado_envio}>
                        {String(ultimoPeriodo?.estado_envio || '-').replaceAll(
                          '_',
                          ' '
                        )}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <DataItem
                        label="Período"
                        value={`${ultimoPeriodo?.periodo_mes}/${ultimoPeriodo?.periodo_anio}`}
                      />
                      <DataItem
                        label="Acción requerida"
                        value={String(
                          ultimoPeriodo?.accion_requerida || '-'
                        ).replaceAll('_', ' ')}
                      />
                      <DataItem
                        label="Monto bruto"
                        value={formatCurrency(
                          ultimoPeriodo?.monto_bruto,
                          row?.moneda
                        )}
                      />
                      <DataItem
                        label="Descuento off"
                        value={`${ultimoPeriodo?.descuento_off_pct_aplicado || 0}%`}
                      />
                      <DataItem
                        label="Reintegro"
                        value={`${ultimoPeriodo?.reintegro_pct_aplicado || 0}%`}
                      />
                      <DataItem
                        label="Monto neto estimado"
                        value={formatCurrency(
                          ultimoPeriodo?.monto_neto_estimado,
                          row?.moneda
                        )}
                      />
                      <DataItem
                        label="Fecha envío"
                        value={formatDate(ultimoPeriodo?.fecha_envio)}
                      />
                      <DataItem
                        label="Fecha resultado"
                        value={formatDate(ultimoPeriodo?.fecha_resultado)}
                      />
                      <DataItem
                        label="Motivo código"
                        value={ultimoPeriodo?.motivo_codigo || '-'}
                      />
                    </div>

                    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                        Observaciones del período
                      </p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800 whitespace-pre-wrap">
                        {ultimoPeriodo?.observaciones ||
                          ultimoPeriodo?.motivo_detalle ||
                          '-'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    No hay períodos cargados para este cliente.
                  </div>
                )}
              </DataCard>

              <DataCard
                icon={ShieldCheck}
                title="Términos y aceptación"
                className="xl:col-span-12"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <DataItem
                    label="Términos aceptados"
                    value={
                      Number(solicitud?.terminos_aceptados) === 1 ? 'Sí' : 'No'
                    }
                  />
                  <DataItem
                    label="Aceptados el"
                    value={formatDateTime(solicitud?.terminos_aceptados_at)}
                  />
                  <DataItem label="IP" value={solicitud?.terminos_ip || '-'} />
                  <DataItem
                    label="Términos ID"
                    value={solicitud?.terminos_id || '-'}
                  />
                </div>

                <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    User agent
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-800 break-all">
                    {solicitud?.terminos_user_agent || '-'}
                  </p>
                </div>
              </DataCard>

              <DataCard
                icon={CircleDollarSign}
                title="Resumen rápido"
                className="xl:col-span-12"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  <DataItem
                    label="Estado general"
                    value={String(row?.estado_general || '-').replaceAll(
                      '_',
                      ' '
                    )}
                  />
                  <DataItem label="Banco" value={banco?.nombre || '-'} />
                  <DataItem label="Plan" value={planTitular?.nombre || '-'} />
                  <DataItem
                    label="Monto"
                    value={formatCurrency(row?.monto_base_vigente, row?.moneda)}
                  />
                  <DataItem
                    label="Pagos cobrados"
                    value={String(row?.pagos_cobrados ?? 0)}
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

              {typeof onGoToPeriodos === 'function' && (
                <button
                  type="button"
                  onClick={() => onGoToPeriodos(row)}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600"
                >
                  <ArrowRightCircle className="h-4 w-4" />
                  Ir a períodos
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalClienteDetalle;
