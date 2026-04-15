/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 15 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal de alta / edición de precios de planes por sede del módulo
 * Débitos Automáticos. Permite gestionar plan, sede, precio base y estado.
 *
 * Tema: Frontend - Débitos Automáticos - Formulario de Planes por Sede
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Building2,
  Layers3,
  BadgeCheck,
  CircleDollarSign,
  MapPin,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.98,
    transition: { duration: 0.18 }
  }
};

const emptyForm = {
  plan_id: '',
  sede_id: '',
  precio_base: '',
  activo: true
};

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isInteger(num)) return null;
  return num;
};

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const validateForm = (form) => {
  const planId = toIntOrNull(form.plan_id);
  if (!planId) {
    return 'Debes seleccionar un plan.';
  }

  const sedeId = toIntOrNull(form.sede_id);
  if (!sedeId) {
    return 'Debes seleccionar una sede.';
  }

  const precioBase = toNumberOrNull(form.precio_base);
  if (form.precio_base === '' || precioBase === null) {
    return 'El precio base es obligatorio y debe ser numérico.';
  }

  if (precioBase < 0) {
    return 'El precio base no puede ser negativo.';
  }

  return '';
};

/* Benjamin Orellana - 2026/04/15 - El payload se normaliza para trabajar con plan_id, sede_id y precio_base como estructura oficial del nuevo modelo plan+sede. */
const getPayloadFromForm = (form) => {
  return {
    plan_id: toIntOrNull(form.plan_id),
    sede_id: toIntOrNull(form.sede_id),
    precio_base: toNumberOrNull(form.precio_base),
    activo: form.activo ? 1 : 0
  };
};

