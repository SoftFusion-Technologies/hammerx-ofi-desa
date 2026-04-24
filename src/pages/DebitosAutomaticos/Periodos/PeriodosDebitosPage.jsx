/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 01 / 04 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Pantalla principal de Períodos del módulo Débitos Automáticos.
 * Esta primera fase prioriza una tabla operativa mensual, filtros,
 * selector de período, generación de mes y acciones visibles por fila.
 *
 * Tema: Períodos - Débitos Automáticos
 * Capa: Frontend
 */
import ExcelJS from 'exceljs';
import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback
} from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import NavbarStaff from '../../staff/NavbarStaff';
import {
  Search,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  AlertCircle,
  CalendarDays,
  Eye,
  CheckCircle2,
  Ban,
  CreditCard,
  BadgeDollarSign,
  RotateCcw,
  Landmark,
  FileText,
  Send,
  ShieldCheck,
  Printer
} from 'lucide-react';

import ModalPeriodoDetalle from './components/ModalPeriodoDetalle';
import ModalPeriodoAprobar from './components/ModalPeriodoAprobar';
import ModalPeriodoBaja from './components/ModalPeriodoBaja';
import ModalPeriodoCambioTarjeta from './components/ModalPeriodoCambioTarjeta';
import ModalPeriodoPagoManual from './components/ModalPeriodoPagoManual';
import ModalPeriodoReintentar from './components/ModalPeriodoReintentar';

import { useAuth } from '../../../AuthContext';
import ModalClienteCrear from '../Clientes/components/ModalClienteCrear';

/* Benjamin Orellana - 01/04/2026 - Helpers base para normalizar respuestas del backend y enriquecer el listado de períodos con datos del cliente adherido */
const panelV = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24 } }
};

const currentMonthInput = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
};

const parsePeriodInput = (value) => {
  const [yearText, monthText] = String(value || '').split('-');
  return {
    periodo_anio: Number(yearText || 0),
    periodo_mes: Number(monthText || 0)
  };
};

const isTrueLike = (value) =>
  value === true || value === 1 || String(value).toLowerCase() === 'true';

const normalizeArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.registros)) return payload.registros;
  if (Array.isArray(payload?.periodos)) return payload.periodos;
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

/* Benjamin Orellana - 2026/04/10 - Corrige el desfase de un día al formatear fechas tipo YYYY-MM-DD en zona horaria local. */
const formatDate = (value) => {
  if (!value) return '-';

  const raw = String(value).trim();

  // Caso típico MySQL DATE: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split('-');
    return `${day}/${month}/${year}`;
  }

  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d);
};

const formatMonthLabel = (year, month) => {
  if (!year || !month) return '-';
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('es-AR', {
    month: 'long',
    year: 'numeric'
  }).format(d);
};

// Benjamin Orellana - 10/04/2026 - Se unifica el formateo monetario de períodos a dos decimales para reflejar correctamente el snapshot comercial
const formatCurrency = (value, currency = 'ARS') => {
  if (value === null || value === undefined || value === '') return '-';
  const n = Number(value);
  if (Number.isNaN(n)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency || 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(n);
};

// Benjamin Orellana - 10/04/2026 - Formatea porcentajes comerciales del período para mostrar descuento del cliente
const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const n = Number(value);
  if (Number.isNaN(n)) return '-';

  return `${n.toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}%`;
};

const toLower = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

const getPeriodoId = (item) => item?.id ?? null;

const getClienteIdFromPeriodo = (periodo) =>
  periodo?.cliente_id ?? periodo?.cliente?.id ?? null;

const sortOptions = [
  { value: 'titular_nombre|asc', label: 'Nombre A-Z' },
  { value: 'titular_nombre|desc', label: 'Nombre Z-A' },
  { value: 'monto|desc', label: 'Monto final mayor a menor' },
  { value: 'monto|asc', label: 'Monto final menor a mayor' },
  { value: 'alta|desc', label: 'Alta más reciente' },
  { value: 'alta|asc', label: 'Alta más antigua' }
];

/* Benjamin Orellana - 2026/04/14 - Traduce el sort visual del frontend al formato paginado soportado por backend. */
const resolveBackendSort = (value) => {
  const [sortByRaw, sortDirRaw] = String(value || 'titular_nombre|asc').split(
    '|'
  );

  const order_direction =
    String(sortDirRaw || 'asc').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  switch (sortByRaw) {
    case 'titular_nombre':
      return { order_by: 'titular_nombre', order_direction };
    case 'monto':
      return { order_by: 'monto', order_direction };
    case 'alta':
      return { order_by: 'alta', order_direction };
    default:
      return { order_by: 'created_at', order_direction: 'DESC' };
  }
};

const pageSizeOptions = [10, 15, 20, 30];

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

