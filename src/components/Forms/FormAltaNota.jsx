/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 09 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaNota.jsx) es el componente donde realizamos un formulario para
 *  la tabla Valoracion, este formulario aparece en la web del staff
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import React, { useEffect, useState, useRef } from 'react';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import { useAuth } from '../../AuthContext';

import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes, FaStickyNote, FaUser, FaMoneyBillWave } from 'react-icons/fa';

const ensureModalZIndex = () => {
  if (typeof document === 'undefined') return;
  if (document.getElementById('form-alta-nota-zfix')) return;

  const st = document.createElement('style');
  st.id = 'form-alta-nota-zfix';
  st.innerHTML = `
    /* Este modal debe estar por encima del detalle del integrante (z-[9999]) */
    .form-alta-nota-overlay{ z-index: 20000 !important; }
    .form-alta-nota-panel{ z-index: 20001 !important; position: relative; }

    .modal-overlay{ z-index: 20000 !important; }
    .modal-content{ z-index: 20001 !important; }
    .container-inputs{ z-index: 20001 !important; position: relative; }
  `;
  document.head.appendChild(st);
};

const FormAltaNota = ({ isOpen, onClose, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [precio, setPrecio] = useState('');
  const [precioFinal, setPrecioFinal] = useState(''); // para evitar referencia indefinida en calcularPrecioFinal()

  const textoModal = 'Nota agregada correctamente.';

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  const nuevoNotaSchema = Yup.object().shape({
    notas: Yup.string()
      .max(500, 'Las notas no pueden exceder los 500 caracteres'),
    precio: Yup.string().required('El precio es obligatorio'),
    descuento: Yup.string().required('El descuento es obligatorio'),
    preciofinal: Yup.string().required('El precio final es obligatorio')
  });

  const { userLevel } = useAuth();

  useEffect(() => {
    ensureModalZIndex();
  }, []);

  // Contador de caracteres
  useEffect(() => {
    if (!isOpen) return;
    const len = String(user?.notas || '').length;
    setCharCount(len);
  }, [isOpen, user]);

  // Lock scroll + Escape
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const handlePrecioChange = (values, setFieldValue) => {
    const precio = parseFloat(values.precio) || 0;
    const descuento = parseFloat(values.descuento) || 0;
    const precioFinal = precio - (precio * descuento) / 100;
    setFieldValue('preciofinal', precioFinal.toFixed(2));
  };

  const calcularPrecioFinal = (precio, descuento) => {
    const precioNumerico =
      parseFloat(String(precio).replace(/[^0-9.-]+/g, '')) || 0;
    const descuentoNumerico =
      parseFloat(String(descuento).replace(/[^0-9.-]+/g, '')) || 0;
    const precioFinalCalculado =
      precioNumerico - (precioNumerico * descuentoNumerico) / 100;
    setPrecioFinal(precioFinalCalculado.toFixed(2));
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="form-alta-nota-overlay fixed inset-0 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-[3px]"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ y: 26, opacity: 0, scale: 0.99 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 18, opacity: 0, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="
              form-alta-nota-panel
              relative w-full sm:w-[92vw] sm:max-w-lg
              rounded-t-3xl sm:rounded-3xl
              border border-white/10
              bg-zinc-950/85 backdrop-blur-xl
              shadow-[0_30px_90px_rgba(0,0,0,0.55)]
              overflow-hidden
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Accent */}
            <div className="h-[3px] bg-gradient-to-r from-[#fc4b08] via-orange-400 to-amber-300" />

            {/* Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/10 bg-zinc-950/60 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-white/5 border border-white/10 text-[#fc4b08]">
                    <FaStickyNote />
                  </span>

                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-semibold text-white truncate">
                      Agregar / Editar Nota
                    </div>
                    <div className="text-xs text-white/60 truncate flex items-center gap-2 mt-0.5">
                      <FaUser className="opacity-70" />
                      <span className="truncate">{user?.nombre || '—'}</span>
                      <span className="opacity-50">·</span>
                      <span className="truncate">DNI {user?.dni || '—'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white transition"
                  aria-label="Cerrar"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-5">
              <Formik
                innerRef={formikRef}
                enableReinitialize
                initialValues={{
                  notas: user ? user.notas : '',
                  precio: user ? user.precio : '',
                  descuento: user ? user.descuento : '',
                  preciofinal: user ? user.preciofinal : ''
                }}
                onSubmit={async (values, { resetForm, setSubmitting }) => {
                  // Comparamos los valores del formulario con los valores iniciales
                  if (
                    values.notas === (user?.notas || '') &&
                    values.precio === (user?.precio || '') &&
                    values.descuento === (user?.descuento || '') &&
                    values.preciofinal === (user?.preciofinal || '')
                  ) {
                    alert('No se realizaron cambios.');
                    setSubmitting(false);
                    return;
                  }

                  try {
                    const response = await fetch(
                      `http://localhost:8080/integrantes/${user.id}`,
                      {
                        method: 'PUT',
                        body: JSON.stringify({
                          notas: values.notas,
                          precio: parseFloat(values.precio),
                          descuento: parseFloat(values.descuento),
                          preciofinal: parseFloat(values.preciofinal)
                        }),
                        headers: {
                          'Content-Type': 'application/json'
                        }
                      }
                    );

                    if (!response.ok) {
                      throw new Error(
                        'Error en la solicitud PUT: ' + response.status
                      );
                    }

                    setShowModal(true);
                    setTimeout(() => setShowModal(false), 3000);
                  } catch (error) {
                    console.error(
                      'Error al insertar el registro:',
                      error.message
                    );
                    setErrorModal(true);
                    setTimeout(() => setErrorModal(false), 3000);
                  } finally {
                    setSubmitting(false);
                    resetForm();
                  }
                }}
                validationSchema={nuevoNotaSchema}
              >
                {({
                  isSubmitting,
                  values,
                  setFieldValue,
                  handleChange,
                  errors,
                  touched
                }) => (
                  <Form className="space-y-4">
                    {/* NOTAS */}
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/55">
                          Notas (máx. 500)
                        </div>
                        <div className="text-[11px] text-white/50">
                          {charCount}/500
                        </div>
                      </div>

                      <div className="mt-3 relative">
                        <Field
                          id="notas"
                          as="textarea"
                          name="notas"
                          rows="5"
                          maxLength="500"
                          className={`
                            w-full rounded-2xl px-4 py-3
                            bg-zinc-900/60 text-white
                            border border-white/10
                            outline-none
                            focus:ring-2 focus:ring-orange-400/40
                            focus:border-orange-400/40
                            transition
                            resize-none
                          `}
                          placeholder="Escribí una nota…"
                          onChange={(e) => {
                            setCharCount(e.target.value.length);
                            handleChange(e);
                          }}
                        />

                        {touched.notas && errors.notas && (
                          <div className="mt-2 text-xs text-rose-300">
                            {errors.notas}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CAMPOS ADMIN */}
                    {(userLevel === 'admin' ||
                      userLevel === 'administrador') && (
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/55">
                          <FaMoneyBillWave className="text-[#fc4b08]" />
                          Datos de precio
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] text-white/60">
                              Precio
                            </label>
                            <Field
                              id="precio"
                              name="precio"
                              type="text"
                              inputMode="decimal"
                              className="
                                mt-2 w-full rounded-2xl px-4 py-3
                                bg-zinc-900/60 text-white
                                border border-white/10
                                outline-none
                                focus:ring-2 focus:ring-orange-400/40
                                focus:border-orange-400/40
                                transition
                              "
                              placeholder="Precio"
                              maxLength="14"
                              onChange={(e) => {
                                setFieldValue('precio', e.target.value);
                                handlePrecioChange(
                                  { ...values, precio: e.target.value },
                                  setFieldValue
                                );
                              }}
                            />
                            {touched.precio && errors.precio && (
                              <div className="mt-2 text-xs text-rose-300">
                                {errors.precio}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[11px] text-white/60">
                              Descuento (%)
                            </label>
                            <Field
                              id="descuento"
                              name="descuento"
                              type="text"
                              inputMode="decimal"
                              className="
                                mt-2 w-full rounded-2xl px-4 py-3
                                bg-zinc-900/60 text-white
                                border border-white/10
                                outline-none
                                focus:ring-2 focus:ring-orange-400/40
                                focus:border-orange-400/40
                                transition
                              "
                              placeholder="Descuento"
                              maxLength="14"
                              onChange={(e) => {
                                setFieldValue('descuento', e.target.value);
                                handlePrecioChange(
                                  { ...values, descuento: e.target.value },
                                  setFieldValue
                                );
                              }}
                            />
                            {touched.descuento && errors.descuento && (
                              <div className="mt-2 text-xs text-rose-300">
                                {errors.descuento}
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="text-[11px] text-white/60">
                              Precio final
                            </label>
                            <Field
                              id="preciofinal"
                              name="preciofinal"
                              type="text"
                              readOnly
                              value={values.preciofinal}
                              className="
                                mt-2 w-full rounded-2xl px-4 py-3
                                bg-zinc-900/40 text-white/90
                                border border-white/10
                                outline-none
                              "
                              placeholder="Precio Final"
                              maxLength="14"
                            />
                            {touched.preciofinal && errors.preciofinal && (
                              <div className="mt-2 text-xs text-rose-300">
                                {errors.preciofinal}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FOOTER */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="
                          w-full sm:w-auto
                          inline-flex items-center justify-center
                          rounded-2xl
                          border border-white/10
                          bg-white/5
                          px-4 py-3
                          text-sm font-semibold text-white/80
                          hover:bg-white/10 hover:text-white
                          transition
                        "
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        id="click2"
                        disabled={isSubmitting}
                        className="
                          w-full
                          inline-flex items-center justify-center gap-2
                          rounded-2xl
                          bg-gradient-to-r from-orange-500 via-[#fc4b08] to-amber-300
                          px-4 py-3
                          text-sm font-extrabold text-white
                          shadow-[0_16px_40px_rgba(252,75,8,0.22)]
                          hover:shadow-[0_18px_46px_rgba(252,75,8,0.30)]
                          transition
                          disabled:opacity-70 disabled:cursor-not-allowed
                        "
                      >
                        <FaStickyNote />
                        Guardar cambios
                      </button>
                    </div>

                    <div className="text-[11px] text-white/40">
                      Tip: cerrá con{' '}
                      <span className="text-white/60 font-semibold">ESC</span> o
                      clic fuera del panel.
                    </div>
                  </Form>
                )}
              </Formik>
            </div>

            {/* Modales legacy */}
            <ModalSuccess
              textoModal={textoModal}
              isVisible={showModal}
              onClose={() => setShowModal(false)}
            />
            <ModalError
              isVisible={errorModal}
              onClose={() => setErrorModal(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

//Se elimina los default prosp, quedo desactualizado
// FormAltaNota.defaultProps = {
//   notas: {},
// };

export default FormAltaNota;
