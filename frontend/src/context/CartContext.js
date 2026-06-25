import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('quickbite_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('quickbite_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item, customizationNote, restaurantInfo) => {
    const cartId = customizationNote ? `${item.id}-${Date.now()}` : `${item.id}-default`;
    const existingItem = cart.find(cartItem => cartItem.cartItemId === cartId);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.cartItemId === cartId
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { 
        ...item, 
        cartItemId: cartId, 
        quantity: 1, 
        notesItem: customizationNote,
        restaurant: restaurantInfo // { id, name, deliveryFee }
      }]);
    }
  };

  const updateQuantity = (cartItemId, change) => {
    setCart(cart.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCartForRestaurant = (restaurantId) => {
    setCart(cart.filter(item => String(item.restaurant?.id) !== String(restaurantId)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCartForRestaurant,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      toggleCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
