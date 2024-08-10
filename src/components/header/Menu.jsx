import React, { useState } from 'react';
import '../../styles/header/logomenu.css';

export default function Menu() {
    const [isActive, setIsActive] = useState(false);

    const animateBars = () => {
        setIsActive(!isActive);
    };

    return (
        <div className={`bars__menu ${isActive ? 'active' : ''}`} onClick={animateBars}>
            <span className="line1__bars-menu bg-black dark:bg-white"></span>
            <span className="line2__bars-menu bg-black dark:bg-white"></span>
            <span className="line3__bars-menu bg-black dark:bg-white"></span>
        </div>
    );
}