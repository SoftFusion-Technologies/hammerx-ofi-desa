import React,{useState, useEffect} from 'react';
import { useAuth } from '../../../AuthContext';
import axios from 'axios';

const ModalNovedad = ({ isOpen, onClose, mensaje, obtenerNovedades }) => {
  if (!isOpen) return null;

  const URL = 'http://localhost:8080/novedades/';
  const [novedades, setNovedades] = useState([]);
  const [estado, setEstado] = useState(1);
  const { userLevel, userName } = useAuth(); // Se obtiene el userName del contexto

  useEffect(() => {
    obtenerNovedades();
  }, []); // Este efecto se ejecuta solo al montar el componente

  const actualizarEstado = () => {
    setEstado(0)
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white p-6 rounded shadow-lg z-10">
        <h2 className="text-xl font-semibold mb-4">Detalle de la Novedad</h2>
        <div
          className="text-gray-800 mb-4 overflow-y-auto max-w-[900px]"
          dangerouslySetInnerHTML={{ __html: mensaje }}
        />
{/* 
        {(userLevel === 'gerente' || userLevel === 'vendedor') && (
          <button
            onClick={actualizarEstado}
            className={`py-2 px-4 rounded mr-2 text-white ${
              estado === 1
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {estado === 1 ? 'No Leído' : 'Leído'}
          </button>
        )} */}

        <button
          onClick={onClose}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default ModalNovedad;