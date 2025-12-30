import React from "react";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaUser,
  FaEdit,
  FaTrash,
  FaSave,
} from "react-icons/fa";

const AyudaAusentes = ({ onCerrar }) => {
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-orange-50 to-amber-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* INTRODUCCIÓN */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border-l-4 border-orange-500">
          <h3 className="text-lg font-bold text-orange-600 mb-2 flex items-center gap-2">
            👋 ¡Bienvenido a la Guía de Alumnos Ausentes!
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Esta ventana te ayuda a <strong>ver y contactar</strong> a los
            alumnos que han faltado a 2 o más clases. Aquí podrás buscarlos,
            filtrarlos y registrar cada vez que los contactes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PASO 1: BUSCAR */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaSearch className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                1. Buscar un Alumno
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Usa la <strong>cajita blanca</strong> superior.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded p-2 mb-2">
                <ul className="list-disc ml-4 text-gray-600 text-xs space-y-1">
                  <li>Haz clic en la cajita</li>
                  <li>Escribe nombre o teléfono</li>
                  <li>La lista se filtra sola</li>
                </ul>
              </div>
            </div>
          </div>

          {/* PASO 2: FILTROS */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaFilter className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                2. Filtrar por Estado
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Usa los <strong>3 botones de colores</strong>:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🟠</span>
                  <span className="text-xs text-gray-600">
                    <strong>Todos:</strong> Sin filtro.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔴</span>
                  <span className="text-xs text-gray-600">
                    <strong>No contactados:</strong> ¡Prioridad!
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">🟢</span>
                  <span className="text-xs text-gray-600">
                    <strong>Contactados:</strong> Ya gestionados.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 3: AVANZADO */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaFilter className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                3. Filtro Avanzado
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Menú desplegable para búsquedas específicas:
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>
                  ❌ <strong>Sin contacto:</strong> Nunca contactados.
                </li>
                <li>
                  ✅ <strong>Con contacto:</strong> Al menos una vez.
                </li>
                <li>
                  ⏰ <strong>+15 días:</strong> Contacto antiguo.
                </li>
                <li>
                  🕐 <strong>-15 días:</strong> Contacto reciente.
                </li>
              </ul>
            </div>
          </div>

          {/* PASO 4: ORDENAR */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaSort className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                4. Ordenar Lista
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Cambia el orden de visualización:
              </p>
              <ul className="space-y-1 text-gray-600 text-xs">
                <li>
                  📌 <strong>Defecto:</strong> Rojos primero.
                </li>
                <li>
                  ⬇️ <strong>Más faltas:</strong> Mayor inasistencia arriba.
                </li>
                <li>
                  ⬆️ <strong>Menos faltas:</strong> Menor inasistencia arriba.
                </li>
              </ul>
            </div>
          </div>

          {/* PASO 5: TABLA */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaUser className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">5. La Tabla</h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Muestra Nombre, Teléfono, Faltas y Estado.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded p-2">
                <p className="text-blue-800 text-xs font-bold">
                  🖱️ ¡Haz clic en la fila para ver la ficha!
                </p>
              </div>
            </div>
          </div>

          {/* PASO 6: FICHA */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaEdit className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                6. Ficha del Alumno
              </h4>
            </div>
            <div className="pl-10">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>
                  <strong>👤 Izquierda:</strong>
                  <ul className="list-disc ml-3">
                    <li>Datos personales</li>
                    <li>Total faltas</li>
                    <li>Observaciones cliente</li>
                  </ul>
                </div>
                <div>
                  <strong>📝 Derecha:</strong>
                  <ul className="list-disc ml-3">
                    <li>Historial de contactos</li>
                    <li>Qué se habló</li>
                    <li>Quién llamó</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* PASO 7: REGISTRAR */}
          <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <FaSave className="text-orange-600 text-sm" />
              </div>
              <h4 className="text-base font-bold text-gray-800">
                7. Registrar Contacto
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Escribe qué pasó en la caja de texto inferior y pulsa{" "}
                <strong>"Guardar contacto"</strong>.
              </p>
              <div className="flex gap-4 text-xs text-gray-500 italic">
                <span>Ej: "No contestó"</span>
                <span>Ej: "Vuelve la próxima semana"</span>
                <span>Ej: "De viaje"</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONSEJOS FINALES */}
        <div className="bg-orange-500 rounded-xl shadow-sm p-4 mt-4 text-white">
          <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
            💡 Consejos Rápidos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>
                🎯 Prioriza alumnos en <strong>ROJO</strong>.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝 Sé claro en las observaciones.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔄 Actualiza la ventana seguido.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✖️ Usa la X o "Volver" para salir.</span>
            </div>
          </div>
        </div>

        {/* BOTÓN PARA CERRAR AYUDA */}
        <div className="flex justify-center mt-6">
          <button
            onClick={onCerrar}
            className="bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 font-bold py-2 px-6 rounded-lg shadow-sm text-sm transition transform hover:scale-105"
          >
            Volver al Formulario
          </button>
        </div>
      </div>
    </div>
  );
};

export default AyudaAusentes;
