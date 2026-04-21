import React, { useEffect, useMemo } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { usarPromiseAll } from "../../hooks/usarPromiseAll";
import { esAdminRRHH } from "../../Utils/AdminAutorizadosRRHH";
import { useAuth } from "../../../../AuthContext";

const BarraBusqueda = ({ titulos, busqueda, datosFiltrados }) => {
  const {
    busqueda: texto,
    setBusqueda,
    sedeSeleccionada,
    setSedeSeleccionada,
  } = busqueda;
  const { setDatosFiltrados } = datosFiltrados;

  const usuarioAuth = useAuth();

  const esAdminAutorizadoRRHHH = esAdminRRHH(
    usuarioAuth.userLevel,
    usuarioAuth.userLevelAdmin,
  );

  const { datos } = esAdminAutorizadoRRHHH
    ? usarPromiseAll([{ endpoint: "rrhh/usuario-sede" }, { endpoint: "sedes" }])
    : { datos: [[], []] };

  const [usuarios = [], sedes = []] = datos || [[], []];

  const empleadosDatos = useMemo(() => {
    console.log(usuarios);
    return usuarios.filter(
      (u) =>
        Number(u?.eliminado || 0) !== 1 &&
        Number(u?.activo || 0) === 1 &&
        Number(u?.usuario?.level_admin) !== 1,
    );
  }, [usuarios]);

  const sedesDatos = useMemo(() => {
    return sedes.filter(
      (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
    );
  }, [sedes]);

  useEffect(() => {
    setDatosFiltrados({
      empleadosDatos,
      sedesDatos,
    });
  }, [empleadosDatos, texto, sedeSeleccionada]);

  return (
    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bignoodle text-gray-800">
          {titulos.icono}
          {titulos.titulo}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">{titulos.subtitulo}</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto">
        {/* BUSCADOR (igual que el tuyo) */}
        {(busqueda.busqueda || busqueda.setBusqueda) && (
          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
            <FaSearch className="text-sm text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-700 outline-none sm:w-40"
              value={texto}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}

        {/* SELECT SEDE*/}
        {(busqueda?.mostrarFiltroSede !== false) && (
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
        )}
      </div>
    </div>
  );
};

export default BarraBusqueda;
