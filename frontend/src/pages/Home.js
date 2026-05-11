import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, ChefHat, Star, MapPin, Store, TrendingUp, Smartphone, Shield, Utensils, Zap, Truck } from 'lucide-react';

const Home = () => {
  const userRole = localStorage.getItem('userRole');
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
      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Bienvenido a QuickBite
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Gestión moderna y eficiente para restaurantes de comida rápida
            </p>
            <div className="space-x-4">
              <Link
                to="/menu"
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors shadow-md"
              >
                Ver Menú
              </Link>
              {userRole === 'CLIENT' && (
                <Link
                  to="/orders"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
                >
                  Mis Pedidos
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-secondary-900">{stats.activeOrders}</h3>
            <p className="text-gray-600">Pedidos Activos</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-secondary-900">{stats.totalCustomers}</h3>
            <p className="text-gray-600">Clientes Totales</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <ChefHat className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-secondary-900">{stats.chefsOnline}</h3>
            <p className="text-gray-600">Cocineros Online</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-secondary-900">{stats.avgRating}</h3>
            <p className="text-gray-600">Calificación Promedio</p>
          </div>
        </div>
      </div>

      {/* Restaurants Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
        <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12">
          Restaurantes Disponibles
        </h2>
        
        <div className="max-w-md mx-auto mb-12">
          <label htmlFor="restaurant-select" className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Explora las opciones de tu ciudad
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="restaurant-select"
              className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary shadow-sm text-gray-700 appearance-none bg-white"
              defaultValue=""
            >
              <option value="" disabled>Selecciona un restaurante (Ejemplos)</option>
              <option value="1">Burger Queen - Hamburguesas (★ 4.8)</option>
              <option value="2">Pizza Hub - Italiana (★ 4.6)</option>
              <option value="3">Taco Fiesta - Mexicana (★ 4.7)</option>
              <option value="4">Sushi Zen - Japonesa (★ 4.9)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Burger Queen</h3>
                <p className="text-sm text-gray-500">Hamburguesas • Fast Food</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">Las mejores hamburguesas a la parrilla de la ciudad, con ingredientes 100% frescos.</p>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-yellow-500 font-medium"><Star className="h-4 w-4 mr-1" /> 4.8</span>
              <span className="text-gray-500">15-25 min</span>
            </div>
          </div>

          <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Pizza Hub</h3>
                <p className="text-sm text-gray-500">Pizza • Italiana</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">Pizzas artesanales al horno de leña, pastas frescas y postres italianos clásicos.</p>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-yellow-500 font-medium"><Star className="h-4 w-4 mr-1" /> 4.6</span>
              <span className="text-gray-500">20-35 min</span>
            </div>
          </div>

          <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Store className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Taco Fiesta</h3>
                <p className="text-sm text-gray-500">Tacos • Mexicana</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4 text-sm">Auténtico sabor mexicano. Tacos al pastor, burritos, quesadillas y salsas caseras.</p>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center text-yellow-500 font-medium"><Star className="h-4 w-4 mr-1" /> 4.7</span>
              <span className="text-gray-500">10-20 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-secondary-900 mb-4">
          ¿Por qué elegir QuickBite?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Ofrecemos todas las herramientas necesarias para que tu restaurante funcione de manera eficiente, rápida y sin complicaciones.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pedidos en Tiempo Real</h3>
            <p className="text-gray-600">
              Sistema de gestión de pedidos actualizado instantáneamente para 
              una coordinación perfecta entre cocina y delivery.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestión de Inventario</h3>
            <p className="text-gray-600">
              Control automático de stock con alertas en tiempo real para 
              nunca quedarte sin ingredientes importantes.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Kitchen Display System</h3>
            <p className="text-gray-600">
              Pantallas intuitivas para cocina con gestión de tiempos y 
              estados de preparación optimizados.
            </p>
          </div>
          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Análisis y Reportes</h3>
            <p className="text-gray-600">
              Métricas detalladas sobre tus ventas, platos más populares y 
              rendimiento del personal para tomar mejores decisiones.
            </p>
          </div>
          {/* Feature 5 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-teal-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Experiencia Móvil</h3>
            <p className="text-gray-600">
              Tus clientes podrán pedir desde cualquier dispositivo con una 
              interfaz amigable, rápida y completamente adaptativa.
            </p>
          </div>
          {/* Feature 6 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seguridad Garantizada</h3>
            <p className="text-gray-600">
              Tus datos y los de tus clientes están protegidos con 
              encriptación de extremo a extremo y respaldos diarios.
            </p>
          </div>
        </div>
      </div>

      {/* Customer Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-secondary-900 mb-4">
          ¿Por qué pedir con QuickBite?
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Descubre la forma más fácil, rápida y deliciosa de pedir en tus restaurantes favoritos.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-pink-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Utensils className="h-8 w-8 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Variedad Increíble</h3>
            <p className="text-gray-600">
              Encuentra desde comida rápida hasta platos gourmet. Tenemos opciones para todos los antojos y presupuestos.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-yellow-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Rápido y Sencillo</h3>
            <p className="text-gray-600">
              Con unos pocos clics tu pedido estará en la cocina. Guardamos tus preferencias para que pedir de nuevo sea aún más rápido.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
            <div className="bg-amber-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Seguimiento en Vivo</h3>
            <p className="text-gray-600">
              Sigue el estado de tu orden en tiempo real, desde el momento en que se comienza a preparar hasta que esté lista para entregar.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Quieres ser parte de QuickBite?
          </h2>
          <p className="text-xl mb-10 text-gray-300 max-w-2xl mx-auto">
            Regístrate como cliente para pedir tu comida favorita, o únete como dueño y empieza a gestionar tu restaurante en nuestra plataforma.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/login"
              state={{ isRegistering: true, defaultRole: 'CLIENT' }}
              className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-600 transition-colors shadow-lg"
            >
              Registrarse como Cliente
            </Link>
            <Link
              to="/login"
              state={{ isRegistering: true, defaultRole: 'ADMIN' }}
              className="w-full sm:w-auto border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors shadow-lg"
            >
              Registrar mi Restaurante
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
