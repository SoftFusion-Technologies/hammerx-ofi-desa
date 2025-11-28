// hooks/useDeleteClientePilates.js
import { useState } from "react";
import axios from "axios";

const useDeleteClientePilates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deleteCliente = async (clienteId) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await axios.post(`http://localhost:8080/ventas-remarketing/mover-cliente-pilates`, {
        id_cliente_pilates: clienteId
      });
      // await axios.delete(`http://localhost:8080/clientes-pilates/con-inscripciones/${clienteId}`);

      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.mensajeError || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCliente, loading, error, success };
};

export default useDeleteClientePilates;
