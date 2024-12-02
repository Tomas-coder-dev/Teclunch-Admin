import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert, CircularProgress, Box, Grid
} from '@mui/material';

function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await api.get('/usuarios/');
            setUsuarios(Array.isArray(response.data) ? response.data : response.data.results || []);
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            setMensaje('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            backgroundImage: 'url(src/assets/comedor2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 2,
        }}>
            <Container sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo con opacidad para ver el fondo pero mantener la legibilidad
                borderRadius: 4,
                padding: 4,
                boxShadow: 6,
                backdropFilter: 'blur(8px)', // Agregar un leve desenfoque al fondo
            }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom color="primary">
                    Lista de Usuarios
                </Typography>

                {mensaje && (
                    <Alert severity={mensaje.includes('Error') ? 'error' : 'success'} sx={{ mb: 4 }}>
                        {mensaje}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                        <CircularProgress color="primary" />
                    </Box>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} md={10}>
                            <TableContainer component={Paper} sx={{
                                boxShadow: 3,
                                borderRadius: 3,
                                overflow: 'hidden',
                                backgroundColor: 'rgba(255, 255, 255, 0.6)', // Fondo semitransparente para la tabla
                                backdropFilter: 'blur(5px)', // Desenfoque leve del fondo
                            }}>
                                <Table sx={{ minWidth: 650 }}>
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: '#0288d1' }}>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>ID Institucional</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Nombre</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Correo</TableCell>
                                            <TableCell sx={{ color: '#ffffff', fontWeight: 'bold' }}>Rol</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {usuarios.length > 0 ? (
                                            usuarios.map((usuario) => (
                                                <TableRow key={usuario.id || usuario.id_institucional} hover sx={{
                                                    '&:hover': { backgroundColor: '#f1f1f1' },
                                                    transition: 'background-color 0.3s ease'
                                                }}>
                                                    <TableCell>{usuario.id_institucional}</TableCell>
                                                    <TableCell>{usuario.nombre}</TableCell>
                                                    <TableCell>{usuario.correo}</TableCell>
                                                    <TableCell>{usuario.rol}</TableCell>
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
}

export default Usuarios;
