import React, { useEffect, useState } from 'react';
import { FaDownload, FaExpandArrowsAlt, FaCompressArrowsAlt, FaTimes } from 'react-icons/fa';

function ModalPreviewComprobante({
  isOpen,
  onClose,
  previewUrl,
  fileName,
  esImagen,
  esPdf,
  onDownload,
  
}) {
  const [previewError, setPreviewError] = useState(false);
  const [expandido, setExpandido] = useState(false);

  const esPdfDetectado = Boolean(
    esPdf ||
      (!esImagen &&
        (String(fileName || '').toLowerCase().endsWith('.pdf') ||
          /\.pdf($|\?)/i.test(String(previewUrl || ''))))
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setPreviewError(false);
    setExpandido(false);
  }, [previewUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className={`w-full overflow-hidden rounded-2xl bg-white shadow-2xl transition-all ${
          expandido ? 'max-w-[99vw] h-[96vh]' : 'max-w-4xl'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold uppercase tracking-wide text-zinc-800 sm:text-base">
              Comprobante de transferencia
            </h3>
            <p className="truncate text-xs text-zinc-500">{fileName || 'comprobante'}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <FaTimes size={16} />
          </button>
        </div>

        <div
          className={`overflow-auto bg-zinc-100 p-3 sm:p-5 ${
            expandido ? 'h-[calc(96vh-130px)]' : 'max-h-[70vh]'
          }`}
        >
          {esImagen && !previewError && previewUrl ? (
            <img
              src={previewUrl}
              alt="Comprobante"
              className={`mx-auto rounded-lg object-contain ${
                expandido ? 'h-full w-full' : 'w-auto max-h-[62vh]'
              }`}
              onError={() => setPreviewError(true)}
            />
          ) : esPdfDetectado && previewUrl ? (
            <object
              data={previewUrl}
              type="application/pdf"
              className={`mx-auto w-full rounded-lg bg-white ${
                expandido ? 'h-full' : 'h-[62vh]'
              }`}
              aria-label="Comprobante PDF"
            >
              <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-center">
                <p className="text-sm font-semibold text-zinc-700">
                  No se pudo previsualizar el comprobante PDF.
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Descargalo con el boton de abajo para revisarlo completo.
                </p>
              </div>
            </object>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-center">
              <p className="text-sm font-semibold text-zinc-700">
                No se pudo previsualizar el comprobante.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Podes descargarlo con el boton de abajo.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setExpandido((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {expandido ? <FaCompressArrowsAlt size={12} /> : <FaExpandArrowsAlt size={12} />}
            {expandido ? 'Contraer' : 'Expandir'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fc4b08] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#df4308]"
          >
            <FaDownload size={13} />
            Descargar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreviewComprobante;
