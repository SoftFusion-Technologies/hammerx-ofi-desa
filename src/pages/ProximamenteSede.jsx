// ProximamenteSede.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaBell } from 'react-icons/fa';
import Footer from '../components/footer/Footer';
import Navbar from '../components/header/Navbar';

export default function ProximamenteSede({
  titulo = 'PRÓXIMAMENTE',
  subtitulo = 'Estamos preparando esta sede para vos',
  onAvisarme // opcional: callback para abrir modal o registrar interés
}) {
  return (
    <section className="relative min-h-[100vh] w-full overflow-hidden">
      {/* Fondo con gradiente + textura */}
      <Navbar></Navbar>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-100" />
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #fc4b08 2px, transparent 2px), radial-gradient(circle at 80% 60%, #fc4b08 2px, transparent 2px)',
          backgroundSize: '18px 18px'
        }}
      />

      {/* Glow naranja suave */}
      <div className="absolute -inset-32 bg-[#fc4b08]/10 blur-3xl rounded-full" />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-20">
        {/* Badge superior */}
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="mx-auto w-fit mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#fc4b08]/20 bg-white/70 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#fc4b08] backdrop-blur">
            <FaDumbbell aria-hidden className="opacity-90" />
            NUEVA SEDE
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          initial={{ scale: 0.98, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="text-center font-extrabold leading-tight"
        >
          {/* Doble capa para efecto blanco+naranja grande */}
          <span className="block text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-[0_2px_0_rgba(0,0,0,0.15)]">
            {titulo}
          </span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-[#fc4b08] -mt-1">
            {titulo}
          </span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="mt-4 text-center text-gray-700 text-base sm:text-lg"
        >
          {subtitulo}. Muy pronto vas a poder entrenar acá con todos los
          servicios de HAMMERX.
        </motion.p>

        {/* Línea de información */}
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.35 }}
          className="mx-auto mt-6 w-fit rounded-xl border border-[#fc4b08]/20 bg-white/70 px-4 py-2 text-sm text-gray-700 backdrop-blur"
        >
          <strong className="text-[#fc4b08]">Tip:</strong> seguí nuestras redes
          para enterarte el día de apertura.
        </motion.div>

        {/* Acciones */}
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.26, duration: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-[#fc4b08] px-6 py-3 text-white font-semibold tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#fc4b08]/30"
          >
            Ver otras sedes
          </Link>

          {/* <button
            type="button"
            onClick={onAvisarme}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-[#fc4b08] bg-white px-6 py-3 font-semibold tracking-wide text-[#fc4b08] shadow-sm hover:bg-[#fc4b08] hover:text-white transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#fc4b08]/20"
            aria-label="Avisarme cuando abra"
            title="Avisarme cuando abra"
          >
            <FaBell aria-hidden />
            Avisarme cuando abra
          </button> */}
        </motion.div>

        {/* Marquee sutil (mobile friendly) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.9 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-12 overflow-hidden"
          aria-hidden="true"
        >
          <div className="whitespace-nowrap animate-[marquee_18s_linear_infinite] text-[#fc4b08]/70 font-semibold">
            • HAMMERX • PRÓXIMAMENTE • NUEVA SEDE • ENTRENÁ MEJOR • HAMMERX •
            PRÓXIMAMENTE • NUEVA SEDE • ENTRENÁ MEJOR •
          </div>
        </motion.div>
      </div>

      {/* Keyframes del marquee (inline para no tocar tu CSS global) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <Footer></Footer>
    </section>
  );
}
