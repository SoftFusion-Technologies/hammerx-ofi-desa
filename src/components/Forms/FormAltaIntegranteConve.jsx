/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Creación: 05 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaIntegranteConve.jsx) es el componente donde realizamos un formulario para
 *  la tabla IntegranteConve, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import { useAuth } from "../../AuthContext";

const FormAltaIntegranteConve = ({
  isOpen,
  onClose,
  precio,
  descuento,
  preciofinal,
  integrante,
  setSelectedUser
}) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const { id_conv } = useParams(); // Obtener el id_conv de la URL
  const { userName } = useAuth();
  
  // const textoModal = 'Integrante creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);
  const newPrecio = precio;
  const newDescuento = descuento;
  const newPrecioFinal = preciofinal;

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoIntegranteSchema = Yup.object().shape({
    nombre: Yup.string().required('El Nombre es obligatorio'),
    telefono: Yup.string(),
    direccion: Yup.string(),
    trabajo: Yup.string()
  });
          // ? `http://localhost:8080/integrantes/${integrante.id}`
          // : 'http://localhost:8080/integrantes/';
  const handleSubmitIntegrante = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (valores.nombre === '' || valores.telefono === '') {
        alert('Por favor, complete todos los campos obligatorios.');
      }else {
        // (NUEVO)
        const url = integrante
          ? `http://localhost:8080/integrantes/${integrante.id}`
          : 'http://localhost:8080/integrantes/';
        const method = integrante ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

          if (method === 'PUT') {
            // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
            setTextoModal('Integrante actualizado correctamente.');
          } else {
            setTextoModal('Integrante creado correctamente.');
          }

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error('Error en la solicitud POST: ' + respuesta.status);
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
    if (integrante && formikRef.current) {
      formikRef.current.resetForm();
      setSelectedUser(null);
    }
      onClose();
    };
  
  const obtenerFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0'); // Los meses son indexados desde 0
    const dia = String(hoy.getDate()).padStart(2, '0');
    const horas = String(hoy.getHours()).padStart(2, '0');
    const minutos = String(hoy.getMinutes()).padStart(2, '0');
    const segundos = String(hoy.getSeconds()).padStart(2, '0');
    
    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
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
            id_conv: id_conv || '', // Usa el id_conv obtenido de la URL
            nombre: integrante ? integrante.nombre : '',
            dni: integrante ? integrante.dni : '',
            telefono: integrante ? integrante.telefono : '',
            email: integrante ? integrante.email : '',
            sede: '',
            notas: integrante ? integrante.notas : '',
            precio: integrante ? integrante.precio : newPrecio,
            descuento: integrante ? integrante.descuento : newDescuento,
            preciofinal: integrante ? integrante.preciofinal : newPrecioFinal,
            userName: userName || '',
            fechaCreacion:obtenerFechaActual() // Envía la fecha en formato ISO 8601
         
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitIntegrante(values);

            resetForm();
          }}
          validationSchema={nuevoIntegranteSchema}
        >
          {({ isSubmitting, setFieldValue, errors, touched }) => {
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
                      id="nombre"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre y apellido"
                      name="nombre"
                      maxLength="70"
                    />
                    {errors.nombre && touched.nombre ? (
                      <Alerta>{errors.nombre}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="dni"
                      type="tel"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="DNI"
                      name="dni"
                      maxLength="70"
                    />
                    {errors.dni && touched.dni ? (
                      <Alerta>{errors.dni}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="email"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Email"
                      name="email"
                      maxLength="70"
                    />
                    {errors.email && touched.email ? (
                      <Alerta>{errors.email}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="telefono"
                      type="tel"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Telefono"
                      name="telefono"
                      maxLength="70"
                    />
                    {errors.telefono && touched.telefono ? (
                      <Alerta>{errors.telefono}</Alerta>
                    ) : null}
                  </div>

                  {/* <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="sede"
                      name="sede"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="" disabled>
                        Sede:
                      </option>
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div> */}

                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value={integrante ? 'Actualizar' : 'Crear Integrante'}
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
//Se elimina los default prosp, quedo desactualizado
// FormAltaIntegranteConve.defaultProps = {
//   integrante: {}
// };

export default FormAltaIntegranteConve;