import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import theme from './theme'; // Importa el tema de Material-UI
import { ThemeProvider } from '@mui/material/styles';
import './styles/index.css'; // Asegúrate de que la ruta sea correcta

// Selecciona el elemento root
const rootElement = document.getElementById('root');

// Usa createRoot para renderizar la aplicación
createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
