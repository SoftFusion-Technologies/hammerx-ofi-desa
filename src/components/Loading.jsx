/*
 * Programador: Benjamin Orellana
 * Fecha Cración: 01 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción:
 *  Este archivo (Loading.jsx) contiene el componente de carga utilizado para indicar
 *  al usuario que la aplicación está cargando o procesando datos. El componente
 *  consiste en un conjunto de puntos de carga animados y una imagen de logo.
 *  Los puntos de carga animados se muestran en una secuencia mientras que
 *  el logo se muestra en el centro de la página.
 *
 *  Tema: Componente de Carga
 *  Capa: Frontend
 *  Contacto: benjamin.orellanaof@gmail.com || 3863531891
 * 
 */

import React from 'react';
import '../styles/Loading.css';
import { logohammer, logoloading } from '../images';

/**
 * Componente de carga utilizado para indicar al usuario que la aplicación está
 * cargando o procesando datos.
 * 
 * @returns {JSX.Element} Elemento JSX que representa el componente de carga.
 */
const Loading = () => {
    return (
        <div>
            {/* Conjunto de puntos de carga animados */}
            <div className="sk-chase">
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
                <div className="sk-chase-dot"></div>
            </div>

            {/* Imagen del logo */}
            <div className="container-logo">
                <img src={logoloading} alt="logo" className="logo-centered" />
            </div>
        </div>
    );
};

export default Loading;
