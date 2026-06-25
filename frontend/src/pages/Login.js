import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChefHat, Eye, EyeOff, User, Lock, Store } from 'lucide-react';
import QuickBiteLogo from '../components/QuickBiteLogo';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'CLIENT'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state) {
      if (location.state.isRegistering !== undefined) {
        setIsRegistering(location.state.isRegistering);
      }
      if (location.state.defaultRole) {
        setFormData(prev => ({ ...prev, role: location.state.defaultRole }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isRegistering 
        ? '/api/v1/auth/register' 
        : '/api/v1/auth/authenticate';

      const payload = isRegistering ? {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      } : {
        username: formData.email, // backend accepts email as username for login
        password: formData.password
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.username);
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        
        toast.success(isRegistering ? '¡Registro exitoso!' : '¡Bienvenido a QuickBite!');
        
        // Redirigir según el rol
        switch (data.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'KITCHEN':
            navigate('/kitchen');
            break;
          default:
            navigate('/');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || (isRegistering ? 'Error al registrarse' : 'Credenciales incorrectas'));
      }
    } catch (error) {
      console.warn('Servidor backend offline. Iniciando sesión local de prueba.');
      const mockUser = {
        accessToken: 'mock-customer-token',
        userId: '1',
        username: formData.email ? formData.email.split('@')[0] : 'customer',
        email: formData.email || 'customer@quickbite.com',
        role: formData.role || 'CLIENT'
      };
      
      localStorage.setItem('token', mockUser.accessToken);
      localStorage.setItem('userId', mockUser.userId);
      localStorage.setItem('userName', mockUser.username);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('userRole', mockUser.role);
      
      localStorage.setItem('userFirstName', formData.firstName || 'Juan');
      localStorage.setItem('userLastName', formData.lastName || 'Pérez');
      localStorage.setItem('userPhone', '+56912345678');
      localStorage.setItem('userAddress', localStorage.getItem('deliveryAddress') || 'Providencia, Región Metropolitana');

      toast.info('Sesión iniciada en modo local (Servidor Offline)');
      
      switch (mockUser.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'KITCHEN':
          navigate('/kitchen');
          break;
        default:
          navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center transition-all duration-300">
            {isRegistering && formData.role === 'ADMIN' ? (
              <Store className="h-16 w-16 text-primary" />
            ) : (
              <QuickBiteLogo iconSize="h-16 w-16" speedLineSize="h-12 w-12" />
            )}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            {isRegistering 
              ? (formData.role === 'ADMIN' ? 'Registro de Restaurante' : 'Registro de Cliente') 
              : 'QuickBite'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering 
              ? (formData.role === 'ADMIN' ? 'Gestiona tu restaurante y aumenta tus ventas' : 'Pide tu comida favorita en minutos') 
              : 'Sistema de Gestión de Restaurantes'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          
          <div className="flex justify-center mb-6 border-b pb-4">
            <button
              onClick={() => setIsRegistering(false)}
              className={`px-4 py-2 font-medium ${!isRegistering ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setIsRegistering(true)}
              className={`px-4 py-2 font-medium ${isRegistering ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
            >
              {formData.role === 'ADMIN' ? 'Registrar Restaurante' : 'Registrarse'}
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isRegistering && (
              <>
                <div className="flex justify-center space-x-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'CLIENT' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.role === 'CLIENT'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Soy Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.role === 'ADMIN'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Soy Dueño / Restaurante
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      id="firstName" name="firstName" type="text" required
                      value={formData.firstName} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Juan"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido
                    </label>
                    <input
                      id="lastName" name="lastName" type="text"
                      value={formData.lastName} onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      placeholder="Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de Usuario
                  </label>
                  <input
                    id="username" name="username" type="text" required
                    value={formData.username} onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="juanp"
                  />
                </div>
              </>
            )}



            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password} onChange={handleChange}
                  className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isRegistering ? 'Registrando...' : 'Iniciando sesión...'}
                  </div>
                ) : (
                  isRegistering ? 'Registrarse' : 'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>

          {!isRegistering && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm font-medium text-gray-700 mb-2">Sugerencia:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p>Si es tu primera vez, usa la pestaña <strong>Registrarse</strong> para crear tu cuenta Admin.</p>
              </div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>{isRegistering ? 'Crea una cuenta para acceder a la plataforma' : 'Ingresa tus credenciales para continuar'}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

