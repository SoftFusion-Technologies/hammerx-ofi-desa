HAMMERX - Repositorio Oficial - 21/03/2024
---------------------------------------------
Descripción

Este repositorio sirve como base central para el desarrollo y gestión de versiones del proyecto HAMMERX. Está administrado por Soft y sus colaboradores. Es crucial mantenerlo constantemente actualizado, ya que se utiliza para el despliegue en producción.

Instrucciones de Uso

1)Clonar el Repositorio: Utiliza el comando git clone seguido de la URL del repositorio para obtener una copia local.

git clone https://github.com/SoftFusion-Technologies/HammerX---OFI.git

2)Actualizar Regularmente: Asegúrate de estar al día con los cambios realizados en el repositorio remoto antes de realizar cualquier modificación. Tambien haberte logeado con GitHub en Visual Studio Code y acceder al repositorio.

git pull origin main

Instrucciones para Trabajar con Ramas en Git 27/03/2024
-------------------------------------------------------
Crear una Nueva Rama en Git
Para comenzar a trabajar en una nueva función o solucionar un problema específico, es una buena práctica crear una nueva rama en Git. Esto permite mantener los cambios separados del código base hasta que estén listos para ser integrados.

1)Ejecutar el siguiente comando para crear una nueva rama:

git checkout -b nombre-de-la-rama

Esta rama se debe mantener actualizada a la ultima versión siempre, pull y continuar, un nombre de ejemplo para la rama propuesto es esta nomensclatura 

git checkout -b rama-v270324-hammer-benja

Utilizar la Nueva Rama

Una vez que has creado una nueva rama, hay que comenzar a trabajar en ella. Realizar las modificaciones necesarias en el código para implementar nuevas características o solucionar problemas. Sigue estos pasos para trabajar en la nueva rama:

1)Abri tu editor de código preferido.
2)Realiza los cambios necesarios en tus archivos de proyecto.
Programar


Agregar y Hacer Commit de tus Cambios
Una vez que hayas completado tus cambios en la nueva rama, es necesario agregarlos y hacer commit para guardar tus modificaciones. Sigue estos pasos:

En la terminal, ejecuta los siguientes comandos para agregar y hacer commit de tus cambios:

git add .
git commit -m "Mensaje descriptivo de tus cambios"


Subir la Rama a tu Repositorio en GitHub
Para compartir tus cambios con otros colaboradores o integrarlos con el código base, es necesario subir la nueva rama a tu repositorio en GitHub. Sigue estos pasos:

En la terminal, ejecuta el siguiente comando para subir la nueva rama a GitHub:

git push origin nombre-de-tu-rama


-------------------------------------------------------
Despliegue en Producción: Cuando sea necesario realizar un despliegue en producción, se utilizará el código de este repositorio. Asegúrate de que cualquier cambio esté completamente probado y listo para producción antes de fusionarlo con la rama principal (main).

Contacto
Si tienes alguna pregunta o inquietud relacionada con este repositorio, no dudes en ponerte en contacto con el equipo de desarrollo de SoftFusion a través de correo electrónico o abriendo un issue.

¡Gracias por contribuir al éxito de SoftFusion!
# hammerx-ofi-desa
