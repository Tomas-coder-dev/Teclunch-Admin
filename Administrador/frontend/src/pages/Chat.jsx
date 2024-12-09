// src/pages/Chat.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from '../api/axios';
import {
  FaPaperPlane,
  FaMicrophone,
  FaStop,
  FaCoffee,
} from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import fondo1 from '../assets/fondo1.jpg';
import { Alert, IconButton, Tooltip, Typography, Box, Paper, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Estilos personalizados utilizando MUI
const StyledContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  backgroundImage: `url(${fondo1})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ChatBox = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
}));

const MessagesContainer = styled('div')(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  marginBottom: theme.spacing(2),
  paddingRight: theme.spacing(1),
}));

const Message = styled('div')(({ theme, author }) => ({
  display: 'flex',
  justifyContent: author === 'usuario' ? 'flex-end' : 'flex-start',
  marginBottom: theme.spacing(1),
}));

const MessageBubble = styled('div')(({ theme, author }) => ({
  maxWidth: '80%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  backgroundColor: author === 'usuario' ? theme.palette.primary.main : theme.palette.grey[300],
  color: author === 'usuario' ? theme.palette.primary.contrastText : theme.palette.text.primary,
  wordWrap: 'break-word',
}));

const InputContainer = styled('form')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const TextInput = styled('input')(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.grey[400]}`,
  marginRight: theme.spacing(1),
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.3s',
  '&:focus': {
    borderColor: theme.palette.primary.main,
  },
}));

const SendButton = styled('button')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  border: 'none',
  borderRadius: '50%',
  padding: theme.spacing(1),
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    cursor: 'not-allowed',
  },
}));

const VoiceButton = styled(IconButton)(({ theme, listening }) => ({
  color: listening ? theme.palette.error.main : theme.palette.success.main,
}));

