import { useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function getPaginationRange(current, total, siblingCount = 1, edgeCount = 1) {
  const range = [];
  const start = Math.max(current - siblingCount, 1);
  const end = Math.min(current + siblingCount, total);

  // Siempre incluir bordes
  const leftEdgeEnd = Math.min(edgeCount, total);
  const rightEdgeStart = Math.max(total - edgeCount + 1, 1);

  // Izquierda
  for (let i = 1; i <= leftEdgeEnd; i++) range.push(i);
  if (start > leftEdgeEnd + 1) range.push('…');

  // Ventana central
  for (
    let i = Math.max(start, leftEdgeEnd + 1);
    i <= Math.min(end, rightEdgeStart - 1);
    i++
  ) {
    if (!range.includes(i)) range.push(i);
  }

  // Derecha
  if (end < rightEdgeStart - 1) range.push('…');
  for (let i = rightEdgeStart; i <= total; i++) {
    if (!range.includes(i)) range.push(i);
  }

  return range;
}

export default function Pagination({
  currentPage,
  totalPages,
  onChange,
  siblingCount = 1, // páginas a cada lado del current
  edgeCount = 1 // primeras/últimas visibles siempre
}) {
  const pages = useMemo(
    () => getPaginationRange(currentPage, totalPages, siblingCount, edgeCount),
    [currentPage, totalPages, siblingCount, edgeCount]
  );

  const go = (n) => onChange?.(Math.min(Math.max(n, 1), totalPages));

  return (
    <nav className="flex flex-col items-center gap-3 my-6">
      {/* Compacto en móvil */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08]/90 hover:text-white disabled:opacity-40 transition shadow flex items-center"
        >
          <FiChevronLeft />
        </button>
        <span className="text-sm font-semibold">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08]/90 hover:text-white disabled:opacity-40 transition shadow flex items-center"
        >
          <FiChevronRight />
        </button>
      </div>

      {/* Completo en >= sm */}
      <div className="hidden sm:flex justify-center items-center gap-2">
        <button
          className="px-4 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08] hover:text-white disabled:opacity-40 transition flex items-center gap-2 shadow"
          onClick={() => go(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <FiChevronLeft /> Prev
        </button>

        {pages.map((item, idx) =>
          item === '…' ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-500">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => go(item)}
              className={`min-w-10 px-4 py-2 rounded-full font-bold transition ${
                currentPage === item
                  ? 'bg-[#d35400] text-white shadow-lg'
                  : 'bg-orange-50 hover:bg-orange-200'
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          className="px-4 py-2 rounded-full font-bold bg-orange-50 hover:bg-[#fc4b08] hover:text-white disabled:opacity-40 transition flex items-center gap-2 shadow"
          onClick={() => go(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next <FiChevronRight />
        </button>
      </div>
    </nav>
  );
}
