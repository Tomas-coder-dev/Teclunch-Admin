// src/components/WelcomeMessage.jsx
import React from 'react';

const WelcomeMessage = ({ nombre }) => {
    return (
        <h1 className="text-3xl font-bold mb-4">
            {nombre ? `Bienvenido Admin, ${nombre}!` : 'Bienvenido!'}
        </h1>
    );
};

export default WelcomeMessage;
