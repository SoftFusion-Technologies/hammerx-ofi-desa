/*
 * Programadores: Benjamin Orellana (back) y Lucas Albornoz (front)
 * Fecha Creación: 01 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (FormAltaConve.jsx) es el componente donde realizamos un formulario para
 *  la tabla Conve, este formulario aparece en la web del staff
 *
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
import ModalSuccess from './ModalSuccess';
import ModalError from './ModalError';
import Alerta from '../Error';
import ReactQuill from 'react-quill';
import '../../styles/Forms/FormAltaConve.css';
import SelectSede from '../../components/SelectSede';
import SelectSedes from '../../pages/staff/Components/SelectSedes';
import { motion, AnimatePresence } from 'framer-motion'; // necesitas framer-motion
// Benjamin Orellana - 22-12-2026 - Importar modal de planes a convenios
import ConvenioPlanesModal from '../../pages/staff/Components/ConvenioPlanesModal';

const FormAltaConve = ({ isOpen, onClose, conve2, setConve2 }) => {
  // const [conve, setConve] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);

  const [descConveCount, setDescConveCount] = useState(0);
  const [descUsuCount, setDescUsuCount] = useState(0);
  const [visible, setVisible] = useState(false);

  const maxLength = 2550;
  // const textoModal = 'Conve creado correctamente.'; se elimina el texto
  // nuevo estado para gestionar dinámicamente según el método (PUT o POST)
  const [textoModal, setTextoModal] = useState('');

  //BENJAMIN ORELLANA - 22-12-2026 - Para gestionar planes a convenios INI */
  const [planesOpen, setPlanesOpen] = useState(false);
  const [planesConvenioId, setPlanesConvenioId] = useState(null);
  const [planesConvenioTitulo, setPlanesConvenioTitulo] = useState('');
  //BENJAMIN ORELLANA - 22-12-2026 - Para gestionar planes a convenios FIN */

  // nueva variable para administrar el contenido de formulario para saber cuando limpiarlo
  const formikRef = useRef(null);

  useEffect(() => {
    setVisible(false);
  }, []);

  // yup sirve para validar formulario este ya trae sus propias sentencias
  // este esquema de cliente es para utilizar su validacion en los inputs
  const nuevoConveSchema = Yup.object().shape({
    nameConve: Yup.string().required('El Titulo es obligatorio'),
    descConve: Yup.string().required('La descripción es obligatoria')
  });

  const handleSubmitConve = async (valores) => {
    try {
      // Verificamos si los campos obligatorios están vacíos
      if (valores.nameConve === '' || valores.descConve === '') {
        alert('Por favor, complete todos los campos obligatorios.');
      } else {
        const transformedValues = {
          ...valores,
          permiteFam: valores.permiteFam ? 1 : 0,
          //BENJAMIN ORELLANA - 22-12-2026 - Se adiciona bandera para saber si el convenio puede seleccionar sede */
          permiteElegirSedeEmpresa: valores.permiteElegirSedeEmpresa ? 1 : 0
        };

        //
        // ? `http://localhost:8080/admconvenios/${conve2.id}`
        //       : 'http://localhost:8080/admconvenios/';
        // Definir URL y método basados en la existencia de conve
        const url = conve2
          ? `http://localhost:8080/admconvenios/${conve2.id}`
          : 'http://localhost:8080/admconvenios/';
        const method = conve2 ? 'PUT' : 'POST';

        const respuesta = await fetch(url, {
          method: method,
          body: JSON.stringify(transformedValues),
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Verificamos si la solicitud fue exitosa
        if (!respuesta.ok) {
          throw new Error('Error en la solicitud POST: ' + respuesta.status);
        }
        if (method === 'PUT') {
          // setName(null); // una vez que sale del metodo PUT, limpiamos el campo descripcion
          setTextoModal('Convenio actualizado correctamente.');
        } else {
          setTextoModal('Convenio creado correctamente.');
        }

        // Convertimos la respuesta a JSON
        const data = await respuesta.json();
        console.log('Registro insertado correctamente:', data);


        // Intentar obtener el ID del convenio desde la respuesta.Benjamin Orellana 22-12-2025
        const createdId =
          data?.id ||
          data?.registro?.id ||
          data?.registroActualizado?.id ||
          data?.convenio?.id ||
          null;

        if (!conve2 && createdId) {
          // POST: abrir modal de planes para el nuevo convenio
          setPlanesConvenioId(createdId);
          setPlanesConvenioTitulo(transformedValues?.nameConve || '');
          setPlanesOpen(true);
        }

        // Mostrar la ventana modal de éxito
        setShowModal(true);

        // Ocultar la ventana modal de éxito después de 3 segundos
        setTimeout(() => {
          setShowModal(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Error al insertar el registro:', error.message);

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
    }
    onClose();
  };

  const handlePrecioChange = (
    values,
    setFieldValue,
    precioField,
    descuentoField,
    precioFinalField
  ) => {
    const precio = parseFloat(values[precioField]) || 0;
    const descuento = parseFloat(values[descuentoField]) || 0;
    const precioFinal = precio - (precio * descuento) / 100;

    // Establecer el valor calculado en el campo correspondiente
    setFieldValue(precioFinalField, precioFinal);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${
        isOpen ? '' : 'hidden'
      }`}
    >
      <div className="relative w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-white flex flex-col overflow-hidden animate-fade-in transition-all duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-300" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <button
            className="text-gray-500 hover:text-orange-500 transition text-2xl font-bold"
            onClick={handleClose}
            aria-label="Cerrar"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="w-full px-2 py-2 max-h-[85vh] overflow-y-auto">
          <Formik
            innerRef={formikRef}
            initialValues={{
              nameConve: conve2 ? conve2.nameConve : '',
              descConve: conve2 ? conve2.descConve : '',
              precio: conve2 ? conve2.precio : '',
              descuento: conve2 ? conve2.descuento : '',
              preciofinal: conve2 ? conve2.preciofinal : '',
              permiteFam: conve2 ? Number(conve2.permiteFam) === 1 : false,

              cantFamiliares: conve2
                ? Number(conve2.permiteFam) === 1
                  ? Number(conve2.cantFamiliares) > 0
                    ? Number(conve2.cantFamiliares)
                    : 1
                  : 0
                : 0,
              sede: conve2 ? conve2.sede : '',
              permiteElegirSedeEmpresa: conve2
                ? conve2.permiteElegirSedeEmpresa
                : 0,
              agrupador: conve2 ? conve2.agrupador : '',
              desc_usu: conve2 ? conve2.desc_usu : '',
              permiteFec: conve2 ? conve2.permiteFec : 0,
              precio_concep: conve2 ? conve2.precio_concep : '',
              descuento_concep: conve2 ? conve2.descuento_concep : '',
              preciofinal_concep: conve2 ? conve2.preciofinal_concep : ''
            }}
            enableReinitialize
            onSubmit={async (values, { resetForm }) => {
              await handleSubmitConve(values);
              resetForm();
            }}
            validationSchema={nuevoConveSchema}
          >
            {({ isSubmitting, setFieldValue, errors, touched, values }) => (
              <div className="py-2 px-1 md:px-4">
                <Form className="bg-transparent">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
                    {/* Header */}
                    <div className="px-4 md:px-6 py-4 border-b border-slate-200 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="font-bignoodle text-lg md:text-2xl font-semibold text-orange-600">
                          {conve2 ? 'Editar convenio' : 'Crear convenio'}
                        </h2>
                        <p className="text-sm text-slate-500">
                          Completá la información principal, precios y reglas de
                          aplicación.
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="px-4 md:px-6 py-4 space-y-4">
                      {/* Sección: Datos básicos */}
                      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Datos básicos
                          </h3>
                          <p className="text-sm text-slate-500">
                            Identificación y configuración general del convenio.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label
                              htmlFor="nameConve"
                              className="text-sm font-medium text-slate-700"
                            >
                              Título
                            </label>
                            <Field
                              id="nameConve"
                              name="nameConve"
                              type="text"
                              maxLength="70"
                              placeholder="Ej: Convenio Empresa X"
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                            />
                            {errors.nameConve && touched.nameConve && (
                              <Alerta>{errors.nameConve}</Alerta>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="precio"
                              className="text-sm font-medium text-slate-700"
                            >
                              Precio base
                            </label>
                            <Field
                              id="precio"
                              name="precio"
                              type="text"
                              inputMode="numeric"
                              placeholder="Ej: 25000"
                              maxLength="14"
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                              onChange={(e) => {
                                setFieldValue('precio', e.target.value);
                                handlePrecioChange(
                                  { ...values, precio: e.target.value },
                                  setFieldValue,
                                  'precio',
                                  'descuento',
                                  'preciofinal'
                                );
                              }}
                            />
                            <p className="mt-2 text-xs text-slate-500">
                              Ingresá el valor sin símbolos. El total se calcula
                              automáticamente.
                            </p>
                          </div>
                        </div>
                      </section>

                      {/* Sección: Precios */}
                      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Precios
                          </h3>
                          <p className="text-sm text-slate-500">
                            Descuentos y precio final calculado.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div>
                            <label
                              htmlFor="descuento"
                              className="text-sm font-medium text-slate-700"
                            >
                              Descuento
                            </label>
                            <Field
                              id="descuento"
                              name="descuento"
                              type="text"
                              inputMode="numeric"
                              placeholder="Ej: 5000"
                              maxLength="14"
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition"
                              onChange={(e) => {
                                setFieldValue('descuento', e.target.value);
                                handlePrecioChange(
                                  { ...values, descuento: e.target.value },
                                  setFieldValue,
                                  'precio',
                                  'descuento',
                                  'preciofinal'
                                );
                              }}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label
                              htmlFor="preciofinal"
                              className="text-sm font-medium text-slate-700"
                            >
                              Precio final
                            </label>
                            <Field
                              id="preciofinal"
                              name="preciofinal"
                              type="text"
                              readOnly
                              value={values.preciofinal}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-900 font-semibold"
                            />
                          </div>
                        </div>

                        {/* Avanzado por sede */}
                        {visible && (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-3 text-xs uppercase tracking-wider text-slate-500">
                              Precios Concepción
                            </div>
                            <div className="grid md:grid-cols-3 gap-4">
                              {/* tus 3 fields concep (igual lógica) */}
                            </div>
                          </div>
                        )}
                      </section>

                      {/* Sección: Contenido */}
                      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Contenido
                          </h3>
                          <p className="text-sm text-slate-500">
                            Texto interno usuarios y texto visible para
                            convenios.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {/* DESC CONVENIOS */}
                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-slate-700">
                                Descripción para convenios
                              </label>
                              <span className="text-xs text-slate-500">
                                {descConveCount}/{maxLength}
                              </span>
                            </div>

                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                              <ReactQuill
                                theme="snow"
                                value={values.descConve}
                                onChange={(content, delta, source, editor) => {
                                  setFieldValue('descConve', content);

                                  // Opción A: contar texto plano visible (sin HTML)
                                  const plain = editor
                                    .getText()
                                    .replace(/\n$/, ''); // quita el \n final de Quill
                                  setDescConveCount(plain.length);
                                }}
                                // placeholder innecesario - quitado por Benjamin Orellana 21/12/2025
                                // placeholder="Qué incluye el convenio, reglas internas, etc."
                                className="custom-quill-editor"
                              />
                            </div>

                            {errors.descConve && touched.descConve && (
                              <Alerta>{errors.descConve}</Alerta>
                            )}
                          </div>

                          {/* DESC COLABORADORES */}
                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-slate-700">
                                Descripción para colaboradores
                              </label>
                              <span className="text-xs text-slate-500">
                                {descUsuCount}/{maxLength}
                              </span>
                            </div>

                            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
                              <ReactQuill
                                theme="snow"
                                value={values.desc_usu}
                                onChange={(content, delta, source, editor) => {
                                  setFieldValue('desc_usu', content);

                                  // Opción A: contar texto plano visible (sin HTML)
                                  const plain = editor
                                    .getText()
                                    .replace(/\n$/, ''); // quita el \n final de Quill
                                  setDescUsuCount(plain.length);
                                }}
                                className="custom-quill-editor"
                              />
                            </div>

                            {errors.desc_usu && touched.desc_usu && (
                              <Alerta>{errors.desc_usu}</Alerta>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Sección: Reglas */}
                      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-slate-900">
                            Reglas
                          </h3>
                          <p className="text-sm text-slate-500">
                            Aplicación por sede, familiares y fechas.
                          </p>
                        </div>

                        <SelectSede
                          setFieldValue={setFieldValue}
                          errors={errors}
                          touched={touched}
                        />

                        <div className="mt-4">
                          <div className="text-sm font-medium text-slate-700 mb-2">
                            Permitir que la empresa elija sede
                          </div>

                          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue('permiteElegirSedeEmpresa', 1)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
        ${
          Number(values.permiteElegirSedeEmpresa) === 1
            ? 'bg-white shadow-sm text-slate-900'
            : 'text-slate-600'
        }
      `}
                            >
                              Permitir
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setFieldValue('permiteElegirSedeEmpresa', 0)
                              }
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
        ${
          Number(values.permiteElegirSedeEmpresa) === 0
            ? 'bg-white shadow-sm text-slate-900'
            : 'text-slate-600'
        }
      `}
                            >
                              Bloquear
                            </button>
                          </div>

                          <p className="mt-2 text-xs text-slate-500">
                            Si está en “Bloquear”, la empresa no podrá
                            seleccionar sede al cargar integrantes (queda
                            definida por configuración).
                          </p>
                        </div>

                        <div className="mt-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                          {/* Switch (si querés mantener checkbox, al menos estilizarlo) */}
                          <button
                            type="button"
                            onClick={() => {
                              const next = !values.permiteFam;
                              setFieldValue('permiteFam', next);

                              // Si se activa y viene 0 / vacío / null, seteamos 1 para que no quede “0”
                              if (next) {
                                const cf = Number(values.cantFamiliares);
                                if (!cf || cf < 1)
                                  setFieldValue('cantFamiliares', 1);
                              } else {
                                // Si se desactiva, lo dejamos en 0 (o '' si preferís)
                                setFieldValue('cantFamiliares', 0);
                              }
                            }}
                            className={`w-full md:w-auto rounded-xl border px-4 py-3 text-sm font-semibold transition
    ${
      values.permiteFam
        ? 'border-orange-300 bg-orange-50 text-orange-700'
        : 'border-slate-200 bg-slate-50 text-slate-700'
    }
  `}
                          >
                            {values.permiteFam
                              ? 'Permite familiar: Sí'
                              : 'Permite familiar: No'}
                          </button>

                          <div className="w-full md:w-[420px]">
                            <SelectSedes
                              value={values.agrupador}
                              onChange={(v) => setFieldValue('agrupador', v)}
                            />
                          </div>
                        </div>

                        {values.permiteFam && (
                          <div className="mt-4">
                            <div className="text-sm font-medium text-slate-700 mb-2">
                              Cantidad de familiares
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() =>
                                    setFieldValue('cantFamiliares', n)
                                  }
                                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition
                    ${
                      values.cantFamiliares === n
                        ? 'border-orange-300 bg-orange-50 text-orange-700'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }
                  `}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4">
                          <div className="text-sm font-medium text-slate-700 mb-2">
                            Permite fechas
                          </div>
                          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                            <button
                              type="button"
                              onClick={() => setFieldValue('permiteFec', 1)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  values.permiteFec === 1
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600'
                }
              `}
                            >
                              Permite
                            </button>
                            <button
                              type="button"
                              onClick={() => setFieldValue('permiteFec', 0)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  values.permiteFec === 0
                    ? 'bg-white shadow-sm text-slate-900'
                    : 'text-slate-600'
                }
              `}
                            >
                              No permite
                            </button>
                          </div>
                        </div>
                      </section>
                    </div>

                    {/* Sticky footer */}
                    <div className="sticky bottom-0 border-t border-slate-200 bg-white/85 backdrop-blur-xl px-4 md:px-6 py-3">
                      <div className="flex flex-col-reverse md:flex-row md:justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => formikRef?.current?.resetForm()}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Limpiar
                        </button>
                        {conve2?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setPlanesConvenioId(conve2.id);
                              setPlanesConvenioTitulo(conve2.nameConve || '');
                              setPlanesOpen(true);
                            }}
                            className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 transition"
                          >
                            Gestionar planes
                          </button>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm disabled:opacity-60"
                        >
                          {isSubmitting
                            ? 'Guardando...'
                            : conve2
                            ? 'Actualizar'
                            : 'Crear convenio'}
                        </button>
                      </div>
                    </div>
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
        <ModalError
          isVisible={errorModal}
          onClose={() => setErrorModal(false)}
        />
        <ConvenioPlanesModal
          open={planesOpen}
          onClose={() => setPlanesOpen(false)}
          convenioId={planesConvenioId}
          convenioTitulo={planesConvenioTitulo}
        />
      </div>
    </div>
  );
};

// Se elimina los default prosp, quedo desactualizado
// FormAltaConve.defaultProps = {
//   conve: {}
// };

export default FormAltaConve;
