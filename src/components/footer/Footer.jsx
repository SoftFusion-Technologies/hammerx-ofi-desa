import { Link, useLocation } from 'react-router-dom';
import { logohammer } from '../../images';
import '../../styles/footer/footer.css';
import Marcas_v2 from '../header/Marcas_v2';
import { useAuth } from '../../AuthContext';
import DashboardImagesManager from './DashboardImagesManager';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LinkIcon, Star } from 'lucide-react'; 

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
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 
                        {elemento.tarjetas?.map((tarjeta) => {
                          const esDestacado = tarjeta.destacado === 1 || tarjeta.destacado === true;
                          return (
                            <div
                              key={tarjeta.id}
                              className={`relative p-3 rounded-xl transition-all duration-500 flex flex-col group ${
                                esDestacado
                                  ? "bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-900/10 dark:to-zinc-800 border-2 border-amber-400 shadow-[0_8px_30px_rgb(251,191,36,0.15)] z-10 scale-[1.03]"
                                  : "bg-white dark:bg-zinc-800 shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md"
                              }`}
                            >
                              {/* Badge de DESTACADO Estilizado */}
                              {esDestacado && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-20 tracking-wider uppercase">
                                  <Star size={12} fill="currentColor" className="animate-pulse" />
                                  <span>Destacado</span>
                                </div>
                              )}

                              {/* Contenedor de Imagen con Efecto Zoom al pasar el mouse */}
                              <div className="overflow-hidden rounded-lg mb-3">
                                <img
                                  src={`${API_BASE}${tarjeta.imagen_tarjeta_url.replace(/^uploads\//, "public/")}`}
                                  alt="Tarjeta de promoción"
                                  className={`w-full h-auto object-cover transition-transform duration-500 ${esDestacado ? 'group-hover:scale-110' : 'group-hover:scale-105'}`}
                                />
                              </div>

                              {/* Sección de Instructivo */}
                              <div className="mt-auto pt-3 border-t border-gray-100 dark:border-zinc-700">
                                {tarjeta.instructivo_url ? (
                                  <button
                                    type="button"
                                    onClick={() => descargarArchivo(tarjeta.instructivo_url)}
                                    className={`w-full py-1.5 rounded-md text-xs font-bold transition-colors flex items-center justify-center gap-2 ${
                                      esDestacado 
                                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                                      : "text-blue-600 hover:bg-blue-50"
                                    }`}
                                  >
                                    <LinkIcon size={14} />
                                    VER INSTRUCTIVO
                                  </button>
                                ) : (
                                  <div className="flex items-center justify-center gap-1 py-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                                      Sin Instructivo
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====== FOOTER GLOBAL (LIGHT PREMIUM 2026) ====== */}
      <footer className="relative isolate  overflow-hidden">
        {/* Keyframes inline (sin config externa) */}
        <style>{`
    @keyframes ftrGlowLight {
      0% { transform: translate3d(0,0,0) scale(1); opacity: .55; }
      50% { transform: translate3d(16px,-10px,0) scale(1.06); opacity: .85; }
      100% { transform: translate3d(0,0,0) scale(1); opacity: .55; }
    }
  `}</style>

        {/* Base claro + gradiente */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-zinc-50" />

        {/* Accentos premium (claros) */}
        <div className="pointer-events-none absolute inset-0">
          {/* hairline superior */}
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-[#fc4b08]/55 via-zinc-200/70 to-transparent" />

          {/* blobs muy sutiles */}
          <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#fc4b08]/10 blur-3xl animate-[ftrGlowLight_14s_ease-in-out_infinite] motion-reduce:animate-none" />
          <div
            className="absolute -bottom-48 -right-48 h-[560px] w-[560px] rounded-full bg-amber-300/12 blur-3xl animate-[ftrGlowLight_16s_ease-in-out_infinite] motion-reduce:animate-none"
            style={{ animationDelay: '1.6s' }}
          />

          {/* micro-grid premium */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(24,24,27,0.18) 1px, transparent 0)',
              backgroundSize: '28px 28px'
            }}
          />

          {/* vignette suave */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0)_55%,rgba(0,0,0,0.03)_100%)]" />
        </div>

        <div className="relative mx-auto w-full max-w-screen-xl px-4 py-10 md:py-12">
          {/* Top */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            {/* Brand */}
            <div className="md:col-span-5">
              <a
                href="/"
                aria-label="Ir al inicio"
                className="group inline-flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-white hover:-translate-y-[1px] hover:shadow-[0_26px_90px_rgba(0,0,0,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/50"
              >
                <span className="relative">
                  <span className="absolute inset-0 rounded-xl bg-[#fc4b08]/18 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src={logohammer}
                    className="relative h-8"
                    alt="Hammer Logo"
                    loading="lazy"
                  />
                </span>
              </a>

              {/* “Built by” pill */}
              <div className="mt-4">
                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ir a Instagram de Soft Fusion (se abre en una nueva pestaña)"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_14px_40px_rgba(0,0,0,0.06)] transition-all duration-200 hover:bg-white hover:-translate-y-[1px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/50"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#fc4b08]" />
                  Desarrollado por{' '}
                  <span className="font-extrabold text-pink-600">
                    Soft Fusion
                  </span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-600">Instagram</span>
                </a>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-zinc-600 max-w-md">
                Experiencia premium orientada a rendimiento, claridad
                operacional y automatizaciones.
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-7">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                <nav aria-label="Secciones" className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Secciones
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/contacto"
                        className="inline-flex items-center gap-2 text-sm text-zinc-700 transition-all duration-200 hover:text-zinc-950 hover:translate-x-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/45 rounded-lg"
                      >
                        Contacto
                      </Link>
                    </li>
                  </ul>
                </nav>

                <nav aria-label="Políticas" className="space-y-3">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                    Políticas
                  </div>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        to="/pautas"
                        className="inline-flex items-center gap-2 text-sm text-zinc-700 transition-all duration-200 hover:text-zinc-950 hover:translate-x-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/45 rounded-lg"
                      >
                        Pautas de Convivencia
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/legales"
                        className="inline-flex items-center gap-2 text-sm text-zinc-700 transition-all duration-200 hover:text-zinc-950 hover:translate-x-[2px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/45 rounded-lg"
                      >
                        Legales
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="mt-10 pt-5 border-t  border-zinc-200/70 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-zinc-600 select-none">
              HAMMERX © Copyright 2030 · Todos los derechos reservados.
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;