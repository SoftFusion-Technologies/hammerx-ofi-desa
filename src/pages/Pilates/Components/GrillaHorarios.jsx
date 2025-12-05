import { use, useEffect } from "react";
import { useAuth } from "../../../AuthContext";
import { FaEyeSlash, FaEye } from "react-icons/fa";

const GrillaHorarios = ({
  schedule,
  searchTerm,
  handleCellClick,
  guardarAsistencia, // Función para guardar asistencia de alumnos para el instructor
  DAYS,
  HOURS,
  MAX_STUDENTS_PER_SLOT, // Número máximo de alumnos permitidos por turno
  getCellContentAndStyle,
  rol = "GESTION", // Verifica si el rol es "GESTION" o "INSTRUCTOR"
  asistenciaRegistrada,
  countTrialsInOtherDaysOfGroup = () => 0,
  onInstructorClick,
  hoy,
  asistenciasHoy = {},
  puedeEditarSede = true, // Indica si la sede es editable por el usuario actual
  horariosDeshabilitados = [], // Lista de horarios deshabilitados para gestión y saber que horarios mostrar
  alDeshabilitarHorario = () => {}, // Función que se llama al deshabilitar un horario
  puedeDeshabilitarHorario = () => false, // Función que determina si un horario puede ser deshabilitado
  horariosMinimizados = [], // Lista de horarios que están minimizados
  alternarMinimizacionHorario = () => {}, // Función para alternar la minimización de un horario
}) => {
  // Filtros iniciales
  const visibleDays =
    rol === "INSTRUCTOR" && hoy ? DAYS.filter((day) => day === hoy) : DAYS;

  const { userLevel: usuarioRol } = useAuth(); // Obtener el rol del usuario desde el contexto de autenticación. Si es admin, vendedor, etc.

  const esGestionEditable = rol === "GESTION" && puedeEditarSede;

  const horasVisibles = HOURS.filter(
    (hora) => !horariosDeshabilitados.includes(hora)
  );

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
      <table className="w-full border-collapse">
        {/* ENCABEZADO DE LA TABLA */}
        <thead className="bg-slate-900 text-white sticky top-0 z-30 shadow-lg">
          <tr>
            <th className="p-4 w-1 bg-orange-600 sticky left-0 z-40 border-b border-r border-slate-300 shadow-md text-left">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-200 font-bold uppercase tracking-widest">
                  Turno
                </span>
                <span className="text-xl font-black text-white tracking-tighter">
                  HORA
                </span>
              </div>
            </th>

            {visibleDays.map((day) => (
              <th
                key={day}
                className="p-4 min-w-[200px] text-center font-bold text-sm uppercase tracking-widest border-b border-slate-300 bg-orange-600"
              >
                <span className="bg-clip-text text-transparent text-white">
                  {day}
                </span>
              </th>
            ))}
          </tr>
          {/* Línea decorativa inferior del header */}
          <tr className="h-[2px] border-none absolute left-0 right-0 w-full z-50 pointer-events-none">
            <td colSpan={visibleDays.length + 1} className="p-0">
              <div className="w-full h-[2px] bg-gradient-to-r from-orange-500 via-pink-500 to-orange-500"></div>
            </td>
          </tr>
        </thead>

        {/* CUERPO DE LA TABLA */}
        <tbody>
          {horasVisibles.map((hour) => {
            const estaMinimizado = horariosMinimizados.includes(hour);
            const alturaCelda = estaMinimizado ? "auto" : "240px";

            const puedeDeshabilitarse = puedeDeshabilitarHorario
              ? puedeDeshabilitarHorario(hour)
              : false;

            return (
              <tr
                key={hour}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                {/* COLUMNA DE CONTROL (Hora y Botones) */}
                <td className="p-1 text-center bg-orange-200 border-b border-white/20 align-middle">
                  <div className="flex flex-col items-center justify-center gap-1.5 py-1">
                    {/* Botón Ocultar/Mostrar Detalles */}
                    {rol != "INSTRUCTOR" && ( // Solo Gestión puede minimizar
                      <button
                        type="button"
                        onClick={() => alternarMinimizacionHorario(hour)}
                        className={`
                        flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-200 shadow-sm border border-white/40
                        ${
                          estaMinimizado
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-white/60 text-orange-900 hover:bg-red-500 hover:text-white hover:shadow-md"
                        }
                      `}
                        title={
                          estaMinimizado
                            ? "Mostrar detalles"
                            : "Ocultar detalles"
                        }
                      >
                        {estaMinimizado ? (
                          <FaEye size={10} />
                        ) : (
                          <FaEyeSlash size={10} />
                        )}
                        <span>{estaMinimizado ? "Mostrar" : "Ocultar"}</span>
                      </button>
                    )}

                    <span className="font-mono text-lg font-bold text-orange-800 drop-shadow-sm">
                      {hour}
                    </span>

                    {/* Botón Deshabilitar Turno (Solo Gestión) */}
                    {rol === "GESTION" &&
                      usuarioRol === "admin" &&
                      esGestionEditable && (
                        <button
                          type="button"
                          className={`
                        flex items-center justify-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all duration-200 shadow-sm
                        ${
                          puedeDeshabilitarse
                            ? "bg-white/60 text-orange-900 hover:bg-red-500 hover:text-white hover:shadow-md cursor-pointer border border-white/40"
                            : "bg-gray-100/50 text-gray-400 cursor-not-allowed border border-transparent"
                        }
                      `}
                          disabled={!puedeDeshabilitarse}
                          onClick={() => alDeshabilitarHorario(hour)}
                          title={
                            puedeDeshabilitarse
                              ? "Ocultar turno vacío"
                              : "Turno con alumnos"
                          }
                        >
                          <FaEyeSlash size={10} />
                          <span>Deshabilitar</span>
                        </button>
                      )}
                  </div>
                </td>

                {/* CELDAS DE DÍAS (Lunes, Martes, etc.) */}
                {visibleDays.map((day) => {
                  const key = `${day}-${hour}`;
                  const cellData = schedule[key] || {
                    coach: "",
                    alumnos: [],
                  };
                  const students = cellData.alumnos || [];
                  const coach = cellData.coach || "";
                  const isDayEnabled =
                    rol === "GESTION" ? esGestionEditable : day === hoy;

                  // --- LOGICA RECUPERADA: Tooltip explicativo ---
                  const tituloCelda = !isDayEnabled
                    ? rol === "GESTION"
                      ? "Solo lectura para sedes ajenas"
                      : "Solo puedes registrar asistencia para el día de hoy"
                    : "";

                  return (
                    <td
                      key={key}
                      className={`p-2 border border-gray-200 text-center align-top transition-all duration-300 ${
                        isDayEnabled
                          ? "bg-white hover:shadow-inner"
                          : "bg-gray-100 opacity-60 cursor-not-allowed"
                      }`}
                      style={{ height: alturaCelda }}
                      title={tituloCelda} // Se agrega el título recuperado
                    >
                      <div className="h-full w-full flex flex-col gap-1">
                        {/* TARJETA INSTRUCTOR (Siempre visible) */}
                        <div
                          className={`
                            relative mb-0 p-1 rounded-xl border transition-all duration-300 group
                            flex flex-col items-center justify-center shadow-md
                            ${
                              isDayEnabled
                                ? "bg-gradient-to-br from-orange-400 to-orange-500 border-orange-400 hover:to-orange-600 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                                : "bg-gray-100 border-gray-200 cursor-default opacity-70"
                            }
                          `}
                          onClick={
                            rol === "GESTION" && isDayEnabled
                              ? () => onInstructorClick(day, hour, null, coach)
                              : null
                          }
                        >
                          {isDayEnabled && (
                            <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-white/40 rounded-r-full" />
                          )}
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${
                              isDayEnabled ? "text-orange-100" : "text-gray-400"
                            }`}
                          >
                            Instructor
                          </span>
                          <span
                            className={`text-sm font-bold truncate max-w-full px-2 ${
                              isDayEnabled
                                ? "text-white drop-shadow-sm"
                                : "text-gray-400"
                            }`}
                          >
                            {coach || (
                              <span
                                className={`italic font-medium text-xs ${
                                  isDayEnabled
                                    ? "text-orange-200/80"
                                    : "opacity-60"
                                }`}
                              >
                                Sin asignar
                              </span>
                            )}
                          </span>
                        </div>

                        {/* LISTA DE ALUMNOS (Solo visible si NO está minimizado) */}
                        {!estaMinimizado && (
                          <>
                            {students.map((student, index) => {
                              const { content, style } =
                                getCellContentAndStyle(student);
                              const removeAccents = (str) =>
                                (str || "")
                                  .normalize("NFD")
                                  .replace(/[\u0300-\u036f]/g, "")
                                  .toLowerCase();
                              const isStudentHighlighted =
                                searchTerm &&
                                removeAccents(student.name).includes(
                                  removeAccents(searchTerm)
                                );

                              const estadoAsistencia =
                                asistenciasHoy[student.id];

                              // --- LOGICA RECUPERADA: Verificación de asistencia en DB ---
                              const tieneAsistencia =
                                asistenciaRegistrada &&
                                asistenciaRegistrada[key] &&
                                asistenciaRegistrada[key].includes(student.id);

                              return (
                                <div
                                  key={`${student.id}-${index}`}
                                  className={`flex-grow p-2 text-xs md:text-sm flex items-center justify-between rounded-lg transition-all duration-200 text-black shadow-sm ${
                                    isDayEnabled
                                      ? `cursor-pointer transform hover:scale-[1.02] ${
                                          style || "bg-gray-100"
                                        }`
                                      : "bg-gray-200 text-black"
                                  } ${
                                    isStudentHighlighted && isDayEnabled
                                      ? "ring-3 ring-blue-500 ring-opacity-70 shadow-md !bg-violet-600 !text-white"
                                      : ""
                                  }`}
                                  onClick={
                                    isDayEnabled
                                      ? rol === "GESTION"
                                        ? () =>
                                            handleCellClick(day, hour, student)
                                        : () =>
                                            guardarAsistencia(
                                              day,
                                              hour,
                                              student,
                                              estadoAsistencia
                                              // Podrías pasar tieneAsistencia aquí si tu función lo soporta
                                            )
                                      : null
                                  }
                                >
                                  {rol === "GESTION" ? (
                                    <div className="flex items-center w-full">
                                      <div className="flex-grow text-left truncate">
                                        {content}
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="flex-grow text-left truncate font-medium">
                                        {student.name}
                                      </div>
                                      {isDayEnabled && estadoAsistencia && (
                                        <div className="flex-shrink-0 ml-2">
                                          {estadoAsistencia === "presente" ? (
                                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2">
                                              <span className="text-white font-bold text-xs">
                                                P
                                              </span>
                                            </div>
                                          ) : (
                                            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center border-2">
                                              <span className="text-white font-bold text-xs">
                                                A
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            })}

                            {/* BOTÓN AGREGAR ALUMNO (Solo Gestión y Editable) */}
                            {rol === "GESTION" && esGestionEditable && (
                              <>
                                {Array.from({
                                  length: Math.max(
                                    0,
                                    MAX_STUDENTS_PER_SLOT -
                                      students.length -
                                      countTrialsInOtherDaysOfGroup(day, hour)
                                  ),
                                }).map((_, index) => (
                                  <div
                                    key={`empty-${index}`}
                                    className="flex-grow p-1 text-blue-600 text-xs flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 hover:shadow-sm"
                                    onClick={() =>
                                      handleCellClick(day, hour, null)
                                    }
                                  >
                                    <span className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800">
                                      + Agregar alumno
                                    </span>
                                  </div>
                                ))}
                              </>
                            )}

                            {/* MENSAJE SIN ALUMNOS (Rol No Gestión) */}
                            {rol !== "GESTION" && students.length === 0 && (
                              <div
                                className={`flex-grow flex items-center justify-center text-sm ${
                                  isDayEnabled
                                    ? "text-gray-400"
                                    : "text-gray-300"
                                }`}
                              >
                                {isDayEnabled ? "Sin alumnos" : "No disponible"}
                              </div>
                            )}
                          </>
                        )}

                        {/* RESUMEN CUANDO ESTÁ MINIMIZADO */}
                        {estaMinimizado && students.length > 0 && (
                          <div className="mt-1 text-xs font-bold text-gray-500 text-center bg-gray-50 rounded py-1">
                            {students.length} Alumnos ocultos
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GrillaHorarios;
