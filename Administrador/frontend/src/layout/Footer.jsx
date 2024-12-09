// src/layout/Footer.jsx
import React from 'react';
import { Box, Container, Grid, Typography, Link as MuiLink, Divider } from '@mui/material';
import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';
import logo from '../assets/logo.png'; // Ruta relativa corregida

const colors = {
  primary: '#0096FF',    // Celeste
  accent: '#FFD700',     // Dorado
  text: '#000000',       // Negro
};

const Footer = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: colors.primary, color: colors.text, py: 8 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo y Descripción */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <img src={logo} alt="TecLunch" style={{ width: '50px', marginRight: '16px' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.accent }}>
                TecLunch
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              Gestiona tu experiencia culinaria en Tecsup con eficiencia y estilo.
            </Typography>
          </Grid>

          {/* Navegación */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ color: colors.accent }} gutterBottom>
              Navegación
            </Typography>
            <Box>
              <MuiLink href="/" color="inherit" sx={{ display: 'block', mb: 2, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Inicio
              </MuiLink>
              <MuiLink href="/menu" color="inherit" sx={{ display: 'block', mb: 2, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Menú
              </MuiLink>
              <MuiLink href="/sobre-nosotros" color="inherit" sx={{ display: 'block', mb: 2, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Sobre nosotros
              </MuiLink>
              <MuiLink href="/contacto" color="inherit" sx={{ display: 'block', mb: 2, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                Contacto
              </MuiLink>
            </Box>
          </Grid>

          {/* Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ color: colors.accent }} gutterBottom>
              Síguenos
            </Typography>
            <Box>
              <MuiLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" color="inherit" sx={{ mr: 4 }}>
                <Facebook fontSize="large" />
              </MuiLink>
              <MuiLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" color="inherit" sx={{ mr: 4 }}>
                <Instagram fontSize="large" />
              </MuiLink>
              <MuiLink href="https://twitter.com" target="_blank" rel="noopener noreferrer" color="inherit" sx={{ mr: 4 }}>
                <Twitter fontSize="large" />
              </MuiLink>
              <MuiLink href="https://linkedin.com" target="_blank" rel="noopener noreferrer" color="inherit">
                <LinkedIn fontSize="large" />
              </MuiLink>
            </Box>
          </Grid>

          {/* Información de derechos de autor */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ color: '#B0B0B0' }}>
              © 2024 TecLunch. Todos los derechos reservados.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      <Divider sx={{ my: 4, backgroundColor: '#B0B0B0' }} />

      {/* Enlace a la política de privacidad */}
      <Container maxWidth="lg">
        <Typography variant="body2" sx={{ textAlign: 'center', color: '#B0B0B0' }}>
          <MuiLink href="/privacy-policy" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Política de privacidad
          </MuiLink>
          {' | '}
          <MuiLink href="/terms-of-service" color="inherit" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
            Términos de servicio
          </MuiLink>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
