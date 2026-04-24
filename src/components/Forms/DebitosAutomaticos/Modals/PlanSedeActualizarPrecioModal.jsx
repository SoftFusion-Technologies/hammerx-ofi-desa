/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 23 / 04 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (PlanSedeActualizarPrecioModal.jsx) contiene una versión
 * simplificada de la modal para actualizar el precio vigente de un plan por sede,
 * cargar los clientes alcanzados y aplicar el cambio solo a los clientes
 * seleccionados desde un período elegido.
 *
 * Tema: Frontend - Débitos Automáticos - Actualización Masiva de Precio por Sede
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  RefreshCw,
  Search,
  Users,
  CircleDollarSign,
  CalendarRange,
  Layers3,
  MapPin,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

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

const MONTHS = [
  { value: 1, label: 'Enero' },
  { value: 2, label: 'Febrero' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Mayo' },
  { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' },
  { value: 11, label: 'Noviembre' },
  { value: 12, label: 'Diciembre' }
];

const currentYear = new Date().getFullYear();
const defaultMonth = new Date().getMonth() + 1;
const yearOptions = Array.from(
  { length: 6 },
  (_, index) => currentYear - 1 + index
);

const toIntOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isInteger(num) ? num : null;
};

const toNumberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? Number(num.toFixed(2)) : null;
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';

  const num = Number(value);
  if (!Number.isFinite(num)) return '-';

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatMonthYear = (month, year) => {
  const found = MONTHS.find((item) => Number(item.value) === Number(month));
  if (!found || !year) return '-';
  return `${found.label} ${year}`;
};

const validateMainForm = (form) => {
  const nuevoPrecio = toNumberOrNull(form.nuevo_precio_base);

  if (form.nuevo_precio_base === '' || nuevoPrecio === null) {
    return 'Debes indicar el nuevo precio base.';
  }

  if (nuevoPrecio < 0) {
    return 'El nuevo precio base no puede ser negativo.';
  }

  const month = toIntOrNull(form.aplicar_desde_mes);
  if (!month || month < 1 || month > 12) {
    return 'Debes seleccionar un mes válido.';
  }

  const year = toIntOrNull(form.aplicar_desde_anio);
  if (!year || year < 2000) {
    return 'Debes seleccionar un año válido.';
  }

  return '';
};

const normalizePreviewResponse = (data) => {
  return {
    plan_sede_id: data?.plan_sede_id ?? null,
    plan_id: data?.plan_id ?? null,
    plan_nombre: data?.plan_nombre ?? null,
    sede_id: data?.sede_id ?? null,
    sede_nombre: data?.sede_nombre ?? null,
    precio_base_actual: Number(data?.precio_base_actual ?? 0),
    nuevo_precio_base: Number(data?.nuevo_precio_base ?? 0),
    aplicar_desde_anio: Number(data?.aplicar_desde_anio ?? 0),
    aplicar_desde_mes: Number(data?.aplicar_desde_mes ?? 0),
    total_clientes_alcanzados: Number(data?.total_clientes_alcanzados ?? 0),
    total_periodos_alcanzados: Number(data?.total_periodos_alcanzados ?? 0),
    clientes: Array.isArray(data?.clientes) ? data.clientes : []
  };
};

const getStatusPillClass = (status) => {
  const s = String(status || '').toUpperCase();

  if (s === 'ACTIVO') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (s === 'PENDIENTE_INICIO') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  if (s === 'PAUSADO') {
    return 'border-slate-200 bg-slate-100 text-slate-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
};

const SummaryItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold text-slate-900 break-words">
        {value}
      </p>
    </div>
  );
};

