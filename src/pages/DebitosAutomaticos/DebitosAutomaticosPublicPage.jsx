import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  CreditCard,
  ShieldCheck,
  UserRound,
  CheckCircle2,
  CircleAlert,
  FileText,
  X,
  Lock,
  Pencil,
  BookUser
} from 'lucide-react';
import Footer from '../../components/footer/Footer';
import creditCardType from 'credit-card-type';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
/* Benjamin Orellana - 07/04/2026 - Íconos sociales para la firma visual del modal de éxito */
import { FaFacebookF, FaWhatsapp, FaInstagram } from 'react-icons/fa';
const API_URL = 'http://localhost:8080';

const BANCOS_ENDPOINT = `${API_URL}/debitos-automaticos-bancos`;
const PLANES_ENDPOINT = `${API_URL}/debitos-automaticos-planes`;
const PLANES_POR_SEDE_ENDPOINT = `${API_URL}/debitos-automaticos-planes-por-sede`;
const TERMINOS_ENDPOINT = `${API_URL}/debitos-automaticos-terminos`;
const SUBMIT_ENDPOINT = `${API_URL}/debitos-automaticos-solicitudes/publica`;

const easeOut = [0.16, 1, 0.3, 1];

const formDrop = {
  hidden: { opacity: 0, y: -60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
      when: 'beforeChildren',
      delayChildren: 0.2,
      staggerChildren: 0.3
    }
  },
  exit: { opacity: 0, y: 50, transition: { duration: 0.3, ease: easeOut } }
};

const itemUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: easeOut } }
};

const initialForm = {
  titular_nombre: '',
  titular_dni: '',
  titular_email: '',
  titular_telefono: '',
  /* Benjamin Orellana - 07/04/2026 - Se agrega sede_id al estado inicial del formulario para enviar la sede seleccionada en el flujo de débitos automáticos */
  sede_id: '',
  banco_id: '',
  marca_tarjeta: '',
  confirmo_tarjeta_credito: false,
  tarjeta_numero: '',
  modalidad_adhesion: 'TITULAR_SOLO',
  titular_plan_id: '',
  adicional_nombre: '',
  adicional_dni: '',
  adicional_email: '',
  adicional_telefono: '',
  adicional_plan_id: '',
  terminos_id: '',
  terminos_aceptados: false,
  observaciones_cliente: ''
};

function extractList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.registros)) return payload.registros;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

