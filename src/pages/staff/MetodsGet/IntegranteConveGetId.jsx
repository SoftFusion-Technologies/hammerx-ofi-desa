import React, { useState } from 'react';
import '../../../styles/MetodsGet/GetUserId.css';
import FormAltaNota from '../../../components/Forms/FormAltaNota';
import { Link } from 'react-router-dom';
import FormAltaIntegranteConve from '../../../components/Forms/FormAltaIntegranteConve';
import FormAltaFamiliarI from '../../../components/Forms/FormAltaFamiliarI';
import { useAuth } from '../../../AuthContext';
import axios from 'axios'; // Importa Axios para hacer las solicitudes HTTP

const IntegranteDetails = ({
  id_conv,
  user,
  isOpen,
  onClose,
  obtenerIntegrantes2,
  permiteFam,
  cantFamiliares
}) => {
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

  // Función para solicitar autorización - R6-Autorizar Integrantes - BO -15-09-2024
  const solicitarAutorizacion = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        {
          estado_autorizacion: 'pendiente'
        }
      );
      alert('Solicitud de autorización enviada con éxito');
      obtenerIntegrantes2(); // Refresca la lista de integrantes
    } catch (error) {
      console.error('Error al solicitar autorización', error);
    }
  };

  // Función para autorizar al integrante
  const autorizarIntegrante = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        {
          estado_autorizacion: 'autorizado'
        }
      );
      alert('Integrante autorizado con éxito');
      obtenerIntegrantes2(); // Refresca la lista de integrantes
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al autorizar', error);
    }
  };

  // Función para no autorizar al integrante
  const noAutorizarIntegrante = async () => {
    try {
      await axios.put(
        `http://localhost:8080/integrantes/${user.id}/autorizar`,
        {
          estado_autorizacion: 'sin_autorizacion'
        }
      );
      alert('Integrante no autorizado con éxito');
      obtenerIntegrantes2(); // Refresca la lista de integrantes
      onClose(); // Cierra el modal
    } catch (error) {
      console.error('Error al no autorizar', error);
    }
  };
  //R6 - Autorizar Integrantes - BO- 15-09-24 - final
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between text-[20px] pb-4 items-center">
          <h2 className="font-bignoodle tracking-wide text-[#fc4b08]">
            Detalles del Integrante
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
        <p>
          <span className="font-semibold ">Sede:</span> {user.sede}
        </p>
        <p>
          <span className="font-semibold ">Creado por:</span> {user.userName}
        </p>
        <p>
          <span className="font-semibold ">El dia :</span> {user.fechaCreacion}
        </p>
        <p>
          <span className="font-semibold ">Notas:</span> {user.notas}
        </p>

        <hr className="my-4" />
        <div className="flex flex-wrap gap-4 justify-center">
          {(userLevel === 'admin' ||
            userLevel === 'administrador' ||
            userLevel === 'gerente' ||
            userLevel === 'vendedor') && (
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100"
              >
                Agregar Nota
              </button>
            </Link>
          )}
          {/* Modal para abrir formulario de clase gratis */}
          <FormAltaNota
            isOpen={modalNewConve}
            onClose={cerarModal}
            user={user}
          />
          {Number(permiteFam) === 1 && (
            <Link
              to={`/dashboard/admconvenios/${id_conv}/integrantes/${user.id}/integrantesfam/`}
            >
              <button className="bg-[#298dc0] hover:bg-[#1a4469] text-white py-2 px-4 rounded transition-colors duration-100">
                Ver Familiar
              </button>
            </Link>
          )}

          {/* R6 - Autorizar Integrantes */}
          {(userLevel === 'gerente' || userLevel === 'vendedor') && (
            <button
              onClick={solicitarAutorizacion}
              className="bg-[#fc4b08] hover:bg-[#bf360c] text-white py-2 px-4 rounded transition-colors duration-100"
            >
              Solicitar Autorización
            </button>
          )}

          {/* Botones para autorización */}
          {(userLevel === 'admin' || userLevel === 'administrador') && (
            <div className="flex gap-4">
              <button
                onClick={autorizarIntegrante}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100"
              >
                Autorizar
              </button>
              <button
                onClick={noAutorizarIntegrante}
                className="bg-[#e74c3c] hover:bg-[#c0392b] text-white py-2 px-4 rounded transition-colors duration-100"
              >
                No Autorizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntegranteDetails;
