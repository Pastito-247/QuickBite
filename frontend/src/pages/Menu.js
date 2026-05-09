import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, ShoppingCart, Clock, DollarSign } from 'lucide-react';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      // Simulación de datos - reemplazar con llamada a API real
      const mockData = [
        {
          id: 1,
          name: "Hamburguesa Clásica",
          description: "Carne premium con lechuga, tomate, cebolla y nuestra salsa especial",
          price: 8990,
          category: "Hamburguesas",
          available: true,
          preparationTime: 15,
          image: "/api/placeholder/300/200"
        },
        {
          id: 2,
          name: "Papas Fritas Grandes",
          description: "Papas crujientes con sal marina",
          price: 3990,
          category: "Acompañamientos",
          available: true,
          preparationTime: 8,
          image: "/api/placeholder/300/200"
        },
        {
          id: 3,
          name: "Combo Big Bite",
          description: "Hamburguesa doble + papas + bebida",
          price: 12990,
          category: "Combos",
          available: true,
          preparationTime: 20,
          image: "/api/placeholder/300/200"
        },
        {
          id: 4,
          name: "Ensalada César",
          description: "Lechuga fresca, pollo grill, parmesano y aderezo césar",
          price: 6990,
          category: "Ensaladas",
          available: false,
          preparationTime: 10,
          image: "/api/placeholder/300/200"
        }
      ];
      setMenuItems(mockData);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar el menú');
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} agregado al carrito`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    // Aquí iría la lógica para procesar el pedido
    toast.success('Procesando pedido...');
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-900">Nuestro Menú</h1>
        <div className="relative">
          <ShoppingCart className="h-6 w-6 text-gray-600" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Imagen</span>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-secondary-900">{item.name}</h3>
                          <span className="text-xl font-bold text-primary">
                            ${item.price.toLocaleString('es-CL')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {item.preparationTime} min
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            disabled={!item.available}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                              item.available
                                ? 'bg-primary text-white hover:bg-primary-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {item.available ? 'Agregar' : 'No disponible'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold text-secondary-900 mb-4">Carrito</h2>
            
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">
                          ${item.price.toLocaleString('es-CL')} c/u
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-primary">
                      ${getTotalPrice().toLocaleString('es-CL')}
                    </span>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className="w-full bg-primary text-white py-3 rounded-md font-semibold hover:bg-primary-600 transition-colors flex items-center justify-center"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Proceder al Pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
