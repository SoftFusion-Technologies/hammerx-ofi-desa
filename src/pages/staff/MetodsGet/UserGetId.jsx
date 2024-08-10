import React from 'react';
import "../../../styles/MetodsGet/GetUserId.css";

const UserDetails = ({ user, isOpen, onClose, setSelectedUser }) => {
  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (user) {
      setSelectedUser(null);
    }
    onClose();
  };
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles del Usuario
          </h2>
          <div
            className="pr-2 cursor-pointer font-semibold"
            onClick={handleClose}
          >
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
          <span className="font-semibold ">Email:</span> {user.email}
        </p>
        <p>
          <span className="font-semibold ">Rol:</span> {user.level}
        </p>
        <p>
          <span className="font-semibold ">Sede:</span> {user.sede}
        </p>
      </div>
    </div>
  );
};

export default UserDetails;
