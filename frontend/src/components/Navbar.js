import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChefHat, Users, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'customer';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Inicio', icon: null },
      { path: '/menu', label: 'Menú', icon: null },
    ];

    if (userRole === 'customer') {
      baseLinks.push({ path: '/orders', label: 'Mis Pedidos', icon: ShoppingCart });
    }

    if (userRole === 'kitchen') {
      baseLinks.push({ path: '/kitchen', label: 'Cocina', icon: ChefHat });
    }

    if (userRole === 'admin') {
      baseLinks.push(
        { path: '/admin', label: 'Administración', icon: Users }
      );
    }

    return baseLinks;
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <ChefHat className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold">QuickBite</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {getNavLinks().map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">
              Rol: {userRole === 'customer' ? 'Cliente' : 
                    userRole === 'kitchen' ? 'Cocina' : 'Administrador'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {getNavLinks().map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700"
            >
              {link.icon && <link.icon className="h-4 w-4 mr-2" />}
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
