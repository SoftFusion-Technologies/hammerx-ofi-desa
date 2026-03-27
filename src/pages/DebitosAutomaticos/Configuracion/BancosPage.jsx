/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.2
 *
 * Descripción:
 * Página visual para listar bancos del módulo Débitos Automáticos.
 * En esta etapa consume GET /debitos-automaticos-bancos
 * y renderiza la información en cards modernas, compactas, responsive
 *
 * Tema: Frontend - Débitos Automáticos - Bancos
 * Capa: Frontend
 */

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavbarStaff from '../../staff/NavbarStaff';
import Swal from 'sweetalert2';

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Eye,
  FileText,
  Hash,
  Landmark,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  XCircle
} from 'lucide-react';

import BancoFormModal from '../../../components/Forms/DebitosAutomaticos/BancoFormModal.jsx';
import BancoDetailModal from '../../../components/Forms/DebitosAutomaticos/Modals/BancoDetailModal.jsx';

const API_URL = 'http://localhost:8080/debitos-automaticos-bancos';

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.42,
      delay: i * 0.05
    }
  })
};

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardItem = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.34,
      ease: 'easeOut'
    }
  }
};

const normalizeBoolean = (value) => {
  if (value === true || value === 1 || value === '1') return true;
  if (value === false || value === 0 || value === '0') return false;

  const raw = String(value ?? '')
    .trim()
    .toLowerCase();

  return [
    'activo',
    'activa',
    'habilitado',
    'habilitada',
    'si',
    'sí',
    'true'
  ].includes(raw);
};

const formatDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const formatPct = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return Number.isInteger(num) ? String(num) : num.toFixed(2);
};

const clampText = (text, max = 120) => {
  const raw = String(text || '').trim();
  if (!raw) return '';
  if (raw.length <= max) return raw;
  return `${raw.slice(0, max).trim()}...`;
};

const getBankName = (bank) =>
  bank?.nombre ||
  bank?.name ||
  bank?.banco ||
  bank?.titulo ||
  `Banco #${bank?.id ?? '—'}`;

const getBankCode = (bank) =>
  bank?.codigo ||
  bank?.codigo_banco ||
  bank?.abreviatura ||
  bank?.alias ||
  bank?.sigla ||
  null;

const getBankBenefit = (bank) =>
  bank?.descripcion_publica ||
  bank?.beneficio_visible ||
  bank?.beneficio ||
  bank?.beneficios ||
  bank?.descripcion_beneficio ||
  bank?.promocion ||
  bank?.promo ||
  'Beneficio pendiente de configuración';

const getBankDescription = (bank) => {
  if (bank?.descripcion) return bank.descripcion;
  if (bank?.detalle) return bank.detalle;
  if (bank?.observaciones) return bank.observaciones;
  if (bank?.notas) return bank.notas;

  const off = Number(bank?.descuento_off_pct || 0);
  const reintegro = Number(bank?.reintegro_pct || 0);
  const desdeMes = bank?.reintegro_desde_mes;
  const duracion = bank?.reintegro_duracion_meses;
  const permanente = Number(bank?.beneficio_permanente || 0) === 1;

  if (off > 0 && permanente) {
    return `Promoción vigente con ${formatPct(off)}% OFF permanente para adhesiones activas.`;
  }

  if (off > 0 && reintegro > 0 && desdeMes && duracion) {
    return `Incluye ${formatPct(off)}% OFF inicial y ${formatPct(reintegro)}% de reintegro desde el mes ${desdeMes} durante ${duracion} meses.`;
  }

  if (off > 0) {
    return `Promoción vigente con ${formatPct(off)}% OFF.`;
  }

  if (reintegro > 0) {
    return `Promoción vigente con ${formatPct(reintegro)}% de reintegro.`;
  }

  return 'Entidad disponible para adhesiones y operatoria de débitos automáticos.';
};

