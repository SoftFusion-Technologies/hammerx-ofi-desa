/*
 * Programador: Benjamin Orellana (con mejoras UX/RBAC por ChatGPT)
 * Fecha: 01/04/2024 (refactor 18/10/2025)
 * Versión: 3.0 (UX++ + SweetAlert2)
 *
 * Descripción:
 * Quejas Internas con control de acceso (RBAC) y UX premium:
 * - Ancho ampliado (max-w-[1600px])
 * - SweetAlert2 (confirm/éxito/error + toasts)
 * - Búsqueda global, filtros rápidos (estado + rango fecha)
 * - Chips de contexto de visibilidad, stats, badges
 * - Loader skeleton, tabla moderna, paginación pro
 * - Acciones con tooltips, abrir WhatsApp, copiar contacto
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPlus,
  FaSearch,
  FaTimes,
  FaCheck,
  FaInfoCircle,
  FaChevronLeft,
  FaChevronRight,
  FaSyncAlt,
  FaTrash,
  FaEdit,
  FaPhoneAlt,
  FaCopy
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../AuthContext';
import NavbarStaff from '../NavbarStaff';
import Footer from '../../../components/footer/Footer';
import FormAltaQueja from '../../../components/Forms/FormAltaQueja';
import QuejasDetails from './QuejasInternasGetId';
import '../../../styles/staff/background.css';

// ===================== Helpers =====================
const toCanonical = (str = '') =>
  str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

const isCoordinator = (level = '') => {
  const L = toCanonical(level);
  return L === 'ADMIN' || L === 'ADMINISTRADOR' || L === 'GERENTE';
};

const formatDateTimeAR = (value) => {
  try {
    return new Date(value).toLocaleString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires'
    });
  } catch {
    return value ?? '';
  }
};

// Toast SweetAlert2
const toast = (title, icon = 'success') =>
  Swal.fire({
    title,
    icon,
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1800,
    timerProgressBar: true
  });

// ===================== Componente =====================
const QuejasInternasGet = () => {
  const { userLevel, userName } = useAuth(); // userName = email
  const [userSede, setUserSede] = useState('');
  const [userLevelCanon, setUserLevelCanon] = useState(toCanonical(userLevel));

  const [quejas, setQuejas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Controles UI
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('todos'); // todos | resueltas | pendientes
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [soloPropias, setSoloPropias] = useState(false);

  const [modalNewQueja, setModalNewQueja] = useState(false);
  const [selectedQueja, setSelectedQueja] = useState(null);
  const [modalUserDetails, setModalUserDetails] = useState(false);

  const { id } = useParams(); // para abrir detalle por URL

  // URL base (mover a .env si preferís)
  const API_BASE = 'http://localhost:8080';
  const URL = `${API_BASE}/quejas/`;

  // ===================== Cargar sede/level desde /users =====================
  useEffect(() => {
    if (!userName) return; // espera a tener el email

    const loadUserMeta = async () => {
      try {
        const { data: users } = await axios.get(`${API_BASE}/users`);
        const me = users?.find(
          (u) =>
            (u?.email || '').toLowerCase() === (userName || '').toLowerCase()
        );
        if (me?.level) setUserLevelCanon(toCanonical(me.level));
      } catch (err) {
        console.log('Error al leer /users:', err);
        setUserLevelCanon(toCanonical(userLevel));
      } finally {
        await obtenerQuejas(); // 👈 sin sede
      }
    };

    loadUserMeta();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userName]);

  // ===================== Obtener quejas (server filtra por headers) =====================
  const obtenerQuejas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(URL, {
        params: { userLevel, userName } // ✅ se envía por query
      });
      setQuejas(response.data || []);
    } catch (err) {
      console.error('Error al obtener las quejas:', err);
      setError('No se pudieron cargar las quejas. Intenta nuevamente.');
      Swal.fire('Ups...', 'No se pudieron cargar las quejas.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ===================== Obtener detalle si viene :id =====================
  useEffect(() => {
    const fetchQuejaDetails = async () => {
      try {
        const qs = new URLSearchParams({ userLevel, userName }).toString();
        const response = await fetch(`${URL}${id}?${qs}`);
        const data = await response.json();
        if (data) {
          setSelectedQueja(data);
          setModalUserDetails(true);
        }
      } catch (e) {
        console.error('Error al obtener los detalles de la queja:', e);
      }
    };
    if (id) fetchQuejaDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ===================== Acciones =====================
  const commonHeaders = {
    'Content-Type': 'application/json',
    'x-user-email': userName || '',
    'x-user-level': userLevel || '',
    'x-user-sede': userSede || ''
  };

  const userParams = { userLevel, userName };
  const userPayload = JSON.stringify({ userLevel, userName });

  const handleEliminarQueja = async (id) => {
    const confirm = await Swal.fire({
      title: '¿Eliminar queja?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444'
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${URL}${id}`, { params: userParams }); // ✅ query
      setQuejas((prev) => prev.filter((q) => q.id !== id));
      toast('Queja eliminada', 'success');
    } catch (err) {
      console.log(err);
      Swal.fire('Error', 'No se pudo eliminar la queja.', 'error');
    }
  };

  const handleEditarQueja = (queja) => {
    setSelectedQueja(queja);
    setModalNewQueja(true);
  };

  const handleResolverQueja = async (id) => {
    const confirm = await Swal.fire({
      title: 'Marcar como resuelta',
      text: '¿Confirmás que la queja está resuelta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, resolver',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#059669'
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${API_BASE}/quejas/${id}/resolver`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userLevel, userName, resuelto_por: userName }) // ✅ body
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        Swal.fire('Error', err.mensajeError || 'No se pudo resolver', 'error');
        return;
      }
      const text = await resp.text();
      if (text) {
        const data = JSON.parse(text);
        toast(data.message || 'Queja resuelta', 'success');
      } else {
        toast('Queja resuelta', 'success');
      }
      obtenerQuejas();
    } catch (e) {
      Swal.fire('Error', 'Ocurrió un problema en la petición.', 'error');
    }
  };

  const handleNoResueltoQueja = async (id) => {
    const confirm = await Swal.fire({
      title: 'Reabrir queja',
      text: 'La queja volverá a estado pendiente.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Reabrir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#111827'
    });
    if (!confirm.isConfirmed) return;

    try {
      const resp = await fetch(`${API_BASE}/quejas/${id}/no-resuelto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: userPayload // ✅ { userLevel, userName }
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        Swal.fire('Error', err.mensajeError || 'No se pudo reabrir', 'error');
        return;
      }
      toast('Queja reabierta', 'success');
      obtenerQuejas();
    } catch (e) {
      Swal.fire('Error', 'Ocurrió un problema en la petición.', 'error');
    }
  };

  const abrirModal = () => setModalNewQueja(true);
  const cerrarModal = () => {
    setModalNewQueja(false);
    setSelectedQueja(null);
    obtenerQuejas();
  };

  const copiar = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      toast('Copiado al portapapeles');
    } catch {
      Swal.fire('Atención', 'No se pudo copiar.', 'info');
    }
  };

  const abrirWhats = (numero) => {
    if (!numero) return;
    const limpio = String(numero).replace(/[^0-9]/g, '');
    const url = `https://wa.me/${limpio}`;
    window.open(url, '_blank');
  };

  // ===================== Filtros en UI (client-side extra) =====================
  const filtered = useMemo(() => {
    let data = [...(quejas || [])];

    // Solo propias (extra, además del filtrado del backend)
    if (soloPropias && !isCoordinator(userLevelCanon)) {
      data = data.filter(
        (d) =>
          (d.cargado_por || '').toLowerCase() === (userName || '').toLowerCase()
      );
    }

    // texto
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) => {
        return (
          (d.nombre || '').toLowerCase().includes(q) ||
          (d.tipo_usuario || '').toLowerCase().includes(q) ||
          (d.contacto || '').toLowerCase().includes(q) ||
          (d.motivo || '').toLowerCase().includes(q) ||
          (d.sede || '').toLowerCase().includes(q) ||
          String(d.id || '').includes(q)
        );
      });
    }
    // estado
    if (estadoFilter !== 'todos') {
      data = data.filter((d) =>
        estadoFilter === 'resueltas'
          ? Number(d.resuelto) === 1
          : Number(d.resuelto) !== 1
      );
    }
    // rango fechas (por campo fecha)
    if (fromDate) {
      const from = new Date(fromDate);
      data = data.filter((d) => new Date(d.fecha) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      data = data.filter((d) => new Date(d.fecha) <= to);
    }
    // orden desc por id
    data.sort((a, b) => (b?.id || 0) - (a?.id || 0));
    return data;
  }, [
    quejas,
    search,
    estadoFilter,
    fromDate,
    toDate,
    soloPropias,
    userLevelCanon,
    userName
  ]);

  // Stats
  const total = filtered.length;
  const resueltas = filtered.filter((d) => Number(d.resuelto) === 1).length;
  const pendientes = total - resueltas;

  // ===================== Paginación =====================
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, estadoFilter, fromDate, toDate, itemsPerPage, soloPropias]);

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const pageRecords = filtered.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(filtered.length / itemsPerPage) || 1;

  const prevPage = () => currentPage > 1 && setCurrentPage((p) => p - 1);
  const nextPage = () => currentPage < nPage && setCurrentPage((p) => p + 1);

  const sede2Barrio = {
    SanMiguelBN: 'Tucumán - Barrio Norte',
    smt: 'Tucumán - Barrio sur',
    SMT: 'Tucumán - Barrio sur',
    Concepción: 'Concepción'
  };
  // ===================== UI =====================
  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg min-h-screen py-8">
        <div className="mx-auto w-[98%] max-w-[1600px]">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/dashboard">
              <button className="inline-flex items-center gap-2 rounded-xl bg-[#fc4b08] px-4 py-2 text-sm font-medium text-white shadow hover:bg-orange-500 transition">
                <FaChevronLeft /> Volver
              </button>
            </Link>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-600">
              <FaInfoCircle />
              <span className="rounded-full bg-zinc-100 px-3 py-1">
                {isCoordinator(userLevelCanon)
                  ? 'Viendo: Todas las quejas (coordinador)'
                  : `Viendo: Mis quejas + QR-${toCanonical(userSede || '')}`}
              </span>
            </div>
          </div>

          {/* Card principal */}
          <div className="rounded-3xl border border-white/10 bg-white/95 shadow-[0_10px_40px_-10px_rgba(0,0,0,.25)] backdrop-blur-xl">
            {/* Top bar: título + acciones */}
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-zinc-100 p-6 md:flex-row md:items-center md:justify-between bg-white/90 backdrop-blur">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-800 font-bignoodle">
                  Quejas Internas
                </h1>
                <p className="text-xs text-zinc-500">
                  Total: <strong>{total}</strong> • Resueltas:{' '}
                  <strong className="text-emerald-600">{resueltas}</strong> •
                  Pendientes:{' '}
                  <strong className="text-red-600">{pendientes}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isCoordinator(userLevelCanon) && (
                  <button
                    onClick={() => setSoloPropias((s) => !s)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm shadow-sm border ${
                      soloPropias
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                    title="Filtrar únicamente mis quejas (además del alcance del backend)"
                  >
                    {soloPropias
                      ? 'Solo mis quejas'
                      : 'Todo dentro de mi alcance'}
                  </button>
                )}

                <button
                  onClick={() => obtenerQuejas(userSede)}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  title="Refrescar"
                >
                  <FaSyncAlt className="animate-spin-slow" /> Refrescar
                </button>
                <button
                  onClick={abrirModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
                >
                  <FaPlus /> Agregar Queja
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="grid grid-cols-1 gap-3 p-6 md:grid-cols-12">
              <div className="md:col-span-5">
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
                  <FaSearch className="shrink-0" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    type="text"
                    placeholder="Buscar por ID, nombre, motivo, contacto, sede..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="rounded-full p-1 text-zinc-500 hover:bg-zinc-100"
                      aria-label="Limpiar búsqueda"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              </div>

              <div className="md:col-span-3">
                <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2">
                  <select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="resueltas">Resueltas</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
              {/* Loading / Error / Empty */}
              <AnimatePresence initial={false}>
                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {/* skeleton rows */}
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 w-full animate-pulse rounded-xl bg-zinc-100"
                      />
                    ))}
                    <p className="mt-2 text-center text-sm text-zinc-500">
                      Cargando quejas...
                    </p>
                  </motion.div>
                )}

                {!loading && error && (
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

                {!loading && !error && filtered.length === 0 && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid place-items-center py-16"
                  >
                    <p className="text-sm text-zinc-500">
                      No hay quejas que coincidan con el filtro.
                    </p>
                    <button
                      onClick={abrirModal}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
                    >
                      <FaPlus /> Cargar nueva queja
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabla */}
              {!loading && !error && filtered.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-zinc-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-orange-600 text-white">
                      <tr>
                        <th className="px-3 py-3 text-left">ID</th>
                        <th className="px-3 py-3 text-left">Fecha</th>
                        <th className="px-3 py-3 text-left">Cargado por</th>
                        <th className="px-3 py-3 text-left">Nombre</th>
                        <th className="px-3 py-3 text-left">Tipo</th>
                        <th className="px-3 py-3 text-left">Contacto</th>
                        <th className="px-3 py-3 text-left">Motivo</th>
                        <th className="px-3 py-3 text-left">Sede</th>
                        <th className="px-3 py-3 text-left">Estado</th>
                        <th className="px-3 py-3 text-left">Detalle</th>
                        <th className="px-3 py-3 text-left">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 bg-white">
                      {pageRecords.map((queja) => {
                        const puedeEliminar = isCoordinator(userLevelCanon);
                        const puedeResolver =
                          isCoordinator(userLevelCanon) ||
                          (queja.cargado_por || '').toLowerCase() ===
                            (userName || '').toLowerCase();
                        return (
                          <tr key={queja.id} className="hover:bg-orange-500 ">
                            <td
                              className="px-3 py-3 font-medium text-zinc-800 cursor-pointer"
                              onClick={() => {
                                setSelectedQueja(queja);
                                setModalUserDetails(true);
                              }}
                            >
                              {queja.id}
                            </td>
                            <td
                              className="px-3 py-3 text-zinc-700 cursor-pointer"
                              onClick={() => {
                                setSelectedQueja(queja);
                                setModalUserDetails(true);
                              }}
                            >
                              {formatDateTimeAR(queja.fecha)}
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              {queja.cargado_por}
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              {queja.nombre}
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              {queja.tipo_usuario}
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              <div className="flex items-center gap-2">
                                <span>{queja.contacto}</span>
                                {queja.contacto && (
                                  <>
                                    <button
                                      onClick={() => abrirWhats(queja.contacto)}
                                      title="Abrir WhatsApp"
                                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                                    >
                                      <FaPhoneAlt />
                                    </button>
                                    <button
                                      onClick={() => copiar(queja.contacto)}
                                      title="Copiar contacto"
                                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:bg-zinc-50"
                                    >
                                      <FaCopy />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3 text-zinc-700 align-top">
                              <div
                                title={queja.motivo}
                                className="max-w-[360px] overflow-hidden break-words"
                                style={{ display: 'block' }}
                              >
                                {queja.motivo}
                              </div>
                            </td>

                            <td className="px-3 py-3 text-zinc-700 uppercase">
                              {sede2Barrio[queja?.sede] ?? queja?.sede ?? '-'}
                            </td>
                            <td className="px-3 py-3">
                              {Number(queja.resuelto) === 1 ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                                  <FaCheck /> Resuelto
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-zinc-700">
                              {Number(queja.resuelto) === 1 &&
                              queja.resuelto_por &&
                              queja.fecha_resuelto ? (
                                <div className="text-xs text-emerald-700">
                                  <div className="font-semibold">
                                    Por: {queja.resuelto_por}
                                  </div>
                                  <div className="opacity-80">
                                    {formatDateTimeAR(queja.fecha_resuelto)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-red-600">
                                  Sin resolver
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-2">
                                {puedeEliminar && (
                                  <button
                                    onClick={() =>
                                      handleEliminarQueja(queja.id)
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
                                    title="Eliminar queja"
                                  >
                                    <FaTrash /> Eliminar
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEditarQueja(queja)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600"
                                  title="Editar queja"
                                >
                                  <FaEdit /> Editar
                                </button>
                                {Number(queja.resuelto) !== 1 ? (
                                  <button
                                    disabled={!puedeResolver}
                                    onClick={() =>
                                      handleResolverQueja(queja.id)
                                    }
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                                      puedeResolver
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-emerald-300 cursor-not-allowed'
                                    }`}
                                    title={
                                      puedeResolver
                                        ? 'Marcar como resuelta'
                                        : 'No tenés permisos para resolver esta queja'
                                    }
                                  >
                                    <FaCheck /> Resolver
                                  </button>
                                ) : (
                                  <button
                                    disabled={!puedeResolver}
                                    onClick={() =>
                                      handleNoResueltoQueja(queja.id)
                                    }
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-white ${
                                      puedeResolver
                                        ? 'bg-zinc-700 hover:bg-zinc-800'
                                        : 'bg-zinc-300 cursor-not-allowed'
                                    }`}
                                    title={
                                      puedeResolver
                                        ? 'Marcar como no resuelta'
                                        : 'No tenés permisos'
                                    }
                                  >
                                    Reabrir
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginación */}
              {!loading && !error && filtered.length > 0 && (
                <div className="mt-6 flex flex-col items-center justify-between gap-3 md:flex-row">
                  <div className="flex items-center gap-2 text-xs text-zinc-600">
                    <span>Mostrando</span>
                    <select
                      className="rounded-lg border border-zinc-200 bg-white px-2 py-1"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>
                      de <strong>{filtered.length}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 disabled:opacity-40"
                    >
                      <FaChevronLeft /> Anterior
                    </button>
                    <span className="text-xs text-zinc-600">
                      Página <strong>{currentPage}</strong> de{' '}
                      <strong>{nPage}</strong>
                    </span>
                    <button
                      onClick={nextPage}
                      disabled={currentPage === nPage}
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

      {/* Modales */}
      <FormAltaQueja
        isOpen={modalNewQueja}
        onClose={cerrarModal}
        queja={selectedQueja}
        setSelectedQueja={setSelectedQueja}
        obtenerQuejas={() => obtenerQuejas(userSede)}
      />

      {selectedQueja && (
        <QuejasDetails
          queja={selectedQueja}
          setSelectedQueja={setSelectedQueja}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
        />
      )}

      <Footer />
    </>
  );
};

export default QuejasInternasGet;
