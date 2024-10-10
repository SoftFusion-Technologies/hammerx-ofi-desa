import React,{useEffect} from 'react';
import '../../../../styles/Pagos/styles/transferencia.css';
import Promociones from '../../Promociones';
import BackButton from '../../Arrow';

const TarjetaDebito = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  const numMonteros = '3863564651';
  
  return (
    <>
      <div className="contenttr_v2">
        <div className="backarrow_v2">
          <BackButton />
        </div>
        <div className="tr_v2">
          <div>
            <p className="fondo_v2 font-bignoodle">Tarjeta de Débito</p>
            <h1 className="font-bignoodle title">Tarjeta de Débito</h1>
          </div>
        </div>
        <div className="cbubox_v2 font-bignoodle">
          <div className="overlay_v2"></div>
          <h2 className="h2_v2">Plan Semestral Monteros</h2>
          <p className="texttr_v2">
            Ingresa al siguiente link e ingresa los datos de tu tarjeta:
          </p>
          <a
            href="https://mobbex.com/p/commerce/item/u1mZZ8fZF/"
            target="_blank"
            style={{ position: 'relative', fontSize: '25px' }}
          >
            Realizar pago
          </a>
          <p className="texttr_v2">
            Para poder gestionar tu pago no te olvides de descargar tu factura y
            enviarla al siguiente número
          </p>
          <p className="textnum_v2">
            <span className="num_v2">3863564651</span>{' '}
            <a
              href="https://api.whatsapp.com/send?phone=543863564651"
              className="click_v2"
              target="_blank"
            >
              o hacé click aquí
            </a>
          </p>
          <p className="abonar_v2">Total a abonar: $114.000</p>
        </div>
        <Promociones num={numMonteros} />
      </div>
    </>
  );
}

export default TarjetaDebito;