import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {
  comercio1,
  comercio2,
  comercio3,
  comercio4,
  comercio5,
  comercio6,
  comercio7,
  comercio8,
  comercio9,
  comercio10,
  comercio11,
  comercio12,
  comercio13
} from './marcas_v2';

const Marcas_v2 = () => {
  const comercios = [
    comercio1,
    comercio2,
    comercio3,
    comercio4,
    comercio5,
    comercio6,
    comercio7,
    comercio8,
    comercio9,
    comercio10,
    comercio11,
    comercio12,
    comercio13
  ];

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 300,
    slidesToShow: 5,
    slidesToScroll: 1,
    swipeToSlide: true,
    autoplay: true,
    autoplaySpeed: 1000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 4
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 3
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 2
        }
      }
    ]
  };

  return (
    <div className="bg-transparent py-16 font-lora" data-aos="fade-down">
      <div className="container mx-auto">
        <h2 className="font-bignoodle text-4xl font-lora text-center text-black mb-12">
          COMERCIOS AMIGOS
        </h2>
        <Slider {...sliderSettings} className="slick-slider">
          {comercios.map((obra, index) => (
            <div key={index} className="p-4">
              <div className="bg-white rounded-lg shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 ease-in-out">
                <img
                  src={obra}
                  alt={`Obra Social ${index + 1}`}
                  className="w-full h-32 sm:h-40 md:h-48 lg:h-56 object-contain rounded-md"
                />
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Marcas_v2;
