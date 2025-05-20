/*
 * Programador: Manrique Sergio Gustavo
 * Fecha Cración: 13 / 05 / 2025
 * Versión: 1.1.1
 * Última modificacion: 20 / 05 / 2025
 *
 * Descripción: Componente de que se muestra en Clients.jsx para la sección de "Planes de Soy Cliente"
 *
 *
 *  Tema: Planes de soy cliente
 *  Capa: Frontend
 */

import { useState, useEffect, useRef, forwardRef } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import fondo_img from "./Images/chicos2.jpg";

const Planes = forwardRef((props, ref) => {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const color = "bg-gradient-to-b from-orange-500 to-[#fc4b08]";

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    Aos.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    if (selectedPromo && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (hasInteracted) {
      buttonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedPromo, hasInteracted]);

  const buttonsInfo = [
    {
      id: "familiares",
      text: "CONGELAMIENTO DE CONTRATOS",
      header: "CONGELAMIENTO DE CONTRATO",
      items: [
        {
          text: `Si contás con un plan trimestral o de mayor duración, el gimnasio se compromete a brindar su servicio por el período de tiempo contratado. El congelamiento del contrato es un beneficio disponible para el cliente, y solo podrá solicitarse en situaciones particulares, respetando las siguientes condiciones:

            1. El congelamiento se puede solicitar POR ÚNICA VEZ por contrato.
            2. Casos de solicitud:
            - Lesiones o enfermedades que imposibiliten asistir al gimnasio, con certificado médico que lo avale.
            - Viajes en temporada o vacaciones con comprobante de reserva (pasaje, hospedaje, etc.).
            3. No se realizan devoluciones ni recuperaciones de días perdidos. El congelamiento siempre debe solicitarse antes de la inasistencia.
            4. No puede aplicarse a planes que incluyan pilates, ya que las camas quedan reservadas para el cliente.`,
        },
      ],
      buttons: [
        {
          text: `TRIMESTRAL: 7 [MÍNIMO] 
                A 30 [MÁXIMO] DÍAS`,
        },
        {
          text: `SEMESTRAL: 7 [MÍNIMO] 
                A 30 [MÁXIMO] DÍAS`,
        },
        {
          text: `ANUAL: 7 [MÍNIMO] 
                A 30 [MÁXIMO] DÍAS`,
        },
      ],
    },
    {
      id: "amigos",
      text: "TRANSFERENCIA DE PLANES",
      header: "TRANSFERENCIA DE PLANES",
      items: [
        {
          text: `Este beneficio es aplicable en caso de imposibilitarse la continuidad del plan por algún motivo o disconformidad con el servicio (Garantía). Se podrá realizar la transferencia del contrato solo a nuevos clientes, que no hayan asistido al gimnasio nunca, o que no estén asistiendo hace al menos 4 meses (120 días) o más.

            1. En caso de planes mensuales se podrá realizar hasta 10 días de la fecha de pago del contrato.
            2. En caso de planes semestrales se podrá realizar hasta 21 días de la fecha de pago del contrato.
            3. En caso de planes anuales se podrá realizar hasta 30 días de la fecha de pago del contrato.`,
        },
      ],
    },
  ];

  const handlePromoClick = (promoId) => {
    setHasInteracted(true);
    if (selectedPromo === promoId) {
      setOpen(!open);
      setSelectedPromo(null);
    } else {
      setOpen(true);
      setSelectedPromo(promoId);
    }
  };
  const PromoCard = ({ promo }) => {
    return (
      <div
        className={`bg-white max-w-6xl border-orange-500 rounded-lg border-4  shadow-lg p-4  mx-auto mt-8`}
      >
        <div
          className={`${color} rounded-xl p-4 text-white text-center mb-4 font-bignoodle`}
        >
          <h3 className="text-4xl font-bold  whitespace-pre-line ">
            {promo.header}
          </h3>
        </div>
        <div className="space-y-3 ">
          {promo.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2">
              <div
                className="text-gray-600 p-2 rounded-md flex-1 text-left font-messina text-xs sm:text-sm xl:text-lg"
                style={{ whiteSpace: "pre-line" }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
        <div>
          {promo.buttons && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4">
              {promo.buttons.map((button, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-center ${color} text-white rounded-xl font-bold flex-1 text-center p-2  whitespace-pre-line text-xl tracking-widest`}
                >
                  {button.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePromoClick(promo.id)}
            className={`${color}  hover:bg-orange-600 text-white p-2 rounded-xl font-bold text-center h-14 w-36 transition-colors duration-200 shadow-md text-xl`}
            type="button"
          >
            ACEPTAR
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative w-full font-bignoodle tracking-widest ${color} min-h-fit  py-10`}
      ref={ref}
    >
      {true && (
        <>
          <img
            src={fondo_img}
            alt="Promoción Galicia"
            className="w-full h-full object-cover absolute inset-0 z-0"
          />
          <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#fc4b08]/80 to-orange-600" />
        </>
      )}
      <div className="relative w-full min-h-fit">
        <div className="relative z-10"  data-aos="fade-down">
          <div className="relative z-10 col-span-1 mx-auto">
            <h1 className="text-center text-2xl md:text-6xl font-bold bg-white p-8 border-4 border-white rounded-lg text-orange-600">
              CONGELAR Y TRANSFERIR PLANES
            </h1>
          </div>
          <div className="col-span-1 mx-auto mt-10" data-aos="zoom-in">
            <h1
              className="text-2xl md:text-5xl xl:text-7xl font-bold text-white text-center whitespace-pre-line"
              ref={buttonRef}
            >
              ¡HACE CLICK PARA MÁS{"\n"}INFORMACIÓN!
            </h1>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 items-center mx-auto gap-4 max-w-[1500px] px-4 mt-5"
            data-aos="fade-up"
          >
            {buttonsInfo.map((button, index) => (
              <button
                key={index}
                className={`w-full h-20 flex items-center justify-center font-bold text-[1.2rem] sm:text-3xl rounded-md border-2 transition-all duration-300 hover:bg-[#f97316] hover:text-white hover:border-0 ${
                  selectedPromo === button.id
                    ? `${color} text-white border-white`
                    : `bg-white text-orange-600 border-orange-500`
                }`}
                onClick={() => handlePromoClick(button.id)}
              >
                {button.text.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Contenedor para la card seleccionada */}
          <div className="mt-1 px-4">
            <div
              ref={cardRef}
              className={`transition-all duration-1000 ease-out transform ${
                open && selectedPromo
                  ? "scale-100 opacity-100 pointer-events-auto"
                  : "scale-95 opacity-0 pointer-events-none"
              }`}
              style={{ minHeight: selectedPromo ? "auto" : 0 }}
            >
              {selectedPromo && (
                <PromoCard
                  promo={buttonsInfo.find((btn) => btn.id === selectedPromo)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Planes;
