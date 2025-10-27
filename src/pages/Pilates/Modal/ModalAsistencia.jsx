const ModalAsistencia = ({ isOpen, onClose, cellData, cambiarAsistencia }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold">Registrar Asistencia</h2>
          <p className="text-blue-100 mt-1">Confirmar presencia del alumno</p>
        </div>

        <div className="p-6">
          {cellData.student ? (
            <div className="space-y-4">
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
                      {cellData.student.status === "plan"
                        ? "Plan Activo"
                        : cellData.student.status === "prueba"
                        ? "Clase Prueba"
                        : "Renovación"}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-gray-500 font-medium">Grupo</p>
                    <p className="font-semibold text-gray-800">
                      {cellData.student.planDetails?.type || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observaciones del alumno (solo lectura) */}
              <div className="mt-2">
                <label className="block text-gray-700 text-sm font-bold mb-1">Observaciones</label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-gray-100"
                  value={cellData.student.observation || ""}
                  readOnly
                  rows={3}
                  placeholder="Sin observaciones registradas"
                />
              </div>

              {/* Textarea para quejas (sin funcionalidad aún) */}
              <div className="mt-2">
                <label className="block text-gray-700 text-sm font-bold mb-1">Quejas / Comentarios</label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                  rows={3}
                  placeholder="Escribe aquí una queja, comentario o sugerencia sobre el alumno..."
                />
              </div>

              <div className="flex flex-col gap-3 pt-4">
                {cellData.estadoAsistencia === "ausente" ? (
                  <button
                    onClick={() => cambiarAsistencia(cellData.student.id, true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    CONFIRMAR ASISTENCIA
                  </button>
                ) : (
                  <button
                    onClick={() => cambiarAsistencia(cellData.student.id, false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center justify-center"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      ></path>
                    </svg>
                    QUITAR ASISTENCIA
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
              </div>
              <p className="text-gray-600">No hay información del estudiante</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-lg transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalAsistencia;
