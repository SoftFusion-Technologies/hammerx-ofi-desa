import { useEffect, useMemo, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

const ESTADOS = ['en_revision', 'aprobado', 'rechazado'];
const MONEDAS = ['ARS', 'USD'];
const PLANES = [
  'Mensual',
  'Trimestre',
  'Semestre',
  'Anual',
  'Débitos automáticos',
  'Otros'
];
const SEDES = ['monteros', 'concepcion', 'barrio sur', 'barrio norte'];

function shapeFromRow(r) {
  const row = r || {};
  return {
    vendedor_id: row.vendedor_id ?? row?.vendedor?.id ?? '',
    prospecto_id: row.prospecto_id ?? row?.prospecto?.id ?? '',
    sede: (row.sede ?? '').toString(),
    tipo_plan: row.tipo_plan ?? 'Otros',
    tipo_plan_custom: row.tipo_plan_custom ?? '',
    observacion: row.observacion ?? '',
    moneda: row.moneda ?? 'ARS',
    monto_comision:
      row.monto_comision != null ? Number(row.monto_comision) : '',
    estado: row.estado ?? 'en_revision',
    motivo_rechazo: row.motivo_rechazo ?? ''
  };
}

export default function ComisionEditModal({ open, row, onClose, onSaved, origen }) {
  const [form, setForm] = useState(shapeFromRow(row));
  const [saving, setSaving] = useState(false);
  const [vendedores, setVendedores] = useState([]);
  const [loadingVendedores, setLoadingVendedores] = useState(false);

  const sedesOptions = useMemo(() => {
    const base = [...SEDES];
    const cur = (form.sede || '').trim().toLowerCase();
    if (cur && !base.includes(cur)) base.push(cur); // muestra la sede actual aunque no esté en la lista
    return base;
  }, [form.sede]);

  const toTitle = (s) =>
    s.replace(/\w\S*/g, (txt) => txt[0].toUpperCase() + txt.slice(1));

  // Sync cuando cambie "row"
  useEffect(() => {
    setForm(shapeFromRow(row));
  }, [row]);

  // ===== Constantes de permiso =====
  const ALLOWED_IDS = new Set([66, 92, 81]);
  const ALLOWED_EMAILS = new Set(
    [
      'fedekap@hotmail.com',
      'solciruiz098@gmail.com.ar',
      'lourdesbsoraire@gmail.com',
      'rosario.nieva24@gmail.com'
    ].map((e) => e.toLowerCase())
  );

  const isAllowedUser = (u) => {
    if (!u) return false;
    const byId = ALLOWED_IDS.has(Number(u.id));
    const byEmail = u.email
      ? ALLOWED_EMAILS.has(String(u.email).toLowerCase())
      : false;
    return byId || byEmail;
  };

  // ===== Cargar vendedores (solo permitidos) =====
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingVendedores(true);
        const res = await fetch('http://localhost:8080/users');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        // Filtramos los permitidos
        const allowed = list.filter(isAllowedUser);

        // Si el vendedor actual NO está permitido, lo anexamos para poder visualizarlo
        const currentId = row?.vendedor_id ?? row?.vendedor?.id;
        let currentUser = null;
        if (currentId) {
          currentUser = list.find((u) => Number(u.id) === Number(currentId));
        }

        let finalList = allowed;
        const currentNotInAllowed =
          currentUser &&
          !allowed.some((u) => Number(u.id) === Number(currentUser.id));

        if (currentNotInAllowed) {
          // Marcamos flag para saber que no es elegible
          finalList = [
            ...allowed,
            { ...currentUser, __notAllowed: true } // lo mostramos pero deshabilitado
          ];
        }

        // Orden por nombre
        finalList.sort((a, b) => String(a.name).localeCompare(String(b.name)));

        setVendedores(finalList);
      } catch (e) {
        console.error(e);
        setVendedores([]);
      } finally {
        setLoadingVendedores(false);
      }
    })();
  }, [open, row]);

  const canShowCustom = form.tipo_plan === 'Otros';
  const isAprobado = form.estado === 'aprobado';
  const isRechazado = form.estado === 'rechazado';

  const payload = useMemo(() => {
    const p = {
      vendedor_id: form.vendedor_id ? Number(form.vendedor_id) : undefined,
      prospecto_id: form.prospecto_id ? Number(form.prospecto_id) : undefined,
      sede: form.sede || '',
      tipo_plan: form.tipo_plan,
      tipo_plan_custom: canShowCustom ? form.tipo_plan_custom || '' : null,
      observacion: form.observacion ?? '',
      estado: form.estado
    };
    if (isAprobado) {
      p.moneda = form.moneda || 'ARS';
      p.monto_comision =
        form.monto_comision === '' || form.monto_comision === null
          ? null
          : Number(String(form.monto_comision).replace(',', '.'));
    }
    if (isRechazado) {
      p.motivo_rechazo = form.motivo_rechazo || '';
    }
    return p;
  }, [form, canShowCustom, isAprobado, isRechazado]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!row?.id) return;
    try {
      setSaving(true);
      const endpoint = origen === "ventas-prospectos" ? "ventas-comisiones" : "ventas-comisiones-remarketing";

      const res = await fetch(
        `http://localhost:8080/${endpoint}/${row.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.mensajeError || `Error ${res.status}`);
      }
      const { data } = await res.json();
      onSaved?.(data || { ...row, ...payload }); // fallback si el back no devuelve include
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h3 className="text-slate-100 font-semibold">
            Editar comisión #{row?.id}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg ring-1 ring-white/10 text-slate-300 hover:bg-white/10"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Vendedor */}
          <div>
            <label className="block text-slate-300 mb-1">Vendedor</label>
            <div className="flex gap-2">
              <select
                value={form.vendedor_id}
                onChange={(e) =>
                  setForm({ ...form, vendedor_id: e.target.value })
                }
                className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
              >
                <option value="">-- seleccionar --</option>
                {loadingVendedores ? (
                  <option>Cargando…</option>
                ) : (
                  vendedores.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} (#{u.id})
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Prospecto */}
          <div>
            <label className="block text-slate-300 mb-1">Prospecto ID</label>
            <input
              type="number"
              value={form.prospecto_id}
              onChange={(e) =>
                setForm({ ...form, prospecto_id: e.target.value })
              }
              className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
              placeholder="Ej: 118"
            />
            {row?.prospecto?.nombre && (
              <div className="mt-1 text-xs text-slate-400">
                Actual: {row.prospecto.nombre} (#{row.prospecto.id})
              </div>
            )}
          </div>

          {/* Sede */}
          <div>
            <label className="block text-slate-300 mb-1">Sede</label>
            <select
              value={(form.sede || '').toLowerCase()}
              onChange={(e) => setForm({ ...form, sede: e.target.value })}
              className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10 capitalize"
            >
              <option value="">-- seleccionar --</option>
              {sedesOptions.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {toTitle(s)}
                </option>
              ))}
            </select>
            {/* Hint si la sede actual no pertenece al catálogo */}
            {form.sede && !SEDES.includes((form.sede || '').toLowerCase()) && (
              <p className="mt-1 text-xs text-amber-300">
                La sede actual no pertenece al catálogo, pero se muestra para
                conservar el valor.
              </p>
            )}
          </div>

          {/* Plan */}
          <div>
            <label className="block text-slate-300 mb-1">Plan</label>
            <select
              value={form.tipo_plan}
              onChange={(e) => setForm({ ...form, tipo_plan: e.target.value })}
              className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
            >
              {PLANES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {canShowCustom && (
              <input
                value={form.tipo_plan_custom}
                onChange={(e) =>
                  setForm({ ...form, tipo_plan_custom: e.target.value })
                }
                className="mt-2 w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
                placeholder="Detalle del plan"
              />
            )}
          </div>

          {/* Observación */}
          <div className="md:col-span-2">
            <label className="block text-slate-300 mb-1">Observación</label>
            <textarea
              value={form.observacion}
              onChange={(e) =>
                setForm({ ...form, observacion: e.target.value })
              }
              rows={3}
              className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
              placeholder="Notas internas…"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-slate-300 mb-1">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>
                  {e.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Campos condicionales por estado */}
          {isAprobado && (
            <>
              <div>
                <label className="block text-slate-300 mb-1">Moneda</label>
                <select
                  value={form.moneda}
                  onChange={(e) => setForm({ ...form, moneda: e.target.value })}
                  className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
                >
                  {MONEDAS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">
                  Monto comisión
                </label>
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={form.monto_comision}
                  onChange={(e) =>
                    setForm({ ...form, monto_comision: e.target.value })
                  }
                  className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
                  placeholder="Ej: 2000.00"
                />
              </div>
            </>
          )}

          {isRechazado && (
            <div className="md:col-span-2">
              <label className="block text-slate-300 mb-1">
                Motivo rechazo
              </label>
              <input
                value={form.motivo_rechazo}
                onChange={(e) =>
                  setForm({ ...form, motivo_rechazo: e.target.value })
                }
                className="w-full rounded-xl px-3 py-2 bg-slate-800 text-slate-100 ring-1 ring-white/10"
                placeholder="Detalle del motivo"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl ring-1 ring-white/10 text-slate-200 hover:bg-white/10"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-slate-900 font-semibold hover:bg-sky-400 disabled:opacity-60"
          >
            {saving && <Loader2 className="animate-spin" size={16} />}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
}
