/*
 * Programador: Benjamin Orellana
 * Fecha Creación: 17 / 04 / 2026
 * Versión: 1.1
 *
 * Descripción:
 * Este archivo (VentasProspectosPublicForm.jsx) contiene el formulario público
 * para registrar visitas programadas o clases de prueba, consumiendo vendedores
 * desde /users y enviando la solicitud al endpoint público de ventas_prospectos.
 *
 * Tema: Frontend - Registro Público de Prospectos
 *
 * Capa: Frontend
 */

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Clock3,
  Phone,
  Mail,
  User2,
  Briefcase,
  MessageSquareText,
  BadgeHelp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

// Benjamin Orellana - 2026/04/20 - Se reutiliza el modal interno de horarios disponibles de Pilates para respetar cupos y bloqueos reales.
import HorariosDisponiblesModal from '../../pages/staff/Components/HorariosDisponiblesModal';
import Swal from 'sweetalert2';
const API_URL = 'http://localhost:8080';

/* Benjamin Orellana - 2026/04/17 - Catálogo visual de actividades permitido por el backend. */
const ACTIVIDADES_OPTIONS = [
  'No especifica',
  'Musculacion',
  'Pilates',
  'Clases grupales',
  'Pase full'
];

/* Benjamin Orellana - 2026/04/17 - Normaliza textos para comparaciones consistentes sin depender de mayúsculas, tildes ni espacios extra. */
const normalizarTexto = (valor) =>
  String(valor || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

/* Benjamin Orellana - 2026/04/17 - Devuelve el estado inicial del formulario según el tipo de flujo público. */
const buildInitialForm = () => ({
  usuario_id: '',
  nombre_completo: '',
  dni: '',
  telefono: '',
  email: '',
  actividad: 'No especifica',
  fecha_clase: '',
  hora_clase: '',
  necesita_profe: false,
  observacion: ''
});

/* Benjamin Orellana - 2026/04/21 - Se descompone el nombre completo del input público para conservar compatibilidad con el backend que aún recibe nombre y apellido por separado. */
const descomponerNombreCompleto = (valor) => {
  const limpio = String(valor || '')
    .trim()
    .replace(/\s+/g, ' ');

  const partes = limpio.split(' ').filter(Boolean);

  if (partes.length < 2) {
    return {
      nombre: limpio,
      apellido: '',
      esValido: false
    };
  }

  return {
    nombre: partes.slice(0, -1).join(' '),
    apellido: partes.slice(-1).join(' '),
    esValido: true
  };
};

/* Benjamin Orellana - 2026/04/21 - Se formatea una fecha al estándar YYYY-MM-DD sin depender de UTC para evitar corrimientos por zona horaria. */
const formatearFechaInput = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/* Benjamin Orellana - 2026/04/21 - Se calcula el rango habilitado únicamente de lunes a viernes de la semana actual, dejando sábados y domingos fuera. */
const obtenerRangoSemanaActual = () => {
  const hoy = new Date();
  hoy.setHours(12, 0, 0, 0);

  const diaSemana = hoy.getDay();
  const desplazamientoAlLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

  const inicioSemana = new Date(hoy);
  inicioSemana.setDate(hoy.getDate() + desplazamientoAlLunes);
  inicioSemana.setHours(12, 0, 0, 0);

  const finSemanaHabil = new Date(inicioSemana);
  finSemanaHabil.setDate(inicioSemana.getDate() + 4);
  finSemanaHabil.setHours(12, 0, 0, 0);

  return {
    inicioSemana: formatearFechaInput(inicioSemana),
    finSemanaHabil: formatearFechaInput(finSemanaHabil),
    hoy: formatearFechaInput(hoy)
  };
};

/* Benjamin Orellana - 2026/04/21 - Valida que la fecha pertenezca a la semana actual y además sea un día hábil entre lunes y viernes. */
const esFechaHabilitadaSemanaActual = (fecha, minFecha, maxFecha) => {
  if (!fecha) return false;
  if (fecha < minFecha || fecha > maxFecha) return false;

  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return false;

  const day = d.getDay();

  return day >= 1 && day <= 5;
};

// Benjamin Orellana - 2026/04/20 - Convierte la fecha elegida al grupo real que devuelve el endpoint de horarios de Pilates.
const obtenerGrupoPilatesPorFecha = (fecha) => {
  if (!fecha) return null;

  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDay(); // 0 domingo, 1 lunes, 2 martes, 3 miércoles, 4 jueves, 5 viernes, 6 sábado

  if (day === 1 || day === 3 || day === 5) return 'LMV';
  if (day === 2 || day === 4) return 'MJ';

  return null;
};

// Benjamin Orellana - 2026/04/20 - Resuelve el horario_id correcto dentro del bloque agrupado de Pilates según la fecha elegida.
const resolverHorarioPilatesIdPorFecha = (horario, fecha) => {
  if (!horario || !fecha) {
    return Number(horario?.horario_id || horario?.id || 0) || null;
  }

  const d = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(d.getTime())) {
    return Number(horario?.horario_id || horario?.id || 0) || null;
  }

  const day = d.getDay();
  const grp = String(horario?.grp || '')
    .trim()
    .toUpperCase();
  const horarioIds = Array.isArray(horario?.horario_ids)
    ? horario.horario_ids
    : [];

  if (grp === 'LMV') {
    if (day === 1)
      return (
        Number(horarioIds[0] || horario?.horario_id || horario?.id || 0) || null
      );
    if (day === 3)
      return (
        Number(horarioIds[1] || horario?.horario_id || horario?.id || 0) || null
      );
    if (day === 5)
      return (
        Number(horarioIds[2] || horario?.horario_id || horario?.id || 0) || null
      );
  }

  if (grp === 'MJ') {
    if (day === 2)
      return (
        Number(horarioIds[0] || horario?.horario_id || horario?.id || 0) || null
      );
    if (day === 4)
      return (
        Number(horarioIds[1] || horario?.horario_id || horario?.id || 0) || null
      );
  }

  return Number(horario?.horario_id || horario?.id || 0) || null;
};

