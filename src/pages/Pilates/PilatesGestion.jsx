/* 
--Autor: Sergio Manrique
--Fecha de creación: 2024-10-20
--Descripción: Componente principal para la gestión de clases de Pilates, incluyendo selección de sede, navegación entre secciones, y modales para detalles y ayuda.
*/

import NavbarStaff from "../staff/NavbarStaff";
import {
  FaSearch,
  FaCompressAlt,
  FaExpandAlt,
} from "react-icons/fa";
import { VscDebugRestart } from "react-icons/vsc";
import GrillaHorarios from "./Components/GrillaHorarios";
import Footer from "../../components/footer/Footer";
import StudentModal from "./Modal/ModalEstudiantes";
import ModalProfesor from "./Modal/ModalProfesor";
import ListaEspera from "./Components/ListaEspera";
import PanelesSuperiores from "./Components/PanelesSuperiores";
import { Link } from "react-router-dom";
import { DAYS, HOURS, MAX_STUDENTS_PER_SLOT } from "./Constants/constanst";
import PilatesGestionLogica from "./Logic/PilatesGestionLogica";
import ModalDetalleAusentes from "./Modal/ModalDetalleAusentes";
import ModalAyudaGrillaGestion from "./Modal/ModalAyudaGrillaGestion";
import ModalConfirmarListaEspera from "./Modal/ModalConfirmarListaEspera";
import ModalCambioTurno from "./Modal/ModalCambioTurno";
import HorariosDeshabilitados from "./Components/HorariosDeshabilitados";
import { FaQuestionCircle } from "react-icons/fa";
import SelectorSedes from "./Components/SelectorSedes";
import { useAuth } from "../../AuthContext";

const EyeIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      fillRule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clipRule="evenodd"
    />
  </svg>
);

