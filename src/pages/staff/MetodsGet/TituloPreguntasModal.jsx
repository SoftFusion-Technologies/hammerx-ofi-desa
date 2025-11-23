/*
 * Programador: Emir Segovia
 * Actualización diseño: Benjamin Orellana / SoftFusion
 * Fecha Actualización: 22 / 11 / 2025
 * Versión: 1.1
 *
 * Descripción:
 * Modal que muestra el listado de preguntas frecuentes con buscador
 * y diseño moderno, integrado al ecosistema visual del dashboard.
 *
 * Tema: Renderización
 * Capa: Frontend
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, HelpCircle, X } from 'lucide-react';

const TituloPreguntasModal = ({
  isOpen,
  onClose,
  preguntas,
  onPreguntaSelect
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const lista = Array.isArray(preguntas) ? preguntas : [];

  const sortedPreguntas = lista
    .filter((pregunta) => {
      if (!search) return true;
      return pregunta.titulo
        ?.toLowerCase()
        .includes(search.trim().toLowerCase());
    })
    .sort((a, b) => {
      const oa = typeof a.orden === 'number' ? a.orden : 9999;
      const ob = typeof b.orden === 'number' ? b.orden : 9999;
      return oa - ob;
    });

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
            className="relative w-full max-w-2xl mx-4 rounded-3xl bg-white/95 shadow-[0_24px_60px_rgba(15,23,42,0.4)] border border-slate-100 overflow-hidden"
            onClick={stopPropagation}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 pt-5 pb-4 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/70">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Preguntas frecuentes
                  </h2>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mt-1">
                    Guía rápida para el staff
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-colors"
                aria-label="Cerrar listado de preguntas"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Buscador */}
            <div className="px-6 pt-4 pb-3 border-b border-slate-100 bg-white/80">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por título de pregunta..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/40 focus:outline-none transition-all"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {sortedPreguntas.length} resultado
                {sortedPreguntas.length === 1 ? '' : 's'} encontrados.
              </p>
            </div>

            {/* Lista de preguntas */}
            <div className="px-2 pb-4 pt-2 max-h-[60vh] overflow-y-auto">
              {sortedPreguntas.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-400">
                  No se encontraron preguntas que coincidan con la búsqueda.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {sortedPreguntas.map((pregunta) => (
                    <li key={pregunta.id}>
                      <button
                        type="button"
                        onClick={() => onPreguntaSelect(pregunta)}
                        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50/90 group transition-colors"
                      >
                        <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/8 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <HelpCircle className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="uppercase text-sm font-medium text-slate-900 group-hover:text-slate-900">
                            {pregunta.titulo}
                          </p>
                          {typeof pregunta.orden === 'number' && (
                            <p className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                              Orden #{pregunta.orden}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TituloPreguntasModal;
