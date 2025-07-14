import React, { useState, useRef, useEffect } from 'react';
import {
  FiTrash2,
  FiXCircle,
  FiLoader,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';

const ModalBorradoMasivo = ({ open, onClose, onConfirm, getRecaptacion }) => {
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMes('');
      setAnio('');
      setMensaje('');
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    if (!mes || !anio) {
      setMensaje('Selecciona mes y año');
      return;
    }
    setLoading(true);
    try {
      const res = await onConfirm(mes, anio);
      if (res?.data?.vacio) {
        setMensaje('No se encontraron registros para borrar en ese mes y año.');
        setLoading(false);
      } else {
        setMensaje('¡Registros eliminados correctamente!');
        setTimeout(() => {
          getRecaptacion();
          setLoading(false);
          setMensaje('');
          onClose();
        }, 1100);
      }
    } catch (err) {
      setMensaje(
        'Error al borrar: ' + (err?.response?.data?.mensajeError || err.message)
      );
      setLoading(false);
    }
  };

  if (!open) return null;

  // Mensajes color según estado
  let messageIcon = <FiAlertTriangle className="inline -mt-1 mr-2" />;
  let msgClass = 'text-orange-300';
  if (mensaje.startsWith('¡')) {
    messageIcon = <FiCheckCircle className="inline -mt-1 mr-2" />;
    msgClass = 'text-green-400 animate-success-pop';
  }
  if (mensaje.startsWith('Error')) {
    messageIcon = <FiAlertTriangle className="inline -mt-1 mr-2" />;
    msgClass = 'text-red-400 animate-shake';
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/70 backdrop-blur-[2px]">
      <div
        className="
        w-full max-w-md mx-auto p-0 rounded-3xl relative shadow-2xl border border-[#fc4b08]
        bg-gradient-to-br from-[#191818ee] via-[#292929e0] to-[#1d0a00d6]
        animate-modal-in
        "
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 bg-[#222]/70 hover:bg-[#fc4b08] text-[#fc4b08] hover:text-white rounded-full p-2 text-3xl shadow-lg transition-all duration-150 z-20"
          aria-label="Cerrar"
        >
          <FiXCircle />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-8 py-8">
          {/* Título e ícono */}
          <div className="flex items-center gap-3 mb-2">
            <span className="rounded-full bg-[#fc4b08]/20 p-3 text-3xl text-[#fc4b08] shadow-md">
              <FiTrash2 />
            </span>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#fc4b08] font-bignoodle drop-shadow-xl">
              Borrar registros por mes/año
            </h2>
          </div>

          {/* Inputs */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fc4b08]" />
              <select
                ref={inputRef}
                className="w-full p-3 pl-10 rounded-2xl border-2 border-[#fc4b08]/50 bg-[#212121]/90 text-white shadow-inner focus:outline-none focus:border-[#fc4b08] text-lg"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                disabled={loading}
              >
                <option value="">Mes</option>
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} -{' '}
                    {new Date(0, i).toLocaleString('es-AR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              className="flex-1 p-3 rounded-2xl border-2 border-[#fc4b08]/50 bg-[#212121]/90 text-white shadow-inner focus:outline-none focus:border-[#fc4b08] text-lg"
              placeholder="Año (ej: 2025)"
              min={2020}
              max={2100}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`
              flex items-center justify-center gap-2 bg-gradient-to-r
              from-[#fc4b08] to-[#d35400] hover:brightness-110
              rounded-2xl py-4 mt-2 text-xl font-extrabold shadow-lg
              transition-all duration-150 tracking-wide
              ${
                loading
                  ? 'opacity-60 cursor-wait'
                  : 'hover:scale-105 active:scale-100'
              }
            `}
          >
            {loading ? (
              <FiLoader className="animate-spin text-2xl" />
            ) : (
              <FiTrash2 className="text-2xl" />
            )}
            Borrar mes seleccionado
          </button>

          {/* Mensaje */}
          {mensaje && (
            <div
              className={`text-center font-bold text-lg flex items-center justify-center gap-1 min-h-[2.5rem] ${msgClass}`}
            >
              {messageIcon} {mensaje}
            </div>
          )}
        </form>
        <div className="px-8 pb-6 pt-1">
          <div className="bg-[#fc4b08]/20 rounded-xl px-3 py-2 text-xs text-orange-200 text-center font-semibold">
            <FiAlertTriangle className="inline mr-2 text-[#fc4b08]" />
            Esta acción borra <b>todos los registros</b> del mes y año elegidos.
            Es <b>irreversible</b>.
          </div>
        </div>
      </div>
      <style>
        {`
        .animate-modal-in {
          animation: fadeInBorrarModal .28s cubic-bezier(.55,.08,.53,1.09) both;
        }
        @keyframes fadeInBorrarModal {
          from {opacity: 0; transform: translateY(30px) scale(.97);}
          to   {opacity: 1; transform: none;}
        }
        .animate-success-pop {
          animation: popSuccess .6s cubic-bezier(.17,.67,.83,.67) both;
        }
        @keyframes popSuccess {
          0% {transform: scale(.95);}
          50% {transform: scale(1.07);}
          100% {transform: scale(1);}
        }
        .animate-shake {
          animation: shakeError .28s cubic-bezier(.56,.06,.93,.53) both;
        }
        @keyframes shakeError {
          0% {transform: translateX(0);}
          30% {transform: translateX(-7px);}
          60% {transform: translateX(7px);}
          100% {transform: translateX(0);}
        }
        `}
      </style>
    </div>
  );
};

export default ModalBorradoMasivo;
