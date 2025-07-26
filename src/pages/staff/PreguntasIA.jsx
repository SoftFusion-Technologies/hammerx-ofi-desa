import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GiMonoWheelRobot } from 'react-icons/gi';
import { FaTrash } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';
import ParticlesBackground from '../../components/ParticlesBackground';
import NavbarStaff from './NavbarStaff';
import Footer from '../../components/footer/Footer';
import ChunkIAModal from './ChunkIAModal';
import ChunkIAAdmin from './ChunkIAAdmin'; // Ajustá el path si es necesario

export default function PreguntasIA({}) {
  const [pregunta, setPregunta] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [preguntaSeleccionada, setPreguntaSeleccionada] = useState(null);
  const finalRef = useRef(null);

  const { userId, userLevel, userName } = useAuth();

  const [nuevaPregunta, setNuevaPregunta] = useState('');
  const [nuevaRespuesta, setNuevaRespuesta] = useState('');
  const [nuevoContexto, setNuevoContexto] = useState('');
  const [mostrarModalManual, setMostrarModalManual] = useState(false);

  const [scrollAlFinal, setScrollAlFinal] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoTexto, setNuevoTexto] = useState('');
  const [mostrarModalChunk, setMostrarModalChunk] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Cargar historial desde DB
  const cargarHistorial = async () => {
    try {
      const res = await fetch('http://localhost:8080/preguntas-ia');
      const data = await res.json();
      setHistorial(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const enviarPregunta = async () => {
    if (!pregunta.trim()) return;

    const nuevaPreguntaObj = { tipo: 'user', contenido: pregunta };
    setMensajes((prev) => [...prev, nuevaPreguntaObj]);
    setCargando(true);
    setScrollAlFinal(true);

    try {
      const res = await fetch(
        'http://localhost:8080/preguntar-ia-con-contexto',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pregunta })
        }
      );

      const data = await res.json();

      const nuevaRespuesta = {
        tipo: 'ia',
        contenido: data.respuesta || 'No se pudo obtener respuesta.'
      };

      setMensajes((prev) => [...prev, nuevaRespuesta]);
      setPregunta('');
      cargarHistorial();
      setScrollAlFinal(true);
    } catch (error) {
      console.error('Error al preguntar con contexto:', error);
    } finally {
      setCargando(false);
    }
  };

  const seleccionarDesdeHistorial = (item) => {
    setPreguntaSeleccionada(item);
    setMensajes([
      { tipo: 'user', contenido: item.pregunta },
      { tipo: 'ia', contenido: item.respuesta }
    ]);
  };

  const eliminarPregunta = async (id) => {
    if (!window.confirm('¿Eliminar esta pregunta?')) return;
    try {
      await fetch(`http://localhost:8080/preguntas-ia/${id}`, {
        method: 'DELETE'
      });
      cargarHistorial();
      if (preguntaSeleccionada?.id === id) {
        setMensajes([]);
        setPreguntaSeleccionada(null);
      }
    } catch (error) {
      console.error('Error eliminando pregunta:', error);
    }
  };

  const registrarPreguntaManual = async () => {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) return;

    try {
      // 1. Guardar la pregunta manual
      const resPregunta = await fetch('http://localhost:8080/preguntas-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: nuevaPregunta,
          respuesta: nuevaRespuesta,
          user_id: userId,
          fuente: 'manual',
          contexto: nuevoContexto
        })
      });

      if (!resPregunta.ok) {
        const errData = await resPregunta.json();
        throw new Error(errData.mensaje || 'Error al guardar la pregunta');
      }

      // 2. Crear automáticamente el chunk si no existe
      const resChunk = await fetch(
        'http://localhost:8080/chunks-ia/crear-si-no-existe',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            titulo: nuevaPregunta,
            texto: nuevaRespuesta
          })
        }
      );

      const dataChunk = await resChunk.json();

      if (!resChunk.ok) {
        throw new Error(
          dataChunk.mensajeError || 'Error al guardar el chunk automático'
        );
      }

      // 3. Limpiar estados y notificar
      setNuevaPregunta('');
      setNuevaRespuesta('');
      setNuevoContexto('');
      cargarHistorial();
      alert('✅ Pregunta y chunk guardados correctamente.');
    } catch (error) {
      console.error('❌ Error registrando pregunta manual:', error.message);
      alert('❌ ' + error.message);
    }
  };

  return (
    <>
      <NavbarStaff />
      <ParticlesBackground></ParticlesBackground>
      <div
        className="
  min-h-screen 
  bg-gradient-to-br 
  from-[#181818] to-[#292929]
  pt-6 pb-14
  transition-colors duration-500
"
      >
        <div className="min-h-screen p-4 pt-20">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Columna izquierda - Historial */}
            <div className="bg-white p-4 rounded-xl shadow-lg md:col-span-1 h-[600px] overflow-y-auto">
              <h2 className="font-bignoodle text-lg font-bold text-gray-700 mb-4">
                Historial
              </h2>
              <input
                type="text"
                placeholder="Buscar en historial..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="w-full mb-3 px-3 py-2 rounded border"
              />
              {historial.length === 0 && (
                <p className="text-sm text-gray-400">No hay preguntas aún.</p>
              )}
              {historial
                .filter((item) =>
                  item.pregunta.toLowerCase().includes(filtro.toLowerCase())
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="group flex justify-between items-start mb-3 p-2 bg-gray-50 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <div
                      onClick={() => seleccionarDesdeHistorial(item)}
                      className="text-sm text-gray-800 w-full pr-2"
                    >
                      {item.pregunta.slice(0, 60)}
                    </div>
                    {userLevel === 'admin' && (
                      <button
                        onClick={() => eliminarPregunta(item.id)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
            </div>

            {/* Columna derecha - Chat + Input */}
            <div className="md:col-span-2 bg-white shadow-2xl rounded-2xl p-6 flex flex-col justify-between h-[600px]">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bignoodle text-3xl font-bold text-center text-[#fc4b08] flex items-center justify-center gap-2 mb-4"
              >
                <GiMonoWheelRobot />
                Preguntale a la IA
              </motion.h1>

              <div className="flex-1 overflow-y-auto space-y-4">
                {mensajes.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      opacity: 0,
                      x: msg.tipo === 'user' ? 100 : -100
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`max-w-[80%] px-4 py-2 rounded-xl shadow-md text-white ${
                      msg.tipo === 'user'
                        ? 'bg-[#343333] ml-auto text-right'
                        : 'bg-[#fc4b08] mr-auto text-left'
                    }`}
                  >
                    {msg.contenido}
                  </motion.div>
                ))}
                <div ref={finalRef} />
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-2 space-y-2 sm:space-y-0">
                <input
                  type="text"
                  placeholder="Escribí tu pregunta..."
                  value={pregunta}
                  onChange={(e) => setPregunta(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enviarPregunta()}
                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 w-full"
                />

                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    onClick={enviarPregunta}
                    className="bg-[#fc4b08] hover:bg-orange-600 text-white font-bold px-4 py-2 rounded-lg w-full sm:w-auto"
                    disabled={cargando}
                  >
                    {cargando ? 'Pensando...' : 'Preguntar'}
                  </button>

                  {userLevel === 'admin' && (
                    <button
                      onClick={() => setMostrarModalManual(true)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-lg w-full sm:w-auto"
                    >
                      + Pregunta Manual
                    </button>
                  )}
                  {userLevel === 'admin' && (
                    <button
                      onClick={() => setMostrarModalChunk(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg w-full sm:w-auto"
                    >
                      + Chunk IA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          {mostrarModalManual && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-end z-50">
              <div className="bg-white w-full max-w-md p-6 shadow-xl rounded-l-2xl overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-[#fc4b08]">
                    Registrar pregunta manual
                  </h2>
                  <button
                    onClick={() => setMostrarModalManual(false)}
                    className="text-gray-600 hover:text-red-500 font-bold text-xl"
                  >
                    ×
                  </button>
                </div>

                <textarea
                  placeholder="Escribí la pregunta..."
                  value={nuevaPregunta}
                  onChange={(e) => setNuevaPregunta(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-3"
                />
                <textarea
                  placeholder="Escribí la respuesta..."
                  value={nuevaRespuesta}
                  onChange={(e) => setNuevaRespuesta(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-3"
                />
                <input
                  type="text"
                  placeholder="Contexto (opcional)"
                  value={nuevoContexto}
                  onChange={(e) => setNuevoContexto(e.target.value)}
                  className="w-full border px-3 py-2 rounded mb-3"
                />
                <button
                  onClick={registrarPreguntaManual}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded w-full"
                >
                  Registrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {userLevel === 'admin' && mostrarModalChunk && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-end z-50">
          <div className="bg-white w-full max-w-4xl p-6 shadow-xl rounded-l-2xl overflow-y-auto">
            <ChunkIAAdmin />
            <button
              onClick={() => setMostrarModalChunk(false)}
              className="text-gray-600 hover:text-red-500 font-bold text-xl mt-4 block mx-auto"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
      <Footer></Footer>
    </>
  );
}
