// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Home from './pages/Home';
import Usuarios from './pages/Usuarios';
import Pedidos from './pages/Pedidos'; // Asegúrate de importar la página de Pedidos
import Items from './pages/Items'; // Asegúrate de importar la página de Items (Comidas)
import Cartas from './pages/Cartas'; // Ruta correcta
import Transacciones from './pages/Transacciones'; // Asegúrate de importar la página de Transacciones
import Chat from './pages/Chat'; // Asegúrate de importar la página de Chat
import LoginRedirect from './pages/LoginRedirect';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            {isAuthenticated && <Navbar />}
            <div className="min-h-screen">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute>
                                <Usuarios />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/pedidos"
                        element={
                            <ProtectedRoute>
                                <Pedidos />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/comidas"
                        element={
                            <ProtectedRoute>
                                <Items /> // Aquí se usa Items para representar Comidas
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cartas"
                        element={
                            <ProtectedRoute>
                                <Cartas />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/transacciones"
                        element={
                            <ProtectedRoute>
                                <Transacciones />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/redirect" element={<LoginRedirect />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            {isAuthenticated && <Footer />}
        </Router>
    );
};

export default App;
