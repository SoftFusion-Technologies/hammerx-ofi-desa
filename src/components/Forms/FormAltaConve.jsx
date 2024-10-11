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
      className={`h-screen w-screen mt-16 fixed inset-0 flex pt-10 justify-center ${
        isOpen ? 'block' : 'hidden'
      } bg-gray-800 bg-opacity-75 z-50`}
    >
      <div className={`container-inputs`}>
        {/*
                Formik es una biblioteca de formularios React de terceros.
                Proporciona programación y validación de formularios básicos.
                Se basa en componentes controlados
                y reduce en gran medida el tiempo de programación de formularios.
            */}
        <Formik
          // valores con los cuales el formulario inicia y este objeto tambien lo utilizo para cargar los datos en la API
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
            desc_usu: conve2 ? conve2.desc_usu : '',
            permiteFec: conve2 ? conve2.permiteFec : 0, // Ajustado para ser un valor numérico nuevo requerimiento R8 - BO
            // nuevos valores para precios en multisede
            precio_concep: conve2 ? conve2.precio_concep : '',
            descuento_concep: conve2 ? conve2.descuento_concep : '',
            preciofinal_concep: conve2 ? conve2.preciofinal_concep : ''
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitConve(values);

            resetForm();
          }}
          validationSchema={nuevoConveSchema}
        >
          {({ isSubmitting, setFieldValue, errors, touched, values }) => {
            return (
              <div className="-mt-10 py-0 max-h-[1200px] max-w-[1200px] w-full h-full bg-white rounded-xl overflow-y-auto relative">
                {' '}
                {/* Cuando se haga el modal, sacarle el padding o ponerle uno de un solo digito */}
                <Form className="formulario bg-white ">
                  <div className="flex justify-between">
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
                      className="pr-6 pt-3 text-[20px] cursor-pointer"
                      onClick={handleClose}
                    >
                      x
                    </div>
                  </div>

                  <div className="mb-4 px-6">
                    <Field
                      id="nameConve"
                      type="text"
                      className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Titulo del Convenio"
                      name="nameConve"
                      maxLength="70"
                    />
                    {errors.nameConve && touched.nameConve ? (
                      <Alerta>{errors.nameConve}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <ReactQuill
                      theme="snow"
                      value={values.descConve}
                      onChange={(content) => {
                        setFieldValue('descConve', content);
                        setDescUsuCount(content.length);
                      }}
                      placeholder="Descripcion para Colaboradores"
                      className={`mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 custom-quill-editor`}
                    />
                    {descConveCount > maxLength && (
                      <style>{`
                      .ql-editor {
                        background-color: #f36464;
                      }
                    `}</style>
                    )}
                    {errors.descConve && touched.descConve ? (
                      <Alerta>{errors.descConve}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-6">
                    <Field
                      id="precio"
                      name="precio"
                      type="text"
                      className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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

                  <div className="mb-4 px-6">
                    <Field
                      id="descuento"
                      name="descuento"
                      type="text"
                      className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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

                  <div className="mb-4 px-6">
                    <Field
                      id="preciofinal"
                      name="preciofinal"
                      type="text"
                      className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Precio Final"
                      maxLength="14"
                      readOnly
                      value={values.preciofinal}
                    />
                  </div>

                  <div className="mb-4 px-6">
                    <Field
                      as="select"
                      id="sede"
                      name="sede"
                      className="form-select mt-2 block w-full p-4 text-black bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      onChange={(e) => {
                        setFieldValue('sede', e.target.value);
                        setVisible(e.target.value === 'Multisede');
                      }}
                    >
                      <option value="" disabled>
                        Sede:
                      </option>
                      <option value="Multisede">Multi Sede</option>
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div>
                  <div className="mb-3 px-4">
                    <ReactQuill
                      theme="snow"
                      value={values.desc_usu}
                      onChange={(content) => {
                        setFieldValue('desc_usu', content);
                        setDescUsuCount(content.length);
                      }}
                      placeholder="Descripcion para Usuarios"
                      className={`mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 custom-quill-editor`}
                    />
                    {descUsuCount > maxLength && (
                      <style>{`
                      .ql-editor {
                        background-color: #f36464;
                      }
                    `}</style>
                    )}
                    {errors.desc_usu && touched.desc_usu ? (
                      <Alerta>{errors.desc_usu}</Alerta>
                    ) : null}
                  </div>

                  {visible && (
                    <div>
                      <div className="mb-4 px-6">
                        <Field
                          id="precio_concep"
                          name="precio_concep"
                          type="text"
                          className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
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
                      </div>

                      <div className="mb-4 px-6">
                        <Field
                          id="descuento_concep"
                          name="descuento_concep"
                          type="text"
                          className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                          placeholder="Descuento Concepción"
                          maxLength="14"
                          onChange={(e) => {
                            setFieldValue('descuento_concep', e.target.value);
                            handlePrecioChange(
                              { ...values, descuento_concep: e.target.value },
                              setFieldValue,
                              'precio_concep', // Campo de precio
                              'descuento_concep', // Campo de descuento
                              'preciofinal_concep' // Campo de precio final
                            );
                          }}
                        />
                      </div>

                      <div className="mb-4 px-6">
                        <Field
                          id="preciofinal_concep"
                          name="preciofinal_concep"
                          type="text"
                          className="mt-2 block w-full p-4 text-black formulario__input bg-slate-100 rounded-xl text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                          placeholder="Precio Final Concepción"
                          maxLength="14"
                          readOnly
                          value={values.preciofinal_concep}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mb-3 px-4">
                    <label>
                      <Field
                        className="ml-2"
                        type="checkbox"
                        name="permiteFam"
                        checked={values.permiteFam}
                        onChange={() =>
                          setFieldValue('permiteFam', !values.permiteFam)
                        }
                      />
                      Permite Familiar
                    </label>
                  </div>

                  {values.permiteFam && (
                    <div className="mb-3 px-4">
                      <label>Cant de familiares:</label>
                      {[1, 2, 3, 4, 5].map((number) => (
                        <label key={number} className="mx-2">
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

                  <div className="mb-3 px-4">
                    <label>Permite Fechas</label>
                    <div className="d-flex">
                      <label className="me-3">
                        <Field
                          type="radio"
                          name="permiteFec"
                          value="1"
                          checked={values.permiteFec === 1}
                          onChange={() => setFieldValue('permiteFec', 1)}
                        />
                        Sí
                      </label>
                      <label>
                        <Field
                          type="radio"
                          name="permiteFec"
                          value="0"
                          checked={values.permiteFec === 0}
                          onChange={() => setFieldValue('permiteFec', 0)}
                        />
                        No
                      </label>
                    </div>
                  </div>

                  <div className="fixed-button-container flex justify-center">
                    <input
                      type="submit"
                      value={conve2 ? 'Actualizar' : 'Crear Convenio'}
                      className="bg-orange-500 py-2 px-5 rounded-xl text-white font-bold hover:cursor-pointer hover:bg-[#fc4b08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-100"
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
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>
  );
};

// Se elimina los default prosp, quedo desactualizado
// FormAltaConve.defaultProps = {
//   conve: {}
// };

export default FormAltaConve;
