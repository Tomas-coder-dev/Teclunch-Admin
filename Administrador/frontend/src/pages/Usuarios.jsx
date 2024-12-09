// src/pages/Usuarios.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert, CircularProgress, Box, Grid, useMediaQuery, useTheme
} from '@mui/material';
import fondo1 from '../assets/fondo1.jpg'; // Ruta relativa recomendada

const Usuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const fetchUsuarios = async () => {
        try {
            const response = await axios.get('/admin-usuarios/');
            setUsuarios(response.data.results || response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            setError('Error al obtener usuarios.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return (
        <Box sx={{
            backgroundImage: `url(${fondo1})`, // Asegúrate de que la ruta sea correcta
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 2,
        }}>
            <Container maxWidth="lg" sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fondo con mayor opacidad para mejor legibilidad
                borderRadius: 4,
                padding: 4,
                boxShadow: 6,
                backdropFilter: 'blur(8px)', // Agregar un leve desenfoque al fondo
            }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom color="primary" sx={{
                    fontWeight: 'bold',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
                }}>
                    Lista de Usuarios
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12}>
                            <TableContainer component={Paper} sx={{
                                boxShadow: 3,
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente para la tabla
                                backdropFilter: 'blur(5px)', // Desenfoque leve del fondo
                            }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: theme.palette.primary.main }}>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>ID Institucional</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Nombre</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Correo</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Rol</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usuarios.length > 0 ? (
                                            usuarios.map((usuario) => (
                                                <TableRow key={usuario.id_institucional} hover sx={{
                                                    '&:hover': { backgroundColor: '#f1f1f1' },
                                                    transition: 'background-color 0.3s ease'
                                                }}>
                                                    <TableCell>{usuario.id_institucional}</TableCell>
                                                    <TableCell>{usuario.nombre}</TableCell>
                                                    <TableCell>{usuario.correo}</TableCell>
                                                    <TableCell>{usuario.role}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>No hay usuarios disponibles.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    </Grid>
                )}
            </Container>
        </Box>
    );
};

export default Usuarios;
