// src/components/Home.jsx

import React, { useState, useEffect } from 'react';
import api from '../axiosInstance';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Rating, Button, Typography, CircularProgress, Alert } from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { motion } from 'framer-motion';

// Definición de categorías
const categories = ["Todos", "Comidas", "Postres", "Bebidas", "Lonches"];

function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredCategory, setFilteredCategory] = useState('Todos');
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('items/');
        const itemsArray = response.data.results || [];
        const activeItems = itemsArray.filter(item => item.disponible);
        setItems(activeItems);
        setFilteredMenus(activeItems);
        setCategoryItems(activeItems);
      } catch (error) {
        setError("Hubo un problema al cargar los menús.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filterCategoryItems = (category) => {
    setFilteredCategory(category);
    if (category === 'Todos') {
      setCategoryItems(items);
    } else {
      setCategoryItems(items.filter(item => item.categoria_nombre === category));
    }
  };

  const settings = {
    dots: true,
    infinite: filteredMenus.length > 3,
    speed: 500,
    slidesToShow: Math.min(3, filteredMenus.length),
    slidesToScroll: 1,
    swipeToSlide: true,
    draggable: true,
    arrows: false,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: Math.min(2, filteredMenus.length), slidesToScroll: 1 } },
      { breakpoint: 600, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ],
  };

  return (
    <div className="bg-gradient-to-r from-orange-400 to-cyan-300 min-h-screen">
      {/* Hero Section */}
      <div className="py-12 flex justify-center items-center text-center border-b border-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-white opacity-10 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <Typography variant="h3" component="h1" className="font-bold mb-4 text-white">
                Bienvenido a TecFood
              </Typography>
              <Typography variant="h6" className="mb-6 text-white">
                TecFood es la mejor manera de gestionar tus comidas en el comedor institucional. Personaliza tus pedidos y recibe recomendaciones basadas en tus preferencias.
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="contained" color="primary" size="large" className="rounded-full px-6 py-3">
                  Explorar Menús
                </Button>
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <div className="rounded-lg overflow-hidden shadow-lg">
                <video className="w-full h-64 object-cover rounded-lg" controls>
                  <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                  Tu navegador no soporta la etiqueta de video.
                </video>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Menús Disponibles */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <Typography variant="h4" component="h2" className="text-center mb-8 text-white font-bold">
            Menús Disponibles
          </Typography>

          {loading ? (
            <div className="flex justify-center mt-8">
              <CircularProgress color="inherit" />
            </div>
          ) : error ? (
            <div className="flex justify-center mt-8">
              <Alert severity="error" className="w-full max-w-md">
                {error}
              </Alert>
            </div>
          ) : filteredMenus.length === 0 ? (
            <div className="flex justify-center mt-8">
              <Alert severity="warning" className="w-full max-w-md">
                No hay menús disponibles para esta categoría.
              </Alert>
            </div>
          ) : (
            <Slider {...settings} className="mx-8">
              {filteredMenus.map(item => (
                <motion.div key={item.id} className="px-4" whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
                  <motion.div
                    className="bg-white shadow-lg rounded-lg overflow-hidden relative"
                    whileHover={{ y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img className="w-full h-48 object-cover" src={item.imagen || "https://via.placeholder.com/350x180"} alt={item.nombre} />
                    <div className="p-6 text-center">
                      <Typography variant="h6" component="h3" className="font-bold mb-2">
                        {item.nombre}
                      </Typography>
                      <div className="flex items-center justify-center text-2xl font-bold text-green-600">
                        <LocalOfferIcon className="mr-1" fontSize="large" />
                        <span>S/{item.precio}</span>
                      </div>
                      <Rating name="read-only" value={item.calificacion_promedio || 0} readOnly precision={0.5} size="small" className="my-2" />
                      <Button variant="contained" color="primary" fullWidth className="mt-4 rounded-full">
                        Pedir
                      </Button>
                      <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} className="mt-4">
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          startIcon={<ShoppingCartIcon />}
                          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                        >
                          Añadir al Carrito
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </Slider>
          )}
        </div>
      </div>

      {/* Categorías */}
      <div className="py-12 bg-gradient-to-r from-cyan-300 to-orange-400">
        <div className="container mx-auto px-4">
          <Typography variant="h4" component="h2" className="text-center mb-8 text-white font-bold">
            Categorías
          </Typography>
          <div className="flex justify-center space-x-4 mb-8 flex-wrap">
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => filterCategoryItems(category)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 m-2 rounded-lg transition duration-300 ${
                  filteredCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-cyan-600 hover:bg-orange-500 hover:text-white'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Listado de Comidas por Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryItems.map(item => (
              <motion.div
                key={item.id}
                className="bg-white shadow-lg rounded-lg overflow-hidden transform transition duration-300 hover:scale-105"
              >
                <img className="w-full h-48 object-cover" src={item.imagen || "https://via.placeholder.com/350x180"} alt={item.nombre} />
                <div className="p-6 text-center">
                  <Typography variant="h6" component="h3" className="font-bold mb-2 text-cyan-600">
                    {item.nombre}
                  </Typography>
                  <div className="flex items-center justify-center text-2xl font-bold text-green-600">
                    <LocalOfferIcon className="mr-1" fontSize="large" />
                    <span>S/{item.precio}</span>
                  </div>
                  <Rating name="read-only" value={item.calificacion_promedio || 0} readOnly precision={0.5} size="small" className="my-2" />
                  <Button variant="contained" color="primary" fullWidth className="mt-4 rounded-full">
                    Pedir
                  </Button>
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} className="mt-4">
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      startIcon={<ShoppingCartIcon />}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full"
                    >
                      Añadir al Carrito
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-orange-500 text-white py-6 text-center">
        <Typography variant="body1">&copy; 2024 TecFood - Todos los derechos reservados</Typography>
      </div>
    </div>
  );
}

export default Home;
