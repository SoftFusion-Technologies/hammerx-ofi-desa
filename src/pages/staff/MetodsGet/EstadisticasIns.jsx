import React, { useEffect, useState } from 'react';
import '../../../styles/login.css';
import NavbarStaff from '../NavbarStaff';
import axios from 'axios';
import CountUp from 'react-countup';
import Footer from '../../../components/footer/Footer';
import 'react-circular-progressbar/dist/styles.css';
import EstadisticaCardCircular from './Details/EstadisticaCardCircular';

const EstadisticaCard = ({ titulo, contenido }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/3 m-2 text-center">
      <h3 className="text-xl font-bold text-black">{titulo}</h3>
      <p className="text-3xl font-extrabold text-orange-500 mt-2">
        <CountUp start={0} end={contenido} duration={2.5} separator="," />
      </p>
    </div>
  );
};

const EstadisticasIns = () => {
  const [totalAlumnosP, setTotalAlumnosP] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [nuevosDelMes, setNuevosDelMes] = useState([]);
  const [prospectos, setProspectos] = useState([]);
  const [convertidos, setConvertidos] = useState([]);
  const [porcentajesC, setPorcentajesC] = useState([]);
  const [tasaAsistencia, setTasaAsistencia] = useState([]);
  const [retenidos, setRetenidos] = useState([]);
  const [mensajesEnviados, setMensajesEnviados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentYear] = useState(new Date().getFullYear()); // Año actual

  const [selectedMonthName, setSelectedMonthName] = useState(''); // Nombre del mes seleccionado
  const [selectedYear, setSelectedYear] = useState(currentYear); // Año seleccionado
  const [currentMonth] = useState(new Date().getMonth() + 1); // Mes actual
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // Mes seleccionado
  // Estados adicionales
  const [deleteYear, setDeleteYear] = useState('');

  useEffect(() => {
    // Función para convertir el número del mes al nombre del mes
    const getMonthName = (month) => {
      const months = [
        'ENERO',
        'FEBRERO',
        'MARZO',
        'ABRIL',
        'MAYO',
        'JUNIO',
        'JULIO',
        'AGOSTO',
        'SEPTIEMBRE',
        'OCTUBRE',
        'NOVIEMBRE',
        'DICIEMBRE'
      ];
      return months[month - 1];
    };

    // Actualizar el nombre del mes seleccionado
    setSelectedMonthName(getMonthName(selectedMonth));
  }, [selectedMonth]); // Solo se ejecuta cuando `selectedMonth` cambia

  const URL = 'http://localhost:8080';
  // Fetch de datos desde el backend
  useEffect(() => {
    // fetchTotalAlumnosP(selectedMonth, selectedYear);
    // fetchEstadisticas();
    // fetchNuevosDelMes();
    // fetchProspectos();
    //fetchConvertidos();
    // fetchPorcentajes();
    // fetchTasaAsistencia();
    // fetchRetenidos();
    // fetchMensajes();
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('Mes:', selectedMonth);
    console.log('Año:', selectedYear);
    if (selectedMonth && selectedYear) {
      fetchTotalAlumnosP(selectedMonth, selectedYear);
      fetchEstadisticas(selectedMonth, selectedYear);
      fetchNuevosDelMes(selectedMonth, selectedYear);
      fetchProspectos(selectedMonth, selectedYear);
      fetchPorcentajes(selectedMonth, selectedYear);
      fetchTasaAsistencia(selectedMonth, selectedYear);
      fetchRetenidos(selectedMonth, selectedYear);
      fetchConvertidos(selectedMonth, selectedYear);
      fetchMensajes(selectedMonth, selectedYear);
    }
  }, [selectedMonth, selectedYear]);

  const fetchTotalAlumnosP = async (mes, anio) => {
    try {
      const url = `${URL}/estadisticas/profesores-con-alumnos-mas-de-seis-p?mes=${mes}&anio=${anio}`;
      // console.log('URL de la petición:', url); // Verifica qué URL se está enviando
      const response = await axios.get(url);

      // Verifica si la respuesta contiene un mensaje de "sin resultados"
      if (response.data.message && response.data.data.length === 0) {
        console.log('No se encontraron datos para el mes y año especificados');
        setTotalAlumnosP([]); // Establece un array vacío si no hay datos
      } else {
        setTotalAlumnosP(response.data); // De lo contrario, muestra los datos
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
    }
  };

  const fetchEstadisticas = async (mes, anio) => {
    try {
      // Construir la URL con los parámetros mes y anio
      const url = `${URL}/estadisticas/asistencias-por-profe?mes=${mes}&anio=${anio}`;
      console.log('URL de la petición:', url); // Puedes descomentar esta línea para depuración

      const response = await axios.get(url);

      // Verificar si la respuesta tiene datos
      if (response.data && response.data.length === 0) {
        console.log(
          'No se encontraron estadísticas para el mes y año especificados'
        );
        setEstadisticas([]); // Establecer un array vacío si no hay datos
      } else {
        // Si hay datos, los establecemos
        setEstadisticas(response.data); // Establecer los datos obtenidos
      }

      setLoading(false); // Finalmente, se actualiza el estado de loading
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false); // Si ocurre un error, también se detiene el estado de loading
    }
  };

  const fetchNuevosDelMes = async (mes, anio) => {
    try {
      // Generar la URL con los parámetros mes y año
      const url = `${URL}/estadisticas/nuevos-del-mes?mes=${mes}&anio=${anio}`;

      // Realizar la solicitud GET
      const response = await axios.get(url);

      // Verificar si la respuesta contiene datos
      if (response.data.message && response.data.length === 0) {
        console.log(
          'No se encontraron nuevos alumnos para el mes y año especificados'
        );
        setNuevosDelMes([]); // Establece un array vacío si no hay resultados
      } else {
        // Asegúrate de que response.data sea un array antes de asignarlo
        const nuevos = Array.isArray(response.data) ? response.data : [];
        setNuevosDelMes(nuevos); // Si es un array, establece los datos
      }
    } catch (error) {
      console.error('Error obteniendo nuevos del mes:', error);
    }
  };

  const fetchProspectos = async (mes, anio) => {
    try {
      // Generar la URL con los parámetros mes y año
      const url = `${URL}/estadisticas/prospectos-del-mes?mes=${mes}&anio=${anio}`;

      // Realizar la solicitud GET
      const response = await axios.get(url);

      // Verificar si la respuesta contiene datos
      if (response.data.message && response.data.data.length === 0) {
        console.log(
          'No se encontraron prospectos para el mes y año especificados'
        );
        setProspectos([]); // Establecer un array vacío si no hay resultados
      } else {
        // Asegurarse de que la respuesta sea un array antes de asignarlo
        const prospectos = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setProspectos(prospectos); // Si es un array, asignar los datos
      }

      setLoading(false); // Finalizar la carga
    } catch (error) {
      console.error('Error obteniendo prospectos del mes:', error);
      setLoading(false); // Si hay error, también finalizar la carga
    }
  };

  const fetchConvertidos = async (mes, anio) => {
    try {
      const url = `${URL}/estadisticas/convertidos?mes=${mes}&anio=${anio}`;
      const response = await axios.get(url);

      // Verificar si la respuesta es un array y asignarlo correctamente
      const convertidos = Array.isArray(response.data) ? response.data : [];

      setConvertidos(convertidos); // Guardar los datos en el estado
    } catch (error) {
      console.error('Error al obtener estadísticas CONVERTIDOS:', error);
    } finally {
      setLoading(false); // Finalizar la carga en cualquier caso
    }
  };

  const fetchPorcentajes = async (mes, anio) => {
    try {
      // Validar que los parámetros mes y anio existan
      if (!mes || !anio) {
        console.log('Mes y año son requeridos');
        return;
      }

      // Generar la URL con los parámetros mes y anio
      const url = `${URL}/estadisticas/porcentaje-conversion?mes=${mes}&anio=${anio}`;

      // Realizar la solicitud GET con los parámetros
      const response = await axios.get(url);

      // Verificar si la respuesta contiene datos
      if (response && response.data) {
        if (Array.isArray(response.data) && response.data.length > 0) {
          setPorcentajesC(response.data); // Establece los porcentajes si es un array y tiene datos
        } else {
          console.log(
            'No se encontraron datos para el mes y año especificados'
          );
          setPorcentajesC([]); // Establece un array vacío si no hay resultados
        }
      } else {
        console.log('La respuesta no contiene datos válidos');
        setPorcentajesC([]); // Establece un array vacío si la respuesta no es válida
      }
    } catch (error) {
      console.error('Error obteniendo porcentajes de conversión:', error);
      setPorcentajesC([]); // En caso de error, también puedes vaciar los datos
    } finally {
      setLoading(false); // Asegúrate de que el estado de carga se actualice siempre
    }
  };

  const fetchTasaAsistencia = async (mes, anio) => {
    try {
      // Construir la URL con los parámetros mes y anio
      const url = `${URL}/estadisticas/tasa-asistencia-por-profe?mes=${mes}&anio=${anio}`;
      console.log('URL de la petición:', url); // Puedes descomentar esta línea para depuración

      const response = await axios.get(url);

      // Verificar si la respuesta tiene datos
      if (response.data && response.data.length === 0) {
        console.log(
          'No se encontraron estadísticas para el mes y año especificados'
        );
        setTasaAsistencia([]); // Establecer un array vacío si no hay datos
      } else {
        // Si hay datos, los establecemos
        setTasaAsistencia(response.data); // Establecer los datos obtenidos
      }

      setLoading(false); // Finalmente, se actualiza el estado de loading
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false); // Si ocurre un error, también se detiene el estado de loading
    }
  };

  const fetchRetenidos = async (mes, anio) => {
    try {
      // Construir la URL con los parámetros mes y anio
      const url = `${URL}/estadisticas/retenciones-del-mes?mes=${mes}&anio=${anio}`;
      console.log('URL de la petición:', url); // Puedes descomentar esta línea para depuración

      const response = await axios.get(url);

      // Verificar si la respuesta tiene datos
      if (response.data && response.data.length === 0) {
        console.log('No se encontraron estadísticas de retenciones');
        setRetenidos([]); // Establecer un array vacío si no hay datos
      } else {
        // Si hay datos, los establecemos
        setRetenidos(response.data); // Establecer los datos obtenidos
      }

      setLoading(false); // Finalmente, se actualiza el estado de loading
    } catch (error) {
      console.error('Error al obtener estadísticas RETENIDOS:', error);
      setLoading(false); // Si ocurre un error, también se detiene el estado de loading
    }
  };

  const fetchMensajes = async (mes, anio) => {
    try {
      // Validar que mes y anio sean proporcionados
      if (!mes || !anio) {
        console.error('Mes y año son requeridos');
        return;
      }

      // Construir la URL con los parámetros mes y anio
      const url = `${URL}/estadisticas/mensajes-por-profe?mes=${mes}&anio=${anio}`;
      console.log('URL de la petición:', url); // Puedes descomentar esta línea para depuración

      const response = await axios.get(url);

      // Verificar si la respuesta tiene datos
      if (!response.data || response.data.length === 0) {
        console.log('No se encontraron estadísticas de mensajes');
        setMensajesEnviados([]); // Establecer un array vacío si no hay datos
      } else {
        setMensajesEnviados(response.data); // Si hay datos, los establecemos
      }

      setLoading(false); // Finalmente, se actualiza el estado de loading
    } catch (error) {
      console.error('Error al obtener estadísticas de mensajes:', error);
      setLoading(false); // Si ocurre un error, también se detiene el estado de loading
    }
  };

  // Función para retroceder al mes anterior
  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prevYear) => prevYear - 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prevYear) => prevYear + 1);
    } else {
      setSelectedMonth((prevMonth) => prevMonth + 1);
    }
  };

  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg h-contain pt-10 pb-10">
        <h1 className="text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          {selectedMonthName} {selectedYear}
        </h1>

        <div className="flex justify-center space-x-4">
          <button
            className="px-4 py-2 bg-transparent text-white rounded border-2 border-white hover:bg-orange-600 transition duration-300"
            onClick={handlePreviousMonth}
          >
            Mes Anterior
          </button>
          <button
            className="px-4 py-2 bg-transparent text-white rounded border-2 border-white hover:bg-orange-600 transition duration-300"
            onClick={handleNextMonth}
          >
            Mes Siguiente
          </button>
        </div>

        {/* Título de "Total de Alumnos" */}
        <hr className="border-t border-white w-full my-4" />
        <h1 className="text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          Total de Alumnos
        </h1>

        {loading ? (
          <p className="text-white text-xl">Cargando estadísticas...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {totalAlumnosP.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Total de alumnos ${stat.profesor_nombre}`}
                contenido={stat.total_alumnos}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título de "Total de Asistencias" */}
        <h1 className="text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          Total de Asistencias
        </h1>

        {loading ? (
          <p className="text-white text-xl">Cargando estadísticas...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Verificar si 'estadisticas' es un array y tiene datos antes de usar .map() */}
            {Array.isArray(estadisticas) && estadisticas.length > 0 ? (
              estadisticas.map((stat) => (
                <EstadisticaCard
                  key={stat.profesor_id}
                  titulo={`Asistencias de ${stat.profesor_nombre}`}
                  contenido={stat.total_asistencias}
                />
              ))
            ) : (
              <p>
                No se encontraron estadísticas para el mes y año especificados
              </p> // Mensaje alternativo si no hay datos
            )}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Nuevos del Mes" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Nuevos del Mes
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando nuevos...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de nuevos del mes */}
            {nuevosDelMes.map((stat) => (
              <EstadisticaCard
                key={`nuevos-${stat.profesor_id}`}
                titulo={`Nuevos del mes de ${stat.profesor_nombre}`}
                contenido={stat.nuevos_del_mes}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Prospectos" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Prospectos
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando prospectos...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de Prospectos */}
            {prospectos.map((stat) => (
              <EstadisticaCard
                key={`prospectos-${stat.profesor_id}`}
                titulo={`Prospectos de ${stat.profesor_nombre}`}
                contenido={stat.prospectos_del_mes}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Convertidos" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Convertidos
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando Convertidos...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de Convertidos */}
            {convertidos.map((stat) => (
              <EstadisticaCard
                key={`Convertidos-${stat.profesor_id}`}
                titulo={`Convertidos de ${stat.profesor_nombre}`}
                contenido={stat.totalConvertidos}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Porcentaje de Conversión" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Porcentaje de Conversión
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando Porcentajes...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las barras circulares para cada profesor */}
            {porcentajesC.map((stat) => (
              <EstadisticaCardCircular
                key={`Porcentaje-${stat.profesorId}`}
                titulo={stat.profesorName}
                porcentaje={stat.porcentajeConversion}
                totalProspectos={stat.totalProspectos}
                totalConvertidos={stat.totalConvertidos}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Tasa de Asistencia" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Tasa de Asistencia
        </h2>
        <div className="flex flex-wrap justify-center w-full gap-6">
          {tasaAsistencia.map((profesor) => (
            <div
              key={profesor.profesor_id}
              className="bg-white shadow-lg rounded-lg p-6 w-full md:w-1/3 m-2 text-center"
            >
              <h3 className="text-xl font-bold text-black">
                {profesor.profesor_nombre}
              </h3>
              <p className="text-3xl font-extrabold text-orange-500 mt-2">
                Tasa de Asistencia: {profesor.tasa_asistencia.toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <hr className="border-t border-white w-full my-4" />

        {/* Título para "Retenidos del mes" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Retenidos del mes
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando Retenidos del mes...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de retenidos */}
            {retenidos.map((stat) => (
              <EstadisticaCard
                key={`retenidos-${stat.profesor_id}`}
                titulo={`Retenidos de ${stat.profesor_nombre}`}
                contenido={stat.retenidos}
              />
            ))}
          </div>
        )}

        <hr className="border-t border-white w-full my-4" />

        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Porcentaje retencion-nuevos
        </h2>

        <hr className="border-t border-white w-full my-4" />

        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Mensajes Enviados
        </h2>

        {loading ? (
          <p className="text-white text-xl">Cargando estadísticas...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de Total mensajes*/}
            {mensajesEnviados.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Total de Mensajes ${stat.profesor_nombre}`}
                contenido={stat.total_mensajes}
              />
            ))}
          </div>
        )}
      </div>
      <Footer></Footer>
    </>
  );
};

export default EstadisticasIns;
