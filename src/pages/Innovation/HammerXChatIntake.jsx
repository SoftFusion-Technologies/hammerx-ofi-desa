// HammerXChatIntake.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const API_UPLOAD_URL = 'http://localhost:8080/hx/imagenes-balanza';
// debajo de otros const de arriba
const SAMPLE_REPORT_URL = '/assets/mock/informe-2025-10-07-5.pdf';
const SAMPLE_REPORT_NAME = 'informe-2025-10-07-5.pdf';

// 0) Config: URL de n8n (producción)
const N8N_WEBHOOK_URL =
  'https://bright-jellyfish-49.hooks.n8n.cloud/webhook-test/a02bcc4b-6929-4373-94ea-28d0dd54eb5d';

// utils fetch → n8n con timeout + retries
async function postToN8NWithRetry({
  url,
  formData,
  headers = {},
  tries = 3,
  timeoutMs = 12000
}) {
  let attempt = 0;
  let lastErr;

  while (attempt < tries) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const resp = await fetch(url, {
        method: 'POST',
        body: formData,
        headers,
        signal: controller.signal
      });

      clearTimeout(t);

      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`N8N_HTTP_${resp.status}: ${text || 'sin detalle'}`);
      }

      // Si tu workflow responde JSON, podés intentar parsear:
      let data = null;
      try {
        data = await resp.json();
      } catch {
        /* puede no devolver JSON */
      }
      return { ok: true, status: resp.status, data };
    } catch (err) {
      clearTimeout(t);
      lastErr = err;

      // backoff exponencial simple: 500ms, 1000ms, 2000ms...
      const sleepMs = 500 * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, sleepMs));
      attempt += 1;
    }
  }

  return {
    ok: false,
    error: lastErr?.message || 'Error desconocido al enviar a n8n'
  };
}

const ease = [0.16, 1, 0.3, 1];

// Contenedor con caída + stagger
const fallContainer = {
  hidden: { opacity: 0, y: -20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
      when: 'beforeChildren',
      staggerChildren: 0.12
    }
  }
};

// Ítems con caída, blur y exit hacia arriba
const fallItem = {
  hidden: { opacity: 0, y: 14, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.45, ease }
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: 'blur(4px)',
    transition: { duration: 0.3, ease }
  }
};

const bubble = fallItem;

function TypingDots() {
  return (
    <span className="inline-flex gap-1 pl-1 align-middle">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0.2s]" />
    </span>
  );
}

