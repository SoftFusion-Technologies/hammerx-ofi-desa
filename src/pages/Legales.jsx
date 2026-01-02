/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de legales hammer.
 *
 *  Tema: Legales
 *  Capa: Frontend
 */

import React, { useEffect } from 'react';
import Navbar from '../components/header/Navbar';
import Footer from '../components/footer/Footer';
import { logo } from '../images/svg/index.js';

const Legales = () => {
  useEffect(() => {
    document.title = 'Legales';
  }, []);

  const toc = [
    { id: 'legales', label: 'Legales' },
    { id: 'datos', label: 'Datos personales recabados' },
    { id: 'finalidades', label: 'Finalidades' },
    { id: 'primarias', label: 'a) Finalidades primarias' },
    { id: 'secundarias', label: 'b) Finalidades secundarias' },
    { id: 'proteccion', label: 'Protección y gestión' },
    { id: 'cambios', label: 'Cambios a la Política' }
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
          href="#contenido-legales"
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
              Legales y privacidad
            </div>

            <h1 className="font-bignoodle mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
              Legales 
            </h1>

            <p className="font-messina mt-3 text-base sm:text-lg leading-relaxed text-zinc-600">
              En HAMMER consideramos que la protección de los datos personales
              de nuestros usuarios es muy importante. Nos comprometemos a hacer
              un uso responsable de la información para permitirles operar con
              seguridad con nosotros.
            </p>

            {/* Quick meta */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
                Lectura estimada: 3–5 min
              </span>
              <span className="inline-flex items-center rounded-full border border-[#fc4b08]/20 bg-[#fc4b08]/10 px-3 py-1.5 text-xs font-extrabold text-[#b13a10]">
                Última actualización: Diciembre 2022
              </span>
            </div>
          </header>

          {/* Content layout */}
          <section
            id="contenido-legales"
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

              {/* Desktop: sticky card */}
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
                                         hover:text-zinc-950 hover:bg-zinc-50
                                         transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fc4b08]/40"
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
                      Nota
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      Este documento resume prácticas de privacidad y uso de
                      datos. Si hay cambios materiales, se publicarán en la
                      aplicación.
                    </p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Article */}
            <article className="lg:col-span-8">
              <div className="rounded-3xl border border-zinc-200/70 bg-white/85 backdrop-blur-xl ring-1 ring-zinc-900/5 shadow-[0_26px_100px_rgba(0,0,0,0.10)] overflow-hidden">
                {/* Top accent */}
                <div className="h-[3px] w-full bg-gradient-to-r from-[#fc4b08]/75 via-amber-300/40 to-transparent" />

                <div className="px-6 sm:px-8 py-7 sm:py-8">
                  {/* Section: Legales */}
                  <section id="legales" className="scroll-mt-24">
                    <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Legales
                    </h2>
                    <p className="font-messina mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      En HAMMER consideramos que la protección de los datos
                      personales de nuestros usuarios es muy importante. En
                      consecuencia, nos comprometemos a hacer un uso responsable
                      de la información personal que nos brinden por cualquier
                      medio a fines de permitirles operar con seguridad con
                      nosotros.
                    </p>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Section: Datos */}
                  <section id="datos" className="scroll-mt-24">
                    <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Datos personales recabados
                    </h2>

                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      Hammer podrá recabar y solicitar solo las siguientes
                      categorías de datos personales:
                    </p>

                    <ol className="font-messina mt-4 space-y-2 pl-5 list-decimal text-sm sm:text-base text-zinc-700">
                      <li>
                        Datos de contacto, incluyendo nombre, apellido, correo
                        electrónico, número de teléfono y dirección de envío y
                        facturación.
                      </li>
                      <li>
                        Información de acceso y cuenta, incluyendo nombre de
                        usuario, contraseña, ID de usuario único y MAC ID del
                        celular.
                      </li>
                      <li>
                        Datos personales incluyendo sexo, ciudad natal y fecha
                        de nacimiento.
                      </li>
                      <li>Información de pago o tarjeta de crédito.</li>
                      <li>Imágenes, fotos y videos.</li>
                      <li>
                        Datos sobre las características físicas, incluyendo el
                        peso, la estatura y las medidas corporales.
                      </li>
                      <li>
                        Datos de actividad física proporcionados por usted o
                        generados a través de nuestra Aplicación (tiempo,
                        duración, distancia, ubicación, cantidad de calorías).
                      </li>
                      <li>
                        Preferencias personales incluyendo su lista de deseos,
                        así como las preferencias de marketing y cookies.
                      </li>
                      <li>Datos de geolocalización.</li>
                    </ol>

                    {/* Callout */}
                    <div className="mt-5 rounded-2xl border border-[#fc4b08]/15 bg-[#fc4b08]/8 p-4">
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                        Asimismo, es importante informarle que no se recabarán
                        datos personales considerados por la LEY DE PROTECCION
                        DE DATOS PERSONALES como sensibles, para las finalidades
                        enumeradas más adelante.
                      </p>
                    </div>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Section: Finalidades */}
                  <section id="finalidades" className="scroll-mt-24">
                    <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Finalidades
                    </h2>
                    <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      Sus datos personales serán tratados exclusivamente para
                      las siguientes finalidades:
                    </p>
                  </section>

                  {/* Section: Primarias */}
                  <section id="primarias" className="mt-6 scroll-mt-24">
                    <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                      a. Finalidades primarias
                    </h3>

                    <ol className="font-messina mt-3 space-y-2 pl-5 list-decimal text-sm sm:text-base text-zinc-700">
                      <li>Identificarlo como usuario de HAMMER.</li>
                      <li>
                        Creación, gestión, control y administración del registro
                        y/o la cuenta del usuario.
                      </li>
                      <li>
                        Darlo de alta en nuestros sistemas y/o bases de datos.
                      </li>
                      <li>
                        Creación, gestión, control y administración del perfil
                        del usuario.
                      </li>
                      <li>
                        Hacer uso de las funcionalidades incluidas dentro de la
                        aplicación.
                      </li>
                      <li>
                        Brindarle acceso a la información contenida dentro de la
                        aplicación.
                      </li>
                      <li>
                        Informarle acerca de los servicios y/o productos, así
                        como ofertas comerciales y/o beneficios ofrecidos por
                        HAMMER, en el supuesto y momento que solicite dicha
                        información, incluyendo sus modalidades y precios.
                      </li>
                      <li>
                        Proporcionarle una cotización respecto de los servicios
                        y/o productos ofrecidos por HAMMER en los que, en su
                        caso, pudiese estar interesado.
                      </li>
                      <li>Estadística y registro histórico de usuarios.</li>
                    </ol>

                    <p className="mt-4 text-sm sm:text-base leading-relaxed text-zinc-700">
                      Adicionalmente podremos tratar sus datos personales para
                      las siguientes finalidades secundarias.
                    </p>
                  </section>

                  {/* Section: Secundarias */}
                  <section id="secundarias" className="mt-6 scroll-mt-24">
                    <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                      b. Finalidades secundarias
                    </h3>

                    <div className="mt-4 rounded-2xl border border-zinc-200/70 bg-white/70 p-5">
                      <p className="text-sm sm:text-base leading-relaxed text-zinc-700">
                        1. En caso de que haya solicitado información respecto
                        de los productos y/o servicios, ofertas comerciales y/o
                        beneficios que HAMMER ofrece, y no se encuentre
                        interesado en contratarlos en el momento y supuesto en
                        que lo haya solicitado, posteriormente podremos enviarle
                        actualizaciones sobre publicidad, promociones y/o
                        información sobre nuevos productos y/o servicios,
                        ofertas comerciales y/o beneficios que pudiesen
                        interesarle, a través de distintos medios, como pueden
                        ser vía telefónica, vía correo electrónico, vía chat
                        (WhatsApp), vía SMS, así como a través de cualquier
                        medio que solicite. Asimismo, HAMMER podrá captar, y
                        registrar, la dirección MAC de los dispositivos móviles
                        del Usuario. También es posible que utilicemos datos
                        acerca de cómo usted utiliza nuestra aplicación para
                        prevenir o detectar fraudes, abusos, usos ilegales e
                        infracciones de nuestros Términos de uso y para cumplir
                        con las órdenes judiciales, solicitudes gubernamentales
                        o leyes aplicables.
                      </p>
                    </div>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Section: Protección */}
                  <section id="proteccion" className="scroll-mt-24">
                    <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Protección y Gestión de sus Datos Personales
                    </h2>

                    <p className="font-messina mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      <span className="font-extrabold text-zinc-900">
                        Encriptación y Seguridad:
                      </span>{' '}
                      Utilizamos una variedad de medidas de seguridad técnica y
                      organizativa, incluyendo herramientas de encriptación y
                      autenticación, para mantener la seguridad de sus datos
                      personales. Sus datos personales están contenidos detrás
                      de redes seguras y sólo son accesibles por un número
                      limitado de personas que tienen derechos especiales de
                      acceso a estos sistemas.
                    </p>
                  </section>

                  <div className="my-7 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Section: Cambios */}
                  <section id="cambios" className="scroll-mt-24">
                    <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                      Cambios a nuestra Política de Privacidad
                    </h2>

                    <p className="font-messina mt-3 text-sm sm:text-base leading-relaxed text-zinc-700">
                      La ley aplicable y nuestras prácticas pueden cambiar con
                      el tiempo. Si decidimos actualizar nuestra Política,
                      publicaremos los cambios en nuestra Aplicación. Si
                      cambiamos materialmente la forma en que tratamos los datos
                      personales, le proporcionaremos un aviso previo o, cuando
                      sea legalmente necesario, solicitaremos su consentimiento
                      antes de llevar a cabo dichos cambios. Le recomendamos
                      encarecidamente que lea nuestra Política y se mantenga
                      informado de nuestras prácticas. Fecha de última
                      actualización: DICIEMBRE 2022
                    </p>

                    {/* Bottom meta */}
                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1.5 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-900/5">
                        Política de privacidad
                      </span>
                    </div>
                  </section>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Legales;
