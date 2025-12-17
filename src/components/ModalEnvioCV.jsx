import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Mail,
  Copy,
  Check,
  Building2,
  Briefcase,
  Phone,
  User,
  Instagram,
  ChevronDown,
  Sparkles,
  Info
} from 'lucide-react';

const EMAIL_TO = 'mi-cv@hammer.ar';

const CARGOS = [
  'Recepcionista',
  'Vendedor',
  'Instructor de musculación',
  'Coach de clases grupales',
  'Limpieza',
  'Mantenimiento',
  'Marketing',
  'Otro'
];

const SEDES = [
  'SMT - BARRIO SUR',
  'SMT - BARRIO NORTE',
  'Monteros',
  'Concepción'
];

// Activá/desactivá el “wizard flow”
const AUTO_ADVANCE = true;

const cn = (...classes) => classes.filter(Boolean).join(' ');

function safeCopy(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '-9999px';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      ok ? resolve(true) : reject(new Error('execCommand(copy) failed'));
    } catch (e) {
      reject(e);
    }
  });
}

const Section = ({ title, icon: Icon, open, onToggle, children }) => (
  <div className="rounded-2xl border border-orange-200/60 bg-white shadow-sm overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-orange-50/60 transition"
      aria-expanded={open}
    >
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-200 grid place-items-center">
          <Icon className="w-5 h-5 text-orange-600" />
        </span>
        <div className="text-left">
          <div className="text-sm font-semibold text-zinc-900">{title}</div>
          <div className="text-[12px] text-zinc-500">Ver opciones</div>
        </div>
      </div>
      <ChevronDown
        className={cn(
          'w-5 h-5 text-zinc-500 transition-transform',
          open ? 'rotate-180' : 'rotate-0'
        )}
      />
    </button>

    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="px-4 pb-4 pt-2">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Chip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'px-3 py-2 rounded-xl text-sm border transition w-full sm:w-auto text-left',
      active
        ? 'bg-orange-50 border-orange-300 text-orange-800'
        : 'bg-white border-zinc-200 text-zinc-700 hover:bg-orange-50/50 hover:border-orange-200'
    )}
  >
    {children}
  </button>
);

