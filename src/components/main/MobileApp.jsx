/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Sección que contiene información sobre la aplicación móvil de hammer.
 *
 *  Tema: App Hammer
 *  Capa: Frontend
 */

import { mobileapp } from '../../images';

const ACCENT = '#fc4b08';

const StoreButton = ({
  href,
  title,
  subtitle,
  ariaLabel,
  children,
  className = '',
  aos,
  aosDuration
}) => {
  const isExternal = href?.startsWith('http');

  return (
    <a
      href={href}
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel || title}
      data-aos={aos}
      data-aos-duration={aosDuration}
      className={`group relative block ${className}`}
    >
      {/* Halo */}
      <div
        className="pointer-events-none absolute -inset-1 rounded-3xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 40%, rgba(252,75,8,0.22) 0%, rgba(252,75,8,0.00) 70%)'
        }}
      />

      <div
        className="
          relative flex items-center justify-between gap-4
          rounded-3xl border border-zinc-200/70 bg-white/85 px-4 py-4 sm:px-5
          shadow-[0_18px_60px_rgba(0,0,0,0.08)] ring-1 ring-zinc-900/5 backdrop-blur-xl
          transition-all duration-200
          hover:-translate-y-[2px] hover:shadow-[0_26px_90px_rgba(0,0,0,0.10)]
          focus:outline-none focus-visible:ring-2
        "
        style={{
          // focus ring color custom
          boxShadow:
            '0 18px 60px rgba(0,0,0,0.08), 0 0 0 1px rgba(24,24,27,0.06)'
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon tile */}
          <div className="relative h-12 w-12 shrink-0">
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: 'rgba(252,75,8,0.16)' }}
            />
            <div
              className="relative grid h-12 w-12 place-items-center rounded-2xl border"
              style={{
                borderColor: 'rgba(252,75,8,0.14)',
                background: 'rgba(252,75,8,0.08)'
              }}
            >
              {children}
            </div>
          </div>

          {/* Copy */}
          <div className="min-w-0">
            <div className="truncate text-[15px] sm:text-base font-extrabold tracking-tight text-zinc-900">
              {title}
            </div>
            <div className="mt-0.5 truncate text-xs text-zinc-500">
              {subtitle}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="shrink-0">
          <span
            className="
              inline-flex items-center gap-2 rounded-2xl
              border border-zinc-200/70 bg-white/70 px-3 py-2
              text-xs font-extrabold text-zinc-700 ring-1 ring-zinc-900/5
              transition-all duration-200
              group-hover:bg-[rgba(252,75,8,0.08)]
              group-hover:border-[rgba(252,75,8,0.22)]
              group-hover:text-[rgba(177,58,16,1)]
            "
          >
            Abrir
            <span className="transition-transform duration-200 group-hover:translate-x-[2px]">
              →
            </span>
          </span>
        </div>

        {/* subtle sheen */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -left-1/2 top-0 h-full w-[140%] translate-x-[-30%] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="h-full w-full bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.35),transparent)] [transform:skewX(-12deg)] animate-[appSheen_2.6s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    </a>
  );
};

