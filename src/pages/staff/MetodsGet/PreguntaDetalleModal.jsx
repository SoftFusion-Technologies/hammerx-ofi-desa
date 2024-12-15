/*
 * Programador: Emir Segovia
 * Fecha Cración: 05 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (PreguntaDetalleModal.jsx) es el componente el cual renderiza los datos de la de las preguntas frecuentes.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: emirvalles90f@gmail.com || 3865761910
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PreguntaDetalleModal = ({ isOpen, onClose, pregunta }) => {
  if (!isOpen || !pregunta) return null;

  const [imagenn, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagenes, setImagenes] = useState([]);

  // Cargar las imágenes cuando el componente se monta
  const cargarImagenes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/imagenes_preguntas_frec/${pregunta.id}`
      );
      setImagenes(response.data);
    } catch (err) {
      setError('Error al cargar las imágenes');
      console.error(err);
    }
  };

  useEffect(() => {
    cargarImagenes();
  }, [pregunta.id]); // Se ejecuta cuando cambia `preguntaId`

  useEffect(() => {
    if (isOpen && pregunta?.id) {
      fetchImagen(pregunta.id);
    }
  }, [isOpen, pregunta]);

  const fetchImagen = async (idPregunta) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/imagenes-preguntas/pregunta/${idPregunta}`
      );
      setImagen(response.data.imagen);
    } catch (err) {
      console.error('Error al obtener la imagen:', err);
      // setError('No se pudo cargar la imagen.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto overflow-y-auto max-h-full">
        <button
          className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">{pregunta.titulo}</h2>
        <p
          className="text-gray-700"
          dangerouslySetInnerHTML={{ __html: pregunta.descripcion }}
        />

        {imagenes.length > 0 ? (
          imagenes.map((imagen) => (
            <div key={imagen.id}>
              <img
                src={`http://localhost:8080/imagenes-preguntas/${imagenn}`}
                alt="Imagen de la pregunta"
                className="w-full h-auto rounded-lg"
              />
            </div>
          ))
        ) : (
          <p className="mt-5 font-bold">No hay imágenes para esta pregunta.</p>
        )}
      </div>
    </div>
  );
};

export default PreguntaDetalleModal;
