import { useMemo, useCallback } from "react";
import sweetalert2 from "sweetalert2";
import { DAYS } from "../../Constants/constanst";

import useConsultaDB from "../../ConsultaDb/Consulta";
import useInsertar from "../../ConsultaDb/Insertar";
import useDeleteListaEspera from "../../ConsultaDb/EliminarListaEspera";
import useModify from "../../ConsultaDb/Modificar";

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

  const { update: modificarHorarioDeshabilitado } = useModify(
    "/horarios-deshabilitados", true
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

  const manejarDeshabilitarHorario = async (horario, estadoOcupacion = { tieneAlumnosLMV: false, tieneAlumnosMJ: false }) => {
    if (rol !== "GESTION") return;
    if (!puedeEditarSede) return mostrarErrorPermisos();
    if (!sedeActualFiltro) return;

    // A. Buscamos si YA existe un bloqueo para esta hora.
    // Esto es clave: si existe, haremos UPDATE. Si no, haremos CREATE.
    const bloqueoExistente = detalleHorariosDeshabilitados.find(h => h.hora_label === horario);
   
    // Determinamos qué opciones mostrar en base a la ocupación
    const opcionesDisponibles = {};
    const { tieneAlumnosLMV, tieneAlumnosMJ } = estadoOcupacion;

    // Si ambos están vacíos, se puede bloquear TODO
    if (!tieneAlumnosLMV && !tieneAlumnosMJ) {
        opcionesDisponibles['todos'] = 'Deshabilitar Todo el Horario';
    }

    // Si LMV está vacío, se puede bloquear LMV
    if (!tieneAlumnosLMV) {
        opcionesDisponibles['lmv'] = 'Deshabilitar Lunes, Miércoles y Viernes';
    }

    // Si MJ está vacío, se puede bloquear MJ
    if (!tieneAlumnosMJ) {
        opcionesDisponibles['mj'] = 'Deshabilitar Martes y Jueves';
    }

    if (Object.keys(opcionesDisponibles).length === 0) {
        return sweetalert2.fire({
            icon: "warning",
            title: "No se puede deshabilitar",
            text: "El turno tiene alumnos inscriptos en todos los grupos de días.",
        });
    }

    // Preparamos el título del modal según si es crear o modificar
    const tituloModal = bloqueoExistente 
        ? `Modificar bloqueo de las ${horario}`
        : `Deshabilitar horario ${horario}`;

    const textoModal = bloqueoExistente
        ? `Actualmente está bloqueado como "${bloqueoExistente.tipo_bloqueo ? bloqueoExistente.tipo_bloqueo === "mj" ? "M-J" : bloqueoExistente.tipo_bloqueo === "lmv" ? "L-M-V" : "Todos" : ""}". Selecciona el nuevo tipo:`
        : "Selecciona qué grupo de días deseas ocultar:";

    const confirmacion = await sweetalert2.fire({
      icon: "question",
      title: tituloModal,
      html: `
        <style>
          .swal2-radio label { display: block !important; margin-bottom: 8px; }
          .swal2-radio { display: flex; flex-direction: column; align-items: flex-start; }
        </style>
        <p style="margin-bottom:12px; color:#555; font-size:14px;">
          ${textoModal}
        </p>
      `,
      input: "radio",
      inputOptions: opcionesDisponibles,
      inputValue: bloqueoExistente ? bloqueoExistente.tipo_bloqueo : undefined,
      inputValidator: (value) => {
        if (!value) {
          return 'Debes seleccionar una opción';
        }
      },

      showCancelButton: true,
      confirmButtonText: bloqueoExistente ? "Actualizar bloqueo" : "Confirmar bloqueo",
      cancelButtonText: "Cancelar",

      confirmButtonColor: "#2563eb", // azul más moderno
      cancelButtonColor: "#9ca3af",

      buttonsStyling: true,
      reverseButtons: true,

      focusConfirm: false,
      allowOutsideClick: false,

      customClass: {
        popup: "rounded-xl",
        title: "text-lg font-semibold",
        htmlContainer: "text-sm",
        confirmButton: "px-4 py-2 rounded-md",
        cancelButton: "px-4 py-2 rounded-md"
      }
    });

   
    if (!confirmacion.isConfirmed) return; 
    
    const tipoSeleccionado = confirmacion.value;

    try {
      let res;

      //LOGICA DE DECISION: UPDATE vs CREATE
      if (bloqueoExistente) {
        // --- CASO MODIFICAR ---
        res = await modificarHorarioDeshabilitado(bloqueoExistente.id, {
            tipo_bloqueo: tipoSeleccionado
        });
      } else {
        // --- CASO CREAR ---
        const payload = {
            sede_id: Number(sedeActualFiltro),
            hora_label: horario,
            creado_por: userId,
            tipo_bloqueo: tipoSeleccionado 
        };
        res = await insertarHorarioDeshabilitado(payload);
      }
   
      if (res) {
        await sweetalert2.fire({
          icon: "success",
          title: bloqueoExistente ? "Actualizado correctamente" : "Turno deshabilitado",
          text: `El horario ahora está bloqueado para: ${opcionesDisponibles[tipoSeleccionado]}`,
          timer: 2000,
          showConfirmButton: false,
        });
        recargarLista(); 
      }
    } catch (error) {
      console.error(error);
      sweetalert2.fire({ icon: "error", title: "Error en la operación", text: error.message });
    }
  };

  const manejarHabilitarHorario = async (horario, tipo_bloqueo) => {
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

    //Caso de eliminar el bloqueo completamente
    if (!tipo_bloqueo || tipo_bloqueo === undefined) {
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
      if (!confirmacion.isConfirmed) return; 
      try {
        const res = await eliminarHorarioDeshabilitado(registro.id);

        if (res !== null) {
          await sweetalert2.fire({
            icon: "success",
            title: "Turno habilitado nuevamente",
            timer: 1500,
            showConfirmButton: false,
          });
          recargarLista(); 
        }
      } catch (error) {
        console.error(error);
        sweetalert2.fire({ icon: "error", title: "Error al mostrar turno" });
      }
    } else {
      //Este es el caso de solo cambiar el tipo de bloqueo 
      const confirmacion = await sweetalert2.fire({
        title: "¿Desea cambiar el tipo de bloqueo?",
        text: `Se cambiará el tipo de bloqueo del horario por ${tipo_bloqueo}.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, cambiar",
        cancelButtonText: "Cancelar",
      });
      if (!confirmacion.isConfirmed) return; 

      let normalizado = tipo_bloqueo.toLowerCase() === 'l-m-v' ? 'lmv' : tipo_bloqueo.toLowerCase() === 'm-j' ? 'mj' : 'todos';
      const res = await modificarHorarioDeshabilitado(registro.id, {
        tipo_bloqueo: normalizado,
      });
        recargarLista(); 
      
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