const MobileApp = () => {
  return (
    <section
      className="
        relative isolate overflow-hidden
        bg-gradient-to-b from-white via-orange-50/40 to-zinc-100
        dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900
      "
    >
      {/* Keyframes inline (sin config externa) */}
      <style>{`
        @keyframes appGlow {
          0% { transform: translate3d(0,0,0) scale(1); opacity: .45; }
          50% { transform: translate3d(18px,-10px,0) scale(1.06); opacity: .75; }
          100% { transform: translate3d(0,0,0) scale(1); opacity: .45; }
        }
        @keyframes appFloat {
          0% { transform: translate3d(0,0,0); }
          50% { transform: translate3d(0,-8px,0); }
          100% { transform: translate3d(0,0,0); }
        }
        @keyframes appSheen {
          0% { transform: translateX(-20%) skewX(-12deg); opacity: 0; }
          25% { opacity: .9; }
          60% { opacity: .2; }
          100% { transform: translateX(35%) skewX(-12deg); opacity: 0; }
        }
      `}</style>

      {/* Premium background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl motion-reduce:animate-none"
          style={{
            backgroundColor: 'rgba(252,75,8,0.14)',
            animation: 'appGlow 16s ease-in-out infinite'
          }}
        />
        <div
          className="absolute -bottom-56 -right-56 h-[680px] w-[680px] rounded-full bg-amber-200/50 blur-3xl dark:bg-white/5 motion-reduce:animate-none"
          style={{
            animation: 'appGlow 18s ease-in-out infinite',
            animationDelay: '1.2s'
          }}
        />
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

      <div
        data-aos="fade-up"
        className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
      >
        <div className="grid items-center gap-10 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-7">
            {/* Badge */}
            <div
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
              App HAMMER
            </div>

            <h2 className="font-bignoodle mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Ya tenés disponible tu app
            </h2>

            <p className="font-messina mt-4 text-base sm:text-lg leading-relaxed text-zinc-600 dark:text-white/70 max-w-2xl">
              Desde la app vas a mantenerte al día con novedades,
              actualizaciones y comunicación directa. Todo más simple, rápido y
              ordenado.
            </p>

            {/* Highlights */}
            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { t: 'Novedades', d: 'Enterate primero.' },
                { t: 'Actualizaciones', d: 'Mejoras continuas.' },
                { t: 'Comunicación', d: 'Canal directo.' }
              ].map((x) => (
                <div
                  key={x.t}
                  className="
                    rounded-3xl border border-zinc-200/70 bg-white/85 p-4
                    ring-1 ring-zinc-900/5 backdrop-blur-xl
                    shadow-[0_18px_60px_rgba(0,0,0,0.06)]
                    dark:bg-white/5 dark:border-white/10 dark:ring-white/10
                    transition-all duration-200 hover:-translate-y-[1px]
                  "
                >
                  <div className="text-sm font-extrabold text-zinc-900 dark:text-white">
                    {x.t}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600 dark:text-white/65">
                    {x.d}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StoreButton
                href="https://play.google.com/store/apps/details?id=com.hammerx&hl=es_419&gl=US"
                title="Google Play"
                subtitle="Descargá la app en Android"
                ariaLabel="Abrir Google Play de HammerX (nueva pestaña)"
                aos="fade-right"
                aosDuration="1200"
              >
                {/* Google Play icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  className="h-6 w-6 text-[rgba(177,58,16,1)]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z" />
                </svg>
              </StoreButton>

              <StoreButton
                href="https://apps.apple.com/ar/app/hammer-x/id6470037033"
                title="App Store"
                subtitle="Descargá la app en iPhone"
                ariaLabel="Abrir App Store de HammerX (nueva pestaña)"
                aos="fade-right"
                aosDuration="1600"
              >
                {/* Apple icon */}
                <svg
                  viewBox="-52.01 0 560.035 560.035"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-[rgba(177,58,16,1)]"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655" />
                </svg>
              </StoreButton>
            </div>

            <p className="mt-4 text-xs text-zinc-500 dark:text-white/45">
              Al abrir un enlace externo, se abrirá en una nueva pestaña.
            </p>
          </div>

          {/* RIGHT */}
          <div data-aos="fade-left" className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Frame gradient border */}
              <div
                className="
                  rounded-[34px] p-[1px]
                  shadow-[0_50px_160px_rgba(0,0,0,0.18)]
                "
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.75), rgba(252,75,8,0.22), rgba(255,255,255,0.35))'
                }}
              >
                <div className="relative overflow-hidden rounded-[33px] border border-white/40 bg-white/70 backdrop-blur-2xl dark:bg-white/5 dark:border-white/10">
                  {/* Top highlight */}
                  <div className="absolute left-0 top-0 h-[3px] w-full bg-gradient-to-r from-[rgba(252,75,8,0.7)] via-amber-300/40 to-transparent" />

                  {/* Device glow */}
                  <div
                    className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl opacity-60"
                    style={{ backgroundColor: 'rgba(252,75,8,0.18)' }}
                  />

                  {/* Image */}
                  <div
                    className="relative px-6 py-8"
                    style={{
                      animation: 'appFloat 10s ease-in-out infinite'
                    }}
                  >
                    <img
                      src={mobileapp}
                      alt="Vista previa de la app móvil de Hammer"
                      className="mx-auto w-full max-w-[320px] select-none drop-shadow-[0_28px_90px_rgba(0,0,0,0.28)]"
                      loading="lazy"
                      draggable="false"
                    />

                    {/* Bottom label */}
                    <div className="mt-6 flex items-center justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5 dark:bg-white/5 dark:text-white/70 dark:border-white/10 dark:ring-white/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        Disponible en Android y iOS
                      </div>
                    </div>
                  </div>

                  {/* subtle bottom fade */}
                  <div className="pointer-events-none absolute bottom-0 left-0 h-10 w-full bg-gradient-to-t from-black/5 to-transparent dark:from-white/0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MobileApp;
