import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SelectSedes = ({ value, onChange }) => {
  const [sedes, setSedes] = useState([]);

  const URL = 'http://localhost:8080/Sedes/';

  useEffect(() => {
    const fetchSedes = async () => {
      try {
        const res = await axios.get(URL);
        setSedes(res.data);
      } catch (error) {
        console.error('Error al cargar sedes:', error);
      }
    };

    fetchSedes();
  }, []);

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Agrupador
      </label>
      <div className="relative">
        <select
          className="block w-full appearance-none bg-white border border-gray-300 hover:border-[#fc4b08] focus:border-[#fc4b08] focus:ring-[#fc4b08] text-gray-700 py-2 px-3 pr-10 rounded-md shadow-sm transition-all duration-200"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Seleccionar sede...</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.nombre}>
              {sede.nombre}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10 12a.75.75 0 0 1-.53-.22l-4-4a.75.75 0 1 1 1.06-1.06L10 10.19l3.47-3.47a.75.75 0 0 1 1.06 1.06l-4 4A.75.75 0 0 1 10 12Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default SelectSedes;
