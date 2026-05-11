import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ChefHat, Users, LogOut, ChevronDown, User } from 'lucide-react';
import QuickBiteLogo from './QuickBiteLogo';
import NotificationBadge from './NotificationBadge';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');

  if (location.pathname === '/admin' || location.pathname === '/kitchen') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Inicio', icon: null },
      { path: '/restaurants', label: 'Restaurantes', icon: null },
      { 
        path: '/menu', 
        label: 'Menú', 
        icon: null,
        dropdown: [
          { path: '/menu?category=hamburguesas', label: 'Hamburguesas' },
          { path: '/menu?category=pizzas', label: 'Pizzas' },
          { path: '/menu?category=mexicana', label: 'Mexicana' },
          { path: '/menu?category=sushi', label: 'Sushi' },
          { path: '/menu', label: 'Ver Todo' }
        ]
      },
    ];

    if (!userRole || userRole === 'CLIENT') {
      baseLinks.push({ path: '/orders', label: 'Mis Pedidos', icon: ShoppingCart, requiresAuth: true });
      baseLinks.push({ path: '/profile', label: 'Mi Perfil', icon: User, requiresAuth: true });
    }

    if (userRole === 'KITCHEN') {
      baseLinks.push({ path: '/kitchen', label: 'Cocina', icon: ChefHat });
    }

    if (userRole === 'ADMIN') {
      baseLinks.push(
        { path: '/admin', label: 'Administración', icon: Users }
      );
    }

    return baseLinks;
  };

  return (
    <nav className="bg-white text-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <QuickBiteLogo className="transform group-hover:scale-105 transition-transform" />
              <span className="ml-2 text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">QuickBite</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {getNavLinks().map((link) => {
              const handleProtectedClick = (e) => {
                if (link.requiresAuth && !userRole) {
                  e.preventDefault();
                  toast.info('Debes iniciar sesión para acceder a esta sección');
                  navigate('/login');
                }
              };

              return link.dropdown ? (
                <div key={link.label} className="relative group">
                  <Link
                    to={link.path}
                    onClick={handleProtectedClick}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors"
                  >
                    {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                    {link.label}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Link>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-gray-200">
                    {link.dropdown.map(drop => (
                      <Link
                        key={drop.label}
                        to={drop.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                      >
                        {drop.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.path}
                  onClick={handleProtectedClick}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors"
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            {(!userRole || userRole === 'CLIENT') && (
              <button 
                onClick={() => {
                  if (!userRole) {
                    toast.info('Debes iniciar sesión para usar el carrito');
                    navigate('/login');
                  } else {
                    navigate('/menu');
                  }
                }}
                className="p-2 text-gray-500 hover:text-primary transition-colors" 
                title="Ver Carrito"
              >
                <ShoppingCart className="h-6 w-6" />
              </button>
            )}
            <span className="text-sm text-gray-500 font-medium hidden sm:block">
              {userRole ? `Rol: ${userRole === 'CLIENT' ? 'Cliente' : 
                    userRole === 'KITCHEN' ? 'Cocina' : 'Administrador'}` : ''}
            </span>
            {userRole && <NotificationBadge />}
            {userRole ? (
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium bg-alert hover:bg-alert-600 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </button>
            ) : (
              <Link
                to="/login"
                className="flex items-center px-4 py-2 rounded-md text-sm font-bold text-white bg-primary hover:bg-primary-600 transition-colors shadow-sm"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {getNavLinks().map((link) => {
            const handleProtectedClick = (e) => {
              if (link.requiresAuth && !userRole) {
                e.preventDefault();
                toast.info('Debes iniciar sesión para acceder a esta sección');
                navigate('/login');
              }
            };

            return (
              <React.Fragment key={link.label}>
                <Link
                  to={link.path}
                  onClick={handleProtectedClick}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-orange-50"
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                  {link.label}
                </Link>
                {link.dropdown && (
                  <div className="pl-6 space-y-1">
                    {link.dropdown.map(drop => (
                      <Link
                        key={drop.label}
                        to={drop.path}
                        className="block px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-primary hover:bg-orange-50"
                      >
                        - {drop.label}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
