/* Autor: Sergio Manrique
Fecha de creación: 23-12-2025
*/
import React, { useState } from "react"; // Agregado useState
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaTag,
  FaClock,
  FaCalendarAlt,
  FaUserFriends,
  FaExclamationCircle,
  FaCheckCircle,
  FaLayerGroup,
  FaPercentage,
  FaTimes,
  FaQuestionCircle, // Agregado icono de ayuda
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import RedesSoft from "../RedesSoft";
import useCuposConDescuento from "../../Logic/PilatesGestion/CuposConDescuento";
import AyudaDescuentos from "./AyudaDescuentos"; // Import corregido (PascalCase habitual en componentes)

// Registrar idioma español para el calendario
registerLocale("es", es);

// --- COMPONENTE DE TARJETA ---
const DescuentoCard = ({
  item,
  colorBorder,
  idEdicion,
  onEdit,
  onDelete,
  formatDate,
  formatDateTime,
  puedeEditarSede, // Permiso de edición para la sede
}) => {
  const estado = (item.estado || "").toLowerCase();
  const estaVencido = estado === "vencido";
  const estaProgramado = estado === "programado";
  const estaVigente = estado === "vigente";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-all duration-300 ${idEdicion === item.id ? "ring-2 ring-blue-400" : ""}`}
    >
      <div className={`h-1.5 w-full ${colorBorder}`}></div>

      <div className="p-4">
        {/* Header Tarjeta */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-1.5 rounded-lg text-gray-600">
              <FaClock size={14} />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800 font-bignoodle tracking-wide leading-none block">
                {item.horario}{" "}
                <span className="text-xs text-gray-400 font-sans">HS</span>
              </span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN - VALIDACIÓN DE PERMISOS */}
          <div className="flex gap-1">
            <button
              onClick={() => puedeEditarSede && onEdit(item)}
              disabled={!puedeEditarSede}
              className={`p-1.5 rounded-md transition-colors ${
                puedeEditarSede
                  ? "text-gray-400 hover:text-blue-500 hover:bg-blue-50 cursor-pointer"
                  : "text-gray-200 cursor-not-allowed" // Gris claro y sin cursor si no hay permiso
              }`}
              title={puedeEditarSede ? "Modificar" : "No tienes permisos"}
            >
              <FaEdit size={14} />
            </button>
            <button
              onClick={() => puedeEditarSede && onDelete(item.id)}
              disabled={!puedeEditarSede}
              className={`p-1.5 rounded-md transition-colors ${
                puedeEditarSede
                  ? "text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                  : "text-gray-200 cursor-not-allowed" // Gris claro y sin cursor si no hay permiso
              }`}
              title={puedeEditarSede ? "Eliminar" : "No tienes permisos"}
            >
              <FaTrash size={14} />
            </button>
          </div>
        </div>

        {/* Cuerpo Principal */}
        <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3 mb-3 border border-orange-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">
              Beneficio
            </span>
            <span className="text-xl font-bold text-orange-600 leading-tight">
              {item.valorDescuentoMostrar}
            </span>
          </div>
          <div className="h-8 w-px bg-orange-200 mx-2"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <FaUserFriends size={10} /> Cupos
            </span>
            <span className="text-xl font-bold text-orange-600 leading-tight">
              {item.cantidadCupos}
            </span>
          </div>
        </div>

        {/* Detalles Completos (Fechas y Creador) */}
        <div className="space-y-2">
          <div className="flex flex-col gap-1 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
            <div className="flex justify-between border-b border-gray-200 pb-1 mb-1">
              <span className="flex items-center gap-1">
                <FaCalendarAlt size={10} /> Vigencia:
              </span>
              {estaVencido && (
                <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Vencido
                </span>
              )}
              {estaProgramado && (
                <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Programado
                </span>
              )}
              {estaVigente && (
                <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  Vigente
                </span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Desde:</span>{" "}
              <span className="font-medium text-gray-700">
                {formatDate(item.fechaInicio)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Hasta:</span>
              <span
                className={`font-medium ${estaVencido ? "text-red-600 line-through" : "text-gray-700"}`}
              >
                {formatDate(item.fechaVencimiento)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-1 border-t border-gray-50">
            <span>Cargado: {formatDateTime(item.createdAt)}</span>
            <span title={item.creadoPor}>
              Por:{" "}
              <span className="font-medium text-gray-500">
                {item.creadoPor || "-"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- COMPONENTE DE SECCIÓN ---
const RenderSection = ({
  title,
  items,
  colorBorder,
  idEdicion,
  onEdit,
  onDelete,
  formatDate,
  formatDateTime,
  puedeEditarSede, // Permiso de edición para la sede
}) => {
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
        <FaTag className="text-orange-500" /> {title} ({items.length})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <AnimatePresence>
          {items.map((item) => (
            <DescuentoCard
              key={item.id}
              item={item}
              colorBorder={colorBorder}
              idEdicion={idEdicion}
              onEdit={onEdit}
              onDelete={onDelete}
              formatDate={formatDate}
              formatDateTime={formatDateTime}
              puedeEditarSede={puedeEditarSede} // PASAMOS LA PROP
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const CuposDescuentos = ({
  horariosDeshabilitados = [],
  maximaCapacidad,
  sedeActualFiltro,
  refrescarHorarios,
  puedeEditarSede,
}) => {
  // Estado para mostrar el modal de ayuda
  const [mostrarAyuda, setMostrarAyuda] = useState(false);

  // Extraemos toda la lógica del hook
  const {
    loading,
    error,
    loadingGuardar,
    modoEdicion,
    idEdicion,
    planSeleccionado,
    horariosDisponibles,
    formulario,
    errores,
    listaDescuentos,
    descuentosTodos,
    descuentosLMV,
    descuentosMJ,
    seleccionarPlan,
    seleccionarHorario,
    manejarCambio,
    handlePorcentajeChange,
    manejarFechaInicio,
    manejarFechaVencimiento,
    guardarRegla,
    iniciarEdicion,
    cancelarEdicion,
    eliminarDescuento,
    formatDate,
    formatDateTime,
  } = useCuposConDescuento({
    horariosDeshabilitados,
    maximaCapacidad,
    sedeActualFiltro,
    refrescarHorarios,
  });

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-messina">
      <div className="mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3 font-bignoodle tracking-wide">
                <FaTag className="text-orange-600" />
                GESTIÓN DE CUPOS CON DESCUENTO
                {/* BOTON DE AYUDA */}
                <button
                  onClick={() => setMostrarAyuda(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-400 bg-orange-50 text-orange-700 font-bold shadow-sm hover:bg-orange-100 hover:text-orange-900 hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 ml-4 text-base"
                  title="Ayuda del sistema"
                >
                  <FaQuestionCircle size={18} className="text-orange-500" />
                  <span className="hidden sm:inline">Ayuda</span>
                </button>
              </h1>
              <p className="text-gray-500 mt-2 font-light">
                Configura beneficios exclusivos limitados por horario y cupo.
              </p>
            </div>
            <div className="hidden xl:block">
              <RedesSoft />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
          <div className="lg:col-span-5 xl:col-span-4">
            <motion.div
              layout
              className={`bg-white rounded-xl shadow-lg border-t-4 ${
                !puedeEditarSede // Si no puede editar, borde gris
                  ? "border-gray-400"
                  : modoEdicion
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-orange-600"
              } p-6 sticky top-6`}
            >
              <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center justify-between font-bignoodle tracking-wide text-2xl">
                <span className="flex items-center gap-2">
                  <span
                    className={`p-2 rounded-full ${
                      !puedeEditarSede // Icono gris si no hay permisos
                        ? "bg-gray-100 text-gray-400"
                        : modoEdicion
                          ? "bg-blue-100 text-blue-600"
                          : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    {modoEdicion ? <FaEdit size={16} /> : <FaPlus size={16} />}
                  </span>
                  {modoEdicion ? "EDITAR REGLA" : "NUEVA REGLA"}
                </span>
                {modoEdicion && (
                  <button
                    onClick={cancelarEdicion}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded flex items-center gap-1 transition-colors font-sans"
                  >
                    <FaTimes /> Cancelar
                  </button>
                )}
              </h2>

              {/* FIELDSET DISABLED: Bloquea todos los inputs si no hay permisos */}
              <fieldset
                disabled={!puedeEditarSede}
                className={!puedeEditarSede ? "opacity-75" : ""}
              >
                <form onSubmit={guardarRegla} className="flex flex-col gap-5">
                  {/* GRUPO */}
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                      <FaLayerGroup
                        className={
                          !puedeEditarSede
                            ? "text-gray-400"
                            : modoEdicion
                              ? "text-blue-500"
                              : "text-orange-500"
                        }
                      />{" "}
                      SELECCIONAR GRUPO
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["L-M-V", "M-J"].map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => seleccionarPlan(plan)}
                          disabled={!puedeEditarSede}
                          className={`py-2 px-2 rounded-lg border-2 text-xs font-bold transition-all uppercase ${
                            planSeleccionado === plan
                              ? modoEdicion
                                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-orange-500 bg-orange-50 text-orange-700 shadow-sm"
                              : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {plan}
                        </button>
                      ))}
                    </div>
                    {errores.plan && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FaExclamationCircle /> {errores.plan}
                      </p>
                    )}
                  </div>

                  {/* HORARIO */}
                  <AnimatePresence>
                    {planSeleccionado && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="block text-sm font-bold text-gray-600 mb-2 flex items-center gap-2">
                          <FaClock
                            className={
                              !puedeEditarSede
                                ? "text-gray-400"
                                : modoEdicion
                                  ? "text-blue-500"
                                  : "text-orange-500"
                            }
                          />{" "}
                          SELECCIONAR HORARIO
                        </label>

                        {horariosDisponibles.length > 0 ? (
                          <div className="grid grid-cols-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 max-h-40 overflow-y-auto custom-scrollbar">
                            {horariosDisponibles.map((hora) => (
                              <button
                                key={hora}
                                type="button"
                                onClick={() => seleccionarHorario(hora)}
                                disabled={!puedeEditarSede}
                                className={`py-1.5 px-1 rounded text-xs font-bold transition-all relative ${
                                  formulario.horario === hora
                                    ? modoEdicion
                                      ? "bg-blue-600 text-white shadow-md transform scale-105"
                                      : "bg-orange-600 text-white shadow-md transform scale-105"
                                    : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                {hora}
                                {formulario.horario === hora && (
                                  <div
                                    className={`absolute -top-1 -right-1 bg-white rounded-full ${modoEdicion ? "text-blue-600" : "text-orange-600"}`}
                                  >
                                    <FaCheckCircle size={10} />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-3 bg-gray-50 rounded text-xs text-gray-400 border border-dashed">
                            No hay horarios disponibles.
                          </div>
                        )}
                        {errores.horario && (
                          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <FaExclamationCircle /> {errores.horario}
                          </p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* DETALLES */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                          Cupos
                        </label>
                        <div className="relative">
                          <FaUserFriends className="absolute top-3 left-2 text-gray-400 z-10 text-xs" />
                          <input
                            type="number"
                            name="cantidadCupos"
                            value={formulario.cantidadCupos}
                            onChange={manejarCambio}
                            disabled={!puedeEditarSede}
                            placeholder="Ej: 5"
                            className={`w-full pl-7 pr-2 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 bg-white ${errores.cantidadCupos ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-orange-500"}`}
                          />
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                          Desc. (%)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="valorDescuento"
                            value={formulario.valorDescuento}
                            onChange={handlePorcentajeChange}
                            disabled={!puedeEditarSede}
                            placeholder="Ej: 20,5"
                            className={`w-full pl-3 pr-6 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 bg-white font-bold text-gray-700 ${errores.valorDescuento ? "border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-orange-500"}`}
                          />
                          <FaPercentage className="absolute top-3 right-2 text-gray-400 z-10 text-xs" />
                        </div>
                      </div>
                    </div>
                    {(errores.cantidadCupos || errores.valorDescuento) && (
                      <div className="mt-1">
                        {errores.cantidadCupos && (
                          <p className="text-[10px] text-red-500">
                            {errores.cantidadCupos}
                          </p>
                        )}
                        {errores.valorDescuento && (
                          <p className="text-[10px] text-red-500">
                            {errores.valorDescuento}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* FECHAS */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                        Fecha Inicio
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formulario.fechaInicio}
                          onChange={manejarFechaInicio}
                          disabled={!puedeEditarSede}
                          locale="es"
                          dateFormat="dd/MM/yyyy"
                          className={`w-full pl-7 pr-2 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errores.fechaInicio ? "border-red-500" : "border-gray-200 focus:border-orange-500"}`}
                          showPopperArrow={false}
                        />
                        <FaCalendarAlt className="absolute top-3 left-2 text-gray-400 z-10 text-xs pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 mb-1 uppercase">
                        Fecha Fin
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={formulario.fechaVencimiento}
                          onChange={manejarFechaVencimiento}
                          disabled={!puedeEditarSede}
                          locale="es"
                          dateFormat="dd/MM/yyyy"
                          minDate={formulario.fechaInicio || new Date()}
                          placeholderText="dd/mm/aaaa"
                          className={`w-full pl-7 pr-2 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 ${errores.fechaVencimiento ? "border-red-500" : "border-gray-200 focus:border-orange-500"}`}
                          showPopperArrow={false}
                        />
                        <FaCalendarAlt className="absolute top-3 left-2 text-gray-400 z-10 text-xs pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  {errores.fechaVencimiento && (
                    <p className="text-xs text-red-500 -mt-2">
                      {errores.fechaVencimiento}
                    </p>
                  )}

                  {/* BOTON GUARDAR - CONDICIONAL */}
                  <button
                    type="submit"
                    disabled={loadingGuardar || !puedeEditarSede} // Se deshabilita
                    className={`mt-2 w-full text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 uppercase tracking-wide text-sm disabled:opacity-50 ${
                      !puedeEditarSede
                        ? "bg-gray-400 cursor-not-allowed shadow-none hover:shadow-none" // Estilo gris
                        : modoEdicion
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                          : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                    }`}
                  >
                    {modoEdicion ? <FaEdit /> : <FaPlus />}
                    {loadingGuardar
                      ? "Procesando..."
                      : modoEdicion
                        ? "Actualizar Regla"
                        : "Guardar Regla"}
                  </button>
                </form>
              </fieldset>
            </motion.div>
          </div>

          {/* --- COLUMNA DERECHA: LISTA --- */}
          <div className="lg:col-span-7 xl:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-700 font-bignoodle tracking-wide">
                DESCUENTOS ACTIVOS
                <span className="ml-3 bg-orange-100 text-orange-600 text-base py-0.5 px-3 rounded-full font-messina font-bold border border-orange-200">
                  {listaDescuentos.length}
                </span>
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-[300px]"
              >
                <div className="p-6 rounded-full bg-red-50 mb-6 border border-red-100">
                  <FaExclamationCircle size={40} className="text-red-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">Error</h3>
                Ocurrió un error
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  {error}
                </p>
              </motion.div>
            ) : listaDescuentos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center h-[300px]"
              >
                <div className="p-6 rounded-full bg-orange-50 mb-6 border border-orange-100">
                  <FaTag size={40} className="text-orange-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Sin descuentos configurados
                </h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                  Utiliza el formulario de la izquierda para cargar tu primera
                  regla de descuento.
                </p>
              </motion.div>
            ) : (
              <div className="space-y-10 pb-20">
                <RenderSection
                  title="TODOS LOS DÍAS"
                  items={descuentosTodos}
                  colorBorder="bg-gradient-to-r from-purple-400 to-purple-600"
                  idEdicion={idEdicion}
                  onEdit={iniciarEdicion}
                  onDelete={eliminarDescuento}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  puedeEditarSede={puedeEditarSede}
                />

                <RenderSection
                  title="LUNES - MIÉRCOLES - VIERNES"
                  items={descuentosLMV}
                  colorBorder="bg-gradient-to-r from-orange-400 to-orange-600"
                  idEdicion={idEdicion}
                  onEdit={iniciarEdicion}
                  onDelete={eliminarDescuento}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  puedeEditarSede={puedeEditarSede}
                />

                <RenderSection
                  title="MARTES - JUEVES"
                  items={descuentosMJ}
                  colorBorder="bg-gradient-to-r from-blue-400 to-blue-600"
                  idEdicion={idEdicion}
                  onEdit={iniciarEdicion}
                  onDelete={eliminarDescuento}
                  formatDate={formatDate}
                  formatDateTime={formatDateTime}
                  puedeEditarSede={puedeEditarSede}
                />
              </div>
            )}
          </div>
        </div>

        {/* Renderizado del Modal de Ayuda */}
        <AyudaDescuentos
          isOpen={mostrarAyuda}
          onClose={() => setMostrarAyuda(false)}
        />
      </div>
    </div>
  );
};

export default CuposDescuentos;
