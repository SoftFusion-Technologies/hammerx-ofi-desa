import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { FaFacebookF, FaWhatsapp, FaInstagram } from "react-icons/fa";
import RedesSoft from "./RedesSoft";

/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Lista y gestiona bajas de Pilates con filtros y detalle.
 */

const HEADERS = [
  "NOMBRE Y APELLIDO",
  "TELÉFONO",
  "SEDE",
  "FECHA ALTA",
  "FECHA BAJA",
  "MESES ENTRENADOS",
  "ESTADO",
  "MOTIVO",
  "REMARKETING",
  "RECUPERADO",
  "USUARIO GESTIÓN",
];

const ELEMENTOS_POR_PAGINA = 30;

const BajasPilates = ({ sedeActual }) => {
  const [bajas, setBajas] = useState([]);
  const [contadorEstado, setContadorEstado] = useState({
    plan: 0,
    clase_de_prueba: 0,
    renovacion_programada: 0,
  });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [registroDetalle, setRegistroDetalle] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setCargando(true);
        setError("");
        const { data } = await axios.get(
          `http://localhost:8080/bajas-pilates/${sedeActual}`,
        );
        const bajasData = Array.isArray(data) ? data : data?.bajas;
        setBajas(Array.isArray(bajasData) ? bajasData : []);
        if (data?.contador_estado) {
          setContadorEstado({
            plan: data.contador_estado.plan || 0,
            clase_de_prueba: data.contador_estado.clase_de_prueba || 0,
            renovacion_programada:
              data.contador_estado.renovacion_programada || 0,
          });
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Error desconocido");
        }
      } finally {
        setCargando(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [sedeActual]);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, estadoFiltro]);

  const normalizarEstado = (estado) => (estado || "").toLowerCase();
  const formatearEstado = (estado) =>
    estado ? estado.toString().toUpperCase() : "-";

  const bajasFiltradas = useMemo(() => {
    let lista = bajas;
    const b = busqueda.toLowerCase();
    if (estadoFiltro !== "TODOS") {
      lista = lista.filter(
        (item) => normalizarEstado(item.estado) === estadoFiltro.toLowerCase(),
      );
    }
    if (!busqueda) return lista;
    return lista.filter(
      (item) =>
        (item.nombre_cliente || "").toLowerCase().includes(b) ||
        (item.telefono || "").toLowerCase().includes(b) ||
        (item.motivo || "").toLowerCase().includes(b),
    );
  }, [bajas, busqueda, estadoFiltro]);

  const contadorPorEstado = useMemo(() => {
    if (
      contadorEstado.plan ||
      contadorEstado.clase_de_prueba ||
      contadorEstado.renovacion_programada
    ) {
      return contadorEstado;
    }

    return bajas.reduce(
      (acc, item) => {
        const estado = normalizarEstado(item.estado);
        if (estado === "plan") acc.plan += 1;
        if (estado === "clase de prueba") acc.clase_de_prueba += 1;
        if (estado === "renovacion programada") acc.renovacion_programada += 1;
        return acc;
      },
      { plan: 0, clase_de_prueba: 0, renovacion_programada: 0 },
    );
  }, [bajas, contadorEstado]);

  const indiceFinal = paginaActual * ELEMENTOS_POR_PAGINA;
  const indiceInicial = indiceFinal - ELEMENTOS_POR_PAGINA;
  const elementosPaginados = bajasFiltradas.slice(indiceInicial, indiceFinal);
  const totalPaginas = Math.ceil(bajasFiltradas.length / ELEMENTOS_POR_PAGINA);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-2xl border border-orange-200 font-messina"
    >
      {/* Modal de Detalle */}
      {detalleAbierto && registroDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full border-4 border-orange-200 relative"
          >
            <button
              onClick={() => setDetalleAbierto(false)}
              className="absolute top-3 right-3 text-orange-700 hover:text-orange-900 text-2xl font-bold focus:outline-none"
              aria-label="Cerrar"
            >
              ×
            </button>
            <h3 className="text-2xl font-bold text-orange-900 mb-4 text-center">
              Detalle de la Baja
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Nombre y Apellido:
                </span>
                <span>{registroDetalle.nombre_cliente}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">Teléfono:</span>
                <span>
                  {registroDetalle.telefono || (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">Sede:</span>
                <span>
                  {registroDetalle.sede?.nombre || (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Fecha Alta:
                </span>
                <span>{registroDetalle.fecha_alta_original}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Fecha Baja:
                </span>
                <span>{registroDetalle.fecha_baja}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Meses Entrenados:
                </span>
                <span>{registroDetalle.meses_entrenados}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">Estado:</span>
                <span>{formatearEstado(registroDetalle.estado)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">Motivo:</span>
                <span>
                  {registroDetalle.motivo || (
                    <span className="text-gray-400 italic">Sin motivo</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Remarketing:
                </span>
                <span>
                  {registroDetalle.contactado_remarketing ? (
                    <span className="text-orange-700 font-semibold">Sí</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-orange-800">
                  Recuperado:
                </span>
                <span>
                  {registroDetalle.recuperado ? (
                    <span className="text-green-700 font-semibold">Sí</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-orange-800">
                  Usuario Gestión:
                </span>
                <span>
                  {registroDetalle.usuario_gestion?.name || (
                    <span className="text-gray-400 italic">-</span>
                  )}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Header y búsqueda */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-bold font-bignoodle text-orange-900 mb-2">
          Bajas de Pilates
        </h2>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-full sm:max-w-md md:max-w-lg lg:max-w-2xl"
        >
          <label className="block text-orange-900 text-sm font-bold mb-2 flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Buscar
          </label>
          <input
            type="text"
            placeholder="Nombre, teléfono o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full p-3 border-2 border-orange-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white"
          />
        </motion.div>
        <div className="mt-4 flex justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Todos", value: "TODOS" },
              { label: "Plan", value: "Plan" },
              { label: "Clase de prueba", value: "Clase de prueba" },
              {
                label: "Renovación programada",
                value: "Renovacion programada",
              },
            ].map((filtro) => (
              <button
                key={filtro.value}
                type="button"
                onClick={() => setEstadoFiltro(filtro.value)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${
                  estadoFiltro === filtro.value
                    ? "bg-orange-600 text-white border-orange-600"
                    : "bg-white text-orange-800 border-orange-200 hover:bg-orange-50"
                }`}
              >
                {filtro.label}
              </button>
            ))}
          </div>
          {/* FOOTER */}
          <RedesSoft />
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-orange-700 uppercase">
              Plan
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {contadorPorEstado.plan}
            </div>
          </div>
          <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-orange-700 uppercase">
              Clase de prueba
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {contadorPorEstado.clase_de_prueba}
            </div>
          </div>
          <div className="bg-white border border-orange-200 rounded-xl p-4 shadow-sm">
            <div className="text-xs font-semibold text-orange-700 uppercase">
              Renovación programada
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {contadorPorEstado.renovacion_programada}
            </div>
          </div>
        </div>
      </motion.div>

      {cargando && (
        <div className="mb-4 text-sm font-semibold text-orange-700">
          Cargando bajas...
        </div>
      )}

      {error && (
        <div className="mb-4 text-sm font-semibold text-red-600">
          Error: {error}
        </div>
      )}

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.2 }}
        className="overflow-hidden rounded-xl shadow-xl border border-orange-200"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-orange-900 to-orange-700">
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
                <motion.th
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.3 }}
                  className="p-4 font-semibold text-center text-white uppercase text-xs tracking-wider"
                >
                  Acciones
                </motion.th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {elementosPaginados.length > 0 ? (
                elementosPaginados.map((item, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    className={`transition-all duration-300 cursor-pointer hover:bg-orange-50`}
                  >
                    <td className="p-2 text-gray-800 font-semibold text-center text-sm">
                      {item.nombre_cliente}
                    </td>
                    <td className="p-2 text-gray-700 text-center text-sm">
                      {item.telefono || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-700 text-center text-sm">
                      {item.sede?.nombre || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-2 text-gray-500 text-center text-sm">
                      {item.fecha_alta_original}
                    </td>
                    <td className="p-2 text-gray-500 text-center text-sm">
                      {item.fecha_baja}
                    </td>
                    <td className="p-2 text-gray-700 text-center text-sm">
                      {item.meses_entrenados}
                    </td>
                    <td className="p-2 text-gray-700 text-center text-sm">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                        {formatearEstado(item.estado)}
                      </span>
                    </td>
                    <td className="p-2 text-gray-600 italic text-center max-w-xs truncate text-sm">
                      {item.motivo || (
                        <span className="text-gray-400 italic">Sin motivo</span>
                      )}
                    </td>
                    <td className="p-2 text-center text-sm">
                      {item.contactado_remarketing ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-100 text-orange-800">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center text-sm">
                      {item.recuperado ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-800">
                          Sí
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-400">
                          No
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-gray-600 italic text-center max-w-xs truncate text-sm">
                      {item.usuario_gestion?.name || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => {
                          setRegistroDetalle(item);
                          setDetalleAbierto(true);
                        }}
                        className="bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-1.5 px-3 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 text-xs"
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Ver Detalle
                        </span>
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
                  <td colSpan={HEADERS.length + 1} className="text-center p-12">
                    <div className="flex flex-col items-center gap-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-gray-500 italic text-lg">
                        {cargando
                          ? "Cargando..."
                          : bajasFiltradas.length === 0 && busqueda !== ""
                            ? "No se encontraron resultados para la búsqueda."
                            : "No hay bajas registradas."}
                      </p>
                    </div>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginación */}
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
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300"
        >
          ← Anterior
        </motion.button>

        <div className="bg-white px-6 py-3 rounded-xl shadow-md border-2 border-orange-200">
          <span className="text-orange-900 font-bold text-lg">
            Página {paginaActual} de {totalPaginas > 0 ? totalPaginas : 1}
          </span>
        </div>

        <motion.button
          onClick={() => setPaginaActual(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          whileHover={paginaActual < totalPaginas ? { scale: 1.05, x: 3 } : {}}
          whileTap={paginaActual < totalPaginas ? { scale: 0.95 } : {}}
          className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-300 transition-all duration-300"
        >
          Siguiente →
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default BajasPilates;
