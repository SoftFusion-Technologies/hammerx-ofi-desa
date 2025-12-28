/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (IntegranteConveGet.jsx) es el componente el cual renderiza los datos de la creacion de convenios
 * Estos datos llegan cuando se completa el formulario de FormAltaConve
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from 'react';
import { useParams } from 'react-router-dom';
import { formatearFecha as formatearFechaHelper } from '../../../Helpers';
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaIntegranteConve from '../../../components/Forms/FormAltaIntegranteConve';
import IntegranteDetails from './IntegranteConveGetId';
import Copy from '../../../images/copy.png';
// import subirArch from '../../../images/subirArch.png'

import { useAuth } from '../../../AuthContext';
import ImagesUpload from './ImagesUpload.jsx';
import InvoicesUpload from './InvoicesUpload.jsx';
import FileUpload from './FileUpload.jsx';
import FechasConvenios from './Novedad/FechasConvenios.jsx';
import CongelarIntegrantes from './Integrantes/CongelarIntegrantes';
import IntegranteNotasModal from '../Components/IntegranteNotasModal.jsx';
import Swal from 'sweetalert2';
import {
  FaFilePdf,
  FaDownload,
  FaCheckCircle,
  FaPaperPlane
} from 'react-icons/fa';

const IntegranteConveGet = ({ integrantes }) => {
  // Estado para almacenar la lista de personas
  const { id_conv, id_adm } = useParams();
  const [integrante, setIntegrantes] = useState([]);
  const [modalNewIntegrante, setModalNewIntegrant] = useState(false);
  const [totalPrecioFinal, setTotalPrecioFinal] = useState(0);
  const { userLevel, userName } = useAuth();

  // Estado para tomar los nombres de los convenios
  const [convenioNombre, setConvenioNombre] = useState('');
  const [convenioDescripcion, setConvenioDescripcion] = useState('');
  const [convenioDescripcionUsu, setConvenioDescripcionUsu] = useState('');

  // Estado para tomar los valores de permiteFam de los convenios
  const [permiteFam, setpermiteFam] = useState(0);
  const [cantFam, setcantFam] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario

  // Estado para almacenar el mes seleccionado en `FechasConvenios`
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [permiteFec, setpermiteFec] = useState(0);

  // nueva variable para almacenar el valor de permiteFec cuando inicia el componente
  const newPermite = permiteFec;

  // nuevo req para congelar listados
  const [estado, setEstado] = useState(0);
  const [congelamientos, setCongelamientos] = useState([]);
  const [vencimiento, setVencimiento] = useState(null); // Almacena la fecha de vencimiento

  const [accionFinalizar, setAccionFinalizar] = useState(null); // registro de la acción del mes
  const [loadingFinalizar, setLoadingFinalizar] = useState(false);

  const abrirModal = () => {
    setModalNewIntegrant(true);
    setSelectedUser(null);
  };
  const cerarModal = () => {
    setModalNewIntegrant(false);
    // Mantengo el nombre/flujo original, pero ahora refresca por el endpoint nuevo (mes)
    obtenerIntegrantes2();
  };
  const obtenerNombreUsuario = (email) => {
    if (!email) return '';
    const s = String(email);
    const parts = s.split('@');
    return parts[0] || s;
  };

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState('');

  const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:8080';
  const URL = 'http://localhost:8080/integrantes/';
  const URL2 = `http://localhost:8080/admconvenios/${id_conv}/integrantes/`;
  // para recuperar los valores de precio INI
  const URL4 = 'http://localhost:8080/admconvenios/';
  const URL5 = 'http://localhost:8080/';

  const [precio, setPrecio] = useState('');
  const [descuento, setDescuento] = useState('');
  const [preciofinal, setPrecioFinal] = useState('');

  const [precio_concep, setPrecio_concep] = useState('');
  const [descuento_concep, setDescuento_concep] = useState('');
  const [preciofinal_concep, setPrecioFinal_concep] = useState('');

  const [modalNotasOpen, setModalNotasOpen] = useState(false);
  const [integranteNotas, setIntegranteNotas] = useState(null);
  const [notasCountMap, setNotasCountMap] = useState({});

  // Evita URLs gigantes si hay muchos integrantes
  const chunkArray = (arr, size = 180) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  const fetchNotasCounts = useCallback(
    async (ids = []) => {
      try {
        const cleanIds = Array.from(
          new Set(
            ids.map((x) => Number(x)).filter((n) => Number.isFinite(n) && n > 0)
          )
        );

        if (cleanIds.length === 0) {
          setNotasCountMap({});
          return;
        }

        // base con 0 para que siempre exista la key aunque el back no la devuelva
        const base = {};
        for (const id of cleanIds) base[id] = 0;

        const chunks = chunkArray(cleanIds, 180);
        let merged = { ...base };

        for (const part of chunks) {
          const { data } = await axios.get(
            `${API_URL}/integrantes-conve-notas/counts`,
            { params: { ids: part.join(',') } }
          );

          const map = data?.map || {};
          merged = { ...merged, ...map };
        }

        setNotasCountMap(merged);
      } catch (e) {
        console.error('Error fetchNotasCounts:', e?.message || e);
        // no rompas la UI; mantené lo que haya
        setNotasCountMap((prev) => prev || {});
      }
    },
    [API_URL]
  );

  // NUEVO: meta del backend (mes, congelado, openMonth, etc.)
  const [meta, setMeta] = useState(null);

  // NUEVO: cursor mensual (usamos el año/mes del cursor)
  const [monthCursor, setMonthCursor] = useState(() => new Date());

  const toMonthStart = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01 00:00:00`;
  };

  const monthStart = useMemo(() => toMonthStart(monthCursor), [monthCursor]);

  // Sincronización: como FechasConvenios hoy maneja solo mes (0-11),
  // mantenemos selectedMonth para no romper lo existente y lo acoplamos al cursor.
  useEffect(() => {
    // Mantiene el año actual del cursor y cambia solo el mes
    setMonthCursor((prev) => new Date(prev.getFullYear(), selectedMonth, 1));
  }, [selectedMonth]);

  useEffect(() => {
    const m = monthCursor.getMonth();
    if (m !== selectedMonth) setSelectedMonth(m);
  }, [monthCursor]);

  useEffect(() => {
    const loadConvenioAndAccion = async () => {
      const monthStart =
        toMonthStartMySQL(monthCursor) || toMonthStartMySQL(selectedMonth);

      if (!id_conv || !monthStart) return;

      try {
        const convResp = await fetch(`${API_URL}/admconvenios/${id_conv}`);
        if (convResp.ok) {
          const convJson = await convResp.json();
          const reg = convJson?.registro || convJson;
          setConvenioNombre(reg?.nameConve || `#${id_conv}`);
        } else {
          setConvenioNombre(`#${id_conv}`);
        }

        // 2) Chequear si ya existe acción FINALIZAR_CARGA del mes
        const qs = new URLSearchParams({
          convenio_id: String(id_conv),
          monthStart,
          tipo: 'FINALIZAR_CARGA',
          limit: '1',
          offset: '0'
        });

        const aResp = await fetch(
          `${API_URL}/convenios-mes-acciones?${qs.toString()}`
        );
        if (aResp.ok) {
          const aJson = await aResp.json();
          const reg = aJson?.registros?.[0] || null;
          setAccionFinalizar(reg);
        } else {
          setAccionFinalizar(null);
        }
      } catch {
        // No bloquees UX por esto
        setConvenioNombre((prev) => prev || `#${id_conv}`);
        setAccionFinalizar(null);
      }
    };

    loadConvenioAndAccion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id_conv, monthCursor, selectedMonth]);

  const [loadingMes, setLoadingMes] = useState(false);
  const [errorMes, setErrorMes] = useState(null);

  // NUEVO: única fuente “buena” de integrantes por mes
  const fetchIntegrantesMes = useCallback(async () => {
    setLoadingMes(true);
    setErrorMes(null);

    try {
      const convIdNum = Number(id_conv || 0);
      const { data } = await axios.get(`${API_URL}/integrantes`, {
        params: { id_conv: convIdNum, monthStart }
      });

      const rows = Array.isArray(data?.registros) ? data.registros : [];

      setIntegrantes(rows);
      setMeta(data?.meta || null);

      // PRECARGA COUNT (sin click)
      // Recomendación: no lo "await" para no alargar el loading general.
      fetchNotasCounts(rows.map((i) => i.id));

      console.log('META', data.meta);
      console.log('COUNT', rows.length);
    } catch (e) {
      console.error('Error fetchIntegrantesMes:', e);
      setIntegrantes([]);
      setMeta(null);
      setNotasCountMap({}); // importante: limpiar si falla
      setErrorMes(
        e?.response?.data?.mensajeError ||
          e?.message ||
          'Error al obtener integrantes del mes.'
      );
    } finally {
      setLoadingMes(false);
    }
  }, [API_URL, id_conv, monthStart, fetchNotasCounts]);

  const monthKey = (mysqlDt) => (mysqlDt ? String(mysqlDt).slice(0, 7) : null); // "YYYY-MM"

  const currentMonthKey = useMemo(() => monthKey(monthStart), [monthStart]);

  useEffect(() => {
    fetchIntegrantesMes();
  }, [fetchIntegrantesMes]);

  const openNotas = (integrante) => {
    setIntegranteNotas(integrante);
    setModalNotasOpen(true);
  };

  const closeNotas = () => {
    setModalNotasOpen(false);
    setIntegranteNotas(null);
  };

  useEffect(() => {
    obtenerDatosAdmConvenio(id_conv);
  }, [id_conv]);

  // ------------------------------------------------------------------
  // CONGELAR INTEGRANTES (se mantiene toda la lógica existente)
  // ------------------------------------------------------------------
  useEffect(() => {
    const ObtenerCongelamientos = async () => {
      try {
        const response = await axios.get(
          `${URL5}integrantes-congelados/${id_conv}?month=${selectedMonth + 1}`
        );
        setCongelamientos(response.data);
        setVencimiento(response.data[0]?.vencimiento);

        if (Array.isArray(response.data) && response.data.length > 0) {
          setEstado(response.data[0].estado);
          console.log('Estado actualizado integrante', response.data[0].estado);
        } else {
          setEstado(0);
          console.log('Estado actualizado integrante', 0);
        }
      } catch (error) {
        console.log('Error al obtener las personas:', error);
      }
    };

    ObtenerCongelamientos();
  }, [id_conv, selectedMonth, URL5]);

  const obtenerDatosAdmConvenio = async (id) => {
    try {
      // const response = await axios.get(URL3);
      const response = await axios.get(`${URL4}${id}/`);
      const data = response.data;

      if (data && data.precio && data.descuento && data.preciofinal) {
        setPrecio(data.precio);
        setDescuento(data.descuento);
        setPrecioFinal(data.preciofinal);

        setPrecio_concep(data.precio_concep);
        setDescuento_concep(data.descuento_concep);
        setPrecioFinal_concep(data.preciofinal_concep);
      } else {
        console.log('Datos del convenio incompletos o incorrectos:', data);
      }
    } catch (error) {
      console.error('Error al obtener datos del convenio:', error);
    }
  };

  // ------------------------------------------------------------------
  // LEGACY FETCH (se deja el código existente, pero deshabilitado)
  // Motivo: ahora usamos /integrantes + monthStart como fuente de verdad.
  // ------------------------------------------------------------------
  const ENABLE_LEGACY_INTEGRANTES_FETCH = false;

  // para recuperar los valores de precio FIN
  useEffect(() => {
    if (!ENABLE_LEGACY_INTEGRANTES_FETCH) return;

    axios.get(URL2).then((res) => {
      setIntegrantes(res.data);
      obtenerIntegrantes2();
    });

    const obtenerConvenio = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admconvenios/${id_conv}`
        );
        setConvenioNombre(response.data.nameConve);
        setConvenioDescripcion(response.data.descConve);
        setConvenioDescripcionUsu(response.data.desc_usu);
        setpermiteFam(response.data.permiteFam);
        setpermiteFec(response.data.permiteFec);
        setcantFam(response.data.cantFamiliares);
      } catch (error) {
        console.error('Error al obtener el convenio:', error);
      }
    };

    obtenerConvenio();
  }, [id_conv, URL2, ENABLE_LEGACY_INTEGRANTES_FETCH]);

  // Convenio: esto sí lo necesitamos siempre (no depende de integrantes)
  useEffect(() => {
    const obtenerConvenio = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admconvenios/${id_conv}`
        );
        setConvenioNombre(response.data.nameConve);
        setConvenioDescripcion(response.data.descConve);
        setConvenioDescripcionUsu(response.data.desc_usu);
        setpermiteFam(response.data.permiteFam);
        setpermiteFec(response.data.permiteFec);
        setcantFam(response.data.cantFamiliares);
      } catch (error) {
        console.error('Error al obtener el convenio:', error);
      }
    };

    obtenerConvenio();
  }, [id_conv]);

  // Función para obtener todos los personClass desde la API
  const obtenerIntegrantes2 = async () => {
    try {
      if (ENABLE_LEGACY_INTEGRANTES_FETCH) {
        const response = await axios.get(URL2);
        setIntegrantes(response.data);
      } else {
        await fetchIntegrantesMes();
      }
    } catch (error) {
      console.log('Error al obtener las personas :', error);
    }
  };

  // Función para obtener todos los personClass desde la API
  useEffect(() => {
    if (!ENABLE_LEGACY_INTEGRANTES_FETCH) return;

    const obtenerIntegrantes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admconvenios/${id_conv}/integrantes/`
        );
        // Actualizar datos del convenio después de agregar el integrante
        await obtenerDatosAdmConvenio(id_conv);

        setIntegrantes(response.data);
      } catch (error) {
        console.error('Error al obtener los integrantes:', error);
      }
    };

    obtenerIntegrantes();
  }, [id_conv, id_adm, ENABLE_LEGACY_INTEGRANTES_FETCH]);

  // ------------------------------------------------------------------
  // BLOQUEO / FREEZE: Prioridad a meta.isFrozen; fallback a lógica existente
  // ------------------------------------------------------------------

  const isMonthFrozen = () => {
    return congelamientos.some((c) => {
      return c.estado === 1 && monthKey(c.vencimiento) === currentMonthKey;
    });
  };
  const freeze = Boolean(
    meta?.isFrozen !== undefined
      ? meta.isFrozen
      : estado === 1 || isMonthFrozen(selectedMonth)
  );

  const disabledFileUpload = freeze; // antes: estado===1 || isMonthFrozen(selectedMonth)

  const handleEliminarIntegrante = async (id) => {
    const result = await Swal.fire({
      title: 'Eliminar integrante',
      text: '¿Seguro que desea eliminar? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: '#ef4444' // rojo (opcional)
    });

    if (!result.isConfirmed) return;

    try {
      const url = `${URL}${id}`;

      Swal.fire({
        title: 'Eliminando...',
        text: 'Por favor espere',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading()
      });

      const respuesta = await fetch(url, { method: 'DELETE' });

      let data = null;
      try {
        data = await respuesta.json();
      } catch (_) {
        // Por si no devuelve body
      }

      if (!respuesta.ok) {
        const msg =
          data?.mensajeError ||
          data?.message ||
          `No se pudo eliminar (HTTP ${respuesta.status}).`;
        throw new Error(msg);
      }

      // Actualizar estado local (optimista)
      setIntegrantes((prev) => prev.filter((i) => i.id !== id));

      await Swal.fire({
        title: 'Eliminado',
        text: data?.mensaje || 'El integrante fue eliminado correctamente.',
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });

      // Refresco “real” del mes para evitar desincronización
      await fetchIntegrantesMes();
    } catch (error) {
      console.log(error);
      await Swal.fire({
        title: 'Error',
        text: error?.message || 'Ocurrió un error al eliminar.',
        icon: 'error'
      });
    }
  };

  const obtenerIntegrante = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el integrante:', error);
    }
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (Array.isArray(integrante)) {
    const safeSearch = search ? search.toLowerCase() : '';

    results = integrante.filter((dato) => {
      const nombre = dato?.nombre ? String(dato.nombre).toLowerCase() : '';
      return nombre.includes(safeSearch);
    });
  }

  const ordenarIntegranteAlfabeticamente = (integrante) => {
    return [...integrante].sort((a, b) =>
      String(a?.nombre || '').localeCompare(String(b?.nombre || ''))
    );
  };

  const sortedintegrante = ordenarIntegranteAlfabeticamente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedintegrante.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedintegrante.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  // Fix: prev/next tenían condición incorrecta con firstIndex
  function prevPage(e) {
    if (e?.preventDefault) e.preventDefault();
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  }

  function changeCPage(id, e) {
    if (e?.preventDefault) e.preventDefault();
    setCurrentPage(id);
  }

  function nextPage(e) {
    if (e?.preventDefault) e.preventDefault();
    if (currentPage < nPage) setCurrentPage((p) => p + 1);
  }

  // Reset paginación cuando cambie mes o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [monthStart, search]);

  const formatearMoneda = (valor) => {
    const n = Number(valor);
    if (!Number.isFinite(n)) return '$0';
    return `$${n.toLocaleString('es-AR', { minimumFractionDigits: 0 })}`;
  };

  const handleEditarIntegrante = (integrante) => {
    // (NUEVO)
    setSelectedUser(integrante);
    setModalNewIntegrant(true);
  };

  const handleCopyClick = () => {
    const cbu = '2850156330094245972241';
    navigator.clipboard
      .writeText(cbu)
      .then(() => {
        alert('CBU copiado al portapapeles');
      })
      .catch((err) => {
        console.error('Error al copiar el CBU: ', err);
      });
  };

  // Evitar colisión con import formatearFecha
  const formatearFechaLocal = (fecha) => {
    try {
      const fechaObj = new Date(fecha);
      if (Number.isNaN(fechaObj.getTime())) return '—';
      const año = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
      const dia = String(fechaObj.getDate()).padStart(2, '0');
      const horas = String(fechaObj.getHours()).padStart(2, '0');
      const minutos = String(fechaObj.getMinutes()).padStart(2, '0');
      const segundos = String(fechaObj.getSeconds()).padStart(2, '0');
      return `${mes}/${año} ${horas}:${minutos}:${segundos}`;
    } catch {
      return '—';
    }
  };

  const formatearFechaVen = (v) => {
    if (!v) return 'Sin vencimiento';

    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return 'Sin vencimiento';

    // cubre casos "epoch" (0) o basura que termina en 1969/1970
    if (d.getTime() <= 0) return 'Sin vencimiento';

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(d);
  };

  const [showFileUpload, setShowFileUpload] = useState(false); // Estado para controlar la visibilidad

  // Manejar el cambio del radio button
  const handleRadioChange = (e) => {
    setShowFileUpload(e.target.value === 'yes'); // Muestra el componente si se selecciona "Sí"
  };

  const autorizarConvenio = async () => {
    const confirm = await Swal.fire({
      title: 'Autorizar masivo',
      text: 'Esto autoriza todos los integrantes del mes abierto (solo si el mes es editable).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, autorizar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Procesando...',
        text: 'Autorizando integrantes del mes abierto',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading()
      });

      const { data } = await axios.put(
        `${API_URL}/integrantes/autorizar-convenio/${id_conv}`
      );

      const rows = data?.meta?.rowsUpdated ?? null;

      if (rows === 0) {
        await Swal.fire({
          title: 'Sin cambios',
          text:
            data?.message ||
            'No se actualizó ningún integrante para el mes abierto.',
          icon: 'info'
        });
      } else {
        await Swal.fire({
          title: 'Listo',
          text:
            data?.message ||
            `Integrantes del convenio ${id_conv} autorizados con éxito`,
          icon: 'success',
          timer: 1800,
          showConfirmButton: false
        });
      }

      await fetchIntegrantesMes();
    } catch (error) {
      const msg =
        error?.response?.data?.mensajeError ||
        error?.response?.data?.error ||
        error?.message ||
        'Ocurrió un error al autorizar los integrantes';

      await Swal.fire({
        title: 'No se pudo autorizar',
        text: msg,
        icon: 'error'
      });
    }
  };

  // Acepta:
  // - Date
  // - "YYYY-MM-DD HH:mm:ss" (MySQL)
  // - ISO "2025-12-26T02:12:56.792Z"
  // - cualquier string parseable por Date
  const toDateSafe = (v) => {
    if (!v) return null;
    if (v instanceof Date) return v;

    const s = String(v).trim();

    // MySQL: "YYYY-MM-DD HH:mm:ss"
    const m = s.match(
      /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
    );
    if (m) {
      const [, Y, MO, D, H, MI, S] = m;
      const d = new Date(
        Number(Y),
        Number(MO) - 1,
        Number(D),
        Number(H),
        Number(MI),
        Number(S || 0)
      );
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const monthStartFromFechaCreacion = (fc) => {
    const d = toDateSafe(fc);
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
  };

  const isLockedByVencimiento = (integrante) => {
    if (!integrante?.convenio_plan_id) return false;

    const vto = toDateSafe(integrante?.fecha_vencimiento);
    if (!vto) return false; // si no hay vencimiento, no lock (según tu regla actual)

    const ms = monthStartFromFechaCreacion(integrante?.fechaCreacion);
    if (!ms) return false;

    // Locked mientras el mes visible sea anterior al vencimiento
    return ms < vto;
  };

  const handleCountChange = useCallback((integranteId, count) => {
    setNotasCountMap((prev) => ({ ...prev, [integranteId]: count }));
  }, []);

  const tableScrollRef = useRef(null);
  const dragXRef = useRef({
    down: false,
    startX: 0,
    startLeft: 0,
    moved: false
  });

  const [isDraggingX, setIsDraggingX] = useState(false);

  const DRAG_THRESHOLD = 10; // ajustá 8–14 si querés

  const isInteractiveTarget = (target) => {
    return !!target.closest(
      'button, a, input, textarea, select, option, [role="button"], [data-no-drag]'
    );
  };

  const onMouseDownTable = (e) => {
    if (!tableScrollRef.current) return;
    if (e.button !== 0) return; // solo click izquierdo
    if (isInteractiveTarget(e.target)) return; // no iniciar drag si tocás botones/inputs

    dragXRef.current.down = true;
    dragXRef.current.startX = e.clientX;
    dragXRef.current.startLeft = tableScrollRef.current.scrollLeft;
    dragXRef.current.moved = false;

    // No deshabilitamos selección todavía; recién si supera umbral
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragXRef.current.down) return;
      if (!tableScrollRef.current) return;

      const dx = e.clientX - dragXRef.current.startX;

      // Umbral: si no superó, no hacemos nada (deja funcionar el click)
      if (!dragXRef.current.moved) {
        if (Math.abs(dx) < DRAG_THRESHOLD) return;
        dragXRef.current.moved = true;
        setIsDraggingX(true);

        // Evita selección de texto cuando ya estás “arrastrando”
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
      }

      tableScrollRef.current.scrollLeft = dragXRef.current.startLeft - dx;
      e.preventDefault();
    };

    const onMouseUp = () => {
      if (!dragXRef.current.down) return;

      dragXRef.current.down = false;
      setIsDraggingX(false);

      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', onMouseMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const onClickCaptureTable = (e) => {
    // Si hubo drag real, cancelamos el click para que NO abra la modal
    if (dragXRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragXRef.current.moved = false;
    }
  };

  const normalize = (s) =>
    String(s ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // saca tildes
      .trim();

  const registrosFiltrados = useMemo(() => {
    const list = Array.isArray(integrante) ? integrante : [];

    const q = normalize(search);
    const monthFiltered = list.filter(
      (it) => monthKey(it.fechaCreacion) === currentMonthKey
    );

    if (!q) return monthFiltered;

    return monthFiltered.filter((it) => {
      const nombre = normalize(it?.nombre);
      const dni = normalize(it?.dni);
      const email = normalize(it?.email);
      const tel = normalize(it?.telefono);

      return (
        nombre.includes(q) ||
        dni.includes(q) ||
        email.includes(q) ||
        tel.includes(q)
      );
    });
  }, [integrante, currentMonthKey, search]);

  const fmtARDateTime = (v) => {
    const d = toDateSafe(v);
    if (!d) return '—';

    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
      // si querés segundos:
      // second: '2-digit'
    }).format(d);
  };

  const toMonthStartMySQL = (input) => {
    if (!input) return null;

    // 1) Si ya viene en formato correcto
    if (typeof input === 'string') {
      const s = input.trim();

      // ya ok
      if (/^\d{4}-\d{2}-01 00:00:00$/.test(s)) return s;

      // "YYYY-MM-..." -> forzar día 01
      const m1 = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m1) return `${m1[1]}-${m1[2]}-01 00:00:00`;

      // "Mon Dec 01 2025 ..." u otros parseables
      const dTry = new Date(s);
      if (!Number.isNaN(dTry.getTime())) {
        const y = dTry.getFullYear();
        const m = String(dTry.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}-01 00:00:00`;
      }

      return null;
    }

    // 2) Si viene Date
    if (input instanceof Date && !Number.isNaN(input.getTime())) {
      const y = input.getFullYear();
      const m = String(input.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}-01 00:00:00`;
    }

    return null;
  };

  const descargarListadoPDF = async () => {
    try {
      const monthStart =
        toMonthStartMySQL(monthCursor) || toMonthStartMySQL(selectedMonth);

      if (!monthStart) {
        await Swal.fire({
          icon: 'warning',
          title: 'Mes inválido',
          text: 'No se pudo interpretar el mes seleccionado.',
          confirmButtonColor: '#fc4b08'
        });
        return;
      }

      const url = `${API_URL}/integrantes-conve/descargar-pdf?id_conv=${encodeURIComponent(
        id_conv
      )}&monthStart=${encodeURIComponent(monthStart)}`;

      Swal.fire({
        title: 'Generando PDF…',
        text: 'Esto puede tardar unos segundos.',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const resp = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/pdf' }
      });

      if (!resp.ok) {
        let msg = `Error al generar el PDF (HTTP ${resp.status}).`;
        try {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await resp.json();
            if (j?.mensajeError) msg = j.mensajeError;
          } else {
            const t = await resp.text();
            if (t) msg = t.slice(0, 180);
          }
        } catch {}
        throw new Error(msg);
      }

      const blob = await resp.blob();

      const disposition = resp.headers.get('content-disposition') || '';
      const match = disposition.match(/filename="([^"]+)"/i);
      const filename =
        match?.[1] ||
        `Listado_Integrantes_Convenio_${id_conv}_${String(monthStart).slice(
          0,
          7
        )}.pdf`;

      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);

      await Swal.fire({
        icon: 'success',
        title: 'Descarga iniciada',
        text: 'El PDF se generó correctamente.',
        confirmButtonColor: '#fc4b08'
      });
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo generar el PDF',
        text: e?.message || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#fc4b08'
      });
    }
  };

  const monthLabelES = (monthStart) => {
    // monthStart: "YYYY-MM-01 00:00:00"
    if (!monthStart) return '—';
    const [ym] = String(monthStart).split(' ');
    const [y, m] = ym.split('-').map(Number);
    const monthNames = [
      'ENERO',
      'FEBRERO',
      'MARZO',
      'ABRIL',
      'MAYO',
      'JUNIO',
      'JULIO',
      'AGOSTO',
      'SEPTIEMBRE',
      'OCTUBRE',
      'NOVIEMBRE',
      'DICIEMBRE'
    ];
    if (!y || !m) return String(monthStart);
    return `${monthNames[m - 1]} ${y}`;
  };

  const finaliceListado = async () => {
    try {
      const monthStart =
        toMonthStartMySQL(monthCursor) || toMonthStartMySQL(selectedMonth);

      if (!monthStart) {
        await Swal.fire({
          icon: 'warning',
          title: 'Mes inválido',
          text: 'Seleccioná un mes válido para finalizar el listado.',
          confirmButtonColor: '#16a34a'
        });
        return;
      }

      // Si ya existe, no permitir “doble click” (UX)
      if (accionFinalizar) {
        await Swal.fire({
          icon: 'info',
          title: 'Ya finalizado',
          html: `
          <div style="text-align:left">
            Este mes ya fue marcado como finalizado.<br/>
            <div style="margin-top:8px; font-size:12px; opacity:.8">
              ${accionFinalizar?.descripcion || ''}
            </div>
          </div>
        `,
          confirmButtonColor: '#16a34a'
        });
        return;
      }

      const mesLabel = monthLabelES(monthStart);
      const ahora = new Date();

      const nombre = convenioNombre?.trim() || `Convenio #${id_conv}`;

      const descripcion = `El convenio "${nombre}" finalizó la carga de integrantes del mes de ${mesLabel} el ${fmtARDateTime(
        ahora
      )} hs.`;

      const result = await Swal.fire({
        icon: 'question',
        title: 'Confirmar finalización',
        html: `
        <div style="text-align:left">
          Se registrará un aviso para <b>HammerX</b>.<br/>
          <div style="margin-top:10px; font-size:13px;">
            ${descripcion}
          </div>
        </div>
      `,
        showCancelButton: true,
        confirmButtonText: 'Sí, finalicé',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#16a34a'
      });

      if (!result.isConfirmed) return;

      setLoadingFinalizar(true);

      const payload = {
        convenio_id: Number(id_conv),
        monthStart,
        // tipo lo fuerza el endpoint /finalizar, pero podés mandarlo igual sin problema
        descripcion,
        // meta opcional
        meta_json: {
          convenio_nombre: nombre,
          mes_label: mesLabel,
          confirmado_en: ahora.toISOString()
        }
      };

      const resp = await fetch(`${API_URL}/convenios-mes-acciones/finalizar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        let msg = `Error al finalizar (HTTP ${resp.status}).`;
        try {
          const j = await resp.json();
          if (j?.mensajeError) msg = j.mensajeError;
        } catch {}
        throw new Error(msg);
      }

      const data = await resp.json();
      const registro = data?.registro || null;

      setAccionFinalizar(registro);

      await Swal.fire({
        icon: 'success',
        title: 'Finalización registrada',
        text: 'Se registró el aviso para HammerX.',
        confirmButtonColor: '#16a34a'
      });
    } catch (e) {
      await Swal.fire({
        icon: 'error',
        title: 'No se pudo finalizar',
        text: e?.message || 'Ocurrió un error inesperado.',
        confirmButtonColor: '#16a34a'
      });
    } finally {
      setLoadingFinalizar(false);
    }
  };

  // Total de preciofinal: ahora se calcula sobre el mes ya filtrado por backend
  useEffect(() => {
    const total = (integrante || []).reduce((acc, it) => {
      if (!it) return acc;

      const cobrar = Number(it?.cobrar_este_mes ?? 1) === 1;
      if (!cobrar) return acc;

      return acc + Number(it?.preciofinal || 0);
    }, 0);

    setTotalPrecioFinal(total);
  }, [integrante]);
  return (
    <>
      <NavbarStaff />

      <div className="dashboardbg min-h-screen">
        {/* Halos / glow de fondo (sutil) */}
        <div className="pointer-events-none fixed inset-0 opacity-60">
          <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[90px]" />
          <div className="absolute -bottom-28 right-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[100px]" />
          <div className="absolute -bottom-40 left-[-120px] h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-[110px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-10">
          {/* HEADER / HERO */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_22px_70px_rgba(0,0,0,0.42)] overflow-hidden">
            <div className="px-5 sm:px-7 py-6 sm:py-7">
              <div className="flex flex-col gap-5">
                {/* Top row: volver + título + chips */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Link
                      to="/dashboard/admconvenios"
                      className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 text-white/85 hover:text-white transition"
                    >
                      <span className="text-sm font-semibold">Volver</span>
                    </Link>

                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="font-bignoodle text-xl sm:text-3xl font-extrabold tracking-tight text-orange-600">
                          {convenioNombre}
                        </h2>

                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/20 backdrop-blur">
                          Convenio
                        </span>

                        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-white/80 ring-1 ring-white/10 backdrop-blur">
                          Cant. Integrantes:{' '}
                          <span className="text-white font-semibold">
                            {results.length}
                          </span>
                        </span>

                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 backdrop-blur ${
                            freeze
                              ? 'bg-slate-500/15 text-slate-200 ring-slate-400/20'
                              : 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20'
                          }`}
                        >
                          {freeze
                            ? 'Mes / listado congelado'
                            : 'Edición habilitada'}
                        </span>

                        {/* Chip de mes actual según backend (si viene) */}
                        {meta?.monthStart && (
                          <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-white/10 text-white/80 ring-1 ring-white/10 backdrop-blur">
                            Mes:{' '}
                            <span className="text-white font-semibold">
                              {fmtARDateTime(meta.monthStart)}
                            </span>
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-white/55 max-w-2xl">
                        Gestión de integrantes, importaciones y control de
                        autorización.
                      </p>
                    </div>
                  </div>

                  {/* CTA Nuevo Integrante */}
                  {(userLevel === 'gerente' ||
                    userLevel === 'admin' ||
                    userLevel === 'vendedor' ||
                    userLevel === '' ||
                    userLevel === 'administrador') && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={freeze ? undefined : abrirModal}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-extrabold shadow-[0_18px_45px_rgba(0,0,0,0.25)] transition ${
                          freeze
                            ? 'bg-white/10 text-white/40 ring-1 ring-white/10 cursor-not-allowed'
                            : 'bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950'
                        }`}
                        disabled={freeze}
                      >
                        Nuevo Integrante
                      </button>
                    </div>
                  )}
                </div>

                {/* Mensaje de error / loading (mes) */}
                {loadingMes && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4 text-white/80">
                    Cargando integrantes del mes...
                  </div>
                )}
                {errorMes && (
                  <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 backdrop-blur-xl p-4 text-rose-100">
                    {errorMes}
                  </div>
                )}

                {/* Descripciones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {(userLevel === 'admin' ||
                    userLevel === '' ||
                    userLevel === 'administrador') && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                        Descripción Convenio
                      </div>
                      <div className="mt-2 text-sm text-white/85 prose prose-invert max-w-none">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: convenioDescripcion
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {(userLevel === 'admin' ||
                    userLevel === 'gerente' ||
                    userLevel === 'vendedor' ||
                    userLevel === 'administrador') && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                        Descripción Usuario
                      </div>
                      <div className="mt-2 text-sm text-white/85 prose prose-invert max-w-none">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: convenioDescripcionUsu
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Control bar: búsqueda + extras */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-3 sm:gap-4 items-center">
                  <form className="relative">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="text"
                      placeholder="Buscar integrante por nombre…"
                      className="w-full rounded-2xl pl-4 pr-4 py-3 bg-white/5 text-white placeholder:text-white/35 ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none transition"
                    />
                  </form>

                  {/* Admin actions row */}
                  {(userLevel === 'admin' || userLevel === 'administrador') && (
                    <div className="flex flex-wrap items-center gap-3 justify-start lg:justify-end">
                      <button
                        onClick={freeze ? undefined : autorizarConvenio}
                        disabled={freeze}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold transition shadow-[0_18px_45px_rgba(16,185,129,0.22)] ${
                          freeze
                            ? 'bg-white/10 text-white/40 ring-1 ring-white/10 cursor-not-allowed'
                            : 'bg-emerald-500/90 hover:bg-emerald-500 text-emerald-950'
                        }`}
                      >
                        Autorizar Masivo
                      </button>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-2">
                        <CongelarIntegrantes
                          id_conv={id_conv}
                          selectedMonth={selectedMonth}
                          monthStart={monthStart}
                          meta={meta}
                          onChanged={fetchIntegrantesMes}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Importar Excel */}
                {(userLevel === 'admin' ||
                  userLevel === '' ||
                  userLevel === 'gerente' ||
                  userLevel === 'administrador') && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                          Importación
                        </div>
                        <div className="mt-1 text-sm text-white/80 font-semibold">
                          Importar Clientes Excel
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 text-sm text-white/80">
                          <input
                            type="radio"
                            value="yes"
                            checked={showFileUpload}
                            onChange={handleRadioChange}
                            disabled={disabledFileUpload}
                            className="h-4 w-4 accent-orange-500"
                          />
                          Sí
                        </label>
                        <label className="inline-flex items-center gap-2 text-sm text-white/80">
                          <input
                            type="radio"
                            value="no"
                            checked={!showFileUpload}
                            onChange={handleRadioChange}
                            disabled={disabledFileUpload}
                            className="h-4 w-4 accent-orange-500"
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {(userLevel === 'admin' ||
                      userLevel === '' ||
                      userLevel === 'administrador') &&
                      showFileUpload && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
                          <FileUpload
                            convenioId={id_conv}
                            monthStart={monthStart}
                            onSuccess={() => fetchIntegrantesMes()}
                          />
                        </div>
                      )}
                  </div>
                )}

                {/* Reportes + Finalización */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-white/50">
                        Reportes y cierre
                      </div>
                      <div className="mt-1 text-sm text-white/80 font-semibold">
                        Descargar PDF y finalizar carga
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        Descargá el listado mensual y luego avisá a HammerX que
                        finalizaste la carga del mes.
                      </div>
                    </div>

                    <div className="w-full md:w-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {/* Descargar */}
                      <button
                        type="button"
                        onClick={descargarListadoPDF}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
          bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold
          shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30
          border border-orange-400/30 active:scale-[0.99] transition"
                      >
                        <FaFilePdf className="opacity-95" />
                        <span>Descargar listado</span>
                        <FaDownload className="opacity-80" />
                      </button>

                      {/* Finalicé listado */}
                      <button
                        type="button"
                        onClick={finaliceListado}
                        disabled={loadingFinalizar || !!accionFinalizar}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5
    font-semibold border transition active:scale-[0.99]
    ${
      loadingFinalizar || !!accionFinalizar
        ? 'bg-emerald-500/20 text-white/60 border-emerald-400/15 cursor-not-allowed'
        : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white border-emerald-400/30 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30'
    }`}
                      >
                        <FaCheckCircle className="opacity-95" />
                        <span>
                          {accionFinalizar
                            ? 'Finalizado'
                            : loadingFinalizar
                            ? 'Finalizando…'
                            : 'Finalicé listado'}
                        </span>
                        <FaPaperPlane className="opacity-80" />
                      </button>
                    </div>
                  </div>
                  {accionFinalizar?.descripcion && (
                    <div className="mt-3 rounded-xl border border-emerald-400/15 bg-emerald-500/[0.07] p-3">
                      <div className="text-xs uppercase tracking-[0.18em] text-emerald-200/70">
                        Estado del mes
                      </div>
                      <div className="mt-1 text-sm text-white/85 font-semibold">
                        Carga finalizada
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {accionFinalizar.descripcion}
                      </div>
                    </div>
                  )}
                </div>

                {/* R8 Fechas */}
                {permiteFec == 1 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-4">
                    <FechasConvenios
                      onMonthChange={setSelectedMonth}
                      onDateChange={(d) => setMonthCursor(d)} // esto te deja monthStart perfecto
                      initialDate={monthCursor}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-7">
            {Object.keys(results).length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.35)]">
                <h3 className="text-lg font-extrabold text-white">
                  Sin resultados
                </h3>
                <p className="mt-2 text-sm text-white/55">
                  El Integrante NO Existe ||{' '}
                  <span className="text-white/80 font-semibold">
                    Integrantes: {results.length}
                  </span>
                </p>
              </div>
            ) : (
              <>
                {/* TABLE WRAPPER */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.35)] overflow-hidden">
                  <div className="px-5 sm:px-7 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="font-bignoodle text-2xl text-white/80 font-extrabold">
                      Listado de Integrantes
                    </div>
                    <div className="text-xs text-white/55">
                      Cantidad de registros:{' '}
                      <span className="text-white font-semibold">
                        {results.length}
                      </span>
                    </div>
                  </div>

                  <div
                    ref={tableScrollRef}
                    onMouseDown={onMouseDownTable}
                    onClickCapture={onClickCaptureTable}
                    className={`overflow-x-auto ${
                      isDraggingX
                        ? 'cursor-grabbing select-none'
                        : 'cursor-grab'
                    }`}
                    style={{ touchAction: 'pan-x pan-y' }} // en mobile sigue el scroll nativo
                  >
                    <table className="min-w-[1400px] w-full bg-transparent table-auto border-collapse">
                      <thead className="bg-[#fc4b08] text-white sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Nombre y Apellido
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            DNI
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Telefono
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Sede
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Plan
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Precio
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Descuento
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Precio Final
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Usuario
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Fec. Creación
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Fec. Ven
                          </th>
                          <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                            Estado de Autorización
                          </th>
                          {(userLevel === 'admin' ||
                            userLevel === '' ||
                            userLevel === 'gerente' ||
                            userLevel === 'administrador') && (
                            <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.16em] whitespace-nowrap">
                              Acciones
                            </th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="bg-transparent divide-y divide-white/10">
                        {registrosFiltrados.map((integrante) => {
                          const locked = isLockedByVencimiento(integrante);

                          const trClassName = `${freeze ? 'tr-gris' : ''}`;

                          const notasCount = Number(
                            notasCountMap[integrante.id] ?? 0
                          );
                          const hasNotas = notasCount > 0;

                          const canBase =
                            (userLevel === 'admin' ||
                              userLevel === 'gerente' ||
                              userLevel === '' ||
                              userLevel === 'administrador') &&
                            !freeze;

                          const canDelete = canBase && !locked;
                          const canEdit = canBase;
                          return (
                            <tr
                              key={integrante.id}
                              data-locked={locked ? 'true' : 'false'}
                              className={`group ${trClassName} !bg-transparent hover:!bg-white/[0.04] transition`}
                            >
                              {/* Nombre */}
                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
             transition group-data-[locked=true]:opacity-45"
                              >
                                <span className="inline-flex items-center gap-2 min-w-0">
                                  {hasNotas && (
                                    <span className="relative inline-flex items-center justify-center w-4 h-4">
                                      {/* DOT */}
                                      {/* <span className="mt-2 h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_4px_rgba(252,75,8,0.12)]" /> */}

                                      {/* COUNT encima del dot */}
                                      <span
                                        className="absolute  left-1/2 -translate-x-1/2
                     min-w-[18px] h-[18px] px-1
                     rounded-full bg-orange-500/25 ring-1 ring-orange-400/30
                     text-[10px] font-extrabold text-orange-100
                     flex items-center justify-center"
                                      >
                                        {notasCount}
                                      </span>

                                      {/* Label opcional arriba (muy chico). Si no lo querés, eliminá este span */}
                                      <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.18em] text-white/45">
                                        Notas
                                      </span>
                                    </span>
                                  )}

                                  <span className="truncate max-w-[260px]">
                                    {integrante.nombre}
                                  </span>
                                </span>
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {integrante.dni}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {integrante.telefono}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {integrante.email}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {integrante.sede}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {integrante?.plan?.nombre_plan ||
                                  (integrante.convenio_plan_id
                                    ? `#${integrante.convenio_plan_id}`
                                    : '—')}
                              </td>

                              {/* Precios (roles) */}
                              {(userLevel === 'admin' ||
                                userLevel === '' ||
                                userLevel === 'gerente' ||
                                userLevel === 'administrador') && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                                >
                                  {integrante.precio !== '0'
                                    ? formatearMoneda(integrante.precio)
                                    : 'Sin Precio'}
                                </td>
                              )}

                              {(userLevel === 'admin' ||
                                userLevel === '' ||
                                userLevel === 'gerente' ||
                                userLevel === 'administrador') && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                                >
                                  {integrante.descuento !== '0'
                                    ? `${integrante.descuento}%`
                                    : 'Sin descuento'}
                                </td>
                              )}

                              {(userLevel === 'admin' ||
                                userLevel === '' ||
                                userLevel === 'gerente' ||
                                userLevel === 'administrador') && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                                >
                                  {integrante.preciofinal !== '0'
                                    ? formatearMoneda(integrante.preciofinal)
                                    : 'Sin Precio Final'}
                                </td>
                              )}

                              {/* Ocultamos campos precios para usuarios de tipo vendedor - inicio */}
                              {userLevel === 'vendedor' && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/55 whitespace-nowrap cursor-pointer"
                                >
                                  Oculto
                                </td>
                              )}
                              {userLevel === 'vendedor' && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/55 whitespace-nowrap cursor-pointer"
                                >
                                  Oculto
                                </td>
                              )}
                              {userLevel === 'vendedor' && (
                                <td
                                  onClick={() =>
                                    obtenerIntegrante(integrante.id)
                                  }
                                  className="px-4 py-3 !bg-transparent !text-white/55 whitespace-nowrap cursor-pointer"
                                >
                                  Oculto
                                </td>
                              )}
                              {/* Ocultamos campos precios para usuarios de tipo vendedor - Fin */}

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {obtenerNombreUsuario(
                                  integrante.userName || integrante.email || ''
                                )}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {formatearFechaLocal(integrante.fechaCreacion)}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className="px-4 py-3 !bg-transparent !text-white/90 font-semibold whitespace-nowrap cursor-pointer
                 transition group-data-[locked=true]:opacity-45"
                              >
                                {formatearFechaVen(
                                  integrante.fecha_vencimiento
                                )}
                              </td>

                              <td
                                onClick={() => obtenerIntegrante(integrante.id)}
                                className={`px-4 py-3 !bg-transparent font-extrabold whitespace-nowrap cursor-pointer ${
                                  integrante.estado_autorizacion ===
                                  'sin_autorizacion'
                                    ? '!text-rose-400'
                                    : integrante.estado_autorizacion ===
                                      'pendiente'
                                    ? '!text-amber-300'
                                    : '!text-emerald-300'
                                }`}
                              >
                                {integrante.estado_autorizacion ===
                                'sin_autorizacion'
                                  ? 'Sin Autorización'
                                  : integrante.estado_autorizacion ===
                                    'pendiente'
                                  ? 'Pendiente'
                                  : 'Autorizado'}
                              </td>

                              {/* ACCIONES */}
                              {(userLevel === 'admin' ||
                                userLevel === '' ||
                                userLevel === 'gerente' ||
                                userLevel === 'administrador') && (
                                <td className="px-4 py-3 !bg-transparent whitespace-nowrap">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openNotas(integrante);
                                      }}
                                      type="button"
                                      className="px-4 py-2 rounded-xl !text-white bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 transition inline-flex items-center gap-2"
                                    >
                                      Notas
                                      <span className="ml-1 inline-flex items-center justify-center min-w-[22px] h-[22px] px-2 rounded-full bg-orange-500/20 text-xs text-white">
                                        {notasCount}
                                      </span>
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canDelete) return;
                                        handleEliminarIntegrante(integrante.id);
                                      }}
                                      disabled={!canDelete}
                                      className={`px-4 py-2 rounded-xl transition text-white ${
                                        !canDelete
                                          ? 'btn-gris'
                                          : 'bg-rose-500 hover:bg-rose-600'
                                      }`}
                                    >
                                      Eliminar
                                    </button>

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (!canEdit) return;
                                        handleEditarIntegrante(integrante);
                                      }}
                                      disabled={!canEdit}
                                      className={`px-4 py-2 rounded-xl transition ${
                                        !canEdit
                                          ? 'btn-gris text-white'
                                          : 'bg-amber-400 hover:bg-amber-500 text-black'
                                      }`}
                                    >
                                      Editar
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* PAGINACIÓN */}
                <nav className="flex justify-center items-center my-10">
                  <ul className="pagination flex flex-wrap gap-2">
                    <li className="page-item">
                      <a
                        href="#"
                        className="page-link px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 text-white/80 hover:text-white transition"
                        onClick={prevPage}
                      >
                        Prev
                      </a>
                    </li>

                    {numbers.map((number, index) => (
                      <li
                        className={`page-item ${
                          currentPage === number ? 'active' : ''
                        }`}
                        key={index}
                      >
                        <a
                          href="#"
                          className={`page-link px-4 py-2 rounded-xl ring-1 transition ${
                            currentPage === number
                              ? 'bg-orange-500/25 ring-orange-400/30 text-white'
                              : 'bg-white/5 hover:bg-white/10 ring-white/10 hover:ring-white/20 text-white/80 hover:text-white'
                          }`}
                          onClick={(e) => changeCPage(number, e)}
                        >
                          {number}
                        </a>
                      </li>
                    ))}

                    <li className="page-item">
                      <a
                        href="#"
                        className="page-link px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20 text-white/80 hover:text-white transition"
                        onClick={nextPage}
                      >
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>

                {/* CBU + TOTAL */}
                {(userLevel === 'admin' ||
                  userLevel === '' ||
                  userLevel === 'gerente' ||
                  userLevel === 'administrador') && (
                  <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.35)] p-5 sm:p-6">
                    <div className="text-center">
                      <div className="text-xs uppercase tracking-[0.18em] text-white/45">
                        Transferencias
                      </div>

                      {/* CBU Box */}
                      <div className="mt-3 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <p className="text-xs sm:text-sm text-white/75 font-semibold">
                            REALIZÁ TUS TRANSFERENCIAS AL SIGUIENTE CBU:
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm sm:text-base font-extrabold text-white font-mono break-all">
                              2850156330094245972241
                            </span>

                            <button
                              type="button"
                              onClick={handleCopyClick}
                              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-white/85 transition hover:bg-white/[0.06] active:scale-[0.99]"
                              aria-label="Copiar CBU"
                              title="Copiar CBU"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>

                        <p className="mt-3 text-white/65 text-sm sm:text-lg font-semibold">
                          Titular:{' '}
                          <span className="text-white/85 font-extrabold">
                            HAMMERX SAS
                          </span>
                        </p>
                      </div>

                      {/* Total */}
                      <div className="mt-6 text-xs uppercase tracking-[0.18em] text-white/45">
                        Total
                      </div>
                      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-white">
                        {formatearMoneda(totalPrecioFinal)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Uploads */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.35)] p-4">
                    {(userLevel === '' || userLevel === 'admin') && (
                      <ImagesUpload
                        convenioId={id_conv}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        monthCursor={monthCursor} // recomendado
                        // monthStart={monthStart}     // opcional, si preferís string
                      />
                    )}
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,0.35)] p-4">
                    {(userLevel === '' || userLevel === 'admin') && (
                      <InvoicesUpload
                        convenioId={id_conv}
                        selectedMonth={selectedMonth}
                        setSelectedMonth={setSelectedMonth}
                        monthCursor={monthCursor}
                      />
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Modales */}
            <FormAltaIntegranteConve
              isOpen={modalNewIntegrante}
              onClose={cerarModal}
              precio={precio}
              descuento={descuento}
              preciofinal={preciofinal}
              integrante={selectedUser}
              setSelectedUser={setSelectedUser}
              precio_concep={precio_concep}
              descuento_concep={descuento_concep}
              preciofinal_concep={preciofinal_concep}
              monthStart={monthCursor}
              permiteFec={permiteFec}
            />
          </div>
        </div>

        {selectedUser && (
          <IntegranteDetails
            user={selectedUser}
            isOpen={modalUserDetails}
            onClose={() => setModalUserDetails(false)}
            obtenerIntegrantes2={obtenerIntegrantes2}
            permiteFam={permiteFam}
            id_conv={id_conv}
            cantFam={cantFam}
            // antes pasabas formatearFecha (colisionaba). ahora pasamos la local
            formatearFecha={formatearFechaLocal}
          />
        )}

        <IntegranteNotasModal
          isOpen={modalNotasOpen}
          onClose={closeNotas}
          integrante={integranteNotas}
          apiUrl={API_URL}
          autorNombre={obtenerNombreUsuario(userName) || userName}
          canModerate={
            userLevel === 'admin' ||
            userLevel === 'gerente' ||
            userLevel === 'administrador'
          }
          onCountChange={handleCountChange}
        />

        <Footer />
      </div>
    </>
  );
};

export default IntegranteConveGet;
