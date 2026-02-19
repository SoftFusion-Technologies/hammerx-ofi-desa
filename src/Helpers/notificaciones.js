 /* 
 Sergio Manrique - 05/02/2025
 Descripcion: Funciones para manejar el Servicio de notificaciones del navegador
 */

export const solicitarPermisoVinculado = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") {
    await Notification.requestPermission();
  }
};

export const mostrarNotificacion = (titulo, cuerpo, url) => {
  if (Notification.permission === "granted") {
    const n = new Notification(titulo, {
      body: cuerpo,
      icon: "/images/logoicon.png", // Ruta al logo HX
      requireInteraction: true, // Mantiene la notificación hasta que el usuario interactúe
    });

    n.onclick = () => {
      window.focus();
      window.location.href = url;
    };
  }
};