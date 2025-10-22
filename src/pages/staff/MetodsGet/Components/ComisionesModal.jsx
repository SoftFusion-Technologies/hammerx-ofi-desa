import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Search,
  SlidersHorizontal,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Pencil,
  Trash2,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ParticlesBackground from '../../../../components/ParticlesBackground';
import { ComisionesTable } from './ComisionesTable';
import ComisionEditModal from './ComisionEditModal';
/*************************************************
 * ComisionesModal v2 (Cards + Canvas Particles)
 * Autor: SoftFusion • 2025-10-19
 * Stack: React + Tailwind + Framer Motion
 * Notas:
 * - Minimalista, en modal, reemplaza tabla por grid de cards.
 * - Mantiene filtros, paginación, aprobar/rechazar/editar/eliminar.
 * - Incluye fondo con partículas canvas ultra-liviano.
 *************************************************/
const API_URL = 'http://localhost:8080/ventas-comisiones';

// ========================= Constantes =========================
const PLANES = [
  'Mensual',
  'Trimestre',
  'Semestre',
  'Anual',
  'Débitos automáticos',
  'Otros'
];
const PAGE_SIZE_DEFAULT = 20;

// ========================= Utils =========================
const cx = (...xs) => xs.filter(Boolean).join(' ');

function EstadoPill({ estado }) {
  const map = {
    en_revision: 'bg-amber-500/15 text-amber-200 ring-amber-400/30',
    aprobado: 'bg-sky-500/15 text-sky-200 ring-sky-400/30',
    rechazado: 'bg-rose-500/15 text-rose-200 ring-rose-400/30'
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

function ToolbarButton({ icon: Icon, children, className, ...props }) {
  return (
    <button
      {...props}
      className={cx(
        'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/5 active:scale-[0.99] transition text-slate-100',
        className
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

function useDebouncedCallback(cb, delay) {
  const ref = useRef({ cb, t: null });
  useEffect(() => {
    ref.current.cb = cb;
  }, [cb]);
  return useCallback(
    (...args) => {
      if (ref.current.t) clearTimeout(ref.current.t);
      ref.current.t = setTimeout(() => ref.current.cb(...args), delay);
    },
    [delay]
  );
}

// Select + "Otros" input en SweetAlert2
async function promptTipoPlanConOtros() {
  return Swal.fire({
    background: '#0f172a',
    color: '#e5e7eb',
    title: 'Tipo de plan',
    html: `
      <div style="text-align:left">
        <label for="swal-plan" style="display:block;margin-bottom:6px">Seleccioná un plan</label>
        <select id="swal-plan" class="swal2-input" style="width:100%;box-sizing:border-box;background:#111827;color:#e5e7eb;border-color:#374151">
          <option value="">-- Seleccionar --</option>
          ${PLANES.map((p) => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <div id="swal-otros-wrap" style="display:none;margin-top:8px">
          <label for="swal-otros" style="display:block;margin-bottom:6px">Detalle (si elegiste “Otros”)</label>
          <input id="swal-otros" class="swal2-input" placeholder="Ej: Plan Corporativo X" style="background:#111827;color:#e5e7eb;border-color:#374151"/>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    didOpen: () => {
      const sel = document.getElementById('swal-plan');
      const otrosWrap = document.getElementById('swal-otros-wrap');
      sel.addEventListener('change', () => {
        otrosWrap.style.display = sel.value === 'Otros' ? 'block' : 'none';
      });
    },
    preConfirm: () => {
      const sel = /** @type {HTMLSelectElement} */ (
        document.getElementById('swal-plan')
      );
      const otros = /** @type {HTMLInputElement} */ (
        document.getElementById('swal-otros')
      );
      const tipo_plan = (sel.value || '').trim();
      const tipo_plan_custom = (otros?.value || '').trim();

      if (!tipo_plan) {
        Swal.showValidationMessage('Debés seleccionar un plan');
        return false;
      }
      if (tipo_plan === 'Otros' && !tipo_plan_custom) {
        Swal.showValidationMessage('Completá el detalle para “Otros”');
        return false;
      }
      return {
        tipo_plan: tipo_plan.slice(0, 80),
        tipo_plan_custom:
          tipo_plan === 'Otros' ? tipo_plan_custom.slice(0, 120) : null
      };
    }
  }).then((r) => (r.isConfirmed ? r.value : null));
}

/***********************
 * Partículas Canvas
 ***********************/

// ========================= Componente principal =========================
export default function ComisionesModal({
  onClose,
  userLevel,
  userId,
  onComisionStateChange
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estado, setEstado] = useState('');
  const [q, setQ] = useState('');
  const [sede, setSede] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE_DEFAULT);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshSpin, setRefreshSpin] = useState(false);

  const puedeGestionar = useMemo(
    () => ['admin', 'gerente'].includes(String(userLevel).toLowerCase()),
    [userLevel]
  );

  const SEDES = ['monteros', 'concepcion', 'barrio sur', 'barrio norte'];

  const vendedoresOptions = useMemo(() => {
    const map = new Map(); // id -> name
    for (const it of items || []) {
      const id = it?.vendedor?.id ?? it?.vendedor_id;
      const name = it?.vendedor?.name ?? String(id || '');
      if (id) map.set(id, name);
    }
    // devuelve [{id, name}, ...] ordenado por nombre
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  // 1) fetchComisiones SIN depender de `page` y sin pisar con data.page
  const fetchComisiones = useCallback(
    async (p = 1, opts = {}) => {
      try {
        if (!opts.silent) setLoading(true);

        const params = {
          page: p,
          pageSize,
          ...(estado ? { estado } : {}),
          ...(q ? { q } : {}),
          ...(sede ? { sede } : {}),
          ...(vendedorId ? { vendedor_id: vendedorId } : {})
        };

        const { data } = await axios.get(API_URL, { params });

        setItems(data?.items ?? []);
        setTotal(Number(data?.total) || 0);
        // 👇 Confiamos en la página solicitada
        setPage(p);
      } catch (e) {
        Swal.fire({
          background: '#0f172a',
          color: '#e5e7eb',
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la lista.'
        });
        console.log(e);
      } finally {
        if (!opts.silent) setLoading(false);
      }
    },
    // 👇 NO incluir `page` en deps
    [estado, q, sede, vendedorId, pageSize]
  );

  // 2) Carga inicial y cuando cambian filtros "duros" (estado/sede/vendedor)
  useEffect(() => {
    fetchComisiones(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado, sede, vendedorId]);

  // 3) Búsqueda con debounce (solo cuando cambia `q`)
  useEffect(() => {
    const t = setTimeout(() => fetchComisiones(1), 380);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  // (opcional) helper para paginar sin repetir lógica
  const goToPage = (p) => {
    const target = Math.max(1, p);
    setPage(target);
    fetchComisiones(target);
  };

  const debouncedSearch = useDebouncedCallback((v) => setQ(v), 350);
  useEffect(() => {
    const t = setTimeout(() => fetchComisiones(1), 380);
    return () => clearTimeout(t);
  }, [q, fetchComisiones]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        const el = document.getElementById('cmv2-search');
        el?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ========== Acciones ==========
  const aprobar = async (row) => {
    if (!puedeGestionar) return;
    const { value: monto } = await Swal.fire({
      background: '#0f172a',
      color: '#e5e7eb',
      title: 'Monto de la comisión',
      input: 'number',
      inputAttributes: { min: 0, step: '0.01' },
      inputValidator: (v) =>
        v === '' || Number(v) < 0 ? 'Ingresá un monto válido' : undefined,
      showCancelButton: true,
      confirmButtonText: 'Aprobar',
      cancelButtonText: 'Cancelar'
    });
    if (monto === undefined) return;

    // Optimistic
    setItems((arr) =>
      arr.map((it) =>
        it.id === row.id
          ? { ...it, estado: 'aprobado', monto_comision: Number(monto) }
          : it
      )
    );

    try {
      await axios.put(
        `http://localhost:8080/ventas-comisiones/${row.id}/aprobar`,
        {
          monto_comision: Number(monto),
          moneda: 'ARS',
          user_id: userId,
          userLevel
        },
        { headers: { 'x-user-id': userId, 'x-user-role': userLevel } }
      );
      // 🔔 Notificar al padre para pintar celeste
      onComisionStateChange?.({
        prospectoId: row?.prospecto?.id,
        estado: 'aprobado',
        comisionId: row.id,
        monto: Number(monto)
      });
      Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'success',
        title: 'Aprobada',
        text: 'Comisión aprobada correctamente.'
      });
      fetchComisiones(page, { silent: true });
    } catch (e) {
      setItems((arr) =>
        arr.map((it) =>
          it.id === row.id ? { ...it, estado: 'en_revision' } : it
        )
      );
      Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aprobar la comisión.'
      });
    }
  };

  const rechazar = async (row) => {
    if (!puedeGestionar) return;
    const { value: motivo } = await Swal.fire({
      background: '#0f172a',
      color: '#e5e7eb',
      title: 'Motivo de rechazo',
      input: 'text',
      inputPlaceholder: 'Ej: Falta comprobante de pago',
      inputValidator: (v) =>
        !v || !v.trim() ? 'Ingresá un motivo' : undefined,
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar'
    });
    if (!motivo) return;

    // Optimistic
    setItems((arr) =>
      arr.map((it) =>
        it.id === row.id
          ? { ...it, estado: 'rechazado', motivo_rechazo: motivo.trim() }
          : it
      )
    );

    try {
      await axios.put(
        `http://localhost:8080/ventas-comisiones/${row.id}/rechazar`,
        { motivo_rechazo: motivo.trim(), user_id: userId, userLevel },
        { headers: { 'x-user-id': userId, 'x-user-role': userLevel } }
      );
      // 🔔 Notificar al padre para pintar rojo
      onComisionStateChange?.({
        prospectoId: row?.prospecto?.id,
        estado: 'rechazado',
        comisionId: row.id
      });
      Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'success',
        title: 'Rechazada',
        text: 'Comisión rechazada.'
      });
      fetchComisiones(page, { silent: true });
    } catch (e) {
      setItems((arr) =>
        arr.map((it) =>
          it.id === row.id ? { ...it, estado: 'en_revision' } : it
        )
      );
      Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'error',
        title: 'Error',
        text: 'No se pudo rechazar la comisión.'
      });
    }
  };

  const eliminar = async (row) => {
    const { isConfirmed } = await Swal.fire({
      background: '#0f172a',
      color: '#e5e7eb',
      title: 'Eliminar comisión',
      text: 'Esta acción no se puede deshacer. ¿Continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      confirmButtonColor: '#ef4444',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    try {
      await axios.delete(
        `http://localhost:8080/ventas-comisiones/${row.id}`,
        {
          data: { actor_id: userId } // <<<<<< clave para que el back identifique al actor
        }
      );
      await Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'success',
        title: 'Eliminada',
        text: 'Comisión eliminada.'
      });
      fetchComisiones(1);
    } catch (e) {
      await Swal.fire({
        background: '#0f172a',
        color: '#e5e7eb',
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.mensajeError || 'No se pudo eliminar.'
      });
    }
  };

  // CTA combinada: si está aprobado → mostrar "Rechazar"; si rechazado → "Aprobar"; si en revisión → ambos.
  const PrimaryAction = ({ row }) => {
    if (!puedeGestionar) return null;
    if (row.estado === 'aprobado') {
      return (
        <button
          onClick={() => rechazar(row)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ring-1 ring-rose-500 bg-rose-600/90 text-rose-50 hover:bg-rose-500/80"
        >
          <XCircle size={14} /> Rechazar
        </button>
      );
    }
    if (row.estado === 'rechazado') {
      return (
        <button
          onClick={() => aprobar(row)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ring-1 ring-sky-500 bg-sky-600/90 text-sky-50 hover:bg-sky-500/80"
        >
          <CheckCircle2 size={14} /> Aprobar
        </button>
      );
    }
    // en_revision → split actions
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => aprobar(row)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ring-1 ring-sky-500 bg-sky-600/90 text-sky-50 hover:bg-sky-500/80"
        >
          <CheckCircle2 size={14} /> Aprobar
        </button>
        <button
          onClick={() => rechazar(row)}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ring-1 ring-rose-500 bg-rose-600/90 text-rose-50 hover:bg-rose-500/80"
        >
          <XCircle size={14} /> Rechazar
        </button>
      </div>
    );
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  // reemplazá tu editar(row) por:
  const editar = (row) => {
    setEditRow(row);
    setEditOpen(true);
  };

  // ========================= Render =========================
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop clickeable para cerrar */}
        <motion.div
          className="absolute inset-0 bg-slate-950/92"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Partículas */}
        <ParticlesBackground></ParticlesBackground>
        {/* Panel */}
        <motion.div
          className="absolute inset-0 flex flex-col isolate"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
          aria-label="Gestión de comisiones"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="h-[68px] shrink-0 px-4 md:px-6 flex items-center justify-between 
                  bg-slate-900 text-slate-100 border-b border-white/10"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="text-sky-400" size={18} />
              <h2 className="font-bignoodle text-2xl  font-semibold tracking-tight">
                Gestión de comisiones
              </h2>
              <div className="hidden md:block">
                <EstadoPill estado={estado || undefined} />
              </div>
            </div>
            <ToolbarButton
              onClick={onClose}
              className="ring-white/20 hover:bg-white/10"
            >
              <X size={16} /> Cerrar
            </ToolbarButton>
          </div>

          {/* Toolbar */}
          <div
            className="px-4 md:px-6 py-3 border-b border-white/10 
                  bg-slate-900 text-slate-100"
          >
            {' '}
            {/* sin /60 y sin backdrop-blur */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1 relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="cmv2-search"
                  onChange={(e) => debouncedSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 text-slate-100 placeholder:text-slate-400 ring-1 ring-white/10 focus:ring-white/20 outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ring-1 ring-white/10 hover:ring-white/20 hover:bg-white/5 text-slate-100"
                >
                  <SlidersHorizontal size={16} /> Filtros
                </button>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="rounded-xl px-3 py-2 bg-slate-800/80 text-slate-100 ring-1 ring-white/10"
                >
                  <option value="">Todos</option>
                  <option value="en_revision">En revisión</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                <ToolbarButton
                  onClick={() => {
                    setRefreshSpin(true);
                    fetchComisiones(1).finally(() => setRefreshSpin(false));
                  }}
                >
                  <RefreshCw
                    size={16}
                    className={cx(refreshSpin && 'animate-spin')}
                  />
                  Recargar
                </ToolbarButton>
              </div>
            </div>
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Sede (select) */}
                    <select
                      value={sede}
                      onChange={(e) => setSede(e.target.value)}
                      className="rounded-xl px-3 py-2 bg-slate-800/80 text-slate-100 ring-1 ring-white/10 capitalize"
                    >
                      <option value="">Todas las sedes</option>
                      {SEDES.map((s) => (
                        <option key={s} value={s} className="capitalize">
                          {s}
                        </option>
                      ))}
                    </select>

                    {/* Vendedor (select por NOMBRE, setea vendedor_id) */}
                    <select
                      value={vendedorId}
                      onChange={(e) => setVendedorId(e.target.value)}
                      className="rounded-xl px-3 py-2 bg-slate-800/80 text-slate-100 ring-1 ring-white/10"
                    >
                      <option value="">Todos los vendedores</option>
                      {vendedoresOptions.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name} (#{v.id})
                        </option>
                      ))}
                    </select>

                    <ToolbarButton
                      onClick={() => fetchComisiones(1)}
                      className="justify-center md:justify-start"
                    >
                      Aplicar filtros
                    </ToolbarButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tabla de Comisiones */}
          <div className="flex-1 overflow-auto px-4 md:px-6 py-5">
            {loading ? (
              <div className="rounded-2xl ring-1 ring-white/10 bg-slate-900/60 backdrop-blur p-6">
                <div className="h-6 w-40 rounded bg-white/10 animate-pulse mb-4" />
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-10 w-full rounded bg-white/5 animate-pulse mb-2"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="mx-auto w-full max-w-sm">
                <div className="rounded-2xl border border-dashed border-white/15 p-8 text-slate-300 text-center">
                  <SlidersHorizontal className="mx-auto mb-2" />
                  <p>No se encontraron comisiones con los filtros actuales.</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <ToolbarButton
                      onClick={() => {
                        setEstado('');
                        setQ('');
                        setSede('');
                        setVendedorId('');
                        fetchComisiones(1);
                      }}
                    >
                      Limpiar filtros
                    </ToolbarButton>
                  </div>
                </div>
              </div>
            ) : (
              <ComisionesTable
                rows={items}
                editar={editar}
                eliminar={eliminar}
                PrimaryAction={PrimaryAction}
              />
            )}
          </div>

          {/* Footer / Paginación */}
          <div className="px-4 md:px-6 py-3 border-t border-white/10 bg-slate-900/70 backdrop-blur text-slate-200">
            <div className="flex items-center justify-between text-sm">
              <div>
                Mostrando {items.length} de {total}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 ring-white/10 disabled:opacity-50 hover:bg-white/10"
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span>
                  Página {page} / {totalPages}
                </span>
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ring-1 ring-white/10 disabled:opacity-50 hover:bg-white/10"
                >
                  Siguiente <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <ComisionEditModal
        open={editOpen}
        row={editRow}
        onClose={() => {
          setEditOpen(false);
          setEditRow(null);
        }}
        onSaved={(updated) => {
          // actualiza en memoria sin refetch (o llamá fetchComisiones(page))
          if (!updated) return;
          // si rows/ items vienen por prop/estado superior, ajustá el setter
          // Ejemplo si tenés setItems:
          setItems((prev) =>
            prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
          );
        }}
      />
    </AnimatePresence>
  );
}
