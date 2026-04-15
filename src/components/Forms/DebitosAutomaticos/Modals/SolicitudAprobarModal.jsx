import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  BadgeCheck,
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
  return String(raw).replace(',', '.').trim();
};

const parseNullableNumber = (value) => {
  const normalized = normalizeMontoInput(value);
  if (normalized === '') return null;

  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
};

const toInputNumberString = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Number(n.toFixed(2)));
};

const calculateMontoBase = (montoInicial, descuento) => {
  const monto = Number(montoInicial);
  const desc = Number(descuento);

  if (!Number.isFinite(monto) || !Number.isFinite(desc)) return null;

  const montoSeguro = Math.max(monto, 0);
  const descuentoSeguro = Math.min(Math.max(desc, 0), 100);

  return Number(
    (montoSeguro - (montoSeguro * descuentoSeguro) / 100).toFixed(2)
  );
};

const isValidPositiveAmount = (value) => {
  const n = parseNullableNumber(value);
  return n !== null && n > 0;
};

const isValidDiscount = (value) => {
  const n = parseNullableNumber(value);
  return n !== null && n >= 0 && n <= 100;
};

/* Benjamin Orellana - 2026/04/15 - Resuelve el plan efectivo de la solicitud para buscar su configuración comercial por sede en aprobación. */
const resolvePlanIdFromSolicitud = (solicitud) => {
  if (!solicitud) return null;

  if (
    solicitud.modalidad_adhesion === 'TITULAR_SOLO' ||
    solicitud.modalidad_adhesion === 'AMBOS'
  ) {
    return Number(solicitud.titular_plan_id) || null;
  }

  if (solicitud.modalidad_adhesion === 'SOLO_ADICIONAL') {
    return Number(solicitud?.adicional?.plan_id) || null;
  }

  return null;
};

/* Benjamin Orellana - 09/04/2026 - Resuelve automáticamente el plan a utilizar según la modalidad de adhesión de la solicitud */
const resolvePlanFromSolicitud = (solicitud) => {
  if (!solicitud) {
    return {
      plan: null,
      source: null,
      warning: ''
    };
  }

  const modalidad = solicitud?.modalidad_adhesion;

  if (modalidad === 'TITULAR_SOLO' || modalidad === 'AMBOS') {
    if (solicitud?.plan_titular) {
      return {
        plan: solicitud.plan_titular,
        source: 'titular',
        warning: ''
      };
    }

    return {
      plan: null,
      source: 'titular',
      warning:
        'No se encontró el plan del titular para esta solicitud. Completá manualmente los campos comerciales.'
    };
  }

  if (modalidad === 'SOLO_ADICIONAL') {
    if (solicitud?.adicional?.plan) {
      return {
        plan: solicitud.adicional.plan,
        source: 'adicional',
        warning: ''
      };
    }

    return {
      plan: null,
      source: 'adicional',
      warning:
        'No se encontró el plan del adicional para esta solicitud. Completá manualmente los campos comerciales.'
    };
  }

  return {
    plan: null,
    source: null,
    warning:
      'No se pudo resolver el plan de la solicitud. Completá manualmente los campos comerciales.'
  };
};

/* Benjamin Orellana - 09/04/2026 - Obtiene valores iniciales del bloque comercial a partir del plan resuelto */
const buildCommercialDefaultsFromPlan = (plan) => {
  if (!plan) {
    return {
      monto_inicial_vigente: '',
      descuento_vigente: '',
      monto_base_vigente: ''
    };
  }

  const precioReferencia = parseNullableNumber(plan?.precio_referencia);
  const descuento = parseNullableNumber(plan?.descuento);
  const precioFinal = parseNullableNumber(plan?.precio_final);

  const descuentoResolved = descuento ?? 0;
  const precioFinalCalculado =
    precioReferencia !== null
      ? calculateMontoBase(precioReferencia, descuentoResolved)
      : null;

  return {
    monto_inicial_vigente:
      precioReferencia !== null ? toInputNumberString(precioReferencia) : '',
    descuento_vigente: toInputNumberString(descuentoResolved),
    monto_base_vigente:
      precioFinal !== null
        ? toInputNumberString(precioFinal)
        : precioFinalCalculado !== null
          ? toInputNumberString(precioFinalCalculado)
          : ''
  };
};

