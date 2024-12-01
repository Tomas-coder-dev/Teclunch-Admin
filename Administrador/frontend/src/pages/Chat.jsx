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
import '../styles/index.css';

function Chat() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const chatEndRef = useRef(null);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const reconocimientoDisponible = !!SpeechRecognition;
  let recognition;

  if (reconocimientoDisponible) {
    recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const textoReconocido = event.results[0][0].transcript;
      setMensaje((prevMensaje) => prevMensaje + ' ' + textoReconocido);
      setEscuchando(false);
    };

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento de voz:', event.error);
      setEscuchando(false);
    };

    recognition.onend = () => {
      setEscuchando(false);
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

  const leerRespuesta = (texto) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-ES';
    synth.speak(utterance);
  };

  const handleMensajeSubmit = async (e) => {
    e.preventDefault();
    if (mensaje.trim() === '') return;
    setCargando(true);
    setError(null);

    const nuevoMensajeUsuario = { autor: 'usuario', texto: mensaje };
    setMensajes((prevMensajes) => [...prevMensajes, nuevoMensajeUsuario]);

    try {
      const res = await axios.post('http://localhost:8000/chatbot/', {
        message: mensaje,
      });

      const respuestaChatbot = res.data.response;

      const nuevoMensajeChatbot = { autor: 'chatbot', texto: respuestaChatbot };
      setMensajes((prevMensajes) => [...prevMensajes, nuevoMensajeChatbot]);

      leerRespuesta(respuestaChatbot);
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-yellow-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-semibold text-center mb-8 text-brown-800 flex items-center justify-center">
          <FaCoffee className="mr-4 text-5xl text-brown-600" />
          Chat Cafetería
        </h1>

        <div className="mb-6 h-96 overflow-y-auto border-2 border-gray-300 rounded-lg p-6 bg-yellow-50">
          {mensajes.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 flex ${msg.autor === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl p-4 rounded-lg ${msg.autor === 'usuario' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                {msg.autor === 'usuario' ? (
                  msg.texto
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <div className="react-markdown-table-container">
                          <table className="react-markdown-table">{children}</table>
                        </div>
                      ),
                      th: ({ children }) => <th className="react-markdown-th">{children}</th>,
                      td: ({ children }) => <td className="react-markdown-td">{children}</td>,
                      ol: ({ children }) => <ol className="react-markdown-ol">{children}</ol>,
                      ul: ({ children }) => <ul className="react-markdown-ul">{children}</ul>,
                      blockquote: ({ children }) => (
                        <blockquote className="react-markdown-blockquote">{children}</blockquote>
                      ),
                    }}
                  >
                    {msg.texto}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form
          onSubmit={handleMensajeSubmit}
          className="flex flex-row space-x-4"
        >
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje o usa el micrófono..."
            required
            className="flex-grow p-4 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-4 focus:ring-orange-400 text-lg"
          />

          {reconocimientoDisponible && (
            <button
              type="button"
              onClick={toggleEscuchar}
              className={`${
                escuchando ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-500 hover:bg-orange-600'
              } text-white p-4 rounded-full transition-colors duration-300 flex items-center justify-center`}
            >
              {escuchando ? <FaStop className="text-2xl" /> : <FaMicrophone className="text-2xl" />}
            </button>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full transition-colors duration-300 flex items-center justify-center"
          >
            {cargando ? <FiLoader className="animate-spin text-2xl" /> : <FaPaperPlane className="text-2xl" />}
          </button>
        </form>

        {error && (
          <div className="bg-red-100 text-red-700 p-6 rounded-xl mt-6">
            <h2 className="font-bold text-lg">Error:</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
