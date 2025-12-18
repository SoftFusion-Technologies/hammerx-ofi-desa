/*
Autor: Sergio Gustavo Manrique 
Descripción: Este componente se llama desde el ModalEstudiantes.jsx con el fin de revisar cambios y eventos relacionados a un alumno en particular.
Fecha de creación: 10/12/2024
*/

import React, { useEffect, useState } from "react";
import useHistorialAlumnos from "../Logic/PilatesGestion/HistorialAlumnos";
import {
  MdArrowBack,
  MdHistory,
  MdEdit,
  MdUpdate,
  MdPersonAdd,
  MdCancel,
  MdAccessTime,
  MdPerson,
} from "react-icons/md";
import { FaCalendarAlt, FaUserEdit, FaFileAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { format, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const HistorialAlumno = ({ volver, cerrar, idCliente, nombreCliente }) => {
  const {
    alumnosHistorialDB, // Datos del historial del alumno
    loadingAlumnosHistorial, // Estados de carga
    errorAlumnosHistorial, // Estados de carga y error
    obtenerDatosHistorialAlumnos, // Funcion para obtener datos del historial
  } = useHistorialAlumnos(); // Hook personalizado para obtener el historial del alumno

  const [detallesVisibles, setDetallesVisibles] = useState({}); // Estado para controlar la visibilidad de los detalles de cada evento
  const [filtroTipo, setFiltroTipo] = useState("TODOS"); // Estado para el filtro de tipo de evento
  const [paginaActual, setPaginaActual] = useState(1); // Estado para la paginación
  const eventosPorPagina = 5; // Número de eventos por página

  // Cargar el historial del alumno cuando el componente se monta o cambia el idCliente
  useEffect(() => {
    obtenerDatosHistorialAlumnos(idCliente);
  }, [idCliente]);

  const historialSeguro = Array.isArray(alumnosHistorialDB)
    ? alumnosHistorialDB
    : [];

  const tiposUnicos = [...new Set(historialSeguro.map((e) => e.tipo_evento))]; // Extraemos los tipos de eventos únicos del historial

  // Ordenamos los eventos por fecha de evento
  const eventosFiltrados =
    filtroTipo === "TODOS"
      ? historialSeguro
      : historialSeguro.filter((evento) => evento.tipo_evento === filtroTipo);

  const totalEventos = eventosFiltrados.length;
  const totalPaginas = Math.ceil(totalEventos / eventosPorPagina);
  const indiceInicial = (paginaActual - 1) * eventosPorPagina;

  // Si el orden es "NUEVOS", ordenamos de más reciente a más antiguo
  const eventosPaginados = eventosFiltrados.slice(
    indiceInicial,
    indiceInicial + eventosPorPagina
  );

  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
    }
  };

  const alternarDetalles = (id) => {
    setDetallesVisibles((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Funciones para obtener iconos y colores según el tipo de evento
  const obtenerIconoEvento = (tipo) => {
    switch (tipo) {
      case "ALTA":
        return <MdPersonAdd className="text-green-500 text-xl" />;
      case "MODIFICACION":
        return <MdEdit className="text-blue-500 text-xl" />;
      case "CAMBIO_PLAN":
        return <MdUpdate className="text-purple-500 text-xl" />;
      case "CAMBIO_TURNO":
        return <MdUpdate className="text-orange-300 text-xl" />;
      case "BAJA":
        return <MdCancel className="text-red-500 text-xl" />;
      default:
        return <MdHistory className="text-gray-500 text-xl" />;
    }
  };

  // Función para obtener el texto de estado de un horario deshabilitado
  const obtenerColorEvento = (tipo) => {
    switch (tipo) {
      case "ALTA":
        return "bg-green-50 border-green-200";
      case "MODIFICACION":
        return "bg-blue-50 border-blue-200";
      case "CAMBIO_PLAN":
        return "bg-purple-50 border-purple-200";
      case "CAMBIO_TURNO":
        return "bg-orange-50 border-orange-200";
      case "BAJA":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  // Función para formatear la fecha de un evento
  const formatearFecha = (fechaString) => {
    if (!fechaString) return "-";
    const fechaNormalizada = fechaString.replace(" ", "T");
    const objetoFecha = parseISO(fechaNormalizada);
    if (!isValid(objetoFecha)) return "-";
    const tieneHora = fechaString.includes("T") || fechaString.includes(":");
    if (tieneHora) {
      // Formato con hora: Día/Mes/Año Hora:Minuto
      const formatoConHora = "dd/MM/yyyy HH:mm";
      return format(objetoFecha, formatoConHora, { locale: es });
    }

    // Formato solo fecha: Día/Mes/Año
    const formatoSoloFecha = "dd/MM/yyyy";
    return format(objetoFecha, formatoSoloFecha, { locale: es });
  };

  // Función para traducir el tipo de evento a un texto legible
  const traducirTipoEvento = (tipo) => {
    const traducciones = {
      ALTA: "Alta",
      MODIFICACION: "Modificación",
      CAMBIO_PLAN: "Cambios en el plan",
      CAMBIO_TURNO: "Cambio de turno",
      BAJA: "Baja",
    };
    return traducciones[tipo] || tipo;
  };

  // 1. Define la función auxiliar (por fuera del componente principal)
  const esCampoFecha = (campo) => {
    return (
      campo === "Fecha Inicio" ||
      campo === "Fecha Fin" ||
      campo === "Fecha prometida de pago"
    );
  };

  // 2. Define la función para aplicar el formateo condicional al valor
  const formatearValor = (campo, valor) => {
    if (esCampoFecha(campo)) {
      // La función 'formatearFecha' debe estar definida o importada aquí.
      return formatearFecha(valor);
    }
    return valor;
  };
  return (
    <div className="bg-white rounded-xl p-6 w-full max-w-[100%]  sm:max-w-[80%] shadow-xl border border-gray-100">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-500 rounded-lg">
            <MdHistory className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-orange-600 font-bignoodle">
              Historial del Alumno
            </h2>
            <p className="text-gray-600 text-sm">
              Registro de actividades y cambios del alumno{" "}
              <strong>{nombreCliente}</strong>
            </p>
          </div>
        </div>

        <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
          <button
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
            onClick={() => volver(false)}
          >
            <MdArrowBack className="text-lg" />
            <span>Volver</span>
          </button>
          <button
            className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium transition-all duration-300 shadow hover:shadow-lg"
            onClick={cerrar}
          >
            <IoClose className="text-lg" />
            <span>Cerrar</span>
          </button>
        </div>
      </div>
      {loadingAlumnosHistorial ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <MdHistory />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Cargando historial...
          </h3>
          <p className="text-gray-500">Por favor, espere un momento.</p>
        </div>
      ) : errorAlumnosHistorial ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            <MdHistory /> Error al cargar el historial
          </h3>
        </div>
      ) : alumnosHistorialDB.length > 0 ? (
        <>
          {/* Resumen general */}
          <div className="mb-6 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <FaCalendarAlt className="text-blue-600 text-base" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total de eventos</p>
                  <p className="text-base font-bold text-gray-800">
                    {alumnosHistorialDB.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <MdPersonAdd className="text-green-600 text-base" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Fecha de alta</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {alumnosHistorialDB.find((h) => h.tipo_evento === "ALTA")
                      ? formatearFecha(
                          alumnosHistorialDB.find(
                            (h) => h.tipo_evento === "ALTA"
                          ).fecha_evento
                        )
                      : "No registrada"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <FaUserEdit className="text-purple-600 text-base" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Última modificación</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatearFecha(alumnosHistorialDB[0]?.fecha_evento)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtro por tipo de evento */}
          <div className="mb-4">
            <label
              htmlFor="filtro-tipo"
              className="text-sm font-medium text-gray-700 mr-2"
            >
              Filtrar por tipo:
            </label>
            <select
              id="filtro-tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="TODOS">Todos los eventos</option>
              {tiposUnicos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {traducirTipoEvento(tipo)}
                </option>
              ))}
            </select>
          </div>

          {/* Lista de eventos del historial */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center">
              <MdAccessTime className="mr-1.5 text-blue-500 text-base" />
              Eventos Registrados
            </h3>

            {/* Controles de paginación */}
            {totalPaginas > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-2">
                <button
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    paginaActual === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Anterior
                </button>

                {[...Array(totalPaginas)].map((_, i) => {
                  const pagina = i + 1;
                  return (
                    <button
                      key={pagina}
                      onClick={() => irAPagina(pagina)}
                      className={`w-8 h-8 rounded-full text-sm font-medium ${
                        paginaActual === pagina
                          ? "bg-orange-500 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {pagina}
                    </button>
                  );
                })}

                <button
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className={`px-3 py-1 rounded-md text-sm ${
                    paginaActual === totalPaginas
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Siguiente
                </button>
              </div>
            )}

            {eventosPaginados.map((evento) => (
              <div
                key={evento.id}
                className={`rounded-xl border-l-4 ${
                  evento.tipo_evento === "ALTA"
                    ? "border-l-green-400"
                    : evento.tipo_evento === "MODIFICACION"
                    ? "border-l-blue-400"
                    : evento.tipo_evento === "CAMBIO_PLAN"
                    ? "border-l-purple-400"
                    : evento.tipo_evento === "CAMBIO_TURNO"
                    ? "border-l-orange-400"
                    : "border-l-red-400"
                } ${obtenerColorEvento(
                  evento.tipo_evento
                )} p-3 shadow-sm hover:shadow-md transition-shadow duration-300`}
              >
                {/* Header del evento */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                  <div className="flex items-center space-x-2 mb-2 md:mb-0">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm">
                      {obtenerIconoEvento(evento.tipo_evento)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            evento.tipo_evento === "ALTA"
                              ? "bg-green-100 text-green-800"
                              : evento.tipo_evento === "MODIFICACION"
                              ? "bg-blue-100 text-blue-800"
                              : evento.tipo_evento === "CAMBIO_PLAN"
                              ? "bg-purple-100 text-purple-800"
                              : evento.tipo_evento === "CAMBIO_TURNO"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {traducirTipoEvento(evento.tipo_evento)}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                          <MdAccessTime className="mr-1" size={12} />
                          {formatearFecha(evento.fecha_evento)}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-800">
                        {evento.resumen || "Sin resumen disponible"}
                      </div>
                    </div>
                  </div>

                  {evento.tipo_evento !== "ALTA" && (
                    <button
                      onClick={() => alternarDetalles(evento.id)}
                      className="px-2.5 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      {detallesVisibles[evento.id]
                        ? "Ocultar detalles"
                        : "Ver detalles"}
                    </button>
                  )}
                </div>

                {/* Detalles específicos (si existen y están visibles) */}
                {detallesVisibles[evento.id] &&
                  evento.detalles &&
                  evento.detalles.length > 0 &&
                  evento.tipo_evento != "ALTA" && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h5 className="font-medium text-gray-700 mb-2 flex items-center text-sm">
                        <MdEdit className="mr-1.5 text-gray-500" />
                        Cambios específicos:
                      </h5>
                      <div className="space-y-2">
                        {evento.detalles.map((detalle) => (
                          <div
                            key={detalle.id}
                            className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                          >
                            <div className="flex justify-between items-start mb-1.5">
                              {/* Aquí solo se muestra el nombre del campo, no es necesario formatear la fecha */}
                              <span className="font-medium text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                                {detalle.campo}
                              </span>
                              <span className="text-xs text-gray-500">
                                ID: {detalle.id}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* VALOR ANTERIOR */}
                              <div>
                                <p className="text-xs text-gray-600 mb-1">
                                  Valor anterior:
                                </p>
                                <div className="p-1.5 bg-red-50 border border-red-100 rounded">
                                  <p className="text-gray-800 text-sm">
                                    {/* Aplicamos formatearValor aquí */}
                                    {detalle.valor_anterior ? (
                                      formatearValor(
                                        detalle.campo,
                                        detalle.valor_anterior
                                      )
                                    ) : (
                                      <span className="italic text-gray-500">
                                        Vacío
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* VALOR NUEVO */}
                              <div>
                                <p className="text-xs text-gray-600 mb-1">
                                  Valor nuevo:
                                </p>
                                <div className="p-1.5 bg-green-50 border border-green-100 rounded">
                                  <p className="text-gray-800 font-medium text-sm">
                                    {/* Aplicamos formatearValor aquí */}
                                    {detalle.valor_nuevo ? (
                                      formatearValor(
                                        detalle.campo,
                                        detalle.valor_nuevo
                                      )
                                    ) : (
                                      <span className="italic text-gray-500">
                                        Vacío
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Flecha de cambio */}
                            <div className="flex justify-center mt-2">
                              <div className="relative w-12">
                                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                                  <span className="text-red-600 text-[9px]">
                                    A
                                  </span>
                                </div>
                                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <span className="text-green-600 text-[9px]">
                                    N
                                  </span>
                                </div>
                                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                  <div className="text-gray-400 text-sm">→</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Footer del evento */}
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center">
                    <MdPerson className="mr-1.5" />
                    <span>
                      {evento.tipo_evento === "ALTA"
                        ? "Alta realizada por: "
                        : "Cambio realizado por: "}

                      {evento.es_instructor
                        ? "Instructor"
                        : evento.informacion_usuario?.name || "Desconocido"}
                    </span>
                  </div>
                  {/*                   <div>
                    <span>Evento ID: {evento.id}</span>
                  </div> */}
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Leyenda:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Alta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Modificación</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cambio en el plan</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cambios de turnos</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No hay historial registrado
          </h3>
          <p className="text-gray-500">
            Este alumno no tiene eventos registrados en el historial.
          </p>
        </div>
      )}
    </div>
  );
};

export default HistorialAlumno;
