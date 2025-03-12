import React from 'react';
// import Macro from '../../images/Promociones/macro.png';
// import Trimestral from '../../images/Promociones/trimestral.png';
// import Semestral from '../../images/Promociones/semestral.png';
// import Anual from '../../images/Promociones/anual.png';
import LogoSoftFusion from '../../images/marcas/comercio9.png'; // Asegúrate de que la ruta sea correcta
import PromoBNA_V2 from '../../pages/soycliente/PromosBancarias/PromoBNA_V3.jpg';
import PromoSantander_V2 from '../../pages/soycliente/PromosBancarias/PromoSantander_V3.jpeg';
import PromoNXJueves from '../../pages/soycliente/PromosBancarias/PromoNXJueves.jpeg';
import PromoNXZ from '../../pages/soycliente/PromosBancarias/PromoNXZ.jpeg';
import PromoMacro_V3 from '../../pages/soycliente/PromosBancarias/PromoMacro_V3.jpeg';
import PromoGalicia_V2 from '../../pages/soycliente/PromosBancarias/promo-galicia_V2.jpg';
import PromoPlanes from '../../pages/soycliente/PromosBancarias/PromoPlanes.jpeg';
import promosucredito from '../../pages/soycliente/PromosBancarias/promo-sucredito.jpg';

const Promociones = () => {
  return (
    <div className="p-4 bg-gray-500 from-gray-700">
      {/* Título */}
      <h2 className="text-white font-bignoodle  text-4xl sm:text-7xl font-bold uppercase text-center mt-12 mb-10">
        Conocé todas nuestras promociones
      </h2>

      {/* Cuadrícula de Imágenes */}

      {/* PRIMERA Cuadrícula de Imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-10">
        <div className="relative group">
          <img
            src={PromoBNA_V2}
            alt="PromoBNA_V2"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="relative group">
          <img
            src={PromoSantander_V2}
            alt="PromoSantander_V2"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="relative group">
          <img
            src={promosucredito}
            alt="PromoSantander_V2"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="relative group">
          <img
            src={PromoPlanes}
            alt="PromoSantander_V2"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        {/* <div className="relative group">
          <img
            src={PromoNXJueves}
            alt="PromoNXJueves"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="relative group">
          <img
            src={PromoNXZ}
            alt="PromoNXJueves"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div> */}
        <div className="relative group">
          <img
            src={PromoMacro_V3}
            alt="PromoMacro_V3"
            className="mb-10 w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="relative group">
          <img
            src={PromoGalicia_V2}
            alt="PromoGalicia_V2"
            className="w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Imagen promo planes  */}
      <div className="grid place-items-center mb-8">
        {/* <img
          // src={PromoPlanes}
          // alt="macro"
          className="w-3/4 h-auto mx-auto object-cover transform group-hover:scale-110 transition-transform duration-300"
        /> */}
        {/* <img src={Macro} alt="macro" className="w-full h-auto object-cover" />

        <img
          src={Trimestral}
          alt="Trimestral"
          className="w-full h-auto object-cover"
        />
        <img
          src={Semestral}
          alt="Semestral"
          className="w-full h-auto object-cover"
        />
        <img src={Anual} alt="Anual" className="w-full h-auto object-cover" /> */}
      </div>

      {/* Texto y Logo de Soft Fusion */}
      <a
        href="https://softfusion.com.ar/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center text-gray-500"
      >
        <div className="flex flex-col items-center text-white">
          <p className="mb-2 text-1xl font-bignoodle md:text-2xl">
            Este sitio está desarrollado por SoftFusion
          </p>
          <img
            src={LogoSoftFusion}
            alt="Soft Fusion Logo"
            className="w-40 h-auto"
          />
        </div>
      </a>
    </div>
  );
};

export default Promociones;
