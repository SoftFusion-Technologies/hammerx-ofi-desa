/* 
Autor: Sergio Manrique
Fecha de creación: 23-12-2025
Descripción: Componente ModalDetalleAusentes para gestionar alumnos ausentes en Pilates.
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:8080';

const ModalDetalleAusentes = ({
  isOpen,
  onClose,
  ausentesData,
  refetchAusentesData,
  isLoadingAusentesData,
  errorAusentesData
}) => {
  const { userId } = useAuth();
  // --- ESTADOS DE DATOS ---
  const [historialSeleccionado, setHistorialSeleccionado] = useState([]);

  // --- ESTADOS DE UI ---
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [paginaActual, setPaginaActual] = useState(1);
  const [nuevaObservacion, setNuevaObservacion] = useState('');

  // --- ESTADOS DE CARGA Y ERROR ---
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const ITEMS_POR_PAGINA = 20;

  // 1. CARGAR DASHBOARD AL ABRIR
  useEffect(() => {
    if (!isOpen) {
      // Limpieza al cerrar
      setAlumnoSeleccionado(null);
      setBusqueda('');
      setFiltroEstado('TODOS');
    }
  }, [isOpen]);

  // 2. CARGAR HISTORIAL AL SELECCIONAR UN ALUMNO
  useEffect(() => {
    if (alumnoSeleccionado) {
      cargarHistorial(alumnoSeleccionado.id);
    } else {
      setAlumnoSeleccionado(null);
      setHistorialSeleccionado([]);
    }
  }, [alumnoSeleccionado]);

  // --- PETICIONES API ---
  const cargarHistorial = async (idAlumno) => {
    setLoadingHistorial(true);
    try {
      // GET /pilates/historial-contactos/:id
      const response = await axios.get(
        `${API_BASE_URL}/pilates/historial-contactos/${idAlumno}`
      );
      setHistorialSeleccionado(response.data);
    } catch (err) {
      console.error('Error cargando historial:', err);
      alert('Error al cargar el historial del alumno.');
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Guardar nueva observación
  const handleGuardarObservacion = async () => {
    if (!nuevaObservacion.trim()) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campo vacío',
        text: 'Por favor, escribe una observación antes de guardar.',
        confirmButtonColor: '#3085d6'
      });
    }

    // 1. Pregunta de confirmación
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se agregará esta observación al historial de contacto del alumno.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6', // Azul acorde a tu UI
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar contacto',
      cancelButtonText: 'Cancelar'
    });

    // Si el usuario confirma, procedemos con el POST
    if (result.isConfirmed) {
      try {
        await axios.post(`${API_BASE_URL}/pilates/historial-contactos`, {
          id_cliente: Number(alumnoSeleccionado.id),
          id_usuario: Number(userId),
          observacion: nuevaObservacion.trim().toUpperCase(),
          contacto_realizado: String(alumnoSeleccionado.racha_actual)
        });

        // 2. Mensaje de éxito
        await Swal.fire({
          icon: 'success',
          title: '¡Guardado!',
          text: 'La observación se ha guardado exitosamente.',
          timer: 2000,
          showConfirmButton: false
        });

        setNuevaObservacion('');
        await cargarHistorial(alumnoSeleccionado.id);
        refetchAusentesData();
      } catch (err) {
        console.error('Error guardando:', err);

        // 3. Mensaje de error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar la observación. Inténtalo de nuevo.'
        });
      }
    }
  };

  // --- LÓGICA DE FILTRADO ---
  const alumnosFiltrados = ausentesData.filter((alumno) => {
    const texto = busqueda.toLowerCase();
    const coincideTexto =
      alumno.nombre?.toLowerCase().includes(texto) ||
      alumno.telefono?.toLowerCase().includes(texto);
    const coincideEstado =
      filtroEstado === 'TODOS' || alumno.estado_visual === filtroEstado;
    return coincideTexto && coincideEstado;
  }); // El backend ya los devuelve ordenados (Rojos primero)

  // --- PAGINACIÓN ---
  const totalPaginas = Math.ceil(alumnosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceUltimoItem = paginaActual * ITEMS_POR_PAGINA;
  const indicePrimerItem = indiceUltimoItem - ITEMS_POR_PAGINA;
  const alumnosPaginados = alumnosFiltrados.slice(
    indicePrimerItem,
    indiceUltimoItem
  );

  const cambiarPagina = (n) => {
    if (n >= 1 && n <= totalPaginas) setPaginaActual(n);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white w-full max-w-7xl h-[98vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
        {/* HEADER */}
        <div className="bg-white px-6 py-4 border-b flex justify-between items-center shrink-0 shadow-sm z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight font-bignoodle">
              {alumnoSeleccionado
                ? 'FICHA DE SEGUIMIENTO'
                : 'AUSENTES POR CLASES'}
            </h2>
            <p className="text-sm text-gray-500">
              {alumnoSeleccionado
                ? `Gestionando a: ${alumnoSeleccionado.nombre}`
                : 'Alumnos con 2 o más inasistencias'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 overflow-hidden bg-gray-50 relative">
          {isLoadingAusentesData && !ausentesData.length ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : errorAusentesData ? (
            <div className="flex items-center justify-center h-full text-red-600 font-medium">
              {'Se produjo un error al cargar los datos'}
            </div>
          ) : !alumnoSeleccionado ? (
            // =========================
            // VISTA 1: LISTADO (TABLA)
            // =========================
            <div className="h-full flex flex-col p-6">
              {/* FILTROS */}
              <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto flex-1">
                  <input
                    type="text"
                    className="block w-full max-w-md pl-4 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder="Buscar por nombre o teléfono..."
                    value={busqueda}
                    onChange={(e) => {
                      setBusqueda(e.target.value);
                      setPaginaActual(1);
                    }}
                  />
                  {/* <div className="flex gap-2">
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded shadow-sm text-xs transition transform hover:scale-105 uppercase tracking-wide">
                      Todos
                    </button>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded shadow-sm text-xs transition transform hover:scale-105 uppercase tracking-wide">
                      🔴 No contactados
                    </button>
                    <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded shadow-sm text-xs transition transform hover:scale-105 uppercase tracking-wide">
                      🟢 Contactados
                    </button>
                  </div> */}

                  <select
                    className="block w-full sm:w-48 pl-3 pr-8 py-2 border-gray-300 rounded-lg border bg-white focus:outline-none"
                    value={filtroEstado}
                    onChange={(e) => {
                      setFiltroEstado(e.target.value);
                      setPaginaActual(1);
                    }}
                  >
                    <option value="TODOS">Todos los Estados</option>
                    <option value="ROJO">🔴 No contactados</option>
                    <option value="VERDE">🟢 Contactados</option>
                  </select>
                </div>
                <div className="text-sm text-gray-500 font-medium whitespace-nowrap">
                  Mostrando{' '}
                  <span className="font-bold text-gray-900">
                    {alumnosPaginados.length}
                  </span>{' '}
                  de{' '}
                  <span className="font-bold text-gray-900">
                    {alumnosFiltrados.length}
                  </span>
                </div>
              </div>

              {/* TABLA */}
              <div className="flex-1 overflow-auto bg-white rounded-lg shadow border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Alumno.
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Ausencias
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alumnosPaginados.length > 0 ? (
                      alumnosPaginados.map((alumno) => (
                        <tr
                          key={alumno.id}
                          className={`hover:bg-opacity-80 transition duration-150 ${
                            alumno.estado_visual === 'ROJO'
                              ? 'bg-red-50'
                              : 'bg-green-50'
                          }`}
                          onClick={() => setAlumnoSeleccionado(alumno)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">
                                {alumno.nombre}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {alumno.telefono}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-300 shadow-sm text-gray-700">
                              {alumno.racha_actual} clases
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {alumno.estado_visual === 'ROJO' ? (
                              <span className="inline-flex px-3 py-1 text-xs font-bold leading-5 text-red-800 bg-red-200 rounded-full border border-red-300 shadow-sm">
                                No contactados
                              </span>
                            ) : (
                              <span className="inline-flex px-3 py-1 text-xs font-bold leading-5 text-green-800 bg-green-200 rounded-full border border-green-300 shadow-sm">
                                Contactados
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col items-center gap-2">
                              {alumno.estado_visual === 'ROJO' ? (
                                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-4 rounded shadow-sm text-xs transition transform hover:scale-105 uppercase tracking-wide">
                                  Contactar
                                </button>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-green-700 font-bold text-xs flex items-center gap-1 mb-1 bg-white px-2 py-0.5 rounded border border-green-200">
                                    ✔ Contactado
                                  </span>
                                  <button className="text-[11px] text-blue-600 hover:underline font-medium">
                                    Ver Observación
                                  </button>
                                </div>
                              )}
                              <span className="text-[10px] text-gray-500 mt-1">
                                Contactos:{' '}
                                <strong className="text-gray-800">
                                  {alumno.total_contactos}
                                </strong>
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          No se encontraron alumnos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}
              {alumnosFiltrados.length > ITEMS_POR_PAGINA && (
                <div className="mt-4 flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <button
                    onClick={() => cambiarPagina(paginaActual - 1)}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-700">
                    Página <span className="font-bold">{paginaActual}</span> de{' '}
                    <span className="font-bold">{totalPaginas}</span>
                  </span>
                  <button
                    onClick={() => cambiarPagina(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          ) : (
            // =========================
            // VISTA 2: DETALLE (MODAL)
            // =========================
            <div className="h-full flex flex-col p-6 animate-fadeIn bg-gray-50">
              <button
                onClick={() => setAlumnoSeleccionado(null)}
                className="mb-4 flex items-center text-gray-600 hover:text-blue-600 transition font-medium w-fit"
              >
                ← Volver
              </button>

              <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
                {/* INFO IZQUIERDA */}
                <div className="lg:w-1/3 bg-white p-6 rounded-xl border border-gray-200 shadow-md h-fit">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white shadow-sm text-orange-600 text-3xl font-bignoodle">
                      {alumnoSeleccionado.nombre.charAt(0)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                      {alumnoSeleccionado.nombre}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      ID: #{alumnoSeleccionado.id}
                    </p>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-medium text-gray-900">
                        {alumnoSeleccionado.telefono}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Faltas:</span>
                      <span className="font-bold text-red-500">
                        {alumnoSeleccionado.racha_actual}
                      </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Total Contactos:</span>
                      <span className="font-bold text-blue-600">
                        {historialSeleccionado.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">
                      Observación del Cliente
                    </h4>
                    <p className="text-sm text-orange-900 italic">
                      "
                      {alumnoSeleccionado.observaciones_cliente ||
                        'Sin observaciones.'}
                      "
                    </p>
                  </div>
                </div>

                {/* HISTORIAL DERECHA */}
                <div className="lg:w-2/3 flex flex-col gap-4 h-full">
                  <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 overflow-y-auto shadow-sm">
                    <h4 className="text-lg font-bold text-orange-600 uppercase mb-4 border-b pb-2 font-bignoodle">
                      Historial de observaciones
                    </h4>

                    {loadingHistorial ? (
                      <div className="flex justify-center py-10">
                        <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full"></div>
                      </div>
                    ) : historialSeleccionado.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">
                        <p>No hay registros previos.</p>
                      </div>
                    ) : (
                      <ul className="space-y-6 ml-2">
                        {historialSeleccionado.map((item) => (
                          <li
                            key={item.id}
                            className="relative pl-8 border-l-2 border-gray-200"
                          >
                            <div className="absolute -left-[9px] top-0 w-4 h-4 bg-white rounded-full border-4 border-blue-500"></div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-1">
                              <div>
                                <span className="text-md font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded w-fit font-bignoodle">
                                  {/* Línea modificada con date-fns */}
                                  {format(
                                    new Date(item.fecha_contacto),
                                    'dd/MM/yyyy HH:mm',
                                    { locale: es }
                                  )}
                                </span>
                                {item.contacto_realizado && (
                                  <span className="text-md font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded w-fit ml-5 font-bignoodle">
                                    {`Inasistencias al momento: ${item.contacto_realizado}`}
                                  </span>
                                )}
                              </div>

                              <span className="text-xs text-gray-400">
                                Contactado por:{' '}
                                {item.usuario?.name || 'Desconocido'}{' '}
                                {item.usuario?.apellido}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 shadow-sm mt-1">
                              "{item.observacion}"
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* NUEVA NOTA */}
                  <div className="bg-white border border-gray-200 rounded-xl p-2 shadow-md mt-auto">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Registrar Nuevo Contacto
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
                      rows="2"
                      placeholder="Escribe el resultado..."
                      value={nuevaObservacion}
                      onChange={(e) => setNuevaObservacion(e.target.value)}
                      maxLength={255}
                    ></textarea>
                    <div className="flex justify-end mt-4 gap-3">
                      <button
                        onClick={() => setAlumnoSeleccionado(null)}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleGuardarObservacion}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg shadow-md text-sm"
                      >
                        Guardar contacto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-6 py-3 border-t flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-red-50 shadow-sm transition"
          >
            CERRAR VENTANA
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleAusentes;
