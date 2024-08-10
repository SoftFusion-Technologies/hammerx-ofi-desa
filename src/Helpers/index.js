export const formatearFecha = (fecha) => {
  if (!fecha) return 'Fecha inválida'; // Verifica que la fecha no sea null o undefined

  let fechaNueva = new Date(fecha);

  // Si la fecha no es válida, intenta agregar 'T00:00:00' y conviértela nuevamente
  if (isNaN(fechaNueva.getTime())) {
    fechaNueva = new Date(fecha + 'T00:00:00');
  }

  if (isNaN(fechaNueva.getTime())) {
    return 'Fecha inválida'; // Si sigue siendo inválida, retorna un mensaje de error
  }

  const formato = {
    year: 'numeric',
    month: 'long',
    day: '2-digit'
  };

  return fechaNueva.toLocaleDateString('es-ES', formato);
};
