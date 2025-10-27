import React, { useState, useEffect } from "react";

// --- Modal para Agregar/Editar en Lista de Espera ---
const WaitingListModal = ({
  isOpen,
  onClose,
  onSave,
  personData,
  allHours,
  marcarEstadosAlumnoListaEspera,
}) => {
  const initialState = {
    // Estado inicial para una nueva persona
    name: "",
    type: "espera",
    contact: "",
    plan: "L-M-V",
    hours: [],
    obs: "",
  };

  const [person, setPerson] = useState(initialState); // Estado para los datos de la persona
  const [isModify, setModify] = useState(false); // Estado para saber si es modificación o nuevo

  // Cuando se abre el modal, si hay datos de persona, los carga en el estado
  useEffect(() => {
    if (personData) {
      setPerson(personData);
      setModify(true);
    } else {
      setPerson(initialState);
      setModify(false);
    }
  }, [isOpen, personData]);

  if (!isOpen) return null;

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerson((prev) => ({
      ...prev,
      [name]: name === "name" ? value.toUpperCase() : value,
    }));
  };

  // Maneja la selección/deselección de horarios
  const handleHourToggle = (hour) => {
    setPerson((prev) => {
      const newHours = prev.hours.includes(hour)
        ? prev.hours.filter((h) => h !== hour)
        : [...prev.hours, hour];
      return { ...prev, hours: newHours.sort() };
    });
  };

  // Validación - todos los campos requeridos excepto obs
  const handleSave = () => {
    // Validar nombre (obligatorio)
    if (!person.name || person.name.trim() === "") {
      alert("El nombre y apellido es obligatorio.");
      return;
    }

    // Validar contacto (obligatorio)
    if (!person.contact || person.contact.trim() === "") {
      alert("El contacto es obligatorio.");
      return;
    }

    // Validar plan (obligatorio)
    if (!person.plan) {
      alert("El plan de interés es obligatorio.");
      return;
    }

    // Validar horarios (obligatorio - al menos uno)
    if (!person.hours || person.hours.length === 0) {
      alert("Debe seleccionar al menos un horario de interés.");
      return;
    }

    // Validar tipo (obligatorio)
    if (!person.type) {
      alert("El tipo es obligatorio.");
      return;
    }

    onSave(person);
    onClose();
  };

  // Maneja la eliminación (solo en modo modificar)
  const handleDelete = () => {
    onSave(null);
    onClose();
  };

  const gestionarEstadosAlumnoListaEspera = (tipo, id) => {
    marcarEstadosAlumnoListaEspera(id, tipo);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-5xl shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {personData ? "Editar Persona" : "Agregar a Lista de Espera"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nombre y Apellido *
              </label>
              <input
                name="name"
                value={person.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ingrese nombre y apellido"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Tipo / Prioridad *
              </label>
              <select
                name="type"
                value={person.type}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="espera">Lista de espera</option>
                <option value="cambio">Lista de cambio</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Contacto (Tel, IG, etc.) *
              </label>
              <input
                name="contact"
                value={person.contact}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Ingrese contacto"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Plan de Interés *
              </label>
              <select
                name="plan"
                value={person.plan}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="L-M-V">Lunes-Miércoles-Viernes</option>
                <option value="M-J">Martes-Jueves</option>
                <option value="Cualquier día">Cualquier día</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Horarios de Interés * (Seleccione al menos uno)
            </label>
            <div className="grid grid-cols-3 gap-2 border rounded p-3 h-56 overflow-y-auto bg-gray-50">
              {allHours.map((hour) => (
                <label
                  key={hour}
                  className={`flex items-center justify-center space-x-2 p-1 rounded-md cursor-pointer transition-colors text-sm ${
                    person.hours.includes(hour)
                      ? "bg-purple-600 text-white shadow"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={person.hours.includes(hour)}
                    onChange={() => handleHourToggle(hour)}
                    className="opacity-0 w-0 h-0"
                  />
                  <span>{hour}</span>
                </label>
              ))}
            </div>
            {person.hours.length === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Debe seleccionar al menos un horario
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Observaciones
          </label>
          <textarea
            name="obs"
            value={person.obs}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="2"
            placeholder="Ingrese observaciones (opcional)"
          ></textarea>
        </div>
        {isModify && (
          <div className="mt-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Estados
            </label>
            <div className="border-2 rounded-lg p-4 bg-gray-50 flex flex-col items-center gap-3">
              {/* Estado actual y detalles */}
              {personData && personData.contacto_cliente ? (
                <div className="mb-2 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-xs shadow-md 
                      ${
                        personData.contacto_cliente.estado_contacto ===
                        "Confirmado"
                          ? "bg-green-500 text-white"
                          : personData.contacto_cliente.estado_contacto ===
                            "Pendiente"
                          ? "bg-yellow-400 text-black"
                          : personData.contacto_cliente.estado_contacto ===
                            "Rechazado/Sin Respuesta"
                          ? "bg-red-500 text-white"
                          : "bg-gray-300 text-gray-700"
                      }
                    `}
                    >
                      {personData.contacto_cliente.estado_contacto ||
                        "Sin estado"}
                    </span>
                    <span className="text-xs text-gray-500">Estado actual</span>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2 text-xs text-gray-600 max-w-full">
                    {personData.contacto_cliente.fecha_contacto && (
                      <span
                        className="truncate max-w-[180px]"
                        title={new Date(
                          personData.contacto_cliente.fecha_contacto
                        ).toLocaleString("es-ES")}
                      >
                        <strong>Fecha contacto:</strong>{" "}
                        {new Date(
                          personData.contacto_cliente.fecha_contacto
                        ).toLocaleDateString("es-ES")}
                      </span>
                    )}
                    {personData.contacto_cliente.usuario_contacto_nombre && (
                      <span
                        className="truncate max-w-[180px]"
                        title={
                          personData.contacto_cliente.usuario_contacto_nombre
                        }
                      >
                        <strong>Usuario:</strong>{" "}
                        {personData.contacto_cliente.usuario_contacto_nombre}
                      </span>
                    )}
                    {personData.contacto_cliente.notas && (
                      <span
                        className="truncate max-w-[180px]"
                        title={personData.contacto_cliente.notas}
                      >
                        <strong>Notas:</strong>{" "}
                        {personData.contacto_cliente.notas.length > 30
                          ? personData.contacto_cliente.notas.slice(0, 30) +
                            "..."
                          : personData.contacto_cliente.notas}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-2 w-full flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full font-bold text-xs shadow-md bg-gray-300 text-gray-700">
                    Sin estado
                  </span>
                  <span className="text-xs text-gray-500">
                    Todavía no se ha cargado estado
                  </span>
                </div>
              )}

              {/* Botones de cambio de estado */}
              <div className="flex gap-4 mt-2">
                {/* Si no tiene estado, solo mostrar Pendiente */}
                {!personData?.contacto_cliente?.estado_contacto && (
                  <button
                    onClick={() => {
                      gestionarEstadosAlumnoListaEspera(
                        "pendiente",
                        personData.id
                      );
                    }}
                    className="bg-yellow-400 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    Marcar como Pendiente
                  </button>
                )}
                {/* Si está en pendiente, mostrar Confirmado y Rechazado */}
                {personData?.contacto_cliente?.estado_contacto ===
                  "Pendiente" && (
                  <>
                    <button
                      onClick={() => {
                        gestionarEstadosAlumnoListaEspera(
                          "confirmado",
                          personData.id
                        );
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => {
                        gestionarEstadosAlumnoListaEspera(
                          "rechazado",
                          personData.id
                        );
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
                    >
                      Rechazar
                    </button>
                  </>
                )}
                {/* Si está en confirmado o rechazado, no mostrar más botones */}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Guardar
          </button>
          {personData && (
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              Eliminar
            </button>
          )}
          <button
            onClick={onClose}
            className="font-bold text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal de Lista de Espera ---
const ListaEspera = ({
  waitingList,
  onUpdateWaitingList,
  allHours,
  marcarEstadosAlumnoListaEspera,
  puedeEditar = true,
}) => {
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

  const resultadosFiltrados = waitingList.filter((persona) => {
    const busqueda = terminoDeBusqueda.toLowerCase(); // Pasamos el texto a minúsculas para que no distinga mayúsculas

    // Nos aseguramos que los campos existan antes de buscar en ellos
    const nombre = persona.name?.toLowerCase() || "";
    const tipo = persona.type?.toLowerCase() || "";
    const contacto = persona.contact?.toLowerCase() || "";

    if (!busqueda) {
      return true; // Si no hay nada en el buscador, mostramos todo
    }

    // Devolvemos true si el texto de búsqueda está en cualquiera de los tres campos
    return (
      nombre.includes(busqueda) ||
      tipo.includes(busqueda) ||
      contacto.includes(busqueda)
    );
  });

  // Para obtener una lista con solo los pendientes y confirmados
  const filtrarPendientesYConfirmados = resultadosFiltrados.filter(
    (person) =>
      person.contacto_cliente?.estado_contacto !== "Rechazado/Sin Respuesta"
  );

  // Para obtener una lista con solo los rechazados
  const filtrarBajas = resultadosFiltrados.filter(
    (person) =>
      person.contacto_cliente?.estado_contacto === "Rechazado/Sin Respuesta"
  );

  const listaConfirmada = [...filtrarPendientesYConfirmados, ...filtrarBajas]; // Concatenar ambas listas

  //Logica de paginación
  const indiceFinal = paginaActual * ELEMENTOS_POR_PAGINA; // 30 elementos por página
  const indiceInicial = indiceFinal - ELEMENTOS_POR_PAGINA; // Índice inicial
  const elementosPaginados = listaConfirmada.slice(indiceInicial, indiceFinal); // Elementos para la página actual
  const totalPaginas = Math.ceil(listaConfirmada.length / ELEMENTOS_POR_PAGINA); // Total de páginas

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
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por Nombre, Tipo o Contacto..."
          value={terminoDeBusqueda}
          onChange={(e) => setTerminoDeBusqueda(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
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
                  La lista de espera está vacía.
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
          Página {paginaActual} de {totalPaginas}
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
        <WaitingListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          personData={selectedPerson}
          allHours={allHours}
          marcarEstadosAlumnoListaEspera={marcarEstadosAlumnoListaEspera}
        />
      )}
    </div>
  );
};

export default ListaEspera;