const PilatesGestion = () => {
  const { states, setters, functions } = PilatesGestionLogica();
  const { sedeName: sedeActual, userLevel: rolUsuario } = useAuth(); // Obtener la sede actual del contexto de autenticación
  return (
    <>
      <NavbarStaff />
      {states.sedesData && states.sedesData.length > 0 ? (
        <>
          <div className="w-full shadow-sm my-2 z-40 relative">
            <SelectorSedes states={states} functions={functions} />
          </div>

          {!states.puedeEditarSede && states.sedeActualFiltro && (
            <div className="max-w-3xl mx-auto mt-4 bg-yellow-600/80 text-yellow-50 text-sm text-center font-semibold px-4 py-3 rounded-lg">
              Modo lectura: solo podés editar la sede que tenés asignada.
            </div>
          )}

          <div className="dashboardbg min-h-screen pt-10 pb-10 p-1 sm:p-6 lg:p-8">
            <div className="mx-auto px-2 sm:px-10 bg-gray-500/50 p-2 rounded-xl ">
              {states.rol === "GESTION" && (
                <div className="flex flex-col xl:flex-row items-center justify-between gap-4 my-6 w-full">
                  {/* --- BOTÓN VOLVER --- */}
                  <div className="w-full xl:w-auto">
                    <Link to="/dashboard" className="block w-full sm:w-auto">
                      <button className="group w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border-2 border-slate-100 text-slate-500 font-bold hover:border-orange-400 hover:text-orange-500 transition-all duration-200">
                        <svg
                          className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        <span>Volver al inicio</span>
                      </button>
                    </Link>
                  </div>

                  {/* --- SELECTOR DE VISTAS --- */}
                  <div className="flex flex-col sm:flex-row w-full xl:w-auto bg-slate-100 p-1.5 rounded-xl gap-1">
                    {/* Opción: GESTIÓN */}
                    <button
                      onClick={() => functions.handleSectionChange("GESTION")}
                      className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                      ${
                        states.section === "GESTION"
                          ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5 scale-[1.02]" // Activo
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50" // Inactivo
                      }
                    `}
                    >
                      {states.section === "GESTION" && (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      Gestión
                    </button>

                    {/* Opción: LISTA DE ESPERA */}
                    <button
                      onClick={() =>
                        functions.handleSectionChange("LISTA_ESPERA")
                      }
                      className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                      ${
                        states.section === "LISTA_ESPERA"
                          ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                      }
                    `}
                    >
                      {states.section === "LISTA_ESPERA" && (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      Lista de Espera
                    </button>

                    {/* Opción: HORARIOS DESHABILITADOS */}
                    <button
                      onClick={() =>
                        functions.handleSectionChange("HORARIOS_DESHABILITADOS")
                      }
                      className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200
                      ${
                        states.section === "HORARIOS_DESHABILITADOS"
                          ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5 scale-[1.02]"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                      }
                    `}
                    >
                      {states.section === "HORARIOS_DESHABILITADOS" && (
                        <EyeIcon className="h-4 w-4" />
                      )}
                      Horarios Deshabilitados
                    </button>
                  </div>
                </div>
              )}

              {states.rol === "GESTION" && states.section === "LISTA_ESPERA" ? (
                <>
                  <ListaEspera
                    waitingList={states.waitingList}
                    onUpdateWaitingList={functions.handleUpdateWaitingList}
                    allHours={HOURS}
                    marcarEstadosAlumnoListaEspera={
                      functions.marcarEstadosAlumnoListaEspera
                    }
                    puedeEditar={states.puedeEditarSede}
                    schedule={states.schedule}
                    isModalOpenListaEspera={states.isModalOpenListaEspera}
                  />
                  {states.isConfirmModalOpen && (
                    <ModalConfirmarListaEspera
                      isOpen={states.isConfirmModalOpen}
                      onClose={() => setters.setIsConfirmModalOpen(false)}
                      onSave={functions.handleSaveStudent}
                      personData={states.personToConfirm}
                      freeSlots={states.freeSlots}
                      onConfirmationComplete={
                        functions.handleConfirmationComplete
                      }
                    />
                  )}
                </>
              ) : states.rol === "GESTION" &&
                states.section === "HORARIOS_DESHABILITADOS" ? (
                <HorariosDeshabilitados states={states} functions={functions} />
              ) : (
                <>
                  {states.rol === "GESTION" && (
                    <PanelesSuperiores
                      freeSlots={states.freeSlots}
                      expiredStudents={states.expiredStudents}
                      waitingListMatches={states.waitingListMatches}
                      visiblePanels={states.visiblePanels}
                      onToggle={functions.handlePanelToggle}
                      alumnosAusentes={states.ausentesAlumnos}
                      horariosDeshabilitados={states.horariosDeshabilitados}
                      onOpenModalDetalleAusentes={
                        functions.handleOpenModalDetalleAusentes
                      }
                    />
                  )}

                  <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-50 mb-2">
                      {states.section === "GESTION"
                        ? "Gestión de Clases de Pilates"
                        : "Lista de Espera - Pilates"}
                    </h1>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* BARRA DE BÚSQUEDA */}
                      <div className="relative w-full max-w-lg">
                        <input
                          type="text"
                          placeholder="Buscar alumno por nombre..."
                          value={states.searchTerm}
                          autoFocus
                          onChange={(e) =>
                            setters.setSearchTerm(e.target.value)
                          }
                          className="w-full p-3 pl-10 pr-24 border border-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                        <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        <button
                          onClick={() => setters.setSearchTerm("")}
                          className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md"
                        >
                          <VscDebugRestart />
                          <span>Resetear</span>
                        </button>
                      </div>

                      {/* --- AQUÍ AGREGAMOS EL BOTÓN COMPACTAR/EXPANDIR --- */}
                      <div className="w-full sm:w-auto flex gap-2">
                        {/* Lógica: Si están todos minimizados, mostramos Expandir. Si no, Compactar. */}
                        {states.horariosMinimizados.length === HOURS.length ? (
                          <button
                            onClick={() =>
                              functions.manejarMinimizacionGlobal(HOURS, false)
                            } // false = no minimizar (expandir)
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 font-semibold text-white shadow-md hover:bg-blue-700 transition-colors duration-200"
                            title="Ver todos los alumnos"
                          >
                            <FaExpandAlt />
                            <span>Expandir</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              functions.manejarMinimizacionGlobal(HOURS, true)
                            } // true = minimizar todo
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white text-gray-700 border border-gray-300 font-semibold shadow-sm hover:bg-gray-50 transition-colors duration-200"
                            title="Ocultar alumnos para ver solo instructores"
                          >
                            <FaCompressAlt />
                            <span>Compactar</span>
                          </button>
                        )}

                        {/* BOTÓN AYUDA (Ya existente) */}
                        <button
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-orange-500 font-semibold text-white shadow-md hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                          onClick={() => setters.setIsModalAyuda(true)}
                        >
                          <FaQuestionCircle />
                          Ayuda
                        </button>
                      </div>
                    </div>
                  </header>
                  <GrillaHorarios
                    schedule={states.schedule}
                    searchTerm={states.searchTerm}
                    handleCellClick={functions.handleCellClick}
                    DAYS={DAYS}
                    HOURS={HOURS}
                    MAX_STUDENTS_PER_SLOT={states.cupoMaximoPilates}
                    getCellContentAndStyle={functions.getCellContentAndStyle}
                    rol={states.rol}
                    countTrialsInOtherDaysOfGroup={
                      functions.countTrialsInOtherDaysOfGroup
                    }
                    onInstructorClick={functions.handleOpenModalProfesor}
                    puedeEditarSede={states.puedeEditarSede}
                    horariosDeshabilitados={states.horariosDeshabilitados}
                    alDeshabilitarHorario={functions.manejarDeshabilitarHorario}
                    puedeDeshabilitarHorario={
                      functions.puedeDeshabilitarHorario
                    }
                    horariosMinimizados={states.horariosMinimizados}
                    alternarMinimizacionHorario={
                      functions.alternarMinimizacionHorario
                    }
                  />

                  {states.isModalOpen && states.currentCell && (
                    <StudentModal
                      isOpen={states.isModalOpen}
                      onClose={() => setters.setIsModalOpen(false)}
                      onSave={functions.handleSaveStudent}
                      cellData={states.currentCell}
                      fechaHoy={states.fechaHoy}
                      onOpenCambioTurno={functions.handleAbrirCambioTurno}
                    />
                  )}

                  {states.isModalProfesorOpen && (
                    <ModalProfesor
                      isOpen={states.isModalProfesorOpen}
                      onClose={() => setters.setIsModalProfesorOpen(false)}
                      horarioData={states.horarioSeleccionado}
                      onSave={functions.handleSaveInstructor}
                      instructores={states.instructoresData}
                    />
                  )}

                  {states.isModalDetalleAusentes && (
                    <ModalDetalleAusentes
                      isOpen={states.isModalDetalleAusentes}
                      onClose={() => setters.setIsModalDetalleAusentes(false)}
                      alumnos={states.ausentesAlumnos}
                      onContact={functions.handleContactAlumno}
                      contactarAlumno={states.contactarAlumno}
                      setcontactarAlumno={setters.setcontactarAlumno}
                    />
                  )}

                  {states.isModalAyuda && (
                    <ModalAyudaGrillaGestion
                      isOpen={states.isModalAyuda}
                      onClose={() => setters.setIsModalAyuda(false)}
                    />
                  )}

                  {states.isModalCambioTurno && states.alumnoCambioTurno && (
                    <ModalCambioTurno
                      isOpen={states.isModalCambioTurno}
                      onClose={() => setters.setIsModalCambioTurno(false)}
                      studentData={states.alumnoCambioTurno}
                      allSchedules={states.horariosCambioTurno}
                      onSaveDirect={functions.handleSaveCambioTurno}
                      onSaveWaitingList={functions.handleSaveWaitingListCambio}
                      maxCapacity={states.cupoMaximoPilates}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="dashboardbg min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              No hay sedes disponibles
            </h2>
            <p className="text-gray-700">
              Por favor, contactate con el administrador para configurar las
              sedes.
            </p>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default PilatesGestion;
