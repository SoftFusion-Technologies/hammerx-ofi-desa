import React from "react";
import { FaFacebookF, FaWhatsapp, FaInstagram } from "react-icons/fa";

const RedesSoft = () => {
  return (
    <div className="flex flex-col md:flex-row md:justify-end md:items-center">
      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
        <span className="text-[18px] text-gray-400 md:mr-2 text-right md:text-left">
          Diseñado y desarrollado por{" "}
          <span className="font-bold text-pink-600">Soft Fusion</span>
        </span>
        <div className="flex items-center gap-2 mt-1 md:mt-0 justify-end">
          <a
            href="https://www.facebook.com/profile.php?id=61551009572957&mibextid=wwXIfr&rdid=i9TyFp5jNmBtdYT8&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1JAMUqUEaQ%2F%3Fmibextid%3DwwXIfr#"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <FaFacebookF size={14} />
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=5493815430503&text&type=phone_number&app_absent=0"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-green-500 transition"
          >
            <FaWhatsapp size={14} />
          </a>
          <a
            href="https://www.instagram.com/softfusiontechnologies/"
            target="_blank"
            rel="noreferrer"
            className="text-gray-400 hover:text-pink-500 transition"
          >
            <FaInstagram size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default RedesSoft;
