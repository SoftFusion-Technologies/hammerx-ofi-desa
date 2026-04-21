export const formatearDuracion = (totalMinutos) => {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;

  // Menos de 1 hora → solo minutos
  if (horas === 0) {
    return `${minutos}m`;
  }

  // 1 hora o más → horas + minutos
  return `${horas}h ${minutos < 10 ? "0" : ""}${minutos}m`;
};