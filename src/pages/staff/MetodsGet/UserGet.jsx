/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (UserGet.jsx) es el componente el cual renderiza los datos de los usuarios
 * Estos datos llegan cuando se da de alta un nuevo usuario
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import NavbarStaff from '../NavbarStaff';
import { Link } from 'react-router-dom';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import FormAltaUser from '../../../components/Forms/FormAltaUser';
import UserDetails from './UserGetId';
import { useAuth } from '../../../AuthContext';
import UserGetPilates from './UserGetPilates';
import {
  Users,
  Dumbbell,
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Componente funcional que maneja la lógica relacionada con los Users
const UserGet = () => {
  // useState que controla el modal de nuevo usuario
  const [modalNewUser, setModalNewUser] = useState(false);
  const [sectionUserShow, setSectionUserShow] = useState('Usuarios'); // Estado para controlar la sección visible (todos, pilates)
  const [selectedUser, setSelectedUser] = useState(null); // Estado para el usuario seleccionado
  const [modalUserDetails, setModalUserDetails] = useState(false); // Estado para controlar el modal de detalles del usuario
  const [filterSede, setFilterSede] = useState(''); // Estado para el filtro de sede
  const [filterLevel, setFilterLevel] = useState(''); // Estado para el filtro de level (ROL)
  const { userLevel } = useAuth();

  const abrirModal = () => {
    setModalNewUser(true);
  };
  const cerarModal = () => {
    setModalNewUser(false);
    obtenerUsers();
  };

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/users/';

  // Estado para almacenar la lista de users
  const [users, setUsers] = useState([]);

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Inicio - Benjamin Orellana
  //------------------------------------------------------
  const [search, setSearch] = useState('');

  //Funcion de busqueda, en el cuadro
  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = users;
  } else {
    results = users.filter((dato) => {
      const nameMatch = dato.name.toLowerCase().includes(search);
      const emailMatch = dato.email.toLowerCase().includes(search);
      const levelMatch = dato.level.toLowerCase().includes(search);
      const idMatch = dato.id.toString().toLowerCase().includes(search); // Convertimos el ID a cadena y luego a minúsculas antes de la comparación
      return nameMatch || emailMatch || levelMatch || idMatch;
    });
  }

  //------------------------------------------------------
  // 1.3 Relacion al Filtrado - Final - Benjamin Orellana
  //------------------------------------------------------

  useEffect(() => {
    // utilizamos get para obtenerUsuarios los datos contenidos en la url
    axios.get(URL).then((res) => {
      setUsers(res.data);
      obtenerUsers();
    });
  }, []);

  // Función para obtener todos los usuarios desde la API
  const obtenerUsers = async () => {
    try {
      const response = await axios.get(URL);
      setUsers(response.data);
    } catch (error) {
      console.log('Error al obtener los usuarios:', error);
    }
  };

  const handleEliminarUser = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: 'DELETE'
        });
        await respuesta.json();
        const arrayUsers = users.filter((user) => user.id !== id);

        setUsers(arrayUsers);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerUser = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true); // Abre el modal de detalles del usuario
    } catch (error) {
      console.log('Error al obtener el usuario:', error);
    }
  };

  // Función para manejar el cambio en el filtro de sede
  const handleFilterSedeChange = (event) => {
    setFilterSede(event.target.value);
  };

  const applySedeFilter = (user) => {
    if (!filterSede) {
      return true; // Si no hay filtro de sede seleccionado, mostrar todos los usuarios
    }
    const sede = user.sede || ''; // Asignar una cadena vacía si `user.sede` es `null` o `undefined`
    return sede.toLowerCase().includes(filterSede.toLowerCase());
  };

  // Función para manejar el cambio en el filtro de level (ROL)
  const handleFilterLevelChange = (event) => {
    setFilterLevel(event.target.value);
  };

  // Función para aplicar el filtro por level (ROL)
  const applyLevelFilter = (user) => {
    if (!filterLevel) {
      return true; // Si no hay filtro de level (ROL) seleccionado, mostrar todos los usuarios
    }
    return user.level.toLowerCase().includes(filterLevel.toLowerCase());
  };

  // Función para ordenar los integrantes de forma alfabética basado en el nombre
  const ordenarIntegranteAlfabeticamente = (user) => {
    return [...user].sort((a, b) => {
      const sedeA = a.sede || ''; // Reemplaza null o undefined por una cadena vacía
      const sedeB = b.sede || '';
      return sedeA.localeCompare(sedeB);
    });
  };

  // Llamada a la función para obtener los usuarios ordenados de forma creciente
  const sortedUsers = ordenarIntegranteAlfabeticamente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 60;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedUsers.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedUsers.length / itemsPerPage);
  const numbers = [...Array(nPage + 1).keys()].slice(1);

  function prevPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage - 1);
    }
  }

  function changeCPage(id) {
    setCurrentPage(id);
  }

  function nextPage() {
    if (currentPage !== firstIndex) {
      setCurrentPage(currentPage + 1);
    }
  }

  const handleEditarUser = (user) => {
    // (NUEVO)
    setSelectedUser(user);
    setModalNewUser(true);
  };

  const sede2Barrio = {
    SanMiguelBN: 'Tucumán - Barrio Norte',
    smt: 'Tucumán - Barrio sur',
    SMT: 'Tucumán - Barrio sur'
  };
