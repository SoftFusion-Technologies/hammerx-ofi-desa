/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.1 (UI modernizada 24 / 11 / 2025)
 *
 * Descripción:
 *  Este archivo (FormAltaNovedad.jsx) es el componente donde realizamos un formulario para
 *  la tabla users, este formulario aparece en la web del staff
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 *
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
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

const ALL_SEDES = ['monteros', 'concepcion', 'SMT', 'SanMiguelBN'];

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
  const [searchTerm, setSearchTerm] = useState(''); // NUEVO: búsqueda de usuarios

  const { userName } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

  const formikRef = useRef(null);

  const nuevoNovedadSchema = Yup.object().shape({
    titulo: Yup.string().required('El Titulo es obligatorio'),
    mensaje: Yup.string().required('El Mensaje es obligatorio'),
    vencimiento: Yup.date().nullable(true)
  });

  useEffect(() => {
    if (novedad) {
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
    setSearchTerm(''); // limpiamos búsqueda al cambiar sede
  }, [selectedSede]);

  const obtenerUsers = async (sede) => {
    try {
      const response =
        sede === 'todas' || sede === ''
          ? await axios.get('http://localhost:8080/users')
          : await axios.get('http://localhost:8080/users', {
              params: { sede }
            });

      const usuariosFiltrados = response.data.filter(
        (user) => user.level !== 'instructor'
      );

      setUsers(usuariosFiltrados);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
      setUsers([]);
    }
  };

  // Filtrado por búsqueda
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        (u.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    : [];

  const handleCheckboxChange = (userId) => {
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.includes(userId)
        ? prevSelectedUsers.filter((id) => id !== userId)
        : [...prevSelectedUsers, userId]
    );
  };

  const handleSelectAllUsers = () => {
    // ahora toma los usuarios filtrados (los que se ven en la lista)
    const next = !selectAllUsers;
    setSelectAllUsers(next);

    if (next) {
      const ids = filteredUsers.map((u) => u.id);
      setSelectedUsers(ids);
    } else {
      setSelectedUsers([]);
    }
  };

  // Formateo de sedes para mostrar
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
          default:
            return sede;
        }
      })
      .join(', ');

    if (selectedSedeLocal.length === 4) {
      return 'todas';
    }
    return valorFormateado;
  };

  const mapSedesToApiValue = (selectedSedeLocal) => {
    return selectedSedeLocal.length === 4
      ? 'todas'
      : selectedSedeLocal.join(', ');
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
        setTextoModal('Novedad actualizada correctamente.');
      } else {
        setTextoModal('Novedad creada correctamente.');
      }

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

  // NUEVO: botón para marcar todas las sedes
  const allSedesSelected =
    selectedSede.length === ALL_SEDES.length &&
    ALL_SEDES.every((s) => selectedSede.includes(s));

  const handleSelectAllSedes = () => {
    if (allSedesSelected) {
      // si ya están todas marcadas, dejamos solo Monteros
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
            sede: selectedSede,
            titulo: novedad ? novedad.titulo : '',
            mensaje: novedad ? novedad.mensaje : '',
            vencimiento: novedad ? novedad.vencimiento : '',
            estado: 1,
            userName: userName || ''
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitNovedad(values);
            resetForm();
          }}
          validationSchema={nuevoNovedadSchema}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden">
              {/* HEADER MODERNO */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#fc4b08] via-orange-500 to-amber-400 text-white">
                <div>
                  <h2 className="text-base sm:text-lg font-semibold tracking-wide font-bignoodle">
                    {novedad ? 'Editar novedad' : 'Crear nueva novedad'}
                  </h2>
                  <p className="text-xs text-orange-50/90">
                    Configurá sedes, usuarios y el mensaje a enviar.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-white/10 hover:bg-white/20 text-white text-lg leading-none"
                >
                  ×
                </button>
              </div>

              {/* CONTENIDO SCROLLEABLE */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* BLOQUE DE SEDES */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Sedes
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Podés seleccionar una o varias sedes para notificar.
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Monteros */}
                    <button
                      type="button"
                      onClick={() => handleSedeSelection('monteros')}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center text-center shadow-sm ${
                        selectedSede.includes('monteros')
                          ? 'bg-[#fc4b08] text-white shadow-md shadow-orange-300'
                          : 'bg-white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('monteros')
                        ? 'Monteros ✅'
                        : 'Monteros'}
                    </button>

                    {/* Concepción */}
                    <button
                      type="button"
                      onClick={() => handleSedeSelection('concepcion')}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center text-center shadow-sm ${
                        selectedSede.includes('concepcion')
                          ? 'bg-[#fc4b08] text-white shadow-md shadow-orange-300'
                          : 'bg-white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('concepcion')
                        ? 'Concepción ✅'
                        : 'Concepción'}
                    </button>

                    {/* T.Barrio Sur (SMT) */}
                    <button
                      type="button"
                      onClick={() => handleSedeSelection('SMT')}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center text-center shadow-sm ${
                        selectedSede.includes('SMT')
                          ? 'bg-[#fc4b08] text-white shadow-md shadow-orange-300'
                          : 'bg-white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('SMT')
                        ? 'T.Barrio Sur ✅'
                        : 'T.Barrio Sur'}
                    </button>

                    {/* T.Barrio Norte (SanMiguelBN) */}
                    <button
                      type="button"
                      onClick={() => handleSedeSelection('SanMiguelBN')}
                      className={`w-full py-2 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center text-center shadow-sm ${
                        selectedSede.includes('SanMiguelBN')
                          ? 'bg-[#fc4b08] text-white shadow-md shadow-orange-300'
                          : 'bg-white text-[#fc4b08] border border-orange-300 hover:bg-orange-50'
                      }`}
                    >
                      {selectedSede.includes('SanMiguelBN')
                        ? 'T.Barrio Norte ✅'
                        : 'T.Barrio Norte'}
                    </button>
                  </div>
                </section>

                {/* BLOQUE USUARIOS */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Usuarios a notificar
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
                      {/* INPUT DE BÚSQUEDA */}
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Buscar por nombre…"
                          className="w-48 sm:w-64 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400">
                          🔍
                        </span>
                      </div>

                      {/* CHECK SELECT ALL */}
                      {Array.isArray(filteredUsers) &&
                        filteredUsers.length > 0 && (
                          <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-700">
                            <input
                              type="checkbox"
                              id="select-all-users"
                              className="h-4 w-4 rounded border-zinc-300 text-[#fc4b08] focus:ring-[#fc4b08]"
                              onChange={handleSelectAllUsers}
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
                                onChange={() => handleCheckboxChange(user.id)}
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
                </section>

                {/* FECHA */}
                <section className="space-y-2">
                  <label
                    htmlFor="vencimiento"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Fecha de publicación
                  </label>
                  <Field
                    name="vencimiento"
                    type="date"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                  />
                </section>

                {/* TÍTULO */}
                <section className="space-y-2">
                  <label
                    htmlFor="titulo"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Título de la novedad
                  </label>
                  <Field
                    id="titulo"
                    type="text"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                    placeholder="Ej: Recordatorio de cierre de caja"
                    name="titulo"
                    maxLength="70"
                  />
                  {errors.titulo && touched.titulo ? (
                    <Alerta>{errors.titulo}</Alerta>
                  ) : null}
                </section>

                {/* MENSAJE */}
                <section className="space-y-2">
                  <label
                    htmlFor="mensaje"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Mensaje
                  </label>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={values.mensaje}
                      onChange={(content) => setFieldValue('mensaje', content)}
                      placeholder="Escribí el mensaje para el staff…"
                      className="bg-white"
                    />
                  </div>
                  {errors.mensaje && touched.mensaje ? (
                    <Alerta>{errors.mensaje}</Alerta>
                  ) : null}
                </section>
              </div>

              {/* FOOTER STICKY */}
              <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                <input
                  type="submit"
                  value={novedad ? 'Actualizar novedad' : 'Crear novedad'}
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

export default FormAltaNovedad;
