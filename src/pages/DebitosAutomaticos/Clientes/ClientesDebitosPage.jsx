import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import NavbarStaff from '../../staff/NavbarStaff';
import Footer from '../../../components/footer/Footer';
import {
  Search,
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Pencil,
  ShieldCheck,
  UserRoundPlus,
  CalendarDays,
  CreditCard,
  Landmark,
  BadgeDollarSign,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Ban,
  CheckCircle2
} from 'lucide-react';

import ModalClienteDetalle from './components/ModalClienteDetalle';
import ModalClienteEstado from './components/ModalClienteEstado';
import ModalClienteBaja from './components/ModalClienteBaja';
import ModalClienteEditar from './components/ModalClienteEditar';
import ModalClienteAdicional from './components/ModalClienteAdicional';
import ModalClienteCrear from './components/ModalClienteCrear';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';
/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31 / 03 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Pantalla principal de Clientes y adicionales del módulo Débitos Automáticos.
 * Vista operativa con filtros, tabs por sede, expansión por fila y
 * estructura comercial visible por cliente: monto inicial, descuento y monto final.
 *
 * Tema: Clientes y adicionales - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 31/03/2026 - Helpers visuales y de normalización para dejar la page robusta ante distintas formas de respuesta del backend */
const panelV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24 } }
};

const rowExpandV = {
  hidden: { opacity: 0, height: 0 },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.22 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.18 } }
};

/* Benjamin Orellana - 06/04/2026 - Se corrige el formateo de fechas simples YYYY-MM-DD para evitar desfases por zona horaria al renderizar en tablas */
const formatDate = (value) => {
  if (!value) return '-';

  if (typeof value === 'string') {
    const onlyDateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (onlyDateMatch) {
      const [, y, m, d] = onlyDateMatch;
      return `${d}/${m}/${y}`;
    }
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const formatMonth = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(d);
};

/* Benjamin Orellana - 09/04/2026 - Se unifica el formateo monetario de clientes a dos decimales para reflejar correctamente la nueva estructura comercial */
const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
};

/* Benjamin Orellana - 09/04/2026 - Helper para visualizar descuentos porcentuales del cliente con formato consistente */
const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const n = Number(value);
  if (Number.isNaN(n)) return '-';

  return `${n.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`;
};

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.registros)) return payload.registros;
  if (Array.isArray(payload?.clientes)) return payload.clientes;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
};

const normalizeSingle = (payload) => {
  if (!payload) return null;

  if (payload?.row && !Array.isArray(payload.row)) return payload.row;
  if (payload?.data?.row && !Array.isArray(payload.data.row))
    return payload.data.row;

  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.item && !Array.isArray(payload.item)) return payload.item;

  return payload;
};

const toLower = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const getClienteId = (item) => item?.id ?? item?.cliente_id ?? null;

const getClienteName = (item) =>
  item?.titular_nombre ||
  item?.nombre_titular ||
  item?.nombre ||
  item?.titular?.nombre ||
  '-';

const getClienteDni = (item) =>
  item?.titular_dni || item?.dni_titular || item?.dni || '-';

const getClienteEstado = (item) =>
  item?.estado_general || item?.estado || 'PENDIENTE_INICIO';

const getClienteSedeId = (item) =>
  item?.sede_id || item?.sede?.id || item?.sedeId || null;

const getBancoName = (item) =>
  item?.banco?.nombre ||
  item?.banco_nombre ||
  item?.nombre_banco ||
  item?.Banco?.nombre ||
  '-';

const getPlanName = (item, plansMap = null) => {
  const directName =
    item?.plan_titular?.nombre ||
    item?.titular_plan?.nombre ||
    item?.plan?.nombre ||
    item?.plan_nombre ||
    item?.titular_plan_nombre ||
    item?.Plan?.nombre ||
    null;

  if (directName) return directName;

  const planId =
    item?.titular_plan_id ??
    item?.plan_id ??
    item?.plan?.id ??
    item?.titular_plan?.id ??
    item?.plan_titular?.id ??
    null;

  if (plansMap && planId && plansMap.has(String(planId))) {
    return plansMap.get(String(planId));
  }

  return item?.modalidad_adhesion === 'SOLO_ADICIONAL' ? 'Solo adicional' : '-';
};

/* Benjamin Orellana - 09/04/2026 - Se desacopla la estructura comercial del cliente para mostrar monto inicial, descuento y monto final por separado */
const getMontoInicial = (item) =>
  item?.monto_inicial_vigente ??
  item?.monto_inicial ??
  item?.precio_inicial ??
  null;

const getDescuentoPct = (item) =>
  item?.descuento_vigente ?? item?.descuento_pct ?? item?.descuento ?? 0;

const getMontoFinal = (item) =>
  item?.monto_base_vigente ?? item?.monto ?? item?.importe ?? null;

const getAltaDate = (item) =>
  item?.solicitud?.created_at ||
  item?.solicitud_created_at ||
  item?.solicitud_fecha_alta ||
  item?.created_at ||
  item?.fecha_aprobacion ||
  null;

const getInicioDate = (item) =>
  item?.fecha_inicio_cobro || item?.inicio_cobro || null;

const getBajaDate = (item) => item?.fecha_baja || item?.baja_fecha || null;

const getPagosCount = (item) =>
  item?.pagos_cobrados ??
  item?.pagos_count ??
  item?.pagos ??
  item?.meses_cobrados ??
  item?.periodos_cobrados_count ??
  0;

