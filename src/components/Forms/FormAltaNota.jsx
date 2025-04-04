/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 09 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaNota.jsx) es el componente donde realizamos un formulario para
 *  la tabla Valoracion, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import React, { useState, useRef } from 'react';

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import { useAuth } from '../../AuthContext';

const FormAltaNota = ({ isOpen, onClose, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const [precio, setPrecio] = useState('');
  const textoModal = 'Nota agregada correctamente.';

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  const nuevoNotaSchema = Yup.object().shape({
    notas: Yup.string()
      .max(500, 'Las notas no pueden exceder los 500 caracteres')
      .required('El campo de notas es requerido'),
    precio: Yup.string().required('El precio es obligatorio'),
    descuento: Yup.string().required('El descuento es obligatorio'),
    preciofinal: Yup.string().required('El precio final es obligatorio')
  });

  const { userLevel } = useAuth();

  const handlePrecioChange = (values, setFieldValue) => {
    const precio = parseFloat(values.precio) || 0;
    const descuento = parseFloat(values.descuento) || 0;
    const precioFinal = precio - (precio * descuento) / 100;
    setFieldValue('preciofinal', precioFinal.toFixed(2));
  };

  const calcularPrecioFinal = (precio, descuento) => {
    const precioNumerico = parseFloat(precio.replace(/[^0-9.-]+/g, '')) || 0;
    const descuentoNumerico =
      parseFloat(descuento.replace(/[^0-9.-]+/g, '')) || 0;
    const precioFinalCalculado =
      precioNumerico - (precioNumerico * descuentoNumerico) / 100;
    setPrecioFinal(precioFinalCalculado.toFixed(2));
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    onClose();
  };
  return (
    <div
      className={`h-screen w-screen fixed inset-0 flex pt-10 justify-center items-center ${
        isOpen ? 'block' : 'hidden'
      } bg-gray-800 bg-opacity-75 z-50`}
    >
      {/* `http://localhost:8080/integrantes/${user.id}`, */}
      <div className={`container-inputs`}>
        <Formik
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
              // No hay cambios, no enviamos la solicitud
              alert('No se realizaron cambios.');
              setSubmitting(false);
              return;
            }

            // Si hay cambios, realizamos la solicitud PUT
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
              setTimeout(() => {
                setShowModal(false);
              }, 3000);
            } catch (error) {
              console.error('Error al insertar el registro:', error.message);
              setErrorModal(true);
              setTimeout(() => {
                setErrorModal(false);
              }, 3000);
            } finally {
              setSubmitting(false);
              resetForm();
            }
          }}
          validationSchema={nuevoNotaSchema}
        >
          {({ isSubmitting, values, setFieldValue, handleChange }) => (
            <div className="py-0 max-h-[500px] max-w-[400px] w-[400px] overflow-y-auto bg-white rounded-xl">
              <Form className="formulario max-sm:w-[300px] bg-white ">
                <div className="flex justify-between items-center mt-3 mx-5 pb-2">
                  <h1 className="">
                    <span className="text-orange-600">Integrante: </span>{' '}
                    {user.nombre}
                  </h1>
                  <div
                    className="text-[20px] cursor-pointer font-semibold"
                    onClick={handleClose}
                  >
                    x
                  </div>
                </div>

                <div className="mb-3 px-4 relative">
                  <Field
                    id="notas"
                    as="textarea"
                    className={`mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      charCount >= 500
                        ? 'focus-visible:outline-red-500 border-red-500'
                        : 'focus-visible:outline-orange-500'
                    }`}
                    placeholder="Notas"
                    name="notas"
                    maxLength="500"
                    onChange={(e) => {
                      setCharCount(e.target.value.length);
                      handleChange(e);
                    }}
                  />
                  <div className="absolute right-4 top-1 text-sm text-gray-600">
                    {charCount}/500
                  </div>
                </div>

                {(userLevel === 'admin' || userLevel === 'administrador') && (
                  <div className="mb-4 px-4">
                    <Field
                      id="precio"
                      name="precio"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
                  </div>
                )}

                {(userLevel === 'admin' || userLevel === 'administrador') && (
                  <div className="mb-4 px-4">
                    <Field
                      id="descuento"
                      name="descuento"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
                  </div>
                )}

                {(userLevel === 'admin' || userLevel === 'administrador') && (
                  <div className="mb-4 px-4">
                    <Field
                      id="preciofinal"
                      name="preciofinal"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Precio Final"
                      maxLength="14"
                      readOnly
                      value={values.preciofinal}
                    />
                  </div>
                )}

                <div className="mx-auto flex justify-center my-5">
                  <button
                    type="submit"
                    className="bg-orange-500 py-2 px-5 rounded-xl text-white font-bold hover:cursor-pointer hover:bg-[#fc4b08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-100"
                    id="click2"
                    disabled={isSubmitting}
                  >
                    Agregar Nota
                  </button>
                </div>
              </Form>
            </div>
          )}
        </Formik>
      </div>
      <ModalSuccess
        textoModal={textoModal}
        isVisible={showModal}
        onClose={() => setShowModal(false)}
      />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>
  );
};
//Se elimina los default prosp, quedo desactualizado
// FormAltaNota.defaultProps = {
//   notas: {},
// };

export default FormAltaNota;
