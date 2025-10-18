import { motion } from 'framer-motion';
import firstNameOf from './js/firstName.js';
import { useEffect, useMemo, useState } from 'react';

const easeOut = [0.16, 1, 0.3, 1];

const formDrop = {
  hidden: { opacity: 0, y: -80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: easeOut,
      when: 'beforeChildren',
      delayChildren: 0.35,
      staggerChildren: 0.18
    }
  },
  exit: { opacity: 0, y: 80, transition: { duration: 0.4, ease: easeOut } }
};

const itemUp = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } }
};

export default function PerfilForm({
  perfil,
  setPerfil,
  onSubmit,
  saved,
  firstName
}) {
  const { edad, sexo, altura } = perfil;
  const complete = !!(edad && sexo && altura);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (saved) setOpenModal(true);
  }, [saved]);

  const nameForCopy =
    firstName ||
    firstNameOf(localStorage.getItem('sf_nombre') || '') ||
    '¡hey!';

  const pretty = useMemo(() => {
    const parts = [];
    if (edad) parts.push(`Edad: ${edad} años`);
    if (sexo) parts.push(`Sexo: ${sexo}`);
    if (altura) {
      const m = String(altura).replace(',', '.');
      const fixed = isFinite(+m) ? (+m).toFixed(2) : m;
      parts.push(`Altura: ${fixed} m`);
    }
    return parts.join(' · ');
  }, [edad, sexo, altura]);

  const subtitle = useMemo(
    () => `Por último, ${nameForCopy}, necesitamos estos datos`,
    [nameForCopy]
  );
  const setField = (field) => (val) =>
    setPerfil((p) => ({ ...p, [field]: val }));

  return (
    <motion.form
      onSubmit={onSubmit}
      variants={formDrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto w-full max-w-lg"
    >
      {/* Marco blanco con acento naranja */}
      <div className="relative rounded-3xl p-[1px]">
        <div className="rounded-3xl bg-white ring-1 ring-zinc-200">
          <div className="rounded-3xl p-6 transition-shadow duration-300 hover:shadow-[0_0_35px_-10px_rgba(251,146,60,0.45)]">
            {/* Título */}
            <motion.h2
              variants={itemUp}
              className="uppercase text-center text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl"
            >
              Un último paso
            </motion.h2>

            {/* Subtítulo */}
            <motion.p
              variants={itemUp}
              className="mt-2 text-center text-sm text-zinc-600"
            >
              {subtitle}
            </motion.p>

            <div className="mt-6 grid gap-5">
              {/* Edad */}
              <div className="grid gap-2">
                <motion.label
                  variants={itemUp}
                  className="text-sm text-zinc-700"
                >
                  Edad
                </motion.label>
                <motion.input
                  variants={itemUp}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={edad}
                  onChange={(e) =>
                    setField('edad')(e.target.value.replace(/\D/g, ''))
                  }
                  placeholder="Ej: 22"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              {/* Sexo */}
              <div className="grid gap-2">
                <motion.label
                  variants={itemUp}
                  className="text-sm text-zinc-700"
                >
                  Sexo
                </motion.label>

                <motion.div variants={itemUp} className="flex gap-3">
                  {['F', 'M', 'X'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setField('sexo')(s)}
                      className={`rounded-2xl border px-4 py-2 text-sm transition-all
                        ${
                          sexo === s
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-[0_8px_30px_-12px_rgba(251,146,60,0.45)]'
                            : 'border-zinc-300 bg-white text-zinc-700 hover:border-orange-300 hover:bg-orange-50/50'
                        }`}
                      aria-pressed={sexo === s}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Altura */}
              <div className="grid gap-2">
                <motion.label
                  variants={itemUp}
                  className="text-sm text-zinc-700"
                >
                  Altura (m)
                </motion.label>
                <motion.input
                  variants={itemUp}
                  value={altura}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/[^0-9.,]/g, '')
                      .replace(',', '.');
                    setField('altura')(val);
                  }}
                  placeholder="Ej: 1.60"
                  className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none placeholder:text-zinc-400
                             focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                />
              </div>

              {/* Hint */}
              <motion.div
                variants={itemUp}
                initial={false}
                animate={{ opacity: complete ? 1 : 0, y: complete ? 0 : 6 }}
                className="text-xs text-orange-600/90"
              >
                Tip: cuando esté completo, presioná{' '}
                <span className="font-semibold">Enter</span> para guardar.
              </motion.div>

              {/* Botón */}
              <motion.button
                variants={itemUp}
                type="submit"
                disabled={!complete}
                className={`group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-3 font-medium text-white transition-all
                  ${
                    complete
                      ? 'bg-orange-600 hover:bg-orange-500 shadow-[0_8px_30px_-10px_rgba(251,146,60,0.55)] hover:shadow-[0_12px_45px_-10px_rgba(251,146,60,0.75)] focus:outline-none focus:ring-2 focus:ring-orange-500/60'
                      : 'bg-orange-500/40 cursor-not-allowed opacity-60'
                  }`}
              >
                <span className="absolute inset-0 -z-10 rounded-2xl ring-1 ring-inset ring-orange-300/30 transition-opacity group-hover:ring-orange-200/50" />
                Guardar
              </motion.button>

              {/* Saved */}
              {saved && (
                <motion.div
                  key="saved-perfil"
                  variants={itemUp}
                  initial="hidden"
                  animate="show"
                  className="text-center text-sm text-orange-600"
                >
                  ¡Listo! Perfil guardado en el dispositivo.
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.form>
  );
}
