import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import useAgregarDatos from "../../hooks/agregarDatos";
import Swal from "sweetalert2";
import { useAuth } from "../../../../AuthContext";
import * as yup from "yup";
import { useSedeUsers } from "../../Context/SedeUsersContext"

const valoresIniciales = {
  fecha: "",
  motivo: "aclaracion",
  comentario: "",
};

const schemaAclaracion = yup.object({
  fecha: yup.string().required("La fecha de referencia es obligatoria"),
  motivo: yup.string().required("El motivo es obligatorio"),
  comentario: yup
    .string()
    .required("Debes explicar el motivo de la aclaración")
    .max(500, "El mensaje no puede superar los 500 caracteres"),
});

export const TIPOS_MENSAJE_EMPLEADO_OPTIONS = [
  { value: "aclaracion", label: "ACLARACIÓN GENERAL" },
  { value: "olvido_ingreso", label: "OLVIDO DE ENTRADA" },
  { value: "olvido_salida", label: "OLVIDO DE SALIDA" },
  { value: "hora_extra", label: "SOLICITUD HORA EXTRA" },
  { value: "inconveniente_acceso", label: "PROBLEMA DE ACCESO" },
  { value: "consulta", label: "CONSULTA PERSONAL" },
];

export const TIPOS_MENSAJE_RRHH_OPTIONS = [
  { value: "tu_cobro", label: "TU COBRO" },
  { value: "otras_consultas", label: "OTRAS CONSULTAS" },
];

const ModalNovedad = ({
  cerrarModal,
  diaSeleccionado,
  horarioSeleccionado,
  rol = "empleado",
  onVolverAListado,
}) => {
  const { sedeSeleccionada } = useSedeUsers();

  const { userId } = useAuth();
  const {
    agregar,
    cargando: cargandoEnvio,
  } = useAgregarDatos();

  const [datosFormulario, setDatosFormulario] = useState({
    fecha: valoresIniciales.fecha,
    motivo: valoresIniciales.motivo,
    comentario: valoresIniciales.comentario,
  });

  useEffect(() => {
    if (rol === "rrhh") {
    setDatosFormulario(prev => ({ ...prev, motivo: "tu_cobro" }));
    }
    if (diaSeleccionado) {
      setDatosFormulario((prev) => ({
        ...prev,
        fecha: diaSeleccionado,
      }));
    }
  }, [diaSeleccionado]);
  const [erroresFormulario, setErroresFormulario] = useState({});

  const manejarCambio = (event) => {
    const { name, value } = event.target;
    setDatosFormulario((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (erroresFormulario[name]) {
      setErroresFormulario((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const manejarEnviarMensaje = async () => {
    try {
      await schemaAclaracion.validate(datosFormulario, { abortEarly: false });
      setErroresFormulario({});

      const usuarioDestinoId = rol === "rrhh"
        ? Number(horarioSeleccionado?.usuario_id || 0)
        : Number(userId);
      const sedeDestinoId = rol === "rrhh"
        ? Number(horarioSeleccionado?.sede_id || 0)
        : Number(sedeSeleccionada?.id || 0);

      if (rol === "rrhh" && !usuarioDestinoId) {
        Swal.fire({
          title: "Empleado no seleccionado",
          text: "No se pudo identificar el empleado destinatario.",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
        return;
      }

      if (rol === "empleado" && !sedeSeleccionada){
        Swal.fire({
          title: "Sede no seleccionada",
          text: "No se ha podido identificar tu sede. Por favor, selecciona una sede antes de enviar la aclaración.",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
        return;
      }
      
      const cuerpoMensaje = {
        usuario_id: usuarioDestinoId,
        sede_id: sedeDestinoId || null,
        emisor_user_id: Number(userId),
        destinatario_tipo: rol === "empleado" ? "rrhh" : "usuario",
        tipo_mensaje: datosFormulario.motivo,
        mensaje: datosFormulario.comentario.trim(),
        fecha_referencia: datosFormulario.fecha,
        marcacion_id: rol === "rrhh" ? null : (horarioSeleccionado?.id || null),
      };

      const endpointEnvio = rol === "rrhh" ? "/rrhh-mensajes-admin" : "/rrhh-mensajes";

      await agregar(endpointEnvio, cuerpoMensaje);

      Swal.fire({
        title: "Mensaje Enviado",
        text: "Tu aclaración ha sido enviada " + (rol === "empleado" ? "a RRHH" : "al empleado") + " correctamente.",
        icon: "success",
        confirmButtonText: "Entendido",
      });
      
      cerrarModal();
    } catch (err) {
      if (err.inner) {
        const erroresValidacion = {};
        err.inner.forEach((error) => {
          erroresValidacion[error.path] = error.message;
        });
        setErroresFormulario(erroresValidacion);
      } else {
        console.error(err);
        Swal.fire({
          title: "Error al enviar",
          text: "No se pudo enviar el mensaje. Intenta nuevamente.",
          icon: "error",
          confirmButtonText: "Cerrar",
        });
      }
    }
  };

  const manejarSubmit = (event) => {
    event.preventDefault();
    manejarEnviarMensaje();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="bg-orange-600 p-4 flex justify-between items-center">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg font-bignoodle tracking-wide uppercase">
              Ticke's de consulta
            </h3>
            {rol === "rrhh" && horarioSeleccionado?.usuario?.name && (
              <p className="text-xs text-orange-100 truncate">
                Empleado: {horarioSeleccionado.usuario.name}
              </p>
            )}
          </div>
          <button
            onClick={cerrarModal}
            className="text-white/80 hover:text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={manejarSubmit}>
          {rol === "rrhh" && onVolverAListado && (
            <button
              type="button"
              onClick={onVolverAListado}
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              <FaArrowLeft size={14} />
              Volver al listado
            </button>
          )}

          {rol === "empleado" && (          <p className="text-sm text-gray-500 mb-4">
            Utiliza este medio para informar cualquier novedad sobre tus marcaciones, horas extras o consultas generales.
          </p>)
          }


          <div className={`grid ${rol === "empleado" ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            {rol === "empleado" && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Fecha del Suceso
              </label>
              <input
                type="date"
                name="fecha"
                value={datosFormulario.fecha}
                onChange={manejarCambio}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-orange-500 outline-none"
                disabled={diaSeleccionado}
              />
              {erroresFormulario.fecha && (
                <p className="text-xs text-red-600 mt-1">
                  {erroresFormulario.fecha}
                </p>
              )}
            </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
                Tipo de Aclaración
              </label>
              <select
                name="motivo"
                value={datosFormulario.motivo}
                onChange={manejarCambio}
                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-orange-500 outline-none"
              >
                {rol === "empleado" ? (
                TIPOS_MENSAJE_EMPLEADO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))
                ):
                TIPOS_MENSAJE_RRHH_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Explicación
            </label>
            <textarea
              name="comentario"
              value={datosFormulario.comentario}
              onChange={manejarCambio}
              placeholder={rol === "empleado" ? "Describe detalladamente tu situación o consulta para que RRHH pueda ayudarte..." : "Escribe tu mensaje..."}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-orange-500 outline-none resize-none"
            ></textarea>
            {erroresFormulario.comentario && (
              <p className="text-xs text-red-600 mt-1">
                {erroresFormulario.comentario}
              </p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={cargandoEnvio}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors uppercase tracking-wider"
            >
              {cargandoEnvio ? "Enviando Mensaje..." : "Enviar Aclaración"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovedad;