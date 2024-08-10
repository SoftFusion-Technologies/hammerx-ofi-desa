/*
 * Programador: Lucas Albornoz
 * Fecha Cración: 06 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Subpágina que se abre luego de hacer click en el botón principal "Concepción (Nuestras Sedes)".
 * Contiene información sobre la sede de Concepción.
 *
 *
 *  Tema: Sedes
 *  Capa: Frontend
 */

import {
  sedeconce,
  sedeconce2,
  sedeconce3,
  sedeconceptitulo,
} from "../../images/sedes";
import Navbar from "../../components/header/Navbar";
import Slider from "react-slick";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { guionesbla } from "../../images/index";
import "../../styles/aboutUs/volver.css";
import Footer from "../../components/footer/Footer";

const Sedeconcepcion = () => {
  useEffect(() => {
    document.title = "Sede Concepción";
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    arrows: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 0,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="h-contain bg-[#fc4b08] py-16">
        <div className="pl-10 pt-5 max-sm:pl-2">
          <Link to="/">
            <button className="button">
              <div className="button-box">
                <span className="button-elem">
                  <svg viewBox="0 0 46 40" xmlns="http://www.w3.org/2000/svg">
                    <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"></path>
                  </svg>
                </span>
                <span className="button-elem">
                  <svg viewBox="0 0 46 40">
                    <path d="M46 20.038c0-.7-.3-1.5-.8-2.1l-16-17c-1.1-1-3.2-1.4-4.4-.3-1.2 1.1-1.2 3.3 0 4.4l11.3 11.9H3c-1.7 0-3 1.3-3 3s1.3 3 3 3h33.1l-11.3 11.9c-1 1-1.2 3.3 0 4.4 1.2 1.1 3.3.8 4.4-.3l16-17c.5-.5.8-1.1.8-1.9z"></path>
                  </svg>
                </span>
              </div>
            </button>
          </Link>
        </div>

        <div className="">
          <div>
            <img
              src={sedeconceptitulo}
              width={400}
              className="mx-auto max-sm:w-[300px]"
            />
          </div>

          <div className="w-2/3 max-lg:mt-10 max-md:w-5/6 hidden max-lg:block mx-auto">
            <Slider className="" {...settings}>
              <div>
                <img className="" src={sedeconce} alt="" />
              </div>
              <div>
                <img className="" src={sedeconce2} alt="" />
              </div>
              <div>
                <img className="" src={sedeconce3} alt="" />
              </div>
            </Slider>
          </div>

          <div className="flex justify-center items-center mx-auto w-11/12 my-8 max-lg:flex-col max-lg:w-full">
            {/* Guiones blancos*/}
            <div className="overflow-hidden">
              <img
                className="w-8 max-sm:w-4 h-80 absolute md:-bottom-50 left-0 hidden max-lg:block"
                src={guionesbla}
                alt="Guiones"
              />
              <img
                className="w-8 max-sm:w-4 h-80 absolute md:-bottom-[500px] right-0 hidden max-lg:block"
                src={guionesbla}
                alt="Guiones"
              />
            </div>

            <div className="w-1/3 lg:pr-12 max-lg:w-1/2 max-sm:w-11/12 max-lg:mt-10 max-lg:text-center">
              {/* Información de Horarios*/}
              <div className="text-white">
                <div className="flex items-center max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-clock-hour-4"
                    width="52"
                    height="52"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                    <path d="M12 12l3 2" />
                    <path d="M12 7v5" />
                  </svg>
                  <h1 className="font-bignoodle text-3xl pl-2">Horarios</h1>
                </div>
                <p className="font-messina">
                  <span className="font-bold">Lunes a Viernes</span> - 6:30hs a
                  23:00hs
                </p>
                <p className="font-messina">
                  <span className="font-bold">Sabado</span> - 10:00hs a 18:00hs
                </p>
              </div>

              {/* Información de Ubicación*/}
              <div className="text-white mt-5">
                <div className="flex items-center  max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-map-pin"
                    width="52"
                    height="52"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
                    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
                  </svg>
                  <h1 className="font-bignoodle text-3xl pl-2">Ubicación</h1>
                </div>
                <p className="font-messina">
                  <a
                    href="https://www.google.com/maps/place/Espa%C3%B1a+1732,+T4146+Concepci%C3%B3n,+Tucum%C3%A1n/@-27.3458572,-65.5989922,17z/data=!3m1!4b1!4m6!3m5!1s0x9423cfd9beacde8f:0xcd929e71cf7bd11!8m2!3d-27.345862!4d-65.5964173!16s%2Fg%2F11jk25nd8b?entry=ttu"
                    title="Abrir ubicación en Google Maps"
                    target="_blank"
                  >
                    España 1732 - Concepción
                  </a>
                </p>
              </div>

              {/* Información de Contacto*/}
              <div className="text-white mt-5">
                <div className="flex items-center  max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-phone-incoming"
                    width="52"
                    height="52"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M5 4h4l2 5l-2.5 1.5a11 11 0 0 0 5 5l1.5 -2.5l5 2v4a2 2 0 0 1 -2 2a16 16 0 0 1 -15 -15a2 2 0 0 1 2 -2" />
                    <path d="M15 9l5 -5" />
                    <path d="M15 5l0 4l4 0" />
                  </svg>
                  <h1 className="font-bignoodle text-3xl pl-2">Contacto</h1>
                </div>
                <div className="flex items-center  max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-brand-whatsapp"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 21l1.65 -3.8a9 9 0 1 1 3.4 2.9l-5.05 .9" />
                    <path d="M9 10a.5 .5 0 0 0 1 0v-1a.5 .5 0 0 0 -1 0v1a5 5 0 0 0 5 5h1a.5 .5 0 0 0 0 -1h-1a.5 .5 0 0 0 0 1" />
                  </svg>
                  <p className="font-messina pl-2">
                    <a
                      href="https://api.whatsapp.com/send/?phone=543863564651&text=Hola%21+vengo+desde+el+sitio+oficial%21%21&type=phone_number&app_absent=0"
                      title="Ir a WhatsApp"
                      target="_blank"
                    >
                      3863564651
                    </a>
                  </p>
                </div>
                <div className="flex items-center  max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-brand-instagram"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M4 4m0 4a4 4 0 0 1 4 -4h8a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-8a4 4 0 0 1 -4 -4z" />
                    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
                    <path d="M16.5 7.5l0 .01" />
                  </svg>
                  <p className="font-messina pl-2">
                    <a
                      href="https://www.instagram.com/hammer.ok/"
                      title="Ir a Instagram"
                      target="_blank"
                    >
                      hammer.ok
                    </a>
                  </p>
                </div>
              </div>

              {/* Información de Equipamientos y Servicios*/}
              <div className="text-white mt-5">
                <div className="flex items-center max-lg:justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-barbell"
                    width="52"
                    height="52"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="#ffffff"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M2 12h1" />
                    <path d="M6 8h-2a1 1 0 0 0 -1 1v6a1 1 0 0 0 1 1h2" />
                    <path d="M6 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" />
                    <path d="M9 12h6" />
                    <path d="M15 7v10a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1v-10a1 1 0 0 0 -1 -1h-1a1 1 0 0 0 -1 1z" />
                    <path d="M18 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2" />
                    <path d="M22 12h-1" />
                  </svg>
                  <h1 className="font-bignoodle text-3xl pl-2">
                    Equipamientos y servicios
                  </h1>
                </div>
                <ul>
                  <li>1150 mt2.</li>
                  <li>
                    2 Salones de musculación, salón de cardio, 2 salones de
                    clases grupales.
                  </li>
                  <li>+50 Maquinas de musculación.</li>
                  <li>+20 Maquinas de cardio.</li>
                  <li>+1000 Kg en discos.</li>
                  <li>+40 Pares de mancuernas.</li>
                </ul>
              </div>
            </div>

            {/* Carrousel de imagenes*/}
            <div className="w-2/3 max-lg:mt-10 max-md:w-11/12 max-lg:hidden">
              <Slider className="" {...settings}>
                <div>
                  <img className="" src={sedeconce} alt="" />
                </div>
                <div>
                  <img className="" src={sedeconce2} alt="" />
                </div>
                <div>
                  <img className="" src={sedeconce3} alt="" />
                </div>
              </Slider>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Sedeconcepcion;
