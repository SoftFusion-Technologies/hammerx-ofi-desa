import React from 'react';
import { FaTimes, FaPalette, FaUserCheck, FaUserClock, FaExclamationTriangle, FaPencilAlt } from 'react-icons/fa';


const ModalAyudaGrillaGestion = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const seccionesDeAyuda = [
    {
      titulo: 'Referencias Visuales en la Grilla',
      items: [
        { color: 'bg-gray-300', nombre: 'Plan Contratado (L-M-V)', descripcion: 'Alumno con plan activo en el grupo de Lunes, Miércoles y Viernes.' },
        { color: 'bg-gray-200', nombre: 'Plan Contratado (M-J)', descripcion: 'Alumno con plan activo en el grupo de Martes y Jueves.' },
        { color: 'bg-cyan-200', nombre: 'Clase de Prueba', descripcion: 'Alumno agendado para una clase de prueba. Si la fecha ya pasó, se indicará si asistió o no.' },
        { color: 'bg-yellow-200', nombre: 'Renovación Programada', descripcion: 'Alumno con plan vencido que tiene una fecha de pago prometida para renovar.' },
        { color: 'bg-red-500', nombre: 'Vencido / Caducado', descripcion: 'Indica que la fecha de fin del plan, clase de prueba o renovación ya ha pasado.' },
        { 
          icon: FaPencilAlt, 
          nombre: 'Plan con Fecha Fin Personalizada', 
          descripcion: 'Aparece la etiqueta "MODIFICADO" cuando la duración del plan no es estándar (29, 89, 179, 359 días), indicando que la fecha de fin fue editada manualmente. El sistema registra qué usuario realizó esta modificación para mayor control.' 
        },
      ]
    },
    {
      titulo: 'Funcionalidades Automáticas',
      items: [
        { icon: FaUserCheck, nombre: 'Seguimiento de Asistencia en Pruebas', descripcion: 'Una vez que pasa la fecha de una "Clase de Prueba", el sistema muestra automáticamente en la celda si el alumno fue marcado como presente (✔️) o ausente (❌).' },
        { icon: FaUserClock, nombre: 'Continuidad en Renovaciones', descripcion: 'Cuando un alumno en "Renovación Programada" vuelve a "Plan Contratado", su nueva fecha de inicio se calcula automáticamente como el día siguiente a su último vencimiento para no perder la continuidad.' },
      ]
    },
  ];

  return (
    // Contenedor principal del modal
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-8 w-full max-w-4xl shadow-2xl mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Encabezado del modal */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <FaPalette className="text-orange-500" />
            Guía Rápida de la Grilla de Gestión
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Cuerpo del modal */}
        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4">
          {seccionesDeAyuda.map((seccion, idx) => (
            <div key={idx}>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{seccion.titulo}</h3>
              <ul className="space-y-4">
                {seccion.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {item.color ? (
                        <div className={`w-6 h-6 rounded-md shadow-inner ${item.color}`}></div>
                      ) : (
                        <item.icon className="text-orange-500" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{item.nombre}</p>
                      <p className="text-sm text-gray-600">{item.descripcion}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Pie del modal */}
        <div className="flex justify-end mt-8 border-t pt-6">
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAyudaGrillaGestion;