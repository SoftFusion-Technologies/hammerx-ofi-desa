import React from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { Link } from 'react-router-dom';

const NotFound = () => {

  return (
    <div className=" flex flex-col min-h-screen">
      <Navbar />
      <div className="loginbg flex-grow flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-lg">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Página no encontrada
          </h1>
          <p className="text-lg text-gray-600 mb-5">
            Lamentamos decirte que la página que estás buscando aún no existe.
          </p>
          {/* Botón para volver al inicio */}
          <Link
            to="/"
            className="bg-[#fc4b08] hover:bg-orange-500 text-white py-2 px-6 rounded-lg transition duration-200 ease-in-out"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
