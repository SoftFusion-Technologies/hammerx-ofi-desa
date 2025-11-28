import React, { useState } from 'react';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const ContactoRapidoModal = ({ prospecto, open, onClose }) => {
  const [mensaje, setMensaje] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    return dayjs(fecha).format('DD/MM/YYYY');
  }

  const templates = [
    { 
      id: 'primer_contacto', 
      label: 'Primer contacto',
      texto: `Hola ${prospecto?.nombre || ''}! \n\nTe contactamos desde HammerX. Vimos que te interesa conocer nuestras instalaciones.\n\n¿Te gustaría agendar una clase de prueba gratuita?`
    },
    { 
      id: 'recordatorio', 
      label: 'Recordatorio clase',
      texto: `Hola ${prospecto?.nombre || ''}! \n\n¿Recordás que tenés tu clase de prueba agendada para ${formatearFecha(prospecto?.clase_prueba_1_fecha) || 'próximamente'}?\n\n¿Confirmamos tu asistencia?`
    },
    { 
      id: 'promo', 
      label: 'Oferta especial',
      texto: `Hola ${prospecto?.nombre || ''}! \n\nTenemos una promoción especial este mes:\n\n [Describe tu promo aquí]\n\n¿Te interesa? ¡No te la pierdas!`
    }
  ];

  const enviarWhatsApp = () => {
    if (!prospecto?.contacto) {
      Swal.fire('Error', 'El prospecto no tiene número de contacto', 'error');
      return;
    }
    
    const numero = prospecto.contacto.replace(/\D/g, '');
    const texto = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
    onClose();
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setMensaje(template.texto);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
          <div>
            <h2 className="text-xl font-bold text-white">Contactar</h2>
            <p className="text-green-100 text-lg font-bold">{prospecto?.nombre || 'Prospecto'}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Info del prospecto */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{prospecto?.contacto || 'Sin teléfono'}</span>
            </div>
            {prospecto?.actividad && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-sm text-gray-600">{prospecto.actividad}</span>
              </div>
            )}
          </div>

          {/* Plantillas */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Plantillas de mensaje
            </label>
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`w-full p-3 rounded-lg text-left border-2 transition-all ${
                  selectedTemplate === template.id
                    ? 'bg-green-50 border-green-500 ring-2 ring-green-200'
                    : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <span className="font-medium text-gray-800">{template.label}</span>
              </button>
            ))}
          </div>

          {/* Editor de mensaje */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Tu mensaje
            </label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              className="w-full border-2 border-gray-300 rounded-lg p-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all"
              rows={6}
              placeholder="Escribe tu mensaje personalizado..."
            />
            <p className="text-xs text-gray-500">
              {mensaje.length} caracteres
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-4">
            <button 
              onClick={enviarWhatsApp}
              disabled={!mensaje.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Enviar WhatsApp
            </button>
            <button 
              onClick={() => window.open(`tel:${prospecto?.contacto}`)}
              className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md"
              title="Llamar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactoRapidoModal;