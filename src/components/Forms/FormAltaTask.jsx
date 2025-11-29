/*
 * Programador: Benjamin Orellana
 * Versión: 1.1 (UI modernizada + multisede)
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import { useAuth } from '../../AuthContext';

const ALL_SEDES = ['monteros', 'Concepción', 'SMT', 'SanMiguelBN', 'Multisede'];

const FormAltaTask = ({ isOpen, onClose, task, setSelectedTask }) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState(['monteros']);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { userName } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

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

  // Cuando entra una tarea para edición
  useEffect(() => {
    if (task) {
      const ids = task.taskUsers?.map((tu) => tu.user.id) || [];
      setSelectedUsers(ids);
    } else {
      setSelectedUsers([]);
      setSelectedSede(['monteros']);
    }
  }, [task]);

  // Traemos TODOS los usuarios una sola vez cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      obtenerUsers();
    }
  }, [isOpen]);

  const obtenerUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/users'
      );

      const usuariosFiltrados = response.data.filter(
        (user) => user.level !== 'instructor'
      );

      setUsers(usuariosFiltrados);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
      setUsers([]);
    }
  };

  // Al cambiar sede, limpiamos selección y búsqueda
  useEffect(() => {
    setSelectedUsers([]);
    setSelectAllUsers(false);
    setSearchTerm('');
    if (formikRef.current) {
      formikRef.current.setFieldValue('user', []);
    }
  }, [selectedSede]);

  // Formateo de sedes para mostrar en el texto de arriba
  const formatSedeValue = (selectedSedeLocal) => {
    if (!Array.isArray(selectedSedeLocal)) {
      selectedSedeLocal = [selectedSedeLocal];
    }

    const valorFormateado = selectedSedeLocal
      .map((sede) => {
        switch (sede) {
          case 'SMT':
            return 'T.Barrio Sur';
          case 'SanMiguelBN':
            return 'T.Barrio Norte';
          case 'Multisede':
            return 'Multisede';
          default:
            return sede;
        }
      })
      .join(', ');

    if (selectedSedeLocal.length === ALL_SEDES.length) {
      return 'todas';
    }

    return valorFormateado;
  };

  // Normalizamos sedes seleccionadas
  const normalizedSelected = Array.isArray(selectedSede)
    ? selectedSede.map((s) => (s || '').toLowerCase())
    : [];

  // Filtrado final (por sede + búsqueda) — cada sede suma sus usuarios
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) => {
        const nameMatch = (u.name || '')
          .toLowerCase()
          .includes((searchTerm || '').toLowerCase());

        const userSede = (u.sede || '').toLowerCase();
        const hasSedeSelected =
          Array.isArray(selectedSede) && selectedSede.length > 0;

        if (!hasSedeSelected) {
          return nameMatch;
        }

        // Unión de sedes: si la sede del usuario está dentro de las seleccionadas
        return nameMatch && normalizedSelected.includes(userSede);
      })
    : [];

  const handleCheckboxChange = (userId, setFieldValue) => {
    setSelectedUsers((prevSelectedUsers) => {
      const alreadySelected = prevSelectedUsers.includes(userId);
      const updated = alreadySelected
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId];

      setFieldValue('user', updated);
      return updated;
    });
  };

  const handleSelectAllUsers = (filteredUsersLocal, setFieldValue) => {
    const next = !selectAllUsers;
    setSelectAllUsers(next);

    if (next) {
      const ids = filteredUsersLocal.map((u) => u.id);
      setSelectedUsers(ids);
      setFieldValue('user', ids);
    } else {
      setSelectedUsers([]);
      setFieldValue('user', []);
    }
  };

  const handleSubmitDailyTask = async (valores) => {
    try {
      console.log('Valores del form:', valores);
      console.log('IDs de usuarios:', valores.user);

      const taskData = {
        titulo: valores.titulo,
        descripcion: valores.descripcion,
        activa: valores.activa !== undefined ? valores.activa : 1
      };

      const url = valores.id
        ? `http://localhost:8080/tareasdiarias/${valores.id}`
        : 'http://localhost:8080/tareasdiarias';
      const method = valores.id ? 'PUT' : 'POST';

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

      if (method === 'PUT') {
        await fetch(
          `http://localhost:8080/user-daily-tasks/task/${taskId}`,
          { method: 'DELETE' }
        );
      }

      const asignaciones = valores.user.map((userId) => ({
        user_id: userId,
        daily_task_id: taskId
      }));

      if (asignaciones.length > 0) {
        await fetch(
          'http://localhost:8080/user-daily-tasks/bulk',
          {
            method: 'POST',
            body: JSON.stringify(asignaciones),
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      setTextoModal(
        method === 'PUT'
          ? 'Tarea diaria actualizada correctamente.'
          : 'Tarea diaria creada correctamente.'
      );
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
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

  const allSedesSelected =
    selectedSede.length === ALL_SEDES.length &&
    ALL_SEDES.every((s) => selectedSede.includes(s));

  const handleSelectAllSedes = () => {
    if (allSedesSelected) {
      setSelectedSede(['monteros']);
    } else {
      setSelectedSede(ALL_SEDES);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? 'flex' : 'hidden'
      } items-start justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6`}
    >
      <div className="container-inputs w-full flex items-start justify-center">
        <Formik
          innerRef={formikRef}
          initialValues={{
            titulo: task ? task.titulo : '',
            descripcion: task ? task.descripcion : '',
            activa: task ? task.activa : true,
            user: selectedUsers
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitDailyTask(values);
            resetForm();
          }}
          validationSchema={nuevoTaskSchema}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#fc4b08] via-orange-500 to-amber-400 text-white">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-wide font-bignoodle">
                    {task ? 'Editar tarea diaria' : 'Crear nueva tarea diaria'}
                  </h2>
                  <p className="text-xs text-orange-50/90">
                    Configurá sedes, usuarios y la descripción de la tarea.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 hover:bg:white/20 text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* SEDES */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Sedes
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Seleccioná en qué sedes aplica esta tarea diaria.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSelectAllSedes}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full border border-orange-500 text-orange-600 hover:bg-orange-50 transition"
                    >
                      {allSedesSelected
                        ? 'Quitar selección de todas'
                        : 'Marcar todas las sedes'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <button
                      type="button"
                      onClick={() => handleSedeSelection('monteros')}
                      className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items-center justify-center text-center shadow-sm ${
                        selectedSede.includes('monteros')
                          ? 'bg-[#fc4b08] text:white shadow-md shadow-orange-300'
                          : 'bg:white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('monteros')
                        ? 'Monteros ✅'
                        : 'Monteros'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSedeSelection('Concepción')}
                      className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items:center justify-center text-center shadow-sm ${
                        selectedSede.includes('Concepción')
                          ? 'bg-[#fc4b08] text:white shadow-md shadow-orange-300'
                          : 'bg:white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('Concepción')
                        ? 'Concepción ✅'
                        : 'Concepción'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSedeSelection('SMT')}
                      className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items:center justify-center text-center shadow-sm ${
                        selectedSede.includes('SMT')
                          ? 'bg-[#fc4b08] text:white shadow-md shadow-orange-300'
                          : 'bg:white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('SMT')
                        ? 'T.Barrio Sur ✅'
                        : 'T.Barrio Sur'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSedeSelection('SanMiguelBN')}
                      className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items:center justify-center text-center shadow-sm ${
                        selectedSede.includes('SanMiguelBN')
                          ? 'bg-[#fc4b08] text:white shadow-md shadow-orange-300'
                          : 'bg:white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('SanMiguelBN')
                        ? 'T.Barrio Norte ✅'
                        : 'T.Barrio Norte'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSedeSelection('Multisede')}
                      className={`w-full py-2 px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition flex items:center justify-center text-center shadow-sm ${
                        selectedSede.includes('Multisede')
                          ? 'bg-[#fc4b08] text:white shadow-md shadow-orange-300'
                          : 'bg:white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('Multisede')
                        ? 'Multisede ✅'
                        : 'Multisede'}
                    </button>
                  </div>
                </section>

                {/* USUARIOS */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Usuarios asignados a la tarea
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {Array.isArray(filteredUsers)
                          ? `${
                              filteredUsers.length
                            } usuario(s) encontrados en ${
                              formatSedeValue(selectedSede) ||
                              'la sede seleccionada'
                            }.`
                          : '—'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar usuario…"
                          className="w-48 sm:w-64 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400">
                          🔍
                        </span>
                      </div>

                      {Array.isArray(filteredUsers) &&
                        filteredUsers.length > 0 && (
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                            <input
                              type="checkbox"
                              id="select-all-users"
                              className="h-4 w-4 rounded border-zinc-300 text-[#fc4b08] focus:ring-[#fc4b08]"
                              onChange={() =>
                                handleSelectAllUsers(
                                  filteredUsers,
                                  setFieldValue
                                )
                              }
                              checked={selectAllUsers}
                            />
                            <span>Seleccionar todos los listados</span>
                          </label>
                        )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3">
                    <div className="max-h-56 md:max-h-64 overflow-y-auto pr-1 space-y-2">
                      {Array.isArray(filteredUsers) &&
                      filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {filteredUsers.map((user) => (
                            <label
                              key={user.id}
                              htmlFor={`user-${user.id}`}
                              className={`flex items-center rounded-xl border px-3 py-2 text-left cursor-pointer transition bg-white/80 hover:bg-orange-50/80 ${
                                selectedUsers.includes(user.id)
                                  ? 'border-[#fc4b08] shadow-sm'
                                  : 'border-zinc-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                id={`user-${user.id}`}
                                className="h-4 w-4 rounded border-zinc-300 text-[#fc4b08] focus:ring-[#fc4b08]"
                                value={user.id}
                                onChange={() =>
                                  handleCheckboxChange(user.id, setFieldValue)
                                }
                                checked={selectedUsers.includes(user.id)}
                              />
                              <span className="ml-3 text-[11px] sm:text-xs text-zinc-800 break-words leading-tight">
                                {user.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 text-center py-6">
                          No hay usuarios disponibles para el filtro actual.
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.user && touched.user ? (
                    <Alerta>{errors.user}</Alerta>
                  ) : null}
                </section>

                {/* TÍTULO */}
                <section className="space-y-2">
                  <label
                    htmlFor="titulo"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Título de la tarea
                  </label>
                  <Field
                    id="titulo"
                    type="text"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                    placeholder="Ej: Control de caja diaria Monteros"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </section>

                {/* DESCRIPCIÓN */}
                <section className="space-y-2">
                  <label
                    htmlFor="descripcion"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Descripción
                  </label>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={values.descripcion}
                      onChange={(content) =>
                        setFieldValue('descripcion', content)
                      }
                      placeholder="Detallá los pasos o instrucciones de la tarea para el staff…"
                      className="bg-white"
                    />
                  </div>
                  {errors.descripcion && touched.descripcion ? (
                    <Alerta>{errors.descripcion}</Alerta>
                  ) : null}
                </section>
              </div>

              {/* FOOTER */}
              <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                <input
                  type="submit"
                  value={
                    task ? 'Actualizar tarea diaria' : 'Crear tarea diaria'
                  }
                  className="w-full bg-[#fc4b08] hover:bg-orange-600 text-white font-semibold text-sm py-2.5 rounded-xl shadow-md shadow-orange-300/40 transition"
                />
              </div>
            </Form>
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
