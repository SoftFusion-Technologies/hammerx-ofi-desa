import React from "react";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaUser,
  FaEdit,
  FaSave,
  FaClock,
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
                2. ¿Qué significan los colores?
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-2">
                Usa los botones superiores para filtrar por color:
              </p>
              <div className="space-y-2 bg-gray-50 p-2 rounded border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔴</span>
                  <span className="text-xs text-gray-700">
                    <strong>Rojo (Urgente):</strong> Nunca se contactó, o volvió a faltar mucho.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🟡</span>
                  <span className="text-xs text-gray-700">
                    <strong>Amarillo (Esperando):</strong> Le mandaste mensaje y estás esperando que responda.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🟢</span>
                  <span className="text-xs text-gray-700">
                    <strong>Verde (Ok):</strong> Ya fue contactado recientemente.
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
                  ❌ <strong>Sin contacto:</strong> Nunca contactados (Rojos).
                </li>
                <li>
                  ⌛ <strong>Esperando respuesta:</strong> Alumnos marcados en Amarillo.
                </li>
                <li>
                  ✅ <strong>Con contacto:</strong> Historial existente.
                </li>
                <li>
                  ⏰ <strong>+15 días:</strong> Contacto muy viejo (Pasan a Rojo).
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
                  📌 <strong>Defecto:</strong> Prioridad a los Rojos.
                </li>
                <li>
                  ⬇️ <strong>Más faltas:</strong> Los que más faltaron arriba.
                </li>
                <li>
                  ⬆️ <strong>Menos faltas:</strong> Los que menos faltaron arriba.
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
                Muestra Nombre, Teléfono, Faltas y Estado actual.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded p-2">
                <p className="text-blue-800 text-xs font-bold">
                  🖱️ ¡Haz clic en cualquier fila para abrir la ficha!
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
              <div className="text-xs text-gray-600 space-y-2">
                <p>Al abrir un alumno verás dos partes:</p>
                <ul className="list-disc ml-3">
                  <li><strong>Izquierda:</strong> Datos del alumno y observación que dejó recepción.</li>
                  <li><strong>Derecha:</strong> El historial de todo lo que se habló con él.</li>
                </ul>
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
                7. Registrar una Acción (IMPORTANTE)
              </h4>
            </div>
            <div className="pl-10">
              <p className="text-gray-600 text-xs mb-3">
                Tienes dos botones para guardar, úsalos según corresponda:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OPCION A */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2 font-bold text-orange-700 text-sm">
                    <span className="bg-orange-600 text-white rounded px-1.5 py-0.5 text-xs">A</span>
                    Guardar Contacto
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Úsalo cuando <strong>tuviste una respuesta</strong> o una novedad concreta.
                  </p>
                  <ul className="text-[11px] text-gray-500 list-disc ml-4 italic">
                    <li>"Dijo que viene mañana"</li>
                    <li>"Está de viaje"</li>
                    <li>"Está enfermo"</li>
                  </ul>
                  <div className="mt-2 text-[10px] text-orange-800 font-bold">
                    👉 Debes escribir algo en la caja de texto.
                  </div>
                </div>

                {/* OPCION B */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2 font-bold text-yellow-700 text-sm">
                    <FaClock/> 
                    Marcar Esperando
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Úsalo cuando <strong>le enviaste mensaje</strong> pero aún no contestó.
                  </p>
                  <ul className="text-[11px] text-gray-500 list-disc ml-4 italic">
                    <li>Le mandaste WhatsApp</li>
                    <li>Lo llamaste y no atendió</li>
                  </ul>
                  <div className="mt-2 text-[10px] text-yellow-800 font-bold">
                    👉 No hace falta escribir nada. El alumno se pintará de AMARILLO.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONSEJOS FINALES */}
        <div className="bg-orange-500 rounded-xl shadow-sm p-4 mt-4 text-white">
          <h4 className="text-lg font-bold mb-2 flex items-center gap-2">
            💡 Resumen Rápido
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span>
                🔴 <strong>Rojos:</strong> Atender primero (Urgente).
              </span>
            </div>
             <div className="flex items-center gap-2">
              <span>
                🟡 <strong>Amarillos:</strong> Revisar si ya contestaron.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>📝 Escribe claro para que todos entiendan.</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔄 Si ya contestó el "Esperando", edítalo o crea uno nuevo.</span>
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