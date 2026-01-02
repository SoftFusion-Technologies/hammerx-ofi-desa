/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página principal que contiene los componentes principales.
 *
 *  Tema: Página Principal
 *  Capa: Frontend
 */

import Hero from '../components/hero/Hero';
import Navbar from '../components/header/Navbar';
import Servicios from '../components/main/Servicios';
import About from '../components/main/About';
import MobileApp from '../components/main/MobileApp';
import Footer from '../components/footer/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <header className="relative z-50">
        <Navbar />
      </header>

      {/* Si el Navbar es fixed, este padding evita que el Hero quede tapado */}
      <main className="pt-[96px] sm:pt-[104px]">
        {/* Opcional: secciones con ids para anchors del navbar */}
        <section id="hero">
          <Hero />
        </section>

        <section
          id="servicios"
          className="[content-visibility:auto] [contain-intrinsic-size:800px]"
        >
          <Servicios />
        </section>

        <section
          id="about"
          className="[content-visibility:auto] [contain-intrinsic-size:800px]"
        >
          <About />
        </section>

        <section
          id="mobileapp"
          className="[content-visibility:auto] [contain-intrinsic-size:800px]"
        >
          <MobileApp />
        </section>
      </main>

      <footer>
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;
