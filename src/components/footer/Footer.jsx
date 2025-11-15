import { Link, useLocation } from 'react-router-dom';
import { logohammer } from '../../images';
import '../../styles/footer/footer.css';
import Marcas_v2 from '../header/Marcas_v2';
import { useAuth } from '../../AuthContext';
import DashboardImagesManager from './DashboardImagesManager';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Footer = () => {
  const location = useLocation();
  const path = location.pathname;

  // Cualquier ruta de dashboard
  const isDashboard = path.startsWith('/dashboard');

  // SOLO el dashboard principal (home)
  const isDashboardRoot = path === '/dashboard' || path === '/dashboard/';

  const { userLevel } = useAuth();
  const URL = 'http://localhost:8080/';

  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sólo traer imágenes si estoy en /dashboard (home)
  useEffect(() => {
    if (!isDashboardRoot) return;

    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${URL}dashboard-images`);
        setImagenes(Array.isArray(data) ? data : []);
      } catch {
        setImagenes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [isDashboardRoot, URL]);

  return (
    <>
      {/* En cualquier ruta que NO sea dashboard, muestro Marcas */}
      {/* {!isDashboard && <Marcas_v2 />} */}

      {/* ====== BLOQUE IMÁGENES: SOLO EN /dashboard ====== */}
      {isDashboardRoot && (
        <div className="my-4">
          {/* Manager visible sólo para admin o rol 'imagenes' */}
          {(userLevel === 'admin' || userLevel === 'imagenes') && (
            <div className="mb-4">
              <DashboardImagesManager />
            </div>
          )}

          {loading && (
            <div className="flex justify-center py-8">
              <span className="animate-spin h-7 w-7 border-2 border-orange-500 border-t-transparent rounded-full" />
            </div>
          )}

          {!loading && imagenes.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No hay imágenes cargadas aún.
            </div>
          )}

          {!loading && imagenes.length > 0 && (
            <div className="flex flex-col items-center gap-4 my-4">
              {imagenes.map((img) => (
                <img
                  key={img.id}
                  src={`${URL}${String(img.url || '').replace(
                    /^uploads\//,
                    'public/'
                  )}`}
                  alt={img.titulo || 'Imagen Dashboard'}
                  style={{ display: 'block', margin: '0 auto' }}
                  loading="lazy"
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== FOOTER GLOBAL ====== */}
      <footer className="bg-gray-200 shadow dark:bg-gray-900">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <a
              href="/"
              className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
            >
              <img src={logohammer} className="h-8" alt="Hammer Logo" />
            </a>

            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
              <p className="hover:underline me-4 md:me-6 max-sm:select-none md:ml-40">
                Página web desarrollada por
                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-500"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  &nbsp;SOFT FUSION
                </a>
              </p>
            </ul>

            <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
              <li>
                <Link to="/pautas">
                  <p className="hover:underline me-4 md:me-6 max-sm:select-none">
                    Pautas de Convivencia Hammer
                  </p>
                </Link>
              </li>
              <li>
                <Link to="/legales">
                  <p className="hover:underline me-4 md:me-6 max-sm:select-none">
                    Legales
                  </p>
                </Link>
              </li>
              <li>
                <Link to="/contacto">
                  <p className="hover:underline max-sm:select-none">Contacto</p>
                </Link>
              </li>
            </ul>
          </div>

          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />

          <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400 max-sm:select-none">
            <a href="#" className="hover:underline max-sm:select-none">
              HAMMERX © Copyright 2026 | Todos los derechos reservados.
            </a>
          </span>
        </div>
      </footer>
    </>
  );
};

export default Footer;
