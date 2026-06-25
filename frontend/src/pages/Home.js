import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, Users, ChefHat, Star, MapPin, Store, TrendingUp, 
  Utensils, Zap, Truck, Search, Flame, 
  Fish, Leaf, Cake, ArrowRight 
} from 'lucide-react';
import apiURL from '../utils/api';

const mockRestaurants = [
  { id: 1, name: 'Burger Queen', type: 'Hamburguesas', rating: 4.8, time: '15-25 min', deliveryFee: '$1.50', gradient: 'from-orange-500 to-amber-500', logo: '/icon_burger_queen.png', banner: '/banner_burger_queen.png' },
  { id: 2, name: 'Pizza Hub', type: 'Pizzas', rating: 4.6, time: '20-35 min', deliveryFee: 'Gratis', gradient: 'from-red-500 to-rose-600', logo: '/icon_pizza_hub.png', banner: '/banner_pizza_hub.png' },
  { id: 3, name: 'Taco Fiesta', type: 'Mexicana', rating: 4.7, time: '10-20 min', deliveryFee: '$1.00', gradient: 'from-yellow-500 to-orange-600', logo: '/icon_taco_fiesta.png', banner: '/banner_taco_fiesta.png' },
  { id: 4, name: 'Sushi Zen', type: 'Sushi', rating: 4.9, time: '30-45 min', deliveryFee: '$2.50', gradient: 'from-indigo-500 to-cyan-500', logo: '/icon_sushi_zen.png', banner: '/banner_sushi_zen.png' },
  { id: 5, name: 'Green Bowl', type: 'Saludable', rating: 4.5, time: '15-20 min', deliveryFee: '$1.00', gradient: 'from-emerald-500 to-teal-600', logo: '/icon_green_bowl.png', banner: '/banner_green_bowl.png' },
  { id: 6, name: 'El Asador', type: 'Carnes', rating: 4.8, time: '35-50 min', deliveryFee: '$3.00', gradient: 'from-amber-600 to-yellow-800', logo: '/icon_el_asador.png', banner: '/banner_el_asador.png' },
  { id: 7, name: 'Wok Express', type: 'Asiática', rating: 4.4, time: '20-30 min', deliveryFee: 'Gratis', gradient: 'from-purple-500 to-indigo-600', logo: '/icon_wok_express.png', banner: '/banner_wok_express.png' },
  { id: 8, name: 'La Crêperie', type: 'Postres', rating: 4.7, time: '15-25 min', deliveryFee: '$1.20', gradient: 'from-pink-400 to-rose-500', logo: '/icon_la_creperie.png', banner: '/banner_la_creperie.png' },
];

const categoryList = [
  { name: 'Hamburguesas', icon: Utensils, color: 'bg-orange-50/50 text-primary border-orange-100/70 hover:border-primary/50' },
  { name: 'Pizzas', icon: Store, color: 'bg-red-50/50 text-red-600 border-red-100/70 hover:border-red-500/50' },
  { name: 'Mexicana', icon: Flame, color: 'bg-yellow-50/50 text-yellow-600 border-yellow-100/70 hover:border-yellow-500/50' },
  { name: 'Sushi', icon: Fish, color: 'bg-blue-50/50 text-blue-600 border-blue-100/70 hover:border-blue-500/50' },
  { name: 'Saludable', icon: Leaf, color: 'bg-green-50/50 text-green-600 border-green-100/70 hover:border-green-500/50' },
  { name: 'Carnes', icon: Flame, color: 'bg-amber-50/50 text-amber-700 border-amber-100/70 hover:border-amber-700/50' },
  { name: 'Asiática', icon: ChefHat, color: 'bg-indigo-50/50 text-indigo-600 border-indigo-100/70 hover:border-indigo-500/50' },
  { name: 'Postres', icon: Cake, color: 'bg-pink-50/50 text-pink-600 border-pink-100/70 hover:border-pink-500/50' },
];

const HOME_GRADIENTS = [
  'from-rose-500 to-pink-600',
  'from-sky-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-600',
];

