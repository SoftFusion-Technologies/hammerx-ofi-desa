import { useState, useEffect } from 'react';

export default function ChunkIAModal({
  isOpen,
  onClose,
  chunkToEdit,
  onSuccess
}) {
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (chunkToEdit) {
      setTitulo(chunkToEdit.titulo);
      setTexto(chunkToEdit.texto);
    } else {
      setTitulo('');
      setTexto('');
    }
  }, [chunkToEdit, isOpen]);

  const handleSubmit = async () => {
    if (!titulo.trim() || !texto.trim()) return;

    setLoading(true);
    try {
      const method = chunkToEdit ? 'PUT' : 'POST';
      const url = chunkToEdit
        ? `http://localhost:8080/chunks-ia/${chunkToEdit.id}`
        : 'http://localhost:8080/chunks-ia';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, texto })
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.mensajeError || 'Error al guardar chunk');

      alert(chunkToEdit ? '✅ Chunk actualizado' : '✅ Chunk creado');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('❌ Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white max-w-xl w-full rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800">
          {chunkToEdit ? 'Editar Chunk IA' : 'Crear Chunk IA'}
        </h2>
        <input
          type="text"
          placeholder="Título descriptivo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <textarea
          placeholder="Texto del chunk (mínimo 30 caracteres)"
          rows={6}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="w-full p-2 border rounded-md"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {chunkToEdit ? 'Guardar Cambios' : 'Crear Chunk'}
          </button>
        </div>
      </div>
    </div>
  );
}
