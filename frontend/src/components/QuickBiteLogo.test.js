import React from 'react';
import { render, screen } from '@testing-library/react';
import QuickBiteLogo from './QuickBiteLogo';

// Mock de lucide-react
jest.mock('lucide-react', () => ({
  ChefHat: ({ className }) => <div data-testid="chef-hat" className={className} />,
}));

describe('QuickBiteLogo Component', () => {
  test('renders QuickBiteLogo component', () => {
    render(<QuickBiteLogo />);
    
    const chefHat = screen.getByTestId('chef-hat');
    expect(chefHat).toBeInTheDocument();
  });

  test('renders with default props', () => {
    render(<QuickBiteLogo />);
    
    const chefHat = screen.getByTestId('chef-hat');
    expect(chefHat).toHaveClass('h-8', 'w-8', 'text-primary');
  });

  test('renders with custom className', () => {
    render(<QuickBiteLogo className="custom-class" />);
    
    const container = screen.getByTestId('chef-hat').parentElement;
    expect(container).toHaveClass('custom-class');
  });

  test('renders with custom iconSize', () => {
    render(<QuickBiteLogo iconSize="h-12 w-12" />);
    
    const chefHat = screen.getByTestId('chef-hat');
    expect(chefHat).toHaveClass('h-12', 'w-12');
  });

  test('renders with custom speedLineSize', () => {
    render(<QuickBiteLogo speedLineSize="h-8 w-8" />);
    
    const container = screen.getByTestId('chef-hat').parentElement;
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  test('renders with custom color', () => {
    render(<QuickBiteLogo color="text-red-500" />);
    
    const chefHat = screen.getByTestId('chef-hat');
    expect(chefHat).toHaveClass('text-red-500');
  });

  test('renders speed lines SVG', () => {
    render(<QuickBiteLogo />);
    
    const container = screen.getByTestId('chef-hat').parentElement;
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('renders with all custom props', () => {
    render(
      <QuickBiteLogo 
        className="flex items-center justify-center"
        iconSize="h-10 w-10"
        speedLineSize="h-7 w-7"
        color="text-blue-600"
      />
    );
    
    const chefHat = screen.getByTestId('chef-hat');
    expect(chefHat).toHaveClass('h-10', 'w-10', 'text-blue-600');
  });
});
