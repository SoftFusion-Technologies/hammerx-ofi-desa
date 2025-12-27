/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Actualización: 29 / 11 / 2025
 * Versión: 2.0 (Rediseño UI/UX claro y profesional)
 *
 * Descripción:
 *  Este archivo (FormAltaIntegranteConve.jsx) es el componente donde realizamos un formulario para
 *  la tabla IntegranteConve, este formulario aparece en la web del staff.
 *
 *  Versión 2.0:
 *   - Layout en modal claro, profesional, con secciones “Datos personales” y “Configuración de convenio”.
 *   - Inputs con estados de foco más visibles (borde + ring suave en naranja corporativo).
 *   - Header con título, subtítulo contextual y chip de estado (Alta / Edición).
 *   - Resumen de precios en chips ligeros, acorde a la sede seleccionada.
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import { useAuth } from '../../AuthContext';
import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaLinkedinIn
} from 'react-icons/fa';
const nuevoIntegranteSchema = Yup.object().shape({
  nombre: Yup.string().required('El Nombre es obligatorio'),
  telefono: Yup.string().required('El Teléfono es obligatorio'),
  email: Yup.string()
    .email('El email no es válido')
    .nullable()
    .transform((value, originalValue) => (originalValue === '' ? null : value)),
  dni: Yup.string(),
  sede: Yup.string().required('La sede es obligatoria')
});

