/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para centralizar la lógica de peticiones HTTP DELETE. Gestiona automáticamente los estados de carga, errores y la respuesta del servidor, permitiendo eliminar registros de la base de datos de forma segura y consistente en toda la aplicación.
*/
import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

const construirUrl = (endpoint) => {
  if (!endpoint) return API_BASE_URL;
  return endpoint.startsWith("/")
    ? `${API_BASE_URL}${endpoint}`
    : `${API_BASE_URL}/${endpoint}`;
};

const useEliminarDatos = () => {
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const eliminar = useCallback(async (endpoint, params = {}) => {
    try {
      setCargando(true);
      setError(null);
      const resultado = await axios.delete(construirUrl(endpoint), {
        params
      });

      setRespuesta(resultado.data);
      return resultado.data;

    } catch (err) {

      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        "Error al eliminar los datos";

      setError(mensajeError);
      throw err;

    } finally {
      setCargando(false);
    }
  }, []);

  return { respuesta, cargando, error, eliminar };
};

export default useEliminarDatos;