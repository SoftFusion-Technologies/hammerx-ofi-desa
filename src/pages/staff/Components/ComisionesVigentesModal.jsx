import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Pencil,
  Trash2,
  RefreshCw,
  Percent,
  BadgeDollarSign,
  ShieldCheck,
  Plus
} from 'lucide-react';

const ORANGE = '#fc4b08';

// util: primer día del mes actual (YYYY-MM-01, en UTC)
const firstDayOfCurrentMonth = () => {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  return d.toISOString().slice(0, 10);
};

export default function ComisionesVigentesModal({
  open,
  onClose,
  userLevel = 'admin'
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [soloActivas, setSoloActivas] = useState(true);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const isAdmin = String(userLevel).toLowerCase() === 'admin';

  // ESC para cerrar (y cierra primero el submodal de edición si está abierto)
  useEffect(() => {
    if (!open && !editing) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (editing) setEditing(null);
        else onClose?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, editing, onClose]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const qs = soloActivas ? '?solo_activas=1' : '';
      const res = await fetch(`http://localhost:8080/comisiones-vigentes${qs}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err.message || 'Error al cargar comisiones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, soloActivas]);

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      if (a.periodo_inicio !== b.periodo_inicio)
        return a.periodo_inicio < b.periodo_inicio ? 1 : -1; // desc
      return a.codigo.localeCompare(b.codigo);
    });
  }, [data]);

  const formatValor = (item) => {
    if (item.tipo_valor === 'PORCENTAJE')
      return `${Number(item.valor).toFixed(2)}%`;
    return `${item.moneda || 'ARS'} $${Number(item.valor).toFixed(2)}`;
  };

  const onDelete = async (id) => {
    if (!isAdmin) return;
    const ok = window.confirm(
      '¿Eliminar esta comisión vigente? Esta acción no se puede deshacer.'
    );
    if (!ok) return;
    try {
      setSaving(true);
      const res = await fetch(
        `http://localhost:8080/comisiones-vigentes/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('No se pudo eliminar');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error al eliminar');
    } finally {
      setSaving(false);
    }
  };

  const onSaveEdit = async () => {
    if (!editing) return;
    try {
      setSaving(true);

      // Diferenciamos creación vs edición por flag __isNew
      const isNew = !!editing.__isNew;
      const url = isNew
        ? `http://localhost:8080/comisiones-vigentes`
        : `http://localhost:8080/comisiones-vigentes/${editing.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const payload = isNew
        ? {
            codigo: editing.codigo?.trim(),
            titulo: editing.titulo?.trim(),
            tipo_valor: editing.tipo_valor,
            valor: Number(editing.valor),
            moneda:
              editing.tipo_valor === 'MONTO_FIJO'
                ? (editing.moneda || 'ARS').trim()
                : null,
            detalle_texto: editing.detalle_texto || null,
            periodo_inicio: editing.periodo_inicio || firstDayOfCurrentMonth(),
            periodo_fin: editing.periodo_fin || null,
            activo: !!editing.activo
          }
        : {
            titulo: editing.titulo?.trim(),
            tipo_valor: editing.tipo_valor,
            valor: Number(editing.valor),
            moneda:
              editing.tipo_valor === 'MONTO_FIJO'
                ? (editing.moneda || 'ARS').trim()
                : null,
            detalle_texto: editing.detalle_texto || null,
            periodo_fin: editing.periodo_fin || null,
            activo: !!editing.activo
          };

      // Validación mínima en creación
      if (isNew && !payload.codigo) {
        throw new Error('El código es obligatorio');
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        // Intentamos leer mensaje del backend si viene
        let msg = 'No se pudo guardar';
        try {
          const errJson = await res.json();
          if (errJson?.mensajeError) msg = errJson.mensajeError;
        } catch {}
        throw new Error(msg);
      }

      setEditing(null);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop: clic para cerrar */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onClose?.()}
          />

          {/* Contenedor del diálogo (scroll en viewport) */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-[110] grid place-items-center p-2 sm:p-4 overflow-y-auto"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => {
              const dialog = document.getElementById('cv-dialog');
              if (dialog && dialog.contains(e.target)) e.stopPropagation();
            }}
          >
            <div
              id="cv-dialog"
              className="relative w-full max-w-6xl md:rounded-3xl rounded-none bg-white shadow-[0_25px_80px_-20px_rgba(0,0,0,.35)] h-[100svh] md:h-auto md:max-h-[85vh] md:my-8"
            >
              {/* Header sticky con acento naranja */}
              <div className=" overflow-hidden md:rounded-t-3xl rounded-none sticky top-0 z-10">
                <div
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: `radial-gradient(1000px 300px at -10% -30%, ${ORANGE}, transparent 60%), radial-gradient(800px 250px at 110% 0%, #ff8f59, transparent 55%)`
                  }}
                />
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: ORANGE }}
                    >
                      <ShieldCheck className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <h2 className="font-bignoodle text-lg sm:text-xl font-bold text-zinc-900">
                        Comisiones vigentes
                      </h2>
                      <p className="text-[11px] sm:text-xs text-zinc-500">
                        Vigencias por período mensual
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() =>
                          setEditing({
                            __isNew: true,
                            codigo: '',
                            titulo: '',
                            tipo_valor: 'PORCENTAJE',
                            valor: 0,
                            moneda: 'ARS',
                            detalle_texto: '',
                            periodo_inicio: firstDayOfCurrentMonth(),
                            periodo_fin: '',
                            activo: true
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white shadow"
                        style={{ backgroundColor: ORANGE }}
                        title="Nueva comisión"
                      >
                        <Plus className="h-4 w-4" /> Nueva
                      </button>
                    )}

                    <button
                      onClick={fetchData}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 active:scale-[.98]"
                      title="Refrescar"
                    >
                      <RefreshCw className="h-4 w-4" /> Refrescar
                    </button>

                    <label className="ml-1 sm:ml-2 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                      <input
                        type="checkbox"
                        checked={soloActivas}
                        onChange={(e) => setSoloActivas(e.target.checked)}
                      />
                      Solo activas
                    </label>

                    <button
                      type="button"
                      onClick={() => onClose?.()}
                      className="ml-1 sm:ml-2 inline-flex items-center justify-center rounded-2xl bg-zinc-900/90 px-3 py-2 text-white hover:bg-zinc-900"
                      title="Cerrar"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body con grid responsive */}
              <div className="px-4 sm:px-6 pb-6 pt-4">
                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl border border-zinc-200 p-4"
                      >
                        <div className="mb-3 h-5 w-2/3 rounded bg-zinc-200" />
                        <div className="mb-2 h-4 w-1/2 rounded bg-zinc-200" />
                        <div className="h-16 w-full rounded bg-zinc-200" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {sorted.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        className="group relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md"
                      >
                        {/* Badges */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-700">
                            {item.tipo_valor === 'PORCENTAJE' ? (
                              <Percent className="h-3.5 w-3.5" />
                            ) : (
                              <BadgeDollarSign className="h-3.5 w-3.5" />
                            )}
                            {formatValor(item)}
                          </span>
                          {item.activo ? (
                            <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                              Activo
                            </span>
                          ) : (
                            <span className="rounded-lg bg-zinc-100 px-2 py-1 text-xs font-semibold text-zinc-600">
                              Inactivo
                            </span>
                          )}
                          <span
                            className="rounded-lg bg-orange-50 px-2 py-1 text-[11px] font-semibold"
                            style={{
                              color: ORANGE,
                              border: `1px solid ${ORANGE}33`
                            }}
                          >
                            {new Date(item.periodo_inicio).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Título */}
                        <h3 className="mb-1 line-clamp-2 text-base font-semibold text-zinc-900">
                          {item.titulo}
                        </h3>
                        <p className="line-clamp-3 text-sm text-zinc-600">
                          {item.detalle_texto || '—'}
                        </p>

                        {/* Footer */}
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-zinc-500">
                            Código:{' '}
                            <span className="font-mono">{item.codigo}</span>
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <button
                                className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                title="Editar"
                                onClick={() => setEditing({ ...item })}
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                                title="Eliminar"
                                onClick={() => onDelete(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Modal Edición / Creación */}
          <AnimatePresence>
            {editing && (
              <motion.div
                className="fixed inset-0 z-[120] grid place-items-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setEditing(null)}
                />
                <motion.div
                  initial={{ y: 20, scale: 0.98 }}
                  animate={{ y: 0, scale: 1 }}
                  exit={{ y: 10, scale: 0.98 }}
                  className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900">
                      {editing.__isNew ? 'Nueva comisión' : 'Editar comisión'}
                    </h3>
                    <button
                      className="rounded-xl bg-zinc-900 px-3 py-2 text-white"
                      onClick={() => setEditing(null)}
                      title="Cerrar"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Código (solo editable en creación) */}
                    <div>
                      <label className="text-xs text-zinc-600">Código</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900 disabled:opacity-60"
                        value={editing.codigo || ''}
                        onChange={(e) =>
                          setEditing({ ...editing, codigo: e.target.value })
                        }
                        disabled={!editing.__isNew}
                        placeholder="Ej: NUEVO_SEMESTRAL"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-600">Título</label>
                      <input
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={editing.titulo || ''}
                        onChange={(e) =>
                          setEditing({ ...editing, titulo: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-600">
                        Tipo de valor
                      </label>
                      <select
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={editing.tipo_valor}
                        onChange={(e) =>
                          setEditing({ ...editing, tipo_valor: e.target.value })
                        }
                      >
                        <option value="PORCENTAJE">PORCENTAJE</option>
                        <option value="MONTO_FIJO">MONTO_FIJO</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-600">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={editing.valor}
                        onChange={(e) =>
                          setEditing({ ...editing, valor: e.target.value })
                        }
                      />
                    </div>

                    {editing.tipo_valor === 'MONTO_FIJO' && (
                      <div>
                        <label className="text-xs text-zinc-600">Moneda</label>
                        <input
                          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          value={editing.moneda || 'ARS'}
                          onChange={(e) =>
                            setEditing({ ...editing, moneda: e.target.value })
                          }
                        />
                      </div>
                    )}

                    <div className="md:col-span-2">
                      <label className="text-xs text-zinc-600">Detalle</label>
                      <textarea
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={editing.detalle_texto || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            detalle_texto: e.target.value
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="text-xs text-zinc-600">
                        Período inicio
                      </label>
                      {editing.__isNew ? (
                        <input
                          type="date"
                          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                          value={
                            editing.periodo_inicio || firstDayOfCurrentMonth()
                          }
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              periodo_inicio: e.target.value
                            })
                          }
                        />
                      ) : (
                        <input
                          disabled
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-sm text-zinc-600"
                          value={editing.periodo_inicio}
                          readOnly
                        />
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-zinc-600">
                        Período fin (opcional)
                      </label>
                      <input
                        type="date"
                        className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                        value={editing.periodo_fin || ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            periodo_fin: e.target.value
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="chkActivo"
                        type="checkbox"
                        checked={!!editing.activo}
                        onChange={(e) =>
                          setEditing({ ...editing, activo: e.target.checked })
                        }
                      />
                      <label
                        htmlFor="chkActivo"
                        className="text-sm text-zinc-700"
                      >
                        Activo
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setEditing(null)}
                      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={saving}
                      onClick={onSaveEdit}
                      className="rounded-xl px-4 py-2 text-sm font-semibold text-white shadow"
                      style={{
                        backgroundColor: ORANGE,
                        opacity: saving ? 0.8 : 1
                      }}
                    >
                      {saving
                        ? 'Guardando...'
                        : editing.__isNew
                        ? 'Crear comisión'
                        : 'Guardar cambios'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
