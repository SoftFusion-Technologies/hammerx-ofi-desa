/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Vista de consulta de liquidaciones finalizadas. Este componente permite visualizar el historial de pagos de forma cronológica, desglosando horas trabajadas, descuentos aplicados y adelantos. Incluye una funcionalidad de expansión para ver el detalle de cada ítem liquidado y notas administrativas, transformando valores decimales en formatos de hora legibles para mayor claridad del personal.
*/

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaFileInvoice } from "react-icons/fa";
import { useAuth } from "../../../../AuthContext";
import { useSedeUsers } from "../../Context/SedeUsersContext";

const API_URL = "http://localhost:8080";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const date = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR");
};

// Transformamos los decimales (ej. 1.5) a un formato humano y amigable (ej. 1:30 hs)
const formatearHoras = (valorDecimal) => {
  const minutosTotales = Math.round(Number(valorDecimal || 0) * 60);
  const signo = minutosTotales < 0 ? "-" : "";
  const absMinutos = Math.abs(minutosTotales);
  const horas = Math.floor(absMinutos / 60);
  const minutos = absMinutos % 60;
  return `${signo}${horas}:${String(minutos).padStart(2, "0")} hs`;
};

const claseEstado = {
  borrador: "bg-gray-100 text-gray-600",
  confirmada: "bg-green-100 text-green-700",
  anulada: "bg-red-100 text-red-700",
};

