import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  CreditCard,
  Eye,
  Filter,
  Landmark,
  Loader2,
  MessageSquareText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  XCircle,
  CornerDownRight,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

import NavbarStaff from '../../../pages/staff/NavbarStaff';
import Footer from '../../../components/footer/Footer';
import SolicitudDetailModal from '../../../components/Forms/DebitosAutomaticos/Modals/SolicitudDetailModal';
import SolicitudFormModal from '../../../components/Forms/DebitosAutomaticos/SolicitudFormModal';
import SolicitudObservarModal from '../../../components/Forms/DebitosAutomaticos/Modals/SolicitudObservarModal';
import SolicitudAprobarModal from '../../../components/Forms/DebitosAutomaticos/Modals/SolicitudAprobarModal';
import SolicitudRechazarModal from '../../../components/Forms/DebitosAutomaticos/Modals/SolicitudRechazarModal';
import SolicitudCancelarModal from '../../../components/Forms/DebitosAutomaticos/Modals/SolicitudCancelarModal';

// Benjamin Orellana - 23/03/2026 - Hook de autenticación para detectar nivel admin en la vista de solicitudes
import { useAuth } from '../../../AuthContext';

import '../../../styles/staff/dashboard.css';
import '../../../styles/staff/background.css';

const API_URL = 'http://localhost:8080';

const LIST_ENDPOINT = `${API_URL}/debitos-automaticos-solicitudes`;
const PENDING_ENDPOINT = `${API_URL}/debitos-automaticos-solicitudes/pendientes`;

const PAGE_SIZE = 30;

const ESTADOS = [
  'PENDIENTE',
  'APROBADA',
  'RECHAZADA',
  'OBSERVADA',
  'CANCELADA'
];

const CANALES = ['PUBLICO', 'INTERNO'];

const MODALIDADES = ['TITULAR_SOLO', 'AMBOS', 'SOLO_ADICIONAL'];

const prettyText = (value) => {
  if (!value) return '—';
  return String(value).replaceAll('_', ' ');
};

const formatDate = (value) => {
  if (!value) return '—';

  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
};

