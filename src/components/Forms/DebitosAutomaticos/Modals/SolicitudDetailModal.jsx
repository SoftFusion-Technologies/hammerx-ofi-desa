import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FileText,
  Globe,
  Landmark,
  Loader2,
  Mail,
  MessageSquareText,
  Pencil,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
  XCircle
} from 'lucide-react';

import SolicitudObservarModal from './SolicitudObservarModal';
import SolicitudAprobarModal from './SolicitudAprobarModal';
import SolicitudRechazarModal from './SolicitudRechazarModal';
import SolicitudCancelarModal from './SolicitudCancelarModal';

import { useAuth } from '../../../../AuthContext';

const statusStyles = {
  PENDIENTE:
    'border-amber-200 bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  APROBADA:
    'border-emerald-200 bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  RECHAZADA:
    'border-rose-200 bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
  OBSERVADA:
    'border-orange-200 bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200',
  CANCELADA:
    'border-slate-200 bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200'
};

const EDITABLE_STATES = ['PENDIENTE', 'OBSERVADA'];
const ACTIONABLE_STATES = ['PENDIENTE', 'OBSERVADA'];

const prettyText = (value) => {
  if (!value) return '—';
  return String(value).replaceAll('_', ' ');
};

const formatDate = (value) => {
  if (!value) return '—';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  try {
    return new Intl.DateTimeFormat('es-AR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `${Number(value)}%`;
};

const formatMonth = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}`;
};

// Benjamin Orellana - 2026/04/13 - Prioriza la tarjeta completa si vino desde backend; si no, usa máscara o últimos 4.
const formatCardDisplay = (solicitud) => {
  const raw = String(solicitud?.tarjeta_numero_completo || '').replace(
    /\D/g,
    ''
  );

  if (raw) {
    return raw.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  if (solicitud?.tarjeta_mascara) return solicitud.tarjeta_mascara;
  if (solicitud?.tarjeta_ultimos4) {
    return `**** **** **** ${solicitud.tarjeta_ultimos4}`;
  }

  return '—';
};

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

const resolveSolicitudDetalle = (response) => {
  return (
    response?.data?.registroActualizado ||
    response?.data?.registro ||
    response?.data?.detalle ||
    response?.data?.data ||
    response?.data ||
    response?.registroActualizado ||
    response?.registro ||
    response?.detalle ||
    response?.data ||
    response ||
    null
  );
};

const ModalActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'neutral',
  disabled = false,
  title
}) => {
  const variants = {
    neutral:
      'border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700',
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    danger:
      'border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300 hover:bg-rose-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-100',
    primary:
      'border-orange-200 bg-orange-50 text-orange-700 hover:border-orange-300 hover:bg-orange-100'
  };

  return (
    <button
      type="button"
      title={title || label}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition',
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-300 opacity-70'
          : variants[variant]
      ].join(' ')}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
};

export default function SolicitudDetailModal({
  open,
  solicitudId,
  onClose,
  onEdit,
  onUpdated,
  onPendingFeature,
  apiUrl = 'http://localhost:8080'
}) {
  const apiBaseUrl = useMemo(() => apiUrl.replace(/\/$/, ''), [apiUrl]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [solicitud, setSolicitud] = useState(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [observeModalOpen, setObserveModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Benjamin Orellana - 2026/04/13 - Se obtiene identidad autenticada para que backend decida si devuelve tarjeta completa.
  const { userId, userName } = useAuth();

  const authUserId = userId;

  // Benjamin Orellana - 2026/04/13 - En este proyecto userName contiene el correo autenticado del usuario.
  const authUserEmail = useMemo(() => {
    return String(userName || '')
      .trim()
      .toLowerCase();
  }, [userName]);

  // Benjamin Orellana - 2026/04/13 - Headers reutilizables para endpoints que pueden devolver tarjeta desencriptada.
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

  const closeAllInnerModals = useCallback(() => {
    setApproveModalOpen(false);
    setRejectModalOpen(false);
    setObserveModalOpen(false);
    setCancelModalOpen(false);
  }, []);

  const fetchDetail = useCallback(async () => {
    if (!solicitudId) return null;

    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${apiBaseUrl}/debitos-automaticos-solicitudes/${solicitudId}`,
        authRequestConfig
      );

      const detalle = resolveSolicitudDetalle(response);
      setSolicitud(detalle);

      return detalle;
    } catch (err) {
      const message =
        err?.response?.data?.mensajeError ||
        err?.message ||
        'No se pudo obtener el detalle de la solicitud.';

      setError(message);
      setSolicitud(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl, solicitudId, authRequestConfig]);

  useEffect(() => {
    if (!open || !solicitudId) return;
    fetchDetail();
  }, [open, solicitudId, fetchDetail]);

  useEffect(() => {
    if (!open) {
      closeAllInnerModals();
      return;
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, closeAllInnerModals]);

  const handleCloseDetail = () => {
    closeAllInnerModals();
    onClose?.();
  };

  const title = useMemo(() => {
    if (!solicitud) return 'Detalle de solicitud';
    return `Solicitud #${solicitud.id}`;
  }, [solicitud]);

  const editable = canEditSolicitud(solicitud?.estado);
  const approvable = canApproveSolicitud(solicitud?.estado);
  const rejectable = canRejectSolicitud(solicitud?.estado);
  const observable = canObserveSolicitud(solicitud?.estado);
  const cancelable = canCancelSolicitud(solicitud?.estado);

  const syncAfterAction = async (responseData) => {
    const detalleActualizado = resolveSolicitudDetalle(responseData);

    if (detalleActualizado?.id) {
      setSolicitud(detalleActualizado);
      setError('');
      onUpdated?.(detalleActualizado);
      return;
    }

    const detalleRefrescado = await fetchDetail();
    if (detalleRefrescado) {
      onUpdated?.(detalleRefrescado);
    }
  };

  const handleApproved = async (responseData) => {
    setApproveModalOpen(false);
    await syncAfterAction(responseData);
  };

  const handleRejected = async (responseData) => {
    setRejectModalOpen(false);
    await syncAfterAction(responseData);
  };

  const handleObserved = async (responseData) => {
    setObserveModalOpen(false);
    await syncAfterAction(responseData);
  };

  const handleCancelled = async (responseData) => {
    setCancelModalOpen(false);
    await syncAfterAction(responseData);
  };

  const handleOpenApprove = () => {
    if (!solicitud?.id || !approvable) return;
    setApproveModalOpen(true);
  };

  const handleOpenReject = () => {
    if (!solicitud?.id || !rejectable) return;
    setRejectModalOpen(true);
  };

  const handleOpenObserve = () => {
    if (!solicitud?.id || !observable) return;
    setObserveModalOpen(true);
  };

  const handleOpenCancel = () => {
    if (!solicitud?.id || !cancelable) return;
    setCancelModalOpen(true);
  };

  const handleDeleteClick = () => {
    if (!solicitud?.id) return;
    onPendingFeature?.('Eliminar', solicitud);
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
          >
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={handleCloseDetail}
            />

            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={[
                'relative z-[1] flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px]',
                'border border-white/80 bg-white shadow-[0_30px_100px_-30px_rgba(15,23,42,0.35)]'
              ].join(' ')}
            >
              <div className="border-b border-slate-200 bg-gradient-to-r from-white via-orange-50/70 to-white px-5 py-5 sm:px-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-orange-700">
                      Débitos Automáticos · Detalle
                    </div>

                    <h2 className="font-bignoodle text-2xl font-black tracking-tight text-slate-900">
                      {title}
                    </h2>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    {solicitud?.estado ? (
                      <span
                        className={[
                          'inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]',
                          statusStyles[solicitud.estado] ||
                            statusStyles.CANCELADA
                        ].join(' ')}
                      >
                        {prettyText(solicitud.estado)}
                      </span>
                    ) : null}

                    <button
                      type="button"
                      onClick={handleCloseDetail}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <ModalActionButton
                    icon={Pencil}
                    label="Editar"
                    variant="primary"
                    disabled={!editable || loading || !solicitud}
                    title={
                      editable
                        ? 'Editar solicitud'
                        : 'Solo se puede editar si está en estado PENDIENTE u OBSERVADA'
                    }
                    onClick={() => onEdit?.(solicitud)}
                  />

                  <ModalActionButton
                    icon={CheckCircle2}
                    label="Aprobar"
                    variant="success"
                    disabled={!approvable || loading || !solicitud}
                    title={
                      approvable
                        ? 'Aprobar solicitud'
                        : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                    }
                    onClick={handleOpenApprove}
                  />

                  <ModalActionButton
                    icon={XCircle}
                    label="Rechazar"
                    variant="danger"
                    disabled={!rejectable || loading || !solicitud}
                    title={
                      rejectable
                        ? 'Rechazar solicitud'
                        : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                    }
                    onClick={handleOpenReject}
                  />

                  <ModalActionButton
                    icon={MessageSquareText}
                    label="Observar"
                    variant="warning"
                    disabled={!observable || loading || !solicitud}
                    title={
                      observable
                        ? 'Observar solicitud'
                        : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                    }
                    onClick={handleOpenObserve}
                  />

                  <ModalActionButton
                    icon={Ban}
                    label="Cancelar"
                    variant="warning"
                    disabled={!cancelable || loading || !solicitud}
                    title={
                      cancelable
                        ? 'Cancelar solicitud'
                        : 'Solo disponible para solicitudes PENDIENTE u OBSERVADA'
                    }
                    onClick={handleOpenCancel}
                  />

                  <ModalActionButton
                    icon={Trash2}
                    label="Eliminar"
                    disabled={loading || !solicitud}
                    onClick={handleDeleteClick}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
                {loading ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900">
                        Cargando detalle
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Consultando la información completa de la solicitud.
                      </p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-rose-700">
                    <h3 className="text-lg font-bold">
                      No se pudo cargar el detalle
                    </h3>
                    <p className="mt-2 text-sm leading-6">{error}</p>
                  </div>
                ) : solicitud ? (
                  <div className="grid gap-5">
                    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                      <SectionCard icon={UserRound} title="Datos del titular">
                        <DetailGrid>
                          <DetailItem
                            label="Nombre"
                            value={solicitud.titular_nombre}
                          />
                          <DetailItem
                            label="DNI"
                            value={solicitud.titular_dni}
                          />
                          <DetailItem
                            label="Email"
                            value={solicitud.titular_email}
                            icon={Mail}
                          />
                          <DetailItem
                            label="Teléfono"
                            value={solicitud.titular_telefono}
                            icon={Phone}
                          />
                          <DetailItem
                            label="Canal origen"
                            value={prettyText(solicitud.canal_origen)}
                            icon={Globe}
                          />
                          <DetailItem
                            label="Rol carga origen"
                            value={prettyText(solicitud.rol_carga_origen)}
                          />
                          <DetailItem
                            label="Usuario carga ID"
                            value={solicitud.usuario_carga_id}
                          />
                          <DetailItem
                            label="Fecha creación"
                            value={formatDate(solicitud.created_at)}
                            icon={CalendarDays}
                          />
                        </DetailGrid>
                      </SectionCard>

                      <SectionCard icon={ShieldCheck} title="Estado y revisión">
                        <DetailGrid>
                          <DetailItem
                            label="Estado"
                            value={prettyText(solicitud.estado)}
                          />
                          <DetailItem
                            label="Revisado por"
                            value={solicitud.revisado_por}
                          />
                          <DetailItem
                            label="Revisado el"
                            value={formatDate(solicitud.revisado_at)}
                          />
                          <DetailItem
                            label="Motivo rechazo"
                            value={solicitud.motivo_rechazo}
                          />
                          <DetailItem
                            label="Observaciones internas"
                            value={solicitud.observaciones_internas}
                            colSpan="full"
                          />
                          <DetailItem
                            label="Observaciones cliente"
                            value={solicitud.observaciones_cliente}
                            colSpan="full"
                          />
                        </DetailGrid>
                      </SectionCard>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                      <SectionCard icon={CreditCard} title="Adhesión y tarjeta">
                        <DetailGrid>
                          <DetailItem
                            label="Banco"
                            value={solicitud.banco?.nombre}
                            icon={Landmark}
                          />
                          <DetailItem
                            label="Marca tarjeta"
                            value={solicitud.marca_tarjeta}
                          />
                          <DetailItem
                            label={
                              solicitud?.tarjeta_numero_completo
                                ? 'Tarjeta completa'
                                : 'Tarjeta'
                            }
                            value={formatCardDisplay(solicitud)}
                          />
                          <DetailItem
                            label="Últimos 4"
                            value={solicitud.tarjeta_ultimos4}
                          />
                          <DetailItem
                            label="Confirmó tarjeta crédito"
                            value={
                              Number(solicitud.confirmo_tarjeta_credito) === 1
                                ? 'Sí'
                                : 'No'
                            }
                          />
                          <DetailItem
                            label="Modalidad adhesión"
                            value={prettyText(solicitud.modalidad_adhesion)}
                          />
                          <DetailItem
                            label="Plan titular"
                            value={solicitud.plan_titular?.nombre}
                          />
                          <DetailItem
                            label="Plan titular ID"
                            value={solicitud.titular_plan_id}
                          />
                        </DetailGrid>
                      </SectionCard>

                      <SectionCard icon={FileText} title="Términos aceptados">
                        <DetailGrid>
                          <DetailItem
                            label="Término ID"
                            value={solicitud.terminos_id}
                          />
                          <DetailItem
                            label="Versión"
                            value={solicitud.terminos?.version}
                          />
                          <DetailItem
                            label="Título"
                            value={solicitud.terminos?.titulo}
                            colSpan="full"
                          />
                          <DetailItem
                            label="Aceptado"
                            value={
                              Number(solicitud.terminos_aceptados) === 1
                                ? 'Sí'
                                : 'No'
                            }
                          />
                          <DetailItem
                            label="Aceptado el"
                            value={formatDate(solicitud.terminos_aceptados_at)}
                          />
                          <DetailItem
                            label="IP"
                            value={solicitud.terminos_ip}
                          />
                          <DetailItem
                            label="User agent"
                            value={solicitud.terminos_user_agent}
                            colSpan="full"
                          />
                        </DetailGrid>
                      </SectionCard>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
                      <SectionCard
                        icon={Landmark}
                        title="Beneficio"
                        description="Se conserva lo informado al momento de generar la solicitud."
                      >
                        <DetailGrid>
                          <DetailItem
                            label="Descripción"
                            value={solicitud.beneficio_descripcion_snapshot}
                            colSpan="full"
                          />
                          <DetailItem
                            label="Descuento off %"
                            value={formatPercent(
                              solicitud.beneficio_descuento_off_pct_snapshot
                            )}
                          />
                          <DetailItem
                            label="Reintegro %"
                            value={formatPercent(
                              solicitud.beneficio_reintegro_pct_snapshot
                            )}
                          />
                          <DetailItem
                            label="Desde mes"
                            value={formatMonth(
                              solicitud.beneficio_reintegro_desde_mes_snapshot
                            )}
                          />
                          <DetailItem
                            label="Duración meses"
                            value={formatMonth(
                              solicitud.beneficio_reintegro_duracion_meses_snapshot
                            )}
                          />
                        </DetailGrid>
                      </SectionCard>

                      <SectionCard
                        icon={Users}
                        title="Persona adicional"
                        description="Solo aparece cuando la modalidad contempla adicional."
                      >
                        {solicitud.adicional ? (
                          <DetailGrid>
                            <DetailItem
                              label="Nombre"
                              value={solicitud.adicional.nombre}
                            />
                            <DetailItem
                              label="DNI"
                              value={solicitud.adicional.dni}
                            />
                            <DetailItem
                              label="Email"
                              value={solicitud.adicional.email}
                              icon={Mail}
                            />
                            <DetailItem
                              label="Teléfono"
                              value={solicitud.adicional.telefono}
                              icon={Phone}
                            />
                            <DetailItem
                              label="Plan adicional"
                              value={solicitud.adicional.plan?.nombre}
                            />
                            <DetailItem
                              label="Plan ID"
                              value={solicitud.adicional.plan_id}
                            />
                          </DetailGrid>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                            Esta solicitud no registra persona adicional
                            asociada.
                          </div>
                        )}
                      </SectionCard>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                    <h3 className="text-lg font-bold text-slate-900">
                      Sin información disponible
                    </h3>
                    <p className="mt-2 text-sm text-slate-500">
                      No se encontró contenido para esta solicitud.
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500"></p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCloseDetail}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SolicitudAprobarModal
        open={approveModalOpen}
        solicitud={solicitud}
        onClose={() => setApproveModalOpen(false)}
        onApproved={handleApproved}
        apiBaseUrl={apiBaseUrl}
      />

      <SolicitudRechazarModal
        open={rejectModalOpen}
        solicitud={solicitud}
        onClose={() => setRejectModalOpen(false)}
        onRejected={handleRejected}
        apiBaseUrl={apiBaseUrl}
      />

      <SolicitudObservarModal
        open={observeModalOpen}
        solicitud={solicitud}
        onClose={() => setObserveModalOpen(false)}
        onObserved={handleObserved}
        apiBaseUrl={apiBaseUrl}
      />

      <SolicitudCancelarModal
        open={cancelModalOpen}
        solicitud={solicitud}
        onClose={() => setCancelModalOpen(false)}
        onCancelled={handleCancelled}
        apiBaseUrl={apiBaseUrl}
      />
    </>
  );
}

function SectionCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h3 className="mt-3 font-bignoodle text-xl font-bold text-slate-900">
            {title}
          </h3>
        </div>
      </div>

      {children}
    </div>
  );
}

function DetailGrid({ children }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function DetailItem({ label, value, icon: Icon, colSpan = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3',
        colSpan === 'full' ? 'sm:col-span-2' : ''
      ].join(' ')}
    >
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
        {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
        <span>{label}</span>
      </div>

      <div className="mt-2 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-slate-800">
        {value || '—'}
      </div>
    </div>
  );
}