const Liquidaciones = ({ usuarioSeleccionado = null, volverAtras = null }) => {
  const { userId } = useAuth();
  const { sedeSeleccionada: sedeContext } = useSedeUsers();
  
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [liquidacionExpandida, setLiquidacionExpandida] = useState(null);

  const idUsuarioFinal = usuarioSeleccionado ? usuarioSeleccionado.usuario_id : userId;
  const idSedeFinal = usuarioSeleccionado ? usuarioSeleccionado.sede_id : sedeContext?.id;

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const resp = await axios.get(`${API_URL}/rrhh/liquidaciones`);
      const data = Array.isArray(resp.data) ? resp.data : [];
      
      const filtradas = data
        .filter(liq => 
            Number(liq.usuario_id) === Number(idUsuarioFinal) && 
            Number(liq.sede_id) === Number(idSedeFinal) &&
            Number(liq.eliminado || 0) !== 1
        )
        .sort((a, b) => new Date(b.fecha_liquidacion || 0) - new Date(a.fecha_liquidacion || 0));
      
      setLiquidaciones(filtradas);
    } catch (err) {
      setError("No se pudieron cargar las liquidaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (idUsuarioFinal && idSedeFinal) cargarDatos();
  }, [idUsuarioFinal, idSedeFinal]);

  if (cargando) return <div className="p-6 text-center text-gray-400">Cargando liquidaciones...</div>;

  return (
    <div className="animate-fade-in-up px-2 sm:px-3 md:px-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {volverAtras && (
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:border-orange-500 hover:text-orange-600 hover:shadow-md group"
        >
          <FaArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          Volver atrás
        </button>
        )}

        {usuarioSeleccionado?.usuario?.name && (
        <div className="text-xs sm:text-sm text-gray-500">
          Empleado:{" "}
          <span className="font-semibold text-gray-700">
            {usuarioSeleccionado?.usuario?.name || "N/D"}
          </span>
        </div>
        )}
      </div>

      <div className="mb-3 rounded-2xl border border-orange-100 bg-white p-3 sm:p-4 shadow-sm">
        <h3 className="mb-1 flex items-center gap-2 text-lg sm:text-xl font-bignoodle text-gray-800">
          <FaFileInvoice className="text-orange-500" />
          LIQUIDACIONES
        </h3>
        <p className="text-xs sm:text-sm text-gray-500">
          Resumen de horas y pagos por período.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {liquidaciones.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
          No hay liquidaciones cargadas para mostrar.
        </div>
      ) : (
        <div className="space-y-3">
          {liquidaciones.map((liquidacion) => {
            const expandida = Number(liquidacionExpandida) === Number(liquidacion.id);
            return (
              <div key={liquidacion.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="p-3 sm:p-4">
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-lg px-2 py-1 text-[11px] font-bold ${claseEstado[liquidacion.estado] || "bg-gray-100 text-gray-600"}`}>
                          {String(liquidacion.estado || "-").toUpperCase()}
                        </span>
                        <span className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                          {formatearFecha(liquidacion.fecha_desde)} al {formatearFecha(liquidacion.fecha_hasta)}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800">Resumen del período</h4>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500">
                        Fecha: {formatearFecha(liquidacion.fecha_liquidacion)}
                      </p>
                    </div>

                    <div className="grid min-w-0 grid-cols-3 gap-2 xl:grid-cols-3 xl:min-w-[500px]">
                      
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                        <p className="text-[11px] text-gray-500">Horas</p>
                        <p className="text-sm font-bold text-gray-800">{formatearHoras(liquidacion.horas_trabajadas_periodo)}</p>
                      </div>

                      {Number(liquidacion.saldo_adelantos_previos) > 0 && (
                        <div className="rounded-xl border border-orange-100 bg-orange-50 px-3 py-2">
                          <p className="text-[11px] text-orange-600">Saldo anterior</p>
                          <p className="text-sm font-bold text-orange-700">-{formatearHoras(liquidacion.saldo_adelantos_previos)}</p>
                        </div>
                      )}
                      
                      {Number(liquidacion.horas_descontadas) > 0 && (
                        <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
                          <p className="text-[11px] text-red-500">Descuentos</p>
                          <p className="text-sm font-bold text-red-700">-{formatearHoras(liquidacion.horas_descontadas)}</p>
                        </div>
                      )}

                      {Number(liquidacion.horas_adelanto_futuro) > 0 && (
                        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
                          <p className="text-[11px] text-blue-600">Anticipo</p>
                          <p className="text-sm font-bold text-blue-700">+{formatearHoras(liquidacion.horas_adelanto_futuro)}</p>
                        </div>
                      )}

                      <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-2">
                        <p className="text-[11px] text-green-600">Total</p>
                        <p className="text-sm font-bold text-green-700">{formatearHoras(liquidacion.horas_liquidadas)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                      Clase: {String(liquidacion.tipo_liquidacion?.toUpperCase() || "-").replace("_", " ")}
                    </span>
                    <span className="rounded-lg bg-purple-50 px-2 py-1 text-[11px] font-semibold text-purple-700">
                      Fecha de pago: {formatearFecha(liquidacion.fecha_pago)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => setLiquidacionExpandida(expandida ? null : liquidacion.id)}
                      className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {expandida ? "Ver menos" : "Ver más"}
                    </button>
                  </div>
                </div>

                {expandida && (
                  <div className="border-t border-gray-100 bg-orange-50/40 p-3 sm:p-4">
                    <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-gray-100 bg-white p-3">
                        <p className="mb-1 text-[11px] text-gray-500">Nota</p>
                        <p className="text-sm text-gray-700">{liquidacion.observacion || "Sin nota"}</p>
                      </div>
                    </div>

                    {liquidacion.detalles?.length > 0 ? (
                      <div className="space-y-2">
                        {liquidacion.detalles.map((detalle) => (
                          <div key={detalle.id} className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800">
                                {String(detalle.tipo_detalle || "-").replaceAll("_", " ").toUpperCase()}
                              </p>
                              <p className="text-[11px] text-gray-500">Fecha: {formatearFecha(detalle.fecha)}</p>
                              {detalle.observacion && <p className="mt-1 text-[11px] text-gray-500 break-words">{detalle.observacion}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800 whitespace-nowrap">{formatearHoras(detalle.horas)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No hay detalles cargados.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Liquidaciones;