/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.1
 *
 * Descripción:
 *  Este archivo (FormAltaQueja.jsx) es el componente donde realizamos un formulario para
 *  la tabla quejas_internas, este formulario aparece en la web del staff.
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useRef, useEffect } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import SelectSede from '../SelectSede';
import { useAuth } from '../../AuthContext';
import Swal from 'sweetalert2';

// Esquema de validación con Yup (solo lo que se edita en este form)
const nuevoQuejaSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(3, 'El nombre es muy corto')
    .max(100, 'El nombre es muy largo')
    .required('El Nombre es obligatorio'),
  tipo_usuario: Yup.string()
    .oneOf(
      ['socio', 'colaborador', 'cliente', 'cliente pilates', 'instructor pilates'],
      'Tipo de usuario inválido'
    )
    .required('El Tipo de Usuario es obligatorio'),
  contacto: Yup.string().max(30, 'El contacto es muy largo').nullable(true),
  motivo: Yup.string()
    .min(10, 'El motivo es demasiado corto')
    .max(500, 'Máximo 500 caracteres')
    .required('El Motivo es obligatorio'),
  sede: Yup.string().required('La Sede es obligatoria')
});

// isOpen y onClose son los métodos que recibe para abrir y cerrar el modal
const FormAltaQueja = ({
  isOpen,
  onClose,
  queja,
  setSelectedQueja,
  obtenerQuejas
}) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');
  const formikRef = useRef(null);

  const { userName } = useAuth();

  const handleSubmitQueja = async (valores) => {
    try {
      // Validación rápida extra por si acaso
      if (valores.nombre.trim() === '' || valores.motivo.trim() === '') {
        Swal.fire({
          title: 'Campos obligatorios',
          text: 'Completá al menos el nombre y el motivo para continuar.',
          icon: 'warning',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#f97316' // naranja
        });
        return;
      }

      const esClientePilates = valores.tipo_usuario === 'cliente pilates'  || valores.tipo_usuario === 'instructor pilates';
      const baseEndpoint = esClientePilates ? 'quejas-pilates' : 'quejas';

      console.log(valores)

        const url = queja
          ? `http://localhost:8080/${baseEndpoint}/${queja.id}` // PUT para ambos tipos
          : `http://localhost:8080/${baseEndpoint}`; // POST para ambos tipos
        const method = queja ? "PUT" : "POST";

      const respuesta = await fetch(url, {
        method,
        body: JSON.stringify({
          ...valores
          // cargado_por ya viene en initialValues
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Si el backend devuelve detalle de error, lo intentamos leer
      if (!respuesta.ok) {
        let detalle = '';
        try {
          const errJson = await respuesta.json();
          detalle =
            errJson?.mensajeError ||
            errJson?.message ||
            `Código HTTP: ${respuesta.status}`;
        } catch {
          detalle = `Código HTTP: ${respuesta.status}`;
        }

        throw new Error(detalle);
      }

      setTextoModal(
        method === 'PUT'
          ? 'Queja actualizada correctamente.'
          : 'Queja creada correctamente.'
      );

      const data = await respuesta.json();
      console.log('Registro insertado/actualizado correctamente:', data);

      // Modal de éxito tuyo
      setShowModal(true);
      setTimeout(() => {
        obtenerQuejas();
        setShowModal(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

      // 🔴 SweetAlert de error
      Swal.fire({
        title: 'Error al guardar la queja',
        text:
          error?.message ||
          'Ocurrió un error inesperado al intentar guardar la queja.',
        icon: 'error',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#ef4444'
      });

      //  ya no usamos ModalError:
      // setErrorModal(true);
      // setTimeout(() => setErrorModal(false), 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedQueja(null);
    }
    onClose();
  };

  const MotivoErrorAlert = ({ message }) => {
    useEffect(() => {
      if (!message) return;

      Swal.fire({
        title: 'Revisá el motivo',
        text: message,
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f97316'
      });
    }, [message]);

    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Panel principal */}
      <div className="relative w-full sm:w-[520px] max-w-[92%] rounded-2xl bg-white shadow-2xl overflow-hidden">
        <Formik
          innerRef={formikRef}
          initialValues={{
            // YA NO USAMOS 'fecha'
            cargado_por: userName || '',
            nombre: queja ? queja.nombre : '',
            tipo_usuario: queja ? queja.tipo_usuario : '',
            contacto: queja ? queja.contacto : '',
            motivo: queja ? queja.motivo : '',
            sede: queja ? queja.sede : '',
            // Campos de estado se siguen enviando pero ya no se editan acá
            resuelto: queja ? queja.resuelto : 0,
            resuelto_por: queja ? queja.resuelto_por : null,
            fecha_resuelto: queja ? queja.fecha_resuelto : null,
            creado_desde_qr: queja ? queja.creado_desde_qr : false
          }}
          enableReinitialize
          validationSchema={nuevoQuejaSchema}
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitQueja(values);
            resetForm();
          }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form>
              {/* Header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-800">
                    {queja ? 'Editar queja' : 'Crear queja'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Cargado por: <strong>{userName || '—'}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100"
                  aria-label="Cerrar"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 space-y-4 max-h-[420px] overflow-y-auto">
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-xs text-zinc-600 mb-1"
                  >
                    Nombre
                  </label>
                  <Field
                    id="nombre"
                    name="nombre"
                    type="text"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-black bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900/10"
                    placeholder="Nombre de la persona"
                    maxLength="100"
                  />
                  {errors.nombre && touched.nombre && (
                    <Alerta>{errors.nombre}</Alerta>
                  )}
                </div>

                {/* Contacto */}
                <div>
                  <label
                    htmlFor="contacto"
                    className="block text-xs text-zinc-600 mb-1"
                  >
                    Contacto
                  </label>
                  <Field
                    id="contacto"
                    name="contacto"
                    type="text"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-black bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900/10"
                    placeholder="Teléfono / WhatsApp"
                    maxLength="30"
                  />
                  {errors.contacto && touched.contacto && (
                    <Alerta>{errors.contacto}</Alerta>
                  )}
                </div>

                {/* Tipo de usuario */}
                <div>
                  <label
                    htmlFor="tipo_usuario"
                    className="block text-xs text-zinc-600 mb-1"
                  >
                    Tipo de usuario
                  </label>
                  <Field
                    as="select"
                    id="tipo_usuario"
                    name="tipo_usuario"
                    className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm text-black bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900/10"
                  >
                    <option value="" disabled>
                      Seleccioná una opción
                    </option>
                    <option value="socio">Socio</option>
                    <option value="colaborador">Colaborador</option>
                    <option value="cliente">Cliente</option>
                    <option value="cliente pilates">Cliente pilates</option>
                    <option value="instructor pilates">Instructor pilates</option>
                  </Field>
                  {errors.tipo_usuario && touched.tipo_usuario && (
                    <Alerta>{errors.tipo_usuario}</Alerta>
                  )}
                </div>

                <SelectSede
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                />

                {/* Motivo */}
                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="motivo"
                      className="block text-xs text-zinc-600 mb-1"
                    >
                      Motivo
                    </label>
                    <span
                      className={`text-[11px] ${
                        values.motivo?.length > 480
                          ? 'text-red-600'
                          : 'text-zinc-500'
                      }`}
                    >
                      {values.motivo?.length || 0}/500
                    </span>
                  </div>
                  <Field
                    as="textarea"
                    id="motivo"
                    name="motivo"
                    className="w-full h-28 rounded-xl border border-zinc-200 px-3 py-2 text-sm text-black bg-zinc-50 outline-none focus:ring-2 focus:ring-zinc-900/10 resize-y"
                    placeholder="Describí el motivo con claridad…"
                    maxLength="500"
                  />
                  {errors.motivo && touched.motivo && (
                    <>
                      <Alerta>{errors.motivo}</Alerta>
                      <MotivoErrorAlert message={errors.motivo} />
                    </>
                  )}
                </div>

                {/* 🔻 Campos ocultos lógicos (no se muestran pero viajan en el payload) */}
                <Field type="hidden" name="cargado_por" />
                <Field type="hidden" name="resuelto" />
                <Field type="hidden" name="resuelto_por" />
                <Field type="hidden" name="fecha_resuelto" />
                <Field type="hidden" name="creado_desde_qr" />
              </div>

              {/* Footer */}
              <div className="px-5 py-4 border-t border-zinc-100 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-[#fc4b08] focus-visible:outline-none focus:ring-2 focus:ring-orange-200"
                >
                  {queja ? 'Actualizar queja' : 'Crear queja'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
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

export default FormAltaQueja;
