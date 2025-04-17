import React, { useState, useEffect } from 'react';
import { logohammer, menu, close } from '../../images';
import { Link } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

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
      title: 'Programar Tarea',
      roles: ['admin', 'administrador', 'vendedor', 'gerente']
    },
    {
      id: 5,
      href: 'dashboard/admagrupadores',
      title: 'Adm. Agrupadores',
      roles: ['admin']
    }
  ];

  const filteredLinks = Links.filter((link) => link.roles.includes(userLevel));

  return (
    <>
      {/* Navbar section */}
      <nav className="w-full flex items-center py-5 z-20 bg-white xl:px-0 sm:px-16 px-6">
        <div className="w-full max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link to="/">
              <img src={logohammer} alt="hammer loco" width={200} />
            </Link>
          </div>
          <div>
            <ul className="list-none hidden lg:flex flex-row gap-10">
              {filteredLinks.map((link) => (
                <li
                  key={link.id}
                  className={`${
                    active === link.title ? 'text-[#fc4b08]' : 'text-black'
                  } hover:text-orange-500 text-[16px] cursor-pointer `}
                  onClick={() => setActive(link.title)}
                >
                  <Link to={`/${link.href}`}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:flex flex-col xl:flex-row xl:items-center justify-between">
            <h1 className="hidden xl:flex">Bienvenido {displayUserName}!</h1>
            <button
              onClick={handleLogout}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg mt-4 ml-4 xl:mt-0"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Mobile Navbar */}
          <div className="lg:hidden flex justify-end items-center">
            <img
              src={toggle ? close : menu}
              alt="hamburger"
              className="w-[28px] h-[28px] object-contain cursor-pointer "
              onClick={() => setToggle(!toggle)}
            />
            <div
              className={`${
                !toggle ? 'hidden' : 'flex'
              }  p-6 bg-white absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-lg flex flex-col`}
            >
              <h1 className="select-none"> ¡Bienvenido {displayUserName}! </h1>
              <hr className="my-4" />
              <ul className="list-none flex justify-end items-start flex-col gap-4">
                {filteredLinks.map((link) => (
                  <li
                    key={link.id}
                    className={`${
                      active === link.title ? 'text-[#fc4b08]' : 'text-black'
                    } hover:text-orange-500 text-[16px] cursor-pointer `}
                    onClick={() => {
                      setToggle(!toggle);
                      setActive(link.title);
                    }}
                  >
                    <a href={`/${link.href}`}>{link.title}</a>
                  </li>
                ))}
              </ul>
              <hr className="my-4" />
              <button
                onClick={handleLogout}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavbarStaff;
