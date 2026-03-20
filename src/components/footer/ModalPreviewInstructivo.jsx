import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

function ModalPreviewInstructivo({
  isOpen,
  onClose,
  previewUrl,
  fileName,
  onDownload,
}) {
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    setPreviewError(false);
  }, [previewUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-800"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-700 sm:px-6">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold uppercase tracking-wide text-zinc-800 dark:text-zinc-100 sm:text-base">
              Previsualizacion de instructivo
            </h3>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {fileName || "instructivo"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto bg-zinc-100 p-3 dark:bg-zinc-900 sm:p-5">
          {!previewError && previewUrl ? (
            <img
              src={previewUrl}
              alt="Instructivo"
              className="mx-auto max-h-[62vh] w-auto rounded-lg object-contain"
              onError={() => setPreviewError(true)}
            />
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-4 text-center dark:border-zinc-600 dark:bg-zinc-800">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-100">
                No se pudo previsualizar el instructivo como imagen.
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Igualmente podes descargar el archivo desde el boton de abajo.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3 dark:border-zinc-700 sm:px-6">
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-[#fc4b08] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#df4308]"
          >
            <Download size={14} />
            Descargar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalPreviewInstructivo;
