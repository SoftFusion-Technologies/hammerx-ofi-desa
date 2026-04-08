/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Módulo avanzado para la preparación y aprobación de liquidaciones. Permite gestionar pagos normales y adelantos (de horas ya trabajadas o futuras), calculando automáticamente saldos, deudas previas y descuentos manuales. Incluye una interfaz interactiva para la selección de marcaciones por rangos de fecha y proyecta el estado financiero final del empleado antes de confirmar la operación.
*/
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import Swal from "sweetalert2";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaHistory,
  FaUser,
} from "react-icons/fa";
import { FaRegNewspaper } from "react-icons/fa6";
import { useAuth } from "../../../../AuthContext";
import ModalAprobarLiquidacion from "../../Modals/RRHH/ModalAprobarLiquidacion";
import Liquidaciones from "../Empleados/Liquidaciones";
import HistorialMarcas from "../Empleados/HistorialMarcas";

dayjs.extend(isBetween);

const API_URL = "http://localhost:8080";

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const date = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-AR");
};

const parseHorasToMinutes = (valor) => {
  if (valor === null || valor === undefined || valor === "") return 0;

  if (typeof valor === "number" && Number.isFinite(valor)) {
    return Math.round(valor * 60);
  }

  const texto = String(valor).trim();
  if (!texto) return 0;

  if (texto.includes(":")) {
    const [horasTexto, minutosTexto = "0"] = texto.split(":");
    const horas = Number(horasTexto);
    const minutos = Number(minutosTexto);
    if (!Number.isFinite(horas) || !Number.isFinite(minutos)) return 0;
    return horas * 60 + minutos;
  }

  const numero = Number(texto.replace(",", "."));
  if (!Number.isFinite(numero)) return 0;
  return Math.round(numero * 60);
};

const formatearMinutos = (totalMinutos) => {
  const minutosNumero = Math.round(Number(totalMinutos) || 0);
  const signo = minutosNumero < 0 ? "-" : "";
  const minutosAbs = Math.abs(minutosNumero);
  const horas = Math.floor(minutosAbs / 60);
  const minutos = minutosAbs % 60;
  return `${signo}${horas}:${String(minutos).padStart(2, "0")}`;
};

const formatearHoras = (valor) => formatearMinutos(parseHorasToMinutes(valor));

const calcularEstadoDeuda = (minutosDeuda) => {
  if (minutosDeuda > 0) return "En Deuda";
  return "Al día";
};

const claseEstadoDeuda = (minutosDeuda) => {
  if (minutosDeuda > 0) return "bg-red-100 text-red-700";
  return "bg-green-100 text-green-700";
};

const getInputDebtStyle = (valorActualMin, maxMin) => {
  if (maxMin <= 0) return {};

  const porcentaje = Math.max(
    0,
    Math.min(100, (valorActualMin / maxMin) * 100),
  );

  return {
    backgroundImage: `linear-gradient(to right, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0.18) ${porcentaje}%, rgba(249,250,251,1) ${porcentaje}%, rgba(249,250,251,1) 100%)`,
  };
};

