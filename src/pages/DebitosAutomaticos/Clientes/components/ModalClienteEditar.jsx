import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Pencil,
  Save,
  Loader2,
  User,
  Landmark,
  CreditCard,
  CalendarDays,
  FileText,
  Building2,
  Wallet
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal de edición operativa para clientes adheridos del módulo Débitos Automáticos.
 * Permite modificar datos operativos del padrón sin tocar historial ni períodos.
 *
 * Tema: Edición de cliente - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 31/03/2026 - Modal de edición completa del cliente para actualizar datos operativos relevantes del padrón desde la misma vista */
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

const normalizeSingle = (payload) => {
  if (!payload) return null;
  if (payload?.row && !Array.isArray(payload.row)) return payload.row;
  if (payload?.data?.row && !Array.isArray(payload.data.row))
    return payload.data.row;
  if (payload?.data && !Array.isArray(payload.data)) return payload.data;
  if (payload?.item && !Array.isArray(payload.item)) return payload.item;
  return payload;
};

const toInputDate = (value) => {
  if (!value) return '';
  const text = String(value);
  return text.length >= 10 ? text.slice(0, 10) : '';
};

const onlyDigits = (value) => String(value || '').replace(/\D/g, '');

/* Benjamin Orellana - 09/04/2026 - Helpers numéricos para edición de valores comerciales vigentes */
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

/* Benjamin Orellana - 09/04/2026 - Obtiene snapshot comercial desde un plan cuando el cliente no trae aún esos valores poblados */
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

// Benjamin Orellana - 2026/04/13 - Resuelve la tarjeta completa inicial si el backend la habilitó para el usuario actual.
const resolveInitialCardValue = (cliente) => {
  return String(cliente?.tarjeta_numero_completo || '').replace(/\D/g, '');
};

// Benjamin Orellana - 2026/04/13 - Devuelve una referencia visual segura de la tarjeta actual para usuarios con o sin acceso completo.
const resolveCurrentCardReference = (cliente) => {
  if (cliente?.tarjeta_mascara) return cliente.tarjeta_mascara;
  if (cliente?.tarjeta_ultimos4) {
    return `**** **** **** ${cliente.tarjeta_ultimos4}`;
  }
  return '';
};

const modalidadOptions = [
  { value: 'TITULAR_SOLO', label: 'Titular solo' },
  { value: 'AMBOS', label: 'Titular + adicional' },
  { value: 'SOLO_ADICIONAL', label: 'Solo adicional' }
];

const marcaOptions = [
  { value: 'VISA', label: 'VISA' },
  { value: 'MASTER', label: 'MASTER' }
];

const monedaOptions = [{ value: 'ARS', label: 'ARS' }];

