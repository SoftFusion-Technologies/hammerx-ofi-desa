import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  UserRound,
  Mail,
  Phone,
  CreditCard,
  Landmark,
  ShieldCheck,
  FileText,
  MessageSquareText,
  Users,
  BadgeCheck,
  Loader2,
  CircleCheckBig
} from 'lucide-react';
import { useAuth } from '../../../AuthContext';

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8080';

const BANCOS_ENDPOINT = `${API_URL}/debitos-automaticos-bancos?activo=1`;
const PLANES_ENDPOINT = `${API_URL}/debitos-automaticos-planes`;
const TERMINOS_ENDPOINT = `${API_URL}/debitos-automaticos-terminos`;

const backdropV = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const panelV = {
  hidden: { opacity: 0, y: 18, scale: 0.985 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22 }
  },
  exit: {
    opacity: 0,
    y: 18,
    scale: 0.985,
    transition: { duration: 0.18 }
  }
};

const MARCAS = ['VISA', 'MASTER'];
const MODALIDADES = ['TITULAR_SOLO', 'AMBOS', 'SOLO_ADICIONAL'];
const ROLES_CARGA = ['RECEPCION', 'VENDEDOR', 'COORDINADOR', 'ADMIN'];

const INPUT_UI =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400';

const TEXTAREA_UI =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 resize-none';

const SECTION_CARD =
  'rounded-[28px] border border-slate-200/90 bg-white/95 p-5 shadow-[0_20px_50px_-34px_rgba(15,23,42,0.22)]';

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  if (!Number.isInteger(num)) return null;
  return num;
};

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const prettyText = (value) => {
  if (!value) return '—';
  return String(value).replaceAll('_', ' ');
};

const mapUserLevelToRolCarga = (userLevel) => {
  const raw = String(userLevel || '')
    .trim()
    .toUpperCase();

  if (
    ['ADMIN', 'ADMINISTRADOR', 'SUPERADMIN', 'SUPER_ADMIN', '1'].includes(raw)
  ) {
    return 'ADMIN';
  }

  if (['COORDINADOR', 'COORDINACION', 'COORD', '2'].includes(raw)) {
    return 'COORDINADOR';
  }

  if (['VENDEDOR', 'VENTAS', 'SELLER', '3'].includes(raw)) {
    return 'VENDEDOR';
  }

  if (['RECEPCION', 'RECEPCIONISTA', '4'].includes(raw)) {
    return 'RECEPCION';
  }

  return 'ADMIN';
};

const createEmptyForm = (rolCarga = 'ADMIN') => ({
  titular_nombre: '',
  titular_dni: '',
  titular_email: '',
  titular_telefono: '',

  banco_id: '',
  marca_tarjeta: 'VISA',
  tarjeta_numero: '',
  confirmo_tarjeta_credito: true,

  modalidad_adhesion: 'TITULAR_SOLO',
  titular_plan_id: '',

  terminos_id: '',
  terminos_aceptados: true,

  canal_origen: 'INTERNO',
  rol_carga_origen: rolCarga,

  observaciones_cliente: '',
  observaciones_internas: '',

  adicional: {
    nombre: '',
    dni: '',
    email: '',
    telefono: '',
    plan_id: ''
  }
});

