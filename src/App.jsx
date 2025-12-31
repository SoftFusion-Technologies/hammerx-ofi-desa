/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (App.jsx) es el componente principal de la aplicación.
 *  Contiene la configuración de enrutamiento, carga de componentes asíncrona,
 *  y la lógica para mostrar un componente de carga durante la carga inicial.
 *  Además, incluye la estructura principal de la aplicación, como la barra de navegación,
 *  el pie de página y las diferentes rutas para las páginas de la aplicación.
 *
 * Tema: Configuración de la Aplicación Principal
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { lazy, Suspense, useState, useEffect, memo } from 'react';
import imgLogo from './IMG_2463.png';
import {
  BrowserRouter as Router,
  Routes as Rutas,
  Route as Ruta
} from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function HideOnPaths({ paths, children }) {
  const { pathname } = useLocation(); // <- funciona porque está dentro del <Router>
  const ocultar = paths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
  return ocultar ? null : children;
}
import Footer from './components/footer/Footer'; // Importa el componente del pie de página
import LoginForm from './components/login/LoginForm';
import LoginProfesorPilates from './components/login/LoginProfesorPilates.jsx';
import { AuthProvider } from './AuthContext';
import { AuthInstructorProvider } from './AuthInstructorContext.jsx';
import ProtectedRoute from './ProtectedRoute';
import ProtectedRoutePilates from './ProtectedRoutePilates.jsx';
import PreguntasFrecuentesGet from './pages/staff/MetodsGet/FrequentAsksGet';
import UserDetails from './pages/staff/MetodsGet/UserGetId';
import PostulanteDetails from './pages/staff/MetodsGet/PostulanteGetId';
import IntegranteDetails from './pages/staff/MetodsGet/IntegranteConveGetId';
import FrequentDetails from './pages/staff/MetodsGet/FrequentAsksGetId';
import TaskDetails from './pages/staff/MetodsGet/TaskGetId';
import Marcas_v2 from './components/header/Marcas_v2.jsx';
import ReservasWhatsApp from './pages/Pilates/Publica/ReservasWhatsApp.jsx';

import TaskReminder2 from './components/TaskReminder2.jsx';

// Importa los diferentes componentes de las páginas usando lazy loading para mejorar el rendimiento
// COMPONENTES PRINCIPALES DE LA PAGINA
const HomePage = lazy(() => import('./pages/HomePage'));
const Clients = lazy(() => import('./pages/soycliente/Clients'));
const AboutUs = lazy(() => import('./pages/quieroconocerlos/AboutUs'));
const OurTeam = lazy(() => import('./pages/quieroconocerlos/OurTeam'));
const OurValues = lazy(() => import('./pages/quieroconocerlos/OurValues'));
const Sedeconcepcion = lazy(() => import('./pages/sedes/Concepcion'));
const Sedemonteros = lazy(() => import('./pages/sedes/Monteros'));
const Loading = lazy(() => import('./components/Loading')); // Importa el componente de carga
const Miclasefree = lazy(() => import('./pages/Mi-clase-free'));
// const MiCV = lazy(() => import('./pages/Mi-CV'));
const MiCV = lazy(() => import('./components/ModalEnvioCV.jsx'));
const CongelamientosCont = lazy(() => import('./pages/CongelamientosCont.jsx'));
const Pautas = lazy(() => import('./pages/Pautas'));
const Legales = lazy(() => import('./pages/Legales'));
const Contacto = lazy(() => import('./pages/Contacto'));
const AdminPage = lazy(() => import('./pages/staff/AdminPage'));
const NewSede = lazy(() => import('./pages/NewSede'));
const ProductosPrincipal = lazy(() =>
  import('./pages/Productos/ProductsPrincipal.jsx')
);

// COMPONENTES PRINCIPALES DE LA PAGINA

// const FormPostu = lazy(() => import('./components/Forms/FormPostulante')); se elimina

// Renderizado de pagina del STAFF, para los metodos Get, y listado
const PostulanteGet = lazy(() =>
  import('./pages/staff/MetodsGet/PostulanteGet')
);