/* Benjamin Orellana - 01/04/2026 - Badge genérico para estados operativos del módulo */
const Badge = ({ children, variant = 'neutral' }) => {
  const classes = {
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    orange: 'bg-orange-50 text-orange-700 border border-orange-200'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
        classes[variant] || classes.neutral
      }`}
    >
      {children}
    </span>
  );
};

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
    warning:
      'border-amber-200 bg-white text-amber-600 hover:border-amber-500 hover:bg-amber-500 hover:text-white',
    info: 'border-sky-200 bg-white text-sky-600 hover:border-sky-500 hover:bg-sky-500 hover:text-white',
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

const PeriodosDebitosPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const clienteIdFromQuery = searchParams.get('cliente_id') || '';

  const [periodos, setPeriodos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [planes, setPlanes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [periodoSeleccionado, setPeriodoSeleccionado] =
    useState(currentMonthInput());
  const [sedeActiva, setSedeActiva] = useState('TODAS');

  const [filters, setFilters] = useState({
    q: '',
    banco_id: '',
    plan_id: '',
    estado_cobro: '',
    estado_envio: '',
    accion_requerida: '',
    cliente_id: clienteIdFromQuery
  });

  const [sortValue, setSortValue] = useState('titular_nombre|asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  /* Benjamin Orellana - 2026/04/14 - Guarda el total real devuelto por backend para paginación server-side. */
  const [totalRows, setTotalRows] = useState(0);

  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [featureNotice, setFeatureNotice] = useState('');

  const [openDetalle, setOpenDetalle] = useState(false);
  const [openAprobar, setOpenAprobar] = useState(false);
  const [openBaja, setOpenBaja] = useState(false);
  const [openCambioTarjeta, setOpenCambioTarjeta] = useState(false);
  const [openPagoManual, setOpenPagoManual] = useState(false);
  const [openReintentar, setOpenReintentar] = useState(false);
  /* Benjamin Orellana - 2026/04/10 - Estado para reutilizar el alta manual de cliente desde la pantalla de períodos. */
  const [terminos, setTerminos] = useState([]);
  const [openCrear, setOpenCrear] = useState(false);
  const [deshacerCobroLoadingId, setDeshacerCobroLoadingId] = useState(null);

  /* Benjamin Orellana - 2026/04/13 - Se obtiene identidad autenticada para que backend decida si devuelve tarjeta completa en períodos. */
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
  /* Benjamin Orellana - 2026/04/13 - Carga principal de períodos y clientes enviando contexto autenticado para resolver tarjeta completa cuando corresponda. */

  /* Benjamin Orellana - 2026/04/14 - Se separan catálogos estáticos de la grilla paginada para evitar parpadeos y recargas innecesarias. */
  const fetchCatalogos = useCallback(async () => {
    try {
      const requests = await Promise.allSettled([
        api.get('/debitos-automaticos-clientes', {
          params: { page: 1, limit: 100000 },
          ...authRequestConfig
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
      const terminosData =
        terminosRes.status === 'fulfilled'
          ? normalizeArray(terminosRes.value.data)
          : [];

      setClientes(clientesData);
      setSedes(sedesData);
      setBancos(bancosData);
      setPlanes(planesData);
      setTerminos(terminosData);
    } catch (_) {
      // Se preserva el estado actual si algún catálogo falla.
    }
  }, [authRequestConfig]);

  /* Benjamin Orellana - 2026/04/14 - La grilla de períodos se obtiene ya filtrada, ordenada y paginada desde backend. */
  const fetchPeriodos = useCallback(
    async ({ silent = false } = {}) => {
      try {
        const { periodo_anio, periodo_mes } =
          parsePeriodInput(periodoSeleccionado);

        const { order_by, order_direction } = resolveBackendSort(sortValue);

        setError('');
        if (!silent) setLoading(true);
        if (silent) setRefreshing(true);

        const response = await api.get('/debitos-automaticos-periodos', {
          params: {
            periodo_anio,
            periodo_mes,
            page,
            limit: pageSize,
            q: filters.q || undefined,
            banco_id: filters.banco_id || undefined,
            plan_id: filters.plan_id || undefined,
            estado_cobro: filters.estado_cobro || undefined,
            estado_envio: filters.estado_envio || undefined,
            accion_requerida: filters.accion_requerida || undefined,
            cliente_id: filters.cliente_id || undefined,
            sede_id: sedeActiva !== 'TODAS' ? sedeActiva : undefined,
            order_by,
            order_direction
          },
          ...authRequestConfig
        });

        setPeriodos(normalizeArray(response.data));
        setTotalRows(Number(response?.data?.total || 0));
      } catch (err) {
        setPeriodos([]);
        setTotalRows(0);
        setError(
          err?.response?.data?.mensajeError ||
            'Ocurrió un error al cargar los períodos.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      periodoSeleccionado,
      sortValue,
      page,
      pageSize,
      filters,
      sedeActiva,
      authRequestConfig
    ]
  );

  /* Benjamin Orellana - 2026/04/24 - Se separan los errores de recarga de grilla y catálogos para identificar con precisión qué parte falla luego de generar un mes. */
  const fetchData = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);

        console.log('[PERIODOS] fetchData -> inicio');

        try {
          console.log('[PERIODOS] fetchData -> cargando grilla');
          await fetchPeriodos({ silent: true });
          console.log('[PERIODOS] fetchData -> grilla ok');
        } catch (error) {
          console.error('[PERIODOS] fetchData -> error en grilla:', error);
          throw error;
        }

        try {
          console.log('[PERIODOS] fetchData -> cargando catálogos');
          await fetchCatalogos();
          console.log('[PERIODOS] fetchData -> catálogos ok');
        } catch (error) {
          console.error('[PERIODOS] fetchData -> error en catálogos:', error);
          throw error;
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [fetchPeriodos, fetchCatalogos]
  );

  /* Benjamin Orellana - 2026/04/14 - Los catálogos se cargan una sola vez por montaje o cambio de contexto autenticado. */
  useEffect(() => {
    fetchCatalogos();
  }, [fetchCatalogos]);

  /* Benjamin Orellana - 2026/04/14 - Los períodos se refrescan cada vez que cambia la consulta visible de la grilla. */
  /* Benjamin Orellana - 2026/04/14 - Evita doble request: si cambió un filtro y la página actual no es 1, primero resetea paginación y recién luego consulta. */
  useEffect(() => {
    if (page !== 1) return;
    fetchPeriodos();
  }, [fetchPeriodos, page]);

  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [filters, sedeActiva, sortValue, pageSize, periodoSeleccionado]);

  /* Benjamin Orellana - 2026/04/14 - Reacomoda la página actual cuando el total filtrado disminuye. */
  useEffect(() => {
    const nextTotalPages = Math.max(1, Math.ceil(totalRows / pageSize));
    if (page > nextTotalPages) {
      setPage(nextTotalPages);
    }
  }, [page, pageSize, totalRows]);

  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .filter((item) => isTrueLike(item?.es_ciudad) && item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [sedes]);

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

  const clientesById = useMemo(() => {
    return new Map(
      (Array.isArray(clientes) ? clientes : []).map((item) => [
        String(item?.id),
        item
      ])
    );
  }, [clientes]);

  const bancosById = useMemo(() => {
    return new Map(
      (Array.isArray(bancos) ? bancos : []).map((item) => [
        String(item?.id),
        item
      ])
    );
  }, [bancos]);

  const planesById = useMemo(() => {
    return new Map(
      (Array.isArray(planes) ? planes : []).map((item) => [
        String(item?.id),
        item
      ])
    );
  }, [planes]);

  // Benjamin Orellana - 2026/04/13 - Fusiona el cliente embebido del período con el padrón de clientes para priorizar métricas calculadas como pagos_cobrados.
  const resolveCliente = (periodo) => {
    const clientePeriodo = periodo?.cliente || null;
    const clienteListado =
      clientesById.get(String(getClienteIdFromPeriodo(periodo))) || null;

    if (clientePeriodo && clienteListado) {
      return {
        ...clientePeriodo,
        ...clienteListado
      };
    }

    return clienteListado || clientePeriodo || null;
  };

  /* Benjamin Orellana - 2026/04/13 - Para exportación bancaria prioriza la tarjeta completa si el backend la habilitó; si no, usa la máscara disponible. */
  const resolveNumeroTarjetaBanco = (periodo) => {
    const cliente = resolveCliente(periodo);

    return String(
      cliente?.tarjeta_numero_exportacion ||
        cliente?.tarjeta_numero_completo ||
        periodo?.tarjeta_numero_completo ||
        cliente?.tarjeta_mascara ||
        ''
    ).trim();
  };

  /* Benjamin Orellana - 2026/04/10 - Genera el número de comprobante secuencial del archivo según el orden filtrado final. */
  const resolveNumeroComprobanteBanco = (_periodo, index) => {
    return String(index + 1);
  };

  /* Benjamin Orellana - 2026/04/10 - Usa la fecha actual como vencimiento operativo del archivo bancario. */
  const resolveFechaVencimientoBanco = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  /* Benjamin Orellana - 2026/04/10 - Usa el DNI del titular adherido como identificador del débito según la definición funcional del cliente. */
  const resolveIdentificadorDebitoBanco = (periodo) => {
    const cliente = resolveCliente(periodo);
    return String(cliente?.titular_dni || '').trim();
  };

  /* Benjamin Orellana - 2026/04/10 - Calcula el código de alta en base al mes de inicio real del cobro versus el período exportado. */
  const resolveCodigoAltaBanco = (periodo) => {
    const cliente = resolveCliente(periodo);
    const inicioCobro = parseSafeDate(cliente?.fecha_inicio_cobro);

    const periodoAnio = Number(periodo?.periodo_anio);
    const periodoMes = Number(periodo?.periodo_mes);

    if (!inicioCobro || !periodoAnio || !periodoMes) return '';

    const esAltaInicial =
      inicioCobro.getFullYear() === periodoAnio &&
      inicioCobro.getMonth() + 1 === periodoMes;

    return esAltaInicial ? 'E' : 'N';
  };

  const resolveTitularNombre = (periodo) => {
    const cliente = resolveCliente(periodo);
    return (
      periodo?.titular_nombre ||
      cliente?.titular_nombre ||
      cliente?.nombre ||
      '-'
    );
  };

  const resolveTitularDni = (periodo) => {
    const cliente = resolveCliente(periodo);
    return periodo?.titular_dni || cliente?.titular_dni || '-';
  };

  const resolvePlanNombre = (periodo) => {
    const cliente = resolveCliente(periodo);

    return (
      periodo?.plan_titular?.nombre ||
      cliente?.plan_titular?.nombre ||
      cliente?.titular_plan?.nombre ||
      periodo?.plan?.nombre ||
      planesById.get(
        String(
          cliente?.titular_plan_id ??
            periodo?.titular_plan_id ??
            periodo?.plan_id ??
            ''
        )
      )?.nombre ||
      (cliente?.modalidad_adhesion === 'SOLO_ADICIONAL'
        ? 'Solo adicional'
        : '-')
    );
  };

  const resolveBancoNombre = (periodo) => {
    const cliente = resolveCliente(periodo);

    return (
      periodo?.banco?.nombre ||
      cliente?.banco?.nombre ||
      bancosById.get(String(cliente?.banco_id ?? periodo?.banco_id ?? ''))
        ?.nombre ||
      '-'
    );
  };

  /* Benjamin Orellana - 2026/04/13 - Formatea la tarjeta completa si vino desde backend; en caso contrario mantiene la máscara. */
  const formatFullCardNumber = (value) => {
    const raw = String(value || '').replace(/\D/g, '');
    return raw ? raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim() : '';
  };

  /* Benjamin Orellana - 2026/04/13 - Prioriza la tarjeta completa del cliente si backend la habilitó; si no, usa máscara o últimos 4. */
  const resolveTarjeta = (periodo) => {
    const cliente = resolveCliente(periodo);
    const marca = periodo?.marca_tarjeta || cliente?.marca_tarjeta || '';

    const tarjetaCompleta =
      formatFullCardNumber(
        periodo?.tarjeta_numero_completo || cliente?.tarjeta_numero_completo
      ) || '';

    const mascara =
      periodo?.tarjeta_mascara ||
      cliente?.tarjeta_mascara ||
      (cliente?.tarjeta_ultimos4
        ? `**** **** **** ${cliente.tarjeta_ultimos4}`
        : '');

    const valorTarjeta = tarjetaCompleta || mascara;

    if (!marca && !valorTarjeta) return '-';
    if (!marca) return valorTarjeta;
    if (!valorTarjeta) return marca;

    return `${marca} · ${valorTarjeta}`;
  };

  const resolveAlta = (periodo) => {
    const cliente = resolveCliente(periodo);
    return (
      cliente?.solicitud?.created_at ||
      cliente?.solicitud_created_at ||
      cliente?.created_at ||
      null
    );
  };

  const resolveInicio = (periodo) => {
    const cliente = resolveCliente(periodo);
    return cliente?.fecha_inicio_cobro || null;
  };

  /* Benjamin Orellana - 2026/04/10 - Resuelve la fecha de baja del período desde el cliente relacionado o desde el objeto plano. */
  const resolveFechaBaja = (periodo) =>
    periodo?.fecha_baja || periodo?.cliente?.fecha_baja || null;

  const resolvePagos = (periodo) => {
    const cliente = resolveCliente(periodo);
    return (
      cliente?.pagos_cobrados ?? cliente?.pagos_count ?? cliente?.pagos ?? 0
    );
  };

  const resolveSedeId = (periodo) => {
    const cliente = resolveCliente(periodo);
    return cliente?.sede_id || cliente?.sede?.id || null;
  };

  const resolveMontoBruto = (periodo) => {
    const cliente = resolveCliente(periodo);
    return periodo?.monto_bruto ?? cliente?.monto_base_vigente ?? null;
  };

  const resolveMoneda = (periodo) => {
    const cliente = resolveCliente(periodo);
    return cliente?.moneda || 'ARS';
  };

  // Benjamin Orellana - 10/04/2026 - Resuelve el snapshot comercial inicial aplicado al período con fallback al cliente
  const resolveMontoInicialClienteAplicado = (periodo) => {
    const cliente = resolveCliente(periodo);
    return (
      periodo?.monto_inicial_cliente_aplicado ??
      cliente?.monto_inicial_vigente ??
      null
    );
  };

  // Benjamin Orellana - 10/04/2026 - Resuelve el descuento porcentual del cliente aplicado al período con fallback al cliente
  const resolveDescuentoClientePctAplicado = (periodo) => {
    const cliente = resolveCliente(periodo);
    return (
      periodo?.descuento_cliente_pct_aplicado ?? cliente?.descuento_vigente ?? 0
    );
  };

  // Benjamin Orellana - 10/04/2026 - Resuelve el neto estimado del período para poder mostrarlo o usarlo en búsquedas
  const resolveMontoNetoEstimado = (periodo) => {
    return periodo?.monto_neto_estimado ?? null;
  };

  const resolveMotivo = (periodo) => {
    const parts = [];
    if (periodo?.motivo_codigo) parts.push(periodo.motivo_codigo);
    if (periodo?.motivo_detalle) parts.push(periodo.motivo_detalle);
    return parts.join(' · ') || '-';
  };

  const resolveObservaciones = (periodo) => {
    return periodo?.observaciones || '-';
  };

  const getEstadoCobroVariant = (estado) => {
    const value = String(estado || '').toUpperCase();
    if (value === 'COBRADO') return 'success';
    if (value === 'RECHAZADO' || value === 'BAJA') return 'danger';
    if (value === 'PAGO_MANUAL') return 'orange';
    return 'warning';
  };

  const getEstadoEnvioVariant = (estado) => {
    const value = String(estado || '').toUpperCase();
    if (value === 'ENVIADO') return 'info';
    if (value === 'NO_ENVIADO') return 'neutral';
    return 'warning';
  };

  const getAccionVariant = (accion) => {
    const value = String(accion || '').toUpperCase();
    if (value === 'NINGUNA') return 'neutral';
    if (value === 'CAMBIO_TARJETA') return 'warning';
    if (value === 'COBRO_MANUAL') return 'orange';
    if (value === 'BAJA') return 'danger';
    if (value === 'REINTENTO') return 'info';
    return 'neutral';
  };

  const bancosOptions = useMemo(() => {
    return (Array.isArray(bancos) ? bancos : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [bancos]);

  const planesOptions = useMemo(() => {
    return (Array.isArray(planes) ? planes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [planes]);

  /* Benjamin Orellana - 2026/04/14 - La colección visible ya viene filtrada y ordenada desde backend. */
  const filteredAndSorted = useMemo(() => {
    return Array.isArray(periodos) ? periodos : [];
  }, [periodos]);

  const totalItems = totalRows;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = filteredAndSorted;

  const resumen = useMemo(() => {
    const total = filteredAndSorted.length;
    const cobrados = filteredAndSorted.filter(
      (item) => String(item?.estado_cobro) === 'COBRADO'
    ).length;
    const pendientes = filteredAndSorted.filter(
      (item) => String(item?.estado_cobro) === 'PENDIENTE'
    ).length;
    const incidencias = filteredAndSorted.filter((item) =>
      ['RECHAZADO', 'BAJA', 'PAGO_MANUAL'].includes(String(item?.estado_cobro))
    ).length;

    return { total, cobrados, pendientes, incidencias };
  }, [filteredAndSorted]);

  const refreshAfterPeriodoMutation = useCallback(() => {
    return Promise.allSettled([
      fetchPeriodos({ silent: true }),
      fetchCatalogos()
    ]);
  }, [fetchPeriodos, fetchCatalogos]);

  /* Benjamin Orellana - 01/04/2026 - Apertura del detalle de período consumiendo primero el OBR real */
  const handleOpenPeriodo = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenDetalle(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenDetalle(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se muestran los datos disponibles del listado.'
      );
    }
  };

  /* Benjamin Orellana - 01/04/2026 - Apertura del modal de aprobación cargando primero el detalle real del período */
  const handleOpenAprobar = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenAprobar(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenAprobar(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se abre la aprobación con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 01/04/2026 - Apertura del modal de baja cargando primero el detalle real del período */
  const handleOpenBaja = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenBaja(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenBaja(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se abre la baja con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 01/04/2026 - Apertura del modal de cambio de tarjeta cargando primero el detalle real del período */
  const handleOpenCambioTarjeta = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenCambioTarjeta(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenCambioTarjeta(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se abre la gestión de cambio de tarjeta con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 01/04/2026 - Apertura del modal de cobro manual cargando primero el detalle real del período */
  const handleOpenPagoManual = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenPagoManual(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenPagoManual(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se abre la gestión de cobro manual con los datos disponibles.'
      );
    }
  };

  /* Benjamin Orellana - 01/04/2026 - Apertura del modal de reintento cargando primero el detalle real del período */
  const handleOpenReintentar = async (periodo) => {
    const periodoId = getPeriodoId(periodo);
    if (!periodoId) return;

    try {
      setFeatureNotice('');
      const response = await api.get(
        `/debitos-automaticos-periodos/${periodoId}`,
        authRequestConfig
      );
      const detail = normalizeSingle(response.data) || periodo;
      setSelectedPeriodo(detail);
      setOpenReintentar(true);
    } catch (err) {
      setSelectedPeriodo(periodo);
      setOpenReintentar(true);
      setFeatureNotice(
        'No se pudo cargar el detalle completo del período, se abre el reintento con los datos disponibles.'
      );
    }
  };

  const handleOpenDeshacerCobro = async (periodo) => {
    const periodoId = getPeriodoId(periodo);

    if (!periodoId || deshacerCobroLoadingId === periodoId) return;

    const { value: formValues, isConfirmed } = await Swal.fire({
      title: 'Deshacer cobro',
      html: `
      <div style="text-align:left;display:flex;flex-direction:column;gap:12px">
        <textarea
          id="motivo_detalle"
          class="swal2-textarea"
          placeholder="Motivo de la reversa"
          style="margin:0;width:100%;min-height:120px;"
        ></textarea>

        <label style="display:flex;align-items:center;gap:8px;font-size:14px;">
          <input id="marcar_para_reintento" type="checkbox" checked />
          Dejar el período listo para reintento
        </label>
      </div>
    `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Deshacer cobro',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      focusConfirm: false,
      preConfirm: () => {
        const motivo_detalle =
          document.getElementById('motivo_detalle')?.value?.trim() || '';
        const marcar_para_reintento =
          document.getElementById('marcar_para_reintento')?.checked || false;

        if (!motivo_detalle) {
          Swal.showValidationMessage('Debés ingresar el motivo de la reversa.');
          return false;
        }

        return {
          motivo_detalle,
          marcar_para_reintento
        };
      }
    });

    if (!isConfirmed || !formValues) return;

    try {
      setDeshacerCobroLoadingId(periodoId);

      const response = await api.put(
        `/debitos-automaticos-periodos/${periodoId}/deshacer-cobro`,
        {
          ...formValues,
          updated_by: userId
        },
        authRequestConfig
      );

      const rowActualizada =
        normalizeSingle(response?.data) || response?.data?.row || null;

      /* Benjamin Orellana - 15/04/2026 - Se reemplaza localmente el período actualizado para evitar inconsistencias visuales antes del refetch. */
      if (rowActualizada) {
        setPeriodos((prev) =>
          (Array.isArray(prev) ? prev : []).map((item) =>
            getPeriodoId(item) === periodoId ? rowActualizada : item
          )
        );

        if (selectedPeriodo && getPeriodoId(selectedPeriodo) === periodoId) {
          setSelectedPeriodo(rowActualizada);
        }
      }

      await Swal.fire({
        icon: 'success',
        title: 'Cobro revertido',
        text: 'El período volvió a pendiente correctamente.',
        confirmButtonColor: '#f97316'
      });

      refreshAfterPeriodoMutation().catch((error) => {
        console.error(
          'Error al refrescar datos luego de actualizar un período:',
          error
        );
      });
    } catch (error) {
      console.error('Error al deshacer cobro:', error);

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo revertir',
        text:
          error?.response?.data?.mensajeError ||
          error?.message ||
          'Ocurrió un error al deshacer el cobro.',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setDeshacerCobroLoadingId(null);
    }
  };
  /* Benjamin Orellana - 2026/04/24 - Se separa el error real de generación del error de refresco posterior para no mostrar un Swal engañoso cuando el mes sí se generó pero falló la recarga de datos. */
  const handleGenerarMes = async () => {
    const { periodo_anio, periodo_mes } = parsePeriodInput(periodoSeleccionado);

    if (!periodo_anio || !periodo_mes) {
      Swal.fire({
        title: 'Período inválido',
        text: 'Debes seleccionar un mes válido.',
        icon: 'warning',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    const result = await Swal.fire({
      title: '¿Generar mes?',
      text: `Se intentará generar los períodos para ${formatMonthLabel(
        periodo_anio,
        periodo_mes
      )}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    let responseData = null;

    try {
      const { data } = await api.post(
        '/debitos-automaticos-periodos/generar-mes',
        {
          periodo_anio,
          periodo_mes
        },
        authRequestConfig
      );

      responseData = data;
    } catch (err) {
      Swal.fire({
        title: 'No se pudo generar',
        text:
          err?.response?.data?.mensajeError ||
          'Ocurrió un error al intentar generar el mes.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    try {
      await fetchData({ silent: true });
    } catch (err) {
      console.error(
        'El mes se generó, pero falló el refresco de la pantalla:',
        err
      );

      Swal.fire({
        title: 'Mes generado con observaciones',
        text: `El mes ${formatMonthLabel(
          periodo_anio,
          periodo_mes
        )} se generó, pero falló la recarga automática de la pantalla. Recargá manualmente.`,
        icon: 'warning',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    Swal.fire({
      title: 'Mes generado correctamente',
      html: `
    <div style="text-align:left; line-height:1.7;">
      <div><b>Período:</b> ${formatMonthLabel(periodo_anio, periodo_mes)}</div>
      <div><b>Nuevos períodos creados:</b> ${responseData?.resumen?.creados ?? 0}</div>
      <div><b>Ya existentes:</b> ${responseData?.resumen?.omitidos ?? 0}</div>
      <div><b>Errores:</b> ${responseData?.resumen?.errores ?? 0}</div>
      <div style="margin-top:10px; color:#64748b;">
        Los registros marcados como "Ya existentes" corresponden a clientes que ya tenían generado ese período.
      </div>
    </div>
  `,
      icon: 'success',
      confirmButtonColor: '#f97316'
    });
  };

  const clearFilters = () => {
    setFilters({
      q: '',
      banco_id: '',
      plan_id: '',
      estado_cobro: '',
      estado_envio: '',
      accion_requerida: '',
      cliente_id: clienteIdFromQuery
    });
    setSedeActiva('TODAS');
    setSortValue('titular_nombre|asc');
    setFeatureNotice('');
  };
  /* Benjamin Orellana - 2026/04/10 - Exporta un Excel bancario con formato visual similar a la plantilla solicitada y con todas las filas filtradas. */
  const handleExportExcel = async () => {
    if (!filteredAndSorted.length) {
      Swal.fire({
        title: 'Sin datos para exportar',
        text: 'No hay filas que coincidan con los filtros actuales.',
        icon: 'info',
        confirmButtonColor: '#f97316'
      });
      return;
    }

    // Benjamin Orellana - 2026/04/10 - Detecta filas con campos bancarios faltantes antes de exportar para evitar archivos silenciosamente incompletos.
    const filasConFaltantes = filteredAndSorted.filter((periodo) => {
      return (
        !resolveNumeroTarjetaBanco(periodo) ||
        !resolveFechaVencimientoBanco(periodo) ||
        !resolveIdentificadorDebitoBanco(periodo) ||
        !resolveCodigoAltaBanco(periodo)
      );
    });

    if (filasConFaltantes.length > 0) {
      Swal.fire({
        title: 'Hay campos bancarios incompletos',
        text: `Se detectaron ${filasConFaltantes.length} filas con tarjeta, vencimiento, identificador del débito o código de alta vacíos. El Excel se generará igualmente con esos campos incompletos.`,
        icon: 'warning',
        confirmButtonColor: '#f97316'
      });
    }

    try {
      const { periodo_anio, periodo_mes } =
        parsePeriodInput(periodoSeleccionado);

      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'HammerX';
      workbook.created = new Date();

      const worksheet = workbook.addWorksheet('Débitos', {
        views: [{ state: 'frozen', ySplit: 1 }]
      });

      worksheet.columns = [
        { header: 'NRO. DE TARJETA', key: 'nro_tarjeta', width: 22 },
        { header: 'NRO. DE COMPROBANTE', key: 'nro_comprobante', width: 24 },
        { header: 'FECHA VTO.', key: 'fecha_vto', width: 16 },
        { header: 'IMPORTE', key: 'importe', width: 16 },
        {
          header: 'IDENTIFICADOR DEL DÉBITO',
          key: 'identificador_debito',
          width: 28
        },
        { header: 'CÓDIGO DE ALTA', key: 'codigo_alta', width: 18 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.height = 24;

      headerRow.eachCell((cell) => {
        cell.font = {
          bold: true,
          color: { argb: 'FFFFFFFF' },
          size: 11
        };

        cell.alignment = {
          horizontal: 'center',
          vertical: 'middle'
        };

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D97706' }
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          bottom: { style: 'thin', color: { argb: 'FFFFFFFF' } },
          right: { style: 'thin', color: { argb: 'FFFFFFFF' } }
        };
      });

      worksheet.getCell('B1').note = {
        texts: [
          {
            font: { bold: true },
            text: 'Nro. de Comprobante\n'
          },
          {
            text:
              'ID de la factura que pagará el cliente.\n' +
              'Sirve para individualizar el pago, no necesariamente tiene que ser un nro. de factura.\n' +
              'Un mismo Nro. de Tarjeta puede tener varios ID de Factura si tiene varias facturas para pagar.\n' +
              'Máx. 8 caracteres.'
          }
        ]
      };

      filteredAndSorted.forEach((periodo, index) => {
        worksheet.addRow({
          nro_tarjeta: resolveNumeroTarjetaBanco(periodo),
          nro_comprobante: resolveNumeroComprobanteBanco(periodo, index),
          fecha_vto: resolveFechaVencimientoBanco(),
          importe: Number(periodo?.monto_bruto || 0),
          identificador_debito: resolveIdentificadorDebitoBanco(periodo),
          codigo_alta: resolveCodigoAltaBanco(periodo)
        });
      });

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
            right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
          };

          cell.alignment = {
            vertical: 'middle',
            horizontal: colNumber === 4 ? 'right' : 'left'
          };

          cell.font = {
            size: 10,
            color: { argb: 'FF111827' }
          };
        });
      });

      worksheet.getColumn('fecha_vto').numFmt = 'dd/mm/yyyy';
      worksheet.getColumn('importe').numFmt = '#,##0.00';

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const monthText = String(periodo_mes).padStart(2, '0');
      const fileName = `debitos_banco_${periodo_anio}_${monthText}.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: 'Excel generado',
        text: `Se exportaron ${filteredAndSorted.length} filas con formato bancario.`,
        icon: 'success',
        confirmButtonColor: '#f97316'
      });
    } catch (err) {
      Swal.fire({
        title: 'No se pudo exportar',
        text:
          err?.message ||
          'Ocurrió un error al generar el Excel con formato bancario.',
        icon: 'error',
        confirmButtonColor: '#f97316'
      });
    }
  };

  const currentRangeStart =
    totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const currentRangeEnd = Math.min(safePage * pageSize, totalItems);

  /* Benjamin Orellana - 15/04/2026 - Se separa la reversa de cobro de la acción de reintento para no mezclar semánticas de negocio. */
  const getPeriodoActionRules = (periodo) => {
    const estadoCobro = String(periodo?.estado_cobro || '').toUpperCase();
    const accion = String(periodo?.accion_requerida || '').toUpperCase();

    const isCobrado = estadoCobro === 'COBRADO';
    const isBaja = estadoCobro === 'BAJA';

    return {
      canView: true,
      canApprove: !isCobrado && !isBaja,
      canBaja: !isCobrado && !isBaja,
      canCambioTarjeta: !isCobrado && !isBaja && accion !== 'CAMBIO_TARJETA',
      canPagoManual: !isCobrado && !isBaja && accion !== 'COBRO_MANUAL',
      canReintentar:
        !isBaja &&
        (estadoCobro === 'RECHAZADO' ||
          accion === 'CAMBIO_TARJETA' ||
          accion === 'COBRO_MANUAL' ||
          accion === 'REINTENTO'),
      canDeshacerCobro: isCobrado
    };
  };
  /* Benjamin Orellana - 01/04/2026 - Estilo visual contextual por fila para que la operación mensual se lea más rápido */
  const getPeriodoRowClassName = (periodo) => {
    const estadoCobro = String(periodo?.estado_cobro || '').toUpperCase();
    const accion = String(periodo?.accion_requerida || '').toUpperCase();

    if (estadoCobro === 'COBRADO') {
      return 'bg-emerald-50/50 hover:bg-emerald-50';
    }

    if (estadoCobro === 'BAJA') {
      return 'bg-red-50/50 hover:bg-red-50';
    }

    if (estadoCobro === 'RECHAZADO') {
      return 'bg-rose-50/40 hover:bg-rose-50/60';
    }

    if (accion === 'CAMBIO_TARJETA') {
      return 'border-l-4 border-amber-400 bg-amber-50/30 hover:bg-amber-50/50';
    }

    if (accion === 'COBRO_MANUAL') {
      return 'border-l-4 border-orange-400 bg-orange-50/30 hover:bg-orange-50/50';
    }

    if (accion === 'REINTENTO') {
      return 'border-l-4 border-sky-400 bg-sky-50/30 hover:bg-sky-50/50';
    }

    return 'hover:bg-orange-50/70';
  };

  /* Benjamin Orellana - 06/04/2026 - Referencias y control de arrastre horizontal manual sobre la tabla de períodos */
  const tableScrollRef = useRef(null);
  const isTableMouseDownRef = useRef(false);
  const isTableDraggingRef = useRef(false);
  const tableStartXRef = useRef(0);
  const tableStartScrollLeftRef = useRef(0);
  const preventTableClickRef = useRef(false);

  /* Benjamin Orellana - 06/04/2026 - Inicia el gesto de arrastre horizontal tomando como base la posición actual del scroll */
  const handleTableMouseDown = (event) => {
    const container = tableScrollRef.current;
    if (!container) return;

    isTableMouseDownRef.current = true;
    isTableDraggingRef.current = false;
    preventTableClickRef.current = false;
    tableStartXRef.current = event.pageX - container.offsetLeft;
    tableStartScrollLeftRef.current = container.scrollLeft;
  };

  /* Benjamin Orellana - 06/04/2026 - Desplaza horizontalmente la tabla mientras el usuario arrastra con el mouse */
  const handleTableMouseMove = (event) => {
    const container = tableScrollRef.current;
    if (!container || !isTableMouseDownRef.current) return;

    const currentX = event.pageX - container.offsetLeft;
    const walk = currentX - tableStartXRef.current;

    if (Math.abs(walk) > 6) {
      isTableDraggingRef.current = true;
      preventTableClickRef.current = true;
    }

    if (isTableDraggingRef.current) {
      event.preventDefault();
      container.scrollLeft = tableStartScrollLeftRef.current - walk;
    }
  };

  /* Benjamin Orellana - 06/04/2026 - Finaliza el gesto de arrastre horizontal y libera el estado temporal del scroll manual */
  const handleTableMouseUpOrLeave = () => {
    isTableMouseDownRef.current = false;

    window.setTimeout(() => {
      isTableDraggingRef.current = false;
    }, 0);
  };

  /* Benjamin Orellana - 06/04/2026 - Evita clicks accidentales en botones o celdas cuando el usuario realmente estaba arrastrando la tabla */
  const handleTableClickCapture = (event) => {
    if (preventTableClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      preventTableClickRef.current = false;
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
        <div className="mx-auto max-w-[2200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            {/* Benjamin Orellana - 01/04/2026 - Encabezado principal de operación mensual */}
            <div className="rounded-[26px] border border-orange-100 bg-white px-5 py-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.25)] sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-orange-500">
                    Débitos Automáticos
                  </p>
                  <h1 className="mt-1 font-bignoodle text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                    Períodos mensuales
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                    Mesa operativa mensual para controlar envíos, cobros,
                    incidencias, reintentos y acciones requeridas por cliente.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerarMes}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_-18px_rgba(249,115,22,0.8)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-orange-600"
                  >
                    <CalendarDays className="h-4 w-4" />
                    Generar mes
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-[1px] hover:border-orange-500 hover:bg-orange-50"
                  >
                    <FileText className="h-4 w-4" />
                    Exportar Excel
                  </button>

                  <button
                    type="button"
                    onClick={() => setOpenCrear(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-600 transition-all duration-200 hover:-translate-y-[1px] hover:border-orange-500 hover:bg-orange-50"
                  >
                    <BadgeDollarSign className="h-4 w-4" />
                    Cargar débito manual
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

            {/* Selector de período + resumen */}
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="rounded-[24px] border border-orange-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)] xl:col-span-3">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Período operativo
                </label>
                <input
                  type="month"
                  value={periodoSeleccionado}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
                <p className="mt-2 text-xs text-slate-400">
                  {formatMonthLabel(
                    parsePeriodInput(periodoSeleccionado).periodo_anio,
                    parsePeriodInput(periodoSeleccionado).periodo_mes
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 xl:col-span-9 xl:grid-cols-4">
                <div className="rounded-[24px] border border-orange-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-900">
                    {resumen.total}
                  </p>
                </div>

                <div className="rounded-[24px] border border-emerald-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Cobrados
                  </p>
                  <p className="mt-2 text-2xl font-black text-emerald-600">
                    {resumen.cobrados}
                  </p>
                </div>

                <div className="rounded-[24px] border border-amber-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Pendientes
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-600">
                    {resumen.pendientes}
                  </p>
                </div>

                <div className="rounded-[24px] border border-red-100 bg-white p-4 shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Incidencias
                  </p>
                  <p className="mt-2 text-2xl font-black text-red-600">
                    {resumen.incidencias}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs por sede */}
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

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-7">
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
                      placeholder="Nombre, DNI, banco o tarjeta"
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
                    Estado cobro
                  </label>
                  <select
                    value={filters.estado_cobro}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        estado_cobro: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="COBRADO">Cobrado</option>
                    <option value="RECHAZADO">Rechazado</option>
                    <option value="PAGO_MANUAL">Pago manual</option>
                    <option value="BAJA">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Estado envío
                  </label>
                  <select
                    value={filters.estado_envio}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        estado_envio: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todos</option>
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="NO_ENVIADO">No enviado</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Acción requerida
                  </label>
                  <select
                    value={filters.accion_requerida}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        accion_requerida: e.target.value
                      }))
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                  >
                    <option value="">Todas</option>
                    <option value="NINGUNA">Ninguna</option>
                    <option value="CAMBIO_TARJETA">Cambio tarjeta</option>
                    <option value="COBRO_MANUAL">Cobro manual</option>
                    <option value="BAJA">Baja</option>
                    <option value="REINTENTO">Reintento</option>
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

              {filters.cliente_id && (
                <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                  Vista filtrada por cliente desde el padrón adherido.
                </div>
              )}
            </div>

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
                      ? 'Sin resultados para el período y filtros actuales.'
                      : `Mostrando ${currentRangeStart}-${currentRangeEnd} de ${totalItems} registros`}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-[0_16px_45px_-30px_rgba(15,23,42,0.2)]">
                <table className="w-full table-fixed border-collapse">
                  <thead className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
                    <tr className="text-left">
                      <th className="w-[18%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Cliente
                      </th>
                      <th className="w-[14%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Plan
                      </th>
                      <th className="w-[15%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Comercial
                      </th>
                      <th className="w-[15%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Banco / Tarjeta
                      </th>
                      <th className="w-[12%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Ciclo
                      </th>
                      <th className="w-[10%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Estado
                      </th>
                      <th className="w-[8%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-center">
                        Pagos
                      </th>
                      <th className="w-[12%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em]">
                        Seguimiento
                      </th>
                      <th className="w-[16%] px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-center">
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
                          {Array.from({ length: 9 }).map((__, cellIndex) => (
                            <td key={cellIndex} className="px-4 py-4">
                              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center">
                          <div className="mx-auto max-w-xl">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500">
                              <Search className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900">
                              No encontramos períodos para esta búsqueda
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                              Probá cambiando el mes, limpiando filtros o
                              generando el padrón del período seleccionado.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((periodo) => {
                        const rules = getPeriodoActionRules(periodo);

                        return (
                          <tr
                            key={getPeriodoId(periodo)}
                            className={`group border-b border-slate-100 align-top transition-colors duration-200 ${getPeriodoRowClassName(
                              periodo
                            )}`}
                          >
                            <td className="px-4 py-4 align-top">
                              <div className="space-y-1.5">
                                <div className="flex items-start gap-2">
                                  <p className="text-sm font-black leading-5 text-slate-900 break-words">
                                    {resolveTitularNombre(periodo)}
                                  </p>
                                  {shouldShowNuevoBadgePeriodo(periodo) && (
                                    <NuevoBadge />
                                  )}
                                </div>

                                <p className="text-xs font-medium text-slate-600">
                                  DNI {resolveTitularDni(periodo)}
                                </p>

                                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">
                                  {formatMonthLabel(
                                    Number(periodo?.periodo_anio),
                                    Number(periodo?.periodo_mes)
                                  )}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="flex items-start gap-2">
                                <BadgeDollarSign className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                <p className="text-sm font-semibold leading-5 text-slate-700 break-words">
                                  {resolvePlanNombre(periodo)}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Inicial
                                  </span>
                                  <span className="text-sm font-bold text-slate-800 text-right">
                                    {formatCurrency(
                                      resolveMontoInicialClienteAplicado(
                                        periodo
                                      ),
                                      resolveMoneda(periodo)
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Desc.
                                  </span>
                                  <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                                    {formatPercent(
                                      resolveDescuentoClientePctAplicado(
                                        periodo
                                      )
                                    )}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
                                  <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Final
                                  </span>
                                  <span className="text-sm font-black text-slate-900 text-right">
                                    {formatCurrency(
                                      resolveMontoBruto(periodo),
                                      resolveMoneda(periodo)
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                  <p className="text-sm font-semibold leading-5 text-slate-800 break-words">
                                    {resolveBancoNombre(periodo)}
                                  </p>
                                </div>

                                <p className="text-xs leading-5 text-slate-500 break-words">
                                  {resolveTarjeta(periodo)}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="space-y-2.5">
                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Alta
                                  </p>
                                  <p className="mt-0.5 text-sm font-medium text-slate-700">
                                    {formatDate(resolveAlta(periodo))}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Inicio
                                  </p>
                                  <p className="mt-0.5 text-sm font-medium text-slate-700">
                                    {formatDate(resolveInicio(periodo))}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                    Baja
                                  </p>
                                  <p className="mt-0.5 text-sm font-medium text-slate-700">
                                    {formatDate(resolveFechaBaja(periodo))}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-col gap-2">
                                <Badge
                                  variant={getEstadoCobroVariant(
                                    periodo?.estado_cobro
                                  )}
                                >
                                  {String(
                                    periodo?.estado_cobro || '-'
                                  ).replaceAll('_', ' ')}
                                </Badge>

                                <Badge
                                  variant={getAccionVariant(
                                    periodo?.accion_requerida
                                  )}
                                >
                                  {String(
                                    periodo?.accion_requerida || '-'
                                  ).replaceAll('_', ' ')}
                                </Badge>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top text-center">
                              <div className="mx-auto inline-flex h-11 min-w-[44px] items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 px-3 text-sm font-black text-orange-700">
                                {resolvePagos(periodo)}
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="space-y-2">
                                <p
                                  className="text-xs font-semibold leading-5 text-slate-700 break-words"
                                  title={resolveMotivo(periodo)}
                                >
                                  {resolveMotivo(periodo)}
                                </p>

                                <p
                                  className="text-xs leading-5 text-slate-500 break-words"
                                  title={resolveObservaciones(periodo)}
                                >
                                  {resolveObservaciones(periodo)}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="grid grid-cols-3 place-items-center gap-2">
                                <ActionButton
                                  icon={Eye}
                                  title="Ver"
                                  onClick={() => handleOpenPeriodo(periodo)}
                                  disabled={!rules.canView}
                                />

                                <ActionButton
                                  icon={CheckCircle2}
                                  title="Aprobar"
                                  variant="success"
                                  onClick={() => handleOpenAprobar(periodo)}
                                  disabled={!rules.canApprove}
                                />

                                <ActionButton
                                  icon={Ban}
                                  title="Marcar baja"
                                  variant="danger"
                                  onClick={() => handleOpenBaja(periodo)}
                                  disabled={!rules.canBaja}
                                />

                                <ActionButton
                                  icon={CreditCard}
                                  title="Cambio de tarjeta"
                                  variant="warning"
                                  onClick={() =>
                                    handleOpenCambioTarjeta(periodo)
                                  }
                                  disabled={!rules.canCambioTarjeta}
                                />

                                <ActionButton
                                  icon={BadgeDollarSign}
                                  title="Pago manual"
                                  variant="orange"
                                  onClick={() => handleOpenPagoManual(periodo)}
                                  disabled={!rules.canPagoManual}
                                />

                                <ActionButton
                                  icon={RotateCcw}
                                  title={
                                    rules.canDeshacerCobro
                                      ? 'Deshacer cobro'
                                      : 'Reintentar'
                                  }
                                  variant="info"
                                  onClick={() =>
                                    rules.canDeshacerCobro
                                      ? handleOpenDeshacerCobro(periodo)
                                      : handleOpenReintentar(periodo)
                                  }
                                  disabled={
                                    (!rules.canDeshacerCobro &&
                                      !rules.canReintentar) ||
                                    deshacerCobroLoadingId ===
                                      getPeriodoId(periodo)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
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
      <ModalPeriodoDetalle
        open={openDetalle}
        onClose={() => {
          setOpenDetalle(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onGoToCliente={(periodo) => {
          const clienteId = getClienteIdFromPeriodo(periodo);
          navigate(
            `/dashboard/debitos-automaticos/clientes${
              clienteId ? `?cliente_id=${clienteId}` : ''
            }`
          );
        }}
      />
      <ModalPeriodoAprobar
        open={openAprobar}
        onClose={() => {
          setOpenAprobar(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onSaved={(updatedRow) => {
          setSelectedPeriodo(updatedRow);
          setPeriodos((prev) =>
            prev.map((item) =>
              String(getPeriodoId(item)) === String(getPeriodoId(updatedRow))
                ? {
                    ...item,
                    ...updatedRow,
                    estado_cobro: 'COBRADO',
                    accion_requerida: 'NINGUNA'
                  }
                : item
            )
          );
          setOpenAprobar(false);
          fetchData({ silent: true });
        }}
      />
      <ModalPeriodoBaja
        open={openBaja}
        onClose={() => {
          setOpenBaja(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onSaved={(updatedRow) => {
          setSelectedPeriodo(updatedRow);
          setPeriodos((prev) =>
            prev.map((item) =>
              String(getPeriodoId(item)) === String(getPeriodoId(updatedRow))
                ? {
                    ...item,
                    ...updatedRow,
                    estado_cobro: 'BAJA',
                    accion_requerida: 'BAJA'
                  }
                : item
            )
          );
          setOpenBaja(false);
          fetchData({ silent: true });
        }}
      />
      <ModalPeriodoCambioTarjeta
        open={openCambioTarjeta}
        onClose={() => {
          setOpenCambioTarjeta(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onSaved={(updatedRow) => {
          setSelectedPeriodo(updatedRow);
          setPeriodos((prev) =>
            prev.map((item) =>
              String(getPeriodoId(item)) === String(getPeriodoId(updatedRow))
                ? {
                    ...item,
                    ...updatedRow,
                    estado_cobro: 'PENDIENTE',
                    accion_requerida: 'CAMBIO_TARJETA'
                  }
                : item
            )
          );
          setOpenCambioTarjeta(false);
          fetchData({ silent: true });
        }}
      />
      <ModalPeriodoPagoManual
        open={openPagoManual}
        onClose={() => {
          setOpenPagoManual(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onSaved={(updatedRow) => {
          setSelectedPeriodo(updatedRow);
          setPeriodos((prev) =>
            prev.map((item) =>
              String(getPeriodoId(item)) === String(getPeriodoId(updatedRow))
                ? {
                    ...item,
                    ...updatedRow,
                    estado_cobro: 'PENDIENTE',
                    accion_requerida: 'COBRO_MANUAL'
                  }
                : item
            )
          );
          setOpenPagoManual(false);
          fetchData({ silent: true });
        }}
      />
      <ModalPeriodoReintentar
        open={openReintentar}
        onClose={() => {
          setOpenReintentar(false);
          setSelectedPeriodo(null);
        }}
        periodo={selectedPeriodo}
        onSaved={(updatedRow) => {
          setSelectedPeriodo(updatedRow);
          setPeriodos((prev) =>
            prev.map((item) =>
              String(getPeriodoId(item)) === String(getPeriodoId(updatedRow))
                ? {
                    ...item,
                    ...updatedRow,
                    estado_cobro: 'PENDIENTE',
                    accion_requerida: 'REINTENTO'
                  }
                : item
            )
          );
          setOpenReintentar(false);
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
          }

          fetchData({ silent: true });

          Swal.fire({
            title: 'Débito cargado',
            text: 'El cliente fue dado de alta correctamente desde Períodos.',
            icon: 'success',
            confirmButtonColor: '#f97316'
          });
        }}
      />
    </>
  );
};;;

export default PeriodosDebitosPage;
