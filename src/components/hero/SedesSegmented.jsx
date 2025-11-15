import { Link, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt } from 'react-icons/fa';

export default function SedesButtons({ mostrarBotonesSedes = true }) {
  const { pathname } = useLocation();
  if (!mostrarBotonesSedes) return null;

  const links = [
    { path: '/Sedes/Concepcion', label: 'CONCEPCIÓN' },
    { path: '/Sedes/Monteros', label: 'MONTEROS' },
    { path: '/Sedes/BarrioSur', label: 'BARRIO SUR' },
    { path: '/nueva_sede_hammerx_barrio_norte', label: 'BARRIO NORTE' } // ruta especial
  ];

  const baseBtn =
    'group relative inline-flex items-center justify-center w-full text-center ' +
    'rounded-2xl px-5 py-3 sm:py-3.5 font-semibold uppercase tracking-wide ' +
    'transition-all duration-200 focus:outline-none ' +
    'focus-visible:ring-4 focus-visible:ring-[#fc4b08]/30';

  const isActive = (path) => pathname.startsWith(path);

  return (
    <section className="w-full mx-auto mb-4 px-3">
      <div className="mx-auto max-w-3xl">
        {/* Responsive: 1 columna en mobile, 3 en sm+ */}
        <nav
          aria-label="Nuestras sedes"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {links.map(({ path, label }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                to={path}
                aria-current={active ? 'page' : undefined}
                className={
                  baseBtn +
                  ' shadow-sm hover:shadow-lg active:scale-[0.98] ' +
                  (active
                    ? ' bg-[#fc4b08] text-white'
                    : ' bg-white text-[#fc4b08] border border-[#fc4b08] hover:bg-[#fc4b08] hover:text-white')
                }
              >
                <FaMapMarkerAlt
                  className={
                    'mr-2 text-base sm:text-lg transition-colors ' +
                    (active
                      ? 'text-white'
                      : 'text-[#fc4b08] group-hover:text-white')
                  }
                  aria-hidden="true"
                />
                <span>{label}</span>

                {/* sutil overlay al hover */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-10 bg-white transition-opacity"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
