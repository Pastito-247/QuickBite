import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CartSidebar from './CartSidebar';

// Mock del CartContext
const mockCart = [
  {
    id: 1,
    name: 'Hamburguesa',
    price: 12.99,
    quantity: 2,
    restaurant: { id: 1, name: 'Restaurante A', deliveryFee: 5.00 }
  },
  {
    id: 2,
    name: 'Papas fritas',
    price: 4.99,
    quantity: 1,
    restaurant: { id: 1, name: 'Restaurante A', deliveryFee: 5.00 }
  }
];

jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    cart: mockCart,
    isCartOpen: true,
    toggleCart: jest.fn(),
    updateQuantity: jest.fn(),
    removeFromCart: jest.fn(),
    clearCartForRestaurant: jest.fn(),
  }),
}));

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de lucide-react icons
jest.mock('lucide-react', () => ({
  X: () => <div data-testid="close-icon" />,
  ShoppingCart: () => <div data-testid="cart-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Minus: () => <div data-testid="minus-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
  ChevronDown: () => <div data-testid="chevron-down" />,
  ChevronUp: () => <div data-testid="chevron-up" />,
}));

describe('CartSidebar Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  test('renders CartSidebar when isCartOpen is true', () => {
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    const cartSidebar = screen.getByTestId('cart-sidebar');
    expect(cartSidebar).toBeInTheDocument();
  });

  test('does not render CartSidebar when isCartOpen is false', () => {
    // Mock isCartOpen como false
    jest.mock('../context/CartContext', () => ({
      useCart: () => ({
        cart: mockCart,
        isCartOpen: false,
        toggleCart: jest.fn(),
        updateQuantity: jest.fn(),
        removeFromCart: jest.fn(),
        clearCartForRestaurant: jest.fn(),
      }),
    }));
    
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    const cartSidebar = screen.queryByTestId('cart-sidebar');
    expect(cartSidebar).not.toBeInTheDocument();
  });

  test('renders cart items grouped by restaurant', () => {
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    const restaurantName = screen.getByText('Restaurante A');
    expect(restaurantName).toBeInTheDocument();
  });

  test('renders item names', () => {
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    const hamburger = screen.getByText('Hamburguesa');
    const papas = screen.getByText('Papas fritas');
    expect(hamburger).toBeInTheDocument();
    expect(papas).toBeInTheDocument();
  });

  test('renders close icon', () => {
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    const closeIcon = screen.getByTestId('close-icon');
    expect(closeIcon).toBeInTheDocument();
  });

  test('calculates subtotal correctly', () => {
    render(
      <BrowserRouter>
        <CartSidebar />
      </BrowserRouter>
    );
    
    // Hamburguesa: 12.99 * 2 = 25.98
    // Papas fritas: 4.99 * 1 = 4.99
    // Subtotal: 30.97
    const subtotal = screen.getByText(/30\.97/);
    expect(subtotal).toBeInTheDocument();
  });
});
