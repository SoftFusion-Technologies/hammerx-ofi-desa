
/* 
Autor: Sergio Manrique
Fecha de creación: 23-12-2025
*/
import axios from 'axios';
import Swal from 'sweetalert2';

const API_BASE_URL = 'http://localhost:8080';

// --- PETICIONES API ---
export const cargarHistorial = async (idAlumno, setLoadingHistorial, setHistorialSeleccionado) => {
  setLoadingHistorial(true);
  try {
    // GET /pilates/historial-contactos/:id
    const response = await axios.get(
      `${API_BASE_URL}/pilates/historial-contactos/${idAlumno}`
    );
    setHistorialSeleccionado(response.data);
  } catch (err) {
    console.error('Error cargando historial:', err);
    alert('Error al cargar el historial del alumno.');
  } finally {
    setLoadingHistorial(false);
  }
};

// Editar observación
export const handleEditarHistorial = async (item, alumnoSeleccionado, setLoadingHistorial, setHistorialSeleccionado) => {
  const { value: nuevaObservacionEditada } = await Swal.fire({
    title: 'Editar observación',
    input: 'textarea',
    inputLabel: 'Modifica la observación',
    inputValue: item.observacion,
    showCancelButton: true,
    confirmButtonText: 'Guardar cambios',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#d33',
    inputValidator: (value) => {
      if (!value) {
        return '¡Debes escribir algo!';
      }
    }
  });

  if (nuevaObservacionEditada) {
    try {
      await axios.patch(
        `${API_BASE_URL}/pilates/historial-contactos/${item.id}`,
        {
          observacion: nuevaObservacionEditada.toUpperCase()
        }
      );

      await Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'La observación ha sido modificada.',
        timer: 2000,
        showConfirmButton: false
      });

      await cargarHistorial(alumnoSeleccionado.id, setLoadingHistorial, setHistorialSeleccionado);
    } catch (err) {
      console.error('Error editando:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar la observación.'
      });
    }
  }
};

// Eliminar observación
export const handleEliminarHistorial = async (id, alumnoSeleccionado, setLoadingHistorial, setHistorialSeleccionado, refetchAusentesData) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'No podrás revertir esta acción.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(
        `${API_BASE_URL}/pilates/historial-contactos/${id}`
      );

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'El registro ha sido eliminado.',
        timer: 2000,
        showConfirmButton: false
      });
      await cargarHistorial(alumnoSeleccionado.id, setLoadingHistorial, setHistorialSeleccionado);
      refetchAusentesData();
    } catch (err) {
      console.error('Error eliminando:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el registro.'
      });
    }
  }
};

// Guardar nueva observación
export const handleGuardarObservacion = async (
  nuevaObservacion,
  alumnoSeleccionado,
  userId,
  setNuevaObservacion,
  refetchAusentesData,
  setLoadingHistorial,
  setHistorialSeleccionado
) => {
  if (!nuevaObservacion.trim()) {
    return Swal.fire({
      icon: 'warning',
      title: 'Campo vacío',
      text: 'Por favor, escribe una observación antes de guardar.',
      confirmButtonColor: '#3085d6'
    });
  }

  // 1. Pregunta de confirmación
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Se agregará esta observación al historial de contacto del alumno.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3b82f6', 
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, guardar contacto',
    cancelButtonText: 'Cancelar'
  });

  // Si el usuario confirma, procedemos con el POST
  if (result.isConfirmed) {
    try {
      await axios.post(`${API_BASE_URL}/pilates/historial-contactos`, {
        id_cliente: Number(alumnoSeleccionado.id),
        id_usuario: Number(userId),
        observacion: nuevaObservacion.trim().toUpperCase(),
        contacto_realizado: String(alumnoSeleccionado.racha_actual)
      });

      // 2. Mensaje de éxito
      await Swal.fire({
        icon: 'success',
        title: '¡Guardado!',
        text: 'La observación se ha guardado exitosamente.',
        timer: 2000,
        showConfirmButton: false
      });

      setNuevaObservacion('');
      await cargarHistorial(alumnoSeleccionado.id, setLoadingHistorial, setHistorialSeleccionado);
      refetchAusentesData();
    } catch (err) {
      console.error('Error guardando:', err);

      // 3. Mensaje de error
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la observación. Inténtalo de nuevo.'
      });
    }
  }
};