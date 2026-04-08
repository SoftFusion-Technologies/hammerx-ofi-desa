/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente reutilizable para la visualización de estados de error en la interfaz. Permite mostrar un mensaje principal, detalles técnicos opcionales y un botón de acción para reintentar la carga de datos o la petición fallida, manteniendo una estética consistente con el resto del sistema.
*/
const Error = ({
	mensaje = "No se pudo obtener la información.",
	detalle,
	onReintentar,
	textoBoton = "Reintentar",
}) => {
	return (
		<div className="w-full rounded-xl border border-red-200 bg-red-50 p-4">
			<p className="text-sm font-semibold text-red-700">{mensaje}</p>

			{detalle && <p className="mt-1 text-xs text-red-600">{detalle}</p>}

			{typeof onReintentar === "function" && (
				<button
					type="button"
					onClick={onReintentar}
					className="mt-3 px-3 py-2 text-xs font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
				>
					{textoBoton}
				</button>
			)}
		</div>
	);
};

export default Error;
