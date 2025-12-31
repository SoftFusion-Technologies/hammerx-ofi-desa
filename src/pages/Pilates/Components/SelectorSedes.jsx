/*
 * Benjamin Orellana - 30-12-2025
 * Cambio: Excluir la sede "Multisede" del selector de sedes (UI) para evitar impacto
 * en pantallas donde el filtro por sede debe representar una sede física.
 */

import { FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../../AuthContext';

const SelectorSedes = ({ states, functions }) => {
  const { sedeName: sedeActual, userLevel: rolUsuario } = useAuth();

  // Benjamin Orellana - 30-12-2025
  // Excluye "Multisede" del listado del selector sin alterar el array original.
  const sedesFiltradas = (
    Array.isArray(states?.sedesData) ? states.sedesData : []
  ).filter(
    (s) =>
      String(s?.nombre || '')
        .trim()
        .toLowerCase() !== 'multisede'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4">
      <div className="hidden sm:flex flex-col items-center sm:items-start gap-2">
        {/* Encabezado alineado con el selector */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-400 rounded-full"></div>
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-widest">
              Sede Activa
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-xl font-bold text-gray-800">
                {sedeActual.toUpperCase() === "SMT"
                  ? "BARRIO SUR"
                  : sedeActual.toUpperCase() === "SANMIGUELBN"
                  ? "BARRIO NORTE"
                  : sedeActual.toUpperCase()}
              </h2>
              <div
                className={`
                              text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                              ${
                                sedeActual.toLowerCase() === "multisede" ||
                                rolUsuario === "admin"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                              }
                            `}
              >
                {sedeActual.toLowerCase() === "multisede" ||
                rolUsuario === "admin"
                  ? "Admin"
                  : "Editor"}
              </div>
            </div>
          </div>
        </div>

        {/* Descripción contextual */}
        <p className="text-sm text-gray-600 ml-4">
          {sedeActual.toLowerCase() === "multisede" || rolUsuario === "admin"
            ? "Tenés permisos para administrar todas las sedes disponibles"
            : "Solo podés realizar cambios en esta sede"}
        </p>
      </div>

      {/* EL SELECTOR DISEÑADO */}
      <div className="relative w-full max-w-md group">
        {/* Icono de ubicación (Izquierda) */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaMapMarkerAlt className="text-orange-500 group-hover:text-orange-600 transition-colors" />
        </div>

        <select
          id="select-options"
          value={states.sedeActualFiltro}
          onChange={(e) => functions.cambiarSede(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 text-base text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all cursor-pointer hover:bg-white shadow-sm appearance-none font-semibold"
        >
          <option value="" disabled>
            -- Seleccioná la sede --
          </option>

          {sedesFiltradas.map((option) => (
            <option key={option.id} value={option.id}>
              {option.nombre.toUpperCase()}
            </option>
          ))}
        </select>

        {/* Flecha Custom (Derecha) */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectorSedes;
