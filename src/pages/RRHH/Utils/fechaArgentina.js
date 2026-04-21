import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// activar plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// zona fija Argentina
const ZONA_ARGENTINA = "America/Argentina/Buenos_Aires";

// 🔥 función base
export const ahoraArgentina = () => {
  return dayjs().tz(ZONA_ARGENTINA);
};

// 🔥 helpers útiles
export const fechaActualArgentina = () => {
  return ahoraArgentina().toDate();
};

export const fechaFormateadaArgentina = (formato = "YYYY-MM-DD") => {
  return ahoraArgentina().format(formato);
};