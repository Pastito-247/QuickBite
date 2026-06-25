import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationBadge from './NotificationBadge';

// Mock de react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  Bell: () => <div data-testid="bell-icon" />,
}));

// Mock de fetch
global.fetch = jest.fn();

describe('NotificationBadge Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
    // Limpiar mocks
    jest.clearAllMocks();
  });

  test('renders NotificationBadge component', () => {
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    expect(bellIcon).toBeInTheDocument();
  });

  test('shows notification badge when there are notifications', async () => {
    // Simular usuario CLIENT
    localStorage.setItem('userRole', 'CLIENT');
    
    render(<NotificationBadge />);
    
    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });
  });

  test('does not show notification badge when there are no notifications', async () => {
    // Simular usuario sin rol CLIENT
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '123');
    localStorage.setItem('userRole', 'ADMIN');
    
    // Mock fetch para retornar vacío
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });
    
    render(<NotificationBadge />);
    
    await waitFor(() => {
      const badge = screen.queryByText('0');
      expect(badge).not.toBeInTheDocument();
    });
  });

  test('opens notification dropdown when bell icon is clicked', async () => {
    localStorage.setItem('userRole', 'CLIENT');
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const dropdown = screen.getByText('Notificaciones');
      expect(dropdown).toBeInTheDocument();
    });
  });

  test('closes notification dropdown when bell icon is clicked again', async () => {
    localStorage.setItem('userRole', 'CLIENT');
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const dropdown = screen.getByText('Notificaciones');
      expect(dropdown).toBeInTheDocument();
    });
    
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const dropdown = screen.queryByText('Notificaciones');
      expect(dropdown).not.toBeInTheDocument();
    });
  });

  test('displays notification messages', async () => {
    localStorage.setItem('userRole', 'CLIENT');
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const notification1 = screen.getByText(/20% de descuento en Hamburguesas/);
      const notification2 = screen.getByText(/Tu pedido anterior ha sido entregado/);
      expect(notification1).toBeInTheDocument();
      expect(notification2).toBeInTheDocument();
    });
  });

  test('displays "No tienes notificaciones nuevas" when there are no notifications', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '123');
    localStorage.setItem('userRole', 'ADMIN');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [] }),
    });
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const noNotifications = screen.getByText('No tienes notificaciones nuevas');
      expect(noNotifications).toBeInTheDocument();
    });
  });

  test('marks notification as read when clicked', async () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('userId', '123');
    localStorage.setItem('userRole', 'ADMIN');
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: [{ id: '1', tipo: 'PROMOCION', mensaje: 'Test notification', fechaCreacion: new Date().toISOString() }] }),
    });
    
    fetch.mockResolvedValueOnce({
      ok: true,
    });
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const notification = screen.getByText('Test notification');
      fireEvent.click(notification);
    });
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/notificaciones/1/marcar-leida',
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });
  });

  test('displays correct icon for notification type', async () => {
    localStorage.setItem('userRole', 'CLIENT');
    
    render(<NotificationBadge />);
    
    const bellIcon = screen.getByTestId('bell-icon');
    fireEvent.click(bellIcon);
    
    await waitFor(() => {
      const promotionIcon = screen.getByText('🎉');
      const deliveredIcon = screen.getByText('🚚');
      expect(promotionIcon).toBeInTheDocument();
      expect(deliveredIcon).toBeInTheDocument();
    });
  });
});

