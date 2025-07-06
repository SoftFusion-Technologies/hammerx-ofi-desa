/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Creación: 01 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaConve.jsx) es el componente donde realizamos un formulario para
 *  la tabla Conve, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import ReactQuill from 'react-quill';
import '../../styles/Forms/FormAltaConve.css';
import SelectSede from '../../components/SelectSede';
import SelectSedes from '../../pages/staff/Components/SelectSedes';
import { motion, AnimatePresence } from 'framer-motion'; // necesitas framer-motion

const FormAltaConve = ({ isOpen, onClose, conve2, setConve2 }) => {
  // const [conve, setConve] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const [descConveCount, setDescConveCount] = useState(0);
  const [descUsuCount, setDescUsuCount] = useState(0);
  const [visible, setVisible] = useState(false);

  const maxLength = 2550;
  // const textoModal = 'Conve creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  useEffect(() => {
    setVisible(false);
  }, []);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoConveSchema = Yup.object().shape({
    nameConve: Yup.string().required('El Titulo es obligatorio'),
    descConve: Yup.string().required('La descripción es obligatoria')
  });

  const handleSubmitConve = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (valores.nameConve === '' || valores.descConve === '') {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        const transformedValues = {
          ...valores,
          permiteFam: valores.permiteFam ? 1 : 0
        };

        //
        // ? `http://localhost:8080/admconvenios/${conve2.id}`
        //       : 'http://localhost:8080/admconvenios/';
        // Definir URL y método basados en la existencia de conve
        const url = conve2
          ? `http://localhost:8080/admconvenios/${conve2.id}`
          : 'http://localhost:8080/admconvenios/';
        const method = conve2 ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify(transformedValues),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error('Error en la solicitud POST: ' + respuesta.status);
        }
        if (method === 'PUT') {
          // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal('Convenio actualizado correctamente.');
        } else {
          setTextoModal('Convenio creado correctamente.');
        }

        // Convertimos la respuesta a JSON
        const data = await respuesta.json();
        console.log('Registro insertado correctamente:', data);

        // Mostrar la ventana modal de éxito
        setShowModal(true);

        // Ocultar la ventana modal de éxito después de 3 segundos
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

      // Mostrar la ventana modal de error
      setErrorModal(true);

      // Ocultar la ventana modal de éxito después de 3 segundos
      setTimeout(() => {
        setErrorModal(false);
      }, 1500);
    }
  };
  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
    }
    onClose();
  };

  const handlePrecioChange = (
    values,
    setFieldValue,
    precioField,
    descuentoField,
    precioFinalField
  ) => {
    const precio = parseFloat(values[precioField]) || 0;
    const descuento = parseFloat(values[descuentoField]) || 0;
    const precioFinal = precio - (precio * descuento) / 100;

    // Establecer el valor calculado en el campo correspondiente
    setFieldValue(precioFinalField, precioFinal);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        isOpen ? '' : 'hidden'
      }`}
    >
      <div className="relative w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden animate-fade-in transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <button
            className="text-gray-500 hover:text-orange-500 transition text-2xl font-bold"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="w-full px-2 py-2 max-h-[85vh] overflow-y-auto">
          <Formik
            innerRef={formikRef}
            initialValues={{
              nameConve: conve2 ? conve2.nameConve : '',
              descConve: conve2 ? conve2.descConve : '',
              precio: conve2 ? conve2.precio : '',
              descuento: conve2 ? conve2.descuento : '',
              preciofinal: conve2 ? conve2.preciofinal : '',
              permiteFam: conve2 ? conve2.permiteFam : false,
              cantFamiliares: conve2 ? conve2.cantFamiliares : 0,
              sede: conve2 ? conve2.sede : '',
              agrupador: conve2 ? conve2.agrupador : '',
              desc_usu: conve2 ? conve2.desc_usu : '',
              permiteFec: conve2 ? conve2.permiteFec : 0,
              precio_concep: conve2 ? conve2.precio_concep : '',
              descuento_concep: conve2 ? conve2.descuento_concep : '',
              preciofinal_concep: conve2 ? conve2.preciofinal_concep : ''
            }}
            enableReinitialize
            onSubmit={async (values, { resetForm }) => {
              await handleSubmitConve(values);
              resetForm();
            }}
            validationSchema={nuevoConveSchema}
          >
            {({ isSubmitting, setFieldValue, errors, touched, values }) => (
              <div className="py-2 px-1 md:px-4">
                <Form className="formulario bg-white flex flex-col gap-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Field
                        id="nameConve"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="Título del Convenio"
                        name="nameConve"
                        maxLength="70"
                      />
                      {errors.nameConve && touched.nameConve && (
                        <Alerta>{errors.nameConve}</Alerta>
                      )}
                    </div>
                    <div>
                      <Field
                        id="precio"
                        name="precio"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="Precio"
                        maxLength="14"
                        onChange={(e) => {
                          setFieldValue('precio', e.target.value);
                          handlePrecioChange(
                            { ...values, precio: e.target.value },
                            setFieldValue,
                            'precio',
                            'descuento',
                            'preciofinal'
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Field
                        id="descuento"
                        name="descuento"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="Descuento"
                        maxLength="14"
                        onChange={(e) => {
                          setFieldValue('descuento', e.target.value);
                          handlePrecioChange(
                            { ...values, descuento: e.target.value },
                            setFieldValue,
                            'precio',
                            'descuento',
                            'preciofinal'
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Field
                        id="preciofinal"
                        name="preciofinal"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500 transition-all"
                        placeholder="Precio Final"
                        maxLength="14"
                        readOnly
                        value={values.preciofinal}
                      />
                    </div>
                  </div>
                  <div>
                    <ReactQuill
                      theme="snow"
                      value={values.descConve}
                      onChange={(content) => {
                        setFieldValue('descConve', content);
                        setDescUsuCount(content.length);
                      }}
                      placeholder="Descripción para Colaboradores"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all custom-quill-editor"
                    />
                    {descConveCount > maxLength && (
                      <style>{`
                      .ql-editor {
                        background-color: #f36464;
                      }
                    `}</style>
                    )}
                    {errors.descConve && touched.descConve && (
                      <Alerta>{errors.descConve}</Alerta>
                    )}
                  </div>

                  <SelectSede
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                  />

                  <div>
                    <ReactQuill
                      theme="snow"
                      value={values.desc_usu}
                      onChange={(content) => {
                        setFieldValue('desc_usu', content);
                        setDescUsuCount(content.length);
                      }}
                      placeholder="Descripción para Usuarios"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus:ring-2 focus:ring-orange-500 transition-all custom-quill-editor"
                    />
                    {descUsuCount > maxLength && (
                      <style>{`
                      .ql-editor {
                        background-color: #f36464;
                      }
                    `}</style>
                    )}
                    {errors.desc_usu && touched.desc_usu && (
                      <Alerta>{errors.desc_usu}</Alerta>
                    )}
                  </div>

                  {visible && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <Field
                        id="precio_concep"
                        name="precio_concep"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Precio Concepción"
                        maxLength="14"
                        onChange={(e) => {
                          setFieldValue('precio_concep', e.target.value);
                          handlePrecioChange(
                            { ...values, precio_concep: e.target.value },
                            setFieldValue,
                            'precio_concep',
                            'descuento_concep',
                            'preciofinal_concep'
                          );
                        }}
                      />
                      <Field
                        id="descuento_concep"
                        name="descuento_concep"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Descuento Concepción"
                        maxLength="14"
                        onChange={(e) => {
                          setFieldValue('descuento_concep', e.target.value);
                          handlePrecioChange(
                            { ...values, descuento_concep: e.target.value },
                            setFieldValue,
                            'precio_concep',
                            'descuento_concep',
                            'preciofinal_concep'
                          );
                        }}
                      />
                      <Field
                        id="preciofinal_concep"
                        name="preciofinal_concep"
                        type="text"
                        className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Precio Final Concepción"
                        maxLength="14"
                        readOnly
                        value={values.preciofinal_concep}
                      />
                    </div>
                  )}
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <label className="flex items-center">
                      <Field
                        className="ml-2"
                        type="checkbox"
                        name="permiteFam"
                        checked={values.permiteFam}
                        onChange={() =>
                          setFieldValue('permiteFam', !values.permiteFam)
                        }
                      />
                      <span className="ml-2">Permite Familiar</span>
                    </label>
                    <SelectSedes
                      value={values.agrupador}
                      onChange={(value) => setFieldValue('agrupador', value)}
                    />
                  </div>

                  {values.permiteFam && (
                    <div className="flex flex-wrap gap-4 items-center">
                      <label>Cant de familiares:</label>
                      {[1, 2, 3, 4, 5].map((number) => (
                        <label key={number} className="flex items-center gap-1">
                          <Field
                            type="checkbox"
                            name="cantFamiliares"
                            checked={values.cantFamiliares === number}
                            onChange={() =>
                              setFieldValue('cantFamiliares', number)
                            }
                          />
                          {number}
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 items-center">
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="permiteFec"
                        value="1"
                        checked={values.permiteFec === 1}
                        onChange={() => setFieldValue('permiteFec', 1)}
                      />
                      <span className="ml-2">Permite Fechas</span>
                    </label>
                    <label className="flex items-center">
                      <Field
                        type="radio"
                        name="permiteFec"
                        value="0"
                        checked={values.permiteFec === 0}
                        onChange={() => setFieldValue('permiteFec', 0)}
                      />
                      <span className="ml-2">No</span>
                    </label>
                  </div>
                  <div className="flex justify-center ">
                    <input
                      type="submit"
                      value={conve2 ? 'Actualizar' : 'Crear Convenio'}
                      className="bg-gradient-to-r from-orange-400 to-orange-500 py-2 px-7 rounded-xl text-white font-bold shadow-lg hover:scale-105 transition-all"
                    />
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
        <ModalError
          isVisible={errorModal}
          onClose={() => setErrorModal(false)}
        />
      </div>
    </div>
  );
};

// Se elimina los default prosp, quedo desactualizado
// FormAltaConve.defaultProps = {
//   conve: {}
// };

export default FormAltaConve;
