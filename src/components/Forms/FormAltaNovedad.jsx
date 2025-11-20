/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaUser.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */

import React, { useState, useEffect, useRef } from 'react'; // (NUEVO)
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import { useAuth } from '../../AuthContext';

const FormAltaNovedad = ({
  isOpen,
  onClose,
  novedad,
  setSelectedNovedad,
  obtenerNovedades
}) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState(['monteros']);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const { userName } = useAuth();

  console.log(userName);
  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  const nuevoNovedadSchema = Yup.object().shape({
    titulo: Yup.string().required('El Titulo es obligatorio'),
    /* sede: Yup.string().required("La Sede es obligatoria"), */
    mensaje: Yup.string().required('El Mensaje es obligatorio'),
    vencimiento: Yup.date().nullable(true)
  });

  useEffect(() => {
    if (novedad) {
      // Si viene con usuarios asignados, mapear los IDs
      const ids = novedad.novedadUsers?.map((tu) => tu.user.id) || [];

      setSelectedUsers(ids);
    } else {
      setSelectedUsers([]);
      setSelectedSede(['monteros']);
    }
  }, [novedad]);

  useEffect(() => {
    if (isOpen) {
      obtenerUsers(selectedSede);
    }
  }, [isOpen, selectedSede]);

  useEffect(() => {
    setSelectedUsers([]);
    setSelectAllUsers(false);
  }, [selectedSede]);

  const obtenerUsers = async (sede) => {
    try {
      const response =
        sede === 'todas' || sede === ''
          ? await axios.get('http://localhost:8080/users')
          : await axios.get('http://localhost:8080/users', {
              params: { sede }
            });

      // Filtrar los usuarios para excluir aquellos con level = 'instructor'
      const usuariosFiltrados = response.data.filter(
        (user) => user.level !== 'instructor'
      );

      setUsers(usuariosFiltrados);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
      setUsers([]);
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleSelectAllUsers = () => {
    setSelectAllUsers(!selectAllUsers);

    if (!selectAllUsers) {
      // Selecciona todos los usuarios
      setSelectedUsers(users.map((user) => user.id));
    } else {
      // Deselecciona todos los usuarios
      setSelectedUsers([]);
    }
  };

// Función para formatear el valor de la sede para la visualización de usuario
const formatSedeValue = (selectedSede) => {
  if (!Array.isArray(selectedSede)) {
    selectedSede = [selectedSede];
  }

  const valorFormateado = selectedSede
    .map((sede) => {
      switch (sede) {
        case "SMT":
          return "T.Barrio Sur";
        case "SanMiguelBN":
          return "T.Barrio Norte";
        default:
          return sede;
      }
    })
    .join(", ");
  if (selectedSede.length === 4) {
    return "todas";
  }
  console.log(valorFormateado);
  return valorFormateado;
};

// Función para formatear el valor de la sede para el backend
const mapSedesToApiValue = (selectedSede) => {
  return selectedSede.length === 4 ? "todas" : selectedSede.join(", ");
};



  const handleSubmitNovedad = async (valores) => {
    try {
      valores.sede = mapSedesToApiValue(selectedSede);
      const data = {
        sede: valores.sede,
        titulo: valores.titulo,
        mensaje: valores.mensaje,
        vencimiento: valores.vencimiento,
        estado: valores.estado,
        userName: userName || '',
        user: selectedUsers
      };
      // Definir URL y método basados en la existencia de novedad
      const url = novedad
        ? `http://localhost:8080/novedades/${novedad.id}`
        : 'http://localhost:8080/novedades/';
      const method = novedad ? 'PUT' : 'POST';

      const respuesta = await fetch(url, {
        method: method,
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (method === 'PUT') {
        // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
        setTextoModal('Novedad actualizada correctamente.');
      } else {
        setTextoModal('Novedad creada correctamente.');
      }

      // Verificamos si la solicitud fue exitosa
      if (!respuesta.ok) {
        throw new Error('Error en la solicitud ${method}: ' + respuesta.status);
      }

      obtenerNovedades();

      const result = await respuesta.json();
      console.log('Registro insertado correctamente:', result);

      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);
      setErrorModal(true);
      setTimeout(() => setErrorModal(false), 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedNovedad(null);
    }
    onClose();
  };

  const handleSedeSelection = (sede) => {
    if (selectedSede.length === 1 && selectedSede.includes(sede)) return;
    setSelectedSede((prev) =>
      prev.includes(sede)
        ? prev.filter((item) => item !== sede)
        : [...prev, sede]
    );
  };

  return (
    <div
      className={`h-screen w-screen p-2 sm:px-0 mt-16 fixed inset-0 flex pt-10 justify-center ${
        isOpen ? "block" : "hidden"
      } bg-gray-800 bg-opacity-75 z-50`}
    >
      <div className="container-inputs">
        <Formik
          innerRef={formikRef}
          initialValues={{
            sede: selectedSede,
            titulo: novedad ? novedad.titulo : "",
            mensaje: novedad ? novedad.mensaje : "",
            vencimiento: novedad ? novedad.vencimiento : "",
            estado: 1,
            userName: userName || "",
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitNovedad(values);
            resetForm();
          }}
          validationSchema={nuevoNovedadSchema}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <div className="-mt-20 max-h-screen w-full max-w-xl overflow-y-auto bg-white rounded-xl p-5">
              <Form className="formulario w-full bg-white">
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

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mx-2">
                  {/* Botón Monteros */}
                  <button
                    type="button"
                    className={`w-full py-2 **px-2** rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes("monteros")
                      ? "bg-[#fc4b08] text-white border-none"
                      : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]"
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection("monteros")}
                  >
                    {selectedSede.includes("monteros")
                      ? "Monteros✅"
                      : "Monteros"}
                  </button>

                  {/* Botón Concepción */}
                  <button
                    type="button"
                    className={`w-full py-2 **px-2** rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes("concepcion")
                      ? "bg-[#fc4b08] text-white border-none"
                      : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]"
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection("concepcion")}
                  >
                    {selectedSede.includes("concepcion")
                      ? "Concepción✅"
                      : "Concepción"}
                  </button>

                  {/* Botón T.Barrio Sur (SMT) */}
                  <button
                    type="button"
                    className={`w-full py-2 **px-2** rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes("SMT")
                      ? "bg-[#fc4b08] text-white border-none"
                      : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]"
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection("SMT")}
                  >
                    {selectedSede.includes("SMT")
                      ? "T.Barrio Sur✅"
                      : "T.Barrio Sur"}
                  </button>

                  {/* Botón T.Barrio Norte (SanMiguelBN) */}
                  <button
                    type="button"
                    className={`w-full py-2 **px-2** rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes("SanMiguelBN")
                      ? "bg-[#fc4b08] text-white border-none"
                      : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]" 
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection("SanMiguelBN")}
                  >
                    {selectedSede.includes("SanMiguelBN")
                      ? "T.Barrio Norte✅"
                      : "T.Barrio Norte"}
                  </button>
                </div>

                <div className="mb-6 px-6 py-4 bg-white rounded-lg shadow-md">
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                    {Array.isArray(users) && users.length > 0 ? (
                      <>
                        <div className="mb-4 flex items-center">
                          <input
                            type="checkbox"
                            id="select-all-users"
                            className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                            onChange={handleSelectAllUsers}
                            checked={selectAllUsers}
                          />
                          <label
                            htmlFor="select-all-users"
                            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            Seleccionar todos los usuarios de{" "}
                            <p className="font-bold uppercase">
                              {formatSedeValue(selectedSede)}
                            </p>
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-100"
                            >
                              <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                value={user.id}
                                onChange={() => handleCheckboxChange(user.id)}
                                checked={selectedUsers.includes(user.id)}
                              />
                              <label
                                htmlFor={`user-${user.id}`}
                                className="ml-3 text- text-gray-800 cursor-pointer truncate"
                                style={{ fontSize: "0.775rem" }}
                              >
                                {user.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hay usuarios disponibles
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-3 px-4">
                  <label
                    htmlFor="vencimiento"
                    className="block font-medium left-0"
                  >
                    <span className="text-black text-base pl-1">
                      Fecha de publicación
                    </span>
                  </label>
                  <Field
                    name="vencimiento"
                    type="date"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                  />
                </div>

                <div className="mb-3 px-4">
                  <Field
                    id="titulo"
                    type="text"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    placeholder="Titulo de la tarea"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <ReactQuill
                    theme="snow"
                    value={values.mensaje}
                    onChange={(content) => setFieldValue("mensaje", content)}
                    placeholder="Ingrese el mensaje"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                  />
                  {errors.mensaje && touched.mensaje ? (
                    <Alerta>{errors.mensaje}</Alerta>
                  ) : null}
                </div>

                <div className="sticky bottom-0 bg-white py-3 px-4">
                  <input
                    type="submit"
                    value={novedad ? "Actualizar" : "Crear Novedad"}
                    className="w-full bg-orange-500 py-2 px-5 rounded-xl text-white font-bold hover:bg-[#fc4b08] focus:outline-orange-100"
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

export default FormAltaNovedad;