// eslint-disable-next-line no-unused-vars
const chileanCommunes = [
  'Providencia, Región Metropolitana',
  'Santiago Centro, Región Metropolitana',
  'Las Condes, Región Metropolitana',
  'Ñuñoa, Región Metropolitana',
  'Vitacura, Región Metropolitana',
  'La Reina, Región Metropolitana',
  'Lo Barnechea, Región Metropolitana',
  'San Miguel, Región Metropolitana',
  'La Florida, Región Metropolitana',
  'Maipú, Región Metropolitana',
  'Macul, Región Metropolitana',
  'Estación Central, Región Metropolitana',
  'Viña del Mar, Región de Valparaíso',
  'Concepción, Región del Biobío'
];

const Home = () => {
  const navigate = useNavigate();
  
  const [addressInput, setAddressInput] = useState(localStorage.getItem('deliveryAddress') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [apiRestaurants, setApiRestaurants] = useState([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);
  
  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch(apiURL('/api/restaurants/active'));
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((restaurant, index) => ({
            id: restaurant.id,
            name: restaurant.name,
            type: restaurant.type || 'Restaurante',
            rating: restaurant.rating || 4.8,
            time: restaurant.time || '20-30 min',
            deliveryFee: restaurant.deliveryFee || 'Gratis',
            gradient: HOME_GRADIENTS[index % HOME_GRADIENTS.length],
            logo: restaurant.imageUrl || null,
            banner: restaurant.imageUrl || null,
          }));
          setApiRestaurants(mapped);
        }
      } catch (error) {
        console.error('Error cargando restaurantes reales:', error);
      } finally {
        setRestaurantsLoading(false);
      }
    };

    loadRestaurants();
  }, []);
  
  const stats = {
    activeOrders: 12,
    totalCustomers: 248,
    chefsOnline: 3,
    avgRating: 4.8
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (addressInput.trim()) {
      localStorage.setItem('deliveryAddress', addressInput);
      window.dispatchEvent(new Event('storage'));
    }
    
    if (searchQuery.trim()) {
      navigate(`/restaurants?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/restaurants');
    }
  };

  const handleCategoryClick = (catName) => {
    navigate(`/restaurants?category=${encodeURIComponent(catName)}`);
  };

  const handleBrandClick = (brandName) => {
    navigate(`/restaurants?search=${encodeURIComponent(brandName)}`);
  };

  // Filtrar listas curadas
  const displayRestaurants = apiRestaurants.length ? apiRestaurants : mockRestaurants;
  const popularRestaurants = displayRestaurants.filter(r => r.rating >= 4.7);
  const freeDeliveryRestaurants = displayRestaurants.filter(r => r.deliveryFee === 'Gratis');
  const fastRestaurants = displayRestaurants.filter(r => parseInt(r.time) <= 20);

  return (
    <div className="min-h-screen bg-appbg animate-fade-in pb-16">
      
      {/* Hero Section - Estilo PedidosYa pero con colores QuickBite */}
      <div className="bg-gradient-to-br from-secondary-900 via-secondary-800 to-primary-800 text-white relative overflow-hidden py-16 md:py-24 border-b border-primary-100">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF7A00_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block bg-primary text-white text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider mb-4 animate-pulse">
              ¡Tu comida favorita, al instante!
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              ¿Qué te provoca <span className="text-primary">pedir hoy</span>?
            </h1>
            <p className="text-lg md:text-xl mb-10 text-gray-300 font-medium">
              Explora los mejores locales con entrega rápida en tu zona.
            </p>
            
            {/* Formulario de búsqueda integrado */}
            <form 
              onSubmit={handleSearchSubmit} 
              className="bg-white p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2 text-gray-800 border border-gray-100 max-w-2xl mx-auto"
            >
              <div className="relative flex-grow flex items-center border-b md:border-b-0 md:border-r border-gray-100 px-3 py-2 md:py-0 w-full md:w-1/2">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mr-2" />
                <div className="relative w-full flex items-center">
                  <select
                    className="w-full focus:outline-none text-sm font-bold text-gray-700 bg-transparent pr-8 appearance-none cursor-pointer"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    required
                  >
                    <option value="" disabled className="text-gray-400">Selecciona tu comuna...</option>
                    {chileanCommunes.map(commune => (
                      <option key={commune} value={commune} className="text-gray-800 font-medium">{commune}</option>
                    ))}
                  </select>
                  <div className="absolute right-0 pointer-events-none text-gray-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="relative flex-grow flex items-center px-3 py-2 md:py-0">
                <Search className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                <input
                  type="text"
                  placeholder="Plato, restaurante, antojo..."
                  className="w-full focus:outline-none text-sm font-medium text-gray-700 bg-transparent placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-600 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 flex-shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Buscar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Grid de Categorías Visuales (Estilo Burbuja de PedidosYa) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-black text-secondary-900 mb-8 flex items-center">
          <Utensils className="h-6 w-6 text-primary mr-2" />
          ¿Qué quieres pedir hoy?
        </h2>
        <div className="flex flex-wrap justify-center sm:grid sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {categoryList.map((cat) => {
            const IconComp = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="flex flex-col items-center space-y-2.5 cursor-pointer group w-24 sm:w-auto flex-shrink-0"
              >
                <div className={`h-20 w-20 rounded-full border shadow-sm flex items-center justify-center transition-all duration-200 group-hover:shadow-md group-hover:scale-105 ${cat.color}`}>
                  <IconComp className="h-8 w-8" />
                </div>
                <span className="text-xs font-extrabold text-secondary-800 text-center tracking-tight group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carrusel de Cadenas Famosas (Shortcuts) */}
      <div className="bg-white py-12 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-black text-secondary-900 mb-8 flex items-center">
            <TrendingUp className="h-6 w-6 text-primary mr-2" />
            Tus marcas favoritas
          </h2>
          <div className="flex items-center space-x-6 overflow-x-auto pb-4 scrollbar-hide">
            {displayRestaurants.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.name)}
                className="flex flex-col items-center space-y-2 flex-shrink-0 group focus:outline-none"
              >
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 group-hover:shadow-lg transition-all overflow-hidden`}>
                  {brand.banner
                    ? <img src={brand.banner} alt={brand.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                    : <span className="text-white text-lg font-black">{brand.name.split(' ').map(n => n[0]).join('')}</span>
                  }
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Curated Feeds / Carruseles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Carrusel: Los más populares */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-secondary-900 flex items-center">
                <Star className="h-6 w-6 text-yellow-500 fill-current mr-2" />
                Los más populares
              </h2>
              <p className="text-sm text-gray-500">Locales con excelentes calificaciones</p>
            </div>
            <button onClick={() => navigate('/restaurants')} className="text-primary hover:text-primary-600 font-bold text-sm flex items-center">
              <span>Ver todos</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularRestaurants.slice(0, 4).map((r) => (
              <div 
                key={r.id} 
                onClick={() => navigate(`/restaurant/${r.id}/menu`)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full group"
              >
                <div className={`bg-gradient-to-r ${r.gradient} h-36 relative overflow-hidden`}>
                  {r.banner && (
                    <img src={r.banner} alt={r.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-full text-xs font-black shadow-sm flex items-center text-gray-800 z-10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-current" />
                    {r.rating}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-secondary-900 text-md group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mb-3">{r.type}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-3 font-bold mt-auto">
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1 text-gray-400" /> {r.time}</span>
                    <span className="text-primary bg-orange-50 px-2 py-0.5 rounded-full">Envío: {r.deliveryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrusel: Envío Gratis */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-secondary-900 flex items-center">
                <Truck className="h-6 w-6 text-accent mr-2" />
                Tu pedido con envío gratis
              </h2>
              <p className="text-sm text-gray-500">Ahorra en costos de despacho</p>
            </div>
            <button onClick={() => navigate('/restaurants')} className="text-primary hover:text-primary-600 font-bold text-sm flex items-center">
              <span>Ver todos</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeDeliveryRestaurants.slice(0, 4).map((r) => (
              <div 
                key={r.id} 
                onClick={() => navigate(`/restaurant/${r.id}/menu`)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full group"
              >
                <div className={`bg-gradient-to-r ${r.gradient} h-36 relative overflow-hidden`}>
                  {r.banner && (
                    <img src={r.banner} alt={r.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-full text-xs font-black shadow-sm flex items-center text-gray-800 z-10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-current" />
                    {r.rating}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-secondary-900 text-md group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mb-3">{r.type}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-3 font-bold mt-auto">
                    <span className="flex items-center"><Clock className="h-3.5 w-3.5 mr-1 text-gray-400" /> {r.time}</span>
                    <span className="text-accent bg-accent-50 px-2 py-0.5 rounded-full">Envío Gratis</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carrusel: Recibe Rápido */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-black text-secondary-900 flex items-center">
                <Zap className="h-6 w-6 text-yellow-500 mr-2 animate-bounce" />
                Recibe en menos de 20 min
              </h2>
              <p className="text-sm text-gray-500">¿Tienes prisa? Los locales más veloces</p>
            </div>
            <button onClick={() => navigate('/restaurants')} className="text-primary hover:text-primary-600 font-bold text-sm flex items-center">
              <span>Ver todos</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fastRestaurants.slice(0, 4).map((r) => (
              <div 
                key={r.id} 
                onClick={() => navigate(`/restaurant/${r.id}/menu`)}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col h-full group"
              >
                <div className={`bg-gradient-to-r ${r.gradient} h-36 relative overflow-hidden`}>
                  {r.banner && (
                    <img src={r.banner} alt={r.name} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute top-3 right-3 bg-white px-2 py-0.5 rounded-full text-xs font-black shadow-sm flex items-center text-gray-800 z-10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-current" />
                    {r.rating}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-secondary-900 text-md group-hover:text-primary transition-colors">
                      {r.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mb-3">{r.type}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-3 font-bold mt-auto">
                    <span className="flex items-center text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full"><Clock className="h-3.5 w-3.5 mr-1" /> {r.time}</span>
                    <span className="text-primary bg-orange-50 px-2 py-0.5 rounded-full">Envío: {r.deliveryFee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="text-2xl font-black text-secondary-900">{stats.activeOrders}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pedidos en Curso</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <Users className="h-10 w-10 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-secondary-900">{stats.totalCustomers}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Clientes Felices</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <ChefHat className="h-10 w-10 text-orange-600 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-secondary-900">{stats.chefsOnline}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cocineros Activos</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <Star className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-2xl font-black text-secondary-900">{stats.avgRating}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Calificación Media</p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-black text-center text-secondary-900 mb-3">
          ¿Por qué elegir QuickBite?
        </h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto font-medium">
          Ofrecemos todas las herramientas necesarias para que tu restaurante funcione de manera eficiente, rápida y sin complicaciones.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-orange-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900 mb-2">Pedidos en Tiempo Real</h3>
            <p className="text-sm text-gray-500">
              Sistema de gestión de pedidos actualizado instantáneamente para una coordinación perfecta entre cocina y delivery.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-green-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900 mb-2">Gestión de Inventario</h3>
            <p className="text-sm text-gray-500">
              Control automático de stock con alertas en tiempo real para nunca quedarte sin ingredientes importantes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="bg-orange-50 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900 mb-2">Kitchen Display System</h3>
            <p className="text-sm text-gray-500">
              Pantallas intuitivas para cocina con gestión de tiempos y estados de preparación optimizados.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary-900 text-white py-16 mt-8 rounded-3xl max-w-7xl mx-auto px-6 shadow-2xl relative overflow-hidden border border-secondary-800">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6">
            ¿Quieres ser parte de QuickBite?
          </h2>
          <p className="text-md md:text-lg mb-10 text-gray-300 max-w-2xl mx-auto font-medium">
            Regístrate como cliente para pedir tu comida favorita, o únete como dueño y empieza a gestionar tu restaurante en nuestra plataforma.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={() => navigate('/login', { state: { isRegistering: true, defaultRole: 'CLIENT' } })}
              className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
            >
              Registrarse como Cliente
            </button>
            <button
              onClick={() => navigate('/login', { state: { isRegistering: true, defaultRole: 'ADMIN' } })}
              className="w-full sm:w-auto border-2 border-white hover:bg-white hover:text-secondary-900 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg"
            >
              Registrar mi Restaurante
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;
