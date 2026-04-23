import React, { useState } from "react";
import BarraBusqueda from "../../Reciclables/BarraBusqueda";
import BotonVolver from "../../Reciclables/BotonVolver";
import Tabla from "../../Reciclables/Tabla";
import { FaPlaneDeparture } from "react-icons/fa";
import {
  normalizarSedes,
  normalizarSedes_2,
} from "../../../Utils/NormalizarSedes";
import { usarPromiseAll } from "../../../hooks/usarPromiseAll";
import dayjs from "dayjs";
import ModalAsignarVacaciones from "../../../Modals/RRHH/ModalAsignarVacaciones";
import { encabezadoTablaVacacionesProgramadas } from "./helpers/encabezadoTabla";
import { TreePalm } from "lucide-react";
import { useAuth } from "../../../../../AuthContext";
import { esAdminRRHH } from "../../../Utils/AdminAutorizadosRRHH";

const VacacionesProgramadas = ({ volverAtras }) => {
  const [busqueda, setBusqueda] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("todas_sedes");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [filtroVacaciones, setFiltroVacaciones] = useState("todos");

  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");
  const usuarioAuth = useAuth();

  const titulos = {
    titulo: "Vacaciones Programadas",
    subtitulo: "Consulta las vacaciones programadas de los empleados.",
    icono: <FaPlaneDeparture className="text-orange-500" />,
  };

  // 1. Validamos permisos
  const esAdminAutorizadoRRHHH = esAdminRRHH(
    usuarioAuth.userLevel,
    usuarioAuth.userLevelAdmin,
  );

  // 2. Fetch de Vacaciones
  const { datos: datosVacaciones, ejecutar: refetchVacaciones } =
    usarPromiseAll([{ endpoint: "rrhh/vacaciones-programadas" }]);

  // 3. Fetch de Usuarios y Sedes (Lógica movida de la barra)
  const { datos: datosUsuariosSedes } = usarPromiseAll([
    { endpoint: "rrhh/usuario-sede" },
    { endpoint: "sedes" },
  ]);

  const vacaciones = datosVacaciones?.[0] || [];
  const [usuarios = [], sedes = []] = datosUsuariosSedes || [[], []];

  // 4. Filtrado de datos base (Lógica movida de la barra)
  const empleadosDatos = usuarios.filter(
    (u) =>
      Number(u?.eliminado || 0) !== 1 &&
      Number(u?.activo || 0) === 1 &&
      Number(u?.usuario?.level_admin) !== 1,
  );

  const sedesDatos = sedes.filter(
    (s) => s.es_ciudad === true && s.nombre.toLowerCase() !== "multisede",
  );

  const empleadosConVacaciones = React.useMemo(() => {
    const inicio = performance.now();

    if (!empleadosDatos.length) return [];
    const vacacionesMap = vacaciones.reduce((acc, v) => {
      const id = v.usuario_emp_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(v);
      return acc;
    }, {});

    const busquedaLower = busqueda.toLowerCase().trim();
    const esSedeFiltrada = sedeSeleccionada !== "todas_sedes";

    const resultadoFinal = empleadosDatos.reduce((resultado, emp) => {
      if (esSedeFiltrada && Number(emp.sede_id) !== Number(sedeSeleccionada))
        return resultado;
      if (busquedaLower !== "") {
        const nombre = String(emp.usuario?.name || "").toLowerCase();
        if (!nombre.includes(busquedaLower)) return resultado;
      }
      const vacacionesEmpleado = vacacionesMap[emp.usuario_id] || [];
      const tieneVacaciones = vacacionesEmpleado.length > 0;
      if (filtroVacaciones === "t_vacaciones" && !tieneVacaciones)
        return resultado;
      if (filtroVacaciones === "s_vacaciones" && tieneVacaciones)
        return resultado;

      resultado.push({ ...emp, vacaciones: vacacionesEmpleado });
      return resultado;
    }, []);
    return resultadoFinal;
  }, [
    empleadosDatos,
    vacaciones,
    filtroVacaciones,
    sedeSeleccionada,
    busqueda,
  ]);

  const calcularDias = (desde, hasta) => {
    return dayjs(hasta).diff(dayjs(desde), "day") + 1;
  };

  const abrirModal = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setEmpleadoSeleccionado(null);
    setModalAbierto(false);
  };

  const filtroVacacionesAdicionalBusqueda = (
    <div className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto">
      <TreePalm className="text-sm text-gray-400" />
      <select
        className="w-full cursor-pointer bg-transparent pr-2 text-xs sm:text-sm text-gray-700 outline-none"
        value={filtroVacaciones}
        onChange={(e) => setFiltroVacaciones(e.target.value)}
      >
        <option value="todos">TODOS</option>
        <option value="t_vacaciones">CON VACACIONES</option>
        <option value="s_vacaciones">SIN VACACIONES</option>
      </select>
    </div>
  );

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="mb-4">
          <BotonVolver onClick={volverAtras} />
        </div>

        {/* BarraBusqueda ahora recibe propiedades planas y limpias */}
        <BarraBusqueda
          titulos={titulos}
          textoBusqueda={busqueda}
          setTextoBusqueda={setBusqueda}
          sedeSeleccionada={sedeSeleccionada}
          setSedeSeleccionada={setSedeSeleccionada}
          sedesDatos={sedesDatos}
          mostrarFiltroSede={true}
          filtrosNuevos={filtroVacacionesAdicionalBusqueda}
        />

        <Tabla
          headers={encabezadoTablaVacacionesProgramadas}
          datos={empleadosConVacaciones}
          renderRow={(item) => (
            <>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-800">
                  {toUpperText(item.usuario?.name)}
                </div>
                <div className="text-xs text-gray-400">
                  {toUpperText(item.usuario?.email)}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  {toUpperText(normalizarSedes(item.sede?.nombre))}
                </span>
              </td>
              <td className="px-6 py-4">
                {item.vacaciones.length === 0 ? (
                  <span className="text-gray-400 text-xs">SIN VACACIONES</span>
                ) : (
                  <div className="flex flex-col gap-1">
                    {item.vacaciones.map((v) => (
                      <span
                        key={v.id}
                        className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                      >
                        {dayjs(v.fecha_desde).format("DD/MM")} -{" "}
                        {dayjs(v.fecha_hasta).format("DD/MM")} (
                        {calcularDias(v.fecha_desde, v.fecha_hasta)} días)
                      </span>
                    ))}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                <button
                  onClick={() => abrirModal(item)}
                  className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  ASIGNAR
                </button>
              </td>
            </>
          )}
          renderCard={(item) => (
            <div>
              <p className="font-semibold">{item.usuario?.name}</p>
              <div className="text-xs text-gray-400">
                {toUpperText(item.usuario?.email)}
              </div>
              <p className="text-sm text-gray-500">{item.sede?.nombre}</p>
            </div>
          )}
        />
      </div>
      {modalAbierto && empleadoSeleccionado && (
        <ModalAsignarVacaciones
          cerrarModal={cerrarModal}
          fetch={refetchVacaciones}
          empleado={empleadoSeleccionado}
        />
      )}
    </>
  );
};

export default VacacionesProgramadas;
