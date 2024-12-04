import React, { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  Tooltip,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import fondoComedor from '../assets/comedor.jpg'; // Importamos la imagen de fondo

// Estilos personalizados
const StyledContainer = styled('div')({
  backgroundImage: `url(${fondoComedor})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
});

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(5px)',
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[5],
  overflow: 'hidden',
  position: 'relative',
}));

function Pedidos() {
  // Definición de estados
  const [pedidos, setPedidos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [open, setOpen] = useState(false);
  const [nuevoPedido, setNuevoPedido] = useState({
    usuario: '',
    estado: 'Reservado',
    metodo_pago: 'Otro',
    pedido_items: [{ item: '', cantidad: 1 }],
  });
  const [itemError, setItemError] = useState(null);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  // Función para cargar datos iniciales
  const cargarDatosIniciales = async () => {
    setLoading(true);
    try {
      const [pedidosRes, usuariosRes, itemsRes] = await Promise.all([
        api.get('/pedidos/'),
        api.get('/usuarios/'),
        api.get('/items/'),
      ]);

      setPedidos(pedidosRes.data.results || pedidosRes.data || []);
      setUsuarios(usuariosRes.data.results || usuariosRes.data || []);
      setItems((itemsRes.data.results || itemsRes.data || []).filter((item) => item.disponible));
    } catch (error) {
      setError('Error al cargar los datos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar cambios y acciones

  // Función para manejar cambios de estado en un pedido
  const handleEstadoChange = async (pedidoId, nuevoEstado) => {
    try {
      const response = await api.patch(`/pedidos/${pedidoId}/`, { estado: nuevoEstado });
      setPedidos(
        pedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado: response.data.estado } : pedido
        )
      );
      setMensaje('Estado actualizado correctamente');
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      setError('Error al actualizar el estado del pedido.');
    }
  };

  // Función para manejar cambios de método de pago en un pedido
  const handleMetodoPagoChange = async (pedidoId, nuevoMetodoPago) => {
    try {
      const pedido = pedidos.find((p) => p.id === pedidoId);
      const transaccion = pedido.transacciones && pedido.transacciones[0];
      if (transaccion) {
        await api.patch(`/transacciones/${transaccion.id}/`, { metodo_pago: nuevoMetodoPago });
        setPedidos(
          pedidos.map((pedido) =>
            pedido.id === pedidoId
              ? {
                  ...pedido,
                  transacciones: [
                    {
                      ...pedido.transacciones[0],
                      metodo_pago: nuevoMetodoPago,
                    },
                  ],
                }
              : pedido
          )
        );
        setMensaje('Método de pago actualizado correctamente');
        setTimeout(() => setMensaje(null), 3000);
      } else {
        setError('No se encontró la transacción asociada al pedido.');
      }
    } catch (error) {
      setError('Error al actualizar el método de pago del pedido.');
    }
  };

  // Función para eliminar un pedido
  const handleEliminarPedido = async (pedidoId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      try {
        await api.delete(`/pedidos/${pedidoId}/`);
        setPedidos(pedidos.filter((pedido) => pedido.id !== pedidoId));
        setMensaje('Pedido eliminado correctamente');
        setTimeout(() => setMensaje(null), 3000);
      } catch (error) {
        setError('Error al eliminar el pedido.');
      }
    }
  };

  // Manejo de apertura y cierre del diálogo
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNuevoPedido({
      usuario: '',
      estado: 'Reservado',
      metodo_pago: 'Otro',
      pedido_items: [{ item: '', cantidad: 1 }],
    });
    setItemError(null);
  };

  // Manejo de cambios en los items del pedido
  const handleItemChange = (index, field, value) => {
    const updatedPedidoItems = [...nuevoPedido.pedido_items];
    updatedPedidoItems[index][field] = value;
    setNuevoPedido({ ...nuevoPedido, pedido_items: updatedPedidoItems });
  };

  // Función para agregar un nuevo item al pedido
  const agregarItem = () => {
    setNuevoPedido((prevState) => ({
      ...prevState,
      pedido_items: [...prevState.pedido_items, { item: '', cantidad: 1 }],
    }));
  };

  // Función para eliminar un item del pedido
  const eliminarItem = (index) => {
    const updatedPedidoItems = [...nuevoPedido.pedido_items];
    updatedPedidoItems.splice(index, 1);
    setNuevoPedido({ ...nuevoPedido, pedido_items: updatedPedidoItems });
  };

  // Función para crear un nuevo pedido
  const handleCrearPedido = async () => {
    const valid =
      nuevoPedido.pedido_items.every((pi) => pi.item && pi.cantidad > 0) && nuevoPedido.usuario;
    if (!valid) {
      setItemError('Por favor, selecciona al menos un ítem, una cantidad válida y un usuario.');
      return;
    }

    const datosPedido = {
      usuario: nuevoPedido.usuario,
      estado: nuevoPedido.estado,
      pedido_items: nuevoPedido.pedido_items.map((pi) => ({
        item: pi.item,
        cantidad: parseInt(pi.cantidad, 10),
      })),
      metodo_pago: nuevoPedido.metodo_pago,
    };

    try {
      const response = await api.post('/pedidos/', datosPedido);
      setPedidos([...pedidos, response.data]);
      setMensaje('Pedido creado exitosamente');
      handleClose();
    } catch (error) {
      console.error('Error al crear pedido:', error.response ? error.response.data : error);
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          setError(errorData);
        } else if (errorData.detail) {
          setError(errorData.detail);
        } else {
          const errorMessages = Object.values(errorData)
            .flat()
            .join(' ');
          setError(errorMessages || 'Hubo un problema al crear el pedido.');
        }
      } else {
        setError('Hubo un problema al crear el pedido.');
      }
    }
  };

  // Mostrar indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledContainer>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{ color: '#fff', textShadow: '2px 2px 4px rgba(0,0,0,0.7)', mb: 4 }}
        >
          <ShoppingCartIcon fontSize="large" /> Pedidos
        </Typography>

        {mensaje && (
          <Alert severity="success" sx={{ mb: 4 }}>
            {mensaje}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            startIcon={<AddCircleIcon />}
            sx={{
              fontWeight: 'bold',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#2a5298',
            }}
          >
            Crear Nuevo Pedido
          </Button>
        </Box>

        {/* Diálogo para crear nuevo pedido */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          TransitionComponent={Slide}
          keepMounted
          PaperProps={{
            style: {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(5px)',
            },
          }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
            <AddCircleIcon sx={{ mr: 1 }} />
            <Typography variant="h6" component="div">
              Crear Nuevo Pedido
            </Typography>
          </DialogTitle>
          <DialogContent>
            {/* Formulario para seleccionar usuario */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="usuario-label">
                <PersonIcon sx={{ mr: 1 }} /> Usuario
              </InputLabel>
              <Select
                labelId="usuario-label"
                value={nuevoPedido.usuario}
                onChange={(e) => setNuevoPedido({ ...nuevoPedido, usuario: e.target.value })}
                label={
                  <span>
                    <PersonIcon sx={{ mr: 1 }} />
                    Usuario
                  </span>
                }
              >
                {usuarios.map((usuario) => (
                  <MenuItem key={usuario.id_institucional} value={usuario.id_institucional}>
                    {usuario.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Formulario para seleccionar estado */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="estado-label">
                <DescriptionIcon sx={{ mr: 1 }} /> Estado
              </InputLabel>
              <Select
                labelId="estado-label"
                value={nuevoPedido.estado}
                onChange={(e) => setNuevoPedido({ ...nuevoPedido, estado: e.target.value })}
                label={
                  <span>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    Estado
                  </span>
                }
              >
                <MenuItem value="Reservado">Reservado</MenuItem>
                <MenuItem value="Pagado">Pagado</MenuItem>
                <MenuItem value="Entregado">Entregado</MenuItem>
                <MenuItem value="Cancelado">Cancelado</MenuItem>
              </Select>
            </FormControl>

            {/* Formulario para seleccionar método de pago */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="metodo-pago-label">
                <PaymentIcon sx={{ mr: 1 }} /> Método de Pago
              </InputLabel>
              <Select
                labelId="metodo-pago-label"
                value={nuevoPedido.metodo_pago}
                onChange={(e) => setNuevoPedido({ ...nuevoPedido, metodo_pago: e.target.value })}
                label={
                  <span>
                    <PaymentIcon sx={{ mr: 1 }} />
                    Método de Pago
                  </span>
                }
              >
                <MenuItem value="Banca Movil">Banca Movil</MenuItem>
                <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                <MenuItem value="Efectivo">Efectivo</MenuItem>
              </Select>
            </FormControl>

            {/* Lista de items del pedido */}
            {nuevoPedido.pedido_items.map((pedidoItem, index) => (
              <Box key={index} sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel id={`item-label-${index}`}>Ítem</InputLabel>
                  <Select
                    labelId={`item-label-${index}`}
                    value={pedidoItem.item}
                    onChange={(e) => handleItemChange(index, 'item', e.target.value)}
                    label="Ítem"
                  >
                    {items.map((item) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.nombre} - S/{parseFloat(item.precio).toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="dense"
                  type="number"
                  variant="outlined"
                  value={pedidoItem.cantidad}
                  onChange={(e) => handleItemChange(index, 'cantidad', e.target.value)}
                  sx={{ mx: 2, width: '100px' }}
                  InputProps={{ inputProps: { min: 1 } }}
                  required
                />
                {nuevoPedido.pedido_items.length > 1 && (
                  <Tooltip title="Eliminar Ítem">
                    <IconButton color="error" onClick={() => eliminarItem(index)}>
                      <RemoveCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {index === nuevoPedido.pedido_items.length - 1 && (
                  <Tooltip title="Agregar Ítem">
                    <IconButton color="primary" onClick={agregarItem}>
                      <AddCircleIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}
            {itemError && (
              <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                {itemError}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button
              onClick={handleCrearPedido}
              variant="contained"
              color="primary"
              startIcon={<AddCircleIcon />}
            >
              Crear Pedido
            </Button>
          </DialogActions>
        </Dialog>

        {/* Lista de pedidos existentes */}
        <Grid container spacing={4}>
          {pedidos.map((pedido) => (
            <Grid item xs={12} sm={6} md={4} key={pedido.id}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <StyledCard>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      <EventIcon sx={{ mr: 1 }} />
                      Pedido #{pedido.id} - {pedido.estado}
                    </Typography>
                    <Typography variant="body1">
                      <PersonIcon sx={{ mr: 1 }} />
                      Usuario: {pedido.usuario_nombre}
                    </Typography>
                    <Typography variant="body1">
                      <EventIcon sx={{ mr: 1 }} />
                      Fecha: {pedido.fecha_pedido}
                    </Typography>
                    <Typography variant="body1">
                      <PaymentIcon sx={{ mr: 1 }} />
                      Total: S/{(pedido.total_pedido ?? 0).toFixed(2)}
                    </Typography>
                    <Typography variant="body1">
                      <PaymentIcon sx={{ mr: 1 }} />
                      Método de Pago:{' '}
                      {pedido.transacciones && pedido.transacciones.length > 0
                        ? pedido.transacciones[0].metodo_pago
                        : 'No especificado'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      Items:
                    </Typography>
                    <ul>
                      {pedido.pedido_items.map((item) => (
                        <li key={item.id}>
                          {item.item_nombre} x {item.cantidad}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'center', flexWrap: 'wrap' }}>
                    <FormControl sx={{ minWidth: 120, mb: 1 }}>
                      <InputLabel id={`estado-pedido-label-${pedido.id}`}>Estado</InputLabel>
                      <Select
                        labelId={`estado-pedido-label-${pedido.id}`}
                        value={pedido.estado}
                        onChange={(e) => handleEstadoChange(pedido.id, e.target.value)}
                        label="Estado"
                      >
                        <MenuItem value="Reservado">Reservado</MenuItem>
                        <MenuItem value="Pagado">Pagado</MenuItem>
                        <MenuItem value="Entregado">Entregado</MenuItem>
                        <MenuItem value="Cancelado">Cancelado</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ minWidth: 120, ml: 2, mb: 1 }}>
                      <InputLabel id={`metodo-pago-label-${pedido.id}`}>Método de Pago</InputLabel>
                      <Select
                        labelId={`metodo-pago-label-${pedido.id}`}
                        value={
                          pedido.transacciones && pedido.transacciones.length > 0
                            ? pedido.transacciones[0].metodo_pago
                            : ''
                        }
                        onChange={(e) => handleMetodoPagoChange(pedido.id, e.target.value)}
                        label="Método de Pago"
                      >
                        <MenuItem value="Banca Movil">Banca Movil</MenuItem>
                        <MenuItem value="Tarjeta">Tarjeta</MenuItem>
                        <MenuItem value="Efectivo">Efectivo</MenuItem>
                      </Select>
                    </FormControl>
                    <Tooltip title="Eliminar Pedido">
                      <IconButton
                        color="error"
                        onClick={() => handleEliminarPedido(pedido.id)}
                        sx={{ ml: 2 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </StyledContainer>
  );
}

export default Pedidos;
