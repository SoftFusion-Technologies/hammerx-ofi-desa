/*
 * Programador: Emir Segovia
 * Fecha Cración: 05 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (LoginValidation.jsx) es el componente el cual realiza la validacion de caracteres y faltanes de datos en el formulario de logeo.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: emirvalles90f@gmail.com || 3865761910
 */

function Validation(values) {

  let errors = {};
  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^.{6,}$/;

  if (values.email === "") {
    errors.email = "Debe ingresar un correo electrónico";
  } else if (!email_pattern.test(values.email)) {
    errors.email = "El correo electrónico no es válido";
  }

  if (values.password === "") {
    errors.password = "Debe ingresar una contraseña";
  } else if (!password_pattern.test(values.password)) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  }

  return errors;
}
export default Validation;