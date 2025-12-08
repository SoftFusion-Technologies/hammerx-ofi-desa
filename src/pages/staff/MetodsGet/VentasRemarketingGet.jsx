/*
 * Programador: Matias Pallero
 * Fecha Cración: 20 / 10 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (VentasRemarketingGet.jsx) es el componente el cual muestra las ventas de remarketing.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: matuutepallero@gmail.com || 3865265100
 *
 */

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "../../../components/footer/Footer";
import NavbarStaff from "../NavbarStaff";
import FilterToolbar from "./Components/FilterToolbar";
import { useAuth } from "../../../AuthContext";
import * as XLSX from "xlsx";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import StatsVentasModal from "../../../components/StatsVentasModal";
import AgendasVentas from "../../../components/AgendasVentas";
import { useLocation } from "react-router-dom";
import FiltroMesAnio from "../Components/FiltroMesAnio";
import ObservacionField from "../Components/ObservacionField";
import AgendaDeHoyModal from "../Components/AgendaDeHoyModal";
import Swal from "sweetalert2";
import ComisionesModal from "./Components/ComisionesModal";
import VendedorComisionesPanel from "./Components/VendedorComisionesPanel";
import ComisionesVigentesModal from "../Components/ComisionesVigentesModal";
import FormAltaVentasRemarketing from "../../../components/Forms/FormAltaVentasRemarketing";
import styles from "../../../styles/MetodsGet/VentasRemarketingGet.module.css";
import ClasePruebaModal from "../Components/ClasePruebaModal";
import ContactoRapidoModal from "./Components/ContactoRapidoModal";

dayjs.extend(utc);
dayjs.extend(timezone);

const PLANES = [
  "Mensual",
  "Trimestre",
  "Semestre",
  "Anual",
  "Débitos automáticos",
  "Otros",
];

/**
 * Muestra un modal con select de planes + input de texto si elige "Otros"
 * @returns {Promise<{tipo_plan: string, tipo_plan_custom?: string} | null>}
 */
async function promptTipoPlanConOtros(planes) {
  const { value: formValues } = await Swal.fire({
    title: "Selecciona el tipo de plan",
    html: `
      <select id="swal-plan" class="swal2-input">
        <option value="">-- Selecciona --</option>
        ${planes.map((p) => `<option value="${p}">${p}</option>`).join("")}
      </select>
      <input 
        id="swal-plan-custom" 
        class="swal2-input" 
        placeholder="Especifica el plan" 
        style="display:none;"
      />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#10b981",
    cancelButtonColor: "#6b7280",
    didOpen: () => {
      const select = document.getElementById("swal-plan");
      const input = document.getElementById("swal-plan-custom");

      select.addEventListener("change", () => {
        if (select.value === "Otros") {
          input.style.display = "block";
          input.focus();
        } else {
          input.style.display = "none";
          input.value = "";
        }
      });
    },
    preConfirm: () => {
      const plan = document.getElementById("swal-plan").value;
      const custom = document.getElementById("swal-plan-custom").value;

      if (!plan) {
        Swal.showValidationMessage("Debes seleccionar un plan");
        return null;
      }
      if (plan === "Otros" && !custom.trim()) {
        Swal.showValidationMessage("Debes especificar el tipo de plan");
        return null;
      }

      return {
        tipo_plan: plan,
        ...(plan === "Otros" ? { tipo_plan_custom: custom.trim() } : {}),
      };
    },
  });

  return formValues || null;
}

const getBgClass = (p) => {
  if (p.comision_estado === "en_revision") return "bg-amber-400";
  if (p.comision_estado === "aprobado") return "bg-sky-400";
  if (p.comision_estado === "rechazado") return "bg-rose-500";

  const esCom = p.comision === true || p.comision === 1 || p.comision === "1";
  const esConv =
    p.convertido === true || p.convertido === 1 || p.convertido === "1";
  if (esCom) return "bg-sky-400";
  if (esConv) return "bg-green-500";
  return "";
};

const esConvertido = (v) => v === true || v === 1 || v === "1";
const esComision = (v) => v === true || v === 1 || v === "1";

const verificarEstadoComision = async (prospecto) => {
  try {
    // Solo verificar si está convertido
    if (!prospecto.convertido) return null;

    // Si ya tiene comisión con estado definido, no hacer nada
    if (prospecto.comision_estado) return null;

    // 🔍 Verificar si cumple criterios para tener comisión
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/comisiones/verificar/${prospecto.id}`
    );

    if (response.data.debe_tener_comision) {
      return {
        id: prospecto.id,
        comision_estado: "en_revision",
        comision: true,
      };
    }

    return null;
  } catch (error) {
    console.error(
      `Error verificando comisión para prospecto ${prospecto.id}:`,
      error
    );
    return null;
  }
};

const SEDES = [
  { value: "Monteros", label: "Monteros" },
  { value: "Concepción", label: "Concepción" },
  { value: "barrio sur", label: "Barrio Sur" },
  { value: "barrio norte", label: "Barrio Norte" },
];

// const normalizeSede = (sede) => {
//   if (!sede) return "";
//   const normalized = sede.toLowerCase().replace(/\s/g, "");
//   return normalized === "barriosur" ? "smt" : normalized;
// };

const normalizeSede2 = (sede) => {
  if (!sede) return "";
  let normalized = sede.toLowerCase().replace(/\s/g, "");
  if (normalized === "barriosur" || normalized === "barrio sur") {
    normalized = "barrio sur";
  } else if (normalized === "barrionorte") {
    normalized = "barrio norte";
  } else if (normalized === "concepción") {
    normalized = "concepcion";
  }

  return normalized;
};

