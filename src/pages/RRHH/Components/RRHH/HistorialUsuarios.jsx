/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Panel de administración para la gestión de historiales de asistencia. Permite a los responsables de RRHH filtrar empleados por sede, realizar búsquedas específicas y visualizar rápidamente quiénes tienen marcaciones con estados pendientes de aprobación, sirviendo como acceso directo al control detallado de cada usuario.
*/

import React, { useState, useEffect, useMemo } from "react";
import { usarPromiseAll } from "../../hooks/usarPromiseAll";
import { useAuth } from "../../../../AuthContext";
import {
  FaHistory,
  FaMapMarkerAlt,
  FaUserClock,
  FaSearch,
  FaArrowLeft,
} from "react-icons/fa";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../Utils/NormalizarSedes";
import HistorialMarcas from "../Empleados/HistorialMarcas";
import { esAdminRRHH } from "../../Utils/AdminAutorizadosRRHH";

const HistorialUsuarios = ({ volverAtras = null }) => {
  const { userLevel, userLevelAdmin } = useAuth();
  const esAdminAutorizadoRRHHH = esAdminRRHH(userLevel, userLevelAdmin);
  const [sedesDatos, setSedesDatos] = useState([]);
  const [empleadosDatos, setEmpleadosDatos] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [estadoAprobacion, setEstadoAprobacion] = useState("todos");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");

  const { datos, cargando, error } = esAdminAutorizadoRRHHH
    ? usarPromiseAll([
        { endpoint: "rrhh/usuario-sede" },
        { endpoint: "sedes" },
        { endpoint: "rrhh/marcaciones/notificaciones/pendientes" },
      ])
    : { datos: [], cargando: false, error: null };

  const [usuarios = [], sedes = [], notificacionesPendientes = []] = datos || [
    [],
    [],
    [],
  ];

  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      const empleadosFiltrados = usuarios;

      if (notificacionesPendientes && notificacionesPendientes.length > 0) {
        const pendientesMap = notificacionesPendientes.reduce((acc, item) => {
          const llaveUnica = `${item.usuario_id}-${item.sede_id}`;
          acc[llaveUnica] = item.cantidad_pendientes;
          return acc;
        }, {});

        const resultado = empleadosFiltrados
          .map((usuario) => {
            const llaveUnicaUsuario = `${usuario.usuario_id}-${usuario.sede_id}`;
            return {
              ...usuario,
              cantidad_pendientes: pendientesMap[llaveUnicaUsuario] ?? 0,
            };
          })
          .filter(
            (u) =>
              Number(u?.eliminado || 0) !== 1 &&
              Number(u?.activo || 0) === 1 &&
              Number(u?.usuario?.level_admin) !== 1,
          );
        setEmpleadosDatos(resultado);
      } else {
        // Si no hay notificaciones, seteamos todos con 0 pendientes
        const resultadoSinPendientes = empleadosFiltrados
          .map((u) => ({
            ...u,
            cantidad_pendientes: 0,
          }))
          .filter(
            (u) =>
              Number(u?.eliminado || 0) !== 1 &&
              Number(u?.activo || 0) === 1 &&
              Number(u?.usuario?.level_admin) !== 1,
          );
        setEmpleadosDatos(resultadoSinPendientes);
      }
    }

    if (sedes && sedes.length > 0) {
      const sedesFiltradas = sedes.filter(
        (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
      );
      setSedesDatos(sedesFiltradas);
    }
  }, [usuarios, sedes, notificacionesPendientes]);

  // Lógica de filtrado por sede y búsqueda por nombre/email
  const empleadosVisibles = useMemo(() => {
    let filtrados = empleadosDatos;
    if (sedeSeleccionada) {
      const sedeElegida = sedesDatos.find(
        (s) => s.id === parseInt(sedeSeleccionada),
      );
      if (sedeElegida) {
        filtrados = filtrados.filter(
          (emp) =>
            normalizarSedes_2(emp.sede.nombre).toLowerCase() ===
            sedeElegida.nombre.toLowerCase(),
        );
      }
    }

    if (busqueda) {
      filtrados = filtrados.filter(
        (emp) =>
          emp.usuario.name.toLowerCase().includes(busqueda.toLowerCase()) ||
          emp.usuario.email.toLowerCase().includes(busqueda.toLowerCase()),
      );
    }

    if (estadoAprobacion === "pendientes") {
      return (filtrados = filtrados.filter(
        (emp) => Number(emp.cantidad_pendientes) > 0,
      ));
    }

    return filtrados;
  }, [
    sedeSeleccionada,
    empleadosDatos,
    sedesDatos,
    busqueda,
    estadoAprobacion,
  ]);

  // Espacio para mostrar el historial detallado
  if (usuarioSeleccionado) {
    return (
      <HistorialMarcas
        usuario={usuarioSeleccionado}
        volverAtras={() => setUsuarioSeleccionado(null)}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Botón volver */}
      <div className="mb-4">
        <button
          onClick={volverAtras}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all duration-200 group"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Volver atrás
        </button>
      </div>

      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaHistory className="text-emerald-600" /> HISTORIAL DE MARCACIONES
          </h2>
          <p className="text-gray-500 text-sm">
            Consulta de entradas, salidas y estados de asistencia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-3">
          {/* Buscador */}
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
            {/* Selector de Sede */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <select
                className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm"
                value={estadoAprobacion}
                onChange={(e) => setEstadoAprobacion(e.target.value)}
              >
                <option value="">TODOS</option>
                <option value={"pendientes"}>PENDIENTES</option>
              </select>
            </div>
            {/* Selector de Sede */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <FaMapMarkerAlt className="text-gray-400 ml-2" />
              <select
                className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer text-sm"
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
            CARGANDO DATOS...
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl border border-red-100 p-5 text-center text-sm text-red-500">
            ERROR AL CARGAR DATOS
          </div>
        ) : empleadosVisibles.length > 0 ? (
          empleadosVisibles.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-800 break-words">
                    {toUpperText(emp.usuario.name)}
                  </p>
                  <p className="text-xs text-gray-400 break-all mt-1">
                    {toUpperText(emp.usuario.email)}
                  </p>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-semibold whitespace-nowrap">
                  {toUpperText(normalizarSedes(emp.sede.nombre))}
                </span>
              </div>

              <button
                onClick={() => setUsuarioSeleccionado(emp)}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
              >
                <FaUserClock /> VER HISTORIAL
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 italic">
            NO SE ENCONTRARON RESULTADOS
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
              <th className="px-6 py-4 font-bold">Pendientes</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cargando ? (
              <tr>
                <td colSpan="3" className="text-center py-10">
                  CARGANDO DATOS...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="3" className="text-center py-10 text-red-500">
                  ERROR AL CARGAR DATOS
                </td>
              </tr>
            ) : empleadosVisibles.length > 0 ? (
              empleadosVisibles.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-800">
                      {toUpperText(emp.usuario.name)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {toUpperText(emp.usuario.email)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                      {toUpperText(normalizarSedes(emp.sede.nombre))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold ${emp.cantidad_pendientes > 0 ? "bg-yellow-100 text-yellow-600" : ""}`}
                    >
                      {emp.cantidad_pendientes || 0} Pendientes
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setUsuarioSeleccionado(emp)}
                      className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <FaUserClock /> VER HISTORIAL
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="3"
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

export default HistorialUsuarios;
