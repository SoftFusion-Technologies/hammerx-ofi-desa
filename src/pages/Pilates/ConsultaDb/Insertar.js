import { useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:8080";

const useInsertar = (endpoint, post = false) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const insert = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      if (post) {
        const response = await axios.post(`${BASE_URL}${endpoint}`, data);
        return response.data;
      }
      const response = await axios.put(`${BASE_URL}${endpoint}`, data);
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

export default useInsertar;