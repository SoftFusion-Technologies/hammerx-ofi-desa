/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (FreeClassGet.jsx) es el componente el cual renderiza los datos de los que envian para clase gratis
 * Estos datos llegan cuando se completa el formulario de Quiero probar una clase
 *
 * Tema: Configuración
 * Capa: Frontend
 * Contacto: benjamin.orellanaof@gmail.com || 3863531891
 */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { formatearFecha } from "../../../Helpers";
import { Link } from "react-router-dom";
import NavbarStaff from "../NavbarStaff";
import "../../../styles/MetodsGet/Tabla.css";
import "../../../styles/staff/background.css";
import Footer from "../../../components/footer/Footer";
import { useAuth } from "../../../AuthContext";
import { FaWhatsapp } from 'react-icons/fa'; 
const FreeClassGet = () => {
  const { userLevel } = useAuth();

  // Estado para almacenar la lista de personas
  const [personClass, setPersonClass] = useState([]);
  const [contactedTestClass, setContactedTestClass] = useState({});

  // Estado para almacenar el término de búsqueda
  const [search, setSearch] = useState("");

  //URL estatica, luego cambiar por variable de entorno
  const URL = 'http://localhost:8080/testclass/';

  useEffect(() => {
    // utilizamos get para obtenerPersonas los datos contenidos en la url
    axios.get(URL).then((res) => {
      setPersonClass(res.data);
      obtenerPersonsClass();
    });
  }, []);

  // Función para obtener todos los personClass desde la API
  const obtenerPersonsClass = async () => {
    try {
      const response = await axios.get(URL);
      const testclassData = response.data;
      setPersonClass(testclassData);

      // Obtener el estado de contacto de cada testclass y actualizar el estado
      const contactedData = {};
      testclassData.forEach((test) => {
        contactedData[test.id] = test.state === "1"; // Convertir a booleano
      });
      setContactedTestClass(contactedData);
    } catch (error) {
      console.log("Error al obtener las testclass:", error);
    }
  };

  const handleEliminarPersonClass = async (id) => {
    const confirmacion = window.confirm("¿Seguro que desea eliminar?");
    if (confirmacion) {
      try {
        const url = `${URL}${id}`;
        const respuesta = await fetch(url, {
          method: "DELETE",
        });
        await respuesta.json();
        const arrayPersonClass = personClass.filter(
          (personClass) => personClass.id !== id
        );

        setPersonClass(arrayPersonClass);
      } catch (error) {
        console.log(error);
      }
    }
  };

  const obtenerPersonClass = async (id) => {
    try {
      const url = `${URL}${id}`;

      console.log(url);

      const respuesta = await fetch(url);

      const resultado = await respuesta.json();

      setPersonClass(resultado);
    } catch (error) {
      console.log(error);
    }
  };

  const searcher = (e) => {
    setSearch(e.target.value);
  };

  let results = [];

  if (!search) {
    results = personClass;
  } else if (search) {
    results = personClass.filter((dato) => {
      const nameMatch = dato.name.toLowerCase().includes(search.toLowerCase());
      const lastNameMatch = dato.last_name
        .toLowerCase()
        .includes(search.toLowerCase());
      const dniMatch = dato.dni.includes(search);
      const celularMatch = dato.celular.includes(search);
      const sedeMatch = dato.sede.toLowerCase().includes(search.toLowerCase());
      const objetivoMatch = dato.objetivo
        .toLowerCase()
        .includes(search.toLowerCase());

      return (
        nameMatch ||
        lastNameMatch ||
        dniMatch ||
        celularMatch ||
        sedeMatch ||
        objetivoMatch
      );
    });
  }

  // Función para ordenar los personClass de forma decreciente basado en el id
  const ordenarPersonasDecreciente = (personClass) => {
    return [...personClass].sort((a, b) => b.id - a.id);
  };

  // Llamada a la función para obtener los personClasss ordenados de forma decreciente
  const sortedpersonClass = ordenarPersonasDecreciente(results);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const records = sortedpersonClass.slice(firstIndex, lastIndex);
  const nPage = Math.ceil(sortedpersonClass.length / itemsPerPage);
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

  // Función para actualizar el estado de contacto en la base de datos
  const updateContactState = async (id, state) => {
    try {
      await axios.put(`${URL}${id}`, { state: state ? "1" : "0" }); // Cambiado a PUT con el estado correcto
      setContactedTestClass((prevState) => ({
        ...prevState,
        [id]: state,
      }));
    } catch (error) {
      console.log("Error al actualizar el estado de contacto:", error);
    }
  };

  const contactarTestClass = (celular, id) => {
    // const link = `https://api.whatsapp.com/send/?phone=%2B549${celular}&text&type=phone_number&app_absent=0`;
    // const newWindow = window.open(link, "_blank");

    // if (newWindow) {
    //   const interval = setInterval(async () => {
    //     if (newWindow.closed) {
    //       clearInterval(interval);
    //       await updateContactState(id, true);
    //     }
    //   }, 1000); // Verificar cada segundo si la ventana se cerró
    // }
    updateContactState(id, true);
  };

  
  const handleContact = (celular, id) => {
    // Aquí actualiza el estado de contactedTestClass para reflejar que la persona ha sido contactada
    setContactedTestClass((prevState) => ({
      ...prevState,
      [id]: true
    }));

    
    // Si necesitas hacer algo más cuando se contacta, agrégalo aquí
  };

  const handleWhatsAppRedirect = (celular) => {
    // Redirecciona al chat de WhatsApp usando el número de celular
    window.open(
      `https://api.whatsapp.com/send/?phone=%2B549${celular}&text&type=phone_number&app_absent=0`,
      '_blank'
    );
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
              Listado de Personas :{' '}
              <span className="text-center">
                Cantidad de registros : {results.length}
              </span>
            </h1>
          </div>

          {/* formulario de busqueda */}
          <form className="flex justify-center pb-5">
            <input
              value={search}
              onChange={searcher}
              type="text"
              placeholder="Buscar mediante el NOMBRE"
              className="border rounded-sm"
            />
          </form>

          {Object.keys(results).length === 0 ? (
            <p className="text-center pb-10">
              La Persona NO Existe ||{' '}
              <span className="text-span"> Persona: {results.length}</span>
            </p>
          ) : (
            <>
              <table className="w-11/12 mx-auto">
                <thead className="bg-[#fc4b08]  text-white">
                  <tr key={personClass.id}>
                    <th className="thid">ID</th>
                    <th>Solicitud</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>DNI</th>
                    <th>Cel</th>
                    <th>Sede</th>
                    <th>Objetivo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((personClass) => (
                    <tr key={personClass.id}>
                      <td>{personClass.id}</td>
                      <td>{formatearFecha(personClass.created_at)}</td>
                      <td>{personClass.name}</td>
                      <td>{personClass.last_name}</td>
                      <td>{personClass.dni}</td>
                      <td>{personClass.celular}</td>
                      <td>{personClass.sede}</td>

                      <td>{personClass.objetivo}</td>

                      {/* ACCIONES */}

                      {(userLevel === 'admin' ||
                        userLevel === 'administrador') && (
                        <td className="flex space-x-3 px-2">
                          <button
                            onClick={() =>
                              handleEliminarPersonClass(personClass.id)
                            }
                            type="button"
                            className="py-2 px-4 my-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                        <td className="flex items-center">
                          <button
                            onClick={() =>
                              contactarTestClass(personClass.celular, personClass.id)
                            }
                            type="button"
                            className={`py-2 px-4 my-1 rounded-md text-white ${
                              contactedTestClass[personClass.id]
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {contactedTestClass[personClass.id]
                              ? 'Contactado'
                              : 'Contactar'}
                          </button>

                          {/* Botón de WhatsApp */}
                          <button
                            onClick={() =>
                              handleWhatsAppRedirect(personClass.celular)
                            }
                            type="button"
                            className="ml-2 py-2 px-4 my-1 rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center"
                          >
                            <FaWhatsapp className="mr-2" />{' '}
                            {/* Icono de WhatsApp */}
                            WhatsApp
                          </button>
                        </td>
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
                        currentPage === number ? 'active' : ''
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
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FreeClassGet;
