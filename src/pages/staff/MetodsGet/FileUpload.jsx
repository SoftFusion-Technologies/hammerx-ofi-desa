// FileUpload.jsx
import React, { useMemo, useRef, useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaCloudUploadAlt,
  FaDownload,
  FaFileExcel,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const bytesToHuman = (bytes = 0) => {
  const b = Number(bytes) || 0;
  if (b < 1024) return `${b} B`;
  const kb = b / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
};

const REQUIRED_HEADERS = [
  'nombre',
  'telefono',
  'dni',
  'email',
  'precio',
  'descuento',
  'preciofinal',
  'userName'
];

export default function FileUpload({
  convenioId,
  monthStart,
  onSuccess,
  // NUEVO (modo modal)
  isOpen,
  onClose
}) {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | success | error
  const [message, setMessage] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef(null);

  const isModal = typeof isOpen === 'boolean';

  // NUEVO: cerrar con ESC + lock scroll (solo si es modal)
  useEffect(() => {
    if (!isModal || !isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);

    // lock scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [isModal, isOpen, onClose]);

  const URL = useMemo(() => {
    if (!convenioId) return null;

    const qs = new URLSearchParams();
    if (monthStart) qs.set('monthStart', monthStart); // 'YYYY-MM-01 00:00:00'

    const q = qs.toString();
    return `${API_URL}/integrantesImport/import/${convenioId}${
      q ? `?${q}` : ''
    }`;
  }, [convenioId, monthStart]);

  const pickFile = () => inputRef.current?.click();

  const onFile = (f) => {
    if (!f) return;
    setFile(f);
    setStatus('idle');
    setMessage('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    onFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    onFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const clearFile = () => {
    setFile(null);
    setMessage('');
    setStatus('idle');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileUpload = async () => {
    if (!URL) {
      setStatus('error');
      setMessage(
        'No se pudo construir la URL de importación (convenioId inválido).'
      );
      return;
    }

    if (!file) {
      setStatus('error');
      setMessage('Por favor, seleccioná un archivo Excel antes de importar.');
      return;
    }

    setStatus('uploading');
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setStatus('success');
      setMessage(
        response?.data?.message || 'Importación realizada correctamente.'
      );
      // NUEVO: refrescar listado en el padre
      if (typeof onSuccess === 'function') {
        await onSuccess(response?.data); // opcional pasar data
      }
    } catch (error) {
      setStatus('error');
      setMessage(
        'Error al importar el archivo. Verificá que sea un Excel válido y que incluya estas cabeceras obligatorias.'
      );
    }
  };

  const hint = (
    <div className="mt-3 text-[11px] text-white/55 leading-relaxed">
      Cabeceras requeridas:{' '}
      <span className="inline-flex flex-wrap gap-1 align-middle">
        {REQUIRED_HEADERS.map((h) => (
          <span
            key={h}
            className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70"
          >
            {h}
          </span>
        ))}
      </span>
      <div className="mt-2 text-white/45">
        Si la importación fue exitosa, recargá la página para ver los cambios.
      </div>
    </div>
  );

  const content = (
    <div className="w-full max-w-xl mx-auto">
      <div className="rounded-3xl border border-white/10 bg-zinc-950/70 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.45)] overflow-hidden">
        <div className="h-[3px] bg-gradient-to-r from-[#fc4b08] via-orange-400 to-amber-300" />

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm sm:text-base font-extrabold text-white">
              Importar Integrantes (Excel)
            </div>
            <div className="text-xs text-white/55 mt-1">
              Subí un archivo .xlsx / .xls y procesamos el alta masiva.
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://docs.google.com/uc?export=download&id=10RSS04B847B7MC4oWWkxRqzceXY5x7p1"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:bg-white/10 transition"
            >
              <FaDownload />
              Descarga el ejemplo
            </a>

            {/* NUEVO: Botón cerrar (solo modal) */}
            {isModal && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar"
                title="Cerrar"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Dropzone */}
        <div className="px-5 sm:px-6 py-5">
          <div
            onClick={pickFile}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={[
              'cursor-pointer rounded-3xl border border-dashed',
              'bg-white/[0.03] transition',
              dragOver
                ? 'border-orange-400/60 ring-2 ring-orange-400/20'
                : 'border-white/15 hover:border-white/25',
              'p-5 sm:p-6'
            ].join(' ')}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#fc4b08]">
                <FaCloudUploadAlt className="text-2xl" />
              </div>

              <div className="text-center sm:text-left min-w-0">
                <div className="text-sm font-semibold text-white">
                  Arrastrá y soltá el Excel acá, o hacé clic para buscar
                </div>
                <div className="text-xs text-white/55 mt-1">
                  Formatos recomendados:{' '}
                  <span className="text-white/70 font-semibold">.xlsx</span> /
                  .xls
                </div>
              </div>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected file */}
          {file && (
            <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <FaFileExcel />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {file.name}
                    </div>
                    <div className="text-xs text-white/55">
                      {bytesToHuman(file.size)}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition"
                  title="Quitar archivo"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleFileUpload}
                  disabled={status === 'uploading'}
                  className="
                    w-full inline-flex items-center justify-center gap-2
                    rounded-2xl px-4 py-3 text-sm font-extrabold
                    bg-gradient-to-r from-orange-500 via-[#fc4b08] to-amber-300
                    text-white
                    shadow-[0_16px_40px_rgba(252,75,8,0.22)]
                    hover:shadow-[0_20px_50px_rgba(252,75,8,0.32)]
                    transition
                    disabled:opacity-70 disabled:cursor-not-allowed
                  "
                >
                  {status === 'uploading' ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Importando…
                    </>
                  ) : (
                    <>
                      <FaCloudUploadAlt />
                      Importar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={pickFile}
                  disabled={status === 'uploading'}
                  className="
                    w-full sm:w-auto
                    inline-flex items-center justify-center
                    rounded-2xl border border-white/10 bg-white/5
                    px-4 py-3 text-sm font-semibold text-white/85
                    hover:bg-white/10 transition
                    disabled:opacity-70 disabled:cursor-not-allowed
                  "
                >
                  Cambiar archivo
                </button>
              </div>
            </div>
          )}

          {/* Feedback */}
          {message && (
            <div
              className={[
                'mt-4 rounded-2xl border px-4 py-3 text-sm',
                status === 'error'
                  ? 'border-rose-500/25 bg-rose-500/10 text-rose-200'
                  : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
              ].join(' ')}
            >
              {message}
              {status === 'error' && hint}
            </div>
          )}

          {/* Default hint */}
          {!message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <div className="text-xs text-white/60">
                Consejo: asegurate de respetar cabeceras y tipos numéricos en
                precio/descuento/preciofinal.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // NUEVO: si es modal y está cerrado, no renderiza nada
  if (isModal && !isOpen) return null;

  // NUEVO: wrapper modal (overlay + click afuera)
  if (isModal && isOpen) {
    return (
      <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
        {/* Overlay */}
        <button
          type="button"
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          aria-label="Cerrar modal"
        />

        {/* Panel */}
        <div className="relative w-full max-w-4xl">
          {content}

          {/* Footer Cerrar (extra, por si querés botón textual) */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 font-extrabold
                         bg-white/10 text-white/85 ring-1 ring-white/10 hover:bg-white/15 hover:ring-white/20 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modo normal (no modal)
  return content;
}