export default function PlanSedeActualizarPrecioModal({
  open,
  onClose,
  initial,
  onPreview,
  onApply,
  onApplied
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nuevo_precio_base: '',
    aplicar_desde_mes: defaultMonth,
    aplicar_desde_anio: currentYear
  });
  const [previewData, setPreviewData] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingApply, setLoadingApply] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const titleId = 'debito-plan-sede-actualizar-precio-title';

  useEffect(() => {
    if (!open) return;

    setStep(1);
    setForm({
      nuevo_precio_base: String(
        initial?.precio_base ?? initial?.precio_sede_actual?.precio_base ?? ''
      ),
      aplicar_desde_mes: defaultMonth,
      aplicar_desde_anio: currentYear
    });
    setPreviewData(null);
    setSelectedIds([]);
    setSearch('');
    setLoadingPreview(false);
    setLoadingApply(false);
    setErrorMsg('');
  }, [open, initial]);

  const planSedeId = useMemo(() => {
    return toIntOrNull(initial?.id ?? initial?.plan_sede_id);
  }, [initial]);

  const planName =
    initial?.plan?.nombre || initial?.plan_nombre || initial?.nombre || '-';
  const sedeName = initial?.sede?.nombre || initial?.sede_nombre || '-';
  const precioActual = Number(
    initial?.precio_base ?? initial?.precio_sede_actual?.precio_base ?? 0
  );

  const filteredClientes = useMemo(() => {
    const clientes = Array.isArray(previewData?.clientes)
      ? previewData.clientes
      : [];
    const term = String(search || '')
      .trim()
      .toLowerCase();

    if (!term) return clientes;

    return clientes.filter((item) => {
      const text = [
        item?.titular_nombre,
        item?.titular_dni,
        item?.estado_general
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(term);
    });
  }, [previewData, search]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedPeriodosCount = useMemo(() => {
    return (previewData?.clientes || [])
      .filter((item) => selectedSet.has(Number(item.id)))
      .reduce((acc, item) => acc + Number(item?.periodos_impactados || 0), 0);
  }, [previewData, selectedSet]);

  const handleMainFieldChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleCliente = (clienteId) => {
    const id = Number(clienteId);

    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => Number(item) !== id);
      }

      return [...prev, id];
    });
  };

  const handleSelectAllVisible = () => {
    const ids = filteredClientes.map((item) => Number(item.id));
    setSelectedIds((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleClearVisible = () => {
    const visibleIds = new Set(filteredClientes.map((item) => Number(item.id)));
    setSelectedIds((prev) =>
      prev.filter((item) => !visibleIds.has(Number(item)))
    );
  };

  /* Benjamin Orellana - 2026/04/23 - Se simplifica la experiencia: el usuario completa datos mínimos y al continuar se carga internamente la lista de clientes alcanzados sin mostrar un bloque de preview pesado. */
  const handleContinue = async () => {
    const validationError = validateMainForm(form);

    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    if (!planSedeId) {
      setErrorMsg('No se encontró la configuración plan+sede a actualizar.');
      return;
    }

    if (typeof onPreview !== 'function') {
      setErrorMsg('No se configuró la acción para cargar clientes.');
      return;
    }

    try {
      setLoadingPreview(true);
      setErrorMsg('');

      const payload = {
        id: planSedeId,
        nuevo_precio_base: toNumberOrNull(form.nuevo_precio_base),
        aplicar_desde_anio: toIntOrNull(form.aplicar_desde_anio),
        aplicar_desde_mes: toIntOrNull(form.aplicar_desde_mes)
      };

      const response = await onPreview(payload);
      const normalized = normalizePreviewResponse(response);

      setPreviewData(normalized);
      setSelectedIds(
        (normalized?.clientes || []).map((item) => Number(item.id))
      );
      setStep(2);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo cargar la lista de clientes alcanzados.';

      setErrorMsg(backendMessage);
      setPreviewData(null);
      setSelectedIds([]);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleApply = async () => {
    // if (!selectedIds.length) {
    //   setErrorMsg('Debes seleccionar al menos un cliente.');
    //   return;
    // }

    if (typeof onApply !== 'function') {
      setErrorMsg('No se configuró la acción de aplicación.');
      return;
    }

    try {
      setLoadingApply(true);
      setErrorMsg('');

      const payload = {
        id: planSedeId,
        nuevo_precio_base: toNumberOrNull(form.nuevo_precio_base),
        aplicar_desde_anio: toIntOrNull(form.aplicar_desde_anio),
        aplicar_desde_mes: toIntOrNull(form.aplicar_desde_mes),
        clientes_ids: selectedIds
      };

      const response = await onApply(payload);

      if (typeof onApplied === 'function') {
        await onApplied(response);
      }

      onClose();
    } catch (error) {
      const backendMessage =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.message ||
        error?.message ||
        'No se pudo aplicar la actualización de precio.';

      setErrorMsg(backendMessage);
    } finally {
      setLoadingApply(false);
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
          exit="exit"
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
            className="pointer-events-none absolute -top-24 -left-24 size-[24rem] rounded-full blur-3xl opacity-50"
            style={{
              background:
                'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(251,146,60,0.14) 35%, transparent 72%)'
            }}
          />

          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-20 size-[24rem] rounded-full blur-3xl opacity-45"
            style={{
              background:
                'radial-gradient(circle, rgba(14,165,233,0.14) 0%, rgba(56,189,248,0.10) 35%, transparent 72%)'
            }}
          />

          <motion.div
            variants={panelV}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative flex max-h-[92vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-[30px] border border-orange-100 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] sm:max-w-5xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex-1 overflow-y-auto">
              <div className="p-5 sm:p-6 md:p-7">
                <div className="mb-6 flex items-start gap-4 rounded-[24px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 ring-1 ring-orange-200">
                    <RefreshCw className="h-7 w-7" />
                  </div>

                  <div className="pr-10">
                    <h3
                      id={titleId}
                      className="font-bignoodle text-xl font-bold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      Actualizar precio
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      Definí el nuevo valor, elegí desde cuándo aplicarlo y
                      seleccioná los clientes que deben tomar el cambio.
                    </p>
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                  <SummaryItem icon={Layers3} label="Plan" value={planName} />
                  <SummaryItem icon={MapPin} label="Sede" value={sedeName} />
                  <SummaryItem
                    icon={CircleDollarSign}
                    label="Precio actual"
                    value={formatMoney(precioActual)}
                  />
                </div>

                {step === 1 && (
                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
                    <div className="mb-4">
                      <h4 className="text-base font-bold text-slate-900">
                        Datos del cambio
                      </h4>
                      <p className="mt-1 text-sm text-slate-500">
                        Ingresá solo la información necesaria para continuar.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CircleDollarSign className="h-4 w-4 text-orange-500" />
                          Nuevo precio base
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          name="nuevo_precio_base"
                          value={form.nuevo_precio_base}
                          onChange={handleMainFieldChange}
                          placeholder="Ej: 80000"
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarRange className="h-4 w-4 text-orange-500" />
                          Aplicar desde mes
                        </label>
                        <select
                          name="aplicar_desde_mes"
                          value={form.aplicar_desde_mes}
                          onChange={handleMainFieldChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        >
                          {MONTHS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <CalendarRange className="h-4 w-4 text-orange-500" />
                          Aplicar desde año
                        </label>
                        <select
                          name="aplicar_desde_anio"
                          value={form.aplicar_desde_anio}
                          onChange={handleMainFieldChange}
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        >
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-3">
                      <p className="text-sm text-slate-700">
                        Se aplicará el cambio de{' '}
                        <span className="font-semibold text-slate-900">
                          {formatMoney(precioActual)}
                        </span>{' '}
                        a{' '}
                        <span className="font-semibold text-orange-700">
                          {formatMoney(toNumberOrNull(form.nuevo_precio_base))}
                        </span>{' '}
                        desde{' '}
                        <span className="font-semibold text-slate-900">
                          {formatMonthYear(
                            form.aplicar_desde_mes,
                            form.aplicar_desde_anio
                          )}
                        </span>
                        .
                      </p>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.18)]">
                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          Clientes alcanzados
                        </h4>
                        <p className="mt-1 text-sm text-slate-500">
                          Seleccioná únicamente a los clientes que deben tomar
                          el nuevo precio.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700">
                          Total: {previewData?.total_clientes_alcanzados || 0}
                        </span>
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
                          Seleccionados: {selectedIds.length}
                        </span>
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-sky-700">
                          Períodos: {selectedPeriodosCount}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="relative w-full lg:max-w-md">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          placeholder="Buscar por nombre o DNI"
                          className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllVisible}
                          className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                        >
                          Seleccionar todos
                        </button>

                        <button
                          type="button"
                          onClick={handleClearVisible}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Limpiar todos
                        </button>
                      </div>
                    </div>

                    {filteredClientes.length === 0 ? (
                      <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                          <Users className="h-6 w-6" />
                        </div>
                        <h5 className="mt-4 text-base font-bold text-slate-900">
                          No hay clientes para mostrar
                        </h5>
                        <p className="mt-2 text-sm text-slate-500">
                          No hubo coincidencias con el filtro actual.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 lg:hidden">
                          {filteredClientes.map((cliente) => {
                            const checked = selectedSet.has(Number(cliente.id));

                            return (
                              <div
                                key={cliente.id}
                                className={`rounded-[22px] border p-4 transition ${
                                  checked
                                    ? 'border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50'
                                    : 'border-slate-200 bg-white'
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() =>
                                      handleToggleCliente(cliente.id)
                                    }
                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                                  />

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h5 className="text-sm font-bold text-slate-900">
                                        {cliente.titular_nombre}
                                      </h5>
                                      <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusPillClass(
                                          cliente.estado_general
                                        )}`}
                                      >
                                        {cliente.estado_general}
                                      </span>
                                    </div>

                                    <p className="mt-1 text-sm text-slate-500">
                                      DNI {cliente.titular_dni || '-'}
                                    </p>

                                    <div className="mt-3 grid grid-cols-2 gap-3">
                                      <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                                          Monto actual
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                          {formatMoney(cliente.monto_actual)}
                                        </p>
                                      </div>

                                      <div className="rounded-2xl border border-orange-200 bg-orange-50 px-3 py-2">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-500">
                                          Nuevo monto
                                        </p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                          {formatMoney(cliente.monto_nuevo)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                                      <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-700">
                                        Períodos:{' '}
                                        {cliente.periodos_impactados || 0}
                                      </span>
                                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">
                                        Inicio:{' '}
                                        {cliente.fecha_inicio_cobro || '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="hidden overflow-hidden rounded-[24px] border border-slate-200 lg:block">
                          <div className="max-h-[420px] overflow-auto">
                            <table className="min-w-full border-collapse">
                              <thead className="sticky top-0 z-10 bg-slate-100/95 backdrop-blur">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Impacta
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Cliente
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Estado
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Monto actual
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Nuevo monto
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                                    Períodos
                                  </th>
                                </tr>
                              </thead>

                              <tbody>
                                {filteredClientes.map((cliente) => {
                                  const checked = selectedSet.has(
                                    Number(cliente.id)
                                  );

                                  return (
                                    <tr
                                      key={cliente.id}
                                      className={`border-t border-slate-200 transition ${
                                        checked
                                          ? 'bg-orange-50/60'
                                          : 'bg-white hover:bg-slate-50'
                                      }`}
                                    >
                                      <td className="px-4 py-4">
                                        <input
                                          type="checkbox"
                                          checked={checked}
                                          onChange={() =>
                                            handleToggleCliente(cliente.id)
                                          }
                                          className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                                        />
                                      </td>

                                      <td className="px-4 py-4">
                                        <div className="min-w-[220px]">
                                          <p className="text-sm font-bold text-slate-900">
                                            {cliente.titular_nombre}
                                          </p>
                                          <p className="mt-1 text-xs text-slate-500">
                                            DNI {cliente.titular_dni || '-'}
                                          </p>
                                        </div>
                                      </td>

                                      <td className="px-4 py-4">
                                        <span
                                          className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusPillClass(
                                            cliente.estado_general
                                          )}`}
                                        >
                                          {cliente.estado_general}
                                        </span>
                                      </td>

                                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                                        {formatMoney(cliente.monto_actual)}
                                      </td>

                                      <td className="px-4 py-4 text-sm font-semibold text-orange-700">
                                        {formatMoney(cliente.monto_nuevo)}
                                      </td>

                                      <td className="px-4 py-4 text-sm font-semibold text-sky-700">
                                        {cliente.periodos_impactados || 0}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-6 md:px-7">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-semibold text-slate-500">
                  Los períodos ya cerrados no se modifican.
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loadingPreview || loadingApply}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      disabled={loadingApply}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </button>
                  )}

                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={handleContinue}
                      disabled={loadingPreview}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingPreview ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        <>
                          <Users className="h-4 w-4" />
                          Continuar
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApply}
                      disabled={loadingApply}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loadingApply ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Aplicando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Aplicar actualización
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
