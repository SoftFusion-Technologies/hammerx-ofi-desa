// FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ convenioId }) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  // Construye la URL estática usando convenioId
  const URL = `http://localhost:8080/integrantesImport/import/${convenioId}`;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setMessage('Por favor, selecciona un archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error al importar el archivo. VERIFIQUE que el ARCHIVO contenga estas cabeceras: nombre	telefono	dni	email	precio	descuento	preciofinal	userName');
    }
  };

  return (
    <div className="mb-5 flex flex-col items-center border border-gray-300 rounded-lg p-6 bg-gray-50 max-w-md mx-auto shadow-lg">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Importar Integrantes cargando un EXCEL</h2>
      <a
        href="https://docs.google.com/uc?export=download&id=10RSS04B847B7MC4oWWkxRqzceXY5x7p1"
        download
        className="text-blue-500 underline mb-4"
      >
        Descargar archivo de ejemplo
      </a>
      <input
        type="file"
        onChange={handleFileChange}
        className="mb-4 border border-gray-300 rounded-md p-2 w-full"
      />
      <button
        onClick={handleFileUpload}
        className="bg-green-500 text-white rounded-md px-4 py-2 font-semibold cursor-pointer hover:bg-green-600 transition-colors"
      >
        Importar
      </button>
      {message && (
        <p className={`mt-4 ${message.includes('Error') ? 'text-red-500' : 'text-green-500'}`}>
          {message}
        </p>
      )}
      si el mensaje es importación exitosa, recargue la página
    </div>
  );
};

export default FileUpload;
