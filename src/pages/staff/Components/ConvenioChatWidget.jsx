import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaUserEdit,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaBan,
  FaCheck
} from 'react-icons/fa';
import Swal from 'sweetalert2';
import { createPortal } from 'react-dom';

const isEmpty = (v) => v === null || v === undefined || String(v).trim() === '';

function normalizeMonthStart(input) {
  if (!input && input !== 0) return null;

  const s = String(input).trim();
  if (/^\d{4}-\d{2}-01 00:00:00$/.test(s)) return s;

  if (input instanceof Date && !Number.isNaN(input.getTime())) {
    const y = input.getFullYear();
    const m = String(input.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01 00:00:00`;
  }

  const n = Number(input);
  if (Number.isFinite(n) && n >= 0 && n <= 11) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(n + 1).padStart(2, '0');
    return `${y}-${m}-01 00:00:00`;
  }

  return null;
}

function fmtMes(v) {
  const s = String(v || '');
  const m = s.match(/^(\d{4})-(\d{2})-01/);
  if (!m) return '—';
  return `${m[2]}/${m[1]}`;
}

function makeTempId() {
  return `tmp_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const safeJson = (s) => {
  try {
    if (!s) return null;
    if (typeof s === 'object') return s;
    return JSON.parse(String(s));
  } catch {
    return null;
  }
};

const isDeletedMsg = (m) => {
  return (
    m?.is_deleted === 1 ||
    m?.deleted === 1 ||
    !!m?.deleted_at ||
    !!m?.deletedAt ||
    String(m?.estado || '').toUpperCase() === 'ELIMINADO'
  );
};

const isReadByMe = (m) => {
  // tolerante a distintos nombres que pueda devolver el backend
  if (m?.read_by_me === true) return true;
  if (m?.is_read === true) return true;
  if (m?.leido === 1) return true;
  if (!!m?.read_at) return true;
  if (!!m?.readAt) return true;
  if (!!m?.read_at_me) return true;
  if (!!m?.readAtMe) return true;
  return false;
};

export default function ConvenioChatWidget({
  convenioId,
  monthStart,
  apiBaseUrl,
  authToken,
  userLevel,
  userName,
  userId,
  convenioNombre
}) {
  const API =
    apiBaseUrl || import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const monthStartNorm = useMemo(
    () => normalizeMonthStart(monthStart),
    [monthStart]
  );

  const isGymSide = useMemo(() => !isEmpty(userLevel), [userLevel]);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [thread, setThread] = useState(null);

  const [needsConvenioName, setNeedsConvenioName] = useState(false);
  const [convenioNombreContacto, setConvenioNombreContacto] = useState('');

  const [mensajes, setMensajes] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // badge
  const [unreadCount, setUnreadCount] = useState(0);

  // CRUD UI
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const listRef = useRef(null);

  const http = useMemo(() => {
    const inst = axios.create({ baseURL: API });
    if (authToken) {
      inst.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    }
    return inst;
  }, [API, authToken]);

  const scrollToBottom = (smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  const localTitle = useMemo(() => {
    const base = convenioNombre
      ? String(convenioNombre)
      : `Convenio #${convenioId}`;
    return `Chat · ${base}`;
  }, [convenioNombre, convenioId]);

  const computeUnreadFromMsgs = useCallback(
    (msgs) => {
      if (!isGymSide) return 0; // badge relevante en el lado gimnasio (staff)
      const arr = Array.isArray(msgs) ? msgs : [];
      return arr.filter((m) => {
        if (isDeletedMsg(m)) return false;
        // No leído = viene del Convenio y no está leído por mí
        return m?.sender_tipo === 'CONVENIO' && !isReadByMe(m);
      }).length;
    },
    [isGymSide]
  );

  const markUnreadMessagesRead = useCallback(
    async (msgs) => {
      if (!isGymSide) return;
      if (!userId) return;

      const unread = (Array.isArray(msgs) ? msgs : []).filter((m) => {
        if (isDeletedMsg(m)) return false;
        return (
          m?.sender_tipo === 'CONVENIO' && !isReadByMe(m) && Number(m?.id) > 0
        );
      });

      if (!unread.length) return;

      // idempotente: si ya existe, el backend debería ignorar/actualizar sin romper
      await Promise.allSettled(
        unread.map((m) =>
          http.post(`/convenio-chat/messages/${m.id}/read`, {
            reader_user_id: userId,
            reader_user_name: userName ?? null,
            user_id: userId,
            user_name: userName ?? null
          })
        )
      );
    },
    [http, isGymSide, userId, userName]
  );

  const fetchThreadAndMessages = useCallback(
    async ({ markRead } = { markRead: true }) => {
      if (!convenioId || !monthStartNorm) return;

      setLoading(true);
      setLoadingMsgs(true);

      try {
        // 1) Thread
        const { data } = await http.get('/convenio-chat/thread', {
          params: { convenio_id: convenioId }
        });

        const th = data?.thread || null;
        setThread(th);

        const needs = !!data?.needs_convenio_name;
        setNeedsConvenioName(needs);

        const savedName = th?.convenio_nombre_contacto || '';
        setConvenioNombreContacto(savedName);

        // Si por algún motivo no vino thread, evitamos romper
        if (!th?.id) {
          setMensajes([]);
          setUnreadCount(0);
          return;
        }

        // 2) Mensajes
        const msgsRes = await http.get('/convenio-chat/messages', {
          params: {
            thread_id: th.id,
            monthStart: monthStartNorm,
            limit: 200,
            offset: 0,
            viewer_user_id: isGymSide ? userId ?? null : null
          }
        });

        const msgs = msgsRes?.data?.mensajes || [];
        const unread = Number(msgsRes?.data?.meta?.unread || 0);

        setMensajes(msgs);
        setUnreadCount(unread);

        // 3) Marcar leído (solo gimnasio) — acción mensual + reads por mensaje
        if (isGymSide && markRead) {
          await http.post('/convenio-chat/acciones/marcar-leido', {
            convenio_id: convenioId,
            monthStart: monthStartNorm,
            user_id: userId ?? null,
            user_name: userName ?? null
          });

          // marca en convenio_chat_message_reads los mensajes no leídos
          await markUnreadMessagesRead(msgs);

          // optimista: badge a 0
          setUnreadCount(0);
        }

        // 4) Scroll
        setTimeout(() => scrollToBottom(false), 0);
      } catch (e) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo abrir el chat',
          text: e?.response?.data?.mensajeError || e.message
        });
      } finally {
        setLoading(false);
        setLoadingMsgs(false);
      }
    },
    [
      convenioId,
      monthStartNorm,
      http,
      isGymSide,
      userId,
      userName,
      markUnreadMessagesRead
    ]
  );

  // Badge refresh: al montar + cuando haya cambios globales (ej: inbox / acciones)
  const refreshUnreadBadge = useCallback(async () => {
    if (!convenioId || !monthStartNorm) return;
    try {
      // Importante: NO marcamos leído acá (solo para badge)
      await fetchThreadAndMessages({ markRead: false });
    } catch {
      // silencioso
    }
  }, [convenioId, monthStartNorm, fetchThreadAndMessages]);

  useEffect(() => {
    refreshUnreadBadge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convenioId, monthStartNorm]);

  useEffect(() => {
    const h = () => refreshUnreadBadge();
    window.addEventListener('convenios-mes-acciones-updated', h);
    return () =>
      window.removeEventListener('convenios-mes-acciones-updated', h);
  }, [refreshUnreadBadge]);

  useEffect(() => {
    if (open) fetchThreadAndMessages({ markRead: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const saveConvenioName = async () => {
    if (!thread?.id) return;
    const nombre = String(convenioNombreContacto || '').trim();
    if (!nombre) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre requerido',
        text: 'Ingresá tu nombre para iniciar el chat.'
      });
      return;
    }

    try {
      await http.patch(`/convenio-chat/thread/${thread.id}/nombre`, {
        convenio_nombre_contacto: nombre
      });
      setNeedsConvenioName(false);
      Swal.fire({
        icon: 'success',
        title: 'Listo',
        text: 'Nombre guardado. Ya podés chatear.'
      });
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo guardar el nombre',
        text: e?.response?.data?.mensajeError || e.message
      });
    }
  };

  const send = async () => {
    if (!thread?.id) return;
    if (!monthStartNorm) return;

    const msg = String(text || '').trim();
    if (!msg) return;

    if (!isGymSide && (needsConvenioName || isEmpty(convenioNombreContacto))) {
      Swal.fire({
        icon: 'info',
        title: 'Antes de enviar',
        text: 'Ingresá tu nombre para iniciar el chat.'
      });
      return;
    }

    const sender_tipo = isGymSide ? 'GIMNASIO' : 'CONVENIO';

    const tempId = makeTempId();
    const optimistic = {
      id: tempId,
      thread_id: thread.id,
      monthStart: monthStartNorm,
      sender_tipo,
      sender_user_id: isGymSide ? userId ?? null : null,
      sender_nombre: isGymSide
        ? userName || 'Gimnasio'
        : convenioNombreContacto,
      mensaje: msg,
      created_at: new Date().toISOString(),
      _optimistic: true
    };

    setMensajes((prev) => [...prev, optimistic]);
    setText('');
    setTimeout(() => scrollToBottom(true), 0);

    setSending(true);
    try {
      const payload = {
        thread_id: thread.id,
        monthStart: monthStartNorm,
        sender_tipo,
        mensaje: msg,
        sender_nombre: !isGymSide ? convenioNombreContacto : undefined,
        user_id: isGymSide ? userId ?? null : undefined,
        user_name: isGymSide ? userName ?? null : undefined
      };

      const { data } = await http.post('/convenio-chat/messages', payload);
      const saved = data?.mensaje || null;

      if (saved?.id) {
        setMensajes((prev) => prev.map((m) => (m.id === tempId ? saved : m)));
        setTimeout(() => scrollToBottom(true), 0);
      }

      // si el gimnasio envía, no afecta badge propio; si el convenio envía, badge del gimnasio se actualiza por evento/inbox
    } catch (e) {
      setMensajes((prev) => prev.filter((m) => m.id !== tempId));
      Swal.fire({
        icon: 'error',
        title: 'No se pudo enviar',
        text: e?.response?.data?.mensajeError || e.message
      });
      setText(msg);
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (ev) => {
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault();
      if (!sending) send();
    }
  };

  const canManageMessage = (m) => {
    if (!m || m._optimistic) return false;
    if (isDeletedMsg(m)) return false;

    // Solo mis mensajes (evita que el otro lado edite)
    const mine =
      (isGymSide && m.sender_tipo === 'GIMNASIO') ||
      (!isGymSide && m.sender_tipo === 'CONVENIO');

    return mine;
  };

  const startEdit = (m) => {
    setMenuOpenId(null);
    setEditingId(m.id);
    setEditingText(String(m.mensaje || ''));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = async (m) => {
    const txt = String(editingText || '').trim();
    if (!txt) {
      Swal.fire({
        icon: 'warning',
        title: 'Mensaje vacío',
        text: 'Escribí algo antes de guardar.'
      });
      return;
    }

    setSavingEdit(true);
    try {
      const payload = {
        mensaje: txt,
        user_id: isGymSide ? userId ?? null : undefined,
        user_name: isGymSide ? userName ?? null : undefined
      };

      const { data } = await http.patch(
        `/convenio-chat/messages/${m.id}`,
        payload
      );
      const updated = data?.mensaje || null;

      if (updated?.id) {
        setMensajes((prev) => prev.map((x) => (x.id === m.id ? updated : x)));
      } else {
        // fallback: actualizar local
        setMensajes((prev) =>
          prev.map((x) => (x.id === m.id ? { ...x, mensaje: txt } : x))
        );
      }

      cancelEdit();
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo editar',
        text: e?.response?.data?.mensajeError || e.message
      });
    } finally {
      setSavingEdit(false);
    }
  };

  const softDelete = async (m) => {
    setMenuOpenId(null);

    const r = await Swal.fire({
      icon: 'warning',
      title: 'Eliminar mensaje',
      text: 'Se eliminará el mensaje (soft delete). ¿Confirmás?',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!r.isConfirmed) return;

    try {
      await http.delete(`/convenio-chat/messages/${m.id}`, {
        data: {
          user_id: isGymSide ? userId ?? null : undefined,
          user_name: isGymSide ? userName ?? null : undefined
        }
      });

      // Actualización visual sin refetch
      setMensajes((prev) =>
        prev.map((x) =>
          x.id === m.id
            ? {
                ...x,
                is_deleted: 1,
                deleted_at: new Date().toISOString(),
                mensaje: x.mensaje // mantenemos en DB pero UI lo reemplaza abajo
              }
            : x
        )
      );
    } catch (e) {
      Swal.fire({
        icon: 'error',
        title: 'No se pudo eliminar',
        text: e?.response?.data?.mensajeError || e.message
      });
    }
  };

  const closeMenuOnOutside = useCallback(() => setMenuOpenId(null), []);
  useEffect(() => {
    if (!menuOpenId) return;
    window.addEventListener('click', closeMenuOnOutside);
    return () => window.removeEventListener('click', closeMenuOnOutside);
  }, [menuOpenId, closeMenuOnOutside]);

  function fmtTime(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  const portalRoot = typeof document !== 'undefined' ? document.body : null;

  return (
    <>
      {/* Botón Chat + Badge */}
      <button
        onClick={() => setOpen(true)}
        type="button"
        title="Abrir chat"
        className="
    fixed left-4 bottom-4 z-[90]
    inline-flex items-center gap-3
    rounded-2xl px-5 py-4
    font-extrabold text-white
    shadow-[0_18px_45px_rgba(0,0,0,0.30)]
    transition
    bg-gradient-to-r from-orange-500/25 via-white/5 to-white/5
    hover:from-orange-500/30 hover:via-white/10 hover:to-white/10
    ring-1 ring-white/10 hover:ring-orange-400/25
    backdrop-blur-xl
    active:scale-[0.99]
    w-[calc(100vw-2rem)] sm:w-auto
  "
        style={{
          paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))'
        }}
      >
        {/* Texto */}
        <span className="leading-none">Contactate con nosotros</span>

        {/* Icono a la derecha */}
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/15 ring-1 ring-orange-400/20">
          <FaComments className="text-orange-200 text-lg" />
        </span>

        {/* Badge unread */}
        {unreadCount > 0 && (
          <span
            className="
        absolute -top-2 -right-2
        min-w-[22px] h-[22px] px-1
        rounded-full bg-orange-500 text-orange-950
        text-[12px] font-extrabold grid place-items-center
        shadow-[0_10px_30px_rgba(249,115,22,0.35)]
        ring-2 ring-slate-950
      "
            title={`${unreadCount} mensajes no leídos`}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Modal */}
      {portalRoot &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-[9999]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Backdrop */}
                <div
                  className="absolute inset-0 bg-black/75 backdrop-blur-md"
                  onClick={() => setOpen(false)}
                />

                {/* Panel wrapper */}
                <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
                  {/* Panel */}
                  <motion.div
                    initial={{ y: 18, scale: 0.985, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    exit={{ y: 12, scale: 0.985, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="relative w-[min(980px,calc(100vw-1.5rem))]
                           h-[min(86vh,780px)]
                           overflow-hidden rounded-3xl border border-white/10
                           bg-slate-950/55 backdrop-blur-2xl
                           shadow-[0_30px_120px_rgba(0,0,0,0.65)]
                           flex flex-col"
                  >
                    {/* Decorative layers */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_0%,rgba(249,115,22,0.22),transparent_55%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(700px_circle_at_85%_35%,rgba(244,63,94,0.12),transparent_55%)]" />
                      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_120%,rgba(245,158,11,0.10),transparent_55%)]" />
                    </div>

                    {/* Header (naranja premium) */}
                    <div className="relative px-5 py-4 border-b border-white/10">
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-orange-500/18 via-white/0 to-amber-500/12" />

                      <div className="relative flex items-center justify-between gap-3">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-orange-500/15 text-orange-200 flex items-center justify-center border border-orange-400/20 shadow-[0_12px_40px_rgba(249,115,22,0.18)]">
                            <FaComments />
                          </div>

                          <div className="min-w-0">
                            <div className="text-white font-extrabold tracking-tight truncate">
                              {localTitle}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-white/65">
                              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/5 ring-1 ring-white/10">
                                Mes:{' '}
                                <span className="text-white/85 font-semibold">
                                  {fmtMes(monthStartNorm)}
                                </span>
                              </span>

                              <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/5 ring-1 ring-white/10">
                                {isGymSide ? 'Gimnasio' : 'Convenio'}
                              </span>

                              {unreadCount > 0 && (
                                <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/20">
                                  <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_0_3px_rgba(249,115,22,0.18)]" />
                                  {unreadCount} sin leer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setOpen(false)}
                          className="inline-flex items-center justify-center rounded-2xl p-2
                                 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-orange-400/25
                                 text-white/80 transition"
                          type="button"
                          title="Cerrar"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="relative flex-1 min-h-0">
                      {/* Prompt nombre convenio */}
                      {!isGymSide && needsConvenioName && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
                          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/55 backdrop-blur-2xl p-5 shadow-[0_22px_80px_rgba(0,0,0,0.65)]">
                            <div className="flex items-center gap-2 text-white font-extrabold">
                              <FaUserEdit className="text-orange-200" />
                              Antes de chatear, ingresá tu nombre
                            </div>
                            <div className="text-white/60 text-[13px] mt-1">
                              Se guardará para que el gimnasio sepa quién
                              escribe.
                            </div>

                            <input
                              value={convenioNombreContacto}
                              onChange={(e) =>
                                setConvenioNombreContacto(e.target.value)
                              }
                              placeholder="Tu nombre…"
                              className="mt-4 w-full rounded-2xl px-4 py-3 bg-white/5 text-white placeholder:text-white/35
                   ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/40 outline-none transition"
                            />

                            <div className="mt-4 flex items-center gap-3 justify-end">
                              <button
                                onClick={() => setOpen(false)}
                                className="rounded-2xl px-4 py-2 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 text-white font-bold"
                                type="button"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={saveConvenioName}
                                className="rounded-2xl px-4 py-2 bg-orange-500/90 hover:bg-orange-500 text-orange-950 font-extrabold"
                                type="button"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Lista mensajes */}
                      <div
                        ref={listRef}
                        className="h-full overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-5 space-y-3
             [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]"
                      >
                        {(loading || loadingMsgs) && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-white/70 text-sm">
                            Cargando chat…
                          </div>
                        )}

                        {!loading && !loadingMsgs && mensajes.length === 0 && (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white/60 text-sm">
                            No hay mensajes en este mes. Iniciá la conversación.
                          </div>
                        )}

                        {!loading &&
                          !loadingMsgs &&
                          mensajes.map((m) => {
                            const mine =
                              (isGymSide && m.sender_tipo === 'GIMNASIO') ||
                              (!isGymSide && m.sender_tipo === 'CONVENIO');

                            const deleted = isDeletedMsg(m);
                            const canManage = canManageMessage(m);

                            const showMenu = menuOpenId === m.id;
                            const isEditing = editingId === m.id;

                            const senderLabel =
                              m.sender_nombre ||
                              (m.sender_tipo === 'GIMNASIO'
                                ? 'Gimnasio'
                                : 'Convenio');

                            return (
                              <div
                                key={m.id}
                                className={`flex ${
                                  mine ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[92%] sm:max-w-[78%] min-w-[160px] ${
                                    mine ? 'pl-10' : 'pr-10'
                                  }`}
                                >
                                  {/* nombre arriba para mensajes ajenos */}
                                  {!mine && (
                                    <div className="text-[11px] text-white/45 mb-1 px-1 flex items-center gap-2">
                                      <span className="inline-block h-2 w-2 rounded-full bg-white/25" />
                                      {senderLabel}
                                    </div>
                                  )}

                                  {/* bubble wrapper */}
                                  <div className="relative group">
                                    {/* acciones (DENTRO del bubble, sin empujar ancho) */}
                                    {canManage && !deleted && !isEditing && (
                                      <div className="absolute right-2 top-2 z-10">
                                        <button
                                          type="button"
                                          onClick={(ev) => {
                                            ev.stopPropagation();
                                            setMenuOpenId((prev) =>
                                              prev === m.id ? null : m.id
                                            );
                                          }}
                                          className="h-9 w-9 rounded-2xl bg-black/25 hover:bg-black/35
                               ring-1 ring-white/10 hover:ring-orange-400/25
                               text-white/80 grid place-items-center
                               opacity-0 group-hover:opacity-100 transition"
                                          title="Opciones"
                                        >
                                          <FaEllipsisV />
                                        </button>

                                        <AnimatePresence>
                                          {showMenu && (
                                            <motion.div
                                              initial={{
                                                opacity: 0,
                                                y: 6,
                                                scale: 0.98
                                              }}
                                              animate={{
                                                opacity: 1,
                                                y: 0,
                                                scale: 1
                                              }}
                                              exit={{
                                                opacity: 0,
                                                y: 6,
                                                scale: 0.98
                                              }}
                                              transition={{ duration: 0.12 }}
                                              onClick={(ev) =>
                                                ev.stopPropagation()
                                              }
                                              className="absolute right-0 mt-2 w-44 rounded-2xl border border-white/10
                                   bg-slate-950/90 backdrop-blur-xl
                                   shadow-[0_18px_60px_rgba(0,0,0,0.60)]
                                   overflow-hidden"
                                            >
                                              <button
                                                type="button"
                                                onClick={() => startEdit(m)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition"
                                              >
                                                <FaEdit className="text-white/70" />
                                                Editar
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => softDelete(m)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-200 hover:bg-red-500/10 transition"
                                              >
                                                <FaTrash className="text-red-200/80" />
                                                Eliminar
                                              </button>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    )}

                                    {/* bubble */}
                                    <div
                                      className={`rounded-3xl px-4 py-3 ring-1
                    shadow-[0_18px_55px_rgba(0,0,0,0.35)]
                    ${
                      mine
                        ? // ---- CAMBIO: burbuja "mía" MÁS CLARA, sin oscuro ----
                          'bg-gradient-to-br from-orange-400/95 via-amber-300/90 to-orange-200/85 text-slate-900 ring-orange-200/40'
                        : // ---- burbuja "otro" clara/vidrio ----
                          'bg-white/[0.16] text-white/90 ring-white/15 backdrop-blur-xl'
                    }
                    ${canManage ? 'pr-14' : ''}`}
                                    >
                                      {deleted ? (
                                        <div className="text-[13px] opacity-70 flex items-center gap-2">
                                          <FaBan className="opacity-70" />
                                          Mensaje eliminado
                                        </div>
                                      ) : isEditing ? (
                                        <>
                                          <textarea
                                            value={editingText}
                                            onChange={(e) =>
                                              setEditingText(e.target.value)
                                            }
                                            className={`w-full min-h-[70px] resize-none rounded-2xl px-3 py-2
                          ${
                            mine
                              ? // ---- CAMBIO: textarea sobre burbuja clara ----
                                'bg-white/65 text-slate-900 placeholder:text-slate-500 ring-1 ring-black/10 focus:ring-2 focus:ring-orange-400/50'
                              : 'bg-black/20 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-orange-400/40'
                          } outline-none`}
                                          />

                                          <div className="mt-2 flex items-center justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={cancelEdit}
                                              disabled={savingEdit}
                                              className={`rounded-2xl px-3 py-2 font-bold transition disabled:opacity-50 ring-1
                            ${
                              mine
                                ? 'bg-white/70 hover:bg-white text-slate-900 ring-black/10'
                                : 'bg-white/10 hover:bg-white/15 text-white ring-white/10'
                            }`}
                                            >
                                              Cancelar
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() => saveEdit(m)}
                                              disabled={
                                                savingEdit ||
                                                isEmpty(editingText)
                                              }
                                              className="rounded-2xl px-3 py-2 bg-orange-500/90 hover:bg-orange-500 text-orange-950
                                   font-extrabold transition disabled:opacity-50"
                                            >
                                              <span className="inline-flex items-center gap-2">
                                                <FaCheck />
                                                Guardar
                                              </span>
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-[14px] leading-relaxed whitespace-pre-wrap">
                                            {m.mensaje}
                                          </div>

                                          {/* Hora debajo del mensaje */}
                                          <div
                                            className={`mt-2 text-[11px] flex items-center justify-end gap-2 tabular-nums
                          ${
                            mine
                              ? // ---- CAMBIO: hora más legible en burbuja clara ----
                                'text-slate-700/80'
                              : 'text-white/60'
                          }`}
                                          >
                                            <span>
                                              {fmtTime(
                                                m.created_at || m.createdAt
                                              )}
                                            </span>
                                            {m._optimistic && (
                                              <span className="opacity-70">
                                                · Enviando…
                                              </span>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    {/* Input (sticky) */}
                    <div className="relative border-t border-white/10 px-4 sm:px-6 py-4">
                      <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-orange-500/10 via-transparent to-amber-500/10" />

                      <div className="relative flex items-end gap-3">
                        <div className="flex-1 rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-2 shadow-[0_18px_60px_rgba(0,0,0,0.35)]">
                          <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Escribí un mensaje…"
                            className="min-h-[44px] max-h-[140px] w-full resize-none rounded-2xl px-4 py-3
                                   bg-transparent text-white placeholder:text-white/35
                                   outline-none"
                            disabled={sending || loading}
                          />
                          <div className="px-4 pb-2 text-[12px] text-white/35">
                            Enter para enviar · Shift+Enter para salto de línea
                          </div>
                        </div>

                        <button
                          onClick={send}
                          disabled={sending || loading || isEmpty(text)}
                          className={`inline-flex items-center justify-center gap-2 rounded-3xl px-5 py-4 font-extrabold transition
                                  shadow-[0_18px_55px_rgba(0,0,0,0.35)]
                                  ring-1 ${
                                    sending || loading || isEmpty(text)
                                      ? 'bg-white/10 text-white/35 ring-white/10 cursor-not-allowed'
                                      : 'bg-gradient-to-b from-orange-500/95 to-amber-500/85 text-orange-950 ring-orange-400/25 hover:brightness-105'
                                  }`}
                          type="button"
                          title="Enviar"
                        >
                          <FaPaperPlane />
                          Enviar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          portalRoot
        )}
    </>
  );
}
