import React from 'react';
import '../../../styles/MetodsGet/GetUserId.css';

const SedesDetails = ({ Sedes, isOpen, onClose, setSelectedSedes }) => {
  if (!isOpen || !Sedes) return null;

  const handleClose = () => {
    setSelectedSedes(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles de la sede
          </h2>
          <div
            className="pr-2 cursor-pointer font-semibold"
            onClick={handleClose}
          >
            x
          </div>
        </div>
        <p>
          <span className="font-semibold">ID:</span> {Sedes.id}
        </p>
        <p>
          <span className="font-semibold">Nombre:</span> {Sedes.nombre}
        </p>
        <p>
          <span className="font-semibold">Estado:</span> {Sedes.estado}
        </p>
        <p>
          <span className="font-semibold">Creado:</span> {Sedes.created_at}
        </p>
      </div>
    </div>
  );
};

export default SedesDetails;
