import React from 'react';
import { logohammer } from '../../images';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';

const ModalSuccess = ({ isVisible, onClose, textoModal }) => {
  if (!isVisible) return null;

  // Cerrar si clickean fuera de la tarjeta
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-100/40 px-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm">
        {/* Card principal */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_45px_rgba(148,163,184,0.35)]">
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:text-slate-800 hover:border-slate-300 hover:bg-slate-50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Cerrar"
          >
            ×
          </button>

          {/* Contenido */}
          <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
            {/* Badge de éxito + logo Hammer */}
            <div className="relative mb-4 flex flex-col items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-lg font-semibold shadow-lg">
                    ✓
                  </span>
                </div>
              </div>

              <img
                src={logohammer}
                alt="HammerX"
                className="h-8 object-contain mt-1"
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Operación exitosa
            </h3>

            <p className="text-xs text-slate-500 mb-4 px-2 font-messina">
              {textoModal ||
                'Los datos se han guardado correctamente en el sistema.'}
            </p>

            {/* Franja SoftFusion */}
            <div className="w-full border-t border-slate-200 pt-3 mt-1">
              <p className="text-[11px] text-slate-400 mb-2">
                Desarrollado por{' '}
                <span className="font-semibold text-slate-700">SoftFusion</span>
                . Experiencias digitales para tu negocio.
              </p>

              {/* Redes SoftFusion · ICONOS INFERIORES */}
              <div className="flex items-center justify-center gap-3">
                <a
                  href="https://www.instagram.com/softfusiontechnologies/"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-orange-50 hover:border-orange-200 hover:scale-105 transition"
                  title="Instagram SoftFusion"
                >
                  <span className="text-lg text-slate-600" aria-hidden="true">
                    <FaInstagram />
                  </span>
                </a>

                <a
                  href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=1LO5jCqT44zNgskQ&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMU"
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-orange-50 hover:border-orange-200 hover:scale-105 transition"
                  title="Facebook SoftFusion"
                >
                  <span className="text-lg text-slate-600" aria-hidden="true">
                    <FaFacebookF />
                  </span>
                </a>
              </div>
            </div>

            {/* Botón principal */}
            <button
              type="button"
              onClick={onClose}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-orange-400 px-5 py-2 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(249,115,22,0.35)] hover:shadow-[0_10px_22px_rgba(249,115,22,0.45)] hover:-translate-y-[1px] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalSuccess;
