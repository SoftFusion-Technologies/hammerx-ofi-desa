import React, { useState } from 'react';

const TituloPreguntasModal = ({
  isOpen,
  onClose,
  preguntas,
  onPreguntaSelect
}) => {
  // Estado para almacenar el valor de búsqueda
  const [search, setSearch] = useState('');

  // Función para manejar cambios en el campo de búsqueda
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  // Función para ordenar las preguntas según el campo 'orden'
  const sortedPreguntas = preguntas
    .filter((pregunta) => {
      // Si no hay texto de búsqueda, mostrar todas las preguntas
      if (!search) {
        return true;
      }
      // Filtrar preguntas por coincidencia parcial del título
      return pregunta.titulo.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => a.orden - b.orden); // Ordenar por 'orden' de menor a mayor

  if (!isOpen) return null;

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
        <h2 className="text-xl font-bold mb-4">Preguntas Frecuentes</h2>

        {/* formulario de busqueda */}
        <form className="flex justify-center pb-5">
          <input
            type="text"
            placeholder="Buscar pregunta..."
            value={search}
            onChange={handleSearchChange}
            className="border p-2 rounded w-full max-w-lg"
          />
        </form>
        {/* formulario de busqueda */}
        <ul>
          {sortedPreguntas.map((pregunta) => (
            <li
              key={pregunta.id}
              onClick={() => onPreguntaSelect(pregunta)}
              className="cursor-pointer hover:text-blue-500"
            >
              {pregunta.titulo}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TituloPreguntasModal;
