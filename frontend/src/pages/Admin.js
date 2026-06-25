import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  ChefHat,
  X,
  LogOut,
  Store,
  History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiURL from '../utils/api';
import NotificationBadge from '../components/NotificationBadge';
import QuickBiteLogo from '../components/QuickBiteLogo';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    lowStockItems: 0
  });
  const [inventory, setInventory] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State for Inventory
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [inventoryFormData, setInventoryFormData] = useState({
    name: '',
    description: '',
    unitCost: 0,
    unitType: 'UNITS',
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 100
  });

  // Modal State for Menu
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurantFilter, setSelectedRestaurantFilter] = useState('');
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    price: 0,
    category: 'Hamburguesas',
    available: true,
    imageUrl: '',
    restaurantId: ''
  });

  // Modal State for Menu Ingredients
  const [isIngredientsModalOpen, setIsIngredientsModalOpen] = useState(false);
  const [selectedMenuItemForIngredients, setSelectedMenuItemForIngredients] = useState(null);
  const [menuItemIngredients, setMenuItemIngredients] = useState([]);
  const [ingredientFormData, setIngredientFormData] = useState({
    ingredientId: '',
    quantity: 1,
    unit: 'UNITS',
    isOptional: false
  });

  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState({
    id: null,
    name: 'Mi Restaurante',
    address: 'Dirección no definida',
    phone: '+56900000000',
    ownerId: null,
    imageUrl: ''
  });
  const [salesHistory, setSalesHistory] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersByRestaurant, setOrdersByRestaurant] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [ordersRestaurantFilter, setOrdersRestaurantFilter] = useState('');
  
  useEffect(() => {
    loadDashboardData();
    loadInventory();
    if (activeTab === 'menu') {
      loadMenu();
      loadRestaurants();
    }
    if (activeTab === 'restaurant') {
      loadRestaurant();
      loadRestaurants();
    }
    if (activeTab === 'sales' || activeTab === 'history') {
      loadSalesHistory();
    }
    if (activeTab === 'allOrders' || activeTab === 'revenue') {
      loadAllOrders();
      loadRestaurants();
    }
  }, [activeTab, selectedRestaurantFilter]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(apiURL('/api/v1/pedidos/estadisticas'));
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({
          ...prev,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          activeUsers: data.activeUsers || 0
        }));
        if (data.recentOrders) {
          setRecentOrders(data.recentOrders);
        }
        if (data.ordersByRestaurant) {
          setOrdersByRestaurant(data.ordersByRestaurant);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch(apiURL('/api/inventory'));
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
        const lowStockCount = data.filter(item => item.currentStock <= item.minimumStock).length;
        setStats(prev => ({ ...prev, lowStockItems: lowStockCount }));
      } else {
        toast.error('Error al cargar el inventario');
      }
    } catch (error) {
      toast.error('Error al cargar el inventario');
    }
  };

  const openInventoryModal = (item = null) => {
    if (item) {
      setEditingInventoryItem(item.id);
      setInventoryFormData({
        name: item.name,
        description: item.description || '',
        unitCost: item.unitCost,
        unitType: item.unitType,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        maximumStock: item.maximumStock || 100
      });
    } else {
      setEditingInventoryItem(null);
      setInventoryFormData({
        name: '',
        description: '',
        unitCost: 0,
        unitType: 'UNITS',
        currentStock: 0,
        minimumStock: 0,
        maximumStock: 100
      });
    }
    setIsInventoryModalOpen(true);
  };

  const closeInventoryModal = () => {
    setIsInventoryModalOpen(false);
  };

  const handleInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingInventoryItem 
        ? `/api/inventory/${editingInventoryItem}`
        : '/api/inventory';
      
      const method = editingInventoryItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryFormData)
      });

      if (response.ok) {
        toast.success(`Producto ${editingInventoryItem ? 'actualizado' : 'agregado'} exitosamente`);
        closeInventoryModal();
        loadInventory();
      } else {
        const errData = await response.json().catch(() => ({}));
        toast.error('Error al guardar el producto: ' + (errData.message || ''));
      }
    } catch (error) {
      toast.error('Error de red al guardar el producto');
      console.error(error);
    }
  };

  const deleteInventoryItem = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const response = await fetch(apiURL(`/api/inventory/${id}`), {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Producto eliminado');
        loadInventory();
      } else {
        toast.error('Error al eliminar producto');
      }
    } catch (error) {
      toast.error('Error de red al eliminar producto');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const loadMenu = async () => {
    try {
      const response = await fetch(apiURL('/api/admin/menu/all'));
      if (response.ok) {
        const data = await response.json();
        if (selectedRestaurantFilter) {
          const filtered = data.filter(item => item.restaurantId === parseInt(selectedRestaurantFilter));
          setMenu(filtered);
        } else {
          setMenu(data);
        }
      } else {
        toast.error('Error al cargar menú');
      }
    } catch (error) {
      toast.error('Error al cargar menú');
    }
  };

  const loadRestaurants = async () => {
    try {
      const response = await fetch(apiURL('/api/restaurants'));
      if (response.ok) {
        const data = await response.json();
        setRestaurants(data);
      } else {
        toast.error('Error al cargar restaurantes');
      }
    } catch (error) {
      toast.error('Error al cargar restaurantes');
    }
  };

  const openMenuModal = (item = null) => {
    if (item) {
      setEditingMenuItem(item.id);
      setMenuFormData({
        name: item.name,
        price: item.price,
        category: item.category,
        available: item.available,
        imageUrl: item.imageUrl || '',
        restaurantId: item.restaurantId || ''
      });
    } else {
      setEditingMenuItem(null);
      setMenuFormData({
        name: '',
        price: 0,
        category: 'Hamburguesas',
        available: true,
        imageUrl: '',
        restaurantId: ''
      });
    }
    setIsMenuModalOpen(true);
  };

  const closeMenuModal = () => setIsMenuModalOpen(false);

  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingMenuItem
        ? `/api/admin/menu/${editingMenuItem}`
        : '/api/menu';
      const method = editingMenuItem ? 'PUT' : 'POST';
      const payload = {
        name: menuFormData.name,
        description: menuFormData.description || '',
        price: menuFormData.price,
        category: menuFormData.category,
        available: menuFormData.available,
        imageUrl: menuFormData.imageUrl || null,
        restaurantId: menuFormData.restaurantId ? parseInt(menuFormData.restaurantId) : null
      };
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      if (editingMenuItem) {
        toast.success('Platillo actualizado exitosamente');
      } else {
        toast.success('Platillo agregado exitosamente');
      }
      await loadMenu();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Error al guardar el platillo');
    }
    closeMenuModal();
  };

  const deleteMenuItem = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este platillo?')) return;
    try {
      const response = await fetch(apiURL(`/api/admin/menu/${id}`), { method: 'DELETE' });
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success('Platillo eliminado');
      await loadMenu();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Error al eliminar el platillo');
    }
  };

  // Funciones para gestionar ingredientes de menú
  const openIngredientsModal = async (menuItem) => {
    setSelectedMenuItemForIngredients(menuItem);
    await loadMenuItemIngredients(menuItem.id);
    setIsIngredientsModalOpen(true);
  };

  const closeIngredientsModal = () => {
    setIsIngredientsModalOpen(false);
    setSelectedMenuItemForIngredients(null);
    setMenuItemIngredients([]);
    setIngredientFormData({
      ingredientId: '',
      quantity: 1,
      unit: 'UNITS',
      isOptional: false
    });
  };

  const loadMenuItemIngredients = async (menuItemId) => {
    try {
      const response = await fetch(apiURL(`/api/admin/menu-ingredients/${menuItemId}`));
      if (response.ok) {
        const data = await response.json();
        setMenuItemIngredients(data);
      } else {
        toast.error('Error al cargar ingredientes del menú');
      }
    } catch (error) {
      console.error('Error loading menu item ingredients:', error);
      toast.error('Error al cargar ingredientes del menú');
    }
  };

  const addIngredientToMenuItem = async (e) => {
    e.preventDefault();
    if (!selectedMenuItemForIngredients) return;
    
    try {
      const response = await fetch(
        `/api/admin/menu-ingredients/${selectedMenuItemForIngredients.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ingredientFormData)
        }
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success('Ingrediente agregado exitosamente');
      await loadMenuItemIngredients(selectedMenuItemForIngredients.id);
      setIngredientFormData({
        ingredientId: '',
        quantity: 1,
        unit: 'UNITS',
        isOptional: false
      });
    } catch (error) {
      console.error('Error adding ingredient to menu item:', error);
      toast.error('Error al agregar ingrediente');
    }
  };

  const removeIngredientFromMenuItem = async (ingredientId) => {
    if (!selectedMenuItemForIngredients) return;
    if (!window.confirm('¿Estás seguro de eliminar este ingrediente del menú?')) return;

    try {
      const response = await fetch(
        `/api/admin/menu-ingredients/${selectedMenuItemForIngredients.id}/${ingredientId}`,
        { method: 'DELETE' }
      );
      if (!response.ok) throw new Error(`Error ${response.status}`);
      toast.success('Ingrediente eliminado exitosamente');
      await loadMenuItemIngredients(selectedMenuItemForIngredients.id);
    } catch (error) {
      console.error('Error removing ingredient from menu item:', error);
      toast.error('Error al eliminar ingrediente');
    }
  };

  // Funciones para gestionar restaurantes
  const loadRestaurant = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('No hay usuario logueado');
        return;
      }
      const response = await fetch(apiURL(`/api/restaurants/owner/${userId}`));
      if (response.ok) {
        const data = await response.json();
        setRestaurant({
          id: data.id,
          name: data.name,
          address: data.address,
          phone: data.phone,
          ownerId: data.ownerId
        });
      } else if (response.status === 404) {
        // No tiene restaurante, mantener valores por defecto
        setRestaurant(prev => ({ ...prev, ownerId: parseInt(userId) }));
      } else {
        toast.error('Error al cargar restaurante');
      }
    } catch (error) {
      console.error('Error loading restaurant:', error);
      toast.error('Error al cargar restaurante');
    }
  };

  const saveRestaurant = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      const payload = {
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        ownerId: restaurant.ownerId || parseInt(userId),
        active: true,
        imageUrl: restaurant.imageUrl || null
      };

      let response;
      if (restaurant.id) {
        // Update existing restaurant
        response = await fetch(apiURL(`/api/restaurants/${restaurant.id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new restaurant
        response = await fetch(apiURL('/api/restaurants'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) throw new Error(`Error ${response.status}`);

      const data = await response.json();
      setRestaurant({
        id: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        ownerId: data.ownerId
      });
      toast.success('Restaurante guardado exitosamente');
      loadRestaurants();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error('Error al guardar restaurante');
    }
  };

  const deleteRestaurant = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este restaurante?')) {
      return;
    }
    try {
      const response = await fetch(apiURL(`/api/restaurants/${id}`), {
        method: 'DELETE'
      });
      if (response.ok) {
        toast.success('Restaurante eliminado exitosamente');
        loadRestaurants();
        if (restaurant.id === id) {
          setRestaurant({
            id: null,
            name: '',
            address: '',
            phone: '',
            ownerId: null,
            imageUrl: ''
          });
        }
      } else {
        toast.error('Error al eliminar restaurante');
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Error al eliminar restaurante');
    }
  };

  // Funciones para gestionar historial de ventas
  const loadAllOrders = async () => {
    try {
      const response = await fetch(apiURL('/api/orders?page=0&size=200'));
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        setAllOrders(list);
      }
    } catch (error) {
      console.error('Error loading all orders:', error);
    }
  };

  const loadSalesHistory = async () => {
    try {
      // Si hay restaurante, buscar por restaurante; si no, buscar todos
      const url = restaurant.id
        ? `/api/v1/pedidos/restaurante/${restaurant.id}`
        : '/api/orders?page=0&size=50';
      const response = await fetch(apiURL(url.startsWith('/') ? url : '/' + url));
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.content || []);
        setSalesHistory(list);
      }
    } catch (error) {
      console.error('Error loading sales history:', error);
    }
  };

  const getStockStatus = (current, min) => {
    if (current <= min * 0.5) return { color: 'red', text: 'Crítico' };
    if (current <= min) return { color: 'yellow', text: 'Bajo' };
    return { color: 'green', text: 'Normal' };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const renderDashboard = () => (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-6">Panel de Administración</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div onClick={() => setActiveTab('allOrders')} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Pedidos Totales</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalOrders}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
          {ordersByRestaurant.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              {ordersByRestaurant.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{r.restaurantName}</span>
                  <span className="font-medium text-gray-700">{r.orders}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-primary mt-2 group-hover:underline">Ver detalle →</p>
        </div>

        <div onClick={() => setActiveTab('revenue')} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Ingresos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          {ordersByRestaurant.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
              {ordersByRestaurant.map((r, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500 truncate mr-2">{r.restaurantName}</span>
                  <span className="font-medium text-green-700">{formatCurrency(r.revenue)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-green-600 mt-2 group-hover:underline">Ver detalle →</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Usuarios Activos</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Stock Crítico</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{stats.lowStockItems}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{order.numeroPedido}</p>
                    <p className="text-sm text-gray-600">{order.nombreCliente}</p>
                    <p className="text-xs text-gray-400">{new Date(order.fechaCreacion).toLocaleString('es-CL')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.estado === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                      order.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      order.estado === 'EN_PREPARACION' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.estado}
                    </span>
                    <p className="text-sm font-medium text-primary mt-1">{formatCurrency(order.total)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2">No hay pedidos registrados.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {inventory.length > 0 ? (
              inventory.filter(item => item.currentStock <= item.minimumStock).slice(0, 4).map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.currentStock} / {item.minimumStock} {item.unitType}</p>
                  </div>
                  <span className="px-2 py-1 bg-alert-100 text-alert-800 text-sm rounded-full">
                    Crítico
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 py-2">Cargando inventario...</p>
            )}
            {inventory.length > 0 && inventory.filter(item => item.currentStock <= item.minimumStock).length === 0 && (
              <p className="text-sm text-gray-500 py-2">No hay productos con stock crítico.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Gestión de Inventario</h2>
        <button onClick={() => openInventoryModal()} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Producto
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Mínimo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {inventory.map(item => {
              const status = getStockStatus(item.currentStock, item.minimumStock);
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-secondary-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.unitType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      item.currentStock <= item.minimumStock ? 'text-alert' : 'text-secondary-900'
                    }`}>
                      {item.currentStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {item.minimumStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                    {formatCurrency(item.unitCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => openInventoryModal(item)} className="text-primary hover:text-blue-900 mr-3">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => deleteInventoryItem(item.id)} className="text-alert hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Inventario */}
      {isInventoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                {editingInventoryItem ? 'Modificar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button onClick={closeInventoryModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  value={inventoryFormData.name}
                  onChange={(e) => setInventoryFormData({...inventoryFormData, name: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                  <input 
                    type="number" 
                    required min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={inventoryFormData.currentStock}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, currentStock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input 
                    type="number" 
                    required min="0"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={inventoryFormData.minimumStock}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, minimumStock: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                  <select 
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={inventoryFormData.unitType}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, unitType: e.target.value})}
                  >
                    <option value="UNITS">Unidades</option>
                    <option value="KILOGRAMS">Kilogramos</option>
                    <option value="GRAMS">Gramos</option>
                    <option value="LITERS">Litros</option>
                    <option value="MILLILITERS">Mililitros</option>
                    <option value="DOZENS">Docenas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Costo</label>
                  <input 
                    type="number" 
                    required min="0" step="0.01"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={inventoryFormData.unitCost}
                    onChange={(e) => setInventoryFormData({...inventoryFormData, unitCost: parseFloat(e.target.value)})}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button 
                  type="button" 
                  onClick={closeInventoryModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderMenu = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Gestión de Menú</h2>
        <div className="flex space-x-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={selectedRestaurantFilter}
            onChange={(e) => setSelectedRestaurantFilter(e.target.value)}
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.name}
              </option>
            ))}
          </select>
          <button onClick={() => openMenuModal()} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            Agregar nuevo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: item.imageUrl ? 'none' : 'flex' }}>
                <ChefHat className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-secondary-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.available 
                    ? 'bg-accent-100 text-accent-800' 
                    : 'bg-alert-100 text-alert-800'
                }`}>
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              <p className="text-xl font-bold text-primary mb-4">{formatCurrency(item.price)}</p>
              <div className="flex space-x-2">
                <button onClick={() => openMenuModal(item)} className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button onClick={() => openIngredientsModal(item)} className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                  <Package className="h-4 w-4 mr-1" />
                  Ingredientes
                </button>
                <button onClick={() => deleteMenuItem(item.id)} className="flex-1 flex items-center justify-center px-3 py-2 bg-alert text-white rounded-md hover:bg-alert-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Menú */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                {editingMenuItem ? 'Modificar Platillo' : 'Agregar Nuevo Platillo'}
              </h3>
              <button onClick={closeMenuModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleMenuSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Platillo</label>
                <input
                  type="text"
                  required
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({...menuFormData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({...menuFormData, category: e.target.value})}
                  >
                    <option value="Hamburguesas">Hamburguesas</option>
                    <option value="Pizzas">Pizzas</option>
                    <option value="Mexicana">Mexicana</option>
                    <option value="Sushi">Sushi</option>
                    <option value="Combos">Combos</option>
                    <option value="Ensaladas">Ensaladas</option>
                    <option value="Acompañamientos">Acompañamientos</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Postres">Postres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                  <input
                    type="number"
                    required min="0" step="1"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({...menuFormData, price: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Restaurante</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  value={menuFormData.restaurantId}
                  onChange={(e) => setMenuFormData({...menuFormData, restaurantId: e.target.value})}
                >
                  <option value="">Seleccionar restaurante...</option>
                  {restaurants.map(restaurant => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (opcional)</label>
                <input
                  type="url"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                  value={menuFormData.imageUrl}
                  onChange={(e) => setMenuFormData({...menuFormData, imageUrl: e.target.value})}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="available"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  checked={menuFormData.available}
                  onChange={(e) => setMenuFormData({...menuFormData, available: e.target.checked})}
                />
                <label htmlFor="available" className="ml-2 block text-sm text-gray-900">
                  Disponible para la venta
                </label>
              </div>

              <div className="flex justify-end pt-4 space-x-3">
                <button
                  type="button"
                  onClick={closeMenuModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Ingredientes de Menú */}
      {isIngredientsModalOpen && selectedMenuItemForIngredients && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-secondary-900">
                Ingredientes: {selectedMenuItemForIngredients.name}
              </h3>
              <button onClick={closeIngredientsModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Lista de ingredientes actuales */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Ingredientes actuales</h4>
              {menuItemIngredients.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay ingredientes asignados</p>
              ) : (
                <div className="space-y-2">
                  {menuItemIngredients.map((mi) => {
                    const ingredient = inventory.find(inv => inv.id === mi.ingredientId);
                    return (
                      <div key={mi.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {ingredient ? ingredient.name : `Ingrediente #${mi.ingredientId}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cantidad: {mi.quantity} {mi.unit}
                            {mi.isOptional && <span className="ml-2 text-blue-600">(Opcional)</span>}
                          </p>
                        </div>
                        <button
                          onClick={() => removeIngredientFromMenuItem(mi.ingredientId)}
                          className="text-alert hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Formulario para agregar ingrediente */}
            <div className="border-t pt-4">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Agregar ingrediente</h4>
              <form onSubmit={addIngredientToMenuItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ingrediente</label>
                  <select
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                    value={ingredientFormData.ingredientId}
                    onChange={(e) => setIngredientFormData({...ingredientFormData, ingredientId: e.target.value})}
                  >
                    <option value="">Seleccionar ingrediente...</option>
                    {inventory.map(inv => (
                      <option key={inv.id} value={inv.id}>
                        {inv.name} (Stock: {inv.currentStock} {inv.unitType})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                    <input
                      type="number"
                      required min="1"
                      className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                      value={ingredientFormData.quantity}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                      value={ingredientFormData.unit}
                      onChange={(e) => setIngredientFormData({...ingredientFormData, unit: e.target.value})}
                    >
                      <option value="UNITS">Unidades</option>
                      <option value="KILOGRAMS">Kilogramos</option>
                      <option value="GRAMS">Gramos</option>
                      <option value="LITERS">Litros</option>
                      <option value="MILLILITERS">Mililitros</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        checked={ingredientFormData.isOptional}
                        onChange={(e) => setIngredientFormData({...ingredientFormData, isOptional: e.target.checked})}
                      />
                      <span className="ml-2 text-sm text-gray-900">Opcional</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 space-x-3">
                  <button
                    type="button"
                    onClick={closeIngredientsModal}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
                  >
                    Agregar Ingrediente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderRestaurant = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Gestión de Restaurantes</h2>
        <button onClick={() => {
          setRestaurant({
            id: null,
            name: '',
            address: '',
            phone: '',
            ownerId: null,
            imageUrl: ''
          });
        }} className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar nuevo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {restaurants.map(restaurantItem => (
          <div key={restaurantItem.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
              {restaurantItem.imageUrl ? (
                <img
                  src={restaurantItem.imageUrl}
                  alt={restaurantItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center" style={{ display: restaurantItem.imageUrl ? 'none' : 'flex' }}>
                <Store className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-secondary-900">{restaurantItem.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  restaurantItem.active
                    ? 'bg-accent-100 text-accent-800'
                    : 'bg-alert-100 text-alert-800'
                }`}>
                  {restaurantItem.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{restaurantItem.address}</p>
              <p className="text-sm text-gray-600 mb-4">{restaurantItem.phone}</p>
              <div className="flex space-x-2">
                <button onClick={() => {
                  setRestaurant({
                    id: restaurantItem.id,
                    name: restaurantItem.name,
                    address: restaurantItem.address,
                    phone: restaurantItem.phone,
                    ownerId: restaurantItem.ownerId,
                    imageUrl: restaurantItem.imageUrl || ''
                  });
                }} className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button onClick={() => deleteRestaurant(restaurantItem.id)} className="flex-1 flex items-center justify-center px-3 py-2 bg-alert text-white rounded-md hover:bg-alert-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {restaurant.id ? 'Editar Restaurante' : 'Crear Nuevo Restaurante'}
        </h3>
        <form onSubmit={saveRestaurant}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Restaurante</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                value={restaurant.name}
                onChange={(e) => setRestaurant({...restaurant, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                value={restaurant.address}
                onChange={(e) => setRestaurant({...restaurant, address: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="text"
                required
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                value={restaurant.phone}
                onChange={(e) => setRestaurant({...restaurant, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (Logo) - Opcional</label>
              <input
                type="url"
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
                value={restaurant.imageUrl || ''}
                onChange={(e) => setRestaurant({...restaurant, imageUrl: e.target.value})}
                placeholder="https://ejemplo.com/logo.jpg"
              />
            </div>
            <div className="pt-4 flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
              >
                {restaurant.id ? 'Actualizar Restaurante' : 'Crear Restaurante'}
              </button>
              {restaurant.id && (
                <button
                  type="button"
                  onClick={() => {
                    setRestaurant({
                      id: null,
                      name: '',
                      address: '',
                      phone: '',
                      ownerId: null,
                      imageUrl: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSalesHistory = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Historial de Ventas</h2>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
          <TrendingUp className="h-4 w-4 mr-2" />
          Exportar Reporte
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-700">Últimos Pedidos</h3>
          <span className="text-sm text-gray-500">
            {restaurant.name ? `Restaurante: ${restaurant.name}` : 'No hay restaurante seleccionado'}
          </span>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salesHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No hay pedidos registrados
                </td>
              </tr>
            ) : (
              salesHistory.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-secondary-900">
                    {order.numeroPedido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.nombreCliente}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.fechaCreacion).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.estado === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                      order.estado === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                      order.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const getRestaurantName = (restaurantId) => {
    if (restaurantId === null || restaurantId === undefined || restaurantId === '') return 'Sin restaurante';
    const idString = String(restaurantId);
    const r = restaurants.find(rest => String(rest.id) === idString);
    return r ? r.name : `Restaurante desconocido (#${idString})`;
  };

  const filteredOrders = ordersRestaurantFilter
    ? allOrders.filter(o => String(o.restaurantId) === ordersRestaurantFilter)
    : allOrders;

  const renderAllOrders = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button onClick={() => setActiveTab('dashboard')} className="text-gray-500 hover:text-gray-700">← Volver</button>
          <h2 className="text-2xl font-bold text-secondary-900">Todos los Pedidos</h2>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">{filteredOrders.length} pedidos</span>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          value={ordersRestaurantFilter}
          onChange={(e) => setOrdersRestaurantFilter(e.target.value)}
        >
          <option value="">Todos los restaurantes</option>
          {restaurants.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {/* Summary cards per restaurant */}
      {ordersByRestaurant.length > 0 && !ordersRestaurantFilter && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {ordersByRestaurant.map((r, i) => (
            <div key={i} onClick={() => setOrdersRestaurantFilter(String(r.restaurantId || ''))}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all">
              <p className="font-semibold text-gray-800">{r.restaurantName}</p>
              <div className="flex justify-between mt-2">
                <span className="text-sm text-gray-500">{r.orders} pedidos</span>
                <span className="text-sm font-medium text-primary">{formatCurrency(r.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurante</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No hay pedidos</td></tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-secondary-900">{order.numeroPedido}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.nombreCliente}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{getRestaurantName(order.restaurantId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.fechaCreacion).toLocaleString('es-CL')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.estado === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                      order.estado === 'CANCELADO' ? 'bg-red-100 text-red-800' :
                      order.estado === 'EN_PREPARACION' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>{order.estado}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-primary">{formatCurrency(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRevenue = () => {
    const nonCancelled = ordersRestaurantFilter
      ? allOrders.filter(o => String(o.restaurantId) === ordersRestaurantFilter && o.estado !== 'CANCELADO')
      : allOrders.filter(o => o.estado !== 'CANCELADO');
    const totalFiltered = nonCancelled.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTab('dashboard')} className="text-gray-500 hover:text-gray-700">← Volver</button>
            <h2 className="text-2xl font-bold text-secondary-900">Detalle de Ingresos</h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">{formatCurrency(totalFiltered)}</span>
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={ordersRestaurantFilter}
            onChange={(e) => setOrdersRestaurantFilter(e.target.value)}
          >
            <option value="">Todos los restaurantes</option>
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Revenue cards per restaurant */}
        {ordersByRestaurant.length > 0 && !ordersRestaurantFilter && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {ordersByRestaurant.map((r, i) => (
              <div key={i} onClick={() => setOrdersRestaurantFilter(String(r.restaurantId || ''))}
                className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all">
                <p className="font-semibold text-gray-800">{r.restaurantName}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(r.revenue)}</p>
                <p className="text-sm text-gray-500 mt-1">{r.orders} pedidos</p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impuesto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {nonCancelled.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">No hay ingresos registrados</td></tr>
              ) : (
                nonCancelled.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-secondary-900">{order.numeroPedido}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.nombreCliente}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{getRestaurantName(order.restaurantId)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.fechaCreacion).toLocaleString('es-CL')}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.estado === 'ENTREGADO' ? 'bg-green-100 text-green-800' :
                        order.estado === 'EN_PREPARACION' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{order.estado}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(order.subtotal)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(order.impuesto)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-700">{formatCurrency(order.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {nonCancelled.length > 0 && (
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="5" className="px-6 py-3 text-sm font-bold text-gray-700 text-right">Totales:</td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-700">
                    {formatCurrency(nonCancelled.reduce((s, o) => s + (Number(o.subtotal) || 0), 0))}
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-700">
                    {formatCurrency(nonCancelled.reduce((s, o) => s + (Number(o.impuesto) || 0), 0))}
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-green-700">
                    {formatCurrency(totalFiltered)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'allOrders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'revenue', label: 'Ingresos', icon: DollarSign },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'menu', label: 'Menú', icon: ChefHat },
    { id: 'restaurant', label: 'Mi Restaurante', icon: Store }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con Título y Notificaciones */}
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3">
          <QuickBiteLogo iconSize="h-10 w-10" speedLineSize="h-8 w-8" color="text-gray-800" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">
              QuickBite <span className="text-gray-500 font-medium">| Portal de Administración</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <NotificationBadge />
          <button 
            onClick={handleLogout}
            className="flex items-center text-gray-500 hover:text-alert-600 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="h-5 w-5 mr-1" />
            <span className="text-sm font-medium">Salir</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-800 text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && renderDashboard()}
      {activeTab === 'inventory' && renderInventory()}
      {activeTab === 'menu' && renderMenu()}
      {activeTab === 'restaurant' && renderRestaurant()}
      {activeTab === 'allOrders' && renderAllOrders()}
      {activeTab === 'revenue' && renderRevenue()}
    </div>
  );
};

export default Admin;

