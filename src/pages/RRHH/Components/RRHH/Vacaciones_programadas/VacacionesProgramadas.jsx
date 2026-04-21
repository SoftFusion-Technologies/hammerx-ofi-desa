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

const headers = [
  { key: "empleado", label: "Empleado" },
  { key: "sede", label: "Sede" },
  { key: "diasProgramados", label: "Días Programados" },
  { key: "acciones", label: "Acciones", align: "center" },
];

const VacacionesProgramadas = ({ volverAtras }) => {
  const [busqueda, setBusqueda] = useState("");
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [datosFiltrados, setDatosFiltrados] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const toUpperText = (value) => (value ? String(value).toUpperCase() : "");

  const titulos = {
    titulo: "Vacaciones Programadas",
    subtitulo: "Consulta las vacaciones programadas de los empleados.",
    icono: <FaPlaneDeparture className="text-orange-500" />,
  };

  const { datos: datosVacaciones, refetch: refetchVacaciones } = usarPromiseAll(
    [{ endpoint: "rrhh/vacaciones-programadas" }],
  );

  const vacaciones = datosVacaciones?.[0] || [];

  const empleadosConVacaciones = React.useMemo(() => {
    if (!datosFiltrados.empleadosDatos) return [];

    return datosFiltrados.empleadosDatos.map((emp) => {
      const vacacionesEmpleado = vacaciones.filter(
        (v) => Number(v.usuario_emp_id) === Number(emp.usuario_id),
      );

      return {
        ...emp,
        vacaciones: vacacionesEmpleado,
      };
    });
  }, [datosFiltrados.empleadosDatos, vacaciones]);

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

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="mb-4">
          <BotonVolver onClick={volverAtras} />
        </div>

        <BarraBusqueda
          titulos={titulos}
          busqueda={{
            busqueda,
            setBusqueda,
            sedeSeleccionada,
            setSedeSeleccionada,
          }}
          datosFiltrados={{
            setDatosFiltrados,
          }}
        />

        <Tabla
          headers={headers}
          datos={empleadosConVacaciones}
          renderRow={(item) => (
            <>
              <td className="px-6 py-4">
                <div className="font-medium text-gray-800">
                  {toUpperText(item.usuario.name)}
                </div>
                <div className="text-xs text-gray-400">
                  {toUpperText(item.usuario.email)}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">
                  {toUpperText(normalizarSedes(item.sede.nombre))}
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
                {toUpperText(item.usuario.email)}
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
