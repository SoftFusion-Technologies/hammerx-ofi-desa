import React from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const BarraBusqueda = ({
  titulos,
  textoBusqueda,
  setTextoBusqueda,
  sedeSeleccionada,
  setSedeSeleccionada,
  sedesDatos = [],
  mostrarFiltroSede = true,
  filtrosNuevos,
}) => {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
      {titulos && (
        <div>
          <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bignoodle text-gray-800">
            {titulos.icono}
            {titulos.titulo}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {titulos.subtitulo}
          </p>
        </div>
      )}

      <div className="flex w-full flex-col gap-2 sm:flex-row md:flex-1 justify-end">
        {/* BUSCADOR */}
        {setTextoBusqueda && (
          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
            <FaSearch className="text-sm text-gray-400" />
            <input
              type="text"
              placeholder="Buscar empleado..."
              className="w-full bg-transparent text-xs sm:text-sm text-gray-700 outline-none sm:w-40"
              value={textoBusqueda || ""}
              onChange={(e) => setTextoBusqueda(e.target.value)}
            />
          </div>
        )}

        {/* FILTROS ADICIONALES CUSTOM */}
        {filtrosNuevos && filtrosNuevos}

        {/* SELECT SEDE */}
        {mostrarFiltroSede && setSedeSeleccionada && (
          <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
            <FaMapMarkerAlt className="text-sm text-gray-400" />
            <select
              className="w-full cursor-pointer bg-transparent pr-2 text-xs sm:text-sm text-gray-700 outline-none"
              value={sedeSeleccionada}
              onChange={(e) => setSedeSeleccionada(e.target.value)}
            >
              <option value="todas_sedes">TODAS LAS SEDES</option>
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