const ModalClienteEditar = ({
  open,
  onClose,
  cliente,
  sedes = [],
  bancos = [],
  planes = [],
  onSaved
}) => {
  const [form, setForm] = useState({
    sede_id: '',
    titular_nombre: '',
    titular_dni: '',
    fecha_inicio_cobro: '',
    banco_id: '',
    marca_tarjeta: 'VISA',
    confirmo_tarjeta_credito: 1,
    tarjeta_numero: '',
    modalidad_adhesion: 'TITULAR_SOLO',
    titular_plan_id: '',
    monto_inicial_vigente: '',
    descuento_vigente: '',
    monto_base_vigente: '',
    especial: '',
    moneda: 'ARS',
    observaciones_internas: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const row = cliente || {};

  const sedesOptions = useMemo(() => {
    return (Array.isArray(sedes) ? sedes : [])
      .filter((item) => {
        const esCiudad =
          item?.es_ciudad === true ||
          item?.es_ciudad === 1 ||
          String(item?.es_ciudad).toLowerCase() === 'true';

        return esCiudad && item?.id && item?.nombre;
      })
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [sedes]);

  const bancosOptions = useMemo(() => {
    return (Array.isArray(bancos) ? bancos : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [bancos]);

  const planesOptions = useMemo(() => {
    return (Array.isArray(planes) ? planes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [planes]);

  /* Benjamin Orellana - 09/04/2026 - Se indexan planes por id para autocompletar valores comerciales cuando cambia el plan */
  const planesMap = useMemo(() => {
    const map = new Map();
    (Array.isArray(planes) ? planes : []).forEach((item) => {
      if (item?.id) map.set(String(item.id), item);
    });
    return map;
  }, [planes]);

  useEffect(() => {
    if (!open) return;

    const planFromRow =
      row?.titular_plan_id !== null && row?.titular_plan_id !== undefined
        ? planesMap.get(String(row.titular_plan_id))
        : null;

    const commercialFromPlan = getCommercialValuesFromPlan(planFromRow);

    setForm({
      sede_id: row?.sede_id ?? '',
      titular_nombre: row?.titular_nombre || '',
      titular_dni: row?.titular_dni || '',
      fecha_inicio_cobro: toInputDate(row?.fecha_inicio_cobro),
      banco_id: row?.banco_id ?? '',
      marca_tarjeta: row?.marca_tarjeta || 'VISA',
      confirmo_tarjeta_credito:
        Number(row?.confirmo_tarjeta_credito) === 1 ? 1 : 0,
      tarjeta_numero: resolveInitialCardValue(row),
      modalidad_adhesion: row?.modalidad_adhesion || 'TITULAR_SOLO',
      titular_plan_id: row?.titular_plan_id ?? '',
      monto_inicial_vigente:
        row?.monto_inicial_vigente !== null &&
        row?.monto_inicial_vigente !== undefined
          ? String(row.monto_inicial_vigente)
          : commercialFromPlan.monto_inicial_vigente,
      descuento_vigente:
        row?.descuento_vigente !== null && row?.descuento_vigente !== undefined
          ? String(row.descuento_vigente)
          : commercialFromPlan.descuento_vigente,
      monto_base_vigente:
        row?.monto_base_vigente !== null &&
        row?.monto_base_vigente !== undefined
          ? String(row.monto_base_vigente)
          : commercialFromPlan.monto_base_vigente,
      especial: row?.especial || '',
      moneda: row?.moneda || 'ARS',
      observaciones_internas: row?.observaciones_internas || ''
    });

    setError('');
    setSuccessMsg('');
    setSubmitting(false);
  }, [open, row, planesMap]);

  /* Benjamin Orellana - 09/04/2026 - Recalcula automáticamente el monto final vigente cuando cambian monto inicial o descuento */
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
      const next = { ...prev, [field]: value };

      if (field === 'modalidad_adhesion' && value === 'SOLO_ADICIONAL') {
        next.titular_plan_id = '';
      }

      /* Benjamin Orellana - 09/04/2026 - Si se cambia el plan titular se autocompletan los valores comerciales vigentes desde el plan seleccionado */
      if (field === 'titular_plan_id') {
        const planSelected = planesMap.get(String(value));
        const commercialFromPlan = getCommercialValuesFromPlan(planSelected);

        next.monto_inicial_vigente = commercialFromPlan.monto_inicial_vigente;
        next.descuento_vigente = commercialFromPlan.descuento_vigente;
        next.monto_base_vigente = commercialFromPlan.monto_base_vigente;
      }

      return next;
    });

    if (error) setError('');
    if (successMsg) setSuccessMsg('');
  };

  const validate = () => {
    if (!row?.id) return 'Cliente inválido.';
    if (!form.fecha_inicio_cobro)
      return 'Debes ingresar la fecha de inicio de cobro.';
    if (!form.banco_id) return 'Debes seleccionar un banco.';
    if (!form.marca_tarjeta) return 'Debes seleccionar la marca de tarjeta.';
    const rawCard = onlyDigits(form.tarjeta_numero);

    if (rawCard && (rawCard.length < 13 || rawCard.length > 19)) {
      return 'La tarjeta debe contener entre 13 y 19 dígitos.';
    }
    if (
      ['TITULAR_SOLO', 'AMBOS'].includes(form.modalidad_adhesion) &&
      !form.titular_plan_id
    ) {
      return 'Debes seleccionar un plan titular para esta modalidad.';
    }
    if (
      !form.monto_inicial_vigente ||
      Number(form.monto_inicial_vigente) <= 0
    ) {
      return 'Debes ingresar un monto inicial vigente válido.';
    }
    if (
      form.descuento_vigente === '' ||
      Number(form.descuento_vigente) < 0 ||
      Number(form.descuento_vigente) > 100
    ) {
      return 'Debes ingresar un descuento vigente válido entre 0 y 100.';
    }
    if (!form.monto_base_vigente || Number(form.monto_base_vigente) <= 0) {
      return 'Debes ingresar un monto base vigente válido.';
    }
    return '';
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
      // Benjamin Orellana - 2026/04/06 - Se envía la modalidad seleccionada para que el backend pueda persistir el cambio operativo del cliente.
      // Benjamin Orellana - 09/04/2026 - Se agregan los tres campos comerciales vigentes para permitir edición completa del valor operativo del cliente.
     const rawCard = onlyDigits(form.tarjeta_numero);

     const payload = {
       sede_id: form.sede_id || null,
       fecha_inicio_cobro: form.fecha_inicio_cobro,
       banco_id: Number(form.banco_id),
       marca_tarjeta: form.marca_tarjeta,
       modalidad_adhesion: form.modalidad_adhesion,
       titular_plan_id:
         form.modalidad_adhesion === 'SOLO_ADICIONAL'
           ? null
           : Number(form.titular_plan_id),
       monto_inicial_vigente: Number(form.monto_inicial_vigente),
       descuento_vigente: Number(form.descuento_vigente),
       monto_base_vigente: Number(form.monto_base_vigente),
       especial: form.especial.trim() || null,
       moneda: form.moneda,
       observaciones_internas: form.observaciones_internas.trim() || null
     };

     if (rawCard) {
       payload.tarjeta_numero = rawCard;
     }

      const response = await api.put(
        `/debitos-automaticos-clientes/${row.id}`,
        payload
      );

      const updatedRow = normalizeSingle(response.data) || {
        ...row,
        ...payload
      };

      setSuccessMsg('Cliente actualizado correctamente.');

      if (typeof onSaved === 'function') {
        onSaved(updatedRow);
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError || 'No se pudo actualizar el cliente.'
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
          onClick={onClose}
        />

        <motion.div
          variants={panelV}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative z-10 max-h-[94vh] w-full max-w-5xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bignoodle font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Editar cliente
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {row?.titular_nombre || 'Cliente'}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-all duration-200 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-h-[calc(94vh-90px)] overflow-y-auto px-4 py-4 sm:px-6 sm:py-5"
          >
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-6">
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Titular y sede
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Titular nombre
                    </label>
                    <input
                      type="text"
                      value={form.titular_nombre}
                      onChange={(e) =>
                        handleChange('titular_nombre', e.target.value)
                      }
                      disabled
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={form.titular_dni}
                      onChange={(e) =>
                        handleChange('titular_dni', e.target.value)
                      }
                      disabled
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Sede
                    </label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={form.sede_id}
                        onChange={(e) =>
                          handleChange('sede_id', e.target.value)
                        }
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="">Sin sede</option>
                        {sedesOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Fecha inicio cobro
                    </label>
                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={form.fecha_inicio_cobro}
                        onChange={(e) =>
                          handleChange('fecha_inicio_cobro', e.target.value)
                        }
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Modalidad
                    </label>
                    <select
                      value={form.modalidad_adhesion}
                      onChange={(e) =>
                        handleChange('modalidad_adhesion', e.target.value)
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      {modalidadOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Plan titular
                    </label>
                    <select
                      value={form.titular_plan_id}
                      onChange={(e) =>
                        handleChange('titular_plan_id', e.target.value)
                      }
                      disabled={
                        submitting ||
                        form.modalidad_adhesion === 'SOLO_ADICIONAL'
                      }
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 disabled:bg-slate-50"
                    >
                      <option value="">Seleccionar plan</option>
                      {planesOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-6">
                <div className="mb-3 flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Banco, tarjeta y monto
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Banco
                    </label>
                    <select
                      value={form.banco_id}
                      onChange={(e) => handleChange('banco_id', e.target.value)}
                      disabled={submitting}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value="">Seleccionar banco</option>
                      {bancosOptions.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Marca tarjeta
                    </label>
                    <select
                      value={form.marca_tarjeta}
                      onChange={(e) =>
                        handleChange('marca_tarjeta', e.target.value)
                      }
                      disabled={submitting}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      {marcaOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Número de tarjeta
                    </label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.tarjeta_numero}
                        onChange={(e) =>
                          handleChange(
                            'tarjeta_numero',
                            onlyDigits(e.target.value)
                          )
                        }
                        disabled={submitting}
                        placeholder={
                          resolveCurrentCardReference(row)
                            ? `Actual: ${resolveCurrentCardReference(row)}`
                            : 'Ingresá una nueva tarjeta solo si querés reemplazarla'
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        inputMode="numeric"
                      />
                    </div>

                    <p className="mt-2 text-xs text-slate-400">
                      Si no querés cambiar la tarjeta, dejá este campo como
                      está.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Confirmó crédito
                    </label>
                    <select
                      value={form.confirmo_tarjeta_credito}
                      onChange={(e) =>
                        handleChange(
                          'confirmo_tarjeta_credito',
                          Number(e.target.value)
                        )
                      }
                      disabled
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      <option value={1}>Sí</option>
                      <option value={0}>No</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Moneda
                    </label>
                    <select
                      value={form.moneda}
                      onChange={(e) => handleChange('moneda', e.target.value)}
                      disabled={submitting}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    >
                      {monedaOptions.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Monto inicial vigente
                    </label>
                    <div className="relative">
                      <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.monto_inicial_vigente}
                        onChange={(e) =>
                          handleChange('monto_inicial_vigente', e.target.value)
                        }
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Descuento vigente
                    </label>
                    <div className="relative">
                      <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={form.descuento_vigente}
                        onChange={(e) =>
                          handleChange('descuento_vigente', e.target.value)
                        }
                        disabled={submitting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Monto base vigente
                    </label>
                    <div className="relative">
                      <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.monto_base_vigente}
                        onChange={(e) =>
                          handleChange('monto_base_vigente', e.target.value)
                        }
                        disabled
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Especial
                    </label>
                    <div className="relative">
                      <Pencil className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={form.especial}
                        onChange={(e) =>
                          handleChange('especial', e.target.value)
                        }
                        disabled={submitting}
                        maxLength={255}
                        placeholder="Ej. Primer mes $10.000"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-12">
                <div className="mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Observaciones internas
                  </h3>
                </div>

                <textarea
                  value={form.observaciones_internas}
                  onChange={(e) =>
                    handleChange('observaciones_internas', e.target.value)
                  }
                  disabled={submitting}
                  rows={5}
                  placeholder="Escribí observaciones internas relevantes para la operación del cliente..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                />
              </div>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalClienteEditar;
