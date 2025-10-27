import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const useModify = (endpoint) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = async (id, data) => {
    setIsLoading(true);
    setError(null);
    try {
      const URL_COMPLETA = `${BASE_URL}${endpoint}${id ? `/${id}` : ""}`;
      console.log("La URL completa es:", URL_COMPLETA);
      const response = await axios.put(URL_COMPLETA, data);
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

export default useModify;
