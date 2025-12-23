import { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const buildUrl = (baseUrl, endpoint) => {
  if (!endpoint) return null;
  const normalizedEndpoint = String(endpoint).startsWith("/")
    ? String(endpoint)
    : `/${endpoint}`;
  return `${String(baseUrl).replace(/\/+$/, "")}${normalizedEndpoint}`;
};

const useConsultaDB = (endpoint) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchData = async () => {
    const url = buildUrl(BASE_URL, endpoint);
    if (!url) {
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(url);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.log(err.message)
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
};

export default useConsultaDB;
