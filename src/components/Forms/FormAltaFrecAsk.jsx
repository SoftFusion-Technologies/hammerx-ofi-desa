/*
 * Programadores: Benjamin Orellana (back) | Emir Segovia (front)
 * Fecha Cración: 22 / 05 / 2024
 * Fecha Modificacion: 05/06/2024
 * Versión: 1.1
 *
 * Descripción:
 *  Este archivo (FormAltaFrecAsk.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 * Contacto: emirvalles90@gmail.com || 3865761910
 *
 * ----------------------------------------------------------------
 *
 * Modificación : Se anexo editor de texto Quill y se elimino el limite de 70 caracteres.
 *
 */

import React, { useState, useEffect, useRef } from 'react'; // (NUEVO)
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalSuccess from "./ModalSuccess";
import ModalError from "./ModalError";
import Alerta from "../Error";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const FormAltaFrecAsk = ({ isOpen, onClose, ask }) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  // const textoModal = 'Pregunta frecuente creada correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  const [descripcion, setDescripcion] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  // (NUEVO)
  useEffect(() => {
    if (ask) {
      setDescripcion(ask.descripcion || '');
    }
  }, [ask]);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoFrecAskSchema = Yup.object().shape({
    titulo: Yup.string()
      .min(3, 'El titulo es muy corto')
      .max(70, 'El titulo es muy largo')
      .required('El titulo es obligatorio'),
    orden: Yup.string()
      .max(13, 'El Orden es muy largo')
      .required('El Orden es Obligatorio')
  });

  const handleSubmitFreAsk = async (valores) => {
    try {
      if (valores.titulo === '' || descripcion === '' || valores.orden === '') {
        alert('Por favor, complete todos los campos obligatorios.');
        return;
      } else {
        // (NUEVO)
        
              //  ? `http://localhost:8080/ask/${ask.id}`
          // : 'http://localhost:8080/ask/';
        const url = ask
          ? `https://vps-4294061-x.dattaweb.com/ask/${ask.id}`
          : 'https://vps-4294061-x.dattaweb.com/ask/';
        const method = ask ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores, descripcion }),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (method === "PUT") {
          setDescripcion(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal('Pregunta frecuente actualizada correctamente.');
        } else {
          setTextoModal('Pregunta frecuente creada correctamente.');
        }


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
      setErrorModal(true);
      setTimeout(() => {
        setErrorModal(false);
      }, 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setDescripcion(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
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
        <Formik
          innerRef={formikRef}
          initialValues={{
            titulo: ask ? ask.titulo : '',
            descripcion: ask ? ask.descripcion : '',
            orden: ask ? ask.orden : '',
            estado: ask ? ask.estado : 1
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitFreAsk(values);
            resetForm();
          }}
          validationSchema={nuevoFrecAskSchema}
        >
          {({ errors, touched }) => (
            <div className="py-0 max-h-[500px] max-w-[400px] w-[400px] overflow-y-auto bg-white rounded-xl">
              <Form className="formulario max-sm:w-[300px] bg-white">
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
                    id="titulo"
                    type="text"
                    className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    placeholder="Titulo"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <ReactQuill
                    value={descripcion}
                    onChange={setDescripcion}
                    className="mt-2 text-black formulario__input bg-slate-100 rounded-xl"
                    placeholder="Descripción"
                  />
                  {descripcion === '' && touched.descripcion ? (
                    <Alerta>La descripción es obligatoria</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <Field
                    id="orden"
                    type="orden"
                    className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    placeholder="Orden"
                    name="orden"
                    maxLength="14"
                  />
                  {errors.orden && touched.orden ? (
                    <Alerta>{errors.orden}</Alerta>
                  ) : null}
                </div>

                <div className="mb-4 px-4">
                  <Field
                    as="select"
                    id="estado"
                    name="estado"
                    className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    required
                  >
                    <option value="" disabled>
                      Estado:
                    </option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </Field>
                  {errors.estado && touched.estado ? (
                    <Alerta>{errors.estado}</Alerta>
                  ) : null}
                </div>

                <div className="mx-auto flex justify-center my-5">
                  <input
                    type="submit"
                    value={ask ? 'Actualizar' : 'Guardar'}
                    className="bg-orange-500 py-2 px-5 rounded-xl text-white font-bold hover:cursor-pointer hover:bg-[#fc4b08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-100"
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
      <ModalError isVisible={errorModal} onClose={() => setErrorModal(false)} />
    </div>
  );
};
//Se elimina los default prosp, quedo desactualizado
// FormAltaFrecAsk.defaultProps = {
//   frecask: {},
// };

export default FormAltaFrecAsk;
