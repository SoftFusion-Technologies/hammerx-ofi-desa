/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Panel de control para la gestión de liquidaciones pendientes. Este componente permite a los administradores de RRHH filtrar y buscar empleados activos por sede o nombre para iniciar el proceso de cierre de horas. Actúa como el paso previo a la aprobación final, organizando al personal según su modalidad de trabajo (presencial o remoto).
*/

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaSearch,
  FaUserClock,
} from "react-icons/fa";
import { useAuth } from "../../../../AuthContext";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../Utils/NormalizarSedes";
import AprobarLiquidacion from "./AprobarLiquidacion";
import { esAdminRRHH } from "../../Utils/AdminAutorizadosRRHH";
import { FaRegNewspaper } from "react-icons/fa6";
import LiquidacionesUsuarios from "./LiquidacionesUsuarios";

const API_URL = "http://localhost:8080";

const LiquidacionesPendientesUsuarios = ({ volverAtras = null }) => {
  const { userLevel, userLevelAdmin } = useAuth();
    const esAdminAutorizadoRRHHH = esAdminRRHH(userLevel, userLevelAdmin);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuariosSede, setUsuariosSede] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [usuarioParaLiquidar, setUsuarioParaLiquidar] = useState(null);
  const [verListadoLiquidacionesAprobadas, setVerListadoLiquidacionesAprobadas] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError("");

      const [respUsuariosSede, respSedes] = await Promise.all([
        axios.get(`${API_URL}/rrhh/usuario-sede`),
        axios.get(`${API_URL}/sedes`),
      ]);
      setUsuariosSede(
        Array.isArray(respUsuariosSede.data) ? respUsuariosSede.data : [],
      );
      setSedes(Array.isArray(respSedes.data) ? respSedes.data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los usuarios para liquidar.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (esAdminAutorizadoRRHHH) {
      cargarDatos();
    }
  }, [userLevel]);

  const sedesDatos = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : []).filter(
      (sede) =>
        sede?.es_ciudad === true &&
        String(sede?.nombre || "").toLowerCase() !== "multisede",
    );
  }, [sedes]);

  const empleadosVisibles = useMemo(() => {
    let lista = (Array.isArray(usuariosSede) ? usuariosSede : []).filter(
      (item) =>
        Number(item?.eliminado || 0) !== 1 && Number(item?.activo || 0) === 1 && Number(item?.usuario?.level_admin != 1) 
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

    return lista.sort((a, b) =>
      String(a?.usuario?.name || "").localeCompare(
        String(b?.usuario?.name || ""),
      ),
    );
  }, [usuariosSede, sedeSeleccionada, busqueda, sedesDatos]);

  if (usuarioParaLiquidar) {
    return (
      <AprobarLiquidacion
        usuario={usuarioParaLiquidar}
        alVolver={() => setUsuarioParaLiquidar(null)}
        alLiquidarCorrectamente={() => {
          setUsuarioParaLiquidar(null);
          cargarDatos();
        }}
      />
    );
  }

  if (verListadoLiquidacionesAprobadas) {
    return (
      <LiquidacionesUsuarios
        volverAtras={() => setVerListadoLiquidacionesAprobadas(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4 flex w-full justify-between">
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Volver atrás
        </button>
        <button
          onClick={() => setVerListadoLiquidacionesAprobadas(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
        >
          <FaRegNewspaper className="group-hover:-translate-x-1 transition-transform duration-200" />
          Ir a historial liquidaciones
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaUserClock className="text-orange-500" />
            LIQUIDAR HORAS
          </h2>
          <p className="text-gray-500 text-sm">
            Seleccioná un empleado y sede para preparar la liquidación.
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 bg-white p-2 px-3 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="outline-none text-sm text-gray-700 bg-transparent w-full sm:w-44"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-full sm:w-auto">
            <FaMapMarkerAlt className="text-gray-400 ml-2" />
            <select
              className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm w-full"
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

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Empleado</th>
              <th className="px-6 py-4 font-bold">Sede</th>
              <th className="px-6 py-4 font-bold">Modalidad</th>
              <th className="px-6 py-4 font-bold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cargando ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  Cargando...
                </td>
              </tr>
            ) : empleadosVisibles.length > 0 ? (
              empleadosVisibles.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-orange-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {emp?.usuario?.name.toUpperCase() || "-"}
                    </div>
                    <div className="text-xs text-gray-400">
                      {emp?.usuario?.email.toLowerCase() || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {normalizarSedes(emp?.sede?.nombre || "-")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-lg font-semibold text-xs ${
                        Number(emp?.remoto || 0) === 1
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {Number(emp?.remoto || 0) === 1 ? "Remoto" : "Presencial"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setUsuarioParaLiquidar(emp)}
                      className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-600 hover:text-white transition-all shadow-sm"
                    >
                      <FaCheckCircle />
                      Preparar liquidación
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-6 py-10 text-center text-gray-400 italic"
                >
                  No se encontraron empleados para mostrar
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {cargando ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-500">
            Cargando...
          </div>
        ) : empleadosVisibles.length > 0 ? (
          empleadosVisibles.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-gray-800">
                    {emp?.usuario?.name || "-"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {emp?.usuario?.email || "-"}
                  </p>
                </div>

                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">
                  {normalizarSedes(emp?.sede?.nombre || "-")}
                </span>
              </div>

              <div className="mt-3">
                <span
                  className={`px-2 py-1 rounded-lg font-semibold text-xs ${
                    Number(emp?.remoto || 0) === 1
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {Number(emp?.remoto || 0) === 1 ? "Remoto" : "Presencial"}
                </span>
              </div>

              <button
                onClick={() => setUsuarioParaLiquidar(emp)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold"
              >
                <FaCheckCircle />
                Preparar liquidación
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 italic">
            No se encontraron resultados
          </div>
        )}
      </div>
    </div>
  );
};

export default LiquidacionesPendientesUsuarios;
