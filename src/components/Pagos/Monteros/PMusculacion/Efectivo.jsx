import React from 'react'
import '../../../../styles/Pagos/styles/efectivo.css'
import Promociones from '../../Promociones';
import BackButton from '../../Arrow';

const Efectivo = () => {
const numMonteros = '3863564651'
  return (
    <div className="content-efectivo_v2 font-bignoodle">
      <div className="backarrow">
        <BackButton />
      </div>
      <div className="title">
        <p className="fondo-efectivo_v2">EFECTIVO</p>
        <h1 className="title-text_v2">EFECTIVO</h1>
      </div>
      <div className="box-efectivo_v2">
        <h1 className="box-title_v2">
          ¡Tu plan ya se encuentra renovado! Acercate a la recepción de tu Sede
          para que juntos gestionemos tu pago en efectivo.
        </h1>
        <p style={{ color: 'black', zIndex: '10', fontSize: '23px' }}>
          TOTAL A ABONAR $19.000
        </p>
        <p className="box-text_v2">GRACIAS POR ELEGIRNOS</p>
      </div>
      <Promociones num={numMonteros} />
    </div>
  );
}

export default Efectivo
