import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Swal from 'sweetalert2';
import { createPortal } from 'react-dom';

import '../../../styles/MetodsGet/GetUserId.css';
import FormAltaNota from '../../../components/Forms/FormAltaNota';
import { Link } from 'react-router-dom';
import FormAltaIntegranteConve from '../../../components/Forms/FormAltaIntegranteConve';
import FormAltaFamiliarI from '../../../components/Forms/FormAltaFamiliarI';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

import {
  FaTimes,
  FaUser,
  FaIdCard,
  FaPhoneAlt,
  FaEnvelope,
  FaUserShield,
  FaCalendarAlt,
  FaStickyNote,
  FaUsers,
  FaCheck,
  FaBan,
  FaClock,
  FaPlus
} from 'react-icons/fa';

const ensureSwalZIndex = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('swal-zfix-style')) return;

  const st = document.createElement('style');
  st.id = 'swal-zfix-style';
  st.innerHTML = `
    /* Swal siempre arriba */
    .swal2-container{ z-index: 200000 !important; }
    .swal2-popup{ z-index: 200001 !important; }

    /* Fix genérico: overlays/modales legacy que usan estas clases */
    .modal-overlay{ z-index: 11000 !important; }
    .modal-content{ z-index: 11001 !important; }
    .container-inputs{ z-index: 11001 !important; position: relative; }
  `;
  document.head.appendChild(st);
};

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true
});

