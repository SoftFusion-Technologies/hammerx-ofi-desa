/* --Autor: Sergio Manrique
--Fecha de creación: 08-10-2026
--Descripción: Modal informativo que muestra los detalles de la cuenta bancaria de un empleado (CBU, Alias, Banco, etc.). Incluye funcionalidades de "copiado rápido" al portapapeles para campos individuales o para el bloque completo de datos, facilitando la gestión administrativa durante el proceso de transferencia o liquidación.
*/
import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import { FaCopy, FaTimes } from "react-icons/fa";

const normalizarTexto = (valor) => String(valor ?? "").trim();

const formatearValorCuenta = (valor) => {
  const texto = normalizarTexto(valor);
  return texto || "No disponible";
};

const ModalAprobarLiquidacion = ({ abierto, onClose, cuentaBancaria }) => {
  const [copiaActiva, setCopiaActiva] = useState("");

  useEffect(() => {
    if (!abierto) {
      setCopiaActiva("");
    }
  }, [abierto]);

  const detallesCuentaBancaria = useMemo(() => {
    const titular = [
      cuentaBancaria?.titular_nombre,
      cuentaBancaria?.titular_apellido,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return [
      { key: "alias", label: "Alias", value: cuentaBancaria?.alias },
      { key: "banco", label: "Banco", value: cuentaBancaria?.banco },
      { key: "cbu", label: "CBU", value: cuentaBancaria?.cbu },
      { key: "titular", label: "Titular", value: titular },
      {
        key: "dni",
        label: "DNI titular",
        value: cuentaBancaria?.titular_dni,
      },
    ];
  }, [cuentaBancaria]);

  const copiarTexto = async (clave, valor) => {
    const texto = normalizarTexto(valor);
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      setCopiaActiva(clave);
      window.setTimeout(() => {
        setCopiaActiva((actual) => (actual === clave ? "" : actual));
      }, 1200);
    } catch (copyError) {
      console.error("No se pudo copiar al portapapeles", copyError);
      Swal.fire({
        icon: "error",
        title: "No se pudo copiar",
        text: "Tu navegador bloqueó el acceso al portapapeles.",
        confirmButtonColor: "#f97316",
      });
    }
  };

  const copiarTodoDetalleCuenta = async () => {
    const texto = detallesCuentaBancaria
      .map((detalle) => `${detalle.label}: ${formatearValorCuenta(detalle.value)}`)
      .join("\n");

    await copiarTexto("todo", texto);
  };

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar detalle"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="text-base sm:text-lg font-bold text-gray-800">
            Detalle de cuenta bancaria
          </h4>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>

        <div className="space-y-2">
          {detallesCuentaBancaria.map((detalle) => {
            const valor = normalizarTexto(detalle.value);
            const valorDisponible = Boolean(valor);

            return (
              <div
                key={detalle.key}
                className="rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      {detalle.label}
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-gray-800">
                      {formatearValorCuenta(detalle.value)}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!valorDisponible}
                    onClick={() => copiarTexto(detalle.key, valor)}
                    className="shrink-0 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copiaActiva === detalle.key ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={copiarTodoDetalleCuenta}
            className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100"
          >
            <FaCopy className="text-[11px]" />
            {copiaActiva === "todo" ? "Copiado" : "Copiar todo"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAprobarLiquidacion;