const validateForm = (form, mode = 'create') => {
  if (!form.titular_nombre.trim()) {
    return 'El nombre del titular es obligatorio.';
  }

  if (!form.titular_dni.trim()) {
    return 'El DNI del titular es obligatorio.';
  }

  if (!form.titular_email.trim()) {
    return 'El email del titular es obligatorio.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.titular_email.trim())) {
    return 'El email del titular no tiene un formato válido.';
  }

  if (!form.banco_id) {
    return 'Debes seleccionar un banco.';
  }

  if (!MARCAS.includes(form.marca_tarjeta)) {
    return 'La marca de tarjeta es inválida.';
  }

  const rawCard = onlyDigits(form.tarjeta_numero);

  if (mode === 'create') {
    if (!rawCard) {
      return 'El número de tarjeta es obligatorio.';
    }

    if (rawCard.length < 13 || rawCard.length > 19) {
      return 'La tarjeta debe contener entre 13 y 19 dígitos.';
    }
  } else {
    if (rawCard && (rawCard.length < 13 || rawCard.length > 19)) {
      return 'La tarjeta debe contener entre 13 y 19 dígitos.';
    }
  }

  if (!form.confirmo_tarjeta_credito) {
    return 'Debes confirmar que se trata de una tarjeta de crédito.';
  }

  if (!MODALIDADES.includes(form.modalidad_adhesion)) {
    return 'La modalidad de adhesión es inválida.';
  }

  const requierePlanTitular =
    form.modalidad_adhesion === 'TITULAR_SOLO' ||
    form.modalidad_adhesion === 'AMBOS';

  if (requierePlanTitular && !form.titular_plan_id) {
    return 'Debes seleccionar un plan titular.';
  }

  if (!form.terminos_aceptados) {
    return 'Debes aceptar los términos para crear la solicitud.';
  }

  if (!ROLES_CARGA.includes(form.rol_carga_origen)) {
    return 'El rol de carga origen es inválido.';
  }

  const requiereAdicional =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  if (requiereAdicional) {
    if (!form.adicional.nombre.trim()) {
      return 'El nombre del adicional es obligatorio.';
    }

    if (!form.adicional.dni.trim()) {
      return 'El DNI del adicional es obligatorio.';
    }

    if (!form.adicional.email.trim()) {
      return 'El email del adicional es obligatorio.';
    }

    if (!emailRegex.test(form.adicional.email.trim())) {
      return 'El email del adicional no tiene un formato válido.';
    }

    if (!form.adicional.plan_id) {
      return 'Debes seleccionar un plan para el adicional.';
    }
  }

  return '';
};

const resolveCreatedId = (result) => {
  return result?.data?.id || result?.data?.data?.id || result?.id || null;
};

