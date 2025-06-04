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

const FormAltaTask = ({ isOpen, onClose, task, setSelectedTask }) => {
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

  const nuevoTaskSchema = Yup.object().shape({
    titulo: Yup.string()
      .required('El título es obligatorio')
      .max(255, 'El título no puede exceder los 255 caracteres'),
    descripcion: Yup.string().required('La descripción es obligatoria'),
    activa: Yup.boolean().required('El estado es obligatorio'),
    user: Yup.array()
      .of(Yup.number().integer().positive())
      .min(1, 'Seleccione al menos un usuario')
      .required('Seleccione al menos un usuario')
  });

  useEffect(() => {
    if (task) {
      // Si viene con usuarios asignados, mapear los IDs
      const ids = task.taskUsers?.map((tu) => tu.user.id) || [];
      setSelectedUsers(ids);
    } else {
      setSelectedUsers([]);
    }
  }, [task]);

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
  const handleSelectAllUsers = (values, setFieldValue) => {
    const allSelected = values.user.length === users.length;
    const updated = allSelected ? [] : users.map((user) => user.id);
    setFieldValue('user', updated);
  };

  const formatSedeValue = (selectedSede) => {
    return selectedSede.length === 3 ? 'todas' : selectedSede.join(', ');
  };

  const handleSubmitDailyTask = async (valores) => {
    try {
      console.log('Valores del form:', valores);
      console.log('IDs de usuarios:', valores.user);

      // 1. Preparo el objeto para la tarea diaria
      const taskData = {
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        activa: valores.activa !== undefined ? valores.activa : 1
      };

      // 2. Defino URL y método según si existe tarea para editar o es nueva
      const url = valores.id
        ? `http://localhost:8080/tareasdiarias/${valores.id}`
        : 'http://localhost:8080/tareasdiarias';
      const method = valores.id ? 'PUT' : 'POST';

      // 3. Creo o actualizo la tarea diaria
      const response = await fetch(url, {
        method,
        body: JSON.stringify(taskData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud ${method}: ${response.status}`);
      }

      const taskResult = await response.json();
      const taskId = taskResult.id || taskResult.data?.id;

      // 4. Eliminar asignaciones previas si es edición (opcional)
      if (method === 'PUT') {
        await fetch(`http://localhost:8080/user-daily-tasks/task/${taskId}`, {
          method: 'DELETE'
        });
      }

      // 5. Crear asignaciones múltiples (bulk)
      const asignaciones = valores.user.map((userId) => ({
        user_id: userId,
        daily_task_id: taskId
      }));

      if (asignaciones.length > 0) {
        await fetch('http://localhost:8080/user-daily-tasks/bulk', {
          method: 'POST',
          body: JSON.stringify(asignaciones),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }

      // 6. Mostrar modal de éxito
      setTextoModal(
        method === 'PUT'
          ? 'Tarea diaria actualizada correctamente.'
          : 'Tarea diaria creada correctamente.'
      );
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);

      // // 7. Limpio formulario si es nueva
      // if (!valores.id) {
      //   setTitulo('');
      //   setDescripcion('');
      //   setSelectedUsers([]);
      //   setSelectAllUsers(false);
      // }

      // 8. Actualizar lista si es necesario
      // obtenerTareasDiarias();
    } catch (error) {
      console.error('Error al guardar tarea diaria:', error.message);
      setErrorModal(true);
      setTimeout(() => setErrorModal(false), 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedTask(null);
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
            activa: task ? task.activa : true, // usar activa en lugar de state
            user: selectedUsers // array de IDs
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitDailyTask(values);
            resetForm();
          }}
          validationSchema={nuevoTaskSchema}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mx-2">
                  <button
                    type="button"
                    className={`w-full py-2 px-5 rounded-xl text-white text-sm font-bold transition ${
                      selectedSede.includes('monteros')
                        ? 'bg-[#fc4b08]'
                        : 'bg-orange-500 hover:bg-[#fc4b08]'
                    } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('monteros')}
                  >
                    {selectedSede.includes('monteros')
                      ? 'Monteros✅'
                      : 'Monteros'}
                  </button>

                  <button
                    type="button"
                    className={`w-full py-2 px-5 rounded-xl text-white text-sm font-bold transition ${
                      selectedSede.includes('concepcion')
                        ? 'bg-[#fc4b08]'
                        : 'bg-orange-500 hover:bg-[#fc4b08]'
                    } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('concepcion')}
                  >
                    {selectedSede.includes('concepcion')
                      ? 'Concepción✅'
                      : 'Concepción'}
                  </button>

                  <button
                    type="button"
                    className={`w-full py-2 px-5 rounded-xl text-white text-sm font-bold transition ${
                      selectedSede.includes('SMT')
                        ? 'bg-[#fc4b08]'
                        : 'bg-orange-500 hover:bg-[#fc4b08]'
                    } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('SMT')}
                  >
                    {selectedSede.includes('SMT') ? 'SMT✅' : 'SMT'}
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
                            Seleccionar todos los usuarios de{' '}
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
                                style={{ fontSize: '0.775rem' }}
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
                  <Field
                    id="titulo"
                    type="text"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    placeholder="Título de la tarea"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </div>

                <div className="mb-3 px-4">
                  <label
                    htmlFor="descripcion"
                    className="block font-medium left-0 mb-1"
                  >
                    <span className="text-black text-base pl-1">
                      Descripción
                    </span>
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={values.descripcion}
                    onChange={(content) =>
                      setFieldValue('descripcion', content)
                    }
                    placeholder="Ingrese la descripción"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                  />
                  {errors.descripcion && touched.descripcion ? (
                    <Alerta>{errors.descripcion}</Alerta>
                  ) : null}
                </div>

                <div className="sticky bottom-0 bg-white py-3 px-4">
                  <input
                    type="submit"
                    value={task ? 'Actualizar' : 'Crear Tarea'}
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

export default FormAltaTask;
