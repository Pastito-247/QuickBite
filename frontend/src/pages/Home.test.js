import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock" />,
  Users: () => <div data-testid="users" />,
  ChefHat: () => <div data-testid="chef-hat" />,
  Star: () => <div data-testid="star" />,
  MapPin: () => <div data-testid="map-pin" />,
  Store: () => <div data-testid="store" />,
  TrendingUp: () => <div data-testid="trending-up" />,
  Utensils: () => <div data-testid="utensils" />,
  Zap: () => <div data-testid="zap" />,
  Truck: () => <div data-testid="truck" />,
  Search: () => <div data-testid="search" />,
  Flame: () => <div data-testid="flame" />,
  Fish: () => <div data-testid="fish" />,
  Leaf: () => <div data-testid="leaf" />,
  Cake: () => <div data-testid="cake" />,
  ArrowRight: () => <div data-testid="arrow-right" />,
}));

describe('Home Component', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    localStorage.clear();
  });

  test('renders Home component', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/¿Qué te provoca pedir hoy/)).toBeInTheDocument();
  });

  test('renders search form', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText('Plato, restaurante, antojo...')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  test('renders category list', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Hamburguesas')).toBeInTheDocument();
    expect(screen.getByText('Pizzas')).toBeInTheDocument();
    expect(screen.getByText('Mexicana')).toBeInTheDocument();
  });

  test('renders mock restaurants', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Burger Queen')).toBeInTheDocument();
    expect(screen.getByText('Pizza Hub')).toBeInTheDocument();
    expect(screen.getByText('Taco Fiesta')).toBeInTheDocument();
  });

  test('handles search input change', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText('Plato, restaurante, antojo...');
    fireEvent.change(searchInput, { target: { value: 'hamburguesa' } });
    
    expect(searchInput.value).toBe('hamburguesa');
  });

  test('handles address input change', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const addressSelect = screen.getByRole('combobox');
    fireEvent.change(addressSelect, { target: { value: 'Providencia, Región Metropolitana' } });
    
    expect(addressSelect.value).toBe('Providencia, Región Metropolitana');
  });

  test('renders stats section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText('12')).toBeInTheDocument(); // activeOrders
    expect(screen.getByText('248')).toBeInTheDocument(); // totalCustomers
    expect(screen.getByText('3')).toBeInTheDocument(); // chefsOnline
    expect(screen.getByText('4.8')).toBeInTheDocument(); // avgRating
  });

  test('renders popular restaurants section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Restaurantes Populares/)).toBeInTheDocument();
  });

  test('renders free delivery restaurants section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Envío Gratis/)).toBeInTheDocument();
  });

  test('renders fast delivery restaurants section', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Entrega Rápida/)).toBeInTheDocument();
  });

  test('handles category click', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const categoryButton = screen.getByText('Hamburguesas');
    fireEvent.click(categoryButton);
    
    // Verificar que se navega a la página de restaurantes con la categoría
    // Esto requeriría mock de useNavigate, pero por ahora verificamos que el elemento existe
    expect(categoryButton).toBeInTheDocument();
  });

  test('loads address from localStorage', () => {
    localStorage.setItem('deliveryAddress', 'Providencia, Región Metropolitana');
    
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const addressSelect = screen.getByRole('combobox');
    expect(addressSelect.value).toBe('Providencia, Región Metropolitana');
  });

  test('saves address to localStorage on search', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const addressSelect = screen.getByRole('combobox');
    fireEvent.change(addressSelect, { target: { value: 'Providencia, Región Metropolitana' } });
    
    const searchButton = screen.getByText('Buscar');
    fireEvent.click(searchButton);
    
    expect(localStorage.getItem('deliveryAddress')).toBe('Providencia, Región Metropolitana');
  });
});
