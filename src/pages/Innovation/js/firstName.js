// utils/firstName.js
// este archivo sirve para discriminar el nombre completo
// si llega Benjamin Orellana, se queda con Benjamin
export default function firstNameOf(fullName = '') {
  const first = (fullName || '').trim().split(/\s+/)[0] || '';
  if (!first) return '';
  // Capitalizar: primera mayúscula, resto minúsculas
  return first[0].toUpperCase() + first.slice(1).toLowerCase();
}
