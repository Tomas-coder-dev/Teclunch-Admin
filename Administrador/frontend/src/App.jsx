// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Usuarios from './components/Usuarios';
import Pedidos from './components/Pedidos';
import Items from './components/Items';
import Cartas from './components/Cartas';
import Transacciones from './components/Transacciones';
import Reservas from './components/Reservas';
import Chat from './components/Chat';

function App() {
  return (
    <div className="text-center">
      <Router>
        <Navbar />
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
      </Router>
    </div>
  );
}

export default App;
