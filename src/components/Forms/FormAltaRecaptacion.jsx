/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.1 (UI modernizada 24 / 11 / 2025)
 *
 * Descripción:
 *  Este archivo (FormAltaRecaptacion.jsx) es el formulario donde cargamos registros
 *  de recaptación de clientes, asociando un usuario responsable y datos del contacto.
 *
 * Tema: Configuración del Formulario
 * Capa: Frontend
 */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import 'react-quill/dist/quill.snow.css';
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import { useAuth } from '../../AuthContext';

const tiposContacto = [
  'Socios que no asisten',
  'Inactivo 10 dias',
  'Inactivo 30 dias',
  'Inactivo 60 dias',
  'Prospectos inc. Socioplus',
  'Prosp inc Entrenadores',
  'Leads no convertidos'
];

const ALL_SEDES = ['monteros', 'concepcion', 'SMT', 'SanMiguelBN'];

const nuevoRecSchema = Yup.object().shape({
  usuario_id: Yup.number()
    .required('El usuario es obligatorio')
    .positive('Usuario inválido')
    .integer('Usuario inválido'),
  nombre: Yup.string()
    .required('El nombre es obligatorio')
    .max(255, 'El nombre no puede superar los 255 caracteres'),
  tipo_contacto: Yup.string()
    .oneOf(tiposContacto.concat('Otro'), 'Tipo de contacto inválido')
    .required('El tipo de contacto es obligatorio')
});

