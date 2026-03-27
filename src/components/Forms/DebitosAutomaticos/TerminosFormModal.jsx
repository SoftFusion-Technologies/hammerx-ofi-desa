/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal para crear y editar términos y condiciones del módulo
 * Débitos Automáticos.
 *
 * Permite gestionar:
 * - versión
 * - título
 * - contenido_html
 * - activo
 * - publicado_desde
 * - publicado_hasta
 *
 * Tema: Frontend - Débitos Automáticos - Términos
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  FileText,
  Hash,
  BadgeCheck,
  CalendarDays,
  ShieldCheck,
  Type,
  Eye,
  Code2,
  AlertTriangle
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
  version: '',
  titulo: '',
  contenido_html: '',
  activo: true,
  publicado_desde: '',
  publicado_hasta: ''
};

const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value);
};

const formatDateTimeLocal = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (num) => String(num).padStart(2, '0');

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toNullableDate = (value) => {
  if (!value || !String(value).trim()) return null;
  return String(value).trim();
};

const validateForm = (form) => {
  if (!form.version.trim()) {
    return 'La versión es obligatoria.';
  }

  if (!form.titulo.trim()) {
    return 'El título es obligatorio.';
  }

  if (!form.contenido_html.trim()) {
    return 'El contenido HTML es obligatorio.';
  }

  if (form.version.trim().length > 30) {
    return 'La versión no puede superar los 30 caracteres.';
  }

  if (form.titulo.trim().length > 150) {
    return 'El título no puede superar los 150 caracteres.';
  }

  if (
    form.publicado_desde &&
    Number.isNaN(new Date(form.publicado_desde).getTime())
  ) {
    return 'Publicado desde es inválido.';
  }

  if (
    form.publicado_hasta &&
    Number.isNaN(new Date(form.publicado_hasta).getTime())
  ) {
    return 'Publicado hasta es inválido.';
  }

  if (
    form.publicado_desde &&
    form.publicado_hasta &&
    new Date(form.publicado_desde) > new Date(form.publicado_hasta)
  ) {
    return 'Publicado desde no puede ser mayor a publicado hasta.';
  }

  return '';
};

const getPayloadFromForm = (form) => {
  return {
    version: form.version.trim(),
    titulo: form.titulo.trim(),
    contenido_html: form.contenido_html.trim(),
    activo: form.activo ? 1 : 0,
    publicado_desde: toNullableDate(form.publicado_desde),
    publicado_hasta: toNullableDate(form.publicado_hasta)
  };
};

export default function TerminosFormModal({
  open,
  onClose,
  onSubmit,
  initial
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewMode, setPreviewMode] = useState(true);

  const isEdit = !!initial?.id;
  const titleId = 'debito-terminos-form-title';

  useEffect(() => {
    if (!open) return;

    setSaving(false);
    setErrorMsg('');
    setPreviewMode(true);

    setForm({
      version: initial?.version || '',
      titulo: initial?.titulo || '',
      contenido_html: initial?.contenido_html || '',
      activo:
        initial?.activo === 1 ||
        initial?.activo === true ||
        initial?.activo === '1',
      publicado_desde: formatDateTimeLocal(initial?.publicado_desde),
      publicado_hasta: formatDateTimeLocal(initial?.publicado_hasta)
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
        'No se pudo guardar el término.';

      setErrorMsg(backendMessage);
    } finally {
      setSaving(false);
    }
  };

  const previewHtml = useMemo(() => {
    return form.contenido_html?.trim() || '';
  }, [form.contenido_html]);

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
            className="relative w-full max-w-[98vw] sm:max-w-6xl max-h-[92vh] overflow-y-auto rounded-[28px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
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
                  <FileText className="h-7 w-7" />
                </div>

                <div className="pr-10">
                  <h3
                    id={titleId}
                    className="text-xl font-bignoodle sm:text-2xl font-bold tracking-tight text-slate-900"
                  >
                    {isEdit ? 'Editar términos' : 'Nuevos términos'}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Gestiona la versión legal, vigencia y contenido HTML del
                    documento que se mostrará en el flujo de débitos
                    automáticos.
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={submit} className="space-y-6">
                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <BadgeCheck className="h-5 w-5 text-orange-500" />
                    <h4 className="text-base font-bold text-slate-900">
                      Datos principales
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Hash className="h-4 w-4 text-orange-500" />
                        Versión <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="version"
                        value={form.version}
                        onChange={handleChange}
                        placeholder="Ej: v1.0"
                        maxLength={30}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div className="xl:col-span-2">
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Type className="h-4 w-4 text-orange-500" />
                        Título <span className="text-rose-500">*</span>
                      </label>
                      <input
                        name="titulo"
                        value={form.titulo}
                        onChange={handleChange}
                        placeholder="Ej: Términos y Condiciones - Débitos Automáticos"
                        maxLength={150}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Publicado desde
                      </label>
                      <input
                        type="datetime-local"
                        name="publicado_desde"
                        value={form.publicado_desde}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays className="h-4 w-4 text-orange-500" />
                        Publicado hasta
                      </label>
                      <input
                        type="datetime-local"
                        name="publicado_hasta"
                        value={form.publicado_hasta}
                        onChange={handleChange}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div className="flex items-end">
                      <label
                        htmlFor="termino-activo"
                        className="inline-flex cursor-pointer items-center gap-3"
                      >
                        <input
                          id="termino-activo"
                          type="checkbox"
                          name="activo"
                          checked={!!form.activo}
                          onChange={handleChange}
                          className="peer sr-only"
                        />
                        <span className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 transition peer-checked:bg-orange-500">
                          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                        </span>
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <ShieldCheck className="h-4 w-4 text-orange-500" />
                          Activo
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <p className="text-sm leading-relaxed text-amber-800">
                        Si marcás este término como <strong>activo</strong>, el
                        se desactivará los demás registros activos
                        automáticamente.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-orange-500" />
                      <h4 className="text-base font-bold text-slate-900">
                        Contenido HTML
                      </h4>
                    </div>

                    <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
                      <button
                        type="button"
                        onClick={() => setPreviewMode(false)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          !previewMode
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Código
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode(true)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                          previewMode
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.08fr_0.92fr]">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <FileText className="h-4 w-4 text-orange-500" />
                        HTML legal <span className="text-rose-500">*</span>
                      </label>

                      <textarea
                        rows={18}
                        name="contenido_html"
                        value={form.contenido_html}
                        onChange={handleChange}
                        placeholder="<div><h1>Términos...</h1><p>Contenido legal...</p></div>"
                        className="min-h-[420px] w-full rounded-2xl border border-slate-200 bg-slate-950 px-4 py-4 font-mono text-[13px] leading-6 text-slate-100 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Eye className="h-4 w-4 text-orange-500" />
                        Vista previa
                      </label>

                      <div className="min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        {previewMode ? (
                          <div className="max-h-[420px] overflow-y-auto p-5">
                            {previewHtml ? (
                              <div
                                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700"
                                dangerouslySetInnerHTML={{
                                  __html: previewHtml
                                }}
                              />
                            ) : (
                              <div className="flex h-full min-h-[360px] items-center justify-center text-center">
                                <div>
                                  <Eye className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                                  <p className="text-sm font-semibold text-slate-700">
                                    Sin contenido para previsualizar
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Escribí o pegá el HTML del documento para
                                    verlo acá.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="max-h-[420px] overflow-y-auto p-5">
                            <pre className="whitespace-pre-wrap break-words text-[12px] leading-6 text-slate-700">
                              {previewHtml || 'Sin contenido HTML.'}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
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
                        : 'Crear término'}
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
