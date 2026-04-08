/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Interfaz de bienvenida y enrutamiento estratégico (Landing de acceso). Este componente actúa como un distribuidor de tráfico que permite a los usuarios vinculados a RRHH elegir entre el portal de empleados (asistencias y marcaciones) o el panel administrativo general. Incluye validaciones de seguridad para redirigir a usuarios no autorizados y presenta una estética visual coherente con la identidad de marca del sistema.
*/
import React, { useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { useNavigate } from "react-router-dom";
import { logo } from "../../images/svg/index";
import { motion } from "framer-motion";
import img_hammerxsoft from "../../images/staff/hammerxsoft5.png";

const RedireccionPagina = () => {
  const { vinculadarrhh } = useAuth();
  const navegar = useNavigate();

  useEffect(() => {
    if (!vinculadarrhh) {
      navegar("/dashboard");
    }
  }, [vinculadarrhh, navegar]);

  if (!vinculadarrhh) {
    return null;
  }

  const opciones = [
    {
      id: "acceso-rrhh",
      titulo: "Ir a portal de acceso",
      descripcion: "Marcaciones e historial de asistencias",
      ruta: "/dashboard-rrhh",
      borde: "hover:border-orange-300",
      foco: "group-hover:text-orange-700",
      barra: "from-orange-300 to-orange-500",
    },
    {
      id: "dashboard-admin",
      titulo: "Ir a Dashboard",
      descripcion: "Ver panel administrativo",
      ruta: "/dashboard",
      borde: "hover:border-slate-400",
      foco: "group-hover:text-slate-800",
      barra: "from-slate-300 to-slate-500",
    },
  ];

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
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,140,0,0.16),transparent_38%)]" />

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
        <div className="relative px-8 md:px-10 pt-10 pb-9 text-center flex-shrink-0 overflow-hidden bg-gradient-to-br from-orange-800 via-orange-900 to-orange-600 border-b border-white/10">
          <div className="absolute -top-14 -left-10 h-36 w-36 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-orange-200/10 blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex justify-center"
          >
            <img src={logo} alt="Logo HammerX" className="w-96" />
          </motion.div>

          <p className="relative text-[11px] uppercase tracking-[0.35em] text-orange-100/80 font-semibold">
            Acceso al sistema
          </p>

          <h1 className="relative mt-2 text-5xl md:text-6xl leading-none uppercase text-white font-bignoodle tracking-[0.06em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
            Bienvenido
          </h1>

          <p className="relative text-orange-100/90 text-sm md:text-[15px] mt-3 font-medium">
            Seleccioná el panel al que querés ingresar
          </p>
        </div>

        <div className="px-7 md:px-8 py-8 md:py-9 flex-grow flex flex-col justify-center bg-gradient-to-b from-white/70 to-slate-50/90">
          <div className="space-y-3.5">
            {opciones.map((opcion, index) => (
              <motion.button
                key={opcion.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.08 } }}
                whileHover={{ scale: 1.012 }}
                whileTap={{ scale: 0.988 }}
                type="button"
                onClick={() => navegar(opcion.ruta)}
                className={`group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white/95 px-5 py-5 text-left transition-all duration-300 shadow-[0_6px_18px_rgba(15,23,42,0.06)] ${opcion.borde}`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[linear-gradient(135deg,rgba(251,146,60,0.08),transparent_45%)]" />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50">
                      <div className={`h-3 w-3 rounded-full bg-gradient-to-br ${opcion.barra}`} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                        Disponible
                      </p>

                      <h3
                        className={`mt-1 truncate text-[15px] md:text-base font-bold uppercase tracking-[0.08em] text-slate-800 transition-colors ${opcion.foco}`}
                      >
                        {opcion.titulo}
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        {opcion.descripcion}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-950/85 border-t border-slate-800 text-center mt-auto">
          <p className="text-[10px] md:text-[11px] text-slate-300 uppercase tracking-[0.3em] font-semibold">
            Sistema de Gestión de Recursos Humanos
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RedireccionPagina;