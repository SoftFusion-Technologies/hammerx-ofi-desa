import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaVolumeUp, FaVolumeMute } from "react-icons/fa";

const VideoModal = ({ isOpen, onClose, src, poster }) => {
  const videoRef = useRef(null);

  const [muted, setMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const closeModal = () => {
    const v = videoRef.current;

    if (v) {
      v.pause();
      try {
        v.currentTime = 0;
      } catch (e) {}
    }

    setIsLoading(true);
    onClose && onClose();
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  // Solo abre/cierra y reproduce el video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (isOpen) {
      setIsLoading(true);

      const playVideo = async () => {
        try {
          await v.play();
        } catch (e) {
          // Algunos navegadores pueden bloquear autoplay con sonido
        }
      };

      playVideo();
    } else {
      v.pause();
      try {
        v.currentTime = 0;
      } catch (e) {}
      setIsLoading(true);
    }

    return () => {
      if (v) v.pause();
    };
  }, [isOpen, src]);

  // Solo sincroniza el mute, sin recargar el video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    v.muted = muted;
  }, [muted]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[220] flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.12)_0%,rgba(0,0,0,0.86)_45%,rgba(0,0,0,0.95)_100%)] p-3 md:p-4"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BOTON SONIDO */}
        <button
          onClick={toggleSound}
          className="absolute top-3 left-3 md:top-4 md:left-4 z-[230] px-4 py-2 rounded-full border border-orange-300/45 bg-black/70 text-white text-sm md:text-base shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/85 flex items-center gap-2"
        >
          {muted ? <FaVolumeUp /> : <FaVolumeMute />}
          {muted ? "Activar volumen" : "Silenciar"}
        </button>

        {/* BOTON CERRAR */}
        <button
          aria-label="Cerrar video"
          onClick={(e) => {
            e.stopPropagation();
            closeModal();
          }}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-[230] h-10 w-10 md:h-11 md:w-11 rounded-full border border-orange-300/45 bg-black/70 text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-black/85"
        >
          <FaTimes className="mx-auto text-base md:text-lg" />
        </button>

        {/* MARCO */}
        <div className="rounded-2xl p-[2px] bg-gradient-to-br from-orange-400 via-orange-600 to-amber-500 shadow-[0_20px_70px_rgba(249,115,22,0.35)]">
          <div className="relative rounded-[14px] bg-black/90 p-1 md:p-1.5 overflow-hidden">
            {/* LOADER */}
            {isLoading && (
              <div className="absolute inset-0 z-[225] flex items-center justify-center rounded-xl bg-black/70 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-2xl border border-orange-300/20 bg-black/55 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                  <div className="h-10 w-10 rounded-full border-4 border-orange-300/30 border-t-orange-400 animate-spin" />
                  <div className="text-center">
                    <p className="text-white text-sm md:text-base font-medium">
                      Cargando video...
                    </p>
                    <p className="text-orange-200/80 text-xs md:text-sm mt-1">
                      Esperá un momento
                    </p>
                  </div>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              src={src}
              poster={poster}
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl bg-black"
              controls
              autoPlay
              muted={muted}
              playsInline
              preload="metadata"
              onLoadedData={() => setIsLoading(false)}
              onCanPlay={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => setIsLoading(false)}
              onEnded={closeModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;