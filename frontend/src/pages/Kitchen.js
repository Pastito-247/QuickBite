import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, AlertCircle, ChefHat, Timer, Users, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import QuickBiteLogo from '../components/QuickBiteLogo';
import apiURL from '../utils/api';

const defaultRestaurants = [
  { id: 1, name: 'Burger Queen', category: 'Hamburguesas' },
  { id: 2, name: 'Pizza Hub', category: 'Pizzas' },
  { id: 3, name: 'Taco Fiesta', category: 'Tacos' },
  { id: 4, name: 'Sushi Zen', category: 'Sushi' },
  { id: 5, name: 'Green Bowl', category: 'Ensaladas' },
  { id: 6, name: 'El Asador', category: 'Carnes' },
  { id: 7, name: 'Wok Express', category: 'Asiática' },
  { id: 8, name: 'La Crêperie', category: 'Postres' }
];

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState(defaultRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState('ALL');
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completedToday: 0
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const filteredOrders = useMemo(() => {
    if (selectedRestaurant === 'ALL') {
      return orders;
    }
    return orders.filter(o => o.restaurantId === Number(selectedRestaurant));
  }, [orders, selectedRestaurant]);

  // Actualizar stats cuando cambian las órdenes o el filtro
  useEffect(() => {
    setStats({
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      preparing: filteredOrders.filter(o => o.status === 'preparing').length,
      ready: filteredOrders.filter(o => o.status === 'ready').length,
      completedToday: filteredOrders.filter(o => o.status === 'delivered').length
    });
  }, [orders, filteredOrders]);

  const loadRestaurants = async () => {
    try {
      const response = await fetch(apiURL('/api/restaurants'));
      if (response.ok) {
        const data = await response.json();
        const apiList = Array.isArray(data) ? data : [];
        
        // Combinar los predeterminados y los recibidos por la API eliminando duplicados por ID y por Nombre
        const merged = [...apiList];
        defaultRestaurants.forEach(defRest => {
          const exists = merged.some(
            r => r.id === defRest.id || (r.name && r.name.toLowerCase() === defRest.name.toLowerCase())
          );
          if (!exists) {
            merged.push(defRest);
          }
        });
        
        setRestaurants(merged);
      } else {
        setRestaurants(defaultRestaurants);
      }
    } catch (error) {
      console.error('Error al cargar restaurantes, usando predeterminados:', error);
      setRestaurants(defaultRestaurants);
    }
  };

  useEffect(() => {
    loadOrders();
    loadRestaurants();
    // Actualizar en tiempo real cada 10 segundos
    const interval = setInterval(() => {
      loadOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const mapEstado = (estado) => {
    switch ((estado || '').toUpperCase()) {
      case 'PENDIENTE':
      case 'CONFIRMADO':
        return 'pending';
      case 'EN_PREPARACION':
      case 'PREPARANDO':
        return 'preparing';
      case 'LISTO':
      case 'LISTO_PARA_ENTREGA':
        return 'ready';
      case 'ENTREGADO':
      case 'COMPLETADO':
        return 'delivered';
      case 'CANCELADO':
        return 'cancelled';
      default:
        return (estado || '').toLowerCase();
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch(apiURL('/api/orders?page=0&size=100&activos=true'));
      if (response.ok) {
        const data = await response.json();
        const rawList = Array.isArray(data) ? data : (data.content || []);
        const mapped = rawList.map(p => ({
          id: p.numeroPedido || `PED-${p.id}`,
          backendId: p.id,
          status: mapEstado(p.estado),
          priority: 'normal',
          tableNumber: 'Delivery',
          createdAt: p.fechaCreacion,
          startedAt: p.fechaActualizacion,
          completedAt: p.fechaEntrega,
          estimatedTime: p.tiempoEstimadoMinutos || 30,
          customerName: p.nombreCliente,
          restaurantId: p.restaurantId,
          restaurantName: p.restaurantName,
          items: (p.items || []).map(it => ({
            quantity: it.cantidad,
            name: it.nombreProducto,
            notes: it.notesItem || ''
          }))
        })).filter(o => o.status !== 'cancelled' && o.status !== 'delivered');
        setOrders(mapped);
      } else {
        toast.error('Error al cargar las órdenes');
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar las órdenes');
      setLoading(false);
    }
  };

  const groupItems = (items) => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.name]) {
        groups[item.name] = { name: item.name, totalQty: 0, variants: [] };
      }
      groups[item.name].totalQty += item.quantity;
      groups[item.name].variants.push({ quantity: item.quantity, notes: item.notes || '' });
    });
    return Object.values(groups);
  };

  const statusToBackend = {
    'pending': 'PENDIENTE',
    'preparing': 'EN_PREPARACION',
    'ready': 'LISTO',
    'delivered': 'ENTREGADO',
    'cancelled': 'CANCELADO'
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order || !order.backendId) {
        toast.error('Orden no encontrada');
        return;
      }
      const backendStatus = statusToBackend[newStatus];
      if (!backendStatus) {
        toast.error('Estado no válido');
        return;
      }
      const token = localStorage.getItem('token');
      const response = await fetch(apiURL(`/api/orders/${order.backendId}/estado`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ estado: backendStatus })
      });
      if (!response.ok) {
        toast.error('Error al actualizar el estado');
        return;
      }
      // Actualizar localmente para respuesta inmediata
      if (newStatus === 'cancelled' || newStatus === 'delivered') {
        // Eliminar del KDS inmediatamente
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? {
                ...o,
                status: newStatus,
                ...(newStatus === 'preparing' && { startedAt: new Date().toISOString() }),
                ...(newStatus === 'ready' && { completedAt: new Date().toISOString() })
              }
            : o
        ));
      }
      toast.success(`Orden ${orderId} actualizada a ${getStatusText(newStatus)}`);
    } catch (error) {
      toast.error('Error al actualizar el estado de la orden');
    }
  };



  
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo para entregar';
      case 'delivered':
        return 'Entregado al cliente 🎉';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-white text-gray-800 border-yellow-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1';
      case 'preparing':
        return 'bg-white text-gray-800 border-orange-500 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1';
      case 'ready':
        return 'bg-white text-gray-800 border-green-500 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1';
      default:
        return 'bg-white text-gray-800 border-gray-300 shadow-md';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElapsedTime = (startTime) => {
    if (!startTime) return 0;
    const start = new Date(startTime);
    const now = new Date();
    return Math.floor((now - start) / 60000); // minutos
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
      {/* Header con estadísticas y Logo */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <QuickBiteLogo iconSize="h-14 w-14" speedLineSize="h-10 w-10" color="text-white" />
            <div>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight">
                QuickBite <span className="font-medium text-orange-200">| Panel de Cocina</span>
              </h1>
              <p className="text-orange-100 font-medium mt-1">¡A darle sabor al día! 🔥</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
              <span className="text-xs font-black text-orange-100 uppercase tracking-wider">Restaurante:</span>
              <select
                value={selectedRestaurant}
                onChange={(e) => setSelectedRestaurant(e.target.value)}
                className="bg-transparent text-white font-extrabold outline-none cursor-pointer text-sm"
              >
                <option value="ALL" className="text-gray-800 font-bold">🏢 Todos los locales</option>
                {restaurants.map(r => (
                  <option key={r.id} value={r.id} className="text-gray-800 font-bold">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-bold shadow-sm"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span>Salir del Turno</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-bold uppercase tracking-wider">Preparando</p>
                <p className="text-3xl font-extrabold text-orange-700 mt-1">{stats.preparing}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <ChefHat className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Listos</p>
                <p className="text-2xl font-bold text-green-700">{stats.ready}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Completados hoy</p>
                <p className="text-2xl font-bold text-gray-700">{stats.completedToday}</p>
              </div>
              <Users className="h-8 w-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Pendientes */}
        <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 shadow-sm">
          <h2 className="text-xl font-bold text-yellow-800 mb-4 flex items-center bg-yellow-100 p-3 rounded-xl">
            <Clock className="h-6 w-6 mr-2 text-yellow-600" />
            Nuevos Pedidos <span className="ml-2 bg-yellow-500 text-white px-2 py-0.5 rounded-full text-sm">{filteredOrders.filter(o => o.status === 'pending').length}</span>
          </h2>
          <div className="space-y-4">
            {filteredOrders.filter(order => order.status === 'pending').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-secondary-900">{order.id}</h3>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`}></span>
                    </div>
                    {order.restaurantName && (
                      <span className="inline-block mt-0.5 mb-1 px-2 py-0.5 bg-orange-50 text-primary border border-orange-100 text-[10px] font-black rounded uppercase tracking-wide">
                        🏢 {order.restaurantName}
                      </span>
                    )}
                    <p className="text-sm text-gray-600">Mesa: {order.tableNumber}</p>
                    <p className="text-sm text-gray-600">{formatTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{order.estimatedTime}min</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Cliente: {order.customerName}</p>
                  <div className="space-y-1">
                    {groupItems(order.items).map((group, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{group.totalQty}x {group.name}</span>
                        {(group.variants.length > 1 || group.variants.some(v => v.notes)) && (
                          <div className="ml-4 space-y-0.5">
                            {group.variants.map((v, vi) => (
                              <p key={vi} className="text-xs text-gray-500 italic">
                                {v.quantity}x {v.notes || 'Normal'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="w-full bg-yellow-500 text-white font-bold py-3 rounded-lg hover:bg-yellow-600 transition-colors shadow-sm text-lg flex items-center justify-center"
                >
                  <ChefHat className="h-5 w-5 mr-2" />
                  ¡A Cocinar!
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Columna En Preparación */}
        <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 shadow-sm">
          <h2 className="text-xl font-bold text-orange-800 mb-4 flex items-center bg-orange-100 p-3 rounded-xl">
            <ChefHat className="h-6 w-6 mr-2 text-orange-600" />
            En Preparación <span className="ml-2 bg-orange-500 text-white px-2 py-0.5 rounded-full text-sm">{filteredOrders.filter(o => o.status === 'preparing').length}</span>
          </h2>
          <div className="space-y-4">
            {filteredOrders.filter(order => order.status === 'preparing').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-secondary-900">{order.id}</h3>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`}></span>
                    </div>
                    {order.restaurantName && (
                      <span className="inline-block mt-0.5 mb-1 px-2 py-0.5 bg-orange-50 text-primary border border-orange-100 text-[10px] font-black rounded uppercase tracking-wide">
                        🏢 {order.restaurantName}
                      </span>
                    )}
                    <p className="text-sm text-gray-600">Mesa: {order.tableNumber}</p>
                    <p className="text-sm text-gray-600">Iniciado: {formatTime(order.startedAt)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Timer className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-600">
                      {getElapsedTime(order.startedAt)}min
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Cliente: {order.customerName}</p>
                  <div className="space-y-1">
                    {groupItems(order.items).map((group, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{group.totalQty}x {group.name}</span>
                        {(group.variants.length > 1 || group.variants.some(v => v.notes)) && (
                          <div className="ml-4 space-y-0.5">
                            {group.variants.map((v, vi) => (
                              <p key={vi} className="text-xs text-gray-500 italic">
                                {v.quantity}x {v.notes || 'Normal'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors shadow-sm text-lg flex items-center justify-center"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  ¡Está Listo!
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Listos */}
        <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100 shadow-sm">
          <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center bg-green-100 p-3 rounded-xl">
            <CheckCircle className="h-6 w-6 mr-2 text-green-600" />
            Listos para Entregar <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-sm">{filteredOrders.filter(o => o.status === 'ready').length}</span>
          </h2>
          <div className="space-y-4">
            {filteredOrders.filter(order => order.status === 'ready').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-secondary-900">{order.id}</h3>
                    {order.restaurantName && (
                      <span className="inline-block mt-0.5 mb-1 px-2 py-0.5 bg-orange-50 text-primary border border-orange-100 text-[10px] font-black rounded uppercase tracking-wide">
                        🏢 {order.restaurantName}
                      </span>
                    )}
                    <p className="text-sm text-gray-600">Mesa: {order.tableNumber}</p>
                    <p className="text-sm text-gray-600">Listo: {formatTime(order.completedAt)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Entregar</span>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">Cliente: {order.customerName}</p>
                  <div className="space-y-1">
                    {groupItems(order.items).map((group, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{group.totalQty}x {group.name}</span>
                        {(group.variants.length > 1 || group.variants.some(v => v.notes)) && (
                          <div className="ml-4 space-y-0.5">
                            {group.variants.map((v, vi) => (
                              <p key={vi} className="text-xs text-gray-500 italic">
                                {v.quantity}x {v.notes || 'Normal'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                  className="w-full mt-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-extrabold py-3 rounded-xl hover:from-green-500 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg text-lg flex items-center justify-center animate-pulse border-2 border-green-300"
                >
                  <span className="text-2xl mr-2">🏃‍♂️💨</span>
                  ¡Entregar al Cliente!
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;

