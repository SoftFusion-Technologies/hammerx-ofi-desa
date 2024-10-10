import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../../styles/Pagos/styles/cuotas.css';
import BackButton from '../../Arrow';

const CuotasSemestral = () => {
  const [cuotas, setCuotas] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener las opciones de cuotas desde el estado de navegación
  const { cuotas1 = false, cuotas3 = false, cuotas6 = false, cuotas12 = false } = location.state || {};

  const cuotasOptions = [
    { value: 1, enabled: cuotas1 },
    { value: 3, enabled: cuotas3 },
    { value: 6, enabled: cuotas6 },
    { value: 12, enabled: cuotas12 }
  ];

  const handleSelection = (cuotas) => {
    setCuotas(cuotas);
    navigate('/pagos/monteros/trimestral/cuotas/tarjeta-credito', { state: { cuotas: cuotas } });
  };

  return (
    <div className="contenttr_v2 flex flex-col items-center justify-center min-h-screen p-8">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>
      <h2 className="text-4xl font-bold text-center mb-12 text-white">Selecciona la cantidad de cuotas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-6xl">
        {cuotasOptions.map(({ value, enabled }) => (
          enabled && (
            <div
              key={value}
              className={`p-8 bg-white border border-gray-300 rounded-lg shadow-lg cursor-pointer transition-transform duration-200 hover:scale-105 ${
                cuotas === value ? 'border-blue-500 scale-105' : ''
              }`}
              onClick={() => handleSelection(value)}
            >
              <p className="text-2xl font-semibold text-center text-gray-800">{value} cuota{value > 1 ? 's' : ''}</p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default CuotasSemestral;