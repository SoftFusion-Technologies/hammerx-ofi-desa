
import React, { useState } from 'react';
import { useInstructorAuth } from '../../AuthInstructorContext';
import { useNavigate } from 'react-router-dom';
import { menu, close } from '../../images';
import { motion, AnimatePresence } from 'framer-motion';


const NavbarInstructor = () => {
  const { instructorName, logoutInstructor } = useInstructorAuth();
  const navigate = useNavigate();
  const [toggle, setToggle] = useState(false);

  const handleLogout = () => {
    logoutInstructor();
    navigate('/pilates');
  };

  return (
    <nav className="w-full sticky top-0 z-50 bg-white shadow px-6 py-4 flex justify-between items-center">
      <div>
        <span className="font-bold text-orange-600 text-lg">Hammer Pilates</span>
      </div>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-gray-700 text-sm">
          {instructorName ? `¡Hola, ${instructorName}!` : 'Instructor'}
        </span>
        <button
          onClick={handleLogout}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition"
        >
          Cerrar Sesión
        </button>
      </div>
      {/* Mobile Hamburger */}
      <div className="md:hidden flex items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
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
                {instructorName ? `¡Hola, ${instructorName}!` : 'Instructor'}
              </h1>
              <hr className="my-2" />
              <button
                onClick={() => {
                  setToggle(false);
                  handleLogout();
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow transition"
              >
                Cerrar Sesión
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default NavbarInstructor;