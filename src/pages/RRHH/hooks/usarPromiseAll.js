/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para la ejecución simultánea de múltiples peticiones HTTP mediante Promise.all. Optimiza el rendimiento de la carga inicial al agrupar consultas, gestiona estados de carga y error unificados, e incorpora un sistema de cancelación (AbortController) para evitar colisiones de datos si el componente se desmonta o se repite la petición.
*/
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";

const URL_BASE = "http://localhost:8080";

export const usarPromiseAll = (configuracionesIniciales = [], ejecutarAutomaticamente = true) => {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const abortControllerRef = useRef(null);

  const ejecutar = useCallback(async (configs = configuracionesIniciales) => {
    try {
      setCargando(true);
      setError(null);

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const promesas = configs.map((config) => {
        const {
          endpoint,
          metodo = "GET",
          params = null,
          body = null,
          headers = {}
        } = config;

        return axios({
          url: `${URL_BASE}/${endpoint}`,
          method: metodo,
          params: params,
          data: body,
          headers: {
            "Content-Type": "application/json",
            ...headers
          },
          signal: abortControllerRef.current.signal
        }).then((respuesta) => respuesta.data);
      });

      const resultados = await Promise.all(promesas);

      setDatos(resultados);

    } catch (err) {
      if (axios.isCancel(err)) return;

      setError(
        err.response?.data?.message ||
        err.message ||
        "Error inesperado"
      );
    } finally {
      setCargando(false);
    }
  }, []); // 👈 sin dependencias problemáticas

  useEffect(() => {
    if (ejecutarAutomaticamente) {
      ejecutar();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [ejecutarAutomaticamente, ejecutar]);

  return {
    datos,
    cargando,
    error,
    ejecutar
  };
};
