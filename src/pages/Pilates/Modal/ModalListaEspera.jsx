import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import sweetalert2 from "sweetalert2";

const ModalListaEspera = ({
  isOpen,
  onClose,
  onSave,
  personData,
  allHours,
  marcarEstadosAlumnoListaEspera,
  schedule = {},
}) => {
  const initialState = {
    name: "",
    type: "espera",
    contact: "",
    plan: "L-M-V",
    hours: [],
    obs: "",
  };

  const [person, setPerson] = useState(initialState);
  const [isModify, setModify] = useState(false);
  const [searchStudentTerm, setSearchStudentTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [centerVertically, setCenterVertically] = useState(false);

  const studentsFromSchedule = useMemo(() => {
    if (!schedule || typeof schedule !== "object") {
      return [];
    }

    const seen = new Map();

    Object.entries(schedule).forEach(([key, cell]) => {
      const [rawDay, ...rawHourParts] = key.split("-");
      const day = (rawDay || "").trim();
      const hour = rawHourParts.join("-").trim();

      (cell?.alumnos || []).forEach((student, index) => {
        const uniqueId =
          student?.id !== undefined && student?.id !== null
            ? student.id
            : `${key}-${index}`;

        if (!seen.has(uniqueId)) {
          seen.set(uniqueId, {
            id: uniqueId,
            name: student?.name || "",
            contact:
              student?.contact || student?.contacto || student?.telefono || "",
            day,
            hour,
          });
        }
      });
    });

    return Array.from(seen.values());
  }, [schedule]);

  const normalizeText = useCallback(
    (value = "") =>
      value
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim(),
    []
  );

  const filteredStudents = useMemo(() => {
    const term = normalizeText(searchStudentTerm);
    if (!term) {
      return studentsFromSchedule;
    }

    return studentsFromSchedule.filter((student) => {
      const values = [student.name, student.contact, student.day, student.hour]
        .filter(Boolean)
        .map((value) => normalizeText(value));

      return values.some((value) => value.includes(term));
    });
  }, [normalizeText, searchStudentTerm, studentsFromSchedule]);

  // MODIFICADO: useEffect de carga inicial simplificado.
  // Ahora solo carga los datos y corrige los 'null'.
  useEffect(() => {
    if (personData) {
      // Carga los datos y corrige valores null/undefined para evitar warnings
      setPerson({
        ...initialState, // Asegura que todos los campos existan
        ...personData,
        name: (personData.name || "").toUpperCase(),
        contact: personData.contact || "",
        obs: personData.obs || "", // <-- Esto corrige el warning del textarea
      });
      setModify(true);
    } else {
      setPerson(initialState);
      setModify(false);
    }
    // Reseteamos la selección y búsqueda al abrir/cerrar
    setSelectedStudentId(null);
    setSearchStudentTerm("");
  }, [isOpen, personData]); // Dependencias limpias

  // MODIFICADO: useEffect de auto-relleno.
  // Ahora solo se ejecuta si NO estamos en modo edición (isModify es false).
  useEffect(() => {
    // No auto-rellenar si estamos editando (isModify es true)
    if (!selectedStudentId || isModify) {
      return;
    }
    const selected = studentsFromSchedule.find(
      (student) => student.id === selectedStudentId
    );

    if (selected) {
      setPerson((prev) => ({
        ...prev,
        name: (selected.name || "").toUpperCase(),
        contact: selected.contact || "",
      }));
    }
  }, [selectedStudentId, studentsFromSchedule, isModify]); // <-- Se agregó isModify

  // Comprueba si el contenido del modal cabe en la ventana y cambia la alineación
  useEffect(() => {
    if (!isOpen) return;

    const checkFit = () => {
      try {
        const contentEl = contentRef.current;
        if (!contentEl) {
          setCenterVertically(false);
          return;
        }
        const contentHeight = contentEl.getBoundingClientRect().height;
        const margin = 40; // margen para no pegarse demasiado al borde
        const fits = contentHeight + margin < window.innerHeight;
        setCenterVertically(fits);
      } catch (e) {
        // en caso de error, fallback a start
        setCenterVertically(false);
      }
    };

    checkFit();

    let ro;
    if (typeof ResizeObserver !== "undefined" && contentRef.current) {
      ro = new ResizeObserver(checkFit);
      ro.observe(contentRef.current);
    }
    window.addEventListener("resize", checkFit);

    return () => {
      if (ro && ro.disconnect) ro.disconnect();
      window.removeEventListener("resize", checkFit);
    };
  }, [
    isOpen,
    person,
    selectedStudentId,
    searchStudentTerm,
    studentsFromSchedule.length,
    allHours?.length,
  ]);

  useEffect(() => {
    if (person.type !== "cambio") {
      setSelectedStudentId(null);
      setSearchStudentTerm("");
    }
  }, [person.type]);

  if (!isOpen) {
    return null;
  }

  // ELIMINADO: El useEffect de debug de selectedStudentId fue removido.

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPerson((prev) => ({
      ...prev,
      [name]: name === "name" ? value.toUpperCase() : value,
    }));
  };

  const handleHourToggle = (hour) => {
    setPerson((prev) => {
      const newHours = prev.hours.includes(hour)
        ? prev.hours.filter((h) => h !== hour)
        : [...prev.hours, hour];
      return { ...prev, hours: newHours.sort() };
    });
  };

  const handleSave = () => {
    if (!person.name || person.name.trim() === "") {
      sweetalert2.fire({
        icon: "error",
        title: "Nombre requerido",
        text: "El nombre y apellido es obligatorio.",
      });
      return;
    }

    if (!person.contact || person.contact.trim() === "") {
      sweetalert2.fire({
        icon: "error",
        title: "Contacto requerido",
        text: "El contacto es obligatorio.",
      });
      return;
    }

    if (!person.plan) {
      sweetalert2.fire({
        icon: "error",
        title: "Plan requerido",
        text: "El plan de interés es obligatorio.",
      });
      return;
    }

    if (!person.hours || person.hours.length === 0) {
      sweetalert2.fire({
        icon: "error",
        title: "Horario requerido",
        text: "Debe seleccionar al menos un horario de interés.",
      });
      return;
    }

    if (!person.type) {
      sweetalert2.fire({
        icon: "error",
        title: "Tipo requerido",
        text: "El tipo es obligatorio.",
      });
      return;
    }

    const mustPickFromGrid =
      person.type === "cambio" && !isModify && studentsFromSchedule.length > 0;

    if (mustPickFromGrid && !selectedStudentId) {
      sweetalert2.fire({
        icon: "error",
        title: "Seleccionar alumno",
        text: "Seleccioná un alumno desde la grilla para registrar un cambio.",
      });
      return;
    }

    onSave(person);
    onClose();
  };

  const handleDelete = () => {
    onSave(null);
    onClose();
  };

  const gestionarEstadosAlumnoListaEspera = (tipo, id) => {
    marcarEstadosAlumnoListaEspera(id, tipo);
    onClose();
  };

  // AÑADIDO: Variable helper para tu lógica
  const inputsDisabled = person.type === "cambio" && isModify;

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center ${
        centerVertically ? "items-center" : "items-start py-5"
      } z-50 overflow-y-auto`}
    >
      <div
        ref={contentRef}
        className="bg-white rounded-lg p-8 w-full max-w-5xl shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {personData ? "Editar Persona" : "Agregar a Lista de Espera"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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

            {/* MODIFICADO: La tabla solo se muestra si es 'cambio', NO es 'isModify', y hay alumnos */}
            {person.type === "cambio" &&
            !isModify &&
            studentsFromSchedule.length > 0 ? (
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Seleccionar alumno desde la grilla
                </label>
                <input
                  type="text"
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  placeholder="Buscar por nombre, contacto, día u hora"
                  className="w-full p-2 mb-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="border rounded-lg bg-gray-50 h-48 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-purple-600 text-white">
                      <tr>
                        <th className="p-2 text-center w-10">Sel</th>
                        <th className="p-2 text-left">Nombre</th>
                        <th className="p-2 text-left">Contacto</th>
                        <th className="p-2 text-left">Día</th>
                        <th className="p-2 text-left">Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                          <tr
                            key={student.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => {
                              setSelectedStudentId(student.id);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedStudentId(student.id);
                              }
                            }}
                            className={`border-b cursor-pointer ${
                              selectedStudentId === student.id
                                ? "bg-purple-100"
                                : "bg-white"
                            }`}
                          >
                            <td className="p-2 text-center">
                              <input
                                type="radio"
                                name="selected-student"
                                checked={selectedStudentId === student.id}
                                onChange={() =>
                                  setSelectedStudentId(student.id)
                                }
                              />
                            </td>
                            <td className="p-2 truncate" title={student.name}>
                              {student.name}
                            </td>
                            <td
                              className="p-2 truncate"
                              title={student.contact}
                            >
                              {student.contact || "-"}
                            </td>
                            <td className="p-2 truncate" title={student.day}>
                              {student.day || "-"}
                            </td>
                            <td className="p-2 truncate" title={student.hour}>
                              {student.hour || "-"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-3 text-center text-gray-500"
                          >
                            No se encontraron alumnos con ese criterio.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  La selección completará el nombre y el contacto
                  automáticamente.
                </p>
              </div>
            ) : (
              // Bloque 'else' (si es 'espera' O si es 'cambio' + 'isModify')
              <>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre y Apellido *
                  </label>
                  <input
                    name="name"
                    value={person.name}
                    onChange={handleChange}
                    disabled={inputsDisabled} // <-- AÑADIDO
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      inputsDisabled ? "bg-gray-200 cursor-not-allowed" : "" // <-- AÑADIDO
                    }`}
                    placeholder="Ingrese nombre y apellido"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Contacto (Tel, IG, etc.) *
                  </label>
                  <input
                    name="contact"
                    value={person.contact}
                    onChange={handleChange}
                    disabled={inputsDisabled} // <-- AÑADIDO
                    className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      inputsDisabled ? "bg-gray-200 cursor-not-allowed" : "" // <-- AÑADIDO
                    }`}
                    placeholder="Ingrese contacto"
                  />
                </div>
                {/* Mensaje de ayuda si es 'cambio' pero no hay alumnos en la grilla */}
                {person.type === "cambio" &&
                  !isModify && // <-- Solo en modo AGREGAR
                  studentsFromSchedule.length === 0 && (
                    <p className="text-xs text-gray-500">
                      No se encontraron alumnos en la grilla para seleccionar.
                      Completá los datos manualmente.
                    </p>
                  )}
              </>
            )}
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
            value={person.obs} // <-- Ahora está protegido contra 'null'
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows="2"
            placeholder="Ingrese observaciones (opcional)"
          ></textarea>
        </div>
        {isModify && (
          <div className="mt-6">
            <div className="flex items-center gap-2">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Estados
              </label>
              <span className="text-xs text-red-500 mb-2 block">
                (Cambiar estado del contacto con el cliente)
              </span>
            </div>
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

export default ModalListaEspera;