const AprobarLiquidacion = ({
  usuario,
  alVolver,
  alLiquidarCorrectamente = null,
}) => {
  const { userId } = useAuth();

  const usuarioId =
    usuario?.usuario_id ?? usuario?.usuario?.id ?? usuario?.id ?? null;

  const sedeId = usuario?.sede_id ?? usuario?.sede?.id ?? null;

  const nombreUsuario =
    usuario?.usuario?.name || usuario?.name || "Empleado sin nombre";
  const nombreSede = usuario?.sede?.nombre || usuario?.sede || "Sin sede";

  const [cargandoResumen, setCargandoResumen] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [resumen, setResumen] = useState(null);

  const hoy = dayjs().format("YYYY-MM-DD");

  const [fechaLiquidacion, setFechaLiquidacion] = useState(hoy);
  const [fechaPago, setFechaPago] = useState(hoy);

  const [tipoLiquidacion, setTipoLiquidacion] = useState("normal");
  const [subtipoAdelanto, setSubtipoAdelanto] = useState("horas_trabajadas");

  const [observacion, setObservacion] = useState("");
  const [descuentoHoras, setDescuentoHoras] = useState("");
  const [descuentoMinutos, setDescuentoMinutos] = useState("");

  const [adelantoHoras, setAdelantoHoras] = useState("");
  const [adelantoMinutos, setAdelantoMinutos] = useState("");

  const [seleccionadas, setSeleccionadas] = useState({});
  const [cuentaBancariaUsuario, setCuentaBancariaUsuario] = useState(null);
  const [modalDetalleCuentaAbierto, setModalDetalleCuentaAbierto] =
    useState(false);
  const [verHistorial, setVerHistorial] = useState(false);
  const [verMarcaciones, setVerMarcaciones] = useState(false);

  const [filtroFechas, setFiltroFechas] = useState({ desde: "", hasta: "" });

  const esAdelanto = tipoLiquidacion === "adelanto";
  const esAdelantoHorasFuturas =
    esAdelanto && subtipoAdelanto === "horas_futuras";

  const cargarResumen = async () => {
    if (!usuarioId || !sedeId) return;

    try {
      setCargandoResumen(true);
      setError("");

      const [respResumen, respCtaBancaria] = await Promise.all([
        axios.get(`${API_URL}/rrhh/liquidaciones/resumen/${usuarioId}`, {
          params: { sede_id: sedeId },
        }),
        axios.get(`${API_URL}/rrhh/cuentas-bancarias`, {
          params: { idUsuario: usuarioId },
        }),
      ]);

      const filtrarCtaPrincipal = respCtaBancaria.data?.filter(
        (c) => c.es_principal == 1,
      );

      setCuentaBancariaUsuario(filtrarCtaPrincipal?.[0] || null);
      setResumen(respResumen.data);

      const seleccionInicial = {};
      (respResumen.data?.marcaciones || []).forEach((m) => {
        seleccionInicial[m.id] = false;
      });

      setSeleccionadas(seleccionInicial);
      setFiltroFechas({ desde: "", hasta: "" });
      setDescuentoHoras("");
      setDescuentoMinutos("");
      setAdelantoHoras("");
      setAdelantoMinutos("");
      setObservacion("");
    } catch (err) {
      console.error("ERROR RESUMEN:", err);
      setError(
        err?.response?.data?.message ||
          "No se pudo obtener el resumen de liquidación.",
      );
    } finally {
      setCargandoResumen(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, [usuarioId, sedeId]);

  useEffect(() => {
    if (esAdelantoHorasFuturas) {
      const nuevo = {};
      (resumen?.marcaciones || []).forEach((m) => {
        nuevo[m.id] = false;
      });
      setSeleccionadas(nuevo);
      setFiltroFechas({ desde: "", hasta: "" });
      setDescuentoHoras("");
      setDescuentoMinutos("");
    } else {
      setAdelantoHoras("");
      setAdelantoMinutos("");
    }
  }, [tipoLiquidacion, subtipoAdelanto, resumen, esAdelantoHorasFuturas]);

  const actualizarFechasPorSeleccion = (seleccionActual) => {
    if (!resumen?.marcaciones || esAdelantoHorasFuturas) return;

    const seleccionados = resumen.marcaciones.filter(
      (m) => seleccionActual[m.id],
    );

    if (seleccionados.length === 0) {
      setFiltroFechas({ desde: "", hasta: "" });
      return;
    }

    let minD = dayjs(seleccionados[0].fecha);
    let maxD = dayjs(seleccionados[0].fecha);

    seleccionados.forEach((m) => {
      const d = dayjs(m.fecha);
      if (d.isBefore(minD)) minD = d;
      if (d.isAfter(maxD)) maxD = d;
    });

    setFiltroFechas({
      desde: minD.format("YYYY-MM-DD"),
      hasta: maxD.format("YYYY-MM-DD"),
    });
  };

  const actualizarSeleccionPorFechas = (desde, hasta) => {
    if (!resumen?.marcaciones || !desde || !hasta || esAdelantoHorasFuturas) {
      return;
    }

    setSeleccionadas((prev) => {
      const nueva = { ...prev };
      resumen.marcaciones.forEach((m) => {
        const enRango = dayjs(m.fecha).isBetween(desde, hasta, "day", "[]");
        nueva[m.id] = enRango;
      });
      return nueva;
    });
  };

  const handleCambioDesde = (e) => {
    const nuevoDesde = e.target.value;
    if (filtroFechas.hasta && nuevoDesde > filtroFechas.hasta) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "La fecha 'Desde' no puede ser mayor a la fecha 'Hasta'.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setFiltroFechas((prev) => ({ ...prev, desde: nuevoDesde }));

    if (filtroFechas.hasta) {
      actualizarSeleccionPorFechas(nuevoDesde, filtroFechas.hasta);
    }
  };

  const handleCambioHasta = (e) => {
    const nuevoHasta = e.target.value;
    if (filtroFechas.desde && nuevoHasta < filtroFechas.desde) {
      Swal.fire({
        icon: "warning",
        title: "Fecha inválida",
        text: "La fecha 'Hasta' no puede ser menor a la fecha 'Desde'.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setFiltroFechas((prev) => ({ ...prev, hasta: nuevoHasta }));

    if (filtroFechas.desde) {
      actualizarSeleccionPorFechas(filtroFechas.desde, nuevoHasta);
    }
  };

  const seleccionarMesAnterior = () => {
    if (esAdelantoHorasFuturas) return;
    const desde = dayjs()
      .subtract(1, "month")
      .startOf("month")
      .format("YYYY-MM-DD");
    const hasta = dayjs()
      .subtract(1, "month")
      .endOf("month")
      .format("YYYY-MM-DD");
    setFiltroFechas({ desde, hasta });
    actualizarSeleccionPorFechas(desde, hasta);
  };

  const seleccionarMesActual = () => {
    if (esAdelantoHorasFuturas) return;
    const desde = dayjs().startOf("month").format("YYYY-MM-DD");
    const hasta = dayjs().endOf("month").format("YYYY-MM-DD");
    setFiltroFechas({ desde, hasta });
    actualizarSeleccionPorFechas(desde, hasta);
  };

  const tieneMarcacionesMesAnterior = useMemo(() => {
    if (!resumen?.marcaciones) return false;
    const inicioMes = dayjs().subtract(1, "month").startOf("month");
    const finMes = dayjs().subtract(1, "month").endOf("month");

    return resumen.marcaciones.some((m) =>
      dayjs(m.fecha).isBetween(inicioMes, finMes, "day", "[]"),
    );
  }, [resumen?.marcaciones]);

  const tieneMarcacionesMesActual = useMemo(() => {
    if (!resumen?.marcaciones) return false;
    const inicioMes = dayjs().startOf("month");
    const finMes = dayjs().endOf("month");

    return resumen.marcaciones.some((m) =>
      dayjs(m.fecha).isBetween(inicioMes, finMes, "day", "[]"),
    );
  }, [resumen?.marcaciones]);

  const esMesActual =
    filtroFechas.desde === dayjs().startOf("month").format("YYYY-MM-DD") &&
    filtroFechas.hasta === dayjs().endOf("month").format("YYYY-MM-DD");

  const esMesAnterior =
    filtroFechas.desde ===
      dayjs().subtract(1, "month").startOf("month").format("YYYY-MM-DD") &&
    filtroFechas.hasta ===
      dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD");

  const marcacionesSeleccionadas = useMemo(() => {
    return (resumen?.marcaciones || []).filter((m) => seleccionadas[m.id]);
  }, [resumen, seleccionadas]);

  const minutosSeleccionados = useMemo(() => {
    return marcacionesSeleccionadas.reduce(
      (acc, item) => acc + parseHorasToMinutes(item.horas_totales),
      0,
    );
  }, [marcacionesSeleccionadas]);

  const minutosAdelanto = useMemo(() => {
    const horas = Math.max(0, Math.floor(Number(adelantoHoras || 0) || 0));
    const minutos = Math.min(
      59,
      Math.max(0, Math.floor(Number(adelantoMinutos || 0) || 0)),
    );
    return horas * 60 + minutos;
  }, [adelantoHoras, adelantoMinutos]);

  const minutosDescontados = useMemo(() => {
    const horas = Math.max(0, Math.floor(Number(descuentoHoras || 0) || 0));
    const minutos = Math.min(
      59,
      Math.max(0, Math.floor(Number(descuentoMinutos || 0) || 0)),
    );
    return horas * 60 + minutos;
  }, [descuentoHoras, descuentoMinutos]);

  const minutosDeudaAnterior = useMemo(
    () => parseHorasToMinutes(resumen?.saldo_adelantos_previos),
    [resumen?.saldo_adelantos_previos],
  );

  const empleadoDebeHoras = minutosDeudaAnterior > 0;

  // Calculamos cuanta deuda podemos descontarle en esta liquidación
  const deudaACobrarEnEstePeriodo = Math.min(
    minutosDeudaAnterior,
    minutosSeleccionados,
  );

  // Cuanto le podemos descontar manualmente sin quedar en negativo
  const maxDescuentoManualPermitido = Math.max(
    0,
    minutosSeleccionados - deudaACobrarEnEstePeriodo,
  );

  const totalALiquidarMinutos = useMemo(() => {
    if (esAdelantoHorasFuturas) return minutosAdelanto;
    return Math.max(
      0,
      minutosSeleccionados - deudaACobrarEnEstePeriodo - minutosDescontados,
    );
  }, [
    esAdelantoHorasFuturas,
    minutosAdelanto,
    minutosSeleccionados,
    deudaACobrarEnEstePeriodo,
    minutosDescontados,
  ]);

  const totalRestanteMinutos = useMemo(() => {
    const horasPeriodoMinutos = parseHorasToMinutes(
      resumen?.horas_trabajadas_periodo,
    );
    return Math.max(0, horasPeriodoMinutos - minutosSeleccionados);
  }, [resumen?.horas_trabajadas_periodo, minutosSeleccionados]);

  const deudaProyectadaMinutos = useMemo(() => {
    if (esAdelantoHorasFuturas) {
      // Sumamos la nueva deuda
      return minutosDeudaAnterior + minutosAdelanto;
    }
    // Restamos lo que ya le estamos cobrando ahora
    return minutosDeudaAnterior - deudaACobrarEnEstePeriodo;
  }, [
    esAdelantoHorasFuturas,
    minutosDeudaAnterior,
    deudaACobrarEnEstePeriodo,
    minutosAdelanto,
  ]);

  const setDescuentoDesdeMinutos = (totalMinutos, limpiarSiEsCero = false) => {
    const minutos = Math.max(0, Math.floor(Number(totalMinutos) || 0));

    if (minutos === 0 && limpiarSiEsCero) {
      setDescuentoHoras("");
      setDescuentoMinutos("");
      return;
    }

    const horas = Math.floor(minutos / 60);
    const restoMinutos = minutos % 60;
    setDescuentoHoras(String(horas));
    setDescuentoMinutos(String(restoMinutos).padStart(2, "0"));
  };

  useEffect(() => {
    if (esAdelantoHorasFuturas) return;

    if (maxDescuentoManualPermitido <= 0) {
      setDescuentoDesdeMinutos(0, true);
      return;
    }

    if (minutosDescontados > maxDescuentoManualPermitido) {
      setDescuentoDesdeMinutos(maxDescuentoManualPermitido);
    }
  }, [maxDescuentoManualPermitido, minutosDescontados, esAdelantoHorasFuturas]);

  const handleCambioDescuentoHoras = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val === "") {
      setDescuentoHoras("");
      return;
    }

    const horas = Number(val);
    if (!Number.isFinite(horas)) return;

    const minutosActuales = Math.min(
      59,
      Math.max(0, Math.floor(Number(descuentoMinutos || 0) || 0)),
    );

    if (horas * 60 + minutosActuales > maxDescuentoManualPermitido) {
      setDescuentoDesdeMinutos(maxDescuentoManualPermitido);
      return;
    }

    setDescuentoHoras(String(horas));
  };

  const handleCambioDescuentoMinutos = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (val === "") {
      setDescuentoMinutos("");
      return;
    }

    const minutos = Math.min(59, Number(val));
    if (!Number.isFinite(minutos)) return;

    const horas = Math.max(0, Math.floor(Number(descuentoHoras || 0) || 0));

    if (horas * 60 + minutos > maxDescuentoManualPermitido) {
      setDescuentoDesdeMinutos(maxDescuentoManualPermitido);
      return;
    }

    setDescuentoMinutos(String(minutos));
  };

  const handleBlurDescuentoMinutos = () => {
    if (descuentoMinutos === "") return;
    const minutos = Math.min(
      59,
      Math.max(0, Math.floor(Number(descuentoMinutos) || 0)),
    );
    setDescuentoMinutos(String(minutos).padStart(2, "0"));
  };

  const handleCambioAdelantoHoras = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setAdelantoHoras(val);
  };

  const handleCambioAdelantoMinutos = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (val === "") {
      setAdelantoMinutos("");
      return;
    }

    const minutos = Math.min(59, Number(val));
    setAdelantoMinutos(String(minutos));
  };

  const handleBlurAdelantoMinutos = () => {
    if (adelantoMinutos === "") return;
    const minutos = Math.min(
      59,
      Math.max(0, Math.floor(Number(adelantoMinutos) || 0)),
    );
    setAdelantoMinutos(String(minutos).padStart(2, "0"));
  };

  const toggleFila = (id) => {
    if (esAdelantoHorasFuturas) return;

    setSeleccionadas((prev) => {
      const nueva = { ...prev, [id]: !prev[id] };
      actualizarFechasPorSeleccion(nueva);
      return nueva;
    });
  };

  const seleccionarTodas = () => {
    if (esAdelantoHorasFuturas) return;

    const nuevo = {};
    (resumen?.marcaciones || []).forEach((m) => {
      nuevo[m.id] = true;
    });
    setSeleccionadas(nuevo);
    actualizarFechasPorSeleccion(nuevo);
  };

  const limpiarSeleccion = () => {
    const nuevo = {};
    (resumen?.marcaciones || []).forEach((m) => {
      nuevo[m.id] = false;
    });
    setSeleccionadas(nuevo);
    setFiltroFechas({ desde: "", hasta: "" });
  };

  const confirmarLiquidacion = async () => {
    if (!resumen) return;

    const marcacion_ids = marcacionesSeleccionadas.map((m) => m.id);

    if (!esAdelantoHorasFuturas && marcacion_ids.length === 0) {
      setError("Debés seleccionar al menos una marcación para liquidar.");
      return;
    }

    if (esAdelantoHorasFuturas && minutosAdelanto <= 0) {
      setError("Debés cargar las horas del adelanto futuro.");
      return;
    }

    const htmlConfirmacion = `
      <div style="text-align:left; font-size:14px">
        <p><b>Empleado:</b> ${nombreUsuario}</p>
        <p><b>Sede:</b> ${nombreSede}</p>
        <hr/>
        <p><b>Tipo:</b> ${
          tipoLiquidacion === "normal"
            ? "Pago normal"
            : subtipoAdelanto === "horas_futuras"
              ? "Adelanto de horas futuras"
              : "Adelanto de horas ya trabajadas"
        }</p>

        <p><b>Período:</b></p>
        <p>Desde: ${formatearFecha(resumen.fecha_desde_sugerida)}</p>
        <p>Hasta: ${formatearFecha(resumen.fecha_hasta_sugerida)}</p>

        <hr/>
        <p style="color:#ea580c"><b>Deuda Actual:</b> ${formatearHoras(resumen.saldo_adelantos_previos)}</p>

        ${
          esAdelantoHorasFuturas
            ? `<p><b>Horas que prestaremos hoy:</b> ${formatearMinutos(minutosAdelanto)}</p>`
            : `
              <p><b>Horas seleccionadas:</b> ${formatearMinutos(minutosSeleccionados)}</p>
              ${
                deudaACobrarEnEstePeriodo > 0
                  ? `<p style="color:#ea580c"><b>Descuento deuda previa:</b> -${formatearMinutos(deudaACobrarEnEstePeriodo)}</p>`
                  : ""
              }
              ${
                minutosDescontados > 0
                  ? `<p style="color:#dc2626"><b>Descuentos manuales:</b> -${formatearMinutos(minutosDescontados)}</p>`
                  : ""
              }
              <p style="color:#16a34a; font-size: 16px;"><b>Total a Pagar (Liquidadas):</b> ${formatearMinutos(totalALiquidarMinutos)}</p>
              <p><b>Marcaciones seleccionadas:</b> ${marcacion_ids.length}</p>
            `
        }

        <p style="margin-top: 10px; border-top: 1px solid #ccc; padding-top: 10px;"><b>Nueva deuda del empleado:</b> ${formatearMinutos(deudaProyectadaMinutos)}</p>
        <hr/>
        <p><b>Fecha liquidación:</b> ${formatearFecha(fechaLiquidacion)}</p>
        ${observacion ? `<p><b>Observación:</b> ${observacion}</p>` : ""}
      </div>
    `;

    const confirmacion = await Swal.fire({
      icon: "warning",
      title: "¿Confirmar liquidación?",
      html: htmlConfirmacion,
      showCancelButton: true,
      confirmButtonText: "Sí, liquidar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
    });

    if (!confirmacion.isConfirmed) return;

    try {
      setEnviando(true);
      setError("");

      const body = {
        usuario_id: usuarioId,
        sede_id: sedeId,
        fecha_desde: resumen.fecha_desde_sugerida,
        fecha_hasta: resumen.fecha_hasta_sugerida,
        fecha_liquidacion: fechaLiquidacion,
        tipo_liquidacion: tipoLiquidacion,
        fecha_pago: fechaPago || null,
        observacion: observacion?.trim() || null,
        cuenta_bancaria_id: null,
        liquidado_por: userId,
        subtipo_adelanto: esAdelanto ? subtipoAdelanto : null,
      };

      if (esAdelantoHorasFuturas) {
        body.horas_adelanto = Number((minutosAdelanto / 60).toFixed(2));
        body.horas_liquidadas = Number((minutosAdelanto / 60).toFixed(2));
        body.marcacion_ids = [];
        body.horas_descontadas = 0;
      } else {
        body.marcacion_ids = marcacion_ids;
        body.horas_descontadas = Number((minutosDescontados / 60).toFixed(2));
      }

      await axios.post(`${API_URL}/rrhh/liquidaciones`, body);

      await Swal.fire({
        icon: "success",
        title: "Liquidación registrada",
        text: "La liquidación fue creada correctamente.",
        confirmButtonColor: "#f97316",
      });

      const respuesta = await Swal.fire({
        icon: "question",
        title: "¿Deseás preparar otra liquidación?",
        showCancelButton: true,
        confirmButtonText: "Sí, preparar otra",
        cancelButtonText: "No, volver al listado",
      });

      if (!respuesta.isConfirmed && alLiquidarCorrectamente) {
        alLiquidarCorrectamente();
        return;
      }

      await cargarResumen();
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message || "No se pudo registrar la liquidación.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const estadoColores = (estado) => {
    switch (estado) {
      case "normal":
        return "inline-flex rounded-full px-2 py-1 bg-green-100 text-green-800 text-xs font-bold";
      case "extra":
        return "inline-flex rounded-full px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold";
      case "justificado":
        return "inline-flex rounded-full px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold";
      case "pendiente":
        return "inline-flex rounded-full px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold";
      default:
        return "inline-flex rounded-full px-2 py-1 bg-gray-100 text-gray-800 text-xs font-bold";
    }
  };

  if (verHistorial) {
    return (
      <Liquidaciones
        usuarioSeleccionado={usuario}
        volverAtras={() => setVerHistorial(false)}
      />
    );
  }

  if (verMarcaciones) {
    return (
      <HistorialMarcas
        usuario={usuario}
        volverAtras={() => setVerMarcaciones(false)}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <button
          onClick={alVolver}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:border-orange-500 hover:text-orange-600 hover:shadow-md group"
        >
          <FaArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" />
          Volver atrás
        </button>
        <div className="gap-4">
          <button
            onClick={() => setVerMarcaciones(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:border-orange-500 hover:text-orange-600 hover:shadow-md group mb-1"
          >
            <FaRegNewspaper className="transition-transform duration-200 group-hover:-translate-x-1" />
            Ver accesos
          </button>
          <button
            onClick={() => setVerHistorial(true)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-4 py-2 font-semibold text-gray-700 transition-all duration-200 hover:border-orange-500 hover:text-orange-600 hover:shadow-md group mb-1"
          >
            <FaRegNewspaper className="transition-transform duration-200 group-hover:-translate-x-1" />
            Ver historial
          </button>
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex">
          <h3 className="mb-3 flex items-center gap-2 text-xl font-bignoodle text-gray-800 sm:text-2xl">
            <FaFileAlt className="text-orange-500" />
            PREPARAR LIQUIDACIÓN
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Empleado
            </p>
            <p className="flex items-center gap-2 break-words font-semibold text-gray-800">
              <FaUser className="shrink-0 text-gray-400" />
              <span>{nombreUsuario}</span>
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500">
              Alias cta bancaria
              <button
                type="button"
                onClick={() => setModalDetalleCuentaAbierto(true)}
                className="inline-flex items-center rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-700 transition-all duration-200 hover:border-orange-300 hover:bg-orange-100 hover:shadow-sm"
              >
                Ver detalle
              </button>
            </p>
            <p className="flex items-center gap-2 break-words font-semibold text-gray-800">
              <FaUser className="shrink-0 text-gray-400" />
              <span>{cuentaBancariaUsuario?.alias || "No disponible"}</span>
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Sede
            </p>
            <p className="break-words font-semibold text-gray-800">
              {nombreSede}
            </p>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">
              Periodo sugerido
            </p>
            <p className="break-words font-semibold text-gray-800">
              {formatearFecha(resumen?.fecha_desde_sugerida)} al{" "}
              {formatearFecha(resumen?.fecha_hasta_sugerida)}
            </p>
          </div>
        </div>
      </div>

      {cargandoResumen ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Cargando resumen...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : !resumen ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No se encontró información para liquidar.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.6fr)_360px] 2xl:grid-cols-[minmax(0,1.8fr)_380px]">
          <div className="min-w-0 space-y-4">
            {empleadoDebeHoras && (
              <div className="rounded-2xl border border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-100 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-orange-500 p-2 text-white">
                    <FaExclamationTriangle />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                      Deuda Activa
                    </p>
                    <h4 className="mt-1 text-lg font-bold text-orange-900">
                      El empleado debe {formatearMinutos(minutosDeudaAnterior)}{" "}
                      al gimnasio
                    </h4>
                    <p className="mt-1 text-sm text-orange-800">
                      Este saldo se irá descontando automáticamente de las horas
                      que selecciones para liquidar.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Deuda anterior
                </p>
                <p className="mt-1 text-lg leading-none text-red-700 sm:text-xl font-bignoodle">
                  {formatearHoras(resumen.saldo_adelantos_previos)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Trabajadas del periodo
                </p>
                <p className="mt-1 text-lg leading-none text-gray-800 sm:text-xl font-bignoodle">
                  {formatearHoras(resumen.horas_trabajadas_periodo)}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  {esAdelantoHorasFuturas ? "Adelanto Nuevo" : "Seleccionadas"}
                </p>
                <p className="mt-1 text-lg leading-none text-orange-600 sm:text-xl font-bignoodle">
                  {formatearMinutos(
                    esAdelantoHorasFuturas
                      ? minutosAdelanto
                      : minutosSeleccionados,
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="text-[11px] uppercase tracking-wider text-gray-500">
                  Deuda proyectada
                </p>
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${claseEstadoDeuda(
                      deudaProyectadaMinutos,
                    )}`}
                  >
                    {calcularEstadoDeuda(deudaProyectadaMinutos)}
                  </span>
                </div>
                <p className="mt-2 text-base font-bignoodle text-gray-800">
                  {formatearMinutos(deudaProyectadaMinutos)}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-3 py-3 sm:px-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="flex items-center gap-2 text-sm font-bold text-gray-800 sm:text-base">
                      <FaHistory className="text-orange-500" />
                      DETALLE DE HORAS DEL PERÍODO
                    </h4>
                    <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                      {esAdelantoHorasFuturas
                        ? "Para adelanto de horas futuras no se seleccionan marcaciones."
                        : "Seleccioná las marcaciones que querés liquidar."}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={seleccionarTodas}
                      disabled={esAdelantoHorasFuturas}
                      className="rounded-lg bg-green-50 px-3 py-2 text-xs font-semibold text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Seleccionar todas
                    </button>
                    <button
                      onClick={limpiarSeleccion}
                      className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                      Desde
                    </label>
                    <input
                      type="date"
                      value={filtroFechas.desde}
                      max={filtroFechas.hasta || undefined}
                      onChange={handleCambioDesde}
                      disabled={esAdelantoHorasFuturas}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-gray-500">
                      Hasta
                    </label>
                    <input
                      type="date"
                      value={filtroFechas.hasta}
                      min={filtroFechas.desde || undefined}
                      onChange={handleCambioHasta}
                      disabled={esAdelantoHorasFuturas}
                      className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {tieneMarcacionesMesAnterior && (
                    <button
                      onClick={seleccionarMesAnterior}
                      disabled={esAdelantoHorasFuturas}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        esMesAnterior
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Mes anterior
                    </button>
                  )}

                  {tieneMarcacionesMesActual && (
                    <button
                      onClick={seleccionarMesActual}
                      disabled={esAdelantoHorasFuturas}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        esMesActual
                          ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Mes actual
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left">
                  <thead className="border-b border-gray-100 bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Sel.
                      </th>
                      <th className="px-3 py-3 font-bold sm:px-4">Fecha</th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Entrada
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Salida
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Hs
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Hs extras
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Hs descontadas
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Total
                      </th>
                      <th className="px-3 py-3 text-center font-bold sm:px-4">
                        Estado
                      </th>
                      <th className="px-3 py-3 font-bold sm:px-4">
                        Observación
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {resumen.marcaciones?.length > 0 ? (
                      resumen.marcaciones.map((item) => {
                        const activa = !!seleccionadas[item.id];

                        return (
                          <tr
                            key={item.id}
                            onClick={() => toggleFila(item.id)}
                            className={`transition-colors ${
                              esAdelantoHorasFuturas
                                ? "cursor-not-allowed bg-gray-50 opacity-60"
                                : activa
                                  ? "cursor-pointer bg-orange-50/40"
                                  : "cursor-pointer hover:bg-gray-50"
                            }`}
                          >
                            <td className="px-3 py-3 text-center sm:px-4">
                              <input
                                type="checkbox"
                                checked={activa}
                                readOnly
                                className="pointer-events-none h-4 w-4 accent-orange-500"
                              />
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm font-medium text-gray-800 sm:px-4">
                              {formatearFecha(item.fecha)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm text-gray-600 sm:px-4">
                              {item.hora_entrada
                                ? dayjs(item.hora_entrada).format("HH:mm")
                                : "-"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm text-gray-600 sm:px-4">
                              {item.hora_salida
                                ? dayjs(item.hora_salida).format("HH:mm")
                                : "-"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-semibold text-gray-800 sm:px-4">
                              {formatearHoras(item.horas_normales)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-semibold text-gray-800 sm:px-4">
                              {item.horas_extras === "0:00"
                                ? "-"
                                : formatearHoras(item.horas_extras)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-semibold text-gray-800 sm:px-4">
                              {item.horas_extras === "0:00"
                                ? "-"
                                : formatearHoras(item.horas_descuento)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-semibold text-gray-800 sm:px-4">
                              {formatearHoras(item.horas_totales)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-center text-sm font-semibold text-gray-800 sm:px-4">
                              <span
                                className={estadoColores(
                                  item.estado?.toLowerCase(),
                                )}
                              >
                                {item.estado?.toUpperCase() || "-"}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-sm text-gray-500 sm:px-4">
                              <div className="max-w-[280px] break-words lg:max-w-[360px] xl:max-w-[420px]">
                                {item.comentarios || "-"}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-6 text-center text-sm text-gray-400"
                        >
                          No hay marcaciones aprobadas pendientes para este
                          rango.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="self-start space-y-3 xl:sticky xl:top-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
              <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-gray-800 sm:text-lg">
                <FaClock className="text-green-500" />
                Confirmar liquidación
              </h4>

              <div className="space-y-3">
                <div className="hidden">
                  <input
                    type="date"
                    value={fechaLiquidacion}
                    onChange={(e) => setFechaLiquidacion(e.target.value)}
                  />
                </div>

                <div className="hidden">
                  <input
                    type="date"
                    value={fechaPago}
                    onChange={(e) => setFechaPago(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Tipo
                  </label>
                  <select
                    value={tipoLiquidacion}
                    onChange={(e) => setTipoLiquidacion(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-orange-500"
                  >
                    <option value="normal">Pago normal</option>
                    <option value="adelanto">Adelanto</option>
                  </select>
                </div>

                {esAdelanto && (
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Tipo de adelanto
                    </label>
                    <select
                      value={subtipoAdelanto}
                      onChange={(e) => setSubtipoAdelanto(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-orange-500"
                    >
                      <option value="horas_trabajadas">
                        Adelanto de horas ya trabajadas
                      </option>
                      <option value="horas_futuras">
                        Adelanto de horas futuras
                      </option>
                    </select>
                  </div>
                )}

                {esAdelantoHorasFuturas ? (
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Horas adelantadas
                    </label>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={adelantoHoras}
                        onChange={handleCambioAdelantoHoras}
                        placeholder="0"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-orange-500"
                      />
                      <span className="text-center text-sm font-bold text-gray-500">
                        :
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={adelantoMinutos}
                        onChange={handleCambioAdelantoMinutos}
                        onBlur={handleBlurAdelantoMinutos}
                        placeholder="00"
                        maxLength={2}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-orange-500"
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Cargá las horas que se adelantan aunque todavía no estén
                      trabajadas.
                    </p>

                    {empleadoDebeHoras && (
                      <p className="mt-1 text-[11px] font-semibold text-orange-700">
                        Deuda previa: {formatearMinutos(minutosDeudaAnterior)}.
                        Esto sumará a esa deuda.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                      Horas a descontar manualmente
                    </label>

                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={descuentoHoras}
                        onChange={handleCambioDescuentoHoras}
                        placeholder="0"
                        disabled={maxDescuentoManualPermitido <= 0}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <span className="text-center text-sm font-bold text-gray-500">
                        :
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={descuentoMinutos}
                        onChange={handleCambioDescuentoMinutos}
                        onBlur={handleBlurDescuentoMinutos}
                        placeholder="00"
                        maxLength={2}
                        disabled={maxDescuentoManualPermitido <= 0}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition-all focus:border-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Máximo a descontar manual:{" "}
                      {formatearMinutos(maxDescuentoManualPermitido)}
                    </p>

                    {deudaACobrarEnEstePeriodo > 0 && (
                      <p className="mt-1 text-[11px] font-semibold text-orange-700">
                        Se descontará automáticamente{" "}
                        {formatearMinutos(deudaACobrarEnEstePeriodo)} por deuda
                        anterior.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-400">
                    Observación
                  </label>
                  <textarea
                    rows={3}
                    value={observacion}
                    onChange={(e) => setObservacion(e.target.value)}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-orange-500"
                    placeholder="Ej: Pago parcial, adelanto solicitado, ajuste manual..."
                  />
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      Deuda anterior:
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold text-red-600">
                      {formatearHoras(resumen.saldo_adelantos_previos)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-500">
                      {esAdelantoHorasFuturas
                        ? "Nuevo Adelanto:"
                        : "Seleccionadas:"}
                    </span>
                    <span className="whitespace-nowrap text-sm font-bold text-gray-800">
                      {formatearMinutos(
                        esAdelantoHorasFuturas
                          ? minutosAdelanto
                          : minutosSeleccionados,
                      )}
                    </span>
                  </div>

                  {!esAdelantoHorasFuturas && deudaACobrarEnEstePeriodo > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-orange-500">
                        Descuento de Deuda:
                      </span>
                      <span className="whitespace-nowrap text-sm font-bold text-orange-600">
                        - {formatearMinutos(deudaACobrarEnEstePeriodo)}
                      </span>
                    </div>
                  )}

                  {!esAdelantoHorasFuturas && minutosDescontados > 0 && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-red-500">
                        Descuento Manual:
                      </span>
                      <span className="whitespace-nowrap text-sm font-bold text-red-600">
                        - {formatearMinutos(minutosDescontados)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 border-t border-dashed border-gray-100 pt-2">
                    <span className="text-sm font-bignoodle text-green-700 sm:text-base">
                      {esAdelantoHorasFuturas
                        ? "TOTAL A REGISTRAR"
                        : "TOTAL A LIQUIDAR (PAGAR)"}
                    </span>
                    <span className="whitespace-nowrap text-sm font-bignoodle text-green-700 sm:text-base">
                      {formatearMinutos(totalALiquidarMinutos)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-dashed border-gray-100 pt-2">
                    <span className="text-sm font-bignoodle text-orange-700 sm:text-base">
                      Total restante
                    </span>
                    <span className="whitespace-nowrap text-sm font-bignoodle text-orange-700 sm:text-base">
                      {formatearMinutos(totalRestanteMinutos)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={confirmarLiquidacion}
              disabled={
                enviando ||
                (minutosSeleccionados === 0 && !esAdelantoHorasFuturas) ||
                (esAdelantoHorasFuturas && minutosAdelanto === 0)
              }
            >
              <FaCheckCircle />
              {enviando ? "GUARDANDO..." : "CONFIRMAR LIQUIDACIÓN"}
            </button>
          </div>
        </div>
      )}

      <ModalAprobarLiquidacion
        abierto={modalDetalleCuentaAbierto}
        onClose={() => setModalDetalleCuentaAbierto(false)}
        cuentaBancaria={cuentaBancariaUsuario}
      />
    </div>
  );
};

export default AprobarLiquidacion;
