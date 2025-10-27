/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaSede.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from "react"; // (NUEVO)

import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ModalSuccess from "./ModalSuccess";
import ModalError from "./ModalError";
import Alerta from "../Error";
import SelectSede from "../SelectSede";
import Swal from "sweetalert2";

// isOpen y onCLose son los metodos que recibe para abrir y cerrar el modal
const FormAltaSede = ({
  isOpen,
  onClose,
  Sedes,
  setSelectedSedes,
  obtenerSedess,
  SedesMaxInscriptoCiudad,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [esCiudad, setEsCiudad] = useState(false);

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState("");

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoUsersSchema = Yup.object().shape({
    nombre: Yup.string()
      .min(2, 'El nombre es muy corto')
      .max(70, 'El nombre es muy largo')
      .required('El Nombre es obligatorio'),
    cupo_maximo_pilates: Yup.string().nullable(true),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
  });

  useEffect(() => {
    if (SedesMaxInscriptoCiudad) {

      console.log("SedesMaxInscriptoCiudad en FormAltaSede:", SedesMaxInscriptoCiudad);
    }
  },[SedesMaxInscriptoCiudad])

  const handleSubmitUser = async (valores) => {
    try {
      console.log("Valores del formulario:", valores.nombre);

      // Verificamos si los campos obligatorios están vacíos
      if (valores.nombre === "") {
        await Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor, complete todos los campos obligatorios.",
        });
      } else {
        if (esCiudad === false) {
          valores.cupo_maximo_pilates = null;
        }
        if (esCiudad) {
          if (
            !valores.cupo_maximo_pilates ||
            isNaN(Number(valores.cupo_maximo_pilates)) ||
            Number(valores.cupo_maximo_pilates) <= 0
          ) {
            await Swal.fire({
              icon: "warning",
              title: "Cupo inválido",
              text: "El cupo máximo de pilates debe ser un número válido y mayor a cero.",
            });
            return;
          }
        }

        valores.es_ciudad = valores.es_ciudad === "SI" ? 1 : 0; // Convertir a booleano
        // (NUEVO)

        // Validar que el cupo máximo de pilates sea mayor o igual a la cantidad de inscriptos actuales en esa ciudad en caso que sea modificacion y ciudad
        if (Sedes && esCiudad) {
          const sedeEncontrada = SedesMaxInscriptoCiudad.find(
            (sede) =>
              sede.sede_nombre.trim().toLowerCase() ===
              valores.nombre.trim().toLowerCase()
          );
          
          // Solo validar si la sede ya existía como ciudad (tiene datos en SedesMaxInscriptoCiudad)
          if (sedeEncontrada && sedeEncontrada.max_inscriptos) {
            const cupoValido =
              Number(valores.cupo_maximo_pilates) >=
              Number(sedeEncontrada.max_inscriptos);
            if (!cupoValido) {
              await Swal.fire({
                icon: "warning",
                title: "Cupo insuficiente",
                text: `El cupo máximo de pilates debe ser mayor o igual a ${sedeEncontrada.max_inscriptos}, que es la cantidad de inscriptos actuales en la ciudad ${valores.nombre}.`,
              });
              return;
            }
          }
        }
        const url = Sedes
          ? `http://localhost:8080/sedes/${Sedes.id}`
          : "http://localhost:8080/sedes/";
        const method = Sedes ? "PUT" : "POST";

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify({ ...valores }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (method === "PUT") {
          // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal("Agrupador actualizado correctamente.");
        } else {
          setTextoModal("Agrupador creado correctamente.");
        }

        obtenerSedess();
        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error(
            "Error en la solicitud ${method}: " + respuesta.status
          );
        }
        const data = await respuesta.json();
        console.log("Registro insertado correctamente:", data);
        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Error al insertar el registro:", error.message);

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
      setSelectedSedes(null);
      obtenerSedess();
    }
    onClose();
  };


  useEffect(() => {
    if (Sedes) {
      setEsCiudad(Sedes.es_ciudad === true);
    }
  },[Sedes])

  return (
    <div
      className={`h-screen w-screen mt-16 fixed inset-0 flex pt-10 justify-center ${
        isOpen ? "block" : "hidden"
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
            nombre: Sedes ? Sedes.nombre : "",
            estado: "activo",
            es_ciudad: Sedes ? (Sedes.es_ciudad === true ? "SI" : "NO") : "NO", 
            cupo_maximo_pilates: Sedes && Sedes.cupo_maximo_pilates ? String(Sedes.cupo_maximo_pilates) : "",
            created_at: Sedes ? Sedes.created_at : null,
            updated_at: Sedes ? Sedes.updated_at : null,
          }}
          enableReinitialize
          // cuando hacemos el submit esperamos a que cargen los valores y esos valores tomados se lo pasamos a la funcion handlesubmit que es la que los espera
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitUser(values);

            resetForm();
          }}
          validationSchema={nuevoUsersSchema}
        >
          {({ errors, touched, setFieldValue, values }) => {
            const esCiudadFormulario = (e) => {
              const { value } = e.target;
              setFieldValue("es_ciudad", value);
              setEsCiudad(value === "SI");
            };
            return (
              <div className="py-0 max-h-[500px] max-w-[400px] w-[400px] overflow-y-auto bg-white rounded-xl">
                {" "}
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
                      placeholder="Nombre"
                      name="nombre"
                      maxLength="70"
                    />
                    <div className="mt-3 font-bold">¿Tiene pilates?</div>
                    <Field
                      as="select"
                      name="es_ciudad"
                      className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                      onChange={esCiudadFormulario}
                      value={values.es_ciudad}
                    >
                      <option value="NO">No</option>
                      <option value="SI">Sí</option>
                    </Field>
                    {esCiudad && (
                      <Field
                        id="cupo_maximo_pilates"
                        type="text"
                        className="mt-5 block w-full p-3  text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                        placeholder="Cupo máximo EJ: 6"
                        name="cupo_maximo_pilates"
                        maxLength="5"
                      />
                    )}
                    {errors.cupo_maximo_pilates &&
                    touched.cupo_maximo_pilates ? (
                      <Alerta>{errors.cupo_maximo_pilates}</Alerta>
                    ) : null}
                  </div>
                  <div className="mx-auto flex justify-center my-5">
                    <input
                      type="submit"
                      value={Sedes ? "Actualizar" : "Crear Agrupador"}
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

export default FormAltaSede;
