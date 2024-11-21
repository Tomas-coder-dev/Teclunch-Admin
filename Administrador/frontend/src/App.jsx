import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer'; // Importa el Footer
import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Pedidos from './pages/Pedidos';
import Items from './pages/Items';
import Cartas from './pages/Cartas';
import Transacciones from './pages/Transacciones';
import Reservas from './pages/Reservas';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="text-center">
      <Router>
        <Navbar /> {/* Muestra el Navbar */}
        <Routes>
          {/* Rutas principales de la aplicación */}
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/items" element={<Items />} />
          <Route path="/cartas" element={<Cartas />} />
          <Route path="/transacciones" element={<Transacciones />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/chat" element={<Chat />} />
          {/* Ruta comodín para redirigir a la página de inicio en caso de URL desconocida */}
          <Route path="*" element={<Home />} />
        </Routes>
        <Footer /> {/* Añade el Footer al final */}
      </Router>
    </div>
  );
}

export default App;
