import React, { useEffect, useMemo, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { FaTimes, FaCheck, FaWhatsapp } from 'react-icons/fa';

const cleanPhone = (v = '') => v.replace(/[^0-9]/g, '');
const limit = (v = '', max = 500) => v.slice(0, max);

const Chip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm border transition
      ${
        active
          ? 'bg-zinc-900 text-white border-zinc-900'
          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
      }`}
  >
    {children}
  </button>
);

const ModalCargarQueja = ({
  isOpen,
  onClose,
  alumno, // { id, nombre, celular, ... }
  instructor, // { email, sede, level }
  apiBase = 'http://localhost:8080',
  onSuccess // callback después de guardar
}) => {
  const dialogRef = useRef(null);

  const [nombre, setNombre] = useState(alumno?.nombre || '');
  const [contacto, setContacto] = useState(alumno?.celular || '');
  const [tipoUsuario, setTipoUsuario] = useState('cliente'); // cliente|socio|colaborador
  const [motivo, setMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);

  const sede = instructor?.sede || 'Multisede';
  const cargado_por = instructor?.email || '';

  useEffect(() => {
    if (isOpen) {
      setNombre(alumno?.nombre || '');
      setContacto(alumno?.celular || '');
      setTipoUsuario('cliente');
      setMotivo('');
      // focus al primer input:
      setTimeout(() => {
        dialogRef.current?.querySelector('input')?.focus();
      }, 20);
      // Esc para cerrar
      const onEsc = (e) => e.key === 'Escape' && onClose?.();
      window.addEventListener('keydown', onEsc);
      return () => window.removeEventListener('keydown', onEsc);
    }
  }, [isOpen, alumno, onClose]);

  const valido = useMemo(() => {
    return nombre?.trim()?.length > 0 && motivo?.trim()?.length > 0;
  }, [nombre, motivo]);

  const openToast = (title, icon = 'success') => {
    Swal.fire({
      title,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true
    });
  };

  const payloadBase = {
    fecha: new Date(),
    cargado_por,
    nombre: nombre.trim(),
    tipo_usuario: tipoUsuario,
    contacto: cleanPhone(contacto),
    motivo: motivo.trim(),
    resuelto: 0,
    resuelto_por: null,
    fecha_resuelto: null,
    sede,
    creado_desde_qr: false
  };

  const guardar = async ({ abrirWhats = false } = {}) => {
    if (!valido || enviando) return;
    try {
      setEnviando(true);
      const headers = {
        'Content-Type': 'application/json',
        'x-user-email': instructor?.email || '',
        'x-user-level': instructor?.level || '',
        'x-user-sede': instructor?.sede || ''
      };

      await axios.post(`${apiBase}/quejas`, payloadBase, { headers });

      openToast('Queja registrada');
      onSuccess?.(); // refrescar listas si hace falta
      onClose?.();

      if (abrirWhats && payloadBase.contacto) {
        const url = `https://wa.me/${
          payloadBase.contacto
        }?text=${encodeURIComponent(
          'Hola! Te escribo sobre tu consulta/queja.'
        )}`;
        window.open(url, '_blank', 'noopener');
      }
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'No se pudo registrar la queja.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full sm:w-[520px] max-w-[92%] rounded-2xl bg-white shadow-2xl overflow-hidden"
      >
        {/* header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-800">
              Cargar queja
            </h3>
            <p className="text-xs text-zinc-500">
              Sede: <strong>{sede}</strong> • Cargado por:{' '}
              <strong>{cargado_por}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        {/* body */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-xs text-zinc-600 mb-1">Nombre</label>
            <input
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Nombre de la persona"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-600 mb-1">Contacto</label>
            <input
              className="w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
              placeholder="Teléfono / WhatsApp"
              inputMode="numeric"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
            />
            <p className="mt-1 text-[11px] text-zinc-500">
              Se limpiarán caracteres no numéricos automáticamente.
            </p>
          </div>

          <div>
            <label className="block text-xs text-zinc-600 mb-2">
              Tipo de usuario
            </label>
            <div className="flex flex-wrap gap-2">
              {['socio', 'prospecto', 'nuevo'].map((t) => (
                <Chip
                  key={t}
                  active={tipoUsuario === t}
                  onClick={() => setTipoUsuario(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs text-zinc-600 mb-1">Motivo</label>
              <span
                className={`text-[11px] ${
                  motivo.length > 480 ? 'text-red-600' : 'text-zinc-500'
                }`}
              >
                {motivo.length}/500
              </span>
            </div>
            <textarea
              className="w-full h-28 rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 resize-y"
              placeholder="Describí el motivo con claridad…"
              value={motivo}
              onChange={(e) => setMotivo(limit(e.target.value, 500))}
            />
            <ul className="mt-2 text-[11px] text-zinc-500 list-disc pl-5 space-y-1">
              <li>No incluyas datos sensibles innecesarios.</li>
              <li>
                Podés editar esta queja más tarde si sos coordinador o el
                creador.
              </li>
            </ul>
          </div>
        </div>

        {/* footer */}
        <div className="px-5 py-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="text-[11px] text-zinc-500">
            ID alumno: <strong>{alumno?.id ?? '—'}</strong>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              onClick={() => guardar({ abrirWhats: true })}
              disabled={!valido || enviando || !cleanPhone(contacto)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white
                ${
                  !valido || enviando || !cleanPhone(contacto)
                    ? 'bg-emerald-300 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              title={
                !cleanPhone(contacto)
                  ? 'Agregá un contacto para abrir WhatsApp'
                  : 'Guardar y abrir WhatsApp'
              }
            >
              <FaWhatsapp /> Guardar + WhatsApp
            </button>

            <button
              onClick={() => guardar({ abrirWhats: false })}
              disabled={!valido || enviando}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white
                ${
                  !valido || enviando
                    ? 'bg-zinc-300 cursor-not-allowed'
                    : 'bg-zinc-900 hover:bg-black'
                }`}
            >
              <FaCheck /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCargarQueja;
