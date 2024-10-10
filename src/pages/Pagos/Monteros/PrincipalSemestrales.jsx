import React from 'react'
import '../../../styles/Pagos/styles/index_v2.css'
import Logo1 from '../../../images/Pagos/Images/logo1.png';
import Tarjeta from '../../../images/Pagos/Images/tarjetacredito.png';
import Transferencia from '../../../images/Pagos/Images/transferencia.png';
import Efectivo from '../../../images/Pagos/Images/efectivo.png';
import Promociones from '../../../components/Pagos/Promociones';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
const PrincipalSemestrales = () => {
    
const navigate = useNavigate();

const handleTransferenciaClick = () => {
  navigate('/pagos/monteros/semestral/transferencia', { replace: false });
};

const handleEfectivoClick = () => {
  navigate('/pagos/monteros/semestral/efectivo', { replace: false });
};

const handleDebitoClick = () => {
  navigate('/pagos/monteros/semestral/tarjeta-debito', { replace: false });
};
  const numMonteros = '3863564651';
  
    useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // El array vacío asegura que useEffect solo se ejecute al montar el componente

  const handleSemestralClick = () => {
    navigate('/pagos/monteros/semestral/cuotas', { state: { cuotas1: true, cuotas3: true, cuotas6: true, cuotas12: false } }); //cantidad de cuotas habilitadas
  };
  return (
    <div className="content_v2 back_v2">
      <img src={Logo1} alt="Logo1_v2" className="logo_v2" />
      <h1 className="message_v2 font-bignoodle">
        ¡Gracias por confiar en nosotros!
      </h1>
      <div className="plan-info_v2">
        <p className="plan-text_v2">
          Estás por abonar tu plan: Semestral (sede monteros)
        </p>
      </div>

      
      <div className="payment-info_v2" onClick={handleSemestralClick}>
        <img src={Tarjeta} alt="Tarjeta de débito" className="card-icon_v2" />
        <p className="payment-text_v2">Tarjeta de Crédito</p>
      </div>

      <div className="payment-info_v2" onClick={handleDebitoClick}>
        <img src={Tarjeta} alt="Tarjeta de débito" className="card-icon_v2" />
        <p className="payment-text_v2">Tarjeta de débito</p>
      </div>

      <div className="payment-info_v2" onClick={handleTransferenciaClick}>
        <img src={Transferencia} alt="Transferencia" className="card-icon_v2" />
        <p className="payment-text_v2">Transferencia</p>
      </div>

      <div className="payment-info_v2" onClick={handleEfectivoClick}>
        <img src={Efectivo} alt="Efectivo" className="card-icon_v2" />
        <p className="payment-text_v2">Efectivo</p>
      </div>
      <Promociones num={numMonteros}></Promociones>
    </div>
  );
}

export default PrincipalSemestrales