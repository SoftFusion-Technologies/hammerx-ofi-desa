import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  FaTimes,
  FaStickyNote,
  FaPlus,
  FaTrash,
  FaPen,
  FaSave,
} from "react-icons/fa";

const ensureSwalZIndex = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("swal-zfix-style")) return;

  const st = document.createElement("style");
  st.id = "swal-zfix-style";
  st.innerHTML = `
    .swal2-container{ z-index: 100000 !important; }
    .swal2-popup{ z-index: 100001 !important; }
    .swal2-backdrop-show{ z-index: 100000 !important; }
  `;
  document.head.appendChild(st);
};

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
});

const fmtAR = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-AR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export default function IntegranteNotasModal({
  isOpen,
  onClose,
  integrante,
  apiUrl = "http://localhost:8080",
  autorNombre = "",
  userLevel = "",
  canModerate = false,
  onCountChange,
}) {
  const shouldRender = Boolean(isOpen);

  useEffect(() => {
    ensureSwalZIndex();
  }, []);

  useEffect(() => {
    if (!shouldRender) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender]);

  const [loading, setLoading] = useState(false);
  const [notas, setNotas] = useState([]);

  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editTexto, setEditTexto] = useState("");

  const [modoVista, setModoVista] = useState("lista");

  const integranteId = integrante?.id;

  const [autorManual, setAutorManual] = useState("");

  const autorEsEditable =
    String(userLevel || "") === "" || String(autorNombre || "").trim() === "";

  const autorFinal = autorEsEditable
    ? String(autorManual || "").trim()
    : String(autorNombre || "").trim();

  useEffect(() => {
    if (!shouldRender) return;
    setModoVista("lista");
    if (autorEsEditable) setAutorManual(String(autorNombre || "").trim());
  }, [shouldRender, autorEsEditable, autorNombre]);

  const fetchNotas = useCallback(async () => {
    if (!integranteId) return;

    setLoading(true);
    try {
      const r = await fetch(
        `${apiUrl}/integrantes-notas?integrante_conve_id=${integranteId}`
      );
      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || "Error obteniendo notas");

      const sorted = [...(data || [])].sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return db - da;
      });

      setNotas(sorted);
      if (onCountChange) onCountChange(integranteId, sorted.length);
    } catch (e) {
      Toast.fire({
        icon: "error",
        title: e?.message || "Error al cargar notas",
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
    setTexto("");
    setEditId(null);
    setEditTexto("");
    setModoVista("lista");
    onClose?.();
  };

  const canEditDeleteNote = (note) => {
    if (canModerate) return true;
    return String(note?.autor_nombre || "") === String(autorFinal || "");
  };

  const crearNota = async () => {
    const body = String(texto || "").trim();
    if (!body) {
      Toast.fire({
        icon: "warning",
        title: "Escribí una nota antes de guardar.",
      });
      return;
    }

    const autor = String(autorFinal || "").trim();
    if (!autor) {
      Toast.fire({ icon: "warning", title: "El autor es obligatorio." });
      return;
    }

    if (!integranteId) return;

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          integrante_conve_id: integranteId,
          autor_nombre: autor,
          nota: body,
        }),
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.mensajeError || "Error creando nota");

      Toast.fire({ icon: "success", title: "Nota guardada" });
      setTexto("");
      await fetchNotas();
      setModoVista("lista");
    } catch (e) {
      Toast.fire({ icon: "error", title: e?.message || "Error al guardar" });
    } finally {
      setSaving(false);
    }
  };

  const iniciarEdicion = (note) => {
    setEditId(note.id);
    setEditTexto(note.nota || "");
    setModoVista("formulario");
  };

  const cancelarEdicion = () => {
    setEditId(null);
    setEditTexto("");
    setModoVista("lista");
  };

  const guardarEdicion = async () => {
    const body = String(editTexto || "").trim();
    if (!body) {
      Toast.fire({ icon: "warning", title: "La nota no puede quedar vacía." });
      return;
    }

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nota: body }),
      });

      const data = await r.json();
      if (!r.ok)
        throw new Error(data?.mensajeError || "Error actualizando nota");

      Toast.fire({ icon: "success", title: "Nota actualizada" });
      setEditId(null);
      setEditTexto("");
      await fetchNotas();
      setModoVista("lista");
    } catch (e) {
      Toast.fire({ icon: "error", title: e?.message || "Error al actualizar" });
    } finally {
      setSaving(false);
    }
  };

  const eliminarNota = async (noteId) => {
    const confirm = await Swal.fire({
      title: "Eliminar nota",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      const r = await fetch(`${apiUrl}/integrantes-notas/${noteId}`, {
        method: "DELETE",
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.mensajeError || "Error eliminando nota");

      Toast.fire({ icon: "success", title: "Nota eliminada" });
      await fetchNotas();
    } catch (e) {
      Toast.fire({ icon: "error", title: e?.message || "Error al eliminar" });
    } finally {
      setSaving(false);
    }
  };

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
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
          onClick={close}
        />

        <motion.div
          initial={{ y: 28, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.99 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="
            relative w-full sm:w-[600px] sm:max-w-[95vw]
            h-[92vh] sm:h-auto sm:max-h-[85vh]
            rounded-t-3xl sm:rounded-3xl
            border border-white/10
            bg-zinc-950/90 backdrop-blur-xl
            shadow-[0_30px_90px_rgba(0,0,0,0.55)]
            overflow-hidden flex flex-col
          "
        >
          <div className="h-[3px] bg-gradient-to-r from-[#fc4b08] via-orange-400 to-amber-300 flex-shrink-0" />

          <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 text-[#fc4b08]">
                {modoVista === "formulario" ? (
                  editId ? (
                    <FaPen />
                  ) : (
                    <FaPlus />
                  )
                ) : (
                  <FaStickyNote />
                )}
              </span>
              <div>
                <h3 className="text-base font-bold text-white leading-none">
                  {modoVista === "formulario"
                    ? editId
                      ? "Editar Nota"
                      : "Nueva Nota"
                    : "Notas"}
                </h3>
                {modoVista === "lista" && (
                  <p className="text-xs text-white/50 mt-1">
                    Historial de {integrante?.nombre}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {modoVista === "lista" && (
                <button
                  onClick={() => setModoVista("formulario")}
                  className="
                    px-4 py-2 rounded-xl bg-[#fc4b08] hover:bg-orange-500
                    text-white text-sm font-semibold transition
                    shadow-[0_4px_12px_rgba(252,75,8,0.2)]
                    flex items-center gap-2
                  "
                >
                  <FaPlus className="text-xs" />
                  <span>Agregar nota</span>
                </button>
              )}

              <button
                type="button"
                onClick={close}
                className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0 bg-white/[0.02]">
            {modoVista === "lista" && (
              <div className="p-4 sm:p-6 space-y-3">
                {loading ? (
                  <div className="text-center text-white/50 py-10 animate-pulse">
                    Cargando notas...
                  </div>
                ) : notas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-white/40">
                    <FaStickyNote className="text-4xl mb-3 opacity-20" />
                    <p className="text-sm">No hay notas registradas.</p>
                  </div>
                ) : (
                  notas.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                            <span className="text-sm font-bold text-white">
                              {n.autor_nombre}
                            </span>
                            <span className="text-xs text-white/40">
                              • {fmtAR(n.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
                            {n.nota}
                          </p>
                        </div>

                        {canEditDeleteNote(n) && (
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => iniciarEdicion(n)}
                              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition"
                              title="Editar"
                            >
                              <FaPen className="text-xs" />
                            </button>
                            <button
                              onClick={() => eliminarNota(n.id)}
                              className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition"
                              title="Eliminar"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {modoVista === "formulario" && (
              <div className="p-4 sm:p-6">
                <label className="block text-xs font-medium text-white/60 mb-2 pl-1">
                  Contenido de la nota
                </label>
                <textarea
                  value={editId ? editTexto : texto}
                  onChange={(e) =>
                    editId
                      ? setEditTexto(e.target.value)
                      : setTexto(e.target.value)
                  }
                  autoFocus
                  className="
                    w-full h-40 rounded-2xl border border-white/10 bg-black/20
                    px-4 py-3 text-sm text-white placeholder:text-white/20
                    focus:ring-2 focus:ring-[#fc4b08]/50 outline-none resize-none
                  "
                  placeholder="Escribe el detalle aquí..."
                />

                <div className="mt-4">
                  <label className="block text-xs font-medium text-white/60 mb-2 pl-1">
                    Autor
                  </label>
                  {autorEsEditable ? (
                    <input
                      value={autorManual}
                      onChange={(e) => setAutorManual(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-[#fc4b08]/50 outline-none"
                      placeholder="Tu nombre"
                    />
                  ) : (
                    <div className="w-full rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm text-white/50">
                      {autorFinal}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={
                      editId ? cancelarEdicion : () => setModoVista("lista")
                    }
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 text-sm font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editId ? guardarEdicion : crearNota}
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-[#fc4b08] hover:bg-orange-500 text-white text-sm font-bold shadow-lg shadow-orange-500/20 transition flex justify-center items-center gap-2"
                  >
                    {saving ? (
                      "Guardando..."
                    ) : (
                      <>
                        <FaSave /> Guardar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
