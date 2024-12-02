import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { 
    Container, Typography, Grid, Card, CardContent, CardActions, Button, 
    CircularProgress, Box, Alert, CardMedia, Rating, Dialog, DialogActions, 
    DialogContent, DialogTitle, TextField, Switch, Select, MenuItem, 
    FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

function Cartas() {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null); 
    const [mensaje, setMensaje] = useState('');
    const [openEdit, setOpenEdit] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [itemsRes, categoriasRes] = await Promise.all([
                api.get('/items/'),
                api.get('/categorias/')
            ]);
            setItems(itemsRes.data.results || []);
            setCategorias(categoriasRes.data.results || []);
            setError(null);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setError('Hubo un error al cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDisponible = async (id, disponible) => {
        try {
            const response = await api.patch(`/items/${id}/`, { disponible: !disponible });
            setItems(items.map(item => item.id === id ? response.data : item));
            setMensaje(`Item ${response.data.disponible ? 'activado' : 'desactivado'} correctamente.`);
        } catch (error) {
            setMensaje('Error al cambiar el estado del item.');
            console.error('Error al cambiar el estado del item:', error);
        }
    };

    const handleEditItem = (item) => {
        setSelectedItem({ ...item });
        setOpenEdit(true);
    };

    const handleSaveEdit = async () => {
        if (selectedItem) {
            try {
                const response = await api.put(`/items/${selectedItem.id}/`, selectedItem);
                setItems(items.map(item => item.id === selectedItem.id ? response.data : item));
                setMensaje('Item editado correctamente.');
                setOpenEdit(false);
                setSelectedItem(null);
            } catch (error) {
                setMensaje('Error al editar el item.');
                console.error('Error al editar el item:', error);
            }
        }
    };

    const handleDeleteItem = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este item?')) {
            try {
                await api.delete(`/items/${id}/`);
                setItems(items.filter(item => item.id !== id));
                setMensaje('Item eliminado correctamente.');
            } catch (error) {
                setMensaje('Error al eliminar el item.');
                console.error('Error al eliminar el item:', error);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSelectedItem(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div style={{ backgroundImage: 'url(src/assets/comedor.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '100vh' }}>
            <Container sx={{ py: 4, zIndex: 1, position: 'relative' }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom color="white">
                    Administrar Items
                </Typography>

                {mensaje && (
                    <Alert severity={mensaje.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
                        {mensaje}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={4} justifyContent="center">
                    {items.map(item => (
                        <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
                            <Card sx={{
                                maxWidth: 345, borderRadius: '12px', boxShadow: 3, overflow: 'hidden',
                                '&:hover': { transform: 'scale(1.05)', transition: 'transform 0.3s ease' },
                                backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)',
                                position: 'relative', zIndex: 1
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imagen || "https://via.placeholder.com/300"}
                                    alt={item.nombre}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="h6" color="textPrimary">{item.nombre}</Typography>
                                    <Typography variant="body2" color="textSecondary">Precio: S/{item.precio}</Typography>
                                    <Typography variant="body2" color="textSecondary">Categoría: {item.categoria_nombre}</Typography>
                                    <Typography variant="body2" color="textSecondary">Disponible: {item.disponible ? 'Sí' : 'No'}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Rating 
                                            value={item.calificacion_promedio || 0} 
                                            readOnly 
                                            precision={0.5} 
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                                            ({item.votos} votos)
                                        </Typography>
                                    </Box>
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => handleToggleDisponible(item.id, item.disponible)} variant="outlined" color="primary">
                                        {item.disponible ? 'Desactivar' : 'Activar'}
                                    </Button>
                                    <Button onClick={() => handleEditItem(item)} startIcon={<EditIcon />} variant="outlined">
                                        Editar
                                    </Button>
                                    <Button onClick={() => handleDeleteItem(item.id)} color="error" startIcon={<DeleteIcon />} variant="outlined">
                                        Eliminar
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                    {items.length === 0 && !loading && (
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ backgroundColor: '#f3f4f6', color: '#333' }}>
                                No hay items disponibles.
                            </Alert>
                        </Grid>
                    )}
                </Grid>

                <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
                    <DialogTitle sx={{ backgroundColor: '#2196f3', color: '#fff' }}>Editar Item</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nombre"
                            name="nombre"
                            fullWidth
                            value={selectedItem?.nombre || ''}
                            onChange={handleInputChange}
                            required
                        />
                        <TextField
                            margin="dense"
                            label="Precio"
                            name="precio"
                            type="number"
                            fullWidth
                            value={selectedItem?.precio || ''}
                            onChange={handleInputChange}
                            InputProps={{ inputProps: { min: 0 } }}
                            required
                        />
                        <FormControl fullWidth margin="dense" required>
                            <InputLabel>Categoría</InputLabel>
                            <Select
                                name="categoria"
                                value={selectedItem?.categoria || ''}
                                onChange={handleInputChange}
                                label="Categoría"
                            >
                                {categorias.map(categoria => (
                                    <MenuItem key={categoria.id} value={categoria.id}>
                                        {categoria.nombre}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <Typography>Disponible:</Typography>
                            <Switch
                                checked={selectedItem?.disponible || false}
                                onChange={handleInputChange}
                                name="disponible"
                                color="primary"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
                        <Button onClick={handleSaveEdit} variant="contained" color="primary">Guardar</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </div>
    );
}

export default Cartas;
