import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaEdit, FaSave, FaTimes, FaTrash, FaEye } from "react-icons/fa";
import { FiUploadCloud, FiFileText, FiCheck } from "react-icons/fi";

  const normalizarUrlComprobante = (valor) => {
    if (!valor) return "";

    const limpia = String(valor).trim();
    if (!limpia) return "";

    if (limpia.startsWith("blob:")) return limpia;
    if (limpia.startsWith("/blob:")) return limpia.slice(1);
    if (limpia.startsWith("http://") || limpia.startsWith("https://")) return limpia;
    if (limpia.startsWith("/")) return `http://localhost:8080${limpia}`;
    return `http://localhost:8080/${limpia}`;
  };

  const obtenerDatosComprobanteExistente = (preventa) => {
    const urlCruda =
      preventa?.comprobante_url_publica || preventa?.comprobante_url || "";

    const url = normalizarUrlComprobante(urlCruda);

    const fileName = url
      ? decodeURIComponent(url.split("/").pop()?.split("?")[0] || "comprobante")
      : "comprobante";

    return {
      url,
      fileName,
      existe: Boolean(url),
    };
  };

const camposFormulario = [
  {
    key: "nombre_apellido",
    label: "Nombre y apellido",
    type: "text",
    editable: true,
  },
  { key: "dni", label: "DNI", type: "text", editable: true },
  {
    key: "fecha_nacimiento",
    label: "Nacimiento",
    type: "date",
    editable: true,
  },
  { key: "correo", label: "Correo", type: "email", editable: true },
  { key: "domicilio", label: "Domicilio", type: "text", editable: true },
  { key: "celular", label: "Celular", type: "text", editable: true },
  { key: "plan_seleccionado", label: "Plan", type: "text", editable: false },
  { key: "duracion_plan", label: "Duracion", type: "text", editable: false },
  {
    key: "modalidad_pago",
    label: "Modalidad de pago",
    type: "text",
    editable: false,
  },
  {
    key: "monto_pactado",
    label: "Monto pactado",
    type: "text",
    editable: false,
  },
  { key: "turno_seleccionado", label: "Turno", type: "text", editable: false },
  { key: "estado_contacto", label: "Estado", type: "text", editable: false },
  {
    key: "observaciones",
    label: "Observaciones",
    type: "text",
    editable: false,
  },
];

const mapearPreventaAFormulario = (preventa) => ({
  nombre_apellido: preventa?.nombre_apellido || "",
  dni: preventa?.dni || "",
  fecha_nacimiento: preventa?.fecha_nacimiento || "",
  correo: preventa?.correo || "",
  domicilio: preventa?.domicilio || "",
  celular: preventa?.celular || "",
  plan_seleccionado: preventa?.plan_seleccionado || "",
  duracion_plan: preventa?.duracion_plan || "",
  modalidad_pago: preventa?.modalidad_pago || "",
  monto_pactado: preventa?.monto_pactado || "",
  turno_seleccionado: preventa?.turno_seleccionado || "-",
  estado_contacto: preventa?.estado_contacto.toUpperCase() || "",
  observaciones: preventa?.observaciones || "",
});

