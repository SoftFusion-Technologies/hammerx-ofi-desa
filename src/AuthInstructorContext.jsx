import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthInstructorContext = createContext();

export const AuthInstructorProvider = ({ children }) => {
  const [instructorToken, setInstructorToken] = useState(null);
  const [instructorName, setInstructorName] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [instructorLevel, setInstructorLevel] = useState('');
  const [instructorId, setInstructorId] = useState(null);
  const [sedeId, setSedeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('instructorToken');
    const name = localStorage.getItem('instructorName');
    const nombreGuardado = localStorage.getItem('nombreInstructor');
    const apellidoGuardado = localStorage.getItem('apellidoInstructor');
    const telefonoGuardado = localStorage.getItem('telefonoInstructor');
    const level = localStorage.getItem('instructorLevel');
    const id = localStorage.getItem('instructorId');
    const sede = localStorage.getItem('sedeId');

    if (token) setInstructorToken(token);
    if (name) setInstructorName(name);
    if (nombreGuardado) setNombre(nombreGuardado);
    if (apellidoGuardado) setApellido(apellidoGuardado);
    if (telefonoGuardado) setTelefono(telefonoGuardado);
    if (level) setInstructorLevel(level);
    if (id) setInstructorId(id);
    if (sede) setSedeId(sede);
  }, []);

  const loginInstructor = (token, name, level, id, sede, nuevoNombre = '', nuevoApellido = '', nuevoTelefono = '') => {
    setInstructorToken(token);
    setInstructorName(name);
    setNombre(nuevoNombre);
    setApellido(nuevoApellido);
    setTelefono(nuevoTelefono);
    setInstructorLevel(level);
    setInstructorId(id);
    setSedeId(sede);

    localStorage.setItem('instructorToken', token);
    localStorage.setItem('instructorName', name);
    localStorage.setItem('nombreInstructor', nuevoNombre);
    localStorage.setItem('apellidoInstructor', nuevoApellido);
    localStorage.setItem('telefonoInstructor', nuevoTelefono);
    localStorage.setItem('instructorLevel', level);
    localStorage.setItem('instructorId', id);
    localStorage.setItem('sedeId', sede);
  };

  const logoutInstructor = () => {
    setInstructorToken(null);
    setInstructorName('');
    setNombre('');
    setApellido('');
    setTelefono('');
    setInstructorLevel('');
    setInstructorId(null);
    setSedeId(null);

    localStorage.removeItem('instructorToken');
    localStorage.removeItem('instructorName');
    localStorage.removeItem('nombreInstructor');
    localStorage.removeItem('apellidoInstructor');
    localStorage.removeItem('telefonoInstructor');
    localStorage.removeItem('instructorLevel');
    localStorage.removeItem('instructorId');
    localStorage.removeItem('sedeId');
  };

  return (
    <AuthInstructorContext.Provider
      value={{
        instructorToken,
        instructorName,
        nombre,
        apellido,
        telefono,
        instructorLevel,
        instructorId,
        sedeId,
        loginInstructor,
        logoutInstructor,
      }}
    >
      {children}
    </AuthInstructorContext.Provider>
  );
};

export const useInstructorAuth = () => useContext(AuthInstructorContext);