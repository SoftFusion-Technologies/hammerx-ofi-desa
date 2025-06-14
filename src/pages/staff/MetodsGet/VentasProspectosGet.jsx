import React, { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import NavbarStaff from '../NavbarStaff';
import { Link } from 'react-router-dom';
import ClasePruebaModal from '../Components/ClasePruebaModal';
import FormAltaVentas from '../../../components/Forms/FormAltaVentas';
import Footer from '../../../components/footer/Footer';
import { useAuth } from '../../../AuthContext';

const VentasProspectosGet = ({ currentUser }) => {
  const [prospectos, setProspectos] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPage = 20;
  const [search, setSearch] = useState('');

  const { userLevel, userId } = useAuth(); // suponiendo que tienes userId también

  const [modalClaseOpen, setModalClaseOpen] = useState(false);
  const [modalNew, setModalNew] = useState(false);
  const [claseSeleccionada, setClaseSeleccionada] = useState(null); // {id, num}

  const [userSede, setUserSede] = useState(null);
  const [selectedSede, setSelectedSede] = useState(null); // null = todas o ninguna sede seleccionada

  const normalizeString = (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/\s+/g, '');
  };

  const normalizeSede = (sede) => {
    if (!sede) return '';
    const normalized = sede.toLowerCase().replace(/\s/g, '');
    return normalized === 'barriosur' ? 'smt' : normalized;
  };

  const sedes = [
    { key: 'monteros', label: 'Monteros' },
    { key: 'concepcion', label: 'Concepción' },
    { key: 'smt', label: 'SMT / Barrio Sur' }
  ];

  const URL = 'http://localhost:8080/ventas_prospectos';
  useEffect(() => {
    // Desplaza la página al top cuando el componente se monta
    window.scrollTo(0, 0);
  }, []);

  // Traer info del usuario para obtener sede
  useEffect(() => {
    if (!userId) return;

    const fetchUserSede = async () => {
      try {
        const response = await fetch(`http://localhost:8080/users/${userId}`);
        if (!response.ok)
          throw new Error('No se pudo obtener la info del usuario');
        const data = await response.json();
        setUserSede(normalizeString(data.sede || ''));
      } catch (error) {
        console.error('Error cargando sede del usuario:', error);
      }
    };

    fetchUserSede();
  }, [userId]);

  // Cuando userSede se carga, asigno selectedSede si no está set
  useEffect(() => {
    if (userSede && !selectedSede) {
      setSelectedSede(userSede);
    }
  }, [userSede, selectedSede]);

  useEffect(() => {
    fetchProspectos();
    setPage(1);
  }, []);

  const fetchProspectos = async () => {
    try {
      const response = await axios.get(URL, {
        params: {
          usuario_id: currentUser?.id,
          level: currentUser?.level
        }
      });
      setProspectos(response.data);
    } catch (error) {
      console.error('Error al obtener prospectos:', error);
    }
  };

  // Actualiza un campo checkbox (como n_contacto_2) y refresca lista
  const handleCheckboxChange = async (id, field) => {
    try {
      const prospecto = prospectos.find((p) => p.id === id);
      if (!prospecto) return;

      // Alternar valor para checkbox
      const nuevoValor = !prospecto[field];

      await axios.put(`${URL}/${id}`, {
        [field]: nuevoValor
      });
      fetchProspectos();
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  // Actualiza el canal, optimista en local y actualiza backend
  const handleCanalChange = async (id, nuevoCanal) => {
    setProspectos((old) =>
      old.map((p) => (p.id === id ? { ...p, canal_contacto: nuevoCanal } : p))
    );

    try {
      await axios.put(`http://localhost:8080/ventas_prospectos/${id}`, {
        canal_contacto: nuevoCanal
      });
    } catch (error) {
      console.error('Error al actualizar canal:', error);
    }
  };

  const handleChange = async (id, field, value) => {
    try {
      await axios.put(`${URL}/${id}`, {
        [field]: value
      });
      fetchProspectos(); // recarga la lista después de actualizar
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const handleActividadChange = async (id, nuevaActividad) => {
    if (!nuevaActividad) return;

    const valoresValidos = [
      'Musculacion',
      'Pilates',
      'Clases grupales',
      'Pase full'
    ];

    if (!valoresValidos.includes(nuevaActividad)) return;

    // Actualiza en el estado
    setProspectos((old) =>
      old.map((p) => (p.id === id ? { ...p, actividad: nuevaActividad } : p))
    );

    // Actualiza en el backend de inmediato
    try {
      await axios.put(`${URL}/${id}`, {
        actividad: nuevaActividad
      });
    } catch (error) {
      console.error('Error al actualizar actividad:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    // Solo tomar los primeros 10 caracteres "YYYY-MM-DD"
    const [year, month, day] = dateString.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtrar prospectos
  const filtered = prospectos?.length
    ? prospectos.filter((p) => {
        const nombreMatch = (p.nombre || '')
          .toLowerCase()
          .includes(search.toLowerCase());

        // Si no hay sede seleccionada, filtrar solo por nombre
        if (!selectedSede) return nombreMatch;

        // Filtrar por sede normalizada
        const sedeProspecto = normalizeSede(p.sede);
        return nombreMatch && sedeProspecto === selectedSede;
      })
    : [];

  // Ordenar por ID descendente
  const sorted = [...filtered].sort((a, b) => b.id - a.id);

  // Siempre tener al menos 1 página
  const totalPages = Math.max(Math.ceil(sorted.length / rowsPerPage), 1);

  // Asegurar que `page` no supere el total
  const safePage = Math.min(page, totalPages);

  // Calcular índices de paginación
  const startIndex = (safePage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Items visibles
  const visibleProspectos = sorted.slice(startIndex, endIndex);

  // Calcular cuántas filas vacías para llegar a 20
  const emptyRowsCount = rowsPerPage - visibleProspectos.length;

  // Input de búsqueda
  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset al buscar
  };

  const openClasePruebaModal = (id, num) => {
    setClaseSeleccionada({ id, num });
    setModalClaseOpen(true);
  };

  const handleClasePruebaSave = async (id, cambios) => {
    try {
      await axios.put(`${URL}/${id}`, cambios);

      // Actualizar estado local
      setProspectos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...cambios } : p))
      );
    } catch (error) {
      console.error('Error al guardar clase de prueba:', error);
    }
  };

  const handleEliminarProc = async (id) => {
    const confirmacion = window.confirm(
      '¿Seguro que desea eliminar esta recaptación?'
    );
    if (confirmacion) {
      try {
        await axios.delete(`${URL}/${id}`);
        setProspectos(prospectos.filter((q) => q.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const abrirModal = () => {
    setModalNew(true);
    setClaseSeleccionada(null);
  };
  const cerarModal = () => {
    setModalNew(false);
    fetchProspectos();
  };

  const handleEditarRec = (rec) => {
    // Se actualiza el estado con los detalles de la recaptacion seleccionada
    setClaseSeleccionada(rec);

    // Se abre el modal para editar la recaptacion
    setModalNew(true);
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2 shadow-md">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors duration-300">
                Volver
              </button>
            </Link>
          </div>
          <div className="text-center pt-4">
            <h1>
              Registros de Prospectos - Cantidad: {visibleProspectos.length}
            </h1>
          </div>
          <form className="flex flex-col md:flex-row items-center justify-center gap-4 py-5 px-4">
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Buscar por nombre"
              className="w-full md:w-72 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            />
          </form>
          <div className="flex justify-center pb-10">
            <Link to="#">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10 "
              >
                Nuevo Registro
              </button>
            </Link>
          </div>

          {/* Botones de sedes con control de acceso */}
          <div className="flex justify-center gap-4 mb-10 ml-10">
            {sedes.map(({ key, label }) => {
              const isAdmin = userLevel.toLowerCase() === 'admin';
              const isEnabled = isAdmin || userSede === normalizeString(key);
              const normalizedKey = normalizeString(key);

              return (
                <button
                  key={key}
                  className={`
          py-2 px-6 rounded
          ${
            isEnabled
              ? selectedSede === normalizedKey
                ? 'bg-green-800 text-white cursor-pointer'
                : 'bg-green-600 text-white cursor-pointer hover:bg-green-700'
              : 'bg-gray-300 text-gray-600 cursor-not-allowed'
          }
        `}
                  disabled={!isEnabled}
                  onClick={() => {
                    if (isEnabled) {
                      // Si clickeás el mismo, lo deselecciona (toggle)
                      setSelectedSede(
                        selectedSede === normalizedKey ? null : normalizedKey
                      );
                      setPage(1); // reset paginado al cambiar filtro
                    }
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="overflow-auto max-h-[70vh] mt-6 rounded-lg shadow-lg border border-gray-300 bg-white">
            <table className="min-w-[900px] text-sm border-collapse w-full">
              <thead className="bg-orange-600 text-white font-bignoodle  sticky top-0 z-20">
                <tr>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Fecha
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Colaborador
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Nombre
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-24">
                    DNI
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-32">
                    Tipo Prospecto
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left w-36">
                    Canal Contacto
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[140px]">
                    Usuario / Celular
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-left min-w-[160px]">
                    Actividad
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #1
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #2
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-10">
                    #3
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 1
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 2
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-28">
                    Clase 3
                  </th>
                  <th className="border border-gray-200 px-2 py-2 text-center w-16">
                    Convertido
                  </th>
                  <th className="border border-gray-200 px-3 py-2 text-center w-16 rounded-r-lg">
                    Editar
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleProspectos.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-orange-600 transition-colors duration-300 cursor-pointer text-gray-800"
                    style={{ minHeight: '48px' }}
                  >
                    <td className="border border-gray-300 px-4 py-3 min-w-[160px]">
                      {formatDate(p.fecha)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 min-w-[100px]">
                      {p.asesor_nombre}
                    </td>

                    <td className="border border-gray-300 px-4 py-3 min-w-[160px]">
                      <input
                        type="text"
                        value={p.nombre}
                        onChange={(e) =>
                          handleChange(p.id, 'nombre', e.target.value)
                        }
                        className="
      w-full
      border-b
      border-gray-300
      text-sm
      px-2
      py-1
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:text-black
      focus:border-orange-600
      focus:outline-none
      cursor-text
    "
                        placeholder="Nombre completo"
                      />
                    </td>

                    <td className="border border-gray-300 px-4 py-3 w-48">
                      <input
                        type="text"
                        value={p.dni}
                        onChange={(e) =>
                          handleChange(p.id, 'dni', e.target.value)
                        }
                        className="
      w-full
      border-b
      border-gray-300
      text-sm
      px-2
      py-1
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:text-black
      focus:border-orange-600
      focus:outline-none
      cursor-text
    "
                        placeholder="DNI"
                      />
                    </td>

                    <td className="border border-gray-300 px-4 py-3 w-40">
                      <select
                        value={p.tipo_prospecto}
                        onChange={(e) =>
                          handleChange(p.id, 'tipo_prospecto', e.target.value)
                        }
                        className="
      w-full
      rounded
      border
      border-gray-300
      text-sm
      px-3
      py-2
      font-sans
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:bg-orange-50
      hover:text-orange-900
      focus:outline-none
      focus:ring-2
      focus:ring-orange-400
      focus:border-orange-600
      cursor-pointer
    "
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="ExSocio">ExSocio</option>
                      </select>
                    </td>

                    <td className="border border-gray-300 px-4 py-3 w-52">
                      <select
                        value={p.canal_contacto}
                        onChange={(e) =>
                          handleCanalChange(p.id, e.target.value)
                        }
                        className="
                        w-full
                        rounded
                        border
                        border-gray-300
                        text-sm
                        px-3
                        py-2
                        font-sans
                        text-gray-700
                        bg-white
                        transition-colors
                        duration-200
                        ease-in-out
                        hover:bg-orange-50
                        hover:text-orange-900
                        focus:outline-none
                        focus:ring-2
                        focus:ring-orange-400
                        focus:border-orange-600
                        cursor-pointer
                      "
                      >
                        <option value="Mostrador">Mostrador</option>
                        <option value="Whatsapp">Whatsapp</option>
                        <option value="Instagram">Instagram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="Pagina web">Página web</option>
                        <option value="Campaña">Campaña</option>
                        <option value="Comentarios/Stickers">
                          Comentarios/Stickers
                        </option>
                      </select>
                    </td>

                    <td className="border border-gray-300 px-4 py-3 min-w-[160px]">
                      <input
                        type="text"
                        value={p.contacto}
                        onChange={(e) =>
                          handleChange(p.id, 'contacto', e.target.value)
                        }
                        className="
      w-full
      border-b
      border-gray-300
      text-sm
      px-2
      py-1
      text-gray-700
      bg-white
      transition-colors
      duration-200
      ease-in-out
      hover:text-black
      focus:border-orange-600
      focus:outline-none
      cursor-text
    "
                        placeholder="Usuario / Celular"
                      />
                    </td>

                    <td className="border border-gray-300 px-4 py-3 min-w-[160px]">
                      <select
                        value={p.actividad || ''}
                        onChange={(e) =>
                          handleActividadChange(p.id, e.target.value)
                        }
                        className="
                        w-full
                        rounded
                        border
                        border-gray-300
                        text-sm
                        px-3
                        py-2
                        font-sans
                        text-gray-700
                        bg-white
                        transition-colors
                        duration-200
                        ease-in-out
                        hover:bg-orange-50
                        hover:text-orange-900
                        focus:outline-none
                        focus:ring-2
                        focus:ring-orange-400
                        focus:border-orange-600
                        cursor-pointer
                      "
                      >
                        <option value="">Seleccione actividad</option>
                        <option value="Musculacion">Musculación</option>
                        <option value="Pilates">Pilates</option>
                        <option value="Clases grupales">Clases grupales</option>
                        <option value="Pase full">Pase full</option>
                      </select>
                    </td>

                    {/* N° contacto */}
                    <td className="border border-gray-300 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked
                        readOnly
                        className="mx-auto cursor-default"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!p.n_contacto_2}
                        onChange={() =>
                          handleCheckboxChange(p.id, 'n_contacto_2')
                        }
                        className="mx-auto cursor-pointer"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!p.n_contacto_3}
                        onChange={() =>
                          handleCheckboxChange(p.id, 'n_contacto_3')
                        }
                        className="mx-auto cursor-pointer"
                      />
                    </td>

                    {/* Clases de prueba */}
                    {[1, 2, 3].map((num) => (
                      <td
                        key={num}
                        className="border border-gray-300 px-2 py-3 text-center cursor-pointer hover:bg-orange-100"
                        onClick={() => openClasePruebaModal(p.id, num)}
                        title="Click para editar fecha y observaciones"
                      >
                        {p[`clase_prueba_${num}_fecha`]
                          ? formatDate(p[`clase_prueba_${num}_fecha`])
                          : '-'}
                      </td>
                    ))}

                    {/* Convertido */}
                    <td className="border border-gray-300 px-2 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={!!p.convertido}
                        onChange={() =>
                          handleCheckboxChange(p.id, 'convertido')
                        }
                        className="mx-auto cursor-pointer"
                      />
                    </td>

                    {/* Editar y eliminar */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-3">
                        <button
                          onClick={() => handleEditarRec(p)}
                          className="text-orange-600 hover:text-orange-800 font-semibold"
                          title="Editar"
                          aria-label={`Editar prospecto ${p.nombre}`}
                        >
                          ✏️
                        </button>

                        {userLevel === 'admin' && (
                          <button
                            onClick={() => handleEliminarProc(p.id)}
                            className="text-red-500 hover:text-red-700 font-semibold"
                            title="Eliminar"
                            aria-label={`Eliminar prospecto ${p.nombre}`}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Filas vacías para completar 20 */}
                {emptyRowsCount > 0 &&
                  Array.from({ length: emptyRowsCount }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className="h-12">
                      <td
                        colSpan={16}
                        className="border border-gray-300 bg-gray-50"
                      />
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button
            disabled={safePage === 1}
            onClick={() => setPage(safePage - 1)}
            className={`px-4 py-2 rounded ${
              safePage === 1
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Anterior
          </button>

          <button
            disabled={safePage === totalPages}
            onClick={() => setPage(safePage + 1)}
            className={`px-4 py-2 rounded ${
              safePage === totalPages
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>
      <ClasePruebaModal
        isOpen={modalClaseOpen}
        onClose={() => setModalClaseOpen(false)}
        onSave={handleClasePruebaSave}
        numeroClase={claseSeleccionada?.num}
        prospecto={prospectos.find((p) => p.id === claseSeleccionada?.id)}
      />

      <Footer />

      <FormAltaVentas
        isOpen={modalNew}
        onClose={cerarModal}
        Rec={claseSeleccionada}
        setSelectedRecaptacion={setClaseSeleccionada}
      />
    </>
  );
};

export default VentasProspectosGet;
