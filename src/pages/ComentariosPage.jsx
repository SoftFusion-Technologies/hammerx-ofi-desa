import React from 'react';
import '../styles/Pagos/styles/index_v2.css';
import Logo1 from '../images/Pagos/Images/logo1.png';
import Promociones from '../components/Pagos/Promociones';
import { useEffect } from 'react';
const ComentariosPage = () => {
  const numMonteros = '3863564651';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  return (
    <div className="content_v2 back_v2">
      <img src={Logo1} alt="Logo1_v2" className="logo_v2" />
      <h1 className="message_v2 font-bignoodle">
        ¡DEJANOS TU RECOMENDACIÓN, QUEJA, O TU COMENTARIO POSITIVO!
      </h1>
      <div className="plan-info_v2">
        <p className="plan-text_v2">
          Tu comentario es muy importante para nosotros, nos permite seguir
          creciendo y mejorando cada día. Ingresa al siguiente LINK y se abrirá
          el cuestionario.
        </p>
      </div>
     
      <div className="payment-info_v2 ml-2">
        <p className="payment-text_v2 font-bold py-2 px-4 rounded shadow-lg transform animate-float cursor-pointer">
          Click Aqui!
        </p>
      </div>

      <Promociones num={numMonteros}></Promociones>
    </div>
  );
};

export default ComentariosPage;
