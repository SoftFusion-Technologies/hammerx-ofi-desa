/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Componente de visualización de agenda semanal. Organiza y procesa los turnos fijos asignados a un usuario, diferenciando claramente los días laborables de los francos. Permite tanto el autoconsulta del empleado como la supervisión por parte de administradores al visualizar perfiles de terceros, presentando la información en un esquema de tarjetas ordenado por día y hora.
*/

import {
  FaCalendarAlt,
  FaUserClock,
  FaClock,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "../../../../AuthContext";
import { useSedeUsers } from "../../Context/SedeUsersContext";
import useObtenerDatos from "../../hooks/obtenerDatos";

const Horarios = ({
  setVistaActiva = null,
  volverAtras = null,
  usuarioSeleccionado = null,
}) => {
  const { userId, userLevel } = useAuth();
  const { sedeSeleccionada: sedeContext } = useSedeUsers();
  const { datos, cargando, error, realizarPeticion } = usuarioSeleccionado
    ? useObtenerDatos(
        `/rrhh/horarios?usuario_id=${usuarioSeleccionado.usuario_id}&&sede_id=${usuarioSeleccionado.sede_id}`,
      )
    : userId
      ? useObtenerDatos(
          `/rrhh/horarios?usuario_id=${userId}&&sede_id=${sedeContext.id}`,
        )
      : {
          datos: null,
          cargando: false,
          error: null,
          realizarPeticion: () => {},
        };

  const nombresDias = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const obtenerHorariosProcesados = () => {
    return nombresDias.map((nombre, indice) => {
      const numeroDia = indice + 1;
      const turnosDelDia = (datos || [])
        .filter((item) => item.dia_semana === numeroDia)
        .sort((a, b) => a.hora_entrada.localeCompare(b.hora_entrada));

      return {
        dia: nombre,
        turnos: turnosDelDia,
      };
    });
  };


  const horariosSemanales = obtenerHorariosProcesados();
  if (cargando)
    return <div className="p-6 text-center">Cargando horarios...</div>;
  return (
    <div className="animate-fade-in-up">
      <div className="mb-4">
        {volverAtras && (
          <button
            onClick={volverAtras}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md transition-all duration-200 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
            Volver atrás
          </button>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex flex-row">
          <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 mr-2">
            <FaCalendarAlt className="text-2xl" />
          </div>
          <div>
            <h2 className="text-3xl font-bignoodle text-gray-800 leading-none">
              {usuarioSeleccionado
                ? `Horarios de ${usuarioSeleccionado.usuario.name}`
                : "Mis horarios"}
            </h2>
            <p className="text-sm text-gray-500">Horarios fijos asignados</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {horariosSemanales.map((dia, index) => {
          const esFranco = dia.turnos.length === 0;
          return (
            <div
              key={index}
              className={`relative p-4 rounded-2xl border transition-all ${esFranco ? "bg-gray-50 border-gray-200 opacity-70" : "bg-white border-blue-100 shadow-sm hover:shadow-md"}`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-700 uppercase tracking-wide">
                  {dia.dia}
                </h3>
                {esFranco && (
                  <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-1 rounded font-bold">
                    FRANCO
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {esFranco ? (
                  <div className="h-10 flex items-center text-sm text-gray-400 italic">
                    Sin actividad asignada
                  </div>
                ) : (
                  dia.turnos.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg border border-blue-100"
                    >
                      <FaClock className="text-blue-400 text-xs" />
                      <span className="font-messina font-medium text-blue-900 text-sm">
                        {t.hora_entrada.substring(0, 5)} a{" "}
                        {t.hora_salida.substring(0, 5)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Horarios;
