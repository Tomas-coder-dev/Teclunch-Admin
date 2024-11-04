import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';  // Usa la instancia de Axios

function Chat() {
    const [sessions, setSessions] = useState([]);
    const [currentSession, setCurrentSession] = useState(null);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    // Obtener las sesiones de chat del usuario
    useEffect(() => {
        api.get('/chatsessions/')
            .then(response => setSessions(response.data))
            .catch(error => console.error('Error al obtener sesiones de chat:', error));
    }, []);

    // Obtener los mensajes de la sesión actual
    useEffect(() => {
        if (currentSession) {
            api.get(`/mensajes/?session_id=${currentSession.id}`)
                .then(response => setMessages(response.data))
                .catch(error => console.error('Error al obtener mensajes:', error));
        }
    }, [currentSession]);

    // Enviar un nuevo mensaje
    const sendMessage = () => {
        if (message.trim() !== '' && currentSession) {
            api.post('/mensajes/', { session: currentSession.id, content: message })
                .then(response => {
                    setMessages([...messages, response.data]);
                    setMessage('');  // Limpiar el mensaje después de enviarlo
                })
                .catch(error => console.error('Error al enviar mensaje:', error));
        }
    };

    return (
        <div>
            <h2>Chat Sessions</h2>
            <ul>
                {sessions.map(session => (
                    <li key={session.id} onClick={() => setCurrentSession(session)}>
                        {session.name}
                    </li>
                ))}
            </ul>

            {currentSession && (
                <div>
                    <h3>Messages for {currentSession.name}</h3>
                    <ul>
                        {messages.map(msg => (
                            <li key={msg.id}>{msg.content}</li>
                        ))}
                    </ul>
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendMessage}>Send</button>
                </div>
            )}
        </div>
    );
}

export default Chat;
