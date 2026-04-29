/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Módulo de biometría facial y geolocalización. 
Se optimizó el uso de memoria (FaceMatcher con umbral 0.45 en caché) 
para dispositivos móviles de gama media y se mejoró la precisión biométrica.
*/
import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import { useAuth } from "../../../../../AuthContext";
import { useSedeUsers } from "../../../Context/SedeUsersContext";
import axios from "axios";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { formatearDuracion } from "../../../Utils/convertirMinutosAHoras"

const ReconocimientoFacial = ({
  origen,
  volverAtras = null,
  recargarDatos,
  onContinuar = null,
  mostrarReconocimiento = null,
}) => {
  const { userId: id_usuario, userName} = useAuth();
  const { sedeSeleccionada } = useSedeUsers();
  const esUsuarioRemoto = Boolean(sedeSeleccionada?.remoto);

  const referenciaVideo = useRef(null);
  const referenciaCanvas = useRef(null);
  const bloqueoValidacion = useRef(false);
  const intervaloDeteccion = useRef(null);
  const referenciaStream = useRef(null);

  // Caché del comparador para no congelar el celular
  const faceMatcherRef = useRef(null);

  const [descriptorRegistrado, setDescriptorRegistrado] = useState(null);
  const [mensajeStatus, setMensajeStatus] = useState("Iniciando componentes...");
  const [tieneRegistro, setTieneRegistro] = useState(false);
  const [ubicacion, setUbicacion] = useState({ latitud: null, longitud: null });
  const [gpsHabilitado, setGpsHabilitado] = useState(false);
  const [camaraHabilitada, setCamaraHabilitada] = useState(false);
  const [errorMarcacion, setErrorMarcacion] = useState(null);
  const [horariosAsignados, setHorariosAsignados] = useState([]);
  const [feriadosHoyHammer, setFeriadosHoyHammer] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let montado = true;

    const prepararSistema = async () => {
      setCargando(true);
      setMensajeStatus("Cargando módulos y verificando permisos...");

      const tareasPromesas = [];
      tareasPromesas.push(cargarModelos());

      if (origen === "marca") {
        if (esUsuarioRemoto) {
          setGpsHabilitado(true);
          setUbicacion({ latitud: null, longitud: null });
        } else {
          tareasPromesas.push(verificarEstadoGps(montado));
        }

        const promesaHorarios = async () => {
          try {
            const urlHorarios = `http://localhost:8080/rrhh/horarios?usuario_id=${id_usuario}&sede_id=${sedeSeleccionada.id}`;
            const respuestaHorarios = await axios.get(urlHorarios);

            const urlFeriados = `http://localhost:8080/rrhh/feriados-programados`;
            const respuestaFeriados = await axios.get(urlFeriados, {
              params: { fechahoy: dayjs().format("YYYY-MM-DD") },
            });

            if (montado) {
              setHorariosAsignados(respuestaHorarios.data);
              setFeriadosHoyHammer(respuestaFeriados.data);
            }
          } catch (error) {
            console.error("Error al obtener datos:", error);
          }
        };
        tareasPromesas.push(promesaHorarios());
      } else {
        setGpsHabilitado(true);
      }

      tareasPromesas.push(buscarRegistroExistente(montado));

      await Promise.all(tareasPromesas);

      if (montado) {
        await iniciarVideo();
        setCargando(false);
        
        if (origen === "marca") {
          setMensajeStatus("Sistema listo. Validando tu rostro...");
        } else {
          setMensajeStatus("Sistema listo. Enfocá tu cara.");
        }
      }
    };

    prepararSistema();

    return () => {
      montado = false;
      if (intervaloDeteccion.current) {
        clearTimeout(intervaloDeteccion.current);
      }
      if (referenciaStream.current) {
        referenciaStream.current.getTracks().forEach((track) => track.stop());
        referenciaStream.current = null;
      }
    };
  }, [origen, esUsuarioRemoto]);

  useEffect(() => {
    if (camaraHabilitada && referenciaVideo.current && referenciaStream.current) {
      referenciaVideo.current.srcObject = referenciaStream.current;
    }
  }, [camaraHabilitada, gpsHabilitado, cargando]);

  const verificarEstadoGps = (montado) => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) {
        if (montado) setMensajeStatus("Tu navegador no soporta geolocalización.");
        resolve(false);
        return;
      }

      const timeoutGps = setTimeout(() => {
        if (montado) setMensajeStatus("⚠️ El GPS está tardando demasiado. Asegurate de estar en un lugar abierto.");
        resolve(false);
      }, 10000);

      navigator.geolocation.getCurrentPosition(
        (posicion) => {
          clearTimeout(timeoutGps);
          if (montado) {
            setUbicacion({
              latitud: posicion.coords.latitude,
              longitud: posicion.coords.longitude,
            });
            setGpsHabilitado(true);
          }
          resolve(true);
        },
        (error) => {
          clearTimeout(timeoutGps);
          console.error("Error GPS:", error);
          if (montado) {
            setGpsHabilitado(false);
            let mensajeError = "Es necesario activar el GPS para marcar.";
            if (error.code === 1) mensajeError = "Debes permitir el acceso a la ubicación en el navegador.";
            setMensajeStatus(`⚠️ ${mensajeError}`);
          }
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
      return true;
    } catch (error) {
      console.error("No se pudo acceder a la cámara:", error);
      setCamaraHabilitada(false);
      setMensajeStatus("⚠️ Error: No se pudo acceder a la cámara o el permiso fue denegado.");
      return false;
    }
  };

  const buscarRegistroExistente = async (montado) => {
    try {
      const respuesta = await axios.get(
        `http://localhost:8080/rrhh/credenciales-faciales/usuario/${id_usuario}`,
      );
      if (respuesta.data && respuesta.data.descriptor_facial && montado) {
        const descriptorArray = new Float32Array(respuesta.data.descriptor_facial);
        setDescriptorRegistrado(descriptorArray);
        setTieneRegistro(true);

        // Pre-cargamos el comparador con umbral estricto (0.45) para evitar confusiones
        faceMatcherRef.current = new faceapi.FaceMatcher(
          [new faceapi.LabeledFaceDescriptors("Empleado", [descriptorArray])],
          0.4
        );
      }
    } catch (error) {
      if (montado) setTieneRegistro(false);
    }
  };

  const registrarMiCara = async () => {
    if (!referenciaVideo.current) return;

    setMensajeStatus("Capturando... No te muevas y mirá a la cámara");
    
    // Parámetros de alta calidad solo para el registro inicial
    const opcionesDeRegistro = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.8 });
    
    const deteccion = await faceapi
      .detectSingleFace(referenciaVideo.current, opcionesDeRegistro)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (deteccion) {
      try {
        const body = {
          id_usuario: id_usuario,
          descriptor_facial: Array.from(deteccion.descriptor),
        };

        if (tieneRegistro) {
          await axios.put(`http://localhost:8080/rrhh/credenciales-faciales/${id_usuario}`, body);
          setMensajeStatus("¡Actualización exitosa!");

          await Swal.fire({
            title: "¡Actualización exitosa!",
            text: "Tus credenciales faciales se actualizaron correctamente.",
            icon: "success",
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#f97316",
            allowOutsideClick: false,
          });

          mostrarReconocimiento && mostrarReconocimiento();
        } else {
          await axios.post("http://localhost:8080/rrhh/credenciales-faciales", body);
          setMensajeStatus("¡Registro exitoso! Ahora el sistema te reconoce.");
        }

        setDescriptorRegistrado(deteccion.descriptor);
        setTieneRegistro(true);
        
        // Actualizamos el comparador en memoria
        faceMatcherRef.current = new faceapi.FaceMatcher(
          [new faceapi.LabeledFaceDescriptors("Empleado", [deteccion.descriptor])],
          0.45
        );
      } catch (error) {
        setMensajeStatus("Error al guardar en BD.");
      }
    } else {
      setMensajeStatus("No se ve tu cara. Mejorá la luz e intentá de nuevo.");
    }
  };

  const procesarMarcacion = async () => {
    try {
      setMensajeStatus("Verificando horario y guardando...");
    const horaConfiable = dayjs(); 
/*       const horaConfiable = dayjs("2026-04-28 09:00:00"); // lunes */
      const currentDayjsDay = horaConfiable.day();
      const diaActual = currentDayjsDay === 0 ? 7 : currentDayjsDay;
      const fechaHoy = horaConfiable.format("YYYY-MM-DD");
      const esFeriado = feriadosHoyHammer.length > 0;
      
      const horariosDeHoy = horariosAsignados.filter((h) => h.dia_semana === diaActual);

      let esHorarioNormal = false;
      let idHorarioDetectado = null;
      let estadoFinal = "normal";
      let aprobacionFinal = "aprobada";
      let horaEntradaAjustada = horaConfiable.format("YYYY-MM-DD HH:mm:ss");
      let minutosTarde = 0;

      for (const turno of horariosDeHoy) {
        const horaEntradaTurno = dayjs(`${fechaHoy} ${turno.hora_entrada}`);
        const horaSalidaTurno = dayjs(`${fechaHoy} ${turno.hora_salida}`);

        const entradaTempranaPermitida = horaEntradaTurno.subtract(30, "minute");
        const limiteTolerancia = horaEntradaTurno.add(10, "minute");
        const salidaPermitida = horaSalidaTurno;

        if (
          (horaConfiable.isAfter(entradaTempranaPermitida) || horaConfiable.isSame(entradaTempranaPermitida)) &&
          (horaConfiable.isBefore(salidaPermitida) || horaConfiable.isSame(salidaPermitida))
        ) {
          esHorarioNormal = true;
          idHorarioDetectado = turno.id;

          if (horaConfiable.isBefore(limiteTolerancia) || horaConfiable.isSame(limiteTolerancia)) {
            estadoFinal = "normal";
            minutosTarde = 0;
          } else {
            estadoFinal = "normal";
            aprobacionFinal = "pendiente";
            minutosTarde = horaConfiable.diff(horaEntradaTurno, "minute");
          }
          break;
        }
      }

      if (!esHorarioNormal || esFeriado) {
        const esCasoFeriado = esFeriado;

        const confirmacion = await Swal.fire({
          title: esCasoFeriado ? "Día feriado" : "Fuera de horario",
          text: esCasoFeriado
            ? "Hoy es feriado. ¿Estás realizando horas extras?"
            : "Estás intentando marcar fuera de tu rango horario establecido. ¿Estás realizando horas extras?",
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

      await axios.post("http://localhost:8080/rrhh/marcaciones", payloadMarcacion);

      const mensajeTardanza = minutosTarde > 0 ? `<br/><br/><span style="color: red;"><b>Tardanza:</b> ${formatearDuracion(minutosTarde)}</span>` : "";
      const fechaHoraMostrar = dayjs(horaEntradaAjustada).format("DD/MM/YYYY HH:mm:ss");

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
      const mensajeDelServidor = error.response?.data?.mensajeError || "No se pudo guardar la marcación.";
      setErrorMarcacion(mensajeDelServidor);
      console.error("Error en el servidor:", error.response?.data || error.message);
      bloqueoValidacion.current = false;
    }
  };

  const detectarCalavera = async () => {
    clearTimeout(intervaloDeteccion.current);

    const videoActual = referenciaVideo.current;
    const canvasActual = referenciaCanvas.current;

    if (!videoActual || !canvasActual || bloqueoValidacion.current) return;

    if (videoActual.videoWidth === 0) {
      intervaloDeteccion.current = setTimeout(detectarCalavera, 500);
      return;
    }

    try {
      const dimensiones = { width: videoActual.videoWidth, height: videoActual.videoHeight };
      
      // Optimizamos para no redimensionar a menos que sea necesario
      if (canvasActual.width !== dimensiones.width || canvasActual.height !== dimensiones.height) {
        faceapi.matchDimensions(canvasActual, dimensiones);
      }

      // Dejamos opciones livianas para la detección continua
      const opcionesOptimizadas = new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.6 });

      const detecciones = await faceapi
        .detectAllFaces(videoActual, opcionesOptimizadas)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const resultadosRedimensionados = faceapi.resizeResults(detecciones, dimensiones);
      const contexto = canvasActual.getContext("2d");
      contexto.clearRect(0, 0, dimensiones.width, dimensiones.height);

      if (faceMatcherRef.current && resultadosRedimensionados.length > 0) {
        
        for (const det of resultadosRedimensionados) {
          const match = faceMatcherRef.current.findBestMatch(det.descriptor);
          const esValido = match.label === "Empleado";
          
          // LÓGICA DE DEBUGGING: Solo visible en la consola del navegador para el desarrollador
          const confianza = Math.max(0, Math.round((1 - match.distance) * 100));
          console.log(`🔍 [Biometría] Evaluando: Distancia=${match.distance.toFixed(3)} | Similitud=${confianza}% | Válido=${esValido}`);
          
          // Etiqueta visual limpia para el usuario
          const etiqueta = esValido ? `✅ Confirmado` : `❌ Desconocido`;
          const colorCaja = esValido ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';

          const drawBox = new faceapi.draw.DrawBox(det.detection.box, { 
            label: etiqueta,
            boxColor: colorCaja
          });
          drawBox.draw(canvasActual);

          if (origen === "marca" && !bloqueoValidacion.current) {
            
            if (!esValido) {
              setMensajeStatus(`Validando... Rostro no coincide. Mirá bien a la cámara.`);
              continue;
            }

            if (!esUsuarioRemoto && (!ubicacion.latitud || !ubicacion.longitud)) {
              setMensajeStatus("⚠️ Error: Ubicación no obtenida.");
              return;
            }

            setMensajeStatus(`✅ Identidad confirmada. Procesando asistencia...`);
            bloqueoValidacion.current = true;
            procesarMarcacion();
          }
        }
      } else {
        faceapi.draw.drawDetections(canvasActual, resultadosRedimensionados);
      }
      faceapi.draw.drawFaceLandmarks(canvasActual, resultadosRedimensionados);
      
    } catch (error) {
      console.error("Error analizando frame:", error);
    }

    intervaloDeteccion.current = setTimeout(detectarCalavera, 400);
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

      {cargando ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center bg-gray-50 p-6 rounded-xl border border-gray-200 w-full mb-6">
           <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <h3 className="text-gray-800 text-lg font-semibold text-center mb-2">{mensajeStatus}</h3>
           <p className="text-sm text-gray-500 text-center">Optimizando recursos para tu dispositivo...</p>
        </motion.div>
      ) : (
        <h3 className={`text-center px-4 text-lg md:text-xl font-semibold mb-4 ${origen === "marca" && (!gpsHabilitado || !camaraHabilitada) ? "text-red-600" : "text-gray-800"}`}>
          {mensajeStatus}
        </h3>
      )}

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

      {!cargando && gpsHabilitado && camaraHabilitada && (
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

      {!cargando && origen === "registrar" && camaraHabilitada && (
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

      {!cargando && origen === "registrar" && onContinuar && (
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

      {!cargando && origen === "marca" && !tieneRegistro && gpsHabilitado && camaraHabilitada && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-5 text-red-600 font-bold text-center px-4"
        >
          No puedes marcar asistencia. Debes registrar tus credenciales faciales primero.
        </motion.div>
      )}

      {!cargando && origen === "marca" && ((!esUsuarioRemoto && !gpsHabilitado) || !camaraHabilitada) && (
        <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center">
          <p className="font-bold">Acceso Denegado</p>
          <p className="text-sm">
            {!esUsuarioRemoto && !gpsHabilitado && "• El GPS debe estar habilitado para registrar tu ubicación. "}
            {!camaraHabilitada && "• La cámara es necesaria para la validación facial."}
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