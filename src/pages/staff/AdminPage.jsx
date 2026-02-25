// src/Pages/AdminPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NavbarStaff from './NavbarStaff';
import '../../styles/staff/dashboard.css';
import '../../styles/staff/background.css';
import Footer from '../../components/footer/Footer';
import TituloPreguntasModal from './MetodsGet/TituloPreguntasModal';
import PreguntaDetalleModal from './MetodsGet/PreguntaDetalleModal';
import { useAuth } from '../../AuthContext';
import { toast } from 'react-toastify';
import ModalTareasDiarias from './ModalTareasDiarias';
import { motion } from 'framer-motion';
import CardRecaptacion from './Components/CardRecaptacion';
import BadgeAgendaVentas from './MetodsGet/Details/BadgeAgendaVentas';
import BadgeAgendaVentasRemarketing from './MetodsGet/Details/BadgeAgendaVentasRemarketing';
// Benjamin Orellana 22-12-2025 se adiciona badge de agenda convenios
import BadgeAgendaConvenios from './MetodsGet/Details/BadgeAgendaConvenios';
import ConveniosAccionesInboxModal from './MetodsGet/Details/ConveniosAccionesInboxModal';

import {
  MessageCircle,
  Megaphone,
  Users,
  BarChart2,
  ClipboardList,
  FileText,
  ShoppingBag,
  Image as ImageIcon,
  Activity,
  HelpCircle,
  Dumbbell,
  Target
} from 'lucide-react';

// ---------- Tile genérico ----------
const DashboardTile = ({
  title,
  description,
  to,
  onClick,
  icon: Icon,
  delay = 0,
  badgeSlot,
  children
}) => {
  const Wrapper = to ? Link : 'button';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay }}
      className="relative w-full"
    >
      <Wrapper
        to={to}
        onClick={onClick}
        className="group block h-full w-full text-left focus:outline-none"
        type={to ? undefined : 'button'}
      >
        <div className="relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_rgba(15,23,42,0.2)]">
          {/* halo suave */}
          <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-500/6 via-pink-500/6 to-emerald-400/6" />

          <div className="relative z-10 p-5 flex flex-col gap-3 h-full">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                )}
                <h3 className="font-bignoodle text-xl tracking-wide text-slate-900 group-hover:text-slate-900">
                  {title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {badgeSlot ? (
                  <div className="scale-90 md:scale-100">{badgeSlot}</div>
                ) : (
                  <span className="text-[11px] uppercase tracking-widest text-slate-400">
                    Abrir
                  </span>
                )}
              </div>
            </div>

            {description && (
              <p className="text-xs text-slate-500 leading-snug">
                {description}
              </p>
            )}

            {children && <div className="mt-2">{children}</div>}
          </div>
        </div>
      </Wrapper>
    </motion.div>
  );
};

