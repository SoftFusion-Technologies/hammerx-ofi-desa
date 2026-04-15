/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.3
 *
 * Descripción:
 * Modal de alta / edición de planes del módulo Débitos Automáticos.
 * Permite gestionar código, nombre, descripción, estado y orden visual.
 *
 * Tema: Frontend - Débitos Automáticos - Formulario de Planes
 * Capa: Frontend
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Layers3,
  Hash,
  BadgeCheck,
  FileText,
  ArrowDownWideNarrow,
  Sparkles
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
  codigo: '',
  nombre: '',
  descripcion: '',
  activo: true,
  orden_visual: '0'
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

const validateForm = (form) => {
  if (!form.codigo.trim()) {
    return 'El código es obligatorio.';
  }

  if (!form.nombre.trim()) {
    return 'El nombre es obligatorio.';
  }

  const ordenVisual = toIntOrNull(form.orden_visual);
  if (ordenVisual === null) {
    return 'El orden visual debe ser un número entero.';
  }

  return '';
};

/* Benjamin Orellana - 2026/04/15 - El payload del plan queda reducido al catálogo base, ya que los precios y valores comerciales se administran por sede en otra tabla. */
const getPayloadFromForm = (form) => {
  return {
    codigo: form.codigo.trim().toUpperCase(),
    nombre: form.nombre.trim(),
    descripcion: form.descripcion.trim() || null,
    activo: form.activo ? 1 : 0,
    orden_visual: toIntOrNull(form.orden_visual) ?? 0
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

export default function PlanFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEdit = !!initial?.id;
  const titleId = 'debito-plan-form-title';

  useEffect(() => {
    if (!open) return;

    setSaving(false);
    setErrorMsg('');

    setForm({
      codigo: initial?.codigo || '',
      nombre: initial?.nombre || '',
      descripcion: initial?.descripcion || '',
      activo:
        initial?.activo === 1 ||
        initial?.activo === true ||
        initial?.activo === '1',
      orden_visual: toText(initial?.orden_visual ?? 0)
    });
  }, [open, initial]);

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
        'No se pudo guardar el plan.';
      setErrorMsg(backendMessage);
    } finally {
      setSaving(false);
    }
  };

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
            className="relative w-full max-w-[96vw] sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-[30px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
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
                  <Layers3 className="h-7 w-7" />
                </div>

                <div className="pr-10">
                  <h3
                    id={titleId}
                    className="font-bignoodle text-xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                  >
                    {isEdit ? 'Editar plan' : 'Nuevo plan'}
                  </h3>
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
                      Datos principales
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Hash className="h-4 w-4 text-orange-500" />
                        Código <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="codigo"
                        value={form.codigo}
                        onChange={handleChange}
                        placeholder="Ej: PLAN_BASE"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Layers3 className="h-4 w-4 text-orange-500" />
                        Nombre <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Plan full"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <FileText className="h-4 w-4 text-orange-500" />
                      Descripción
                    </label>
                    <textarea
                      rows={4}
                      name="descripcion"
                      value={form.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción opcional del plan..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="plan-activo"
                      className="inline-flex cursor-pointer items-center gap-3"
                    >
                      <input
                        id="plan-activo"
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

                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
                  <div className="mb-4 flex items-center gap-2">
                    <ArrowDownWideNarrow className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Orden y estructura del catálogo
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ArrowDownWideNarrow className="h-4 w-4 text-orange-500" />
                        Orden visual
                      </label>
                      <input
                        type="number"
                        step="1"
                        name="orden_visual"
                        value={form.orden_visual}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    {/* <StatPreviewCard
                      icon={Hash}
                      label="Código normalizado"
                      value={
                        form.codigo?.trim()
                          ? form.codigo.trim().toUpperCase()
                          : '-'
                      }
                      tone="slate"
                    /> */}
{/* 
                    <StatPreviewCard
                      icon={BadgeCheck}
                      label="Estado"
                      value={form.activo ? 'Activo' : 'Inactivo'}
                      tone={form.activo ? 'emerald' : 'orange'}
                    /> */}
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
                      : isEdit
                        ? 'Guardar cambios'
                        : 'Crear plan'}
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
