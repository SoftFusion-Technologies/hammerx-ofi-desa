// ReviewStep.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';

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

export default function ReviewStep({
  fullName,
  dni,
  onConfirm,
  onUpdateName,
  onUpdateDni
}) {
  const [edit, setEdit] = useState({ nombre: false, dni: false });
  const [draft, setDraft] = useState({
    nombre: fullName || '',
    dni: dni || ''
  });

  const toggle = (field, on = undefined) =>
    setEdit((e) => ({ ...e, [field]: on === undefined ? !e[field] : on }));

  const saveNombre = () => {
    const v = (draft.nombre || '').trim();
    if (!v) return;
    onUpdateName?.(v);
    localStorage.setItem('sf_nombre', v);
    toggle('nombre', false);
  };

  const saveDni = () => {
    const v = (draft.dni || '').replace(/\D/g, '');
    if (!v) return;
    onUpdateDni?.(v);
    localStorage.setItem('sf_dni', v);
    toggle('dni', false);
  };

  const EditBtn = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="ml-auto inline-flex items-center gap-1 rounded-xl border border-zinc-300
                 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-orange-300 hover:text-orange-700"
      title="Editar"
    >
      ✎ Editar
    </button>
  );

  const ActionRow = ({ onSave, onCancel, canSave = true }) => (
    <div className="mt-3 flex gap-2">
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        className={`rounded-xl px-3 py-1.5 text-xs font-medium text-white transition-all
          ${
            canSave
              ? 'bg-orange-600 hover:bg-orange-500 shadow-[0_8px_30px_-10px_rgba(251,146,60,0.55)] focus:outline-none focus:ring-2 focus:ring-orange-500/60'
              : 'bg-orange-500/40 cursor-not-allowed opacity-60'
          }`}
      >
        Guardar
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs text-zinc-700 transition-colors hover:border-zinc-400 hover:text-zinc-900"
      >
        Cancelar
      </button>
    </div>
  );

  const prettyDni = (dni || '')
    .replace(/\D/g, '')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return (
    <motion.div
      variants={formDrop}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto w-full max-w-lg"
    >
      <div className="relative rounded-3xl p-[1px]">
        <div className="rounded-3xl bg-white ring-1 ring-zinc-200">
          <div className="rounded-3xl p-6 transition-shadow duration-300 hover:shadow-[0_0_35px_-10px_rgba(251,146,60,0.35)]">
            <motion.h2
              variants={itemUp}
              className="text-center text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl"
            >
              Revisá tus datos
            </motion.h2>
            <motion.p
              variants={itemUp}
              className="mt-2 text-center text-sm text-zinc-600"
            >
              Asegurate de que estén correctos antes de continuar.
            </motion.p>

            <div className="mt-6 grid gap-3">
              {/* NOMBRE */}
              <motion.div
                variants={itemUp}
                className="rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-xs uppercase text-zinc-500">
                      Nombre
                    </div>
                    {!edit.nombre ? (
                      <div className="mt-1 text-base">{fullName || '-'}</div>
                    ) : (
                      <input
                        autoFocus
                        value={draft.nombre}
                        onChange={(e) =>
                          setDraft((d) => ({ ...d, nombre: e.target.value }))
                        }
                        className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none
                                   placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                        placeholder="Tu nombre completo"
                      />
                    )}
                  </div>
                  {!edit.nombre ? (
                    <EditBtn onClick={() => toggle('nombre', true)} />
                  ) : null}
                </div>
                {edit.nombre && (
                  <ActionRow
                    onSave={saveNombre}
                    onCancel={() => {
                      setDraft((d) => ({ ...d, nombre: fullName || '' }));
                      toggle('nombre', false);
                    }}
                    canSave={!!draft.nombre.trim()}
                  />
                )}
              </motion.div>

              {/* DNI */}
              <motion.div
                variants={itemUp}
                className="rounded-2xl border border-zinc-300 bg-white p-4 text-zinc-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-xs uppercase text-zinc-500">
                      Documento (DNI)
                    </div>
                    {!edit.dni ? (
                      <div className="mt-1 text-base">
                        {dni ? prettyDni : '-'}
                      </div>
                    ) : (
                      <input
                        autoFocus
                        inputMode="numeric"
                        value={draft.dni}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            dni: e.target.value.replace(/\D/g, '')
                          }))
                        }
                        className="mt-1 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none
                                   placeholder:text-zinc-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/25"
                        placeholder="Ej: 30123456"
                      />
                    )}
                  </div>
                  {!edit.dni ? (
                    <EditBtn
                      onClick={() => {
                        setDraft((d) => ({ ...d, dni: dni || '' }));
                        toggle('dni', true);
                      }}
                    />
                  ) : null}
                </div>
                {edit.dni && (
                  <ActionRow
                    onSave={saveDni}
                    onCancel={() => {
                      setDraft((d) => ({ ...d, dni: dni || '' }));
                      toggle('dni', false);
                    }}
                    canSave={!!draft.dni}
                  />
                )}
              </motion.div>

              {/* CTA FINAL */}
              <motion.button
                variants={itemUp}
                type="button"
                onClick={onConfirm}
                className="group relative mt-2 inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-orange-600 px-5 py-3 font-medium text-white
                           shadow-[0_8px_30px_-10px_rgba(251,146,60,0.55)]
                           transition-all duration-300 hover:bg-orange-500 hover:shadow-[0_12px_45px_-10px_rgba(251,146,60,0.75)]
                           focus:outline-none focus:ring-2 focus:ring-orange-500/60"
              >
                Están correctos
                <span className="ml-1 transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </motion.button>

              <motion.p
                variants={itemUp}
                className="text-center text-xs text-zinc-500"
              >
                Si te equivocaste, podés ajustar cada dato acá mismo.
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