export default function SolicitudFormModal({
  open,
  mode = 'create',
  initialData = null,
  onClose,
  onSubmit,
  onOpenDetail
}) {
  const { userName, userLevel, userId } = useAuth();

  const rolCargaAuth = useMemo(
    () => mapUserLevelToRolCarga(userLevel),
    [userLevel]
  );

  const [form, setForm] = useState(createEmptyForm(rolCargaAuth));
  const [saving, setSaving] = useState(false);

  const [bancos, setBancos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [terminos, setTerminos] = useState([]);
  const [loadingCatalogs, setLoadingCatalogs] = useState(false);

  const titleId = 'debito-solicitud-form-title';
  const formId = 'debito-solicitud-form';

  const mapSolicitudToForm = (data, fallbackRol = 'ADMIN') => ({
    titular_nombre: data?.titular_nombre || '',
    titular_dni: data?.titular_dni || '',
    titular_email: data?.titular_email || '',
    titular_telefono: data?.titular_telefono || '',

    banco_id: data?.banco_id ? String(data.banco_id) : '',
    marca_tarjeta: data?.marca_tarjeta || 'VISA',
    tarjeta_numero: '',
    confirmo_tarjeta_credito: Number(data?.confirmo_tarjeta_credito ?? 1) === 1,

    modalidad_adhesion: data?.modalidad_adhesion || 'TITULAR_SOLO',
    titular_plan_id: data?.titular_plan_id ? String(data.titular_plan_id) : '',

    terminos_id: data?.terminos_id ? String(data.terminos_id) : '',
    terminos_aceptados: Number(data?.terminos_aceptados ?? 1) === 1,

    canal_origen: data?.canal_origen || 'INTERNO',
    rol_carga_origen: data?.rol_carga_origen || fallbackRol,

    observaciones_cliente: data?.observaciones_cliente || '',
    observaciones_internas: data?.observaciones_internas || '',

    adicional: {
      nombre: data?.adicional?.nombre || '',
      dni: data?.adicional?.dni || '',
      email: data?.adicional?.email || '',
      telefono: data?.adicional?.telefono || '',
      plan_id: data?.adicional?.plan_id ? String(data.adicional.plan_id) : ''
    }
  });

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialData) {
      setForm(mapSolicitudToForm(initialData, rolCargaAuth));
    } else {
      setForm(createEmptyForm(rolCargaAuth));
    }

    setSaving(false);
  }, [open, mode, initialData, rolCargaAuth]);

  useEffect(() => {
    if (!open) return;

    let active = true;

    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);

        const [bancosRes, planesRes, terminosRes] = await Promise.all([
          axios.get(BANCOS_ENDPOINT),
          axios.get(PLANES_ENDPOINT),
          axios.get(TERMINOS_ENDPOINT)
        ]);

        if (!active) return;

        setBancos(Array.isArray(bancosRes.data) ? bancosRes.data : []);
        setPlanes(Array.isArray(planesRes.data) ? planesRes.data : []);
        setTerminos(Array.isArray(terminosRes.data) ? terminosRes.data : []);
      } catch (error) {
        if (!active) return;

        const backendMessage =
          error?.response?.data?.mensajeError ||
          error?.message ||
          'No se pudieron cargar los catálogos del formulario.';

        await Swal.fire({
          icon: 'error',
          title: 'No se pudo abrir el formulario',
          text: backendMessage,
          confirmButtonColor: '#f97316'
        });
      } finally {
        if (active) setLoadingCatalogs(false);
      }
    };

    fetchCatalogs();

    return () => {
      active = false;
    };
  }, [open]);

  const requiresTitularPlan =
    form.modalidad_adhesion === 'TITULAR_SOLO' ||
    form.modalidad_adhesion === 'AMBOS';

  const requiresAdicional =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let nextValue = type === 'checkbox' ? checked : value;

    if (
      name === 'titular_dni' ||
      name === 'titular_telefono' ||
      name === 'tarjeta_numero'
    ) {
      nextValue = onlyDigits(nextValue);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue
    }));
  };

  const handleAdicionalChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'dni' || name === 'telefono') {
      nextValue = onlyDigits(nextValue);
    }

    setForm((prev) => ({
      ...prev,
      adicional: {
        ...prev.adicional,
        [name]: nextValue
      }
    }));
  };

  useEffect(() => {
    if (form.modalidad_adhesion === 'SOLO_ADICIONAL' && form.titular_plan_id) {
      setForm((prev) => ({
        ...prev,
        titular_plan_id: ''
      }));
    }
  }, [form.modalidad_adhesion, form.titular_plan_id]);

  const buildPayload = () => {
    const payload = {
      titular_nombre: form.titular_nombre.trim(),
      titular_dni: form.titular_dni.trim(),
      titular_email: form.titular_email.trim().toLowerCase(),
      titular_telefono: form.titular_telefono.trim() || null,

      banco_id: toIntOrNull(form.banco_id),
      marca_tarjeta: form.marca_tarjeta,
      confirmo_tarjeta_credito: form.confirmo_tarjeta_credito ? 1 : 0,

      modalidad_adhesion: form.modalidad_adhesion,
      titular_plan_id:
        form.modalidad_adhesion === 'SOLO_ADICIONAL'
          ? null
          : toIntOrNull(form.titular_plan_id),

      observaciones_cliente: form.observaciones_cliente.trim() || null,
      observaciones_internas: form.observaciones_internas.trim() || null
    };

    const rawCard = onlyDigits(form.tarjeta_numero);
    if (mode === 'create' || rawCard) {
      payload.tarjeta_numero = rawCard;
    }

    const terminosId = toIntOrNull(form.terminos_id);
    const initialTerminosId = initialData?.terminos_id
      ? Number(initialData.terminos_id)
      : null;

    if (mode === 'create') {
      payload.usuario_carga_id = toIntOrNull(userId);
      payload.canal_origen = 'INTERNO';
      payload.rol_carga_origen = rolCargaAuth;
      payload.terminos_aceptados = form.terminos_aceptados ? 1 : 0;

      if (terminosId) {
        payload.terminos_id = terminosId;
      }
    } else {
      if (terminosId && terminosId !== initialTerminosId) {
        payload.terminos_id = terminosId;
        payload.terminos_aceptados = form.terminos_aceptados ? 1 : 0;
      }
    }

    if (requiresAdicional) {
      payload.adicional = {
        nombre: form.adicional.nombre.trim(),
        dni: form.adicional.dni.trim(),
        email: form.adicional.email.trim().toLowerCase(),
        telefono: form.adicional.telefono.trim() || null,
        plan_id: toIntOrNull(form.adicional.plan_id)
      };
    }

    return payload;
  };

  const submit = async (e) => {
    e.preventDefault();

    const validationError = validateForm(form, mode);

    if (validationError) {
      await Swal.fire({
        icon: 'warning',
        title: 'Revisá el formulario',
        text: validationError,
        confirmButtonColor: '#f97316'
      });
      return;
    }

    const confirmResult = await Swal.fire({
      icon: 'question',
      title:
        mode === 'edit' ? '¿Guardar cambios?' : '¿Crear solicitud interna?',
      text:
        mode === 'edit'
          ? 'Se actualizará la solicitud con los cambios realizados.'
          : 'Se registrará la solicitud con los datos cargados.',
      showCancelButton: true,
      confirmButtonText: mode === 'edit' ? 'Sí, guardar' : 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#64748b',
      reverseButtons: true
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setSaving(true);

      const payload = buildPayload();
      const result = await onSubmit(payload);
      const createdId = resolveCreatedId(result);

      await Swal.fire({
        icon: 'success',
        title: mode === 'edit' ? 'Solicitud actualizada' : 'Solicitud creada',
        text:
          mode === 'edit'
            ? 'Los cambios se guardaron correctamente.'
            : createdId
              ? `La solicitud #${createdId} fue registrada correctamente.`
              : 'La solicitud fue registrada correctamente.',
        confirmButtonColor: '#f97316'
      });

      onClose();

      if (createdId && typeof onOpenDetail === 'function') {
        setTimeout(() => {
          onOpenDetail(createdId);
        }, 0);
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo crear la solicitud.';

      await Swal.fire({
        icon: 'error',
        title: 'No se pudo crear la solicitud',
        text: backendMessage,
        confirmButtonColor: '#f97316'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4"
          variants={backdropV}
          initial="hidden"
          animate="visible"
          exit="hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
        >
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 size-[24rem] rounded-full blur-3xl opacity-55"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(251,146,60,0.14) 35%, transparent 72%)'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 size-[24rem] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(251,191,36,0.18) 0%, rgba(253,186,116,0.12) 35%, transparent 72%)'
            }}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-[96vw] sm:max-w-4xl max-h-[92vh] overflow-hidden rounded-[30px] border border-orange-100 bg-[linear-gradient(180deg,#fff_0%,#fffaf6_100%)] shadow-[0_28px_90px_rgba(15,23,42,0.28)]"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="max-h-[92vh] overflow-y-auto">
              <div className="p-5 sm:p-6 md:p-7">
                <div className="mx-auto mb-6 max-w-3xl rounded-[28px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 text-center shadow-[0_20px_55px_-34px_rgba(249,115,22,0.30)]">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-100 text-orange-600 ring-1 ring-orange-200 shadow-sm">
                    <CreditCard className="h-8 w-8" />
                  </div>

                  <h3
                    id={titleId}
                    className="text-xl font-bignoodle font-bold tracking-wide text-slate-900 sm:text-2xl"
                  >
                    {mode === 'edit'
                      ? 'Editar solicitud'
                      : 'Nueva solicitud interna'}
                  </h3>
                </div>

                {loadingCatalogs ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-[28px] border border-slate-200 bg-white p-8">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-orange-50 text-orange-600">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-slate-900">
                        Cargando datos del formulario
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Estamos consultando bancos, planes y términos
                        disponibles.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form
                    id={formId}
                    onSubmit={submit}
                    className="mx-auto max-w-3xl"
                  >
                    <div className="space-y-6">
                      <section className={SECTION_CARD}>
                        <SectionTitle
                          icon={UserRound}
                          title="Datos del titular"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field
                            label="Nombre del titular"
                            required
                            icon={UserRound}
                          >
                            <input
                              name="titular_nombre"
                              value={form.titular_nombre}
                              onChange={handleChange}
                              placeholder="Ej: Irma Rosa Ruiz"
                              className={INPUT_UI}
                            />
                          </Field>

                          <Field label="DNI" required icon={BadgeCheck}>
                            <input
                              name="titular_dni"
                              value={form.titular_dni}
                              onChange={handleChange}
                              placeholder="Ej: 6840288"
                              className={INPUT_UI}
                              inputMode="numeric"
                            />
                          </Field>

                          <Field label="Email" required icon={Mail}>
                            <input
                              type="email"
                              name="titular_email"
                              value={form.titular_email}
                              onChange={handleChange}
                              placeholder="ejemplo@email.com"
                              className={INPUT_UI}
                            />
                          </Field>

                          <Field label="Teléfono" icon={Phone}>
                            <input
                              name="titular_telefono"
                              value={form.titular_telefono}
                              onChange={handleChange}
                              placeholder="Ej: 3815551234"
                              className={INPUT_UI}
                              inputMode="numeric"
                            />
                          </Field>
                        </div>
                      </section>

                      <section className={SECTION_CARD}>
                        <SectionTitle
                          icon={CreditCard}
                          title="Adhesión y tarjeta"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field label="Banco" required icon={Landmark}>
                            <select
                              name="banco_id"
                              value={form.banco_id}
                              onChange={handleChange}
                              className={INPUT_UI}
                            >
                              <option value="">Seleccionar banco</option>
                              {bancos.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.nombre}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field
                            label="Marca tarjeta"
                            required
                            icon={CreditCard}
                          >
                            {/* Benjamin Orellana - 23/03/2026 - Se reemplaza la selección visual por botones por un selector simple para marca de tarjeta */}
                            <select
                              name="marca_tarjeta"
                              value={form.marca_tarjeta}
                              onChange={handleChange}
                              className={INPUT_UI}
                            >
                              <option value="">Seleccionar marca</option>
                              {MARCAS.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field
                            label="Número de tarjeta"
                            required
                            icon={CreditCard}
                          >
                            <input
                              name="tarjeta_numero"
                              value={form.tarjeta_numero}
                              onChange={handleChange}
                              placeholder="Ingresá la tarjeta completa"
                              className={INPUT_UI}
                              inputMode="numeric"
                            />
                          </Field>

                          <Field
                            label="Modalidad adhesión"
                            required
                            icon={ShieldCheck}
                          >
                            <select
                              name="modalidad_adhesion"
                              value={form.modalidad_adhesion}
                              onChange={handleChange}
                              className={INPUT_UI}
                            >
                              {MODALIDADES.map((item) => (
                                <option key={item} value={item}>
                                  {prettyText(item)}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <Field
                            label="Plan titular"
                            required={requiresTitularPlan}
                            icon={FileText}
                          >
                            <select
                              name="titular_plan_id"
                              value={form.titular_plan_id}
                              onChange={handleChange}
                              disabled={!requiresTitularPlan}
                              className={INPUT_UI}
                            >
                              <option value="">
                                {requiresTitularPlan
                                  ? 'Seleccionar plan'
                                  : 'No aplica para esta modalidad'}
                              </option>
                              {planes.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.nombre}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <div className="flex items-end">
                            <SwitchField
                              id="solicitud-confirmo-tc"
                              name="confirmo_tarjeta_credito"
                              checked={!!form.confirmo_tarjeta_credito}
                              onChange={handleChange}
                              label="Confirmo que se trata de una tarjeta de crédito"
                            />
                          </div>
                        </div>
                      </section>

                      <section className={SECTION_CARD}>
                        <SectionTitle
                          icon={ShieldCheck}
                          title="Términos y observaciones"
                        />

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <Field label="Término a usar" icon={FileText}>
                            <select
                              name="terminos_id"
                              value={form.terminos_id}
                              onChange={handleChange}
                              className={INPUT_UI}
                            >
                              <option value="">
                                Automático (vigente actual)
                              </option>
                              {terminos.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.titulo}
                                  {item.version ? ` · ${item.version}` : ''}
                                </option>
                              ))}
                            </select>
                          </Field>

                          <div className="flex items-end">
                            <SwitchField
                              id="solicitud-terminos"
                              name="terminos_aceptados"
                              checked={!!form.terminos_aceptados}
                              onChange={handleChange}
                              label="Términos aceptados"
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4">
                          <Field
                            label="Observaciones cliente"
                            icon={MessageSquareText}
                          >
                            <textarea
                              rows={3}
                              name="observaciones_cliente"
                              value={form.observaciones_cliente}
                              onChange={handleChange}
                              placeholder="Comentario visible/originado desde el cliente"
                              className={TEXTAREA_UI}
                            />
                          </Field>

                          <Field
                            label="Observaciones internas"
                            icon={MessageSquareText}
                          >
                            <textarea
                              rows={3}
                              name="observaciones_internas"
                              value={form.observaciones_internas}
                              onChange={handleChange}
                              placeholder="Notas internas del staff"
                              className={TEXTAREA_UI}
                            />
                          </Field>
                        </div>
                      </section>

                      <AnimatePresence mode="wait">
                        {requiresAdicional ? (
                          <motion.section
                            key="adicional-card"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className={SECTION_CARD}
                          >
                            <SectionTitle
                              icon={Users}
                              title="Persona adicional"
                            />

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              <Field label="Nombre" required icon={UserRound}>
                                <input
                                  name="nombre"
                                  value={form.adicional.nombre}
                                  onChange={handleAdicionalChange}
                                  placeholder="Nombre del adicional"
                                  className={INPUT_UI}
                                />
                              </Field>

                              <Field label="DNI" required icon={BadgeCheck}>
                                <input
                                  name="dni"
                                  value={form.adicional.dni}
                                  onChange={handleAdicionalChange}
                                  placeholder="DNI del adicional"
                                  className={INPUT_UI}
                                  inputMode="numeric"
                                />
                              </Field>

                              <Field label="Email" required icon={Mail}>
                                <input
                                  type="email"
                                  name="email"
                                  value={form.adicional.email}
                                  onChange={handleAdicionalChange}
                                  placeholder="email@ejemplo.com"
                                  className={INPUT_UI}
                                />
                              </Field>

                              <Field label="Teléfono" icon={Phone}>
                                <input
                                  name="telefono"
                                  value={form.adicional.telefono}
                                  onChange={handleAdicionalChange}
                                  placeholder="Teléfono del adicional"
                                  className={INPUT_UI}
                                  inputMode="numeric"
                                />
                              </Field>

                              <Field
                                label="Plan adicional"
                                required
                                icon={FileText}
                              >
                                <select
                                  name="plan_id"
                                  value={form.adicional.plan_id}
                                  onChange={handleAdicionalChange}
                                  className={INPUT_UI}
                                >
                                  <option value="">Seleccionar plan</option>
                                  {planes.map((item) => (
                                    <option key={item.id} value={item.id}>
                                      {item.nombre}
                                    </option>
                                  ))}
                                </select>
                              </Field>
                            </div>
                          </motion.section>
                        ) : null}
                      </AnimatePresence>

                      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-center">
                        <button
                          type="button"
                          onClick={onClose}
                          disabled={saving}
                          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancelar
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(249,115,22,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {mode === 'edit'
                                ? 'Guardando cambios...'
                                : 'Creando solicitud...'}
                            </>
                          ) : (
                            <>
                              <CircleCheckBig className="h-4 w-4" />
                              {mode === 'edit'
                                ? 'Guardar cambios'
                                : 'Crear solicitud'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 ring-1 ring-orange-100">
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>

      <h4 className="text-base font-bold text-slate-900">{title}</h4>
    </div>
  );
}

function Field({ label, required = false, icon: Icon, children }) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon ? <Icon className="h-4 w-4 text-orange-500" /> : null}
        {label}
        {required ? <span className="text-rose-500">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function SwitchField({ id, name, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex min-h-[64px] w-full cursor-pointer items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-white px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/40"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
      </div>

      <div className="flex shrink-0 items-center">
        <span className="relative inline-flex h-7 w-12 items-center">
          <input
            id={id}
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
          />
          <span className="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-orange-500" />
          <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
        </span>
      </div>
    </label>
  );
}
