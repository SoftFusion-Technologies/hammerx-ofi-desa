import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Save,
  Loader2,
  User,
  Landmark,
  CreditCard,
  CalendarDays,
  FileText,
  Building2,
  Wallet,
  ShieldCheck,
  Users,
  BadgeCheck,
  Mail,
  Phone,
  Sparkles
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 06 / 04 / 2026
 * Versión: 1.3
 *
 * Descripción:
 * Modal de alta directa para clientes del módulo Débitos Automáticos.
 * Crea el cliente sin pasar por la pantalla de solicitudes, consumiendo
 * el endpoint POST /debitos-automaticos-clientes.
 *
 * Tema: Alta directa de cliente - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 06/04/2026 - Se corrige el autocompletado del beneficio al seleccionar banco y se normalizan catálogos para soportar tanto arrays crudos como arrays de options */
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

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080'
});

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

const buildMaskFromLast4 = (last4) => {
  const digits = onlyDigits(last4).slice(-4);
  if (digits.length !== 4) return '';
  return `**** **** **** ${digits}`;
};

const getTodayInput = () => {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const getFirstDayNextMonthInput = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const next = new Date(y, m + 1, 1);
  const timezoneOffset = next.getTimezoneOffset() * 60000;
  return new Date(next.getTime() - timezoneOffset).toISOString().slice(0, 10);
};

const normalizeSingle = (payload) => {
  if (!payload) return null;
  if (payload?.row && !Array.isArray(payload.row)) return payload.row;
  if (payload?.data?.row && !Array.isArray(payload.data.row))
    return payload.data.row;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.item && !Array.isArray(payload.item)) return payload.item;
  return payload;
};

/* Benjamin Orellana - 09/04/2026 - Helpers numéricos para autocompletar y recalcular los valores comerciales vigentes en alta directa */
const parseNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;

  const normalized = String(value).replace(',', '.').trim();
  const n = Number(normalized);

  return Number.isFinite(n) ? n : null;
};

const toInputNumberString = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Number(n.toFixed(2)));
};

const calculateMontoBase = (montoInicial, descuento) => {
  const monto = Number(montoInicial);
  const desc = Number(descuento);

  if (!Number.isFinite(monto) || !Number.isFinite(desc)) return null;

  const montoSeguro = Math.max(monto, 0);
  const descuentoSeguro = Math.min(Math.max(desc, 0), 100);

  return Number(
    (montoSeguro - (montoSeguro * descuentoSeguro) / 100).toFixed(2)
  );
};

const getCommercialValuesFromPlan = (plan) => {
  if (!plan) {
    return {
      monto_inicial_vigente: '',
      descuento_vigente: '',
      monto_base_vigente: ''
    };
  }

  const precioReferencia = parseNullableNumber(plan?.precio_referencia);
  const descuento = parseNullableNumber(plan?.descuento);
  const precioFinal = parseNullableNumber(plan?.precio_final);

  const descuentoResuelto = descuento ?? 0;
  const montoCalculado =
    precioReferencia !== null
      ? calculateMontoBase(precioReferencia, descuentoResuelto)
      : null;

  return {
    monto_inicial_vigente:
      precioReferencia !== null ? toInputNumberString(precioReferencia) : '',
    descuento_vigente: toInputNumberString(descuentoResuelto),
    monto_base_vigente:
      precioFinal !== null
        ? toInputNumberString(precioFinal)
        : montoCalculado !== null
          ? toInputNumberString(montoCalculado)
          : ''
  };
};

const ESTADO_OPTIONS = [
  { value: 'ACTIVO', label: 'Activo' },
  { value: 'PENDIENTE_INICIO', label: 'Pendiente inicio' },
  { value: 'PAUSADO', label: 'Pausado' }
];

const MODALIDAD_OPTIONS = [
  { value: 'TITULAR_SOLO', label: 'Titular solo' },
  { value: 'AMBOS', label: 'Titular + adicional' },
  { value: 'SOLO_ADICIONAL', label: 'Solo adicional' }
];

const MARCA_OPTIONS = [
  { value: 'VISA', label: 'VISA' },
  { value: 'MASTER', label: 'MASTER' }
];

const MONEDA_OPTIONS = [{ value: 'ARS', label: 'ARS' }];

const ROL_CARGA_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'VENDEDOR', label: 'Vendedor' },
  { value: 'RECEPCION', label: 'Recepción' }
];

const getPlanLabel = (item) =>
  item?.nombre ||
  item?.descripcion ||
  item?.titulo ||
  item?.label ||
  `Plan #${item?.id ?? item?.value ?? '-'}`;

const getBancoLabel = (item) =>
  item?.nombre ||
  item?.descripcion ||
  item?.label ||
  `Banco #${item?.id ?? item?.value ?? '-'}`;

const getSedeLabel = (item) =>
  item?.nombre ||
  item?.descripcion ||
  item?.label ||
  `Sede #${item?.id ?? item?.value ?? '-'}`;

