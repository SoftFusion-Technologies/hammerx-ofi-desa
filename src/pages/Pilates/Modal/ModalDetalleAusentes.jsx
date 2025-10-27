import React, { useEffect, useState } from "react";

/**
 * ModalDetalleAusentes
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - alumnos: Array<{ id, name, cantidad, contacto, contactado: "SI"|"NO", fecha_ultimo_contacto?: string }>
 * - onContact: ({ id, name, contacto }) => void
 * - onRecontact: (id) => void
 */
const ContactarContenido = ({ onClose, onBack, selectedAlumno, onContact }) => {
  return (
    <div className="p-5 overflow-y-auto min-h-0 flex-1">
      {/* Top actions */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold"
        >
          Volver a la lista
        </button>
      </div>

      {/* Selected alumno details */}
      <section className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h2 className="text-lg font-bold text-orange-800 mb-2">Contacto seleccionado</h2>
        {selectedAlumno ? (
          <div className="space-y-1 text-sm md:text-2xl">
            <div className="text-gray-800"><span className="font-semibold">Alumno:</span> {selectedAlumno.name}</div>
            <div className="text-gray-800"><span className="font-semibold">Contacto:</span> {selectedAlumno.contacto ?? "-"}</div>
            {/* ID no visible al usuario, pero disponible para la acción */}
          </div>
        ) : (
          <div className="text-gray-500 italic">No hay alumno seleccionado</div>
        )}

        <div className="mt-4">
          <button
            disabled={!selectedAlumno}
            onClick={() => onContact(selectedAlumno.id, selectedAlumno.name, selectedAlumno.contacto)}
            className="px-4 py-2 rounded-md bg-orange-600 hover:bg-orange-700 disabled:bg-orange-300 text-white font-semibold"
          >
            YA LO CONTACTÉ
          </button>
        </div>
      </section>

      {/* Footer actions */}
      <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md text-gray-700 bg-gray-400 hover:bg-gray-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

const ModalDetalleAusentes = ({
  isOpen,
  onClose,
  alumnos = [],
  onContact = () => {},
  contactarAlumno,
  setcontactarAlumno
}) => {
  if (!isOpen) return null;
  const [selectedAlumno, setSelectedAlumno] = useState(null);

  // Separar alumnos en contactados / no contactados
  const contactados = alumnos.filter((a) => a.contactado === "SI");
  const noContactados = alumnos.filter((a) => a.contactado === "NO");


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[calc(100vh-8rem)] flex flex-col overflow-hidden my-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5">
          <div className="flex items-center justify-between">
            <div>
              {(() => {
                const meses = [
                  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
                ];
                const mesActual = meses[new Date().getMonth()];
                return (
                  <h2 className="text-2xl font-bold">Alumnos Ausentes en {mesActual} - Detalle</h2>
                );
              })()}
            </div>
            <div>
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-md font-medium"
                aria-label="Cerrar detalle de ausentes"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        {contactarAlumno ? (
          <ContactarContenido
            onClose={onClose}
            onBack={() => setcontactarAlumno(false)}
            selectedAlumno={selectedAlumno}
            onContact={onContact}
          />
        ) : (
          <div className="p-5 overflow-y-auto min-h-0 flex-1">
            <div className="mb-4 text-gray-700 font-semibold">
              Total ausentes:{" "}
              <span className="font-bold">{alumnos.length}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conectados */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Contactados</h3>
                  <span className="text-sm text-gray-500">
                    {contactados.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {contactados.length > 0 ? (
                    contactados.map((al) => (
                      <div
                        key={al.id}
                        className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {al.name ? al.name.charAt(0) : "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {al.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Contacto previo: {al.fecha_ultimo_contacto || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              Contactado por: {al.contacto_nombre || "-"}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No hay alumnos contactados
                    </div>
                  )}
                </div>
              </section>

              {/* No contactados */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">No contactados</h3>
                  <span className="text-sm text-gray-500">
                    {noContactados.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {noContactados.length > 0 ? (
                    noContactados.map((al) => (
                      <div
                        key={al.id}
                        className="flex items-center justify-between bg-yellow-50 border border-yellow-100 rounded-lg p-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-900 font-bold">
                            {al.name ? al.name.charAt(0) : "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-gray-800 truncate">
                              {al.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Último contacto:{" "}
                              {al.fecha_ultimo_contacto || "Sin contacto"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedAlumno({ id: al.id, name: al.name, contacto: al.contacto });
                              setcontactarAlumno(true);
                            }}
                            className="text-sm bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-3 py-1 rounded-md shadow-sm"
                          >
                            Contactar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      No hay alumnos sin contacto
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Footer actions */}
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalDetalleAusentes;
