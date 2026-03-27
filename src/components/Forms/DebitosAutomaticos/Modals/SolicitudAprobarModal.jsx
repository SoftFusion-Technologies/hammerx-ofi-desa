import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Sparkles,
  Wallet,
  X,
  User2
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 26 / 03 / 2026
 * Versión: 2.0
 *
 * Descripción:
 * Rediseño minimalista y responsive del modal para aprobar solicitudes
 * de débito automático. Se simplifica la jerarquía visual para dejar
 * foco en los datos clave de aprobación y evitar una UI recargada.
 *
 * Tema: Aprobación de solicitudes - Débitos Automáticos
 * Capa: Frontend
 */

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
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    y: 14,
    scale: 0.985,
    transition: { duration: 0.16, ease: 'easeInOut' }
  }
};

const buildTodayDateInput = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const buildNextMonthInput = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const y = next.getFullYear();
  const m = String(next.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const buildCurrentMonthInput = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

const formatDateAR = (value) => {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatCurrencyARS = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '—';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(n);
};

const monthInputToLabel = (value) => {
  if (!value) return '—';

  const [year, month] = String(value).split('-');
  if (!year || !month) return '—';

  const date = new Date(Number(year), Number(month) - 1, 1);

  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(date);
};

const normalizeMontoInput = (raw) => {
  if (raw === undefined || raw === null) return '';
  return String(raw).replace(',', '.');
};

const isValidPositiveAmount = (value) => {
  const n = Number(normalizeMontoInput(value));
  return Number.isFinite(n) && n > 0;
};

const buildTitlePlan = (solicitud) => {
  if (!solicitud) return '—';

  if (solicitud?.plan_titular?.nombre) return solicitud.plan_titular.nombre;
  if (solicitud?.adicional?.plan?.nombre)
    return solicitud.adicional.plan.nombre;

  return '—';
};

const buildTarjetaLabel = (solicitud) => {
  const marca = solicitud?.marca_tarjeta || '—';
  const mascara =
    solicitud?.tarjeta_numero_completo ||
    solicitud?.tarjeta_mascara ||
    solicitud?.tarjeta_ultimos4 ||
    '—';

  return `${marca} · ${mascara}`;
};

const emptyForm = {
  sede_id: '',
  monto_base_vigente: '',
  fecha_aprobacion: buildTodayDateInput(),
  fecha_inicio_cobro: buildNextMonthInput(),
  observaciones_internas: ''
};

export default function SolicitudAprobarModal({
  open,
  solicitud,
  onClose,
  onApproved,
  apiBaseUrl = 'http://localhost:8080'
}) {
  const [form, setForm] = useState(emptyForm);
  const [sedes, setSedes] = useState([]);
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!open || !solicitud) return;

    setErrorMsg('');
    setForm({
      sede_id: '',
      monto_base_vigente: '',
      fecha_aprobacion: buildTodayDateInput(),
      fecha_inicio_cobro: buildNextMonthInput(),
      observaciones_internas: ''
    });
  }, [open, solicitud]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    const fetchSedes = async () => {
      try {
        setLoadingSedes(true);

        const response = await axios.get(`${apiBaseUrl}/sedes`, {
          params: { es_ciudad: true }
        });

        if (!active) return;

        const raw = Array.isArray(response.data) ? response.data : [];

        const filtered = raw.filter(
          (sede) =>
            sede &&
            sede.es_ciudad === true &&
            String(sede.estado || '').toLowerCase() === 'activo' &&
            String(sede.nombre || '')
              .trim()
              .toLowerCase() !== 'multisede'
        );

        setSedes(filtered);
      } catch (error) {
        if (!active) return;
        setSedes([]);
        setErrorMsg(
          error?.response?.data?.mensajeError ||
            'No se pudieron cargar las sedes.'
        );
      } finally {
        if (active) setLoadingSedes(false);
      }
    };

    fetchSedes();

    return () => {
      active = false;
    };
  }, [open, apiBaseUrl]);

  const titularPlanLabel = useMemo(
    () => buildTitlePlan(solicitud),
    [solicitud]
  );

  const selectedSede = useMemo(() => {
    return sedes.find((s) => Number(s.id) === Number(form.sede_id)) || null;
  }, [sedes, form.sede_id]);

  const canSubmit = useMemo(() => {
    return (
      Number(form.sede_id) > 0 &&
      isValidPositiveAmount(form.monto_base_vigente) &&
      Boolean(form.fecha_aprobacion) &&
      Boolean(form.fecha_inicio_cobro) &&
      !loadingSubmit
    );
  }, [form, loadingSubmit]);

  const summaryItems = useMemo(() => {
    if (!solicitud) return [];

    return [
      {
        icon: User2,
        label: 'Titular',
        value: solicitud?.titular_nombre || '—'
      },
      {
        icon: BadgeCheck,
        label: 'DNI',
        value: solicitud?.titular_dni || '—'
      },
      {
        icon: CreditCard,
        label: 'Plan',
        value: titularPlanLabel
      },
      {
        icon: Landmark,
        label: 'Banco',
        value: solicitud?.banco?.nombre || '—'
      },
      {
        icon: CreditCard,
        label: 'Tarjeta',
        value: buildTarjetaLabel(solicitud)
      },
      {
        icon: CalendarDays,
        label: 'Alta',
        value: formatDateAR(solicitud?.created_at)
      }
    ];
  }, [solicitud, titularPlanLabel]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));

    if (errorMsg) setErrorMsg('');
  };

  const handleClose = () => {
    if (loadingSubmit) return;
    setErrorMsg('');
    onClose?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!solicitud?.id) {
      setErrorMsg('No se encontró la solicitud a aprobar.');
      return;
    }

    if (!Number(form.sede_id)) {
      setErrorMsg('Seleccioná una sede.');
      return;
    }

    if (!isValidPositiveAmount(form.monto_base_vigente)) {
      setErrorMsg('Ingresá un monto válido mayor a 0.');
      return;
    }

    if (!form.fecha_aprobacion) {
      setErrorMsg('La fecha de aprobación es obligatoria.');
      return;
    }

    if (!form.fecha_inicio_cobro) {
      setErrorMsg('El mes de inicio es obligatorio.');
      return;
    }

    try {
      setLoadingSubmit(true);
      setErrorMsg('');

      const payload = {
        sede_id: Number(form.sede_id),
        monto_base_vigente: Number(
          Number(normalizeMontoInput(form.monto_base_vigente)).toFixed(2)
        ),
        fecha_aprobacion: form.fecha_aprobacion,
        fecha_inicio_cobro: form.fecha_inicio_cobro,
        observaciones_internas: form.observaciones_internas?.trim() || undefined
      };

      const response = await axios.put(
        `${apiBaseUrl}/debitos-automaticos-solicitudes/${solicitud.id}/aprobar`,
        payload
      );

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud aprobada',
        text: 'La solicitud fue aprobada y ya pasó a clientes adheridos.',
        confirmButtonColor: '#ea580c'
      });

      onApproved?.(response.data);
      onClose?.();
    } catch (error) {
      const message =
        error?.response?.data?.mensajeError ||
        'No se pudo aprobar la solicitud.';

      setErrorMsg(message);

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo aprobar',
        text: message,
        confirmButtonColor: '#ea580c'
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!open || !solicitud) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          type="button"
          aria-label="Cerrar modal"
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[3px]"
          onClick={handleClose}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-[121] flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[28px] border border-white/15 bg-white shadow-[0_28px_80px_-28px_rgba(15,23,42,0.45)] sm:rounded-[30px]"
        >
          <div className="relative border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 px-4 py-4 sm:px-6 sm:py-5">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-orange-200/30 blur-3xl" />

            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  Aprobar solicitud
                </div>

                <h3 className="font-bignoodle text-lg font-extrabold tracking-[-0.02em] text-slate-900 sm:text-3xl">
                  Confirmar alta de débito automático
                </h3>
              </div>

              <button
                type="button"
                onClick={handleClose}
                disabled={loadingSubmit}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-3 sm:p-4">
                <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  Solicitud seleccionada
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {summaryItems.map((item) => (
                    <SummaryInline
                      key={item.label}
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                    />
                  ))}
                </div>

                {solicitud?.adicional && (
                  <div className="mt-3 rounded-2xl border border-orange-100 bg-white px-3 py-3 text-sm text-slate-700">
                    <span className="font-bold text-orange-700">
                      Adicional:
                    </span>{' '}
                    {solicitud.adicional.nombre || '—'} · DNI{' '}
                    {solicitud.adicional.dni || '—'}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <FieldBlock
                  label="Sede"
                  icon={Building2}
                  required
                >
                  <select
                    value={form.sede_id}
                    onChange={(e) => handleChange('sede_id', e.target.value)}
                    disabled={loadingSubmit || loadingSedes}
                    className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">
                      {loadingSedes ? 'Cargando sedes...' : 'Seleccionar sede'}
                    </option>

                    {sedes.map((sede) => (
                      <option key={sede.id} value={sede.id}>
                        {sede.nombre}
                      </option>
                    ))}
                  </select>
                </FieldBlock>

                <FieldBlock
                  label="Monto del plan"
                  icon={Wallet}
                  required
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    value={form.monto_base_vigente}
                    onChange={(e) =>
                      handleChange('monto_base_vigente', e.target.value)
                    }
                    disabled={loadingSubmit}
                    placeholder="Ej: 40000"
                    className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </FieldBlock>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldBlock
                    label="Fecha de aprobación"
                    icon={CalendarDays}
                    required
                    // helper="Fecha operativa del alta."
                  >
                    <input
                      type="date"
                      value={form.fecha_aprobacion}
                      onChange={(e) =>
                        handleChange('fecha_aprobacion', e.target.value)
                      }
                      disabled={loadingSubmit}
                      className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldBlock>

                  <FieldBlock
                    label="Inicio de cobro"
                    icon={CalendarDays}
                    required
                    // helper="Primer mes que se crea para cobrar."
                  >
                    <input
                      type="month"
                      value={form.fecha_inicio_cobro}
                      onChange={(e) =>
                        handleChange('fecha_inicio_cobro', e.target.value)
                      }
                      disabled={loadingSubmit}
                      className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldBlock>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleChange(
                        'fecha_inicio_cobro',
                        buildCurrentMonthInput()
                      )
                    }
                    disabled={loadingSubmit}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition-all duration-200 hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Mes actual
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleChange('fecha_inicio_cobro', buildNextMonthInput())
                    }
                    disabled={loadingSubmit}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-700 transition-all duration-200 hover:border-orange-200 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Próximo mes
                  </button>
                </div>

                <FieldBlock
                  label="Observaciones internas"
                  icon={Sparkles}
                >
                  <textarea
                    rows={4}
                    value={form.observaciones_internas}
                    onChange={(e) =>
                      handleChange('observaciones_internas', e.target.value)
                    }
                    disabled={loadingSubmit}
                    placeholder="Ej: cliente confirmado por administración, alta manual, inicio especial este mes..."
                    className="w-full resize-y rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </FieldBlock>
              </div>
              {errorMsg && (
                <div className="flex items-start gap-3 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loadingSubmit}
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-600 bg-emerald-600 px-5 text-sm font-bold text-white transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:border-emerald-300 disabled:bg-emerald-300"
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aprobando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Confirmar aprobación
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function FieldBlock({ label, icon: Icon, required = false, helper, children }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
        <label className="text-sm font-bold text-slate-800">{label}</label>

        {required ? (
          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-orange-700">
            Obligatorio
          </span>
        ) : null}
      </div>

      {children}

      {helper ? (
        <p className="text-xs leading-5 text-slate-500">{helper}</p>
      ) : null}
    </div>
  );
}

function SummaryInline({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <div className="flex items-start gap-2.5">
        {Icon ? (
          <div className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}

        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
            {label}
          </div>
          <div className="mt-1 break-words text-sm font-semibold text-slate-800">
            {value || '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPreview({ label, value }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value || '—'}
      </div>
    </div>
  );
}
