import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../AuthContext';

const UploadImageModal = ({
  isOpen,
  onClose,
  alumnoId,
  agendaId,
  agendaNum,
  fetchAlumnos
}) => {
  const [file, setFile] = useState(null); // Estado para el archivo
  const [archivos, setArchivos] = useState([]);
  const [isUploading, setIsUploading] = useState(false); // Estado para controlar el proceso de carga
  const { userLevel } = useAuth(); // Se obtiene el userLevel del contexto

  useEffect(() => {
    if (agendaId) {
      setArchivos([]); // Limpiar archivos al cambiar de agenda
      fetchArchivos(); // Cargar archivos para la nueva agenda
    }
  }, [agendaId]);

  const fetchArchivos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/get-agenda-files/${agendaId}`
      );
      setArchivos(response.data); // Actualiza el estado con los archivos obtenidos
    } catch (err) {
      console.error('Error al obtener archivos:', err);
    }
  };

  useEffect(() => {
    if (agendaId) {
      fetchArchivos(); // Cargar archivos solo si hay un `agendaId`
    }
  }, [agendaId]); // Solo se ejecuta cuando cambia `agendaId`

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Por favor selecciona un archivo.');
      return;
    }

    setIsUploading(true); // Iniciar el proceso de carga
    const formData = new FormData();
    formData.append('file', file);
    formData.append('agenda_id', agendaId);
    formData.append('agenda_num', agendaNum);
    formData.append('alumno_id', alumnoId);

    try {
      // Subir la imagen
      const response = await fetch('http://localhost:8080/upload-image', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        alert('Imagen subida exitosamente.');
        // // Actualizar el estado de la agenda a 'ENVIADO'
        // await updateAgendaStatus(agendaId, 'ENVIADO');
        // Nuevo estado REVISION, cuando un profe sube una agenda se pone REVISION
        // luego el gerente o admin los autoriza y pasan a ser  ENVIADOS
        // Actualizar el estado de la agenda a 'REVISION'
        await updateAgendaStatus(agendaId, 'REVISIÓN');
        fetchArchivos(); // Actualizar la lista de archivos
        fetchAlumnos();
        handleCloseModal(); // Cerrar el modal
      } else {
        alert(result.message || 'Error al subir la imagen.');
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      alert('Hubo un problema al subir la imagen.');
    } finally {
      setIsUploading(false); // Finalizar el proceso de carga
    }
  };

  const handleDeleteArchivo = async (archivoId, agendaId) => {
    const confirmDelete = window.confirm(
      '¿Estás seguro de que quieres eliminar este archivo?'
    );

    if (!confirmDelete) {
      return; // Si el usuario cancela, no hacer nada
    }

    try {
      // Realizar la solicitud para eliminar el archivo

      await axios.delete(
        `http://localhost:8080/delete-agenda-file/${archivoId}`
      );

      // Actualizar el estado de la agenda a "PENDIENTE"
      await updateAgendaStatus(agendaId, 'PENDIENTE');
      fetchAlumnos();
      handleCloseModal(); // Cerrar el modal o actualizar la interfaz
    } catch (err) {
      console.error('Error al eliminar el archivo:', err);
    }
  };

  // Función para actualizar el estado de la agenda
  const updateAgendaStatus = async (agendaId, nuevoEstado) => {
    console.log('agendaId:', agendaId); // Verifica que no sea undefined
    try {
      if (!agendaId) {
        console.error('El agendaId no está definido');
        return;
      }

      const response = await axios.put(
        `http://localhost:8080/update-agenda-status/${agendaId}`, // Aquí asegúrate de que `agendaId` tenga el valor correcto
        { contenido: nuevoEstado }
      );

      if (response.status === 200) {
        console.log('Estado de la agenda actualizado a', nuevoEstado);
        fetchAlumnos();
      } else {
        console.error('No se pudo actualizar el estado de la agenda');
      }
    } catch (error) {
      console.error('Error al actualizar el estado de la agenda:', error);
    }
  };

  // Manejar la selección del archivo
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile); // Guardar el archivo seleccionado en el estado
  };

  if (!isOpen) return null;

  const handleCloseModal = () => {
    onClose(); // Llamar al cierre del modal
  };

  const autorizarAgenda = (agendaId, nuevoEstado) => {
    if (!agendaId) {
      console.error('El agendaId no está definido');
      return;
    }
    updateAgendaStatus(agendaId, nuevoEstado);
    handleCloseModal();
  };

  const eliminarAgenda = async (agendaId) => {
    try {
      // Confirmación antes de eliminar
      const confirmDelete = window.confirm(
        `¿Estás seguro de que deseas eliminar la agenda con ID ${agendaId}?`
      );

      if (!confirmDelete) {
        console.log('El usuario canceló la eliminación.');
        return; // Salir si el usuario cancela
      }

      // Hacer la solicitud DELETE a la API
      const response = await axios.delete(
        `http://localhost:8080/agendas/${agendaId}`
      );

      if (response.status === 200) {
        alert('Agenda eliminada correctamente.');
        fetchArchivos(); // Actualizar la lista de archivos
        fetchAlumnos();
        handleCloseModal();
        console.log('Agenda eliminada:', agendaId);
      } else {
        console.error('No se pudo eliminar la agenda.');
        alert('No se pudo eliminar la agenda. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al eliminar la agenda:', error);
      alert('Hubo un error al intentar eliminar la agenda.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-md">
        <h2 className="font-bold mb-4 text-orange-500 text-2xl">HAMMERX</h2>
        <p className="font-bold mb-4 text-lg text-left uppercase">
          Archivos Subidos
        </p>

        {archivos.length > 0 ? (
          <div>
            <h3 className="font-bold text-lg">Archivos disponibles:</h3>
            <ul>
              {archivos.map((archivo) => (
                <li key={archivo.id}>
                  {archivo.nombre_archivo} -{' '}
                  <a
                    href={`http://localhost:8080/download-image/${agendaId}`} // Aquí cambiamos la URL para descargar
                    className="text-blue-600 underline uppercase"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDeleteArchivo(archivo.id, agendaId)}
                    className="ml-2 text-red-600"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="mb-2">No hay archivos subidos aun para esta agenda.</p>
        )}

        {/* Formulario de carga de archivo */}
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            onChange={handleFileChange} // Llamar a la función cuando se selecciona un archivo
            className="block w-full mb-4"
          />
          <div className="flex justify-center space-x-2 w-full">
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 w-1/2"
              disabled={isUploading} // Deshabilitar el botón mientras se sube la imagen
            >
              {isUploading ? 'Subiendo...' : 'Subir Imagen'}{' '}
              {/* Mostrar texto de carga */}
            </button>
            <button
              type="button"
              onClick={() => handleCloseModal()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 w-1/2"
            >
              Cerrar
            </button>
          </div>
          {/* NUEVO BOTON PARA CAMBIAR EL ESTADO  */}
          {userLevel === 'instructor' || (
            <button
              type="button"
              onClick={() => autorizarAgenda(agendaId, 'ENVIADO')}
              className=" mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full"
            >
              Autorizar
            </button>
          )}
          {userLevel === 'instructor' || (
            <button
              type="button"
              onClick={() => eliminarAgenda(agendaId)} // Llamamos a eliminarAgenda
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
            >
              Eliminar
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;
