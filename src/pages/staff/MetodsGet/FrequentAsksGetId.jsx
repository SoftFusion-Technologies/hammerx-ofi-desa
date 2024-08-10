
import React, { useState } from 'react';
import '../../../styles/MetodsGet/GetUserId.css';
import FormAltaNota from '../../../components/Forms/FormAltaNota';
import { Link } from 'react-router-dom';
import FormAltaNotaFam from '../../../components/Forms/FormAltaNotaFam';
import { useAuth } from '../../../AuthContext';


const FrequentDetails = ({ user, isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }
  const [modalNewConve, setmodalNewConve] = useState(false);
  const { userLevel } = useAuth();

  const abrirModal = () => {
    setmodalNewConve(true);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
  };

  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles de la pregunta
          </h2>
          <div className="pr-2 cursor-pointer font-semibold" onClick={onClose}>
            x
          </div>
        </div>
        <p>
          <span className="font-semibold ">Prioridad:</span> {user.orden}
        </p>
        <p>
          <span className="font-semibold ">Pregunta:</span> {user.titulo}
        </p>
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white p-8 rounded-lg shadow-lg w-full max-w-3xl mx-auto overflow-y-auto max-h-full">
            <button
              className="absolute top-0 right-0 m-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
            <h2 className="text-xl font-bold mb-4">{user.titulo}</h2>
            <p
              className="text-gray-700"
              dangerouslySetInnerHTML={{ __html: user.descripcion }}
            />
          </div>
        </div>
        <p>
          <span className="font-semibold ">Estado:</span> {user.estado}
        </p>

        <hr className="my-4" />
        <div className="flex justify-center ">
          {
            /*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */
           
          }
        </div>
      </div>
    </div>
  );
};

export default FrequentDetails;
