
/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Módulo de biometría facial y geolocalización. Se encarga del registro y validación de rostros mediante modelos de IA, además de gestionar el fichaje de asistencia. Incluye una lógica compleja de validación de horarios (tolerancias, tardanzas y horas extra) y restringe la marcación según la ubicación GPS del empleado, permitiendo excepciones únicamente para usuarios en modalidad remota.
*/
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useAuth } from "../../../../AuthContext";
import { useSedeUsers } from "../../Context/SedeUsersContext";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { motion } from "framer-motion";

const ReconocimientoFacial = ({
  origen,
  volverAtras = null,
  recargarDatos,
  onContinuar = null,
}) => {
  const { userId: id_usuario } = useAuth();
  const { sedeSeleccionada } = useSedeUsers();
  const esUsuarioRemoto = Boolean(sedeSeleccionada?.remoto);

  const referenciaVideo = useRef(null);
  const referenciaCanvas = useRef(null);
  const bloqueoValidacion = useRef(false);
  const intervaloDeteccion = useRef(null);
  const referenciaStream = useRef(null);

  const [descriptorRegistrado, setDescriptorRegistrado] = useState(null);
  const [mensajeStatus, setMensajeStatus] = useState("Cargando sistema...");
  const [tieneRegistro, setTieneRegistro] = useState(false);
  const [ubicacion, setUbicacion] = useState({ latitud: null, longitud: null });
  const [gpsHabilitado, setGpsHabilitado] = useState(false);
  const [camaraHabilitada, setCamaraHabilitada] = useState(false);
  const [errorMarcacion, setErrorMarcacion] = useState(null);


  const [horariosAsignados, setHorariosAsignados] = useState([]);

  useEffect(() => {
    const prepararSistema = async () => {
      if (origen === "marca") {
        if (esUsuarioRemoto) {
          setGpsHabilitado(true);
          setUbicacion({ latitud: null, longitud: null });
          setMensajeStatus(
            "Modo remoto detectado. Solo se validará tu rostro.",
          );
        } else {
          const tieneGps = await verificarEstadoGps();
          if (!tieneGps) return;
        }

        try {
          const urlHorarios = `http://localhost:8080/rrhh/horarios?usuario_id=${id_usuario}&&sede_id=${sedeSeleccionada.id}`;
          const respuestaHorarios = await axios.get(urlHorarios);
          setHorariosAsignados(respuestaHorarios.data);
        } catch (error) {
          console.error("Error al obtener los horarios:", error);
        }
      } else {
        setGpsHabilitado(true);
      }

      await cargarModelos();
      const videoIniciado = await iniciarVideo();

      if (videoIniciado) {
        await buscarRegistroExistente();
      }
    };

    prepararSistema();

    return () => {
      if (intervaloDeteccion.current) {
        clearInterval(intervaloDeteccion.current);
      }
      if (referenciaStream.current) {
        referenciaStream.current.getTracks().forEach((track) => {
          track.stop();
        });
        referenciaStream.current = null;
      }
    };
  }, [origen, esUsuarioRemoto]);

  useEffect(() => {
    if (
      camaraHabilitada &&
      referenciaVideo.current &&
      referenciaStream.current
    ) {
      referenciaVideo.current.srcObject = referenciaStream.current;
    }
  }, [camaraHabilitada, gpsHabilitado]);

  const verificarEstadoGps = () => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        setMensajeStatus("Tu navegador no soporta geolocalización.");
        resolve(false);
        return;
      }

      setMensajeStatus("Verificando ubicación...");

      const timeoutGps = setTimeout(() => {
        setMensajeStatus(
          "⚠️ El GPS está tardando demasiado. Asegurate de estar en un lugar abierto.",
        );
        resolve(false);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          clearTimeout(timeoutGps);
          setUbicacion({
            latitud: posicion.coords.latitude,
            longitud: posicion.coords.longitude,
          });
          setGpsHabilitado(true);
          resolve(true);
        },
        (error) => {
          clearTimeout(timeoutGps);
          console.error("Error GPS:", error);
          setGpsHabilitado(false);
          let mensajeError = "Es necesario activar el GPS para marcar.";

          if (error.code === 1) {
            mensajeError =
              "Debes permitir el acceso a la ubicación en el navegador.";
          }

          setMensajeStatus(`⚠️ ${mensajeError}`);
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    });
  };

  const cargarModelos = async () => {
    const RUTA_MODELOS = "/models";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(RUTA_MODELOS),
      faceapi.nets.faceLandmark68Net.loadFromUri(RUTA_MODELOS),
      faceapi.nets.faceRecognitionNet.loadFromUri(RUTA_MODELOS),
    ]);
  };

  const iniciarVideo = async () => {
    try {
      const flujo = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      referenciaStream.current = flujo;

      setCamaraHabilitada(true);
      setMensajeStatus("Modelos listos. Enfocá tu cara.");
      return true;
    } catch (error) {
      console.error("No se pudo acceder a la cámara:", error);
      setCamaraHabilitada(false);
      setMensajeStatus(
        "⚠️ Error: No se pudo acceder a la cámara o el permiso fue denegado.",
      );
      return false;
    }
  };

  const buscarRegistroExistente = async () => {
    try {
      const respuesta = await axios.get(
        `http://localhost:8080/rrhh/credenciales-faciales/usuario/${id_usuario}`,
      );
      if (respuesta.data && respuesta.data.descriptor_facial) {
        const descriptorArray = new Float32Array(
          respuesta.data.descriptor_facial,
        );
        setDescriptorRegistrado(descriptorArray);
        setTieneRegistro(true);

        if (origen === "marca") {
          setMensajeStatus(
            "Rostro detectado en BD. Validando para marcar asistencia...",
          );
        } else {
          setMensajeStatus(
            "Ya tienes un rostro registrado. Puedes actualizarlo si deseas.",
          );
        }
      }
    } catch (error) {
      setTieneRegistro(false);
      if (origen === "marca") {
        setMensajeStatus(
          "⚠️ No tienes un rostro registrado. Ve a registrarte primero.",
        );
      } else {
        setMensajeStatus(
          "No hay registro previo. Enfocá tu cara para registrarte.",
        );
      }
    }
  };

  const registrarMiCara = async () => {
    if (!referenciaVideo.current) return;

    setMensajeStatus("Capturando... No te muevas");
    const deteccion = await faceapi
      .detectSingleFace(
        referenciaVideo.current,
        new faceapi.TinyFaceDetectorOptions(),
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (deteccion) {
      try {
        const body = {
          id_usuario: id_usuario,
          descriptor_facial: Array.from(deteccion.descriptor),
        };

        if (tieneRegistro) {
          await axios.put(
            `http://localhost:8080/rrhh/credenciales-faciales/${id_usuario}`,
            body,
          );
          setMensajeStatus("¡Actualización exitosa!");
        } else {
          await axios.post(
            "http://localhost:8080/rrhh/credenciales-faciales",
            body,
          );
          setMensajeStatus("¡Registro exitoso! Ahora el sistema te reconoce.");
        }

        setDescriptorRegistrado(deteccion.descriptor);
        setTieneRegistro(true);
      } catch (error) {
        setMensajeStatus("Error al guardar en BD.");
      }
    } else {
      setMensajeStatus("No se ve tu cara. Intentá de nuevo.");
    }
  };

  const procesarMarcacion = async () => {
    try {
      setMensajeStatus("Verificando horario y guardando...");

      // 1. Obtener la hora confiable
/*       let horaConfiable; */
      /*       try {
        const timeResponse = await axios.get(
          "http://worldtimeapi.org/api/timezone/America/Argentina/Tucuman",
        );
        horaConfiable = dayjs(timeResponse.data.datetime);
      } catch (error) {
        console.warn("API de tiempo falló, usando hora del dispositivo.");
        horaConfiable = dayjs();
      } */
     // Dentro de procesarMarcacion
      const horaConfiable = dayjs(); 
    /* const horaConfiable = dayjs().set('hour', 17).set('minute', 55).set('second', 0); */ //Desarrollo
      
      const currentDayjsDay = horaConfiable.day();

      const diaActual = currentDayjsDay === 0 ? 7 : currentDayjsDay;
      const fechaHoy = horaConfiable.format("YYYY-MM-DD");
      // 2. Filtrar los horarios del usuario correspondientes al día de hoy
      const horariosDeHoy = horariosAsignados.filter(
        (h) => h.dia_semana === diaActual,
      );

      let esHorarioNormal = false;
      let idHorarioDetectado = null;

      // Valores por defecto
      let estadoFinal = "normal";
      let aprobacionFinal = "aprobada";
      let horaEntradaAjustada = horaConfiable.format("YYYY-MM-DD HH:mm:ss");
      let minutosTarde = 0;

      // 3. Evaluar reglas de negocio para la hora de entrada
      for (const turno of horariosDeHoy) {
        const horaEntradaTurno = dayjs(`${fechaHoy} ${turno.hora_entrada}`);
        const horaSalidaTurno = dayjs(`${fechaHoy} ${turno.hora_salida}`);

        // LÍMITES CORREGIDOS:
        const entradaTempranaPermitida = horaEntradaTurno.subtract(
          30,
          "minute",
        );
        const limiteTolerancia = horaEntradaTurno.add(10, "minute");
        // CAMBIO AQUÍ: La brecha se cierra JUSTO en el horario de salida
        const salidaPermitida = horaSalidaTurno;

        // Verificamos si está dentro de la gran brecha
        if (
          (horaConfiable.isAfter(entradaTempranaPermitida) ||
            horaConfiable.isSame(entradaTempranaPermitida)) &&
          (horaConfiable.isBefore(salidaPermitida) ||
            horaConfiable.isSame(salidaPermitida))
        ) {
          esHorarioNormal = true;
          idHorarioDetectado = turno.id;

          // --- LÓGICA DE REDONDEO Y TARDANZA ---
          if (
            horaConfiable.isBefore(limiteTolerancia) ||
            horaConfiable.isSame(limiteTolerancia)
          ) {
            // CASO 1 y 2: Llegó a tiempo (o con tolerancia permitida)
            estadoFinal = "normal";
            minutosTarde = 0;
          } else {
            // CASO 3: Llegó tarde (pasó la tolerancia pero sigue dentro del turno)
            estadoFinal = "normal";
            aprobacionFinal = "pendiente"; // Se marca como pendiente para revisión de RRHH
            minutosTarde = horaConfiable.diff(horaEntradaTurno, "minute"); // Calculamos minutos de tardanza reales
          }
          break;
        }
      }

      // 4. Si no encajó en ningún turno (marcó después de la salida justa o muy antes)
      if (!esHorarioNormal) {
        const confirmacion = await Swal.fire({
          title: "Fuera de horario",
          text: "Estás intentando marcar fuera de tu rango horario establecido. ¿Estás realizando horas extras?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#f97316",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Sí, es hora extra",
          cancelButtonText: "No, cancelar marcación",
          allowOutsideClick: false,
        });

        if (confirmacion.isConfirmed) {
          estadoFinal = "extra";
          aprobacionFinal = "pendiente";
          horaEntradaAjustada = horaConfiable.format("YYYY-MM-DD HH:mm:ss");
        } else {
          volverAtras && volverAtras();
          return;
        }
      }

      // 5. Enviar marcación
      const payloadMarcacion = {
        usuario_id: Number(id_usuario),
        sede_id: Number(sedeSeleccionada.id),
        estado: estadoFinal,
        origen: "facial",
        estado_aprobacion: aprobacionFinal,
        latitud: esUsuarioRemoto ? null : ubicacion.latitud,
        longitud: esUsuarioRemoto ? null : ubicacion.longitud,
        horario_id: idHorarioDetectado,
        hora_entrada: horaConfiable,
        minutos_tarde: minutosTarde,
      };

      await axios.post(
        "http://localhost:8080/rrhh/marcaciones",
        payloadMarcacion,
      );

      const mensajeTardanza =
        minutosTarde > 0
          ? `<br/><br/><span style="color: red;"><b>Tardanza:</b> ${minutosTarde} minutos</span>`
          : "";

      const fechaHoraMostrar = dayjs(horaEntradaAjustada).format(
        "DD/MM/YYYY HH:mm:ss",
      );



      recargarDatos();
      Swal.fire({
        title: "¡Verificación Exitosa!",
        html: `Tu asistencia ha sido registrada correctamente.<br/><br/><b>Estado:</b> ${estadoFinal.toUpperCase()}<br/><b>Fecha y Hora registrada:</b> ${fechaHoraMostrar}${mensajeTardanza}`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#f97316",
        allowOutsideClick: false,
      }).then((resultado) => {
        if (resultado.isConfirmed) {
          volverAtras && volverAtras();
        }
      });
    } catch (error) {
      const mensajeDelServidor =
        error.response?.data?.mensajeError ||
        "No se pudo guardar la marcación.";
      setErrorMarcacion(mensajeDelServidor);
      console.error(
        "Error en el servidor:",
        error.response?.data || error.message,
      );
      bloqueoValidacion.current = false;
    }
  };
  const detectarCalavera = () => {
    intervaloDeteccion.current = setInterval(async () => {
      const videoActual = referenciaVideo.current;
      const canvasActual = referenciaCanvas.current;

      if (videoActual && canvasActual) {
        const dimensiones = {
          width: videoActual.clientWidth,
          height: videoActual.clientHeight,
        };
        faceapi.matchDimensions(canvasActual, dimensiones);

        const detecciones = await faceapi
          .detectAllFaces(videoActual, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptors();

        const resultadosRedimensionados = faceapi.resizeResults(
          detecciones,
          dimensiones,
        );

        if (!referenciaCanvas.current) return;

        const contexto = referenciaCanvas.current.getContext("2d");
        contexto.clearRect(0, 0, dimensiones.width, dimensiones.height);

        if (descriptorRegistrado && resultadosRedimensionados.length > 0) {
          const matcher = new faceapi.FaceMatcher(
            [
              new faceapi.LabeledFaceDescriptors("Empleado", [
                descriptorRegistrado,
              ]),
            ],
            0.6,
          );

          resultadosRedimensionados.forEach((det) => {
            const match = matcher.findBestMatch(det.descriptor);
            const esValido = match.label === "Empleado";

            const label = esValido ? "EMPLEADO VALIDADO ✅" : "DESCONOCIDO ❌";

            const drawBox = new faceapi.draw.DrawBox(det.detection.box, {
              label: match.label,
            });
            drawBox.draw(referenciaCanvas.current);

            if (origen === "marca" && esValido && !bloqueoValidacion.current) {
              if (
                !esUsuarioRemoto &&
                (!ubicacion.latitud || !ubicacion.longitud)
              ) {
                setMensajeStatus("⚠️ Error: Ubicación no obtenida.");
                return;
              }

              bloqueoValidacion.current = true;
              procesarMarcacion();
            }
          });
        } else {
          faceapi.draw.drawDetections(
            referenciaCanvas.current,
            resultadosRedimensionados,
          );
        }

        faceapi.draw.drawFaceLandmarks(
          referenciaCanvas.current,
          resultadosRedimensionados,
        );
      }
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center pt-5 w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-4"
    >
      {volverAtras && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={volverAtras}
          className="self-start mb-5 bg-gray-100 text-orange-600 hover:bg-gray-200 border-none rounded-lg font-bold text-sm md:text-base px-4 py-2 cursor-pointer shadow-sm flex items-center gap-2 transition-colors duration-200"
        >
          <span className="text-lg inline-block translate-y-[1px]">←</span>
          Volver atrás
        </motion.button>
      )}

      <h3
        className={`text-center px-4 text-lg md:text-xl font-semibold mb-4 ${origen === "marca" && (!gpsHabilitado || !camaraHabilitada) ? "text-red-600" : "text-gray-800"}`}
      >
        {mensajeStatus}
      </h3>

      {errorMarcacion && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-xl shadow-md w-full flex items-center gap-3"
        >
          <span className="text-xl">⚠️</span>
          <div className="flex flex-col">
            <p className="font-bold text-sm">Problema al marcar:</p>
            <p className="text-sm">{errorMarcacion}</p>
          </div>
        </motion.div>
      )}

      {gpsHabilitado && camaraHabilitada && (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative w-full rounded-2xl overflow-hidden shadow-xl shadow-gray-300/50 bg-black"
        >
          <video
            ref={referenciaVideo}
            autoPlay
            muted
            playsInline
            className="w-full h-auto block object-cover max-h-[70vh] md:max-h-[600px]"
            onPlay={detectarCalavera}
          />
          <canvas
            ref={referenciaCanvas}
            className="absolute top-0 left-0 w-full h-full"
          />
        </motion.div>
      )}

      {origen === "registrar" && camaraHabilitada && (
        <div className="mt-6 pb-8 w-full flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={registrarMiCara}
            className="px-6 py-3 text-base cursor-pointer bg-orange-500 hover:bg-orange-600 text-white border-none rounded-lg font-bold shadow-md w-full md:w-auto transition-colors duration-200"
          >
            {tieneRegistro ? "Actualizar mi cara" : "Registrar mi cara"}
          </motion.button>
        </div>
      )}

      {origen === "registrar" && onContinuar && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinuar}
            className={`px-6 py-3 text-base cursor-pointer ${!tieneRegistro ? "bg-gray-400 hover:bg-gray-400" : "bg-orange-500 hover:bg-orange-600"} text-white border-none rounded-lg font-bold shadow-md w-full md:w-auto transition-colors duration-200`}
            disabled={!tieneRegistro}
          >
            Finalizar
          </motion.button>
        </div>
      )}

      {origen === "marca" &&
        !tieneRegistro &&
        gpsHabilitado &&
        camaraHabilitada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5 text-red-600 font-bold text-center px-4"
          >
            No puedes marcar asistencia. Debes registrar tus credenciales
            faciales primero.
          </motion.div>
        )}

      {origen === "marca" &&
        ((!esUsuarioRemoto && !gpsHabilitado) || !camaraHabilitada) && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
            <p className="font-bold">Acceso Denegado</p>
            <p className="text-sm">
              {!esUsuarioRemoto &&
                !gpsHabilitado &&
                "• El GPS debe estar habilitado para registrar tu ubicación. "}
              {!camaraHabilitada &&
                "• La cámara es necesaria para la validación facial."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 text-xs underline font-semibold"
            >
              Reintentar habilitar permisos
            </button>
          </div>
        )}
    </motion.div>
  );
};

export default ReconocimientoFacial;
