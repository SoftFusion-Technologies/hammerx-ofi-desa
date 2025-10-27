import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const useInsertDataListaEspera = (endpoint) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${BASE_URL}${endpoint}`, data);
      return response.data;
    } catch (err) {
      setError(err.message || "Error al insertar");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { insert, isLoading, error };
};

export default useInsertDataListaEspera;