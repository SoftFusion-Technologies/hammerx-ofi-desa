import React from "react";

const TablaGenerica = ({ 
  headers = [], 
  datos = [], 
  renderRow, 
  renderCard, 
  cargando, 
  error,
  mensajeVacio = "NO SE ENCONTRARON RESULTADOS" 
}) => {

  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-sm text-gray-500 animate-pulse">
        CARGANDO DATOS...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl border border-red-100 p-10 text-center text-sm text-red-500">
        ERROR AL CARGAR LOS DATOS
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* --- VISTA MOBILE (Cards) --- */}
      <div className="md:hidden space-y-3">
        {datos.length > 0 ? (
          datos.map((item, index) => (
            <div key={item.id || index} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              {renderCard(item)}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center text-sm text-gray-400 italic">
            {mensajeVacio}
          </div>
        )}
      </div>

      {/* --- VISTA DESKTOP (Tabla) --- */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={`px-6 py-4 font-bold ${header.align === 'center' ? 'text-center' : ''}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {datos.length > 0 ? (
              datos.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-emerald-50/30 transition-colors">
                  {renderRow(item)}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="px-6 py-10 text-center text-gray-400 italic">
                  {mensajeVacio}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TablaGenerica;