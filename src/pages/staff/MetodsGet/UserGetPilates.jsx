import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import FormAltaUserPilates from "../../../components/Forms/FormAltaUserPilates";
import sweetalert2 from "sweetalert2";

const UserGetPilates = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filterSede, setFilterSede] = useState("");
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
        console.log(res.data)
      });
  };

  useEffect(() => {
    axios.get("http://localhost:8080/sedes/ciudad").then((res) => {
      if (res.data) {
        setSedesDisponibles(res.data);
      }
    });
  }, []);

  const searcher = (e) => setSearch(e.target.value);
  const handleFilterSedeChange = (e) => {
    if (e.target.value === "" || e.target.value === null) {
      setFilterSede("");
      return;
    }
    setFilterSede(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const sedeMatch = filterSede
      ? user.sede_id?.toString() === filterSede
      : true;
    const searchMatch =
      (user.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.apellido || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.telefono || "").toLowerCase().includes(search.toLowerCase());
      
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
      title: "¿Seguro que desea eliminar?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmacion.isConfirmed) {
      try {
        const url = `http://localhost:8080/usuarios-pilates/${id}`;
        const respuesta = await fetch(url, {
          method: "DELETE",
        });
        await respuesta.json();
        const arrayUsers = users.filter((user) => user.id !== id);
        setUsers(arrayUsers);

        sweetalert2.fire({
          title: "Eliminado",
          text: "El instructor fue eliminado correctamente.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        sweetalert2.fire({
          title: "Error",
          text: "No se pudo eliminar el instructor.",
          icon: "error",
        });
        console.log(error);
      }
    }
  };

return (
  <div className="dashboardbg min-h-screen pt-6 pb-10">
    <div className="bg-white rounded-lg w-full max-w-screen-2xl mx-auto pb-2 shadow-md">
      <div className="pl-3 pt-4">
        <Link to="/dashboard">
          <button className="py-2 px-4 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500 transition-colors">
            Volver
          </button>
        </Link>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 my-6 px-2">
        <input
          value={search}
          onChange={searcher}
          type="text"
          placeholder="Buscar por nombre, apellido, email o teléfono"
          className="border rounded-sm px-3 py-2 w-full md:w-1/3"
        />
        <select
          value={filterSede}
          onChange={handleFilterSedeChange}
          className="border rounded-sm px-3 py-2 w-full md:w-1/4"
        >
          <option value="">Todas las sedes</option>
          {sedesDisponibles.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-10">
        <h1 className="pb-5 text-lg md:text-xl">
          Usuarios Pilates:&nbsp;
          <span className="text-center font-medium">
            Cantidad de registros: {filteredUsers.length}
          </span>
        </h1>
        <button
          onClick={handleNuevoInstructor}
          className="bg-violet-700 hover:bg-violet-800 text-white py-2 px-5 rounded-lg font-semibold shadow-md transition-colors duration-200 my-2 md:my-0"
        >
          Nuevo Instructor
        </button>
      </div>
      <div className="overflow-x-auto w-full px-2">
        <table className="min-w-full max-w-screen-2xl mx-auto text-sm md:text-base">
          <thead className="text-white bg-violet-700">
            <tr>
              <th className="p-2">Nombre completo</th>
              <th className="p-2">Teléfono</th>
              <th className="p-2">Email</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Sede</th>
              <th className="p-2">Creado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="p-2 break-words">{user.nombre} {user.apellido}</td>
                <td className="p-2 break-words">{user.telefono}</td>
                <td className="p-2 break-words">{user.email}</td>
                <td className="p-2">{user.estado}</td>
                <td className="p-2">{user.sede_nombre}</td>
                <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-2 flex flex-col md:flex-row gap-2 justify-center">
                  <button
                    onClick={() => handleModificarInstructor(user)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                  >
                    Modificar
                  </button>
                  <button
                    onClick={() => handleEliminarInstructor(user.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="text-center pb-10">No hay usuarios de pilates.</p>
        )}
      </div>
    </div>
    <FormAltaUserPilates
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      instructor={selectedInstructor}
      setSelectedInstructor={setSelectedInstructor}
      sedesDisponibles={sedesDisponibles}
      obtenerUsuariosPilates={obtenerUsuariosPilates}
    />
  </div>
);
};

export default UserGetPilates;