const PostulanteGetV2 = lazy(() =>
  import('./pages/staff/MetodsGet/PostulanteGetV2')
);
const NovedadGet = lazy(() => import('./pages/staff/MetodsGet/NovedadGet'));
const TaskGet = lazy(() => import('./pages/staff/MetodsGet/TaskGet'));
const ClasesGet = lazy(() => import('./pages/staff/MetodsGet/FreeClassGet'));
const QuejasInternasGet = lazy(() =>
  import('./pages/staff/MetodsGet/QuejasInternasGet')
);
const UsersGet = lazy(() => import('./pages/staff/MetodsGet/UserGet'));
const SedesGet = lazy(() => import('./pages/staff/MetodsGet/SedesGet'));
const AdmConveGet = lazy(() => import('./pages/staff/MetodsGet/AdmConveGet'));
// const AdmPrecioGet = lazy(() => import('./pages/staff/MetodsGet/AdmPrecioGet'));
const IntegranteConveGet = lazy(() =>
  import('./pages/staff/MetodsGet/IntegranteConveGet')
);
const FamIntegranteGet = lazy(() =>
  import('./pages/staff/MetodsGet/FamIntegranteGet')
);
const EstadisticasIns = lazy(() =>
  import('./pages/staff/MetodsGet/EstadisticasIns')
);
const PlanillaEntrenador = lazy(() =>
  import('./pages/staff/PlanillaEntrenador.jsx')
);

const InstructoresGet = lazy(() =>
  import('./pages/staff/MetodsGet/InstructoresGet.jsx')
);

const AltaUserForm = lazy(() => import('./components/Forms/FormAltaUser'));
const AltaNovedadForm = lazy(() =>
  import('./components/Forms/FormAltaNovedad')
);
const AltaTaskForm = lazy(() => import('./components/Forms/FormAltaTask'));
const AltaFreAskForm = lazy(() => import('./components/Forms/FormAltaFrecAsk'));

const SedeBarrioNorte = lazy(() => import('./pages/SedeBarrioNorte'));
// Renderizado de pagina del STAFF, para los metodos Get, y listado

// Renderizado de los nuevos COMPONENTES / PAGOS - INICIO - Benjamin Orellana - 27 Jul 24
// Musculacion Monteros
import PrincipalMusculacion from './pages/Pagos/Monteros/PrincipalMusculacion.jsx';
import Efectivo from './components/Pagos/Monteros/PMusculacion/Efectivo.jsx';
import TarjetaDebito from './components/Pagos/Monteros/PMusculacion/TarjetaDebito.jsx';
import Transferencia from './components/Pagos/Monteros/PMusculacion/Transferencia.jsx';
// Grupales Monteros
import PrincipalGrupales from './pages/Pagos/Monteros/PrincipalGrupales.jsx';
import EfectivoG from './components/Pagos/Monteros/PGrupales/Efectivo.jsx';
import TarjetaDebitoG from './components/Pagos/Monteros/PGrupales/TarjetaDebito.jsx';
import TransferenciaG from './components/Pagos/Monteros/PGrupales/Transferencia.jsx';
// Pase Libre Monteros
import PrincipalPaseLibre from './pages/Pagos/Monteros/PrincipalPaseLibre.jsx';
import EfectivoP from './components/Pagos/Monteros/PPaseLibre/Efectivo.jsx';
import TarjetaDebitoP from './components/Pagos/Monteros/PPaseLibre/TarjetaDebito.jsx';
import TransferenciaP from './components/Pagos/Monteros/PPaseLibre/Transferencia.jsx';
// Plan Trimestral Monteros
import PrincipalTrimestrales from './pages/Pagos/Monteros/PrincipalTrimestrales.jsx';
import EfectivoT from './components/Pagos/Monteros/PTrimestral/Efectivo.jsx';
import TarjetaDebitoT from './components/Pagos/Monteros/PTrimestral/TarjetaDebito.jsx';
import TarjetaCreditoT from './components/Pagos/Monteros/PTrimestral/TarjetaCredito.jsx';
import TransferenciaT from './components/Pagos/Monteros/PTrimestral/Transferencia.jsx';
import CuotasTrimestral from './components/Pagos/Monteros/PTrimestral/CuotasTrimestral.jsx';
// Plan Semestral Monteros
import PrincipalSemestrales from './pages/Pagos/Monteros/PrincipalSemestrales.jsx';
import EfectivoS from './components/Pagos/Monteros/PSemestral/Efectivo.jsx';
import TarjetaDebitoS from './components/Pagos/Monteros/PSemestral/TarjetaDebito.jsx';
import TarjetaCreditoS from './components/Pagos/Monteros/PSemestral/TarjetaCredito.jsx';
import TransferenciaS from './components/Pagos/Monteros/PSemestral/Transferencia.jsx';
import CuotasSemestral from './components/Pagos/Monteros/PSemestral/CuotasSemestral.jsx';

