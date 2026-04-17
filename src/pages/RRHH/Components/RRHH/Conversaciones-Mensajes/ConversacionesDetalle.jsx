/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Vista detallada de la conversación en formato chat tipo WhatHammerX.
Permite visualizar el historial, responder, cerrar o reabrir el asunto.
Permite además editar y eliminar mensajes propios.
Incluye actualización silenciosa y carga incremental del chat.
*/

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaLock,
  FaLockOpen,
  FaEllipsisV,
  FaPen,
  FaTrash,
  FaTimes,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaRegClock,
} from "react-icons/fa";
import { useAuth } from "../../../../../AuthContext";
import { useSedeUsers } from "../../../Context/SedeUsersContext";
import { normalizarSedes } from "../../../Utils/NormalizarSedes";

const HORAS_MAXIMAS_EDICION = 5;
const LIMITE_INICIAL = 20;
const LIMITE_ANTERIORES = 10;
const INTERVALO_ACTUALIZACION = 4000;

const ConversacionesDetalle = ({ conversacionId, volverAtras }) => {
  const consultaDeAdmin = !!conversacionId;
  const { sedeSeleccionada } = useSedeUsers();
  const { userId } = useAuth();

  const [conversacion, setConversacion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoAnteriores, setCargandoAnteriores] = useState(false);
  const [hayAnteriores, setHayAnteriores] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensajeNuevo, setMensajeNuevo] = useState("");
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  const [menuAbiertoId, setMenuAbiertoId] = useState(null);
  const [editandoId, setEditandoId] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState("");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [eliminandoId, setEliminandoId] = useState(null);
  const [marcacionesAbiertas, setMarcacionesAbiertas] = useState({});

  const contenedorMensajesRef = useRef(null);
  const ultimaConsultaRef = useRef(null);
  const forzarScrollAbajoRef = useRef(false);

  const formatearHora = (fecha) => {
    if (!fecha) return "";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearFechaReferencia = (fecha) => {
    if (!fecha) return "";
    const date = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) return fecha;
    return date.toLocaleDateString("es-AR");
  };

  const formatearFechaMarcacion = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(date.getTime())) return fecha;
    return date.toLocaleDateString("es-AR");
  };

  const formatearFechaHoraMarcacion = (fecha) => {
    if (!fecha) return "-";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearEstado = (texto) => {
    if (!texto) return "-";
    return String(texto).replaceAll("_", " ").toUpperCase();
  };

  const obtenerLabelTipoMensaje = (tipo) => {
    switch (tipo) {
      case "aclaracion":
        return "ACLARACIÓN GENERAL";
      case "olvido_ingreso":
        return "OLVIDO DE ENTRADA";
      case "olvido_salida":
        return "OLVIDO DE SALIDA";
      case "hora_extra":
        return "SOLICITUD HORA EXTRA";
      case "inconveniente_acceso":
        return "PROBLEMA DE ACCESO";
      case "consulta":
        return "CONSULTA PERSONAL";
      default:
        return "";
    }
  };

  const mostrarContextoConsulta = (msg) => {
    if (!msg) return false;

    const tiposConContexto = [
      "aclaracion",
      "olvido_ingreso",
      "olvido_salida",
      "hora_extra",
      "inconveniente_acceso",
      "consulta",
    ];

    return (
      tiposConContexto.includes(msg.tipo_mensaje) && !!msg.fecha_referencia
    );
  };

  const esMensajeMio = (msg) => Number(msg?.emisor_user_id) === Number(userId);

  const estaCercaDelFinal = () => {
    const el = contenedorMensajesRef.current;
    if (!el) return true;
    const distancia = el.scrollHeight - el.scrollTop - el.clientHeight;
    return distancia < 80;
  };

  const scrollAbajo = () => {
    const el = contenedorMensajesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const puedeEditarMensaje = (msg) => {
    if (!msg) return false;
    if (!esMensajeMio(msg)) return false;
    if (msg.tipo_mensaje === "sistema") return false;
    if (Number(msg.mensaje_eliminado) === 1) return false;

    const creado = new Date(msg.created_at);
    const ahora = new Date();
    const horasTranscurridas =
      (ahora.getTime() - creado.getTime()) / (1000 * 60 * 60);

    return horasTranscurridas <= HORAS_MAXIMAS_EDICION;
  };

  const puedeEliminarMensaje = (msg) => {
    if (!msg) return false;
    if (!esMensajeMio(msg)) return false;
    if (msg.tipo_mensaje === "sistema") return false;
    if (Number(msg.mensaje_eliminado) === 1) return false;
    return true;
  };

  const cargarCabecera = async () => {
    if (consultaDeAdmin) {
      const resConv = await axios.get(
        `http://localhost:8080/rrhh-conversaciones/${conversacionId}`,
      );

      setConversacion(resConv.data);

      if (Number(resConv.data?.tiene_no_leidos_rrhh) === 1) {
        await axios.put(
          `http://localhost:8080/rrhh-conversaciones/${conversacionId}`,
          {
            tiene_no_leidos_rrhh: 0,
          },
        );

        setConversacion((prev) =>
          prev ? { ...prev, tiene_no_leidos_rrhh: 0 } : prev,
        );
      }

      return resConv.data;
    }

    const resMsgs = await axios.get(
      `http://localhost:8080/rrhh-mensajes/por-usuario-sede?usuario_id=${userId}&sede_id=${sedeSeleccionada?.id}`,
    );

    const conversacionUsuario = resMsgs?.data?.[0] || null;
    setConversacion(conversacionUsuario);

    if (
      conversacionUsuario?.id &&
      Number(conversacionUsuario?.tiene_no_leidos_usuario) === 1
    ) {
      await axios.put(
        `http://localhost:8080/rrhh-conversaciones/${conversacionUsuario.id}`,
        {
          tiene_no_leidos_usuario: 0,
        },
      );

      setConversacion((prev) =>
        prev ? { ...prev, tiene_no_leidos_usuario: 0 } : prev,
      );
    }

    return conversacionUsuario;
  };

  const cargarMensajesIniciales = async (idConversacion) => {
    const respuesta = await axios.get("http://localhost:8080/rrhh-mensajes", {
      params: {
        conversacion_id: idConversacion,
        limit: LIMITE_INICIAL,
      },
    });

    const registros = respuesta?.data?.registros || [];
    setMensajes(registros);
    setHayAnteriores(Boolean(respuesta?.data?.hay_mas));

    if (registros.length > 0) {
      ultimaConsultaRef.current = registros[registros.length - 1].id;
    } else {
      ultimaConsultaRef.current = null;
    }

    setTimeout(() => scrollAbajo(), 0);
  };

  const cargarDatosIniciales = async () => {
    try {
      setCargando(true);

      const conv = await cargarCabecera();
      if (!conv?.id) {
        setMensajes([]);
        setHayAnteriores(false);
        return;
      }

      await cargarMensajesIniciales(conv.id);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, [conversacionId, userId, sedeSeleccionada?.id]);

  useEffect(() => {
    if (forzarScrollAbajoRef.current) {
      setTimeout(() => {
        scrollAbajo();
        forzarScrollAbajoRef.current = false;
      }, 0);
    }
  }, [mensajes]);

  const cargarMensajesAnteriores = async () => {
    if (!conversacion?.id || mensajes.length === 0 || cargandoAnteriores)
      return;

    try {
      setCargandoAnteriores(true);

      const primerId = mensajes[0]?.id;
      const el = contenedorMensajesRef.current;
      const alturaAnterior = el?.scrollHeight || 0;

      const respuesta = await axios.get("http://localhost:8080/rrhh-mensajes", {
        params: {
          conversacion_id: conversacion.id,
          limit: LIMITE_ANTERIORES,
          before_id: primerId,
        },
      });

      const registros = respuesta?.data?.registros || [];

      if (registros.length > 0) {
        setMensajes((prev) => [...registros, ...prev]);

        setTimeout(() => {
          const nuevoAlto = el?.scrollHeight || 0;
          if (el) {
            el.scrollTop = nuevoAlto - alturaAnterior;
          }
        }, 0);
      }

      setHayAnteriores(Boolean(respuesta?.data?.hay_mas));
    } catch (error) {
      console.error("Error cargando mensajes anteriores:", error);
    } finally {
      setCargandoAnteriores(false);
    }
  };

  const consultarMensajesNuevos = async () => {
    try {
      if (!conversacion?.id) return;
      if (document.hidden) return;
      if (editandoId || enviando || guardandoEdicion || eliminandoId) return;

      const ultimoId = mensajes[mensajes.length - 1]?.id;
      if (!ultimoId) return;

      const estabaAbajo = estaCercaDelFinal();

      const [resConv, resNuevos] = await Promise.all([
        axios.get(
          `http://localhost:8080/rrhh-conversaciones/${conversacion.id}`,
        ),
        axios.get("http://localhost:8080/rrhh-mensajes", {
          params: {
            conversacion_id: conversacion.id,
            after_id: ultimoId,
          },
        }),
      ]);

      const nuevos = resNuevos?.data?.registros || [];
      setConversacion(resConv.data);

      if (nuevos.length > 0) {
        setMensajes((prev) => [...prev, ...nuevos]);
        ultimaConsultaRef.current = nuevos[nuevos.length - 1].id;

        if (estabaAbajo) {
          forzarScrollAbajoRef.current = true;
        }
      }
    } catch (error) {
      console.error("Error consultando mensajes nuevos:", error);
    }
  };

  useEffect(() => {
    if (!conversacion?.id) return;

    const interval = setInterval(() => {
      consultarMensajesNuevos();
    }, INTERVALO_ACTUALIZACION);

    return () => clearInterval(interval);
  }, [
    conversacion?.id,
    mensajes,
    editandoId,
    enviando,
    guardandoEdicion,
    eliminandoId,
  ]);

  const enviarMensaje = async () => {
    const texto = String(mensajeNuevo || "").trim();
    if (!texto || enviando) return;

    try {
      setEnviando(true);
      forzarScrollAbajoRef.current = true;

      const payload = {
        usuario_id: Number(conversacion?.usuario_id || userId),
        sede_id: Number(conversacion?.sede_id || sedeSeleccionada?.id),
        emisor_user_id: Number(userId),
        destinatario_tipo: consultaDeAdmin ? "usuario" : "rrhh",
        tipo_mensaje: consultaDeAdmin ? "respuesta_rrhh" : "consulta",
        mensaje: texto,
      };

      await axios.post("http://localhost:8080/rrhh-mensajes", payload);

      setMensajeNuevo("");
      await consultarMensajesNuevos();
      await cargarCabecera();
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      alert(
        error?.response?.data?.mensajeError ||
          "No se pudo enviar el mensaje. Intenta nuevamente.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const cambiarEstadoConversacion = async (nuevoEstado) => {
    if (!conversacion?.id) return;

    try {
      setActualizandoEstado(true);

      await axios.put(
        `http://localhost:8080/rrhh-conversaciones/${conversacion.id}`,
        {
          estado: nuevoEstado,
          cerrado_por: nuevoEstado === "cerrada" ? Number(userId) : null,
          cerrado_at:
            nuevoEstado === "cerrada" ? new Date().toISOString() : null,
        },
      );

      await cargarCabecera();
      await consultarMensajesNuevos();
    } catch (error) {
      console.error("Error al cambiar estado de la conversación:", error);
      alert("No se pudo actualizar el estado de la conversación.");
    } finally {
      setActualizandoEstado(false);
    }
  };

  const iniciarEdicion = (msg) => {
    setMenuAbiertoId(null);
    setEditandoId(msg.id);
    setTextoEdicion(msg.mensaje || "");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEdicion("");
  };

  const guardarEdicion = async (msg) => {
    const texto = String(textoEdicion || "").trim();
    if (!texto) return;

    try {
      setGuardandoEdicion(true);

      const respuesta = await axios.put(
        `http://localhost:8080/rrhh-mensajes/${msg.id}`,
        {
          emisor_user_id: Number(userId),
          mensaje: texto,
        },
      );

      const actualizado = respuesta?.data?.registroActualizado;

      setMensajes((prev) =>
        prev.map((item) =>
          item.id === msg.id ? { ...item, ...actualizado } : item,
        ),
      );

      cancelarEdicion();
      await cargarCabecera();
    } catch (error) {
      console.error("Error al editar mensaje:", error);
      alert(
        error?.response?.data?.mensajeError || "No se pudo editar el mensaje.",
      );
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const eliminarMensaje = async (msg) => {
    try {
      setEliminandoId(msg.id);
      setMenuAbiertoId(null);

      const respuesta = await axios.delete(
        `http://localhost:8080/rrhh-mensajes/${msg.id}`,
        {
          data: {
            emisor_user_id: Number(userId),
          },
        },
      );

      const actualizado = respuesta?.data?.registroActualizado;

      if (actualizado) {
        setMensajes((prev) =>
          prev.map((item) =>
            item.id === msg.id ? { ...item, ...actualizado } : item,
          ),
        );
      }

      await cargarCabecera();
    } catch (error) {
      console.error("Error al eliminar mensaje:", error);
      alert(
        error?.response?.data?.mensajeError ||
          "No se pudo eliminar el mensaje.",
      );
    } finally {
      setEliminandoId(null);
    }
  };

  if (cargando) {
    return (
      <div className="p-8 text-center font-bignoodle text-2xl">
        CARGANDO WHATHAMMERX...
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mx-auto">
      <div className="mb-3">
        {volverAtras && (
          <button
            onClick={volverAtras}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-3 md:px-5 py-3 border-b border-gray-100 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm md:text-base font-bold text-gray-800 truncate">
                {normalizarSedes(conversacion?.usuario?.name || "Conversación")}
              </h2>

              <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] md:text-xs text-gray-500">
                <span>{conversacion?.sede?.nombre || "Sin sede"}</span>
                <span className="text-gray-300">•</span>
                <span
                  className={
                    conversacion?.estado === "abierta"
                      ? "text-emerald-600 font-semibold"
                      : "text-red-500 font-semibold"
                  }
                >
                  {String(conversacion?.estado || "").toUpperCase()}
                </span>
              </div>
            </div>

            {consultaDeAdmin && conversacion?.id && (
              <button
                onClick={() =>
                  cambiarEstadoConversacion(
                    conversacion.estado === "abierta" ? "cerrada" : "abierta",
                  )
                }
                disabled={actualizandoEstado}
                className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  conversacion.estado === "abierta"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                {conversacion.estado === "abierta" ? (
                  <FaLock />
                ) : (
                  <FaLockOpen />
                )}
                {actualizandoEstado
                  ? "Actualizando..."
                  : conversacion.estado === "abierta"
                    ? "Cerrar asunto"
                    : "Reabrir"}
              </button>
            )}
          </div>
        </div>

        <div
          ref={contenedorMensajesRef}
          className="h-[58vh] md:h-[62vh] overflow-y-auto px-2 md:px-4 py-3 bg-gray-50"
          onClick={() => setMenuAbiertoId(null)}
        >
          {hayAnteriores && (
            <div className="flex justify-center mb-3">
              <button
                onClick={cargarMensajesAnteriores}
                disabled={cargandoAnteriores}
                className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-60"
              >
                {cargandoAnteriores ? "Cargando..." : "Mostrar anteriores"}
              </button>
            </div>
          )}

          {mensajes.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center text-sm text-gray-400 italic px-4">
              No hay mensajes todavía.
            </div>
          ) : (
            <div className="space-y-2">
              {mensajes.map((msg) => {
                const mio = esMensajeMio(msg);
                const esSistema = msg.tipo_mensaje === "sistema";
                const eliminado = Number(msg.mensaje_eliminado) === 1;
                const editado = Number(msg.editado) === 1;
                const tieneMarcacion = !!msg?.marcacion;
                const marcacionAbierta = !!marcacionesAbiertas[msg.id];

                if (esSistema) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="px-3 py-1.5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-medium text-center max-w-[95%]">
                        {msg.mensaje}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${mio ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[88%] md:max-w-[72%] rounded-2xl px-3 py-2 shadow-sm border text-sm ${
                        eliminado
                          ? "bg-gray-100 text-gray-400 border-gray-200 italic"
                          : mio
                            ? "bg-emerald-500 text-white border-emerald-500 rounded-br-md"
                            : "bg-white text-gray-800 border-gray-200 rounded-bl-md"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div className="flex flex-col gap-0.5">
                          {editado && !eliminado && (
                            <span
                              className={`text-[10px] font-bold ${
                                mio ? "text-emerald-50/90" : "text-amber-600"
                              }`}
                            >
                              Editado
                            </span>
                          )}

                          <span
                            className={`text-[10px] font-bold uppercase ${
                              eliminado
                                ? "text-gray-400"
                                : mio
                                  ? "text-emerald-50/90"
                                  : "text-gray-400"
                            }`}
                          >
                            {mio ? "Vos" : msg?.emisor_nombre || "RRHH"}
                          </span>
                        </div>

                        <div className="flex items-start gap-2">
                          <span
                            className={`text-[10px] ${
                              eliminado
                                ? "text-gray-400"
                                : mio
                                  ? "text-emerald-50/90"
                                  : "text-gray-400"
                            }`}
                          >
                            {formatearHora(msg.created_at)}
                          </span>

                          {(puedeEditarMensaje(msg) ||
                            puedeEliminarMensaje(msg)) && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() =>
                                  setMenuAbiertoId((prev) =>
                                    prev === msg.id ? null : msg.id,
                                  )
                                }
                                className={`p-1 rounded-md ${
                                  mio
                                    ? "hover:bg-white/10 text-white"
                                    : "hover:bg-gray-100 text-gray-500"
                                }`}
                              >
                                <FaEllipsisV className="text-[11px]" />
                              </button>

                              {menuAbiertoId === msg.id && (
                                <div className="absolute right-0 top-7 z-20 min-w-[135px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                  {puedeEditarMensaje(msg) && (
                                    <button
                                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      onClick={() => iniciarEdicion(msg)}
                                    >
                                      <FaPen className="text-[12px]" />
                                      Editar
                                    </button>
                                  )}

                                  {puedeEliminarMensaje(msg) && (
                                    <button
                                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      onClick={() => eliminarMensaje(msg)}
                                      disabled={eliminandoId === msg.id}
                                    >
                                      <FaTrash className="text-[12px]" />
                                      {eliminandoId === msg.id
                                        ? "Eliminando..."
                                        : "Eliminar"}
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {editandoId === msg.id ? (
                        <div className="mt-1">
                          <textarea
                            rows={3}
                            className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-emerald-500"
                            value={textoEdicion}
                            onChange={(e) => setTextoEdicion(e.target.value)}
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={cancelarEdicion}
                              className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-bold hover:bg-gray-200"
                            >
                              <FaTimes />
                            </button>
                            <button
                              onClick={() => guardarEdicion(msg)}
                              disabled={
                                guardandoEdicion ||
                                !String(textoEdicion || "").trim()
                              }
                              className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <FaCheck />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!eliminado && mostrarContextoConsulta(msg) && (
                            <div className="flex flex-wrap items-center gap-1.5 mb-2">
                              {!!obtenerLabelTipoMensaje(msg.tipo_mensaje) && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    mio
                                      ? "bg-white/15 text-white"
                                      : "bg-emerald-100 text-emerald-700"
                                  }`}
                                >
                                  {obtenerLabelTipoMensaje(msg.tipo_mensaje)}
                                </span>
                              )}

                              {!!msg.fecha_referencia && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                    mio
                                      ? "bg-white/10 text-emerald-50/90"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  Suceso:{" "}
                                  {formatearFechaReferencia(
                                    msg.fecha_referencia,
                                  )}
                                </span>
                              )}
                            </div>
                          )}

                          <p className="leading-5 whitespace-pre-wrap break-words">
                            {eliminado ? "Mensaje eliminado" : msg.mensaje}
                          </p>

                          {!eliminado && tieneMarcacion && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setMarcacionesAbiertas((prev) => ({
                                    ...prev,
                                    [msg.id]: !prev[msg.id],
                                  }))
                                }
                                className={`inline-flex w-full justify-center items-center gap-2 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold border transition-all ${
                                  mio
                                    ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                                    : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                                }`}
                              >
                                <FaRegClock className="shrink-0" />
                                Ver info marcación
                                {marcacionAbierta ? (
                                  <FaChevronUp className="shrink-0" />
                                ) : (
                                  <FaChevronDown className="shrink-0" />
                                )}
                              </button>

                              {marcacionAbierta && (
                                <div
                                  className={`mt-2 rounded-2xl border p-3 text-[11px] ${
                                    mio
                                      ? "border-white/15 bg-white/10 text-white"
                                      : "border-orange-100 bg-orange-50/60 text-gray-700"
                                  }`}
                                >
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                      <span
                                        className={`font-bold ${mio ? "text-emerald-50/90" : "text-gray-500"}`}
                                      >
                                        Fecha:
                                      </span>{" "}
                                      {formatearFechaMarcacion(
                                        msg.marcacion.fecha,
                                      )}
                                    </div>

                                    <div>
                                      <span
                                        className={`font-bold ${mio ? "text-emerald-50/90" : "text-gray-500"}`}
                                      >
                                        Aprobación:
                                      </span>{" "}
                                      {formatearEstado(
                                        msg.marcacion.estado_aprobacion,
                                      )}
                                    </div>

                                    <div>
                                      <span
                                        className={`font-bold ${mio ? "text-emerald-50/90" : "text-gray-500"}`}
                                      >
                                        Entrada:
                                      </span>{" "}
                                      {formatearFechaHoraMarcacion(
                                        msg.marcacion.hora_entrada,
                                      )}
                                    </div>

                                    <div>
                                      <span
                                        className={`font-bold ${mio ? "text-emerald-50/90" : "text-gray-500"}`}
                                      >
                                        Salida:
                                      </span>{" "}
                                      {formatearFechaHoraMarcacion(
                                        msg.marcacion.hora_salida,
                                      )}
                                    </div>
                                  </div>
                                  {!!msg.marcacion.comentarios && (
                                    <div
                                      className={`mt-2 pt-2 border-t ${
                                        mio
                                          ? "border-white/10"
                                          : "border-orange-100"
                                      }`}
                                    >
                                      <span
                                        className={`font-bold ${mio ? "text-emerald-50/90" : "text-gray-500"}`}
                                      >
                                        Comentarios:
                                      </span>{" "}
                                      {msg.marcacion.comentarios}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 bg-white p-2 md:p-3">
          <div className="flex items-end gap-2">
            <textarea
              rows={1}
              placeholder={
                consultaDeAdmin
                  ? "Escribí una respuesta..."
                  : "Escribí tu mensaje a RRHH..."
              }
              className="flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm outline-none focus:border-emerald-500 min-h-[48px] max-h-32"
              value={mensajeNuevo}
              onChange={(e) => setMensajeNuevo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarMensaje();
                }
              }}
            />
            <button
              onClick={enviarMensaje}
              disabled={enviando || !String(mensajeNuevo || "").trim()}
              className="h-12 min-w-12 px-4 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-700 disabled:opacity-60"
            >
              <FaPaperPlane />
            </button>
          </div>

          {conversacion?.estado === "cerrada" && (
            <p className="text-[11px] text-gray-400 mt-2 px-1">
              Si se envía un nuevo mensaje, el asunto se reabrirá
              automáticamente.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversacionesDetalle;