const FormAltaIntegranteConve = ({
  isOpen,
  onClose,
  precio,
  descuento,
  preciofinal,
  integrante,
  setSelectedUser,
  precio_concep,
  descuento_concep,
  preciofinal_concep
}) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');
  const formikRef = useRef(null);

  const { id_conv } = useParams(); // Obtener el id_conv de la URL
  const { userName } = useAuth();
  // Benjamin Orellana 26-12-2025 - INICIO
  const [convenioMeta, setConvenioMeta] = useState(null);
  const [loadingConve, setLoadingConve] = useState(false);
  const [planes, setPlanes] = useState([]);
  const [loadingPlanes, setLoadingPlanes] = useState(false);
  const [errorPlanes, setErrorPlanes] = useState(null);

  const [sedesCiudad, setSedesCiudad] = useState([]);
  const [loadingSedesCiudad, setLoadingSedesCiudad] = useState(false);
  const [errorSedesCiudad, setErrorSedesCiudad] = useState(null);

  useEffect(() => {
    const fetchSedesCiudad = async () => {
      if (!isOpen) return;

      try {
        setLoadingSedesCiudad(true);
        setErrorSedesCiudad(null);

        const resp = await fetch(`http://localhost:8080/sedes/ciudad`);
        if (!resp.ok) throw new Error(`Error sedes: ${resp.status}`);
        const data = await resp.json();

        setSedesCiudad(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('No se pudieron cargar sedes ciudad:', e?.message);
        setErrorSedesCiudad(e?.message || 'Error');
        setSedesCiudad([]);
      } finally {
        setLoadingSedesCiudad(false);
      }
    };

    fetchSedesCiudad();
  }, [isOpen]);

  const obtenerFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    const horas = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');
    const segundos = String(hoy.getSeconds()).padStart(2, '0');

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
  };

  useEffect(() => {
    const fetchConvenio = async () => {
      if (!isOpen || !id_conv) return;

      try {
        setLoadingConve(true);
        const resp = await fetch(
          `http://localhost:8080/admconvenios/${id_conv}`
        );
        if (!resp.ok) throw new Error(`Error convenio: ${resp.status}`);
        const data = await resp.json();
        setConvenioMeta(data || null);
      } catch (e) {
        console.error('No se pudo cargar el convenio:', e?.message);
        setConvenioMeta(null);
      } finally {
        setLoadingConve(false);
      }
    };

    fetchConvenio();
  }, [isOpen, id_conv]);

  useEffect(() => {
    const fetchPlanes = async () => {
      if (!isOpen || !id_conv) return;

      try {
        setLoadingPlanes(true);
        setErrorPlanes(null);

        const resp = await fetch(
          `http://localhost:8080/convenios-planes?convenio_id=${id_conv}`
        );

        if (!resp.ok) throw new Error(`Error planes: ${resp.status}`);
        const data = await resp.json();

        // Esperado: array
        const rows = Array.isArray(data) ? data : data?.registros || [];
        setPlanes(rows);
      } catch (e) {
        console.error('No se pudieron cargar planes:', e?.message);
        setErrorPlanes(e?.message || 'Error');
        setPlanes([]);
      } finally {
        setLoadingPlanes(false);
      }
    };

    fetchPlanes();
  }, [isOpen, id_conv]);
  const permiteElegirSedeEmpresa =
    Number(convenioMeta?.permiteElegirSedeEmpresa) === 1;

  const sedeFijaConvenio = String(convenioMeta?.sede || '').trim();

  // =====================================================
  // REQ: Restringir planes por sede del convenio (si está fija)
  // - Si el convenio es Multisede => mostrar todos
  // - Si el convenio está fijo en Monteros/Concepción => mostrar (General/null) + planes de esa sede
  // - Si la sede fija no mapea a una sede_id conocida => mostrar solo (General/null)
  // =====================================================
  const norm = (v) =>
    String(v || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const isMultiSedeConvenio = useMemo(() => {
    const s = norm(sedeFijaConvenio);
    return s.includes('multi');
  }, [sedeFijaConvenio]);

  const sedeIdFromConvenio = useMemo(() => {
    if (!sedeFijaConvenio) return null;

    const s = norm(sedeFijaConvenio);

    // Mapeo "semántico" de valores legacy del combo a nombres reales en tabla sedes
    // Ajustá/extendé si tu convenio guarda otros códigos.
    const aliasToNombreSede = {
      monteros: 'monteros',
      concepcion: 'concepcion',
      smt: 'barrio sur',
      sanmiguelbn: 'barrio norte',
      'barrio sur': 'barrio sur',
      'barrio norte': 'barrio norte'
    };

    const targetNombre = aliasToNombreSede[s] || s;

    // Buscar en sedes reales (ids cambian según ambiente)
    const match = (sedesCiudad || []).find(
      (x) => norm(x.nombre) === norm(targetNombre)
    );

    return match ? Number(match.id) : null;
  }, [sedeFijaConvenio, sedesCiudad]);

  const planesVisibles = useMemo(() => {
    if (!sedeFijaConvenio) return planes;

    // Multisede => se ven todos
    if (isMultiSedeConvenio) return planes;

    // Mientras no cargaron sedes, por seguridad no mostramos planes por sede
    if (!sedesCiudad || sedesCiudad.length === 0) {
      return (planes || []).filter((p) => p?.sede_id == null);
    }

    // Sede fija conocida => General/null + sede_id matching
    if (sedeIdFromConvenio) {
      return (planes || []).filter(
        (p) =>
          p?.sede_id == null || Number(p.sede_id) === Number(sedeIdFromConvenio)
      );
    }

    // Sede fija no mapeada => solo General/null
    return (planes || []).filter((p) => p?.sede_id == null);
  }, [
    planes,
    sedeFijaConvenio,
    isMultiSedeConvenio,
    sedeIdFromConvenio,
    sedesCiudad
  ]);
  // Benjamin Orellana 26-12-2025 - FIN
  
  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      if (setSelectedUser) setSelectedUser(null);
    }
    onClose();
  };

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubmitIntegrante = async (valores) => {
    try {
      const url = integrante
        ? `http://localhost:8080/integrantes/${integrante.id}`
        : 'http://localhost:8080/integrantes/';
      const method = integrante ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method,
        body: JSON.stringify({ ...valores }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (method === 'PUT') {
        setTextoModal('Integrante actualizado correctamente.');
      } else {
        setTextoModal('Integrante creado correctamente.');
      }

      if (!respuesta.ok) {
        throw new Error(`Error en la solicitud ${method}: ${respuesta.status}`);
      }

      const data = await respuesta.json();
      console.log('Registro procesado correctamente:', data);

      setShowModal(true);
      setTimeout(() => {
        setShowModal(false);
      }, 2700);
    } catch (error) {
      console.error('Error al insertar/actualizar el registro:', error.message);
      setErrorModal(true);
      setTimeout(() => {
        setErrorModal(false);
      }, 2700);
    }
  };
  const normTxt = (v) =>
    String(v || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

  const isMultiSedeValue = (v) => normTxt(v).includes('multi');

  // Convierte valores legacy del select a nombres reales de tabla sedes
  const mapSedeValueToNombre = (raw) => {
    const s = normTxt(raw);

    const alias = {
      monteros: 'monteros',
      concepcion: 'concepcion',
      // según tu select actual:
      smt: 'barrio sur',
      sanmiguelbn: 'barrio norte',
      'tucuman - barrio sur': 'barrio sur',
      'tucuman - barrio norte': 'barrio norte'
    };

    return alias[s] || s; // si ya viene "Barrio Sur", queda ok
  };

  const resolveSedeIdFromValue = (rawSede, sedesCiudad = []) => {
    if (!rawSede) return null;
    if (isMultiSedeValue(rawSede)) return null;

    const targetNombre = mapSedeValueToNombre(rawSede);

    const match = (sedesCiudad || []).find(
      (x) => normTxt(x.nombre) === normTxt(targetNombre)
    );

    return match ? Number(match.id) : null;
  };

  const getPlanesVisiblesBySede = ({
    planes = [],
    sedeValue,
    sedesCiudad = []
  }) => {
    if (!sedeValue) return planes; // si todavía no eligió, no filtramos (o si preferís: solo generales)
    if (isMultiSedeValue(sedeValue)) return planes;

    // Si todavía no cargaron sedes, por seguridad devolvemos solo generales
    if (!sedesCiudad || sedesCiudad.length === 0) {
      return planes.filter((p) => p?.sede_id == null);
    }

    const sedeId = resolveSedeIdFromValue(sedeValue, sedesCiudad);

    if (!sedeId) return planes.filter((p) => p?.sede_id == null);

    // Recomendado: Generales + Sede elegida
    return planes.filter(
      (p) => p?.sede_id == null || Number(p.sede_id) === Number(sedeId)
    );

    // return planes.filter((p) => Number(p.sede_id) === Number(sedeId));
  };

  // Se comenta por que no se utiliza Benjamin Orellana 21-12-2025
  // const formatARS = (v) => ARS.format(toNumberAR(v));

  // const formatPct = (v) => {
  //   const n = toNumberAR(v);
  //   return `${n}%`;
  // };

  function SedeSync({
    permiteElegirSedeEmpresa,
    sedeFijaConvenio,
    values,
    setFieldValue,
    precio,
    descuento,
    preciofinal,
    precio_concep,
    descuento_concep,
    preciofinal_concep
  }) {
    useEffect(() => {
      if (permiteElegirSedeEmpresa) return;
      if (!sedeFijaConvenio) return;

      // Setear sede si viene vacía
      if (!values.sede) {
        setFieldValue('sede', sedeFijaConvenio);
      }

      // Aplicar precios según sede fija
      const s = values.sede || sedeFijaConvenio;

      if (s === 'Monteros') {
        setFieldValue('precio', precio);
        setFieldValue('descuento', descuento);
        setFieldValue('preciofinal', preciofinal);
      } else if (s === 'Concepción') {
        setFieldValue('precio', precio_concep);
        setFieldValue('descuento', descuento_concep);
        setFieldValue('preciofinal', preciofinal_concep);
      }
    }, [permiteElegirSedeEmpresa, sedeFijaConvenio]);

    return null;
  }

  function PlanSedeRestrictSync({
    sedeFijaConvenio,
    isMultiSedeConvenio,
    sedeIdFromConvenio,
    planes,
    values,
    setFieldValue
  }) {
    useEffect(() => {
      if (!sedeFijaConvenio) return;
      if (isMultiSedeConvenio) return;
      if (!values.convenio_plan_id) return;

      const plan = (planes || []).find(
        (p) => String(p.id) === String(values.convenio_plan_id)
      );
      if (!plan) return;

      const ok =
        plan.sede_id == null ||
        (sedeIdFromConvenio &&
          Number(plan.sede_id) === Number(sedeIdFromConvenio));

      if (!ok) {
        // Limpiamos selección incompatible
        setFieldValue('convenio_plan_id', '');
        setFieldValue('fecha_vencimiento', '');
      }
    }, [
      sedeFijaConvenio,
      isMultiSedeConvenio,
      sedeIdFromConvenio,
      values.convenio_plan_id
    ]);

    return null;
  }

  return (
    <div
      className={`${
        isOpen ? 'fixed' : 'hidden'
      } inset-0 z-50 flex items-center justify-center px-4 sm:px-6`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="container-inputs relative w-full max-w-xl">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-orange-600">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_0_3px_rgba(249,115,22,0.28)] animate-pulse" />
                {integrante ? 'Edición de integrante' : 'Alta de integrante'}
              </span>

              <div>
                <h2 className="text-base sm:text-lg font-semibold text-orange-600 font-bignoodle">
                  {integrante?.nombre
                    ? integrante.nombre
                    : 'Integrante de convenio'}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Completá los datos del integrante. Los campos marcados con{' '}
                  <span className="font-semibold text-orange-600">*</span> son
                  obligatorios.
                </p>

                {id_conv && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Convenio asociado:{' '}
                    <span className="font-medium text-slate-900">
                      #{id_conv}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 text-sm hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Formik */}
          <Formik
            innerRef={formikRef}
            initialValues={{
              id_conv: id_conv || '',
              nombre: integrante ? integrante.nombre : '',
              dni: integrante ? integrante.dni : '',
              telefono: integrante ? integrante.telefono : '',
              email: integrante ? integrante.email : '',
              sede: integrante ? integrante.sede : '',
              notas: integrante ? integrante.notas : '',
              precio: integrante ? integrante.precio : precio,
              descuento: integrante ? integrante.descuento : descuento,
              preciofinal: integrante ? integrante.preciofinal : preciofinal,
              userName: userName || '',
              fechaCreacion: obtenerFechaActual(),
              convenio_plan_id: integrante
                ? integrante.convenio_plan_id ?? ''
                : '',
              fecha_vencimiento: integrante
                ? integrante.fecha_vencimiento ?? ''
                : ''
            }}
            enableReinitialize
            validationSchema={nuevoIntegranteSchema}
            onSubmit={async (values, { resetForm }) => {
              await handleSubmitIntegrante(values);
              resetForm();
            }}
          >
            {({ isSubmitting, setFieldValue, errors, touched, values }) => {
              // Helpers AR (inline para que este snippet sea plug&play)
              const ARS = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
                maximumFractionDigits: 0
              });

              const toNumberAR = (v) => {
                if (v === null || v === undefined) return 0;
                const s = String(v).trim();
                const normalized = s
                  .replace(/\$/g, '')
                  .replace(/\s/g, '')
                  .replace(/\./g, '')
                  .replace(/,/g, '.')
                  .replace(/[^\d.-]/g, '');

                const n = Number(normalized);
                return Number.isFinite(n) ? n : 0;
              };

              const formatARS = (v) => ARS.format(toNumberAR(v));
              const formatPct = (v) => `${toNumberAR(v)}%`;

              // Sede contexto para filtrar planes:
              // - si el convenio permite elegir => usamos values.sede
              // - si está bloqueado => usamos sedeFijaConvenio
              const sedeContextoPlanes = permiteElegirSedeEmpresa
                ? values.sede
                : sedeFijaConvenio;

              const sedeIdContextoPlanes = resolveSedeIdFromValue(
                sedeContextoPlanes,
                sedesCiudad
              );

              const multiContextoPlanes = isMultiSedeValue(sedeContextoPlanes);

              const planesVisibles = getPlanesVisiblesBySede({
                planes,
                sedeValue: sedeContextoPlanes,
                sedesCiudad
              });

              const precioBase = toNumberAR(values.precio);
              const totalFinal = toNumberAR(values.preciofinal);
              const descuentoPct = toNumberAR(values.descuento);
              const ahorro = Math.max(0, precioBase - totalFinal);

              const formatDateAR = (value) => {
                if (!value) return '';

                // Caso 1: viene como ISO (ej: 2026-01-20T03:00:00.000Z)
                if (String(value).includes('T')) {
                  const d = new Date(value);
                  if (Number.isNaN(d.getTime())) return String(value);
                  return new Intl.DateTimeFormat('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).format(d);
                }

                // Caso 2: viene como "YYYY-MM-DD HH:mm:ss"
                const s = String(value).trim();
                const [datePart, timePart = '00:00:00'] = s.split(' ');
                const [y, m, d] = datePart.split('-').map((n) => Number(n));
                const [hh, mm, ss] = timePart.split(':').map((n) => Number(n));

                const dt = new Date(
                  y,
                  (m || 1) - 1,
                  d || 1,
                  hh || 0,
                  mm || 0,
                  ss || 0
                );
                if (Number.isNaN(dt.getTime())) return String(value);

                return new Intl.DateTimeFormat('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }).format(dt);
              };

              return (
                <Form className="flex flex-col max-h-[80vh]">
                  <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
                    {/* Sección: Datos personales */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                        Datos personales
                      </p>

                      <div className="space-y-4">
                        {/* Nombre */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="nombre"
                              className="text-xs font-medium text-slate-800"
                            >
                              Nombre y apellido{' '}
                              <span className="text-orange-600">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                              Máx. 70 caracteres
                            </span>
                          </div>

                          <Field
                            id="nombre"
                            name="nombre"
                            type="text"
                            maxLength="70"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                            placeholder="Ej: María Fernanda López"
                          />
                          {errors.nombre && touched.nombre && (
                            <Alerta>{errors.nombre}</Alerta>
                          )}
                        </div>

                        {/* DNI + Teléfono */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label
                              htmlFor="dni"
                              className="text-xs font-medium text-slate-800"
                            >
                              DNI
                            </label>
                            <Field
                              id="dni"
                              name="dni"
                              type="tel"
                              maxLength="20"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                              placeholder="Ej: 38.123.456"
                            />
                            {errors.dni && touched.dni && (
                              <Alerta>{errors.dni}</Alerta>
                            )}
                          </div>

                          <div className="space-y-1 mt-2">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor="telefono"
                                className="text-xs font-medium text-slate-800"
                              >
                                Teléfono{' '}
                                <span className="text-orange-600">*</span>
                              </label>
                              <span className="text-[11px] text-slate-400">
                                Solo números
                              </span>
                            </div>

                            <Field
                              id="telefono"
                              name="telefono"
                              type="tel"
                              maxLength="20"
                              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                              placeholder="Ej: 3816123456"
                            />
                            {errors.telefono && touched.telefono && (
                              <Alerta>{errors.telefono}</Alerta>
                            )}
                          </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label
                            htmlFor="email"
                            className="text-xs font-medium text-slate-800"
                          >
                            Email
                          </label>
                          <Field
                            id="email"
                            name="email"
                            type="email"
                            maxLength="100"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                            placeholder="Ej: nombre@correo.com"
                          />
                          {errors.email && touched.email && (
                            <Alerta>{errors.email}</Alerta>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Sección: Configuración de convenio */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-2">
                        Configuración de convenio
                      </p>

                      <div className="space-y-3">
                        {/* Sede */}
                        <SedeSync
                          permiteElegirSedeEmpresa={permiteElegirSedeEmpresa}
                          sedeFijaConvenio={sedeFijaConvenio}
                          values={values}
                          setFieldValue={setFieldValue}
                          precio={precio}
                          descuento={descuento}
                          preciofinal={preciofinal}
                          precio_concep={precio_concep}
                          descuento_concep={descuento_concep}
                          preciofinal_concep={preciofinal_concep}
                        />

                        <div className="space-y-1">
                          <label
                            htmlFor="sede"
                            className="text-xs font-medium text-slate-800"
                          >
                            Sede <span className="text-orange-600">*</span>
                          </label>

                          {permiteElegirSedeEmpresa ? (
                            <>
                              <Field
                                as="select"
                                id="sede"
                                name="sede"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                                onChange={(e) => {
                                  const selectedSede = e.target.value;
                                  const prevSede = values.sede;

                                  setFieldValue('sede', selectedSede);

                                  // Si cambió sede, invalidamos plan/vencimiento (para evitar plan de otra sede)
                                  if (prevSede && prevSede !== selectedSede) {
                                    setFieldValue('convenio_plan_id', '');
                                    setFieldValue('fecha_vencimiento', '');
                                  }
                                  if (selectedSede === 'Monteros') {
                                    setFieldValue('precio', toNumberAR(precio));
                                    setFieldValue(
                                      'descuento',
                                      toNumberAR(descuento)
                                    );
                                    setFieldValue(
                                      'preciofinal',
                                      toNumberAR(preciofinal)
                                    );
                                  } else if (selectedSede === 'Concepción') {
                                    setFieldValue(
                                      'precio',
                                      toNumberAR(precio_concep)
                                    );
                                    setFieldValue(
                                      'descuento',
                                      toNumberAR(descuento_concep)
                                    );
                                    setFieldValue(
                                      'preciofinal',
                                      toNumberAR(preciofinal_concep)
                                    );
                                  }
                                }}
                              >
                                <option value="" disabled>
                                  Seleccionar sede…
                                </option>
                                <option value="Multisede">MULTI SEDE</option>
                                <option value="Monteros">MONTEROS</option>
                                <option value="Concepción">CONCEPCIÓN</option>
                                <option value="SMT">
                                  TUCUMÁN - BARRIO SUR
                                </option>
                                <option value="SanMiguelBN">
                                  TUCUMÁN - BARRIO NORTE
                                </option>
                              </Field>

                              {errors.sede && touched.sede && (
                                <Alerta>{errors.sede}</Alerta>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Sede bloqueada: no se elige */}
                              <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-900">
                                {sedeFijaConvenio ||
                                  'Sede definida por el convenio'}
                              </div>
                              {/* Mantener el valor en el payload */}
                              <Field type="hidden" id="sede" name="sede" />
                              <p className="text-[11px] text-slate-500">
                                La sede está bloqueada por configuración del
                                convenio.
                              </p>
                            </>
                          )}
                        </div>

                        {/* Plan del convenio */}
                        <div className="space-y-1">
                          <label
                            htmlFor="convenio_plan_id"
                            className="text-xs font-medium text-slate-800"
                          >
                            Plan del convenio
                          </label>

                          <PlanSedeRestrictSync
                            sedeFijaConvenio={sedeContextoPlanes}
                            isMultiSedeConvenio={multiContextoPlanes}
                            sedeIdFromConvenio={sedeIdContextoPlanes}
                            planes={planes}
                            values={values}
                            setFieldValue={setFieldValue}
                          />

                          <Field
                            as="select"
                            id="convenio_plan_id"
                            name="convenio_plan_id"
                            disabled={loadingPlanes}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40 disabled:opacity-70"
                            onChange={(e) => {
                              const planId = e.target.value;
                              setFieldValue('convenio_plan_id', planId);

                              // Si selecciona "sin plan", limpiamos vencimiento (backend también lo hará)
                              if (!planId) {
                                setFieldValue('fecha_vencimiento', '');
                                return;
                              }

                              // Opcional: preview de vencimiento en UI (no persistimos como regla final)
                              const plan = planes.find(
                                (p) => String(p.id) === String(planId)
                              );
                              const dur = Number(plan?.duracion_dias || 0);

                              if (dur > 0) {
                                const base = values.fechaCreacion
                                  ? new Date(values.fechaCreacion)
                                  : new Date();
                                const vto = new Date(base.getTime());
                                vto.setDate(vto.getDate() + dur);

                                // guardamos string ISO-like para mostrar; backend será el source of truth
                                const yyyy = vto.getFullYear();
                                const mm = String(vto.getMonth() + 1).padStart(
                                  2,
                                  '0'
                                );
                                const dd = String(vto.getDate()).padStart(
                                  2,
                                  '0'
                                );
                                setFieldValue(
                                  'fecha_vencimiento',
                                  `${yyyy}-${mm}-${dd} 00:00:00`
                                );
                              } else {
                                setFieldValue('fecha_vencimiento', '');
                              }

                              // También podemos "sync" precios con el plan si querés (lo hago en el próximo paso)
                            }}
                          >
                            <option value="">
                              {loadingPlanes
                                ? 'Cargando planes…'
                                : 'Sin plan / No asignar'}
                            </option>

                            {planesVisibles.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre_plan}
                                {p.duracion_dias
                                  ? ` · ${p.duracion_dias} días`
                                  : ''}
                                {p.precio_final
                                  ? ` · $${Number(
                                      p.precio_final
                                    ).toLocaleString('es-AR')}`
                                  : ''}
                              </option>
                            ))}
                          </Field>

                          {errorPlanes && (
                            <p className="text-[11px] text-red-600">
                              No se pudieron cargar los planes ({errorPlanes})
                            </p>
                          )}

                          {/* Vista rápida del plan seleccionado */}
                          {values.convenio_plan_id &&
                            (() => {
                              const plan = planes.find(
                                (p) =>
                                  String(p.id) ===
                                  String(values.convenio_plan_id)
                              );
                              if (!plan) return null;

                              const precioLista = Number(
                                plan.precio_lista || 0
                              );
                              const desc = Number(plan.descuento_valor || 0);
                              const final =
                                plan.precio_final !== null &&
                                plan.precio_final !== undefined
                                  ? Number(plan.precio_final)
                                  : Math.max(
                                      0,
                                      precioLista - (precioLista * desc) / 100
                                    );

                              return (
                                <div className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
                                  <div className="flex flex-wrap gap-2">
                                    <span className="font-semibold text-slate-900">
                                      {plan.nombre_plan}
                                    </span>
                                    {plan.duracion_dias ? (
                                      <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                                        {plan.duracion_dias} días
                                      </span>
                                    ) : null}
                                    <span className="rounded-full bg-slate-50 border border-slate-200 px-2 py-0.5">
                                      Lista: {formatARS(precioLista)}
                                    </span>
                                    <span className="rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-orange-700">
                                      Desc: {Number(desc)}%
                                    </span>
                                    <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-emerald-700">
                                      Final: {formatARS(final)}
                                    </span>
                                  </div>

                                  {values.fecha_vencimiento ? (
                                    <div className="mt-1 text-slate-500">
                                      Vencimiento estimado:{' '}
                                      <span className="font-medium text-slate-800">
                                        {formatDateAR(values.fecha_vencimiento)}
                                      </span>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })()}
                        </div>

                        {/* Resumen pro (ARS + ahorro) */}
                        {(values.precio || values.preciofinal) && (
                          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                            {!!precioBase && (
                              <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 border border-slate-200 text-slate-700">
                                Precio base:
                                <span className="ml-1 font-semibold text-slate-900">
                                  {formatARS(precioBase)}
                                </span>
                              </span>
                            )}

                            {!!descuentoPct && (
                              <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 border border-orange-100 text-orange-700">
                                Descuento:
                                <span className="ml-1 font-semibold">
                                  {formatPct(descuentoPct)}
                                </span>
                              </span>
                            )}

                            {!!totalFinal && (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-100 text-emerald-700">
                                Total final:
                                <span className="ml-1 font-semibold">
                                  {formatARS(totalFinal)}
                                </span>
                              </span>
                            )}

                            {!!ahorro && (
                              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 border border-indigo-100 text-indigo-700">
                                Ahorro:
                                <span className="ml-1 font-semibold">
                                  {formatARS(ahorro)}
                                </span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer: acciones + redes */}
                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting || loadingConve}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-400 px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_10px_22px_rgba(249,115,22,0.45)] hover:-translate-y-[1px] transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
                      >
                        {isSubmitting
                          ? 'Guardando...'
                          : integrante
                          ? 'Actualizar integrante'
                          : 'Crear integrante'}
                      </button>
                    </div>

                    {/* Redes SoftFusion (light coherente) */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="text-[11px] text-slate-500">
                        Desarrollado por{' '}
                        <span className="font-semibold text-pink-600">
                          SoftFusion
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 mr-1 hidden sm:inline">
                          Seguinos:
                        </span>

                        <a
                          href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="SoftFusion en Facebook"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <FaFacebookF className="text-[13px]" />
                        </a>

                        <a
                          href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="SoftFusion en WhatsApp"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <FaWhatsapp className="text-[14px]" />
                        </a>

                        <a
                          href="https://www.instagram.com/softfusiontechnologies/"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="SoftFusion en Instagram"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-fuchsia-300 hover:bg-fuchsia-50 hover:text-fuchsia-700"
                        >
                          <FaInstagram className="text-[14px]" />
                        </a>

                        <a
                          href="https://www.linkedin.com"
                          target="_blank"
                          rel="noreferrer"
                          aria-label="SoftFusion en LinkedIn"
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        >
                          <FaLinkedinIn className="text-[13px]" />
                        </a>
                      </div>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>

      {/* Modales de feedback */}
      <ModalSuccess
        textoModal={textoModal}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>
  );
};

export default FormAltaIntegranteConve;