// Plan Anual Monteros
import PrincipalAnual from './pages/Pagos/Monteros/PrincipalAnual.jsx';
import EfectivoA from './components/Pagos/Monteros/PAnual/Efectivo.jsx';
import TarjetaDebitoA from './components/Pagos/Monteros/PAnual/TarjetaDebito.jsx';
import TarjetaCreditoA from './components/Pagos/Monteros/PAnual/TarjetaCredito.jsx';
import TransferenciaA from './components/Pagos/Monteros/PAnual/Transferencia.jsx';
import CuotasAnual from './components/Pagos/Monteros/PAnual/CuotasAnual.jsx';

// Renderizado de los nuevos COMPONENTES / PAGOS - INICIO - Benjamin Orellana - 27 Jul 24
// Musculacion Concepcion
import PrincipalMusculacionC from './pages/Pagos/Concepcion/PrincipalMusculacion.jsx';
import EfectivoC from './components/Pagos/Concepcion/PMusculacion/Efectivo.jsx';
import TarjetaDebitoC from './components/Pagos/Concepcion/PMusculacion/TarjetaDebito.jsx';
import TransferenciaC from './components/Pagos/Concepcion/PMusculacion/Transferencia.jsx';

// Grupales Concepcion
import PrincipalGrupalesC from './pages/Pagos/Concepcion/PrincipalGrupales.jsx';
import EfectivoGC from './components/Pagos/Concepcion/PGrupales/Efectivo.jsx';
import TarjetaDebitoGC from './components/Pagos/Concepcion/PGrupales/TarjetaDebito.jsx';
import TransferenciaGC from './components/Pagos/Concepcion/PGrupales/Transferencia.jsx';

// Pase Libre Concepcion
import PrincipalPaseLibreC from './pages/Pagos/Concepcion/PrincipalPaseLibre.jsx';
import EfectivoPC from './components/Pagos/Concepcion/PPaseLibre/Efectivo.jsx';
import TarjetaDebitoPC from './components/Pagos/Concepcion/PPaseLibre/TarjetaDebito.jsx';
import TransferenciaPC from './components/Pagos/Concepcion/PPaseLibre/Transferencia.jsx';

// Plan Trimestral Concepcion
import PrincipalTrimestralesC from './pages/Pagos/Concepcion/PrincipalTrimestrales.jsx';
import EfectivoTC from './components/Pagos/Concepcion/PTrimestral/Efectivo.jsx';
import TarjetaDebitoTC from './components/Pagos/Concepcion/PTrimestral/TarjetaDebito.jsx';
import TarjetaCreditoTC from './components/Pagos/Concepcion/PTrimestral/TarjetaCredito.jsx';
import TransferenciaTC from './components/Pagos/Concepcion/PTrimestral/Transferencia.jsx';
import CuotasTrimestralC from './components/Pagos/Concepcion/PTrimestral/CuotasTrimestral.jsx';
// Plan Semestral Concepcion
import PrincipalSemestralesC from './pages/Pagos/Concepcion/PrincipalSemestrales.jsx';
import EfectivoSC from './components/Pagos/Concepcion/PSemestral/Efectivo.jsx';
import TarjetaDebitoSC from './components/Pagos/Concepcion/PSemestral/TarjetaDebito.jsx';
import TarjetaCreditoSC from './components/Pagos/Concepcion/PSemestral/TarjetaCredito.jsx';
import TransferenciaSC from './components/Pagos/Concepcion/PSemestral/Transferencia.jsx';
import CuotasSemestralC from './components/Pagos/Concepcion/PSemestral/CuotasSemestral.jsx';

