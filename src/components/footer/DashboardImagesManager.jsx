import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ImagePlus } from 'lucide-react';

const API = 'http://localhost:8080/';

export default function DashboardImagesManager() {
  const [imagenes, setImagenes] = useState([]);
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [orden, setOrden] = useState(1);
  const [loading, setLoading] = useState(false);

  // Traer imágenes activas al montar
  const fetchImagenes = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}dashboard-images`);
      setImagenes(data);
    } catch {
      setImagenes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagenes();
  }, []);

  // Subir imagen
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Elegí un archivo primero');

    const form = new FormData();
    form.append('file', file);
    form.append('titulo', titulo);
    form.append('descripcion', descripcion);
    form.append('orden', orden);

    setLoading(true);
    try {
      await axios.post(`${API}upload-dashboard-image`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitulo('');
      setDescripcion('');
      setOrden(1);
      setFile(null);
      fetchImagenes();
      alert('Imagen subida correctamente');
    } catch {
      alert('Error al subir imagen');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar imagen (soft delete)
  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta imagen?')) return;
    setLoading(true);
    try {
      await axios.delete(`${API}dashboard-images/${id}`);
      fetchImagenes();
    } catch {
      alert('Error al eliminar imagen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#fc4b08]">
        <ImagePlus size={28} /> Imágenes del Dashboard
      </h2>
      {/* Formulario de carga */}
      <form
        className="flex flex-wrap items-end gap-3 mb-8 bg-orange-50 dark:bg-zinc-800 p-4 rounded-xl shadow"
        onSubmit={handleUpload}
        autoComplete="off"
      >
        <div>
          <label className="block text-xs font-semibold mb-1 pl-1">
            Imagen *
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          {/*
          <label className="block text-xs font-semibold mb-1 pl-1">
            Título
          </label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Título"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          /> */}
        </div>
        {/* <div>
          <label className="block text-xs font-semibold mb-1 pl-1">
            Descripción
          </label>
          <input
            type="text"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div> */}
        {/* <div>
          <label className="block text-xs font-semibold mb-1 pl-1">Orden</label>
          <input
            type="number"
            value={orden}
            min={1}
            onChange={(e) => setOrden(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-20"
          />
        </div> */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#fc4b08] hover:bg-orange-500 text-white rounded-xl px-5 py-2 font-semibold shadow transition-all"
        >
          Subir
        </button>
      </form>
      {/* Tabla/galería de imágenes */}
      <div className="grid md:grid-cols-2 gap-6">
        {imagenes.length === 0 && (
          <div className="text-gray-400 col-span-2 text-center">
            No hay imágenes cargadas.
          </div>
        )}
        {imagenes.map((img) => (
          <div
            key={img.id}
            className="relative bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow p-3 flex flex-col items-center"
          >
            <img
              key={img.id}
              src={`${API}${img.url.replace(/^uploads\//, 'public/')}`}
              alt={img.titulo || 'Imagen Dashboard'}
              className="w-auto max-w-full"
              loading="lazy"
            />
            <div className="text-center font-semibold mb-1">{img.titulo}</div>
            <div className="text-xs text-gray-500 mb-1">{img.descripcion}</div>
            <div className="text-xs text-gray-400">Orden: {img.orden}</div>
            <button
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
              onClick={() => handleDelete(img.id)}
              title="Eliminar"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
