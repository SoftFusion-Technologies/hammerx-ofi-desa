/* --Autor: Sergio Manrique
--Fecha de creación: 08-04-2026
--Descripción: Formulario avanzado para la gestión de colaboradores en el módulo de RRHH. Permite configurar la modalidad de trabajo (presencial o remoto), vincular al usuario con múltiples sedes de forma simultánea y definir cronogramas horarios detallados. Incorpora una lógica inteligente de sincronización con la base de datos que identifica y procesa únicamente los cambios realizados (altas y bajas) para optimizar el rendimiento y la integridad de los registros.
*/
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { FaBuilding, FaPlus, FaTrash, FaLaptopHouse } from "react-icons/fa";
import { useAuth } from "../../AuthContext";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
};

const URL_BASE = "http://localhost:8080";

const DIAS_SEMANA = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "7", label: "Domingo" },
];

const crearBloqueHorario = (diasIniciales = ["1"]) => ({
  id: Date.now() + Math.random(),
  dias: diasIniciales,
  hora_entrada: "07:00",
  hora_salida: "12:00",
});

const normalizarColeccion = (data) => {
  if (Array.isArray(data)) return data;
  return data ? [data] : [];
};

const formatearHora = (hora) => String(hora || "").slice(0, 5);

const construirEstadoHorarios = (sedesIds, horariosExistentes) => {
  const estado = {};
  sedesIds.forEach((sedeId) => {
    estado[sedeId] = [];
  });

  const grupos = {};

  horariosExistentes.forEach((horario) => {
    const sedeId = Number(horario?.sede_id);
    if (!sedesIds.includes(sedeId)) return;

    const dia = String(horario?.dia_semana || "").trim();
    const entrada = formatearHora(horario?.hora_entrada);
    const salida = formatearHora(horario?.hora_salida);

    if (!dia || !entrada || !salida) return;

    const clave = `${sedeId}_${entrada}_${salida}`;
    if (!grupos[clave]) {
      grupos[clave] = {
        sedeId,
        dias: [],
        hora_entrada: entrada,
        hora_salida: salida,
      };
    }

    if (!grupos[clave].dias.includes(dia)) {
      grupos[clave].dias.push(dia);
    }
  });

  Object.values(grupos).forEach((grupo) => {
    estado[grupo.sedeId].push({
      id: Date.now() + Math.random(),
      dias: grupo.dias.sort(),
      hora_entrada: grupo.hora_entrada,
      hora_salida: grupo.hora_salida,
    });
  });

  Object.keys(estado).forEach((sedeId) => {
    estado[sedeId] = estado[sedeId].sort((a, b) =>
      a.hora_entrada.localeCompare(b.hora_entrada),
    );
    if (estado[sedeId].length === 0) {
      estado[sedeId] = [crearBloqueHorario()];
    }
  });

  return estado;
};