export default function HammerXChatIntake({
  firstName = '',
  nombre,
  dni,
  onSubmit
}) {
  const you = useMemo(() => {
    const fn = (firstName || '').trim();
    if (!fn) return '¡hey!';
    return fn;
  }, [firstName]);

  // timeline del chat (arranque)
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      side: 'bot',
      text: `Hola ${you}, soy tu Coach virtual de HammerX.`
    },
    {
      id: 'm2',
      side: 'bot',
      text: 'Voy a preparar tu Informe Nutricional y de Entrenamiento.'
    },
    {
      id: 'm3',
      side: 'bot',
      text: 'Subí las dos 2 fotos de la balanza para empezar.'
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLocked, setUploadLocked] = useState(false); // ← bloquea nuevos envíos tras éxito
  const [lastBatch, setLastBatch] = useState(null); // { batch_id, count, items[] }

  // autoscroll
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  // uploads
  const maxImages = 2,
    minImages = 2;
  const [files, setFiles] = useState([]); // File[]
  const [previews, setPreviews] = useState([]); // [{url,name,size}]
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(
    () => () => previews.forEach((p) => URL.revokeObjectURL(p.url)),
    [previews]
  );

  const canPickMore = files.length < maxImages;
  const isValidCount = files.length >= minImages && files.length <= maxImages;

  const handleFiles = (list) => {
    const arr = Array.from(list || []);
    if (!arr.length) return;

    const imgs = arr.filter((f) => f.type.startsWith('image/'));
    if (!imgs.length) {
      setError('Solo se aceptan imágenes.');
      return;
    }

    const room = maxImages - files.length;
    const next = [...files, ...imgs.slice(0, room)];

    // previews nuevas
    const existingKey = new Set(previews.map((p) => p.name + p.size));
    const fresh = imgs
      .slice(0, room)
      .filter((f) => !existingKey.has(f.name + f.size))
      .map((f) => ({
        url: URL.createObjectURL(f),
        name: f.name,
        size: f.size
      }));

    setFiles(next);
    setPreviews((prev) => [...prev, ...fresh]);
    setError('');
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onPick = (e) => handleFiles(e.target.files);

  const removeAt = (idx) => {
    const copyF = [...files];
    const copyP = [...previews];
    const [removed] = copyP.splice(idx, 1);
    if (removed) URL.revokeObjectURL(removed.url);
    copyF.splice(idx, 1);
    setFiles(copyF);
    setPreviews(copyP);
  };

  const plural = (n, s, p) => (n === 1 ? s : p);

  async function postImagesToBackend(files, extras = {}) {
    const fd = new FormData();
    files.forEach((f) => fd.append('fotos', f));

    // 👇 añadimos nombre + dni
    if (extras.nombre) fd.append('nombre', extras.nombre);
    if (extras.dni) fd.append('dni', extras.dni);

    // Opcionales (si los querés enviar ahora o más tarde):
    // fd.append('cliente_id', extras.cliente_id ?? '');
    // fd.append('informe_id', extras.informe_id ?? '');
    // fd.append('fecha_captura', extras.fecha_captura ?? '');
    // fd.append('notas', extras.notas ?? '');

    const resp = await fetch(API_UPLOAD_URL, {
      method: 'POST',
      body: fd
      // NO pongas Content-Type manualmente; fetch lo arma con boundary
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.ok) {
      const msg = data?.message || `Error HTTP ${resp.status}`;
      const code = data?.code || 'UPLOAD_FAILED';
      throw new Error(`${code}: ${msg}`);
    }
    return data; // { ok, batch_id, count, items[] }
  }

  // Ubicación: reemplazar la función send() actual
  const send = async () => {
    if (!isValidCount) {
      setError(
        `Subí entre ${minImages} y ${maxImages} fotos. Actualmente: ${files.length}.`
      );
      return;
    }
    if (uploadLocked || isSubmitting) return;

    const count = files.length;

    // 1) Mensaje del usuario
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${Date.now()}`,
        side: 'user',
        text: `${count} imagen${count > 1 ? 'es' : ''} enviada${
          count > 1 ? 's' : ''
        }.`
      }
    ]);

    // 2) Bot "typing"
    const typingId = `t-${Date.now() + 1}`;
    setMessages((prev) => [
      ...prev,
      {
        id: typingId,
        side: 'bot',
        text: `Perfecto ${you}, recibí tus ${count} ${plural(
          count,
          'imagen',
          'imágenes'
        )}, las estoy procesando.`,
        typing: true
      }
    ]);

    try {
      setIsSubmitting(true);
      const res = await postImagesToBackend(files, {
        nombre, // 👈
        dni // 👈
      }); // éxito → bloquear nuevos envíos
      setUploadLocked(true);
      setLastBatch({
        batch_id: res.batch_id,
        count: res.count,
        items: res.items
      });

      // 1) Enviar a n8n las MISMAS imágenes como "files" en el body,
      //    y los headers: batchid, dni, nombre
      const fdN8N = new FormData();
      files.forEach((f) => fdN8N.append('files', f)); // 👈 clave EXACTA: "files"

      const n8nResult = await postToN8NWithRetry({
        url: N8N_WEBHOOK_URL,
        formData: fdN8N,
        headers: {
          // No pongas Content-Type manualmente
          batchid: res.batch_id, // 👈 del backend
          dni: String(dni || ''),
          nombre: String(nombre || '')
        },
        tries: 3, // puedes ajustar
        timeoutMs: 12000 // puedes ajustar
      });

      // feedback UI según resultado n8n:
      if (!n8nResult.ok) {
        console.error('[n8n] fallo:', n8nResult.error);

        // Mostrar un mensaje “no bloqueante” al usuario:
        setMessages((prev) => [
          ...prev,
          {
            id: `warn-${Date.now()}`,
            side: 'bot',
            text: 'Guardé tus imágenes, pero no pude conectar con el procesador. Reintentaré en segundo plano.'
          }
        ]);
      } else {
        // opcional: si tu workflow devuelve algo útil
        console.log('[n8n] ok:', n8nResult.status, n8nResult.data);
      }
      // hacer get de lo que trae n8n
      // hacer un post /hx/informes/from-ocr
      
      // reemplazar bubble "typing" por confirmación (sin batch_id visible)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                typing: false,
                text: `Listo ${firstName}. Logre recibir ${res.count} imagen${
                  res.count > 1 ? 'es' : ''
                }. En unos instantes te muestro el resultado.`
              }
            : m
        )
      );
      // justo después del setMessages(...) que quita typing y pone “Listo. Logré recibir…”
      setTimeout(() => {
        // 1) Mensaje “este es tu informe…”
        setMessages((prev) => [
          ...prev,
          {
            id: `r-${Date.now()}`,
            side: 'bot',
            text: `${
              firstName ? firstName + ',' : ''
            } este es tu informe preliminar:`
          }
        ]);

        // 2) File bubble con el PDF de prueba
        setMessages((prev) => [
          ...prev,
          {
            id: `f-${Date.now() + 1}`,
            side: 'bot',
            file: {
              url: SAMPLE_REPORT_URL,
              name: SAMPLE_REPORT_NAME
            }
          }
        ]);
      }, 1200); // pequeño delay “humano”

      // Log interno para debugging / integraciones
      console.log('[HX] Upload imágenes balanza OK:', {
        batch_id: res.batch_id,
        count: res.count,
        items: res.items
      });

      // Si querés notificar al padre:
      onSubmit?.(files, res);

      // opcional: limpiar previews pero mantener bloqueo
      // previews.forEach((p) => URL.revokeObjectURL(p.url));
      // setPreviews([]); setFiles([]);
    } catch (e) {
      const msg = e?.message || 'No se pudieron subir las imágenes.';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                typing: false,
                text: `Ocurrió un error al guardar: ${msg}`
              }
            : m
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="mx-auto w-full max-w-3xl"
      variants={fallContainer}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={fallItem} className="mb-4 flex items-center gap-4">
        <div
          className="relative grid h-12 w-12 md:h-14 md:w-14 shrink-0 place-items-center rounded-full
                     bg-zinc-800 ring-2 ring-emerald-400/80 overflow-hidden
                     shadow-[0_0_0_2px_rgba(16,185,129,0.25)_inset,0_0_32px_rgba(16,185,129,0.65)]"
        >
          <span
            className="pointer-events-none absolute inset-0 -z-10 rounded-full
                           bg-emerald-400/25 blur-xl animate-pulse"
          />
          <div className="absolute inset-0">
            <iframe
              src="https://lottie.host/embed/8d6af2de-c428-47b9-961f-9819bf5ab626/Cykq1319x6.lottie"
              title="HammerX bot"
              className="h-full w-full scale-110 origin-center [transform:translateZ(0)]"
              frameBorder="0"
              allow="autoplay"
              allowFullScreen
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm font-medium text-orange-600">Hammercito</div>
          <div className="text-xs text-emerald-400">
            en línea • listo para ayudarte
          </div>
        </div>
      </motion.div>

      {/* Shell */}
      <motion.div
        variants={fallItem}
        className="relative rounded-3xl p-[1px] ring-1 ring-white/10 bg-gradient-to-br from-white/10 via-white/0 to-white/10"
      >
        <div className="rounded-3xl bg-gray-200 p-4 md:p-6 backdrop-blur-xl">
          {/* Mensajes */}
          <motion.div
            variants={fallContainer}
            className="mb-4 space-y-3 max-h-[42vh] overflow-auto pr-1"
          >
            {messages.map((m) => (
              <motion.div
                key={m.id}
                variants={bubble}
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ring-1 ${
                  m.side === 'bot'
                    ? 'bg-orange-600 text-orange-100 ring-orange-300/20'
                    : 'bg-teal-600/60 text-teal-100 ring-teal-300/20 ml-auto'
                }`}
              >
                {/* rama file */}
                {m.file ? (
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 rounded-md bg-black/20 px-2 py-1 text-[11px]">
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium">
                        {m.file.name || 'archivo.pdf'}
                      </div>
                      <div className="mt-1 flex gap-3 text-[11px]">
                        <a
                          href={m.file.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline"
                        >
                          Ver
                        </a>
                        <a
                          href={m.file.url}
                          download={m.file.name || 'archivo.pdf'}
                          className="underline"
                        >
                          Descargar
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <span>{m.text}</span>
                    {m.typing && <TypingDots />}
                  </>
                )}
              </motion.div>
            ))}

            <div ref={endRef} />
          </motion.div>

          {/* Drop / Selector */}
          <motion.div
            variants={fallItem}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && canPickMore)
                inputRef.current?.click();
            }}
            onDragEnter={() =>
              !uploadLocked && !isSubmitting && setDragOver(true)
            }
            onDragOver={(e) => {
              if (uploadLocked || isSubmitting) return;
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              if (uploadLocked || isSubmitting) return;
              onDrop(e);
            }}
            className={[
              'group relative rounded-2xl border border-dashed p-5 transition-all',
              uploadLocked
                ? 'opacity-60 pointer-events-none cursor-not-allowed'
                : dragOver
                ? 'border-indigo-400/70 bg-indigo-500/10'
                : 'border-indigo-400/40 bg-zinc-900/40 hover:border-indigo-400/60'
            ].join(' ')}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <p className="text-sm text-zinc-200">
                Arrastrá y soltá tus fotos de la balanza
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Acepta imágenes • mínimo {minImages} • máximo {maxImages}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <label
                  className={[
                    'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-white transition-all',
                    uploadLocked || !canPickMore || isSubmitting
                      ? 'bg-indigo-700/40 cursor-not-allowed opacity-60'
                      : 'bg-indigo-600 hover:bg-indigo-500 shadow-[0_8px_30px_-10px_rgba(99,102,241,0.55)]'
                  ].join(' ')}
                  aria-disabled={uploadLocked || !canPickMore || isSubmitting}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onPick}
                    disabled={uploadLocked || !canPickMore || isSubmitting}
                  />
                  Seleccionar imágenes
                </label>

                <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-zinc-300">
                  {files.length}/{maxImages}
                </span>
              </div>

              <AnimatePresence>
                {!isValidCount && files.length > 0 && (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="mt-2 text-[11px] text-amber-300"
                  >
                    Necesitás al menos {minImages} y hasta {maxImages} imágenes.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Glow hover */}
            <span
              className="pointer-events-none absolute inset-0 -z-10 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100
                             bg-[radial-gradient(50%_100%_at_50%_0%,rgba(99,102,241,0.25),transparent)]"
            />
          </motion.div>

          {/* Previews */}
          <AnimatePresence initial={false}>
            {!!previews.length && (
              <motion.div
                key="previews"
                variants={fallItem}
                initial="hidden"
                animate="show"
                exit="exit"
                className="mt-5"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-xs text-zinc-400">Previsualización</div>
                  <button
                    type="button"
                    onClick={() => {
                      previews.forEach((p) => URL.revokeObjectURL(p.url));
                      setPreviews([]);
                      setFiles([]);
                      setError('');
                    }}
                    className="rounded-lg border border-zinc-700/60 px-2 py-1 text-[11px] text-gray-500 hover:border-zinc-500 hover:text-zinc-100"
                  >
                    Limpiar todo
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  <AnimatePresence initial={false}>
                    {previews.map((p, i) => (
                      <motion.div
                        key={p.url}
                        layout
                        variants={fallItem}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="group relative overflow-hidden rounded-xl ring-1 ring-white/10"
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 px-2 pb-2">
                          <span className="line-clamp-1 text-[11px] text-white/90">
                            {p.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAt(i)}
                            className="rounded-full bg-black/60 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                            title="Quitar"
                          >
                            ×
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              variants={fallItem}
              className="mt-3 text-xs text-amber-300"
            >
              {error}
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            variants={fallItem}
            className="mt-5 flex items-center justify-end"
          >
            <button
              type="button"
              onClick={send}
              disabled={!isValidCount || uploadLocked || isSubmitting}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-white transition-all
    ${
      !isValidCount || uploadLocked || isSubmitting
        ? 'bg-emerald-700/40 cursor-not-allowed opacity-60'
        : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_8px_30px_-10px_rgba(16,185,129,0.55)]'
    }`}
            >
              {isSubmitting
                ? 'Enviando…'
                : uploadLocked
                ? 'Imágenes cargadas'
                : 'Enviar imágenes'}
            </button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        variants={fallItem}
        className="mt-3 text-center text-[11px] text-zinc-500"
      >
        Tip: asegurate de que el número de la balanza sea legible y esté bien
        iluminado.
      </motion.div>
    </motion.div>
  );
}
