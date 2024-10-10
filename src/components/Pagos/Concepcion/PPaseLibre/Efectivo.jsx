import React,{useEffect} from 'react'
import '../../../../styles/Pagos/styles/efectivo.css'
import Promociones from '../../Promociones';
import BackButton from '../../Arrow';

const Efectivo = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  const numConcepcion = '3865855100';
  
  return (
    <div className="content-efectivo_v2 font-bignoodle">
      <div className="header_2">
        <div>
          <p className="fondo_v2">EFECTIVO</p>
          <p className="title_v2">EFECTIVO</p>
        </div>
        <div className="backarrow">
          <BackButton />
        </div>
      </div>
      <div className="box-efectivo_v2">
        <h1 className="box-title_v2">
          ¡Tu plan ya se encuentra renovado! Acercate a la recepción de tu Sede
          para que juntos gestionemos tu pago en efectivo.
        </h1>
        <p style={{ color: 'black', zIndex: '10', fontSize: '23px' }}>
          TOTAL A ABONAR $24.500
        </p>
        <p className="box-text_v2">GRACIAS POR ELEGIRNOS</p>
      </div>
      <Promociones num={numConcepcion} />
    </div>
  );
}

export default Efectivo
