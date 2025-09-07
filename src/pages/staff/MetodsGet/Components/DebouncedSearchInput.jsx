// DebouncedSearchInput.jsx
import { useEffect, useState } from 'react';

export default function DebouncedSearchInput({ value, onChange, delay = 300 }) {
  const [inner, setInner] = useState(value ?? '');

  useEffect(() => setInner(value ?? ''), [value]);

  useEffect(() => {
    const id = setTimeout(() => onChange(inner), delay);
    return () => clearTimeout(id);
  }, [inner, delay, onChange]);

  return (
    <div className="relative">
      <input
        id="search"
        type="text"
        value={inner}
        onChange={(e) => setInner(e.target.value)}
        placeholder="Buscar por nombre… (⌘/Ctrl + K)"
        className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm
                   focus:outline-none focus:ring-2 focus:ring-emerald-500 transition
                   placeholder-gray-400"
      />
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="absolute left-3 top-2.5 h-5 w-5 opacity-60"
      >
        <path
          d="M10 18a8 8 0 1 1 5.293-14.293L21 9.414 19.586 10.828l-5.707-5.707A6 6 0 1 0 10 16a5.96 5.96 0 0 0 3.98-1.52l1.42 1.42A7.96 7.96 0 0 1 10 18Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
