/* 
Autor: Sergio Manrique
Fecha: 2024-06-20
Descripción: Modal para que los usuarios puedan anotarse en la lista de espera de una sede cuando un horario está lleno. Este modal es público y no requiere autenticación, por lo que se enfoca en la simplicidad y facilidad de uso. Se integra con el backend para registrar las solicitudes de lista de espera y utiliza SweetAlert2 para mostrar mensajes de éxito o error al usuario.
*/

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, Calendar, Clock, MessageSquare, Send } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

// Modal público para que un usuario se anote en la lista de espera de una sede
const ModalListaEsperaPublico = ({ isOpen, onClose, sedeDatos, horarioSugerido, horarioFiltrados, turnoSeleccionado }) => {

  // Estado principal del formulario
  const [formulario, setFormulario] = useState({
    nombre: "",
    celular: "",
    plan: "L-M-V",
    horarios: [],
    notas: "",
  });

  // Estado que controla si se está enviando la solicitud
  const [cargando, setCargando] = useState(false);

  // Cada vez que se abre el modal, resetea el formulario y marca el horario sugerido o el del turno seleccionado
  useEffect(() => {
    if (isOpen) {
      if (turnoSeleccionado) {
        const nuevoPlan = turnoSeleccionado.grp === "LMV" ? "L-M-V" : "M-J";
        setFormulario({
          nombre: "",
          celular: "",
          plan: nuevoPlan,
          horarios: [turnoSeleccionado.hhmm],
          notas: "",
        });
      } else if (horarioSugerido) {
        setFormulario({
          nombre: "",
          celular: "",
          plan: "L-M-V",
          horarios: [horarioSugerido],
          notas: "",
        });
      } else {
        setFormulario({
          nombre: "",
          celular: "",
          plan: "L-M-V",
          horarios: [],
          notas: "",
        });
      }
    }
  }, [isOpen, turnoSeleccionado, horarioSugerido]);

  // Maneja cambios de inputs del formulario (nombre, celular, notas)
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  // Agrega o quita horarios del array seleccionado
  const toggleHorario = (hora) => {
    setFormulario((prev) => ({
      ...prev,
      horarios: prev.horarios.includes(hora)
        ? prev.horarios.filter((h) => h !== hora)
        : [...prev.horarios, hora],
    }));
  };

  // Función que envía la solicitud al backend
  const enviarSolicitud = async () => {

    // Validación de campos obligatorios
    if (!formulario.nombre.trim() || !formulario.celular.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor, ingresa tu nombre y un contacto para que podamos avisarte.",
        confirmButtonColor: "#ea580c"
      });
      return;
    }

    // Debe seleccionar al menos un horario
    if (formulario.horarios.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona horario",
        text: "Es necesario que marques al menos un horario de interés.",
        confirmButtonColor: "#ea580c"
      });
      return;
    }

    setCargando(true);

    // Loader visual mientras se procesa la solicitud
    Swal.fire({
      title: 'Procesando...',
      text: 'Estamos registrando tu solicitud en la lista de espera.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Verifica que exista una sede válida
    if(!sedeDatos || !sedeDatos.id) {
      Swal.fire({
        icon: "error",
        title: "Sede no válida",
        text: "No se pudo identificar la sede seleccionada. Por favor, cierra el formulario y vuelve a intentarlo.",
        confirmButtonColor: "#ef4444"
      });
      setCargando(false);
      return;
    }

    // Construcción del objeto que se enviará al backend
    const datosEnvio = {
      nombre: formulario.nombre,
      contacto: formulario.celular,
      tipo: "Espera", 
      plan_interes: formulario.plan, 
      horarios_preferidos: formulario.horarios.join(", "),
      observaciones: formulario.notas,
      id_sede: sedeDatos?.id, 
      id_usuario_cargado: null, 
    };

    try {

      // Envío al endpoint de lista de espera
      const respuesta = await axios.post("http://localhost:8080/lista-espera-pilates", datosEnvio);

      // Si el backend responde correctamente
      if (respuesta.status === 201 || respuesta.status === 200) {

        await Swal.fire({
          icon: "success",
          title: "¡Listo!",
          text: `Te has anotado correctamente en la lista de espera de la sede ${sedeDatos?.nombre || 'seleccionada'}.`,
          confirmButtonColor: "#ea580c",
          timer: 3000
        });

        // Reseteo del formulario
        setFormulario({
          nombre: "",
          celular: "",
          plan: "L-M-V",
          horarios: [],
          notas: "",
        });

        // Cierre del modal
        onClose();
      }

    } catch (error) {

      // Manejo de errores del backend o conexión
      console.error("Error al cargar en lista de espera:", error);

      Swal.fire({
        icon: "error",
        title: "No se pudo completar",
        text: error.response?.data?.error || "Ocurrió un error al conectar con el servidor. Intenta de nuevo.",
        confirmButtonColor: "#ef4444"
      });

    } finally {
      setCargando(false);
    }
  };

  // Determina qué horarios deben mostrarse según el plan elegido
  const obtenerHorariosAMostrar = () => {

    if (!horarioFiltrados) return [];

    // Caso especial: cuando el usuario elige "Cualquier día"
    if (formulario.plan === "Cualquier dia") {

      // Se obtienen horas únicas
      const horasUnicas = [...new Set(horarioFiltrados.map(item => item.hhmm))];
      
      return horasUnicas
        .filter(hora => {

          const registrosDeHora = horarioFiltrados.filter(h => h.hhmm === hora);

          const bloqueadoLMV = registrosDeHora.find(h => h.grp === "LMV")?.tipo_bloqueo === true;
          const bloqueadoMJ = registrosDeHora.find(h => h.grp === "MJ")?.tipo_bloqueo === true;

          // Solo se oculta si ambos grupos están bloqueados
          return !(bloqueadoLMV && bloqueadoMJ);
        })
        .sort()
        .map(hora => ({ hhmm: hora }));
    }

    // Filtrado normal según el plan seleccionado
    const mapeoPlan = formulario.plan === "L-M-V" ? "LMV" : "MJ";

    return horarioFiltrados.filter(item => 
      item.grp === mapeoPlan && Number(item.total_inscriptos) >= Number(item.cupo_por_clase)
    );
  };

  // Horarios finales que se mostrarán en la interfaz
  const horariosFinales = obtenerHorariosAMostrar();

  // Si el modal no está abierto no se renderiza nada
  if (!isOpen) return null;

  return (
    <AnimatePresence>

      {/* Fondo oscuro con blur */}
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 font-messina">

        {/* Overlay oscuro que también permite cerrar el modal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Contenedor principal del modal */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-white w-full h-full sm:h-[90vh] sm:max-w-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >

          {/* Encabezado del modal */}
          <div className="bg-orange-600 p-3 sm:p-6 text-white flex justify-between items-center shrink-0">

            <div>
              <h2 className="text-xl sm:text-3xl font-bignoodle tracking-wide uppercase leading-tight">
                ¡ Anotate a lista de Espera !
              </h2>

              {/* Nombre de la sede */}
              <p className="text-orange-100 text-xs sm:text-sm font-medium uppercase tracking-wider">
                Sede: {sedeDatos?.nombre || "Seleccionada"}
              </p>
            </div>

            {/* Botón para cerrar el modal */}
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X size={22} />
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-4 sm:space-y-8 pb-24 sm:pb-8">
            
            {/* Sección datos personales */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1 sm:mb-2">
                <User size={18} className="sm:w-[22px] sm:h-[22px]" />
                <span className="font-bold uppercase text-xs sm:text-sm tracking-widest">Tus Datos</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 sm:gap-5">

                {/* Nombre */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 ml-1 uppercase">
                    Nombre y Apellido (Obligatorio)
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambio}                 
                    className="w-full p-2.5 sm:p-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white transition-all outline-none text-sm sm:text-lg font-semibold"
                  />
                </div>

                {/* Celular */}
                <div className="space-y-1">
                  <label className="text-xs font-black text-gray-400 ml-1 uppercase">
                    Tu Celular (Obligatorio)
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formulario.celular}
                    onChange={manejarCambio}
                    className="w-full p-2.5 sm:p-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-orange-500 focus:bg-white transition-all outline-none text-sm sm:text-lg font-semibold"
                  />
                </div>

              </div>
            </div>

            {/* Selección de días */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1 sm:mb-2">
                <Calendar size={18} className="sm:w-[22px] sm:h-[22px]" />
                <span className="font-bold uppercase text-xs sm:text-sm tracking-widest">
                  Días que prefieres
                </span>
              </div>

              {/* Botones de selección de plan */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { id: "L-M-V", label: "Lun-Mié-Vie" },
                  { id: "M-J", label: "Mar-Jue" },
                  { id: "Cualquier dia", label: "Cualquier día" }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setFormulario({ ...formulario, plan: p.id, horarios: [] })}
                    className={`p-2 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-base transition-all ${
                      formulario.plan === p.id 
                      ? "border-orange-600 bg-orange-600 text-white shadow-lg scale-[1.02]" 
                      : "border-gray-200 bg-white text-gray-500 hover:border-orange-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Selección de horarios */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1 sm:mb-2">
                <Clock size={18} className="sm:w-[22px] sm:h-[22px]" />
                <span className="font-bold uppercase text-xs sm:text-sm tracking-widest">
                  Horarios de interés
                </span>
              </div>

              {/* Grid de horarios disponibles */}
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {horariosFinales.length > 0 ? (
                  horariosFinales.map((item) => {
                    const seleccionado = formulario.horarios.includes(item.hhmm);
                    return (
                      <button
                        key={item.hhmm}
                        onClick={() => toggleHorario(item.hhmm)}
                        className={`relative py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 font-bold text-sm sm:text-base transition-all ${
                          seleccionado
                          ? "border-orange-600 bg-orange-600 text-white shadow-md"
                          : "border-gray-100 bg-gray-50 text-gray-600"
                        }`}
                        type="button"
                      >
                        {item.hhmm}
                        {seleccionado && (
                          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5">
                            <X size={14} className="text-white bg-orange-500 rounded-full p-[1px] shadow" />
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-full p-3 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl text-center border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 italic text-xs sm:text-sm">
                      No hay horarios disponibles para esta selección.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Campo opcional de observaciones */}
            <div className="space-y-2 sm:space-y-4">
              <div className="flex items-center gap-2 text-orange-600 mb-1 sm:mb-2">
                <MessageSquare size={18} className="sm:w-[22px] sm:h-[22px]" />
                <span className="font-bold uppercase text-xs sm:text-sm tracking-widest">
                  ¿Algo más? (Opcional)
                </span>
              </div>

              <textarea
                name="notas"
                value={formulario.notas}
                onChange={manejarCambio}
                rows="2"
                placeholder="¿Querés contarnos algo más sobre vos para nuestros profes?"
                className="w-full p-2.5 sm:p-4 bg-gray-50 border-2 border-gray-100 rounded-xl sm:rounded-2xl focus:border-orange-500 outline-none resize-none text-sm sm:text-lg"
              />
            </div>

          </div>

          {/* Footer con botón de envío */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-white via-white to-transparent sm:relative border-t border-gray-50 sm:border-none">
            <button
              onClick={enviarSolicitud}
              disabled={cargando || !formulario.nombre || !formulario.celular}
              className={`w-full py-3 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl flex items-center justify-center gap-2 sm:gap-3 shadow-2xl transition-all active:scale-[0.98] ${
                cargando || !formulario.nombre || !formulario.celular
                ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              <Send size={20} className="sm:w-6 sm:h-6" /> 
              {cargando ? "ENVIANDO..." : "ANOTARME AHORA"}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ModalListaEsperaPublico;