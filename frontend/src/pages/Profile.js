import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, ShoppingBag, Star, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import apiURL from '../utils/api';

const chileanCommunes = [
  'Providencia, Región Metropolitana',
  'Santiago Centro, Región Metropolitana',
  'Las Condes, Región Metropolitana',
  'Ñuñoa, Región Metropolitana',
  'Vitacura, Región Metropolitana',
  'La Reina, Región Metropolitana',
  'Lo Barnechea, Región Metropolitana',
  'San Miguel, Región Metropolitana',
  'La Florida, Región Metropolitana',
  'Maipú, Región Metropolitana',
  'Macul, Región Metropolitana',
  'Estación Central, Región Metropolitana',
  'Viña del Mar, Región de Valparaíso',
  'Concepción, Región del Biobío'
];

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    profileImage: null,
    joinDate: 'Enero 2026',
    favoriteRestaurant: 'Burger Queen',
    totalOrders: 0
  });

  const [formData, setFormData] = useState({ ...userData });

  const loadLocalProfile = () => {
    const loadedData = {
      firstName: localStorage.getItem('userFirstName') || 'Juan',
      lastName: localStorage.getItem('userLastName') || 'Pérez',
      email: localStorage.getItem('userEmail') || 'customer@quickbite.com',
      phone: localStorage.getItem('userPhone') || '+56912345678',
      address: localStorage.getItem('userAddress') || localStorage.getItem('deliveryAddress') || 'Providencia, Región Metropolitana',
      profileImage: localStorage.getItem('userProfileImage') || null,
      joinDate: 'Enero 2026',
      favoriteRestaurant: 'Burger Queen',
      totalOrders: JSON.parse(localStorage.getItem('mockClientOrders') || '[]').length
    };
    setUserData(loadedData);
    setFormData(loadedData);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!userId || userId === 'undefined' || userId === 'null' || !token || token === 'undefined' || token === 'null') {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          navigate('/login');
          return;
        }

        const response = await fetch(apiURL(`/api/v1/auth/profile/${userId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          cache: 'no-store'
        });
        
        if (response.ok) {
          const data = await response.json();
          const loadedData = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phoneNumber || '',
            address: data.address || '',
            profileImage: data.profileImage || null,
            joinDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'Enero 2026',
            favoriteRestaurant: 'Burger Queen',
            totalOrders: 0
          };
          setUserData(loadedData);
          setFormData(loadedData);
        } else if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          toast.error('Tu sesión ha expirado');
          navigate('/login');
        } else {
          loadLocalProfile();
        }
      } catch (error) {
        loadLocalProfile();
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUserData({ ...userData, profileImage: base64String });
        setFormData({ ...formData, profileImage: base64String });
        localStorage.setItem('userProfileImage', base64String);
        toast.success('Foto de perfil actualizada');
      };
      reader.readAsDataURL(file);
    }
  };

  const saveLocalProfile = () => {
    localStorage.setItem('userFirstName', formData.firstName);
    localStorage.setItem('userLastName', formData.lastName);
    localStorage.setItem('userEmail', formData.email);
    localStorage.setItem('userPhone', formData.phone);
    localStorage.setItem('userAddress', formData.address);
    // Sincronizar también dirección global
    localStorage.setItem('deliveryAddress', formData.address);
    window.dispatchEvent(new Event('storage'));
    
    setUserData(formData);
    setIsEditing(false);
    toast.success('Perfil guardado localmente (Servidor Offline)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        saveLocalProfile();
        setLoading(false);
        return;
      }

      const response = await fetch(apiURL(`/api/v1/auth/profile/${userId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          address: formData.address,
          profileImage: formData.profileImage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserData({ ...formData, phone: data.phoneNumber || formData.phone });
        setIsEditing(false);
        
        // Sincronizar localStorage para que otros componentes (como CartSidebar) usen el nuevo nombre/dirección/imagen
        localStorage.setItem('userFirstName', formData.firstName);
        localStorage.setItem('userLastName', formData.lastName);
        localStorage.setItem('userName', `${formData.firstName} ${formData.lastName}`);
        localStorage.setItem('userPhone', formData.phone || data.phoneNumber);
        localStorage.setItem('userAddress', formData.address);
        localStorage.setItem('deliveryAddress', formData.address);
        if (formData.profileImage) {
          localStorage.setItem('userProfileImage', formData.profileImage);
        }
        window.dispatchEvent(new Event('storage'));
        
        toast.success('Datos del perfil actualizados exitosamente');
      } else {
        saveLocalProfile();
      }
    } catch (error) {
      saveLocalProfile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-appbg min-h-screen pb-16 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-secondary-900 tracking-tight">Mi Cuenta</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Gestiona tu información de perfil y tus preferencias de entrega.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* COLUMNA IZQUIERDA: MENÚ DE NAVEGACIÓN Y RESUMEN AVATAR */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Tarjeta de Resumen de Perfil */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 text-center shadow-sm">
              <div className="relative inline-block mb-4 group mx-auto">
                <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-50 flex items-center justify-center mx-auto relative shadow-inner">
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-600 via-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-4xl select-none">
                      {userData.firstName ? userData.firstName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
                
                {/* Botón flotante para subir foto */}
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-600 text-white p-2 rounded-full shadow-md cursor-pointer transition-all transform hover:scale-105 active:scale-95">
                    <Camera className="h-4 w-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
              
              <h2 className="text-lg font-black text-secondary-900 leading-tight">
                {userData.firstName || 'Usuario'} {userData.lastName || 'QuickBite'}
              </h2>
              <span className="inline-block bg-gray-50 text-gray-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider mt-2 border border-gray-100">
                Miembro desde: {userData.joinDate}
              </span>
            </div>

            {/* Menú de Navegación Lateral (Estilo PedidosYa) */}
            <div className="bg-white border border-gray-100 rounded-3xl p-4 shadow-sm flex flex-col space-y-1">
              <button className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-xs font-black transition-all bg-primary text-white shadow-sm shadow-orange-100">
                <User className="h-4 w-4" />
                <span>Mis Datos</span>
              </button>
              <button 
                onClick={() => navigate('/orders')} 
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-2xl text-xs font-bold text-gray-600 hover:text-primary hover:bg-orange-50 transition-all text-left"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Mis Pedidos</span>
              </button>
            </div>
            
          </div>

          {/* COLUMNA DERECHA: FORMULARIO DE DETALLES */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h3 className="text-md font-black text-secondary-900">Detalles de la cuenta</h3>
                  <p className="text-[11px] text-gray-400 font-semibold mt-0.5">Mantén tus datos de contacto y despacho actualizados.</p>
                </div>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-primary font-black text-xs hover:text-primary-600 transition-all bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-xl"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </button>
                )}
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text" name="firstName"
                          disabled={!isEditing}
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-9 w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-xl text-xs font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Apellido</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text" name="lastName"
                          disabled={!isEditing}
                          value={formData.lastName}
                          onChange={handleChange}
                          className="pl-9 w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-xl text-xs font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email" name="email"
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-9 w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-xl text-xs font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel" name="phone"
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-9 w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent rounded-xl text-xs font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Comuna de Entrega por Defecto</label>
                      <div className="relative flex items-center bg-white border border-gray-200 focus-within:ring-1 focus-within:ring-primary rounded-xl">
                        <div className="absolute left-3 pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <select
                          name="address"
                          disabled={!isEditing}
                          value={formData.address}
                          onChange={handleChange}
                          className="pl-9 w-full px-4 py-2.5 focus:outline-none bg-transparent pr-8 appearance-none cursor-pointer text-xs font-bold text-gray-700 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                          required
                        >
                          <option value="" disabled className="text-gray-400">Selecciona tu comuna...</option>
                          {chileanCommunes.map(commune => (
                            <option key={commune} value={commune} className="text-gray-800 font-medium">{commune}</option>
                          ))}
                        </select>
                        <div className="absolute right-3 pointer-events-none text-gray-400">
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      <p className="mt-1.5 text-[10px] text-gray-400 font-semibold">Esta comuna se seleccionará automáticamente en la cabecera al hacer tus pedidos.</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ ...userData });
                        }}
                        className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-xs font-black"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-600 transition-all text-xs font-black disabled:opacity-75"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-4 w-4 mr-1.5" />
                        )}
                        Guardar Cambios
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Profile;

