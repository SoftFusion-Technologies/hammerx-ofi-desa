/*
 * Programador: Rafael Peralta
 * Fecha Cración: 08 / 04 / 2024
 * Versión: 1.0
 *
 * Descripción: Página de pautas hammer.
 *
 *
 *  Tema: Pautas
 *  Capa: Frontend
 */

import React, { useEffect } from "react";
import Navbar from "../components/header/Navbar";
import Footer from "../components/footer/Footer";
import { logo } from "../images/svg/index.js";

const Pautas = () => {
  useEffect(() => {
    document.title = "Pautas";
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-white py-16">
        <img src={logo} alt="logo" width={500} className="mx-auto mb-5" />

        <div className="px-10 lg:px-14 text-white pt-10 bg-[#fc4b08] w-11/12 rounded-xl mx-auto py-5">
          <h3>
            <b>PAUTAS DE CONVIVENCIA HAMMER</b>
          </h3>
          <p className="py-2">
            Para que todos los miembros de nuestro gimnasio HAMMER podamos
            disfrutar de las instalaciones es muy importante conocer y cumplir
            con nuestras pautas de convivencia. Es por ello, que todos los
            socios al momento de contratar con nosotros asumen la
            responsabilidad de cumplir con nuestras pautas de convivencia.
          </p>
          <ol className="p-5 text-sm">
            <li>
              1. Cuidar las instalaciones, equipos y servicios de HAMMER de
              manera responsable.
            </li>
            <li>
              2. Está prohibida la utilización de las sedes, instalaciones,
              maquinaria y/o equipos para un fin que sea distinto para el cual
              fueron concebidas: entrenamiento físico.
            </li>
            <li>
              3. Orden: Ordenar y devolver los equipos y accesorios al mismo
              lugar del cual fueron tomados.
            </li>
            <li>
              4. Utilizar los equipos de a uno a la vez y esperar la
              disponibilidad de las máquinas respetando el orden de llegada.
            </li>
            <li>
              5. No está permitido quedarse sentado en los equipos o máquinas
              sin utilizarlos cuando hay otros socios que los quieran utilizar.
            </li>
            <li>
              6. Es obligatorio compartir los equipos y las instalaciones, está
              prohibido negarse a compartir con el resto de los socios.
            </li>
            <li>
              7. Los socios declaran bajo juramento estar en plenas condiciones
              de salud para realizar actividades físicas.
            </li>
            <li>
              8. Está prohibido cualquier conducta que sea contraria a la moral
              y a las buenas costumbres y que sea contraria a la pacífica
              convivencia entre los socios y el personal de cada una de las
              sedes.
            </li>
            <li>
              9. Está prohibido comercializar bienes o servicios en las
              instalaciones.
            </li>
            <li>
              10. Está prohibido gritar, insultar o dirigirse de cualquier
              manera inapropiada respecto de los demás socios y empleados de la
              sede.
            </li>
            <li>
              11. Está prohibido agredir física o verbalmente a otros socios y/o
              empleados de las sedes.
            </li>
            <li>
              12. Es obligatorio la utilización de ropa y calzado apropiados
              para la práctica deportiva y entrenamiento en general. Está
              prohibido ingresar a las sedes desnudas o con el torso
              descubierto.
            </li>
            <li>
              13. No se puede comer, fumar o ingerir cualquier tipo de drogas
              dentro de las instalaciones de las sedes.
            </li>
            <li>14. No está permitido entrar a las sedes con animales.</li>
            <li>
              15. Está prohibido el hurto o robo y la comisión de cualquier tipo
              de delitos.
            </li>
          </ol>
          <p>
            La enumeración de las pautas de convivencia es meramente enunciativa
            y no taxativa por lo que HAMMER se reserva el derecho de modificar
            las mismas de manera unilateral según lo crea conveniente conforme
            sus valores. En caso de incumplimiento con las pautas de convivencia
            HAMMER podrá aplicar cualquiera de las siguientes sanciones que
            estime convenientes: 1_ llamado de atención; 2_ multa; 3_
            suspensión; 4_ expulsión mediante la rescisión del contrato. Las
            sanciones podrán ser comunicadas por escrito, en forma verbal o de
            manera digital a través de un mail, mensaje de texto o chat. No
            obstante lo cual, en ningún caso, la aplicación de cualquiera de las
            sanciones previstas podrá significar que HAMMER renuncia de
            cualquier manera su derecho de reclamar por los daños y perjuicios
            que la conducta del socio pudiera ocasionar. Sin perjuicio de lo
            expuesto, HAMMER se reserva el derecho de admisión de socios y/o
            invitados cuando lo estime razonablemente conveniente y a su
            exclusivo criterio. Los socios utilizarán las instalaciones, equipos
            y maquinarias bajo su propia responsabilidad y se obligan a mantener
            indemne y liberaran a HAMMER, sus empleados y directores de
            cualquier responsabilidad derivada de su uso.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Pautas;
