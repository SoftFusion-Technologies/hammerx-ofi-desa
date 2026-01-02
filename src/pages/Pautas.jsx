/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de pautas hammer.
 *
 *  Tema: Pautas
 *  Capa: Frontend
 */

import React, { useEffect } from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { logo } from '../images/svg/index.js';

const Pautas = () => {
  useEffect(() => {
    document.title = 'Pautas';
  }, []);

  const toc = [
    { id: 'intro', label: 'Introducción' },
    { id: 'pautas', label: 'Pautas de convivencia' },
    { id: 'sanciones', label: 'Sanciones y condiciones' }
  ];

  return (
    <>
      <Navbar />

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-white to-zinc-50 scroll-pt-[120px] sm:scroll-pt-[132px]">
        {/* Soft accents (light, premium) */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-44 -left-44 h-[520px] w-[520px] rounded-full bg-[#fc4b08]/10 blur-3xl" />
          <div className="absolute -bottom-52 -right-52 h-[620px] w-[620px] rounded-full bg-amber-200/40 blur-3xl" />
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

        <a
          href="#contenido-pautas"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999]
                     rounded-xl bg-white px-4 py-2 text-sm font-bold text-zinc-900 shadow
                     ring-1 ring-zinc-200"
        >
          Saltar al contenido
        </a>

        <div className="relative mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-[120px] sm:pt-[132px] pb-10 sm:pb-14">
          {/* Hero */}
          <header className="mx-auto max-w-3xl text-center">
            <img
              src={logo}
              alt="Logo"
              className="mx-auto h-16 w-auto sm:h-20"
              loading="lazy"
            />

            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/80 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-zinc-700
                            shadow-[0_14px_40px_rgba(0,0,0,0.06)] ring-1 ring-zinc-900/5 backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#fc4b08]" />
              Convivencia y normas internas
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Pautas de Convivencia
            </h1>

            <p className="mt-3 text-base sm:text-lg leading-relaxed text-zinc-600">
              Para que todos los miembros de HAMMER podamos disfrutar de las
              instalaciones, es importante conocer y cumplir con estas pautas.
              Al contratar, los socios asumen la responsabilidad de respetarlas.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
                Lectura estimada: 2–4 min
              </span>
              <span className="inline-flex items-center rounded-full border border-[#fc4b08]/20 bg-[#fc4b08]/10 px-3 py-1.5 text-xs font-extrabold text-[#b13a10]">
                Normas internas HAMMER
              </span>
            </div>
          </header>

          {/* Content */}
          <section
            id="contenido-pautas"
            className="mt-10 grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-12"
          >
            {/* TOC */}
            <aside className="lg:col-span-4">
              {/* Mobile: collapsible */}
              <details className="lg:hidden rounded-2xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-extrabold text-zinc-900">
                  Contenido
                  <span className="ml-2 text-xs font-semibold text-zinc-500">
                    (tocá para ver)
                  </span>
                </summary>
                <div className="px-4 pb-4">
                  <nav aria-label="Tabla de contenidos">
                    <ul className="space-y-1.5">
                      {toc.map((it) => (
                        <li key={it.id}>
                          <a
                            href={`#${it.id}`}
                            className="block rounded-xl px-3 py-2 text-sm font-semibold text-zinc-700
                                       hover:text-zinc-950 hover:bg-zinc-50
                                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/40"
                          >
                            {it.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </details>

              {/* Desktop: sticky */}
              <div className="hidden lg:block sticky top-6">
                <div className="rounded-3xl border border-zinc-200/70 bg-white/80 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_22px_80px_rgba(0,0,0,0.08)] overflow-hidden">
                  <div className="px-5 py-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                      Contenido
                    </div>
                    <nav aria-label="Tabla de contenidos" className="mt-3">
                      <ul className="space-y-1.5">
                        {toc.map((it) => (
                          <li key={it.id}>
                            <a
                              href={`#${it.id}`}
                              className="group flex items-center justify-between rounded-2xl px-3 py-2 text-sm font-semibold text-zinc-700
                                         hover:text-zinc-950 hover:bg-zinc-50 transition
                                         focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/40"
                            >
                              <span className="truncate">{it.label}</span>
                              <span className="ml-3 h-1.5 w-1.5 rounded-full bg-[#fc4b08]/50 opacity-0 group-hover:opacity-100 transition" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  <div className="px-5 py-4">
                    <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                      Importante
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      Las pautas son enunciativas. HAMMER puede modificarlas
                      según sus valores y aplicar sanciones ante
                      incumplimientos.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Article */}
            <article className="lg:col-span-8">
              <div className="rounded-3xl border border-zinc-200/70 bg-white/85 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_26px_100px_rgba(0,0,0,0.10)] overflow-hidden">
                <div className="h-[3px] w-full bg-gradient-to-r from-[#fc4b08]/75 via-amber-300/40 to-transparent" />

                <div className="px-6 sm:px-8 py-7 sm:py-8">
                  {/* Intro */}
                  <section
                    id="intro"
                    className="scroll-mt-[120px] sm:scroll-mt-[132px]"
                  >
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-bignoodle">
                      PAUTAS DE CONVIVENCIA HAMMER
                    </h2>

                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      Para que todos los miembros de nuestro gimnasio HAMMER
                      podamos disfrutar de las instalaciones es muy importante
                      conocer y cumplir con nuestras pautas de convivencia. Es
                      por ello, que todos los socios al momento de contratar con
                      nosotros asumen la responsabilidad de cumplir con nuestras
                      pautas de convivencia.
                    </p>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Pautas list */}
                  <section
                    id="pautas"
                    className="scroll-mt-[120px] sm:scroll-mt-[132px]"
                  >
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-bignoodle">
                      Pautas de convivencia
                    </h2>

                    {/* Card list for scanability */}
                    <ol className="mt-5 space-y-3">
                      {[
                        'Cuidar las instalaciones, equipos y servicios de HAMMER de manera responsable.',
                        'Está prohibida la utilización de las sedes, instalaciones, maquinaria y/o equipos para un fin distinto para el cual fueron concebidas: entrenamiento físico.',
                        'Orden: Ordenar y devolver los equipos y accesorios al mismo lugar del cual fueron tomados.',
                        'Utilizar los equipos de a uno a la vez y esperar la disponibilidad de las máquinas respetando el orden de llegada.',
                        'No está permitido quedarse sentado en los equipos o máquinas sin utilizarlos cuando hay otros socios que los quieran utilizar.',
                        'Es obligatorio compartir los equipos y las instalaciones, está prohibido negarse a compartir con el resto de los socios.',
                        'Los socios declaran bajo juramento estar en plenas condiciones de salud para realizar actividades físicas.',
                        'Está prohibido cualquier conducta contraria a la moral y a las buenas costumbres, y contraria a la pacífica convivencia entre socios y personal.',
                        'Está prohibido comercializar bienes o servicios en las instalaciones.',
                        'Está prohibido gritar, insultar o dirigirse de manera inapropiada respecto de los demás socios y empleados de la sede.',
                        'Está prohibido agredir física o verbalmente a otros socios y/o empleados de las sedes.',
                        'Es obligatoria la utilización de ropa y calzado apropiados para la práctica deportiva. Está prohibido ingresar a las sedes desnudas o con el torso descubierto.',
                        'No se puede comer, fumar o ingerir cualquier tipo de drogas dentro de las instalaciones de las sedes.',
                        'No está permitido entrar a las sedes con animales.',
                        'Está prohibido el hurto o robo y la comisión de cualquier tipo de delitos.'
                      ].map((txt, idx) => (
                        <li
                          key={idx}
                          className="group rounded-2xl border border-zinc-200/70 bg-white/70 p-4 ring-1 ring-zinc-900/5 shadow-[0_14px_50px_rgba(0,0,0,0.06)]
                                     transition hover:-translate-y-[1px] hover:bg-white"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#fc4b08]/20 bg-[#fc4b08]/10 text-xs font-extrabold text-[#b13a10]">
                              {idx + 1}
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                              {txt}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Sanciones */}
                  <section
                    id="sanciones"
                    className="scroll-mt-[120px] sm:scroll-mt-[132px]"
                  >
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 font-bignoodle">
                      Sanciones y condiciones
                    </h2>

                    <div className="mt-4 rounded-2xl border border-[#fc4b08]/15 bg-[#fc4b08]/8 p-5">
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                        La enumeración de las pautas de convivencia es meramente
                        enunciativa y no taxativa por lo que HAMMER se reserva
                        el derecho de modificar las mismas de manera unilateral
                        según lo crea conveniente conforme sus valores. En caso
                        de incumplimiento, HAMMER podrá aplicar cualquiera de
                        las siguientes sanciones que estime convenientes: 1_
                        llamado de atención; 2_ multa; 3_ suspensión; 4_
                        expulsión mediante la rescisión del contrato. Las
                        sanciones podrán ser comunicadas por escrito, en forma
                        verbal o de manera digital a través de un mail, mensaje
                        de texto o chat. No obstante lo cual, en ningún caso, la
                        aplicación de cualquiera de las sanciones previstas
                        podrá significar que HAMMER renuncia de cualquier manera
                        su derecho de reclamar por los daños y perjuicios que la
                        conducta del socio pudiera ocasionar. Sin perjuicio de
                        lo expuesto, HAMMER se reserva el derecho de admisión de
                        socios y/o invitados cuando lo estime razonablemente
                        conveniente y a su exclusivo criterio. Los socios
                        utilizarán las instalaciones, equipos y maquinarias bajo
                        su propia responsabilidad y se obligan a mantener
                        indemne y liberaran a HAMMER, sus empleados y directores
                        de cualquier responsabilidad derivada de su uso.
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
                        Comunicación: escrita, verbal o digital
                      </span>
                      <span className="inline-flex items-center rounded-full border border-[#fc4b08]/20 bg-[#fc4b08]/10 px-3 py-1.5 text-xs font-extrabold text-[#b13a10]">
                        Sanciones: 1–4
                      </span>
                    </div>
                  </section>
                </div>
              </div>

              <div className="mt-4 text-xs text-zinc-500">
                Si necesitás una versión para imprimir o descargar, se puede
                generar una vista “print-friendly”.
              </div>
            </article>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Pautas;
