import React, { useEffect, useState } from 'react';
import axios from 'axios';
import FormAltaUserPilates from '../../../components/Forms/FormAltaUserPilates';
import sweetalert2 from 'sweetalert2';
import { Search, Filter, UserPlus } from 'lucide-react';

const UserGetPilates = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filterSede, setFilterSede] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [sedesDisponibles, setSedesDisponibles] = useState([]);

  useEffect(() => {
    obtenerUsuariosPilates();
  }, [filterSede]);

  const obtenerUsuariosPilates = () => {
    axios
      .get(`http://localhost:8080/usuarios-pilates/sede?sede_id=${filterSede}`)
      .then((res) => {
        if (res.data) setUsers(res.data);
        console.log(res.data);
      });
  };

  useEffect(() => {
    axios.get('http://localhost:8080/sedes/ciudad').then((res) => {
      if (res.data) {
        setSedesDisponibles(res.data);
      }
    });
  }, []);

  const searcher = (e) => setSearch(e.target.value);

  const handleFilterSedeChange = (e) => {
    if (e.target.value === '' || e.target.value === null) {
      setFilterSede('');
      return;
    }
    setFilterSede(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const sedeMatch = filterSede
      ? user.sede_id?.toString() === filterSede
      : true;
    const searchText = search.toLowerCase();
    const searchMatch =
      (user.nombre || '').toLowerCase().includes(searchText) ||
      (user.apellido || '').toLowerCase().includes(searchText) ||
      (user.email || '').toLowerCase().includes(searchText) ||
      (user.telefono || '').toLowerCase().includes(searchText);

    return sedeMatch && searchMatch;
  });

  const handleNuevoInstructor = () => {
    setSelectedInstructor(null);
    setModalOpen(true);
  };

  const handleModificarInstructor = (instructor) => {
    setSelectedInstructor(instructor);
    setModalOpen(true);
  };

  const handleEliminarInstructor = async (id) => {
    const confirmacion = await sweetalert2.fire({
      title: '¿Seguro que desea eliminar?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
      try {
        const url = `http://localhost:8080/usuarios-pilates/${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayUsers = users.filter((user) => user.id !== id);
        setUsers(arrayUsers);

        sweetalert2.fire({
          title: 'Eliminado',
          text: 'El instructor fue eliminado correctamente.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        sweetalert2.fire({
          title: 'Error',
          text: 'No se pudo eliminar el instructor.',
          icon: 'error'
        });
        console.log(error);
      }
    }
  };

  return (
    <>
      {/* Encabezado interno del módulo Pilates */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="space-y-1">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Instructores de Pilates
          </h2>
          <p className="text-xs text-slate-600">
            Cantidad de registros:{' '}
            <span className="font-semibold">{filteredUsers.length}</span>
          </p>
        </div>

        <button
          onClick={handleNuevoInstructor}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-800 transition"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo instructor
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap mb-5">
        {/* Buscar */}
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Buscar
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Nombre, apellido, email o teléfono"
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-[#fc4b08]"
            />
          </div>
        </div>

        {/* Sede */}
        <div className="w-full sm:w-60">
          <label className="text-xs font-medium text-slate-700 mb-1 block">
            Sede
          </label>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filterSede}
              onChange={handleFilterSedeChange}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-[#fc4b08]"
            >
              <option value="">Todas las sedes</option>
              {sedesDisponibles.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Tabla / lista */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center gap-2 bg-white rounded-xl border border-slate-200">
          <p className="text-sm sm:text-base font-semibold text-slate-800">
            No hay usuarios de Pilates.
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            Podés agregar un nuevo instructor con el botón{' '}
            <span className="font-semibold">“Nuevo instructor”</span>.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-[#fc4b08] text-white text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-3 font-semibold">Nombre completo</th>
                  <th className="p-3 font-semibold">Teléfono</th>
                  <th className="p-3 font-semibold">Email</th>
                  <th className="p-3 font-semibold">Estado</th>
                  <th className="p-3 font-semibold">Sede</th>
                  <th className="p-3 font-semibold">Creado</th>
                  <th className="p-3 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-orange-50/60 transition-colors"
                  >
                    <td className="p-3 break-words text-slate-900">
                      {user.nombre} {user.apellido}
                    </td>
                    <td className="p-3 break-words text-slate-800">
                      {user.telefono || '—'}
                    </td>
                    <td className="p-3 break-words text-slate-800">
                      {user.email || '—'}
                    </td>
                    <td className="p-3 text-slate-800 capitalize">
                      {user.estado || '—'}
                    </td>
                    <td className="p-3 text-slate-800">
                      {user.sede_nombre || '—'}
                    </td>
                    <td className="p-3 text-slate-800">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col md:flex-row gap-2 justify-center">
                        <button
                          onClick={() => handleModificarInstructor(user)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-xs font-semibold"
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => handleEliminarInstructor(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal alta / edición */}
      <FormAltaUserPilates
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        instructor={selectedInstructor}
        setSelectedInstructor={setSelectedInstructor}
        sedesDisponibles={sedesDisponibles}
        obtenerUsuariosPilates={obtenerUsuariosPilates}
      />
    </>
  );
};

export default UserGetPilates;
