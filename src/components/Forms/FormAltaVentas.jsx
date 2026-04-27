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
import RedesSoft from '../../pages/Pilates/Components/RedesSoft';

const tiposContacto = [
  'Socios que no asisten',
  'Inactivo 10 dias',
  'Inactivo 30 dias',
  'Inactivo 60 dias',
  'Prospectos inc. Socioplus',
  'Prosp inc Entrenadores',
  'Leads no convertidos'
];

// Benjamin Orellana - 27/04/2026 - Se centralizan clases visuales para compactar el formulario y mantener una UX consistente.
const inputClass =
  'h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/90 px-4 text-[0.92rem] font-medium text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-orange-200 hover:bg-white focus:border-[#fc4b08] focus:bg-white focus:ring-4 focus:ring-orange-100';

const selectClass =
  'h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50/90 px-4 pr-10 text-[0.92rem] font-medium text-slate-900 outline-none transition-all duration-200 hover:border-orange-200 hover:bg-white focus:border-[#fc4b08] focus:bg-white focus:ring-4 focus:ring-orange-100';

const fieldBoxClass =
  'rounded-[20px] border border-slate-200/80 bg-white/80 p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-all duration-200 hover:border-orange-200 hover:shadow-[0_14px_34px_rgba(15,23,42,0.09)]';

const CampoFormulario = ({ label, error, touched, children, full = false }) => (
  <div className={`${fieldBoxClass} ${full ? 'md:col-span-2' : ''}`}>
    <label className="mb-1.5 block text-[0.76rem] font-black uppercase tracking-[0.08em] text-slate-500">
      {label}
    </label>

    {children}

    {error && touched && (
      <div className="mt-1.5">
        <Alerta>{error}</Alerta>
      </div>
    )}
  </div>
);

