import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthInstructorContext = createContext();

export const AuthInstructorProvider = ({ children }) => {
  const [instructorToken, setInstructorToken] = useState(null);
  const [instructorName, setInstructorName] = useState('');
  const [instructorLevel, setInstructorLevel] = useState('');
  const [instructorId, setInstructorId] = useState(null);
  const [sedeId, setSedeId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('instructorToken');
    const name = localStorage.getItem('instructorName');
    const level = localStorage.getItem('instructorLevel');
    const id = localStorage.getItem('instructorId');
    const sede = localStorage.getItem('sedeId');

    if (token) setInstructorToken(token);
    if (name) setInstructorName(name);
    if (level) setInstructorLevel(level);
    if (id) setInstructorId(id);
    if (sede) setSedeId(sede);
  }, []);

  const loginInstructor = (token, name, level, id, sede) => {
    setInstructorToken(token);
    setInstructorName(name);
    setInstructorLevel(level);
    setInstructorId(id);
    setSedeId(sede);

    localStorage.setItem('instructorToken', token);
    localStorage.setItem('instructorName', name);
    localStorage.setItem('instructorLevel', level);
    localStorage.setItem('instructorId', id);
    localStorage.setItem('sedeId', sede);
  };

  const logoutInstructor = () => {
    setInstructorToken(null);
    setInstructorName('');
    setInstructorLevel('');
    setInstructorId(null);
    setSedeId(null);

    localStorage.removeItem('instructorToken');
    localStorage.removeItem('instructorName');
    localStorage.removeItem('instructorLevel');
    localStorage.removeItem('instructorId');
    localStorage.removeItem('sedeId');
  };

  return (
    <AuthInstructorContext.Provider
      value={{
        instructorToken,
        instructorName,
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