// Plan Anual Concepcion
import PrincipalAnualC from './pages/Pagos/Concepcion/PrincipalAnual.jsx';
import EfectivoAC from './components/Pagos/Concepcion/PAnual/Efectivo.jsx';
import TarjetaDebitoAC from './components/Pagos/Concepcion/PAnual/TarjetaDebito.jsx';
import TarjetaCreditoAC from './components/Pagos/Concepcion/PAnual/TarjetaCredito.jsx';
import TransferenciaAC from './components/Pagos/Concepcion/PAnual/Transferencia.jsx';
import CuotasAnualC from './components/Pagos/Concepcion/PAnual/CuotasAnual.jsx';
import ComentariosPage from './pages/ComentariosPage.jsx';
import ComentariosPageConcep from './pages/ComentariosPageConcep.jsx';
import QuejasVist from './pages/Quejas/QuejasVist.jsx';

import RecaptacionGet from './pages/staff/MetodsGet/RecaptacionGet.jsx';
import VentasProspectosGet from './pages/staff/MetodsGet/VentasProspectosGet.jsx';

//pilates
import PilatesInstructores from './pages/Pilates/PilatesInstructores.jsx';
import PilatesGestion from './pages/Pilates/PilatesGestion.jsx';

//Remarketing
import VentasRemarketingGet from './pages/staff/MetodsGet/VentasRemarketingGet.jsx';

import NotFound from './pages/NotFound.jsx';
import LogsAuditoria from './pages/LogsAuditoria.jsx';
import PromosDashboard from './pages/staff/MetodsGet/PromosDashboard.jsx';
import PreguntasIA from './pages/staff/PreguntasIA.jsx';
import ProximamenteSede from './pages/ProximamenteSede.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import SoftFusionIntro from './pages/Innovation/SoftFusionIntro.jsx';
// Renderizado de los nuevos COMPONENTES / PAGOS - FINAL - Benjamin Orellana - 27 Jul 24
/**
 * Componente principal de la aplicación.
 *
 * @returns {JSX.Element} Elemento JSX que representa la aplicación.
 */

