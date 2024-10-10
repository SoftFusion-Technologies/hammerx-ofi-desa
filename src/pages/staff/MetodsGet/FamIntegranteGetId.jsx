import React, { useState } from 'react';
import '../../../styles/MetodsGet/GetUserId.css';
import FormAltaNota from '../../../components/Forms/FormAltaNota';
import { Link } from 'react-router-dom';
import FormAltaNotaFam from '../../../components/Forms/FormAltaNotaFam';
import { useAuth } from '../../../AuthContext';

// import FormAltaIntegranteConve from '../../../components/Forms/FormAltaIntegranteConve';
// import FormAltaFamiliarI from '../../../components/Forms/FormAltaFamiliarI';

const IntegranteDetails = ({ user, isOpen, onClose, obtenerIntegrantes2 }) => {
  if (!isOpen) {
    return null;
  }
  const [modalNewConve, setmodalNewConve] = useState(false);
  const [modalNewConve2, setmodalNewConve2] = useState(false);
  const { userLevel } = useAuth();

  const abrirModal = () => {
    setmodalNewConve(true);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
    obtenerIntegrantes2();
  };

  const abrirModal2 = () => {
    setmodalNewConve2(true);
  };
  const cerarModal2 = () => {
    setmodalNewConve2(false);
    obtenerIntegrantes2();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles del Familiar
          </h2>
          <div className="pr-2 cursor-pointer font-semibold" onClick={onClose}>
            x
          </div>
        </div>
        <p>
          <span className="font-semibold ">Nombre:</span> {user.nombre}
        </p>
        <p>
          <span className="font-semibold ">DNI:</span> {user.dni}
        </p>
        <p>
          <span className="font-semibold ">Teléfono:</span> {user.telefono}
        </p>
        <p>
          <span className="font-semibold ">Email:</span> {user.email}
        </p>
        {/* <p>
          <span className="font-semibold ">Sede:</span> {user.sede}
        </p> */}
        <p>
          <span className="font-semibold ">Notas:</span> {user.notas}
        </p>

        <hr className="my-4" />
        <div className="flex justify-center ">
          {
            /*
                      userLevel === 'gerente' ||
                      userLevel === 'vendedor' ||
                      userLevel === 'convenio' ||
                      */
            (userLevel === 'admin' || userLevel === 'administrador') && (
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Agregar Nota
                </button>
              </Link>
            )
          }
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaNotaFam
            isOpen={modalNewConve}
            onClose={cerarModal}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default IntegranteDetails;
