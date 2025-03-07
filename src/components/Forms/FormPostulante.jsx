/*
 * Programadores: Benjamin Orellana y Lucas Albornoz
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormPostulante.jsx) es el componente donde realizamos un formulario para
 *  la tabla Postulantes, este formulario aparece en la web oficial, para que los usuarios
 *  que navegan por la web puedan ver este formulario
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
const FormPostulante = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formikRef = useRef(null);

  const textoModal =
    'Gracias por querer ser parte del equipo de Hammer, pronto nos pondremos en contacto con usted.';
  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoPostulanteSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'El nombre es muy corto')
      .max(120, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    email: Yup.string()
      .email('Email no válido')
      .required('El Email es obligatorio'),
    celular: Yup.string()
      .min(6, 'El número es muy corto')
      .max(15, 'Número demasiado largo')
      .required('El Celular es obligatorio'),
    edad: Yup.string().required('La Edad es obligatoria'),
    puesto: Yup.string().required('El Puesto es obligatorio'),
    sede: Yup.string().required('La Sede es obligatoria'),
    info: Yup.string().required('La info es obligatoria'),
    redes: Yup.string()
      .min(3, 'Redes es muy corto')
      .max(120, 'Redes es muy largo')
      .required('Redes es obligatorio'),
    estudios: Yup.string()
      .min(3, 'El campo Estudios es muy corto')
      .max(120, 'El campo Estudios es muy largo')
      .required('El campo Estudios es obligatorio'),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
    sexo: Yup.string().required('El sexo es obligatorio')
  });

  const handleSubmitPostu = async (valores, { setFieldError }) => {
    if (isSubmitting) return; // Evita múltiples envíos

    setIsSubmitting(true);

    try {
      // Lista de campos obligatorios
      const camposRequeridos = [
        'name',
        'email',
        'celular',
        'edad',
        'puesto',
        'sede',
        'sexo',
        'estudios'
      ];

      // Validar campos vacíos y marcar errores
      const tieneErrores = camposRequeridos.some((campo) => {
        if (!valores[campo]) {
          setFieldError(campo, `El campo ${campo} es obligatorio`);
          return true;
        }
        return false;
      });

      if (tieneErrores) {
        setIsSubmitting(false);
        alert('Complete todos los campos antes de enviar.');
        return;
      }

      // Crear FormData con los valores del formulario
      const formData = new FormData();
      camposRequeridos.forEach((campo) =>
        formData.append(campo, valores[campo])
      );
      formData.append('info', valores.info || '');
      formData.append('redes', valores.redes || '');
      formData.append('observaciones', valores.observaciones || '');
      formData.append('valoracion', valores.valoracion || '');
      formData.append('cv', valores.cv);

      // Enviar solicitud POST
      const respuesta = await fetch('http://localhost:8080/postulantes_v2', {
        method: 'POST',
        body: formData
      });

      if (!respuesta.ok) {
        throw new Error('Error en la solicitud POST: ' + respuesta.status);
      }

      await respuesta.json();
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);
      // setErrorModal(true);
      // setTimeout(() => setErrorModal(false), 3000);
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } finally {
      setIsSubmitting(false);
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
      className={`h-screen w-screen mt-10 fixed inset-0 flex pt-10 justify-center ${
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
            name: '',
            email: '',
            celular: '',
            edad: '',
            puesto: '',
            sede: '',
            info: '',
            redes: '',
            observaciones: 'Sin Observación',
            valoracion: 0,
            state: false,
            created_at: null,
            updated_at: null,
            sexo: '',
            estudios: '', // 🔹 Nuevo campo
            cv_url: null
          }}
          enableReinitialize={!isOpen}
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm, setFieldError }) => {
            await handleSubmitPostu(values, { setFieldError });

            resetForm();
          }}
          validationSchema={nuevoPostulanteSchema}
        >
          {({ setFieldValue, errors, touched }) => {
            return (
              <div className="-mt-10 py-0 max-h-[800px] overflow-y-auto bg-white rounded-xl">
                {' '}
                {/* Cuando se haga el modal, sacarle el padding o ponerle uno de un solo digito */}
                <Form className="formulario max-sm:w-[400px]">
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
                      id="name"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre/s y Apellido/s"
                      name="name"
                      maxLength="31"
                    />
                    {errors.name && touched.name ? (
                      <Alerta>{errors.name}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="email"
                      type="email"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Email"
                      name="email"
                    />
                    {errors.email && touched.email ? (
                      <Alerta>{errors.email}</Alerta>
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
                      id="edad"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Edad"
                      name="edad"
                      maxLength="14"
                    />
                    {errors.edad && touched.edad ? (
                      <Alerta>{errors.edad}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="sexo"
                      name="sexo"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        Sexo:
                      </option>
                      <option value="masculino">Masculino</option>
                      <option value="femenino">Femenino</option>
                      <option value="prefieronodecirlo">
                        Prefiero no decirlo
                      </option>
                    </Field>
                    {errors.sexo && touched.sexo ? (
                      <Alerta>{errors.sexo}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="redes"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Instagram"
                      name="redes"
                      maxLength="50"
                    />
                    {errors.redes && touched.redes ? (
                      <Alerta>{errors.redes}</Alerta>
                    ) : null}
                  </div>
                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="puesto"
                      name="puesto"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        Quiero trabajar de:
                      </option>
                      <option value="recepcionista">Recepcionista</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="instructormusculacion">
                        Instructor de musculación
                      </option>
                      <option value="coachclasesgrupales">
                        Coach de clases grupales
                      </option>
                      <option value="limpieza">Limpieza</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="marketing">Marketing</option>
                      <option value="otro">Otro</option>
                    </Field>
                    {errors.puesto && touched.puesto ? (
                      <Alerta>{errors.puesto}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="sede"
                      name="sede"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        Sede:
                      </option>
                      <option value="SanMiguel">SMT - BARRIO SUR</option>
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      id="estudios"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Estudios/Capacitaciones"
                      name="estudios"
                      maxLength="14"
                    />
                    {errors.estudios && touched.estudios ? (
                      <Alerta>{errors.estudios}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <label className="text-gray-600 text-sm block mb-2">
                      ADJUNTA TU CV (PDF, JPG)
                    </label>
                    <input
                      type="file"
                      name="cv" // Esto debe coincidir con lo que Multer espera en el backend
                      onChange={(e) => setFieldValue('cv', e.target.files[0])}
                      accept=".pdf,.jpg,.jpeg" // Esto limita los tipos de archivo que se pueden seleccionar
                    />
                    {errors.cv_url && touched.cv_url && (
                      <Alerta>{errors.cv_url}</Alerta>
                    )}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="textarea"
                      id="info"
                      type="text"
                      className="resize-none mt-2 block w-full p-3 h-30 text-black text-md bg-slate-100  rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Contanos un poco sobre vos. (Max. 100 caracteres.) "
                      name="info"
                      maxLength="301"
                    />
                    {errors.info && touched.info ? (
                      <Alerta>{errors.info}</Alerta>
                    ) : null}
                  </div>
                  <button
                    type="submit"
                    className={`mt-2 block w-full p-3 text-white ${
                      isSubmitting ? 'bg-gray-400' : 'bg-green-500'
                    } rounded-xl`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar'}
                  </button>
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
// FormPostulante.defaultProps = {
//   postulante: {},
// };
// defaultProps es una propiedad del componente React que le permite establecer valores predeterminados para el argumento props.
// en este caso a nuestro objeto de cliente le asignamos por defecto que este vacio
export default FormPostulante;