const getBeneficioText = (item) => {
  const desc = item?.beneficio_descripcion_snapshot || '';
  const off = Number(item?.beneficio_descuento_off_pct_snapshot || 0);
  const reintegro = Number(item?.beneficio_reintegro_pct_snapshot || 0);

  const parts = [];
  if (desc) parts.push(desc);
  if (off > 0) parts.push(`${off}% off`);
  if (reintegro > 0) parts.push(`Reintegro ${reintegro}%`);

  return parts.join(' · ') || '-';
};

// Benjamin Orellana - 08/04/2026 - Helper para mostrar el campo especial del cliente en la grilla principal
const getEspecialText = (item) => {
  return String(item?.especial || '').trim() || '-';
};

/* Benjamin Orellana - 2026/04/13 - Prioriza la tarjeta completa si el backend la habilitó; en caso contrario usa máscara o últimos 4. */
const getTarjetaText = (item) => {
  const marca = item?.marca_tarjeta || item?.tarjeta_marca || '';
  const raw = String(item?.tarjeta_numero_completo || '').replace(/\D/g, '');

  const formattedFull = raw ? raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : '';

  const fallbackMask =
    item?.tarjeta_mascara ||
    (item?.tarjeta_ultimos4 ? `**** **** **** ${item.tarjeta_ultimos4}` : '');

  const valorTarjeta = formattedFull || fallbackMask;

  if (!marca && !valorTarjeta) return '-';
  if (!marca) return valorTarjeta;
  if (!valorTarjeta) return marca;

  return `${marca} · ${valorTarjeta}`;
};

const getModalidadText = (item) => {
  const modalidad = item?.modalidad_adhesion || '';
  if (modalidad === 'TITULAR_SOLO') return 'Titular solo';
  if (modalidad === 'AMBOS') return 'Titular + adicional';
  if (modalidad === 'SOLO_ADICIONAL') return 'Solo adicional';
  return '-';
};

const getAdditionalLabel = (cliente) => {
  return cliente?.modalidad_adhesion === 'SOLO_ADICIONAL'
    ? 'Reemplaza al titular'
    : 'Adherido al titular';
};

const sortOptions = [
  { value: 'titular_nombre|asc', label: 'Nombre A-Z' },
  { value: 'titular_nombre|desc', label: 'Nombre Z-A' },
  { value: 'alta|desc', label: 'Alta más reciente' },
  { value: 'alta|asc', label: 'Alta más antigua' },
  {
    value: 'monto_final|desc',
    label: 'Monto final mayor a menor'
  },
  {
    value: 'monto_final|asc',
    label: 'Monto final menor a mayor'
  },
  { value: 'inicio|asc', label: 'Inicio más próximo' },
  { value: 'inicio|desc', label: 'Inicio más lejano' }
];

const pageSizeOptions = [10, 15, 20, 30];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

