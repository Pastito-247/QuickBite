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
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationBadge from '../components/NotificationBadge';

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

  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    if (activeTab === 'inventory') {
      loadInventory();
    }
    if (activeTab === 'menu') {
      loadMenu();
    }
  }, [activeTab]);

  const loadDashboardData = async () => {
    try {
      // Simulación de datos
      setStats({
        totalOrders: 156,
        totalRevenue: 2456780,
        activeUsers: 89,
        lowStockItems: 5
      });
      setLoading(false);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/inventory/inventory');
      if (response.ok) {
        const data = await response.json();
        setInventory(data);
      } else {
        toast.error('Error al cargar inventario del servidor');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor de inventario');
      console.error(error);
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
        ? `http://localhost:8082/api/inventory/inventory/${editingInventoryItem}`
        : 'http://localhost:8082/api/inventory/inventory';
      
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
      const response = await fetch(`http://localhost:8082/api/inventory/inventory/${id}`, {
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
      // Simulación de datos del menú
      const mockMenu = [
        { id: 1, name: 'Hamburguesa Clásica', price: 8990, category: 'Hamburguesas', available: true },
        { id: 2, name: 'Combo Big Bite', price: 12990, category: 'Combos', available: true },
        { id: 3, name: 'Ensalada César', price: 6990, category: 'Ensaladas', available: false },
        { id: 4, name: 'Papas Fritas', price: 3990, category: 'Acompañamientos', available: true }
      ];
      setMenu(mockMenu);
    } catch (error) {
      toast.error('Error al cargar menú');
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Totales</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-primary-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Crítico</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-alert-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">ORD-{1000 + i}</p>
                  <p className="text-sm text-gray-600">Hace {i * 15} minutos</p>
                </div>
                <span className="px-2 py-1 bg-accent-100 text-accent-800 text-sm rounded-full">
                  Completado
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {inventory.filter(item => item.currentStock <= item.minStock).slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.currentStock} / {item.minStock} {item.unit}</p>
                </div>
                <span className="px-2 py-1 bg-alert-100 text-alert-800 text-sm rounded-full">
                  Crítico
                </span>
              </div>
            ))}
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
        <button className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Platillo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menu.map(item => (
          <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <ChefHat className="h-12 w-12 text-gray-400" />
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
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-alert text-white rounded-md hover:bg-alert-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'menu', label: 'Menú', icon: ChefHat }
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
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-extrabold text-secondary-900">
          QuickBite <span className="text-primary">Admin</span>
        </h1>
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
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
    </div>
  );
};

export default Admin;
