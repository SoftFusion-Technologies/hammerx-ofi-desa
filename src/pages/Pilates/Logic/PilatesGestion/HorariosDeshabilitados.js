import { useMemo, useCallback } from "react";
import sweetalert2 from "sweetalert2";
import { DAYS } from "../../Constants/constanst";

import useConsultaDB from "../../ConsultaDb/Consulta";
import useInsertar from "../../ConsultaDb/Insertar";
import useDeleteListaEspera from "../../ConsultaDb/EliminarListaEspera";

const useHorariosDeshabilitados = ({
  sedeActualFiltro,
  schedule,
  rol,
  userId,
  puedeEditarSede,
  userLevel,
}) => {
  // Hooks de API
  const { data: dataApi, refetch: recargarLista } = useConsultaDB(
    sedeActualFiltro ? `/horarios-deshabilitados/${sedeActualFiltro}` : null
  );

  const { insert: insertarHorarioDeshabilitado } = useInsertar(
    "/horarios-deshabilitados",
    true
  );
  const { remove: eliminarHorarioDeshabilitado } = useDeleteListaEspera(
    "/horarios-deshabilitados"
  );
  // Procesar datos para la vista
  const detalleHorariosDeshabilitados = useMemo(() => {
    const lista = Array.isArray(dataApi) ? dataApi : dataApi?.data || [];
    if (!lista.length) return [];

    return lista
      .map((item) => ({
        ...item,
        usuario_nombre: item.usuario?.name || null, // Sacamos el nombre si existe
      }))
      .sort((a, b) => a.hora_label.localeCompare(b.hora_label));
  }, [dataApi]);

  // Lista simple de horas para validaciones rápidas
  const horariosDeshabilitados = useMemo(() => {
    return detalleHorariosDeshabilitados.map((registro) => registro.hora_label);
  }, [detalleHorariosDeshabilitados]);

  // Validar si un horario tiene alumnos en algún día
  const puedeDeshabilitarHorario = useCallback(
    (horario) => {
      if (userLevel !== "admin") return false; // Solo admin puede ocultar horarios
      if (!horario) return false;
      return DAYS.every((dia) => {
        const clave = `${dia}-${horario}`;
        const alumnos = schedule?.[clave]?.alumnos || [];
        return alumnos.length === 0;
      });
    },
    [schedule]
  );

  const mostrarErrorPermisos = (
    mensaje = "No tenés permisos para editar esta sede."
  ) => {
    sweetalert2.fire({
      icon: "error",
      title: "Acceso denegado",
      text: mensaje,
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const manejarDeshabilitarHorario = async (horario) => {
    if (rol !== "GESTION") return;
    if (!puedeEditarSede) return mostrarErrorPermisos();
    if (!sedeActualFiltro) return;

    if (!puedeDeshabilitarHorario(horario)) {
      return sweetalert2.fire({
        icon: "warning",
        title: "No se puede deshabilitar",
        text: "El turno tiene alumnos inscriptos.",
      });
    }
    const confirmacion = await sweetalert2.fire({
      title: "¿Estás seguro?",
      text: `Vas a deshabilitar el horario ${horario}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, deshabilitar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return; // El usuario canceló la acción
    try {
      const payload = {
        sede_id: Number(sedeActualFiltro),
        hora_label: horario,
        creado_por: userId,
      };

      const res = await insertarHorarioDeshabilitado(payload);

      if (res) {
        await sweetalert2.fire({
          icon: "success",
          title: "Turno deshabilitado",
          timer: 1500,
          showConfirmButton: false,
        });
        recargarLista(); // Actualizamos la tabla
      }
    } catch (error) {
      console.error(error);
      sweetalert2.fire({ icon: "error", title: "Error al deshabilitar turno" });
    }
  };

  const manejarHabilitarHorario = async (horario) => {
    if (userLevel !== "admin") {
      mostrarErrorPermisos(
        "Solo el usuario administrador puede habilitar horarios."
      );
      return;
    }
    if (rol !== "GESTION") return;
    if (!puedeEditarSede) return mostrarErrorPermisos();

    const registro = detalleHorariosDeshabilitados.find(
      (item) => item.hora_label === horario
    );

    if (!registro?.id) {
      recargarLista();
      return sweetalert2.fire({
        icon: "info",
        text: "Lista desactualizada, recargando...",
      });
    }

    const confirmacion = await sweetalert2.fire({
      title: "¿Volver a habilitar?",
      text: `El horario ${horario} volverá a estar disponible.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, habilitar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return; // Si cancela, salimos
    try {
      const res = await eliminarHorarioDeshabilitado(registro.id);

      if (res !== null) {
        await sweetalert2.fire({
          icon: "success",
          title: "Turno habilitado nuevamente",
          timer: 1500,
          showConfirmButton: false,
        });
        recargarLista(); // Actualizamos la tabla
      }
    } catch (error) {
      console.error(error);
      sweetalert2.fire({ icon: "error", title: "Error al mostrar turno" });
    }
  };

  return {
    horariosDeshabilitados,
    detalleHorariosDeshabilitados,
    manejarDeshabilitarHorario,
    manejarHabilitarHorario,
    puedeDeshabilitarHorario,
  };
};

export default useHorariosDeshabilitados;
