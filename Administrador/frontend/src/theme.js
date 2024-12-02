// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0D47A1', // Azul
      dark: '#0B3954',
    },
    secondary: {
      main: '#FF6F00', // Naranja
    },
  },
});

export default theme;
