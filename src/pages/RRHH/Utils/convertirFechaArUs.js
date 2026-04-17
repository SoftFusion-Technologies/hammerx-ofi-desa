const pad2 = (valor) => String(valor).padStart(2, "0");

export const convertirFechaArUs = (fecha, destino = "auto") => {
  if (fecha === null || fecha === undefined) return "";

  const texto = String(fecha).trim();
  if (!texto) return "";

  const partes = texto.split(/[/-]/).map((parte) => parte.trim());

  if (partes.length !== 3) {
    return texto;
  }

  const [parte1, parte2, parte3] = partes;
  const numero1 = Number(parte1);
  const numero2 = Number(parte2);
  const numero3 = Number(parte3);

  if (!Number.isFinite(numero1) || !Number.isFinite(numero2) || !Number.isFinite(numero3)) {
    return texto;
  }

  if (String(parte1).length === 4) {
    const año = parte1;
    const mes = pad2(numero2);
    const dia = pad2(numero3);

    return destino === "us" ? `${mes}/${dia}/${año}` : `${dia}/${mes}/${año}`;
  }

  const esFormatoAr = numero1 > 12 && numero2 <= 12;
  const esFormatoUs = numero2 > 12 && numero1 <= 12;

  if (destino === "ar") {
    return `${pad2(numero1)}/${pad2(numero2)}/${parte3}`;
  }

  if (destino === "us") {
    return `${pad2(numero2)}/${pad2(numero1)}/${parte3}`;
  }

  if (esFormatoAr) {
    return `${pad2(numero2)}/${pad2(numero1)}/${parte3}`;
  }

  if (esFormatoUs) {
    return `${pad2(numero1)}/${pad2(numero2)}/${parte3}`;
  }

  return `${pad2(numero2)}/${pad2(numero1)}/${parte3}`;
};

export default convertirFechaArUs;