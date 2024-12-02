import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Retroalimentacion() {
    const [feedbacks, setFeedbacks] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/api/retroalimentacion/')
            .then(response => setFeedbacks(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <div>
            <h1>Retroalimentación</h1>
            <ul>
                {feedbacks.map(feedback => (
                    <li key={feedback.id}>
                        Usuario ID: {feedback.usuario} - Comida ID: {feedback.comida} - Calificación: {feedback.calificacion} - Comentario: {feedback.comentario}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Retroalimentacion;
