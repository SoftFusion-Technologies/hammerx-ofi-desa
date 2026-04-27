import React, { useEffect, useState, useRef, useMemo } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import NavbarStaff from '../NavbarStaff';
import { Link } from 'react-router-dom';
import ClasePruebaModal from '../Components/ClasePruebaModal';
import FormAltaVentas from '../../../components/Forms/FormAltaVentas';
import Footer from '../../../components/footer/Footer';
import { useAuth } from '../../../AuthContext';
import StatsVentasModal from '../../../components/StatsVentasModal';
import AgendasVentas from '../../../components/AgendasVentas';
import { useLocation } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import FiltroMesAnio from '../Components/FiltroMesAnio';
import ObservacionField from '../Components/ObservacionField';
import AgendaDeHoyModal from '../Components/AgendaDeHoyModal';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import FilterToolbar from './Components/FilterToolbar';
import ComisionesModal from './Components/ComisionesModal';
import VendedorComisionesPanel from './Components/VendedorComisionesPanel';
import ComisionesVigentesModal from '../Components/ComisionesVigentesModal';
import useInsertClientePilates from '../../Pilates/ConsultaDb/Insertar_ModificarCliente';
import 'sweetalert2/dist/sweetalert2.min.css';
import { Download } from 'lucide-react';
import InstructivosVentas from '../../../../public/instructivo_ventas_v2.pdf';

const getBgClass = (p) => {
  if (p.comision_estado === 'en_revision') return 'bg-amber-400';
  if (p.comision_estado === 'aprobado') return 'bg-sky-500';
  if (p.comision_estado === 'rechazado') return 'bg-rose-500';

  const esCom = p.comision === true || p.comision === 1 || p.comision === '1';
  const esConv =
    p.convertido === true || p.convertido === 1 || p.convertido === '1';
  if (esCom) return 'bg-sky-500';
  if (esConv) return 'bg-green-500';
  return '';
};

const esConvertido = (v) => v === true || v === 1 || v === '1';
const esComision = (v) => v === true || v === 1 || v === '1';

const normalizeSede = (sede) => {
  if (!sede) return '';
  const normalized = sede.toLowerCase().replace(/\s/g, '');
  return normalized === 'barriosur' ? 'smt' : normalized;
};

function aplicarFiltros({
  prospectos,
  search,
  selectedSede,
  tipoFiltro,
  canalFiltro,
  actividadFiltro
}) {
  if (!prospectos?.length) return [];

  const q = (search || '').toLowerCase();

  const filtered = prospectos.filter((p) => {
    // 1) búsqueda por nombre (podés sumar DNI / contacto si querés)
    const nombreMatch = (p.nombre || '').toLowerCase().includes(q);
    if (!nombreMatch) return false;

    // 2) sede
    if (selectedSede) {
      const sedeProspecto = normalizeSede(p.sede);
      if (sedeProspecto !== selectedSede) return false;
    }

    // 3) filtros select
    if (tipoFiltro && p.tipo_prospecto !== tipoFiltro) return false;

    /* Benjamin Orellana - 2026/04/21 - Se adapta el filtro de canal para que "web" contemple registros históricos con "Link Web" y nuevos con "Link Web". */
    if (canalFiltro) {
      const canalActual = p.canal_contacto || '';

      if (canalFiltro === 'web') {
        if (
          canalActual !== 'Link Web' &&
          canalActual !== 'Link Web' &&
          canalActual !== 'Link Web'
        ) {
          return false;
        }
      } else if (canalActual !== canalFiltro) {
        return false;
      }
    }

    if (actividadFiltro && p.actividad !== actividadFiltro) return false;

    return true;
  });

  // Ordenar como en la UI (convertido primero false->true, luego id desc)
  const sorted = filtered.sort((a, b) => {
    if (!a.convertido && b.convertido) return -1;
    if (a.convertido && !b.convertido) return 1;
    return b.id - a.id;
  });

  return sorted;
}

function exportProspectosExcel({
  mes,
  anio,
  prospectos,
  search,
  selectedSede,
  tipoFiltro,
  canalFiltro,
  actividadFiltro,
  formatDate
}) {
  // 1) Tomamos TODO lo filtrado (no paginado)
  const rows = aplicarFiltros({
    prospectos,
    search,
    selectedSede,
    tipoFiltro,
    canalFiltro,
    actividadFiltro
  });

  // 2) Mapeo a AOA (array of arrays) para controlar orden y encabezados
  const header = [
    'Fecha',
    'Colaborador',
    'Nombre',
    'DNI',
    'Tipo Prospecto',
    'Canal Contacto',
    'Usuario / Celular',
    'Actividad',
    '#1',
    '#2',
    '#3',
    'Clase 1',
    'Clase 2',
    'Clase 3',
    'Observación',
    'Convertido'
  ];

  const aoa = [
    header,
    ...rows.map((p) => [
      p.fecha ? formatDate(p.fecha) : '',
      p.asesor_nombre || '',
      p.nombre || '',
      p.dni || '',
      p.tipo_prospecto || '',
      p.canal_contacto || '',
      p.contacto || '',
      p.actividad || '',
      '✔', // #1 fijo marcado en UI
      p.n_contacto_2 ? '✔' : '',
      p.n_contacto_3 ? '✔' : '',
      p.clase_prueba_1_fecha ? formatDate(p.clase_prueba_1_fecha) : '',
      p.clase_prueba_2_fecha ? formatDate(p.clase_prueba_2_fecha) : '',
      p.clase_prueba_3_fecha ? formatDate(p.clase_prueba_3_fecha) : '',
      (p.observacion || '').toString().replace(/\n/g, ' '),
      p.convertido ? 'Sí' : 'No'
    ])
  ];

  // 3) Crear Sheet y Workbook
  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // 4) Ancho de columnas aproximado
  ws['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 20 }, // Colaborador
    { wch: 24 }, // Nombre
    { wch: 14 }, // DNI
    { wch: 16 }, // Tipo Prospecto
    { wch: 18 }, // Canal
    { wch: 22 }, // Usuario/Celular
    { wch: 18 }, // Actividad
    { wch: 6 }, // #1
    { wch: 6 }, // #2
    { wch: 6 }, // #3
    { wch: 12 }, // Clase 1
    { wch: 12 }, // Clase 2
    { wch: 12 }, // Clase 3
    { wch: 30 }, // Observación
    { wch: 10 } // Convertido
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    ws,
    `Ventas${anio}-${String(mes).padStart(2, '0')}`
  );

  // 5) Descargar
  const filename = `Ventas${anio}-${String(mes).padStart(2, '0')}.xlsx`;
  XLSX.writeFile(wb, filename);
}

