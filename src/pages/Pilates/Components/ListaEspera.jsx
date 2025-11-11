import React, { useState, useEffect, useMemo } from "react";
import ModalListaEspera from "../Modal/ModalListaEspera";

// --- Componente Principal de Lista de Espera ---
const ListaEspera = ({
  waitingList,
  onUpdateWaitingList,
  allHours,
  marcarEstadosAlumnoListaEspera,
  puedeEditar = true,
  schedule = {},
}) => {
  // --- ESTADOS PARA LOS FILTROS ---
  const [filtroTipo, setFiltroTipo] = useState("todos"); // 'todos', 'espera', 'cambio'
  const [filtroEstado, setFiltroEstado] = useState("todos"); // 'todos', 'sin-estado', 'Pendiente', 'Confirmado', 'Rechazado'
  const [terminoDeBusqueda, setTerminoDeBusqueda] = useState(""); // Estado para el buscador

  const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal
  const [selectedPerson, setSelectedPerson] = useState(null); // Persona seleccionada para editar
  const [paginaActual, setPaginaActual] = useState(1); // Página inicial
  const ELEMENTOS_POR_PAGINA = 30; // Cambia este valor para ajustar la cantidad de elementos por página

  const HEADERS = [
    // Encabezados de la tabla
    "NOMBRE Y APELLIDO",
    "TIPO",
    "CONTACTO",
    "PLAN DE INTERÉS",
    "HORARIOS",
    "OBSERVACIONES",
    "FECHA CARGA",
    "CARGADO POR",
    "ACCIONES",
  ];

  // --- NUEVO: useEffect para resetear la paginación cuando cambian los filtros ---
  useEffect(() => {
    setPaginaActual(1); // Vuelve a la página 1 si cambia cualquier filtro
  }, [filtroTipo, filtroEstado, terminoDeBusqueda]);

  // --- LÓGICA DE FILTRADO MEJORADA CON useMemo ---
  const listaFiltrada = useMemo(() => {
    let filtrados = [...waitingList]; // Empezamos con la lista completa

    // 1. Filtrar por Tipo
    if (filtroTipo !== "todos") {
      filtrados = filtrados.filter((person) => person.type === filtroTipo);
    }

    // 2. Filtrar por Estado de Contacto
    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter((person) => {
        const estado = person.contacto_cliente?.estado_contacto; // Estado actual

        switch (filtroEstado) {
          case "sin-estado":
            return !estado; // Si no hay objeto 'contacto_cliente' o 'estado_contacto' es null/undefined
          case "Pendiente":
            return estado === "Pendiente";
          case "Confirmado":
            return estado === "Confirmado";
          case "Rechazado":
            return estado === "Rechazado/Sin Respuesta";
          default:
            return true;
        }
      });
    }

    // 3. Filtrar por Término de Búsqueda
    const busqueda = terminoDeBusqueda.toLowerCase();
    if (busqueda) {
      filtrados = filtrados.filter((persona) => {
        const nombre = persona.name?.toLowerCase() || "";
        const tipo = persona.type?.toLowerCase() || "";
        const contacto = persona.contact?.toLowerCase() || "";
        return (
          nombre.includes(busqueda) ||
          tipo.includes(busqueda) ||
          contacto.includes(busqueda)
        );
      });
    }

    // 1. Prioridad Alta: "Sin Estado" (null/undefined) y "Pendiente"
    const prioridadAlta = filtrados.filter((p) => {
      const estado = p.contacto_cliente?.estado_contacto;
      return !estado || estado === "Pendiente";
    }); // 2. Confirmados: (Van debajo de la prioridad alta)

    const confirmados = filtrados.filter(
      (p) => p.contacto_cliente?.estado_contacto === "Confirmado"
    ); // 3. Rechazados: (Van al final de todo)

    const rechazados = filtrados.filter(
      (p) => p.contacto_cliente?.estado_contacto === "Rechazado/Sin Respuesta"
    ); // Combinamos las listas en el nuevo orden

    return [...prioridadAlta, ...confirmados, ...rechazados];
  }, [waitingList, filtroTipo, filtroEstado, terminoDeBusqueda]);
  // --- FIN DE LA LÓGICA DE FILTRADO ---

  // Maneja el clic en una fila
  const handleRowClick = (person) => {
    if (!puedeEditar) return;
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  // Maneja el clic en "Agregar a Lista de Espera"
  const handleAddNew = () => {
    if (!puedeEditar) return;
    setSelectedPerson(null);
    setIsModalOpen(true);
  };

  // Maneja el guardado desde el modal
  const handleSave = (personToSave) => {
    if (personToSave === null) {
      onUpdateWaitingList(selectedPerson.id, null);
    } else {
      onUpdateWaitingList(selectedPerson?.id, personToSave);
    }
  };

  //Logica de paginación (AHORA USA listaFiltrada)
  const indiceFinal = paginaActual * ELEMENTOS_POR_PAGINA;
  const indiceInicial = indiceFinal - ELEMENTOS_POR_PAGINA;
  const elementosPaginados = listaFiltrada.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(listaFiltrada.length / ELEMENTOS_POR_PAGINA);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleAddNew}
          disabled={!puedeEditar}
          className={`font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform ${
            puedeEditar
              ? "bg-purple-700 hover:bg-purple-900 text-white hover:scale-105"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          + Agregar a Lista de Espera
        </button>
      </div>

      {/* --- SECCIÓN DE FILTROS Y BÚSQUEDA --- */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Búsqueda */}
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre, Tipo o Contacto..."
            value={terminoDeBusqueda}
            onChange={(e) => setTerminoDeBusqueda(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        {/* Filtro 1: Tipo */}
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Filtrar por Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="espera">Lista de Espera</option>
            <option value="cambio">Lista de Cambio</option>
          </select>
        </div>

        {/* Filtro 2: Estado */}
        <div className="col-span-1">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Filtrar por Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="sin-estado">Sin Estado (Nuevos)</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Rechazado">Rechazado / Sin Respuesta</option>
          </select>
        </div>
      </div>
      {/* --- FIN DE FILTROS Y BÚSQUEDA --- */}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-purple-900">
            <tr>
              {HEADERS.map((header) => (
                <th
                  key={header}
                  className="p-3 font-semibold text-center text-white uppercase text-sm border-b-2 border-purple-800"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elementosPaginados.length > 0 ? (
              elementosPaginados.map((person) => (
                <tr
                  key={person.id}
                  className={`border-b border-gray-200  transition-colors ${
                    person.contacto_cliente?.estado_contacto === "Confirmado"
                      ? "!bg-green-300 hover:!bg-green-400" // Verde si está confirmado
                      : person.contacto_cliente?.estado_contacto === "Pendiente"
                      ? "!bg-yellow-200 hover:!bg-yellow-300" // Amarillo si está pendiente
                      : person.contacto_cliente?.estado_contacto ===
                        "Rechazado/Sin Respuesta"
                      ? "!bg-red-400 hover:!bg-red-500" // Rojo si está rechazado
                      : "odd:bg-white even:bg-gray-50 hover:!bg-gray-200" // Colores alternos por defecto
                  }`}
                >
                  <td className="p-3 text-gray-800 font-medium text-center">
                    {person.name}
                  </td>
                  <td className="p-3 text-gray-700 text-center capitalize">
                    {person.type}
                  </td>
                  <td className="p-3 text-gray-700 text-center">
                    {person.contact}
                  </td>
                  <td className="p-3 text-gray-700 text-center">
                    {person.plan}
                  </td>
                  <td className="p-3 text-gray-700 text-center">
                    {person.hours.join(", ")}
                  </td>
                  <td className="p-3 text-gray-700 italic text-center max-w-xs truncate">
                    {person.obs}
                  </td>
                  <td className="p-3 text-gray-500 text-center">
                    {new Date(person.date + "T00:00:00").toLocaleDateString(
                      "es-ES"
                    )}{" "}
                    {person.hour}
                  </td>
                  <td className="p-3 text-gray-700 italic text-center max-w-xs truncate">
                    {person.nombre_usuario_cargado}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={
                        puedeEditar ? () => handleRowClick(person) : undefined
                      }
                      disabled={!puedeEditar}
                      className={`font-bold py-1 px-3 rounded-lg text-sm ${
                        puedeEditar
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          : "bg-gray-300 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={HEADERS.length}
                  className="text-center p-8 text-gray-500 italic"
                >
                  {/* Mensaje dinámico si no hay resultados */}
                  {listaFiltrada.length === 0 &&
                  (filtroTipo !== "todos" ||
                    filtroEstado !== "todos" ||
                    terminoDeBusqueda !== "")
                    ? "No se encontraron resultados para los filtros aplicados."
                    : "La lista de espera está vacía."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center mt-4 space-x-4">
        <button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Anterior
        </button>

        <span className="text-gray-700 font-semibold">
          Página {paginaActual} de {totalPaginas > 0 ? totalPaginas : 1}
        </span>

        <button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          className="bg-purple-700 hover:bg-purple-900 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      {isModalOpen && (
        <ModalListaEspera
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          personData={selectedPerson}
          allHours={allHours}
          marcarEstadosAlumnoListaEspera={marcarEstadosAlumnoListaEspera}
          schedule={schedule}
        />
      )}
    </div>
  );
};

export default ListaEspera;
