/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Panel central de RRHH para empleados y administradores. Se encarga de gestionar el fichaje con reconocimiento facial, avisar si te olvidaste de marcar la salida y permitir el reporte de novedades. También centraliza la vista de horarios, el historial de asistencia y todo el seguimiento de liquidaciones de sueldo de forma organizada.
*/
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  FaHistory,
  FaCog,
  FaUserCircle,
  FaSignOutAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaEdit,
  FaMapMarkerAlt,
  FaStoreAlt,
  FaTable,
} from "react-icons/fa";
import { IoNewspaperOutline } from "react-icons/io5";
import { FaFaceGrin } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import ModalNovedad from "../Modals/ModalNovedad";
import Liquidaciones from "../Components/Empleados/Liquidaciones";
import Horarios from "../Components/Empleados/Horarios";
import HorariosAlumnos from "../Components/RRHH/HorariosUsuarios";
import HistorialMarcas from "../Components/Empleados/HistorialMarcas";
import Ajustes from "../Components/Ajustes";
import ConfiguracionInicial from "../Components/ConfiguracionInicial";
import LiquidacionesUsuarios from "../Components/RRHH/LiquidacionesUsuarios";
import HistorialUsuarios from "../Components/RRHH/HistorialUsuarios";
import CalendarioHammer from "../Components/CalendarioHammer";
import { useAuth } from "../../../AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PanelSeleccionSede from "../Components/SedeSeleccionada";
import { useSedeUsers } from "../Context/SedeUsersContext";
import ReconocimientoFacial from "../Components/Empleados/ReconocimientoFacial";
import useModificarDatosPatch from "../hooks/modificarDatosPatch";
import Swal from "sweetalert2";
import Cargando from "../Components/Cargando";
import LiquidacionesPendientesUsuarios from "../Components/RRHH/LiquidacionesPendientesUsuarios";
import ConversacionesHistorial from "../Components/RRHH/ConversacionesHistorial";
import ConversacionesDetalle from "../Components/RRHH/ConversacionesDetalle";
import { esAdminRRHH } from "../Utils/AdminAutorizadosRRHH";
import useAgregarDatos from "../hooks/agregarDatos";
dayjs.extend(utc);
dayjs.extend(timezone);