const AdminPage = () => {
  const [modalPreguntasOpen, setModalPreguntasOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [preguntas, setPreguntas] = useState([]);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const [modalTareasOpen, setModalTareasOpen] = useState(false);
  const [tareasDiarias, setTareasDiarias] = useState([]);

  const URL = 'http://localhost:8080/ask/';
  const URL_TAREAS = 'http://localhost:8080/tareasdiarias';
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const [modalConveniosInboxOpen, setModalConveniosInboxOpen] = useState(false);
  const [conveniosPendientes, setConveniosPendientes] = useState([]);
  const [conveniosPendientesLoading, setConveniosPendientesLoading] =
    useState(false);

  const [tareasLoaded, setTareasLoaded] = useState(false);
  const [autoOpenedConveniosInbox, setAutoOpenedConveniosInbox] =
    useState(false);

  const { userId, userLevel, userName, nomyape } = useAuth();
  const navigate = useNavigate();

  const now = new Date();
  const mesActual = now.getMonth() + 1;
  const anioActual = now.getFullYear();

  // ---------- Normalización de roles ----------
  const nivel = String(userLevel || '').toLowerCase();
  const isAdmin =
    nivel === 'admin' || nivel === 'administrador' || nivel === 'gerente';
  const isVendedor = nivel === 'vendedor';
  const isInstructor = nivel === 'instructor';
  const isImagenes = nivel === 'imagenes';

  const nivelLabel =
    nivel === 'admin' || nivel === 'administrador'
      ? 'Administrador'
      : nivel === 'gerente'
      ? 'Gerente'
      : nivel === 'vendedor'
      ? 'Vendedor'
      : nivel === 'instructor'
      ? 'Instructor'
      : nivel === 'imagenes'
      ? 'Módulo Imágenes'
      : 'Staff';

  // ---------- Nombre bonito en el saludo ----------
  const displayName = useMemo(() => {
    if (nomyape && nomyape.trim() !== '') {
      return nomyape.trim();
    }

    if (!userName) return '';

    if (!userName.includes('@')) {
      const clean = userName.toLowerCase();
      return clean
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    const localPart = userName.split('@')[0];
    const withoutNumbers = localPart.replace(/\d+$/, '');
    const clean = withoutNumbers.toLowerCase().replace(/[._]/g, ' ');

    return clean
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }, [userName, nomyape]);

  // ---------- FAQs ----------
  const abrirModalPreguntas = async () => {
    try {
      const response = await axios.get(URL);
      if (response.status === 200 && response.data) {
        setPreguntas(response.data);
        setModalPreguntasOpen(true);
      } else {
        toast.error('No se pudieron cargar las preguntas. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al obtener las preguntas:', error);
      toast.error('Ocurrió un problema al obtener las preguntas.');
    }
  };

  const cerrarModalPreguntas = () => setModalPreguntasOpen(false);

  const abrirModalDetalle = (pregunta) => {
    setPreguntaSeleccionada(pregunta);
    setModalDetalleOpen(true);
  };

  const cerrarModalDetalle = () => setModalDetalleOpen(false);

  const cerrarModalTareas = () => setModalTareasOpen(false);

  const handleButtonClickInstructores = () => {
    navigate('/dashboard/instructores');
  };

  // ---------- Loading de sesión ----------
  if (!userLevel) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center bg-slate-950 text-slate-100">
        <p className="text-lg font-semibold">Cargando sesión...</p>
        <p className="text-sm text-slate-400 mt-2">
          Si esto tarda demasiado, recargá la página.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition"
        >
          Recargar
        </button>
        <p className="text-xs text-slate-500 mt-3">
          Si el problema continúa, contactá a{' '}
          <span className="font-semibold text-orange-400">SoftFusion</span>.
        </p>
      </div>
    );
  }

  // ---------- Tareas diarias (modal automático) ----------
  useEffect(() => {
    const fetchTareasDiarias = async () => {
      try {
        const response = await axios.get(`${URL_TAREAS}?userId=${userId}`);
        setTareasDiarias(response.data);

        if (response.data.length > 0) {
          setTimeout(() => {
            setModalTareasOpen(true);
          }, 1700);
        }
      } catch (error) {
        console.error('Error al obtener tareas diarias:', error);
      } finally {
        setTareasLoaded(true);
      }
    };

    if (userId) {
      fetchTareasDiarias();
    }
  }, [userId]);

  const loadConveniosPendientes = async () => {
    setConveniosPendientesLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set('leido', '0');
      qs.set('limit', '200');
      qs.set('offset', '0');

      const { data } = await axios.get(
        `${API_URL}/convenios-mes-acciones?${qs.toString()}`
      );

      const regs = Array.isArray(data?.registros)
        ? data.registros
        : Array.isArray(data)
        ? data
        : [];
      setConveniosPendientes(regs);
    } catch (e) {
      console.error('Error loadConveniosPendientes:', e);
      setConveniosPendientes([]);
    } finally {
      setConveniosPendientesLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    loadConveniosPendientes();

    const onUpdate = () => loadConveniosPendientes();
    window.addEventListener('convenios-mes-acciones-updated', onUpdate);

    const id = setInterval(loadConveniosPendientes, 60_000);

    return () => {
      clearInterval(id);
      window.removeEventListener('convenios-mes-acciones-updated', onUpdate);
    };
  }, [userId, userLevel]);

  useEffect(() => {
    if (autoOpenedConveniosInbox) return;
    if (!tareasLoaded) return;

    // Si hay tareas abiertas, esperamos a que se cierre.
    if (modalTareasOpen) return;

    if (conveniosPendientes.length > 0) {
      setAutoOpenedConveniosInbox(true);
      setTimeout(() => setModalConveniosInboxOpen(true), 650);
    }
  }, [
    isAdmin,
    tareasLoaded,
    modalTareasOpen,
    conveniosPendientes.length,
    autoOpenedConveniosInbox
  ]);

  const safeJson = (s) => {
    try {
      if (!s) return null;
      if (typeof s === 'object') return s;
      return JSON.parse(String(s));
    } catch {
      return null;
    }
  };

  const getTipoAccion = (it) =>
    String(it?.tipo ?? it?.accion_tipo ?? '').trim();

  const getMetaAccion = (it) => safeJson(it?.meta_json ?? it?.metadata_json);

  const marcarChatLeido = async (item) => {
    const tipo = getTipoAccion(item);
    if (tipo !== 'CHAT_MENSAJE') return;

    const meta = getMetaAccion(item);
    const lastMessageId = Number(meta?.last_message_id || 0);
    if (!lastMessageId) return;

    // Registrar lectura del último mensaje (idempotente por UNIQUE)
    await axios.post(
      `${API_URL}/convenio-chat/messages/${lastMessageId}/read`,
      {
        // Enviamos ambas convenciones para compatibilidad con tu backend
        reader_user_id: userId,
        reader_user_name: nomyape,
        user_id: userId,
        user_name: nomyape
      }
    );
  };

  const marcarAccionLeida = async (item) => {
    try {
      // 1) Si es chat, registrar lectura del último mensaje
      await marcarChatLeido(item);

      // 2) Marcar leída la acción mensual
      await axios.patch(`${API_URL}/convenios-mes-acciones/${item.id}/leido`, {
        user_id: userId,
        user_name: nomyape
      });

      setConveniosPendientes((prev) => prev.filter((x) => x.id !== item.id));
      window.dispatchEvent(new Event('convenios-mes-acciones-updated'));
    } catch (e) {
      console.error('marcarAccionLeida error:', e);
    }
  };

  const marcarTodasLeidas = async () => {
    if (!conveniosPendientes.length) return;

    try {
      const results = await Promise.all(
        conveniosPendientes.map(async (it) => {
          try {
            await marcarChatLeido(it);

            await axios.patch(
              `${API_URL}/convenios-mes-acciones/${it.id}/leido`,
              {
                user_id: userId,
                user_name: nomyape
              }
            );

            return { id: it.id, ok: true };
          } catch (err) {
            console.error('marcarTodasLeidas item error:', it?.id, err);
            return { id: it.id, ok: false };
          }
        })
      );

      const okIds = new Set(results.filter((r) => r.ok).map((r) => r.id));
      setConveniosPendientes((prev) => prev.filter((x) => !okIds.has(x.id)));

      window.dispatchEvent(new Event('convenios-mes-acciones-updated'));
    } catch (e) {
      console.error('marcarTodasLeidas error:', e);
    }
  };

  return (
    <>
      <NavbarStaff />

      {/* CONTENEDOR PRINCIPAL */}
      <section className="relative w-full min-h-[calc(100vh-80px)]">
        <div className="dashboardbg min-h-[calc(100vh-80px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
            {/* ENCABEZADO */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bignoodle tracking-[.18em] uppercase text-white"
                >
                  Panel del Staff
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="mt-1 text-sm text-slate-200/80 max-w-xl"
                >
                  Hola
                  {displayName ? (
                    <>
                      {' '}
                      <span className="font-semibold">{displayName}</span>
                    </>
                  ) : (
                    ''
                  )}
                  , elegí una sección para gestionar el día a día del gimnasio.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md">
                  <p className="text-[11px] uppercase tracking-wide text-slate-200/70">
                    Rol actual
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {nivelLabel}
                  </p>
                </div>
                {conveniosPendientes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModalConveniosInboxOpen(true)}
                    className="relative rounded-2xl border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-md
               hover:bg-white/15 transition text-left"
                    title="Ver pendientes de convenios"
                  >
                    <p className="text-[11px] uppercase tracking-wide text-slate-200/70">
                      Pendientes Convenios
                    </p>
                    <p className="text-sm font-semibold text-white">
                      {conveniosPendientes.length}
                    </p>
                  </button>
                )}
              </motion.div>
            </div>

            {/* --- GRID PRINCIPAL: columnas visibles dinámicas --- */}
            {(() => {
              const showForo = isAdmin || isVendedor;
              const showConvenios = isAdmin || isVendedor;
              const showQuejas = !isImagenes;
              const showPilates = (isAdmin || isVendedor) && !isImagenes;
              const showGestion =
                showForo || showConvenios || showQuejas || showPilates;

              const showVentas = (isAdmin || isVendedor) && !isImagenes;
              const showLeads = isAdmin || isVendedor;
              const showRecaptacion = (isAdmin || isVendedor) && !isImagenes;
              const showRemarketing = (isAdmin || isVendedor) && !isImagenes;
              const showContactos =
                showVentas || showLeads || showRecaptacion || showRemarketing;

              const showPreguntale = true;
              const showInstructores = isAdmin || isInstructor;
              const showEstadisticas = isAdmin || isInstructor;
              const showImagenesTile = isImagenes;
              const showOtros =
                showPreguntale ||
                showInstructores ||
                showEstadisticas ||
                showImagenesTile;

              const visibleCols = [
                showGestion,
                showContactos,
                showOtros
              ].filter(Boolean).length;
              const lgColsClass =
                visibleCols === 3
                  ? 'lg:grid-cols-3'
                  : visibleCols === 2
                  ? 'lg:grid-cols-2'
                  : 'lg:grid-cols-1';

              return (
                <div
                  className={`grid grid-cols-1 ${lgColsClass} gap-8 items-start`}
                >
                  {/* === COLUMNA 1: GESTIÓN === */}
                  {showGestion && (
                    <div className="flex flex-col gap-5 w-full">
                      <div className="pb-2 border-b border-orange-500/30 mb-2">
                        <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                          GESTIÓN
                        </h2>
                        <p className="text-xs text-slate-300  font-semibold">
                          Administración y novedades
                        </p>
                      </div>

                      {showForo && (
                        <DashboardTile
                          title="Foro de Novedades"
                          description="Publicá y revisá novedades internas para todo el equipo."
                          to="/dashboard/novedades"
                          icon={Megaphone}
                          delay={0.1}
                        />
                      )}

                      {showConvenios && (
                        <DashboardTile
                          title="Convenios"
                          description="Seguimiento de convenios activos y beneficios asociados."
                          to="/dashboard/admconvenios"
                          icon={FileText}
                          delay={0.12}
                          badgeSlot={
                            <BadgeAgendaConvenios
                              userId={userId}
                              userLevel={userLevel}
                              size="sm"
                            />
                          }
                        />
                      )}

                      {showQuejas && (
                        <DashboardTile
                          title="Quejas"
                          description="Registrá y gestioná quejas internas para mejorar la experiencia de los socios."
                          to="/dashboard/quejas"
                          icon={HelpCircle}
                          delay={0.14}
                        />
                      )}

                      {showPilates && (
                        <DashboardTile
                          title="Pilates"
                          description="Gestión de alumnos, clases y administración del módulo Pilates."
                          to="/dashboard/pilates/gestion"
                          icon={Dumbbell}
                          delay={0.16}
                        />
                      )}
                    </div>
                  )}

                  {/* === COLUMNA 2: CONTACTOS === */}
                  {showContactos && (
                    <div className="flex flex-col gap-5 w-full">
                      <div className="pb-2 border-b border-orange-500/30 mb-2">
                        <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                          CONTACTOS
                        </h2>
                        <p className="text-xs text-slate-300 font-semibold">
                          Ventas y seguimiento
                        </p>
                      </div>

                      {showVentas && (
                        <DashboardTile
                          title="Ventas"
                          description="Accedé al módulo de ventas, agenda y seguimiento de clientes."
                          to="/dashboard/ventas"
                          icon={ShoppingBag}
                          delay={0.18}
                          badgeSlot={
                            <BadgeAgendaVentas
                              userId={userId}
                              userLevel={userLevel}
                              size="sm"
                            />
                          }
                        />
                      )}

                      {showLeads && (
                        <DashboardTile
                          title="Leads y Prospectos"
                          description="Gestioná leads, prospectos y oportunidades comerciales."
                          to="/dashboard/testclass"
                          icon={ClipboardList}
                          delay={0.2}
                        />
                      )}

                      {showRecaptacion && (
                        <DashboardTile
                          title="Recaptación de clientes"
                          description="Seguimiento de contactos leads y reactivación de socios."
                          to="/dashboard/recaptacion"
                          icon={Target}
                          delay={0.22}
                        />
                      )}

                      {showRemarketing && (
                        <DashboardTile
                          title="Remarketing"
                          description="Accedé al módulo de remarketing para gestionar campañas y seguimientos."
                          to="/dashboard/ventas-remarketing"
                          icon={ShoppingBag}
                          delay={0.24}
                          badgeSlot={
                            <BadgeAgendaVentasRemarketing
                              userId={userId}
                              userLevel={userLevel}
                              size="sm"
                            />
                          }
                        />
                      )}
                    </div>
                  )}

                  {/* === COLUMNA 3: OTROS === */}
                  {showOtros && (
                    <div className="flex flex-col gap-5 w-full">
                      <div className="pb-2 border-b border-orange-500/30 mb-2">
                        <h2 className="font-bignoodle text-2xl tracking-widest text-orange-400">
                          OTROS
                        </h2>
                        <p className="text-xs text-slate-300 font-semibold">
                          Herramientas y soporte
                        </p>
                      </div>

                      <DashboardTile
                        title="Preguntale a la IA"
                        description="Consultá dudas frecuentes del staff, procedimientos y sugerencias inteligentes."
                        to="/dashboard/preguntas-ia"
                        icon={MessageCircle}
                        delay={0.26}
                      />

                      {showInstructores && (
                        <DashboardTile
                          title="Instructores"
                          description="Gestión de instructores, alumnos y coordinación de asistencias."
                          onClick={handleButtonClickInstructores}
                          icon={Users}
                          delay={0.28}
                        />
                      )}

                      {showEstadisticas && (
                        <DashboardTile
                          title="Estadísticas"
                          description="Visualizá estadísticas de los instructores de HammerX."
                          to="/dashboard/estadisticas"
                          icon={BarChart2}
                          delay={0.3}
                        />
                      )}

                      {showImagenesTile && (
                        <DashboardTile
                          title="Imágenes"
                          description="Subí y gestioná las imágenes oficiales del gimnasio."
                          to="/dashboard/imagenes"
                          icon={ImageIcon}
                          delay={0.32}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            {/* --- FIN GRID --- */}

            {/* CTA FAQs */}
            {(isAdmin || isVendedor) && (
              <div className="mt-12 flex justify-end border-t border-white/5 pt-6">
                <button
                  onClick={abrirModalPreguntas}
                  className="relative inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/90 px-4 py-2 text-sm font-semibold text-[#fc4b08] shadow-md backdrop-blur hover:bg-[#fc4b08] hover:text-white hover:shadow-lg transition-all"
                >
                  <Activity className="h-4 w-4" />
                  VER FAQs
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />

      {/* Modal tareas diarias */}
      {modalTareasOpen && tareasDiarias.length > 0 && (
        <ModalTareasDiarias
          onClose={cerrarModalTareas}
          tareas={tareasDiarias}
          userId={userId}
          userName={userName}
        />
      )}

      {/* Modals FAQs */}
      <TituloPreguntasModal
        isOpen={modalPreguntasOpen}
        onClose={cerrarModalPreguntas}
        preguntas={preguntas}
        onPreguntaSelect={abrirModalDetalle}
      />
      <PreguntaDetalleModal
        isOpen={modalDetalleOpen}
        onClose={cerrarModalDetalle}
        pregunta={preguntaSeleccionada}
      />
      <ConveniosAccionesInboxModal
        isOpen={modalConveniosInboxOpen}
        onClose={() => setModalConveniosInboxOpen(false)}
        items={conveniosPendientes}
        loading={conveniosPendientesLoading}
        onMarkRead={marcarAccionLeida}
        onMarkAllRead={marcarTodasLeidas}
        onGoConvenios={() => {
          setModalConveniosInboxOpen(false);
          navigate('/dashboard/admconvenios');
        }}
        userId={userId}
        nomyape={nomyape}
      />
    </>
  );
};

export default AdminPage;
