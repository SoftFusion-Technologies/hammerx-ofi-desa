import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const nfArs = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2
});

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { y: 18, opacity: 0, scale: 0.985 },
  visible: { y: 0, opacity: 1, scale: 1 },
  exit: { y: 10, opacity: 0, scale: 0.99 }
};

function toNum(v) {
  if (v === null || v === undefined) return 0;

  let s = String(v).trim();
  if (!s) return 0;

  s = s.replace(/\s/g, '');

  // Si hay coma, asumimos decimal AR: "400.000,50" -> "400000.50"
  if (s.includes(',')) {
    s = s.replace(/\./g, ''); // quita miles
    s = s.replace(',', '.'); // coma decimal -> punto
  } else {
    // Si no hay coma, puede venir "400.000" como miles -> quitar puntos si hay más de 1 o si parece miles
    // Regla simple: quitar todos los puntos salvo que haya solo 1 y sea decimal real; para evitar líos, quitamos miles.
    // Si el usuario escribe 1234.56 igual quedará bien por la lógica de "último punto decimal".
    const parts = s.split('.');
    if (parts.length > 2) {
      const dec = parts.pop();
      s = parts.join('') + '.' + dec;
    }
  }

  // También soportar "400,000" (miles) cuando no hay coma decimal real
  s = s.replace(/,/g, '');

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

function calcFinal(precioLista, descuentoPct) {
  const p = toNum(precioLista);
  const d = toNum(descuentoPct);
  const final = p - (p * d) / 100;
  return Math.max(0, final);
}

export default function ConvenioPlanesModal({
  open,
  onClose,
  convenioId,
  convenioTitulo = ''
}) {
  const [loading, setLoading] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);

  // Sedes (ciudad)
  const [loadingSedes, setLoadingSedes] = useState(false);
  const [sedes, setSedes] = useState([]);
  const [sedesError, setSedesError] = useState('');

  const [q, setQ] = useState('');

  const [form, setForm] = useState({
    sede_id: '', // opcional: '' => null
    nombre_plan: '',
    duracion_dias: '',
    precio_lista: '',
    descuento_valor: '',
    precio_final: '',
    activo: 1
  });

  const isEditing = Boolean(editingId);

  const sedeMap = useMemo(() => {
    const m = new Map();
    (sedes || []).forEach((s) => m.set(Number(s.id), s.nombre));
    return m;
  }, [sedes]);

  const resumen = useMemo(() => {
    const activos = planes.filter((p) => Number(p.activo) === 1).length;
    return { total: planes.length, activos };
  }, [planes]);

  const planesFiltrados = useMemo(() => {
    const term = String(q || '')
      .trim()
      .toLowerCase();
    if (!term) return planes;

    return planes.filter((p) => {
      const nom = String(p.nombre_plan || '').toLowerCase();
      const sedeNom =
        p.sede_id == null
          ? 'general'
          : String(sedeMap.get(Number(p.sede_id)) || '').toLowerCase();
      return nom.includes(term) || sedeNom.includes(term);
    });
  }, [planes, q, sedeMap]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      sede_id: '',
      nombre_plan: '',
      duracion_dias: '',
      precio_lista: '',
      descuento_valor: '',
      precio_final: '',
      activo: 1
    });
  };

  const loadPlanes = async () => {
    if (!convenioId) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch(
        `${API_URL}/convenios-planes?convenio_id=${convenioId}`
      );
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'Error al obtener planes');
      setPlanes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || 'Error inesperado');
      setPlanes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSedes = async () => {
    setLoadingSedes(true);
    setSedesError('');
    try {
      const r = await fetch(`${API_URL}/sedes/ciudad`);
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'Error al obtener sedes');
      setSedes(Array.isArray(data) ? data : []);
    } catch (e) {
      setSedes([]);
      setSedesError(e.message || 'Error inesperado al obtener sedes');
    } finally {
      setLoadingSedes(false);
    }
  };

  useEffect(() => {
    if (open) {
      resetForm();
      setQ('');
      loadPlanes();
      loadSedes();
    }
  }, [open, convenioId]);

  const pickPlan = (p) => {
    setEditingId(p.id);
    setForm({
      sede_id: p.sede_id == null ? '' : String(p.sede_id),
      nombre_plan: p.nombre_plan ?? '',
      duracion_dias: p.duracion_dias ?? '',
      precio_lista: p.precio_lista ?? '',
      descuento_valor: p.descuento_valor ?? '',
      precio_final: p.precio_final ?? '',
      activo: Number(p.activo) === 1 ? 1 : 0
    });
  };

  const handleChange = (k, v) => {
    const next = { ...form, [k]: v };

    if (k === 'precio_lista' || k === 'descuento_valor') {
      const computed = calcFinal(next.precio_lista, next.descuento_valor);
      next.precio_final = computed.toFixed(2);
    }

    setForm(next);
  };

  const validate = () => {
    if (!convenioId) return 'Falta convenioId.';
    if (!String(form.nombre_plan || '').trim())
      return 'El nombre del plan es obligatorio.';
    if (toNum(form.precio_lista) <= 0)
      return 'El precio de lista debe ser mayor a 0.';

    // sede_id es opcional: si viene, debe ser válido (numérico positivo)
    if (String(form.sede_id || '').trim() !== '') {
      const sid = parseInt(String(form.sede_id), 10);
      if (!Number.isFinite(sid) || sid <= 0)
        return 'La sede seleccionada no es válida.';
    }

    if (String(form.duracion_dias || '').trim() !== '') {
      if (toNum(form.duracion_dias) <= 0)
        return 'La duración (días) debe ser mayor a 0.';
    }

    // descuento_valor lo tratamos como % (0-100) por UX
    const d = toNum(form.descuento_valor);
    if (
      String(form.descuento_valor || '').trim() !== '' &&
      (d < 0 || d > 100)
    ) {
      return 'El descuento (%) debe estar entre 0 y 100.';
    }
    return '';
  };

  const save = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        convenio_id: convenioId,

        // sede opcional
        sede_id:
          String(form.sede_id || '').trim() === ''
            ? null
            : parseInt(String(form.sede_id), 10),

        nombre_plan: String(form.nombre_plan || '').trim(),
        duracion_dias:
          String(form.duracion_dias || '').trim() === ''
            ? null
            : parseInt(form.duracion_dias, 10),
        precio_lista: toNum(form.precio_lista),
        descuento_valor:
          String(form.descuento_valor || '').trim() === ''
            ? null
            : toNum(form.descuento_valor),
        precio_final:
          String(form.precio_final || '').trim() === ''
            ? null
            : toNum(form.precio_final),
        activo: Number(form.activo) === 1 ? 1 : 0
      };

      const url = isEditing
        ? `${API_URL}/convenios-planes/${editingId}`
        : `${API_URL}/convenios-planes`;

      const method = isEditing ? 'PUT' : 'POST';

      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'No se pudo guardar el plan');

      await loadPlanes();
      resetForm();
    } catch (e) {
      setError(e.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    const ok = window.confirm(
      '¿Eliminar este plan? Esta acción no se puede deshacer.'
    );
    if (!ok) return;

    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API_URL}/convenios-planes/${id}`, {
        method: 'DELETE'
      });
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'No se pudo eliminar el plan');
      await loadPlanes();
      if (editingId === id) resetForm();
    } catch (e) {
      setError(e.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
    resetForm();
    setError('');
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="
              relative w-full sm:w-[92vw] sm:max-w-5xl
              rounded-t-3xl sm:rounded-3xl
              border border-white/10
              bg-white/95 backdrop-blur-xl
              shadow-2xl
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-white/10 bg-gradient-to-r from-orange-500 via-orange-500 to-orange-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/90">
                    Planes del convenio
                  </div>

                  <div className="font-bignoodle mt-1 text-lg sm:text-2xl font-semibold text-white">
                    {convenioTitulo
                      ? convenioTitulo
                      : `Convenio #${convenioId || '-'}`}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">
                      Total:{' '}
                      <span className="ml-1 font-semibold text-white">
                        {resumen.total}
                      </span>
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">
                      Activos:{' '}
                      <span className="ml-1 font-semibold text-white">
                        {resumen.activos}
                      </span>
                    </span>
                    {sedesError ? (
                      <span className="inline-flex items-center rounded-full border border-red-200/40 bg-red-500/10 px-3 py-1 text-white">
                        Error sedes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">
                        Sedes:{' '}
                        <span className="ml-1 font-semibold text-white">
                          {sedes.length}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={close}
                  type="button"
                  className="h-10 w-10 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 text-white text-xl font-bold"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="min-h-[72vh] sm:min-h-[560px] max-h-[82vh] sm:max-h-[78vh] grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              {/* Listado */}
              <div className="border-b md:border-b-0 md:border-r border-slate-200 overflow-hidden flex flex-col">
                <div className="px-5 sm:px-6 py-3 flex items-center justify-between bg-white">
                  <div className="text-sm font-semibold text-slate-900">
                    Planes
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Nuevo
                    </button>
                  </div>
                </div>

                {/* Buscador */}
                <div className="px-5 sm:px-6 pb-3 bg-white">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition"
                    placeholder="Buscar por nombre o sede…"
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    Tip: escribí “monteros” o “concepción” para filtrar por
                    sede.
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-5">
                  {loading && (
                    <div className="py-6 text-sm text-slate-500">
                      Cargando...
                    </div>
                  )}

                  {!loading && planesFiltrados.length === 0 && (
                    <div className="py-6 text-sm text-slate-500">
                      No hay planes para mostrar.
                    </div>
                  )}

                  {!loading && planesFiltrados.length > 0 && (
                    <div className="space-y-3 py-4">
                      {planesFiltrados.map((p) => {
                        const active = Number(p.activo) === 1;
                        const sedeLabel =
                          p.sede_id == null
                            ? 'General'
                            : sedeMap.get(Number(p.sede_id)) ||
                              `Sede #${p.sede_id}`;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => pickPlan(p)}
                            className={`
                              w-full text-left rounded-2xl border px-4 py-4 transition
                              ${
                                editingId === p.id
                                  ? 'border-orange-300 bg-orange-50'
                                  : 'border-slate-200 bg-white hover:bg-slate-50'
                              }
                            `}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <div className="text-sm font-semibold text-slate-900 truncate">
                                    {p.nombre_plan}
                                  </div>

                                  <span
                                    className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                      active
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                        : 'border-slate-200 bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {active ? 'Activo' : 'Inactivo'}
                                  </span>

                                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-slate-200 bg-white text-slate-700">
                                    {sedeLabel}
                                  </span>
                                </div>

                                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                  <div>
                                    Lista:{' '}
                                    <span className="font-semibold text-slate-900">
                                      {nfArs.format(toNum(p.precio_lista))}
                                    </span>
                                  </div>
                                  <div>
                                    Final:{' '}
                                    <span className="font-semibold text-slate-900">
                                      {p.precio_final == null
                                        ? '—'
                                        : nfArs.format(toNum(p.precio_final))}
                                    </span>
                                  </div>
                                  <div>
                                    Desc (%):{' '}
                                    <span className="font-semibold text-slate-900">
                                      {p.descuento_valor == null
                                        ? '—'
                                        : toNum(p.descuento_valor)}
                                    </span>
                                  </div>
                                  <div>
                                    Días:{' '}
                                    <span className="font-semibold text-slate-900">
                                      {p.duracion_dias == null
                                        ? '—'
                                        : p.duracion_dias}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <span className="text-xs text-slate-500">
                                  #{p.id}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Editor */}
              <div className="overflow-hidden flex flex-col">
                <div className="px-5 sm:px-6 py-3 border-b border-slate-200 bg-white">
                  <div className="text-sm font-semibold text-slate-900">
                    {isEditing ? `Editar plan #${editingId}` : 'Crear plan'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Descuento interpretado como porcentaje (0–100).
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
                  {error && (
                    <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Sede (opcional) */}
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <label className="text-sm font-medium text-slate-700">
                          Sede (opcional)
                        </label>

                        <button
                          type="button"
                          onClick={loadSedes}
                          disabled={loadingSedes}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-60"
                          title="Recargar sedes"
                        >
                          {loadingSedes ? 'Cargando…' : 'Recargar'}
                        </button>
                      </div>

                      <div className="mt-2 relative">
                        <select
                          value={form.sede_id}
                          onChange={(e) =>
                            handleChange('sede_id', e.target.value)
                          }
                          className="
                            w-full appearance-none rounded-xl border border-slate-200
                            bg-slate-50 px-4 py-3 pr-10 text-slate-900
                            outline-none transition
                            focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500
                            disabled:opacity-60
                          "
                          disabled={loadingSedes}
                        >
                          <option value="">Sin sede (General)</option>

                          {(sedes || []).map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.nombre}
                            </option>
                          ))}
                        </select>

                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                          <span className="text-lg">▾</span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-500">
                        Si no elegís sede, el plan queda disponible como{' '}
                        <span className="font-semibold">General</span>.
                      </div>

                      {sedesError && (
                        <div className="mt-2 text-xs text-red-600">
                          {sedesError}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700">
                        Nombre del plan
                      </label>
                      <input
                        value={form.nombre_plan}
                        onChange={(e) =>
                          handleChange('nombre_plan', e.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                        placeholder="Ej: Trimestral"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Duración (días)
                        </label>
                        <input
                          value={form.duracion_dias}
                          onChange={(e) =>
                            handleChange('duracion_dias', e.target.value)
                          }
                          inputMode="numeric"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                          placeholder="Ej: 90"
                        />
                        <div className="mt-2 text-xs text-slate-500">
                          Si está vacío, el vencimiento se maneja por otra
                          lógica.
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Activo
                        </label>
                        <div className="mt-2 inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => handleChange('activo', 1)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                              Number(form.activo) === 1
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-600'
                            }`}
                          >
                            Sí
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChange('activo', 0)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                              Number(form.activo) === 0
                                ? 'bg-white shadow-sm text-slate-900'
                                : 'text-slate-600'
                            }`}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Precio lista (ARS)
                        </label>
                        <input
                          value={form.precio_lista}
                          onChange={(e) =>
                            handleChange('precio_lista', e.target.value)
                          }
                          inputMode="decimal"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                          placeholder="Ej: 25000"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Descuento (%)
                        </label>
                        <input
                          value={form.descuento_valor}
                          onChange={(e) =>
                            handleChange('descuento_valor', e.target.value)
                          }
                          inputMode="decimal"
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                          placeholder="Ej: 10"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700">
                          Precio final (ARS)
                        </label>
                        <input
                          value={form.precio_final}
                          readOnly
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 font-semibold outline-none"
                        />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        Vista rápida
                      </div>
                      <div className="mt-2 text-sm text-slate-700">
                        Sede:{' '}
                        <span className="font-semibold text-slate-900">
                          {String(form.sede_id || '').trim() === ''
                            ? 'General'
                            : sedeMap.get(Number(form.sede_id)) ||
                              `Sede #${form.sede_id}`}
                        </span>{' '}
                        · Lista:{' '}
                        <span className="font-semibold text-slate-900">
                          {nfArs.format(toNum(form.precio_lista))}
                        </span>{' '}
                        · Desc:{' '}
                        <span className="font-semibold text-slate-900">
                          {String(form.descuento_valor || '').trim() === ''
                            ? '—'
                            : `${toNum(form.descuento_valor)}%`}
                        </span>{' '}
                        · Final (calc):{' '}
                        <span className="font-semibold text-slate-900">
                          {nfArs.format(
                            calcFinal(form.precio_lista, form.descuento_valor)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-white/85 backdrop-blur-xl px-5 sm:px-6 py-3">
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    {isEditing && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => remove(editingId)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={loading}
                      onClick={resetForm}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                    >
                      Limpiar
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={save}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                    >
                      {loading
                        ? 'Guardando...'
                        : isEditing
                        ? 'Actualizar plan'
                        : 'Crear plan'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
