/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.4
 *
 * Descripción:
 * Página para listar los PLANES del módulo Débitos Automáticos.
 * Consume GET /debitos-automaticos-planes, GET /debitos-automaticos-planes-sedes
 * y GET /sedes/ciudad para mostrar el catálogo global de planes junto con sus
 * precios configurados por sede.
 *
 * Tema: Frontend - Débitos Automáticos - Planes
 * Capa: Frontend
 */

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavbarStaff from '../../staff/NavbarStaff';
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  RefreshCw,
  Search,
  Tag,
  Trash2,
  XCircle,
  Plus,
  Settings2
} from 'lucide-react';
import PlanFormModal from '../../../components/Forms/DebitosAutomaticos/PlanFormModal.jsx';
import PlanSedeFormModal from '../../../components/Forms/DebitosAutomaticos/PlanSedeFormModal.jsx';
import PlanSedeActualizarPrecioModal from '../../../components/Forms/DebitosAutomaticos/Modals/PlanSedeActualizarPrecioModal.jsx';
import Swal from 'sweetalert2';

const API_PLANES_URL = 'http://localhost:8080/debitos-automaticos-planes';
const API_PLANES_SEDES_URL =
  'http://localhost:8080/debitos-automaticos-planes-sedes';
const API_SEDES_CIUDAD_URL = 'http://localhost:8080/sedes/ciudad';

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const getActivo = (value) => {
  return value === 1 || value === '1' || value === true;
};

const isTrueLike = (value) => {
  if (value === true || value === 1 || value === '1') return true;

  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  return ['true', 'si', 'sí', 'yes'].includes(normalized);
};

const toMoneyNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeListPayload = (payload, keyName = '') => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  if (keyName && Array.isArray(payload?.[keyName])) return payload[keyName];
  return [];
};

/* Benjamin Orellana - 2026/04/15 - Calcula métricas considerando el contexto de la sede activa para que el resumen superior refleje la nueva estructura plan+sede. */
const buildMetrics = ({ planes = [], sedeActiva = 'TODAS' }) => {
  const total = planes.length;
  const activos = planes.filter((item) => getActivo(item?.activo)).length;
  const inactivos = total - activos;

  const configurados =
    sedeActiva === 'TODAS'
      ? planes.filter((item) => (item?.precios_sedes_activos || []).length > 0)
          .length
      : planes.filter((item) => item?.precio_sede_actual).length;

  const promedioPrecio =
    sedeActiva === 'TODAS'
      ? (() => {
          const todosLosPrecios = planes.flatMap(
            (item) => item?.precios_sedes_activos || []
          );

          if (!todosLosPrecios.length) return 0;

          return (
            todosLosPrecios.reduce(
              (acc, item) => acc + toMoneyNumber(item?.precio_base),
              0
            ) / todosLosPrecios.length
          );
        })()
      : (() => {
          const preciosDeLaSede = planes
            .map((item) => item?.precio_sede_actual)
            .filter(Boolean);

          if (!preciosDeLaSede.length) return 0;

          return (
            preciosDeLaSede.reduce(
              (acc, item) => acc + toMoneyNumber(item?.precio_base),
              0
            ) / preciosDeLaSede.length
          );
        })();

  return {
    total,
    activos,
    inactivos,
    configurados,
    promedioPrecio
  };
};

