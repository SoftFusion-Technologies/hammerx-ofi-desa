/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 2.0
 *
 * Descripción:
 *  Loading ultra moderno para sistema de gimnasio.
 *  Incluye fondo animado, halo/glow, logo breathing,
 *  texto por letras con fade/float, barra de progreso
 *  y footer "Diseñado y creado por Soft" + redes.
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

          <div className="sf-title font-bignoodle">
            <AnimatedLetters text="HAMMERX GYM" className="sf-titleText" />
          </div>

          <div className="sf-subtitle font-messina">
            <AnimatedLetters text="Preparando tu experiencia..." />
          </div>

          {/* Loader principal */}
          <div className="sf-loader" aria-hidden="true">
            <span className="sf-orbit o1" />
            <span className="sf-orbit o2" />
            <span className="sf-orbit o3" />
            <div className="sf-core" />
          </div>

          {/* Barra de progreso “fake” (da sensación de avance) */}
          <div className="sf-progress" aria-hidden="true">
            <div className="sf-progressBar" />
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
          <div className="sf-soft">
            <AnimatedLetters text="Sistema diseñado y creado por Soft" />
          </div>

          <div className="sf-socials" aria-label="Redes Soft">
            {/* Reemplazá los textos por tus handles reales */}
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Instagram: <strong>@softfusion</strong>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              WhatsApp: <strong>+54 386 353-1891</strong>
            </a>
            <span className="sf-dot" aria-hidden="true" />
            <a
              className="sf-social"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Web: <strong>softfusion.ar</strong>
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
