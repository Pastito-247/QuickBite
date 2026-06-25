import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import apiURL from '../utils/api';
import { toast } from 'react-toastify';

const NotificationBadge = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'CLIENT') {
      setNotifications([
        { id: 'mock-1', tipo: 'PROMOCION', mensaje: '¡20% de descuento en Hamburguesas solo por hoy!', fechaCreacion: new Date().toISOString() },
        { id: 'mock-2', tipo: 'PEDIDO_ENTREGADO', mensaje: 'Tu pedido anterior ha sido entregado exitosamente. ¡Que lo disfrutes!', fechaCreacion: new Date(Date.now() - 86400000).toISOString() }
      ]);
      return;
    }

    if (!token || !userId) return;

    try {
      const response = await fetch(apiURL(`/api/notificaciones/usuario/${userId}/no-leidas?size=10`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        // El backend devuelve una estructura paginada (Page<NotificacionResponse>)
        setNotifications(data.content || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(apiURL(`/api/notificaciones/${id}/marcar-leida`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== id));
      } else {
        toast.error('Error al marcar notificación como leída');
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getNotificationIcon = (tipo) => {
    switch(tipo) {
      case 'INVENTARIO_CRITICO': return '⚠️';
      case 'PEDIDO_RECIBIDO': return '📋';
      case 'PEDIDO_PREPARACION': return '👨‍🍳';
      case 'PEDIDO_LISTO': return '✅';
      case 'PEDIDO_ENTREGADO': return '🚚';
      case 'PROMOCION': return '🎉';
      default: return '🔔';
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-alert-600 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="py-2 bg-gray-50 border-b border-gray-200 px-4">
            <h3 className="text-sm font-semibold text-gray-800">Notificaciones</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                No tienes notificaciones nuevas
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => markAsRead(notif.id)}>
                  <div className="flex items-start">
                    <span className="mr-3 text-lg">{getNotificationIcon(notif.tipo)}</span>
                    <div>
                      <p className="text-sm text-gray-800">{notif.mensaje}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.fechaCreacion).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBadge;

