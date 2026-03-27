import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Landmark,
  Hash,
  BadgeCheck,
  Percent,
  CalendarRange,
  FileText,
  ShieldCheck,
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
  activo: true,
  descuento_off_pct: '25',
  reintegro_pct: '0',
  reintegro_desde_mes: '',
  reintegro_duracion_meses: '',
  beneficio_permanente: true,
  descripcion_publica: ''
};

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isInteger(num)) return null;
  return num;
};

const formatPct = (value) => {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return '0';
  return Number.isInteger(n) ? String(n) : n.toFixed(2);
};

const buildDescripcionAutomatica = ({
  descuento_off_pct,
  reintegro_pct,
  reintegro_desde_mes,
  reintegro_duracion_meses,
  beneficio_permanente
}) => {
  const off = Number(descuento_off_pct || 0);
  const reintegro = Number(reintegro_pct || 0);
  const desdeMes = reintegro_desde_mes;
  const duracion = reintegro_duracion_meses;
  const permanente = !!beneficio_permanente;

  if (off > 0 && reintegro <= 0 && permanente) {
    return `${formatPct(off)}% off (permanente)`;
  }

  if (off > 0 && reintegro > 0 && desdeMes && duracion) {
    return `${formatPct(off)}% off + ${formatPct(
      reintegro
    )}% de reintegro a partir del mes ${desdeMes} durante ${duracion} meses.`;
  }

  if (off > 0 && reintegro > 0 && desdeMes) {
    return `${formatPct(off)}% off + ${formatPct(
      reintegro
    )}% de reintegro a partir del mes ${desdeMes}.`;
  }

  if (off > 0 && reintegro > 0) {
    return `${formatPct(off)}% off + ${formatPct(reintegro)}% de reintegro.`;
  }

  if (off > 0) {
    return `${formatPct(off)}% off`;
  }

  if (reintegro > 0) {
    return `${formatPct(reintegro)}% de reintegro`;
  }

  return 'Beneficio bancario disponible';
};

const getPayloadFromForm = (form) => {
  const descuento = toNumberOrNull(form.descuento_off_pct);
  const reintegro = toNumberOrNull(form.reintegro_pct);
  const reintegroDesdeMes = toIntOrNull(form.reintegro_desde_mes);
  const reintegroDuracionMeses = toIntOrNull(form.reintegro_duracion_meses);

  const descripcionManual = form.descripcion_publica.trim();

  const payload = {
    codigo: form.codigo.trim().toUpperCase(),
    nombre: form.nombre.trim(),
    activo: form.activo ? 1 : 0,
    descuento_off_pct: descuento ?? 0,
    reintegro_pct: reintegro ?? 0,
    reintegro_desde_mes: reintegroDesdeMes,
    reintegro_duracion_meses: reintegroDuracionMeses,
    beneficio_permanente: form.beneficio_permanente ? 1 : 0,
    descripcion_publica:
      descripcionManual ||
      buildDescripcionAutomatica({
        descuento_off_pct: descuento ?? 0,
        reintegro_pct: reintegro ?? 0,
        reintegro_desde_mes: reintegroDesdeMes,
        reintegro_duracion_meses: reintegroDuracionMeses,
        beneficio_permanente: form.beneficio_permanente
      })
  };

  return payload;
};

const validateForm = (form) => {
  if (!form.codigo.trim()) {
    return 'El código es obligatorio.';
  }

  if (!form.nombre.trim()) {
    return 'El nombre es obligatorio.';
  }

  const descuento = toNumberOrNull(form.descuento_off_pct);
  if (descuento === null) {
    return 'El descuento off debe ser numérico.';
  }
  if (descuento < 0 || descuento > 100) {
    return 'El descuento off debe estar entre 0 y 100.';
  }

  const reintegro = toNumberOrNull(form.reintegro_pct);
  if (reintegro === null) {
    return 'El reintegro debe ser numérico.';
  }
  if (reintegro < 0 || reintegro > 100) {
    return 'El reintegro debe estar entre 0 y 100.';
  }

  if (
    form.reintegro_desde_mes !== '' &&
    (toIntOrNull(form.reintegro_desde_mes) === null ||
      toIntOrNull(form.reintegro_desde_mes) < 1)
  ) {
    return 'Reintegro desde mes debe ser un entero mayor o igual a 1.';
  }

  if (
    form.reintegro_duracion_meses !== '' &&
    (toIntOrNull(form.reintegro_duracion_meses) === null ||
      toIntOrNull(form.reintegro_duracion_meses) < 1)
  ) {
    return 'Duración del reintegro debe ser un entero mayor o igual a 1.';
  }

  return '';
};

