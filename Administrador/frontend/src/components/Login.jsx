import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Avatar,
    Paper,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
    const [correo, setCorreo] = useState('');  // Estado para almacenar el correo ingresado
    const [password, setPassword] = useState('');  // Estado para almacenar la contraseña
    const [error, setError] = useState(null);  // Estado para manejar errores
    const navigate = useNavigate();

    // Función desactivada para evitar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null);
        // No hacer ninguna solicitud por ahora, simplemente redirigir a /home
        onLogin({ nombre: "Usuario Simulado", correo }, "fake_token");
        navigate('/home');
    };

    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={6} sx={{ padding: 4, borderRadius: '20px', boxShadow: 10 }}>
                <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
                    <LockIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h4" component="h1" align="center" sx={{ mb: 2 }}>
                    Iniciar Sesión
                </Typography>
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <Box mb={3}>
                        <TextField
                            label="Correo"
                            type="email"
                            fullWidth
                            variant="outlined"
                            value={correo}
                            onChange={(e) => setCorreo(e.target.value)}
                            required
                            sx={{ fontSize: '1.2rem' }}
                        />
                    </Box>
                    <Box mb={3}>
                        <TextField
                            label="Contraseña"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{ fontSize: '1.2rem' }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        fullWidth
                        sx={{ padding: '12px', fontSize: '1.2rem' }}
                    >
                        Iniciar Sesión
                    </Button>
                </form>
            </Paper>
        </Container>
    );
}

export default Login;
