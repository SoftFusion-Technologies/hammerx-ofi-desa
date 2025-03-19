import { useState } from 'react';
import { X } from 'lucide-react';

export default function ModalEnvioCV({ isOpen, onClose }) {
  const [showCargos, setShowCargos] = useState(false);
  const [showSedes, setShowSedes] = useState(false);
  const [isCopied, setIsCopied] = useState(false); // Estado para controlar si el formato fue copiado

  if (!isOpen) return null;

  // Formato predefinido del correo con los campos dinámicos (con instrucciones de reemplazo)
  const nombre = '(reemplaza con tu nombre)'; // Instrucción para que el usuario sepa qué poner
  const celular = '(reemplaza con tu número de celular)'; // Instrucción para que el usuario sepa qué poner
  const instagram = '(reemplaza con tu Instagram, si tienes)'; // Instrucción para Instagram
  const cargo = '(reemplaza con el cargo que te interesa)'; // Instrucción para el cargo
  const sede = '(reemplaza con la sede a la que postulas)'; // Instrucción para la sede

  const formatoMail = `
    Hola, mi nombre es ${nombre}.
    Mi número de celular es ${celular}.
    Mi Instagram es ${instagram ? instagram : 'No tengo Instagram'}.
    El cargo que me interesa es ${cargo}.
    La sede a la que postulo es ${sede}.
  `;

  // Función para abrir el cliente de correo con el formato predefinido
  const abrirMail = () => {
    // Reemplazar saltos de línea (\n) con %0A y otros caracteres especiales con encodeURIComponent
    const formatoMailConSaltos = formatoMail.replace(/\n/g, '%0A');

    // Crear el enlace mailto con el cuerpo del mail codificado correctamente
    const mailtoLink = `mailto:mi-cv@hammer.ar?subject=Postulación para trabajo HammerX Gym &body=${encodeURIComponent(
      formatoMailConSaltos
    )}`;

    // Abrir el cliente de correo
    window.location.href = mailtoLink;
  };

  // Función para copiar el formato al portapapeles
  const copiarFormatoMail = () => {
    navigator.clipboard
      .writeText(formatoMail)
      .then(() => {
        setIsCopied(true); // Cambia el estado cuando se haya copiado
        setTimeout(() => setIsCopied(false), 5000); // Resetea el estado después de 2 segundos
      })
      .catch((err) => {
        console.error('Error al copiar al portapapeles: ', err);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-center font-bignoodle">
          ¡Hola! Gracias por querer formar parte de nuestro equipo 🤩
        </h2>
        <p className="mt-4 text-gray-700 text-center font-messina">
          Podrías enviarnos tu CV en el siguiente correo:
          <span className="block mt-2 text-orange-500 font-semibold font-messina">
            mi-cv@hammer.ar
          </span>
          <br />Y adjunta con él:
        </p>
        <ul className="list-disc list-inside mt-2 text-left font-messina">
          <li>Tu nombre completo ✅</li>
          <li>Tu número de celular 📱</li>
          <li>Tu Instagram si dispones 📷</li>
          <li>
            El cargo que te interesa 💼
            <button
              onClick={() => setShowCargos(!showCargos)}
              className="text-orange-500 underline ml-2"
            >
              Ver cargos
            </button>
          </li>
        </ul>
        {showCargos && (
          <ul className="mt-2 p-2 border rounded-md bg-gray-100 text-gray-700">
            <li>Recepcionista</li>
            <li>Vendedor</li>
            <li>Instructor de musculación</li>
            <li>Coach de clases grupales</li>
            <li>Limpieza</li>
            <li>Mantenimiento</li>
            <li>Marketing</li>
            <li>Otro</li>
          </ul>
        )}
        <ul className="list-disc list-inside mt-2 text-left font-messina">
          <li>
            La sede a la que postulas 📍
            <button
              onClick={() => setShowSedes(!showSedes)}
              className="text-orange-500 underline ml-2"
            >
              Ver sedes
            </button>
          </li>
        </ul>
        {showSedes && (
          <ul className="mt-2 p-2 border rounded-md bg-gray-100 text-gray-700">
            <li>SMT - BARRIO SUR</li>
            <li>Monteros</li>
            <li>Concepción</li>
          </ul>
        )}
        {/* Mostrar botón para copiar el formato o enviar correo */}
        <div className="mt-6 text-center space-y-4">
          <button
            onClick={copiarFormatoMail}
            className="mr-2 bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            {isCopied
              ? '¡Formato Copiado! Ahora puedes pegarlo y enviar el correo'
              : 'Copiar formato del mail'}
          </button>

          {isCopied && (
            <button
              onClick={abrirMail}
              className="mr-2 bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
            >
              Enviar correo
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-700 text-white px-4 py-2 rounded-lg w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
