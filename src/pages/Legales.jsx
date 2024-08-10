/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de legales hammer.
 *
 *
 *  Tema: Legales
 *  Capa: Frontend
 */

import React, { useEffect } from "react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import { logo } from "../images/svg/index.js";

const Legales = () => {
  useEffect(() => {
    document.title = "Legales";
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-white py-16">
        <img src={logo} alt="logo" width={500} className="mx-auto mb-5" />

        <div className="px-10 lg:px-14 text-white bg-[#fc4b08] w-11/12 rounded-xl mx-auto py-5">
          <h3 className="text-xl">
            <b>Legales</b>
          </h3>
          <p className="pt-1">
            En HAMMER consideramos que la protección de los datos personales de
            nuestros usuarios es muy importante. En consecuencia, nos
            comprometemos a hacer un uso responsable de la información personal
            que nos brinden por cualquier medio a fines de permitirles operar
            con seguridad con nosotros.
          </p>
          <h3 className="text-xl pt-5">
            <b>Datos personales recabados</b>
          </h3>
          <p className="pt-1">
            Hammer podrá recabar y solicitar solo las siguientes categorías de
            datos personales:
          </p>
          <ol className="p-5 text-sm">
            <li>
              1. Datos de contacto, incluyendo nombre, apellido, correo
              electrónico, número de teléfono y dirección de envío y
              facturación.
            </li>
            <li>
              2. Información de acceso y cuenta, incluyendo nombre de usuario,
              contraseña, ID de usuario único y MAC ID del celular.
            </li>
            <li>
              3. Datos personales incluyendo sexo, ciudad natal y fecha de
              nacimiento.
            </li>
            <li>4. Información de pago o tarjeta de crédito.</li>
            <li>5. Imágenes, fotos y videos.</li>
            <li>
              6. Datos sobre las características físicas, incluyendo el peso, la
              estatura y las medidas corporales.
            </li>
            <li>
              7. Datos de actividad física proporcionados por usted o generados
              a través de nuestra Aplicación (tiempo, duración, distancia,
              ubicación, cantidad de calorías).
            </li>
            <li>
              8. Preferencias personales incluyendo su lista de deseos, así como
              las preferencias de marketing y cookies.
            </li>
            <li>9. Datos de geolocalización.</li>
          </ol>
          <p>
            Asimismo, es importante informarle que no se recabarán datos
            personales considerados por la LEY DE PROTECCION DE DATOS PERSONALES
            como sensibles, para las finalidades enumeradas más adelante.
          </p>
          <h3 className="text-xl pt-5">
            <b>Finalidades</b>
          </h3>
          <p>
            Sus datos personales serán tratados exclusivamente para las
            siguientes finalidades:
          </p>
          <h3 className="text-xl pt-3">
            <b>a. Finalidades primarias</b>
          </h3>
          <ol className="px-5 pt-2 text-sm">
            <li>1. Identificarlo como usuario de HAMMER.</li>
            <li>
              2. Creación, gestión, control y administración del registro y/o la
              cuenta del usuario.
            </li>
            <li>3. Darlo de alta en nuestros sistemas y/o bases de datos.</li>
            <li>
              4. Creación, gestión, control y administración del perfil del
              usuario.
            </li>
            <li>
              5. Hacer uso de las funcionalidades incluidas dentro de la
              aplicación.
            </li>
            <li>
              6. Brindarle acceso a la información contenida dentro de la
              aplicación.
            </li>
            <li>
              7. Informarle acerca de los servicios y/o productos, así como
              ofertas comerciales y/o beneficios ofrecidos por HAMMER, en el
              supuesto y momento que solicite dicha información, incluyendo sus
              modalidades y precios.
            </li>
            <li>
              8. Proporcionarle una cotización respecto de los servicios y/o
              productos ofrecidos por HAMMER en los que, en su caso, pudiese
              estar interesado.
            </li>
            <li>9. Estadística y registro histórico de usuarios.</li>
          </ol>
          <p className="pt-2">
            Adicionalmente podremos tratar sus datos personales para las
            siguientes finalidades secundarias.
          </p>
          <h3 className="text-xl pt-3">
            <b>b. Finalidades secundarias</b>
          </h3>
          <p className="pt-2">
            1. En caso de que haya solicitado información respecto de los
            productos y/o servicios, ofertas comerciales y/o beneficios que
            HAMMER ofrece, y no se encuentre interesado en contratarlos en el
            momento y supuesto en que lo haya solicitado, posteriormente
            podremos enviarle actualizaciones sobre publicidad, promociones y/o
            información sobre nuevos productos y/o servicios, ofertas
            comerciales y/o beneficios que pudiesen interesarle, a través de
            distintos medios, como pueden ser vía telefónica, vía correo
            electrónico, vía chat (WhatsApp), vía SMS, así como a través de
            cualquier medio que solicite. Asimismo, HAMMER podrá captar, y
            registrar, la dirección MAC de los dispositivos móviles del Usuario.
            También es posible que utilicemos datos acerca de cómo usted utiliza
            nuestra aplicación para prevenir o detectar fraudes, abusos, usos
            ilegales e infracciones de nuestros Términos de uso y para cumplir
            con las órdenes judiciales, solicitudes gubernamentales o leyes
            aplicables.
          </p>
          <h3 className="text-xl pt-3">
            <b>Protección y Gestión de sus Datos Personales.</b>
          </h3>
          <p className="py-2">
            Encriptación y Seguridad: Utilizamos una variedad de medidas de
            seguridad técnica y organizativa, incluyendo herramientas de
            encriptación y autenticación, para mantener la seguridad de sus
            datos personales. Sus datos personales están contenidos detrás de
            redes seguras y sólo son accesibles por un número limitado de
            personas que tienen derechos especiales de acceso a estos sistemas.
          </p>
          <h3 className="text-xl pt-3">
            <b>Cambios a nuestra Política de Privacidad</b>
          </h3>
          <p className="py-2">
            La ley aplicable y nuestras prácticas pueden cambiar con el tiempo.
            Si decidimos actualizar nuestra Política, publicaremos los cambios
            en nuestra Aplicación. Si cambiamos materialmente la forma en que
            tratamos los datos personales, le proporcionaremos un aviso previo
            o, cuando sea legalmente necesario, solicitaremos su consentimiento
            antes de llevar a cabo dichos cambios. Le recomendamos
            encarecidamente que lea nuestra Política y se mantenga informado de
            nuestras prácticas. Fecha de última actualización: DICIEMBRE 2022
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Legales;
