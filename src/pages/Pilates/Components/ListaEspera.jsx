import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion"; 
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl shadow-2xl border border-purple-100 font-messina"
    >
      {/* Header con botón */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="flex justify-between items-center mb-6"
      >
        <h2 className="text-2xl font-bold font-bignoodle text-purple-900">Lista de Espera</h2>
        <motion.button
          onClick={handleAddNew}
          disabled={!puedeEditar}
          whileHover={puedeEditar ? { scale: 1.05, y: -2 } : {}}
          whileTap={puedeEditar ? { scale: 0.95 } : {}}
          className={`font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 ${
            puedeEditar
              ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white shadow-purple-300"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="text-xl">+</span>
            Agregar a Lista de Espera
          </span>
        </motion.button>
      </motion.div>

      {/* --- SECCIÓN DE FILTROS Y BÚSQUEDA --- */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* Búsqueda */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <label className="block text-purple-900 text-sm font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre, Tipo o Contacto..."
            value={terminoDeBusqueda}
            onChange={(e) => setTerminoDeBusqueda(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white"
          />
        </motion.div>
        {/* Filtro 1: Tipo */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <label className="block text-purple-900 text-sm font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtrar por Tipo
          </label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white cursor-pointer"
          >
            <option value="todos">Todos los Tipos</option>
            <option value="espera">Lista de Espera</option>
            <option value="cambio">Lista de Cambio</option>
          </select>
        </motion.div>

        {/* Filtro 2: Estado */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="col-span-1"
        >
          <label className="block text-purple-900 text-sm font-bold mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Filtrar por Estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full p-3 border-2 border-purple-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="sin-estado">Sin Estado (Nuevos)</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Rechazado">Rechazado / Sin Respuesta</option>
          </select>
        </motion.div>
      </motion.div>
      {/* --- FIN DE FILTROS Y BÚSQUEDA --- */}

      {/* Tabla con diseño moderno */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="overflow-hidden rounded-xl shadow-xl border border-purple-200"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-purple-900 to-purple-800">
              <tr>
                {HEADERS.map((header, index) => (
                  <motion.th
                    key={header}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                    className="p-4 font-semibold text-center text-white uppercase text-xs tracking-wider"
                  >
                    {header}
                  </motion.th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elementosPaginados.length > 0 ? (
                elementosPaginados.map((person, index) => (
                  <motion.tr
                    key={person.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    className={`transition-all duration-300 cursor-pointer ${
                      person.contacto_cliente?.estado_contacto === "Confirmado"
                        ? "!bg-gradient-to-r from-green-100 to-green-200 hover:!from-green-200 hover:!to-green-300" // Verde si está confirmado
                        : person.contacto_cliente?.estado_contacto === "Pendiente"
                        ? "!bg-gradient-to-r from-yellow-100 to-yellow-200 hover:!from-yellow-200 hover:!to-yellow-300" // Amarillo si está pendiente
                        : person.contacto_cliente?.estado_contacto ===
                          "Rechazado/Sin Respuesta"
                        ? "!bg-gradient-to-r from-red-100 to-red-200 hover:!from-red-200 hover:!to-red-300" // Rojo si está rechazado
                        : "hover:bg-purple-50" // Color hover por defecto
                    }`}
                  >
                    <td className="p-2 text-gray-800 font-semibold text-center">
                      {person.name}
                    </td>
                    <td className="p-2 text-gray-700 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                        {person.type}
                      </span>
                    </td>
                    <td className="p-2 text-gray-700 text-center font-medium">
                      {person.contact}
                    </td>
                    <td className="p-2 text-gray-700 text-center">
                      {person.plan}
                    </td>
                    <td className="p-2 text-gray-700 text-center text-sm">
                      {person.hours.join(", ")}
                    </td>
                    <td className="p-2 text-gray-600 italic text-center max-w-xs truncate text-sm">
                      {person.obs}
                    </td>
                    <td className="p-2 text-gray-500 text-center text-sm">
                      {new Date(person.date + "T00:00:00").toLocaleDateString(
                        "es-ES"
                      )}{" "}
                      {person.hour}
                    </td>
                    <td className="p-2 text-gray-600 italic text-center max-w-xs truncate text-sm">
                      {person.nombre_usuario_cargado}
                    </td>
                    <td className="p-2 text-center">
                      <motion.button
                        onClick={
                          puedeEditar ? () => handleRowClick(person) : undefined
                        }
                        disabled={!puedeEditar}
                        whileHover={puedeEditar ? { scale: 1.1 } : {}}
                        whileTap={puedeEditar ? { scale: 0.95 } : {}}
                        className={`font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-300 ${
                          puedeEditar
                            ? "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
                            : "bg-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Editar
                      </motion.button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <td
                    colSpan={HEADERS.length}
                    className="text-center p-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p className="text-gray-500 italic text-lg">
                        {listaFiltrada.length === 0 &&
                        (filtroTipo !== "todos" ||
                          filtroEstado !== "todos" ||
                          terminoDeBusqueda !== "")
                          ? "No se encontraron resultados para los filtros aplicados."
                          : "La lista de espera está vacía."}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginación con diseño moderno */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex justify-center items-center mt-6 space-x-4"
      >
        <motion.button
          onClick={() => setPaginaActual(paginaActual - 1)}
          disabled={paginaActual === 1}
          whileHover={paginaActual !== 1 ? { scale: 1.05, x: -3 } : {}}
          whileTap={paginaActual !== 1 ? { scale: 0.95 } : {}}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300"
        >
          ← Anterior
        </motion.button>

        <div className="bg-white px-6 py-3 rounded-xl shadow-md border-2 border-purple-200">
          <span className="text-purple-900 font-bold text-lg">
            Página {paginaActual} de {totalPaginas > 0 ? totalPaginas : 1}
          </span>
        </div>

        <motion.button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          whileHover={paginaActual < totalPaginas ? { scale: 1.05, x: 3 } : {}}
          whileTap={paginaActual < totalPaginas ? { scale: 0.95 } : {}}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300"
        >
          Siguiente →
        </motion.button>
      </motion.div>
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
    </motion.div>
  );
};

export default ListaEspera;