import React, {useEffect} from 'react';
import '../../../../styles/Pagos/styles/transferencia.css';
// import copy from '../../Images/copy.png';
import copy from '../../../../images/Pagos/Images/copy.png';
import Promociones from '../../Promociones';
import BackButton from '../../Arrow';

const Transferencia = () => {
  const handleCopyClick = () => {
    const cbu = '0000003100078710747645';
    navigator.clipboard
      .writeText(cbu)
      .then(() => {
        alert('CBU copiado al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar el CBU: ', err);
      });
  };

  const numConcepcion = '3865855100';

  return (
    <>
      <div className="contenttr_v2">
        <div className="backarrow_v2">
          <BackButton />
        </div>
        <div className="tr_v2">
          <div>
            <p className="fondo_v2 font-bignoodle">Transferencias</p>
            <h1 className="font-bignoodle">Transferencias</h1>
          </div>
        </div>
        <div className="cbubox_v2 font-bignoodle">
          <div className="overlay_v2"></div>
          <h2 className="h2_v2">Plan Anual Concepción</h2>
          <p className="texttr_v2">REALIZÁ TUS TRANSFERENCIAS AL SIGUIENTE CBU</p>
          <div className="cbu-container_v2">
            <p className="cbutext_v2">0000003100078710747645</p>
            <img
              className="copy-icon_v2"
              src={copy}
              alt="Copy Icon"
              onClick={handleCopyClick}
            />
          </div>
          <p className="texttr_v2">
            Para poder gestionar tu pago no te olvides de descargar tu factura y
            enviarla al siguiente número
          </p>{' '}
          <p className="textnum_v2">
            <span className="num">3865855100</span>{' '}
            <a
              href="https://api.whatsapp.com/send?phone=543865855100"
              target="_blank"
              className="click_v2"
            >
              o hacé click aquí
            </a>
          </p>
          <p className="abonar_v2">Total a abonar: $276.000 (¡3 MESES GRATIS!)</p>
        </div>
        <Promociones num={ numConcepcion } />
      </div>
    </>
  );
}

export default Transferencia;