// Benjamin Orellana - 23/03/2026 - Se agrega soporte de búsqueda local por tarjeta enmascarada o completa sin alterar filtros existentes
const buildSearchText = (item) => {
  return [
    item?.id,
    item?.titular_nombre,
    item?.titular_dni,
    item?.titular_email,
    item?.sede?.nombre,
    item?.banco?.nombre,
    item?.marca_tarjeta,
    item?.modalidad_adhesion,
    item?.plan_titular?.nombre,
    item?.estado,
    item?.canal_origen,
    item?.rol_carga_origen,
    item?.tarjeta_ultimos4,
    item?.tarjeta_mascara,
    item?.tarjeta_numero_completo,
    item?.beneficio_descripcion_snapshot
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
};

const shouldIgnoreDrag = (target) =>
  target?.closest?.(
    'button, a, input, select, textarea, [data-no-drag="true"]'
  );

function useDebouncedValue(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function ActionIconButton({
  icon: Icon,
  title,
  onClick,
  variant = 'default',
  disabled = false
}) {
  const variants = {
    default:
      'border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600',
    primary:
      'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    danger:
      'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100'
  };

  return (
    <button
      type="button"
      title={title}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        'inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition-all duration-200',
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-60'
          : variants[variant] || variants.default
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {prettyText(item)}
          </option>
        ))}
      </select>

      <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
/* Benjamin Orellana - 07/04/2026 - Select reutilizable para filtros cuyos options vienen como objetos id/nombre */
function FilterSelectObject({
  value,
  onChange,
  placeholder,
  options,
  valueKey = 'id',
  labelKey = 'nombre'
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
      >
        <option value="">{placeholder}</option>

        {(Array.isArray(options) ? options : []).map((item) => (
          <option key={item?.[valueKey]} value={item?.[valueKey]}>
            {item?.[labelKey] || `#${item?.[valueKey]}`}
          </option>
        ))}
      </select>

      <Filter className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
function EmptyState({ onReload }) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
        <CreditCard className="h-8 w-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-900">
        No hay solicitudes para mostrar
      </h3>

      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Probá ajustar los filtros, cambiar la vista rápida o volver a actualizar
        el listado.
      </p>

      <button
        type="button"
        onClick={onReload}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
      >
        <RefreshCw className="h-4 w-4" />
        Actualizar
      </button>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-slate-500">
        Página{' '}
        <span className="font-semibold text-slate-700">{currentPage}</span> de{' '}
        <span className="font-semibold text-slate-700">{totalPages}</span>
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </button>

        {start > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onChange(1)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              1
            </button>
            {start > 2 ? <span className="px-1 text-slate-400">…</span> : null}
          </>
        ) : null}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onChange(page)}
            className={[
              'rounded-xl border px-3 py-2 text-sm font-semibold transition',
              currentPage === page
                ? 'border-orange-500 bg-orange-500 text-white shadow-[0_10px_25px_rgba(249,115,22,0.22)]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700'
            ].join(' ')}
          >
            {page}
          </button>
        ))}

        {end < totalPages ? (
          <>
            {end < totalPages - 1 ? (
              <span className="px-1 text-slate-400">…</span>
            ) : null}
            <button
              type="button"
              onClick={() => onChange(totalPages)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
            >
              {totalPages}
            </button>
          </>
        ) : null}

        <button
          type="button"
          onClick={() => onChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

// Benjamin Orellana - 23/03/2026 - Formatea la tarjeta priorizando el número completo si vino desde backend; en caso contrario usa máscara o últimos 4
const formatCardDisplay = (item) => {
  const raw = String(item?.tarjeta_numero_completo || '').replace(/\D/g, '');

  if (raw) {
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  if (item?.tarjeta_mascara) return item.tarjeta_mascara;
  if (item?.tarjeta_ultimos4) return `**** **** **** ${item.tarjeta_ultimos4}`;

  return '—';
};

// Benjamin Orellana - 23/03/2026 - Determina si la fila dispone del número completo enviado por backend
const hasFullCardNumber = (item) => {
  return Boolean(item?.tarjeta_numero_completo);
};

export default function SolicitudesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState('');
  const [quickView, setQuickView] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  /* Benjamin Orellana - 07/04/2026 - Catálogo de sedes para poblar el filtro visual por sede en la grilla de solicitudes */
  const [sedesOptions, setSedesOptions] = useState([]);

  const [filters, setFilters] = useState({
    q: '',
    estado: '',
    canal_origen: '',
    modalidad_adhesion: '',
    /* Benjamin Orellana - 07/04/2026 - Se agrega filtro local por sede para solicitudes de débitos automáticos */
    sede_id: ''
  });

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit'
  const [editingSolicitud, setEditingSolicitud] = useState(null);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [observarOpen, setObservarOpen] = useState(false);
  const [observingSolicitud, setObservingSolicitud] = useState(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedSolicitudToApprove, setSelectedSolicitudToApprove] =
    useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSolicitudToReject, setSelectedSolicitudToReject] =
    useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSolicitudToCancel, setSelectedSolicitudToCancel] =
    useState(null);

  const handleOpenApprove = (item) => {
    setSelectedSolicitudToApprove(item);
    setApproveModalOpen(true);
  };

  const handleCloseApprove = () => {
    setApproveModalOpen(false);
    setSelectedSolicitudToApprove(null);
  };
  const handleOpenReject = (item) => {
    setSelectedSolicitudToReject(item);
    setRejectModalOpen(true);
  };

  const handleCloseReject = () => {
    setRejectModalOpen(false);
    setSelectedSolicitudToReject(null);
  };

  const handleOpenCancel = (item) => {
    setSelectedSolicitudToCancel(item);
    setCancelModalOpen(true);
  };

  const handleCloseCancel = () => {
    setCancelModalOpen(false);
    setSelectedSolicitudToCancel(null);
  };

  // Benjamin Orellana - 2026/04/13 - Se obtiene identidad autenticada para enviar al backend el contexto necesario de tarjeta completa.
  const { userId, userName } = useAuth();

  const authUserId = userId;

  // Benjamin Orellana - 2026/04/13 - En este proyecto userName contiene el correo autenticado del usuario.
  const authUserEmail = useMemo(() => {
    return String(userName || '')
      .trim()
      .toLowerCase();
  }, [userName]);

  // Benjamin Orellana - 2026/04/13 - Headers reutilizables para que backend resuelva si el usuario puede ver tarjeta desencriptada.
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
  /* Benjamin Orellana - 23/03/2026 - Estado expandible para mostrar subtabla de adicionales por solicitud */
  const [expandedAdicionales, setExpandedAdicionales] = useState({});

  /* Benjamin Orellana - 23/03/2026 - Normaliza adicional/adicionales para soportar objeto único o array */
  const getSolicitudAdicionales = (solicitud) => {
    const source = solicitud?.adicionales ?? solicitud?.adicional ?? [];

    if (Array.isArray(source)) {
      return source.filter(Boolean);
    }

    return source ? [source] : [];
  };

  /* Benjamin Orellana - 23/03/2026 - Expande/contrae la subtabla de adicionales */
  const toggleAdicionalesRow = (solicitudId) => {
    setExpandedAdicionales((prev) => ({
      ...prev,
      [solicitudId]: !prev[solicitudId]
    }));
  };

  const debouncedQ = useDebouncedValue(filters.q, 260);

  const dragScroll = useMemo(
    () => ({
      isDown: false,
      startX: 0,
      startScrollLeft: 0
    }),
    []
  );

  const EDITABLE_STATES = ['PENDIENTE', 'OBSERVADA'];
  const ACTIONABLE_STATES = ['PENDIENTE', 'OBSERVADA'];

  const canEditSolicitud = (estado) =>
    EDITABLE_STATES.includes(String(estado || '').toUpperCase());

  const canApproveSolicitud = (estado) =>
    ACTIONABLE_STATES.includes(String(estado || '').toUpperCase());

  const canRejectSolicitud = (estado) =>
    ACTIONABLE_STATES.includes(String(estado || '').toUpperCase());

  const canObserveSolicitud = (estado) =>
    ACTIONABLE_STATES.includes(String(estado || '').toUpperCase());

  const canCancelSolicitud = (estado) =>
    ACTIONABLE_STATES.includes(String(estado || '').toUpperCase());

  const openObservarModal = (solicitud) => {
    if (!solicitud?.id) return;

    setObservingSolicitud(solicitud);
    setObservarOpen(true);
  };

  const closeObservarModal = () => {
    setObservarOpen(false);
    setObservingSolicitud(null);
  };

  const handleObserveSuccess = (registroActualizado) => {
    if (registroActualizado?.id) {
      setRows((prev) =>
        prev.map((row) =>
          row.id === registroActualizado.id
            ? { ...row, ...registroActualizado }
            : row
        )
      );
    } else {
      fetchSolicitudes({ silent: true });
    }

    setToastMessage('Solicitud observada correctamente');
  };

  const handlePendingAction = (action, solicitud = null) => {
    if (!solicitud?.id) return;

    switch (action) {
      case 'Aprobar':
        handleOpenApprove(solicitud);
        break;

      case 'Rechazar':
        handleOpenReject(solicitud);
        break;

      case 'Observar':
        openObservarModal(solicitud);
        break;

      case 'Cancelar':
        handleOpenCancel(solicitud);
        break;

      default:
        break;
    }
  };

  /* Benjamin Orellana - 07/04/2026 - Referencia para evitar requests superpuestas durante el polling */
  const isFetchingRef = useRef(false);

  /* Benjamin Orellana - 07/04/2026 - Memoización de la función de carga según la vista actual */
  const fetchSolicitudes = useCallback(
    async ({ silent = false } = {}) => {
      if (isFetchingRef.current) return;

      isFetchingRef.current = true;

      try {
        if (silent) {
          setLoadingRefresh(true);
        } else {
          setLoading(true);
        }

        setError('');

        const endpoint =
          quickView === 'PENDIENTES' ? PENDING_ENDPOINT : LIST_ENDPOINT;

        // Benjamin Orellana - 2026/04/13 - El listado envía el contexto del usuario autenticado para que backend decida si devuelve tarjeta completa.
        const response = await axios.get(endpoint, authRequestConfig);
        const data = Array.isArray(response.data) ? response.data : [];

        setRows(
          data.map((item) => ({
            ...item,
            cargado_por_nombre:
              item?.cargado_por_nombre ||
              item?.usuario_carga?.name ||
              'Alta formulario página web'
          }))
        );
      } catch (err) {
        setRows([]);
        setError(
          err?.response?.data?.mensajeError ||
            err?.message ||
            'No se pudo obtener el listado de solicitudes.'
        );
      } finally {
        setLoading(false);
        setLoadingRefresh(false);
        isFetchingRef.current = false;
      }
    },
    [quickView, authRequestConfig]
  );

  /* Benjamin Orellana - 07/04/2026 - Polling automático cada 1 segundo con limpieza al desmontar */
  useEffect(() => {
    fetchSolicitudes();

    const intervalId = setInterval(() => {
      fetchSolicitudes({ silent: true });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [fetchSolicitudes]);

  /* Benjamin Orellana - 07/04/2026 - Se cargan sedes operativas para el filtro de solicitudes por sede */
  useEffect(() => {
    let active = true;

    const fetchSedes = async () => {
      try {
        const response = await axios.get(`${API_URL}/sedes/ciudad`);
        const data = Array.isArray(response.data) ? response.data : [];

        if (!active) return;

        setSedesOptions(
          data.filter(
            (item) =>
              String(item?.nombre || '').trim() &&
              String(item?.nombre || '')
                .toLowerCase()
                .trim() !== 'multisede'
          )
        );
      } catch (err) {
        if (!active) return;
        setSedesOptions([]);
      }
    };

    fetchSedes();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toastMessage) return;

    const timer = setTimeout(() => setToastMessage(''), 2600);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const filteredRows = useMemo(() => {
    let data = Array.isArray(rows) ? [...rows] : [];

    if (quickView === 'ALL' && filters.estado) {
      data = data.filter((item) => item.estado === filters.estado);
    }

    if (filters.canal_origen) {
      data = data.filter((item) => item.canal_origen === filters.canal_origen);
    }

    if (filters.modalidad_adhesion) {
      data = data.filter(
        (item) => item.modalidad_adhesion === filters.modalidad_adhesion
      );
    }

    /* Benjamin Orellana - 07/04/2026 - Se agrega filtro local por sede_id usando la relación sede ya incluida en las solicitudes */
    if (filters.sede_id) {
      data = data.filter(
        (item) =>
          String(item?.sede_id || item?.sede?.id || '') ===
          String(filters.sede_id)
      );
    }

    if (debouncedQ?.trim()) {
      const search = debouncedQ.trim().toLowerCase();
      data = data.filter((item) => buildSearchText(item).includes(search));
    }

    return data;
  }, [
    rows,
    quickView,
    filters.estado,
    filters.canal_origen,
    filters.modalidad_adhesion,
    filters.sede_id,
    debouncedQ
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    quickView,
    debouncedQ,
    filters.estado,
    filters.canal_origen,
    filters.modalidad_adhesion,
    filters.sede_id
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      q: '',
      estado: '',
      canal_origen: '',
      modalidad_adhesion: '',
      /* Benjamin Orellana - 07/04/2026 - Se limpia también el filtro por sede */
      sede_id: ''
    });
    setQuickView('ALL');
  };

  const handleOpenDetail = (id) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleTableMouseDown = (event) => {
    if (shouldIgnoreDrag(event.target)) return;

    const el = event.currentTarget;
    dragScroll.isDown = true;
    dragScroll.startX = event.pageX - el.offsetLeft;
    dragScroll.startScrollLeft = el.scrollLeft;
    el.classList.add('cursor-grabbing');
  };

  const handleTableMouseMove = (event) => {
    if (!dragScroll.isDown) return;

    const el = event.currentTarget;
    const x = event.pageX - el.offsetLeft;
    const walk = (x - dragScroll.startX) * 1.15;
    el.scrollLeft = dragScroll.startScrollLeft - walk;
  };

  const handleTableMouseUp = (event) => {
    dragScroll.isDown = false;
    event.currentTarget.classList.remove('cursor-grabbing');
  };

  const handleTableMouseLeave = (event) => {
    dragScroll.isDown = false;
    event.currentTarget.classList.remove('cursor-grabbing');
  };

  const handleTableTouchStart = (event) => {
    if (shouldIgnoreDrag(event.target)) return;

    const el = event.currentTarget;
    dragScroll.isDown = true;
    dragScroll.startX = event.touches[0].clientX;
    dragScroll.startScrollLeft = el.scrollLeft;
  };

  const handleTableTouchMove = (event) => {
    if (!dragScroll.isDown) return;

    const el = event.currentTarget;
    const x = event.touches[0].clientX;
    const walk = (x - dragScroll.startX) * 1.1;
    el.scrollLeft = dragScroll.startScrollLeft - walk;
  };

  const handleTableTouchEnd = () => {
    dragScroll.isDown = false;
  };

  const rangeStart =
    filteredRows.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredRows.length);

  const handleCreateSolicitud = async (payload) => {
    const response = await axios.post(
      `${API_URL}/debitos-automaticos-solicitudes`,
      payload
    );

    await fetchSolicitudes({ silent: true });
    setCurrentPage(1);

    setToastMessage(
      response?.data?.message || 'Solicitud creada correctamente.'
    );

    const createdId = response?.data?.registro?.id;
    if (createdId) {
      setDetailId(createdId);
      setDetailOpen(true);
    }

    return response.data;
  };

  const resolveSolicitudDetalle = (response) => {
    return (
      response?.data?.registro ||
      response?.data?.detalle ||
      response?.data?.data ||
      response?.data ||
      null
    );
  };

  const handleOpenEdit = async (id) => {
    try {
      setLoadingEdit(true);

      // Benjamin Orellana - 2026/04/13 - La carga del detalle para edición también envía el contexto autenticado de tarjeta.
     const response = await axios.get(
       `${API_URL}/debitos-automaticos-solicitudes/${id}`,
       authRequestConfig
     );

      const detalle = resolveSolicitudDetalle(response);

      if (!detalle) {
        throw new Error('No se pudo obtener el detalle de la solicitud.');
      }

      if (!canEditSolicitud(detalle.estado)) {
        await Swal.fire({
          icon: 'warning',
          title: 'Edición no permitida',
          text: 'Solo se pueden editar solicitudes en estado PENDIENTE u OBSERVADA.',
          confirmButtonColor: '#f97316'
        });
        return;
      }

      setEditingSolicitud(detalle);
      setFormMode('edit');
      setFormOpen(true);
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo abrir la edición',
        text:
          error?.response?.data?.mensajeError ||
          error?.message ||
          'Ocurrió un error al cargar la solicitud.',
        confirmButtonColor: '#f97316'
      });
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleUpdateSolicitud = async (payload) => {
    if (!editingSolicitud?.id) {
      throw new Error('No hay solicitud seleccionada para editar.');
    }

    const response = await axios.put(
      `${API_URL}/debitos-automaticos-solicitudes/${editingSolicitud.id}`,
      payload
    );

    await fetchSolicitudes({ silent: true });

    setToastMessage(
      response?.data?.message || 'Solicitud actualizada correctamente.'
    );

    const updatedId =
      response?.data?.registroActualizado?.id || editingSolicitud.id;

    if (updatedId) {
      setDetailId(updatedId);
      setDetailOpen(true);
    }

    return response.data;
  };

  /* Benjamin Orellana - 07/04/2026 - Normalización robusta de modalidad de adhesión para remarcar solicitudes solo adicional */
  const normalizeModalidadAdhesion = (value) =>
    String(value || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

  return (
    <>
      <NavbarStaff />

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-900">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="mx-auto w-full max-w-[1880px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
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
                  className="font-bignoodle text-3xl uppercase tracking-[0.18em] text-white sm:text-4xl"
                >
                  Solicitudes
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="mt-2 max-w-2xl text-sm text-slate-200/85"
                >
                  Gestión administrativa de solicitudes de adhesión del módulo
                  de débitos automáticos.
                </motion.p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setFormOpen(true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Nueva solicitud
                </button>

                <button
                  type="button"
                  onClick={() => fetchSolicitudes({ silent: true })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            {/* KPI */}
            {/* <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Total solicitudes',
                  value: stats.total,
                  icon: CreditCard,
                  tone: 'from-orange-500/20 to-orange-500/5 border-orange-300/30 text-orange-100'
                },
                {
                  label: 'Pendientes',
                  value: stats.pendientes,
                  icon: Loader2,
                  tone: 'from-amber-500/20 to-amber-500/5 border-amber-300/30 text-amber-100'
                },
                {
                  label: 'Canal público',
                  value: stats.publicas,
                  icon: Landmark,
                  tone: 'from-cyan-500/20 to-cyan-500/5 border-cyan-300/30 text-cyan-100'
                },
                {
                  label: 'Con adicional',
                  value: stats.conAdicional,
                  icon: UserRound,
                  tone: 'from-violet-500/20 to-violet-500/5 border-violet-300/30 text-violet-100'
                }
              ].map((item, index) => (
                <StatCard key={item.label} item={item} index={index} />
              ))}
            </div> */}

            {/* Filters */}
            <div className="mb-6 rounded-[30px] border border-white/70 bg-white/92 p-4 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.16)] backdrop-blur-xl sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuickView('ALL')}
                    className={[
                      'rounded-2xl border px-4 py-2.5 text-sm font-semibold transition',
                      quickView === 'ALL'
                        ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700'
                    ].join(' ')}
                  >
                    Todas
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuickView('PENDIENTES')}
                    className={[
                      'rounded-2xl border px-4 py-2.5 text-sm font-semibold transition',
                      quickView === 'PENDIENTES'
                        ? 'border-orange-500 bg-orange-500 text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)]'
                        : 'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100'
                    ].join(' ')}
                  >
                    Pendientes
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.5fr_0.85fr_0.85fr_1fr_1fr_auto]">
                {' '}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={filters.q}
                    onChange={handleFilterChange('q')}
                    placeholder="Buscar por titular, DNI, email, banco, tarjeta..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                  />
                </div>
                <FilterSelect
                  value={filters.estado}
                  onChange={handleFilterChange('estado')}
                  placeholder={
                    quickView === 'PENDIENTES'
                      ? 'Estado fijo: Pendiente'
                      : 'Estado'
                  }
                  options={quickView === 'PENDIENTES' ? [] : ESTADOS}
                />
                <FilterSelect
                  value={filters.canal_origen}
                  onChange={handleFilterChange('canal_origen')}
                  placeholder="Canal origen"
                  options={CANALES}
                />
                <FilterSelect
                  value={filters.modalidad_adhesion}
                  onChange={handleFilterChange('modalidad_adhesion')}
                  placeholder="Modalidad adhesión"
                  options={MODALIDADES}
                />
                <FilterSelectObject
                  value={filters.sede_id}
                  onChange={handleFilterChange('sede_id')}
                  placeholder="Sede"
                  options={sedesOptions}
                  valueKey="id"
                  labelKey="nombre"
                />
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <div className="mb-6 rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span>{error}</span>

                  <button
                    type="button"
                    onClick={() => fetchSolicitudes({ silent: true })}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            ) : null}

            <AnimatePresence>
              {toastMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mb-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800 shadow-sm"
                >
                  {toastMessage}
                </motion.div>
              ) : null}
            </AnimatePresence>

            {/* Table */}
            <div className="overflow-hidden rounded-[32px] border border-orange-100/80 bg-white/95 shadow-[0_30px_80px_-34px_rgba(15,23,42,0.20)] backdrop-blur-xl">
              <div className="flex flex-col gap-3 border-b border-slate-200/80 bg-gradient-to-r from-white via-orange-50/40 to-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <h3 className="text-base font-bignoodle font-bold tracking-wide text-slate-900">
                    Listado de solicitudes
                  </h3>
                  {/* <p className="mt-1 text-sm text-slate-500">
        Mostrando {rangeStart}–{rangeEnd} de {filteredRows.length} registros.
      </p> */}
                </div>
              </div>

              <div
                className="cursor-grab overflow-x-auto select-none active:cursor-grabbing"
                onMouseDown={handleTableMouseDown}
                onMouseMove={handleTableMouseMove}
                onMouseUp={handleTableMouseUp}
                onMouseLeave={handleTableMouseLeave}
                onTouchStart={handleTableTouchStart}
                onTouchMove={handleTableTouchMove}
                onTouchEnd={handleTableTouchEnd}
              >
                <table className="min-w-[1380px] w-full border-separate border-spacing-0">
                  <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur-md">
                    <tr>
                      {[
                        'Solicitud',
                        'Cargado por',
                        'Titular',
                        'Sede',
                        'Banco',
                        'Marca',
                        'Modalidad',
                        'Plan titular',
                        'Estado',
                        // 'Canal',
                        // 'Rol',
                        // 'Últimos 4',
                        'Tarjeta',
                        'Acciones'
                      ].map((head, index, arr) => (
                        <th
                          key={head}
                          className={[
                            'border-b border-slate-200 px-5 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-600',
                            index === 0 ? 'rounded-tl-2xl' : '',
                            index === arr.length - 1 ? 'rounded-tr-2xl' : ''
                          ].join(' ')}
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      [...Array(10)].map((_, idx) => (
                        <tr key={`skeleton-${idx}`} className="bg-white">
                          {Array.from({ length: 8 }).map((__, cellIdx) => (
                            <td
                              key={cellIdx}
                              className="border-b border-slate-100 px-5 py-4"
                            >
                              <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : paginatedRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8">
                          <EmptyState
                            onReload={() => fetchSolicitudes({ silent: true })}
                          />
                        </td>
                      </tr>
                    ) : (
                      paginatedRows.map((item) => {
                        const adicionales = getSolicitudAdicionales(item);
                        const rowHasAdicionales = adicionales.length > 0;
                        const isExpanded = Boolean(
                          expandedAdicionales[item.id]
                        );

                        /* Benjamin Orellana - 07/04/2026 - Detección visual de solicitudes cuya modalidad es solo adicional */
                        const isSoloAdicional =
                          normalizeModalidadAdhesion(
                            item.modalidad_adhesion
                          ) === 'SOLO_ADICIONAL';

                        return (
                          <React.Fragment key={item.id}>
                            <tr
                              className={[
                                'group transition-all duration-200',
                                isSoloAdicional
                                  ? 'bg-gradient-to-r from-orange-50 via-amber-50/70 to-white shadow-[inset_5px_0_0_0_rgba(249,115,22,0.95)] hover:bg-orange-500 hover:shadow-[inset_5px_0_0_0_rgba(255,255,255,0.9),inset_0_0_0_1px_rgba(249,115,22,0.35)]'
                                  : 'bg-white hover:bg-orange-500 hover:shadow-[inset_0_0_0_1px_rgba(249,115,22,0.35)]'
                              ].join(' ')}
                            >
                              {' '}
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="flex items-start gap-3">
                                  {rowHasAdicionales ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleAdicionalesRow(item.id)
                                      }
                                      className="mt-1 inline-flex flex-col items-center gap-1 rounded-2xl px-1 py-1 text-slate-500 transition-all duration-200 hover:bg-orange-50"
                                      title={
                                        isExpanded
                                          ? 'Ocultar adicionales'
                                          : 'Mostrar adicionales'
                                      }
                                    >
                                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-orange-700 transition-all duration-200 group-hover:border-white/80 group-hover:bg-white group-hover:text-orange-700">
                                        <CornerDownRight className="h-4 w-4" />
                                        {isExpanded ? (
                                          <ChevronDown className="ml-[-2px] h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="ml-[-2px] h-4 w-4" />
                                        )}
                                      </span>

                                      <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 transition-colors duration-200 group-hover:text-white">
                                        {adicionales.length}{' '}
                                        {adicionales.length === 1
                                          ? 'adicional'
                                          : 'adicionales'}
                                      </span>
                                    </button>
                                  ) : (
                                    <div className="flex w-[44px] justify-center" />
                                  )}

                                  <div
                                    className={[
                                      'inline-flex min-w-[78px] flex-col rounded-2xl px-3 py-2 shadow-sm transition-all duration-200 group-hover:border-white/80 group-hover:bg-white group-hover:shadow-[0_10px_24px_-14px_rgba(15,23,42,0.28)]',
                                      isSoloAdicional
                                        ? 'border border-orange-300 bg-gradient-to-br from-orange-100 via-orange-50 to-white ring-2 ring-orange-200/60'
                                        : 'border border-orange-100 bg-gradient-to-br from-orange-50 to-white'
                                    ].join(' ')}
                                  >
                                    {' '}
                                    <div className="text-sm font-extrabold text-slate-900 transition-colors duration-200 group-hover:text-slate-900">
                                      #{item.id}
                                    </div>
                                    <div className="mt-1 text-[11px] font-medium text-slate-500 transition-colors duration-200 group-hover:text-slate-600">
                                      {formatDate(item.created_at)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[190px]">
                                  <div className="text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-white">
                                    {item.cargado_por_nombre ||
                                      'Alta formulario página web'}
                                  </div>

                                  <div className="mt-1 text-[11px] font-medium text-slate-500 transition-colors duration-200 group-hover:text-orange-50">
                                    {item.usuario_carga_id
                                      ? `${item.usuario_carga?.email}`
                                      : 'Canal público'}
                                  </div>
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[220px]">
                                  <div className="font-semibold text-slate-900 transition-colors duration-200 group-hover:text-white">
                                    {item.titular_nombre || '—'}
                                  </div>
                                  <div className="mt-1 text-xs text-slate-500 transition-colors duration-200 group-hover:text-orange-50">
                                    DNI: {item.titular_dni || '—'}
                                  </div>
                                  <div className="max-w-[230px] truncate text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-white">
                                    {item.titular_email || '—'}
                                  </div>
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[170px] whitespace-normal text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-white">
                                  {item?.sede?.nombre || '—'}
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[170px] whitespace-normal text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-white">
                                  {item.banco?.nombre || '—'}
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-orange-700 transition-all duration-200 group-hover:border-white/80 group-hover:bg-white group-hover:text-orange-700">
                                  {item.marca_tarjeta || '—'}
                                </span>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[150px] whitespace-normal leading-relaxed">
                                  {isSoloAdicional ? (
                                    <span className="inline-flex rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-orange-800 transition-all duration-200 group-hover:border-white/80 group-hover:bg-white group-hover:text-orange-700">
                                      {prettyText(item.modalidad_adhesion)}
                                    </span>
                                  ) : (
                                    <div className="text-sm font-medium text-slate-700 transition-colors duration-200 group-hover:text-white">
                                      {prettyText(item.modalidad_adhesion)}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="max-w-[220px] truncate text-sm font-semibold text-slate-800 transition-colors duration-200 group-hover:text-white">
                                  {item.plan_titular?.nombre || '—'}
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <span className="inline-flex rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-orange-700 transition-all duration-200 group-hover:border-white/80 group-hover:bg-white group-hover:text-orange-700">
                                  {item.estado || '—'}
                                </span>
                              </td>
                              {/* Benjamin Orellana - 23/03/2026 - Columna visual de tarjeta con prioridad al número completo si el backend lo habilitó para admin */}
                              <td className="border-b border-slate-100 px-5 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="min-w-[210px] px-1 py-1 transition-all duration-200">
                                  <div className="mt-2 font-mono text-sm font-extrabold tracking-[0.14em] text-slate-900 transition-colors duration-200 group-hover:text-white">
                                    {formatCardDisplay(item)}
                                  </div>
                                </div>
                              </td>
                              <td className="border-b border-slate-100 px-6 py-4 align-top transition-colors duration-200 group-hover:border-orange-400">
                                <div className="rounded-[23px] border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)] transition-all duration-200 group-hover:border-white/20 group-hover:bg-white/10 group-hover:shadow-none">
                                  <div className="grid w-[180px] grid-cols-5 gap-10">
                                    <ActionIconButton
                                      icon={Eye}
                                      title="Ver"
                                      variant="primary"
                                      onClick={() => handleOpenDetail(item.id)}
                                    />

                                    {/* <ActionIconButton
        icon={Pencil}
        title={
          canEditSolicitud(item.estado)
            ? 'Editar'
            : 'Solo editable en estado PENDIENTE u OBSERVADA'
        }
        disabled={!canEditSolicitud(item.estado) || loadingEdit}
        onClick={() => handleOpenEdit(item.id)}
      /> */}

                                    <ActionIconButton
                                      icon={CheckCircle2}
                                      title={
                                        canApproveSolicitud(item.estado)
                                          ? 'Aprobar'
                                          : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                                      }
                                      variant="success"
                                      disabled={
                                        !canApproveSolicitud(item.estado)
                                      }
                                      onClick={() =>
                                        handlePendingAction('Aprobar', item)
                                      }
                                    />

                                    <ActionIconButton
                                      icon={XCircle}
                                      title={
                                        canRejectSolicitud(item.estado)
                                          ? 'Rechazar'
                                          : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                                      }
                                      variant="danger"
                                      disabled={
                                        !canRejectSolicitud(item.estado)
                                      }
                                      onClick={() =>
                                        handlePendingAction('Rechazar', item)
                                      }
                                    />

                                    <ActionIconButton
                                      icon={MessageSquareText}
                                      title={
                                        canObserveSolicitud(item.estado)
                                          ? 'Observar'
                                          : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                                      }
                                      variant="warning"
                                      disabled={
                                        !canObserveSolicitud(item.estado)
                                      }
                                      onClick={() =>
                                        handlePendingAction('Observar', item)
                                      }
                                    />
                                  </div>
                                </div>
                              </td>
                            </tr>
                            {/* Benjamin Orellana - 23/03/2026 - Filas alineadas de adicionales debajo de la solicitud principal */}
                            {rowHasAdicionales &&
                              isExpanded &&
                              adicionales.map((adicional, idx) => (
                                <tr
                                  key={
                                    adicional.id ??
                                    `${item.id}-adicional-${idx}`
                                  }
                                  className="bg-orange-50/35"
                                >
                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="flex items-start gap-3">
                                      <div className="flex w-[44px] justify-center pt-1 text-orange-600">
                                        <CornerDownRight className="h-4 w-4" />
                                      </div>

                                      <div className="min-w-[78px] px-1 py-1">
                                        <div className="text-[11px] font-black uppercase tracking-[0.14em] text-orange-700">
                                          Adicional {idx + 1}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="max-w-[220px]">
                                      <div className="font-semibold text-slate-900">
                                        {adicional.nombre || '—'}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        DNI: {adicional.dni || '—'}
                                      </div>
                                      <div className="max-w-[230px] truncate text-sm font-medium text-slate-700">
                                        {adicional.email || '—'}
                                      </div>
                                      <div className="mt-1 text-xs text-slate-500">
                                        Tel: {adicional.telefono || '—'}
                                      </div>
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="text-sm font-medium text-slate-400">
                                      —
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="text-sm font-medium text-slate-400">
                                      —
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="text-sm font-medium text-orange-700">
                                      Adicional
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="max-w-[220px] truncate text-sm font-semibold text-slate-800">
                                      {adicional.plan?.nombre || 'Sin plan'}
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="text-sm font-medium text-slate-400">
                                      —
                                    </div>
                                  </td>

                                  <td className="border-b border-orange-100 px-5 py-3 align-top">
                                    <div className="text-sm font-medium text-slate-400">
                                      —
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200/80 bg-gradient-to-r from-white via-orange-50/30 to-white px-3 py-3 sm:px-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onChange={setCurrentPage}
                />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </section>

      <SolicitudFormModal
        open={formOpen}
        mode={formMode}
        initialData={editingSolicitud}
        onClose={() => {
          setFormOpen(false);
          setEditingSolicitud(null);
          setFormMode('create');
        }}
        onSubmit={
          formMode === 'edit' ? handleUpdateSolicitud : handleCreateSolicitud
        }
        onOpenDetail={(id) => {
          setDetailId(id);
          setDetailOpen(true);
        }}
      />

      <SolicitudDetailModal
        open={detailOpen}
        solicitudId={detailId}
        onClose={() => {
          setDetailOpen(false);
          setDetailId(null);
        }}
        onPendingFeature={(action, solicitudDetalle) =>
          handlePendingAction(action, solicitudDetalle)
        }
        onEdit={(solicitudDetalle) => {
          setDetailOpen(false);
          setDetailId(null);

          setEditingSolicitud(solicitudDetalle);
          setFormMode('edit');
          setFormOpen(true);
        }}
        apiUrl={API_URL}
      />

      <SolicitudObservarModal
        open={observarOpen}
        onClose={closeObservarModal}
        solicitudId={observingSolicitud?.id}
        solicitud={observingSolicitud}
        onSuccess={handleObserveSuccess}
        apiBaseUrl={API_URL}
      />
      <SolicitudAprobarModal
        open={approveModalOpen}
        solicitud={selectedSolicitudToApprove}
        onClose={handleCloseApprove}
        onApproved={() => {
          handleCloseApprove();

          // Opción 1: recargar todo el listado
          fetchSolicitudes?.();
        }}
      />
      <SolicitudRechazarModal
        open={rejectModalOpen}
        solicitud={selectedSolicitudToReject}
        onClose={handleCloseReject}
        onRejected={() => {
          handleCloseReject();
          fetchSolicitudes?.();
        }}
      />
      <SolicitudCancelarModal
        open={cancelModalOpen}
        solicitud={selectedSolicitudToCancel}
        onClose={handleCloseCancel}
        onCancelled={() => {
          handleCloseCancel();
          fetchSolicitudes?.();
        }}
      />
    </>
  );
}
