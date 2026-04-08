/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para gestionar peticiones HTTP PATCH de manera centralizada. Permite realizar modificaciones parciales en los recursos del servidor, controlando automáticamente los estados de carga, errores y la respuesta obtenida, optimizando la reutilización de lógica de actualización en toda la plataforma.
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

const useModificarDatosPatch = () => {
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const modificarPatch = useCallback(async (endpoint, body = {}, opciones = {}) => {
    try {
      setCargando(true);
      setError(null);

      const { headers = {}, params = null } = opciones;

      const resultado = await axios.patch(construirUrl(endpoint), body, {
        headers: {
          "Content-Type": "application/json",
          ...headers
        },
        params
      });

      setRespuesta(resultado.data);
      return resultado.data;
    } catch (err) {
      const mensajeError =
        err.response?.data?.mensaje ||
        err.response?.data?.message ||
        err.message ||
        "Error al modificar los datos con PATCH";

      setError(mensajeError);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return { respuesta, cargando, error, modificarPatch };
};

export default useModificarDatosPatch;