const PlanesPage = () => {
  const [planes, setPlanes] = useState([]);
  const [planesSedes, setPlanesSedes] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sedeActiva, setSedeActiva] = useState('TODAS');

  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  /* Benjamin Orellana - 2026/04/23 - Estados para controlar la apertura de la modal de actualización masiva de precio y el registro plan+sede seleccionado. */
  const [openActualizarPrecioModal, setOpenActualizarPrecioModal] =
    useState(false);
  const [selectedPlanSedeImpacto, setSelectedPlanSedeImpacto] = useState(null);

  const handleOpenCreatePlan = () => {
    setSelectedPlan(null);
    setOpenPlanModal(true);
  };

  const handleOpenEditPlan = (plan) => {
    setSelectedPlan(plan);
    setOpenPlanModal(true);
  };

  const handleClosePlanModal = () => {
    setOpenPlanModal(false);
    setSelectedPlan(null);
  };

  const [openPlanSedeModal, setOpenPlanSedeModal] = useState(false);
  const [selectedPlanSede, setSelectedPlanSede] = useState(null);

  /* Benjamin Orellana - 2026/04/15 - Cierra el modal de precios por sede y limpia el contexto seleccionado para evitar reaperturas inconsistentes. */
  const handleClosePlanSedeModal = () => {
    setOpenPlanSedeModal(false);
    setSelectedPlanSede(null);
  };

  /* Benjamin Orellana - 2026/04/15 - Abre el modal de precios contextualizando el plan seleccionado y, si hay una sede activa, precargando o editando la configuración existente de esa sede. */
  const handleOpenManagePrecios = (plan) => {
    if (!plan?.id) return;

    if (sedeActiva !== 'TODAS' && plan?.precio_sede_actual) {
      setSelectedPlanSede({
        ...plan.precio_sede_actual,
        plan_id: plan.id,
        plan: {
          id: plan.id,
          nombre: plan.nombre,
          codigo: plan.codigo
        },
        sede_id: plan.precio_sede_actual?.sede_id,
        sede: plan.precio_sede_actual?.sede || sedeSeleccionada || null
      });
      setOpenPlanSedeModal(true);
      return;
    }

    setSelectedPlanSede({
      plan_id: plan.id,
      plan: {
        id: plan.id,
        nombre: plan.nombre,
        codigo: plan.codigo
      },
      sede_id: sedeActiva !== 'TODAS' ? Number(sedeActiva) : '',
      sede: sedeActiva !== 'TODAS' ? sedeSeleccionada || null : null,
      precio_base: '',
      activo: true
    });

    setOpenPlanSedeModal(true);
  };

  /* Benjamin Orellana - 2026/04/15 - Guarda configuraciones de precios por sede resolviendo automáticamente si corresponde alta o edición según el contexto abierto desde la grilla. */
  /* Benjamin Orellana - 2026/04/15 - Al guardar precios por sede se resuelve automáticamente si corresponde crear o editar según la combinación única plan_id + sede_id, incluso cuando el modal se abrió desde "Todas las sedes". */
  const handleSubmitPlanSede = async (payload) => {
    const planId = Number(payload?.plan_id);
    const sedeId = Number(payload?.sede_id);

    const registroExistente = (
      Array.isArray(planesSedes) ? planesSedes : []
    ).find(
      (item) =>
        Number(item?.plan_id) === planId && Number(item?.sede_id) === sedeId
    );

    const targetId = selectedPlanSede?.id || registroExistente?.id || null;

    if (targetId) {
      await axios.put(`${API_PLANES_SEDES_URL}/${targetId}`, payload);
    } else {
      await axios.post(API_PLANES_SEDES_URL, payload);
    }

    await fetchCatalogos({ silent: true });
  };

  const handleSubmitPlan = async (payload) => {
    if (selectedPlan?.id) {
      await axios.put(`${API_PLANES_URL}/${selectedPlan.id}`, payload);
    } else {
      await axios.post(API_PLANES_URL, payload);
    }

    await fetchCatalogos({ silent: true });
  };

  const handleDeletePlan = async (plan) => {
    const result = await Swal.fire({
      title: '¿Eliminar este plan?',
      html: `
      <div style="text-align:left; color:#475569; font-size:14px; line-height:1.6;">
        <p style="margin:0 0 10px 0;">
          Vas a desactivar el plan:
        </p>
        <p style="margin:0; font-weight:700; color:#0f172a; font-size:16px;">
          ${plan?.nombre || 'Plan sin nombre'}
        </p>
        <p style="margin:10px 0 0 0; color:#64748b;">
          Esta acción impactará sobre el catálogo general del módulo.
        </p>
      </div>
    `,
      icon: 'warning',
      iconColor: '#dc2626',
      background: '#ffffff',
      color: '#0f172a',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      customClass: {
        popup: 'rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.22)]',
        title: 'text-slate-900 font-bold',
        confirmButton:
          'rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition',
        cancelButton:
          'rounded-xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition'
      },
      buttonsStyling: false
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_PLANES_URL}/${plan.id}`);

      await Swal.fire({
        title: 'Plan desactivado',
        text: `${plan?.nombre || 'El plan'} fue desactivado correctamente.`,
        icon: 'success',
        iconColor: '#dc2626',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonText: 'Aceptar',
        customClass: {
          popup: 'rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.22)]',
          title: 'text-slate-900 font-bold',
          confirmButton:
            'rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition'
        },
        buttonsStyling: false
      });

      await fetchCatalogos({ silent: true });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo desactivar el plan.';

      await Swal.fire({
        title: 'No se pudo continuar',
        text: backendMessage,
        icon: 'error',
        iconColor: '#dc2626',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonText: 'Cerrar',
        customClass: {
          popup: 'rounded-[24px] shadow-[0_24px_80px_rgba(15,23,42,0.22)]',
          title: 'text-slate-900 font-bold',
          confirmButton:
            'rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition'
        },
        buttonsStyling: false
      });
    }
  };

  /* Benjamin Orellana - 2026/04/15 - Se cargan catálogo de planes, precios por sede y sedes ciudad en paralelo para evitar lógica desfasada entre endpoints. */
  const fetchCatalogos = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setLoadingRefresh(true);
      } else {
        setLoading(true);
      }

      setError('');

      const [planesRes, planesSedesRes, sedesRes] = await Promise.all([
        axios.get(API_PLANES_URL),
        axios.get(API_PLANES_SEDES_URL),
        axios.get(API_SEDES_CIUDAD_URL)
      ]);

      const listadoPlanes = normalizeListPayload(planesRes?.data, 'planes');
      const listadoPlanesSedes = normalizeListPayload(
        planesSedesRes?.data,
        'registros'
      );
      const listadoSedes = normalizeListPayload(sedesRes?.data, 'sedes');

      setPlanes(listadoPlanes);
      setPlanesSedes(listadoPlanesSedes);
      setSedes(listadoSedes);
    } catch (err) {
      console.error('Error al obtener planes:', err);
      setError(
        'No se pudo cargar el catálogo de planes y precios por sede del módulo.'
      );
      setPlanes([]);
      setPlanesSedes([]);
      setSedes([]);
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    fetchCatalogos();
  }, []);

  /* Benjamin Orellana - 2026/04/15 - El endpoint /sedes/ciudad ya devuelve únicamente sedes ciudad, por lo que no debe filtrarse nuevamente por es_ciudad. */
  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [sedes]);

  /* Benjamin Orellana - 2026/04/15 - Construcción dinámica de tabs de sedes evitando valores fijos hardcodeados. */
  const sedeTabs = useMemo(() => {
    return [
      { key: 'TODAS', label: 'Todas las sedes', id: null },
      ...sedesOptions.map((item) => ({
        key: String(item.id),
        label: item.nombre,
        id: item.id
      }))
    ];
  }, [sedesOptions]);

  useEffect(() => {
    if (sedeActiva === 'TODAS') return;

    const existe = sedeTabs.some((tab) => tab.key === sedeActiva);

    if (!existe) {
      setSedeActiva('TODAS');
    }
  }, [sedeActiva, sedeTabs]);

  const sedeSeleccionada = useMemo(() => {
    if (sedeActiva === 'TODAS') return null;
    return sedesOptions.find((item) => String(item.id) === String(sedeActiva));
  }, [sedeActiva, sedesOptions]);

  /* Benjamin Orellana - 2026/04/15 - Se indexan los precios activos por plan para resolver rápidamente la cobertura y el precio visible según la sede seleccionada. */
  const planesSedesMap = useMemo(() => {
    const map = new Map();

    (Array.isArray(planesSedes) ? planesSedes : [])
      .filter((item) => getActivo(item?.activo))
      .forEach((item) => {
        const planId = Number(item?.plan_id);
        if (!planId) return;

        const current = map.get(planId) || [];
        current.push(item);
        map.set(planId, current);
      });

    for (const [, items] of map.entries()) {
      items.sort((a, b) => {
        const nombreA = String(a?.sede?.nombre || '').toLowerCase();
        const nombreB = String(b?.sede?.nombre || '').toLowerCase();
        return nombreA.localeCompare(nombreB, 'es');
      });
    }

    return map;
  }, [planesSedes]);

  const planesConContexto = useMemo(() => {
    return (Array.isArray(planes) ? planes : []).map((plan) => {
      const preciosPlan = planesSedesMap.get(Number(plan?.id)) || [];
      const precioSedeActual =
        sedeSeleccionada?.id != null
          ? preciosPlan.find(
              (item) => Number(item?.sede_id) === Number(sedeSeleccionada.id)
            ) || null
          : null;

      return {
        ...plan,
        precios_sedes_activos: preciosPlan,
        precio_sede_actual: precioSedeActual
      };
    });
  }, [planes, planesSedesMap, sedeSeleccionada]);

  /* Benjamin Orellana - 2026/04/15 - La búsqueda ahora contempla datos del plan y sus precios/sedes configuradas para reflejar la nueva estructura comercial. */
  const planesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return planesConContexto;

    return planesConContexto.filter((plan) => {
      const preciosTexto = (plan?.precios_sedes_activos || [])
        .map((item) =>
          [
            item?.sede?.nombre,
            item?.sede_id,
            item?.precio_base,
            item?.activo
          ].join(' ')
        )
        .join(' ');

      const texto = [
        plan?.id,
        plan?.codigo,
        plan?.nombre,
        plan?.descripcion,
        plan?.activo,
        plan?.orden_visual,
        plan?.created_at,
        plan?.updated_at,
        preciosTexto
      ]
        .filter((item) => item !== null && item !== undefined)
        .join(' ')
        .toLowerCase();

      return texto.includes(term);
    });
  }, [planesConContexto, search]);

  const metrics = useMemo(() => {
    return buildMetrics({
      planes: planesFiltrados,
      sedeActiva
    });
  }, [planesFiltrados, sedeActiva]);

  /* Benjamin Orellana - 2026/04/23 - Abre la modal de actualización masiva de precio solo si el plan ya tiene una configuración activa en la sede actualmente seleccionada. */
  const handleOpenActualizarPrecio = (plan) => {
    if (!plan?.precio_sede_actual?.id) return;

    setSelectedPlanSedeImpacto({
      ...plan.precio_sede_actual,
      plan,
      sede: sedeSeleccionada
    });
    setOpenActualizarPrecioModal(true);
  };

  /* Benjamin Orellana - 2026/04/23 - Cierra la modal de actualización masiva y limpia el contexto seleccionado para evitar reaperturas con datos anteriores. */
  const handleCloseActualizarPrecio = () => {
    setSelectedPlanSedeImpacto(null);
    setOpenActualizarPrecioModal(false);
  };

  /* Benjamin Orellana - 2026/04/23 - Solicita al backend la previsualización del impacto de precio sobre clientes y períodos alcanzados usando la misma base URL del módulo de planes por sede. */
  const handlePreviewActualizarPrecio = async ({
    id,
    nuevo_precio_base,
    aplicar_desde_anio,
    aplicar_desde_mes
  }) => {
    const { data } = await axios.post(
      `${API_PLANES_SEDES_URL}/${id}/preview-actualizacion-precio`,
      {
        nuevo_precio_base,
        aplicar_desde_anio,
        aplicar_desde_mes
      }
    );

    return data;
  };

  /* Benjamin Orellana - 2026/04/23 - Aplica la actualización de precio por plan+sede solo a los clientes seleccionados y recalcula los períodos futuros definidos por el usuario. */
  const handleApplyActualizarPrecio = async ({
    id,
    nuevo_precio_base,
    aplicar_desde_anio,
    aplicar_desde_mes,
    clientes_ids
  }) => {
    const { data } = await axios.put(
      `${API_PLANES_SEDES_URL}/${id}/aplicar-actualizacion-precio`,
      {
        nuevo_precio_base,
        aplicar_desde_anio,
        aplicar_desde_mes,
        clientes_ids
      }
    );

    return data;
  };

  /* Benjamin Orellana - 2026/04/23 - Refresca el catálogo una vez aplicada la actualización de precio para reflejar el nuevo valor vigente en la sede activa sin perder el resto del flujo. */
  const handleAppliedActualizarPrecio = async () => {
    await fetchCatalogos({ silent: true });
  };

  return (
    <>
      <NavbarStaff />

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="mx-auto max-w-[2200px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="relative mb-8 overflow-hidden rounded-[34px] border border-white/15 bg-gradient-to-br from-slate-950/70 via-slate-900/55 to-orange-950/40 p-5 shadow-[0_30px_80px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:p-6 lg:p-7">
              <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-orange-500/20 blur-3xl" />
              <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-amber-300/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0">
                  <Link
                    to="/dashboard/debitos-automaticos"
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-100 backdrop-blur-md transition hover:bg-white/15"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver al módulo
                  </Link>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="font-bignoodle text-3xl uppercase tracking-[0.18em] text-white sm:text-4xl lg:text-5xl"
                  >
                    Planes
                  </motion.h1>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200/90">
                    Catálogo global de planes del módulo. Los importes ya no
                    viven en el plan, sino en su configuración por sede.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleOpenCreatePlan}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo plan
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchCatalogos({ silent: true })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`}
                    />
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs de sedes */}
            <div className="mb-6 rounded-[24px] border border-orange-100 bg-white px-4 py-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)] sm:px-5">
              <div className="flex flex-wrap gap-3">
                {sedeTabs.map((tab) => {
                  const active = sedeActiva === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSedeActiva(tab.key)}
                      className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-orange-500 text-white shadow-[0_12px_24px_-16px_rgba(249,115,22,0.85)]'
                          : 'border border-orange-200 bg-white text-orange-600 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-6 rounded-[30px] border border-white/15 bg-white/75 p-4 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.25)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código, nombre, descripción, sede o precio base..."
                    className="h-13 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                {/* <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 xl:min-w-[700px]">
                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Resultado actual
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {planesFiltrados.length} plan
                      {planesFiltrados.length === 1 ? '' : 'es'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Activos visibles
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {metrics.activos}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {sedeActiva === 'TODAS'
                        ? 'Planes con cobertura'
                        : 'Planes configurados'}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {metrics.configurados}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      Precio promedio
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatMoney(metrics.promedioPrecio)}
                    </p>
                  </div>
                </div> */}
              </div>
            </div>

            {loading && (
              <div className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                <div className="animate-pulse p-6">
                  <div className="mb-4 h-6 w-56 rounded bg-slate-200" />
                  <div className="space-y-3">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-14 rounded-2xl bg-slate-200" />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[30px] border border-rose-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                <div className="flex flex-col items-center justify-center text-center">
                  <XCircle className="mb-3 h-12 w-12 text-rose-500" />
                  <h3 className="text-xl font-bold text-slate-800">
                    Ocurrió un problema
                  </h3>
                  <p className="mt-2 max-w-lg text-sm text-slate-500">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() => fetchCatalogos()}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && planesFiltrados.length === 0 && (
              <div className="rounded-[30px] border border-white/10 bg-white/95 p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                <h3 className="text-xl font-bold text-slate-800">
                  No hay planes para mostrar
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? 'No hubo coincidencias con tu búsqueda actual.'
                    : 'Todavía no se registraron planes en este módulo.'}
                </p>
              </div>
            )}

            {!loading && !error && planesFiltrados.length > 0 && (
              <div className="overflow-hidden rounded-[32px] border border-white/15 bg-white/90 shadow-[0_24px_70px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="min-w-[1750px] w-full border-collapse">
                    <thead className="sticky top-0 z-[1] bg-orange-600 text-white">
                      <tr>
                        {/* <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          ID
                        </th> */}
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Código
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Nombre
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Descripción
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Estado
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Orden
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          {sedeActiva === 'TODAS'
                            ? 'Precios por sede'
                            : `Precio base · ${sedeSeleccionada?.nombre || 'Sede'}`}
                        </th>
                        {/* <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Cobertura
                        </th> */}
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Alta
                        </th>
                        <th className="px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Actualización
                        </th>
                        <th className="px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {planesFiltrados.map((plan, index) => {
                        const activo = getActivo(plan?.activo);
                        const preciosActivos =
                          plan?.precios_sedes_activos || [];
                        const precioSedeActual =
                          plan?.precio_sede_actual || null;

                        return (
                          <tr
                            key={plan?.id ?? index}
                            className="group border-t border-slate-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600"
                          >
                            {/* <td className="px-5 py-4 text-sm font-bold text-slate-700 transition group-hover:text-white">
                              #{plan?.id ?? '-'}
                            </td> */}

                            <td className="px-5 py-4 text-sm text-slate-700 transition group-hover:text-white">
                              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white">
                                <Tag className="h-3.5 w-3.5" />
                                {plan?.codigo || '-'}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm font-semibold text-slate-900 transition group-hover:text-white">
                              {plan?.nombre || '-'}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600 transition group-hover:text-white/95">
                              <div className="max-w-[320px] whitespace-normal leading-6">
                                {plan?.descripcion || '-'}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm transition group-hover:text-white">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                                  activo
                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20'
                                    : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20'
                                }`}
                              >
                                {activo ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                {activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-700 transition group-hover:text-white">
                              {plan?.orden_visual ?? '-'}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-800 transition group-hover:text-white">
                              {sedeActiva === 'TODAS' ? (
                                preciosActivos.length > 0 ? (
                                  <div className="flex max-w-[420px] flex-wrap gap-2">
                                    {preciosActivos.map((item, itemIndex) => (
                                      <span
                                        key={`${item?.id ?? itemIndex}-${item?.sede_id ?? 'sede'}`}
                                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                      >
                                        <span>
                                          {item?.sede?.nombre ||
                                            `Sede ${item?.sede_id}`}
                                        </span>
                                        <span className="opacity-70">·</span>
                                        <span>
                                          {formatMoney(item?.precio_base)}
                                        </span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-sm text-slate-400 transition group-hover:text-white/75">
                                    Sin precios configurados
                                  </span>
                                )
                              ) : precioSedeActual ? (
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white">
                                  {formatMoney(precioSedeActual?.precio_base)}
                                </div>
                              ) : (
                                <span className="text-sm text-slate-400 transition group-hover:text-white/75">
                                  No configurado
                                </span>
                              )}
                            </td>

                            {/* <td className="px-5 py-4 text-sm text-slate-700 transition group-hover:text-white">
                              {sedeActiva === 'TODAS'
                                ? `${preciosActivos.length}/${sedesOptions.length || 0}`
                                : precioSedeActual
                                  ? 'Configurarado'
                                  : 'Sin precio'}
                            </td> */}

                            <td className="px-5 py-4 text-sm text-slate-600 transition group-hover:text-white/95">
                              {formatDate(plan?.created_at)}
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600 transition group-hover:text-white/95">
                              {formatDate(plan?.updated_at)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                {/* <button
                                  type="button"
                                  onClick={() => handleOpenManagePrecios(plan)}
                                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 text-sky-700 transition hover:bg-sky-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                  title={
                                    sedeActiva === 'TODAS'
                                      ? 'Gestionar precios'
                                      : plan?.precio_sede_actual
                                        ? `Editar precio en ${sedeSeleccionada?.nombre || 'la sede activa'}`
                                        : `Configurar precio en ${sedeSeleccionada?.nombre || 'la sede activa'}`
                                  }
                                >
                                  <Settings2 className="h-4 w-4" />
                                  <span className="text-xs font-semibold">
                                    {sedeActiva === 'TODAS'
                                      ? 'Gestionar precios'
                                      : plan?.precio_sede_actual
                                        ? 'Editar precio'
                                        : 'Configurar precio'}
                                  </span>
                                </button> */}

                                {/* Benjamin Orellana - 2026/04/23 - Se agrega la acción para actualizar el precio vigente e impactar clientes solo cuando la vista está filtrada por una sede puntual y el plan ya tiene precio configurado en esa sede. */}
                                {sedeActiva !== 'TODAS' &&
                                  !!plan?.precio_sede_actual?.id && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleOpenActualizarPrecio(plan)
                                      }
                                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 text-orange-700 transition hover:bg-orange-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                      title={`Actualizar precio en ${sedeSeleccionada?.nombre || 'la sede activa'}`}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                      <span className="text-xs font-semibold">
                                        Actualizar precio
                                      </span>
                                    </button>
                                  )}

                                <button
                                  type="button"
                                  onClick={() => handleOpenEditPlan(plan)}
                                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeletePlan(plan)}
                                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <PlanFormModal
        open={openPlanModal}
        onClose={handleClosePlanModal}
        onSubmit={handleSubmitPlan}
        initial={selectedPlan}
      />
      <PlanSedeFormModal
        open={openPlanSedeModal}
        onClose={handleClosePlanSedeModal}
        onSubmit={handleSubmitPlanSede}
        initial={selectedPlanSede}
        planes={planes}
        sedes={sedesOptions}
        registrosExistentes={planesSedes}
      />

      {/* Benjamin Orellana - 2026/04/23 - Se monta la modal de actualización masiva de precio para consumir preview y aplicación real del backend sobre clientes seleccionados. */}
      <PlanSedeActualizarPrecioModal
        open={openActualizarPrecioModal}
        onClose={handleCloseActualizarPrecio}
        initial={selectedPlanSedeImpacto}
        onPreview={handlePreviewActualizarPrecio}
        onApply={handleApplyActualizarPrecio}
        onApplied={handleAppliedActualizarPrecio}
      />
    </>
  );
};

export default PlanesPage;
