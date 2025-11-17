import { Link, useLocation } from 'react-router-dom';
import { logohammer } from '../../images';
import '../../styles/footer/footer.css';
import Marcas_v2 from '../header/Marcas_v2';
import { useAuth } from '../../AuthContext';
import DashboardImagesManager from './DashboardImagesManager';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LinkIcon } from 'lucide-react'; 

const Footer = () => {
  const location = useLocation();
  const path = location.pathname;

  // Cualquier ruta de dashboard
  const isDashboard = path.startsWith('/dashboard');

  // SOLO el dashboard principal (home)
  const isDashboardRoot = path === '/dashboard' || path === '/dashboard/';

  const { userLevel } = useAuth();
  const API_BASE = 'http://localhost:8080/';

    // Helper para descargar instructivos (fetch -> blob -> descarga cliente)
  const descargarArchivo = async (instructivoPath) => {
    if (!instructivoPath) return;
    try {
      const filePath = String(instructivoPath).replace(/^uploads\//, 'public/');
      const fullUrl = `${API_BASE}${filePath}`;
      const resp = await fetch(fullUrl);
      if (!resp.ok) throw new Error('Error de red');
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = (filePath.split('/').pop() || 'instructivo').replace(/\?.*$/, '');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (e) {
      console.error('Error descargando instructivo', e);
      alert('No se pudo descargar el instructivo');
    }
  };

  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Sólo traer imágenes si estoy en /dashboard (home)
  useEffect(() => {
    if (!isDashboardRoot) return;

    const fetchImages = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_BASE}dashboard-images`);
        setImagenes(Array.isArray(data) ? data : []);
      } catch {
        setImagenes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [isDashboardRoot, API_BASE]);

  return (
    <>
      {/* En cualquier ruta que NO sea dashboard, muestro Marcas */}
      {/* {!isDashboard && <Marcas_v2 />} */}

      {/* ====== BLOQUE IMÁGENES: SOLO EN /dashboard ====== */}
      {isDashboardRoot && (
        <div className="my-4">
          {/* Manager visible sólo para admin o rol 'imagenes' */}
          {(userLevel === "admin" || userLevel === "imagenes") && (
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

          {/* --- 2. GALERÍA MODIFICADA --- */}
          {!loading && imagenes.length > 0 && (
            <div className="flex flex-col items-center gap-6 my-4 px-4">
              {imagenes.map((elemento) => (
                <div
                  key={elemento.id}
                  className="w-full max-w-7xl bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-4"
                >
                  {/* --- Título (si existe) --- */}
                  {elemento.titulo && (
                    <h2 className="text-2xl font-bold text-center text-[#fc4b08] mb-4">
                      {elemento.titulo}
                    </h2>
                  )}

                  {/* --- Imagen Principal (Banner o Título de Grupo) --- */}
                  {elemento.url && (
                    <img
                      src={`${API_BASE}${String(elemento.url || "").replace(
                        /^uploads\//,
                        "public/"
                      )}`}
                      alt={elemento.titulo || "Imagen Principal"}
                      className="w-full h-auto object-contain rounded-md"
                      loading="lazy"
                    />
                  )}

                  {/* --- 3. SI ES GRUPO DE PROMO, RENDERIZAR TARJETITAS --- */}
                  {elemento.tipo === "GRUPO_PROMOCION" && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Mapear las tarjetitas hijas */}
                        {elemento.tarjetas?.map((tarjeta) => (
                          <div
                            key={tarjeta.id}
                            className="relative bg-gray-50 dark:bg-zinc-700 p-2 rounded-lg shadow-sm flex flex-col"
                          >
                            <img
                              src={`${API_BASE}${tarjeta.imagen_tarjeta_url.replace(
                                /^uploads\//,
                                "public/"
                              )}`}
                              alt="Tarjeta de promoción"
                              className="w-full rounded-md"
                            />

                            {/* Link al instructivo (si existe) */}
                            {tarjeta.instructivo_url ? (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-600">
                                <button
                                  type="button"
                                  onClick={() =>
                                    descargarArchivo(tarjeta.instructivo_url)
                                  }
                                  className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1.5"
                                >
                                  <LinkIcon size={14} />
                                  Ver Instructivo
                                </button>
                              </div>
                            ) : (
                              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-zinc-600">
                                {" "}
                                <span className="text-xs text-red-500 font-semibold">
                                  Sin Instructivo
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                  style={{ textDecoration: "none", color: "inherit" }}
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
