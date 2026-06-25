import React, { useState } from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiURL from '../utils/api';

const CartSidebar = () => {
  const { cart, isCartOpen, toggleCart, updateQuantity, removeFromCart, clearCartForRestaurant } = useCart();
  const navigate = useNavigate();
  const [collapsedRestaurants, setCollapsedRestaurants] = useState({});

  const toggleRestaurantCollapse = (rId) => {
    setCollapsedRestaurants(prev => ({
      ...prev,
      [rId]: !prev[rId]
    }));
  };

  if (!isCartOpen) return null;

  // Group items by restaurant
  const itemsByRestaurant = cart.reduce((acc, item) => {
    const rId = item.restaurant?.id || 'unknown';
    if (!acc[rId]) {
      acc[rId] = {
        restaurant: item.restaurant || { id: 'unknown', name: 'Restaurante Desconocido', deliveryFee: 0 },
        items: [],
        subtotal: 0
      };
    }
    acc[rId].items.push(item);
    acc[rId].subtotal += item.price * item.quantity;
    return acc;
  }, {});

  const getDeliveryFeeValue = (feeString) => {
    if (!feeString || feeString === 'Gratis') return 0;
    const match = String(feeString).match(/[\d.]+/);
    if (match) {
      const val = parseFloat(match[0]);
      return val < 10 ? val * 1000 : val;
    }
    return 0;
  };

  const handleCheckout = async (restaurantId, restaurantGroup) => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName') || 'Cliente QuickBite';
    const userEmail = localStorage.getItem('userEmail') || 'cliente@quickbite.com';

    if (!userId) {
      toast.error('Debes iniciar sesión para hacer un pedido');
      navigate('/login');
      toggleCart();
      return;
    }

    try {
      // Validate stock for this restaurant's items
      for (const item of restaurantGroup.items) {
        if (item.id < 100) {
          const response = await fetch(apiURL(`/api/menu/${item.id}/validate-stock?quantity=${item.quantity}`));
          if (response.ok) {
            const data = await response.json();
            if (!data.hasSufficientStock) {
              toast.error(`No hay suficiente stock para: ${item.name}`);
              return;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error validando stock:', error);
    }

    const payload = {
      clienteId: Number(userId),
      nombreCliente: userName,
      emailCliente: userEmail,
      telefonoCliente: '+56900000000',
      direccionEntrega: localStorage.getItem('deliveryAddress') || 'Av. Providencia 1234, Depto 502, Santiago',
      metodoPago: 'EFECTIVO',
      costoEnvio: getDeliveryFeeValue(restaurantGroup.restaurant.deliveryFee),
      notasCliente: '',
      restaurantId: Number(restaurantId),
      items: restaurantGroup.items.map(item => ({
        productoId: item.id,
        nombreProducto: item.name,
        descripcionProducto: item.description || '',
        cantidad: item.quantity,
        precioUnitario: Number(item.price),
        notasItem: item.notesItem || ''
      }))
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiURL('/api/v1/pedidos'), {
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
      clearCartForRestaurant(restaurantId);
      
      if (cart.length === restaurantGroup.items.length) {
        toggleCart(); // Close if it was the last restaurant
      }

      toast.info('Redirigiendo a pasarela de pago...');
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

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity" 
        onClick={toggleCart}
      />
      
      <div data-testid="cart-sidebar" className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center text-gray-800">
            <ShoppingCart className="h-5 w-5 mr-2 text-primary" />
            <h2 className="font-bold text-lg">Tu Carrito</h2>
          </div>
          <button 
            onClick={toggleCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart className="h-16 w-16 mb-4 opacity-20" />
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm mt-1">¡Agrega algo delicioso!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(itemsByRestaurant).map(([rId, group]) => {
                const deliveryFee = getDeliveryFeeValue(group.restaurant.deliveryFee);
                const total = group.subtotal + deliveryFee;

                return (
                  <div key={rId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div 
                      className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleRestaurantCollapse(rId)}
                    >
                      <div className="flex items-center gap-2">
                        {collapsedRestaurants[rId] ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
                        <h3 className="font-bold text-gray-800">{group.restaurant.name}</h3>
                        {collapsedRestaurants[rId] && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full ml-1">
                            {group.items.length}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearCartForRestaurant(rId); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Vaciar
                      </button>
                    </div>
                    
                    {!collapsedRestaurants[rId] && (
                      <>
                        <div className="p-4 space-y-4">
                      {group.items.map((item) => (
                        <div key={item.cartItemId} className="flex gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                              <span className="text-sm font-bold text-primary ml-2">
                                ${(item.price * item.quantity).toLocaleString('es-CL')}
                              </span>
                            </div>
                            {item.notesItem && (
                              <p className="text-xs text-gray-500 mt-1 italic">"{item.notesItem}"</p>
                            )}
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center bg-gray-100 rounded-full border border-gray-200">
                                <button 
                                  onClick={() => updateQuantity(item.cartItemId, -1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-gray-800">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => updateQuantity(item.cartItemId, 1)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.cartItemId)}
                                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Subtotal</span>
                        <span>${group.subtotal.toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Envío</span>
                        <span>{deliveryFee === 0 ? 'Gratis' : `$${deliveryFee.toLocaleString('es-CL')}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200">
                        <span>Total a pagar</span>
                        <span className="text-primary text-lg">${total.toLocaleString('es-CL')}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleCheckout(rId, group)}
                        className="w-full mt-3 bg-primary hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-orange-200 flex justify-center items-center"
                      >
                        Pagar Orden ({group.items.length})
                      </button>
                    </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartSidebar;

