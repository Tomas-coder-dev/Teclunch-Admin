// src/components/CustomButton.jsx
import React from 'react';
import { styled } from '@mui/material/styles';
import { IconButton, Tooltip, Box, Typography } from '@mui/material';
import { FaSignOutAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import LogoutIcon from '@mui/icons-material/Logout';

// Definir colores
const colors = {
  background: '#0096FF',
  primary: '#87CEEB',
  accent: '#FFD700',
};

// Estilizar el botón utilizando MUI y Framer Motion
const StyledButton = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '50px',
  height: '50px',
  cursor: 'pointer',
  borderRadius: '8px',
  backgroundColor: colors.background,
  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  transition: 'background-color 0.3s ease',
  '&:hover': {
    backgroundColor: colors.accent,
  },
  '@media (min-width: 768px)': {
    display: 'none', // Ocultar en pantallas grandes si no es necesario
  },
}));

const Bar = styled('span')(({ theme }) => ({
  backgroundColor: '#fff',
  width: '35px',
  height: '4px',
  margin: '4px 0',
  borderRadius: '2px',
  transition: 'all 0.3s ease',
}));

const Dropdown = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '60px',
  right: '0',
  backgroundColor: colors.primary,
  padding: '16px',
  borderRadius: '8px',
  boxShadow: theme.shadows[5],
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  zIndex: 1000, // Asegura que el dropdown esté por encima de otros elementos
}));

const CustomButton = ({ handleClick, clicked, handleLogout, usuario }) => {
  return (
    <StyledButton
      onClick={handleClick}
      as={motion.div}
      whileTap={{ scale: 0.95 }}
      animate={clicked ? { rotate: 90 } : { rotate: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={clicked ? 'Cerrar menú' : 'Abrir menú'}
    >
      <Bar />
      <Bar />
      <Bar />
      {clicked && (
        <Dropdown>
          {usuario && (
            <Box sx={{ mb: 2, color: '#fff' }}>
              <Typography variant="body1">
                Hola, <strong>{usuario.nombre}</strong>
              </Typography>
            </Box>
          )}
          <Tooltip title="Cerrar Sesión">
            <IconButton onClick={handleLogout} sx={{ color: '#fff' }} aria-label="Cerrar Sesión">
              <LogoutIcon />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Cerrar Sesión
              </Typography>
            </IconButton>
          </Tooltip>
        </Dropdown>
      )}
    </StyledButton>
  );
};

CustomButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  clicked: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  usuario: PropTypes.object,
};

export default CustomButton;
