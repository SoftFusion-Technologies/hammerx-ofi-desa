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

  const URL = 'http://localhost:8080';
  // Fetch de datos desde el backend
  useEffect(() => {
    fetchTotalAlumnosP();
    fetchEstadisticas();
    fetchNuevosDelMes();
    fetchProspectos();
    fetchConvertidos();
    fetchPorcentajes();
    fetchTasaAsistencia();
    fetchRetenidos();
    fetchMensajes();
    setLoading(false);
  }, []);

  const fetchTotalAlumnosP = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/profesores-con-alumnos-mas-de-seis-p`
      );
      setTotalAlumnosP(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/asistencias-por-profe`
      );
      setEstadisticas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchNuevosDelMes = async () => {
    try {
      const response = await axios.get(`${URL}/estadisticas/nuevos-del-mes`);
      setNuevosDelMes(response.data);
    } catch (error) {
      console.error('Error obteniendo nuevos del mes:', error);
    }
  };

  const fetchProspectos = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/prospectos-del-mes`
      );
      setProspectos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchConvertidos = async () => {
    try {
      const response = await axios.get(`${URL}/estadisticas/convertidos`);
      setConvertidos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchPorcentajes = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/porcentaje-conversion`
      );
      setPorcentajesC(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchTasaAsistencia = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/tasa-asistencia-por-profe`
      );
      setTasaAsistencia(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchRetenidos = async () => {
    try {
      const response = await axios.get(`${URL}/estadisticas/alumnos-retenidos`);
      setRetenidos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };

  const fetchMensajes = async () => {
    try {
      const response = await axios.get(
        `${URL}/estadisticas/mensajes-por-profe`
      );
      setMensajesEnviados(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      setLoading(false);
    }
  };
  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        {/* Título de "Total de Alumnos" */}
        <h1 className="text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          Total de Alumnos
        </h1>

        {loading ? (
          <p className="text-white text-xl">Cargando estadísticas...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de Total alumnos*/}
            {totalAlumnosP.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Total de alumnos ${stat.profesor_nombre}`}
                contenido={stat.totalalumnos}
              />
            ))}
          </div>
        )}

        {/* Título de "Total de Asistencias" */}
        <h1 className="text-5xl font-bold text-white mb-8 text-center mt-10 uppercase font-bignoodle">
          Total de Asistencias
        </h1>

        {loading ? (
          <p className="text-white text-xl">Cargando estadísticas...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de asistencias */}
            {estadisticas.map((stat) => (
              <EstadisticaCard
                key={stat.profesor_id}
                titulo={`Asistencias de ${stat.profesor_nombre}`}
                contenido={stat.total_asistencias}
              />
            ))}
          </div>
        )}

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

        {/* Título para "Retenidos del mes" */}
        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Retenidos del mes
        </h2>

        {/* {loading ? (
          <p className="text-white text-xl">Cargando Retenidos del mes...</p>
        ) : (
          <div className="flex flex-wrap justify-center w-full gap-6">
            {/* Mostrar las estadísticas de retenidos */}
        {/* {retenidos.map((stat) => (
              <EstadisticaCard
                key={`retenidos-${stat.profesor_id}`}
                titulo={`Retenidos de ${stat.profesor_nombre}`}
                contenido={stat.totalConvertidos}
              />
            ))}
          </div> */}
        {/* )}  */}
        {/* */}

        <h2 className="text-5xl font-bold text-white mt-16 mb-8 text-center uppercase font-bignoodle">
          Porcentaje retencion-nuevos
        </h2>

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
