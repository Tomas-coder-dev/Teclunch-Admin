// src/components/Transacciones.js

import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    CircularProgress,
    Box,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    Tooltip,
    TextField,
    Pagination,
    Snackbar,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import backgroundImage from '../assets/comedor3.jpg';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { motion } from 'framer-motion';

// Estilos personalizados
const StyledContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.spacing(1),
    boxShadow: theme.shadows[3],
    animation: '$fadeIn 1s ease-in-out',
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
    marginTop: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
}));

const StyledSearchBar = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    width: '100%',
}));

const StyledActions = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: theme.spacing(2),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));

const StyledSnackbar = styled(Snackbar)(({ theme }) => ({
    '& .MuiSnackbarContent-root': {
        backgroundColor: theme.palette.success.main,
        color: theme.palette.success.contrastText,
    },
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    marginBottom: theme.spacing(2),
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    justifyContent: 'center',
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        cursor: 'pointer',
    },
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    fontWeight: 'bold',
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.primary.light,
    },
}));

const StyledRefreshIcon = styled(RefreshIcon)(({ theme }) => ({
    color: '#FFFFFF', // Cambiado a blanco
}));

const StyledPictureAsPdfIcon = styled(PictureAsPdfIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledInfoIcon = styled(InfoIcon)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
    color: theme.palette.primary.main,
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
    color: '#FFFFFF', // Cambiado a blanco
    fontWeight: 'bold',
}));

const StyledBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.spacing(1),
    },
}));

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
    color: theme.palette.text.secondary,
}));

const StyledButton = styled(Button)(({ theme }) => ({
    '&:hover': {
        backgroundColor: theme.palette.primary.light,
    },
}));

