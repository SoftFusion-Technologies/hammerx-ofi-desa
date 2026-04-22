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

import React, { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  Clock3,
  Phone,
  Mail,
  User2,
  Briefcase,
  Dumbbell,
  MessageSquareText,
  BadgeHelp,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Lock
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

  const day = d.getDay();

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

/* Benjamin Orellana - 2026/04/22 - Se compactan las tarjetas y campos para acercar el tamaño visual al mockup mobile aprobado por el cliente. */
const GLASS_CARD_CLASS =
  'rounded-[24px] border border-white/16 bg-white/[0.74] shadow-[0_18px_42px_-32px_rgba(15,23,42,0.42)] backdrop-blur-[14px] transition duration-200 focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-500/10';

const GLASS_FIELD_CLASS =
  'h-9 w-full border-0 bg-transparent p-0 text-[0.95rem] font-medium text-slate-700 outline-none placeholder:text-slate-500/90 sm:text-[0.98rem]';

/* Benjamin Orellana - 2026/04/22 - Se reduce la altura de las tarjetas para que los campos se perciban más livianos y cercanos al diseño de referencia. */
function GlassInputCard({
  icon: Icon,
  children,
  className = '',
  showChevron = false,
  iconClassName = '',
  contentClassName = '',
  compact = false
}) {
  return (
    <div className={`${GLASS_CARD_CLASS} ${className}`}>
      <div
        className={`flex items-center gap-3 px-3.5 ${
          compact ? 'min-h-[58px]' : 'min-h-[66px]'
        } sm:min-h-[62px]`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-orange-50/90 text-orange-600 ring-1 ring-orange-100 ${
            compact ? 'h-8 w-8' : 'h-9 w-9'
          } ${iconClassName}`}
        >
          <Icon
            className={compact ? 'h-[17px] w-[17px]' : 'h-[18px] w-[18px]'}
          />
        </div>

        <div className={`min-w-0 flex-1 ${contentClassName}`}>{children}</div>

        {showChevron && (
          <ChevronDown className="h-[18px] w-[18px] shrink-0 text-slate-500" />
        )}
      </div>
    </div>
  );
}

/* Benjamin Orellana - 2026/04/22 - Se crea un dropdown visual propio para reemplazar selects nativos y permitir apertura suave con opciones renderizadas por map. */
function GlassDropdownCard({
  icon: Icon,
  placeholder,
  valueLabel,
  isOpen,
  onToggle,
  disabled = false,
  compact = false,
  children,
  className = ''
}) {
  return (
    <div className={`${GLASS_CARD_CLASS} overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`flex w-full items-center gap-3 px-3.5 text-left ${
          compact ? 'min-h-[58px]' : 'min-h-[66px]'
        } sm:min-h-[62px] disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-orange-50/90 text-orange-600 ring-1 ring-orange-100 ${
            compact ? 'h-8 w-8' : 'h-9 w-9'
          }`}
        >
          <Icon
            className={compact ? 'h-[17px] w-[17px]' : 'h-[18px] w-[18px]'}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={`truncate text-[0.98rem] font-medium sm:text-[1rem] ${
              valueLabel ? 'text-slate-700' : 'text-slate-500'
            }`}
          >
            {valueLabel || placeholder}
          </div>
        </div>

        <ChevronDown
          className={`h-[18px] w-[18px] shrink-0 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200/80 px-2 pb-2 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VentasProspectosPublicForm({
  selectedSede,
  tipoLinkInicial,
  allowedAdvisorEmails = [],
  onSubmitted = null,
  backgroundImageUrl = '',
  compactHeader = false,
  immersiveMobile = false,
  onBack = null
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

  /* Benjamin Orellana - 2026/04/22 - Se controlan dropdowns visuales propios para asesor y actividad, evitando selects nativos y mejorando la UX mobile. */
  const [mostrarActividadOptions, setMostrarActividadOptions] = useState(false);
  const [mostrarAsesorOptions, setMostrarAsesorOptions] = useState(false);

  const actividadDropdownRef = useRef(null);
  const asesorDropdownRef = useRef(null);
  const fechaFieldRef = useRef(null);

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

  /* Benjamin Orellana - 2026/04/22 - Se prioriza la imagen enviada por el padre para el paso 2 y se conserva un fallback seguro con datos de la sede. */
  const resolvedBackgroundImageUrl = useMemo(() => {
    if (String(backgroundImageUrl || '').trim()) {
      return String(backgroundImageUrl || '').trim();
    }

    const posibles = [
      selectedSede?.imagen_portada,
      selectedSede?.portada,
      selectedSede?.imagen,
      selectedSede?.foto,
      selectedSede?.image,
      selectedSede?.url_imagen
    ]
      .map((item) => String(item || '').trim())
      .filter(Boolean);

    return posibles[0] || '';
  }, [backgroundImageUrl, selectedSede]);

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
    setMostrarActividadOptions(false);
    setMostrarAsesorOptions(false);
  }, [selectedSede?.id, tipoLinkInicial]);

  /* Benjamin Orellana - 2026/04/22 - Cierra dropdowns personalizados al interactuar fuera de ellos para que el comportamiento se sienta natural en mobile. */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actividadDropdownRef.current &&
        !actividadDropdownRef.current.contains(event.target)
      ) {
        setMostrarActividadOptions(false);
      }

      if (
        asesorDropdownRef.current &&
        !asesorDropdownRef.current.contains(event.target)
      ) {
        setMostrarAsesorOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const asesorSeleccionado = useMemo(() => {
    return vendedoresDisponibles.find(
      (item) => Number(item.id) === Number(form.usuario_id)
    );
  }, [vendedoresDisponibles, form.usuario_id]);

  /* Benjamin Orellana - 2026/04/22 - Devuelve el label visible de actividad respetando acentos y placeholder cuando todavía no hubo selección explícita. */
  const actividadLabelVisible = useMemo(() => {
    if (!form.actividad || form.actividad === 'No especifica') return '';
    if (form.actividad === 'Musculacion') return 'Musculación';
    return form.actividad;
  }, [form.actividad]);

  /* Benjamin Orellana - 2026/04/22 - Devuelve el nombre del asesor seleccionado para mostrarlo en el dropdown visual. */
  const asesorLabelVisible = useMemo(() => {
    if (!form.usuario_id) return '';
    return asesorSeleccionado?.name || '';
  }, [form.usuario_id, asesorSeleccionado]);

  /* Benjamin Orellana - 2026/04/22 - Desplaza suavemente al usuario hacia la fecha luego de elegir actividad para continuar el flujo natural del formulario. */
  const scrollHaciaFecha = () => {
    window.requestAnimationFrame(() => {
      setTimeout(() => {
        fechaFieldRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 180);
    });
  };

  /* Benjamin Orellana - 2026/04/22 - Selecciona actividad desde el dropdown propio, lo cierra y lleva visualmente al siguiente campo del flujo. */
  const seleccionarActividadPublica = (actividad) => {
    handleChange('actividad', actividad);
    setMostrarActividadOptions(false);
    scrollHaciaFecha();
  };

  /* Benjamin Orellana - 2026/04/22 - Selecciona asesor desde el dropdown propio y colapsa la lista para mantener el formulario limpio. */
  const seleccionarAsesorPublico = (usuarioId) => {
    handleChange('usuario_id', usuarioId);
    setMostrarAsesorOptions(false);
  };

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
      usuario_id: form.usuario_id ? Number(form.usuario_id) : null,
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
      setMostrarActividadOptions(false);
      setMostrarAsesorOptions(false);

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
      return `${String(hh + 12).padStart(2, '0')}:${String(mm).padStart(
        2,
        '0'
      )}`;
    }

    return valor;
  };

  // Benjamin Orellana - 2026/04/22 - Se adaptan textos principales y CTA según el tipo de flujo público, manteniendo una experiencia más fiel al diseño mobile compartido.
  const textosFlow = useMemo(() => {
    const esClasePrueba =
      normalizarTexto(tipoLinkInicial) === normalizarTexto('Clase de prueba');

    return {
      titulo: esClasePrueba
        ? '¡Agenda tu clase de prueba!'
        : '¡Agenda tu visita programada!',
      cta: esClasePrueba
        ? 'RESERVAR CLASE DE PRUEBA'
        : 'RESERVAR VISITA PROGRAMADA'
    };
  }, [tipoLinkInicial]);

  /* Benjamin Orellana - 2026/04/22 - Se ajustan tamaños, paddings y jerarquía visual para un modo mobile inmersivo más fiel al diseño aprobado por el cliente. */
  const heroWrapperClass = immersiveMobile
    ? 'relative z-10 mx-auto w-full max-w-5xl px-4 pb-4 pt-3 sm:px-5 sm:pb-6 sm:pt-4 lg:px-6 lg:pb-8 lg:pt-5'
    : compactHeader
      ? 'relative z-10 mx-auto w-full max-w-5xl px-4 pb-5 pt-3 sm:px-5 sm:pb-7 sm:pt-4 lg:px-6 lg:pb-8 lg:pt-5'
      : 'relative z-10 mx-auto w-full max-w-6xl px-4 pb-7 pt-5 sm:px-6 sm:pb-9 sm:pt-7 lg:px-8 lg:pb-10';

  const heroContentClass = immersiveMobile
    ? 'mx-auto max-w-[400px] lg:mx-0'
    : compactHeader
      ? 'mx-auto max-w-[700px] lg:mx-0'
      : 'mx-auto max-w-3xl lg:mx-0';

  const badgeClass = immersiveMobile
    ? 'hidden sm:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md'
    : compactHeader
      ? 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md'
      : 'inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-md';

  const titleClass = immersiveMobile
    ? 'mt-3 font-bignoodle text-[2.05rem] leading-[0.92] text-white sm:text-[2.45rem] lg:text-[3.1rem]'
    : compactHeader
      ? 'mt-2.5 font-bignoodle text-[2.05rem] leading-[0.92] text-white sm:text-[2.7rem] lg:text-[3.2rem]'
      : 'mt-5 font-bignoodle text-[2.9rem] leading-[0.9] text-white sm:text-[4rem] lg:text-[4.5rem]';

  const subtitleClass = immersiveMobile
    ? 'mt-2 text-[0.9rem] font-semibold text-white/95 sm:text-[0.96rem]'
    : compactHeader
      ? 'mt-2 text-[0.95rem] font-medium text-white/90 sm:text-[0.98rem]'
      : 'mt-3 text-base font-medium text-white/90 sm:text-lg';

  const formClass = immersiveMobile
    ? 'mt-4 space-y-3 sm:mt-5 sm:space-y-4'
    : compactHeader
      ? 'mt-4 space-y-3.5 sm:mt-5 sm:space-y-4.5'
      : 'mt-7 space-y-4 sm:mt-8 sm:space-y-5';

  const fieldTextClass = immersiveMobile
    ? 'h-8 w-full border-0 bg-transparent p-0 text-[0.93rem] font-medium text-slate-700 outline-none placeholder:text-slate-500/90 sm:text-[0.98rem]'
    : GLASS_FIELD_CLASS;

  return (
    <div className="relative isolate w-full overflow-hidden bg-[#0f1115] text-white sm:rounded-[34px]">
      <div className="absolute inset-0">
        {resolvedBackgroundImageUrl ? (
          <div
            className="h-full w-full bg-cover bg-center transition-transform duration-500"
            style={{
              backgroundImage: `url(${resolvedBackgroundImageUrl})`,
              backgroundPosition: 'center top',
              transform: 'scale(1.04)',
              filter: 'saturate(1.04) brightness(0.92)'
            }}
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.35),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(180deg,_#1b1f27_0%,_#101218_50%,_#0c0d12_100%)]" />
        )}
      </div>

      {/* Benjamin Orellana - 2026/04/22 - Se alivianan las capas superiores para que la foto de fondo se perciba más, manteniendo contraste suficiente para los textos. */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,21,0.04)_0%,rgba(15,17,21,0.16)_36%,rgba(15,17,21,0.38)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0)_100%)]" />

      <div className={heroWrapperClass}>
        <div className={heroContentClass}>
          {/* Benjamin Orellana - 2026/04/22 - El botón volver atrás pasa al formulario en mobile inmersivo para que el padre deje de condicionar la composición visual superior. */}
          {immersiveMobile && typeof onBack === 'function' && (
            <div className="mb-6 sm:hidden">
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/12 px-3.5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/16"
              >
                <ChevronLeft size={18} />
                Volver atrás
              </button>
            </div>
          )}

          <div className={badgeClass}>
            <ShieldCheck className="h-4 w-4" />
            {tipoLinkInicial}
          </div>

          <h3 className={titleClass}>{textosFlow.titulo}</h3>

          <p className={subtitleClass}>
            Sede seleccionada:{' '}
            <span className="font-extrabold text-white">
              {selectedSede?.nombre || '-'}
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className={formClass}>
          <div className="grid grid-cols-1 gap-3 sm:gap-3.5 lg:grid-cols-2">
            {/* Benjamin Orellana - 2026/04/22 - El asesor opcional pasa a mostrarse como un campo visual igual al resto del formulario, con dropdown propio y opciones renderizadas por map. */}
            <div ref={asesorDropdownRef} className="lg:col-span-2">
              <GlassDropdownCard
                icon={Briefcase}
                placeholder="Asesor"
                valueLabel={asesorLabelVisible}
                isOpen={mostrarAsesorOptions}
                onToggle={() => setMostrarAsesorOptions((prev) => !prev)}
                disabled={enviando || cargandoUsuarios}
                compact={immersiveMobile}
              >
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => seleccionarAsesorPublico('')}
                    className={`flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm font-medium transition ${
                      !form.usuario_id
                        ? 'bg-orange-50 text-orange-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Continuar sin asesor</span>
                    {!form.usuario_id && <CheckCircle2 className="h-4 w-4" />}
                  </button>

                  {vendedoresDisponibles.map((user) => {
                    const active = Number(form.usuario_id) === Number(user.id);

                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => seleccionarAsesorPublico(user.id)}
                        className={`flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'bg-orange-50 text-orange-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate">{user.name}</span>
                        {active && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}

                  {!cargandoUsuarios && vendedoresDisponibles.length === 0 && (
                    <div className="rounded-[18px] bg-amber-50 px-3 py-3 text-sm font-medium text-amber-700">
                      No hay vendedores disponibles para la sede seleccionada.
                    </div>
                  )}
                </div>
              </GlassDropdownCard>
            </div>

            {/* Benjamin Orellana - 2026/04/21 - Se unifica nombre y apellido en un único campo visual, manteniendo compatibilidad con el backend al descomponerlo al enviar. */}
            <GlassInputCard
              icon={User2}
              className="lg:col-span-2"
              compact={immersiveMobile}
            >
              <label htmlFor="nombre_completo" className="sr-only">
                Nombre y apellido
              </label>

              <input
                id="nombre_completo"
                type="text"
                value={form.nombre_completo}
                onChange={(e) =>
                  handleChange('nombre_completo', e.target.value)
                }
                disabled={enviando}
                placeholder="Nombre y apellido"
                autoComplete="name"
                className={fieldTextClass}
              />
            </GlassInputCard>

            <GlassInputCard icon={Phone} compact={immersiveMobile}>
              <label htmlFor="telefono" className="sr-only">
                Teléfono
              </label>

              <input
                id="telefono"
                type="tel"
                value={form.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                disabled={enviando}
                placeholder="Ingresá tu teléfono"
                autoComplete="tel"
                inputMode="tel"
                className={fieldTextClass}
              />
            </GlassInputCard>

            <GlassInputCard icon={Mail} compact={immersiveMobile}>
              <label htmlFor="email" className="sr-only">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={enviando}
                placeholder="Ingresá tu email"
                autoComplete="email"
                inputMode="email"
                className={fieldTextClass}
              />
            </GlassInputCard>

            <div ref={actividadDropdownRef} className="space-y-2 lg:col-span-2">
              <GlassDropdownCard
                icon={Dumbbell}
                placeholder="Seleccioná una actividad"
                valueLabel={actividadLabelVisible}
                isOpen={mostrarActividadOptions}
                onToggle={() => setMostrarActividadOptions((prev) => !prev)}
                disabled={enviando}
                compact={immersiveMobile}
              >
                <div className="space-y-1.5">
                  {ACTIVIDADES_OPTIONS.filter(
                    (item) => item !== 'No especifica'
                  ).map((item) => {
                    const label = item === 'Musculacion' ? 'Musculación' : item;
                    const active = form.actividad === item;

                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => seleccionarActividadPublica(item)}
                        className={`flex w-full items-center justify-between rounded-[18px] px-3 py-3 text-left text-sm font-medium transition ${
                          active
                            ? 'bg-orange-50 text-orange-700'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{label}</span>
                        {active && (
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </GlassDropdownCard>
            </div>

            <div ref={fechaFieldRef} className="space-y-2">
              <GlassInputCard icon={CalendarDays} compact={immersiveMobile}>
                <label htmlFor="fecha_clase" className="sr-only">
                  Fecha de visita
                </label>

                <input
                  id="fecha_clase"
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
                  className={fieldTextClass}
                />
              </GlassInputCard>
            </div>

            {form.actividad !== 'Pilates' ? (
              <div className="space-y-2">
                <GlassInputCard icon={Clock3} compact={immersiveMobile}>
                  <label htmlFor="hora_clase" className="sr-only">
                    Hora de visita
                  </label>

                  <input
                    id="hora_clase"
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
                          text: `Interpretamos tu horario como ${formatearHoraAMPM(
                            nuevaHora
                          )} para evitar confusiones.`
                        });
                      }

                      handleChange('hora_clase', nuevaHora);
                    }}
                    disabled={enviando}
                    className={fieldTextClass}
                  />
                </GlassInputCard>
              </div>
            ) : (
              <div className="space-y-3">
                {!form.fecha_clase && (
                  <div className="rounded-[24px] border border-amber-200/80 bg-amber-50/95 px-4 py-3.5 text-sm font-medium text-amber-800 shadow-[0_12px_40px_-28px_rgba(217,119,6,0.45)]">
                    Primero elegí una fecha para ver los horarios disponibles de
                    Pilates.
                  </div>
                )}

                {form.fecha_clase && !grupoPilatesSeleccionado && (
                  <div className="rounded-[24px] border border-red-200/80 bg-red-50/95 px-4 py-3.5 text-sm font-medium text-red-700 shadow-[0_12px_40px_-28px_rgba(220,38,38,0.35)]">
                    Pilates no dispone horarios para sábados o domingos.
                  </div>
                )}

                {form.fecha_clase &&
                  grupoPilatesSeleccionado &&
                  cargandoHorariosPilates && (
                    <div className="rounded-[24px] border border-orange-200/80 bg-orange-50/95 px-4 py-3.5 text-sm font-medium text-orange-800 shadow-[0_12px_40px_-28px_rgba(249,115,22,0.4)]">
                      Cargando horarios de Pilates...
                    </div>
                  )}

                {form.fecha_clase &&
                  grupoPilatesSeleccionado &&
                  !cargandoHorariosPilates &&
                  horariosPilatesDelDia.length === 0 && (
                    <div className="rounded-[24px] border border-slate-200/90 bg-white/95 px-4 py-3.5 text-sm font-medium text-slate-700 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.18)]">
                      No hay horarios disponibles de Pilates para el día
                      seleccionado.
                    </div>
                  )}

                {form.fecha_clase &&
                  grupoPilatesSeleccionado &&
                  !cargandoHorariosPilates &&
                  horariosPilatesDelDia.length > 0 && (
                    <>
                      <GlassInputCard icon={Clock3} compact={immersiveMobile}>
                        <button
                          type="button"
                          onClick={() => setAbrirHorariosPilatesModal(true)}
                          disabled={enviando}
                          className="flex h-8 w-full items-center justify-between gap-4 border-0 bg-transparent p-0 text-left text-[0.95rem] font-medium text-slate-700 outline-none disabled:opacity-60 sm:text-[1rem]"
                        >
                          <span>
                            {horarioPilatesSeleccionado
                              ? 'Cambiar horario'
                              : 'Seleccioná tu horario'}
                          </span>

                          <ChevronDown className="h-[18px] w-[18px] shrink-0 text-slate-500" />
                        </button>
                      </GlassInputCard>

                      {horarioPilatesSeleccionado && (
                        <div className="rounded-[24px] border border-emerald-200/90 bg-emerald-50/95 p-4 shadow-[0_18px_48px_-32px_rgba(16,185,129,0.45)]">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                              <CheckCircle2 className="h-5 w-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">
                                Horario seleccionado
                              </div>

                              <div className="mt-1 text-base font-semibold text-emerald-900">
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

                              <div className="mt-1 text-sm text-emerald-700">
                                Quedan:{' '}
                                {Math.max(
                                  0,
                                  Number(
                                    horarioPilatesSeleccionado?.cupo_por_clase ||
                                      0
                                  ) -
                                    Number(
                                      horarioPilatesSeleccionado?.total_inscriptos ||
                                        0
                                    )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </div>
            )}

            {/* <GlassInputCard
              icon={BadgeHelp}
              compact={immersiveMobile}
              className="lg:col-span-2"
            >
              <label htmlFor="dni" className="sr-only">
                DNI
              </label>

              <input
                id="dni"
                type="text"
                value={form.dni}
                onChange={(e) => handleChange('dni', e.target.value)}
                disabled={enviando}
                placeholder="Ingresá tu DNI"
                inputMode="numeric"
                className={fieldTextClass}
              />
            </GlassInputCard> */}
          </div>

          {tipoLinkInicial === 'Clase de prueba' &&
            form.actividad !== 'Pilates' &&
            form.actividad !== 'Clases grupales' && (
              <div
                className={`rounded-[28px] border border-white/18 bg-white/[0.84] shadow-[0_24px_80px_-40px_rgba(15,23,42,0.48)] backdrop-blur-[14px] ${
                  immersiveMobile ? 'p-3.5' : 'p-4'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100">
                      <User2 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="text-[1rem] font-semibold text-slate-900">
                        Necesito profesor
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Te asignaremos un profesor disponible para tu visita.
                      </p>
                    </div>
                  </div>

                  {/* Benjamin Orellana - 2026/04/22 - Se reemplaza el checkbox visible por un switch grande, más cercano al diseño mobile de referencia y sin afectar el valor real del formulario. */}
                  <label
                    htmlFor="necesita_profe"
                    className="relative inline-flex cursor-pointer items-center"
                  >
                    <input
                      id="necesita_profe"
                      type="checkbox"
                      checked={!!form.necesita_profe}
                      onChange={(e) =>
                        handleChange('necesita_profe', e.target.checked)
                      }
                      disabled={enviando}
                      className="peer sr-only"
                    />
                    <span className="relative block h-[40px] w-[74px] rounded-full bg-slate-300 transition peer-checked:bg-orange-500 peer-disabled:opacity-60">
                      <span className="absolute left-[4px] top-[4px] h-[32px] w-[32px] rounded-full bg-white shadow-md transition peer-checked:translate-x-[34px]" />
                    </span>
                  </label>
                </div>
              </div>
            )}

          {/* Benjamin Orellana - 2026/04/22 - Se integra el bloque guiado "Contanos un poco de vos" dentro de una tarjeta más compacta, manteniendo la ayuda contextual y reduciendo el alto visual del formulario. */}
          <div className="rounded-[28px] border border-white/18 bg-white/[0.84] p-4 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.48)] backdrop-blur-[14px] sm:p-5">
            <div className="flex items-start gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50/90 text-orange-600 ring-1 ring-orange-100 sm:h-10 sm:w-10">
                <MessageSquareText className="h-[18px] w-[18px] sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-[0.98rem] font-semibold text-slate-900 sm:text-[1rem]">
                  Tu profe quiere conocerte:
                </div>

                <label htmlFor="observacion" className="sr-only">
                  Observación
                </label>

                <textarea
                  id="observacion"
                  value={form.observacion}
                  onChange={(e) => handleChange('observacion', e.target.value)}
                  disabled={enviando}
                  rows={4}
                  maxLength={120}
                  placeholder="¿Entrenaste antes? ¿Qué te gustaría lograr con el entrenamiento? ¿Tenés lesiones o limitaciones?"
                  className={`mt-3 w-full resize-none rounded-[22px] border border-slate-200/90 bg-white/92 px-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-500/10 sm:text-[15px] ${
                    immersiveMobile
                      ? 'min-h-[102px] py-3 text-[14px]'
                      : 'min-h-[128px] py-3.5 text-[15px]'
                  }`}
                />

                <div className="mt-2 text-right text-xs font-medium text-slate-400 sm:text-sm">
                  {String(form.observacion || '').length}/120
                </div>
              </div>
            </div>
          </div>

          {!immersiveMobile && (
            <div className="rounded-[24px] border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90 backdrop-blur-md">
              <div className="flex items-start gap-2.5">
                <BadgeHelp className="mt-0.5 h-4 w-4 shrink-0 text-white/75" />
                <div>
                  <span className="font-semibold">Tipo de solicitud:</span>{' '}
                  {tipoLinkInicial}
                </div>
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={enviando}
              className={`flex w-full items-center justify-center rounded-[24px] bg-orange-600 px-6 text-center font-extrabold tracking-[0.01em] text-white shadow-[0_24px_50px_-24px_rgba(234,88,12,0.65)] transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 ${
                immersiveMobile
                  ? 'min-h-[56px] text-[0.95rem] sm:min-h-[60px]'
                  : 'min-h-[66px] text-[1.02rem] sm:min-h-[64px]'
              }`}
            >
              {enviando ? 'ENVIANDO SOLICITUD...' : textosFlow.cta}
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-center text-sm font-medium text-white/85">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Tus datos están protegidos y son confidenciales.</span>
            </div>
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
