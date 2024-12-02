import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Divider,
} from '@mui/material';
import { Facebook, Instagram, Twitter, LinkedIn } from '@mui/icons-material';
import logo from '../../assets/logo.png'; // Importa el logo correctamente

const Footer = () => {
  return (
    <Box component="footer" sx={{ backgroundColor: 'primary.dark', color: 'grey.100', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo y Descripción */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <img src={logo} alt="TecLunch" style={{ width: 50, marginRight: 8 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                TecLunch
              </Typography>
            </Box>
            <Typography variant="body2">
              Gestiona tu experiencia culinaria en Tecsup con eficiencia y estilo.
            </Typography>
          </Grid>

          {/* Navegación */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
              Enlaces Rápidos
            </Typography>
            <Box component="nav">
              {['Inicio', 'Sobre Nosotros', 'Servicios', 'Menú', 'Reservas', 'Contacto'].map((item, index) => (
                <Link
                  key={index}
                  href={`/${item.replace(' ', '-').toLowerCase()}`}
                  variant="body2"
                  underline="hover"
                  sx={{ display: 'block', mb: 0.5, color: 'grey.200' }}
                >
                  {item}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
              Contacto
            </Typography>
            <Typography variant="body2">
              Dirección: Tecsup xdddd comedor
            </Typography>
            <Typography variant="body2">
              Teléfono: (01) 234-5678
            </Typography>
            <Typography variant="body2">
              Email: contacto@teclunch-C24.com
            </Typography>
          </Grid>

          {/* Redes Sociales */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ color: 'secondary.main' }}>
              Síguenos
            </Typography>
            <Box sx={{ display: 'flex', mt: 1 }}>
              <Link href="https://www.facebook.com/teclunchadmin" target="_blank" rel="noopener" sx={{ color: 'grey.200', mr: 1 }}>
                <Facebook fontSize="large" />
              </Link>
              <Link href="https://www.instagram.com/teclunchadmin" target="_blank" rel="noopener" sx={{ color: 'grey.200', mr: 1 }}>
                <Instagram fontSize="large" />
              </Link>
              <Link href="https://www.twitter.com/teclunchadmin" target="_blank" rel="noopener" sx={{ color: 'grey.200', mr: 1 }}>
                <Twitter fontSize="large" />
              </Link>
              <Link href="https://www.linkedin.com/company/teclunchadmin" target="_blank" rel="noopener" sx={{ color: 'grey.200' }}>
                <LinkedIn fontSize="large" />
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, backgroundColor: 'grey.800' }} />

        {/* Derechos Reservados */}
        <Box textAlign="center">
          <Typography variant="body2">
            © {new Date().getFullYear()} <strong>TecLunch</strong>. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
