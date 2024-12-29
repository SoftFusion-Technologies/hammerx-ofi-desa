import React from 'react';

export default function Mapa() {
  return (
    <div
      className="flex flex-col md:flex-row lg:flex-row justify-center items-center mx-auto w-full transition-opacity duration-500"
      // data-aos="fade-up"
      id="ubicacion"
    >
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.8578037753224!2d-65.5021379!3d-27.1724453!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9423cac85d8aa795%3A0xb16b8d59b21274a!2s%C3%91u%C3%B1orco%20250%2C%20T4142%20Monteros%2C%20Tucum%C3%A1n!5e0!3m2!1ses-419!2sar!4v1690488390213!5m2!1ses-419!2sar"
        width="100%"
        height="450"
        style={{ border: '0' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  );
}
