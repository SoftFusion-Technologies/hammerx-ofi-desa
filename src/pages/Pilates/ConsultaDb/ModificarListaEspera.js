import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const useUpdateDataListaEspera = (endpoint) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${BASE_URL}${endpoint}/${id}`, data);
      return response.data;
    } catch (err) {
      setError(err.message || "Error al modificar");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { update, isLoading, error };
};

export default useUpdateDataListaEspera;