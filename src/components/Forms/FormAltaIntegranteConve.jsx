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

import React, { useState, useEffect, useRef } from 'react';
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

  const ARS = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  });

  const toNumberAR = (v) => {
    if (v === null || v === undefined) return 0;
    const s = String(v).trim();

    // Soporta: "25.000", "$25.000", "25000", "25,000" (lo normalizamos)
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

  const formatPct = (v) => {
    const n = toNumberAR(v);
    return `${n}%`;
  };

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
              fechaCreacion: obtenerFechaActual()
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

              const precioBase = toNumberAR(values.precio);
              const totalFinal = toNumberAR(values.preciofinal);
              const descuentoPct = toNumberAR(values.descuento);
              const ahorro = Math.max(0, precioBase - totalFinal);

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

                          <div className="space-y-1">
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
                        <div className="space-y-1">
                          <label
                            htmlFor="sede"
                            className="text-xs font-medium text-slate-800"
                          >
                            Sede <span className="text-orange-600">*</span>
                          </label>

                          <Field
                            as="select"
                            id="sede"
                            name="sede"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 shadow-inner shadow-slate-100 outline-none transition-all duration-150 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-400/40"
                            onChange={(e) => {
                              const selectedSede = e.target.value;
                              setFieldValue('sede', selectedSede);

                              // Normalizamos a número para evitar arrastrar formatos raros
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
                            <option value="SMT">TUCUMÁN - BARRIO SUR</option>
                            <option value="SanMiguelBN">
                              TUCUMÁN - BARRIO NORTE
                            </option>
                          </Field>

                          {errors.sede && touched.sede && (
                            <Alerta>{errors.sede}</Alerta>
                          )}
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
                        disabled={isSubmitting}
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
