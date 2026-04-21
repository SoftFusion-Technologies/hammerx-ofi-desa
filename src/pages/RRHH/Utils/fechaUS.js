import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// activar plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// zona fija EE. UU. (Eastern Time - Nueva York/Miami)
const ZONA_US = "America/New_York";

// 🔥 función base
export const ahoraUS = () => {
  return dayjs().tz(ZONA_US);
};

// 🔥 helpers útiles
export const fechaActualUS = () => {
  return ahoraUS().toDate();
};

export const fechaFormateadaUS = (formato = "YYYY-MM-DD") => {
  return ahoraUS().format(formato);
};