function ModalDetallePreventa({
  isOpen,
  preventa,
  guardando,
  eliminando,
  onClose,
  onSave,
  onDelete,
  onPreviewComprobante,
}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formulario, setFormulario] = useState({});
  const [comprobante, setComprobante] = useState(null);
  const [nombreComprobante, setNombreComprobante] = useState("");

  useEffect(() => {
  if (!isOpen || !preventa) return;

  setModoEdicion(false);
  setFormulario(mapearPreventaAFormulario(preventa));
  setComprobante(null);
  setNombreComprobante("");
}, [isOpen, preventa]);

  const fechaAlta = useMemo(() => {
    if (!preventa?.created_at) return "-";
    try {
      return new Date(preventa.created_at).toLocaleString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      });
    } catch {
      return preventa.created_at;
    }
  }, [preventa]);

  if (!isOpen || !preventa) return null;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => ({ ...prev, [name]: value }));
  };

  const handleComprobante = (e) => {
  const archivo = e.target.files?.[0] || null;
  setComprobante(archivo);
  setNombreComprobante(archivo ? archivo.name : "");
};

  const handleGuardar = () => {
  onSave(preventa.id, formulario, comprobante);
};

  const handleCancelarEdicion = () => {
  setFormulario(mapearPreventaAFormulario(preventa));
  setModoEdicion(false);
  setComprobante(null);
  setNombreComprobante("");
};

  const formatearSiEsNumero = (valor, label) => {
    if (valor === null || valor === "" || String(valor).trim() === "" || label !== "Monto pactado") {
      return valor;
    }

    const numero = Number(valor);

    return Number.isFinite(numero)
      ? numero.toLocaleString('es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      : valor;
  };

  const comprobanteExistente = obtenerDatosComprobanteExistente(preventa);
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-2 bg-gray-900/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-gray-50 w-full max-w-lg md:max-w-7xl rounded-[1.5rem] md:rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden max-h-[96vh] flex flex-col relative"
        >
          <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 border-b border-gray-200 bg-white z-20 shrink-0 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] text-orange-600 font-bold uppercase tracking-[0.2em] mb-0.5">
                Detalle de Preventa
              </span>
              <h3 className="text-gray-900 font-bignoodle text-xl md:text-2xl uppercase leading-none tracking-wider">
                ID {preventa.id} - {preventa.nombre_apellido || "Sin nombre"}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Fecha alta: {fechaAlta}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-all"
            >
              <FaTimes />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-4 md:p-6 pb-8 custom-scrollbar relative">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {camposFormulario.map(
                (campo) =>
                  campo.key !== "observaciones" && (
                    <div key={campo.key}>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
                        {campo.label}
                      </label>
                      <input
                        type={campo.type}
                        name={campo.key}
                        value={
                          modoEdicion
                            ? formulario[campo.key] ?? ""
                            : formatearSiEsNumero(formulario[campo.key] ?? "", campo.label)
                        }
                        onChange={handleInput}
                        disabled={!modoEdicion || !campo.editable}
                        className={`w-full rounded-lg p-2.5 text-sm outline-none transition-all border ${
                          modoEdicion && campo.editable
                            ? "bg-white border-orange-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                            : "bg-gray-100 border-gray-200 text-gray-700"
                        }`}
                      />
                    </div>
                  ),
              )}
            </div>
            <div className="grid grid-cols-1 mt-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
                  Observaciones detalladas por el cliente
                </label>
                <textarea
                  name="observaciones"
                  value={formulario.observaciones ?? ""}
                  disabled
                  className="w-full rounded-lg p-2.5 text-sm outline-none transition-all border bg-gray-100 border-gray-200 text-gray-700 resize-none h-24"
                />
                <div className="grid grid-cols-1 mt-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1 ml-0.5">
                    Comprobante
                  </label>

                  <div className="rounded-xl border border-dashed border-orange-300 bg-orange-50/50 p-3 space-y-2">
                    {comprobanteExistente.existe && !nombreComprobante && (
                      <div className="flex items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-blue-800 truncate">
                            Ya hay un comprobante cargado
                          </p>
                          <p className="text-[10px] text-blue-700 truncate">
                            {comprobanteExistente.fileName}
                          </p>
                        </div>

                        <button
                        type="button"
                        onClick={() => onPreviewComprobante?.(preventa)}
                        className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 hover:bg-blue-100"
                      >
                        <FaEye size={11} />
                        Ver
                      </button>
                      </div>
                    )}

                    <label
                      htmlFor="comprobante-admin"
                      className={`group flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition-all ${
                        modoEdicion
                          ? "cursor-pointer border-orange-200 bg-white hover:border-orange-400 hover:shadow-sm"
                          : "cursor-not-allowed border-gray-200 bg-gray-100 opacity-80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 border border-orange-200 text-orange-600 text-xl">
                          <FiUploadCloud />
                        </div>

                        <div className="flex flex-col min-w-0 text-left leading-tight">
                          <span className="text-xs font-semibold text-gray-800 truncate">
                            {nombreComprobante
                              ? "Nuevo comprobante seleccionado"
                              : comprobanteExistente.existe
                                ? "Reemplazar comprobante"
                                : "Subir comprobante"}
                          </span>
                          <span className="text-[10px] text-gray-500 truncate">
                            Imagen o PDF - solo uno
                          </span>
                        </div>
                      </div>

                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-orange-600">
                        <FiFileText className="text-[10px]" />
                        Seleccionar
                      </div>
                    </label>

                    <input
                      id="comprobante-admin"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleComprobante}
                      disabled={!modoEdicion}
                      className="hidden"
                    />

                    {nombreComprobante && (
                      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-2.5 py-2">
                        <FiCheck className="text-green-600 shrink-0" />
                        <p className="text-[11px] text-green-800 truncate">
                          Se reemplazará por:{" "}
                          <span className="font-semibold">{nombreComprobante}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>
              </div>
            </div>


          <div className="flex flex-wrap justify-between items-center gap-2 px-4 md:px-6 py-4 border-t border-gray-200 bg-white">
            <button
              type="button"
              onClick={() => onDelete(preventa.id)}
              disabled={guardando || eliminando}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-700 disabled:opacity-60"
            >
              <FaTrash size={12} />
              {eliminando ? "Eliminando..." : "Eliminar"}
            </button>

            <div className="flex items-center gap-2">
              {!modoEdicion ? (
                <button
                  type="button"
                  onClick={() => setModoEdicion(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-orange-700 transition-colors hover:bg-orange-100"
                >
                  <FaEdit size={12} />
                  Editar
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancelarEdicion}
                    disabled={guardando || eliminando}
                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-60"
                  >
                    <FaTimes size={12} />
                    Cancelar edicion
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={guardando || eliminando}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#fc4b08] px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-[#df4308] disabled:opacity-60"
                  >
                    <FaSave size={12} />
                    {guardando ? "Guardando..." : "Guardar cambios"}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ModalDetallePreventa;
