/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AdmConveGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
 * Estos datos llegan cuando se completa el formulario de FormAltaConve
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  FaArrowLeft,
  FaArchive,
  FaBoxOpen,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaEye,
  FaPlus,
  FaSearch,
  FaTrash
} from 'react-icons/fa';

import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaConve from '../../../components/Forms/FormAltaConve';
import { useAuth } from '../../../AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8080';
const URL = `${API_URL}/admconvenios/`;

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true
});

// Asegura que SweetAlert2 quede siempre arriba (soluciona el clásico “queda detrás del modal”)
const swalTop = (opts) =>
  Swal.fire({
    heightAuto: false,
    ...opts,
    didOpen: () => {
      const container = document.querySelector('.swal2-container');
      if (container) container.style.zIndex = '999999';
      opts?.didOpen?.();
    }
  });

const cx = (...classes) => classes.filter(Boolean).join(' ');

const Badge = ({ icon: Icon, children, tone = 'neutral' }) => {
  const toneCls =
    tone === 'orange'
      ? 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/20'
      : tone === 'green'
      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20'
      : tone === 'red'
      ? 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20'
      : tone === 'slate'
      ? 'bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/20'
      : 'bg-white/10 text-white/80 ring-1 ring-white/10';

  return (
    <span
      className={cx(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur',
        toneCls
      )}
    >
      {Icon ? <Icon className="opacity-90" /> : null}
      <span className="truncate">{children}</span>
    </span>
  );
};

const IconBtn = ({ title, onClick, className, children }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cx(
      'inline-flex h-9 w-9 items-center justify-center rounded-xl transition',
      'bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20',
      'text-white/80 hover:text-white',
      className
    )}
  >
    {children}
  </button>
);

const SkeletonCard = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
    <div className="h-5 w-2/3 rounded bg-white/10" />
    <div className="mt-3 flex flex-wrap gap-2">
      <div className="h-7 w-24 rounded-full bg-white/10" />
      <div className="h-7 w-28 rounded-full bg-white/10" />
      <div className="h-7 w-20 rounded-full bg-white/10" />
    </div>
    <div className="mt-5 h-10 w-full rounded-xl bg-white/10" />
  </div>
);