return (
  <>
    <NavbarStaff />

    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* HEADER */}
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#fc4b08]">
              Gestión de usuarios
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="uppercase font-bignoodle text-2xl md:text-4xl font-semibold text-slate-900">
                Panel de usuarios
              </h1>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                {results.length} registros
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-xl">
              Administra el equipo, los roles y las sedes desde una vista clara
              y ordenada. Cambiá entre usuarios generales y el módulo de
              Pilates.
            </p>
          </div>

          <div className="flex items-center justify-start md:justify-end">
            <Link to="/dashboard">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al dashboard
              </button>
            </Link>
          </div>
        </header>

        {/* TOGGLE USUARIOS / PILATES */}
        <div className="w-full flex justify-center mb-6">
          <div className="inline-flex items-center rounded-full bg-white p-1 border border-orange-200 shadow-sm">
            <button
              type="button"
              onClick={() => setSectionUserShow('Usuarios')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                sectionUserShow === 'Usuarios'
                  ? 'bg-[#fc4b08] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-orange-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Usuarios
            </button>
            <button
              type="button"
              onClick={() => setSectionUserShow('Pilates')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                sectionUserShow === 'Pilates'
                  ? 'bg-[#fc4b08] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-orange-50'
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              Pilates
            </button>
          </div>
        </div>

        {/* CONTENIDO SEGÚN SECCIÓN */}
        {sectionUserShow === 'Pilates' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <UserGetPilates />
          </div>
        ) : (
          <>
            {/* CARD PRINCIPAL USUARIOS */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-sm">
              {/* FILA SUPERIOR: FILTROS + CTA */}
              <div className="flex flex-col gap-4 border-b border-slate-200 px-4 sm:px-6 pt-4 pb-5 md:flex-row md:items-center md:justify-between">
                {/* FORM FILTROS */}
                <form
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* Buscar */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Buscar
                    </label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        value={search}
                        onChange={searcher}
                        type="text"
                        placeholder="Nombre, email o ID…"
                        className="w-full sm:w-64 rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-[#fc4b08]"
                      />
                    </div>
                  </div>

                  {/* Sede */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Sede
                    </label>
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={filterSede}
                        onChange={handleFilterSedeChange}
                        className="w-full sm:w-56 appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-[#fc4b08]"
                      >
                        <option value="">Todas las sedes</option>
                        <option value="Monteros">MONTEROS</option>
                        <option value="Concepción">CONCEPCIÓN</option>
                        <option value="SMT">TUCUMÁN - BARRIO SUR</option>
                        <option value="SanMiguelBN">
                          TUCUMÁN - BARRIO NORTE
                        </option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Rol */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Rol
                    </label>
                    <div className="relative">
                      <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <select
                        value={filterLevel}
                        onChange={handleFilterLevelChange}
                        className="w-full sm:w-48 appearance-none rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#fc4b08] focus:border-[#fc4b08]"
                      >
                        <option value="">Todos los roles</option>
                        <option value="admin">Administrador</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="gerente">Gerente</option>
                        <option value="instructor">Instructor</option>
                      </select>
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                        ▼
                      </span>
                    </div>
                  </div>
                </form>

                {/* CTA NUEVO USUARIO */}
                <div className="flex justify-start md:justify-end">
                  <button
                    type="button"
                    onClick={abrirModal}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#58b35e] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4e8a52] transition"
                  >
                    <UserPlus className="h-4 w-4" />
                    Nuevo usuario
                  </button>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL */}
              <div className="px-4 sm:px-6 py-4">
                {Object.keys(results).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                    <p className="text-sm sm:text-base font-semibold text-slate-800">
                      No encontramos usuarios con esos filtros
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500">
                      Probá limpiando la búsqueda o cambiando la sede/rol.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* TABLA */}
                    <div className="overflow-hidden rounded-xl border border-slate-200">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                          <thead className="bg-[#fc4b08] text-white text-xs uppercase tracking-wide">
                            <tr>
                              <th className="px-4 py-3 font-semibold">ID</th>
                              <th className="px-4 py-3 font-semibold">
                                Nombre
                              </th>
                              <th className="px-4 py-3 font-semibold">Email</th>
                              <th className="px-4 py-3 font-semibold">Rol</th>
                              <th className="px-4 py-3 font-semibold">Sede</th>
                              {(userLevel === 'admin' ||
                                userLevel === 'administrador') && (
                                <th className="px-4 py-3 font-semibold text-right">
                                  Acciones
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {records
                              .filter(applySedeFilter)
                              .filter(applyLevelFilter)
                              .map((user) => (
                                <tr
                                  key={user.id}
                                  className="hover:bg-orange-50/60 transition-colors"
                                >
                                  <td
                                    className="px-4 py-2.5 text-slate-800 cursor-pointer"
                                    onClick={() => obtenerUser(user.id)}
                                  >
                                    #{user.id}
                                  </td>
                                  <td
                                    className="px-4 py-2.5 text-slate-900 cursor-pointer"
                                    onClick={() => obtenerUser(user.id)}
                                  >
                                    {user.name}
                                  </td>
                                  <td
                                    className="px-4 py-2.5 text-slate-700 cursor-pointer"
                                    onClick={() => obtenerUser(user.id)}
                                  >
                                    {user.email}
                                  </td>
                                  <td
                                    className="px-4 py-2.5 text-slate-700 capitalize cursor-pointer"
                                    onClick={() => obtenerUser(user.id)}
                                  >
                                    {user.level}
                                  </td>
                                  <td
                                    className="px-4 py-2.5 text-slate-700 uppercase cursor-pointer"
                                    onClick={() => obtenerUser(user.id)}
                                  >
                                    {sede2Barrio[user?.sede] ??
                                      user?.sede ??
                                      '-'}
                                  </td>

                                  {(userLevel === 'admin' ||
                                    userLevel === 'administrador') && (
                                    <td className="px-4 py-2.5 text-right space-x-2 whitespace-nowrap">
                                      <button
                                        type="button"
                                        onClick={() => handleEditarUser(user)}
                                        className="inline-flex items-center gap-1 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-yellow-300 transition"
                                      >
                                        Editar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEliminarUser(user.id)
                                        }
                                        className="inline-flex items-center gap-1 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-400 transition"
                                      >
                                        Eliminar
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* PAGINACIÓN */}
                    <div className="mt-6 flex justify-center">
                      <nav
                        className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200 px-1.5 py-1 shadow-sm"
                        aria-label="Paginación"
                      >
                        <button
                          type="button"
                          onClick={prevPage}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Prev
                        </button>

                        {numbers.map((number) => (
                          <button
                            key={number}
                            type="button"
                            onClick={() => changeCPage(number)}
                            className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                              currentPage === number
                                ? 'bg-[#fc4b08] text-white'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {number}
                          </button>
                        ))}

                        <button
                          type="button"
                          onClick={nextPage}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                          disabled={
                            numbers.length === 0 ||
                            currentPage === numbers[numbers.length - 1]
                          }
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </>
                )}
              </div>

              {/* Modal alta / edición */}
              <FormAltaUser
                isOpen={modalNewUser}
                onClose={cerarModal}
                user={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            </section>

            {/* Detalle lateral / modal */}
            {selectedUser && (
              <UserDetails
                user={selectedUser}
                setSelectedUser={setSelectedUser}
                isOpen={modalUserDetails}
                onClose={() => setModalUserDetails(false)}
              />
            )}
          </>
        )}
      </div>
    </div>

    <Footer />
  </>
);

};

export default UserGet;