const getTerminosLabel = (item) => {
  const version = item?.version ? `Versión ${item.version}` : null;
  const nombre =
    item?.nombre ||
    item?.titulo ||
    item?.descripcion_corta ||
    item?.label ||
    null;

  return (
    [version, nombre].filter(Boolean).join(' · ') ||
    `Términos #${item?.id ?? item?.value}`
  );
};

const normalizeBancoItem = (item) => ({
  ...item,
  id: item?.id ?? item?.value ?? '',
  nombre: item?.nombre || item?.label || item?.descripcion || '',
  descuento_off_pct:
    item?.descuento_off_pct ?? item?.descuentoPct ?? item?.descuento ?? 0,
  reintegro_pct:
    item?.reintegro_pct ?? item?.reintegroPct ?? item?.reintegro ?? 0,
  reintegro_desde_mes:
    item?.reintegro_desde_mes ?? item?.reintegroDesdeMes ?? null,
  reintegro_duracion_meses:
    item?.reintegro_duracion_meses ?? item?.reintegroDuracionMeses ?? null,
  descripcion_publica:
    item?.descripcion_publica ??
    item?.descripcionPublica ??
    item?.beneficio ??
    ''
});

/* Benjamin Orellana - 09/04/2026 - Se preservan explícitamente los campos comerciales del plan para autocompletar valores vigentes */
const normalizePlanItem = (item) => ({
  ...item,
  id: item?.id ?? item?.value ?? '',
  nombre: item?.nombre || item?.label || item?.descripcion || item?.titulo || '',
  precio_referencia:
    item?.precio_referencia ??
    item?.precioReferencia ??
    item?.monto_inicial ??
    item?.montoInicial ??
    null,
  descuento:
    item?.descuento ??
    item?.descuento_pct ??
    item?.descuentoPct ??
    0,
  precio_final:
    item?.precio_final ??
    item?.precioFinal ??
    item?.monto_final ??
    item?.montoFinal ??
    null
});

/* Benjamin Orellana - 09/04/2026 - Determina si el plan ya viene con datos comerciales suficientes para hidratar el formulario sin consultar detalle */
const hasCommercialPlanData = (plan) => {
  if (!plan) return false;

  return (
    parseNullableNumber(plan?.precio_referencia) !== null ||
    parseNullableNumber(plan?.precio_final) !== null
  );
};

/* Benjamin Orellana - 09/04/2026 - Normaliza una respuesta de detalle de plan para poder reutilizar la misma lógica de autocompletado */
const normalizePlanDetailPayload = (payload) => {
  const single = normalizeSingle(payload);
  const raw = single?.registro || single?.plan || single?.data || single;
  return normalizePlanItem(raw);
};

const normalizeSedeItem = (item) => ({
  ...item,
  id: item?.id ?? item?.value ?? '',
  nombre: item?.nombre || item?.label || item?.descripcion || ''
});

const normalizeTerminoItem = (item) => ({
  ...item,
  id: item?.id ?? item?.value ?? '',
  titulo: item?.titulo || item?.label || item?.nombre || ''
});

const buildInitialForm = (defaultRolCarga = 'ADMIN') => ({
  sede_id: '',
  estado_general: 'ACTIVO',
  fecha_aprobacion: getTodayInput(),
  fecha_inicio_cobro: getFirstDayNextMonthInput(),

  titular_nombre: '',
  titular_dni: '',
  titular_email: '',
  titular_telefono: '',

  banco_id: '',
  marca_tarjeta: 'VISA',
  confirmo_tarjeta_credito: 1,
  tarjeta_ultimos4: '',
  tarjeta_mascara: '',
  tarjeta_numero: '',

  modalidad_adhesion: 'TITULAR_SOLO',
  titular_plan_id: '',

  adicional_nombre: '',
  adicional_dni: '',
  adicional_email: '',
  adicional_telefono: '',
  adicional_plan_id: '',

  terminos_id: '',
  rol_carga_origen: defaultRolCarga,

  beneficio_descripcion_snapshot: '',
  beneficio_descuento_off_pct_snapshot: '0',
  beneficio_reintegro_pct_snapshot: '0',
  beneficio_reintegro_desde_mes_snapshot: '',
  beneficio_reintegro_duracion_meses_snapshot: '',

  /* Benjamin Orellana - 09/04/2026 - Se agregan los tres campos comerciales vigentes al alta directa */
  monto_inicial_vigente: '',
  descuento_vigente: '',
  monto_base_vigente: '',
  especial: '',
  moneda: 'ARS',
  observaciones_internas: '',
  observaciones_cliente: '',

  crear_periodo_inicial: true
});

const Section = ({ icon: Icon, title, children, className = '' }) => (
  <div
    className={`rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] ${className}`}
  >
    <div className="mb-3 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-orange-500" />}
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
    </div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
    {children}
  </label>
);

