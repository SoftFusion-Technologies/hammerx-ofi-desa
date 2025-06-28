import React, { useState, useEffect } from 'react';
import { logohammer, menu, close } from '../../images';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarStaff = () => {
  const [active, setActive] = useState('');
  const [toggle, setToggle] = useState(false);
  const { logout, userName } = useAuth(); // utilizamos la funcion logout de authcontext
  const navigate = useNavigate(); // redirigimos a /login

  const { userLevel } = useAuth();

  const [displayUserName, setDisplayUserName] = useState('');

  useEffect(() => {
    if (userName && userName.includes('@')) {
      const atIndex = userName.indexOf('@');
      const usernameWithoutDomain = userName.substring(0, atIndex);
      setDisplayUserName(usernameWithoutDomain);
    } else {
      setDisplayUserName(userName);
    }
  }, [userName]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Links = [
    {
      id: 1,
      href: 'dashboard',
      title: 'Dashboard',
      roles: ['gerente', 'admin', 'vendedor', 'administrador'] // Benjamin Orellana INI / 12/06/2024 /nueva forma de gestionar los accesos
    },
    {
      id: 2,
      href: 'dashboard/users',
      title: 'Usuarios',
      roles: ['admin', 'administrador']
    },
    {
      id: 3,
      href: 'dashboard/ask',
      title: 'Preguntas Frecuentes',
      roles: ['vendedor', 'admin', 'administrador', 'gerente']
    },
    {
      id: 4,
      href: 'dashboard/task',
      title: 'Tareas Diarias',
      roles: ['admin', 'administrador']
    },
    {
      id: 5,
      href: 'dashboard/admagrupadores',
      title: 'Adm. Agrupadores',
      roles: ['admin']
    },
    {
      id: 6,
      href: 'dashboard/logs',
      title: 'Logs Detalle',
      roles: ['gerente', 'admin', 'vendedor', 'administrador', 'instructor'] // Benjamin Orellana INI / 12/06/2024 /nueva forma de gestionar los accesos
    }
  ];

  const filteredLinks = Links.filter((link) => link.roles.includes(userLevel));

  return (
    <>
      {/* Navbar section */}
      <nav className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-md transition duration-300 px-6 sm:px-16 py-4">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/">
              <img
                src={logohammer}
                alt="Hammer logo"
                className="w-[140px] sm:w-[180px] object-contain"
              />{' '}
            </Link>
          </div>
          <div>
            <ul className="list-none hidden lg:flex flex-row gap-10">
              {filteredLinks.map((link) => (
                <li
                  key={link.id}
                  className={`relative group transition-all duration-200 ${
                    active === link.title ? 'text-[#fc4b08]' : 'text-zinc-800'
                  } hover:text-orange-500 text-[16px] font-medium cursor-pointer`}
                  onClick={() => setActive(link.title)}
                >
                  <Link to={`/${link.href}`}>{link.title}</Link>
                  <span className="absolute left-0 bottom-0 h-[2px] w-0 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden lg:flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <NotificationBell />
            <h1 className="hidden xl:flex text-zinc-700 font-medium text-sm">
              ¡Hola, <span className="font-semibold">{displayUserName}</span>!
            </h1>
            <button
              onClick={handleLogout}
              className="bg-orange-500 hover:bg-orange-600 transition text-white px-4 py-2 rounded-full text-sm font-semibold shadow"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="lg:hidden ">
            <NotificationBell />
          </div>

          {/* Botón Hamburguesa */}
          <div className="lg:hidden flex justify-end items-center">
            <img
              src={toggle ? close : menu}
              alt="hamburger"
              className="w-[28px] h-[28px] object-contain cursor-pointer"
              onClick={() => setToggle(!toggle)}
            />

            <AnimatePresence>
              {toggle && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 bg-white rounded-lg shadow-md absolute top-20 right-4 z-30 w-64 flex flex-col gap-4"
                >
                  <h1 className="text-sm font-semibold text-zinc-700">
                    ¡Bienvenido {displayUserName}!
                  </h1>
                  <hr className="my-2" />
                  <ul className="list-none flex flex-col gap-3">
                    {filteredLinks.map((link) => (
                      <li
                        key={link.id}
                        className={`${
                          active === link.title
                            ? 'text-[#fc4b08]'
                            : 'text-black'
                        } hover:text-orange-500 text-[16px] cursor-pointer`}
                        onClick={() => {
                          setToggle(false);
                          setActive(link.title);
                        }}
                      >
                        <Link to={`/${link.href}`}>{link.title}</Link>
                      </li>
                    ))}
                  </ul>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition"
                  >
                    Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavbarStaff;