const getBankStatus = (bank) =>
  normalizeBoolean(
    bank?.activo ?? bank?.estado ?? bank?.habilitado ?? bank?.visible ?? true
  );

const getCreatedDate = (bank) =>
  bank?.created_at ||
  bank?.createdAt ||
  bank?.fecha_alta ||
  bank?.fecha_creacion;

const getUpdatedDate = (bank) =>
  bank?.updated_at ||
  bank?.updatedAt ||
  bank?.fecha_modificacion ||
  bank?.fecha_actualizacion;

const BancoCard = ({ banco, onEdit, onDelete, onView }) => {
  const activo = getBankStatus(banco);
  const nombre = getBankName(banco);
  const codigo = getBankCode(banco);
  const beneficio = getBankBenefit(banco);
  const descripcion = getBankDescription(banco);
  const creado = getCreatedDate(banco);
  const actualizado = getUpdatedDate(banco);

  const descuentoOff = Number(banco?.descuento_off_pct || 0);
  const reintegro = Number(banco?.reintegro_pct || 0);
  const reintegroDesdeMes = banco?.reintegro_desde_mes;
  const reintegroDuracion = banco?.reintegro_duracion_meses;
  const beneficioPermanente = Number(banco?.beneficio_permanente || 0) === 1;

  return (
    <motion.article
      variants={cardItem}
      whileHover={{ y: -6, scale: 1.012 }}
      transition={{ duration: 0.22 }}
      className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/85 shadow-[0_12px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.10),transparent_35%)] opacity-80" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-orange-400/10 blur-2xl transition-all duration-300 group-hover:scale-125" />
      <div className="absolute -left-8 -bottom-8 h-24 w-24 rounded-full bg-emerald-400/10 blur-2xl transition-all duration-300 group-hover:scale-125" />

      <div className="relative p-4">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <motion.div
              whileHover={{ rotate: -6, scale: 1.06 }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 via-white to-emerald-50 text-orange-600 ring-1 ring-orange-200/70 shadow-sm"
            >
              <Landmark className="h-5 w-5" />
            </motion.div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate font-bignoodle text-[1.45rem] leading-none tracking-[0.10em] text-slate-900">
                  {nombre}
                </h3>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    activo
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'border border-rose-200 bg-rose-50 text-rose-700'
                  }`}
                >
                  {activo ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {codigo && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    <Hash className="h-3 w-3" />
                    {codigo}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  ID #{banco?.id ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-slate-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:border-slate-300">
            <button
              type="button"
              onClick={() => onView?.(banco)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-sky-600 transition hover:bg-sky-50"
              title="Ver detalle"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onEdit?.(banco)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-amber-600 transition hover:bg-amber-50"
              title="Editar"
            >
              <Pencil className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onDelete?.(banco)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-rose-600 transition hover:bg-rose-50"
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bloque beneficio */}
        <div className="mb-3 rounded-2xl border border-emerald-100/80 bg-gradient-to-r from-emerald-50/95 via-white to-emerald-50/70 p-3.5 shadow-sm">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
              Beneficio visible
            </p>
          </div>

          <p className="text-[13px] font-medium leading-relaxed text-slate-700">
            {clampText(beneficio, 110)}
          </p>
        </div>

        {/* Chips */}
        <div className="mb-3 flex flex-wrap gap-2">
          {descuentoOff > 0 && (
            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              {formatPct(descuentoOff)}% OFF
            </span>
          )}

          {reintegro > 0 && (
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
              {formatPct(reintegro)}% reintegro
            </span>
          )}

          {beneficioPermanente && (
            <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-700">
              Permanente
            </span>
          )}

          {reintegroDesdeMes && (
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Mes {reintegroDesdeMes}
            </span>
          )}

          {reintegroDuracion && (
            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
              {reintegroDuracion} meses
            </span>
          )}
        </div>

        {/* Descripción + fechas */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/85 p-3.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                Descripción
              </p>
            </div>

            <p className="text-[13px] leading-relaxed text-slate-600">
              {clampText(descripcion, 135)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3">
              <div className="mb-1 flex items-center gap-2 text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                  Alta
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(creado)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-3">
              <div className="mb-1 flex items-center gap-2 text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-[0.18em]">
                  Update
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(actualizado)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <p className="text-[11px] font-medium text-slate-400">
            Banco disponible para adhesiones
          </p>

          <button
            type="button"
            onClick={() => onView?.(banco)}
            className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 transition hover:text-orange-600"
          >
            Ver más
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
};

const BancosPage = () => {
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [openBancoModal, setOpenBancoModal] = useState(false);
  const [selectedBanco, setSelectedBanco] = useState(null);
  const [openBancoDetailModal, setOpenBancoDetailModal] = useState(false);
  const [detailBanco, setDetailBanco] = useState(null);

  const handleOpenCreateBanco = () => {
    setSelectedBanco(null);
    setOpenBancoModal(true);
  };

  const handleOpenEditBanco = (banco) => {
    setSelectedBanco(banco);
    setOpenBancoModal(true);
  };

  const handleCloseBancoModal = () => {
    setOpenBancoModal(false);
    setSelectedBanco(null);
  };

  const handleOpenBancoDetail = (banco) => {
    setDetailBanco(banco);
    setOpenBancoDetailModal(true);
  };

  const handleCloseBancoDetail = () => {
    setOpenBancoDetailModal(false);
    setDetailBanco(null);
  };

  const handleSubmitBanco = async (payload) => {
    if (selectedBanco?.id) {
      await axios.put(
        `http://localhost:8080/debitos-automaticos-bancos/${selectedBanco.id}`,
        payload
      );
    } else {
      await axios.post(
        'http://localhost:8080/debitos-automaticos-bancos',
        payload
      );
    }

    await fetchBancos({ silent: true });
  };

  const handleDeleteBanco = async (banco) => {
    const result = await Swal.fire({
      title: '¿Dar de baja este banco?',
      html: `
      <div style="text-align:left; color:#475569; font-size:14px; line-height:1.6;">
        <p style="margin:0 0 10px 0;">
          Vas a dar de baja el banco:
        </p>
        <p style="margin:0; font-weight:700; color:#0f172a; font-size:16px;">
          ${banco?.nombre || 'Banco sin nombre'}
        </p>
        <p style="margin:10px 0 0 0; color:#64748b;">
          Esta acción lo dejará inactivo en el sistema.
        </p>
      </div>
    `,
      icon: 'warning',
      iconColor: '#dc2626',
      background: '#ffffff',
      color: '#0f172a',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja',
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
      await axios.delete(
        `http://localhost:8080/debitos-automaticos-bancos/${banco.id}`
      );

      await Swal.fire({
        title: 'Banco dado de baja',
        text: `${banco?.nombre || 'El banco'} fue dado de baja correctamente.`,
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

      await fetchBancos({ silent: true });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo dar de baja el banco.';

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

  const fetchBancos = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setLoadingRefresh(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await axios.get(API_URL);
      const payload = response?.data;

      const listado = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.rows)
          ? payload.rows
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.bancos)
              ? payload.bancos
              : [];

      setBancos(listado);
    } catch (err) {
      console.error('Error al obtener bancos:', err);
      setError('No se pudieron cargar los bancos del módulo.');
      setBancos([]);
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    fetchBancos();
  }, []);

  const bancosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return bancos;

    return bancos.filter((bank) => {
      const texto = [
        getBankName(bank),
        getBankCode(bank),
        getBankBenefit(bank),
        getBankDescription(bank),
        bank?.id
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return texto.includes(term);
    });
  }, [bancos, search]);

  const stats = useMemo(() => {
    const total = bancos.length;
    const activos = bancos.filter((b) => getBankStatus(b)).length;
    const inactivos = total - activos;
    const conBeneficio = bancos.filter((b) => {
      const beneficio = getBankBenefit(b);
      return beneficio && beneficio !== 'Beneficio pendiente de configuración';
    }).length;

    return { total, activos, inactivos, conBeneficio };
  }, [bancos]);

  return (
    <>
      <NavbarStaff />

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="mx-auto max-w-10xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
                  Bancos
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="mt-2 max-w-2xl text-sm text-slate-200/85"
                >
                  Bancos disponibles en el módulo de débitos automáticos.
                </motion.p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateBanco}
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo banco
                </button>

                <button
                  type="button"
                  onClick={() => fetchBancos({ silent: true })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Total bancos',
                  value: stats.total,
                  icon: Building2,
                  tone: 'from-orange-500/20 to-orange-500/5 border-orange-300/30 text-orange-100'
                },
                {
                  label: 'Activos',
                  value: stats.activos,
                  icon: CheckCircle2,
                  tone: 'from-emerald-500/20 to-emerald-500/5 border-emerald-300/30 text-emerald-100'
                },
                {
                  label: 'Inactivos',
                  value: stats.inactivos,
                  icon: XCircle,
                  tone: 'from-rose-500/20 to-rose-500/5 border-rose-300/30 text-rose-100'
                },
                {
                  label: 'Con beneficio',
                  value: stats.conBeneficio,
                  icon: Sparkles,
                  tone: 'from-cyan-500/20 to-cyan-500/5 border-cyan-300/30 text-cyan-100'
                }
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.label}
                    custom={index}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className={`rounded-[26px] border bg-gradient-to-br ${item.tone} p-5 backdrop-blur-xl shadow-[0_12px_40px_rgba(15,23,42,0.16)]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/70">
                          {item.label}
                        </p>
                        <p className="mt-2 text-3xl font-black text-white">
                          {item.value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Barra superior */}
            <div className="mb-8 rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre, código, beneficio..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
                    <p className="text-[11px] uppercase tracking-widest text-slate-300/70">
                      Resultado actual
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {bancosFiltrados.length} banco
                      {bancosFiltrados.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estados */}
            {loading && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-[24px] border border-white/10 bg-white/85 p-4 shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-slate-200" />
                        <div>
                          <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                          <div className="h-3 w-20 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="h-10 w-24 rounded-2xl bg-slate-200" />
                    </div>

                    <div className="mb-3 h-16 rounded-2xl bg-slate-200" />
                    <div className="mb-3 flex gap-2">
                      <div className="h-6 w-20 rounded-full bg-slate-200" />
                      <div className="h-6 w-24 rounded-full bg-slate-200" />
                    </div>
                    <div className="mb-3 h-16 rounded-2xl bg-slate-200" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-14 rounded-2xl bg-slate-200" />
                      <div className="h-14 rounded-2xl bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
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
                    onClick={() => fetchBancos()}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && bancosFiltrados.length === 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                <Landmark className="mx-auto mb-4 h-14 w-14 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-800">
                  No hay bancos para mostrar
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  {search
                    ? 'No hubo coincidencias con tu búsqueda actual.'
                    : 'Todavía no se registraron bancos en este módulo.'}
                </p>
              </div>
            )}

            {!loading && !error && bancosFiltrados.length > 0 && (
              <motion.div
                variants={cardsContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              >
                {bancosFiltrados.map((banco, index) => (
                  <BancoCard
                    key={banco?.id ?? `${getBankName(banco)}-${index}`}
                    banco={banco}
                    onEdit={handleOpenEditBanco}
                    onDelete={handleDeleteBanco}
                    onView={handleOpenBancoDetail}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      <BancoFormModal
        open={openBancoModal}
        onClose={handleCloseBancoModal}
        onSubmit={handleSubmitBanco}
        initial={selectedBanco}
      />

      <BancoDetailModal
        open={openBancoDetailModal}
        onClose={handleCloseBancoDetail}
        banco={detailBanco}
      />
    </>
  );
};

export default BancosPage;