const AdmConveGet = () => {
  // Estado para almacenar la lista de personas
  const [conve, setConve] = useState([]);
  const [modalNewConve, setmodalNewConve] = useState(false);
  const [conveArchivados, setConveArchivados] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [selectedConve2, setSelectedConve2] = useState(null);

  // estado para obtener el nombre y el email del instructor
  const [nombreInstructor, setNombreInstructor] = useState('');
  const [sede, setSede] = useState('');

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');
  const [filterSede, setFilterSede] = useState(
    () => sessionStorage.getItem('admConveFilterSede') || ''
  );

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Hook para navegación
  const { userName, userLevel } = useAuth();

  const isAdmin = userLevel === 'admin' || userLevel === 'administrador';

  const norm = (v = '') =>
    String(v || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const normalizeSede = (s) => {
    const x = norm(s);
    if (x === 'monteros') return 'Monteros';
    if (x === 'concepcion') return 'Concepción';
    if (x === 'smt') return 'SMT';
    if (x === 'multisede') return 'Multisede';
    // Respeta lo que venga si ya es “presentable”
    return s;
  };

  const abrirModal = () => {
    setmodalNewConve(true);
    setSelectedConve2(null);
  };

  const cerarModal = () => {
    setmodalNewConve(false);
    // recargar manteniendo sede del usuario cuando aplique
    obtenerConves(sede, true);
  };

  const handleVerIntegrantes = (id) => {
    navigate(`/dashboard/integrantes?id_conv=${id}`);
  };

  const obtenerConves = async (sedeParam, mantenerFiltro = false) => {
    try {
      setLoading(true);
      const response = await axios.get(URL);
      const convenios = response.data || [];
      const conveniosActivos = convenios.filter(
        (c) => Number(c.archivado) === 1
      );

      if (isAdmin) {
        setConve(conveniosActivos);
        if (!mantenerFiltro) setFilterSede('');
      } else {
        // Solo convenios de la sede del usuario o Multisede
        const userSedeNormalized = normalizeSede(sedeParam);

        setConve(
          conveniosActivos.filter(
            (c) =>
              c.sede &&
              (normalizeSede(c.sede) === userSedeNormalized ||
                normalizeSede(c.sede) === 'Multisede')
          )
        );

        // Dejar marcado el filtro del usuario, salvo que quieras explícitamente resetearlo
        if (!mantenerFiltro) setFilterSede(`sede:${userSedeNormalized}`);
      }
    } catch (error) {
      console.log('Error al obtener los convenios:', error);
      Toast.fire({ icon: 'error', title: 'Error al cargar convenios' });
    } finally {
      setLoading(false);
    }
  };

  const obtenerConvesArchivados = async () => {
    try {
      setLoading(true);
      const response = await axios.get(URL);
      const convenios = response.data || [];

      // Filtrar los convenios archivados (archivado = 0)
      const conveniosArchivados = convenios.filter(
        (c) => Number(c.archivado) === 0
      );
      setConveArchivados(conveniosArchivados);
    } catch (error) {
      console.log('Error al obtener los convenios archivados:', error);
      Toast.fire({ icon: 'error', title: 'Error al cargar archivados' });
    } finally {
      setLoading(false);
    }
  };

  const obtenerSedes = async (mantenerFiltro = false) => {
    try {
      const response = await axios.get(`${API_URL}/sedes`);
      const sedesResp = response.data || [];

      // 🔥 Filtrar solo las sedes activas (estado === 'activo')
      const sedesActivas = sedesResp.filter((s) => s.estado === 'activo');

      if (!mantenerFiltro) setFilterSede('');
      setSedes(sedesActivas);
    } catch (error) {
      console.log('Error al obtener las sedes:', error);
    }
  };

  useEffect(() => {
    obtenerSedes(true);
  }, []);

  useEffect(() => {
    const getUserIdByEmail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/users/`);
        if (!response.ok) {
          throw new Error(
            `Error al obtener los usuarios: ${response.statusText}`
          );
        }
        const users = await response.json();

        // Buscar el usuario por email
        const user = users.find((u) => u.email === userName);

        if (user) {
          // En tu modelo real es "nombre" (dejamos fallback por compatibilidad)
          setNombreInstructor(user.nombre || user.name || '');
          setSede(user.sede || '');

          obtenerConves(user.sede, true);
        } else {
          console.log(`Usuario con email ${userName} no encontrado`);
          // En caso raro: cargar igual sin filtro
          obtenerConves('', true);
        }
      } catch (err) {
        console.log(`Error al obtener el usuario: ${err.message}`);
        // Fallback: cargar igual
        obtenerConves('', true);
      } finally {
        setLoading(false);
      }
    };

    getUserIdByEmail();
  }, [userName, userLevel]); // Se ejecuta cuando cambian userName o userLevel

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (e) => {
    const newValue = e.target.value;

    // Si viene como "sede:XXX" o "agrupador:YYY", lo respetamos.
    // Si viene plano, lo normalizamos.
    const value = newValue.includes(':') ? newValue : normalizeSede(newValue);
    setFilterSede(value);
    sessionStorage.setItem('admConveFilterSede', value);
  };

  useEffect(() => {
    if (filterSede === 'Archivados') {
      obtenerConvesArchivados(); // Carga solo si el filtro es 'archivados'
    }
  }, [filterSede]);

  const searcher = (e) => setSearch(e.target.value);

  let results = [];
  if (!search) {
    results = conve;
  } else {
    results = conve.filter((dato) => {
      const nameMatch = String(dato.nameConve || '')
        .toLowerCase()
        .includes(search.toLowerCase());
      return nameMatch;
    });
  }

  const filteredArchivados = useMemo(() => {
    return (conveArchivados || []).filter((c) =>
      String(c.nameConve || '')
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [conveArchivados, search]);

  const mostrarResultados = useMemo(() => {
    if (
      !filterSede ||
      filterSede === '' ||
      filterSede === 'Selecciona un convenio'
    ) {
      // Principal: solo sin agrupador
      return results.filter((c) => !c.agrupador || c.agrupador.trim() === '');
    }
    if (filterSede === 'Archivados') {
      return filteredArchivados;
    }

    // Nuevo: distinguir filtro por sede o agrupador
    const [tipo, valor] = filterSede.split(':');

    if (tipo === 'sede') {
      // Convenios sin agrupador y con sede = valor
      return results.filter(
        (c) =>
          (!c.agrupador || c.agrupador.trim() === '') &&
          String(c.sede || '')
            .trim()
            .toLowerCase() ===
            String(valor || '')
              .trim()
              .toLowerCase()
      );
    }
    if (tipo === 'agrupador') {
      // Convenios con agrupador = valor
      return results.filter(
        (c) =>
          String(c.agrupador || '')
            .trim()
            .toLowerCase() ===
          String(valor || '')
            .trim()
            .toLowerCase()
      );
    }
    return [];
  }, [results, filterSede, filteredArchivados]);

  // Ordenar decreciente por id (se ve “pro” y consistente)
  const sortedMostrarResultados = useMemo(() => {
    return [...(mostrarResultados || [])].sort(
      (a, b) => Number(b.id) - Number(a.id)
    );
  }, [mostrarResultados]);

  // Paginación real (antes estaba pero no se usaba en el render)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterSede]);

  const totalItems = sortedMostrarResultados.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return sortedMostrarResultados.slice(start, start + itemsPerPage);
  }, [sortedMostrarResultados, safePage]);

  const prevPage = () => safePage > 1 && setCurrentPage(safePage - 1);
  const nextPage = () => safePage < totalPages && setCurrentPage(safePage + 1);

  const handleEditarConve = (c) => {
    // (NUEVO)
    setSelectedConve2(c);
    setmodalNewConve(true);
  };

  const handleEliminarConve = async (id) => {
    const r = await swalTop({
      title: 'Eliminar convenio',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e11d48'
    });

    if (!r.isConfirmed) return;

    try {
      await fetch(`${URL}${id}`, { method: 'DELETE' });
      setConve((prev) => prev.filter((x) => x.id !== id));
      Toast.fire({ icon: 'success', title: 'Convenio eliminado' });
    } catch (error) {
      console.log(error);
      Toast.fire({ icon: 'error', title: 'No se pudo eliminar' });
    }
  };

  const handleArchivarConve = async (id) => {
    try {
      await axios.put(`${URL}${id}`, { archivado: 0 }); // Cambia a 0 = archivado
      Toast.fire({ icon: 'success', title: 'Convenio archivado' });
      obtenerConves(sede, true); // ✅ No resetea el filtro actual
    } catch (error) {
      console.error('Error al archivar el convenio:', error);
      Toast.fire({ icon: 'error', title: 'Error al archivar' });
    }
  };

  const handleDesarchivarConve = async (id) => {
    try {
      await axios.put(`${URL}${id}`, { archivado: 1 }); // Cambia a 1 = activo
      Toast.fire({ icon: 'success', title: 'Convenio desarchivado' });
      obtenerConvesArchivados();
      obtenerConves(sede, true); // ✅ No resetea el filtro actual
    } catch (error) {
      console.error('Error al desarchivar el convenio:', error);
      Toast.fire({ icon: 'error', title: 'Error al desarchivar' });
    }
  };

  // SEDES únicas activas (desde /sedes)
  const sedesUnicas = useMemo(() => sedes.map((s) => s.nombre), [sedes]);

  const sedesConConveniosSinAgrupador = useMemo(() => {
    return sedesUnicas.filter((s) =>
      results.some(
        (c) =>
          (!c.agrupador || c.agrupador.trim() === '') &&
          norm(c.sede) === norm(s)
      )
    );
  }, [sedesUnicas, results]);

  // AGRUPADORES únicos de los convenios (desde convenios)
  const agrupadoresUnicos = useMemo(() => {
    return Array.from(
      new Set(
        results
          .map((c) => (c.agrupador && c.agrupador.trim()) || '')
          .filter((a) => a && a !== '')
      )
    );
  }, [results]);

  const headerSubtitle = isAdmin
    ? 'Gestión completa de convenios, filtros avanzados y acciones rápidas.'
    : 'Visualizá los convenios disponibles para tu sede y Multisede.';

  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg min-h-screen">
        {/* Fondo premium sutil (sin romper tu dashboardbg) */}
        <div className="pointer-events-none fixed inset-0 opacity-60">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[90px]" />
          <div className="absolute -bottom-28 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[110px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          {/* HERO / HEADER */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className={cx(
              'rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl',
              'shadow-[0_22px_70px_rgba(0,0,0,0.42)] overflow-hidden'
            )}
          >
            <div className="relative px-5 sm:px-7 py-6 sm:py-7">
              <div className="absolute inset-0 opacity-70">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/0 to-white/0" />
                <div className="absolute -top-24 right-[-120px] h-64 w-64 rounded-full bg-orange-500/10 blur-[70px]" />
              </div>

              <div className="relative flex flex-col gap-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Link
                      to="/dashboard"
                      className={cx(
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-2',
                        'bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20',
                        'text-white/85 hover:text-white transition'
                      )}
                    >
                      <FaArrowLeft />
                      <span className="text-sm font-semibold">Volver</span>
                    </Link>

                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="font-bignoodle text-xl sm:text-4xl font-extrabold tracking-tight text-orange-600">
                          Convenios
                        </h1>
                        {/* <Badge icon={FaBuilding} tone="orange">
                          {filterSede === 'Archivados'
                            ? 'Archivados'
                            : 'Activos'}
                        </Badge>
                        <Badge tone="neutral">
                          Total:{' '}
                          <span className="text-white font-semibold">
                            {totalItems}
                          </span>
                        </Badge>
                        {isAdmin ? (
                          <Badge tone="slate">Rol: Administrador</Badge>
                        ) : (
                          <Badge tone="slate">
                            Sede: {normalizeSede(sede) || '—'}
                          </Badge>
                        )} */}
                      </div>
                      {/* <p className="mt-1 text-sm text-white/60 max-w-2xl">
                        {headerSubtitle}
                      </p> */}

                      {/* mini info contextual */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge tone="neutral">
                          Mostrando{' '}
                          <span className="text-white font-semibold">
                            {pageItems.length}
                          </span>{' '}
                          de{' '}
                          <span className="text-white font-semibold">
                            {totalItems}
                          </span>
                        </Badge>
                        {/* {!!nombreInstructor && (
                          <Badge tone="neutral">
                            Usuario:{' '}
                            <span className="text-white/90">
                              {nombreInstructor}
                            </span>
                          </Badge>
                        )} */}
                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas (solo admin) */}
                  {
                    /* userLevel === 'gerente' || */
                    /* userLevel === 'vendedor' || */
                    /* userLevel === 'convenio' || Se elimina la visualizacion para que  la persona que entre con este rol no pueda crear un convenio*/
                    /* Unicos roles que pueden dar Alta un nuevo convenio */
                    isAdmin && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={abrirModal}
                          className={cx(
                            'inline-flex items-center gap-2 rounded-2xl px-5 py-3',
                            'bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950',
                            'font-extrabold shadow-[0_14px_30px_rgba(16,185,129,0.25)] transition'
                          )}
                        >
                          <FaPlus />
                          Nuevo Convenio
                        </button>
                      </div>
                    )
                  }
                </div>

                {/* CONTROLES: Buscar + Filtro */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-3 sm:gap-4">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      value={search}
                      onChange={searcher}
                      type="text"
                      placeholder="Buscar convenio por nombre…"
                      className={cx(
                        'w-full rounded-2xl pl-11 pr-4 py-3',
                        'bg-white/5 text-white placeholder:text-white/35',
                        'ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none',
                        'transition'
                      )}
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={filterSede}
                      onChange={handleFilterSedeChange}
                      className={cx(
                        'w-full rounded-2xl px-4 py-3',
                        'bg-white/5 text-white',
                        'ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none',
                        'transition'
                      )}
                    >
                      {isAdmin && (
                        <option className="bg-zinc-950 text-white" value="">
                          Selecciona un convenio
                        </option>
                      )}

                      <optgroup
                        className="bg-zinc-950 text-white"
                        label="Sedes"
                      >
                        {sedesConConveniosSinAgrupador.map((s) => (
                          <option
                            key={s}
                            value={`sede:${s}`}
                            className="bg-zinc-950 text-white"
                          >
                            {s}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup
                        className="bg-zinc-950 text-white"
                        label="Agrupadores"
                      >
                        {agrupadoresUnicos.map((a) => (
                          <option
                            key={a}
                            value={`agrupador:${a}`}
                            className="bg-zinc-950 text-white"
                          >
                            {a}
                          </option>
                        ))}
                      </optgroup>

                      <option
                        className="bg-zinc-950 text-white"
                        value="Archivados"
                      >
                        Archivados
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* LISTADO */}
          <div className="mt-7">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : totalItems === 0 ? (
              <div
                className={cx(
                  'rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl',
                  'p-10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.35)]'
                )}
              >
                <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center text-white/70">
                  <FaBoxOpen size={22} />
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  Sin resultados
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  No encontramos convenios con los filtros actuales. Probá
                  cambiando sede/agrupador o limpiando el buscador.
                </p>

                {isAdmin && (
                  <button
                    onClick={abrirModal}
                    className={cx(
                      'mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3',
                      'bg-orange-500 hover:bg-orange-400 text-white font-extrabold transition'
                    )}
                  >
                    <FaPlus />
                    Crear el primer convenio
                  </button>
                )}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence>
                    {pageItems.map((c) => {
                      const archivado = Number(c.archivado) === 0;
                      const sedeLabel = c.sede || '—';
                      const agrupadorLabel = c.agrupador?.trim()
                        ? c.agrupador
                        : 'Sin agrupador';

                      return (
                        <motion.div
                          key={c.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          whileHover={{ y: -4 }}
                          transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 22
                          }}
                          className={cx(
                            'group relative overflow-hidden rounded-3xl',
                            'border border-white/10 bg-white/[0.05] backdrop-blur-xl',
                            'shadow-[0_18px_55px_rgba(0,0,0,0.35)]'
                          )}
                        >
                          {/* overlay hover */}
                          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute -top-24 -right-24 h-60 w-60 rounded-full bg-orange-500/12 blur-[70px]" />
                            <div className="absolute -bottom-24 -left-24 h-60 w-60 rounded-full bg-emerald-500/10 blur-[80px]" />
                          </div>

                          <div className="relative p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h2 className="text-base font-extrabold text-white truncate">
                                    {c.nameConve}
                                  </h2>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {isAdmin && (
                                    <Badge icon={FaBuilding} tone="neutral">
                                      {sedeLabel}
                                    </Badge>
                                  )}

                                  {isAdmin && (
                                    <Badge tone="neutral">
                                      {agrupadorLabel}
                                    </Badge>
                                  )}

                                  <Badge tone={archivado ? 'slate' : 'green'}>
                                    {archivado ? 'Archivado' : 'Activo'}
                                  </Badge>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isAdmin && (
                                  <>
                                    {/* Mostrar Eliminar y Editar solo si NO está archivado */}
                                    {!archivado && (
                                      <>
                                        <IconBtn
                                          title="Editar"
                                          onClick={() => handleEditarConve(c)}
                                          className="hover:bg-yellow-500/15"
                                        >
                                          <FaEdit />
                                        </IconBtn>

                                        <IconBtn
                                          title="Eliminar"
                                          onClick={() =>
                                            handleEliminarConve(c.id)
                                          }
                                          className="hover:bg-rose-500/15"
                                        >
                                          <FaTrash />
                                        </IconBtn>
                                      </>
                                    )}

                                    {/* Mostrar botón de Archivar o Desarchivar según el filtro actual */}
                                    {filterSede === 'Archivados' ? (
                                      <IconBtn
                                        title="Desarchivar"
                                        onClick={() =>
                                          handleDesarchivarConve(c.id)
                                        }
                                        className="hover:bg-emerald-500/15"
                                      >
                                        <FaBoxOpen />
                                      </IconBtn>
                                    ) : (
                                      <IconBtn
                                        title="Archivar"
                                        onClick={() =>
                                          handleArchivarConve(c.id)
                                        }
                                        className="hover:bg-slate-500/15"
                                      >
                                        <FaArchive />
                                      </IconBtn>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="mt-5">
                              <Link
                                to={`/dashboard/admconvenios/${c.id}/integrantes/`}
                                className={cx(
                                  'inline-flex w-full items-center justify-center gap-2',
                                  'rounded-2xl px-4 py-3 font-extrabold',
                                  'bg-[#fc4b08] hover:bg-orange-500 text-white transition',
                                  'shadow-[0_16px_35px_rgba(252,75,8,0.25)]'
                                )}
                              >
                                <FaEye />
                                Ver Integrantes
                              </Link>
                              <div className="mt-3 flex items-center justify-between text-xs text-white/45">
                                <span>ID #{c.id}</span>
                                <span className="truncate">
                                  {isAdmin
                                    ? `Sede: ${sedeLabel}`
                                    : 'Disponible'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>

                {/* PAGINACIÓN */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-sm text-white/55">
                    Página{' '}
                    <span className="text-white font-semibold">{safePage}</span>{' '}
                    de{' '}
                    <span className="text-white font-semibold">
                      {totalPages}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={prevPage}
                      disabled={safePage <= 1}
                      className={cx(
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold transition',
                        safePage <= 1
                          ? 'bg-white/5 text-white/30 ring-1 ring-white/10 cursor-not-allowed'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white ring-1 ring-white/10 hover:ring-white/20'
                      )}
                    >
                      <FaChevronLeft />
                      Anterior
                    </button>

                    <button
                      onClick={nextPage}
                      disabled={safePage >= totalPages}
                      className={cx(
                        'inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold transition',
                        safePage >= totalPages
                          ? 'bg-white/5 text-white/30 ring-1 ring-white/10 cursor-not-allowed'
                          : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white ring-1 ring-white/10 hover:ring-white/20'
                      )}
                    >
                      Siguiente
                      <FaChevronRight />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaConve
            isOpen={modalNewConve}
            onClose={cerarModal}
            conve2={selectedConve2}
            setConve2={setConve}
          />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdmConveGet;
