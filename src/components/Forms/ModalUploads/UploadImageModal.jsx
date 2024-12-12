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
  // Estado para controlar la visibilidad del modal de motivos
  const [isMotivoModalOpen, setMotivoModalOpen] = useState(false);
  const [motivo, setMotivo] = useState(''); // Estado para guardar el motivo
  const [motivos, setMotivos] = useState([]); // Inicializar como un array vacío
  const [isMotivosLoading, setIsMotivosLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMotivoId, setEditMotivoId] = useState(null); // Estado para almacenar el ID del motivo a editar

  useEffect(() => {
    if (agendaId) {
      setArchivos([]); // Limpiar archivos al cambiar de agenda
      fetchArchivos(); // Cargar archivos para la nueva agenda
    }
  }, [agendaId]);

  const getMotivos = async () => {
    try {
      setIsMotivosLoading(true); // Mostrar un indicador de carga
      const response = await fetch('http://localhost:8080/agenda-motivos');
      const data = await response.json();
      if (response.ok) {
        setMotivos(data);
      } else {
        alert('Error al obtener los motivos');
      }
    } catch (error) {
      console.error('Error al obtener los motivos:', error);
      alert('Hubo un problema al obtener los motivos.');
    } finally {
      setIsMotivosLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    // Llamar a la API para obtener los motivos
    getMotivos(); // Llamamos a la función cuando el componente se monte
  }, []);

  const fetchArchivos = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8080/get-agenda-files/${agendaId}`
      );
      console.log(response.data); // Verifica que la respuesta contenga los archivos esperados
      setArchivos(response.data);
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

    // Si solo se está enviando un motivo y no un archivo, omitir la validación del archivo
    if (!file && !motivo) {
      // alert('Por favor selecciona un archivo o ingresa un motivo.');
      return;
    }

    // Si no hay archivo pero hay motivo, puedes continuar con el motivo
    if (motivo && !file) {
      // Aquí puedes enviar solo el motivo, sin la necesidad de enviar un archivo
      try {
        const response = await axios.post(
          'http://localhost:8080/agenda-motivos',
          {
            agenda_id: agendaId,
            agenda_num: agendaNum,
            alumno_id: alumnoId,
            motivo
          }
        );

        if (response.status === 200) {
          alert('Motivo guardado exitosamente.');
          await updateAgendaStatus(agendaId, 'REVISIÓN');
          // handleCloseModal(); // Cerrar el modal
        } else {
          alert('Error al guardar el motivo.');
        }
      } catch (error) {
        console.error('Error al guardar el motivo:', error);
        alert('Hubo un problema al guardar el motivo.');
      }

      fetchArchivos(); // Actualizar la lista de archivos
      fetchAlumnos();
      setMotivo(''); // Limpiar el campo motivo
      setMotivoModalOpen(false); // Cerrar el modal
      return;
    }

    // Si hay archivo, continuar con la subida de la imagen
    if (file) {
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
      fetchArchivos();
      setArchivos([]); // Limpiar archivos al cambiar de agenda

      // handleCloseModal(); // Cerrar el modal o actualizar la interfaz
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

  // Función para manejar el submit del formulario de edición
  const handleMotivoSubmit = async () => {
    if (!motivo.trim()) {
      alert('El motivo no puede estar vacío.');
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = editMotivoId
        ? `http://localhost:8080/agenda-motivos/${editMotivoId}` // Usamos el ID para la actualización
        : 'http://localhost:8080/agenda-motivos';

      const method = editMotivoId ? 'put' : 'post'; // Usamos PUT si estamos editando, POST si estamos creando

      const response = await axios({
        method,
        url: endpoint,
        data: {
          agenda_id: agendaId,
          agenda_num: agendaNum,
          alumno_id: alumnoId,
          motivo
        }
      });

      if (response.status === 200) {
        alert('Motivo guardado exitosamente.');
        await updateAgendaStatus(agendaId, 'REVISIÓN');
        fetchArchivos();
        fetchAlumnos();
        setMotivos((prevMotivos) =>
          editMotivoId
            ? prevMotivos.map((mot) =>
                mot.id === editMotivoId ? { ...mot, motivo } : mot
              )
            : [...prevMotivos, response.data]
        );
        // handleCloseModal();
        getMotivos();
      } else {
        console.log('Respuesta del servidor:', response.data);
      }
      setMotivo('');
      setMotivoModalOpen(false);
      setEditMotivoId(null); // Resetear el ID de edición después de la actualización
    } catch (error) {
      console.error('Error al guardar el motivo:', error);
      alert('Ocurrió un error al guardar el motivo.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleEliminarMotivo = async (motivoId) => {
    try {
      // Llamar al backend para eliminar el motivo
      const response = await fetch(
        `http://localhost:8080/agenda-motivos/${motivoId}`,
        {
          method: 'DELETE'
        }
      );

      const result = await response.json();
      if (response.ok) {
        setMotivo(''); // Limpiar el motivo
        alert('Motivo eliminado correctamente.');
        getMotivos();
        updateAgendaStatus(agendaId, 'PENDIENTE');
      } else {
        alert(result.message || 'Error al eliminar el motivo.');
      }
    } catch (error) {
      console.error('Error al eliminar el motivo:', error);
      alert('Hubo un problema al eliminar el motivo.');
    }
  };

  // Manejar el clic en el motivo para editarlo
  const handleEditMotivo = (motivoId, motivoText) => {
    setEditMotivoId(motivoId); // Guardar el ID del motivo a editar
    setMotivo(motivoText); // Establecer el texto actual en el campo de edición
    setMotivoModalOpen(true); // Abrir el modal
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
                  {/* Mostrar la imagen directamente */}
                  {console.log(
                    `http://localhost:8080/agendas-images-ver/${archivo.nombre_archivo}`
                  )}
                  {archivo.nombre_archivo && (
                    <img
                      src={`http://localhost:8080/agendas-images-ver/${archivo.nombre_archivo}`} // Usa el nombre con timestamp
                      alt={archivo.nombre_archivo}
                      className="ml-2 max-w-full max-h-[400px] sm:max-h-[600px] object-contain" // Ajuste de tamaño según la pantalla
                    />
                  )}
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

          {/* Mostrar los motivos cargados */}
          <div className="mt-4">
            {motivos.length > 0 && (
              <h1 className="text-xl font-bold mb-4">Motivos</h1> // Mostrar solo si hay motivos
            )}
            {isMotivosLoading ? (
              <p>Cargando motivos...</p>
            ) : (
              <ul>
                {motivos.map((motivo) => (
                  <li
                    key={motivo.id}
                    className="flex justify-between items-center"
                  >
                    <p>{motivo.motivo}</p>
                    <div className="flex space-x-2">
                      {' '}
                      {/* Añadimos espacio entre los iconos */}
                      <span
                        onClick={() =>
                          handleEditMotivo(motivo.id, motivo.motivo)
                        } // Llamamos a la función de edición
                        className="text-green-600 cursor-pointer hover:text-green-800"
                      >
                        ✔ {/* Aquí el icono de tilde */}
                      </span>
                      <span
                        onClick={() => handleEliminarMotivo(motivo.id)}
                        className="text-red-600 cursor-pointer hover:text-red-800"
                      >
                        X {/* Aquí el icono de la "X" */}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Botón para Ingresar motivo */}
          <button
            type="button"
            onClick={() => setMotivoModalOpen(true)}
            className=" mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 w-full"
          >
            Ingresar Motivo
          </button>
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

          {/* Modal para gestionar motivos */}
          {isMotivoModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-6 rounded shadow-md">
                <h3 className="text-xl font-bold mb-4">Ingresar Motivo</h3>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Escribe el motivo aquí..."
                  className="w-full border rounded p-2 mb-4"
                ></textarea>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setMotivoModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleMotivoSubmit}
                    disabled={isSubmitting} // Deshabilitar el botón si está enviando
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Guardar Motivo
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UploadImageModal;
