/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Interfaz administrativa para la gestión global de liquidaciones. Permite a los responsables de RRHH filtrar empleados por sede o nombre, visualizar un resumen rápido del estado de sus pagos (totales, confirmadas y anuladas) y acceder al historial detallado de cada usuario de forma individual.
*/

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaFileInvoice,
  FaHistory,
  FaMapMarkerAlt,
  FaSearch,
  FaUser,
} from "react-icons/fa";
import { FaRegNewspaper } from "react-icons/fa6";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../Utils/NormalizarSedes";
import Liquidaciones from "../Empleados/Liquidaciones";
import LiquidacionesPendientesUsuarios from "./LiquidacionesPendientesUsuarios";
import { useAuth } from "../../../../AuthContext";
import { esAdminRRHH } from "../../Utils/AdminAutorizadosRRHH";

const API_URL = "http://localhost:8080";

const LiquidacionesUsuarios = ({ volverAtras = null }) => {
  const datosUsuarioLogeado = useAuth();
  const esAdminAutorizadoRRHHH = esAdminRRHH(
    datosUsuarioLogeado.userLevel,
    datosUsuarioLogeado.userLevelAdmin,
  );
  console.log(esAdminAutorizadoRRHHH);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuariosSede, setUsuariosSede] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);

  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [
    verListadoLiquidacionesPendientes,
    setVerListadoLiquidacionesPendientes,
  ] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [respUsuariosSede, respSedes, respLiquidaciones] =
        await Promise.all([
          axios.get(`${API_URL}/rrhh/usuario-sede`),
          axios.get(`${API_URL}/sedes`),
          axios.get(`${API_URL}/rrhh/liquidaciones`),
        ]);

      setUsuariosSede(
        Array.isArray(respUsuariosSede.data) ? respUsuariosSede.data : [],
      );
      setSedes(Array.isArray(respSedes.data) ? respSedes.data : []);
      setLiquidaciones(
        Array.isArray(respLiquidaciones.data) ? respLiquidaciones.data : [],
      );
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las liquidaciones.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Lógica de sedes: Filtra Multisede y solo deja ciudades (como en tus otros componentes)
  const sedesDatos = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : []).filter(
      (sede) =>
        sede?.es_ciudad === true &&
        String(sede?.nombre || "").toLowerCase() !== "multisede",
    );
  }, [sedes]);

  const liquidacionesActivas = useMemo(() => {
    return (Array.isArray(liquidaciones) ? liquidaciones : []).filter(
      (item) => Number(item?.eliminado || 0) !== 1,
    );
  }, [liquidaciones]);

  const empleadosSedeVisibles = useMemo(() => {
    let lista = (Array.isArray(usuariosSede) ? usuariosSede : []).filter(
      (item) =>
        Number(item?.eliminado || 0) !== 1 &&
        Number(item?.activo || 0) === 1 &&
        Number(item?.usuario?.level_admin != 1),
    );

    if (sedeSeleccionada) {
      const sedeElegida = sedesDatos.find(
        (sede) => Number(sede.id) === Number(sedeSeleccionada),
      );

      if (sedeElegida) {
        lista = lista.filter(
          (emp) =>
            normalizarSedes_2(emp?.sede?.nombre || "").toLowerCase() ===
            String(sedeElegida.nombre || "").toLowerCase(),
        );
      }
    }

    const termino = busqueda.trim().toLowerCase();
    if (termino) {
      lista = lista.filter((emp) => {
        const nombre = String(emp?.usuario?.name || "").toLowerCase();
        const email = String(emp?.usuario?.email || "").toLowerCase();
        return nombre.includes(termino) || email.includes(termino);
      });
    }

    return lista;
  }, [usuariosSede, sedeSeleccionada, busqueda, sedesDatos]);

  // RESTAURADO: Cálculo de resumen para la tabla
  const empleadosConResumen = useMemo(() => {
    return empleadosSedeVisibles.map((emp) => {
      const liquidacionesEmpleado = liquidacionesActivas.filter(
        (liq) =>
          Number(liq.usuario_id) === Number(emp.usuario_id) &&
          Number(liq.sede_id) === Number(emp.sede_id),
      );

      return {
        ...emp,
        resumen: {
          total: liquidacionesEmpleado.length,
          confirmadas: liquidacionesEmpleado.filter(
            (l) => l.estado === "confirmada",
          ).length,
          anuladas: liquidacionesEmpleado.filter((l) => l.estado === "anulada")
            .length,
        },
      };
    });
  }, [empleadosSedeVisibles, liquidacionesActivas]);

  if (usuarioSeleccionado) {
    return (
      <Liquidaciones
        usuarioSeleccionado={usuarioSeleccionado}
        volverAtras={() => setUsuarioSeleccionado(null)}
      />
    );
  }

  if (verListadoLiquidacionesPendientes) {
    return (
      <LiquidacionesPendientesUsuarios
        volverAtras={() => setVerListadoLiquidacionesPendientes(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in-up px-2 sm:px-3 md:px-4">
      <div className="mb-4 flex w-full justify-between">
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Volver atrás
        </button>
        {esAdminAutorizadoRRHHH && (
          <button
            onClick={() => setVerListadoLiquidacionesPendientes(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaRegNewspaper className="group-hover:-translate-x-1 transition-transform duration-200" />
            Ir a liquidaciones pendientes
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bignoodle text-gray-800">
            <FaHistory className="text-orange-500" />
            HISTORIAL DE LIQUIDACIONES
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Consulta de liquidaciones registradas por empleado y sede.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
            <FaSearch className="text-sm text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-700 outline-none sm:w-40"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
            <FaMapMarkerAlt className="text-sm text-gray-400" />
            <select
              className="w-full cursor-pointer bg-transparent pr-2 text-xs sm:text-sm text-gray-700 outline-none"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
            >
              <option value="">TODAS LAS SEDES</option>
              {sedesDatos.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {String(sede.nombre || "").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-3 py-2.5 font-bold">Empleado</th>
              <th className="px-3 py-2.5 font-bold">Sede</th>
              <th className="px-3 py-2.5 font-bold">Resumen</th>
              <th className="px-3 py-2.5 text-center font-bold">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {cargando ? (
              <tr>
                <td
                  colSpan="4"
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Cargando...
                </td>
              </tr>
            ) : (
              empleadosConResumen.map((emp) => (
                <tr
                  key={emp.id}
                  className="transition-colors hover:bg-orange-50/30"
                >
                  <td className="px-3 py-2.5">
                    <div className="text-sm font-medium text-gray-800">
                      {emp?.usuario?.name}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {emp?.usuario?.email}
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
                      {normalizarSedes(emp?.sede?.nombre || "-")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      <span className="rounded-lg bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                        Total: {emp.resumen.total}
                      </span>
                      <span className="rounded-lg bg-green-100 px-2 py-1 font-semibold text-green-700">
                        Confirmadas: {emp.resumen.confirmadas}
                      </span>
                      <span className="rounded-lg bg-red-100 px-2 py-1 font-semibold text-red-700">
                        Anuladas: {emp.resumen.anuladas}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => setUsuarioSeleccionado(emp)}
                      className="inline-flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 transition-all hover:bg-orange-500 hover:text-white"
                    >
                      <FaFileInvoice /> Ver historial
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Móvil */}
      <div className="space-y-2.5 md:hidden">
        {empleadosConResumen.map((emp) => (
          <div
            key={emp.id}
            className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <FaUser className="shrink-0 text-gray-400" />
                  <span className="truncate">{emp?.usuario?.name}</span>
                </p>
              </div>
              <span className="rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-600">
                {normalizarSedes(emp?.sede?.nombre || "-")}
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="rounded-lg bg-gray-100 px-2 py-1 font-semibold text-gray-700">
                {emp.resumen.total} liq.
              </span>
              <span className="rounded-lg bg-green-100 px-2 py-1 font-semibold text-green-700">
                {emp.resumen.confirmadas} conf.
              </span>
            </div>
            <button
              onClick={() => setUsuarioSeleccionado(emp)}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700"
            >
              <FaFileInvoice /> Ver historial
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiquidacionesUsuarios;
