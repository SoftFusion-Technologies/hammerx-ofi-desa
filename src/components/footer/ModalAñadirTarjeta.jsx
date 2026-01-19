/*  
  Autor: Sergio Manrique
  Fecha: 17/11/2025
  Descripción general: Componente modal que permite subir una tarjeta de promoción,
  con imagen obligatoria, instructivo opcional y un número de orden.
*/

import { useState } from "react";
import {
  X,
  Link as LinkIcon,
} from "lucide-react";

function ModalAñadirTarjeta({ isOpen, onClose, onSave, elemento_id }) {
  const [tarjetaFile, setTarjetaFile] = useState(null);
  const [instructivoFile, setInstructivoFile] = useState(null);
  const [orden, setOrden] = useState(1);
  const [destacado, setDestacado] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tarjetaFile) {
      return alert("Debes seleccionar al menos la imagen de la tarjetita.");
    }

    const form = new FormData();
    form.append("elemento_id", elemento_id);
    form.append("orden", orden);
    form.append("destacado", destacado);
    form.append("imagen_tarjeta", tarjetaFile);
    if (instructivoFile) {
      form.append("instructivo", instructivoFile);
    }

    setIsUploading(true);
    await onSave(form); // La función onSave (handleSubirTarjeta) maneja el try/catch y el fetch
    setIsUploading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#fc4b08]">
            Añadir Nueva Tarjeta de Promo
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Imagen de la Tarjeta (Obligatorio)
            </label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setTarjetaFile(e.target.files[0])}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">
              Instructivo (Opcional - PDF o Imagen)
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setInstructivoFile(e.target.files[0])}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
            />
          </div>
          
          {/* Estructura para mostrar Orden y el Checkbox */}
          <div className="flex gap-4 mb-6">
            <div className="w-24">
              <label className="block text-sm font-semibold mb-1">Orden</label>
              <input
                type="number"
                min={1}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full"
              />
            </div>
            {/* Checkbox de destacado */}
            <div className="flex items-center pt-6">
              <input
                id="checkDestacado"
                type="checkbox"
                checked={destacado}
                onChange={(e) => setDestacado(e.target.checked)}
                className="w-4 h-4 text-[#fc4b08] bg-gray-100 border-gray-300 rounded focus:ring-[#fc4b08] cursor-pointer"
              />
              <label htmlFor="checkDestacado" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-pointer select-none">
                ¿Destacar tarjeta?
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="text-gray-600">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-[#fc4b08] hover:bg-orange-500 text-white rounded-xl px-5 py-2 font-semibold shadow disabled:bg-gray-400"
            >
              {isUploading ? "Subiendo..." : "Guardar Tarjeta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ModalAñadirTarjeta;