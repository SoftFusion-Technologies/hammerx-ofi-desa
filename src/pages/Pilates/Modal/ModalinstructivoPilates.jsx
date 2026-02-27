import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaUserPlus,
  FaSyncAlt,
  FaClipboardList,
  FaChartBar,
  FaExchangeAlt,
} from "react-icons/fa";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Info,
  ListOrdered,
  ShieldAlert,
} from "lucide-react";
import img_cargar_alumno from "../img/Cargar_alumno.png";
import img_cambiar_turno from "../img/Cambiar_turno.png";
import img_clase_prueba from "../img/Clases_de_prueba.png";
import img_clase_prueba_ventas from "../img/Desde_ventas_clasesprueba.png";
import img_clase_prueba_3 from "../img/Clase_prueba_3.png";
import img_clase_prueba_4 from "../img/Clase_prueba_4.png";
import img_renovacion_programada from "../img/Renovacion_programada.png";
import img_renovacion_progrmada_2 from "../img/Renovacion_programada_2.png";
import img_renovacion_directa from "../img/Renovacion_directa.png";
import img_renovacion_anticipada from "../img/Renovacion_anticipada.png";
import img_lista_espera from "../img/Lista_de_espera.png";
import img_lista_cambio from "../img/Lista_espera_cambio.png";
import img_lista_espera_contacto from "../img/Lista_de_espera_contacto.png";
import img_turnos_con_descuentos from "../img/Turnos_con_descuentos.png";
import img_turnos_libres from "../img/Turnos_libres.png";
import img_alumnos_ausentes from "../img/Alumnos_ausentes.png";
import img_planes_vencidos from "../img/Planes_vencidos.png";
import img_tenes_turnos_libres_para from "../img/Tenes_turnos_libres_para.png";
import img_cupos_emergencia from "../img/Cupos_emergencia.png";
import img_alumnos_ausentes_2 from "../img/Alumnos_ausentes_2.png";
import img_alumnos_ausentes_3 from "../img/Alumnos_ausentes_3.png";
import img_alumnos_ausentes_4 from "../img/Alumnos_ausentes_4.png";

