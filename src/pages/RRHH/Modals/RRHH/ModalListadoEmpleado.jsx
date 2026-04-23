import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaBuilding, FaSearch, FaTimes, FaUsers } from "react-icons/fa";
import useObtenerDatos from "../../hooks/obtenerDatos";
import ModalNovedad from "../Empleado/ModalNovedad";

const normalizarTexto = (valor) => String(valor ?? "").trim().toLowerCase();

const ModalListadoEmpleado = ({
  abierto = true,
  cerrarModal,
  onSeleccionarEmpleado,
}) => {
  const { datos, cargando, error } = useObtenerDatos("/rrhh/usuario-sede");
  const [busqueda, setBusqueda] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("todas");

  const usuariosSedes = Array.isArray(datos) ? datos : [];

  useEffect(() => {
    if (!abierto) {
      setBusqueda("");
      setSedeSeleccionada("todas");
    }
  }, [abierto]);

  const empleados = useMemo(() => {
    return usuariosSedes.filter((registro) => {
      const eliminado = Number(registro?.eliminado || 0) !== 1;
      const activo = Number(registro?.activo || 0) === 1;
      const noEsAdmin = Number(registro?.usuario?.level_admin) !== 1;

      return eliminado && activo && noEsAdmin;
    });
  }, [usuariosSedes]);

  const sedesDisponibles = useMemo(() => {
    const nombres = empleados
      .map((empleado) => empleado?.sede?.nombre)
      .filter(Boolean);

    return ["todas", ...new Set(nombres)];
  }, [empleados]);

  const empleadosFiltrados = useMemo(() => {
    const busquedaNormalizada = normalizarTexto(busqueda);

    return empleados.filter((empleado) => {
      const nombre = normalizarTexto(empleado?.usuario?.name);
      const email = normalizarTexto(empleado?.usuario?.email);
      const sede = normalizarTexto(empleado?.sede?.nombre);

      const coincideBusqueda =
        !busquedaNormalizada ||
        nombre.includes(busquedaNormalizada) ||
        email.includes(busquedaNormalizada) ||
        sede.includes(busquedaNormalizada);

      const coincideSede =
        sedeSeleccionada === "todas" ||
        sede === normalizarTexto(sedeSeleccionada);

      return coincideBusqueda && coincideSede;
    });
  }, [empleados, busqueda, sedeSeleccionada]);

  if (!abierto) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={cerrarModal}
      >
        <motion.div
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={cerrarModal}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            aria-label="Cerrar modal"
          >
            <FaTimes />
          </button>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                <FaUsers className="text-lg" />
              </div>
              <div>
                <h2 className="font-bignoodle text-3xl tracking-wide uppercase">
                  Listado de Empleados
                </h2>
                <p className="text-sm text-orange-100">
                  Buscá y filtrá empleados por nombre, mail o sede
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4 md:p-5">
            <div className="grid gap-2 md:grid-cols-[1fr_200px]">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Buscar empleado
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                  <FaSearch className="text-gray-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Nombre, email o sede"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
                  Filtrar por sede
                </span>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 transition-colors focus-within:border-orange-400 focus-within:bg-white">
                  <FaBuilding className="text-gray-400" />
                  <select
                    value={sedeSeleccionada}
                    onChange={(e) => setSedeSeleccionada(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="todas">Todas las sedes</option>
                    {sedesDisponibles
                      .filter((sede) => sede !== "todas")
                      .map((sede) => (
                        <option key={sede} value={sede}>
                          {sede}
                        </option>
                      ))}
                  </select>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-2 text-sm text-orange-900">
              <span>
                {cargando
                  ? "Cargando empleados..."
                  : `${empleadosFiltrados.length} empleado(s) encontrados`}
              </span>
              <span className="font-semibold">
                {sedeSeleccionada === "todas" ? "Todas las sedes" : sedeSeleccionada}
              </span>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {!cargando && !error && empleadosFiltrados.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center text-sm text-gray-500">
                  No hay empleados que coincidan con la búsqueda.
                </div>
              )}

              {empleadosFiltrados.map((empleado) => {
                const nombre = empleado?.usuario?.name || "Sin nombre";
                const email = empleado?.usuario?.email || "Sin email";
                const sede = empleado?.sede?.nombre || "Sin sede";

                return (
                  <button
                    key={empleado.id}
                    type="button"
                    onClick={() => onSeleccionarEmpleado?.(empleado)}
                    className="w-full rounded-2xl border border-gray-100 bg-white px-4 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold text-gray-800 md:text-[15px]">
                          {nombre}
                        </h3>
                        <p className="mt-0.5 break-all text-xs text-gray-500 md:text-sm">
                          {email}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-700 md:text-xs">
                        {sede}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalListadoEmpleado;
