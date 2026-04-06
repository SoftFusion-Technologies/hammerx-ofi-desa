/*
 * Programador: Sergio Manrique
 * Fecha: 25/03/2026
 *
 * Descripción:
 * Listado de Preventas con diseño moderno, filtros (todos, mostrador, transferencia),
 * búsqueda global, alertas con SweetAlert2 y paginación.
 */

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  FaPlus,
  FaSearch,
  FaTimes,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaWhatsapp,
  FaCopy,
  FaClock,
  FaEye,
  FaTrash,
} from "react-icons/fa";
import Swal from "sweetalert2";
import NavbarStaff from "./NavbarStaff";
import Footer from "../../components/footer/Footer";
import ModalPreviewComprobante from "../../components/Preventa/ModalPreviewComprobante";
import ModalDetallePreventa from "../../components/Preventa/ModalDetallePreventa";
import ModalObservacionPreventa from "../../components/Preventa/ModalObservacionPreventa";
import "../../styles/staff/background.css";
import { useAuth } from "../../AuthContext";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

const alertaRapida = (titulo, icono = "success") =>
  Swal.fire({
    title: titulo,
    icon: icono,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true,
  });

const formatearFechaHora = (valor) => {
  if (!valor) return "-";

  const texto = String(valor).trim();
  const tieneZona = /z$|[+-]\d{2}:\d{2}$/i.test(texto);

  let fecha = null;

  if (tieneZona) {
    fecha = dayjs.utc(texto).tz("America/Argentina/Buenos_Aires");
  } else {
    fecha = dayjs(
      texto,
      [
        "YYYY-MM-DD HH:mm:ss",
        "YYYY-MM-DD HH:mm",
        "YYYY-MM-DDTHH:mm:ss",
        "YYYY-MM-DDTHH:mm",
      ],
      true,
    );

    if (!fecha.isValid()) {
      fecha = dayjs(texto);
    }
  }

  return fecha.isValid() ? fecha.format("DD/MM/YYYY HH:mm") : texto;
};

const formatearSoloFecha = (valor) => {
  if (!valor) return "-";

  const texto = String(valor).trim();
  const fechaTexto = texto.split("T")[0]?.split(" ")[0] || texto;
  const fecha = dayjs(fechaTexto, "YYYY-MM-DD", true);

  if (fecha.isValid()) {
    return fecha.format("DD/MM/YYYY");
  }

  const fallback = dayjs(texto);
  return fallback.isValid() ? fallback.format("DD/MM/YYYY") : texto;
};

