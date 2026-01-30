/*
 * Programador: Sergio Manrique
 * Fecha Creación: 2026-01-30
 * Versión: 1.0
 *
 * Descripción:
 * Modal que explica el flujo de trabajo de remarketing y ventas.
 */

import React from 'react';
import { X } from 'lucide-react';

const InstructivoModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex items-center justify-between border-b">
          <h2 className="text-2xl font-bold font-bignoodle">📋 Instructivo de Remarketing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 font-messina">
          {/* Sección 1: Qué es Remarketing */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              ¿Qué es el Remarketing?
            </h3>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded text-gray-700">
              <p>
                En este apartado todos los comienzos de mes se cargarán automáticamente todos los prospectos cargados en ventas del mes anterior y que no fueron convertidos, además de todas las bajas de los turnos de reserva de pilates. Es decir, también personas que estuvieron interesadas y no se convirtieron para que continuemos con las ofertas de promociones.
              </p>
            </div>
          </section>

          {/* Sección 2: Carga automática */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Carga Automática de Prospectos
            </h3>
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded text-gray-700">
              <p className="font-semibold mb-1">Resumen de cargas automáticas:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Prospectos de ventas no convertidos:</strong> del mes anterior.
                </li>
                <li>
                  <strong>Bajas de Pilates:</strong> bajas de turnos de reserva y personas interesadas que no se convirtieron.
                </li>
              </ul>
            </div>
          </section>

          {/* Sección 3: Flujo de trabajo */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔄</span>
              Flujo de Trabajo
            </h3>
            <div className="space-y-2">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
                <p className="font-semibold text-purple-900 mb-1">Igual que en Ventas:</p>
                <p className="text-gray-700">
                  El flujo de trabajo es igual que “ventas”: se van a comunicar y van a ir marcando cada contacto. Si lo convierten vamos a trabajar con comisiones (los planes que corresponden).
                </p>
              </div>
            </div>
          </section>

          {/* Sección 4: Verificación en Socio Plus */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              Verificación Previa (Importante)
            </h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded text-gray-700">
              <p className="font-semibold mb-1">Antes de contactar:</p>
              <p>
                Debemos revisar previamente en <strong>Socio Plus</strong> si con el nombre no lo encontramos (tal vez se convirtió y no lo marcaron) y asegurarnos de que es un socio no convertido antes de continuar.
              </p>
            </div>
          </section>

          {/* Sección 5: Arrastrados */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">📊</span>
              Prospectos Arrastrados
            </h3>
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-3 rounded text-gray-700">
              <p className="mb-2">
                En el apartado de ventas, los últimos prospectos cargados (los últimos días del mes) no podemos hacerles un seguimiento correcto porque al cambiar de mes ya no los tenemos.
              </p>
              <p className="mb-2">
                Decidimos modificar este flujo y se van a poder observar los prospectos cargados en la última semana de cada mes durante todo el mes siguiente.
              </p>
              <div className="bg-white p-2 rounded border border-indigo-200 space-y-1">
                <p>✓ <strong>Últimos días de enero:</strong> Se cargan prospectos</p>
                <p>✓ <strong>Mes de febrero:</strong> Continúan en planilla de ventas</p>
                <p>✓ <strong>Si no se convierten en febrero:</strong> Pasan a planilla de remarketing en marzo</p>
              </div>
            </div>
          </section>

          {/* Sección 6: Comisiones */}
          <section className="space-y-2">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              Comisiones en Remarketing
            </h3>
            <div className="bg-pink-50 border-l-4 border-pink-500 p-3 rounded text-gray-700">
              <p className="mb-1 font-semibold text-gray-800">
                Si logras convertir un prospecto en remarketing:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Aparecerá un modal preguntando si corresponde comisión</li>
                <li>Deberás seleccionar el plan adecuado (Mensual, Trimestral, Semestral, Anual, etc.)</li>
                <li>La comisión entrará en estado <strong>"En Revisión"</strong></li>
                <li>Un coordinador la aprobará o rechazará según corresponda</li>
              </ul>
            </div>
          </section>

          {/* Resumen */}
          <section className="bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-300 p-4 rounded-xl">
            <h3 className="text-lg font-bold text-orange-900 mb-2">📌 Resumen Rápido</h3>
            <ul className="space-y-1 text-gray-800">
              <li>✅ Contacta prospectos del mes anterior no convertidos</li>
              <li>✅ Contacta bajas de Pilates interesadas</li>
              <li>✅ Verifica en Socio Plus antes de hacer seguimiento</li>
              <li>✅ Marca cada contacto realizado (1, 2, 3)</li>
              <li>✅ Si conviertes, marca y procesa la comisión si corresponde</li>
              <li>✅ Los arrastrados se manejan igual, pero con plazo de 2 meses</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 p-3 flex justify-end border-t">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructivoModal;
