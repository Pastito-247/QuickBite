import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, ShoppingBag, Star, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Mock data para el usuario
  const [userData, setUserData] = useState({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+56 9 1234 5678',
    address: 'Av. Providencia 1234, Depto 502, Santiago',
    profileImage: null,
    joinDate: 'Enero 2026',
    favoriteRestaurant: 'Burger Queen',
    totalOrders: 14
  });

  const [formData, setFormData] = useState({ ...userData });

  useEffect(() => {
    // Si tuviéramos backend, aquí haríamos el fetch
    // const userId = localStorage.getItem('userId');
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Simulamos la subida de una imagen usando un objeto URL local
      const imageUrl = URL.createObjectURL(file);
      setUserData({ ...userData, profileImage: imageUrl });
      setFormData({ ...formData, profileImage: imageUrl });
      toast.success('Foto de perfil actualizada');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulamos una llamada a la API
    setTimeout(() => {
      setUserData({ ...formData });
      setIsEditing(false);
      setLoading(false);
      toast.success('Datos del perfil actualizados exitosamente');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y preferencias</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Foto y Estadísticas */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Tarjeta de Foto de Perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="relative inline-block mb-4 group">
                <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  {userData.profileImage ? (
                    <img src={userData.profileImage} alt="Perfil" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-16 w-16 text-gray-400" />
                  )}
                </div>
                
                {/* Botón flotante para subir foto */}
                <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-md cursor-pointer hover:bg-primary-600 transition-colors transform hover:scale-110">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              <h2 className="text-xl font-bold text-gray-900">{userData.firstName} {userData.lastName}</h2>
              <p className="text-gray-500 text-sm">Miembro desde {userData.joinDate}</p>
            </div>

            {/* Tarjeta de Estadísticas Rápidas */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Actividad</h3>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <div className="bg-orange-100 p-2 rounded-lg mr-3">
                    <ShoppingBag className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Pedidos Totales</p>
                    <p className="font-bold text-lg">{userData.totalOrders}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <Star className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Restaurante Favorito</p>
                    <p className="font-bold">{userData.favoriteRestaurant}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Datos */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center text-primary font-medium hover:text-primary-600 transition-colors bg-orange-50 px-3 py-1.5 rounded-lg"
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text" name="firstName"
                          disabled={!isEditing}
                          value={formData.firstName}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Apellido</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text" name="lastName"
                          disabled={!isEditing}
                          value={formData.lastName}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email" name="email"
                          disabled={!isEditing}
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel" name="phone"
                          disabled={!isEditing}
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de Envío Principal</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                          <MapPin className="h-5 w-5 text-gray-400" />
                        </div>
                        <textarea
                          name="address"
                          disabled={!isEditing}
                          value={formData.address}
                          onChange={handleChange}
                          rows="2"
                          className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Esta dirección se usará por defecto en tus pedidos.</p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ ...userData }); // Restaurar datos
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors font-medium disabled:opacity-70"
                      >
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Save className="h-5 w-5 mr-2" />
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
