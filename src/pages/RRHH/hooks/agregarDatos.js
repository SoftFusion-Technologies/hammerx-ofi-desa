/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para gestionar peticiones HTTP POST de forma centralizada. Automatiza el manejo de estados de carga (loading), errores y respuestas del servidor, facilitando la inserción de nuevos registros en la base de datos a través de una interfaz simplificada y reutilizable en cualquier componente de la aplicación.
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

const useAgregarDatos = () => {
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const agregar = useCallback(async (endpoint, body = {}, opciones = {}) => {
    try {
      setCargando(true);
      setError(null);

      const { headers = {}, params = null } = opciones;

      const resultado = await axios.post(construirUrl(endpoint), body, {
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
        "Error al agregar los datos";

      setError(mensajeError);
      throw err;
    } finally {
      setCargando(false);
    }
  }, []);

  return { respuesta, cargando, error, agregar };
};

export default useAgregarDatos;
