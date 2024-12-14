import React, { useState, useEffect } from 'react';
import '../../../styles/MetodsGet/GetUserId.css';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

const FrequentDetails = ({ user, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  const [modalNewConve, setmodalNewConve] = useState(false);
  const { userLevel } = useAuth();

  const [imagenn, setImagen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagenes, setImagenes] = useState([]);

  // Cargar las imágenes cuando el componente se monta
  const cargarImagenes = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/imagenes_preguntas_frec/${user.id}`
      );
      setImagenes(response.data);
    } catch (err) {
      setError('Error al cargar las imágenes');
      console.error(err);
    }
  };

  useEffect(() => {
    cargarImagenes();
  }, [user.id]); // Se ejecuta cuando cambia `preguntaId`

  const abrirModal = () => {
    setmodalNewConve(true);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchImagen(user.id);
    }
  }, [isOpen, user]);

  const fetchImagen = async (idPregunta) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `http://localhost:8080/imagenes-preguntas/pregunta/${idPregunta}`
      );
      setImagen(response.data.imagen); // Asegúrate de que el backend devuelva un campo `imagen`
    } catch (err) {
      console.error('Error al obtener la imagen:', err);
      // setError('No se pudo cargar la imagen.');
    } finally {
      setLoading(false);
    }
  };

  const eliminarImagen = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:8080/imagenes_preguntas_frec/${id}`
      );
      setImagenes(imagenes.filter((imagen) => imagen.id !== id)); // Elimina la imagen del estado
      // alert(response.data.mensajeExito); // Muestra un mensaje de éxito
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la imagen');
    }
  };

  // Función para descargar una imagen
  const descargarImagen = (id) => {
    window.location.href = `http://localhost:8080/download-image-pregunta/${id}`;
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles de la pregunta
          </h2>
          <div className="pr-2 cursor-pointer font-semibold" onClick={onClose}>
            x
          </div>
        </div>
        <p>
          <span className="font-semibold ">Prioridad:</span> {user.orden}
        </p>
        <p>
          <span className="font-semibold ">Pregunta:</span> {user.titulo}
        </p>
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto overflow-y-auto max-h-full">
            <button
              className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">{user.titulo}</h2>
            <p
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: user.descripcion }}
            />
            {/* Mostrar imagen con carga o error */}
            {imagenes.length > 0 ? (
              imagenes.map((imagen) => (
                <div key={imagen.id}>
                  <img
                    src={`http://localhost:8080/imagenes-preguntas/${imagenn}`}
                    alt="Imagen de la pregunta"
                    className="w-full h-auto rounded-lg"
                  />

                  <div className="relative">
                    {/* Mostrar el nombre del archivo o cualquier otra información */}
                    <p className="text-orange-500">
                      Nombre Imagen:{' '}
                      <span className="text-black">
                        {imagen.nombre_archivo}
                      </span>
                    </p>

                    {/* Contenedor para los botones */}
                    <div className="absolute top-2 right-2 flex gap-2 mt-5">
                      {/* Botón de eliminación */}
                      <button
                        onClick={() => eliminarImagen(imagen.id)}
                        className="bg-red-500 text-white p-2 rounded-full"
                      >
                        X
                      </button>

                      {/* Botón de descarga */}
                      <button
                        onClick={() => descargarImagen(imagen.id)}
                        className="bg-blue-500 text-white p-2 rounded-full"
                      >
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="mt-5 font-bold">
                No hay imágenes para esta pregunta.
              </p>
            )}
          </div>
        </div>
        <p>
          <span className="font-semibold ">Estado:</span> {user.estado}
        </p>

        <hr className="my-4" />
        <div className="flex justify-center ">
          {/*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */}
        </div>
      </div>
    </div>
  );
};

export default FrequentDetails;
