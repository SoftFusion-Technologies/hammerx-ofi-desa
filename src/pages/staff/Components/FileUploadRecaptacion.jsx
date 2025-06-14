import React, { useState } from 'react';
import axios from 'axios';

const FileUploadRecaptacion = ({
  usuarioId,
  onClose,
  onSuccess,
  getRecaptacion
}) => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const URL = `http://localhost:8080/recaptacionImport/import-recaptacion/${usuarioId}`;

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
      console.log('Respuesta backend:', response.data);
      setMessage(response.data.message);
      if (response.data.message.includes('exitosa')) {
        onSuccess && onSuccess();
        getRecaptacion();
      }
    } catch (error) {
      console.error('Error importando:', error.response || error.message);
      setMessage(
        'Error al importar el archivo. VERIFIQUE que el archivo tenga las cabeceras correctas.'
      );
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          Importar Recaptación desde Excel
        </h2>

        <input
          type="file"
          accept=".xlsx, .xls, .ods"
          onChange={handleFileChange}
          className="mb-4 border border-gray-300 rounded-md p-2 w-full"
        />

        <div className="flex justify-between items-center">
          <button
            onClick={handleFileUpload}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Importar
          </button>

          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>

        {message && (
          <p
            className={`mt-3 ${
              message.toLowerCase().includes('error')
                ? 'text-red-600'
                : 'text-green-600'
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadRecaptacion;
