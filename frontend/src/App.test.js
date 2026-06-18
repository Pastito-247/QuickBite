import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock del CartContext
jest.mock('./context/CartContext', () => ({
  CartProvider: ({ children }) => <div>{children}</div>,
}));

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  ToastContainer: () => <div data-testid="toast-container" />,
}));

describe('App Component', () => {
  test('renders Navbar component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Verifica que el componente Navbar se renderiza
    const navbarElement = screen.getByRole('navigation');
    expect(navbarElement).toBeInTheDocument();
  });

  test('renders CartSidebar component', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Verifica que el componente CartSidebar se renderiza
    const cartSidebarElement = screen.getByTestId('cart-sidebar');
    expect(cartSidebarElement).toBeInTheDocument();
  });

  test('renders ToastContainer', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Verifica que el ToastContainer se renderiza
    const toastContainer = screen.getByTestId('toast-container');
    expect(toastContainer).toBeInTheDocument();
  });

  test('clears localStorage on first render', () => {
    // Mock localStorage
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    // Limpiar sessionStorage para simular primera carga
    sessionStorage.clear();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Verifica que se limpiaron los items de localStorage
    expect(removeItemSpy).toHaveBeenCalledWith('token');
    expect(removeItemSpy).toHaveBeenCalledWith('userRole');
    expect(removeItemSpy).toHaveBeenCalledWith('userId');
    expect(setItemSpy).toHaveBeenCalledWith('quickbite_initialized', 'true');
    
    // Limpiar mocks
    removeItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  test('does not clear localStorage on subsequent renders', () => {
    // Mock localStorage
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    
    // Simular que ya se inicializó
    sessionStorage.setItem('quickbite_initialized', 'true');
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Verifica que NO se limpiaron los items de localStorage
    expect(removeItemSpy).not.toHaveBeenCalled();
    
    // Limpiar mocks
    removeItemSpy.mockRestore();
    });
});
