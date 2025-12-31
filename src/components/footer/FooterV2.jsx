import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";

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
            >
              <FaFacebookF className="text-sm" />
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
            >
              <FaWhatsapp className="text-lg" />
            </a>
            <a
              href="https://www.instagram.com/softfusiontechnologies/"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-200 bg-white text-orange-600 transition-all hover:border-orange-500 hover:bg-orange-50 hover:scale-110"
            >
              <FaInstagram className="text-lg" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterV2;
