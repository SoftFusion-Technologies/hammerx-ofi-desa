/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Sección que contiene información sobre la aplicación móvil de hammer.
 *  
 *
 *  Tema: App Hammer
 *  Capa: Frontend
 */

import { mobileapp } from "../../images";
import "../../styles/main/mobileApp.css";

const MobileApp = () => {
  return (
    <div className="w-full bg-gradient-to-b from-[#fc4b08] to-gray-200 dark:from-gray-500 dark:to-gray-900">
      <div data-aos="fade-up" className="w-11/12 mx-auto flex pt-10 max-md:flex-col">
        <div className="w-2/3 max-md:w-full">
          <div>
            <h1 className="font-bignoodle text-white md:text-[60px] text-[80px] max-sm:text-[40px] max-md:text-[70px] max-sm:text-center">Ya tenes disponible tu app</h1>

            <p className="font-messina text-white max-sm:pt-6 max-sm:text-center">
              Por la misma vamos a mantenernos comunicados y vas a enterarte de
              todas nuestras novedades y actualizaciones.
            </p>
          </div>

          <div className="my-10 sm:space-x-10 max-md:flex max-sm:flex-col max-sm:w-[200px] max-md:justify-center max-md:mx-auto">
            {/* Botón Google Play*/}
            <a data-aos="fade-right" data-aos-duration="1500" className="playstore-button " href="https://play.google.com/store/apps/details?id=com.hammerx&hl=es_419&gl=US">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                className="icon"
                viewBox="0 0 512 512"
              >
                <path d="M99.617 8.057a50.191 50.191 0 00-38.815-6.713l230.932 230.933 74.846-74.846L99.617 8.057zM32.139 20.116c-6.441 8.563-10.148 19.077-10.148 30.199v411.358c0 11.123 3.708 21.636 10.148 30.199l235.877-235.877L32.139 20.116zM464.261 212.087l-67.266-37.637-81.544 81.544 81.548 81.548 67.273-37.64c16.117-9.03 25.738-25.442 25.738-43.908s-9.621-34.877-25.749-43.907zM291.733 279.711L60.815 510.629c3.786.891 7.639 1.371 11.492 1.371a50.275 50.275 0 0027.31-8.07l266.965-149.372-74.849-74.847z"></path>
              </svg>
              <span className="texts">
                <span className="text-1">GET IT ON</span>
                <span className="text-2">Google Play</span>
              </span>
            </a>

            {/* Botón Google Play*/}
            <a data-aos="fade-right" data-aos-duration="2300" href="https://apps.apple.com/ar/app/hammer-x/id6470037033" className="playstore-button max-sm:mt-5" >
              <span className="icon">
                <svg
                  fill="currentcolor"
                  viewBox="-52.01 0 560.035 560.035"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655"></path>
                  </g>
                </svg>
              </span>
              <span className="texts">
                <span className="text-1">Download form</span>
                <span className="text-2">App store</span>
              </span>
            </a>
          </div>
        </div>

        <div data-aos="fade-left" className="w-1/3 max-md:mx-auto max-md:w-full flex flex-end">
          <img src={mobileapp} alt="" className="mx-auto max-sm:w-2/3"/>
        </div>
      </div>
    </div>
  );
};

export default MobileApp;
