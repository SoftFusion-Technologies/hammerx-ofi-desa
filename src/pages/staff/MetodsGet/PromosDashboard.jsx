import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FiUpload, FiTrash2 } from 'react-icons/fi';
import NavbarStaff from '../NavbarStaff';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8080/promos-mes';
const BACKEND_URL = 'http://localhost:8080';

export default function PromosDashboard() {
  const [promos, setPromos] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    orden: 1,
    file: null
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInput = useRef();

  // Cargar promos
  const fetchPromos = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setPromos(data);
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  // Manejadores de form
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setForm((f) => ({ ...f, file: files[0] }));
      if (files[0]) {
        setPreview(URL.createObjectURL(files[0]));
      }
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setForm((f) => ({ ...f, file }));
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error('Solo se permiten imágenes.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.file) {
      toast.error('Debe subir una imagen');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('titulo', form.titulo);
    formData.append('descripcion', form.descripcion);
    formData.append('orden', form.orden);
    formData.append('file', form.file);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setForm({ titulo: '', descripcion: '', orden: 1, file: null });
        setPreview(null);
        fileInput.current.value = '';
        fetchPromos();
        toast.success('¡Promo subida!');
      } else {
        toast.error('Error subiendo promo');
      }
    } catch (err) {
      toast.error('Error al conectar con el servidor');
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta promo?')) return;
    setLoading(true);
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchPromos();
      toast.success('Promo eliminada');
    } else toast.error('Error eliminando promo');
    setLoading(false);
  };

  // UI
  return (
    <>
      <Toaster position="top-right" />
      <NavbarStaff />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-orange-900 pt-10 pb-12 px-2">
        <motion.div
          initial={{ opacity: 0, y: -35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="max-w-6xl mx-auto bg-white/80 rounded-3xl shadow-2xl border border-orange-100 relative overflow-hidden"
        >
          {/* Barra superior */}
          <div className="flex items-center justify-between py-5 px-6 bg-white/70 border-b border-orange-200">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors duration-300 shadow-md">
                Volver
              </button>
            </Link>
            <div className="flex items-center gap-3">
              <FiUpload className="text-orange-500 text-2xl animate-bounce" />
              <h2 className="text-3xl font-bold text-orange-600 drop-shadow">
                Dashboard de Promos del Mes
              </h2>
            </div>
            <div />
          </div>

          {/* Formulario carga */}
          <form
            onSubmit={handleSubmit}
            className="p-8 pb-4 grid gap-4 md:grid-cols-3"
          >
            <div className="col-span-2 flex flex-col gap-4">
              <input
                type="text"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Título"
                required
                className="border-2 border-orange-200 rounded-xl p-3 text-lg focus:ring-2 focus:ring-orange-400"
                disabled={loading}
              />
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Descripción"
                className="border-2 border-orange-200 rounded-xl p-3 text-base min-h-[70px] resize-none focus:ring-2 focus:ring-orange-400"
                disabled={loading}
              />
              <div className="flex gap-3">
                <input
                  type="number"
                  name="orden"
                  value={form.orden}
                  onChange={handleChange}
                  min={1}
                  placeholder="Orden"
                  className="border-2 border-orange-200 rounded-xl p-2 w-28 focus:ring-2 focus:ring-orange-400"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className={`flex-1 bg-gradient-to-tr from-orange-500 to-[#fc4b08] hover:from-[#fc4b08] hover:to-orange-500 transition-all text-white font-bold py-2 rounded-xl text-lg shadow-lg disabled:opacity-50`}
                  disabled={loading}
                >
                  {loading ? 'Subiendo...' : 'Subir Promo'}
                </button>
              </div>
            </div>
            {/* Drag & Drop image */}
            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="file"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="group flex flex-col items-center justify-center w-full h-44 bg-orange-50 border-2 border-dashed border-orange-300 rounded-2xl cursor-pointer hover:bg-orange-100 transition-colors"
                style={{ minWidth: 180 }}
              >
                <FiUpload className="text-3xl text-orange-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-orange-500 text-sm font-bold">
                  Arrastra una imagen aquí
                </span>
                <span className="text-gray-400 text-xs">
                  o haz click para seleccionar
                </span>
                <input
                  id="file"
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleChange}
                  ref={fileInput}
                  className="hidden"
                  disabled={loading}
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 rounded-xl shadow-lg border-2 border-orange-200 object-contain h-24"
                  />
                )}
              </label>
            </div>
          </form>

          {/* Grid de promos */}
          <section className="p-8 pt-0">
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {promos.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="text-gray-400 col-span-full text-center"
                  >
                    Sin promos por ahora
                  </motion.div>
                )}
                {promos.map((promo) => (
                  <motion.div
                    layout
                    key={promo.id}
                    initial={{ opacity: 0, y: 40, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.96 }}
                    transition={{ duration: 0.28 }}
                    className="relative group bg-white/70 border-2 border-orange-100 hover:border-orange-300 hover:shadow-2xl rounded-2xl overflow-hidden flex flex-col shadow-md transition-all"
                  >
                    <motion.img
                      src={`${BACKEND_URL}/public/${promo.imagen_url.replace(
                        /^uploads\//,
                        ''
                      )}`}
                      alt={promo.titulo}
                      className="object-cover h-48 w-full group-hover:scale-105 transition-transform duration-300"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.07 }}
                    />
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-orange-600 mb-1">
                        {promo.titulo}
                      </h3>
                      <div className="text-base text-gray-600 mb-2 flex-1">
                        {promo.descripcion}
                      </div>
                      <div className="text-xs text-gray-400 mb-4">
                        Orden: {promo.orden}
                      </div>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="bg-red-500/90 hover:bg-red-700 transition-colors text-white text-xs py-1 px-3 rounded-lg flex items-center gap-2 self-end shadow"
                        disabled={loading}
                      >
                        <FiTrash2 className="text-sm" />
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </motion.div>
      </div>
    </>
  );
}