function Transacciones() {
    const [transacciones, setTransacciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTransaccion, setSelectedTransaccion] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const itemsPerPage = 10;
    const [estadoEdicion, setEstadoEdicion] = useState({}); // Para controlar qué transacciones están en edición

    // Debounce para optimizar la búsqueda
    const debouncedSearch = useCallback(
        debounce((value) => {
            setSearchTerm(value);
            setCurrentPage(1);
        }, 500),
        []
    );

    useEffect(() => {
        fetchTransacciones();
        // Limpiar el debounce al desmontar
        return () => {
            debouncedSearch.cancel();
        };
    }, [currentPage, searchTerm]);

    const fetchTransacciones = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/transacciones/', {
                params: {
                    page: currentPage,
                    search: searchTerm,
                },
            });
            setTransacciones(response.data.results || []);
            setTotalPages(Math.ceil(response.data.count / itemsPerPage));
            setError(null);
        } catch (err) {
            console.error('Error al obtener transacciones:', err);
            setError('Error al cargar las transacciones. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDF = async (transaccion) => {
        const input = document.getElementById(`transaccion-${transaccion.id}`);
        if (!input) {
            console.error('Elemento para PDF no encontrado');
            return;
        }

        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Transaccion_${transaccion.id}.pdf`);

            setSnackbarOpen(true);
        } catch (error) {
            console.error('Error al generar el PDF:', error);
            setError('Error al generar el PDF de la transacción.');
        }
    };

    const handleOpenModal = (transaccion) => {
        setSelectedTransaccion(transaccion);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedTransaccion(null);
        setEstadoEdicion({});
    };

    const handleSearchChange = (event) => {
        debouncedSearch(event.target.value);
    };

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleRefresh = () => {
        fetchTransacciones();
    };

    const handleEstadoChange = (transaccionId, newEstado) => {
        setEstadoEdicion((prev) => ({ ...prev, [transaccionId]: newEstado }));
    };

    const handleEstadoSubmit = async (transaccion) => {
        try {
            await axiosInstance.patch(`/transacciones/${transaccion.id}/`, {
                estado: estadoEdicion[transaccion.id],
            });
            fetchTransacciones();
            setSnackbarOpen(true);
        } catch (err) {
            console.error('Error al actualizar el estado:', err);
            setError('Error al actualizar el estado de la transacción.');
        }
    };

    if (loading) {
        return (
            <StyledBox>
                <StyledCircularProgress />
            </StyledBox>
        );
    }

    return (
        <StyledContainer maxWidth="lg">
            <StyledTypography variant="h4" gutterBottom>
                Transacciones
            </StyledTypography>

            {error && (
                <StyledAlert severity="error">
                    {error}
                </StyledAlert>
            )}

            <StyledActions>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <StyledSearchBar
                        label="Buscar por nombre de usuario"
                        variant="outlined"
                        onChange={handleSearchChange}
                        InputProps={{
                            endAdornment: <SearchIcon />,
                            style: { color: '#FFFFFF' }, // Cambiar color del texto a blanco
                        }}
                        InputLabelProps={{
                            style: { color: '#FFFFFF' }, // Cambiar color de la etiqueta a blanco
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: '#FFFFFF', // Bordes blancos
                                },
                                '&:hover fieldset': {
                                    borderColor: '#FFFFFF',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#FFFFFF',
                                },
                                color: '#FFFFFF', // Texto blanco
                            },
                            '& .MuiInputLabel-outlined': {
                                color: '#FFFFFF', // Etiqueta blanca
                            },
                        }}
                    />
                </Box>
                <Tooltip title="Refrescar transacciones">
                    <StyledIconButton onClick={handleRefresh}>
                        <StyledRefreshIcon />
                    </StyledIconButton>
                </Tooltip>
            </StyledActions>

            <StyledTableContainer component={Paper}>
                <Table aria-label="transacciones">
                    <TableHead>
                        <TableRow>
                            <StyledTableCell>Codigo Pedido</StyledTableCell>
                            <StyledTableCell>Usuario</StyledTableCell>
                            <StyledTableCell>Realizador</StyledTableCell>
                            <StyledTableCell>Estado</StyledTableCell>
                            <StyledTableCell>Método de Pago</StyledTableCell>
                            <StyledTableCell>Fecha</StyledTableCell>
                            <StyledTableCell>Monto (S/)</StyledTableCell>
                            <StyledTableCell align="center">Acciones</StyledTableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transacciones.map((transaccion) => (
                            <StyledTableRow key={transaccion.id}>
                                <TableCell>{transaccion.pedido_codigo_pedido || 'N/A'}</TableCell>
                                <TableCell>{transaccion.usuario_nombre || 'N/A'}</TableCell>
                                <TableCell>{transaccion.realizador_nombre || 'N/A'}</TableCell>
                                <TableCell>
                                    {/* Mostrar el estado y permitir editar solo si está en 'Pendiente' */}
                                    {['Completado', 'Fallido'].includes(transaccion.estado) ? (
                                        transaccion.estado
                                    ) : (
                                        <FormControl variant="standard" fullWidth>
                                            <Select
                                                value={estadoEdicion[transaccion.id] || transaccion.estado}
                                                onChange={(e) => handleEstadoChange(transaccion.id, e.target.value)}
                                                disabled={transaccion.estado !== 'Pendiente'}
                                                sx={{
                                                    color: '#000000', // Texto negro en el select
                                                    '& .MuiSelect-icon': {
                                                        color: '#000000', // Ícono negro
                                                    },
                                                }}
                                            >
                                                <MenuItem value="Pendiente">Pendiente</MenuItem>
                                                <MenuItem value="Completado">Completado</MenuItem>
                                                <MenuItem value="Fallido">Fallido</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                </TableCell>
                                <TableCell>{transaccion.metodo_pago}</TableCell>
                                <TableCell>{new Date(transaccion.fecha).toLocaleDateString()}</TableCell>
                                <TableCell>{parseFloat(transaccion.monto).toFixed(2)}</TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Ver más detalles">
                                        <StyledIconButton
                                            color="primary"
                                            onClick={() => handleOpenModal(transaccion)}
                                        >
                                            <StyledInfoIcon />
                                        </StyledIconButton>
                                    </Tooltip>
                                </TableCell>
                            </StyledTableRow>
                        ))}
                        {transacciones.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No hay transacciones disponibles.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </StyledTableContainer>

            <StyledPagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
            />

            {/* Modal para mostrar información completa de la transacción */}
            <StyledDialog
                open={openModal}
                onClose={handleCloseModal}
                maxWidth="sm"
                fullWidth
            >
                <StyledDialogTitle>Información de la Transacción</StyledDialogTitle>
                <StyledDialogContent dividers>
                    {selectedTransaccion ? (
                        <Box id={`transaccion-${selectedTransaccion.id}`}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Codigo Pedido:</strong> {selectedTransaccion.pedido_codigo_pedido || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Usuario:</strong> {selectedTransaccion.usuario_nombre || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Realizador:</strong> {selectedTransaccion.realizador_nombre || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Método de Pago:</strong> {selectedTransaccion.metodo_pago}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Estado:</strong> {selectedTransaccion.estado}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Fecha:</strong> {new Date(selectedTransaccion.fecha).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        <strong>Monto:</strong> S/ {parseFloat(selectedTransaccion.monto).toFixed(2)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <StyledDialogContentText>
                            No se encontró la información de la transacción.
                        </StyledDialogContentText>
                    )}
                </StyledDialogContent>
                <StyledDialogActions>
                    {selectedTransaccion && selectedTransaccion.estado === 'Pendiente' && (
                        <Box display="flex" alignItems="center" flexWrap="wrap" gap={2}>
                            <FormControl variant="standard" sx={{ minWidth: 120 }}>
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={estadoEdicion[selectedTransaccion.id] || selectedTransaccion.estado}
                                    onChange={(e) => handleEstadoChange(selectedTransaccion.id, e.target.value)}
                                    sx={{
                                        color: '#000000', // Texto negro en el select
                                        '& .MuiSelect-icon': {
                                            color: '#000000', // Ícono negro
                                        },
                                    }}
                                >
                                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                                    <MenuItem value="Completado">Completado</MenuItem>
                                    <MenuItem value="Fallido">Fallido</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleEstadoSubmit(selectedTransaccion)}
                                disabled={!estadoEdicion[selectedTransaccion.id] || selectedTransaccion.estado !== 'Pendiente'}
                            >
                                Actualizar Estado
                            </Button>
                        </Box>
                    )}
                    {selectedTransaccion && (
                        <Tooltip title="Generar PDF">
                            <IconButton
                                color="secondary"
                                onClick={() => handleGeneratePDF(selectedTransaccion)}
                            >
                                <StyledPictureAsPdfIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                    <StyledButton onClick={handleCloseModal} color="primary" variant="outlined">
                        Cerrar
                    </StyledButton>
                </StyledDialogActions>
            </StyledDialog>

            {/* Snackbar para mostrar mensaje de éxito al generar PDF o actualizar estado */}
            <StyledSnackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message="Operación realizada con éxito"
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
        </StyledContainer>
    );

}

export default Transacciones;
