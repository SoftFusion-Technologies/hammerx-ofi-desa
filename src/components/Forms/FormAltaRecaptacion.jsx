import React, { useState, useEffect, useRef } from 'react'; // (NUEVO)
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

const FormAltaRecaptacion = ({
  isOpen,
  onClose,
  Rec,
  setSelectedRecaptacion
}) => {
  const [users, setUsers] = useState([]);
  const [selectedSede, setSelectedSede] = useState(['monteros']);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAllUsers, setSelectAllUsers] = useState(false);

  const { userName } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [textoModal, setTextoModal] = useState('');

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
      .oneOf(tiposContacto.concat('Otro'), 'Tipo de contacto inválido')
      .required('El tipo de contacto es obligatorio')
  });

  useEffect(() => {
    if (Rec) {
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

  // Igual que en FormAltaNovedad
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

  const mapSedesToApiValue = (selectedSedeLocal) => {
    return selectedSedeLocal.length === 4
      ? 'todas'
      : selectedSedeLocal.join(', ');
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
    // misma lógica que en FormAltaNovedad
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
          validationSchema={null} // si querés activar Yup, poné: nuevoRecSchema
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

                {/* SEDES - mis masma que FormAltaNovedad */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mx-2">
                  {/* Monteros */}
                  <button
                    type="button"
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes('monteros')
                      ? 'bg-[#fc4b08] text-white border-none'
                      : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]'
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('monteros')}
                  >
                    {selectedSede.includes('monteros')
                      ? 'Monteros✅'
                      : 'Monteros'}
                  </button>

                  {/* Concepción */}
                  <button
                    type="button"
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes('concepcion')
                      ? 'bg-[#fc4b08] text-white border-none'
                      : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]'
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('concepcion')}
                  >
                    {selectedSede.includes('concepcion')
                      ? 'Concepción✅'
                      : 'Concepción'}
                  </button>

                  {/* T. Barrio Sur (SMT) */}
                  <button
                    type="button"
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes('SMT')
                      ? 'bg-[#fc4b08] text-white border-none'
                      : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]'
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('SMT')}
                  >
                    {selectedSede.includes('SMT')
                      ? 'T.Barrio Sur✅'
                      : 'T.Barrio Sur'}
                  </button>

                  {/* T. Barrio Norte (SanMiguelBN) */}
                  <button
                    type="button"
                    className={`w-full py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center whitespace-nowrap 
                  ${
                    selectedSede.includes('SanMiguelBN')
                      ? 'bg-[#fc4b08] text-white border-none'
                      : 'bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50 hover:border-[#fc4b08]'
                  } focus:outline-orange-100`}
                    onClick={() => handleSedeSelection('SanMiguelBN')}
                  >
                    {selectedSede.includes('SanMiguelBN')
                      ? 'T.Barrio Norte✅'
                      : 'T.Barrio Norte'}
                  </button>
                </div>

                {/* Usuarios por sede */}
                <div className="mb-6 px-6 py-4 bg-white rounded-lg shadow-md">
                  <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
                    {Array.isArray(users) && users.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center rounded-lg border border-gray-200 px-4 py-2 hover:bg-gray-100"
                          >
                            <input
                              type="radio"
                              name="usuario_id"
                              value={user.id}
                              checked={values.usuario_id === user.id}
                              onChange={() =>
                                setFieldValue('usuario_id', user.id)
                              }
                              className="form-radio"
                            />
                            <label
                              htmlFor={`user-${user.id}`}
                              className="ml-3 text-gray-800 cursor-pointer truncate"
                              style={{ fontSize: '0.775rem' }}
                            >
                              {user.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No hay usuarios disponibles
                      </p>
                    )}
                  </div>
                </div>

                {/* Resto del formulario igual */}
                <div className="mb-3 px-4">
                  <label
                    htmlFor="nombre"
                    className="block font-medium left-0 mb-1"
                  >
                    <span className="text-black text-base pl-1">
                      Nombre del contacto
                    </span>
                  </label>
                  <Field
                    id="nombre"
                    name="nombre"
                    type="text"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    placeholder="Ingrese nombre del contacto"
                    maxLength={255}
                  />
                  {errors.nombre && touched.nombre && (
                    <Alerta>{errors.nombre}</Alerta>
                  )}
                </div>

                <div className="mb-3 px-4">
                  <label
                    htmlFor="tipo_contacto"
                    className="block font-medium left-0 mb-1"
                  >
                    <span className="text-black text-base pl-1">
                      Tipo de contacto
                    </span>
                  </label>
                  <Field
                    as="select"
                    id="tipo_contacto"
                    name="tipo_contacto"
                    className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    onChange={(e) => {
                      const value = e.target.value;
                      setFieldValue('tipo_contacto', value);
                    }}
                  >
                    <option value="">Seleccione un tipo</option>
                    <option value="Socios que no asisten">
                      Socios que no asisten
                    </option>
                    <option value="Inactivo 10 dias">Inactivo 10 días</option>
                    <option value="Inactivo 30 dias">Inactivo 30 días</option>
                    <option value="Inactivo 60 dias">Inactivo 60 días</option>
                    <option value="Prospectos inc. Socioplus">
                      Prospectos inc. Socioplus
                    </option>
                    <option value="Prosp inc Entrenadores">
                      Prosp inc Entrenadores
                    </option>
                    <option value="Leads no convertidos">
                      Leads no convertidos
                    </option>
                    <option value="Otro">Otro</option>
                  </Field>

                  {errors.tipo_contacto && touched.tipo_contacto && (
                    <Alerta>{errors.tipo_contacto}</Alerta>
                  )}

                  <div className="mt-3">
                    <label
                      htmlFor="canal_contacto"
                      className="block font-medium left-0 mb-1"
                    >
                      <span className="text-black text-base pl-1">
                        Canal de contacto
                      </span>
                    </label>
                    <Field
                      name="canal_contacto"
                      placeholder="Especifique el canal de contacto"
                      className="block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    />
                  </div>

                  <div className="mt-3">
                    <label
                      htmlFor="detalle_contacto"
                      className="block font-medium left-0 mb-1"
                    >
                      <span className="text-black text-base pl-1">
                        Detalle de contacto
                      </span>
                    </label>
                    <Field
                      name="detalle_contacto"
                      placeholder="Especifique el detalle de contacto"
                      className="block w-full p-3 text-black bg-slate-100 rounded-xl focus:outline-orange-500"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white py-3 px-4">
                  <input
                    type="submit"
                    value={Rec ? 'Actualizar' : 'Crear Recaptación'}
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

export default FormAltaRecaptacion;
