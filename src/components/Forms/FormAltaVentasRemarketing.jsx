/*
 * Programador: Matias Pallero
 * Fecha Cración: 20 / 10 / 2025
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (FormAltaVentasRemarketing.jsx) es el componente formulario para alta/edición de prospectos remarketing.
 *
 * Tema: Formularios
 * Capa: Frontend
 * Contacto: matuutepallero@gmail.com || 3865265100
 *
 */

import React, { useState, useRef } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';

const FormAltaVentasRemarketing = ({ isOpen, onClose, onSuccess, prospecto, setSelectedProspecto, userId, currentUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

  const formikRef = useRef(null);

  // Esquema de validación con Yup
  const nuevoProspectoSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(3, 'El nombre es muy corto')
      .max(70, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    dni: Yup.string()
      .max(20, 'El DNI es muy largo')
      .nullable(),
    tipo_prospecto: Yup.string()
      .required('El Tipo de Prospecto es obligatorio'),
    canal_contacto: Yup.string()
      .required('El Canal de Contacto es obligatorio'),
    campania_origen: Yup.string()
      .nullable(),
    contacto: Yup.string()
      .min(3, 'El contacto es muy corto')
      .max(100, 'El contacto es muy largo')
      .required('El Contacto es obligatorio'),
    actividad: Yup.string()
      .required('La Actividad es obligatoria'),
    sede: Yup.string()
      .required('La Sede es obligatoria'),
    observacion: Yup.string()
      .max(500, 'La observación es muy larga')
      .nullable(),
  });

  const handleSubmitProspecto = async (valores) => {
    try {
      const usuarioId = userId || currentUser?.id;
      
      if (!usuarioId) {
        setTextoModal('Error: No se pudo obtener el ID del usuario. Por favor, recarga la página.');
        setErrorModal(true);
        return;
      }

      // USAR VARIABLE DE ENTORNO
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const payload = {
        // Solo los campos del formulario que necesitamos
        nombre: valores.nombre,
        nombre_socio: valores.nombre, // Mismo valor que nombre
        dni: valores.dni || '',
        tipo_prospecto: valores.tipo_prospecto,
        canal_contacto: valores.canal_contacto,
        campania_origen: valores.campania_origen || '',
        contacto: valores.contacto,
        actividad: valores.actividad,
        sede: valores.sede,
        observacion: valores.observacion || '',
        
        // 👇 Campos del sistema
        usuario_id: Number(usuarioId),
        fecha: new Date().toISOString().split('T')[0],
        
        // 👇 Campos de contacto
        n_contacto_1: 0,
        n_contacto_2: 0,
        n_contacto_3: 0,

        // 👇 Campos de estado
        convertido: 0,
        comision: 0,
        
        // 👇 Mensajería y agenda
        enviado_primer_mensaje: false,
        respondio_primer_mensaje: false,
        agendado_segunda_visita: false,
        enviado: 0,
        enviado_at: null,
        respondido: 0,
        respondido_at: null,
        agendado: 0,
        agendado_for_date: null,
        agendado_at: null,
        
        // 👇 Otros campos
        ventas_prospecto_id: null,
        recaptacion_id: null,
        visitas: 0,
        convertido_at: null,

      };

      console.log('📤 Enviando prospecto:', payload);
      // console.log(' nombre_socio:', payload.nombre_socio);

      // 🔍 VALIDAR que userId existe
      if (!userId) {
        throw new Error('userId no está definido. Verifica que currentUser.id esté llegando al componente.');
      }

      let response;
      
      if (prospecto) {
        // EDITAR prospecto existente
        response = await axios.put(
          `${API_URL}/ventas-remarketing/${prospecto.id}`,
          payload
        );
        setTextoModal('Prospecto actualizado correctamente.');
      } else {
        // CREAR nuevo prospecto
        response = await axios.post(
          `${API_URL}/ventas-remarketing`,
          payload
        );
        setTextoModal('Prospecto creado correctamente.');
      }

      if (onSuccess) {
        onSuccess();
      } else {
        onClose(); // fallback
      }

      // console.log('✅ Respuesta del servidor:', response.data);
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        onClose(); 
      }, 1500);

    } catch (error) {
      console.error('❌ Error completo:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);

      let mensajeError = 'Error al guardar el prospecto.';
      
      // Mostrar mensaje más descriptivo
      if (error.response?.data?.mensajeError) {
        mensajeError = error.response.data.mensajeError;
      } else if (error.response?.data?.message) {
        mensajeError = error.response.data.message;
      } else if (error.response?.status === 404) {
        mensajeError = 'Error: Endpoint no encontrado.';
      } else if (error.response?.status === 500) {
        mensajeError = 'Error del servidor: ' + (error.response?.data?.mensajeError || error.message);
      } else if (error.message) {
        mensajeError = error.message;
      }
      
      setTextoModal(mensajeError);
      setErrorModal(true);

      setTimeout(() => {
        setErrorModal(false);
      }, 5000); // Tiempo para cerrar el modal de error
    }
  };

  const handleCancel = () => {
    if (setSelectedProspecto) {
      setSelectedProspecto(null);
    }
    onClose();
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      if (setSelectedProspecto) {
        setSelectedProspecto(null);
      }
    }
    onClose();
  };

  return (
    <div
      className={`h-screen w-screen mt-16 fixed inset-0 flex pt-10 justify-center ${
        isOpen ? 'block' : 'hidden'
      } bg-gray-800 bg-opacity-75 z-50`}
    >
      <div className="container-inputs">
        <Formik
          innerRef={formikRef}
          initialValues={{
            nombre: prospecto ? prospecto.nombre : '',
            dni: prospecto ? prospecto.dni : '',
            tipo_prospecto: prospecto ? prospecto.tipo_prospecto : 'Nuevo',
            canal_contacto: prospecto ? prospecto.canal_contacto : 'Mostrador',
            campania_origen: prospecto ? prospecto.campania_origen : '',
            contacto: prospecto ? prospecto.contacto : '',
            actividad: prospecto ? prospecto.actividad : '',
            sede: prospecto ? prospecto.sede : 'monteros',
            observacion: prospecto ? prospecto.observacion : '',
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitProspecto(values);
            resetForm();
          }}
          validationSchema={nuevoProspectoSchema}
        >
          {({ errors, touched, values }) => {
            return (
              <div className="py-0 max-h-[750px] max-w-[550px] w-[400px] overflow-y-auto bg-white rounded-xl shadow-2xl">
                <Form className="formulario max-sm:w-[300px] bg-white">
                  <div className="flex justify-between sticky top-0 bg-white z-10 pb-2">
                    <div className="tools">
                      <div className="circle">
                        <span className="red toolsbox"></span>
                      </div>
                      <div className="circle">
                        <span className="yellow toolsbox"></span>
                      </div>
                      <div className="circle">
                        <span className="green toolsbox"></span>
                      </div>
                    </div>
                    <div
                      className="pr-6 pt-3 text-[20px] cursor-pointer hover:text-red-500 font-bold"
                      onClick={handleClose}
                    >
                      ✕
                    </div>
                  </div>

                  {/* Nombre */}
                  <div className="mb-3 px-4">
                    <Field
                      id="nombre"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre Completo *"
                      name="nombre"
                      maxLength="100"
                    />
                    {errors.nombre && touched.nombre ? (
                      <Alerta>{errors.nombre}</Alerta>
                    ) : null}
                  </div>

                  {/* DNI */}
                  <div className="mb-3 px-4">
                    <Field
                      id="dni"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="DNI"
                      name="dni"
                      maxLength="30"
                    />
                    {errors.dni && touched.dni ? (
                      <Alerta>{errors.dni}</Alerta>
                    ) : null}
                  </div>

                  {/* Tipo Prospecto */}
                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="tipo_prospecto"
                      name="tipo_prospecto"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="ExSocio">ExSocio</option>
                    </Field>
                    {errors.tipo_prospecto && touched.tipo_prospecto ? (
                      <Alerta>{errors.tipo_prospecto}</Alerta>
                    ) : null}
                  </div>

                  {/* Canal Contacto */}
                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="canal_contacto"
                      name="canal_contacto"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="Mostrador">Mostrador</option>
                      <option value="Whatsapp">Whatsapp</option>
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Pagina web">Página web</option>
                      <option value="Campaña">Campaña</option>
                      <option value="Comentarios/Stickers">Comentarios/Stickers</option>
                    </Field>
                    {errors.canal_contacto && touched.canal_contacto ? (
                      <Alerta>{errors.canal_contacto}</Alerta>
                    ) : null}
                  </div>

                  {/* Origen Campaña (condicional) */}
                  {values.canal_contacto === 'Campaña' && (
                    <div className="mb-3 px-4">
                      <Field
                        as="select"
                        id="campania_origen"
                        name="campania_origen"
                        className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      >
                        <option value="">Seleccione origen</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Otro">Otro</option>
                      </Field>
                    </div>
                  )}

                  {/* Contacto */}
                  <div className="mb-3 px-4">
                    <Field
                      id="contacto"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Usuario / Celular *"
                      name="contacto"
                      maxLength="100"
                    />
                    {errors.contacto && touched.contacto ? (
                      <Alerta>{errors.contacto}</Alerta>
                    ) : null}
                  </div>

                  {/* Actividad */}
                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="actividad"
                      name="actividad"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="">Seleccione actividad *</option>
                      <option value="No especifica">No especifica</option>
                      <option value="Musculacion">Musculación</option>
                      <option value="Pilates">Pilates</option>
                      <option value="Clases grupales">Clases grupales</option>
                      <option value="Pase full">Pase full</option>
                    </Field>
                    {errors.actividad && touched.actividad ? (
                      <Alerta>{errors.actividad}</Alerta>
                    ) : null}
                  </div>

                  {/* Sede */}
                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="sede"
                      name="sede"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                      <option value="Barrio Sur">Barrio Sur</option>
                      <option value="Barrio Norte">Barrio Norte</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div>

                  {/* Observación */}
                  <div className="mb-3 px-4">
                    <Field
                      as="textarea"
                      id="observacion"
                      name="observacion"
                      rows={3}
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Observaciones..."
                      maxLength="500"
                    />
                    {errors.observacion && touched.observacion ? (
                      <Alerta>{errors.observacion}</Alerta>
                    ) : null}
                  </div>

                  {/* Botón Submit */}
                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value={prospecto ? 'Actualizar' : 'Crear Prospecto'}
                      className="bg-orange-500 py-2 px-5 rounded-xl text-white font-bold hover:cursor-pointer hover:bg-[#fc4b08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-100 transition-all duration-200"
                    />
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>

      <ModalSuccess
        textoModal={textoModal}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError 
        textoModal={textoModal} // 👈 Pasar mensaje de error
        isVisible={errorModal} 
        onClose={() => setErrorModal(false)} 
      />
    </div>
  );
};

export default FormAltaVentasRemarketing;