const VentasProspectosGet = ({ currentUser }) => {
  const [prospectos, setProspectos] = useState([]);
  const [prospectosConAgendaHoy, setProspectosConAgendaHoy] = useState([]);
  const [horariosDisponiblesPilates, setHorariosDisponiblesPilates] = useState(
    []
  ); // Lista de horarios disponibles para Pilates
  const [sedesEsCiudad, setSedesEsCiudad] = useState([]); // Lista de sedes desde el backend
  const [sedeId, setSedeId] = useState(null); // id numérico de la sede

  const [page, setPage] = useState(0);
  const rowsPerPage = 20;
  const [search, setSearch] = useState('');

  const { userLevel, userId, userName } = useAuth(); // suponiendo que tienes userId también

  const [modalClaseOpen, setModalClaseOpen] = useState(false);
  const [modalNew, setModalNew] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null); // {id, num}

  const [userSede, setUserSede] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null); // null = todas o ninguna sede seleccionada

  // relacion al filtrado
  const [tipoFiltro, setTipoFiltro] = React.useState('');
  const [canalFiltro, setCanalFiltro] = React.useState('');
  const [actividadFiltro, setActividadFiltro] = React.useState('');

  const [showStats, setShowStats] = useState(false);

  const [observaciones, setObservaciones] = useState({});

  const location = useLocation();
  const prospectoIdToScroll = location.state?.prospectoId;
  const dataLoaded = useRef(false); // Para evitar scroll antes de que llegue la data

  const [agendaVentasCant, setAgendaVentasCant] = useState(0); // 👈 nuevo
  const [showAgendasModal, setShowAgendasModal] = useState(false);

  const [alertasSegundoContacto, setAlertasSegundoContacto] = useState({});

  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');

  const [openAgenda, setOpenAgenda] = useState(false);

  // const [soloConvertidos, setSoloConvertidos] = useState(false);
  const [alertaFiltro, setAlertaFiltro] = useState('');
  const [convertidoFiltro, setConvertidoFiltro] = useState('');

  // Evita clicks dobles mientras se procesa
  const [savingIds, setSavingIds] = useState(new Set());

  const [comisionFiltro, setComisionFiltro] = useState('');
  // '' | 'con' | 'sin'

  const { insertCliente } = useInsertClientePilates();

  const [showComisiones, setShowComisiones] = useState(false);

  const [comisionEstadoFiltro, setComisionEstadoFiltro] = useState('');
  // valores: '', 'en_revision', 'aprobado', 'rechazado'

  const [currentUser2, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const [openComi, setOpenComi] = useState(false);

  // Objeto mínimo desde Auth (fallback optimista)
  const userFromAuth = useMemo(
    () => ({
      id: userId ?? null,
      name: userName ?? '',
      level: userLevel ?? '',
      sede: '' // lo completamos desde la API si está
    }),
    [userId, userName, userLevel]
  );

  useEffect(() => {
    let cancelled = false;

    async function hydrateUser() {
      if (!userId) {
        setCurrentUser(userFromAuth);
        setUserLoading(false);
        return;
      }

      setUserLoading(true);
      // optimista: mostrará algo mientras llega la API
      setCurrentUser(userFromAuth);

      try {
        // 1) Intento directo por id
        const { data } = await axios.get(
          `http://localhost:8080/users/${userId}`
        );
        if (!cancelled && data) {
          setCurrentUser({
            id: data.id,
            name: data.name,
            level: data.level,
            sede: data.sede ?? ''
          });
          setUserLoading(false);
          return;
        }
      } catch {
        // ignore y cae al plan B
      }

      try {
        // 2) Fallback: /users y filtramos por id
        const { data: list } = await axios.get(`http://localhost:8080/users`);
        const found = Array.isArray(list)
          ? list.find((u) => Number(u.id) === Number(userId))
          : null;

        if (!cancelled) {
          if (found) {
            setCurrentUser({
              id: found.id,
              name: found.name,
              level: found.level,
              sede: found.sede ?? ''
            });
          } else {
            // Último fallback: nos quedamos con lo que vino del Auth
            setCurrentUser(userFromAuth);
          }
          setUserLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(userFromAuth);
          setUserLoading(false);
        }
      }
    }

    hydrateUser();
    return () => {
      cancelled = true;
    };
  }, [userId, userFromAuth]);

  useEffect(() => {
    const obs = {};
    prospectos.forEach((p) => {
      obs[p.id] = p.observacion || '';
    });
    setObservaciones(obs);
  }, [prospectos]);

  // Traer prospectos con clase de prueba hoy
  useEffect(() => {
    axios
      .get(`http://localhost:8080/notifications/clases-prueba/${userId}`)
      .then((res) =>
        setProspectosConAgendaHoy(res.data.map((p) => p.prospecto_id))
      )
      .catch(() => setProspectosConAgendaHoy([]));
  }, [userId]);

  // Traer sedes desde el backend (para tener id numérico)
  useEffect(() => {
    axios
      .get(`http://localhost:8080/sedes/ciudad`)
      .then((res) => {
        setSedesEsCiudad(res.data);
      })
      .catch(() => setSedesEsCiudad([]));
  }, []);

  //Una vez que tenemos las sedes y la sede del usuario, buscamos el id numérico y lo seteamos
  useEffect(() => {
    if (sedesEsCiudad && sedesEsCiudad.length > 0 && selectedSede) {
      const normalize = (str) =>
        str
          .toString()
          .normalize('NFD') // descompone caracteres con acentos
          .replace(/\p{Diacritic}/gu, '') // elimina diacríticos
          .toLowerCase()
          .trim();

      // Normalizamos la sede seleccionada
      let sedeABuscar = normalize(selectedSede);

      // Mapeo rápido: UI → nombre en BD
      if (sedeABuscar === 'barrionorte' || sedeABuscar === 'sanmiguelbn')
        sedeABuscar = 'barrio norte';
      if (sedeABuscar === 'smt') sedeABuscar = 'barrio sur';
      if (sedeABuscar === 'yerbabuena-aconquija 2044')
        sedeABuscar = 'Yerba Buena - Aconquija 2044';

      const sedeEncontrada = sedesEsCiudad.find(
        (s) => normalize(s.nombre) === sedeABuscar
      );

      if (sedeEncontrada) {
        setSedeId(sedeEncontrada.id);
      } else {
        console.log('No se encontró la sede');
      }
    }
  }, [sedesEsCiudad, selectedSede]);

  // Traer horarios disponibles para Pilates para las clases de prueba cuando cambia sedeId o prospectos
  const traerHorariosDisponibles = async (idSede = sedeId) => {
    if (!idSede) {
      setHorariosDisponiblesPilates([]);
      return;
    }
    axios
      .get(
        `http://localhost:8080/clientes-pilates/horarios-disponibles/ventas?sedeId=${idSede}`
      )
      .then((res) => {
        setHorariosDisponiblesPilates(res.data);
      })
      .catch((err) => {
        console.error('Error al traer horarios disponibles:', err);
        setHorariosDisponiblesPilates([]);
      });
  };

  // Cada vez que cambia sedeId, traemos los horarios disponibles
  useEffect(() => {
    if (sedeId) {
      traerHorariosDisponibles(sedeId);
    }
  }, [sedeId]);

  useEffect(() => {
    const loadAgendaVentasCount = async () => {
      try {
        const qs = new URLSearchParams({
          level: userLevel === 'admin' ? 'admin' : 'vendedor',
          ...(userLevel !== 'admin' ? { usuario_id: String(userId) } : {}),
          with_prospect: '1'
        });
        const r = await fetch(
          `http://localhost:8080/ventas/agenda/hoy?${qs.toString()}`
        );
        const d = await r.json();
        setAgendaVentasCant(Array.isArray(d) ? d.length : 0);
      } catch {
        setAgendaVentasCant(0);
      }
    };
    if (userId) loadAgendaVentasCount();
  }, [userId, userLevel]);

  useEffect(() => {
    // Pedí todas las alertas
    axios
      .get('http://localhost:8080/prospectos-alertas')
      .then((res) => {
        // armamos objeto: { [id]: 'rojo'/'amarillo'/'ninguno' }
        const obj = {};
        res.data.forEach((p) => {
          obj[p.id] = p.color_2do_contacto;
        });
        setAlertasSegundoContacto(obj);
      })
      .catch(() => setAlertasSegundoContacto({}));
  }, []);

  const normalizeString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  };

  const normalizeSede2 = (sede) => {
    if (!sede) return '';
    let normalized = sede.toLowerCase().replace(/\s/g, '');
    if (normalized === 'smt') {
      normalized = 'barrio sur';
    } else if (normalized === 'barrionorte' || normalized === 'sanmiguelbn') {
      normalized = 'barrio norte';
    } else if (normalized === 'yerbabuena-aconquija 2044') {
      normalized = 'Yerba Buena - Aconquija 2044';
    }
    return normalized;
  };

  const URL = 'http://localhost:8080/ventas_prospectos';
  useEffect(() => {
    // Desplaza la página al top cuando el componente se monta
    window.scrollTo(0, 0);
  }, []);

  // Traer info del usuario para obtener sede
  useEffect(() => {
    if (!userId) return;

    const fetchUserSede = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`);
        if (!response.ok)
          throw new Error('No se pudo obtener la info del usuario');
        const data = await response.json();
        setUserSede(normalizeString(data.sede || ''));
      } catch (error) {
        console.error('Error cargando sede del usuario:', error);
      }
    };

    fetchUserSede();
  }, [userId]);

  // Cuando userSede se carga, asigno selectedSede si no está set
  useEffect(() => {
    if (userSede && !selectedSede) {
      setSelectedSede(userSede);
    }
  }, [userSede, selectedSede]);

  useEffect(() => {
    if (mes && anio) {
      fetchProspectos();
      setPage(1);
    }
  }, [mes, anio]);

  // Abrir automáticamente a los 2 segundos, solo la primera vez
  useEffect(() => {
    let timer = setTimeout(() => setShowAgendasModal(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchProspectos = async () => {
    try {
      const response = await axios.get(URL, {
        params: {
          usuario_id: currentUser?.id,
          level: currentUser?.level,
          mes, // <--- Nuevo
          anio // <--- Nuevo
        }
      });
      setProspectos(response.data);
      dataLoaded.current = true;
    } catch (error) {
      console.error('Error al obtener prospectos:', error);
    }
  };

  // Hacé scroll cuando la data esté cargada y venga el prospectoId
  useEffect(() => {
    if (dataLoaded.current && prospectoIdToScroll) {
      const row = document.getElementById(`prospecto-${prospectoIdToScroll}`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Opcional: resaltá la fila un rato
        row.classList.add('bg-yellow-200', 'animate-pulse');
        setTimeout(
          () => row.classList.remove('animate-pulse', 'bg-yellow-200'),
          1500
        );
      }
    }
  }, [prospectos, prospectoIdToScroll]);

  // Actualiza un campo checkbox (como n_contacto_2) y refresca lista
  const handleCheckboxChange = async (id, field) => {
    try {
      const prospecto = prospectos.find((p) => p.id === id);
      if (!prospecto) return;

      // Alternar valor para checkbox
      const nuevoValor = !prospecto[field];

      await axios.put(`${URL}/${id}`, {
        [field]: nuevoValor
      });
      fetchProspectos();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  // Actualiza el canal y, si es campaña, el origen
  const handleCanalChange = async (id, nuevoCanal) => {
    setProspectos((old) =>
      old.map((p) =>
        p.id === id
          ? {
              ...p,
              canal_contacto: nuevoCanal,
              campania_origen:
                nuevoCanal === 'Campaña' ? p.campania_origen || '' : '' // si no es campaña, lo limpia
            }
          : p
      )
    );

    // Buscar el prospecto actual para saber el origen (si es campaña)
    const prospecto = prospectos.find((p) => p.id === id);

    try {
      await axios.put(`http://localhost:8080/ventas_prospectos/${id}`, {
        canal_contacto: nuevoCanal,
        campania_origen:
          nuevoCanal === 'Campaña' ? prospecto?.campania_origen || '' : ''
      });
    } catch (error) {
      console.error('Error al actualizar canal:', error);
    }
  };

  const handleChange = async (id, field, value) => {
    try {
      await axios.put(`${URL}/${id}`, { [field]: value });
      fetchProspectos(); // recarga la lista después de actualizar
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  // Benjamin Orellana - 2026/04/27 - Cambia la actividad del prospecto usando el endpoint controlado con confirmación y limpieza automática de dependencias.
  const handleActividadChange = async (id, nuevaActividad) => {
    if (!nuevaActividad) return;

    const valoresValidos = [
      'No especifica',
      'Musculacion',
      'Pilates',
      'Clases grupales',
      'Pase full'
    ];

    if (!valoresValidos.includes(nuevaActividad)) return;

    const prospectoActual = prospectos.find((p) => Number(p.id) === Number(id));
    if (!prospectoActual) return;

    const actividadAnterior = prospectoActual.actividad;

    if (actividadAnterior === nuevaActividad) return;

    const veniaDePilates = actividadAnterior === 'Pilates';
    const vaAPilates = nuevaActividad === 'Pilates';
    const cambiaDeFamilia = veniaDePilates !== vaAPilates;

    const textoConfirmacion = cambiaDeFamilia
      ? 'Este cambio limpiará clases, horarios y dependencias asociadas al flujo anterior para evitar inconsistencias.'
      : 'Se actualizará la actividad del prospecto y se limpiarán las clases cargadas para evitar inconsistencias.';

    const confirmacion = await Swal.fire({
      icon: 'warning',
      title: 'Cambiar actividad',
      text: textoConfirmacion,
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        confirmButton:
          'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
          'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400',
        cancelButton:
          'swal2-cancel ml-2 inline-flex items-center px-4 py-2 rounded-md font-medium ' +
          'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400',
        popup: 'rounded-xl'
      }
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await axios.post(
        `http://localhost:8080/ventas-prospectos/${id}/cambiar-actividad`,
        {
          actividad_nueva: nuevaActividad
        }
      );

      const data = response?.data || {};

      await Swal.fire({
        icon: 'success',
        title: 'Actividad actualizada',
        text:
          data?.message ||
          'La actividad del prospecto se actualizó correctamente.',
        confirmButtonText: 'Aceptar',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
            'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400',
          popup: 'rounded-xl'
        }
      });

      await fetchProspectos();
    } catch (error) {
      console.error('Error al cambiar actividad:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error?.response?.data?.mensajeError ||
          'No se pudo cambiar la actividad del prospecto.',
        confirmButtonText: 'Cerrar',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
            'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400',
          popup: 'rounded-xl'
        }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Solo tomar los primeros 10 caracteres "YYYY-MM-DD"
    const [year, month, day] = dateString.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtrar prospectos
  const filtered = prospectos?.length
    ? prospectos.filter((p) => {
        const nombreMatch = (p.nombre || '')
          .toLowerCase()
          .includes(search.toLowerCase());
        if (!nombreMatch) return false;

        // Filtro sede si aplica
        if (selectedSede) {
          const sedeProspecto = normalizeSede(p.sede);
          if (sedeProspecto !== selectedSede) return false;
        }

        // Filtros adicionales
        if (tipoFiltro && p.tipo_prospecto !== tipoFiltro) return false;
        if (canalFiltro && p.canal_contacto !== canalFiltro) return false;
        if (actividadFiltro && p.actividad !== actividadFiltro) return false;

        // 🔹 NUEVO: filtro por convertido
        if (convertidoFiltro === 'si' && !p.convertido) return false;
        if (convertidoFiltro === 'no' && p.convertido) return false;
        // 🔹 NUEVO FILTRO: sólo los que tienen alerta amarilla o roja
        if (alertaFiltro === 'con-alerta') {
          const color = alertasSegundoContacto[p.id];
          if (color !== 'amarillo' && color !== 'rojo') return false;
        }

        // 🔹 NUEVO: filtro comisión
        if (comisionFiltro === 'con' && !esComision(p.comision)) return false;
        if (comisionFiltro === 'sin' && esComision(p.comision)) return false;

        // NUEVO: Estado de comisión (amarillo/azul/rojo)
        if (comisionEstadoFiltro) {
          if ((p.comision_estado || '') !== comisionEstadoFiltro) return false;
        }
        return true;
      })
    : [];

  // Ordenar por convertido y por id desc
  const sorted = [...filtered].sort((a, b) => {
    if (!a.convertido && b.convertido) return -1;
    if (a.convertido && !b.convertido) return 1;
    return b.id - a.id;
  });

  // Asegura que la página siempre esté entre 1 y totalPages
  const totalPages = Math.max(Math.ceil(sorted.length / rowsPerPage), 1);
  const safePage = Math.max(1, Math.min(page, totalPages)); // <-- Corrige si alguien fuerza page<1

  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const visibleProspectos = sorted.slice(startIndex, endIndex);

  // Para la paginación
  const handleChangePage = (nuevaPage) => {
    const nextPage = Math.max(1, Math.min(nuevaPage, totalPages));
    setPage(nextPage);

    // Hacé el scroll después de un pequeño delay para que React pinte la nueva página
    setTimeout(() => {
      if (visibleProspectos.length > 0) {
        const firstRow = document.getElementById(
          `prospecto-${visibleProspectos[0].id}`
        );
        if (firstRow) {
          firstRow.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Opcional: resalta la fila un segundo
          firstRow.classList.add(
            'ring-2',
            'ring-[#fc4b08]',
            'ring-offset-2',
            'animate-pulse'
          );
          setTimeout(() => {
            firstRow.classList.remove(
              'ring-2',
              'ring-[#fc4b08]',
              'ring-offset-2',
              'animate-pulse'
            );
          }, 900);
        }
      } else {
        const listTop = document.getElementById('prospectos-lista-top');
        if (listTop) {
          listTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 80); // Pequeño delay para que la tabla ya esté renderizada
  };

  // console.log('prospectosConAgendaHoy', prospectosConAgendaHoy);
  // console.log(
  //   'visibleProspectos',
  //   visibleProspectos.map((p) => p.id)
  // );

  // Calcular cuántas filas vacías para llegar a 20
  const emptyRowsCount = 20 - visibleProspectos.length;

  // Input de búsqueda
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset al buscar
  };

  const openClasePruebaModal = (id, num) => {
    setClaseSeleccionada({ id, num });
    setModalClaseOpen(true);
  };

  const verificarClientePruebaPorNombre = async (nombre) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/clientes-pilates/existe-prueba-por-nombre?nombre=${nombre}`
      );
      /* console.log(response.data); */
      return response.data;
    } catch (error) {
      return { existe: false };
    }
  };

  // Benjamin Orellana - 2026/04/27 - Mantiene el flujo histórico de Pilates en ventas, impactando clientes_pilates, inscripciones y horarios asociados.
  const insertarModificarClaseDePrueba = async (id, cambios, tipo) => {
    try {
      const fechaInicio = new Date(cambios.fecha);
      const fechaFin = new Date(fechaInicio);
      fechaFin.setDate(fechaFin.getDate() + 1);

      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      const datosClasePrueba = {
        id: cambios.idProspecto || null,
        nombre: cambios.nombre,
        telefono: cambios.contacto,
        fecha_inicio: cambios.fecha,
        fecha_fin: fechaFinStr,
        estado:
          cambios.tipo === 'Clase de prueba'
            ? 'Clase de prueba'
            : 'Renovacion programada'
      };

      const inscripcionData = {
        dia: cambios.diaSeleccionado,
        horario: cambios.horarioSeleccionado.hhmm,
        fecha_inscripcion: cambios.fecha,
        id_sede: sedeId
      };

      const horarioSeleccionadoProspecto = {
        hhmm: cambios.horarioSeleccionado.hhmm,
        grp: cambios.horarioSeleccionado.grp,
        clase_num: cambios.numeroClase,
        prospecto_id: cambios.idProspecto
      };

      if (!cambios.esModificacion) {
        const verificacion = await verificarClientePruebaPorNombre(
          cambios.nombre
        );

        if (verificacion.existe && verificacion.id) {
          try {
            await axios.delete(
              `http://localhost:8080/clientes-pilates/con-inscripciones/${verificacion.id}`
            );
          } catch (error) {
            throw new Error(
              `No se pudo eliminar el cliente existente con id ${verificacion.id}: ${error.message}`
            );
          }
        }

        await insertCliente(datosClasePrueba, inscripcionData);

        await axios.post(
          `http://localhost:8080/ventas-prospectos-horarios`,
          horarioSeleccionadoProspecto
        );

        traerHorariosDisponibles(sedeId);
      } else {
        await axios.put(
          `http://localhost:8080/ventas-prospectos-horarios/modificar-por-prospecto`,
          horarioSeleccionadoProspecto
        );
        console.log('Se ha modificado el horario del prospecto en ventas');
      }

      return true;
    } catch (error) {
      console.error('Error al insertar/modificar clase de prueba:', error);
      throw error;
    }
  };

  // Benjamin Orellana - 2026/04/27 - Sincroniza la clase interna desde ventas y, si el prospecto es Pilates, conserva además el flujo histórico que impacta en clientes_pilates.
  const handleClasePruebaSave = async (_prospectoId, cambios) => {
    try {
      const prospectoActual = prospectos.find(
        (p) => Number(p.id) === Number(cambios.idProspecto || _prospectoId)
      );

      const esPilates = prospectoActual?.actividad === 'Pilates';
      const tipoPilatesValido =
        cambios.tipo === 'Clase de prueba' ||
        cambios.tipo === 'Visita programada';

      // Benjamin Orellana - 2026/04/27 - Si es Pilates, primero se ejecuta el flujo histórico que impacta en clientes_pilates e inscripciones.
      if (esPilates && tipoPilatesValido) {
        await insertarModificarClaseDePrueba(
          cambios.idProspecto || _prospectoId,
          cambios,
          cambios.tipo
        );
      }

      const payload = {
        prospecto_id: cambios.idProspecto || _prospectoId,
        numeroClase: Number(cambios.numeroClase),
        fecha: cambios.fecha,
        hora_clase: cambios.hora_clase,
        tipo: cambios.tipo,
        observacion:
          cambios[`clase_prueba_${cambios.numeroClase}_obs`] ||
          cambios.observacion ||
          '',
        necesita_profe: !!cambios.necesita_profe,
        hhmm: cambios.hhmm || cambios.horarioSeleccionado?.hhmm || '',
        grp: cambios.grp || cambios.horarioSeleccionado?.grp || '',
        sede_id: cambios.sede_id || prospectoActual?.sede_id || sedeId || null
      };

      const response = await axios.post(
        'http://localhost:8080/ventas-prospectos/sync-clase-interna',
        payload
      );

      const data = response?.data || {};

      if (data?.mensajeAdvertencia) {
        await Swal.fire({
          icon: 'warning',
          title: 'Clase guardada con advertencia',
          text: data.mensajeAdvertencia,
          confirmButtonText: 'Entendido',
          buttonsStyling: false,
          customClass: {
            confirmButton:
              'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
              'bg-orange-600 text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400',
            popup: 'rounded-xl'
          }
        });
      } else {
        await Swal.fire({
          icon: 'success',
          title: 'Clase actualizada',
          text: esPilates
            ? 'La clase se sincronizó correctamente y se impactó en Pilates.'
            : 'La clase se sincronizó correctamente.',
          confirmButtonText: 'Aceptar',
          buttonsStyling: false,
          customClass: {
            confirmButton:
              'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
              'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400',
            popup: 'rounded-xl'
          }
        });
      }

      await fetchProspectos();
    } catch (error) {
      console.error('Error sincronizando clase interna:', error);

      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error?.response?.data?.mensajeError ||
          error?.message ||
          'No se pudo sincronizar la clase interna.',
        confirmButtonText: 'Cerrar',
        buttonsStyling: false,
        customClass: {
          confirmButton:
            'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
            'bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400',
          popup: 'rounded-xl'
        }
      });
    }
  };

  const handleEliminarProc = async (id) => {
    const confirmacion = window.confirm(
      '¿Seguro que desea eliminar esta recaptación?'
    );
    if (confirmacion) {
      try {
        await axios.delete(`${URL}/${id}`);
        setProspectos(prospectos.filter((q) => q.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const abrirModal = () => {
    setModalNew(true);
    setClaseSeleccionada(null);
  };
  const cerarModal = () => {
    setModalNew(false);
    fetchProspectos();
  };

  const handleEditarRec = (rec) => {
    // Se actualiza el estado con los detalles de la recaptacion seleccionada
    setClaseSeleccionada(rec);

    // Se abre el modal para editar la recaptacion
    setModalNew(true);
  };

  const handleOrigenChange = async (id, value) => {
    setProspectos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, campania_origen: value } : p))
    );

    try {
      await axios.put(`http://localhost:8080/ventas_prospectos/${id}`, {
        canal_contacto: 'Campaña', // siempre es campaña acá
        campania_origen: value
      });
    } catch (error) {
      console.error('Error al actualizar origen de campaña:', error);
    }
  };

  const handleSedeChange = async (prospectoId, nuevaSede) => {
    // buscamos el prospecto actual para mostrar su nombre en el mensaje
    const prospecto = prospectos.find((p) => p.id === prospectoId);
    const sedeAnterior = prospecto?.sede;

    // actualización optimista
    setProspectos((arr) =>
      arr.map((p) => (p.id === prospectoId ? { ...p, sede: nuevaSede } : p))
    );

    try {
      await axios.put(
        `http://localhost:8080/ventas_prospectos/${prospectoId}`,
        {
          sede: nuevaSede
        }
      );

      // ✅ Éxito
      Swal.fire({
        title: 'Sede actualizada',
        text: `El prospecto "${prospecto?.nombre}" fue cambiado de "${sedeAnterior}" a "${nuevaSede}".`,
        icon: 'success',
        confirmButtonColor: '#10b981', // Tailwind green-500
        confirmButtonText: 'OK'
      });
    } catch (e) {
      // rollback si falla
      setProspectos((arr) =>
        arr.map((p) =>
          p.id === prospectoId ? { ...p, sede: sedeAnterior } : p
        )
      );

      // ❌ Error
      Swal.fire({
        title: 'Error',
        text: `No se pudo actualizar la sede de "${prospecto?.nombre}". Inténtalo de nuevo.`,
        icon: 'error',
        confirmButtonColor: '#ef4444', // Tailwind red-500
        confirmButtonText: 'Cerrar'
      });
    }
  };

  // === Constantes ===
  const PLANES = [
    'Mensual',
    'Trimestre',
    'Semestre',
    'Anual',
    'Débitos automáticos',
    'Otros'
  ];

  // === Helper: select de plan + input "Otros" en un solo modal ===
  async function promptTipoPlanConOtros(PLANES) {
    return Swal.fire({
      title: 'Tipo de plan',
      html: `
      <div style="text-align:left">
        <label for="swal-plan" style="display:block;margin-bottom:6px">Seleccioná un plan</label>
        <select id="swal-plan" class="swal2-input" style="width:100%;box-sizing:border-box">
          <option value="">-- Seleccionar --</option>
          ${PLANES.map((p) => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <div id="swal-otros-wrap" style="display:none;margin-top:8px">
          <label for="swal-otros" style="display:block;margin-bottom:6px">Detalle (si elegiste “Otros”)</label>
          <input id="swal-otros" class="swal2-input" placeholder="Ej: Plan Corporativo X" />
        </div>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const sel = document.getElementById('swal-plan');
        const otrosWrap = document.getElementById('swal-otros-wrap');
        sel.addEventListener('change', () => {
          otrosWrap.style.display = sel.value === 'Otros' ? 'block' : 'none';
        });
      },
      preConfirm: () => {
        const sel = /** @type {HTMLSelectElement} */ (
          document.getElementById('swal-plan')
        );
        const otros = /** @type {HTMLInputElement}  */ (
          document.getElementById('swal-otros')
        );
        const tipo_plan = (sel.value || '').trim();
        const tipo_plan_custom = (otros?.value || '').trim();

        if (!tipo_plan) {
          Swal.showValidationMessage('Debés seleccionar un plan');
          return false;
        }
        if (tipo_plan === 'Otros' && !tipo_plan_custom) {
          Swal.showValidationMessage('Completá el detalle para “Otros”');
          return false;
        }

        // Respeta límites de la BD
        return {
          tipo_plan: tipo_plan.slice(0, 80),
          tipo_plan_custom:
            tipo_plan === 'Otros' ? tipo_plan_custom.slice(0, 120) : null
        };
      }
    }).then((r) => (r.isConfirmed ? r.value : null));
  }

  // === Handler principal ===
  const handleConvertidoToggle = async (
    prospectoId,
    nextValue /* boolean */
  ) => {
    if (savingIds.has(prospectoId)) return;
    setSavingIds((s) => new Set([...s, prospectoId]));

    const prospecto = prospectos.find((p) => p.id === prospectoId);
    if (!prospecto) {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(prospectoId);
        return n;
      });
      return;
    }

    const prev = { ...prospecto };

    // Caso 1: Destildan => revertir conversión (UR limpia comisión en back)
    if (!nextValue) {
      // Optimista
      setProspectos((arr) =>
        arr.map((p) =>
          p.id === prospectoId
            ? {
                ...p,
                convertido: false,
                comision: false,
                comision_estado: null,
                comision_id: null
              }
            : p
        )
      );
      try {
        await axios.put(
          `http://localhost:8080/ventas_prospectos/${prospectoId}`,
          {
            convertido: false,
            comision: false,
            comision_usuario_id: userId
          }
        );
        await Swal.fire({
          title: 'Actualizado',
          text: `Se anuló la conversión y comisión de "${prospecto.nombre}".`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
      } catch (e) {
        // Rollback
        setProspectos((arr) =>
          arr.map((p) => (p.id === prospectoId ? prev : p))
        );
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo anular la conversión/comisión.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      } finally {
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
      }
      return;
    }

    // Caso 2: Tildan => primero preguntar si es comisión
    try {
      const { isConfirmed, isDenied, dismiss } = await Swal.fire({
        title: '¿Es comisión?',
        text: `Vas a marcar convertido a "${prospecto.nombre}". ¿Corresponde comisión?`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Sí, es comisión',
        denyButtonText: 'No',
        confirmButtonColor: '#10b981',
        denyButtonColor: '#6b7280',
        cancelButtonText: 'Cancelar'
      });

      if (dismiss === Swal.DismissReason.cancel) {
        // Deshacer toggling visual
        setProspectos((arr) =>
          arr.map((p) =>
            p.id === prospectoId ? { ...p, convertido: prev.convertido } : p
          )
        );
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }

      // Optimista (convertido true siempre)
      setProspectos((arr) =>
        arr.map((p) => (p.id === prospectoId ? { ...p, convertido: true } : p))
      );

      if (isDenied) {
        // No es comisión => POST convertir con esComision=false
        const { data } = await axios.post(
          `http://localhost:8080/ventas-prospectos/${prospectoId}/convertir`,
          { esComision: false, actor_id: userId }
        );
        // Sin comisión
        setProspectos((arr) =>
          arr.map((p) =>
            p.id === prospectoId
              ? {
                  ...p,
                  ...data?.prospecto,
                  comision: false,
                  comision_estado: null,
                  comision_id: null
                }
              : p
          )
        );
        await Swal.fire({
          title: 'Convertido',
          text: `El prospecto "${prospecto.nombre}" fue marcado como convertido.`,
          icon: 'success',
          confirmButtonColor: '#10b981'
        });
        return;
      }

      // Sí es comisión: pedir plan + (si Otros) texto, en un modal
      const planData = await promptTipoPlanConOtros(PLANES);
      if (!planData) {
        // Cancelaron → rollback
        setProspectos((arr) =>
          arr.map((p) => (p.id === prospectoId ? prev : p))
        );
        setSavingIds((s) => {
          const n = new Set(s);
          n.delete(prospectoId);
          return n;
        });
        return;
      }
      const { tipo_plan, tipo_plan_custom } = planData;

      // POST convertir con comisión
      const payload = {
        esComision: true,
        tipo_plan,
        ...(tipo_plan === 'Otros' ? { tipo_plan_custom } : {}),
        observacion: '', // opcional
        actor_id: userId
      };

      const { data } = await axios.post(
        `http://localhost:8080/ventas-prospectos/${prospectoId}/convertir`,
        payload
      );

      // Actualizar con la respuesta (queda en revisión = amarillo)
      setProspectos((arr) =>
        arr.map((p) =>
          p.id === prospectoId
            ? {
                ...p,
                ...data?.prospecto,
                convertido: true,
                comision: true,
                comision_estado: 'en_revision',
                comision_id: data?.comision?.id ?? p.comision_id,
                comision_usuario_id: userId,
                comision_registrada_at: new Date().toISOString()
              }
            : p
        )
      );

      await Swal.fire({
        title: 'Comisión enviada',
        text: 'Tu comisión quedó en revisión. Un coordinador la aprobará o rechazará.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (e) {
      // Rollback
      setProspectos((arr) => arr.map((p) => (p.id === prospectoId ? prev : p)));
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo convertir/registrar la comisión.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSavingIds((s) => {
        const n = new Set(s);
        n.delete(prospectoId);
        return n;
      });
    }
  };

  const patchComision = async (p, body) => {
    if (!p?.comision_id) throw new Error('comision_id no definido');
    const res = await axios.patch(
      `http://localhost:8080/ventas-comisiones/${p.comision_id}`,
      { actor_id: userId, ...body } // SIEMPRE actor_id
    );
    return res.data?.data || null;
  };

  const applyProspectoEstado = (prospectoId, nextEstado, comisionId) => {
    setProspectos((arr) =>
      arr.map((px) =>
        px.id === prospectoId
          ? {
              ...px,
              comision_estado: nextEstado,
              comision_id: comisionId ?? px.comision_id
            }
          : px
      )
    );
  };

  const handleAprobarComision = async (prospecto) => {
    try {
      if (!prospecto?.comision_id) {
        await Swal.fire({
          icon: 'error',
          title: 'Sin comisión',
          text: 'No hay comisión vinculada a este prospecto.'
        });
        return;
      }

      // Asegurar que tenemos los vendedores permitidos
      const sellers = await loadAllowedSellers();

      // Construimos el HTML del form (monto + vendedor)
      const defaultSellerId = String(userId); // por defecto: el actor actual
      const sellerOptions = sellers
        .map((u) => `<option value="${u.id}">${u.name} (#${u.id})</option>`)
        .join('');

      const { isConfirmed, value } = await Swal.fire({
        title: 'Aprobar comisión',
        html: `
        <div style="text-align:left">
          <label style="display:block;margin-bottom:6px">Monto de la comisión</label>
          <input id="swal-monto" type="number" min="0" step="0.01" style="width:100%;padding:8px;border-radius:8px;background:#0b1220;color:#e5e7eb;border:1px solid #334155" placeholder="Ej: 2000.00" />

          <div style="height:10px"></div>
          <label style="display:block;margin-bottom:6px">Asignar a vendedor</label>
          <select id="swal-vendedor" style="width:100%;padding:8px;border-radius:8px;background:#0b1220;color:#e5e7eb;border:1px solid #334155">
            ${sellerOptions}
          </select>
        </div>
      `,
        didOpen: () => {
          const $monto = document.getElementById('swal-monto');
          const $vend = document.getElementById('swal-vendedor');
          if ($vend) $vend.value = defaultSellerId;
          if ($monto) $monto.focus();
        },
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Aprobar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10b981',
        background: '#0f172a',
        color: '#e5e7eb',
        preConfirm: () => {
          const $monto = document.getElementById('swal-monto');
          const $vend = document.getElementById('swal-vendedor');
          const monto = Number(String($monto?.value || '').replace(',', '.'));
          const vendedor_id = Number($vend?.value);

          if (!Number.isFinite(monto) || monto < 0) {
            Swal.showValidationMessage('Ingresá un monto válido');
            return;
          }
          if (!vendedor_id) {
            Swal.showValidationMessage('Seleccioná un vendedor');
            return;
          }
          return { monto, vendedor_id };
        }
      });

      if (!isConfirmed || !value) return;
      const { monto, vendedor_id } = value;

      // Optimista → aprobado (azul)
      applyProspectoEstado(prospecto.id, 'aprobado', prospecto.comision_id);

      await patchComision(prospecto, {
        estado: 'aprobado',
        monto_comision: monto,
        moneda: 'ARS',
        vendedor_id // << puede ser el actor o uno distinto (FEDE, SOL, LOURDES)
      });

      await Swal.fire({
        icon: 'success',
        title: 'Aprobada',
        text: 'Comisión aprobada correctamente.'
      });
    } catch (e) {
      // Rollback a en_revision
      applyProspectoEstado(prospecto.id, 'en_revision', prospecto.comision_id);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          e?.response?.data?.mensajeError || 'No se pudo aprobar la comisión.'
      });
    }
  };

  const handleRechazarComision = async (prospecto) => {
    try {
      if (!prospecto?.comision_id) {
        await Swal.fire({
          icon: 'error',
          title: 'Sin comisión',
          text: 'No hay comisión vinculada a este prospecto.'
        });
        return;
      }

      const { value: motivo, isConfirmed } = await Swal.fire({
        title: 'Motivo de rechazo',
        input: 'text',
        inputPlaceholder: 'Ej: Falta comprobante de pago',
        inputValidator: (v) =>
          !v || !v.trim() ? 'Ingresá un motivo' : undefined,
        showCancelButton: true,
        confirmButtonText: 'Rechazar',
        cancelButtonText: 'Cancelar'
      });
      if (!isConfirmed) return;

      // Optimista → rojo
      applyProspectoEstado(prospecto.id, 'rechazado', prospecto.comision_id);

      await patchComision(prospecto, {
        estado: 'rechazado',
        motivo_rechazo: motivo.trim()
      });

      await Swal.fire({
        icon: 'success',
        title: 'Rechazada',
        text: 'Comisión rechazada.'
      });
    } catch (e) {
      applyProspectoEstado(prospecto.id, 'en_revision', prospecto.comision_id);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          e?.response?.data?.mensajeError || 'No se pudo rechazar la comisión.'
      });
    }
  };

  const handleMenuCambiarDesdeAprobado = async (prospecto) => {
    if (!prospecto?.comision_id) {
      await Swal.fire({
        icon: 'error',
        title: 'Sin comisión',
        text: 'No hay comisión vinculada a este prospecto.'
      });
      return;
    }

    const { value: next, isConfirmed } = await Swal.fire({
      title: 'Cambiar estado',
      input: 'radio',
      inputOptions: {
        en_revision: 'Volver a revisión (amarillo)',
        rechazado: 'Rechazado (rojo)'
      },
      inputValidator: (v) => (!v ? 'Seleccioná un estado' : undefined),
      showCancelButton: true,
      confirmButtonText: 'Cambiar',
      confirmButtonColor: '#10b981',
      cancelButtonText: 'Cancelar'
    });
    if (!isConfirmed) return;

    const prev = prospecto.comision_estado;
    applyProspectoEstado(prospecto.id, next, prospecto.comision_id);

    try {
      // si eligen rechazado y querés pedir motivo:
      if (next === 'rechazado') {
        const { value: motivo, isConfirmed: conf } = await Swal.fire({
          title: 'Motivo de rechazo',
          input: 'text',
          inputPlaceholder: 'Opcional',
          showCancelButton: true,
          confirmButtonText: 'Rechazar'
        });
        if (!conf) {
          applyProspectoEstado(prospecto.id, prev, prospecto.comision_id);
          return;
        }
        await patchComision(prospecto, {
          estado: 'rechazado',
          motivo_rechazo: (motivo || '').trim()
        });
      } else {
        // volver a revisión
        await patchComision(prospecto, { estado: 'en_revision' });
      }
      await Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: `Estado cambiado a ${next.replace('_', ' ')}.`
      });
    } catch (e) {
      applyProspectoEstado(prospecto.id, prev, prospecto.comision_id);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: e?.response?.data?.mensajeError || 'No se pudo cambiar el estado.'
      });
    }
  };

  // estados nuevos
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  // reemplazo: abrimos el picker primero, no el modal directo
  const openClasePruebaPicker = (prospecto, num) => {
    const fechaKey = `clase_prueba_${num}_fecha`;
    const tipoKey = `clase_prueba_${num}_tipo`;

    const yaTieneDatos = Boolean(prospecto?.[fechaKey] || prospecto?.[tipoKey]);

    // Guardamos selección base para el modal
    setClaseSeleccionada({ id: prospecto.id, num, prospecto });

    if (yaTieneDatos) {
      // 👉 Abre modal directo con lo que ya tiene (tipo preseleccionado)
      setTipoSeleccionado(prospecto?.[tipoKey] || '');
      setModalClaseOpen(true);
      return;
    }

    // 👉 No tiene datos → primero picker de tipo
    Swal.fire({
      title: `Clase #${num}`,
      text: '¿Qué querés agendar?',
      input: 'select',
      inputOptions: {
        Agenda: 'Agenda',
        'Visita programada': 'Visita programada',
        'Clase de prueba': 'Clase de prueba'
      },
      inputPlaceholder: 'Seleccioná una opción',
      showCancelButton: true,
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',

      // 👇 clave: usa tus clases (Tailwind) y desactiva el styling por defecto
      buttonsStyling: false,
      customClass: {
        confirmButton:
          'swal2-confirm inline-flex items-center px-4 py-2 rounded-md font-medium ' +
          'bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400',
        cancelButton:
          'swal2-cancel ml-2 inline-flex items-center px-4 py-2 rounded-md font-medium ' +
          'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400',
        popup: 'rounded-xl'
      }
    }).then((res) => {
      if (res.isConfirmed && res.value) {
        setTipoSeleccionado(res.value);
        setModalClaseOpen(true);
      }
    });
  };

  const handleComisionStateChange = ({
    prospectoId,
    estado,
    comisionId,
    monto
  }) => {
    setProspectos((arr) =>
      arr.map((p) =>
        p.id === prospectoId
          ? {
              ...p,
              comision: true,
              comision_id: comisionId ?? p.comision_id,
              comision_estado: estado // 'aprobado' | 'rechazado' | 'en_revision'
            }
          : p
      )
    );
  };

  // IDs y emails habilitados
  const ALLOWED_IDS = new Set([66, 92, 81]);
  const ALLOWED_EMAILS = new Set(
    [
      'fedekap@hotmail.com',
      'solciruiz098@gmail.com.ar',
      'lourdesbsoraire@gmail.com',
      'rosario.nieva24@gmail.com'
    ].map((e) => e.toLowerCase())
  );

  // Normalizaciones
  const isVendedor =
    String(currentUser2?.level || '').toLowerCase() === 'vendedor';

  // Si tu auth carga el email en userName, lo usamos como fallback
  const emailLower = String(currentUser2?.email || userName || '')
    .trim()
    .toLowerCase();

  const canSeePanel =
    isVendedor &&
    ((currentUser2?.id && ALLOWED_IDS.has(Number(currentUser2.id))) ||
      (emailLower && ALLOWED_EMAILS.has(emailLower)));

  const isManager = ['admin', 'gerente'].includes(
    String(currentUser2?.level || '').toLowerCase()
  );

  const canSeeComisionesBtn =
    isManager ||
    (isVendedor &&
      ((currentUser2?.id && ALLOWED_IDS.has(Number(currentUser2.id))) ||
        (emailLower && ALLOWED_EMAILS.has(emailLower))));

  const [vendedoresAllowed, setVendedoresAllowed] = useState([]);

  const isAllowedUser = (u) => {
    if (!u) return false;
    const byId = ALLOWED_IDS.has(Number(u.id));
    const byEmail = u.email
      ? ALLOWED_EMAILS.has(String(u.email).toLowerCase())
      : false;
    return byId || byEmail;
  };
  const loadAllowedSellers = async () => {
    if (vendedoresAllowed.length) return vendedoresAllowed;
    const res = await fetch('http://localhost:8080/users');
    const data = await res.json();
    const list = (Array.isArray(data) ? data : []).filter(isAllowedUser);
    // Orden por nombre
    list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    setVendedoresAllowed(list);
    return list;
  };

  const normalizarKey = (str) => {
    let nombre = str;
    let key = str;

    if (str.toLowerCase() === 'barrio sur') {
      nombre = 'Tuc. Barrio Sur';
      key = 'smt';
    } else if (str.toLowerCase() === 'barrio norte') {
      nombre = 'Tuc. Barrio Norte';
      key = 'barrio norte';
    } else if (str.toLowerCase() === 'Yerba Buena - Aconquija 2044') {
      nombre = 'Yerba Buena - Aconquija 2044';
      key = 'Yerba Buena - Aconquija 2044';
    } else if (str.toLowerCase() === 'concepción') {
      nombre = 'Concepción';
      key = 'concepcion';
    }
    return { nombre, key };
  };

  let SEDES = [];
  let sedes = [];
  if (sedesEsCiudad) {
    SEDES = sedesEsCiudad
      .filter((s) => s.nombre.toLowerCase() != 'multisede')
      .map((s) => ({
        value:
          s.nombre.toLowerCase() === 'Yerba Buena - Aconquija 2044'
            ? 'Yerba Buena - Aconquija 2044'
            : s.nombre
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''),
        label:
          s.nombre.toLowerCase() === 'Yerba Buena - Aconquija 2044'
            ? 'Yerba Buena'
            : s.nombre
      }));

    sedes = sedesEsCiudad
      .filter((s) => s.nombre.toLowerCase() != 'multisede')
      .map((s) => ({
        key: normalizarKey(s.nombre).key,
        label: normalizarKey(s.nombre).nombre
      }));
    console.log(sedes);
  }

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2 shadow-md">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors duration-300">
                Volver
              </button>
            </Link>
          </div>
          <div className="text-center pt-4 text-[#fc4b08] font-bignoodle text-6xl font-bold">
            <h1>VENTAS</h1>
          </div>
          {/* Filtros */}

          <section className="flex flex-col sm:flex-row flex-wrap gap-4 justify-between items-center my-6 px-2">
            <FiltroMesAnio
              mes={mes}
              setMes={setMes}
              anio={anio}
              setAnio={setAnio}
            />
          </section>
          <div className="flex gap-1 mb-1 ml-1">
            <button
              onClick={() =>
                exportProspectosExcel({
                  mes,
                  anio,
                  prospectos, // todos los registros del mes/año ya cargados
                  search,
                  selectedSede, // filtros activos
                  tipoFiltro,
                  canalFiltro,
                  actividadFiltro,
                  formatDate // tu helper
                })
              }
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              Exportar Excel
            </button>{' '}
            <div>
              <a
                href={InstructivosVentas}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-orange-500 font-semibold text-white shadow-md hover:bg-orange-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                download="Instructivo_ventas.pdf"
              >
                <Download />
                Descargar instructivo
              </a>
            </div>
          </div>
          <FilterToolbar
            search={search}
            setSearch={setSearch}
            tipoFiltro={tipoFiltro}
            setTipoFiltro={setTipoFiltro}
            canalFiltro={canalFiltro}
            setCanalFiltro={setCanalFiltro}
            actividadFiltro={actividadFiltro}
            setActividadFiltro={setActividadFiltro}
            convertidoFiltro={convertidoFiltro}
            setConvertidoFiltro={setConvertidoFiltro}
            comisionFiltro={comisionFiltro}
            setComisionFiltro={setComisionFiltro}
            alertaFiltro={alertaFiltro}
            setAlertaFiltro={setAlertaFiltro}
            selectedSede={selectedSede}
            setSelectedSede={setSelectedSede}
            mes={mes}
            setMes={setMes}
            anio={anio}
            setAnio={setAnio}
            onExportClick={() =>
              exportProspectosExcel({
                mes,
                anio,
                prospectos,
                search,
                selectedSede,
                tipoFiltro,
                canalFiltro,
                actividadFiltro,
                convertidoFiltro,
                alertaFiltro,
                comisionFiltro,
                formatDate
              })
            }
            comisionEstadoFiltro={comisionEstadoFiltro} // NUEVO
            setComisionEstadoFiltro={setComisionEstadoFiltro} // NUEVO
            counts={{
              all: prospectos.length,
              convertidos: prospectos.filter((p) => p.convertido).length,
              comision: prospectos.filter((p) => p.comision).length,
              alerta: prospectos.filter((p) =>
                ['amarillo', 'rojo'].includes(alertasSegundoContacto[p.id])
              ).length,
              // opcional: contadores por estado de comisión
              comiEnRev: prospectos.filter(
                (p) => p.comision_estado === 'en_revision'
              ).length,
              comiAprob: prospectos.filter(
                (p) => p.comision_estado === 'aprobado'
              ).length,
              comiRecha: prospectos.filter(
                (p) => p.comision_estado === 'rechazado'
              ).length
            }}
          />

          <div className="flex justify-center gap-3 pb-10 flex-wrap">
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nuevo Registro
              </button>
            </Link>

            <button
              onClick={() => setShowStats(true)}
              className="bg-[#fc4b08] hover:bg-orange-500 text-white py-2 px-4 rounded transition-colors duration-100 font-semibold"
            >
              Ver Estadísticas
            </button>

            {/* ⚠️ Mantener pill amarillo */}
            <div
              className="flex items-center ml-3 gap-1 bg-yellow-200 border border-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-xl shadow select-none cursor-pointer hover:scale-105 active:scale-95 transition"
              onClick={() => setShowAgendasModal(true)}
              title="Ver agendas automáticas del día"
            >
              <span className="text-xl font-black">⚠️</span>
              <span>Agendas de hoy:</span>
              <span className="text-lg">
                {prospectosConAgendaHoy.length + agendaVentasCant}
              </span>
            </div>
            {canSeeComisionesBtn && (
              <button
                onClick={() => setOpenComi(true)}
                className="relative bg-emerald-400 text-zinc-900 border border-zinc-200 hover:bg-emerald-600 py-2 px-4 rounded-xl font-semibold transition"
                title="Ver comisiones vigentes"
              >
                Comisiones vigentes
              </button>
            )}

            {/* 🔴 Nuevo botón Agenda de hoy con badge fijo en 4 */}
            {/* <button
              onClick={() => setOpenAgenda(true)}
              className="relative bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded font-semibold transition-colors duration-100"
              title="Ver agenda de hoy"
            >
              Nueva Agendas
            </button> */}
          </div>

          {/* Botones de sedes con control de acceso */}
          <div className="w-full flex justify-center mb-10 px-2">
            <div
              className="flex gap-2 md:gap-4 flex-wrap lg:flex-nowrap overflow-x-auto scrollbar-hide py-2"
              style={{ WebkitOverflowScrolling: 'touch', maxWidth: '100vw' }}
            >
              {sedes.map(({ key, label }) => {
                const normalizedKey = normalizeString(key);
                const isSelected = selectedSede === normalizedKey;

                return (
                  <button
                    key={key}
                    className={`
        flex-shrink-0
        px-6 py-2
        rounded-full
        font-bold
        text-sm md:text-base
        focus:outline-none focus:ring-2 focus:ring-green-500
        transition-all duration-150
        ${
          isSelected
            ? 'bg-green-800 text-white shadow-md scale-105 border border-green-900'
            : 'bg-green-600 text-white hover:bg-green-700 border border-green-700'
        }
      `}
                    style={{
                      minWidth: 120,
                      marginBottom: 4,
                      marginTop: 4,
                      letterSpacing: '.02em'
                    }}
                    onClick={() => {
                      setSelectedSede(
                        selectedSede === normalizedKey ? null : normalizedKey
                      );
                      setPage(1);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <style>{`
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `}</style>
          </div>

          <div className="text-center pt-4">
            {/* Botón visible solo para gerente/admin */}
            {(userLevel === 'gerente' || userLevel === 'admin') && (
              <div className="w-full flex justify-center mb-3">
                <button
                  onClick={() => setShowComisiones(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 shadow"
                >
                  Ver comisiones
                </button>
              </div>
            )}
            {/* Panel solo para VENDEDOR (filtrado por lista blanca) */}
            {/* {userLoading ? (
              <div className="max-w-5xl mx-auto my-6">
                <div className="h-40 rounded-2xl bg-neutral-200 animate-pulse" />
              </div>
            ) : canSeePanel ? (
              // pasamos email por si el componente lo necesita luego
              <VendedorComisionesPanel
                user={{
                  ...currentUser2,
                  email: currentUser2?.email ?? userName
                }}
              />
            ) : null} */}
            <h1>
              Registros de Prospectos - Cantidad: {visibleProspectos.length}
            </h1>
          </div>

          <div className="w-full flex flex-col items-center mt-4">
            <div className="flex gap-2 items-center select-none">
              <button
                className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
                onClick={() => handleChangePage(1)}
                disabled={safePage === 1}
                aria-label="Primera página"
              >
                ⏮
              </button>
              <button
                className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
                onClick={() => handleChangePage(safePage - 1)}
                disabled={safePage === 1}
                aria-label="Anterior"
              >
                ←
              </button>
              {/* Números de página, máximo 5 botones visibles */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((n) =>
                  totalPages <= 5
                    ? true
                    : Math.abs(n - safePage) <= 2 || n === 1 || n === totalPages
                )
                .map((n, i, arr) => (
                  <React.Fragment key={n}>
                    {/* ...puntitos entre saltos */}
                    {i > 0 && n - arr[i - 1] > 1 && (
                      <span className="px-1 text-gray-400">…</span>
                    )}
                    <button
                      className={`rounded-full px-3 py-1 font-bold border-2 ${
                        n === safePage
                          ? 'bg-[#fc4b08] text-white border-[#fc4b08] scale-110 shadow-lg'
                          : 'bg-white/90 text-[#fc4b08] border-[#fc4b08] hover:bg-[#fc4b08] hover:text-white'
                      } shadow-sm transition`}
                      onClick={() => handleChangePage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                ))}
              <button
                className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
                onClick={() => handleChangePage(safePage + 1)}
                disabled={safePage === totalPages}
                aria-label="Siguiente"
              >
                →
              </button>
              <button
                className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
                onClick={() => handleChangePage(totalPages)}
                disabled={safePage === totalPages}
                aria-label="Última página"
              >
                ⏭
              </button>
            </div>
            <span className="text-sm text-gray-500 mt-1">
              Página <span className="font-bold">{safePage}</span> de{' '}
              <span className="font-bold">{totalPages}</span> &bull; Mostrando{' '}
              <span className="font-bold">{visibleProspectos.length}</span> de{' '}
              <span className="font-bold">{sorted.length}</span> prospectos
            </span>
          </div>

          {/* Modal de agendas automáticas */}
          <AgendasVentas
            userId={userId}
            level={userLevel} // 👈 pasar el nivel
            open={showAgendasModal}
            onClose={() => setShowAgendasModal(false)}
            onVentasCountChange={setAgendaVentasCant} // 👈 opcional para refrescar contador al marcar done
          />

          <div className="overflow-auto max-h-[70vh] mt-6 rounded-lg shadow-lg border border-gray-300 bg-white">
            <table className="uppercase min-w-[900px] text-sm border-collapse w-full">
              <thead className="bg-orange-600 text-white  sticky top-0 z-20">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Fecha
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Colaborador
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Nombre
                  </th>{' '}
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Sede
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-24">
                    DNI
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-32">
                    Tipo Prospecto
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-36">
                    Canal Contacto
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Usuario / Celular
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[160px]">
                    Actividad
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #1
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #2
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #3
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 1
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 2
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 3
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-16">
                    Observación
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-16">
                    Convertido
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-16">
                    Estado conversión
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-center w-16 rounded-r-lg">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProspectos.map((p) => (
                  <tr
                    id={`prospecto-${p.id}`}
                    key={p.id}
                    className={`${
                      prospectosConAgendaHoy.includes(Number(p.id))
                        ? 'bg-yellow-100 font-semibold'
                        : ''
                    } hover:bg-orange-600 transition-colors duration-300 cursor-pointer text-gray-800`}
                    style={{ minHeight: '48px' }}
                  >
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      {formatDate(p.fecha)}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      {p.asesor_nombre}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[160px] ${getBgClass(
                        p
                      )}`}
                    >
                      <div className="flex items-center gap-2">
                        {alertasSegundoContacto[p.id] === 'amarillo' && (
                          <span
                            title="Pendiente segundo contacto"
                            className="text-yellow-400 text-xl font-bold"
                            style={{ lineHeight: 1 }}
                          >
                            &#9888;
                          </span>
                        )}

                        {alertasSegundoContacto[p.id] === 'rojo' && (
                          <AlertTriangle
                            title="Segundo contacto URGENTE"
                            className="text-red-500 inline-block"
                            size={22}
                            style={{ verticalAlign: 'middle', marginRight: 4 }}
                          />
                        )}

                        <input
                          type="text"
                          value={p.nombre}
                          onChange={(e) =>
                            handleChange(p.id, 'nombre', e.target.value)
                          }
                          className="
        w-full
        border-b
        border-gray-300
        text-sm
        px-2
        py-1
        text-gray-700
        bg-white
        transition-colors
        duration-200
        ease-in-out
        hover:text-black
        focus:border-orange-600
        focus:outline-none
        cursor-text
      "
                          placeholder="Nombre completo"
                        />
                      </div>
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[180px] ${getBgClass(
                        p
                      )}`}
                    >
                      {/* Sede */}
                      <select
                        value={(p.sede || '').toLowerCase()}
                        onChange={(e) => handleSedeChange(p.id, e.target.value)}
                        className="
      w-full
      rounded
      border border-gray-300
      text-sm px-3 py-2 font-sans text-gray-700 bg-white
      transition-colors duration-200 ease-in-out
      hover:bg-orange-50 hover:text-orange-900
      focus:outline-none focus:ring-2 focus:ring-orange-400
      focus:border-orange-600 cursor-pointer
    "
                      >
                        {SEDES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[160px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="text"
                        value={p.dni}
                        onChange={(e) =>
                          handleChange(p.id, 'dni', e.target.value)
                        }
                        className="
      w-full
      border-b
      border-gray-300
      text-sm
      px-2
      py-1
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:text-black
      focus:border-orange-600
      focus:outline-none
      cursor-text
    "
                        placeholder="DNI"
                      />
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[160px] ${getBgClass(
                        p
                      )}`}
                    >
                      <select
                        value={p.tipo_prospecto}
                        onChange={(e) =>
                          handleChange(p.id, 'tipo_prospecto', e.target.value)
                        }
                        className="
      w-full
      rounded
      border
      border-gray-300
      text-sm
      px-3
      py-2
      font-sans
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:bg-orange-50
      hover:text-orange-900
      focus:outline-none
      focus:ring-2
      focus:ring-orange-400
      focus:border-orange-600
      cursor-pointer
    "
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="ExSocio">ExSocio</option>
                      </select>
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[180px] ${getBgClass(
                        p
                      )}`}
                    >
                      {/* Canal de contacto */}
                      <select
                        value={p.canal_contacto}
                        onChange={(e) =>
                          handleCanalChange(p.id, e.target.value)
                        }
                        className="
                        w-full
                        rounded
                        border border-gray-300
                        text-sm px-3 py-2 font-sans text-gray-700 bg-white
                        transition-colors duration-200 ease-in-out
                        hover:bg-orange-50 hover:text-orange-900
                        focus:outline-none focus:ring-2 focus:ring-orange-400
                        focus:border-orange-600 cursor-pointer
                      "
                      >
                        <option value="Mostrador">Mostrador</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Link Web">Link Web</option>
                        <option value="Campaña">Campaña</option>
                        <option value="Comentarios/Stickers">
                          Comentarios/Stickers
                        </option>
                        <option value="Desde pilates">Desde pilates</option>
                      </select>

                      {/* Select para origen de campaña (solo si el canal es "Campaña") */}
                      {p.canal_contacto === 'Campaña' && (
                        <select
                          value={p.campania_origen || ''}
                          onChange={(e) =>
                            handleOrigenChange(p.id, e.target.value)
                          }
                          className="w-full mt-2 rounded border border-gray-300 text-sm px-3 py-2 font-sans text-gray-700 bg-white"
                        >
                          <option value="">Seleccione origen</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Whatsapp">Whatsapp</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Otro">Otro</option>
                        </select>
                      )}
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[160px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="text"
                        value={p.contacto}
                        onChange={(e) =>
                          handleChange(p.id, 'contacto', e.target.value)
                        }
                        className="
      w-full
      border-b
      border-gray-300
      text-sm
      px-2
      py-1
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:text-black
      focus:border-orange-600
      focus:outline-none
      cursor-text
    "
                        placeholder="Usuario / Celular"
                      />
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[170px] ${getBgClass(
                        p
                      )}`}
                    >
                      <select
                        value={p.actividad || ''}
                        onChange={(e) =>
                          handleActividadChange(p.id, e.target.value)
                        }
                        className="
                        w-full
                        rounded
                        border
                        border-gray-300
                        text-sm
                        px-3
                        py-2
                        font-sans
                        text-gray-700
                        bg-white
                        transition-colors
                        duration-200
                        ease-in-out
                        hover:bg-orange-50
                        hover:text-orange-900
                        focus:outline-none
                        focus:ring-2
                        focus:ring-orange-400
                        focus:border-orange-600
                        cursor-pointer
                      "
                      >
                        <option value="">Seleccione actividad</option>
                        <option value="No especifica">No especifica</option>
                        <option value="Musculacion">Musculación</option>
                        <option value="Pilates">Pilates</option>
                        <option value="Clases grupales">Clases grupales</option>
                        <option value="Pase full">Pase full</option>
                      </select>
                    </td>
                    {/* N° contacto */}
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mx-auto cursor-default transform scale-150"
                      />
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="checkbox"
                        checked={!!p.n_contacto_2}
                        onChange={() =>
                          handleCheckboxChange(p.id, 'n_contacto_2')
                        }
                        className="mx-auto cursor-default transform scale-150"
                      />
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="checkbox"
                        checked={!!p.n_contacto_3}
                        onChange={() =>
                          handleCheckboxChange(p.id, 'n_contacto_3')
                        }
                        className="mx-auto cursor-default transform scale-150"
                      />
                    </td>
                    {/* Clases de prueba */}
                    {[1, 2, 3].map((num) => {
                      const fecha = p[`clase_prueba_${num}_fecha`];
                      const tipo = p[`clase_prueba_${num}_tipo`]; // 👈 nuevo campo
                      return (
                        <td
                          key={num}
                          className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                            p
                          )} cursor-pointer`}
                          onClick={() => openClasePruebaPicker(p, num)}
                          title="Click para elegir tipo y editar fecha/observaciones"
                        >
                          <div className="text-sm">
                            {fecha ? formatDate(fecha) : '-'}
                          </div>
                          {tipo && (
                            <div className="mt-1 inline-block px-2 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-800">
                              {tipo}
                            </div>
                          )}
                        </td>
                      );
                    })}

                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[160px] ${getBgClass(
                        p
                      )}`}
                    >
                      <ObservacionField
                        value={observaciones[p.id] ?? p.observacion ?? ''}
                        onSave={async (nuevo) => {
                          // actualiza estado local
                          setObservaciones((prev) => ({
                            ...prev,
                            [p.id]: nuevo
                          }));
                          // persiste si cambió
                          if (nuevo !== p.observacion) {
                            await handleChange(p.id, 'observacion', nuevo);
                          }
                        }}
                      />
                    </td>
                    {/* Convertido */}
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      <input
                        type="checkbox"
                        checked={!!p.convertido}
                        disabled={savingIds.has(p.id)}
                        onChange={(e) =>
                          handleConvertidoToggle(p.id, e.target.checked)
                        }
                        className={`mx-auto transform scale-150 ${
                          savingIds.has(p.id)
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer'
                        }`}
                      />
                    </td>
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      {p.comision_estado ? (
                        <>
                          <span>
                            {p.comision_estado === 'en_revision' &&
                              'En revisión'}
                            {p.comision_estado === 'aprobado' && 'Aprobado'}
                            {p.comision_estado === 'rechazado' && 'Rechazado'}
                          </span>
                          {/* Si cargás la comisión al traer la grilla, podés mostrar tipo_plan */}
                          {p.comision_tipo_plan && (
                            <span className="block text-xs text-zinc-500">
                              Plan: {p.comision_tipo_plan}
                              {p.comision_tipo_plan === 'Otros' &&
                              p.comision_tipo_plan_custom
                                ? ` (${p.comision_tipo_plan_custom})`
                                : ''}
                            </span>
                          )}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* Editar y eliminar */}
                    <td
                      className={`border border-gray-300 px-4 py-3 min-w-[50px] ${getBgClass(
                        p
                      )}`}
                    >
                      <div className="flex justify-center items-center gap-3">
                        {/* <button
                          onClick={() => handleEditarRec(p)}
                          className="text-orange-600 hover:text-orange-800 font-semibold"
                          title="Editar"
                          aria-label={`Editar prospecto ${p.nombre}`}
                        >
                          ✏️
                        </button> */}

                        <button
                          onClick={() => handleEliminarProc(p.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                          title="Eliminar"
                          aria-label={`Eliminar prospecto ${p.nombre}`}
                        >
                          ❌
                        </button>
                        {/* Acciones Coordinador (solo si está en revisión) */}
                        <td className="border border-gray-300 px-4 py-3">
                          {(() => {
                            const canManage =
                              (userLevel === 'gerente' ||
                                userLevel === 'admin') &&
                              p.convertido === true &&
                              p.comision === true &&
                              !!p.comision_id;

                            if (!canManage) return null;

                            if (p.comision_estado === 'en_revision') {
                              return (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleAprobarComision(p)}
                                    className="rounded-md px-3 py-2 text-sm font-medium ring-1 ring-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200"
                                  >
                                    Aprobar
                                  </button>
                                  <button
                                    onClick={() => handleRechazarComision(p)}
                                    className="rounded-md px-3 py-2 text-sm font-medium ring-1 ring-rose-300 bg-rose-100 text-rose-800 hover:bg-rose-200"
                                  >
                                    Rechazar
                                  </button>
                                </div>
                              );
                            }

                            if (p.comision_estado === 'aprobado') {
                              return (
                                <button
                                  onClick={() =>
                                    handleMenuCambiarDesdeAprobado(p)
                                  }
                                  className="rounded-md px-3 py-2 text-sm font-medium ring-1 ring-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200"
                                  title="Cambiar estado"
                                >
                                  Aprobar
                                </button>
                              );
                            }

                            // (Opcional) si querés permitir desde rechazado volver a revisión o aprobar:
                            // if (p.comision_estado === 'rechazado') { ... }

                            return null;
                          })()}
                        </td>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Filas vacías para completar 20 */}
                {emptyRowsCount > 0 &&
                  Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-12">
                      <td
                        colSpan={17}
                        className="border border-gray-300 bg-gray-50"
                      />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-full flex flex-col items-center mt-4">
          <div className="flex gap-2 items-center select-none">
            <button
              className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
              onClick={() => handleChangePage(1)}
              disabled={safePage === 1}
              aria-label="Primera página"
            >
              ⏮
            </button>
            <button
              className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
              onClick={() => handleChangePage(safePage - 1)}
              disabled={safePage === 1}
              aria-label="Anterior"
            >
              ←
            </button>
            {/* Números de página, máximo 5 botones visibles */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) =>
                totalPages <= 5
                  ? true
                  : Math.abs(n - safePage) <= 2 || n === 1 || n === totalPages
              )
              .map((n, i, arr) => (
                <React.Fragment key={n}>
                  {/* ...puntitos entre saltos */}
                  {i > 0 && n - arr[i - 1] > 1 && (
                    <span className="px-1 text-gray-400">…</span>
                  )}
                  <button
                    className={`rounded-full px-3 py-1 font-bold border-2 ${
                      n === safePage
                        ? 'bg-[#fc4b08] text-white border-[#fc4b08] scale-110 shadow-lg'
                        : 'bg-white/90 text-[#fc4b08] border-[#fc4b08] hover:bg-[#fc4b08] hover:text-white'
                    } shadow-sm transition`}
                    onClick={() => handleChangePage(n)}
                  >
                    {n}
                  </button>
                </React.Fragment>
              ))}
            <button
              className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
              onClick={() => handleChangePage(safePage + 1)}
              disabled={safePage === totalPages}
              aria-label="Siguiente"
            >
              →
            </button>
            <button
              className={`rounded-full px-3 py-1 font-bold border-2 text-[#fc4b08] border-[#fc4b08] bg-white/80 hover:bg-[#fc4b08] hover:text-white shadow-sm transition disabled:opacity-30`}
              onClick={() => handleChangePage(totalPages)}
              disabled={safePage === totalPages}
              aria-label="Última página"
            >
              ⏭
            </button>
          </div>
          <span className="text-sm text-gray-500 mt-1">
            Página <span className="font-bold">{safePage}</span> de{' '}
            <span className="font-bold">{totalPages}</span> &bull; Mostrando{' '}
            <span className="font-bold">{visibleProspectos.length}</span> de{' '}
            <span className="font-bold">{sorted.length}</span> prospectos
          </span>
        </div>
      </div>
      <ClasePruebaModal
        isOpen={modalClaseOpen}
        onClose={() => {
          setModalClaseOpen(false);
          setTipoSeleccionado(null); // limpiar tipo al cerrar
        }}
        onSave={handleClasePruebaSave}
        numeroClase={claseSeleccionada?.num}
        prospecto={prospectos.find((p) => p.id === claseSeleccionada?.id)}
        tipoSeleccionado={tipoSeleccionado}
        horariosDisponiblesPilates={horariosDisponiblesPilates} //Horarios disponbiles obtenidos del backend
      />

      <Footer />

      <FormAltaVentas
        isOpen={modalNew}
        onClose={cerarModal}
        Rec={claseSeleccionada}
        setSelectedRecaptacion={setClaseSeleccionada}
        Sede={normalizeSede2(selectedSede)}
      />
      <StatsVentasModal
        open={showStats}
        onClose={() => setShowStats(false)}
        sede={selectedSede} // <-- acá le pasás la sede seleccionada (puede ser null para todas)
        normalizeSede2={normalizeSede2}
        mes={mes} // ✅ Nuevo
        anio={anio} // ✅ Nuevo
      />
      <AgendaDeHoyModal
        open={openAgenda}
        onClose={() => setOpenAgenda(false)}
        userId={userId}
        level={userLevel}
      />
      {showComisiones && (
        <ComisionesModal
          onClose={() => setShowComisiones(false)}
          userLevel={userLevel}
          userId={userId}
          onComisionStateChange={handleComisionStateChange} // <- NUEVO
          origen="ventas-prospectos"
        />
      )}
      <ComisionesVigentesModal
        open={openComi}
        onClose={() => setOpenComi(false)}
        userLevel={userLevel}
      />
    </>
  );
};;;

export default VentasProspectosGet;
