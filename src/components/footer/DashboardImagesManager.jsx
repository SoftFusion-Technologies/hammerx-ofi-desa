import React, { useState, useEffect } from "react";
import ModalAñadirInstructivo from "./ModalAñadirInstructivo";
import ModalAñadirTarjeta from "./ModalAñadirTarjeta";
import axios from "axios";
import {
  Trash2,
  ImagePlus,
  Link as LinkIcon,
  Star, // Asegúrate de importar Star
} from "lucide-react";

const API = "http://localhost:8080/";

export default function DashboardImagesManager() {
  const [elementos, setElementos] = useState([]);
  const [file, setFile] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState(""); 
  const [orden, setOrden] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState("IMAGEN_SIMPLE"); 

  const [modalTarjeta, setModalTarjeta] = useState({
    isOpen: false,
    elemento_id: null,
  });
  const [modalInstructivo, setModalInstructivo] = useState({
    isOpen: false,
    tarjeta_id: null,
  });

  // Traer imágenes activas al montar
  const fetchElementos = async () => {
    setLoading(true);
    try {
      // Usamos la misma ruta, pero ahora devuelve los datos anidados
      const { data } = await axios.get(`${API}dashboard-images`);
      setElementos(data);
    } catch {
      setElementos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchElementos();
  }, []);

  // Subir imagen
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Elegí un archivo primero");

    const form = new FormData();
    form.append("file", file);
    form.append("titulo", titulo);
    form.append("descripcion", descripcion);
    form.append("orden", orden);
    form.append("tipo", tipo); 

    setLoading(true);
    try {
      await axios.post(`${API}upload-dashboard-image`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTitulo("");
      setDescripcion("");
      setOrden(1);
      setFile(null);
      setTipo("IMAGEN_SIMPLE"); 
      fetchElementos();
      alert("Elemento subido correctamente");
    } catch {
      alert("Error al subir el elemento");
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un elemento "Padre" (Imagen Simple O Grupo de Promos)
  const handleDeleteElemento = async (id) => {
    if (
      !window.confirm(
        "¿Seguro que querés eliminar este elemento? (Si es un grupo, se eliminarán TODAS sus tarjetitas)."
      )
    )
      return;
    setLoading(true);
    try {
      await axios.delete(`${API}dashboard-images/${id}`);
      fetchElementos(); 
    } catch {
      alert("Error al eliminar elemento");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTarjeta = async (tarjetaId) => {
    if (!window.confirm("¿Seguro que querés eliminar esta tarjetita?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API}promocion-tarjetas/${tarjetaId}`);
      fetchElementos(); 
    } catch {
      alert("Error al eliminar la tarjetita");
    } finally {
      setLoading(false);
    }
  };

  // 1. Función para manejar el toggle del estado destacado
  const handleToggleDestacado = async (tarjetaId, estadoActual) => {
    const nuevoEstado = !estadoActual;
    
    setLoading(true); 
    try {
      await axios.put(`${API}promocion-tarjetas/${tarjetaId}/destacado`, {
        destacado: nuevoEstado
      });
      fetchElementos();
    } catch (error) {
      console.error(error);
      alert("Error al cambiar el estado destacado.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubirTarjeta = async (formData) => {
    setLoading(true);
    try {
      await axios.post(`${API}promocion-tarjetas`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchElementos(); 
      alert("Tarjeta de promoción subida correctamente.");
    } catch {
      alert("Error al subir la tarjetita.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubirInstructivo = async (tarjetaId, formData) => {
    setLoading(true);
    try {
      await axios.put(
        `${API}promocion-tarjetas/${tarjetaId}/instructivo`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      fetchElementos(); 
      alert("Instructivo vinculado correctamente.");
    } catch {
      alert("Error al vincular el instructivo.");
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = async (instructivoPath) => {
    if (!instructivoPath) return alert('No hay instructivo disponible');
    try {
      const filePath = instructivoPath.replace(/^uploads\//, 'public/');
      const fullUrl = `${API}${filePath}`;
      const resp = await fetch(fullUrl);
      if (!resp.ok) throw new Error('Error de red');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = (filePath.split('/').pop() || 'instructivo').replace(/\?.*$/, '');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error descargando instructivo', e);
      alert('No se pudo descargar el instructivo');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl mt-8">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-[#fc4b08]">
        <ImagePlus size={28} /> Gestión del Dashboard
      </h2>

      <form
        className="flex flex-wrap items-end gap-4 mb-8 bg-orange-50 dark:bg-zinc-800 p-4 rounded-xl shadow"
        onSubmit={handleUpload}
        autoComplete="off"
      >
        <div>
          <label className="block text-xs font-semibold mb-1 pl-1">
            Tipo de Elemento *
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="IMAGEN_SIMPLE">Imagen Simple (Banner)</option>
            <option value="GRUPO_PROMOCION">Grupo de Promoción</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1 pl-1">
            {tipo === "IMAGEN_SIMPLE"
              ? "Imagen *"
              : "Imagen Principal del Grupo *"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            required
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        {/*
        <div>
          <label className="block text-xs font-semibold mb-1 pl-1">Orden</label>
          <input
            type="number"
            value={orden}
            min={1}
            onChange={(e) => setOrden(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-20"
          />
        </div>
        */}
        <button
          type="submit"
          disabled={loading}
          className="bg-[#fc4b08] hover:bg-orange-500 text-white rounded-xl px-5 py-2 font-semibold shadow transition-all disabled:bg-gray-400"
        >
          {loading ? "Subiendo..." : "Subir Elemento"}
        </button>
      </form>

      <div className="grid grid-cols-1 gap-6">
        {loading && elementos.length === 0 && (
          <div className="text-gray-400 col-span-1 text-center">
            Cargando...
          </div>
        )}
        {!loading && elementos.length === 0 && (
          <div className="text-gray-400 col-span-1 text-center">
            No hay elementos cargados en el dashboard.
          </div>
        )}

        {elementos.map((elemento) => (
          <div
            key={elemento.id}
            className="relative bg-zinc-100 dark:bg-zinc-800 rounded-xl shadow p-4 flex flex-col items-center"
          >
            <button
              className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 z-10"
              onClick={() => handleDeleteElemento(elemento.id)}
              title={`Eliminar ${
                elemento.tipo === "IMAGEN_SIMPLE" ? "imagen" : "grupo completo"
              }`}
            >
              <Trash2 size={16} />
            </button>

            {elemento.tipo === "IMAGEN_SIMPLE" && (
              <img
                src={`${API}${elemento.url.replace(/^uploads\//, "public/")}`}
                alt={elemento.titulo || "Imagen Dashboard"}
                className="w-auto max-w-full rounded-md"
                loading="lazy"
              />
            )}

            {elemento.tipo === "GRUPO_PROMOCION" && (
              <div className="w-full">
                <img
                  src={`${API}${elemento.url.replace(/^uploads\//, "public/")}`}
                  alt={elemento.titulo || "Imagen Título"}
                  className="w-full max-w-full rounded-md mb-4"
                  loading="lazy"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-gray-200 dark:bg-zinc-700 rounded-lg">
                  {elemento.tarjetas.map((tarjeta) => (
                    <div
                      key={tarjeta.id}
                      className={`relative bg-white dark:bg-zinc-800 p-2 rounded shadow-md flex flex-col transition-all ${
                        tarjeta.destacado 
                          ? "border-2 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-[1.02]" 
                          : ""
                      }`}
                    >
                      {/* 2. BOTÓN ESTRELLA INTERACTIVO */}
                      <button
                        onClick={() => handleToggleDestacado(tarjeta.id, tarjeta.destacado)}
                        className={`absolute -top-2 -left-2 p-1.5 rounded-full z-20 shadow-sm transition-colors border ${
                            tarjeta.destacado 
                            ? "bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-300" 
                            : "bg-gray-100 text-gray-400 border-gray-300 hover:text-yellow-400 hover:bg-white"
                        }`}
                        title={tarjeta.destacado ? "Quitar destacado" : "Destacar esta tarjeta"}
                      >
                        {/* Si está destacado, la estrella se rellena (fill). Si no, solo borde. */}
                        <Star 
                            size={14} 
                            fill={tarjeta.destacado ? "currentColor" : "none"} 
                            strokeWidth={2.5}
                        />
                      </button>

                      <img
                        src={`${API}${tarjeta.imagen_tarjeta_url.replace(
                          /^uploads\//,
                          "public/"
                        )}`}
                        alt="Tarjeta de promoción"
                        className="w-full rounded-md"
                      />

                      {/* Botón de Eliminar Tarjetita */}
                      <button
                        className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
                        onClick={() => handleDeleteTarjeta(tarjeta.id)}
                        title="Eliminar esta tarjetita"
                      >
                        <Trash2 size={12} />
                      </button>

                      {/* Info y Botón de Instructivo */}
                      <div className="mt-2 pt-2 border-t flex-grow flex flex-col justify-end">
                        {tarjeta.instructivo_url ? (
                          <button
                            type="button"
                            onClick={() => descargarArchivo(tarjeta.instructivo_url)}
                            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <LinkIcon size={12} /> Ver Instructivo
                          </button>
                        ) : (
                          <span className="text-xs text-red-500 font-semibold">
                            Sin Instructivo
                          </span>
                        )}
                        <button
                          onClick={() =>
                            setModalInstructivo({
                              isOpen: true,
                              tarjeta_id: tarjeta.id,
                            })
                          }
                          className="text-xs text-gray-500 hover:text-black dark:hover:text-white mt-1"
                        >
                          {tarjeta.instructivo_url
                            ? "Cambiar Instructivo"
                            : "Añadir Instructivo"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Botón de "Añadir Tarjetita" */}
                  <button
                    onClick={() =>
                      setModalTarjeta({
                        isOpen: true,
                        elemento_id: elemento.id,
                      })
                    }
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-md min-h-[150px] text-gray-500 hover:text-[#fc4b08] hover:border-[#fc4b08] transition-colors"
                  >
                    <ImagePlus size={32} />
                    <span className="text-sm font-semibold mt-1">
                      Añadir Tarjetita
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --- Renderizado de los Modales --- */}
      {modalTarjeta.isOpen && (
        <ModalAñadirTarjeta
          isOpen={modalTarjeta.isOpen}
          onClose={() => setModalTarjeta({ isOpen: false, elemento_id: null })}
          onSave={handleSubirTarjeta}
          elemento_id={modalTarjeta.elemento_id}
        />
      )}

      {modalInstructivo.isOpen && (
        <ModalAñadirInstructivo
          isOpen={modalInstructivo.isOpen}
          onClose={() =>
            setModalInstructivo({ isOpen: false, tarjeta_id: null })
          }
          onSave={handleSubirInstructivo}
          tarjeta_id={modalInstructivo.tarjeta_id}
        />
      )}
    </div>
  );
}