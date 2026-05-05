import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Star } from 'lucide-react';

const Home = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalCustomers: 0,
    chefsOnline: 0,
    avgRating: 4.5
  });

  useEffect(() => {
    // Simular carga de datos
    const loadStats = async () => {
      try {
        // Aquí irían las llamadas a la API
        setStats({
          activeOrders: 12,
          totalCustomers: 248,
          chefsOnline: 3,
          avgRating: 4.5
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a QuickBite
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Gestión moderna y eficiente para restaurantes de comida rápida
            </p>
            <div className="space-x-4">
              <Link
                to="/menu"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Ver Menú
              </Link>
              <Link
                to="/orders"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Mis Pedidos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.activeOrders}</h3>
            <p className="text-gray-600">Pedidos Activos</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</h3>
            <p className="text-gray-600">Clientes Totales</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <ChefHat className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.chefsOnline}</h3>
            <p className="text-gray-600">Cocineros Online</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">{stats.avgRating}</h3>
            <p className="text-gray-600">Calificación Promedio</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pedidos en Tiempo Real</h3>
            <p className="text-gray-600">
              Sistema de gestión de pedidos actualizado instantáneamente para 
              una coordinación perfecta entre cocina y delivery.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestión de Inventario</h3>
            <p className="text-gray-600">
              Control automático de stock con alertas en tiempo real para 
              nunca quedarte sin ingredientes importantes.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kitchen Display System</h3>
            <p className="text-gray-600">
              Pantallas intuitivas para cocina con gestión de tiempos y 
              estados de preparación optimizados.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Listo para optimizar tu restaurante?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Únete a la revolución digital en la gestión de restaurantes
          </p>
          <Link
            to="/menu"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Comenzar Ahora
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
