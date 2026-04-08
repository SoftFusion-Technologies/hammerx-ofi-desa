/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Interfaz de administración para la supervisión de horarios del personal. Permite a los responsables de RRHH filtrar la nómina de empleados activos por sede y acceder a la visualización detallada de los turnos y cronogramas de cada usuario de forma individual.
*/
import React, { useState, useEffect, useMemo } from "react";
import { usarPromiseAll } from "../../hooks/usarPromiseAll";
import { useAuth } from "../../../../AuthContext";
import { FaUsers, FaMapMarkerAlt, FaEye, FaArrowLeft } from "react-icons/fa";
import Horarios from "../Empleados/Horarios";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../Utils/NormalizarSedes";
import { esAdminRRHH } from "../../Utils/AdminAutorizadosRRHH";

const HorariosUsuarios = ({ volverAtras = null }) => {
  const { userLevel, userLevelAdmin} = useAuth();
  const esAdminAutorizadoRRHHH = esAdminRRHH(userLevel, userLevelAdmin);
  const [sedesDatos, setSedesDatos] = useState([]);
  const [empleadosDatos, setEmpleadosDatos] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");

  const { datos, cargando, error } =
    esAdminAutorizadoRRHHH
      ? usarPromiseAll([
          { endpoint: "rrhh/usuario-sede" },
          { endpoint: "sedes" },
        ])
      : { datos: [], cargando: false, error: null };

  const [usuarios, sedes] = datos || [[], []];

  useEffect(() => {
    if (usuarios && usuarios.length > 0) {
      const empleadosFiltrados = usuarios.filter(u => 
        Number(u?.eliminado || 0) !== 1 && Number(u?.activo || 0) === 1 && Number(u?.usuario?.level_admin != 1));
      setEmpleadosDatos(empleadosFiltrados);
    }
    if (sedes && sedes.length > 0) {
      const sedesFiltradas = sedes.filter(
        (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
      );
      setSedesDatos(sedesFiltradas);
    }
  }, [usuarios, sedes]);

  const empleadosVisibles = useMemo(() => {
    if (!sedeSeleccionada) return empleadosDatos;

    const sedeElegida = sedesDatos.find(
      (s) => s.id === parseInt(sedeSeleccionada),
    );

    return sedeElegida
      ? empleadosDatos.filter(
          (emp) =>
            normalizarSedes_2(emp.sede.nombre).toLowerCase() ===
            sedeElegida.nombre.toLowerCase(),
        )
      : empleadosDatos;
  }, [sedeSeleccionada, empleadosDatos, sedesDatos]);

  if (usuarioSeleccionado) {
    return (
      <Horarios
        setVistaActiva={null}
        volverAtras={() => setUsuarioSeleccionado(null)}
        usuarioSeleccionado={usuarioSeleccionado}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
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
            <FaUsers className="text-blue-600" /> CONTROL DE HORARIOS
          </h2>
          <p className="text-gray-500 text-sm">
            Listado general de empleados por sede
          </p>
        </div>

        {/* 3. CAMBIO AQUI: Selector de sede para filtrar */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <FaMapMarkerAlt className="text-gray-400 ml-2" />
          <select
            className="outline-none text-gray-700 bg-transparent pr-4 cursor-pointer"
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
              <div className="space-y-2 mb-3">
                <p className="text-[11px] text-gray-400">EMAIL</p>
                <p className="text-sm font-medium text-gray-700 break-all">
                  {toUpperText(emp.usuario.email)}
                </p>
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-[11px] text-gray-400">NOMBRE Y APELLIDO</p>
                <p className="text-sm font-bold text-gray-800 break-words">
                  {toUpperText(emp.usuario.name)}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-[11px] text-gray-400">SEDE</p>
                <p className="text-sm text-gray-600">
                  {toUpperText(normalizarSedes(emp.sede.nombre))}
                </p>
              </div>

              <button
                onClick={() => setUsuarioSeleccionado(emp)}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
              >
                <FaEye /> VISUALIZAR
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 italic">
            NO SE ENCONTRARON EMPLEADOS EN ESTA SEDE
          </div>
        )}
      </div>

      {/* Vista Desktop */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Email</th>
              <th className="px-6 py-4 font-bold">Nombre y apellido</th>
              <th className="px-6 py-4 font-bold">Sede</th>
              <th className="px-6 py-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {cargando ? (
              <tr>
                <td colSpan="4" className="text-center py-10">
                  CARGANDO DATOS...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-red-500">
                  ERROR AL CARGAR DATOS
                </td>
              </tr>
            ) : empleadosVisibles.length > 0 ? (
              empleadosVisibles.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-400">
                      {toUpperText(emp.usuario.email)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-400">
                      {toUpperText(emp.usuario.name)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="text-xs text-gray-400">
                      {toUpperText(normalizarSedes(emp.sede.nombre))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setUsuarioSeleccionado(emp)}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <FaEye /> VISUALIZAR
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
                  NO SE ENCONTRARON EMPLEADOS EN ESTA SEDE
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HorariosUsuarios;
