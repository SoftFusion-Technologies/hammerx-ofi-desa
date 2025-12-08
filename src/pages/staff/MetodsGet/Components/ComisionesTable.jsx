import { useMemo, useState } from 'react';
import {Trash2, Pencil, Check, X as XIcon } from 'lucide-react';

const cx = (...xs) => xs.filter(Boolean).join(' ');

function EstadoPill({ estado }) {
  const map = {
    en_revision: 'bg-amber-500 text-amber-200 ring-amber-400',
    aprobado: 'bg-sky-500 text-sky-200 ring-sky-400',
    rechazado: 'bg-rose-500 text-rose-200 ring-rose-400'
  };
  const label = estado ? estado.replace('_', ' ') : '-';
  return (
    <span
      className={cx(
        'inline-flex items-center rounded-full px-2 py-1 text-[11px] ring-1',
        map[estado] || 'bg-slate-500/10 text-slate-300 ring-slate-400/20'
      )}
    >
      {label}
    </span>
  );
}

function fmtDate(dt) {
  if (!dt) return '-';
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

function MontoEditable({ row, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(
    row?.monto_comision != null ? Number(row.monto_comision).toFixed(2) : ''
  );
  const [saving, setSaving] = useState(false);
  const canEdit = String(row?.estado) === 'aprobado';

  const handleSave = async () => {
    const parsed = Number(String(value).replace(',', '.'));
    if (Number.isNaN(parsed)) return;
    try {
      setSaving(true);

      // Si te pasan un prop onSaved con backend propio, úsalo.
      if (typeof onSaved === 'function') {
        await onSaved(row.id, parsed);
      } else {
        // Fallback simple: PATCH a un endpoint estándar (ajustá a tu ruta real)
        await fetch(`http://localhost:8080/ventas-comisiones/${row.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ monto_comision: parsed })
        });
      }

      setEditing(false);
    } catch (e) {
      console.error('Error guardando monto:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!canEdit) {
    // Solo muestra (sin editar) para estados no aprobados
    return (
      <span className="font-semibold text-slate-100">
        {row?.estado === 'aprobado' && row?.monto_comision != null
          ? `$ ${Number(row.monto_comision).toFixed(2)}`
          : '-'}
      </span>
    );
  }

  return editing ? (
    <div className="flex items-center gap-2">
      <input
        type="number"
        step="0.01"
        inputMode="decimal"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28 rounded-lg bg-slate-800/80 text-slate-100 px-2 py-1 ring-1 ring-white/10 outline-none focus:ring-teal-400/50"
      />
      <button
        disabled={saving}
        onClick={handleSave}
        className="p-1 rounded-md ring-1 ring-teal-400/40 text-teal-300 hover:bg-teal-500/10 disabled:opacity-60"
        title="Guardar"
      >
        <Check size={16} />
      </button>
      <button
        disabled={saving}
        onClick={() => {
          setEditing(false);
          setValue(
            row?.monto_comision != null
              ? Number(row.monto_comision).toFixed(2)
              : ''
          );
        }}
        className="p-1 rounded-md ring-1 ring-white/10 text-slate-300 hover:bg-white/10 disabled:opacity-60"
        title="Cancelar"
      >
        <XIcon size={16} />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-slate-100">
        {row?.monto_comision != null
          ? `$ ${Number(row.monto_comision).toFixed(2)}`
          : '-'}
      </span>
      {/* <button
        onClick={() => setEditing(true)}
        className="p-1 rounded-md ring-1 ring-white/10 text-slate-300 hover:bg-white/10"
        title="Editar comisión"
      >
        <Pencil size={16} />
      </button> */}
    </div>
  );
}

export function ComisionesTable({ rows, editar, eliminar, PrimaryAction }) {
  const [savingIds, setSavingIds] = useState(new Set());

  const sorted = useMemo(() => {
    // Orden sugerido: más recientes primero por created_at/updated_at
    return [...rows].sort((a, b) => {
      const da = new Date(a?.created_at || a?.updated_at || 0).getTime();
      const db = new Date(b?.created_at || b?.updated_at || 0).getTime();
      return db - da;
    });
  }, [rows]);

  const onSaveMonto = async (id, monto) => {
    const s = new Set(savingIds);
    s.add(id);
    setSavingIds(s);
    try {
      await fetch(`http://localhost:8080/ventas-comisiones/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_comision: monto })
      });
      // Opcional: refrescar la lista
      // Si tenés fetchComisiones disponible en el scope superior, llamalo luego del save.
      // fetchComisiones();
    } catch (e) {
      console.error(e);
    } finally {
      const s2 = new Set(savingIds);
      s2.delete(id);
      setSavingIds(s2);
    }
  };

  return (
    // Wrapper de la tabla
    <div className="overflow-auto rounded-2xl border border-white/10 shadow-2xl bg-slate-950">
      <table className="min-w-[1100px] w-full text-sm text-slate-200">
        <thead className="sticky top-0 z-10 bg-slate-900">
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Vendedor</th>
            <th className="px-4 py-3 text-left">Prospecto</th>
            <th className="px-4 py-3 text-left">Origen</th>
            <th className="px-4 py-3 text-left">Sede</th>
            <th className="px-4 py-3 text-left">Plan</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Observación</th>
            <th className="px-4 py-3 text-left">Comisión</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>

        <tbody className="bg-slate-950">
          {sorted.map((row, i) => (
            <tr
              key={row.id}
              className="odd:bg-slate-950 even:bg-slate-900 hover:bg-slate-800 transition-colors"
            >
              <td className="px-4 py-3 text-slate-300">
                {fmtDate(row.created_at || row.updated_at)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-100">
                {row?.vendedor?.name || row.vendedor_id || '-'}
              </td>
              <td className="px-4 py-3">
                <div className="text-slate-100">
                  {row?.prospecto?.nombre || '-'}
                </div>
                {row?.prospecto?.dni && (
                  <div className="text-[12px] text-slate-400">
                    DNI {row.prospecto.dni}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cx(
                    'inline-flex items-center rounded-full px-2 py-1 text-[11px] ring-1 capitalize',
                    row.origen === 'remarketing'
                      ? 'bg-purple-500/15 text-purple-200 ring-purple-400/30'
                      : 'bg-emerald-500/45 text-emerald-300 ring-emerald-400/60'
                  )}
                >
                  {row.origen || 'ventas'}
                </span>
              </td>
              <td className="px-4 py-3 capitalize text-slate-100">
                {row.sede || '-'}
              </td>
              <td className="px-4 py-3 text-slate-100">
                <div>{row.tipo_plan || '-'}</div>
                {row.tipo_plan === 'Otros' && row.tipo_plan_custom ? (
                  <div className="text-[12px] text-slate-400">
                    — {row.tipo_plan_custom}
                  </div>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <EstadoPill estado={row.estado} />
              </td>
              <td className="px-4 py-3 text-slate-300 max-w-[420px]">
                <div className="truncate" title={row.observacion || ''}>
                  {row.observacion?.trim() || '-'}
                </div>
              </td>
              <td className="px-4 py-3">
                <MontoEditable row={row} onSaved={onSaveMonto} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                    <>
                      <button
                        onClick={() => editar?.(row)}
                        title="Editar"
                        className="p-2 rounded-lg ring-1 ring-white/10 hover:bg-white/10 text-slate-200"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => eliminar?.(row)}
                        title="Eliminar"
                        className="p-2 rounded-lg ring-1 ring-rose-400/40 text-rose-300 hover:bg-rose-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  <PrimaryAction row={row} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
