import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  UserRoundPlus,
  Loader2,
  Save,
  Trash2,
  User,
  BadgeDollarSign,
  AlertCircle
} from 'lucide-react';

/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 31 / 03 / 2026
 * Versión: 1.0
 *
 * Descripción:
 * Modal para alta, edición y eliminación del adicional asociado
 * a un cliente adherido del módulo Débitos Automáticos.
 *
 * Tema: Adicional de cliente - Débitos Automáticos
 * Capa: Frontend
 */

/* Benjamin Orellana - 31/03/2026 - Modal unificado de adicional para crear, editar y eliminar según exista o no un registro asociado al cliente */
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

const isNotFoundError = (err) => {
  return Number(err?.response?.status) === 404;
};

const ModalClienteAdicional = ({
  open,
  onClose,
  cliente,
  planes = [],
  onSaved
}) => {
  const [adicional, setAdicional] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    nombre: '',
    dni: '',
    plan_id: ''
  });

  const clienteId = cliente?.id || cliente?.cliente_id || null;

  const planesOptions = useMemo(() => {
    return (Array.isArray(planes) ? planes : [])
      .filter((item) => item?.id && item?.nombre)
      .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), 'es'));
  }, [planes]);

  const hydrateForm = (row) => {
    setForm({
      nombre: row?.nombre || '',
      dni: row?.dni || '',
      plan_id: row?.plan_id ?? row?.plan?.id ?? ''
    });
  };

  /* Benjamin Orellana - 31/03/2026 - Lectura del adicional actual para definir automáticamente si el modal trabaja en alta o edición */
  const loadAdicional = async () => {
    if (!clienteId) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await api.get(
        `/debitos-automaticos-clientes/${clienteId}/adicional`
      );
      const row = normalizeSingle(response.data);

      setAdicional(row || null);
      hydrateForm(row || null);
    } catch (err) {
      if (isNotFoundError(err)) {
        setAdicional(null);
        hydrateForm(null);
      } else {
        setError(
          err?.response?.data?.mensajeError ||
            'No se pudo cargar el adicional del cliente.'
        );
        setAdicional(null);
        hydrateForm(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setError('');
    setSuccessMsg('');
    loadAdicional();
  }, [open, clienteId]);

  if (!open) return null;

  const isEditMode = Boolean(adicional?.id);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validate = () => {
    if (!clienteId) return 'Cliente inválido.';
    if (!form.nombre.trim()) return 'Debes ingresar el nombre del adicional.';
    if (!form.dni.trim()) return 'Debes ingresar el DNI del adicional.';
    if (!form.plan_id) return 'Debes seleccionar un plan.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        cliente_id: clienteId,
        nombre: form.nombre.trim(),
        dni: form.dni.trim(),
        plan_id: Number(form.plan_id)
      };

      const response = isEditMode
        ? await api.put(
            `/debitos-automaticos-clientes-adicionales/${adicional.id}`,
            payload
          )
        : await api.post('/debitos-automaticos-clientes-adicionales', payload);

      const savedRow = normalizeSingle(response.data) || {
        ...adicional,
        ...payload
      };

      setAdicional(savedRow);
      hydrateForm(savedRow);
      setSuccessMsg(
        isEditMode
          ? 'Adicional actualizado correctamente.'
          : 'Adicional creado correctamente.'
      );

      if (typeof onSaved === 'function') {
        onSaved({
          action: isEditMode ? 'updated' : 'created',
          cliente_id: clienteId,
          adicional: savedRow
        });
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError || 'No se pudo guardar el adicional.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!adicional?.id) return;

    // Benjamin Orellana - 2026/04/06 - Se fuerza un z-index superior para que SweetAlert quede por encima del modal de adicional.
    const result = await Swal.fire({
      title: '¿Eliminar adicional?',
      text: 'Se quitará el adicional asociado a este cliente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true,
      didOpen: () => {
        const container = Swal.getContainer();
        if (container) {
          container.style.zIndex = '20000';
        }
      }
    });

    if (!result.isConfirmed) return;

    setDeleting(true);
    setError('');
    setSuccessMsg('');

    try {
      await api.delete(
        `/debitos-automaticos-clientes-adicionales/${adicional.id}`
      );

      setAdicional(null);
      hydrateForm(null);
      setSuccessMsg('Adicional eliminado correctamente.');

      if (typeof onSaved === 'function') {
        onSaved({
          action: 'deleted',
          cliente_id: clienteId,
          adicional: null
        });
      }
    } catch (err) {
      setError(
        err?.response?.data?.mensajeError || 'No se pudo eliminar el adicional.'
      );
    } finally {
      setDeleting(false);
    }
  };;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1480] flex items-center justify-center p-3 sm:p-5"
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
          className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[30px] border border-orange-100 bg-[#fffaf7] shadow-[0_40px_120px_-38px_rgba(15,23,42,0.55)]"
        >
          <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-500">
                  Adicional del cliente
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  {cliente?.titular_nombre || 'Cliente'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isEditMode
                    ? 'Editá o eliminá la persona adicional asociada.'
                    : 'Cargá una persona adicional para este cliente adherido.'}
                </p>
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

          <form onSubmit={handleSubmit} className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-5">
                <div className="mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">Resumen</h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Titular
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {cliente?.titular_nombre || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      DNI titular
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {cliente?.titular_dni || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                      Estado relación
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {cliente?.modalidad_adhesion === 'SOLO_ADICIONAL'
                        ? 'Reemplaza al titular'
                        : 'Adherido al titular'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.35)] xl:col-span-7">
                <div className="mb-3 flex items-center gap-2">
                  <UserRoundPlus className="h-4 w-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-slate-900">
                    {isEditMode ? 'Editar adicional' : 'Nuevo adicional'}
                  </h3>
                </div>

                {loading ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    Cargando adicional...
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Nombre
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={form.nombre}
                          onChange={(e) =>
                            handleChange('nombre', e.target.value)
                          }
                          disabled={saving || deleting}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        DNI
                      </label>
                      <input
                        type="text"
                        value={form.dni}
                        onChange={(e) => handleChange('dni', e.target.value)}
                        disabled={saving || deleting}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Plan
                      </label>
                      <div className="relative">
                        <BadgeDollarSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <select
                          value={form.plan_id}
                          onChange={(e) =>
                            handleChange('plan_id', e.target.value)
                          }
                          disabled={saving || deleting}
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all duration-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
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

                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {successMsg && (
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                        {successMsg}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <div>
                {isEditMode && !loading && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving || deleting}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Eliminar adicional
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving || deleting}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cerrar
                </button>

                <button
                  type="submit"
                  disabled={loading || saving || deleting}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditMode ? 'Guardar cambios' : 'Crear adicional'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalClienteAdicional;
