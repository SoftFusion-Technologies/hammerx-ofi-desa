import React, { useState, useEffect } from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import ModalContratos from './soycliente/ModalContratos';

const CongelamientosCont = () => {
  return (
    <div>
      <Navbar />
      <div className="loginbg h-screen w-full flex justify-between items-center mx-auto">
        {/* Se ha eliminado el botón porque ya no es necesario */}
      </div>
      <ModalContratos bandera={0} />
      <Footer />
    </div>
  );
};

export default CongelamientosCont;
