import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import NavbarStaff from "../NavbarStaff";
import "../../../styles/MetodsGet/Tabla.css";
import "../../../styles/staff/background.css";
import Footer from "../../../components/footer/Footer";
import FormAltaTask from "../../../components/Forms/FormAltaTask";
import TaskDetails from "./TaskGetId";
import { useAuth } from "../../../AuthContext";

const TaskGet = () => {
  const [modalNewTask, setModalNewTask] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalUserDetails, setModalUserDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskUsers, setTaskUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const { userLevel, userName } = useAuth(); // Se añade userName para identificar el usuario actual
  const [search, setSearch] = useState("");

  const abrirModal = () => {
    setModalNewTask(true);
  };

  const cerrarModal = () => {
    setModalNewTask(false);
    setSelectedTask(null);
    obtenerTasks();
  };

  const URL = "http://localhost:8080/schedulertask/";
  const USERS_URL = "http://localhost:8080/users";
  const TASK_USERS_URL = "http://localhost:8080/schedulertask_user";

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  const obtenerTasks = async () => {
    try {
      const response = await axios.get(URL);
      setTasks(response.data);
    } catch (error) {
      console.log("Error al obtener las tareas:", error);
    }
  };

  const obtenerUsers = async () => {
    try {
      const response = await axios.get(USERS_URL);
      setUsers(response.data);
    } catch (error) {
      console.log("Error al obtener los usuarios:", error);
    }
  };

  const obtenerTaskUsers = async () => {
    try {
      const response = await axios.get(TASK_USERS_URL);
      setTaskUsers(response.data);
    } catch (error) {
      console.log("Error al obtener los usuarios asignados a tareas:", error);
    }
  };

  useEffect(() => {
    obtenerTasks();
    obtenerUsers();
    obtenerTaskUsers();
  }, []);

  const handleEliminarTask = async (id) => {
    const confirmacion = window.confirm("¿Seguro que desea eliminar?");
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        await fetch(url, { method: "DELETE" });
        setTasks(tasks.filter((task) => task.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerNombresUsuarios = (taskId) => {
    const usuariosAsignados = taskUsers.filter(
      (taskUser) => taskUser.schedulertask_id === taskId
    );
    return usuariosAsignados
      .map((taskUser) => {
        const usuario = users.find((user) => user.id === taskUser.user_id);
        return usuario ? usuario.name : "Usuario no encontrado";
      })
      .join(", ");
  };

  const ordenarTasksDecreciente = (tasks) => {
    return [...tasks].sort((a, b) => b.id - a.id);
  };

  const filtrarTasks = (tasks) => {
    return tasks.filter((task) => {
      const assignedUsers = taskUsers
        .filter((tu) => tu.schedulertask_id === task.id)
        .map((tu) => tu.user_id);
      const currentUser = users.find((user) => user.email === userName);

      return (
        userLevel === "admin" ||
        userLevel === "gerente" ||
        assignedUsers.includes(currentUser?.id)
      );
    });
  };

  const results = !search
    ? filtrarTasks(tasks)
    : filtrarTasks(tasks).filter((task) =>
        task.titulo.toLowerCase().includes(search.toLowerCase())
      );

  const sortedTasks = ordenarTasksDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedTasks.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedTasks.length / itemsPerPage);
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

  const obtenerTarea = async (id) => {
    try {
      const url = `${URL}${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true);
    } catch (error) {
      console.log("Error al obtener el integrante:", error);
    }
  };

  const handleEditarTask = (task) => {
    setSelectedTask(task);
    setModalNewTask(true);
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10">
        <div className="bg-white rounded-lg w-11/12 mx-auto pb-2">
          <div className="pl-5 pt-5">
            <Link to="/dashboard">
              <button className="py-2 px-5 bg-[#fc4b08] rounded-lg text-sm text-white hover:bg-orange-500">
                Volver
              </button>
            </Link>
          </div>
          <div className="flex justify-center">
            <h1 className="pb-5">
              Listado de Tareas: &nbsp;
              <span className="text-center">
                Cantidad de registros: {results.length}
              </span>
            </h1>
          </div>

          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar tasks"
              className="border rounded-sm"
            />
          </form>

          {userLevel === "admin" || userLevel === "gerente" ? (
            <div className="flex justify-center pb-10">
              <Link to="#">
                <button
                  onClick={abrirModal}
                  className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
                >
                  Nueva Tarea
                </button>
              </Link>
            </div>
          ) : null}

          {results.length === 0 ? (
            <p className="text-center pb-10">
              La Tarea NO Existe ||{" "}
              <span className="text-span"> Tarea: {results.length}</span>
            </p>
          ) : (
            <>
              <table className="w-11/12 mx-auto">
                <thead className=" bg-[#fc4b08]  text-white">
                  <tr key={tasks.id}>
                    <th className="thid">ID</th>
                    <th>Tarea</th>
                    <th>Hora</th>
                    <th>Días</th>
                    <th>Usuarios</th>
                    <th>Estado</th>
                    {userLevel === "admin" || userLevel === "gerente" ? (
                      <th>Acciones</th>
                    ) : null}
                  </tr>
                </thead>
                <tbody>
                  {records.map((task) => (
                    <tr key={task.id}>
                      <td onClick={() => obtenerTarea(task.id)}>{task.id}</td>
                      <td
                        className="max-w-[300px] w-[200px]"
                        onClick={() => obtenerTarea(task.id)}
                      >
                        {task.titulo}
                      </td>
                      <td onClick={() => obtenerTarea(task.id)}>{task.hora}</td>
                      <td onClick={() => obtenerTarea(task.id)}>{task.dias}</td>
                      <td onClick={() => obtenerTarea(task.id)}>
                        {obtenerNombresUsuarios(task.id)}
                      </td>
                      <td
                        className={`uppercase max-w-[100px] p-2 overflow-y-auto max-h-[100px] ${
                          task.state === 1 ? "text-green-500" : "text-red-500"
                        }`}
                        onClick={() => obtenerTarea(task.id)}
                      >
                        {task.state === 1 ? "Activa" : "Inactiva"}
                      </td>

                      {(userLevel === "admin" ||
                        userLevel === "administrador") && (
                        <td className="">
                          <button
                            onClick={() => handleEliminarTask(task.id)}
                            type="button"
                            className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                          <button
                            onClick={() => handleEditarTask(task)}
                            type="button"
                            className="py-2 px-4 my-1 ml-5 bg-yellow-500 text-black rounded-md hover:bg-red-600"
                          >
                            Editar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              <nav className="flex justify-center items-center my-10">
                <ul className="pagination">
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={prevPage}>
                      Prev
                    </a>
                  </li>
                  {numbers.map((number, index) => (
                    <li
                      className={`page-item ${
                        currentPage === number ? "active" : ""
                      }`}
                      key={index}
                    >
                      <a
                        href="#"
                        className="page-link"
                        onClick={() => changeCPage(number)}
                      >
                        {number}
                      </a>
                    </li>
                  ))}
                  <li className="page-item">
                    <a href="#" className="page-link" onClick={nextPage}>
                      Next
                    </a>
                  </li>
                </ul>
              </nav>
            </>
          )}
          <FormAltaTask
            isOpen={modalNewTask}
            onClose={cerrarModal}
            task={selectedTask}
            setSelectedTask={setSelectedTask}
          />
        </div>
      </div>
      {selectedUser && (
        <TaskDetails
          user={selectedUser}
          isOpen={modalUserDetails}
          onClose={() => setModalUserDetails(false)}
        />
      )}
      <Footer />
    </>
  );
};

export default TaskGet;
