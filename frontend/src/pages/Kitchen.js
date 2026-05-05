import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, AlertCircle, ChefHat, Timer, Users } from 'lucide-react';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    completedToday: 0
  });

  useEffect(() => {
    loadOrders();
    loadStats();
    // Actualizar en tiempo real cada 10 segundos
    const interval = setInterval(() => {
      loadOrders();
      loadStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      // Simulación de datos - reemplazar con llamada a API real
      const mockData = [
        {
          id: "ORD-001",
          customerName: "Juan Pérez",
          items: [
            { name: "Hamburguesa Clásica", quantity: 2, notes: "Sin cebolla" },
            { name: "Papas Fritas Grandes", quantity: 1, notes: "" }
          ],
          status: "pending",
          priority: "normal",
          createdAt: "2026-05-05T15:30:00Z",
          estimatedTime: 20,
          tableNumber: "T-05"
        },
        {
          id: "ORD-002",
          customerName: "María González",
          items: [
            { name: "Combo Big Bite", quantity: 1, notes: "Extra queso" },
            { name: "Ensalada César", quantity: 1, notes: "Sin crutones" }
          ],
          status: "preparing",
          priority: "high",
          createdAt: "2026-05-05T15:25:00Z",
          estimatedTime: 10,
          tableNumber: "T-03",
          startedAt: "2026-05-05T15:35:00Z"
        },
        {
          id: "ORD-003",
          customerName: "Carlos Rodríguez",
          items: [
            { name: "Hamburguesa Clásica", quantity: 1, notes: "" }
          ],
          status: "ready",
          priority: "normal",
          createdAt: "2026-05-05T15:15:00Z",
          estimatedTime: 0,
          tableNumber: "T-07"
        },
        {
          id: "ORD-004",
          customerName: "Ana Martínez",
          items: [
            { name: "Combo Big Bite", quantity: 2, notes: "Una sin tomate" },
            { name: "Papas Fritas Grandes", quantity: 1, notes: "" }
          ],
          status: "pending",
          priority: "urgent",
          createdAt: "2026-05-05T15:40:00Z",
          estimatedTime: 25,
          tableNumber: "T-01"
        }
      ];
      setOrders(mockData);
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar las órdenes');
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Simulación de estadísticas
      setStats({
        pending: 2,
        preparing: 1,
        ready: 1,
        completedToday: 45
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Simulación de actualización - reemplazar con llamada a API real
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              ...(newStatus === 'preparing' && { startedAt: new Date().toISOString() }),
              ...(newStatus === 'ready' && { completedAt: new Date().toISOString() })
            }
          : order
      ));
      
      toast.success(`Orden ${orderId} actualizada a ${getStatusText(newStatus)}`);
      loadStats();
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
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con estadísticas */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Kitchen Display System</h1>
        
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
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Preparando</p>
                <p className="text-2xl font-bold text-blue-700">{stats.preparing}</p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-500" />
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
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-yellow-500" />
            Pendientes ({orders.filter(o => o.status === 'pending').length})
          </h2>
          <div className="space-y-4">
            {orders.filter(order => order.status === 'pending').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`}></span>
                    </div>
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
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        {item.notes && <p className="text-xs text-gray-500 italic">Nota: {item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Comenzar Preparación
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Columna En Preparación */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChefHat className="h-5 w-5 mr-2 text-blue-500" />
            En Preparación ({orders.filter(o => o.status === 'preparing').length})
          </h2>
          <div className="space-y-4">
            {orders.filter(order => order.status === 'preparing').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <span className={`w-2 h-2 rounded-full ${getPriorityColor(order.priority)}`}></span>
                    </div>
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
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                        {item.notes && <p className="text-xs text-gray-500 italic">Nota: {item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'ready')}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Marcar como Listo
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Listos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Listos para Entregar ({orders.filter(o => o.status === 'ready').length})
          </h2>
          <div className="space-y-4">
            {orders.filter(order => order.status === 'ready').map(order => (
              <div key={order.id} className={`kitchen-order ${getStatusColor(order.status)} border-l-4`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{order.id}</h3>
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
                    {order.items.map((item, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{item.quantity}x {item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-100 text-green-800 p-2 rounded-md text-center text-sm">
                  ✅ Pedido listo para entrega
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kitchen;