const ModalInstructivoPilates = ({ estaAbierto, alCerrar }) => {
  const variantesFondo = {
    oculto: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const variantesModal = {
    oculto: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    salida: { opacity: 0, scale: 0.95, y: 20 },
  };

  if (!estaAbierto) return null;

  return (
    <AnimatePresence>
      {estaAbierto && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm font-messina"
          initial="oculto"
          animate="visible"
          exit="oculto"
          variants={variantesFondo}
          onClick={alCerrar}
        >
          <motion.div
            className="relative w-full max-w-7xl bg-gray-50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            variants={variantesModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-bignoodle tracking-wide flex items-center gap-2">
                  <Info className="w-6 h-6" />
                  Instructivo de Gestión de Pilates
                </h2>
                <p className="text-orange-100 text-xs sm:text-sm">
                  Guía completa de uso del sistema, estados y reglas de negocio
                </p>
              </div>
              <button
                onClick={alCerrar}
                className="text-orange-100 hover:text-white hover:bg-orange-600 p-2 rounded-full transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 font-messina">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-orange-600 mb-3 flex items-center gap-2 border-b pb-2">
                      <FaUserPlus /> 1. Gestión Básica de Alumnos
                    </h3>
                    <div className="space-y-3 text-xs text-gray-700">
                      <div>
                        <span className="font-bold text-gray-900">
                          Cargar Alumno Nuevo:
                        </span>
                        <p className="mt-1">
                          Desde el área de gestión, clic en "Agregar alumno" en
                          el turno. Completar datos, tipo de plan y fecha de
                          inicio (debe coincidir con Socioplus).
                        </p>
                        <div className="flex">
                          <img
                            src={img_cargar_alumno}
                            className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Cargar Alumno Nuevo"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">
                          Cambiar de Turno:
                        </span>
                        <p className="mt-1">
                          Clic en "Cambiar turno" y elegir horarios verdes. Si
                          se elige uno no disponible, se agregará a "Lista de
                          cambio" y no se hará automáticamente hasta que se
                          desocupe el lugar.
                        </p>
                        <img
                          src={img_cambiar_turno}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Cambiar Turno"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" /> Clases de Prueba
                          (Solo alumnos nuevos):
                        </span>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>
                            Se puede cargar desde "Estado/Plan" eligiendo "Clase
                            de prueba".
                          </li>
                          <li>
                            También se puede cargar desde ventas (solo
                            vendedores), seleccionando día y horario específico
                            para alumnos nuevos.
                          </li>
                          <li>
                            Una vez cargada la clase, el profe debe marcar o no
                            la asistencia para definir el mensaje del día
                            siguiente:
                            <ul className="list-[upper-alpha] pl-5 mt-1 space-y-1">
                              <li>"No asistido".</li>
                              <li>"Con fecha programada".</li>
                              <li>"Asistido".</li>
                            </ul>
                          </li>
                          <li>
                            Si luego de asistir se inscribe, actualizar a "Plan
                            contratado" y elegir fecha de inicio.
                          </li>
                          <li>
                            Si programa nueva visita para abonar o inscribirse,
                            seleccionar "Visita programada".
                          </li>
                        </ul>
                        <img
                          src={img_clase_prueba}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Clase de Prueba"
                        />
                        <span className="text-xs mt-1 block">
                          Desde ventas se lo visualiza así:
                        </span>
                        <img
                          src={img_clase_prueba_ventas}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Clase de Prueba"
                        />
                        <span className="text-xs mt-1 block">
                          Alumno de clase de prueba ausente
                        </span>
                        <img
                          src={img_clase_prueba_3}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Clase de Prueba"
                        />
                        <span className="text-xs mt-1 block">
                          Alumno de clase de prueba con asistencia
                        </span>
                        <img
                          src={img_clase_prueba_4}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Clase de Prueba"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-orange-600 mb-3 flex items-center gap-2 border-b pb-2">
                      <FaSyncAlt /> 2. Visitas y Renovaciones
                    </h3>
                    <div className="space-y-3 text-xs text-gray-700">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          <div>
                            <strong>Visita Programada:</strong> Prospecto que
                            aún no abonó e hizo promesa de contratación para una
                            fecha (ej: consulta lunes, arranca miércoles). O el
                            que hizo clase de prueba y prometió contratar en una
                            fecha específica.
                            <div className="mt-1">
                              Este estado luego debe pasar a "Plan contratado" o
                              a "Reprogramación de visita programada" si falta.
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                          <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <strong>Renovación Programada:</strong> Socio con
                            plan vencido que confirma que irá a renovar. Cuando
                            paga, se cambia a "Renovación de plan".
                            <ul className="list-[upper-alpha] pl-5 mt-1 space-y-1">
                              <li>
                                Si la fecha aún no llegó, se mantiene normal.
                              </li>
                              <li>
                                Si la fecha ya pasó, aparece en rojo y abajo
                                indica "renueva el dd/mm" (para diferenciar de
                                "vencido").
                              </li>
                              <li>
                                Al renovar (paga), toma automáticamente el
                                último día de vencimiento del plan anterior (no
                                el día de pago).
                              </li>
                            </ul>
                            <div className="mt-2 space-y-2">
                              <img
                                src={img_renovacion_programada}
                                className="w-full max-w-52 h-auto rounded-lg border border-gray-300"
                                alt="Renovación Programada"
                              />
                              <img
                                src={img_renovacion_progrmada_2}
                                className="w-full max-w-md h-auto rounded-lg border border-gray-300"
                                alt="Renovación Programada"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                          <FaExchangeAlt className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                          <div>
                            <strong>Renovación Directa:</strong> Plan vencido y
                            el socio fue y abonó directamente en recepción sin
                            previo aviso.
                            <ul className="list-[upper-alpha] pl-5 mt-1 space-y-1">
                              <li>Click en "Renovación directa".</li>
                              <li>
                                Elegir duración: mensual, trimestral, semestral
                                o anual.
                              </li>
                              <li>
                                Verificar fecha de inicio (vencimiento anterior)
                                y vencimiento correcto.
                              </li>
                              <li>Click en "Actualizar".</li>
                            </ul>
                            <img
                              src={img_renovacion_directa}
                              className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                              alt="Renovación Directa"
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-2 bg-gray-50 p-2 rounded">
                          <CalendarDays className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                          <div>
                            <strong>Renovación Anticipada:</strong> Socio que
                            renueva por adelantado antes de que venza su plan.
                          </div>
                        </div>
                        <img
                          src={img_renovacion_anticipada}
                          className="w-full max-w-md h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Renovación Anticipada"
                        />
                      </div>
                      <div className="bg-orange-50 border border-orange-100 p-2 rounded">
                        <strong>Regla clave de Pilates:</strong> Todas las
                        renovaciones se hacen desde el último día vencido del
                        plan anterior, no desde la fecha en que paga.
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-orange-600 mb-3 flex items-center gap-2 border-b pb-2">
                      <ListOrdered /> 3. Circuito Completo de un Prospecto
                    </h3>
                    <ol className="list-decimal pl-5 space-y-1 text-xs text-gray-700">
                      <li>Clase de prueba pactada.</li>
                      <li>
                        No Asiste y reprograma ➔ "Reprogramación de clase de
                        prueba".
                      </li>
                      <li>Asiste.</li>
                      <li>
                        Notifica que mañana contrata ➔ "Visita programada" con
                        fecha de mañana.
                      </li>
                      <li>Falta ➔ "Reprogramación de visita programada".</li>
                      <li>Asiste y se inscribe ➔ "Plan contratado".</li>
                      <li>
                        Se vence su plan y notifica que abona al otro día ➔
                        "Renovación programada".
                      </li>
                      <li>Asiste y abona ➔ "Renovación de plan".</li>
                    </ol>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-orange-600 mb-3 flex items-center gap-2 border-b pb-2">
                      <FaClipboardList /> 4. Listas de Espera y Cambio
                    </h3>
                    <div className="space-y-3 text-xs text-gray-700">
                      <div className="flex flex-col md:flex-row gap-2">
                        <div className="bg-orange-50 p-2 rounded flex-1">
                          <strong>Lista de Espera:</strong> Socios nuevos. Clic
                          en agregar, completar datos y horarios.
                          <img
                            src={img_lista_espera}
                            className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Lista de Espera"
                          />
                        </div>

                        <div className="bg-blue-50 p-2 rounded flex-1">
                          <strong>Lista de Cambio:</strong> Socio activo
                          buscando otro horario.
                          <div className="mt-1">
                            Se puede cargar desde "tipo" cambiando de "lista de
                            espera" a "lista de cambio" (buscando un socio ya
                            existente), o desde Gestión &gt; socio &gt; "Cambiar
                            turno" al seleccionar un turno sin lugar.
                          </div>
                          <img
                            src={img_lista_cambio}
                            className="w-full max-w-48 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Lista de Cambio"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block mb-1">
                          ¿Cómo convertir a un socio a activo?
                        </span>
                        <ol className="list-decimal pl-5 space-y-1 bg-gray-50 p-2 rounded border border-gray-100">
                          <li>Se desocupa un lugar, enviamos mensaje.</li>
                          <li>
                            Entramos al perfil y marcamos{" "}
                            <span className="bg-yellow-300 text-yellow-900 px-1 rounded font-bold">
                              Pendiente
                            </span>{" "}
                            (Aparece en amarillo).
                          </li>
                          <li>
                            Al día siguiente verificamos respuesta:
                            <ul className="list-disc pl-5 mt-1">
                              <li>
                                <strong>Confirmar:</strong> Elegir horario
                                específico (Se va a verde).
                              </li>
                              <li>
                                <strong>Rechazar:</strong> Casos que no
                                respondan o no irán (Se queda en rojo).
                              </li>
                            </ul>
                          </li>
                        </ol>
                        <img
                          src={img_lista_espera_contacto}
                          className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Lista de Espera Contacto"
                        />
                        <p className="mt-1 text-gray-500 italic">
                          Siempre debe pasar por pendiente primero (indica que
                          nos contactamos).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <h3 className="text-base font-bold text-orange-600 mb-3 flex items-center gap-2 border-b pb-2">
                      <FaChartBar /> 5. Dashboard y Gestión de Ausentes
                    </h3>
                    <div className="space-y-3 text-xs text-gray-700">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="bg-gray-100 p-2 rounded">
                          <strong>Turnos Libres:</strong> Para consultar rápido
                          sin revisar planilla.
                          <img
                            src={img_turnos_libres}
                            className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Turnos Libres"
                          />
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <strong>Planes Vencidos:</strong> Para enviar msj
                          (turno mañana).
                          <img
                            src={img_planes_vencidos}
                            className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Planes Vencidos"
                          />
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <strong>Alumnos Ausentes:</strong> Sin asistencias de
                          los profes.
                          <img
                            src={img_alumnos_ausentes}
                            className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Alumnos Ausentes"
                          />
                        </div>
                        <div className="bg-gray-100 p-2 rounded">
                          <strong>Turnos para Listas:</strong> Lugares
                          disponibles para convertir listas de espera.
                          Idealmente debería estar vacío porque se contacta de
                          inmediato.
                          <img
                            src={img_tenes_turnos_libres_para}
                            className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                            alt="Turnos para Listas"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <span className="font-bold text-gray-900 block mb-1">
                          Instructivo Alumnos Ausentes:
                        </span>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Se visualizan en la tabla. En "ver detalle" abre
                            cuadro de gestión.
                            <img
                              src={img_alumnos_ausentes_2}
                              className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                              alt="Alumnos Ausentes"
                            />
                          </li>
                          <li>
                            Al contactarnos, damos clic en "contactado",
                            colocamos observación ("Se realiza el contacto") y
                            guardamos.
                            <img
                              src={img_alumnos_ausentes_3}
                              className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                              alt="Alumnos Ausentes"
                            />
                            <img
                              src={img_alumnos_ausentes_4}
                              className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                              alt="Alumnos Ausentes"
                            />
                          </li>
                          <li>
                            El alumno pasa a{" "}
                            <span className="text-green-600 font-bold">
                              Verde
                            </span>{" "}
                            (sigue ausente hasta que el profe marque
                            asistencia).
                          </li>
                          <li>
                            Si pasan 15 días y sigue sin asistir, vuelve a{" "}
                            <span className="text-yellow-600 font-bold">
                              Amarillo
                            </span>{" "}
                            para un segundo contacto.
                          </li>
                        </ul>
                      </div>

                      <div className="border-t pt-2">
                        <span className="font-bold text-gray-900 block mb-1">
                          Turnos con descuentos:
                        </span>
                        <p>
                          Se visualizan en el dashboard con su indicador
                          específico para distinguirlos de turnos normales.
                        </p>
                        <img
                          src={img_turnos_con_descuentos}
                          className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                          alt="Turnos con Descuentos"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <h3 className="text-base font-bold text-red-700 mb-3 flex items-center gap-2 border-b border-red-200 pb-2">
                      <ShieldAlert /> 6. Turnos de Emergencia y Consideraciones
                    </h3>
                    <div className="space-y-2 text-xs text-red-900">
                      <p>
                        <strong>Turnos de Emergencia:</strong> Debajo de cada
                        turno completo. Solo se usa ante equivocaciones y dar un
                        turno de más. Al desocuparse un lugar, el socio pasa
                        automáticamente.
                      </p>
                      <ol className="list-decimal pl-5 space-y-1 font-medium mt-2">
                        <li>
                          <strong>Nombres:</strong> No repetir. Solo para planes
                          de 5 días diferenciar como "Nombre M-J" y "Nombre
                          L-M-V".
                        </li>
                        <li>
                          <strong>Congelamientos:</strong> Pilates NO permite
                          congelar ni recuperar por feriados/faltas (salvo
                          excepciones por falta de profe, lesiones del gym o
                          casos de salud muy graves definidos por coordinación).
                        </li>
                        <li>
                          <strong>Turnos fijos:</strong> Deben venir a su turno
                          siempre, no se modifican.
                        </li>
                        <li>
                          <strong>Tipos de planes:</strong> 2 o 3 veces por
                          semana. Si quieren días cambiados 2 veces, compran el
                          de 3 y van 2. Pases full aplican mismas reglas.
                        </li>
                        <li>
                          <strong>Renovación:</strong> Siempre se hace sobre el
                          último día vencido, no desde el día que paga (por
                          demoras).
                        </li>
                      </ol>
                      <img
                        src={img_cupos_emergencia}
                        className="w-full max-w-64 h-auto mt-2 rounded-lg border border-gray-300"
                        alt="Cupos de Emergencia"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 px-6 py-4 border-t border-gray-200 flex justify-end shrink-0">
              <button
                onClick={alCerrar}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors text-sm"
              >
                Entendido, cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalInstructivoPilates;
