import { useState } from 'react';
import { theme } from '../../images';
import Menu from './Menu';
import Marcas from './Marcas';
import { Link, useLocation } from 'react-router-dom'; // Importar useLocation
import DropdownMenu from './DropdownMenu';
import '../../styles/header/animacionlinks.css';
import FormTestClass from '../Forms/FormTestClass';
import FormPostulante from '../Forms/FormPostulante';

const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [active, setActive] = useState('');
  const [modalClaseFree, setModalClaseFree] = useState(false);
  const [modalTrabajarConUstedes, setModalTrabajarConUstedes] = useState(false);

  const location = useLocation(); // Obtener la ubicación actual

  // Métodos para abrir y cerrar modal de clase gratis
  const abrirModal = () => {
    setModalClaseFree(true);
  };
  const cerarModal = () => {
    setModalClaseFree(false);
  };

  // Métodos para abrir y cerrar modal de trabajar con ustedes
  const activarModalTrabajar = () => {
    setModalTrabajarConUstedes(true);
  };
  const desactivarModalTrabajar = () => {
    setModalTrabajarConUstedes(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  // Verificar si la ruta actual es "/clientes"
  const isClientesPage = location.pathname === '/clientes';

  return (
    <nav className="justify-center w-full dark:bg-gradient-to-r from-gray-600 to-gray-900 fixed z-50">
      <div className="h-12 flex w-full bg-white justify-center items-center py-8 px-10 z-10 dark:bg-transparent ">
        <div className="hidden items-center font-tilt-neon text-black gap-10 lg:flex space-x-4 dark:text-white">
          <Link
            to="/"
            className="link"
            onClick={() => {
              setActive('');
              window.scrollTo(0, 0);
            }}
          >
            Home
          </Link>

          <Link
            to="/nueva_sede_hammerx"
            className="link"
            onClick={() => {
              setActive('');
              window.scrollTo(0, 0);
            }}
          >
            Nueva sede Bº Sur
          </Link>

          <Link to="/nosotros/quienessomos" className="link">
            ¿Quiénes somos?
          </Link>

          {/* Dropdown de "Contacto" */}
          <DropdownMenu />

          <Link to="#" className="">
            <button
              onClick={abrirModal}
              className="bg-[#fc4b08] hover:bg-orange-500 text-white py-2 px-4 rounded transition-colors duration-100 z-10"
            >
              ¡Probar una clase!
            </button>
          </Link>

          <img
            onClick={toggleDarkMode}
            className="h-7 mt-2 cursor-pointer dark:invert hidden xl:flex"
            src={theme}
            alt="Theme"
          />
        </div>

        <div className="lg:hidden">
          <button
            id="menu-toggle"
            className="relative"
            onClick={toggleMobileMenu}
          >
            <Menu /> {/* menú para dispositivos móviles */}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="h-auto absolute bg-[#fffc] text-black backdrop-filter backdrop-blur-lg pb-5 w-full z-15 lg:hidden px-8 z-50 dark:text-white dark:bg-[#90939ed7] dark:backdrop-filter dark:backdrop-blur-lg">
          <Link
            to="/"
            className="block py-2 px-4"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            Home
          </Link>

          <Link
            to="/nueva_sede_hammerx"
            className="block py-2 px-4"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            Nueva sede Bº Sur
          </Link>
          <Link
            to="/nosotros/quienessomos"
            className="block py-2 px-4"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            ¿Quiénes somos?
          </Link>
          <Link
            to="/contacto"
            className="block py-2 px-4 "
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          >
            Contacto
          </Link>
          <Link
            to="#form"
            className="block py-2 px-4"
            onClick={activarModalTrabajar}
          >
            Quiero trabajar con ustedes
          </Link>
          <Link onClick={abrirModal} to="#form" className="block py-2 px-4 ">
            Prueba una clase gratis
          </Link>
          <div className="ml-4 flex items-center gap-2 py-2">
            <h1> Dark Mode</h1>
            <img
              onClick={toggleDarkMode}
              className="h-7 cursor-pointer dark:invert"
              src={theme}
              alt="Theme"
            />
          </div>
        </div>
      )}

      {/* Mostrar el texto solo si estamos en la página "/clientes" */}
      {isClientesPage && (
        <p className="text-center text-[0.6rem] lg:text-[0.8rem] text-gray-500 py-2 italic tracking-wide">
          Página web desarrollada por{' '}
          <a
            href="https://www.instagram.com/softfusiontechnologies/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-orange-600 hover:text-orange-500 transition duration-300 animate-float"
          >
            SoftFusion
          </a>
        </p>
      )}

      {/* Modal para abrir formulario de clase gratis */}
      <FormTestClass isOpen={modalClaseFree} onClose={cerarModal} />
      {/* Modal para abrir formulario de quiero trabajar con ustedes */}
      <FormPostulante
        isOpen={modalTrabajarConUstedes}
        onClose={desactivarModalTrabajar}
      />
    </nav>
  );
};

export default Navbar;