const FormAltaVentas = ({
  isOpen,
  onClose,
  Rec,
  setSelectedRecaptacion,
  Sede
}) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState(['monteros']);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const { userName, userId } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  // const textoModal = 'Usuario creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  const nuevoRecSchema = Yup.object().shape({
    usuario_id: Yup.number()
      .required('El usuario es obligatorio')
      .positive('Usuario inválido')
      .integer('Usuario inválido'),
    nombre: Yup.string()
      .required('El nombre es obligatorio')
      .max(255, 'El nombre no puede superar los 255 caracteres'),
    tipo_contacto: Yup.string()
      .oneOf(tiposContacto, 'Tipo de contacto inválido')
      .required('El tipo de contacto es obligatorio')
  });

  useEffect(() => {
    if (Rec) {
      // Si viene con usuarios asignados, mapear los IDs
      const ids = Rec.taskUsers?.map((tu) => tu.user.id) || [];
      setSelectedUsers(ids);
    } else {
      setSelectedUsers([]);
    }
  }, [Rec]);

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

  const handleCheckboxChange = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers([]);
      formikRef.current.setFieldValue('usuario_id', '');
    } else {
      setSelectedUsers([id]);
      formikRef.current.setFieldValue('usuario_id', id);
    }
  };

  const handleSelectAllUsers = (values, setFieldValue) => {
    const allSelected = values.user.length === users.length;
    const updated = allSelected ? [] : users.map((user) => user.id);
    setFieldValue('user', updated);
  };

  const formatSedeValue = (selectedSede) => {
    return selectedSede.length === 3 ? 'todas' : selectedSede.join(', ');
  };

  const handleSubmitProspecto = async (valores) => {
    try {
      console.log('Valores del form:', valores);

      // Armar objeto completo para el backend
      const prospectoData = {
        usuario_id: userId,
        nombre: valores.nombre,
        dni: valores.dni,
        tipo_prospecto: valores.tipo_prospecto,
        canal_contacto: valores.canal_contacto,
        contacto: valores.contacto,
        actividad: valores.actividad,
        sede: Sede,
        asesor_nombre: valores.asesor_nombre,
        n_contacto_1: valores.n_contacto_1 || 0,
        n_contacto_2: valores.n_contacto_2 || 0,
        n_contacto_3: valores.n_contacto_3 || 0,
        clase_prueba_1_fecha: valores.clase_prueba_1_fecha,
        clase_prueba_1_obs: valores.clase_prueba_1_obs,
        clase_prueba_2_fecha: valores.clase_prueba_2_fecha,
        clase_prueba_2_obs: valores.clase_prueba_2_obs,
        clase_prueba_3_fecha: valores.clase_prueba_3_fecha,
        clase_prueba_3_obs: valores.clase_prueba_3_obs,
        convertido: valores.convertido || false,
        observacion: valores.observacion || ''
      };

      if (valores.canal_contacto === 'Campaña') {
        prospectoData.campania_origen = valores.campania_origen || '';
      } else {
        // Si no es campaña, lo mandás vacío o null (opcional)
        prospectoData.campania_origen = '';
      }

      const url = valores.id
        ? `http://localhost:8080/ventas_prospectos/${valores.id}`
        : 'http://localhost:8080/ventas_prospectos';

      const method = valores.id ? 'PUT' : 'POST';

      // Enviar el objeto directamente, no como array
      const bodyData = JSON.stringify(prospectoData);

      const response = await fetch(url, {
        method,
        body: bodyData,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error en la solicitud ${method}: ${response.status}`);
      }

      const result = await response.json();

      setTextoModal(
        method === 'PUT'
          ? 'Prospecto actualizado correctamente.'
          : 'Prospecto creado correctamente.'
      );
      setShowModal(true);
      setTimeout(() => setShowModal(false), 1500);
    } catch (error) {
      console.error('Error al guardar prospecto:', error.message);
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

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? 'flex' : 'hidden'
      } items-center justify-center overflow-y-auto bg-slate-950/75 px-2 py-3 backdrop-blur-md sm:px-4 sm:py-6`}
    >
      <div className="relative flex max-h-[calc(100dvh-24px)] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        <Formik
          innerRef={formikRef}
          initialValues={{
            id: Rec ? Rec.id : null,
            usuario_id: userId,
            nombre: Rec ? Rec.nombre : '',
            dni: Rec ? Rec.dni : '',
            tipo_prospecto: Rec ? Rec.tipo_prospecto : '',
            canal_contacto: Rec ? Rec.canal_contacto : '',
            contacto: Rec ? Rec.contacto : '',
            actividad: Rec ? Rec.actividad : '',
            sede: Sede,
            asesor_nombre: Rec ? Rec.asesor_nombre : '', // nombre del asesor (opcional)
            n_contacto_1: Rec ? Rec.n_contacto_1 : 0,
            n_contacto_2: Rec ? Rec.n_contacto_2 : 0,
            n_contacto_3: Rec ? Rec.n_contacto_3 : 0,
            clase_prueba_1_fecha: Rec ? Rec.clase_prueba_1_fecha : null,
            clase_prueba_1_obs: Rec ? Rec.clase_prueba_1_obs : '',
            clase_prueba_2_fecha: Rec ? Rec.clase_prueba_2_fecha : null,
            clase_prueba_2_obs: Rec ? Rec.clase_prueba_2_obs : '',
            clase_prueba_3_fecha: Rec ? Rec.clase_prueba_3_fecha : null,
            clase_prueba_3_obs: Rec ? Rec.clase_prueba_3_obs : '',
            convertido: Rec ? Rec.convertido : false,
            observacion: Rec ? Rec.observacion : '',
            // Benjamin Orellana - 27/04/2026 - Se agrega valor inicial para evitar inconsistencias visuales al editar campañas.
            campania_origen: Rec ? Rec.campania_origen : ''
          }}
          enableReinitialize
          onSubmit={async (values, { resetForm }) => {
            await handleSubmitProspecto(values);
            resetForm();
          }}
          validationSchema={null}
        >
          {({ errors, touched, setFieldValue, values }) => (
            <Form className="flex max-h-[calc(100dvh-24px)] min-h-0 w-full flex-col bg-white">
              {/* Benjamin Orellana - 27/04/2026 - Cabecera compacta con redes Soft integradas sin ocupar espacio extra del formulario. */}
              <div className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 px-3 py-2.5 backdrop-blur-xl sm:px-5">
                <div className="flex min-w-0 items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="tools hidden shrink-0 sm:flex">
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
                    <RedesSoft />
                  </div>


                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-lg font-black leading-none text-slate-500 shadow-sm transition-all duration-200 hover:border-orange-200 hover:bg-orange-50 hover:text-[#fc4b08] focus:outline-none focus:ring-4 focus:ring-orange-100"
                    aria-label="Cerrar"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Benjamin Orellana - 27/04/2026 - Cuerpo responsive compacto en grilla para reducir scroll sin agregar contenido innecesario. */}
              <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(252,75,8,0.08),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-3 py-3 sm:px-5 sm:py-5">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <CampoFormulario
                    label="Nombre"
                    error={errors.nombre}
                    touched={touched.nombre}
                  >
                    <Field
                      id="nombre"
                      name="nombre"
                      type="text"
                      className={inputClass}
                      placeholder="Nombre del contacto"
                      maxLength={100}
                    />
                  </CampoFormulario>

                  <CampoFormulario
                    label="DNI"
                    error={errors.dni}
                    touched={touched.dni}
                  >
                    <Field
                      id="dni"
                      name="dni"
                      type="text"
                      className={inputClass}
                      placeholder="DNI"
                      maxLength={20}
                    />
                  </CampoFormulario>

                  <CampoFormulario
                    label="Tipo de prospecto"
                    error={errors.tipo_prospecto}
                    touched={touched.tipo_prospecto}
                  >
                    <div className="relative">
                      <Field
                        as="select"
                        id="tipo_prospecto"
                        name="tipo_prospecto"
                        className={selectClass}
                      >
                        <option value="">Seleccione tipo</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="ExSocio">ExSocio</option>
                      </Field>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        ▼
                      </span>
                    </div>
                  </CampoFormulario>

                  <CampoFormulario
                    label="Canal"
                    error={errors.canal_contacto}
                    touched={touched.canal_contacto}
                  >
                    <div className="relative">
                      <Field
                        as="select"
                        id="canal_contacto"
                        name="canal_contacto"
                        className={selectClass}
                      >
                        <option value="">Seleccione canal</option>
                        <option value="Mostrador">Mostrador</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Link Web">Link Web</option>
                        <option value="Campaña">Campaña</option>
                        <option value="Comentarios/Stickers">
                          Comentarios/Stickers
                        </option>
                        <option value="Desde pilates">Desde pilates</option>
                      </Field>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        ▼
                      </span>
                    </div>
                  </CampoFormulario>

                  {values.canal_contacto === 'Campaña' && (
                    <CampoFormulario
                      label="Origen campaña"
                      error={errors.campania_origen}
                      touched={touched.campania_origen}
                    >
                      <div className="relative">
                        <Field
                          as="select"
                          id="campania_origen"
                          name="campania_origen"
                          className={selectClass}
                        >
                          <option value="">Seleccione origen</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Whatsapp">Whatsapp</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Otro">Otro</option>
                        </Field>

                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                          ▼
                        </span>
                      </div>
                    </CampoFormulario>
                  )}

                  <CampoFormulario
                    label="Contacto"
                    error={errors.contacto}
                    touched={touched.contacto}
                  >
                    <Field
                      id="contacto"
                      name="contacto"
                      type="text"
                      className={inputClass}
                      placeholder="Usuario, teléfono o contacto"
                      maxLength={50}
                    />
                  </CampoFormulario>

                  <CampoFormulario
                    label="Actividad"
                    error={errors.actividad}
                    touched={touched.actividad}
                  >
                    <div className="relative">
                      <Field
                        as="select"
                        id="actividad"
                        name="actividad"
                        className={selectClass}
                      >
                        <option value="">Seleccione actividad</option>
                        <option value="No especifica">No especifica</option>
                        <option value="Musculacion">Musculación</option>
                        <option value="Pilates">Pilates</option>
                        <option value="Clases grupales">Clases grupales</option>
                        <option value="Pase full">Pase full</option>
                      </Field>

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                        ▼
                      </span>
                    </div>
                  </CampoFormulario>

                  <CampoFormulario
                    label="Asesor"
                    error={errors.asesor_nombre}
                    touched={touched.asesor_nombre}
                  >
                    <Field
                      id="asesor_nombre"
                      name="asesor_nombre"
                      type="text"
                      className={inputClass}
                      placeholder="Asesor opcional"
                      maxLength={100}
                    />
                  </CampoFormulario>

                  <CampoFormulario
                    label="Observación"
                    error={errors.observacion}
                    touched={touched.observacion}
                    full
                  >
                    <Field
                      id="observacion"
                      name="observacion"
                      type="text"
                      className={inputClass}
                      placeholder="Observación breve"
                      maxLength={50}
                    />
                  </CampoFormulario>
                </div>
              </div>

              {/* Benjamin Orellana - 27/04/2026 - Footer sticky compacto con acción principal siempre visible en mobile y desktop. */}
              <div className="sticky bottom-0 z-20 border-t border-slate-200/80 bg-white/95 px-3 py-3 backdrop-blur-xl sm:px-5">
                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="h-11 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-600 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 sm:w-auto"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="h-11 rounded-2xl bg-[linear-gradient(135deg,#ff7a1a_0%,#fc4b08_52%,#d93800_100%)] px-7 text-sm font-black text-white shadow-[0_16px_34px_rgba(252,75,8,0.34)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_42px_rgba(252,75,8,0.42)] focus:outline-none focus:ring-4 focus:ring-orange-100 sm:w-auto"
                  >
                    {Rec ? 'Actualizar' : 'Crear prospecto'}
                  </button>
                </div>
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

export default FormAltaVentas;