const PanelPrincipalRRHH = () => {
  const usuarioAuth = useAuth();
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const { seleccionarSede, sedeSeleccionada } = useSedeUsers();
  const navigate = useNavigate();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioVariasSedes, setUsuarioVariasSedes] = useState(false);
  const [
    mostrarPanelConfiguracionInicial,
    setMostrarPanelConfiguracionInicial,
  ] = useState(false);
  const [noTieneCuenta, setNoTieneCuenta] = useState(false);
  const [noTieneCredencialesFaciales, setNoTieneCredencialesFaciales] =
    useState(false);
  const [mostrarPanelSeleccionSede, setMostrarPanelSeleccionSede] =
    useState(false);
  const [vistaActiva, setVistaActiva] = useState("Dashboard");
  const [
    cantidadNotificacionesMarcacionesPendientes,
    setCantidadNotificacionesMarcacionesPendientes,
  ] = useState(0);
  const [
    cantidadNotificacionesNovedadesPendientes,
    setCantidadNotificacionesNovedadesPendientes,
  ] = useState(0);
  const [marcajeFacialIncialPendiente, setMarcajeFacialInicialPendiente] =
    useState(null);
  const { modificarPatch, cargando, error, respuesta } =
    useModificarDatosPatch();
  const [horaActualNavbar, setHoraActualNavbar] = useState(dayjs());
  const {
    agregar,
    cargando: cargandoEnvio,
    error: errorEnvio,
  } = useAgregarDatos();
  const FechahoyArgentina = dayjs()
    .tz("America/Argentina/Buenos_Aires")
    .format("YYYY-MM-DD");

  useEffect(() => {
    const intervalo = setInterval(() => {
      setHoraActualNavbar(dayjs());
    }, 1000); // Antes estaba en 1000 * 60

    return () => clearInterval(intervalo);
  }, []);

  const { logout: cerrarSesion, userLevel } = useAuth();
  const esAdminAutorizadoRRHHH = esAdminRRHH(
    userLevel,
    usuarioAuth.userLevelAdmin,
  );

  const usuario = {
    nombre: usuarioAuth.name || "N/D",
    puesto: usuarioAuth.userLevel || "N/D",
    sucursal: sedeSeleccionada?.nombre || "Sin Sede",
  };

  const easingEntrada = [0.22, 1, 0.36, 1];

  const contenedorStagger = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.06,
      },
    },
  };

  const itemStagger = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.38,
        ease: easingEntrada,
      },
    },
  };

  // Función para manejar el cambio de vista al hacer clic en un botón del menú
  const manejarClick = async (accion) => {
    setVistaActiva(accion);
  };

  // Función para marcar la salida luego de un marcaje de entrada facial pendiente, con validaciones de horario y posible reporte de horas extra
  const manejarMarcajeDeSalida = async () => {
    try {
      if (!marcajeFacialIncialPendiente?.id) return;

      const respuestaHorarios = await axios.get(
        `http://localhost:8080/rrhh/horarios?usuario_id=${usuarioAuth.userId}&sede_id=${sedeSeleccionada?.id}`,
      );

      const horaActual = dayjs();
/*       const horaActual = dayjs()
        .set("hour", 22)
        .set("minute", 50)
        .set("second", 25); DESARROLLO */ 
      const horaActualSoloHora = horaActual.format("HH:mm:ss");

      const horarioOficial = respuestaHorarios.data.find(
        (h) => Number(h.id) === Number(marcajeFacialIncialPendiente.horario_id),
      );

      let payload = {
        hora_salida: horaActualSoloHora,
      };

      // SOLO SI HAY HORARIO Y HORA DE SALIDA PROGRAMADA
      if (horarioOficial?.hora_salida) {
        const fechaHoy = horaActual.format("YYYY-MM-DD");
        const salidaProgramada = dayjs(
          `${fechaHoy} ${horarioOficial.hora_salida}`,
        );
        const limiteTolerancia = salidaProgramada.add(30, "minute");

        // VALIDACIÓN DE SALIDA ANTICIPADA CON MOTIVO
        if (horaActual.isBefore(salidaProgramada)) {
          const minutosAntes = salidaProgramada.diff(horaActual, "minute");

          const resultadoAnticipado = await Swal.fire({
            title: "Salida anticipada",
            html: `Estás saliendo <b>${minutosAntes} minutos antes</b>.<br>Tu salida es a las ${horarioOficial.hora_salida}.`,
            icon: "warning",
            input: "text",
            inputLabel: "Motivo de la salida anticipada",
            inputPlaceholder: "Ej: No hay más alumnos, emergencia personal...",
            showCancelButton: true,
            confirmButtonText: "Confirmar y Salir",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#f97316",
            inputValidator: (valor) => {
              if (!valor) {
                return "¡Debes ingresar un motivo para poder salir!";
              }
            },
          });

          // Si cancela o cierra el modal, cortamos la ejecución
          if (!resultadoAnticipado.isConfirmed) return;

          // El motivo queda guardado en resultadoAnticipado.value
          const motivoSalida = resultadoAnticipado.value;
          const reporteExitoso = await manejarReportarNovedad(motivoSalida);

          // Si el reporte falló, podrías decidir si frenar o continuar
          if (!reporteExitoso) return;
        }

        // SI SE PASÓ MÁS DE 30 MIN
        if (horaActual.isAfter(limiteTolerancia)) {
          const result = await Swal.fire({
            title: "Marcación fuera de horario",
            html: `Tu salida era a las ${horarioOficial.hora_salida}.<br>¿Hiciste horas extra?`,
            icon: "warning",
            showDenyButton: true,
            confirmButtonText: "Sí, hice horas extra",
            denyButtonText: "No, me olvidé de marcar",
            confirmButtonColor: "#f97316",
            denyButtonColor: "#3b82f6",
          });

          if (result.isDismissed) return;

          payload = {
            ...payload,
            hizo_horas_extra: result.isConfirmed,
            comentarios: result.isConfirmed
              ? "Salida con horas extra reportadas por el usuario"
              : "Salida tardía sin horas extra reportadas por el usuario",
          };
        }
      }

      await axios.patch(
        `http://localhost:8080/rrhh/marcaciones/${marcajeFacialIncialPendiente.id}/salida`,
        payload,
      );

      setMarcajeFacialInicialPendiente(null);
      Swal.fire(
        "¡Salida exitosa!",
        "Tu asistencia ha sido registrada.",
        "success",
      );
    } catch (error) {
      console.error("Error al marcar salida:", error);
      Swal.fire("Error", "No se pudo registrar la salida.", "error");
    }
  };

  // Función para manejar el reporte de una novedad (salida anticipada, olvido de marcaje, etc) enviando un mensaje a RRHH con el motivo y la fecha de referencia
  const manejarReportarNovedad = async (motivoSalida) => {
    try {
      const cuerpoMensaje = {
        usuario_id: Number(usuarioAuth.userId),
        sede_id: sedeSeleccionada ? Number(sedeSeleccionada.id) : null,
        emisor_user_id: Number(usuarioAuth.userId),
        destinatario_tipo: "rrhh",
        tipo_mensaje: "aclaracion",
        mensaje: motivoSalida.toUpperCase().trim(),
        fecha_referencia: FechahoyArgentina,
      };

      await agregar("/rrhh-mensajes", cuerpoMensaje);

      return true; // Indicamos que salió bien
    } catch (error) {
      console.error("Error al reportar novedad:", error);
      Swal.fire("Error", "No se pudo reportar la novedad a RRHH.", "error");
      return false; // Indicamos que falló
    }
  };

  const handleLogout = () => {
    cerrarSesion();
    navigate("/login");
  };

  const rederigirDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    if (!usuarioAuth.userId) return;

    // Función para verificar la configuración inicial del usuario: sedes asignadas, cuenta creada y credenciales faciales, y mostrar los paneles correspondientes
    const verificarConfiguracionInicialUsuario = async () => {
      setCargandoInicial(true);
      try {
        setMostrarPanelSeleccionSede(false);
        setMostrarPanelConfiguracionInicial(false);

        const [responseSedes, responseCuenta, responseCredenciales] =
          await Promise.all([
            axios.get(
              `http://localhost:8080/rrhh/usuario-sede/usuario/${usuarioAuth.userId}`,
            ),
            axios.get(
              `http://localhost:8080/rrhh/verificar-cuenta-usuario?idUsuario=${usuarioAuth.userId}`,
            ),
            axios.get(
              `http://localhost:8080/rrhh/credenciales-faciales/usuario/${usuarioAuth.userId}`,
            ),
          ]);

        const sedesData = responseSedes?.data || [];
        const tieneVariasSedes = sedesData.length > 1;
        const tieneSedeUnica = sedesData.length === 1;

        setUsuarioVariasSedes(tieneVariasSedes);

        if (tieneSedeUnica) {
          seleccionarSede(sedesData[0]);
        }

        if (tieneVariasSedes) {
          setMostrarPanelSeleccionSede(true);
          return;
        }

        const tieneCuenta = responseCuenta?.data?.tieneCuenta === true;
        const tieneCredenciales = responseCredenciales?.data?.activo === true;

        if (usuarioAuth.userLevelAdmin === 1) {
          setMostrarPanelConfiguracionInicial(false);
        } else if (!tieneCuenta || !tieneCredenciales) {
          setNoTieneCuenta(!tieneCuenta);
          setNoTieneCredencialesFaciales(!tieneCredenciales);
          setMostrarPanelConfiguracionInicial(true);
        } else {
          setMostrarPanelConfiguracionInicial(false);
        }
      } catch (error) {
        console.error(
          "Error al verificar configuración inicial del usuario:",
          error,
        );
      } finally {
        setCargandoInicial(false);
      }
    };

    verificarConfiguracionInicialUsuario();
  }, [usuarioAuth.userId]);

  useEffect(() => {
    const obtenerNotificacionesPendientes = async () => {
      if (esAdminAutorizadoRRHHH) {
        try {
          const respuesta_cantidad_notificaciones_marcaciones = await axios.get(
            `http://localhost:8080/rrhh/marcaciones/cantidad/notificaciones/pendientes`,
          );
          const respuesta_cantidad_notificaciones_novedades = await axios.get(
            `http://localhost:8080/rrhh-conversaciones/cantidad/mensajes-no-leidos`,
          );
          setCantidadNotificacionesMarcacionesPendientes(
            Number(
              respuesta_cantidad_notificaciones_marcaciones.data
                .total_pendientes,
            ) || 0,
          );
          setCantidadNotificacionesNovedadesPendientes(
            Number(
              respuesta_cantidad_notificaciones_novedades.data
                .cantidad_no_leidas,
            ) || 0,
          );
        } catch (error) {
          console.error("Error al obtener notificaciones pendientes:", error);
        }
      }
    };
    obtenerNotificacionesPendientes();
  }, [userLevel, vistaActiva]);

  const obtenerSalidaPendiente = async () => {
    if (sedeSeleccionada?.id) {
      try {
        const respuesta = await axios.get(
          `http://localhost:8080/rrhh/marcaciones/facial-sin-salida`,
        );
        if (respuesta.data.length > 0) {
          const ultimaMarcacion = respuesta.data.find(
            (m) =>
              Number(m.usuario_id) === Number(usuarioAuth.userId) &&
              Number(m.sede_id) === Number(sedeSeleccionada?.id),
          );
          setMarcajeFacialInicialPendiente(ultimaMarcacion || null);
        }
      } catch (error) {
        console.error("Error al obtener notificaciones pendientes:", error);
      }
    }
  };

  useEffect(() => {
    obtenerSalidaPendiente();
  }, [sedeSeleccionada?.id]);

  const handleSedeSeleccionada = (sede) => {
    if (sede.sede_id && sede.id) {
      setMostrarPanelSeleccionSede(false);
    }
  };

  if (cargandoInicial) {
    return (
      <Cargando
        fullscreen
        mensaje="Preparando panel de RRHH..."
        submensaje="Verificando sedes, cuenta y credenciales faciales."
      />
    );
  }

  if (mostrarPanelSeleccionSede) {
    return (
      <PanelSeleccionSede
        idUsuario={usuarioAuth.userId}
        onSeleccionarSede={handleSedeSeleccionada}
      ></PanelSeleccionSede>
    );
  }

  if (mostrarPanelConfiguracionInicial) {
    return (
      <ConfiguracionInicial
        nombreUsuario={usuarioAuth.name}
        idUsuario={usuarioAuth.userId}
        idSede={usuarioAuth.idSede}
        onContinuar={() => {
          setMostrarPanelConfiguracionInicial(false);
        }}
        noTieneCuenta={noTieneCuenta}
        noTieneCredencialesFaciales={noTieneCredencialesFaciales}
      />
    );
  }

  const volverAtras = () => {
    setVistaActiva("Dashboard");
  };

  //  Función para renderizar el contenido dinámico según el estado
  const renderizarContenido = () => {
    switch (vistaActiva) {
      case "Fichar":
        return (
          <ReconocimientoFacial
            origen={"marca"}
            volverAtras={volverAtras}
            recargarDatos={obtenerSalidaPendiente}
          />
        );
      case "Liquidaciones_pendientes":
        return <LiquidacionesPendientesUsuarios volverAtras={volverAtras} />;

      case "Novedades":
        return esAdminAutorizadoRRHHH ? (
          <ConversacionesHistorial volverAtras={volverAtras} />
        ) : (
          <ConversacionesDetalle volverAtras={volverAtras} />
        );

      case "Liquidaciones":
        return esAdminAutorizadoRRHHH ? (
          <LiquidacionesUsuarios volverAtras={volverAtras} />
        ) : (
          // EL EMPLEADO ENTRA DIRECTO AL DETALLE (sin usuarioSeleccionado prop, usa sus propios datos)
          <Liquidaciones volverAtras={volverAtras} />
        );
      case "Horarios":
        return esAdminAutorizadoRRHHH ? (
          <HorariosAlumnos volverAtras={volverAtras} />
        ) : (
          <Horarios volverAtras={volverAtras} />
        );
      case "Historial":
        return esAdminAutorizadoRRHHH ? (
          <HistorialUsuarios volverAtras={volverAtras} />
        ) : (
          <HistorialMarcas volverAtras={volverAtras} />
        );
      case "Calendario":
        return <CalendarioHammer />;
      case "Configuracion":
        return <Ajustes volverAtras={volverAtras} />;
      case "Dashboard":
      default:
        return (
          <motion.div
            variants={contenedorStagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6"
          >
            {/* TARJETA PRINCIPAL DE FICHAJE */}

            {usuarioAuth.userLevelAdmin != 1 && (
              <motion.div
                variants={itemStagger}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.24 }}
                className={`md:col-span-3 ${esAdminAutorizadoRRHHH ? "" : "lg:col-span-2"} relative overflow-hidden rounded-3xl border border-orange-100 bg-gradient-to-br from-white via-white to-orange-50 p-7 md:p-8 shadow-lg hover:shadow-2xl hover:border-orange-300 transition-all duration-300 flex flex-col md:flex-row items-center gap-7 group`}
              >
                {/* decoraciones */}
                <motion.div
                  className="absolute top-0 right-0 w-40 h-40 bg-orange-100 rounded-bl-full -mr-16 -mt-16 opacity-60"
                  animate={{ scale: [1, 1.06, 1], rotate: [0, 2, 0] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                ></motion.div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-100 rounded-tr-full -ml-10 -mb-10 opacity-40"></div>

                {/* icono */}
                <div className="relative z-10 flex items-center justify-center">
                  <motion.div
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg shadow-orange-300 ring-4 ring-orange-100"
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FaFaceGrin className="text-5xl md:text-6xl" />

                    {/* indicador activo */}
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400"></span>
                    </span>
                  </motion.div>
                </div>

                {/* contenido */}
                <div className="flex-1 text-center md:text-left z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-wide">
                    Registrar asistencia
                  </h3>

                  <p className="text-gray-600 text-sm mt-2 mb-4 max-w-lg">
                    Sistema de reconocimiento facial y geolocalización activo.
                  </p>

                  {/* alerta */}
                  <AnimatePresence initial={false}>
                    {marcajeFacialIncialPendiente && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.24 }}
                        className="mb-4 overflow-hidden bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2"
                      >
                        <span className="text-red-500 font-semibold">
                          Marcaje de salida pendiente
                        </span>
                        <span className="text-red-400">
                          · Entrada{" "}
                          {marcajeFacialIncialPendiente?.hora_entrada
                            ? dayjs(
                                marcajeFacialIncialPendiente.hora_entrada,
                              ).format("HH:mm")
                            : ""}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* botón */}
                  <motion.button
                    onClick={() =>
                      marcajeFacialIncialPendiente
                        ? manejarMarcajeDeSalida()
                        : manejarClick("Fichar")
                    }
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className={`w-full md:w-auto px-8 py-3 rounded-xl font-semibold tracking-wide transition-all duration-200 shadow-md active:scale-95
                ${
                  marcajeFacialIncialPendiente
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-200"
                    : "bg-gray-900 hover:bg-black text-white shadow-gray-300"
                }`}
                  >
                    {marcajeFacialIncialPendiente
                      ? "MARCAR SALIDA"
                      : "MARCAR ENTRADA"}
                  </motion.button>
                </div>
              </motion.div>
            )}
            {/* 2. BOTÓN REPORTAR NOVEDAD (Habilitado para usuarios no administradores)*/}
            {!esAdminAutorizadoRRHHH && (
              <motion.button
                variants={itemStagger}
                onClick={() => setMostrarModal(true)}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-100 border-2 border-dashed border-orange-300 rounded-3xl p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 active:scale-95 group shadow-sm hover:shadow-lg"
              >
                <div className="bg-white p-3 rounded-full text-orange-600 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <FaEdit className="text-2xl" />
                </div>
                <div className="text-center">
                  <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide group-hover:text-orange-700 transition-colors">
                    REPORTAR NOVEDAD
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    ¿Olvidaste marcar? ¿Evento externo?
                  </p>
                </div>
              </motion.button>
            )}

            {/* 3. BOTÓN LIQUIDACIONES */}
            {esAdminAutorizadoRRHHH && (
              <motion.button
                variants={itemStagger}
                onClick={() => manejarClick("Liquidaciones_pendientes")}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
              >
                <div className="bg-green-50 p-3 rounded-xl text-green-600 ring-1 ring-green-100">
                  <FaMoneyBillWave className="text-2xl" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                    LIQUIDAR HORAS
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Preparar y confirmar liquidaciones
                  </p>
                </div>
              </motion.button>
            )}

            <motion.button
              variants={itemStagger}
              onClick={() => manejarClick("Liquidaciones")}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
            >
              <div className="bg-green-50 p-3 rounded-xl text-green-600 ring-1 ring-green-100">
                <FaHistory className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                  HISTORIAL DE LIQUIDACIONES
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Consultar liquidaciones registradas
                </p>
              </div>
            </motion.button>

            <motion.button
              variants={itemStagger}
              onClick={() => manejarClick("Novedades")}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
            >
              <div className="bg-purple-50 p-3 rounded-xl text-green-600 ring-1 ring-green-100 relative">
                <IoNewspaperOutline className="text-2xl" />
                {/* Badge rojo flotante */}
                {cantidadNotificacionesNovedadesPendientes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md">
                    {cantidadNotificacionesNovedadesPendientes}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                  Novedades
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Historial de novedades empleados
                </p>
              </div>
            </motion.button>

            {/* 4. BOTÓN HORARIOS */}
            <motion.button
              variants={itemStagger}
              onClick={() => manejarClick("Horarios")}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
            >
              <div className="bg-blue-50 p-3 rounded-xl text-blue-600 ring-1 ring-blue-100">
                <FaCalendarAlt className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                  HORARIOS
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">Turnos asignados</p>
              </div>
            </motion.button>

            {/* 5. HISTORIAL */}
            <motion.button
              variants={itemStagger}
              onClick={() => manejarClick("Historial")}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="relative bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
            >
              {/* Icono */}
              <div className="bg-purple-50 p-3 rounded-xl text-purple-600 ring-1 ring-purple-100 relative">
                <FaHistory className="text-2xl" />

                {/* Badge rojo flotante */}
                {cantidadNotificacionesMarcacionesPendientes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-[2px] rounded-full shadow-md">
                    {cantidadNotificacionesMarcacionesPendientes}
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                  HISTORIAL DE ACCESOS
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registro de marcas
                </p>
              </div>
            </motion.button>

            {/* 6. CALENDARIO */}
            {/*             <motion.button
              variants={itemStagger}
              onClick={() => manejarClick("Calendario")}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
            >
              <div className="bg-gray-100 p-3 rounded-xl text-gray-600 ring-1 ring-gray-200">
                <IoCalendar className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                  CALENDARIO HAMMER
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Horarios activos y eventos
                </p>
              </div>
            </motion.button> */}
            {/* 6. CONFIGURACIÓN */}
            {usuarioAuth.userLevelAdmin != 1 && (
              <motion.button
                variants={itemStagger}
                onClick={() => manejarClick("Configuracion")}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="bg-white/95 backdrop-blur rounded-3xl p-5 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-row items-center justify-start gap-4 text-left"
              >
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600 ring-1 ring-gray-200">
                  <FaCog className="text-2xl" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 font-bignoodle text-xl tracking-wide">
                    AJUSTES
                  </h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Cuenta y privacidad
                  </p>
                </div>
              </motion.button>
            )}
          </motion.div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: easingEntrada }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50/40 flex flex-col md:flex-row font-messina"
    >
      {/* ================= NAVBAR SUPERIOR (MOBILE) ================= */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, ease: easingEntrada }}
        className="md:hidden fixed top-0 left-0 w-full z-40 bg-gradient-to-r from-orange-600 to-orange-700 shadow-xl border-b border-orange-500/40 px-4 pt-3 pb-3"
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-white/20 border border-white/30 backdrop-blur shrink-0">
            <FaUserCircle className="text-3xl text-white/90" />
          </div>

          {/* Info usuario */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Bienvenida */}
            <span className="text-[10px] uppercase tracking-widest text-orange-100/70 font-semibold">
              Bienvenido
            </span>

            {/* Nombre */}
            <p className="text-white text-lg font-semibold leading-tight truncate">
              {usuario.nombre}
            </p>

            {/* Datos secundarios */}
            <div className="flex items-center gap-3 mt-1 text-xs">
              {/* Puesto */}
              <div className="flex items-center gap-1 text-orange-100/90">
                <FaUserCircle className="text-xs opacity-80" />
                <span className="truncate">{usuario.puesto}</span>
              </div>

              {/* Separador */}
              <span className="text-orange-200/50">•</span>

              {/* Sucursal */}
              <div className="flex items-center gap-1 text-orange-50/90 min-w-0">
                <FaMapMarkerAlt className="text-xs shrink-0" />
                <span className="truncate">{usuario.sucursal}</span>
              </div>
              <div className="flex items-center gap-1 text-orange-50/90 min-w-0">
                <span className="inline-flex items-center bg-white/20 px-2 py-1 rounded-lg shadow-sm border border-orange-100/30 font-mono text-xs font-semibold tracking-widest">
                  <svg
                    className="w-4 h-4 mr-1 text-orange-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {horaActualNavbar.format("HH:mm:ss")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ================= NAVBAR SUPERIOR (PC) ================= */}
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, delay: 0.06, ease: easingEntrada }}
        className="hidden md:flex fixed top-0 left-0 w-full h-20 z-40 bg-gradient-to-r from-orange-600 to-orange-700 shadow-2xl border-b border-orange-500/40 items-center px-8 justify-between"
      >
        {/* Perfil e info mejorado */}
        <div className="flex items-center gap-6">
          {/* Avatar usuario */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 border-2 border-orange-200 shadow-inner mr-2">
            <FaUserCircle className="text-4xl text-orange-100 drop-shadow" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-orange-100/80 text-xs font-semibold uppercase tracking-[0.16em] mb-1">
              Bienvenido
            </span>
            <span className="text-2xl font-bignoodle tracking-wide leading-none drop-shadow-sm text-white">
              {usuario.nombre}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-black/20 text-xs px-2 py-1 rounded-md text-orange-100 border border-white/10 font-medium flex items-center gap-1">
                <FaUserCircle className="text-orange-200 text-sm" />
                {usuario.puesto}
              </span>
              <span className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-full shadow-sm border border-gray-200 text-xs text-gray-700 font-semibold">
                <FaMapMarkerAlt className="text-orange-600 text-base" />
                {usuario.sucursal}
              </span>
              <div className="flex items-center gap-1 text-orange-50/90 min-w-0">
                <span className="inline-flex items-center bg-white/20 px-2 py-1 rounded-lg shadow-sm border border-orange-100/30 font-mono text-xs font-semibold tracking-widest">
                  <svg
                    className="w-4 h-4 mr-1 text-orange-200"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  {horaActualNavbar.format("HH:mm:ss")}
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Acciones */}
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-white/80 to-orange-100/80 text-orange-700 shadow hover:from-orange-200 hover:to-orange-100 hover:text-orange-900 hover:scale-[1.03] active:scale-95 border border-orange-200/40"
              onClick={rederigirDashboard}
            >
              <FaTable className="text-lg text-orange-600" />
              <span className="hidden lg:block"> Dashboard</span>
            </Link>
          </motion.div>
          {usuarioVariasSedes && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-orange-600/80 to-orange-500/80 text-white shadow-md hover:from-orange-700 hover:to-orange-600 hover:scale-[1.03] active:scale-95 border border-orange-400/30"
              onClick={() => {
                setVistaActiva("Dashboard");
                setMostrarPanelSeleccionSede(true);
              }}
            >
              <FaStoreAlt className="text-lg" />
              <span className="hidden lg:block">Cambiar sede</span>
            </motion.button>
          )}
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-red-600/80 to-red-500/80 text-white shadow-md hover:from-red-700 hover:to-red-600 hover:scale-[1.03] active:scale-95 border border-red-400/30"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-lg" />
            <span className="hidden lg:block">Cerrar sesión</span>
          </motion.button>
        </div>
      </motion.nav>

      {/* ================= CONTENIDO PRINCIPAL ================= */}
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.34, delay: 0.12, ease: easingEntrada }}
        className="flex-1 px-4 pb-4 pt-24 md:p-10 md:pt-24 transition-all"
      >
        {/* RENDERIZADO DINÁMICO */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={vistaActiva}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.26, ease: easingEntrada }}
          >
            {renderizarContenido()}
          </motion.div>
        </AnimatePresence>
      </motion.main>

      <motion.div
        initial={{ y: 28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.34, delay: 0.14, ease: easingEntrada }}
        className={`md:hidden grid ${usuarioVariasSedes ? "grid-cols-3" : "grid-cols-2"} p-4 mt-auto border-t bg-orange-200 border-white/10 bg-gradient-to-r from-black/20 via-orange-900/10 to-black/10 rounded-t-2xl gap-3`}
      >
        {" "}
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
          <Link
            to="/dashboard"
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-white/80 to-orange-100/80 text-orange-700 shadow active:scale-95 border border-orange-200/40 text-xs text-center"
            onClick={rederigirDashboard}
          >
            {" "}
            {/* Se ajustó a flex-col interna y texto pequeño para que entre bien en móviles */}
            <span className="bg-orange-100/60 p-2 rounded-full flex items-center justify-center">
              <FaTable className="text-lg text-orange-600" />
            </span>
            Dashboard
          </Link>
        </motion.div>
        {usuarioVariasSedes && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-orange-600/80 to-orange-500/80 text-white shadow-md active:scale-95 border border-orange-400/30 text-xs text-center"
            onClick={() => {
              setVistaActiva("Dashboard");
              setMostrarPanelSeleccionSede(true);
            }}
          >
            {" "}
            <span className="bg-white/20 p-2 rounded-full flex items-center justify-center">
              <FaStoreAlt className="text-lg" />
            </span>
            Cambiar sede
          </motion.button>
        )}
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-red-600/80 to-red-500/80 text-white shadow-md active:scale-95 border border-orange-400/30 text-xs text-center"
          onClick={handleLogout}
        >
          {" "}
          <span className="bg-white/20 p-2 rounded-full flex items-center justify-center">
            <FaSignOutAlt className="text-lg" />
          </span>
          Cerrar sesión
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ModalNovedad cerrarModal={() => setMostrarModal(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PanelPrincipalRRHH;
