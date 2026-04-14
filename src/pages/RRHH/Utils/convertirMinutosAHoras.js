export const formatearDuracion = (totalMinutos) => {
  const horas = Math.floor(totalMinutos / 60);
  const minutos = totalMinutos % 60;
  // Retorna formato "4h 07m"
  return `${horas}h ${minutos < 10 ? "0" : ""}${minutos}m`;
};
