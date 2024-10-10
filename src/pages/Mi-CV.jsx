import React, { useState, useEffect } from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import FormPostulante from '../components/Forms/FormPostulante';

const MiCV = () => {
  // Estado para controlar la apertura del modal de la clase gratis
  const [modalTrabajarConUstedes, setModalTrabajarConUstedes] = useState(false);

  // Efecto para abrir el modal automáticamente cuando se carga la página
  useEffect(() => {
    setModalTrabajarConUstedes(true);

  }, []);

  const desactivarModalTrabajar = () => {
    setModalTrabajarConUstedes(false);
  };

  return (
    <div>
      <Navbar />
      <div className="loginbg h-screen w-full flex justify-between items-center mx-auto">
        {/* Se ha eliminado el botón porque ya no es necesario */}
      </div>
      {/* El formulario se abre automáticamente gracias al efecto */}
      <FormPostulante
        isOpen={modalTrabajarConUstedes}
        onClose={desactivarModalTrabajar}
      />
      <Footer />
    </div>
  );
};

export default MiCV;
