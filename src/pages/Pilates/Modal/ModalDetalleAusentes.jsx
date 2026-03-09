/* Autor: Sergio Manrique
Fecha de creación: 23-12-2025
Descripción: Componente ModalDetalleAusentes para gestionar alumnos ausentes en Pilates.
*/

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  FaEdit,
  FaTrash,
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaQuestionCircle,
  FaClock,
} from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import AyudaAusentes from "../Components/AyudaAusentes";
import {
  cargarHistorial,
  handleEditarHistorial,
  handleEliminarHistorial,
  handleGuardarObservacion,
  obtenerAlumnosFiltrados,
  calcularDiasDesdeUltimoContacto,
} from "../Logic/PilatesGestion/HistorialContactosAusentes";
import AsistenciasCalendario from "../Components/Ausentes-Asistencias/AsistenciasCalendario";

const ModalDetalleAusentes = ({
  isOpen,
  onClose,
  ausentesData,
  refetchAusentesData,
  isLoadingAusentesData,
  errorAusentesData,
  sedeActual,
}) => {
  const { userId } = useAuth();
  // --- ESTADOS DE DATOS ---
  const [historialSeleccionado, setHistorialSeleccionado] = useState([]);

  // --- ESTADOS DE UI ---
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [mostrarAyuda, setMostrarAyuda] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroAvanzado, setFiltroAvanzado] = useState("TODOS"); // Filtro avanzado
  const [ordenamiento, setOrdenamiento] = useState("DEFECTO"); // Orden de resultados
  const [paginaActual, setPaginaActual] = useState(1);
  const [nuevaObservacion, setNuevaObservacion] = useState("");
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const textareaRef = useRef(null);

  // --- ESTADOS DE CARGA Y ERROR ---
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const ITEMS_POR_PAGINA = 20;

  // 1. CARGAR DASHBOARD AL ABRIR
  useEffect(() => {
    if (!isOpen) {
      // Limpieza al cerrar
      setAlumnoSeleccionado(null);
      setMostrarAyuda(false);
      setBusqueda("");
      setFiltroEstado("TODOS");
      setFiltroAvanzado("TODOS");
      setOrdenamiento("DEFECTO");
    }
  }, [isOpen]);

  // 2. CARGAR HISTORIAL AL SELECCIONAR UN ALUMNO
  useEffect(() => {
    if (alumnoSeleccionado) {
      cargarHistorial(
        alumnoSeleccionado.id,
        setLoadingHistorial,
        setHistorialSeleccionado
      );
    } else {
      setAlumnoSeleccionado(null);
      setHistorialSeleccionado([]);
    }
  }, [alumnoSeleccionado]);

  // --- FUNCIÓN: CALCULAR DÍAS DESDE ÚLTIMO CONTACTO ---
  // --- LÓGICA DE FILTRADO ---
  const alumnosFiltrados = obtenerAlumnosFiltrados(ausentesData, {
    busqueda,
    filtroEstado,
    filtroAvanzado,
    ordenamiento,
  });

  // --- PAGINACIÓN ---
  const totalPaginas = Math.ceil(alumnosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceUltimoItem = paginaActual * ITEMS_POR_PAGINA;
  const indicePrimerItem = indiceUltimoItem - ITEMS_POR_PAGINA;
  const alumnosPaginados = alumnosFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem
  );

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroEstado, filtroAvanzado, ordenamiento, busqueda]);

  // Evita combinaciones inválidas
  useEffect(() => {
    const opcionesNoPermitidas = ["SIN_CONTACTO", "CON_CONTACTO"];
    if (
      filtroEstado === "VERDE" &&
      opcionesNoPermitidas.includes(filtroAvanzado)
    ) {
      setFiltroAvanzado("TODOS");
    }
  }, [filtroEstado, filtroAvanzado]);

  const cambiarPagina = (n) => {
    if (n >= 1 && n <= totalPaginas) setPaginaActual(n);
  };

  const deshabilitarFiltrosBasicos = filtroEstado === "VERDE";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white w-full max-w-7xl h-[98vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-bignoodle">
              {mostrarAyuda
                ? "¿CÓMO USAR ESTA VENTANA?"
                : alumnoSeleccionado
                ? "FICHA DE SEGUIMIENTO"
                : "AUSENTES POR CLASES"}
            </h2>
            <p className="text-sm text-gray-500">
              {mostrarAyuda
                ? "Guía paso a paso para usar este formulario"
                : alumnoSeleccionado
                ? `Gestionando a: ${alumnoSeleccionado.nombre}`
                : "Alumnos con 2 o más inasistencias"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarCalendario(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
            >
              <FaClock className="text-blue-600" />
              Ver Calendario
            </button>
            <button
              onClick={() => setMostrarAyuda(!mostrarAyuda)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm ${
                mostrarAyuda
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
              }`}
            >
              <FaQuestionCircle
                className={mostrarAyuda ? "text-gray-500" : "text-orange-600"}
              />
              {mostrarAyuda ? "Volver a Ausentes" : "Ayuda"}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative">
          {mostrarAyuda ? (
            <AyudaAusentes onCerrar={() => setMostrarAyuda(false)} />
          ) : isLoadingAusentesData && !ausentesData.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : errorAusentesData ? (
            <div className="flex items-center justify-center h-full text-red-600 font-medium">
              {"Se produjo un error al cargar los datos"}
            </div>
          ) : !alumnoSeleccionado ? (
            // =========================
            // VISTA 1: LISTADO (TABLA)
            // =========================
            <div className="h-full flex flex-col p-2">
              {/* FILTROS */}
              <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                  {/* BÚSQUEDA Y FILTROS DE ESTADO */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    <input
                      type="text"
                      className="block w-full max-w-md pl-4 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                      placeholder="Buscar por nombre o teléfono..."
                      value={busqueda}
                      onChange={(e) => {
                        setBusqueda(e.target.value);
                        setPaginaActual(1);
                      }}
                    />
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setFiltroEstado("TODOS");
                          setPaginaActual(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-sm ${
                          filtroEstado === "TODOS"
                            ? "bg-orange-500 text-white hover:bg-orange-600"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => {
                          setFiltroEstado("ROJO");
                          setPaginaActual(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-sm ${
                          filtroEstado === "ROJO"
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-red-50"
                        }`}
                      >
                        {filtroEstado != "ROJO" && "🔴"} No contactados
                      </button>
                      <button
                        onClick={() => {
                          setFiltroEstado("VERDE");
                          setPaginaActual(1);
                        }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition shadow-sm ${
                          filtroEstado === "VERDE"
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-white text-gray-600 border border-gray-300 hover:bg-green-50"
                        }`}
                      >
                        {filtroEstado != "VERDE" && "🟢"} Contactados
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* SELECTOR DE FILTROS AVANZADOS */}
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase whitespace-nowrap">
                        Filtro Avanzado:
                      </label>
                      <select
                        value={filtroAvanzado}
                        onChange={(e) => {
                          setFiltroAvanzado(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white shadow-sm"
                      >
                        <option value="TODOS">📋 Todos los alumnos</option>
                        <optgroup label="━━━ Por Estado de Contacto ━━━">
                          <option
                            value="SIN_CONTACTO"
                            disabled={deshabilitarFiltrosBasicos}
                          >
                            ❌ Sin ningún contacto realizado
                          </option>
                          <option
                            value="CON_CONTACTO"
                            disabled={deshabilitarFiltrosBasicos}
                          >
                            ✅ Con al menos 1 contacto
                          </option>
                          <option value="CONTACTO_MAS_15_DIAS">
                            ⏰ Último contacto hace +15 días
                          </option>
                          <option value="CONTACTO_MENOS_15_DIAS">
                            🕐 Último contacto hace -15 días
                          </option>
                          <option value="ESPERANDO_RESPUESTA">
                            ⌛ Esperando respuesta
                          </option>
                        </optgroup>
                      </select>
                    </div>
                    {/* SELECTOR DE ORDENAMIENTO */}
                    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                      <label className="text-xs font-bold text-gray-600 uppercase whitespace-nowrap">
                        Ordenar por:
                      </label>
                      <select
                        value={ordenamiento}
                        onChange={(e) => {
                          setOrdenamiento(e.target.value);
                          setPaginaActual(1);
                        }}
                        className="block w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm bg-white shadow-sm"
                      >
                        <option value="DEFECTO">📌 Orden por defecto</option>
                        <option value="MAS_FALTAS">
                          ⬇️ Más faltas primero
                        </option>
                        <option value="MENOS_FALTAS">
                          ⬆️ Menos faltas primero
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500 font-medium whitespace-nowrap mt-2 md:mt-0">
                  Mostrando{" "}
                  <span className="font-bold text-gray-900">
                    {alumnosPaginados.length}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-gray-900">
                    {alumnosFiltrados.length}
                  </span>
                </div>
              </div>

              {/* TABLA */}
              <div className="flex-1 overflow-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Alumno
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Ausencias
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alumnosPaginados.length > 0 ? (
                      alumnosPaginados.map((alumno) => {
                        const diasUltimoContacto =
                          calcularDiasDesdeUltimoContacto(alumno);

                        // Respetamos el estado_visual y color_alerta que ya vienen procesados
                        const esAmarillo = alumno.estado_visual === "AMARILLO";
                        const esRojo = alumno.color_alerta === "ROJO";
                        const esVerde = alumno.estado_visual === "VERDE";

                        // Definir color de fondo de la fila
                        let bgClass = "!bg-green-100";
                        if (esRojo) bgClass = "!bg-red-100";
                        if (esAmarillo) bgClass = "!bg-yellow-50";

                        return (
                          <tr
                            key={alumno.id}
                            className={`hover:bg-opacity-80 transition duration-150 ${bgClass}`}
                            onClick={() => setAlumnoSeleccionado(alumno)}
                          >
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="text-sm font-bold text-gray-900 leading-tight">
                                  {alumno.nombre}
                                </span>
                                {diasUltimoContacto !== null && (
                                  <span className="text-[10px] text-gray-600">
                                    Último: hace {diasUltimoContacto} días
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                              {alumno.telefono}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-white border border-gray-300 shadow-sm text-gray-700">
                                {alumno.faltas_desde_ultimo_presente} clases
                              </span>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              {esAmarillo ? (
                                <span className="inline-flex px-2 py-0.5 text-[11px] font-bold leading-4 text-yellow-800 bg-yellow-200 rounded-full border border-yellow-300 shadow-sm">
                                  Esperando
                                </span>
                              ) : esRojo ? (
                                <span className="inline-flex px-2 py-0.5 text-[11px] font-bold leading-4 text-red-800 bg-red-200 rounded-full border border-red-300 shadow-sm">
                                  Requiere contacto
                                </span>
                              ) : (
                                <span className="inline-flex px-2 py-0.5 text-[11px] font-bold leading-4 text-green-800 bg-green-200 rounded-full border border-green-300 shadow-sm">
                                  {(alumno.faltas_desde_ultimo_presente >= 0 && alumno.faltas_desde_ultimo_presente <= 2) ? 'Alumno presente' : 'Gestionado'}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-center">
                              <div className="flex flex-col items-center gap-0.5">
                                {esRojo ? (
                                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-3 rounded shadow-sm text-[11px] transition transform hover:scale-105 uppercase tracking-wide">
                                    Contactar
                                  </button>
                                ) : (
                                  <div className="flex flex-col items-center">
                                    <span className="text-green-700 font-bold text-[10px] flex items-center gap-1 mb-0.5 bg-white px-1.5 py-0 rounded border border-green-200">
                                      ✔ Contactado
                                    </span>
                                    <button className="text-[10px] text-blue-600 hover:underline font-medium leading-tight">
                                      Ver Observación
                                    </button>
                                  </div>
                                )}
                                {alumno.total_contactos > 0 && esRojo && (
                                  <button className="text-[10px] text-blue-600 hover:underline font-medium leading-tight">
                                    Ver Observación
                                  </button>
                                )}
                                <span className="text-[10px] text-gray-500 mt-0.5 leading-none">
                                  Contactos:{" "}
                                  <strong className="text-gray-800">
                                    {alumno.total_contactos}
                                  </strong>
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No se encontraron alumnos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {alumnosFiltrados.length > ITEMS_POR_PAGINA && (
                <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página <span className="font-bold">{paginaActual}</span> de{" "}
                    <span className="font-bold">{totalPaginas}</span>
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : (
            // =========================
            // VISTA 2: DETALLE (MODAL)
            // =========================
            <div className="h-full flex flex-col p-6 animate-fadeIn bg-gray-50">
              <button
                onClick={() => setAlumnoSeleccionado(null)}
                className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition font-medium w-fit"
              >
                ← Volver
              </button>

              <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                {/* INFO IZQUIERDA */}
                <div className="lg:w-1/3 bg-white p-6 rounded-xl border border-gray-200 shadow-md h-fit">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-sm text-orange-600 text-3xl font-bignoodle">
                      {alumnoSeleccionado.nombre.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {alumnoSeleccionado.nombre}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      ID: #{alumnoSeleccionado.id}
                    </p>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-medium text-gray-900">
                        {alumnoSeleccionado.telefono}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Faltas en total:</span>
                      <span className="font-bold text-red-500">
                        {alumnoSeleccionado.racha_actual}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Faltas desde el último presente:</span>
                      <span className="font-bold text-orange-600">
                        {alumnoSeleccionado.faltas_desde_ultimo_presente}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Total Contactos:</span>
                      <span className="font-bold text-blue-600">
                        {historialSeleccionado.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">
                      Observación del Cliente
                    </h4>
                    <p className="text-sm text-orange-900 italic">
                      "
                      {alumnoSeleccionado.observaciones_cliente ||
                        "Sin observaciones."}
                      "
                    </p>
                  </div>
                </div>

                {/* HISTORIAL DERECHA */}
                <div className="lg:w-2/3 flex flex-col gap-4 h-full">
                  {loadingHistorial ? (
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 overflow-y-auto shadow-sm flex items-center justify-center">
                      <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full"></div>
                    </div>
                  ) : historialSeleccionado.length === 0 ? (
                    <div className="flex-1 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white border border-orange-200 flex items-center justify-center shadow-sm text-orange-500 text-2xl">
                        📭
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-orange-700 mb-1">
                          Sin contactos registrados
                        </h4>
                        <p className="text-sm text-gray-600 max-w-md">
                          Aún no hay un historial para este alumno. Registrá el
                          primer contacto y verás aquí la línea de tiempo.
                        </p>
                      </div>
                      <button
                        onClick={() => textareaRef.current?.focus()}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-sm text-sm"
                      >
                        Registrar primer contacto
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-3 overflow-y-auto shadow-sm">
                      <h4 className="text-base font-bold text-orange-600 uppercase mb-2 border-b pb-1 font-bignoodle">
                        Historial de observaciones
                      </h4>
                      <ul className="space-y-3 ml-1">
                        {historialSeleccionado.map((item) => (
                          <li
                            key={item.id}
                            className="relative pl-5 border-l-2 border-gray-200"
                          >
                            {/* Punto de línea de tiempo reducido y ajustado */}
                            <div className="absolute -left-[7px] top-1 w-3 h-3 bg-white rounded-full border-2 border-blue-500"></div>

                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-0.5">
                              <div className="flex items-center flex-wrap gap-1">
                                <span
                                  className={`text-sm font-bold ${
                                    item.esperando_respuesta
                                      ? "text-yellow-600 bg-yellow-50"
                                      : "text-orange-600 bg-orange-100"
                                  } px-1.5 py-0 rounded w-fit font-bignoodle`}
                                >
                                  {format(
                                    new Date(item.fecha_contacto),
                                    "dd/MM/yyyy HH:mm",
                                    { locale: es }
                                  )}
                                </span>
                                {item.contacto_realizado && (
                                  <span
                                    className={`text-[14px] font-bold ${
                                      item.esperando_respuesta
                                        ? "text-yellow-600 bg-yellow-50"
                                        : "text-orange-600 bg-orange-50"
                                    } px-1.5 py-0 rounded w-fit font-bignoodle`}
                                  >
                                    {`Inasistencias: ${item.contacto_realizado}`}
                                  </span>
                                )}
                              </div>

                              <span className="text-[10px] text-gray-400 mt-0.5 sm:mt-0">
                                {!item.esperando_respuesta
                                  ? "Registrado: "
                                  : "Contactado: "}{" "}
                                {item.usuario?.name || "Desconocido"}{" "}
                                {item.usuario?.apellido}
                              </span>
                            </div>

                            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 shadow-sm mt-0.5 flex justify-between items-start">
                              <span className="flex-1 leading-tight">
                                "{item.observacion}"
                              </span>
                              <div className="flex gap-1 ml-2">
                                {!item.esperando_respuesta && (
                                  <button
                                    onClick={() =>
                                      handleEditarHistorial(
                                        item,
                                        alumnoSeleccionado,
                                        setLoadingHistorial,
                                        setHistorialSeleccionado
                                      )
                                    }
                                    className="text-blue-500 hover:text-blue-700 p-0.5 rounded hover:bg-blue-50 transition"
                                    title="Editar observación"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                )}
                                <button
                                  onClick={() =>
                                    handleEliminarHistorial(
                                      item.id,
                                      alumnoSeleccionado,
                                      setLoadingHistorial,
                                      setHistorialSeleccionado,
                                      refetchAusentesData
                                    )
                                  }
                                  className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50 transition"
                                  title="Eliminar observación"
                                >
                                  <FaTrash size={14} />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* NUEVA NOTA */}
                  <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-md mt-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Registrar Nuevo Contacto
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows="2"
                      placeholder="Escribe el resultado..."
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      ref={textareaRef}
                      maxLength={255}
                    ></textarea>

                    <div className="flex justify-between mt-4 gap-3">
                      {/* Boton marcar como esperando respuesta */}
                      <button
                        className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-md text-sm transition-all"
                        onClick={() =>
                          handleGuardarObservacion(
                            "",
                            alumnoSeleccionado,
                            userId,
                            setNuevaObservacion,
                            refetchAusentesData,
                            setLoadingHistorial,
                            setHistorialSeleccionado,
                            true
                          )
                        }
                      >
                        <span>
                          Marcar como{" "}
                          <span className="text-yellow-300">
                            esperando respuesta
                          </span>
                        </span>
                        <FaClock className="text-base" />
                      </button>
                      {/* Otros botones de acciones */}
                      <div>
                        <button
                          onClick={() => setAlumnoSeleccionado(null)}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium mr-1"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() =>
                            handleGuardarObservacion(
                              nuevaObservacion,
                              alumnoSeleccionado,
                              userId,
                              setNuevaObservacion,
                              refetchAusentesData,
                              setLoadingHistorial,
                              setHistorialSeleccionado,
                              false
                            )
                          }
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-md text-sm"
                        >
                          Guardar contacto
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-3 border-t flex justify-between items-center shrink-0">
          {/* Soft Fusion Info */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400">
                Diseñado y desarrollado por{" "}
                <span className="font-bold text-pink-600">Soft Fusion</span>
              </span>
              <div className="flex items-center gap-3 mt-1">
                <a
                  href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-blue-600 transition"
                >
                  <FaFacebookF size={14} />
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-green-500 transition"
                >
                  <FaWhatsapp size={14} />
                </a>
                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-pink-500 transition"
                >
                  <FaInstagram size={14} />
                </a>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-red-50 shadow-sm transition"
          >
            CERRAR VENTANA
          </button>
        </div>
      </div>
            <AsistenciasCalendario 
            isOpen={mostrarCalendario} 
            onClose={() => setMostrarCalendario(false)} 
            idSede={sedeActual}
          />
    </div>
  );
};

export default ModalDetalleAusentes;
