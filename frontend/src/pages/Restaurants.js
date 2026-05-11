import React, { useState } from 'react';
import { Search, Star, MapPin, Clock, Filter, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockRestaurants = [
  { id: 1, name: 'Burger Queen', type: 'Hamburguesas', rating: 4.8, time: '15-25 min', deliveryFee: '$1.50', image: 'bg-orange-100', iconColor: 'text-orange-600' },
  { id: 2, name: 'Pizza Hub', type: 'Pizzas', rating: 4.6, time: '20-35 min', deliveryFee: 'Gratis', image: 'bg-red-100', iconColor: 'text-red-600' },
  { id: 3, name: 'Taco Fiesta', type: 'Mexicana', rating: 4.7, time: '10-20 min', deliveryFee: '$1.00', image: 'bg-green-100', iconColor: 'text-green-600' },
  { id: 4, name: 'Sushi Zen', type: 'Sushi', rating: 4.9, time: '30-45 min', deliveryFee: '$2.50', image: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { id: 5, name: 'Green Bowl', type: 'Saludable', rating: 4.5, time: '15-20 min', deliveryFee: '$1.00', image: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  { id: 6, name: 'El Asador', type: 'Carnes', rating: 4.8, time: '35-50 min', deliveryFee: '$3.00', image: 'bg-amber-100', iconColor: 'text-amber-600' },
  { id: 7, name: 'Wok Express', type: 'Asiática', rating: 4.4, time: '20-30 min', deliveryFee: 'Gratis', image: 'bg-pink-100', iconColor: 'text-pink-600' },
  { id: 8, name: 'La Crêperie', type: 'Postres', rating: 4.7, time: '15-25 min', deliveryFee: '$1.20', image: 'bg-yellow-100', iconColor: 'text-yellow-600' },
];

const categories = ['Todos', 'Hamburguesas', 'Pizzas', 'Mexicana', 'Sushi', 'Saludable', 'Carnes', 'Asiática', 'Postres'];

const Restaurants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || restaurant.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Descubre los mejores restaurantes
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestra selección de locales y encuentra tu comida favorita a solo un clic de distancia.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search Bar */}
            <div className="relative flex-grow w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary shadow-sm"
                placeholder="Buscar restaurantes por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter Desktop */}
            <div className="hidden md:flex items-center space-x-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Filter className="h-5 w-5 text-gray-400 mr-2" />
              <select 
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary shadow-sm bg-white"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Category Filter Mobile (Pills) */}
            <div className="md:hidden flex overflow-x-auto space-x-2 w-full pb-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRestaurants.map(restaurant => (
              <div key={restaurant.id} className="bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                <div className={`${restaurant.image} h-32 flex items-center justify-center relative`}>
                   <Store className={`h-12 w-12 ${restaurant.iconColor}`} />
                   <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center">
                     <Star className="h-3 w-3 text-yellow-500 mr-1 fill-current" />
                     {restaurant.rating}
                   </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{restaurant.type}</p>
                  
                  <div className="flex flex-col space-y-2 text-sm text-gray-600 border-t pt-4 mt-auto">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{restaurant.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Envío: <span className="font-medium text-gray-900">{restaurant.deliveryFee}</span></span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/menu?category=${restaurant.type.toLowerCase()}`}
                    className="mt-4 block w-full text-center bg-gray-50 hover:bg-primary hover:text-white border border-gray-200 hover:border-transparent transition-colors py-2 rounded-lg font-medium text-primary text-sm"
                  >
                    Ver Menú
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron restaurantes</h3>
            <p className="text-gray-500">Intenta buscar con otros términos o cambiar la categoría.</p>
            <button 
              onClick={() => {setSearchTerm(''); setSelectedCategory('Todos');}}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              Ver todos
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Restaurants;
