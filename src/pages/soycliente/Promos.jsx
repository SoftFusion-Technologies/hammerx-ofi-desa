import { useState, useEffect, useRef, forwardRef } from 'react';
import Promo1 from './PromosBancarias/1.jpg';
import Promo2 from './PromosBancarias/2.jpg';
import Aos from 'aos';
import 'aos/dist/aos.css';
import fondo_img from './Images/bienvenido.jpg';
const images = import.meta.glob('./Images/convenios/*.{png,jpg,jpeg,svg}', {
  eager: true
});

const BACKEND_URL = 'http://localhost:8080';

const Promos = forwardRef((props, ref) => {
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [open, setOpen] = useState(false);
  const [imagenesPromoMes, setImagenesPromoMes] = useState([]);
  const cardRef = useRef(null);
  const buttonRef = useRef(null);
  const color = 'bg-gradient-to-b from-orange-500 to-[#fc4b08]';

  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (selectedPromo && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (hasInteracted) {
      buttonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedPromo, hasInteracted]);

  // Traer las imágenes de promo del mes (dinámico)
  useEffect(() => {
    fetch(`${BACKEND_URL}/promos-mes`)
      .then((res) => res.json())
      .then((data) => setImagenesPromoMes(data));
  }, []);

  // Mapear imágenes a items para el dashboard
  const itemsPromoMes = imagenesPromoMes.map((img) => ({
    text: `${BACKEND_URL}/public/${img.imagen_url.replace(/^uploads\//, '')}`,
    description: img.titulo || 'Promo del mes'
  }));

  const conveniosImages = Object.entries(images)
    .map(([path, mod]) => ({
      path: mod.default,
      name: path.split('/').pop()
    }))
    .sort((a, b) => {
      const getNumber = (name) => {
        const match = name.match(/convenios_(\d+)\./);
        return match ? parseInt(match[1], 10) : 0;
      };
      return getNumber(a.name) - getNumber(b.name);
    });

  const conveniosItems = conveniosImages.map((img, idx) => ({
    text: img.path,
    description: `Convenio ${idx + 1}`
  }));

  const buttonsInfo = [
    {
      id: 'familiares',
      text: 'Promociones familiares',
      header: '¿ENTRENAS EN FAMILIA?\n¡APROVECHEN ESTOS DESCUENTOS!',
      items: [
        {
          text: '2 FAMILIARES',
          description: '10% OFF PARA CADA UNO'
        },
        {
          text: '3 FAMILIARES',
          description: 'UNO ABONA LA MITAD'
        },
        {
          text: '4 FAMILIARES',
          description: 'UNO NO ABONA'
        },
        {
          text: '5 FAMILIARES',
          description: '1 MENSUAL Y MEDIO GRATIS'
        }
      ]
    },
    {
      id: 'amigos',
      text: 'Promociones amigos/referidos',
      header:
        'INVITA A UN AMIGO QUE NO SEA SOCIO DEL GYM Y OBTENE ESTOS DESCUENTOS EN TU PROXIMA RENOVACIÓN:',
      items: [
        {
          text: '1 AMIGO',
          description: '10% OFF'
        },
        {
          text: '2 AMIGOS',
          description: '25% OFF'
        },
        {
          text: '3 AMIGOS',
          description: '40% OFF'
        },
        {
          text: '4 AMIGOS',
          description: '¡MENSUAL GRATIS!'
        }
      ]
    },
    {
      id: 'planes',
      text: 'Promociones planes largos',
      header: 'PAGA MENOS, ¡ELEGI TU PLAN LARGO!',
      subheader: '(EN EFECTIVO)',
      items: [
        {
          text: 'TRIMESTRE',
          description: '10% OFF'
        },
        {
          text: 'SEMESTRE',
          description: '1 MES GRATIS'
        },
        {
          text: 'ANUAL',
          description: '3 MESES GRATIS'
        }
      ]
    },
    {
      id: 'promociones',
      text: '¡Promociones del mes!',
      header: '¡Conocé todas nuestras promociones del mes!',
      bancario: true,
      items:
        itemsPromoMes.length > 0
          ? itemsPromoMes
          : [
              // fallback demo
              { text: Promo1, description: 'Image de la promo 1' },
              { text: Promo2, description: 'Image de la promo 2' }
            ]
    },
    {
      id: 'convenios',
      text: 'Convenios',
      convenios: true,
      items: conveniosItems
    }
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
        className={`${
          promo.bancario
            ? 'bg-[#FD6112] max-w-5xl'
            : promo.convenios
            ? 'bg-white max-w-5xl'
            : 'bg-white max-w-2xl border-orange-500'
        } rounded-lg border-4 shadow-lg p-4 mx-auto mt-8`}
      >
        {promo.header && (
          <div
            className={`${
              promo.bancario && 'border-2'
            } ${color}  rounded-md p-4 text-white text-center mb-4 font-bignoodle`}
          >
            <h3 className="text-2xl font-bold whitespace-pre-line ">
              {promo.header}
            </h3>
            {promo.subheader && (
              <p className="text-lg font-semibold mt-2">{promo.subheader}</p>
            )}
          </div>
        )}
        {promo.bancario ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {promo.items.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={item.text}
                  alt={item.description}
                  className={`w-auto h-auto rounded-md border-2 ${color}`}
                />
              </div>
            ))}
          </div>
        ) : promo.convenios ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-4 w-full">
            {promo.items.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center ">
                <img
                  src={item.text}
                  alt={item.description}
                  className="w-40 h-32 sm:w-52 sm:h-44 object-fill shadow bg-[#fc4b08] rounded-md"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 ">
            {promo.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 "
              >
                <div
                  className={`${color} text-sm sm:text-lg text-white p-2 rounded-md font-bold flex-1 text-center tracking-widest`}
                >
                  {item.text}
                </div>
                <div className="bg-white text-sm sm:text-lg border-2 border-[#FD6112] text-[#FD6112] p-2 rounded-md font-bold flex-1 text-center">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative w-full font-bignoodle tracking-wider ${color} min-h-fit py-10`}
      ref={ref}
    >
      <>
        <img
          src={fondo_img}
          alt="Promoción Galicia"
          className="w-full h-full object-cover absolute inset-0 z-0"
        />
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-b from-[#fc4b08]/80 to-orange-600" />
      </>
      <div className="relative w-full min-h-fit">
        <div className="relative z-10">
          <div
            className="relative h-48 flex items-center justify-center overflow-hidden"
            data-aos="fade-down"
          >
            <h1
              className="absolute uppercase pointer-events-none select-none whitespace-nowrap"
              style={{
                fontSize: 'clamp(4rem, 15vw, 13rem)',
                color: 'transparent',
                WebkitTextStroke: '3px #fff',
                textStroke: '3px #fff'
              }}
            >
              ¡NUESTRAS PROMOS!
            </h1>
            <div className="relative z-10 col-span-1 mx-auto">
              <h1
                className={`text-2xl md:text-5xl font-bold ${color} p-5 border-4 border-white text-white rounded-lg`}
              >
                ¡NUESTRAS PROMOS!
              </h1>
            </div>
          </div>

          <div className="col-span-1 mx-auto" data-aos="zoom-in">
            <h1
              className="text-2xl md:text-3xl xl:text-5xl font-bold text-white text-center"
              ref={buttonRef}
            >
              ¡HACE CLICK EN ALGUNA DE ELLAS Y ENTERATE!
            </h1>
          </div>

          <div
            className="mt-8 grid grid-cols-1 md:grid-cols-5 items-center mx-auto gap-4 max-w-[1500px] px-4"
            data-aos="fade-up"
          >
            {buttonsInfo.map((button, index) => (
              <button
                key={index}
                className={`w-full h-20 flex items-center justify-center font-bold text-[1.2rem] sm:text-xl xl:text-2xl 3xl:text-3xl rounded-md border-2 transition-all duration-300 hover:bg-[#f97316] hover:text-white hover:border-0 ${
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
          <div className="px-4">
            <div
              ref={cardRef}
              className={`transition-all duration-1000 ease-out transform ${
                open && selectedPromo
                  ? 'scale-100 opacity-100 pointer-events-auto'
                  : 'scale-95 opacity-0 pointer-events-none'
              }`}
              style={{ minHeight: selectedPromo ? 'auto' : 0 }}
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

export default Promos;