function isActiveRecord(item) {
  if (item?.activo !== undefined) return Boolean(Number(item.activo));
  if (item?.estado !== undefined) {
    return ['ACTIVO', 'VIGENTE', 'HABILITADO', 'PUBLICADO'].includes(
      String(item.estado).toUpperCase()
    );
  }
  return true;
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function maskCard(number) {
  const digits = onlyDigits(number);
  if (!digits) return '•••• •••• •••• ••••';
  return digits
    .padEnd(16, '•')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function luhnCheck(cardNumber) {
  const digits = onlyDigits(cardNumber);
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function getBancoLabel(banco) {
  return (
    banco?.nombre ||
    banco?.banco ||
    banco?.descripcion ||
    banco?.razon_social ||
    `Banco #${banco?.id}`
  );
}

function formatARS(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

function getPlanLabel(plan) {
  const base =
    plan?.nombre || plan?.descripcion || plan?.codigo || `Plan #${plan?.id}`;

  // const precio = formatARS(plan?.precio_base);

  return base;
}

function getTerminosLabel(termino) {
  return (
    termino?.titulo ||
    termino?.nombre ||
    termino?.version ||
    `Términos #${termino?.id}`
  );
}

function validateForm(form, { requireSede = false } = {}) {
  const errors = {};
  const titularDni = onlyDigits(form.titular_dni);
  const tarjetaNumero = onlyDigits(form.tarjeta_numero);
  const adicionalDni = onlyDigits(form.adicional_dni);
  const needsAdditional =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  /* Benjamin Orellana - 07/04/2026 - Se valida sede_id cuando el formulario se usa dentro del nuevo flujo por pasos */
  if (requireSede && !form.sede_id) {
    errors.sede_id = 'Seleccioná una sede antes de continuar.';
  }

  if (!form.titular_nombre.trim()) {
    errors.titular_nombre = 'Ingresá el nombre completo del titular.';
  }

  if (titularDni.length < 7 || titularDni.length > 9) {
    errors.titular_dni = 'Ingresá un DNI válido.';
  }

  if (!form.titular_email.trim()) {
    errors.titular_email = 'Ingresá el email del titular.';
  } else if (!isValidEmail(form.titular_email)) {
    errors.titular_email = 'Ingresá un email válido.';
  }

  if (!form.banco_id) {
    errors.banco_id = 'Seleccioná un banco.';
  }

  if (!form.marca_tarjeta) {
    errors.marca_tarjeta = 'Seleccioná la marca de la tarjeta.';
  }

  if (!form.confirmo_tarjeta_credito) {
    errors.confirmo_tarjeta_credito =
      'Debés confirmar que la tarjeta es de crédito.';
  }

  if (!tarjetaNumero) {
    errors.tarjeta_numero = 'Ingresá el número de tarjeta.';
  } else if (!luhnCheck(tarjetaNumero)) {
    errors.tarjeta_numero = 'El número de tarjeta no es válido.';
  }

  if (
    ['TITULAR_SOLO', 'AMBOS'].includes(form.modalidad_adhesion) &&
    !form.titular_plan_id
  ) {
    errors.titular_plan_id = 'Seleccioná un plan para el titular.';
  }

  if (needsAdditional) {
    if (!form.adicional_nombre.trim()) {
      errors.adicional_nombre = 'Ingresá el nombre del adicional.';
    }

    if (adicionalDni.length < 7 || adicionalDni.length > 9) {
      errors.adicional_dni = 'Ingresá un DNI válido para el adicional.';
    }

    if (!form.adicional_email.trim()) {
      errors.adicional_email = 'Ingresá el email del adicional.';
    } else if (!isValidEmail(form.adicional_email)) {
      errors.adicional_email = 'Ingresá un email válido para el adicional.';
    }

    if (!form.adicional_plan_id) {
      errors.adicional_plan_id = 'Seleccioná un plan para el adicional.';
    }
  }

  if (!form.terminos_id) {
    errors.terminos_id = 'No se encontraron términos vigentes.';
  }

  if (!form.terminos_aceptados) {
    errors.terminos_aceptados = 'Debés aceptar los términos y condiciones.';
  }

  return errors;
}

/* Benjamin Orellana - 07/04/2026 - Se habilita modo embebido para reutilizar el formulario de débitos dentro del flujo por pasos con selección previa de sede */
export default function DebitosAutomaticosPublicPage({
  embedded = false,
  selectedSede = null,
  onBack = null
}) {
  const [showIntro, setShowIntro] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [bancos, setBancos] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [terminos, setTerminos] = useState([]);

  const [openTerminosModal, setOpenTerminosModal] = useState(false);

  const [openReviewModal, setOpenReviewModal] = useState(false);

  const formTopRef = useRef(null);
  const titularSectionRef = useRef(null);
  const tarjetaSectionRef = useRef(null);
  const adicionalesSectionRef = useRef(null);
  const terminosSectionRef = useRef(null);

  const selectedBanco = useMemo(
    () => bancos.find((item) => String(item.id) === String(form.banco_id)),
    [bancos, form.banco_id]
  );

  const selectedTitularPlan = useMemo(
    () =>
      planes.find((item) => String(item.id) === String(form.titular_plan_id)),
    [planes, form.titular_plan_id]
  );

  const selectedAdditionalPlan = useMemo(
    () =>
      planes.find((item) => String(item.id) === String(form.adicional_plan_id)),
    [planes, form.adicional_plan_id]
  );

  const currentTermino = useMemo(
    () => terminos.find((item) => String(item.id) === String(form.terminos_id)),
    [terminos, form.terminos_id]
  );

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  /* Benjamin Orellana - 07/04/2026 - En modo embebido se desactiva la intro propia porque el flujo contenedor ya maneja la entrada visual */
  useEffect(() => {
    if (embedded) {
      setShowIntro(false);
    }
  }, [embedded]);

  /* Benjamin Orellana - 07/04/2026 - Se sincroniza la sede elegida en el paso 1 con el formulario embebido para enviarla al backend */
  useEffect(() => {
    if (!embedded || !selectedSede?.id) return;

    setForm((prev) => {
      const nextSedeId = String(selectedSede.id);

      if (String(prev.sede_id || '') === nextSedeId) return prev;

      return {
        ...prev,
        sede_id: nextSedeId
      };
    });

    setErrors((prev) => {
      if (!prev.sede_id) return prev;
      const next = { ...prev };
      delete next.sede_id;
      return next;
    });
  }, [embedded, selectedSede]);

  useEffect(() => {
    let active = true;

    /* Benjamin Orellana - 2026/04/15 - En el flujo embebido se cargan los planes filtrados por la sede seleccionada para evitar ofrecer combinaciones plan+sede inválidas en el formulario público. */
    const fetchCatalogs = async () => {
      try {
        setLoadingCatalogs(true);
        setServerError('');

        const planesRequest =
          embedded && selectedSede?.id
            ? axios.get(PLANES_POR_SEDE_ENDPOINT, {
                params: { sede_id: selectedSede.id }
              })
            : axios.get(PLANES_ENDPOINT);

        const [bancosRes, planesRes, terminosRes] = await Promise.all([
          axios.get(BANCOS_ENDPOINT),
          planesRequest,
          axios.get(TERMINOS_ENDPOINT)
        ]);

        if (!active) return;

        const bancosData = extractList(bancosRes.data).filter(isActiveRecord);
        const planesData = extractList(planesRes.data).filter(isActiveRecord);
        const terminosData = extractList(terminosRes.data).filter(
          isActiveRecord
        );

        setBancos(bancosData);
        setPlanes(planesData);
        setTerminos(terminosData);

        const latestTermino =
          [...terminosData].sort((a, b) => Number(b.id) - Number(a.id))[0] ||
          null;

        setForm((prev) => ({
          ...prev,
          terminos_id: latestTermino?.id ? String(latestTermino.id) : ''
        }));
      } catch (error) {
        if (!active) return;

        setServerError(
          error?.response?.data?.mensajeError ||
            'No se pudieron cargar los datos necesarios del formulario.'
        );
      } finally {
        if (active) setLoadingCatalogs(false);
      }
    };

    /* Benjamin Orellana - 2026/04/15 - Si el flujo embebido todavía no tiene sede seleccionada, no se consultan planes hasta contar con esa referencia. */
    if (embedded && !selectedSede?.id) {
      setPlanes([]);
      setLoadingCatalogs(false);
      return () => {
        active = false;
      };
    }

    fetchCatalogs();

    return () => {
      active = false;
    };
  }, [embedded, selectedSede?.id]);

    useEffect(() => {
      /* Benjamin Orellana - 2026/04/15 - Si cambia la sede y el plan previamente elegido ya no existe en el catálogo filtrado, se limpia la selección para evitar enviar IDs inválidos. */
      setForm((prev) => {
        const titularValido =
          !prev.titular_plan_id ||
          planes.some(
            (item) => String(item.id) === String(prev.titular_plan_id)
          );

        const adicionalValido =
          !prev.adicional_plan_id ||
          planes.some(
            (item) => String(item.id) === String(prev.adicional_plan_id)
          );

        if (titularValido && adicionalValido) return prev;

        return {
          ...prev,
          titular_plan_id: titularValido ? prev.titular_plan_id : '',
          adicional_plan_id: adicionalValido ? prev.adicional_plan_id : ''
        };
      });

      setErrors((prev) => {
        const next = { ...prev };

        const titularValido =
          !form.titular_plan_id ||
          planes.some(
            (item) => String(item.id) === String(form.titular_plan_id)
          );

        const adicionalValido =
          !form.adicional_plan_id ||
          planes.some(
            (item) => String(item.id) === String(form.adicional_plan_id)
          );

        if (!titularValido) delete next.titular_plan_id;
        if (!adicionalValido) delete next.adicional_plan_id;

        return next;
      });
    }, [planes, form.titular_plan_id, form.adicional_plan_id]);
  
  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };

      if (field === 'modalidad_adhesion') {
        if (value === 'TITULAR_SOLO') {
          next.adicional_nombre = '';
          next.adicional_dni = '';
          next.adicional_email = '';
          next.adicional_telefono = '';
          next.adicional_plan_id = '';
        }

        if (value === 'SOLO_ADICIONAL') {
          next.titular_plan_id = '';
        }
      }

      return next;
    });

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    setServerError('');
  };

  // Detecta VISA / MASTER en base al número ingresado
  const detectMarcaTarjeta = (numero = '') => {
    const digits = onlyDigits(numero);

    if (!digits) return '';

    const matches = creditCardType(digits);
    const detected = matches?.[0]?.type || '';

    if (detected === 'visa') return 'VISA';
    if (detected === 'mastercard') return 'MASTER';

    return '';
  };

  const handleTarjetaNumeroChange = (value) => {
    const digits = onlyDigits(value).slice(0, 19);

    handleChange('tarjeta_numero', digits);

    const marcaDetectada = detectMarcaTarjeta(digits);

    // Solo autocompleta si detecta una marca válida
    if (marcaDetectada && marcaDetectada !== form.marca_tarjeta) {
      handleChange('marca_tarjeta', marcaDetectada);
    }
  };

  const renderCardBrandIcon = () => {
    if (form.marca_tarjeta === 'VISA') {
      return (
        <FaCcVisa className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-sky-600" />
      );
    }

    if (form.marca_tarjeta === 'MASTER') {
      return (
        <FaCcMastercard className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-orange-500" />
      );
    }

    return (
      <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
    );
  };

  const handleAceptarTerminos = () => {
    handleChange('terminos_aceptados', true);
    setOpenTerminosModal(false);
  };

  const handleAbrirTerminos = () => {
    setOpenTerminosModal(true);
  };

  const additionalEnabled =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  const handleToggleAdicional = (checked) => {
    if (checked) {
      // Por defecto, al activar, dejamos "AMBOS"
      handleChange(
        'modalidad_adhesion',
        form.modalidad_adhesion === 'SOLO_ADICIONAL'
          ? 'SOLO_ADICIONAL'
          : 'AMBOS'
      );
      return;
    }

    // Si desactiva, vuelve a titular solo
    handleChange('modalidad_adhesion', 'TITULAR_SOLO');

    // Limpieza opcional de datos del adicional
    handleChange('adicional_nombre', '');
    handleChange('adicional_dni', '');
    handleChange('adicional_plan_id', '');
    handleChange('adicional_email', '');
    handleChange('adicional_telefono', '');
  };

  const scrollToFormTop = () => {
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goToSection = (ref) => {
    setOpenReviewModal(false);

    setTimeout(() => {
      ref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 220);
  };

  const handleEditSection = (section) => {
    if (section === 'titular') return goToSection(titularSectionRef);
    if (section === 'tarjeta') return goToSection(tarjetaSectionRef);
    if (section === 'adicionales') return goToSection(adicionalesSectionRef);
    if (section === 'terminos') return goToSection(terminosSectionRef);
  };

  const submitSolicitud = async () => {
    /* Benjamin Orellana - 07/04/2026 - Se resuelve sede_id desde la sede seleccionada del contenedor para asegurar que siempre viaje al backend */
    const resolvedSedeId = Number(embedded ? selectedSede?.id : form.sede_id);

    if (!resolvedSedeId) {
      setServerError('sede_id es obligatorio.');
      scrollToFormTop();
      return;
    }

    const payload = {
      titular_nombre: form.titular_nombre.trim(),
      titular_dni: onlyDigits(form.titular_dni),
      titular_email: form.titular_email.trim().toLowerCase(),
      titular_telefono: form.titular_telefono.trim() || null,
      /* Benjamin Orellana - 07/04/2026 - Se agrega sede_id al estado inicial del formulario para enviar la sede seleccionada en el flujo de débitos automáticos */
      sede_id: resolvedSedeId,
      banco_id: Number(form.banco_id),
      marca_tarjeta: form.marca_tarjeta,
      confirmo_tarjeta_credito: form.confirmo_tarjeta_credito ? 1 : 0,
      tarjeta_numero: onlyDigits(form.tarjeta_numero),
      modalidad_adhesion: form.modalidad_adhesion,
      titular_plan_id:
        form.modalidad_adhesion === 'SOLO_ADICIONAL'
          ? null
          : Number(form.titular_plan_id),
      terminos_id: Number(form.terminos_id),
      terminos_aceptados: form.terminos_aceptados ? 1 : 0,
      observaciones_cliente: form.observaciones_cliente.trim() || null,

      adicional_nombre:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : form.adicional_nombre.trim(),
      adicional_dni:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : onlyDigits(form.adicional_dni),
      adicional_email:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : form.adicional_email.trim().toLowerCase(),
      adicional_telefono:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : form.adicional_telefono.trim() || null,
      adicional_plan_id:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : Number(form.adicional_plan_id),

      adicional:
        form.modalidad_adhesion === 'TITULAR_SOLO'
          ? null
          : {
              nombre: form.adicional_nombre.trim(),
              dni: onlyDigits(form.adicional_dni),
              email: form.adicional_email.trim().toLowerCase(),
              telefono: form.adicional_telefono.trim() || null,
              plan_id: Number(form.adicional_plan_id)
            }
    };

    try {
      setSubmitting(true);

      const response = await axios.post(SUBMIT_ENDPOINT, payload);

      setSuccessData(response?.data?.registro || response?.data || {});
      setOpenReviewModal(false);
      setErrors({});
      setServerError('');

      /* Benjamin Orellana - 07/04/2026 - Luego del envío se conserva la sede seleccionada para no romper el flujo embebido */
      setForm({
        ...initialForm,
        sede_id: embedded && selectedSede?.id ? String(selectedSede.id) : '',
        terminos_id: form.terminos_id
      });

      scrollToFormTop();
    } catch (error) {
      setOpenReviewModal(false);
      setServerError(
        error?.response?.data?.mensajeError ||
          'No se pudo registrar la solicitud. Revisá los datos e intentá nuevamente.'
      );
      scrollToFormTop();
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Benjamin Orellana - 07/04/2026 - En modo embebido se exige que la sede ya venga seleccionada desde el paso 1 */
    const foundErrors = validateForm(form, {
      requireSede: embedded
    });
    setErrors(foundErrors);
    setServerError('');

    if (Object.keys(foundErrors).length > 0) {
      scrollToFormTop();
      return;
    }

    setOpenReviewModal(true);
  };

  const needsAdditional =
    form.modalidad_adhesion === 'AMBOS' ||
    form.modalidad_adhesion === 'SOLO_ADICIONAL';

  function formatPct(value) {
    const n = Number(value || 0);
    if (!Number.isFinite(n) || n <= 0) return null;

    return `${Number.isInteger(n) ? n.toFixed(0) : n.toFixed(2)}%`;
  }

  function getBancoPromoItems(banco) {
    if (!banco) return [];

    const items = [];

    const descuentoOff = formatPct(banco.descuento_off_pct);
    const reintegroPct = formatPct(banco.reintegro_pct);
    const desdeMes = Number(banco.reintegro_desde_mes || 0);
    const duracionMeses = Number(banco.reintegro_duracion_meses || 0);
    const permanente = Boolean(Number(banco.beneficio_permanente || 0));

    if (descuentoOff) {
      items.push({
        label: 'Descuento',
        value: `${descuentoOff} OFF`
      });
    }

    if (reintegroPct) {
      items.push({
        label: 'Reintegro',
        value: `${reintegroPct}`
      });
    }

    if (reintegroPct && desdeMes > 0) {
      items.push({
        label: 'Inicio',
        value: `Desde el mes ${desdeMes}`
      });
    }

    if (reintegroPct && duracionMeses > 0) {
      items.push({
        label: 'Duración',
        value: permanente ? 'Beneficio permanente' : `${duracionMeses} meses`
      });
    } else if (permanente) {
      items.push({
        label: 'Duración',
        value: 'Beneficio permanente'
      });
    }

    return items;
  }

  function BancoPromoCard({ banco }) {
    if (!banco) return null;

    const promoItems = getBancoPromoItems(banco);
    const descripcion =
      banco.descripcion_publica?.trim() ||
      'Este banco posee beneficios vigentes para la adhesión al débito automático.';

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.985 }}
        transition={{ duration: 0.28, ease: easeOut }}
        className="mt-3 overflow-hidden rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_18px_60px_-28px_rgba(249,115,22,0.38)]"
      >
        <div className="border-b border-orange-100 bg-white/70 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shadow-inner">
              <Building2 className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-500">
                Promoción del banco seleccionado
              </p>
              <h4 className="mt-1 text-sm font-bold text-slate-900">
                {getBancoLabel(banco)}
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {descripcion}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 py-4">
          {promoItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {promoItems.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="rounded-2xl border border-orange-100 bg-white/90 px-4 py-3 shadow-sm"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              No hay beneficios promocionales configurados para este banco.
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const shellClassName = embedded
    ? 'relative w-full overflow-visible bg-transparent text-slate-900'
    : 'relative min-h-screen overflow-hidden bg-white text-slate-900';

  return (
    <section className={shellClassName}>
      {!embedded && <LightParticlesBackgroundCanvas />}
      {!embedded && (
        <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(50%_50%_at_50%_50%,transparent,black)]">
          <div
            className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
            style={{
              background:
                'conic-gradient(from 180deg at 50% 50%, rgba(251,146,60,.22), rgba(244,114,182,.14), rgba(251,191,36,.20), rgba(251,146,60,.22))'
            }}
          />
          <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8"></div>{' '}
        </div>
      )}
      {!embedded && (
        <IntroOverlay open={showIntro} onClose={() => setShowIntro(false)} />
      )}
      <SuccessModal
        open={!!successData}
        data={successData}
        onClose={() => setSuccessData(null)}
      />
      <TerminosModal
        open={openTerminosModal}
        termino={currentTermino}
        accepted={form.terminos_aceptados}
        onAccept={handleAceptarTerminos}
        onClose={() => setOpenTerminosModal(false)}
      />
      <ReviewSubmitModal
        open={openReviewModal}
        form={form}
        submitting={submitting}
        selectedBanco={selectedBanco}
        selectedTitularPlan={selectedTitularPlan}
        selectedAdditionalPlan={selectedAdditionalPlan}
        needsAdditional={needsAdditional}
        onClose={() => setOpenReviewModal(false)}
        onConfirm={submitSolicitud}
        onEditSection={handleEditSection}
      />
      <div
        className={`relative z-10 mx-auto flex w-full ${
          embedded
            ? 'max-w-none items-start justify-start px-0 py-0'
            : 'min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8'
        }`}
      >
        {' '}
        <motion.div
          ref={formTopRef}
          variants={formDrop}
          initial="hidden"
          animate="show"
          className="w-full"
        >
          {embedded ? (
            <div className="mb-6 overflow-hidden rounded-[28px] border border-orange-100 bg-white/95 shadow-[0_18px_60px_-30px_rgba(251,146,60,0.38)]">
              <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-orange-50 px-5 py-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
                      <ShieldCheck className="h-4 w-4" />
                      Paso 2
                    </div>

                    <h2 className="mt-3 font-bignoodle text-3xl tracking-wide text-slate-900">
                      Completá tu solicitud de débito automático
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      Ya seleccionaste la sede. Ahora completá los datos del
                      formulario.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {selectedSede?.nombre && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                        <Building2 className="h-4 w-4" />
                        {selectedSede.nombre}
                      </div>
                    )}

                    {typeof onBack === 'function' && (
                      <button
                        type="button"
                        onClick={onBack}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50"
                      >
                        Volver a sedes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto mb-8 max-w-4xl text-center">
              <motion.div
                variants={itemUp}
                className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-orange-700 shadow-sm backdrop-blur"
              >
                <ShieldCheck className="h-4 w-4" />
                Hammerx
              </motion.div>

              <motion.h1
                variants={itemUp}
                className="text-balance font-bignoodle text-3xl font-black uppercase tracking-tight text-slate-900 md:text-6xl"
              >
                Adherite al débito automático
              </motion.h1>
            </div>
          )}

          <div className="mx-auto w-full max-w-4xl">
            {' '}
            <motion.form
              onSubmit={handleSubmit}
              variants={itemUp}
              className="relative mx-auto overflow-hidden rounded-[32px] border border-orange-100 bg-white/90 p-5 shadow-[0_20px_80px_-30px_rgba(251,146,60,0.38)] backdrop-blur md:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

              {loadingCatalogs && (
                <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-800">
                  Cargando datos del formulario...
                </div>
              )}

              {serverError && (
                <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <CircleAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div ref={titularSectionRef} className="space-y-7">
                <SectionTitle
                  icon={<UserRound className="h-5 w-5" />}
                  title="Datos del titular"
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock
                    label="Nombre completo"
                    error={errors.titular_nombre}
                  >
                    <input
                      type="text"
                      value={form.titular_nombre}
                      onChange={(e) =>
                        handleChange('titular_nombre', e.target.value)
                      }
                      placeholder="Ej: Juan Pérez"
                      className={inputClass(errors.titular_nombre)}
                    />
                  </FieldBlock>

                  <FieldBlock label="DNI" error={errors.titular_dni}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.titular_dni}
                      onChange={(e) =>
                        handleChange(
                          'titular_dni',
                          onlyDigits(e.target.value).slice(0, 9)
                        )
                      }
                      placeholder="Ej: 30123456"
                      className={inputClass(errors.titular_dni)}
                    />
                  </FieldBlock>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock label="Email" error={errors.titular_email}>
                    <input
                      type="email"
                      value={form.titular_email}
                      onChange={(e) =>
                        handleChange('titular_email', e.target.value)
                      }
                      placeholder="Ej: juan@email.com"
                      className={inputClass(errors.titular_email)}
                    />
                  </FieldBlock>

                  <FieldBlock label="Teléfono" error={errors.titular_telefono}>
                    <input
                      type="text"
                      inputMode="tel"
                      value={form.titular_telefono}
                      onChange={(e) =>
                        handleChange('titular_telefono', e.target.value)
                      }
                      placeholder="Ej: 3815551234"
                      className={inputClass(errors.titular_telefono)}
                    />
                  </FieldBlock>
                </div>
              </div>

              <div className="relative py-3 mt-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
              </div>

              <div ref={tarjetaSectionRef} className="space-y-7 mt-4">
                <SectionTitle
                  icon={<Building2 className="h-5 w-5" />}
                  title="tarjeta"
                  // subtitle="Seleccioná el banco y completá los datos de la tarjeta de crédito."
                />

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                  <FieldBlock
                    label="Número de tarjeta"
                    error={errors.tarjeta_numero}
                    // helper={
                    //   form.marca_tarjeta
                    //     ? `Marca detectada: ${form.marca_tarjeta}`
                    //     : 'Ingresá los primeros números para detectar la marca automáticamente.'
                    // }
                  >
                    <div className="relative">
                      {renderCardBrandIcon()}

                      <input
                        type="text"
                        inputMode="numeric"
                        value={form.tarjeta_numero}
                        onChange={(e) =>
                          handleTarjetaNumeroChange(e.target.value)
                        }
                        placeholder="Ej: 4509123412341234"
                        className={`${inputClass(
                          errors.tarjeta_numero
                        )} pl-12 tracking-[0.22em]`}
                      />
                    </div>
                  </FieldBlock>

                  <div>
                    <label
                      className={`mt-5 flex min-h-[54px] w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 transition ${
                        form.confirmo_tarjeta_credito
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-semibold text-slate-800">
                          Es tarjeta de crédito
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-center justify-center">
                        <span className="relative inline-flex h-6 w-11 items-center">
                          <input
                            type="checkbox"
                            checked={form.confirmo_tarjeta_credito}
                            onChange={(e) =>
                              handleChange(
                                'confirmo_tarjeta_credito',
                                e.target.checked
                              )
                            }
                            className="peer sr-only"
                          />
                          <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-orange-500" />
                          <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                        </span>

                        <span className="mt-1 text-[10px] leading-none text-slate-400">
                          Click para confirmar
                        </span>
                      </div>
                    </label>

                    {errors.confirmo_tarjeta_credito && (
                      <p className="mt-2 text-xs font-semibold text-red-600">
                        {errors.confirmo_tarjeta_credito}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <FieldBlock label="Banco" error={errors.banco_id}>
                      <select
                        value={form.banco_id}
                        onChange={(e) =>
                          handleChange('banco_id', e.target.value)
                        }
                        className={inputClass(errors.banco_id)}
                      >
                        <option value="">Seleccionar banco</option>
                        {bancos.map((banco) => (
                          <option key={banco.id} value={banco.id}>
                            {getBancoLabel(banco)}
                          </option>
                        ))}
                      </select>

                      <AnimatePresence mode="wait">
                        {selectedBanco && (
                          <BancoPromoCard
                            key={selectedBanco.id}
                            banco={selectedBanco}
                          />
                        )}
                      </AnimatePresence>
                    </FieldBlock>
                  </div>

                  <FieldBlock
                    label="Marca de tarjeta"
                    error={errors.marca_tarjeta}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {['VISA', 'MASTER'].map((marca) => {
                        const selected = form.marca_tarjeta === marca;

                        return (
                          <button
                            key={marca}
                            type="button"
                            onClick={() => handleChange('marca_tarjeta', marca)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                              selected
                                ? 'border-orange-500 bg-orange-500 text-white shadow-[0_10px_30px_-12px_rgba(251,146,60,0.8)]'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50'
                            }`}
                          >
                            {marca}
                          </button>
                        );
                      })}
                    </div>
                  </FieldBlock>
                </div>
              </div>

              <div className="relative py-3 mt-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
              </div>

              <div ref={adicionalesSectionRef} className="space-y-7 mt-4">
                <SectionTitle
                  icon={<ShieldCheck className="h-5 w-5" />}
                  title="Adicionales"
                />

                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="mt-4">
                      <label
                        className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border px-4 py-4 transition ${
                          additionalEnabled
                            ? 'border-orange-300 bg-orange-50'
                            : 'border-slate-200 bg-white hover:border-orange-200 hover:bg-orange-50/50'
                        }`}
                      >
                        <div className="min-w-0 pr-4">
                          <p className="text-sm font-semibold text-slate-800">
                            ¿Desea adherir otra persona?
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Activá esta opción para elegir si deseas abonar para
                            otra persona o si deseas agregarlos a tu plan.
                          </p>
                        </div>

                        <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
                          <input
                            type="checkbox"
                            checked={additionalEnabled}
                            onChange={(e) =>
                              handleToggleAdicional(e.target.checked)
                            }
                            className="peer sr-only"
                          />
                          <span className="absolute inset-0 rounded-full bg-slate-300 transition peer-checked:bg-orange-500" />
                          <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                        </span>
                      </label>

                      {errors.modalidad_adhesion && (
                        <p className="mt-3 text-xs font-medium text-red-600">
                          {errors.modalidad_adhesion}
                        </p>
                      )}
                    </div>

                    {additionalEnabled && (
                      <div className="mt-4 rounded-2xl border border-orange-100 bg-white px-4 py-4">
                        <div className="mb-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                            Tipo de adhesión
                          </div>
                          <div className="mt-1 text-sm text-slate-600">
                            Elegí cómo querés registrar la solicitud adicional.
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {[
                            {
                              value: 'AMBOS',
                              title: 'Ambos',
                              description:
                                'Se adhiere la persona titular y una adicional.'
                            },
                            {
                              value: 'SOLO_ADICIONAL',
                              title: 'Solo adicional',
                              description:
                                'Se registra únicamente una persona adicional.'
                            }
                          ].map((option) => {
                            const selected =
                              form.modalidad_adhesion === option.value;

                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() =>
                                  handleChange(
                                    'modalidad_adhesion',
                                    option.value
                                  )
                                }
                                className={`rounded-2xl border p-4 text-left transition ${
                                  selected
                                    ? 'border-orange-500 bg-orange-500 text-white shadow-[0_14px_34px_-16px_rgba(251,146,60,0.9)]'
                                    : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-orange-300 hover:bg-orange-50'
                                }`}
                              >
                                <div className="text-sm font-bold">
                                  {option.title}
                                </div>
                                <div
                                  className={`mt-1 text-xs leading-5 ${
                                    selected
                                      ? 'text-orange-50'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  {option.description}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {needsAdditional && (
                    <div className="rounded-[28px] border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-5">
                      <div className="mb-4">
                        <div className="text-sm font-bold uppercase tracking-[0.18em] text-orange-700">
                          Persona adicional
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          Completá los datos de la persona adicional asociada a
                          la solicitud.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FieldBlock
                          label="Nombre completo"
                          error={errors.adicional_nombre}
                        >
                          <input
                            type="text"
                            value={form.adicional_nombre}
                            onChange={(e) =>
                              handleChange('adicional_nombre', e.target.value)
                            }
                            placeholder="Ej: María López"
                            className={inputClass(errors.adicional_nombre)}
                          />
                        </FieldBlock>

                        <FieldBlock label="DNI" error={errors.adicional_dni}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={form.adicional_dni}
                            onChange={(e) =>
                              handleChange(
                                'adicional_dni',
                                onlyDigits(e.target.value).slice(0, 9)
                              )
                            }
                            placeholder="Ej: 28999888"
                            className={inputClass(errors.adicional_dni)}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label="Email"
                          error={errors.adicional_email}
                        >
                          <input
                            type="email"
                            value={form.adicional_email}
                            onChange={(e) =>
                              handleChange('adicional_email', e.target.value)
                            }
                            placeholder="Ej: maria@email.com"
                            className={inputClass(errors.adicional_email)}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label="Teléfono"
                          error={errors.adicional_telefono}
                        >
                          <input
                            type="text"
                            inputMode="tel"
                            value={form.adicional_telefono}
                            onChange={(e) =>
                              handleChange('adicional_telefono', e.target.value)
                            }
                            placeholder="Ej: 3815559876"
                            className={inputClass(errors.adicional_telefono)}
                          />
                        </FieldBlock>

                        <FieldBlock
                          label="Plan del adicional"
                          error={errors.adicional_plan_id}
                        >
                          <select
                            value={form.adicional_plan_id}
                            onChange={(e) =>
                              handleChange('adicional_plan_id', e.target.value)
                            }
                            className={inputClass(errors.adicional_plan_id)}
                          >
                            <option value="">Seleccionar plan</option>
                            {planes.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {getPlanLabel(plan)}
                              </option>
                            ))}
                          </select>
                        </FieldBlock>

                        {/* <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                            Plan adicional
                          </div>
                          <div className="mt-2 text-sm font-semibold text-slate-800">
                            {selectedAdditionalPlan
                              ? getPlanLabel(selectedAdditionalPlan)
                              : 'Todavía no seleccionaste un plan'}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {selectedAdditionalPlan?.precio_referencia !==
                            undefined
                              ? `Referencia: ${formatARS(
                                  selectedAdditionalPlan.precio_referencia
                                )}`
                              : 'La solicitud se registrará con el plan seleccionado.'}
                          </div>
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="relative py-3 mt-2">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
              </div>

              {form.modalidad_adhesion !== 'SOLO_ADICIONAL' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FieldBlock
                    // label="Plan del titular"
                    error={errors.titular_plan_id}
                  >
                    <SectionTitle
                      icon={<BookUser className="h-5 w-5" />}
                      title="PLAN"
                    />
                    <select
                      value={form.titular_plan_id}
                      onChange={(e) =>
                        handleChange('titular_plan_id', e.target.value)
                      }
                      className={inputClass(errors.titular_plan_id)}
                    >
                      <option value="">Seleccionar plan del titular</option>
                      {planes.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {getPlanLabel(plan)}
                        </option>
                      ))}
                    </select>
                  </FieldBlock>

                  {/* <div className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                        <div className="mt-2 text-sm font-semibold text-slate-800">
                          {selectedTitularPlan
                            ? getPlanLabel(selectedTitularPlan)
                            : 'Todavía no seleccionaste un plan'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {selectedTitularPlan?.precio_referencia !== undefined
                            ? `Referencia: ${formatARS(
                                selectedTitularPlan.precio_referencia
                              )}`
                            : 'El detalle final quedará sujeto a validación interna.'}
                        </div>
                      </div> */}
                </div>
              )}

              {form.modalidad_adhesion !== 'SOLO_ADICIONAL' && (
                <div className="relative py-3 mt-2">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-orange-300 to-transparent" />
                </div>
              )}

              <div ref={terminosSectionRef} className="space-y-4 mt-4">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-800">
                          Términos y Condiciones
                        </div>

                        {/* <div className="mt-1 text-xs text-slate-500">
                          {currentTermino?.version
                            ? `Versión: ${currentTermino.version}`
                            : 'Versión activa'}
                        </div> */}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAbrirTerminos}
                          className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                        >
                          <FileText className="h-4 w-4" />
                          Leer carta
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAbrirTerminos}
                      className={`mt-4 w-full rounded-2xl border px-4 py-4 text-left transition ${
                        form.terminos_aceptados
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100/70'
                          : 'border-orange-100 bg-white hover:border-orange-300 hover:bg-orange-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border ${
                              form.terminos_aceptados
                                ? 'border-emerald-200 bg-white text-emerald-600'
                                : 'border-slate-200 bg-slate-50 text-slate-500'
                            }`}
                          >
                            {form.terminos_aceptados ? (
                              <ShieldCheck className="h-5 w-5" />
                            ) : (
                              <Lock className="h-5 w-5" />
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {form.terminos_aceptados
                                ? 'Términos aceptados correctamente'
                                : 'Leer y aceptar términos para continuar'}
                            </div>

                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {form.terminos_aceptados ? (
                                <>
                                  Ya confirmaste que leíste y aceptaste los
                                  términos y condiciones del débito automático.
                                </>
                              ) : (
                                <>
                                  Hacé click en este bloque para abrir la carta.
                                  El botón de aceptación se habilitará cuando
                                  llegues al final del texto.
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                            form.terminos_aceptados
                              ? 'border-emerald-200 bg-white text-emerald-700'
                              : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {form.terminos_aceptados ? 'Aceptado' : 'Pendiente'}
                        </div>
                      </div>
                    </button>

                    {errors.terminos_aceptados && (
                      <p className="mt-3 text-xs font-medium text-red-600">
                        {errors.terminos_aceptados}
                      </p>
                    )}
                  </div>

                  <FieldBlock
                    label="Observaciones"
                    helper="Opcional. Podés agregar una aclaración breve."
                  >
                    <textarea
                      rows={4}
                      value={form.observaciones_cliente}
                      onChange={(e) =>
                        handleChange('observaciones_cliente', e.target.value)
                      }
                      placeholder="Ej: Prefiero contacto por la mañana."
                      className={`${inputClass()} resize-none`}
                    />
                  </FieldBlock>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:flex-row md:items-center md:justify-between">
                <button
                  type="submit"
                  disabled={
                    submitting || loadingCatalogs || !form.terminos_aceptados
                  }
                  className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-bold text-white transition ${
                    submitting || loadingCatalogs || !form.terminos_aceptados
                      ? 'cursor-not-allowed bg-orange-300'
                      : 'bg-orange-600 shadow-[0_16px_38px_-14px_rgba(251,146,60,0.75)] hover:bg-orange-500'
                  }`}
                >
                  {submitting ? 'Enviando solicitud...' : 'Enviar solicitud'}
                </button>
              </div>
            </motion.form>
          </div>
        </motion.div>
      </div>
      {!embedded && <Footer></Footer>}{' '}
    </section>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
        {icon}
        {title}
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
    </div>
  );
}

function FieldBlock({ label, error, helper, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {helper && !error && (
        <p className="mt-2 text-xs text-slate-500">{helper}</p>
      )}
      {error && (
        <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>
      )}
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function ChecklistLine({ ok, text }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`inline-block h-2.5 w-2.5 rounded-full ${
          ok ? 'bg-emerald-500' : 'bg-slate-300'
        }`}
      />
      <span>{text}</span>
    </li>
  );
}

function inputClass(error) {
  return `w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
    error
      ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200'
      : 'border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
  }`;
}

function IntroOverlay({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-white/92 px-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.28 } }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.45, ease: easeOut }}
            className="w-full max-w-2xl rounded-[34px] border border-orange-100 bg-white p-6 text-center shadow-[0_35px_100px_-35px_rgba(251,146,60,0.45)] md:p-10"
          >
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-white shadow-[0_18px_40px_-16px_rgba(251,146,60,0.9)]">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <p className="text-xs font-bold uppercase tracking-[0.28em] text-orange-700">
              Hammer
            </p>

            <h2 className="mt-4 text-balance text-3xl font-black uppercase tracking-tight text-slate-900 md:text-5xl">
              Adherite al débito automático
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-orange-600 px-6 py-3 text-sm font-bold text-white shadow-[0_16px_40px_-16px_rgba(251,146,60,0.8)] transition hover:bg-orange-500"
            >
              Comenzar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SuccessModal({ open, data, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.35, ease: easeOut }}
            className="w-full max-w-lg rounded-[32px] border border-emerald-100 bg-white p-6 shadow-[0_30px_100px_-35px_rgba(16,185,129,0.55)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500 text-white">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            {/* Benjamin Orellana - 07/04/2026 - Texto principal actualizado del modal de éxito */}
            <h3 className="mt-5 text-center font-bignoodle text-4xl font-black uppercase tracking-tight text-slate-900">
              Solicitud enviada.
            </h3>

            <p className="mt-3 text-center text-sm leading-6 text-slate-600">
              Tu adhesión fue registrada correctamente.
              <br />
              Por favor revisa la casilla de tu correo.
            </p>

            {/* <div className="mt-6 grid gap-3">
              <SummaryItem label="ID de solicitud" value={data?.id || '-'} />
              <SummaryItem label="Estado" value={data?.estado || 'PENDIENTE'} />
              <SummaryItem
                label="Titular"
                value={data?.titular_nombre || '-'}
              />
              <SummaryItem label="DNI" value={data?.titular_dni || '-'} />
            </div> */}

            {/* Benjamin Orellana - 07/04/2026 - Firma sutil de Soft Fusion con redes sociales en el modal de éxito */}
            <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-slate-100 pt-4">
              <span className="text-center text-[11px] font-medium tracking-[0.04em] text-slate-400/90">
                Sistema desarrollado por{' '}
                <span className="font-bold text-pink-600">Soft Fusion</span>
              </span>

              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400/80 transition hover:text-blue-600"
                  aria-label="Facebook Soft Fusion"
                >
                  <FaFacebookF size={12} />
                </a>

                <a
                  href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400/80 transition hover:text-green-500"
                  aria-label="WhatsApp Soft Fusion"
                >
                  <FaWhatsapp size={12} />
                </a>

                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400/80 transition hover:text-pink-500"
                  aria-label="Instagram Soft Fusion"
                >
                  <FaInstagram size={12} />
                </a>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LightParticlesBackgroundCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    let raf;

    const config = {
      count: 110,
      maxSpeed: 0.42,
      linkDist: 120,
      hueBase: 22
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: config.count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * config.maxSpeed,
      vy: (Math.random() - 0.5) * config.maxSpeed,
      r: Math.random() * 1.15 + 0.35
    }));

    const loop = () => {
      raf = requestAnimationFrame(loop);

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const grd = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.72
      );
      grd.addColorStop(0, 'rgba(255, 180, 120, 0.06)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = width + 20;
        else if (p.x > width + 20) p.x = -20;

        if (p.y < -20) p.y = height + 20;
        else if (p.y > height + 20) p.y = -20;
      }

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < config.linkDist) {
            const alpha = 1 - dist / config.linkDist;
            ctx.strokeStyle = `hsla(${config.hueBase + (dx + dy) * 0.02}, 95%, 52%, ${alpha * 0.16})`;
            ctx.lineWidth = alpha * 1.05;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        ctx.fillStyle = `hsla(${config.hueBase + (p.x + p.y) * 0.02}, 95%, 50%, 0.82)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}

function TerminosModal({ open, termino, accepted, onAccept, onClose }) {
  const scrollRef = useRef(null);
  const [canAccept, setCanAccept] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setCanAccept(false);
      setScrollProgress(0);
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    /* Benjamin Orellana - 2026/04/13 - Reinicia el scroll del modal al abrir o cambiar el término para una lectura consistente. */
    el.scrollTop = 0;
    setCanAccept(false);
    setScrollProgress(0);

    /* Benjamin Orellana - 2026/04/13 - Controla avance de lectura y habilitación del botón de aceptación al llegar al final. */
    const checkScrollState = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;

      const maxScroll = Math.max(scrollHeight - clientHeight, 1);
      const progress = Math.min((scrollTop / maxScroll) * 100, 100);

      setScrollProgress(progress);

      const reachedBottom = scrollTop + clientHeight >= scrollHeight - 12;
      const noScrollNeeded = scrollHeight <= clientHeight + 12;

      if (reachedBottom || noScrollNeeded) {
        setCanAccept(true);
      }
    };

    const timer = setTimeout(() => {
      checkScrollState();
    }, 80);

    el.addEventListener('scroll', checkScrollState);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScrollState);
    };
  }, [open, termino]);

  const acceptEnabled = accepted || canAccept;
  const acceptButtonDisabled = accepted || !acceptEnabled;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          /* Benjamin Orellana - 2026/04/15 - Se elimina margen exterior en mobile para aprovechar toda la altura visible del modal. */
          className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/55 p-0 sm:p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.985 }}
            transition={{ duration: 0.32, ease: easeOut }}
            /* Benjamin Orellana - 2026/04/15 - Se lleva el modal a alto completo real en mobile para ceder más espacio al HTML legal. */
            className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-white sm:h-[92vh] sm:max-h-[92vh] sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-[0_35px_100px_-35px_rgba(15,23,42,0.38)]"
          >
            {/* Benjamin Orellana - 2026/04/15 - Se reduce el alto del header para dar prioridad visual al contenido legal. */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 px-3 py-2.5 sm:px-4 md:px-5">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">
                  <FileText className="h-3 w-3" />
                  Carta
                </div>

                <h3 className="mt-1.5 pr-2 text-[16px] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-[20px]">
                  Términos y Condiciones
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            {/* Benjamin Orellana - 2026/04/15 - Se minimiza la franja informativa para liberar más alto útil al área scrolleable. */}
            <div className="border-b border-slate-100 px-3 py-1.5 sm:px-4 md:px-5">
              <div className="mb-1 flex items-center justify-between gap-2">
                <div className="max-w-[190px] text-[10px] font-medium leading-3.5 text-slate-500 sm:max-w-none sm:text-[11px]">
                  {accepted
                    ? 'Carta aceptada'
                    : 'Deslizá hasta el final para aceptar'}
                </div>

                <div className="shrink-0 text-[10px] font-semibold text-slate-500 sm:text-[11px]">
                  {accepted ? '100%' : `${Math.round(scrollProgress)}%`}
                </div>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    acceptEnabled ? 'bg-orange-500' : 'bg-sky-500'
                  }`}
                  style={{
                    width: `${accepted ? 100 : Math.min(scrollProgress, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Benjamin Orellana - 2026/04/15 - Se reducen paddings y espaciados del cuerpo para que entre más contenido de la carta. */}
            <div
              ref={scrollRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-2.5 py-2 sm:px-3 sm:py-3 md:px-4"
            >
              {termino?.contenido_html ? (
                <div className="mx-auto w-full max-w-none">
                  <div
                    className="
                      text-[12.5px] leading-[1.45] text-slate-700
                      sm:text-[13px] sm:leading-[1.55]
                      [&>*:first-child]:mt-0
                      [&>*:last-child]:mb-0
                      [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-bold [&_h1]:leading-tight [&_h1]:text-slate-900
                      [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-[15px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-slate-900
                      [&_h3]:mb-1.5 [&_h3]:mt-2.5 [&_h3]:text-[13px] [&_h3]:font-semibold [&_h3]:leading-tight [&_h3]:text-slate-900
                      [&_p]:mb-2 [&_p]:text-inherit
                      [&_ul]:mb-2 [&_ul]:pl-4
                      [&_ol]:mb-2 [&_ol]:pl-4
                      [&_li]:mb-1
                      [&_strong]:font-semibold [&_strong]:text-slate-900
                    "
                    dangerouslySetInnerHTML={{
                      __html: termino.contenido_html
                    }}
                  />
                </div>
              ) : (
                <div className="mx-auto w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  No hay contenido disponible para los términos y condiciones.
                </div>
              )}
            </div>

            {/* Benjamin Orellana - 2026/04/15 - Se compacta el footer de acciones para dejar más pantalla al texto de términos. */}
            <div className="border-t border-slate-100 px-3 py-2 sm:px-4 md:px-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onAccept}
                  disabled={acceptButtonDisabled}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                    accepted
                      ? 'cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : acceptEnabled
                        ? 'bg-orange-600 text-white shadow-[0_16px_38px_-14px_rgba(251,146,60,0.75)] hover:bg-orange-500'
                        : 'cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400'
                  }`}
                >
                  {accepted ? 'Términos aceptados' : 'Leí y acepto'}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReviewSubmitModal({
  open,
  form,
  submitting,
  selectedBanco,
  selectedTitularPlan,
  selectedAdditionalPlan,
  needsAdditional,
  onClose,
  onConfirm,
  onEditSection
}) {
  const modalidadLabel = {
    TITULAR_SOLO: 'Titular solo',
    AMBOS: 'Titular + adicional',
    SOLO_ADICIONAL: 'Solo adicional'
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[76] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.32, ease: easeOut }}
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_35px_100px_-35px_rgba(15,23,42,0.38)]"
          >
            <div className="border-b border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmación
                  </div>

                  <h3 className="mt-3 font-bignoodle text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    Revisá tu solicitud antes de enviarla
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
              <div className="grid gap-4 md:grid-cols-2">
                <ReviewCard
                  title="Datos del titular"
                  onEdit={() => onEditSection('titular')}
                >
                  <SummaryItem
                    label="Nombre completo"
                    value={form.titular_nombre || 'Sin completar'}
                  />
                  <SummaryItem
                    label="DNI"
                    value={form.titular_dni || 'Sin completar'}
                  />
                  <SummaryItem
                    label="Email"
                    value={form.titular_email || 'Sin completar'}
                  />
                  <SummaryItem
                    label="Teléfono"
                    value={form.titular_telefono || 'No informado'}
                  />
                </ReviewCard>

                <ReviewCard
                  title="Tarjeta y banco"
                  onEdit={() => onEditSection('tarjeta')}
                >
                  <SummaryItem
                    label="Banco"
                    value={
                      selectedBanco
                        ? getBancoLabel(selectedBanco)
                        : 'Sin seleccionar'
                    }
                  />
                  <SummaryItem
                    label="Tarjeta"
                    value={
                      form.tarjeta_numero
                        ? maskCard(form.tarjeta_numero)
                        : 'Sin completar'
                    }
                  />
                  <SummaryItem
                    label="Marca"
                    value={form.marca_tarjeta || 'Sin seleccionar'}
                  />
                  <SummaryItem
                    label="Confirmación crédito"
                    value={
                      form.confirmo_tarjeta_credito ? 'Confirmado' : 'Pendiente'
                    }
                  />
                </ReviewCard>

                <ReviewCard
                  title="Adhesión y planes"
                  onEdit={() => onEditSection('adicionales')}
                >
                  <SummaryItem
                    label="Modalidad"
                    value={
                      modalidadLabel[form.modalidad_adhesion] ||
                      form.modalidad_adhesion
                    }
                  />
                  <SummaryItem
                    label="Plan del titular"
                    value={
                      selectedTitularPlan
                        ? getPlanLabel(selectedTitularPlan)
                        : form.modalidad_adhesion === 'SOLO_ADICIONAL'
                          ? 'No aplica'
                          : 'Sin seleccionar'
                    }
                  />
                  <SummaryItem
                    label="Persona adicional"
                    value={
                      needsAdditional
                        ? form.adicional_nombre || 'Pendiente de completar'
                        : 'No aplica'
                    }
                  />
                  <SummaryItem
                    label="Plan adicional"
                    value={
                      needsAdditional
                        ? selectedAdditionalPlan
                          ? getPlanLabel(selectedAdditionalPlan)
                          : 'Sin seleccionar'
                        : 'No aplica'
                    }
                  />
                </ReviewCard>

                <ReviewCard
                  title="Términos y observaciones"
                  onEdit={() => onEditSection('terminos')}
                >
                  <SummaryItem
                    label="Términos"
                    value={
                      form.terminos_aceptados ? 'Aceptados' : 'No aceptados'
                    }
                  />
                  <SummaryItem
                    label="Observaciones"
                    value={form.observaciones_cliente || 'Sin observaciones'}
                  />
                </ReviewCard>
              </div>
            </div>

            <div className="border-t border-slate-100 px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Seguir revisando
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={submitting}
                  className={`rounded-2xl px-5 py-3 text-sm font-bold text-white transition ${
                    submitting
                      ? 'cursor-not-allowed bg-orange-300'
                      : 'bg-orange-600 shadow-[0_16px_38px_-14px_rgba(251,146,60,0.75)] hover:bg-orange-500'
                  }`}
                >
                  {submitting ? 'Enviando solicitud...' : 'Confirmar y enviar'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReviewCard({ title, onEdit, children }) {
  return (
    <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-black uppercase tracking-[0.14em] text-slate-800">
            {title}
          </h4>
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-white text-orange-600 transition hover:bg-orange-50"
          title="Editar sección"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}
