// QuickFilters.jsx
export function QuickFilters({
  totals, // { all, convertidos, comision, alerta }
  setConvertidoFiltro,
  setComisionFiltro,
  setAlertaFiltro
}) {
  const Pill = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1.5 rounded-full text-xs border transition',
        active
          ? 'bg-emerald-600 text-white border-emerald-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      ].join(' ')}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill
        onClick={() => {
          setConvertidoFiltro('');
          setComisionFiltro('');
          setAlertaFiltro('');
        }}
      >
        Todos <span className="ml-2 opacity-70">({totals.all})</span>
      </Pill>
      <Pill onClick={() => setConvertidoFiltro('si')}>
        Convertidos{' '}
        <span className="ml-2 opacity-70">({totals.convertidos})</span>
      </Pill>
      <Pill onClick={() => setComisionFiltro('con')}>
        Comisión <span className="ml-2 opacity-70">({totals.comision})</span>
      </Pill>
      <Pill onClick={() => setAlertaFiltro('con-alerta')}>
        Alertas <span className="ml-2 opacity-70">({totals.alerta})</span>
      </Pill>
    </div>
  );
}
