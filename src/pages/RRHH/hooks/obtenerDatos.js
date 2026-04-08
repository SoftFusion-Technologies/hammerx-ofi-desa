/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Hook personalizado para la obtención de datos mediante peticiones HTTP GET. Automatiza el ciclo de vida de la consulta, gestionando los estados de carga y error de forma nativa. Incluye una función de re-petición (refetch) y se sincroniza automáticamente con el endpoint proporcionado, sirviendo como el motor principal de lectura para los componentes de la interfaz.
*/
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = "http://localhost:8080";

const useObtenerDatos = (endpoint) => {
    const [datos, setDatos] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const realizarPeticion = useCallback(async () => {
        try {
            setCargando(true);
            setError(null);
            const respuesta = await axios.get(`${API_BASE_URL}${endpoint}`);
            setDatos(respuesta.data);
        } catch (err) {
            setError(err.response?.data?.mensaje || "Error al obtener los datos");
        } finally {
            setCargando(false);
        }
    }, [endpoint]);

    useEffect(() => {
        realizarPeticion();
    }, [realizarPeticion]);

    return { datos, cargando, error, realizarPeticion };
};

export default useObtenerDatos;