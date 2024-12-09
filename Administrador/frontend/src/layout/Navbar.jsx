// src/layout/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    FaHome,
    FaUsers,
    FaClipboardList,
    FaUtensils,
    FaClipboard,
    FaExchangeAlt,
    FaComments,
    FaSignOutAlt
} from 'react-icons/fa';
import axios from '../api/axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png'; // Ruta relativa corregida
import { Box, IconButton, Tooltip, Typography, Divider, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import CustomButton from '../components/CustomButton'; // Importa el CustomButton actualizado

// Definir colores utilizando variables de MUI
const colors = {
    primary: '#0096FF',    // Celeste
    text: '#FFFFFF',       // Blanco
    hover: '#FFD700',      // Dorado
};

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [usuario, setUsuario] = useState(null);

    const fetchUsuario = async () => {
        try {
            const response = await axios.get('/admin-usuarios/me/');
            setUsuario(response.data);
        } catch (err) {
            console.error('Error al obtener información del usuario:', err);
            toast.error('Error al obtener información del usuario.');
        }
    };

    useEffect(() => {
        fetchUsuario();
    }, []);

    const handleLogout = () => {
        if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
            localStorage.removeItem('token');
            toast.success('Sesión cerrada exitosamente');
            const redirectUrl = import.meta.env.VITE_LOGOUT_REDIRECT_URL || 'http://localhost:4000/';
            window.location.href = redirectUrl;
        }
    };

    // Variantes de animación para el menú móvil
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

    // Definir los ítems del menú una vez para evitar duplicación
    const menuItems = [
        { name: 'Inicio', icon: <FaHome size={20} />, path: '/' },
        { name: 'Usuarios', icon: <FaUsers size={20} />, path: '/usuarios' },
        { name: 'Pedidos', icon: <FaClipboardList size={20} />, path: '/pedidos' },
        { name: 'Comidas', icon: <FaUtensils size={20} />, path: '/comidas' },
        { name: 'Cartas', icon: <FaClipboard size={20} />, path: '/cartas' },
        { name: 'Transacciones', icon: <FaExchangeAlt size={20} />, path: '/transacciones' },
        { name: 'Chat', icon: <FaComments size={20} />, path: '/chat' },
    ];

    return (
        <Box sx={{ backgroundColor: colors.primary, padding: '16px 0', boxShadow: 3 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Logo */}
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                        <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '8px' }} />
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 'bold' }}>
                            TecLunch
                        </Typography>
                    </Link>

                    {/* Menú de Navegación (Desktop) */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: '16px', alignItems: 'center' }}>
                        {menuItems.map((item, index) => (
                            <Link
                                key={index}
                                to={item.path}
                                style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: colors.text }}
                            >
                                {item.icon}
                                <Typography variant="body1" sx={{ ml: 1 }}>
                                    {item.name}
                                </Typography>
                            </Link>
                        ))}
                        {/* Botón de Cerrar Sesión */}
                        <Tooltip title="Cerrar Sesión">
                            <IconButton onClick={handleLogout} sx={{ color: colors.text }}>
                                <LogoutIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>

                    {/* Botón Personalizado para Menú Móvil */}
                    <CustomButton
                        handleClick={() => setMenuOpen(!menuOpen)}
                        clicked={menuOpen}
                        handleLogout={handleLogout}
                        usuario={usuario}
                    />
                </Box>
            </Container>

            {/* Menú desplegable para móvil */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        style={{ backgroundColor: '#ffffff', padding: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                        {menuItems.map((item, index) => (
                            <motion.div
                                key={index}
                                custom={index}
                                variants={menuItemVariants}
                                style={{ marginBottom: '12px' }}
                            >
                                <Link
                                    to={item.path}
                                    style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#000' }}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {item.icon}
                                    <Typography variant="body1" sx={{ ml: 1 }}>
                                        {item.name}
                                    </Typography>
                                </Link>
                            </motion.div>
                        ))}
                        {/* Botón de Cerrar Sesión en Móvil */}
                        <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '16px' }}>
                            <Tooltip title="Cerrar Sesión">
                                <IconButton onClick={handleLogout} sx={{ color: '#000' }}>
                                    <LogoutIcon />
                                </IconButton>
                            </Tooltip>
                            <Typography variant="body1">Cerrar Sesión</Typography>
                        </Box>
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
};

export default Navbar;
