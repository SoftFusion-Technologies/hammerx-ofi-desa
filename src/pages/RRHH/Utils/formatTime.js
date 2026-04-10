// Utilidad para normalizar/formatar horas sin segundos
export const quitarSegundos = (hora) => {
  if (!hora && hora !== 0) return "";

  // Date object
  if (hora instanceof Date) {
    const hh = String(hora.getHours()).padStart(2, "0");
    const mm = String(hora.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // String handling: acepta formatos "HH:MM:SS", "HH:MM" o ISO "YYYY-MM-DDTHH:MM:SS"
  try {
    const s = String(hora);

    // Si es ISO con 'T', tomar la parte después de la T
    const timePart = s.includes("T") ? s.split("T")[1] : s;

    const parts = timePart.split(":");
    const hh = parts[0] ?? "";
    const mm = parts[1] ?? "00";

    if (!hh) return s;

    return `${hh.padStart(2, "0")}:${mm.slice(0, 2).padStart(2, "0")}`;
  } catch (e) {
    return String(hora);
  }
};

export default quitarSegundos;
