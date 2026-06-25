import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock de QuickBiteLogo
jest.mock('../components/QuickBiteLogo', () => () => <div data-testid="quickbite-logo">QuickBite Logo</div>);

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  ChefHat: () => <div data-testid="chef-hat" />,
  Eye: () => <div data-testid="eye" />,
  EyeOff: () => <div data-testid="eye-off" />,
  User: () => <div data-testid="user" />,
  Lock: () => <div data-testid="lock" />,
  Store: () => <div data-testid="store" />,
}));

// Mock de fetch
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
    // Limpiar mocks
    jest.clearAllMocks();
  });

  test('renders Login component', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByText('QuickBite')).toBeInTheDocument();
    expect(screen.getAllByText('Iniciar Sesión')[0]).toBeInTheDocument();
  });

  test('renders registration form when switching to register mode', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText('Registrarse');
    fireEvent.click(registerButton);
    
    expect(screen.getByText('Nombre de Usuario')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Apellido')).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput.type).toBe('password');
    
    const eyeIcon = screen.getByTestId('eye');
    fireEvent.click(eyeIcon);
    
    expect(passwordInput.type).toBe('text');
  });

  test('switches between CLIENT and ADMIN roles in registration mode', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText('Registrarse');
    fireEvent.click(registerButton);
    
    const clientButton = screen.getByText('Soy Cliente');
    const adminButton = screen.getByText('Soy Dueño');
    
    expect(clientButton).toBeInTheDocument();
    expect(adminButton).toBeInTheDocument();
    
    fireEvent.click(adminButton);
    expect(screen.getByText('Registro de Restaurante')).toBeInTheDocument();
  });

  test('switches to KITCHEN role in registration mode', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText('Registrarse');
    fireEvent.click(registerButton);
    
    const kitchenButton = screen.getByText('Soy Cocinero');
    expect(kitchenButton).toBeInTheDocument();
    
    fireEvent.click(kitchenButton);
    expect(screen.getByText('Registro de Cocinero')).toBeInTheDocument();
  });

  test('handles form input changes', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    
    expect(emailInput.value).toBe('test@example.com');
  });

  test('submits login form successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'test-token',
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'CLIENT'
      }),
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = document.querySelector('button[type="submit"]');
    
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('userRole')).toBe('CLIENT');
    });
  });

  test('submits registration form successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: 'test-token',
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'CLIENT'
      }),
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const registerButton = screen.getByText('Registrarse');
    fireEvent.click(registerButton);
    
    const usernameInput = screen.getByPlaceholderText('juanp');
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const firstNameInput = screen.getByPlaceholderText('Juan');
    const lastNameInput = screen.getByPlaceholderText('Pérez');
    const submitButton = document.querySelector('button[type="submit"]');
    
    fireEvent.change(usernameInput, { target: { name: 'username', value: 'testuser' } });
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Juan' } });
    fireEvent.change(lastNameInput, { target: { name: 'lastName', value: 'Pérez' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
    });
  });

  test('handles login failure', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Credenciales incorrectas' }),
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = document.querySelector('button[type="submit"]');
    
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('handles server offline mode', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = document.querySelector('button[type="submit"]');
    
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('mock-customer-token');
      expect(localStorage.getItem('userRole')).toBe('CLIENT');
    });
  });

  test('shows loading state during form submission', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      ok: true,
      json: async () => ({
        accessToken: 'test-token',
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'CLIENT'
      }),
    }), 1000)));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    const emailInput = screen.getByPlaceholderText('correo@ejemplo.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = document.querySelector('button[type="submit"]');
    
    fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Iniciando sesión...')).toBeInTheDocument();
  });
});
