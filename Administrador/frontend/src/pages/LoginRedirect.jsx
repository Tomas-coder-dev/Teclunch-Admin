// src/pages/LoginRedirect.jsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginRedirect = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            localStorage.setItem('token', token);
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [location, navigate]);

    return <p>Redirigiendo...</p>;
};

export default LoginRedirect;