export default function BancoFormModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isEdit = !!initial?.id;
  const titleId = 'debito-banco-form-title';
  const formId = 'debito-banco-form';

  useEffect(() => {
    if (!open) return;

    setErrorMsg('');
    setSaving(false);

    setForm({
      codigo: initial?.codigo || '',
      nombre: initial?.nombre || '',
      activo:
        initial?.activo === 1 ||
        initial?.activo === true ||
        initial?.activo === '1',
      descuento_off_pct: toText(initial?.descuento_off_pct ?? 25),
      reintegro_pct: toText(initial?.reintegro_pct ?? 0),
      reintegro_desde_mes: toText(initial?.reintegro_desde_mes),
      reintegro_duracion_meses: toText(initial?.reintegro_duracion_meses),
      beneficio_permanente:
        initial?.beneficio_permanente === 1 ||
        initial?.beneficio_permanente === true ||
        initial?.beneficio_permanente === '1',
      descripcion_publica: initial?.descripcion_publica || ''
    });
  }, [open, initial]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const descripcionPreview = useMemo(() => {
    if (form.descripcion_publica.trim()) return form.descripcion_publica.trim();

    return buildDescripcionAutomatica({
      descuento_off_pct: toNumberOrNull(form.descuento_off_pct) ?? 0,
      reintegro_pct: toNumberOrNull(form.reintegro_pct) ?? 0,
      reintegro_desde_mes: toIntOrNull(form.reintegro_desde_mes),
      reintegro_duracion_meses: toIntOrNull(form.reintegro_duracion_meses),
      beneficio_permanente: form.beneficio_permanente
    });
  }, [form]);

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
        'No se pudo guardar el banco.';
      setErrorMsg(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const autocompletarDescripcion = () => {
    setForm((prev) => ({
      ...prev,
      descripcion_publica: buildDescripcionAutomatica({
        descuento_off_pct: toNumberOrNull(prev.descuento_off_pct) ?? 0,
        reintegro_pct: toNumberOrNull(prev.reintegro_pct) ?? 0,
        reintegro_desde_mes: toIntOrNull(prev.reintegro_desde_mes),
        reintegro_duracion_meses: toIntOrNull(prev.reintegro_duracion_meses),
        beneficio_permanente: prev.beneficio_permanente
      })
    }));
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
            className="relative w-full max-w-[96vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
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
                  <Landmark className="h-7 w-7" />
                </div>

                <div className="pr-10">
                  <h3
                    id={titleId}
                    className="text-xl font-bignoodle sm:text-2xl font-bold tracking-tight text-slate-900"
                  >
                    {isEdit ? 'Editar banco' : 'Nuevo banco'}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Configura el banco, los porcentajes de beneficio y la
                    descripción pública que verá el cliente.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form id={formId} onSubmit={submit} className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
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
                        placeholder="Ej: MACRO"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Landmark className="h-4 w-4 text-orange-500" />
                        Nombre <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="nombre"
                        value={form.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Banco Macro"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <label
                      htmlFor="banco-activo"
                      className="inline-flex cursor-pointer items-center gap-3"
                    >
                      <input
                        id="banco-activo"
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

                    <label
                      htmlFor="banco-beneficio-permanente"
                      className="inline-flex cursor-pointer items-center gap-3"
                    >
                      <input
                        id="banco-beneficio-permanente"
                        type="checkbox"
                        name="beneficio_permanente"
                        checked={!!form.beneficio_permanente}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition peer-checked:bg-orange-500">
                        <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                      </span>
                      <span className="text-sm font-medium text-slate-700">
                        Beneficio permanente
                      </span>
                    </label>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Percent className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Configuración del beneficio
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Descuento off %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        name="descuento_off_pct"
                        value={form.descuento_off_pct}
                        onChange={handleChange}
                        placeholder="25"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Reintegro %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        name="reintegro_pct"
                        value={form.reintegro_pct}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarRange className="h-4 w-4 text-orange-500" />
                        Reintegro desde mes
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="reintegro_desde_mes"
                        value={form.reintegro_desde_mes}
                        onChange={handleChange}
                        placeholder="Ej: 2"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarRange className="h-4 w-4 text-orange-500" />
                        Duración del reintegro (meses)
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        name="reintegro_duracion_meses"
                        value={form.reintegro_duracion_meses}
                        onChange={handleChange}
                        placeholder="Ej: 12"
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <h4 className="text-base font-bold text-slate-900">
                        Descripción pública
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={autocompletarDescripcion}
                      className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                    >
                      <Sparkles className="h-4 w-4" />
                      Autocompletar
                    </button>
                  </div>

                  <textarea
                    rows={4}
                    name="descripcion_publica"
                    value={form.descripcion_publica}
                    onChange={handleChange}
                    placeholder="Ej: 25% off (permanente)"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />

                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-orange-600" />
                      <p className="text-sm font-semibold text-slate-800">
                        Vista previa
                      </p>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-600">
                      {descripcionPreview}
                    </p>
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
                        : 'Crear banco'}
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
