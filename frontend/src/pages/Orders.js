import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Clock, CheckCircle, Truck, Package, Eye, RefreshCw, XCircle, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiURL from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'history'
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
    // Simular actualización en tiempo real
    const interval = setInterval(loadOrders, 30000); // Actualizar cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Mapea los estados del backend (ES, mayus) al frontend (EN, minus)
  const mapEstado = (estado) => {
    switch ((estado || '').toUpperCase()) {
      case 'PENDIENTE':
        return 'pending';
      case 'CONFIRMADO':
        return 'confirmed';
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

  // Adapta un PedidoResponse del backend al formato que usa la UI
  const mapPedido = (p) => ({
    id: p.numeroPedido || `PED-${p.id}`,
    backendId: p.id,
    status: mapEstado(p.estado),
    subtotal: Number(p.subtotal) || 0,
    deliveryFee: Number(p.costoEnvio) || 0,
    total: Number(p.total) || 0,
    createdAt: p.fechaCreacion,
    estimatedTime: p.tiempoEstimadoMinutos || 0,
    trackingNumber: p.numeroPedido,
    restaurantId: p.restaurantId,
    restaurantName: p.restaurantName,
    items: (p.items || []).map(it => ({
      id: it.id,
      name: it.nombreProducto,
      quantity: it.cantidad,
      price: Number(it.precioUnitario) || 0,
      notes: it.notasItem || ''
    }))
  });

  const groupItems = (items) => {
    const groups = {};
    items.forEach(item => {
      if (!groups[item.name]) {
        groups[item.name] = { name: item.name, price: item.price, totalQty: 0, variants: [] };
      }
      groups[item.name].totalQty += item.quantity;
      groups[item.name].variants.push({ quantity: item.quantity, notes: item.notes });
    });
    return Object.values(groups);
  };

  const loadOrders = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const response = await fetch(apiURL(`/api/orders/user/${userId}`));
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        setOrders(list.map(mapPedido));
      } else if (response.status === 404) {
        setOrders([]);
      } else {
        toast.error('Error al cargar los pedidos');
      }
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar los pedidos');
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres cancelar este pedido?')) return;

    const order = orders.find(o => o.id === orderId);
    if (!order || !order.backendId) {
      toast.error('Orden no encontrada');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Llamar al backend para cancelar el pedido de verdad
      let response = await fetch(apiURL(`/api/orders/${order.backendId}/cancelar`), {
        method: 'DELETE',
        headers
      });

      // Fallback: si DELETE /cancelar falla, intentar con PUT /estado
      if (!response.ok) {
        response = await fetch(apiURL(`/api/orders/${order.backendId}/estado`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...headers },
          body: JSON.stringify({ estado: 'CANCELADO' })
        });
      }

      if (!response.ok) {
        toast.error('Error al cancelar el pedido');
        return;
      }

      // Actualizar estado local
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'cancelled' } : o
      ));
      toast.success('Pedido cancelado exitosamente');
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(null);
    } catch (error) {
      toast.error('Error al cancelar el pedido');
    }
  };

  const deleteOrder = (orderId) => {
    if (window.confirm('¿Quieres eliminar este pedido del historial?')) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('mockClientOrders', JSON.stringify(updatedOrders));
      toast.info('Pedido eliminado del historial');
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'preparing':
        return <Package className="h-5 w-5 text-primary-500" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'delivered':
        return <Truck className="h-5 w-5 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmado';
      case 'preparing':
        return 'En preparación';
      case 'ready':
        return 'Listo para entrega';
      case 'delivered':
        return 'Entregado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Desconocido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-accent-100 text-accent-800';
      case 'delivered':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const refreshOrders = () => {
    setLoading(true);
    loadOrders();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const displayedOrders = orders.filter(order => 
    activeTab === 'active' 
      ? ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
      : ['delivered', 'cancelled'].includes(order.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-secondary-900">Mis Pedidos</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/restaurants')}
            className="flex items-center px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            <ShoppingBag className="h-5 w-5 mr-2" />
            Hacer nuevo pedido
          </button>
          <button
            onClick={() => {setActiveTab('active'); setSelectedOrder(null);}}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'active' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            Pedidos Activos
          </button>
          <button
            onClick={() => {setActiveTab('history'); setSelectedOrder(null);}}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
          >
            Historial
          </button>
          <button
            onClick={refreshOrders}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No hay pedidos {activeTab === 'active' ? 'activos' : 'en el historial'}</h2>
          {activeTab === 'active' && <p className="text-gray-500 mb-6">¡Explora nuestros restaurantes y haz tu primer pedido!</p>}
          <a
            href="/restaurants"
            className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            Ver Restaurantes
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-4">
            {displayedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900">{order.id}</h3>
                    {order.restaurantName && (
                      <div className="mt-1 mb-1">
                        <span className="inline-block px-2 py-0.5 bg-orange-50 text-primary border border-orange-100 text-[10px] font-black rounded uppercase tracking-wide">
                          🏢 {order.restaurantName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">{formatTime(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    {getStatusIcon(order.status)}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      {groupItems(order.items).length} {groupItems(order.items).length === 1 ? 'producto' : 'productos'}
                      {order.items.reduce((s, i) => s + i.quantity, 0) > groupItems(order.items).length &&
                        <span className="text-gray-400 ml-1">({order.items.reduce((s, i) => s + i.quantity, 0)} unidades)</span>
                      }
                    </p>
                    <p className="text-lg font-semibold text-secondary-900">
                      ${order.total.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <button className="flex items-center text-primary hover:text-blue-800">
                    <Eye className="h-4 w-4 mr-1" />
                    Ver detalles
                  </button>
                </div>

                {order.status === 'preparing' && order.estimatedTime > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center text-blue-800">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        Tiempo estimado: {order.estimatedTime} minutos
                      </span>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-600">
                    Seguimiento: <span className="font-medium">{order.trackingNumber}</span>
                  </div>
                )}
                
                <div className="mt-4 flex justify-end space-x-2">
                  {['pending', 'confirmed'].includes(order.status) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); cancelOrder(order.id); }}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      Cancelar Pedido
                    </button>
                  )}
                  {['delivered', 'cancelled'].includes(order.status) && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteOrder(order.id); }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors flex items-center"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Detalles del Pedido
                </h2>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Pedido #{selectedOrder.id}</p>
                  {selectedOrder.restaurantName && (
                    <div className="mt-1 mb-1">
                      <span className="inline-block px-2 py-0.5 bg-orange-50 text-primary border border-orange-100 text-[10px] font-black rounded uppercase tracking-wide">
                        🏢 {selectedOrder.restaurantName}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  {groupItems(selectedOrder.items).map((group, index) => (
                    <div key={index} className="py-2 border-b">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium text-secondary-900">
                            {group.name}
                            {group.totalQty > 1 && <span className="text-sm text-gray-500 ml-1">({group.totalQty})</span>}
                          </p>
                        </div>
                        <p className="font-medium text-secondary-900">
                          ${(group.price * group.totalQty).toLocaleString('es-CL')}
                        </p>
                      </div>
                      {group.variants.length > 1 || group.variants.some(v => v.notes) ? (
                        <div className="mt-1 ml-4 space-y-0.5">
                          {group.variants.map((v, vi) => (
                            <p key={vi} className="text-sm text-gray-600">
                              {v.quantity}x {v.notes ? v.notes : 'Normal'}
                            </p>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${selectedOrder.subtotal.toLocaleString('es-CL')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="font-medium">
                      {selectedOrder.deliveryFee === 0 ? 'Gratis' : `$${selectedOrder.deliveryFee.toLocaleString('es-CL')}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-primary">
                      ${selectedOrder.total.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>

                {selectedOrder.trackingNumber && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-1">Número de seguimiento:</p>
                    <p className="font-mono font-medium">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                <Eye className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Selecciona un pedido para ver los detalles</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

