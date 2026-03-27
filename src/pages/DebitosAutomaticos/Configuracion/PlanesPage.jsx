/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Página para listar los PLANES del módulo Débitos Automáticos.
 * En esta etapa consume GET /debitos-automaticos-planes
 * y muestra la información en formato tabla.
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
  Trash2,
  XCircle
} from 'lucide-react';
import { Plus } from 'lucide-react';
import PlanFormModal from '../../../components/Forms/DebitosAutomaticos/PlanFormModal.jsx';
import Swal from 'sweetalert2';
const API_URL = 'http://localhost:8080/debitos-automaticos-planes';

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
  if (!Number.isFinite(num)) return value;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 2
  }).format(num);
};

const getActivo = (value) => {
  return value === 1 || value === '1' || value === true;
};

const noop = () => {};

const PlanesPage = () => {
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [openPlanModal, setOpenPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

  const handleSubmitPlan = async (payload) => {
    if (selectedPlan?.id) {
      await axios.put(
        `http://localhost:8080/debitos-automaticos-planes/${selectedPlan.id}`,
        payload
      );
    } else {
      await axios.post(
        'http://localhost:8080/debitos-automaticos-planes',
        payload
      );
    }

    await fetchPlanes({ silent: true });
  };

  const handleDeletePlan = async (plan) => {
    const result = await Swal.fire({
      title: '¿Eliminar este plan?',
      html: `
      <div style="text-align:left; color:#475569; font-size:14px; line-height:1.6;">
        <p style="margin:0 0 10px 0;">
          Vas a eliminar el plan:
        </p>
        <p style="margin:0; font-weight:700; color:#0f172a; font-size:16px;">
          ${plan?.nombre || 'Plan sin nombre'}
        </p>
        <p style="margin:10px 0 0 0; color:#64748b;">
          Esta acción impactará sobre el registro actual.
        </p>
      </div>
    `,
      icon: 'warning',
      iconColor: '#dc2626',
      background: '#ffffff',
      color: '#0f172a',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
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
        `http://localhost:8080/debitos-automaticos-planes/${plan.id}`
      );

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

      await fetchPlanes({ silent: true });
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo eliminar el plan.';

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

  const fetchPlanes = async ({ silent = false } = {}) => {
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
            : Array.isArray(payload?.planes)
              ? payload.planes
              : [];

      setPlanes(listado);
    } catch (err) {
      console.error('Error al obtener planes:', err);
      setError('No se pudieron cargar los planes del módulo.');
      setPlanes([]);
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  const planesFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return planes;

    return planes.filter((plan) => {
      const texto = [
        plan?.id,
        plan?.codigo,
        plan?.nombre,
        plan?.descripcion,
        plan?.activo,
        plan?.orden_visual,
        plan?.precio_referencia,
        plan?.created_at,
        plan?.updated_at
      ]
        .filter((item) => item !== null && item !== undefined)
        .join(' ')
        .toLowerCase();

      return texto.includes(term);
    });
  }, [planes, search]);

  return (
    <>
      <NavbarStaff />

      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
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
                  Planes
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="mt-2 max-w-2xl text-sm text-slate-200/85"
                >
                  Listado general de planes del módulo de débitos automáticos.
                </motion.p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreatePlan}
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo plan
                </button>

                <button
                  type="button"
                  onClick={() => fetchPlanes({ silent: true })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="mb-6 rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-md">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por código, nombre o descripción..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-right">
                  <p className="text-[11px] uppercase tracking-widest text-slate-300/70">
                    Resultado actual
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {planesFiltrados.length} plan
                    {planesFiltrados.length === 1 ? '' : 'es'}
                  </p>
                </div>
              </div>
            </div>

            {loading && (
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
                <div className="animate-pulse p-6">
                  <div className="mb-4 h-6 w-48 rounded bg-slate-200" />
                  <div className="space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-12 rounded-xl bg-slate-200" />
                    ))}
                  </div>
                </div>
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
                    onClick={() => fetchPlanes()}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && planesFiltrados.length === 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/90 p-10 text-center shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
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
              <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          ID
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Código
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Nombre
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Descripción
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Activo
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Orden visual
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Precio referencia
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Fecha de creación
                        </th>
                        <th className="px-4 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Fecha de actualización
                        </th>
                        <th className="px-4 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {planesFiltrados.map((plan, index) => (
                        <tr
                          key={plan?.id ?? index}
                          className="group border-t border-slate-100 transition duration-200 hover:bg-orange-500"
                        >
                          <td className="px-4 py-4 text-sm font-semibold text-slate-700 transition group-hover:text-white">
                            {plan?.id ?? '-'}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700 transition group-hover:text-white">
                            {plan?.codigo || '-'}
                          </td>

                          <td className="px-4 py-4 text-sm font-medium text-slate-800 transition group-hover:text-white">
                            {plan?.nombre || '-'}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600 transition group-hover:text-white">
                            {plan?.descripcion || '-'}
                          </td>

                          <td className="px-4 py-4 text-sm transition group-hover:text-white">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                                getActivo(plan?.activo)
                                  ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20'
                                  : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 group-hover:bg-white/15 group-hover:text-white group-hover:ring-white/20'
                              }`}
                            >
                              {getActivo(plan?.activo) ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              {getActivo(plan?.activo) ? 'Sí' : 'No'}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700 transition group-hover:text-white">
                            {plan?.orden_visual ?? '-'}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-700 transition group-hover:text-white">
                            {formatMoney(plan?.precio_referencia)}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600 transition group-hover:text-white">
                            {formatDate(plan?.created_at)}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600 transition group-hover:text-white">
                            {formatDate(plan?.updated_at)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditPlan(plan)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                title="Editar"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeletePlan(plan)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100 group-hover:border-white/20 group-hover:bg-white/15 group-hover:text-white"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
    </>
  );
};

export default PlanesPage;
