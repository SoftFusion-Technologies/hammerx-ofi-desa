/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de flujo de configuración inicial obligatorio para nuevos usuarios de RRHH. Gestiona secuencialmente la carga de datos bancarios para el cobro de haberes y el registro biométrico facial inicial. Incluye validaciones de seguridad para asegurar que el usuario esté correctamente vinculado al sistema antes de permitirle operar.
*/

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  FaIdCard,
  FaUniversity,
  FaUser,
  FaCheckCircle,
  FaArrowRight,
} from "react-icons/fa";
import { IoExit } from "react-icons/io5";
import { Link } from "react-router-dom";
import ReconocimientoFacial from "../Empleados/Reconocimiento-Facial/ReconocimientoFacial";
import img_hammerxsoft from "../../../../images/staff/hammerxsoft4.png";
import { useAuth } from "../../../../AuthContext";

const ConfiguracionInicial = ({
  nombreUsuario,
  idUsuario,
  onContinuar,
  noTieneCuenta,
  noTieneCredencialesFaciales,
}) => {
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");
  const [cuentaGuardadaExito, setCuentaGuardadaExito] = useState(false);
  const { vinculadarrhh } = useAuth();

  const [formulario, setFormulario] = useState({
    banco: "",
    cbu: "",
    alias: "",
    titular_nombre: "",
    titular_apellido: "",
    titular_dni: "",
    es_principal: true,
    activa: true,
  });

  const nombreUsuarioMostrado = useMemo(() => {
    const normalizado = String(nombreUsuario || "")
      .replace(/\bundefined\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    return normalizado || "Usuario";
  }, [nombreUsuario]);

  const camposCompletos = useMemo(() => {
    return (
      formulario.banco.trim() &&
      formulario.cbu.trim().length === 22 &&
      formulario.titular_nombre.trim() &&
      formulario.titular_apellido.trim() &&
      formulario.titular_dni.trim()
    );
  }, [formulario]);

  const manejarCambio = (evento) => {
    const { name, value, type, checked } = evento.target;
    const valor = type === "checkbox" ? checked : value;

    setFormulario((previo) => ({
      ...previo,
      [name]: valor,
    }));

    if (errores[name]) {
      setErrores((previo) => ({ ...previo, [name]: "" }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formulario.banco.trim()) nuevosErrores.banco = "Indicá el banco.";
    if (!/^\d{22}$/.test(formulario.cbu.trim())) {
      nuevosErrores.cbu = "El CBU debe tener 22 números.";
    }
    if (!formulario.titular_nombre.trim()) {
      nuevosErrores.titular_nombre = "Ingresá el nombre del titular.";
    }
    if (!formulario.titular_apellido.trim()) {
      nuevosErrores.titular_apellido = "Ingresá el apellido del titular.";
    }
    if (!/^\d{7,10}$/.test(formulario.titular_dni.trim())) {
      nuevosErrores.titular_dni = "Ingresá un DNI válido (solo números).";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setErrorServidor("");
    setMensajeExito("");

    if (!validar()) return;

    const payload = {
      usuario_id: idUsuario,
      banco: formulario.banco.trim(),
      cbu: formulario.cbu.trim(),
      alias: formulario.alias.trim() || null,
      titular_nombre: formulario.titular_nombre.trim(),
      titular_apellido: formulario.titular_apellido.trim(),
      titular_dni: formulario.titular_dni.trim(),
      es_principal: formulario.es_principal ? 1 : 0,
      activa: formulario.activa ? 1 : 0,
    };

    try {
      setGuardando(true);
      const respuesta = await axios.post(
        "http://localhost:8080/rrhh/cuentas-bancarias",
        payload,
      );

      setMensajeExito("Cuenta bancaria guardada correctamente.");
      setCuentaGuardadaExito(true);

      if (!noTieneCredencialesFaciales && onContinuar) {
        onContinuar(respuesta?.data);
      }
    } catch (error) {
      const mensajeBackend = error?.response?.data?.mensajeError;
      const primerError = error?.response?.data?.errores?.[0];

      setErrorServidor(
        mensajeBackend ||
          primerError ||
          "No pudimos guardar la cuenta bancaria. Intentá nuevamente.",
      );
    } finally {
      setGuardando(false);
    }
  };

  const mostrarFormularioBanco = noTieneCuenta && !cuentaGuardadaExito;
  const mostrarReconocimientoFacial =
    noTieneCredencialesFaciales && (!noTieneCuenta || cuentaGuardadaExito);

  const clasesInputBase =
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[14px] text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition-all duration-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-200/60";

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden font-messina"
      style={{
        backgroundImage: `url(${img_hammerxsoft})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,146,60,0.22),transparent_35%)]" />
      {!vinculadarrhh ? (
        <div className="relative z-10 min-h-screen w-full flex items-center justify-center px-2 py-2 sm:px-4 sm:py-4 md:p-4">
          <div className="mx-auto w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden rounded-[1.5rem] md:rounded-[1.8rem] border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.40)] p-6 text-center"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Acceso no autorizado
              </h2>
              <p className="text-white/90 mb-6">
                No estás vinculado al módulo de RRHH. Por favor, contactá a tu
                administrador para obtener acceso.
              </p>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  Volver al dashboard
                  <IoExit />
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 min-h-screen w-full px-2 py-2 sm:px-4 sm:py-4 md:flex md:items-center md:justify-center md:p-4">
          <div className="mx-auto w-full max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="overflow-hidden rounded-[1.5rem] md:rounded-[1.8rem] border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.40)]"
            >
              <div className="relative overflow-hidden bg-gradient-to-br from-orange-800 via-orange-700 to-orange-600 border-b border-white/10 px-4 pt-4 pb-3 sm:px-5 sm:pt-5 sm:pb-4 md:px-6 md:pt-5 md:pb-4">
                <div className="absolute -top-16 -left-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-orange-300/10 blur-2xl" />

                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-orange-100/80 font-semibold">
                    Configuración inicial RRHH
                  </p>

                  <h1 className="mt-1 text-[1.9rem] leading-none text-white font-bignoodle sm:text-[2.4rem] md:text-[2.6rem]">
                    {mostrarFormularioBanco
                      ? "Cargá tu cuenta bancaria"
                      : "Registrá tu rostro"}
                  </h1>

                  <p className="mt-1.5 max-w-xl text-[13px] leading-snug text-orange-50/90 sm:text-[14px]">
                    {nombreUsuarioMostrado}, completá tu información para
                    finalizar la configuración inicial del sistema.
                  </p>
                </div>
              </div>

              {mostrarFormularioBanco ? (
                <form
                  onSubmit={manejarEnvio}
                  className="bg-white px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5"
                >
                  <div className="mb-3 rounded-xl border border-orange-200/70 bg-gradient-to-r from-orange-50 to-orange-100/70 p-3 shadow-sm">
                    <p className="text-[13px] font-semibold text-orange-900">
                      Configuración de cuenta bancaria
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-orange-800/90 sm:text-[13px]">
                      Esta cuenta se utilizará para liquidaciones y pagos de
                      RRHH.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Banco *
                      </label>
                      <div className="relative">
                        <FaUniversity className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                          name="banco"
                          value={formulario.banco}
                          onChange={manejarCambio}
                          placeholder="Ej: Banco Nación"
                          className={`${clasesInputBase} pl-9`}
                        />
                      </div>
                      {errores.banco && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errores.banco}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Alias (opcional)
                      </label>
                      <input
                        name="alias"
                        value={formulario.alias}
                        onChange={manejarCambio}
                        placeholder="Ej: sueldo.hammer.sergio"
                        className={clasesInputBase}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        CBU (22 dígitos) *
                      </label>
                      <input
                        name="cbu"
                        value={formulario.cbu}
                        onChange={manejarCambio}
                        inputMode="numeric"
                        maxLength={22}
                        placeholder="0000000000000000000000"
                        className={clasesInputBase}
                      />
                      {errores.cbu && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errores.cbu}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Nombre titular *
                      </label>
                      <div className="relative">
                        <FaUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                          name="titular_nombre"
                          value={formulario.titular_nombre}
                          onChange={manejarCambio}
                          placeholder="Nombre"
                          className={`${clasesInputBase} pl-9`}
                        />
                      </div>
                      {errores.titular_nombre && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errores.titular_nombre}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Apellido titular *
                      </label>
                      <input
                        name="titular_apellido"
                        value={formulario.titular_apellido}
                        onChange={manejarCambio}
                        placeholder="Apellido"
                        className={clasesInputBase}
                      />
                      {errores.titular_apellido && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errores.titular_apellido}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        DNI titular *
                      </label>
                      <div className="relative">
                        <FaIdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                        <input
                          name="titular_dni"
                          value={formulario.titular_dni}
                          onChange={manejarCambio}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Solo números"
                          className={`${clasesInputBase} pl-9`}
                        />
                      </div>
                      {errores.titular_dni && (
                        <p className="mt-1 text-[11px] font-medium text-red-500">
                          {errores.titular_dni}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {errorServidor && (
                      <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[13px] text-red-700">
                        {errorServidor}
                      </div>
                    )}

                    {mensajeExito && (
                      <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-[13px] text-green-700">
                        {mensajeExito}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/90 p-2.5">
                    <div
                      className={`flex items-start gap-2.5 rounded-lg p-2.5 text-[13px] transition-all ${
                        camposCompletos
                          ? "bg-green-50 text-green-700"
                          : "bg-white text-slate-600"
                      }`}
                    >
                      <FaCheckCircle
                        className={`mt-0.5 shrink-0 text-sm ${
                          camposCompletos ? "text-green-500" : "text-slate-300"
                        }`}
                      />
                      <span className="font-medium leading-snug">
                        {camposCompletos
                          ? "Formulario completo para continuar."
                          : "Completá todos los campos obligatorios para continuar."}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2.5 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link to="/dashboard" className="w-full sm:w-auto">
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
                      >
                        Volver al dashboard
                        <IoExit />
                      </motion.button>
                    </Link>

                    <motion.button
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      type="submit"
                      disabled={guardando}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-800 via-orange-700 to-orange-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(194,65,12,0.30)] transition-all hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {guardando ? "Guardando..." : "Guardar y continuar"}
                      <FaArrowRight />
                    </motion.button>
                  </div>
                </form>
              ) : mostrarReconocimientoFacial ? (
                <div className="bg-white p-2.5 sm:p-4 md:p-4">
                  <div className="mb-3 rounded-xl border border-orange-200/70 bg-gradient-to-r from-orange-50 to-orange-100/70 p-3">
                    <p className="text-[13px] font-semibold text-orange-900">
                      Validación facial
                    </p>
                    <p className="mt-0.5 text-[12px] leading-snug text-orange-800/90 sm:text-[13px]">
                      Registrá tu rostro para completar la configuración inicial
                      del sistema.
                    </p>
                  </div>
                  <ReconocimientoFacial
                    origen={"registrar"}
                    onContinuar={onContinuar}
                  />
                  <motion.div className="">
                    <Link to="/dashboard" className="w-full">
                      <motion.button
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.985 }}
                        type="button"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 sm:w-auto"
                      >
                        Volver al dashboard
                        <IoExit />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>
              ) : (
                onContinuar && onContinuar()
              )}
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracionInicial;
