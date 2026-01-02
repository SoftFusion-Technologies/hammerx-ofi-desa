// Benjamin Orellana - 31/12/2025
// Se añade LinkedIn: https://www.linkedin.com/in/soft-fusionsa/
// Se añade Web (icono): https://softfusion.com.ar/

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaLinkedinIn,
  FaGlobe
} from 'react-icons/fa';

const FooterV2 = () => {
  return (
    <footer className="bg-white text-gray-600 py-10 border-t border-orange-100 mt-auto relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-orange-50" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Left Side: Branding */}
        <div className="flex flex-col items-center md:items-start gap-3 text-center md:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-700 uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
            Soft Fusion Technologies
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold text-lg">
              Tecnología Innovadora
            </h3>
            <p className="text-sm mt-1">
              Diseñado y desarrollado por{" "}
              <a href="https://softfusion.com.ar/" className="font-bold text-orange-600" target="_blank" rel="noreferrer">Soft Fusion</a>.
            </p>
          </div>
        </div>

        {/* Right Side: Socials */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Seguinos en redes
          </span>
          <div className="flex items-center gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
              aria-label="Facebook Soft Fusion"
              title="Facebook"
            >
              <FaFacebookF className="text-sm" />
            </a>

            {/* Benjamin Orellana - 31/12/2025: Web Soft Fusion */}
            <a
              href="https://softfusion.com.ar/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
              aria-label="Web Soft Fusion"
              title="Web"
            >
              <FaGlobe className="text-lg" />
            </a>

            <a
              href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
              aria-label="WhatsApp Soft Fusion"
              title="WhatsApp"
            >
              <FaWhatsapp className="text-lg" />
            </a>

            <a
              href="https://www.instagram.com/softfusiontechnologies/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
              aria-label="Instagram Soft Fusion"
              title="Instagram"
            >
              <FaInstagram className="text-lg" />
            </a>

            {/* Benjamin Orellana - 31/12/2025: LinkedIn Soft Fusion */}
            <a
              href="https://www.linkedin.com/in/soft-fusionsa/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
              aria-label="LinkedIn Soft Fusion"
              title="LinkedIn"
            >
              <FaLinkedinIn className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
