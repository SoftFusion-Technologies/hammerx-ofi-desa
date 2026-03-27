/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 12 / 03 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Page para visualizar y aceptar los términos y condiciones del módulo
 * Débitos Automáticos. Consume GET /debitos-automaticos-terminos y
 * presenta el contenido legal en una experiencia centrada en lectura,
 * aceptación y confirmación final.
 *
 * Tema: Frontend - Débitos Automáticos - Términos
 * Capa: Frontend
 */

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import NavbarStaff from '../../staff/NavbarStaff';
import TerminosFormModal from '../../../components/Forms/DebitosAutomaticos/TerminosFormModal.jsx';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  FileText,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
  XCircle
} from 'lucide-react';

const API_URL = 'http://localhost:8080/debitos-automaticos-terminos';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      delay: i * 0.05
    }
  })
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

const getActivo = (value) => value === 1 || value === '1' || value === true;

const parseDateSafe = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isTerminoVigente = (termino) => {
  if (!getActivo(termino?.activo)) return false;

  const now = new Date();
  const desde = parseDateSafe(termino?.publicado_desde);
  const hasta = parseDateSafe(termino?.publicado_hasta);

  if (desde && now < desde) return false;
  if (hasta && now > hasta) return false;

  return true;
};

const ModalBase = ({
  open,
  onClose,
  title,
  children,
  maxWidth = 'max-w-4xl'
}) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.22 }}
            className={`relative w-full ${maxWidth} overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.28)]`}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TerminosPage = () => {
  const [terminos, setTerminos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState('');
  const [aceptado, setAceptado] = useState(false);
  const [openTerminosModal, setOpenTerminosModal] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmacionHecha, setConfirmacionHecha] = useState(false);
  const [openTerminosFormModal, setOpenTerminosFormModal] = useState(false);
  const [selectedTermino, setSelectedTermino] = useState(null);
  const [previewTermino, setPreviewTermino] = useState(null);
  const [openPreviewModal, setOpenPreviewModal] = useState(false);

  const handleOpenCreateTermino = () => {
    setSelectedTermino(null);
    setOpenTerminosFormModal(true);
  };

  const handleOpenEditTermino = (termino) => {
    setSelectedTermino(termino);
    setOpenTerminosFormModal(true);
  };

  const handleCloseTerminosFormModal = () => {
    setOpenTerminosFormModal(false);
    setSelectedTermino(null);
  };

  const handleSubmitTermino = async (payload) => {
    if (selectedTermino?.id) {
      await axios.put(
        `http://localhost:8080/debitos-automaticos-terminos/${selectedTermino.id}`,
        payload
      );
    } else {
      await axios.post(
        'http://localhost:8080/debitos-automaticos-terminos',
        payload
      );
    }

    await fetchTerminos({ silent: true });
  };

  const handleOpenPreviewTermino = (termino) => {
    setPreviewTermino(termino);
    setOpenPreviewModal(true);
  };

  const handleClosePreviewTermino = () => {
    setPreviewTermino(null);
    setOpenPreviewModal(false);
  };

  const handleActivarTermino = async (termino) => {
    await axios.put(
      `http://localhost:8080/debitos-automaticos-terminos/${termino.id}/activar`
    );

    await fetchTerminos({ silent: true });
  };

  const handleDesactivarTermino = async (termino) => {
    await axios.delete(
      `http://localhost:8080/debitos-automaticos-terminos/${termino.id}`
    );

    await fetchTerminos({ silent: true });
  };

  const fetchTerminos = async ({ silent = false } = {}) => {
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
            : Array.isArray(payload?.terminos)
              ? payload.terminos
              : [];

      setTerminos(listado);
    } catch (err) {
      console.error('Error al obtener términos:', err);
      setError('No se pudieron cargar los términos y condiciones del módulo.');
      setTerminos([]);
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  };

  useEffect(() => {
    fetchTerminos();
  }, []);

  const terminoActual = useMemo(() => {
    if (!terminos.length) return null;

    const vigentes = terminos.filter(isTerminoVigente);

    if (vigentes.length > 0) {
      return vigentes.sort((a, b) => {
        const dateA = parseDateSafe(a?.updated_at)?.getTime() || 0;
        const dateB = parseDateSafe(b?.updated_at)?.getTime() || 0;
        return dateB - dateA;
      })[0];
    }

    const activos = terminos.filter((item) => getActivo(item?.activo));
    if (activos.length > 0) {
      return activos.sort((a, b) => {
        const dateA = parseDateSafe(a?.updated_at)?.getTime() || 0;
        const dateB = parseDateSafe(b?.updated_at)?.getTime() || 0;
        return dateB - dateA;
      })[0];
    }

    return [...terminos].sort((a, b) => {
      const dateA = parseDateSafe(a?.updated_at)?.getTime() || 0;
      const dateB = parseDateSafe(b?.updated_at)?.getTime() || 0;
      return dateB - dateA;
    })[0];
  }, [terminos]);

  const contenidoRender = useMemo(() => {
    return String(terminoActual?.contenido_html || '').trim();
  }, [terminoActual]);

  const handleAbrirConfirmacion = () => {
    if (!aceptado) return;
    setOpenConfirmModal(true);
  };

  const handleConfirmar = () => {
    setConfirmacionHecha(true);
    setOpenConfirmModal(false);
  };

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
                  Términos y condiciones
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="mt-2 max-w-3xl text-sm text-slate-200/85"
                >
                  Documento legal vigente para la adhesión al débito automático.
                </motion.p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenCreateTermino}
                  className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo término
                </button>

                <button
                  type="button"
                  onClick={() => fetchTerminos({ silent: true })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loadingRefresh ? 'animate-spin' : ''}`}
                  />
                  Actualizar
                </button>
              </div>
            </div>

            {loading && (
              <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                <div className="animate-pulse">
                  <div className="mb-4 h-8 w-64 rounded bg-slate-200" />
                  <div className="mb-3 h-5 w-full rounded bg-slate-200" />
                  <div className="mb-3 h-5 w-5/6 rounded bg-slate-200" />
                  <div className="mb-3 h-5 w-4/6 rounded bg-slate-200" />
                  <div className="mt-6 h-40 rounded-3xl bg-slate-200" />
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[30px] border border-rose-200 bg-white p-8 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
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
                    onClick={() => fetchTerminos()}
                    className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && !terminoActual && (
              <div className="rounded-[30px] border border-slate-200 bg-white p-10 text-center shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
                <h3 className="text-xl font-bold text-slate-800">
                  No hay términos cargados
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Todavía no existe un registro de términos y condiciones para
                  este módulo.
                </p>
              </div>
            )}

            {!loading && !error && terminoActual && (
              <>
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                    <div className="mb-5 flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-700">
                          <FileText className="h-3.5 w-3.5" />
                          Documento legal
                        </div>

                        <h2 className="text-2xl font-bold text-slate-900">
                          {terminoActual?.titulo || 'Términos y condiciones'}
                        </h2>
                      </div>

                      <span
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          getActivo(terminoActual?.activo)
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border border-rose-200 bg-rose-50 text-rose-700'
                        }`}
                      >
                        {getActivo(terminoActual?.activo) ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {getActivo(terminoActual?.activo)
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Versión
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {terminoActual?.version || '-'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Publicado desde
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDateTime(terminoActual?.publicado_desde)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Publicado hasta
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDateTime(terminoActual?.publicado_hasta)}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                          Última actualización
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {formatDateTime(terminoActual?.updated_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
                      <button
                        type="button"
                        onClick={() => handleOpenPreviewTermino(terminoActual)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        <Eye className="h-4 w-4" />
                        Ver documento
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditTermino(terminoActual)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Editar
                      </button>

                      {!getActivo(terminoActual?.activo) && (
                        <button
                          type="button"
                          onClick={() => handleActivarTermino(terminoActual)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <Power className="h-4 w-4" />
                          Activar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDesactivarTermino(terminoActual)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        <XCircle className="h-4 w-4" />
                        Desactivar
                      </button>
                    </div>

                    {!contenidoRender && (
                      <div className="mt-6 rounded-[28px] border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">
                              El registro no tiene contenido HTML cargado
                            </p>
                            <p className="mt-1 text-sm text-amber-700">
                              El documento existe, pero no tiene texto legal
                              disponible para mostrar.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 rounded-[30px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_50px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bignoodle font-bold text-slate-900">
                        Historial de versiones
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {terminos.map((termino, index) => (
                      <motion.article
                        key={termino?.id ?? index}
                        custom={index}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
                      >
                        <div className="mb-4 flex items-start justify-between gap-3">
                          <div>
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
                                ID #{termino?.id ?? '-'}
                              </span>

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                                  getActivo(termino?.activo)
                                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                    : 'border border-rose-200 bg-rose-50 text-rose-700'
                                }`}
                              >
                                {getActivo(termino?.activo) ? (
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                ) : (
                                  <XCircle className="h-3.5 w-3.5" />
                                )}
                                {getActivo(termino?.activo)
                                  ? 'Activo'
                                  : 'Inactivo'}
                              </span>
                            </div>

                            <h4 className="text-lg font-bold text-slate-900">
                              {termino?.titulo || 'Sin título'}
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                              Versión:{' '}
                              <span className="font-semibold">
                                {termino?.version || '-'}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              Publicado desde
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatDateTime(termino?.publicado_desde)}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              Publicado hasta
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatDateTime(termino?.publicado_hasta)}
                            </p>
                          </div>

                          <div className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                              Última actualización
                            </p>
                            <p className="mt-1 text-sm font-semibold text-slate-800">
                              {formatDateTime(termino?.updated_at)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                          <button
                            type="button"
                            onClick={() => handleOpenPreviewTermino(termino)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-100"
                            title="Ver"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditTermino(termino)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {!getActivo(termino?.activo) && (
                            <button
                              type="button"
                              onClick={() => handleActivarTermino(termino)}
                              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <Power className="h-4 w-4" />
                              Activar
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleDesactivarTermino(termino)}
                            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            <XCircle className="h-4 w-4" />
                            Desactivar
                          </button>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <ModalBase
        open={openPreviewModal}
        onClose={handleClosePreviewTermino}
        title={previewTermino?.titulo || 'Términos y condiciones'}
        maxWidth="max-w-5xl"
      >
        {previewTermino ? (
          <>
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Versión
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {previewTermino?.version || '-'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Estado
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {getActivo(previewTermino?.activo) ? 'Activo' : 'Inactivo'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Desde
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDateTime(previewTermino?.publicado_desde)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                    Hasta
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {formatDateTime(previewTermino?.publicado_hasta)}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
              <div
                className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700"
                dangerouslySetInnerHTML={{
                  __html:
                    previewTermino?.contenido_html || '<p>Sin contenido.</p>'
                }}
              />
            </div>
          </>
        ) : (
          <div className="px-6 py-8">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-medium text-slate-600">
                No hay un término seleccionado para visualizar.
              </p>
            </div>
          </div>
        )}
      </ModalBase>

      <ModalBase
        open={openConfirmModal}
        onClose={() => setOpenConfirmModal(false)}
        title="Confirmación final"
        maxWidth="max-w-2xl"
      >
        <div className="px-6 py-6">
          <div className="rounded-[26px] border border-orange-200 bg-orange-50 p-5">
            <p className="text-base font-semibold leading-relaxed text-slate-900">
              Confirmo que los datos ingresados son válidos y que la tarjeta
              adherida corresponde a una tarjeta de crédito.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleConfirmar}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-emerald-700"
            >
              Confirmar
            </button>

            <button
              type="button"
              onClick={() => setOpenConfirmModal(false)}
              className="inline-flex items-center justify-center rounded-2xl bg-rose-600 px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-rose-700"
            >
              Salir
            </button>
          </div>
        </div>
      </ModalBase>

      <TerminosFormModal
        open={openTerminosFormModal}
        onClose={handleCloseTerminosFormModal}
        onSubmit={handleSubmitTermino}
        initial={selectedTermino}
      />
    </>
  );
};

export default TerminosPage;
