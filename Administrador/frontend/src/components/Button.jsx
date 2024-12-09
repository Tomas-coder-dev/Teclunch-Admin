// src/components/Button.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaSignOutAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';

// Definir la variable colors
const colors = {
  background: '#0096FF',
  primary: '#87CEEB',
  accent: '#FFD700',
};

const Button = ({ handleClick, clicked, handleLogout, usuario }) => {
  return (
    <StyledButton
      onClick={handleClick}
      className={clicked ? 'open' : ''}
      as={motion.div}
      whileTap={{ scale: 0.95 }}
      animate={clicked ? { rotate: 90 } : { rotate: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={clicked ? "Cerrar menú" : "Abrir menú"}
    >
      <span className="bar"></span>
      <span className="bar"></span>
      <span className="bar"></span>
      {clicked && (
        <div className="absolute top-16 right-0 bg-primary p-4 rounded-lg shadow-lg">
          {usuario && (
            <div className="mb-2 text-white text-sm">
              Hola, <strong>{usuario.nombre}</strong>
            </div>
          )}
          <button onClick={handleLogout} className="flex items-center space-x-1 text-white hover:text-hover">
            <FaSignOutAlt className="mr-2" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </StyledButton>
  );
};

Button.propTypes = {
  handleClick: PropTypes.func.isRequired,
  clicked: PropTypes.bool.isRequired,
  handleLogout: PropTypes.func.isRequired,
  usuario: PropTypes.object,
};

export default Button;

const StyledButton = styled(motion.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 8px;
  background-color: ${colors.background};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  &.open {
    background-color: ${colors.primary};
  }

  .bar {
    background-color: #fff;
    width: 35px;
    height: 4px;
    margin: 4px 0;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  &.open .bar:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
  }

  &.open .bar:nth-child(2) {
    opacity: 0;
  }

  &.open .bar:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
  }

  &:hover {
    opacity: 0.9;
    background-color: ${colors.accent};
  }

  @media (min-width: 768px) {
    display: none;
  }
`;
