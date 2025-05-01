import React from 'react';
import '../../../styles/MetodsGet/GetUserId.css';

const QuejasDetails = ({ queja, isOpen, onClose, setSelectedQueja }) => {
  if (!isOpen || !queja) return null;

  const handleClose = () => {
    setSelectedQueja(null);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles de la Queja
          </h2>
          <div
            className="pr-2 cursor-pointer font-semibold"
            onClick={handleClose}
          >
            x
          </div>
        </div>

        <p>
          <span className="font-semibold">ID:</span> {queja.id}
        </p>
        <p>
          <span className="font-semibold">Fecha:</span>{' '}
          {new Date(queja.fecha).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Cargado por:</span>{' '}
          {queja.cargado_por}
        </p>
        <p>
          <span className="font-semibold">Nombre:</span> {queja.nombre}
        </p>
        <p>
          <span className="font-semibold">Tipo de Usuario:</span>{' '}
          {queja.tipo_usuario}
        </p>
        <p>
          <span className="font-semibold">Contacto:</span> {queja.contacto}
        </p>
        <p>
          <span className="font-semibold">Motivo:</span> {queja.motivo}
        </p>
        <p>
          <span className="font-semibold">Resuelto:</span>{' '}
          {queja.resuelto ? 'Sí' : 'No'}
        </p>
        {Number(queja.resuelto) === 1 &&
          queja.resuelto_por &&
          queja.fecha_resuelto && (
            <>
              <p>
                <span className="font-semibold">Resuelto por:</span>{' '}
                {queja.resuelto_por}
              </p>
              <p>
                <span className="font-semibold">Fecha Resuelto:</span>{' '}
                {new Date(queja.fecha_resuelto).toLocaleString()}
              </p>
            </>
          )}

        <p>
          <span className="font-semibold">Sede:</span> {queja.sede}
        </p>
        {/* <p>
          <span className="font-semibold">Creado desde QR:</span>{' '}
          {queja.creado_desde_qr ? 'Sí' : 'No'}
        </p> */}
      </div>
    </div>
  );
};

export default QuejasDetails;
