// src/pages/Home.jsx

import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axios';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardHeader,
    IconButton,
    Box,
    CircularProgress,
    Alert,
    Snackbar,
    Button,
    Tooltip,
    Badge,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import madera from '../assets/madera.jpg'; // Asegúrate de que la ruta es correcta
import { Link } from 'react-router-dom';
import TransaccionIcon from '@mui/icons-material/ReceiptLong'; // Icono personalizado para transacciones

// Estilos personalizados
const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundImage: `url(${madera})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
}));

const Overlay = styled(Box)(({ theme }) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[5],
    maxWidth: '1200px',
    margin: '0 auto',
}));

const StatsCard = styled(Card)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
}));

const QuickAccessButton = styled(Button)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(2),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.secondary.main,
    '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
    },
    textTransform: 'none',
}));

const NotificationAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const Home = () => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        pedidos: 0,
        items: 0,
        cartasActivas: 0,
    });
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Función para cerrar el Snackbar
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    // Fetch información del usuario
    const fetchUsuario = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/admin-usuarios/me/');
            setUsuario(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al obtener información del usuario.');
            setLoading(false);
        }
    }, []);

    // Fetch estadísticas
    const fetchStats = useCallback(async () => {
        try {
            const [pedidosResponse, itemsResponse, cartasResponse] = await Promise.all([
                axiosInstance.get('/pedidos/'),
                axiosInstance.get('/items/'),
                axiosInstance.get('/cartas/', { params: { estado: 'Activa' } }),
            ]);
            setStats({
                pedidos: pedidosResponse.data.length,
                items: itemsResponse.data.length,
                cartasActivas: cartasResponse.data.length,
            });
        } catch (err) {
            setError('Error al obtener estadísticas.');
        }
    }, []);

    // Fetch transacciones pendientes
    const fetchPendingTransactions = useCallback(async () => {
        try {
            const response = await axiosInstance.get('/transacciones/', {
                params: {
                    estado: 'Pendiente',
                },
            });
            setPendingTransactions(response.data.results || []);
            if (response.data.results.length > 0) {
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error al obtener transacciones pendientes:', err);
        }
    }, []);

    useEffect(() => {
        fetchUsuario();
        fetchStats();
        fetchPendingTransactions();
    }, [fetchUsuario, fetchStats, fetchPendingTransactions]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <StyledContainer>
            <Overlay>
                {/* Snackbar para notificaciones de transacciones pendientes */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={8000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <NotificationAlert
                        onClose={handleSnackbarClose}
                        severity="warning"
                        sx={{ width: '100%' }}
                        action={
                            <Button color="inherit" size="small" component={Link} to="/transacciones">
                                Revisar
                            </Button>
                        }
                    >
                        Tienes {pendingTransactions.length} transacción(es) pendiente(s) de actualizar.
                    </NotificationAlert>
                </Snackbar>

                {/* Mensaje de Bienvenida */}
                <Box textAlign="center" mb={4}>
                    <Typography variant="h4" gutterBottom>
                        ¡Bienvenido, {usuario?.nombre}!
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                        Gestiona pedidos, ítems, cartas y más desde aquí.
                    </Typography>
                </Box>

                {/* Dashboard de Estadísticas */}
                <Grid container spacing={4}>
                    {/* Estadística de Pedidos */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatsCard>
                            <ShoppingCartIcon fontSize="large" />
                            <Box ml={2}>
                                <Typography variant="h6">Pedidos</Typography>
                                <Typography variant="h4">{stats.pedidos}</Typography>
                            </Box>
                        </StatsCard>
                    </Grid>

                    {/* Estadística de Ítems */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatsCard>
                            <FastfoodIcon fontSize="large" />
                            <Box ml={2}>
                                <Typography variant="h6">Ítems</Typography>
                                <Typography variant="h4">{stats.items}</Typography>
                            </Box>
                        </StatsCard>
                    </Grid>

                    {/* Estadística de Cartas Activas */}
                    <Grid item xs={12} sm={6} md={4}>
                        <StatsCard>
                            <AssignmentIcon fontSize="large" />
                            <Box ml={2}>
                                <Typography variant="h6">Cartas Activas</Typography>
                                <Typography variant="h4">{stats.cartasActivas}</Typography>
                            </Box>
                        </StatsCard>
                    </Grid>
                </Grid>

                {/* Accesos Rápidos */}
                <Box mt={6}>
                    <Typography variant="h5" gutterBottom>
                        Accesos Rápidos
                    </Typography>
                    <Grid container spacing={4}>
                        {/* Gestionar Usuarios */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Gestionar Usuarios">
                                <QuickAccessButton
                                    component={Link}
                                    to="/usuarios"
                                    fullWidth
                                    variant="contained"
                                >
                                    <Badge badgeContent={0} color="error">
                                        <ShoppingCartIcon fontSize="large" />
                                    </Badge>
                                    <Box ml={2}>
                                        <Typography variant="button">Usuarios</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>

                        {/* Gestionar Pedidos */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Gestionar Pedidos">
                                <QuickAccessButton
                                    component={Link}
                                    to="/pedidos"
                                    fullWidth
                                    variant="contained"
                                >
                                    <ShoppingCartIcon fontSize="large" />
                                    <Box ml={2}>
                                        <Typography variant="button">Pedidos</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>

                        {/* Gestionar Comidas */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Gestionar Comidas">
                                <QuickAccessButton
                                    component={Link}
                                    to="/comidas"
                                    fullWidth
                                    variant="contained"
                                >
                                    <FastfoodIcon fontSize="large" />
                                    <Box ml={2}>
                                        <Typography variant="button">Comidas</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>

                        {/* Gestionar Cartas */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Gestionar Cartas">
                                <QuickAccessButton
                                    component={Link}
                                    to="/cartas"
                                    fullWidth
                                    variant="contained"
                                >
                                    <AssignmentIcon fontSize="large" />
                                    <Box ml={2}>
                                        <Typography variant="button">Cartas</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>

                        {/* Gestionar Transacciones */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Gestionar Transacciones">
                                <QuickAccessButton
                                    component={Link}
                                    to="/transacciones"
                                    fullWidth
                                    variant="contained"
                                >
                                    <Badge badgeContent={pendingTransactions.length} color="error">
                                        <TransaccionIcon fontSize="large" />
                                    </Badge>
                                    <Box ml={2}>
                                        <Typography variant="button">Transacciones</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>

                        {/* Chat */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Tooltip title="Chat">
                                <QuickAccessButton
                                    component={Link}
                                    to="/chat"
                                    fullWidth
                                    variant="contained"
                                >
                                    <ChatIcon fontSize="large" />
                                    <Box ml={2}>
                                        <Typography variant="button">Chat</Typography>
                                    </Box>
                                </QuickAccessButton>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Box>

                {/* Sección de Notificaciones Adicionales */}
                <Box mt={6}>
                    <Typography variant="h5" gutterBottom>
                        Notificaciones
                    </Typography>
                    <Grid container spacing={4}>
                        {/* Notificación de Transacciones Pendientes */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
                                <CardHeader
                                    avatar={<InfoIcon />}
                                    title="Transacciones Pendientes"
                                    subheader={`Hay ${pendingTransactions.length} transacción(es) pendiente(s) de actualizar.`}
                                />
                                <CardContent>
                                    {pendingTransactions.length > 0 ? (
                                        <>
                                            <List>
                                                {pendingTransactions.slice(0, 3).map((transaccion) => (
                                                    <ListItem key={transaccion.id}>
                                                        <ListItemText
                                                            primary={`Pedido: ${transaccion.pedido_codigo_pedido || 'N/A'}`}
                                                            secondary={`Usuario: ${transaccion.usuario_nombre || 'N/A'}`}
                                                        />
                                                    </ListItem>
                                                ))}
                                                {pendingTransactions.length > 3 && (
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={`... y ${pendingTransactions.length - 3} más`}
                                                        />
                                                    </ListItem>
                                                )}
                                            </List>
                                            <Box mt={2}>
                                                <Button
                                                    variant="contained"
                                                    color="inherit"
                                                    component={Link}
                                                    to="/transacciones"
                                                >
                                                    Revisar Transacciones
                                                </Button>
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography variant="body1">
                                            No hay transacciones pendientes.
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Notificación de Nuevos Pedidos */}
                        <Grid item xs={12} md={6}>
                            <Card sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
                                <CardHeader
                                    avatar={<InfoIcon />}
                                    title="Nuevos Pedidos"
                                    subheader="Revisa los nuevos pedidos para una respuesta rápida."
                                />
                                <CardContent>
                                    <Typography variant="body1">
                                        Tienes {stats.pedidos} pedidos en total. Asegúrate de revisarlos y gestionarlos
                                        a tiempo para mantener la satisfacción de los clientes.
                                    </Typography>
                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="inherit"
                                            component={Link}
                                            to="/pedidos"
                                        >
                                            Revisar Pedidos
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Overlay>

            {/* Snackbar para notificaciones de éxito (Opcional) */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Operación realizada con éxito"
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <LogoutIcon fontSize="small" />
                    </IconButton>
                }
            />
        </StyledContainer>
    );

};

export default Home;
