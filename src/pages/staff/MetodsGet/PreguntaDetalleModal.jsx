/*
 * Programador: Emir Segovia
 * Actualización diseño: Benjamin Orellana / SoftFusion
 * Fecha Actualización: 22 / 11 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (PreguntaDetalleModal.jsx) es el componente que renderiza el
 * detalle de las preguntas frecuentes, con diseño moderno y galáctico.
 *
 * Tema: Renderización
 * Capa: Frontend
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, AlertTriangle } from 'lucide-react';

const BASE_URL = 'http://localhost:8080';

const PreguntaDetalleModal = ({ isOpen, onClose, pregunta }) => {
  const [imagenn, setImagen] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorImgs, setErrorImgs] = useState(null);

  // Cargar listado de imágenes asociadas a la pregunta
  useEffect(() => {
    if (!isOpen || !pregunta?.id) return;

    const cargarImagenes = async () => {
      try {
        setErrorImgs(null);
        const response = await axios.get(
          `${BASE_URL}/imagenes_preguntas_frec/${pregunta.id}`
        );
        setImagenes(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error al cargar las imágenes:', err);
        setErrorImgs('No se pudieron cargar las imágenes.');
        setImagenes([]);
      }
    };

    cargarImagenes();
  }, [isOpen, pregunta?.id]);

  // Cargar la imagen principal (mantengo tu endpoint original)
  useEffect(() => {
    if (!isOpen || !pregunta?.id) return;

    const fetchImagen = async (idPregunta) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/imagenes-preguntas/pregunta/${idPregunta}`
        );
        setImagen(response.data?.imagen || null);
      } catch (err) {
        console.error('Error al obtener la imagen principal:', err);
        setImagen(null);
      } finally {
        setLoading(false);
      }
    };

    fetchImagen(pregunta.id);
  }, [isOpen, pregunta?.id]);

  if (!isOpen || !pregunta) return null;

  const handleOverlayClick = () => {
    onClose && onClose();
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl mx-4 rounded-3xl bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.4)] border border-slate-100 overflow-hidden"
            onClick={stopPropagation}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-5 pb-4 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    {pregunta.titulo}
                  </h2>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mt-1">
                    Pregunta frecuente · Staff
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                aria-label="Cerrar detalle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenido scrollable */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {/* Descripción */}
              <div className="mb-4">
                <div
                  className="text-sm text-slate-700 leading-relaxed space-y-2"
                  dangerouslySetInnerHTML={{ __html: pregunta.descripcion }}
                />
              </div>

              {/* Imágenes */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Material de apoyo
                  </h3>
                  {loading && (
                    <span className="text-[11px] text-slate-400">
                      Cargando imágenes…
                    </span>
                  )}
                </div>

                {errorImgs && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{errorImgs}</span>
                  </div>
                )}

                {/* Si hay listado y además imagen principal -> mostramos la principal */}
                {imagenes.length > 0 && imagenn && !loading && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 bg-slate-50">
                    <img
                      src={`${BASE_URL}/imagenes-preguntas/${imagenn}`}
                      alt="Imagen asociada a la pregunta frecuente"
                      className="w-full h-auto object-contain max-h-[420px]"
                    />
                  </div>
                )}

                {/* Si no hay imágenes */}
                {!loading && (imagenes.length === 0 || !imagenn) && (
                  <p className="mt-2 text-xs text-slate-400 italic">
                    No hay imágenes cargadas para esta pregunta.
                  </p>
                )}

                {/* Indicador de cantidad si hay más registros en el backend */}
                {!loading && imagenes.length > 1 && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Esta pregunta tiene {imagenes.length} registros de imagen en
                    el sistema. Mostrando la principal.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PreguntaDetalleModal;
