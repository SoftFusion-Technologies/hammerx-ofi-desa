/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Pantalla de bienvenida y selección de sede. Se encarga de listar las sucursales que el usuario tiene vinculadas, permitiéndole elegir una para establecerla en el contexto global de la aplicación antes de ingresar al panel principal.
*/

import React, { useState } from "react";
import useObtenerDatos from "../hooks/obtenerDatos";
import { motion, AnimatePresence } from "framer-motion";
import { useSedeUsers } from "../Context/SedeUsersContext";
import img_hammerxsoft from "../../../images/staff/hammerxsoft5.png";

const PanelSeleccionSede = ({ idUsuario, onSeleccionarSede }) => {
  const {
    datos: sedes,
    cargando,
    error,
  } = useObtenerDatos(`/rrhh/usuario-sede/usuario/${idUsuario}`);

  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const { seleccionarSede } = useSedeUsers();

  const handleSeleccion = (sedeUsuario) => {
    setSedeSeleccionada(sedeUsuario.id);
    seleccionarSede(sedeUsuario);

    if (onSeleccionarSede) {
      onSeleccionarSede(sedeUsuario);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-3 max-[360px]:p-0 md:p-6 overflow-hidden font-messina"
      style={{
        backgroundImage: `url(${img_hammerxsoft})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Fondo oscuro */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Glow sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.16),transparent_38%)]" />

      {/* Panel principal */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full min-h-[calc(100svh-1.5rem)] max-[360px]:min-h-screen md:min-h-0 md:max-w-lg overflow-hidden flex flex-col
                   bg-white/88 backdrop-blur-xl
                   rounded-[2rem]
                   border-0 md:border md:border-white/20
                   shadow-none md:shadow-[0_25px_80px_rgba(0,0,0,0.45)]"
      >
        {/* Header premium */}
        <div className="relative px-8 md:px-10 pt-10 pb-9 text-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-800 via-orange-700 to-orange-600 border-b border-white/10">
          {/* Brillos decorativos */}
          <div className="absolute -top-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-orange-200/10 blur-2xl" />

          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/12 border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md mb-5">
            <span className="text-3xl">🏋️‍♂️</span>
          </div>

          <p className="relative text-[11px] uppercase tracking-[0.35em] text-orange-100/80 font-semibold">
            Acceso al sistema
          </p>

          <h2 className="relative mt-2 text-5xl md:text-6xl leading-none uppercase text-white font-bignoodle tracking-[0.06em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            Bienvenido
          </h2>

          <p className="relative text-orange-100/90 text-sm md:text-[15px] mt-3 font-medium">
            Seleccioná la sede con la que querés trabajar
          </p>
        </div>

        {/* Cuerpo */}
        <div className="px-7 md:px-8 py-8 md:py-9 flex-grow flex flex-col justify-center bg-gradient-to-b from-white/70 to-slate-50/90">
          {cargando ? (
            <div className="flex flex-col items-center py-14">
              <div className="w-11 h-11 rounded-full border-4 border-orange-200 border-t-orange-700 animate-spin mb-4" />
              <p className="text-slate-600 text-xs uppercase tracking-[0.25em] font-bold">
                Buscando sedes...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center shadow-sm">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          ) : !sedes || sedes.length === 0 ? (
            <div className="text-center py-12 px-4">
              <p className="text-slate-700 font-semibold">
                No tenés sedes asignadas actualmente.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Contactate con el administrador para obtener acceso.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              <AnimatePresence>
                {Array.isArray(sedes) &&
                  sedes.map((sedeUsuario, index) => {
                    const nombreSede = sedeUsuario.sede?.nombre || "(Sin nombre)";
                    const estaSeleccionada = sedeSeleccionada === sedeUsuario.id;

                    return (
                      <motion.button
                        key={sedeUsuario.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: index * 0.07 },
                        }}
                        whileHover={{ scale: 1.012 }}
                        whileTap={{ scale: 0.988 }}
                        type="button"
                        onClick={() => handleSeleccion(sedeUsuario)}
                        className={`group relative w-full overflow-hidden rounded-2xl border px-5 py-5 text-left transition-all duration-300 ${
                          estaSeleccionada
                            ? "border-orange-500 bg-gradient-to-r from-orange-950 via-orange-800 to-orange-600 shadow-[0_12px_30px_rgba(194,65,12,0.28)]"
                            : "border-slate-200 bg-white/95 hover:border-orange-300 hover:bg-white shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
                        }`}
                      >
                        {/* brillo interno sutil */}
                        <div
                          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
                            estaSeleccionada
                              ? "opacity-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%)]"
                              : "opacity-0 group-hover:opacity-100 bg-[linear-gradient(135deg,rgba(251,146,60,0.08),transparent_45%)]"
                          }`}
                        />

                        <div className="relative flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                                estaSeleccionada
                                  ? "border-white/20 bg-white/10"
                                  : "border-orange-100 bg-orange-50"
                              }`}
                            >
                              <div
                                className={`h-3 w-3 rounded-full ${
                                  estaSeleccionada
                                    ? "bg-orange-200 shadow-[0_0_12px_rgba(255,237,213,0.9)]"
                                    : "bg-orange-500"
                                }`}
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`text-[10px] uppercase tracking-[0.28em] ${
                                  estaSeleccionada
                                    ? "text-orange-100/75"
                                    : "text-slate-400"
                                }`}
                              >
                                Disponible
                              </p>

                              <h3
                                className={`mt-1 truncate text-[15px] md:text-base font-bold uppercase tracking-[0.08em] ${
                                  estaSeleccionada
                                    ? "text-white"
                                    : "text-slate-800"
                                }`}
                              >
                                {nombreSede}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-slate-950/85 border-t border-slate-800 text-center mt-auto">
          <p className="text-[10px] md:text-[11px] text-slate-300 uppercase tracking-[0.3em] font-semibold">
            Sistema de Gestión de Recursos Humanos
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PanelSeleccionSede;