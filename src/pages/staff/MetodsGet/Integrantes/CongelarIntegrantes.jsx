/*
 * Programador: Benjamin Orellana
 * (Actualización) Integración con congelamiento mensual (endpoint nuevo)
 *
 * Componente: CongelarIntegrantes.jsx
 *
 * Objetivo:
 * - Leer estado real del mes (abierto / congelado) desde el backend.
 * - Ejecutar POST /congelamientos/:convenio_id/congelar
 * - Evitar “recargar la web”: refrescar estado + permitir callback al padre.
 *
 * Notas:
 * - El backend congela SOLO el “mes abierto” (último snapshot). Si estás viendo otro mes,
 *   se deshabilita el botón y se informa cuál es el mes abierto.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Helpers
const pad2 = (n) => String(n).padStart(2, '0');

const toMonthStart = (d) => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  return `${y}-${m}-01 00:00:00`;
};

const parseMonthStartLabel = (monthStart) => {
  // monthStart: 'YYYY-MM-01 00:00:00'
  const s = String(monthStart || '').trim();
  const m = s.match(/^(\d{4})-(\d{2})-01/);
  if (!m) return '—';
  return `${m[2]}/${m[1]}`; // MM/YYYY
};

const CongelarIntegrantes = ({
  id_conv,
  selectedMonth,
  selectedYear,
  monthCursor,
  monthStart: monthStartProp,
  onChanged,
  meta: metaFromParent
}) => {
  const convenioIdNum = Number(id_conv);

  // Determinar “mes visible”
  const visibleMonthStart = useMemo(() => {
    if (typeof monthStartProp === 'string' && monthStartProp.trim())
      return monthStartProp;

    // Si monthCursor es Date
    if (monthCursor instanceof Date && !Number.isNaN(monthCursor.getTime())) {
      return toMonthStart(monthCursor);
    }

    // Si selectedMonth es Date
    if (
      selectedMonth instanceof Date &&
      !Number.isNaN(selectedMonth.getTime())
    ) {
      return toMonthStart(selectedMonth);
    }

    // selectedMonth numérico + year (o año actual)
    const y =
      Number.isFinite(Number(selectedYear)) && Number(selectedYear) > 1900
        ? Number(selectedYear)
        : new Date().getFullYear();

    const m =
      Number.isFinite(Number(selectedMonth)) && Number(selectedMonth) >= 0
        ? Number(selectedMonth) + 1
        : new Date().getMonth() + 1;

    return `${y}-${pad2(m)}-01 00:00:00`;
  }, [monthStartProp, monthCursor, selectedMonth, selectedYear]);

  const [metaLocal, setMetaLocal] = useState(metaFromParent || null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  // Si el padre pasa meta, lo usamos; si cambia, lo reflejamos.
  useEffect(() => {
    if (metaFromParent) setMetaLocal(metaFromParent);
  }, [metaFromParent]);

  const fetchMeta = useCallback(async () => {
    if (!Number.isFinite(convenioIdNum) || convenioIdNum <= 0) return;

    try {
      setBooting(true);

      // Reutilizamos el endpoint de integrantes que devuelve meta:
      // GET /integrantes?id_conv=...&monthStart=...
      const { data } = await axios.get(`${API_URL}/integrantes`, {
        params: {
          id_conv: convenioIdNum,
          monthStart: visibleMonthStart
        }
      });

      setMetaLocal(data?.meta || null);
    } catch (err) {
      console.log('CongelarIntegrantes.fetchMeta error:', err);
    } finally {
      setBooting(false);
    }
  }, [convenioIdNum, visibleMonthStart]);

  useEffect(() => {
    // Si el padre no pasó meta, lo buscamos.
    if (!metaFromParent) fetchMeta();
    else setBooting(false);
  }, [fetchMeta, metaFromParent]);

  const openMonth = metaLocal?.openMonth || null; // 'YYYY-MM-01 00:00:00'
  const isFrozen = !!metaLocal?.isFrozen;
  const isOpenMonth = !!metaLocal?.isOpenMonth;

  const visibleLabel = parseMonthStartLabel(visibleMonthStart);

  const monthKey = (s) => (s ? String(s).slice(0, 7) : null); // "2026-01"
  const monthLabel = (s) => {
    const k = monthKey(s);
    if (!k) return '—';
    const [y, m] = k.split('-');
    return `${m}/${y}`; // 01/2026
  };

  const openLabel = monthLabel(openMonth);

  const canFreezeAction =
    Number.isFinite(convenioIdNum) && convenioIdNum > 0 && isOpenMonth;

  const parseMonthKeyLabel = (s) => {
    if (!s) return '—';
    const m = String(s).match(/^(\d{4})-(\d{2})/);
    if (!m) return String(s);
    return `${m[2]}/${m[1]}`; // MM/YYYY
  };

  const safeStatusMessage = (err) => {
    const status = err?.response?.status;
    const data = err?.response?.data;

    const serverMsg =
      data?.mensajeError ||
      data?.error ||
      data?.message ||
      err?.message ||
      'Error inesperado.';

    // En tu backend, para 403 a veces viene openMonth/currentMonth
    if (status === 403) {
      const om = data?.openMonth ? parseMonthKeyLabel(data.openMonth) : null;
      const cm = data?.currentMonth
        ? parseMonthKeyLabel(data.currentMonth)
        : null;

      if (om || cm) {
        return `${serverMsg}${om ? `\nMes abierto: ${om}` : ''}${
          cm ? `\nMes actual: ${cm}` : ''
        }`;
      }
    }

    if (status === 409) {
      // Mes ya congelado o el mes siguiente ya existe
      return serverMsg;
    }

    return serverMsg;
  };

  const handleFreeze = async () => {
    if (!canFreezeAction) {
      await Swal.fire({
        title: 'No disponible',
        text: openMonth
          ? `Solo podés congelar el mes abierto (${openLabel}).`
          : 'No se pudo determinar el mes abierto.',
        icon: 'info'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: isFrozen ? 'Mes ya congelado' : 'Congelar mes abierto',
      html: isFrozen
        ? `<div style="opacity:.9">El mes abierto (<b>${openLabel}</b>) ya está congelado.</div>`
        : `<div style="opacity:.9">
             Vas a congelar el mes abierto <b>${openLabel}</b>.<br/>
             El sistema clonará integrantes al mes siguiente .
           </div>`,
      icon: isFrozen ? 'info' : 'warning',
      showCancelButton: true,
      confirmButtonText: isFrozen ? 'Entendido' : 'Sí, congelar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
      confirmButtonColor: isFrozen ? '#64748b' : '#f97316'
    });

    if (!confirm.isConfirmed || isFrozen) return;

    try {
      setLoading(true);

      Swal.fire({
        title: 'Procesando...',
        text: 'Congelando mes y validando reglas',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading()
      });

      // POST /congelamientos/:convenio_id/congelar
      // Enviamos vencimiento/openMonth por compatibilidad (si el backend lo usa).
      await axios.post(`${API_URL}/congelamientos/${convenioIdNum}/congelar`, {
        vencimiento: openMonth
      });

      await Swal.fire({
        title: 'Listo',
        text: `Mes abierto ${openLabel} congelado correctamente.`,
        icon: 'success',
        timer: 1900,
        showConfirmButton: false
      });

      // 1) Refrescar meta local
      await fetchMeta();

      // 2) Avisar al padre si quiere refrescar lista / totales / meta
      if (typeof onChanged === 'function') {
        try {
          await onChanged();
        } catch (e) {
          // No cortamos el flujo por un error del callback
          console.log('CongelarIntegrantes.onChanged error:', e);
        }
      }
    } catch (err) {
      const msg = safeStatusMessage(err);

      await Swal.fire({
        title: 'No se pudo congelar',
        html: `<div style="text-align:left; white-space:pre-line; opacity:.9">${msg}</div>`,
        icon: 'error'
      });

      await fetchMeta();
    } finally {
      setLoading(false);
    }
  };

  const visibleFrozen = !!isFrozen; // isFrozen de meta del mes visible

  const openFrozen =
    monthKey(openMonth) === monthKey(visibleMonthStart) ? visibleFrozen : false;

  return (
    <div className="flex items-center gap-3">
      {/* Chip info */}
      <div className="hidden sm:flex flex-col">
        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
          Mes visible:{' '}
          <span className="text-white/80 font-semibold">{visibleLabel}</span>
          <span
            className={`ml-2 inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-extrabold ring-1 ${
              visibleFrozen
                ? 'bg-slate-500/15 text-slate-200 ring-slate-400/20'
                : 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20'
            }`}
          >
            {booting ? '...' : visibleFrozen ? 'congelado' : 'editable'}
          </span>
        </div>

        <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">
          Mes abierto:{' '}
          <span className="text-white/80 font-semibold">{openLabel}</span>
          <span
            className={`ml-2 inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-extrabold ring-1 ${
              openFrozen
                ? 'bg-slate-500/15 text-slate-200 ring-slate-400/20'
                : 'bg-emerald-500/15 text-emerald-200 ring-emerald-400/20'
            }`}
          >
            {booting ? '...' : openFrozen ? 'congelado' : 'editable'}
          </span>
        </div>
      </div>

      {/* Acción */}
      <button
        type="button"
        onClick={handleFreeze}
        disabled={loading || booting || !canFreezeAction || isFrozen}
        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-extrabold transition shadow-[0_18px_45px_rgba(0,0,0,0.25)] ring-1 ${
          loading || booting
            ? 'bg-white/10 text-white/40 ring-white/10 cursor-wait'
            : !canFreezeAction
            ? 'bg-white/10 text-white/40 ring-white/10 cursor-not-allowed'
            : isFrozen
            ? 'bg-slate-500/20 text-slate-200 ring-slate-400/20 cursor-not-allowed'
            : 'bg-orange-500/90 hover:bg-orange-500 text-orange-950 ring-orange-400/25'
        }`}
        title={
          !canFreezeAction
            ? openMonth
              ? `Solo se puede congelar el mes abierto (${openLabel}).`
              : 'Solo se puede congelar el mes abierto.'
            : isFrozen
            ? 'Este mes ya está congelado.'
            : 'Congelar mes abierto'
        }
      >
        {isFrozen ? 'Mes congelado' : loading ? 'Congelando…' : 'Congelar mes'}
      </button>
    </div>
  );
};

export default CongelarIntegrantes;
