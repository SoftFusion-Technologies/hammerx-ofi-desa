import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../AuthContext';

const FechasNovedad = ({
  novedad,
  isOpen,
  onClose,
  novedadId,
  vencimientos,
  obtenerFechasVec
}) => {
  const [fechas, setFechas] = useState(['']);
  const { userLevel } = useAuth(); // Obtener el nivel de usuario desde el contexto

  // Desestructurar los datos  de novedad
  const selectedNovedad = Array.isArray(novedad)
    ? novedad.find((nov) => nov.id === novedadId)
    : novedad;

  const {
    id,
    sede,
    titulo,
    mensaje,
    estado = 1,
    novedadUsers = []
  } = selectedNovedad || {};

  const users = novedadUsers.map((novedadUser) => novedadUser.user);

  const handleChange = (index, value) => {
    const newFechas = [...fechas];
    newFechas[index] = value;
    setFechas(newFechas);
  };

  const handleAddFecha = () => {
    setFechas([...fechas, '']); // Agregar un nuevo campo de fecha
  };

  const handleSubmit = async () => {
    try {
      // Eliminar fechas duplicadas
      const uniqueFechas = [...new Set(fechas.filter((f) => f))];

      for (const fecha of uniqueFechas) {
        await axios.post('http://localhost:8080/novedades-vencimientos', {
          novedad_id: novedadId,
          vencimiento: fecha,
          sede,
          titulo,
          mensaje,
          users,
          estado
        });
      }

      alert('Fechas agregadas con éxito');
      obtenerFechasVec();
      onClose();
    } catch (error) {
      console.error('Error al agregar fechas', error);
    }
  };
  // Función para reiniciar el campo 'leido' cuando se cumple la fecha de vencimiento
  const resetLeido = async () => {
    try {
      // Actualizar el campo 'leido' a 1 para cada usuario en la novedad
      for (const novedadUser of novedadUsers) {
        await axios.put(
          `http://localhost:8080/novedad_user/${novedadUser.id}`,
          {
            leido: 1
          }
        );
      }
      console.log('Campo "leido" reiniciado para los usuarios asignados.');
    } catch (error) {
      console.error('Error al actualizar el campo leido', error);
    }
  };
  useEffect(() => {
    const checkDates = () => {
      const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy

      // Verificar si la fecha de hoy coincide con alguna de las fechas de vencimiento
      const isVencimientoHoy = vencimientos
        .filter((vencimiento) => vencimiento.novedad_id === novedadId)
        .some((vencimiento) => vencimiento.vencimiento === today);

      // Si coincide, reiniciar el campo 'leido'
      if (isVencimientoHoy) {
        alert(`¡Es el día de la novedad! Ver novedad ID: ${novedadId}`);
        resetLeido(); // Reiniciar el campo 'leido'
      }
    };

    resetLeido(); // Reiniciar el campo 'leido'

    checkDates(); // Llamar inmediatamente al cargar
    const intervalId = setInterval(checkDates, 86400000); // Verificar una vez al día

    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
  }, [fechas, novedadId, vencimientos]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFechas(['']); // Resetear los campos
    onClose(); // Cerrar el modal
  };

  const handleDelete = async (id) => {
    if (
      window.confirm('¿Estás seguro de que deseas eliminar este vencimiento?')
    ) {
      try {
        const response = await fetch(
          `http://localhost:8080/novedades-vencimientos/${id}`,
          {
            method: 'DELETE'
          }
        );

        if (response.ok) {
          alert('Vencimiento eliminado correctamente. RECARGAR LA WEB PARA VER EL CAMBIO');
          // Actualizar la lista de vencimientos después de eliminar
          obtenerFechasVec();
          onClose();
        } else {
          alert('Error al eliminar el vencimiento.');
        }
      } catch (error) {
        console.error('Error al eliminar vencimiento:', error);
        alert('Ocurrió un error al intentar eliminar el vencimiento.');
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={handleClose}
      ></div>

      <div className="bg-white p-6 rounded shadow-lg z-10">
        <h3 className="text-lg mt-4 mb-2">Vencimientos Existentes:</h3>
        {vencimientos.length > 0 ? (
          vencimientos
            .filter((vencimiento) => vencimiento.novedad_id === novedadId)
            .sort((a, b) => new Date(a.vencimiento) - new Date(b.vencimiento)) // Ordenar de forma ascendente
            .map((vencimiento) => (
              <div
                key={vencimiento.id}
                className="flex items-center justify-between text-gray-600"
              >
                <span>
                  {new Date(vencimiento.vencimiento).toLocaleDateString()}
                </span>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleDelete(vencimiento.id)} // Función para manejar la eliminación
                >
                  x
                </button>
              </div>
            ))
        ) : (
          <p className="text-red-500">No hay vencimientos agregados.</p>
        )}

        {userLevel === 'admin' || userLevel === 'administrador' ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Agregar Fechas a la Novedad
            </h2>
            {fechas.map((fecha, index) => (
              <div key={index} className="mb-3 flex items-center">
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => handleChange(index, e.target.value)}
                  className="mt-2 block w-full p-3 text-black bg-slate-100 rounded-xl"
                />
                <button
                  onClick={() => {
                    const newFechas = fechas.filter((_, i) => i !== index);
                    setFechas(newFechas); // Eliminar la fecha
                  }}
                  className="ml-2 text-red-500"
                >
                  X
                </button>
              </div>
            ))}

            <div className="flex space-x-4">
              <button
                onClick={handleAddFecha}
                className="py-3 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Agregar Fecha
              </button>

              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              >
                Guardar Fechas
              </button>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No tienes permiso para agregar fechas.</p>
        )}

        <button
          onClick={handleClose}
          className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default FechasNovedad;
