import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function VendedorComisionesPanel({ user }) {
  // Guardas "blandas" mientras llega el user
  if (!user) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="rounded-3xl p-8 bg-neutral-200 animate-pulse h-40" />
      </div>
    );
  }

  const isVendedor = String(user.level || '').toLowerCase() === 'vendedor';
  const vendedorId = user?.id;
  const nombre = user?.name || 'Vendedor/a';

  // Si no es vendedor, mostramos una notita (para debug). Sacalo si querés.
  if (!isVendedor) {
    return (
      <div className="max-w-5xl mx-auto text-sm text-neutral-600">
        Este panel es solo para perfil <b>vendedor</b>. Rol actual:{' '}
        <code>{String(user.level || '-')}</code>
      </div>
    );
  }

  const ahora = new Date();
  const [mes, setMes] = useState(ahora.getMonth() + 1);
  const [anio, setAnio] = useState(ahora.getFullYear());

  const [resumen, setResumen] = useState(null);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  const fetchResumen = async () => {
    try {
      const { data } = await axios.get(
        'http://localhost:8080/ventas-comisiones/resumen',
        {
          params: { vendedor_id: vendedorId, mes, anio }
        }
      );
      setResumen(data);
      setErrMsg('');
    } catch (e) {
      setErrMsg(
        e?.response?.data?.mensajeError ||
          e.message ||
          'Error al cargar resumen'
      );
    }
  };

  const fetchListado = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        'http://localhost:8080/ventas-comisiones/vendedor',
        {
          params: {
            vendedor_id: vendedorId,
            estado: 'aprobado', // solo azules por defecto
            mes,
            anio,
            page: p,
            limit
          }
        }
      );
      setItems(data.items || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
      setErrMsg('');
    } catch (e) {
      setErrMsg(
        e?.response?.data?.mensajeError || e.message || 'Error al cargar lista'
      );
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!vendedorId) return;
    fetchResumen();
    fetchListado(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendedorId, mes, anio]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const fmtMoney = (value, currency = 'ARS') => {
    const n = Number(value ?? 0);
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency
      }).format(n);
    } catch {
      // fallback si la moneda fuese rara
      return new Intl.NumberFormat('es-AR').format(n);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header motivacional (texto en BLANCO) */}
      {/* Banner compacto vendedor */}
      <div className="rounded-2xl p-4 md:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white shadow-lg ring-1 ring-white/10">
        {/* Fila 1: saludo + total */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
              {/* ícono simple */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <div>
              <h2 className="text-base md:text-lg font-semibold leading-tight">
                ¡Hola {nombre.split(' ')[0]}!
              </h2>
              <p className="text-xs md:text-sm text-white/85">
                ¿List@ para vender y ayudar a más personas?
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <div className="rounded-xl bg-white/15 px-3 py-2 ring-1 ring-white/20 text-right">
              <div className="text-[11px] uppercase tracking-wide text-white/80">
                Este mes acumulado
              </div>
              <div className="text-2xl md:text-3xl font-extrabold tabular-nums">
                {resumen
                  ? fmtMoney(
                      resumen.total_mensual_aprobado,
                      resumen.moneda || 'ARS'
                    )
                  : fmtMoney(0, 'ARS')}
              </div>
              {/* opcional: badge de moneda */}
              <div className="mt-1 text-[10px] text-white/70">
                {resumen?.moneda || 'ARS'}
              </div>
            </div>
          </div>
        </div>

        {/* Fila 2: controles compactos */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-lg bg-white/12 px-2 py-1 ring-1 ring-white/20">
            <button
              type="button"
              onClick={() => {
                let m = mes - 1;
                let y = anio;
                if (m < 1) {
                  m = 12;
                  y = y - 1;
                }
                setMes(m);
                setAnio(y);
              }}
              className="px-2 py-1 text-white/90 hover:bg-white/10 rounded-md"
              title="Mes anterior"
            >
              ‹
            </button>
            <span className="px-2 text-sm font-medium">
              {String(mes).padStart(2, '0')}/{anio}
            </span>
            <button
              type="button"
              onClick={() => {
                let m = mes + 1;
                let y = anio;
                if (m > 12) {
                  m = 1;
                  y = y + 1;
                }
                setMes(m);
                setAnio(y);
              }}
              className="px-2 py-1 text-white/90 hover:bg-white/10 rounded-md"
              title="Mes siguiente"
            >
              ›
            </button>
          </div>

          {/* Inputs “ocultos” en desktop por si quieren editar directo */}
          <div className="flex items-center gap-1 text-[12px] md:text-xs">
            <input
              type="number"
              min={1}
              max={12}
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-16 rounded-md px-2 py-1 bg-white/15 text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40"
              aria-label="Mes"
            />
            <input
              type="number"
              min={2023}
              max={2099}
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-20 rounded-md px-2 py-1 bg-white/15 text-white placeholder-white/60 outline-none ring-1 ring-white/20 focus:ring-2 focus:ring-white/40"
              aria-label="Año"
            />
          </div>

          {/* Etiqueta sutil de contexto */}
          <span className="ml-auto text-[11px] md:text-xs text-white/85">
            Suma de comisiones <b>aprobadas</b> por coordinación
          </span>
        </div>
      </div>

      {/* Mensaje de error (si hay) */}
      {errMsg && (
        <div className="mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-sm">
          {errMsg}
        </div>
      )}

      {/* Listado de comisiones */}
      {/* <div className="mt-6 rounded-2xl overflow-hidden ring-1 ring-neutral-800 bg-neutral-950 text-white">
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between">
          <div className="font-medium">Tus comisiones aprobadas</div>
          <div className="text-xs text-neutral-400">
            Total: {total} &middot; Página {page} de {totalPages}
          </div>
        </div>

        <div className="divide-y divide-neutral-900">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 grid md:grid-cols-3 gap-4">
                <div className="h-4 w-40 bg-neutral-800 rounded" />
                <div className="h-4 w-60 bg-neutral-800 rounded" />
                <div className="h-4 w-28 bg-neutral-800 rounded md:ml-auto" />
              </div>
            ))
          ) : items.length === 0 ? (
            <div className="px-4 py-12 text-center text-neutral-300">
              No tenés comisiones aprobadas en este período.
            </div>
          ) : (
            items.map((row) => {
              const fecha = row.aprobado_at || row.created_at;
              return (
                <div key={row.id} className="px-4 py-4">
                  <div className="grid md:grid-cols-3 gap-2 md:gap-4">
                    <div className="text-sm">
                      <div className="text-neutral-400">Fecha</div>
                      <div className="font-medium">
                        {fecha ? new Date(fecha).toLocaleString() : '-'}
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-neutral-400">Prospecto</div>
                      <div className="font-medium">
                        {row?.prospecto?.nombre || '-'}
                      </div>
                      <div className="text-xs text-neutral-400">
                        DNI: {row?.prospecto?.dni || '-'}
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-neutral-400">Vendedor</div>
                          <div className="text-neutral-200">
                            {row?.vendedor?.name || `#${row.vendedor_id}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-neutral-400">Sede</div>
                          <div className="capitalize text-neutral-200">
                            {row.sede}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-sm md:text-right">
                      <div className="text-neutral-400">Plan</div>
                      <div className="font-medium">
                        {row.tipo_plan}
                        {row.tipo_plan === 'Otros' && row.tipo_plan_custom ? (
                          <span className="text-xs text-neutral-400">
                            {' '}
                            — {row.tipo_plan_custom}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-2 text-neutral-400">Monto</div>
                      <div className="text-xl font-bold tabular-nums">
                        {row.monto_comision != null
                          ? `$ ${Number(row.monto_comision).toFixed(2)}`
                          : '-'}
                      </div>

                      <div className="mt-2 inline-flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30">
                          ● aprobado
                        </span>
                        <span className="text-neutral-400">
                          {row.moneda || 'ARS'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="px-4 py-3 border-t border-neutral-800 flex items-center justify-between text-sm">
          <button
            onClick={() => fetchListado(Math.max(1, page - 1))}
            disabled={page <= 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-200 disabled:opacity-50"
          >
            Anterior
          </button>
          <div className="text-neutral-400">
            Página {page} de {totalPages}
          </div>
          <button
            onClick={() => fetchListado(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages || loading}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 text-neutral-200 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div> */}
    </div>
  );
}
