import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import ModalSuccess from "./ModalSuccess";
import ModalError from "./ModalError";
import Alerta from "../Error";

const FormAltaTask = ({ isOpen, onClose, task, setSelectedTask }) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState("");
  const formikRef = useRef(null);

  const nuevoTaskSchema = Yup.object().shape({
    titulo: Yup.string().required("El Nombre es obligatorio"),
    descripcion: Yup.string().required("La descripción es obligatoria"),
    state: Yup.boolean().required(),
    created_at: Yup.date().nullable(true),
    updated_at: Yup.date().nullable(true),
    user: Yup.array().of(Yup.number()).required("Seleccione al menos un usuario."),
  });

  useEffect(() => {
    obtenerUsers(selectedSede);
  }, [selectedSede]);

  const obtenerUsers = async (sede) => {
    try {
      const response =
        sede === "todas" || sede === ""
          ? await axios.get("http://localhost:8080/users")
          : await axios.get("http://localhost:8080/users", {
              params: { sede },
            });
      setUsers(response.data);
    } catch (error) {
      console.log("Error al obtener los usuarios:", error);
    }
  };

 const handleCheckboxChange = (userId, values, setFieldValue) => {
   const selectedUsers = (values.user || []).includes(userId)
     ? (values.user || []).filter((id) => id !== userId)
     : [...(values.user || []), userId];
   setFieldValue('user', selectedUsers);
 };
  const handleSubmitTask = async (valores) => {
    try {
      if (valores.titulo === "" || valores.descripcion === "") {
        alert("Por favor, complete todos los campos obligatorios.");
      } else {
        const url = task
          ? `http://localhost:8080/schedulertask/${task.id}`
          : "http://localhost:8080/schedulertask/";
        const method = task ? "PUT" : "POST";

        if (valores.user.length === 0) {
          alert("Seleccione al menos un usuario válido.");
          return;
        }

        const respuesta = await fetch(url, {
          method,
          body: JSON.stringify(valores),
          headers: {
            "Content-Type": "application/json",
          },
        });

        setTextoModal(method === "PUT" ? "Tarea actualizada correctamente." : "Tarea creada correctamente.");

        if (!respuesta.ok) {
          throw new Error(`Error en la solicitud ${method}: ${respuesta.status}`);
        }

        const data = await respuesta.json();
        console.log("Registro insertado correctamente:", data);

        setShowModal(true);
        setTimeout(() => {
          setShowModal(false);
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error("Error al insertar el registro:", error.message);
      setErrorModal(true);
      setTimeout(() => setErrorModal(false), 3000);
    }
  };

  const handleClose = () => {
    if (task && formikRef.current) {
      formikRef.current.resetForm();
      setSelectedTask(null);
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
            titulo: task ? task.titulo : '',
            descripcion: task ? task.descripcion : '',
            hora: task ? task.hora : '',
            state: true,
            dias: task ? task.dias : '',
            user: task ? task.user : [],
            created_at: null,
            updated_at: null
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitTask(values);
            resetForm();
          }}
          validationSchema={nuevoTaskSchema}
        >
          {({ errors, touched, values, setFieldValue }) => (
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
                    placeholder="Titulo Tarea"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <ReactQuill
                    value={values.descripcion}
                    onChange={(value) => setFieldValue('descripcion', value)}
                    placeholder="Descripcion"
                    className="bg-slate-100 rounded-xl"
                  />
                  {errors.descripcion && touched.descripcion ? (
                    <Alerta>{errors.descripcion}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <Field
                    id="hora"
                    type="time"
                    className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    placeholder="Hora"
                    name="hora"
                    maxLength="16"
                  />
                  {errors.hora && touched.hora ? (
                    <Alerta>{errors.hora}</Alerta>
                  ) : null}
                </div>

                <div className="mb-4 px-4">
                  <label className="form-label">
                    Selecciona uno o más usuarios:
                  </label>
                  {Array.isArray(users) && users.length > 0 ? (
                    users.map((user) => (
                      <div key={user.id} className="form-check">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          className="form-check-input"
                          value={user.id}
                          onChange={() =>
                            handleCheckboxChange(user.id, values, setFieldValue)
                          }
                          checked={values.user && values.user.includes(user.id)} // Verificamos que 'values.user' no sea undefined
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="form-check-label"
                        >
                          {user.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p>No users available</p>
                  )}
                  {errors.user && touched.user ? (
                    <Alerta>{errors.user}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <Field
                    id="dias"
                    type="text"
                    className="mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    placeholder="Dias"
                    name="dias"
                    maxLength="16"
                  />
                  {errors.dias && touched.dias ? (
                    <Alerta>{errors.dias}</Alerta>
                  ) : null}
                </div>

                <div className="mb-4 px-4">
                  <Field
                    as="select"
                    id="state"
                    name="state"
                    className="form-select mt-2 block w-full p-3 text-black formulario__input bg-slate-100 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                    required
                  >
                    <option value="" disabled>
                      Estado:
                    </option>
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </Field>
                  {errors.state && touched.state ? (
                    <Alerta>{errors.state}</Alerta>
                  ) : null}
                </div>
                <div className="mx-auto flex justify-center my-5">
                  <input
                    type="submit"
                    value="Guardar"
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

export default FormAltaTask;