export default function ModalEnvioCV({ isOpen, onClose }) {
  const panelRef = useRef(null);

  // Contenedor scroll interno del modal (clave para scroll suave en mobile)
  const scrollRef = useRef(null);

  // Targets para “scroll-to”
  const cargoAnchorRef = useRef(null);
  const sedeAnchorRef = useRef(null);
  const previewAnchorRef = useRef(null);

  const [nombre, setNombre] = useState('');
  const [celular, setCelular] = useState('');
  const [instagram, setInstagram] = useState('');
  const [cargo, setCargo] = useState('');
  const [sede, setSede] = useState('');

  const [openCargos, setOpenCargos] = useState(false);
  const [openSedes, setOpenSedes] = useState(false);

  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');

  // Para “highlight” breve cuando scrollea a una sección
  const [pulse, setPulse] = useState(null); // 'cargo' | 'sede' | 'preview' | null

  // Scroll helper: scrollea dentro del contenedor del modal
  const scrollToAnchor = (ref) => {
    const container = scrollRef.current;
    const el = ref?.current;

    if (!container || !el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    // top relativo + un “padding” visual
    const targetTop = elRect.top - containerRect.top + container.scrollTop - 12;

    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  };

  const pulseSection = (key) => {
    setPulse(key);
    window.clearTimeout(pulseSection._t);
    pulseSection._t = window.setTimeout(() => setPulse(null), 700);
  };

  // Lock scroll + ESC + focus
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    setTimeout(() => panelRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 4500);
    return () => clearTimeout(t);
  }, [copied]);

  const bodyText = useMemo(() => {
    const ig = instagram?.trim() ? instagram.trim() : 'No tengo Instagram';

    const n = nombre?.trim() || '(Tu nombre)';
    const c = celular?.trim() || '(Tu celular)';
    const cg = cargo?.trim() || '(Cargo)';
    const sd = sede?.trim() || '(Sede)';

    return [
      `Hola, mi nombre es ${n}.`,
      `Mi número de celular es ${c}.`,
      `Mi Instagram es ${ig}.`,
      `El cargo que me interesa es ${cg}.`,
      `La sede a la que postulo es ${sd}.`,
      '',
      'Adjunto mi CV.',
      '¡Muchas gracias!'
    ].join('\n');
  }, [nombre, celular, instagram, cargo, sede]);

  const subject = useMemo(() => {
    const sd = sede?.trim() || 'Sede';
    const cg = cargo?.trim() || 'Puesto';
    return `Postulación — ${sd} / ${cg} (HammerX Gym)`;
  }, [sede, cargo]);

  const canOpenMail = useMemo(() => {
    return (
      nombre.trim().length >= 2 &&
      celular.trim().length >= 6 &&
      cargo.trim().length >= 2 &&
      sede.trim().length >= 2
    );
  }, [nombre, celular, cargo, sede]);

  const progreso = useMemo(() => {
    const fields = [nombre, celular, cargo, sede];
    const ok = fields.filter((v) => v.trim().length > 1).length;
    return Math.round((ok / fields.length) * 100);
  }, [nombre, celular, cargo, sede]);

  const abrirMail = () => {
    const mailto = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyText)}`;
    window.location.href = mailto;
  };

  const copiarFormatoMail = async () => {
    setCopyError('');
    try {
      await safeCopy(bodyText);
      setCopied(true);
      // opcional: llevar al preview cuando copia
      scrollToAnchor(previewAnchorRef);
      pulseSection('preview');
    } catch (e) {
      setCopyError(
        'No se pudo copiar automáticamente. Probá seleccionando el texto del preview y copiándolo manualmente.'
      );
    }
  };

  // Interacción guiada: abrir + scrollear a cargos
  const goToCargos = () => {
    setOpenCargos(true);
    // Esperamos el render/animación del acordeón y luego scrolleamos
    setTimeout(() => {
      scrollToAnchor(cargoAnchorRef);
      pulseSection('cargo');
    }, 60);
  };

  // Interacción guiada: abrir + scrollear a sedes
  const goToSedes = () => {
    setOpenSedes(true);
    setTimeout(() => {
      scrollToAnchor(sedeAnchorRef);
      pulseSection('sede');
    }, 60);
  };

  const onPickCargo = (c) => {
    setCargo(c);
    setOpenCargos(false);

    if (AUTO_ADVANCE) {
      setTimeout(() => {
        goToSedes();
      }, 180);
    }
  };

  const onPickSede = (s) => {
    setSede(s);
    setOpenSedes(false);

    if (AUTO_ADVANCE) {
      setTimeout(() => {
        scrollToAnchor(previewAnchorRef);
        pulseSection('preview');
      }, 180);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="dashboardbg fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-modal="true"
        role="dialog"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.25),transparent_55%)]" />

        {/* Panel */}
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          initial={{ y: 18, opacity: 0, scale: 0.985 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 12, opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.22 }}
          className={cn(
            'relative w-full max-w-4xl outline-none',
            'rounded-[28px] border border-orange-200 bg-white shadow-2xl overflow-hidden',
            'max-h-[92vh] flex flex-col'
          )}
        >
          {/* <button
            onClick={onClose}
            className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white border border-zinc-200 hover:bg-orange-50 transition grid place-items-center"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-zinc-700" />
          </button> */}

          {/* Header */}
          <div className="p-6 sm:p-8 border-b border-zinc-200">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-orange-50 border border-orange-200 grid place-items-center">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>

              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 font-bignoodle">
                  Postulación laboral — HammerX Gym
                </h2>
                <p className="mt-2 text-sm sm:text-base text-zinc-600 font-messina">
                  Completá tus datos, seleccioná cargo y sede, copiá el formato
                  y enviá tu CV.
                </p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[12px] text-zinc-500">
                    <span>Progreso de postulación</span>
                    <span className="font-semibold text-orange-700">
                      {progreso}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-orange-500 transition-all"
                      style={{ width: `${progreso}%` }}
                    />
                  </div>
                </div>

                {/* CTA guiados (opcional, súper mobile-friendly) */}
                {/* <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={goToCargos}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-sm font-semibold transition"
                  >
                    <Briefcase className="w-4 h-4" />
                    Elegir cargo
                  </button>
                  <button
                    type="button"
                    onClick={goToSedes}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-sm font-semibold transition"
                  >
                    <Building2 className="w-4 h-4" />
                    Elegir sede
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      scrollToAnchor(previewAnchorRef);
                      pulseSection('preview');
                    }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-orange-50 text-zinc-700 text-sm font-semibold transition"
                  >
                    <Mail className="w-4 h-4 text-orange-600" />
                    Ver preview
                  </button>
                </div> */}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="p-6 sm:p-8 grid grid-cols-1  gap-6">
              {/* Left: Form */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Enviar a
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-5 h-5 text-orange-600" />
                      <span className="text-zinc-900 font-semibold font-messina">
                        {EMAIL_TO}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        safeCopy(EMAIL_TO)
                          .then(() => setCopied(true))
                          .catch(() => {})
                      }
                      className="text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-orange-50 text-orange-700 transition"
                    >
                      Copiar correo
                    </button>
                  </div>

                  <div className="mt-3 text-[12px] text-zinc-500 font-messina">
                    Si tenes problema para generar el correo, envianos
                    directamente a mi-cv@hammer.ar
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[12px] text-zinc-600 flex items-center gap-2">
                      <User className="w-4 h-4 text-orange-600" /> Nombre
                      completo
                    </label>
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej: Juan Peréz"
                      className={cn(
                        'w-full rounded-2xl px-4 py-3 bg-white border outline-none text-zinc-900 font-messina',
                        'focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition',
                        nombre.trim().length > 1
                          ? 'border-zinc-200'
                          : 'border-orange-300'
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') goToCargos();
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[12px] text-zinc-600 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-orange-600" /> Celular
                    </label>
                    <input
                      value={celular}
                      onChange={(e) => setCelular(e.target.value)}
                      placeholder="Ej: +54 381 555-1234"
                      className={cn(
                        'w-full rounded-2xl px-4 py-3 bg-white border outline-none text-zinc-900 font-messina',
                        'focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition',
                        celular.trim().length > 5
                          ? 'border-zinc-200'
                          : 'border-orange-300'
                      )}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') goToCargos();
                      }}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[12px] text-zinc-600 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-orange-600" />{' '}
                      Instagram (opcional)
                    </label>
                    <input
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="Ej: @tuusuario"
                      className="w-full rounded-2xl px-4 py-3 bg-white border border-zinc-200 outline-none text-zinc-900 font-messina focus:ring-4 focus:ring-orange-100 focus:border-orange-300 transition"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') goToCargos();
                      }}
                    />
                  </div>
                </div>

                {/* Anchor Cargo */}
                <div ref={cargoAnchorRef} />

                <motion.div
                  animate={
                    pulse === 'cargo' ? { scale: [1, 1.01, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  className={cn(
                    pulse === 'cargo'
                      ? 'ring-4 ring-orange-200 rounded-2xl'
                      : ''
                  )}
                >
                  <Section
                    title="Seleccionar cargo"
                    icon={Briefcase}
                    open={openCargos}
                    onToggle={() => {
                      const next = !openCargos;
                      setOpenCargos(next);
                      if (next) {
                        setTimeout(() => {
                          scrollToAnchor(cargoAnchorRef);
                          pulseSection('cargo');
                        }, 60);
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CARGOS.map((c) => (
                        <Chip
                          key={c}
                          active={cargo === c}
                          onClick={() => onPickCargo(c)}
                        >
                          {c}
                        </Chip>
                      ))}
                    </div>

                    <div className="mt-3 text-[12px] text-zinc-500 font-messina flex items-center gap-2">
                      <Info className="w-4 h-4 text-orange-600" />
                      Tip: elegí una opción y te llevamos automáticamente al
                      siguiente paso.
                    </div>
                  </Section>
                </motion.div>

                {/* Anchor Sede */}
                <div ref={sedeAnchorRef} />

                <motion.div
                  animate={
                    pulse === 'sede' ? { scale: [1, 1.01, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  className={cn(
                    pulse === 'sede' ? 'ring-4 ring-orange-200 rounded-2xl' : ''
                  )}
                >
                  <Section
                    title="Seleccionar sede"
                    icon={Building2}
                    open={openSedes}
                    onToggle={() => {
                      const next = !openSedes;
                      setOpenSedes(next);
                      if (next) {
                        setTimeout(() => {
                          scrollToAnchor(sedeAnchorRef);
                          pulseSection('sede');
                        }, 60);
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SEDES.map((s) => (
                        <Chip
                          key={s}
                          active={sede === s}
                          onClick={() => onPickSede(s)}
                        >
                          {s}
                        </Chip>
                      ))}
                    </div>
                  </Section>
                </motion.div>
              </div>

              {/* Right: Preview */}
              {/* <div className="space-y-4">
                <div ref={previewAnchorRef} />

                <motion.div
                  animate={
                    pulse === 'preview' ? { scale: [1, 1.01, 1] } : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  className={cn(
                    pulse === 'preview'
                      ? 'ring-4 ring-orange-200 rounded-2xl'
                      : ''
                  )}
                >
                  <div className="rounded-2xl border -mt-4 border-zinc-200 bg-white shadow-sm p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                          Preview del mensaje
                        </div>
                        <div className="mt-1 text-[12px] text-zinc-500 font-messina">
                          Asunto:{' '}
                          <span className="text-orange-700 font-semibold">
                            {subject}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={copiarFormatoMail}
                        className={cn(
                          'inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition text-sm',
                          copied
                            ? 'bg-orange-50 border-orange-300 text-orange-800'
                            : 'bg-white border-zinc-200 text-orange-700 hover:bg-orange-50'
                        )}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>

                    <pre className="mt-4 whitespace-pre-wrap rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-sm text-zinc-800 font-messina leading-relaxed max-h-[260px] overflow-auto">
                      {bodyText}
                    </pre>

                    {copyError && (
                      <div className="mt-3 text-[12px] text-orange-800 bg-orange-50 border border-orange-200 rounded-2xl p-3 font-messina">
                        {copyError}
                      </div>
                    )}

                    <div className="mt-4 text-[12px] text-zinc-500 font-messina">
                      Recordatorio: adjuntá tu CV (PDF recomendado) antes de
                      enviar.
                    </div>
                  </div>
                </motion.div>

                <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm p-4">
                  <div className="text-[12px] text-zinc-600 font-messina">
                    Si tu celular no abre el mail automáticamente, copiá el
                    texto del preview y enviá manualmente a{' '}
                    <span className="text-orange-700 font-semibold">
                      {EMAIL_TO}
                    </span>
                    .
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          {/* Sticky footer actions */}
          <div className="border-t border-zinc-200 p-4 sm:p-6 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={abrirMail}
                disabled={!canOpenMail}
                className={cn(
                  'w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-semibold transition',
                  canOpenMail
                    ? 'bg-orange-600 hover:bg-orange-700 text-white'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                )}
              >
                <Mail className="w-5 h-5" />
                Abrir correo y enviar
              </button>
            </div>

            {!canOpenMail && (
              <div className="mt-3 text-[12px] text-zinc-500 font-messina">
                Para habilitar el envío, completá:{' '}
                <span className="text-orange-700 font-semibold">
                  Nombre, Celular, Cargo y Sede
                </span>
                .
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
