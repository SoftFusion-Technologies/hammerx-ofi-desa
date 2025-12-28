import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

// Helpers
const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';
const MAX_MB = 30;

const monthLabelAR = (d) =>
  new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' }).format(
    d
  );

const toMonthStartMysql = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01 00:00:00`;
};

const parseMysqlDate = (v) => {
  if (!v) return null;
  if (v instanceof Date) return v;
  const s = String(v);
  // "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ss"
  const isoLike = s.includes(' ') ? s.replace(' ', 'T') : s;
  const d = new Date(isoLike);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isSameYearMonth = (a, b) =>
  a &&
  b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth();

export default function ImagesUpload({
  convenioId,
  // Compatibilidad si todavía lo pasás
  selectedMonth,
  setSelectedMonth,

  // NUEVO recomendado (para año+mes real)
  monthCursor, // Date
  monthStart // string "YYYY-MM-01 00:00:00"
}) {
  const { userLevel } = useAuth();
  const canManage = userLevel === '';

  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);

  const [loadingList, setLoadingList] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');

  // Target month (prioridad: monthCursor > monthStart > selectedMonth (año actual) > hoy)
  const targetDate = useMemo(() => {
    if (monthCursor instanceof Date && !Number.isNaN(monthCursor.getTime())) {
      return new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
    }
    if (typeof monthStart === 'string' && monthStart.trim()) {
      const d = parseMysqlDate(monthStart);
      if (d) return new Date(d.getFullYear(), d.getMonth(), 1);
    }
    if (
      typeof selectedMonth === 'number' &&
      selectedMonth >= 0 &&
      selectedMonth <= 11
    ) {
      const y = new Date().getFullYear();
      return new Date(y, selectedMonth, 1);
    }
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }, [monthCursor, monthStart, selectedMonth]);

  const targetMonthStartMysql = useMemo(
    () => toMonthStartMysql(targetDate),
    [targetDate]
  );

  // Si el padre sigue usando selectedMonth, lo sincronizamos suavemente (opcional)
  useEffect(() => {
    if (typeof setSelectedMonth === 'function') {
      const m = targetDate.getMonth();
      if (typeof selectedMonth === 'number' && selectedMonth !== m) {
        setSelectedMonth(m);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate]);

  const fetchList = useCallback(async () => {
    if (!convenioId) return;
    setErr('');
    setLoadingList(true);
    try {
      // Ideal: backend ya devuelve por convenio
      const { data } = await axios.get(`${API_BASE}/images/${convenioId}`);
      const list = Array.isArray(data?.images)
        ? data.images
        : Array.isArray(data)
        ? data
        : [];
      setItems(list);
    } catch (e) {
      console.error(e);
      setErr('No se pudieron cargar los comprobantes.');
      setItems([]);
    } finally {
      setLoadingList(false);
    }
  }, [convenioId]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filtered = useMemo(() => {
    return (items || []).filter((it) => {
      const d = parseMysqlDate(it.created_at || it.fecha || it.createdAt);
      return isSameYearMonth(d, targetDate);
    });
  }, [items, targetDate]);

  const validateFile = (f) => {
    if (!f) return 'Por favor seleccioná un archivo.';
    const isImage =
      f.type === 'image/jpeg' ||
      f.type === 'image/png' ||
      f.type === 'image/jpg';
    if (!isImage) return 'Formato inválido. Solo JPG/PNG.';
    const mb = f.size / (1024 * 1024);
    if (mb > MAX_MB) return `El archivo supera ${MAX_MB}MB.`;
    return '';
  };

  const onPickFile = (f) => {
    const msg = validateFile(f);
    if (msg) {
      setFile(null);
      setErr(msg);
      return;
    }
    setErr('');
    setFile(f);
  };

  const handleUpload = async () => {
    if (!convenioId) return;
    const msg = validateFile(file);
    if (msg) {
      setErr(msg);
      return;
    }

    setUploading(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fecha', targetMonthStartMysql);

      await axios.post(`${API_BASE}/upload/${convenioId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      await fetchList();
    } catch (e) {
      console.error(e);
      setErr('Error al subir el comprobante.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const ok = window.confirm(
      '¿Eliminar este comprobante? Esta acción no se puede deshacer.'
    );
    if (!ok) return;

    setErr('');
    try {
      // En tu código viejo era imagesget/:id
      await axios.delete(`${API_BASE}/imagesget/${id}`);
      await fetchList();
    } catch (e) {
      console.error(e);
      setErr('No se pudo eliminar el comprobante.');
    }
  };

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-white/90">
            Comprobantes (Imágenes)
          </h3>
          <p className="mt-1 text-xs text-white/60">
            Mes:{' '}
            <span className="text-white/80 font-semibold">
              {monthLabelAR(targetDate)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={fetchList}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl shadow-[0_10px_30px_-18px_rgba(0,0,0,0.65)] transition hover:bg-white/[0.08] active:scale-[0.99]"
        >
          Actualizar
        </button>
      </div>

      {/* Dropzone / Uploader */}
      {canManage && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-3 shadow-[0_18px_55px_rgba(0,0,0,0.25)]">
          <label className="block">
            <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] p-4 transition hover:bg-white/[0.05]">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-white/80">
                  Subir imagen (JPG/PNG) hasta {MAX_MB}MB
                </p>
                <p className="text-[11px] text-white/55">
                  Se guardará asociada al mes seleccionado.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="mt-2 block w-full text-xs text-white/80 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white/80 hover:file:bg-white/15"
                />

                {file && (
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-white/80">
                        {file.name}
                      </span>
                      <span className="text-[11px] text-white/50">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="inline-flex items-center justify-center rounded-xl bg-[#ff4d00] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setErr('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur-xl transition hover:bg-white/[0.06] active:scale-[0.99]"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            </div>
          </label>
        </div>
      )}

      {err && (
        <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
          {err}
        </div>
      )}

      {/* List */}
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/70">
            Disponibles:{' '}
            <span className="text-white/90">{filtered.length}</span>
          </p>
          {loadingList && (
            <p className="text-[11px] text-white/50">Cargando…</p>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-white/60">
            No hay imágenes cargadas para este mes.
          </div>
        ) : (
          <div
            className="
        mt-3
        max-h-[340px] overflow-y-auto
        rounded-2xl
        pr-1
        [scrollbar-gutter:stable]
      "
          >
            <ul className="space-y-2">
              {filtered.map((it, idx) => {
                const d = parseMysqlDate(
                  it.created_at || it.fecha || it.createdAt
                );
                const label =
                  d?.toLocaleString('es-AR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) || '—';

                return (
                  <li
                    key={it.id ?? `${idx}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl px-4 py-3 shadow-[0_14px_45px_rgba(0,0,0,0.22)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white/85">
                          Comprobante #{idx + 1}
                          <span className="ml-2 text-[11px] font-normal text-white/50">
                            {label}
                          </span>
                        </p>
                        <p className="mt-1 truncate text-[11px] text-white/55">
                          {it.image_path || it.path || it.nombre || '—'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`${API_BASE}/download/${it.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-semibold text-white/80 transition hover:bg-white/[0.06]"
                        >
                          Ver
                        </a>

                        {canManage && (
                          <button
                            type="button"
                            onClick={() => handleDelete(it.id)}
                            className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-[11px] font-bold text-red-100 transition hover:bg-red-500/15"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
