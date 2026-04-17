const Cargando = ({
  mensaje = "Cargando datos...",
  submensaje = "",
  compacto = false,
  fullscreen = false,
  className = "",
}) => {
  const spinner = (
    <span
      className={`rounded-full border-orange-500 border-t-transparent animate-spin ${
        compacto ? "w-4 h-4 border-2" : "w-6 h-6 border-[3px]"
      }`}
    />
  );

  if (fullscreen) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-orange-50/40 px-4 ${className}`}
      >
        <div className="w-full max-w-md rounded-3xl border border-orange-100 bg-white/90 backdrop-blur shadow-xl px-6 py-8 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-orange-50 ring-4 ring-orange-100">
            <span className="w-8 h-8 rounded-full border-[3px] border-orange-500 border-t-transparent animate-spin" />
          </div>

          <h2 className="text-lg md:text-xl font-bold text-gray-800">
            {mensaje}
          </h2>

          {submensaje && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              {submensaje}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (compacto) {
    return (
      <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
        {spinner}
        <span className="text-sm font-medium">{mensaje}</span>
      </div>
    );
  }

  return (
    <div
      className={`w-full rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 flex items-center justify-center gap-3 ${className}`}
    >
      {spinner}
      <div className="text-center">
        <p className="text-sm font-semibold text-orange-700">{mensaje}</p>
        {submensaje && (
          <p className="text-xs text-orange-600/80 mt-0.5">{submensaje}</p>
        )}
      </div>
    </div>
  );
};

export default Cargando;