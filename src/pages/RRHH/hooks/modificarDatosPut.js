/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para centralizar peticiones HTTP PUT. Se utiliza para la actualización integral de recursos en el servidor, gestionando de forma automática los estados de carga, la captura de errores y el almacenamiento de la respuesta, garantizando un comportamiento uniforme en toda la lógica de edición del sistema.
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

const useModificarDatosPut = () => {
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const modificarPut = useCallback(async (endpoint, body = {}, opciones = {}) => {
    try {
      setCargando(true);
      setError(null);

      const { headers = {}, params = null } = opciones;
      const esFormData = typeof FormData !== "undefined" && body instanceof FormData;

      const resultado = await axios.put(construirUrl(endpoint), body, {
        headers: {
          ...(esFormData ? {} : { "Content-Type": "application/json" }),
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
        "Error al modificar los datos con PUT";

      setError(mensajeError);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return { respuesta, cargando, error, modificarPut };
};

export default useModificarDatosPut;
