import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  FaPaperPlane,
  FaMicrophone,
  FaStop,
  FaCoffee,
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fondo1 from '../assets/fondo1.jpg'; // Importamos la imagen de fondo
import '../styles/index.css';

function Chat() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const chatEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis); // Referencia al sintetizador de voz

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const reconocimientoDisponible = !!SpeechRecognition;
  let recognition;

  if (reconocimientoDisponible) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.continuous = false;

    let textoReconocido = '';

    recognition.onresult = (event) => {
      textoReconocido += event.results[0][0].transcript;
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento de voz:', event.error);
      setEscuchando(false);
    };

    recognition.onend = () => {
      setEscuchando(false);
      if (textoReconocido.trim() !== '') {
        setMensaje('');
        handleMensajeSubmit(null, textoReconocido);
        textoReconocido = '';
      }
    };
  }

  const toggleEscuchar = () => {
    if (escuchando) {
      recognition.stop();
    } else {
      recognition.start();
    }
    setEscuchando(!escuchando);
  };

  const limpiarMarkdown = (texto) => {
    texto = texto.replace(/^#+\s+/gm, '');
    texto = texto.replace(/[*_~`]/g, '');
    texto = texto.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    texto = texto.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '');
    texto = texto.replace(/^\s*-\s+/gm, '');
    texto = texto.replace(/^\s*\d+\.\s+/gm, '');
    texto = texto.replace(/^>\s+/gm, '');
    texto = texto.replace(/\n{2,}/g, '\n');
    texto = texto.replace(/[>*#]/g, '');
    texto = texto.replace(/\$/g, 'soles'); // Reemplazar $ por "soles"
    return texto.trim();
  };

  const leerRespuesta = (texto) => {
    const textoLimpio = limpiarMarkdown(texto);
    const synth = synthRef.current;

    // Detener cualquier síntesis de voz en curso
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-ES';

    // Usar una voz mejorada, como la de Google español
    const vocesDisponibles = synth.getVoices();
    const seleccionarVoz = (voces, utterance) => {
      const vozSeleccionada =
        voces.find((voz) => voz.name.includes('Google español')) || voces[0];
      utterance.voice = vozSeleccionada;
    };

    if (vocesDisponibles.length === 0) {
      synth.onvoiceschanged = () => {
        const vocesActualizadas = synth.getVoices();
        seleccionarVoz(vocesActualizadas, utterance);
        synth.speak(utterance);
      };
    } else {
      seleccionarVoz(vocesDisponibles, utterance);
      synth.speak(utterance);
    }
  };

  // Función para manejar los precios
  const manejarPrecios = (texto) => {
    // Expresión regular para eliminar ceros innecesarios y asegurarse de que los precios estén bien formateados
    return texto
      .replace(/(\d+)\.00/g, '$1') // Eliminar ceros en decimales
      .replace(/(\d+)(\s*)soles/g, '$1 soles') // Asegurar que el texto "soles" esté bien formateado
      .replace(/(\d+)(\s*)€/g, '$1 €'); // Si es necesario también manejar otros símbolos como €.
  };

  const handleMensajeSubmit = async (e, mensajeVoz = null) => {
    if (e) e.preventDefault();
    const mensajeAEnviar = mensajeVoz !== null ? mensajeVoz : mensaje;
    if (mensajeAEnviar.trim() === '') return;
    setCargando(true);
    setError(null);

    // Detener la síntesis de voz si está en curso
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    const nuevoMensajeUsuario = { autor: 'usuario', texto: mensajeAEnviar };
    setMensajes((prevMensajes) => [...prevMensajes, nuevoMensajeUsuario]);

    try {
      const res = await axios.post('http://localhost:8000/chatbot/', {
        message: mensajeAEnviar,
      });

      const respuestaChatbot = res.data.response;

      // Procesar la respuesta para mejorar la lectura de precios
      const respuestaProcesada = manejarPrecios(respuestaChatbot);

      const nuevoMensajeChatbot = { autor: 'chatbot', texto: respuestaProcesada };
      setMensajes((prevMensajes) => [...prevMensajes, nuevoMensajeChatbot]);

      leerRespuesta(respuestaProcesada);
      setMensaje('');
    } catch (error) {
      setError(
        error.response
          ? error.response.data.error
          : 'Error al procesar la solicitud.'
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8"
      style={{
        backgroundImage: `url(${fondo1})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-4xl bg-white bg-opacity-90 rounded-xl shadow-2xl p-4 sm:p-8">
        <h1 className="text-2xl sm:text-4xl font-semibold text-center mb-4 sm:mb-8 text-brown-800 flex items-center justify-center">
          <FaCoffee className="mr-2 sm:mr-4 text-4xl sm:text-5xl text-brown-600" />
          Chat Cafetería
        </h1>

        <div className="mb-4 sm:mb-6 h-64 sm:h-96 overflow-y-auto border-2 border-gray-300 rounded-lg p-4 sm:p-6 bg-white bg-opacity-80">
          {mensajes.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${
                msg.autor === 'usuario' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-full md:max-w-3xl p-2 sm:p-4 rounded-lg ${
                  msg.autor === 'usuario'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.autor === 'usuario' ? (
                  msg.texto
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="react-markdown-table-container overflow-auto">
                          <table className="min-w-full bg-white border border-gray-200">
                            {children}
                          </table>
                        </div>
                      ),
                    }}
                  >
                    {msg.texto}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef}></div>
        </div>

        <form
          className="flex items-center justify-between mt-4 sm:mt-6"
          onSubmit={handleMensajeSubmit}
        >
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="w-full p-2 sm:p-4 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="ml-2 sm:ml-4 text-white bg-blue-600 p-2 sm:p-4 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={cargando}
          >
            {cargando ? (
              <FiLoader className="animate-spin text-2xl" />
            ) : (
              <FaPaperPlane className="text-2xl" />
            )}
          </button>
          <button
            type="button"
            onClick={toggleEscuchar}
            className="ml-2 sm:ml-4 text-white bg-green-500 p-2 sm:p-4 rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {escuchando ? (
              <FaStop className="text-2xl" />
            ) : (
              <FaMicrophone className="text-2xl" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chat;
