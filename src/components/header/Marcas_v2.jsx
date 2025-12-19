import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import comercios from './marcas_v2';

const Marcas_v2 = () => {
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
      { breakpoint: 1024, settings: { slidesToShow: 4 } },
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } }
    ]
  };

  return (
    <div className="bg-transparent py-16 font-lora" data-aos="fade-down">
      <div className="container mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-bignoodle text-3xl sm:text-4xl xl:text-5xl text-black tracking-wide">
            COMERCIOS AMIGOS
          </h2>
          <div className="w-16 h-1 bg-orange-600 mx-auto mt-3 rounded-full"></div>
        </div>
        <Slider {...sliderSettings} className="slick-slider px-4">
          {comercios.map((src, index) => (
            <div key={index} className="p-4 h-full">
              <div className="group relative bg-white rounded-xl border border-gray-200 shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden h-full">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-orange-600 transform scale-x-0 transition-transform duration-300 ease-out origin-left group-hover:scale-x-100 z-10"></div>

                <div className="p-6 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <img
                    src={src}
                    alt={`Comercio ${index + 1}`}
                    className="z-10 w-full h-32 sm:h-40 md:h-48 lg:h-56 object-contain transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:scale-110 rounded-md"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="absolute bottom-0 w-full h-[2px] bg-gray-100 group-hover:bg-orange-600 transition-colors duration-300"></div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Marcas_v2;
