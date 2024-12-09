// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import WelcomeMessage from '../components/WelcomeMessage';
import Button from '../components/Button';
import madera from '../assets/madera.jpg'; // Ruta relativa recomendada

const Home = () => {
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        usuarios: 0,
        pedidos: 0,
        categorias: 0,
        items: 0,
    });

    const fetchUsuario = async () => {
        try {
            const response = await axios.get('/admin-usuarios/me/');
            setUsuario(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error al obtener información del usuario.');
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const [usuariosResponse, pedidosResponse, categoriasResponse, itemsResponse] = await Promise.all([
                axios.get('/admin-usuarios/'),
                axios.get('/pedidos/'),
                axios.get('/categorias/'),
                axios.get('/items/'),
            ]);
            setStats({
                usuarios: usuariosResponse.data.length,
                pedidos: pedidosResponse.data.length,
                categorias: categoriasResponse.data.length,
                items: itemsResponse.data.length,
            });
        } catch (err) {
            setError('Error al obtener estadísticas.');
        }
    };

    useEffect(() => {
        fetchUsuario();
        fetchStats();
    }, []);

    if (loading) return <p className="p-6 text-center text-gray-700">Cargando...</p>;
    if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

    return (
        <div 
            className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${madera})` }}
        >
            <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg max-w-4xl w-full">
                <WelcomeMessage nombre={usuario?.nombre} />
                <p className="mt-4 text-gray-700 text-lg">
                    Gestiona usuarios, categorías, ítems y pedidos desde aquí.
                </p>

                {/* Dashboard Cards */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Usuarios</h3>
                        <p className="text-3xl font-bold">{stats.usuarios}</p>
                    </div>
                    <div className="bg-green-500 text-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Pedidos</h3>
                        <p className="text-3xl font-bold">{stats.pedidos}</p>
                    </div>
                    <div className="bg-yellow-500 text-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Categorías</h3>
                        <p className="text-3xl font-bold">{stats.categorias}</p>
                    </div>
                    <div className="bg-red-500 text-white p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold">Ítems</h3>
                        <p className="text-3xl font-bold">{stats.items}</p>
                    </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <Button 
                        handleClick={() => alert('Gestionar Usuarios')}
                        clicked={false}
                        handleLogout={() => {}}
                        usuario={usuario}
                        className="bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center"
                    >
                        Gestionar Usuarios
                    </Button>
                    <Button 
                        handleClick={() => alert('Gestionar Pedidos')}
                        clicked={false}
                        handleLogout={() => {}}
                        usuario={usuario}
                        className="bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center"
                    >
                        Gestionar Pedidos
                    </Button>
                    <Button 
                        handleClick={() => alert('Gestionar Categorías')}
                        clicked={false}
                        handleLogout={() => {}}
                        usuario={usuario}
                        className="bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center"
                    >
                        Gestionar Categorías
                    </Button>
                    <Button 
                        handleClick={() => alert('Gestionar Ítems')}
                        clicked={false}
                        handleLogout={() => {}}
                        usuario={usuario}
                        className="bg-indigo-600 text-white p-4 rounded-lg shadow-md text-center"
                    >
                        Gestionar Ítems
                    </Button>
                </div>

                {/* Notificaciones */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-700">Notificaciones</h3>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                        <p className="text-gray-700">Nuevos pedidos pendientes de aprobación.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