// Benjamin Orellana - 2026/04/20 - Devuelve una etiqueta amigable del grupo de Pilates para mostrar en la UI.
const obtenerEtiquetaGrupoPilates = (grp, grupoLabel) => {
  if (grupoLabel) return grupoLabel;
  if (String(grp).toUpperCase() === 'LMV') return 'Lunes-Miercoles-Viernes';
  if (String(grp).toUpperCase() === 'MJ') return 'Martes-Jueves';
  return String(grp || '').trim();
};

// Benjamin Orellana - 2026/04/17 - Se fija el mapeo de sedes públicas para relacionar selectedSede con users.sede y con el valor legado de ventas_prospectos.
const SEDE_CONFIG = {
  Concepción: {
    userSede: 'Concepción',
    legacy: 'concepcion'
  },
  Monteros: {
    userSede: 'Monteros',
    legacy: 'monteros'
  },
  'Barrio Sur': {
    userSede: 'SMT',
    legacy: 'barrio sur'
  },
  'Barrio Norte': {
    userSede: 'SanMiguelBN',
    legacy: 'barrio norte'
  },
  'Yerba Buena ': {
    userSede: 'YBAconquija',
    legacy: 'yerba buena - aconquija 2044'
  }
};

// Benjamin Orellana - 2026/04/17 - Resuelve la configuración fija de sede a partir del nombre que llega desde el paso 1.
const obtenerConfigSede = (selectedSede) => {
  const nombre = String(selectedSede?.nombre || '');

  return (
    SEDE_CONFIG[nombre] ||
    SEDE_CONFIG[nombre.trim()] || {
      userSede: nombre.trim(),
      legacy: normalizarTexto(nombre.trim())
    }
  );
};

