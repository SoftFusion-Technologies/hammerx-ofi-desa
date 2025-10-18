import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowSize } from './js/useWindowSize.js';
import PerfilForm from './PerfilForm'; // externo
import firstNameOf from './js/firstName.js';
import ReviewStep from './ReviewStep';
import SuccessModal from './SuccessModal'; // modal centralizada
import IntroModal from './IntroModal.jsx';
import HammerXChatIntake from './HammerXChatIntake';

/**
 * SoftFusionIntro – versión LIGHT (blanco + naranja)
 */
export default function SoftFusionIntro({ onReady, logoSrc }) {
  const [showIntro, setShowIntro] = useState(true);
  const [saved, setSaved] = useState(false);
  const { w, h } = useWindowSize();

  // steps: 0 = Nombre, 1 = Perfil, 2 = Review, 3 = Chat
  const [step, setStep] = useState(0);

  // Paso 1: nombre
  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [savedNombre, setSavedNombre] = useState(false);
  const [firstName, setFirstName] = useState('');

  // Paso 2: perfil
  const [perfil, setPerfil] = useState({ edad: '', sexo: '', altura: '' });
  const [savedPerfil, setSavedPerfil] = useState(false);

  // Modal de éxito (centralizada)
  const [openModal, setOpenModal] = useState(false);

  // si recarga, recuperar de localStorage
  // al montar, levantar de localStorage (nombre y dni)
  useEffect(() => {
    const storedName = localStorage.getItem('sf_nombre');
    const storedDni = localStorage.getItem('sf_dni');
    if (storedName && !nombre) {
      setNombre(storedName);
      setFirstName(firstNameOf(storedName));
    }
    if (storedDni && !dni) setDni(storedDni);
  }, []);

  const handleSubmitNombre = (e) => {
    e.preventDefault();
    const nom = (nombre || '').trim();
    const ndni = (dni || '').replace(/\D/g, ''); // mantener solo números
    if (!nom || !ndni) return;

    setSavedNombre(true);
    localStorage.setItem('sf_nombre', nom);
    localStorage.setItem('sf_dni', ndni);
    setFirstName(firstNameOf(nom));
    onReady?.(nom);

    setTimeout(() => setStep(1), 550);
  };

  const handleSubmitPerfil = (e) => {
    e.preventDefault();
    if (!perfil.edad || !perfil.sexo || !perfil.altura) return;

    setSavedPerfil(true);
    localStorage.setItem('sf_perfil', JSON.stringify(perfil));
    setTimeout(() => setStep(2), 400);
  };

  // Review: abrir modal al confirmar
  const handleConfirmReview = () => {
    setOpenModal(true);
  };

  // Cargar nombre si existe
  useEffect(() => {
    const prev = localStorage.getItem('sf_nombre');
    if (prev) {
      setNombre(prev);
    }
  }, [onReady]);

  // Temporizador de la intro (4.5s)
  useEffect(() => {
    const t = setTimeout(() => setShowIntro(false), 4500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-orange-600 text-zinc-900">
      {/* Capa Canvas (versión clara) */}
      <LightParticlesBackgroundCanvas key={`${w}x${h}`} />

      {/* Halo/Glow cálido (sin oscurecer) */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(50%_50%_at_50%_50%,transparent,black)]">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              'conic-gradient(from 180deg at 50% 50%, rgba(251,146,60,.22), rgba(244,114,182,.18), rgba(251,191,36,.22), rgba(251,146,60,.22))'
          }}
        />
      </div>

      {/* Contenido centrado */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <IntroModal open={showIntro} onClose={() => setShowIntro(false)} />
        {!showIntro && (
          <AnimatePresence initial={true} mode="wait">
            {step === 0 && (
              <NombreForm
                key="step-0"
                nombre={nombre}
                setNombre={setNombre}
                dni={dni} /* NUEVO */
                setDni={setDni} /* NUEVO */
                onSubmit={handleSubmitNombre}
                saved={savedNombre}
              />
            )}

            {/* {step === 1 && (
              <PerfilForm
                key="step-1"
                firstName={firstName}
                perfil={perfil}
                setPerfil={setPerfil}
                onSubmit={handleSubmitPerfil}
                saved={savedPerfil}
              />
            )} */}

            {step === 1 && (
              <ReviewStep
                key="step-2"
                fullName={nombre}
                dni={dni} // 👈 PASAR DNI
                firstName={firstName}
                perfil={perfil}
                onConfirm={handleConfirmReview}
                onUpdateName={(v) => setNombre(v)}
                onUpdatePerfil={(partial) =>
                  setPerfil((p) => ({ ...p, ...partial }))
                }
              />
            )}

            {step === 2 && (
              <HammerXChatIntake
                key="step-3"
                firstName={firstName}
                nombre={nombre} // 👈
                dni={dni} // 👈
                onSubmit={(files) => {
                  console.log('Imagenes recibidas:', files);
                }}
              />
            )}
          </AnimatePresence>
        )}

        {/* Modal de éxito */}
        <SuccessModal
          open={openModal}
          name={firstName}
          onClose={() => {
            setOpenModal(false);
            setStep(2);
          }}
        />
      </div>
    </div>
  );
}

const easeOut = [0.16, 1, 0.3, 1];

const formDrop = {
  hidden: { opacity: 0, y: -80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: easeOut,
      when: 'beforeChildren',
      delayChildren: 0.35,
      staggerChildren: 0.18
    }
  },
  exit: { opacity: 0, y: 80, transition: { duration: 0.4, ease: easeOut } }
};

const itemUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