const Preventas = () => {
  const { userId: ID_usuario_sesion } = useAuth();
  const [preventas, setPreventas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroInscripcion, setFiltroInscripcion] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroPlan, setFiltroPlan] = useState("todos");
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [modalComprobante, setModalComprobante] = useState({
    abierto: false,
    url: "",
    fileName: "",
    esImagen: false,
    esPdf: false,
  });
  const [modalDetalle, setModalDetalle] = useState({
    abierto: false,
    preventa: null,
  });
  const [modalObservacion, setModalObservacion] = useState({
    abierto: false,
    observacion: "",
    clienteNombre: "",
  });
  const [guardandoDetalle, setGuardandoDetalle] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const API_BASE = "http://localhost:8080";
  const mostrarSkeleton = cargando && preventas.length === 0;

  const capitalizarPalabras = (texto) =>
    texto
      .toLowerCase()
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  const obtenerPreventas = async () => {
    setCargando(true);
    setError("");
    try {
      const respuesta = await axios.get(`${API_BASE}/preventas`);
      setPreventas(respuesta.data || []);

      if (respuesta.data?.length > 0) {
        const resultados = respuesta.data;
        const planes = resultados.map((p) =>
          capitalizarPalabras(p.plan_seleccionado),
        );
        const planesUnicos = [...new Set(planes)];
        setPlanesDisponibles(planesUnicos);
      }
    } catch (err) {
      console.error("Error al obtener preventas:", err);
      setError("No se pudieron cargar las preventas. Intenta nuevamente.");
      Swal.fire("Error", "No se pudieron cargar las preventas.", "error");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPreventas();
  }, []);

  const marcarComoContactado = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Marcar como contactado?",
      text: "El estado cambiará y se registrará el contacto.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#059669",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const respuesta = await axios.put(
        `${API_BASE}/preventas/contacto/${id}`,
        {
          id_usuario_contacto: ID_usuario_sesion,
        },
      );
      if (respuesta.status === 200) {
        alertaRapida("Contacto registrado", "success");
        obtenerPreventas();
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      Swal.fire("Error", "No se pudo actualizar el estado.", "error");
    }
  };

  const anularContacto = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Anular contacto?",
      text: "La preventa volverá a estado pendiente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#ef4444",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const respuesta = await axios.put(
        `${API_BASE}/preventas/contacto/${id}`,
        {
          id_usuario_contacto: null,
        },
      );
      if (respuesta.status === 200) {
        alertaRapida("Contacto anulado", "success");
        obtenerPreventas();
      }
    } catch (err) {
      console.error("Error al actualizar:", err);
      Swal.fire("Error", "No se pudo anular el estado.", "error");
    }
  };

  const abrirModalDetalle = (preventa) => {
    setModalDetalle({ abierto: true, preventa });
  };

  const cerrarModalDetalle = () => {
    setModalDetalle({ abierto: false, preventa: null });
  };

  const guardarDetallePreventa = async (id, datosActualizados) => {
    setGuardandoDetalle(true);
    try {
      const payload = {
        nombre_apellido: datosActualizados.nombre_apellido,
        dni: datosActualizados.dni,
        fecha_nacimiento: datosActualizados.fecha_nacimiento,
        correo: datosActualizados.correo,
        domicilio: datosActualizados.domicilio,
        celular: datosActualizados.celular,
      };

      const respuesta = await axios.put(`${API_BASE}/preventas/${id}`, payload);
      if (respuesta.status === 200) {
        const preventaActualizada = respuesta?.data?.preventa;

        if (preventaActualizada?.id) {
          setPreventas((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, ...preventaActualizada } : item,
            ),
          );
        } else {
          await obtenerPreventas();
        }

        alertaRapida("Preventa actualizada", "success");
        cerrarModalDetalle();
      }
    } catch (err) {
      console.error("Error al editar preventa:", err);
      Swal.fire("Error", "No se pudo actualizar la preventa.", "error");
    } finally {
      setGuardandoDetalle(false);
    }
  };

  const eliminarPreventa = async (id) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar preventa?",
      text: "Esta accion no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmacion.isConfirmed) return;

    setEliminando(true);
    try {
      const respuesta = await axios.delete(`${API_BASE}/preventas/${id}`);
      if (respuesta.status === 200 || respuesta.status === 204) {
        alertaRapida("Preventa eliminada", "success");
        await obtenerPreventas();
        setModalDetalle((prev) =>
          prev.preventa?.id === id ? { abierto: false, preventa: null } : prev,
        );
      }
    } catch (err) {
      console.error("Error al eliminar preventa:", err);
      Swal.fire("Error", "No se pudo eliminar la preventa.", "error");
    } finally {
      setEliminando(false);
    }
  };

  const copiarTexto = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alertaRapida("Copiado al portapapeles");
    } catch {
      Swal.fire("Atención", "No se pudo copiar.", "info");
    }
  };

  const abrirWhatsApp = (numero) => {
    if (!numero) return;
    const numeroLimpio = String(numero).replace(/[^0-9]/g, "");
    const url = `https://wa.me/${numeroLimpio}`;
    window.open(url, "_blank");
  };

  const normalizarUrlComprobante = (valor) => {
    if (!valor) return "";

    const limpia = String(valor).trim();
    if (!limpia) return "";

    if (limpia.startsWith("blob:")) return limpia;
    if (limpia.startsWith("/blob:")) return limpia.slice(1);
    if (limpia.startsWith("http://") || limpia.startsWith("https://"))
      return limpia;
    if (limpia.startsWith("/")) return `${API_BASE}${limpia}`;
    return `${API_BASE}/${limpia}`;
  };

  const obtenerDatosComprobante = (preventa) => {
    const urlCruda =
      preventa?.comprobante_url_publica || preventa?.comprobante_url || "";
    const url = normalizarUrlComprobante(urlCruda);
    const nombreDesdeUrl = url
      ? decodeURIComponent(url.split("/").pop()?.split("?")[0] || "comprobante")
      : "comprobante";

    const tipo = String(preventa?.comprobante_tipo || "").toLowerCase();
    const mime = String(preventa?.comprobante_mime || "").toLowerCase();
    const fuenteDeteccion = `${nombreDesdeUrl} ${url}`;

    const esPdf = Boolean(
      tipo.includes("pdf") ||
        mime.includes("pdf") ||
        /\.pdf($|\?)/i.test(fuenteDeteccion),
    );

    const esImagen = Boolean(
      preventa?.comprobante_es_imagen ||
        tipo === "imagen" ||
        mime.startsWith("image/") ||
        /\.(png|jpe?g|gif|webp|bmp|svg)($|\?)/i.test(fuenteDeteccion),
    );

    return {
      url,
      fileName: nombreDesdeUrl,
      esImagen: esImagen && !esPdf,
      esPdf,
    };
  };

  const abrirModalComprobante = (preventa) => {
    const datos = obtenerDatosComprobante(preventa);
    if (!datos.url) {
      Swal.fire(
        "Información",
        "No hay comprobante disponible para esta preventa.",
        "info",
      );
      return;
    }

    setModalComprobante({
      abierto: true,
      url: datos.url,
      fileName: datos.fileName,
      esImagen: datos.esImagen,
      esPdf: datos.esPdf,
    });
  };

  const cerrarModalComprobante = () => {
    setModalComprobante((prev) => ({ ...prev, abierto: false }));
  };

  const abrirModalObservacion = (preventa) => {
    const observacion = String(preventa?.observaciones || "").trim();
    if (!observacion) return;

    setModalObservacion({
      abierto: true,
      observacion,
      clienteNombre: preventa?.nombre_apellido || "Sin cliente",
    });
  };

  const cerrarModalObservacion = () => {
    setModalObservacion({
      abierto: false,
      observacion: "",
      clienteNombre: "",
    });
  };

  const descargarComprobante = async () => {
    if (!modalComprobante.url) return;

    const nombreArchivo = modalComprobante.fileName || "comprobante";

    try {
      const respuesta = await fetch(modalComprobante.url);
      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }

      const blob = await respuesta.blob();
      const blobUrl = URL.createObjectURL(blob);

      const enlace = document.createElement("a");
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("No se pudo forzar la descarga, abriendo fallback:", err);

      const enlace = document.createElement("a");
      enlace.href = modalComprobante.url;
      enlace.download = nombreArchivo;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    }
  };

  const preventasFiltradas = useMemo(() => {
    let datos = [...preventas];

    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      datos = datos.filter((p) => {
        return (
          (p.nombre_apellido || "").toLowerCase().includes(q) ||
          (p.dni || "").toLowerCase().includes(q) ||
          (p.celular || "").toLowerCase().includes(q) ||
          (p.correo || "").toLowerCase().includes(q) ||
          (p.domicilio || "").toLowerCase().includes(q) ||
          (p.plan_seleccionado || "").toLowerCase().includes(q) ||
          (p.duracion_plan || "").toLowerCase().includes(q) ||
          (p.turno_seleccionado || "").toLowerCase().includes(q) ||
          (p.modalidad_pago || "").toLowerCase().includes(q) ||
          (p.metodo_inscripcion || "").toLowerCase().includes(q) ||
          (p.nombre_usuario_contacto || "").toLowerCase().includes(q) ||
          String(p.id || "").includes(q)
        );
      });
    }

    if (filtroInscripcion !== "todos") {
      datos = datos.filter((p) => {
        const metodo = (p.modalidad_pago || "").toLowerCase();
        return filtroInscripcion === "mostrador"
          ? metodo.includes("mostrador")
          : metodo.includes("transferencia");
      });
    }

    if (filtroEstado !== "todos") {
      datos = datos.filter(
        (p) => (p.estado_contacto || "").toLowerCase() === filtroEstado,
      );
    }

    if (filtroPlan !== "todos") {
      datos = datos.filter(
        (p) =>
          (p.plan_seleccionado || "").toLowerCase() ===
          filtroPlan.toLowerCase(),
      );
    }

    return datos;
  }, [preventas, busqueda, filtroInscripcion, filtroEstado, filtroPlan]);

  const total = preventasFiltradas.length;
  const pendientes = preventasFiltradas.filter(
    (p) => (p.estado_contacto || "").toLowerCase() === "pendiente",
  ).length;
  const contactados = total - pendientes;

  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina, setElementosPorPagina] = useState(20);

  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroInscripcion, filtroEstado, elementosPorPagina]);

  const ultimoIndice = paginaActual * elementosPorPagina;
  const primerIndice = ultimoIndice - elementosPorPagina;
  const registrosPaginados = preventasFiltradas.slice(
    primerIndice,
    ultimoIndice,
  );
  const totalPaginas =
    Math.ceil(preventasFiltradas.length / elementosPorPagina) || 1;

  const paginaAnterior = () =>
    paginaActual > 1 && setPaginaActual((p) => p - 1);
  const paginaSiguiente = () =>
    paginaActual < totalPaginas && setPaginaActual((p) => p + 1);


  const formatearPesosArgentinos = (valor, decimales = 2) => {
    try {
      if (valor === null || valor === undefined || valor === '') return '';
      
      const numero = Number(valor);
      if (isNaN(numero)) return String(valor);

      const fmtArg = new Intl.NumberFormat('es-AR', {
        style: 'decimal',
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales
      });

      return fmtArg.format(numero);
    } catch {
      return String(valor);
    }
  };

  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg min-h-screen py-8">
        <div className="mx-auto w-[98%] max-w-[96%]">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/dashboard">
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#fc4b08] px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-500 transition">
                <FaChevronLeft /> Volver
              </button>
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,.25)] backdrop-blur-xl">
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-zinc-100 p-6 md:flex-row md:items-center md:justify-between bg-white/90 backdrop-blur">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-800 font-bignoodle">
                  Gestión de Preventas
                </h1>
                <p className="text-xs text-zinc-500">
                  Total: <strong>{total}</strong> • Pendientes:{" "}
                  <strong className="text-red-600">{pendientes}</strong> •
                  Contactados:{" "}
                  <strong className="text-emerald-600">{contactados}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={obtenerPreventas}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  title="Refrescar"
                >
                  <FaSyncAlt className={cargando ? "animate-spin" : ""} />{" "}
                  Refrescar
                </button>
                {/*                 <Link to="/alta-preventa">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700">
                    <FaPlus /> Nueva Preventa
                  </button>
                </Link> */}
              </div>
            </div>

            <div className="border-t border-zinc-100 bg-zinc-50/50 p-6">
              <p className="mb-4 text-xs font-semibold uppercase text-zinc-600">
                Filtros
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-12">
                <div className="sm:col-span-3 lg:col-span-6">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition">
                    <FaSearch className="shrink-0 text-zinc-400" />
                    <input
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      type="text"
                      placeholder="Buscar por nombre, DNI, celular, plan..."
                      className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                    />
                    {busqueda && (
                      <button
                        onClick={() => setBusqueda("")}
                        className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-1 lg:col-span-2">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition">
                    <select
                      value={filtroPlan}
                      onChange={(e) => setFiltroPlan(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-zinc-700"
                    >
                      <option value="todos">Todos los planes</option>
                      {planesDisponibles.map((plan, i) => (
                        <option key={i} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="sm:col-span-1 lg:col-span-2">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition">
                    <select
                      value={filtroInscripcion}
                      onChange={(e) => setFiltroInscripcion(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-zinc-700"
                    >
                      <option value="todos">Todas las inscripciones</option>
                      <option value="mostrador">Por Mostrador</option>
                      <option value="transferencia">Por Transferencia</option>
                    </select>
                  </div>
                </div>

                <div className="sm:col-span-1 lg:col-span-2">
                  <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-zinc-300 transition">
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full bg-transparent text-sm font-medium outline-none text-zinc-700"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pendiente">Pendientes</option>
                      <option value="contactado">Contactados</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <AnimatePresence initial={false}>
                {mostrarSkeleton && (
                  <motion.div
                    key="cargando"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 w-full animate-pulse rounded-xl bg-zinc-100"
                      />
                    ))}
                    <p className="mt-2 text-center text-sm text-zinc-500">
                      Cargando preventas...
                    </p>
                  </motion.div>
                )}

                {!cargando && error && (
                  <motion.div
                    key="error"
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </motion.div>
                )}

                {!cargando && !error && preventasFiltradas.length === 0 && (
                  <motion.div
                    key="vacio"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid place-items-center py-16"
                  >
                    <p className="text-sm text-zinc-500">
                      No hay preventas que coincidan con la búsqueda.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {!cargando && !error && preventasFiltradas.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-zinc-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-orange-600 text-white">
                      <tr>
                        <th className="px-3 py-3 text-center">ID</th>
                        <th className="px-3 py-3 text-center">Fechas</th>
                        <th className="px-3 py-3 text-center">Cliente</th>
                        <th className="px-3 py-3 text-center">Contacto</th>
                        <th className="px-3 py-3 text-center">Plan / Turno</th>
                        <th className="px-3 py-3 text-center">Pago</th>
                        <th className="px-3 py-3 text-center">Monto</th>
                        <th className="px-3 py-3 text-center">Estado</th>
                        <th className="px-3 py-3 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {registrosPaginados.map((preventa, i) => (
                        <tr
                          key={i}
                          onClick={() => abrirModalDetalle(preventa)}
                          className="cursor-pointer hover:bg-orange-50 transition-colors"
                          title="Click para ver detalle"
                        >
                          <td className="px-3 py-3 text-center font-medium text-zinc-800">
                            {preventa.id}
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700">
                            <div>{formatearFechaHora(preventa.created_at)}</div>

                            <div className="text-xs text-zinc-500">
                              Sede: {preventa.sede?.nombre.toUpperCase() ?? "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700">
                            <div className="font-semibold">
                              {preventa.nombre_apellido}
                            </div>
                            <div className="text-xs text-zinc-500">
                              DNI: {preventa.dni}
                            </div>
                            <div className="text-xs text-zinc-500">
                              Nac:{" "}
                              {formatearSoloFecha(preventa.fecha_nacimiento)}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700">
                            <div className="flex items-center justify-center gap-2">
                              <span>{preventa.celular}</span>
                              {preventa.celular && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      abrirWhatsApp(preventa.celular);
                                    }}
                                    className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                                  >
                                    <FaWhatsapp />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copiarTexto(preventa.celular);
                                    }}
                                    className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                                  >
                                    <FaCopy />
                                  </button>
                                </>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">
                              {preventa.correo}
                            </div>
                            <div
                              className="mt-1 max-w-[240px] truncate text-xs text-zinc-500"
                              title={preventa.domicilio || ""}
                            >
                              Dir: {preventa.domicilio || "-"}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700">
                            <div>{preventa.plan_seleccionado}</div>
                            <div className="text-xs text-zinc-500">
                              {preventa.duracion_plan || "-"}
                            </div>
                            <div className="text-xs text-zinc-500">
                              {preventa.turno_seleccionado}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700">
                            <div className="text-xs text-zinc-500">
                              {(preventa.modalidad_pago || "-").toUpperCase()}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-zinc-700 font-medium">
                            ${formatearPesosArgentinos(preventa.monto_pactado)}
                          </td>
                          <td className="px-3 py-3 text-center">
                            {(preventa.estado_contacto || "").toLowerCase() ===
                            "contactado" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                  <FaCheck /> Contactado
                                </span>
                                {preventa.fecha_contacto && (
                                  <span className="text-[10px] text-zinc-500">
                                    {formatearFechaHora(
                                      preventa.fecha_contacto,
                                    )}
                                  </span>
                                )}
                                {Boolean(
                                  preventa.nombre_usuario_contacto ||
                                  preventa.id_usuario_contacto,
                                ) && (
                                  <span className="text-[10px] text-zinc-500">
                                    Por:{" "}
                                    {preventa.nombre_usuario_contacto ||
                                      `Usuario ${preventa.id_usuario_contacto}`}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                <FaClock /> Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <div
                              className="flex flex-col items-center justify-center gap-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {(
                                preventa.estado_contacto || ""
                              ).toLowerCase() === "pendiente" ? (
                                <button
                                  onClick={() =>
                                    marcarComoContactado(preventa.id)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600 transition w-full max-w-[150px]"
                                >
                                  <FaCheck /> Marcar Contactado
                                </button>
                              ) : (
                                <button
                                  onClick={() => anularContacto(preventa.id)}
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-600 transition w-full max-w-[150px]"
                                >
                                  <FaTimes /> Anular contacto
                                </button>
                              )}

                              {obtenerDatosComprobante(preventa).url && (
                                <button
                                  onClick={() =>
                                    abrirModalComprobante(preventa)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600 transition w-full max-w-[150px]"
                                >
                                  <FaEye /> Ver comprobante
                                </button>
                              )}

                              {Boolean(
                                String(preventa.observaciones || "").trim(),
                              ) && (
                                <button
                                  onClick={() =>
                                    abrirModalObservacion(preventa)
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-700 transition w-full max-w-[150px]"
                                >
                                  <FaEye /> Ver observación
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!cargando && !error && preventasFiltradas.length > 0 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span>Mostrando</span>
                    <select
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1"
                      value={elementosPorPagina}
                      onChange={(e) =>
                        setElementosPorPagina(Number(e.target.value))
                      }
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span>
                      de <strong>{preventasFiltradas.length}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={paginaAnterior}
                      disabled={paginaActual === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:opacity-40"
                    >
                      <FaChevronLeft /> Anterior
                    </button>
                    <span className="text-xs text-zinc-600">
                      Página <strong>{paginaActual}</strong> de{" "}
                      <strong>{totalPaginas}</strong>
                    </span>
                    <button
                      onClick={paginaSiguiente}
                      disabled={paginaActual === totalPaginas}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:opacity-40"
                    >
                      Siguiente <FaChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ModalPreviewComprobante
        isOpen={modalComprobante.abierto}
        onClose={cerrarModalComprobante}
        previewUrl={modalComprobante.url}
        fileName={modalComprobante.fileName}
        esImagen={modalComprobante.esImagen}
        esPdf={modalComprobante.esPdf}
        onDownload={descargarComprobante}
      />
      <ModalDetallePreventa
        isOpen={modalDetalle.abierto}
        preventa={modalDetalle.preventa}
        guardando={guardandoDetalle}
        eliminando={eliminando}
        onClose={cerrarModalDetalle}
        onSave={guardarDetallePreventa}
        onDelete={eliminarPreventa}
      />
      <ModalObservacionPreventa
        isOpen={modalObservacion.abierto}
        onClose={cerrarModalObservacion}
        observacion={modalObservacion.observacion}
        clienteNombre={modalObservacion.clienteNombre}
      />
      <Footer />
    </>
  );
};

export default Preventas;
