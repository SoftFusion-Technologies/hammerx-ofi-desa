/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Vista detallada de la conversación y aclaraciones de un empleado. Permite visualizar el historial de mensajes, fechas de referencia y estados de resolución. Incluye una lógica dual: los administradores pueden marcar mensajes como resueltos o reabrirlos, mientras que los empleados pueden consultar el estado de sus solicitudes en tiempo real.
*/

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaUserCircle,
  FaCheckCircle,
  FaRegClock,
} from "react-icons/fa";
import { useAuth } from "../../../../AuthContext";
import { useSedeUsers } from "../../Context/SedeUsersContext";
import { normalizarSedes } from "../../Utils/NormalizarSedes";

const ConversacionesDetalle = ({ conversacionId, volverAtras }) => {
  const consultaDeAdmin = !!conversacionId;
  const { sedeSeleccionada } = useSedeUsers();
  const { userId, userName, name } = useAuth();
  const [conversacion, setConversacion] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [resolviendoId, setResolviendoId] = useState(null);

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "Sin fecha";
    const date = new Date(fecha);
    if (Number.isNaN(date.getTime())) return "Sin fecha";
    return date.toLocaleString("es-AR");
  };

  const formatearTipo = (tipo) => {
    if (!tipo) return "-";
    return tipo.replace(/_/g, " ").toUpperCase();
  };

  const obtenerResueltoPor = (msg) => {
    return (
      msg?.resuelto_por_nombre ||
      msg?.resuelto_por_name ||
      msg?.resuelto_por_usuario?.name ||
      msg?.resuelto_por ||
      "RRHH"
    );
  };

  const actualizarResolucion = async (mensajeId, resolver) => {
    const fechaResolucion = new Date().toISOString();
    const payload = resolver
      ? {
          resuelto: 1,
          resuelto_por: userId ? Number(userId) : null,
          resuelto_at: fechaResolucion,
        }
      : {
          resuelto: 0,
          resuelto_por: null,
          resuelto_at: null,
        };

    try {
      setResolviendoId(mensajeId);

      let respuesta = null;
      try {
        respuesta = await axios.patch(
          `http://localhost:8080/rrhh-mensajes/${mensajeId}`,
          payload,
        );
      } catch {
        respuesta = await axios.put(
          `http://localhost:8080/rrhh-mensajes/${mensajeId}`,
          payload,
        );
      }

      const dataActualizada = respuesta?.data || {};
      setMensajes((prev) =>
        prev.map((msg) =>
          msg.id === mensajeId
            ? {
                ...msg,
                ...dataActualizada,
                resuelto: resolver ? 1 : 0,
                resuelto_at: resolver
                  ? dataActualizada.resuelto_at || fechaResolucion
                  : null,
                resuelto_por: resolver
                  ? dataActualizada.resuelto_por ||
                    (userId ? Number(userId) : msg.resuelto_por)
                  : null,
                resuelto_por_nombre: resolver
                  ? dataActualizada.resuelto_por_nombre ||
                    dataActualizada.resuelto_por_name ||
                    name ||
                    userName ||
                    msg.resuelto_por_nombre
                  : null,
              }
            : msg,
        ),
      );
    } catch (error) {
      console.error("Error al actualizar resolucion:", error);
      alert(
        resolver
          ? "No se pudo marcar como resuelto. Intenta nuevamente."
          : "No se pudo reabrir el mensaje. Intenta nuevamente.",
      );
    } finally {
      setResolviendoId(null);
    }
  };

  const marcarResuelto = async (mensajeId) => {
    await actualizarResolucion(mensajeId, true);
  };

  const reabrirMensaje = async (mensajeId) => {
    await actualizarResolucion(mensajeId, false);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        let resConv = null;
        let resMsgs = null;

        if (consultaDeAdmin) {
          // ADMIN
          [resConv, resMsgs] = await Promise.all([
            axios.get(
              `http://localhost:8080/rrhh-conversaciones/${conversacionId}`,
            ),
            axios.get(
              `http://localhost:8080/rrhh-mensajes?conversacion_id=${conversacionId}`,
            ),
          ]);

          setConversacion(resConv.data);
          setMensajes(resMsgs.data);

          if (resConv.data.tiene_no_leidos_rrhh === 1) {
            await axios.put(
              `http://localhost:8080/rrhh-conversaciones/${conversacionId}`,
              {
                tiene_no_leidos_rrhh: 0,
              },
            );
          }
        } else {
          // USUARIO NORMAL
          resMsgs = await axios.get(
            `http://localhost:8080/rrhh-mensajes/por-usuario-sede?usuario_id=${userId}&sede_id=${sedeSeleccionada?.id}`,
          );
          setMensajes(resMsgs.data[0].mensajes || []);
          setConversacion(resMsgs.data[0]);
        }

      } catch (error) {
        console.error("Error cargando detalle:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [conversacionId]);

  if (cargando) {
    return (
      <div className="p-10 text-center font-bignoodle text-2xl">
        CARGANDO ACLARACIONES...
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up mx-auto">
      <div className="mb-4">
        {volverAtras && (
          <button
            onClick={volverAtras}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Volver al historial
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 text-4xl">
          <FaUserCircle />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-gray-800">
            {normalizarSedes(conversacion?.usuario?.name)}
          </h2>
          <p className="text-gray-500">{conversacion?.usuario?.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase">
              SEDE: {conversacion?.sede?.nombre || "-"}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${conversacion?.estado === "abierta" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
            >
              ESTADO: {conversacion?.estado || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        {mensajes.length === 0 ? (
          <div className="p-10 text-center text-gray-400 italic">
            No hay historial de aclaraciones registrado aun.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-600 uppercase text-xs tracking-wide">
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Mensaje</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  {consultaDeAdmin && (
                    <th className="px-4 py-3 text-left">Accion</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {mensajes.map((msg) => {
                  const estaResuelto = Number(msg.resuelto) === 1;
                  return (
                    <tr
                      key={msg.id}
                      className="border-b border-gray-100 align-top text-left"
                    >
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatearFechaHora(msg.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-semibold whitespace-nowrap">
                        {formatearTipo(msg.tipo_mensaje)}
                      </td>
                      <td className="px-4 py-3 text-gray-800 min-w-[320px]">
                        <p className="leading-relaxed">{msg.mensaje}</p>
                        {msg.fecha_referencia && (
                          <p className="text-xs text-gray-500 mt-1">
                            Fecha referencia: {msg.fecha_referencia}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {estaResuelto ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <FaCheckCircle /> Resuelto
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Por {obtenerResueltoPor(msg)} el{" "} 
                              <br></br> 
                              {formatearFechaHora(msg.resuelto_at)}
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                            <FaRegClock /> Pendiente a resolver
                          </span>
                        )}
                      </td>
                      {consultaDeAdmin && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          {estaResuelto ? (
                            <button
                              className="px-3 py-2 rounded-lg bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 disabled:opacity-60"
                              onClick={() => reabrirMensaje(msg.id)}
                              disabled={resolviendoId === msg.id}
                            >
                              {resolviendoId === msg.id
                                ? "Actualizando..."
                                : "Reabrir"}
                            </button>
                          ) : (
                            <button
                              className="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-60"
                              onClick={() => marcarResuelto(msg.id)}
                              disabled={resolviendoId === msg.id}
                            >
                              {resolviendoId === msg.id
                                ? "Actualizando..."
                                : "Marcar resuelto"}
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversacionesDetalle;
