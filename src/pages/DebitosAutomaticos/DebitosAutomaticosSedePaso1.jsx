import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  ChevronLeft,
  ArrowRight,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import FooterV2 from '../../components/footer/FooterV2';
import { logo } from '../../images/svg/index';
import DebitosAutomaticosPublicPage from './DebitosAutomaticosPublicPage';
import Fachada from '../../images/sedes/Barrio Norte/Fachada.jpeg';
/* Benjamin Orellana - 07/04/2026 - Variantes visuales reutilizadas para conservar el lenguaje UX del flujo público por pasos */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 60 }
  }
};

export default function DebitosAutomaticosSedePaso1() {
  const reduceMotion = useReducedMotion();
  const motionInitialVariant = reduceMotion ? false : 'hidden';

  const [paso, setPaso] = useState(1);
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [cargandoSedes, setCargandoSedes] = useState(true);

  const isLoading = cargandoSedes;

  useEffect(() => {
    let active = true;

    /* Benjamin Orellana - 07/04/2026 - Se cargan sedes operativas para el paso 1 del flujo público de débitos automáticos */
    const cargarSedes = async () => {
      try {
        const respuesta = await axios.get('http://localhost:8080/sedes/ciudad');

        if (!active) return;

        const sedesActivas = Array.isArray(respuesta.data)
          ? respuesta.data.filter(
              (sede) =>
                String(sede?.nombre || '')
                  .toLowerCase()
                  .trim() !== 'multisede'
            )
          : [];

        setSedesDisponibles(sedesActivas);
      } catch (error) {
        console.error('Error cargando sedes para débitos automáticos:', error);
      } finally {
        if (active) setCargandoSedes(false);
      }
    };

    cargarSedes();

    return () => {
      active = false;
    };
  }, []);

  /* Benjamin Orellana - 07/04/2026 - Al seleccionar una sede se avanza al paso 2 y se reutiliza el formulario embebido de débitos */
  const seleccionarSede = (sede) => {
    setSedeSeleccionada(sede);
    setPaso(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Benjamin Orellana - 07/04/2026 - Permite volver al paso 1 para cambiar la sede antes de enviar la solicitud */
  const volverAlInicio = () => {
    setPaso(1);
    setSedeSeleccionada(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-100 text-gray-900 font-sans selection:bg-orange-200 flex min-h-screen flex-col">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-3 border border-gray-200">
            <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm font-semibold text-gray-700">
              Cargando sedes...
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-30 shadow-sm flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-3">
          <img src={logo} alt="Hammerx" className="h-10 object-contain" />
          <h1 className="text-2xl font-bignoodle text-orange-600 tracking-wide hidden sm:block">
            DÉBITOS AUTOMÁTICOS
          </h1>
        </NavLink>

        {paso === 2 && sedeSeleccionada && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm font-medium bg-gray-100 px-3 py-1.5 rounded-full"
          >
            <MapPin size={16} className="text-orange-600" />
            <span className="text-gray-700 uppercase">
              {sedeSeleccionada.nombre}
            </span>
          </motion.div>
        )}
      </header>

      <div className="bg-white/70 sm:bg-white/80 backdrop-blur border-b border-gray-100 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                  paso === 1
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-orange-600 border-orange-200'
                }`}
              >
                1
              </div>

              <div className="leading-tight">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Paso 1
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                  Elegí tu sede
                </div>
              </div>
            </div>

            <div className="flex-1 mx-2 sm:mx-4 min-w-[1rem]">
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  className="h-full bg-orange-600"
                  initial={false}
                  animate={{ width: paso === 1 ? '0%' : '100%' }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: 0.35, ease: 'easeOut' }
                  }
                />
              </div>
            </div>

            <div
              className={`flex items-center gap-2 sm:gap-3 ${
                paso === 1 ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="leading-tight text-right block">
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Paso 2
                </div>
                <div className="text-xs sm:text-sm font-semibold text-gray-900">
                  Completar solicitud
                </div>
              </div>

              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 ${
                  paso === 2
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
              >
                2
              </div>
            </div>
          </div>
        </div>
      </div>

      <main
        className={`flex-1 w-full transition-all duration-300 ${
          paso === 1 ? 'p-0 max-w-full' : 'lg:max-w-[97%] mx-auto p-4 md:p-8'
        }`}
      >
        <AnimatePresence mode="wait">
          {paso === 1 && (
            <motion.div
              key="paso1"
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="relative w-full flex flex-col items-center justify-center min-h-[calc(100vh-130px)] overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={Fachada}
                  alt="Fondo adhesión débitos automáticos"
                  className="w-full h-full object-cover filter blur-[2px] sm:blur-[5px] scale-105 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/40 to-white/20" />
              </motion.div>

              <div className="relative z-10 w-full flex flex-col items-center px-4 py-10">
                <motion.div
                  variants={itemVariants}
                  className="text-center mb-8 md:mb-10"
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 text-orange-600 px-3 py-1 text-xs font-bold uppercase tracking-wider mb-3">
                    Débitos Automáticos
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bignoodle font-bold text-gray-900 mb-2">
                    ¡Elegí tu sede más cercana!
                  </h2>

                  <p className="text-orange-600 max-w-xl font-bold">
                    Primero seleccioná la sede y luego completá la solicitud.
                  </p>
                </motion.div>

                {cargandoSedes ? (
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial={motionInitialVariant}
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6 w-full max-w-4xl md:max-w-5xl"
                  >
                    {sedesDisponibles.map((sede) => (
                      <motion.button
                        key={sede.id}
                        variants={itemVariants}
                        whileHover={
                          reduceMotion
                            ? undefined
                            : {
                                scale: 1.03,
                                y: -5,
                                boxShadow: '0px 10px 20px rgba(0,0,0,0.1)'
                              }
                        }
                        whileTap={{ scale: 0.98 }}
                        onClick={() => seleccionarSede(sede)}
                        disabled={isLoading}
                        className={`group bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border-2 border-gray-100 hover:border-orange-500 transition-colors duration-300 text-left relative overflow-hidden shadow-sm ${
                          isLoading ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-50 via-white to-white" />

                        <div className="absolute -top-2 -right-2 md:top-0 md:right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                          <MapPin
                            size={60}
                            className="text-orange-600 rotate-12 md:hidden"
                          />
                          <MapPin
                            size={100}
                            className="text-orange-600 rotate-12 hidden md:block"
                          />
                        </div>

                        <div className="relative z-10">
                          <h3 className="text-2xl md:text-3xl font-bignoodle text-gray-900 group-hover:text-orange-600 transition-colors leading-none">
                            {String(sede.nombre || '').toUpperCase()}
                          </h3>

                          <p className="text-gray-500 mt-1 md:mt-2 text-xs md:text-sm flex items-center gap-1 md:gap-2">
                            <span className="md:hidden">
                              Completar solicitud
                            </span>
                            <span className="hidden md:inline">
                              Completar solicitud en esta sede
                            </span>
                            <ArrowRight size={14} className="md:hidden" />
                            <ArrowRight
                              size={16}
                              className="hidden md:inline"
                            />
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {paso === 2 && (
            <motion.div
              key="paso2"
              initial={
                reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="w-full"
            >
              <motion.button
                whileHover={reduceMotion ? undefined : { x: -5 }}
                onClick={volverAlInicio}
                className="inline-flex items-center gap-2 text-gray-700 hover:text-orange-600 mb-6 font-medium transition-colors border-2 border-gray-100 bg-white px-3 py-2 rounded-2xl shadow-sm hover:border-orange-500"
              >
                <ChevronLeft size={20} /> Volver atrás
              </motion.button>

              <div className="w-full">
                <DebitosAutomaticosPublicPage
                  embedded
                  selectedSede={sedeSeleccionada}
                  onBack={volverAlInicio}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterV2></FooterV2>
    </div>
  );
}
