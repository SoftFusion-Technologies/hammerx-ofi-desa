/*
 * Programadores: Benjamin Orellana y Baltazar Almiron
 * Fecha Cración: 04 / 11 / 2024
 * Versión: 1.0
 *
 *Descripción:
 *Este archivo (FormAltaAlumno.jsx) es el componente donde realizamos un formulario para
 *la tabla alumnos, este formulario aparece en la web de la planilla del entrenador.
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
import Alerta from '../Error';

import '../../styles/Forms/FormPostulante.css';

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormAltaAlumno = ({ isOpen, onClose, email1, email2, user1, user2, user, setSelectedUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);
  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoAlumnoSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(3, 'El nombre es muy corto')
      .max(20, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    celular: Yup.string()
      .min(3, 'El número es muy corto')
      .max(15, 'Número demasiado largo')
  });

  const handleSubmitAlumno = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (valores.nombre === '' || valores.celular === '') {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        // (NUEVO)
        const url = user
          ? `http://localhost:8080/alumnos/${user.id}`
          : 'http://localhost:8080/alumnos/';
        const method = user ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (method === 'PUT') {
          // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal('Usuario actualizado correctamente.');
        } else {
          setTextoModal('Usuario creado correctamente.');
        }

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error(
            'Error en la solicitud ${method}: ' + respuesta.status
          );
        }



        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error(
            `Error en la solicitud ${method}: ` + respuesta.status
          );
        }
        const data = await respuesta.json();
        console.log('Registro insertado correctamente:', data);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

      // Mostrar la ventana modal de error
      setErrorModal(true);

      // Ocultar la ventana modal de éxito después de 3 segundos
      setTimeout(() => {
        setErrorModal(false);
      }, 1000);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
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
        {/*
                Formik es una biblioteca de formularios React de terceros.
                Proporciona programación y validación de formularios básicos.
                Se basa en componentes controlados
                y reduce en gran medida el tiempo de programación de formularios.
            */}
        <Formik
          innerRef={formikRef}
          // valores con los cuales el formulario inicia y este objeto tambien lo utilizo para cargar los datos en la API
          initialValues={{
            nombre: '',
            prospecto: 'nuevo',
            c: '',
            email: email2 || email1,
            celular: '',
            punto_d: '',
            motivo: '',
            user_id: user2 || user1
          }}
          enableReinitialize={!isOpen}
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitAlumno(values);

            resetForm();
          }}
          validationSchema={nuevoAlumnoSchema}
        >
          {({ errors, touched }) => {
            return (
              <div className="py-0 max-h-[900px] overflow-y-auto bg-white rounded-xl">
                {' '}
                {/* Cuando se haga el modal, sacarle el padding o ponerle uno de un solo digito */}
                <Form className="formulario max-sm:w-[300px]">
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
                  <div className="mb-4 px-4">
                    <Field
                      id="nombre"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre/s y Apellido/s"
                      name="nombre"
                      maxLength="31"
                    />
                    {errors.nombre && touched.nombre ? (
                      <Alerta>{errors.nombre}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="celular"
                      type="tel"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Número de celular"
                      name="celular"
                      maxLength="14"
                    />
                    {errors.celular && touched.celular ? (
                      <Alerta>{errors.celular}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="punto_d"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Punto D"
                      name="punto_d"
                      maxLength="14"
                    />
                    {errors.punto_d && touched.punto_d ? (
                      <Alerta>{errors.punto_d}</Alerta>
                    ) : null}
                  </div>

                  {/* Campo para `prospecto` */}
                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="prospecto"
                      name="prospecto"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value="nuevo">Nuevo</option>
                      <option value="prospecto">Prospecto</option>
                      <option value="socio">Socio</option>
                    </Field>
                    {errors.prospecto && touched.prospecto ? (
                      <Alerta>{errors.prospecto}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="motivo"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Observaciones"
                      name="motivo"
                      maxLength="50"
                    />
                    {errors.motivo && touched.motivo ? (
                      <Alerta>{errors.motivo}</Alerta>
                    ) : null}
                  </div>
                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value="ENVIAR"
                      className="bg-orange-500 py-2 px-5 rounded-xl text-white  font-bold hover:cursor-pointer hover:bg-[#fc4b08] "
                      id="click2"
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
// FormAltaAlumno.defaultProps = {
//   postulante: {},
// };
// defaultProps es una propiedad del componente React que le permite establecer valores predeterminados para el argumento props.
// en este caso a nuestro objeto de cliente le asignamos por defecto que este vacio
export default FormAltaAlumno;
