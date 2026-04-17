import { convertirHorasATotalMinutos } from "./calculosMarcaciones";

export const obtenerEtiquetaMobileDia = (registroDia) => {
  if (!registroDia) return null;

  const minutosAprobadas = convertirHorasATotalMinutos(
    registroDia.horasTotalesSinPendientes
  );

  if (minutosAprobadas > 0) {
    const horasAprobadas = Math.max(1, Math.floor(minutosAprobadas / 60));

    return {
      texto: `+${horasAprobadas}`,
      colorClase: "text-emerald-600",
    };
  }

  return {
    texto: "AUS",
    colorClase: "text-amber-500",
  };
};