const Input = ({ className = '', leftIcon: LeftIcon, ...props }) => (
  <div className="relative">
    {LeftIcon ? (
      <LeftIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    ) : null}
    <input
      {...props}
      className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 ${LeftIcon ? 'pl-10' : ''} ${className}`}
    />
  </div>
);

const Select = ({ children, className = '', ...props }) => (
  <select
    {...props}
    className={`h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
  >
    {children}
  </select>
);

const applyBancoBenefitToForm = (prevForm, banco) => {
  if (!banco) {
    return {
      ...prevForm,
      beneficio_descripcion_snapshot: '',
      beneficio_descuento_off_pct_snapshot: '0',
      beneficio_reintegro_pct_snapshot: '0',
      beneficio_reintegro_desde_mes_snapshot: '',
      beneficio_reintegro_duracion_meses_snapshot: ''
    };
  }

  return {
    ...prevForm,
    beneficio_descripcion_snapshot: String(banco?.descripcion_publica || ''),
    beneficio_descuento_off_pct_snapshot: String(
      Number(banco?.descuento_off_pct || 0)
    ),
    beneficio_reintegro_pct_snapshot: String(Number(banco?.reintegro_pct || 0)),
    beneficio_reintegro_desde_mes_snapshot:
      banco?.reintegro_desde_mes !== null &&
      banco?.reintegro_desde_mes !== undefined &&
      banco?.reintegro_desde_mes !== ''
        ? String(banco.reintegro_desde_mes)
        : '',
    beneficio_reintegro_duracion_meses_snapshot:
      banco?.reintegro_duracion_meses !== null &&
      banco?.reintegro_duracion_meses !== undefined &&
      banco?.reintegro_duracion_meses !== ''
        ? String(banco.reintegro_duracion_meses)
        : ''
  };
};

