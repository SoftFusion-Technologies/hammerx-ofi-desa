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
import React, { lazy, Suspense, useState, useEffect , memo} from 'react';

import {
  BrowserRouter as Router,
  Routes as Rutas,
  Route as Ruta
} from 'react-router-dom';
import Footer from './components/footer/Footer'; // Importa el componente del pie de página
import LoginForm from './components/login/LoginForm';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import PreguntasFrecuentesGet from './pages/staff/MetodsGet/FrequentAsksGet';
import UserDetails from './pages/staff/MetodsGet/UserGetId';
import PostulanteDetails from './pages/staff/MetodsGet/PostulanteGetId';
import IntegranteDetails from './pages/staff/MetodsGet/IntegranteConveGetId';
import FrequentDetails from './pages/staff/MetodsGet/FrequentAsksGetId';
import TaskDetails from './pages/staff/MetodsGet/TaskGetId';

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
const Pautas = lazy(() => import('./pages/Pautas'));
const Legales = lazy(() => import('./pages/Legales'));
const Contacto = lazy(() => import('./pages/Contacto'));
const AdminPage = lazy(() => import('./pages/staff/AdminPage'));
// COMPONENTES PRINCIPALES DE LA PAGINA

// const FormPostu = lazy(() => import('./components/Forms/FormPostulante')); se elimina

// Renderizado de pagina del STAFF, para los metodos Get, y listado
const PostulanteGet = lazy(() => import('./pages/staff/MetodsGet/PostulanteGet'));
const NovedadGet = lazy(() => import('./pages/staff/MetodsGet/NovedadGet'));
const TaskGet = lazy(() => import('./pages/staff/MetodsGet/TaskGet'));
const ClasesGet = lazy(() => import('./pages/staff/MetodsGet/FreeClassGet'));
const UsersGet = lazy(() => import('./pages/staff/MetodsGet/UserGet'));
const AdmConveGet = lazy(() => import('./pages/staff/MetodsGet/AdmConveGet'));
// const AdmPrecioGet = lazy(() => import('./pages/staff/MetodsGet/AdmPrecioGet'));
const IntegranteConveGet= lazy(() => import('./pages/staff/MetodsGet/IntegranteConveGet'));
const FamIntegranteGet = lazy(() =>  import('./pages/staff/MetodsGet/FamIntegranteGet'));
const VendedoresGet = lazy(() => import('./pages/staff/MetodsGet/VendedoresGet'))

const AltaUserForm = lazy(() => import('./components/Forms/FormAltaUser'));
const AltaNovedadForm = lazy(() => import('./components/Forms/FormAltaNovedad'));
const AltaTaskForm = lazy(() => import('./components/Forms/FormAltaTask'));
const AltaFreAskForm = lazy(() => import('./components/Forms/FormAltaFrecAsk'));
// Renderizado de pagina del STAFF, para los metodos Get, y listado

// Renderizado de los nuevos COMPONENTES / PAGOS - INICIO - Benjamin Orellana - 27 Jul 24
import PrincipalMusculacion from './pages/Pagos/Monteros/PrincipalMusculacion.jsx';
import Efectivo from './components/Pagos/Monteros/PMusculacion/Efectivo.jsx';
import TarjetaDebito from './components/Pagos/Monteros/PMusculacion/TarjetaDebito.jsx';
import Transferencia from './components/Pagos/Monteros/PMusculacion/Transferencia.jsx';
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
  const URL = 'http://localhost:8080/schedulertask/';

  // Función para obtener las tareas
  const obtenerTasks = async () => {
    try {
      const response = await axios.get(URL);
      setTasks(response.data);
    } catch (error) {
      console.log('Error al obtener las tareas:', error);
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

  // Renderizado del componente
  return (
    <AuthProvider>
      {/* <div className="back_v2"> */}
        <Router>
          {/* Componente de Suspense para manejar la carga de componentes lazy */}
          <Suspense fallback={<Loading />}>
            {/* Condición para mostrar el componente de carga o el contenido de la aplicación */}
            {showLoading ? (
              <Loading />
            ) : (
              <>
                {/* Enrutamiento de las diferentes páginas */}
                <Rutas>
                  <Ruta path="/" element={<HomePage />} />{' '}
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
                  {/* Página de la sede de Concepción */}
                  <Ruta
                    path="/Sedes/Monteros"
                    element={<Sedemonteros />}
                  />{' '}
                  {/* Página de la sede de Monteros */}
                  <Ruta path="/pautas" element={<Pautas />} />{' '}
                  {/* Página de Pautas */}
                  <Ruta path="/legales" element={<Legales />} />{' '}
                  {/* Página de Legales */}
                  <Ruta path="/contacto" element={<Contacto />} />{' '}
                  {/* Página de Contacto */}
                  <Ruta path="/login" element={<LoginForm />} />{' '}
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
                    path="/dashboard/vendedores"
                    element={
                      <ProtectedRoute>
                        {' '}
                        <VendedoresGet />{' '}
                      </ProtectedRoute>
                    }
                  />{' '}
                  {/* Rutas de prueba para testear funcionamiento */}
                  {/* <Ruta path="/dashboard/integrantes" element={<ProtectedRoute>  <IntegranteConveGet /> </ProtectedRoute> } /> Rutas de prueba para testear funcionamiento */}
                  <Ruta
                    path="/dashboard/admconvenios/:id_conv/integrantes/"
                    element={<IntegranteConveGet />}
                  />
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
                </Rutas>
                <TaskReminder2 tasks={tasks} />
              </>
            )}
          </Suspense>
        </Router>
      {/* </div> */}
    </AuthProvider>
  );
});

export default App; // Exporta el componente de la aplicación
