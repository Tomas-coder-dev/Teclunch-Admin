import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../index.css';

const MotionDiv = motion.create('div'); // Componente animado

function Chat() {
  const [mensaje, setMensaje] = useState('');
  const [respuesta, setRespuesta] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const handleMensajeSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    try {
        const res = await axios.post('http://localhost:8000/chatbot/', {
            message: mensaje,
          });      setRespuesta(res.data.response);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-300 via-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white bg-opacity-80 rounded-lg shadow-lg p-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 text-gray-800">
          💬 Chat Interactivo
        </h1>

        {/* Formulario para enviar mensajes */}
        <form
          onSubmit={handleMensajeSubmit}
          className="flex flex-col sm:flex-row mb-6 space-y-2 sm:space-y-0 sm:space-x-2"
        >
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            required
            className="flex-grow p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={cargando}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-md transition-colors duration-300 flex items-center justify-center"
          >
            {cargando ? <FiLoader className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </form>

        {/* Mensajes de error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <h2 className="font-bold">Error:</h2>
            <p>{error}</p>
          </div>
        )}

        {/* Respuesta */}
        {respuesta && !error && (
          <MotionDiv
            className="bg-white bg-opacity-90 p-6 rounded-lg shadow-inner prose max-w-none overflow-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="flex items-center font-bold text-xl mb-4 text-gray-800">
              <FaRobot className="mr-2 text-2xl" /> Respuesta:
            </h2>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{respuesta}</ReactMarkdown>
          </MotionDiv>
        )}
      </div>
    </div>
  );
}

export default Chat;
