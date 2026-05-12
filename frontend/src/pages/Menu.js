import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/menu');
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data);
      } else {
        toast.error('Error al cargar el menú');
      }
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

  const proceedToCheckout = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Cliente QuickBite';
    const userEmail = localStorage.getItem('userEmail') || 'cliente@quickbite.com';

    if (!userId) {
      toast.error('Debes iniciar sesion para hacer un pedido');
      navigate('/login');
      return;
    }

    // Confirmacion de primer pedido
    const existingOrders = JSON.parse(localStorage.getItem('mockClientOrders') || '[]');
    if (existingOrders.length === 0) {
      const confirmFirstOrder = window.confirm(
        '¡Es tu primer pedido!\n\nConfirmaremos que enviaremos tu comida a tu dirección principal guardada (Av. Providencia 1234, Depto 502, Santiago). ¿Deseas continuar?'
      );
      if (!confirmFirstOrder) return;
    }

    // Payload para POST /api/orders -> reescrito a /api/v1/pedidos
    const payload = {
      clienteId: Number(userId),
      nombreCliente: userName,
      emailCliente: userEmail,
      telefonoCliente: '+56900000000',
      direccionEntrega: 'Av. Providencia 1234, Depto 502, Santiago',
      metodoPago: 'EFECTIVO',
      costoEnvio: 0,
      notasCliente: '',
      items: cart.map(it => ({
        productoId: it.id,
        nombreProducto: it.name,
        descripcionProducto: it.description || '',
        cantidad: it.quantity,
        precioUnitario: Number(it.price)
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Error creando pedido:', errText);
        toast.error('No se pudo registrar el pedido en el servidor');
        return;
      }

      setCart([]);
      toast.success('¡Pedido procesado con éxito!');
      navigate('/orders');
    } catch (err) {
      console.error(err);
      toast.error('Error de conexion al crear el pedido');
    }
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
