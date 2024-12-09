import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../../styles/imagesUpload.css';
import { useAuth } from '../../../AuthContext';
import FechasConvenios from './Novedad/FechasConvenios';

const InvoicesUpload = ({ convenioId, selectedMonth, setSelectedMonth }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const [imagess, setImagess] = useState([]); // Estado para almacenar imágenes del convenioId
  const [imagesFac, setImagesFac] = useState([]); // Todas las imágenes

  const { userLevel } = useAuth();

  const URL = 'http://localhost:8080/facget/';

  useEffect(() => {
    // utilizamos get para obtenerPersonas los datos contenidos en la url
    axios.get(URL).then((res) => {
      setImagesFac(res.data);
      obtenerImages();
    });
  }, []);

  // Función para obtener todos los personClass desde la API
  const obtenerImages = async () => {
    try {
      const response = await axios.get(URL);
      setImagesFac(response.data);
    } catch (error) {
      console.log('Error al obtener las imagenes :', error);
    }
  };
  useEffect(() => {
    // Fetch images for the given convenioId when the component mounts
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/imagesfac/${convenioId}`
        );
        setImagess(response.data.images || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar las imágenes.');
      }
    };

    fetchImages();
  }, [convenioId]);

  // Filtrar imágenes basadas en el mes seleccionado
  const filteredImages = imagesFac.filter((image) => {
    if (!selectedMonth) return true;
    const imageMonth = new Date(image.created_at).getMonth();
    return imageMonth === parseInt(selectedMonth, 10);
  });

  // Definir el año y el día:
  const year = new Date().getFullYear(); // El año actual
  const day = 1; // Primer día del mes

  // Crear una fecha con el formato: YYYY-MM-DD HH:MM:SS
  const fechaCompleta = new Date(year, selectedMonth, day, 0, 0, 0);

  // Convertir la fecha a una cadena en el formato que MySQL acepta: YYYY-MM-DD HH:MM:SS
  const fechaFormateada = fechaCompleta
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');

  console.log(fechaFormateada);

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    const newFec = fechaFormateada;
    formData.append('fecha', newFec); //
    try {
      const response = await axios.post(
        `http://localhost:8080/uploadfac/${convenioId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        // Add the newly uploaded image to the list
        setImagess([...imagess, response.data.imageUrl]);
        alert('Imagen subida con éxito.');
        obtenerImages();
      }
    } catch (err) {
      console.error(err);
      setError('Error al subir la imagen.');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una imagen
  const eliminarImagen = async (id) => {
    try {
      await axios.delete(`${URL}${id}`); // Solicitud DELETE al servidor
      obtenerImages(); // Recarga la lista de imágenes después de la eliminación
    } catch (error) {
      console.log('Error al eliminar la imagen:', error);
    }
  };

  return (
    <div className="upload-container bg-gray-100 p-6 rounded-lg shadow-lg max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        FACTURA EMITIDA POR COMERCIO <br />
        <FechasConvenios onMonthChange={setSelectedMonth} />
        {userLevel === 'admin' && (
          <span className="text-base font-normal">
            1. Presionar Seleccionar Archivo,
            <br />
            2. Subir Imagen solo(jpg, png, jpeg) hasta 30MB
          </span>
        )}
      </h2>

      {userLevel === 'admin' && (
        <div className="input-group flex flex-col space-y-2 mb-4">
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
          />
          <button
            className="btnnn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            onClick={handleUpload}
            disabled={loading}
          >
            {loading ? 'Subiendo...' : 'Subir Imagen'}
          </button>
        </div>
      )}

      {error && (
        <p className="error-message text-red-500 font-semibold">{error}</p>
      )}

      <h3 className="text-lg font-medium text-gray-700 mt-6 mb-2">
        {/* Imágenes Disponibles */}
      </h3>
      <ul className="image-list space-y-4">
        {/* {imagess.map((image, index) => (
          <li
            key={index}
            className="image-item flex items-center justify-between bg-white p-4 rounded shadow-md"
          >
            <img
              src={`http://localhost:8080/public/${image}`}
              alt={`Imagen ${index + 1}`}
              className="thumbnail w-24 h-24 object-cover rounded"
            />
          </li>
        ))} */}

        {filteredImages.length > 0 ? (
          filteredImages.map((image, index) => (
            <div key={image.id}>
              <h3 className="text-lg font-medium text-gray-700 mt-2 mb-2">
                Imágenes Disponibles {index + 1}
              </h3>
              <li className="image-item flex items-center justify-between bg-white p-4 rounded shadow-md">
                <div className="flex items-center space-x-4">
                  <a
                    href={`http://localhost:8080/downloadfac/${image.id}`}
                    download={image.image_path}
                    className="download-link text-blue-500 hover:underline"
                  >
                    Ver Imagen
                  </a>
                  {userLevel === 'admin' && (
                    <button
                      onClick={() => eliminarImagen(image.id)}
                      className="mt-3 delete-button bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-200"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </li>
            </div>
          ))
        ) : (
          <p>No hay imágenes disponibles.</p>
        )}
      </ul>

      <h1 className="mt-5 text-sm font-light text-gray-600">
        RECUERDE QUE AL (ELIMINAR, CARGAR) IMAGEN, DEBE RECARGAR LA PÁGINA
      </h1>
    </div>
  );
};

export default InvoicesUpload;
