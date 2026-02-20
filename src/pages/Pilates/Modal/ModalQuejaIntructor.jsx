/*
 * Autor: Sergio Manrique
 * Fecha: 20/02/2026
 * Descripción: Modal para que el instructor de Pilates pueda enviar quejas internas sobre el funcionamiento, incidencias o problemas detectados en la sede.
 */
import React, { useState } from 'react'
import { useInstructorAuth } from '../../../AuthInstructorContext';

const ModalQuejaIntructor = ({ estaAbierto, alCerrar, alEnviar, nombreSede }) => {
  const [motivo, setMotivo] = useState("");

  if (!estaAbierto) return null;

  const manejarEnvio = () => {
      alEnviar(motivo);
      setMotivo("");
      alCerrar();
  };

  const manejarCierre = () => {
    setMotivo("");
    alCerrar();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 font-messina">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 rounded-t-xl">
          <h2 className="text-xl font-bold font-bignoodle">Queja de Instructor</h2>
        </div>
        
        <div className="p-5">
          <div className="mb-5">
            <label className="block text-gray-700 font-bold mb-2">
              Motivo de la queja
            </label>
            {/* 👇 Leyenda pequeña explicativa */}
            <p className="text-xs text-gray-500 mb-2">
              Describa brevemente el motivo de su queja. Esta información será revisada por el equipo administrativo.
            </p>
            
            <textarea
              className="shadow border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="4"
              placeholder="Escriba su motivo aquí..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={manejarCierre}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={manejarEnvio}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50"
              disabled={motivo.trim() === ""}
            >
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalQuejaIntructor