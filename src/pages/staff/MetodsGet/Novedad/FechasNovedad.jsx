import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../AuthContext';

const FechasNovedad = ({novedad, isOpen, onClose, novedadId, vencimientos }) => {
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
    user
  } = selectedNovedad || {};

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
        user,
        estado
      });
    }

    alert('Fechas agregadas con éxito');
    onClose();
  } catch (error) {
    console.error('Error al agregar fechas', error);
  }
};
  useEffect(() => {
    const checkDates = () => {
      const today = new Date().toISOString().split('T')[0]; // Obtener la fecha de hoy
      if (fechas.includes(today)) {
        alert(`¡Es el día de la novedad! Ver novedad ID: ${novedadId}`);
      }
    };

    const intervalId = setInterval(checkDates, 86400000); // Verificar una vez al día

    return () => clearInterval(intervalId); // Limpiar el intervalo al desmontar
  }, [fechas, novedadId]);

  if (!isOpen) return null;

  const handleClose = () => {
    setFechas(['']); // Resetear los campos
    onClose(); // Cerrar el modal
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
          vencimientos.map((vencimiento) => (
            <p key={vencimiento.id} className="text-gray-600">
              {new Date(vencimiento.vencimiento).toLocaleDateString()}
            </p>
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

            <button
              onClick={handleAddFecha}
              className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Agregar Fecha
            </button>

            <div className="mt-4">
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
          className="ml-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default FechasNovedad;
