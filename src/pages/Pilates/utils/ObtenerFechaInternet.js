import { useState, useEffect } from "react";

const ObtenerFechaInternet = () => {
  const [fecha, setFecha] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerFecha = async () => {
      try {
        const response = await fetch("https://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires");
        if (!response.ok) throw new Error("worldtimeapi.org falló");
        const data = await response.json();

        // Usamos la fecha local (sin pasar a UTC)
        const fechaArgentina = new Date(data.datetime);
        const año  = fechaArgentina.getFullYear();
        const mes  = String(fechaArgentina.getMonth() + 1).padStart(2, "0");
        const dia  = String(fechaArgentina.getDate()).padStart(2, "0");
        const fechaFormateada = `${año}-${mes}-${dia}`;

        setFecha(fechaFormateada); // ✅ "2025-10-07"
      } catch (error) {
        console.warn("No se pudo obtener la fecha desde worldtimeapi.org:", error.message);
        const fechaLocal = new Date();
        const año  = fechaLocal.getFullYear();
        const mes  = String(fechaLocal.getMonth() + 1).padStart(2, "0");
        const dia  = String(fechaLocal.getDate()).padStart(2, "0");
        const fechaFormateada = `${año}-${mes}-${dia}`;
        setFecha(fechaFormateada);
      } finally {
        setCargando(false);
      }
    };

    obtenerFecha();
  }, []);

  return { fecha, cargando };
};

export default ObtenerFechaInternet;
