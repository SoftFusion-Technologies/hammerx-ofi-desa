import { useState } from "react";
import axios from "axios";

const useInsertClientePilates = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const insertCliente = async (
    clienteData,
    inscripcionData,
    modify = false
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      let clienteId;

      if (modify && clienteData.id) {
        // Modificación del cliente existente (no se toca la inscripción)
        const response = await axios.put(
          `http://localhost:8080/clientes-pilates/${clienteData.id}`,
          clienteData
        );
        clienteId = response.data.cliente.id;
      } else {
        // Crear cliente nuevo
        const response = await axios.post(
          "http://localhost:8080/clientes/insertar",
          clienteData
        );
        clienteId = response.data.cliente.id;

        try {
          // Intentar crear inscripción
          await axios.post("http://localhost:8080/inscripciones-pilates", {
            ...inscripcionData,
            id_cliente: clienteId,
          });
        } catch (errorInscripcion) {
          // Si falla la inscripción, eliminar cliente recién creado
          await axios.delete(`http://localhost:8080/clientes-pilates/con-inscripciones/${clienteId}`);
          throw new Error(
            `La inscripción falló y se eliminó el cliente: ${errorInscripcion.response?.data?.mensajeError || errorInscripcion.message}`
          );
        }
      }

      setSuccess(true);
      return { clienteId };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { insertCliente, loading, error, success };
};

export default useInsertClientePilates;
