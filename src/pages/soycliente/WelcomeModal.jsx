import React, { useState, useEffect } from 'react';
import '../../styles/clients/WelcomeModal.css';
import img1 from './Images/planlargo_v2.jpeg';
import img2 from './Images/PromoAmig.jpeg';
import img3 from './Images/PromoFam.jpeg';
import img4 from './Images/convivencia.jpeg';
import img5 from './Images/app.jpg';

const WelcomeModal = ({ imageId }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Definir las imágenes de forma estática
  const images = {
    1: img3, // Promociones Familiares
    2: img2, // Promociones Amigos Referidos
    3: img1, // Promociones Contratando Planes Largos
    4: img4, // convivencia
    5: img5 // DESCARGA TU APP
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null; // Si no es visible, no renderizamos nada
  }

  // Obtener la imagen según el id pasado
  const imageUrl = images[imageId];

  return (
    <div className="welcome-modal_V2">
      <div className="modal-content_V2">
        <button className="close-button_V2" onClick={handleClose}>
          &times;
        </button>
        <img
          src={imageUrl}
          alt="Promo"
          className={`welcome-image_V2 ${imageId === 5 ? 'large-image' : ''}`}
        />
      </div>
    </div>
  );
};

export default WelcomeModal;
