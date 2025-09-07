// FilterToolbar.jsx
import { useEffect, useMemo, useState } from 'react';
import DebouncedSearchInput from './DebouncedSearchInput';
import { FilterChip } from './FilterChip';
import { QuickFilters } from './QuickFilters';

export default function FilterToolbar({
  // estado y setters actuales:
  search,
  setSearch,
  tipoFiltro,
  setTipoFiltro,
  canalFiltro,
  setCanalFiltro,
  actividadFiltro,
  setActividadFiltro,
  convertidoFiltro,
  setConvertidoFiltro,
  comisionFiltro,
  setComisionFiltro,
  alertaFiltro,
  setAlertaFiltro,
  selectedSede,
  setSelectedSede,
  mes,
  setMes,
  anio,
  setAnio,
  onExportClick,
  counts // { all, convertidos, comision, alerta }  <- opcional
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Persistencia (simple) en localStorage
  useEffect(() => {
    const payload = {
      search,
      tipoFiltro,
      canalFiltro,
      actividadFiltro,
      convertidoFiltro,
      comisionFiltro,
      alertaFiltro,
      selectedSede
    };
    localStorage.setItem('prospectos.filters', JSON.stringify(payload));
  }, [
    search,
    tipoFiltro,
    canalFiltro,
    actividadFiltro,
    convertidoFiltro,
    comisionFiltro,
    alertaFiltro,
    selectedSede
  ]);

  useEffect(() => {
    const raw = localStorage.getItem('prospectos.filters');
    if (raw) {
      try {
        const f = JSON.parse(raw);
        setSearch(f.search ?? '');
        setTipoFiltro(f.tipoFiltro ?? '');
        setCanalFiltro(f.canalFiltro ?? '');
        setActividadFiltro(f.actividadFiltro ?? '');
        setConvertidoFiltro(f.convertidoFiltro ?? '');
        setComisionFiltro(f.comisionFiltro ?? '');
        setAlertaFiltro(f.alertaFiltro ?? '');
        setSelectedSede(f.selectedSede ?? '');
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeChips = useMemo(() => {
    const arr = [];
    if (search)
      arr.push({
        k: 'search',
        label: `Busca: "${search}"`,
        clear: () => setSearch('')
      });
    if (selectedSede)
      arr.push({
        k: 'sede',
        label: `Sede: ${selectedSede}`,
        clear: () => setSelectedSede('')
      });
    if (tipoFiltro)
      arr.push({
        k: 'tipo',
        label: `Tipo: ${tipoFiltro}`,
        clear: () => setTipoFiltro('')
      });
    if (canalFiltro)
      arr.push({
        k: 'canal',
        label: `Canal: ${canalFiltro}`,
        clear: () => setCanalFiltro('')
      });
    if (actividadFiltro)
      arr.push({
        k: 'actividad',
        label: `Actividad: ${actividadFiltro}`,
        clear: () => setActividadFiltro('')
      });
    if (convertidoFiltro)
      arr.push({
        k: 'conv',
        label: `Convertidos: ${convertidoFiltro === 'si' ? 'Sí' : 'No'}`,
        clear: () => setConvertidoFiltro('')
      });
    if (comisionFiltro)
      arr.push({
        k: 'comi',
        label: `Comisión: ${comisionFiltro === 'con' ? 'Con' : 'Sin'}`,
        clear: () => setComisionFiltro('')
      });
    if (alertaFiltro)
      arr.push({
        k: 'alerta',
        label: `Alertas`,
        clear: () => setAlertaFiltro('')
      });
    return arr;
  }, [
    search,
    selectedSede,
    tipoFiltro,
    canalFiltro,
    actividadFiltro,
    convertidoFiltro,
    comisionFiltro,
    alertaFiltro,
    setSearch,
    setSelectedSede,
    setTipoFiltro,
    setCanalFiltro,
    setActividadFiltro,
    setConvertidoFiltro,
    setComisionFiltro,
    setAlertaFiltro
  ]);

  const anyFilter = activeChips.length > 0;

  const clearAll = () => {
    setSearch('');
    setSelectedSede('');
    setTipoFiltro('');
    setCanalFiltro('');
    setActividadFiltro('');
    setConvertidoFiltro('');
    setComisionFiltro('');
    setAlertaFiltro('');
  };

  // atajo teclado: Ctrl/Cmd + K para focus búsqueda
  useEffect(() => {
    const fn = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      if (
        (isMac && e.metaKey && e.key.toLowerCase() === 'k') ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        const el = document.getElementById('search');
        el?.focus();
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  return (
    <section className="mb-6 max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header: métricas + acciones */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-800">Prospectos</h3>
          {counts && (
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-gray-100 text-gray-700 rounded-full px-2 py-1">
                Total: {counts.all}
              </span>
              <span className="bg-green-100 text-green-700 rounded-full px-2 py-1">
                Conv: {counts.convertidos}
              </span>
              <span className="bg-sky-100 text-sky-700 rounded-full px-2 py-1">
                Comi: {counts.comision}
              </span>
              <span className="bg-yellow-100 text-yellow-800 rounded-full px-2 py-1">
                Alertas: {counts.alerta}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportClick}
            className="px-3 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
          >
            Exportar Excel
          </button>
          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition"
            aria-expanded={showAdvanced}
          >
            {showAdvanced ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
      </div>

      {/* Search + Quick pills */}
      <div className="px-5 pt-5">
        <DebouncedSearchInput value={search} onChange={setSearch} />
        <div className="mt-3">
          <QuickFilters
            totals={
              counts || { all: 0, convertidos: 0, comision: 0, alerta: 0 }
            }
            setConvertidoFiltro={setConvertidoFiltro}
            setComisionFiltro={setComisionFiltro}
            setAlertaFiltro={setAlertaFiltro}
          />
        </div>
      </div>

      {/* Chips activos */}
      {anyFilter && (
        <div className="px-5 mt-4 flex flex-wrap items-center gap-2">
          {activeChips.map((c) => (
            <FilterChip key={c.k} label={c.label} onClear={c.clear} />
          ))}
          <button
            onClick={clearAll}
            className="ml-auto text-xs underline text-gray-500 hover:text-gray-700"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Advanced filters */}
      {showAdvanced && (
        <div className="px-5 pb-5 pt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mes/Año */}
          <div className="md:col-span-3">
            <div className="flex flex-wrap gap-3 items-center">
              <label className="text-sm text-gray-600">Período</label>
              <input
                type="number"
                min={1}
                max={12}
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                min={2023}
                max={2099}
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
                className="w-28 border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Sede */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todas</option>
              <option value="monteros">Monteros</option>
              <option value="concepcion">Concepción</option>
              <option value="smt">Barrio Sur</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tipo Prospecto
            </label>
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todos</option>
              <option value="Nuevo">Nuevo</option>
              <option value="ExSocio">ExSocio</option>
            </select>
          </div>

          {/* Canal */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Canal Contacto
            </label>
            <select
              value={canalFiltro}
              onChange={(e) => setCanalFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todos</option>
              <option value="Mostrador">Mostrador</option>
              <option value="Whatsapp">Whatsapp</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="Pagina web">Página web</option>
              <option value="Campaña">Campaña</option>
              <option value="Comentarios/Stickers">Comentarios/Stickers</option>
            </select>
          </div>

          {/* Actividad */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Actividad
            </label>
            <select
              value={actividadFiltro}
              onChange={(e) => setActividadFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todas</option>
              <option value="No especifica">No especifica</option>
              <option value="Musculacion">Musculación</option>
              <option value="Pilates">Pilates</option>
              <option value="Clases grupales">Clases grupales</option>
              <option value="Pase full">Pase full</option>
            </select>
          </div>

          {/* Convertidos */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Convertidos
            </label>
            <select
              value={convertidoFiltro}
              onChange={(e) => setConvertidoFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todos</option>
              <option value="si">Solo convertidos</option>
              <option value="no">No convertidos</option>
            </select>
          </div>

          {/* Comisión */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Comisión
            </label>
            <select
              value={comisionFiltro}
              onChange={(e) => setComisionFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todas</option>
              <option value="con">Con comisión</option>
              <option value="sin">Sin comisión</option>
            </select>
          </div>

          {/* Alertas */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Alertas
            </label>
            <select
              value={alertaFiltro}
              onChange={(e) => setAlertaFiltro(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <option value="">Todas</option>
              <option value="con-alerta">Con alerta</option>
            </select>
          </div>
        </div>
      )}
    </section>
  );
}
