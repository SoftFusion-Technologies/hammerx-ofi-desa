import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import NavbarStaff from '../NavbarStaff';
import '../../../styles/MetodsGet/Tabla.css';
import '../../../styles/staff/background.css';
import Footer from '../../../components/footer/Footer';
import TaskDetails from './TaskGetId';
import { useAuth } from '../../../AuthContext';
import FormAltaTask from '../../../components/Forms/FormAltaTask';

const TaskGet = () => {
  const [modalNewTask, setModalNewTask] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalUserDetails, setModalUserDetails] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const { userLevel, userName } = useAuth();
  const [search, setSearch] = useState('');

  const abrirModal = () => {
    setModalNewTask(true);
  };

  const cerrarModal = () => {
    setModalNewTask(false);
    setSelectedTask(null);
    obtenerTasks();
  };

  const URL = 'http://localhost:8080/tareasdiarias';

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  // Obtener tareas con taskUsers incluidos
  const obtenerTasks = async () => {
    try {
      const response = await axios.get(URL);
      // response.data debe ser un array, si no, ajusta según tu API
      setTasks(Array.isArray(response.data) ? response.data : [response.data]);
    } catch (error) {
      console.log('Error al obtener las tareas:', error);
    }
  };

  useEffect(() => {
    obtenerTasks();
  }, []);

  // Filtrar tareas según búsqueda y permiso (solo ejemplo, modifícalo si es necesario)
  const results = !search
    ? tasks
    : tasks.filter((task) =>
        task.titulo.toLowerCase().includes(search.toLowerCase())
      );

  const handleEliminarTask = async (id) => {
    const confirmacion = window.confirm('¿Seguro que desea eliminar?');
    if (confirmacion) {
      try {
        const url = `${URL}/${id}`;
        await fetch(url, { method: 'DELETE' });
        setTasks(tasks.filter((task) => task.id !== id));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleEditarTask = (task) => {
    setSelectedTask(task);
    setModalNewTask(true);
  };

  const obtenerTarea = async (id) => {
    try {
      const url = `${URL}/${id}`;
      const respuesta = await fetch(url);
      const resultado = await respuesta.json();
      setSelectedUser(resultado);
      setModalUserDetails(true);
    } catch (error) {
      console.log('Error al obtener la tarea:', error);
    }
  };

  // Convierte descripcion HTML a texto plano (simple)
  const htmlToText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  return (
    <>
      <NavbarStaff />
      <div className="dashboardbg h-contain pt-10 pb-10 mb-10">
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
              <span className="text-center">{results.length} registros</span>
            </h1>
          </div>

          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar tareas"
              className="border rounded-sm"
            />
          </form>

          {(userLevel === 'admin' || userLevel === 'gerente') && (
            <div className="flex justify-center pb-10">
              <button
                onClick={abrirModal}
                className="bg-[#58b35e] hover:bg-[#4e8a52] text-white py-2 px-4 rounded transition-colors duration-100 z-10"
              >
                Nueva Tarea
              </button>
            </div>
          )}

          {results.length === 0 ? (
            <p className="text-center pb-10">No hay tareas que mostrar.</p>
          ) : (
            <table className="w-11/12 mx-auto">
              <thead className="bg-[#fc4b08] text-white">
                <tr>
                  <th className="thid">ID</th>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                  <th>Usuarios asignados</th>
                  {(userLevel === 'admin' || userLevel === 'gerente') && (
                    <th>Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {results.map((task) => (
                  <tr key={task.id}>
                    <td onClick={() => obtenerTarea(task.id)}>{task.id}</td>
                    <td onClick={() => obtenerTarea(task.id)}>{task.titulo}</td>
                    <td
                      onClick={() => obtenerTarea(task.id)}
                      style={{
                        maxWidth: 300,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {htmlToText(task.descripcion)}
                    </td>
                    <td
                      onClick={() => obtenerTarea(task.id)}
                      className={`uppercase ${
                        task.activa === 1 ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {task.activa === 1 ? 'Activa' : 'Inactiva'}
                    </td>
                    <td onClick={() => obtenerTarea(task.id)}>
                      {task.taskUsers && task.taskUsers.length > 0
                        ? task.taskUsers.map((tu) => tu.user.name).join(', ')
                        : 'Sin usuarios asignados'}
                    </td>
                    {(userLevel === 'admin' || userLevel === 'gerente') && (
                      <td>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEliminarTask(task.id);
                          }}
                          className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                          Eliminar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarTask(task);
                          }}
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
