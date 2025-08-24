import React, { useEffect, useMemo, useRef } from 'react';
import '../../../../styles/MetodsGet/GetUserId.css';

const Chip = ({ children, color = 'gray', title }) => {
  const palette = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
    violet: 'bg-violet-100 text-violet-700'
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${palette[color]}`}
    >
      {children}
    </span>
  );
};

const Row = ({ label, children }) => (
  <p className="flex items-center gap-2">
    <span className="font-semibold min-w-[130px]">{label}</span>
    <span className="text-gray-800">{children}</span>
  </p>
);

const formatFecha = (fecha) => {
  const d = new Date(fecha);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${day}/${m}/${y} ${hh}:${mm}:${ss}`;
};

const mmYY = (mes, anio) =>
  mes && anio ? `${String(mes).padStart(2, '0')}/${anio}` : '—';

const estadoChip = (prospecto) => {
  if (prospecto === 'socio') return <Chip color="green">Socio</Chip>;
  if (prospecto === 'prospecto') return <Chip color="blue">Prospecto</Chip>;
  return <Chip color="violet">Nuevo</Chip>;
};

const convertidoChip = (c) =>
  c === 'c' ? <Chip color="orange">C activa</Chip> : <Chip>—</Chip>;

/**
 * Regla UI: lo consideramos "amarillo este mes" si
 *  - el registro es del mes/año vigentes
 *  - y es socio proveniente de 'nuevo' o 'prospecto_c' (según tu backend)
 */
const useAmarilloEsteMes = (alumno) => {
  const now = new Date();
  const mesNow = now.getMonth() + 1;
  const anioNow = now.getFullYear();
  const esMesVigente = alumno?.mes === mesNow && alumno?.anio === anioNow;
  const esSocio = alumno?.prospecto === 'socio';
  const vieneDeConversion = !!alumno?.socio_origen; // 'nuevo' | 'prospecto_c'
  return esMesVigente && esSocio && vieneDeConversion;
};

const useModalA11y = (isOpen, onClose, containerRef) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement;
    const first = containerRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    first?.focus?.();
    return () => previouslyFocused?.focus?.();
  }, [isOpen, containerRef]);
};

