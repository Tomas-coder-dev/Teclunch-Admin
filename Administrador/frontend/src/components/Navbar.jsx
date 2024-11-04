// src/Navbar.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import Button from './Button';
import { AppBar, Toolbar, Box } from '@mui/material';
import logo from '../assets/logo.png';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BookIcon from '@mui/icons-material/Book';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ChatIcon from '@mui/icons-material/Chat';

const colors = {
  primary: '#009FDB',
  secondary: '#FFA500',
  hover: '#FFB800',
};

const menuVariants = {
  hidden: { opacity: 0, height: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  visible: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeInOut' } },
};

const menuItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

const categories = [
  { name: 'Inicio', icon: <HomeIcon />, path: '/' },
  { name: 'Usuarios', icon: <PeopleIcon />, path: '/usuarios' },
  { name: 'Pedidos', icon: <ShoppingCartIcon />, path: '/pedidos' },
  { name: 'Reservas', icon: <BookIcon />, path: '/reservas' },
  { name: 'Comidas', icon: <RestaurantMenuIcon />, path: '/items' },
  { name: 'Cartas', icon: <MenuBookIcon />, path: '/cartas' },
  { name: 'Transacciones', icon: <MonetizationOnIcon />, path: '/transacciones' },
  { name: 'Chat', icon: <ChatIcon />, path: '/chat' },
];

function Navbar() {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => setClicked(!clicked);
  const handleMenuItemClick = () => setClicked(false);

  return (
    <NavContainer>
      <AppBar position="static" className="bg-primary shadow-lg">
        <Toolbar className="flex justify-between items-center relative">
          <Logo
            src={logo}
            alt="Logo"
            as={motion.img}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          />

          <Box className="hidden md:flex flex-grow justify-center space-x-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                custom={index}
                whileHover={{ scale: 1.1, color: colors.hover }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <StyledLink to={category.path} onClick={handleMenuItemClick}>
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </StyledLink>
              </motion.div>
            ))}
          </Box>

          <ButtonContainer>
            <Button clicked={clicked} handleClick={handleClick} />
          </ButtonContainer>

          <AnimatePresence>
            {clicked && (
              <MobileMenu
                as={motion.div}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={menuVariants}
              >
                {categories.map((category, index) => (
                  <MobileMenuItem
                    key={category.name}
                    to={category.path}
                    onClick={handleMenuItemClick}
                    custom={index}
                    as={motion(Link)}
                    variants={menuItemVariants}
                  >
                    <span className="mr-2">{category.icon}</span>
                    {category.name}
                  </MobileMenuItem>
                ))}
              </MobileMenu>
            )}
          </AnimatePresence>
        </Toolbar>
      </AppBar>
    </NavContainer>
  );
}

export default Navbar;

// Styled Components
const NavContainer = styled.div`
  position: relative;
  z-index: 50;
`;

const Logo = styled.img`
  height: 60px;
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: block;
  @media (min-width: 768px) {
    display: none;
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  color: ${colors.secondary};
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${colors.hover};
  }
`;

const MobileMenu = styled(motion.div)`
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  padding: 1rem;
  border-radius: 10px;
  z-index: 999;
  box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileMenuItem = styled(motion(Link))`
  display: flex;
  align-items: center;
  color: #fff;
  margin: 10px 0;
  text-decoration: none;
  font-size: 1.2rem;
  padding: 10px 15px;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(255, 165, 0, 0.6);
    transform: scale(1.05);
  }

  .mr-2 {
    margin-right: 0.5rem;
  }
`;
