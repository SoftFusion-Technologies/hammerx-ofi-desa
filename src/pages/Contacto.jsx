/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de contacto hammer.
 *
 *  Tema: Contacto
 *  Capa: Frontend
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';

import whats from '../../src/images/redes/whatsapp.png';
import insta from '../../src/images/redes/instagram.png';
import facebook from '../../src/images/redes/facebook.png';

const Contacto = () => {
  useEffect(() => {
    document.title = 'Contacto';
  }, []);

  const ACCENT = '#fc4b08';

  const waHref = (numero) =>
    `https://api.whatsapp.com/send?phone=54${String(numero).replace(
      /\D/g,
      ''
    )}`;

  const sedes = [
    { nombre: 'Monteros', numero: '3863564651' },
    { nombre: 'Concepción', numero: '3865855100' },
    { nombre: 'Barrio Sur', numero: '3813988383' },
    { nombre: 'Barrio norte', numero: '3815584172' }
  ];

  const blocks = [
    {
      key: 'whatsapp',
      section: 'WhatsApp',
      subtitle: 'Elegí la sede y escribinos directo.',
      variant: 'WIDE',
      items: sedes.map((s) => ({
        title: s.nombre,
        href: waHref(s.numero),
        icon: whats,
        meta: `+54 ${s.numero}`
      }))
    },
    {
      key: 'instagram',
      section: 'Instagram',
      subtitle: 'Novedades, promociones y comunidad.',
      variant: 'CARD',
      items: [
        {
          title: 'HAMMER.OK',
          href: 'https://instagram.com/hammer.ok',
          icon: insta,
          meta: '@hammer.ok'
        }
      ]
    },
    {
      key: 'facebook',
      section: 'Facebook',
      subtitle: 'Información y anuncios.',
      variant: 'CARD',
      items: [
        {
          title: 'HAMMER.OK',
          href: 'https://facebook.com/hammer.okey',
          icon: facebook,
          meta: 'Página oficial'
        }
      ]
    },
    {
      key: 'mail',
      section: 'Mail',
      subtitle: 'Para temas administrativos o formales.',
      variant: 'CARD',
      items: [
        {
          title: 'Contacto@Hammer.ar',
          href: 'mailto:Contacto@Hammer.ar',
          icon: null,
          meta: 'Respuesta a la brevedad'
        }
      ]
    }
  ];

  const ContactItem = ({ href, title, icon, meta, compact = false }) => {
    const external = href.startsWith('http');

    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className="group relative w-full"
      >
        <div
          className={[
            'relative flex items-center justify-between gap-4',
            compact ? 'rounded-2xl px-4 py-3' : 'rounded-2xl px-5 py-4',
            'border border-zinc-200/70 bg-white/85',
            'shadow-[0_18px_60px_rgba(0,0,0,0.08)] ring-1 ring-zinc-900/5 backdrop-blur-xl',
            'transition-all duration-200',
            'hover:-translate-y-[1px] hover:shadow-[0_26px_90px_rgba(0,0,0,0.10)]',
            `focus:outline-none focus-visible:ring-2 focus-visible:ring-[${ACCENT}]/45`
          ].join(' ')}
        >
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            {icon ? (
              <div className="relative h-10 w-10 shrink-0">
                <div
                  className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${ACCENT}1A` }} // ~10%
                />
                <div
                  className="relative grid h-10 w-10 place-items-center rounded-2xl border"
                  style={{
                    borderColor: `${ACCENT}26`,
                    background: `${ACCENT}14`
                  }}
                >
                  <img src={icon} alt="" className="h-5 w-5 object-contain" />
                </div>
              </div>
            ) : (
              <div className="relative grid h-10 w-10 place-items-center rounded-2xl border border-zinc-200 bg-zinc-50">
                <span className="text-xs font-extrabold text-zinc-600">@</span>
              </div>
            )}

            {/* Text */}
            <div className="min-w-0">
              <div className="truncate text-[15px] sm:text-base font-extrabold tracking-tight text-zinc-900">
                {title}
              </div>
              {meta ? (
                <div className="mt-0.5 text-xs text-zinc-500 truncate">
                  {meta}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right action */}
          <div className="shrink-0">
            <div
              className={[
                'inline-flex items-center gap-2 rounded-xl',
                'border border-zinc-200/70 bg-white/70',
                'px-3 py-2 text-xs font-extrabold text-zinc-700',
                'ring-1 ring-zinc-900/5',
                'transition-all duration-200',
                'group-hover:-translate-y-[1px]'
              ].join(' ')}
              style={{
                borderColor: 'rgba(244,244,245,0.7)',
                ...(true
                  ? {
                      // en hover, el contenedor padre aplica, esto solo acompaña el look
                    }
                  : {})
              }}
            >
              Abrir
              <span className="transition-transform duration-200 group-hover:translate-x-[2px]">
                →
              </span>
            </div>
          </div>

          {/* hover ring accent (sutil) */}
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              boxShadow: `0 0 0 1px ${ACCENT}1F inset` // ~12%
            }}
          />
        </div>
      </a>
    );
  };

  const SectionCard = ({ title, subtitle, children, wide = false }) => (
    <div
      className={[
        'relative overflow-hidden',
        'rounded-3xl border border-zinc-200/70 bg-white/85 backdrop-blur-xl',
        'ring-1 ring-zinc-900/5 shadow-[0_26px_100px_rgba(0,0,0,0.10)]'
      ].join(' ')}
    >
      <div
        className="h-[3px] w-full bg-gradient-to-r"
        style={{
          backgroundImage: `linear-gradient(to right, ${ACCENT}CC, rgba(253,186,116,0.35), transparent)`
        }}
      />
      <div className={wide ? 'px-6 sm:px-8 py-6' : 'px-6 py-6'}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
          </div>
          <span className="hidden sm:inline-flex items-center rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
            Canal oficial
          </span>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-zinc-50 scroll-pt-[120px] sm:scroll-pt-[132px]">
        {/* Background premium claro */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full blur-3xl"
            style={{ background: `${ACCENT}14` }}
          />
          <div className="absolute -bottom-52 -right-52 h-[640px] w-[640px] rounded-full bg-amber-200/45 blur-3xl" />
          <div className="absolute left-0 top-0 h-[1px] w-full bg-gradient-to-r from-[#fc4b08]/45 via-zinc-200 to-transparent" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(24,24,27,0.16) 1px, transparent 0)',
              backgroundSize: '28px 28px'
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-[120px] sm:pt-[132px] pb-10 sm:pb-14">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="
                inline-flex items-center gap-2 rounded-2xl
                border border-zinc-200/70 bg-white/85 px-4 py-2.5
                text-sm font-extrabold text-zinc-800
                shadow-[0_14px_50px_rgba(0,0,0,0.06)]
                ring-1 ring-zinc-900/5 backdrop-blur-xl
                transition-all duration-200
                hover:-translate-y-[1px] hover:bg-white
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/45
              "
              aria-label="Volver al inicio"
            >
              <span className="text-lg leading-none">←</span>
              Volver
            </Link>

            <div className="hidden sm:flex items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
                Atención y soporte
              </span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-extrabold"
                style={{
                  border: `1px solid ${ACCENT}26`,
                  background: `${ACCENT}14`,
                  color: '#b13a10'
                }}
              >
                Respuesta rápida
              </span>
            </div>
          </div>

          {/* Hero */}
          <header className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-700 shadow-[0_14px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/5 backdrop-blur-xl">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: ACCENT }}
              />
              Contacto HAMMER
            </div>

            <h1 className="font-bignoodle mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Quiero conocerlos
            </h1>
          </header>

          {/* Layout: Sidebar + Content (desktop) */}
          <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="rounded-3xl border border-zinc-200/70 bg-white/85 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_22px_80px_rgba(0,0,0,0.08)] p-5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                  Sugerencia
                </div>

                <p className="mt-2 text-sm leading-relaxed text-zinc-700">
                  Para consultas por cupos, horarios y planes, usá WhatsApp
                  (respuesta más rápida).
                </p>

                <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 ring-1 ring-zinc-900/5">
                    <div className="text-xs font-extrabold text-zinc-700">
                      Canal
                    </div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      WhatsApp
                    </div>
                  </div>
                  <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-3 ring-1 ring-zinc-900/5">
                    <div className="text-xs font-extrabold text-zinc-700">
                      Uso
                    </div>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      Turnos
                    </div>
                  </div>
                </div>

                <div
                  className="mt-5 rounded-2xl border p-4"
                  style={{
                    borderColor: `${ACCENT}26`,
                    background: `${ACCENT}10`
                  }}
                >
                  <p className="text-xs leading-relaxed text-zinc-700">
                    Si necesitás adjuntar info, usá WhatsApp o Mail para mayor
                    claridad.
                  </p>
                </div>
              </div>
            </aside>

            {/* Content (horizontal desktop) */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 gap-6">
                {/* WhatsApp wide */}
                <SectionCard
                  title={blocks[0].section}
                  subtitle={blocks[0].subtitle}
                  wide
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {blocks[0].items.map((it) => (
                      <ContactItem
                        key={`${it.title}-${it.meta}`}
                        href={it.href}
                        title={it.title}
                        icon={it.icon}
                        meta={it.meta}
                        compact
                      />
                    ))}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/70 px-3 py-1.5 ring-1 ring-zinc-900/5">
                      Abre WhatsApp en nueva pestaña
                    </span>
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold"
                      style={{
                        border: `1px solid ${ACCENT}26`,
                        background: `${ACCENT}10`,
                        color: '#b13a10'
                      }}
                    >
                      Tip: escribí tu nombre y sede
                    </span>
                  </div>
                </SectionCard>

                {/* Social row: 3 cards en desktop */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {blocks.slice(1).map((b) => (
                    <SectionCard
                      key={b.key}
                      title={b.section}
                      subtitle={b.subtitle}
                    >
                      <div className="grid grid-cols-1 gap-3">
                        {b.items.map((it) => (
                          <ContactItem
                            key={it.title}
                            href={it.href}
                            title={it.title}
                            icon={it.icon}
                            meta={it.meta}
                          />
                        ))}
                      </div>
                    </SectionCard>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-zinc-500">
                Al abrir un enlace externo, se abrirá en una nueva pestaña.
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Contacto;
