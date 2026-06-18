import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from './Navbar';

// Mock del CartContext
jest.mock('../context/CartContext', () => ({
  useCart: () => ({
    toggleCart: jest.fn(),
    cart: { items: [] },
    clearCart: jest.fn(),
  }),
}));

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de QuickBiteLogo
jest.mock('./QuickBiteLogo', () => () => <div data-testid="logo">QuickBite</div>);

// Mock de NotificationBadge
jest.mock('./NotificationBadge', () => () => <div data-testid="notification-badge" />);

// Mock de lucide-react icons
jest.mock('lucide-react', () => ({
  ShoppingCart: () => <div data-testid="cart-icon" />,
  ChefHat: () => <div data-testid="chef-icon" />,
  Users: () => <div data-testid="users-icon" />,
  LogOut: () => <div data-testid="logout-icon" />,
  ChevronDown: () => <div data-testid="chevron-icon" />,
  User: () => <div data-testid="user-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
  Search: () => <div data-testid="search-icon" />,
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  test('renders Navbar component on non-admin/kitchen routes', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const navbar = screen.getByRole('navigation');
    expect(navbar).toBeInTheDocument();
  });

  test('does not render on admin route', () => {
    window.history.pushState({}, '', '/admin');
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const navbar = screen.queryByRole('navigation');
    expect(navbar).not.toBeInTheDocument();
  });

  test('does not render on kitchen route', () => {
    window.history.pushState({}, '', '/kitchen');
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const navbar = screen.queryByRole('navigation');
    expect(navbar).not.toBeInTheDocument();
  });

  test('renders logo', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
  });

  test('renders cart icon', () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const cartIcon = screen.getByTestId('cart-icon');
    expect(cartIcon).toBeInTheDocument();
  });

  test('handles logout correctly', () => {
    // Simular usuario autenticado
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userRole', 'CLIENT');
    
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    
    const logoutIcon = screen.getByTestId('logout-icon');
    fireEvent.click(logoutIcon);
    
    // Verificar que se limpiaron los items de localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
  });
});