const App = memo(() => {
  // Estado para controlar si se debe mostrar el componente de carga
  const [showLoading, setShowLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  // URL para obtener las tareas
  // const URL = 'http://localhost:8080/schedulertask/';
  const URL = 'http://localhost:8080/schedulertask/';
  //const URL = 'http://localhos:8080/schedulertask';

  // Función para obtener las tareas
  const obtenerTasks = async () => {
    try {
      const response = await axios.get(URL);
      setTasks(response.data);
    } catch (error) {
      // console.log('Error al obtener las tareas:', error);
    }
  };

  useEffect(() => {
    obtenerTasks(); // Carga las tareas cuando el componente se monte
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Establece un temporizador para ocultar el componente de carga después de 2 segundos
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 1700);

    // Limpia el temporizador al desmontar el componente para evitar fugas de memoria
    return () => clearTimeout(timer);
  }, []); // Este efecto se ejecuta solo una vez, al montar el componente

  return (
    <AuthProvider>
      <AuthInstructorProvider>
        {/* <div className="back_v2"> */}
        <Router>
          {/* Componente de Suspense para manejar la carga de componentes lazy */}
          <Suspense fallback={<Loading />}>
            {/* Condición para mostrar el componente de carga o el contenido de la aplicación */}
            {showLoading ? (
              <Loading />
            ) : (
              <>
                <ScrollToTop />

                {/* Enrutamiento de las diferentes páginas */}
                <Rutas>
                  <Ruta path="/" element={<HomePage />} />{' '}
                  <Ruta
                    path="/innovation"
                    element={
                      <SoftFusionIntro
                        logoSrc={imgLogo}
                        onReady={(nombre) =>
                          console.log('Nombre guardado:', nombre)
                        }
                      />
                    }
                  />{' '}
                  {/* Página principal */}
                  <Ruta path="/clientes" element={<Clients />} />{' '}
                  {/* Página de clientes */}
                  <Ruta path="/nosotros" element={<AboutUs />} />{' '}
                  {/* Página "Nosotros" */}
                  <Ruta
                    path="/nosotros/quienessomos"
                    element={<OurTeam />}
                  />{' '}
                  {/* Página "Quiénes somos" */}
                  <Ruta
                    path="/nosotros/nuestrosvalores"
                    element={<OurValues />}
                  />{' '}
                  {/* Página "Nuestros valores" */}
                  <Ruta
                    path="/Sedes/Concepcion"
                    element={<Sedeconcepcion />}
                  />{' '}
                  <Ruta
                    path="/nueva_sede_hammerx"
                    element={<SedeBarrioNorte />}
                  />
                  <Ruta
                    path="/nueva_sede_hammerx_barrio_norte"
                    element={<SedeBarrioNorte />}
                  />{' '}
                  {/* Página de la sede de Concepción */}
                  <Ruta
                    path="/Sedes/Monteros"
                    element={<Sedemonteros />}
                  />{' '}
                  {/* Página de la sede de Monteros */}
                  <Ruta path="/mi-clase-free" element={<Miclasefree />} />{' '}
                  <Ruta
                    path="/mi-cv"
                    element={<MiCV isOpen={true} onClose={false} />}
                  />{' '}
                  <Ruta
                    path="/congelamientos"
                    element={<CongelamientosCont />}
                  />{' '}
                  <Ruta path="/pautas" element={<Pautas />} />{' '}
                  {/* Página de Pautas */}
                  <Ruta path="/legales" element={<Legales />} />{' '}
                  {/* Página de Legales */}
                  <Ruta path="/contacto" element={<Contacto />} />{' '}
                  {/* Página de Contacto */}
                  <Ruta path="/login" element={<LoginForm />} />{' '}
                  <Ruta path="/pilates" element={<LoginProfesorPilates />} />
                  {/* Página de Logeo */}
                  {/* <Ruta path="/form" element={<FormPostu />} /> Rutas de prueba para testear funcionamiento */}
                  <Ruta path="/formusers" element={<AltaUserForm />} />{' '}
                  {/*  TABLA USERS Rutas de prueba para testear funcionamiento */}
                  <Ruta path="/formnovedad" element={<AltaNovedadForm />} />{' '}
                  {/* TABLA NOVEDAD Rutas de prueba para testear funcionamiento */}
                  <Ruta path="/formtask" element={<AltaTaskForm />} />{' '}
                  {/* TABLA SCHEDULERTASK Rutas de prueba para testear funcionamiento */}
                  <Ruta path="/formask" element={<AltaFreAskForm />} />{' '}
                  {/* TABLA FRECASK Rutas de prueba para testear funcionamiento */}
                  {/* Ruta para la página del staff */}
                  <Ruta path="/comentarios" element={<QuejasVist />} />{' '}
                  <Ruta path="/comentarios-monteros" element={<QuejasVist />} />{' '}
                  <Ruta
                    path="/comentarios-concepcion"
                    element={<QuejasVist />}
                  />{' '}
                  <Ruta
                    path="/comentarios-barriosur"
                    element={<QuejasVist />}
                  />{' '}
                  <Ruta
                    path="/comentarios-barrionorte"
                    element={<QuejasVist />}
                  />{' '}
                  <Ruta
                    path="/reservas-pilates"
                    element={<ReservasWhatsApp />}
                  />{' '}
                  <Ruta
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <AdminPage />{' '}
                      </ProtectedRoute>
                    }
                  />
                  <Ruta
                    path="/dashboard/postulantes"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PostulanteGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/postulantes_v2"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PostulanteGetV2 />
                      </ProtectedRoute>
                    }
                  />
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/testclass"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <ClasesGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/quejas"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <QuejasInternasGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/quejas/:id"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <QuejasInternasGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/users"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <UsersGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/admagrupadores"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <SedesGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/novedades"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <NovedadGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/novedades/:id"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <NovedadGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/ask"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PreguntasFrecuentesGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/ask/:id"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PreguntasFrecuentesGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/task"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <TaskGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/admconvenios"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <AdmConveGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  {/* <Ruta path="/dashboard/admprecio" element={<ProtectedRoute>  <AdmPrecioGet /> </ProtectedRoute> } /> Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/estadisticas"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <EstadisticasIns />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/instructores"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <InstructoresGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/instructores/planilla"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PlanillaEntrenador />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/pilates/gestion"
                    element={
                      <ProtectedRoute>
                        <PilatesGestion />
                      </ProtectedRoute>
                    }
                  />
                  {/* Rutas de prueba para testear funcionamiento */}
                  {/* <Ruta path="/dashboard/integrantes" element={<ProtectedRoute>  <IntegranteConveGet /> </ProtectedRoute> } /> Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/admconvenios/:id_conv/integrantes/"
                    element={<IntegranteConveGet />}
                  />
                  <Ruta
                    path="/dashboard/instructores/:user_id/planilla"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PlanillaEntrenador />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/admconvenios/:id_conv/integrantes/:id_integrante/integrantesfam/"
                    element={<FamIntegranteGet />}
                  />
                  {/* Rutas para obtener por los registros por id*/}
                  <Ruta path="/users/:id" element={<UserDetails />} />
                  <Ruta
                    path="/postulantes/:id"
                    element={<PostulanteDetails />}
                  />
                  <Ruta
                    path="/integrantes/:id"
                    element={<IntegranteDetails />}
                  />
                  <Ruta path="/ask/:id" element={<FrequentDetails />} />
                  <Ruta path="/task/:id" element={<TaskDetails />} />
                  {/* pagos monteros */}
                  <Ruta
                    path="/pagos/monteros/musculacion"
                    element={<PrincipalMusculacion />}
                  />
                  <Ruta
                    path="/pagos/monteros/musculacion/efectivo"
                    element={<Efectivo />}
                  />
                  <Ruta
                    path="/pagos/monteros/musculacion/tarjeta-debito"
                    element={<TarjetaDebito />}
                  />
                  <Ruta
                    path="/pagos/monteros/musculacion/transferencia"
                    element={<Transferencia />}
                  />
                  <Ruta
                    path="/pagos/monteros/grupales"
                    element={<PrincipalGrupales />}
                  />
                  <Ruta
                    path="/pagos/monteros/grupales/efectivo"
                    element={<EfectivoG />}
                  />
                  <Ruta
                    path="/pagos/monteros/grupales/tarjeta-debito"
                    element={<TarjetaDebitoG />}
                  />
                  <Ruta
                    path="/pagos/monteros/grupales/transferencia"
                    element={<TransferenciaG />}
                  />
                  <Ruta
                    path="/pagos/monteros/paselibre"
                    element={<PrincipalPaseLibre />}
                  />
                  <Ruta
                    path="/pagos/monteros/paselibre/efectivo"
                    element={<EfectivoP />}
                  />
                  <Ruta
                    path="/pagos/monteros/paselibre/tarjeta-debito"
                    element={<TarjetaDebitoP />}
                  />
                  <Ruta
                    path="/pagos/monteros/paselibre/transferencia"
                    element={<TransferenciaP />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral"
                    element={<PrincipalTrimestrales />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral/efectivo"
                    element={<EfectivoT />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral/tarjeta-debito"
                    element={<TarjetaDebitoT />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoT />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral/transferencia"
                    element={<TransferenciaT />}
                  />
                  <Ruta
                    path="/pagos/monteros/trimestral/cuotas"
                    element={<CuotasTrimestral />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral"
                    element={<PrincipalSemestrales />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral/efectivo"
                    element={<EfectivoS />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral/tarjeta-debito"
                    element={<TarjetaDebitoS />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoS />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral/transferencia"
                    element={<TransferenciaS />}
                  />
                  <Ruta
                    path="/pagos/monteros/semestral/cuotas"
                    element={<CuotasSemestral />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual"
                    element={<PrincipalAnual />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual/efectivo"
                    element={<EfectivoA />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual/tarjeta-debito"
                    element={<TarjetaDebitoA />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoA />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual/transferencia"
                    element={<TransferenciaA />}
                  />
                  <Ruta
                    path="/pagos/monteros/anual/cuotas"
                    element={<CuotasAnual />}
                  />
                  {/* pagos concepcion */}
                  <Ruta
                    path="/pagos/concepcion/musculacion"
                    element={<PrincipalMusculacionC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/musculacion/efectivo"
                    element={<EfectivoC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/musculacion/tarjeta-debito"
                    element={<TarjetaDebitoC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/musculacion/transferencia"
                    element={<TransferenciaC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/grupales"
                    element={<PrincipalGrupalesC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/grupales/efectivo"
                    element={<EfectivoGC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/grupales/tarjeta-debito"
                    element={<TarjetaDebitoGC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/grupales/transferencia"
                    element={<TransferenciaGC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/paselibre"
                    element={<PrincipalPaseLibreC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/paselibre/efectivo"
                    element={<EfectivoPC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/paselibre/tarjeta-debito"
                    element={<TarjetaDebitoPC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/paselibre/transferencia"
                    element={<TransferenciaPC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral"
                    element={<PrincipalTrimestralesC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral/efectivo"
                    element={<EfectivoTC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral/tarjeta-debito"
                    element={<TarjetaDebitoTC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoTC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral/transferencia"
                    element={<TransferenciaTC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/trimestral/cuotas"
                    element={<CuotasTrimestralC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral"
                    element={<PrincipalSemestralesC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral/efectivo"
                    element={<EfectivoSC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral/tarjeta-debito"
                    element={<TarjetaDebitoSC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoSC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral/transferencia"
                    element={<TransferenciaSC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/semestral/cuotas"
                    element={<CuotasSemestralC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual"
                    element={<PrincipalAnualC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual/efectivo"
                    element={<EfectivoAC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual/tarjeta-debito"
                    element={<TarjetaDebitoAC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual/cuotas/tarjeta-credito"
                    element={<TarjetaCreditoAC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual/transferencia"
                    element={<TransferenciaAC />}
                  />
                  <Ruta
                    path="/pagos/concepcion/anual/cuotas"
                    element={<CuotasAnualC />}
                  />
                  <Ruta
                    path="/comentarios/monteros"
                    element={<ComentariosPage />}
                  />
                  <Ruta
                    path="/comentarios/concepcion"
                    element={<ComentariosPageConcep />}
                  />
                  <Ruta path="/nueva_sede_hammerx" element={<NewSede />} />
                  <Ruta path="/productos" element={<ProductosPrincipal />} />
                  <Ruta
                    path="/dashboard/recaptacion"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <RecaptacionGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/ventas"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <VentasProspectosGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/ventas-remarketing"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <VentasRemarketingGet />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/logs"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <LogsAuditoria />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/imagenes"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PromosDashboard />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/dashboard/preguntas-ia"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <PreguntasIA />
                      </ProtectedRoute>
                    }
                  />{' '}
                  <Ruta
                    path="/pilates/instructor"
                    element={
                      <ProtectedRoutePilates>
                        <PilatesInstructores />
                      </ProtectedRoutePilates>
                    }
                  />{' '}
                  <Ruta path="/*" element={<NotFound />} />
                </Rutas>
                <TaskReminder2 tasks={tasks} />
              </>
            )}
          </Suspense>
          <HideOnPaths paths={['/innovation', '/login', "/reservas-pilates"]}>
            <Marcas_v2 />
          </HideOnPaths>{' '}
        </Router>
        {/* </div> */}
      </AuthInstructorProvider>
    </AuthProvider>
  );
});

export default App; // Exporta el componente de la aplicación
