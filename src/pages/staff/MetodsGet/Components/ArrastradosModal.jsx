/**
 * Modal de Alumnos Arrastrados
 * --------------------------------
 * Este modal muestra la lista de alumnos "arrastrados" del mes anterior que aún no han sido tratados en remarketing.
 * Permite visualizar rápidamente los datos clave de cada alumno y acceder a la gestión de ventas para cada uno.
 * Su finalidad es ayudar a los asesores a no perder de vista prospectos pendientes y facilitar su seguimiento.
 */

// =======================================================
//  HECHO POR SERGIO MANRIQUE, FECHA: 12/01/2026
// =======================================================


import React, { useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { useNavigate } from "react-router-dom";

dayjs.locale("es");

const PendientesSemanaModal = ({ alumnos = [] }) => {
    const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const abrirModal = () => {
    if (alumnos.length === 0) {
      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          icon: 'info',
          title: 'Sin alumnos para tratar',
          text: 'No hay alumnos del mes anterior para tratar.',
          confirmButtonColor: '#f97316', // Tailwind orange-500
          confirmButtonText: 'OK',
        });
      });
      return;
    }
    setIsOpen(true);
  };

  const irAVentas = (alumnoId) => {
    setIsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    navigate(`/dashboard/ventas`);
  };

  return (
    <>
      <button
        onClick={abrirModal}
        className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-5 rounded-lg font-semibold shadow transition-colors duration-100 focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        title={`${alumnos.length} pendientes última semana`}
      >
        <span>📨</span>
        <span className="inline">
          Pendientes Última Semana ({alumnos.length})
        </span>
      </button>

      {/* Modal de Tailwind */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-full h-[95vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex justify-between items-center border-b border-orange-700">
              <h2 className="text-xl font-bold text-white">
                📋 Pendientes Última Semana ({alumnos.length})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-orange-700 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Nota para el usuario de gestión */}
            <div className="bg-orange-100 border-l-4 border-orange-400 text-orange-900 px-4 py-2 text-sm mb-2 flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span>
                <b>IMPORTANTE:</b> Este listado muestra <b>los prospectos que NO se convirtieron en la última semana del mes anterior</b> y siguen pendientes de gestión.<br />
                <b>¿Qué tenés que hacer?</b><br />
                <ul className="list-disc pl-5 mt-1">
                  <li>Contactá a cada uno de estos prospectos para intentar cerrar la venta.</li>
                  <li><b>¡Todo lo que hagas (contacto, conversión, baja, etc.) debe registrarse exclusivamente en la sección de Ventas!</b></li>
                </ul>
                <b>Acceso rápido:</b> Usá el botón <span className="bg-orange-200 px-2 py-0.5 rounded font-bold">→ Ir a Ventas</span> para ir directo a la ficha de ventas de cada prospecto y registrar la gestión.<br />
                <span className="text-orange-700 font-semibold">Si no gestionás el prospecto en Ventas, el mes que viene pasará automáticamente a Remarketing </span>
              </span>
            </div>
            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-4">
              <div className="space-y-2">
                {alumnos.map((alumno) => (
                  <div
                    key={alumno.id}
                    className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-orange-500 p-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col gap-2 w-full">
                      {/* Responsive row: scroll horizontal en mobile, columnas en desktop */}
                      <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 overflow-x-auto w-full">
                        {/* Columna 1: Nombre, ID, Tipo */}
                        <div className="min-w-[180px] flex flex-col gap-0.5">
                          <p className="font-bold text-sm text-gray-900 break-words">
                            {alumno.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: #{alumno.id} | {alumno.tipo_prospecto || "---"}
                          </p>
                        </div>

                        {/* Columna 2: Contacto e Info básica */}
                        <div className="flex flex-wrap gap-2 text-xs min-w-[180px]">
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">📱</span>
                            <span className="font-medium break-all">
                              {alumno.contacto || "---"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">🆔</span>
                            <span className="font-medium">{alumno.dni || "---"}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">📢</span>
                            <span className="font-medium">
                              {alumno.canal_contacto || "---"}
                            </span>
                          </div>
                        </div>

                        {/* Columna 3: Actividad, Sede, Asesor, Fecha */}
                        <div className="flex flex-wrap gap-2 text-xs min-w-[220px]">
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">🏋️</span>
                            <span className="font-medium">{alumno.actividad}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">📍</span>
                            <span className="font-medium">{alumno.sede?.toUpperCase() || "---"}</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">👤</span>
                            <span className="font-medium">
                              {alumno.asesor_nombre}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-white bg-opacity-60 px-2 py-1 rounded border border-orange-200">
                            <span className="text-orange-600 font-bold">📅</span>
                            <span className="font-medium">
                              {dayjs(alumno.fecha).format("DD/MM/YYYY")}
                            </span>
                          </div>
                        </div>

                        {/* Columna 4: Estados */}
                        <div className="flex flex-wrap gap-2 text-xs min-w-[220px]">
                          {/* Contactado */}
                          <span
                            className={`inline-flex items-center px-2 py-1 ${
                              alumno.n_contacto_1
                                ? "bg-green-500"
                                : "bg-red-500"
                            } text-white font-bold rounded-full whitespace-nowrap text-xs`}
                          >
                            {alumno.n_contacto_1
                              ? "✓ Contactado"
                              : "✗ No contactado"}
                          </span>

                          {/* Contactos */}
                          <div className="flex items-center gap-0.5 bg-white bg-opacity-60 px-1.5 py-1 rounded border border-orange-200">
                            <span className="font-bold text-xs">☎️</span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.n_contacto_1
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #1
                            </span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.n_contacto_2
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #2
                            </span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.n_contacto_3
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #3
                            </span>
                          </div>

                          {/* Clases */}
                          <div className="flex items-center gap-0.5 bg-white bg-opacity-60 px-1.5 py-1 rounded border border-orange-200">
                            <span className="font-bold text-xs">👥</span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.clase_prueba_1_fecha
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #1
                            </span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.clase_prueba_2_fecha
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #2
                            </span>
                            <span
                              className={`px-1 py-0 ${
                                alumno.clase_prueba_3_fecha
                                  ? "bg-orange-300 text-orange-900"
                                  : "bg-gray-200"
                              } rounded font-bold text-xs`}
                            >
                              #3
                            </span>
                          </div>
                        </div>

                        {/* Columna 5: Botón */}
                        <div className="min-w-[120px] flex items-center md:justify-end flex-1">
                          <button
                            onClick={() => irAVentas(alumno.id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1.5 px-3 rounded-lg transition-colors text-xs whitespace-nowrap shadow-md w-full md:w-auto"
                          >
                            → Ir a Ventas
                          </button>
                        </div>
                      </div>

                      {/* Observaciones si existen (segunda línea) */}
                      {alumno.observacion && (
                        <div className="bg-orange-50 border-l-2 border-orange-400 px-2 py-1 rounded mt-1 text-xs">
                          <p className="text-orange-700 font-bold inline">
                            📝 OBS:
                          </p>
                          <p className="text-orange-900 inline ml-1">
                            {alumno.observacion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-orange-50 px-6 py-4 flex justify-end border-t border-orange-300">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PendientesSemanaModal;
