import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, ChefHat, Users, LogOut, ChevronDown, User, MapPin, Search } from 'lucide-react';
import QuickBiteLogo from './QuickBiteLogo';
import NotificationBadge from './NotificationBadge';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { toggleCart, cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('userRole');
  const [address, setAddress] = useState(localStorage.getItem('deliveryAddress') || '');

  useEffect(() => {
    const handleStorageChange = () => {
      setAddress(localStorage.getItem('deliveryAddress') || '');
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentAddress = localStorage.getItem('deliveryAddress') || '';
      if (currentAddress !== address) {
        setAddress(currentAddress);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [address]);

  if (location.pathname === '/admin' || location.pathname === '/kitchen') {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    clearCart();
    navigate('/login');
  };

  const getNavLinks = () => {
    const baseLinks = [
      { path: '/', label: 'Inicio', icon: null },
      { path: '/restaurants', label: 'Restaurantes', icon: null },
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
    <nav className="bg-white text-gray-800 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-3 flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <QuickBiteLogo className="transform group-hover:scale-105 transition-transform" />
              <span className="ml-1.5 text-xl font-black text-secondary-900 group-hover:text-primary transition-colors">QuickBite</span>
            </Link>
            {address && (
              <div 
                onClick={() => navigate('/')} 
                className="hidden lg:flex items-center space-x-1 text-xs text-gray-500 hover:text-primary cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200"
                title={`Dirección de envío: ${address}`}
              >
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span className="truncate max-w-[120px]">Enviar a: <span className="font-bold text-gray-700">{address}</span></span>
              </div>
            )}
          </div>

          {/* Buscador Central (Estilo PedidosYa, oculto en Home) */}
          {location.pathname !== '/' ? (
            <div className="hidden md:flex flex-grow max-w-md mx-6 items-center">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar locales o comidas..."
                  className="pl-9 pr-4 py-2 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-xs font-semibold text-gray-700 shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`/restaurants?search=${encodeURIComponent(e.target.value)}`);
                    }
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex-grow"></div>
          )}

          {/* Menú de Navegación y Acciones del Usuario */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center space-x-2 mr-2">
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
                      className="flex items-center px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors"
                    >
                      {link.icon && <link.icon className="h-3.5 w-3.5 mr-1.5" />}
                      {link.label}
                      <ChevronDown className="h-3.5 w-3.5 ml-0.5 text-gray-400" />
                    </Link>
                    <div className="absolute left-0 mt-2 w-44 bg-white rounded-xl shadow-xl py-1.5 z-50 hidden group-hover:block border border-gray-100">
                      {link.dropdown.map(drop => (
                        <Link
                          key={drop.label}
                          to={drop.path}
                          className="block px-4 py-2 text-xs font-bold text-gray-600 hover:bg-orange-50 hover:text-primary transition-colors"
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
                    className="flex items-center px-3 py-2 rounded-lg text-xs font-bold text-gray-600 hover:text-primary hover:bg-orange-50 transition-colors"
                  >
                    {link.icon && <link.icon className="h-3.5 w-3.5 mr-1.5" />}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center space-x-3 border-l border-gray-100 pl-3">
              {(!userRole || userRole === 'CLIENT') && (
                <button 
                  onClick={() => {
                    if (!userRole) {
                      toast.info('Debes iniciar sesión para usar el carrito');
                      navigate('/login');
                    } else {
                      toggleCart();
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 rounded-full relative" 
                  title="Ver Carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {userRole && cart.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>
              )}
              {userRole && <NotificationBadge />}
              {userRole ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded-xl text-xs font-bold text-white bg-alert hover:bg-alert-600 transition-colors shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Salir
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-600 transition-colors shadow-md shadow-orange-100"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
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
