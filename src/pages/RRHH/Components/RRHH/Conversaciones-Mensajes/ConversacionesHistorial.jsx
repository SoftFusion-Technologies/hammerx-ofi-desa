/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Centro de mensajería para administradores de RRHH.
Adaptado visualmente a una bandeja tipo WhatsApp para WhatHammerX, priorizando
lectura rápida, poco scroll y buena experiencia mobile.
*/

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaComments,
  FaMapMarkerAlt,
  FaSearch,
  FaArrowLeft,
  FaChevronRight,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../../Utils/NormalizarSedes";
import { usarPromiseAll } from "../../../hooks/usarPromiseAll";
import ConversacionesDetalle from "./ConversacionesDetalle";

const LIMITE_INICIAL = 20;
const LIMITE_SIGUIENTE = 10;

const ConversacionesHistorial = ({ volverAtras = null }) => {
  const [sedesDatos, setSedesDatos] = useState([]);
  const [conversacionesDatos, setConversacionesDatos] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [filtroNovedades, setFiltroNovedades] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [verDetalleConversacion, setVerDetalleConversacion] = useState(null);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(false);

  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");

  const formatearFecha = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const { datos } = usarPromiseAll([{ endpoint: "sedes" }]);

  useEffect(() => {
    if (datos) {
      const [sedes] = datos;

      if (sedes) {
        const sedesFiltradas = sedes.filter(
          (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
        );
        setSedesDatos(sedesFiltradas);
      }
    }
  }, [datos]);

  const cargarConversaciones = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setCargandoLista(true);
      } else {
        setCargandoMas(true);
      }

      const offset = reset ? 0 : conversacionesDatos.length;
      const limit = reset ? LIMITE_INICIAL : LIMITE_SIGUIENTE;

      const respuesta = await axios.get(
        "http://localhost:8080/rrhh-conversaciones",
        {
          params: { limit, offset },
        },
      );

      const registros = respuesta?.data?.registros || [];
      const hayMasServidor = Boolean(respuesta?.data?.hay_mas);

      setConversacionesDatos((prev) => {
        if (reset) return registros;
        return [...prev, ...registros];
      });

      setHayMas(hayMasServidor);
    } catch (error) {
      console.error("Error cargando conversaciones:", error);
    } finally {
      setCargandoLista(false);
      setCargandoMas(false);
    }
  };

  useEffect(() => {
    cargarConversaciones({ reset: true });
  }, []);

  const conversacionesVisibles = useMemo(() => {
    let filtrados = Array.isArray(conversacionesDatos)
      ? [...conversacionesDatos]
      : [];

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

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      filtrados = filtrados.filter(
        (conv) =>
          conv.usuario?.name?.toLowerCase().includes(texto) ||
          conv.usuario?.email?.toLowerCase().includes(texto) ||
          conv.ultimo_mensaje?.toLowerCase().includes(texto),
      );
    }

    if (filtroNovedades === "pendientes") {
      filtrados = filtrados.filter(
        (conv) => Number(conv.tiene_no_leidos_rrhh) === 1,
      );
    } else if (filtroNovedades === "leidos") {
      filtrados = filtrados.filter(
        (conv) => Number(conv.tiene_no_leidos_rrhh) === 0,
      );
    } else if (filtroNovedades === "abiertas") {
      filtrados = filtrados.filter((conv) => conv.estado === "abierta");
    } else if (filtroNovedades === "cerradas") {
      filtrados = filtrados.filter((conv) => conv.estado === "cerrada");
    }

    return filtrados.sort(
      (a, b) =>
        new Date(b.ultima_fecha_mensaje || 0) -
        new Date(a.ultima_fecha_mensaje || 0),
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
          cargarConversaciones({ reset: true });
        }}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3">
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Volver atrás
        </button>
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaComments className="text-emerald-600" />
            WhatsHammerX
          </h2>
          <p className="text-gray-500 text-sm">
            Chat interno entre empleados y RRHH
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm">
            <FaSearch className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar empleado o mensaje..."
              className="outline-none text-sm text-gray-700 bg-transparent w-full min-w-0"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm min-w-0">
            <select
              className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm font-semibold w-full min-w-0"
              value={filtroNovedades}
              onChange={(e) => setFiltroNovedades(e.target.value)}
            >
              <option value="todos">TODOS</option>
              <option value="pendientes">NO LEÍDOS</option>
              <option value="leidos">LEÍDOS</option>
              <option value="abiertas">ABIERTAS</option>
              <option value="cerradas">CERRADAS</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-gray-200 shadow-sm min-w-0">
            <FaMapMarkerAlt className="text-gray-400 shrink-0" />
            <select
              className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm font-semibold w-full min-w-0"
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

      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {cargandoLista ? (
          <div className="p-6 text-center text-sm text-gray-500">
            CARGANDO CONVERSACIONES...
          </div>
        ) : conversacionesVisibles.length > 0 ? (
          <>
            <div className="divide-y divide-gray-100">
              {conversacionesVisibles.map((conv) => {
                const tieneNoLeidos = Number(conv.tiene_no_leidos_rrhh) === 1;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setVerDetalleConversacion(conv.id)}
                    className="w-full text-left px-2 md:px-4 py-2 md:py-3 hover:bg-emerald-50/40 transition-colors"
                  >
                    <div className="flex items-start gap-2 md:gap-3">
                      <div className="h-9 w-9 md:h-11 md:w-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                        {String(conv.usuario?.name || "?")
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* CABECERA MOBILE/DESKTOP */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            <p className="text-sm md:text-[15px] font-bold text-gray-800 truncate max-w-[calc(100%-18px)]">
                              {toUpperText(conv.usuario?.name)}
                            </p>

                            {tieneNoLeidos && (
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0"></span>
                            )}
                          </div>

                          {/* TAGS */}
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className="max-w-full text-[10px] md:text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold leading-none break-words">
                              {toUpperText(
                                normalizarSedes(conv.sede?.nombre || ""),
                              )}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 max-w-full text-[10px] md:text-[11px] px-2 py-1 rounded-full font-semibold leading-none ${
                                conv.estado === "abierta"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {conv.estado === "abierta" ? (
                                <FaLockOpen className="shrink-0" />
                              ) : (
                                <FaLock className="shrink-0" />
                              )}
                              <span className="truncate">
                                {toUpperText(conv.estado)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* ULTIMO MENSAJE + FECHA */}
                        <div className="mt-1.5 md:mt-2 flex items-end justify-between gap-2 md:gap-3 min-w-0">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs md:text-sm text-gray-500 truncate">
                              {conv.ultimo_mensaje || "Sin mensajes todavía"}
                            </p>
                          </div>

                          <span className="text-emerald-600 shrink-0 hidden md:inline-flex">
                            <FaChevronRight />
                          </span>
                        </div>

                        {/* FECHA ABAJO EN MOBILE */}
                        <div className="mt-1 flex items-center justify-between md:justify-end gap-2">
                          <p className="text-[10px] md:text-xs text-gray-400 truncate">
                            {formatearFecha(conv.ultima_fecha_mensaje)}
                          </p>

                          <span className="text-emerald-600 shrink-0 md:hidden">
                            <FaChevronRight />
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {hayMas && (
              <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-center">
                <button
                  onClick={() => cargarConversaciones({ reset: false })}
                  disabled={cargandoMas}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-semibold hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-60"
                >
                  {cargandoMas ? "Cargando..." : "Mostrar más"}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-6 text-center text-sm text-gray-400 italic">
            NO SE ENCONTRARON CONVERSACIONES
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversacionesHistorial;
