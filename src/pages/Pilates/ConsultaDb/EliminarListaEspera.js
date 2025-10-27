import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const useDeleteListaEspera = (endpoint) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const remove = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete(`${BASE_URL}${endpoint}/${id}`);
      return response.data;
    } catch (err) {
      setError(err.message || "Error al eliminar");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { remove, isLoading, error };
};

export default useDeleteListaEspera;