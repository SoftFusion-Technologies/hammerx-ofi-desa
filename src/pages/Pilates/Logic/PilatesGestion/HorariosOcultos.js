import { useState, useEffect } from "react";

const useGrillaMinimizada = () => {
  const [horariosMinimizados, setHorariosMinimizados] = useState([]);

  // 1. Cargar preferencias (igual que antes)
  useEffect(() => {
    const guardado = localStorage.getItem("horarios_minimizados");
    if (guardado) {
      try {
        const parseado = JSON.parse(guardado);
        if (Array.isArray(parseado)) {
          setHorariosMinimizados(parseado);
        }
      } catch (error) {
        console.error("Error al leer preferencias:", error);
      }
    }
  }, []);

  // 2. Alternar individual (igual que antes)
  const alternarMinimizacionHorario = (hora) => {
    setHorariosMinimizados((listaActual) => {
      let nuevaLista;
      if (listaActual.includes(hora)) {
        nuevaLista = listaActual.filter((h) => h !== hora);
      } else {
        nuevaLista = [...listaActual, hora];
      }
      localStorage.setItem("horarios_minimizados", JSON.stringify(nuevaLista));
      return nuevaLista;
    });
  };

  // --- NUEVA FUNCIÓN: Control Global ---
  const manejarMinimizacionGlobal = (todasLasHoras, minimizar = true) => {
    let nuevaLista = [];
    if (minimizar) {
      nuevaLista = [...todasLasHoras]; // Llenamos con TODAS las horas
    } else {
      nuevaLista = []; // Vaciamos la lista
    }
    setHorariosMinimizados(nuevaLista);
    localStorage.setItem("horarios_minimizados", JSON.stringify(nuevaLista));
  };

  return {
    horariosMinimizados,
    alternarMinimizacionHorario,
    manejarMinimizacionGlobal, // <--- Exportamos la nueva función
  };
};

export default useGrillaMinimizada;