const AlumnoDetails = ({ alumno, isOpen, onClose /*, setSelectedAlumn */ }) => {
  const modalRef = useRef(null);
  useModalA11y(isOpen, onClose, modalRef);

  const amarilloEsteMes = useAmarilloEsteMes(alumno);

  const origenLabel = useMemo(() => {
    if (alumno?.socio_origen === 'prospecto_c') return 'Prospecto con P C';
    if (alumno?.socio_origen === 'nuevo') return 'Nuevo';
    return '—';
  }, [alumno?.socio_origen]);

  const timeline = useMemo(() => {
    // Construimos un pequeño “stepper” textual
    if (alumno?.prospecto === 'socio' && alumno?.socio_origen) {
      const origenMes = mmYY(alumno.socio_origen_mes, alumno.socio_origen_anio);
      const socioMesActual = mmYY(alumno.mes, alumno.anio);
      const origenChip =
        alumno.socio_origen === 'prospecto_c' ? (
          <Chip color="orange" title="2 asistencias (P C)">
            P&nbsp;C
          </Chip>
        ) : (
          <Chip color="violet">Nuevo</Chip>
        );
      return (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] md:text-sm text-gray-700 leading-tight min-w-0">
          <span className="text-gray-500 shrink-0">Conversión:</span>

          <span className="shrink-0">{origenChip}</span>
          <span className="text-gray-500 shrink-0">({origenMes})</span>

          <span className="text-gray-400 shrink-0">→</span>

          <span className="shrink-0">
            <Chip color="green">Socio</Chip>
          </span>
          <span className="text-gray-500 shrink-0">({socioMesActual})</span>

          {amarilloEsteMes && (
            <span className="shrink-0">
              <Chip
                color="yellow"
                title="Marcado en alumnos_nuevos durante el mes"
              >
                Amarillo
              </Chip>
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="text-sm text-gray-500">Sin datos de conversión</span>
    );
  }, [alumno, amarilloEsteMes]);

  if (!isOpen || !alumno) return null;

  const handleClose = () => onClose?.();
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onMouseDown={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="alumno-details-title"
    >
      <div
        ref={modalRef}
        className={`modal-content w-[min(720px,92vw)] rounded-2xl bg-white shadow-2xl p-6 outline-none
          ${amarilloEsteMes ? 'ring-2 ring-yellow-400' : ''}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h2
            id="alumno-details-title"
            className="font-bignoodle tracking-wide text-[22px] text-[#fc4b08] flex items-center gap-2"
          >
            Detalles del Alumno
            {amarilloEsteMes && (
              <Chip color="yellow">Amarillo (mes vigente)</Chip>
            )}
          </h2>
          <button
            onClick={handleClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition"
          >
            Cerrar
          </button>
        </div>

        {/* Top card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">
                {alumno.nombre}
              </div>
              <div className="flex items-center gap-2">
                {estadoChip(alumno.prospecto)}
                {convertidoChip(alumno.c)}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-2 gap-y-0.5">
                <span>
                  <span className="text-gray-500">Fecha de creación:</span>{' '}
                  <time
                    dateTime={new Date(alumno.fecha_creacion).toISOString()}
                  >
                    {formatFecha(alumno.fecha_creacion)}
                  </time>
                </span>

                <span className="hidden sm:inline text-gray-400">·</span>

                <span>
                  <span className="text-gray-500">Registro (mes/año):</span>{' '}
                  <span className="whitespace-nowrap">
                    {mmYY(alumno.mes, alumno.anio)}
                  </span>
                </span>
              </div>
            </div>

            {/* Timeline */}
            <div className="mt-3">{timeline}</div>
          </div>

          <div className="rounded-xl border border-gray-100 p-4">
            <Row label="ID:">{alumno.id}</Row>
            <Row label="Email:">
              {alumno.email ? (
                <a
                  href={`mailto:${alumno.email}`}
                  className="text-blue-600 hover:underline break-all [overflow-wrap:anywhere] inline-block max-w-full"
                >
                  {alumno.email}
                </a>
              ) : (
                '—'
              )}
            </Row>

            <Row label="Celular:">
              {alumno.celular ? (
                <a
                  href={`tel:${alumno.celular}`}
                  className="text-blue-600 hover:underline"
                >
                  {alumno.celular}
                </a>
              ) : (
                '—'
              )}
            </Row>
            <Row label="Punto D:">{alumno.punto_d || '—'}</Row>
          </div>
        </div>

        {/* Origen de socio */}
        <div className="rounded-xl border border-gray-100 p-4 mb-4">
          <div className="mb-2 text-sm font-semibold text-gray-900">
            Origen de socio
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Row label="Tipo:">
              {alumno.prospecto === 'socio' ? (
                <>
                  {alumno.socio_origen ? (
                    alumno.socio_origen === 'prospecto_c' ? (
                      <Chip color="orange" title="2 asistencias (P C)">
                        Prospecto con P C
                      </Chip>
                    ) : (
                      <Chip color="violet">Nuevo</Chip>
                    )
                  ) : (
                    '—'
                  )}
                </>
              ) : (
                <span className="text-gray-500">—</span>
              )}
            </Row>
            <Row label="Mes conversión:">
              {alumno.prospecto === 'socio' && alumno.socio_origen
                ? mmYY(alumno.socio_origen_mes, alumno.socio_origen_anio)
                : '—'}
            </Row>
          </div>
        </div>

        {/* Observaciones */}
        <div className="rounded-xl border border-gray-100 p-4">
          <div className="mb-2 text-sm font-semibold text-gray-900">
            Observaciones
          </div>
          <div className="text-gray-800 text-sm whitespace-pre-wrap">
            {alumno.motivo || '—'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumnoDetails;
