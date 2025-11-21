import NavbarInstructor from "../staff/NavbarInstructor";
import { FaSearch } from "react-icons/fa";
import { VscDebugRestart } from "react-icons/vsc";
import GrillaHorarios from "./Components/GrillaHorarios";
import Footer from "../../components/footer/Footer";
import ModalAsistencia from "./Modal/ModalAsistencia";
import PilatesInstructorLogica from "./Logic/PilatesInstructorLogica";
import { DAYS, HOURS } from "./Constants/constanst";

const PilatesInstructores = () => {
  const { states, setStates, functions } = PilatesInstructorLogica();

  return (
    <>
      <NavbarInstructor />
      <div className="dashboardbg min-h-screen pt-10 pb-10 p-2 md:p-4 sm:p-6 lg:p-8">
        <div className="mx-auto p-2 md:p-10 bg-gray-500/50 rounded-xl ">
          <>
            <header className="mb-6">
              <h1 className="text-4xl font-bold text-gray-50 mb-2">
                Gestión de asistencia
              </h1>
              <div className="text-center mb-4">
                <span className="bg-orange-500 text-white px-4 py-2 rounded-full font-semibold">
                  Día habilitado: {states.hoy}
                </span>
              </div>
              <div className="flex justify-center sm:justify-start">
                <div className="relative w-full max-w-lg">
                  <input
                    type="text"
                    placeholder="Buscar alumno por nombre..."
                    value={states.searchTerm}
                    autoFocus
                    onChange={(e) => setStates.setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 pr-24 border border-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                  <button
                    onClick={() => setStates.setSearchTerm("")}
                    className="absolute top-1/2 right-2 transform -translate-y-1/2 flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-md"
                  >
                    <VscDebugRestart />
                    <span>Resetear</span>
                  </button>
                </div>
              </div>
            </header>
            {states.loadingAsistencias ? (
              <div className="text-center text-white font-semibold p-10">
                Cargando asistencias...
              </div>
            ) : (
              <GrillaHorarios
                schedule={states.schedule}
                searchTerm={states.searchTerm}
                guardarAsistencia={functions.handleCellAsistencia}
                DAYS={DAYS}
                HOURS={HOURS}
                MAX_STUDENTS_PER_SLOT={states.cupoMaximoPilates || 0}
                getCellContentAndStyle={functions.getCellContentAndStyle}
                rol={"INSTRUCTOR"}
                hoy={states.hoy}
                asistenciasHoy={states.asistenciasHoy}
              />
            )}
            {states.isModalAsistencia && (
              <ModalAsistencia
                isOpen={states.isModalAsistencia}
                onClose={() => setStates.setIsModalAsistencia(false)}
                cellData={states.currentCell}
                onAsistenciaGuardada={functions.refetch}
                cambiarAsistencia={functions.cambiarAsistencia}
                cambiarObservaciones={functions.cambiarObservaciones}
                agregarQuejas={functions.agregarQuejas}
              />
            )}
          </>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PilatesInstructores;