const StatusBadge = ({ estado }) => {
  const map = {
    ACTIVO: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    PENDIENTE_INICIO: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    PAUSADO: 'bg-slate-100 text-slate-700 border border-slate-200/90',
    BAJA: 'bg-red-50 text-red-700 border border-red-200/80',
    BLOQUEADO: 'bg-rose-50 text-rose-700 border border-rose-200/80'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
        map[estado] || 'bg-slate-100 text-slate-700 border border-slate-200/90'
      }`}
    >
      {String(estado || '-').replaceAll('_', ' ')}
    </span>
  );
};

/* Benjamin Orellana - 31/03/2026 - Variantes visuales para acciones de tabla, preparando activación rápida en verde y baja en rojo */
const ActionButton = ({
  icon: Icon,
  title,
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  const variantClasses = {
    primary:
      'border-orange-200 bg-white text-orange-600 hover:border-orange-500 hover:bg-orange-500 hover:text-white',
    success:
      'border-emerald-200 bg-white text-emerald-600 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white',
    danger:
      'border-red-200 bg-white text-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white',
    neutral:
      'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-100 hover:text-slate-800'
  };

  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400'
          : variantClasses[variant] || variantClasses.primary
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
};

const ClientesDebitosPage = () => {
  const navigate = useNavigate();

  const [clientes, setClientes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [terminos, setTerminos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [sedeActiva, setSedeActiva] = useState('TODAS');
  const [expandedRows, setExpandedRows] = useState({});
  const [adicionalesByCliente, setAdicionalesByCliente] = useState({});
  const [loadingAdicionales, setLoadingAdicionales] = useState({});
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [featureNotice, setFeatureNotice] = useState('');

  const [openDetalle, setOpenDetalle] = useState(false);
  const [openEstado, setOpenEstado] = useState(false);
  const [openBaja, setOpenBaja] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [openAdicional, setOpenAdicional] = useState(false);
  const [openCrear, setOpenCrear] = useState(false);

  const [filters, setFilters] = useState({
    q: '',
    banco_id: '',
    plan_id: '',
    estado_general: '',
    modalidad_adhesion: ''
  });

  const [sortValue, setSortValue] = useState('titular_nombre|asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  // Benjamin Orellana - 2026/04/14 - Se guarda el total real informado por backend para paginación server-side.
  const [totalItems, setTotalItems] = useState(0);

  // Benjamin Orellana - 2026/04/14 - Se traduce el sort visual del frontend a los campos válidos del backend.
  const buildBackendSortParams = (sortValue) => {
    const [sortBy, sortDir] = String(sortValue || 'titular_nombre|asc').split(
      '|'
    );

    if (sortBy === 'titular_nombre') {
      return {
        order_by: 'titular_nombre',
        order_direction: sortDir === 'desc' ? 'DESC' : 'ASC'
      };
    }

    if (sortBy === 'alta') {
      return {
        order_by: 'created_at',
        order_direction: sortDir === 'desc' ? 'DESC' : 'ASC'
      };
    }

    if (sortBy === 'inicio') {
      return {
        order_by: 'fecha_inicio_cobro',
        order_direction: sortDir === 'desc' ? 'DESC' : 'ASC'
      };
    }

    if (sortBy === 'monto_final') {
      return {
        order_by: 'monto_base_vigente',
        order_direction: sortDir === 'desc' ? 'DESC' : 'ASC'
      };
    }

    return {
      order_by: 'created_at',
      order_direction: 'DESC'
    };
  };
  /* Benjamin Orellana - 06/04/2026 - Helper defensivo para interpretar flags booleanos provenientes del backend */
  const isTrueLike = (value) =>
    value === true ||
    value === 1 ||
    value === '1' ||
    String(value).toLowerCase() === 'true';

  /* Benjamin Orellana - 06/04/2026 - Generación dinámica de tabs de sedes a partir del catálogo real de sedes ciudad devuelto por la API */
  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .filter((item) => isTrueLike(item?.es_ciudad) && item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [sedes]);

  /* Benjamin Orellana - 06/04/2026 - Construcción dinámica de tabs de sedes evitando valores fijos hardcodeados */
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

  // Benjamin Orellana - 2026/04/13 - Se obtiene identidad autenticada para que backend decida si devuelve tarjeta completa.
  const { userId, userLevel, userName } = useAuth();

  const authUserId = userId;

  /* Benjamin Orellana - 2026/04/13 - En este proyecto userName contiene el correo autenticado del usuario. */
  const authUserEmail = useMemo(() => {
    return String(userName || '')
      .trim()
      .toLowerCase();
  }, [userName]);

  /* Benjamin Orellana - 2026/04/13 - Headers reutilizables para endpoints que pueden devolver tarjeta desencriptada. */
  const authRequestConfig = useMemo(() => {
    const headers = {};

    if (authUserId) {
      headers['x-auth-user-id'] = String(authUserId);
    }

    if (authUserEmail) {
      headers['x-auth-user-email'] = authUserEmail;
    }

    return { headers };
  }, [authUserId, authUserEmail]);

  /* Benjamin Orellana - 31/03/2026 - Helper para mostrar activación rápida cuando el cliente no está activo */
  const canQuickActivate = (cliente) => {
    return String(getClienteEstado(cliente) || '') !== 'ACTIVO';
  };

  // Benjamin Orellana - 2026/04/14 - La grilla de clientes pasa a trabajar con filtros, orden y paginación server-side para no cortar registros al crecer el padrón.
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      try {
        setError('');
        if (!silent) setLoading(true);
        if (silent) setRefreshing(true);

        const sortParams = buildBackendSortParams(sortValue);

        const clienteParams = {
          page,
          limit: pageSize,
          q: String(filters.q || '').trim() || undefined,
          banco_id: filters.banco_id || undefined,
          titular_plan_id: filters.plan_id || undefined,
          estado_general: filters.estado_general || undefined,
          modalidad_adhesion: filters.modalidad_adhesion || undefined,
          sede_id:
            sedeActiva !== 'TODAS'
              ? sedeTabs.find((tab) => tab.key === sedeActiva)?.id || undefined
              : undefined,
          ...sortParams
        };

        const requests = await Promise.allSettled([
          api.get('/debitos-automaticos-clientes', {
            ...authRequestConfig,
            params: clienteParams
          }),
          api.get('/sedes?es_ciudad=true'),
          api.get('/debitos-automaticos-bancos?activo=1'),
          api.get('/debitos-automaticos-planes'),
          api.get('/debitos-automaticos-terminos')
        ]);

        const clientesRes = requests[0];
        const sedesRes = requests[1];
        const bancosRes = requests[2];
        const planesRes = requests[3];
        const terminosRes = requests[4];

        const clientesData =
          clientesRes.status === 'fulfilled'
            ? normalizeArray(clientesRes.value.data)
            : [];

        const totalClientes =
          clientesRes.status === 'fulfilled'
            ? Number(clientesRes.value?.data?.total || 0)
            : 0;

        const sedesData =
          sedesRes.status === 'fulfilled'
            ? normalizeArray(sedesRes.value.data)
            : [];

        const bancosData =
          bancosRes.status === 'fulfilled'
            ? normalizeArray(bancosRes.value.data)
            : [];

        const planesData =
          planesRes.status === 'fulfilled'
            ? normalizeArray(planesRes.value.data)
            : [];

        const terminosDataRaw =
          terminosRes.status === 'fulfilled'
            ? normalizeArray(terminosRes.value.data)
            : [];

        const now = new Date();

        const terminosData = terminosDataRaw
          .filter((item) => Number(item?.activo) === 1)
          .filter((item) => {
            const desde = item?.publicado_desde
              ? new Date(item.publicado_desde)
              : null;
            const hasta = item?.publicado_hasta
              ? new Date(item.publicado_hasta)
              : null;

            const validoDesde =
              !desde || !Number.isNaN(desde.getTime()) ? true : false;
            const validoHasta =
              !hasta || !Number.isNaN(hasta.getTime()) ? true : false;

            if (!validoDesde || !validoHasta) return true;
            if (desde && now < desde) return false;
            if (hasta && now > hasta) return false;

            return true;
          })
          .sort((a, b) => {
            const aDate =
              a?.published_at || a?.publicado_desde || a?.created_at || '';
            const bDate =
              b?.published_at || b?.publicado_desde || b?.created_at || '';
            return String(bDate).localeCompare(String(aDate));
          });

        setClientes(clientesData);
        setTotalItems(totalClientes);
        setSedes(sedesData);
        setBancos(bancosData);
        setPlanes(planesData);
        setTerminos(terminosData);

        if (clientesRes.status === 'rejected') {
          setError(
            clientesRes.reason?.response?.data?.mensajeError ||
              'No se pudieron cargar los clientes adheridos.'
          );
        }
      } catch (err) {
        setError(
          err?.response?.data?.mensajeError ||
            'Ocurrió un error al cargar la pantalla.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      authRequestConfig,
      filters,
      page,
      pageSize,
      sedeActiva,
      sedeTabs,
      sortValue
    ]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [filters, sedeActiva, sortValue, pageSize]);

  /* Benjamin Orellana - 06/04/2026 - Se preserva el objeto completo del banco para que el modal reciba también los datos de beneficio y pueda autocompletar los snapshots correctamente */
  const bancosOptions = useMemo(() => {
    const derived = clientes
      .map((item) => {
        const banco = item?.banco || {};

        return {
          id: item?.banco_id ?? banco?.id ?? item?.id_banco ?? '',
          nombre:
            banco?.nombre ??
            item?.banco_nombre ??
            item?.nombre_banco ??
            getBancoName(item),
          codigo: banco?.codigo ?? item?.banco_codigo ?? '',
          descripcion_publica:
            banco?.descripcion_publica ??
            item?.descripcion_publica ??
            item?.beneficio_descripcion_snapshot ??
            '',
          descuento_off_pct:
            banco?.descuento_off_pct ??
            item?.descuento_off_pct ??
            item?.beneficio_descuento_off_pct_snapshot ??
            0,
          reintegro_pct:
            banco?.reintegro_pct ??
            item?.reintegro_pct ??
            item?.beneficio_reintegro_pct_snapshot ??
            0,
          reintegro_desde_mes:
            banco?.reintegro_desde_mes ??
            item?.reintegro_desde_mes ??
            item?.beneficio_reintegro_desde_mes_snapshot ??
            '',
          reintegro_duracion_meses:
            banco?.reintegro_duracion_meses ??
            item?.reintegro_duracion_meses ??
            item?.beneficio_reintegro_duracion_meses_snapshot ??
            '',
          beneficio_permanente:
            banco?.beneficio_permanente ?? item?.beneficio_permanente ?? 0
        };
      })
      .filter((item) => item.nombre && item.nombre !== '-');

    const merged = [...normalizeArray(bancos), ...derived];
    const map = new Map();

    merged.forEach((item) => {
      const id = String(
        item?.id ?? item?.banco_id ?? item?.value ?? item?.nombre ?? ''
      );
      const nombre =
        item?.nombre ?? item?.label ?? item?.banco_nombre ?? item?.descripcion;

      if (!id || !nombre) return;

      const previous = map.get(id);

      map.set(id, {
        ...(previous || {}),
        ...item,
        id,
        nombre
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      String(a?.nombre || '').localeCompare(String(b?.nombre || ''), 'es')
    );
  }, [bancos, clientes]);

  const planesOptions = useMemo(() => {
    const derived = clientes
      .map((item) => ({
        id:
          item?.titular_plan_id ??
          item?.plan_id ??
          item?.plan?.id ??
          item?.titular_plan?.id ??
          '',
        nombre: getPlanName(item)
      }))
      .filter(
        (item) =>
          item.nombre && item.nombre !== '-' && item.nombre !== 'Solo adicional'
      );

    const merged = [...normalizeArray(planes), ...derived];
    const map = new Map();

    merged.forEach((item) => {
      const id = String(
        item?.id ?? item?.plan_id ?? item?.value ?? item?.nombre
      );
      const nombre = item?.nombre ?? item?.label ?? item?.plan_nombre;
      if (!id || !nombre) return;
      map.set(id, { id, nombre });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre, 'es')
    );
  }, [planes, clientes]);

  const plansMap = useMemo(() => {
    return new Map(planesOptions.map((item) => [String(item.id), item.nombre]));
  }, [planesOptions]);

  const resolveClientePlanName = (cliente) => {
    return getPlanName(cliente, plansMap);
  };

  const resolveAdicionalPlanName = (adicional) => {
    if (!adicional) return '-';

    return (
      adicional?.plan?.nombre ||
      adicional?.plan_nombre ||
      (adicional?.plan_id ? plansMap.get(String(adicional.plan_id)) : null) ||
      '-'
    );
  };

  const filteredAndSorted = useMemo(() => {
    const [sortBy, sortDir] = String(sortValue).split('|');

    const filtered = clientes.filter((item) => {
      const q = toLower(filters.q);
      const bancoId = String(item?.banco_id ?? item?.banco?.id ?? '');
      const planId = String(
        item?.titular_plan_id ?? item?.plan?.id ?? item?.titular_plan?.id ?? ''
      );
      const estado = String(getClienteEstado(item) || '');
      const modalidad = String(item?.modalidad_adhesion || '');
      const sedeId = String(getClienteSedeId(item) || '');

      /* Benjamin Orellana - 09/04/2026 - Se incorpora información comercial del cliente a la búsqueda libre */
      const searchBlob = [
        getClienteName(item),
        getClienteDni(item),
        getBancoName(item),
        resolveClientePlanName(item),
        getTarjetaText(item),
        getEspecialText(item),
        getBeneficioText(item),
        getMontoInicial(item),
        getDescuentoPct(item),
        getMontoFinal(item)
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !q || searchBlob.includes(q);
      const matchesBanco =
        !filters.banco_id || bancoId === String(filters.banco_id);
      const matchesPlan =
        !filters.plan_id || planId === String(filters.plan_id);
      const matchesEstado =
        !filters.estado_general || estado === String(filters.estado_general);
      const matchesModalidad =
        !filters.modalidad_adhesion ||
        modalidad === String(filters.modalidad_adhesion);
      const matchesSede =
        sedeActiva === 'TODAS' ||
        sedeId === String(sedeTabs.find((tab) => tab.key === sedeActiva)?.id);

      return (
        matchesSearch &&
        matchesBanco &&
        matchesPlan &&
        matchesEstado &&
        matchesModalidad &&
        matchesSede
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1;

      if (sortBy === 'titular_nombre') {
        return (
          getClienteName(a).localeCompare(getClienteName(b), 'es', {
            sensitivity: 'base'
          }) * dir
        );
      }

      if (sortBy === 'monto_final') {
        const va = Number(getMontoFinal(a) || 0);
        const vb = Number(getMontoFinal(b) || 0);
        return (va - vb) * dir;
      }

      if (sortBy === 'alta') {
        const va = new Date(getAltaDate(a) || 0).getTime();
        const vb = new Date(getAltaDate(b) || 0).getTime();
        return (va - vb) * dir;
      }

      if (sortBy === 'inicio') {
        const va = new Date(getInicioDate(a) || 0).getTime();
        const vb = new Date(getInicioDate(b) || 0).getTime();
        return (va - vb) * dir;
      }

      return 0;
    });

    return sorted;
  }, [clientes, filters, sedeActiva, sortValue, sedeTabs]);

  // Benjamin Orellana - 2026/04/14 - La tabla usa directamente la página devuelta por backend sin re-filtrar ni re-paginar localmente.
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = clientes;

  /* Benjamin Orellana - 2026/04/13 - Expansión lazy del adicional reutilizando el contexto autenticado para que el backend mantenga coherencia de tarjeta completa en el cliente. */
  const handleToggleRow = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    const nextValue = !expandedRows[clienteId];
    setExpandedRows((prev) => ({ ...prev, [clienteId]: nextValue }));

    if (!nextValue || adicionalesByCliente[clienteId] !== undefined) return;

    const embeddedAdicional = normalizeSingle(cliente?.adicional);

    if (embeddedAdicional) {
      setAdicionalesByCliente((prev) => ({
        ...prev,
        [clienteId]: embeddedAdicional
      }));
    }

    try {
      setLoadingAdicionales((prev) => ({ ...prev, [clienteId]: true }));

      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}/adicional`,
        authRequestConfig
      );

      const adicionalRow = normalizeSingle(response.data);

      setAdicionalesByCliente((prev) => ({
        ...prev,
        [clienteId]: adicionalRow ?? embeddedAdicional ?? null
      }));
    } catch (err) {
      if (!embeddedAdicional) {
        setAdicionalesByCliente((prev) => ({
          ...prev,
          [clienteId]: null
        }));
      }
    } finally {
      setLoadingAdicionales((prev) => ({ ...prev, [clienteId]: false }));
    }
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      banco_id: '',
      plan_id: '',
      estado_general: '',
      modalidad_adhesion: ''
    });
    setSedeActiva('TODAS');
    setSortValue('titular_nombre|asc');
    setFeatureNotice('');
  };

  const handleFeatureSoon = (actionName, cliente) => {
    setSelectedCliente(cliente);
    setFeatureNotice(
      `${actionName} para ${getClienteName(
        cliente
      )} quedó preparado para la siguiente fase con modal.`
    );
  };

  const handleGoToPeriodos = (cliente) => {
    navigate(
      `/dashboard/debitos-automaticos/periodos?cliente_id=${getClienteId(cliente)}`
    );
  };

  const currentRangeStart =
    totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const currentRangeEnd = Math.min(safePage * pageSize, totalItems);

  /* Benjamin Orellana - 31/03/2026 - Apertura de detalle consumiendo el OBR real para mostrar plan, pagos y datos anidados correctos */
  const handleOpenDetail = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || cliente;
      setSelectedCliente(detail);
      setOpenDetalle(true);
    } catch (err) {
      setSelectedCliente(cliente);
      setOpenDetalle(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo, se muestran los datos disponibles del listado.'
      );
    }
  };

  const handleOpenEstado = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || cliente;
      setSelectedCliente(detail);
      setOpenEstado(true);
    } catch (err) {
      setSelectedCliente(cliente);
      setOpenEstado(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo, se abre el cambio de estado con los datos disponibles.'
      );
    }
  };

  const handleOpenBaja = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || cliente;
      setSelectedCliente(detail);
      setOpenBaja(true);
    } catch (err) {
      setSelectedCliente(cliente);
      setOpenBaja(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo, se abre la baja con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 31/03/2026 - Activación rápida desde la tabla consumiendo el endpoint específico /activar y refrescando el padrón */
  const handleActivarCliente = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    const nombre = getClienteName(cliente);
    const estadoActual = String(getClienteEstado(cliente) || '');

    const result = await Swal.fire({
      title: '¿Activar cliente?',
      text:
        estadoActual === 'BAJA'
          ? `${nombre} volverá a estado ACTIVO y saldrá de baja operativa.`
          : `${nombre} pasará a estado ACTIVO.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    try {
      const response = await api.put(
        `/debitos-automaticos-clientes/${clienteId}/activar`,
        {},
        authRequestConfig
      );

      const updatedRow = normalizeSingle(response.data) || {
        ...cliente,
        estado_general: 'ACTIVO',
        fecha_baja: null
      };

      setClientes((prev) =>
        prev.map((item) =>
          String(getClienteId(item)) === String(clienteId)
            ? {
                ...item,
                ...updatedRow,
                estado_general: 'ACTIVO',
                fecha_baja: updatedRow?.fecha_baja ?? null
              }
            : item
        )
      );

      if (
        selectedCliente &&
        String(getClienteId(selectedCliente)) === String(clienteId)
      ) {
        setSelectedCliente((prev) => ({
          ...prev,
          ...updatedRow,
          estado_general: 'ACTIVO',
          fecha_baja: updatedRow?.fecha_baja ?? null
        }));
      }

      await fetchData({ silent: true });

      Swal.fire({
        title: 'Cliente activado',
        text: `${nombre} quedó nuevamente en estado ACTIVO.`,
        icon: 'success',
        confirmButtonColor: '#f97316'
      });
    } catch (err) {
      Swal.fire({
        title: 'No se pudo activar',
        text:
          err?.response?.data?.mensajeError ||
          'Ocurrió un error al intentar activar el cliente.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    }
  };

  /* Benjamin Orellana - 31/03/2026 - Apertura del modal de edición cargando primero el detalle real del cliente */
  const handleOpenEditar = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || cliente;
      setSelectedCliente(detail);
      setOpenEditar(true);
    } catch (err) {
      setSelectedCliente(cliente);
      setOpenEditar(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo, se abre la edición con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 31/03/2026 - Apertura del modal de adicional cargando primero el detalle del cliente seleccionado */
  const handleOpenAdicional = async (cliente) => {
    const clienteId = getClienteId(cliente);
    if (!clienteId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || cliente;
      setSelectedCliente(detail);
      setOpenAdicional(true);
    } catch (err) {
      setSelectedCliente(cliente);
      setOpenAdicional(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo, se abre el adicional con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 2026/04/10 - Parsea fechas evitando desfases con valores YYYY-MM-DD y fechas ISO. */
  const parseSafeDate = (value) => {
    if (!value) return null;

    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const [year, month, day] = raw.split('-').map(Number);
      return new Date(year, month - 1, day);
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  /* Benjamin Orellana - 2026/04/10 - Determina si un período corresponde al mismo mes calendario del alta del cliente. */
  const shouldShowNuevoBadgePeriodo = (periodo) => {
    const alta = parseSafeDate(resolveAlta(periodo));
    const periodoAnio = Number(periodo?.periodo_anio);
    const periodoMes = Number(periodo?.periodo_mes);

    if (!alta || !periodoAnio || !periodoMes) return false;

    return (
      alta.getFullYear() === periodoAnio && alta.getMonth() + 1 === periodoMes
    );
  };

  /* Benjamin Orellana - 2026/04/10 - Determina si un cliente sigue dentro del mes calendario actual en el que fue dado de alta. */
  const shouldShowNuevoBadgeCliente = (cliente) => {
    const alta = parseSafeDate(getAltaDate(cliente));
    if (!alta) return false;

    const now = new Date();

    return (
      alta.getFullYear() === now.getFullYear() &&
      alta.getMonth() === now.getMonth()
    );
  };

  /* Benjamin Orellana - 2026/04/10 - Badge visual compacta para identificar registros nuevos. */
  const NuevoBadge = () => (
    <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">
      N
    </span>
  );

  return (
    <>
      <NavbarStaff />

      <section className="dashboardbg min-h-[calc(100vh-80px)] bg-[#fff7f2]">
        <div className="mx-auto max-w-[2000px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {/* Benjamin Orellana - 31/03/2026 - Encabezado sobrio de la page, priorizando lectura rápida y CTA principal */}
            <div className="rounded-[26px] border border-orange-100 bg-white px-5 py-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-500">
                    Débitos Automáticos
                  </p>
                  <h1 className="mt-1 font-bignoodle text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Clientes y adicionales
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenCrear(true)}
                    className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_-18px_rgba(249,115,22,0.8)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-orange-600"
                  >
                    Crear cliente
                  </button>

                  <button
                    type="button"
                    onClick={() => fetchData({ silent: true })}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-[1px] hover:border-orange-500 hover:bg-orange-50"
                  >
                    <RefreshCcw
                      className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                    />
                    Actualizar
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs de sedes */}
            <div className="rounded-[24px] border border-orange-100 bg-white px-4 py-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)] sm:px-5">
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

            {/* Filtros */}
            <div className="rounded-[24px] border border-orange-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)] sm:p-5">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Filter className="h-4 w-4 text-orange-500" />
                Filtros
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                <div className="xl:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={filters.q}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          q: e.target.value
                        }))
                      }
                      placeholder="Nombre, DNI, banco, especial o montos"
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Banco
                  </label>
                  <select
                    value={filters.banco_id}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        banco_id: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todos</option>
                    {bancosOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Plan
                  </label>
                  <select
                    value={filters.plan_id}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        plan_id: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todos</option>
                    {planesOptions.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Estado
                  </label>
                  <select
                    value={filters.estado_general}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        estado_general: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE_INICIO">Pendiente inicio</option>
                    <option value="ACTIVO">Activo</option>
                    <option value="PAUSADO">Pausado</option>
                    <option value="BAJA">Baja</option>
                    <option value="BLOQUEADO">Bloqueado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Modalidad
                  </label>
                  <select
                    value={filters.modalidad_adhesion}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        modalidad_adhesion: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todas</option>
                    <option value="TITULAR_SOLO">Titular solo</option>
                    <option value="AMBOS">Titular + adicional</option>
                    <option value="SOLO_ADICIONAL">Solo adicional</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Ordenar
                  </label>
                  <select
                    value={sortValue}
                    onChange={(e) => setSortValue(e.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    {sortOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Filas por página
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1 xl:col-span-3 flex items-end justify-start xl:justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                  >
                    <X className="h-4 w-4" />
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Tabla */}
            <div className="overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-[0_18px_50px_-32px_rgba(15,23,42,0.28)]">
              <div className="flex flex-col gap-3 border-b border-orange-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div>
                  <p className="text-sm text-slate-500">
                    {totalItems === 0
                      ? 'Sin resultados para los filtros actuales.'
                      : `Mostrando ${currentRangeStart}-${currentRangeEnd} de ${totalItems} registros`}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[1760px] w-full border-collapse">
                  <thead className="bg-orange-500 text-white">
                    <tr className="text-left">
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Nombre
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        DNI
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Plan
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Monto inicial
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Desc. %
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Monto final
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Banco
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Tarjeta
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Alta
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Inicio
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Pagos
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Baja
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Especial
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em]">
                        Estado
                      </th>
                      <th className="px-4 py-4 text-xs font-bold uppercase tracking-[0.18em] text-center">
                        Acciones
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      Array.from({ length: 8 }).map((_, index) => (
                        <tr
                          key={`skeleton-${index}`}
                          className="border-b border-slate-100"
                        >
                          {Array.from({ length: 15 }).map((__, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-4">
                              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="px-6 py-16 text-center">
                          <div className="mx-auto max-w-xl">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                              <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                              No encontramos clientes para estos filtros
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Probá limpiando filtros, cambiando la sede activa
                              o actualizando el padrón.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((cliente) => {
                        const clienteId = getClienteId(cliente);
                        const isExpanded = !!expandedRows[clienteId];
                        const adicional = adicionalesByCliente[clienteId];
                        const adicionalLoading =
                          !!loadingAdicionales[clienteId];

                        return (
                          <React.Fragment key={clienteId}>
                            <tr className="group border-b border-slate-100 transition-colors duration-200 hover:bg-orange-50/70">
                              <td className="px-4 py-4 align-top">
                                <div className="flex items-start gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleRow(cliente)}
                                    className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-orange-200 bg-white text-orange-600 transition-all duration-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                                    title="Ver adicional"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </button>

                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-bold text-slate-900">
                                        {getClienteName(cliente)}
                                      </p>
                                      {shouldShowNuevoBadgeCliente(cliente) && (
                                        <NuevoBadge />
                                      )}
                                    </div>

                                    <p className="mt-1 text-xs font-medium text-slate-500">
                                      {getModalidadText(cliente)}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-medium text-slate-700">
                                {getClienteDni(cliente)}
                              </td>

                              <td className="px-4 py-4 align-top">
                                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                                  <BadgeDollarSign className="h-4 w-4 text-orange-500" />
                                  {resolveClientePlanName(cliente)}
                                </div>
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">
                                {formatCurrency(getMontoInicial(cliente))}
                              </td>

                              <td className="px-4 py-4 align-top">
                                <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                                  {formatPercent(getDescuentoPct(cliente))}
                                </span>
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">
                                {formatCurrency(getMontoFinal(cliente))}
                              </td>

                              <td className="px-4 py-4 align-top">
                                <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                                  <Landmark className="h-4 w-4 text-orange-500" />
                                  {getBancoName(cliente)}
                                </div>
                              </td>

                              <td className="px-4 py-4 align-top">
                                <div className="inline-flex items-center gap-2 text-sm text-slate-700">
                                  <CreditCard className="h-4 w-4 text-orange-500" />
                                  {getTarjetaText(cliente)}
                                </div>
                              </td>

                              <td className="px-4 py-4 align-top text-sm text-slate-700">
                                {formatDate(getAltaDate(cliente))}
                              </td>

                              <td className="px-4 py-4 align-top text-sm text-slate-700">
                                <div>{formatDate(getInicioDate(cliente))}</div>
                                {/* <div className="mt-1 text-xs text-slate-400">
                                  {formatMonth(getInicioDate(cliente))}
                                </div> */}
                              </td>

                              <td className="px-4 py-4 align-top text-sm font-semibold text-slate-900">
                                {getPagosCount(cliente)}
                              </td>

                              <td className="px-4 py-4 align-top text-sm text-slate-700">
                                {formatDate(getBajaDate(cliente))}
                              </td>

                              <td className="px-4 py-4 align-top">
                                <span className="text-sm text-slate-700">
                                  {getEspecialText(cliente)}
                                </span>
                              </td>

                              <td className="px-4 py-4 align-top">
                                <StatusBadge
                                  estado={getClienteEstado(cliente)}
                                />
                              </td>

                              <td className="px-4 py-4 align-top">
                                <div className="flex flex-wrap items-center justify-center gap-2">
                                  <ActionButton
                                    icon={Eye}
                                    title="Ver"
                                    onClick={() => handleOpenDetail(cliente)}
                                  />

                                  <ActionButton
                                    icon={Pencil}
                                    title="Editar"
                                    onClick={() => handleOpenEditar(cliente)}
                                  />

                                  <ActionButton
                                    icon={ShieldCheck}
                                    title="Estado"
                                    onClick={() => handleOpenEstado(cliente)}
                                  />

                                  <ActionButton
                                    icon={UserRoundPlus}
                                    title="Adicional"
                                    onClick={() => handleOpenAdicional(cliente)}
                                  />

                                  <ActionButton
                                    icon={CalendarDays}
                                    title="Períodos"
                                    onClick={() => handleGoToPeriodos(cliente)}
                                  />

                                  {canQuickActivate(cliente) ? (
                                    <ActionButton
                                      icon={CheckCircle2}
                                      title="Activar"
                                      variant="success"
                                      onClick={() =>
                                        handleActivarCliente(cliente)
                                      }
                                    />
                                  ) : (
                                    <ActionButton
                                      icon={Ban}
                                      title="Dar baja"
                                      variant="danger"
                                      onClick={() => handleOpenBaja(cliente)}
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>

                            <tr>
                              <td colSpan={15} className="p-0">
                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      variants={rowExpandV}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      className="overflow-hidden border-b border-slate-100 bg-orange-50/40"
                                    >
                                      <div className="px-6 py-4">
                                        {adicionalLoading ? (
                                          <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-4">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                                            <span className="text-sm text-slate-600">
                                              Cargando adicional...
                                            </span>
                                          </div>
                                        ) : adicional ? (
                                          <div className="rounded-2xl border border-orange-100 bg-white px-4 py-4">
                                            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                                              <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-orange-500">
                                                  Persona adicional
                                                </p>
                                                <h4 className="mt-1 text-base font-black text-slate-900">
                                                  {adicional?.nombre || '-'}
                                                </h4>
                                                <p className="mt-1 text-sm text-slate-500">
                                                  {getAdditionalLabel(cliente)}
                                                </p>
                                              </div>

                                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[640px]">
                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                                    DNI
                                                  </p>
                                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {adicional?.dni || '-'}
                                                  </p>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                                    Plan
                                                  </p>
                                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {resolveAdicionalPlanName(
                                                      adicional
                                                    )}
                                                  </p>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                                    Estado relación
                                                  </p>
                                                  <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {getAdditionalLabel(
                                                      cliente
                                                    )}
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="rounded-2xl border border-dashed border-orange-200 bg-white px-4 py-4 text-sm text-slate-500">
                                            Este cliente no tiene persona
                                            adicional asociada.
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {!loading && totalItems > 0 && (
                <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <p className="text-sm text-slate-500">
                    Página {safePage} de {totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 ${
                        safePage <= 1
                          ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          : 'border border-orange-200 bg-white text-orange-600 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </button>

                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      className={`inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition-all duration-200 ${
                        safePage >= totalPages
                          ? 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                          : 'border border-orange-200 bg-white text-orange-600 hover:border-orange-500 hover:bg-orange-50'
                      }`}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <ModalClienteDetalle
        open={openDetalle}
        onClose={() => {
          setOpenDetalle(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        onGoToPeriodos={(cliente) => handleGoToPeriodos(cliente)}
      />

      <ModalClienteEstado
        open={openEstado}
        onClose={() => {
          setOpenEstado(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        onSaved={(updatedRow) => {
          setSelectedCliente(updatedRow);
          setClientes((prev) =>
            prev.map((item) =>
              String(getClienteId(item)) === String(getClienteId(updatedRow))
                ? { ...item, ...updatedRow }
                : item
            )
          );
          setOpenEstado(false);
          fetchData({ silent: true });
        }}
      />

      <ModalClienteBaja
        open={openBaja}
        onClose={() => {
          setOpenBaja(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        onSaved={(updatedRow) => {
          setSelectedCliente(updatedRow);
          setClientes((prev) =>
            prev.map((item) =>
              String(getClienteId(item)) === String(getClienteId(updatedRow))
                ? { ...item, ...updatedRow, estado_general: 'BAJA' }
                : item
            )
          );
          setOpenBaja(false);
          fetchData({ silent: true });
        }}
      />

      <ModalClienteEditar
        open={openEditar}
        onClose={() => {
          setOpenEditar(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        sedes={sedes}
        bancos={bancosOptions}
        planes={planesOptions}
        onSaved={(updatedRow) => {
          setSelectedCliente(updatedRow);
          setClientes((prev) =>
            prev.map((item) =>
              String(getClienteId(item)) === String(getClienteId(updatedRow))
                ? { ...item, ...updatedRow }
                : item
            )
          );
          setOpenEditar(false);
          fetchData({ silent: true });
        }}
      />

      <ModalClienteAdicional
        open={openAdicional}
        onClose={() => {
          setOpenAdicional(false);
          setSelectedCliente(null);
        }}
        cliente={selectedCliente}
        planes={planesOptions}
        onSaved={({ action, cliente_id, adicional }) => {
          setAdicionalesByCliente((prev) => ({
            ...prev,
            [cliente_id]: adicional
          }));

          setSelectedCliente((prev) => {
            if (!prev) return prev;
            if (String(getClienteId(prev)) !== String(cliente_id)) return prev;
            return {
              ...prev,
              adicional
            };
          });

          setExpandedRows((prev) => ({
            ...prev,
            [cliente_id]: true
          }));

          setOpenAdicional(false);
          fetchData({ silent: true });
        }}
      />

      <ModalClienteCrear
        open={openCrear}
        onClose={() => setOpenCrear(false)}
        sedes={sedes}
        bancos={bancosOptions}
        planes={planesOptions}
        terminos={terminos}
        userId={userId}
        defaultRolCarga={userLevel}
        onCreated={(createdRow) => {
          setOpenCrear(false);
          if (createdRow) {
            setClientes((prev) => [createdRow, ...prev]);
            setSelectedCliente(createdRow);
          }
          fetchData({ silent: true });
        }}
      />
    </>
  );
};;;;;

export default ClientesDebitosPage;
