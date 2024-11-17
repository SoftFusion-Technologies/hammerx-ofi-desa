import React from 'react';
import '../../../../styles/MetodsGet/GetUserId.css';

const AlumnoDetails = ({ alumno, isOpen, onClose, setSelectedAlumn }) => {
  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    onClose();
  };

  const formatearFecha = (fecha) => {
    const fechaObj = new Date(fecha);
    const año = fechaObj.getFullYear();
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const horas = String(fechaObj.getHours()).padStart(2, '0');
    const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
    const segundos = String(fechaObj.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${año} ${horas}:${minutos}:${segundos}`;
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles del Alumno
          </h2>
          <div
            className="pr-2 cursor-pointer font-semibold"
            onClick={handleClose}
          >
            x
          </div>
        </div>
        <p>
          <span className="font-semibold ">ID:</span> {alumno.id}
        </p>
        <p>
          <span className="font-semibold ">Nombre:</span> {alumno.nombre}
        </p>
        <p>
          <span className="font-semibold ">Fecha de creación:</span>{' '}
          {formatearFecha(alumno.fecha_creacion)}
        </p>
        <p>
          <span className="font-semibold ">N/A/P : </span> {alumno.prospecto}
        </p>
        <p>
          <span className="font-semibold ">Convertido: </span> {alumno.c}
        </p>
        <p>
          <span className="font-semibold">Celular:</span> {alumno.celular}
        </p>
        <p>
          <span className="font-semibold ">Punto D:</span> {alumno.punto_d}
        </p>
        <p>
          <span className="font-semibold ">Observaciones:</span> {alumno.motivo}
        </p>
      </div>
    </div>
  );
};

export default AlumnoDetails;
