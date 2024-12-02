import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import {
  Container, Typography, Grid, Card, CardContent, CardMedia, Box, Rating, Button, Alert,
  Select, MenuItem, FormControl, InputLabel, TextField, Switch, IconButton, CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Estilos personalizados
const StyledContainer = styled('div')({
  backgroundImage: 'url(/src/assets/comedor.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  minHeight: '100vh',
  color: 'white',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  boxSizing: 'border-box',
});

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 8,
  boxShadow: 10,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.4)',
  },
}));

function Items() {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [nuevoItem, setNuevoItem] = useState({
    nombre: '', 
    precio: '', 
    disponible: true, 
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

    // Validación de los campos obligatorios
    if (!nuevoItem.nombre || !nuevoItem.precio || !nuevoItem.categoria) {
      setMensaje('Por favor completa los campos obligatorios.');
      setSubmitting(false);
      return;
    }

    const datosItem = {
      nombre: nuevoItem.nombre,
      precio: parseFloat(nuevoItem.precio),
      categoria: nuevoItem.categoria,
      disponible: nuevoItem.disponible,
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
      disponible: item.disponible,
      categoria: item.categoria,
    });
  };

  const resetForm = () => {
    setNuevoItem({ nombre: '', precio: '', disponible: true, categoria: '' });
    setModoEdicion(false);
    setItemEditado(null);
  };

  const itemsFiltrados = categoriaSeleccionada === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaSeleccionada);

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 'bold', 
        textShadow: '2px 2px 5px rgba(0, 0, 0, 0.6)',
        color: '#000',
        fontSize: '1.8rem',
        '@media (max-width:600px)': {
          fontSize: '1.5rem', // Ajustar el tamaño en pantallas pequeñas
        }
      }}>
        Comidas Disponibles
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.includes('Error') ? 'error' : 'success'} sx={{
          mb: 4, 
          maxWidth: 600, 
          borderRadius: 2, 
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          backgroundColor: mensaje.includes('Error') ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 255, 0, 0.7)',
          color: '#fff'
        }}>
          {mensaje}
        </Alert>
      )}

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', width: '100%' }}>
        <FormControl variant="outlined" sx={{ minWidth: 200, borderRadius: 2 }}>
          <InputLabel id="categoria-label">Categoría</InputLabel>
          <Select
            labelId="categoria-label"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            label="Categoría"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
              '& .MuiSelect-root': {
                paddingRight: '1rem',
              }
            }}
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

      <Grid container spacing={2} sx={{ justifyContent: 'center', flexGrow: 1 }}>
        {itemsFiltrados.length > 0 ? (
          itemsFiltrados.map(item => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.imagen || "https://via.placeholder.com/350x200"}
                    alt={item.nombre}
                    sx={{ borderTopLeftRadius: 8, borderTopRightRadius: 8 }}
                  />
                  <CardContent>
                    <Typography variant="h6" sx={{
                      fontWeight: 'bold',
                      textShadow: '1px 1px 5px rgba(0, 0, 0, 0.7)',
                      color: '#000',
                      fontSize: '1rem',
                    }}>
                      {item.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#000', fontSize: '0.9rem' }}>
                      Precio: S/{item.precio}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#000', fontSize: '0.9rem' }}>
                      Categoría: {item.categoria_nombre}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <Rating name="read-only" value={item.calificacion_promedio || 0} readOnly precision={0.5} />
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
                </StyledCard>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 4 }}>
            No hay items disponibles en esta categoría.
          </Typography>
        )}
      </Grid>

      {/* Formulario para agregar o editar ítems */}
      <Box component="form" onSubmit={agregarOEditarItem} sx={{
        mt: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: 4,
        borderRadius: 8,
        boxShadow: 10,
        width: '100%',
        maxWidth: 600,
        '@media (max-width:600px)': {
          padding: 2,
        }
      }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{
          fontWeight: 'bold',
          marginBottom: 4,
          textAlign: 'center',
          color: '#ff6600',
          fontSize: '1.4rem',
        }}>
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
              variant="outlined"
              sx={{ borderRadius: 2 }}
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
              variant="outlined"
              inputProps={{ min: 0 }}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required variant="outlined" sx={{ borderRadius: 2 }}>
              <InputLabel id="categoria-select-label">Categoría</InputLabel>
              <Select
                labelId="categoria-select-label"
                name="categoria"
                value={nuevoItem.categoria}
                onChange={handleInputChange}
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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                Disponible
              </Typography>
              <Switch
                checked={nuevoItem.disponible}
                onChange={handleInputChange}
                name="disponible"
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={submitting}
            sx={{
              borderRadius: 20,
              padding: '12px 24px',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#ff8c00'
              }
            }}
          >
            {modoEdicion ? 'Actualizar' : 'Agregar'} Item
          </Button>
        </Box>
      </Box>
    </StyledContainer>
  );
}

export default Items;
