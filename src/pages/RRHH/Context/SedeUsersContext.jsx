/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Contexto global encargado de gestionar la sede que el usuario tiene seleccionada. Permite que toda la aplicación sepa en qué sucursal se está trabajando, manejando datos como el ID, el nombre y si la modalidad de la sede es remota o presencial.
*/

import React, { createContext, useContext, useState } from "react";

// Contexto para la sede seleccionada
const SedeUsersContext = createContext();

export const useSedeUsers = () => useContext(SedeUsersContext);

export const SedeUsersProvider = ({ children }) => {
	const [sedeSeleccionada, setSedeSeleccionada] = useState(null);

	// sedeSeleccionada: { id: number, nombre: string }
	const seleccionarSede = (sedeObj) => {
		if (!sedeObj) return;
		setSedeSeleccionada({
			id: sedeObj.sede_id || sedeObj.id || null,
			nombre: sedeObj.sede?.nombre || sedeObj.nombre || "",
			remoto: sedeObj.remoto === 1 || sedeObj.remoto === true,
		});
	};

	return (
		<SedeUsersContext.Provider value={{ sedeSeleccionada, seleccionarSede }}>
			{children}
		</SedeUsersContext.Provider>
	);
};
