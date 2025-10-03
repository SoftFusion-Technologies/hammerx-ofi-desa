import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const FileUploadRecaptacion = ({
  usuarioId,
  onClose,
  onSuccess,
  getRecaptacion,
  fetchColaboradores
}) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const URL = `http://localhost:8080/recaptacionImport/import-recaptacion/${usuarioId}`;

  const handleFileChange = (e) => {
    setFile(e.target.files[0] ?? null);
  };

  const showErrorsModal = async (payload) => {
    const { errors = [], errors_count = 0, mode, inserted = 0 } = payload || {};
    const rowsHtml = errors
      .slice(0, 25)
      .map((e, idx) => {
        const rowIndex = e.rowIndex ?? '?';
        const msg = (e.error || '').toString();
        return `<li style="margin:6px 0"><code>Fila ${rowIndex}</code> — ${msg}</li>`;
      })
      .join('');

    await Swal.fire({
      icon: 'error',
      title: `Se detectaron ${errors_count} error(es)`,
      html: `
        <div style="text-align:left">
          <p><b>Modo:</b> ${mode || '-'}</p>
          <p><b>Insertados OK:</b> ${inserted}</p>
          <p style="margin-top:10px"><b>Detalle (primeros ${Math.min(
            25,
            errors.length
          )}):</b></p>
          <ol style="max-height:260px; overflow:auto; padding-left:18px">${
            rowsHtml || '<i>Sin detalle disponible.</i>'
          }</ol>
          ${
            errors_count > 25
              ? `<p style="margin-top:10px;opacity:.8">…y ${
                  errors_count - 25
                } más</p>`
              : ''
          }
        </div>
      `,
      showDenyButton: true,
      confirmButtonText: 'Copiar errores',
      denyButtonText: 'Cerrar',
      preConfirm: async () => {
        try {
          await navigator.clipboard.writeText(JSON.stringify(errors, null, 2));
          Swal.fire({
            icon: 'success',
            title: 'Copiado al portapapeles',
            timer: 1400,
            showConfirmButton: false
          });
        } catch {
          Swal.fire({
            icon: 'warning',
            title: 'No se pudo copiar',
            timer: 1400,
            showConfirmButton: false
          });
        }
      }
    });
  };

  const handleFileUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: 'info',
        title: 'Seleccioná un archivo',
        timer: 1400,
        showConfirmButton: false
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const { data } = await axios.post(URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // data: { message, inserted, preview?, errors_count, errors, mode }
      const { message, inserted = 0, errors_count = 0 } = data || {};

      if (errors_count > 0) {
        await showErrorsModal(data);
        // si hubo al menos 1 insert, refrescamos igual (pero no cerramos automáticamente para que vean los errores)
        if (inserted > 0) {
          await Promise.allSettled([
            getRecaptacion?.(),
            fetchColaboradores?.()
          ]);
        }
      } else {
        // éxito total: refrescamos, disparamos callback y cerramos
        await Promise.allSettled([getRecaptacion?.(), fetchColaboradores?.()]);
        onSuccess && onSuccess();

        await Swal.fire({
          icon: 'success',
          title: 'Importación exitosa',
          text: message || `Se insertaron ${inserted} registros.`,
          timer: 1500,
          showConfirmButton: false
        });

        onClose && onClose();
      }
    } catch (error) {
      const msg =
        error?.response?.data?.error || error?.message || 'Error inesperado';
      await Swal.fire({
        icon: 'error',
        title: 'Error al importar',
        html: `
          <div style="text-align:left">
            <p>Verificá que el Excel tenga las cabeceras correctas.</p>
            <pre style="white-space:pre-wrap;background:#f6f6f6;padding:10px;border-radius:8px">${msg}</pre>
          </div>
        `
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Importar Recaptación desde Excel
        </h2>

        <input
          type="file"
          accept=".xlsx, .xls, .ods"
          onChange={handleFileChange}
          className="mb-4 border border-gray-300 rounded-md p-2 w-full"
          disabled={uploading}
        />

        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleFileUpload}
            disabled={uploading || !file}
            className={`${
              uploading || !file ? 'opacity-60 cursor-not-allowed' : ''
            } bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition`}
          >
            {uploading ? 'Importando…' : 'Importar'}
          </button>

          <button
            onClick={onClose}
            disabled={uploading}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Formato soportado: .xls / .xlsx. / .ods (Se registrarán los errores por
          fila).
        </p>
      </div>
    </div>
  );
};

export default FileUploadRecaptacion;