export default function VentasProspectosPublicForm({
  selectedSede,
  tipoLinkInicial,
  allowedAdvisorEmails = [],
  onSubmitted = null
}) {
  const [form, setForm] = useState(buildInitialForm);
  const [usuarios, setUsuarios] = useState([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Benjamin Orellana - 2026/04/20 - Estado de horarios disponibles y horario seleccionado para la rama pública de Pilates.
  const [horariosPilates, setHorariosPilates] = useState([]);
  const [cargandoHorariosPilates, setCargandoHorariosPilates] = useState(false);
  const [horarioPilatesSeleccionado, setHorarioPilatesSeleccionado] =
    useState(null);

  // Benjamin Orellana - 2026/04/20 - Controla la apertura del modal reutilizado de horarios disponibles de Pilates.
  const [abrirHorariosPilatesModal, setAbrirHorariosPilatesModal] =
    useState(false);

  // Benjamin Orellana - 2026/04/20 - Se deriva el grupo real de Pilates (LMV o MJ) según la fecha elegida.
  const grupoPilatesSeleccionado = useMemo(
    () => obtenerGrupoPilatesPorFecha(form.fecha_clase),
    [form.fecha_clase]
  );

  // Benjamin Orellana - 2026/04/20 - Se filtran los horarios según el grupo real del día y solo se mantienen los bloques habilitados para mostrar disponibilidad real.
  const horariosPilatesDelDia = useMemo(() => {
    if (!Array.isArray(horariosPilates) || horariosPilates.length === 0)
      return [];
    if (!grupoPilatesSeleccionado) return [];

    return horariosPilates
      .filter(
        (item) =>
          normalizarTexto(item?.grp) ===
          normalizarTexto(grupoPilatesSeleccionado)
      )
      .filter((item) => item?.tipo_bloqueo === false);
  }, [horariosPilates, grupoPilatesSeleccionado]);

  useEffect(() => {
    let active = true;

    // Benjamin Orellana - 2026/04/20 - Cuando la actividad es Pilates y hay sede válida, se consultan los horarios disponibles del flujo interno ya existente.
    const cargarHorariosPilates = async () => {
      if (form.actividad !== 'Pilates' || !selectedSede?.id) {
        if (active) {
          setHorariosPilates([]);
          setHorarioPilatesSeleccionado(null);
        }
        return;
      }

      try {
        if (active) setCargandoHorariosPilates(true);

        const response = await axios.get(
          `${API_URL}/clientes-pilates/horarios-disponibles/ventas?sedeId=${selectedSede.id}`
        );

        if (!active) return;

        setHorariosPilates(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error cargando horarios públicos de Pilates:', error);
        if (active) setHorariosPilates([]);
      } finally {
        if (active) setCargandoHorariosPilates(false);
      }
    };

    cargarHorariosPilates();

    return () => {
      active = false;
    };
  }, [form.actividad, selectedSede?.id]);

  useEffect(() => {
    // Benjamin Orellana - 2026/04/20 - Si cambia la fecha o se sale de Pilates, se limpia el horario seleccionado para evitar inconsistencias.
    if (form.actividad !== 'Pilates') {
      setHorarioPilatesSeleccionado(null);
      return;
    }

    setHorarioPilatesSeleccionado(null);
  }, [form.actividad, form.fecha_clase]);

  // Benjamin Orellana - 2026/04/20 - Cuando el usuario elige una fecha válida para Pilates y existen horarios del día, se abre automáticamente la modal para seleccionar turno.
  useEffect(() => {
    if (form.actividad !== 'Pilates') return;
    if (!form.fecha_clase) return;
    if (!grupoPilatesSeleccionado) return;
    if (cargandoHorariosPilates) return;
    if (!horariosPilatesDelDia.length) return;

    setAbrirHorariosPilatesModal(true);
  }, [
    form.actividad,
    form.fecha_clase,
    grupoPilatesSeleccionado,
    cargandoHorariosPilates,
    horariosPilatesDelDia.length
  ]);

  /* Benjamin Orellana - 2026/04/21 - Se restringe la fecha seleccionable a la semana corriente y solo a días hábiles de lunes a viernes. */
  const { minFechaSemanaActual, maxFechaSemanaActual } = useMemo(() => {
    const rango = obtenerRangoSemanaActual();

    return {
      minFechaSemanaActual:
        rango.hoy > rango.inicioSemana ? rango.hoy : rango.inicioSemana,
      maxFechaSemanaActual: rango.finSemanaHabil
    };
  }, []);

  // Benjamin Orellana - 2026/04/20 - Se centralizan alertas visuales con SweetAlert2 para reemplazar mensajes fijos dentro del formulario.
  const showFormAlert = ({
    icon = 'info',
    title,
    text,
    confirmButtonText = 'Aceptar'
  }) => {
    return Swal.fire({
      icon,
      title,
      text,
      confirmButtonText,
      confirmButtonColor: '#ea580c',
      background: '#ffffff',
      color: '#111827',
      customClass: {
        popup: 'rounded-[24px]',
        confirmButton: 'rounded-xl font-semibold'
      }
    });
  };

  // Benjamin Orellana - 2026/04/17 - Se resuelve la sede fija para filtrar vendedores y construir el payload del registro público.
  const sedeConfig = useMemo(
    () => obtenerConfigSede(selectedSede),
    [selectedSede]
  );

  // Benjamin Orellana - 2026/04/17 - Se filtran vendedores por la sede fija asociada a la sede pública seleccionada.
  const vendedoresDisponibles = useMemo(() => {
    const emailsPermitidos = new Set(
      (allowedAdvisorEmails || []).map(normalizarTexto).filter(Boolean)
    );

    return (usuarios || [])
      .filter((user) => normalizarTexto(user?.level) === 'vendedor')
      .filter(
        (user) =>
          normalizarTexto(user?.sede) === normalizarTexto(sedeConfig?.userSede)
      )
      .filter((user) => {
        if (emailsPermitidos.size === 0) return true;
        return emailsPermitidos.has(normalizarTexto(user?.email));
      })
      .sort((a, b) =>
        String(a?.name || '').localeCompare(String(b?.name || ''))
      );
  }, [usuarios, sedeConfig, allowedAdvisorEmails]);

  useEffect(() => {
    let active = true;

    /* Benjamin Orellana - 2026/04/17 - Se cargan usuarios para mostrar asesores vendedores válidos según la sede elegida. */
    const cargarUsuarios = async () => {
      try {
        const response = await axios.get(`${API_URL}/users`);

        if (!active) return;

        setUsuarios(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error(
          'Error cargando usuarios para el formulario público:',
          error
        );
      } finally {
        if (active) setCargandoUsuarios(false);
      }
    };

    cargarUsuarios();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    /* Benjamin Orellana - 2026/04/17 - Si cambia la sede o el tipo de solicitud se reinicia el formulario para evitar residuos visuales y funcionales. */
    setForm(buildInitialForm());
    setHorarioPilatesSeleccionado(null);
  }, [selectedSede?.id, tipoLinkInicial]);

  const asesorSeleccionado = useMemo(() => {
    return vendedoresDisponibles.find(
      (item) => Number(item.id) === Number(form.usuario_id)
    );
  }, [vendedoresDisponibles, form.usuario_id]);

  // Benjamin Orellana - 2026/04/20 - Al elegir un horario de Pilates se valida cupo real y se fija también la hora general del formulario para mantener consistencia con el backend.
  const seleccionarHorarioPilates = (horario) => {
    const cupoDisponible =
      Number(horario?.cupo_por_clase || 0) -
      Number(horario?.total_inscriptos || 0);

    if (cupoDisponible <= 0) return;

    const resolvedHorarioId = resolverHorarioPilatesIdPorFecha(
      horario,
      form.fecha_clase
    );

    const hora = String(
      horario?.hhmm || horario?.hora_inicio || horario?.hora || ''
    )
      .trim()
      .slice(0, 5);

    setHorarioPilatesSeleccionado({
      ...horario,
      resolved_horario_id: resolvedHorarioId
    });

    setForm((prev) => ({
      ...prev,
      hora_clase: hora
    }));
  };

  const handleChange = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value
      };

      // Benjamin Orellana - 2026/04/20 - Si cambia la actividad, se resetea la hora y la selección especial de Pilates.
      if (field === 'actividad' && value !== 'Pilates') {
        next.hora_clase = '';
      }

      if (field === 'actividad' && value === 'Pilates') {
        next.necesita_profe = false;
        next.hora_clase = '';
      }

      return next;
    });
  };

  /* Benjamin Orellana - 2026/04/21 - Valida de forma básica el email ingresado en el formulario público antes de enviarlo al backend. */
  const esEmailValido = (email) => {
    const valor = String(email || '').trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSede?.id) {
      await showFormAlert({
        icon: 'error',
        title: 'Sede inválida',
        text: 'No se pudo resolver correctamente la sede seleccionada.'
      });
      return;
    }

    const nombreDescompuesto = descomponerNombreCompleto(form.nombre_completo);

    if (!form.nombre_completo.trim()) {
      await showFormAlert({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes ingresar tu nombre y apellido.'
      });
      return;
    }

    if (!nombreDescompuesto.esValido) {
      await showFormAlert({
        icon: 'warning',
        title: 'Nombre incompleto',
        text: 'Debes ingresar al menos nombre y apellido.'
      });
      return;
    }

    if (!form.telefono.trim()) {
      await showFormAlert({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes ingresar el teléfono.'
      });
      return;
    }

    if (!form.email.trim()) {
      await showFormAlert({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes ingresar el email.'
      });
      return;
    }

    if (!esEmailValido(form.email)) {
      await showFormAlert({
        icon: 'warning',
        title: 'Email inválido',
        text: 'Debes ingresar un email válido.'
      });
      return;
    }

    if (!form.fecha_clase) {
      await showFormAlert({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes seleccionar la fecha de visita.'
      });
      return;
    }

    if (
      !esFechaHabilitadaSemanaActual(
        form.fecha_clase,
        minFechaSemanaActual,
        maxFechaSemanaActual
      )
    ) {
      await showFormAlert({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'Solo puedes seleccionar días hábiles de la semana actual.'
      });
      return;
    }

    if (form.actividad !== 'Pilates' && !form.hora_clase) {
      await showFormAlert({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'Debes seleccionar la hora de visita.'
      });
      return;
    }

    // Benjamin Orellana - 2026/04/20 - Para Pilates se exige una fecha válida de lunes a viernes y un horario seleccionado.
    if (form.actividad === 'Pilates') {
      if (!grupoPilatesSeleccionado) {
        await showFormAlert({
          icon: 'warning',
          title: 'Fecha inválida',
          text: 'Para Pilates debés elegir una fecha válida de lunes a viernes.'
        });
        return;
      }

      if (!horarioPilatesSeleccionado?.resolved_horario_id) {
        await showFormAlert({
          icon: 'warning',
          title: 'Horario requerido',
          text: 'Para Pilates debés seleccionar un horario disponible.'
        });
        return;
      }
    }

    // Benjamin Orellana - 2026/04/17 - Se construye el payload del formulario público usando la sede fija legada que requiere ventas_prospectos.
    const payload = {
      usuario_id: Number(form.usuario_id),
      asesor_nombre: asesorSeleccionado?.name || '',
      nombre: nombreDescompuesto.nombre.trim(),
      apellido: nombreDescompuesto.apellido.trim(),
      dni: form.dni.trim(),
      telefono: form.telefono.trim(),
      contacto: form.telefono.trim(),
      email: form.email.trim().toLowerCase(),
      actividad: form.actividad,
      sede_id: Number(selectedSede.id),
      sede: sedeConfig.legacy,
      fecha_clase: form.fecha_clase,
      hora_clase: form.hora_clase,
      necesita_profe:
        tipoLinkInicial === 'Clase de prueba' && form.actividad !== 'Pilates'
          ? !!form.necesita_profe
          : false,
      tipo_link: tipoLinkInicial,
      observacion: form.observacion.trim(),
      pilates_horario_id:
        form.actividad === 'Pilates'
          ? Number(horarioPilatesSeleccionado?.resolved_horario_id)
          : null,
      pilates_hhmm:
        form.actividad === 'Pilates'
          ? String(horarioPilatesSeleccionado?.hhmm || '').trim()
          : null,
      pilates_grp:
        form.actividad === 'Pilates'
          ? String(horarioPilatesSeleccionado?.grp || '').trim()
          : null,
      pilates_clase_num: form.actividad === 'Pilates' ? 1 : null
    };

    try {
      setEnviando(true);

      const response = await axios.post(
        `${API_URL}/ventas-prospectos/registro-publico`,
        payload
      );

      const data = response?.data || {};

      setForm(buildInitialForm());
      setHorarioPilatesSeleccionado(null);

      await showFormAlert({
        icon: 'success',
        title: 'Solicitud enviada',
        text:
          [data?.mensaje, data?.mensajeAdvertencia].filter(Boolean).join(' ') ||
          'La solicitud se registró correctamente. Pronto nos contactaremos contigo.'
      });

      if (typeof onSubmitted === 'function') {
        onSubmitted(data);
      }
    } catch (error) {
      console.error('Error enviando registro público de prospecto:', error);

      await showFormAlert({
        icon: 'error',
        title: 'No se pudo enviar',
        text:
          error?.response?.data?.mensajeError ||
          error?.response?.data?.mensajeAdvertencia ||
          'No se pudo registrar la solicitud. Intenta nuevamente.'
      });
    } finally {
      setEnviando(false);
    }
  };

  // Benjamin Orellana - 2026/04/20 - Recibe la selección del modal de Pilates, ubica el horario real y lo aplica al formulario público.
  const handleConfirmarHorarioPilates = (seleccion) => {
    if (!seleccion) return;

    const [hhmm, grp] = String(seleccion).split(' ');

    const horarioEncontrado = horariosPilatesDelDia.find(
      (item) =>
        String(item?.hhmm || '').trim() === String(hhmm || '').trim() &&
        String(item?.grp || '')
          .trim()
          .toUpperCase() ===
          String(grp || '')
            .trim()
            .toUpperCase()
    );

    if (!horarioEncontrado) {
      showFormAlert({
        icon: 'error',
        title: 'Horario inválido',
        text: 'No se pudo resolver el horario seleccionado de Pilates.'
      });
      return;
    }

    seleccionarHorarioPilates(horarioEncontrado);
    setAbrirHorariosPilatesModal(false);
  };
  /* Benjamin Orellana - 2026/04/21 - Convierte una hora HH:mm al formato visual de 12 horas para mostrar AM/PM al usuario. */
  const formatearHoraAMPM = (hora) => {
    const valor = String(hora || '').trim();

    if (!/^\d{2}:\d{2}$/.test(valor)) return '';

    const [hh, mm] = valor.split(':').map(Number);
    const sufijo = hh >= 12 ? 'PM' : 'AM';
    const hora12 = hh % 12 === 0 ? 12 : hh % 12;

    return `${hora12}:${String(mm).padStart(2, '0')} ${sufijo}`;
  };

  /* Benjamin Orellana - 2026/04/21 - Si el usuario elige madrugada entre 01:00 y 05:59, se interpreta automáticamente como horario PM para evitar confusiones. */
  const normalizarHoraVisitaPublica = (hora) => {
    const valor = String(hora || '').trim();

    if (!/^\d{2}:\d{2}$/.test(valor)) return valor;

    const [hh, mm] = valor.split(':').map(Number);

    if (hh >= 1 && hh <= 5) {
      return `${String(hh + 12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }

    return valor;
  };

  return (
    <div className="w-full overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-[0_24px_70px_-30px_rgba(249,115,22,0.35)] sm:rounded-[30px]">
      <div className="border-b border-orange-100 bg-gradient-to-r from-orange-50 via-white to-white px-5 py-6 sm:px-6 md:px-8 md:py-6">
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-700">
            <ShieldCheck className="h-4 w-4" />
            {tipoLinkInicial}
          </div>

          <div>
            <h3 className="font-bignoodle text-[2rem] leading-none text-gray-900 sm:text-3xl md:text-4xl">
              Completar solicitud
            </h3>

            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Sede seleccionada:{' '}
              <span className="font-semibold text-gray-900">
                {selectedSede?.nombre || '-'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-6 md:px-8 md:py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Benjamin Orellana - 2026/04/20 - Se amplía la respiración visual del bloque principal en mobile para aprovechar mejor el ancho disponible sin alterar la lógica del formulario. */}
          <div className="rounded-[28px] border border-slate-100 bg-slate-50/70 p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.25)] sm:p-5 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="grid grid-cols-1 gap-5 sm:gap-4 xl:grid-cols-2">
              <div className="space-y-2 xl:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Asesor
                </label>

                {/* Benjamin Orellana - 2026/04/20 - Se agrega la aclaración pedida para que el usuario no se bloquee si no fue atendido por un asesor. */}
                <p className="text-[13px] leading-5 text-gray-500">
                  Si no fuiste atendido por ningun asesor deja este campo como
                  esta.
                </p>

                <div className="relative">
                  <User2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <select
                    value={form.usuario_id}
                    onChange={(e) => handleChange('usuario_id', e.target.value)}
                    disabled={cargandoUsuarios || enviando}
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  >
                    <option value="">
                      {cargandoUsuarios
                        ? 'Cargando vendedores...'
                        : 'Seleccionar asesor'}
                    </option>

                    {vendedoresDisponibles.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                        {/* {user.email ? ` - ${user.email}` : ''} */}
                      </option>
                    ))}
                  </select>
                </div>

                {!cargandoUsuarios && vendedoresDisponibles.length === 0 && (
                  <p className="text-xs font-medium text-amber-700">
                    No hay vendedores disponibles para la sede seleccionada.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Actividad
                </label>

                <div className="relative">
                  <Briefcase className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <select
                    value={form.actividad}
                    onChange={(e) => handleChange('actividad', e.target.value)}
                    disabled={enviando}
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  >
                    {ACTIVIDADES_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item === 'Musculacion' ? 'Musculación' : item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Teléfono
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    disabled={enviando}
                    placeholder="Ingresá tu teléfono"
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  />
                </div>
              </div>

              {/* Benjamin Orellana - 2026/04/21 - Se unifica nombre y apellido en un único campo visual, manteniendo compatibilidad con el backend al descomponerlo al enviar. */}
              <div className="space-y-2 xl:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nombre y apellido
                </label>

                <div className="relative">
                  <User2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={form.nombre_completo}
                    onChange={(e) =>
                      handleChange('nombre_completo', e.target.value)
                    }
                    disabled={enviando}
                    placeholder="Ingresá tu nombre y apellido"
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    disabled={enviando}
                    placeholder="Ingresá tu email"
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  DNI
                </label>

                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) => handleChange('dni', e.target.value)}
                  disabled={enviando}
                  placeholder="Ingresá tu DNI"
                  className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white px-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Fecha de Visita
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                  <input
                    type="date"
                    min={minFechaSemanaActual}
                    max={maxFechaSemanaActual}
                    value={form.fecha_clase}
                    onChange={(e) => {
                      const nuevaFecha = e.target.value;

                      if (
                        nuevaFecha &&
                        !esFechaHabilitadaSemanaActual(
                          nuevaFecha,
                          minFechaSemanaActual,
                          maxFechaSemanaActual
                        )
                      ) {
                        showFormAlert({
                          icon: 'warning',
                          title: 'Fecha inválida',
                          text: 'Solo puedes seleccionar días hábiles de la semana actual.'
                        });
                        return;
                      }

                      handleChange('fecha_clase', nuevaFecha);
                    }}
                    disabled={enviando}
                    className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Hora de Visita
                </label>

                {form.actividad !== 'Pilates' ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        type="time"
                        min="06:00"
                        max="23:00"
                        step="60"
                        value={form.hora_clase}
                        onChange={(e) => {
                          const horaIngresada = e.target.value;
                          const nuevaHora =
                            normalizarHoraVisitaPublica(horaIngresada);

                          if (
                            nuevaHora &&
                            (nuevaHora < '06:00' || nuevaHora > '23:00')
                          ) {
                            showFormAlert({
                              icon: 'warning',
                              title: 'Hora inválida',
                              text: 'La hora de visita debe estar entre las 6:00 AM y las 11:00 PM.'
                            });
                            return;
                          }

                          if (horaIngresada && horaIngresada !== nuevaHora) {
                            showFormAlert({
                              icon: 'info',
                              title: 'Hora ajustada automáticamente',
                              text: `Interpretamos tu horario como ${formatearHoraAMPM(nuevaHora)} para evitar confusiones.`
                            });
                          }

                          handleChange('hora_clase', nuevaHora);
                        }}
                        disabled={enviando}
                        className="w-full min-h-[60px] rounded-[22px] border border-gray-200 bg-white pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:min-h-[56px] sm:text-[15px]"
                      />
                    </div>

                    {/* Benjamin Orellana - 2026/04/21 - Se agrega ayuda visual para que el usuario entienda el rango permitido y vea la hora en formato AM/PM. */}
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">
                        Horario habilitado: 6:00 AM a 11:00 PM.
                      </p>

                      {/* {form.hora_clase && (
                        <p className="text-xs font-medium text-orange-700">
                          Hora seleccionada:{' '}
                          {formatearHoraAMPM(form.hora_clase)}
                        </p>
                      )} */}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {!form.fecha_clase && (
                      <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        Primero elegí una fecha para ver los horarios
                        disponibles de Pilates.
                      </div>
                    )}

                    {form.fecha_clase && !grupoPilatesSeleccionado && (
                      <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        Pilates no dispone horarios para sábados o domingos.
                      </div>
                    )}

                    {form.fecha_clase &&
                      grupoPilatesSeleccionado &&
                      cargandoHorariosPilates && (
                        <div className="rounded-[22px] border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                          Cargando horarios de Pilates...
                        </div>
                      )}

                    {form.fecha_clase &&
                      grupoPilatesSeleccionado &&
                      !cargandoHorariosPilates &&
                      horariosPilatesDelDia.length === 0 && (
                        <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                          No hay horarios disponibles de Pilates para el día
                          seleccionado.
                        </div>
                      )}

                    {form.fecha_clase &&
                      grupoPilatesSeleccionado &&
                      !cargandoHorariosPilates &&
                      horariosPilatesDelDia.length > 0 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAbrirHorariosPilatesModal(true)}
                            disabled={enviando}
                            className="w-full min-h-[60px] rounded-[22px] border border-orange-200 bg-orange-50 px-4 text-left text-base font-medium text-orange-700 transition hover:border-orange-400 hover:bg-orange-100 disabled:opacity-60 sm:min-h-[56px] sm:text-[15px]"
                          >
                            {horarioPilatesSeleccionado
                              ? 'Cambiar Horario'
                              : 'Ver horarios disponibles'}
                          </button>

                          {horarioPilatesSeleccionado && (
                            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                              <div className="text-sm font-semibold text-emerald-800">
                                Horario seleccionado
                              </div>

                              <div className="mt-1 text-sm text-emerald-700">
                                {String(
                                  horarioPilatesSeleccionado?.hhmm || ''
                                ).trim()}
                                {horarioPilatesSeleccionado?.grupo_label
                                  ? ` · ${horarioPilatesSeleccionado.grupo_label}`
                                  : horarioPilatesSeleccionado?.grp
                                    ? ` · ${obtenerEtiquetaGrupoPilates(
                                        horarioPilatesSeleccionado.grp,
                                        horarioPilatesSeleccionado.grupo_label
                                      )}`
                                    : ''}
                              </div>

                              {/* <div className="mt-1 text-xs text-emerald-700">
                  Quedan:{' '}
                  {Math.max(
                    0,
                    Number(
                      horarioPilatesSeleccionado?.cupo_por_clase || 0
                    ) -
                      Number(
                        horarioPilatesSeleccionado?.total_inscriptos || 0
                      )
                  )}
                </div> */}
                            </div>
                          )}
                        </>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {tipoLinkInicial === 'Clase de prueba' &&
            form.actividad !== 'Pilates' &&
            form.actividad !== 'Clases grupales' && (
              <div className="rounded-3xl border border-orange-100 bg-orange-50/70 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <input
                    id="necesita_profe"
                    type="checkbox"
                    checked={!!form.necesita_profe}
                    onChange={(e) =>
                      handleChange('necesita_profe', e.target.checked)
                    }
                    disabled={enviando}
                    className="mt-1 h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />

                  <label
                    htmlFor="necesita_profe"
                    className="cursor-pointer text-sm sm:text-base"
                  >
                    <span className="block font-semibold text-gray-900">
                      Necesito profesor
                    </span>
                    <span className="mt-1 block text-gray-600">
                      Si activás esta opción, te asignaremos un profesor
                      disponible para tu visita.
                    </span>
                  </label>
                </div>
              </div>
            )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Observación
            </label>

            <div className="relative">
              <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-gray-400" />

              <textarea
                value={form.observacion}
                onChange={(e) => handleChange('observacion', e.target.value)}
                disabled={enviando}
                rows={5}
                placeholder="Podés dejar una observación adicional"
                className="w-full resize-none rounded-[22px] border border-gray-200 bg-white py-4 pl-12 pr-4 text-base text-gray-800 outline-none transition focus:border-orange-500 sm:text-[15px]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <div className="flex items-start gap-2">
              <BadgeHelp className="mt-0.5 h-4 w-4 text-slate-500" />
              <div>
                <span className="font-semibold">Tipo de solicitud:</span>{' '}
                {tipoLinkInicial}
              </div>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={
                enviando ||
                cargandoUsuarios ||
                vendedoresDisponibles.length === 0
              }
              className="w-full min-h-[60px] rounded-[22px] bg-orange-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[56px] sm:text-[15px]"
            >
              {enviando ? 'Enviando solicitud...' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
      {abrirHorariosPilatesModal && (
        <HorariosDisponiblesModal
          onClose={() => setAbrirHorariosPilatesModal(false)}
          confirmar={handleConfirmarHorarioPilates}
          horariosDisponiblesPilates={horariosPilatesDelDia}
          horarioInicial={
            horarioPilatesSeleccionado?.hhmm && horarioPilatesSeleccionado?.grp
              ? `${horarioPilatesSeleccionado.hhmm} ${horarioPilatesSeleccionado.grp}`
              : null
          }
        />
      )}
    </div>
  );
}
