/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 2.0
 *
 * Descripción:
 * Loading ultra moderno para sistema de gimnasio.
 * Incluye fondo animado, halo/glow, logo breathing,
 * texto por letras con fade/float, barra de progreso
 * y footer "Diseñado y creado por Soft" + redes.
 */

import React, { useMemo } from 'react';
import '../styles/Loading.css';
import { logoloading } from '../images';

function AnimatedLetters({ text, className = '' }) {
  const letters = useMemo(() => Array.from(text), [text]);

  return (
    <span className={`sf-letters ${className}`} aria-label={text}>
      {letters.map((ch, i) => (
        <span
          key={`${ch}-${i}`}
          className="sf-letter"
          style={{ '--i': i }}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </span>
      ))}
    </span>
  );
}

/**
 * @param {{ phase?: 'open'|'closing', compact?: boolean }} props
 */
const Loading = ({ phase = 'open', compact = false }) => {
  return (
    <div
      className={`sf-loading ${phase === 'closing' ? 'is-closing' : ''} ${
        compact ? 'is-compact' : ''
      }`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Capas de fondo “vivas” */}
      <div className="sf-bg" aria-hidden="true">
        <div className="sf-bg-grid" />
        <div className="sf-bg-blobs">
          <span className="blob b1" />
          <span className="blob b2" />
          <span className="blob b3" />
        </div>
        <div className="sf-bg-noise" />
        <div className="sf-bg-vignette" />
      </div>

      {/* Contenido */}
      <div className="sf-wrap">
        <div className="sf-brand">
          <div className="sf-logoWrap">
            <div className="sf-halo" aria-hidden="true" />
            <img className="sf-logo" src={logoloading} alt="Logo" />
          </div>

          <div className="sf-title font-bignoodle !hidden lg:!block">
            <AnimatedLetters text="HAMMERX GYM" className="sf-titleText" />
          </div>

          <div className="sf-subtitle font-messina !hidden lg:!block">
            <AnimatedLetters text="Preparando tu experiencia..." />
          </div>
          <div className="sf-mobile font-messina !block lg:!hidden">
            <AnimatedLetters text="Sistema diseñado y creado por SoftFusion" />
          </div>

          {/* Loader principal */}
          <div className="sf-loader !hidden lg:!block" aria-hidden="true">
            <span className="sf-orbit o1" />
            <span className="sf-orbit o2" />
            <span className="sf-orbit o3" />
            <div className="sf-core" />
          </div>

          {/* Barra de progreso “fake” (da sensación de avance) */}
          <div className="sf-progress" aria-hidden="true">
            <div className="sf-progressBar" />
          </div>

          <div className="sf-socials oculto-en-pc" aria-label="Redes Soft">
            {/* Reemplazá los textos por tus handles reales */}
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#F56040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Instagram: <strong>@softfusion</strong></span>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp: <strong>+54 386 353-1891</strong></span>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Web: <strong>softfusion.ar</strong></span>
            </a>
          </div>

          {/* Mancuerna flotando (decorativo) */}
          <div className="sf-dumbbell" aria-hidden="true">
            <div className="sf-dumbbellInner">
              <span className="db-plate left" />
              <span className="db-bar" />
              <span className="db-plate right" />
            </div>
          </div>
        </div>

        {/* Footer Soft + redes */}
        <div className="sf-footer">
          <div className="sf-soft !hidden lg:!block">
            <AnimatedLetters text="Sistema diseñado y creado por Soft" />
          </div>

          <div className="sf-socials oculto-en-movil" aria-label="Redes Soft">
            {/* Reemplazá los textos por tus handles reales */}
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#F56040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>Instagram: <strong>@softfusion</strong></span>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>WhatsApp: <strong>+54 386 353-1891</strong></span>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              <svg className="sf-icon" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              <span>Web: <strong>softfusion.ar</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Accesibilidad: texto simple si reduce motion */}
      <div className="sf-srOnly">Cargando…</div>
    </div>
  );
};

export default Loading;