const IntegranteDetails = ({
  id_conv,
  user,
  isOpen,
  onClose,
  obtenerIntegrantes2,
  permiteFam,
  cantFamiliares,
  formatearFecha
}) => {
  const [modalNewConve, setmodalNewConve] = useState(false);
  const [modalNewConve2, setmodalNewConve2] = useState(false);

  const { userLevel } = useAuth();

  useEffect(() => {
    ensureSwalZIndex();
  }, []);

  // Lock scroll + Escape
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const abrirModal = () => setmodalNewConve(true);
  const cerarModal = () => {
    setmodalNewConve(false);
    obtenerIntegrantes2();
  };

  const cerarModal2 = () => {
    setmodalNewConve2(false);
    obtenerIntegrantes2();
  };

  // Función para solicitar autorización -
  // R6 - Autorizar Integrantes - BO - 15 -09 - 2024
  const solicitarAutorizacion = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        { estado_autorizacion: 'pendiente' }
      );
      Toast.fire({ icon: 'success', title: 'Solicitud enviada con éxito' });
      obtenerIntegrantes2();
    } catch (error) {
      console.error('Error al solicitar autorización', error);
      Toast.fire({ icon: 'error', title: 'Error al solicitar autorización' });
    }
  };

  // Función para autorizar al integrante
  const autorizarIntegrante = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        { estado_autorizacion: 'autorizado' }
      );
      Toast.fire({ icon: 'success', title: 'Integrante autorizado con éxito' });
      obtenerIntegrantes2();
      onClose();
    } catch (error) {
      console.error('Error al autorizar', error);
      Toast.fire({ icon: 'error', title: 'Error al autorizar' });
    }
  };

  // Función para no autorizar al integrante
  const noAutorizarIntegrante = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        { estado_autorizacion: 'sin_autorizacion' }
      );
      Toast.fire({ icon: 'success', title: 'Integrante NO autorizado' });
      obtenerIntegrantes2();
      onClose();
    } catch (error) {
      console.error('Error al no autorizar', error);
      Toast.fire({ icon: 'error', title: 'Error al actualizar autorización' });
    }
  };
  //R6 - Autorizar Integrantes - BO- 15-09-24 - final

  const estadoAuth = String(user?.estado_autorizacion || 'sin_autorizacion');

  const pillAuth =
    estadoAuth === 'autorizado'
      ? 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/25'
      : estadoAuth === 'pendiente'
      ? 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/25'
      : 'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/25';

  const labelAuth =
    estadoAuth === 'autorizado'
      ? 'Autorizado'
      : estadoAuth === 'pendiente'
      ? 'Pendiente'
      : 'Sin autorización';

  const safeUserName =
    String(user?.userName || '').trim() === '' ? 'Sin usuario' : user.userName;

  // Si no está abierto, no renderiza nada (como antes)
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
          onClick={onClose}
        />

        {/* Panel */}
        <motion.div
          initial={{ y: 26, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 18, opacity: 0, scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="
            relative w-full sm:w-[92vw] sm:max-w-3xl
            max-h-[92vh]
            rounded-t-3xl sm:rounded-3xl
            border border-white/10
            bg-zinc-950/85 backdrop-blur-xl
            shadow-[0_30px_90px_rgba(0,0,0,0.55)]
            overflow-hidden
          "
        >
          {/* Accent */}
          <div className="h-[3px] bg-gradient-to-r from-[#fc4b08] via-orange-400 to-amber-300" />

          {/* Header */}
          <div className="sticky top-0 z-20 px-4 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/70 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 text-[#fc4b08]">
                  <FaUser />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                      Detalles del Integrante
                    </h2>

                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${pillAuth}`}
                      title="Estado de autorización"
                    >
                      {estadoAuth === 'autorizado' ? (
                        <FaCheck />
                      ) : estadoAuth === 'pendiente' ? (
                        <FaClock />
                      ) : (
                        <FaBan />
                      )}
                      {labelAuth}
                    </span>
                  </div>

                  <div className="text-xs text-white/60 truncate mt-0.5">
                    {user?.nombre || '—'} · DNI {user?.dni || '—'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
                aria-label="Cerrar"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-4 sm:px-6 py-5 overflow-y-auto max-h-[calc(92vh-64px)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<FaUser />} label="Nombre" value={user?.nombre} />
              <InfoRow icon={<FaIdCard />} label="DNI" value={user?.dni} />
              <InfoRow
                icon={<FaPhoneAlt />}
                label="Teléfono"
                value={user?.telefono}
              />
              <InfoRow
                icon={<FaEnvelope />}
                label="Email"
                value={user?.email}
              />
              <InfoRow
                icon={<FaUserShield />}
                label="Creado por"
                value={safeUserName}
              />
              <InfoRow
                icon={<FaCalendarAlt />}
                label="Fecha creación"
                value={
                  formatearFecha
                    ? formatearFecha(user?.fechaCreacion)
                    : user?.fechaCreacion
                }
              />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                <FaStickyNote className="text-[#fc4b08]" />
                Observaciones
              </div>

              <div className="mt-3 text-sm text-white/85 whitespace-pre-wrap leading-relaxed">
                {String(user?.notas || '').trim() ? user.notas : '—'}
              </div>
            </div>

            <div className="my-5 h-px bg-white/10" />

            {/* Acciones */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.03] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-white/55 mb-3">
                Acciones rápidas
              </div>

              <div className="flex flex-wrap gap-2">
                {(userLevel === 'admin' ||
                  userLevel === 'administrador' ||
                  userLevel === 'gerente' ||
                  userLevel === 'vendedor') && (
                  <button
                    onClick={abrirModal}
                    type="button"
                    className="
                      inline-flex items-center gap-2
                      bg-[#58b35e] hover:bg-[#4e8a52]
                      text-white
                      px-4 py-2.5
                      rounded-2xl
                      transition
                      shadow-[0_14px_30px_rgba(88,179,94,0.18)]
                    "
                  >
                    <FaPlus />
                    Agregar Nota
                  </button>
                )}

                {Number(permiteFam) === 1 && (
                  <Link
                    to={`/dashboard/admconvenios/${id_conv}/integrantes/${user.id}/integrantesfam/`}
                  >
                    <button
                      type="button"
                      className="
                        inline-flex items-center gap-2
                        bg-sky-600 hover:bg-sky-700
                        text-white
                        px-4 py-2.5
                        rounded-2xl
                        transition
                        shadow-[0_14px_30px_rgba(2,132,199,0.18)]
                      "
                    >
                      <FaUsers />
                      Ver Familiar
                      {typeof cantFamiliares === 'number' && (
                        <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full bg-white/15 text-xs">
                          {cantFamiliares}
                        </span>
                      )}
                    </button>
                  </Link>
                )}

                {/* R6 - Autorizar Integrantes */}
                {(userLevel === 'gerente' || userLevel === 'vendedor') && (
                  <button
                    onClick={solicitarAutorizacion}
                    type="button"
                    className="
                      inline-flex items-center gap-2
                      bg-[#fc4b08] hover:bg-[#bf360c]
                      text-white
                      px-4 py-2.5
                      rounded-2xl
                      transition
                      shadow-[0_14px_30px_rgba(252,75,8,0.18)]
                    "
                  >
                    <FaClock />
                    Solicitar Autorización
                  </button>
                )}

                {(userLevel === 'admin' || userLevel === 'administrador') && (
                  <>
                    <button
                      onClick={autorizarIntegrante}
                      type="button"
                      className="
                        inline-flex items-center gap-2
                        bg-emerald-600 hover:bg-emerald-700
                        text-white
                        px-4 py-2.5
                        rounded-2xl
                        transition
                        shadow-[0_14px_30px_rgba(16,185,129,0.18)]
                      "
                    >
                      <FaCheck />
                      Autorizar
                    </button>

                    <button
                      onClick={noAutorizarIntegrante}
                      type="button"
                      className="
                        inline-flex items-center gap-2
                        bg-rose-600 hover:bg-rose-700
                        text-white
                        px-4 py-2.5
                        rounded-2xl
                        transition
                        shadow-[0_14px_30px_rgba(244,63,94,0.18)]
                      "
                    >
                      <FaBan />
                      No Autorizar
                    </button>
                  </>
                )}
              </div>

              <div className="mt-3 text-[11px] text-white/45">
                Tip: Podés cerrar con{' '}
                <span className="text-white/70 font-semibold">ESC</span> o clic
                fuera del panel.
              </div>
            </div>
          </div>

          {/* Mantengo estos imports por si tu módulo los usa luego */}
          <div className="hidden">
            <FormAltaIntegranteConve
              isOpen={modalNewConve2}
              onClose={cerarModal2}
            />
            <FormAltaFamiliarI />
          </div>
        </motion.div>

        {/* CLAVE: FormAltaNota en PORTAL para que se vea arriba del modal actual */}
        {typeof document !== 'undefined' &&
          createPortal(
            <FormAltaNota
              isOpen={modalNewConve}
              onClose={cerarModal}
              user={user}
            />,
            document.body
          )}
      </motion.div>
    </AnimatePresence>
  );
};

function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/85">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-[0.16em] text-white/55">
            {label}
          </div>
          <div className="text-sm text-white font-semibold truncate">
            {String(value || '—')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default IntegranteDetails;
