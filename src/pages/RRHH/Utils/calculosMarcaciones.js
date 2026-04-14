export const calcularMinutosEntreHoras = (inicio, fin) => {
  if (!inicio || !fin) return 0;

  const [horasInicio, minInicio] = inicio.split(":").map(Number);
  const [horasFin, minFin] = fin.split(":").map(Number);

  const totalMinutosInicio = horasInicio * 60 + minInicio;
  const totalMinutosFin = horasFin * 60 + minFin;

  return totalMinutosFin - totalMinutosInicio;
};

export const obtenerMinutosPositivos = (valor) => {
  const minutos = Number(valor ?? 0);
  if (!Number.isFinite(minutos) || minutos <= 0) {
    return 0;
  }

  return minutos;
};

export const calcularMinutosNetoTurno = (turno) => {
  const minutosBrutos = calcularMinutosEntreHoras(turno.entrada, turno.salida);
  const minutosDescuento = obtenerMinutosPositivos(turno.minutos_descuento);
  return Math.max(0, minutosBrutos - minutosDescuento);
};

export const convertirHorasATotalMinutos = (valor) => {
  if (valor === null || valor === undefined) return 0;

  if (typeof valor === "number") {
    return Number.isFinite(valor) && valor > 0 ? valor : 0;
  }

  const texto = String(valor).trim();
  if (!texto) return 0;

  if (texto.includes(":")) {
    const [horasTexto = "0", minutosTexto = "0"] = texto.split(":");
    const horas = Number(horasTexto);
    const minutos = Number(minutosTexto);

    if (!Number.isFinite(horas) || !Number.isFinite(minutos)) {
      return 0;
    }

    return Math.max(0, horas * 60 + minutos);
  }

  const numero = Number(texto.replace(",", "."));
  if (!Number.isFinite(numero) || numero <= 0) return 0;

  return Math.round(numero * 60);
};
