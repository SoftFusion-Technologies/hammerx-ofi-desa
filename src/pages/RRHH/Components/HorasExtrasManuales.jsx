/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de interfaz para la carga y gestión manual de horas extras. Permite desglosar el tiempo en horas y minutos, calcular automáticamente la diferencia entre horas pendientes y autorizadas, y muestra alertas visuales si los valores ingresados no son consistentes, facilitando la auditoría antes de liquidar sueldos.
*/

import React from "react";
import { FaClock, FaExclamationTriangle, FaPlusCircle } from "react-icons/fa";

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

const HorasExtrasManuales = ({
	mostrarExtras,
	setMostrarExtras,
	horasPendientes,
	setHorasPendientes,
	minutosPendientes,
	setMinutosPendientes,
	horasAutorizadas,
	setHorasAutorizadas,
	minutosAutorizadas,
	setMinutosAutorizadas,
	minutosPendientesIniciales = 0,
	minutosAutorizadosIniciales = 0,
	mostrarBadgePendientes = false,
	mostrarResumen = false,
	mostrarAdvertencia = false,
	bloquearToggleExtras = false,
	bloquearPendientes = false,
	etiquetaHoras = "Pendientes horas",
	etiquetaMinutos = "Pendientes minutos",
	etiquetaHorasAutorizadas = "Autorizadas horas",
	etiquetaMinutosAutorizadas = "Autorizadas minutos",
	helperText = "",
}) => {
	const minutosPendientesEditados =
		Number(horasPendientes) * 60 + Number(minutosPendientes);
	const minutosAutorizadosEditados =
		Number(horasAutorizadas) * 60 + Number(minutosAutorizadas);
	const minutosNoAutorizados = Math.max(
		0,
		minutosPendientesEditados - minutosAutorizadosEditados,
	);

	const manejarToggleExtras = (checked) => {
		if (bloquearToggleExtras && !checked) return;

		setMostrarExtras(checked);
		if (checked) {
			const pendientesHM = convertirMinutosAHM(minutosPendientesIniciales);
			const autorizadasHM = convertirMinutosAHM(minutosAutorizadosIniciales);

			setHorasPendientes(pendientesHM.horas);
			setMinutosPendientes(pendientesHM.minutos);
			setHorasAutorizadas(autorizadasHM.horas);
			setMinutosAutorizadas(autorizadasHM.minutos);
		}
	};

	return (
		<div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-700">
					{mostrarBadgePendientes ? <FaClock size={14} /> : <FaPlusCircle />}
					Horas Extra Manuales
				</div>

				{mostrarBadgePendientes && (
					<span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
						PENDIENTES: {formatearHMTexto(minutosPendientesEditados)}
					</span>
				)}
			</div>

			<label className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white/80 px-3 py-2 text-xs font-bold text-amber-800">
				<input
					type="checkbox"
					checked={mostrarExtras}
					onChange={(e) => manejarToggleExtras(e.target.checked)}
					disabled={bloquearToggleExtras}
					className="h-4 w-4 rounded border-amber-300 text-orange-600 focus:ring-orange-500"
				/>
				<span>Añadir horas extras manuales</span>
			</label>

			{mostrarExtras && (
				<>
					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold uppercase text-amber-700">
								{etiquetaHoras}
							</span>
							<input
								type="number"
								min="0"
								value={horasPendientes}
								disabled={bloquearPendientes}
								onChange={(e) =>
									setHorasPendientes(normalizarNumeroPositivo(e.target.value))
								}
								className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold uppercase text-amber-700">
								{etiquetaMinutos}
							</span>
							<input
								type="number"
								min="0"
								max="59"
								value={minutosPendientes}
								disabled={bloquearPendientes}
								onChange={(e) =>
									setMinutosPendientes(normalizarNumeroPositivo(e.target.value, 59))
								}
								className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold uppercase text-amber-700">
								{etiquetaHorasAutorizadas}
							</span>
							<input
								type="number"
								min="0"
								value={horasAutorizadas}
								onChange={(e) =>
									setHorasAutorizadas(normalizarNumeroPositivo(e.target.value))
								}
								className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
							/>
						</div>

						<div className="flex flex-col gap-1">
							<span className="text-[10px] font-bold uppercase text-amber-700">
								{etiquetaMinutosAutorizadas}
							</span>
							<input
								type="number"
								min="0"
								max="59"
								value={minutosAutorizadas}
								onChange={(e) =>
									setMinutosAutorizadas(normalizarNumeroPositivo(e.target.value, 59))
								}
								className="w-full rounded-lg border border-amber-300 px-3 py-2 text-sm font-bold text-amber-900 outline-none focus:ring-2 focus:ring-amber-500"
							/>
						</div>
					</div>

					{mostrarResumen && (
						<div className="flex flex-col gap-1 border-t border-amber-200 pt-2">
							<div className="flex justify-between text-[11px]">
								<span className="font-medium text-amber-600">Se pagarán:</span>
								<span className="font-bold text-emerald-700">
									{formatearHMTexto(minutosAutorizadosEditados)}
								</span>
							</div>
							<div className="flex justify-between text-[11px]">
								<span className="font-medium text-amber-600">Se rechazan:</span>
								<span className="font-bold text-rose-700">
									{formatearHMTexto(minutosNoAutorizados)}
								</span>
							</div>
						</div>
					)}

					{mostrarAdvertencia &&
						minutosPendientesEditados > 0 &&
						minutosAutorizadosEditados > minutosPendientesEditados && (
							<div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-600">
								<FaExclamationTriangle />
								<span>LAS AUTORIZADAS SUPERAN LAS PENDIENTES</span>
							</div>
						)}

					{helperText && (
						<p className="text-[10px] italic font-medium text-amber-600">{helperText}</p>
					)}
				</>
			)}
		</div>
	);
};

export default HorasExtrasManuales;
