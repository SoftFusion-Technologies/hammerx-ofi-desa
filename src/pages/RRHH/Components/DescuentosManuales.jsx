/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de interfaz diseñado para la aplicación de descuentos de tiempo de forma manual. Permite especificar horas y minutos a deducir de una jornada, incluye validaciones para valores positivos y un resumen visual del total a descontar, facilitando el ajuste preciso de horas trabajadas antes de la liquidación final.
*/
import React from "react";
import { FaClock, FaMinusCircle } from "react-icons/fa";

const convertirMinutosAHM = (totalMinutos) => {
	const horas = Math.floor(totalMinutos / 60);
	const minutos = totalMinutos % 60;
	return { horas, minutos };
};

const formatearHMTexto = (minutosTotales) => {
	const { horas, minutos } = convertirMinutosAHM(minutosTotales);
	return `${horas}hs ${String(minutos).padStart(2, "0")}min`;
};

const normalizarNumeroPositivo = (valor, maximo = null) => {
	const numero = Number(valor);
	if (!Number.isFinite(numero) || numero < 0) return 0;
	if (maximo !== null) return Math.min(maximo, Math.floor(numero));
	return Math.floor(numero);
};

const DescuentosManuales = ({
	mostrarDescuentos,
	setMostrarDescuentos,
	horasDescuento,
	setHorasDescuento,
	minutosDescuento,
	setMinutosDescuento,
	minutosDescuentoIniciales = 0,
	mostrarBadgeTotal = true,
	helperText = "",
}) => {
	const minutosDescuentoEditados =
		Number(horasDescuento) * 60 + Number(minutosDescuento);

	const manejarToggle = (checked) => {
		setMostrarDescuentos(checked);
		if (checked) {
			const descuentoHM = convertirMinutosAHM(minutosDescuentoIniciales);
			setHorasDescuento(descuentoHM.horas);
			setMinutosDescuento(descuentoHM.minutos);
		}
	};

	return (
		<div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-xs font-bold uppercase text-rose-700">
					<FaMinusCircle size={14} /> Descuentos manuales
				</div>

				{mostrarBadgeTotal && (
					<span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800">
						TOTAL: {formatearHMTexto(minutosDescuentoEditados)}
					</span>
				)}
			</div>

			<label className="flex items-center gap-2 rounded-lg border border-rose-200 bg-white/80 px-3 py-2 text-xs font-bold text-rose-800">
				<input
					type="checkbox"
					checked={mostrarDescuentos}
					onChange={(e) => manejarToggle(e.target.checked)}
					className="h-4 w-4 rounded border-rose-300 text-orange-600 focus:ring-orange-500"
				/>
				<span>Aplicar descuento manual</span>
			</label>

			{mostrarDescuentos && (
				<div className="grid grid-cols-2 gap-4">
					<div className="flex flex-col gap-1">
						<span className="text-[10px] font-bold uppercase text-rose-700">
							Descuento horas
						</span>
						<input
							type="number"
							min="0"
							value={horasDescuento}
							onChange={(e) =>
								setHorasDescuento(normalizarNumeroPositivo(e.target.value))
							}
							className="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm font-bold text-rose-900 outline-none focus:ring-2 focus:ring-rose-500"
						/>
					</div>

					<div className="flex flex-col gap-1">
						<span className="text-[10px] font-bold uppercase text-rose-700">
							Descuento minutos
						</span>
						<input
							type="number"
							min="0"
							max="59"
							value={minutosDescuento}
							onChange={(e) =>
								setMinutosDescuento(normalizarNumeroPositivo(e.target.value, 59))
							}
							className="w-full rounded-lg border border-rose-300 px-3 py-2 text-sm font-bold text-rose-900 outline-none focus:ring-2 focus:ring-rose-500"
						/>
					</div>
				</div>
			)}

			{helperText && (
				<p className="text-[10px] italic font-medium text-rose-600">{helperText}</p>
			)}
		</div>
	);
};

export default DescuentosManuales;
