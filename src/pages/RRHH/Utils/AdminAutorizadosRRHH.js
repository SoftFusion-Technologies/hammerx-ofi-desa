/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Función de seguridad para validar el acceso administrativo al módulo de RRHH. Verifica que el usuario posea el nivel de "admin" y que su rango jerárquico específico esté incluido dentro de los niveles autorizados (1 o 2).
*/
const rangosAdmin = [1,2]

export const esAdminRRHH = (userLevel, userLevelAdmin) => {
  return (
    userLevel === "admin" && rangosAdmin.includes(userLevelAdmin)
  )
}