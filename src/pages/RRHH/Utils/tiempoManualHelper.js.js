// Archivo: /Utils/tiempoManualHelper.js

/**
 * Calcula minutos totales basándose en horas enteras y el estado del check de media hora.
 */
export const calcularMinutosGestion = (horas, tieneMediaHora) => {
    const h = Math.floor(Number(horas)) || 0;
    return (h * 60) + (tieneMediaHora ? 30 : 0);
};

/**
 * Convierte minutos a un formato de gestión (horas y booleano de media hora).
 */
export const desglosarMinutosGestion = (totalMinutos) => {
    const horas = Math.floor(totalMinutos / 60);
    const tieneMediaHora = totalMinutos % 60 >= 30;
    return { horas, tieneMediaHora };
};