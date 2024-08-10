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

import React, { useState } from "react";

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalSuccess from "./ModalSuccess";
import ModalError from "./ModalError";
import Alerta from "../Error";

import "../../styles/Forms/FormPostulante.css";

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormPostulante = ({ isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false)
  const [errorModal, setErrorModal] = useState(false)

  const textoModal = "Gracias por querer ser parte del equipo de Hammer, pronto nos pondremos en contacto con usted."
  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoPostulanteSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "El nombre es muy corto")
      .max(120, "El nombre es muy largo")
      .required("El Nombre es obligatorio"),
    email: Yup.string()
      .email("Email no válido")
      .required("El Email es obligatorio"),
    celular: Yup.string()
      .min(6, "El número es muy corto")
      .max(15, "Número demasiado largo")
      .required("El Celular es obligatorio"),
    edad: Yup.string().required("La Edad es obligatoria"),
    puesto: Yup.string()
      .required("El Puesto es obligatorio"),
    sede: Yup.string()
      .required("La Sede es obligatoria"),
    redes: Yup.string().max(100, "Redes sociales demasiado largas"),
    state: Yup.boolean().required(),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
    sexo: Yup.string()
      .required("El sexo es obligatorio"),
  });

  const handleSubmitPostu = async (valores) => {
    try {
      // Verificar si los campos obligatorios están vacíos
      if (
        valores.email === "" ||
        valores.celular === "" ||
        valores.edad === "" ||
        valores.puesto === "" ||
        valores.redes === ""
      ) {
        alert("Por favor, complete todos los campos obligatorios.");
      } else {
        // Realizar la solicitud POST al servidor
        const respuesta = await fetch("http://localhost:8080/postulantes/", {
          method: "POST",
          body: JSON.stringify(valores),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Verificar si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error("Error en la solicitud POST: " + respuesta.status);
        }

        // Convertir la respuesta a JSON
        const data = await respuesta.json();
        console.log("Registro insertado correctamente:", data);

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
      <div className="container-inputs">
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
            email: "",
            celular: "",
            edad: "",
            puesto: "",
            sede: "",
            info: "",
            redes: "",
            observaciones: "",
            valoracion: null,
            state: false,
            created_at: null,
            updated_at: null,
            sexo: "",
          }}
          enableReinitialize={!isOpen}
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitPostu(values);

            resetForm();
          }}
          validationSchema={nuevoPostulanteSchema}
        >
          {({ errors, touched }) => {
            return (
              <div className="py-0 max-h-[500px] overflow-y-auto bg-white rounded-xl">
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
                      onClick={onClose}
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
                      <option value="Monteros">Monteros</option>
                      <option value="Concepción">Concepción</option>
                    </Field>
                    {errors.sede && touched.sede ? (
                      <Alerta>{errors.sede}</Alerta>
                    ) : null}
                  </div>

                  <div className="mb-4 px-4">
                    <Field
                      as="textarea"
                      id="info"
                      type="text"
                      className="resize-none mt-2 block w-full p-3 h-40 text-black text-md bg-slate-100  rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      placeholder="Contanos un poco sobre vos. (Max. 100 caracteres.) "
                      name="info"
                      maxLength="301"
                    />
                    {errors.info && touched.info ? (
                      <Alerta>{errors.info}</Alerta>
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
                  {/* input para el checkBox */}

                  {/* <label className="labelCheckbox">
                <input
                  type="checkbox"
                  id="chekboxInput"
                  // onChange={(e) => setCheckbox(!checkbox)}
                />
                <span
                // className={checkbox === true ? 'chekSpan' : 'chekSpanFalse'}
                ></span>
              </label> */}

                  {/* {checkbox === true ? <p>Gracias por confirmar!😌</p> : <p>CONFIRMAR😜</p>} */}

                  {/* REALIZAR MODAL */}
                  {/* {modal === true ? <ModalEnviado
                              modal={modal}
                              setModal={setModal}
                          /> : ""} */}
                </Form>
              </div>
            );
          }}
        </Formik>
      </div>
      <ModalSuccess textoModal={ textoModal}  isVisible={showModal} onClose={() => setShowModal(false)} />
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
