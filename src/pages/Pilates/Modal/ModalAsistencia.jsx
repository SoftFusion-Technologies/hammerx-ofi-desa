import React, { useState } from 'react';
import { FaEdit, FaChevronLeft, FaPaperPlane } from 'react-icons/fa';

const ModalAsistencia = ({ isOpen, onClose, cellData, cambiarAsistencia, cambiarObservaciones, agregarQuejas }) => {
    // 1. Estados
    const [view, setView] = useState('main'); // 'main' | 'register_queja' | 'edit_observation'
    const [quejaText, setQuejaText] = useState('');
    const [observationText, setObservationText] = useState(cellData.student?.observation || '');
    const [observationTextAux, setObservationTextAux] = useState(cellData.student?.observation || '');

    // 2. Función de control
    const goBackToMain = () => setView('main');

    // 3. Guardrail (no mostrar si está cerrado o no hay datos)
    if (!isOpen) return null;

    if (!cellData.student) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
                    <p className="text-gray-600">No hay información del estudiante</p>
                    <button onClick={onClose} className="mt-4 px-5 py-2 text-gray-600 hover:text-gray-800 font-medium">Cerrar</button>
                </div>
            </div>
        );
    }

    // 4. Renderizado principal con lógica ternaria para toda la estructura
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">

                {/* ---------------------------------------------------------------------------------- */}
                {/* VISTA: REGISTRO DE QUEJAS */}
                {/* ---------------------------------------------------------------------------------- */}
                {view === 'register_queja' ? (
                    <>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
                            <button
                                onClick={goBackToMain}
                                className="text-white hover:text-gray-200 transition mb-2 flex items-center gap-1 text-sm"
                            >
                                <FaChevronLeft /> Volver
                            </button>
                            <h2 className="text-2xl font-bold">Nueva Queja / Comentario</h2>
                            <p className="text-blue-100 mt-1">
                                Alumno: {cellData.student.name}
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Detalle de la Queja/Comentario
                            </label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={6}
                                placeholder="Describe la queja o el comentario sobre el alumno aquí..."
                                value={quejaText}
                                onChange={(e) => setQuejaText(e.target.value)}
                                maxLength={200}
                            />
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => agregarQuejas(cellData.student, quejaText)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                                >
                                    <FaPaperPlane /> Enviar Queja
                                </button>
                            </div>
                        </div>
                    </>
                ) : view === 'edit_observation' ? (

                    /* ---------------------------------------------------------------------------------- */
                    /* VISTA: EDICIÓN DE OBSERVACIONES */
                    /* ---------------------------------------------------------------------------------- */
                    <>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
                            <button
                                onClick={goBackToMain}
                                className="text-white hover:text-gray-200 transition mb-2 flex items-center gap-1 text-sm"
                            >
                                <FaChevronLeft /> Volver
                            </button>
                            <h2 className="text-2xl font-bold">Editar Observaciones</h2>
                            <p className="text-blue-100 mt-1">
                                Alumno: {cellData.student.name}
                            </p>
                        </div>
                        <div className="p-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Observaciones
                            </label>
                            <textarea
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                                rows={6}
                                placeholder="Escribe las nuevas observaciones aquí..."
                                value={observationTextAux}
                                onChange={(e) => setObservationTextAux(e.target.value.toUpperCase())}
                            />
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => cambiarObservaciones(cellData.student.id, observationTextAux, observationText)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                                >
                                    <FaEdit /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    /* ---------------------------------------------------------------------------------- */
                    /* VISTA: PRINCIPAL (main) */
                    /* ---------------------------------------------------------------------------------- */
                    <>
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
                            <h2 className="text-2xl font-bold">Registrar Asistencia</h2>
                            <p className="text-blue-100 mt-1">Confirmar presencia del alumno</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {/* Sección de Datos del Alumno */}
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center mb-3">
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                {cellData.student.name}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {cellData.day} - {cellData.time}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-gray-500 font-medium">Estado</p>
                                            <p className="font-semibold text-gray-800 capitalize">
                                                {cellData.student.status === 'plan' ? 'Plan Activo' : cellData.student.status === 'prueba' ? 'Clase Prueba' : 'Renovación'}
                                            </p>
                                        </div>
                                        <div className="bg-green-50 p-3 rounded-lg">
                                            <p className="text-gray-500 font-medium">Grupo</p>
                                            <p className="font-semibold text-gray-800">
                                                {cellData.student.planDetails?.type || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Observaciones del alumno */}
                                <div className="mt-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="block text-gray-700 text-sm font-bold">Observaciones</label>
                                        <button
                                            onClick={() => setView('edit_observation')}
                                            className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-800 transition"
                                            title="Editar Observaciones"
                                        >
                                            <FaEdit /> Editar
                                        </button>
                                    </div>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100 resize-none"
                                        value={observationText || ''}
                                        readOnly
                                        rows={3}
                                        placeholder="Sin observaciones registradas"
                                    />
                                </div>

                                {/* Sección de Quejas (Botón para navegar) */}
                                <div className="mt-4 pt-2 border-t border-gray-100">
                                    <h4 className="block text-gray-700 text-sm font-bold mb-3">Quejas / Comentarios</h4>
                                    <button
                                        onClick={() => setView('register_queja')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
                                    >
                                        Registrar Queja / Comentario
                                    </button>
                                </div>

                                {/* Botones de Asistencia */}
                                <div className="flex flex-col gap-3 pt-4">
                                    {cellData.estadoAsistencia === 'ausente' ? (
                                        <button
                                            onClick={() => cambiarAsistencia(cellData.student.id, true)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                            CONFIRMAR ASISTENCIA
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => cambiarAsistencia(cellData.student.id, false)}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                            QUITAR ASISTENCIA
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ModalAsistencia;