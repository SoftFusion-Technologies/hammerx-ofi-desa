import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Calendar, Bell, X } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const URL = "http://localhost:8080/";

export default function AgendasVentas({
  userId,
  level = "vendedor", // o 'admin'
  open,
  onClose,
  onVentasCountChange,
}) {
  const [notis, setNotis] = useState(null); // clases de prueba
  const [ventas, setVentas] = useState(null); // seguimientos ventas
  const [errorClases, setErrorClases] = useState("");
  const [errorVentas, setErrorVentas] = useState("");

  // --- helpers ---
  const onlyDigits = (s = "") => s.replace(/\D/g, "");
  const waURL = (telefono, nombre) => {
    const msg = `Hola ${nombre || ""} ¿Cómo te fue ayer en la clase de prueba?`;
    return `https://wa.me/${onlyDigits(telefono)}?text=${encodeURIComponent(
      msg
    )}`;
  };
  
  function formatearFecha(fechaISO) {
    if (!fechaISO) return "";

    try {
      // Intentar con dayjs
      const fechaFormateada = dayjs.tz(fechaISO, 'America/Argentina/Buenos_Aires').format('DD-MM-YYYY');

      // Si dayjs devuelve "Invalid Date" o null, usamos el método nativo
      if (!fechaFormateada || fechaFormateada === "Invalid Date") {
        throw new Error("dayjs falló");
      }

      return fechaFormateada;
    } catch (error) {
      // Respaldo nativo en caso de fallo
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) return ""; // si la fecha es inválida también en JS

      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const anio = fecha.getFullYear();

      return `${dia}-${mes}-${anio}`;
    }
  }

  // --- loaders ---
  const loadClases = useCallback(async () => {
    setErrorClases("");
    setNotis(null);
    try {
      const hoy = dayjs().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD');


      const res = await axios.get(
        `${URL}ventas-remarketing/clases-hoy?fecha=${hoy}${
          level !== "admin" ? `&usuario_id=${userId}` : ""
        }`
      );

      const clasesConFechaCorregida = (Array.isArray(res.data) ? res.data : []).map(clase => ({
        ...clase,
        fecha: clase.fecha ? dayjs.tz(clase.fecha, 'America/Argentina/Buenos_Aires').format('YYYY-MM-DD') : null,
        clase_prueba_1_fecha: clase.clase_prueba_1_fecha ? dayjs.tz(clase.clase_prueba_1_fecha, 'America/Argentina/Buenos_Aires').format('YYYY-MM-DD') : null,
        clase_prueba_2_fecha: clase.clase_prueba_2_fecha ? dayjs.tz(clase.clase_prueba_2_fecha, 'America/Argentina/Buenos_Aires').format('YYYY-MM-DD') : null,
        clase_prueba_3_fecha: clase.clase_prueba_3_fecha ? dayjs.tz(clase.clase_prueba_3_fecha, 'America/Argentina/Buenos_Aires').format('YYYY-MM-DD') : null,
      }));


      setNotis(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("❌ Error cargando clases:", error); // DEBUG
      setErrorClases("No se pudo cargar clases de remarketing.");
      setNotis([]);
    }
  }, [userId, level]);

  const loadVentas = useCallback(async () => {
    setErrorVentas("");
    setVentas(null);
    try {
      const qs = new URLSearchParams({
        level: level === "admin" ? "admin" : "vendedor",
        ...(level !== "admin" ? { usuario_id: String(userId) } : {}),
        with_prospect: "1",
      });
      
      
      const r = await fetch(`${URL}ventas/agenda/hoy?${qs.toString()}`);
      const d = await r.json();
      
      
      const arr = Array.isArray(d) ? d : [];
      setVentas(arr);

      onVentasCountChange?.(arr.length);
    } catch (error) {
      console.error('❌ Error cargando ventas:', error);
      setErrorVentas("No se pudo cargar la agenda de ventas.");
      setVentas([]);
      onVentasCountChange?.(0);
    }
  }, [userId, level, onVentasCountChange]);

  // cargar cuando se abre
  useEffect(() => {
    if (open && userId) {
      loadClases();
      loadVentas();
    }
  }, [open, userId, loadClases, loadVentas]);

  // cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // acciones ventas (no quita el item; lo marca done y reordena pendientes primero)
  const marcarDone = async (id) => {
    const prev = ventas;
    setVentas((arr) => {
      const next = arr.map((i) =>
        i.id === id
          ? { ...i, done: true, done_at: new Date().toISOString() }
          : i
      );
      next.sort(
        (a, b) =>
          Number(a.done) - Number(b.done) ||
          new Date(a.created_at) - new Date(b.created_at)
      );
      return next;
    });

    // actualizo contador del pill si cuenta pendientes
    // onVentasCountChange?.((cnt) => Math.max(0, (typeof cnt === 'number' ? cnt : 0) - 1));

    try {
      const r = await fetch(`${URL}ventas/agenda/${id}/done`, {
        method: "PATCH",
      });
      if (!r.ok) throw new Error();
    } catch {
      setVentas(prev); // rollback
      alert("No se pudo marcar como realizado");
    }
  };

  if (!open) return null;

  const totalClases = Array.isArray(notis) ? notis.length : 0;
  const totalVentas = Array.isArray(ventas) ? ventas.length : 0;
  const total = totalClases + totalVentas;

  const marcarEnviado = async (prospectoId) => {

    const prev = notis;
    setNotis((arr) =>
      Array.isArray(arr)
        ? arr
            .map((n) =>
              n.prospecto_id === prospectoId ? { ...n, enviado: 1 } : n
            )
            .sort((a, b) => (a.enviado || 0) - (b.enviado || 0))
        : arr
    );

    try {
      const url = `${URL}ventas-remarketing/${prospectoId}/marcar-enviado`;

      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enviado_by_user_id: userId }),
      });

      const data = await r.json();

      if (!r.ok) {
        throw new Error(data.mensajeError || "Error al marcar como enviado");
      }

    } catch (e) {
      console.error("❌ Error completo:", e); // DEBUG
      setNotis(prev);
      alert(`No se pudo marcar como enviado: ${e.message}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-black/70 via-black/50 to-[#fc4b08]/40 backdrop-blur-xl px-2 sm:px-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="
      relative bg-white dark:bg-zinc-900/95 rounded-2xl sm:rounded-3xl shadow-2xl
      w-full
      max-w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-5xl
      px-4 sm:px-6 md:px-8
      py-4 sm:py-6 md:py-7
      animate-fade-in border border-orange-100 dark:border-zinc-700
      max-h-[92vh] flex flex-col
    "
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-3.5 sm:right-3.5 text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center gap-3 pb-2 sm:pb-3 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <Bell className="text-[#fc4b08] drop-shadow h-7 w-7 sm:h-8 sm:w-8" />
            <h2
              className="
            font-extrabold text-[#fc4b08] tracking-wide font-bignoodle
            text-[clamp(20px,4vw,40px)]
            relative after:content-[''] after:block after:h-1 after:bg-orange-200 after:w-1/2 after:mx-auto after:rounded-full after:mt-1
          "
            >
              Clases de prueba agendadas HOY
            </h2>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-300 text-center">
            Estos prospectos tienen una clase de prueba pendiente hoy.
          </p>

          {/* Resumen total */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-sm mt-1">
            <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-900 font-semibold px-2.5 py-0.5">
              Clases: {totalClases}
            </span>
            <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 font-semibold px-2.5 py-0.5">
              Ventas: {totalVentas}
            </span>
            <span className="inline-flex items-center rounded-full bg-orange-200 text-orange-900 font-bold px-2.5 py-0.5">
              Total: {total}
            </span>
          </div>

          {/* Tip */}
          <div className="mt-1.5 sm:mt-2 text-[12px] sm:text-sm md:text-base text-orange-800 dark:text-orange-300 bg-orange-50 border-l-4 border-orange-300 rounded px-3 sm:px-4 py-2 font-semibold shadow-sm max-w-xl mx-auto">
            <div className="text-center">
              <span className="font-bold">Recordá notificar:</span>
            </div>
            <ul className="list-disc list-inside mt-1 text-left">
              <li>Al instructor encargado de turno</li>
              <li>Al recepcionista encargado de turno</li>
              <li>Recordatorio al cliente</li>
            </ul>
          </div>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-6 pr-1 md:pr-2 scrollbar-thin scrollbar-thumb-orange-200">
          {/* SECCIÓN 1 — Clases */}
          {notis === null && !errorClases && (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-orange-100 bg-orange-50/40 p-4 sm:p-6"
                >
                  <div className="h-4 w-1/3 rounded bg-orange-200/70 mb-2" />
                  <div className="h-3 w-1/2 rounded bg-orange-200/50 mb-3" />
                  <div className="h-10 w-full rounded bg-orange-100/60" />
                </div>
              ))}
            </div>
          )}

          {!!errorClases && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              {errorClases}
            </div>
          )}

          {Array.isArray(notis) && notis.length === 0 && !errorClases && (
            <div className="text-gray-400 text-sm sm:text-base text-center py-4 font-medium">
              No hay clases de prueba agendadas para hoy.
            </div>
          )}

          {Array.isArray(notis) && notis.length > 0 && (
            <div className="space-y-3">
              <h3 className="uppercase font-bignoodle text-[clamp(18px,3.5vw,24px)] font-bold text-gray-900 dark:text-white">
                Clases de Remarketing
              </h3>
              {notis.map((n) => {
                const enviado = Number(n.enviado) === 1;
                const tipo = n.tipo ?? n.tipo_for_today;
                const fechaMostrar =
                  n.fecha ??
                  n.fecha_for_today ??
                  n.clase_prueba_1_fecha ??
                  n.clase_prueba_2_fecha ??
                  n.clase_prueba_3_fecha;
                const observacion = n?.observacion ?? n?.obs_for_today ?? "";

                return (
                    <div
                      key={n.prospecto_id}
                      className={[
                        "grid grid-cols-1 md:grid-cols-[auto,1fr,auto] items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border-l-8",
                        enviado
                          ? "bg-green-50/90 border-green-400"
                          : "bg-yellow-50/90 border-yellow-400",
                      ].join(" ")}
                      style={{ backdropFilter: "blur(2px)" }}
                    >
                      {/* Fecha */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Calendar className="text-yellow-500 h-6 w-6 sm:h-7 sm:w-7" />
                        <span className="font-extrabold text-[15px] sm:text-lg tracking-wide text-gray-900 dark:text-white">
                          {formatearFecha(fechaMostrar)}
                        </span>
                      </div>

                      {/* Info prospecto */}
                      <div className="min-w-0">
                        <div className="uppercase font-semibold text-[15px] sm:text-lg text-yellow-900 dark:text-yellow-100 truncate">
                          {n.nombre || n.nombre_socio}
                        </div>
                        <div className="uppercase font-messina font-semibold text-[15px] sm:text-lg text-yellow-900 dark:text-yellow-100 truncate">
                          {n.sede}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                          <span>
                            Colaborador:{" "}
                            <span className="text-orange-700 dark:text-orange-400 font-bold">
                              {n.asesor_nombre}
                            </span>
                          </span>
                          {n.numero_clase && (
                            <span className="block mt-0.5">
                              Clase:{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-semibold">
                                #{n.numero_clase}
                              </span>
                            </span>
                          )}
                          {tipo && (
                            <span className="block mt-0.5">
                              Tipo:{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold">
                                {tipo}
                              </span>
                            </span>
                          )}
                          {observacion && (
                            <span className="block mt-0.5">
                              Observación:{" "}
                              <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-semibold">
                                {observacion}
                              </span>
                            </span>
                          )}
                          <span className="block mt-0.5">
                            Contacto:{" "}
                            <span className="font-bold break-words">
                              {n.contacto}
                            </span>
                          </span>
                            <div className="mt-1.5 flex items-center gap-2 text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Origen:</span>
                              
                              {(() => {
                                // Lógica para determinar el texto y el color
                                // 1. Si el backend ya manda el nombre del origen (ej: 'Recaptacion'), úsalo.
                                // 2. Si tiene 'ventas_prospecto_id', asumimos que es de VENTAS.
                                // 3. Si la actividad dice 'Pilates', lo destacamos.
                                let textoOrigen = n.origen || (n.ventas_prospecto_id ? "VENTAS" : "GENERAL");
                                
                                // Detectar Pilates especificamente si viene en la actividad
                                if (n.actividad && n.actividad.toLowerCase().includes("pilates")) {
                                    textoOrigen = "PILATES";
                                }

                                // Asignar colores según el origen
                                let clasesColor = "bg-gray-100 text-gray-600 border-gray-200"; // Default

                                const origenUpper = String(textoOrigen).toUpperCase();

                                if (origenUpper.includes("VENTAS")) {
                                  clasesColor = "bg-blue-100 text-blue-700 border-blue-200";
                                } else if (origenUpper.includes("RECAPTACION") || origenUpper.includes("RECAPTACIÓN")) {
                                  clasesColor = "bg-purple-100 text-purple-700 border-purple-200";
                                } else if (origenUpper.includes("PILATES")) {
                                  clasesColor = "bg-pink-100 text-pink-700 border-pink-200";
                                } else if (origenUpper.includes("WEB") || origenUpper.includes("PÁGINA")) {
                                  clasesColor = "bg-indigo-100 text-indigo-700 border-indigo-200";
                                }

                                return (
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wide shadow-sm border ${clasesColor}`}>
                                    {textoOrigen}
                                  </span>
                                );
                              })()}
                            </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex md:justify-end w-full md:w-auto gap-2">
                        <a
                          href={`https://wa.me/${(n.contacto || "").replace(
                            /\D/g,
                            ""
                          )}?text=${encodeURIComponent(
                            `Hola ${n.nombre || n.nombre_socio}, soy ${
                              n.asesor_nombre
                            } de HammerX y te quería recordar tu clase de prueba ${
                              n.numero_clase ? `#${n.numero_clase}` : ""
                            } de hoy.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={[
                            "inline-flex w-full md:w-auto items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold shadow",
                            enviado
                              ? "bg-green-400 text-white cursor-not-allowed opacity-70"
                              : "bg-green-500 hover:bg-green-600 text-white",
                          ].join(" ")}
                          onClick={(e) => enviado && e.preventDefault()}
                          title={
                            enviado
                              ? "Ya marcado como realizado"
                              : "Abrir WhatsApp"
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.52 3.48a12.1 12.1 0 0 0-17.09 0c-4.01 4-4.17 10.44-.36 14.62l-1.06 3.84a1.003 1.003 0 0 0 1.27 1.27l3.84-1.06c4.18 3.81 10.62 3.65 14.62-.36 4.01-4.01 4.01-10.52 0-14.55zm-1.41 13.13c-3.34 3.33-8.77 3.48-12.28.35l-.2-.18-2.34.65.65-2.34-.18-.2c-3.13-3.5-2.98-8.94.35-12.28a9.09 9.09 0 0 1 12.82 12z" />
                          </svg>
                          Contactar
                        </a>

                        {/* Marcar realizado */}
                        <button
                          onClick={() =>
                            !enviado && marcarEnviado(n.prospecto_id || n.id)
                          }
                          className={[
                            "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-bold shadow",
                            enviado
                              ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                              : "bg-[#fc4b08] text-white hover:bg-[#e0480b]",
                          ].join(" ")}
                          disabled={enviado}
                          title={
                            enviado
                              ? "Ya marcado como realizado"
                              : "Marcar realizado"
                          }
                        >
                          {enviado ? "Realizado" : "Marcar realizado"}
                        </button>
                      </div>
                    </div>
                );
              })}
            </div>
          )}

          {/* SECCIÓN 2 — Seguimientos de ventas HOY */}
          <div className="mt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <h3 className="uppercase font-bignoodle text-[clamp(18px,3.5vw,24px)] font-bold text-gray-900 dark:text-white">
                Seguimientos de ventas
              </h3>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full bg-red-500 text-white text-xs sm:text-sm font-extrabold px-2.5 py-0.5 shadow">
                  {totalVentas}
                </span>
                <button
                  onClick={loadVentas}
                  className="rounded-lg bg-orange-100 hover:bg-orange-200 px-3 py-1.5 text-xs sm:text-sm font-semibold text-orange-700 active:scale-95 transition"
                >
                  Refrescar
                </button>
              </div>
            </div>

            {ventas === null && !errorVentas && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-orange-100 bg-orange-50/40 p-4 sm:p-6"
                  >
                    <div className="h-4 w-1/3 rounded bg-orange-200/70 mb-2" />
                    <div className="h-3 w-1/2 rounded bg-orange-200/50 mb-3" />
                    <div className="h-10 w-full rounded bg-orange-100/60" />
                  </div>
                ))}
              </div>
            )}

            {!!errorVentas && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
                {errorVentas}
              </div>
            )}

            {Array.isArray(ventas) && ventas.length === 0 && !errorVentas && (
              <div className="text-gray-400 text-sm sm:text-base text-center py-4 font-medium">
                No hay seguimientos pendientes hoy.
              </div>
            )}

            {Array.isArray(ventas) && ventas.length > 0 && (
              <div className="space-y-3">
                {ventas.map((it) => {
                  const isDone = !!it.done;
                  return (
                    <div
                      key={it.id}
                      className={[
                        // contenedor con fondo y borde lateral según estado
                        "group rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition border border-transparent",
                        "grid grid-cols-1 md:grid-cols-[1fr,auto] items-start gap-3 sm:gap-4",
                        isDone
                          ? "bg-green-50/90 border-l-8 border-l-green-400"
                          : "bg-orange-50/70 border-l-8 border-l-orange-300",
                      ].join(" ")}
                    >
                      {/* Columna izquierda */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              "h-2 w-2 rounded-full mt-1",
                              isDone ? "bg-green-500" : "bg-orange-500",
                            ].join(" ")}
                          />
                          <div className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            {it.prospecto?.nombre ??
                              `Prospecto #${it.prospecto_id}`}
                          </div>
                        </div>

                        <div className="mt-1 text-[11px] sm:text-xs text-gray-600 flex flex-wrap gap-x-2">
                          <span>Clase #{it.clase_num}</span>
                          <span>• {it.prospecto?.actividad || "—"}</span>
                          <span>• {it.prospecto?.sede || "—"}</span>
                        </div>

                        <div className="mt-2 text-sm text-gray-800 break-words">
                          {it.mensaje}
                        </div>

                        {/* Badges + acciones secundarias */}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={[
                              "inline-block rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold",
                              isDone
                                ? "bg-green-200 text-green-800"
                                : "bg-yellow-200 text-yellow-900",
                            ].join(" ")}
                          >
                            {isDone ? "Realizado" : "Pendiente"}
                          </span>

                          {it.prospecto?.contacto && (
                            <>
                              <a
                                href={waURL(
                                  it.prospecto.contacto,
                                  it.prospecto?.nombre
                                )}
                                target="_blank"
                                rel="noreferrer"
                                className={[
                                  "inline-flex items-center justify-center gap-2 rounded-lg text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 transition w-full sm:w-auto",
                                  isDone
                                    ? "bg-green-400 cursor-not-allowed opacity-70"
                                    : "bg-green-500/90 hover:bg-green-600",
                                ].join(" ")}
                                title={
                                  isDone ? "Ya realizado" : "Abrir WhatsApp"
                                }
                                onClick={(e) => isDone && e.preventDefault()}
                              >
                                WhatsApp
                              </a>
                              <button
                                onClick={() =>
                                  !isDone &&
                                  navigator.clipboard?.writeText(
                                    onlyDigits(it.prospecto.contacto)
                                  )
                                }
                                className={[
                                  "inline-flex items-center justify-center gap-2 rounded-lg text-[11px] sm:text-xs font-semibold px-3 py-1.5 transition w-full sm:w-auto",
                                  isDone
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-800",
                                ].join(" ")}
                                title={
                                  isDone ? "Ya realizado" : "Copiar teléfono"
                                }
                                disabled={isDone}
                              >
                                Copiar
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botón principal */}
                      <div className="md:pl-2">
                        <button
                          onClick={() => !isDone && marcarDone(it.id)}
                          className={[
                            "w-full md:w-auto rounded-xl px-4 py-2 text-sm md:text-[15px] font-bold text-white shadow transition",
                            isDone
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-[#fc4b08] hover:shadow-md hover:bg-[#e0480b] active:scale-95",
                          ].join(" ")}
                          disabled={isDone}
                          title={
                            isDone
                              ? "Ya marcado como realizado"
                              : "Marcar realizado"
                          }
                        >
                          {isDone ? "Realizado" : "Marcar realizado"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer botones (fuera del scroll, queda fijo) */}
        <div className="mt-3 w-full max-w-[95vw] sm:max-w-xl md:max-w-3xl lg:max-w-5xl px-2 sm:px-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <button
              className="w-full py-3 rounded-2xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-sm sm:text-base font-bold transition shadow-sm"
              onClick={() => {
                loadClases();
                loadVentas();
              }}
            >
              Refrescar todo
            </button>
            <button
              className="w-full py-3 rounded-2xl bg-[#fc4b08] hover:bg-orange-600 text-white text-sm sm:text-base font-bold transition shadow-md"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Animación y scrollbars */}
      <style>{`
    @keyframes fade-in {
      0% { opacity: 0; transform: translateY(32px);}
      100% { opacity: 1; transform: translateY(0);}
    }
    .animate-fade-in {
      animation: fade-in 0.5s cubic-bezier(.5,1.4,.7,1) both;
    }
    ::-webkit-scrollbar { height: 8px; width: 8px; background: transparent; }
    .scrollbar-thumb-orange-200::-webkit-scrollbar-thumb { background: #fde4cf; border-radius: 8px; }
  `}</style>
    </div>
  );
}
