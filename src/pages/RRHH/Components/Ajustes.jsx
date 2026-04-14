/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de feedback visual para estados de espera (loading). Ofrece tres variantes: pantalla completa (fullscreen) para cargas iniciales, un modo compacto para botones o listas, y un modo estándar para secciones internas, permitiendo personalizar mensajes y submensajes para mejorar la experiencia del usuario.
*/
import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUniversity,
  FaPlus,
  FaTrash,
  FaStar,
  FaRegStar,
  FaEdit,
  FaCamera,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { useAuth } from "../../../AuthContext";
import ReconocimientoFacial from "./Empleados/ReconocimientoFacial";

const Ajustes = ({ volverAtras }) => {
  const usuarioAuth = useAuth();

  const idUsuario = useMemo(() => {
    return Number(usuarioAuth?.userId);
  }, [usuarioAuth?.userId]);

  // ================= ESTADO DE CUENTAS BANCARIAS =================
  const [cuentas, setCuentas] = useState([]);
  const [mostrarTodasCuentas, setMostrarTodasCuentas] = useState(false); 

  const [mostrarFormCuenta, setMostrarFormCuenta] = useState(false);
  const formContainerRef = useRef(null); 

  const [nuevaCuenta, setNuevaCuenta] = useState({
    banco: "",
    cbu: "",
    alias: "",
    titular_nombre: "",
    titular_apellido: "",
    titular_dni: "",
  });
  const [mostrarReconocimiento, setMostrarReconocimiento] = useState(false);
  const [guardandoCuenta, setGuardandoCuenta] = useState(false);
  const [cargandoCuentas, setCargandoCuentas] = useState(false);
  const [errorCuenta, setErrorCuenta] = useState("");
  const [okCuenta, setOkCuenta] = useState("");
  const [cuentaEditandoId, setCuentaEditandoId] = useState(null);
  const [cuentaEditando, setCuentaEditando] = useState({
    banco: "",
    cbu: "",
    alias: "",
    titular_nombre: "",
    titular_apellido: "",
    titular_dni: "",
  });

  // ================= LOGICA CUENTAS =================
  const handleNuevaCuentaChange = (e) => {
    setNuevaCuenta({ ...nuevaCuenta, [e.target.name]: e.target.value });
  };

  const mapearCuentaDesdeBackend = (cuenta) => {
    return {
      id: cuenta?.id,
      banco: cuenta?.banco || "",
      cbu: cuenta?.cbu || "",
      alias: cuenta?.alias || "",
      titular_nombre: cuenta?.titular_nombre || "",
      titular_apellido: cuenta?.titular_apellido || "",
      titular_dni: cuenta?.titular_dni || "",
      titular:
        `${cuenta?.titular_nombre || ""} ${cuenta?.titular_apellido || ""}`.trim(),
      dni: cuenta?.titular_dni || "",
      es_principal: Number(cuenta?.es_principal) === 1,
    };
  };

  const cargarCuentasUsuario = async () => {
    if (!idUsuario) return;

    setCargandoCuentas(true);
    setErrorCuenta("");

    try {
      const respuesta = await axios.get(
        `http://localhost:8080/rrhh/cuentas-bancarias?idUsuario=${idUsuario}`
      );
      const data = respuesta?.data;
      const cuentasBackend = Array.isArray(data) ? data : data ? [data] : [];
      setCuentas(cuentasBackend.map(mapearCuentaDesdeBackend));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) {
        setCuentas([]);
      } else {
        const mensaje = error?.response?.data?.mensajeError;
        setErrorCuenta(
          mensaje || "No se pudieron obtener las cuentas bancarias."
        );
      }
    } finally {
      setCargandoCuentas(false);
    }
  };

  useEffect(() => {
    cargarCuentasUsuario();
  }, [idUsuario]);

  const abrirFormularioYEnfocar = () => {
    setMostrarFormCuenta(true);
    setTimeout(() => {
      formContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 150);
  };

  const guardarCuenta = async () => {
    setErrorCuenta("");
    setOkCuenta("");

    if (!idUsuario) {
      setErrorCuenta("No se pudo identificar el usuario logueado.");
      return;
    }

    if (!nuevaCuenta.banco || !/^\d{22}$/.test(nuevaCuenta.cbu)) {
      setErrorCuenta("Completá banco y CBU válido de 22 dígitos.");
      return;
    }

    const payload = {
      usuario_id: idUsuario,
      banco: nuevaCuenta.banco.trim(),
      cbu: nuevaCuenta.cbu.trim(),
      alias: nuevaCuenta.alias.trim() || null,
      titular_nombre: nuevaCuenta.titular_nombre.trim(),
      titular_apellido: nuevaCuenta.titular_apellido.trim(),
      titular_dni: nuevaCuenta.titular_dni.trim(),
      es_principal: cuentas.length === 0 ? 1 : 0,
      activa: 1,
    };

    try {
      setGuardandoCuenta(true);
      const respuesta = await axios.post(
        "http://localhost:8080/rrhh/cuentas-bancarias",
        payload
      );

      const cuentaGuardada = mapearCuentaDesdeBackend({
        ...payload,
        id: respuesta?.data?.id,
      });
      setCuentas((prev) => [...prev, cuentaGuardada]);
      setNuevaCuenta({
        banco: "",
        cbu: "",
        alias: "",
        titular_nombre: "",
        titular_apellido: "",
        titular_dni: "",
      });
      setOkCuenta("Cuenta bancaria guardada correctamente.");
      setMostrarFormCuenta(false);
    } catch (error) {
      const mensaje =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.errores?.[0];
      setErrorCuenta(mensaje || "No se pudo guardar la cuenta bancaria.");
    } finally {
      setGuardandoCuenta(false);
    }
  };

  const limpiarFormularioCuenta = () => {
    setNuevaCuenta({
      banco: "",
      cbu: "",
      alias: "",
      titular_nombre: "",
      titular_apellido: "",
      titular_dni: "",
    });
    setMostrarFormCuenta(false);
    setErrorCuenta("");
  };

  const marcarPrincipal = (id) => {
    const ejecutar = async () => {
      try {
        setErrorCuenta("");
        await Promise.all(
          cuentas.map((cuenta) =>
            axios.put(
              `http://localhost:8080/rrhh/cuentas-bancarias/${cuenta.id}`,
              {
                es_principal: cuenta.id === id ? 1 : 0,
              }
            )
          )
        );
        setCuentas((prev) =>
          prev.map((c) => ({
            ...c,
            es_principal: c.id === id,
          }))
        );
        setOkCuenta("Cuenta principal actualizada.");
        cargarCuentasUsuario();
      } catch (error) {
        const mensaje = error?.response?.data?.mensajeError;
        setErrorCuenta(mensaje || "No se pudo actualizar la cuenta principal.");
      }
    };

    ejecutar();
  };

  const eliminarCuenta = async (cuenta) => {
    try {
      if (cuenta.es_principal) {
        Swal.fire({
          icon: "warning",
          title: "Cuenta principal",
          text: "No se puede eliminar la cuenta bancaria principal.",
          confirmButtonText: "Entendido",
        });
        return;
      }

      const confirmacion = await Swal.fire({
        title: "¿Eliminar cuenta?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (!confirmacion.isConfirmed) return;

      const id = cuenta.id;

      setErrorCuenta("");

      await axios.delete(`http://localhost:8080/rrhh/cuentas-bancarias/${id}`);

      setCuentas((prev) => prev.filter((c) => c.id !== id));

      setOkCuenta("Cuenta eliminada correctamente.");
    } catch (error) {
      const mensaje = error?.response?.data?.mensajeError;
      setErrorCuenta(mensaje || "No se pudo eliminar la cuenta bancaria.");
    }
  };

  const iniciarEdicionCuenta = (cuenta) => {
    setCuentaEditandoId(cuenta.id);
    setCuentaEditando({
      banco: cuenta.banco || "",
      cbu: cuenta.cbu || "",
      alias: cuenta.alias || "",
      titular_nombre: cuenta.titular_nombre || "",
      titular_apellido: cuenta.titular_apellido || "",
      titular_dni: cuenta.titular_dni || "",
    });
  };

  const cancelarEdicionCuenta = () => {
    setCuentaEditandoId(null);
    setCuentaEditando({
      banco: "",
      cbu: "",
      alias: "",
      titular_nombre: "",
      titular_apellido: "",
      titular_dni: "",
    });
  };

  const handleCuentaEditandoChange = (e) => {
    setCuentaEditando((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const guardarEdicionCuenta = async () => {
    if (!cuentaEditandoId) return;

    try {
      setErrorCuenta("");
      await axios.put(
        `http://localhost:8080/rrhh/cuentas-bancarias/${cuentaEditandoId}`,
        {
          banco: cuentaEditando.banco,
          cbu: cuentaEditando.cbu,
          alias: cuentaEditando.alias,
          titular_nombre: cuentaEditando.titular_nombre,
          titular_apellido: cuentaEditando.titular_apellido,
          titular_dni: cuentaEditando.titular_dni,
        }
      );

      setCuentas((prev) =>
        prev.map((cuenta) =>
          cuenta.id === cuentaEditandoId
            ? {
                ...cuenta,
                ...cuentaEditando,
                titular:
                  `${cuentaEditando.titular_nombre} ${cuentaEditando.titular_apellido}`.trim(),
                dni: cuentaEditando.titular_dni,
              }
            : cuenta
        )
      );

      setOkCuenta("Cuenta actualizada correctamente.");
      cancelarEdicionCuenta();
    } catch (error) {
      const mensaje =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.errores?.[0];
      setErrorCuenta(mensaje || "No se pudo actualizar la cuenta bancaria.");
    }
  };

  const cuentaPrincipal = cuentas.find((c) => c.es_principal) || cuentas[0];
  const cuentasSecundarias = cuentas.filter(
    (c) => c.id !== cuentaPrincipal?.id
  );

  const TarjetaCuenta = ({ cuenta, isPrincipalVisible }) => (
    <div
      key={cuenta.id}
      className={`relative p-3 md:p-4 rounded-xl border transition-all group shadow-sm hover:shadow-md
      ${
        cuenta.es_principal
          ? "bg-green-50 border-green-300"
          : "bg-white border-gray-200"
      }
    `}
    >
      {cuentaEditandoId === cuenta.id ? (
        <div className="space-y-2">
          <h4 className="font-bold text-gray-700 text-sm mb-1 border-b pb-1">
            Editando cuenta
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              name="banco"
              placeholder="Banco"
              value={cuentaEditando.banco}
              onChange={handleCuentaEditandoChange}
              className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="cbu"
              placeholder="CBU / CVU"
              value={cuentaEditando.cbu}
              onChange={handleCuentaEditandoChange}
              maxLength={22}
              className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="alias"
              placeholder="Alias"
              value={cuentaEditando.alias}
              onChange={handleCuentaEditandoChange}
              className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="titular_dni"
              placeholder="DNI Titular"
              value={cuentaEditando.titular_dni}
              onChange={handleCuentaEditandoChange}
              className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="titular_nombre"
              placeholder="Nombre"
              value={cuentaEditando.titular_nombre}
              onChange={handleCuentaEditandoChange}
              className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              name="titular_apellido"
              placeholder="Apellido"
              value={cuentaEditando.titular_apellido}
              onChange={handleCuentaEditandoChange}
              className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-2 border-t">
            <button
              onClick={cancelarEdicionCuenta}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={guardarEdicionCuenta}
              className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-sm"
            >
              Guardar cambios
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-bold text-gray-900 text-base uppercase flex items-center gap-2">
                {cuenta.banco}
                {cuenta.es_principal && (
                  <span className="text-[10px] font-bold text-green-800 bg-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FaStar className="text-green-700" /> PRINCIPAL
                  </span>
                )}
              </h4>
              <p className="font-mono text-gray-700 text-xs mt-1 p-1.5 bg-gray-100/50 rounded-md border border-gray-200 inline-block tracking-widest break-all">
                {cuenta.cbu}
              </p>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                <p className="text-gray-500 text-xs">
                  <span className="font-semibold text-gray-700">Alias:</span>{" "}
                  {cuenta.alias || "No definido"}
                </p>
                <p className="text-gray-500 text-xs">
                  <span className="font-semibold text-gray-700">Titular:</span>{" "}
                  {cuenta.titular || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 pt-2 border-t border-gray-100">
            {!cuenta.es_principal && (
              <button
                onClick={() => marcarPrincipal(cuenta.id)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg font-medium text-xs hover:bg-yellow-100 transition-colors border border-yellow-200"
              >
                <FaRegStar /> Hacer principal
              </button>
            )}
            <button
              onClick={() => iniciarEdicionCuenta(cuenta)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium text-xs hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <FaEdit /> Editar
            </button>
            <button
              onClick={() => eliminarCuenta(cuenta)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 py-1.5 bg-red-50 text-red-700 rounded-lg font-medium text-xs hover:bg-red-100 transition-colors border border-red-200"
            >
              <FaTrash /> Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {volverAtras && (
        <div className="mb-3">
          <button
            onClick={volverAtras}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-gray-200 rounded-lg text-gray-700 text-sm font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
        </div>
      )}
      <div className="animate-fade-in-up font-messina pb-10">
        <div className="mb-4">
          <h2 className="text-2xl md:text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaUniversity className="text-gray-600" />
            CONFIGURACIÓN DE PERFIL
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gestioná tus métodos de cobro.
          </p>
        </div>

        <div className="mx-auto">
          {/* SECCIÓN CUENTAS BANCARIAS */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-700 text-base flex items-center gap-2">
                <FaUniversity className="text-green-600" /> Mis Cuentas Bancarias
              </h3>
              <button
                onClick={
                  mostrarFormCuenta
                    ? limpiarFormularioCuenta
                    : abrirFormularioYEnfocar
                }
                className="w-full sm:w-auto text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-medium shadow-sm"
              >
                {mostrarFormCuenta ? (
                  "Cancelar"
                ) : (
                  <>
                    <FaPlus /> Nueva Cuenta
                  </>
                )}
              </button>
            </div>

            <div ref={formContainerRef}>
              {mostrarFormCuenta && (
                <div className="bg-gray-50 p-3 md:p-4 rounded-xl mb-4 border border-gray-200 shadow-inner animate-fade-in">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaPlus className="text-green-600 text-xs" /> Agregar nueva cuenta
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    <input
                      type="text"
                      name="banco"
                      placeholder="Banco (Ej: Galicia)"
                      value={nuevaCuenta.banco}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2 w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="cbu"
                      placeholder="CBU / CVU (22 dígitos)"
                      maxLength={22}
                      value={nuevaCuenta.cbu}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2 w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="alias"
                      placeholder="Alias"
                      value={nuevaCuenta.alias}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="titular_dni"
                      placeholder="DNI titular"
                      value={nuevaCuenta.titular_dni}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="titular_nombre"
                      placeholder="Nombre titular"
                      value={nuevaCuenta.titular_nombre}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                    <input
                      type="text"
                      name="titular_apellido"
                      placeholder="Apellido titular"
                      value={nuevaCuenta.titular_apellido}
                      onChange={handleNuevaCuentaChange}
                      className="p-2 rounded-lg border border-gray-300 text-sm w-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                    />
                  </div>
                  {errorCuenta && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-1.5 rounded-lg text-xs mb-3">
                      {errorCuenta}
                    </div>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
                    <button
                      onClick={limpiarFormularioCuenta}
                      className="w-full sm:w-auto text-gray-600 bg-white border border-gray-300 text-xs px-4 py-1.5 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={guardarCuenta}
                      disabled={guardandoCuenta}
                      className="w-full sm:w-auto bg-green-600 text-white text-xs px-4 py-1.5 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed font-medium shadow-sm transition-colors"
                    >
                      {guardandoCuenta ? "Guardando..." : "Guardar cuenta"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {okCuenta && (
              <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-800 font-medium">
                {okCuenta}
              </div>
            )}

            {cargandoCuentas && (
              <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600 animate-pulse">
                Cargando cuentas...
              </div>
            )}

            <div className="space-y-3">
              {cuentaPrincipal && <TarjetaCuenta cuenta={cuentaPrincipal} />}

              {cuentasSecundarias.length > 0 && (
                <div className="pt-1">
                  <button
                    onClick={() => setMostrarTodasCuentas(!mostrarTodasCuentas)}
                    className="w-full py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    {mostrarTodasCuentas ? (
                      <>
                        <FaChevronUp /> Ocultar cuentas adicionales
                      </>
                    ) : (
                      <>
                        <FaChevronDown /> Ver {cuentasSecundarias.length} cuenta
                        {cuentasSecundarias.length > 1 ? "s" : ""} adicional
                        {cuentasSecundarias.length > 1 ? "es" : ""}
                      </>
                    )}
                  </button>
                </div>
              )}

              {mostrarTodasCuentas &&
                cuentasSecundarias.map((cuenta) => (
                  <div key={cuenta.id} className="animate-fade-in">
                    <TarjetaCuenta cuenta={cuenta} />
                  </div>
                ))}

              {!cargandoCuentas && cuentas.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
                  <FaUniversity className="text-3xl text-gray-300 mx-auto mb-2" />
                  <p className="font-medium text-sm text-gray-600">
                    Aún no tenés cuentas cargadas
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN RECONOCIMIENTO FACIAL */}
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col mt-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-700 text-base flex items-center gap-2">
                <FaCamera className="text-blue-600" /> Seguridad Biométrica
              </h3>
              <button
                onClick={() => setMostrarReconocimiento(!mostrarReconocimiento)}
                className="w-full sm:w-auto text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition flex items-center justify-center gap-2 font-medium"
              >
                {mostrarReconocimiento
                  ? "Ocultar panel"
                  : "Registrar / Actualizar Rostro"}
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-3 mt-1">
              Registra tus credenciales faciales para poder fichar tu asistencia.
            </p>

            {mostrarReconocimiento && (
              <div className="border border-gray-200 rounded-xl p-3 bg-gray-50 animate-fade-in">
                <ReconocimientoFacial origen="registrar" mostrarReconocimiento={() => setMostrarReconocimiento(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ajustes;