function Chat() {
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [escuchando, setEscuchando] = useState(false);
  const chatEndRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const recognitionRef = useRef(null);

  // Inicializar SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const reconocimientoDisponible = !!SpeechRecognition;

    if (reconocimientoDisponible) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onresult = (event) => {
        const textoReconocido = event.results[0][0].transcript.trim();
        if (textoReconocido !== '') {
          handleMensajeSubmit(null, textoReconocido);
        }
      };

      recognition.onerror = (event) => {
        console.error('Error de reconocimiento de voz:', event.error);
        setError('Error al reconocer la voz. Por favor, intenta nuevamente.');
        setEscuchando(false);
      };

      recognition.onend = () => {
        setEscuchando(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError('El reconocimiento de voz no está disponible en este navegador.');
    }

    // Limpiar al desmontar el componente
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Función para alternar el reconocimiento de voz
  const toggleEscuchar = () => {
    if (!recognitionRef.current) {
      setError('El reconocimiento de voz no está disponible.');
      return;
    }

    if (escuchando) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
        setError(null); // Limpiar errores previos
      } catch (err) {
        console.error('Error al iniciar reconocimiento de voz:', err);
        setError('No se pudo iniciar el reconocimiento de voz.');
      }
    }
    setEscuchando(!escuchando);
  };

  // Función para limpiar el Markdown de la respuesta
  const limpiarMarkdown = (texto) => {
    let textoLimpio = texto
      .replace(/^#+\s+/gm, '') // Encabezados
      .replace(/[*_~`]/g, '') // Formateo
      .replace(/!\[.*?\]\(.*?\)/g, '') // Imágenes
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1') // Enlaces
      .replace(/^\s*-\s+/gm, '') // Listas
      .replace(/^\s*\d+\.\s+/gm, '') // Listas numeradas
      .replace(/^>\s+/gm, '') // Citas
      .replace(/(\d+)\.00/g, '$1') // Eliminar ceros en decimales
      .replace(/(\d+)(\s*)soles/g, '$1 soles') // Asegurar formato correcto
      .replace(/(\d+)(\s*)€/g, '$1 €') // Manejar otros símbolos si es necesario
      .replace(/\$/g, 'soles') // Reemplazar $ por "soles"
      .replace(/\n{2,}/g, '\n'); // Eliminar líneas vacías
    return textoLimpio.trim();
  };

  // Función para leer la respuesta del chatbot
  const leerRespuesta = (texto) => {
    const textoLimpio = limpiarMarkdown(texto);
    const synth = synthRef.current;

    // Detener cualquier síntesis de voz en curso
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-ES';

    const vocesDisponibles = synth.getVoices();
    if (vocesDisponibles.length > 0) {
      const vozSeleccionada = vocesDisponibles.find((voz) => voz.lang.includes('es')) || vocesDisponibles[0];
      utterance.voice = vozSeleccionada;
      synth.speak(utterance);
    } else {
      // Esperar a que las voces estén cargadas
      synth.onvoiceschanged = () => {
        const vocesActualizadas = synth.getVoices();
        const vozSeleccionada = vocesActualizadas.find((voz) => voz.lang.includes('es')) || vocesActualizadas[0];
        utterance.voice = vozSeleccionada;
        synth.speak(utterance);
      };
    }
  };

  // Función para enviar el mensaje al chatbot
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
      const res = await axios.post('/chatbot/', {
        message: mensajeAEnviar,
      });

      const respuestaChatbot = res.data.response;

      const nuevoMensajeChatbot = { autor: 'chatbot', texto: respuestaChatbot };
      setMensajes((prevMensajes) => [...prevMensajes, nuevoMensajeChatbot]);

      leerRespuesta(respuestaChatbot);
      setMensaje('');
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setError(
        error.response && error.response.data && error.response.data.error
          ? error.response.data.error
          : 'Error al procesar la solicitud.'
      );
    } finally {
      setCargando(false);
      // Limpiar el mensaje de error después de 3 segundos
      if (error) {
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  // Scroll automático al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  return (
    <StyledContainer>
      <ChatBox>
        {/* Título del Chat */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <FaCoffee />
          </Avatar>
          <Typography variant="h4" component="h1" color="primary">
            Chat Cafetería
          </Typography>
        </Box>

        {/* Mostrar errores si los hay */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Área de mensajes */}
        <MessagesContainer>
          {mensajes.map((msg, index) => (
            <Message key={index} author={msg.autor}>
              <MessageBubble author={msg.autor}>
                {msg.autor === 'usuario' ? (
                  msg.texto
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({ children }) => (
                        <Box sx={{ overflowX: 'auto' }}>
                          <table style={{ minWidth: '100%', borderCollapse: 'collapse' }}>
                            {children}
                          </table>
                        </Box>
                      ),
                      a: ({ node, ...props }) => <a {...props} style={{ color: '#1976d2' }} target="_blank" rel="noopener noreferrer" />,
                    }}
                  >
                    {msg.texto}
                  </ReactMarkdown>
                )}
              </MessageBubble>
            </Message>
          ))}
          <div ref={chatEndRef} />
        </MessagesContainer>

        {/* Formulario para enviar mensajes */}
        <InputContainer onSubmit={handleMensajeSubmit} aria-label="Formulario de chat">
          {/* Input de texto */}
          <TextInput
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribe tu mensaje..."
            aria-label="Escribir mensaje"
            disabled={cargando}
          />
          {/* Botón de enviar */}
          <SendButton type="submit" disabled={cargando} aria-label="Enviar mensaje">
            {cargando ? <FiLoader className="animate-spin text-xl" /> : <FaPaperPlane />}
          </SendButton>
          {/* Botón de reconocimiento de voz */}
          <Tooltip
            title={escuchando ? 'Detener reconocimiento de voz' : 'Iniciar reconocimiento de voz'}
          >
            <VoiceButton
              onClick={toggleEscuchar}
              listening={escuchando ? 1 : 0}
              aria-label={
                escuchando
                  ? 'Detener reconocimiento de voz'
                  : 'Iniciar reconocimiento de voz'
              }
            >
              {escuchando ? <FaStop /> : <FaMicrophone />}
            </VoiceButton>
          </Tooltip>
        </InputContainer>
      </ChatBox>
    </StyledContainer>
  );
}

export default Chat;
