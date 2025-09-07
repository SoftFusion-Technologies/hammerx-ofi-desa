// FilterChip.jsx
export function FilterChip({ label, onClear }) {
  return (
    <span
      className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700
                      border border-emerald-200 rounded-full px-3 py-1 text-xs"
    >
      {label}
      <button
        onClick={onClear}
        className="rounded-full hover:bg-emerald-100 transition px-1.5"
        title="Quitar filtro"
      >
        ✕
      </button>
    </span>
  );
}
