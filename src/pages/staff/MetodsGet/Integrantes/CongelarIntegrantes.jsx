import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CongelarIntegrantes = ({ id_conv, selectedMonth }) => {
  const [estado, setEstado] = useState(0);
  const [congelamientos, setCongelamientos] = useState([]);

  const [vencimiento, setVencimiento] = useState(null); // Almacena la fecha de vencimiento

  const URL = 'http://localhost:8080/';

  useEffect(() => {
    const ObtenerCongelamientos = async () => {
      try {
        const response = await axios.get(
          `${URL}integrantes-congelados/${id_conv}`
        );
        setCongelamientos(response.data);

        // Comprobar el estado del mes seleccionado
        const congelamientoActual = response.data.find(
          (congelamiento) =>
            new Date(congelamiento.vencimiento).getMonth() === selectedMonth
        );

        // Si se encuentra un congelamiento para el mes seleccionado, actualiza el estado
        if (congelamientoActual) {
          setEstado(congelamientoActual.estado);
        } else {
          setEstado(0); // No hay congelamiento para este mes, se puede congelar
        }
      } catch (error) {
        console.log('Error al obtener los congelamientos:', error);
      }
    };

    ObtenerCongelamientos();
  }, [id_conv, selectedMonth]);

  const manejarCongelamiento = async () => {
    // Definir el año y el día
    const year = new Date().getFullYear(); // El año actual
    const day = 1; // Primer día del mes

    // Crear una fecha con el formato: YYYY-MM-DD HH:MM:SS
    const fechaCompleta = new Date(year, selectedMonth, day, 0, 0, 0);

    // Convertir la fecha a una cadena en el formato que MySQL acepta: YYYY-MM-DD HH:MM:SS
    const fechaFormateada = fechaCompleta
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    try {
      if (estado === 0) {
        // Congelar (crear nuevo registro)
        const response = await axios.post(`${URL}congelamientos/${id_conv}`, {
          convenio_id: id_conv,
          estado: 1, // Congelado
          vencimiento: fechaFormateada
        });

        if (response.status === 200 || response.status === 201) {
          alert('Recargue la web para ver los cambios');
          console.log('Congelamiento creado correctamente');
          setEstado(1); // Actualiza el estado local
        }
      } else if (estado === 1) {
        // Descongelar (actualizar registro existente)
        const response = await axios.post(`${URL}congelamientos/${id_conv}`, {
          convenio_id: id_conv,
          estado: 0, // Descongelado
          vencimiento: fechaFormateada // Mantener la misma fecha de vencimiento
        });

        if (response.status === 200) {
          alert('Recargue la web para ver los cambios');
          console.log('Congelamiento descongelado correctamente');
          setEstado(0); // Actualiza el estado local
        }
      }
    } catch (error) {
      console.log('Error al realizar el congelamiento:', error);
    }
  };

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={manejarCongelamiento}
          className={`px-4 py-2 mr-6 font-semibold rounded-lg shadow-md text-white transition-transform duration-300 ease-in-out
            ${
              estado === 0
                ? 'bg-blue-500 hover:bg-blue-700'
                : 'bg-gray-500 hover:bg-gray-700'
            }
            active:scale-95`}
        >
          {estado === 0 ? 'Congelar Listado' : 'Descongelar Listado'}: Mes{' '}
          {selectedMonth + 1}
        </button>
      </div>
    </>
  );
};

export default CongelarIntegrantes;
