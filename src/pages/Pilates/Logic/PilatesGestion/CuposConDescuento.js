/* Autor: Sergio Manrique
Fecha de creación: 23-12-2025
*/
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import * as yup from "yup";
import { HOURS } from "../../Constants/constanst";
import { useAuth } from "../../../../AuthContext";

// URL BASE DEL BACKEND
const API_URL = "http://localhost:8080/pilates-cupos-descuentos";

const useCuposConDescuento = ({
  sedeActualFiltro,
  maximaCapacidad,
  refrescarHorarios,
  horariosDeshabilitados = [],
}) => {
  // Contexto de usuario
  const { user } = useAuth();
  const usuario_id = user ? user.id : null;

  // Estados para datos y carga
  const [listaDescuentos, setListaDescuentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingGuardar, setLoadingGuardar] = useState(false);

  // Estados para edición y selección
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Estado del formulario de descuento
  const [formulario, setFormulario] = useState({
    horario: "",
    cantidadCupos: "",
    valorDescuento: "",
    fechaInicio: new Date(),
    fechaVencimiento: null,
  });

  const [errores, setErrores] = useState({});

  // Esquema de validación para el formulario
  const descuentoSchema = useMemo(() => {
    return yup.object().shape({
      plan: yup.string().required("Selecciona un grupo de horarios"),
      horario: yup.string().required("Selecciona un horario de la grilla"),
      cantidadCupos: yup
        .number()
        .transform((value, originalValue) =>
          originalValue === "" ? undefined : value
        )
        .typeError("Debe ser un número")
        .min(1, "Mínimo 1 cupo")
        .max(
          maximaCapacidad,
          `No puedes superar la capacidad de la sede (${maximaCapacidad})`
        )
        .required("Ingresa la cantidad de cupos"),
      valorDescuento: yup
        .string()
        .required("Ingresa el porcentaje")
        .test("is-valid-percentage", "Porcentaje inválido", (value) => {
          if (!value) return false;
          const num = parseFloat(value.replace(",", "."));
          return !isNaN(num) && num >= 0 && num <= 100;
        }),
      fechaInicio: yup
        .date()
        .nullable()
        .required("Selecciona la fecha de inicio")
        .typeError("Fecha inválida"),
      fechaVencimiento: yup
        .date()
        .nullable()
        .required("Selecciona la fecha de vencimiento")
        .min(
          yup.ref("fechaInicio"),
          "El vencimiento debe ser posterior al inicio"
        )
        .typeError("Fecha inválida"),
    });
  }, [maximaCapacidad]);

  // Trae los descuentos desde el backend
  const cargarDescuentos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(API_URL, {
        params: { sede_id: sedeActualFiltro },
      });

      const datos = Array.isArray(response.data)
        ? response.data
        : response.data.data || [];

      // Formatea los datos para mostrarlos en el frontend
      const formateados = datos.map((item) => ({
        id: item.id,
        plan: item.grupo_dias,
        horario: item.hora,
        cantidadCupos: item.cantidad_cupos,
        valorDescuentoOriginal: item.porcentaje_descuento,
        valorDescuentoMostrar: `${parseFloat(item.porcentaje_descuento)}%`,
        fechaInicio: item.fecha_inicio,
        fechaVencimiento: item.fecha_fin,
        creadoPor: item.creado_por,
        createdAt: item.created_at,
        estado: item.estado,
      }));

      setListaDescuentos(formateados);
    } catch (error) {
      console.error("Error cargando descuentos:", error);
      setError("No se pudieron cargar los descuentos existentes.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los descuentos existentes.",
        confirmButtonColor: "#ea580c",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carga los datos cuando cambia la sede
  useEffect(() => {
    cargarDescuentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sedeActualFiltro]);

  // Filtra los horarios disponibles según bloqueos
  useEffect(() => {
    if (!planSeleccionado) {
      setHorariosDisponibles([]);
      return;
    }

    const horasBase = [...HOURS];

    const horasFiltradas = horasBase.filter((horaLabel) => {
      const estaDeshabilitado = horariosDeshabilitados?.some(
        (deshabilitado) => {
          const mismaHora = deshabilitado.hora_label === horaLabel;
          if (planSeleccionado === "L-M-V") {
            return (
              mismaHora &&
              (deshabilitado.tipo_bloqueo === "lmv" ||
                deshabilitado.tipo_bloqueo === "todos")
            );
          }
          if (planSeleccionado === "M-J") {
            return (
              mismaHora &&
              (deshabilitado.tipo_bloqueo === "mj" ||
                deshabilitado.tipo_bloqueo === "todos")
            );
          }
          return false;
        }
      );
      return !estaDeshabilitado;
    });

    setHorariosDisponibles(horasFiltradas);

    // Si el horario seleccionado ya no es válido, lo limpia
    if (
      !modoEdicion &&
      formulario.horario &&
      !horasFiltradas.includes(formulario.horario)
    ) {
      setFormulario((prev) => ({ ...prev, horario: "" }));
    }
  }, [
    planSeleccionado,
    horariosDeshabilitados,
    formulario.horario,
    modoEdicion,
  ]);

  // --- Handlers del formulario ---

  const seleccionarPlan = (plan) => {
    setPlanSeleccionado(plan);
    if (errores.plan) setErrores({ ...errores, plan: null });
  };

  const seleccionarHorario = (hora) => {
    setFormulario({ ...formulario, horario: hora });
    if (errores.horario) setErrores({ ...errores, horario: null });
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (errores[name]) setErrores({ ...errores, [name]: null });
  };

  // Handler para el campo de porcentaje
  const handlePorcentajeChange = (e) => {
    let value = e.target.value;
    if (!/^[0-9,]*$/.test(value)) return;
    if ((value.match(/,/g) || []).length > 1) return;
    if (value.includes(",")) {
      const parts = value.split(",");
      if (parts[1].length > 2) return;
    }
    value = value.replace(/^0{3,}/, "00");
    const numericValue = parseFloat(value.replace(",", "."));
    if (!isNaN(numericValue) && numericValue > 100) return;

    setFormulario({ ...formulario, valorDescuento: value });
    if (errores.valorDescuento)
      setErrores({ ...errores, valorDescuento: null });
  };

  const manejarFechaInicio = (date) => {
    setFormulario({ ...formulario, fechaInicio: date });
    if (errores.fechaInicio) setErrores({ ...errores, fechaInicio: null });
  };

  const manejarFechaVencimiento = (date) => {
    setFormulario({ ...formulario, fechaVencimiento: date });
    if (errores.fechaVencimiento)
      setErrores({ ...errores, fechaVencimiento: null });
  };

  // --- Acciones principales: Guardar, Editar, Eliminar ---

  const iniciarEdicion = (item) => {
    setModoEdicion(true);
    setIdEdicion(item.id);
    setPlanSeleccionado(item.plan);

    const parseFecha = (fechaStr) => {
      if (!fechaStr) return null;
      const cleanDate = fechaStr.split("T")[0];
      const [y, m, d] = cleanDate.split("-");
      return new Date(y, m - 1, d);
    };

    setFormulario({
      horario: item.horario,
      cantidadCupos: item.cantidadCupos,
      valorDescuento: parseFloat(item.valorDescuentoOriginal)
        .toString()
        .replace(".", ","),
      fechaInicio: parseFecha(item.fechaInicio),
      fechaVencimiento: parseFecha(item.fechaVencimiento),
    });

    // Lleva el scroll arriba al editar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setFormulario({
      horario: "",
      cantidadCupos: "",
      valorDescuento: "",
      fechaInicio: new Date(),
      fechaVencimiento: null,
    });
    setErrores({});
  };

  // Guarda o actualiza una regla de descuento
  const guardarRegla = async (e) => {
    e.preventDefault();

    const datosAValidar = {
      ...formulario,
      plan: planSeleccionado,
    };

    try {
      await descuentoSchema.validate(datosAValidar, { abortEarly: false });
      setLoadingGuardar(true);

      const payload = {
        sede_id: sedeActualFiltro,
        creado_por: usuario_id,
        hora: formulario.horario,
        grupo_dias: planSeleccionado,
        cantidad_cupos: formulario.cantidadCupos,
        valor_descuento: formulario.valorDescuento,
        fecha_inicio: formulario.fechaInicio,
        fecha_fin: formulario.fechaVencimiento,
      };

      let response;
      if (modoEdicion) {
        response = await axios.put(`${API_URL}/${idEdicion}`, payload);
      } else {
        response = await axios.post(API_URL, payload);
      }

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          icon: "success",
          title: modoEdicion ? "¡Actualizado!" : "¡Guardado!",
          text: modoEdicion
            ? "El descuento ha sido modificado."
            : "La regla de descuento se ha creado.",
          timer: 1500,
          showConfirmButton: false,
        });

        cargarDescuentos();
        cancelarEdicion();
      }
    } catch (err) {
      if (err.inner) {
        const nuevosErrores = {};
        err.inner.forEach((error) => {
          nuevosErrores[error.path] = error.message;
        });
        setErrores(nuevosErrores);
      } else {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            err.response?.data?.mensajeError ||
            "Ocurrió un error al procesar la solicitud.",
          confirmButtonColor: "#ea580c",
        });
      }
    } finally {
      setLoadingGuardar(false);
      refrescarHorarios();
    }
  };

  // Elimina una regla de descuento
  const eliminarDescuento = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar regla?",
      text: "Esta acción quitará el descuento para futuros inscriptos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea580c",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          timer: 1000,
          showConfirmButton: false,
        });
        setListaDescuentos(listaDescuentos.filter((item) => item.id !== id));
        if (modoEdicion && idEdicion === id) cancelarEdicion();
      } catch (error) {
        Swal.fire({ icon: "error", title: "Error al eliminar" });
      }
    }
  };

  // --- Helpers de formato de fechas ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const cleanDate = dateStr.split("T")[0];
    const [y, m, d] = cleanDate.split("-");
    return `${d}/${m}/${y}`;
  };

  const formatDateTime = (isoDate) => {
    if (!isoDate) return "-";
    const date = new Date(isoDate);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // Listas filtradas para mostrar en la vista
  const descuentosTodos = useMemo(
    () => listaDescuentos.filter((d) => d.plan === "Todos"),
    [listaDescuentos]
  );
  const descuentosLMV = useMemo(
    () => listaDescuentos.filter((d) => d.plan === "L-M-V"),
    [listaDescuentos]
  );
  const descuentosMJ = useMemo(
    () => listaDescuentos.filter((d) => d.plan === "M-J"),
    [listaDescuentos]
  );

  return {
    // Estados
    loading,
    error,
    loadingGuardar,
    modoEdicion,
    idEdicion,
    planSeleccionado,
    horariosDisponibles,
    formulario,
    errores,
    listaDescuentos,
    
    // Listas agrupadas
    descuentosTodos,
    descuentosLMV,
    descuentosMJ,

    // Acciones
    seleccionarPlan,
    seleccionarHorario,
    manejarCambio,
    handlePorcentajeChange,
    manejarFechaInicio,
    manejarFechaVencimiento,
    guardarRegla,
    iniciarEdicion,
    cancelarEdicion,
    eliminarDescuento,

    // Helpers
    formatDate,
    formatDateTime
  };
};

export default useCuposConDescuento;