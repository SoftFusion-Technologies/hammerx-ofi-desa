/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Centro de mensajería para administradores de RRHH. Permite gestionar y filtrar conversaciones con el personal por sede, nombre o estado de lectura. Facilita el seguimiento de aclaraciones enviadas por los empleados, destacando visualmente los mensajes no leídos y las notificaciones pendientes de resolución para asegurar una comunicación fluida.
*/

import React, { useState, useEffect, useMemo } from "react";
import { usarPromiseAll } from "../../hooks/usarPromiseAll";
import {
  FaComments,
  FaMapMarkerAlt,
  FaSearch,
  FaArrowLeft,
  FaRegEnvelope,
  FaEnvelopeOpenText,
  FaChevronRight,
} from "react-icons/fa";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../Utils/NormalizarSedes";
import ConversacionesDetalle from "./ConversacionesDetalle";

const ConversacionesHistorial = ({ volverAtras = null }) => {
  const [sedesDatos, setSedesDatos] = useState([]);
  const [conversacionesDatos, setConversacionesDatos] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [filtroNovedades, setFiltroNovedades] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [verDetalleConversacion, setVerDetalleConversacion] = useState(null);

  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");

  const {
    datos,
    cargando,
    error,
    ejecutar: obtenerConversaciones,
  } = usarPromiseAll([
    { endpoint: "rrhh-conversaciones" },
    { endpoint: "sedes" },
  ]);

  useEffect(() => {
    if (datos) {
      const [conversaciones, sedes] = datos;

      if (conversaciones) {
        setConversacionesDatos(conversaciones);
      }

      if (sedes) {
        const sedesFiltradas = sedes.filter(
          (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
        );
        setSedesDatos(sedesFiltradas);
      }
    }
  }, [datos]);

  const conversacionesVisibles = useMemo(() => {
    let filtrados = conversacionesDatos;

    if (sedeSeleccionada) {
      const sedeElegida = sedesDatos.find(
        (s) => s.id === parseInt(sedeSeleccionada),
      );
      if (sedeElegida) {
        filtrados = filtrados.filter(
          (conv) =>
            normalizarSedes_2(conv.sede?.nombre || "").toLowerCase() ===
            sedeElegida.nombre.toLowerCase(),
        );
      }
    }

    if (busqueda) {
      filtrados = filtrados.filter(
        (conv) =>
          conv.usuario?.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
          conv.usuario?.email?.toLowerCase().includes(busqueda.toLowerCase()),
      );
    }

    if (filtroNovedades === "pendientes") {
      filtrados = filtrados.filter((conv) => conv.tiene_no_leidos_rrhh === 1);
    } else if (filtroNovedades === "leidos") {
      filtrados = filtrados.filter((conv) => conv.tiene_no_leidos_rrhh === 0);
    }

    return filtrados.sort(
      (a, b) =>
        new Date(b.ultima_fecha_mensaje) - new Date(a.ultima_fecha_mensaje),
    );
  }, [
    sedeSeleccionada,
    conversacionesDatos,
    sedesDatos,
    busqueda,
    filtroNovedades,
  ]);

  if (verDetalleConversacion) {
    return (
      <ConversacionesDetalle
        conversacionId={verDetalleConversacion}
        volverAtras={() => {
          setVerDetalleConversacion(null);
          obtenerConversaciones();
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4 ">
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all duration-200 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Volver atrás
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaComments className="text-emerald-600" /> ACLARACIONES Y MENSAJES
          </h2>
          <p className="text-gray-500 text-sm">
            Gestión de comunicaciones directas con el personal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
          <div className="col-span-1 flex items-center gap-2 bg-white p-2 px-3 rounded-xl border border-gray-200 shadow-sm ">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="outline-none text-sm text-gray-700 bg-transparent w-40"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="col-span-1 flex gap-2">
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <select
                className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm font-bold"
                value={filtroNovedades}
                onChange={(e) => setFiltroNovedades(e.target.value)}
              >
                <option value="todos">TODOS</option>
                <option value="pendientes">NO LEÍDOS</option>
                <option value="leidos">LEÍDOS</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <FaMapMarkerAlt className="text-gray-400 ml-2" />
              <select
                className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm font-bold"
                value={sedeSeleccionada}
                onChange={(e) => setSedeSeleccionada(e.target.value)}
              >
                <option value="">TODAS LAS SEDES</option>
                {sedesDatos.map((sede) => (
                  <option key={sede.id} value={sede.id}>
                    {sede.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Vista Mobile */}
      <div className="md:hidden space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-500">
            CARGANDO CONVERSACIONES...
          </div>
        ) : conversacionesVisibles.length > 0 ? (
          conversacionesVisibles.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setVerDetalleConversacion(conv.id)}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm active:scale-95 transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-800">
                      {toUpperText(conv.usuario?.name)}
                    </p>
                    {conv.tiene_no_leidos_rrhh === 1 && (
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 italic truncate w-48">
                    {conv.ultimo_mensaje || "Sin mensajes"}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-semibold">
                  {toUpperText(
                    normalizarSedes(conv.usuario?.sede?.nombre || ""),
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
                <span className="text-[10px] text-gray-400">
                  {conv.ultima_fecha_mensaje
                    ? new Date(conv.ultima_fecha_mensaje).toLocaleDateString()
                    : ""}
                </span>
                <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                  ENTRAR <FaChevronRight />
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 italic">
            NO SE ENCONTRARON CONVERSACIONES
          </div>
        )}
      </div>

      {/* Vista Desktop */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Empleado</th>
              <th className="px-6 py-4 font-bold">Sede</th>
              <th className="px-6 py-4 font-bold">Última Novedad</th>
              <th className="px-6 py-4 font-bold">Estado</th>
              <th className="px-6 py-4 font-bold">Notificaciones</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cargando ? (
              <tr>
                <td colSpan="5" className="text-center py-10">
                  CARGANDO DATOS...
                </td>
              </tr>
            ) : conversacionesVisibles.length > 0 ? (
              conversacionesVisibles.map((conv) => (
                <tr
                  key={conv.id}
                  className="hover:bg-emerald-50/30 transition-colors cursor-pointer"
                  onClick={() => setVerDetalleConversacion(conv.id)}
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {toUpperText(conv.usuario?.name)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {toUpperText(conv.usuario?.email)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {toUpperText(normalizarSedes(conv.sede?.nombre || ""))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 truncate max-w-[200px]">
                      {conv.ultimo_mensaje || "---"}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {conv.ultima_fecha_mensaje
                        ? new Date(conv.ultima_fecha_mensaje).toLocaleString()
                        : ""}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {conv.tiene_no_leidos_rrhh === 1 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold animate-pulse">
                        <FaRegEnvelope /> NO LEÍDO
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-xs font-bold">
                        <FaEnvelopeOpenText /> LEÍDO
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 ${conv.notificaciones_sin_resolver > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-400'} rounded-full text-xs font-semibold`}>
                      {conv.notificaciones_sin_resolver > 0
                        ? `${conv.notificaciones_sin_resolver} PENDIENTES`
                        : "SIN NOVEDADES"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      className="bg-emerald-100 text-emerald-700 p-2 px-4 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      ABRIR MENSAJES
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  NO SE ENCONTRARON RESULTADOS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConversacionesHistorial;
