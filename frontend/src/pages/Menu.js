import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, ShoppingCart, Clock, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomizationItem, setSelectedCustomizationItem] = useState(null);
  const [customizationNote, setCustomizationNote] = useState('');
  const [menuIngredients, setMenuIngredients] = useState({});
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
        // Cargar ingredientes para cada menú
        await loadMenuIngredients(data);
      } else {
        toast.error('Error al cargar el menú');
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar el menú');
      setLoading(false);
    }
  };

  const loadMenuIngredients = async (menuItems) => {
    const ingredientsMap = {};
    for (const item of menuItems) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/menu-ingredients/${item.id}`);
        if (response.ok) {
          const data = await response.json();
          ingredientsMap[item.id] = data;
        }
      } catch (error) {
        console.error(`Error loading ingredients for menu item ${item.id}:`, error);
      }
    }
    setMenuIngredients(ingredientsMap);
  };

  const openCustomization = (item) => {
    setSelectedCustomizationItem(item);
    setCustomizationNote('');
  };

  const confirmAddToCart = () => {
    const item = selectedCustomizationItem;
    // Generate a unique ID for customized items so they stack separately if notes differ
    const cartItemId = customizationNote ? `${item.id}-${Date.now()}` : item.id;
    
    const existingItem = cart.find(cartItem => cartItem.id === cartItemId);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === cartItemId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, cartItemId: cartItemId, quantity: 1, notesItem: customizationNote }]);
    }
    toast.success(`${item.name} agregado al carrito`);
    setSelectedCustomizationItem(null);
    setCustomizationNote('');
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

    // Validar stock de ingredientes antes de crear el pedido
    try {
      for (const item of cart) {
        const response = await fetch(`http://localhost:8080/api/menu/${item.id}/validate-stock?quantity=${item.quantity}`);
        if (response.ok) {
          const data = await response.json();
          if (!data.hasSufficientStock) {
            toast.error(`No hay suficiente stock para: ${item.name}`);
            return;
          }
        }
      }
    } catch (error) {
      console.error('Error validando stock:', error);
      toast.error('Error al validar el stock de los ingredientes');
      return;
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
        precioUnitario: Number(it.price),
        notasItem: it.notesItem || ''
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/pedidos', {
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

      const orderData = await response.json();
      setCart([]);
      toast.info('Redirigiendo a pasarela de pago...');
      
      // Navigate to Payment view with order ID and amount
      navigate('/payment', { 
        state: { 
          orderId: orderData.numeroPedido,
          backendId: orderData.id,
          amount: orderData.total 
        } 
      });
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
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        {menuIngredients[item.id] && menuIngredients[item.id].length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Ingredientes:</p>
                            <div className="flex flex-wrap gap-1">
                              {menuIngredients[item.id].map((mi) => (
                                <span key={mi.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                  {mi.ingredientName}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {item.preparationTime} min
                          </div>
                          <button
                            onClick={() => openCustomization(item)}
                            disabled={!item.available}
                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                              item.available
                                ? 'bg-primary text-white hover:bg-primary-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {item.available ? 'Agregar' : 'Agotado'}
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
                    <div key={item.cartItemId || item.id} className="flex items-center justify-between py-2 border-b">
                      <div className="flex-1">
                        <h4 className="font-medium text-secondary-900">{item.name}</h4>
                        {item.notesItem && (
                          <p className="text-xs text-gray-500 italic">Nota: {item.notesItem}</p>
                        )}
                        <p className="text-sm text-gray-600">
                          ${item.price.toLocaleString('es-CL')} c/u
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, -1)}
                          className="p-1 rounded-md hover:bg-gray-100"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId || item.id, 1)}
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

      {/* Modal de Personalización */}
      {selectedCustomizationItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                Personalizar {selectedCustomizationItem.name}
              </h3>
              <button
                onClick={() => setSelectedCustomizationItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mostrar ingredientes del menú */}
            {menuIngredients[selectedCustomizationItem.id] && menuIngredients[selectedCustomizationItem.id].length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredientes
                </label>
                <div className="space-y-2">
                  {menuIngredients[selectedCustomizationItem.id].map((mi) => (
                    <div key={mi.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`ingredient-${mi.id}`}
                          checked={!mi.isOptional || (mi.isOptional && !customizationNote?.toLowerCase().includes(`sin ${mi.ingredientName?.toLowerCase()}`))}
                          onChange={(e) => {
                            if (!e.target.checked) {
                              setCustomizationNote(prev => {
                                    const current = prev || '';
                                    if (!current.toLowerCase().includes(`sin ${mi.ingredientName?.toLowerCase()}`)) {
                                      return current ? `${current}, Sin ${mi.ingredientName}` : `Sin ${mi.ingredientName}`;
                                    }
                                    return current;
                                  });
                            } else {
                              setCustomizationNote(prev => {
                                    const current = prev || '';
                                    return current.replace(new RegExp(`,?\\s*Sin ${mi.ingredientName}`, 'gi'), '').trim();
                                  });
                            }
                          }}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <label htmlFor={`ingredient-${mi.id}`} className="ml-2 text-sm text-gray-700">
                          {mi.ingredientName}
                          {mi.isOptional && <span className="text-xs text-gray-500 ml-1">(Opcional)</span>}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales (Ej: Extra salsa, bien cocido)
              </label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                rows="3"
                placeholder="Escribe tus preferencias adicionales aquí..."
                value={customizationNote}
                onChange={(e) => setCustomizationNote(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedCustomizationItem(null)}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAddToCart}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
