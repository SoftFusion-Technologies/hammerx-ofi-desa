import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const EstadisticaCardCircular = ({
  titulo,
  porcentaje,
  totalProspectos,
  totalConvertidos
}) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md flex flex-col items-center w-48">
      <h3 className="text-black text-lg font-bold mb-4 text-center">
        {titulo}
      </h3>
      <div style={{ width: 120, height: 120 }}>
        <CircularProgressbar
          value={porcentaje}
          text={`${porcentaje}%`}
          styles={buildStyles({
            textColor: '#fc4b08',
            pathColor: '#fc4b08',
            trailColor: '#5a5252'
          })}
        />
      </div>
      <p className="text-orange-500 text-sm mt-4">
        Prospectos: <strong>{totalProspectos}</strong>
      </p>
      <p className="text-orange-500 text-sm">
        Convertidos: <strong>{totalConvertidos}</strong>
      </p>
    </div>
  );
};

export default EstadisticaCardCircular;
