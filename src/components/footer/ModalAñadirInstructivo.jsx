/*  
  Autor: Sergio Manrique
  Fecha: 17/11/2025
  Descripción general: Modal para subir y vincular un archivo de instructivo a una tarjeta existente.
*/


import { useState } from "react";
import {
  X,
  Link as LinkIcon,
} from "lucide-react";

function ModalAñadirInstructivo({ isOpen, onClose, onSave, tarjeta_id }) {
  const [instructivoFile, setInstructivoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!instructivoFile) {
      return alert("Debes seleccionar un archivo de instructivo.");
    }

    const form = new FormData();
    form.append("instructivo", instructivoFile);

    setIsUploading(true);
    await onSave(tarjeta_id, form); // onSave es handleSubirInstructivo
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#fc4b08]">
            Vincular Instructivo
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Instructivo (PDF o Imagen)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              required
              onChange={(e) => setInstructivoFile(e.target.files[0])}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="text-gray-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-[#fc4b08] hover:bg-orange-500 text-white rounded-xl px-5 py-2 font-semibold shadow disabled:bg-gray-400"
            >
              {isUploading ? "Subiendo..." : "Vincular"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAñadirInstructivo;