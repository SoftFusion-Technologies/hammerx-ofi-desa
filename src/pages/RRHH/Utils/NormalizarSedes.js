/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Utilidades de normalización de datos para la visualización de sedes. Traducen los códigos técnicos provenientes de la base de datos (ej. 'SMT') a nombres legibles para el usuario, manejando dos variantes: una con el prefijo completo de la ciudad y otra simplificada para interfaces con espacio reducido.
*/
export const normalizarSedes = (sede) => {
    if (!sede) return "SIN SEDE";
    const nombre = sede.toUpperCase();
    if (sede === "SMT"){
        return "SM BARRIO SUR";
    }else if (sede === "SanMiguelBN"){
        return "SM BARRIO NORTE";
    }
    return nombre.toUpperCase();
}

export const normalizarSedes_2 = (sede) => {
    if (!sede) return "SIN SEDE";
    const nombre = sede.toUpperCase();
    if (sede === "SMT"){
        return "BARRIO SUR";
    }else if (sede === "SanMiguelBN"){
        return "BARRIO NORTE";
    }
    return nombre.toUpperCase();
}