const buildTitlePlan = (solicitud) => {
  const resolved = resolvePlanFromSolicitud(solicitud);
  return resolved?.plan?.nombre || '—';
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
  monto_inicial_vigente: '',
  descuento_vigente: '',
  monto_base_vigente: '',
  fecha_aprobacion: buildTodayDateInput(),
  fecha_inicio_cobro: buildNextMonthInput(),
  especial: '',
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
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resolvedPlan = useMemo(
    () => resolvePlanFromSolicitud(solicitud),
    [solicitud]
  );

  const titularPlanLabel = useMemo(
    () => buildTitlePlan(solicitud),
    [solicitud]
  );

  useEffect(() => {
    if (!open || !solicitud) return;

    let active = true;

    /* Benjamin Orellana - 2026/04/15 - El modal de aprobación precarga el precio base desde plan+sede y el descuento desde el snapshot del banco para reflejar correctamente la nueva arquitectura comercial. */
    const hydrateCommercialDefaults = async () => {
      try {
        const planId = resolvePlanIdFromSolicitud(solicitud);
        const sedeId = Number(solicitud?.sede_id) || null;
        const descuentoBanco = parseNullableNumber(
          solicitud?.beneficio_descuento_off_pct_snapshot
        );

        let precioBase = null;

        if (planId && sedeId) {
          const res = await axios.get(
            `${apiBaseUrl}/debitos-automaticos-planes-sedes`,
            {
              params: {
                plan_id: planId,
                sede_id: sedeId,
                activo: 1
              }
            }
          );

          const payload = res?.data;
          const registros = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.registros)
              ? payload.registros
              : Array.isArray(payload?.rows)
                ? payload.rows
                : Array.isArray(payload?.data)
                  ? payload.data
                  : [];

          const configuracion = registros[0] || null;
          precioBase = parseNullableNumber(configuracion?.precio_base);
        }

        if (!active) return;

        const descuentoResolved = descuentoBanco !== null ? descuentoBanco : 0;

        const montoBaseCalculado =
          precioBase !== null
            ? calculateMontoBase(precioBase, descuentoResolved)
            : null;

        setErrorMsg('');
        setForm({
          monto_inicial_vigente:
            precioBase !== null ? toInputNumberString(precioBase) : '',
          descuento_vigente: toInputNumberString(descuentoResolved),
          monto_base_vigente:
            montoBaseCalculado !== null
              ? toInputNumberString(montoBaseCalculado)
              : '',
          fecha_aprobacion: buildTodayDateInput(),
          fecha_inicio_cobro: buildNextMonthInput(),
          especial: '',
          observaciones_internas: ''
        });
      } catch (error) {
        if (!active) return;

        const descuentoBanco = parseNullableNumber(
          solicitud?.beneficio_descuento_off_pct_snapshot
        );

        setErrorMsg(
          error?.response?.data?.mensajeError ||
            'No se pudo precargar el precio del plan para la sede seleccionada.'
        );

        setForm({
          monto_inicial_vigente: '',
          descuento_vigente: toInputNumberString(
            descuentoBanco !== null ? descuentoBanco : 0
          ),
          monto_base_vigente: '',
          fecha_aprobacion: buildTodayDateInput(),
          fecha_inicio_cobro: buildNextMonthInput(),
          especial: '',
          observaciones_internas: ''
        });
      }
    };

    hydrateCommercialDefaults();

    return () => {
      active = false;
    };
  }, [open, solicitud, apiBaseUrl]);

  useEffect(() => {
    if (!open) return;

    const montoInicial = parseNullableNumber(form.monto_inicial_vigente);
    const descuento = parseNullableNumber(form.descuento_vigente);

    if (montoInicial === null || descuento === null) {
      setForm((prev) => {
        if (prev.monto_base_vigente === '') return prev;
        return {
          ...prev,
          monto_base_vigente: ''
        };
      });
      return;
    }

    const recalculado = calculateMontoBase(montoInicial, descuento);
    const nextValue =
      recalculado !== null ? toInputNumberString(recalculado) : '';

    setForm((prev) => {
      if (prev.monto_base_vigente === nextValue) return prev;
      return {
        ...prev,
        monto_base_vigente: nextValue
      };
    });
  }, [open, form.monto_inicial_vigente, form.descuento_vigente]);

  /* Benjamin Orellana - 08/04/2026 - La aprobación ya no depende de seleccionar sede en el modal */
  const canSubmit = useMemo(() => {
    return (
      isValidPositiveAmount(form.monto_inicial_vigente) &&
      isValidDiscount(form.descuento_vigente) &&
      isValidPositiveAmount(form.monto_base_vigente) &&
      Boolean(form.fecha_aprobacion) &&
      Boolean(form.fecha_inicio_cobro) &&
      !loadingSubmit
    );
  }, [form, loadingSubmit]);

  /* Benjamin Orellana - 08/04/2026 - Se muestra la sede ya registrada en la solicitud como dato informativo dentro del resumen de aprobación */
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

    if (!isValidPositiveAmount(form.monto_inicial_vigente)) {
      setErrorMsg('Ingresá un monto inicial válido mayor a 0.');
      return;
    }

    if (!isValidDiscount(form.descuento_vigente)) {
      setErrorMsg('Ingresá un descuento válido entre 0 y 100.');
      return;
    }

    if (!isValidPositiveAmount(form.monto_base_vigente)) {
      setErrorMsg('Ingresá un monto base válido mayor a 0.');
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

      /* Benjamin Orellana - 09/04/2026 - Se envían monto inicial, descuento y monto base al aprobar la solicitud */
      const payload = {
        monto_inicial_vigente: Number(
          Number(normalizeMontoInput(form.monto_inicial_vigente)).toFixed(2)
        ),
        descuento_vigente: Number(
          Number(normalizeMontoInput(form.descuento_vigente)).toFixed(2)
        ),
        monto_base_vigente: Number(
          Number(normalizeMontoInput(form.monto_base_vigente)).toFixed(2)
        ),
        fecha_aprobacion: form.fecha_aprobacion,
        fecha_inicio_cobro: form.fecha_inicio_cobro,
        // Benjamin Orellana - 08/04/2026 - Se envía el campo especial opcional al aprobar para persistir promociones puntuales del cliente
        especial: form.especial?.trim() || undefined,
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

                {resolvedPlan?.warning ? (
                  <div className="mt-3 flex items-start gap-3 rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{resolvedPlan.warning}</span>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FieldBlock
                    label="Monto inicial vigente"
                    icon={Wallet}
                    required
                  >
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      value={form.monto_inicial_vigente}
                      onChange={(e) =>
                        handleChange('monto_inicial_vigente', e.target.value)
                      }
                      disabled={loadingSubmit}
                      placeholder="Ej: 70000"
                      className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldBlock>

                  <FieldBlock label="Descuento vigente" icon={Wallet} required>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      inputMode="decimal"
                      value={form.descuento_vigente}
                      onChange={(e) =>
                        handleChange('descuento_vigente', e.target.value)
                      }
                      disabled={loadingSubmit}
                      placeholder="Ej: 10"
                      className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldBlock>

                  <FieldBlock label="Monto base vigente" icon={Wallet} required>
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
                      placeholder="Ej: 63000"
                      className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </FieldBlock>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FieldBlock
                    label="Fecha de Alta"
                    icon={CalendarDays}
                    required
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
                    label="Fecha de Inicio"
                    icon={CalendarDays}
                    required
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

                <FieldBlock label="Especial" icon={Sparkles}>
                  <input
                    type="text"
                    value={form.especial}
                    onChange={(e) => handleChange('especial', e.target.value)}
                    disabled={loadingSubmit}
                    placeholder="Ej: Primer mes $10.000"
                    maxLength={255}
                    className="h-12 w-full rounded-[22px] border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  />
                </FieldBlock>

                <FieldBlock label="Observaciones internas" icon={Sparkles}>
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