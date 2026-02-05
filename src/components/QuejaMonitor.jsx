/* Codigo hecho por Sergio Manrique
Fecha: 05/02/2025
Descripcion: Componente que monitorea nuevas quejas QR y notifica al usuario
*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../AuthContext';
import { solicitarPermisoVinculado, mostrarNotificacion } from "../Helpers/notificaciones";

const QuejaMonitor = () => {
  const { sedeName, userLevel, userName } = useAuth(); 

  const [ultimoIdNotificado, setUltimoIdNotificado] = useState(() => {
    const key = `ultimoIdQR_${userName}`;
    const guardado = localStorage.getItem(key);
    return guardado ? Number(guardado) : 0;
  });

  useEffect(() => {
    if (!userName) return; // Si no hay usuario logueado, no hace nada

    solicitarPermisoVinculado();

    const revisarQuejasNuevas = async () => {
      if (!sedeName && !userLevel || sedeName.toLowerCase() === "multisede") return;

      try {
        const { data } = await axios.get('http://localhost:8080/quejas/nuevas-qr', {
          params: {
            sedeName,
            userLevel,
            lastId: ultimoIdNotificado
          }
        });
        
        if (data && data.length > 0) {
          const mensaje = data.length === 1 
            ? `Nueva queja en ${data[0].sede}: ${data[0].motivo}`
            : `Tienes ${data.length} quejas QR nuevas de la última semana.`;

          mostrarNotificacion(
            "¡Alerta de Quejas QR!",
            mensaje,
            "/dashboard/quejas"
          );

          const idMasAlto = Math.max(...data.map(q => q.id));
          setUltimoIdNotificado(idMasAlto);
          localStorage.setItem(`ultimoIdQR_${userName}`, idMasAlto.toString());
        }
      } catch (error) {
        console.error("Error monitoreando quejas:", error);
      }
    };

    const interval = setInterval(revisarQuejasNuevas, 60000); 
    revisarQuejasNuevas(); 

    return () => clearInterval(interval);
  }, [sedeName, userLevel, userName, ultimoIdNotificado]); 

  return null;
};

export default QuejaMonitor;