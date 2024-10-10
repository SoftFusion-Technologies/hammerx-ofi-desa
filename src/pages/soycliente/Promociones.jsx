import React from 'react';
import Macro from '../../images/Promociones/macro.png';
import Trimestral from '../../images/Promociones/trimestral.png';
import Semestral from '../../images/Promociones/semestral.png';
import Anual from '../../images/Promociones/anual.png';
import LogoSoftFusion from '../../images/marcas/comercio9.png'; // Asegúrate de que la ruta sea correcta

const Promociones = () => {
  return (
    <div  className="p-4 bg-gray-500 from-gray-700" >
      {/* Título */}
      <h2 className="text-white font-bignoodle  text-4xl sm:text-7xl font-bold uppercase text-center mt-12 mb-10">
        Conocé todas nuestras promociones
      </h2>

      {/* Cuadrícula de Imágenes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <img src={Macro} alt="Macro" className="w-full h-auto object-cover" />
        <img src={Trimestral} alt="Trimestral" className="w-full h-auto object-cover" />
        <img src={Semestral} alt="Semestral" className="w-full h-auto object-cover" />
        <img src={Anual} alt="Anual" className="w-full h-auto object-cover" />
      </div>

      {/* Texto y Logo de Soft Fusion */}
   <a href="https://softfusion.com.ar/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-gray-500">
      <div className="flex flex-col items-center text-white">
        <p className="mb-2 text-1xl font-bignoodle md:text-2xl">
          Este sitio está desarrollado por SoftFusion
        </p>
        <img src={LogoSoftFusion} alt="Soft Fusion Logo" className="w-40 h-auto" />
        </div>
      </a>
    </div>
  );
};

export default Promociones;
