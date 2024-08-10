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

import React from 'react';

const PreguntaDetalleModal = ({ isOpen, onClose, pregunta }) => {
  if (!isOpen || !pregunta) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto overflow-y-auto max-h-full">
        <button className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={onClose}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        <h2 className="text-xl font-bold mb-4">{pregunta.titulo}</h2>
        <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: pregunta.descripcion }} />
      </div>
    </div>
  );
};

export default PreguntaDetalleModal;
