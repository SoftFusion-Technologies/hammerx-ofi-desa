import React, { useState, useEffect } from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import FormTestClass from '../components/Forms/FormTestClass';

const Miclasefree = () => {
  // Estado para controlar la apertura del modal de la clase gratis
  const [modalClaseFree, setModalClaseFree] = useState(false);

  // Efecto para abrir el modal automáticamente cuando se carga la página
  useEffect(() => {
    setModalClaseFree(true);
  }, []);

  // Métodos para cerrar el modal
  const cerarModal = () => {
    setModalClaseFree(false);
  };

  return (
    <div>
      <Navbar />
      <div className="loginbg h-screen w-full flex justify-between items-center mx-auto">
        {/* Se ha eliminado el botón porque ya no es necesario */}
      </div>
      {/* El formulario se abre automáticamente gracias al efecto */}
      <FormTestClass isOpen={modalClaseFree} onClose={cerarModal} />
      <Footer />
    </div>
  );
};

export default Miclasefree;
