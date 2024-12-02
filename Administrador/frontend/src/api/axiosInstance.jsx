// src/axiosInstance.js
import axios from 'axios';

// Configuración de Axios con una URL base absoluta del backend de Django
const api = axios.create({
    baseURL: 'http://localhost:8000/api/', // URL de tu backend de Django
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,  // Tiempo máximo de espera de 10 segundos
});

// Interceptor para añadir el token de autenticación en las solicitudes (cuando se active)
api.interceptors.request.use(
    (config) => {
        // Descomentar las siguientes líneas para habilitar la autenticación JWT
        // const token = localStorage.getItem('token'); // O utiliza otro método para obtener el token
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
    (response) => response, // Devuelve la respuesta directamente en caso de éxito
    (error) => {
        if (error.response) {
            const { status, data } = error.response;
            console.error(`Error en la solicitud: ${status} - ${JSON.stringify(data)}`);
            // Alerta o mensaje para el usuario según el tipo de error
            if (status >= 400 && status < 500) {
                alert(data.detail || 'Ocurrió un error en la solicitud. Verifique los datos.');
            } else if (status >= 500) {
                alert('Hubo un problema en el servidor. Por favor, intenta nuevamente más tarde.');
            }
        } else if (error.request) {
            console.error('No se recibió respuesta del servidor:', error.message);
            alert('No se pudo conectar con el servidor. Verifica tu conexión.');
        } else {
            console.error('Error al configurar la solicitud:', error.message);
            alert('Ocurrió un error al configurar la solicitud.');
        }
        return Promise.reject(error); // Rechaza la promesa para manejar errores en los llamados
    }
);

export default api;
