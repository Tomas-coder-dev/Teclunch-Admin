// src/Button.jsx
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

function Button({ handleClick, clicked }) {
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
    </StyledButton>
  );
}

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
  background-color: rgba(255, 165, 0, 0.7);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

  &.open {
    background-color: rgba(255, 165, 0, 0.9);
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
    background-color: rgba(255, 165, 0, 0.85);
  }

  @media (min-width: 768px) {
    display: none;
  }
`;
