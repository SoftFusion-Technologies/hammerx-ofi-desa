import { FaArrowLeft, FaImage, FaTimes, FaTrashAlt } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import useAgregarDatos from "../../hooks/agregarDatos";
import useModificarDatosPut from "../../hooks/modificarDatosPut";
import Swal from "sweetalert2";
import { useAuth } from "../../../../AuthContext";
import * as yup from "yup";
import { useSedeUsers } from "../../Context/SedeUsersContext";

const API_BASE_URL = "http://localhost:8080"; // Asegúrate de que coincida con tu entorno

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
  horarioSeleccionado, // Este prop es el que contiene la información del horario específico al que se le quiere enviar la aclaración cuando un empelado hace click desde el ícono de aclaración en el historial de marcaciones
  rol = "empleado", 
  onVolverAListado,
  traerConversaciones, // Función para refrescar las conversaciones después de enviar una aclaración desde tickets de consulta
  traerHorarios, // Función para refrescar los horarios después de enviar una aclaración desde el historial de marcaciones
  usuarioSeleccionado,
}) => {
  const { sedeSeleccionada } = useSedeUsers();
  const { userId } = useAuth();

  
  const { agregar, cargando: cargandoEnvio } = useAgregarDatos();
  const { modificarPut, cargando: cargandoActualizacion } = useModificarDatosPut();
  
  const inputArchivoRef = useRef(null);

  const [datosFormulario, setDatosFormulario] = useState({
    fecha: valoresIniciales.fecha,
    motivo: valoresIniciales.motivo,
    comentario: valoresIniciales.comentario,
  });
  
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [previewArchivo, setPreviewArchivo] = useState("");
  const [mensajeEditable, setMensajeEditable] = useState(null);
  const [erroresFormulario, setErroresFormulario] = useState({});
  const [eliminarImagenBd, setEliminarImagenBd] = useState(false);

  const construirUrlAdjunto = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `${API_BASE_URL}/${String(url).replace(/^\/+/, "")}`;
  };

  const esBlobUrl = (url) => typeof url === "string" && url.startsWith("blob:");

  // Efecto para la fecha seleccionada y valor por defecto de RRHH
  useEffect(() => {
    if (rol === "rrhh") {
      setDatosFormulario(prev => ({ ...prev, motivo: "tu_cobro" }));
    }
    if (diaSeleccionado) {
      setDatosFormulario((prev) => ({ ...prev, fecha: diaSeleccionado }));
    }
  }, [diaSeleccionado, rol]);

  // Efecto para limpiar la memoria de las URLs de los blobs
  useEffect(() => {
    return () => {
      if (previewArchivo && esBlobUrl(previewArchivo)) {
        URL.revokeObjectURL(previewArchivo);
      }
    };
  }, [previewArchivo]);

  // Efecto para verificar si hay un mensaje que editar
  useEffect(() => {
    const mensajes = Array.isArray(horarioSeleccionado?.mensajes_aclaracion)
      ? horarioSeleccionado.mensajes_aclaracion
      : [];

    // Buscamos el último mensaje enviado por el usuario actual según su rol
    const destinatarioEsperado = rol === "empleado" ? "rrhh" : "usuario";
    const ultimoMensaje = [...mensajes]
      .reverse()
      .find((item) => item?.destinatario_tipo === destinatarioEsperado);

    setMensajeEditable(ultimoMensaje || null);

    setEliminarImagenBd(false);

    if (!ultimoMensaje) {
      setDatosFormulario((prev) => ({
        ...prev,
        motivo: prev.motivo, // Mantenemos el motivo que ya se haya seteado
        comentario: valoresIniciales.comentario,
      }));
      setArchivoAdjunto(null);
      if (previewArchivo && esBlobUrl(previewArchivo)) {
        URL.revokeObjectURL(previewArchivo);
      }
      setPreviewArchivo("");
      return;
    }

    setDatosFormulario((prev) => ({
      ...prev,
      fecha: ultimoMensaje.fecha_referencia || prev.fecha,
      motivo: ultimoMensaje.tipo_mensaje || prev.motivo,
      comentario: ultimoMensaje.mensaje || "",
    }));

    setArchivoAdjunto(null);

    const urlAdjunto = construirUrlAdjunto(ultimoMensaje.archivo_adjunto_url);
    if (previewArchivo && esBlobUrl(previewArchivo)) {
      URL.revokeObjectURL(previewArchivo);
    }
    setPreviewArchivo(urlAdjunto);

    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  }, [horarioSeleccionado, rol]);

  const manejarCambio = (event) => {
    const { name, value } = event.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));

    if (erroresFormulario[name]) {
      setErroresFormulario((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const manejarCambioArchivo = (event) => {
    const archivo = event.target.files?.[0] || null;

    if (previewArchivo && esBlobUrl(previewArchivo)) {
      URL.revokeObjectURL(previewArchivo);
    }

    if (!archivo) {
      setArchivoAdjunto(null);
      setPreviewArchivo("");
      return;
    }

    setArchivoAdjunto(archivo);
    setPreviewArchivo(URL.createObjectURL(archivo));
  };

  // 3. REEMPLAZA TU FUNCIÓN ACTUAL POR ESTA:
  const quitarArchivo = () => {
    if (previewArchivo && !esBlobUrl(previewArchivo)) {
      // Si hay preview pero NO es un blob (es una URL local), significa que venía de la BD
      setEliminarImagenBd(true);
    } else if (previewArchivo && esBlobUrl(previewArchivo)) {
      // Si era una foto recién subida que el usuario se arrepintió
      URL.revokeObjectURL(previewArchivo);
    }
    
    setArchivoAdjunto(null);
    setPreviewArchivo("");
    
    if (inputArchivoRef.current) {
      inputArchivoRef.current.value = "";
    }
  };

 const manejarEnviarMensaje = async () => {
    try {
      await schemaAclaracion.validate(datosFormulario, { abortEarly: false });
      setErroresFormulario({});

      const usuarioDestinoId = rol === "rrhh"
      ? Number(horarioSeleccionado?.usuario_id || usuarioSeleccionado?.usuario_id)
      : Number(userId);
        
      const sedeDestinoId = rol === "rrhh"
         ? Number(horarioSeleccionado?.sede_id || usuarioSeleccionado?.sede_id)
        : Number(sedeSeleccionada?.id);

       if (!usuarioDestinoId || !sedeDestinoId) {
      throw new Error(
        !usuarioDestinoId && !sedeDestinoId
          ? "No se pudo identificar el empleado ni la sede de destino."
          : !usuarioDestinoId
            ? "No se pudo identificar el empleado destinatario."
            : "No se pudo identificar la sede de destino."
      );
    }

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

      // 1. Declaramos variables clave ANTES de usarlas
      const endpointBase = rol === "rrhh" ? "/rrhh-mensajes-admin" : "/rrhh-mensajes";
      const esActualizacion = Boolean(mensajeEditable?.id);

      // 2. Armamos el FormData
      const payload = new FormData();
      Object.entries(cuerpoMensaje).forEach(([clave, valor]) => {
        if (valor !== null && valor !== undefined) {
          payload.append(clave, String(valor));
        }
      });

      // 3. Manejo de la imagen: la subimos O le decimos al back que la borre
      if (archivoAdjunto) {
        payload.append("archivo_adjunto", archivoAdjunto);
      } else if (eliminarImagenBd && esActualizacion) {
        payload.append("eliminar_imagen", "true"); 
      }

      // 4. Envío condicional (PUT o POST)
      if (esActualizacion) {
        payload.append("sin_horas_maxima_edicion", "true");
        await modificarPut(`${endpointBase}/${mensajeEditable.id}`, payload);
      } else {
        await agregar(endpointBase, payload);
      }

      quitarArchivo();

      Swal.fire({
        title: esActualizacion ? "Mensaje actualizado" : "Mensaje Enviado",
        text: esActualizacion
          ? "Tu aclaración fue actualizada correctamente."
          : "Tu aclaración ha sido enviada " + (rol === "empleado" ? "a RRHH" : "al empleado") + " correctamente.",
        icon: "success",
        confirmButtonText: "Entendido",
      });
      
      cerrarModal();
      if (traerConversaciones) traerConversaciones();
      if (traerHorarios) traerHorarios();

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
        
        {/* Cabecera */}
        <div className="bg-orange-600 p-4 flex justify-between items-center">
          <div className="min-w-0">
            <h3 className="text-white font-bold text-lg font-bignoodle tracking-wide uppercase">
              {rol === "empleado" ? "Tickets de consulta" : "Enviar Aclaración"}
            </h3>
            {rol === "rrhh" && horarioSeleccionado?.usuario?.name && (
              <p className="text-xs text-orange-100 truncate">
                Empleado: {horarioSeleccionado.usuario.name}
              </p>
            )}
          </div>
          <button onClick={cerrarModal} className="text-white/80 hover:text-white">
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

          {rol === "empleado" && (
            <p className="text-sm text-gray-500 mb-4">
              Utiliza este medio para informar cualquier novedad sobre tus marcaciones, horas extras o consultas generales.
            </p>
          )}

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
                  <p className="text-xs text-red-600 mt-1">{erroresFormulario.fecha}</p>
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
                {rol === "empleado"
                  ? TIPOS_MENSAJE_EMPLEADO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))
                  : TIPOS_MENSAJE_RRHH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
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
              placeholder={rol === "empleado" ? "Describe detalladamente tu situación..." : "Escribe tu mensaje..."}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-orange-500 outline-none resize-none"
            ></textarea>
            {erroresFormulario.comentario && (
              <p className="text-xs text-red-600 mt-1">{erroresFormulario.comentario}</p>
            )}
          </div>

          {/* Sección de Adjuntos */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">
              Adjuntar imagen
            </label>
            <input
              ref={inputArchivoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={manejarCambioArchivo}
            />

            <button
              type="button"
              onClick={() => inputArchivoRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              <FaImage size={14} />
              Añadir imagen
            </button>

            {previewArchivo && (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <img
                  src={previewArchivo}
                  alt="Vista previa del adjunto"
                  className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {archivoAdjunto?.name || "Imagen ya adjunta"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {archivoAdjunto
                      ? "Imagen seleccionada para adjuntar al mensaje."
                      : "Imagen cargada previamente en este mensaje."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={quitarArchivo}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-white hover:text-red-600"
                  aria-label="Quitar imagen"
                >
                  <FaTrashAlt size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={cargandoEnvio || cargandoActualizacion}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors uppercase tracking-wider"
            >
              {(cargandoEnvio || cargandoActualizacion)
                ? (mensajeEditable ? "Actualizando..." : "Enviando...")
                : (mensajeEditable ? "Actualizar Aclaración" : "Enviar Aclaración")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNovedad;