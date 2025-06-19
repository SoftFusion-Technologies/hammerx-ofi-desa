/*
 * Programador: Emir Segovia
 * Fecha Cración: 05 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (LoginForm.jsx) es el componente el cual realiza el logeo de los usuarios mendiante una validacion de la base de datos y un token de sesion.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: emirvalles90f@gmail.com || 3865761910
 */

import React, { useState } from 'react';
import Modal from 'react-modal';
import Alerta from '../Error';
import { useNavigate } from 'react-router-dom';
import Validation from './LoginValidation';
import axios from 'axios';
import '../../styles/login.css';
import { useAuth } from '../../AuthContext';

import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
Modal.setAppElement('#root');

const LoginForm = () => {
  const [values, setValues] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleInput = (event) => {
    setValues((prev) => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = Validation(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);

      axios
        .post('http://localhost:8080/login', values)
        .then((res) => {
          if (res.data.message === 'Success') {
            login(res.data.token, values.email, res.data.level, res.data.id);
            navigate('/dashboard');
          } else {
            setModalMessage('Usuario o Contraseña incorrectos');
            setIsModalOpen(true);
          }
        })
        .catch((err) => {
          setLoading(false);
          console.log(err);
        });
    }
  };

  return (
    <div className="h-screen w-full loginbg flex items-center justify-center bg-cover bg-center relative">
      {/* Botón Dark Mode opcional */}
      {/* <button className="absolute top-5 right-5 text-white">🌙</button> */}

      {/* Tarjeta animada */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        whileHover={{
          scale: 1.01,
          boxShadow: '0 8px 30px rgba(252,75,8,0.3)'
        }}
        className="bg-white shadow-2xl rounded-2xl p-8 w-[95%] max-w-md mx-auto"
      >
        <h1 className="text-5xl font-bignoodle font-bold text-center text-orange-600 mb-2">
          Bienvenido
        </h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-sm text-gray-500 mb-6"
        >
          Iniciá sesión para acceder al panel
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo Electrónico
            </label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              id="email"
              type="email"
              name="email"
              placeholder="ejemplo@correo.com"
              className="w-full mt-1 p-3 bg-orange-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
              onChange={handleInput}
            />
            {errors.email && <Alerta>{errors.email}</Alerta>}
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <div className="relative">
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className="w-full mt-1 p-3 bg-orange-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all pr-10"
                onChange={handleInput}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-orange-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && <Alerta>{errors.password}</Alerta>}
          </div>

          {/* Botón de envío */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-orange-500 text-white w-full py-3 rounded-lg font-semibold text-lg shadow-md hover:bg-[#fc4b08] transition-all"
            >
              Iniciar Sesión
            </motion.button>
          </div>
        </form>

        {/* Frase motivadora */}
        <p className="mt-6 text-center text-xs text-gray-400 italic">
          "La constancia supera al talento"
        </p>
      </motion.div>

      {/* Modal de error */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Error Modal"
        className="flex justify-center items-center h-screen"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Error</h2>
          <p>{modalMessage}</p>
          <button
            onClick={() => setIsModalOpen(false)}
            className="mt-4 bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginForm;
