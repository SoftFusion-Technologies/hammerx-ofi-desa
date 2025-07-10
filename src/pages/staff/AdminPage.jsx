import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NavbarStaff from './NavbarStaff';
import '../../styles/staff/dashboard.css';
import '../../styles/staff/background.css';
import Footer from '../../components/footer/Footer';
import TituloPreguntasModal from './MetodsGet/TituloPreguntasModal';
import PreguntaDetalleModal from './MetodsGet/PreguntaDetalleModal';
import { useAuth } from '../../AuthContext';
import ModalTareasDiarias from './ModalTareasDiarias';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const [modalPreguntasOpen, setModalPreguntasOpen] = useState(false);
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [modalTareasOpen, setModalTareasOpen] = useState(false);
  const [tareasDiarias, setTareasDiarias] = useState([]); // <- acá guardamos las tareas

  const [preguntas, setPreguntas] = useState([]);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const URL = 'http://localhost:8080/ask/';

  const URL_TAREAS = 'http://localhost:8080/tareasdiarias'; // ejemplo, tu endpoint para tareas

  const { userId, userLevel, userName } = useAuth();

  console.log(userId);
  const abrirModalPreguntas = async () => {
    try {
      const response = await axios.get(URL);
      setPreguntas(response.data);
      setModalPreguntasOpen(true);
    } catch (error) {
      console.log('Error al obtener las preguntas:', error);
    }
  };

  const cerrarModalPreguntas = () => {
    setModalPreguntasOpen(false);
  };

  const abrirModalDetalle = (pregunta) => {
    setPreguntaSeleccionada(pregunta);
    setModalDetalleOpen(true);
  };

  const cerrarModalDetalle = () => {
    setModalDetalleOpen(false);
  };

  // Control apertura/cierre modal tareas
  const cerrarModalTareas = () => {
    setModalTareasOpen(false);
  };
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/dashboard/instructores');
  };

  useEffect(() => {
    const fetchTareasDiarias = async () => {
      try {
        // Abrir modal solo si hay tareas asignadas
        const response = await axios.get(`${URL_TAREAS}?userId=${userId}`);
        setTareasDiarias(response.data);

        if (response.data.length > 0) {
          setTimeout(() => {
            setModalTareasOpen(true);
          }, 1700); // ⏱️ 1.5 segundos
        }
      } catch (error) {
        console.error('Error al obtener tareas diarias:', error);
      }
    };

    fetchTareasDiarias();
  }, [userId]);

  return (
    <>
      {/* Navbar section */}
      <NavbarStaff />

      {/* Hero section*/}
      <section className="relative w-full h-contain mx-auto bg-white">
        <div className="dashboardbg">
          <div className="xl:px-0 sm:px-16 px-6 max-w-7xl mx-auto grid grid-cols-2 max-sm:grid-cols-1 max-md:gap-y-10 md:gap-10 py-28 sm:pt-44 lg:pt-28 md:w-5/6 ">
            {(userLevel === 'admin' ||
              userLevel === 'administrador' ||
              userLevel === 'gerente' ||
              userLevel === 'vendedor') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                <Link to="/dashboard/novedades">
                  <button className="btnstaff">Foro de Novedades</button>
                </Link>
              </motion.div>
            )}

            {(userLevel === 'gerente' ||
              userLevel === 'admin' ||
              userLevel === 'vendedor' ||
              userLevel === 'administrador') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <Link to="/dashboard/testclass">
                  <button className="btnstaff">Leads y Prospectos</button>
                </Link>
              </motion.div>
            )}

            {/* {(userLevel === 'gerente' ||
              userLevel === 'admin' ||
              userLevel === 'administrador') && (
              <div className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tl-xl rounded-br-xl">
                <Link to="/dashboard/postulantes_v2">
                  <button className="btnstaff">CV's Recibidos Nueva Versión</button>
                </Link>
              </div>
            )} */}

            {(userLevel === 'gerente' ||
              userLevel === 'admin' ||
              userLevel === 'vendedor' ||
              userLevel === '' ||
              userLevel === 'administrador') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <Link to="/dashboard/admconvenios">
                  <button className="btnstaff">Convenios</button>
                </Link>
              </motion.div>
            )}

            {(userLevel === 'gerente' ||
              userLevel === 'admin' ||
              userLevel === 'instructor' ||
              userLevel === 'administrador') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <button className="btnstaff" onClick={handleButtonClick}>
                  Instructores
                </button>
              </motion.div>
            )}

            {(userLevel === 'admin' ||
              userLevel === 'administrador' ||
              userLevel === 'instructor' ||
              userLevel === 'gerente') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <Link to="/dashboard/estadisticas">
                  <button className="btnstaff">Estadísticas</button>
                </Link>
              </motion.div>
            )}

            {userLevel !== 'imagenes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <Link to="/dashboard/quejas">
                  <button className="btnstaff">Quejas</button>
                </Link>
              </motion.div>
            )}

            {userLevel === 'instructor' ||
              (userLevel != 'imagenes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                  className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
                >
                  {' '}
                  <Link to="/dashboard/ventas">
                    <button className="btnstaff">Ventas </button>
                  </Link>
                </motion.div>
              ))}

            {userLevel === 'instructor' ||
              (userLevel != 'imagenes' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
                >
                  {' '}
                  <Link to="/dashboard/recaptacion">
                    <button className="btnstaff">Recaptación</button>
                  </Link>
                </motion.div>
              ))}

            {userLevel === 'imagenes' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white font-bignoodle w-[250px] h-[100px] text-[20px] lg:w-[400px] lg:h-[150px] lg:text-[30px] mx-auto flex justify-center items-center rounded-tr-xl rounded-bl-xl"
              >
                {' '}
                <Link to="/dashboard/imagenes">
                  <button className="btnstaff">imagenes</button>
                </Link>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end p-5">
            <a
              className="relative inline-block"
              href="#"
              onClick={abrirModalPreguntas}
            >
              {(userLevel === 'gerente' ||
                userLevel === 'admin' ||
                userLevel === 'vendedor' ||
                userLevel === 'administrador') && (
                <div>
                  <span className="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-[#fc4b08]"></span>
                  <span className="fold-bold relative inline-block rounded border-2 border-[#343333] bg-white px-3 py-1 text-base font-bold text-[#fc4b08] transition duration-100 hover:bg-[#fc4b08] hover:text-white">
                    VER FAQs
                  </span>
                </div>
              )}
            </a>
          </div>
        </div>
      </section>
      <Footer></Footer>
      {modalTareasOpen && tareasDiarias.length > 0 && (
        <ModalTareasDiarias
          onClose={cerrarModalTareas}
          tareas={tareasDiarias}
          userId={userId}
          userName={userName}
        />
      )}

      {/* Modals */}
      <TituloPreguntasModal
        isOpen={modalPreguntasOpen}
        onClose={cerrarModalPreguntas}
        preguntas={preguntas}
        onPreguntaSelect={abrirModalDetalle}
      />
      <PreguntaDetalleModal
        isOpen={modalDetalleOpen}
        onClose={cerrarModalDetalle}
        pregunta={preguntaSeleccionada}
      />
    </>
  );
};

export default AdminPage;
