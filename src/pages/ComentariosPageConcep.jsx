import React from 'react';
import '../styles/Pagos/styles/comentarios.css';
import Logo1 from '../images/Pagos/Images/logo1.png';
import Promociones from '../components/Pagos/Promociones';
import { useEffect } from 'react';
import Trimestral from '../images/Pagos/Images/trimestral.png';
import Semestral from '../images/Pagos/Images/semestral.png';
import Anual from '../images/Pagos/Images/anual.png';
import Macro from '../images/Pagos/Images/macro.png';
import Footer from '../components/footer/Footer';
import Navbar from '../components/header/Navbar';
const ComentariosPageConcep = () => {
  const numMonteros = '3863564651';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  const handleRedirect = () => {
    window.open(
      'https://docs.google.com/forms/d/e/1FAIpQLSf9yyERpMt6qgaKw6hYu-EVXbdplQ9sECVN847f0Bt7aOnGLg/viewform',
      '_blank',
      'noopener,noreferrer'
    );
  };
  return (
    <>
      <Navbar />
      <div className="content_v3 back_v3">
        <img src={Logo1} alt="Logo1_v3" className="logo_v3" />
        <h1 className="message_v3 font-bignoodle text-2xl">
          ¡DEJANOS TU RECOMENDACIÓN, QUEJA, O TU COMENTARIO POSITIVO SOBRE
          NUESTRA SEDE: CONCEPCIÓN!
        </h1>
        <div className="plan-info_v3">
          <p className="plan-text_v3">
            Tu comentario es muy importante para nosotros, nos permite seguir
            creciendo y mejorando cada día. Ingresa al siguiente LINK y se
            abrirá el cuestionario.
          </p>
        </div>

        <div className="payment-info_v3 ml-2">
          <button
            onClick={handleRedirect}
            className="payment-text_v3 font-bold py-2 px-4 rounded shadow-lg transform animate-float cursor-pointer whitespace-nowrap"
          >
            ¡Click Aqui!
          </button>
        </div>

        <div>
          <h5 className="message_v2 font-bignoodle m2_v2">
            MIRÁ NUESTRAS PROMOCIONES
          </h5>
        </div>

        <div className="image-container-pagos">
          <img
            src={Trimestral}
            alt="Promoción Trimestral"
            className="plan-image"
            message="PLAN TRIMESTRAL"
            num={numMonteros}
          />
          <img
            src={Semestral}
            alt="Promoción Semestral"
            className="plan-image"
            message="PLAN SEMESTRAL"
            numMonteros={numMonteros}
          />
          <img
            src={Anual}
            alt="Promoción Anual"
            className="plan-image"
            message="PLAN ANUAL"
            numMonteros={numMonteros}
          />
          <img
            href="https://softfusion.com.ar/"
            src={Macro}
            alt="Promoción Macro"
            className="plan-image"
            message="PLAN MACRO"
            numMonteros={numMonteros}
          />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ComentariosPageConcep;
