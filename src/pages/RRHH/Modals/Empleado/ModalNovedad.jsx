import { FaTimes } from "react-icons/fa";
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

const ModalNovedad = ({ cerrarModal, diaSeleccionado, horarioSeleccionado }) => {
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

  console.log(horarioSeleccionado)

  const manejarEnviarMensaje = async () => {
    try {
      await schemaAclaracion.validate(datosFormulario, { abortEarly: false });
      setErroresFormulario({});

      if (!sedeSeleccionada){
        Swal.fire({
          title: "Sede no seleccionada",
          text: "No se ha podido identificar tu sede. Por favor, selecciona una sede antes de enviar la aclaración.",
          icon: "warning",
          confirmButtonText: "Entendido",
        });
        return;
      }
      
      const cuerpoMensaje = {
        usuario_id: Number(userId), 
        sede_id: sedeSeleccionada ? Number(sedeSeleccionada.id) : null,
        emisor_user_id: Number(userId),
        destinatario_tipo: "rrhh",
        tipo_mensaje: datosFormulario.motivo,
        mensaje: datosFormulario.comentario.trim(),
        fecha_referencia: datosFormulario.fecha,
        marcacion_id: horarioSeleccionado?.id || null,
      };

      await agregar("/rrhh-mensajes", cuerpoMensaje);

      Swal.fire({
        title: "Mensaje Enviado",
        text: "Tu aclaración ha sido enviada a RRHH correctamente.",
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
          <h3 className="text-white font-bold text-lg font-bignoodle tracking-wide uppercase">
            Enviar Aclaración a RRHH
          </h3>
          <button
            onClick={cerrarModal}
            className="text-white/80 hover:text-white"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={manejarSubmit}>
          <p className="text-sm text-gray-500 mb-4">
            Utiliza este medio para informar cualquier novedad sobre tus marcaciones, horas extras o consultas generales.
          </p>

          <div className="grid grid-cols-2 gap-4">
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
                <option value="aclaracion">ACLARACIÓN GENERAL</option>
                <option value="olvido_ingreso">OLVIDO DE ENTRADA</option>
                <option value="olvido_salida">OLVIDO DE SALIDA</option>
                <option value="hora_extra">SOLICITUD HORA EXTRA</option>
                <option value="inconveniente_acceso">PROBLEMA DE ACCESO</option>
                <option value="consulta">CONSULTA PERSONAL</option>
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
              placeholder="Explica detalladamente lo sucedido para que RRHH pueda solucionarlo..."
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