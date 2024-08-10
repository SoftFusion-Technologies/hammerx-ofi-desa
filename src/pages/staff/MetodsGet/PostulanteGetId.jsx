import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../../../styles/MetodsGet/GetUserId.css";
import FormAltaValoracion from '../../../components/Forms/FormAltaValoracion';

const PostulanteDetails = ({ user, isOpen, onClose, obtenerPostulantes }) => {
  if (!isOpen) {
    return null;
  }
  const [modalNewConve, setmodalNewConve] = useState(false);

  const abrirModal = () => {
    setmodalNewConve(true);
  };
  const cerarModal = () => {
    setmodalNewConve(false);
    obtenerPostulantes();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles del Postulante
          </h2>
          <div className="pr-2 cursor-pointer font-semibold" onClick={onClose}>
            x
          </div>
        </div>
        <p>
          <span className="font-semibold ">ID:</span> {user.id}
        </p>
        <p>
          <span className="font-semibold ">Nombre:</span> {user.name}
        </p>
        <p>
          <span className="font-semibold ">Email:</span> {user.edad}
        </p>
        <p>
          <span className="font-semibold ">Email:</span> {user.sexo}
        </p>
        <p>
          <span className="font-semibold ">Rol:</span> {user.puesto}
        </p>
        <p>
          <span className="font-semibold ">Sede:</span> {user.sede}
        </p>
        <p>
          <span className="font-semibold ">Valoracion:</span> {user.valoracion}
        </p>
        <p>
          <span className="font-semibold ">Información:</span> {user.info}
        </p>
        <p>
          <span className="font-semibold ">Observaciones:</span>{' '}
          {user.observaciones}
        </p>

        <hr className="my-4" />
        <div className="flex justify-center ">
          <Link to="#">
            <button
              onClick={abrirModal}
              className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
            >
              Valorar
            </button>
          </Link>
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaValoracion
            isOpen={modalNewConve}
            onClose={cerarModal}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

export default PostulanteDetails;
