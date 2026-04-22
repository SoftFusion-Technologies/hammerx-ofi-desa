/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 17 / 04 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (VentasProspectosPublicPaso1.jsx) contiene el paso 1 del flujo público
 * para registrar prospectos de visitas programadas o clases de prueba, permitiendo
 * seleccionar la sede operativa antes de avanzar al formulario.
 *
 * Tema: Frontend - Registro Público de Prospectos
 *
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MapPin, ChevronLeft, ArrowRight } from 'lucide-react';
import FooterV2 from '../components/footer/FooterV2';
import { logo } from '../images/svg/index';
import Fachada from '../images/sedes/Barrio Norte/Fachada.jpeg';
import VentasProspectosPublicForm from '../components/Forms/VentasProspectosPublicForm';
import ImgProfe from '../images/Img_PublicForm_ClasVis.jpeg';
/* Benjamin Orellana - 2026/04/17 - Variantes visuales reutilizadas para mantener el lenguaje UX del flujo público. */
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

export default function VentasProspectosPublicPaso1() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const motionInitialVariant = reduceMotion ? false : 'hidden';

  const [paso, setPaso] = useState(1);
  const [sedesDisponibles, setSedesDisponibles] = useState([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState(null);
  const [cargandoSedes, setCargandoSedes] = useState(true);

  const isLoading = cargandoSedes;

  /* Benjamin Orellana - 2026/04/17 - El flujo público detecta automáticamente si el acceso es por visita programada o clase de prueba. */
  const flowConfig = useMemo(() => {
    const pathname = String(location.pathname || '').toLowerCase();

    const esClaseDePrueba = pathname.includes('/clase-de-prueba');

    if (esClaseDePrueba) {
      return {
        tipoLinkInicial: 'Clase de prueba',
        tituloHeader: 'CLASES DE PRUEBA',
        badge: 'Clase de prueba',
        tituloHero: 'Elegí tu sede más cercana',
        descripcionHero:
          'Primero seleccioná la sede y luego completá tu solicitud para reservar tu clase de prueba.',
        textoPaso2: 'Completar solicitud'
      };
    }

    return {
      tipoLinkInicial: 'Visita programada',
      tituloHeader: 'VISITAS PROGRAMADAS',
      badge: 'Visita programada',
      tituloHero: 'Elegí tu sede más cercana',
      descripcionHero:
        'Primero seleccioná la sede y luego completá tu solicitud para coordinar tu visita programada.',
      textoPaso2: 'Completar solicitud'
    };
  }, [location.pathname]);

  /* Benjamin Orellana - 2026/04/22 - Define la imagen fija del paso 2 para el modo mobile inmersivo del formulario público. */
  const resolverImagenPaso2 = (fallback) => String(fallback || '').trim();

  /* Benjamin Orellana - 2026/04/22 - Se fija la imagen del paso 2 con la visual institucional del formulario público. */
  const backgroundPaso2 = useMemo(() => resolverImagenPaso2(ImgProfe), []);
  useEffect(() => {
    let active = true;

    /* Benjamin Orellana - 2026/04/17 - Se cargan únicamente sedes operativas para el paso 1 del flujo público de prospectos. */
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
        console.error(
          'Error cargando sedes para registro público de prospectos:',
          error
        );
      } finally {
        if (active) setCargandoSedes(false);
      }
    };

    cargarSedes();

    return () => {
      active = false;
    };
  }, []);

  /* Benjamin Orellana - 2026/04/17 - Al seleccionar una sede se avanza al paso 2 conservando el tipo de flujo detectado por la URL. */
  const seleccionarSede = (sede) => {
    setSedeSeleccionada(sede);
    setPaso(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Benjamin Orellana - 2026/04/17 - Permite volver al paso 1 para cambiar la sede seleccionada antes de completar el formulario. */
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

      <header
        className={`sticky top-0 z-30 border-b border-gray-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6 ${
          paso === 2 ? 'hidden sm:block' : ''
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3">
          <NavLink to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logo}
              alt="Hammerx"
              className="h-8 object-contain sm:h-9"
            />

            <h1 className="hidden text-xl font-bignoodle tracking-wide text-orange-600 sm:block">
              {flowConfig.tituloHeader}
            </h1>
          </NavLink>

          {paso === 2 && sedeSeleccionada && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 sm:text-sm"
            >
              <MapPin size={14} className="text-orange-600" />
              <span className="max-w-[120px] truncate uppercase sm:max-w-[180px]">
                {sedeSeleccionada.nombre}
              </span>
            </motion.div>
          )}
        </div>
      </header>

      <div
        className={`border-b border-gray-100 bg-[#f5f5f5] ${
          paso === 2 ? 'hidden sm:block' : ''
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-3 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  paso === 1
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-orange-200 bg-white text-orange-600'
                }`}
              >
                1
              </div>

              <div className="leading-tight">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Paso 1
                </div>
                <div className="text-xs font-semibold text-gray-900 sm:text-sm">
                  Elegí tu sede
                </div>
              </div>
            </div>

            <div className="min-w-[44px] flex-1">
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  className="h-full rounded-full bg-orange-600"
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
                paso === 1 ? 'opacity-60' : 'opacity-100'
              }`}
            >
              <div className="leading-tight text-right">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                  Paso 2
                </div>
                <div className="text-xs font-semibold text-gray-900 sm:text-sm">
                  {flowConfig.textoPaso2}
                </div>
              </div>

              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                  paso === 2
                    ? 'border-orange-600 bg-orange-600 text-white'
                    : 'border-gray-200 bg-white text-gray-400'
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
          paso === 1
            ? 'p-0 max-w-full'
            : 'px-0 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8 xl:mx-auto xl:max-w-[1280px]'
        }`}
      >
        <AnimatePresence mode="wait">
          {paso === 1 && (
            <motion.div
              key={`paso1-${flowConfig.tipoLinkInicial}`}
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
                  alt={`Fondo ${flowConfig.tipoLinkInicial.toLowerCase()}`}
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
                    {flowConfig.badge}
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bignoodle font-bold text-gray-900 mb-2">
                    {flowConfig.tituloHero}
                  </h2>

                  <p className="text-orange-600 max-w-xl font-bold">
                    {flowConfig.descripcionHero}
                  </p>
                </motion.div>

                {cargandoSedes ? (
                  <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
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
                            <span>Continuar con esta sede</span>
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
              key={`paso2-${flowConfig.tipoLinkInicial}`}
              initial={
                reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="w-full -mt-5"
            >
              <div className="hidden w-full px-4 sm:block sm:px-0">
                <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                  <motion.button
                    whileHover={reduceMotion ? undefined : { x: -3 }}
                    onClick={volverAlInicio}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:border-orange-300 hover:text-orange-600"
                  >
                    <ChevronLeft size={18} />
                    Volver atrás
                  </motion.button>
                </div>
              </div>

              <div className="w-full overflow-visible rounded-none border-0 bg-transparent p-0 shadow-none">
                <VentasProspectosPublicForm
                  selectedSede={sedeSeleccionada}
                  tipoLinkInicial={flowConfig.tipoLinkInicial}
                  backgroundImageUrl={backgroundPaso2}
                  compactHeader
                  immersiveMobile
                  onBack={volverAlInicio}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterV2 />
    </div>
  );
}
