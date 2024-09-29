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

const FormAltaConve = ({ isOpen, onClose, conve2, setConve2 }) => {
  // const [conve, setConve] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // const textoModal = 'Conve creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

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
        }, 3000);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

      // Mostrar la ventana modal de error
      setErrorModal(true);

      // Ocultar la ventana modal de éxito después de 3 segundos
      setTimeout(() => {
        setErrorModal(false);
      }, 3000);
    }
  };
  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
   }
    onClose();
  };

  const handlePrecioChange = (values, setFieldValue) => {
    const precio = parseFloat(values.precio) || 0;
    const descuento = parseFloat(values.descuento) || 0;
    const precioFinal = precio - (precio * descuento) / 100;
    setFieldValue('preciofinal', precioFinal);
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
            permiteFec: conve2 ? conve2.permiteFec : 0 // Ajustado para ser un valor numérico nuevo requerimiento R8 - BO
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
              <div className="py-0 max-h-[500px] max-w-[400px] w-[400px] overflow-y-auto bg-white rounded-xl">
                {' '}
                {/* Cuando se haga el modal, sacarle el padding o ponerle uno de un solo digito */}
                <Form className="formulario max-sm:w-[300px] bg-white ">
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

                  <div className="mb-3 px-4">
                    <Field
                      id="nameConve"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Titulo del Convenio"
                      name="nameConve"
                      maxLength="70"
                    />
                    {errors.nameConve && touched.nameConve ? (
                      <Alerta>{errors.nameConve}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="descConve"
                      type="textarea"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Descripción"
                      name="descConve"
                      maxLength="70"
                    />
                    {errors.descConve && touched.descConve ? (
                      <Alerta>{errors.descConve}</Alerta>
                    ) : null}
                  </div>

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

                  <div className="mb-3 px-4">
                    <label>
                      <Field
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

                  <div className="mx-auto flex justify-center my-5">
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

export default FormAltaConve