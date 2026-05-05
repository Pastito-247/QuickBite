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
  ChefHat
} from 'lucide-react';

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
      // Simulación de datos de inventario
      const mockInventory = [
        { id: 1, name: 'Pan de hamburguesa', currentStock: 45, minStock: 50, unit: 'unidades', price: 250 },
        { id: 2, name: 'Carne de res', currentStock: 12, minStock: 20, unit: 'kg', price: 8900 },
        { id: 3, name: 'Lechuga', currentStock: 8, minStock: 10, unit: 'unidades', price: 800 },
        { id: 4, name: 'Tomate', currentStock: 25, minStock: 15, unit: 'unidades', price: 600 },
        { id: 5, name: 'Queso cheddar', currentStock: 3, minStock: 10, unit: 'kg', price: 12500 }
      ];
      setInventory(mockInventory);
    } catch (error) {
      toast.error('Error al cargar inventario');
    }
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
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Panel de Administración</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pedidos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Usuarios Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Crítico</p>
              <p className="text-2xl font-bold text-gray-900">{stats.lowStockItems}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos Recientes</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">ORD-{1000 + i}</p>
                  <p className="text-sm text-gray-600">Hace {i * 15} minutos</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                  Completado
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos con Stock Bajo</h3>
          <div className="space-y-3">
            {inventory.filter(item => item.currentStock <= item.minStock).slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.currentStock} / {item.minStock} {item.unit}</p>
                </div>
                <span className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full">
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
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
              const status = getStockStatus(item.currentStock, item.minStock);
              return (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.unit}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      item.currentStock <= item.minStock ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {item.currentStock}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.minStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-${status.color}-100 text-${status.color}-800`}>
                      {status.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMenu = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Menú</h2>
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {item.available ? 'Disponible' : 'No disponible'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.category}</p>
              <p className="text-xl font-bold text-blue-600 mb-4">{formatCurrency(item.price)}</p>
              <div className="flex space-x-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    ? 'border-blue-500 text-blue-600'
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
