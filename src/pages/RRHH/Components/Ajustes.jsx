/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de feedback visual para estados de espera (loading). Ofrece tres variantes: pantalla completa (fullscreen) para cargas iniciales, un modo compacto para botones o listas, y un modo estándar para secciones internas, permitiendo personalizar mensajes y submensajes para mejorar la experiencia del usuario.
*/
import React, { useEffect, useMemo, useState } from "react";
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
  FaArrowLeft
} from "react-icons/fa";
import { useAuth } from "../../../AuthContext";
import ReconocimientoFacial from "./Empleados/ReconocimientoFacial";

const Ajustes = ({volverAtras}) => {
  const usuarioAuth = useAuth();

  const idUsuario = useMemo(() => {
    return Number(usuarioAuth?.userId);
  }, [usuarioAuth?.userId]);

  // ================= ESTADO DE CUENTAS BANCARIAS =================
  const [cuentas, setCuentas] = useState([]);

  const [mostrarFormCuenta, setMostrarFormCuenta] = useState(false);
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
        `http://localhost:8080/rrhh/cuentas-bancarias?idUsuario=${idUsuario}`,
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
          mensaje || "No se pudieron obtener las cuentas bancarias.",
        );
      }
    } finally {
      setCargandoCuentas(false);
    }
  };

  useEffect(() => {
    cargarCuentasUsuario();
  }, [idUsuario]);

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
        payload,
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
              },
            ),
          ),
        );
        setCuentas((prev) =>
          prev.map((c) => ({
            ...c,
            es_principal: c.id === id,
          })),
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
        },
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
            : cuenta,
        ),
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

  return (
    <>
      {volverAtras && (
        <div className="mb-4">
          <button
            onClick={volverAtras}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-orange-500 hover:text-orange-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
        </div>
      )}
      <div className="animate-fade-in-up font-messina pb-20">
        <div className="mb-6">
          <h2 className="text-3xl font-bignoodle text-gray-800 flex items-center gap-2">
            <FaUniversity className="text-gray-600" />
            CONFIGURACIÓN DE PERFIL
          </h2>
          <p className="text-sm text-gray-500">
            Gestiona tus métodos de cobro de forma segura.
          </p>
        </div>

        <div className="mx-auto">
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                <FaUniversity className="text-green-600" /> Mis Cuentas
                Bancarias
              </h3>
              <button
                onClick={() => setMostrarFormCuenta(!mostrarFormCuenta)}
                className="text-xs bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-1"
              >
                <FaPlus /> Nueva Cuenta
              </button>
            </div>

            {mostrarFormCuenta && (
              <div className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-200 animate-fade-in">
                <h4 className="text-sm font-bold text-gray-600 mb-3">
                  Agregar nueva cuenta
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    name="banco"
                    placeholder="Banco (Ej: Galicia)"
                    value={nuevaCuenta.banco}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2"
                  />
                  <input
                    type="text"
                    name="cbu"
                    placeholder="CBU / CVU (22 dígitos)"
                    maxLength={22}
                    value={nuevaCuenta.cbu}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2"
                  />
                  <input
                    type="text"
                    name="alias"
                    placeholder="Alias"
                    value={nuevaCuenta.alias}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm"
                  />
                  <input
                    type="text"
                    name="titular_nombre"
                    placeholder="Nombre titular"
                    value={nuevaCuenta.titular_nombre}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm"
                  />
                  <input
                    type="text"
                    name="titular_apellido"
                    placeholder="Apellido titular"
                    value={nuevaCuenta.titular_apellido}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm"
                  />
                  <input
                    type="text"
                    name="titular_dni"
                    placeholder="DNI titular"
                    value={nuevaCuenta.titular_dni}
                    onChange={handleNuevaCuentaChange}
                    className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2"
                  />
                </div>
                {errorCuenta && (
                  <p className="text-xs text-red-600 mb-2">{errorCuenta}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={limpiarFormularioCuenta}
                    className="text-gray-500 text-sm px-3 py-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarCuenta}
                    disabled={guardandoCuenta}
                    className="bg-green-600 text-white text-sm px-4 py-1 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {guardandoCuenta ? "Guardando..." : "Guardar"}
                  </button>
                </div>
              </div>
            )}

            {okCuenta && (
              <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                {okCuenta}
              </div>
            )}

            {cargandoCuentas && (
              <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                Cargando cuentas...
              </div>
            )}

            <div className="space-y-3 flex-1">
              {cuentas.map((cuenta) => (
                <div
                  key={cuenta.id}
                  className={`relative p-4 rounded-2xl border transition-all group hover:shadow-md
                  ${cuenta.es_principal ? "bg-green-50 border-green-200" : "bg-white border-gray-100"}
                `}
                >
                  {cuentaEditandoId === cuenta.id ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          name="banco"
                          value={cuentaEditando.banco}
                          onChange={handleCuentaEditandoChange}
                          className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2"
                        />
                        <input
                          name="cbu"
                          value={cuentaEditando.cbu}
                          onChange={handleCuentaEditandoChange}
                          maxLength={22}
                          className="p-2 rounded-lg border border-gray-300 text-sm md:col-span-2"
                        />
                        <input
                          name="alias"
                          value={cuentaEditando.alias}
                          onChange={handleCuentaEditandoChange}
                          className="p-2 rounded-lg border border-gray-300 text-sm"
                        />
                        <input
                          name="titular_nombre"
                          value={cuentaEditando.titular_nombre}
                          onChange={handleCuentaEditandoChange}
                          className="p-2 rounded-lg border border-gray-300 text-sm"
                        />
                        <input
                          name="titular_apellido"
                          value={cuentaEditando.titular_apellido}
                          onChange={handleCuentaEditandoChange}
                          className="p-2 rounded-lg border border-gray-300 text-sm"
                        />
                        <input
                          name="titular_dni"
                          value={cuentaEditando.titular_dni}
                          onChange={handleCuentaEditandoChange}
                          className="p-2 rounded-lg border border-gray-300 text-sm"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={cancelarEdicionCuenta}
                          className="text-xs px-3 py-1 rounded-lg border border-gray-200 text-gray-600"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={guardarEdicionCuenta}
                          className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white"
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 uppercase text-sm">
                            {cuenta.banco}
                          </span>
                        </div>
                        <p className="font-mono text-gray-600 text-xs mt-1 tracking-wider">
                          {cuenta.cbu}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Alias: {cuenta.alias || "No definido"}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          Titular: {cuenta.titular || "—"}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => marcarPrincipal(cuenta.id)}
                          className={`text-lg transition-colors ${cuenta.es_principal ? "text-yellow-500" : "text-gray-300 hover:text-yellow-400"}`}
                          title="Marcar como principal"
                        >
                          {cuenta.es_principal ? <FaStar /> : <FaRegStar />}
                        </button>
                        <button
                          onClick={() => iniciarEdicionCuenta(cuenta)}
                          className="text-gray-300 hover:text-blue-500 transition-colors"
                          title="Editar cuenta"
                        >
                          <FaEdit className="text-sm" />
                        </button>
                        <button
                          onClick={() => eliminarCuenta(cuenta)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                          title="Eliminar cuenta"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </div>
                  )}
                  {cuenta.es_principal && (
                    <div className="absolute top-0 right-0 mt-2 mr-10">
                      <span className="text-[10px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                        PRINCIPAL
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {!cargandoCuentas && cuentas.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  Aún no tenés cuentas cargadas.
                </div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 h-full flex flex-col mt-6">
            <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-gray-700 text-lg flex items-center gap-2">
                <FaCamera className="text-blue-600" /> Seguridad Biometríca
              </h3>
              <button
                onClick={() => setMostrarReconocimiento(!mostrarReconocimiento)}
                className="text-xs bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition flex items-center gap-1"
              >
                {mostrarReconocimiento
                  ? "Ocultar panel"
                  : "Registrar / Actualizar Rostro"}
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Registra tus credenciales faciales para poder fichar tu asistencia
              de forma rápida y segura.
            </p>

            {mostrarReconocimiento && (
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 animate-fade-in">
                <ReconocimientoFacial origen="registrar" />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Ajustes;