const ModalClienteCrear = ({
  open,
  onClose,
  onCreated,
  sedes = [],
  bancos = [],
  planes = [],
  terminos = [],
  userId = null,
  defaultRolCarga = 'ADMIN'
}) => {
  const [form, setForm] = useState(buildInitialForm(defaultRolCarga));
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(defaultRolCarga));
    setError('');
    setSuccessMsg('');
    setSubmitting(false);
  }, [open, defaultRolCarga]);

  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .map(normalizeSedeItem)
      .filter((item) => {
        if (!item?.id) return false;

        if (item?.es_ciudad === undefined || item?.es_ciudad === null) {
          return true;
        }

        const esCiudad =
          item?.es_ciudad === true ||
          item?.es_ciudad === 1 ||
          String(item?.es_ciudad).toLowerCase() === 'true';

        return esCiudad;
      })
      .sort((a, b) =>
        String(getSedeLabel(a)).localeCompare(String(getSedeLabel(b)), 'es')
      );
  }, [sedes]);

  const bancosOptions = useMemo(() => {
    return (Array.isArray(bancos) ? bancos : [])
      .map(normalizeBancoItem)
      .filter((item) => item?.id)
      .sort((a, b) =>
        String(getBancoLabel(a)).localeCompare(String(getBancoLabel(b)), 'es')
      );
  }, [bancos]);

  const planesOptions = useMemo(() => {
    return (Array.isArray(planes) ? planes : [])
      .map(normalizePlanItem)
      .filter((item) => item?.id)
      .sort((a, b) =>
        String(getPlanLabel(a)).localeCompare(String(getPlanLabel(b)), 'es')
      );
  }, [planes]);

  const terminosOptions = useMemo(() => {
    return (Array.isArray(terminos) ? terminos : [])
      .map(normalizeTerminoItem)
      .filter((item) => item?.id)
      .sort((a, b) =>
        String(getTerminosLabel(b)).localeCompare(
          String(getTerminosLabel(a)),
          'es'
        )
      );
  }, [terminos]);

  /* Benjamin Orellana - 09/04/2026 - Se indexan los planes para autocompletar rápidamente los valores comerciales */
  const planesMap = useMemo(() => {
    const map = new Map();
    planesOptions.forEach((item) => {
      if (item?.id) {
        map.set(String(item.id), item);
      }
    });
    return map;
  }, [planesOptions]);

  const selectedBanco = useMemo(() => {
    if (!form.banco_id) return null;

    return (
      bancosOptions.find((item) => String(item.id) === String(form.banco_id)) ||
      null
    );
  }, [bancosOptions, form.banco_id]);

  const requiresAdditional =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  /* Benjamin Orellana - 09/04/2026 - Hidrata monto inicial, descuento y monto final desde el plan seleccionado, consultando el detalle si el catálogo vino recortado */
  const hydrateCommercialFieldsFromPlanId = async (planId) => {
    if (!planId) {
      setForm((prev) => ({
        ...prev,
        monto_inicial_vigente: '',
        descuento_vigente: '',
        monto_base_vigente: ''
      }));
      return;
    }

    try {
      let plan = planesMap.get(String(planId)) || null;

      if (!hasCommercialPlanData(plan)) {
        const response = await api.get(`/debitos-automaticos-planes/${planId}`);
        plan = normalizePlanDetailPayload(response.data);
      }

      const commercial = getCommercialValuesFromPlan(plan);

      setForm((prev) => ({
        ...prev,
        monto_inicial_vigente: commercial.monto_inicial_vigente,
        descuento_vigente: commercial.descuento_vigente,
        monto_base_vigente: commercial.monto_base_vigente
      }));
    } catch (err) {
      setForm((prev) => ({
        ...prev,
        monto_inicial_vigente: '',
        descuento_vigente: '0',
        monto_base_vigente: ''
      }));

      setError(
        err?.response?.data?.mensajeError ||
          'No se pudo cargar automáticamente el plan seleccionado.'
      );
    }
  };

  useEffect(() => {
    if (!open) return;

    if (!form.terminos_id && terminosOptions.length === 1) {
      setForm((prev) => ({
        ...prev,
        terminos_id: String(terminosOptions[0].id)
      }));
    }
  }, [open, form.terminos_id, terminosOptions]);

  /* Benjamin Orellana - 06/04/2026 - Se fuerza la hidratación de snapshots de beneficio cada vez que cambia el banco seleccionado, y también se limpian cuando no hay banco */
  useEffect(() => {
    if (!open) return;

    setForm((prev) => {
      if (!prev.banco_id) {
        return applyBancoBenefitToForm(prev, null);
      }

      if (!selectedBanco) return prev;

      return applyBancoBenefitToForm(prev, selectedBanco);
    });
  }, [open, form.banco_id, selectedBanco]);

  /* Benjamin Orellana - 09/04/2026 - Recalcula automáticamente el monto final cuando cambian monto inicial o descuento */
  useEffect(() => {
    if (!open) return;

    const montoInicial = parseNullableNumber(form.monto_inicial_vigente);
    const descuento = parseNullableNumber(form.descuento_vigente);

    if (montoInicial === null || descuento === null) {
      setForm((prev) => {
        if (prev.monto_base_vigente === '') return prev;

        return {
          ...prev,
          monto_base_vigente: ''
        };
      });
      return;
    }

    const recalculado = calculateMontoBase(montoInicial, descuento);
    const nextValue =
      recalculado !== null ? toInputNumberString(recalculado) : '';

    setForm((prev) => {
      if (prev.monto_base_vigente === nextValue) return prev;

      return {
        ...prev,
        monto_base_vigente: nextValue
      };
    });
  }, [open, form.monto_inicial_vigente, form.descuento_vigente]);

  if (!open) return null;

  const handleChange = (field, value) => {
    setForm((prev) => {
      let next = { ...prev, [field]: value };

      if (field === 'tarjeta_ultimos4') {
        const digits = onlyDigits(value).slice(-4);
        next.tarjeta_ultimos4 = digits;

        const currentMask = String(prev.tarjeta_mascara || '').trim();
        const autoMask = buildMaskFromLast4(digits);

        if (
          !currentMask ||
          currentMask === buildMaskFromLast4(prev.tarjeta_ultimos4)
        ) {
          next.tarjeta_mascara = autoMask;
        }
      }

      if (field === 'tarjeta_numero') {
        const digits = onlyDigits(value);
        if (digits.length >= 4) {
          const last4 = digits.slice(-4);
          next.tarjeta_ultimos4 = last4;

          const currentMask = String(prev.tarjeta_mascara || '').trim();
          const previousAutoMask = buildMaskFromLast4(prev.tarjeta_ultimos4);
          const nextAutoMask = buildMaskFromLast4(last4);

          if (!currentMask || currentMask === previousAutoMask) {
            next.tarjeta_mascara = nextAutoMask;
          }
        }
      }

      if (field === 'banco_id') {
        const bancoSeleccionado = bancosOptions.find(
          (item) => String(item.id) === String(value)
        );
        next = applyBancoBenefitToForm(next, bancoSeleccionado);
      }

      if (field === 'modalidad_adhesion') {
        if (value === 'SOLO_ADICIONAL') {
          next.titular_plan_id = '';
          next.monto_inicial_vigente = '';
          next.descuento_vigente = '';
          next.monto_base_vigente = '';
        }

        if (value === 'TITULAR_SOLO') {
          next.adicional_nombre = '';
          next.adicional_dni = '';
          next.adicional_email = '';
          next.adicional_telefono = '';
          next.adicional_plan_id = '';
        }
      }

      /* Benjamin Orellana - 09/04/2026 - Al seleccionar el plan titular se autocompletan los campos comerciales vigentes */
      if (field === 'titular_plan_id') {
        const planSeleccionado = planesMap.get(String(value)) || null;
        const commercial = getCommercialValuesFromPlan(planSeleccionado);

        next.monto_inicial_vigente = commercial.monto_inicial_vigente;
        next.descuento_vigente = commercial.descuento_vigente;
        next.monto_base_vigente = commercial.monto_base_vigente;
      }

      /* Benjamin Orellana - 09/04/2026 - En modalidad solo adicional, al seleccionar el plan adicional también se autocompletan los campos comerciales */
      if (
        field === 'adicional_plan_id' &&
        (prev.modalidad_adhesion === 'SOLO_ADICIONAL' ||
          next.modalidad_adhesion === 'SOLO_ADICIONAL')
      ) {
        const planSeleccionado = planesMap.get(String(value)) || null;
        const commercial = getCommercialValuesFromPlan(planSeleccionado);

        next.monto_inicial_vigente = commercial.monto_inicial_vigente;
        next.descuento_vigente = commercial.descuento_vigente;
        next.monto_base_vigente = commercial.monto_base_vigente;
      }

      return next;
    });

    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const validate = () => {
    if (!form.sede_id) return 'Debes seleccionar una sede.';
    if (!form.estado_general) return 'Debes seleccionar el estado inicial.';
    if (!form.fecha_aprobacion) return 'Debes ingresar la fecha de aprobación.';
    if (!form.fecha_inicio_cobro)
      return 'Debes ingresar la fecha de inicio de cobro.';
    if (!form.titular_nombre.trim())
      return 'Debes ingresar el nombre del titular.';
    if (!form.titular_dni.trim()) return 'Debes ingresar el DNI del titular.';
    if (!form.titular_email.trim())
      return 'Debes ingresar el email del titular.';
    if (!form.banco_id) return 'Debes seleccionar un banco.';
    if (!form.marca_tarjeta) return 'Debes seleccionar la marca de tarjeta.';

    if (!/^\d{4}$/.test(String(form.tarjeta_ultimos4 || ''))) {
      return 'Debes ingresar los últimos 4 dígitos de la tarjeta.';
    }

    if (!form.tarjeta_mascara.trim()) {
      return 'Debes ingresar la máscara de tarjeta.';
    }

    if (!form.terminos_id) return 'Debes seleccionar los términos aceptados.';

    if (
      ['TITULAR_SOLO', 'AMBOS'].includes(form.modalidad_adhesion) &&
      !form.titular_plan_id
    ) {
      return 'Debes seleccionar un plan titular para esta modalidad.';
    }

    if (requiresAdditional) {
      if (!form.adicional_nombre.trim()) {
        return 'Debes ingresar el nombre de la persona adicional.';
      }
      if (!form.adicional_dni.trim()) {
        return 'Debes ingresar el DNI de la persona adicional.';
      }
      if (!form.adicional_email.trim()) {
        return 'Debes ingresar el email de la persona adicional.';
      }
      if (!form.adicional_plan_id) {
        return 'Debes seleccionar el plan de la persona adicional.';
      }
    }

    if (!form.beneficio_descripcion_snapshot.trim()) {
      return 'Debes ingresar la descripción del beneficio.';
    }

    if (
      form.monto_inicial_vigente === '' ||
      Number(form.monto_inicial_vigente) <= 0 ||
      Number.isNaN(Number(form.monto_inicial_vigente))
    ) {
      return 'Debes ingresar un monto inicial vigente válido.';
    }

    if (
      form.descuento_vigente === '' ||
      Number(form.descuento_vigente) < 0 ||
      Number(form.descuento_vigente) > 100 ||
      Number.isNaN(Number(form.descuento_vigente))
    ) {
      return 'Debes ingresar un descuento vigente válido entre 0 y 100.';
    }

    if (
      form.monto_base_vigente === '' ||
      Number(form.monto_base_vigente) <= 0 ||
      Number.isNaN(Number(form.monto_base_vigente))
    ) {
      return 'Debes ingresar un monto base vigente válido.';
    }

    return '';
  };

  const buildPayload = () => {
    const payload = {
      sede_id: Number(form.sede_id),
      estado_general: form.estado_general,
      fecha_aprobacion: form.fecha_aprobacion,
      fecha_inicio_cobro: form.fecha_inicio_cobro,

      titular_nombre: form.titular_nombre.trim(),
      titular_dni: form.titular_dni.trim(),
      titular_email: form.titular_email.trim().toLowerCase(),
      titular_telefono: form.titular_telefono.trim() || null,

      banco_id: Number(form.banco_id),
      marca_tarjeta: form.marca_tarjeta,
      confirmo_tarjeta_credito: Number(form.confirmo_tarjeta_credito) === 1,
      tarjeta_ultimos4: String(form.tarjeta_ultimos4).trim(),
      tarjeta_mascara: form.tarjeta_mascara.trim(),
      tarjeta_numero: String(form.tarjeta_numero || '').trim() || null,

      modalidad_adhesion: form.modalidad_adhesion,
      titular_plan_id:
        form.modalidad_adhesion === 'SOLO_ADICIONAL'
          ? null
          : Number(form.titular_plan_id),

      terminos_id: Number(form.terminos_id),
      rol_carga_origen: form.rol_carga_origen,

      beneficio_descripcion_snapshot:
        form.beneficio_descripcion_snapshot.trim(),
      beneficio_descuento_off_pct_snapshot: Number(
        form.beneficio_descuento_off_pct_snapshot || 0
      ),
      beneficio_reintegro_pct_snapshot: Number(
        form.beneficio_reintegro_pct_snapshot || 0
      ),
      beneficio_reintegro_desde_mes_snapshot:
        form.beneficio_reintegro_desde_mes_snapshot === ''
          ? null
          : Number(form.beneficio_reintegro_desde_mes_snapshot),
      beneficio_reintegro_duracion_meses_snapshot:
        form.beneficio_reintegro_duracion_meses_snapshot === ''
          ? null
          : Number(form.beneficio_reintegro_duracion_meses_snapshot),

      /* Benjamin Orellana - 09/04/2026 - Se envían los tres campos comerciales vigentes al crear el cliente */
      monto_inicial_vigente: Number(form.monto_inicial_vigente),
      descuento_vigente: Number(form.descuento_vigente),
      monto_base_vigente: Number(form.monto_base_vigente),
      especial: form.especial.trim() || null,
      moneda: form.moneda,
      observaciones_internas: form.observaciones_internas.trim() || null,
      observaciones_cliente: form.observaciones_cliente.trim() || null,

      creado_por: userId ? Number(userId) : null,
      updated_by: userId ? Number(userId) : null,
      crear_periodo_inicial: !!form.crear_periodo_inicial
    };

    if (requiresAdditional) {
      payload.adicional = {
        nombre: form.adicional_nombre.trim(),
        dni: form.adicional_dni.trim(),
        email: form.adicional_email.trim().toLowerCase(),
        telefono: form.adicional_telefono.trim() || null,
        plan_id: Number(form.adicional_plan_id)
      };
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = buildPayload();
      const response = await api.post('/debitos-automaticos-clientes', payload);
      const createdRow = normalizeSingle(response.data);

      setSuccessMsg('Cliente creado correctamente.');

      if (typeof onCreated === 'function') {
        onCreated(createdRow);
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError || 'No se pudo crear el cliente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1470] flex items-center justify-center p-3 sm:p-5"
        variants={backdropV}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          onClick={!submitting ? onClose : undefined}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Alta directa
                </p>
                <h2 className="mt-1 font-bignoodle text-xl font-black text-slate-900 sm:text-2xl">
                  Crear cliente
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(95vh-90px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <Section
                icon={User}
                title="Titular y alta"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Sede</Label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Select
                        value={form.sede_id}
                        onChange={(e) =>
                          handleChange('sede_id', e.target.value)
                        }
                        disabled={submitting}
                        className="pl-10"
                      >
                        <option value="">Seleccionar sede</option>
                        {sedesOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getSedeLabel(item)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Estado inicial</Label>
                    <Select
                      value={form.estado_general}
                      onChange={(e) =>
                        handleChange('estado_general', e.target.value)
                      }
                      disabled={submitting}
                    >
                      {ESTADO_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Fecha aprobación</Label>
                    <Input
                      type="date"
                      value={form.fecha_aprobacion}
                      onChange={(e) =>
                        handleChange('fecha_aprobacion', e.target.value)
                      }
                      disabled={submitting}
                      leftIcon={CalendarDays}
                    />
                  </div>

                  <div>
                    <Label>Fecha inicio cobro</Label>
                    <Input
                      type="date"
                      value={form.fecha_inicio_cobro}
                      onChange={(e) =>
                        handleChange('fecha_inicio_cobro', e.target.value)
                      }
                      disabled={submitting}
                      leftIcon={CalendarDays}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Titular nombre</Label>
                    <Input
                      type="text"
                      value={form.titular_nombre}
                      onChange={(e) =>
                        handleChange('titular_nombre', e.target.value)
                      }
                      disabled={submitting}
                      placeholder="Ej. Juan Pérez"
                      leftIcon={User}
                    />
                  </div>

                  <div>
                    <Label>Titular DNI</Label>
                    <Input
                      type="text"
                      value={form.titular_dni}
                      onChange={(e) =>
                        handleChange('titular_dni', e.target.value)
                      }
                      disabled={submitting}
                      placeholder="Ej. 30111222"
                    />
                  </div>

                  <div>
                    <Label>Titular email</Label>
                    <Input
                      type="email"
                      value={form.titular_email}
                      onChange={(e) =>
                        handleChange('titular_email', e.target.value)
                      }
                      disabled={submitting}
                      placeholder="ejemplo@mail.com"
                      leftIcon={Mail}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Titular teléfono</Label>
                    <Input
                      type="text"
                      value={form.titular_telefono}
                      onChange={(e) =>
                        handleChange('titular_telefono', e.target.value)
                      }
                      disabled={submitting}
                      placeholder="3815551234"
                      leftIcon={Phone}
                    />
                  </div>
                </div>
              </Section>

              <Section
                icon={CreditCard}
                title="Banco y tarjeta"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Banco</Label>
                    <div className="relative">
                      <Landmark className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Select
                        value={form.banco_id}
                        onChange={(e) =>
                          handleChange('banco_id', e.target.value)
                        }
                        disabled={submitting}
                        className="pl-10"
                      >
                        <option value="">Seleccionar banco</option>
                        {bancosOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getBancoLabel(item)}
                          </option>
                        ))}
                      </Select>
                    </div>

                    {selectedBanco?.descripcion_publica ? (
                      <div className="mt-3 rounded-2xl border border-orange-200 bg-orange-50/80 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="mt-0.5 h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-500">
                              Beneficio
                            </p>
                            <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                              {selectedBanco.descripcion_publica}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label>Marca tarjeta</Label>
                    <Select
                      value={form.marca_tarjeta}
                      onChange={(e) =>
                        handleChange('marca_tarjeta', e.target.value)
                      }
                      disabled={submitting}
                    >
                      {MARCA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Tarjeta completa</Label>
                    <Input
                      type="text"
                      value={form.tarjeta_numero}
                      onChange={(e) =>
                        handleChange('tarjeta_numero', e.target.value)
                      }
                      disabled={submitting}
                      placeholder="Se cifrará internamente"
                    />
                  </div>

                  <div>
                    <Label>Últimos 4</Label>
                    <Input
                      type="text"
                      value={form.tarjeta_ultimos4}
                      onChange={(e) =>
                        handleChange('tarjeta_ultimos4', e.target.value)
                      }
                      disabled={submitting}
                      maxLength={4}
                      placeholder="1234"
                    />
                  </div>

                  <div>
                    <Label>Confirmó tar. de crédito</Label>
                    <Select
                      value={form.confirmo_tarjeta_credito}
                      onChange={(e) =>
                        handleChange(
                          'confirmo_tarjeta_credito',
                          Number(e.target.value)
                        )
                      }
                      disabled={submitting}
                    >
                      <option value={1}>Sí</option>
                      <option value={0}>No</option>
                    </Select>
                  </div>
                </div>
              </Section>

              <Section
                icon={BadgeCheck}
                title="Modalidad y planes"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Modalidad adhesión</Label>
                    <Select
                      value={form.modalidad_adhesion}
                      onChange={(e) =>
                        handleChange('modalidad_adhesion', e.target.value)
                      }
                      disabled={submitting}
                    >
                      {MODALIDAD_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Plan titular</Label>
                    <Select
                      value={form.titular_plan_id}
                      onChange={async (e) => {
                        const value = e.target.value;
                        handleChange('titular_plan_id', value);

                        if (form.modalidad_adhesion !== 'SOLO_ADICIONAL') {
                          await hydrateCommercialFieldsFromPlanId(value);
                        }
                      }}
                      disabled={
                        submitting ||
                        form.modalidad_adhesion === 'SOLO_ADICIONAL'
                      }
                    >
                      <option value="">Seleccionar plan</option>
                      {planesOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getPlanLabel(item)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Section>

              <Section
                icon={Users}
                title="Persona adicional"
                className="xl:col-span-6"
              >
                {requiresAdditional ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Label>Nombre adicional</Label>
                      <Input
                        type="text"
                        value={form.adicional_nombre}
                        onChange={(e) =>
                          handleChange('adicional_nombre', e.target.value)
                        }
                        disabled={submitting}
                        placeholder="Ej. María Pérez"
                        leftIcon={User}
                      />
                    </div>

                    <div>
                      <Label>DNI adicional</Label>
                      <Input
                        type="text"
                        value={form.adicional_dni}
                        onChange={(e) =>
                          handleChange('adicional_dni', e.target.value)
                        }
                        disabled={submitting}
                        placeholder="Ej. 33444555"
                      />
                    </div>

                    <div>
                      <Label>Email adicional</Label>
                      <Input
                        type="email"
                        value={form.adicional_email}
                        onChange={(e) =>
                          handleChange('adicional_email', e.target.value)
                        }
                        disabled={submitting}
                        placeholder="adicional@mail.com"
                        leftIcon={Mail}
                      />
                    </div>

                    <div>
                      <Label>Teléfono adicional</Label>
                      <Input
                        type="text"
                        value={form.adicional_telefono}
                        onChange={(e) =>
                          handleChange('adicional_telefono', e.target.value)
                        }
                        disabled={submitting}
                        placeholder="3815559876"
                        leftIcon={Phone}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <Label>Plan adicional</Label>
                      <Select
                        value={form.adicional_plan_id}
                        onChange={async (e) => {
                          const value = e.target.value;
                          handleChange('adicional_plan_id', value);

                          if (form.modalidad_adhesion === 'SOLO_ADICIONAL') {
                            await hydrateCommercialFieldsFromPlanId(value);
                          }
                        }}
                        disabled={submitting}
                      >
                        <option value="">Seleccionar plan</option>
                        {planesOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {getPlanLabel(item)}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                    La modalidad actual no requiere persona adicional.
                  </div>
                )}
              </Section>

              <Section
                icon={Sparkles}
                title="Beneficio y monto"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Especial</Label>
                    <Input
                      type="text"
                      value={form.especial}
                      onChange={(e) => handleChange('especial', e.target.value)}
                      disabled={submitting}
                      placeholder="Ej. Primer mes $10.000"
                      leftIcon={Sparkles}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>Descripción beneficio</Label>
                    <Input
                      type="text"
                      value={form.beneficio_descripcion_snapshot}
                      onChange={(e) =>
                        handleChange(
                          'beneficio_descripcion_snapshot',
                          e.target.value
                        )
                      }
                      disabled={submitting}
                      placeholder="Se completa automáticamente según el banco"
                    />
                  </div>

                  <div>
                    <Label>% descuento off</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.beneficio_descuento_off_pct_snapshot}
                      onChange={(e) =>
                        handleChange(
                          'beneficio_descuento_off_pct_snapshot',
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label>% reintegro</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.beneficio_reintegro_pct_snapshot}
                      onChange={(e) =>
                        handleChange(
                          'beneficio_reintegro_pct_snapshot',
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label>Reintegro desde mes</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={form.beneficio_reintegro_desde_mes_snapshot}
                      onChange={(e) =>
                        handleChange(
                          'beneficio_reintegro_desde_mes_snapshot',
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label>Duración reintegro (meses)</Label>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={form.beneficio_reintegro_duracion_meses_snapshot}
                      onChange={(e) =>
                        handleChange(
                          'beneficio_reintegro_duracion_meses_snapshot',
                          e.target.value
                        )
                      }
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Label>Monto inicial vigente</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monto_inicial_vigente}
                      onChange={(e) =>
                        handleChange('monto_inicial_vigente', e.target.value)
                      }
                      disabled={submitting}
                      leftIcon={Wallet}
                    />
                  </div>

                  <div>
                    <Label>Descuento vigente</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={form.descuento_vigente}
                      onChange={(e) =>
                        handleChange('descuento_vigente', e.target.value)
                      }
                      disabled={submitting}
                      leftIcon={Wallet}
                    />
                  </div>

                  <div>
                    <Label>Monto base</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.monto_base_vigente}
                      onChange={(e) =>
                        handleChange('monto_base_vigente', e.target.value)
                      }
                      disabled
                      leftIcon={Wallet}
                      className="bg-slate-50"
                    />
                  </div>

                  <div>
                    <Label>Moneda</Label>
                    <Select
                      value={form.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      disabled={submitting}
                    >
                      {MONEDA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </Section>

              <Section
                icon={ShieldCheck}
                title="Términos y operación"
                className="xl:col-span-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label>Términos aceptados</Label>
                    <Select
                      value={form.terminos_id}
                      onChange={(e) =>
                        handleChange('terminos_id', e.target.value)
                      }
                      disabled={submitting}
                    >
                      <option value="">Seleccionar términos</option>
                      {terminosOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {getTerminosLabel(item)}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Rol carga origen</Label>
                    <Select
                      value={form.rol_carga_origen}
                      onChange={(e) =>
                        handleChange('rol_carga_origen', e.target.value)
                      }
                      disabled={submitting}
                    >
                      {ROL_CARGA_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <Label>Crear período inicial</Label>
                    <Select
                      value={form.crear_periodo_inicial ? '1' : '0'}
                      onChange={(e) =>
                        handleChange(
                          'crear_periodo_inicial',
                          e.target.value === '1'
                        )
                      }
                      disabled={submitting}
                    >
                      <option value="1">Sí</option>
                      <option value="0">No</option>
                    </Select>
                  </div>
                </div>
              </Section>

              <Section
                icon={FileText}
                title="Observaciones"
                className="xl:col-span-12"
              >
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  <div>
                    <Label>Observaciones internas</Label>
                    <textarea
                      value={form.observaciones_internas}
                      onChange={(e) =>
                        handleChange('observaciones_internas', e.target.value)
                      }
                      disabled={submitting}
                      rows={5}
                      placeholder="Escribí observaciones internas..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <Label>Observaciones cliente</Label>
                    <textarea
                      value={form.observaciones_cliente}
                      onChange={(e) =>
                        handleChange('observaciones_cliente', e.target.value)
                      }
                      disabled={submitting}
                      rows={5}
                      placeholder="Opcional..."
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </Section>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {successMsg && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMsg}
              </div>
            )}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Crear cliente
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};;

export default ModalClienteCrear;
