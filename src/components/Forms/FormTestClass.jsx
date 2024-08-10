/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormTestClass.jsx) es el componente donde realizamos un formulario para
 *  la tabla TestClass, este formulario aparece en la web oficial, para que los usuarios
 *  que navegan por la web puedan ver este formulario
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState } from "react";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalSuccess from "./ModalSuccess";
import ModalError from "./ModalError";
import Alerta from "../Error";
import "../../styles/Forms/FormPostulante.css";

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormTestClass = ({ isOpen, onClose }) => {

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const textoModal = "Hola, hemos recibimos tu información, ya puedes pasar por nuestras Sedes, a probar tu clase!"
  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoTestClassSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "El nombre es muy corto")
      .max(70, "El nombre es muy largo")
      .required("El Nombre es obligatorio"),
    last_name: Yup.string()
      .min(3, "El apellido es muy corto")
      .max(70, "El apellido es muy largo")
      .required("El Apellido es Obligatorio"),
    dni: Yup.string()
      .min(6, "El DNI es muy corto")
      .max(13, "El DNI es muy largo")
      .required("El DNI es Obligatorio"),
    celular: Yup.string()
      .min(8, "El número de celular es muy corto")
      .max(15, "El número de celular es muy largo")
      .required("El Celular es obligatorio"),
    sede: Yup.string()
      .required("La Sede es obligatoria"),
    objetivo: Yup.string()
      .required("El Objetivo es obligatorio"),
    user: Yup.string().max(255, "Usuario demasiado largo"),
    observaciones: Yup.string().max(255, "Observaciones demasiado largas"),
    state: Yup.boolean().required(),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
  })

  const handleSubmitTestClass = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (
        valores.last_name === "" ||
        valores.dni === "" ||
        valores.celular === ""
      ) {
        alert("Por favor, complete todos los campos obligatorios.");
      } else {
        // Realizamos la solicitud POST al servidor
        const respuesta = await fetch("http://localhost:8080/testclass/", {
          method: "POST",
          body: JSON.stringify(valores),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error("Error en la solicitud POST: " + respuesta.status)
        }

        // Convertimos la respuesta a JSON
        const data = await respuesta.json();
        console.log("Registro insertado correctamente:", data)

        // Mostrar la ventana modal de éxito
        setShowModal(true);

        // Ocultar la ventana modal de éxito después de 3 segundos
        setTimeout(() => {
          setShowModal(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error al insertar el registro:", error.message);

      // Mostrar la ventana modal de error
      setErrorModal(true);

      // Ocultar la ventana modal de éxito después de 3 segundos
      setTimeout(() => {
        setErrorModal(false);
      }, 3000);
    }
  };

  return (
    <div className={`h-screen w-screen mt-16 fixed inset-0 flex pt-10 justify-center ${isOpen ? 'block' : 'hidden'} bg-gray-800 bg-opacity-75 z-50`}>
      <div className={`container-inputs`}>
        {/*
                Formik es una biblioteca de formularios React de terceros.
                Proporciona programación y validación de formularios básicos.
                Se basa en componentes controlados
                y reduce en gran medida el tiempo de programación de formularios.
            */}
        <Formik
          // valores con los cuales el formulario inicia y este objeto tambien lo utilizo para cargar los datos en la API
          initialValues={{
            name: "",
            last_name: "",
            dni: "",
            celular: "",
            sede: "",
            objetivo: "",
            state: false,
            created_at: null,
            updated_at: null,
          }}
          enableReinitialize={!isOpen}
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitTestClass(values);

            resetForm();
          }}
          validationSchema={nuevoTestClassSchema}
        >
          {({ errors, touched }) => {
            return (
              <div className="py-0 max-h-[500px] overflow-y-auto bg-white rounded-xl">
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
                      onClick={onClose}
                    >
                      x
                    </div>
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="name"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Nombre/s"
                      name="name"
                      maxLength="70"
                    />
                    {errors.name && touched.name ? (
                      <Alerta>{errors.name}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="last_name"
                      type="text"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Apellido/s"
                      name="last_name"
                      maxLength="70"
                    />
                    {errors.last_name && touched.last_name ? (
                      <Alerta>{errors.last_name}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      id="dni"
                      type="dni"
                      className="mt-2 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="DNI"
                      name="dni"
                      maxLength="14"
                    />
                    {errors.dni && touched.dni ? (
                      <Alerta>{errors.dni}</Alerta>
                    ) : null}
                  </div>
                  <div className="mb-3 px-4">
                    <Field
                      id="celular"
                      type="tel"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Número de celular"
                      name="celular"
                      maxLength="16"
                    />
                    {errors.celular && touched.celular ? (
                      <Alerta>{errors.celular}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="sede"
                      name="sede"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        ¿En qué HAMMER querés entrenar?
                      </option>
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-3 px-4">
                    <Field
                      as="select"
                      id="objetivo"
                      name="objetivo"
                      className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      required
                    >
                      <option value="" disabled>
                        Selecciona tu objetivo
                      </option>
                      <option value="Quiero ganar masa muscular">
                        Quiero ganar masa muscular
                      </option>
                      <option value="Quiero bajar la panza y marcar el abdomen">
                        Quiero bajar la panza y marcar el abdomen
                      </option>
                      <option value="Quiero bajar de peso y tonificar">
                        Quiero bajar de peso y tonificar
                      </option>
                      <option value="Quiero combinar con mi deporte">
                        Quiero combinar con mi deporte
                      </option>
                      <option value="Quiero ganar fuerza">
                        Quiero ganar fuerza
                      </option>
                      <option value="Quiero bajar el estrés">
                        Quiero bajar el estrés
                      </option>
                      <option value="Me aburro fácil">Me aburro fácil</option>
                      <option value="Quiero entrenar sin impacto">
                        Quiero entrenar sin impacto
                      </option>
                      <option value="Quiero quemar calorías">
                        Quiero quemar calorías
                      </option>
                      <option value="Quiero una clase para mi niño">
                        Quiero una clase para mi niño
                      </option>
                      <option value="Otros">Otros</option>
                    </Field>
                    {errors.objetivo && touched.objetivo ? (
                      <Alerta>{errors.objetivo}</Alerta>
                    ) : null}
                  </div>

                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value="PROGRAMAR"
                      className="bg-orange-500 py-2 px-5 rounded-xl text-white  font-bold hover:cursor-pointer hover:bg-[#fc4b08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-100"
                      id="click2"
                    />
                  </div>
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>
      <ModalSuccess textoModal={textoModal} isVisible={showModal} onClose={() => setShowModal(false)} />
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>

  );
};

//Se elimina los default prosp, quedo desactualizado
// FormTestClass.defaultProps = {
//   testclass: {},
// };
// defaultProps es una propiedad del componente React que le permite establecer valores predeterminados para el argumento props.
// en este caso a nuestro objeto de cliente le asignamos por defecto que este vacio
export default FormTestClass;
