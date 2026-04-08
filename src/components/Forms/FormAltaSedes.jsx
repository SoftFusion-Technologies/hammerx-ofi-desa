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
  const [esCiudad, setEsCiudad] = useState(false)

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
    latitud: Yup.number()
      .transform((valor, valorOriginal) => (valorOriginal === "" ? null : valor))
      .nullable(true)
      .min(-90, 'La latitud debe estar entre -90 y 90')
      .max(90, 'La latitud debe estar entre -90 y 90')
      .when(['longitud', 'radio_permitido_metros'], {
        is: (longitud, radio_permitido_metros) => 
          (longitud !== null && longitud !== undefined && longitud !== "") || 
          (radio_permitido_metros !== null && radio_permitido_metros !== undefined && radio_permitido_metros !== ""),
        then: (schema) => schema.required('Si completas un dato GPS, la latitud es obligatoria'),
      }),
    longitud: Yup.number()
      .transform((valor, valorOriginal) => (valorOriginal === "" ? null : valor))
      .nullable(true)
      .min(-180, 'La longitud debe estar entre -180 y 180')
      .max(180, 'La longitud debe estar entre -180 y 180')
      .when(['latitud', 'radio_permitido_metros'], {
        is: (latitud, radio_permitido_metros) => 
          (latitud !== null && latitud !== undefined && latitud !== "") || 
          (radio_permitido_metros !== null && radio_permitido_metros !== undefined && radio_permitido_metros !== ""),
        then: (schema) => schema.required('Si completas un dato GPS, la longitud es obligatoria'),
      }),
    radio_permitido_metros: Yup.number()
      .transform((valor, valorOriginal) => (valorOriginal === "" ? null : valor))
      .nullable(true)
      .positive('El radio debe ser un número positivo')
      .moreThan(0, 'El radio debe ser mayor a 0')
      .when(['latitud', 'longitud'], {
        is: (latitud, longitud) => 
          (latitud !== null && latitud !== undefined && latitud !== "") || 
          (longitud !== null && longitud !== undefined && longitud !== ""),
        then: (schema) => schema.required('Si completas un dato GPS, el radio es obligatorio'),
      }),
    cupo_maximo_pilates: Yup.string().nullable(true),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
  }, [['latitud', 'longitud'], ['latitud', 'radio_permitido_metros'], ['longitud', 'radio_permitido_metros']]);

  const limpiarNumeroOpcional = (valor) => {
    if (valor === "" || valor === null || valor === undefined) {
      return undefined;
    }

    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
  };

  const handleSubmitUser = async (valores) => {
    try {
      /* console.log("Valores del formulario:", valores.nombre); */

      // Verificamos si los campos obligatorios están vacíos
      if (valores.nombre === "") {
        await Swal.fire({
          icon: "warning",
          title: "Campos incompletos",
          text: "Por favor, complete todos los campos obligatorios.",
        });
      } else {
        const payload = {
          ...valores,
          latitud: limpiarNumeroOpcional(
          String(valores.latitud).trim() === "" ? null : valores.latitud
        ),
        longitud: limpiarNumeroOpcional(
          String(valores.longitud).trim() === "" ? null : valores.longitud
        ),
        radio_permitido_metros: limpiarNumeroOpcional(
          String(valores.radio_permitido_metros).trim() === "" ? null : valores.radio_permitido_metros
        ),
        };

        Object.keys(payload).forEach((key) => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        if (esCiudad === false) {
          payload.cupo_maximo_pilates = null;
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

        payload.es_ciudad = payload.es_ciudad === "SI" ? 1 : 0; // Convertir a booleano
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
          body: JSON.stringify(payload),
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
        /* console.log("Registro insertado correctamente:", data); */
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
      className={`fixed inset-0 z-50 overflow-y-auto bg-slate-950/65 px-3 py-4 backdrop-blur-sm sm:px-6 sm:py-8 ${
        isOpen ? "flex items-start justify-center sm:items-center" : "hidden"
      }`}
    >
      <div className="w-full max-w-5xl">
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
            latitud: Sedes && Sedes.latitud != null ? String(Sedes.latitud) : "",
            longitud:
              Sedes && Sedes.longitud != null ? String(Sedes.longitud) : "",
            radio_permitido_metros:
              Sedes && Sedes.radio_permitido_metros != null
                ? String(Sedes.radio_permitido_metros)
                : "",
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

            /* resetForm(); */
          }}
          validationSchema={nuevoUsersSchema}
        >
          {({ errors, touched, setFieldValue, values }) => {
            const inputClassName =
              "mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100";
            const sectionClassName =
              "rounded-[24px] border border-slate-200 bg-slate-50/85 p-4 sm:p-5";
            const labelClassName =
              "text-sm font-semibold tracking-wide text-slate-700";

            const esCiudadFormulario = (e) => {
              const { value } = e.target;
              setFieldValue("es_ciudad", value);
              setEsCiudad(value === "SI");
            };

            return (
              <Form className="overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(15,23,42,0.30)] font-messina">
                <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 px-4 py-5 text-white sm:px-6 sm:py-6 lg:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl font-bignoodle">
                        {Sedes?.id ? "Editar sede" : "Nueva sede"}
                      </h2>
                    </div>

                    <button
                      type="button"
                      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-semibold text-white transition hover:bg-white/20"
                      onClick={handleClose}
                      aria-label="Cerrar modal"
                    >
                      x
                    </button>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-210px)] overflow-y-auto p-1">
                  <div className="grid gap-1">
                    <section className={sectionClassName}>
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Datos generales
                          </h3>
                          <p className="text-sm text-slate-500">
                            Completá la información principal de la sede y su ubicación si aplica.
                          </p>
                        </div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm">
                          Nombre obligatorio
                        </span>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-3">
                        <div className="lg:col-span-3">
                          <label htmlFor="nombre" className={labelClassName}>
                            Nombre
                          </label>
                          <Field
                            id="nombre"
                            type="text"
                            className={inputClassName}
                            placeholder="EJ: Concepción"
                            name="nombre"
                            maxLength="70"
                          />
                          {errors.nombre && touched.nombre && <Alerta>{errors.nombre}</Alerta>}
                        </div>

                        <div>
                          <label htmlFor="latitud" className={labelClassName}>
                            Latitud
                          </label>
                          <Field
                            id="latitud"
                            type="number"
                            step="0.0000001"
                            className={inputClassName}
                            placeholder="Ej: -27.3512345"
                            name="latitud"
                          />
                          {errors.latitud && touched.latitud && <Alerta>{errors.latitud}</Alerta>}
                        </div>

                        <div>
                          <label htmlFor="longitud" className={labelClassName}>
                            Longitud
                          </label>
                          <Field
                            id="longitud"
                            type="number"
                            step="0.0000001"
                            className={inputClassName}
                            placeholder="Ej: -65.5923456"
                            name="longitud"
                          />
                          {errors.longitud && touched.longitud && <Alerta>{errors.longitud}</Alerta>}
                        </div>

                        <div>
                          <label
                            htmlFor="radio_permitido_metros"
                            className={labelClassName}
                          >
                            Radio permitido
                          </label>
                          <Field
                            id="radio_permitido_metros"
                            type="number"
                            step="1"
                            className={inputClassName}
                            placeholder="Ej: 50"
                            name="radio_permitido_metros"
                          />
                          {errors.radio_permitido_metros && touched.radio_permitido_metros && <Alerta>{errors.radio_permitido_metros}</Alerta>}
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-slate-500 sm:text-sm">
                        Latitud, longitud y radio permitido son opcionales.
                      </p>
                    </section>

                    <section className="rounded-[24px] border border-orange-100 bg-orange-50/70 p-4 sm:p-5">
                      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Configuración de pilates
                          </h3>
                          <p className="text-sm text-slate-500">
                            Defí si esta sede trabaja con pilates y su cupo.
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div>
                          <label htmlFor="es_ciudad" className={labelClassName}>
                            ¿Tiene pilates?
                          </label>
                          <Field
                            as="select"
                            id="es_ciudad"
                            name="es_ciudad"
                            className={inputClassName}
                            onChange={esCiudadFormulario}
                            value={values.es_ciudad}
                          >
                            <option value="NO">No</option>
                            <option value="SI">Sí</option>
                          </Field>
                        </div>

                        {esCiudad && (
                          <div>
                            <label
                              htmlFor="cupo_maximo_pilates"
                              className={labelClassName}
                            >
                              Cupo máximo
                            </label>
                            <Field
                              id="cupo_maximo_pilates"
                              type="text"
                              className={inputClassName}
                              placeholder="Cupo máximo EJ: 6"
                              name="cupo_maximo_pilates"
                              maxLength="5"
                            />
                          </div>
                        )}
                      </div>

                      {errors.cupo_maximo_pilates &&
                      touched.cupo_maximo_pilates ? (
                        <div className="mt-4">
                          <Alerta>{errors.cupo_maximo_pilates}</Alerta>
                        </div>
                      ) : null}
                    </section>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      className="w-full rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#fc4b08] sm:w-auto"
                    >
                      {Sedes?.id ? "Actualizar" : "Crear Agrupador"}
                    </button>
                  </div>
                </div>
              </Form>
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