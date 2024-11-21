import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
    Container, Typography, Grid, Card, CardContent, CardMedia, Box, Rating, Button, Alert,
    Select, MenuItem, FormControl, InputLabel, TextField, Switch, IconButton, CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function Items() {
    const [items, setItems] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
    const [nuevoItem, setNuevoItem] = useState({
        nombre: '', 
        precio: '', 
        calorias: '', 
        disponible: true, 
        calificacion: 3, 
        ingredientes: '', 
        categoria: ''
    });
    const [mensaje, setMensaje] = useState('');
    const [modoEdicion, setModoEdicion] = useState(false);
    const [itemEditado, setItemEditado] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        cargarItems();
        cargarCategorias();
    }, []);

    const cargarItems = async () => {
        try {
            const response = await api.get('items/');
            const itemsDisponibles = response.data.results ? response.data.results : [];
            setItems(itemsDisponibles);
        } catch (error) {
            console.error('Error al obtener items:', error);
            setMensaje('Hubo un problema al cargar los items.');
        }
    };

    const cargarCategorias = async () => {
        try {
            const response = await api.get('categorias/');
            const categoriasDisponibles = response.data.results ? response.data.results : [];
            setCategorias(categoriasDisponibles);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            setMensaje('Hubo un problema al cargar las categorías.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNuevoItem({
            ...nuevoItem,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const agregarOEditarItem = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        if (!nuevoItem.nombre || !nuevoItem.precio || !nuevoItem.calorias || !nuevoItem.ingredientes || !nuevoItem.categoria) {
            setMensaje('Por favor completa todos los campos.');
            setSubmitting(false);
            return;
        }

        const datosItem = {
            nombre: nuevoItem.nombre,
            ingredientes: nuevoItem.ingredientes,
            calorias: parseInt(nuevoItem.calorias, 10),
            precio: parseFloat(nuevoItem.precio),
            categoria: nuevoItem.categoria,
            disponible: nuevoItem.disponible,
            calificacion: nuevoItem.calificacion,
        };

        try {
            let response;
            if (modoEdicion) {
                response = await api.put(`items/${itemEditado.id}/`, datosItem);
                setItems(items.map(item => item.id === response.data.id ? response.data : item));
                setMensaje('Item actualizado correctamente.');
            } else {
                response = await api.post('items/', datosItem);
                setItems([...items, response.data]);
                setMensaje('Item agregado correctamente.');
            }
            resetForm();
        } catch (error) {
            console.error('Error al agregar/editar item:', error);
            setMensaje(modoEdicion ? 'Error al actualizar el item.' : 'Error al agregar el item.');
        } finally {
            setSubmitting(false);
            setTimeout(() => setMensaje(''), 3000);
        }
    };

    const eliminarItem = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este item?')) {
            try {
                await api.delete(`items/${id}/`);
                setItems(items.filter((item) => item.id !== id));
                setMensaje('Item eliminado correctamente.');
                setTimeout(() => setMensaje(''), 3000);
            } catch (error) {
                console.error('Error al eliminar item:', error);
                setMensaje('Error al eliminar el item.');
            }
        }
    };

    const habilitarModoEdicion = (item) => {
        setModoEdicion(true);
        setItemEditado(item);
        setNuevoItem({
            nombre: item.nombre,
            precio: item.precio,
            calorias: item.calorias,
            disponible: item.disponible,
            calificacion: item.calificacion,
            ingredientes: item.ingredientes,
            categoria: item.categoria,
        });
    };

    const resetForm = () => {
        setNuevoItem({ nombre: '', precio: '', calorias: '', disponible: true, calificacion: 3, ingredientes: '', categoria: '' });
        setModoEdicion(false);
        setItemEditado(null);
    };

    const itemsFiltrados = categoriaSeleccionada === 'Todos' 
        ? items 
        : items.filter(item => item.categoria === categoriaSeleccionada);

    return (
        <Container sx={{ py: 6, background: 'linear-gradient(to bottom, #e0f7fa, #ffffff)', minHeight: '100vh' }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom color="secondary">
                Items Disponibles
            </Typography>

            {mensaje && (
                <Alert severity={mensaje.includes('Error') ? 'error' : 'success'} sx={{ mb: 4 }}>
                    {mensaje}
                </Alert>
            )}

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
                <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                    <InputLabel id="categoria-label">Categoría</InputLabel>
                    <Select
                        labelId="categoria-label"
                        value={categoriaSeleccionada}
                        onChange={(e) => setCategoriaSeleccionada(e.target.value)}
                        label="Categoría"
                    >
                        <MenuItem value="Todos">Todos</MenuItem>
                        {categorias.map(categoria => (
                            <MenuItem key={categoria.id} value={categoria.id}>
                                {categoria.nombre}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {itemsFiltrados.length > 0 ? (
                <Grid container spacing={4}>
                    {itemsFiltrados.map(item => (
                        <Grid item key={item.id} xs={12} sm={6} md={4}>
                            <Card sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': { 
                                    transform: 'scale(1.05)',
                                    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.2)',
                                }
                            }}>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.imagen || "https://via.placeholder.com/350x200"}
                                    alt={item.nombre}
                                />
                                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h5" component="div" gutterBottom>
                                        {item.nombre}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Precio: S/{item.precio}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Calorías: {item.calorias} kcal
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Categoría: {item.categoria_nombre}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                        <Rating name="read-only" value={item.calificacion} readOnly precision={0.5} />
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'flex-end' }}>
                                    <IconButton color="primary" onClick={() => habilitarModoEdicion(item)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => eliminarItem(item.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                    No hay items disponibles en esta categoría.
                </Typography>
            )}

            <Box component="form" onSubmit={agregarOEditarItem} sx={{ mt: 6 }}>
                <Typography variant="h5" component="h2" gutterBottom align="center" color="primary">
                    {modoEdicion ? 'Editar Item' : 'Agregar Nuevo Item'}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            value={nuevoItem.nombre}
                            onChange={handleInputChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Precio"
                            name="precio"
                            type="number"
                            value={nuevoItem.precio}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 0 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Calorías"
                            name="calorias"
                            type="number"
                            value={nuevoItem.calorias}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            inputProps={{ min: 0 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                            <InputLabel id="categoria-select-label">Categoría</InputLabel>
                            <Select
                                labelId="categoria-select-label"
                                name="categoria"
                                value={nuevoItem.categoria}
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
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Ingredientes"
                            name="ingredientes"
                            value={nuevoItem.ingredientes}
                            onChange={handleInputChange}
                            fullWidth
                            required
                            multiline
                            rows={3}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography component="div">Disponible:</Typography>
                        <Switch
                            checked={nuevoItem.disponible}
                            onChange={handleInputChange}
                            name="disponible"
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Typography component="div">Calificación:</Typography>
                        <Rating
                            name="calificacion"
                            value={nuevoItem.calificacion}
                            onChange={(event, newValue) => {
                                setNuevoItem({ ...nuevoItem, calificacion: newValue });
                            }}
                            precision={0.5}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={submitting}
                        >
                            {submitting ? (modoEdicion ? 'Guardando...' : 'Agregando...') : (modoEdicion ? 'Guardar Cambios' : 'Agregar Item')}
                        </Button>
                    </Grid>
                    {modoEdicion && (
                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                fullWidth
                                onClick={resetForm}
                            >
                                Cancelar Edición
                            </Button>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Container>
    );
}

export default Items;
