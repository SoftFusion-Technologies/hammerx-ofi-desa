import React, { useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";

const VideoModal = ({ isOpen, onClose, src, poster }) => {
  const videoRef = useRef(null);

  const closeModal = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      try { videoRef.current.currentTime = 0; } catch (e) {}
    }
    onClose && onClose();
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isOpen) {
      // Intentar reproducir (algunos navegadores bloquean autoplay con audio)
      const p = v.play();
      if (p && typeof p.then === "function") {
        p.catch(() => {
          // Forzamos mute y reintentamos para cumplir la política de autoplay
          v.muted = true;
          v.play().catch(() => {});
        });
      }
    } else {
      v.pause();
      try { v.currentTime = 0; } catch (e) {}
    }

    return () => {
      if (v) {
        v.pause();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose && onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12)_0%,rgba(0,0,0,0.86)_45%,rgba(0,0,0,0.95)_100%)] p-3 md:p-4"
      onClick={closeModal}
    >
      {/* Close button fixed to viewport so it's always visible */}
      <button
        aria-label="Cerrar video"
        onClick={closeModal}
        className="fixed top-3 right-3 md:top-5 md:right-5 z-[230] h-10 w-10 md:h-11 md:w-11 rounded-full border border-orange-300/45 bg-black/70 text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/85"
      >
        <FaTimes className="mx-auto text-base md:text-lg" />
      </button>

      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 via-orange-600 to-amber-500 shadow-[0_20px_70px_rgba(249,115,22,0.35)]">
          <div className="rounded-[14px] bg-black/90 p-1 md:p-1.5">
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            className="w-full h-auto max-h-[82vh] object-contain rounded-xl bg-black"
            controls
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={closeModal}
          />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
