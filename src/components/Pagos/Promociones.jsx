import React from 'react';
import Trimestral from '../../images/Pagos/Images/trimestral.png';
import Semestral from '../../images/Pagos/Images/semestral.png';
import Anual from '../../images/Pagos/Images/anual.png';
import Macro from '../../images/Pagos/Images/macro.png';

const Plan = ({ imageSrc, altText, message, num }) => {
  const encodedMessage = encodeURIComponent(
    `Hola! Vengo desde la pagina web, quiero mas info sobre "${message}" :)`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?phone=54${num}&text=${encodedMessage}`;

  return (
    <div className="square-div_v  2">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <img src={imageSrc} alt={altText} />
      </a>
    </div>
  );
};

const Promociones = ({num}) => {
  return (
    <div>
      <h1 className="message_v2 font-bignoodle m2_v2">
        MIRÁ NUESTRAS PROMOCIONES -----------------------
      </h1>
      <Plan
        imageSrc={Trimestral}
        altText="Promoción Trimestral"
        message="PLAN TRIMESTRAL"
        num={num}

      />
      <Plan
        imageSrc={Semestral}
        altText="Promoción Semestral"
        message="PLAN SEMESTRAL"
        num={num}
      />
      <Plan
        imageSrc={Anual}
        altText="Promoción Anual"
        message="PLAN ANUAL"
        num={num}
      />
      <Plan
        imageSrc={Macro}
        altText="Promoción Macro"
        message="PLAN MACRO"
        num={num}
      />
    </div>
  );
};

export default Promociones;
