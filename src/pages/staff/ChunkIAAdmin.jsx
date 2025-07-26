import { useEffect, useState } from 'react';
import ChunkIAModal from './ChunkIAModal';
import { FaEdit, FaTrash, FaPlusCircle } from 'react-icons/fa';

export default function ChunkIAAdmin() {
  const [chunks, setChunks] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [chunkEditando, setChunkEditando] = useState(null);

  const cargarChunks = async () => {
    try {
      const res = await fetch('http://localhost:8080/chunks-ia');
      const data = await res.json();
      setChunks(data);
    } catch (error) {
      console.error('Error cargando chunks:', error);
    }
  };

  useEffect(() => {
    cargarChunks();
  }, []);

  const eliminarChunk = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este chunk?')) return;
    await fetch(`http://localhost:8080/chunks-ia/${id}`, { method: 'DELETE' });
    cargarChunks();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🧠 Chunks IA</h1>
        <button
          onClick={() => {
            setChunkEditando(null);
            setMostrarModal(true);
          }}
          className="flex items-center gap-2 bg-[#fc4b08] hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <FaPlusCircle />
          Nuevo Chunk
        </button>
      </div>

      <div className="grid gap-4">
        {chunks.length === 0 ? (
          <div className="text-gray-400 text-center mt-10">
            No hay chunks registrados aún.
          </div>
        ) : (
          chunks.map((chunk) => (
            <div
              key={chunk.id}
              className="relative bg-white border-l-4 border-[#fc4b08] p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {chunk.titulo}
              </h2>
              <p className="text-gray-600 text-sm max-h-28 overflow-hidden whitespace-pre-line">
                {chunk.texto.length > 300
                  ? `${chunk.texto.slice(0, 300)}...`
                  : chunk.texto}
              </p>

              <div className="absolute top-4 right-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setChunkEditando(chunk);
                    setMostrarModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                  title="Editar"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => eliminarChunk(chunk.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Eliminar"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <ChunkIAModal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        chunkToEdit={chunkEditando}
        onSuccess={cargarChunks}
      />
    </div>
  );
}
