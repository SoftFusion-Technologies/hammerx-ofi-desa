import React, { useState, useRef, useEffect } from 'react';
import {
  FiTrash2,
  FiXCircle,
  FiLoader,
  FiCalendar,
  FiAlertTriangle,
  FiUser,
  FiCheckCircle
} from 'react-icons/fi';

const ModalBorradoMasivo = ({
  open,
  onClose,
  onConfirmMesAnio,
  onConfirmUsuario,
  getRecaptacion,
  fetchColaboradores,
  colaboradores = []
}) => {
  const [opcion, setOpcion] = useState('mesanio'); // "mesanio" o "usuario"
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState('');
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMes('');
      setAnio('');
      setUsuario('');
      setMensaje('');
      setOpcion('mesanio');
      setTimeout(() => {
        inputRef.current && inputRef.current.focus();
      }, 200);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    setLoading(true);

    try {
      let res;
      if (opcion === 'mesanio') {
        if (!mes || !anio) {
          setMensaje('Selecciona mes y año');
          setLoading(false);
          return;
        }
        res = await onConfirmMesAnio(mes, anio);
      } else {
        if (!usuario) {
          setMensaje('Selecciona un usuario');
          setLoading(false);
          return;
        }
        res = await onConfirmUsuario(usuario);
      }

      if (res?.data?.vacio) {
        setMensaje('No se encontraron registros para borrar.');
        setLoading(false);
      } else {
        setMensaje('¡Registros eliminados correctamente!');
        setTimeout(() => {
          getRecaptacion();
          fetchColaboradores();
          setLoading(false);
          setMensaje('');
          onClose();
        }, 1000);
      }
    } catch (err) {
      setMensaje(
        'Error al borrar: ' + (err?.response?.data?.mensajeError || err.message)
      );
      setLoading(false);
    }
  };

  if (!open) return null;

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-[2.5px] transition-all">
      <div
        className="
      w-full max-w-xl mx-auto rounded-[2.5rem] shadow-2xl border-2 border-[#fc4b08]/60
      bg-gradient-to-br from-[#191818ed] via-[#292929f7] to-[#1d0a00ef] relative animate-modal-in
      px-0 pb-0 pt-2
    "
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-7 right-8 bg-[#222]/70 hover:bg-[#fc4b08] text-[#fc4b08] hover:text-white rounded-full p-3 text-3xl shadow-xl transition-all duration-200 z-20 focus:outline-none"
          aria-label="Cerrar"
        >
          <FiXCircle />
        </button>

        {/* Title & Description */}
        <div className="px-10 pt-8 pb-1 flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="rounded-full bg-[#fc4b08]/25 p-4 text-4xl text-[#fc4b08] shadow-md">
              <FiTrash2 />
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-[#fc4b08] font-bignoodle drop-shadow-lg">
              Borrado Masivo de Registros
            </h2>
          </div>
          <span className="text-base text-orange-100/80 text-center font-semibold tracking-wide">
            Selecciona <b>el tipo de borrado</b> y completa los datos.
            <br />
            <span className="text-orange-300">
              ¡Esta acción no se puede deshacer!
            </span>
          </span>
        </div>

        {/* Opción de borrado */}
        <div className="flex px-10 gap-3 mt-5 mb-1">
          <button
            type="button"
            className={`flex-1 py-3 rounded-2xl font-extrabold text-lg border-2 transition-all duration-200
          ${
            opcion === 'mesanio'
              ? 'bg-[#fc4b08] text-white border-[#fc4b08] shadow-lg'
              : 'bg-[#181818] text-orange-200 border-[#fc4b08]/30 hover:bg-[#232323] hover:border-[#fc4b08]'
          }
        `}
            onClick={() => setOpcion('mesanio')}
            tabIndex={0}
          >
            <FiCalendar className="inline mr-2" /> Por Mes/Año
          </button>
          <button
            type="button"
            className={`flex-1 py-3 rounded-2xl font-extrabold text-lg border-2 transition-all duration-200
          ${
            opcion === 'usuario'
              ? 'bg-[#fc4b08] text-white border-[#fc4b08] shadow-lg'
              : 'bg-[#181818] text-orange-200 border-[#fc4b08]/30 hover:bg-[#232323] hover:border-[#fc4b08]'
          }
        `}
            onClick={() => setOpcion('usuario')}
            tabIndex={0}
          >
            <FiUser className="inline mr-2" /> Por Usuario
          </button>
        </div>

        {/* Formulario dinámico */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 px-10 py-7"
        >
          {/* Inputs según la opción */}
          {opcion === 'mesanio' && (
            <div className="flex gap-3 w-full">
              <div className="flex-1 relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fc4b08]" />
                <select
                  ref={inputRef}
                  className="w-full p-3 pl-11 rounded-xl border-2 border-[#fc4b08]/60 bg-[#212121]/90 text-white shadow-inner focus:border-[#fc4b08] text-lg"
                  value={mes}
                  onChange={(e) => setMes(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Mes</option>
                  {[...Array(12).keys()].map((i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} -{' '}
                      {new Date(0, i).toLocaleString('es-AR', {
                        month: 'long'
                      })}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                className="flex-1 p-3 rounded-xl border-2 border-[#fc4b08]/60 bg-[#212121]/90 text-white shadow-inner focus:border-[#fc4b08] text-lg"
                placeholder="Año (ej: 2025)"
                min={2020}
                max={2100}
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {opcion === 'usuario' && (
            <div className="flex-1 relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fc4b08]" />
              <select
                ref={inputRef}
                className="w-full p-3 pl-11 rounded-xl border-2 border-[#fc4b08]/60 bg-[#212121]/90 text-white shadow-inner focus:border-[#fc4b08] text-lg"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecciona un usuario</option>
                {colaboradores.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} (ID: {u.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botón principal */}
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
            {opcion === 'mesanio'
              ? 'Borrar registros de mes/año'
              : 'Borrar registros del usuario'}
          </button>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div
              className={`text-center font-bold text-lg flex items-center justify-center gap-1 min-h-[2.5rem] ${msgClass}`}
            >
              {messageIcon} {mensaje}
            </div>
          )}
        </form>

        {/* Advertencia final */}
        <div className="px-10 pb-7 pt-2">
          <div className="bg-[#fc4b08]/20 rounded-xl px-4 py-3 text-sm text-orange-100 text-center font-semibold shadow-inner">
            <FiAlertTriangle className="inline mr-2 text-[#fc4b08]" />
            <span>
              {opcion === 'mesanio' ? (
                <>
                  Borrarás <b>todos los registros</b> del mes y año elegidos.
                </>
              ) : (
                <>
                  Borrarás <b>todos los registros</b> del usuario elegido.
                </>
              )}
              <br />
              <span className="text-orange-200/80">
                Esta acción es <b>irreversible</b>. Por favor, revisá bien antes
                de confirmar.
              </span>
            </span>
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
    `}
      </style>
    </div>
  );
};

export default ModalBorradoMasivo;
