// HammerXChatIntake.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ProcessingModal from './Components/ProcessingModal';

const API_UPLOAD_URL = 'http://localhost:8080/hx/imagenes-balanza';
// debajo de otros const de arriba
const SAMPLE_REPORT_URL = '/assets/mock/informe-2025-10-07-5.pdf';
const SAMPLE_REPORT_NAME = 'informe-2025-10-07-5.pdf';

// 0) Config: URL de n8n (producción)
const N8N_WEBHOOK_URL =
  'https://hammer-n8n.e3n0qp.easypanel.host/webhook/dfb8cf0c-ba87-4eaa-bfcc-6d98f6c2c594';

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
  sede,
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

  const [showProcessing, setShowProcessing] = useState(false);
  const processingTimerRef = useRef(null);

  // Limpieza de timers al desmontar
  useEffect(() => {
    return () => clearTimeout(processingTimerRef.current);
  }, []);

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

    // Datos de identidad
    if (extras.nombre) fd.append('nombre', String(extras.nombre).trim());
    if (extras.dni) fd.append('dni', String(extras.dni).replace(/\D/g, ''));
    if (extras.sede) fd.append('sede', String(extras.sede).trim()); // ✅ NUEVO

    // Opcionales
    // if (extras.cliente_id)    fd.append('cliente_id', String(extras.cliente_id));
    // if (extras.informe_id)    fd.append('informe_id', String(extras.informe_id));
    // if (extras.fecha_captura) fd.append('fecha_captura', extras.fecha_captura); // YYYY-MM-DD
    // if (extras.notas)         fd.append('notas', String(extras.notas));

    const resp = await fetch(API_UPLOAD_URL, {
      method: 'POST',
      body: fd // no setees Content-Type manualmente
    });

    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || !data?.ok) {
      const msg = data?.message || `Error HTTP ${resp.status}`;
      const code = data?.code || 'UPLOAD_FAILED';
      throw new Error(`${code}: ${msg}`);
    }
    return data; // { ok, batch_id, count, items[], cliente_resuelto?... }
  }

  // Ubicación: reemplazar la función send() actual
  const apiBase = new URL(API_UPLOAD_URL).origin;

  // --- helper para loguear sin romper la consola con blobs gigantes ---
  function safePreview(obj, { maxLen = 800 } = {}) {
    try {
      const json = JSON.stringify(
        obj,
        (k, v) => {
          // Evitá logs gigantes de binarios o arrays muy grandes
          if (Array.isArray(v) && v.length > 20) return `[Array(${v.length})]`;
          if (typeof v === 'string' && v.length > 200)
            return v.slice(0, 200) + '…';
          return v;
        },
        2
      );
      return json.length > maxLen
        ? json.slice(0, maxLen) + ' …(truncado)'
        : json;
    } catch {
      return String(obj);
    }
  }
  // helper: normaliza el objeto de n8n al formato que espera el POST /hx/informes/from-ocr

  function toOCRPayload(n8nItem, { batch_id }) {
    // ⏺️ LOG DE ENTRADA
    try {
      console.groupCollapsed(
        '%c[HX:UI] toOCRPayload IN',
        'color:#8a2be2;font-weight:600'
      );
      console.log('batch_id:', batch_id);
      console.log('raw n8nItem (preview):', safePreview(n8nItem));
      console.groupEnd();
    } catch {}

    const cleanRange = (s) =>
      typeof s === 'string' ? s.replace(/[–—]/g, '-').trim() : s;
    const numOrNull = (x) => {
      const n = Number(x);
      return Number.isFinite(n) ? n : null;
    };

    const gender = n8nItem?.Gender || n8nItem?.gender || null;

    // Height puede venir en cm (160) o ya en metros (1.60)
    let altura_m = null;
    const H = n8nItem?.Height;
    if (typeof H === 'number') {
      altura_m = H > 3 ? Number((H / 100).toFixed(2)) : H;
    } else if (typeof H === 'string') {
      const num = Number(H.replace(/[^\d.]/g, ''));
      if (!Number.isNaN(num))
        altura_m = num > 3 ? Number((num / 100).toFixed(2)) : num;
    }

    // Normalización profunda de physical_parameters
    const ppIn = n8nItem?.physical_parameters || {};

    // Normalizar r en métricas conocidas
    const ppOut = {
      ...ppIn,
      percent_body_fat: ppIn.percent_body_fat
        ? { ...ppIn.percent_body_fat, r: cleanRange(ppIn.percent_body_fat.r) }
        : undefined,
      visceral_fat_index: ppIn.visceral_fat_index
        ? {
            ...ppIn.visceral_fat_index,
            r: cleanRange(ppIn.visceral_fat_index.r)
          }
        : undefined,
      body_mass_index: ppIn.body_mass_index
        ? { ...ppIn.body_mass_index, r: cleanRange(ppIn.body_mass_index.r) }
        : undefined
    };

    // Deep-merge de indices (sin pisar lo existente) + mover waist_hip_ratio si vino plano
    const indicesIn = ppIn.indices || {};
    const whrIn = ppIn.waist_hip_ratio
      ? {
          waist_hip_ratio: {
            ...ppIn.waist_hip_ratio,
            r: cleanRange(ppIn.waist_hip_ratio.r)
          }
        }
      : {};
    const mergedIndices = { ...indicesIn, ...whrIn };
    if (Object.keys(mergedIndices).length) ppOut.indices = mergedIndices;

    // Ajustes sugeridos (kg) → números (pueden ser negativos)
    const adjIn = ppIn.suggest_for_adjustments || {};
    const suggest = {
      fat_control: numOrNull(adjIn.fat_control),
      muscle_control: numOrNull(adjIn.muscle_control),
      weight_control: numOrNull(adjIn.weight_control)
    };
    if (Object.values(suggest).some((v) => v != null)) {
      ppOut.suggest_for_adjustments = suggest;
    }

    // armamos "content" tal como espera el backend
    const content = {
      Gender: gender ?? undefined,
      Age: n8nItem?.Age ?? undefined,
      Height: n8nItem?.Height ?? undefined,
      body_shape_analysis: n8nItem?.body_shape_analysis ?? undefined,
      body_composition: n8nItem?.body_composition ?? undefined,
      physical_parameters: ppOut
    };

    // textos (todo opcional)
    const textos = {
      interpretacion: n8nItem?.interpretacion ?? undefined,
      recomendaciones_entrenamiento:
        n8nItem?.recomendaciones_entrenamiento ?? undefined,
      recomendaciones_alimenticias:
        n8nItem?.recomendaciones_alimenticias ?? undefined,
      ejemplos_alimentacion: n8nItem?.ejemplos_alimentacion ?? undefined,
      objetivo_final: n8nItem?.objetivo_final ?? undefined
    };

    // cliente
    const cliente = {
      dni: n8nItem?.dni ? String(n8nItem.dni).replace(/\D/g, '') : undefined,
      nombre: n8nItem?.nombre ?? undefined,
      sexo: gender?.toUpperCase?.().startsWith('M')
        ? 'M'
        : gender?.toUpperCase?.().startsWith('F')
        ? 'F'
        : undefined,
      altura_m: altura_m ?? undefined
    };

    const payload = {
      idempotency_key: n8nItem?.idempotency_key ?? undefined,
      fecha: n8nItem?.fecha ?? new Date().toISOString().slice(0, 10),
      batch_id, // vincula imágenes
      cliente,
      _edad_anios_override: n8nItem?.Age ?? undefined,
      content,
      textos,
      generate_pdf: true
    };

    // ⏺️ LOG DE SALIDA
    try {
      console.groupCollapsed(
        '%c[HX:UI] toOCRPayload OUT',
        'color:#2e8b57;font-weight:600'
      );
      console.log('payload (preview):', safePreview(payload));
      console.groupEnd();
    } catch {}

    return payload;
  }

  // abre a los 2s, reiniciando cualquier timer previo
  const startProcessingDelay = () => {
    if (processingTimerRef.current) clearTimeout(processingTimerRef.current);
    processingTimerRef.current = setTimeout(() => {
      setShowProcessing(true);
    }, 2000);
  };

  // cierra SIEMPRE y cancela el timer pendiente (evita reabrir)
  const finishProcessing = () => {
    if (processingTimerRef.current) {
      clearTimeout(processingTimerRef.current);
      processingTimerRef.current = null;
    }
    setShowProcessing(false);
  };

  // limpieza al desmontar
  useEffect(() => () => finishProcessing(), []);

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
        text: `Perfecto ${you}, recibí tus ${count} ${
          count === 1 ? 'imagen' : 'imágenes'
        }, las estoy procesando.`,
        typing: true
      }
    ]);

    // ⭐ 3) Programar el modal “Procesando…” a los 2s
    startProcessingDelay();

    try {
      setIsSubmitting(true);

      // --- 1) Subir imágenes a TU backend ---
      const res = await postImagesToBackend(files, { nombre, dni, sede });
      setUploadLocked(true);
      setLastBatch({
        batch_id: res.batch_id,
        count: res.count,
        items: res.items
      });

      // --- 2) Disparar n8n con binarios + headers mínimos ---
      const fdN8N = new FormData();
      files.forEach((f) => fdN8N.append('files', f));
      const n8nResult = await postToN8NWithRetry({
        url: N8N_WEBHOOK_URL,
        formData: fdN8N,
        headers: {
          batchid: res.batch_id,
          dni: String(dni || ''),
          nombre: String(nombre || '')
        },
        tries: 2,
        timeoutMs: 20000
      });

      // --- 3) Mensaje de “Listo, generando informe…”
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? {
                ...m,
                typing: false,
                text: `Listo ${firstName}. Ya tengo tus imágenes, generando tu informe…`
              }
            : m
        )
      );

      if (!n8nResult.ok) {
        console.error('[n8n] fallo:', n8nResult.error);
        setMessages((prev) => [
          ...prev,
          {
            id: `warn-${Date.now()}`,
            side: 'bot',
            text: 'Guardé tus imágenes, pero no pude conectar con el procesador.'
          }
        ]);
        return;
      }
      // --- 4) Formatear la respuesta de n8n al payload que espera tu backend ---
      const payloadRaw = Array.isArray(n8nResult.data)
        ? n8nResult.data[0]
        : n8nResult.data || {};
      const ocrPayload = toOCRPayload(payloadRaw, { batch_id: res.batch_id });

      // --- 5) POST /hx/informes/from-ocr (JSON) ---
      const respOCR = await fetch(`${apiBase}/hx/informes/from-ocr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ocrPayload)
      });

      const dataOCR = await respOCR.json().catch(() => ({}));
      if (!respOCR.ok || !dataOCR?.ok) {
        console.error('[HX] OCR POST error:', respOCR.status, dataOCR);
        throw new Error(
          dataOCR?.message || `Error HTTP ${respOCR.status} al crear informe`
        );
      }

      const informeId = dataOCR?.informe_id;
      let pdfUrl =
        dataOCR?.pdf?.url ||
        (informeId ? `/hx/informes/${informeId}/pdf` : null);

      if (pdfUrl && !/^https?:\/\//i.test(pdfUrl)) {
        pdfUrl = apiBase + pdfUrl; // absolutizamos
      }

      // --- 6) Feedback final + bubble PDF real ---
      setMessages((prev) => [
        ...prev,
        {
          id: `r-${Date.now()}`,
          side: 'bot',
          text: `${firstName ? firstName + ',' : ''} este es tu informe:`
        },
        ...(pdfUrl
          ? [
              {
                id: `f-${Date.now() + 1}`,
                side: 'bot',
                file: {
                  url: pdfUrl,
                  name:
                    dataOCR?.pdf?.filename ||
                    `informe-${
                      dataOCR?.fecha || new Date().toISOString().slice(0, 10)
                    }-${informeId || 'descarga'}.pdf`
                }
              }
            ]
          : [
              {
                id: `warn-${Date.now() + 2}`,
                side: 'bot',
                text: 'Procesé todo, pero no pude generar el enlace del informe.'
              }
            ])
      ]);

      // log p/depurar
      console.log('[n8n] ok:', n8nResult.status, payloadRaw);
      console.log('[HX] Informe creado:', { informeId, pdf: dataOCR?.pdf });

      // opcional: callback al padre
      onSubmit?.(files, { ...res, informe_id: informeId, pdf: dataOCR?.pdf });
    } catch (e) {
      const msg = e?.message || 'No se pudo completar el proceso.';
      setError(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === typingId
            ? { ...m, typing: false, text: `Ocurrió un error: ${msg}` }
            : m
        )
      );
    } finally {
      finishProcessing();
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
      <ProcessingModal open={showProcessing} />
    </motion.div>
  );
}
