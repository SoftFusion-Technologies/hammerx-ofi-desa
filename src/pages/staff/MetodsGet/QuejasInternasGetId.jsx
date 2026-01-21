/*
 * Programador: Manrique Sergio Gustavo
 * Modificación: Agregada visualización de imágenes con visor interno (Lightbox) y descarga directa.
 */
import React, { useState } from 'react';
import { FaTimes, FaCamera, FaDownload, FaExpand } from 'react-icons/fa'; 
import '../../../styles/MetodsGet/GetUserId.css';

const QuejasDetails = ({ queja, isOpen, onClose, setSelectedQueja }) => {

  // Estado para manejar la imagen que se está viendo en grande
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  if (!isOpen || !queja) return null;

  // URL base donde el backend sirve las fotos
  const BASE_URL_UPLOADS = 'http://localhost:8080/uploads/quejas/';

  // Función para forzar la descarga de la imagen
  const handleDescargar = async (urlImagen, nombreArchivo) => {
    try {
      const response = await fetch(urlImagen);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Usamos el nombre original o un genérico
      link.download = nombreArchivo || `imagen-queja-${queja.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <>
      {/* MODAL PRINCIPAL DE DETALLE */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          
          {/* Encabezado */}
          <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 bg-gray-50">
            <h2 className="text-xl font-bold text-orange-600 font-bignoodle tracking-wide">
              Detalles de la Queja #{queja.id}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 transition-all"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Cuerpo Scrollable */}
          <div className="p-6 overflow-y-auto space-y-4">
            
            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold">Fecha</p>
                <p className="text-zinc-800 font-medium">{new Date(queja.created_at).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold">Sede</p>
                <p className="text-zinc-800 font-medium">{queja.sede}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold">Cliente</p>
                <p className="text-zinc-800 font-medium">{queja.nombre || '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-zinc-500 text-xs uppercase font-bold">Contacto</p>
                <p className="text-zinc-800 font-medium">{queja.contacto || '-'}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-zinc-500 text-xs uppercase font-bold mb-1">Motivo / Detalle</p>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-zinc-700 leading-relaxed">
                {queja.motivo}
              </div>
            </div>

            {/* Información de Resolución */}
            <div className="border-t border-zinc-100 pt-4 mt-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${queja.resuelto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {queja.resuelto ? 'RESUELTO' : 'PENDIENTE'}
                </span>
                {queja.resuelto === 1 && (
                  <span className="text-xs text-zinc-500">
                    por <strong>{queja.resuelto_por}</strong> el {new Date(queja.fecha_resuelto).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            {/* Galería de Imágenes */}
            {queja.imagenes && queja.imagenes.length > 0 && (
              <div className="border-t border-zinc-100 pt-5 mt-2">
                <h3 className="flex items-center gap-2 text-md font-bold text-zinc-700 mb-3">
                  <FaCamera className="text-orange-500" /> Imágenes Adjuntas
                </h3>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {queja.imagenes.map((img, idx) => {
                    const fullUrl = `${BASE_URL_UPLOADS}${img.url}`;
                    return (
                      <div key={img.id || idx} className="group relative aspect-square rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-sm">
                        {/* Imagen Miniatura */}
                        <img 
                          src={fullUrl} 
                          alt={`Adjunto ${idx + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Error+Img'; }}
                        />
                        
                        {/* Overlay con acciones */}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                          
                          {/* Botón Ampliar */}
                          <button 
                            onClick={() => setImagenAmpliada(fullUrl)}
                            className="bg-white/90 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-orange-500 hover:text-white transition-colors w-28 justify-center"
                          >
                            <FaExpand /> Ampliar
                          </button>

                          {/* Botón Descargar */}
                          <button 
                            onClick={() => handleDescargar(fullUrl, img.url)}
                            className="bg-white/90 text-zinc-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-colors w-28 justify-center"
                          >
                            <FaDownload /> Descargar
                          </button>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* VISOR DE IMAGEN AMPLIADA (LIGHTBOX) */}
      {imagenAmpliada && (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          
          {/* Botón Cerrar Visor */}
          <button 
            onClick={() => setImagenAmpliada(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
          >
            <FaTimes size={24} />
          </button>

          {/* Imagen Grande */}
          <img 
            src={imagenAmpliada} 
            alt="Vista ampliada" 
            className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
          />

          {/* Barra inferior del visor */}
          <div className="mt-4 flex gap-4">
             <button 
                onClick={() => setImagenAmpliada(null)}
                className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm hover:bg-zinc-700 transition-colors"
             >
               Cerrar
             </button>
             
             <button 
                onClick={() => handleDescargar(imagenAmpliada)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-orange-700 transition-colors"
             >
               <FaDownload /> Descargar Original
             </button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuejasDetails;