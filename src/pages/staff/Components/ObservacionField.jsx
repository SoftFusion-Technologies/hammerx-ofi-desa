import { useEffect, useMemo, useRef, useState } from 'react';
import { FaPen, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

export default function ObservacionField({
  value = '',
  onSave, // async (newVal) => Promise<void>
  placeholder = 'Agregar observación',
  maxLength = 255,
  className = ''
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // autosize
  const autoSize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = el.scrollHeight + 'px';
  };
  useEffect(() => {
    if (editing) autoSize();
  }, [editing, draft]);

  useEffect(() => {
    // si cambia valor desde afuera (p.ej. recarga de fila)
    if (!editing) setDraft(value ?? '');
  }, [value, editing]);

  const remaining = maxLength - (draft?.length ?? 0);
  const counterClass =
    remaining <= 10
      ? 'text-red-600'
      : remaining <= 30
      ? 'text-orange-600'
      : 'text-gray-400';

  const save = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    try {
      setSaving(true);
      setError('');
      await onSave?.(draft);
      setEditing(false);
    } catch (e) {
      setError(e?.message || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value ?? '');
    setEditing(false);
    setError('');
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      save();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancel();
    }
  };

  const chips = useMemo(
    () => ['Llamar mañana', 'No respondió', 'Pidió info por WhatsApp'],
    []
  );

  if (!editing) {
    const hasText = (value ?? '').trim().length > 0;
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        title={hasText ? value : ''}
        className={
          'group w-full text-left px-3 py-2 rounded-lg border ' +
          (hasText
            ? 'border-gray-200 bg-white hover:bg-orange-50'
            : 'border-dashed border-gray-300 bg-white hover:border-orange-400 hover:bg-orange-50') +
          ' transition ' +
          className
        }
      >
        <div className="flex items-center gap-2">
          <span
            className={`flex-1 text-sm ${
              hasText ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            {hasText ? (
              <span className="line-clamp-1">{value}</span>
            ) : (
              placeholder
            )}
          </span>
          <FaPen className="text-gray-400 group-hover:text-[#fc4b08]" />
        </div>
      </button>
    );
  }

  return (
    <div
      className={`relative w-full bg-white border border-orange-300 rounded-xl p-2 shadow-sm ${className}`}
    >
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, maxLength))}
        onKeyDown={handleKeyDown}
        onBlur={save} // autosave al salir
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full resize-none leading-5 text-sm text-gray-800 bg-transparent outline-none"
        rows={1}
      />
      {/* chips opcionales */}
      <div className="mt-2 flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setDraft((prev) => (prev ? `${prev} — ${c}` : c))}
            className="text-xs px-2 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-orange-700"
          >
            {c}
          </button>
        ))}
      </div>

      {/* footer acciones */}
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs ${counterClass}`}>
          {remaining} caracteres
        </span>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600">{error}</span>}
          <button
            type="button"
            onClick={cancel}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1"
          >
            <FaTimes /> Cancelar
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={save}
            disabled={saving}
            className="px-3 py-1.5 text-xs rounded-lg bg-[#fc4b08] hover:bg-[#d94a0a] text-white flex items-center gap-1 disabled:opacity-60"
          >
            {saving ? <FaSpinner className="animate-spin" /> : <FaCheck />}{' '}
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