const StatPreviewCard = ({ icon: Icon, label, value, tone = 'slate' }) => {
  const tones = {
    slate:
      'border-slate-200 bg-white text-slate-900 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.25)]',
    orange:
      'border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 text-slate-900 shadow-[0_14px_30px_-24px_rgba(249,115,22,0.28)]',
    emerald:
      'border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900 shadow-[0_14px_30px_-24px_rgba(16,185,129,0.24)]'
  };

  return (
    <div
      className={`rounded-[22px] border p-4 transition-all duration-200 ${tones[tone] || tones.slate}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-base font-black tracking-[-0.02em] text-slate-900 sm:text-lg">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-700">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
};

export default function PlanSedeFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  planes = [],
  sedes = [],
  registrosExistentes = []
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEdit = !!initial?.id;
  const titleId = 'debito-plan-sede-form-title';

  /* Benjamin Orellana - 2026/04/15 - Se filtran opciones activas y válidas para evitar selección de registros inconsistentes en el formulario. */
  const planesOptions = useMemo(() => {
    return (Array.isArray(planes) ? planes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) =>
        String(a?.nombre || '').localeCompare(String(b?.nombre || ''), 'es')
      );
  }, [planes]);

  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) =>
        String(a?.nombre || '').localeCompare(String(b?.nombre || ''), 'es')
      );
  }, [sedes]);

  useEffect(() => {
    if (!open) return;

    setSaving(false);
    setErrorMsg('');

    setForm({
      plan_id: toText(initial?.plan_id ?? initial?.plan?.id ?? ''),
      sede_id: toText(initial?.sede_id ?? initial?.sede?.id ?? ''),
      precio_base: toText(initial?.precio_base ?? ''),
      activo:
        initial?.activo === undefined
          ? true
          : initial?.activo === 1 ||
            initial?.activo === true ||
            initial?.activo === '1'
    });
  }, [open, initial]);

  const selectedPlan = useMemo(() => {
    const id = toIntOrNull(form.plan_id);
    if (!id) return null;
    return (
      planesOptions.find((item) => Number(item?.id) === Number(id)) || null
    );
  }, [form.plan_id, planesOptions]);

  const selectedSede = useMemo(() => {
    const id = toIntOrNull(form.sede_id);
    if (!id) return null;
    return sedesOptions.find((item) => Number(item?.id) === Number(id)) || null;
  }, [form.sede_id, sedesOptions]);

  /* Benjamin Orellana - 2026/04/15 - Detecta en tiempo real si la combinación plan+sede ya existe para autocompletar el precio y operar el modal también en modo edición desde la vista "Todas las sedes". */
  const registroExistente = useMemo(() => {
    const planId = toIntOrNull(form.plan_id);
    const sedeId = toIntOrNull(form.sede_id);

    if (!planId || !sedeId) return null;

    return (
      (Array.isArray(registrosExistentes) ? registrosExistentes : []).find(
        (item) =>
          Number(item?.plan_id) === Number(planId) &&
          Number(item?.sede_id) === Number(sedeId)
      ) || null
    );
  }, [form.plan_id, form.sede_id, registrosExistentes]);

  /* Benjamin Orellana - 2026/04/15 - Determina si el formulario debe comportarse visualmente como edición según la combinación actualmente elegida, aunque se haya abierto desde "Todas las sedes". */
  const isDynamicEdit = !!(initial?.id || registroExistente?.id);

  const precioBasePreview = useMemo(
    () => toNumberOrNull(form.precio_base),
    [form.precio_base]
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationError = validateForm(form);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload = getPayloadFromForm(form);
      await onSubmit(payload);

      onClose();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo guardar la configuración del plan por sede.';

      setErrorMsg(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  /* Benjamin Orellana - 2026/04/15 - Cuando el usuario cambia plan o sede, se hidrata automáticamente el precio existente de esa combinación para permitir edición inmediata sin depender del tab activo. */
  useEffect(() => {
    if (!open) return;

    const planId = toIntOrNull(form.plan_id);
    const sedeId = toIntOrNull(form.sede_id);

    if (!planId || !sedeId) return;

    if (registroExistente?.id) {
      setForm((prev) => {
        const precioActual = toText(registroExistente?.precio_base);
        const activoActual =
          registroExistente?.activo === 1 ||
          registroExistente?.activo === true ||
          registroExistente?.activo === '1';

        if (prev.precio_base === precioActual && prev.activo === activoActual) {
          return prev;
        }

        return {
          ...prev,
          precio_base: precioActual,
          activo: activoActual
        };
      });

      return;
    }

    if (!initial?.id) {
      setForm((prev) => {
        if (prev.precio_base === '' && prev.activo === true) {
          return prev;
        }

        return {
          ...prev,
          precio_base: '',
          activo: true
        };
      });
    }
  }, [open, form.plan_id, form.sede_id, registroExistente, initial?.id]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px)',
              backgroundSize: '34px 34px'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-[24rem] rounded-full blur-3xl opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(251,146,60,0.14) 35%, transparent 72%)'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 size-[24rem] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(253,186,116,0.12) 35%, transparent 72%)'
            }}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[96vw] sm:max-w-5xl max-h-[92vh] overflow-y-auto rounded-[30px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative z-10 p-5 sm:p-6 md:p-7">
              <div className="mb-6 flex items-start gap-4 rounded-[24px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 ring-1 ring-orange-200">
                  <Building2 className="h-7 w-7" />
                </div>

                <div className="pr-10">
                  <h3
                    id={titleId}
                    className="font-bignoodle text-xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                  >
                    {isDynamicEdit
                      ? 'Editar precio de plan por sede'
                      : 'Nuevo precio de plan por sede'}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {isDynamicEdit
                      ? 'Estás editando una configuración existente de precio base por sede. El beneficio del banco se calcula después, fuera de esta configuración.'
                      : 'Definí el precio base de un plan para una sede específica. El beneficio del banco se calcula después, fuera de esta configuración.'}
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Configuración principal
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Layers3 className="h-4 w-4 text-orange-500" />
                        Plan <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="plan_id"
                        value={form.plan_id}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="">Seleccionar plan</option>
                        {planesOptions.map((plan) => (
                          <option key={plan.id} value={plan.id}>
                            {plan.nombre}{' '}
                            {plan.codigo ? `(${plan.codigo})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        Sede <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="sede_id"
                        value={form.sede_id}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="">Seleccionar sede</option>
                        {sedesOptions.map((sede) => (
                          <option key={sede.id} value={sede.id}>
                            {sede.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CircleDollarSign className="h-4 w-4 text-orange-500" />
                        Precio base <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        name="precio_base"
                        value={form.precio_base}
                        onChange={handleChange}
                        placeholder="Ej: 70000"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <label
                        htmlFor="plan-sede-activo"
                        className="inline-flex cursor-pointer items-center gap-3"
                      >
                        <input
                          id="plan-sede-activo"
                          type="checkbox"
                          name="activo"
                          checked={!!form.activo}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition peer-checked:bg-orange-500">
                          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          Activo
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      isDynamicEdit
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-orange-200 bg-orange-50 text-orange-700'
                    }`}
                  >
                    {isDynamicEdit
                      ? 'La combinación plan + sede ya existe y se editará'
                      : 'La combinación plan + sede es nueva y se creará'}
                  </span>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Vista previa de la configuración
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <StatPreviewCard
                      icon={Layers3}
                      label="Plan seleccionado"
                      value={selectedPlan?.nombre || '-'}
                      tone="slate"
                    />
                    <StatPreviewCard
                      icon={MapPin}
                      label="Sede seleccionada"
                      value={selectedSede?.nombre || '-'}
                      tone="orange"
                    />
                    <StatPreviewCard
                      icon={CircleDollarSign}
                      label="Precio base"
                      value={formatMoney(precioBasePreview)}
                      tone="emerald"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving
                      ? 'Guardando...'
                      : isDynamicEdit
                        ? 'Guardar cambios'
                        : 'Crear configuración'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
