import { useState } from 'react';
import {
  close,
  musc1,
  musc2,
  musc3,
  cardio1,
  cardio2,
  cardio3,
  grupales1,
  grupales2,
  grupales3,
  bajoImpacto1,
  bajoImpacto2,
  bajoImpacto3,
  kids1,
  kids2,
  kids3,
  guionesbla
} from '../../images/index';
import '../../styles/main/servicios.css';
import flecha from '../../images/flecha.png';

const Servicios = () => {
  const [servicio, setServicio] = useState('');

  const verMusculacion = () => setServicio('musculacion');
  const verCardio = () => setServicio('cardio');
  const verClasesGrupales = () => setServicio('clasesgrupales');
  const verBajoImpacto = () => setServicio('bajoimpacto');
  const verKids = () => setServicio('actividadeskids');
  const cerrarVentana = () => setServicio('');

  // Estado para la imagen de fondo
  const [fondoMusculacion, setFondoMusculacion] = useState(musc1);
  const [fondoCardio, setFondoCardio] = useState(cardio1);
  const [fondoGrupales, setFondoGrupales] = useState(grupales1);
  const [fondoBajoImpacto, setFondoBajoImpacto] = useState(bajoImpacto1);
  const [fondoKids, setFondoKids] = useState(kids1);

  // Fondos para el cuadro de musculacion
  const cambiarFondoMusc = () => setFondoMusculacion(musc1);
  const cambiarFondoMusc2 = () => setFondoMusculacion(musc2);
  const cambiarFondoMusc3 = () => setFondoMusculacion(musc3);

  // Fondos para el cuadro de Cardio
  const cambiarFondoCardio = () => setFondoCardio(cardio1);
  const cambiarFondoCardio2 = () => setFondoCardio(cardio2);
  const cambiarFondoCardio3 = () => setFondoCardio(cardio3);

  // Fondos para el cuadro de Grupales
  const cambiarFondoGrupales = () => setFondoGrupales(grupales1);
  const cambiarFondoGrupales2 = () => setFondoGrupales(grupales2);
  const cambiarFondoGrupales3 = () => setFondoGrupales(grupales3);

  // Fondos para el cuadro de Bajo Impacto
  const cambiarFondoBajoImpacto = () => setFondoBajoImpacto(bajoImpacto1);
  const cambiarFondoBajoImpacto2 = () => setFondoBajoImpacto(bajoImpacto2);
  const cambiarFondoBajoImpacto3 = () => setFondoBajoImpacto(bajoImpacto3);

  // Fondos para el cuadro de Kids
  const cambiarFondoKids = () => setFondoKids(kids1);
  const cambiarFondoKids2 = () => setFondoKids(kids2);
  const cambiarFondoKids3 = () => setFondoKids(kids3);

  // array con los servicios para poder pasarlos entre si
  const arrayServicios = [
    'musculacion',
    'cardio',
    'clasesgrupales',
    'bajoimpacto',
    'actividadeskids'
  ];

  return (
    <div
      className="main2 dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800 bg-gradient-to-b from-orange-600 to-[#fc4b08] relative"
      id="activities"
    >
      <img
        className="w-8 h-80 absolute top-10 left-0 max-sm:hidden"
        src={guionesbla}
        alt="Guiones"
      />
      <img
        className="w-8 h-80 absolute bottom-10 right-0 max-sm:hidden"
        src={guionesbla}
        alt="Guiones"
      />

      <div
        className="text-center px-[5%] text-black dark:text-white actividades"
        id="servs1"
      >
        <h1
          data-aos="zoom-in-up"
          className="text-white font-bignoodle text-[50px] font-bold tracking-wider pb-5"
        >
          Tus Actividades
        </h1>

        <p
          data-aos="zoom-in-up"
          className="font-messina text-md text-orange-100 text-[16px] dark:text-white"
        >
          En HAMMERX contamos con clases individuales y grupales, de bajo y de
          alto impacto, todas supervisadas y dictadas por profesores capacitados
          para cuidarte y diseñadas para adaptarse a tu nivel y objetivos.
          ¡Elijamos juntos la mas indicada para vos!
        </p>

        <div className="serv">
          <div className="contenedor">
            <div data-aos="zoom-in-right" id="servicio" className="musculacion">
              <p>Musculación</p>
              <a href="#vermas">
                <button onClick={verMusculacion}>Ver más</button>
              </a>
            </div>

            <div data-aos="zoom-in-right" id="servicio" className="cardio">
              <p>Cardio</p>
              <a href="#vermas">
                <button onClick={verCardio}>Ver más</button>
              </a>
            </div>

            <div data-aos="zoom-in-up" id="servicio" className="clasesgrupales">
              <p>Clases grupales</p>
              <a href="#vermas">
                <button onClick={verClasesGrupales}>Ver más</button>
              </a>
            </div>

            <div data-aos="zoom-in-left" id="servicio" className="bajoimpacto">
              <p>Bajo impacto</p>
              <a href="#vermas">
                <button onClick={verBajoImpacto}>Ver más</button>
              </a>
            </div>

            <div
              data-aos="zoom-in-left"
              id="servicio"
              className="actividadeskids"
            >
              <p>Kids</p>
              <a href="#vermas">
                <button onClick={verKids}>Ver más</button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {servicio === 'musculacion' && (
        <>
          <div id="vermas" className="espacio"></div>{' '}
          {/* Div da espacio entre la caja y el nav */}
          <div className="vermas">
            <div
              onClick={() => setServicio(arrayServicios[4])}
              className="pt-0"
            >
              <img
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>

            <div className="verMasMusc">
              <a href="#servs1">
                <img
                  src={close}
                  className="img-close"
                  onClick={cerrarVentana}
                  alt="Cerrar Ventana"
                />
              </a>

              <div className="vermasbox">
                <div
                  className="images"
                  style={{
                    backgroundImage: `url(${fondoMusculacion})`
                  }}
                >
                  <ul>
                    <li onClick={cambiarFondoMusc}></li>
                    <li onClick={cambiarFondoMusc2}></li>
                    <li onClick={cambiarFondoMusc3}></li>
                  </ul>

                  <a href="#servs1">
                    <img
                      src={close}
                      className="img-close"
                      onClick={cerrarVentana}
                      alt="Cerrar Ventana"
                    />
                  </a>
                </div>

                <div className="vermas-cont">
                  <h1>Musculación</h1>
                  <p>
                    ¿Primera vez entrenando o ya contas con experiencia? No te
                    preocupes, porque en nuestros salones de musculación vas a
                    contar con una gran variedad y calidad de máquinas y pesos
                    libres para entrenar la fuerza, aumentar la musculatura y
                    tonificar el cuerpo. Siempre guiad@ por nuestros
                    instructores y además dispondrás de diferentes rutinas
                    pensadas para que arranques de 0 y para desafiarte todos los
                    días.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setServicio(arrayServicios[1])}
              className="pt-0"
            >
              <img
                className="h-10 ml-5 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>
          </div>
        </>
      )}

      {servicio === 'cardio' && (
        <>
          <div id="vermas" className="espacio"></div>{' '}
          <div className="vermas">
            <div
              onClick={() => setServicio(arrayServicios[0])}
              className="pt-0"
            >
              <img
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>

            <div className="verMasMusc">
              <a href="#servs1">
                <img
                  src={close}
                  className="img-close"
                  onClick={cerrarVentana}
                  alt="Cerrar Ventana"
                />
              </a>

              <div className="vermasbox">
                <div
                  className="images"
                  style={{
                    backgroundImage: `url(${fondoCardio})`
                  }}
                >
                  <ul>
                    <li onClick={cambiarFondoCardio}></li>
                    <li onClick={cambiarFondoCardio2}></li>
                    <li onClick={cambiarFondoCardio3}></li>
                  </ul>

                  <a href="#servs1">
                    <img
                      src={close}
                      className="img-close"
                      onClick={cerrarVentana}
                      alt="Cerrar Ventana"
                    />
                  </a>
                </div>

                <div className="vermas-cont">
                  <h1>Cardio</h1>
                  <p>
                    ¿Pensas que hacer cardio es aburrido? Con nuestro plan de
                    musculacion tambien tendrás a disposición todos nuestros
                    equipos de cardio, cintas, bicis, elípticos, remos,
                    airbikes, entre otros, para que elijas el más divertido y
                    apto para vos, con los que podras quemar todas las calorías
                    que te propongas, o bien para calentar un ratito antes de
                    comenzar tu rutina 💪🏻
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setServicio(arrayServicios[2])}
              className="pt-0"
            >
              <img
                className="h-10 ml-5 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>
          </div>
        </>
      )}

      {servicio === 'clasesgrupales' && (
        <>
          <div id="vermas" className="espacio"></div>{' '}
          <div className="vermas">
            <div
              onClick={() => setServicio(arrayServicios[1])}
              className="pt-0"
            >
              <img
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>

            <div className="verMasMusc">
              <a href="#servs1">
                <img
                  src={close}
                  className="img-close"
                  onClick={cerrarVentana}
                  alt="Cerrar Ventana"
                />
              </a>

              <div className="vermasbox">
                <div
                  className="images"
                  style={{
                    backgroundImage: `url(${fondoGrupales})`
                  }}
                >
                  <ul>
                    <li onClick={cambiarFondoGrupales}></li>
                    <li onClick={cambiarFondoGrupales2}></li>
                    <li onClick={cambiarFondoGrupales3}></li>
                  </ul>

                  <a href="#servs1">
                    <img
                      src={close}
                      className="img-close"
                      onClick={cerrarVentana}
                      alt="Cerrar Ventana"
                    />
                  </a>
                </div>

                <div className="vermas-cont">
                  <h1>Clases Grupales</h1>
                  <p>
                    ¿Y si probas entrenando en compañía con nuestras clases
                    grupales? Crossfit, Funcional, Zumba, Aerobics y muchas
                    otras actividades para que puedas elegir según tu gusto y
                    tus objetivos, siempre vas a tener a tu disposición coachs
                    que te van a orientar para que arranques desde el nivel más
                    básico o para perfeccionarte si ya contas con experiencia
                    previa. ¡Consulta las clases disponibles en tu sede! Si
                    sentís que las actividades individuales no son para vos aquí
                    encontraras tu lugar 😀
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setServicio(arrayServicios[3])}
              className="pt-0"
            >
              <img
                className="h-10 ml-5 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>
          </div>
        </>
      )}

      {servicio === 'bajoimpacto' && (
        <>
          <div id="vermas" className="espacio"></div>{' '}
          <div className="vermas">
            <div
              onClick={() => setServicio(arrayServicios[2])}
              className="pt-0"
            >
              <img
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>

            <div className="verMasMusc">
              <a href="#servs1">
                <img
                  src={close}
                  className="img-close"
                  onClick={cerrarVentana}
                  alt="Cerrar Ventana"
                />
              </a>

              <div className="vermasbox">
                <div
                  className="images"
                  style={{
                    backgroundImage: `url(${fondoBajoImpacto})`
                  }}
                >
                  <ul>
                    <li onClick={cambiarFondoBajoImpacto}></li>
                    <li onClick={cambiarFondoBajoImpacto2}></li>
                    <li onClick={cambiarFondoBajoImpacto3}></li>
                  </ul>

                  <a href="#servs1">
                    <img
                      src={close}
                      className="img-close"
                      onClick={cerrarVentana}
                      alt="Cerrar Ventana"
                    />
                  </a>
                </div>

                <div className="vermas-cont">
                  <h1>Bajo Impacto</h1>
                  <p>
                    ¿Sabías que también contamos con clases de bajo impacto?
                    Pilates, Yoga y talleres para 3era edad (consulta las
                    disponibles en tu sede). Vas a trabajar sin impacto para
                    fortalecer todo tu cuerpo, mejorar postura y recuperar la
                    movilidad perdida. Son ideales para aumentar la fuerza y
                    flexibilidad, rehabilitarte de lesiones, complementar y
                    especializarte en otras actividades y para conectar la mente
                    con tu cuerpo 🧘
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setServicio(arrayServicios[4])}
              className="pt-0"
            >
              <img
                className="h-10 ml-5 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>
          </div>
        </>
      )}

      {servicio === 'actividadeskids' && (
        <>
          <div id="vermas" className="espacio"></div>{' '}
          <div className="vermas">
            <div
              onClick={() => setServicio(arrayServicios[3])}
              className="pt-0"
            >
              <img
                className="h-10 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>

            <div className="verMasMusc">
              <a href="#servs1">
                <img
                  src={close}
                  className="img-close"
                  onClick={cerrarVentana}
                  alt="Cerrar Ventana"
                />
              </a>

              <div className="vermasbox">
                <div
                  className="images"
                  style={{
                    backgroundImage: `url(${fondoKids})`
                  }}
                >
                  <ul>
                    <li onClick={cambiarFondoKids}></li>
                    <li onClick={cambiarFondoKids2}></li>
                    <li onClick={cambiarFondoKids3}></li>
                  </ul>

                  <a href="#servs1">
                    <img
                      src={close}
                      className="img-close"
                      onClick={cerrarVentana}
                      alt="Cerrar Ventana"
                    />
                  </a>
                </div>

                <div className="vermas-cont">
                  <h1>Actividades Kids</h1>
                  <p>
                    ¿Sabías lo importante que es la actividad física en los
                    niños? Por eso contamos con diferentes actividades grupales
                    para ellos. Todas están guiadas por profes y pensadas para
                    divertirse, y para acompañar su desarrollo tanto físico como
                    social, desde las etapas más tempranas.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setServicio(arrayServicios[0])}
              className="pt-0"
            >
              <img
                className="h-10 ml-5 transform rotate-180 cursor-pointer transition hover:invert"
                src={flecha}
                alt=""
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Servicios;
