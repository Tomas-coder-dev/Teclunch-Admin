// src/pages/Items.jsx

import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios'; // Asegúrate de que esta ruta es correcta
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Rating from '@mui/material/Rating'; // Importación añadida
import fondoComedor2 from '../assets/comedor2.jpg'; // Imagen de fondo local

// Estilos personalizados utilizando MUI
const StyledContainer = styled('div')(({ theme }) => ({
  backgroundImage: `url(${fondoComedor2})`,
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
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[10],
  },
}));

function Items() {
  // Definición de estados
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [nuevoItem, setNuevoItem] = useState({
    nombre: '',
    precio: '',
    disponible: true,
    categoria: '',
  });
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombre: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [itemEditado, setItemEditado] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openCategoriaDialog, setOpenCategoriaDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función para cargar datos iniciales
  const cargarDatos = async () => {
    setSubmitting(true);
    try {
      const [itemsRes, categoriasRes] = await Promise.all([
        axiosInstance.get('/items/'),
        axiosInstance.get('/categorias/'),
      ]);

      // Procesar items para asegurar que 'precio' es un número
      const itemsDisponibles = (itemsRes.data.results || itemsRes.data || []).map(item => ({
        ...item,
        precio: !isNaN(Number(item.precio)) ? Number(item.precio) : 0,
      }));

      console.log('Items Disponibles:', itemsDisponibles); // Depuración
      setItems(itemsDisponibles);

      const categoriasDisponibles = categoriasRes.data.results || categoriasRes.data || [];
      setCategorias(categoriasDisponibles);

      setMensaje({ tipo: '', texto: '' });
    } catch (error) {
      console.error('Error al obtener datos:', error);
      setMensaje({ tipo: 'error', texto: 'Hubo un problema al cargar los datos.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Funciones para manejar cambios y acciones

  // Función para manejar cambios en el formulario de ítems
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNuevoItem({
      ...nuevoItem,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Función para manejar cambios en el formulario de categorías
  const handleCategoriaChange = (e) => {
    const { name, value } = e.target;
    setNuevaCategoria({
      ...nuevaCategoria,
      [name]: value
    });
  };

  // Función para agregar o editar un item
  const agregarOEditarItem = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validación de los campos obligatorios
    if (!nuevoItem.nombre || nuevoItem.precio === '' || !nuevoItem.categoria) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa los campos obligatorios.' });
      setSubmitting(false);
      return;
    }

    // Convertir 'precio' a número y manejar NaN
    const precioNumerico = parseFloat(nuevoItem.precio);
    if (isNaN(precioNumerico)) {
      setMensaje({ tipo: 'error', texto: 'El precio debe ser un número válido.' });
      setSubmitting(false);
      return;
    }

    const datosItem = {
      nombre: nuevoItem.nombre,
      precio: precioNumerico,
      categoria: nuevoItem.categoria,
      disponible: nuevoItem.disponible,
    };

    try {
      let response;
      if (modoEdicion) {
        // Realizar la solicitud PUT para editar el item
        const { id, ...datosActualizados } = itemEditado;
        response = await axiosInstance.put(`items/${id}/`, datosActualizados);
        // Asegurarse de que 'precio' es un número
        response.data.precio = !isNaN(Number(response.data.precio)) ? Number(response.data.precio) : 0;
        // Actualizar el estado de los items
        setItems(items.map(item => item.id === response.data.id ? response.data : item));
        setMensaje({ tipo: 'success', texto: 'Item actualizado correctamente.' });
      } else {
        // Realizar la solicitud POST para agregar un nuevo item
        response = await axiosInstance.post('items/', datosItem);
        // Asegurarse de que 'precio' es un número
        response.data.precio = !isNaN(Number(response.data.precio)) ? Number(response.data.precio) : 0;
        // Actualizar el estado de los items
        setItems([...items, response.data]);
        setMensaje({ tipo: 'success', texto: 'Item agregado correctamente.' });
      }
      resetForm();
    } catch (error) {
      console.error('Error al agregar/editar item:', error);
      // Manejar errores específicos del servidor
      if (error.response && error.response.data) {
        const errores = Object.values(error.response.data).join(' ');
        setMensaje({ tipo: 'error', texto: `Error: ${errores}` });
      } else {
        setMensaje({ tipo: 'error', texto: modoEdicion ? 'Error al actualizar el item.' : 'Error al agregar el item.' });
      }
    } finally {
      setSubmitting(false);
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    }
  };

  // Función para habilitar el modo de edición
  const habilitarModoEdicion = (item) => {
    setModoEdicion(true);
    setItemEditado(item);
    setNuevoItem({
      nombre: item.nombre,
      precio: item.precio.toString(),
      disponible: item.disponible,
      categoria: item.categoria,
    });
    setOpenItemDialog(true);
  };

  // Función para reiniciar el formulario
  const resetForm = () => {
    setNuevoItem({ nombre: '', precio: '', disponible: true, categoria: '' });
    setModoEdicion(false);
    setItemEditado(null);
    setOpenItemDialog(false);
  };

  // Función para agregar una nueva categoría
  const agregarCategoria = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Validación de los campos obligatorios
    if (!nuevaCategoria.nombre) {
      setMensaje({ tipo: 'error', texto: 'Por favor ingresa un nombre para la categoría.' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post('categorias/', nuevaCategoria);
      setCategorias([...categorias, response.data]);
      setMensaje({ tipo: 'success', texto: 'Categoría agregada correctamente.' });
      setNuevaCategoria({ nombre: '' });
      setOpenCategoriaDialog(false);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      setMensaje({ tipo: 'error', texto: 'Error al agregar la categoría.' });
    } finally {
      setSubmitting(false);
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    }
  };

  // Función para abrir el diálogo de agregar ítems
  const handleAddItem = () => {
    resetForm();
    setOpenItemDialog(true);
  };

  // Filtrar items según la categoría seleccionada
  const itemsFiltrados = categoriaSeleccionada === 'Todos' 
    ? items 
    : items.filter(item => item.categoria === categoriaSeleccionada);

  return (
    <StyledContainer>
      <Typography variant="h4" component="h1" gutterBottom sx={{
        fontWeight: 'bold', 
        textShadow: '2px 2px 5px rgba(0, 0, 0, 0.6)',
        color: '#fff',
        fontSize: '2rem',
        '@media (max-width:600px)': {
          fontSize: '1.5rem',
        }
      }}>
        Administrar Items
      </Typography>

      {/* Mostrar mensajes de éxito o error */}
      {mensaje.texto && (
        <Alert severity={mensaje.tipo} sx={{
          mb: 4, 
          maxWidth: 600, 
          borderRadius: 2, 
          textAlign: 'center',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          backgroundColor: mensaje.tipo === 'error' ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 255, 0, 0.7)',
          color: '#fff'
        }}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Selector de Categoría y Botones para Agregar */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
        <FormControl variant="outlined" sx={{ minWidth: 200, borderRadius: 2 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            label="Categoría"
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: 2,
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
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddItem}
          sx={{ borderRadius: 20, padding: '10px 20px' }}
        >
          Agregar Item
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setOpenCategoriaDialog(true)}
          sx={{ borderRadius: 20, padding: '10px 20px' }}
        >
          Agregar Categoría
        </Button>
      </Box>

      {/* Lista de Items */}
      <Grid container spacing={2} justifyContent="center">
        {itemsFiltrados.length > 0 ? (
          itemsFiltrados.map(item => (
            <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                      Precio: S/{typeof item.precio === 'number' ? item.precio.toFixed(2) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ color: '#000', fontSize: '0.9rem' }}>
                      Categoría: {item.categoria_nombre || 'Sin categoría'}
                    </Typography>
                    {/* Mostrar rating si existe */}
                    {item.calificacion_promedio !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Rating 
                          name={`rating-${item.id}`} 
                          value={item.calificacion_promedio} 
                          readOnly 
                          precision={0.5} 
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({item.votos} votos)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  {/* Se ha eliminado el Box con los botones de acciones */}
                </StyledCard>
              </motion.div>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info" sx={{ backgroundColor: '#f3f4f6', color: '#333' }}>
              No hay items disponibles en esta categoría.
            </Alert>
          </Grid>
        )}
      </Grid>

      {/* Diálogo para agregar o editar ítems */}
      <Dialog open={openItemDialog} onClose={resetForm} fullWidth maxWidth="sm">
        <DialogTitle>{modoEdicion ? 'Editar Item' : 'Agregar Nuevo Item'}</DialogTitle>
        <Box component="form" noValidate autoComplete="off" onSubmit={agregarOEditarItem}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Nombre"
              name="nombre"
              fullWidth
              variant="outlined"
              value={nuevoItem.nombre}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="dense"
              label="Precio"
              name="precio"
              type="number"
              fullWidth
              variant="outlined"
              value={nuevoItem.precio}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: '0.01' }}
              required
            />
            <FormControl fullWidth margin="dense" variant="outlined" required>
              <InputLabel>Categoría</InputLabel>
              <Select
                label="Categoría"
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
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography variant="body1">Disponible:</Typography>
              <Switch
                checked={nuevoItem.disponible}
                onChange={handleInputChange}
                name="disponible"
                color="primary"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetForm} color="secondary">
              Cancelar
            </Button>
            <Button type="submit" color="primary" variant="contained" disabled={submitting}>
              {modoEdicion ? 'Actualizar' : 'Agregar'} Item
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Diálogo para agregar categorías */}
      <Dialog open={openCategoriaDialog} onClose={() => setOpenCategoriaDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Agregar Nueva Categoría</DialogTitle>
        <Box component="form" onSubmit={agregarCategoria} noValidate>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="nombre"
              label="Nombre de la Categoría"
              type="text"
              fullWidth
              variant="outlined"
              value={nuevaCategoria.nombre}
              onChange={handleCategoriaChange}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCategoriaDialog(false)} color="secondary">
              Cancelar
            </Button>
            <Button type="submit" color="primary" variant="contained" disabled={submitting}>
              Agregar
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </StyledContainer>
  );
}

export default Items;
