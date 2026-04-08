/*
 * Programador: Emir Segovia
 * Fecha Cración: 05 / 06 / 2024
 * Versión: 1.0
 *
 * Descripción:
 * Este archivo (AuthContext.jsx) es el componente el cual valida el login del usuario con un token.
 *
 * Tema: Renderizacion
 * Capa: Frontend
 * Contacto: emirvalles90f@gmail.com || 3865761910
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const normalizarVinculadaRRHH = (valor) => {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "number") return valor === 1;
  if (typeof valor === "string") {
    const limpio = valor.trim().toLowerCase();
    return limpio === "true" || limpio === "1";
  }
  return false;
};

export const AuthProvider = ({ children }) => {
  // Definir estados locales para el token de autenticación y el nombre de usuario
  const [authToken, setAuthToken] = useState(null);
  const [userName, setUserName] = useState("");
  const [userLevel, setUserLevel] = useState("");
  const [userLevelAdmin, setUserLevelAdmin] = useState(null);
  const [userId, setUserId] = useState(null);
  const [sedeName, setSedeName] = useState("");
  const [name, setName] = useState("");
  const [vinculadarrhh, setVinculadaRRHH] = useState(false);

  useEffect(() => {
    // Obtener el token y el nombre de usuario desde el localStorage
    const token = localStorage.getItem("authToken");
    const username = localStorage.getItem("userName");
    const level = localStorage.getItem("userLevel");
    const levelAdmin = localStorage.getItem("userLevelAdmin");
    const id = localStorage.getItem("userId");
    const sede = localStorage.getItem("sedeName");
    const storedName = localStorage.getItem("name");
    const vinculadaRRHH = localStorage.getItem("vinculadarrhh");
    
    // Si hay un token en el localStorage, establecerlo en el estado local
    if (token) {
      setAuthToken(token);
    }
    // Si hay un nombre de usuario en el localStorage, establecerlo en el estado local
    if (username) {
      setUserName(username);
    }
    if (level) {
      setUserLevel(level);
    }
    if (levelAdmin) {
    setUserLevelAdmin(parseInt(levelAdmin)); 
    }
    if (id) {
      setUserId(id);
    }
    if (sede) {
      setSedeName(sede);
    }
    if (storedName) setName(storedName);
    if (vinculadaRRHH !== null) {
      setVinculadaRRHH(normalizarVinculadaRRHH(vinculadaRRHH));
    }
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez al montar el componente

  const login = (token, username, level, id, sede, name, vinculadaRRHH, levelAdmin) => {
    const vinculadaNormalizada = normalizarVinculadaRRHH(vinculadaRRHH);

    // Establecer el token y el nombre de usuario en el estado local
    setAuthToken(token);
    setUserName(username);
    setName(name);
    setUserLevel(level);
    setUserLevelAdmin(levelAdmin);
    setUserId(id);
    setSedeName(sede);
    setVinculadaRRHH(vinculadaNormalizada);

    // Guardar el token y el nombre de usuario en el localStorage
    localStorage.setItem("authToken", token);
    localStorage.setItem("userName", username);
    localStorage.setItem("userLevel", level);
    localStorage.setItem("userId", id);
    localStorage.setItem("sedeName", sede);
    localStorage.setItem("name", name);
    localStorage.setItem("vinculadarrhh", vinculadaNormalizada ? "true" : "false");
    localStorage.setItem("userLevelAdmin", levelAdmin);
  };

  const logout = () => {
    // Limpiar el token y el nombre de usuario del estado local
    setAuthToken(null);
    setUserName("");
    setName("");
    setUserLevel("");
    setUserId(null);
    setSedeName("");
    setVinculadaRRHH(false);
    setUserLevelAdmin(null);

    // Remover el token y el nombre de usuario del localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userLevel");
    localStorage.removeItem("name");
    localStorage.removeItem("userId");
    localStorage.removeItem("sedeName");
    localStorage.removeItem("vinculadarrhh");
    localStorage.removeItem("userLevelAdmin");
  };

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userName,
        userLevel,
        userLevelAdmin,
        userId,
        sedeName,
        name,
        vinculadarrhh,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
