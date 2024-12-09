// src/pages/Cartas.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios'; // Asegúrate de que esta ruta es correcta
import { 
    Container, Typography, Grid, Card, CardContent, CardActions, Button, 
    CircularProgress, Box, Alert, Rating, Dialog, DialogActions, 
    DialogContent, DialogTitle, TextField, Switch, Select, MenuItem, 
    FormControl, InputLabel 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import fondoComedor3 from '../assets/comedor3.jpg'; // Imagen de fondo local

// Estilos personalizados utilizando MUI
const StyledContainer = styled('div')(({ theme }) => ({
  backgroundImage: `url(${fondoComedor3})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
  color: '#000',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  boxSizing: 'border-box',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: theme.shadows[5],
  transition: 'transform 0.3s, box-shadow 0.3s',
  backgroundColor: 'rgba(255, 255, 255, 0.85)', // Fondo semitransparente
  backdropFilter: 'blur(5px)', // Efecto de desenfoque
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10],
  },
}));

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
                axiosInstance.get('/items/'),
                axiosInstance.get('/categorias/')
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
            const response = await axiosInstance.patch(`/items/${id}/`, { disponible: !disponible });
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
                const { id, ...datosActualizados } = selectedItem;
                const response = await axiosInstance.put(`/items/${id}/`, datosActualizados);
                setItems(items.map(item => item.id === id ? response.data : item));
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
                await axiosInstance.delete(`/items/${id}/`);
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

    // Función para cerrar el mensaje después de unos segundos
    useEffect(() => {
        if (mensaje) {
            const timer = setTimeout(() => {
                setMensaje('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [mensaje]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <StyledContainer>
            <Container sx={{ py: 4, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 2 }}>
                <Typography variant="h4" component="h1" align="center" gutterBottom>
                    Administrar Comidas
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
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <StyledCard>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" color="textPrimary" gutterBottom sx={{
                                            fontWeight: 'bold',
                                            textShadow: '1px 1px 5px rgba(0, 0, 0, 0.7)',
                                            color: '#000',
                                            fontSize: '1rem',
                                        }}>
                                            {item.nombre}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ color: '#000', fontSize: '0.9rem' }}>
                                            Precio: S/{item.precio}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ color: '#000', fontSize: '0.9rem' }}>
                                            Categoría: {item.categoria_nombre}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ color: '#000', fontSize: '0.9rem' }}>
                                            Disponible: {item.disponible ? 'Sí' : 'No'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Rating 
                                                name={`rating-${item.id}`} 
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
                                        {/* Botón de Desactivar/Activar eliminado según solicitud */}
                                        <Button 
                                            onClick={() => handleToggleDisponible(item.id, item.disponible)} 
                                            variant="outlined" 
                                            color="primary"
                                            size="small"
                                            sx={{ mr: 1 }}
                                        >
                                            {item.disponible ? 'Desactivar' : 'Activar'}
                                        </Button>
                                        <Button 
                                            onClick={() => handleEditItem(item)} 
                                            startIcon={<EditIcon />} 
                                            variant="outlined" 
                                            size="small"
                                        >
                                            Editar
                                        </Button>
                                        <Button 
                                            onClick={() => handleDeleteItem(item.id)} 
                                            color="error" 
                                            startIcon={<DeleteIcon />} 
                                            variant="outlined" 
                                            size="small"
                                        >
                                            Eliminar
                                        </Button>
                                    </CardActions>
                                </StyledCard>
                            </motion.div>
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

                {/* Diálogo para editar ítems */}
                <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Editar Item</DialogTitle>
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
                            InputProps={{ inputProps: { min: 0, step: '0.01' } }}
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
                        <Button onClick={() => setOpenEdit(false)} color="secondary">
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} variant="contained" color="primary">
                            Guardar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </StyledContainer>
    );
}

export default Cartas;
