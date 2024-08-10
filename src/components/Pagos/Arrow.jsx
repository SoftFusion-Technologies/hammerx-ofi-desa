import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Pagos/styles/BackButton.css';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navega a la ruta anterior en el historial
  };

  return (
    <button className="back-button_v2" onClick={handleBack}>
      <svg
        className="back-button-icon_v2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <p className="btn_v2">Volver</p>
    </button>
  );
};

export default BackButton;
