import { Link } from "react-router-dom";
import { logohammer } from "../../images";
import "../../styles/footer/footer.css"

const Footer = () => {
    return (
      <>
        <footer className="bg-gray-200  shadow dark:bg-gray-900 ">
          <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <a
                href="/"
                className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
              >
                <img src={logohammer} className="h-8" alt="Hammer Logo" />
              </a>
              <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                <p className="hover:underline me-4 md:me-6 max-sm:select-none ml-40">
                  Página web desarrollada por
                  <a
                    href="https://www.instagram.com/softfusiontechnologies/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-500"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    &nbsp;SOFT FUSION
                  </a>
                </p>
              </ul>
              <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                {/* Se reemplazaron las etiquetas a por Link, porque no se pasaba el navbar, cambio aplicado por Rafael Peralta */}
                <li>
                  <Link to={'/pautas'}>
                    <p className="hover:underline me-4 md:me-6 max-sm:select-none">
                      Pautas de Convivencia Hammer
                    </p>
                  </Link>
                </li>
                <li>
                  <Link to={'/legales'}>
                    <p className="hover:underline me-4 md:me-6 max-sm:select-none">
                      Legales
                    </p>
                  </Link>
                </li>
                <li>
                  <Link to={'/contacto'}>
                    <p className="hover:underline max-sm:select-none">
                      Contacto
                    </p>
                  </Link>
                </li>
              </ul>
            </div>
            <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
            <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400 max-sm:select-none">
              © 2023{' '}
              <a href="#" className="hover:underline max-sm:select-none">
                Hammer™
              </a>
              . All Rights Reserved.
            </span>
          </div>
        </footer>
      </>
    );
};

export default Footer;