const FormAltaEmpleadoRRHH = ({
  cerrarModal,
  datosUsuario,
  obtenerUsuarios,
}) => {
  const [sedes, setSedes] = useState([]);
  const [selectedSedes, setSelectedSedes] = useState([]);
  const [horariosPorSede, setHorariosPorSede] = useState({});
  const [erroresHorario, setErroresHorario] = useState({});
  const [cargandoInicial, setCargandoInicial] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [esRemoto, setEsRemoto] = useState(false);
  const {
    authToken,
    userName: ctxUserName,
    userLevel: ctxUserLevel,
    userLevelAdmin: ctxUserLevelAdmin,
    userId: currentUserId,
    sedeName: ctxSedeName,
    name: ctxFullName,
    login,
  } = useAuth();

  const sedesSeleccionadas = useMemo(
    () => sedes.filter((sede) => selectedSedes.includes(sede.id)),
    [sedes, selectedSedes],
  );

  useEffect(() => {
    const cargarTodo = async () => {
      try {
        setCargandoInicial(true);
        const peticiones = [
          axios.get(`${URL_BASE}/sedes`),
          axios.get(`${URL_BASE}/rrhh/usuario-sede`),
        ];

        if (datosUsuario?.id) {
          peticiones.push(
            axios.get(
              `${URL_BASE}/rrhh/horarios?usuario_id=${datosUsuario.id}`,
            ),
          );
        }

        const [resSedes, resVinculacion, resHorarios] =
          await Promise.all(peticiones);

        const sedesNormalizadas = normalizarColeccion(resSedes?.data).filter(
          (s) =>
            s.es_ciudad &&
            Number(s.cupo_maximo_pilates) > 0 &&
            s.nombre.toLowerCase() !== "multisede",
        );
        setSedes(sedesNormalizadas);

        if (!datosUsuario?.id) return;

        const vinculacionesUsuario = normalizarColeccion(
          resVinculacion?.data,
        ).filter(
          (v) =>
            Number(v.usuario_id) === Number(datosUsuario.id) &&
            Number(v.eliminado) === 0,
        );

        const yaVinculadas = vinculacionesUsuario.map((v) => Number(v.sede_id));

        const remotoDetectado = vinculacionesUsuario.some(
          (v) => Number(v.remoto) === 1,
        );

        setEsRemoto(remotoDetectado);
        setSelectedSedes(yaVinculadas);

        const horariosExistentes = normalizarColeccion(resHorarios?.data);
        setHorariosPorSede(
          construirEstadoHorarios(yaVinculadas, horariosExistentes),
        );
      } catch (err) {
        console.error("Error cargando datos:", err);
        Swal.fire({
          title: "Error",
          text: "No se pudo cargar la información del colaborador.",
          icon: "error",
          confirmButtonColor: "#fc4b08",
        });
      } finally {
        setCargandoInicial(false);
      }
    };
    cargarTodo();
  }, [datosUsuario]);

  const handleSedeToggle = (id) => {
    setSelectedSedes((prev) => {
      const yaSeleccionada = prev.includes(id);
      const nuevasSedes = yaSeleccionada
        ? prev.filter((sedeId) => sedeId !== id)
        : [...prev, id];

      setHorariosPorSede((prevHorarios) => {
        const horariosActualizados = {};
        nuevasSedes.forEach((sedeId) => {
          const bloques = prevHorarios[sedeId];
          horariosActualizados[sedeId] =
            bloques && bloques.length > 0 ? bloques : [crearBloqueHorario()];
        });
        return horariosActualizados;
      });

      setErroresHorario({});
      return nuevasSedes;
    });
  };

  const agregarBloqueSede = (sedeId) => {
    setHorariosPorSede((previo) => ({
      ...previo,
      [sedeId]: [...(previo[sedeId] || []), crearBloqueHorario([])],
    }));
  };

  const eliminarBloqueSede = (sedeId, idBloque) => {
    setHorariosPorSede((previo) => ({
      ...previo,
      [sedeId]: (previo[sedeId] || []).filter(
        (bloque) => bloque.id !== idBloque,
      ),
    }));
  };

  const cambiarCampoBloqueSede = (sedeId, idBloque, campo, valor) => {
    setHorariosPorSede((previo) => ({
      ...previo,
      [sedeId]: (previo[sedeId] || []).map((bloque) =>
        bloque.id === idBloque ? { ...bloque, [campo]: valor } : bloque,
      ),
    }));
  };

  const alternarDiaBloqueSede = (sedeId, idBloque, dia) => {
    setHorariosPorSede((previo) => ({
      ...previo,
      [sedeId]: (previo[sedeId] || []).map((bloque) => {
        if (bloque.id !== idBloque) return bloque;
        const diaYaExiste = bloque.dias.includes(dia);
        return {
          ...bloque,
          dias: diaYaExiste
            ? bloque.dias.filter((d) => d !== dia)
            : [...bloque.dias, dia],
        };
      }),
    }));
  };

  const validarHorario = () => {
    const nuevosErrores = {};

    if (selectedSedes.length === 0) {
      nuevosErrores.general = "Seleccioná al menos una sede.";
    }

    selectedSedes.forEach((sedeId) => {
      const bloques = horariosPorSede[sedeId] || [];
      if (bloques.length === 0) {
        nuevosErrores[`sede_${sedeId}`] = "Agregá al menos una franja horaria.";
      }

      bloques.forEach((bloque) => {
        const prefijo = `${sedeId}_${bloque.id}`;

        if (bloque.dias.length === 0) {
          nuevosErrores[`dias_${prefijo}`] = "Seleccioná al menos un día.";
        }
        if (!bloque.hora_entrada) {
          nuevosErrores[`entrada_${prefijo}`] = "Ingresá hora de entrada.";
        }
        if (!bloque.hora_salida) {
          nuevosErrores[`salida_${prefijo}`] = "Ingresá hora de salida.";
        }
        if (
          bloque.hora_entrada &&
          bloque.hora_salida &&
          bloque.hora_entrada >= bloque.hora_salida
        ) {
          nuevosErrores[`salida_${prefijo}`] =
            "La salida debe ser mayor a la entrada.";
        }
      });
    });

    setErroresHorario(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const generarPayloadHorarios = () => {
    const fechaBase = new Date().toISOString().split("T")[0];

    return selectedSedes.flatMap((sedeId) =>
      (horariosPorSede[sedeId] || []).flatMap((bloque) =>
        bloque.dias.map((dia) => ({
          usuario_id: Number(datosUsuario.id),
          sede_id: Number(sedeId),
          dia_semana: Number(dia),
          hora_entrada: bloque.hora_entrada,
          hora_salida: bloque.hora_salida,
        })),
      ),
    );
  };

  const obtenerHorariosExistentes = async () => {
    try {
      const respuesta = await axios.get(
        `${URL_BASE}/rrhh/horarios?usuario_id=${datosUsuario.id}`,
      );
      return normalizarColeccion(respuesta?.data);
    } catch (error) {
      if (error?.response?.status === 404) return [];
      throw error;
    }
  };

const guardarCambios = async (e) => {
  e.preventDefault();

  if (!datosUsuario?.id) {
    Swal.fire({ title: "Error", text: "No se pudo identificar al colaborador.", icon: "error" });
    return;
  }

  if (!validarHorario()) {
    Swal.fire({ title: "Datos incompletos", text: "Completá sedes, días y horarios antes de guardar.", icon: "warning" });
    return;
  }

  const resultado = await Swal.fire({
    title: "¿Confirmar cambios?",
    text: "Se actualizarán únicamente los horarios modificados.",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#fc4b08",
    confirmButtonText: "Sí, guardar",
  });

  if (resultado.isConfirmed) {
    try {
      setGuardando(true);

      // 1. Actualizar vinculación de sede/remoto
      await axios.post(`${URL_BASE}/rrhh/usuario-sede`, {
        usuario_id: datosUsuario.id,
        sedes_ids: selectedSedes,
        remoto: esRemoto ? 1 : 0,
      });

      // 2. Obtener horarios actuales de la DB y generar el nuevo payload de la UI
      const horariosEnDB = await obtenerHorariosExistentes();
      const horariosEnUI = generarPayloadHorarios();

      // Función auxiliar para comparar si dos horarios son idénticos
      const sonIdenticos = (h1, h2) => {
        return (
          Number(h1.sede_id) === Number(h2.sede_id) &&
          Number(h1.dia_semana) === Number(h2.dia_semana) &&
          formatearHora(h1.hora_entrada) === formatearHora(h2.hora_entrada) &&
          formatearHora(h1.hora_salida) === formatearHora(h2.hora_salida)
        );
      };

      // 3. Identificar cuáles ELIMINAR (Están en DB pero no en la UI)
      const paraEliminar = horariosEnDB.filter(
        (db) => !horariosEnUI.some((ui) => sonIdenticos(db, ui))
      );

      // 4. Identificar cuáles AGREGAR (Están en la UI pero no en la DB)
      const paraAgregar = horariosEnUI.filter(
        (ui) => !horariosEnDB.some((db) => sonIdenticos(db, ui))
      );

      // 5. Ejecutar bajas (Soft delete)
      if (paraEliminar.length > 0) {
        await Promise.all(
          paraEliminar.map((h) => axios.delete(`${URL_BASE}/rrhh/horarios/${h.id}`))
        );
      }

      // 6. Ejecutar altas
      if (paraAgregar.length > 0) {
        await Promise.all(
          paraAgregar.map((h) => axios.post(`${URL_BASE}/rrhh/horarios`, h))
        );
      }

      await Swal.fire({
        title: "¡Guardado!",
        text: "Los cambios se aplicaron correctamente. Solo se modificaron los registros necesarios.",
        icon: "success",
        confirmButtonColor: "#fc4b08",
      });

      // Si el usuario editado es el mismo que está logueado, aseguramos que
      // la bandera `vinculadarrhh` se actualice en localStorage y en el contexto.
      if (Number(datosUsuario.id) === Number(currentUserId)) {
        try {
          localStorage.setItem("vinculadarrhh", "true");
          if (login) {
            login(
              authToken,
              ctxUserName,
              ctxUserLevel,
              currentUserId,
              ctxSedeName,
              ctxFullName,
              true,
              ctxUserLevelAdmin,
            );
          }
        } catch (e) {
          console.warn("No se pudo actualizar vinculadarrhh en contexto:", e);
        }
      }

      obtenerUsuarios();
      cerrarModal();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.mensajeError || "Error al procesar la solicitud",
        icon: "error",
      });
    } finally {
      setGuardando(false);
    }
  }
};

  const handleDesvincular = async () => {
    if (!datosUsuario?.id) {
      Swal.fire({ title: "Error", text: "No se pudo identificar al colaborador.", icon: "error" });
      return;
    }

    const resultado = await Swal.fire({
      title: "¿Desvincular RRHH?",
      text: "Confirmá que querés desvincular a este usuario de RRHH.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, desvincular",
    });

    if (!resultado.isConfirmed) return;

    try {
      setGuardando(true);
      const body = { activada : 0 };
      const config = {};
      if (authToken) config.headers = { Authorization: `Bearer ${authToken}` };
      await axios.put(`${URL_BASE}/users/${datosUsuario.id}`, body, config);

      await Swal.fire({
        title: "¡Desvinculado!",
        text: "El usuario fue desvinculado de RRHH correctamente.",
        icon: "success",
        confirmButtonColor: "#fc4b08",
      });

      if (Number(datosUsuario.id) === Number(currentUserId)) {
        try {
          localStorage.setItem("vinculadarrhh", "false");
          if (login) {
            login(
              authToken,
              ctxUserName,
              ctxUserLevel,
              currentUserId,
              ctxSedeName,
              ctxFullName,
              false,
              ctxUserLevelAdmin,
            );
          }
        } catch (e) {
          console.warn("No se pudo actualizar vinculadarrhh en contexto:", e);
        }
      }

      obtenerUsuarios();
      cerrarModal();
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: "Error",
        text: err?.response?.data?.mensajeError || "Error al procesar la solicitud",
        icon: "error",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="px-8 py-6 bg-orange-50 border-b border-orange-100 flex justify-between items-center">
          <h2 className="text-2xl font-extrabold text-[#fc4b08]">
            Vincular Sedes y Horarios
          </h2>
          <button
            onClick={cerrarModal}
            className="text-slate-400 text-xl hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto">
          <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">
                Colaborador
              </p>
              <p className="font-bold text-slate-800 italic">
                {datosUsuario?.name}
              </p>
            </div>
            <div>
              {datosUsuario?.activada === true && (
              <button
                type="button"
                onClick={handleDesvincular}
                disabled={guardando || cargandoInicial}
                className={`ml-4 px-3 py-1.5 rounded-md font-semibold text-white text-sm transition-all ${
                  guardando || cargandoInicial
                    ? "bg-slate-300"
                    : "bg-red-600 hover:bg-red-700 active:scale-95"
                }`}
              >
                Desvincular
              </button>
              )
              }
            </div>
          </div>
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Modalidad de trabajo
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEsRemoto(false)}
                className={`group rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                  !esRemoto
                    ? "border-[#fc4b08] bg-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-orange-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className={`text-sm font-extrabold ${
                        !esRemoto ? "text-[#fc4b08]" : "text-slate-700"
                      }`}
                    >
                      Presencial
                    </p>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      El colaborador marcará asistencia normalmente según sede y
                      horario.
                    </p>
                  </div>

                  <div
                    className={`mt-1 h-5 w-5 rounded-full border-2 transition-all ${
                      !esRemoto
                        ? "border-[#fc4b08] bg-[#fc4b08]"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                </div>
              </button>

              <button
                type="button"
                onClick={() => setEsRemoto(true)}
                className={`group rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                  esRemoto
                    ? "border-[#fc4b08] bg-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-orange-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 rounded-xl p-2 ${
                        esRemoto
                          ? "bg-[#fc4b08] text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <FaLaptopHouse className="text-sm" />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-extrabold ${
                          esRemoto ? "text-[#fc4b08]" : "text-slate-700"
                        }`}
                      >
                        Remoto
                      </p>
                      <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        El colaborador podrá trabajar fuera de sede.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-1 h-5 w-5 rounded-full border-2 transition-all ${
                      esRemoto
                        ? "border-[#fc4b08] bg-[#fc4b08]"
                        : "border-slate-300 bg-white"
                    }`}
                  />
                </div>
              </button>
            </div>

            {esRemoto && (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-sm font-bold text-amber-800">
                  Colaborador en modalidad remota
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-700">
                  Se informará al sistema que este usuario puede desempeñar sus
                  tareas de forma remota. Esto permitirá contemplar su modalidad
                  laboral al momento de gestionar asistencia y operación
                  interna.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={guardarCambios}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {cargandoInicial ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-[#fc4b08] rounded-full animate-spin mb-2"></div>
                  <p className="text-slate-400 text-sm">Procesando...</p>
                </div>
              ) : (
                sedes.map((sede) => (
                  <button
                    type="button"
                    key={sede.id}
                    onClick={() => handleSedeToggle(sede.id)}
                    className={`flex items-center justify-between rounded-xl border-2 px-5 py-3 transition-all
                      ${
                        selectedSedes.includes(sede.id)
                          ? "bg-orange-50 border-[#fc4b08] text-[#fc4b08] shadow-sm"
                          : "bg-white border-slate-100 text-slate-600 hover:border-orange-200"
                      }`}
                  >
                    <span className="font-bold text-sm tracking-wide">
                      {sede.nombre.toUpperCase()}
                    </span>
                    {selectedSedes.includes(sede.id) && (
                      <span className="text-[10px] font-black bg-orange-200 px-2 py-1 rounded">
                        ACTIVO
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>

            {erroresHorario.general && (
              <p className="mt-2 text-xs text-red-500 font-semibold">
                {erroresHorario.general}
              </p>
            )}

            {sedesSeleccionadas.length > 0 && (
              <div className="mt-8 space-y-6">
                {sedesSeleccionadas.map((sede) => (
                  <div
                    key={sede.id}
                    className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <FaBuilding className="text-orange-600" />
                      <h3 className="font-bold text-gray-800 uppercase tracking-wide">
                        {sede.nombre}
                      </h3>
                    </div>

                    {erroresHorario[`sede_${sede.id}`] && (
                      <p className="mb-3 text-xs text-red-500 font-semibold">
                        {erroresHorario[`sede_${sede.id}`]}
                      </p>
                    )}

                    <div className="space-y-3">
                      {(horariosPorSede[sede.id] || []).map((bloque, index) => (
                        <div
                          key={bloque.id}
                          className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-orange-700 uppercase">
                              Franja {index + 1}
                            </p>
                            {(horariosPorSede[sede.id] || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  eliminarBloqueSede(sede.id, bloque.id)
                                }
                                className="text-xs text-red-600 hover:underline flex items-center gap-1"
                              >
                                <FaTrash /> Quitar
                              </button>
                            )}
                          </div>

                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {DIAS_SEMANA.map((dia) => {
                                const activo = bloque.dias.includes(dia.value);
                                return (
                                  <button
                                    key={dia.value}
                                    type="button"
                                    onClick={() =>
                                      alternarDiaBloqueSede(
                                        sede.id,
                                        bloque.id,
                                        dia.value,
                                      )
                                    }
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                                      activo
                                        ? "bg-orange-600 text-white border-orange-600"
                                        : "bg-white text-gray-500 border-gray-200"
                                    }`}
                                  >
                                    {dia.label}
                                  </button>
                                );
                              })}
                            </div>
                            {erroresHorario[`dias_${sede.id}_${bloque.id}`] && (
                              <p className="mt-1 text-[10px] text-red-500 font-semibold">
                                {erroresHorario[`dias_${sede.id}_${bloque.id}`]}
                              </p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                Entrada
                              </label>
                              <input
                                type="time"
                                value={bloque.hora_entrada}
                                onChange={(e) =>
                                  cambiarCampoBloqueSede(
                                    sede.id,
                                    bloque.id,
                                    "hora_entrada",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-gray-200 py-2 px-2 text-xs focus:ring-1 focus:ring-orange-300 outline-none"
                              />
                              {erroresHorario[
                                `entrada_${sede.id}_${bloque.id}`
                              ] && (
                                <p className="mt-1 text-[10px] text-red-500 font-semibold">
                                  {
                                    erroresHorario[
                                      `entrada_${sede.id}_${bloque.id}`
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase">
                                Salida
                              </label>
                              <input
                                type="time"
                                value={bloque.hora_salida}
                                onChange={(e) =>
                                  cambiarCampoBloqueSede(
                                    sede.id,
                                    bloque.id,
                                    "hora_salida",
                                    e.target.value,
                                  )
                                }
                                className="w-full rounded-lg border border-gray-200 py-2 px-2 text-xs focus:ring-1 focus:ring-orange-300 outline-none"
                              />
                              {erroresHorario[
                                `salida_${sede.id}_${bloque.id}`
                              ] && (
                                <p className="mt-1 text-[10px] text-red-500 font-semibold">
                                  {
                                    erroresHorario[
                                      `salida_${sede.id}_${bloque.id}`
                                    ]
                                  }
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => agregarBloqueSede(sede.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700"
                      >
                        <FaPlus /> AGREGAR FRANJA A {sede.nombre}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={cerrarModal}
                className="flex-1 py-3 rounded-xl bg-slate-100 font-bold text-slate-500 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando || cargandoInicial}
                className={`flex-[2] py-3 rounded-xl font-bold text-white shadow-lg transition-all
                  ${guardando || cargandoInicial ? "bg-slate-300" : "bg-[#fc4b08] hover:bg-orange-600 active:scale-95"}`}
              >
                {guardando ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FormAltaEmpleadoRRHH;
