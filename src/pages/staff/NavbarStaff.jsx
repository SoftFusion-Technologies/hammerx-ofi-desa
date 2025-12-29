import React, { useState, useEffect } from 'react';
import { logohammer, menu, close } from '../../images';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import NotificationBell from './NotificationBell';
import { motion, AnimatePresence } from 'framer-motion';

const NavbarStaff = () => {
  const [active, setActive] = useState('');
  const [toggle, setToggle] = useState(false);

  const navigate = useNavigate();
  const { logout, userName, userLevel } = useAuth();

  const [displayUserName, setDisplayUserName] = useState('');

  useEffect(() => {
    if (userName && userName.includes('@')) {
      const atIndex = userName.indexOf('@');
      const usernameWithoutDomain = userName.substring(0, atIndex);
      setDisplayUserName(usernameWithoutDomain);
    } else {
      setDisplayUserName(userName || '');
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
      roles: ['gerente', 'admin', 'vendedor', 'administrador']
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
      roles: ['gerente', 'admin', 'vendedor', 'administrador', 'instructor']
    }
  ];

  const filteredLinks = Links.filter((link) => link.roles.includes(userLevel));

  return (
    <>
      {/* NAVBAR DESKTOP + TOP BAR MOBILE */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-zinc-950/90 via-zinc-900/90 to-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Izquierda: Logo + título */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-2xl bg-orange-500/40 blur-md opacity-0 group-hover:opacity-100 transition" />
                <div className="relative rounded-2xl bg-black/60 border border-white/10 p-1.5">
                  <img
                    src={logohammer}
                    alt="Hammer logo"
                    className="w-[46px] h-[46px] object-contain rounded-xl"
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-[10px] tracking-[0.24em] uppercase text-zinc-400">
                  Staff Panel
                </span>
                <span className="text-sm sm:text-2xl font-bignoodle font-semibold text-white">
                  HammerX
                </span>
              </div>
            </Link>

            {/* Centro: Links (desktop) */}
            <div className="hidden lg:flex items-center justify-center flex-1 mx-6">
              <div className="relative inline-flex items-center rounded-full bg-zinc-900/80 border border-white/10 px-2 py-1 shadow-lg shadow-black/40">
                {filteredLinks.map((link) => {
                  const isActive = active === link.title;
                  return (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => {
                        setActive(link.title);
                        navigate(`/${link.href}`);
                      }}
                      className="relative px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 shadow-[0_0_18px_rgba(249,115,22,0.7)]"
                          transition={{
                            type: 'spring',
                            stiffness: 350,
                            damping: 30
                          }}
                        />
                      )}
                      <span className="relative z-10">{link.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Derecha: usuario + notificaciones (desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <NotificationBell />

              <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 shadow-lg shadow-black/40">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-amber-300 flex items-center justify-center text-xs font-semibold text-zinc-950 uppercase">
                  {displayUserName?.[0] || 'U'}
                </div>
                <div className="flex flex-col min-w-[120px] max-w-[180px]">
                  <span className="text-[10px] uppercase tracking-wide text-zinc-400">
                    Sesión activa
                  </span>
                  <span className="text-sm font-semibold text-white truncate">
                    {displayUserName || 'Softfusion - Usuario'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full border border-orange-500/70 text-orange-200 hover:bg-orange-500 hover:text-zinc-950 hover:border-orange-400 transition-all"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>

            {/* Derecha: móvil (notificación + hamburguesa) */}
            <div className="flex items-center gap-3 lg:hidden">
              <NotificationBell />
              <button
                type="button"
                onClick={() => setToggle((prev) => !prev)}
                className="p-2 rounded-full bg-zinc-900/80 border border-white/10 focus:outline-none focus:ring-2 focus:ring-orange-500/60"
              >
                <img
                  src={toggle ? close : menu}
                  alt="Menú"
                  className="w-6 h-6 object-contain"
                />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* OVERLAY + DRAWER MOBILE (fuera del nav para que no se “rompa”) */}
      <AnimatePresence>
        {toggle && (
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              key="mobile-menu-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="ml-auto h-full w-[80%] max-w-xs bg-zinc-950/95 border-l border-white/10 flex flex-col"
            >
              {/* Header móvil */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10">
                    <img
                      src={logohammer}
                      alt="Hammer logo"
                      className="w-7 h-7 object-contain rounded-xl"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] text-zinc-400">Hola,</span>
                    <span className="text-sm font-semibold text-white truncate max-w-[130px]">
                      {displayUserName || 'Usuario'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setToggle(false)}
                  className="p-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Links móviles */}
              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {filteredLinks.map((link) => {
                  const isActive = active === link.title;
                  return (
                    <Link
                      key={link.id}
                      to={`/${link.href}`}
                      onClick={() => {
                        setActive(link.title);
                        setToggle(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-orange-500/90 to-amber-400/90 text-zinc-950 shadow-lg shadow-orange-500/40'
                          : 'text-zinc-200 bg-zinc-900/80 hover:bg-zinc-800/90'
                      }`}
                    >
                      <span>{link.title}</span>
                      <span className="text-[10px] uppercase tracking-wide text-zinc-300/80">
                        ir
                      </span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer móvil: Cerrar sesión */}
              <div className="px-4 py-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setToggle(false);
                    handleLogout();
                  }}
                  className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 text-zinc-950 shadow-lg shadow-orange-500/50 hover:brightness-110 transition-all"
                >
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavbarStaff;
