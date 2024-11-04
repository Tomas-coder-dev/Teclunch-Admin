import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Alert, CircularProgress, Box, Stack,
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
        <Container sx={{ py: 6, background: 'linear-gradient(to bottom, #e0f7fa, #ffffff)', minHeight: '100vh' }}>
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
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxWidth: 900, mx: 'auto', boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
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
                                    <TableRow key={usuario.id || usuario.id_institucional} hover sx={{ '&:hover': { backgroundColor: '#f1f1f1' } }}>
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
            )}
        </Container>
    );
}

export default Usuarios;