function NombreForm({ nombre, setNombre, dni, setDni, onSubmit, saved }) {
  const hasNombre = (nombre ?? '').trim().length > 0;
  const dniNum = (dni ?? '').replace(/\D/g, '');
  const hasDni = dniNum.length >= 7; // ajustá la mínima que quieras (7–8)

  const hasValue = (nombre ?? '').trim().length > 0;

  const subtitle = useMemo(() => {
    if (saved) return '¡Genial! Ya lo guardamos';
    if (!hasNombre && !hasDni) return 'Empecemos por definir tu nombre y DNI';
    if (hasNombre && !hasDni) return `Nombre: ${nombre} — ahora escribí tu DNI`;
    if (hasNombre && hasDni) return `Se verá así: ${nombre} • DNI ${dniNum}`;
    return 'Completá tus datos';
  }, [hasNombre, hasDni, nombre, dniNum, saved]);

  return (
    <motion.form
      onSubmit={onSubmit}
      variants={formDrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto w-full max-w-lg"
    >
      {/* Marco blanco con acento naranja */}
      <div className="relative rounded-3xl p-[1px]">
        <div className="rounded-3xl bg-orange ring-1 ring-zinc-200">
          <div className="rounded-3xl p-6 transition-shadow duration-300 hover:shadow-[0_0_35px_-10px_rgba(251,146,60,0.45)]">
            {/* Título */}
            <motion.h2
              variants={itemUp}
              className="uppercase text-center text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl"
            >
              Tu identidad primero
            </motion.h2>

            {/* Subtítulo interactivo */}
            <motion.p
              variants={itemUp}
              className="mt-2 text-center text-sm text-zinc-600"
            >
              {subtitle}
            </motion.p>

            <div className="mt-6 grid gap-4">
              {/* Label */}
              <motion.label variants={itemUp} className="text-sm text-zinc-700">
                Nombre completo
              </motion.label>

              {/* Input claro, foco naranja */}
              <motion.input
                variants={itemUp}
                autoFocus
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400
                           focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
              />

              {/* NUEVO: DNI */}
              <motion.label
                variants={itemUp}
                className="mt-4 text-sm text-zinc-700"
              >
                Documento (DNI)
              </motion.label>

              <motion.input
                variants={itemUp}
                inputMode="numeric"
                value={dni}
                onChange={(e) =>
                  setDni(
                    e.target.value
                      .replace(/\D/g, '') // solo dígitos
                      .slice(0, 9) // opcional: limitar longitud
                  )
                }
                placeholder="Ej: 30123456"
                className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400
             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
              />

              {/* Hint */}
              <motion.div
                variants={itemUp}
                initial={false}
                animate={{ opacity: hasValue ? 1 : 0, y: hasValue ? 0 : 6 }}
                className="text-xs text-orange-600/90"
              >
                Tip: presioná <span className="font-semibold">Enter</span> para
                guardar.
              </motion.div>

              {/* Botón naranja */}
              <motion.button
                variants={itemUp}
                type="submit"
                disabled={!(hasNombre && hasDni)}
                className={`group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 font-medium text-white transition-all
    ${
      hasNombre && hasDni
        ? 'bg-orange-600 hover:bg-orange-500 shadow-[0_8px_30px_-10px_rgba(251,146,60,0.55)] hover:shadow-[0_12px_45px_-10px_rgba(251,146,60,0.75)] focus:outline-none focus:ring-2 focus:ring-orange-500/60'
        : 'bg-orange-600/40 cursor-not-allowed opacity-60'
    }`}
              >
                Guardar
              </motion.button>

              {/* Saved */}
              {saved && (
                <motion.div
                  key="saved"
                  variants={itemUp}
                  initial="hidden"
                  animate="show"
                  className="text-center text-sm text-orange-600"
                >
                  ¡Listo! Guardamos tu nombre en el dispositivo.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}

/**
 * Canvas de partículas LIGHT (blanco + naranja)
 */
function LightParticlesBackgroundCanvas() {
  const canvasRef = useRef(null);
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  const cfg = useMemo(
    () => ({
      count: 110,
      maxSpeed: 0.42,
      linkDist: 120,
      hueBase: 0 // naranja
    }),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let w = 0,
      h = 0,
      raf;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const onResize = () => resize();
    resize();
    window.addEventListener('resize', onResize);

    // Partículas
    const P = [];
    for (let i = 0; i < cfg.count; i++) {
      P.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * cfg.maxSpeed,
        vy: (Math.random() - 0.5) * cfg.maxSpeed,
        r: Math.random() * 1.1 + 0.35
      });
    }

    const loop = () => {
      raf = requestAnimationFrame(loop);

      // Fondo BLANCO plano (sin lechoso)
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Glow radial sutil cálido (muy tenue para no “apagar”)
      const grd = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        0,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.7
      );
      grd.addColorStop(0, 'rgba(255, 180, 120, 0.06)');
      grd.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);

      // Update
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }

      // Líneas (naranja translúcido)
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const dx = P[i].x - P[j].x;
          const dy = P[i].y - P[j].y;
          const d = Math.hypot(dx, dy);
          if (d < cfg.linkDist) {
            const a = 1 - d / cfg.linkDist;
            ctx.strokeStyle = `hsla(${
              cfg.hueBase + (dx + dy) * 0.02
            }, 90%, 50%, ${a * 0.18})`;
            ctx.lineWidth = a * 1.1;
            ctx.beginPath();
            ctx.moveTo(P[i].x, P[i].y);
            ctx.lineTo(P[j].x, P[j].y);
            ctx.stroke();
          }
        }
      }

      // Puntos (naranja vivo pero pequeño)
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        ctx.fillStyle = `hsla(${
          cfg.hueBase + (p.x + p.y) * 0.02
        }, 95%, 48%, 0.85)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [cfg, dpr]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
