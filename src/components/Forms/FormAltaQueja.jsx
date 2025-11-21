/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaQueja.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from 'react'; // (NUEVO)

import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import SelectSede from '../SelectSede';
import { useAuth } from '../../AuthContext';

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormAltaQueja = ({
  isOpen,
  onClose,
  queja,
  setSelectedQueja,
  obtenerQuejas
}) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  console.log(queja); // Agrega esto en el componente FormAltaQueja

  const { userName } = useAuth();

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  // Esquema de validación con Yup para la nueva tabla 'quejas_internas'
  const nuevoQuejaSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(3, 'El nombre es muy corto')
      .max(100, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    tipo_usuario: Yup.string()
      .oneOf(['socio', 'colaborador', 'cliente', 'cliente pilates'], 'Tipo de usuario inválido')
      .required('El Tipo de Usuario es obligatorio'),
    contacto: Yup.string().max(30, 'El contacto es muy largo').nullable(true),
    motivo: Yup.string()
      .min(10, 'El motivo es demasiado corto')
      .required('El Motivo es obligatorio'),
    sede: Yup.string().required('La Sede es obligatoria'),
    resuelto: Yup.boolean().required('El estado de resolución es obligatorio'),
    resuelto_por: Yup.string().nullable(true),
    fecha_resuelto: Yup.date().nullable(true),
    creado_desde_qr: Yup.boolean().nullable(true)
  });

  const handleSubmitQueja = async (valores) => {
    try {
      if (valores.nombre === "" || valores.motivo === "") {
        alert("Por favor, complete todos los campos obligatorios.");
      } else {
        const esClientePilates = valores.tipo_usuario === "cliente pilates";
        /* console.log(valores) */

        const baseEndpoint = esClientePilates ? "quejas-pilates" : "quejas";

        /* console.log(baseEndpoint)
        console.log(`http://localhost:8080/${baseEndpoint}`) */

        const url = queja
          ? `http://localhost:8080/${baseEndpoint}/${queja.id}` // PUT para ambos tipos
          : `http://localhost:8080/${baseEndpoint}`; // POST para ambos tipos
        const method = queja ? "PUT" : "POST";

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (method === "PUT") {
          setTextoModal("Queja actualizada correctamente.");
        } else {
          setTextoModal("Queja creada correctamente.");
        }

        if (!respuesta.ok) {
          throw new Error("Error en la solicitud: " + respuesta.status);
        }
        const data = await respuesta.json();
        console.log("Registro insertado correctamente:", data);
        setShowModal(true);
        setTimeout(() => {
          obtenerQuejas();
          setShowModal(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error al insertar el registro:", error.message);
      setErrorModal(true);
      setTimeout(() => {
        setErrorModal(false);
      }, 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedQueja(null);
    }
    onClose();
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
            fecha: queja ? queja.fecha : new Date().toISOString().slice(0, 19), // Genera la fecha actual en el formato correcto
            cargado_por: userName || '',
            nombre: queja ? queja.nombre : '',
            tipo_usuario: queja ? queja.tipo_usuario : '',
            contacto: queja ? queja.contacto : '',
            motivo: queja ? queja.motivo : '',
            resuelto: queja ? queja.resuelto : false,
            resuelto_por: queja ? queja.resuelto_por : '',
            fecha_resuelto: queja ? queja.fecha_resuelto : null,
            sede: queja ? queja.sede : '',
            creado_desde_qr: queja ? queja.creado_desde_qr : false,
            created_at: queja ? queja.created_at : null,
            updated_at: queja ? queja.updated_at : null
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitQueja(values);

            resetForm();
          }}
          validationSchema={nuevoQuejaSchema}
        >
          {({ errors, touched, setFieldValue }) => {
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
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre"
                      name="nombre"
                      maxLength="100"
                    />
                    {errors.nombre && touched.nombre ? (
                      <Alerta>{errors.nombre}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="contacto"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Contacto"
                      name="contacto"
                      maxLength="30"
                    />
                    {errors.contacto && touched.contacto ? (
                      <Alerta>{errors.contacto}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="tipo_usuario"
                      name="tipo_usuario"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        Tipo de Usuario:
                      </option>
                      <option value="socio">Socio</option>
                      <option value="colaborador">Colaborador</option>
                      <option value="cliente">Cliente</option>
                      <option value="cliente pilates">Cliente pilates</option>
                    </Field>
                    {errors.tipo_usuario && touched.tipo_usuario ? (
                      <Alerta>{errors.tipo_usuario}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      as="textarea"
                      id="motivo"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Motivo de la queja"
                      name="motivo"
                      maxLength="500"
                    />
                    {errors.motivo && touched.motivo ? (
                      <Alerta>{errors.motivo}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="select"
                      id="resuelto"
                      name="resuelto"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    >
                      <option value={0}>No resuelto</option>
                      <option value={1}>Resuelto</option>
                    </Field>
                    {errors.resuelto && touched.resuelto ? (
                      <Alerta>{errors.resuelto}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="resuelto_por"
                      type="text"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Resuelto por"
                      name="resuelto_por"
                      maxLength="100"
                    />
                    {errors.resuelto_por && touched.resuelto_por ? (
                      <Alerta>{errors.resuelto_por}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="fecha_resuelto"
                      type="datetime-local"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Fecha de resolución"
                      name="fecha_resuelto"
                    />
                    {errors.fecha_resuelto && touched.fecha_resuelto ? (
                      <Alerta>{errors.fecha_resuelto}</Alerta>
                    ) : null}
                  </div>

                  {/* Campo sede */}
                  <SelectSede
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                  />

                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value={queja ? 'Actualizar Queja  ' : 'Crear Queja'}
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
export default FormAltaQueja;
