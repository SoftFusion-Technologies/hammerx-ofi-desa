import { useState, useEffect } from "react";
import axios from "axios";
import { isSameDay, parseISO, format } from "date-fns";
import BotonVolver from "../../Reciclables/BotonVolver";
import BarraBusqueda from "../../Reciclables/BarraBusqueda";
import { FaCalendarDay } from "react-icons/fa";
import Calendario from "../../Reciclables/Calendario";
import { fechaActualArgentina } from "../../../Utils/fechaArgentina";
import useObtenerDatos from "../../../hooks/obtenerDatos";
import ModalAgregarFeriado from "../../../Modals/RRHH/ModalAgregarFeriado";

const FeriadosProgramados = ({ volverAtras }) => {
  /* Estados  */
  const [feriados, setFeriados] = useState([]);
  const [abrirModalGestionarFeriado, setAbrirModalGestionarFeriado] =
    useState(false);
  const [datosModal, setDatosModal] = useState({
    fecha: ""
  });

  /* Estados para las fechas */
  const [fechaActual, setFechaActual] = useState(() => fechaActualArgentina());
  const [diaSeleccionado, setDiaSeleccionado] = useState(() =>
    fechaActualArgentina(),
  );

  const {
    datos: feriadosDB,
    cargando: cargandoFeriados,
    error: errorFeriados,
    realizarPeticion: realizarPeticionFeriados,
  } = useObtenerDatos("/rrhh/feriados-programados");

  const titulos = {
    titulo: "Feriados Programados",
    subtitulo: "Consulta los feriados programados de los empleados.",
    icono: <FaCalendarDay className="text-orange-500" />,
  };

  // Obtener feriados desde la API externa para tener los feriados oficiales de Argentina
  useEffect(() => {
    const obtenerFeriados = async () => {
      try {
        const anio = fechaActual.getFullYear();

        const response = await axios.get(
          `https://date.nager.at/api/v3/PublicHolidays/${anio}/AR`,
        );

        setFeriados(response.data);
      } catch (error) {
        console.error("Error obteniendo feriados:", error);
      }
    };

    obtenerFeriados();
  }, [fechaActual]);

  return (
    <div>
      <BotonVolver onClick={volverAtras} />
      <BarraBusqueda
        titulos={titulos}
      />

      {/*  CALENDARIO */}
      <div className="mt-4">
        <Calendario
          fechaActual={fechaActual}
          setFechaActual={setFechaActual}
          diaSeleccionado={diaSeleccionado}
          onDateClick={(day) => {
            setDiaSeleccionado(day);

            const fechaStr = format(day, "yyyy-MM-dd");

            // Buscamos el objeto completo del feriado si existe en nuestra DB
            const feriadoExistente = (feriadosDB || []).find((f) =>
              isSameDay(parseISO(f.fecha), day),
            );

            const feriadoAPI = feriados.find((f) =>
              isSameDay(parseISO(f.date), day),
            );

            setDatosModal({
              fecha: fechaStr,
              feriadoExistente: feriadoExistente || null, // Pasamos el objeto con el usuario
              feriadoAPI: feriadoAPI || null,
            });

            setAbrirModalGestionarFeriado(true);
          }}
          renderContenidoCelda={(day) => {
            const feriadosAPI = feriados.filter((f) =>
              isSameDay(parseISO(f.date), day),
            );

            const feriadosSistema = (feriadosDB || []).filter((f) =>
              isSameDay(parseISO(f.fecha), day),
            );

            if (feriadosSistema.length > 0) {
              return (
                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] font-bold text-blue-600">
                    SEDES
                  </span>

                  <span className="hidden md:block text-[8px] lg:text-[10px] text-gray-500 text-center px-1">
                    Feriado programado
                  </span>
                </div>
              );
            }

            // 🔹 Si NO hay feriados del sistema, mostrar API
            if (feriadosAPI.length > 0) {
              return (
                <div className="flex flex-col items-center mt-1">
                  <span className="text-[10px] font-bold text-red-600">
                    FERIADO
                  </span>

                  <span className="hidden md:block text-[8px] lg:text-[10px] text-gray-500 text-center px-1">
                    {feriadosAPI[0].localName}
                  </span>
                </div>
              );
            }

            return null;
          }}
        />

        {abrirModalGestionarFeriado && (
          <ModalAgregarFeriado
            cerrarModal={() => setAbrirModalGestionarFeriado(false)}
            fetch={realizarPeticionFeriados}
            datosIniciales={datosModal}
          />
        )}
      </div>
    </div>
  );
};

export default FeriadosProgramados;