function aplicarFiltros({
  prospectos,
  search,
  selectedSede,
  tipoFiltro,
  canalFiltro,
  actividadFiltro,
  convertidoFiltro,
  comisionFiltro,
  alertaFiltro,
  comisionEstadoFiltro,
  alertasSegundoContacto,
  enviadoFiltro,
  respondidoFiltro,
  agendadoFiltro,
  contactadoFiltro,
  ordenCampo,
  ordenDireccion,
}) {
  if (!prospectos?.length) return [];

  const q = (search || "").toLowerCase();

  const filtered = prospectos.filter((p) => {
    // 1) búsqueda por nombre
    const nombreMatch = (p.nombre || "").toLowerCase().includes(q);
    const contactoMatch = (p.contacto || "").toLowerCase().includes(q);
    const actividadMatch = (p.actividad || "").toLowerCase().includes(q);
    if (!nombreMatch && !contactoMatch && !actividadMatch) return false;

    // 2) sede
    if (selectedSede) {
      const sedeProspecto = normalizeSede2(p.sede);
      if (sedeProspecto !== selectedSede) return false;
    }

    // 3) filtros select
    if (tipoFiltro) {
      // Con ENUM, la comparación es directa y case-sensitive
      if (p.tipo_prospecto !== tipoFiltro) return false;
    }
    if (canalFiltro && p.canal_contacto !== canalFiltro) return false;
    if (actividadFiltro && p.actividad !== actividadFiltro) return false;

    // 4) Filtro convertido
    if (convertidoFiltro === "si" && !p.convertido) return false;
    if (convertidoFiltro === "no" && p.convertido) return false;

    // 5) Filtro comisión
    if (comisionFiltro === "con" && !p.comision) return false;
    if (comisionFiltro === "sin" && p.comision) return false;

    // 6) Filtro alerta
    if (alertaFiltro && !alertasSegundoContacto[p.id]) return false;

    // 7) Filtro estado comisión
    if (comisionEstadoFiltro && p.comision_estado !== comisionEstadoFiltro)
      return false;

    // 8) Filtro enviado
    if (enviadoFiltro === "si" && !p.enviado) return false;
    if (enviadoFiltro === "no" && p.enviado) return false;

    // 9) Filtro respondido
    if (respondidoFiltro === "si" && !p.respondido) return false;
    if (respondidoFiltro === "no" && p.respondido) return false;

    // 10) Filtro contactado
    if (contactadoFiltro === "si" && !p.contactado) return false;
    if (contactadoFiltro === "no" && p.contactado) return false;

    // 11) Filtro agendado
    if (agendadoFiltro) {
      const tieneClaseProgramada =
        !!p.clase_prueba_1_fecha ||
        !!p.clase_prueba_2_fecha ||
        !!p.clase_prueba_3_fecha;

      if (agendadoFiltro === "si" && !tieneClaseProgramada) return false;
      if (agendadoFiltro === "no" && tieneClaseProgramada) return false;
    }

    return true;
  });

  // Ordenar como en la UI (convertido primero false->true, luego id desc)
  const sorted = filtered.sort((a, b) => {
    // Los no convertidos van primero
    if (!a.convertido && b.convertido) return -1;
    if (a.convertido && !b.convertido) return 1;

    // Si tienen el mismo estado de conversión, ordenar por el campo seleccionado
    let valorA, valorB;

    // Determinar valores según el campo
    switch (ordenCampo) {
      case "id":
        valorA = a.id;
        valorB = b.id;
        break;
      case "fecha":
        valorA = a.fecha ? new Date(a.fecha).getTime() : 0;
        valorB = b.fecha ? new Date(b.fecha).getTime() : 0;
        break;
      case "nombre":
        valorA = (a.nombre || "").toLowerCase();
        valorB = (b.nombre || "").toLowerCase();
        break;
      case "asesor":
        valorA = (a.asesor_nombre || "").toLowerCase();
        valorB = (b.asesor_nombre || "").toLowerCase();
        break;
      case "convertido":
        // Ya están ordenados arriba
        valorA = a.id;
        valorB = b.id;
        break;
      case "actividad":
        valorA = (a.actividad || "").toLowerCase();
        valorB = (b.actividad || "").toLowerCase();
        break;
      case "sede":
        valorA = (a.sede || "").toLowerCase();
        valorB = (b.sede || "").toLowerCase();
        break;
      default:
        valorA = a.id;
        valorB = b.id;
    }

    // Comparar según dirección
    if (valorA < valorB) return ordenDireccion === "asc" ? -1 : 1;
    if (valorA > valorB) return ordenDireccion === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

function exportProspectosExcel({
  mes,
  anio,
  prospectos,
  search,
  selectedSede,
  tipoFiltro,
  canalFiltro,
  actividadFiltro,
  formatDate,
}) {
  // 1) Tomamos TODO lo filtrado (no paginado)
  const rows = aplicarFiltros({
    prospectos,
    search,
    selectedSede,
    tipoFiltro,
    canalFiltro,
    actividadFiltro,
  });

  // 2) Mapeo a AOA (array of arrays) para controlar orden y encabezados
  const header = [
    "Fecha",
    "Colaborador",
    "Nombre",
    "DNI",
    "Tipo Prospecto",
    "Canal Contacto",
    "Usuario / Celular",
    "Actividad",
    "#1",
    "#2",
    "#3",
    "Clase 1",
    "Clase 2",
    "Clase 3",
    "Observación",
    "Convertido",
  ];

  const aoa = [
    header,
    ...rows.map((p) => [
      p.fecha ? formatDate(p.fecha) : "",
      p.asesor_nombre || "",
      p.nombre || "",
      p.dni || "",
      p.tipo_prospecto || "",
      p.canal_contacto || "",
      p.contacto || "",
      p.actividad || "",
      "✔", // #1 fijo marcado en UI
      p.n_contacto_2 ? "✔" : "",
      p.n_contacto_3 ? "✔" : "",
      p.clase_prueba_1_fecha ? formatDate(p.clase_prueba_1_fecha) : "",
      p.clase_prueba_2_fecha ? formatDate(p.clase_prueba_2_fecha) : "",
      p.clase_prueba_3_fecha ? formatDate(p.clase_prueba_3_fecha) : "",
      (p.observacion || "").toString().replace(/\n/g, " "),
      p.convertido ? "Sí" : "No",
    ]),
  ];

  // 3) Crear Sheet y Workbook
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 4) Ancho de columnas aproximado
  ws["!cols"] = [
    { wch: 12 }, // Fecha
    { wch: 20 }, // Colaborador
    { wch: 24 }, // Nombre
    { wch: 14 }, // DNI
    { wch: 16 }, // Tipo Prospecto
    { wch: 18 }, // Canal
    { wch: 22 }, // Usuario/Celular
    { wch: 18 }, // Actividad
    { wch: 6 }, // #1
    { wch: 6 }, // #2
    { wch: 6 }, // #3
    { wch: 12 }, // Clase 1
    { wch: 12 }, // Clase 2
    { wch: 12 }, // Clase 3
    { wch: 30 }, // Observación
    { wch: 10 }, // Convertido
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    `Remarketing${anio}-${String(mes).padStart(2, "0")}`
  );

  // 5) Descargar
  const filename = `Remarketing${anio}-${String(mes).padStart(2, "0")}.xlsx`;
  XLSX.writeFile(wb, filename);
}

const VentasRemarketingGet = ({ currentUser }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [prospectos, setProspectos] = useState([]);
  const [prospectosConAgendaHoy, setProspectosConAgendaHoy] = useState([]);

  const [selectedProspecto, setSelectedProspecto] = useState(null);

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const [ordenCampo, setOrdenCampo] = useState("id"); // campo por el cual ordenar
  const [ordenDireccion, setOrdenDireccion] = useState("desc"); // 'asc' o 'desc'

  const { userLevel, userId, userName } = useAuth(); // suponiendo que tienes userId también

  const [modalClaseOpen, setModalClaseOpen] = useState(false);
  const [modalNew, setModalNew] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null); // {id, num}
  // const [tipoSeleccionado, setTipoSeleccionado] = useState(null); // para el modal de clase

  const [userSede, setUserSede] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null); // null = todas o ninguna sede seleccionada

  // relacion al filtrado
  const [tipoFiltro, setTipoFiltro] = React.useState("");
  const [canalFiltro, setCanalFiltro] = React.useState("");
  const [actividadFiltro, setActividadFiltro] = React.useState("");
  const [contactadoFiltro, setContactadoFiltro] = useState("");

  const [showStats, setShowStats] = useState(false);

  const [observaciones, setObservaciones] = useState({});

  const location = useLocation();
  const prospectoIdToScroll = location.state?.prospectoId;
  const dataLoaded = useRef(false); // Para evitar scroll antes de que llegue la data

  const [agendaVentasCant, setAgendaVentasCant] = useState(0);
  const [showAgendasModal, setShowAgendasModal] = useState(false);

  const [alertasSegundoContacto, setAlertasSegundoContacto] = useState({});

  const [modalTipo, setModalTipo] = useState(null);
  const [prospectoActual, setProspectoActual] = useState(null);

  const [mes, setMes] = useState(() => {
    // Intenta recuperar del localStorage
    const saved = localStorage.getItem("remarketing_mes");
    if (saved) return saved;

    // Si no hay guardado, usa mes actual
    const ahora = new Date();
    return String(ahora.getMonth() + 1).padStart(2, "0");
  });

  const [anio, setAnio] = useState(() => {
    const saved = localStorage.getItem("remarketing_anio");
    if (saved) return saved;

    return String(new Date().getFullYear());
  });

  const [openAgenda, setOpenAgenda] = useState(false);

  // const [soloConvertidos, setSoloConvertidos] = useState(false);
  const [alertaFiltro, setAlertaFiltro] = useState("");
  const [convertidoFiltro, setConvertidoFiltro] = useState("");

  // Evita clicks dobles mientras se procesa
  const [savingIds, setSavingIds] = useState(new Set());

  const [comisionFiltro, setComisionFiltro] = useState("");
  // '' | 'con' | 'sin'

  const [showComisiones, setShowComisiones] = useState(false);

  const [comisionEstadoFiltro, setComisionEstadoFiltro] = useState("");
  // valores: '', 'en_revision', 'aprobado', 'rechazado'

  // NUEVOS FILTROS
  const [enviadoFiltro, setEnviadoFiltro] = useState("");
  const [respondidoFiltro, setRespondidoFiltro] = useState("");
  const [agendadoFiltro, setAgendadoFiltro] = useState("");
  const [estadoComisionFiltro, setEstadoComisionFiltro] = useState("");

  const [currentUser2, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [openComi, setOpenComi] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const fetchUserSede = async () => {
      try {
        const response = await fetch(`${URL}/users/${userId}`);
        if (!response.ok)
          throw new Error("No se pudo obtener la info del usuario");
        const data = await response.json();
        setUserSede(normalizeString(data.sede || ""));
      } catch (error) {
        console.error("Error cargando sede del usuario:", error);
      }
    };

    fetchUserSede();
  }, [userId]);

  useEffect(() => {
    if (userSede && !selectedSede) {
      setSelectedSede(userSede);
    }
  }, [userSede, selectedSede]);

  const URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  const userFromAuth = useMemo(
    () => ({
      id: userId ?? null,
      name: userName ?? "",
      level: userLevel ?? "",
      sede: "", // lo completamos desde la API si está
    }),
    [userId, userName, userLevel]
  );

  const formatDate = (fecha) => {
    if (!fecha) return "";
    return dayjs(fecha).format("DD/MM/YYYY");
  };

  const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    // Si viene en formato "YYYY-MM-DD", lo parseamos directamente sin zona horaria
    const [year, month, day] = dateString.split("T")[0].split("-");
    return `${year}-${month}-${day}`;
  };

  const normalizeString = (str) => {
    return (str || "").toLowerCase().trim();
  };

  const sedes = [
    { key: "monteros", label: "Monteros" },
    { key: "concepcion", label: "Concepción" },
    { key: "barrio sur", label: "Tucumán Barrio Sur" },
    { key: "barrio norte", label: "Tucumán Barrio Norte" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (mes) localStorage.setItem("remarketing_mes", mes);
  }, [mes]);

  useEffect(() => {
    if (anio) localStorage.setItem("remarketing_anio", anio);
  }, [anio]);

  useEffect(() => {
    let timer = setTimeout(() => setShowAgendasModal(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (!mes || !anio) {
        return;
      }

      try {
        const response = await axios.get(`${URL}/ventas-remarketing`, {
          params: {
            mes,
            anio,
            offset: 0,
          },
        });

        let data = [];

        if (
          response.data?.registros &&
          Array.isArray(response.data.registros)
        ) {
          data = response.data.registros;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        } else {
          console.error("❌ Formato desconocido:", response.data);
          data = [];
        }

        const normalizedData = data.map((p) => {
          const normalized = {
            ...p,
            contactado: !!(
              p.contactado === 1 ||
              p.contactado === "1" ||
              p.contactado === true
            ),
            convertido: !!(
              p.convertido === 1 ||
              p.convertido === "1" ||
              p.convertido === true
            ),
            comision: !!(
              p.comision === 1 ||
              p.comision === "1" ||
              p.comision === true
            ),
            n_contacto_1: !!(
              p.n_contacto_1 === 1 ||
              p.n_contacto_1 === "1" ||
              p.n_contacto_1 === true
            ),
            n_contacto_2: !!(
              p.n_contacto_2 === 1 ||
              p.n_contacto_2 === "1" ||
              p.n_contacto_2 === true
            ),
            n_contacto_3: !!(
              p.n_contacto_3 === 1 ||
              p.n_contacto_3 === "1" ||
              p.n_contacto_3 === true
            ),
            enviado: !!(
              p.enviado === 1 ||
              p.enviado === "1" ||
              p.enviado === true
            ),
            respondido: !!(
              p.respondido === 1 ||
              p.respondido === "1" ||
              p.respondido === true
            ),
            agendado: !!(
              p.agendado === 1 ||
              p.agendado === "1" ||
              p.agendado === true
            ),
          };

          if (p.id === data[0]?.id) {
          }

          return normalized;
        });

        setProspectos(normalizedData);
        dataLoaded.current = true;
      } catch (error) {
        console.error("❌ Error cargando prospectos:", error);
        console.error("❌ Response:", error.response?.data);
        setProspectos([]);
      }
    };

    loadData();
  }, [mes, anio, URL]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      if (!userId) {
        setCurrentUser(userFromAuth);
        setUserLoading(false);
        return;
      }

      setUserLoading(true);
      setCurrentUser(userFromAuth);

      try {
        // 🔧 Intenta obtener desde /users/:id
        const { data } = await axios.get(`${URL}/users/${userId}`);
        if (!cancelled && data) {
          setCurrentUser({
            id: data.id,
            name: data.name || data.usuario,
            level: data.level || data.nivel,
            sede: data.sede ?? "",
          });
          setUserLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }

      if (!cancelled) {
        setCurrentUser(userFromAuth);
        setUserLoading(false);
      }
    }

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, [userId, userFromAuth, URL]);

  useEffect(() => {
    if (!prospectos.length) return;

    const alertas = {};
    const hoy = dayjs();

    prospectos.forEach((p) => {
      // Si no tiene segundo contacto y han pasado X días
      if (!p.n_contacto_2 && p.fecha) {
        const diasTranscurridos = hoy.diff(dayjs(p.fecha), "day");
        if (diasTranscurridos >= 7) alertas[p.id] = "rojo";
        else if (diasTranscurridos >= 5) alertas[p.id] = "amarillo";
      }
    });

    setAlertasSegundoContacto(alertas);
  }, [prospectos]);

  // Cargar prospectos con agenda hoy
  useEffect(() => {
    if (!userId) return;

    axios
      .get(`${URL}/notifications/clases-prueba/${userId}`)
      .then((res) =>
        setProspectosConAgendaHoy(res.data.map((p) => p.prospecto_id))
      )
      .catch(() => setProspectosConAgendaHoy([]));
  }, [userId, URL]);

  useEffect(() => {
    const loadClasesRemarketing = async () => {
      try {
        // 1. Cargar agendas de VENTAS
        const qsVentas = new URLSearchParams({
          level: userLevel === "admin" ? "admin" : "vendedor",
          ...(userLevel !== "admin" ? { usuario_id: String(userId) } : {}),
          with_prospect: "1",
        });

        const resVentas = await fetch(
          `${URL}/ventas/agenda/hoy?${qsVentas.toString()}`
        );

        if (!resVentas.ok) {
          throw new Error(`HTTP error! status: ${resVentas.status}`);
        }

        const dataVentas = await resVentas.json();

        // 🔧 Extraer IDs de prospectos de VENTAS
        const ventasProspectoIds = Array.isArray(dataVentas)
          ? dataVentas.map((v) => Number(v.prospecto_id)).filter(Boolean)
          : [];

        // 2. Cargar clases de REMARKETING
        const hoy = dayjs()
          .tz("America/Argentina/Buenos_Aires")
          .format("YYYY-MM-DD");
        const resRemarketing = await axios.get(
          `${URL}/ventas-remarketing/clases-hoy`,
          {
            params: {
              fecha: hoy,
              ...(userLevel !== "admin" ? { usuario_id: userId } : {}),
            },
          }
        );

        const remarketingIds = Array.isArray(resRemarketing.data)
          ? resRemarketing.data
              .map((c) => Number(c.prospecto_id))
              .filter(Boolean)
          : [];

        // 🆕 COMBINAR AMBOS ARRAYS SIN DUPLICADOS
        const todosLosIds = [
          ...new Set([...ventasProspectoIds, ...remarketingIds]),
        ];

        // Actualizar estados
        setProspectosConAgendaHoy(todosLosIds); // 👈 Ahora incluye AMBOS
        setAgendaVentasCant(todosLosIds.length); // 👈 Contador total
      } catch (error) {
        console.error("❌ Error cargando agendas de hoy:", error);
        setProspectosConAgendaHoy([]);
        setAgendaVentasCant(0);
      }
    };

    loadClasesRemarketing();
  }, [userId, userLevel, URL]);

  useEffect(() => {
    axios
      .get(`${URL}/prospectos-alertas`)
      .then((res) => {
        const obj = {};
        res.data.forEach((p) => {
          obj[p.id] = p.color_2do_contacto;
        });
        setAlertasSegundoContacto(obj);
      })
      .catch(() => setAlertasSegundoContacto({}));
  }, [URL]);

  useEffect(() => {
    if (dataLoaded.current && prospectoIdToScroll) {
      const row = document.getElementById(`prospecto-${prospectoIdToScroll}`);
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.add("bg-yellow-200", "animate-pulse");
        setTimeout(
          () => row.classList.remove("animate-pulse", "bg-yellow-200"),
          1500
        );
      }
    }
  }, [prospectos, prospectoIdToScroll]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  const handleChange = async (id, campo, valor) => {
    try {
      // Actualizar localmente
      setProspectos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
      );

      // Guardar en backend
      await axios.put(`${URL}/ventas-remarketing/${id}`, {
        [campo]: valor,
      });
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

  const handleSedeChange = (id, valor) => handleChange(id, "sede", valor);

  const handleOrigenChange = (id, valor) =>
    handleChange(id, "campania_origen", valor);
  const handleActividadChange = (id, valor) =>
    handleChange(id, "actividad", valor);
  const handleCanalChange = (id, valor) =>
    handleChange(id, "canal_contacto", valor);

  const handleCheckboxChange = async (id, campo) => {
    const prospecto = prospectos.find((p) => p.id === id);
    const nextValue = !prospecto?.[campo];

    // 🆕 Si están activando la primera visita (#1), activar también "contactado"
    if (campo === "n_contacto_1") {
      // Actualizar localmente ambos campos
      setProspectos((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, n_contacto_1: nextValue, contactado: nextValue }
            : p
        )
      );

      // Guardar en backend
      try {
        await axios.put(`${URL}/ventas-remarketing/${id}`, {
          n_contacto_1: nextValue,
          contactado: nextValue,
        });
      } catch (error) {
        console.error("Error al actualizar primera visita:", error);
        // Revertir en caso de error
        setProspectos((prev) => prev.map((p) => (p.id === id ? prospecto : p)));
      }
    } else {
      // Caso normal para #2, #3 o desmarcar #1
      handleChange(id, campo, nextValue);
    }
  };

  const handleConvertidoToggle = async (prospectoId, nextValue) => {
    if (savingIds.has(prospectoId)) return;
    setSavingIds((s) => new Set([...s, prospectoId]));

    const prospecto = prospectos.find((p) => p.id === prospectoId);
    if (!prospecto) {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(prospectoId);
        return n;
      });
      return;
    }

    // No permitir convertir si no está contactado
    if (nextValue && !prospecto.contactado) {
      await Swal.fire({
        title: "Cliente no contactado",
        text: "Debes marcar al cliente como contactado antes de convertirlo.",
        icon: "warning",
        confirmButtonColor: "#f97316",
        confirmButtonText: "Entendido"
      });
      
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(prospectoId);
        return n;
      });
      return;
    }

    const prev = { ...prospecto };

    // Caso 1: Destildan => revertir conversión
    if (!nextValue) {
      const result = await Swal.fire({
        title: '¿Anular conversión?',
        text: `¿Estás seguro de que deseas anular la conversión de "${prospecto?.nombre || 'el prospecto'}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, anular',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
      });

      if (!result.isConfirmed) {
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }
      // Actualizar localmente
      setProspectos((arr) =>
        arr.map((p) =>
          p.id === prospectoId
            ? {
                ...p,
                convertido: false,
                comision: false,
                comision_estado: null, // Limpiar estado
                comision_tipo_plan: null, // Limpiar plan
                comision_tipo_plan_custom: null, // Limpiar custom
                comision_monto: null, // Limpiar monto
                comision_motivo_rechazo: null, // Limpiar rechazo
              }
            : p
        )
      );

      try {
        await axios.put(`${URL}/ventas-remarketing/${prospectoId}`, {
          convertido: false,
          convertido_at: null,
        });

        await Swal.fire({
          title: 'Actualizado',
          text: `Se anuló la conversión de "${prospecto.nombre}".`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (e) {
        setProspectos((arr) =>
          arr.map((p) => (p.id === prospectoId ? prev : p))
        );
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo anular la conversión.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
      }
      return;
    }

    // Caso 2: Tildan => pregunta si es comisión
    try {
      const { isConfirmed, isDenied, dismiss } = await Swal.fire({
        title: '¿Es comisión?',
        text: `Vas a marcar convertido a "${prospecto.nombre}". ¿Corresponde comisión?`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Sí, es comisión',
        denyButtonText: 'No',
        confirmButtonColor: '#10b981',
        denyButtonColor: '#6b7280',
        cancelButtonText: 'Cancelar'
      });

      if (dismiss === Swal.DismissReason.cancel) {
        // Usuario canceló
        setProspectos((arr) =>
          arr.map((p) =>
            p.id === prospectoId ? { ...p, convertido: prev.convertido } : p
          )
        );
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }

      // Optimista: convertido true siempre
      setProspectos((arr) =>
        arr.map((p) => (p.id === prospectoId ? { ...p, convertido: true } : p))
      );

      if (isDenied) {
        // No es comisión
        const updates = {
          convertido: true,
          comision: false,
          comision_estado: null,
        };

        await axios.put(`${URL}/ventas-remarketing/${prospectoId}`, updates);

        setProspectos((arr) =>
          arr.map((p) => (p.id === prospectoId ? { ...p, ...updates } : p))
        );

        await Swal.fire({
          icon: 'success',
          title: 'Convertido sin comisión',
          html: `
            <p><strong>${prospecto?.nombre}</strong> fue marcado como convertido.</p>
            <p class="text-sm text-gray-600 mt-2">Sin comisión asociada.</p>
          `,
          timer: 2500,
          showConfirmButton: false,
        });

        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }

      // Sí es comisión: pedir tipo de plan y monto
      const planData = await promptTipoPlanConOtros(PLANES);
      if (!planData) {
        // Canceló el selector de plan
        setProspectos((arr) =>
          arr.map((p) => (p.id === prospectoId ? prev : p))
        );
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }

      const { tipo_plan, tipo_plan_custom } = planData;

      const payload = {
        convertido: true,
        comision: true,
        comision_estado: "en_revision",
        comision_tipo_plan: tipo_plan,
        ...(tipo_plan === "Otros" ? { comision_tipo_plan_custom } : {}),
      };

      await axios.put(`${URL}/ventas-remarketing/${prospectoId}`, payload);

      setProspectos((arr) =>
        arr.map((p) => (p.id === prospectoId ? { ...p, ...payload } : p))
      );

      await Swal.fire({
        title: "Comisión enviada",
        text: "Tu comisión quedó en revisión. Un coordinador la aprobará o rechazará.",
        icon: "success",
        confirmButtonColor: "#10b981",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (e) {
      setProspectos((arr) => arr.map((p) => (p.id === prospectoId ? prev : p)));
      await Swal.fire({
        title: "Error",
        text: "No se pudo convertir/registrar la comisión.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(prospectoId);
        return n;
      });
    }
  };

  const handleEliminarProc = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar prospecto?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${URL}/ventas-remarketing/${id}`);
        setProspectos((prev) => prev.filter((p) => p.id !== id));
        Swal.fire("Eliminado", "El prospecto ha sido eliminado", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar el prospecto", "error");
      }
    }
  };

  const openClasePruebaModal = () => {
    setClaseSeleccionada({ id, num });
    setModalClaseOpen(true);
  };

  const openClasePruebaPicker = (prospecto, num) => {
    const fechaKey = `clase_prueba_${num}_fecha`;
    const tipoKey = `clase_prueba_${num}_tipo`;

    const yaTieneDatos = Boolean(prospecto?.[fechaKey] || prospecto?.[tipoKey]);

    // Si ya tiene datos, ábrelo directamente.
    if (yaTieneDatos) {
      setClaseSeleccionada({ id: prospecto.id, num, prospecto });
      setModalClaseOpen(true);
      return;
    }

    // No tiene datos -> primero el picker de tipo
    Swal.fire({
      title: `Clase #${num}`,
      text: "¿Qué querés agendar?",
      input: "select",
      inputOptions: {
        Agenda: "Agenda",
        "Visita programada": "Visita programada",
        "Clase de prueba": "Clase de prueba",
      },
      inputPlaceholder: "Seleccioná una opción",
      showCancelButton: true,
      confirmButtonText: "Continuar",
      confirmButtonColor: "#10b981",
      cancelButtonText: "Cancelar",
      allowOutsideClick: false,
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        // Crea un *nuevo* objeto prospecto (una copia)
        const prospectoConTipo = {
          ...prospecto,
          // Inserta el tipo seleccionado (res.value) en el campo correcto
          [`clase_prueba_${num}_tipo`]: res.value,
        };

        setProspectos((prev) =>
          prev.map((p) => (p.id === prospecto.id ? prospectoConTipo : p))
        );

        // Guarda este *nuevo* objeto prospecto en el estado
        setClaseSeleccionada({
          id: prospecto.id,
          num,
          prospecto: prospectoConTipo,
        });
        setModalClaseOpen(true);
      }
    });
  };

  const abrirModal = () => {
    setSelectedProspecto(null);
    setModalNew(true);
  };

  const cerrarModalNuevo = async () => {
    setModalNew(false);
    setSelectedProspecto(null);
  };

  const handleGuardadoExitoso = async () => {
    setModalNew(false);
    setSelectedProspecto(null);

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (mes && anio) {
      try {
        Swal.fire({
          title: "Actualizando...",
          text: "Cargando nuevo registro",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.get(`${URL}/ventas-remarketing`, {
          params: { mes, anio, offset: 0 },
        });

        let data = [];
        if (
          response.data?.registros &&
          Array.isArray(response.data.registros)
        ) {
          data = response.data.registros;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          data = response.data.data;
        }

        setProspectos(data);
        setPage(1);
        setSearch("");
        setDebouncedSearch("");

        Swal.close();

        Swal.fire({
          icon: "success",
          title: "Registro creado",
          text: "El nuevo prospecto se agregó correctamente",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("❌ Error al refrescar prospectos:", error);
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: "No se pudo recargar la lista. Por favor, recarga la página.",
        });
      }
    }
  };

  const handleAprobarComision = async (prospecto) => {
    // 1. Preguntar tipo de plan
    let tipo_plan = prospecto.comision_tipo_plan;
    let tipo_plan_custom = prospecto.comision_tipo_plan_custom;

    // Solo pedir tipo de plan si NO lo tiene
    if (!tipo_plan) {
      const planData = await promptTipoPlanConOtros(PLANES);

      if (!planData) {
        // Usuario canceló el modal
        return;
      }

      tipo_plan = planData.tipo_plan;
      tipo_plan_custom = planData.tipo_plan_custom;
    }

    // Cargar vendedores permitidos
    const sellers = await loadAllowedSellers();

    // Si la lista está vacía, usamos al usuario actual como fallback
    const defaultSellerId = prospecto.vendedor_id || userId;

    const sellerOptions =
      sellers.length > 0
        ? sellers
            .map((u) => `<option value="${u.id}">${u.name}</option>`)
            .join("")
        : `<option value="${defaultSellerId}">Usuario Actual</option>`;

    // 2. PEDIR MONTO (siempre)
    const { isConfirmed, value } = await Swal.fire({
      title: "Aprobar comisión",
      // Estilos oscuros para coincidir con tu imagen
      background: "#1f2937", // bg-gray-800
      color: "#fff",
      html: `
          <label style="display:block;margin-bottom:6px; color: #e5e7eb">Monto de la comisión</label>
          <input 
            id="swal-monto" 
            type="number" 
            min="0" 
            step="100" 
            class="swal2-input"
            style="width:100%; margin:0; background:#111827; color:white; border: 1px solid #f97316;" 
            placeholder="Ej: 2000.00" 
            value="${prospecto.comision_monto || ""}"
          />

          <div style="height:15px"></div>

          <label style="display:block;margin-bottom:6px; color: #e5e7eb">Asignar a vendedor</label>
          <select 
            id="swal-vendedor" 
            class="swal2-select"
            style="width:100%; margin:0; background:#111827; color:white; border: 1px solid #374151;"
          >
            ${sellerOptions}
          </select>
        </div>
      `,
      didOpen: () => {
        const $monto = document.getElementById("swal-monto");
        const $vend = document.getElementById("swal-vendedor");

        // Preseleccionar vendedor si existe, sino el actual
        if ($vend) $vend.value = prospecto.vendedor_id || userId;
        if ($monto && !prospecto.comision_monto) $monto.focus();
      },
      showCancelButton: true,
      confirmButtonText: "Aprobar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#10b981", // Verde
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const $monto = document.getElementById("swal-monto");
        const $vend = document.getElementById("swal-vendedor");

        const monto = parseFloat($monto.value);
        const vendedor_id = $vend.value;

        if (!monto || monto <= 0) {
          Swal.showValidationMessage("Debes ingresar un monto válido");
          return false;
        }
        if (!vendedor_id) {
          Swal.showValidationMessage("Debes seleccionar un vendedor");
          return false;
        }

        return { monto, vendedor_id };
      },
    });

    if (!isConfirmed) return;

    const { monto, vendedor_id } = value;

    const vendedorSeleccionado = sellers.find(s => String(s.id) === String(vendedor_id));
    const nombreVendedor = vendedorSeleccionado?.name || prospecto.asesor_nombre;

    // 3. Confirmar aprobación con TODOS los datos
    const result = await Swal.fire({
      title: "¿Aprobar comisión?",
      html: `
        <div class="text-left space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
          <p class="flex items-center gap-2">
            <strong>Cliente:</strong> <span class="text-gray-700">${
              prospecto.nombre
            }</span>
          </p>
          <p class="flex items-center gap-2">
            <strong>Vendedor:</strong> <span class="text-gray-700">${nombreVendedor}</span>
          </p>
          <p class="flex items-center gap-2">
            <strong>Plan:</strong> <span class="text-gray-700">${tipo_plan}${
        tipo_plan === "Otros" ? ` (${tipo_plan_custom})` : ""
      }</span>
          </p>
          <p class="flex items-center gap-2">
            <strong>Monto:</strong> <span class="text-emerald-700">$${Number(
              monto
            ).toLocaleString("es-AR")}</span>
          </p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0ea5e9",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "✓ Sí, aprobar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // 4. Guardar en backend con TODOS los datos
        await axios.put(`${URL}/ventas-remarketing/${prospecto.id}`, {
          comision_estado: "aprobado",
          comision_tipo_plan: tipo_plan,
          comision_monto: monto,
          usuario_id: vendedor_id,
          ...(tipo_plan === "Otros"
            ? { comision_tipo_plan_custom: tipo_plan_custom }
            : {}),
        });

        // 5. Actualizar estado local
        setProspectos((prev) =>
          prev.map((p) =>
            p.id === prospecto.id
              ? {
                  ...p,
                  comision_estado: "aprobado",
                  comision_tipo_plan: tipo_plan,
                  comision_monto: monto, // 👈 Agregar el monto localmente
                  usuario_id: vendedor_id,
                  asesor_nombre: sellers.find(s => String(s.id) === String(vendedor_id))?.name || prospecto.asesor_nombre,
                  ...(tipo_plan === "Otros"
                    ? { comision_tipo_plan_custom: tipo_plan_custom }
                    : {}),
                }
              : p
          )
        );

        Swal.fire({
          title: "Aprobado",
          text: "Comisión aprobada correctamente.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      } catch (error) {
        console.error("Error al aprobar comisión:", error);
        Swal.fire({
          title: "Error",
          text: "No se pudo aprobar la comisión",
          icon: "error",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  const handleRechazarComision = async (prospecto) => {
    const result = await Swal.fire({
      title: "¿Rechazar comisión?",
      html: `
        <p><strong>Cliente:</strong> ${prospecto.nombre}</p>
        <p><strong>Vendedor:</strong> ${prospecto.asesor_nombre}</p>
      `,
      input: "textarea",
      inputLabel: "Motivo del rechazo",
      inputPlaceholder: "Escribe el motivo...",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Debes escribir un motivo";
        }
      },
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`${URL}/ventas-remarketing/${prospecto.id}`, {
          comision_estado: "rechazado",
          comision_motivo_rechazo: result.value,
        });

        setProspectos((prev) =>
          prev.map((p) =>
            p.id === prospecto.id
              ? {
                  ...p,
                  comision_estado: "rechazado",
                  comision_motivo_rechazo: result.value,
                }
              : p
          )
        );

        Swal.fire("Rechazado", "La comisión ha sido rechazada", "success");
      } catch (error) {
        Swal.fire("Error", "No se pudo rechazar la comisión", "error");
      }
    }
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🔧 AGREGAR LÓGICA DE PAGINACIÓN Y FILTRADO
  const sorted = useMemo(() => {
    return aplicarFiltros({
      prospectos,
      search: debouncedSearch,
      selectedSede,
      tipoFiltro,
      canalFiltro,
      actividadFiltro,
      convertidoFiltro,
      comisionFiltro,
      alertaFiltro,
      comisionEstadoFiltro,
      alertasSegundoContacto,
      enviadoFiltro,
      respondidoFiltro,
      agendadoFiltro,
      contactadoFiltro,
      ordenCampo,
      ordenDireccion,
    });
  }, [
    prospectos,
    debouncedSearch,
    selectedSede,
    tipoFiltro,
    canalFiltro,
    actividadFiltro,
    convertidoFiltro,
    comisionFiltro,
    alertaFiltro,
    comisionEstadoFiltro,
    alertasSegundoContacto,
    enviadoFiltro,
    respondidoFiltro,
    agendadoFiltro,
    contactadoFiltro,
    ordenCampo,
    ordenDireccion,
  ]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);

  const visibleProspectos = sorted.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const emptyRowsCount = Math.max(0, rowsPerPage - visibleProspectos.length);

  const handleComisionStateChange = ({
    prospectoId,
    estado,
    comisionId,
    monto
  }) => {
    setProspectos((arr) =>
      arr.map((p) =>
        p.id === prospectoId
          ? {
              ...p,
              comision: true,
              comision_id: comisionId ?? p.comision_id,
              comision_estado: estado // 'aprobado' | 'rechazado' | 'en_revision'
            }
          : p
      )
    );
  };

  // 🔧 Lógica para mostrar panel de comisiones (vendedor)
  const ALLOWED_IDS = new Set([66, 92, 81]);
  const ALLOWED_EMAILS = new Set(
    [
      "fedekap@hotmail.com",
      "solciruiz098@gmail.com.ar",
      "lourdesbsoraire@gmail.com",
    ].map((e) => e.toLowerCase())
  ); // 👈 Ajusta según tu BD

  //Normalizaciones
  const isVendedor =
    String(currentUser2?.level || "").toLowerCase() === "vendedor";

  // Si tu auth carga el email en userName, lo usamos como fallback
  const emailLower = String(currentUser2?.email || userName || "")
    .trim()
    .toLowerCase();

  const canSeePanel =
    isVendedor &&
    ((currentUser2?.id && ALLOWED_IDS.has(Number(currentUser2.id))) ||
      (emailLower && ALLOWED_EMAILS.has(emailLower)));

  const isManager = ["admin", "gerente"].includes(
    String(currentUser2?.level || "").toLowerCase()
  );

  const canSeeComisionesBtn =
    isManager ||
    (isVendedor &&
      ((currentUser2?.id && ALLOWED_IDS.has(Number(currentUser2.id))) ||
        (emailLower && ALLOWED_EMAILS.has(emailLower))));

  const [vendedoresAllowed, setVendedoresAllowed] = useState([]);

  const isAllowedUser = (u) => {
    if (!u) return false;
    const byId = ALLOWED_IDS.has(Number(u.id));
    const byEmail = u.email
      ? ALLOWED_EMAILS.has(String(u.email).toLowerCase())
      : false;
    return byId || byEmail;
  };

  const loadAllowedSellers = async () => {
    if (vendedoresAllowed.length) return vendedoresAllowed;
    const res = await fetch("http://localhost:8080/users");
    const data = await res.json();
    const list = (Array.isArray(data) ? data : []).filter(isAllowedUser);
    // Orden por nombre
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    setVendedoresAllowed(list);
    return list;
  };

  return (
    <>
      <NavbarStaff />

      <div
        className="
            min-h-screen 
            bg-gradient-to-br 
            from-[#181818] to-[#292929]
            pt-6 pb-14
            transition-colors duration-500
            "
      >
        <div className="dashboardbg h-contain pt-10 pb-10">
          <div className="bg-white rounded-lg w-11/12 mx-auto pb-2 shadow-md">
            <div className="pl-5 pt-5">
              <Link to="/dashboard">
                <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors duration-300">
                  Volver
                </button>
              </Link>
            </div>
            <div className="text-center pt-4 text-[#fc4b08] font-bignoodle text-6xl font-bold">
              <h1>REMARKETING</h1>
            </div>
            {/* Filtros */}

            <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center my-6 px-2">
              <FiltroMesAnio
                mes={mes}
                setMes={setMes}
                anio={anio}
                setAnio={setAnio}
              />
            </section>

            <button
              onClick={() =>
                exportProspectosExcel({
                  mes,
                  anio,
                  prospectos, // todos los registros del mes/año ya cargados
                  search,
                  selectedSede, // filtros activos
                  tipoFiltro,
                  canalFiltro,
                  actividadFiltro,
                  formatDate, // tu helper
                })
              }
              className="ml-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500"
            >
              Exportar Excel
            </button>
            <FilterToolbar
              search={search}
              setSearch={setSearch}
              tipoFiltro={tipoFiltro}
              setTipoFiltro={setTipoFiltro}
              canalFiltro={canalFiltro}
              setCanalFiltro={setCanalFiltro}
              actividadFiltro={actividadFiltro}
              setActividadFiltro={setActividadFiltro}
              convertidoFiltro={convertidoFiltro}
              setConvertidoFiltro={setConvertidoFiltro}
              comisionFiltro={comisionFiltro}
              setComisionFiltro={setComisionFiltro}
              alertaFiltro={alertaFiltro}
              setAlertaFiltro={setAlertaFiltro}
              selectedSede={selectedSede}
              setSelectedSede={setSelectedSede}
              mes={mes}
              setMes={setMes}
              anio={anio}
              setAnio={setAnio}
              onExportClick={() =>
                exportProspectosExcel({
                  mes,
                  anio,
                  prospectos,
                  search,
                  selectedSede,
                  tipoFiltro,
                  canalFiltro,
                  actividadFiltro,
                  convertidoFiltro,
                  alertaFiltro,
                  comisionFiltro,
                  formatDate,
                })
              }
              comisionEstadoFiltro={comisionEstadoFiltro} // NUEVO
              setComisionEstadoFiltro={setComisionEstadoFiltro} // NUEVO
              enviadoFiltro={enviadoFiltro}
              setEnviadoFiltro={setEnviadoFiltro}
              respondidoFiltro={respondidoFiltro}
              setRespondidoFiltro={setRespondidoFiltro}
              agendadoFiltro={agendadoFiltro}
              setAgendadoFiltro={setAgendadoFiltro}
              estadoComisionFiltro={estadoComisionFiltro}
              setEstadoComisionFiltro={setEstadoComisionFiltro}
              contactadoFiltro={contactadoFiltro}
              setContactadoFiltro={setContactadoFiltro}
              counts={{
                all: prospectos.length,
                convertidos: prospectos.filter((p) => p.convertido).length,
                comision: prospectos.filter((p) => p.comision).length,
                alerta: prospectos.filter((p) =>
                  ["amarillo", "rojo"].includes(alertasSegundoContacto[p.id])
                ).length,
                // opcional: contadores por estado de comisión
                comiEnRev: prospectos.filter(
                  (p) => p.comision_estado === "en_revision"
                ).length,
                comiAprob: prospectos.filter(
                  (p) => p.comision_estado === "aprobado"
                ).length,
                comiRecha: prospectos.filter(
                  (p) => p.comision_estado === "rechazado"
                ).length,
                enviados: prospectos.filter((p) => p.enviado).length,
                respondidos: prospectos.filter((p) => p.respondido).length,
                agendados: prospectos.filter((p) => p.agendado).length,
              }}
            />
            <div className="flex justify-center gap-3 pb-10 flex-wrap">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nuevo Registro
                </button>
              </Link>
              <button
                onClick={() => {
                  setShowStats(true);
                }}
                className="bg-[#fc4b08] hover:bg-orange-500 text-white py-2 px-4 rounded transition-colors duration-100 font-semibold"
              >
                Ver Estadísticas
              </button>
              {/* ⚠️ Mantener pill amarillo */}
              <div
                className="flex items-center ml-3 gap-1 bg-yellow-200 border border-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-xl shadow select-none cursor-pointer hover:scale-105 active:scale-95 transition"
                onClick={() => {
                  setShowAgendasModal(true);
                }}
                title="Ver agendas automáticas del día"
              >
                <span className="text-xl font-black">⚠️</span>
                <span>Agendas de hoy:</span>
                <span className="text-lg">
                  {prospectosConAgendaHoy.length + agendaVentasCant}
                </span>
              </div>
              {canSeeComisionesBtn && (
                <button
                  onClick={() => setOpenComi(true)}
                  className="relative bg-emerald-400 text-zinc-900 border border-zinc-200 hover:bg-emerald-600 py-2 px-4 rounded-xl font-semibold transition"
                  title="Ver comisiones vigentes"
                >
                  Comisiones vigentes
                </button>
              )}
            </div>
            {/* Botones de sedes con control de acceso */}
            <div className="w-full flex justify-center mb-10 px-2">
              <div
                className="flex gap-2 md:gap-4 flex-wrap md:flex-nowrap overflow-x-auto scrollbar-hide py-2"
                style={{ WebkitOverflowScrolling: "touch", maxWidth: "100vw" }}
              >
                {sedes.map(({ key, label }) => {
                  const normalizedKey = normalizeString(key);
                  const isSelected = selectedSede === normalizedKey;
                  const isUserSede = userSede === normalizedKey;

                  return (
                    <button
                      key={key}
                      className={`
        flex-shrink-0
        px-6 py-2
        rounded-full
        font-bold
        text-sm md:text-base
        focus:outline-none focus:ring-2 focus:ring-green-500
        transition-all duration-150
        ${
          isSelected
            ? "bg-green-800 text-white shadow-md scale-105 border border-green-900"
            : "bg-green-600 text-white hover:bg-green-700 border border-green-700"
        }
      `}
                      style={{
                        minWidth: 120,
                        marginBottom: 4,
                        marginTop: 4,
                        letterSpacing: ".02em",
                      }}
                      onClick={() => {
                        setSelectedSede(
                          selectedSede === normalizedKey ? null : normalizedKey
                        );
                        setPage(1);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
            </div>
            <div className="text-center pt-4">
              {/* Botón visible solo para gerente/admin */}
              {(userLevel === "gerente" || userLevel === "admin") && (
                <div className="w-full flex justify-center mb-3">
                  <button
                    onClick={() => setShowComisiones(true)}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow"
                  >
                    Ver comisiones
                  </button>
                </div>
              )}
              {/* Panel solo para VENDEDOR (filtrado por lista blanca) */}
              {userLoading ? (
                <div className="max-w-5xl mx-auto my-6">
                  <div className="h-40 rounded-2xl bg-neutral-200 animate-pulse" />
                </div>
              ) : canSeePanel ? (
                // pasamos email por si el componente lo necesita luego
                <VendedorComisionesPanel
                  user={{
                    ...currentUser2,
                    email: currentUser2?.email ?? userName,
                  }}
                />
              ) : null}
              <h1>
                Registros de Prospectos - Cantidad: {visibleProspectos.length}
              </h1>
            </div>
            {/* Modal de agendas automáticas */}
            <AgendasVentas
              userId={userId}
              level={userLevel} // 👈 pasar el nivel
              open={showAgendasModal}
              onClose={() => setShowAgendasModal(false)}
              onVentasCountChange={setAgendaVentasCant} // 👈 opcional para refrescar contador al marcar done
            />
            {/* Tabla de prospectos */}
            <div className="px-1">
              {/* 🔧 PAGINACIÓN */}
              <div className="w-full flex flex-col items-center mb-4 px-4 pt-4">
                {/* Controles de paginación */}
                <div className="flex gap-2 items-center select-none">
                  <button
                    className="rounded-full px-4 py-2 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white hover:bg-[#fc4b08] hover:text-white shadow-md transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    onClick={() => handleChangePage(1)}
                    disabled={safePage === 1}
                    aria-label="Primera página"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 50 50"
                      transform="matrix(-1,0,0,-1,0,0)"
                    >
                      <path d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15 c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422 C15.172,39.813,15.172,40.446,15.563,40.836z" />
                    </svg>
                  </button>
                  <button
                    className="rounded-full px-4 py-2 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white hover:bg-[#fc4b08] hover:text-white shadow-md transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    onClick={() => handleChangePage(safePage - 1)}
                    disabled={safePage === 1}
                    aria-label="Anterior"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((n) =>
                      totalPages <= 5
                        ? true
                        : Math.abs(n - safePage) <= 2 ||
                          n === 1 ||
                          n === totalPages
                    )
                    .map((n, i, arr) => (
                      <React.Fragment key={n}>
                        {i > 0 && n - arr[i - 1] > 1 && (
                          <span className="px-2 text-gray-400 font-bold">
                            …
                          </span>
                        )}
                        <button
                          className={`rounded-full px-4 py-2 font-bold border-2 shadow-md transition-all ${
                            n === safePage
                              ? "bg-[#fc4b08] text-white border-[#fc4b08] scale-110 shadow-lg ring-4 ring-orange-200"
                              : "bg-white text-[#fc4b08] border-[#fc4b08] hover:bg-[#fc4b08] hover:text-white hover:scale-105"
                          }`}
                          onClick={() => handleChangePage(n)}
                        >
                          {n}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    className="rounded-full px-4 py-2 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white hover:bg-[#fc4b08] hover:text-white shadow-md transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    onClick={() => handleChangePage(safePage + 1)}
                    disabled={safePage === totalPages}
                    aria-label="Siguiente"
                  >
                    →
                  </button>
                  <button
                    className="rounded-full px-4 py-2 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white hover:bg-[#fc4b08] hover:text-white shadow-md transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    onClick={() => handleChangePage(totalPages)}
                    disabled={safePage === totalPages}
                    aria-label="Última página"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 50 50"
                    >
                      <path d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15 c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422 C15.172,39.813,15.172,40.446,15.563,40.836z" />
                    </svg>
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <span>Mostrando</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 font-bold rounded">
                    {(safePage - 1) * rowsPerPage + 1}
                  </span>
                  <span>-</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 font-bold rounded">
                    {Math.min(safePage * rowsPerPage, sorted.length)}
                  </span>
                  <span>de</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 font-bold rounded">
                    {sorted.length}
                  </span>
                  <span>prospectos</span>
                </div>
              </div>
              <div className="overflow-x-auto rounded-2xl shadow-2xl border border-gray-200 mt-6">
                <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-white rounded-full"></div>
                    <h2 className="text-white font-bold text-xl">
                      Listado de Prospectos
                    </h2>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-semibold">
                      {sorted.length} registros
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white text-sm">
                    <span>
                      Página {safePage} de {totalPages}
                    </span>
                  </div>
                </div>
                <div
                  className={`overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto ${styles.customScrollbar}`}
                >
                  <table className="w-full">
                    <thead className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white sticky top-0 z-10 shadow-md">
                      <tr>
                        <th className="px-4 py-3 text-left min-w-[190px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Nombre
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center min-w-[120px] font-semibold border-b-2 border-orange-500">
                          DNI
                        </th>
                        <th className="px-4 py-3 text-left min-w-[170px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            Canal Contacto
                          </div>
                        </th>{" "}
                        <th className="px-4 py-3 text-left min-w-[170px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                            Usuario / Celular
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left min-w-[170px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                              />
                            </svg>
                            Actividad
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left min-w-[140px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            Tipo Prospecto
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                            Colaborador
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center min-w-[170px] font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M22 20V12.1735C22 11.0734 21.5469 10.0218 20.7473 9.26624L13.3737 2.29812C12.6028 1.56962 11.3972 1.56962 10.6263 2.29812L3.25265 9.26624C2.45308 10.0218 2 11.0734 2 12.1735V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20Z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Sede
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Contactado
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          #1
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          #2
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          #3
                        </th>
                        <th
                          colSpan={3}
                          className="px-4 py-3 text-center min-w-[220px] font-semibold border-b-2 border-orange-500"
                        >
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                              />
                            </svg>
                            Clases
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left font-semibold w-32 border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="#ffffff"
                              stroke="currentColor"
                              viewBox="0 -4 36 36"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="m16 0c-8.836 0-16 11.844-16 11.844s7.164 12.156 16 12.156 16-12.156 16-12.156-7.164-11.844-16-11.844zm0 20c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8c0 4.418-3.582 8-8 8z" />
                              <path
                                d="m20 12.016c0 2.209-1.791 4-4 4s-4-1.791-4-4 1.791-4 4-4 4 1.791 4 4z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Observación
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          Convertido
                        </th>
                        <th className="px-4 py-3 text-center font-semibold border-b-2 border-orange-500">
                          Estado Conversión
                        </th>
                        <th className="px-4 py-3 text-left font-semibold w-32 border-b-2 border-orange-500">
                          <div className="flex items-center justify-center gap-2">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="#ffffff"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M21,12a1,1,0,0,0-1,1v6a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V5A1,1,0,0,1,5,4h6a1,1,0,0,0,0-2H5A3,3,0,0,0,2,5V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V13A1,1,0,0,0,21,12ZM6,12.76V17a1,1,0,0,0,1,1h4.24a1,1,0,0,0,.71-.29l6.92-6.93h0L21.71,8a1,1,0,0,0,0-1.42L17.47,2.29a1,1,0,0,0-1.42,0L13.23,5.12h0L6.29,12.05A1,1,0,0,0,6,12.76ZM16.76,4.41l2.83,2.83L18.17,8.66,15.34,5.83ZM8,13.17l5.93-5.93,2.83,2.83L10.83,16H8Z" />
                            </svg>
                            Acciones
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {visibleProspectos.map((p, index) => {
                        const bgClass = getBgClass(p);
                        const hasColorBg = bgClass !== "";
                        const textColorClass = hasColorBg
                          ? "text-white"
                          : "text-gray-900";

                        return (
                          <tr
                            key={p.id}
                            id={`prospecto-${p.id}`}
                            className={`
                            group
                            transition-all duration-200
                            hover:!bg-transparent
                            // {
                            //   prospectosConAgendaHoy.includes(Number(p.id))
                            //     ? "border-l-4 border-green-400"
                            //     : ""
                            // }
                          `}
                          >
                            {/* 1. NOMBRE */}
                            <td
                              className={`px-4 py-4 align-middle border border-gray-200 ${bgClass}`}
                            >
                              <div className="flex items-center gap-3">
                                {/* Avatar circular */}
                                <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {p.nombre?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Alertas - Con margen controlado */}
                                  {alertasSegundoContacto[p.id] && (
                                    <div className="flex items-center gap-1 mb-2">
                                      {alertasSegundoContacto[p.id] ===
                                        "amarillo" && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                          ⚠️ Pendiente contacto
                                        </span>
                                      )}
                                      {alertasSegundoContacto[p.id] ===
                                        "rojo" && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                          🔴 URGENTE
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <input
                                    type="text"
                                    value={p.nombre}
                                    onChange={(e) =>
                                      handleChange(
                                        p.id,
                                        "nombre",
                                        e.target.value
                                      )
                                    }
                                    className={`w-full ${
                                      hasColorBg
                                        ? "text-white font-medium"
                                        : "text-gray-900 font-medium"
                                    } bg-transparent border-0 border-b-2 border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none transition-colors mb-1`}
                                    placeholder="Nombre completo"
                                  />
                                </div>
                              </div>
                            </td>
                            {/* 1.5 DNI */}
                            <td
                              className={`px-4 py-4 border border-gray-200 text-center align-middle ${bgClass}`}
                            >
                              <input
                                type="text"
                                value={p.dni || ""}
                                onChange={(e) =>
                                  handleChange(p.id, "dni", e.target.value)
                                }
                                className={`w-full ${
                                  hasColorBg
                                    ? "text-white font-medium"
                                    : "text-gray-900 font-medium" 
                                } bg-transparent border-0 border-b-2 border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none transition-colors mb-1`}
                                placeholder="DNI"
                              />
                            </td>
                            {/* 2. CANAL CONTACTO */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="flex flex-col gap-2">
                                <select
                                  value={p.canal_contacto}
                                  onChange={(e) =>
                                    handleCanalChange(p.id, e.target.value)
                                  }
                                  className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all cursor-pointer"
                                >
                                  <option value="Mostrador">Mostrador</option>
                                  <option value="Whatsapp">Whatsapp</option>
                                  <option value="Instagram">Instagram</option>
                                  <option value="Facebook">Facebook</option>
                                  <option value="Baja Pilates">
                                    Desde Pilates
                                  </option>
                                  <option value="Pagina web">Página web</option>
                                  <option value="Campaña">Campaña</option>
                                  <option value="Comentarios/Stickers">
                                    Comentarios
                                  </option>
                                </select>
                                {/* Icono de dropdown */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                  <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                {/* Origen - INLINE en vez de flotante */}
                                {p.canal_contacto === "Campaña" && (
                                  <div className="mt-2">
                                    {/* 👈 mt-2 para separación */}
                                    <select
                                      value={p.campania_origen || ""}
                                      onChange={(e) =>
                                        handleOrigenChange(p.id, e.target.value)
                                      }
                                      className="w-full bg-orange-50 border-2 border-orange-400 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                      <option value="">
                                        Seleccione origen
                                      </option>
                                      <option value="Instagram">
                                        Instagram
                                      </option>
                                      <option value="Whatsapp">Whatsapp</option>
                                      <option value="Facebook">Facebook</option>
                                      <option value="Otro">Otro</option>
                                    </select>
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* 3. CONTACTO (Usuario/Celular) */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <input
                                type="text"
                                value={p.contacto}
                                onChange={(e) =>
                                  handleChange(p.id, "contacto", e.target.value)
                                }
                                className={`w-full ${
                                  hasColorBg
                                    ? "text-white font-medium"
                                    : "text-gray-900 font-medium"
                                } bg-transparent border-0 border-b-2 border-transparent hover:border-orange-300 focus:border-orange-500 focus:outline-none text-sm transition-colors py-1`}
                                placeholder="Usuario / Celular"
                              />
                            </td>
                            {/* 4. ACTIVIDAD */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <select
                                value={p.actividad || ""}
                                onChange={(e) =>
                                  handleActividadChange(p.id, e.target.value)
                                }
                                className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all cursor-pointer"
                              >
                                <option value="">Seleccionar...</option>
                                <option value="No especifica">
                                  No especifica
                                </option>
                                <option value="Musculacion">Musculación</option>
                                <option value="Pilates">Pilates</option>
                                <option value="Clases grupales">
                                  Clases grupales
                                </option>
                                <option value="Pase full">Pase full</option>
                              </select>
                            </td>
                            {/* 5. TIPO PROSPECTO */}
                            <td
                              className={`border border-gray-200 px-4 py-3 min-w-[160px] ${bgClass}`}
                            >
                              <select
                                value={p.tipo_prospecto}
                                onChange={(e) =>
                                  handleChange(
                                    p.id,
                                    "tipo_prospecto",
                                    e.target.value
                                  )
                                }
                                className="
                              w-full
                              rounded
                              border
                              border-gray-300
                              text-sm
                              font-medium
                              px-3
                              py-2
                              font-sans
                              text-gray-700
                              bg-white
                              transition-colors
                              duration-200
                              ease-in-out
                              hover:bg-orange-50
                              hover:text-orange-900
                              focus:outline-none
                              focus:ring-2
                              focus:ring-orange-400
                              focus:border-orange-600
                              cursor-pointer
                            "
                              >
                                <option value="Nuevo">Nuevo</option>
                                <option value="ExSocio">ExSocio</option>
                              </select>
                            </td>
                            {/* 6. Colaborador */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="flex items-center gap-2">
                                {/* Avatar con inicial */}
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                                  {p.asesor_nombre?.charAt(0)?.toUpperCase() ||
                                    "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm font-medium ${textColorClass} truncate`}
                                  >
                                    {p.asesor_nombre}
                                  </p>
                                  {p.asesor_email && (
                                    <p
                                      className={`text-xs ${
                                        hasColorBg
                                          ? "text-white/70"
                                          : "text-gray-500"
                                      } truncate`}
                                    >
                                      {p.asesor_email}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            {/* 7. Sede */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="relative">
                                <select
                                  value={(p.sede || "").toLowerCase()}
                                  onChange={(e) =>
                                    handleSedeChange(p.id, e.target.value)
                                  }
                                  className="w-full appearance-none bg-white border-2 border-gray-300 rounded-lg px-3 py-2.5 pr-8 text-sm font-medium text-gray-700 hover:border-orange-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all cursor-pointer shadow-sm"
                                >
                                  {SEDES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                      {s.label}
                                    </option>
                                  ))}
                                </select>
                                {/* Indicador visual de sede */}
                                <div className="absolute -bottom-1 left-0 right-0 h-1 rounded-b-lg overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      (p.sede || "").toLowerCase() ===
                                      "monteros"
                                        ? "bg-orange-500"
                                        : (p.sede || "").toLowerCase() ===
                                          "concepcion"
                                        ? "bg-orange-500"
                                        : "bg-orange-500"
                                    }`}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            {/* 8. CONTACTADO */}
                            <td
                              className={`px-4 py-4 text-center border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="flex justify-center items-center">
                                {p.contactado ? (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border-2 border-green-500 shadow-sm">
                                    <svg
                                      className="w-4 h-4"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    Contactado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border-2 border-gray-300">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                      />
                                    </svg>
                                    Sin contactar
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* 9. VISITAS (#1, #2, #3) */}
                            {[
                              {
                                num: 1,
                                checked: !!p.n_contacto_1,
                                field: "n_contacto_1",
                              },
                              {
                                num: 2,
                                checked: !!p.n_contacto_2,
                                field: "n_contacto_2",
                              },
                              {
                                num: 3,
                                checked: !!p.n_contacto_3,
                                field: "n_contacto_3",
                              },
                            ].map(({ num, checked, readonly, field }) => (
                              <td
                                key={num}
                                className={`px-2 py-4 text-center border border-gray-200 align-middle ${bgClass}`}
                              >
                                <label className="relative inline-flex items-center cursor-pointer group">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    readOnly={readonly}
                                    onChange={
                                      field
                                        ? () =>
                                            handleCheckboxChange(p.id, field)
                                        : undefined
                                    }
                                    className="sr-only peer"
                                    disabled={readonly}
                                  />
                                  <div
                                    className={`
                                  w-11 h-6 rounded-full
                                  peer-focus:ring-4 peer-focus:ring-orange-300
                                  peer-checked:after:translate-x-full
                                  after:absolute after:top-[2px] after:left-[2px]
                                  after:bg-white after:rounded-full after:h-5 after:w-5
                                  after:transition-all after:shadow-md
                                  ${
                                    checked
                                      ? "bg-gradient-to-r from-green-400 to-green-600"
                                      : "bg-gray-300"
                                  }
                                  ${
                                    readonly
                                      ? "cursor-not-allowed opacity-60"
                                      : "cursor-pointer"
                                  }
                                  transition-all duration-300
                                `}
                                  />
                                </label>
                              </td>
                            ))}
                            {/* 10. Clases de prueba */}
                            {[1, 2, 3].map((num) => {
                              const fechaRaw = p[`clase_prueba_${num}_fecha`];
                              const fecha = parseLocalDate(fechaRaw);
                              const tipo = p[`clase_prueba_${num}_tipo`];
                              const obs = p[`clase_prueba_${num}_obs`];

                              return (
                                <td
                                  key={num}
                                  className={`px-4 py-4 cursor-pointer border border-gray-200 align-top transition-colors ${bgClass}`}
                                  onClick={() => openClasePruebaPicker(p, num)}
                                  title="Click para editar clase de prueba"
                                >
                                  <div className="flex flex-col gap-2 min-h-[80px]">
                                    {/* Número de clase */}
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`
                                      flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                                      ${
                                        fecha
                                          ? hasColorBg
                                            ? "bg-white text-green-600 shadow-md"
                                            : "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-md"
                                          : hasColorBg
                                          ? "bg-white/30 text-white/90"
                                          : "bg-gray-200 text-gray-500"
                                      }
                                    `}
                                      >
                                        {num}
                                      </span>
                                      {fecha && (
                                        <svg
                                          className={`w-4 h-4 ${
                                            hasColorBg
                                              ? "text-white"
                                              : "text-green-600"
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                    {/* Fecha */}
                                    <div className="flex items-center gap-1">
                                      <svg
                                        className={`w-3 h-3 flex-shrink-0 ${
                                          hasColorBg
                                            ? "text-black/60"
                                            : "text-black/60"
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                      <span
                                        className={`text-xs font-medium ${
                                          fecha
                                            ? "text-black/80"
                                            : "text-black/60"
                                        }`}
                                      >
                                        {fecha
                                          ? dayjs(fecha).format("DD/MM/YYYY")
                                          : "Sin agendar"}
                                      </span>
                                    </div>
                                    {/* Tipo de clase */}
                                    {tipo && (
                                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border border-orange-300 shadow-sm">
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                          />
                                        </svg>
                                        {tipo}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                            {/* 11. Observación */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="relative group/obs">
                                <ObservacionField
                                  value={
                                    observaciones[p.id] ?? p.observacion ?? ""
                                  }
                                  onSave={async (nuevo) => {
                                    setObservaciones((prev) => ({
                                      ...prev,
                                      [p.id]: nuevo,
                                    }));
                                    if (nuevo !== p.observacion) {
                                      await handleChange(
                                        p.id,
                                        "observacion",
                                        nuevo
                                      );
                                    }
                                  }}
                                  className={
                                    hasColorBg
                                      ? "text-white placeholder-white/60"
                                      : ""
                                  }
                                />
                                {/* Indicador de que hay observación */}
                                {(observaciones[p.id] || p.observacion) && (
                                  <div
                                    className={`
                                absolute top-1 right-1 w-2 h-2 rounded-full animate-pulse
                                ${hasColorBg ? "bg-white" : "bg-orange-500"}
                              `}
                                  ></div>
                                )}
                              </div>
                            </td>
                            {/* 12. BADGE DE ESTADO (Convertido) */}
                            <td
                              className={`px-4 py-4 border border-gray-200 text-center align-middle ${bgClass}`}
                            >
                              <div className="flex justify-center items-center min-h-[60px]">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={!!p.convertido || !!p.comision_estado}
                                    disabled={savingIds.has(p.id)}
                                    onChange={(e) =>
                                      handleConvertidoToggle(
                                        p.id,
                                        e.target.checked
                                      )
                                    }
                                    className="sr-only peer"
                                  />
                                  <div
                                    className={`
                                w-14 h-7 rounded-full relative
                                peer-focus:ring-4 peer-focus:ring-green-300
                                transition-all duration-300
                                ${
                                  p.convertido
                                    ? "bg-gradient-to-r from-green-400 to-green-600"
                                    : "bg-gray-300"
                                }
                              `}
                                  >
                                    <span
                                      className={`
                                  absolute top-0.5 left-[4px]
                                  bg-white border border-gray-300 rounded-full h-6 w-6
                                  shadow-md transition-transform duration-300
                                  ${
                                    p.convertido
                                      ? "translate-x-full"
                                      : "translate-x-0"
                                  }
                                `}
                                    />
                                  </div>
                                </label>
                              </div>
                            </td>
                            {/* 13. ESTADO COMISIÓN */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              {p.comision_estado ? (
                                <div className="flex flex-col items-center justify-center gap-2 min-h-[60px]">
                                  {/* Badge principal de comisión */}
                                  <div className="flex flex-col items-center gap-1">
                                    <span
                                      className={`
                                    inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold shadow-lg whitespace-nowrap
                                    ${
                                      p.comision_estado === "en_revision"
                                        ? "bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white ring-2 ring-amber-300"
                                        : p.comision_estado === "aprobado"
                                        ? "bg-gradient-to-r from-sky-400 via-sky-500 to-sky-600 text-white ring-2 ring-sky-300"
                                        : "bg-gradient-to-r from-rose-400 via-rose-500 to-rose-600 text-white ring-2 ring-rose-300"
                                    }
                                    transform hover:scale-105 transition-transform
                                  `}
                                    >
                                      {p.comision_estado === "en_revision" && (
                                        <>
                                          <svg
                                            className="w-4 h-4 animate-spin"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                          </svg>
                                          En Revisión
                                        </>
                                      )}
                                      {p.comision_estado === "aprobado" && (
                                        <>
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          Aprobado
                                        </>
                                      )}
                                      {p.comision_estado === "rechazado" && (
                                        <>
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                          </svg>
                                          Rechazado
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  {p.comision_estado === "en_revision" &&
                                    (userLevel === "gerente" ||
                                      userLevel === "admin") && (
                                      <div className="flex gap-2 mt-2">
                                        <button
                                          onClick={() =>
                                            handleAprobarComision(p)
                                          }
                                          className="group/btn flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg text-xs font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg"
                                        >
                                          <svg
                                            className="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M5 13l4 4L19 7"
                                            />
                                          </svg>
                                          Aprobar
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleRechazarComision(p)
                                          }
                                          className="group/btn flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-xs font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg"
                                        >
                                          <svg
                                            className="w-4 h-4 group-hover/btn:rotate-12 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M6 18L18 6M6 6l12 12"
                                            />
                                          </svg>
                                          Rechazar
                                        </button>
                                      </div>
                                    )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center gap-2">
                                  {p.convertido ? (
                                    <>
                                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
                                        <svg
                                          className="w-3 h-3"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                          <path
                                            fillRule="evenodd"
                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                        Cliente Activo
                                      </span>

                                      {/* 🆕 Botones para iniciar gestión de comisión */}
                                      {(userLevel === "gerente" ||
                                        userLevel === "admin") && (
                                        <div className="flex gap-2 mt-2">
                                          <button
                                            onClick={() =>
                                              handleAprobarComision(p)
                                            }
                                            className="group/btn flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-lg text-xs font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg"
                                          >
                                            <svg
                                              className="w-3.5 h-3.5"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                              />
                                            </svg>
                                            Aprobar
                                          </button>
                                          <button
                                            onClick={() =>
                                              handleRechazarComision(p)
                                            }
                                            className="group/btn flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white rounded-lg text-xs font-medium shadow-md transition-all hover:scale-105 hover:shadow-lg"
                                          >
                                            <svg
                                              className="w-3.5 h-3.5"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                              />
                                            </svg>
                                            Rechazar
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-gray-400 text-xl">
                                        -
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        Sin comisión
                                      </span>
                                    </>
                                  )}
                                </div>
                              )}
                            </td>
                            {/* 14. Acciones */}
                            <td
                              className={`px-4 py-4 border border-gray-200 align-middle ${bgClass}`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {/* Botón ver */}
                                <button
                                  onClick={() => {
                                    setProspectoActual(p);
                                    setModalTipo("contacto");
                                  }}
                                  className="group/btn flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-600 hover:text-purple-700 transition-all hover:scale-110 hover:shadow-md border border-purple-200"
                                  title="Gestionar prospecto"
                                >
                                  <span className="text-sm font-semibold">
                                    Ver
                                  </span>
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                </button>
                                {/* Botón eliminar */}
                                <button
                                  onClick={() => handleEliminarProc(p.id)}
                                  className="group/btn p-2 rounded-lg bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 hover:text-red-700 transition-all hover:scale-110 hover:shadow-md border border-red-200"
                                  title="Eliminar prospecto"
                                >
                                  <svg
                                    className="w-5 h-5 group-hover/btn:rotate-12 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Filas vacías con skeleton */}
                      {emptyRowsCount > 0 &&
                        Array.from({ length: emptyRowsCount }).map((_, idx) => (
                          <tr
                            key={`empty-${idx}`}
                            className="h-20 bg-gray-50/30"
                          >
                            <td colSpan={20} className="px-4 py-4">
                              <div className="flex items-center gap-4 opacity-30">
                                <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                                <div className="flex-1 space-y-2">
                                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      {/* 🔧 MODALES FALTANTES */}
      {showAgendasModal && (
        <AgendasVentas
          userId={userId}
          level={userLevel}
          open={showAgendasModal}
          onClose={() => {
            setShowAgendasModal(false);
          }}
          onVentasCountChange={(count) => {
            setAgendaVentasCant(count);
          }}
        />
      )}
      {modalClaseOpen && (
        <ClasePruebaModal
          isOpen={modalClaseOpen}
          onClose={() => {
            setModalClaseOpen(false);
            setClaseSeleccionada(null);
          }}
          prospectoId={claseSeleccionada?.id}
          numeroClase={claseSeleccionada?.num}
          prospecto={claseSeleccionada?.prospecto}
          onSave={async (datos) => {
            // Actualizar prospecto con nueva info de clase
            const { fecha, tipo, observacion } = datos;
            const num = claseSeleccionada.num;

            // Construir el objeto
            const updates = {
              [`clase_prueba_${num}_fecha`]: fecha || null,
              [`clase_prueba_${num}_tipo`]: tipo || null,
              [`clase_prueba_${num}_obs`]: observacion || null,
            };

            const prospectoOriginal = { ...claseSeleccionada.prospecto };

            setProspectos((prev) =>
              prev.map((p) =>
                p.id === claseSeleccionada.id ? { ...p, ...updates } : p
              )
            );

            // Guardamos los cambios en el backend
            try {
              await axios.put(
                `${URL}/ventas-remarketing/${claseSeleccionada.id}`,
                updates
              );
              setModalClaseOpen(false);
            } catch (error) {
              console.error("Error al guardar la clase:", error);
              Swal.fire(
                "Error",
                "No se pudo guardar la información de la clase.",
                "error"
              );
              // Revertir en caso de error
              setProspectos((prev) =>
                prev.map((p) =>
                  p.id === claseSeleccionada.id ? prospectoOriginal : p
                )
              );
            }
          }}
        />
      )}
      {modalNew && (
        <FormAltaVentasRemarketing
          isOpen={modalNew}
          onClose={cerrarModalNuevo}
          onSuccess={handleGuardadoExitoso}
          prospecto={selectedProspecto}
          setSelectedProspecto={setSelectedProspecto}
          userId={userId}
          currentUser={currentUser2}
          userName={userName}
          userLevel={userLevel}
          mes={mes}
          anio={anio}
          Sede={selectedSede}
        />
      )}
      {showStats && (
        <StatsVentasModal
          open={showStats}
          onClose={() => setShowStats(false)}
          sede={selectedSede}
          normalizeSede2={normalizeSede2}
          mes={mes}
          anio={anio}
          tipo="remarketing"
        />
      )}
      {showComisiones && (
        <ComisionesModal
           onClose={() => setShowComisiones(false)}
          userLevel={userLevel}
          userId={userId}
          onComisionStateChange={handleComisionStateChange} // <- NUEVO
        />
      )}
      {openComi && (
        <ComisionesVigentesModal
          open={openComi}
          onClose={() => setOpenComi(false)}
          mes={mes}
          anio={anio}
        />
      )}
      {modalTipo === "contacto" && (
        <ContactoRapidoModal
          prospecto={prospectoActual}
          open={true}
          onClose={() => setModalTipo(null)}
        />
      )}
    </>
  );
};

export default VentasRemarketingGet;