const FormAltaRecaptacion = ({
  isOpen,
  onClose,
  Rec,
  setSelectedRecaptacion
}) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState(['monteros']);
  const [searchTerm, setSearchTerm] = useState('');

  const { userName } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

  const formikRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      obtenerUsers(selectedSede);
    }
  }, [isOpen, selectedSede]);

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

  // Filtro por búsqueda
  const filteredUsers = Array.isArray(users)
    ? users.filter((u) =>
        (u.name || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    : [];

  // Formatear sedes para mostrar
  const formatSedeValue = (selectedSedeLocal) => {
    let sedes = selectedSedeLocal;
    if (!Array.isArray(sedes)) {
      sedes = [sedes];
    }

    const valorFormateado = sedes
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

    if (sedes.length === 4) {
      return 'todas';
    }

    return valorFormateado;
  };

  const handleSubmitRecaptacion = async (valores) => {
    try {
      console.log('Valores del form:', valores);

      const recaptacionData = {
        usuario_id: valores.usuario_id,
        nombre: valores.nombre,
        tipo_contacto: valores.tipo_contacto,
        canal_contacto: valores.canal_contacto,
        detalle_contacto: valores.detalle_contacto,
        enviado: valores.enviado || false,
        respondido: valores.respondido || false,
        agendado: valores.agendado || false,
        convertido: valores.convertido || false
      };

      const url = valores.id
        ? `http://localhost:8080/recaptacion/${valores.id}`
        : 'http://localhost:8080/recaptacion';

      const method = valores.id ? 'PUT' : 'POST';

      const bodyData =
        method === 'PUT' ? recaptacionData : { registros: [recaptacionData] };

      const response = await fetch(url, {
        method,
        body: JSON.stringify(bodyData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud ${method}: ${response.status}`);
      }

      await response.json();

      setTextoModal(
        method === 'PUT'
          ? 'Recaptación actualizada correctamente.'
          : 'Recaptación creada correctamente.'
      );
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
    } catch (error) {
      console.error('Error al guardar recaptación:', error.message);
      setErrorModal(true);
      setTimeout(() => setErrorModal(false), 1500);
    }
  };

  const handleClose = () => {
    if (formikRef.current) {
      formikRef.current.resetForm();
      setSelectedRecaptacion(null);
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
      <div className="w-full flex items-start justify-center">
        <Formik
          innerRef={formikRef}
          initialValues={{
            id: Rec ? Rec.id : null,
            usuario_id: Rec ? Rec.usuario_id : '',
            nombre: Rec ? Rec.nombre : '',
            tipo_contacto: Rec ? Rec.tipo_contacto : '',
            canal_contacto: Rec ? Rec.canal_contacto || '' : '',
            detalle_contacto: Rec ? Rec.detalle_contacto || '' : '',
            enviado: Rec ? Rec.enviado : false,
            respondido: Rec ? Rec.respondido : false,
            agendado: Rec ? Rec.agendado : false,
            convertido: Rec ? Rec.convertido : false
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitRecaptacion(values);
            resetForm();
          }}
          validationSchema={null} // si querés activar Yup: nuevoRecSchema
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-orange-100 flex flex-col overflow-hidden">
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[#fc4b08] via-orange-500 to-amber-400 text-white">
                <div>
                  <h2 className="font-bignoodle text-base sm:text-lg font-semibold tracking-wide">
                    {Rec ? 'Editar recaptación' : 'Nueva recaptación'}
                  </h2>
                  <p className="text-xs text-orange-50/90">
                    Asigná un responsable y detallá el tipo de contacto.
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

              {/* CONTENIDO */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                {/* SEDES */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Sedes (para listar usuarios)
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Elegí la sede desde la cual querés asignar el
                        responsable.
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

                {/* USUARIO RESPONSABLE */}
                <section className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-800">
                        Usuario responsable
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

                    {/* Buscador */}
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
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/80 p-3">
                    <div className="max-h-56 md:max-h-64 overflow-y-auto pr-1 space-y-2">
                      {Array.isArray(filteredUsers) &&
                      filteredUsers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {filteredUsers.map((user) => {
                            const isSelected = values.usuario_id === user.id;
                            return (
                              <label
                                key={user.id}
                                htmlFor={`user-${user.id}`}
                                className={`flex items-center rounded-xl border px-3 py-2 cursor-pointer transition bg-white/80 hover:bg-orange-50/80 ${
                                  isSelected
                                    ? 'border-[#fc4b08] shadow-sm'
                                    : 'border-zinc-200'
                                }`}
                                onClick={() =>
                                  setFieldValue('usuario_id', user.id)
                                }
                              >
                                <input
                                  type="radio"
                                  id={`user-${user.id}`}
                                  name="usuario_id"
                                  value={user.id}
                                  checked={isSelected}
                                  onChange={() =>
                                    setFieldValue('usuario_id', user.id)
                                  }
                                  className="h-4 w-4 text-[#fc4b08] focus:ring-[#fc4b08]"
                                />
                                <span className="ml-3 text-[11px] sm:text-xs text-zinc-800 break-words leading-tight">
                                  {user.name}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 text-center py-6">
                          No hay usuarios disponibles para el filtro actual.
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.usuario_id && touched.usuario_id && (
                    <Alerta>{errors.usuario_id}</Alerta>
                  )}
                </section>

                {/* NOMBRE CONTACTO */}
                <section className="space-y-2">
                  <label
                    htmlFor="nombre"
                    className="block text-xs font-medium text-zinc-700"
                  >
                    Nombre del contacto
                  </label>
                  <Field
                    id="nombre"
                    name="nombre"
                    type="text"
                    className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                    placeholder="Ingrese nombre del contacto"
                    maxLength={255}
                  />
                  {errors.nombre && touched.nombre && (
                    <Alerta>{errors.nombre}</Alerta>
                  )}
                </section>

                {/* TIPO + CANAL + DETALLE */}
                <section className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="tipo_contacto"
                      className="block text-xs font-medium text-zinc-700"
                    >
                      Tipo de contacto
                    </label>
                    <Field
                      as="select"
                      id="tipo_contacto"
                      name="tipo_contacto"
                      className="mt-1 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue('tipo_contacto', value);
                      }}
                    >
                      <option value="">Seleccione un tipo</option>
                      {tiposContacto.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                      <option value="Otro">Otro</option>
                    </Field>
                    {errors.tipo_contacto && touched.tipo_contacto && (
                      <Alerta>{errors.tipo_contacto}</Alerta>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label
                        htmlFor="canal_contacto"
                        className="block text-xs font-medium text-zinc-700"
                      >
                        Canal de contacto
                      </label>
                      <Field
                        name="canal_contacto"
                        placeholder="Ej: WhatsApp, llamada, mail…"
                        className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="detalle_contacto"
                        className="block text-xs font-medium text-zinc-700"
                      >
                        Detalle de contacto
                      </label>
                      <Field
                        name="detalle_contacto"
                        as="textarea"
                        rows={3}
                        placeholder="Detalle breve del contacto, objeciones, interés, etc."
                        className="block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-orange-500/70 focus:border-orange-500 resize-y"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* FOOTER */}
              <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3">
                <input
                  type="submit"
                  value={Rec ? 'Actualizar recaptación' : 'Crear recaptación'}
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

export default FormAltaRecaptacion;
