import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  close,
  musc1,
  musc2,
  musc3,
  cardio1,
  cardio2,
  cardio3,
  grupales1,
  grupales2,
  grupales3,
  bajoImpacto1,
  bajoImpacto2,
  bajoImpacto3,
  kids1,
  kids2,
  kids3,
  guionesbla
} from '../../images/index';
import flecha from '../../images/flecha.png';

const ACCENT = '#fc4b08';

const Servicios = () => {
  const SERVICES = useMemo(
    () => [
      {
        id: 'musculacion',
        title: 'Musculación',
        subtitle: 'Fuerza, tono y progresión guiada',
        description:
          '¿Primera vez entrenando o ya contas con experiencia? No te preocupes, porque en nuestros salones de musculación vas a contar con una gran variedad y calidad de máquinas y pesos libres para entrenar la fuerza, aumentar la musculatura y tonificar el cuerpo. Siempre guiad@ por nuestros instructores y además dispondrás de diferentes rutinas pensadas para que arranques de 0 y para desafiarte todos los días.',
        images: [musc1, musc2, musc3],
        badge: 'Entrenamiento',
        aos: 'zoom-in-right'
      },
      {
        id: 'cardio',
        title: 'Cardio',
        subtitle: 'Energía, resistencia y quema calórica',
        description:
          '¿Pensas que hacer cardio es aburrido? Con nuestro plan de musculacion tambien tendrás a disposición todos nuestros equipos de cardio, cintas, bicis, elípticos, remos, airbikes, entre otros, para que elijas el más divertido y apto para vos, con los que podras quemar todas las calorías que te propongas, o bien para calentar un ratito antes de comenzar tu rutina. 💪🏻',
        images: [cardio1, cardio2, cardio3],
        badge: 'Resistencia',
        aos: 'zoom-in-right'
      },
      {
        id: 'clasesgrupales',
        title: 'Clases grupales',
        subtitle: 'Motivación y comunidad',
        description:
          '¿Y si probas entrenando en compañía con nuestras clases grupales? Crossfit, Funcional, Zumba, Aerobics y muchas otras actividades para que puedas elegir según tu gusto y tus objetivos, siempre vas a tener a tu disposición coachs que te van a orientar para que arranques desde el nivel más básico o para perfeccionarte si ya contas con experiencia previa. ¡Consulta las clases disponibles en tu sede! Si sentís que las actividades individuales no son para vos aquí encontraras tu lugar 😀.',
        images: [grupales1, grupales2, grupales3],
        badge: 'Clases',
        aos: 'zoom-in-up'
      },
      {
        id: 'bajoimpacto',
        title: 'Bajo impacto',
        subtitle: 'Movilidad, postura y bienestar',
        description:
          '¿Sabías que también contamos con clases de bajo impacto? Pilates, Yoga y talleres para 3era edad (consulta las disponibles en tu sede). Vas a trabajar sin impacto para fortalecer todo tu cuerpo, mejorar postura y recuperar la movilidad perdida. Son ideales para aumentar la fuerza y flexibilidad, rehabilitarte de lesiones, complementar y especializarte en otras actividades y para conectar la mente con tu cuerpo. 🧘',
        images: [bajoImpacto1, bajoImpacto2, bajoImpacto3],
        badge: 'Salud',
        aos: 'zoom-in-left'
      },
      {
        id: 'actividadeskids',
        title: 'Kids',
        subtitle: 'Movimiento y diversión',
        description:
          '¿Sabías lo importante que es la actividad física en los niños? Por eso contamos con diferentes actividades grupales para ellos. Todas están guiadas por profes y pensadas para divertirse, y para acompañar su desarrollo tanto físico como social, desde las etapas más tempranas.',
        images: [kids1, kids2, kids3],
        badge: 'Familia',
        aos: 'zoom-in-left'
      }
    ],
    []
  );

  const [activeId, setActiveId] = useState(null); // id del servicio abierto (modal)
  const [imgIdx, setImgIdx] = useState(0);
  const [closing, setClosing] = useState(false); // animación de salida del modal

  const closeBtnRef = useRef(null);
  const titleId = useId();
  const descId = useId();

  const activeIndex = useMemo(() => {
    if (!activeId) return -1;
    return SERVICES.findIndex((s) => s.id === activeId);
  }, [activeId, SERVICES]);

  const activeService = activeIndex >= 0 ? SERVICES[activeIndex] : null;

  const openService = (id) => {
    setClosing(false);
    setActiveId(id);
  };

  const requestClose = () => {
    if (!activeId) return;
    setClosing(true);
    window.setTimeout(() => {
      setActiveId(null);
      setClosing(false);
    }, 220);
  };

  const goPrevService = () => {
    if (activeIndex < 0) return;
    const nextIdx = (activeIndex - 1 + SERVICES.length) % SERVICES.length;
    setClosing(false);
    setActiveId(SERVICES[nextIdx].id);
  };

  const goNextService = () => {
    if (activeIndex < 0) return;
    const nextIdx = (activeIndex + 1) % SERVICES.length;
    setClosing(false);
    setActiveId(SERVICES[nextIdx].id);
  };

  const goPrevImg = () => {
    if (!activeService) return;
    const len = activeService.images.length;
    setImgIdx((p) => (p - 1 + len) % len);
  };

  const goNextImg = () => {
    if (!activeService) return;
    const len = activeService.images.length;
    setImgIdx((p) => (p + 1) % len);
  };

  // Reset imagen al cambiar de servicio
  useEffect(() => {
    if (activeId) setImgIdx(0);
  }, [activeId]);

  // Lock scroll cuando el modal está abierto
  useEffect(() => {
    if (!activeId) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [activeId]);

  // Focus en botón cerrar al abrir
  useEffect(() => {
    if (!activeId) return;
    const t = window.setTimeout(() => {
      closeBtnRef.current?.focus?.();
    }, 0);
    return () => window.clearTimeout(t);
  }, [activeId]);

  // Keyboard UX (Esc para cerrar, flechas para navegar)
  useEffect(() => {
    if (!activeId) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') requestClose();
      if (e.key === 'ArrowLeft') goPrevService();
      if (e.key === 'ArrowRight') goNextService();
      if (e.key === 'ArrowUp') goPrevImg();
      if (e.key === 'ArrowDown') goNextImg();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, activeIndex, activeService]);

  // UX: tilt/parallax sutil en cards (sin librerías)
  const onCardMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = x / rect.width - 0.5;
    const py = y / rect.height - 0.5;

    // rotación suave (no marear)
    const ry = px * 10; // -5..5 aprox
    const rx = -py * 8;

    el.style.setProperty('--svc-rx', `${rx}deg`);
    el.style.setProperty('--svc-ry', `${ry}deg`);

    // highlight “spotlight”
    el.style.setProperty('--svc-mx', `${x}px`);
    el.style.setProperty('--svc-my', `${y}px`);
  };

  const onCardLeave = (e) => {
    const el = e.currentTarget;
    el.style.setProperty('--svc-rx', `0deg`);
    el.style.setProperty('--svc-ry', `0deg`);
    el.style.setProperty('--svc-mx', `50%`);
    el.style.setProperty('--svc-my', `50%`);
  };

  return (
    <section
      id="activities"
      className="
        relative isolate overflow-hidden
        bg-gradient-to-b from-white via-orange-50/50 to-zinc-100
        dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900
        scroll-mt-[120px]
      "
    >
      {/* CSS embebido para “cards ultra modernas” + modal animado */}
      <style>{`
        .svc-card {
          transform: perspective(1100px) rotateX(var(--svc-rx, 0deg)) rotateY(var(--svc-ry, 0deg));
          transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease;
          will-change: transform;
        }

        .svc-card::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: 24px;
          background: conic-gradient(
            from var(--svc-spin, 0deg),
            rgba(252,75,8,0.75),
            rgba(24,24,27,0.10),
            rgba(252,75,8,0.75)
          );
          opacity: 0.55;
          pointer-events: none;

          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          animation: svcSpin 5.2s linear infinite;
        }

        .svc-card::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 24px;
          pointer-events: none;
          opacity: 0.0;
          transition: opacity 220ms ease;
          background:
            radial-gradient(
              220px 180px at var(--svc-mx, 50%) var(--svc-my, 50%),
              rgba(252,75,8,0.16),
              transparent 65%
            ),
            radial-gradient(
              260px 220px at 20% 15%,
              rgba(0,0,0,0.06),
              transparent 60%
            );
        }

        .svc-card:hover::after { opacity: 1; }

        .svc-sheen {
          position: absolute;
          inset: -40%;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.22), transparent 60%);
          transform: translateX(-30%) rotate(10deg);
          opacity: 0;
          transition: opacity 200ms ease;
          pointer-events: none;
        }
        .svc-card:hover .svc-sheen {
          opacity: 1;
          animation: svcSheen 1.25s ease-in-out infinite;
        }

        @keyframes svcSpin {
          0% { --svc-spin: 0deg; }
          100% { --svc-spin: 360deg; }
        }
        @keyframes svcSheen {
          0% { transform: translateX(-30%) rotate(10deg); }
          100% { transform: translateX(30%) rotate(10deg); }
        }

        .svc-modalShell[data-state="open"] .svc-modalPanel {
          animation: svcModalIn 260ms cubic-bezier(.2,.9,.2,1) both;
        }
        .svc-modalShell[data-state="closing"] .svc-modalPanel {
          animation: svcModalOut 220ms cubic-bezier(.2,.9,.2,1) both;
        }
        .svc-modalShell[data-state="open"] .svc-modalOverlay {
          animation: svcOverlayIn 220ms ease both;
        }
        .svc-modalShell[data-state="closing"] .svc-modalOverlay {
          animation: svcOverlayOut 200ms ease both;
        }

        @keyframes svcModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.988); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes svcModalOut {
          from { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          to   { opacity: 0; transform: translateY(8px) scale(.992); filter: blur(6px); }
        }
        @keyframes svcOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes svcOverlayOut { from { opacity: 1; } to { opacity: 0; } }

        @media (prefers-reduced-motion: reduce) {
          .svc-card, .svc-card::before, .svc-card::after, .svc-sheen { animation: none !important; transition: none !important; }
          .svc-modalShell * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
          style={{ backgroundColor: 'rgba(252,75,8,0.12)' }}
        />
        <div className="absolute -bottom-56 -right-56 h-[680px] w-[680px] rounded-full bg-orange-200 blur-3xl dark:bg-white/5" />
        <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-[rgba(252,75,8,0.45)] via-zinc-200 to-transparent dark:via-white/10" />
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(24,24,27,0.18) 1px, transparent 0)',
            backgroundSize: '28px 28px'
          }}
        />
      </div>

      {/* Decorative side stripes (opcionales) */}
      <img
        className="pointer-events-none w-8 h-80 absolute top-10 left-0 max-sm:hidden opacity-70"
        src={guionesbla}
        alt="Decoración"
      />
      <img
        className="pointer-events-none w-8 h-80 absolute bottom-10 right-0 max-sm:hidden opacity-70"
        src={guionesbla}
        alt="Decoración"
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        {/* Header */}
        <header className="text-center">
          <div
            data-aos="zoom-in-up"
            className="
              inline-flex items-center gap-2 rounded-full
              border border-zinc-200/70 bg-white/80 px-3 py-1.5
              text-xs font-extrabold uppercase tracking-wider text-zinc-700
              ring-1 ring-zinc-900/5 backdrop-blur-xl
              dark:bg-white/5 dark:border-white/10 dark:text-white/75 dark:ring-white/10
              shadow-[0_14px_45px_rgba(0,0,0,0.06)]
            "
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: ACCENT }}
            />
            Actividades
          </div>

          <h2
            data-aos="zoom-in-up"
            className="font-bignoodle mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white"
          >
            Tus actividades
          </h2>

          <p
            data-aos="zoom-in-up"
            className="font-messina mt-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-white/70 max-w-3xl mx-auto"
          >
            En HAMMERX contamos con clases individuales y grupales, de bajo y
            alto impacto, supervisadas por profesores capacitados para cuidarte.
            Elegí la más indicada según tu nivel y objetivos.
          </p>
        </header>

        {/* Grid cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <button
              key={s.id}
              type="button"
              data-aos={s.aos}
              onClick={() => openService(s.id)}
              onMouseMove={onCardMove}
              onMouseLeave={onCardLeave}
              className="
                svc-card group relative overflow-hidden rounded-3xl text-left
                border border-zinc-200/70 bg-white/80
                ring-1 ring-zinc-900/5 backdrop-blur-xl
                shadow-[0_18px_70px_rgba(0,0,0,0.08)]
                hover:-translate-y-[2px] hover:shadow-[0_28px_110px_rgba(0,0,0,0.12)]
                focus:outline-none focus-visible:ring-2
                dark:bg-white/5 dark:border-white/10 dark:ring-white/10
              "
              style={{ outlineColor: 'rgba(252,75,8,0.45)' }}
              aria-label={`Abrir detalles de ${s.title}`}
            >
              {/* shimmer */}
              <span className="svc-sheen" aria-hidden="true" />

              {/* Top image */}
              <div className="relative h-44 w-full overflow-hidden">
                <img
                  src={s.images[0]}
                  alt={s.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />

                {/* badge con dot “vivo” */}
                <div className="absolute left-4 top-4">
                  <span
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold
                               border border-white/25 bg-white/15 text-white backdrop-blur-xl"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: ACCENT,
                        boxShadow: '0 0 0 6px rgba(252,75,8,0.18)'
                      }}
                    />
                    {s.badge}
                  </span>
                </div>

                {/* title overlay */}
                <div className="absolute left-4 bottom-4 right-4">
                  <div className="text-lg font-extrabold text-white tracking-tight">
                    {s.title}
                  </div>
                  <div className="text-xs text-white/80 mt-1 line-clamp-1">
                    {s.subtitle}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-sm text-zinc-600 dark:text-white/70 line-clamp-3 leading-relaxed">
                  {s.description}
                </p>

                {/* mini preview “stack” (galería) */}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex -space-x-2">
                    {s.images.slice(0, 3).map((img, i) => (
                      <div
                        key={`${s.id}-stack-${i}`}
                        className="
                          h-9 w-9 rounded-xl overflow-hidden
                          border border-white/30 ring-1 ring-black/10
                          shadow-[0_10px_30px_rgba(0,0,0,0.10)]
                          dark:border-white/10 dark:ring-white/10
                        "
                        style={{
                          transform: `translateY(${i === 1 ? '-2px' : '0px'})`
                        }}
                        aria-hidden="true"
                      >
                        <img
                          src={img}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <span
                    className="
                      inline-flex items-center gap-2 rounded-2xl
                      border border-zinc-200/70 bg-white/70 px-3 py-2
                      text-xs font-extrabold text-zinc-800 ring-1 ring-zinc-900/5
                      transition-all duration-200
                      group-hover:bg-[rgba(252,75,8,0.10)]
                      group-hover:border-[rgba(252,75,8,0.24)]
                      dark:bg-white/5 dark:border-white/10 dark:text-white/80 dark:ring-white/10
                    "
                  >
                    Explorar
                    <span className="transition-transform duration-200 group-hover:translate-x-[2px]">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {activeService && (
        <div
          className="fixed inset-0 z-[999] svc-modalShell"
          data-state={closing ? 'closing' : 'open'}
        >
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm svc-modalOverlay"
            onClick={requestClose}
          />

          {/* dialog */}
          <div className="absolute inset-0 flex items-center justify-center px-4 py-6 sm:py-10">
            <div
              className="
                svc-modalPanel
                relative w-full max-w-5xl overflow-hidden
                rounded-[28px] border border-white/20 bg-white/92
                shadow-[0_40px_160px_rgba(0,0,0,0.35)]
                ring-1 ring-zinc-900/10 backdrop-blur-2xl
                dark:bg-zinc-950/80 dark:border-white/10 dark:ring-white/10
              "
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              aria-describedby={descId}
            >
              {/* top accent */}
              <div className="h-[3px] w-full bg-gradient-to-r from-[rgba(252,75,8,0.75)] via-amber-300/40 to-transparent" />

              {/* close */}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={requestClose}
                className="
                  absolute right-4 top-4 z-10
                  inline-flex items-center justify-center
                  h-10 w-10 rounded-2xl
                  border border-zinc-200/70 bg-white/75
                  ring-1 ring-zinc-900/5
                  transition hover:bg-white
                  focus:outline-none focus-visible:ring-2
                  dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                "
                style={{ outlineColor: 'rgba(252,75,8,0.45)' }}
                aria-label="Cerrar"
              >
                <img src={close} alt="Cerrar" className="h-4 w-4 opacity-80" />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                {/* left nav */}
                <button
                  type="button"
                  onClick={goPrevService}
                  className="
                    hidden lg:flex lg:col-span-1 items-center justify-center
                    border-r border-zinc-200/60 dark:border-white/10
                    hover:bg-black/[0.02] dark:hover:bg-white/[0.03]
                    transition
                  "
                  aria-label="Servicio anterior"
                >
                  <img
                    src={flecha}
                    alt="Anterior"
                    className="h-10 w-10 opacity-80"
                  />
                </button>

                {/* content */}
                <div className="lg:col-span-10 p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div
                        className="
                          inline-flex items-center gap-2 rounded-full
                          border border-zinc-200/70 bg-white/70
                          px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider
                          text-zinc-700 ring-1 ring-zinc-900/5
                          dark:bg-white/5 dark:border-white/10 dark:text-white/70 dark:ring-white/10
                        "
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: ACCENT }}
                        />
                        {activeService.badge}
                      </div>

                      <h3
                        id={titleId}
                        className="font-bignoodle mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-orange-600 dark:text-white"
                      >
                        {activeService.title}
                      </h3>

                      <p
                        id={descId}
                        className="text-white mt-2 text-sm sm:text-base font-messina  dark:text-white/70"
                      >
                        {activeService.subtitle}
                      </p>
                    </div>

                    {/* mobile arrows */}
                    <div className="flex lg:hidden items-center gap-2">
                      <button
                        type="button"
                        onClick={goPrevService}
                        className="
                          h-10 w-10 rounded-2xl border border-zinc-200/70 bg-white/75
                          ring-1 ring-zinc-900/5 transition hover:bg-white
                          dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                        "
                        aria-label="Anterior"
                      >
                        <img
                          src={flecha}
                          alt="Anterior"
                          className="h-6 w-6 mx-auto opacity-80"
                        />
                      </button>
                      <button
                        type="button"
                        onClick={goNextService}
                        className="
                          h-10 w-10 rounded-2xl border border-zinc-200/70 bg-white/75
                          ring-1 ring-zinc-900/5 transition hover:bg-white
                          dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                        "
                        aria-label="Siguiente"
                      >
                        <img
                          src={flecha}
                          alt="Siguiente"
                          className="h-6 w-6 mx-auto opacity-80 rotate-180"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* image + thumbs */}
                    <div className="lg:col-span-7">
                      <div
                        className="
                          relative overflow-hidden rounded-3xl
                          border border-zinc-200/70 bg-white/80
                          ring-1 ring-zinc-900/5 shadow-[0_20px_70px_rgba(0,0,0,0.10)]
                          dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                        "
                      >
                        <img
                          src={activeService.images[imgIdx]}
                          alt={`${activeService.title} - imagen ${imgIdx + 1}`}
                          className="w-full h-[280px] sm:h-[340px] object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />

                        {/* arrows dentro de la imagen (galería) */}
                        <div className="absolute inset-0 flex items-center justify-between px-3">
                          <button
                            type="button"
                            onClick={goPrevImg}
                            className="
                              h-10 w-10 rounded-2xl
                              border border-white/25 bg-black/25
                              backdrop-blur-xl text-white
                              ring-1 ring-black/10
                              transition hover:bg-black/35
                              focus:outline-none focus-visible:ring-2
                            "
                            style={{ outlineColor: 'rgba(252,75,8,0.45)' }}
                            aria-label="Imagen anterior"
                            title="Imagen anterior (↑/↓)"
                          >
                            <span className="block -rotate-90 text-xl leading-none">
                              ›
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={goNextImg}
                            className="
                              h-10 w-10 rounded-2xl
                              border border-white/25 bg-black/25
                              backdrop-blur-xl text-white
                              ring-1 ring-black/10
                              transition hover:bg-black/35
                              focus:outline-none focus-visible:ring-2
                            "
                            style={{ outlineColor: 'rgba(252,75,8,0.45)' }}
                            aria-label="Imagen siguiente"
                            title="Imagen siguiente (↑/↓)"
                          >
                            <span className="block rotate-90 text-xl leading-none">
                              ›
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-3">
                        {activeService.images.map((img, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`
                              relative overflow-hidden rounded-2xl
                              border ring-1 transition
                              ${
                                i === imgIdx
                                  ? 'border-[rgba(252,75,8,0.35)] ring-[rgba(252,75,8,0.22)]'
                                  : 'border-zinc-200/70 ring-zinc-900/5 dark:border-white/10 dark:ring-white/10'
                              }
                            `}
                            aria-label={`Ver imagen ${i + 1}`}
                          >
                            <img
                              src={img}
                              alt=""
                              className="h-16 w-24 object-cover"
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* text */}
                    <div className="lg:col-span-5">
                      <div
                        className="
                          rounded-3xl border border-zinc-200/70 bg-white/80
                          ring-1 ring-zinc-900/5 backdrop-blur-xl
                          shadow-[0_18px_70px_rgba(0,0,0,0.08)]
                          p-5 sm:p-6
                          dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                        "
                      >
                        <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 dark:text-white/50">
                          Detalle
                        </div>

                        <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-700 dark:text-white/70">
                          {activeService.description}
                        </p>

                        <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-white/10" />

                        <p className="mt-4 text-xs text-zinc-500 dark:text-white/45">
                          Tip: servicio anterior/siguiente con ← / →. Imagen
                          anterior/siguiente con ↑ / ↓. Cerrar con Esc.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* right nav */}
                <button
                  type="button"
                  onClick={goNextService}
                  className="
                    hidden lg:flex lg:col-span-1 items-center justify-center
                    border-l border-zinc-200/60 dark:border-white/10
                    hover:bg-black/[0.02] dark:hover:bg-white/[0.03]
                    transition
                  "
                  aria-label="Servicio siguiente"
                >
                  <img
                    src={flecha}
                    alt="Siguiente"
                    className="h-10 w-10 opacity-80 rotate-180"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Servicios;
