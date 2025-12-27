import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaTimes,
  FaStickyNote,
  FaPlus,
  FaTrash,
  FaPen,
  FaSave,
  FaSearch
} from 'react-icons/fa';

const ensureSwalZIndex = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('swal-zfix-style')) return;

  const st = document.createElement('style');
  st.id = 'swal-zfix-style';
  st.innerHTML = `
    .swal2-container{ z-index: 100000 !important; }
    .swal2-popup{ z-index: 100001 !important; }
    .swal2-backdrop-show{ z-index: 100000 !important; }
  `;
  document.head.appendChild(st);
};

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true
});

const fmtAR = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function IntegranteNotasModal({
  isOpen,
  onClose,
  integrante,
  apiUrl = 'http://localhost:8080',
  autorNombre = '',
  userLevel = '',
  canModerate = false,
  onCountChange
}) {
  // IMPORTANTÍSIMO: hooks SIEMPRE se ejecutan, aunque isOpen sea false
  const shouldRender = Boolean(isOpen);

  useEffect(() => {
    ensureSwalZIndex();
  }, []);

  // Lock scroll + Escape
  useEffect(() => {
    if (!shouldRender) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender]);

  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState([]);
  const [q, setQ] = useState('');

  const [texto, setTexto] = useState('');
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editTexto, setEditTexto] = useState('');

  const integranteId = integrante?.id;

  // -----------------------------
  // Autor: si userLevel=='' o autorNombre vacío => input obligatorio
  // -----------------------------
  const [autorManual, setAutorManual] = useState('');

  const autorEsEditable =
    String(userLevel || '') === "" || String(autorNombre || '').trim() === '';

  const autorFinal = autorEsEditable
    ? String(autorManual || '').trim()
    : String(autorNombre || '').trim();

  // Mobile tabs (historial / form)
  const [mobileTab, setMobileTab] = useState('historial');

  useEffect(() => {
    if (!shouldRender) return;
    // al abrir: mostrar historial
    setMobileTab('historial');
    if (autorEsEditable) setAutorManual(String(autorNombre || '').trim());
  }, [shouldRender, autorEsEditable, autorNombre]);

  const notasFiltradas = useMemo(() => {
    const term = String(q || '')
      .trim()
      .toLowerCase();
    if (!term) return notas;

    return (notas || []).filter((n) => {
      const a = String(n.autor_nombre || '').toLowerCase();
      const t = String(n.nota || '').toLowerCase();
      return a.includes(term) || t.includes(term);
    });
  }, [notas, q]);

  const fetchNotas = useCallback(async () => {
    if (!integranteId) return;

    setLoading(true);
    try {
      const r = await fetch(
        `${apiUrl}/integrantes-notas?integrante_conve_id=${integranteId}`
      );
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'Error obteniendo notas');

      const sorted = [...(data || [])].sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return db - da;
      });

      setNotas(sorted);
      if (onCountChange) onCountChange(integranteId, sorted.length);
    } catch (e) {
      Toast.fire({
        icon: 'error',
        title: e?.message || 'Error al cargar notas'
      });
    } finally {
      setLoading(false);
    }
  }, [apiUrl, integranteId, onCountChange]);

  useEffect(() => {
    if (!shouldRender) return;
    fetchNotas();
  }, [shouldRender, fetchNotas]);

  const close = () => {
    setQ('');
    setTexto('');
    setEditId(null);
    setEditTexto('');
    setMobileTab('historial');
    onClose?.();
  };

  const canEditDeleteNote = (note) => {
    if (canModerate) return true;
    // Solo autor puede editar/borrar si NO es moderador
    return String(note?.autor_nombre || '') === String(autorFinal || '');
  };

  const crearNota = async () => {
    const body = String(texto || '').trim();
    if (!body) {
      Toast.fire({
        icon: 'warning',
        title: 'Escribí una nota antes de guardar.'
      });
      return;
    }

    const autor = String(autorFinal || '').trim();
    if (!autor) {
      Toast.fire({ icon: 'warning', title: 'El autor es obligatorio.' });
      return;
    }

    if (!integranteId) return;

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrante_conve_id: integranteId,
          autor_nombre: autor,
          nota: body
        })
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.mensajeError || 'Error creando nota');

      Toast.fire({ icon: 'success', title: 'Nota guardada' });
      setTexto('');
      await fetchNotas();
      setMobileTab('historial');
    } catch (e) {
      Toast.fire({ icon: 'error', title: e?.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const iniciarEdicion = (note) => {
    setEditId(note.id);
    setEditTexto(note.nota || '');
    setMobileTab('form');
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditTexto('');
    setMobileTab('historial');
  };

  const guardarEdicion = async () => {
    const body = String(editTexto || '').trim();
    if (!body) {
      Toast.fire({ icon: 'warning', title: 'La nota no puede quedar vacía.' });
      return;
    }

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: body })
      });

      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || 'Error actualizando nota');

      Toast.fire({ icon: 'success', title: 'Nota actualizada' });
      setEditId(null);
      setEditTexto('');
      await fetchNotas();
      setMobileTab('historial');
    } catch (e) {
      Toast.fire({ icon: 'error', title: e?.message || 'Error al actualizar' });
    } finally {
      setSaving(false);
    }
  };

  const eliminarNota = async (noteId) => {
    const confirm = await Swal.fire({
      title: 'Eliminar nota',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas/${noteId}`, {
        method: 'DELETE'
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.mensajeError || 'Error eliminando nota');

      Toast.fire({ icon: 'success', title: 'Nota eliminada' });
      await fetchNotas();
    } catch (e) {
      Toast.fire({ icon: 'error', title: e?.message || 'Error al eliminar' });
    } finally {
      setSaving(false);
    }
  };

  // useMemo SIEMPRE ejecutado (aunque isOpen sea false), para no romper hooks
  const notaEditando = useMemo(() => {
    if (!editId) return null;
    return (notas || []).find((n) => n.id === editId) || null;
  }, [editId, notas]);

  const panelTitle = editId ? 'Editar nota' : 'Nueva nota';

  // Recién acá cortamos render si el modal está cerrado
  if (!shouldRender) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
          onClick={close}
        />

        {/* Panel (dark glass) */}
        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="
            relative w-full sm:w-[92vw] sm:max-w-6xl
            h-[92vh] sm:h-auto sm:max-h-[86vh]
            rounded-t-3xl sm:rounded-3xl
            border border-white/10
            bg-zinc-950/85 backdrop-blur-xl
            shadow-[0_30px_90px_rgba(0,0,0,0.55)]
            overflow-hidden
          "
        >
          {/* Top accent */}
          <div className="h-[3px] bg-gradient-to-r from-[#fc4b08] via-orange-400 to-amber-300" />

          {/* Header */}
          <div className="sticky top-0 z-20 px-4 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 text-[#fc4b08]">
                  <FaStickyNote />
                </span>

                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-white truncate">
                    Notas del integrante
                  </div>
                  <div className="text-xs text-white/60 truncate">
                    {integrante?.nombre || '—'} · #{integranteId || '—'} ·{' '}
                    <span className="text-white/50">
                      {notas.length} nota{notas.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            {/* Mobile tabs */}
            <div className="mt-4 md:hidden">
              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMobileTab('historial')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    mobileTab === 'historial'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Historial
                </button>
                <button
                  type="button"
                  onClick={() => setMobileTab('form')}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition ${
                    mobileTab === 'form'
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {editId ? 'Editar' : 'Nueva'}
                </button>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
            {/* Left: listado */}
            <div
              className={`
                ${mobileTab === 'historial' ? 'block' : 'hidden'} md:block
                p-4 sm:p-6
                min-h-[52vh] md:min-h-[64vh]
                border-b md:border-b-0 md:border-r border-white/10
              `}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                  Historial
                </div>

                <div className="relative w-full sm:w-[360px]">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/45 text-sm" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="
                      w-full rounded-2xl
                      border border-white/10
                      bg-white/5
                      pl-9 pr-3 py-2.5
                      text-sm text-white
                      placeholder:text-white/40
                      outline-none
                      focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300/40
                      transition
                    "
                    placeholder="Buscar por autor o contenido…"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-3 max-h-[58vh] md:max-h-[60vh] overflow-y-auto pr-1">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((k) => (
                      <div
                        key={k}
                        className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse"
                      >
                        <div className="h-3 w-40 bg-white/10 rounded mb-2" />
                        <div className="h-2 w-24 bg-white/10 rounded mb-4" />
                        <div className="h-3 w-full bg-white/10 rounded mb-2" />
                        <div className="h-3 w-5/6 bg-white/10 rounded" />
                      </div>
                    ))}
                  </div>
                ) : notasFiltradas.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-sm text-white/70">
                    No hay notas aún. Podés crear la primera desde el panel{' '}
                    <span className="text-white font-semibold">Nueva</span>.
                  </div>
                ) : (
                  notasFiltradas.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="
                        rounded-2xl
                        border border-white/10
                        bg-gradient-to-b from-white/[0.07] to-white/[0.04]
                        p-4
                        shadow-[0_14px_30px_rgba(0,0,0,0.28)]
                      "
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(252,75,8,0.12)]" />
                            <div className="text-sm font-semibold text-white truncate">
                              {n.autor_nombre}
                            </div>
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            {fmtAR(n.created_at)}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {canEditDeleteNote(n) && (
                            <>
                              <button
                                type="button"
                                onClick={() => iniciarEdicion(n)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-white/85 hover:bg-white/10 transition"
                                title="Editar"
                                disabled={saving}
                              >
                                <FaPen className="text-sm" />
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarNota(n.id)}
                                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15 transition"
                                title="Eliminar"
                                disabled={saving}
                              >
                                <FaTrash className="text-sm" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                        {n.nota}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right: crear/editar */}
            <div
              className={`
                ${mobileTab === 'form' ? 'block' : 'hidden'} md:block
                p-4 sm:p-6
                bg-gradient-to-b from-zinc-950/10 to-black/20
              `}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                  {panelTitle}
                </div>

                {/* Atajo mobile: volver a historial */}
                <button
                  type="button"
                  onClick={() => setMobileTab('historial')}
                  className="md:hidden text-xs text-white/70 hover:text-white transition"
                >
                  Volver al historial
                </button>
              </div>

              {!editId ? (
                <>
                  <div className="mt-4">
                    <label className="text-xs font-medium text-white/80">
                      Nota (visible para todos)
                    </label>

                    <textarea
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      rows={6}
                      maxLength={655}
                      className="
                        mt-2 w-full rounded-2xl
                        border border-white/10
                        bg-white/5
                        px-4 py-3
                        text-sm text-white
                        placeholder:text-white/40
                        outline-none
                        focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300/40
                        resize-none
                        transition
                      "
                      placeholder="Ej: Cliente solicita autorización, queda pendiente de validación…"
                    />

                    <div className="mt-2 text-[11px] text-white/55 flex items-center justify-between">
                      <span className="opacity-80">Se guarda en historial</span>
                      <span>{String(texto || '').length}/655</span>
                    </div>

                    <div className="mt-4">
                      <label className="text-xs font-medium text-white/80">
                        Autor <span className="text-red-400">*</span>
                      </label>

                      {autorEsEditable ? (
                        <input
                          value={autorManual}
                          onChange={(e) => setAutorManual(e.target.value)}
                          className="
                            mt-2 w-full rounded-2xl
                            border border-white/10
                            bg-white/5
                            px-4 py-3
                            text-sm text-white
                            placeholder:text-white/40
                            outline-none
                            focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300/40
                            transition
                          "
                          placeholder="Escribí tu nombre…"
                        />
                      ) : (
                        <input
                          value={autorFinal}
                          readOnly
                          className="
                            mt-2 w-full rounded-2xl
                            border border-white/10
                            bg-white/5
                            px-4 py-3
                            text-sm text-white/80
                            outline-none
                          "
                        />
                      )}

                      {autorEsEditable && !autorFinal ? (
                        <div className="mt-2 text-xs text-red-300">
                          El autor es obligatorio para guardar.
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={crearNota}
                    disabled={saving}
                    className="
                      mt-5 w-full inline-flex items-center justify-center gap-2
                      rounded-2xl
                      bg-[#fc4b08] hover:bg-orange-500
                      px-4 py-3
                      text-sm font-semibold text-white
                      shadow-[0_16px_42px_rgba(252,75,8,0.25)]
                      hover:shadow-[0_18px_54px_rgba(252,75,8,0.32)]
                      transition
                      disabled:opacity-70 disabled:cursor-not-allowed
                    "
                  >
                    <FaPlus />
                    Guardar nota
                  </button>

                  <div className="mt-3 text-[11px] text-white/45">
                    Consejo: usá frases cortas y específicas. Queda trazabilidad
                    completa por autor y fecha.
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-4">
                    <label className="text-xs font-medium text-white/80">
                      Editar contenido
                    </label>

                    <textarea
                      value={editTexto}
                      onChange={(e) => setEditTexto(e.target.value)}
                      rows={6}
                      maxLength={655}
                      className="
                        mt-2 w-full rounded-2xl
                        border border-white/10
                        bg-white/5
                        px-4 py-3
                        text-sm text-white
                        outline-none
                        focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300/40
                        resize-none
                        transition
                      "
                    />

                    <div className="mt-2 text-[11px] text-white/55 flex items-center justify-between">
                      <span>
                        Autor:{' '}
                        <span className="font-semibold text-white">
                          {notaEditando?.autor_nombre || '—'}
                        </span>
                      </span>
                      <span>{String(editTexto || '').length}/655</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="
                        inline-flex items-center justify-center gap-2
                        rounded-2xl
                        border border-white/10
                        bg-white/5 hover:bg-white/10
                        px-4 py-3
                        text-sm font-semibold text-white/85
                        transition
                      "
                      disabled={saving}
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={guardarEdicion}
                      className="
                        inline-flex items-center justify-center gap-2
                        rounded-2xl
                        bg-white text-black hover:bg-white/90
                        px-4 py-3
                        text-sm font-semibold
                        transition
                        disabled:opacity-70 disabled:cursor-not-allowed
                      "
                      disabled={saving}
                    >
                      <FaSave />
                      Guardar cambios
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
