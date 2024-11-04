import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    CircularProgress,
    Box,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function Reservas() {
    const [reservas, setReservas] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensaje, setMensaje] = useState('');
    const [nuevaReserva, setNuevaReserva] = useState({
        usuario: '',
        estado: 'Pendiente',
        reserva_items: [{ item: '', cantidad: 1 }]
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            await Promise.all([cargarReservas(), cargarUsuarios(), cargarItems()]);
        } catch (error) {
            setError('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const cargarReservas = async () => {
        try {
            const response = await api.get('/reservas/');
            setReservas(response.data.results || []);
        } catch (error) {
            console.error('Error al cargar reservas:', error);
            setError('Error al cargar reservas.');
        }
    };

    const cargarUsuarios = async () => {
        try {
            const response = await api.get('/usuarios/');
            setUsuarios(response.data.results || []);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            setError('Error al cargar usuarios.');
        }
    };

    const cargarItems = async () => {
        try {
            const response = await api.get('/items/');
            const availableItems = response.data.results ? response.data.results.filter(item => item.disponible) : [];
            setItems(availableItems);
        } catch (error) {
            console.error('Error al cargar items:', error);
            setError('Error al cargar items.');
        }
    };

    const handleInputChange = (event, index = null) => {
        const { name, value } = event.target;
        if (name.startsWith('item_') && index !== null) {
            const newReservaItems = [...nuevaReserva.reserva_items];
            newReservaItems[index].item = value;
            setNuevaReserva({ ...nuevaReserva, reserva_items: newReservaItems });
        } else if (name.startsWith('cantidad_') && index !== null) {
            const newReservaItems = [...nuevaReserva.reserva_items];
            newReservaItems[index].cantidad = parseInt(value, 10);
            setNuevaReserva({ ...nuevaReserva, reserva_items: newReservaItems });
        } else {
            setNuevaReserva({ ...nuevaReserva, [name]: value });
        }
    };

    const agregarReservaItem = () => {
        setNuevaReserva({
            ...nuevaReserva,
            reserva_items: [...nuevaReserva.reserva_items, { item: '', cantidad: 1 }]
        });
    };

    const eliminarReservaItem = (index) => {
        const newReservaItems = [...nuevaReserva.reserva_items];
        newReservaItems.splice(index, 1);
        setNuevaReserva({ ...nuevaReserva, reserva_items: newReservaItems });
    };

    const crearReserva = async (event) => {
        event.preventDefault();
        setMensaje('');
        setError(null);
        const esValido = nuevaReserva.usuario && nuevaReserva.reserva_items.every(pi => pi.item && pi.cantidad > 0);
        
        if (!esValido) {
            setMensaje('Por favor completa todos los campos.');
            return;
        }

        const datosReserva = {
            usuario: nuevaReserva.usuario,
            fecha_reserva: new Date().toISOString().split('T')[0],
            estado: nuevaReserva.estado,
            reserva_items: nuevaReserva.reserva_items.map(pi => ({
                item: pi.item,
                cantidad: pi.cantidad
            }))
        };

        try {
            const response = await api.post('/reservas/', datosReserva);
            setReservas([...reservas, response.data]);
            setMensaje('Reserva creada correctamente.');
            setNuevaReserva({ usuario: '', estado: 'Pendiente', reserva_items: [{ item: '', cantidad: 1 }] });
        } catch (error) {
            console.error('Error al crear reserva:', error);
            setError('Error al crear la reserva.');
        } finally {
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    const eliminarReserva = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
            try {
                await api.delete(`/reservas/${id}/`);
                setReservas(reservas.filter(reserva => reserva.id !== id));
                setMensaje('Reserva eliminada correctamente.');
            } catch (error) {
                console.error('Error al eliminar reserva:', error);
                setError('Error al eliminar la reserva.');
            } finally {
                setTimeout(() => setMensaje(''), 3000);
            }
        }
    };

    const handleEstadoChange = async (id, nuevoEstado) => {
        try {
            const response = await api.patch(`/reservas/${id}/`, { estado: nuevoEstado });
            setReservas(reservas.map(reserva =>
                reserva.id === id ? { ...reserva, estado: response.data.estado } : reserva
            ));
            setMensaje('Estado de la reserva actualizado correctamente.');
        } catch (error) {
            console.error('Error al actualizar estado de la reserva:', error);
            setError('Error al actualizar el estado de la reserva.');
        } finally {
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                Reservas
            </Typography>

            {mensaje && <Alert severity="success" sx={{ mb: 2 }}>{mensaje}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={crearReserva} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="usuario-label">Usuario</InputLabel>
                            <Select
                                labelId="usuario-label"
                                name="usuario"
                                value={nuevaReserva.usuario}
                                onChange={handleInputChange}
                                label="Usuario"
                            >
                                {usuarios.map(usuario => (
                                    <MenuItem key={usuario.id_institucional} value={usuario.id_institucional}>
                                        {usuario.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="estado-label">Estado</InputLabel>
                            <Select
                                labelId="estado-label"
                                name="estado"
                                value={nuevaReserva.estado}
                                onChange={handleInputChange}
                                label="Estado"
                            >
                                <MenuItem value="Pendiente">Pendiente</MenuItem>
                                <MenuItem value="Confirmada">Confirmada</MenuItem>
                                <MenuItem value="Cancelada">Cancelada</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Items de la Reserva
                </Typography>

                {nuevaReserva.reserva_items.map((reservaItem, index) => (
                    <Grid container spacing={2} key={index} alignItems="center">
                        <Grid item xs={12} sm={5}>
                            <FormControl fullWidth required>
                                <InputLabel id={`item-label-${index}`}>Item</InputLabel>
                                <Select
                                    labelId={`item-label-${index}`}
                                    name={`item_${index}`}
                                    value={reservaItem.item}
                                    onChange={(e) => handleInputChange(e, index)}
                                    label="Item"
                                >
                                    {items.map(item => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.nombre} - S/{item.precio}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Cantidad"
                                name={`cantidad_${index}`}
                                type="number"
                                value={reservaItem.cantidad}
                                onChange={(e) => handleInputChange(e, index)}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            {nuevaReserva.reserva_items.length > 1 && (
                                <IconButton onClick={() => eliminarReservaItem(index)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                ))}

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={agregarReservaItem}>
                        Agregar Item
                    </Button>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" color="primary" fullWidth>
                        Crear Reserva
                    </Button>
                </Box>
            </Box>

            <Grid container spacing={2}>
                {reservas.map(reserva => (
                    <Grid item xs={12} sm={6} md={4} key={reserva.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">Código: {reserva.codigo_reserva}</Typography>
                                <Typography>Usuario: {reserva.usuario_nombre}</Typography>
                                <Typography>Fecha: {new Date(reserva.fecha_reserva).toLocaleDateString()}</Typography>
                                <Typography>Estado: {reserva.estado}</Typography>
                                <Typography>Items:</Typography>
                                {reserva.reserva_items.map((item, idx) => (
                                    <Typography key={idx}>- {item.item_nombre} x {item.cantidad}</Typography>
                                ))}
                            </CardContent>
                            <CardActions>
                                <FormControl fullWidth>
                                    <InputLabel id={`estado-select-${reserva.id}`}>Estado</InputLabel>
                                    <Select
                                        labelId={`estado-select-${reserva.id}`}
                                        value={reserva.estado}
                                        onChange={(e) => handleEstadoChange(reserva.id, e.target.value)}
                                    >
                                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                                        <MenuItem value="Confirmada">Confirmada</MenuItem>
                                        <MenuItem value="Cancelada">Cancelada</MenuItem>
                                    </Select>
                                </FormControl>
                                <IconButton onClick={() => eliminarReserva(reserva.id)} color="error">
                                    <DeleteIcon />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
                {reservas.length === 0 && (
                    <Grid item xs={12}>
                        <Alert severity="info">No hay reservas disponibles.</Alert>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default Reservas;
