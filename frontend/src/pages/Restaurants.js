import React, { useState, useEffect } from 'react';
import { Search, Star, MapPin, Clock, Filter, Store, Truck, ArrowRight, Edit2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apiURL from '../utils/api';
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

const categories = ['Todos', 'Hamburguesas', 'Pizzas', 'Mexicana', 'Sushi', 'Saludable', 'Carnes', 'Asiática', 'Postres'];

const Restaurants = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  
  // Ubicación de despacho desde localStorage
  const [address, setAddress] = useState(localStorage.getItem('deliveryAddress') || '');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState(address);

  // Restaurantes reales creados desde el panel de administración (backend)
  const [apiRestaurants, setApiRestaurants] = useState([]);
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-sky-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-violet-500 to-purple-600',
    'from-amber-500 to-orange-600',
  ];

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const response = await fetch(apiURL('/api/restaurants/active'));
        if (!response.ok) return;
        const data = await response.json();
        const mapped = data.map((r, i) => ({
          id: r.id,
          name: r.name,
          type: 'Restaurante',
          rating: 5.0,
          time: '20-30 min',
          deliveryFee: 'Gratis',
          gradient: gradients[i % gradients.length],
          logo: r.imageUrl || null,
          banner: r.imageUrl || null,
          isReal: true,
        }));
        setApiRestaurants(mapped);
      } catch (error) {
        console.error('Error cargando restaurantes:', error);
      }
    };
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allRestaurants = [...apiRestaurants, ...mockRestaurants];

  // Sincronizar filtros si cambian los parámetros de búsqueda en la URL
  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    setSearchTerm(params.get('search') || '');
    setSelectedCategory(params.get('category') || 'Todos');
  }, [routerLocation.search]);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (tempAddress.trim()) {
      localStorage.setItem('deliveryAddress', tempAddress);
      setAddress(tempAddress);
      setIsEditingAddress(false);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(routerLocation.search);
    params.delete('search');
    if (cat === 'Todos') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    navigate(`/restaurants?${params.toString()}`);
  };

  const handleBrandSelect = (brandName) => {
    const params = new URLSearchParams();
    params.set('search', brandName);
    params.delete('category');
    navigate(`/restaurants?${params.toString()}`);
  };

  const handleSearchChange = (val) => {
    setSearchTerm(val);
    const params = new URLSearchParams(routerLocation.search);
    if (val) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    navigate(`/restaurants?${params.toString()}`, { replace: true });
  };

  const filteredRestaurants = allRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          restaurant.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Todos' || 
                            restaurant.type.toLowerCase() === selectedCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-appbg py-8 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Widget de Dirección / Delivery - Muy similar a PedidosYa */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 p-2.5 rounded-full border border-orange-100">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Entregando en:</span>
              {isEditingAddress ? (
                <form onSubmit={handleSaveAddress} className="flex items-center space-x-2 mt-1">
                  <div className="relative flex items-center bg-white border border-gray-300 rounded-lg px-2 py-1 focus-within:ring-1 focus-within:ring-primary">
                    <select
                      className="focus:outline-none text-sm font-bold text-gray-700 bg-transparent pr-6 appearance-none cursor-pointer"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      required
                    >
                      <option value="" disabled className="text-gray-400">Selecciona comuna...</option>
                      {chileanCommunes.map(commune => (
                        <option key={commune} value={commune} className="text-gray-800 font-medium">{commune}</option>
                      ))}
                    </select>
                    <div className="absolute right-2 pointer-events-none text-gray-400">
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                      </svg>
                    </div>
                  </div>
                  <button type="submit" className="bg-primary hover:bg-primary-600 text-white text-xs px-3 py-2 rounded-lg font-bold flex-shrink-0">
                    Guardar
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {setTempAddress(address); setIsEditingAddress(false);}} 
                    className="text-gray-400 hover:text-gray-600 text-xs px-2 flex-shrink-0"
                  >
                    Cancelar
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-secondary-900">
                    {address || 'Sin dirección ingresada'}
                  </span>
                  <button 
                    onClick={() => setIsEditingAddress(true)} 
                    className="p-1 text-primary hover:bg-orange-50 rounded-full transition-colors"
                    title="Editar Dirección"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 font-medium md:text-right">
            Se muestran locales con cobertura y despacho directo a tu ubicación.
          </div>
        </div>

        {/* Sección de Titulo y Buscador de Locales alineado perfectamente */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-gray-100 pb-6">
          <div>
            <h1 className="text-3xl font-black text-secondary-900 tracking-tight">
              Descubre restaurantes
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Filtra y selecciona los mejores platos rápidos a tu alrededor.
            </p>
          </div>
          
          {/* Barra de Búsqueda Integrada - Centrada a la derecha del título */}
          <div className="relative w-full md:max-w-xs lg:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="pl-10 w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white shadow-sm font-semibold text-sm text-gray-700 transition-all hover:border-gray-300"
              placeholder="Buscar por plato o restaurante..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Carrusel de Marcas Destacadas (Mockup de PedidosYa) */}
        <div className="mb-8 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-4">Marcas destacadas en tu zona</h2>
          <div className="flex items-center space-x-6 overflow-x-auto pb-2 scrollbar-hide">
            {allRestaurants.map((brand) => (
              <button
                key={`${brand.isReal ? 'r' : 'm'}-${brand.id}`}
                onClick={() => handleBrandSelect(brand.name)}
                className="flex flex-col items-center space-y-2 flex-shrink-0 group focus:outline-none"
              >
                <div className={`h-16 w-16 rounded-full bg-gradient-to-br ${brand.gradient} flex items-center justify-center shadow-sm border-2 border-white group-hover:scale-110 group-hover:shadow-lg transition-all overflow-hidden`}>
                  {brand.banner ? (
                    <img src={brand.banner} alt={brand.name} className="h-full w-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  ) : null}
                  <span className="text-white text-base font-black" style={{display: brand.banner ? 'none' : 'flex'}}>{brand.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <span className="text-xs font-bold text-gray-700 group-hover:text-primary transition-colors">{brand.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Carrusel de Píldoras de Categoría - Premium scrollable horizontal */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-gray-100">
          <Filter className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 border ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-white border-primary shadow-md shadow-orange-100'
                  : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Restaurantes */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div 
                key={`${restaurant.isReal ? 'r' : 'm'}-${restaurant.id}`} 
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full relative"
              >
                
                {/* Banner de Tarjeta — imagen rectangular de portada */}
                <div className={`bg-gradient-to-br ${restaurant.gradient} h-36 relative w-full overflow-hidden`}>
                  {restaurant.banner ? (
                    <img
                      src={restaurant.banner}
                      alt={`Banner ${restaurant.name}`}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-white text-3xl font-black opacity-20 select-none">{restaurant.name}</span>
                  )}

                  {/* Overlay sutil para legibilidad del badge */}
                  <div className="absolute inset-0 bg-black/10" />

                  {/* Calificación Flotante */}
                  <div className="absolute top-3 right-3 bg-white px-2.5 py-1 rounded-full text-xs font-black shadow-sm flex items-center text-gray-800 z-10">
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-current" />
                    {restaurant.rating}
                  </div>
                </div>
                
                {/* Contenido de la tarjeta */}
                <div className="pt-4 px-5 pb-5 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-orange-50 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider mb-2">
                      {restaurant.type}
                    </span>
                    <h3 className="font-extrabold text-lg text-secondary-900 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold mb-4 mt-1">Platos rápidos y aderezos especiales preparados al instante.</p>
                  </div>
                  
                  {/* Footer con información de delivery */}
                  <div className="border-t border-gray-50 pt-4 mt-auto">
                    <div className="flex justify-between items-center text-xs text-gray-600 font-bold mb-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{restaurant.time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Truck className={`h-4 w-4 ${restaurant.deliveryFee === 'Gratis' ? 'text-accent' : 'text-gray-400'}`} />
                        <span>Envío: <span className={restaurant.deliveryFee === 'Gratis' ? 'text-accent font-black' : 'text-gray-900 font-black'}>{restaurant.deliveryFee}</span></span>
                      </div>
                    </div>
                    
                    <Link 
                      to={`/restaurant/${restaurant.id}/menu`}
                      className="w-full text-center bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-transparent text-primary hover:scale-[1.01] transition-all py-2.5 rounded-xl font-black text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Ver Menú</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-lg mx-auto">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron restaurantes</h3>
            <p className="text-sm text-gray-500">Intenta buscar con otros términos o cambiar la categoría.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}}
              className="mt-6 px-6 py-2.5 bg-primary hover:bg-primary-600 text-white rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              Ver todos los locales
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Restaurants;

