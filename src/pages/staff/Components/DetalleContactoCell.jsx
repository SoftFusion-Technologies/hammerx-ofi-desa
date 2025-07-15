import { FiZoomIn } from 'react-icons/fi';

export default function DetalleContactoCell({ detalle, onShowDetalle }) {
  const maxChars = 28;
  if (!detalle)
    return (
      <span className="italic text-gray-400 bg-gray-100 rounded-full px-3 py-1 text-xs whitespace-nowrap">
        sin detalle
      </span>
    );
  const isTruncated = detalle.length > maxChars;
  const shortDetalle = isTruncated
    ? detalle.slice(0, maxChars) + '...'
    : detalle;

  return (
    <span
      className={`inline-flex items-center gap-1 cursor-pointer text-xs md:text-sm font-semibold truncate max-w-[160px] ${
        isTruncated ? 'text-blue-700 hover:underline' : 'text-gray-700'
      }`}
      onClick={() => isTruncated && onShowDetalle(detalle)}
      tabIndex={isTruncated ? 0 : -1}
      title={detalle}
      style={{ minWidth: 0, maxWidth: '160px', outline: 'none' }}
    >
      {shortDetalle}
      {isTruncated && (
        <FiZoomIn className="ml-1 text-[#fc4b08] hover:scale-125 transition" />
      )}
    </span>
  );
}
